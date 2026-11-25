-- Project planner: same public plan/portal contract, internal assignments stay private.
create schema if not exists progress_private;
revoke all on schema progress_private from public,anon,authenticated;
create table progress_private.assignments(
 project_id uuid not null references public.project_progress_plans(project_id) on delete cascade,
 activity_id text not null,user_id uuid not null references auth.users(id) on delete cascade,
 primary key(project_id,activity_id,user_id));
create index assignments_user_project on progress_private.assignments(user_id,project_id);
alter table progress_private.assignments enable row level security;
revoke all on table progress_private.assignments from public,anon,authenticated;
alter table public.project_progress_plans add column revision bigint not null default 0;
create function progress_private.bump_revision() returns trigger language plpgsql set search_path='' as $$begin
 new.revision:=case when tg_op='INSERT' then 1 else old.revision+1 end;return new;end$$;
create trigger project_progress_revision before insert or update on public.project_progress_plans for each row execute function progress_private.bump_revision();
revoke all on function progress_private.bump_revision() from public,anon,authenticated;
create function progress_private.member(c uuid,u uuid) returns boolean language sql stable set search_path='' as $$
 select exists(select 1 from public.sales_company_memberships m join public.profiles p on p.id=m.user_id
 where m.company_id=c and m.user_id=u and p.approved and not coalesce(p.deactivated,false)
 and p.role in ('admin','member','ansatt','firmaadmin') and m.workspace_role in ('firmaadmin','ansatt'));
$$;
create function progress_private.context(c uuid) returns jsonb language plpgsql stable set search_path='' as $$begin
 if auth.uid() is null or c is distinct from public.current_active_company_scope_id() or not (progress_private.member(c,auth.uid()) or exists(select 1 from public.profiles p where p.id=auth.uid() and p.approved and not coalesce(p.deactivated,false) and p.system_role='systemadmin'))
 then raise exception 'Aktiv arbeidsprofil eller firmatilgang er endret.' using errcode='42501';end if;
 return jsonb_build_object('company_id',c,'user_id',auth.uid(),'enabled',true);
end$$;
create function progress_private.with_assignments(id uuid,p jsonb) returns jsonb language sql stable set search_path='' as $$
 select p||jsonb_build_object('activities',coalesce((select jsonb_agg(a||jsonb_build_object('assigneeIds',coalesce((select jsonb_agg(x.user_id::text order by x.user_id) from progress_private.assignments x where x.project_id=id and x.activity_id=a->>'id'),'[]'::jsonb)) order by ord) from jsonb_array_elements(p->'activities') with ordinality z(a,ord)),'[]'::jsonb));
