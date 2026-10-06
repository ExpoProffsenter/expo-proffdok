begin;
-- Firm-owned cases are accessed through narrow RPCs. No REST table access.
create table public.kshms_deviations (
 id uuid primary key default gen_random_uuid(),
 company_id uuid not null references public.sales_company_scopes(id),
 request_id uuid not null,
 title text not null check(length(title) between 3 and 200),
 event text not null check(length(event) between 10 and 20000),
 category text not null check(category in ('quality','hms','ruh')),
 cause text not null default '' check(length(cause)<=20000),
 immediate_action text not null default '' check(length(immediate_action)<=20000),
 improvement_action text not null default '' check(length(improvement_action)<=20000),
 follow_up text not null default '' check(length(follow_up)<=20000),
 responsible_id uuid not null references public.profiles(id),
 handler_id uuid not null references public.profiles(id),
 responsible_identity jsonb not null,
 handler_identity jsonb not null,
 due_on date not null,
 status text not null default 'open' check(status in ('open','in_progress','closed')),
 project_id uuid references public.projects(id) on delete restrict,
 source_kind text not null default 'company' check(source_kind in ('company','project','checklist')),
 source_key text,
 source_group text,
 source_item text,
 source_snapshot jsonb,
 include_in_report boolean not null default false,
 revision bigint not null default 1,
 assignment_number bigint not null default 1,
 created_by uuid not null references public.profiles(id),
 creator_identity jsonb not null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 closed_by uuid references public.profiles(id),
 closed_identity jsonb,
 closed_at timestamptz,
 control_note text not null default '' check(length(control_note)<=20000),
 unique(company_id,id), unique(company_id,created_by,request_id),
 check((source_kind='company') or (project_id is not null and source_key is not null)),
 check(source_kind<>'checklist' or (source_group is not null and source_item is not null)),
 check((status='closed')=(closed_at is not null and closed_by is not null))
);
create unique index kshms_deviations_source_key on public.kshms_deviations(company_id,project_id,source_kind,source_key) where source_kind<>'company';
create index kshms_deviations_company_status on public.kshms_deviations(company_id,status,created_at desc,id desc);
create index kshms_deviations_responsible_open on public.kshms_deviations(company_id,responsible_id,due_on,id) where status<>'closed';
create index kshms_deviations_creator on public.kshms_deviations(company_id,created_by,created_at desc);
create index kshms_deviations_handler on public.kshms_deviations(company_id,handler_id,created_at desc);
create index kshms_deviations_project on public.kshms_deviations(project_id) where project_id is not null;
create index kshms_deviations_closed_by on public.kshms_deviations(closed_by) where closed_by is not null;
create table public.kshms_deviation_events (
 id uuid primary key default gen_random_uuid(),
 company_id uuid not null,
 deviation_id uuid not null,
 actor_id uuid not null references public.profiles(id),
 actor_identity jsonb not null,
 action text not null,
 snapshot jsonb not null,
 created_at timestamptz not null default now(),
 foreign key(company_id,deviation_id) references public.kshms_deviations(company_id,id)
);
create index kshms_deviation_events_case on public.kshms_deviation_events(company_id,deviation_id,created_at desc,id desc);
create index kshms_deviation_events_actor on public.kshms_deviation_events(actor_id);
create trigger kshms_deviation_events_immutable before update or delete on public.kshms_deviation_events for each row execute function kshms_private.immutable_record();
create table public.kshms_notification_outbox (
 id uuid primary key default gen_random_uuid(),
 company_id uuid not null,
 deviation_id uuid not null,
 user_id uuid not null references public.profiles(id),
 assignment_number bigint not null,
 status text not null default 'pending' check(status in ('pending','sending','sent','suppressed')),
 attempts int not null default 0,
 available_at timestamptz not null default now(),
 reserved_at timestamptz,
 sent_at timestamptz,
 created_at timestamptz not null default now(),
 unique(deviation_id,assignment_number),
 foreign key(company_id,deviation_id) references public.kshms_deviations(company_id,id)
);
create index kshms_notification_outbox_pending on public.kshms_notification_outbox(available_at,id) where status in ('pending','sending');
create index kshms_notification_outbox_company_case on public.kshms_notification_outbox(company_id,deviation_id);
create index kshms_notification_outbox_user on public.kshms_notification_outbox(user_id);
alter table public.kshms_deviations enable row level security;
alter table public.kshms_deviation_events enable row level security;
alter table public.kshms_notification_outbox enable row level security;
revoke all on public.kshms_deviations,public.kshms_deviation_events,public.kshms_notification_outbox from public,anon,authenticated;

