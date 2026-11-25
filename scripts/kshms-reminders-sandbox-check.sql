-- Synthetic identities and documents only; every write is rolled back.
begin;
set local statement_timeout='25s';
set local lock_timeout='2s';
create function pg_temp.ex_assert(ok boolean,label text) returns void language plpgsql as $$begin if ok is distinct from true then raise exception 'REMINDER QA: %',label;end if;perform set_config('ks.mail.checks',(coalesce(nullif(current_setting('ks.mail.checks',true),''),'0')::integer+1)::text,true);end$$;
create function pg_temp.ex_reject(query text,code text default null) returns void language plpgsql as $$declare failed boolean:=false;got text;begin begin execute query;exception when others then failed:=true;get stacked diagnostics got=returned_sqlstate;end;perform pg_temp.ex_assert(failed and (code is null or got=code),'rejected request, expected '||coalesce(code,'error')||', received '||coalesce(got,'success'));end$$;
do $$declare c uuid:=gen_random_uuid();foreign_company uuid:=gen_random_uuid();u uuid;sys uuid;k text;pid uuid;begin
 insert into public.sales_company_scopes(id,normalized_name,display_name) values(c,public.sales_normalize_company_name('NOTIFICATION QA '||c),'NOTIFICATION QA '||c),(foreign_company,public.sales_normalize_company_name('FOREIGN EXEC QA '||foreign_company),'FOREIGN EXEC QA '||foreign_company);perform set_config('ks.mail.company',c::text,true);
 select id into sys from public.profiles where system_role='systemadmin' and approved and not coalesce(deactivated,false) limit 1;assert sys is not null;perform set_config('ks.mail.sys',sys::text,true);
 foreach k in array array['admin','worker','colleague','isolated','without'] loop
  u:=gen_random_uuid();perform set_config('ks.mail.'||k,u::text,true);
  insert into auth.users(id,aud,role,email,created_at,updated_at,raw_app_meta_data,raw_user_meta_data) values(u,'authenticated','authenticated','project-exec-qa-'||u||'@example.invalid',now(),now(),'{}',jsonb_build_object('full_name','NOTIFICATION QA '||k));
  insert into public.profiles(id,email,company_name,approved,deactivated,role,company_role) values(u,'project-exec-qa-'||u||'@example.invalid','NOTIFICATION QA '||c,true,false,case when k='admin' then 'admin' else 'member' end,case when k='admin' then 'firmaadmin' else 'ansatt' end) on conflict(id) do update set company_name=excluded.company_name,approved=true,deactivated=false,role=excluded.role,company_role=excluded.company_role,system_role=null;
  insert into public.sales_company_memberships(company_id,user_id,is_primary,workspace_role) values(c,u,true,case when k='admin' then 'firmaadmin' else 'ansatt' end) on conflict(company_id,user_id) do update set workspace_role=excluded.workspace_role;
  insert into public.user_active_company_scope(user_id,company_id) values(u,c) on conflict(user_id) do update set company_id=excluded.company_id;
  if k not in('isolated','without') then insert into public.user_module_access(user_id,module_key) values(u,'projects') on conflict do nothing;end if;
 end loop;
 foreach k in array array['project','project_two','foreign_project'] loop
  pid:=gen_random_uuid();perform set_config('ks.mail.'||k,pid::text,true);
  insert into public.projects(id,user_id,company_scope_id,title,data) values(pid,current_setting('ks.mail.worker')::uuid,case when k='foreign_project' then foreign_company else c end,'NOTIFICATION QA '||k,'{"project":{"projectName":"NOTIFICATION QA","projectDeviations":[{"id":"keep","status":"Åpent"}]},"overtagelse":{"signKunde":"keep"},"checklist":{"keep":{"comment":"Keep"}}}');
 end loop;
 perform set_config('ks.mail.project.data',(select data::text from public.projects where id=current_setting('ks.mail.project')::uuid),true);
