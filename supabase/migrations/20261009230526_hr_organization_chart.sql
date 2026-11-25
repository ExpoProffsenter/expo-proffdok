-- KS/HMS organization metadata. HR is optional; private HR content remains closed.
create schema org_private;
revoke all on schema org_private from public,anon,authenticated,service_role;
create table org_private.settings (
 company_id uuid primary key references public.sales_company_scopes(id) on delete cascade,
 revision integer not null default 1 check(revision>0)
);
create table org_private.units (
 id uuid primary key default gen_random_uuid(),
 company_id uuid not null references public.sales_company_scopes(id) on delete cascade,
 parent_id uuid,
 name text not null check(length(trim(name)) between 2 and 80),
 manager_id uuid references auth.users(id) on delete set null,
 color text not null default 'teal' check(color in ('teal','blue','amber','violet','rose')),
 unique(company_id,id),
 foreign key(company_id,parent_id) references org_private.units(company_id,id),
 check(parent_id is distinct from id)
);
create index org_units_parent on org_private.units(company_id,parent_id);
create index org_units_manager on org_private.units(manager_id);
create table org_private.placements (
 company_id uuid not null,
 user_id uuid not null,
 unit_id uuid,
 leader_id uuid references auth.users(id) on delete set null,
 title text not null check(length(trim(title)) between 2 and 100),
 kind text not null check(kind in ('leader','middle','employee','apprentice')),
 primary key(company_id,user_id),
 foreign key(company_id,user_id) references public.sales_company_memberships(company_id,user_id) on delete cascade,
 foreign key(company_id,unit_id) references org_private.units(company_id,id),
 check(user_id is distinct from leader_id)
);
create index org_placements_unit on org_private.placements(company_id,unit_id);
create index org_placements_leader on org_private.placements(leader_id);
alter table org_private.settings enable row level security;
alter table org_private.units enable row level security;
alter table org_private.placements enable row level security;
revoke all on org_private.settings,org_private.units,org_private.placements from public,anon,authenticated,service_role;

