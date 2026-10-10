-- Synthetic identities and documents only; every write is rolled back.
begin;
set local statement_timeout='25s';
set local lock_timeout='2s';
create function pg_temp.ex_assert(ok boolean,label text) returns void language plpgsql as $$begin if ok is distinct from true then raise exception 'NOTIFICATION QA: %',label;end if;perform set_config('ks.mail.checks',(coalesce(nullif(current_setting('ks.mail.checks',true),''),'0')::integer+1)::text,true);end$$;
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
do $$declare c uuid:=current_setting('ks.mail.company')::uuid;a uuid:=current_setting('ks.mail.admin')::uuid;u uuid:=current_setting('ks.mail.worker')::uuid;col uuid:=current_setting('ks.mail.colleague')::uuid;e uuid:=gen_random_uuid();risk uuid:=gen_random_uuid();s uuid:=gen_random_uuid();point uuid:=gen_random_uuid();req uuid:=gen_random_uuid();content jsonb;r jsonb;v jsonb;k text;
begin
 perform set_config('request.jwt.claim.sub',current_setting('ks.mail.sys'),true);perform public.kshms_activate(c,true);
 perform set_config('request.jwt.claim.sub',a::text,true);foreach k in array array['worker','colleague'] loop perform public.kshms_command(c,'access',jsonb_build_object('user_id',current_setting('ks.mail.'||k)::uuid,'role','reader','enabled',true));end loop;
 perform public.kshms_command(c,'settings',jsonb_build_object('revision',0,'trades',jsonb_build_array('mur_flis'),'responsible_user_id',a));
 content:=jsonb_build_object('title','NOTIFICATION QA kontroll','workplace','Lager','planned_on',current_date::text,'responsible_id',u,'participants','Utfører og verneombud.','review','Gjennomgått og kontrollert.','basis','','reference','','routines','','acceptance',jsonb_build_object('low_max',4,'medium_max',12,'description','','confirmed',false),'risks','[]'::jsonb,'points',jsonb_build_array(jsonb_build_object('id',point,'title','Ferdsel')),'answers',jsonb_build_object(point::text,jsonb_build_object('status','ok','photos','[]'::jsonb)));
 r:=public.kshms_execution_command(c,'save',req,jsonb_build_object('id',e,'kind','round','revision',0,'content',content));
 perform public.kshms_execution_command(c,'save',req,jsonb_build_object('id',e,'kind','round','revision',0,'content',content));
 perform set_config('ks.mail.round',e::text,true);perform set_config('ks.mail.point',point::text,true);
 content:=content||jsonb_build_object('title','NOTIFICATION QA risiko','points','[]'::jsonb,'risks',jsonb_build_array(jsonb_build_object('id',gen_random_uuid())));
 perform public.kshms_execution_command(c,'save',gen_random_uuid(),jsonb_build_object('id',risk,'kind','risk','revision',0,'content',content));perform set_config('ks.mail.risk',risk::text,true);
 content:=jsonb_build_object('title','NOTIFICATION QA SJA','leader_id',col, 'steps',jsonb_build_array(jsonb_build_object('id',gen_random_uuid())),'participants',jsonb_build_array(jsonb_build_object('id',gen_random_uuid())));
 perform public.kshms_sja_command(c,'save',gen_random_uuid(),jsonb_build_object('id',s,'revision',0,'content',content));perform set_config('ks.mail.sja',s::text,true);
 r:=public.kshms_command(c,'save',jsonb_build_object('draft',jsonb_build_object('title','NOTIFICATION QA rutine','chapter','QA','goal','QA mål','responsibility','QA ansvar','procedure','QA fremgangsmåte','documentation','QA dokumentasjon','confirmation','QA gjennomgang','references','[]'::jsonb)));
 perform set_config('ks.mail.routine',r->>'id',true);
 v:=public.kshms_command(c,'publish',jsonb_build_object('id',r->'id','revision',r->'revision','change_summary','Første pliktige QA utgave','requires_ack',true,'acknowledge_self',true,'self_statement','Jeg har gjennomgått denne rutineversjonen, forstår mitt ansvar og vil følge rutinen. Jeg ber om forklaring eller nødvendig opplæring dersom noe er uklart, og melder fra om farlige forhold og avvik. Bekreftelsen dokumenterer gjennomgang; den erstatter ikke opplæring eller faktisk utførelse.'));
 perform set_config('ks.mail.version',v->>'id',true);
 begin perform public.kshms_email_reserve();raise exception 'Client reserved mail';exception when insufficient_privilege then perform pg_temp.ex_assert(true,'client cannot reserve mail');end;
 begin perform kshms_private.sync_due_reviews();raise exception 'Client invoked private sync';exception when insufficient_privilege then perform pg_temp.ex_assert(true,'client cannot invoke private sync');end;