end$$;
set local role authenticated;
do $$declare c uuid:=current_setting('ks.mail.company')::uuid;u uuid:=current_setting('ks.mail.worker')::uuid;r jsonb;k text;d date;today date:=(now() at time zone 'Europe/Oslo')::date;begin
 perform set_config('request.jwt.claim.sub',current_setting('ks.mail.sys'),true);perform public.kshms_activate(c,true);
 perform set_config('request.jwt.claim.sub',current_setting('ks.mail.admin'),true);
 foreach k in array array['worker','colleague'] loop
  perform public.kshms_command(c,'access',jsonb_build_object('user_id',current_setting('ks.mail.'||k)::uuid,'role','reader','enabled',true));
 end loop;
 foreach k in array array['overdue','today','soon','later','old','recent'] loop
  d:=today+case k when 'overdue' then -15 when 'today' then 0 when 'soon' then 3 when 'later' then 4 when 'old' then -90 else -1 end;
  r:=public.kshms_deviation_command(c,'create',jsonb_build_object('request_id',gen_random_uuid(),'title','REMINDER QA '||k,'event','Synthetic deadline fixture only.','category','ruh','responsible_id',u,'due_on',d));
  perform set_config('ks.reminder.'||k,r->>'id',true);
 end loop;
 perform set_config('request.jwt.claim.sub',u::text,true);r:=public.kshms_deviation_tasks(c);
 perform pg_temp.ex_assert((r->>'count')::int=6 and (r->>'overdue')::int=3 and (r->>'due_today')::int=1 and (r->>'due_soon')::int=1,'scoped deadline counts');
 foreach k in array array['overdue','today','soon','later'] loop
  perform pg_temp.ex_assert(exists(select 1 from jsonb_array_elements(r->'items') i where i->>'id'=current_setting('ks.reminder.'||k) and i->>'deadline_status'=k),'deadline label '||k);
 end loop;
 perform set_config('request.jwt.claim.sub',current_setting('ks.mail.colleague'),true);
 perform pg_temp.ex_assert((public.kshms_deviation_tasks(c)->>'count')::int=0,'another employee cannot see responsible tasks');
 perform pg_temp.ex_reject('select kshms_private.sync_deviation_reminders()','42501');
 perform pg_temp.ex_reject('select * from public.kshms_notification_outbox','42501');
 perform pg_temp.ex_reject('select public.kshms_deviation_tasks(gen_random_uuid())','42501');
end$$;
reset role;
do $$declare c uuid:=current_setting('ks.mail.company')::uuid;today date:=(now() at time zone 'Europe/Oslo')::date;begin
 perform pg_temp.ex_assert(kshms_private.reminder_slot(date '2026-10-01',date '2026-10-01') is null,'no reminder on deadline');
 perform pg_temp.ex_assert(kshms_private.reminder_slot(date '2026-10-01',date '2026-10-02')=date '2026-10-02','first overdue day');
 perform pg_temp.ex_assert(kshms_private.reminder_slot(date '2026-10-01',date '2026-10-08')=date '2026-10-02','same slot through seventh day');
 perform pg_temp.ex_assert(kshms_private.reminder_slot(date '2026-10-01',date '2026-10-09')=date '2026-10-09','new slot after seven days');
 update public.kshms_notification_outbox set status='sent',created_at=now()-interval '8 days' where company_id=c and deviation_id<>current_setting('ks.reminder.recent')::uuid;
 perform kshms_private.sync_deviation_reminders();
 perform pg_temp.ex_assert(not exists(select 1 from public.kshms_notification_outbox where company_id=c and notification_phase='reminder'),'disabled worker creates no reminders');
 update kshms_private.email_worker_settings set enabled=true,app_url='https://notification-qa.example.com';
 update kshms_private.email_worker_settings set reminders_enabled_since=now()-interval '120 days';
 update public.company_module_access set updated_at=now()-interval '120 days' where company_id=c and module_key='kshms';
 update public.sales_company_memberships set updated_at=now()-interval '120 days' where company_id=c;
 update public.kshms_member_access set changed_at=now()-interval '120 days' where company_id=c;
 perform kshms_private.sync_deviation_reminders();perform kshms_private.sync_deviation_reminders();
 perform pg_temp.ex_assert((select count(*)=2 from public.kshms_notification_outbox where company_id=c and notification_phase='reminder'),'weekly collector idempotent, recent assignment excluded');
 perform pg_temp.ex_assert((select count(*)=1 from public.kshms_notification_outbox where deviation_id=current_setting('ks.reminder.old')::uuid and notification_phase='reminder'),'old overdue case has one current slot, no backlog');
 perform pg_temp.ex_assert(not exists(select 1 from public.kshms_notification_outbox where company_id=c and notification_phase='reminder' and deviation_id in(current_setting('ks.reminder.today')::uuid,current_setting('ks.reminder.soon')::uuid,current_setting('ks.reminder.later')::uuid,current_setting('ks.reminder.recent')::uuid)),'no early or duplicate assignment reminders');
 perform pg_temp.ex_assert((select bool_and(kshms_private.notification_active(o)) from public.kshms_notification_outbox o where company_id=c and notification_phase='reminder'),'current reminders eligible');
 update public.kshms_notification_outbox set created_at=now()-interval '8 days',status='sent',sent_at=now() where deviation_id=current_setting('ks.reminder.recent')::uuid;
 perform kshms_private.sync_deviation_reminders();
 perform pg_temp.ex_assert(not exists(select 1 from public.kshms_notification_outbox where deviation_id=current_setting('ks.reminder.recent')::uuid and notification_phase='reminder'),'old assignment delivered today has seven-day quiet period');
 update public.kshms_deviations set due_on=today+3 where id=current_setting('ks.reminder.old')::uuid;
 perform pg_temp.ex_assert((select not kshms_private.notification_active(o) from public.kshms_notification_outbox o where deviation_id=current_setting('ks.reminder.old')::uuid and notification_phase='reminder'),'changed deadline invalidates queued reminder');
 update public.kshms_notification_outbox set status='suppressed' where notification_phase='reminder' and deviation_id=current_setting('ks.reminder.old')::uuid;
 -- Only the synthetic current reminder is made deliverable; no HTTP is invoked.
 update public.kshms_notification_outbox set status='suppressed' where company_id<>c and status in('pending','sending');
 update public.kshms_notification_outbox set status='suppressed' where company_id=c and notification_phase='assignment' and status in('pending','sending');
 perform set_config('request.jwt.claim.sub',current_setting('ks.mail.sys'),true);
 update public.profiles set email='notification-qa@example.com' where id=current_setting('ks.mail.worker')::uuid;
