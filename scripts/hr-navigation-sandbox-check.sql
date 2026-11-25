-- H2 menu context: synthetic identities only. Roll back all fixtures.
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
set local role authenticated;
do $$declare c uuid:=current_setting('hr.qa.company')::uuid;b uuid:=current_setting('hr.qa.foreign_company')::uuid;a uuid:=current_setting('hr.qa.admin')::uuid;u uuid:=current_setting('hr.qa.self')::uuid;x jsonb;k text;eid uuid;begin
 perform set_config('request.jwt.claim.sub',a::text,true);
 x:=public.get_hr_context();
 perform pg_temp.hr_assert((x->>'available')::boolean and (x->>'administer')::boolean and not (x->>'enabled')::boolean,'admin onboarding before activation');
 perform pg_temp.hr_assert(x->>'company_id'=c::text and x->>'user_id'=a::text,'current actor and firm');
 perform pg_temp.hr_assert(x->>'content_enabled'='false' and not x ? 'employees' and not x ? 'members' and not x ? 'settings','metadata only');
 foreach k in array array['self','ks','system','outsider'] loop
  perform set_config('request.jwt.claim.sub',current_setting('hr.qa.'||k),true);
  x:=public.get_hr_context();perform pg_temp.hr_assert(not (x->>'available')::boolean and not (x->>'administer')::boolean,'no KS/system/unenabled bypass '||k);
 end loop;
 perform set_config('request.jwt.claim.sub',a::text,true);
 perform public.hr_foundation_configure(c,0,true,'Syntetisk HR-register','Syntetisk vurdert grunnlag',current_date+30);
 x:=public.hr_employee_command(c,'create',jsonb_build_object('user_id',u));eid:=(x#>>'{employee,id}')::uuid;
 perform set_config('request.jwt.claim.sub',u::text,true);
 x:=public.get_hr_context();perform pg_temp.hr_assert((x->>'available')::boolean and (x->>'enabled')::boolean and not (x->>'administer')::boolean,'employee activated register');
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.foreign'),true);
 x:=public.get_hr_context();perform pg_temp.hr_assert(x->>'company_id'=b::text and not (x->>'enabled')::boolean,'foreign own context only');
 perform set_config('request.jwt.claim.sub',a::text,true);
 perform public.hr_employee_command(c,'end',jsonb_build_object('id',eid,'revision',1,'confirm','END_AND_DELETE'));
 perform set_config('request.jwt.claim.sub',u::text,true);
 perform pg_temp.hr_reject('select public.get_hr_context()','42501');
end$$;
reset role;
select set_config('request.jwt.claim.sub',current_setting('hr.qa.system'),true);
update public.profiles set deactivated=true where id=current_setting('hr.qa.old')::uuid;
set local role authenticated;
select set_config('request.jwt.claim.sub',current_setting('hr.qa.old'),true);
select pg_temp.hr_reject('select public.get_hr_context()','42501');
reset role;
select set_config('request.jwt.claim.sub',current_setting('hr.qa.system'),true);
update public.profiles set role='kunde' where id=current_setting('hr.qa.new')::uuid;
set local role authenticated;
select set_config('request.jwt.claim.sub',current_setting('hr.qa.new'),true);
select pg_temp.hr_reject('select public.get_hr_context()','42501');
select set_config('request.jwt.claim.sub','',true);
select pg_temp.hr_reject('select public.get_hr_context()','42501');
set local role anon;
select pg_temp.hr_reject('select public.get_hr_context()','42501');
set local role service_role;
select pg_temp.hr_reject('select public.get_hr_context()','42501');
reset role;
select pg_temp.hr_assert((select prosecdef and proconfig=array['search_path=""'] from pg_proc where oid='public.get_hr_context()'::regprocedure),'definer with empty path');
select current_setting('hr.qa.count')::integer as passed_assertions;
rollback;