$$;
create function public.project_progress_editor(p_project_id uuid,p_plan jsonb default null,p_customer_visible boolean default null,p_revision bigint default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare pr public.projects%rowtype;r public.project_progress_plans%rowtype;ctx jsonb;a jsonb;u jsonb;uid uuid;stored jsonb;people jsonb;begin
 select * into pr from public.projects where id=p_project_id for update;
 if not found or not public.project_progress_plan_access_allowed(p_project_id) then raise exception 'Prosjektet er ikke tilgjengelig.' using errcode='42501';end if;
 ctx:=progress_private.context(pr.company_scope_id);
 select * into r from public.project_progress_plans where project_id=p_project_id for update;
 if p_plan is not null then
  if not public.project_progress_plan_write_allowed(p_project_id) then raise exception 'Prosjektet er låst eller tilgangen er endret.' using errcode='42501';end if;
  if p_revision is distinct from coalesce(r.revision,0) then raise exception 'Planen er endret i en annen økt. Kladden er beholdt. Hent siste lagrede plan.' using errcode='40001';end if;
  if jsonb_typeof(p_plan) is distinct from 'object' or jsonb_typeof(p_plan->'activities') is distinct from 'array' then raise exception 'Ugyldig plan.' using errcode='22023';end if;
  if jsonb_array_length(p_plan->'activities')>500 or octet_length(p_plan::text)>2000000 then raise exception 'Planen er for stor.' using errcode='22023';end if;
  if p_plan ? 'excludeSundays' and jsonb_typeof(p_plan->'excludeSundays')<>'boolean' then raise exception 'Ugyldig søndagsvalg.' using errcode='22023';end if;
  if exists(select 1 from jsonb_array_elements(p_plan->'activities') z group by z->>'id' having count(*)>1) then raise exception 'Oppgavene må ha ulike ID-er.' using errcode='22023';end if;
  for a in select value from jsonb_array_elements(p_plan->'activities') loop
   if jsonb_typeof(a) is distinct from 'object' or coalesce(a->>'id','')='' or length(a->>'id')>200 or coalesce(trim(a->>'title'),'')='' or length(a->>'title')>200 or jsonb_typeof(a->'sessions') is distinct from 'array' then raise exception 'Ugyldig arbeidsoperasjon.' using errcode='22023';end if;
   if a ? 'crewSize' and a->'crewSize'<>'null'::jsonb and (jsonb_typeof(a->'crewSize')<>'number' or a->>'crewSize' !~ '^[0-9]{1,3}$' or (a->>'crewSize')::int<1) then raise exception 'Antall personer må være 1–999.' using errcode='22023';end if;
   if a ? 'nsCode' and coalesce(a->>'nsCode','')<>'' and (a->>'nsCode' !~ '^[2-7][0-9]{1,3}$' or coalesce(a->>'nsKind','building') not in ('building','system')) then raise exception 'Ugyldig NS-kode.' using errcode='22023';end if;
   if a ? 'assigneeIds' and (jsonb_typeof(a->'assigneeIds')<>'array' or jsonb_array_length(a->'assigneeIds')>50) then raise exception 'Velg høyst 50 deltakere.' using errcode='22023';end if;
   if exists(select 1 from jsonb_array_elements(coalesce(a->'assigneeIds','[]')) z group by z having count(*)>1) then raise exception 'Deltakere kan ikke gjentas.' using errcode='22023';end if;
   for u in select value from jsonb_array_elements(coalesce(a->'assigneeIds','[]')) loop
    if jsonb_typeof(u)<>'string' or u#>>'{}' !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then raise exception 'Ugyldig deltaker-ID.' using errcode='22023';end if;
    uid:=(u#>>'{}')::uuid;
    if not progress_private.member(pr.company_scope_id,uid) and not exists(select 1 from progress_private.assignments x where x.project_id=p_project_id and x.activity_id=a->>'id' and x.user_id=uid)
    then raise exception 'Deltakeren må være aktiv i prosjektets firma.' using errcode='42501';end if;
   end loop;
   for u in select value from jsonb_array_elements(a->'sessions') loop
    if coalesce(u->>'date','') !~ '^\d{4}-\d{2}-\d{2}$' or to_char((u->>'date')::date,'YYYY-MM-DD')<>u->>'date' or coalesce(u->>'startTime','') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' or coalesce(u->>'endTime','') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' or u->>'startTime'>=u->>'endTime' then raise exception 'Ugyldig dato eller klokkeslett.' using errcode='22023';end if;
    if p_plan->>'excludeSundays'='true' and extract(isodow from (u->>'date')::date)=7 then raise exception 'Fjern søndagsøkter før lagring.' using errcode='22023';end if;
   end loop;
  end loop;
  stored:=p_plan||jsonb_build_object('activities',coalesce((select jsonb_agg(z.a-'assigneeIds' order by z.ord) from jsonb_array_elements(p_plan->'activities') with ordinality z(a,ord)),'[]'::jsonb));
  insert into public.project_progress_plans(project_id,company_scope_id,plan,customer_visible) values(p_project_id,pr.company_scope_id,stored,coalesce(p_customer_visible,false))
  on conflict(project_id) do update set plan=excluded.plan,customer_visible=excluded.customer_visible returning * into r;
  delete from progress_private.assignments where project_id=p_project_id;
  insert into progress_private.assignments select p_project_id,z.item->>'id',(w.item#>>'{}')::uuid from jsonb_array_elements(p_plan->'activities') z(item) cross join lateral jsonb_array_elements(coalesce(z.item->'assigneeIds','[]')) w(item);
 end if;
 select coalesce(jsonb_agg(jsonb_build_object('id',p.id,'name',coalesce(nullif(trim(concat_ws(' ',to_jsonb(p)->>'first_name',to_jsonb(p)->>'last_name')),''),nullif(to_jsonb(p)->>'full_name',''),split_part(p.email,'@',1))) order by p.id),'[]') into people from public.sales_company_memberships m join public.profiles p on p.id=m.user_id where m.company_id=pr.company_scope_id and progress_private.member(pr.company_scope_id,p.id);
 return jsonb_build_object('context',ctx,'people',people,'record',jsonb_build_object('id',pr.id,'company_id',pr.company_scope_id,'revision',coalesce(r.revision,0),'locked',coalesce(pr.locked,false),'customerVisible',coalesce(r.customer_visible,false),'plan',progress_private.with_assignments(pr.id,coalesce(r.plan,'{"version":1,"activities":[],"excludeSundays":true}'::jsonb))));
end$$;
create function public.project_progress_mine(p_company_id uuid,p_id uuid default null,p_after uuid default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare ctx jsonb;items jsonb;today date:=(now() at time zone 'Europe/Oslo')::date;begin
 ctx:=progress_private.context(p_company_id);
 with mine as (
 select p.*,pr.title,pr.data,progress_private.with_assignments(p.project_id,p.plan) internal_plan from public.project_progress_plans p join public.projects pr on pr.id=p.project_id
 where p.company_scope_id=p_company_id and not coalesce(pr.locked,false) and (p_id is null or p.project_id=p_id) and (p_after is null or p.project_id>p_after)
 and exists(select 1 from progress_private.assignments x where x.project_id=p.project_id and x.user_id=auth.uid())
 ), own as (
 select m.*,m.internal_plan||jsonb_build_object('source',null,'activities',(select coalesce(jsonb_agg(a||jsonb_build_object('assigneeIds',jsonb_build_array(auth.uid()::text)) order by ord),'[]') from jsonb_array_elements(internal_plan->'activities') with ordinality z(a,ord) where a->'assigneeIds' @> jsonb_build_array(auth.uid()::text))) personal_plan from mine m
 ), active as (
 select o.*,b.first_date,b.last_date from own o cross join lateral(select min(s->>'date') first_date,max(s->>'date') last_date from jsonb_array_elements(personal_plan->'activities') a cross join lateral jsonb_array_elements(a->'sessions') s where a->>'status'<>'Ferdig') b where today::text between b.first_date and b.last_date order by project_id limit 101
 ) select coalesce(jsonb_agg(jsonb_build_object('id',project_id,'company_id',company_scope_id,'title',coalesce(nullif(data#>>'{project,projectName}',''),title),'address',data#>>'{project,address}','reference',data#>>'{project,salesOrigin,requestRef}','revision',revision,'first_date',first_date,'last_date',last_date)||case when p_id is not null then jsonb_build_object('plan',personal_plan) else '{}'::jsonb end order by project_id),'[]') into items from active;
 if p_id is not null and jsonb_array_length(items)=0 then raise exception 'Du har ingen aktive oppgaver i dette prosjektet nå.' using errcode='42501';end if;
 return jsonb_build_object('context',ctx,'active_date',today,'record',case when p_id is not null then items->0 else null end,'plans',case when p_id is null then (select coalesce(jsonb_agg(v order by ord),'[]') from jsonb_array_elements(items) with ordinality z(v,ord) where ord<=100) else '[]'::jsonb end,'next',case when jsonb_array_length(items)>100 then items->99->>'id' else null end);
end$$;
revoke all on all functions in schema progress_private from public,anon,authenticated;
revoke all on function public.project_progress_editor(uuid,jsonb,boolean,bigint),public.project_progress_mine(uuid,uuid,uuid) from public,anon;
grant execute on function public.project_progress_editor(uuid,jsonb,boolean,bigint),public.project_progress_mine(uuid,uuid,uuid) to authenticated;

-- An assigned worker can use Min side without a KS/HMS or HR license; other rights remain unchanged.
create or replace function public.get_my_personal_context() returns jsonb
language plpgsql security definer set search_path='' as $$
declare c uuid:=public.current_active_company_scope_id();u uuid:=auth.uid();admin boolean;ks boolean;hr boolean;usable_hr boolean;
begin
 if u is null or c is null or not exists(select 1 from public.sales_company_memberships m join public.profiles p on p.id=m.user_id
  where m.company_id=c and m.user_id=u and m.workspace_role in ('firmaadmin','ansatt')
  and p.approved and not coalesce(p.deactivated,false) and p.role in ('admin','member','ansatt','firmaadmin'))
 then raise exception 'Aktiv intern bruker og arbeidsprofil kreves.' using errcode='42501';end if;
 select workspace_role='firmaadmin' into admin from public.sales_company_memberships where company_id=c and user_id=u;
 ks:=exists(select 1 from public.company_module_access where company_id=c and module_key='kshms' and enabled);
 hr:=exists(select 1 from public.company_module_access where company_id=c and module_key='hr' and enabled);
 usable_hr:=hr_private.has_module_access(c,u) and (admin or exists(select 1 from hr_private.firms where company_id=c and enabled));
 return jsonb_build_object('company_id',c,'user_id',u,'company_name',(select display_name from public.sales_company_scopes where id=c),
  'personal_page',ks or hr or exists(select 1 from progress_private.assignments x join public.projects pr on pr.id=x.project_id where x.user_id=u and pr.company_scope_id=c and not coalesce(pr.locked,false)),'company_kshms',ks,'company_hr',hr,
  'hr_management',usable_hr and (admin or exists(select 1 from hr_private.employees e
   where e.company_id=c and e.leader_id=u and hr_private.active_member(c,e.user_id))), 'content_enabled',false);
end$$;
