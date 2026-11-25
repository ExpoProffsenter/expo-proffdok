alter table org_private.settings add column chart_name text check(chart_name is null or length(trim(chart_name)) between 2 and 100);

create or replace function public.organization_state(p_company_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare x jsonb;units jsonb;people jsonb;members jsonb;
begin
 x:=org_private.require_context(p_company_id);
 select coalesce(jsonb_agg(jsonb_build_object('id',q.id,'parent_id',q.parent_id,'name',q.name,
  'manager_id',case when org_private.has_access(p_company_id,q.manager_id) then q.manager_id end,
  'manager_name',case when org_private.has_access(p_company_id,q.manager_id) then org_private.display_name(p_company_id,q.manager_id) end,'color',q.color,
  'editable',org_private.can_edit(p_company_id,q.id,auth.uid())) order by q.name,q.id),'[]') into units
 from(select * from org_private.units where company_id=p_company_id order by name,id limit 101)q;
 select coalesce(jsonb_agg(jsonb_build_object('id',q.user_id,'user_id',q.user_id,'name',org_private.display_name(p_company_id,q.user_id),
  'leader_id',case when hr_private.active_member(p_company_id,q.leader_id) then q.leader_id end,
  'revision',coalesce(q.revision,0),'hr_registered',q.hr_id is not null,'unit_id',q.unit_id,'title',coalesce(q.title,'Medarbeider'),
  'kind',coalesce(q.kind,'employee')) order by q.user_id),'[]') into people from (
  select m.user_id,e.id hr_id,e.revision,case when e.id is not null then e.leader_id else p.leader_id end leader_id,p.unit_id,p.title,p.kind
   from public.sales_company_memberships m left join org_private.placements p on p.company_id=m.company_id and p.user_id=m.user_id
   left join hr_private.employees e on e.company_id=m.company_id and e.user_id=m.user_id
   where m.company_id=p_company_id and hr_private.active_member(p_company_id,m.user_id) order by m.user_id limit 501)q;
 select coalesce(jsonb_agg(jsonb_build_object('id',q.user_id,'name',org_private.display_name(p_company_id,q.user_id),
  'can_edit_chart',org_private.has_access(p_company_id,q.user_id),'can_lead_hr',hr_private.has_module_access(p_company_id,q.user_id)) order by q.user_id),'[]') into members
 from(select m.user_id from public.sales_company_memberships m where m.company_id=p_company_id
  and hr_private.active_member(p_company_id,m.user_id) order by m.user_id limit 501)q;
 if jsonb_array_length(units)>100 or jsonb_array_length(people)>500 or jsonb_array_length(members)>500
 then raise exception 'Organisasjonskartet trenger utvidet paginering. Kontakt firmaadmin.' using errcode='54000';end if;
 return jsonb_build_object('context',x,'revision',coalesce((select revision from org_private.settings where company_id=p_company_id),0),
  'chart_name',(select chart_name from org_private.settings where company_id=p_company_id),
  'units',units,'people',people,'members',members);
end$$;

create function public.organization_save_layout(p_company_id uuid,p_revision integer,p_payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare x jsonb;rev integer;items jsonb;removed uuid[];confirmed uuid[];
begin
 x:=org_private.require_context(p_company_id);
 if not coalesce((x->>'administer')::boolean,false) then raise exception 'Firmaadmin lagrer hele kartstrukturen.' using errcode='42501';end if;
 perform 1 from hr_private.firms where company_id=p_company_id for update;
 perform 1 from public.sales_company_scopes where id=p_company_id for update;
 x:=org_private.require_context(p_company_id);
 if not coalesce((x->>'administer')::boolean,false) then raise exception 'Firmaadmin lagrer hele kartstrukturen.' using errcode='42501';end if;
 select revision into rev from org_private.settings where company_id=p_company_id;
 if p_revision is distinct from coalesce(rev,0) then raise exception 'Kartet er endret. Behold kladden og hent den nye utgaven.' using errcode='40001';end if;
 if jsonb_typeof(p_payload) is distinct from 'object' or pg_column_size(p_payload)>45000
  or exists(select 1 from jsonb_object_keys(p_payload)k where k not in ('chart_name','units','removed_ids','confirm_removal'))
  or jsonb_typeof(p_payload->'chart_name') is distinct from 'string'
  or length(trim(p_payload->>'chart_name')) not between 2 and 100
  or p_payload->>'chart_name' ~ '[[:cntrl:]]'
  or jsonb_typeof(p_payload->'units') is distinct from 'array'
  or jsonb_typeof(p_payload->'removed_ids') is distinct from 'array'
  or jsonb_typeof(p_payload->'confirm_removal') is distinct from 'boolean'
 then raise exception 'Ugyldig kartkladd.' using errcode='22023';end if;
 items:=p_payload->'units';
 if jsonb_array_length(items)>100 or jsonb_array_length(p_payload->'removed_ids')>100 then raise exception 'Maksimalt 100 avdelinger.' using errcode='54000';end if;
 if exists(select 1 from jsonb_array_elements(items)v where jsonb_typeof(v) is distinct from 'object')
 then raise exception 'Ugyldig avdeling.' using errcode='22023';end if;
 if exists(select 1 from jsonb_array_elements(items)v where
  exists(select 1 from jsonb_object_keys(v)k where k not in ('id','parent_id','name','manager_id','color'))
  or jsonb_typeof(v->'id') is distinct from 'string' or jsonb_typeof(v->'name') is distinct from 'string'
  or jsonb_typeof(v->'color') is distinct from 'string'
  or coalesce(jsonb_typeof(v->'parent_id'),'null') not in ('string','null')
  or coalesce(jsonb_typeof(v->'manager_id'),'null') not in ('string','null'))
 then raise exception 'Bare organisasjonsfelt kan lagres her.' using errcode='22023';end if;
 if exists(select 1 from jsonb_to_recordset(items) as n(id uuid,parent_id uuid,name text,manager_id uuid,color text)
  where n.id is null or length(trim(n.name)) not between 2 and 80 or n.name ~ '[[:cntrl:]]'
  or n.color not in ('teal','blue','amber','violet','rose') or n.id=n.parent_id)
  or (select count(distinct n.id) from jsonb_to_recordset(items)as n(id uuid))<>jsonb_array_length(items)
 then raise exception 'Kontroller navn, farge og avdelings-ID-er.' using errcode='22023';end if;
 if exists(select 1 from jsonb_to_recordset(items)as n(id uuid) join org_private.units u on u.id=n.id where u.company_id<>p_company_id)
 then raise exception 'Avdelingen tilhører et annet firma.' using errcode='42501';end if;
 if exists(select 1 from jsonb_to_recordset(items)as n(parent_id uuid)
  where n.parent_id is not null and not exists(select 1 from jsonb_to_recordset(items)as p(id uuid)where p.id=n.parent_id))
 then raise exception 'Velg overordnet nivå i dette kartet.' using errcode='22023';end if;
 if exists(select 1 from jsonb_to_recordset(items)as n(manager_id uuid)
  where n.manager_id is not null and not org_private.has_access(p_company_id,n.manager_id))
 then raise exception 'Velg aktiv avdelingsleder med KS/HMS-tilgang.' using errcode='42501';end if;
 if exists(with recursive nodes as (select * from jsonb_to_recordset(items)as n(id uuid,parent_id uuid)),
  paths as (select id,parent_id,array[id] path,false loop from nodes
   union all select p.id,n.parent_id,p.path||n.id,n.id=any(p.path) from paths p join nodes n on n.id=p.parent_id
   where not p.loop and cardinality(p.path)<=12)
  select 1 from paths where loop or cardinality(path)>12)
 then raise exception 'Kartet kan ikke gå i ring eller ha mer enn 12 nivåer.' using errcode='22023';end if;
 select coalesce(array_agg(id order by id),'{}'::uuid[]) into removed from org_private.units u where company_id=p_company_id
  and not exists(select 1 from jsonb_to_recordset(items)as n(id uuid)where n.id=u.id);
 select coalesce(array_agg(value::uuid order by value::uuid),'{}'::uuid[]) into confirmed from jsonb_array_elements_text(p_payload->'removed_ids');
 if removed is distinct from confirmed or cardinality(removed)>0 and p_payload->>'confirm_removal'<>'true'
 then raise exception 'Bekreft nøyaktig hvilke avdelinger som skal slettes.' using errcode='22023';end if;
 -- All validation precedes writes. No HR leader/content/access function is called.
 -- One RPC transaction: failure at any point rolls the complete layout back.
 update org_private.units set parent_id=null where company_id=p_company_id;
 insert into org_private.units(id,company_id,parent_id,name,manager_id,color)
  select n.id,p_company_id,null,trim(n.name),n.manager_id,n.color
   from jsonb_to_recordset(items)as n(id uuid,parent_id uuid,name text,manager_id uuid,color text)
  on conflict(id)do update set name=excluded.name,manager_id=excluded.manager_id,color=excluded.color;
 update org_private.units u set parent_id=n.parent_id from jsonb_to_recordset(items)as n(id uuid,parent_id uuid)
  where u.company_id=p_company_id and u.id=n.id;
 update org_private.placements set unit_id=null where company_id=p_company_id and unit_id=any(removed);
 delete from org_private.units where company_id=p_company_id and id=any(removed);
 insert into org_private.settings(company_id,revision,chart_name)values(p_company_id,1,trim(p_payload->>'chart_name'))
  on conflict(company_id)do update set revision=org_private.settings.revision+1,chart_name=excluded.chart_name;
 return public.organization_state(p_company_id);
end$$;
revoke all on function public.organization_save_layout(uuid,integer,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.organization_save_layout(uuid,integer,jsonb) to authenticated;
