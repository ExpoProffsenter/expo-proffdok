-- H1 Sandbox synthetic identities only. Roll back all fixtures.
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


 insert into public.kshms_member_access(company_id,user_id,role,enabled,changed_by) values(c,current_setting('hr.qa.ks')::uuid,'responsible',true,current_setting('hr.qa.admin')::uuid);
end$$;
set local role authenticated;
do $$declare c uuid:=current_setting('hr.qa.company')::uuid;b uuid:=current_setting('hr.qa.foreign_company')::uuid;a uuid:=current_setting('hr.qa.admin')::uuid;u uuid:=current_setting('hr.qa.self')::uuid;sys uuid:=current_setting('hr.qa.system')::uuid;x jsonb;prior jsonb;eid uuid;k text;begin
 perform set_config('request.jwt.claim.sub',a::text,true);
 perform pg_temp.hr_reject('select public.get_hr_context()','42501');
 x:=public.people_modules_company_get(c);perform pg_temp.hr_assert(x->>'hr'='false','HR license defaults closed');
 perform pg_temp.hr_reject(format('select public.people_modules_company_set(%L,%L::jsonb,true,true)',c,x),'42501');
 perform pg_temp.hr_reject(format('select public.people_modules_company_get(%L)',b),'42501');
 perform set_config('request.jwt.claim.sub',sys::text,true);
 x:=public.people_modules_company_set(c,x,true,true);perform pg_temp.hr_assert(x->>'hr'='true' and x->>'kshms'='true','systemadmin activates company');
 perform pg_temp.hr_reject(format('select public.people_modules_company_set(%L,%L::jsonb,true,false)',c,jsonb_build_object('hr',false)),'40001');
 perform pg_temp.hr_reject('select public.get_hr_context()','42501');
 perform pg_temp.hr_reject(format('select public.hr_foundation_state(%L)',c),'42501');
 perform set_config('request.jwt.claim.sub',a::text,true);
 perform public.hr_foundation_configure(c,0,true,'Syntetisk HR-register','Syntetisk vurdert grunnlag',current_date+30);
 x:=public.hr_employee_command(c,'create',jsonb_build_object('user_id',u,'leader_id',current_setting('hr.qa.old')));eid:=(x#>>'{employee,id}')::uuid;
 prior:=public.people_modules_user_get(c,u);perform pg_temp.hr_assert(prior->>'hr'='false','individual access defaults closed');
 perform pg_temp.hr_reject(format('select public.people_modules_user_get(%L,%L)',c,current_setting('hr.qa.foreign')),'42501');
 perform pg_temp.hr_reject(format('select public.people_modules_user_get(%L,%L)',b,u),'42501');
 perform set_config('request.jwt.claim.sub',u::text,true);
 perform pg_temp.hr_reject('select public.get_hr_context()','42501');
 perform pg_temp.hr_reject(format('select public.hr_employee_get(%L,%L)',c,eid),'42501');
 perform pg_temp.hr_reject(format('select public.people_modules_user_get(%L,%L)',c,u),'42501');
 perform set_config('request.jwt.claim.sub',a::text,true);
 x:=public.people_modules_user_set(c,u,prior,true,'reader',true);perform pg_temp.hr_assert(x->>'hr'='true' and x->>'kshms'='true','firmaadmin grants both atomically');
 perform pg_temp.hr_reject(format('select public.people_modules_user_set(%L,%L,%L::jsonb,false,%L,false)',c,u,prior,'reader'),'40001');
 perform pg_temp.hr_reject(format('select public.people_modules_user_set(%L,%L,%L::jsonb,true,%L,true)',c,u,x,'systemadmin'),'22023');
 perform set_config('request.jwt.claim.sub',u::text,true);
 perform pg_temp.hr_assert(public.get_hr_context()->>'available'='true','granted HR nav');
 perform pg_temp.hr_assert(public.get_kshms_context()->>'enabled'='true','granted KS nav');
 perform pg_temp.hr_assert(public.hr_employee_get(c,eid)#>>'{employee,id}'=eid::text,'own record after module grant');
 perform set_config('request.jwt.claim.sub',a::text,true);
 x:=public.people_modules_user_set(c,u,x,false,'reader',false);
 perform set_config('request.jwt.claim.sub',u::text,true);
 perform pg_temp.hr_reject('select public.get_hr_context()','42501');
 perform pg_temp.hr_reject(format('select public.hr_employee_get(%L,%L)',c,eid),'42501');
 perform pg_temp.hr_assert(public.get_kshms_context()->>'enabled'='false','revoke KS immediately');
 perform set_config('request.jwt.claim.sub',a::text,true);
 perform pg_temp.hr_assert(public.hr_employee_get(c,eid)#>>'{employee,id}'=eid::text,'revoke module preserves record');
 perform pg_temp.hr_reject(format('select public.people_modules_user_get(%L,%L)',c,sys),'42501');
 perform set_config('request.jwt.claim.sub',sys::text,true);
 x:=public.people_modules_user_get(c,sys);perform public.people_modules_user_set(c,sys,x,false,'reader',true);
 perform pg_temp.hr_assert(public.get_hr_context()->>'available'='true','systemadmin needs explicit module grant');
 perform pg_temp.hr_reject(format('select public.hr_employee_get(%L,%L)',c,eid),'42501');
 perform pg_temp.hr_assert(jsonb_array_length(public.hr_employee_list(c)->'employees')=0,'module grant is not HR readership');
 perform pg_temp.hr_reject(format('select public.hr_foundation_state(%L)',c),'42501');
 x:=public.people_modules_company_get(c);prior:=public.people_modules_user_get(c,u);
 perform public.people_modules_company_set(c,x,false,false);
 perform pg_temp.hr_reject(format('select public.people_modules_user_set(%L,%L,%L::jsonb,true,%L,true)',c,u,prior,'reader'),'40001');
 prior:=public.people_modules_user_get(c,u);
 perform pg_temp.hr_reject(format('select public.people_modules_user_set(%L,%L,%L::jsonb,true,%L,true)',c,u,prior,'reader'),'42501');
 perform set_config('request.jwt.claim.sub',a::text,true);
 perform pg_temp.hr_reject('select public.get_hr_context()','42501');
 perform pg_temp.hr_reject(format('select public.hr_employee_get(%L,%L)',c,eid),'42501');
 perform set_config('request.jwt.claim.sub',sys::text,true);
 x:=public.people_modules_company_get(c);perform public.people_modules_company_set(c,x,true,true);
 perform set_config('request.jwt.claim.sub',a::text,true);
 perform pg_temp.hr_assert(public.hr_employee_get(c,eid)#>>'{employee,id}'=eid::text,'reactivation preserves HR');
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.ks'),true);
 perform pg_temp.hr_reject('select public.get_hr_context()','42501');
 perform pg_temp.hr_reject(format('select public.people_modules_user_get(%L,%L)',c,u),'42501');
 perform set_config('request.jwt.claim.sub',a::text,true);
 x:=public.people_modules_user_get(c,u);perform public.people_modules_user_set(c,u,x,false,'reader',true);
 perform public.hr_employee_command(c,'end',jsonb_build_object('id',eid,'revision',1,'confirm','END_AND_DELETE'));
 x:=public.people_modules_user_get(c,u);perform pg_temp.hr_assert(x->>'hr'='false','closure removes module assignment');
 perform pg_temp.hr_reject(format('select public.people_modules_user_set(%L,%L,%L::jsonb,false,%L,true)',c,u,x,'reader'),'42501');
end$$;
reset role;
select current_setting('hr.qa.count')::integer as assertions,'PASS' as result;
rollback;
