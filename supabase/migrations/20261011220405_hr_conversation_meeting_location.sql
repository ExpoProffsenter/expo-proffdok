-- Meeting place stays in versioned private payloads and existing cascade-purged mail snapshots.
-- No new table, trigger, cron, token or role bypass. Legacy start/schedule RPCs remain compatible.
create function hr_private.conversation_location_ok(v text) returns boolean
language sql immutable set search_path='' as $$select coalesce(char_length(v) between 1 and 200 and v ~ '[^[:space:]]' and v !~ '[[:cntrl:]]',false)$$;
create function hr_private.conversation_invitation_bucket(v integer) returns boolean
language sql immutable set search_path='' as $$select coalesce(v between -11439 and -10000 or v between -2999999 and -2000001,false)$$;
create function hr_private.conversation_invitation_matches(snapshot_id uuid,on_date date,on_time text,location text) returns boolean
language sql stable set search_path='' as $$select hr_private.conversation_location_ok(location) and exists(
 select 1 from hr_private.artifacts a where a.id=snapshot_id and a.payload->>'type'='conversation'
 and a.payload->>'on'=on_date::text and a.payload->>'meeting_time'=on_time and a.payload->>'meeting_location'=location)$$;


create function hr_private.conversation_invitation_brand(c uuid) returns jsonb
language sql stable set search_path='' as $$select jsonb_build_object('name',s.display_name,'logo',coalesce(
 (select nullif(trim(x.logo_url),'') from public.companies x where public.sales_normalize_company_name(x.company_name)=s.normalized_name order by x.created_at,x.id limit 1),
 (select nullif(trim(p.logo_url),'') from public.profiles p where public.sales_normalize_company_name(p.company_name)=s.normalized_name order by case when p.company_role='firmaadmin' and p.approved and not p.deactivated then 0 else 1 end,p.created_at,p.id limit 1),
 case when s.normalized_name=public.sales_normalize_company_name('Ringside Rørleggerbedrift AS') then '/brands/ringside-rorleggerbedrift.png' when s.normalized_name=public.sales_normalize_company_name('Bademiljø Expo') then '/brands/bademiljo-expo-ringside.png' else '/expo-logo.png' end))
 from public.sales_company_scopes s where s.id=c$$;

