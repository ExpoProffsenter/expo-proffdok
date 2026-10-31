import React from 'react';
import {createRoot} from 'react-dom/client';
import Personal from '../../src/modules/personal/PersonalPage.jsx';
import MarketingEmailPreference from '../../src/modules/app/MarketingEmailPreference.jsx';
import {usePersonalAccess} from '../../src/modules/personal/personalAccess.js';
import {useHrAccess} from '../../src/modules/hr/hrAccess.js';
import {useKshmsAccess} from '../../src/modules/kshms/kshmsAccess.js';
import {WORK_PROFILE_EVENT} from '../../src/modules/access/workProfileClient.js';
import '../../src/style.css';
import '../../src/modules/ui/proffdokWorkspace.css';
import {APP_RUNTIME_STYLES} from '../../src/modules/app/appRuntimeStyles.js';
const runtime=document.createElement('style');runtime.textContent=APP_RUNTIME_STYLES;document.head.appendChild(runtime);

// Actual native components. This fixture replaces transport only, uses no real accounts,
// and marks all examples QA. Scenario controls never ship in the application.
window.qa={company:'qa-firm',actor:'qa-user',empty:false,long:false,denied:false,hr:true,ks:true,hold:false,waiters:[],calls:[],opened:[],updates:[],timeEnabled:new URL(location.href).searchParams.get('time')!=='off',holdTime:false,timeDenied:false,timeReadError:new URL(location.href).searchParams.get('time')==='error',timeWaiters:[],timeReads:0};
const q=()=>window.qa;
const context=()=>({company_id:q().company,user_id:q().actor,company_name:'QA Prøvefirma',personal_page:true,company_hr:q().hr,company_kshms:q().ks,available:true,enabled:true,administer:false,manage:false,role:'reader'});
const title=base=>base+(q().long?' med et langt prosjektnavn, flere leveranser og en sammenhengendeprosjektbetegnelseutenmellomrom':'');
const user=()=>({id:q().actor,email:'qa@example.invalid',user_metadata:{full_name:'QA Medarbeider',mobile:'12345678'}});
const employee=()=>({id:'qa-employee',user_id:q().actor,email:'qa@example.invalid',full_name:'QA Medarbeider',leader_id:'qa-leader',revision:1,readers:[]});
let opted=false,visit=null;
window.client={auth:{getUser:async()=>({data:{user:user()}}),updateUser:async value=>{q().updates.push(value);return {data:{user:{...user(),user_metadata:value.data}}};}},rpc:async(name,args={})=>{
 q().calls.push({name,args});
 if(q().hold&&['get_my_personal_context','get_hr_context','get_kshms_context','project_progress_mine','kshms_progress_mine'].includes(name))await new Promise(resolve=>q().waiters.push(resolve));
 if(q().denied)return {error:{code:'42501',message:'QA Tilgang er trukket tilbake'}};
 const c=context();
 if(['get_my_personal_context','get_hr_context','get_kshms_context'].includes(name))return {data:c};
 if(['project_progress_mine','kshms_progress_mine'].includes(name)){
  const plan={version:2,excludeSundays:true,activities:[{id:'qa-activity',title:'QA Min registrerte oppgave',trade:'Rørlegger',status:'Ikke startet',sessions:[{id:'qa-session',date:'2026-10-29',startTime:'08:00',endTime:'16:00',note:'QA Lang merknad skal vises helt, med hele instruksjonen og siste ord bevart. '+('Ekstra kontrolltekst for smal skjerm. '.repeat(8))+'SLUTTORD'}]}]};
  return {data:{context:c,active_date:'2026-10-29',plans:q().empty?[]:[{id:name,title:title(name==='project_progress_mine'?'QA Prosjektplan':'QA HMS-plan'),reference:'QA-001',address:'QA Prøveadresse',first_date:'2026-10-29',last_date:'2026-11-06'}],record:args.p_id?{id:name,title:title('QA Egen plan'),company_id:c.company_id,revision:1,plan}:null,next:null}};
 }
 if(name==='bolig_my_project_tasks')return {data:{context:c,ks_context:null,count:q().empty?0:1,items:q().empty?[]:[{id:'qa-bolig-task',kind:'progress',root_id:'qa-root',unit_id:'qa-unit',title:title('QA Kontroll av leveranse'),project_title:'QA Boligprosjekt',unit_number:'A101',date_label:'Planlagt ferdig',due_on:'2026-10-29'}],next:null}};
 if(name==='bolig_my_attendance'){
  if(args.p_action==='in')visit={id:'qa-visit',arrived_at:'2026-10-29T08:00:00Z'};
  if(args.p_action==='out')visit=null;
  return {data:{context:c,receipt_id:args.p_payload?.request_id,entries:q().empty?[]:[{id:'qa-presence',revision:1,project:title('QA Boligprosjekt'),name:'QA Medarbeider',company:'QA Prøvefirma',visit}]}};
 }
 if(name==='hr_followup_tasks')return {data:{context:c,tasks:q().empty?[]:[{case_id:'qa-review',kind:'review',task_key:'hr-review',due_on:'2026-10-29'}],next:null,email_enabled:false}};
 if(name==='hr_conversation_feedback_notices')return {data:{context:c,tasks:[],next:null}};
 if(name==='hr_contact_get')return {data:{context:c,registered:true,available:false,editable:false,employee:employee(),revision:1,data:null}};
 if(name==='hr_personal_list'||name==='hr_management_list'||name==='hr_employee_list')return {data:{context:c,content_enabled:false,employees:q().empty?[]:[employee()],next:null}};
 if(name==='hr_employee_get')return {data:{context:c,content_enabled:false,employee:employee()}};
 if(name==='hr_foundation_state')return {data:{context:c,content_enabled:false,settings:{enabled:true,revision:1,purpose:'QA Prøveformål',legal_basis:'QA Prøvegrunnlag',review_on:'2026-12-01'},members:[],next:null}};
 if(name==='hr_template_list')return {data:{context:c,templates:[],next:null}};
 if(name==='hr_purge_status')return {data:{context:c,receipts:[],next:null}};
 if(name==='time_tasks_get'){q().timeReads++;const response=q().timeDenied?{error:{code:'42501',message:'QA Time access revoked'}}:q().timeReadError?{error:{message:'QA network unavailable'}}:{data:{context:c,enabled:q().timeEnabled,missing_week:null,returned_count:0,review_count:0,can_manage:false}};if(q().holdTime)return new Promise(resolve=>q().timeWaiters.push(()=>resolve(response)));return response;}
 if(name==='time_sheet_get')return {data:{context:c,employee:employee(),settings:{enabled:q().timeEnabled,categories:[{id:'qa-work',name:'Arbeid',label:'Arbeid',kind:'work',active:true,unit:'hours'}]},sheet:{id:'qa-sheet',week:args.p_week,revision:1,state:'draft',entries:[]}}};
 if(name==='time_timer_get')return {data:{context:c,timer:null}};
 if(name==='time_projects')return {data:{context:c,projects:[],next:null}};
 if(name==='kshms_get_state')return {data:{context:c,settings:{trades:[],revision:1,responsible_user_id:c.user_id,next_review_on:'2026-12-01'},routines:[],versions:[],members:[],assignments:[],acknowledgments:[],reviews:[]}};
 if(name==='kshms_assignment_reminder_tasks')return {data:{company_id:c.company_id,user_id:c.user_id,groups:[]}};
 if(name==='support_overview')return {data:{user_id:c.user_id,company_id:c.company_id,total:1,unread:q().empty?0:1,latest_unread:q().empty?null:'qa-support'}};
 if(name==='get_my_marketing_email_preference')return {data:{email_opt_in:opted}};
 if(name==='set_my_marketing_email_preference'){opted=args.p_opt_in;return {data:{email_opt_in:opted}};}
 return {error:{message:'QA Unsupported transport: '+name}};
}};
function App(){
 const personal=usePersonalAccess(q().actor),hr=useHrAccess(q().actor,true),ks=useKshmsAccess(q().actor);
 return <div data-expo-app-shell="true"><header className="qa-fixture-header">QA · Min side – faktisk komponent med syntetisk transport</header><main><Personal context={personal} hrContext={hr} kshmsContext={ks} userId={q().actor} authUser={user()} supabaseClient={window.client} onOpenHrSetup={()=>q().opened.push('hr-setup')} onOpenSupport={id=>q().opened.push({support:id})}><MarketingEmailPreference supabaseClient={window.client} authUser={user()}/></Personal></main></div>;
}
const root=createRoot(document.getElementById('app'));
window.configure=patch=>{Object.assign(q(),patch);root.render(<App/>);window.dispatchEvent(new CustomEvent(WORK_PROFILE_EVENT,{detail:{active_company_id:q().company}}));};
window.release=()=>{q().hold=false;q().waiters.splice(0).forEach(resolve=>resolve());};
root.render(<App/>);

window.timeSettings=patch=>{Object.assign(q(),patch);window.dispatchEvent(new CustomEvent('expo:time-settings-updated',{detail:{companyId:q().company}}));};
window.releaseTime=()=>{q().holdTime=false;q().timeWaiters.splice(0).forEach(resolve=>resolve());};
