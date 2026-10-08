-- Sandbox only. Synthetic identities and every data change roll back.
begin;
do $$ declare a uuid:=gen_random_uuid(); b uuid:=gen_random_uuid(); uid uuid; k text; sys uuid; begin
 insert into public.sales_company_scopes(id,normalized_name,display_name) values(a,public.sales_normalize_company_name('kshms-qa-'||a),'kshms-qa-'||a),(b,public.sales_normalize_company_name('kshms-qa-'||b),'kshms-qa-'||b);
 perform set_config('kshms.test.company_a',a::text,true); perform set_config('kshms.test.company_b',b::text,true);
 select id into sys from public.profiles where system_role='systemadmin' and approved and not coalesce(deactivated,false) limit 1;
 assert sys is not null; perform set_config('kshms.test.sys',sys::text,true);
 foreach k in array array['admin','editor','reader','other'] loop
  uid:=gen_random_uuid(); perform set_config('kshms.test.'||k,uid::text,true);
  insert into auth.users(id,aud,role,email,created_at,updated_at,raw_app_meta_data,raw_user_meta_data)
   values(uid,'authenticated','authenticated','ks-qa-'||uid||'@example.invalid',now(),now(),'{}',jsonb_build_object('full_name','QA '||k));
  insert into public.profiles(id,email,company_name,approved,deactivated,role,company_role)
   values(uid,'ks-qa-'||uid||'@example.invalid','kshms-qa-'||case when k='other' then b else a end,true,false,case when k in ('admin','other') then 'admin' else 'member' end,case when k in ('admin','other') then 'firmaadmin' else 'ansatt' end)
   on conflict(id) do update set company_name=excluded.company_name,approved=true,deactivated=false,role=excluded.role,company_role=excluded.company_role,system_role=null;
  insert into public.sales_company_memberships(company_id,user_id,is_primary,workspace_role) values(case when k='other' then b else a end,uid,true,case when k in ('admin','other') then 'firmaadmin' else 'ansatt' end) on conflict(company_id,user_id) do update set workspace_role=excluded.workspace_role;
  insert into public.user_active_company_scope(user_id,company_id) values(uid,case when k='other' then b else a end) on conflict(user_id) do update set company_id=excluded.company_id;
  insert into public.user_module_access(user_id,module_key) values(uid,'projects') on conflict do nothing;
end loop;
end $$;
-- Project source fixtures are authoritative saved data, never browser drafts.
do $$ declare a uuid:=current_setting('kshms.test.company_a')::uuid;u uuid:=current_setting('kshms.test.admin')::uuid;p uuid:=gen_random_uuid();begin
 perform set_config('kshms.test.project',p::text,true);
 perform set_config('request.jwt.claim.sub',u::text,true);
 insert into public.projects(id,user_id,title,company_scope_id,data) values(p,u,'Synthetic KS/HMS project',a,
  '{"project":{"projectName":"Synthetic KS/HMS project","locked":false,"projectDeviations":[{"id":"qa-source","title":"Saved project failure","description":"Actual saved event","status":"Åpent","photos":[]},{"id":"unlinked","title":"Old independent flow","status":"Åpent"}]},"checklist":{"QA group":{"QA point":{"status":"Avvik","comment":"Saved checklist failure","photos":[]},"Unlinked point":{"status":"Avvik"}}}}');
end $$;
set local role authenticated;
do $$ declare a uuid:=current_setting('kshms.test.company_a')::uuid;b uuid:=current_setting('kshms.test.company_b')::uuid;
 admin_id uuid:=current_setting('kshms.test.admin')::uuid;eli uuid:=current_setting('kshms.test.editor')::uuid;trond uuid:=current_setting('kshms.test.reader')::uuid;
 sys uuid:=current_setting('kshms.test.sys')::uuid;other_id uuid:=current_setting('kshms.test.other')::uuid;p uuid:=current_setting('kshms.test.project')::uuid;
 r jsonb;s jsonb;payload jsonb;req uuid:=gen_random_uuid();file jsonb;n integer:=0;
