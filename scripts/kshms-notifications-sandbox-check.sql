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
 r:=public.kshms_execution_detail(c,e)->'record';perform public.kshms_execution_command(c,'save',gen_random_uuid(),r);
 r:=public.kshms_execution_detail(c,e)->'record';perform public.kshms_execution_command(c,'save',gen_random_uuid(),jsonb_set(r,'{content,responsible_id}',to_jsonb(col::text)));
 r:=public.kshms_execution_detail(c,e)->'record';perform public.kshms_execution_command(c,'save',gen_random_uuid(),jsonb_set(r,'{content,responsible_id}',to_jsonb(u::text)));
 content:=content||jsonb_build_object('title','NOTIFICATION QA risiko','points','[]'::jsonb,'risks',jsonb_build_array(jsonb_build_object('id',gen_random_uuid())));
 perform public.kshms_execution_command(c,'save',gen_random_uuid(),jsonb_build_object('id',risk,'kind','risk','revision',0,'content',content));perform set_config('ks.mail.risk',risk::text,true);
 content:=jsonb_build_object('title','NOTIFICATION QA SJA','leader_id','', 'steps',jsonb_build_array(jsonb_build_object('id',gen_random_uuid())),'participants',jsonb_build_array(jsonb_build_object('id',gen_random_uuid())));
 perform public.kshms_sja_command(c,'save',gen_random_uuid(),jsonb_build_object('id',s,'revision',0,'content',content));perform set_config('ks.mail.sja',s::text,true);
 content:=content||jsonb_build_object('leader_id',col);
 r:=public.kshms_sja_detail(c,s)->'sja';perform public.kshms_sja_command(c,'save',gen_random_uuid(),jsonb_build_object('id',s,'revision',r->'revision','content',content));
 r:=public.kshms_command(c,'save',jsonb_build_object('draft',jsonb_build_object('title','NOTIFICATION QA rutine','chapter','QA','goal','QA mål','responsibility','QA ansvar','procedure','QA fremgangsmåte','documentation','QA dokumentasjon','confirmation','QA gjennomgang','references','[]'::jsonb)));
 perform set_config('ks.mail.routine',r->>'id',true);
 v:=public.kshms_command(c,'publish',jsonb_build_object('id',r->'id','revision',r->'revision','change_summary','Første pliktige QA utgave','requires_ack',true,'acknowledge_self',true,'self_statement','Jeg har gjennomgått denne rutineversjonen, forstår mitt ansvar og vil følge rutinen. Jeg ber om forklaring eller nødvendig opplæring dersom noe er uklart, og melder fra om farlige forhold og avvik. Bekreftelsen dokumenterer gjennomgang; den erstatter ikke opplæring eller faktisk utførelse.'));
 perform set_config('ks.mail.version',v->>'id',true);
 r:=public.kshms_get_state(c);r:=(select value from jsonb_array_elements(r->'routines') where value->>'id'=current_setting('ks.mail.routine'));
 r:=public.kshms_command(c,'save',jsonb_build_object('id',r->'id','revision',r->'revision','draft',jsonb_set(r->'draft','{title}','"NOTIFICATION QA informasjon"')));
 v:=public.kshms_command(c,'publish',jsonb_build_object('id',r->'id','revision',r->'revision','change_summary','Informasjon uten ny pliktig bekreftelse','requires_ack',false));perform set_config('ks.mail.info_version',v->>'id',true);
 begin perform public.kshms_email_reserve();raise exception 'Client reserved mail';exception when insufficient_privilege then perform pg_temp.ex_assert(true,'client cannot reserve mail');end;
 begin perform kshms_private.sync_due_reviews();raise exception 'Client invoked private sync';exception when insufficient_privilege then perform pg_temp.ex_assert(true,'client cannot invoke private sync');end;
