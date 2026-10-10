-- Stable company routine references are independent of edition numbers.
alter table public.kshms_routines add column reference_number bigint;
with numbered as (
 select id,row_number() over(partition by company_id order by updated_at,id) n from public.kshms_routines
) update public.kshms_routines r set reference_number=n.n from numbered n where r.id=n.id;
alter table public.kshms_routines alter column reference_number set not null;
alter table public.kshms_routines add constraint kshms_routines_reference_positive check(reference_number>0);
alter table public.kshms_routines add constraint kshms_routines_company_reference_unique unique(company_id,reference_number);
create function kshms_private.routine_reference() returns trigger language plpgsql set search_path='' as $$
begin
 if tg_op='UPDATE' then
  if new.company_id is distinct from old.company_id or new.reference_number is distinct from old.reference_number then raise exception 'Rutinenummeret og firmaet kan ikke endres.' using errcode='42501'; end if;
 else
  perform pg_advisory_xact_lock(hashtextextended('kshms-routine-reference:'||new.company_id::text,0));
  select coalesce(max(reference_number),0)+1 into new.reference_number from public.kshms_routines where company_id=new.company_id;
 end if;
 return new;
end $$;
create trigger kshms_routine_reference before insert or update of reference_number,company_id on public.kshms_routines for each row execute function kshms_private.routine_reference();
revoke all on function kshms_private.routine_reference() from public,anon,authenticated;

