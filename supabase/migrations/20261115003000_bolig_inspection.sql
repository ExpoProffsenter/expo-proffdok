create table bolig_private.unit_inspections (
  unit_id uuid primary key references bolig_private.units(id),
  revision bigint not null,
  note jsonb not null,
  photos text[] not null,
  updated_at timestamptz not null default now(),
  updated_by uuid not null references auth.users(id)
);
alter table bolig_private.unit_inspections enable row level security;
revoke all on bolig_private.unit_inspections from public, anon, authenticated, service_role;

create function bolig_private.inspection_access(p_root uuid, p_unit uuid, p_write boolean)
returns boolean language plpgsql stable security definer set search_path='' as $$
declare
  company uuid;
  ctx jsonb;
begin
  if auth.uid() is null then return false; end if;
  select r.company_id into company
  from bolig_private.roots r
  join bolig_private.units u on u.root_id=r.id
  join bolig_private.entrances e on e.id=u.entrance_id and e.root_id=r.id
  join bolig_private.blocks b on b.id=e.block_id and b.root_id=r.id
  where r.id=p_root and u.id=p_unit and not (r.archived or u.archived or e.archived or b.archived);
  if company is null then return false; end if;

  if not p_write and bolig_private.shop_staff_eligible(auth.uid())
     and exists (select 1 from bolig_private.shop_staff_access g
                 where g.root_id=p_root and g.user_id=auth.uid()
                   and g.enabled and g.expires_at>clock_timestamp())
     and bolig_private.commerce_collaborator(company,p_root,'read')
  then return true; end if;

  if company is distinct from public.current_active_company_scope_id() then return false; end if;
  ctx := bolig_private.context(company);
  return coalesce((ctx->>'enabled')::boolean and (not p_write or ctx->>'role'='manager'),false);
exception when insufficient_privilege then return false;
end;
$$;
revoke all on function bolig_private.inspection_access(uuid,uuid,boolean) from public, anon, authenticated, service_role;

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('bolig-inspection-photos','bolig-inspection-photos',false,10485760,
        array['image/jpeg','image/png','image/webp']);

create function public.bolig_inspection_file_access(p_path text,p_write boolean)
returns boolean language plpgsql stable security definer set search_path='' as $$
declare
  parts text[];
begin
  parts := string_to_array(p_path,'/');
  if p_path is null or cardinality(parts)<>3 or p_path !~ '^([0-9a-f-]{36}/){2}[0-9a-f-]{36}$' then return false; end if;
  if not coalesce(bolig_private.inspection_access(parts[1]::uuid,parts[2]::uuid,p_write),false)
  then return false; end if;
  return p_write or exists (select 1 from bolig_private.unit_inspections i
                            where i.unit_id=parts[2]::uuid and p_path=any(i.photos));
exception when invalid_text_representation then return false;
end;
$$;
revoke all on function public.bolig_inspection_file_access(text,boolean) from public, anon, service_role;
grant execute on function public.bolig_inspection_file_access(text,boolean) to authenticated;
create policy bolig_inspection_photo_read_fence on storage.objects as restrictive for select to authenticated
using (bucket_id<>'bolig-inspection-photos' or public.bolig_inspection_file_access(name,false));
create policy bolig_inspection_photo_insert_fence on storage.objects as restrictive for insert to authenticated
with check (bucket_id<>'bolig-inspection-photos' or public.bolig_inspection_file_access(name,true));
create policy bolig_inspection_photo_update_fence on storage.objects as restrictive for update to anon, authenticated
using (bucket_id<>'bolig-inspection-photos') with check (bucket_id<>'bolig-inspection-photos');
create policy bolig_inspection_photo_delete_fence on storage.objects as restrictive for delete to anon, authenticated
using (bucket_id<>'bolig-inspection-photos');
create policy bolig_inspection_photo_anon_read_fence on storage.objects as restrictive for select to anon
using (bucket_id<>'bolig-inspection-photos');
create policy bolig_inspection_photo_anon_insert_fence on storage.objects as restrictive for insert to anon
with check (bucket_id<>'bolig-inspection-photos');
create policy bolig_inspection_photo_read on storage.objects for select to authenticated
using (bucket_id='bolig-inspection-photos' and public.bolig_inspection_file_access(name,false));
create policy bolig_inspection_photo_insert on storage.objects for insert to authenticated
with check (bucket_id='bolig-inspection-photos' and public.bolig_inspection_file_access(name,true));

create function public.bolig_unit_inspection(
  p_root uuid, p_unit uuid, p_revision bigint default null,
  p_note jsonb default null, p_photos text[] default null
) returns jsonb language plpgsql security definer set search_path='' as $$
declare
  v_write boolean := p_note is not null;
  v_item bolig_private.unit_inspections%rowtype;
begin
  if not bolig_private.inspection_access(p_root,p_unit,v_write) then
    raise exception 'Du har ikke tilgang til befaringen for denne boligen.' using errcode='42501';
  end if;
  if v_write then
    if jsonb_typeof(p_note)<>'object' or octet_length(p_note::text)>250000
       or (p_note - array['date','time','responsible','customerWishes','existingConditions','measurements','observations','sketch'])<>'{}'::jsonb
       or exists (select 1 from jsonb_each(p_note) n
                 where n.key<>'sketch' and (jsonb_typeof(n.value)<>'string' or length(n.value #>> '{}')>12000))
       or coalesce(jsonb_typeof(p_note->'sketch'),'null') not in ('object','null')
       or p_photos is null or cardinality(p_photos)>24 or array_position(p_photos,null) is not null
       or exists (select 1 from unnest(p_photos) path
                 where not public.bolig_inspection_file_access(path,true)
                    or split_part(path,'/',1)<>p_root::text or split_part(path,'/',2)<>p_unit::text
                    or not exists (select 1 from storage.objects o where o.bucket_id='bolig-inspection-photos' and o.name=path))
    then raise exception 'Kontroller notatet, skissen og bildene.' using errcode='22023'; end if;

    perform pg_advisory_xact_lock(hashtextextended('bolig-inspection:' || p_unit::text,0));
    select * into v_item from bolig_private.unit_inspections i where i.unit_id=p_unit;
    if p_revision is distinct from coalesce(v_item.revision,0) then
      raise exception 'Befaringen er endret. Kladden er beholdt.' using errcode='PT409';
    end if;
    insert into bolig_private.unit_inspections (unit_id,revision,note,photos,updated_by)
    values (p_unit,coalesce(v_item.revision,0)+1,p_note,p_photos,auth.uid())
    on conflict (unit_id) do update set revision=excluded.revision,note=excluded.note,
      photos=excluded.photos,updated_at=now(),updated_by=excluded.updated_by;
  end if;
  select * into v_item from bolig_private.unit_inspections i where i.unit_id=p_unit;
  return jsonb_build_object('user_id',auth.uid(),'revision',coalesce(v_item.revision,0),
                            'note',v_item.note,'photos',coalesce(v_item.photos,array[]::text[]));
end;
$$;
revoke all on function public.bolig_unit_inspection(uuid,uuid,bigint,jsonb,text[]) from public, anon, service_role;
grant execute on function public.bolig_unit_inspection(uuid,uuid,bigint,jsonb,text[]) to authenticated;