begin
 perform set_config('request.jwt.claim.sub',sys::text,true);perform public.kshms_activate(a,true);perform public.kshms_activate(b,true);
 perform set_config('request.jwt.claim.sub',admin_id::text,true);
 perform public.kshms_command(a,'access',jsonb_build_object('user_id',trond,'role','reader','enabled',true));
 perform public.kshms_command(a,'access',jsonb_build_object('user_id',eli,'role','reader','enabled',true));
 perform set_config('request.jwt.claim.sub',trond::text,true);
 assert not (public.get_kshms_context()->>'manage')::boolean;n:=n+1;
 payload:=jsonb_build_object('request_id',req,'title','Trond reports; Eli owns','event','Synthetic event with sufficient facts','category','hms','responsible_id',eli,'due_on',current_date-1,'source_kind','company');
 r:=public.kshms_deviation_command(a,'create',payload);perform set_config('kshms.test.case',r->>'id',true);
 assert (r->>'created_by')::uuid=trond and (r->>'responsible_id')::uuid=eli;n:=n+1;
 assert public.kshms_deviation_command(a,'create',payload)->>'id'=r->>'id','Lost response/retry duplicated case';n:=n+1;
 assert public.kshms_deviation_tasks(a)->>'count'='0','Reporter received responsible task';n:=n+1;
 s:=public.kshms_deviation_state(a);assert jsonb_array_length(s->'members')=3,'Ineligible/cross-firm assignee offered';n:=n+1;
 assert s->'counts'->>'open'='1';n:=n+1;
 begin perform public.kshms_deviation_command(a,'create',payload||jsonb_build_object('request_id',gen_random_uuid(),'responsible_id',other_id));raise exception 'Foreign assignee accepted';exception when insufficient_privilege then n:=n+1;end;
 begin perform public.kshms_deviation_command(a,'save',jsonb_build_object('id',r->>'id','revision',1,'status','closed'));raise exception 'Reporter altered owner case';exception when insufficient_privilege then n:=n+1;end;
 perform set_config('request.jwt.claim.sub',eli::text,true);
 assert public.kshms_deviation_tasks(a)->>'count'='1' and public.kshms_deviation_tasks(a)->>'overdue'='1';n:=n+1;
 perform public.kshms_deviation_detail(a,(r->>'id')::uuid);perform public.kshms_deviation_state(a);perform public.kshms_deviation_files(a,(r->>'id')::uuid);
 assert public.kshms_deviation_tasks(a)->>'count'='1','Reading removed task';n:=n+1;
 begin perform public.kshms_deviation_command(a,'save',jsonb_build_object('id',r->>'id','revision',0,'status','in_progress'));raise exception 'Stale revision saved';exception when serialization_failure then n:=n+1;end;
 begin perform public.kshms_deviation_command(a,'save',jsonb_build_object('id',r->>'id','revision',1,'status','closed'));raise exception 'Generic save closed case';exception when others then if sqlerrm='Generic save closed case' then raise;end if;n:=n+1;end;
 begin perform public.kshms_deviation_command(a,'close',jsonb_build_object('id',r->>'id','revision',1,'controlled',false,'cause','Known cause','improvement_action','Measures completed','control_note','Checked result'));raise exception 'Unchecked closure saved';exception when others then if sqlerrm='Unchecked closure saved' then raise;end if;n:=n+1;end;
 assert public.kshms_deviation_tasks(a)->>'count'='1','Failed closure removed task';n:=n+1;
 file:=public.kshms_deviation_file_command(a,'reserve',jsonb_build_object('deviation_id',r->>'id','name','evidence.pdf','mime_type','application/pdf','size_bytes',20));
 assert public.kshms_deviation_file_access(file->>'object_name',true) and not public.kshms_deviation_file_access(file->>'object_name',false);n:=n+1;
 insert into storage.objects(bucket_id,name,metadata) values('kshms-private',file->>'object_name','{"size":20,"mimetype":"application/pdf"}');
 perform public.kshms_deviation_file_command(a,'commit',jsonb_build_object('deviation_id',r->>'id','id',file->>'id'));
 assert public.kshms_deviation_file_access(file->>'object_name',false) and not public.kshms_deviation_file_access(file->>'object_name',true);n:=n+1;
 assert jsonb_array_length(public.kshms_deviation_files(a,(r->>'id')::uuid))=1;n:=n+1;
 perform public.kshms_deviation_file_command(a,'commit',jsonb_build_object('deviation_id',r->>'id','id',file->>'id'));
 assert jsonb_array_length(public.kshms_deviation_detail(a,(r->>'id')::uuid)->'events')=2,'File commit retry duplicated history';n:=n+1;
 payload:=jsonb_build_object('id',r->>'id','revision',1,'controlled',true,'cause','Known cause','improvement_action','Measures completed and tested','control_note','Eli checked the actual corrected result');
 perform set_config('request.jwt.claim.sub',admin_id::text,true);
 begin perform public.kshms_deviation_command(a,'close',payload);raise exception 'Manager closed someone else case';exception when insufficient_privilege then n:=n+1;end;
 perform set_config('request.jwt.claim.sub',eli::text,true);
 r:=public.kshms_deviation_command(a,'close',payload);
 assert r->>'status'='closed' and (r->>'closed_by')::uuid=eli and r->>'closed_at' is not null;n:=n+1;
 assert public.kshms_deviation_tasks(a)->>'count'='0','Saved closure left task';n:=n+1;
 assert public.kshms_deviation_state(a,'closed')->'counts'->>'closed'='1';n:=n+1;
 assert jsonb_array_length(public.kshms_deviation_detail(a,(r->>'id')::uuid)->'events')=3;n:=n+1;
 begin perform public.kshms_deviation_file_command(a,'reserve',jsonb_build_object('deviation_id',r->>'id','name','late.pdf','mime_type','application/pdf','size_bytes',20));raise exception 'Closed case accepted upload';exception when others then if sqlerrm='Closed case accepted upload' then raise;end if;n:=n+1;end;
 begin perform public.kshms_deviation_command(a,'reopen',jsonb_build_object('id',r->>'id','revision',2,'reason','Reason sufficiently long'));raise exception 'Reader reopened case';exception when insufficient_privilege then n:=n+1;end;
 perform set_config('request.jwt.claim.sub',admin_id::text,true);
 perform public.kshms_command(a,'access',jsonb_build_object('user_id',eli,'role','reader','enabled',false));
 r:=public.kshms_deviation_command(a,'reopen',jsonb_build_object('id',r->>'id','revision',2,'reason','New investigation after access change','responsible_id',trond,'due_on',current_date+5));
 assert r->>'status'='open' and (r->>'responsible_id')::uuid=trond and r->>'assignment_number'='2' and r->>'closed_at' is null;n:=n+1;
 perform set_config('request.jwt.claim.sub',trond::text,true);assert public.kshms_deviation_tasks(a)->>'count'='1';n:=n+1;
 perform set_config('request.jwt.claim.sub',eli::text,true);
 begin perform public.kshms_deviation_detail(a,(r->>'id')::uuid);raise exception 'Revoked employee read case';exception when insufficient_privilege then n:=n+1;end;
 perform set_config('request.jwt.claim.sub',other_id::text,true);
 assert not public.kshms_deviation_file_access(file->>'object_name',false),'Foreign firm opened private attachment';n:=n+1;
 begin perform public.kshms_deviation_detail(a,(r->>'id')::uuid);raise exception 'Cross-firm case read';exception when insufficient_privilege then n:=n+1;end;
 begin perform public.kshms_deviation_tasks(a);raise exception 'Cross-firm tasks read';exception when insufficient_privilege then n:=n+1;end;
 perform set_config('request.jwt.claim.sub',admin_id::text,true);
 perform public.kshms_command(a,'access',jsonb_build_object('user_id',eli,'role','reader','enabled',true));
 -- Existing project/checklist closure cannot override a linked case.
 payload:=jsonb_build_object('request_id',gen_random_uuid(),'title','Project-linked failure','event','Synthetic project failure','category','quality','responsible_id',eli,'due_on',current_date+3,'project_id',p,'source_kind','project','source_key','qa-source');
 r:=public.kshms_deviation_command(a,'create',payload);perform set_config('kshms.test.linked',r->>'id',true);
 assert public.kshms_deviation_command(a,'create',payload||jsonb_build_object('request_id',gen_random_uuid()))->>'id'=r->>'id','Same source linked twice';n:=n+1;
 update public.projects set data=jsonb_set(data,'{project,projectDeviations,0,status}','"Lukket"') where id=p;
 assert (select data#>>'{project,projectDeviations,0,status}'='Åpent' from public.projects where id=p);n:=n+1;
 assert (select data#>>'{project,projectDeviations,0,ks_deviation_id}'=r->>'id' from public.projects where id=p);n:=n+1;
 update public.projects set data=jsonb_set(data,'{project,projectDeviations,1,status}','"Lukket"') where id=p;
 assert (select data#>>'{project,projectDeviations,1,status}'='Lukket' from public.projects where id=p),'Unlinked legacy flow changed';n:=n+1;
 begin update public.projects set data=jsonb_set(data,'{project,projectDeviations}','[]') where id=p;raise exception 'Linked source removed';exception when others then if sqlerrm='Linked source removed' then raise;end if;n:=n+1;end;
 payload:=jsonb_build_object('request_id',gen_random_uuid(),'title','Checklist-linked failure','event','Synthetic checklist failure','category','quality','responsible_id',eli,'due_on',current_date+3,'project_id',p,'source_kind','checklist','source_group','QA group','source_item','QA point');
 r:=public.kshms_deviation_command(a,'create',payload);perform set_config('kshms.test.checklist',r->>'id',true);
 update public.projects set data=jsonb_set(data,'{checklist,QA group,QA point,status}','"Ok"') where id=p;
 assert (select data#>>'{checklist,QA group,QA point,status}'='Avvik' from public.projects where id=p);n:=n+1;
 update public.projects set data=jsonb_set(data,'{checklist,QA group,Unlinked point,status}','"Ok"') where id=p;
 assert (select data#>>'{checklist,QA group,Unlinked point,status}'='Ok' from public.projects where id=p);n:=n+1;
 update public.projects set locked=true where id=p;
 perform set_config('request.jwt.claim.sub',eli::text,true);
 begin perform public.kshms_deviation_command(a,'save',jsonb_build_object('id',r->>'id','revision',1,'status','in_progress'));raise exception 'Locked project case changed';exception when others then if sqlerrm='Locked project case changed' then raise;end if;n:=n+1;end;
 perform set_config('request.jwt.claim.sub',admin_id::text,true);update public.projects set locked=false where id=p;
 perform set_config('request.jwt.claim.sub',eli::text,true);
 r:=public.kshms_deviation_command(a,'close',jsonb_build_object('id',r->>'id','revision',1,'controlled',true,'cause','Known cause','improvement_action','Corrected checklist issue','control_note','Checked actual result before closure'));
 perform set_config('request.jwt.claim.sub',admin_id::text,true);
 assert (select data#>>'{checklist,QA group,QA point,status}'='Lukket avvik' from public.projects where id=p);n:=n+1;
 assert (select data#>>'{checklist,QA group,QA point,closedBy}'='QA editor' from public.projects where id=p);n:=n+1;
 -- A third uninvolved reader cannot discover another case through search/detail.
 perform set_config('request.jwt.claim.sub',admin_id::text,true);
 r:=public.kshms_deviation_command(a,'create',jsonb_build_object('request_id',gen_random_uuid(),'title','Manager private case','event','Not involved employee case','category','hms','responsible_id',admin_id,'due_on',current_date+1));
 perform set_config('request.jwt.claim.sub',trond::text,true);
 assert not exists(select 1 from jsonb_array_elements(public.kshms_deviation_state(a,'all')->'cases') e where e->>'id'=r->>'id');n:=n+1;
 begin perform public.kshms_deviation_detail(a,(r->>'id')::uuid);raise exception 'Uninvolved case opened';exception when insufficient_privilege then n:=n+1;end;
 begin perform 1 from public.kshms_deviations;raise exception 'Direct case read';exception when insufficient_privilege then n:=n+1;end;
 begin perform public.kshms_email_reserve();raise exception 'Browser reserved email';exception when insufficient_privilege then n:=n+1;end;
 begin perform public.kshms_email_worker_authorize(repeat('a',64));raise exception 'Browser authorized worker';exception when insufficient_privilege then n:=n+1;end;
 perform set_config('kshms.test.deviation_checks',n::text,true);
end $$;
reset role;
do $$ declare a uuid:=current_setting('kshms.test.company_a')::uuid;case_id uuid:=current_setting('kshms.test.case')::uuid;n int:=current_setting('kshms.test.deviation_checks')::int;secret uuid;begin
 assert (select count(*)=1 from public.kshms_notification_outbox where deviation_id=case_id and assignment_number=1),'Create retry duplicated notification';n:=n+1;
 assert (select count(*)=1 from public.kshms_notification_outbox where deviation_id=case_id and assignment_number=2),'Reopen notification missing';n:=n+1;
 begin update public.kshms_deviation_events set action='changed' where company_id=a;raise exception 'Mutable case history';exception when insufficient_privilege then n:=n+1;end;
 -- Isolate the shared worker queue inside this rollback transaction; no HTTP is invoked.
 update public.kshms_notification_outbox set status='suppressed' where company_id<>a and status in('pending','sending');
 assert not exists(select 1 from public.kshms_notification_outbox where company_id<>a and status in('pending','sending')),'Unrelated queue must stay isolated during QA';
 -- A synthetic reachable-shaped address only. No HTTP or provider is invoked.
 perform set_config('request.jwt.claim.sub',current_setting('kshms.test.sys'),true);
 update public.profiles set email='ks-qa@example.com' where id=current_setting('kshms.test.editor')::uuid;
 secret:=vault.create_secret(repeat('a',64),null,'Temporary rollback-only KS/HMS worker token');
 update kshms_private.email_worker_settings set enabled=true,app_url='https://example.com',secret_id=secret;
 update public.kshms_notification_outbox set status='suppressed' where company_id=a and deviation_id<>current_setting('kshms.test.linked')::uuid;
 perform set_config('kshms.test.deviation_checks',n::text,true);
end $$;
set local role service_role;
do $$ declare job jsonb;n int:=current_setting('kshms.test.deviation_checks')::int;begin
 assert public.kshms_email_worker_authorize(repeat('b',64)) is null;n:=n+1;
 assert public.kshms_email_worker_authorize(repeat('a',64))->>'enabled'='true';n:=n+1;
 job:=public.kshms_email_reserve();assert job->>'deviation_id'=current_setting('kshms.test.linked') and job->>'email'='ks-qa@example.com' and job->>'attempt'='1';n:=n+1;
 assert public.kshms_email_reserve() is null,'Concurrent reservation duplicated in-flight delivery';n:=n+1;
 assert public.kshms_email_validate_attempt((job->>'id')::uuid,1);n:=n+1;
 assert not public.kshms_email_validate_attempt((job->>'id')::uuid,2);n:=n+1;
 perform public.kshms_email_finish_attempt((job->>'id')::uuid,2,true);
 assert public.kshms_email_validate_attempt((job->>'id')::uuid,1),'Stale worker finished another attempt';n:=n+1;
 perform public.kshms_email_finish_attempt((job->>'id')::uuid,1,false);
 assert public.kshms_email_reserve() is null,'Provider failure ignored retry delay';n:=n+1;
 perform set_config('kshms.test.mail_id',job->>'id',true);perform set_config('kshms.test.deviation_checks',n::text,true);
end $$;
reset role;
do $$ declare n int:=current_setting('kshms.test.deviation_checks')::int;mail_id uuid:=current_setting('kshms.test.mail_id')::uuid;begin
 assert (select status='pending' and attempts=1 and last_error_code='provider_or_network_error' from public.kshms_notification_outbox where kshms_notification_outbox.id=mail_id);n:=n+1;
 update public.kshms_notification_outbox set available_at=now() where kshms_notification_outbox.id=mail_id;
 perform set_config('kshms.test.deviation_checks',n::text,true);
end $$;
set local role service_role;
do $$ declare job jsonb;n int:=current_setting('kshms.test.deviation_checks')::int;begin
 job:=public.kshms_email_reserve();assert job->>'id'=current_setting('kshms.test.mail_id') and job->>'attempt'='2','Retry changed idempotency identity';n:=n+1;
 perform public.kshms_email_finish_attempt((job->>'id')::uuid,1,true);
 assert public.kshms_email_validate_attempt((job->>'id')::uuid,2);n:=n+1;
 perform public.kshms_email_finish_attempt((job->>'id')::uuid,2,true);
 perform set_config('kshms.test.deviation_checks',n::text,true);
end $$;
reset role;
do $$ declare a uuid:=current_setting('kshms.test.company_a')::uuid;n int:=current_setting('kshms.test.deviation_checks')::int;begin
 assert (select status='sent' and sent_at is not null from public.kshms_notification_outbox where id=current_setting('kshms.test.mail_id')::uuid);n:=n+1;
 -- Close-before-send is suppressed. Reassignment/revocation are checked on each lease.
 update public.kshms_notification_outbox set status='pending',available_at=now() where deviation_id=current_setting('kshms.test.checklist')::uuid;
 assert public.kshms_email_reserve() is null;n:=n+1;
 assert (select status='suppressed' and last_error_code='assignment_inactive' from public.kshms_notification_outbox where deviation_id=current_setting('kshms.test.checklist')::uuid);n:=n+1;
 update public.kshms_notification_outbox set status='pending',available_at=now() where deviation_id=current_setting('kshms.test.case')::uuid and assignment_number=1;
 assert public.kshms_email_reserve() is null;n:=n+1;
 update public.kshms_notification_outbox set status='pending',available_at=now() where deviation_id=current_setting('kshms.test.case')::uuid and assignment_number=2;
 assert public.kshms_email_reserve() is null,'Synthetic invalid address was offered for delivery';n:=n+1;
 assert (select last_error_code='non_delivery_address' from public.kshms_notification_outbox where deviation_id=current_setting('kshms.test.case')::uuid and assignment_number=2);n:=n+1;
 update public.kshms_notification_outbox set status='pending',available_at=now() where deviation_id=current_setting('kshms.test.linked')::uuid;
 update public.kshms_member_access set enabled=false where company_id=a and user_id=current_setting('kshms.test.editor')::uuid;
 assert public.kshms_email_reserve() is null;n:=n+1;
 assert (select status='suppressed' from public.kshms_notification_outbox where deviation_id=current_setting('kshms.test.linked')::uuid);n:=n+1;
 perform set_config('kshms.test.deviation_checks',n::text,true);
end $$;
-- Hosted pg_net grants are platform-owned. The supported boundary is NOLOGIN
-- clients plus Data API schema exclusion, checked by the deployed worker.
do $$ declare n int:=current_setting('kshms.test.deviation_checks')::int;actor text;begin
 foreach actor in array array['anon','authenticated'] loop
  assert exists(select 1 from pg_roles where rolname=actor and not rolcanlogin),'Application role can establish a direct SQL session';n:=n+1;
  assert not has_function_privilege(actor,'kshms_private.invoke_assignment_worker()','EXECUTE') and not has_table_privilege(actor,'kshms_private.email_worker_settings','SELECT'),'Client can invoke private worker or read its settings';n:=n+1;
 end loop;
 assert exists(select 1 from pg_proc p join pg_namespace s on s.oid=p.pronamespace where s.nspname='kshms_private' and p.proname='invoke_assignment_worker' and p.prosecdef and has_table_privilege(p.proowner,'net.http_request_queue','INSERT')),'Scheduled worker lost transport access';n:=n+1;
 perform set_config('kshms.test.deviation_checks',n::text,true);
end $$;
select current_setting('kshms.test.deviation_checks')::int as passed_checks,'No HTTP/email sent; all synthetic data rolled back' as result;
rollback;