end$$;
reset role;
do $$declare c uuid:=current_setting('ks.mail.company')::uuid;e uuid:=current_setting('ks.mail.round')::uuid;a uuid:=current_setting('ks.mail.admin')::uuid;u uuid:=current_setting('ks.mail.worker')::uuid;col uuid:=current_setting('ks.mail.colleague')::uuid;begin
 perform pg_temp.ex_assert((select count(*)=3 from public.kshms_notification_outbox where company_id=c and notification_kind='round'),'one generation per A-B-A assignment; save/replay sends no duplicate');
 perform pg_temp.ex_assert((select count(*)=2 from public.kshms_notification_outbox where company_id=c and notification_kind='round' and status='suppressed'),'old assignments suppressed');
 perform pg_temp.ex_assert((select user_id=u and assignment_number=3 from public.kshms_notification_outbox where company_id=c and notification_kind='round' and status='pending'),'A-B-A fresh generation belongs to current responsible');
 perform pg_temp.ex_assert((select user_id=u from public.kshms_notification_outbox where company_id=c and notification_kind='risk'),'risk addressed to responsible');
 perform pg_temp.ex_assert((select count(*)=1 from public.kshms_notification_outbox where company_id=c and notification_kind='sja'),'SJA without leader sends nothing, choosing leader enqueues once');
 perform pg_temp.ex_assert((select user_id=col from public.kshms_notification_outbox where company_id=c and notification_kind='sja'),'SJA recipient is selected leader');
 perform pg_temp.ex_assert((select count(*)=3 from public.kshms_notification_outbox where company_id=c and notification_kind='reading' and object_id=current_setting('ks.mail.version')::uuid),'mandatory publication assigned once per actual recipient');
 perform pg_temp.ex_assert((select status='suppressed' from public.kshms_notification_outbox where company_id=c and notification_kind='reading' and user_id=a),'own verified publication acknowledgment suppresses mail');
 perform pg_temp.ex_assert(not exists(select 1 from public.kshms_notification_outbox where object_id=current_setting('ks.mail.info_version')::uuid),'informational version has no mandatory notification');
 perform pg_temp.ex_assert(not exists(select 1 from public.kshms_notification_outbox where company_id=c and notification_kind='review'),'future review sends nothing');
 update public.kshms_settings set next_review_on=current_date-1 where company_id=c;
 perform kshms_private.sync_due_reviews();perform kshms_private.sync_due_reviews();
 perform pg_temp.ex_assert((select count(*)=1 from public.kshms_notification_outbox where company_id=c and notification_kind='review' and user_id=a and status='pending'),'overdue review notified once to designated responsible');
 update public.kshms_settings set next_review_on=current_date+365 where company_id=c;
 perform pg_temp.ex_assert((select status='suppressed' from public.kshms_notification_outbox where company_id=c and notification_kind='review'),'new review date suppresses old alert');
 update public.kshms_settings set next_review_on=current_date-2 where company_id=c;
 perform pg_temp.ex_assert((select count(*)=2 from public.kshms_notification_outbox where company_id=c and notification_kind='review'),'a new due cycle gets its own notification');
 update public.kshms_notification_outbox set status='suppressed' where not (company_id=c and notification_kind='round' and assignment_number=3);
 update kshms_private.email_worker_settings set enabled=true,app_url='https://notification-qa.example.com';
 update public.profiles set email='notification-qa@example.com' where id=u;
end$$;
set local role service_role;
do $$declare job jsonb;again jsonb;begin
 job:=public.kshms_email_reserve();perform pg_temp.ex_assert(job->>'notification_kind'='round' and job->>'object_id'=current_setting('ks.mail.round') and job->>'email'='notification-qa@example.com','reservation returns correct kind/document/recipient');perform set_config('ks.mail.job',job->>'id',true);
 perform pg_temp.ex_assert(public.kshms_email_reserve() is null,'sending job cannot be reserved concurrently');
 perform pg_temp.ex_assert(not public.kshms_email_validate_attempt((job->>'id')::uuid,0),'stale attempt rejected');
 perform pg_temp.ex_assert(public.kshms_email_validate_attempt((job->>'id')::uuid,1),'current valid attempt accepted');
 perform public.kshms_email_finish_attempt((job->>'id')::uuid,1,false);
 perform pg_temp.ex_assert(public.kshms_email_reserve() is null,'provider error obeys delay');
end$$;
reset role;
update public.kshms_notification_outbox set available_at=now() where id=current_setting('ks.mail.job')::uuid;
set local role service_role;
do $$declare job jsonb;begin
 job:=public.kshms_email_reserve();perform pg_temp.ex_assert(job->>'id'=current_setting('ks.mail.job') and job->>'attempt'='2' and job->>'email'='notification-qa@example.com' and job->>'app_url'='https://notification-qa.example.com','retry keeps idempotency identity and body');
 perform public.kshms_email_finish_attempt((job->>'id')::uuid,1,true);
end$$;
reset role;
select pg_temp.ex_assert((select status='sending' and attempts=2 from public.kshms_notification_outbox where id=current_setting('ks.mail.job')::uuid),'late finish cannot mark a newer attempt sent');
set local role authenticated;
do $$declare c uuid:=current_setting('ks.mail.company')::uuid;r jsonb;begin
 perform set_config('request.jwt.claim.sub',current_setting('ks.mail.admin'),true);
 r:=public.kshms_execution_detail(c,current_setting('ks.mail.round')::uuid)->'record';perform public.kshms_execution_command(c,'save',gen_random_uuid(),jsonb_set(r,'{content,responsible_id}',to_jsonb(current_setting('ks.mail.colleague'))));
