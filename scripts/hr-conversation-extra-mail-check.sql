-- HR templates: synthetic identities only. Roll back all fixtures.
begin;
set local statement_timeout='25s';
set local lock_timeout='2s';
create function pg_temp.hr_assert(ok boolean,label text) returns void language plpgsql as $$begin
 if ok is distinct from true then raise exception 'HR QA: %',label; end if;
 perform set_config('hr.qa.count',(coalesce(nullif(current_setting('hr.qa.count',true),''),'0')::integer+1)::text,true);
end$$;
create function pg_temp.hr_reject(q text,code text) returns void language plpgsql as $$declare failed boolean:=false;got text;begin
 begin execute q;exception when others then failed:=true;get stacked diagnostics got=returned_sqlstate;end;
 perform pg_temp.hr_assert(failed and got=code,'expected '||code||', got '||coalesce(got,'success'));
end$$;
do $$declare c uuid:=gen_random_uuid();b uuid:=gen_random_uuid();u uuid;k text;begin
 insert into public.sales_company_scopes(id,normalized_name,display_name) values(c,'hr-h1-qa-'||c,'HR H1 QA'),(b,'hr-h1-qa-'||b,'HR H1 foreign');
 perform set_config('hr.qa.company',c::text,true);perform set_config('hr.qa.foreign_company',b::text,true);
 foreach k in array array['admin','self','old','new','reader','ks','system','outsider','foreign'] loop
  u:=gen_random_uuid();perform set_config('hr.qa.'||k,u::text,true);
  insert into auth.users(id,aud,role,email,created_at,updated_at,raw_app_meta_data,raw_user_meta_data)
   values(u,'authenticated','authenticated','hr-h1-qa-'||u||'@example.invalid',now(),now(),'{}','{}');
  insert into public.profiles(id,email,company_name,approved,deactivated,role,company_role)
   values(u,'hr-h1-qa-'||u||'@example.invalid','hr-h1-qa-'||case when k='foreign' then b else c end,true,false,case when k in ('admin','foreign') then 'admin' else 'member' end,case when k in ('admin','foreign') then 'firmaadmin' else 'ansatt' end)
   on conflict(id) do update set approved=true,deactivated=false,role=excluded.role,company_role=excluded.company_role,system_role=null;
  insert into public.sales_company_memberships(company_id,user_id,is_primary,workspace_role)
   values(case when k='foreign' then b else c end,u,true,case when k in ('admin','foreign') then 'firmaadmin' else 'ansatt' end) on conflict(company_id,user_id) do update set workspace_role=excluded.workspace_role;
  insert into public.user_active_company_scope(user_id,company_id) values(u,case when k='foreign' then b else c end) on conflict(user_id) do update set company_id=excluded.company_id;
 end loop;
 update public.profiles set system_role='systemadmin',is_admin=true where id=current_setting('hr.qa.system')::uuid;
 insert into public.company_module_access(company_id,module_key,enabled) values(c,'kshms',true);
 -- Existing relationship scenarios now run behind explicit module entitlements.
 insert into public.company_module_access(company_id,module_key,enabled) values(c,'hr',true),(b,'hr',true);
 insert into hr_private.module_access(company_id,user_id,enabled) select company_id,user_id,true from public.sales_company_memberships where company_id in (c,b);
 insert into public.kshms_member_access(company_id,user_id,role,enabled,changed_by) values(c,current_setting('hr.qa.ks')::uuid,'responsible',true,current_setting('hr.qa.admin')::uuid);
end$$;
-- Fixture setup is the same isolated random-firm/identity contract as H1.
-- The harness prepends H1's setup before the first authenticated-role statement.

