-- Run only against ppvircenkjizeiqdxphj. Random fixtures, full rollback.
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


set local role authenticated;
do $$declare c uuid:=current_setting('hr.qa.company')::uuid;e uuid;cat uuid:=gen_random_uuid();cfg jsonb;r jsonb;rows jsonb;wk date:=date_trunc('week',now() at time zone 'Europe/Oslo')::date;bid uuid:=gen_random_uuid();tid uuid:=gen_random_uuid();begin
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.admin'),true);
 perform public.hr_foundation_configure(c,0,true,'Syntetisk QA timer','Syntetisk QA behandling',current_date+30);
 e:=(public.hr_employee_command(c,'create',jsonb_build_object('user_id',current_setting('hr.qa.self'),'leader_id',current_setting('hr.qa.old')))#>>'{employee,id}')::uuid;
 perform public.hr_employee_command(c,'create',jsonb_build_object('user_id',current_setting('hr.qa.admin'),'leader_id',current_setting('hr.qa.old')));
 cfg:=jsonb_build_object('enabled',true,'categories',jsonb_build_array(jsonb_build_object('id',cat,'name','Syntetisk arbeid','kind','work','unit','hours','payroll_code','001','active',true,'project_required',false,'receipt_required',false)),'employee_numbers',jsonb_build_object(current_setting('hr.qa.self'),'004'),'project_numbers','{}'::jsonb,'managers','[]'::jsonb,'deadline_day',0,'deadline_time','12:00','export',jsonb_build_object('separator',';','decimal',',','date_format','yyyy-mm-dd','columns',jsonb_build_array(jsonb_build_object('key','employee_number','label','Ansattnummer'),jsonb_build_object('key','on','label','Dato'),jsonb_build_object('key','payroll_code','label','Kode'),jsonb_build_object('key','quantity','label','Antall'))));
 r:=public.time_setup_save(c,0,cfg);perform pg_temp.hr_assert((r->>'revision')::int=1,'cloud setup saved');
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.self'),true);
 perform pg_temp.hr_reject(format('select public.time_setup_get(%L)',c),'42501');
 rows:=jsonb_build_array(jsonb_build_object('id',gen_random_uuid(),'on',wk,'category_id',cat,'project_id',null,'external_project','00458','mode','quantity','quantity','7.5','start','07:00','end','15:00','pause',30,'next_day',false,'note','Synthetic QA only','files','[]'::jsonb));
 rows:=rows||jsonb_build_array(rows->0||jsonb_build_object('id',gen_random_uuid(),'external_project','Solsiden byggetrinn 2'),rows->0||jsonb_build_object('id',gen_random_uuid(),'external_project','Storgata 12, Oslo'));
 r:=public.time_sheet_command(c,wk,e,0,gen_random_uuid(),'save',rows,false,'');perform pg_temp.hr_assert((r#>>'{sheet,entries,0,quantity}')::numeric=7.5,'cloud quantity saved');
 perform set_config('hr.qa.sheet',r#>>'{sheet,id}',true);
 perform pg_temp.hr_reject(format('select public.time_sheet_command(%L,%L,%L,0,%L,''save'',%L,false,'''')',c,wk,e,gen_random_uuid(),rows),'40001');
 r:=public.time_sheet_command(c,wk,e,1,gen_random_uuid(),'submit',rows,false,'');
 perform pg_temp.hr_assert(r#>>'{sheet,state}'='submitted','cloud submission');
 perform pg_temp.hr_reject(format('select public.time_sheet_command(%L,%L,%L,2,%L,''approve'',%L,false,'''')',c,wk,e,gen_random_uuid(),rows),'42501');
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.reader'),true);perform pg_temp.hr_reject(format('select public.time_sheet_get(%L,%L,%L)',c,wk,e),'42501');
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.old'),true);r:=public.time_sheet_command(c,wk,e,2,gen_random_uuid(),'approve',rows,false,'');perform pg_temp.hr_assert(r#>>'{sheet,state}'='approved','cloud leader approval');
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.admin'),true);r:=public.time_export_create(c,bid,wk,wk+6,1);
 perform pg_temp.hr_assert(r#>>'{batch,rows,0,employee_number}'='004','cloud export keeps text employee number');
 perform pg_temp.hr_assert(r#>>'{batch,rows,0,project_number}'='00458','cloud manual project number preserves zeroes');
 perform pg_temp.hr_assert(r#>>'{batch,rows,1,project_number}'='Solsiden byggetrinn 2','cloud manual project name exported');
 perform pg_temp.hr_assert(r#>>'{batch,rows,2,project_number}'='Storgata 12, Oslo','cloud manual address exported');
 perform pg_temp.hr_assert((public.time_sheet_get(c,wk,e)#>>'{sheet,export_locked}')::boolean,'cloud export locks week');
 perform pg_temp.hr_reject(format('select public.time_export_create(%L,%L,%L,%L,1)',c,gen_random_uuid(),wk,wk+6),'22023');
 r:=public.time_timer_command_v2(c,'start',tid,cat,null,'Syntetisk QA',0,'00078 – Tidtaking');perform pg_temp.hr_assert(r#>>'{timer,id}'=tid::text,'cloud timer started');perform pg_temp.hr_assert(r#>>'{timer,external_project}'='00078 – Tidtaking','cloud timer retains manual reference');
 perform pg_temp.hr_assert(public.time_timer_get(c)#>>'{timer,id}'=tid::text,'cloud fresh timer read');
 r:=public.time_timer_command(c,'cancel',tid);perform pg_temp.hr_assert(r->'timer'='null'::jsonb,'cloud timer canceled');
 perform set_config('hr.qa.batch',bid::text,true);
end$$;
reset role;
update time_private.exports set created_at=now()-interval '2 months'-interval '1 day' where id=current_setting('hr.qa.batch')::uuid;
select pg_temp.hr_assert(time_private.cleanup_completed()=1,'cloud two-month cleanup');
select pg_temp.hr_assert(not exists(select 1 from time_private.sheets where id=current_setting('hr.qa.sheet')::uuid),'cloud old sheet removed');
select pg_temp.hr_assert(exists(select 1 from time_private.closed_weeks where company_id=current_setting('hr.qa.company')::uuid),'closed-week marker retained');
select pg_temp.hr_assert(not has_function_privilege('anon','public.time_sheet_get(uuid,date,uuid)','execute'),'anon denied');
select pg_temp.hr_assert(not has_function_privilege('authenticated','public.time_cleanup_files()','execute'),'cleanup server-only');
select current_setting('hr.qa.count') as passed_checks;
rollback;