-- Only the current actor's actual projects and current approved, accessible editions.
create function public.kshms_job_choices(p_company_id uuid,p_project_query text default '') returns jsonb language plpgsql security definer set search_path='' as $$
declare x jsonb; projects jsonb; project_total bigint; routines jsonb;
begin
 x:=kshms_private.require_context(p_company_id);
 if length(coalesce(p_project_query,''))>160 then raise exception 'Prosjektsøket er for langt.'; end if;
 with visible as (
  select p.id,coalesce(nullif(p.data#>>'{project,projectName}',''),p.title,'Prosjekt uten navn') name,coalesce(p.data#>>'{project,address}','') address,p.updated_at
  from public.projects p where p.company_scope_id=p_company_id and public.project_row_access_allowed(p.company_scope_id,p.user_id)
  and not coalesce(p.locked,false) and not coalesce((p.data#>>'{project,locked}')::boolean,false)
  and coalesce(p.data#>>'{project,status}','active') not in ('locked','closed','archived','cancelled')
  and coalesce(p.data#>>'{project,workflowStatus}','Pågår') not in ('Ferdigstilt')
  and (coalesce(p_project_query,'')='' or strpos(lower(coalesce(p.data#>>'{project,projectName}','')||' '||coalesce(p.title,'')||' '||coalesce(p.data#>>'{project,address}','')),lower(p_project_query))>0)
 ), recent as (select * from visible order by updated_at desc nulls last,id limit 200)
 select (select count(*) from visible),coalesce(jsonb_agg(jsonb_build_object('id',id,'name',name,'address',address) order by name,id),'[]') into project_total,projects from recent;
 with current_editions as (
  select distinct on (v.routine_id) v.* from public.kshms_versions v where v.company_id=p_company_id order by v.routine_id,v.number desc
 ) select coalesce(jsonb_agg(jsonb_build_object('id',v.id,'routine_id',v.routine_id,'reference_number',r.reference_number,'number',v.number,'content',v.content,'published_at',v.published_at) order by r.reference_number),'[]') into routines
 from current_editions v join public.kshms_routines r on r.id=v.routine_id and r.company_id=p_company_id and not r.archived
 where (x->>'manage')::boolean or exists(select 1 from public.kshms_assignments a where a.company_id=p_company_id and a.version_id=v.id and a.user_id=(select auth.uid()));
 return jsonb_build_object('context',x,'projects',projects,'project_total',project_total,'routines',routines);
end $$;
revoke all on function public.kshms_job_choices(uuid,text) from public,anon;
grant execute on function public.kshms_job_choices(uuid,text) to authenticated;

-- RUH uses the same responsible, history, closure and notification domain as deviations.
alter table public.kshms_deviations add column project_reference text not null default '' check(length(project_reference)<=4000);
alter table public.kshms_deviations add column routines text not null default '' check(length(routines)<=4000);

CREATE OR REPLACE FUNCTION public.kshms_get_state(p_company_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare x jsonb; mg boolean;
begin
 x:=kshms_private.require_context(p_company_id); mg:=(x->>'manage')::boolean;
 return jsonb_build_object('context',x,
 'settings',(select to_jsonb(s) from public.kshms_settings s where s.company_id=p_company_id),
 'routines',(select coalesce(jsonb_agg(case when mg then to_jsonb(r) else jsonb_build_object('id',r.id,'company_id',r.company_id,'archived',r.archived,'reference_number',r.reference_number) end order by r.updated_at desc),'[]') from public.kshms_routines r where r.company_id=p_company_id and (mg or exists(select 1 from public.kshms_assignments a where a.company_id=p_company_id and a.user_id=auth.uid() and a.version_id in(select id from public.kshms_versions where routine_id=r.id)))),
 'versions',(select coalesce(jsonb_agg(to_jsonb(v)||jsonb_build_object('publisher_identity',coalesce(v.publisher_identity,kshms_private.identity_snapshot(v.published_by)||jsonb_build_object('source','current_account'))) order by v.number desc),'[]') from public.kshms_versions v where v.company_id=p_company_id and (mg or exists(select 1 from public.kshms_assignments a where a.version_id=v.id and a.user_id=auth.uid()))),
 'assignments',(select coalesce(jsonb_agg(to_jsonb(a)),'[]') from public.kshms_assignments a where a.company_id=p_company_id and (mg or a.user_id=auth.uid())),
 'acknowledgments',(select coalesce(jsonb_agg(to_jsonb(a)||jsonb_build_object('user_identity',coalesce(a.user_identity,kshms_private.identity_snapshot(a.user_id)||jsonb_build_object('source','current_account')))),'[]') from public.kshms_acknowledgments a where a.company_id=p_company_id and (mg or a.user_id=auth.uid())),
 'reviews',(select coalesce(jsonb_agg(to_jsonb(r) order by r.signed_at desc),'[]') from public.kshms_reviews r where r.company_id=p_company_id and mg),
 'members',(select coalesce(jsonb_agg(jsonb_build_object('id',p.id,'email',p.email,'name',kshms_private.identity_snapshot(p.id)->>'name','workspace_role',m.workspace_role,'role',a.role,'enabled',coalesce(a.enabled,false)) order by p.email),'[]') from public.sales_company_memberships m join public.profiles p on p.id=m.user_id left join public.kshms_member_access a on a.company_id=m.company_id and a.user_id=m.user_id where m.company_id=p_company_id and p.approved and not coalesce(p.deactivated,false) and p.role in ('admin','member','ansatt','firmaadmin') and mg));
end $function$
;

create or replace function public.kshms_deviation_command(p_company_id uuid,p_action text,p_payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare x jsonb;d public.kshms_deviations%rowtype;old_d public.kshms_deviations%rowtype;p public.projects%rowtype;
 target uuid;handler uuid;project_id uuid;object_id uuid;source_kind text;source_key text;source_group text;source_item text;source_snapshot jsonb;new_status text;event_action text;
begin
 x:=kshms_private.require_context(p_company_id);
 if jsonb_typeof(p_payload) is distinct from 'object' or octet_length(p_payload::text)>100000 then raise exception 'Invalid case payload';end if;
 -- Lock in the same order as activation/member commands. Recheck on the lock.
 perform 1 from public.company_module_access where company_id=p_company_id and module_key='kshms' for update;
 x:=kshms_private.require_context(p_company_id);
 if p_action='create' then
  select * into d from public.kshms_deviations where company_id=p_company_id and created_by=auth.uid() and request_id=(p_payload->>'request_id')::uuid;
  if d.id is not null then return to_jsonb(d);end if;
  target:=(p_payload->>'responsible_id')::uuid;handler:=coalesce(nullif(p_payload->>'handler_id','')::uuid,target);
  if not kshms_private.deviation_member(p_company_id,target) or not kshms_private.deviation_member(p_company_id,handler) then raise exception 'Choose an active employee with KS/HMS access' using errcode='42501';end if;
  project_id:=nullif(p_payload->>'project_id','')::uuid;
  source_kind:=coalesce(p_payload->>'source_kind','company');source_key:=nullif(p_payload->>'source_key','');
  if project_id is not null then
   select * into p from public.projects where id=project_id and company_scope_id=p_company_id for update;
   if p.id is null or not public.project_row_access_allowed(p.company_scope_id,p.user_id) then raise exception 'Project access denied' using errcode='42501';end if;
   if p.locked or coalesce((p.data#>>'{project,locked}')::boolean,false) then raise exception 'Unlock the project before changing a linked deviation';end if;
  end if;
  if source_kind='project' then
   select e into source_snapshot from jsonb_array_elements(coalesce(p.data#>'{project,projectDeviations}','[]')) e where e->>'id'=source_key;
   if source_snapshot is null or coalesce(source_snapshot->>'status','Åpent')='Lukket' then raise exception 'Save an open project deviation before linking it';end if;
  elsif source_kind='checklist' then
   source_group:=nullif(p_payload->>'source_group','');source_item:=nullif(p_payload->>'source_item','');
   source_key:=jsonb_build_array(source_group,source_item)::text;
   source_snapshot:=p.data#>array['checklist',source_group,source_item];
   if source_snapshot is null or source_snapshot->>'status' is distinct from 'Avvik' then raise exception 'Save an open checklist deviation before linking it';end if;
  elsif source_kind<>'company' then raise exception 'Invalid source type';
  end if;
  if source_kind<>'company' then
   select * into d from public.kshms_deviations where company_id=p_company_id and kshms_deviations.project_id=project_id and kshms_deviations.source_kind=source_kind and kshms_deviations.source_key=source_key;
   if d.id is not null then
    if not kshms_private.deviation_visible(d,x) then raise exception 'Case access denied' using errcode='42501';end if;
    return to_jsonb(d);
   end if;
  end if;
  insert into public.kshms_deviations(company_id,request_id,title,event,category,immediate_action,responsible_id,handler_id,responsible_identity,handler_identity,due_on,project_id,source_kind,source_key,source_group,source_item,source_snapshot,created_by,creator_identity,project_reference,routines)
  values(p_company_id,(p_payload->>'request_id')::uuid,trim(p_payload->>'title'),trim(p_payload->>'event'),p_payload->>'category',coalesce(p_payload->>'immediate_action',''),target,handler,kshms_private.identity_snapshot(target),kshms_private.identity_snapshot(handler),(p_payload->>'due_on')::date,project_id,source_kind,source_key,source_group,source_item,source_snapshot,auth.uid(),kshms_private.identity_snapshot(auth.uid()),coalesce(p_payload->>'project_reference',''),coalesce(p_payload->>'routines','')) returning * into d;
  event_action:='create';
 elsif p_action in ('save','close','reopen') then
  object_id:=(p_payload->>'id')::uuid;
  -- Project lock precedes case lock in both create/update, avoiding a reverse lock order.
  select * into d from public.kshms_deviations where id=object_id and company_id=p_company_id;
  if d.id is null or not kshms_private.deviation_visible(d,x) then raise exception 'Case access denied' using errcode='42501';end if;
  if d.project_id is not null then
   if d.source_kind='company' then perform kshms_private.project_checklist_access(p_company_id,d.project_id,true); end if;
   select * into p from public.projects where id=d.project_id for update;
   if p.locked or coalesce((p.data#>>'{project,locked}')::boolean,false) then raise exception 'Unlock the project before changing a linked deviation';end if;
  end if;
  select * into d from public.kshms_deviations where id=object_id and company_id=p_company_id for update;
  if d.revision is distinct from (p_payload->>'revision')::bigint then raise exception 'Case changed; reload before saving' using errcode='40001';end if;
  if not (x->>'manage')::boolean and d.responsible_id<>auth.uid() then raise exception 'Assigned responsible or KS/HMS manager required' using errcode='42501';end if;
  if p_action='close' and d.responsible_id<>auth.uid() then raise exception 'Only the assigned responsible can close this case' using errcode='42501';end if;
  if d.status='closed' and p_action<>'reopen' then raise exception 'Closed case: reopen explicitly before editing';end if;
  old_d:=d;
  if p_action='reopen' then
   if not (x->>'manage')::boolean then raise exception 'KS/HMS manager required for reopening' using errcode='42501';end if;
   if d.status<>'closed' or length(trim(coalesce(p_payload->>'reason','')))<10 then raise exception 'Explain why the closed case is reopened';end if;
   target:=coalesce(nullif(p_payload->>'responsible_id','')::uuid,d.responsible_id);
   if not kshms_private.deviation_member(p_company_id,target) then raise exception 'Choose an active employee with KS/HMS access' using errcode='42501';end if;
   update public.kshms_deviations set status='open',responsible_id=target,
    responsible_identity=case when target<>responsible_id then kshms_private.identity_snapshot(target) else responsible_identity end,
    due_on=coalesce((p_payload->>'due_on')::date,due_on),closed_by=null,closed_identity=null,closed_at=null,control_note='',
    revision=revision+1,assignment_number=assignment_number+1,updated_at=now(),follow_up=follow_up||E'\nGjenåpnet: '||trim(p_payload->>'reason') where id=d.id returning * into d;
  else
   target:=coalesce(nullif(p_payload->>'responsible_id','')::uuid,d.responsible_id);handler:=coalesce(nullif(p_payload->>'handler_id','')::uuid,d.handler_id);
   if (target<>d.responsible_id or handler<>d.handler_id) and not (x->>'manage')::boolean then raise exception 'KS/HMS manager required for reassignment' using errcode='42501';end if;
   if (target<>d.responsible_id and not kshms_private.deviation_member(p_company_id,target)) or (handler<>d.handler_id and not kshms_private.deviation_member(p_company_id,handler)) then raise exception 'Choose an active employee with KS/HMS access' using errcode='42501';end if;
   new_status:=case when p_action='close' then 'closed' else coalesce(p_payload->>'status','in_progress') end;
   if p_action='save' and new_status not in('open','in_progress') then raise exception 'Use explicit controlled closure';end if;
   if p_action='close' then
    if jsonb_typeof(p_payload->'controlled') is distinct from 'boolean' or p_payload->>'controlled'<>'true'
     or length(trim(coalesce(p_payload->>'improvement_action','')))<1 or length(trim(coalesce(p_payload->>'control_note','')))<1
     or length(trim(coalesce(p_payload->>'cause','')))<1 then raise exception 'Document cause, completed measures and checked result before closure';end if;
   end if;
   update public.kshms_deviations set title=coalesce(trim(p_payload->>'title'),title),event=coalesce(trim(p_payload->>'event'),event),category=coalesce(p_payload->>'category',category),
    project_reference=coalesce(p_payload->>'project_reference',project_reference),routines=coalesce(p_payload->>'routines',routines),
    cause=coalesce(p_payload->>'cause',cause),immediate_action=coalesce(p_payload->>'immediate_action',immediate_action),improvement_action=coalesce(p_payload->>'improvement_action',improvement_action),follow_up=coalesce(p_payload->>'follow_up',follow_up),
    responsible_id=target,handler_id=handler,responsible_identity=case when target<>responsible_id then kshms_private.identity_snapshot(target) else responsible_identity end,
    handler_identity=case when handler<>handler_id then kshms_private.identity_snapshot(handler) else handler_identity end,due_on=coalesce((p_payload->>'due_on')::date,due_on),
    status=new_status,include_in_report=coalesce((p_payload->>'include_in_report')::boolean,include_in_report),
    control_note=case when p_action='close' then trim(p_payload->>'control_note') else coalesce(p_payload->>'control_note',control_note) end,
    closed_by=case when p_action='close' then auth.uid() else null end,closed_identity=case when p_action='close' then kshms_private.identity_snapshot(auth.uid()) else null end,
    closed_at=case when p_action='close' then now() else null end,revision=revision+1,assignment_number=assignment_number+case when target<>responsible_id then 1 else 0 end,updated_at=now()
   where id=d.id returning * into d;
  end if;
  event_action:=p_action;
 else raise exception 'Unsupported deviation action';end if;
 insert into public.kshms_deviation_events(company_id,deviation_id,actor_id,actor_identity,action,snapshot)
 values(p_company_id,d.id,auth.uid(),kshms_private.identity_snapshot(auth.uid()),event_action,to_jsonb(d));
 if d.status<>'closed' and (event_action in('create','reopen') or d.responsible_id is distinct from old_d.responsible_id) then
  insert into public.kshms_notification_outbox(company_id,deviation_id,user_id,assignment_number) values(p_company_id,d.id,d.responsible_id,d.assignment_number) on conflict do nothing;
 end if;
 if d.project_id is not null and d.source_kind<>'company' then update public.projects set data=data where id=d.project_id;end if;
 return to_jsonb(d);
end $$;
revoke all on function public.kshms_deviation_command(uuid,text,jsonb) from public,anon;
grant execute on function public.kshms_deviation_command(uuid,text,jsonb) to authenticated;

create function public.kshms_project_ruh_state(p_company_id uuid,p_project_id uuid,p_status text default 'open',p_query text default '',p_before timestamptz default null,p_before_id uuid default null) returns jsonb language plpgsql security definer set search_path='' as $$
declare x jsonb; p public.projects%rowtype; rows jsonb; last_row jsonb;
begin
 x:=kshms_private.require_context(p_company_id);
 if p_project_id is null then raise exception 'Velg et lagret prosjekt.'; end if;
 p:=kshms_private.project_checklist_access(p_company_id,p_project_id,false);
 x:=x||jsonb_build_object('project_id',p.id);
 if p_status not in ('open','closed','all') or length(coalesce(p_query,''))>200 or ((p_before is null)<>(p_before_id is null)) then raise exception 'Ugyldig RUH-søk.'; end if;
 select coalesce(jsonb_agg(to_jsonb(d) order by d.created_at desc,d.id desc),'[]') into rows from (
  select d.* from public.kshms_deviations d where d.company_id=p_company_id and d.project_id=p_project_id and d.category='ruh' and kshms_private.deviation_visible(d,x)
  and (p_status='all' or (p_status='open' and d.status<>'closed') or (p_status='closed' and d.status='closed'))
  and (coalesce(p_query,'')='' or strpos(lower(d.title||' '||d.event||' '||coalesce(d.responsible_identity->>'name','')),lower(p_query))>0)
  and (p_before is null or (d.created_at,d.id)<(p_before,p_before_id)) order by d.created_at desc,d.id desc limit 50
 ) d;
 last_row:=rows->(jsonb_array_length(rows)-1);
 return jsonb_build_object('context',x,'cases',rows,'next',case when jsonb_array_length(rows)=50 then jsonb_build_object('before',last_row->>'created_at','id',last_row->>'id') else null end,
  'project',jsonb_build_object('id',p.id,'name',coalesce(nullif(p.data#>>'{project,projectName}',''),p.title),'locked',coalesce(p.locked,false) or coalesce((p.data#>>'{project,locked}')::boolean,false)),
  'members',(select coalesce(jsonb_agg(jsonb_build_object('id',u.id,'identity',kshms_private.identity_snapshot(u.id)) order by u.email),'[]') from public.sales_company_memberships m join public.profiles u on u.id=m.user_id where m.company_id=p_company_id and kshms_private.deviation_member(p_company_id,u.id)),
  'counts',(select jsonb_build_object('open',count(*) filter(where d.status<>'closed'),'closed',count(*) filter(where d.status='closed')) from public.kshms_deviations d where d.company_id=p_company_id and d.project_id=p_project_id and d.category='ruh' and kshms_private.deviation_visible(d,x)));
end $$;
revoke all on function public.kshms_project_ruh_state(uuid,uuid,text,text,timestamptz,uuid) from public,anon;
grant execute on function public.kshms_project_ruh_state(uuid,uuid,text,text,timestamptz,uuid) to authenticated;

create function kshms_private.protect_project_safety_company() returns trigger language plpgsql set search_path='' as $$
begin
 if new.company_scope_id is distinct from old.company_scope_id and (
  exists(select 1 from public.kshms_sjas where project_id=old.id) or exists(select 1 from public.kshms_deviations where project_id=old.id)
 ) then raise exception 'Et prosjekt med SJA eller avvik/RUH kan ikke flyttes til et annet firma.' using errcode='42501'; end if;
 return new;
end $$;
-- The trigger needs table access even for ordinary project saves under RLS.
alter function kshms_private.protect_project_safety_company() security definer;
create trigger kshms_project_safety_company before update of company_scope_id on public.projects for each row execute function kshms_private.protect_project_safety_company();
revoke all on function kshms_private.protect_project_safety_company() from public,anon,authenticated;
notify pgrst,'reload schema';
