-- Independent visual documents. No existing choice, order, room, structure,
-- completion or external-access function is replaced by this migration.
create table bolig_private.visual_sheets (
 id uuid primary key, root_id uuid not null references bolig_private.roots(id),
 scope_id uuid not null, kind text not null check(kind in ('facade','plan')),
 title text not null, revision bigint not null default 0, archived boolean not null default false,
 unique(id,root_id), unique(root_id,scope_id,kind,id)
);
create index bolig_visual_scope on bolig_private.visual_sheets(root_id,scope_id,kind);
create unique index bolig_visual_one_facade on bolig_private.visual_sheets(root_id,scope_id) where kind='facade';
create table bolig_private.visual_versions (
 id uuid primary key, sheet_id uuid not null, root_id uuid not null,
 revision bigint not null, expected_revision bigint not null, request jsonb not null,
 snapshot jsonb not null, created_by uuid not null references auth.users(id),
 created_at timestamptz not null default now(), unique(sheet_id,revision),
 foreign key(sheet_id,root_id) references bolig_private.visual_sheets(id,root_id)
);
create index bolig_visual_versions_root on bolig_private.visual_versions(root_id,sheet_id,revision desc);
create index bolig_visual_versions_actor on bolig_private.visual_versions(created_by);
alter table bolig_private.visual_sheets enable row level security;
alter table bolig_private.visual_versions enable row level security;
revoke all on bolig_private.visual_sheets,bolig_private.visual_versions from public,anon,authenticated,service_role;