end$$;
reset role;
do $$declare c uuid:=current_setting('ks.mail.company')::uuid;o public.kshms_notification_outbox%rowtype;today date:=(now() at time zone 'Europe/Oslo')::date;begin
 perform kshms_private.sync_task_reminders();
 perform pg_temp.ex_assert(not exists(select 1 from public.kshms_notification_outbox where company_id=c and notification_phase='reminder'),'disabled collector creates no task reminders');
 update kshms_private.email_worker_settings set enabled=true,app_url='https://task-qa.example.com';
 perform kshms_private.sync_task_reminders();
 perform pg_temp.ex_assert(not exists(select 1 from public.kshms_notification_outbox where company_id=c and notification_phase='reminder'),'recent assignments create no early reminders');
 update public.kshms_notification_outbox set status='sent',created_at=now()-interval '90 days',sent_at=now()-interval '90 days' where company_id=c;
 perform kshms_private.sync_task_reminders();
 perform pg_temp.ex_assert(not exists(select 1 from public.kshms_notification_outbox where company_id=c and notification_phase='reminder'),'fresh transport activation does not replay old slots');
 update kshms_private.email_worker_settings set reminders_enabled_since=now()-interval '120 days';
 update public.company_module_access set updated_at=now()-interval '120 days' where company_id=c and module_key='kshms';
 update public.sales_company_memberships set updated_at=now()-interval '120 days' where company_id=c;
 update public.kshms_member_access set changed_at=now()-interval '120 days' where company_id=c;
 update public.kshms_executions set content=jsonb_set(content,'{planned_on}',to_jsonb((today+7)::text)) where id=current_setting('ks.mail.round')::uuid;
 perform kshms_private.sync_task_reminders();
 perform pg_temp.ex_assert(not exists(select 1 from public.kshms_notification_outbox where company_id=c and notification_kind='round' and notification_phase='reminder'),'future planned work is not nagged');
 update public.kshms_executions set content=jsonb_set(content,'{planned_on}',to_jsonb(today::text)) where id=current_setting('ks.mail.round')::uuid;
 perform kshms_private.sync_task_reminders();perform kshms_private.sync_task_reminders();
 perform pg_temp.ex_assert((select count(*)=5 from public.kshms_notification_outbox where company_id=c and notification_phase='reminder'),'four kinds plus separate reading recipients each receive one current reminder');
 perform pg_temp.ex_assert((select count(distinct notification_kind)=4 from public.kshms_notification_outbox where company_id=c and notification_phase='reminder'),'all four reminder types are represented');
 perform pg_temp.ex_assert((select bool_and(kshms_private.notification_active(queued)) from public.kshms_notification_outbox queued where company_id=c and notification_phase='reminder'),'all current reminders validate');
 perform pg_temp.ex_assert((select bool_and(reminder_due_on is null and reminder_assigned_at is not null and reminder_on=kshms_private.reminder_slot((reminder_assigned_at at time zone 'Europe/Oslo')::date+6,today)) from public.kshms_notification_outbox where company_id=c and notification_phase='reminder'),'current weekly slot only, assignment basis without invented deadline');
 select * into o from public.kshms_notification_outbox where company_id=c and notification_kind='risk' and notification_phase='reminder';
 o.reminder_on:=o.reminder_on-7;perform pg_temp.ex_assert(not kshms_private.notification_active(o),'expired weekly slot is invalid');
 o.reminder_on:=o.reminder_on+7;o.reminder_assigned_at:=o.reminder_assigned_at-interval '1 second';perform pg_temp.ex_assert(not kshms_private.notification_active(o),'changed assignment basis invalidates queued reminder');
 update public.kshms_executions set content=jsonb_set(content,'{planned_on}',to_jsonb((today+1)::text)) where id=current_setting('ks.mail.risk')::uuid;
 perform pg_temp.ex_assert((select not kshms_private.notification_active(queued) from public.kshms_notification_outbox queued where company_id=c and notification_kind='risk' and notification_phase='reminder'),'rescheduled future work invalidates queued reminder');
 update public.kshms_executions set content=jsonb_set(content,'{planned_on}',to_jsonb(today::text)) where id=current_setting('ks.mail.risk')::uuid;
 update public.kshms_routines set archived=true where id=current_setting('ks.mail.routine')::uuid;
 perform pg_temp.ex_assert((select bool_and(not kshms_private.notification_active(queued)) from public.kshms_notification_outbox queued where company_id=c and notification_kind='reading' and notification_phase='reminder'),'archived routine gets no follow-up reminders');
 update public.kshms_routines set archived=false where id=current_setting('ks.mail.routine')::uuid;
 -- One reminder created recently blocks follow-ups even if a missed slot is aged.
 update public.kshms_notification_outbox set status='sent',created_at=now()-interval '8 days',sent_at=now(),reminder_on=reminder_on-7 where company_id=c and notification_phase='reminder';
 perform kshms_private.sync_task_reminders();
 perform pg_temp.ex_assert((select count(*)=5 from public.kshms_notification_outbox where company_id=c and notification_phase='reminder'),'late send starts seven-day quiet period for every recipient');
 update public.kshms_notification_outbox set sent_at=now()-interval '8 days' where company_id=c and notification_phase='reminder';
 perform kshms_private.sync_task_reminders();perform kshms_private.sync_task_reminders();
 perform pg_temp.ex_assert((select count(*)=10 from public.kshms_notification_outbox where company_id=c and notification_phase='reminder'),'one new current reminder per recipient; no missed-slot backlog');
