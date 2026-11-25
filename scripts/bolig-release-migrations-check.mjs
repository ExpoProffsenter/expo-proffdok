// Local-only release rehearsal. No network client or production writes.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const {PGlite}=await import(process.env.HR_PGLITE_PATH||'@electric-sql/pglite');
const baseline=JSON.parse(await fs.readFile('docs/qa/evidence/bolig-release-baseline-20261025.json','utf8'));
const catalog=JSON.parse(await fs.readFile('docs/qa/evidence/bolig-release-catalog-20261025.json','utf8'));
const files=execFileSync('git',['diff',process.argv[2]||'origin/main','--name-only','--','supabase/migrations'],{encoding:'utf8'}).trim().split('\n').sort();
assert.equal(files.length,72,'Reviewed migration count; re-review changes');
const names=['hr_private.can_read','hr_private.has_module_access','public.get_my_personal_context','public.people_modules_company_get','public.people_modules_user_get'];
const originals=baseline.production_shared.filter(f=>names.includes(f.schema+'.'+f.proname));
assert.equal(originals.length,5);
const db=await PGlite.create();let checks=0;
const eq=(a,b,m)=>{assert.deepEqual(a,b,m);checks++;};
const one=async(sql,args=[])=>(await db.query(sql,args)).rows[0]?.v;
try{
 await db.exec(await fs.readFile('scripts/fixtures/hr-restore-platform.sql','utf8'));
 await db.exec(`alter table public.sales_company_scopes add column display_name text;
 alter table public.profiles add column full_name text;
 alter table public.company_module_access add column granted_by uuid,add column updated_at timestamptz;
 create table public.user_module_access(user_id uuid,module_key text,primary key(user_id,module_key));
 create table public.projects(id uuid primary key,company_scope_id uuid,user_id uuid,title text,data jsonb default '{}',locked boolean default false,updated_at timestamptz default now());
 create schema progress_private;create table progress_private.assignments(project_id uuid,user_id uuid);
 create function public.current_user_has_module_access(text) returns boolean language sql as $$select false$$;
 create function public.project_row_access_allowed(uuid,uuid) returns boolean language sql as $$select false$$;
 alter table storage.buckets add column allowed_mime_types text[];
 alter table storage.objects add column metadata jsonb;
 alter table storage.objects enable row level security;
 grant usage on schema auth,storage to authenticated,anon;
 grant all on storage.objects to authenticated,anon;
 create policy qa_existing_objects on storage.objects for all to authenticated,anon using(true) with check(true);
 create function kshms_private.identity_snapshot(uuid) returns jsonb language sql as $$select jsonb_build_object('name','Synthetic release actor','user_id',$1)$$;
 create table public.kshms_checklist_templates(id uuid primary key,company_id uuid,archived boolean default false);
 create table public.kshms_checklist_versions(id uuid primary key,template_id uuid,company_id uuid,number int,content jsonb,content_hash text);`);
 for(const file of ['20261009182551_hr_access_foundation.sql','20261009184122_hr_access_command_scope_fix.sql','20261009203431_people_module_entitlements.sql','20261009185827_hr_navigation_context.sql'])await db.exec(await fs.readFile('supabase/migrations/'+file,'utf8'));
 const helpers=await fs.readFile('supabase/migrations/20261017133759_flexible_checklist_fields_hot_work.sql','utf8');
 await db.exec(helpers.slice(0,helpers.indexOf('\n\n\n--',helpers.indexOf('create or replace function kshms_private.checklist_content'))));
 for(const f of originals){
  await db.exec(f.definition);
  assert(['{postgres=X/postgres}','{postgres=X/postgres,authenticated=X/postgres}'].includes(f.acl),'Only captured owner/authenticated ACL');
  const signature=await one("select format('%I.%I(%s)',n.nspname,p.proname,oidvectortypes(p.proargtypes)) v from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname=$1 and p.proname=$2",[f.schema,f.proname]);
  await db.exec('revoke all on function '+signature+' from public,anon,authenticated,service_role');
  if(f.acl.includes('authenticated=X/'))await db.exec('grant execute on function '+signature+' to authenticated');
 }

 const company='73000000-0000-4000-8000-000000000001',user='73000000-0000-4000-8000-000000000002',project='73000000-0000-4000-8000-000000000003';
 await db.query('insert into auth.users values($1)',[user]);
 await db.query("insert into public.profiles(id,email,approved,deactivated,role,full_name) values($1,'release@example.invalid',true,false,'member','Synthetic release actor')",[user]);
 await db.query("insert into public.sales_company_scopes(id,display_name) values($1,'Synthetic existing company')",[company]);
 await db.query("insert into public.sales_company_memberships values($1,$2,'firmaadmin')",[company,user]);
 await db.query("insert into public.projects(id,company_scope_id,user_id,title,data) values($1,$2,$3,'Synthetic existing ordinary project','{\"keep\":true}')",[project,company,user]);
 for(const b of catalog.production.storage_buckets){
  await db.query('insert into storage.buckets values($1,$1,$2,$3,$4) on conflict(id) do update set name=excluded.name,public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types',[b.id,b.public,b.file_size_limit,b.allowed_mime_types]);
  await db.query("insert into storage.objects values($1,'synthetic-existing-object','{\"keep\":true}')",[b.id]);
 }
 const preserved=['profiles','sales_company_scopes','sales_company_memberships','company_module_access','user_module_access','projects'];
 const snapshot=async()=>{const s={};for(const t of preserved)s[t]=await one('select coalesce(jsonb_agg(to_jsonb(x)),\'[]\') v from (select * from public.'+t+' order by 1)x');s.buckets=await one("select jsonb_agg(to_jsonb(x)) v from (select * from storage.buckets where id not like 'bolig-%' order by id)x");return s;};
 const before=await snapshot();
 const oldPolicies=await one("select jsonb_agg(to_jsonb(p)) v from pg_policies p where schemaname='storage' and tablename='objects'");
 const untouchedNames=['hr_private.active_member','public.current_active_company_scope_id','public.current_user_has_module_access','public.project_row_access_allowed'];
 const functions=async()=>Object.fromEntries(await Promise.all(untouchedNames.map(async n=>[n,await one('select pg_get_functiondef(p.oid) v from pg_proc p join pg_namespace s on s.oid=p.pronamespace where s.nspname=$1 and p.proname=$2',n.split('.'))])));
 const untouched=await functions();
 for(const file of files){
  await db.exec('begin');
  try{await db.exec(await fs.readFile(file,'utf8'));await db.exec('commit');checks++;}
  catch(e){await db.exec('rollback');throw new Error(file+': '+e.message,{cause:e});}
 }
 eq(await snapshot(),before,'All existing public rows and bucket metadata survive installation');
 eq(await functions(),untouched,'Other shared functions retain their exact definitions');
 const policies=await one("select jsonb_agg(to_jsonb(p)) v from pg_policies p where schemaname='storage' and tablename='objects'");
 for(const p of oldPolicies)eq(policies.find(x=>x.policyname===p.policyname),p,'Existing Storage policy retained');
 await db.exec('set role authenticated');
 eq(await one("select count(*)::int v from storage.objects where bucket_id not like 'bolig-%'"),catalog.production.storage_buckets.length,'Existing objects remain readable under their original permissive fixture policy');
 await db.exec('reset role');
 eq(await one('select count(*)::int v from bolig_private.firms'),0,'No production license or demo project is activated by installation');
 for(const t of ['progress_mail_settings','partner_mail_settings','resident_link_mail_settings'])eq(await one('select bool_and(not enabled) v from bolig_private.'+t),true,'Transport starts paused: '+t);
 eq(await one("select count(*)::int v from storage.buckets where id like 'bolig-%' and public"),0,'All new Bolig buckets are private');
 const afterPersonal=await one("select pg_get_functiondef('public.get_my_personal_context()'::regprocedure) v");
 eq(afterPersonal.includes('bolig_private.attendance_people'),true,'Own attendance entry is the reviewed Min side extension');
 eq(afterPersonal.includes('bolig_private.hr_included'),true,'HR metadata extension installed');
 for(const f of originals){
  const expected=baseline.sandbox_shared.find(x=>x.schema===f.schema&&x.proname===f.proname);
  eq(await one('select pg_get_functiondef(p.oid) v from pg_proc p join pg_namespace s on s.oid=p.pronamespace where s.nspname=$1 and p.proname=$2',[f.schema,f.proname]),expected.definition,'Candidate shared function matches actual Sandbox: '+f.proname);
  eq(await one('select p.proacl::text v from pg_proc p join pg_namespace s on s.oid=p.pronamespace where s.nspname=$1 and p.proname=$2',[f.schema,f.proname]),f.acl,'Shared ACL preserved through installation: '+f.proname);
 }
 // Restore only shared entry points. Additive data/schema remain for recovery.
 await db.exec('begin');
 let wrongTarget;
 try{await db.exec(await fs.readFile('scripts/bolig-release-shared-rollback.sql','utf8'));}catch(e){wrongTarget=e;}
 await db.exec('rollback');
 eq(wrongTarget?.code,'PT409','Recovery file refuses an unspecified deployment target');
 for(const change of [
  'grant execute on function hr_private.can_read(uuid,hr_private.employees,uuid) to authenticated',
  afterPersonal.replace("'personal_page'","'unreviewed_personal_page'"),
 ]){
  await db.exec('begin');
  await db.exec("select set_config('expo.bolig_release_target','dqffxflaoyarbxyiyhop',true)");
  await db.exec(change);
  let drift;
  try{await db.exec(await fs.readFile('scripts/bolig-release-shared-rollback.sql','utf8'));}catch(e){drift=e;}
  await db.exec('rollback');
  eq(drift?.code,'PT409','Recovery refuses unreviewed code or access changes');
 }

 await db.exec('begin');
 await db.exec("select set_config('expo.bolig_release_target','dqffxflaoyarbxyiyhop',true)");
 await db.exec(await fs.readFile('scripts/bolig-release-shared-rollback.sql','utf8'));
 await db.exec('commit');
 for(const f of originals)eq(await one('select pg_get_functiondef(p.oid) v from pg_proc p join pg_namespace s on s.oid=p.pronamespace where s.nspname=$1 and p.proname=$2',[f.schema,f.proname]),f.proname==='can_read'?f.definition.replace('e.leader_id=u','coalesce(e.leader_id=u,false)'):f.definition,'Safe Production rollback retains NULL-leader denial: '+f.proname);
 for(const f of originals)eq(await one('select p.proacl::text v from pg_proc p join pg_namespace s on s.oid=p.pronamespace where s.nspname=$1 and p.proname=$2',[f.schema,f.proname]),f.acl,'Shared ACL preserved through recovery: '+f.proname);
 eq(await snapshot(),before,'Rollback retains existing rows and files metadata');
 eq(await one("select to_regclass('bolig_private.roots') is not null v"),true,'Rollback does not destroy new module data');
 console.log('PASS Bolig release migration rehearsal: '+checks+' assertions; all 72 migrations in filename order, actual Production shared definitions, preserved public rows/Storage, paused defaults and shared-function rollback. Auth/Storage/Vault/Cron/Net platform adapters are synthetic; no live restore or external transport.');
}finally{await db.close();}
