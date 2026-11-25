begin;
set local statement_timeout='25s';
set local lock_timeout='2s';
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

set local role authenticated;
do $$declare c uuid:=current_setting('hr.qa.company')::uuid;e uuid;t uuid:=gen_random_uuid();cid uuid:=gen_random_uuid();p uuid:=gen_random_uuid();m uuid:=gen_random_uuid();r jsonb;v integer;f jsonb;today date:=(now() at time zone 'Europe/Oslo')::date;begin
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.admin'),true);
 perform public.hr_foundation_configure(c,0,true,'Synthetic new sick leave QA','Synthetic QA basis',today+30);
 e:=(public.hr_employee_command(c,'create',jsonb_build_object('user_id',current_setting('hr.qa.self'),'leader_id',current_setting('hr.qa.old')))#>>'{employee,id}')::uuid;
 perform set_config('hr.qa.employee',e::text,true);perform set_config('hr.qa.case',cid::text,true);
 perform public.hr_template_save(c,t,0,jsonb_build_object('title','Synthetic QA sick-leave plan','kind','sickleave','intro','No personal data',
 'questions',jsonb_build_array(jsonb_build_object('id',p,'topic','Work tasks','prompt','How is work?','phase','preparation','required',true),
 jsonb_build_object('id',m,'topic','Adaptation','prompt','What is agreed?','phase','meeting','required',true))),false);
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.old'),true);
 r:=public.hr_sick_leave_start(c,e,1,cid,t,1,today-28,'partial');
 if r#>>'{conversation,milestones,meeting1,status}'<>'review' then raise exception 'QA partial';end if;
 if public.hr_sick_leave_start(c,e,1,cid,t,1,today-28)#>>'{current_revision}'<>'1' then raise exception 'QA duplicate';end if;
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.admin'),true);
 begin perform public.hr_sick_leave_start(c,e,1,gen_random_uuid(),t,1,today);raise exception 'QA admin start accepted';exception when insufficient_privilege then null;end;
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.self'),true);
 r:=public.hr_sick_leave_command(c,e,1,cid,1,'preparation',jsonb_build_object('answers',jsonb_build_object(p,'Synthetic private preparation')));v:=(r->>'current_revision')::integer;
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.old'),true);
 if public.hr_sick_leave_get(c,e,cid)#>'{conversation,preparation}'<>'{}'::jsonb then raise exception 'QA private preparation leaked';end if;
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.system'),true);
 begin perform public.hr_sick_leave_get(c,e,cid);raise exception 'QA system HR leak';exception when insufficient_privilege then null;end;
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.outsider'),true);
 begin perform public.hr_sick_leave_get(c,e,cid);raise exception 'QA unrelated reader';exception when insufficient_privilege then null;end;
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.self'),true);
 r:=public.hr_sick_leave_command(c,e,1,cid,v,'share','{}');v:=(r->>'current_revision')::integer;
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.old'),true);
 r:=public.hr_sick_leave_command(c,e,1,cid,v,'meeting',jsonb_build_object('answers',jsonb_build_object(m,'Synthetic work plan'),'actions',jsonb_build_array(jsonb_build_object('id',gen_random_uuid(),'task','Synthetic task','owner_id',current_setting('hr.qa.self'),'due_on',today,'done',false)),'next_on',today));v:=(r->>'current_revision')::integer;
 if jsonb_array_length(public.hr_followup_tasks(c)->'tasks')<>6 then raise exception 'QA leader must receive milestones, next and employee task';end if;
 begin perform public.hr_sick_leave_command(c,e,1,cid,v-1,'ready','{}');raise exception 'QA stale accepted';exception when serialization_failure then null;end;
 r:=public.hr_sick_leave_command(c,e,1,cid,v,'ready','{}');v:=(r->>'current_revision')::integer;
 r:=public.hr_sick_leave_command(c,e,1,cid,v,'confirm','{}');v:=(r->>'current_revision')::integer;
 if r#>>'{conversation,stage}'<>'awaiting' then raise exception 'QA one confirmation';end if;
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.self'),true);
 if jsonb_array_length(public.hr_followup_tasks(c)->'tasks')<>1 then raise exception 'QA employee only own task';end if;
 r:=public.hr_sick_leave_command(c,e,1,cid,v,'confirm','{}');v:=(r->>'current_revision')::integer;
 if r#>>'{conversation,stage}'<>'completed' then raise exception 'QA own confirmations';end if;
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.old'),true);
 begin perform public.hr_sick_leave_command(c,e,1,cid,v,'log_sharing',jsonb_build_object('target','nav','on',today,'version',1,'channel','nav_portal','confirmed',true));raise exception 'QA unshared version accepted';exception when invalid_parameter_value then null;end;
 r:=public.hr_sick_leave_command(c,e,1,cid,v,'log_sharing',jsonb_build_object('target','sykmelder','on',today,'version',v,'channel','other','confirmed',true));v:=(r->>'current_revision')::integer;
 if jsonb_array_length(r#>'{conversation,sharing,sykmelder}')<>1 then raise exception 'QA share journal';end if;
 r:=public.hr_sick_leave_command(c,e,1,cid,v,'close',jsonb_build_object('on',today,'confirmed',true));v:=(r->>'current_revision')::integer;
 if jsonb_array_length(public.hr_followup_tasks(c)->'tasks')<>0 then raise exception 'QA closed reminders';end if;
 r:=public.hr_sick_leave_command(c,e,1,cid,v,'reopen','{}');v:=(r->>'current_revision')::integer;
 perform set_config('hr.qa.revision',v::text,true);
end$$;
reset role;
-- Enabled only within this rollback transaction; cron sees the committed disabled setting.
update hr_private.followup_settings set enabled=true;
do $$declare c uuid:=current_setting('hr.qa.company')::uuid;cid uuid:=current_setting('hr.qa.case')::uuid;begin
 perform hr_private.queue_followup_reminders();perform hr_private.queue_followup_reminders();
 if(select count(*) from hr_private.followup_deliveries where case_id=cid)<>4 then raise exception 'QA due-bucket dedupe';end if;
 update hr_private.followup_deliveries set available_at=case when recipient_id=current_setting('hr.qa.old')::uuid then now()-interval '1 minute' else now()+interval '1 hour' end where case_id=cid;
 -- Worker reserve may only see this synthetic firm's deliveries.
 if exists(select 1 from hr_private.followup_deliveries where company_id<>c and status in('pending','sending')) then raise exception 'QA unrelated queue';end if;
end$$;
set local role service_role;
do $$declare j jsonb;begin
 j:=public.hr_followup_worker_reserve();
 if j is null or (select count(*) from jsonb_object_keys(j))<>3 then raise exception 'QA minimal job';end if;
 if public.hr_followup_worker_validate((j->>'id')::uuid,(j->>'attempt')::uuid) is distinct from true then raise exception 'QA fresh job';end if;
 if public.hr_followup_worker_finish((j->>'id')::uuid,gen_random_uuid(),true) then raise exception 'QA stale attempt';end if;
 perform set_config('hr.qa.job',j->>'id',true);perform set_config('hr.qa.attempt',j->>'attempt',true);
end$$;
reset role;
set local role authenticated;
do $$declare c uuid:=current_setting('hr.qa.company')::uuid;e uuid:=current_setting('hr.qa.employee')::uuid;r jsonb;begin
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.admin'),true);
 r:=public.hr_employee_command(c,'leader',jsonb_build_object('id',e,'revision',1,'leader_id',current_setting('hr.qa.new'),'clear_old_leader_reader',false));
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.old'),true);
 begin perform public.hr_sick_leave_get(c,e,current_setting('hr.qa.case')::uuid);raise exception 'QA old leader accepted';exception when insufficient_privilege then null;end;
end$$;
reset role;
set local role service_role;
do $$begin if public.hr_followup_worker_validate(current_setting('hr.qa.job')::uuid,current_setting('hr.qa.attempt')::uuid) then raise exception 'QA changed leader still receives mail';end if;end$$;
reset role;
set local role authenticated;
do $$declare c uuid:=current_setting('hr.qa.company')::uuid;e uuid:=current_setting('hr.qa.employee')::uuid;begin
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.admin'),true);
 perform public.hr_employee_command(c,'end',jsonb_build_object('id',e,'revision',2,'confirm','END_AND_DELETE'));
end$$;
reset role;
do $$begin
 if exists(select 1 from hr_private.sick_leave_cases where id=current_setting('hr.qa.case')::uuid)
 or exists(select 1 from hr_private.followup_deliveries where case_id=current_setting('hr.qa.case')::uuid)
 or exists(select 1 from hr_private.artifacts where employee_id=current_setting('hr.qa.employee')::uuid) then raise exception 'QA private purge incomplete';end if;
end$$;
select 'PASS: 22 new live sick-leave/leader-reminder/closure/purge checks; rollback only; no provider call' status;
rollback;
