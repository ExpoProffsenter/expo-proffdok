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
 fs.writeFileSync(entry,`import React,{act} from '${dir}/node_modules/react/index.js';import {createRoot} from '${dir}/node_modules/react-dom/client.js';import Module from '${dir}/src/modules/kshms/KshmsModule.jsx';import Overview from '${dir}/src/modules/kshms/KshmsSourceUpdates.jsx';const root=createRoot(document.getElementById('app'));globalThis.__act=act;globalThis.__render=(kind,p)=>root.render(React.createElement(kind==='overview'?Overview:Module,p));globalThis.__unmount=()=>root.render(null);`);
 const unrelated=/\/(KshmsDeviations|KshmsChecklistCentral|KshmsExecutions|KshmsSja|KshmsInspectionExtract|KshmsRoutineLibrary|KshmsRoutineSearch|KshmsAcknowledgments|KshmsPersonalHandbook|KshmsDocumentPdfButton)\.jsx$/;
 const bundled=await build({root:dir,configFile:false,logLevel:'silent',define:{'process.env.NODE_ENV':'"development"'},build:{write:false,minify:false,lib:{entry,formats:['iife'],name:'SourceProof',cssFileName:'source-proof'}},plugins:[react(),{name:'transport-and-unrelated-surfaces',enforce:'pre',resolveId(id){if(/kshmsAccess\.js$/.test(id))return '\0rpc';if(/moduleAccessClient\.js$/.test(id))return '\0access';if(unrelated.test(id))return '\0surface';},load(id){if(id==='\0rpc')return 'export const kshmsRpc=(...a)=>globalThis.__rpc(...a);';if(id==='\0access')return 'export const publishManagedAccessChange=()=>{};';if(id==='\0surface')return 'export default function(){return null;}';}}]});
 const dom=new JSDOM('<div id="app"></div>',{url:'https://example.invalid',runScripts:'outside-only',pretendToBeVisual:true});
 try {
  const {window}=dom;window.IS_REACT_ACT_ENVIRONMENT=true;window.structuredClone=structuredClone;window.confirm=()=>true;window.HTMLElement.prototype.scrollIntoView=function(){};
  window.MessageChannel=class{constructor(){this.port1={onmessage:null};this.port2={postMessage:()=>setImmediate(()=>this.port1.onmessage?.())};}};
  const company='11111111-1111-4111-8111-111111111111',user='22222222-2222-4222-8222-222222222222',reader='33333333-3333-4333-8333-333333333333';
  const context={company_id:company,user_id:user,enabled:true,manage:true,publish:true,administer:true,responsible:true};
  const proposal=ROUTINE_CATALOG.find(row=>row.key==='leadership');assert(proposal.source_revision>1);
  const draft={...structuredClone(proposal),source_revision:1,title:'Firmaets lederansvar',chapter:'Firmaets eget kapittel',goal:'Firmaets mål',procedure:'Firmaets egne arbeidssteg',references:[{title:'Firmaets kilde',url:'https://example.invalid/company',kind:'company',checked_on:'2026-10-05'}]};
  let routine={id:'44444444-4444-4444-8444-444444444444',company_id:company,revision:2,archived:false,draft};
  const first={id:'55555555-5555-4555-8555-555555555555',company_id:company,routine_id:routine.id,number:1,content:structuredClone(draft),content_hash:'original-hash',requires_ack:true,published_by:user};
  const historyBefore=JSON.stringify(first),versions=[first],assignments=[{user_id:user,version_id:first.id},{user_id:reader,version_id:first.id}],acknowledgments=[{user_id:user,version_id:first.id,statement:ACK_STATEMENT}];
  const commands=[];let failSave=true;
  const state=()=>({context,settings:{revision:1,trades:['vvs'],responsible_user_id:user,next_review_on:'2027-09-01'},members:[{id:user,email:'admin@example.invalid',workspace_role:'firmaadmin'},{id:reader,email:'reader@example.invalid',enabled:true,role:'reader'}],routines:[routine],versions,assignments,acknowledgments,reviews:[]});
  window.__rpc=async(name,args)=>{
   assert.equal(args.p_company_id,company);
   if(name==='kshms_get_state')return structuredClone(state());
   assert.equal(name,'kshms_command');commands.push(structuredClone(args));
   if(args.p_action==='save'){if(failSave){failSave=false;throw Error('Synthetic network failure before commit');}assert.equal(args.p_payload.revision,routine.revision);routine={...routine,revision:routine.revision+1,draft:structuredClone(args.p_payload.draft)};return structuredClone(routine);}
   if(args.p_action==='publish'){assert.equal(args.p_payload.revision,routine.revision);const next={...first,id:'66666666-6666-4666-8666-666666666666',number:2,content:structuredClone(routine.draft),content_hash:'new-hash'};versions.unshift(next);routine={...routine,revision:routine.revision+1};for(const member of [user,reader])assignments.push({user_id:member,version_id:next.id});return structuredClone(next);}
   throw Error('Unexpected action '+args.p_action);
  };
  window.eval((Array.isArray(bundled)?bundled[0]:bundled).output.find(x=>x.type==='chunk').code);const act=window.__act;
  const button=text=>{const found=[...window.document.querySelectorAll('button')].find(x=>x.textContent.trim()===text);assert(found,'Missing button '+text);return found;};
  const click=async text=>act(async()=>button(text).click());
  const input=label=>{const found=[...window.document.querySelectorAll('label')].find(x=>x.querySelector('span')?.textContent===label);assert(found,'Missing field '+label);return found.querySelector('input,textarea');};
  const write=async(label,value)=>{const field=input(label);await act(async()=>{Object.getOwnPropertyDescriptor(field.tagName==='TEXTAREA'?window.HTMLTextAreaElement.prototype:window.HTMLInputElement.prototype,'value').set.call(field,value);field.dispatchEvent(new window.Event('input',{bubbles:true}));field.dispatchEvent(new window.Event('change',{bubbles:true}));});};
  const cache=()=>JSON.parse(window.localStorage.getItem('expo:kshms:draft:v1:'+user+':'+company));
  await act(async()=>window.__render('module',{context}));await click('Oppfølging og revisjon');
  assert(window.document.querySelector('[aria-label="Kildeoppdateringer"]').textContent.includes('1 forslag må vurderes'));
  await click('Sammenlign tekstforslag');assert(window.document.querySelector('[aria-label="Sammenlign ProffDoks tekstforslag"]'));
  await write('Kontrollert dato 1','2026-10-07');
  await act(async()=>[...window.document.querySelectorAll('.ks-source-proposal summary')].find(x=>x.textContent.startsWith('Mål')).click());
  await click('Bruk forslagets mål');assert.equal(input('Mål').value,proposal.goal);assert.equal(input('Tittel').value,draft.title);assert.equal(input('Kapittel').value,draft.chapter);assert.equal(input('I vår bedrift har vi følgende rutine').value,draft.procedure);
  assert.equal(cache().draft.source_revision,1,'Partial adoption advanced whole review');assert.equal(input('Kontrollert dato 1').value,'2026-10-07');assert.equal(cache().draft.references[0].checked_on,'2026-10-07');assert.equal(commands.length,0,'Field choice issued a server command');
  await click('Jeg har vurdert hele tekstforslaget');assert.equal(cache().draft.source_revision,proposal.source_revision);assert.equal(input('Kontrollert dato 1').value,'2026-10-07');assert.equal(commands.length,0,'Review auto-saved/published');
  await click('Lagre utkast');assert(window.document.body.textContent.includes('Synthetic network failure'));assert(window.document.querySelector('[aria-label="Sammenlign ProffDoks tekstforslag"]'));assert.equal(cache().draft.source_revision,proposal.source_revision);assert.equal(versions.length,1);
  await click('Lagre utkast');assert.equal(window.localStorage.getItem('expo:kshms:draft:v1:'+user+':'+company),null);assert.equal(versions.length,1);assert.equal(JSON.stringify(first),historyBefore);assert.equal(acknowledgments.length,1);assert(!commands.some(x=>x.p_action==='publish'));
  await click('Oppfølging og revisjon');assert(window.document.querySelector('[aria-label="Kildeoppdateringer"]').textContent.includes('1 vurderte utkast må godkjennes'));assert(window.document.body.textContent.includes('Godkjent rutine v1 gjelder fortsatt'));
  await click('Håndbok');await write('Hva er vurdert eller endret?','Sammenlignet nytt forslag; egne tilpasninger beholdt.');await click('Godkjenn og publiser');
  assert.equal(versions.length,2);assert.equal(versions[0].content.source_revision,proposal.source_revision);assert.equal(versions[0].content.procedure,draft.procedure);assert.equal(JSON.stringify(first),historyBefore);assert.equal(acknowledgments.length,1,'Publishing forged employee acknowledgment');assert.equal(assignments.filter(row=>row.version_id===versions[0].id).length,2);
  await click('Oppfølging og revisjon');assert(window.document.querySelector('[aria-label="Kildeoppdateringer"]').textContent.includes('Ingen nyere sentrale tekstforslag'));
  const confirmed=structuredClone(state());await act(async()=>window.__unmount());
  for(const patch of [{manage:false},{enabled:false},{company_id:'foreign'},{user_id:'other'}]){await act(async()=>window.__render('overview',{data:{...confirmed,context:{...confirmed.context,...patch}},companyId:company,userId:user,onReview:()=>{throw Error('Wrong scope opened editor');}}));assert.equal(window.document.querySelector('[aria-label="Kildeoppdateringer"]'),null);}
  await act(async()=>window.__unmount());
 } finally {dom.window.close();}
} finally {fs.rmSync(temporary,{recursive:true,force:true});}
console.log('Real React source update flow: PASS — scoped overview, comparison, single-field preservation, explicit review/local cache, failed-save recovery, saved draft vs published v1, own approval/new assignments and retained confirmations.');