create function org_private.has_access(c uuid,u uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select hr_private.active_member(c,u)
 and exists(select 1 from public.company_module_access where company_id=c and module_key='kshms' and enabled)
 and (exists(select 1 from public.sales_company_memberships where company_id=c and user_id=u and workspace_role='firmaadmin')
 or exists(select 1 from public.kshms_member_access where company_id=c and user_id=u and enabled))
$$;
create function org_private.require_context(c uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare x jsonb;
begin
 x:=kshms_private.require_context(c);
 if not org_private.has_access(c,auth.uid()) then raise exception 'Organisasjonskartet krever aktiv KS/HMS-tilgang i firmaet.' using errcode='42501';end if;
 return jsonb_build_object('company_id',c,'user_id',auth.uid(),'company_name',x->>'company_name','administer',coalesce((x->>'administer')::boolean,false));
end$$;
create function org_private.can_edit(c uuid,unit uuid,u uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select org_private.has_access(c,u) and (
 exists(select 1 from public.sales_company_memberships where company_id=c and user_id=u and workspace_role='firmaadmin')
 or exists(with recursive parents as (
   select id,parent_id,manager_id,array[id] path from org_private.units where company_id=c and id=unit
   union all select n.id,n.parent_id,n.manager_id,p.path||n.id from parents p
    join org_private.units n on n.company_id=c and n.id=p.parent_id
    where not n.id=any(p.path) and cardinality(p.path)<12
 ) select 1 from parents where manager_id=u))
$$;
create function org_private.display_name(c uuid,u uuid) returns text
language sql stable security definer set search_path='' as $$
 -- Display text only; never use user-editable metadata as an authorization claim.
 select left(coalesce(nullif(trim(case when jsonb_typeof(a.raw_user_meta_data->'full_name')='string'
   then a.raw_user_meta_data->>'full_name' end),''),p.email,'Medarbeider'),120)
 from public.profiles p join auth.users a on a.id=p.id where p.id=u and hr_private.active_member(c,u)
$$;
create function public.organization_state(p_company_id uuid) returns jsonb
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
  'units',units,'people',people,'members',members);
end$$;

create function public.organization_command(p_company_id uuid,p_revision integer,p_action text,p_payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare x jsonb;a boolean;rev integer;target uuid;parent uuid;manager uuid;unitrow org_private.units%rowtype;
 e hr_private.employees%rowtype;subject uuid;oldunit uuid;newunit uuid;leader uuid;oldleader uuid;keys text[];depth integer;height integer;
begin
 x:=org_private.require_context(p_company_id);
 -- Consistent order: optional HR firm before company row. HR leader/closure writes
 -- serialize on that same HR lock; KS-only companies need no HR registration.
 perform 1 from hr_private.firms where company_id=p_company_id for update;
 perform 1 from public.sales_company_scopes where id=p_company_id for update;
 x:=org_private.require_context(p_company_id);a:=(x->>'administer')::boolean;
 select revision into rev from org_private.settings where company_id=p_company_id;
 if p_revision is distinct from coalesce(rev,0) then raise exception 'Organisasjonskartet er endret. Hent på nytt.' using errcode='40001';end if;
 if jsonb_typeof(p_payload) is distinct from 'object' or pg_column_size(p_payload)>2500
  or p_action is null or p_action not in ('unit','remove_unit','place','unplace') then raise exception 'Ugyldig karthandling.' using errcode='22023';end if;
 keys:=case p_action when 'unit' then array['id','parent_id','name','manager_id','color'] when 'remove_unit' then array['id']
  when 'place' then array['employee_id','employee_revision','unit_id','title','kind','leader_id','confirm_leader_change']
  else array['employee_id','employee_revision'] end;
 if exists(select 1 from jsonb_object_keys(p_payload)k where not k=any(keys)) then raise exception 'Bare organisasjonsfelt kan lagres her.' using errcode='22023';end if;
 if p_action in ('unit','remove_unit') then
  target:=(p_payload->>'id')::uuid;
  if target is not null then
   select * into unitrow from org_private.units where company_id=p_company_id and id=target;
   if unitrow.id is null or not org_private.can_edit(p_company_id,target,auth.uid())
   then raise exception 'Avdelingen er ikke tilgjengelig for endring.' using errcode='42501';end if;
  end if;
  if p_action='remove_unit' then
   if target is null then raise exception 'Velg avdeling.' using errcode='22023';end if;
   if exists(select 1 from org_private.units where company_id=p_company_id and parent_id=target)
    or exists(select 1 from org_private.placements where company_id=p_company_id and unit_id=target)
   then raise exception 'Flytt medarbeidere og underavdelinger først.' using errcode='22023';end if;
   delete from org_private.units where company_id=p_company_id and id=target;
  else
   parent:=(p_payload->>'parent_id')::uuid;manager:=(p_payload->>'manager_id')::uuid;
   if parent is not null and not exists(select 1 from org_private.units where company_id=p_company_id and id=parent)
   then raise exception 'Velg avdeling i samme firma.' using errcode='42501';end if;
   if not a and (target is null and (parent is null or not org_private.can_edit(p_company_id,parent,auth.uid()))
     or target is not null and parent is distinct from unitrow.parent_id
     or manager is distinct from unitrow.manager_id)
   then raise exception 'Firmaadmin styrer avdelingsflytting og redigeringstilgang.' using errcode='42501';end if;
   if manager is not null and not org_private.has_access(p_company_id,manager)
   then raise exception 'Velg aktiv avdelingsleder med KS/HMS-tilgang.' using errcode='42501';end if;
   if target is null and (select count(*) from org_private.units where company_id=p_company_id)>=100
   then raise exception 'Maksimalt 100 avdelinger i denne kartversjonen.' using errcode='54000';end if;
   with recursive parents as (
    select id,parent_id,array[id] path from org_private.units where company_id=p_company_id and id=parent
    union all select n.id,n.parent_id,p.path||n.id from parents p join org_private.units n
      on n.company_id=p_company_id and n.id=p.parent_id where not n.id=any(p.path)
   ) select max(cardinality(path)),bool_or(id=target)::integer into depth,height from parents;
   if target=parent or coalesce(height,0)=1 then raise exception 'Avdelingsstrukturen kan ikke gå i ring.' using errcode='22023';end if;
   with recursive children as (
    select id,array[id] path from org_private.units where company_id=p_company_id and id=target
    union all select n.id,p.path||n.id from children p join org_private.units n
      on n.company_id=p_company_id and n.parent_id=p.id where not n.id=any(p.path)
   ) select coalesce(max(cardinality(path)),1) into height from children;
   if coalesce(depth,0)+height>12 then raise exception 'Avdelingsstrukturen kan ha maksimalt 12 nivåer.' using errcode='22023';end if;
   if target is null then
    insert into org_private.units(company_id,parent_id,name,manager_id,color)
     values(p_company_id,parent,trim(p_payload->>'name'),manager,p_payload->>'color');
   else update org_private.units set parent_id=parent,name=trim(p_payload->>'name'),manager_id=manager,color=p_payload->>'color'
    where company_id=p_company_id and id=target;end if;
  end if;
 else
  subject:=(p_payload->>'employee_id')::uuid;
  if not hr_private.active_member(p_company_id,subject) then raise exception 'Medarbeideren er ikke aktiv i firmaet.' using errcode='42501';end if;
  select * into e from hr_private.employees where company_id=p_company_id and user_id=subject;
  if coalesce(e.revision,0) is distinct from (p_payload->>'employee_revision')::integer then raise exception 'Medarbeideren eller lederen er endret. Hent på nytt.' using errcode='40001';end if;
  select unit_id,leader_id into oldunit,oldleader from org_private.placements where company_id=p_company_id and user_id=subject;
  if e.id is not null then oldleader:=e.leader_id;end if;
  newunit:=case when p_action='place' then (p_payload->>'unit_id')::uuid else oldunit end;
  if not a and (oldunit is null or not org_private.can_edit(p_company_id,oldunit,auth.uid())
    or newunit is null or not org_private.can_edit(p_company_id,newunit,auth.uid()))
  then raise exception 'Du kan bare plassere medarbeidere innen egen avdeling.' using errcode='42501';end if;
  if p_action='unplace' then
   update org_private.placements set unit_id=null where company_id=p_company_id and user_id=subject;
  else
   if newunit is null or not exists(select 1 from org_private.units where company_id=p_company_id and id=newunit)
   then raise exception 'Velg avdeling i samme firma.' using errcode='42501';end if;
   leader:=(p_payload->>'leader_id')::uuid;
   if leader is not null and not hr_private.active_member(p_company_id,leader)
   then raise exception 'Velg aktiv leder i samme firma.' using errcode='42501';end if;
   if leader is distinct from oldleader then
    if not a then raise exception 'Firmaadmin må bekrefte lederbytter.' using errcode='42501';end if;
    if jsonb_typeof(p_payload->'confirm_leader_change') is distinct from 'boolean' or p_payload->>'confirm_leader_change' is distinct from 'true'
    then raise exception 'Bekreft lederendringen før lagring.' using errcode='22023';end if;
    if subject=leader or exists(with recursive managers as (
      select leader id,array[leader] path
      union all select case when h.id is not null then h.leader_id else o.leader_id end,
       p.path||case when h.id is not null then h.leader_id else o.leader_id end from managers p
       left join hr_private.employees h on h.company_id=p_company_id and h.user_id=p.id
       left join org_private.placements o on o.company_id=p_company_id and o.user_id=p.id
       where (case when h.id is not null then h.leader_id else o.leader_id end)=any(p.path) is not true
       and case when h.id is not null then h.leader_id else o.leader_id end is not null
    )select 1 from managers where id=subject)
    then raise exception 'Lederlinjen kan ikke gå i ring.' using errcode='22023';end if;
    if e.id is not null then
     if leader is not null and not hr_private.has_module_access(p_company_id,leader) then raise exception 'Velg aktiv nærmeste leder med HR-modultilgang.' using errcode='42501';end if;
     -- The established HR RPC remains the sole authority for individual grants.
     perform public.hr_employee_command(p_company_id,'leader',jsonb_build_object('id',e.id,'revision',e.revision,
       'leader_id',leader,'clear_old_leader_reader',true));
    end if;
   end if;
   insert into org_private.placements(company_id,user_id,unit_id,leader_id,title,kind)
    values(p_company_id,subject,newunit,leader,trim(p_payload->>'title'),p_payload->>'kind')
    on conflict(company_id,user_id)do update set unit_id=excluded.unit_id,leader_id=excluded.leader_id,title=excluded.title,kind=excluded.kind;
  end if;
 end if;
 insert into org_private.settings(company_id,revision)values(p_company_id,1)
 on conflict(company_id)do update set revision=org_private.settings.revision+1;
 return public.organization_state(p_company_id);
end$$;

create function org_private.on_hr_leader() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if tg_op='INSERT' and exists(select 1 from org_private.placements where company_id=new.company_id and user_id=new.user_id and leader_id is distinct from new.leader_id)
 then raise exception 'Velg samme nærmeste leder som organisasjonskartet ved HR-registrering.' using errcode='22023';end if;
 if new.leader_id is not null and exists(with recursive managers as (
  select new.leader_id id,array[new.leader_id] path
  union all select case when h.id is not null then h.leader_id else o.leader_id end,
   p.path||case when h.id is not null then h.leader_id else o.leader_id end from managers p
   left join hr_private.employees h on h.company_id=new.company_id and h.user_id=p.id
   left join org_private.placements o on o.company_id=new.company_id and o.user_id=p.id
   where (case when h.id is not null then h.leader_id else o.leader_id end)=any(p.path) is not true
   and case when h.id is not null then h.leader_id else o.leader_id end is not null
 )select 1 from managers where id=new.user_id)
 then raise exception 'Lederlinjen kan ikke gå i ring.' using errcode='22023';end if;
 if tg_op='UPDATE' and new.leader_id is distinct from old.leader_id then
  update org_private.placements set leader_id=new.leader_id where company_id=new.company_id and user_id=new.user_id;
  if exists(select 1 from org_private.settings where company_id=new.company_id) then
   update org_private.settings set revision=revision+1 where company_id=new.company_id;
  end if;
 end if;
 return new;
end$$;
create trigger organization_hr_leader before insert or update of leader_id on hr_private.employees
 for each row execute function org_private.on_hr_leader();
create function org_private.on_employment_end() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 delete from org_private.placements where company_id=new.company_id and user_id=new.user_id;
 update org_private.placements set leader_id=null where company_id=new.company_id and leader_id=new.user_id;
 update org_private.units set manager_id=null where company_id=new.company_id and manager_id=new.user_id;
 if exists(select 1 from org_private.settings where company_id=new.company_id) then
  update org_private.settings set revision=revision+1 where company_id=new.company_id;
 end if;
 return new;
end$$;
create trigger organization_employment_end after insert on hr_private.closed_employments
 for each row execute function org_private.on_employment_end();
revoke all on function org_private.has_access(uuid,uuid),org_private.require_context(uuid),org_private.can_edit(uuid,uuid,uuid),org_private.display_name(uuid,uuid),org_private.on_hr_leader(),org_private.on_employment_end() from public,anon,authenticated,service_role;
revoke all on function public.organization_state(uuid),public.organization_command(uuid,integer,text,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.organization_state(uuid),public.organization_command(uuid,integer,text,jsonb) to authenticated;
