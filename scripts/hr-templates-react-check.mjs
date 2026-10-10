import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
const {JSDOM}=await import(process.env.KSHMS_JSDOM_PATH||'jsdom');
const rootDir=process.cwd(),temp=fs.mkdtempSync(path.join(os.tmpdir(),'hr-templates-react-')),entry=path.join(temp,'entry.jsx');
try{
 fs.writeFileSync(entry,`import React,{act} from '${rootDir}/node_modules/react/index.js';import {createRoot} from '${rootDir}/node_modules/react-dom/client.js';import Templates from '${rootDir}/src/modules/hr/HrConversationTemplates.jsx';const root=createRoot(document.getElementById('app'));globalThis.__act=act;globalThis.__render=p=>root.render(React.createElement(Templates,{...p,key:p.context.company_id+':'+p.context.user_id}));globalThis.__unmount=()=>root.render(null);`);
 const bundled=await build({root:rootDir,configFile:false,logLevel:'silent',define:{'process.env.NODE_ENV':'"development"'},build:{write:false,minify:false,lib:{entry,formats:['iife'],name:'TemplatesProof',cssFileName:'hr-templates-proof'}},plugins:[react(),{name:'client-fixture',enforce:'pre',resolveId(id){if(/appSupabaseClientRegistry\.js$/.test(id))return '\0client';},load(id){if(id==='\0client')return 'export const getAppSupabaseClient=()=>globalThis.__client;';}}]});
 const dom=new JSDOM('<div id="app"></div>',{url:'https://example.invalid',runScripts:'outside-only',pretendToBeVisual:true});
 try{
  const w=dom.window;w.IS_REACT_ACT_ENVIRONMENT=true;
  w.MessageChannel=class{constructor(){this.port1={onmessage:null};this.port2={postMessage:()=>setImmediate(()=>this.port1.onmessage?.())};}};
  const context={company_id:'firm',user_id:'admin',administer:true};
  let records=[],revoked=false,lateGet=null,loseWrite=false;const calls=[];
  const reorder=v=>Array.isArray(v)?v.map(reorder):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,reorder(v[k])])):v;
  w.__client={rpc:async(name,args)=>{
   calls.push({name,args:structuredClone(args)});assert.equal(args.p_company_id,'firm');
   if(revoked)return {error:{code:'42501',message:'Maltilgang avslått'}};
   if(lateGet&&name==='hr_template_get')return await new Promise(resolve=>lateGet.resolve=resolve);
   const pack=record=>({context,template:{id:record.id,revision:record.revision,archived:record.archived},version:structuredClone(record.versions.at(-1))});
   if(name==='hr_template_list')return {data:{context,templates:records.map(t=>({id:t.id,revision:t.revision,archived:t.archived,title:t.versions.at(-1).content.title,kind:t.versions.at(-1).content.kind,question_count:t.versions.at(-1).content.questions.length})),next:null}};
   let record=records.find(t=>t.id===args.p_template_id);
   if(name==='hr_template_save'){
    if((record?.revision||0)!==args.p_revision)return {error:{code:'40001',message:'Malen er endret'}};
    if(!record){record={id:args.p_template_id,revision:0,archived:false,versions:[]};records.push(record);}
    record.revision++;record.archived=args.p_archived;
    record.versions.push({revision:record.revision,archived:record.archived,content:reorder(args.p_content),saved_at:'2026-10-10T02:00:00Z'});
    if(loseWrite){loseWrite=false;return {error:{message:'Tapt svar etter lagring'}};}
    return {data:pack(record)};
   }
   assert(record,'Unknown fixture record '+name);
   if(name==='hr_template_history')return {data:{context,versions:record.versions.slice().reverse().map(v=>({revision:v.revision,archived:v.archived,saved_at:v.saved_at,title:v.content.title})),next:null}};
   assert.equal(name,'hr_template_get');const result=pack(record);if(args.p_version)result.version=structuredClone(record.versions.find(v=>v.revision===args.p_version));return {data:result};
  }};
  w.eval((Array.isArray(bundled)?bundled[0]:bundled).output.find(o=>o.type==='chunk').code);
  const act=w.__act,buttons=()=>[...w.document.querySelectorAll('button')],button=text=>{const b=buttons().find(b=>b.textContent.trim()===text);assert(b,'Missing '+text+' | '+w.document.body.textContent); return b;};
  const click=async text=>act(async()=>button(text).click());
  const write=async(label,value)=>act(async()=>{const input=[...w.document.querySelectorAll('label')].find(l=>l.querySelector('span')?.textContent===label)?.querySelector('input,select,textarea');assert(input,'Missing '+label);const proto=input.tagName==='SELECT'?w.HTMLSelectElement.prototype:input.tagName==='TEXTAREA'?w.HTMLTextAreaElement.prototype:w.HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(input,value);input.dispatchEvent(new w.Event(input.tagName==='SELECT'?'change':'input',{bubbles:true}));});
  const tick=async text=>act(async()=>{const l=[...w.document.querySelectorAll('label')].find(l=>l.textContent.includes(text));assert(l,text);l.querySelector('input[type=checkbox]').click();});
  const newWrites=()=>calls.filter(c=>c.name==='hr_template_save').length;
  await act(async()=>w.__render({context}));assert.equal(calls.length,0,'Collapsed builder must not query');
  await act(async()=>{w.document.querySelector('summary').click();await new Promise(resolve=>setTimeout(resolve,10));});assert.equal(w.document.querySelectorAll('.hr-template-starters button').length,4);
  await act(async()=>w.document.querySelector('.hr-template-starters button').click());assert.equal(newWrites(),0);assert(w.document.body.textContent.includes('Ulagrede endringer'));
  await write('Malnavn','Firmaets årlige samtale');await write('Spørsmålstekst','Hvilken støtte trenger du i arbeidshverdagen?');
  await click('Legg til spørsmål');await write('Tema','Eget tema');await write('Spørsmålstekst','Hva ønsker vi å følge opp?');
  await click('Flytt opp');await click('Flytt ned');assert.equal(newWrites(),0,'Editing/moving does not write');
  await click('Forhåndsvis mal');assert(w.document.querySelector('.hr-template-preview').textContent.includes('Hva ønsker vi å følge opp?'));assert(!w.document.querySelector('.hr-template-preview textarea'));
  await click('Lag egen mal');assert(w.document.querySelector('.hr-template-choice'));await click('Behold kladden');assert(w.document.body.textContent.includes('Firmaets årlige samtale'));
  await act(async()=>w.dispatchEvent(new w.Event('focus')));assert(w.document.body.textContent.includes('Firmaets årlige samtale'));assert.equal(newWrites(),0);
  await act(async()=>w.__unmount());await act(async()=>w.__render({context}));assert(w.document.body.textContent.includes('Firmaets årlige samtale'),'Authorized remount lost generic draft');
  await click('Lagre mal');assert.equal(records.length,1);assert.equal(records[0].revision,1);assert(w.document.body.textContent.includes('Malen er lagret · utgave 1.'));assert(button('Lagre mal').disabled,'Saved JSONB key order must not keep draft dirty');
  await click('Rediger mal');await write('Malnavn','Endret mal');await click('Forkast endringer');assert(w.document.body.textContent.includes('Firmaets årlige samtale'));assert.equal(newWrites(),1);
  await click('Rediger mal');await write('Malnavn','Andre utgave');await click('Lagre mal');assert.equal(records[0].revision,2);assert.equal(records[0].versions[0].content.title,'Firmaets årlige samtale');
  await click('Hent malhistorikk');await click('Se utgave 1');assert(w.document.querySelector('.hr-template-preview').textContent.includes('Firmaets årlige samtale'));
  await click('Bruk vist utgave som kladd');assert(!button('Lagre mal').disabled);await click('Lagre mal');assert.equal(records[0].revision,3);assert.equal(records[0].versions[1].content.title,'Andre utgave');
  await tick('Arkiver malen');await click('Arkiver mal');assert(records[0].archived);await tick('Vis arkiverte maler');assert(w.document.querySelector('.hr-template-catalog').textContent.includes('arkivert'));await click('Gjenåpne mal');assert(!records[0].archived);
  await click('Rediger mal');await write('Malnavn','Min samtidige kladd');
  const record=records[0];record.revision++;record.versions.push({...structuredClone(record.versions.at(-1)),revision:record.revision,content:{...record.versions.at(-1).content,title:'En annen admins utgave'}});
  await click('Lagre mal');assert(w.document.querySelector('[role=alert]').textContent.includes('nyere utgave'));await click('Oppdater maler');assert(w.document.body.textContent.includes('Min samtidige kladd'));assert(button('Lagre mal').disabled);
  await click('Behold kladd som neste utgave');await click('Lagre mal');assert.equal(record.versions.at(-1).content.title,'Min samtidige kladd');assert(record.versions.some(v=>v.content.title==='En annen admins utgave'));
  await click('Lag egen mal');await write('Malnavn','Lagring med tapt svar');loseWrite=true;await click('Lagre mal');assert.equal(records.length,2);assert(w.document.querySelector('[role=alert]').textContent.includes('Tapt svar'));
  await click('Oppdater maler');assert(w.document.body.textContent.includes('Tidligere lagring er bekreftet'));assert(button('Lagre mal').disabled);assert.equal(records.length,2,'Lost response produced duplicate');
  let handled=0;const beforeShortcut=newWrites();await act(async()=>w.__render({context,startRequest:{token:1,kind:'sickleave'},onStartHandled:()=>handled++}));
  assert.equal(handled,1);assert.equal(newWrites(),beforeShortcut,'Shortcut wrote without save');
  assert(w.document.body.textContent.includes('Sykefraværsoppfølging'));await click('Lagre mal');assert.equal(records.length,3);assert.equal(records[2].versions[0].content.kind,'sickleave');assert.equal(records[2].versions[0].content.questions.length,11);
  await click('Rediger mal');await write('Malnavn','Behold sykefraværskladd');const beforeSwitch=newWrites();await act(async()=>w.__render({context,startRequest:{token:2,kind:'sickleave'},onStartHandled:()=>handled++}));assert(w.document.querySelector('.hr-template-choice'));await click('Behold kladden');assert(w.document.body.textContent.includes('Behold sykefraværskladd'));assert.equal(newWrites(),beforeSwitch);
  await click('Forkast endringer');
  lateGet={};await act(async()=>w.dispatchEvent(new w.Event('focus')));assert(!w.document.querySelector('.hr-template-workbench'),'Must hide before fresh authorization');const resolve=lateGet.resolve;assert(resolve);lateGet=null;
  await act(async()=>w.__unmount());await act(async()=>resolve({data:{context,template:{id:records[2].id,revision:1,archived:false},version:records[2].versions[0]}}));assert(!w.document.querySelector('.hr-template-workbench'));
  await act(async()=>w.__render({context}));revoked=true;await act(async()=>w.dispatchEvent(new w.Event('focus')));assert(!w.document.querySelector('.hr-template-workbench'));assert(!w.document.querySelector('.hr-template-starters'));assert(w.document.querySelector('[role=alert]'));
  await act(async()=>w.__unmount());await act(async()=>w.__render({context:{...context,user_id:'employee',administer:false}}));assert.equal(w.document.body.textContent,'');
  assert.equal(w.localStorage.length,0);assert.equal(w.sessionStorage.length,0);await act(async()=>w.__unmount());
  console.log('Actual template React PASS: suggestions/edit/move/preview/save/readback, JSONB order, dirty switch/discard, authorized focus/remount, immutable history/reuse, archive/reopen, CAS conflict/explicit rebase, lost create-response without duplicate, stale unmount/revocation/admin-only. Synthetic transport; no cloud browser writes.');
 }finally{dom.window.close();}
}finally{fs.rmSync(temp,{recursive:true,force:true});}
