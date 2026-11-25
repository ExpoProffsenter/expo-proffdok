-- Package audiences are internal. Published versions and resident receipts remain frozen.
create table bolig_private.catalog_distribution (
  id bigint generated always as identity primary key,
  root_id uuid not null references bolig_private.roots(id),
  unit_id uuid not null references bolig_private.units(id),
  package_id uuid references bolig_private.packages(id),
  option_id uuid references bolig_private.options(id),
  check ((package_id is null) <> (option_id is null))
);
create unique index bolig_catalog_distribution_base_unit
  on bolig_private.catalog_distribution(unit_id) where package_id is not null;
create unique index bolig_catalog_distribution_option_unit
  on bolig_private.catalog_distribution(option_id,unit_id) where option_id is not null;
create index bolig_catalog_distribution_root on bolig_private.catalog_distribution(root_id);
create index bolig_catalog_distribution_package on bolig_private.catalog_distribution(package_id) where package_id is not null;
create index bolig_catalog_distribution_unit on bolig_private.catalog_distribution(unit_id);
alter table bolig_private.catalog_distribution enable row level security;
revoke all on bolig_private.catalog_distribution from public,anon,authenticated,service_role;

-- The historical flag also prevents a removed audience from republishing obsolete offers.
alter table bolig_private.resident_portals
  add column catalog_distribution boolean not null default false;

