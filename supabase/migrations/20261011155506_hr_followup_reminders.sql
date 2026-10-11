-- Live HR tasks and a server-only generic reminder outbox. Disabled until release review.
-- FK cascade follows the existing private purge domain. No plan/diagnosis/name in transport.
create table hr_private.followup_deliveries (
 id uuid primary key default gen_random_uuid(),case_id uuid not null,company_id uuid not null references public.sales_company_scopes(id) on delete cascade,artifact_id uuid references hr_private.artifacts(id) on delete cascade,
 task_key text not null,due_on date not null,bucket integer not null,recipient_id uuid not null,
 status text not null default 'pending' check(status in('pending','sending','sent','failed','suppressed')),
 attempts integer not null default 0,attempt uuid,available_at timestamptz not null default now(),reserved_at timestamptz,
 recipient_email text,first_attempt_at timestamptz,sent_at timestamptz,unique(case_id,task_key,due_on,bucket,recipient_id)
);
create index hr_followup_artifact on hr_private.followup_deliveries(artifact_id);
create index hr_followup_company on hr_private.followup_deliveries(company_id);
create index hr_followup_pending on hr_private.followup_deliveries(available_at,id) where status in('pending','sending');
create table hr_private.followup_settings (
 singleton boolean primary key default true check(singleton),enabled boolean not null default false,
 endpoint text not null default '',secret_id uuid not null
);
insert into hr_private.followup_settings(secret_id)
 values(vault.create_secret(encode(extensions.gen_random_bytes(32),'hex'),'hr_followup_worker','Private generic HR reminder transport'));
alter table hr_private.followup_deliveries enable row level security;
alter table hr_private.followup_settings enable row level security;
revoke all on hr_private.followup_deliveries,hr_private.followup_settings from public,anon,authenticated,service_role;

-- No auth.uid() dependence: every recipient and employment is freshly checked for worker use.
-- Company filtering also bounds authenticated reads to one active scope.
create function hr_private.sick_leave_tasks(c uuid default null,case_filter uuid default null)
returns table(case_id uuid,company_id uuid,employee_id uuid,recipient_id uuid,task_key text,due_on date,artifact_id uuid,kind text)
language sql stable security definer set search_path='' as $$
 with live as(
 select t.id,t.company_id,t.employee_id,e.user_id,e.leader_id,a.id artifact_id,a.payload v
 from(select id,company_id,employee_id,current_artifact_id from hr_private.sick_leave_cases union all select id,company_id,employee_id,current_artifact_id from hr_private.conversations)t join hr_private.artifacts a on a.id=t.current_artifact_id
 join hr_private.employees e on e.id=t.employee_id and e.company_id=t.company_id
 join hr_private.firms f on f.company_id=t.company_id and f.enabled
 where(c is null or t.company_id=c) and(case_filter is null or t.id=case_filter)
 and exists(select 1 from hr_private.runtime_state where singleton and content_enabled and not restore_quarantined)
 and coalesce(a.payload->>'case_status','active')='active' and hr_private.active_member(t.company_id,e.user_id)
 ), raw as(
 select l.id,l.company_id,l.employee_id,l.leader_id recipient_id,m.key task_key,
 (l.v->>'on')::date+case m.key when 'plan' then 28 when 'meeting1' then 49 when 'activity' then 56 when 'meeting2' then 182 end due_on,l.artifact_id,l.v->>'type' kind
 from live l cross join lateral jsonb_each(l.v->'milestones') m where m.value->>'status' in('open','review')
 union all select l.id,l.company_id,l.employee_id,l.leader_id,'next',nullif(l.v->>'next_on','')::date,l.artifact_id,l.v->>'type' from live l where coalesce(l.v->>'next_on','')<>''
 union all select l.id,l.company_id,l.employee_id,recipient.id,'action:'||(a.value->>'id'),(a.value->>'due_on')::date,l.artifact_id,l.v->>'type'
 from live l cross join lateral jsonb_array_elements(l.v->'actions') a cross join lateral(select distinct id from(values((a.value->>'owner_id')::uuid),(l.leader_id))v(id))recipient
 where not(a.value->>'done')::boolean and (a.value->>'owner_id')::uuid in(l.user_id,l.leader_id)
 )select r.id,r.company_id,r.employee_id,r.recipient_id,r.task_key,r.due_on,r.artifact_id,r.kind from raw r
 where r.recipient_id is not null and hr_private.has_module_access(r.company_id,r.recipient_id)
 union all select f.company_id,f.company_id,null::uuid,m.user_id,'hr-review',f.review_on,null::uuid,'review'
 from hr_private.firms f join public.sales_company_memberships m on m.company_id=f.company_id and m.workspace_role='firmaadmin'
 where f.enabled and(c is null or f.company_id=c) and(case_filter is null or f.company_id=case_filter)
 and hr_private.has_module_access(f.company_id,m.user_id)
 and exists(select 1 from hr_private.runtime_state where singleton and content_enabled and not restore_quarantined)
