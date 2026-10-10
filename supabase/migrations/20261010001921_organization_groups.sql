-- Separate group charts. No company memberships, HR grants or existing charts are changed.
create table org_private.groups(id uuid primary key default gen_random_uuid(),name text not null check(length(trim(name)) between 2 and 100),revision integer not null default 1 check(revision>0));
create table org_private.group_companies(group_id uuid not null references org_private.groups(id) on delete cascade,company_id uuid not null references public.sales_company_scopes(id) on delete cascade,primary key(group_id,company_id));
create index org_group_company on org_private.group_companies(company_id,group_id);
create table org_private.group_units(id uuid primary key,group_id uuid not null references org_private.groups(id) on delete cascade,parent_id uuid,company_id uuid,name text not null check(length(trim(name)) between 2 and 80),manager_id uuid references auth.users(id) on delete set null,color text not null check(color in ('teal','blue','amber','violet','rose')),unique(group_id,id),foreign key(group_id,parent_id) references org_private.group_units(group_id,id),foreign key(group_id,company_id) references org_private.group_companies(group_id,company_id),check(id is distinct from parent_id));
create index org_group_unit_parent on org_private.group_units(group_id,parent_id);
create index org_group_unit_company on org_private.group_units(group_id,company_id);
create index org_group_unit_manager on org_private.group_units(manager_id);
create table org_private.group_placements(group_id uuid not null,company_id uuid not null,user_id uuid not null,unit_id uuid,title text not null check(length(trim(title)) between 2 and 100),kind text not null check(kind in ('leader','middle','employee','apprentice')),primary key(group_id,company_id,user_id),foreign key(group_id,company_id) references org_private.group_companies(group_id,company_id) on delete cascade,foreign key(company_id,user_id) references public.sales_company_memberships(company_id,user_id) on delete cascade,foreign key(group_id,unit_id) references org_private.group_units(group_id,id));
create index org_group_placement_user on org_private.group_placements(company_id,user_id);
create index org_group_placement_unit on org_private.group_placements(group_id,unit_id);
alter table org_private.groups enable row level security;
alter table org_private.group_companies enable row level security;
alter table org_private.group_units enable row level security;
alter table org_private.group_placements enable row level security;
revoke all on org_private.groups,org_private.group_companies,org_private.group_units,org_private.group_placements from public,anon,authenticated,service_role;

create function org_private.group_access(g uuid,u uuid,editing boolean default false) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from org_private.groups where id=g)
 and (select count(*) from org_private.group_companies where group_id=g) between 2 and 10
 and not exists(select 1 from org_private.group_companies f where f.group_id=g and
 (not org_private.has_access(f.company_id,u) or editing and not exists(select 1 from public.sales_company_memberships m where m.company_id=f.company_id and m.user_id=u and m.workspace_role='firmaadmin')))
$$;
create function org_private.group_context(c uuid,g uuid,editing boolean default false) returns jsonb language plpgsql security definer set search_path='' as $$
declare x jsonb;begin
 x:=org_private.require_context(c);
 if not exists(select 1 from org_private.group_companies where group_id=g and company_id=c) or not org_private.group_access(g,auth.uid(),editing) then raise exception 'Felleskartet krever KS/HMS i alle tilknyttede firmaer. Redigering krever firmaadmin i alle.' using errcode='42501';end if;
 return x||jsonb_build_object('group_id',g,'administer',org_private.group_access(g,auth.uid(),true));
end$$;
create function org_private.group_lock(g uuid) returns void language plpgsql security definer set search_path='' as $$begin
 -- Match established HR -> company lock order; UUID order within each class.
 perform f.company_id from hr_private.firms f join org_private.group_companies l on l.company_id=f.company_id where l.group_id=g order by f.company_id for update of f;
 perform c.id from public.sales_company_scopes c join org_private.group_companies l on l.company_id=c.id where l.group_id=g order by c.id for update of c;
 perform id from org_private.groups where id=g for update;