create function bolig_private.catalog_with_distribution(c uuid, root uuid, action text, expected bigint, payload jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare
  result jsonb;
  selected uuid[];
  item_id uuid;
  item_archived boolean;
  conflict_number text;
  assignment jsonb;
  units jsonb;
begin
  if action in ('package','option') and payload ? 'unit_ids' then
    if jsonb_typeof(payload->'unit_ids') is distinct from 'array' then
      raise exception 'Velg boliger fra dette prosjektet.' using errcode='22023';
    end if;
    select coalesce(array_agg(value::uuid order by value),'{}') into selected
    from jsonb_array_elements_text(payload->'unit_ids');
    if cardinality(selected) <> (select count(distinct u) from unnest(selected) u) then
      raise exception 'Velg hver bolig én gang.' using errcode='22023';
    end if;
  end if;

  result:=bolig_private.catalog(c,root,action,expected,payload-'unit_ids');
  if selected is not null then
    -- The catalog writer already holds the project catalog lock and checked the role.
    if cardinality(selected) <> (
      select count(*) from bolig_private.units u
      join bolig_private.entrances e on e.id=u.entrance_id
      join bolig_private.blocks b on b.id=e.block_id
      where u.id=any(selected) and u.root_id=root
      and not u.archived and not e.archived and not b.archived
    ) then
      raise exception 'Utvalget inneholder en bolig som ikke lenger er tilgjengelig.' using errcode='PT409';
    end if;

    select (item->>'id')::uuid,(item->>'archived')::boolean into strict item_id,item_archived
    from jsonb_array_elements(result->(case when action='package' then 'packages' else 'options' end)) item
    where item->>'name'=trim(payload->>'name');
    if item_archived and cardinality(selected)>0 then
      raise exception 'Gjenopprett pakken før du velger boliger.' using errcode='22023';
    end if;

    if action='package' then
      select u.number into conflict_number
      from bolig_private.catalog_distribution d join bolig_private.units u on u.id=d.unit_id
      where d.root_id=root and d.unit_id=any(selected) and d.package_id<>item_id
      order by u.number,u.id limit 1;
      if found then
        raise exception 'Bolig % har allerede en felles grunnpakke. Fjern boligen fra den pakken først.', conflict_number
          using errcode='PT409';
      end if;
    end if;

    delete from bolig_private.catalog_distribution d
    where d.root_id=root and (d.package_id=item_id or d.option_id=item_id)
      and not (d.unit_id=any(selected));
    insert into bolig_private.catalog_distribution(root_id,unit_id,package_id,option_id)
    select root, u, case when action='package' then item_id end, case when action='option' then item_id end
    from unnest(selected) u on conflict do nothing;
  elsif action='archive' and payload->'archived'='true'::jsonb then
    item_id:=(payload->>'id')::uuid;
    delete from bolig_private.catalog_distribution d
    where d.root_id=root and (d.package_id=item_id or d.option_id=item_id);
  end if;

  if result#>>'{context,role}' is distinct from 'manager' or action not in ('state','package','option','archive') then
    return result;
  end if;
  select coalesce(jsonb_object_agg(package,unit_ids),'{}') into assignment
  from (
    select coalesce(d.package_id,d.option_id) as package, jsonb_agg(d.unit_id order by d.unit_id) as unit_ids
    from bolig_private.catalog_distribution d where d.root_id=root
    group by coalesce(d.package_id,d.option_id)
  ) a;
  select coalesce(jsonb_agg(jsonb_build_object(
      'id',u.id,'number',u.number,'block_id',b.id,'block_name',b.name,
      'group_id',g.id,'group_name',g.name
    ) order by b.name,u.number,u.id),'[]') into units
  from bolig_private.units u
  join bolig_private.entrances e on e.id=u.entrance_id
  join bolig_private.blocks b on b.id=e.block_id
  left join bolig_private.planning_group_units gu on gu.unit_id=u.id
  left join bolig_private.planning_groups g on g.id=gu.group_id
  where u.root_id=root and not u.archived and not e.archived and not b.archived;
  return result||jsonb_build_object('distribution',assignment,'distribution_units',units);
end$$;
revoke all on function bolig_private.catalog_with_distribution(uuid,uuid,text,bigint,jsonb) from public,anon,authenticated,service_role;
grant execute on function bolig_private.catalog_with_distribution(uuid,uuid,text,bigint,jsonb) to authenticated;
create or replace function public.bolig_catalog(
  p_company_id uuid,p_root_id uuid,p_action text default 'state',p_revision bigint default null,p_payload jsonb default '{}'
) returns jsonb language sql security invoker set search_path='' as $$
  select bolig_private.catalog_with_distribution(p_company_id,p_root_id,p_action,p_revision,p_payload)
$$;

-- Called only inside the existing publish transaction, after authorization, replay,
-- revision and recipient checks. Builds a menu without writing a resident's choice.
create function bolig_private.distributed_portal_menu(
  c uuid, root uuid, unit uuid, portal uuid, choice_revision bigint
) returns uuid language plpgsql set search_path='' as $$
#variable_conflict use_variable
declare
  base_id uuid;
  base_offer_id uuid;
  base_name text;
  option_count integer;
  option_row record;
  state jsonb;
  base jsonb;
  alternative jsonb;
  common_part jsonb;
  candidate_parts jsonb;
  menu jsonb;
  number text;
begin
  select d.package_id into base_id from bolig_private.catalog_distribution d
  where d.root_id=root and d.unit_id=unit and d.package_id is not null;
  select count(*) into option_count from bolig_private.catalog_distribution d
  where d.root_id=root and d.unit_id=unit and d.option_id is not null;
  if base_id is null and option_count=0
    and not (select p.catalog_distribution from bolig_private.resident_portals p where p.id=portal) then
    return null;
  end if;

  select u.number into number from bolig_private.units u where u.id=unit and u.root_id=root;
  if exists (
    select 1 from bolig_private.commercial_documents x
    where x.root_id=root and x.unit_id=unit and x.kind='choice'
      and x.status in ('accepted','handled') and x.token_hash is not null
  ) then
    -- Confirmed homes use the ordinary renewal and reopening rules.
    return null;
  end if;
  if base_id is null then
    raise exception 'Velg hvilken grunnpakke som gjelder for bolig % før du klargjør lenken.', number using errcode='22023';
  end if;
  if option_count>12 then
    raise exception 'Bolig % kan få inntil 12 kombinerbare tilvalgspakker.', number using errcode='22023';
  end if;

  state:=bolig_private.package_choices(c,root,unit,'get',null,'{}');
  base:=bolig_private.package_choices(c,root,unit,'preview',choice_revision,jsonb_build_object(
    'scope_id','common','package_id',base_id,'option_ids','[]'::jsonb,
    'rooms_revision',state->'rooms_revision','catalog_revision',state->'revision'
  ))->'proposal';
  select value into strict common_part from jsonb_array_elements(base->'components') where value->>'scope_id'='common';
  base_name:=common_part#>>'{package,name}';
  base_offer_id:=gen_random_uuid();
  menu:=jsonb_build_array(jsonb_build_object(
    'id',base_offer_id,'title',base_name,'source_revision',choice_revision,'snapshot',base
  ));
  for option_row in
    select o.id,o.name from bolig_private.catalog_distribution d
    join bolig_private.options o on o.id=d.option_id
    where d.root_id=root and d.unit_id=unit order by o.name,o.id
  loop
    begin
      alternative:=common_part||bolig_private.package_snapshot(root,base_id,jsonb_build_array(option_row.id),(state->>'revision')::bigint);
      select jsonb_agg(case when value->>'scope_id'='common' then alternative else value end order by n)
      into candidate_parts from jsonb_array_elements(base->'components') with ordinality x(value,n);
      alternative:=bolig_private.portal_frozen_selection(base,jsonb_build_array(base||jsonb_build_object('components',candidate_parts)));
    exception when invalid_parameter_value then
      raise exception 'Bolig %: Tilvalgspakken «%» passer ikke til boliggrunnlaget. %', number,option_row.name,sqlerrm
        using errcode='22023';
    end;
    menu:=menu||jsonb_build_array(jsonb_build_object(
      'id',gen_random_uuid(),'title',option_row.name,'source_revision',choice_revision,'snapshot',alternative
    ));
  end loop;
  update bolig_private.resident_portals set offers=menu,catalog_distribution=true where id=portal;
  return base_offer_id;
end$$;
revoke all on function bolig_private.distributed_portal_menu(uuid,uuid,uuid,uuid,bigint) from public,anon,authenticated,service_role;

do $migration$
declare body text;
declare anchor text:='   if exists(select 1 from jsonb_array_elements(p.offers) o where (o->>''source_revision'')::bigint<>cv)';
begin
  body:=pg_get_functiondef('bolig_private.resident_portal_before_direct_confirmation(uuid,uuid,uuid,text,jsonb)'::regprocedure);
  if position(anchor in body)=0 or position('note text;v_id uuid;' in body)=0 then
    raise exception 'Missing portal publication anchor';
  end if;
  body:=replace(body,'note text;v_id uuid;','note text;v_id uuid; distributed_base uuid;');
  body:=replace(body,anchor,$patch$
   distributed_base:=bolig_private.distributed_portal_menu(c,root,unit,p.id,cv);
   if distributed_base is not null then
    select * into p from bolig_private.resident_portals where id=p.id;
    payload:=payload||jsonb_build_object('combine_base_id',distributed_base);
   end if;
$patch$||anchor);
  execute body;

  -- A reviewed recipient list becomes stale if any of its package content changes.
  body:=pg_get_functiondef('bolig_private.resident_batch_rows(uuid)'::regprocedure);
  anchor:=$anchor$'portal_revision',coalesce(p.revision,0),'offer_count',coalesce(jsonb_array_length(p.offers),0),$anchor$;
  if position(anchor in body)=0 or position('p.revision,p.menu_version,' in body)=0 then
    raise exception 'Missing resident batch audience anchor';
  end if;
  body:=replace(body,anchor,$patch$
 'portal_revision',coalesce(p.revision,0),'offer_count',case when a.total>0 or p.catalog_distribution then a.total else coalesce(jsonb_array_length(p.offers),0) end,
$patch$);
  body:=replace(body,'p.revision,p.menu_version,',$patch$p.revision,
 case when a.total>0 or p.catalog_distribution
      then jsonb_build_array(p.menu_version,(select cs.revision from bolig_private.catalog_states cs where cs.root_id=root))
      else to_jsonb(p.menu_version) end,$patch$);
  anchor:=' left join bolig_private.resident_portals p on p.unit_id=u.id';
  if position(anchor in body)=0 then raise exception 'Missing resident batch join anchor'; end if;
  body:=replace(body,anchor,anchor||$patch$
 left join lateral(select count(*) as total from bolig_private.catalog_distribution d where d.root_id=root and d.unit_id=u.id) a on true$patch$);
  execute body;
end$migration$;
notify pgrst,'reload schema';