create function bolig_private.visual_workspace(c uuid,root uuid,scope uuid,action text,expected bigint,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare ctx jsonb; r bolig_private.roots%rowtype; kind text; unavailable boolean;
 targets jsonb; basis text; sheet bolig_private.visual_sheets%rowtype;
 receipt bolig_private.visual_versions%rowtype; sid uuid; rid uuid; marker jsonb;
 snap jsonb; image_path text; rev bigint; result jsonb;
begin
 ctx:=bolig_private.context(c);
 if auth.uid() is null or not coalesce((ctx->>'enabled')::boolean,false) then raise exception 'Boligprosjekter er ikke tilgjengelig.' using errcode='42501';end if;
 if action is null or action not in ('list','history','publish') or jsonb_typeof(payload) is distinct from 'object' or octet_length(payload::text)>200000 then raise exception 'Ugyldig bildehandling.' using errcode='22023';end if;
 select * into r from bolig_private.roots where id=root and company_id=c for share;
 if not found then raise exception 'Boligprosjektet er ikke tilgjengelig i aktivt firma.' using errcode='42501';end if;
 select b.archived into unavailable from bolig_private.blocks b where b.id=scope and b.root_id=root;
 if found then
  kind:='facade';
 else
  select u.archived or e.archived or b.archived into unavailable from bolig_private.units u
   join bolig_private.entrances e on e.id=u.entrance_id and e.root_id=root
   join bolig_private.blocks b on b.id=e.block_id and b.root_id=root where u.id=scope and u.root_id=root;
  if not found then raise exception 'Bygget eller boligen er ikke tilgjengelig.' using errcode='42501';end if;
  kind:='plan';
 end if;
 if action='publish' then
  if ctx->>'role'<>'manager' or r.archived or unavailable then raise exception 'Prosjektleder og aktivt bygg eller bolig kreves.' using errcode='42501';end if;
  -- Same order as room writes: root first, then the unit room lock. Image writes
  -- cannot race an archive/rename of a room while validating its stable ID.
  if kind='plan' then perform pg_advisory_xact_lock(hashtextextended('bolig-rooms:'||scope::text,0));end if;
  perform pg_advisory_xact_lock(hashtextextended('bolig-visual:'||scope::text,0));
 end if;
 if kind='facade' then
  select coalesce(jsonb_agg(jsonb_build_object('id',u.id,'label',u.number,'floor',u.floor,'position',u.position,'entrance_id',e.id,'entrance',e.address) order by e.id,u.floor desc,u.position,u.id),'[]') into targets
   from bolig_private.units u join bolig_private.entrances e on e.id=u.entrance_id and e.root_id=root
   where e.block_id=scope and not e.archived and not u.archived;
 else
  select coalesce(jsonb_agg(jsonb_build_object('id',x.id,'label',x.name,'floor',x.floor,'revision',x.revision) order by x.floor,x.name,x.id),'[]') into targets
   from bolig_private.rooms x where x.unit_id=scope and x.root_id=root and not x.archived;
 end if;
 basis:=md5(targets::text);
 if action='publish' then
  if jsonb_typeof(payload->'sheet_id') is distinct from 'string' or jsonb_typeof(payload->'request_id') is distinct from 'string' then raise exception 'Bilde-ID mangler.' using errcode='22023';end if;
  sid:=(payload->>'sheet_id')::uuid;rid:=(payload->>'request_id')::uuid;
  select * into receipt from bolig_private.visual_versions where id=rid;
  if found then
   if receipt.root_id<>root or receipt.sheet_id<>sid or receipt.created_by<>auth.uid() or receipt.expected_revision is distinct from expected or receipt.request is distinct from payload
    or not exists(select 1 from bolig_private.visual_sheets s where s.id=sid and s.scope_id=scope and s.root_id=root)
    then raise exception 'Lagringsforsøket tilhører et annet grunnlag.' using errcode='PT409';end if;
   -- Exact replay is permitted after a later version, but never rolls it back.
  else
   select * into sheet from bolig_private.visual_sheets where id=sid;
   if found and (sheet.root_id<>root or sheet.scope_id<>scope or sheet.kind<>kind) then raise exception 'Bildet tilhører et annet bygg eller bolig.' using errcode='42501';end if;
   rev:=coalesce(sheet.revision,0);
   if expected is distinct from rev or payload->>'basis' is distinct from basis then raise exception 'Bildet eller rom-/boligoppsettet er endret. Kladden er beholdt. Hent siste grunnlag.' using errcode='PT409';end if;
   if jsonb_typeof(payload->'title') is distinct from 'string' or length(trim(payload->>'title')) not between 1 and 100
    or jsonb_typeof(payload->'archived') is distinct from 'boolean'
    or jsonb_typeof(payload->'width') is distinct from 'number' or jsonb_typeof(payload->'height') is distinct from 'number'
    or (payload->>'width')::numeric not between 1 and 12000 or (payload->>'height')::numeric not between 1 and 12000
    or trunc((payload->>'width')::numeric)<>(payload->>'width')::numeric or trunc((payload->>'height')::numeric)<>(payload->>'height')::numeric
    or jsonb_typeof(payload->'markers') is distinct from 'array' then raise exception 'Velg et navn, et gyldig bilde og bolig-/romfelt.' using errcode='22023';end if;
   image_path:=payload->>'path';
   if image_path is null or image_path !~ '^[a-f0-9-]{36}/[a-f0-9-]{36}/[a-f0-9-]{36}/[a-f0-9-]{36}[.](jpg|png|webp)$'
    or split_part(image_path,'/',1)<>c::text or split_part(image_path,'/',2)<>root::text or split_part(image_path,'/',3)<>scope::text
    or not exists(select 1 from storage.objects o where o.bucket_id='bolig-project-visuals' and o.name=image_path)
    then raise exception 'Last opp bildet i dette bygget eller denne boligen først.' using errcode='42501';end if;
   if jsonb_array_length(payload->'markers')>500 or
    (select count(*)<>count(distinct x->>'id') from jsonb_array_elements(payload->'markers') x)
    then raise exception 'Hvert bolig-/romfelt kan bare plasseres én gang per bilde.' using errcode='22023';end if;
   for marker in select value from jsonb_array_elements(payload->'markers') loop
    if jsonb_typeof(marker) is distinct from 'object' or not exists(select 1 from jsonb_array_elements(targets) x where x->>'id'=marker->>'id')
     then raise exception 'Et bolig-/romfelt er ikke lenger tilgjengelig her. Hent siste grunnlag.' using errcode='PT409';end if;
    if jsonb_typeof(marker->'x') is distinct from 'number' or jsonb_typeof(marker->'y') is distinct from 'number' or jsonb_typeof(marker->'w') is distinct from 'number' or jsonb_typeof(marker->'h') is distinct from 'number'
     then raise exception 'Ugyldig plassering.' using errcode='22023';end if;
    if (marker->>'x')::numeric<0 or (marker->>'y')::numeric<0 or (marker->>'w')::numeric<=0 or (marker->>'h')::numeric<=0
     or (marker->>'x')::numeric+(marker->>'w')::numeric>1.000001 or (marker->>'y')::numeric+(marker->>'h')::numeric>1.000001
     then raise exception 'Feltene må ligge innenfor bildet.' using errcode='22023';end if;
   end loop;
   if sheet.id is null and (select count(*) from bolig_private.visual_sheets s where s.root_id=root and s.scope_id=scope)>=30 then raise exception 'Inntil 30 plantegninger per bolig.' using errcode='22023';end if;
   snap:=jsonb_build_object('title',trim(payload->>'title'),'path',image_path,'width',(payload->>'width')::int,'height',(payload->>'height')::int,'archived',(payload->>'archived')::boolean,
    'markers',coalesce((select jsonb_agg(jsonb_build_object('id',x->>'id','x',x->'x','y',x->'y','w',x->'w','h',x->'h')) from jsonb_array_elements(payload->'markers') x),'[]'));
   insert into bolig_private.visual_sheets(id,root_id,scope_id,kind,title) values(sid,root,scope,kind,snap->>'title') on conflict(id) do nothing;
   insert into bolig_private.visual_versions(id,sheet_id,root_id,revision,expected_revision,request,snapshot,created_by) values(rid,sid,root,rev+1,expected,payload,snap,auth.uid()) returning * into receipt;
   update bolig_private.visual_sheets set revision=rev+1,title=snap->>'title',archived=(snap->>'archived')::boolean where id=sid;
   insert into bolig_private.audit(company_id,root_id,actor_id,action,entity_id,revision) values(c,root,auth.uid(),'visual_publish',sid,rev+1);
  end if;
 end if;
 result:=jsonb_build_object('context',ctx,'root_id',root,'scope_id',scope,'kind',kind,'root_archived',r.archived or unavailable,'basis',basis,'targets',targets,
  'sheets',coalesce((select jsonb_agg(to_jsonb(s)||jsonb_build_object('current',v.snapshot,'version_id',v.id,'created_at',v.created_at) order by s.archived,s.title,s.id)
   from bolig_private.visual_sheets s join bolig_private.visual_versions v on v.sheet_id=s.id and v.revision=s.revision where s.root_id=root and s.scope_id=scope),'[]'));
 if action='history' then
  sid:=(payload->>'sheet_id')::uuid;
  result:=result||jsonb_build_object('history',coalesce((select jsonb_agg(jsonb_build_object('id',v.id,'revision',v.revision,'snapshot',v.snapshot,'created_at',v.created_at) order by v.revision desc)
   from bolig_private.visual_versions v join bolig_private.visual_sheets s on s.id=v.sheet_id where s.id=sid and s.root_id=root and s.scope_id=scope),'[]'));
 end if;
 if action='publish' then result:=result||jsonb_build_object('receipt_id',receipt.id,'receipt_revision',receipt.revision);end if;
 return result;
end$$;
revoke all on function bolig_private.visual_workspace(uuid,uuid,uuid,text,bigint,jsonb) from public,anon,authenticated,service_role;
grant execute on function bolig_private.visual_workspace(uuid,uuid,uuid,text,bigint,jsonb) to authenticated;
create function public.bolig_visuals(p_company_id uuid,p_root_id uuid,p_scope_id uuid,p_action text default 'list',p_revision bigint default null,p_payload jsonb default '{}') returns jsonb
language sql security invoker set search_path='' as $$select bolig_private.visual_workspace(p_company_id,p_root_id,p_scope_id,p_action,p_revision,p_payload);$$;
revoke all on function public.bolig_visuals(uuid,uuid,uuid,text,bigint,jsonb) from public,anon,service_role;
grant execute on function public.bolig_visuals(uuid,uuid,uuid,text,bigint,jsonb) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('bolig-project-visuals','bolig-project-visuals',false,12582912,array['image/jpeg','image/png','image/webp']);
create function bolig_private.visual_file_access(object_name text,writing boolean) returns boolean
language plpgsql stable security definer set search_path='' as $$
declare c uuid;root uuid;scope uuid;ctx jsonb;is_archived boolean;
begin
 if auth.uid() is null or object_name !~ '^[a-f0-9-]{36}/[a-f0-9-]{36}/[a-f0-9-]{36}/[a-f0-9-]{36}[.](jpg|png|webp)$' then return false;end if;
 c:=split_part(object_name,'/',1)::uuid;root:=split_part(object_name,'/',2)::uuid;scope:=split_part(object_name,'/',3)::uuid;
 ctx:=bolig_private.context(c);
 if not coalesce((ctx->>'enabled')::boolean,false) then return false;end if;
 select r.archived into is_archived from bolig_private.roots r where r.id=root and r.company_id=c;
 if not found then return false;end if;
 if writing then
  return ctx->>'role'='manager' and not is_archived and (
   exists(select 1 from bolig_private.blocks b where b.id=scope and b.root_id=root and not b.archived) or
   exists(select 1 from bolig_private.units u join bolig_private.entrances e on e.id=u.entrance_id join bolig_private.blocks b on b.id=e.block_id where u.id=scope and u.root_id=root and not u.archived and not e.archived and not b.archived));
 end if;
 -- Managers can recover staged files after a lost upload response. Readers
 -- only see immutable files referenced by a published version in this scope.
 return (ctx->>'role'='manager' and (exists(select 1 from bolig_private.blocks b where b.id=scope and b.root_id=root) or exists(select 1 from bolig_private.units u where u.id=scope and u.root_id=root))) or
  exists(select 1 from bolig_private.visual_versions v join bolig_private.visual_sheets s on s.id=v.sheet_id where s.root_id=root and s.scope_id=scope and v.snapshot->>'path'=object_name);
exception when invalid_text_representation or insufficient_privilege then return false;
end$$;
revoke all on function bolig_private.visual_file_access(text,boolean) from public,anon,authenticated,service_role;
grant execute on function bolig_private.visual_file_access(text,boolean) to authenticated;
create function public.bolig_visual_file_access(object_name text,writing boolean default false) returns boolean
language sql security invoker set search_path='' as $$select bolig_private.visual_file_access(object_name,writing);$$;
revoke all on function public.bolig_visual_file_access(text,boolean) from public,anon,service_role;
grant execute on function public.bolig_visual_file_access(text,boolean) to authenticated;
create policy bolig_visual_read on storage.objects for select to authenticated using(bucket_id='bolig-project-visuals' and public.bolig_visual_file_access(name,false));
create policy bolig_visual_insert on storage.objects for insert to authenticated with check(bucket_id='bolig-project-visuals' and public.bolig_visual_file_access(name,true));
-- Deliberately no UPDATE/DELETE policy: prior versions remain immutable.
