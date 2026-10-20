-- Preceded by existing random company/project/employee fixture. Always rollback.
do $$declare u uuid:=gen_random_uuid();begin
 perform set_config('support.qa.admin',u::text,true);
 insert into auth.users(id,aud,role,email,created_at,updated_at,raw_app_meta_data,raw_user_meta_data)
 values(u,'authenticated','authenticated','support-qa-'||u||'@example.invalid',now(),now(),'{}','{}');
 insert into public.profiles(id,email,company_name,approved,deactivated,role,company_role,system_role)
 values(u,'support-qa-'||u||'@example.invalid','support-qa-'||u,true,false,'admin','ansatt','systemadmin')
 on conflict(id) do update set approved=true,deactivated=false,role='admin',system_role='systemadmin';
end$$;
set local role authenticated;
do $$declare c uuid:=current_setting('ks.checklist.company')::uuid;pid uuid:=current_setting('ks.checklist.project')::uuid;
 employee uuid:=current_setting('ks.checklist.employee')::uuid;sys uuid:=current_setting('support.qa.admin')::uuid;
 row jsonb;state jsonb;payload jsonb;
begin
 perform set_config('request.jwt.claim.sub',employee::text,true);
 payload:=jsonb_build_object('id',gen_random_uuid(),'revision',0,'definition',jsonb_build_object('category','Support QA','items',jsonb_build_array('Point'),'requirements','{}'::jsonb),'answers',jsonb_build_object('Point',jsonb_build_object('status','Ok')));
 row:=public.project_checklist_command(c,pid,'save',gen_random_uuid(),payload);
 -- Employee and firmaadmin keep ordinary read/write rights, not support rights.
 begin perform public.project_checklist_support_state(pid);raise exception 'Employee support bypass';exception when insufficient_privilege then null;end;
 perform set_config('request.jwt.claim.sub',current_setting('ks.checklist.admin'),true);
 begin perform public.project_checklist_support_state(pid);raise exception 'Firmaadmin support bypass';exception when insufficient_privilege then null;end;
 perform set_config('request.jwt.claim.sub',sys::text,true);
 begin perform public.project_checklist_state(c,pid);raise exception 'Ordinary active-company guard bypassed';exception when insufficient_privilege then null;end;
 state:=public.project_checklist_support_state(pid);
 assert state#>>'{context,company_id}'=c::text and state#>>'{context,user_id}'=sys::text and state#>>'{context,project_id}'=pid::text;
 assert state#>>'{context,support_read_only}'='true';
 assert jsonb_array_length(state->'runs')=1 and state->'runs'->0=row->'run';
 assert state#>>'{checklist,Support QA,Point,status}'='Ok';
 begin perform public.project_checklist_command(c,pid,'complete',gen_random_uuid(),payload);raise exception 'Support wrote target company';exception when insufficient_privilege then null;end;
 begin perform public.project_checklist_support_state(gen_random_uuid());raise exception 'Missing project accepted';exception when insufficient_privilege then null;end;
 assert not has_function_privilege('anon','public.project_checklist_support_state(uuid)','execute');
 assert not has_function_privilege('service_role','public.project_checklist_support_state(uuid)','execute');
 perform set_config('request.jwt.claim.sub',employee::text,true);
 assert public.project_checklist_state(c,pid)->'runs'->0=row->'run','Support modified employee answers';
end$$;
reset role;
do $$declare u uuid:=current_setting('support.qa.admin')::uuid;begin
 assert not exists(select 1 from public.sales_company_memberships where user_id=u and company_id=current_setting('ks.checklist.company')::uuid),'QA admin must not belong to project firm';
 perform set_config('request.jwt.claim.sub',current_setting('ks.checklist.sys'),true);
 update public.profiles set deactivated=true where id=u;
end$$;
set local role authenticated;
do $$begin
 perform set_config('request.jwt.claim.sub',current_setting('support.qa.admin'),true);
 begin perform public.project_checklist_support_state(current_setting('ks.checklist.project')::uuid);raise exception 'Deactivated admin support bypass';exception when insufficient_privilege then null;end;
end$$;
reset role;
select 'PASS: explicit systemadmin support read across firms; exact project/answers/history; employee, firmaadmin, deactivated admin, anon and service rejected; all ordinary writes unchanged' result;
rollback;
