-- Opt-in leader reminder and employee feedback through the existing private outbox.
-- No new tables/tokens/cron; private preparation is never announced before sharing.
create function hr_private.conversation_meeting_at(p_on text,p_time text) returns timestamptz
language plpgsql stable set search_path='' as $$declare wall timestamp;instant timestamptz;begin
 if coalesce(p_time,'') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' or coalesce(p_on,'') !~ '^\d{4}-\d{2}-\d{2}$' then return null;end if;
 wall:=(p_on||' '||p_time)::timestamp;instant:=wall at time zone 'Europe/Oslo';
 if instant at time zone 'Europe/Oslo'<>wall then return null;end if;
 if (instant-interval '1 hour') at time zone 'Europe/Oslo'=wall then return instant-interval '1 hour';end if;
 return instant;
end$$;

create function hr_private.conversation_mail_live(p_id uuid) returns boolean
language sql stable security definer set search_path='' as $$select exists(
 select 1 from hr_private.followup_deliveries d
 join hr_private.conversations c on c.id=d.case_id and c.company_id=d.company_id
 join hr_private.artifacts a on a.id=c.current_artifact_id
 join hr_private.employees e on e.id=c.employee_id and e.company_id=c.company_id
 join hr_private.firms f on f.company_id=c.company_id and f.enabled
 where d.id=p_id and d.recipient_id=e.leader_id
 and hr_private.active_member(c.company_id,e.user_id) and hr_private.has_module_access(c.company_id,e.user_id)
 and hr_private.has_module_access(c.company_id,e.leader_id)
 and exists(select 1 from hr_private.runtime_state where singleton and content_enabled and not restore_quarantined)
 and(case when d.task_key='meeting-reminder' then
 a.payload->>'stage' in('preparation','meeting') and a.payload->>'leader_email_reminder'='true'
 and a.payload->>'leader_reminder_user_id'=e.leader_id::text
 and a.payload->>'on'=d.due_on::text
 and a.payload->>'meeting_time' ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
 and d.bucket=-12000-(split_part(a.payload->>'meeting_time',':',1)::integer*60+split_part(a.payload->>'meeting_time',':',2)::integer)
 and hr_private.conversation_meeting_at(a.payload->>'on',a.payload->>'meeting_time')>now()
 when d.task_key='employee-feedback' then d.bucket=-2000000-coalesce((a.payload->>'employee_feedback_revision')::integer,0)
 and coalesce((a.payload->>'employee_feedback_revision')::integer,0)>0
 else false end))$$;

create function hr_private.invoke_conversation_mail_worker(p_kind text) returns void
language plpgsql security definer set search_path='' as $$declare cfg hr_private.followup_settings%rowtype;token text;begin
 if p_kind not in('meeting-reminder','employee-feedback') then return;end if;
 select * into cfg from hr_private.followup_settings where singleton;
 if not cfg.enabled or cfg.endpoint !~ '^https://[a-z0-9]{20}\.supabase\.co/functions/v1/hr-followup-reminders$' then return;end if;
 if not exists(select 1 from hr_private.followup_deliveries where task_key=p_kind and
 ((status='pending' and available_at<=now())or(status='sending' and reserved_at<now()-interval '5 minutes'))) then return;end if;
 select decrypted_secret into token from vault.decrypted_secrets where id=cfg.secret_id;
 begin
 perform net.http_post(url:=cfg.endpoint,headers:=jsonb_build_object('content-type','application/json','x-hr-followup-token',token),
 body:=case when p_kind='meeting-reminder' then '{"reminder":true}'::jsonb else '{"feedback":true}'::jsonb end,timeout_milliseconds:=40000);
 exception when others then null;end;
end$$;