end$$;
set local role authenticated;
do $$declare c uuid:=current_setting('ks.mail.company')::uuid;r jsonb;begin
 perform set_config('request.jwt.claim.sub',current_setting('ks.mail.worker'),true);r:=public.kshms_assignment_reminder_tasks(c);
 perform pg_temp.ex_assert(r->>'company_id'=c::text and r->>'user_id'=current_setting('ks.mail.worker') and r->>'as_of'=(now() at time zone 'Europe/Oslo')::date::text,'own task result includes fresh scope/Oslo date');
 perform pg_temp.ex_assert(jsonb_array_length(r->'groups')=3,'worker sees round risk and own reading, no colleague SJA');
 perform set_config('request.jwt.claim.sub',current_setting('ks.mail.colleague'),true);r:=public.kshms_assignment_reminder_tasks(c);
 perform pg_temp.ex_assert(jsonb_array_length(r->'groups')=2,'colleague sees only own SJA and reading');
 perform set_config('request.jwt.claim.sub',current_setting('ks.mail.admin'),true);
 perform pg_temp.ex_assert(public.kshms_assignment_reminder_tasks(c)->'groups'='[]'::jsonb,'admin sees no other users follow-up counts');
 perform pg_temp.ex_reject('select public.kshms_assignment_reminder_tasks(gen_random_uuid())','42501');
 perform pg_temp.ex_reject('select kshms_private.sync_task_reminders()','42501');
 perform pg_temp.ex_reject('select * from public.kshms_notification_outbox','42501');
