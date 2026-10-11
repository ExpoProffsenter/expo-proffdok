-- Conversation creation notification through the existing private HR outbox.
-- No new table/token; preparation is an app task, not a statutory deadline.
create or replace function hr_private.sick_leave_tasks(c uuid default null,case_filter uuid default null)
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
 union all select l.id,l.company_id,l.employee_id,l.user_id,'preparation',(l.v->>'on')::date,l.artifact_id,l.v->>'type'
 from live l where l.v->>'type'='conversation' and l.v->>'stage'='preparation'
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

create or replace function public.hr_conversation_invitation_reserve() returns jsonb
language plpgsql security definer set search_path='' as $$declare d hr_private.followup_deliveries%rowtype;email text;begin
 if not exists(select 1 from hr_private.followup_settings where singleton and enabled) then return null;end if;
 select * into d from hr_private.followup_deliveries where task_key='preparation' and bucket between -11439 and -10000 and ((status='pending' and available_at<=now())or(status='sending' and reserved_at<now()-interval '5 minutes'))
 order by available_at,id for update skip locked limit 1;if d.id is null then return null;end if;
 select p.email into email from public.profiles p where p.id=d.recipient_id;
 if email is null or length(email)>254 or email ~ '[[:space:]]' or email !~ '^[^@ ]+@[^@ ]+\.[^@ ]+$'
 or(d.recipient_email is not null and d.recipient_email<>email)
 or not exists(select 1 from hr_private.sick_leave_tasks(d.company_id,d.case_id) t join hr_private.artifacts a on a.id=t.artifact_id where t.recipient_id=d.recipient_id and t.task_key=d.task_key and t.due_on=d.due_on and a.payload->>'meeting_time'=lpad(((-10000-d.bucket)/60)::text,2,'0')||':'||lpad(((-10000-d.bucket)%60)::text,2,'0')) then
 update hr_private.followup_deliveries set status='suppressed' where id=d.id;return jsonb_build_object('suppressed',true);end if;
 if d.attempts>=10 or(d.first_attempt_at is not null and d.first_attempt_at<now()-interval '23 hours') then
 update hr_private.followup_deliveries set status='failed' where id=d.id;return jsonb_build_object('suppressed',true);end if;
 update hr_private.followup_deliveries set status='sending',attempt=gen_random_uuid(),attempts=attempts+1,recipient_email=email,
 reserved_at=now(),first_attempt_at=coalesce(first_attempt_at,now()) where id=d.id returning * into d;
 return jsonb_build_object('id',d.id,'attempt',d.attempt,'to',email,'on',d.due_on,'time',lpad(((-10000-d.bucket)/60)::text,2,'0')||':'||lpad(((-10000-d.bucket)%60)::text,2,'0'));
end$$;

create function public.hr_conversation_invitation_validate(p_id uuid,p_attempt uuid,p_on date,p_time text) returns boolean
language sql security definer set search_path='' as $$select coalesce(p_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
 and public.hr_followup_worker_validate(p_id,p_attempt) and exists(
 select 1 from hr_private.followup_deliveries d join hr_private.conversations c on c.id=d.case_id and c.company_id=d.company_id
 join hr_private.artifacts a on a.id=c.current_artifact_id
 where d.id=p_id and d.attempt=p_attempt and d.task_key='preparation'
 and d.bucket between -11439 and -10000 and d.due_on=p_on and a.payload->>'meeting_time'=p_time
 and p_time=lpad(((-10000-d.bucket)/60)::text,2,'0')||':'||lpad(((-10000-d.bucket)%60)::text,2,'0')),false)$$;

create function hr_private.invoke_conversation_invitation_worker() returns void
language plpgsql security definer set search_path='' as $$declare cfg hr_private.followup_settings%rowtype;token text;begin
 select * into cfg from hr_private.followup_settings where singleton;
 if not cfg.enabled or cfg.endpoint !~ '^https://[a-z0-9]{20}\.supabase\.co/functions/v1/hr-followup-reminders$' then return;end if;
 if not exists(select 1 from hr_private.followup_deliveries where task_key='preparation' and bucket between -11439 and -10000
 and ((status='pending' and available_at<=now())or(status='sending' and reserved_at<now()-interval '5 minutes'))) then return;end if;
 select decrypted_secret into token from vault.decrypted_secrets where id=cfg.secret_id;
 -- pg_net executes only after commit. A dispatch failure leaves the durable job for cron retry.
 begin
  perform net.http_post(url:=cfg.endpoint,headers:=jsonb_build_object('content-type','application/json','x-hr-followup-token',token),body:='{"invitation":true}'::jsonb,timeout_milliseconds:=40000);
 exception when others then null;end;
