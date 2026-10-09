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
 fs.writeFileSync(entry,`import React,{act} from '${dir}/node_modules/react/index.js';import {createRoot} from '${dir}/node_modules/react-dom/client.js';import Module from '${dir}/src/modules/kshms/KshmsModule.jsx';import Overview from '${dir}/src/modules/kshms/KshmsAssignmentReminders.jsx';const root=createRoot(document.getElementById('app'));globalThis.__act=act;globalThis.__render=(kind,p)=>root.render(React.createElement(kind==='overview'?Overview:Module,p));globalThis.__unmount=()=>root.render(null);`);
 const unrelated=/\/(KshmsDeviations|KshmsChecklistCentral|KshmsExecutions|KshmsSja|KshmsInspectionExtract|KshmsRoutineLibrary|KshmsRoutineSearch|KshmsAcknowledgments|KshmsPersonalHandbook|KshmsDocumentPdfButton)\.jsx$/;
 const bundled=await build({root:dir,configFile:false,logLevel:'silent',define:{'process.env.NODE_ENV':'"development"'},build:{write:false,minify:false,lib:{entry,formats:['iife'],name:'SourceProof',cssFileName:'source-proof'}},plugins:[react(),{name:'transport-and-unrelated-surfaces',enforce:'pre',resolveId(id){if(/kshmsAccess\.js$/.test(id))return '\0rpc';if(/moduleAccessClient\.js$/.test(id))return '\0access';if(unrelated.test(id))return '\0surface';},load(id){if(id==='\0rpc')return 'export const kshmsRpc=(...a)=>globalThis.__rpc(...a);';if(id==='\0access')return 'export const publishManagedAccessChange=()=>{};';if(id==='\0surface')return 'export default function(){return null;}';}}]});
 const dom=new JSDOM('<div id="app"></div>',{url:'https://example.invalid',runScripts:'outside-only',pretendToBeVisual:true});
 try {
  const {window}=dom;window.IS_REACT_ACT_ENVIRONMENT=true;window.structuredClone=structuredClone;window.confirm=()=>true;window.HTMLElement.prototype.scrollIntoView=function(){};
  window.MessageChannel=class{constructor(){this.port1={onmessage:null};this.port2={postMessage:()=>setImmediate(()=>this.port1.onmessage?.())};}};
  const company='11111111-1111-4111-8111-111111111111',user='22222222-2222-4222-8222-222222222222',reader='33333333-3333-4333-8333-333333333333';
  const context={company_id:company,user_id:user,enabled:true,manage:true,publish:true,administer:true,responsible:true};
  const groups=[{kind:'round',count:1},{kind:'risk',count:2},{kind:'sja',count:1},{kind:'reading',count:3}];
  let offered=groups,readError=null,pending=null;const writes=[],opens=[];
  window.__rpc=async(name,args)=>{
   assert.equal(args.p_company_id,company);
   if(name==='kshms_get_state')return {context,settings:{revision:1,trades:['vvs'],responsible_user_id:user,next_review_on:'2027-09-01'},routines:[],versions:[],assignments:[],acknowledgments:[],reviews:[],members:[]};
   if(name==='kshms_review_task')return {company_id:company,user_id:user,as_of:'2026-10-09',task:null};
   if(name==='kshms_assignment_reminder_tasks'){if(pending)return new Promise(resolve=>pending.push(resolve));if(readError)throw readError;return {company_id:company,user_id:user,as_of:'2026-10-09',groups:offered};}
   writes.push(name);throw Error('No write allowed from reminder');
  };
  window.eval((Array.isArray(bundled)?bundled[0]:bundled).output.find(x=>x.type==='chunk').code);const act=window.__act;
  const button=text=>{const found=[...window.document.querySelectorAll('button')].find(x=>x.textContent.trim()===text);assert(found,'Missing button '+text);return found;};
  const click=async text=>act(async()=>button(text).click());
  const props={context,refreshKey:0,onOpen:screen=>opens.push(screen)};
  await act(async()=>window.__render('overview',props));assert(window.document.querySelector('[aria-label="Dine oppgaver til oppfølging"]'));
  for(const label of ['Åpne Vernerunder/kontroller (1)','Åpne Risikovurdering (2)','Åpne SJA (1)','Åpne Les og bekreft (3)'])await click(label);
  assert.deepEqual(opens,['rounds','risk','sja','reading']);assert.equal(writes.length,0,'Opening generated a mutation');
  await act(async()=>window.__render('overview',{...props,busy:true}));assert(button('Åpne SJA (1)').disabled);
  await act(async()=>window.__render('overview',props));readError=Error('offline');await act(async()=>window.dispatchEvent(new window.Event('focus')));assert(button('Åpne SJA (1)'));assert(window.document.body.textContent.includes('Sist bekreftede oppgaver er beholdt'));
  readError=Object.assign(Error('revoked'),{code:'42501'});await act(async()=>window.dispatchEvent(new window.Event('focus')));assert(!window.document.body.textContent.includes('Åpne SJA (1)'));
  readError=null;offered=[];await click('Prøv igjen');assert.equal(window.document.querySelector('[aria-label="Dine oppgaver til oppfølging"]'),null);
  offered=groups;await act(async()=>window.dispatchEvent(new window.Event('focus')));pending=[];await act(async()=>window.dispatchEvent(new window.Event('focus')));
  await act(async()=>window.__render('overview',{...props,context:{...context,company_id:'foreign'}}));await act(async()=>pending[0]({company_id:company,user_id:user,as_of:'2026-10-09',groups}));assert(!window.document.body.textContent.includes('Åpne SJA (1)'));
  await act(async()=>window.__unmount());pending=null;await act(async()=>window.__render('overview',{...props,context:{...context,enabled:false}}));assert.equal(window.document.querySelector('[aria-label="Dine oppgaver til oppfølging"]'),null);await act(async()=>window.__unmount());
  // Verify the actual parent integration, not only callback mappings.
  await act(async()=>window.__render('module',{context}));await click('Åpne SJA (1)');assert.equal(button('SJA').getAttribute('aria-pressed'),'true');await click('Åpne Les og bekreft (3)');assert.equal(button('Les og bekreft (0)').getAttribute('aria-pressed'),'true');assert.equal(writes.length,0);
  await act(async()=>window.__unmount());
 } finally {dom.window.close();}
} finally {fs.rmSync(temporary,{recursive:true,force:true});}
console.log('Real React task reminders: PASS — four existing destinations, no automatic writes/signing, busy guard, offline retention, completed-task refresh, revocation, late company and actual parent tabs.');