end$$;
reset role;
do $$declare c uuid:=current_setting('ks.mail.company')::uuid;o public.kshms_notification_outbox%rowtype;p uuid:=current_setting('ks.mail.project')::uuid;begin
 perform pg_temp.ex_assert(kshms_private.task_reminder_project_access(c,current_setting('ks.mail.worker')::uuid,p),'project owner with module can receive project reminder');
 perform pg_temp.ex_assert(not kshms_private.task_reminder_project_access(c,current_setting('ks.mail.colleague')::uuid,p),'ordinary other owner is not granted project content');
 perform pg_temp.ex_assert(kshms_private.task_reminder_project_access(c,current_setting('ks.mail.admin')::uuid,null),'standalone reminders require no project grant');
 perform pg_temp.ex_assert(not kshms_private.task_reminder_project_access(c,current_setting('ks.mail.worker')::uuid,current_setting('ks.mail.foreign_project')::uuid),'foreign-company project not eligible');
 insert into public.projects(id,user_id,company_scope_id,title,data) values(gen_random_uuid(),current_setting('ks.mail.isolated')::uuid,c,'TASK QA no project grant','{}') returning id into p;
 perform pg_temp.ex_assert(not kshms_private.task_reminder_project_access(c,current_setting('ks.mail.isolated')::uuid,p),'owner without project module cannot receive project reminder');
 -- Fenced attempt test touches only this synthetic queue row.
 select * into o from public.kshms_notification_outbox where company_id=c and notification_kind='round' and notification_phase='reminder' and status='pending';
 perform set_config('ks.task.job',o.id::text,true);
 update public.kshms_notification_outbox set status='sending',attempts=1,reserved_at=now(),delivery_email=(select lower(trim(email)) from public.profiles where id=o.user_id) where id=o.id;
end$$;
set local role service_role;
do $$declare id uuid:=current_setting('ks.task.job')::uuid;begin
 perform pg_temp.ex_assert(not public.kshms_email_validate_attempt(id,0),'stale reminder attempt is rejected');
 perform pg_temp.ex_assert(public.kshms_email_validate_attempt(id,1),'current reminder attempt validates immediately before delivery');
 perform public.kshms_email_finish_attempt(id,1,false);
end$$;
reset role;
select pg_temp.ex_assert((select status='pending' and available_at>now() from public.kshms_notification_outbox where id=current_setting('ks.task.job')::uuid),'provider retry obeys delay');
update public.kshms_notification_outbox set status='sending',attempts=2,reserved_at=now() where id=current_setting('ks.task.job')::uuid;
set local role service_role;
select public.kshms_email_finish_attempt(current_setting('ks.task.job')::uuid,1,true);
reset role;
select pg_temp.ex_assert((select status='sending' and attempts=2 from public.kshms_notification_outbox where id=current_setting('ks.task.job')::uuid),'late finish cannot mark newer attempt sent');
set local role authenticated;
do $$declare c uuid:=current_setting('ks.mail.company')::uuid;r jsonb;content jsonb;begin
 perform set_config('request.jwt.claim.sub',current_setting('ks.mail.admin'),true);
 r:=public.kshms_execution_detail(c,current_setting('ks.mail.round')::uuid)->'record';perform public.kshms_execution_command(c,'save',gen_random_uuid(),jsonb_set(r,'{content,responsible_id}',to_jsonb(current_setting('ks.mail.colleague'))));
 r:=public.kshms_execution_detail(c,current_setting('ks.mail.round')::uuid)->'record';perform public.kshms_execution_command(c,'save',gen_random_uuid(),jsonb_set(r,'{content,responsible_id}',to_jsonb(current_setting('ks.mail.worker'))));
end$$;
set local role service_role;
select pg_temp.ex_assert(not public.kshms_email_validate_attempt(current_setting('ks.task.job')::uuid,2),'A-B-A reassignment cancels reserved reminder');
reset role;
do $$declare c uuid:=current_setting('ks.mail.company')::uuid;begin
 perform kshms_private.sync_task_reminders();
 perform pg_temp.ex_assert(not exists(select 1 from public.kshms_notification_outbox where company_id=c and notification_kind='round' and notification_phase='reminder' and assignment_number=(select assignment_number from kshms_private.notification_assignments where company_id=c and notification_kind='round' and object_id=current_setting('ks.mail.round')::uuid)),'new generation is not followed up immediately');