end$$;

create function hr_private.queue_conversation_invitation(c uuid,eid uuid,cid uuid) returns void
language plpgsql security definer set search_path='' as $$declare e hr_private.employees%rowtype;t hr_private.conversations%rowtype;aid uuid;v jsonb;begin
 e:=hr_private.conversation_employee(c,eid);
 if auth.uid() is distinct from e.leader_id then raise exception 'Bare nærmeste leder sender samtalevarselet.' using errcode='42501';end if;
 select * into t from hr_private.conversations where company_id=c and employee_id=e.id and id=cid for update;
 if t.id is null then raise exception 'Samtalen er ikke tilgjengelig.' using errcode='42501';end if;
 select payload into v from hr_private.artifacts where id=t.current_artifact_id;
 if coalesce(v->>'meeting_time','') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then raise exception 'Velg klokkeslett før invitasjonen sendes.' using errcode='22023';end if;
 if not exists(select 1 from hr_private.followup_settings where singleton and enabled) then return;end if;
 insert into hr_private.followup_deliveries(case_id,company_id,artifact_id,task_key,due_on,bucket,recipient_id)
 select case_id,company_id,artifact_id,task_key,due_on,-10000-(split_part(v->>'meeting_time',':',1)::integer*60+split_part(v->>'meeting_time',':',2)::integer),recipient_id from hr_private.sick_leave_tasks(c,cid)
 where task_key='preparation' and recipient_id=e.user_id
 on conflict(case_id,task_key,due_on,bucket,recipient_id) do nothing returning id into aid;
 if aid is not null then perform hr_private.invoke_conversation_invitation_worker();end if;
end$$;

