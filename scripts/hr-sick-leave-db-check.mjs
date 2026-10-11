import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const {PGlite}=await import(process.env.HR_PGLITE_PATH||'/tmp/hr-h4-runtime/node_modules/@electric-sql/pglite/dist/index.js');
const db=await PGlite.create();let checks=0;
const id=n=>`71000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
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
 '20261009211209_hr_restore_reconcile_orphans.sql','20261011134804_hr_personal_conversations.sql','20261011140130_hr_deletion_admin_alerts.sql','20261011155003_hr_sick_leave_cases.sql','20261011155506_hr_followup_reminders.sql','20261011162113_hr_sick_leave_reference_index.sql','20261011162527_hr_followup_worker_scope.sql','20261011192456_hr_conversation_meeting_time.sql','20261011195555_hr_conversation_creation_notice.sql'];
 for(const f of migrations)await db.exec(await fs.readFile('supabase/migrations/'+f,'utf8'));
 await db.exec(`insert into public.sales_company_scopes values(${q(company)},'synthetic','Synthetic'),(${q(foreign)},'other','Other');
 insert into public.company_module_access(company_id,module_key,enabled) values(${q(company)},'hr',true),(${q(foreign)},'hr',true);`);
 for(const u of [admin,self,leader,next,reader,outsider,system])await db.exec(`
 insert into auth.users(id) values(${q(u)});
 insert into public.profiles(id,email,approved,deactivated,role,system_role) values(${q(u)},'synthetic@example.invalid',true,false,'member',${u===system?"'systemadmin'":'null'});
 insert into public.sales_company_memberships(company_id,user_id,workspace_role) values(${q(company)},${q(u)},${q(u===admin?'firmaadmin':'ansatt')});
 insert into public.user_active_company_scope values(${q(u)},${q(company)});
 insert into hr_private.module_access(company_id,user_id,enabled) values(${q(company)},${q(u)},true);`);
 await actor(admin);await rpc('hr_foundation_configure',[company,0,true,'Synthetic QA purpose','Synthetic QA basis',new Date(Date.now()+30*86400000).toISOString().slice(0,10)]);
 const employee=(await rpc('hr_employee_command',[company,'create',{user_id:self,leader_id:leader}])).employee;

 const template=id(20),annual=id(23),question=id(21),meeting=id(22),conversation=id(30);
 const today=(await sql("select (now() at time zone 'Europe/Oslo')::date::text as d"))[0].d;
 const ago=n=>new Date(Date.parse(today+'T12:00:00Z')-n*86400000).toISOString().slice(0,10);
 const tpl={title:'Oppfølgingsplan',kind:'sickleave',intro:'Syntetisk QA uten personopplysninger',questions:[
 {id:question,topic:'Arbeidsoppgaver',prompt:'Hva fungerer i arbeidet?',phase:'preparation',required:true},
 {id:meeting,topic:'Tilrettelegging',prompt:'Hva avtaler vi?',phase:'meeting',required:true}]};
 await rpc('hr_template_save',[company,template,0,tpl,false]);
 await rpc('hr_template_save',[company,annual,0,{...tpl,kind:'annual'},false]);
 await actor(leader);
 await reject(()=>rpc('hr_sick_leave_start',[company,employee.id,1,conversation,template,1,ago(28),'partial']),'42501');
 await db.exec('reset role;update hr_private.runtime_state set content_enabled=true,restore_quarantined=false;');
 await actor(admin);await reject(()=>rpc('hr_sick_leave_start',[company,employee.id,1,conversation,template,1,ago(28),'partial']),'42501');
 await actor(leader);
 eq((await rpc('hr_sick_leave_templates',[company,employee.id])).templates.map(t=>t.id),[template],'only sick-leave templates');
 await reject(()=>rpc('hr_sick_leave_start',[company,employee.id,1,conversation,annual,1,ago(28)]),'22023');
 await reject(()=>rpc('hr_sick_leave_start',[company,employee.id,1,conversation,template,1,'2099-01-01']),'22023');
 let state=await rpc('hr_sick_leave_start',[company,employee.id,1,conversation,template,1,ago(28),'partial']);
 eq(state.conversation.milestones.meeting1.status,'review','graded absence calls for a documented need assessment');
 eq((await rpc('hr_sick_leave_start',[company,employee.id,1,conversation,template,1,ago(28)])).current_revision,1,'retry by same ID creates no duplicate');
 await reject(()=>rpc('hr_sick_leave_start',[company,employee.id,1,id(31),template,1,today]),'22023');
 let revision=1,employeeRevision=1;
 const command=async(action,data={})=>{state=await rpc('hr_sick_leave_command',[company,employee.id,employeeRevision,conversation,revision,action,data]);revision=state.current_revision;return state;};
 const get=(version=null)=>rpc('hr_sick_leave_get',[company,employee.id,conversation,version]);
 const followup=()=>({on:state.conversation.on,absence_mode:state.conversation.absence_mode,milestones:structuredClone(state.conversation.milestones),correction_reason:''});
 await reject(()=>command('preparation',{answers:{[question]:'Cannot impersonate'}}),'42501');
 await actor(self);await reject(()=>command('share'),'22023');
 await command('preparation',{answers:{[question]:'Syntetiske arbeidsoppgaver før deling'}});
 for(const u of [leader,admin]){await actor(u);eq((await get()).conversation.preparation,{},'private answers remain redacted');}
 for(const u of [reader,outsider,system]){await actor(u);await reject(()=>get(),'42501');}
 await actor(self);await command('share');
 await actor(leader);await command('meeting',{answers:{[meeting]:'Syntetisk tilrettelegging'},actions:[{id:id(40),task:'Test avtalt tiltak',owner_id:self,due_on:today,done:false}],next_on:today});
 const saved=revision;
 await reject(()=>rpc('hr_sick_leave_command',[company,employee.id,employeeRevision,conversation,saved-1,'close',{on:today,confirmed:true}]),'40001');
 await command('ready');await command('confirm');await actor(self);await command('confirm');eq(state.conversation.stage,'completed','both confirm for themselves');
 await reject(()=>command('followup',followup()),'42501');
 await actor(leader);
 const bad=followup();bad.on=ago(29);await reject(()=>command('followup',bad),'22023');
 bad.correction_reason='Syntetisk retting av dato';await command('followup',bad);eq(state.conversation.stage,'awaiting');eq(state.conversation.confirmations.employee,null,'date correction invalidates prior review');
 for(const patch of [{absence_mode:null},{milestones:{...state.conversation.milestones,extra:{status:'done'}}},{milestones:{...state.conversation.milestones,plan:{status:'done',on:today,note:''}}}])await reject(()=>command('followup',{...followup(),...patch}),'22023');
 let data=followup();data.on=ago(28);data.correction_reason='Syntetisk retting til opprinnelig dato';data.milestones.meeting1={status:'exempt',on:today,note:'Syntetisk vurdering: møte ikke nødvendig'};await command('followup',data);
 await command('confirm');await actor(self);await command('confirm');await actor(leader);
 const confirmed=state.conversation.confirmations;
 await reject(()=>command('log_sharing',{target:'nav',on:today,version:1,channel:'nav_portal',confirmed:true}),'22023');
 await reject(()=>command('log_sharing',{target:'nav',on:today,version:revision,channel:'nav_portal',confirmed:false}),'22023');
 await command('log_sharing',{target:'sykmelder',on:today,version:revision,channel:'other',confirmed:true});
 eq(state.conversation.sharing.sykmelder.length,1);eq(state.conversation.confirmations,confirmed,'actual sharing journal does not change the reviewed plan');
 const sharedVersion=revision;
 const tasks=await rpc('hr_followup_tasks',[company]);eq(tasks.tasks.length,5,'leader sees open milestones and next followup, documented exception excluded');eq(tasks.email_enabled,false);
 eq(tasks.tasks.find(t=>t.task_key==='plan').due_on,today,'four calendar weeks');
 await actor(self);eq((await rpc('hr_followup_tasks',[company])).tasks.map(t=>t.task_key),['action:'+id(40)],'only own action, no manager tasks');
 await actor(admin);eq((await rpc('hr_followup_tasks',[company])).tasks.map(t=>t.task_key),['hr-review'],'admin sees own control review only');
 await reject(()=>rpc('hr_followup_tasks',[foreign]),'42501');
 await db.exec('reset role;set role service_role;');eq(await rpc('hr_followup_worker_reserve'),null);eq(await rpc('hr_followup_worker_authorize',['aa'.repeat(32)]),false);
 await db.exec('reset role;update hr_private.followup_settings set enabled=true;select hr_private.queue_followup_reminders();select hr_private.queue_followup_reminders();');
 eq((await sql('select count(*)::int n from hr_private.followup_deliveries'))[0].n,4,'once per due bucket, independently of login and repeated cron');
 await db.exec(`update hr_private.followup_deliveries set available_at=case when recipient_id=${q(leader)} then now()-interval '1 minute' else now()+interval '1 hour' end;set role service_role;`);eq(await rpc('hr_followup_worker_authorize',['bb'.repeat(32)]),false);eq(await rpc('hr_followup_worker_authorize',['aa'.repeat(32)]),true);
 const job=await rpc('hr_followup_worker_reserve');eq(Object.keys(job).sort(),['attempt','id','to'],'no plan, names or sick-leave content in worker transport');
 eq(await rpc('hr_followup_worker_validate',[job.id,job.attempt]),true);
 eq(await rpc('hr_followup_worker_finish',[job.id,id(999),true]),false,'stale attempt cannot acknowledge');
 eq(await rpc('hr_followup_worker_finish',[job.id,job.attempt,false]),true);
 await db.exec(`reset role;update hr_private.followup_deliveries set status='sent' where id<>${q(job.id)};set role service_role;`);
 eq(await rpc('hr_followup_worker_reserve'),null,'provider failure backs off');
 await db.exec(`reset role;update hr_private.followup_deliveries set available_at=now() where id=${q(job.id)};set role service_role;`);
 const retry=await rpc('hr_followup_worker_reserve');eq(retry.id,job.id);eq(retry.attempt===job.attempt,false);
 await actor(leader);await reject(()=>command('close',{on:today,confirmed:false}),'22023');await command('close',{on:today,confirmed:true});
 eq(state.conversation.case_status,'closed');eq(state.permissions.followup,false);eq((await rpc('hr_followup_tasks',[company])).tasks,[],'closing stops all tasks');
 await db.exec('reset role;set role service_role;');eq(await rpc('hr_followup_worker_validate',[retry.id,retry.attempt]),false,'closing suppresses a reserved reminder');
 await actor(self);eq((await rpc('hr_followup_tasks',[company])).tasks,[]);await reject(()=>command('reopen'),'42501');
 await actor(leader);await command('reopen');eq(state.conversation.case_status,'active');eq((await get(sharedVersion)).historical,true);
 await actor(admin);const changed=await rpc('hr_employee_command',[company,'leader',{id:employee.id,revision:employeeRevision,leader_id:next,clear_old_leader_reader:false}]);employeeRevision=changed.employee.revision;
 await actor(leader);await reject(()=>get(),'42501');eq((await rpc('hr_followup_tasks',[company])).tasks,[],'old leader has no task or reminder authority');
 await db.exec('reset role;set role service_role;');eq(await rpc('hr_followup_worker_validate',[retry.id,retry.attempt]),false,'leader change fences in-flight delivery');
 await actor(next);state=await get();eq(state.conversation.confirmations.leader,null);eq((await rpc('hr_followup_tasks',[company])).tasks.length,5);
 await db.exec('reset role;update hr_private.runtime_state set restore_quarantined=true;');await actor(self);await reject(()=>get(),'42501');await reject(()=>rpc('hr_followup_tasks',[company]),'42501');
 await db.exec('reset role;');eq((await sql('select count(*)::int n from hr_private.sick_leave_tasks()'))[0].n,0,'restore quarantine blocks the worker too');
 await db.exec('update hr_private.runtime_state set restore_quarantined=false;');
 // Three days before and weekly overdue slots are calendar based; no mail queue on login/read.
 await actor(next);let f=followup();f.on=ago(25);f.correction_reason='Syntetisk dato for tre-dagersvarsel';await command('followup',f);
 await db.exec('reset role;delete from hr_private.followup_deliveries;select hr_private.queue_followup_reminders();');
 eq((await sql("select count(*)::int n from hr_private.followup_deliveries where task_key='plan' and bucket=-3"))[0].n,1,'three days before deadline goes to current leader');
 await actor(next);f=followup();f.on=ago(35);f.correction_reason='Syntetisk dato for ukentlig varsel';await command('followup',f);
 await db.exec('reset role;select hr_private.queue_followup_reminders();');
 eq((await sql("select count(*)::int n from hr_private.followup_deliveries where task_key='plan' and bucket=1"))[0].n,1,'weekly after deadline');
 await actor(next);f=followup();f.milestones.plan={status:'done',on:today,note:'Syntetisk oppfølging ferdig'};await command('followup',f);
 eq((await rpc('hr_followup_tasks',[company])).tasks.some(t=>t.task_key==='plan'),false,'handled milestone drops from live tasks');
 await db.exec(`reset role;update hr_private.followup_deliveries set available_at=now()-interval '2 days' where task_key='plan';set role service_role;`);
 eq((await rpc('hr_followup_worker_reserve')).suppressed,true,'queued milestone is suppressed after completion');
 // Existing annual/followup conversations also receive reminders with no old source edits.
 await actor(next);let annualState=await rpc('hr_conversation_start',[company,employee.id,employeeRevision,id(60),annual,1,today]);
 await actor(self);annualState=await rpc('hr_conversation_command',[company,employee.id,employeeRevision,id(60),annualState.current_revision,'preparation',{answers:{[question]:'Syntetisk årsoppfølging'}}]);
 annualState=await rpc('hr_conversation_command',[company,employee.id,employeeRevision,id(60),annualState.current_revision,'share',{}]);
 await actor(next);annualState=await rpc('hr_conversation_command',[company,employee.id,employeeRevision,id(60),annualState.current_revision,'meeting',{answers:{[meeting]:'Syntetisk møte'},actions:[{id:id(61),task:'Syntetisk ansatt-tiltak',owner_id:self,due_on:today,done:false},{id:id(62),task:'Syntetisk leder-tiltak',owner_id:next,due_on:today,done:false}],next_on:today}]);
 const annualTasks=(await rpc('hr_followup_tasks',[company])).tasks.filter(t=>t.case_id===id(60));eq(annualTasks.length,3,'leader receives next meeting plus both owned and employee tasks exactly once');
 await actor(self);eq((await rpc('hr_followup_tasks',[company])).tasks.filter(t=>t.case_id===id(60)).length,1,'employee receives own assigned task');
 await actor(admin);eq((await rpc('hr_followup_tasks',[company])).tasks.map(t=>t.task_key),['hr-review'],'control deadline belongs to firm admin');
 // Disable either company or recipient access: no live reminders or queued send authority.
 await db.exec(`reset role;update hr_private.module_access set enabled=false where company_id=${q(company)} and user_id=${q(next)};`);
 eq((await sql(`select count(*)::int n from hr_private.sick_leave_tasks() where recipient_id=${q(next)}`))[0].n,0,'recipient module revocation blocks task collector');
 await db.exec(`update hr_private.module_access set enabled=true where company_id=${q(company)} and user_id=${q(next)};update public.company_module_access set enabled=false where company_id=${q(company)} and module_key='hr';`);
 eq((await sql('select count(*)::int n from hr_private.sick_leave_tasks()'))[0].n,0,'company revocation stops worker collection');
 await db.exec(`update public.company_module_access set enabled=true where company_id=${q(company)} and module_key='hr';`);
 for(const role of ['anon','authenticated','service_role']){
  await db.exec('reset role;set role '+role);await reject(()=>sql('select * from hr_private.followup_deliveries'),'42501');await reject(()=>sql('select * from hr_private.sick_leave_cases'),'42501');
  if(role!=='service_role')await reject(()=>rpc('hr_followup_worker_reserve'),'42501');
 }
 await actor(admin);await rpc('hr_employee_command',[company,'end',{id:employee.id,revision:employeeRevision,confirm:'END_AND_DELETE'}]);
 await db.exec('reset role;');
 for(const table of ['sick_leave_cases','followup_deliveries','artifacts'])eq((await sql('select count(*)::int n from hr_private.'+table))[0].n,0,'employment purge cascades '+table);
 console.log(`✅ Sick-leave SQL: ${checks} checks, private roles/dates/sharing/CAS/own confirmations, live tasks, server-only outbox/backoff/revocation/closure/purge PASS`);
}finally{await db.close();}