end$$;
create function org_private.group_unit_company(g uuid,n uuid) returns uuid language sql stable security definer set search_path='' as $$
 with recursive parents as(select id,parent_id,company_id,array[id] path from org_private.group_units where group_id=g and id=n
 union all select u.id,u.parent_id,u.company_id,p.path||u.id from parents p join org_private.group_units u on u.group_id=g and u.id=p.parent_id where not u.id=any(p.path) and cardinality(p.path)<12)
 select company_id from parents where company_id is not null order by cardinality(path) limit 1
$$;

create function org_private.group_manager(g uuid,n uuid,u uuid) returns boolean language sql stable security definer set search_path='' as $$select case when org_private.group_unit_company(g,n) is null then org_private.group_access(g,u) else org_private.has_access(org_private.group_unit_company(g,n),u) end$$;

create function public.organization_group_options(p_company_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare x jsonb;groups jsonb;firms jsonb;begin
 x:=org_private.require_context(p_company_id);
 select coalesce(jsonb_agg(jsonb_build_object('id',id,'name',name,'administer',org_private.group_access(id,auth.uid(),true)) order by name,id),'[]') into groups from(select g.id,g.name from org_private.groups g join org_private.group_companies l on l.group_id=g.id where l.company_id=p_company_id and org_private.group_access(g.id,auth.uid()) order by g.name,g.id limit 21) q;
 select coalesce(jsonb_agg(jsonb_build_object('id',id,'name',display_name) order by display_name,id),'[]') into firms from(select c.id,c.display_name from public.sales_company_scopes c join public.sales_company_memberships m on m.company_id=c.id where m.user_id=auth.uid() and m.workspace_role='firmaadmin' and org_private.has_access(c.id,auth.uid()) order by c.display_name,c.id limit 11)q;
 if jsonb_array_length(groups)>20 or jsonb_array_length(firms)>10 then raise exception 'Kontakt support for utvidet flerfirma-kart.' using errcode='54000';end if;
 return jsonb_build_object('context',x,'groups',groups,'companies',firms);
end$$;
create function public.organization_group_state(p_company_id uuid,p_group_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare x jsonb;units jsonb;people jsonb;members jsonb;firms jsonb;begin
 x:=org_private.group_context(p_company_id,p_group_id);
 select jsonb_agg(jsonb_build_object('id',c.id,'name',c.display_name) order by c.id) into firms from org_private.group_companies l join public.sales_company_scopes c on c.id=l.company_id where l.group_id=p_group_id;
 select coalesce(jsonb_agg(jsonb_build_object('id',q.id,'parent_id',q.parent_id,'company_id',q.company_id,'name',q.name,'color',q.color,'manager_id',case when org_private.group_manager(p_group_id,q.id,q.manager_id) then q.manager_id end,'manager_name',case when org_private.group_manager(p_group_id,q.id,q.manager_id) then org_private.display_name(coalesce(org_private.group_unit_company(p_group_id,q.id),p_company_id),q.manager_id) end,'editable',(x->>'administer')::boolean) order by q.name,q.id),'[]') into units from(select * from org_private.group_units where group_id=p_group_id order by name,id limit 101)q;
 select coalesce(jsonb_agg(jsonb_build_object('id',q.company_id::text||':'||q.user_id::text,'user_id',q.user_id,'company_id',q.company_id,'company_name',q.display_name,'name',org_private.display_name(q.company_id,q.user_id),'revision',0,'hr_registered',false,'leader_id',null,'unit_id',q.unit_id,'title',coalesce(q.title,'Medarbeider'),'kind',coalesce(q.kind,'employee')) order by q.company_id,q.user_id),'[]') into people from(
 select m.company_id,m.user_id,c.display_name,p.unit_id,p.title,p.kind from org_private.group_companies l join public.sales_company_scopes c on c.id=l.company_id join public.sales_company_memberships m on m.company_id=l.company_id left join org_private.group_placements p on p.group_id=l.group_id and p.company_id=m.company_id and p.user_id=m.user_id where l.group_id=p_group_id and hr_private.active_member(m.company_id,m.user_id) order by m.company_id,m.user_id limit 501)q;
 select coalesce(jsonb_agg(jsonb_build_object('id',q.user_id,'name',org_private.display_name(q.first_company,q.user_id),'company_ids',q.company_ids,'can_edit_chart',true,'can_lead_hr',false) order by q.user_id),'[]') into members from(select m.user_id,(array_agg(m.company_id order by m.company_id))[1] first_company,array_agg(m.company_id order by m.company_id) company_ids from org_private.group_companies l join public.sales_company_memberships m on m.company_id=l.company_id where l.group_id=p_group_id and org_private.has_access(m.company_id,m.user_id) group by m.user_id order by m.user_id limit 501)q;
 if jsonb_array_length(units)>100 or jsonb_array_length(people)>500 or jsonb_array_length(members)>500 then raise exception 'Felleskartet trenger utvidet paginering.' using errcode='54000';end if;
 return jsonb_build_object('context',x,'revision',(select revision from org_private.groups where id=p_group_id),'chart_name',(select name from org_private.groups where id=p_group_id),'companies',firms,'units',units,'people',people,'members',members);
end$$;

create function public.organization_group_create(p_company_id uuid,p_payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare g uuid;board uuid:=gen_random_uuid();ids uuid[];c uuid;name text;begin
 perform org_private.require_context(p_company_id);
 if jsonb_typeof(p_payload) is distinct from 'object' or exists(select 1 from jsonb_object_keys(p_payload) k where k not in ('id','name','company_ids','confirm')) or jsonb_typeof(p_payload->'confirm') is distinct from 'boolean' or p_payload->>'confirm' is distinct from 'true' or jsonb_typeof(p_payload->'company_ids') is distinct from 'array' or jsonb_typeof(p_payload->'name') is distinct from 'string' or length(trim(p_payload->>'name')) not between 2 and 100 or octet_length(p_payload::text)>5000 then raise exception 'Kontroller navnet, firmaene og bekreft opprettelsen.' using errcode='22023';end if;
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
 insert into org_private.groups(id,name)values(g,trim(p_payload->>'name'));
 insert into org_private.group_companies(group_id,company_id)select g,i from unnest(ids)i;
 insert into org_private.group_units(id,group_id,name,color)values(board,g,'Styret','violet');
 insert into org_private.group_units(id,group_id,parent_id,company_id,name,color)select gen_random_uuid(),g,board,c.id,left(c.display_name,80),'teal' from public.sales_company_scopes c where c.id=any(ids);
 return public.organization_group_state(p_company_id,g);
end$$;

create function public.organization_group_command(p_company_id uuid,p_group_id uuid,p_revision integer,p_action text,p_payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare x jsonb;items jsonb;item jsonb;ids uuid[];removed uuid[];confirmed uuid[];keys text[];written integer;c uuid;subject uuid;unit uuid;begin
 x:=org_private.group_context(p_company_id,p_group_id,true);
 perform org_private.group_lock(p_group_id);
 x:=org_private.group_context(p_company_id,p_group_id,true);
 if p_revision is distinct from (select revision from org_private.groups where id=p_group_id) then raise exception 'Felleskartet er endret. Hent på nytt.' using errcode='40001';end if;
 if jsonb_typeof(p_payload) is distinct from 'object' or octet_length(p_payload::text)>50000 or p_action is null or p_action not in ('layout','place','unplace','remove_group') then raise exception 'Ugyldig felleskarthandling.' using errcode='22023';end if;
 keys:=case p_action when 'layout' then array['chart_name','units','removed_ids','confirm_removal'] when 'place' then array['employee_id','company_id','user_id','unit_id','title','kind'] when 'unplace' then array['employee_id','company_id','user_id'] else array['confirm'] end;
 if exists(select 1 from jsonb_object_keys(p_payload) k where not k=any(keys)) then raise exception 'Bare felleskartfelt kan lagres.' using errcode='22023';end if;
 if p_action='remove_group' then
 if jsonb_typeof(p_payload->'confirm') is distinct from 'boolean' or p_payload->>'confirm' is distinct from 'true' then raise exception 'Bekreft sletting av felleskartet.' using errcode='22023';end if;
 delete from org_private.group_placements where group_id=p_group_id;
 update org_private.group_units set parent_id=null where group_id=p_group_id;
 delete from org_private.groups where id=p_group_id;
 return public.organization_group_options(p_company_id);
 elsif p_action='layout' then
 items:=p_payload->'units';
 if jsonb_typeof(items) is distinct from 'array' or jsonb_array_length(items)>100 or jsonb_typeof(p_payload->'chart_name') is distinct from 'string' or length(trim(p_payload->>'chart_name')) not between 2 and 100 then raise exception 'Kontroller toppnavn og maks 100 avdelinger.' using errcode='22023';end if;
 for item in select value from jsonb_array_elements(items) loop
 if jsonb_typeof(item) is distinct from 'object' or exists(select 1 from jsonb_object_keys(item) k where k not in ('id','parent_id','company_id','name','manager_id','color')) or jsonb_typeof(item->'id') is distinct from 'string' or jsonb_typeof(item->'name') is distinct from 'string' or length(trim(item->>'name')) not between 2 and 80 or jsonb_typeof(item->'color') is distinct from 'string' or item->>'color' not in ('teal','blue','amber','violet','rose') or exists(select 1 from unnest(array['parent_id','company_id','manager_id']) k where item?k and jsonb_typeof(item->k) not in ('string','null')) then raise exception 'Kontroller kortfeltene.' using errcode='22023';end if;
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
 insert into org_private.group_units(id,group_id,parent_id,company_id,name,manager_id,color) select (v->>'id')::uuid,p_group_id,null,(v->>'company_id')::uuid,trim(v->>'name'),(v->>'manager_id')::uuid,v->>'color' from jsonb_array_elements(items)v
 on conflict(id)do update set company_id=excluded.company_id,name=excluded.name,manager_id=excluded.manager_id,color=excluded.color where org_private.group_units.group_id=p_group_id;
 get diagnostics written=row_count;if written<>jsonb_array_length(items) then raise exception 'Kort-ID kolliderer med annet kart.' using errcode='42501';end if;
 update org_private.group_units u set parent_id=(v->>'parent_id')::uuid from jsonb_array_elements(items)v where u.group_id=p_group_id and u.id=(v->>'id')::uuid;
 update org_private.group_placements set unit_id=null where group_id=p_group_id and unit_id=any(removed);
 delete from org_private.group_units where group_id=p_group_id and id=any(removed);
 if exists(select 1 from org_private.group_units u where u.group_id=p_group_id and u.manager_id is not null and not org_private.group_manager(p_group_id,u.id,u.manager_id)) then raise exception 'Velg kartleder med KS/HMS i grenen, eller alle firmaer for et felles nivå.' using errcode='42501';end if;
 -- Moving a company boundary must not silently move a person's placement to another firm.
 if exists(select 1 from org_private.group_placements p where p.group_id=p_group_id and p.unit_id is not null and org_private.group_unit_company(p_group_id,p.unit_id) is distinct from p.company_id) then raise exception 'Flytt medarbeiderne før du endrer firma på en gren.' using errcode='22023';end if;
 update org_private.groups set name=trim(p_payload->>'chart_name') where id=p_group_id;
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
revoke all on function org_private.group_manager(uuid,uuid,uuid),org_private.group_access(uuid,uuid,boolean),org_private.group_context(uuid,uuid,boolean),org_private.group_lock(uuid),org_private.group_unit_company(uuid,uuid) from public,anon,authenticated,service_role;
revoke all on function public.organization_group_options(uuid),public.organization_group_state(uuid,uuid),public.organization_group_create(uuid,jsonb),public.organization_group_command(uuid,uuid,integer,text,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.organization_group_options(uuid),public.organization_group_state(uuid,uuid),public.organization_group_create(uuid,jsonb),public.organization_group_command(uuid,uuid,integer,text,jsonb) to authenticated;
