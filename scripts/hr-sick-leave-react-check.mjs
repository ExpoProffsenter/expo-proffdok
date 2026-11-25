import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
const {JSDOM}=await import(process.env.KSHMS_JSDOM_PATH||'jsdom');
const rootDir=process.cwd(),temp=fs.mkdtempSync(path.join(os.tmpdir(),'hr-conversations-'));
let checks=0;const eq=(a,b,label)=>{assert.deepEqual(a,b,label);checks++;};
const fixture=`
globalThis.__state={actor:'leader',company:'firm',denied:false,hold:false,pending:[],calls:[],pdf:0,cases:{},history:{},employee:{id:'employee',user_id:'self',email:'Medarbeider',leader_id:'leader',revision:1},alerts:[{receipt_id:'receipt',company_id:'firm',employee_id:'employee',user_id:'self',requested_at:'2026-10-11T12:00:00Z',company_name:'Syntetisk firma',purge_state:'complete',email_sent:false,reviewed_at:null}]};
const clone=v=>JSON.parse(JSON.stringify(v));
globalThis.__rpc=async(name,args={})=>{
 const s=__state;s.calls.push({name,args});if(s.hold)await new Promise(resolve=>s.pending.push(resolve));
 if(s.denied)throw Object.assign(Error('Ingen tilgang'),{code:'42501'});
 const context={user_id:s.actor,company_id:s.company,company_name:'Syntetisk firma'};
 if(name==='hr_followup_tasks')return {context,tasks:s.actor==='leader'?[{case_id:'case',employee_id:'employee',task_key:'plan',due_on:'2026-10-11'},{case_id:'case',employee_id:'employee',task_key:'action:x',due_on:'2026-10-12'}]:[],next:null,email_enabled:false};
 const template={title:'Oppfølgingsplan',questions:[{id:'prep',phase:'preparation',topic:'Trivsel',prompt:'Hvordan fungerer arbeidet?',required:true},{id:'meeting',phase:'meeting',topic:'Møtet',prompt:'Hva er avtalt?',required:true}]};
 const project=c=>{const v=clone(c);if(s.actor!=='self'&&!v.shared)v.preparation={};return {context,employee:clone(s.employee),leader_email:'Leder',conversation:v,current_revision:c.revision,historical:false,permissions:{followup:s.actor==='leader'&&c.case_status==='active',reopen:s.actor==='leader'&&c.case_status==='closed',prepare:s.actor==='self'&&c.case_status==='active'&&c.stage==='preparation',meeting:s.actor==='leader'&&c.case_status==='active'&&c.shared&&['meeting','awaiting'].includes(c.stage),comment:['self','leader'].includes(s.actor)&&c.shared&&c.case_status==='active',confirm:['self','leader'].includes(s.actor)&&c.case_status==='active'&&['awaiting','completed'].includes(c.stage)}};};
 if(name==='hr_sick_leave_templates')return {context,templates:[{id:'template',revision:1,title:template.title}]};
 if(name==='hr_sick_leave_list')return {context,employee:clone(s.employee),can_start:s.actor==='leader',conversations:s.company==='firm'?Object.values(s.cases).map(c=>({id:c.id,title:c.template.title,on:c.on,revision:c.revision,stage:c.stage,case_status:c.case_status})):[],next:null};
 if(name==='hr_sick_leave_start'){const id=args.p_conversation_id;s.cases[id]={id,revision:1,content_version:1,template,template_revision:1,type:'sickleave',case_status:'active',absence_mode:args.p_mode,returned_on:'',milestones:Object.fromEntries(['plan','meeting1','activity','meeting2'].map(k=>[k,{status:'open',on:'',note:''}])),sharing:{sykmelder:[],nav:[]},on:args.p_on,stage:'preparation',shared:false,preparation:{},meeting:{},actions:[],next_on:'',comments:{employee:'',leader:''},confirmations:{employee:null,leader:null}};s.history[id]={[1]:clone(s.cases[id])};return project(s.cases[id]);}
 const c=s.cases[args.p_conversation_id];if(!c)throw Error('Ukjent samtale');
 if(name==='hr_sick_leave_get'){const r=project(c);if(args.p_version){r.conversation=clone(s.history[c.id][args.p_version]);r.historical=true;Object.keys(r.permissions).forEach(k=>r.permissions[k]=false);}return r;}
 if(name==='hr_sick_leave_command'){
  if(args.p_revision!==c.revision)throw Object.assign(Error('Konflikt'),{code:'PT409'});const data=args.p_data;
  if(args.p_action==='preparation')c.preparation=data.answers;
  else if(args.p_action==='share'){c.shared=true;c.stage='meeting';}
  else if(args.p_action==='meeting'){c.meeting=data.answers;c.actions=data.actions;c.next_on=data.next_on;}
  else if(args.p_action==='comment')c.comments[s.actor==='self'?'employee':'leader']=data.text;
  else if(args.p_action==='ready')c.stage='awaiting';
  else if(args.p_action==='confirm'){c.confirmations[s.actor==='self'?'employee':'leader']={at:'2026-10-11T12:00:00Z'};if(c.confirmations.employee&&c.confirmations.leader)c.stage='completed';}
  else if(args.p_action==='revise')c.stage='meeting';
  else if(args.p_action==='followup'){Object.assign(c,data);if(c.stage==='completed')c.stage='awaiting';}
  else if(args.p_action==='log_sharing')c.sharing[data.target].push(data);
  else if(args.p_action==='close'){c.case_status='closed';c.returned_on=data.on;}
  else if(args.p_action==='reopen'){c.case_status='active';c.returned_on='';}
  if(!['confirm','log_sharing','close','reopen'].includes(args.p_action))c.confirmations={employee:null,leader:null};c.revision++;s.history[c.id][c.revision]=clone(c);return project(c);
 }throw Error('Unexpected RPC '+name);
};`;
try{
 const entry=path.join(temp,'entry.jsx');
 fs.writeFileSync(entry,`import React,{act} from '${rootDir}/node_modules/react/index.js';import {createRoot} from '${rootDir}/node_modules/react-dom/client.js';import Conversations from '${rootDir}/src/modules/hr/HrSickLeaveCases.jsx';import Tasks from '${rootDir}/src/modules/hr/HrFollowupTasks.jsx';const root=createRoot(document.getElementById('app'));globalThis.__act=act;globalThis.__render=()=>root.render(React.createElement(Conversations,{key:__state.company+':'+__state.actor,context:{company_id:__state.company,user_id:__state.actor,company_name:'Syntetisk firma'},employee:__state.employee}));globalThis.__tasks=()=>root.render(React.createElement(Tasks,{key:__state.company+':'+__state.actor,context:{company_id:__state.company,user_id:__state.actor},onOpen:id=>__state.opened=id}));globalThis.__unmount=()=>root.render(null);`);
 const bundle=await build({root:rootDir,configFile:false,logLevel:'silent',define:{'process.env.NODE_ENV':'"development"'},build:{write:false,minify:false,lib:{entry,formats:['iife'],name:'ConversationsProof',cssFileName:'conversation-proof'}},plugins:[react(),{name:'synthetic-client-and-pdf',enforce:'pre',resolveId(id){if(/appSupabaseClientRegistry\.js$/.test(id))return '\0client';if(/hrSickLeavePdf\.mjs$/.test(id))return '\0pdf';},load(id){if(id==='\0client')return 'export const getAppSupabaseClient=()=>({rpc:async(name,args)=>{try{return {data:await __rpc(name,args)}}catch(error){return {error}}}});';if(id==='\0pdf')return 'export async function downloadSickLeavePdf({isCurrent}){if(isCurrent()){__state.pdf++;return {pages:1}}return null;}';}}]});
 const output=(Array.isArray(bundle)?bundle[0]:bundle).output,code=output.find(f=>f.type==='chunk').code,css=output.filter(f=>f.type==='asset'&&f.fileName.endsWith('.css')).map(f=>f.source).join('\n');
 if(process.env.HR_SICK_LEAVE_BROWSER_DIR){const dir=process.env.HR_SICK_LEAVE_BROWSER_DIR;fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'app.js'),code);fs.writeFileSync(path.join(dir,'app.css'),css);fs.writeFileSync(path.join(dir,'fixture.js'),fixture);fs.writeFileSync(path.join(dir,'index.html'),'<!doctype html><html lang="nb"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="app.css"><style>*{box-sizing:border-box}body{margin:0;font-family:Arial,sans-serif;background:#edf1f6}#app{max-width:960px;margin:auto;padding:16px}button{padding:10px 16px;background:#163d70;color:white;border:0;border-radius:8px;font:inherit}</style><div id="app"></div><script src="fixture.js"></script><script src="app.js"></script><script>__render()</script></html>');}
 const dom=new JSDOM('<div id="app"></div>',{url:'https://example.invalid/hr',runScripts:'outside-only',pretendToBeVisual:true});
 try{
  const w=dom.window;w.IS_REACT_ACT_ENVIRONMENT=true;w.MessageChannel=class{constructor(){this.port1={onmessage:null};this.port2={postMessage:()=>setImmediate(()=>this.port1.onmessage?.())};}};w.confirm=()=>true;
  const scrolled=[];w.HTMLElement.prototype.scrollIntoView=function(){scrolled.push(this.querySelector('h4')?.textContent);};w.eval(fixture);w.eval(code);
  const act=w.__act,buttons=()=>[...w.document.querySelectorAll('button')],button=text=>{const b=buttons().find(b=>b.textContent.trim()===text);assert(b,'Missing '+text);return b;};
  const click=async text=>act(async()=>button(text).click());
  const field=label=>{const f=[...w.document.querySelectorAll('label')].find(l=>l.querySelector('span')?.textContent===label)?.querySelector('input,textarea,select');assert(f,label);return f;};
  const write=async(label,value)=>act(async()=>{const f=field(label);Object.getOwnPropertyDescriptor(f.tagName==='TEXTAREA'?w.HTMLTextAreaElement.prototype:f.tagName==='SELECT'?w.HTMLSelectElement.prototype:w.HTMLInputElement.prototype,'value').set.call(f,value);f.dispatchEvent(new w.Event(f.tagName==='SELECT'?'change':'input',{bubbles:true}));});
  const render=async actor=>act(async()=>{w.__state.actor=actor;w.__render();});
  const open=async()=>act(async()=>buttons().find(b=>b.textContent.startsWith('Oppfølgingsplan ·')).click());
  await render('leader');await act(async()=>w.document.querySelector('summary').click());await write('Sykefraværsmal','template');await click('Opprett oppfølging');
  const cid=Object.keys(w.__state.cases)[0];eq(Boolean(cid),true);eq(scrolled.at(-1),'Forberedelse');eq(field('Hvordan fungerer arbeidet? *').disabled,true,'leader cannot impersonate employee');
  await render('self');await open();await write('Hvordan fungerer arbeidet? *','Privat forberedelse før fanebytte');
  await act(async()=>w.dispatchEvent(new w.Event('focus')));eq(field('Hvordan fungerer arbeidet? *').value,'Privat forberedelse før fanebytte','unsaved survives fresh authorization');
  eq(w.localStorage.length,0);eq(w.sessionStorage.length,0,'real personal data is not written to browser storage');
  await act(async()=>w.__unmount());await render('self');eq(field('Hvordan fungerer arbeidet? *').value,'Privat forberedelse før fanebytte','parent remount restores only after fresh server read');
  await click('Lagre oppfølging');eq(w.__state.cases[cid].preparation.prep,'Privat forberedelse før fanebytte');await click('Del forberedelsen med leder');eq(scrolled.at(-1),'Felles plan');
  await render('leader');eq(w.document.body.textContent.includes('Kladden din er beholdt'),false,'a clean previous snapshot must refresh without a false draft conflict');await open();await write('Hva er avtalt? *','Felles referat');await click('Neste');eq(scrolled.at(-1),'Tiltak');
  await click('Legg til tiltak');await write('Hva skal gjøres?','Følg opp opplæring');await write('Frist','2026-11-20');await write('Neste oppfølging','2026-11-21');await click('Neste');eq(scrolled.at(-1),'Gjennomgang');
  await write('Lederens kommentar','Lederens egen kommentar');await click('Lagre oppfølging');eq(w.__state.cases[cid].meeting.meeting,'Felles referat','save on last tab saves earlier-tab edits too');eq(w.__state.cases[cid].actions.length,1);eq(w.__state.cases[cid].comments.leader,'Lederens egen kommentar');
  await click('Send til begge for gjennomgang');await click('Jeg har lest oppfølgingsplanen');eq(w.__state.cases[cid].stage,'awaiting');
  await render('self');await open();await click('4Gjennomgang');await click('Jeg har lest oppfølgingsplanen');eq(w.__state.cases[cid].stage,'completed');
  const before=w.location.href;await click('Last ned oppfølgingsplan som PDF');eq(w.__state.pdf,1);eq(w.location.href,before);eq(w.document.querySelector('[aria-current=step]').textContent,'4Gjennomgang','PDF retains same case/tab');
  await act(async()=>w.__unmount());await render('self');eq(w.document.querySelector('[aria-current=step]').textContent,'4Gjennomgang');
  await write('Åpne historisk utgave','1');await click('Åpne utgave');eq(w.document.body.textContent.includes('Historisk utgave.'),true);await click('1Forberedelse');eq(field('Hvordan fungerer arbeidet? *').disabled,true);
  await act(async()=>w.__unmount());await render('self');eq(w.document.body.textContent.includes('Historisk utgave.'),true,'historical selection survives parent remount');
  await click('Åpne gjeldende utgave');await click('4Gjennomgang');await write('Medarbeiderens kommentar','Min ulagrede uenighet');w.__state.cases[cid].revision++;
  await act(async()=>w.dispatchEvent(new w.Event('focus')));eq(field('Medarbeiderens kommentar').value,'Min ulagrede uenighet');eq(w.document.body.textContent.includes('Kladden din er beholdt'),true);eq(button('Bruk lagret utgave').disabled,false);
  await click('Bruk lagret utgave');eq(field('Medarbeiderens kommentar').value,'');
  await write('Medarbeiderens kommentar','Private draft must be cleared on denied');w.__state.denied=true;await act(async()=>w.dispatchEvent(new w.Event('focus')));eq(w.document.querySelector('.hrp-step-body'),null);
  w.__state.denied=false;await act(async()=>w.dispatchEvent(new w.Event('focus')));await open();await click('4Gjennomgang');eq(field('Medarbeiderens kommentar').value,'','denial purges volatile draft');
  await act(async()=>{w.__state.company='other';w.__render();});eq(w.document.querySelector('.hrp-step-body'),null,'company boundary never hydrates previous case');eq(w.localStorage.length,0);
  await act(async()=>{w.__state.company='firm';w.__state.actor='leader';w.__render();});await open();await click('5Frister');
  eq(field('Gjeldende fraværstype').disabled,false);await write('Gjeldende fraværstype','partial');
  await write('Oppfølgingsplan – status','done');await write('Oppfølgingsplan – dato for håndtering/vurdering','2026-10-11');await write('Oppfølgingsplan – kort dokumentasjon','Syntetisk plan kontrollert');
  await click('Lagre oppfølging');eq(w.__state.cases[cid].absence_mode,'partial');eq(w.__state.cases[cid].milestones.plan.status,'done');
  await click('6Deling og avslutning');eq(button('Registrer faktisk deling').disabled,true,'no pretend sending without explicit actual sharing');
  const check=async text=>act(async()=>{const box=[...w.document.querySelectorAll('label')].find(l=>l.textContent.includes(text)).querySelector('input[type=checkbox]');assert(box,text);box.click();});
  await check('Jeg bekrefter at denne utgaven faktisk er delt.');await click('Registrer faktisk deling');eq(w.__state.cases[cid].sharing.sykmelder.length,1);eq(w.document.body.textContent.includes('Utgave '),true);
  eq(button('Avslutt oppfølging').disabled,true);await check('Jeg bekrefter at denne oppfølgingen skal avsluttes.');await click('Avslutt oppfølging');eq(w.__state.cases[cid].case_status,'closed');
  await click('5Frister');eq(field('Gjeldende fraværstype').matches(':disabled'),true,'closed followup cannot be edited');await click('6Deling og avslutning');await click('Gjenåpne oppfølging');eq(w.__state.cases[cid].case_status,'active');
  await act(async()=>w.__tasks());eq(w.document.querySelectorAll('.hr-followup-tasks li').length,2);eq(w.document.body.textContent.includes('E-postpåminnelser er ikke aktivert'),true);
  await click('Åpne medarbeider');eq(w.__state.opened,'employee');w.__state.denied=true;await act(async()=>w.dispatchEvent(new w.Event('focus')));eq(w.document.querySelectorAll('.hr-followup-tasks li').length,0,'revocation immediately clears tasks');
  w.__state.denied=false;await act(async()=>{w.__state.actor='self';w.__tasks();});eq(w.document.querySelectorAll('.hr-followup-tasks li').length,0,'no inherited manager task');
  w.__state.hold=true;await act(async()=>w.dispatchEvent(new w.Event('focus')));await act(async()=>w.__unmount());await act(async()=>{w.__state.hold=false;w.__state.pending.splice(0).forEach(r=>r());});eq(w.document.querySelectorAll('article').length,0,'late task response after unmount cannot render');
  console.log(`Actual sick-leave + own tasks React: ${checks} assertions PASS; multi-step save, private draft/focus/remount, individual review, PDF, history, conflict, dates, sharing, closure, scope and revocation.`);
 }finally{dom.window.close();}
}finally{fs.rmSync(temp,{recursive:true,force:true});}
