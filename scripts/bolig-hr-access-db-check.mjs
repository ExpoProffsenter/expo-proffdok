import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const {PGlite}=await import(process.env.HR_PGLITE_PATH||'@electric-sql/pglite');
const db=await PGlite.create();
let checks=0;
const eq=(a,b,m)=>{assert.deepEqual(a,b,m);checks++;};
const id=n=>'64000000-0000-4000-8000-'+String(n).padStart(12,'0');
const firm=id(1),other=id(2),admin=id(3),reader=id(4),manager=id(5),ordinary=id(6),outsider=id(7),system=id(8);
const actor=async(u=admin,c=firm)=>db.exec(`reset role;select set_config('request.jwt.claim.sub','${u}',false);select set_config('hr.fixture.company','${c}',false);set role authenticated;`);
const sql=async(query,args=[]) => (await db.query(query,args)).rows[0]?.v;
const denied=async(fn)=>{let error;try{await fn();}catch(e){error=e;}eq(error?.code,'42501',error?.message||'expected denial');};
const access=async(u)=>{await db.exec('reset role');return sql('select hr_private.has_module_access($1,$2) v',[firm,u]);};
const personal=()=>sql('select public.get_my_personal_context() v');
const context=()=>sql('select public.get_hr_context() v');
const get=u=>sql('select public.people_modules_user_get($1,$2) v',[firm,u]);
try{
 await db.exec(await fs.readFile('scripts/fixtures/hr-restore-platform.sql','utf8'));
 await db.exec(`alter table public.sales_company_scopes add column display_name text default 'QA';
 alter table public.company_module_access add column granted_by uuid,add column updated_at timestamptz;
 create table public.user_module_access(user_id uuid,module_key text,primary key(user_id,module_key));
 create table public.projects(id uuid primary key,company_scope_id uuid,user_id uuid,title text,data jsonb default '{}',locked boolean default false);
 create schema progress_private;create table progress_private.assignments(project_id uuid,user_id uuid);
 create function public.current_user_has_module_access(text) returns boolean language sql security definer as $$select exists(select 1 from public.user_module_access where user_id=auth.uid() and module_key=$1)$$;
 create function public.project_row_access_allowed(uuid,uuid) returns boolean language sql as $$select false$$;
 grant usage on schema auth to authenticated;`);
 for(const [u,c,r] of [[admin,firm,'firmaadmin'],[reader,firm,'ansatt'],[manager,firm,'ansatt'],[ordinary,firm,'ansatt'],[outsider,other,'ansatt'],[system,other,'firmaadmin']]){
  await db.query('insert into auth.users values($1)',[u]);
  await db.query("insert into public.profiles values($1,$2,true,false,'member',$3)",[u,'qa@example.invalid',u===system?'systemadmin':null]);
  await db.query('insert into public.sales_company_scopes(id) values($1) on conflict do nothing',[c]);
  await db.query('insert into public.sales_company_memberships values($1,$2,$3)',[c,u,r]);
  await db.query("insert into public.user_module_access values($1,'projects')",[u]);
 }
 await db.exec(await fs.readFile('supabase/migrations/20261020201453_boligprosjekter_foundation.sql','utf8'));
 await db.exec(await fs.readFile('supabase/migrations/20261009182551_hr_access_foundation.sql','utf8'));
 await db.exec(await fs.readFile('supabase/migrations/20261009184122_hr_access_command_scope_fix.sql','utf8'));
 await db.exec(await fs.readFile('supabase/migrations/20261009203431_people_module_entitlements.sql','utf8'));
 await db.exec(await fs.readFile('supabase/migrations/20261009185827_hr_navigation_context.sql','utf8'));
 const progress=await fs.readFile('supabase/migrations/20261016142124_project_progress_workspace.sql','utf8');
 await db.exec(progress.slice(progress.indexOf('create or replace function public.get_my_personal_context()')));
 await db.exec('revoke all on function public.get_my_personal_context() from public,anon;grant execute on function public.get_my_personal_context() to authenticated;');
 // Install the actual self-attendance metadata addition on a minimal platform.
 await db.exec('create table bolig_private.attendance_people(root_id uuid,user_id uuid,enabled boolean);create table bolig_private.attendance_states(root_id uuid,enabled boolean);');
 // Release rehearsal can use captured actual Production definitions instead
 // of assuming that the migration fixtures equal the installed shared code.
 const releaseNames=['hr_private.can_read','hr_private.has_module_access','public.get_my_personal_context','public.people_modules_company_get','public.people_modules_user_get'];
 let releaseDefinitions=[];
 if(process.env.BOLIG_RELEASE_BASELINE){
  const baseline=JSON.parse(await fs.readFile(process.env.BOLIG_RELEASE_BASELINE,'utf8'));
  assert.equal(baseline.production_project,'dqffxflaoyarbxyiyhop','Expected Production source snapshot');
  releaseDefinitions=baseline.production_shared.filter(f=>releaseNames.includes(f.schema+'.'+f.proname));
  assert.equal(releaseDefinitions.length,5,'Exactly the reviewed shared functions');
  for(const f of releaseDefinitions)await db.exec(f.definition);
 }
 const attendance=await fs.readFile('supabase/migrations/20261024100223_bolig_named_self_attendance.sql','utf8');
 await db.exec(attendance.slice(attendance.indexOf('do $patch$')));
 await db.exec("insert into bolig_private.firms(company_id,enabled) values('"+firm+"',true);insert into bolig_private.member_access(company_id,user_id,access_role) values('"+firm+"','"+reader+"','reader'),('"+firm+"','"+manager+"','manager');");
 const before=await sql("select pg_get_functiondef('public.get_my_personal_context()'::regprocedure) v");
 const grants=await sql("select jsonb_build_object('company',(select coalesce(jsonb_agg(to_jsonb(a)),'[]') from public.company_module_access a),'user',(select coalesce(jsonb_agg(to_jsonb(a)),'[]') from hr_private.module_access a)) v");
 const hrReadBefore=await sql("select pg_get_functiondef('hr_private.can_read(uuid,hr_private.employees,uuid)'::regprocedure) v");
 await db.exec(await fs.readFile('supabase/migrations/20261024171757_bolig_hr_included_access.sql','utf8'));
 eq(await sql("select jsonb_build_object('company',(select coalesce(jsonb_agg(to_jsonb(a)),'[]') from public.company_module_access a),'user',(select coalesce(jsonb_agg(to_jsonb(a)),'[]') from hr_private.module_access a)) v"),grants,'no copied/overwritten grants');
 const after=await sql("select pg_get_functiondef('public.get_my_personal_context()'::regprocedure) v");
 eq(after.replace(' or (hr_private.active_member(c,u) and bolig_private.hr_included(c,u))',''),before,'only HR metadata predicate changes; attendance/progress intact');
 eq((await sql("select pg_get_functiondef('hr_private.can_read(uuid,hr_private.employees,uuid)'::regprocedure) v")).replace('coalesce(e.leader_id=u,false)','e.leader_id=u'),hrReadBefore,'only NULL leader comparison is hardened');
 eq(await access(admin),true);eq(await access(reader),true);eq(await access(manager),true);
 eq(await access(ordinary),false);eq(await access(outsider),false);eq(await access(system),false,'system role has no cross-company HR bypass');
 await actor(reader);eq((await context()).available,false,'firm setup still required');
 // Entitlement does not activate or fabricate firm setup/employee registration.
 eq(await sql('select count(*)::int v from public.hr_employee_list($1)',[firm]).catch(e=>e.code),'42501');
 await actor(admin);eq((await context()).available,true);
 eq((await get(reader)).bolig_hr_included,true);eq((await get(reader)).hr,false);
 await sql("select public.hr_foundation_configure($1,0,true,'QA employee administration','QA explicit company configuration',(now() at time zone 'Europe/Oslo')::date+30) v",[firm]);
 eq(await sql('select count(*)::int v from jsonb_array_elements((public.hr_employee_list($1))->\'employees\')',[firm]),0,'no employee created by license');
 const create=async u=>sql("select public.hr_employee_command($1,'create',$2) v",[firm,{user_id:u}]);
 const own=(await create(reader)).employee,another=(await create(ordinary)).employee;
 await actor(reader);eq((await context()).available,true);
 eq((await personal()).company_hr,true);eq((await personal()).hr_management,false);
 eq((await sql('select public.hr_employee_get($1,$2) v',[firm,own.id])).employee.id,own.id);
 await denied(()=>sql('select public.hr_employee_get($1,$2) v',[firm,another.id]));
 await db.exec('reset role');eq(await sql('select hr_private.can_read($1,e,$2) v from hr_private.employees e where id=$3',[firm,reader,another.id]),false,'missing leader explicitly denies unrelated reader');
 await actor(reader);
 await denied(()=>sql("select public.hr_employee_command($1,'create',$2) v",[firm,{user_id:manager}]));
 await actor(manager);await denied(()=>sql('select public.hr_employee_get($1,$2) v',[firm,own.id]));
 // Explicit leader assignment still owns HR readership; Bolig manager does not.
 await actor(admin);await sql("select public.hr_employee_command($1,'leader',$2) v",[firm,{id:own.id,revision:own.revision,leader_id:manager}]);
 await actor(manager);eq((await sql('select public.hr_employee_get($1,$2) v',[firm,own.id])).employee.id,own.id);eq((await personal()).hr_management,true);
 await db.exec(`reset role;update bolig_private.member_access set access_role='none' where user_id='${reader}';`);
 eq(await access(reader),false);await actor(reader);await denied(context);
 await db.exec(`reset role;insert into public.company_module_access(company_id,module_key,enabled) values('${firm}','hr',true);insert into hr_private.module_access(company_id,user_id,enabled) values('${firm}','${reader}',true);`);
 eq(await access(reader),true,'independent grant survives loss of Bolig role');
 await db.exec(`update bolig_private.firms set enabled=false where company_id='${firm}';`);
 eq(await access(manager),false);eq(await access(reader),true);eq(await access(admin),true,'independent company HR preserved');
 await db.exec(`update bolig_private.firms set enabled=true where company_id='${firm}';delete from public.user_module_access where user_id='${manager}';`);
 eq(await access(manager),false,'projects entitlement required');
 await db.exec(`insert into public.user_module_access values('${manager}','projects');update public.profiles set deactivated=true where id='${manager}';`);
 eq(await access(manager),false);
 await db.exec(`update public.profiles set deactivated=false,approved=false where id='${manager}';`);eq(await access(manager),false);
 await db.exec(`update public.profiles set approved=true where id='${manager}';delete from public.sales_company_memberships where company_id='${firm}' and user_id='${manager}';`);eq(await access(manager),false);
 await db.exec(`insert into public.sales_company_memberships values('${firm}','${manager}','ansatt');insert into hr_private.closed_employments values('${id(90)}','${firm}','${manager}',now(),1);`);eq(await access(manager),false,'closed employment remains denied');
 await actor(reader,other);await denied(context);
 await actor(admin);const expected=await get(reader);
 const changed=await sql('select public.people_modules_user_set($1,$2,$3,false,\'reader\',true) v',[firm,reader,expected]);
 eq(changed.hr,true,'original CAS setter handles bundle metadata');
 await db.exec('reset role;set role anon');await denied(context);
 await denied(()=>sql('select bolig_private.hr_included($1,$2) v',[firm,reader]));
 await db.exec('reset role');eq(await sql("select has_function_privilege('authenticated','bolig_private.hr_included(uuid,uuid)','execute') v"),false);
 if(releaseDefinitions.length){
  await db.exec('reset role');
  // Back out only the five shared entry points; retain additive Bolig data.
  for(const f of releaseDefinitions.filter(f=>f.proname!=='can_read'))await db.exec(f.definition);
  for(const f of releaseDefinitions){
   const restored=await sql('select pg_get_functiondef(p.oid) v from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname=$1 and p.proname=$2',[f.schema,f.proname]);
   const expected=f.proname==='can_read'?f.definition.replace('e.leader_id=u','coalesce(e.leader_id=u,false)'):f.definition;
   eq(restored,expected,'Safe rollback preserves NULL-leader denial and otherwise restores Production: '+f.schema+'.'+f.proname);
  }
  eq(await sql("select to_regclass('bolig_private.firms') is not null v"),true,'Rollback retains additive tables and their data');
  eq(await access(reader),true,'Independent HR grant still works after rollback');
  await actor(reader);
  eq((await personal()).company_hr,true,'Original Min side metadata still works after rollback');
 }
 console.log(`Bolig HR access: ${checks} assertions PASS; real HR actor/setup/employee gates and CAS, derived license, independent grants, tenant/role/revocation/closed-employment isolation. Platform/Auth fixtures synthetic.`);
}finally{await db.close();}