create function kshms_private.deviation_member(c uuid,u uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.company_module_access module
 join public.sales_company_memberships m on m.company_id=module.company_id
 join public.profiles p on p.id=m.user_id
 left join public.kshms_member_access a on a.company_id=m.company_id and a.user_id=m.user_id
 where module.company_id=c and module.module_key='kshms' and module.enabled and m.user_id=u
 and p.approved and not coalesce(p.deactivated,false) and p.role in ('admin','member','ansatt','firmaadmin')
 and (m.workspace_role='firmaadmin' or coalesce(a.enabled,false)));
$$;
create function kshms_private.deviation_visible(d public.kshms_deviations,x jsonb) returns boolean language sql immutable set search_path='' as $$
 select (x->>'manage')::boolean or (x->>'user_id')::uuid in(d.created_by,d.responsible_id,d.handler_id);
$$;
create function kshms_private.deviation_projection(d public.kshms_deviations) returns jsonb language sql stable set search_path='' as $$
 select jsonb_build_object('ks_deviation_id',d.id,'title',d.title,'description',d.event,
 'responsible',coalesce(d.responsible_identity->>'name',d.responsible_identity->>'email'),
 'dueDate',d.due_on,'status',case when d.status='closed' then 'Lukket' when d.status='in_progress' then 'Under behandling' else 'Åpent' end,
 'action',d.improvement_action,'closedAt',d.closed_at,'closedBy',coalesce(d.closed_identity->>'name',''),
 'closeComment',d.control_note);