create function hr_private.queue_conversation_reminders(p_company_id uuid default null) returns void
language plpgsql security definer set search_path='' as $$begin
 if not exists(select 1 from hr_private.followup_settings where singleton and enabled) then return;end if;
 insert into hr_private.followup_deliveries(case_id,company_id,artifact_id,task_key,due_on,bucket,recipient_id,available_at)
 select c.id,c.company_id,a.id,'meeting-reminder',(a.payload->>'on')::date,
 -12000-(split_part(a.payload->>'meeting_time',':',1)::integer*60+split_part(a.payload->>'meeting_time',':',2)::integer),e.leader_id,
 (hr_private.conversation_meeting_at(a.payload->>'on',a.payload->>'meeting_time'))-interval '24 hours'
 from hr_private.conversations c join hr_private.artifacts a on a.id=c.current_artifact_id
 join hr_private.employees e on e.id=c.employee_id and e.company_id=c.company_id
 join hr_private.firms f on f.company_id=c.company_id and f.enabled
 where(p_company_id is null or c.company_id=p_company_id) and a.payload->>'stage' in('preparation','meeting') and a.payload->>'leader_email_reminder'='true'
 and a.payload->>'leader_reminder_user_id'=e.leader_id::text
 and coalesce(a.payload->>'meeting_time','') ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
 and (hr_private.conversation_meeting_at(a.payload->>'on',a.payload->>'meeting_time'))>now()
 and hr_private.active_member(c.company_id,e.user_id) and hr_private.has_module_access(c.company_id,e.user_id)
 and hr_private.has_module_access(c.company_id,e.leader_id)
 and exists(select 1 from hr_private.runtime_state where singleton and content_enabled and not restore_quarantined)
 and not exists(select 1 from hr_private.followup_deliveries d where d.case_id=c.id and d.task_key='meeting-reminder' and d.due_on=(a.payload->>'on')::date and d.recipient_id=e.leader_id and d.bucket=-12000-(split_part(a.payload->>'meeting_time',':',1)::integer*60+split_part(a.payload->>'meeting_time',':',2)::integer) and d.status<>'suppressed')
 order by c.id limit 1000
 on conflict(case_id,task_key,due_on,bucket,recipient_id) do update set status='pending',available_at=excluded.available_at,attempt=null
 where hr_private.followup_deliveries.status='suppressed';
end$$;

create function hr_private.queue_conversation_feedback(c uuid,eid uuid,cid uuid) returns void
language plpgsql security definer set search_path='' as $$declare added uuid;begin
 if not exists(select 1 from hr_private.followup_settings where singleton and enabled) then return;end if;
 insert into hr_private.followup_deliveries(case_id,company_id,artifact_id,task_key,due_on,bucket,recipient_id)
 select t.id,t.company_id,a.id,'employee-feedback',(now() at time zone 'Europe/Oslo')::date,
 -2000000-(a.payload->>'employee_feedback_revision')::integer,e.leader_id
 from hr_private.conversations t join hr_private.artifacts a on a.id=t.current_artifact_id
 join hr_private.employees e on e.id=t.employee_id and e.company_id=t.company_id
 where t.company_id=c and t.employee_id=eid and t.id=cid and e.leader_id is not null
 and hr_private.has_module_access(c,e.leader_id) and hr_private.has_module_access(c,e.user_id)
 on conflict(case_id,task_key,due_on,bucket,recipient_id) do nothing returning id into added;
 if added is not null then perform hr_private.invoke_conversation_mail_worker('employee-feedback');end if;
end$$;

create function public.hr_conversation_reminder(p_company_id uuid,p_employee_id uuid,p_employee_revision integer,
 p_conversation_id uuid,p_revision integer,p_enabled boolean) returns jsonb