$$;
create function public.hr_followup_tasks(p_company_id uuid,p_after jsonb default null) returns jsonb
language plpgsql security definer set search_path='' as $$declare x jsonb;rows jsonb;begin
 x:=hr_private.require_context(p_company_id);perform hr_private.require_content_ready();
 if p_after is not null and(jsonb_typeof(p_after) is distinct from 'object' or not p_after ?& array['due_on','case_id','task_key']
 or exists(select 1 from jsonb_object_keys(p_after) k where not k=any(array['due_on','case_id','task_key']))
 or jsonb_typeof(p_after->'due_on') is distinct from 'string' or p_after->>'due_on' !~ '^\d{4}-\d{2}-\d{2}$'
 or jsonb_typeof(p_after->'case_id') is distinct from 'string' or jsonb_typeof(p_after->'task_key') is distinct from 'string')
 then raise exception 'Ugyldig fristside. Hent fristene på nytt.' using errcode='22023';end if;
 select coalesce(jsonb_agg(to_jsonb(q) order by q.due_on,q.case_id,q.task_key),'[]'::jsonb) into rows from(
 select case_id,employee_id,task_key,due_on,kind from hr_private.sick_leave_tasks(p_company_id)
 where recipient_id=auth.uid() and(p_after is null or(due_on,case_id,task_key)>((p_after->>'due_on')::date,(p_after->>'case_id')::uuid,p_after->>'task_key'))
 order by due_on,case_id,task_key limit 50)q;
 x:=hr_private.require_context(p_company_id);
 return jsonb_build_object('context',x,'tasks',rows,'email_enabled',exists(select 1 from hr_private.followup_settings where singleton and enabled),
 'next',case when jsonb_array_length(rows)=50 then jsonb_build_object('due_on',rows->49->>'due_on','case_id',rows->49->>'case_id','task_key',rows->49->>'task_key') else null end);
end$$;
create function hr_private.queue_followup_reminders() returns void
language plpgsql security definer set search_path='' as $$declare today date:=(now() at time zone 'Europe/Oslo')::date;begin
 if not exists(select 1 from hr_private.followup_settings where singleton and enabled) then return;end if;
 insert into hr_private.followup_deliveries(case_id,company_id,artifact_id,task_key,due_on,bucket,recipient_id)
 select case_id,company_id,artifact_id,task_key,due_on,case when today=due_on-3 then -3 else(today-due_on)/7 end,recipient_id
 from hr_private.sick_leave_tasks() t where (today=due_on-3 or(today>=due_on and(today-due_on)%7=0))
 and not exists(select 1 from hr_private.followup_deliveries d where d.case_id=t.case_id and d.task_key=t.task_key and d.due_on=t.due_on and d.recipient_id=t.recipient_id and d.bucket=case when today=t.due_on-3 then -3 else(today-t.due_on)/7 end)
 order by due_on,case_id,task_key,recipient_id limit 1000 on conflict do nothing;
end$$;
create function public.hr_followup_worker_authorize(p_token text) returns boolean
language sql security definer set search_path='' as $$select p_token is not null and length(p_token)=64 and exists(
 select 1 from hr_private.followup_settings c join vault.decrypted_secrets s on s.id=c.secret_id
 where c.singleton and c.enabled and s.decrypted_secret=p_token)$$;
create function public.hr_followup_worker_validate(p_id uuid,p_attempt uuid) returns boolean
language sql security definer set search_path='' as $$select exists(
 select 1 from hr_private.followup_deliveries d join public.profiles p on p.id=d.recipient_id
 join hr_private.followup_settings cfg on cfg.singleton and cfg.enabled
 where d.id=p_id and d.attempt=p_attempt and d.status='sending' and d.reserved_at>now()-interval '5 minutes'
 and p.email=d.recipient_email
 and exists(select 1 from hr_private.sick_leave_tasks(null,d.case_id) t where t.recipient_id=d.recipient_id and t.task_key=d.task_key and t.due_on=d.due_on))$$;