end$$;
set local role service_role;
do $$declare job jsonb;begin
 job:=public.kshms_email_reserve();perform set_config('ks.reminder.job',job->>'id',true);
 perform pg_temp.ex_assert(job->>'notification_phase'='reminder' and job->>'deviation_id'=current_setting('ks.reminder.overdue'),'reserve correct reminder and protected object');
 perform pg_temp.ex_assert(public.kshms_email_validate_attempt((job->>'id')::uuid,1),'current reminder validates');
 perform public.kshms_email_finish_attempt((job->>'id')::uuid,1,false);
 perform pg_temp.ex_assert(public.kshms_email_reserve() is null,'provider retry obeys delay');
end$$;
reset role;
update public.kshms_notification_outbox set available_at=now() where id=current_setting('ks.reminder.job')::uuid;
set local role service_role;
do $$declare job jsonb;begin
 job:=public.kshms_email_reserve();perform pg_temp.ex_assert(job->>'id'=current_setting('ks.reminder.job') and job->>'attempt'='2','retry retains idempotency identity');
 perform public.kshms_email_finish_attempt((job->>'id')::uuid,1,true);
 perform pg_temp.ex_assert(public.kshms_email_validate_attempt((job->>'id')::uuid,2),'stale finish does not finish new attempt');
end$$;
reset role;
do $$declare c uuid:=current_setting('ks.mail.company')::uuid;u uuid:=current_setting('ks.mail.worker')::uuid;begin
 update public.profiles set deactivated=true where id=u;
 perform pg_temp.ex_assert((select status='suppressed' from public.kshms_notification_outbox where id=current_setting('ks.reminder.job')::uuid),'profile disable immediately suppresses in-flight reminder');
 update public.profiles set deactivated=false where id=u;
 perform pg_temp.ex_assert((select status='suppressed' from public.kshms_notification_outbox where id=current_setting('ks.reminder.job')::uuid),'profile reactivation cannot restore old reminder');
 update public.kshms_notification_outbox set status='sending' where id=current_setting('ks.reminder.job')::uuid;
 update public.kshms_member_access set enabled=false where company_id=c and user_id=u;
 perform pg_temp.ex_assert((select not kshms_private.notification_active(o) from public.kshms_notification_outbox o where id=current_setting('ks.reminder.job')::uuid),'removed grant invalidates reminder');
 update public.kshms_member_access set enabled=true,changed_at=now() where company_id=c and user_id=u;
 update public.kshms_notification_outbox set created_at=now()-interval '1 second' where id=current_setting('ks.reminder.job')::uuid;
 perform pg_temp.ex_assert((select not kshms_private.notification_active(o) from public.kshms_notification_outbox o where id=current_setting('ks.reminder.job')::uuid),'grant reactivation cannot replay old queued reminder');
 update public.kshms_member_access set changed_at=now()-interval '120 days' where company_id=c and user_id=u;
 update public.company_module_access set enabled=false where company_id=c and module_key='kshms';
 perform pg_temp.ex_assert((select not kshms_private.notification_active(o) from public.kshms_notification_outbox o where id=current_setting('ks.reminder.job')::uuid),'module off invalidates reminder');
 update public.company_module_access set enabled=true,updated_at=now() where company_id=c and module_key='kshms';
 perform pg_temp.ex_assert((select not kshms_private.notification_active(o) from public.kshms_notification_outbox o where id=current_setting('ks.reminder.job')::uuid),'module reactivation cannot replay old reminder');
 update public.company_module_access set updated_at=now()-interval '120 days' where company_id=c and module_key='kshms';
 update kshms_private.email_worker_settings set enabled=false;
 update kshms_private.email_worker_settings set enabled=true;
 perform pg_temp.ex_assert((select not kshms_private.notification_active(o) from public.kshms_notification_outbox o where id=current_setting('ks.reminder.job')::uuid),'transport reactivation cannot replay old reminder');
 update kshms_private.email_worker_settings set reminders_enabled_since=now()-interval '120 days';
 update public.kshms_notification_outbox set reminder_on=reminder_on-7 where id=current_setting('ks.reminder.job')::uuid;
 perform pg_temp.ex_assert((select not kshms_private.notification_active(o) from public.kshms_notification_outbox o where id=current_setting('ks.reminder.job')::uuid),'expired weekly slot cannot retry');
 update public.kshms_notification_outbox set reminder_on=reminder_on+7 where id=current_setting('ks.reminder.job')::uuid;