language plpgsql security definer set search_path='' as $$declare e hr_private.employees%rowtype;t hr_private.conversations%rowtype;v jsonb;aid uuid:=gen_random_uuid();begin
 perform 1 from hr_private.firms where company_id=p_company_id for update;
 e:=hr_private.conversation_employee(p_company_id,p_employee_id);
 if auth.uid() is distinct from e.leader_id then raise exception 'Bare nærmeste leder velger egen e-postpåminnelse.' using errcode='42501';end if;
 if p_employee_revision is distinct from e.revision then raise exception 'Medarbeiderens tilgang er endret.' using errcode='40001';end if;
 select * into t from hr_private.conversations where company_id=p_company_id and employee_id=e.id and id=p_conversation_id for update;
 if t.id is null then raise exception 'Samtalen er ikke tilgjengelig.' using errcode='42501';end if;
 if p_revision is distinct from t.revision then raise exception 'Samtalen er endret. Hent lagret utgave.' using errcode='40001';end if;
 select payload into v from hr_private.artifacts where id=t.current_artifact_id;
 if p_enabled is null or v->>'stage' not in('preparation','meeting') then raise exception 'Velg påminnelse før referatet sendes til gjennomgang.' using errcode='22023';end if;
 if p_enabled and coalesce(v->>'meeting_time','') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then raise exception 'Velg klokkeslett før påminnelsen.' using errcode='22023';end if;
 if p_enabled and hr_private.conversation_meeting_at(v->>'on',v->>'meeting_time') is null then raise exception 'Klokkeslettet finnes ikke ved overgangen til sommertid. Velg et annet tidspunkt.' using errcode='22023';end if;
 if p_enabled and hr_private.conversation_meeting_at(v->>'on',v->>'meeting_time')<=now() then raise exception 'Velg et tidspunkt i fremtiden før påminnelsen.' using errcode='22023';end if;
 if coalesce(v->>'leader_email_reminder','false')=p_enabled::text and v->>'leader_reminder_user_id'=auth.uid()::text then return public.hr_conversation_get(p_company_id,e.id,t.id);end if;
 v:=v||jsonb_build_object('leader_email_reminder',p_enabled,'leader_reminder_user_id',auth.uid(),
 'revision',t.revision+1,'saved_at',now(),'saved_by',auth.uid());
 insert into hr_private.artifacts(id,company_id,employee_id,employee_revision,kind,payload,review_on)
 values(aid,p_company_id,e.id,e.revision,'version',v,(select review_on from hr_private.firms where company_id=p_company_id));
 update hr_private.conversations set revision=revision+1,current_artifact_id=aid where id=t.id;
 if p_enabled then perform hr_private.queue_conversation_reminders(p_company_id);perform hr_private.invoke_conversation_mail_worker('meeting-reminder');end if;
 return public.hr_conversation_get(p_company_id,e.id,t.id);
end$$;

create function public.hr_conversation_mail_reserve(p_kind text) returns jsonb
language plpgsql security definer set search_path='' as $$declare d hr_private.followup_deliveries%rowtype;email text;begin
 if p_kind not in('meeting-reminder','employee-feedback') or not exists(select 1 from hr_private.followup_settings where singleton and enabled) then return null;end if;
 select * into d from hr_private.followup_deliveries where task_key=p_kind and
 ((status='pending' and available_at<=now())or(status='sending' and reserved_at<now()-interval '5 minutes'))
 order by available_at,id for update skip locked limit 1;if d.id is null then return null;end if;
 select p.email into email from public.profiles p where p.id=d.recipient_id;
 if email is null or length(email)>254 or email ~ '[[:space:]]' or email !~ '^[^@ ]+@[^@ ]+\.[^@ ]+$'
 or(d.recipient_email is not null and d.recipient_email<>email) or not hr_private.conversation_mail_live(d.id) then
 update hr_private.followup_deliveries set status='suppressed' where id=d.id;return jsonb_build_object('suppressed',true);end if;
 if d.attempts>=10 or(d.first_attempt_at is not null and d.first_attempt_at<now()-interval '23 hours') then
 update hr_private.followup_deliveries set status='failed' where id=d.id;return jsonb_build_object('suppressed',true);end if;
 update hr_private.followup_deliveries set status='sending',attempt=gen_random_uuid(),attempts=attempts+1,recipient_email=email,
 reserved_at=now(),first_attempt_at=coalesce(first_attempt_at,now()) where id=d.id returning * into d;
 return jsonb_build_object('id',d.id,'attempt',d.attempt,'to',email)||case when p_kind='meeting-reminder' then
 jsonb_build_object('on',d.due_on,'time',lpad(((-12000-d.bucket)/60)::text,2,'0')||':'||lpad(((-12000-d.bucket)%60)::text,2,'0')) else '{}'::jsonb end;