-- Test only random synthetic actors/case; all worker transport is disabled in this rollback.
update hr_private.followup_settings set enabled=true,endpoint='';
set local role authenticated;
do $$declare c uuid:=current_setting('hr.qa.company')::uuid;e uuid;t uuid:=gen_random_uuid();cid uuid:=gen_random_uuid();p uuid:=gen_random_uuid();r jsonb;begin
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.admin'),true);
 perform public.hr_foundation_configure(c,0,true,'Synthetic mail QA','Synthetic mail basis',current_date+30);
 e:=(public.hr_employee_command(c,'create',jsonb_build_object('user_id',current_setting('hr.qa.self'),'leader_id',current_setting('hr.qa.old')))#>>'{employee,id}')::uuid;
 perform set_config('hr.qa.employee',e::text,true);perform set_config('hr.qa.case',cid::text,true);perform set_config('hr.qa.question',p::text,true);
 perform public.hr_template_save(c,t,0,jsonb_build_object('title','Synthetic mail QA','kind','annual','intro','No personal data','questions',jsonb_build_array(jsonb_build_object('id',p,'topic','Work','prompt','How is work?','phase','preparation','required',false))),false);
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.old'),true);
 perform public.hr_conversation_start_at(c,e,1,cid,t,1,current_date+10,'12:00');
 r:=public.hr_conversation_reminder(c,e,1,cid,1,true);
 perform pg_temp.hr_assert(r#>>'{conversation,leader_email_reminder}'='true','leader opts in');
 perform pg_temp.hr_assert(r#>>'{conversation,content_version}'='1','mail preference preserves content version');
 perform pg_temp.hr_assert(public.hr_conversation_reminder(c,e,1,cid,2,true)->>'current_revision'='2','same preference idempotent');
 perform pg_temp.hr_reject(format('select public.hr_conversation_reminder(%L,%L,1,%L,1,false)',c,e,cid),'40001');
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.self'),true);
 perform pg_temp.hr_reject(format('select public.hr_conversation_reminder(%L,%L,1,%L,2,false)',c,e,cid),'42501');
 r:=public.hr_conversation_command(c,e,1,cid,2,'preparation',jsonb_build_object('answers',jsonb_build_object(p,'Private synthetic preparation')));
end$$;
reset role;
select pg_temp.hr_assert((select count(*) from hr_private.followup_deliveries where case_id=current_setting('hr.qa.case')::uuid and task_key='meeting-reminder')=1,'one opted reminder');
select pg_temp.hr_assert((select available_at=hr_private.conversation_meeting_at(due_on::text,'12:00')-interval '24 hours' and available_at>now() from hr_private.followup_deliveries where case_id=current_setting('hr.qa.case')::uuid and task_key='meeting-reminder'),'24h due time, not early');
select pg_temp.hr_assert(not exists(select 1 from hr_private.followup_deliveries where case_id=current_setting('hr.qa.case')::uuid and task_key='employee-feedback'),'private preparation queues no email');
select pg_temp.hr_assert(hr_private.conversation_meeting_at('2026-03-29','02:30') is null,'spring DST nonexistent time');
select pg_temp.hr_assert(hr_private.conversation_meeting_at('2026-10-25','02:30')='2026-10-25 00:30Z'::timestamptz,'SQL/calendar autumn instant');
update hr_private.followup_deliveries set available_at='1900-01-01' where case_id=current_setting('hr.qa.case')::uuid and task_key='meeting-reminder';
set local role service_role;
do $$declare j jsonb;begin
 j:=public.hr_conversation_mail_reserve('meeting-reminder');perform pg_temp.hr_assert(j->>'to'=(select email from public.profiles where id=current_setting('hr.qa.old')::uuid),'reminder goes to current leader');
 perform pg_temp.hr_assert(public.hr_conversation_mail_validate((j->>'id')::uuid,(j->>'attempt')::uuid,'meeting-reminder',(j->>'on')::date,j->>'time'),'reminder freshly valid');
 perform set_config('hr.qa.delivery',j->>'id',true);perform set_config('hr.qa.attempt',j->>'attempt',true);
end$$;
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub',current_setting('hr.qa.old'),true);
select public.hr_conversation_reminder(current_setting('hr.qa.company')::uuid,current_setting('hr.qa.employee')::uuid,1,current_setting('hr.qa.case')::uuid,3,false);
reset role;
set local role service_role;
select pg_temp.hr_assert(not public.hr_conversation_mail_validate(current_setting('hr.qa.delivery')::uuid,current_setting('hr.qa.attempt')::uuid,'meeting-reminder',current_date+10,'12:00'),'opt-out stops leased reminder');
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub',current_setting('hr.qa.self'),true);
select public.hr_conversation_command(current_setting('hr.qa.company')::uuid,current_setting('hr.qa.employee')::uuid,1,current_setting('hr.qa.case')::uuid,4,'share');
reset role;
update hr_private.followup_deliveries set available_at='1900-01-01' where case_id=current_setting('hr.qa.case')::uuid and task_key='employee-feedback';
set local role service_role;
do $$declare j jsonb;begin
 j:=public.hr_conversation_mail_reserve('employee-feedback');
 perform pg_temp.hr_assert((select count(*) from jsonb_object_keys(j))=3,'no HR contents in feedback transport');
 perform pg_temp.hr_assert(public.hr_conversation_mail_validate((j->>'id')::uuid,(j->>'attempt')::uuid,'employee-feedback'),'shared preparation notifies leader');
 perform pg_temp.hr_assert(not public.hr_conversation_mail_validate((j->>'id')::uuid,(j->>'attempt')::uuid,'meeting-reminder',current_date+10,'12:00'),'kind confusion denied');
 perform pg_temp.hr_assert(public.hr_followup_worker_finish((j->>'id')::uuid,(j->>'attempt')::uuid,true),'synthetic provider ack');
end$$;
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub',current_setting('hr.qa.self'),true);
select public.hr_conversation_command(current_setting('hr.qa.company')::uuid,current_setting('hr.qa.employee')::uuid,1,current_setting('hr.qa.case')::uuid,5,'comment','{"text":"Synthetic employee comment"}');
reset role;
select pg_temp.hr_assert((select count(*) from hr_private.followup_deliveries where case_id=current_setting('hr.qa.case')::uuid and task_key='employee-feedback')=2,'employee comment queues separate alert');
update hr_private.followup_deliveries set available_at='1900-01-01' where case_id=current_setting('hr.qa.case')::uuid and task_key='employee-feedback' and status='pending';
set local role service_role;
do $$declare j jsonb;begin j:=public.hr_conversation_mail_reserve('employee-feedback');perform set_config('hr.qa.delivery',j->>'id',true);perform set_config('hr.qa.attempt',j->>'attempt',true);end$$;
reset role;
update hr_private.employees set leader_id=current_setting('hr.qa.new')::uuid where id=current_setting('hr.qa.employee')::uuid;
set local role service_role;
select pg_temp.hr_assert(not public.hr_conversation_mail_validate(current_setting('hr.qa.delivery')::uuid,current_setting('hr.qa.attempt')::uuid,'employee-feedback'),'leader change stops waiting feedback');
reset role;
select pg_temp.hr_assert(not has_function_privilege('anon','public.hr_conversation_reminder(uuid,uuid,integer,uuid,integer,boolean)','execute'),'anon cannot opt in');
select pg_temp.hr_assert(not has_function_privilege('authenticated','public.hr_conversation_mail_reserve(text)','execute'),'mail reserve server only');
select pg_temp.hr_assert(not has_function_privilege('authenticated','public.hr_conversation_mail_validate(uuid,uuid,text,date,text)','execute'),'mail validate server only');
select current_setting('hr.qa.count')::integer as extra_mail_assertions_pass;
rollback;
