-- Shared reading is explicit opt-in. Existing charts retain their original access contract.
alter table org_private.groups add column shared_visibility boolean not null default false;
alter table org_private.units add column sort_order integer not null default 0 check(sort_order between 0 and 100);
alter table org_private.group_units add column sort_order integer not null default 0 check(sort_order between 0 and 100);

create or replace function org_private.group_access(g uuid,u uuid,editing boolean default false) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from org_private.groups where id=g)
 and (select count(*) from org_private.group_companies where group_id=g) between 2 and 10
 and ((not editing and (select shared_visibility from org_private.groups where id=g) and exists(select 1 from org_private.group_companies f where f.group_id=g and org_private.has_access(f.company_id,u)))
 or not exists(select 1 from org_private.group_companies f where f.group_id=g and
 (not org_private.has_access(f.company_id,u) or editing and not exists(select 1 from public.sales_company_memberships m where m.company_id=f.company_id and m.user_id=u and m.workspace_role='firmaadmin'))))
$$;

create or replace function org_private.group_context(c uuid,g uuid,editing boolean default false) returns jsonb language plpgsql security definer set search_path='' as $$
declare x jsonb;begin
 x:=org_private.require_context(c);
 if not exists(select 1 from org_private.group_companies where group_id=g and company_id=c) or not org_private.group_access(g,auth.uid(),editing) then raise exception 'Felles visning krever KS/HMS i et tilknyttet firma; begrensede kart krever alle. Redigering krever firmaadmin i alle.' using errcode='42501';end if;
 return x||jsonb_build_object('group_id',g,'administer',org_private.group_access(g,auth.uid(),true));
end$$;