end$$;
set local role authenticated;
do $$declare c uuid:=current_setting('ks.mail.company')::uuid;r jsonb;begin
 perform set_config('request.jwt.claim.sub',current_setting('ks.mail.admin'),true);
 r:=public.kshms_deviation_detail(c,current_setting('ks.reminder.overdue')::uuid)->'case';
 perform public.kshms_deviation_command(c,'save',jsonb_build_object('id',current_setting('ks.reminder.overdue'),'revision',r->'revision','responsible_id',current_setting('ks.mail.colleague')));
end$$;
reset role;
select pg_temp.ex_assert((select not kshms_private.notification_active(o) from public.kshms_notification_outbox o where id=current_setting('ks.reminder.job')::uuid),'reassignment invalidates in-flight reminder');
set local role service_role;
select pg_temp.ex_assert(not public.kshms_email_validate_attempt(current_setting('ks.reminder.job')::uuid,2),'pre-send recheck suppresses changed responsibility');
reset role;
set local role authenticated;
do $$declare c uuid:=current_setting('ks.mail.company')::uuid;r jsonb;begin
 perform set_config('request.jwt.claim.sub',current_setting('ks.mail.colleague'),true);
 r:=public.kshms_deviation_detail(c,current_setting('ks.reminder.overdue')::uuid)->'case';
 r:=public.kshms_deviation_command(c,'close',jsonb_build_object('id',r->'id','revision',r->'revision','cause','Synthetic test cause','improvement_action','Synthetic completed measure','control_note','Synthetic verified result','controlled',true));
 perform pg_temp.ex_assert(r->>'status'='closed','chosen responsible closes through authenticated command');
end$$;
reset role;
do $$declare o public.kshms_notification_outbox%rowtype;begin
 select * into o from public.kshms_notification_outbox where id=current_setting('ks.reminder.job')::uuid;
 o.user_id:=current_setting('ks.mail.colleague')::uuid;o.assignment_number:=2;
 perform pg_temp.ex_assert(not kshms_private.notification_active(o),'closed case invalid even for matching current assignment');
end$$;
select current_setting('ks.mail.checks')::integer as reminder_assertions;
rollback;