end$$;
set local role authenticated;
do $$declare c uuid:=current_setting('ks.mail.company')::uuid;r jsonb;content jsonb;begin
 perform set_config('request.jwt.claim.sub',current_setting('ks.mail.worker'),true);
 r:=public.kshms_execution_detail(c,current_setting('ks.mail.round')::uuid)->'record';perform public.kshms_execution_command(c,'complete',gen_random_uuid(),r||jsonb_build_object('confirmed',true,'statement','Jeg bekrefter at jeg har gjennomført og kontrollert dokumentasjonen sammen med de oppgitte deltakerne.'));
 perform public.kshms_command(c,'ack',jsonb_build_object('version_id',current_setting('ks.mail.version')::uuid,'statement','Jeg har gjennomgått denne rutineversjonen, forstår mitt ansvar og vil følge rutinen. Jeg ber om forklaring eller nødvendig opplæring dersom noe er uklart, og melder fra om farlige forhold og avvik. Bekreftelsen dokumenterer gjennomgang; den erstatter ikke opplæring eller faktisk utførelse.'));
 perform set_config('request.jwt.claim.sub',current_setting('ks.mail.colleague'),true);
 r:=public.kshms_sja_detail(c,current_setting('ks.mail.sja')::uuid)->'sja';
 content:=r->'content'||jsonb_build_object('workplace','QA lager','task','QA kapping','planned_on',current_date::text,'reviewed_on',current_date::text,'equipment','QA sag','ppe','QA briller','emergency','QA beredskap','stop_conditions','Stans ved uavklart risiko','communication','Deltakerne har gått gjennom oppgaven',
 'steps',jsonb_build_array(jsonb_build_object('id',gen_random_uuid(),'activity','Kapping','hazard','Støv','consequence','Personskade','measures','Avsug','owner','Prosjektleder','check','Kontrollert')),
 'participants',jsonb_build_array(jsonb_build_object('id',gen_random_uuid(),'name','QA medarbeider','role','Utfører','company','QA firma','involvement','Har deltatt i gjennomgangen')));
 perform public.kshms_sja_command(c,'sign',gen_random_uuid(),jsonb_build_object('id',r->'id','revision',r->'revision','content',content,'prepared',true,'statement','Jeg har gjennomgått denne SJA-en sammen med deltakerne. Arbeidsoppgaven, farene, tiltakene og beredskapen er vurdert for forholdene på stedet. Nødvendige tiltak er kontrollert før arbeidet starter. Ved endringer eller uavklart risiko stanser vi og vurderer arbeidet på nytt.'));
end$$;
reset role;
do $$declare c uuid:=current_setting('ks.mail.company')::uuid;o public.kshms_notification_outbox%rowtype;begin
 perform pg_temp.ex_assert(not exists(select 1 from public.kshms_notification_outbox queued where company_id=c and notification_kind in('round','sja') and notification_phase='reminder' and kshms_private.notification_active(queued)),'own completion and own SJA signature stop every reminder');
 perform pg_temp.ex_assert(not exists(select 1 from public.kshms_notification_outbox queued where company_id=c and notification_kind='reading' and user_id=current_setting('ks.mail.worker')::uuid and notification_phase='reminder' and kshms_private.notification_active(queued)),'own exact saved reading confirmation stops own reminders');
 perform pg_temp.ex_assert(exists(select 1 from public.kshms_notification_outbox queued where company_id=c and notification_kind='reading' and user_id=current_setting('ks.mail.colleague')::uuid and notification_phase='reminder' and kshms_private.notification_active(queued)),'one employees confirmation does not clear another employees reminders');
 select * into o from public.kshms_notification_outbox where company_id=c and notification_kind='risk' and notification_phase='reminder' and status='pending';
 update public.kshms_member_access set enabled=false where company_id=c and user_id=o.user_id;perform pg_temp.ex_assert(not kshms_private.notification_active(o),'revoked KS/HMS grant blocks remaining risk reminder');
 update public.kshms_member_access set enabled=true,changed_at=now()+interval '1 second' where company_id=c and user_id=o.user_id;perform pg_temp.ex_assert(not kshms_private.notification_active(o),'restored grant fences old queued reminder');
 perform pg_temp.ex_assert(not has_function_privilege('anon','public.kshms_assignment_reminder_tasks(uuid)','execute') and has_function_privilege('authenticated','public.kshms_assignment_reminder_tasks(uuid)','execute'),'own read RPC only authenticated');
 perform pg_temp.ex_assert(not has_function_privilege('authenticated','kshms_private.sync_task_reminders()','execute') and not has_function_privilege('service_role','kshms_private.sync_task_reminders()','execute'),'collector not directly client or service callable');
end$$;
select current_setting('ks.mail.checks')::int as passed,'all synthetic writes rolled back; no HTTP sender invoked' as result;
rollback;