$$;
-- Once explicitly linked, the case is the only authority for closure. Ordinary
-- unrelated project/checklist saves keep their existing contract.
create function kshms_private.protect_project_deviation_links() returns trigger language plpgsql security definer set search_path='' as $$
declare d public.kshms_deviations%rowtype; entries jsonb; point jsonb; projection jsonb;
begin
 if not exists(select 1 from public.kshms_deviations where project_id=old.id and source_kind<>'company') then return new;end if;
 if new.company_scope_id is distinct from old.company_scope_id then raise exception 'A linked KS/HMS project cannot change company' using errcode='42501';end if;
 for d in select * from public.kshms_deviations where project_id=old.id and source_kind<>'company' loop
  if d.company_id<>new.company_scope_id then raise exception 'Linked case company mismatch' using errcode='42501';end if;
  projection:=kshms_private.deviation_projection(d);
  if d.source_kind='project' then
   entries:=coalesce(new.data#>'{project,projectDeviations}','[]');
   if jsonb_typeof(entries)<>'array' or not exists(select 1 from jsonb_array_elements(entries) e where e->>'id'=d.source_key) then raise exception 'Linked KS/HMS deviation cannot be removed from the project';end if;
   select jsonb_agg(case when e->>'id'=d.source_key then e||projection else e end order by ord) into entries from jsonb_array_elements(entries) with ordinality a(e,ord);
   new.data:=jsonb_set(new.data,'{project,projectDeviations}',entries);
  else
   point:=new.data#>array['checklist',d.source_group,d.source_item];
   if point is null or jsonb_typeof(point)<>'object' then raise exception 'Linked KS/HMS checklist point cannot be removed';end if;
   new.data:=jsonb_set(new.data,array['checklist',d.source_group,d.source_item],point||jsonb_build_object(
     'ks_deviation_id',d.id,'status',case when d.status='closed' then 'Lukket avvik' else 'Avvik' end,
     'closeComment',d.control_note,'closedAt',d.closed_at,'closedBy',projection->>'closedBy'));
  end if;
 end loop;
 return new;
end $$;
create trigger kshms_project_deviation_links before update of data,company_scope_id on public.projects for each row execute function kshms_private.protect_project_deviation_links();

create function public.kshms_deviation_tasks(p_company_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
begin
 perform kshms_private.require_context(p_company_id);
 return jsonb_build_object('company_id',p_company_id,'user_id',auth.uid(),
 'count',(select count(*) from public.kshms_deviations where company_id=p_company_id and responsible_id=auth.uid() and status<>'closed'),
 'overdue',(select count(*) from public.kshms_deviations where company_id=p_company_id and responsible_id=auth.uid() and status<>'closed' and due_on<current_date),
 'items',(select coalesce(jsonb_agg(item order by due_on,id),'[]') from (
 select id,due_on,jsonb_build_object('id',id,'title',title,'due_on',due_on,'status',status) item from public.kshms_deviations
 where company_id=p_company_id and responsible_id=auth.uid() and status<>'closed' order by due_on,id limit 20) tasks));
end $$;
create function public.kshms_deviation_state(p_company_id uuid,p_status text default 'open',p_query text default '',p_before timestamptz default null,p_before_id uuid default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare x jsonb; rows jsonb; last_row jsonb;
begin
 x:=kshms_private.require_context(p_company_id);
 if p_status not in('open','closed','all') or length(p_query)>200 or ((p_before is null)<>(p_before_id is null)) then raise exception 'Invalid case filter';end if;
 select coalesce(jsonb_agg(to_jsonb(d) order by d.created_at desc,d.id desc),'[]') into rows from (
 select d.* from public.kshms_deviations d where company_id=p_company_id and kshms_private.deviation_visible(d,x)
 and (p_status='all' or (p_status='open' and status<>'closed') or (p_status='closed' and status='closed'))
 and (p_query='' or strpos(lower(d.title||' '||d.event||' '||coalesce(d.responsible_identity->>'name','')),lower(p_query))>0)
 and (p_before is null or (d.created_at,d.id)<(p_before,p_before_id)) order by d.created_at desc,d.id desc limit 50) d;
 last_row:=rows->(jsonb_array_length(rows)-1);
 return jsonb_build_object('context',x,'cases',rows,'next',case when jsonb_array_length(rows)=50 then jsonb_build_object('before',last_row->>'created_at','id',last_row->>'id') else null end,
 'members',(select coalesce(jsonb_agg(jsonb_build_object('id',p.id,'identity',kshms_private.identity_snapshot(p.id)) order by p.email),'[]')
 from public.sales_company_memberships m join public.profiles p on p.id=m.user_id where m.company_id=p_company_id and kshms_private.deviation_member(p_company_id,p.id)),
 'counts',(select jsonb_build_object('open',count(*) filter(where status<>'closed'),'closed',count(*) filter(where status='closed')) from public.kshms_deviations d where company_id=p_company_id and kshms_private.deviation_visible(d,x)));
end $$;
create function public.kshms_deviation_detail(p_company_id uuid,p_id uuid,p_before timestamptz default null,p_before_id uuid default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare x jsonb;d public.kshms_deviations%rowtype; events jsonb;last_event jsonb;
begin
 x:=kshms_private.require_context(p_company_id);
 select * into d from public.kshms_deviations where company_id=p_company_id and id=p_id;
 if d.id is null or not kshms_private.deviation_visible(d,x) then raise exception 'Case access denied' using errcode='42501';end if;
 if (p_before is null)<>(p_before_id is null) then raise exception 'Invalid history cursor';end if;
 select coalesce(jsonb_agg(to_jsonb(e) order by e.created_at desc,e.id desc),'[]') into events from(
 select * from public.kshms_deviation_events where company_id=p_company_id and deviation_id=p_id
 and (p_before is null or (created_at,id)<(p_before,p_before_id)) order by created_at desc,id desc limit 50) e;
 last_event:=events->(jsonb_array_length(events)-1);
 return jsonb_build_object('case',to_jsonb(d),'events',events,'next',case when jsonb_array_length(events)=50 then jsonb_build_object('before',last_event->>'created_at','id',last_event->>'id') else null end);
end $$;
create function public.kshms_deviation_command(p_company_id uuid,p_action text,p_payload jsonb) returns jsonb
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
  if d.status='closed' and p_action<>'reopen' then raise exception 'Closed case: reopen explicitly before editing';end if;
  old_d:=d;
  if p_action='reopen' then
   if not (x->>'manage')::boolean then raise exception 'KS/HMS manager required for reopening' using errcode='42501';end if;
   if d.status<>'closed' or length(trim(coalesce(p_payload->>'reason','')))<10 then raise exception 'Explain why the closed case is reopened';end if;
   if not kshms_private.deviation_member(p_company_id,d.responsible_id) then raise exception 'Responsible no longer has KS/HMS access; manager must choose an eligible responsible when reopening';end if;
   update public.kshms_deviations set status='open',closed_by=null,closed_identity=null,closed_at=null,control_note='',revision=revision+1,assignment_number=assignment_number+1,updated_at=now(),follow_up=follow_up||E'\nGjenåpnet: '||trim(p_payload->>'reason') where id=d.id returning * into d;
  else
   target:=coalesce(nullif(p_payload->>'responsible_id','')::uuid,d.responsible_id);handler:=coalesce(nullif(p_payload->>'handler_id','')::uuid,d.handler_id);
   if (target<>d.responsible_id or handler<>d.handler_id) and not (x->>'manage')::boolean then raise exception 'KS/HMS manager required for reassignment' using errcode='42501';end if;
   if (target<>d.responsible_id and not kshms_private.deviation_member(p_company_id,target)) or (handler<>d.handler_id and not kshms_private.deviation_member(p_company_id,handler)) then raise exception 'Choose an active employee with KS/HMS access' using errcode='42501';end if;
   new_status:=case when p_action='close' then 'closed' else coalesce(p_payload->>'status','in_progress') end;
   if p_action='save' and new_status not in('open','in_progress') then raise exception 'Use explicit controlled closure';end if;
   if p_action='close' then
    if jsonb_typeof(p_payload->'controlled') is distinct from 'boolean' or p_payload->>'controlled'<>'true'
     or length(trim(coalesce(p_payload->>'improvement_action','')))<10 or length(trim(coalesce(p_payload->>'control_note','')))<10
     or length(trim(coalesce(p_payload->>'cause','')))<5 then raise exception 'Document cause, completed measures and checked result before closure';end if;
   end if;
   update public.kshms_deviations set title=coalesce(trim(p_payload->>'title'),title),event=coalesce(trim(p_payload->>'event'),event),category=coalesce(p_payload->>'category',category),
    cause=coalesce(p_payload->>'cause',cause),immediate_action=coalesce(p_payload->>'immediate_action',immediate_action),improvement_action=coalesce(p_payload->>'improvement_action',improvement_action),follow_up=coalesce(p_payload->>'follow_up',follow_up),
    responsible_id=target,handler_id=handler,responsible_identity=case when target<>responsible_id then kshms_private.identity_snapshot(target) else responsible_identity end,
    handler_identity=case when handler<>handler_id then kshms_private.identity_snapshot(handler) else handler_identity end,due_on=coalesce((p_payload->>'due_on')::date,due_on),
    status=new_status,include_in_report=coalesce((p_payload->>'include_in_report')::boolean,include_in_report),
    control_note=case when p_action='close' then trim(p_payload->>'control_note') else '' end,
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
-- Email worker uses the existing service credential, never a client-supplied recipient.
-- Reserving does not send anything. Production worker activation is a separate step.
create function public.kshms_email_reserve() returns jsonb language plpgsql security definer set search_path='' as $$
declare o public.kshms_notification_outbox%rowtype;d public.kshms_deviations%rowtype; email text;
begin
 select * into o from public.kshms_notification_outbox where (status='pending' and available_at<=now()) or (status='sending' and reserved_at<now()-interval '10 minutes') order by available_at,id limit 1 for update skip locked;
 if o.id is null then return null;end if;
 select * into d from public.kshms_deviations where id=o.deviation_id and company_id=o.company_id;
 if d.status='closed' or d.responsible_id<>o.user_id or d.assignment_number<>o.assignment_number or not kshms_private.deviation_member(o.company_id,o.user_id) then
  update public.kshms_notification_outbox set status='suppressed' where id=o.id;return jsonb_build_object('suppressed',true);
 end if;
 select p.email into email from public.profiles p where p.id=o.user_id;
 if email is null or email !~ '^[^@ ]+@[^@ ]+\.[^@ ]+$' then update public.kshms_notification_outbox set status='suppressed' where id=o.id;return jsonb_build_object('suppressed',true);end if;
 update public.kshms_notification_outbox set status='sending',attempts=attempts+1,reserved_at=now() where id=o.id;
 return jsonb_build_object('id',o.id,'email',email,'company_id',o.company_id,'deviation_id',d.id);
end $$;
create function public.kshms_email_finish(p_id uuid,p_sent boolean) returns void language sql security definer set search_path='' as $$
 update public.kshms_notification_outbox set status=case when p_sent then 'sent' else 'pending' end,
 sent_at=case when p_sent then now() else null end,available_at=now()+interval '15 minutes' where id=p_id and status='sending';
$$;
revoke all on function kshms_private.deviation_member(uuid,uuid),kshms_private.deviation_visible(public.kshms_deviations,jsonb),kshms_private.deviation_projection(public.kshms_deviations),kshms_private.protect_project_deviation_links() from public,anon,authenticated;
revoke all on function public.kshms_deviation_tasks(uuid),public.kshms_deviation_state(uuid,text,text,timestamptz,uuid),public.kshms_deviation_detail(uuid,uuid,timestamptz,uuid),public.kshms_deviation_command(uuid,text,jsonb) from public,anon;
grant execute on function public.kshms_deviation_tasks(uuid),public.kshms_deviation_state(uuid,text,text,timestamptz,uuid),public.kshms_deviation_detail(uuid,uuid,timestamptz,uuid),public.kshms_deviation_command(uuid,text,jsonb) to authenticated;
revoke all on function public.kshms_email_reserve(),public.kshms_email_finish(uuid,boolean) from public,anon,authenticated;
grant execute on function public.kshms_email_reserve(),public.kshms_email_finish(uuid,boolean) to service_role;
commit;