create or replace function public.organization_group_options(p_company_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare x jsonb;groups jsonb;firms jsonb;begin
 x:=org_private.require_context(p_company_id);
 select coalesce(jsonb_agg(jsonb_build_object('id',id,'name',name,'shared_visibility',shared_visibility,'administer',org_private.group_access(id,auth.uid(),true)) order by name,id),'[]') into groups from(select g.id,g.name,g.shared_visibility from org_private.groups g join org_private.group_companies l on l.group_id=g.id where l.company_id=p_company_id and org_private.group_access(g.id,auth.uid()) order by g.name,g.id limit 21) q;
 select coalesce(jsonb_agg(jsonb_build_object('id',id,'name',display_name) order by display_name,id),'[]') into firms from(select c.id,c.display_name from public.sales_company_scopes c join public.sales_company_memberships m on m.company_id=c.id where m.user_id=auth.uid() and m.workspace_role='firmaadmin' and org_private.has_access(c.id,auth.uid()) order by c.display_name,c.id limit 11)q;
 if jsonb_array_length(groups)>20 or jsonb_array_length(firms)>10 then raise exception 'Kontakt support for utvidet flerfirma-kart.' using errcode='54000';end if;
 return jsonb_build_object('context',x,'groups',groups,'companies',firms);
end$$;


create or replace function public.organization_group_state(p_company_id uuid,p_group_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare x jsonb;units jsonb;people jsonb;members jsonb;firms jsonb;begin
 x:=org_private.group_context(p_company_id,p_group_id);
 select jsonb_agg(jsonb_build_object('id',c.id,'name',c.display_name) order by c.id) into firms from org_private.group_companies l join public.sales_company_scopes c on c.id=l.company_id where l.group_id=p_group_id;
 select coalesce(jsonb_agg(jsonb_build_object('id',q.id,'parent_id',q.parent_id,'company_id',q.company_id,'name',q.name,'color',q.color,'sort_order',q.sort_order,'manager_id',case when org_private.group_manager(p_group_id,q.id,q.manager_id) then q.manager_id end,'manager_name',case when org_private.group_manager(p_group_id,q.id,q.manager_id) then org_private.display_name(coalesce(org_private.group_unit_company(p_group_id,q.id),p_company_id),q.manager_id) end,'editable',(x->>'administer')::boolean) order by q.name,q.id),'[]') into units from(select * from org_private.group_units where group_id=p_group_id order by name,id limit 101)q;
 select coalesce(jsonb_agg(jsonb_build_object('id',q.company_id::text||':'||q.user_id::text,'user_id',q.user_id,'company_id',q.company_id,'company_name',q.display_name,'name',org_private.display_name(q.company_id,q.user_id),'revision',0,'hr_registered',false,'leader_id',null,'unit_id',q.unit_id,'title',coalesce(q.title,'Medarbeider'),'kind',coalesce(q.kind,'employee')) order by q.company_id,q.user_id),'[]') into people from(
 select m.company_id,m.user_id,c.display_name,p.unit_id,p.title,p.kind from org_private.group_companies l join public.sales_company_scopes c on c.id=l.company_id join public.sales_company_memberships m on m.company_id=l.company_id left join org_private.group_placements p on p.group_id=l.group_id and p.company_id=m.company_id and p.user_id=m.user_id where l.group_id=p_group_id and hr_private.active_member(m.company_id,m.user_id) order by m.company_id,m.user_id limit 501)q;
 select coalesce(jsonb_agg(jsonb_build_object('id',q.user_id,'name',org_private.display_name(q.first_company,q.user_id),'company_ids',q.company_ids,'can_edit_chart',true,'can_lead_hr',false) order by q.user_id),'[]') into members from(select m.user_id,(array_agg(m.company_id order by m.company_id))[1] first_company,array_agg(m.company_id order by m.company_id) company_ids from org_private.group_companies l join public.sales_company_memberships m on m.company_id=l.company_id where l.group_id=p_group_id and org_private.has_access(m.company_id,m.user_id) group by m.user_id order by m.user_id limit 501)q;
 if jsonb_array_length(units)>100 or jsonb_array_length(people)>500 or jsonb_array_length(members)>500 then raise exception 'Felleskartet trenger utvidet paginering.' using errcode='54000';end if;
 return jsonb_build_object('context',x,'revision',(select revision from org_private.groups where id=p_group_id),'chart_name',(select name from org_private.groups where id=p_group_id),'shared_visibility',(select shared_visibility from org_private.groups where id=p_group_id),'companies',firms,'units',units,'people',people,'members',members);
end$$;


create or replace function public.organization_group_create(p_company_id uuid,p_payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare g uuid;board uuid:=gen_random_uuid();ids uuid[];c uuid;name text;begin
 perform org_private.require_context(p_company_id);
 if jsonb_typeof(p_payload) is distinct from 'object' or exists(select 1 from jsonb_object_keys(p_payload) k where k not in ('id','name','company_ids','confirm','shared_visibility')) or jsonb_typeof(p_payload->'confirm') is distinct from 'boolean' or p_payload->>'confirm' is distinct from 'true' or jsonb_typeof(p_payload->'company_ids') is distinct from 'array' or jsonb_typeof(p_payload->'name') is distinct from 'string' or length(trim(p_payload->>'name')) not between 2 and 100 or p_payload?'shared_visibility' and jsonb_typeof(p_payload->'shared_visibility') is distinct from 'boolean' or octet_length(p_payload::text)>5000 then raise exception 'Kontroller navnet, firmaene og bekreft opprettelsen.' using errcode='22023';end if;
 select array_agg(value::uuid order by value::uuid) into ids from jsonb_array_elements_text(p_payload->'company_ids');
 if cardinality(ids) not between 2 and 10 or (select count(distinct i)from unnest(ids)i)<>cardinality(ids) or p_company_id=any(ids) is not true then raise exception 'Velg 2–10 ulike firmaer, inkludert valgt firma.' using errcode='22023';end if;
 foreach c in array ids loop
 if not org_private.has_access(c,auth.uid()) or not exists(select 1 from public.sales_company_memberships where company_id=c and user_id=auth.uid() and workspace_role='firmaadmin') then raise exception 'Velg firmaer der du har KS/HMS og er firmaadmin.' using errcode='42501';end if;end loop;
 perform company_id from hr_private.firms where company_id=any(ids) order by company_id for update;
 perform id from public.sales_company_scopes where id=any(ids) order by id for update;
 perform org_private.require_context(p_company_id);
 foreach c in array ids loop
 if not org_private.has_access(c,auth.uid()) or not exists(select 1 from public.sales_company_memberships where company_id=c and user_id=auth.uid() and workspace_role='firmaadmin') then raise exception 'Firmatilgangen er endret.' using errcode='42501';end if;
 if (select count(*)from org_private.group_companies where company_id=c)>=10 then raise exception 'Maksimalt ti felleskart per firma.' using errcode='54000';end if;end loop;
 g:=(p_payload->>'id')::uuid;if g is null then raise exception 'Kart-ID mangler.' using errcode='22023';end if;
 if exists(select 1 from org_private.groups where id=g) then raise exception 'Kartet er allerede opprettet. Hent kartlisten på nytt.' using errcode='40001';end if;
 insert into org_private.groups(id,name,shared_visibility)values(g,trim(p_payload->>'name'),coalesce((p_payload->>'shared_visibility')::boolean,false));
 insert into org_private.group_companies(group_id,company_id)select g,i from unnest(ids)i;
 insert into org_private.group_units(id,group_id,name,color)values(board,g,'Styret','violet');
 insert into org_private.group_units(id,group_id,parent_id,company_id,name,color)select gen_random_uuid(),g,board,c.id,left(c.display_name,80),'teal' from public.sales_company_scopes c where c.id=any(ids);
 return public.organization_group_state(p_company_id,g);
end$$;


create or replace function public.organization_group_command(p_company_id uuid,p_group_id uuid,p_revision integer,p_action text,p_payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare x jsonb;items jsonb;item jsonb;ids uuid[];removed uuid[];confirmed uuid[];keys text[];written integer;c uuid;subject uuid;unit uuid;begin
 x:=org_private.group_context(p_company_id,p_group_id,true);
 perform org_private.group_lock(p_group_id);
 x:=org_private.group_context(p_company_id,p_group_id,true);
 if p_revision is distinct from (select revision from org_private.groups where id=p_group_id) then raise exception 'Felleskartet er endret. Hent på nytt.' using errcode='40001';end if;
 if jsonb_typeof(p_payload) is distinct from 'object' or octet_length(p_payload::text)>50000 or p_action is null or p_action not in ('layout','place','unplace','remove_group') then raise exception 'Ugyldig felleskarthandling.' using errcode='22023';end if;
 keys:=case p_action when 'layout' then array['chart_name','units','removed_ids','confirm_removal','shared_visibility'] when 'place' then array['employee_id','company_id','user_id','unit_id','title','kind'] when 'unplace' then array['employee_id','company_id','user_id'] else array['confirm'] end;
 if exists(select 1 from jsonb_object_keys(p_payload) k where not k=any(keys)) then raise exception 'Bare felleskartfelt kan lagres.' using errcode='22023';end if;
 if p_action='remove_group' then
 if jsonb_typeof(p_payload->'confirm') is distinct from 'boolean' or p_payload->>'confirm' is distinct from 'true' then raise exception 'Bekreft sletting av felleskartet.' using errcode='22023';end if;
 delete from org_private.group_placements where group_id=p_group_id;
 update org_private.group_units set parent_id=null where group_id=p_group_id;
 delete from org_private.groups where id=p_group_id;
 return public.organization_group_options(p_company_id);
 elsif p_action='layout' then
 if p_payload?'shared_visibility' and jsonb_typeof(p_payload->'shared_visibility') is distinct from 'boolean' then raise exception 'Kryss av for felles visning.' using errcode='22023';end if;
 items:=p_payload->'units';
 if jsonb_typeof(items) is distinct from 'array' or jsonb_array_length(items)>100 or jsonb_typeof(p_payload->'chart_name') is distinct from 'string' or length(trim(p_payload->>'chart_name')) not between 2 and 100 then raise exception 'Kontroller toppnavn og maks 100 avdelinger.' using errcode='22023';end if;
 for item in select value from jsonb_array_elements(items) loop
 if jsonb_typeof(item) is distinct from 'object' or exists(select 1 from jsonb_object_keys(item) k where k not in ('id','parent_id','company_id','name','manager_id','color','sort_order')) or jsonb_typeof(item->'id') is distinct from 'string' or jsonb_typeof(item->'name') is distinct from 'string' or length(trim(item->>'name')) not between 2 and 80 or jsonb_typeof(item->'color') is distinct from 'string' or item->>'color' not in ('teal','blue','amber','violet','rose') or exists(select 1 from unnest(array['parent_id','company_id','manager_id']) k where item?k and jsonb_typeof(item->k) not in ('string','null')) then raise exception 'Kontroller kortfeltene.' using errcode='22023';end if;
 if item?'sort_order' and (jsonb_typeof(item->'sort_order') is distinct from 'number' or (item->>'sort_order') !~ '^(0|[1-9][0-9]?|100)$') then raise exception 'Rekkefølgen må være et heltall fra 0 til 100.' using errcode='22023';end if;
 perform (item->>'id')::uuid,(item->>'parent_id')::uuid,(item->>'company_id')::uuid,(item->>'manager_id')::uuid;
 if (item->>'company_id') is not null and not exists(select 1 from org_private.group_companies where group_id=p_group_id and company_id=(item->>'company_id')::uuid) then raise exception 'Velg firma som tilhører kartet.' using errcode='42501';end if;

 end loop;
 select coalesce(array_agg((v->>'id')::uuid),'{}') into ids from jsonb_array_elements(items)v;
 if cardinality(ids)<>(select count(distinct i)from unnest(ids)i) or exists(select 1 from org_private.group_units where id=any(ids) and group_id<>p_group_id) then raise exception 'Duplisert eller fremmed kort-ID.' using errcode='42501';end if;
 if exists(select 1 from jsonb_array_elements(items)v where v->>'parent_id' is not null and (v->>'parent_id')::uuid=any(ids) is not true) then raise exception 'Overordnet avdeling mangler.' using errcode='22023';end if;
 if exists(with recursive walk as(select (v->>'id')::uuid id,(v->>'parent_id')::uuid parent_id,(v->>'company_id')::uuid firm,array[(v->>'id')::uuid] path,false bad from jsonb_array_elements(items)v
 union all select w.id,(v->>'parent_id')::uuid,coalesce(w.firm,(v->>'company_id')::uuid),w.path||(v->>'id')::uuid,w.bad or (v->>'id')::uuid=any(w.path) or w.firm is not null and v->>'company_id' is not null and w.firm<>(v->>'company_id')::uuid from walk w join jsonb_array_elements(items)v on (v->>'id')::uuid=w.parent_id where not w.bad and cardinality(w.path)<=12)
 select 1 from walk where bad or cardinality(path)>12) then raise exception 'Kontroller loop, dybde og firmagrense.' using errcode='22023';end if;
 select coalesce(array_agg(id order by id),'{}')into removed from org_private.group_units where group_id=p_group_id and id<>all(ids);
 if jsonb_typeof(p_payload->'removed_ids') is distinct from 'array' or jsonb_typeof(p_payload->'confirm_removal') is distinct from 'boolean' then raise exception 'Kontroller slettingsbekreftelsen.' using errcode='22023';end if;
 select coalesce(array_agg(value::uuid order by value::uuid),'{}') into confirmed from jsonb_array_elements_text(p_payload->'removed_ids');
 if removed is distinct from confirmed or cardinality(removed)>0 and p_payload->>'confirm_removal' is distinct from 'true' then raise exception 'Bekreft nøyaktig hvilke kort som fjernes.' using errcode='22023';end if;
 update org_private.group_units set parent_id=null where group_id=p_group_id;
 insert into org_private.group_units(id,group_id,parent_id,company_id,name,manager_id,color,sort_order) select (v->>'id')::uuid,p_group_id,null,(v->>'company_id')::uuid,trim(v->>'name'),(v->>'manager_id')::uuid,v->>'color',coalesce((v->>'sort_order')::integer,(select sort_order from org_private.group_units where id=(v->>'id')::uuid and group_id=p_group_id),0) from jsonb_array_elements(items)v
 on conflict(id)do update set company_id=excluded.company_id,name=excluded.name,manager_id=excluded.manager_id,color=excluded.color,sort_order=excluded.sort_order where org_private.group_units.group_id=p_group_id;
 get diagnostics written=row_count;if written<>jsonb_array_length(items) then raise exception 'Kort-ID kolliderer med annet kart.' using errcode='42501';end if;
 update org_private.group_units u set parent_id=(v->>'parent_id')::uuid from jsonb_array_elements(items)v where u.group_id=p_group_id and u.id=(v->>'id')::uuid;
 update org_private.group_placements set unit_id=null where group_id=p_group_id and unit_id=any(removed);
 delete from org_private.group_units where group_id=p_group_id and id=any(removed);
 if exists(select 1 from org_private.group_units u where u.group_id=p_group_id and u.manager_id is not null and not org_private.group_manager(p_group_id,u.id,u.manager_id)) then raise exception 'Velg kartleder med KS/HMS i grenen, eller alle firmaer for et felles nivå.' using errcode='42501';end if;
 -- Moving a company boundary must not silently move a person's placement to another firm.
 if exists(select 1 from org_private.group_placements p where p.group_id=p_group_id and p.unit_id is not null and org_private.group_unit_company(p_group_id,p.unit_id) is distinct from p.company_id) then raise exception 'Flytt medarbeiderne før du endrer firma på en gren.' using errcode='22023';end if;
 update org_private.groups set name=trim(p_payload->>'chart_name'),shared_visibility=coalesce((p_payload->>'shared_visibility')::boolean,shared_visibility) where id=p_group_id;
 else
 c:=(p_payload->>'company_id')::uuid;subject:=(p_payload->>'user_id')::uuid;unit:=(p_payload->>'unit_id')::uuid;
 if p_payload->>'employee_id' is distinct from c::text||':'||subject::text or not exists(select 1 from org_private.group_companies where group_id=p_group_id and company_id=c) or not hr_private.active_member(c,subject) then raise exception 'Velg aktiv person i tilknyttet firma.' using errcode='42501';end if;
 if p_action='unplace' then update org_private.group_placements set unit_id=null where group_id=p_group_id and company_id=c and user_id=subject;
 else
 if unit is null or org_private.group_unit_company(p_group_id,unit) is distinct from c then raise exception 'Velg avdeling i personens firmagren.' using errcode='42501';end if;
 if jsonb_typeof(p_payload->'title') is distinct from 'string' or length(trim(p_payload->>'title')) not between 2 and 100 or jsonb_typeof(p_payload->'kind') is distinct from 'string' or p_payload->>'kind' not in ('leader','middle','employee','apprentice') then raise exception 'Kontroller stilling og rolle.' using errcode='22023';end if;
 insert into org_private.group_placements(group_id,company_id,user_id,unit_id,title,kind)values(p_group_id,c,subject,unit,trim(p_payload->>'title'),p_payload->>'kind') on conflict(group_id,company_id,user_id)do update set unit_id=excluded.unit_id,title=excluded.title,kind=excluded.kind;
 end if;
 end if;
 update org_private.groups set revision=revision+1 where id=p_group_id;
 return public.organization_group_state(p_company_id,p_group_id);
end$$;


create or replace function public.organization_state(p_company_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare x jsonb;units jsonb;people jsonb;members jsonb;
begin
 x:=org_private.require_context(p_company_id);
 select coalesce(jsonb_agg(jsonb_build_object('id',q.id,'parent_id',q.parent_id,'name',q.name,
  'manager_id',case when org_private.has_access(p_company_id,q.manager_id) then q.manager_id end,
  'manager_name',case when org_private.has_access(p_company_id,q.manager_id) then org_private.display_name(p_company_id,q.manager_id) end,'color',q.color,'sort_order',q.sort_order,
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


create or replace function public.organization_save_layout(p_company_id uuid,p_revision integer,p_payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare x jsonb;rev integer;items jsonb;removed uuid[];confirmed uuid[];written integer;
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
  exists(select 1 from jsonb_object_keys(v)k where k not in ('id','parent_id','name','manager_id','color','sort_order'))
  or v?'sort_order' and (jsonb_typeof(v->'sort_order') is distinct from 'number' or (v->>'sort_order') !~ '^(0|[1-9][0-9]?|100)$')
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
 insert into org_private.units(id,company_id,parent_id,name,manager_id,color,sort_order)
  select n.id,p_company_id,null,trim(n.name),n.manager_id,n.color,coalesce(n.sort_order,(select sort_order from org_private.units where id=n.id and company_id=p_company_id),0)
   from jsonb_to_recordset(items)as n(id uuid,parent_id uuid,name text,manager_id uuid,color text,sort_order integer)
  on conflict(id)do update set name=excluded.name,manager_id=excluded.manager_id,color=excluded.color,sort_order=excluded.sort_order where org_private.units.company_id=p_company_id;
 get diagnostics written=row_count;
 if written<>jsonb_array_length(items) then raise exception 'Avdelings-ID er allerede i bruk. Hent kartet på nytt.' using errcode='42501';end if;
 update org_private.units u set parent_id=n.parent_id from jsonb_to_recordset(items)as n(id uuid,parent_id uuid)
  where u.company_id=p_company_id and u.id=n.id;
 update org_private.placements set unit_id=null where company_id=p_company_id and unit_id=any(removed);
 delete from org_private.units where company_id=p_company_id and id=any(removed);
 insert into org_private.settings(company_id,revision,chart_name)values(p_company_id,1,trim(p_payload->>'chart_name'))
  on conflict(company_id)do update set revision=org_private.settings.revision+1,chart_name=excluded.chart_name;
 return public.organization_state(p_company_id);
end$$;


revoke all on function org_private.group_access(uuid,uuid,boolean),org_private.group_context(uuid,uuid,boolean) from public,anon,authenticated,service_role;
revoke all on function public.organization_state(uuid),public.organization_save_layout(uuid,integer,jsonb),public.organization_group_options(uuid),public.organization_group_state(uuid,uuid),public.organization_group_create(uuid,jsonb),public.organization_group_command(uuid,uuid,integer,text,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.organization_state(uuid),public.organization_save_layout(uuid,integer,jsonb),public.organization_group_options(uuid),public.organization_group_state(uuid,uuid),public.organization_group_create(uuid,jsonb),public.organization_group_command(uuid,uuid,integer,text,jsonb) to authenticated;