create function public.hr_followup_worker_reserve() returns jsonb
language plpgsql security definer set search_path='' as $$declare d hr_private.followup_deliveries%rowtype;email text;begin
 if not exists(select 1 from hr_private.followup_settings where singleton and enabled) then return null;end if;
 select * into d from hr_private.followup_deliveries where(status='pending' and available_at<=now())or(status='sending' and reserved_at<now()-interval '5 minutes')
 order by available_at,id for update skip locked limit 1;if d.id is null then return null;end if;
 select p.email into email from public.profiles p where p.id=d.recipient_id;
 if email is null or length(email)>254 or email ~ '[[:space:]]' or email !~ '^[^@ ]+@[^@ ]+\.[^@ ]+$'
 or(d.recipient_email is not null and d.recipient_email<>email)
 or not exists(select 1 from hr_private.sick_leave_tasks(null,d.case_id) t where t.recipient_id=d.recipient_id and t.task_key=d.task_key and t.due_on=d.due_on) then
 update hr_private.followup_deliveries set status='suppressed' where id=d.id;return jsonb_build_object('suppressed',true);end if;
 if d.attempts>=10 or(d.first_attempt_at is not null and d.first_attempt_at<now()-interval '23 hours') then
 update hr_private.followup_deliveries set status='failed' where id=d.id;return jsonb_build_object('suppressed',true);end if;
 update hr_private.followup_deliveries set status='sending',attempt=gen_random_uuid(),attempts=attempts+1,recipient_email=email,
 reserved_at=now(),first_attempt_at=coalesce(first_attempt_at,now()) where id=d.id returning * into d;
 return jsonb_build_object('id',d.id,'attempt',d.attempt,'to',email);
end$$;
create function public.hr_followup_worker_finish(p_id uuid,p_attempt uuid,p_sent boolean) returns boolean
language plpgsql security definer set search_path='' as $$begin
 if p_sent is null then return false;end if;
 update hr_private.followup_deliveries set status=case when p_sent then 'sent' when attempts>=10 then 'failed' else 'pending' end,
 sent_at=case when p_sent then now() else null end,available_at=now()+interval '15 minutes'
 where id=p_id and attempt=p_attempt and status='sending';return found;end$$;
create function hr_private.invoke_followup_worker() returns void
language plpgsql security definer set search_path='' as $$declare cfg hr_private.followup_settings%rowtype;token text;begin
 -- Only office hours in Oslo; tasks remain visible at all times in the app.
 if extract(hour from now() at time zone 'Europe/Oslo') not between 9 and 16 then return;end if;
 select * into cfg from hr_private.followup_settings where singleton;
 if not cfg.enabled or cfg.endpoint !~ '^https://[a-z0-9]{20}\.supabase\.co/functions/v1/hr-followup-reminders$' then return;end if;
 perform hr_private.queue_followup_reminders();
 if not exists(select 1 from hr_private.followup_deliveries where(status='pending' and available_at<=now())or(status='sending' and reserved_at<now()-interval '5 minutes')) then return;end if;
 select decrypted_secret into token from vault.decrypted_secrets where id=cfg.secret_id;
 perform net.http_post(url:=cfg.endpoint,headers:=jsonb_build_object('content-type','application/json','x-hr-followup-token',token),body:='{}'::jsonb,timeout_milliseconds:=40000);
end$$;
revoke all on function hr_private.sick_leave_tasks(uuid,uuid),hr_private.queue_followup_reminders(),hr_private.invoke_followup_worker() from public,anon,authenticated,service_role;
revoke all on function public.hr_followup_tasks(uuid,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.hr_followup_tasks(uuid,jsonb) to authenticated;
revoke all on function public.hr_followup_worker_authorize(text),public.hr_followup_worker_reserve(),public.hr_followup_worker_validate(uuid,uuid),public.hr_followup_worker_finish(uuid,uuid,boolean) from public,anon,authenticated,service_role;
grant execute on function public.hr_followup_worker_authorize(text),public.hr_followup_worker_reserve(),public.hr_followup_worker_validate(uuid,uuid),public.hr_followup_worker_finish(uuid,uuid,boolean) to service_role;
select cron.schedule('hr-followup-reminders','* * * * *','select hr_private.invoke_followup_worker();');
notify pgrst,'reload schema';