end$$;

create function public.hr_conversation_mail_validate(p_id uuid,p_attempt uuid,p_kind text,p_on date default null,p_time text default null) returns boolean
language sql security definer set search_path='' as $$select exists(
 select 1 from hr_private.followup_deliveries d join public.profiles p on p.id=d.recipient_id
 join hr_private.followup_settings cfg on cfg.singleton and cfg.enabled
 where d.id=p_id and d.attempt=p_attempt and d.task_key=p_kind and p_kind in('meeting-reminder','employee-feedback')
 and d.status='sending' and d.reserved_at>now()-interval '5 minutes' and p.email=d.recipient_email
 and hr_private.conversation_mail_live(d.id)
 and(case when p_kind='meeting-reminder' then d.due_on=p_on and
 p_time=lpad(((-12000-d.bucket)/60)::text,2,'0')||':'||lpad(((-12000-d.bucket)%60)::text,2,'0')
 else p_on is null and p_time is null end))$$;

create or replace function public.hr_conversation_command(p_company_id uuid,p_employee_id uuid,p_employee_revision integer,
 p_conversation_id uuid,p_revision integer,p_action text,p_data jsonb default '{}'::jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare e hr_private.employees%rowtype;t hr_private.conversations%rowtype;v jsonb;a jsonb;q jsonb;keys text[];
 aid uuid:=gen_random_uuid();is_employee boolean;is_leader boolean;side text;changed boolean:=true;notify_feedback boolean:=false;owner uuid;ids uuid[]:='{}';qid uuid;
begin
 perform 1 from hr_private.firms where company_id=p_company_id for update;
 e:=hr_private.conversation_employee(p_company_id,p_employee_id);
 if p_employee_revision is distinct from e.revision then raise exception 'Medarbeiderens tilgang er endret.' using errcode='40001';end if;
 select * into t from hr_private.conversations where company_id=p_company_id and employee_id=e.id and id=p_conversation_id for update;
 if t.id is null then raise exception 'Samtalen er ikke tilgjengelig.' using errcode='42501';end if;
 if p_revision is distinct from t.revision then raise exception 'Samtalen er endret. Arbeidet ditt er beholdt; hent ny utgave.' using errcode='40001';end if;
 select payload into v from hr_private.artifacts where id=t.current_artifact_id;
 -- Mutations retain the private preparation; redaction is only for responses.
 if v#>>'{confirmations,leader,user_id}' is distinct from e.leader_id::text then
  v:=jsonb_set(v,'{confirmations,leader}','null'::jsonb);
  if v->>'stage'='completed' then v:=jsonb_set(v,'{stage}','"awaiting"'::jsonb);end if;
 end if;
 is_employee:=coalesce(auth.uid()=e.user_id,false);is_leader:=coalesce(auth.uid()=e.leader_id,false);
 if p_action is null or p_action not in('preparation','share','meeting','ready','comment','confirm','revise')
 or jsonb_typeof(p_data) is distinct from 'object' or octet_length(p_data::text)>180000 then
  raise exception 'Ugyldig samtalehandling.' using errcode='22023';end if;
 keys:=case p_action when 'preparation' then array['answers'] when 'meeting' then array['answers','actions','next_on']
 when 'comment' then array['text'] else '{}'::text[] end;
 if exists(select 1 from jsonb_object_keys(p_data) k where not k=any(keys)) or not p_data ?& keys then
  raise exception 'Ukjente eller manglende samtalefelt.' using errcode='22023';end if;
 notify_feedback:=is_employee and(p_action='share' or(p_action='comment' and v#>'{comments,employee}' is distinct from p_data->'text'));
 if p_action in('preparation','share') then
  if not is_employee or v->>'stage'<>'preparation' then raise exception 'Bare medarbeideren kan forberede sin åpne kladd.' using errcode='42501';end if;
  a:=case when p_action='preparation' then p_data->'answers' else v->'preparation' end;
  perform hr_private.validate_conversation_answers(a,v->'template','preparation',p_action='share');
  v:=jsonb_set(v,'{preparation}',a);
  if p_action='share' then v:=v||jsonb_build_object('stage','meeting','shared',true);end if;
 elsif p_action in('meeting','ready','revise') then
  if not is_leader then raise exception 'Bare nærmeste leder redigerer møtereferatet.' using errcode='42501';end if;
  if p_action='revise' then
   if v->>'stage' not in('awaiting','completed') then raise exception 'Referatet er allerede åpent.' using errcode='22023';end if;
   v:=jsonb_set(v,'{stage}','"meeting"'::jsonb);
  else
   if v->>'stage' not in('meeting','awaiting') then raise exception 'Medarbeideren må dele forberedelsen først.' using errcode='22023';end if;
   if p_action='meeting' then
    perform hr_private.validate_conversation_answers(p_data->'answers',v->'template','meeting',false);
    if jsonb_typeof(p_data->'actions') is distinct from 'array' or jsonb_array_length(p_data->'actions')>12
    or jsonb_typeof(p_data->'next_on') is distinct from 'string' then raise exception 'Ugyldige tiltak eller oppfølgingsdato.' using errcode='22023';end if;
    if p_data->>'next_on'<>'' then
     if p_data->>'next_on' !~ '^\d{4}-\d{2}-\d{2}$' then raise exception 'Ugyldig oppfølgingsdato.' using errcode='22023';end if;
     perform(p_data->>'next_on')::date;
    end if;
    for q in select value from jsonb_array_elements(p_data->'actions') loop
     if jsonb_typeof(q) is distinct from 'object' or not q ?& array['id','task','owner_id','due_on','done']
     or exists(select 1 from jsonb_object_keys(q) k where not k=any(array['id','task','owner_id','due_on','done']))
     or jsonb_typeof(q->'task') is distinct from 'string' or length(trim(q->>'task')) not between 1 and 600
     or jsonb_typeof(q->'done') is distinct from 'boolean' or jsonb_typeof(q->'due_on') is distinct from 'string'
     or q->>'due_on' !~ '^\d{4}-\d{2}-\d{2}$' then raise exception 'Hvert tiltak trenger oppgave, ansvarlig og frist.' using errcode='22023';end if;
     qid:=(q->>'id')::uuid;owner:=(q->>'owner_id')::uuid;
     if qid is null or qid=any(ids) or owner is null or (owner is distinct from e.user_id and owner is distinct from e.leader_id)
      or not hr_private.active_member(p_company_id,owner) then raise exception 'Velg medarbeideren eller lederen som ansvarlig.' using errcode='22023';end if;
     ids:=array_append(ids,qid);perform(q->>'due_on')::date;
    end loop;
    if jsonb_array_length(p_data->'actions')>0 and p_data->>'next_on'='' then raise exception 'Velg neste oppfølgingsdato når tiltak er avtalt.' using errcode='22023';end if;
    v:=v||jsonb_build_object('meeting',p_data->'answers','actions',p_data->'actions','next_on',p_data->>'next_on','stage','meeting');
   else
    perform hr_private.validate_conversation_answers(v->'meeting',v->'template','meeting',true);
    v:=jsonb_set(v,'{stage}','"awaiting"'::jsonb);
   end if;
  end if;
 elsif p_action='comment' then
  if not(is_employee or is_leader) or not(v->>'shared')::boolean then raise exception 'Bare partene kan legge til egne kommentarer.' using errcode='42501';end if;
  if jsonb_typeof(p_data->'text') is distinct from 'string' or length(p_data->>'text')>4000 then raise exception 'Kommentaren er for lang.' using errcode='22023';end if;
  side:=case when is_employee then 'employee' else 'leader' end;
  v:=jsonb_set(v,array['comments',side],p_data->'text');
  if v->>'stage'='completed' then v:=jsonb_set(v,'{stage}','"awaiting"'::jsonb);end if;
 else
  if not(is_employee or is_leader) or v->>'stage' not in('awaiting','completed') then raise exception 'Begge parter bekrefter selv etter gjennomgang.' using errcode='42501';end if;
  changed:=false;side:=case when is_employee then 'employee' else 'leader' end;
  if v#>>array['confirmations',side,'user_id']=auth.uid()::text then return public.hr_conversation_get(p_company_id,e.id,t.id);end if;
  v:=jsonb_set(v,array['confirmations',side],jsonb_build_object('user_id',auth.uid(),'at',now(),'content_version',v->'content_version'));
  if v#>>'{confirmations,employee,user_id}'=e.user_id::text and v#>>'{confirmations,leader,user_id}'=e.leader_id::text then
   v:=jsonb_set(v,'{stage}','"completed"'::jsonb);end if;
 end if;
 if changed then v:=v||jsonb_build_object('content_version',(v->>'content_version')::integer+1,
 'confirmations',jsonb_build_object('employee',null,'leader',null));end if;
 v:=v||jsonb_build_object('revision',t.revision+1,'leader_id',e.leader_id,'saved_at',now(),'saved_by',auth.uid());
 if notify_feedback then v:=v||jsonb_build_object('employee_feedback_revision',t.revision+1);end if;
 insert into hr_private.artifacts(id,company_id,employee_id,employee_revision,kind,payload,review_on)
 values(aid,p_company_id,e.id,e.revision,'version',v,(select review_on from hr_private.firms where company_id=p_company_id));
 update hr_private.conversations set revision=revision+1,current_artifact_id=aid where id=t.id;
 if notify_feedback then perform hr_private.queue_conversation_feedback(p_company_id,e.id,t.id);end if;
 return public.hr_conversation_get(p_company_id,e.id,t.id);
end$$;

create or replace function hr_private.invoke_followup_worker() returns void
language plpgsql security definer set search_path='' as $$declare cfg hr_private.followup_settings%rowtype;token text;begin
 -- Explicit invitations run at any time; deadline reminders keep their Oslo office hours.
 perform hr_private.invoke_conversation_invitation_worker();
 perform hr_private.queue_conversation_reminders();
 perform hr_private.invoke_conversation_mail_worker('meeting-reminder');
 perform hr_private.invoke_conversation_mail_worker('employee-feedback');
 if extract(hour from now() at time zone 'Europe/Oslo') not between 9 and 16 then
  return;end if;
 select * into cfg from hr_private.followup_settings where singleton;
 if not cfg.enabled or cfg.endpoint !~ '^https://[a-z0-9]{20}\.supabase\.co/functions/v1/hr-followup-reminders$' then return;end if;
 perform hr_private.queue_followup_reminders();
 if not exists(select 1 from hr_private.followup_deliveries where bucket>=-3 and ((status='pending' and available_at<=now())or(status='sending' and reserved_at<now()-interval '5 minutes'))) then return;end if;
 select decrypted_secret into token from vault.decrypted_secrets where id=cfg.secret_id;
 perform net.http_post(url:=cfg.endpoint,headers:=jsonb_build_object('content-type','application/json','x-hr-followup-token',token),body:='{}'::jsonb,timeout_milliseconds:=40000);
end$$;
revoke all on function hr_private.conversation_meeting_at(text,text),hr_private.conversation_mail_live(uuid),hr_private.invoke_conversation_mail_worker(text),hr_private.queue_conversation_reminders(uuid),hr_private.queue_conversation_feedback(uuid,uuid,uuid) from public,anon,authenticated,service_role;
revoke all on function public.hr_conversation_reminder(uuid,uuid,integer,uuid,integer,boolean) from public,anon,authenticated,service_role;
grant execute on function public.hr_conversation_reminder(uuid,uuid,integer,uuid,integer,boolean) to authenticated;
revoke all on function public.hr_conversation_mail_reserve(text),public.hr_conversation_mail_validate(uuid,uuid,text,date,text) from public,anon,authenticated,service_role;
grant execute on function public.hr_conversation_mail_reserve(text),public.hr_conversation_mail_validate(uuid,uuid,text,date,text) to service_role;
notify pgrst,'reload schema';
