-- Preserve control notes on ordinary save. Closure accepts any nonblank note.
-- Assigned responsible, explicit control, scope locks and revision checks remain enforced.
begin;
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
  insert into public.kshms_deviations(company_id,request_id,title,event,category,immediate_action,responsible_id,handler_id,responsible_identity,handler_identity,due_on,project_id,source_kind,source_key,source_group,source_item,source_snapshot,created_by,creator_identity)
  values(p_company_id,(p_payload->>'request_id')::uuid,trim(p_payload->>'title'),trim(p_payload->>'event'),p_payload->>'category',coalesce(p_payload->>'immediate_action',''),target,handler,kshms_private.identity_snapshot(target),kshms_private.identity_snapshot(handler),(p_payload->>'due_on')::date,project_id,source_kind,source_key,source_group,source_item,source_snapshot,auth.uid(),kshms_private.identity_snapshot(auth.uid())) returning * into d;
  event_action:='create';
 elsif p_action in ('save','close','reopen') then
  object_id:=(p_payload->>'id')::uuid;
  -- Project lock precedes case lock in both create/update, avoiding a reverse lock order.
  select * into d from public.kshms_deviations where id=object_id and company_id=p_company_id;
  if d.id is null or not kshms_private.deviation_visible(d,x) then raise exception 'Case access denied' using errcode='42501';end if;
  if d.project_id is not null then
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
commit;
