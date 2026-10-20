import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
import {ACK_STATEMENT,ROUTINE_CATALOG} from '../src/modules/kshms/kshmsCatalog.mjs';
import {BATCH_ACK_STATEMENT} from '../src/modules/kshms/kshmsBulkAcknowledgment.mjs';
const {JSDOM}=await import(process.env.KSHMS_JSDOM_PATH||'jsdom');
const dir=process.cwd(),temp=fs.mkdtempSync(path.join(os.tmpdir(),'kshms-bulk-'));
try{
 const entry=path.join(temp,'entry.jsx');
 fs.writeFileSync(entry,`import React,{act,useState,useEffect} from '${dir}/node_modules/react/index.js';import{createRoot}from'${dir}/node_modules/react-dom/client.js';import Bulk from '${dir}/src/modules/kshms/KshmsBulkAcknowledgment.jsx';import Module from '${dir}/src/modules/kshms/KshmsModule.jsx';import Library from '${dir}/src/modules/kshms/KshmsRoutineLibrary.jsx';
 const root=createRoot(document.getElementById('app'));
 function Harness(p){const[data,setData]=useState(p.data),[busy,setBusy]=useState(false);useEffect(()=>setData(p.data),[p.data]);return React.createElement(Bulk,{...p,data,busy,onBusy:setBusy,onState:v=>{globalThis.__states.push(v);setData(v);},onRead:v=>globalThis.__opened.push(v.id)});}
 function LibraryHarness(p){const[filter,onFilterChange]=useState('recommended'),[selectedKeys,onSelectionChange]=useState([]);return React.createElement(Library,{...p,filter,onFilterChange,selectedKeys,onSelectionChange,onAdd:keys=>globalThis.__added.push(keys),onPreview:r=>globalThis.__preview=r});}
 globalThis.__act=act;globalThis.__render=(kind,p)=>root.render(React.createElement(kind==='module'?Module:kind==='library'?LibraryHarness:Harness,{...p,key:kind}));globalThis.__unmount=()=>root.render(null);`);
 const unrelated=/\/(KshmsDeviations|KshmsChecklistCentral|KshmsExecutions|KshmsSja|KshmsInspectionExtract|KshmsDocumentPdfButton|KshmsAssignmentReminders|KshmsReviewReminder|OrganizationChart)\.jsx$/;
 const bundle=await build({root:dir,configFile:false,logLevel:'silent',define:{'process.env.NODE_ENV':'"development"'},build:{write:false,minify:false,lib:{entry,formats:['iife'],name:'BulkProof',cssFileName:'bulk-proof'}},plugins:[react(),{name:'synthetic-transport',enforce:'pre',resolveId(id){if(/kshmsAccess\.js$/.test(id))return '\0rpc';if(/moduleAccessClient\.js$/.test(id))return '\0access';if(unrelated.test(id))return '\0surface';},load(id){if(id==='\0rpc')return 'export const kshmsRpc=(...a)=>globalThis.__rpc(...a);';if(id==='\0access')return 'export const publishManagedAccessChange=()=>{}; export const MANAGED_ACCESS_EVENT="qa:managed",MODULE_ACCESS_EVENT="qa:modules"; export const rpcWithStoredSession=(...args)=>globalThis.__rpc(...args);';if(id==='\0surface')return 'export default function(){return null;}';}}]});
 const dom=new JSDOM('<div id="app"></div>',{url:'https://example.invalid',runScripts:'outside-only',pretendToBeVisual:true});
 try{
  const w=dom.window,doc=w.document;w.IS_REACT_ACT_ENVIRONMENT=true;w.structuredClone=structuredClone;w.confirm=()=>true;w.HTMLElement.prototype.scrollIntoView=function(){};
  w.MessageChannel=class{constructor(){this.port1={onmessage:null};this.port2={postMessage:()=>setImmediate(()=>this.port1.onmessage?.())};}};
  const c='11111111-1111-4111-8111-111111111111',u='22222222-2222-4222-8222-222222222222';
  const fixture=(role='reader',count=87)=>{
   const context={company_id:c,user_id:u,company_name:'Synthetic QA',enabled:true,manage:role!=='reader',publish:role!=='reader',administer:role==='admin',responsible:role==='responsible'};
   return{context,settings:{revision:1,trades:['vvs'],responsible_user_id:u,activities:'butikk med lager',responsibilities:'Varemottak',risks:'Truck',next_review_on:'2027-01-01'},routines:Array.from({length:count},(_,i)=>({id:`r${i}`,company_id:c,revision:2,archived:false,draft:{...ROUTINE_CATALOG[0],title:`QA ${String(i).padStart(3,'0')}`}})),versions:Array.from({length:count},(_,i)=>({id:`v${i}`,routine_id:`r${i}`,company_id:c,number:i===count-1?2:1,requires_ack:i!==count-1,content:{...ROUTINE_CATALOG[0],title:`QA ${String(i).padStart(3,'0')}`},published_by:u,published_at:'2026-10-11T09:00:00Z',publisher_identity:{id:u,name:'QA Reader'}})),assignments:Array.from({length:count},(_,i)=>({user_id:u,version_id:`v${i}`})),acknowledgments:[{user_id:'other',version_id:'v0',acknowledged_at:'2026-10-11T09:00:00Z'}],members:[{id:u,email:'synthetic@example.invalid',enabled:true,role}],reviews:[],audit:[]};
  };
  let server=fixture(),mode='success',pendingResolve=null,calls=[];
  const record=ids=>{for(const id of ids)if(!server.acknowledgments.some(row=>row.user_id===u&&row.version_id===id))server.acknowledgments.push({user_id:u,version_id:id,statement:BATCH_ACK_STATEMENT,acknowledged_at:'2026-10-12T09:45:06Z',user_identity:{id:u,name:'QA Reader'}});};
  w.__states=[];w.__opened=[];w.__added=[];
  w.__rpc=async(name,args)=>{
   calls.push({name,args:structuredClone(args)});
   if(name==='kshms_get_state'){if(mode==='readback-fail')throw Error('Readback offline');if(mode==='wrong-actor')return{...structuredClone(server),context:{...server.context,user_id:'other'}};return structuredClone(server);}
   if(name==='kshms_acknowledge_batch'){
    assert.equal(args.p_company_id,c);assert.equal(args.p_user_id,u);assert.equal(args.p_statement,BATCH_ACK_STATEMENT);
    if(mode==='deferred')return new Promise(resolve=>{pendingResolve=resolve;});
    if(mode==='stale'){server=fixture('reader',88);throw{code:'40001',message:'New assignment'};}
    if(mode==='revoked'){server.context.enabled=false;throw{code:'42501',message:'Revoked'};}
    if(mode!=='incomplete')record(args.p_version_ids);
    if(mode==='lost-response')throw Error('Response lost after commit');
    return{inserted_count:args.p_version_ids.length};
   }
   if(name==='kshms_command'){assert.equal(args.p_action,'ack');assert.equal(args.p_payload.statement,ACK_STATEMENT);server.acknowledgments.push({user_id:u,version_id:args.p_payload.version_id,statement:ACK_STATEMENT,acknowledged_at:'2026-10-12T09:45:06Z',user_identity:{id:u,name:'QA Reader'}});return{};}
   throw Error('Unexpected RPC '+name);
  };
  w.eval((Array.isArray(bundle)?bundle.flatMap(x=>x.output):bundle.output).find(x=>x.type==='chunk').code);
  const act=w.__act,buttons=()=>[...doc.querySelectorAll('button')],button=text=>buttons().find(row=>row.textContent.trim()===text),click=async text=>{const target=button(text);assert(target,'Missing button '+text);await act(async()=>target.click());};
  const consent=()=>doc.querySelector('.ks-bulk-ack input[type=checkbox]');
  const open=async count=>{await click(`Se og bekreft alle ${count} rutineutgaver`);assert.equal(doc.querySelectorAll('.ks-bulk-ack li').length,count);assert(!consent().checked);assert(button(`Bekreft alle ${count} rutineutgaver`).disabled);};
  const confirm=async count=>{await act(async()=>consent().click());const target=button(`Bekreft alle ${count} rutineutgaver`);assert(!target.disabled);await act(async()=>{target.click();target.click();});};
  const mount=async(role='reader',kind='bulk',extra={})=>{await act(async()=>w.__unmount());w.localStorage.clear();server=fixture(role);calls=[];w.__states=[];mode='success';await act(async()=>w.__render(kind,{data:structuredClone(server),companyId:c,userId:u,context:server.context,...extra}));};
  for(const role of ['reader','responsible','admin']){
   await mount(role);await open(87);assert(doc.body.textContent.includes('lest og forstått'));assert.equal(calls.length,0,'No automatic signing from opening/unchecked consent');
   await confirm(87);assert.equal(calls.filter(row=>row.name==='kshms_acknowledge_batch').length,1,'Double click issues one atomic command');
   assert(doc.body.textContent.includes('registrert på alle 87'));assert(doc.body.textContent.includes('12.10.2026'));assert(doc.body.textContent.includes('11:45:06'));assert.equal(w.__states[0].acknowledgments.filter(row=>row.user_id===u).length,87);assert(!consent());
  }
  await mount();await open(87);await click('Avbryt');assert.equal(calls.length,0);assert(!consent());
  await open(87);await click('QA 000 · versjon 1');assert.deepEqual(w.__opened,['v0']);assert(!consent());assert.equal(calls.length,0,'Opening a routine never signs');
  for(const failure of ['stale','incomplete','readback-fail','wrong-actor','revoked']){
   await mount();await open(87);mode=failure;await confirm(87);assert(!doc.body.textContent.includes('registrert på alle 87'),'No false success '+failure);assert(doc.querySelector('[role=alert]')||w.__states.at(-1)===null,'Failure feedback/hide '+failure);assert(!consent(),'Consent resets '+failure);
   if(failure==='stale')assert(button('Se og bekreft alle 88 rutineutgaver'));
   if(failure==='revoked'||failure==='wrong-actor')assert.equal(doc.querySelector('.ks-bulk-ack'),null,'Access/actor change hides old confirmation');
  }
  await mount();await open(87);mode='lost-response';await confirm(87);assert(doc.body.textContent.includes('registrert på alle 87'),'Committed response loss recovered by own readback');
  await mount();await open(87);await act(async()=>consent().click());server=fixture('reader',88);await act(async()=>w.__render('bulk',{data:structuredClone(server),companyId:c,userId:u}));assert(!consent(),'Changing displayed editions invalidates consent');assert.equal(calls.length,0);
  for(const change of ['unmount','company']){
   await mount();await open(87);mode='deferred';await act(async()=>consent().click());await act(async()=>button('Bekreft alle 87 rutineutgaver').click());assert(pendingResolve);
   if(change==='unmount')await act(async()=>w.__unmount());else{const next=fixture();next.context.company_id='next';await act(async()=>w.__render('bulk',{data:next,companyId:'next',userId:u}));}
   const reads=calls.filter(row=>row.name==='kshms_get_state').length;await act(async()=>pendingResolve({inserted_count:87}));assert.equal(w.__states.length,0,'Late old operation never publishes state');assert.equal(calls.filter(row=>row.name==='kshms_get_state').length,reads,'Late old operation does not fetch into new scope');
  }
  // Real parent, search, single-confirmation handler, full personal handbook and
  // stored per-edition timestamps. Only unrelated tool surfaces are stubbed.
  await mount('reader','module');const search=doc.querySelector('input[type=search]');
  await act(async()=>{Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype,'value').set.call(search,'QA 000');search.dispatchEvent(new w.Event('input',{bubbles:true}));});
  assert.equal(doc.querySelectorAll('.ks-reading-row').length,1);await open(87);await confirm(87);assert(doc.body.textContent.includes('registrert på alle 87'));assert.equal(doc.querySelector('.ks-reading-row time').dateTime,'2026-10-12T09:45:06Z');
  await click('Min personalhåndbok');assert.equal(doc.querySelectorAll('.ks-personal-routine').length,87);assert.equal(doc.querySelectorAll('.ks-personal-routine time[datetime="2026-10-12T09:45:06Z"]').length,87);assert(!consent());
  await mount('reader','module');await click(buttons().find(row=>/^Les og bekreft/.test(row.textContent.trim())).textContent.trim());await click('QA 000 · v1');const single=doc.querySelector('.ks-reading input[type=checkbox]');assert(single);await act(async()=>single.click());await click('Bekreft versjon 1');assert.equal(server.acknowledgments.filter(row=>row.user_id===u).length,1);assert.equal(calls.filter(row=>row.name==='kshms_acknowledge_batch').length,0);assert.equal(doc.querySelector('.ks-reading h3').textContent,'QA 001 · versjon 1','Single acknowledgment still opens next required edition');assert(button('Se og bekreft alle 86 rutineutgaver'));
  for(const role of ['responsible','admin']){await mount(role,'module');await click(buttons().find(row=>/^Les og bekreft/.test(row.textContent.trim())).textContent.trim());assert(button('Se og bekreft alle 87 rutineutgaver'),'Manager personal acknowledgment option '+role);}
  await act(async()=>w.__unmount());await act(async()=>w.__render('library',{routines:[],versions:[],recommended:ROUTINE_CATALOG.slice(0,3),busy:false}));await click('Butikk, lager og truck (14)');assert.equal(doc.querySelectorAll('.ks-library-card').length,14);assert(doc.body.textContent.includes('truckkompetanse'));await act(async()=>doc.querySelector('.ks-library-card input').click());await click('Legg inn 1 rutine');assert.equal(w.__added[0].length,1);assert(w.__added[0][0].startsWith('store_'));assert.equal(calls.filter(row=>row.name==='kshms_acknowledge_batch').length,0);
  await act(async()=>w.__unmount());
  console.log('Actual React bulk QA PASS: 87 editions/three roles, consent/list/abort, double-click, exact actor, fresh receipts, stale/revoked/incomplete/lost/late replies, company switch, search independence, personal timestamps, preserved single auto-next and 14 selectable warehouse proposals. Synthetic RPC transport.');
 }finally{dom.window.close();}
}finally{fs.rmSync(temp,{recursive:true,force:true});}
