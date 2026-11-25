import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
const {JSDOM}=await import(process.env.KSHMS_JSDOM_PATH||'jsdom');
const cwd=process.cwd(),temp=fs.mkdtempSync(path.join(os.tmpdir(),'people-access-')),entry=path.join(temp,'entry.jsx');
try{
 fs.writeFileSync(entry,`import React,{act} from '${cwd}/node_modules/react/index.js';import {createRoot} from '${cwd}/node_modules/react-dom/client.js';import Access from '${cwd}/src/modules/access/PeopleWorkspaceModuleAccess.jsx';const root=createRoot(document.getElementById('app'));globalThis.__act=act;globalThis.__render=props=>root.render(React.createElement(Access,props));globalThis.__unmount=()=>root.render(null);`);
 const bundle=await build({root:cwd,configFile:false,logLevel:'silent',define:{'process.env.NODE_ENV':'"development"'},build:{write:false,minify:false,lib:{entry,formats:['iife'],name:'WorkspaceProof',cssFileName:'workspace-proof'}},plugins:[react(),{name:'synthetic-transport',enforce:'pre',resolveId(id){if(/workProfileClient\.js$/.test(id))return '\0workspaces';if(/moduleAccessClient\.js$/.test(id))return '\0signals';if(/kshmsAccess\.js$/.test(id))return '\0rpc';},load(id){if(id==='\0workspaces')return "export const WORK_PROFILE_EVENT='workspace';export const listManagedWorkProfiles=()=>globalThis.__workspaces();";if(id==='\0signals')return "export const MANAGED_ACCESS_EVENT='managed';export const MODULE_ACCESS_EVENT='module';export const publishManagedAccessChange=detail=>window.dispatchEvent(new CustomEvent('managed',{detail}));";if(id==='\0rpc')return 'export const kshmsRpc=(name,args)=>globalThis.__rpc(name,args);';}}]});
 const dom=new JSDOM('<div id="app"></div>',{url:'https://example.invalid',runScripts:'outside-only',pretendToBeVisual:true});
 try{
  const {window:w}=dom;w.IS_REACT_ACT_ENVIRONMENT=true;
  w.MessageChannel=class{constructor(){this.port1={onmessage:null};this.port2={postMessage:()=>setImmediate(()=>this.port1.onmessage?.())};}};
  let calls=[],hold=false,pending=[],system=true,members=['b','r','p'],deny=false,holdWrite=false,finishWrite=null;
  const companies=[{company_id:'b',company_name:'Firma B'},{company_id:'r',company_name:'Firma R'},{company_id:'p',company_name:'Firma P'}];
  const values={};for(const id of members)values[id]={company_id:id,user_id:'u',company:{company_id:id,kshms:true,hr:true},firmaadmin:id==='b',kshms:id==='r',kshms_role:id==='r'?'responsible':'reader',hr:false};
  w.__workspaces=async()=>{const result={is_systemadmin:system,companies,users:[{user_id:'u',workspace_company_ids:[...members]}]};if(hold)await new Promise(resolve=>pending.push(()=>resolve(result)));return result;};
  w.__rpc=async(name,args)=>{calls.push({name,args:structuredClone(args)});if(deny)throw Error('Ingen tilgang');const value=values[args.p_company_id];if(name==='people_modules_user_get')return structuredClone(value);assert.equal(name,'people_modules_user_set');if(holdWrite)await new Promise(resolve=>finishWrite=resolve);assert.deepEqual(args.p_expected,value);assert.equal(args.p_user_id,'u');values[args.p_company_id]={...value,kshms:args.p_kshms,kshms_role:args.p_kshms_role,hr:args.p_hr};return structuredClone(values[args.p_company_id]);};
  w.eval((Array.isArray(bundle)?bundle[0]:bundle).output.find(x=>x.type==='chunk').code);
  const act=w.__act,render=async props=>act(async()=>w.__render(props)),props={companyId:'b',userId:'u'};
  const select=()=>w.document.querySelector('[aria-label="Firma for KS/HMS og HR"]');
  const input=key=>[...w.document.querySelectorAll('.people-module-access label')].find(n=>n.querySelector('b')?.textContent===key)?.querySelector('input');
  const button=text=>{const n=[...w.document.querySelectorAll('button')].find(n=>n.textContent===text);assert(n,text);return n;};
  const change=async id=>act(async()=>{select().value=id;select().dispatchEvent(new w.Event('change',{bubbles:true}));});
  await render(props);assert.equal(select().options.length,3);assert.equal(select().value,'b');assert(input('HR').disabled&&input('HR').checked,'primary firmaadmin inherits licensed HR');assert.equal(calls.filter(c=>c.name.includes('set')).length,0);
  await change('r');assert.equal(select().value,'r');assert(!input('HR').checked&&!input('HR').disabled);assert(input('KS/HMS').checked);assert.equal(w.document.querySelector('[aria-label="KS/HMS-rolle"]').value,'responsible');
  await act(async()=>input('HR').click());await act(async()=>button('Lagre KS/HMS- og HR-tilgang').click());assert(values.r.hr);assert(!values.p.hr);const saved=calls.at(-1);assert.equal(saved.args.p_company_id,'r');assert.equal(saved.args.p_kshms,true);assert.equal(saved.args.p_kshms_role,'responsible');assert.equal(select().value,'r','own save retains selected workspace');
  holdWrite=true;await act(async()=>input('HR').click());await act(async()=>button('Lagre KS/HMS- og HR-tilgang').click());await change('p');assert.equal(select().value,'r','saving blocks firm switch');assert(w.document.body.textContent.includes('Vent til tilgangen'));holdWrite=false;await act(async()=>finishWrite());assert(!values.r.hr);await act(async()=>input('HR').click());await act(async()=>button('Lagre KS/HMS- og HR-tilgang').click());
  await act(async()=>input('HR').click());w.confirm=()=>false;await change('p');assert.equal(select().value,'r');assert(!input('HR').checked,'cancel preserves unsaved draft');w.confirm=()=>true;await change('p');assert.equal(select().value,'p');assert(!input('HR').checked);assert(values.r.hr,'discarding a draft never saves or revokes old firm');
  members=['b','r'];await act(async()=>w.dispatchEvent(new w.Event('focus')));assert.equal(select().value,'b');assert.equal(select().options.length,2,'removed membership vanishes');
  deny=true;await change('r');assert(!w.document.querySelector('.people-module-access input'));assert(w.document.querySelector('[role=alert]').textContent.includes('Ingen tilgang'));deny=false;await act(async()=>w.dispatchEvent(new w.Event('focus')));assert(input('HR').checked);
  hold=true;await act(async()=>w.dispatchEvent(new w.Event('focus')));assert(!w.document.querySelector('.people-module-access'));system=false;hold=false;await act(async()=>w.dispatchEvent(new w.Event('focus')));assert(w.document.querySelector('[role=alert]').textContent.includes('Systemadmin'));await act(async()=>pending.splice(0).forEach(r=>r()));assert(!w.document.querySelector('.people-module-access'),'late authorized snapshot cannot restore revoked UI');
  system=true;hold=true;await act(async()=>w.dispatchEvent(new w.Event('focus')));await act(async()=>w.__unmount());hold=false;await act(async()=>pending.splice(0).forEach(r=>r()));assert(!w.document.querySelector('.people-module-access'));assert.equal(w.localStorage.length,0);assert.equal(w.sessionStorage.length,0);
  console.log('Actual workspace module access React PASS: three scopes, inherited role, scoped CAS save preserves KS/HMS, no implicit grant, discard/cancel, removed membership, denied role, fresh and late/unmounted response rejection. Synthetic transport.');
 }finally{dom.window.close();}
}finally{fs.rmSync(temp,{recursive:true,force:true});}
