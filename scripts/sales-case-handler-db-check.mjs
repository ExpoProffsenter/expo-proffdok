import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const {PGlite}=await import(process.env.HR_PGLITE_PATH||'@electric-sql/pglite');
const db=await PGlite.create();
let checks=0,inTransaction=false;
const eq=(a,b,label)=>{assert.deepEqual(a,b,label);checks++;};
const id=n=>`91000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const firm=id(1),otherFirm=id(2),actor=id(10),andreas=id(11),kenneth=id(12),outsider=id(13),sys=id(14);
const query=async(sql,args=[])=>(await db.query(sql,args)).rows;
const val=async(sql,args=[])=>Object.values((await query(sql,args))[0])[0];
const login=async(user=actor,company=firm,role='authenticated')=>{
 await db.exec('reset role');
 await query("select set_config('qa.user',$1,false),set_config('qa.company',$2,false)",[user||'',company||'']);
 await db.exec(`set role ${role}`);
};
const reject=async(fn,code,label)=>{if(inTransaction)await db.exec('savepoint rejected_path');await assert.rejects(fn,e=>e.code===code,label);if(inTransaction)await db.exec('rollback to savepoint rejected_path;release savepoint rejected_path');checks++;};
const candidates=()=>val('select public.sales_case_handler_candidates($1,false)',[firm]);
const setHandler=(user,revision=0,ref='QA-OLD')=>val('select public.sales_set_case_handler($1,$2,$3,$4)',[firm,ref,user,revision]);
const payload=ref=>val('select payload from public.sales_requests where company_id=$1 and request_ref=$2',[firm,ref]);
const resolve=async(offer=id(100))=>{await login(null,null,'service_role');return val('select public.sales_acceptance_case_handler($1)',[offer]);};
try{
 await db.exec(`
 create role anon;create role authenticated;create role service_role bypassrls;
 create schema auth;
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('qa.user',true),'')::uuid$$;
 create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,deleted_at timestamptz,banned_until timestamptz,raw_user_meta_data jsonb default '{}');
 create table public.profiles(id uuid primary key,email text,approved boolean default true,deactivated boolean default false,role text default 'member',system_role text);
 create table public.sales_company_memberships(company_id uuid,user_id uuid,workspace_role text default 'ansatt',primary key(company_id,user_id));
 create table public.user_module_access(user_id uuid,module_key text,primary key(user_id,module_key));
 create table public.sales_requests(id uuid primary key default gen_random_uuid(),company_id uuid not null,request_ref text not null,payload jsonb default '{}',updated_at timestamptz default now(),unique(company_id,request_ref));
 create table public.sales_offers(id uuid primary key,company_id uuid,request_ref text,status text default 'accepted',accepted_payload jsonb);
 create table public.sales_offer_versions(id uuid primary key,offer_id uuid,lines jsonb default '[]');
 create function public.current_active_company_scope_id() returns uuid language sql stable as $$select nullif(current_setting('qa.company',true),'')::uuid$$;
 create function public.current_user_has_module_access(k text) returns boolean language sql stable security definer as $$select exists(select 1 from public.profiles p where p.id=auth.uid() and p.approved and not coalesce(p.deactivated,false) and (p.system_role='systemadmin' or exists(select 1 from public.user_module_access a where a.user_id=p.id and a.module_key=k)))$$;
 create function public.sales_payload_is_store_offer(p jsonb) returns boolean language sql immutable as $$select coalesce(p->>'source','')='Butikktilbud / varesalg' or exists(select 1 from jsonb_array_elements(coalesce(p->'offerLines','[]')) l where l->>'__storeOfferMeta'='true')$$;
 create function public.company_has_store_offers_access(c uuid) returns boolean language sql stable as $$select coalesce(current_setting('qa.store',true),'yes')<>'no'$$;
 create function public.is_internal_work_profile_company(c uuid) returns boolean language sql stable as $$select coalesce(current_setting('qa.internal',true),'yes')<>'no'$$;
 create function public.company_has_pro_store_catalog_access(c uuid) returns boolean language sql stable as $$select coalesce(current_setting('qa.catalog',true),'no')='yes'$$;
 grant usage on schema public,auth to authenticated,anon,service_role;
 grant execute on function auth.uid() to authenticated;
 grant select,insert,update on public.sales_requests to authenticated;
 alter table public.sales_requests enable row level security;
 create policy sales_test_company on public.sales_requests to authenticated using(company_id=public.current_active_company_scope_id() and public.current_user_has_module_access('sales')) with check(company_id=public.current_active_company_scope_id() and public.current_user_has_module_access('sales'));
 `);
 for(const [user,email,name] of [[actor,'actor@example.invalid','QA Saksbehandler'],[andreas,'andreas@example.invalid','Samme navn'],[kenneth,'kenneth@example.invalid','Samme navn'],[outsider,'outsider@example.invalid','Ekstern'],[sys,'admin@example.invalid','QA Admin']]){
  await query('insert into auth.users(id,email,email_confirmed_at,raw_user_meta_data) values($1,$2,now(),$3)',[user,email,{full_name:name}]);
  await query('insert into public.profiles(id,email,system_role) values($1,$2,$3)',[user,'forged-profile@example.invalid',user===sys?'systemadmin':null]);
  await query('insert into public.user_module_access values($1,$2)',[user,'sales']);
 }
 for(const user of [actor,andreas,kenneth])await query('insert into public.sales_company_memberships(company_id,user_id) values($1,$2)',[firm,user]);
 await query('insert into public.sales_company_memberships(company_id,user_id) values($1,$2)',[otherFirm,outsider]);
 await query('insert into public.sales_requests(id,company_id,request_ref,payload) values($1,$2,$3,$4)',[id(50),firm,'QA-OLD',{responsible:'Samme navn',projectResponsible:'Samme navn',lastPublishedByUserId:kenneth,offerLines:[{id:'base',amount:'1000'}]}]);
 await query('insert into public.sales_offers(id,company_id,request_ref,accepted_payload) values($1,$2,$3,$4)',[id(100),firm,'QA-OLD',{version_id:id(101)}]);
 await query('insert into public.sales_offer_versions(id,offer_id) values($1,$2)',[id(101),id(100)]);
 const projection=await fs.readFile('supabase/migrations/20260915134500_fase42i_sales_list_projection.sql','utf8');
 await db.exec(projection.slice(0,projection.indexOf('\nupdate public.sales_requests')));
 await db.exec(await fs.readFile('supabase/migrations/20261029191431_sales_case_handler_identity.sql','utf8'));
 // Migration never infers or backfills a binding from names or publication data.
 eq(await val('select count(*)::int from sales_handler_private.request_handlers'),0,'no historical identity inference');
 eq((await resolve()).status,'missing_handler','old name and publisher never become a recipient');
 await login();
 let list=await candidates();
 eq(list.length,3,'ordinary Sales member sees eligible firm members');
 eq(list.filter(x=>x.displayName==='Samme navn').map(x=>x.userId).sort(),[andreas,kenneth].sort(),'same names remain separate UUID choices');
 eq(list.find(x=>x.userId===andreas).email,'andreas@example.invalid','candidate email comes from Auth, not profile');
 await reject(()=>val('select public.sales_case_handler_candidates($1,false)',[otherFirm]),'42501','no other company roster');
 await reject(()=>val('select * from sales_handler_private.request_handlers'),'42501','private assignment table is not exposed');
 await reject(()=>val('select public.sales_acceptance_case_handler($1)',[id(100)]),'42501','service resolver unavailable to app users');
 let bound=await setHandler(andreas);
 eq(bound.userId,andreas,'explicit old-case assignment by UUID');eq(bound.revision,1,'first explicit assignment revision');
 eq((await payload('QA-OLD')).responsibleUserId,andreas);eq((await payload('QA-OLD')).responsible,'Samme navn');
 eq((await payload('QA-OLD')).offerLines,[{id:'base',amount:'1000'}],'handler setter preserves offer content');
 let recipient=await resolve();eq(recipient.status,'ready');eq(recipient.userId,andreas);eq(recipient.email,'andreas@example.invalid');
 await login();
 await query('update public.sales_requests set payload=$1 where request_ref=$2',[{responsibleUserId:kenneth,responsibleRevision:0,responsible:'Forged',projectResponsible:'Forged',offerLines:[{id:'preserved',amount:'2000'}]},'QA-OLD']);
 eq((await payload('QA-OLD')).responsibleUserId,andreas,'stale/autosave payload cannot reassign canonical handler');
 eq((await payload('QA-OLD')).responsibleRevision,1,'stale autosave cannot alter revision');
 eq((await payload('QA-OLD')).responsible,'Samme navn','stale text cannot disagree with bound identity');
 eq(await val("select list_payload->>'responsible' from public.sales_requests where request_ref='QA-OLD'"),'Samme navn','existing list projection runs after canonical mirror');
 await reject(()=>setHandler(kenneth,0),'PT409','stale explicit revision is a conflict');
 bound=await setHandler(kenneth,1);eq(bound.revision,2);
 bound=await setHandler(andreas,2);eq(bound.revision,3);
 await reject(()=>setHandler(kenneth,1),'PT409','A to B to A cannot revive old revision');
 // Actual INSERT...ON CONFLICT path: an old tab's generated EXCLUDED.id must not leave a binding.
 await query(`insert into public.sales_requests(company_id,request_ref,payload) values($1,$2,$3) on conflict(company_id,request_ref) do update set payload=excluded.payload`,[firm,'QA-OLD',{responsibleUserId:kenneth,responsibleRevision:0,note:'Still saved'}]);
 eq((await payload('QA-OLD')).responsibleUserId,andreas,'bulk upsert retains latest handler');
 eq((await payload('QA-OLD')).note,'Still saved','bulk upsert still saves unrelated document');
 await db.exec('reset role');eq(await val('select count(*)::int from sales_handler_private.request_handlers'),1,'upsert creates no orphan binding');
 await login();
 await query('insert into public.sales_requests(company_id,request_ref,payload) values($1,$2,$3)',[firm,'QA-NEW',{responsibleUserId:kenneth,responsible:'Forged',responsibleRevision:900}]);
 eq((await payload('QA-NEW')).responsibleUserId,kenneth);eq((await payload('QA-NEW')).responsibleRevision,1);eq((await payload('QA-NEW')).responsible,'Samme navn','new selected UUID binds with canonical label');
 await reject(()=>query('insert into public.sales_requests(company_id,request_ref,payload) values($1,$2,$3)',[firm,'QA-BAD',{responsibleUserId:'not-a-uuid'}]),'22023');
 await reject(()=>query('insert into public.sales_requests(company_id,request_ref,payload) values($1,$2,$3)',[firm,'QA-CROSS',{responsibleUserId:outsider}]),'42501');
 await query('insert into public.sales_requests(company_id,request_ref,payload) values($1,$2,$3)',[firm,'QA-LEGACY',{responsible:'An arbitrary old name'}]);
 await query('update public.sales_requests set payload=payload||$1 where request_ref=$2',[{responsibleUserId:andreas},'QA-LEGACY']);
 eq((await payload('QA-LEGACY')).responsibleUserId,undefined,'old row cannot acquire binding from ordinary JSON update');
 eq((await payload('QA-LEGACY')).responsibleRevision,0);
 // Target may currently work in another firm; this firm's valid membership remains the criterion.
 await login(andreas,otherFirm);await login();eq((await candidates()).some(x=>x.userId===andreas),true);
 for(const [sql,args] of [
  ['update public.profiles set approved=false where id=$1',[andreas]],
  ['update public.profiles set deactivated=true where id=$1',[andreas]],
  ["update public.profiles set role='external' where id=$1",[andreas]],
  ["delete from public.user_module_access where user_id=$1 and module_key='sales'",[andreas]],
  ["update public.sales_company_memberships set workspace_role='external' where user_id=$1 and company_id=$2",[andreas,firm]],
  ['delete from public.sales_company_memberships where user_id=$1 and company_id=$2',[andreas,firm]],
  ['update auth.users set email_confirmed_at=null where id=$1',[andreas]],
  ['update auth.users set deleted_at=now() where id=$1',[andreas]],
  ["update auth.users set banned_until=now()+interval '1 day' where id=$1",[andreas]],
  ["update auth.users set email='invalid' where id=$1",[andreas]],
 ]){
  await db.exec('reset role;begin');inTransaction=true;await query(sql,args);
  await login();eq((await candidates()).some(x=>x.userId===andreas),false,'ineligible target is not offered');
  await reject(()=>setHandler(andreas,3),'42501','setter rechecks eligibility');
  recipient=await resolve();eq(recipient.status,'handler_ineligible','send-time lookup rechecks eligibility');eq(recipient.email,undefined,'fail closed returns no email');
  await db.exec('rollback;reset role');inTransaction=false;
 }
 await login(sys,firm);eq((await candidates()).length,3,'normal systemadmin representation actor remains available');
 eq((await candidates()).some(x=>x.userId===sys),false,'representation alone does not make systemadmin a target');
 await login(outsider,firm);await reject(candidates,'42501','ordinary actor without firm membership denied');
 await login(null,firm,'anon');await reject(candidates,'42501','anonymous candidate access denied');
 for(const change of ["update public.profiles set approved=false where id=$1","update public.profiles set deactivated=true where id=$1","update auth.users set banned_until=now()+interval '1 day' where id=$1","update auth.users set deleted_at=now() where id=$1"]){
  await db.exec('reset role;begin');inTransaction=true;await query(change,[actor]);await login();
  await reject(candidates,'42501','revoked actor cannot see roster');await reject(()=>setHandler(kenneth,3),'42501','revoked actor cannot assign');
  await db.exec('rollback;reset role');inTransaction=false;
 }
 await login();
 await db.exec("reset role;select set_config('qa.store','no',false)");
 await login();await reject(()=>val('select public.sales_case_handler_candidates($1,true)',[firm]),'42501','actor lacks store access');
 await db.exec('reset role');await query("insert into public.user_module_access values($1,'store_offers')",[actor]);
 await login();eq(await val('select public.sales_case_handler_candidates($1,true)',[firm]),[],'company store license denial suppresses all targets');
 await db.exec("reset role;select set_config('qa.store','yes',false),set_config('qa.internal','no',false)");
 await login();eq(await val('select public.sales_case_handler_candidates($1,true)',[firm]),[],'noninternal firm needs pro catalog access');
 await db.exec("reset role;select set_config('qa.catalog','yes',false)");
 await login();eq((await val('select public.sales_case_handler_candidates($1,true)',[firm])).length,3,'licensed pro company retains eligible Sales members');
 await db.exec('reset role;begin');
 await query('delete from auth.users where id=$1',[andreas]);
 eq((await resolve()).status,'missing_handler','hard account deletion removes routable binding without blocking account cleanup');
 await db.exec('rollback;reset role;begin');
 await query("update public.sales_offers set status='sent' where id=$1",[id(100)]);
 eq((await resolve()).status,'not_accepted','service route only after acceptance');
 await db.exec('rollback;reset role;begin');
 await query('update public.sales_offers set accepted_payload=$1 where id=$2',[{version_id:id(999)},id(100)]);
 eq((await resolve()).status,'missing_accepted_version','accepted version must belong to offer');
 await db.exec('rollback;reset role;begin');
 await query("update public.sales_offers set request_ref='QA-MISSING' where id=$1",[id(100)]);
 eq((await resolve()).status,'missing_request');
 await db.exec('rollback;reset role;begin;alter table public.sales_requests drop constraint sales_requests_company_id_request_ref_key');
 await query("insert into public.sales_requests(company_id,request_ref,payload) values($1,'QA-OLD','{}')",[firm]);
 eq((await resolve()).status,'ambiguous_request','duplicate request cannot select an arbitrary handler');
 await db.exec('rollback;reset role;begin');
 await query('update public.sales_offer_versions set lines=$1 where id=$2',[[{__storeOfferMeta:true}],id(101)]);
 await db.exec("select set_config('qa.store','no',false)");
 eq((await resolve()).status,'handler_ineligible','accepted store version enforces license even if mutable request type says wetroom');
 await db.exec('rollback;reset role');
 eq((await resolve(id(999))).status,'missing_offer');
 await db.exec('reset role');
 const functionAcls=await query("select proname,has_function_privilege('anon',oid,'EXECUTE') anon,has_function_privilege('authenticated',oid,'EXECUTE') authenticated,has_function_privilege('service_role',oid,'EXECUTE') service from pg_proc where proname in ('sales_case_handler_candidates','sales_set_case_handler','sales_acceptance_case_handler') order by proname");
 eq(functionAcls.map(x=>x.anon),[false,false,false],'no anonymous RPC grant');
 eq(functionAcls.find(x=>x.proname==='sales_acceptance_case_handler').authenticated,false);
 eq(functionAcls.find(x=>x.proname==='sales_acceptance_case_handler').service,true);
 eq(await val("select relrowsecurity from pg_class where oid='sales_handler_private.request_handlers'::regclass"),true,'private canonical table also has RLS');
 eq(await val("select has_schema_privilege('authenticated','sales_handler_private','USAGE')"),false);
 eq(await val("select has_schema_privilege('anon','sales_handler_private','USAGE')"),false);
 eq(await val("select bool_or(has_function_privilege('authenticated',oid,'EXECUTE')) from pg_proc where pronamespace='sales_handler_private'::regnamespace"),false,'all private helper execute grants closed');
 console.log(`PASS Sales case-handler SQL: ${checks} assertions; actual migration, canonical UUID selection, stale upsert and revision protection, access revocation, service-only recipient; disposable PGlite only.`);
}finally{await db.close();}
