create table bolig_private.inspection_sketch_templates (
  id uuid primary key default gen_random_uuid(),
  root_id uuid not null references bolig_private.roots(id),
  name text not null check (length(trim(name)) between 1 and 80),
  sketch jsonb not null,
  created_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id)
);
create unique index bolig_inspection_sketch_template_name
  on bolig_private.inspection_sketch_templates (root_id, lower(name));
alter table bolig_private.inspection_sketch_templates enable row level security;
revoke all on bolig_private.inspection_sketch_templates from public, anon, authenticated, service_role;

create function public.bolig_inspection_sketch_templates(
  p_root uuid, p_unit uuid, p_name text default null, p_sketch jsonb default null, p_template uuid default null
) returns jsonb language plpgsql security definer set search_path='' as $$
begin
  if not bolig_private.inspection_access(p_root,p_unit,true) then
    raise exception 'Prosjektledertilgang kreves for Badskisse-maler.' using errcode='42501';
  end if;

  if p_template is not null then
    return jsonb_build_object('user_id',auth.uid(),'sketch',
      (select t.sketch from bolig_private.inspection_sketch_templates t
       where t.root_id=p_root and t.id=p_template));
  end if;

  if p_name is not null or p_sketch is not null then
    if p_name is null or length(trim(p_name)) not between 1 and 80
       or jsonb_typeof(p_sketch) is distinct from 'object'
       or octet_length(p_sketch::text)>225000
       or not exists (select 1 from jsonb_each(p_sketch) g
                      where g.key in ('walls','openings','markers','boxes','strokes')
                        and g.value <> '[]'::jsonb and jsonb_typeof(g.value)='array') then
      raise exception 'Kontroller malnavnet og Badskissen.' using errcode='22023';
    end if;
    insert into bolig_private.inspection_sketch_templates (root_id,name,sketch,created_by)
    values (p_root,trim(p_name),p_sketch,auth.uid())
    on conflict (root_id,lower(name)) do nothing;
    if not found then
      raise exception 'Det finnes allerede en mal med dette navnet i prosjektet.' using errcode='PT409';
    end if;
  end if;

  return jsonb_build_object(
    'user_id',auth.uid(),
    'templates',coalesce((select jsonb_agg(
      jsonb_build_object('id',t.id,'name',t.name) order by lower(t.name), t.id)
      from bolig_private.inspection_sketch_templates t where t.root_id=p_root),'[]'::jsonb)
  );
end;
$$;
revoke all on function public.bolig_inspection_sketch_templates(uuid,uuid,text,jsonb,uuid) from public, anon, service_role;
grant execute on function public.bolig_inspection_sketch_templates(uuid,uuid,text,jsonb,uuid) to authenticated;
