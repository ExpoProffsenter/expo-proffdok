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
 insert into public.sales_company_scopes(id,normalized_name,display_name) values(c,'hr-personal-qa-'||c,'HR H1 QA'),(b,'hr-personal-qa-'||b,'HR H1 foreign');
 perform set_config('hr.qa.company',c::text,true);perform set_config('hr.qa.foreign_company',b::text,true);
 foreach k in array array['admin','self','old','new','reader','ks','system','outsider','foreign'] loop
  u:=gen_random_uuid();perform set_config('hr.qa.'||k,u::text,true);
  insert into auth.users(id,aud,role,email,created_at,updated_at,raw_app_meta_data,raw_user_meta_data)
   values(u,'authenticated','authenticated','hr-personal-qa-'||u||'@example.invalid',now(),now(),'{}','{}');
  insert into public.profiles(id,email,company_name,approved,deactivated,role,company_role)
   values(u,'hr-personal-qa-'||u||'@example.invalid','hr-personal-qa-'||case when k='foreign' then b else c end,true,false,case when k in ('admin','foreign') then 'admin' else 'member' end,case when k in ('admin','foreign') then 'firmaadmin' else 'ansatt' end)
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
-- These identities and all open-content changes are transaction-local rollback fixtures.
set local role authenticated;
do $$declare c uuid:=current_setting('hr.qa.company')::uuid;x jsonb;e uuid;other uuid;begin
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.admin'),true);
 perform public.hr_foundation_configure(c,0,true,'Syntetisk personlig HR-register','Syntetisk vurdert grunnlag',current_date+30);
 x:=public.hr_employee_command(c,'create',jsonb_build_object('user_id',current_setting('hr.qa.self'),'leader_id',current_setting('hr.qa.old')));e:=(x#>>'{employee,id}')::uuid;
 perform public.hr_employee_command(c,'reader',jsonb_build_object('id',e,'revision',1,'reader_id',current_setting('hr.qa.reader'),'reason','Syntetisk avtalt pårørendeinnsyn'));
 x:=public.hr_employee_command(c,'create',jsonb_build_object('user_id',current_setting('hr.qa.new'),'leader_id',current_setting('hr.qa.self')));other:=(x#>>'{employee,id}')::uuid;
 perform set_config('hr.qa.employee',e::text,true);perform set_config('hr.qa.other',other::text,true);
 perform pg_temp.hr_assert(public.get_my_personal_context()->>'personal_page'='true','company license enables Min side');
 perform pg_temp.hr_assert(public.get_my_personal_context()->>'hr_management'='true','firm admin manages HR');
 perform pg_temp.hr_assert(jsonb_array_length(public.hr_personal_list(c)->'employees')=0,'admin personal list does not list entire firm');
 perform pg_temp.hr_assert(jsonb_array_length(public.hr_management_list(c)->'employees')=2,'admin management lists firm');
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.self'),true);
 perform pg_temp.hr_assert(jsonb_array_length(public.hr_personal_list(c)->'employees')=1,'self sees own record on Min side, not assigned team');
 perform pg_temp.hr_assert(jsonb_array_length(public.hr_management_list(c)->'employees')=1,'registered leader sees own team');
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.old'),true);
 perform pg_temp.hr_assert(public.get_my_personal_context()->>'hr_management'='true','registered leader gets HR menu');
 perform pg_temp.hr_assert(jsonb_array_length(public.hr_personal_list(c)->'employees')=0,'leader team stays in HR');
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.reader'),true);
 perform pg_temp.hr_assert(public.get_my_personal_context()->>'hr_management'='false','explicit reader is not manager');
 perform pg_temp.hr_assert(jsonb_array_length(public.hr_personal_list(c)->'employees')=1,'explicit reader finds shared employee on Min side');
 perform pg_temp.hr_reject(format('select public.hr_management_list(%L)',c),'42501');
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.system'),true);
 perform pg_temp.hr_assert(public.get_my_personal_context()->>'hr_management'='false','system role does not grant HR management');
 perform pg_temp.hr_assert(jsonb_array_length(public.hr_personal_list(c)->'employees')=0,'system role does not grant private employee list');
 perform pg_temp.hr_reject(format('select public.hr_contact_get(%L,%L)',c,e),'42501');
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.ks'),true);
 perform pg_temp.hr_reject(format('select public.hr_contact_get(%L,%L)',c,e),'42501');
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.foreign'),true);
 perform pg_temp.hr_reject(format('select public.hr_personal_list(%L)',c),'42501');
 perform pg_temp.hr_reject(format('select public.hr_contact_get(%L,%L)',c,e),'42501');
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.self'),true);
 x:=public.hr_contact_get(c,null);
 perform pg_temp.hr_assert(x->>'registered'='true' and x->>'available'='false' and not x?'data','closed gate gives no contact payload');
 perform pg_temp.hr_reject(format('select public.hr_contact_save(%L,%L,2,0,%L::jsonb)',c,e,'{"relative_name":"QA only"}'),'42501');
end$$;
reset role;
-- Only this transaction observes an open gate. All live settings remain unchanged after rollback.
update hr_private.runtime_state set content_enabled=true,restore_quarantined=false where singleton;
set local role authenticated;
do $$declare c uuid:=current_setting('hr.qa.company')::uuid;e uuid:=current_setting('hr.qa.employee')::uuid;other uuid:=current_setting('hr.qa.other')::uuid;x jsonb;k text;begin
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.self'),true);
 x:=public.hr_contact_save(c,e,2,0,'{"address":"QA gate 1","relative_name":"QA Pårørende","relative_phone":"12345678"}');
 perform pg_temp.hr_assert(x->>'revision'='1','own contact saved with CAS');
 perform pg_temp.hr_assert(public.hr_contact_get(c,null)#>>'{data,address}'='QA gate 1','own address is server first');
 perform pg_temp.hr_assert(public.hr_contact_get(c,null)->>'editable'='true','self can edit');
 foreach k in array array['admin','old','reader'] loop
  perform set_config('request.jwt.claim.sub',current_setting('hr.qa.'||k),true);
  x:=public.hr_contact_get(c,e);
  perform pg_temp.hr_assert(x#>>'{data,relative_name}'='QA Pårørende','authorized '||k||' reads emergency contact');
  perform pg_temp.hr_assert(x->>'editable'='false','authorized '||k||' has read-only contact');
  perform pg_temp.hr_reject(format('select public.hr_contact_save(%L,%L,2,1,%L::jsonb)',c,e,'{}'),'42501');
 end loop;
 foreach k in array array['system','ks','outsider','new'] loop
  perform set_config('request.jwt.claim.sub',current_setting('hr.qa.'||k),true);
  perform pg_temp.hr_reject(format('select public.hr_contact_get(%L,%L)',c,e),'42501');
 end loop;
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.self'),true);
 perform pg_temp.hr_reject(format('select public.hr_contact_save(%L,%L,2,0,%L::jsonb)',c,e,'{}'),'40001');
 perform pg_temp.hr_reject(format('select public.hr_contact_save(%L,%L,1,1,%L::jsonb)',c,e,'{}'),'40001');
 perform pg_temp.hr_reject(format('select public.hr_contact_save(%L,%L,2,1,%L::jsonb)',c,e,'{"diagnosis":"forbidden"}'),'22023');
 perform pg_temp.hr_reject(format('select public.hr_contact_save(%L,%L,2,1,%L::jsonb)',c,e,'{"address":null}'),'22023');
 perform pg_temp.hr_reject(format('select public.hr_contact_save(%L,%L,2,1,%L::jsonb)',c,e,'[]'),'22023');
 perform pg_temp.hr_reject(format('select public.hr_contact_save(%L,%L,2,1,%L::jsonb)',c,e,jsonb_build_object('relative_phone',repeat('1',41))),'22023');
 x:=public.hr_contact_save(c,e,2,1,'{"address":"  Ny QA gate 2  ","relative_name":"QA Ny pårørende","relative_phone":""}');
 perform pg_temp.hr_assert(x->>'revision'='2','contact correction advances revision');
 x:=public.hr_contact_get(c,e);
 perform pg_temp.hr_assert(x#>>'{data,address}'='Ny QA gate 2' and not (x->'data')?'relative_phone','trim and blank remove old values');
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.admin'),true);
 perform public.hr_employee_command(c,'leader',jsonb_build_object('id',e,'revision',2,'leader_id',current_setting('hr.qa.new')));
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.old'),true);
 perform pg_temp.hr_reject(format('select public.hr_contact_get(%L,%L)',c,e),'42501');
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.new'),true);
 perform pg_temp.hr_assert(public.hr_contact_get(c,e)#>>'{data,relative_name}'='QA Ny pårørende','new leader reads existing relative');
 perform public.hr_contact_save(c,other,1,0,'{"relative_name":"Other employee retained"}');
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.admin'),true);
 perform public.hr_employee_command(c,'revoke_reader',jsonb_build_object('id',e,'revision',3,'reader_id',current_setting('hr.qa.reader')));
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.reader'),true);
 perform pg_temp.hr_reject(format('select public.hr_contact_get(%L,%L)',c,e),'42501');
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.self'),true);
 perform pg_temp.hr_reject(format('select public.hr_contact_save(%L,%L,3,2,%L::jsonb)',c,e,'{}'),'40001');
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.admin'),true);
 x:=public.hr_employee_command(c,'end',jsonb_build_object('id',e,'revision',4,'confirm','END_AND_DELETE'));
 perform pg_temp.hr_assert(x->>'deleted'='true','contact purge completes without files');
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.self'),true);
 perform pg_temp.hr_reject(format('select public.hr_contact_get(%L,%L)',c,e),'42501');
end$$;
reset role;
select pg_temp.hr_assert((select count(*)=0 from hr_private.artifacts where employee_id=current_setting('hr.qa.employee')::uuid),'no relative/address/old correction survives employment purge');
select pg_temp.hr_assert((select count(*)=1 from hr_private.artifacts where employee_id=current_setting('hr.qa.other')::uuid),'other contact preserved');
-- Min side is company licensed; HR/KS permissions remain individual and fresh.
update public.company_module_access set enabled=false where company_id=current_setting('hr.qa.company')::uuid and module_key='hr';
set local role authenticated;
select set_config('request.jwt.claim.sub',current_setting('hr.qa.system'),true);
select pg_temp.hr_assert(public.get_my_personal_context()->>'personal_page'='true','KS license alone keeps Min side');
select pg_temp.hr_assert(public.get_my_personal_context()->>'hr_management'='false','revoked company HR license removes manager');
select pg_temp.hr_reject(format('select public.hr_contact_get(%L,%L)',current_setting('hr.qa.company'),current_setting('hr.qa.other')),'42501');
reset role;
update public.company_module_access set enabled=false where company_id=current_setting('hr.qa.company')::uuid;
set local role authenticated;
select pg_temp.hr_assert(public.get_my_personal_context()->>'personal_page'='false','no license keeps original profile menu');
set local role anon;
select pg_temp.hr_reject('select public.get_my_personal_context()','42501');
select pg_temp.hr_reject('select public.hr_contact_get(null,null)','42501');
set local role service_role;
select pg_temp.hr_reject('select public.hr_contact_get(null,null)','42501');
reset role;
select pg_temp.hr_assert((select bool_and(prosecdef and proconfig=array['search_path=""']) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname in ('get_my_personal_context','hr_personal_list','hr_management_list','hr_contact_get','hr_contact_save')),'five APIs empty search path');
select current_setting('hr.qa.count')::integer as passed_assertions;
rollback;