create function public.hr_conversation_start_at_place(p_company_id uuid,p_employee_id uuid,p_employee_revision integer,
 p_conversation_id uuid,p_template_id uuid,p_template_revision integer,p_on date,p_time text,p_location text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare e hr_private.employees%rowtype;t hr_private.conversation_templates%rowtype;tpl jsonb;v jsonb;aid uuid:=gen_random_uuid();old hr_private.conversations%rowtype;location text:=btrim(p_location);
begin
 perform 1 from hr_private.firms where company_id=p_company_id for update;
 e:=hr_private.conversation_employee(p_company_id,p_employee_id);
 if auth.uid() is distinct from e.leader_id then raise exception 'Nærmeste leder starter samtalen.' using errcode='42501';end if;
 if p_employee_revision is distinct from e.revision then raise exception 'Medarbeiderens tilgang er endret.' using errcode='40001';end if;
 if not hr_private.conversation_location_ok(location) then raise exception 'Velg sted eller adresse, maksimalt 200 tegn på én linje.' using errcode='22023';end if;
 if p_time is null or p_time !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then raise exception 'Velg klokkeslett med timer og minutter.' using errcode='22023';end if;
 if p_conversation_id is null or p_on is null then raise exception 'Samtaleidentitet og dato kreves.' using errcode='22023';end if;
 select * into old from hr_private.conversations where id=p_conversation_id;
 if old.id is not null then
  if old.company_id<>p_company_id or old.employee_id<>e.id then raise exception 'Samtalen er ikke tilgjengelig.' using errcode='42501';end if;
  -- Unknown start responses are resolved by reading this ID, never by creating another case.
  return public.hr_conversation_get(p_company_id,e.id,old.id);
 end if;
 select * into t from hr_private.conversation_templates where company_id=p_company_id and id=p_template_id;
 if t.id is null or t.archived then raise exception 'Velg en aktiv samtalemal.' using errcode='22023';end if;
 if t.revision is distinct from p_template_revision then raise exception 'Malen er endret. Velg ny utgave.' using errcode='40001';end if;
 select content into tpl from hr_private.conversation_template_versions where template_id=t.id and revision=t.revision;
 if tpl->>'kind'='sickleave' then raise exception 'Velg en medarbeidersamtale, ikke sykefraværsplan.' using errcode='22023';end if;
 if(select count(*) from hr_private.conversations where company_id=p_company_id and employee_id=e.id)>=200 then
  raise exception 'Kontroller lagringsbehovet før flere samtaler opprettes.' using errcode='22023';end if;
 v:=jsonb_build_object('type','conversation','id',p_conversation_id,'revision',1,'content_version',1,
 'template_id',t.id,'template_revision',t.revision,'template',tpl,'leader_id',e.leader_id,'on',p_on,'meeting_time',p_time,'meeting_location',location,'meeting_timezone','Europe/Oslo','stage','preparation','shared',false,
 'preparation','{}'::jsonb,'meeting','{}'::jsonb,'actions','[]'::jsonb,'next_on','',
 'comments',jsonb_build_object('employee','','leader',''),'confirmations',jsonb_build_object('employee',null,'leader',null),
 'saved_at',now(),'saved_by',auth.uid());
 insert into hr_private.artifacts(id,company_id,employee_id,employee_revision,kind,payload,review_on)
 values(aid,p_company_id,e.id,e.revision,'version',v,(select review_on from hr_private.firms where company_id=p_company_id));
 insert into hr_private.conversations values(p_conversation_id,p_company_id,e.id,1,aid);
 return public.hr_conversation_get(p_company_id,e.id,p_conversation_id);
end$$;

create function public.hr_conversation_schedule_at_place(p_company_id uuid,p_employee_id uuid,p_employee_revision integer,
 p_conversation_id uuid,p_revision integer,p_on date,p_time text,p_location text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare e hr_private.employees%rowtype;t hr_private.conversations%rowtype;v jsonb;aid uuid:=gen_random_uuid();location text:=btrim(p_location);begin
 perform 1 from hr_private.firms where company_id=p_company_id for update;
 e:=hr_private.conversation_employee(p_company_id,p_employee_id);
 if auth.uid() is distinct from e.leader_id then raise exception 'Bare nærmeste leder endrer tidspunktet.' using errcode='42501';end if;
 if p_employee_revision is distinct from e.revision then raise exception 'Medarbeiderens tilgang er endret.' using errcode='40001';end if;
 select * into t from hr_private.conversations where company_id=p_company_id and employee_id=e.id and id=p_conversation_id for update;
 if t.id is null then raise exception 'Samtalen er ikke tilgjengelig.' using errcode='42501';end if;
 if p_revision is distinct from t.revision then raise exception 'Samtalen er endret. Hent lagret utgave før du endrer tidspunkt.' using errcode='40001';end if;
 select payload into v from hr_private.artifacts where id=t.current_artifact_id;
 if v->>'stage' not in('preparation','meeting') then raise exception 'Åpne en ny referatutgave før du endrer tidspunktet.' using errcode='22023';end if;
 if not hr_private.conversation_location_ok(location) then raise exception 'Velg sted eller adresse, maksimalt 200 tegn på én linje.' using errcode='22023';end if;
 if p_on is null or p_time is null or p_time !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then raise exception 'Velg dato og klokkeslett med timer og minutter.' using errcode='22023';end if;
 if v->>'on'=p_on::text and v->>'meeting_time'=p_time and v->>'meeting_location'=location then return public.hr_conversation_get(p_company_id,e.id,t.id);end if;
 v:=v||jsonb_build_object('on',p_on,'meeting_time',p_time,'meeting_location',location,'meeting_timezone','Europe/Oslo',
 'revision',t.revision+1,'content_version',(v->>'content_version')::integer+1,'leader_id',e.leader_id,
 'confirmations',jsonb_build_object('employee',null,'leader',null),'saved_at',now(),'saved_by',auth.uid());
 insert into hr_private.artifacts(id,company_id,employee_id,employee_revision,kind,payload,review_on)
 values(aid,p_company_id,e.id,e.revision,'version',v,(select review_on from hr_private.firms where company_id=p_company_id));
 update hr_private.conversations set revision=revision+1,current_artifact_id=aid where id=t.id;
 return public.hr_conversation_get(p_company_id,e.id,t.id);
end$$;

create or replace function public.hr_conversation_invitation_reserve() returns jsonb
language plpgsql security definer set search_path='' as $$declare d hr_private.followup_deliveries%rowtype;email text;begin
 if not exists(select 1 from hr_private.followup_settings where singleton and enabled) then return null;end if;
 select * into d from hr_private.followup_deliveries where task_key='preparation' and hr_private.conversation_invitation_bucket(bucket) and ((status='pending' and available_at<=now())or(status='sending' and reserved_at<now()-interval '5 minutes'))
 order by available_at,id for update skip locked limit 1;if d.id is null then return null;end if;
 select p.email into email from public.profiles p where p.id=d.recipient_id;
 if email is null or length(email)>254 or email ~ '[[:space:]]' or email !~ '^[^@ ]+@[^@ ]+\.[^@ ]+$'
 or(d.recipient_email is not null and d.recipient_email<>email)
 or not exists(select 1 from hr_private.sick_leave_tasks(d.company_id,d.case_id) t join hr_private.artifacts a on a.id=t.artifact_id where t.recipient_id=d.recipient_id and t.task_key=d.task_key and t.due_on=d.due_on and hr_private.conversation_invitation_matches(d.artifact_id,d.due_on,a.payload->>'meeting_time',a.payload->>'meeting_location')) then
 update hr_private.followup_deliveries set status='suppressed' where id=d.id;return jsonb_build_object('suppressed',true);end if;
 if d.attempts>=10 or(d.first_attempt_at is not null and d.first_attempt_at<now()-interval '23 hours') then
 update hr_private.followup_deliveries set status='failed' where id=d.id;return jsonb_build_object('suppressed',true);end if;
 update hr_private.followup_deliveries set status='sending',attempt=gen_random_uuid(),attempts=attempts+1,recipient_email=email,
 reserved_at=now(),first_attempt_at=coalesce(first_attempt_at,now()) where id=d.id returning * into d;
 return jsonb_build_object('id',d.id,'attempt',d.attempt,'to',email,'on',d.due_on,'time',(select payload->>'meeting_time' from hr_private.artifacts where id=d.artifact_id),'location',(select payload->>'meeting_location' from hr_private.artifacts where id=d.artifact_id),'branding',hr_private.conversation_invitation_brand(d.company_id));
end$$;

create or replace function public.hr_conversation_invitation_validate(p_id uuid,p_attempt uuid,p_on date,p_time text) returns boolean
language sql security definer set search_path='' as $$select coalesce(p_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
 and public.hr_followup_worker_validate(p_id,p_attempt) and exists(
 select 1 from hr_private.followup_deliveries d join hr_private.conversations c on c.id=d.case_id and c.company_id=d.company_id
 join hr_private.artifacts a on a.id=c.current_artifact_id
 where d.id=p_id and d.attempt=p_attempt and d.task_key='preparation'
 and hr_private.conversation_invitation_bucket(d.bucket) and d.due_on=p_on and a.payload->>'meeting_time'=p_time
 and hr_private.conversation_invitation_matches(d.artifact_id,p_on,p_time,a.payload->>'meeting_location')),false)$$;

create function public.hr_conversation_invitation_validate_place(p_id uuid,p_attempt uuid,p_on date,p_time text,p_location text) returns boolean
language sql security definer set search_path='' as $$select public.hr_conversation_invitation_validate(p_id,p_attempt,p_on,p_time) and exists(
 select 1 from hr_private.followup_deliveries d where d.id=p_id and d.attempt=p_attempt
 and hr_private.conversation_invitation_matches(d.artifact_id,p_on,p_time,p_location))$$;

create or replace function hr_private.invoke_conversation_invitation_worker() returns void
language plpgsql security definer set search_path='' as $$declare cfg hr_private.followup_settings%rowtype;token text;begin
 select * into cfg from hr_private.followup_settings where singleton;
 if not cfg.enabled or cfg.endpoint !~ '^https://[a-z0-9]{20}\.supabase\.co/functions/v1/hr-followup-reminders$' then return;end if;
 if not exists(select 1 from hr_private.followup_deliveries where task_key='preparation' and hr_private.conversation_invitation_bucket(bucket)
 and ((status='pending' and available_at<=now())or(status='sending' and reserved_at<now()-interval '5 minutes'))) then return;end if;
 select decrypted_secret into token from vault.decrypted_secrets where id=cfg.secret_id;
 -- pg_net executes only after commit. A dispatch failure leaves the durable job for cron retry.
 begin
  perform net.http_post(url:=cfg.endpoint,headers:=jsonb_build_object('content-type','application/json','x-hr-followup-token',token),body:='{"invitation":true}'::jsonb,timeout_milliseconds:=40000);
 exception when others then null;end;
end$$;

create or replace function hr_private.queue_conversation_invitation(c uuid,eid uuid,cid uuid) returns void
language plpgsql security definer set search_path='' as $$declare e hr_private.employees%rowtype;t hr_private.conversations%rowtype;aid uuid;v jsonb;begin
 e:=hr_private.conversation_employee(c,eid);
 if auth.uid() is distinct from e.leader_id then raise exception 'Bare nærmeste leder sender samtalevarselet.' using errcode='42501';end if;
 select * into t from hr_private.conversations where company_id=c and employee_id=e.id and id=cid for update;
 if t.id is null then raise exception 'Samtalen er ikke tilgjengelig.' using errcode='42501';end if;
 select payload into v from hr_private.artifacts where id=t.current_artifact_id;
 if coalesce(v->>'meeting_time','') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then raise exception 'Velg klokkeslett før invitasjonen sendes.' using errcode='22023';end if;
 if not hr_private.conversation_location_ok(v->>'meeting_location') then raise exception 'Velg sted eller adresse før invitasjonen sendes.' using errcode='22023';end if;
 if t.revision>999999 then raise exception 'Kontroller lagringsbehovet før flere invitasjoner.' using errcode='22023';end if;
 if exists(select 1 from hr_private.followup_deliveries d where d.company_id=c and d.case_id=cid and d.recipient_id=e.user_id and d.task_key='preparation' and d.status<>'suppressed' and hr_private.conversation_invitation_bucket(d.bucket) and hr_private.conversation_invitation_matches(d.artifact_id,(v->>'on')::date,v->>'meeting_time',v->>'meeting_location')) then return;end if;
 if not exists(select 1 from hr_private.followup_settings where singleton and enabled) then return;end if;
 insert into hr_private.followup_deliveries(case_id,company_id,artifact_id,task_key,due_on,bucket,recipient_id)
 select case_id,company_id,artifact_id,task_key,due_on,-2000000-t.revision,recipient_id from hr_private.sick_leave_tasks(c,cid)
 where task_key='preparation' and recipient_id=e.user_id
 on conflict(case_id,task_key,due_on,bucket,recipient_id) do nothing returning id into aid;
 if aid is not null then perform hr_private.invoke_conversation_invitation_worker();end if;
end$$;

create or replace function public.hr_conversation_invitation_status(p_company_id uuid,p_employee_id uuid,p_conversation_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$declare e hr_private.employees%rowtype;t hr_private.conversations%rowtype;x jsonb;d hr_private.followup_deliveries%rowtype;v jsonb;app boolean;mail text;begin
 e:=hr_private.conversation_employee(p_company_id,p_employee_id);
 select * into t from hr_private.conversations where company_id=p_company_id and employee_id=e.id and id=p_conversation_id;
 if t.id is null then raise exception 'Samtalen er ikke tilgjengelig.' using errcode='42501';end if;
 select payload into v from hr_private.artifacts where id=t.current_artifact_id;
 select exists(select 1 from hr_private.sick_leave_tasks(p_company_id,t.id) where task_key='preparation' and recipient_id=e.user_id) into app;
 select * into d from hr_private.followup_deliveries where company_id=p_company_id and case_id=t.id and recipient_id=e.user_id and task_key='preparation' and status<>'suppressed' and due_on=(v->>'on')::date and hr_private.conversation_invitation_bucket(bucket) and hr_private.conversation_invitation_matches(artifact_id,(v->>'on')::date,v->>'meeting_time',v->>'meeting_location') order by sent_at desc nulls last,id limit 1;
 mail:=case when d.status='sent' then 'sent'
 when not exists(select 1 from hr_private.followup_settings where singleton and enabled) then 'disabled'
 when d.id is null then 'not_queued'
 when not app then 'suppressed' else d.status end;
 x:=hr_private.require_context(p_company_id);
 return jsonb_build_object('context',x,'employee',jsonb_build_object('id',e.id),'conversation_id',t.id,
 'location_required',not hr_private.conversation_location_ok(v->>'meeting_location'),'app_notification',app,'email_status',mail,'sent_at',d.sent_at,
 'can_notify',hr_private.conversation_location_ok(v->>'meeting_location') and auth.uid()=e.leader_id and app and mail in('not_queued','disabled') and coalesce(v->>'meeting_time','') ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$');
end$$;


revoke all on function hr_private.conversation_invitation_brand(uuid),hr_private.conversation_location_ok(text),hr_private.conversation_invitation_bucket(integer),hr_private.conversation_invitation_matches(uuid,date,text,text) from public,anon,authenticated,service_role;
revoke all on function public.hr_conversation_start_at_place(uuid,uuid,integer,uuid,uuid,integer,date,text,text),public.hr_conversation_schedule_at_place(uuid,uuid,integer,uuid,integer,date,text,text) from public,anon,authenticated,service_role;
grant execute on function public.hr_conversation_start_at_place(uuid,uuid,integer,uuid,uuid,integer,date,text,text),public.hr_conversation_schedule_at_place(uuid,uuid,integer,uuid,integer,date,text,text) to authenticated;
revoke all on function public.hr_conversation_invitation_validate_place(uuid,uuid,date,text,text) from public,anon,authenticated,service_role;
grant execute on function public.hr_conversation_invitation_validate_place(uuid,uuid,date,text,text) to service_role;
notify pgrst,'reload schema';
