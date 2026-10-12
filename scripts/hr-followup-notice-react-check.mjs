import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
import {checkFollowupTasks,followupStep,followupVisible} from '../src/modules/hr/hrFollowupNotice.mjs';
const {JSDOM}=await import(process.env.KSHMS_JSDOM_PATH||'jsdom');
let checks=0;const eq=(a,b,label)=>{assert.deepEqual(a,b,label);checks++;};
for(const value of [null,{}, {context:{company_id:'other',user_id:'self'},tasks:[]}]){assert.throws(()=>checkFollowupTasks(value,'firm','self'));checks++;}
eq(followupStep({kind:'conversation',task_key:'preparation'}),0);eq(followupStep({kind:'conversation',task_key:'action:a'}),2);eq(followupStep({kind:'sickleave',task_key:'plan'}),1);eq(followupStep({kind:'sickleave',task_key:'meeting1'}),4);
const review={task_key:'hr-review',due_on:'2027-10-11'};
eq(followupVisible(review,'2026-10-12'),false,'a review next year is not a current notification');eq(followupVisible(review,'2027-09-10'),false,'31 days is too early');eq(followupVisible(review,'2027-09-11'),true,'30-calendar-day boundary');eq(followupVisible(review,'2027-10-11'),true);eq(followupVisible(review,'2027-10-12'),true,'overdue remains visible');eq(followupVisible({...review,due_on:'2026-11-24'},'2026-10-25'),true,'Oslo daylight-saving transition uses calendar days');eq(followupVisible({task_key:'preparation',due_on:'2027-10-11'},'2026-10-12'),true,'invitation remains immediate');eq(followupVisible({task_key:'plan',due_on:'2027-10-11'},'2026-10-12'),true,'work plans remain available for early preparation');
const dir=process.cwd(),temp=fs.mkdtempSync(path.join(os.tmpdir(),'hr-notice-')),entry=path.join(temp,'entry.jsx');
try{
 fs.writeFileSync(entry,`import React,{act} from '${dir}/node_modules/react/index.js';import {createRoot} from '${dir}/node_modules/react-dom/client.js';import Notice from '${dir}/src/modules/hr/HrFollowupNotice.jsx';import Page from '${dir}/src/modules/personal/PersonalPage.jsx';const root=createRoot(document.getElementById('app'));globalThis.__act=act;globalThis.__render=(context,kind='notice')=>root.render(kind==='page'?React.createElement(Page,{context:context?{...context,personal_page:true,company_hr:true}:null,hrContext:context,userId:__state.actor,authUser:{id:__state.actor,user_metadata:{full_name:'Syntetisk medarbeider'}},supabaseClient:__client}):React.createElement(Notice,{context,userId:__state.actor,onSetup:()=>__state.setup++}));globalThis.__unmount=()=>root.render(null);`);
 const bundle=await build({root:dir,configFile:false,logLevel:'silent',define:{'process.env.NODE_ENV':'"development"'},build:{write:false,minify:false,lib:{entry,formats:['iife'],name:'NoticeProof',cssFileName:'notice-proof'}},plugins:[react(),{name:'notice-transport',enforce:'pre',resolveId(id){if(id.endsWith('appSupabaseClientRegistry.js'))return '\0client';},load(id){if(id==='\0client')return 'export const getAppSupabaseClient=()=>globalThis.__client;';}}]});
 const dom=new JSDOM('<div id="app"></div>',{url:'https://example.invalid',runScripts:'outside-only',pretendToBeVisual:true});
 try{
  const w=dom.window,d=w.document;w.IS_REACT_ACT_ENVIRONMENT=true;w.HTMLElement.prototype.scrollIntoView=function(){};w.confirm=()=>true;
  w.MessageChannel=class{constructor(){this.port1={onmessage:null};this.port2={postMessage:()=>setImmediate(()=>this.port1.onmessage?.())};}};
  const clone=v=>JSON.parse(JSON.stringify(v));
  const state=w.__state={actor:'self',company:'firm',setup:0,denied:false,wrongEmployee:false,pending:null,tasks:[],feedback:[],feedbackMore:false,ackHold:null,calls:[]};
  const context=()=>({company_id:state.company,user_id:state.actor,company_name:'Syntetisk firma',available:true,enabled:true});
  const employee={id:'employee',user_id:'self',email:'synthetic@example.invalid',leader_id:'leader',revision:1};
  const make=(id,type='conversation')=>({id,type,revision:1,content_version:1,template_revision:1,template:{title:'Syntetisk '+id,questions:[{id:'q',phase:'preparation',topic:'Arbeid',prompt:'Syntetisk spørsmål',required:true}]},on:'2026-10-13',meeting_time:'13:30',meeting_location:'Sted A',stage:'preparation',shared:false,preparation:{},meeting:{},actions:[],next_on:'',comments:{employee:'',leader:''},confirmations:{employee:null,leader:null},case_status:'active',absence_mode:'full',returned_on:'',sharing:{sykmelder:[],nav:[]},milestones:{plan:{status:'open',on:'',note:''},meeting1:{status:'open',on:'',note:''},activity:{status:'open',on:'',note:''},meeting2:{status:'open',on:'',note:''}}});
  const cases={a:make('a'),b:make('b'),sick:make('sick','sickleave')};
  const task=(case_id,task_key,kind='conversation')=>({case_id,employee_id:'employee',task_key,due_on:'2026-10-13',kind});
  const invitation=task('a','preparation'),action=task('b','action:one'),sick=task('sick','plan','sickleave');
  const project=id=>({context:state.wrongEmployee?{...context(),user_id:'other'}:context(),employee:clone(employee),current_revision:cases[id].revision,historical:false,leader_email:'synthetic-leader@example.invalid',conversation:clone(cases[id]),permissions:{prepare:state.actor==='self',meeting:state.actor==='leader',comment:true,confirm:false,followup:state.actor==='leader',reopen:false}});
  w.__client={auth:{getUser:async()=>({data:{user:{id:state.actor,user_metadata:{full_name:'Syntetisk'}}}})},rpc:async(name,args)=>{
   state.calls.push({name,args:clone(args)});if(state.denied)return {error:{code:'42501',message:'Tilgang avslått'}};
   if(name==='hr_conversation_feedback_notices')return {data:{context:context(),tasks:clone(args.p_after?state.feedbackPage||[]:state.feedback),next:state.feedbackMore&&!args.p_after?'b':null}};
   if(name==='hr_conversation_feedback_handle'){
    if(state.ackHold)return new Promise(resolve=>state.ackHold.resolve=resolve);
    state.feedback=state.feedback.filter(t=>t.case_id!==args.p_conversation_id||t.feedback_revision!==args.p_feedback_revision);
    return {data:{context:context(),employee_id:'employee',conversation_id:args.p_conversation_id,feedback_revision:args.p_feedback_revision,handled:true}};
   }
   if(name==='hr_followup_tasks'){
    if(state.pending)return new Promise(resolve=>state.pending.resolve=resolve);
    const tasks=args.p_after?[task('sick','meeting1','sickleave')]:clone(state.tasks);return {data:{context:context(),tasks,next:state.more&&!args.p_after?{due_on:'2026-10-13',case_id:'sick',task_key:'plan'}:null,email_enabled:false}};
   }
   if(name==='hr_employee_get')return {data:{context:state.wrongEmployee?{...context(),user_id:'other'}:context(),employee:clone(employee)}};
   if(name==='hr_conversation_list'||name==='hr_sick_leave_list')return {data:{context:context(),employee:clone(employee),can_start:false,conversations:[{id:name==='hr_conversation_list'?'b':'sick',title:'Syntetisk',on:'2026-10-13',stage:'preparation',revision:1}],next:null}};
   if(name==='hr_conversation_get'||name==='hr_sick_leave_get')return {data:project(args.p_conversation_id)};
   if(name==='hr_conversation_invitation_status')return {data:{context:context(),employee:{id:'employee'},conversation_id:args.p_conversation_id,app_notification:true,email_status:'sent',can_notify:false,location_required:false}};
   if(name==='hr_conversation_command'){
    assert.equal(args.p_action,'preparation');const c=cases[args.p_conversation_id];assert.equal(args.p_revision,c.revision);c.preparation=clone(args.p_data.answers);c.revision++;return {data:project(c.id)};
   }
   throw Error('Unexpected RPC '+name);
  }};
  w.eval((Array.isArray(bundle)?bundle[0]:bundle).output.find(f=>f.type==='chunk').code);
  const act=w.__act,render=async(ctx=context(),kind='notice')=>act(async()=>w.__render(ctx,kind));
  const button=text=>{const b=[...d.querySelectorAll('button')].find(b=>b.textContent.trim()===text||b.closest('.hrp-steps')&&b.textContent.trim().endsWith(text));assert(b,'Missing '+text+'\n'+d.body.textContent);return b;};
  const click=async text=>act(async()=>{button(text).click();await new Promise(r=>setTimeout(r,10));});
  const field=()=>d.querySelector('.hrp-step-body textarea');
  const write=async value=>act(async()=>{Object.getOwnPropertyDescriptor(w.HTMLTextAreaElement.prototype,'value').set.call(field(),value);field().dispatchEvent(new w.Event('input',{bubbles:true}));});
  const focus=async()=>act(async()=>{w.dispatchEvent(new w.Event('focus'));await new Promise(r=>setTimeout(r,10));});
  await render(null);eq(d.querySelector('.hr-followup-notice'),null);eq(state.calls.length,0,'no scope means no RPC');
  await render();eq(d.querySelector('.hr-followup-notice'),null,'empty tasks do not invent notification');
  state.tasks=[invitation];await focus();eq(d.querySelectorAll('.hr-followup-notice li').length,1);eq(d.body.textContent.includes('13.10.2026 · kl. 13:30'),true);eq(d.body.textContent.includes('Sted: Sted A'),true);eq(d.body.textContent.includes('Forberedelsen er ikke levert'),true);
  await click('Åpne samtalen');eq(d.querySelector('[role=dialog]')?.getAttribute('aria-modal'),'true');eq(d.querySelector('.hrp-step-body h4')?.textContent,'Forberedelse');eq(d.querySelector('.hrp-toolbar')!==null,true);eq(state.calls.filter(x=>x.name==='hr_employee_get').length>=2,true,'direct opening freshly authorizes employee twice');eq(d.body.textContent.includes('Syntetisk a'),true,'exact invited case opens even outside first list page');
  await write('Ulagret svar');await render(null);eq(d.querySelector('[role=dialog]'),null,'access refresh hides private content');await render();eq(field().value,'Ulagret svar','same-scope fresh reauthorization restores draft');
  await click('Tiltak');await focus();eq(d.querySelector('.hrp-step-body h4').textContent,'Tiltak','foreground refresh respects chosen step');await click('Forberedelse');eq(field().value,'Ulagret svar');
  await click('Lagre samtale');eq(cases.a.preparation.q,'Ulagret svar');eq(button('Lagre samtale').disabled,true,'direct editor retains existing confirmed save');
  await write('Behold ny kladd');await act(async()=>d.querySelector('[aria-label="Lukk oppfølgingen"]').click());eq(d.querySelector('[role=dialog]'),null);await focus();eq(d.querySelector('[role=dialog]'),null,'explicit close cannot be reversed by polling/focus');
  state.tasks=[action];await focus();await click('Åpne samtalen');eq(field().value,'Behold ny kladd','different requested case cannot erase old dirty draft');eq(d.body.textContent.includes('Åpne valgt samtale'),true);w.confirm=()=>false;await click('Åpne valgt samtale');eq(field().value,'Behold ny kladd','cancel preserves old dirty draft');await act(async()=>d.querySelector('[aria-label="Lukk oppfølgingen"]').click());
  state.tasks=[invitation];await focus();state.tasks=[];await click('Åpne samtalen');eq(d.querySelector('[role=dialog]'),null,'stale/finished task cannot open');eq(d.body.textContent.includes('Oppgaven er endret eller ferdig'),true);state.tasks=[invitation];await click('Oppdater varsler');eq(d.querySelectorAll('.hr-followup-notice li').length,1);
  state.wrongEmployee=true;await click('Åpne samtalen');eq(d.querySelector('[role=dialog]'),null,'wrong-actor detail rejected');state.wrongEmployee=false;await click('Oppdater varsler');
  cases.a.shared=true;cases.a.meeting_location='Sted B';cases.a.meeting_time='14:15';await focus();eq(d.body.textContent.includes('Forberedelsen er delt med leder'),true);eq(d.body.textContent.includes('kl. 14:15'),true);eq(d.body.textContent.includes('Sted: Sted B'),true);
  await act(async()=>w.__unmount());state.actor='leader';state.tasks=[sick];await render();await click('Åpne oppfølgingen');eq(d.querySelector('.hrp-step-body h4').textContent,'Felles plan','leader task opens correct sick-leave step');eq(d.querySelector('.hr-sick-case')!==null,true);await act(async()=>d.querySelector('[aria-label="Lukk oppfølgingen"]').click());
  state.tasks=[{case_id:'firm',employee_id:null,task_key:'hr-review',due_on:'2027-10-11',kind:'review'}];await focus();eq(d.querySelector('.hr-followup-notice'),null,'actual screenshot review one year away no longer creates a banner');
  state.tasks=[{case_id:'firm',employee_id:null,task_key:'hr-review',due_on:'2026-10-13',kind:'review'}];await focus();await click('Åpne HR-oppsett');eq(state.setup,1,'review routes to setup without employee RPC');
  state.tasks=[sick];state.more=true;await focus();await click('Hent flere oppfølginger');eq(d.querySelectorAll('.hr-followup-notice li').length,2);eq(state.calls.filter(x=>x.name==='hr_followup_tasks').at(-1).args.p_after.task_key,'plan','pagination carries server cursor');await act(async()=>d.querySelectorAll('.hr-followup-notice li button')[1].click());await act(async()=>new Promise(r=>setTimeout(r,10)));eq(d.querySelector('.hrp-step-body h4').textContent,'Frister','second-page task revalidates its cursor and opens correct step on a previously opened case');await act(async()=>d.querySelector('[aria-label="Lukk oppfølgingen"]').click());state.more=false;
  state.denied=true;await focus();eq(d.querySelectorAll('.hr-followup-notice li').length,0);eq(d.querySelector('[role=dialog]'),null);state.denied=false;
  state.pending={};await act(async()=>w.dispatchEvent(new w.Event('focus')));const late=state.pending.resolve;eq(typeof late,'function');await render(null);state.pending=null;await act(async()=>late({data:{context:context(),tasks:[invitation],next:null}}));eq(d.querySelector('.hr-followup-notice'),null,'late response cannot revive closed scope');
  await render();state.company='other-firm';state.tasks=[];await render();eq(d.querySelector('[role=dialog]'),null);eq(d.querySelector('.hr-followup-notice'),null,'new firm never inherits old tasks');
  await act(async()=>w.__unmount());state.company='firm';state.actor='leader';state.tasks=[];
  cases.b.shared=true;cases.b.stage='meeting';cases.b.employee_feedback_revision=7;cases.b.revision=7;cases.b.preparation.q='Private shared answer';cases.b.comments.employee='Private shared comment';
  const feedbackTask=()=>({...task('b','employee-feedback'),feedback_revision:cases.b.employee_feedback_revision});
  state.feedback=[feedbackTask()];await render();
  eq(d.body.textContent.includes('Nytt innspill til medarbeidersamtalen'),true);eq(d.querySelector('.hr-followup-notice').textContent.includes('Private shared'),false,'card never exposes private answers/comments');
  const ackCount=()=>state.calls.filter(x=>x.name==='hr_conversation_feedback_handle').length;
  eq(ackCount(),0,'reading does not handle');await click('Åpne samtalen');eq(d.body.textContent.includes('Syntetisk b'),true);eq(d.querySelector('.hrp-step-body h4').textContent,'Referat');eq(d.querySelector('.hrp-step-body textarea').value,'Private shared comment');eq(ackCount(),0,'opening does not acknowledge or dispatch mail');
  eq(Boolean(button('Marker innspillet som håndtert')),true);
  cases.b.employee_feedback_revision=8;cases.b.revision=8;state.feedback=[feedbackTask()];await click('Marker innspillet som håndtert');eq(ackCount(),0,'old input cannot handle a newer comment');eq(d.body.textContent.includes('Innspillet eller tilgangen er endret'),true);
  await act(async()=>d.querySelector('[aria-label="Lukk oppfølgingen"]').click());await focus();await click('Åpne samtalen');
  const revisionBefore=cases.b.revision;await click('Marker innspillet som håndtert');eq(ackCount(),1);eq(state.calls.filter(x=>x.name==='hr_conversation_feedback_handle').at(-1).args.p_feedback_revision,8);eq(cases.b.revision,revisionBefore,'handling does not mutate conversation revision');eq(d.querySelector('.hr-followup-notice'),null,'handled input leaves card');eq(d.querySelector('[role=dialog]')!==null,true,'handling retains open conversation');
  await act(async()=>d.querySelector('[aria-label="Lukk oppfølgingen"]').click());await focus();eq(d.querySelector('.hr-followup-notice'),null,'handling persists across refresh');
  cases.b.employee_feedback_revision=9;cases.b.revision=9;cases.b.comments.employee='Later comment';state.feedback=[feedbackTask()];await focus();eq(d.querySelectorAll('.hr-followup-notice li').length,1,'later comment alerts again');await click('Åpne samtalen');eq(d.querySelector('.hrp-step-body textarea').value,'Later comment');
  state.wrongEmployee=true;await click('Marker innspillet som håndtert');eq(ackCount(),1,'fresh wrong-actor case cannot acknowledge');state.wrongEmployee=false;
  state.denied=true;await click('Marker innspillet som håndtert');eq(d.querySelector('[role=dialog]'),null,'denial during fresh handling immediately hides private editor');state.denied=false;await focus();await click('Åpne samtalen');
  state.ackHold={};await act(async()=>button('Marker innspillet som håndtert').click());await act(async()=>new Promise(r=>setTimeout(r,10)));const lateAck=state.ackHold.resolve;eq(typeof lateAck,'function');
  state.denied=true;await focus();eq(d.querySelector('[role=dialog]'),null);eq(d.querySelector('[aria-label="Håndtering av medarbeiderinnspill"]'),null,'revocation removes acknowledgement surface');state.denied=false;
  await act(async()=>lateAck({data:{context:context(),employee_id:'employee',conversation_id:'b',feedback_revision:9,handled:true}}));eq(d.querySelector('[role=dialog]'),null,'late acknowledgement cannot restore revoked content');state.ackHold=null;
  state.feedbackMore=true;state.feedbackPage=[{...feedbackTask(),case_id:'a'}];await focus();await click('Hent flere oppfølginger');eq(d.querySelectorAll('.hr-followup-notice li').length,2,'feedback pagination retains both pages');eq(state.calls.filter(x=>x.name==='hr_conversation_feedback_notices').at(-1).args.p_after,'b','feedback carries its own cursor');eq([...d.querySelectorAll('button')].some(b=>b.textContent==='Hent flere oppfølginger'),false,'exhausted feedback does not restart deadline pagination');state.feedbackMore=false;state.feedbackPage=[];
  state.feedback=[];
  await act(async()=>w.__unmount());state.company='firm';state.actor='self';state.tasks=[invitation];await render(context(),'page');eq(d.querySelector('.hr-followup-notice').compareDocumentPosition(d.querySelector('.personal-tabs'))&w.Node.DOCUMENT_POSITION_FOLLOWING,4,'notice sits above page tabs/profile');eq(d.body.textContent.includes('Kommer'),false);eq(d.body.textContent.includes('ikke åpnet ennå'),false);
  eq(w.localStorage.length,0);eq(w.sessionStorage.length,0);eq(state.calls.every(x=>!x.name.includes('notify')&&!x.name.includes('worker')&&!x.name.includes('start')),true,'notice never creates case or dispatches mail');
  state.pending={};await act(async()=>w.dispatchEvent(new w.Event('focus')));const disposed=state.pending.resolve;await act(async()=>w.__unmount());state.pending=null;await act(async()=>disposed({data:{context:context(),tasks:[invitation],next:null}}));eq(d.querySelector('.hr-followup-notice'),null,'late unmount cannot restore notification');
  console.log('Actual HR notice/direct-case/Min side React: '+checks+' assertions PASS; fresh scope, metadata, direct exact case/save/steps, retained draft, canceled switch, stale task, old actor/firm/denial/late unmount, pagination and no mail. Synthetic transport.');
 }finally{dom.window.close();}
}finally{fs.rmSync(temp,{recursive:true,force:true});}