end$$;
set local role service_role;
select pg_temp.ex_assert(not public.kshms_email_validate_attempt(current_setting('ks.mail.job')::uuid,2),'reassignment cancels an in-flight old recipient');
select pg_temp.ex_assert(public.kshms_email_reserve() is null,'synthetic invalid address is not deliverable');
reset role;
select pg_temp.ex_assert((select last_error_code='non_delivery_address' from public.kshms_notification_outbox where company_id=current_setting('ks.mail.company')::uuid and notification_kind='round' and assignment_number=4),'invalid address suppression is recorded');
set local role authenticated;
do $$declare c uuid:=current_setting('ks.mail.company')::uuid;r jsonb;content jsonb;begin
 perform set_config('request.jwt.claim.sub',current_setting('ks.mail.colleague'),true);
 r:=public.kshms_execution_detail(c,current_setting('ks.mail.round')::uuid)->'record';perform public.kshms_execution_command(c,'complete',gen_random_uuid(),r||jsonb_build_object('confirmed',true,'statement','Jeg bekrefter at jeg har gjennomført og kontrollert dokumentasjonen sammen med de oppgitte deltakerne.'));
 r:=public.kshms_sja_detail(c,current_setting('ks.mail.sja')::uuid)->'sja';
 content:=r->'content'||jsonb_build_object('workplace','QA lager','task','QA kapping','planned_on',current_date::text,'reviewed_on',current_date::text,'equipment','QA sag','ppe','QA briller','emergency','QA beredskap','stop_conditions','Stans ved uavklart risiko','communication','Deltakerne har gått gjennom oppgaven',
 'steps',jsonb_build_array(jsonb_build_object('id',gen_random_uuid(),'activity','Kapping','hazard','Støv','consequence','Personskade','measures','Avsug','owner','Prosjektleder','check','Kontrollert')),
 'participants',jsonb_build_array(jsonb_build_object('id',gen_random_uuid(),'name','QA medarbeider','role','Utfører','company','QA firma','involvement','Har deltatt i gjennomgangen')));
 perform public.kshms_sja_command(c,'sign',gen_random_uuid(),jsonb_build_object('id',r->'id','revision',r->'revision','content',content,'prepared',true,'statement','Jeg har gjennomgått denne SJA-en sammen med deltakerne. Arbeidsoppgaven, farene, tiltakene og beredskapen er vurdert for forholdene på stedet. Nødvendige tiltak er kontrollert før arbeidet starter. Ved endringer eller uavklart risiko stanser vi og vurderer arbeidet på nytt.'));
 perform set_config('request.jwt.claim.sub',current_setting('ks.mail.worker'),true);
 perform public.kshms_command(c,'ack',jsonb_build_object('version_id',current_setting('ks.mail.version')::uuid,'statement','Jeg har gjennomgått denne rutineversjonen, forstår mitt ansvar og vil følge rutinen. Jeg ber om forklaring eller nødvendig opplæring dersom noe er uklart, og melder fra om farlige forhold og avvik. Bekreftelsen dokumenterer gjennomgang; den erstatter ikke opplæring eller faktisk utførelse.'));
end$$;
reset role;
do $$declare c uuid:=current_setting('ks.mail.company')::uuid;o public.kshms_notification_outbox%rowtype;begin
 for o in select * from public.kshms_notification_outbox where company_id=c and notification_kind in('round','sja') loop perform pg_temp.ex_assert(not kshms_private.notification_active(o),'completed/signed document is no longer a mail task');end loop;
 select * into o from public.kshms_notification_outbox where company_id=c and notification_kind='reading' and user_id=current_setting('ks.mail.worker')::uuid;perform pg_temp.ex_assert(not kshms_private.notification_active(o),'own saved acknowledgment cancels mail');
 select * into o from public.kshms_notification_outbox where company_id=c and notification_kind='risk';perform pg_temp.ex_assert(kshms_private.notification_active(o),'unrelated pending risk still active');
 update public.kshms_member_access set enabled=false where company_id=c and user_id=current_setting('ks.mail.worker')::uuid;perform pg_temp.ex_assert(not kshms_private.notification_active(o),'revoked access cancels delivery');
 perform pg_temp.ex_assert(not has_table_privilege('authenticated','public.kshms_notification_outbox','select'),'no browser queue data');
 perform pg_temp.ex_assert(not has_function_privilege('authenticated','public.kshms_email_reserve()','execute'),'no browser delivery RPC');
 perform pg_temp.ex_assert(has_function_privilege('service_role','public.kshms_email_reserve()','execute'),'service worker has narrow RPC');
end$$;
select current_setting('ks.mail.checks')::integer as passed,'KS/HMS notifications: RPC writes, dedup/reassignment, six kinds, own completion/sign/ack, due cycles, protected service reservation/retry/fencing/access; no HTTP, full rollback' as result;
rollback;