create function public.hr_conversation_invitation_status(p_company_id uuid,p_employee_id uuid,p_conversation_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$declare e hr_private.employees%rowtype;t hr_private.conversations%rowtype;x jsonb;d hr_private.followup_deliveries%rowtype;v jsonb;app boolean;mail text;begin
 e:=hr_private.conversation_employee(p_company_id,p_employee_id);
 select * into t from hr_private.conversations where company_id=p_company_id and employee_id=e.id and id=p_conversation_id;
 if t.id is null then raise exception 'Samtalen er ikke tilgjengelig.' using errcode='42501';end if;
 select payload into v from hr_private.artifacts where id=t.current_artifact_id;
 select exists(select 1 from hr_private.sick_leave_tasks(p_company_id,t.id) where task_key='preparation' and recipient_id=e.user_id) into app;
 select * into d from hr_private.followup_deliveries where company_id=p_company_id and case_id=t.id and recipient_id=e.user_id and task_key='preparation' and due_on=(v->>'on')::date and bucket=case when coalesce(v->>'meeting_time','') ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then -10000-(split_part(v->>'meeting_time',':',1)::integer*60+split_part(v->>'meeting_time',':',2)::integer) else null end limit 1;
 mail:=case when d.status='sent' then 'sent'
 when not exists(select 1 from hr_private.followup_settings where singleton and enabled) then 'disabled'
 when d.id is null then 'not_queued'
 when not app then 'suppressed' else d.status end;
 x:=hr_private.require_context(p_company_id);
 return jsonb_build_object('context',x,'employee',jsonb_build_object('id',e.id),'conversation_id',t.id,
 'app_notification',app,'email_status',mail,'sent_at',d.sent_at,
 'can_notify',auth.uid()=e.leader_id and app and mail in('not_queued','disabled') and coalesce(v->>'meeting_time','') ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$');
end$$;

create function public.hr_conversation_notify(p_company_id uuid,p_employee_id uuid,p_employee_revision integer,p_conversation_id uuid,p_revision integer) returns jsonb
language plpgsql security definer set search_path='' as $$declare e hr_private.employees%rowtype;t hr_private.conversations%rowtype;v jsonb;begin
 perform 1 from hr_private.firms where company_id=p_company_id for update;
 e:=hr_private.conversation_employee(p_company_id,p_employee_id);
 if auth.uid() is distinct from e.leader_id then raise exception 'Bare nærmeste leder sender samtalevarselet.' using errcode='42501';end if;
 if p_employee_revision is distinct from e.revision then raise exception 'Medarbeiderens tilgang er endret.' using errcode='40001';end if;
 select * into t from hr_private.conversations where company_id=p_company_id and employee_id=e.id and id=p_conversation_id for update;
 if t.id is null then raise exception 'Samtalen er ikke tilgjengelig.' using errcode='42501';end if;
 if p_revision is distinct from t.revision then raise exception 'Samtalen er endret. Hent lagret utgave.' using errcode='40001';end if;
 select payload into v from hr_private.artifacts where id=t.current_artifact_id;
 if v->>'stage'<>'preparation' then raise exception 'Medarbeideren har allerede delt forberedelsen.' using errcode='22023';end if;
 perform hr_private.queue_conversation_invitation(p_company_id,e.id,t.id);
 return public.hr_conversation_invitation_status(p_company_id,e.id,t.id);
end$$;

create or replace function public.hr_followup_worker_reserve() returns jsonb
language plpgsql security definer set search_path='' as $$declare d hr_private.followup_deliveries%rowtype;email text;begin
 if not exists(select 1 from hr_private.followup_settings where singleton and enabled) then return null;end if;
 select * into d from hr_private.followup_deliveries where bucket>=-3 and ((status='pending' and available_at<=now())or(status='sending' and reserved_at<now()-interval '5 minutes'))
 order by available_at,id for update skip locked limit 1;if d.id is null then return null;end if;
 select p.email into email from public.profiles p where p.id=d.recipient_id;
 if email is null or length(email)>254 or email ~ '[[:space:]]' or email !~ '^[^@ ]+@[^@ ]+\.[^@ ]+$'
 or(d.recipient_email is not null and d.recipient_email<>email)
 or not exists(select 1 from hr_private.sick_leave_tasks(d.company_id,d.case_id) t where t.recipient_id=d.recipient_id and t.task_key=d.task_key and t.due_on=d.due_on) then
 update hr_private.followup_deliveries set status='suppressed' where id=d.id;return jsonb_build_object('suppressed',true);end if;
 if d.attempts>=10 or(d.first_attempt_at is not null and d.first_attempt_at<now()-interval '23 hours') then
 update hr_private.followup_deliveries set status='failed' where id=d.id;return jsonb_build_object('suppressed',true);end if;
 update hr_private.followup_deliveries set status='sending',attempt=gen_random_uuid(),attempts=attempts+1,recipient_email=email,
 reserved_at=now(),first_attempt_at=coalesce(first_attempt_at,now()) where id=d.id returning * into d;
 return jsonb_build_object('id',d.id,'attempt',d.attempt,'to',email);
end$$;

create or replace function hr_private.invoke_followup_worker() returns void
language plpgsql security definer set search_path='' as $$declare cfg hr_private.followup_settings%rowtype;token text;begin
 -- Explicit invitations run at any time; deadline reminders keep their Oslo office hours.
 perform hr_private.invoke_conversation_invitation_worker();
 if extract(hour from now() at time zone 'Europe/Oslo') not between 9 and 16 then
  return;end if;
 select * into cfg from hr_private.followup_settings where singleton;
 if not cfg.enabled or cfg.endpoint !~ '^https://[a-z0-9]{20}\.supabase\.co/functions/v1/hr-followup-reminders$' then return;end if;
 perform hr_private.queue_followup_reminders();
 if not exists(select 1 from hr_private.followup_deliveries where bucket>=-3 and ((status='pending' and available_at<=now())or(status='sending' and reserved_at<now()-interval '5 minutes'))) then return;end if;
 select decrypted_secret into token from vault.decrypted_secrets where id=cfg.secret_id;
 perform net.http_post(url:=cfg.endpoint,headers:=jsonb_build_object('content-type','application/json','x-hr-followup-token',token),body:='{}'::jsonb,timeout_milliseconds:=40000);
end$$;

revoke all on function hr_private.invoke_conversation_invitation_worker(),hr_private.queue_conversation_invitation(uuid,uuid,uuid) from public,anon,authenticated,service_role;
revoke all on function public.hr_conversation_invitation_reserve(),public.hr_conversation_invitation_validate(uuid,uuid,date,text) from public,anon,authenticated,service_role;
grant execute on function public.hr_conversation_invitation_reserve(),public.hr_conversation_invitation_validate(uuid,uuid,date,text) to service_role;
revoke all on function public.hr_conversation_invitation_status(uuid,uuid,uuid),public.hr_conversation_notify(uuid,uuid,integer,uuid,integer) from public,anon,authenticated,service_role;
grant execute on function public.hr_conversation_invitation_status(uuid,uuid,uuid),public.hr_conversation_notify(uuid,uuid,integer,uuid,integer) to authenticated;
notify pgrst,'reload schema';
