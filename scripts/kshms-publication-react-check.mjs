import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
import {ACK_STATEMENT,ROUTINE_CATALOG} from '../src/modules/kshms/kshmsCatalog.mjs';
import {COMPANY_APPROVAL_STATEMENT,companyPublicationSummary} from '../src/modules/kshms/kshmsBulkPublication.mjs';
const {JSDOM}=await import(process.env.KSHMS_JSDOM_PATH||'jsdom');
const dir=process.cwd(),temp=fs.mkdtempSync(path.join(os.tmpdir(),'kshms-bulk-'));
try{
 const entry=path.join(temp,'entry.jsx');
 fs.writeFileSync(entry,`import React,{act,useState,useEffect} from '${dir}/node_modules/react/index.js';import{createRoot}from'${dir}/node_modules/react-dom/client.js';import Bulk from '${dir}/src/modules/kshms/KshmsBulkPublication.jsx';import Module from '${dir}/src/modules/kshms/KshmsModule.jsx';import Library from '${dir}/src/modules/kshms/KshmsRoutineLibrary.jsx';
 const root=createRoot(document.getElementById('app'));
 function Harness(p){const[data,setData]=useState(p.data),[busy,setBusy]=useState(false);useEffect(()=>setData(p.data),[p.data]);return React.createElement(Bulk,{...p,data,busy,onBusy:setBusy,onState:v=>{globalThis.__states.push(v);setData(v);},onPublished:ids=>globalThis.__published.push(ids),onEdit:v=>globalThis.__edited.push(v.id),ContentComponent:({content})=>React.createElement("p",null,content.procedure)});}
 function LibraryHarness(p){const[filter,onFilterChange]=useState('recommended'),[selectedKeys,onSelectionChange]=useState([]);return React.createElement(Library,{...p,filter,onFilterChange,selectedKeys,onSelectionChange,onAdd:keys=>globalThis.__added.push(keys),onPreview:r=>globalThis.__preview=r});}
 globalThis.__act=act;globalThis.__render=(kind,p)=>root.render(React.createElement(kind==='module'?Module:kind==='library'?LibraryHarness:Harness,{...p,key:kind}));globalThis.__unmount=()=>root.render(null);`);
 const unrelated=/\/(KshmsDeviations|KshmsChecklistCentral|KshmsExecutions|KshmsSja|KshmsInspectionExtract|KshmsDocumentPdfButton|KshmsAssignmentReminders|KshmsReviewReminder|OrganizationChart)\.jsx$/;
 const bundle=await build({root:dir,configFile:false,logLevel:'silent',define:{'process.env.NODE_ENV':'"development"'},build:{write:false,minify:false,lib:{entry,formats:['iife'],name:'BulkProof',cssFileName:'bulk-proof'}},plugins:[react(),{name:'synthetic-transport',enforce:'pre',resolveId(id){if(/kshmsAccess\.js$/.test(id))return '\0rpc';if(/moduleAccessClient\.js$/.test(id))return '\0access';if(unrelated.test(id))return '\0surface';},load(id){if(id==='\0rpc')return 'export const kshmsRpc=(...a)=>globalThis.__rpc(...a);';if(id==='\0access')return 'export const publishManagedAccessChange=()=>{};';if(id==='\0surface')return 'export default function(){return null;}';}}]});
 const dom=new JSDOM('<div id="app"></div>',{url:'https://example.invalid',runScripts:'outside-only',pretendToBeVisual:true});
 try{
  const w=dom.window,doc=w.document;w.IS_REACT_ACT_ENVIRONMENT=true;w.structuredClone=structuredClone;w.confirm=()=>true;w.HTMLElement.prototype.scrollIntoView=function(){};
  w.MessageChannel=class{constructor(){this.port1={onmessage:null};this.port2={postMessage:()=>setImmediate(()=>this.port1.onmessage?.())};}};
  const c='11111111-1111-4111-8111-111111111111',u='22222222-2222-4222-8222-222222222222';
  const fixture=(role='admin',count=87)=>({context:{company_id:c,user_id:u,company_name:'Synthetic QA',enabled:true,manage:role!=='reader',publish:role!=='reader',administer:role==='admin',responsible:true},settings:{revision:1,trades:['vvs'],responsible_user_id:u,activities:'Warehouse',next_review_on:'2027-01-01'},routines:Array.from({length:count},(_,i)=>({id:`r${i}`,company_id:c,revision:1,archived:false,draft:{...ROUTINE_CATALOG[0],title:`QA ${String(i).padStart(3,'0')}`}})),versions:[],assignments:[],acknowledgments:[],members:[{id:u,email:'synthetic@example.invalid',enabled:true,role:'responsible',workspace_role:role==='admin'?'firmaadmin':'ansatt'}],reviews:[],audit:[]});
  let server=fixture(),mode='success',pendingResolve=null,calls=[];
  const publishOne=(item,summary,required,own)=>{const row=server.routines.find(row=>row.id===item.id);const number=1+Math.max(0,...server.versions.filter(v=>v.routine_id===row.id).map(v=>v.number));const version={id:`v-${row.id}-${number}`,routine_id:row.id,number,content:structuredClone(row.draft),requires_ack:number===1||required,published_at:'2026-10-12T11:30:06Z',published_by:u,publisher_identity:{id:u,name:'QA Approver'},change_summary:summary};server.versions.push(version);row.revision++;server.assignments.push({user_id:u,version_id:version.id});if(own)server.acknowledgments.push({user_id:u,version_id:version.id,statement:ACK_STATEMENT,acknowledged_at:version.published_at});return version;};
  w.__states=[];w.__published=[];w.__edited=[];
  w.__rpc=async(name,args)=>{
   calls.push({name,args:structuredClone(args)});
   if(name==='kshms_get_state'){if(mode==='readback-fail')throw Error('Readback offline');if(mode==='wrong-actor')return{...structuredClone(server),context:{...server.context,user_id:'other'}};return structuredClone(server);}
   if(name==='kshms_publish_batch'){
    assert.equal(args.p_company_id,c);assert.equal(args.p_user_id,u);assert.equal(args.p_approval_statement,COMPANY_APPROVAL_STATEMENT);assert.equal(args.p_self_statement,args.p_acknowledge_self?ACK_STATEMENT:null);
    if(mode==='deferred')return new Promise(resolve=>{pendingResolve=resolve;});
    if(mode==='stale'){server.routines.at(-1).revision++;server.routines.at(-1).draft.procedure='Changed after review';throw{code:'40001'};}
    if(mode==='revoked'){server.context.publish=false;throw{code:'42501'};}
    const selected=mode==='incomplete'?args.p_routines.slice(1):args.p_routines;
    const versions=selected.map(item=>publishOne(item,companyPublicationSummary(args.p_assessment),args.p_requires_ack,args.p_acknowledge_self));
    if(mode==='lost-response')throw Error('Response lost after commit');return{versions,published_count:versions.length};
   }
   if(name==='kshms_command'){assert.equal(args.p_action,'publish');return publishOne({id:args.p_payload.id},args.p_payload.change_summary,args.p_payload.requires_ack,args.p_payload.acknowledge_self);}
   throw Error('Unexpected RPC '+name);
  };
  w.eval((Array.isArray(bundle)?bundle.flatMap(x=>x.output):bundle.output).find(x=>x.type==='chunk').code);
  const act=w.__act,buttons=()=>[...doc.querySelectorAll('button')],button=text=>buttons().find(row=>row.textContent.trim()===text),click=async text=>{const target=button(text);assert(target,'Missing button '+text);await act(async()=>target.click());};
  const write=async(el,value)=>{await act(async()=>{Object.getOwnPropertyDescriptor(w.HTMLTextAreaElement.prototype,'value').set.call(el,value);el.dispatchEvent(new w.Event('input',{bubbles:true}));});};
  const firm=()=>[...doc.querySelectorAll('.ks-bulk-publication input[type=checkbox]')].find(el=>el.closest('label').textContent.includes('Jeg har vurdert alle oppførte utkast'));
  const own=()=>[...doc.querySelectorAll('.ks-bulk-publication input[type=checkbox]')].find(el=>el.closest('label').textContent.includes('Jeg bekrefter også'));
  const mount=async(role='admin',kind='bulk',extra={})=>{await act(async()=>w.__unmount());w.localStorage.clear();server=fixture(role);mode='success';calls=[];w.__states=[];w.__published=[];await act(async()=>w.__render(kind,{data:structuredClone(server),companyId:c,userId:u,context:server.context,...extra}));};
  const review=async count=>{await click(`Godkjenn flere rutiner (${count})`);assert.equal(doc.querySelectorAll('.ks-bulk-publication-list > li').length,count);await click(`Velg alle som venter (${count})`);await click(`Se over ${count} valgte rutiner`);assert.equal(doc.querySelectorAll('.ks-selection-review .ks-bulk-publication-list > li').length,count);assert(!firm().checked);assert(!own().checked);assert(button(`Godkjenn og publiser ${count} valgte rutiner`).disabled);};
  const confirm=async(count,self=false)=>{await write(doc.querySelector('.ks-bulk-publication textarea'),'Kontrollert og tilpasset lagrede arbeidssteg, risikoer og ansvar.');await act(async()=>firm().click());if(self)await act(async()=>own().click());const target=button(`Godkjenn og publiser ${count} valgte rutiner`);assert(!target.disabled);await act(async()=>{target.click();target.click();});};
  await mount('reader');assert(!doc.querySelector('.ks-bulk-publication'));assert.equal(calls.length,0);
  await mount('admin','bulk',{dirty:true});assert(button('Godkjenn flere rutiner (87)').disabled);assert.equal(calls.length,0,'Unsaved text cannot silently be published');
  for(const role of ['admin','responsible']){
   await mount(role);await review(87);assert.equal(calls.filter(r=>r.name==='kshms_publish_batch').length,0);await confirm(87);assert.equal(calls.filter(r=>r.name==='kshms_publish_batch').length,1,'One atomic command despite double click');assert.equal(server.versions.length,87);assert.equal(server.acknowledgments.length,0,'Firm approval never auto-confirms own reading');assert(doc.body.textContent.includes('87 rutiner er godkjent og publisert'));assert(doc.body.textContent.includes('13:30:06'));assert.equal(w.__published[0].length,87);
  }
  await mount();await review(87);await confirm(87,true);assert.equal(server.acknowledgments.length,87,'Explicit own confirmation records each new edition');
  await mount();await click('Godkjenn flere rutiner (87)');await act(async()=>doc.querySelector('.ks-bulk-publication-list input').click());await click('Se over 1 valgte rutiner');await confirm(1);assert.equal(server.versions.length,1,'A chosen subset stays a subset');
  await mount();await review(87);await click('Avbryt');assert.equal(calls.filter(r=>r.name==='kshms_publish_batch').length,0);assert(!firm());
  await mount();await click('Godkjenn flere rutiner (87)');await act(async()=>buttons().find(row=>row.textContent==='Rediger før godkjenning').click());assert.equal(w.__edited.length,1);assert.equal(calls.filter(r=>r.name==='kshms_publish_batch').length,0);
  for(const failure of ['stale','incomplete','readback-fail','wrong-actor','revoked']){
   await mount();await review(87);mode=failure;await confirm(87);assert(!doc.body.textContent.includes('87 rutiner er godkjent og publisert'),'No false success '+failure);assert(doc.querySelector('[role=alert]')||w.__states.at(-1)===null);assert.equal(w.__published.length,0);if(failure==='stale'){await click('Se over 87 valgte rutiner');assert(doc.querySelector('textarea').value.includes('Kontrollert og tilpasset'),'Assessment survives stale rejection');assert(!firm().checked);}
  }
  await mount();await review(87);mode='lost-response';await confirm(87);assert(doc.body.textContent.includes('87 rutiner er godkjent og publisert'),'Fresh exact publication readback recovers a lost response');
  for(const change of ['unmount','company']){
   await mount();await review(87);await write(doc.querySelector('textarea'),'Kontrollert alle lagrede tekster.');await act(async()=>firm().click());mode='deferred';await act(async()=>button('Godkjenn og publiser 87 valgte rutiner').click());assert(pendingResolve);const before=w.__states.length;
   if(change==='unmount')await act(async()=>w.__unmount());else{const next=fixture();next.context.company_id='next';await act(async()=>w.__render('bulk',{data:next,companyId:'next',userId:u}));}
   await act(async()=>pendingResolve({published_count:87}));assert.equal(w.__states.length,before,'Late old result never publishes state');assert.equal(w.__published.length,0);
  }
  // Actual parent integration and the preserved individual publish/auto-next.
  await mount('admin','module');assert(button('Godkjenn flere rutiner (87)'));await review(87);await confirm(87);assert.equal(server.versions.length,87);assert(button('Alle lagrede rutiner er godkjent'));
  await act(async()=>w.__unmount());w.localStorage.clear();server=fixture();mode='success';calls=[];const cache={schema:1,userId:u,companyId:c,id:'r0',revision:1,draft:{...server.routines[0].draft,procedure:'Ulagret lokal tekst skal beholdes'},savedLocallyAt:'2026-10-12T11:00:00Z'};w.localStorage.setItem(`expo:kshms:draft:v1:${u}:${c}`,JSON.stringify(cache));await act(async()=>w.__render('module',{context:server.context}));assert(button('Godkjenn flere rutiner (87)').disabled,'Actual parent blocks old server text while a local draft awaits recovery');assert(w.localStorage.getItem(`expo:kshms:draft:v1:${u}:${c}`).includes('Ulagret lokal tekst skal beholdes'));assert.equal(calls.filter(row=>row.name==='kshms_publish_batch').length,0);
  await mount('responsible','module');await click('Åpne godkjenning'); // Buttons have accessible labels; select by rendered text.
  await write([...doc.querySelectorAll('textarea')].find(el=>el.closest('.ks-publication')),'Enkeltvis vurdert og kontrollert.');await click('Godkjenn og publiser');assert.equal(server.versions.length,1);assert.equal(calls.filter(r=>r.name==='kshms_publish_batch').length,0,'Individual approval keeps its original RPC');assert.equal(doc.querySelector('.ks-publication h3').textContent,'Her godkjenner du rutinen: QA 001');
  await act(async()=>w.__unmount());
  console.log('Actual firm publication React PASS: 87 drafts/both manager roles, reader/dirty gates, selected subset, exact review/consent, optional own reading, double click, abort/edit, stale/revoked/incomplete/lost/late/readback failure and company switch, saved assessment and unchanged individual approval/auto-next. Synthetic RPC.');
 }finally{dom.window.close();}
}finally{fs.rmSync(temp,{recursive:true,force:true});}
