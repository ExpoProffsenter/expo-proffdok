import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const {PGlite}=await import(process.env.HR_PGLITE_PATH||'/tmp/hr-h4-runtime/node_modules/@electric-sql/pglite/dist/index.js');
const db=await PGlite.create();let checks=0;
const id=n=>`70000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const [company,foreign,admin,self,leader,next,reader,outsider,system]=[1,2,3,4,5,6,7,8,9].map(id);
const q=v=>"'"+String(v).replaceAll("'","''")+"'";
const eq=(a,b,label)=>{assert.deepEqual(a,b,label);checks++;};
async function sql(s){return(await db.query(s)).rows;}
async function rpc(name,args=[]){return(await sql(`select public.${name}(${args.map(v=>v===null?'null':q(typeof v==='object'?JSON.stringify(v):v)).join(',')}) as v`))[0].v;}
async function actor(u){await db.exec(`reset role;select set_config('request.jwt.claim.sub',${q(u)},false);set role authenticated;`);}
async function reject(fn,code){await assert.rejects(fn,e=>e.code===code);checks++;}
try{
 await db.exec(await fs.readFile('scripts/fixtures/hr-restore-platform.sql','utf8'));
 await db.exec(`alter table auth.users add aud text,add role text,add email text,add created_at timestamptz,add updated_at timestamptz,add raw_app_meta_data jsonb,add raw_user_meta_data jsonb;
 alter table public.sales_company_scopes add normalized_name text,add display_name text;
 alter table public.profiles add company_name text,add company_role text,add is_admin boolean;
 alter table public.sales_company_memberships add is_primary boolean;
 create table public.user_active_company_scope(user_id uuid primary key,company_id uuid);
 create or replace function public.current_active_company_scope_id() returns uuid language sql as $$select company_id from public.user_active_company_scope where user_id=auth.uid()$$;
 grant usage on schema auth to authenticated;grant execute on function auth.uid() to authenticated;`);
 const migrations=['20261009182551_hr_access_foundation.sql','20261009193953_hr_content_purge_foundation.sql',
 '20261009203431_people_module_entitlements.sql','20261009203950_people_module_access_closure.sql',
 '20261010004928_hr_conversation_templates.sql','20261010105649_hr_sick_leave_template_kind.sql',
 '20261009211209_hr_restore_reconcile_orphans.sql','20261011134804_hr_personal_conversations.sql','20261011140130_hr_deletion_admin_alerts.sql'];
 for(const f of migrations)await db.exec(await fs.readFile('supabase/migrations/'+f,'utf8'));
 await db.exec(`insert into public.sales_company_scopes values(${q(company)},'synthetic','Synthetic'),(${q(foreign)},'other','Other');
 insert into public.company_module_access(company_id,module_key,enabled) values(${q(company)},'hr',true),(${q(foreign)},'hr',true);`);
 for(const u of [admin,self,leader,next,reader,outsider,system])await db.exec(`
 insert into auth.users(id) values(${q(u)});
 insert into public.profiles(id,email,approved,deactivated,role,system_role) values(${q(u)},'synthetic@example.invalid',true,false,'member',${u===system?"'systemadmin'":'null'});
 insert into public.sales_company_memberships(company_id,user_id,workspace_role) values(${q(company)},${q(u)},${q(u===admin?'firmaadmin':'ansatt')});
 insert into public.user_active_company_scope values(${q(u)},${q(company)});
 insert into hr_private.module_access(company_id,user_id,enabled) values(${q(company)},${q(u)},true);`);
 await actor(admin);await rpc('hr_foundation_configure',[company,0,true,'Synthetic QA purpose','Synthetic QA basis','2026-11-11']);
 const employee=(await rpc('hr_employee_command',[company,'create',{user_id:self,leader_id:leader}])).employee;
 const template=id(20),question=id(21),meeting=id(22),conversation=id(30);
 const tpl={title:'Årlig samtale',kind:'annual',intro:'Syntetisk test',questions:[
 {id:question,topic:'Trivsel',prompt:'Hvordan fungerer arbeidet?',phase:'preparation',required:true},
 {id:meeting,topic:'Oppsummering',prompt:'Hva er vi enige om?',phase:'meeting',required:true}]};
 await rpc('hr_template_save',[company,template,0,tpl,false]);
 await actor(leader);
 await reject(()=>rpc('hr_conversation_start',[company,employee.id,1,conversation,template,1,'2026-11-01']),'42501');
 await db.exec('reset role;update hr_private.runtime_state set content_enabled=true,restore_quarantined=false;');
 await actor(admin);await reject(()=>rpc('hr_conversation_start',[company,employee.id,1,conversation,template,1,'2026-11-01']),'42501');
 await actor(leader);
 let state=await rpc('hr_conversation_start',[company,employee.id,1,conversation,template,1,'2026-11-01']);
 eq(state.conversation.revision,1,'server case created');
 eq((await rpc('hr_conversation_start',[company,employee.id,1,conversation,template,1,'2026-11-01'])).conversation.revision,1,'same ID retry does not create duplicate');
 let revision=1,employeeRevision=1;
 const command=async(action,data={})=>{
  state=await rpc('hr_conversation_command',[company,employee.id,employeeRevision,conversation,revision,action,data]);
  revision=state.current_revision;return state;
 };
 const get=(version=null)=>rpc('hr_conversation_get',[company,employee.id,conversation,version]);
 await reject(()=>command('preparation',{answers:{[question]:'Cannot impersonate'}}),'42501');
 await actor(self);await reject(()=>command('share'),'22023');
 await command('preparation',{answers:{[question]:'Private preparation'}});
 eq(state.conversation.preparation[question],'Private preparation');
 for(const u of [leader,admin]){await actor(u);eq((await get()).conversation.preparation,{},'unshared preparation redacted');}
 for(const u of [reader,outsider,system]){await actor(u);await reject(()=>get(),'42501');}
 await actor(admin);await rpc('hr_employee_command',[company,'reader',{id:employee.id,revision:1,reader_id:reader,reason:'Synthetic explicit reader'}]);employeeRevision=2;
 await actor(reader);eq((await get()).conversation.preparation,{});await reject(()=>command('comment',{text:'Not a participant'}),'42501');
 await actor(self);await reject(()=>command('preparation',{answers:{unrelated:'invalid'}}),'22023');
 await command('share');eq(state.conversation.stage,'meeting');
 await actor(leader);eq((await get()).conversation.preparation[question],'Private preparation','shared preparation retained');
 await command('meeting',{answers:{[meeting]:'Shared summary'},actions:[],next_on:''});
 eq(state.conversation.preparation[question],'Private preparation','manager cannot erase original answers');
 const saved=revision;
 await reject(()=>rpc('hr_conversation_command',[company,employee.id,employeeRevision,conversation,saved-1,'meeting',{answers:{[meeting]:'stale'},actions:[],next_on:''}]),'40001');
 eq((await get()).conversation.meeting[meeting],'Shared summary');
 await reject(()=>command('meeting',{answers:{[meeting]:'summary'},actions:[{id:id(40),task:'Do it',owner_id:outsider,due_on:'2026-11-20',done:false}],next_on:'2026-11-21'}),'22023');
 await command('meeting',{answers:{[meeting]:'Shared summary'},actions:[{id:id(40),task:'Follow up',owner_id:self,due_on:'2026-11-20',done:false}],next_on:'2026-11-21'});
 await command('ready');await command('confirm');eq(state.conversation.stage,'awaiting','one confirmation is insufficient');
 await actor(self);await command('comment',{text:'My disagreement remains part of the record'});
 eq(state.conversation.confirmations.leader,null,'comment changes require renewed confirmation');
 await command('confirm');eq(state.conversation.stage,'awaiting');
 await actor(leader);await command('confirm');eq(state.conversation.stage,'completed');
 const finalVersion=revision;
 eq((await command('confirm')).current_revision,finalVersion,'confirmation retry idempotent');
 await actor(admin);const changed=await rpc('hr_employee_command',[company,'leader',{id:employee.id,revision:employeeRevision,leader_id:next,clear_old_leader_reader:false}]);employeeRevision=changed.employee.revision;
 await actor(leader);await reject(()=>get(),'42501');
 await actor(next);state=await get();eq(state.conversation.stage,'awaiting','new leader must personally confirm');eq(state.conversation.confirmations.leader,null);
 await command('confirm');eq(state.conversation.stage,'completed');
 await command('revise');eq(state.conversation.confirmations.employee,null);eq(state.conversation.stage,'meeting');
 const history=await get(finalVersion);eq(history.conversation.meeting[meeting],'Shared summary');eq(history.historical,true);
 await actor(reader);eq((await get()).conversation.preparation[question],'Private preparation','explicit reader can read shared history');
 await reject(()=>command('meeting',{answers:{[meeting]:'bad'},actions:[],next_on:''}),'42501');
 await actor(admin);await rpc('hr_employee_command',[company,'revoke_reader',{id:employee.id,revision:employeeRevision,reader_id:reader}]);employeeRevision++;
 await actor(reader);await reject(()=>get(),'42501');
 await actor(self);await reject(()=>rpc('hr_conversation_get',[foreign,employee.id,conversation]),'42501');
 await db.exec(`reset role;update hr_private.runtime_state set restore_quarantined=true;`);
 await actor(self);await reject(()=>get(),'42501');
 await db.exec('reset role;update hr_private.runtime_state set restore_quarantined=false;');
 const backup=await db.dumpDataDir();
 await actor(admin);const receipt=await rpc('hr_employee_command',[company,'end',{id:employee.id,revision:employeeRevision,confirm:'END_AND_DELETE'}]);eq(receipt.deleted,true);
 await db.exec('reset role;');
 eq((await sql('select count(*)::int as n from hr_private.conversations'))[0].n,0,'purge removes conversation pointer');
 eq((await sql('select count(*)::int as n from hr_private.artifacts'))[0].n,0,'purge removes all versions/comments/preparation');
 eq((await sql('select count(*)::int as n from hr_private.deletion_alerts'))[0].n,1,'employment deletion creates exactly one notice');
 eq((await sql('select count(*)::int as n from hr_private.deletion_alert_deliveries'))[0].n,1,'only active systemadmin receives delivery');
 await actor(admin);await reject(()=>rpc('hr_deletion_alert_list'),'42501');
 await actor(self);await reject(()=>rpc('hr_deletion_alert_list'),'42501');
 await actor(system);const notices=await rpc('hr_deletion_alert_list');
 eq(notices.alerts.length,1);eq(notices.unread,1);
 eq(Object.keys(notices.alerts[0]).sort(),['receipt_id','company_id','employee_id','user_id','requested_at','reviewed_at','company_name','purge_state','email_sent'].sort(),'systemadmin sees only operational metadata');
 eq((await rpc('hr_deletion_alert_ack',[notices.alerts[0].receipt_id])).read,true);
 eq((await rpc('hr_deletion_alert_list')).unread,0);
 await reject(()=>rpc('hr_alert_worker_reserve'),'42501');
 await db.exec('reset role;set role service_role;');
 eq(await rpc('hr_alert_worker_reserve'),null,'worker disabled until reviewed setup');
 eq(await rpc('hr_alert_worker_authorize',['aa'.repeat(32)]),false,'disabled token cannot authorize');
 await db.exec('reset role;update hr_private.deletion_alert_settings set enabled=true;set role service_role;');
 eq(await rpc('hr_alert_worker_authorize',['aa'.repeat(32)]),true,'synthetic fixture token authorizes enabled worker');
 eq(await rpc('hr_alert_worker_authorize',['bb'.repeat(32)]),false);
 const job=await rpc('hr_alert_worker_reserve');eq(job.receipt.employee_id,employee.id);
 eq(Object.keys(job.receipt).sort(),['id','company_id','employee_id','user_id','kind','through_revision','requested_at'].sort(),'mail receipt contains no HR contents');
 eq(await rpc('hr_alert_worker_validate',[job.id,job.attempt]),true);
 eq(await rpc('hr_alert_worker_finish',[job.id,id(999),true]),false,'stale attempt cannot acknowledge delivery');
 eq(await rpc('hr_alert_worker_finish',[job.id,job.attempt,false]),true);
 eq(await rpc('hr_alert_worker_reserve'),null,'failed provider response uses backoff');
 await db.exec("reset role;update hr_private.deletion_alert_deliveries set available_at=now();set role service_role;");
 const retry=await rpc('hr_alert_worker_reserve');eq(retry.id,job.id,'provider idempotency identity retained');
 eq(retry.attempt===job.attempt,false,'each worker attempt is fenced');
 await db.exec(`reset role;update public.profiles set system_role=null where id=${q(system)};set role service_role;`);
 eq(await rpc('hr_alert_worker_validate',[retry.id,retry.attempt]),false,'lost systemadmin role stops send');
 await rpc('hr_alert_worker_finish',[retry.id,retry.attempt,false]);
 await db.exec("reset role;update hr_private.deletion_alert_deliveries set available_at=now();set role service_role;");
 eq((await rpc('hr_alert_worker_reserve')).suppressed,true);
 await db.exec(`reset role;update public.profiles set system_role='systemadmin',email='changed@example.invalid' where id=${q(system)};
 update hr_private.deletion_alert_deliveries set status='pending',available_at=now();set role service_role;`);
 eq((await rpc('hr_alert_worker_reserve')).suppressed,true,'email change suppresses previously addressed notice');
 await db.exec(`reset role;update public.profiles set email='synthetic@example.invalid' where id=${q(system)};
 update hr_private.deletion_alert_deliveries set status='pending',available_at=now(),first_attempt_at=now()-interval '24 hours';set role service_role;`);
 eq((await rpc('hr_alert_worker_reserve')).suppressed,true,'do not retry beyond provider idempotency window');
 await db.exec("reset role;update hr_private.deletion_alert_deliveries set status='pending',available_at=now(),first_attempt_at=now(),attempts=10;set role service_role;");
 eq((await rpc('hr_alert_worker_reserve')).suppressed,true,'attempt limit is bounded');
 await db.exec('reset role;');
 const externalJournal=(await sql(`select jsonb_build_object('id',id,'company_id',company_id,'employee_id',employee_id,'user_id',user_id,'kind',kind,'through_revision',through_revision,'requested_at',requested_at) as receipt from hr_private.purge_receipts`)).map(r=>r.receipt);
 const restored=await PGlite.create({loadDataDir:backup});
 try{
  // Operator must stop API access before restore, then close gates before replay.
  await restored.exec('update hr_private.runtime_state set content_enabled=false,restore_quarantined=true;');
  eq((await restored.query('select count(*)::int as n from hr_private.conversations')).rows[0].n,1,'physical old backup restores conversation and all old snapshots');
  eq((await restored.query(`select hr_private.restore_reconcile(${q(JSON.stringify(externalJournal))}::jsonb) as n`)).rows[0].n,1,'external minimal receipt replays against new restored database');
  eq((await restored.query('select count(*)::int as n from hr_private.conversations')).rows[0].n,0,'replay purges restored current pointer');
  eq((await restored.query('select count(*)::int as n from hr_private.artifacts')).rows[0].n,0,'replay purges every restored personal snapshot');
  eq((await restored.query('select count(*)::int as n from hr_private.deletion_alerts')).rows[0].n,1,'receipt replay rebuilds minimal alert without contents');
  eq((await restored.query('select content_enabled,restore_quarantined from hr_private.runtime_state')).rows[0],{content_enabled:false,restore_quarantined:true},'replay never opens restored data');
 }finally{await restored.close();}
 await actor(self);await reject(()=>get(),'42501');
 await db.exec('reset role;set role anon;');await reject(()=>get(),'42501');
 await db.exec('reset role;set role service_role;');await reject(()=>get(),'42501');
 console.log(`HR personal conversations: ${checks} PostgreSQL assertions PASS. Actual RPC/role/private preparation/CAS/history/leader change/confirmation/purge; platform adapter synthetic, no cloud restore.`);
}finally{await db.close();}
