-- Sandbox only. Existing synthetic demo identities; every change rolls back.
begin;
set local statement_timeout='20s';
set local lock_timeout='2s';
update public.company_module_access set enabled=false
 where company_id='e0000000-0000-4000-8000-000000000001' and module_key='hr';
update hr_private.module_access set enabled=false
 where company_id='e0000000-0000-4000-8000-000000000001' and user_id='d0000000-0000-4000-8000-000000000103';
-- Ensure the negative test covers the formerly nullable leader predicate.
update hr_private.employees set leader_id=null
 where company_id='e0000000-0000-4000-8000-000000000001' and user_id='d0000000-0000-4000-8000-000000000103';
select set_config('qa.hr.employee',(select id::text from hr_private.employees where company_id='e0000000-0000-4000-8000-000000000001' and user_id='d0000000-0000-4000-8000-000000000103'),true);
select set_config('request.jwt.claim.sub','d0000000-0000-4000-8000-000000000103',true);
set local role authenticated;
do $$
declare c uuid:='e0000000-0000-4000-8000-000000000001';x jsonb;
begin
 x:=public.get_hr_context();assert x->>'available'='true' and x->>'administer'='false','Bolig HR access or ordinary role lost';
 assert public.get_my_personal_context()->>'company_hr'='true','Min side HR metadata missing';
 x:=public.hr_employee_get(c,current_setting('qa.hr.employee')::uuid);
 assert x#>>'{employee,user_id}'=auth.uid()::text,'Own native employee record unavailable';
 perform public.time_projects(c,'');
end$$;
reset role;
select set_config('request.jwt.claim.sub','d0000000-0000-4000-8000-000000000101',true);
set local role authenticated;
do $$
declare c uuid:='e0000000-0000-4000-8000-000000000001';denied boolean:=false;
begin
 assert public.get_hr_context()->>'available'='true','Second internal Bolig actor lacks HR module';
 begin perform public.hr_employee_get(c,current_setting('qa.hr.employee')::uuid);
 exception when insufficient_privilege then denied:=true;end;
 assert denied,'Missing leader must deny unrelated Bolig manager';
end$$;
reset role;
update bolig_private.member_access set access_role='none'
 where company_id='e0000000-0000-4000-8000-000000000001' and user_id='d0000000-0000-4000-8000-000000000103';
select set_config('request.jwt.claim.sub','d0000000-0000-4000-8000-000000000103',true);
set local role authenticated;
do $$declare denied boolean:=false;begin
 begin perform public.get_hr_context();exception when insufficient_privilege then denied:=true;end;
 assert denied,'Revoked Bolig must stop derived HR immediately';
end$$;
reset role;
update public.company_module_access set enabled=true
 where company_id='e0000000-0000-4000-8000-000000000001' and module_key='hr';
update hr_private.module_access set enabled=true
 where company_id='e0000000-0000-4000-8000-000000000001' and user_id='d0000000-0000-4000-8000-000000000103';
set local role authenticated;
do $$begin assert public.get_hr_context()->>'available'='true','Independent HR grant must survive revoked Bolig';end$$;
select 'PASS native HR bundle without independent license/grant, personal metadata, own employee/time gateway, unrelated NULL-leader denial, revocation and independent-grant continuity; rollback' result;
rollback;
