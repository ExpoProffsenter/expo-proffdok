import assert from 'node:assert/strict';
import fs from 'node:fs';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
import os from 'node:os';
import path from 'node:path';
import {ROUTINE_CATALOG,ACK_STATEMENT} from '../src/modules/kshms/kshmsCatalog.mjs';
const {JSDOM}=await import(process.env.KSHMS_JSDOM_PATH||'jsdom');
const dir=process.cwd(),temporary=fs.mkdtempSync(path.join(os.tmpdir(),'kshms-sources-')),entry=path.join(temporary,'entry.jsx');
try {
 fs.writeFileSync(entry,`import React,{act} from '${dir}/node_modules/react/index.js';import {createRoot} from '${dir}/node_modules/react-dom/client.js';import Module from '${dir}/src/modules/kshms/KshmsModule.jsx';import Overview from '${dir}/src/modules/kshms/KshmsReviewReminder.jsx';const root=createRoot(document.getElementById('app'));globalThis.__act=act;globalThis.__render=(kind,p)=>root.render(React.createElement(kind==='overview'?Overview:Module,p));globalThis.__unmount=()=>root.render(null);`);
 const unrelated=/\/(KshmsDeviations|KshmsChecklistCentral|KshmsExecutions|KshmsSja|KshmsInspectionExtract|KshmsRoutineLibrary|KshmsRoutineSearch|KshmsAcknowledgments|KshmsPersonalHandbook|KshmsDocumentPdfButton)\.jsx$/;
 const bundled=await build({root:dir,configFile:false,logLevel:'silent',define:{'process.env.NODE_ENV':'"development"'},build:{write:false,minify:false,lib:{entry,formats:['iife'],name:'SourceProof',cssFileName:'source-proof'}},plugins:[react(),{name:'transport-and-unrelated-surfaces',enforce:'pre',resolveId(id){if(/kshmsAccess\.js$/.test(id))return '\0rpc';if(/moduleAccessClient\.js$/.test(id))return '\0access';if(unrelated.test(id))return '\0surface';},load(id){if(id==='\0rpc')return 'export const kshmsRpc=(...a)=>globalThis.__rpc(...a);';if(id==='\0access')return 'export const publishManagedAccessChange=()=>{};';if(id==='\0surface')return 'export default function(){return null;}';}}]});
 const dom=new JSDOM('<div id="app"></div>',{url:'https://example.invalid',runScripts:'outside-only',pretendToBeVisual:true});
 try {
  const {window}=dom;window.IS_REACT_ACT_ENVIRONMENT=true;window.structuredClone=structuredClone;window.confirm=()=>true;window.HTMLElement.prototype.scrollIntoView=function(){};
  window.MessageChannel=class{constructor(){this.port1={onmessage:null};this.port2={postMessage:()=>setImmediate(()=>this.port1.onmessage?.())};}};
  const company='11111111-1111-4111-8111-111111111111',user='22222222-2222-4222-8222-222222222222',reader='33333333-3333-4333-8333-333333333333';
  const context={company_id:company,user_id:user,enabled:true,manage:true,publish:true,administer:true,responsible:true};
  const routine={id:'44444444-4444-4444-8444-444444444444',company_id:company,revision:1,archived:false,draft:{title:'QA rutine',chapter:'QA'}};
  const version={id:'55555555-5555-4555-8555-555555555555',routine_id:routine.id,company_id:company,number:1,content:routine.draft,content_hash:'retained-hash'};
  let settings={revision:1,trades:['vvs'],responsible_user_id:user,next_review_on:'2026-10-08'},task={due_on:settings.next_review_on,deadline_status:'overdue'};
  const commands=[];let fail=true,readError=null,pendingRead=null;
  const state=()=>({context,settings,members:[{id:user,email:'qa@example.invalid',workspace_role:'firmaadmin'}],routines:[routine],versions:[version],assignments:[],acknowledgments:[],reviews:[]});
  window.__rpc=async(name,args)=>{
   assert.equal(args.p_company_id,company);
   if(name==='kshms_get_state')return structuredClone(state());
   if(name==='kshms_assignment_reminder_tasks')return {company_id:company,user_id:user,as_of:'2026-10-09',groups:[]};
   if(name==='kshms_review_task'){if(pendingRead)return new Promise(resolve=>pendingRead.push(resolve));if(readError)throw readError;return {company_id:company,user_id:user,as_of:'2026-10-09',task};}
   assert.equal(name,'kshms_command');assert.equal(args.p_action,'review');commands.push(structuredClone(args));
   if(fail){fail=false;throw Error('Synthetic save failure');}settings={...settings,revision:2,next_review_on:args.p_payload.next_review_on};task=null;return {id:'signed-review'};
  };
  window.eval((Array.isArray(bundled)?bundled[0]:bundled).output.find(x=>x.type==='chunk').code);const act=window.__act;
  const button=text=>{const found=[...window.document.querySelectorAll('button')].find(x=>x.textContent.trim()===text);assert(found,'Missing button '+text);return found;};
  const click=async text=>act(async()=>button(text).click());
  const input=label=>{const found=[...window.document.querySelectorAll('label')].find(x=>x.querySelector('span')?.textContent===label);assert(found,'Missing field '+label);return found.querySelector('input,textarea');};
  const write=async(label,value)=>{const field=input(label);await act(async()=>{Object.getOwnPropertyDescriptor(field.tagName==='TEXTAREA'?window.HTMLTextAreaElement.prototype:window.HTMLInputElement.prototype,'value').set.call(field,value);field.dispatchEvent(new window.Event('input',{bubbles:true}));field.dispatchEvent(new window.Event('change',{bubbles:true}));});};
  await act(async()=>window.__render('module',{context}));assert(window.document.querySelector('[aria-label="Din håndbokrevisjon"]'));
  await click('Åpne håndbokrevisjon');let details=[...window.document.querySelectorAll('details')].find(x=>x.querySelector('summary')?.textContent==='Gjennomfør revisjon');assert(details.open);assert.equal(window.document.activeElement,details);assert.equal(commands.length,0);assert(button('Signer revisjon').disabled);
  await write('Hva har du kontrollert?','Kontrollert egne rutiner og gjennomgang.');await write('Hva skal gjøres videre?','Følg opp arbeidslederens kontroll neste måned.');await write('Neste revisjonsdato (innen ett år)','2027-09-01');
  await click('Håndbok');await click('Åpne håndbokrevisjon');assert.equal(input('Hva har du kontrollert?').value,'Kontrollert egne rutiner og gjennomgang.');assert.equal(input('Neste revisjonsdato (innen ett år)').value,'2027-09-01');assert.equal(commands.length,0);
  const checkbox=[...window.document.querySelectorAll('input[type="checkbox"]')].find(x=>x.parentElement.textContent.includes('Jeg har vurdert de oppførte'));
  await act(async()=>checkbox.click());assert(!button('Signer revisjon').disabled);
  await act(async()=>details=button('Signer revisjon').closest('form'));await act(async()=>details.dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true})));
  assert(window.document.body.textContent.includes('Synthetic save failure'));assert.equal(input('Hva har du kontrollert?').value,'Kontrollert egne rutiner og gjennomgang.');assert(window.document.querySelector('[aria-label="Din håndbokrevisjon"]'));
  await act(async()=>details.dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true})));
  assert.equal(commands.length,2);assert.equal(commands[1].p_payload.settings_revision,1);assert.deepEqual(JSON.parse(JSON.stringify(commands[1].p_payload.version_snapshot)),[{id:version.id,hash:'retained-hash'}]);assert.equal(window.document.querySelector('[aria-label="Din håndbokrevisjon"]'),null);assert.equal(input('Hva har du kontrollert?').value,'');assert(button('Signer revisjon').disabled);
  await act(async()=>window.__unmount());task={due_on:'2026-10-09',deadline_status:'today'};
  const props={context,settingsRevision:1,onOpen:()=>commands.push('open')};await act(async()=>window.__render('overview',props));assert(window.document.body.textContent.includes('revideres i dag'));
  readError=Error('offline');await act(async()=>window.dispatchEvent(new window.Event('focus')));assert(button('Åpne håndbokrevisjon'));assert(window.document.body.textContent.includes('Sist bekreftede oppgave er beholdt'));
  readError=Object.assign(Error('revoked'),{code:'42501'});await act(async()=>window.dispatchEvent(new window.Event('focus')));assert(![...window.document.querySelectorAll('button')].some(x=>x.textContent==='Åpne håndbokrevisjon'));
  readError=null;pendingRead=[];await act(async()=>window.dispatchEvent(new window.Event('focus')));assert.equal(pendingRead.length,1);
  await act(async()=>window.__render('overview',{...props,context:{...context,company_id:'foreign'}}));
  await act(async()=>pendingRead[0]({company_id:company,user_id:user,as_of:'2026-10-09',task}));assert(!window.document.body.textContent.includes('revideres i dag'),'Late old-company task revived');
  await act(async()=>window.__unmount());pendingRead=null;
  for(const patch of [{responsible:false},{enabled:false},{manage:false}]){await act(async()=>window.__render('overview',{...props,context:{...context,...patch}}));assert.equal(window.document.querySelector('[aria-label="Din håndbokrevisjon"]'),null);await act(async()=>window.__unmount());}
 } finally {dom.window.close();}
} finally {fs.rmSync(temporary,{recursive:true,force:true});}
console.log('Real React review reminders: PASS — open/focus existing form, no auto-sign, retained text across tabs/reopen, failed-save recovery, signed revision clears task, offline retention, revocation and late-company fence.');
