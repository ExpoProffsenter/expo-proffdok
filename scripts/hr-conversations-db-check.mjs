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
 await db.exec(`create table public.companies(id uuid,company_name text,logo_url text,created_at timestamptz);alter table public.profiles add column if not exists logo_url text,add column if not exists created_at timestamptz;create or replace function public.sales_normalize_company_name(v text) returns text language sql immutable as $$select lower(trim(v))$$;`);
 const migrations=['20261009182551_hr_access_foundation.sql','20261009193953_hr_content_purge_foundation.sql',
 '20261009203431_people_module_entitlements.sql','20261009203950_people_module_access_closure.sql',
 '20261010004928_hr_conversation_templates.sql','20261010105649_hr_sick_leave_template_kind.sql',
 '20261009211209_hr_restore_reconcile_orphans.sql','20261011134804_hr_personal_conversations.sql','20261011140130_hr_deletion_admin_alerts.sql','20261011155003_hr_sick_leave_cases.sql','20261011155506_hr_followup_reminders.sql','20261011162527_hr_followup_worker_scope.sql','20261011192456_hr_conversation_meeting_time.sql','20261011195555_hr_conversation_creation_notice.sql','20261011203859_hr_conversation_reminder_feedback.sql','20261011205907_hr_targeted_transport_test.sql','20261011220405_hr_conversation_meeting_location.sql','20261012050658_hr_conversation_feedback_notice.sql','20261012061931_hr_employee_display_name.sql','20261012080426_hr_conversation_review_retry.sql'];
 for(const f of migrations)await db.exec(await fs.readFile('supabase/migrations/'+f,'utf8'));
 for(const role of ['anon','service_role'])for(const signature of ['public.hr_conversation_feedback_notices(uuid,uuid)','public.hr_conversation_feedback_handle(uuid,uuid,integer,uuid,integer)'])eq((await sql(`select has_function_privilege('${role}','${signature}','execute') v`))[0].v,false,'feedback RPCs are authenticated-only');
 eq((await sql("select has_table_privilege('authenticated','hr_private.conversation_feedback_receipts','select,insert,update,delete') v"))[0].v,false,'receipt table is private');
 eq((await sql("select has_function_privilege('authenticated','public.hr_followup_test_reserve(uuid)','execute') as v"))[0].v,false,'test reserve is server-only');
 eq((await sql("select public.hr_followup_test_reserve('70000000-0000-4000-8000-000000009999') as v"))[0].v,null,'unknown test cannot take queue job');
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
 // Name comes from the authorized employee's profile, never the leader/actor.
 await db.exec(`reset role;update auth.users set raw_user_meta_data=jsonb_build_object('full_name','  Syntetisk medarbeider  ') where id=${q(self)};update auth.users set raw_user_meta_data=jsonb_build_object('full_name','Wrong leader name') where id=${q(leader)};`);
 await actor(leader);let identity=await rpc('hr_employee_get',[company,employee.id]);eq(identity.employee.full_name,'Syntetisk medarbeider');eq(identity.employee.user_id,self);eq(identity.employee.revision,employee.revision,'display-name read never changes employee');
 for(const name of [null,42,{},'   ','']){
  await db.exec(`reset role;update auth.users set raw_user_meta_data=jsonb_build_object('full_name',${q(JSON.stringify(name))}::jsonb) where id=${q(self)};`);await actor(leader);eq((await rpc('hr_employee_get',[company,employee.id])).employee.full_name,null,'invalid/empty name keeps email fallback');
 }
 await db.exec(`reset role;update auth.users set raw_user_meta_data=jsonb_build_object('full_name',repeat('Ø',150)) where id=${q(self)};`);await actor(leader);eq((await rpc('hr_employee_get',[company,employee.id])).employee.full_name.length,120,'bounded display name');
 await db.exec(`reset role;update auth.users set raw_user_meta_data=jsonb_build_object('full_name','Syntetisk medarbeider') where id=${q(self)};`);
 for(const role of ['anon','authenticated','service_role'])eq((await sql(`select has_function_privilege('${role}','hr_private.employee_json(hr_private.employees)','execute') v`))[0].v,false,'name helper remains private');
 for(const user of [outsider,system]){await actor(user);await reject(()=>rpc('hr_employee_get',[company,employee.id]),'42501');}
 await actor(admin);
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
 for(const time of [null,'','9:00','24:00','12:60','09:00:00','09:00Z'])await reject(()=>rpc('hr_conversation_start_at',[company,employee.id,1,conversation,template,1,'2026-11-01',time]),'22023');
 let state=await rpc('hr_conversation_start_at_place',[company,employee.id,1,conversation,template,1,'2026-11-01','13:30',' Sted A ']);eq(state.conversation.meeting_location,'Sted A');
 eq(state.employee.full_name,'Syntetisk medarbeider','conversation returns correct named employee');
 eq(state.conversation.meeting_time,'13:30');eq(state.conversation.meeting_timezone,'Europe/Oslo');
 eq((await rpc('hr_conversation_start_at',[company,employee.id,1,conversation,template,1,'2026-11-02','14:45'])).conversation.meeting_time,'13:30','same ID retry cannot silently reschedule');
 eq(state.conversation.revision,1,'server case created');
 eq((await rpc('hr_conversation_start',[company,employee.id,1,conversation,template,1,'2026-11-01'])).conversation.revision,1,'same ID retry does not create duplicate');
 const schedule=(revision,on='2026-11-02',time='14:45')=>rpc('hr_conversation_schedule',[company,employee.id,1,conversation,revision,on,time]);
 await actor(self);await reject(()=>schedule(1),'42501');
 await actor(admin);await reject(()=>schedule(1),'42501');
 await actor(leader);await reject(()=>schedule(0),'40001');await reject(()=>schedule(1,'2026-11-02','24:00'),'22023');
 state=await schedule(1);eq(state.current_revision,2);eq(state.conversation.on,'2026-11-02');eq(state.conversation.meeting_time,'14:45');
 eq((await schedule(2)).current_revision,2,'unchanged time is idempotent');
 eq((await rpc('hr_conversation_get',[company,employee.id,conversation,1])).conversation.meeting_time,'13:30','original time remains in immutable history');
 await actor(self);eq((await rpc('hr_conversation_get',[company,employee.id,conversation])).conversation.meeting_time,'14:45','employee reads agreed time');
 eq((await rpc('hr_conversation_list',[company,employee.id])).conversations[0].meeting_time,'14:45');
 // Manual invitation uses the saved clock and existing private outbox, never creation mail.
 const status=()=>rpc('hr_conversation_invitation_status',[company,employee.id,conversation]);
 const notify=()=>rpc('hr_conversation_notify',[company,employee.id,1,conversation,2]);
 await actor(leader);eq((await status()).app_notification,true);eq((await status()).email_status,'disabled');eq((await status()).can_notify,true);
 eq((await notify()).email_status,'disabled','disabled transport remains truthful');
 await db.exec('reset role;');eq((await sql('select count(*)::int n from hr_private.followup_deliveries'))[0].n,0,'no delivery from creation or disabled click');
 await db.exec("update hr_private.followup_settings set enabled=true,endpoint='';");
 await actor(leader);eq((await status()).email_status,'not_queued');
 await reject(()=>rpc('hr_conversation_notify',[company,employee.id,1,conversation,1]),'40001');
 for(const u of [self,admin]){await actor(u);eq((await status()).can_notify,false);await reject(notify,'42501');}
 await actor(leader);eq((await notify()).email_status,'pending');eq((await notify()).email_status,'pending','same appointment retries deduplicate');
 await db.exec('reset role;');eq((await sql('select count(*)::int n from hr_private.followup_deliveries'))[0].n,1);
 await db.exec('set role service_role;');eq(await rpc('hr_followup_worker_reserve'),null,'deadline worker cannot take invitation');
 let inviteJob=await rpc('hr_conversation_invitation_reserve');eq(Object.keys(inviteJob).sort(),['attempt','branding','id','location','on','time','to']);eq(inviteJob.on,'2026-11-02');eq(inviteJob.time,'14:45');
 eq(await rpc('hr_conversation_invitation_validate',[inviteJob.id,inviteJob.attempt,inviteJob.on,inviteJob.time]),true);
 eq(await rpc('hr_conversation_invitation_validate',[inviteJob.id,inviteJob.attempt,inviteJob.on,'14:46']),false);
 eq(await rpc('hr_conversation_invitation_validate',[inviteJob.id,inviteJob.attempt,'2026-11-03',inviteJob.time]),false);
 eq(await rpc('hr_followup_worker_finish',[inviteJob.id,id(999),true]),false);
 eq(await rpc('hr_followup_worker_finish',[inviteJob.id,inviteJob.attempt,false]),true);
 eq(await rpc('hr_conversation_invitation_reserve'),null,'failed transport backs off');
 await db.exec('reset role;update hr_private.followup_deliveries set available_at=now();set role service_role;');
 const retryInvite=await rpc('hr_conversation_invitation_reserve');eq(retryInvite.id,inviteJob.id);eq(retryInvite.attempt===inviteJob.attempt,false);
 eq(await rpc('hr_followup_worker_finish',[retryInvite.id,retryInvite.attempt,true]),true);
 await actor(leader);eq((await status()).email_status,'sent');eq((await status()).can_notify,false);
 // A clock change must not claim the new invitation has been sent.
 state=await schedule(2,'2026-11-02','15:00');eq((await status()).email_status,'not_queued');
 await rpc('hr_conversation_notify',[company,employee.id,1,conversation,3]);
 await db.exec('reset role;set role service_role;');inviteJob=await rpc('hr_conversation_invitation_reserve');eq(inviteJob.time,'15:00');
 await actor(leader);state=await schedule(3,'2026-11-02','14:45');
 await db.exec('reset role;set role service_role;');eq(await rpc('hr_conversation_invitation_validate',[inviteJob.id,inviteJob.attempt,inviteJob.on,inviteJob.time]),false,'changed clock stops old invitation before provider');
 await actor(leader);eq((await status()).email_status,'sent','original appointment sent history retained');
 await reject(()=>rpc('hr_conversation_invitation_reserve'),'42501','worker is server only');
 // Exact test ID, current authorized admin and stable provider identity; ordinary queue stays isolated.
 await db.exec('reset role;');
 const testId=(await sql(`insert into hr_private.followup_deliveries(case_id,company_id,task_key,due_on,bucket,recipient_id) select case_id,company_id,task_key,due_on,-9000000,recipient_id from hr_private.sick_leave_tasks(${q(company)},${q(company)}) where recipient_id=${q(admin)} and task_key='hr-review' returning id`))[0].id;
 await actor(admin);await reject(()=>rpc('hr_followup_test_reserve',[testId]),'42501');
 await db.exec('reset role;set role service_role;');eq(await rpc('hr_followup_test_reserve',[conversation]),null,'wrong ID cannot select test');
 const testJob=await rpc('hr_followup_test_reserve',[testId]);eq(testJob.id,testId);eq(testJob.to,'synthetic@example.invalid');eq(await rpc('hr_followup_worker_validate',[testJob.id,testJob.attempt]),true);
 eq(await rpc('hr_followup_test_reserve',[testId]),null,'active lease cannot duplicate');
 await db.exec(`reset role;update public.profiles set deactivated=true where id=${q(admin)};set role service_role;`);eq(await rpc('hr_followup_worker_validate',[testJob.id,testJob.attempt]),false,'access revocation stops targeted test');
 await db.exec(`reset role;update public.profiles set deactivated=false where id=${q(admin)};set role service_role;`);
 eq(await rpc('hr_followup_worker_finish',[testJob.id,testJob.attempt,true]),true);eq(await rpc('hr_followup_test_reserve',[testId]),null,'sent test cannot send twice');
 await db.exec(`reset role;delete from hr_private.followup_deliveries where id=${q(testId)};`);
 await db.exec('reset role;update hr_private.followup_settings set enabled=false;');
 await actor(leader);
 const reminder=(enabled,rev=state.current_revision)=>rpc('hr_conversation_reminder',[company,employee.id,1,conversation,rev,enabled]);
 await reject(()=>reminder(true,state.current_revision-1),'40001');await actor(self);await reject(()=>reminder(true),'42501');await actor(admin);await reject(()=>reminder(true),'42501');await actor(leader);
 const content=state.conversation.content_version;state=await reminder(true);eq(state.conversation.leader_email_reminder,true);eq(state.conversation.leader_reminder_user_id,leader);eq(state.conversation.content_version,content,'notification choice does not change meeting contents/confirmations');
 eq((await reminder(true)).current_revision,state.current_revision,'same preference is idempotent');
 await db.exec("reset role;update hr_private.followup_settings set enabled=true,endpoint='';select hr_private.queue_conversation_reminders();");
 eq((await sql("select count(*)::int n from hr_private.followup_deliveries where task_key='meeting-reminder'"))[0].n,1);
 eq((await sql("select available_at=((due_on::text||' 14:45')::timestamp at time zone 'Europe/Oslo')-interval '24 hours' as ok from hr_private.followup_deliveries where task_key='meeting-reminder'"))[0].ok,true);
 await db.exec('set role service_role;');eq(await rpc('hr_conversation_mail_reserve',['meeting-reminder']),null,'reminder cannot send early');
 await db.exec("reset role;update hr_private.followup_deliveries set available_at='1900-01-01' where task_key='meeting-reminder';set role service_role;");
 const reminderJob=await rpc('hr_conversation_mail_reserve',['meeting-reminder']);eq(reminderJob.time,'14:45');eq(reminderJob.to,'synthetic@example.invalid');eq(await rpc('hr_conversation_mail_validate',[reminderJob.id,reminderJob.attempt,'meeting-reminder',reminderJob.on,reminderJob.time]),true);
 await db.exec(`reset role;update hr_private.employees set leader_id=${q(next)} where id=${q(employee.id)};set role service_role;`);eq(await rpc('hr_conversation_mail_validate',[reminderJob.id,reminderJob.attempt,'meeting-reminder',reminderJob.on,reminderJob.time]),false,'leader change never transfers opt-in');
 await db.exec(`reset role;update hr_private.employees set leader_id=${q(leader)} where id=${q(employee.id)};`);
 eq((await sql("select hr_private.conversation_meeting_at('2026-03-29','02:30') is null as ok"))[0].ok,true,'nonexistent Oslo clock rejected');eq((await sql("select hr_private.conversation_meeting_at('2026-10-25','02:30')='2026-10-25 00:30Z'::timestamptz as ok"))[0].ok,true,'SQL/ICS autumn first instant agrees');
 await actor(leader);state=await reminder(false);
 await db.exec('reset role;set role service_role;');eq(await rpc('hr_conversation_mail_validate',[reminderJob.id,reminderJob.attempt,'meeting-reminder',reminderJob.on,reminderJob.time]),false,'opt-out stops reserved send');
 await rpc('hr_followup_worker_finish',[reminderJob.id,reminderJob.attempt,false]);
 await db.exec("reset role;update hr_private.followup_settings set enabled=false;");
 await actor(leader);
 let revision=state.current_revision,employeeRevision=1;
 const command=async(action,data={})=>{
  state=await rpc('hr_conversation_command',[company,employee.id,employeeRevision,conversation,revision,action,data]);
  revision=state.current_revision;return state;
 };
 const get=(version=null)=>rpc('hr_conversation_get',[company,employee.id,conversation,version]);
 await reject(()=>command('preparation',{answers:{[question]:'Cannot impersonate'}}),'42501');
 await actor(self);await reject(()=>command('share'),'22023');
 await db.exec("reset role;update hr_private.followup_settings set enabled=true,endpoint='';");await actor(self);await command('preparation',{answers:{[question]:'Private preparation'}});await db.exec('reset role;');eq((await sql("select count(*)::int n from hr_private.followup_deliveries where task_key='employee-feedback'"))[0].n,0,'private preparation never mails leader');await actor(self);
 await actor(leader);eq((await rpc('hr_conversation_feedback_notices',[company])).tasks,[],'private preparation is never announced');await actor(self);
 eq(state.conversation.preparation[question],'Private preparation');
 for(const u of [leader,admin]){await actor(u);eq((await get()).conversation.preparation,{},'unshared preparation redacted');}
 for(const u of [reader,outsider,system]){await actor(u);await reject(()=>get(),'42501');}
 await actor(admin);await rpc('hr_employee_command',[company,'reader',{id:employee.id,revision:1,reader_id:reader,reason:'Synthetic explicit reader'}]);employeeRevision=2;
 await actor(reader);eq((await get()).conversation.preparation,{});await reject(()=>command('comment',{text:'Not a participant'}),'42501');
 await actor(self);await reject(()=>command('preparation',{answers:{unrelated:'invalid'}}),'22023');
 await db.exec("reset role;update hr_private.followup_settings set enabled=true,endpoint='';");await actor(self);
 await command('share');eq(state.conversation.stage,'meeting');eq((await status()).app_notification,false,'shared preparation closes app task');await actor(leader);await reject(()=>rpc('hr_conversation_notify',[company,employee.id,employeeRevision,conversation,revision]),'22023');
 const feedbackNotices=()=>rpc('hr_conversation_feedback_notices',[company]);
 const handleInput=(rev=state.conversation.employee_feedback_revision,empRev=employeeRevision)=>rpc('hr_conversation_feedback_handle',[company,employee.id,empRev,conversation,rev]);
 await actor(leader);const sharedRevision=state.conversation.employee_feedback_revision;const sharedNotices=(await feedbackNotices()).tasks;eq(sharedNotices.length,1);eq(Object.keys(sharedNotices[0]).sort(),['case_id','employee_id','task_key','due_on','kind','feedback_revision'].sort(),'notice has pointers only, no answers/name/comment');
 await db.exec(`reset role;
 insert into hr_private.artifacts(id,company_id,employee_id,employee_revision,kind,payload,review_on)
 select ('71000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,company_id,employee_id,employee_revision,kind,
 payload||jsonb_build_object('id',('72000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid),review_on
 from hr_private.artifacts cross join generate_series(1,52)n where id=(select current_artifact_id from hr_private.conversations where id=${q(conversation)});
 insert into hr_private.conversations(id,company_id,employee_id,revision,current_artifact_id)
 select ('72000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,${q(company)},${q(employee.id)},${revision},('71000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid from generate_series(1,52)n;`);
 await actor(leader);const page1=await feedbackNotices(),page2=await rpc('hr_conversation_feedback_notices',[company,page1.next]);eq(page1.tasks.length,50,'bounded feedback page');eq(page2.tasks.length,3);eq(page2.next,null,'no invented extra page');eq(new Set([...page1.tasks,...page2.tasks].map(t=>t.case_id)).size,53,'cursor neither loses nor duplicates feedback');
 await db.exec("reset role;delete from hr_private.artifacts where id::text like '71000000-%';");await actor(leader);
 for(const u of [self,admin,reader,outsider,system]){await actor(u);eq((await feedbackNotices()).tasks,[],'only current leader sees card');await reject(()=>handleInput(),'42501');}
 await actor(leader);await reject(()=>handleInput(sharedRevision,employeeRevision-1),'40001');await reject(()=>rpc('hr_conversation_feedback_notices',[foreign]),'42501');
 await db.exec('reset role;');const mailBefore=await sql('select * from hr_private.followup_deliveries order by id');await actor(leader);
 eq((await handleInput()).handled,true);eq((await feedbackNotices()).tasks,[],'explicit acknowledgement removes input');eq((await handleInput()).handled,true,'response-loss retry is idempotent');eq((await get()).current_revision,revision,'handling never changes conversation');
 await db.exec('reset role;');eq(await sql('select * from hr_private.followup_deliveries order by id'),mailBefore,'handling does not touch or resend mail');await actor(leader);
 await db.exec('reset role;set role service_role;');
 let feedback=await rpc('hr_conversation_mail_reserve',['employee-feedback']);eq(Object.keys(feedback).sort(),['attempt','id','to'],'feedback has no answers/date/person/firm');eq(await rpc('hr_conversation_mail_validate',[feedback.id,feedback.attempt,'employee-feedback']),true);
 await rpc('hr_followup_worker_finish',[feedback.id,feedback.attempt,true]);
 await actor(self);await command('comment',{text:'A new employee comment'});
 await actor(leader);eq((await feedbackNotices()).tasks.length,1,'new comment alerts after handling');await reject(()=>handleInput(sharedRevision),'40001','old acknowledgement cannot swallow new input');await actor(self);
 await db.exec('reset role;set role service_role;');feedback=await rpc('hr_conversation_mail_reserve',['employee-feedback']);eq(Boolean(feedback.id),true,'saved employee comment mails leader');await actor(self);await command('comment',{text:'A newer employee comment'});await db.exec('reset role;set role service_role;');eq(await rpc('hr_conversation_mail_validate',[feedback.id,feedback.attempt,'employee-feedback']),false,'superseded unsent feedback is coalesced');feedback=await rpc('hr_conversation_mail_reserve',['employee-feedback']);eq(Boolean(feedback.id),true);
 await db.exec(`reset role;update hr_private.module_access set enabled=false where company_id=${q(company)} and user_id=${q(leader)};set role service_role;`);eq(await rpc('hr_conversation_mail_validate',[feedback.id,feedback.attempt,'employee-feedback']),false,'current HR entitlement required for leader mail');
 await actor(leader);await reject(()=>feedbackNotices(),'42501');await reject(()=>handleInput(),'42501');
 await db.exec(`reset role;update hr_private.module_access set enabled=true where company_id=${q(company)} and user_id=${q(leader)};update hr_private.module_access set enabled=false where company_id=${q(company)} and user_id=${q(self)};`);
 await actor(leader);eq((await feedbackNotices()).tasks,[],'employee entitlement revoked hides input');await reject(()=>handleInput(),'42501');
 await db.exec(`reset role;update hr_private.module_access set enabled=true where company_id=${q(company)} and user_id=${q(self)};`);
 await db.exec(`reset role;update hr_private.module_access set enabled=true where company_id=${q(company)} and user_id=${q(leader)};update hr_private.followup_settings set enabled=false;`);
 await actor(leader);eq((await get()).conversation.preparation[question],'Private preparation','shared preparation retained');
 await command('meeting',{answers:{[meeting]:'Shared summary'},actions:[],next_on:''});
 eq(state.conversation.preparation[question],'Private preparation','manager cannot erase original answers');
 const saved=revision;
 await reject(()=>rpc('hr_conversation_command',[company,employee.id,employeeRevision,conversation,saved-1,'meeting',{answers:{[meeting]:'stale'},actions:[],next_on:''}]),'40001');
 eq((await get()).conversation.meeting[meeting],'Shared summary');
 await reject(()=>command('meeting',{answers:{[meeting]:'summary'},actions:[{id:id(40),task:'Do it',owner_id:outsider,due_on:'2026-11-20',done:false}],next_on:'2026-11-21'}),'22023');
 await command('meeting',{answers:{[meeting]:'Shared summary'},actions:[{id:id(40),task:'Follow up',owner_id:self,due_on:'2026-11-20',done:false}],next_on:'2026-11-21'});
 await command('ready');await command('confirm');eq(state.conversation.stage,'awaiting','one confirmation is insufficient');
 const reviewSnapshot=structuredClone(state);await db.exec('reset role;');const reviewCounts=(await sql('select (select count(*) from hr_private.artifacts)::int history,(select count(*) from hr_private.followup_deliveries)::int mail,(select count(*) from hr_private.conversation_feedback_receipts)::int receipts'))[0];await actor(leader);
 await command('ready');eq(state,reviewSnapshot,'same awaiting review keeps revision/content/confirmation/feedback/saved fields byte-for-byte');
 await db.exec('reset role;');eq((await sql('select (select count(*) from hr_private.artifacts)::int history,(select count(*) from hr_private.followup_deliveries)::int mail,(select count(*) from hr_private.conversation_feedback_receipts)::int receipts'))[0],reviewCounts,'repeated review makes no history, email or receipt');await actor(leader);
 await actor(self);await reject(()=>command('ready'),'42501');await actor(admin);await reject(()=>command('ready'),'42501');await actor(leader);
 await reject(()=>rpc('hr_conversation_command',[company,employee.id,employeeRevision,conversation,revision-1,'ready',{}]),'40001');

 await actor(self);await command('comment',{text:'My disagreement remains part of the record'});
 eq(state.conversation.confirmations.leader,null,'comment changes require renewed confirmation');
 await command('confirm');eq(state.conversation.stage,'awaiting');
 await actor(leader);const employeeConfirmed=structuredClone(state);await command('ready');eq(state.conversation,employeeConfirmed.conversation,'review retry preserves employee confirmation too');await command('confirm');eq(state.conversation.stage,'completed');await reject(()=>command('ready'),'22023');
 await reject(()=>rpc('hr_conversation_schedule',[company,employee.id,employeeRevision,conversation,revision,'2026-11-03','15:00']),'22023');
 const finalVersion=revision;
 eq((await command('confirm')).current_revision,finalVersion,'confirmation retry idempotent');
 await actor(admin);const changed=await rpc('hr_employee_command',[company,'leader',{id:employee.id,revision:employeeRevision,leader_id:next,clear_old_leader_reader:false}]);employeeRevision=changed.employee.revision;
 await actor(leader);await reject(()=>get(),'42501');eq((await feedbackNotices()).tasks,[],'old leader loses feedback notices');await reject(()=>handleInput(),'42501');
 await actor(next);eq((await feedbackNotices()).tasks.length,1,'new leader sees unread input without old leader receipt');state=await get();eq(state.conversation.stage,'awaiting','new leader must personally confirm');eq(state.conversation.confirmations.leader,null);
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
 // Place is mandatory for new invitations; immutable event snapshots deduplicate sends independently of comments/revisions.
 await db.exec("reset role;delete from hr_private.followup_deliveries;update hr_private.followup_settings set enabled=true,endpoint='';");
 await actor(next);const placeCase=id(31),oldCase=id(32);
 const startPlace=location=>rpc('hr_conversation_start_at_place',[company,employee.id,employeeRevision,placeCase,template,1,'2026-11-04','12:00',location]);
 for(const location of [null,'','   ','x'.repeat(201),'A\nB','A\tB'])await reject(()=>startPlace(location),'22023');
 await actor(self);await reject(()=>startPlace('Sted A'),'42501');await actor(admin);await reject(()=>startPlace('Sted A'),'42501');await actor(next);
 let placeState=await startPlace(' Sted A ');eq(placeState.conversation.meeting_location,'Sted A');eq((await startPlace('Sted B')).conversation.meeting_location,'Sted A','unknown creation response cannot reschedule the same ID');
 await rpc('hr_conversation_start_at',[company,employee.id,employeeRevision,oldCase,template,1,'2026-11-05','12:00']);
 eq((await rpc('hr_conversation_invitation_status',[company,employee.id,oldCase])).location_required,true);await reject(()=>rpc('hr_conversation_notify',[company,employee.id,employeeRevision,oldCase,1]),'22023');
 const placeStatus=()=>rpc('hr_conversation_invitation_status',[company,employee.id,placeCase]);
 const placeNotify=()=>rpc('hr_conversation_notify',[company,employee.id,employeeRevision,placeCase,placeState.current_revision]);
 const changePlace=location=>rpc('hr_conversation_schedule_at_place',[company,employee.id,employeeRevision,placeCase,placeState.current_revision,'2026-11-04','12:00',location]);
 eq((await changePlace('Sted A')).current_revision,1,'unchanged place is idempotent');await reject(()=>rpc('hr_conversation_schedule_at_place',[company,employee.id,employeeRevision,placeCase,0,'2026-11-04','12:00','Sted B']),'40001');
 await placeNotify();await placeNotify();await db.exec('reset role;');eq((await sql('select count(*)::int n from hr_private.followup_deliveries'))[0].n,1);
 await db.exec('set role service_role;');eq(await rpc('hr_followup_worker_reserve'),null,'deadline worker cannot take a place invitation');let placeJob=await rpc('hr_conversation_invitation_reserve');eq(placeJob.location,'Sted A');eq(placeJob.branding.name,'Synthetic');
 eq(await rpc('hr_conversation_invitation_validate_place',[placeJob.id,placeJob.attempt,placeJob.on,placeJob.time,'Sted A']),true);eq(await rpc('hr_conversation_invitation_validate_place',[placeJob.id,placeJob.attempt,placeJob.on,placeJob.time,'Sted B']),false,'reserved place cannot be substituted');
 await actor(next);placeState=await changePlace('Sted B');eq(placeState.current_revision,2);eq((await rpc('hr_conversation_get',[company,employee.id,placeCase,1])).conversation.meeting_location,'Sted A','old place retained in immutable history');eq((await placeStatus()).email_status,'not_queued');
 await db.exec('reset role;set role service_role;');eq(await rpc('hr_conversation_invitation_validate_place',[placeJob.id,placeJob.attempt,placeJob.on,placeJob.time,placeJob.location]),false,'changed place blocks old queued send');await rpc('hr_followup_worker_finish',[placeJob.id,placeJob.attempt,false]);await db.exec('reset role;update hr_private.followup_deliveries set available_at=now();set role service_role;');eq((await rpc('hr_conversation_invitation_reserve')).suppressed,true);
 await actor(next);await placeNotify();await placeNotify();await db.exec('reset role;set role service_role;');placeJob=await rpc('hr_conversation_invitation_reserve');eq(placeJob.location,'Sted B');await rpc('hr_followup_worker_finish',[placeJob.id,placeJob.attempt,true]);await actor(next);eq((await placeStatus()).email_status,'sent');
 placeState=await changePlace('Sted A');eq((await placeStatus()).can_notify,true,'return to never-sent suppressed place can create a fresh invitation');await placeNotify();await db.exec('reset role;set role service_role;');placeJob=await rpc('hr_conversation_invitation_reserve');eq(placeJob.location,'Sted A');await rpc('hr_followup_worker_finish',[placeJob.id,placeJob.attempt,true]);
 await actor(next);placeState=await changePlace('Sted B');eq((await placeStatus()).email_status,'sent','return to already-sent date/time/place does not resend');await placeNotify();await db.exec('reset role;');eq((await sql('select count(*)::int n from hr_private.followup_deliveries'))[0].n,3,'only the three explicitly requested event invitations exist');
 await actor(next);placeState=await rpc('hr_conversation_schedule',[company,employee.id,employeeRevision,placeCase,placeState.current_revision,'2026-11-06','13:00']);eq(placeState.conversation.meeting_location,'Sted B','legacy clock editor preserves saved place');
 await actor(self);await reject(()=>changePlace('Sted C'),'42501');await actor(next);
 const backup=await db.dumpDataDir();
 await actor(admin);const receipt=await rpc('hr_employee_command',[company,'end',{id:employee.id,revision:employeeRevision,confirm:'END_AND_DELETE'}]);eq(receipt.deleted,true);
 await db.exec('reset role;');
 eq((await sql('select count(*)::int as n from hr_private.conversations'))[0].n,0,'purge removes conversation pointer');
 eq((await sql('select count(*)::int as n from hr_private.artifacts'))[0].n,0,'purge removes all versions/comments/preparation');eq((await sql('select count(*)::int n from hr_private.followup_deliveries'))[0].n,0,'purge removes all invitation/reminder/feedback rows');
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
 await db.exec('reset role;');eq((await sql('select count(*)::int n from hr_private.conversation_feedback_receipts'))[0].n,0,'private purge cascades feedback receipts');
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
  eq((await restored.query('select count(*)::int as n from hr_private.conversations')).rows[0].n,3,'physical old backup restores all three conversations and old snapshots');
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
