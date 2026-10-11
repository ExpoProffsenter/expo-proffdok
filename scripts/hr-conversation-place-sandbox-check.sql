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

-- No worker/network dispatch: enabled flag exists only inside this rollback transaction.
update hr_private.followup_settings set enabled=false,endpoint='';
set local role authenticated;
do $$declare c uuid:=current_setting('hr.qa.company')::uuid;e uuid;t uuid:=gen_random_uuid();cid uuid:=gen_random_uuid();p uuid:=gen_random_uuid();r jsonb;begin
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.admin'),true);
 perform public.hr_foundation_configure(c,0,true,'Synthetic invitation QA','Synthetic invitation basis',current_date+30);
 e:=(public.hr_employee_command(c,'create',jsonb_build_object('user_id',current_setting('hr.qa.self'),'leader_id',current_setting('hr.qa.old')))#>>'{employee,id}')::uuid;
 perform set_config('hr.qa.employee',e::text,true);perform set_config('hr.qa.case',cid::text,true);
 perform public.hr_template_save(c,t,0,jsonb_build_object('title','Synthetic invitation','kind','annual','intro','No personal data','questions',jsonb_build_array(jsonb_build_object('id',p,'topic','Work','prompt','How is work?','phase','preparation','required',false))),false);
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.old'),true);
 perform public.hr_conversation_start_at_place(c,e,1,cid,t,1,current_date+10,'12:00','Sted A');
 r:=public.hr_conversation_invitation_status(c,e,cid);
 perform pg_temp.hr_assert(r->>'email_status'='disabled' and (r->>'can_notify')::boolean and (r->>'app_notification')::boolean,'disabled invitation button, live app preparation');
 perform pg_temp.hr_assert(public.hr_conversation_notify(c,e,1,cid,1)->>'email_status'='disabled','disabled click does not claim sent');
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.self'),true);
 perform pg_temp.hr_assert(not(public.hr_conversation_invitation_status(c,e,cid)->>'can_notify')::boolean,'employee cannot send own invitation');
 perform pg_temp.hr_reject(format('select public.hr_conversation_notify(%L,%L,1,%L,1)',c,e,cid),'42501');
 perform pg_temp.hr_assert(public.hr_followup_tasks(c)#>>'{tasks,0,task_key}'='preparation','employee receives preparation task');
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.admin'),true);
 perform pg_temp.hr_reject(format('select public.hr_conversation_notify(%L,%L,1,%L,1)',c,e,cid),'42501');
end$$;
reset role;
select pg_temp.hr_assert(not exists(select 1 from hr_private.followup_deliveries where case_id=current_setting('hr.qa.case')::uuid),'creation and disabled click create no email');
update hr_private.followup_settings set enabled=true,endpoint='';
set local role authenticated;
select set_config('request.jwt.claim.sub',current_setting('hr.qa.old'),true);
do $$declare c uuid:=current_setting('hr.qa.company')::uuid;e uuid:=current_setting('hr.qa.employee')::uuid;cid uuid:=current_setting('hr.qa.case')::uuid;begin
 perform pg_temp.hr_reject(format('select public.hr_conversation_notify(%L,%L,1,%L,0)',c,e,cid),'40001');
 perform pg_temp.hr_assert(public.hr_conversation_invitation_status(c,e,cid)->>'email_status'='not_queued','explicit send required');
 perform pg_temp.hr_assert(public.hr_conversation_notify(c,e,1,cid,1)->>'email_status'='pending','explicit invitation queued');
 perform pg_temp.hr_assert(public.hr_conversation_notify(c,e,1,cid,1)->>'email_status'='pending','duplicate click stays same queue item');
end$$;
reset role;
select pg_temp.hr_assert((select count(*) from hr_private.followup_deliveries where case_id=current_setting('hr.qa.case')::uuid)=1,'one delivery');
-- Put only the synthetic case first; never reserve or rewrite an unrelated job.
update hr_private.followup_deliveries set available_at='1900-01-01' where case_id=current_setting('hr.qa.case')::uuid;
set local role service_role;
do $$declare j jsonb;begin
 perform pg_temp.hr_assert(position('bucket>=-3' in pg_get_functiondef('public.hr_followup_worker_reserve()'::regprocedure))>0,'deadline worker excludes invitation bucket; runtime covered in isolated PostgreSQL');
 j:=public.hr_conversation_invitation_reserve();
 perform pg_temp.hr_assert(j->>'time'='12:00' and j->>'on'=(current_date+10)::text,'job carries actual date and clock');
 perform pg_temp.hr_assert((select count(*) from jsonb_object_keys(j))=7,'minimal invitation transport');
 perform pg_temp.hr_assert(j->>'location'='Sted A' and j#>>'{branding,name}'='HR H1 QA','place and correct firm branding');
 perform pg_temp.hr_assert(public.hr_conversation_invitation_validate_place((j->>'id')::uuid,(j->>'attempt')::uuid,(j->>'on')::date,j->>'time,j->>'location'),'fresh invitation valid');
 perform pg_temp.hr_assert(not public.hr_conversation_invitation_validate_place((j->>'id')::uuid,(j->>'attempt')::uuid,(j->>'on')::date,j->>'time,'Wrong place'),'wrong place refused');
 perform pg_temp.hr_assert(not public.hr_conversation_invitation_validate((j->>'id')::uuid,(j->>'attempt')::uuid,(j->>'on')::date,'12:01'),'changed clock invalid');
 perform pg_temp.hr_assert(not public.hr_conversation_invitation_validate((j->>'id')::uuid,(j->>'attempt')::uuid,current_date,'12:00'),'wrong date invalid');
 perform pg_temp.hr_assert(not public.hr_followup_worker_finish((j->>'id')::uuid,gen_random_uuid(),true),'stale attempt cannot confirm');
 perform pg_temp.hr_assert(public.hr_followup_worker_finish((j->>'id')::uuid,(j->>'attempt')::uuid,false),'failed provider remains pending');
 perform pg_temp.hr_assert((select available_at>now() from hr_private.followup_deliveries where id=(j->>'id')::uuid),'backoff honored for only the synthetic job');
end$$;
reset role;
update hr_private.followup_deliveries set available_at='1900-01-01' where case_id=current_setting('hr.qa.case')::uuid;
set local role service_role;
do $$declare j jsonb;begin
 j:=public.hr_conversation_invitation_reserve();
 perform pg_temp.hr_assert(public.hr_followup_worker_finish((j->>'id')::uuid,(j->>'attempt')::uuid,true),'synthetic provider acknowledgement');
end$$;
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub',current_setting('hr.qa.old'),true);
do $$declare c uuid:=current_setting('hr.qa.company')::uuid;e uuid:=current_setting('hr.qa.employee')::uuid;cid uuid:=current_setting('hr.qa.case')::uuid;begin
 perform pg_temp.hr_assert(public.hr_conversation_invitation_status(c,e,cid)->>'email_status'='sent','confirmed sent status');
 perform public.hr_conversation_schedule(c,e,1,cid,1,current_date+10,'12:30');
 perform pg_temp.hr_assert(public.hr_conversation_invitation_status(c,e,cid)->>'email_status'='not_queued','new clock requires new invitation');
 perform public.hr_conversation_notify(c,e,1,cid,2);
 perform public.hr_conversation_schedule(c,e,1,cid,2,current_date+10,'12:00');
end$$;
reset role;
set local role service_role;
update hr_private.followup_deliveries set available_at='1900-01-01' where case_id=current_setting('hr.qa.case')::uuid and status='pending';
select pg_temp.hr_assert(public.hr_conversation_invitation_reserve()->>'suppressed'='true','changed appointment suppressed before transport');
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub',current_setting('hr.qa.self'),true);
do $$declare c uuid:=current_setting('hr.qa.company')::uuid;e uuid:=current_setting('hr.qa.employee')::uuid;cid uuid:=current_setting('hr.qa.case')::uuid;r jsonb;begin
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.old'),true);
 r:=public.hr_conversation_schedule_at_place(c,e,1,cid,3,current_date+10,'12:00','Sted B');
 perform pg_temp.hr_assert(r#>>'{conversation,meeting_location}'='Sted B','place saved');
 perform pg_temp.hr_assert(public.hr_conversation_get(c,e,cid,1)#>>'{conversation,meeting_location}'='Sted A','old place remains immutable');
 perform pg_temp.hr_assert(public.hr_conversation_invitation_status(c,e,cid)->>'email_status'='not_queued','new place requires explicit invitation');
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.self'),true);
 r:=public.hr_conversation_command(c,e,1,cid,4,'share');
 perform pg_temp.hr_assert(not(public.hr_conversation_invitation_status(c,e,cid)->>'app_notification')::boolean,'shared preparation closes task');
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.old'),true);
 perform pg_temp.hr_reject(format('select public.hr_conversation_notify(%L,%L,1,%L,5)',c,e,cid),'22023');
 perform pg_temp.hr_assert(not has_function_privilege('anon','public.hr_conversation_notify(uuid,uuid,integer,uuid,integer)','execute'),'anon cannot invite');
 perform pg_temp.hr_assert(not has_function_privilege('authenticated','public.hr_conversation_invitation_reserve()','execute'),'worker reserve server only');
 perform pg_temp.hr_assert(not has_function_privilege('authenticated','public.hr_conversation_invitation_validate(uuid,uuid,date,text)','execute'),'worker validate server only');
 perform pg_temp.hr_assert(not has_function_privilege('service_role','public.hr_conversation_notify(uuid,uuid,integer,uuid,integer)','execute'),'worker cannot invite on behalf of leader');
end$$;
reset role;
select current_setting('hr.qa.count')::integer as place_invitation_assertions_pass;
rollback;
