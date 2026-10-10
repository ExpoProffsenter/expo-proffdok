import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
const {JSDOM}=await import(process.env.KSHMS_JSDOM_PATH||'jsdom');
const cwd=process.cwd(),temp=fs.mkdtempSync(path.join(os.tmpdir(),'people-access-')),entry=path.join(temp,'entry.jsx');
try{
 fs.writeFileSync(entry,`import React,{act} from '${cwd}/node_modules/react/index.js';import {createRoot} from '${cwd}/node_modules/react-dom/client.js';import Access from '${cwd}/src/modules/access/PeopleModuleAccess.jsx';import {createHelpCenter} from '${cwd}/src/modules/help/helpTools.js';const Box=({children})=>React.createElement('div',null,children);const Help=createHelpCenter({Section:Box,Grid:Box,AppInstallGuide:()=>null,EXPO_PROFFDOK_TERMS_VERSION:'test',expoProffDokTermsSections:[]});const root=createRoot(document.getElementById('app'));globalThis.__act=act;globalThis.__render=(kind,props)=>root.render(React.createElement(kind==='help'?Help:Access,props));globalThis.__unmount=()=>root.render(null);`);
 const bundle=await build({root:cwd,configFile:false,logLevel:'silent',define:{'process.env.NODE_ENV':'"development"'},build:{write:false,minify:false,lib:{entry,formats:['iife'],name:'PeopleProof',cssFileName:'people-proof'}},plugins:[react(),{name:'synthetic-client',enforce:'pre',resolveId(id){if(/cordelAccess\.js$/.test(id))return '\0cordel';if(/appSupabaseClientRegistry\.js$/.test(id))return '\0client';},load(id){if(id==='\0cordel')return 'export const useCordelAccess=()=>false;';if(id==='\0client')return 'export const getAppSupabaseClient=()=>globalThis.__client;';}}]});
 const output=(Array.isArray(bundle)?bundle[0]:bundle).output;
 const css=output.find(x=>x.type==='asset'&&x.fileName.endsWith('.css'))?.source||'';
 const dom=new JSDOM('<style>input {width:100%;flex:1;} </style><style>'+css+'</style><div id="app"></div>',{url:'https://example.invalid',runScripts:'outside-only',pretendToBeVisual:true});
 try{
  const {window:w}=dom;w.IS_REACT_ACT_ENVIRONMENT=true;
  w.MessageChannel=class{constructor(){this.port1={onmessage:null};this.port2={postMessage:()=>setImmediate(()=>this.port1.onmessage?.())};}};
  let modules=['projects','sales','store_offers'],system=true,company={company_id:'c',kshms:true,hr:true};
  let user={company_id:'c',user_id:'u',company,firmaadmin:false,kshms:false,kshms_role:'reader',hr:false},late=null,fail=false;
  const writes=[];
  w.__client={rpc:async(name,args)=>{
   if(name==='get_my_module_access')return {data:{module_keys:modules,is_systemadmin:system,is_firmaadmin:false}};
   if(name==='people_modules_user_get'||name==='people_modules_company_get'){
    if(late)return new Promise(resolve=>late.resolve=resolve);
    return {data:structuredClone(name.includes('user')?user:company)};
   }
   writes.push({name,args:structuredClone(args)});
   if(fail)return {error:{code:'40001',message:'Tilgangen er endret. Hent på nytt.'}};
   if(name==='people_modules_user_set'){
    assert.deepEqual(args.p_expected,user);assert.equal(args.p_company_id,'c');assert.equal(args.p_user_id,'u');
    user={...user,kshms:args.p_kshms,kshms_role:args.p_kshms_role,hr:args.p_hr};return {data:structuredClone(user)};
   }
   assert.equal(name,'people_modules_company_set');assert.deepEqual(args.p_expected,company);
   company={...company,kshms:args.p_kshms,hr:args.p_hr};return {data:structuredClone(company)};
  }};
  w.eval((Array.isArray(bundle)?bundle[0]:bundle).output.find(x=>x.type==='chunk').code);
  const act=w.__act,render=async(kind,props)=>act(async()=>w.__render(kind,props));
  const roots=()=>[...w.document.querySelectorAll('[data-help-topic]')];
  const props={authUser:{id:'admin'},isSystemAdmin:true,kshmsContext:{user_id:'admin',enabled:true},hrContext:{user_id:'admin',available:true}};
  await render('help',props);
  let keys=roots().map(n=>n.dataset.helpTopic);assert.equal(keys[0],'start');assert(keys.indexOf('rapport')<keys.indexOf('kshms'));assert(keys.indexOf('kshms')<keys.indexOf('hr'));
  assert(roots().every(n=>n.querySelector('button svg[aria-hidden="true"]')),'every Help root has an accessible decorative icon');
  modules=['sales'];system=false;await render('help',{...props,kshmsContext:null,hrContext:null});
  await act(async()=>w.dispatchEvent(new w.Event('expo-proffdok-managed-access-changed')));
  keys=roots().map(n=>n.dataset.helpTopic);assert(keys.includes('sales'));for(const key of ['rapport','kshms','hr','systemadmin','firma','butikktilbud'])assert(!keys.includes(key),key);
  assert(!w.document.body.textContent.includes('Proff vareregister, Generelt tilbud og Enkel ordre'),'supplemental Help respects store access');
  await render('help',{...props,authUser:{id:'other'}});assert(!roots().some(n=>['kshms','hr'].includes(n.dataset.helpTopic)),'late old actor contexts stay closed');
  await render('access',{companyId:'c',userId:'u'});
  const input=key=>[...w.document.querySelectorAll('.people-module-access label')].find(n=>n.querySelector('b')?.textContent===key)?.querySelector('input');
  const button=text=>{const node=[...w.document.querySelectorAll('button')].find(n=>n.textContent===text);assert(node,text);return node;};
  const save=()=>button('Lagre KS/HMS- og HR-tilgang');
  assert.equal(w.getComputedStyle(input('HR')).width,'24px');assert.equal(w.getComputedStyle(input('HR')).flexBasis,'24px');assert(!input('HR').checked&&!input('KS/HMS').checked);assert(!input('HR').disabled);assert(save().disabled);
  await act(async()=>{input('HR').click();input('KS/HMS').click();});
  await act(async()=>w.dispatchEvent(new w.CustomEvent('expo-proffdok-managed-access-changed',{detail:{source:'people-module-access',userId:'other',companyId:'c'}})));assert(input('HR').checked&&input('KS/HMS').checked,'another saved user erased this independent draft');assert.equal(save().getAttribute('data-people-module-save'),'user');
  await act(async()=>save().click());assert.equal(writes.length,1);assert(w.document.querySelector('[role=status]').textContent.includes('tilgang lagret'));assert(user.hr&&user.kshms);assert(input('HR').checked&&input('KS/HMS').checked);
  await act(async()=>input('HR').click());fail=true;await act(async()=>save().click());assert(w.document.querySelector('[role=alert]').textContent.includes('Hent på nytt'));assert(user.hr,'failed write did not revoke stored access');
  fail=false;await act(async()=>button('Hent modultilgang på nytt').click());assert(input('HR').checked);
  user={...user,company:{...company,hr:false},hr:false};await act(async()=>w.dispatchEvent(new w.Event('focus')));assert(input('HR').disabled&&!input('HR').checked);
  user={...user,firmaadmin:true};await act(async()=>w.dispatchEvent(new w.Event('focus')));assert(input('KS/HMS').disabled&&input('KS/HMS').checked);assert(!w.document.querySelector('button')?.textContent.includes('Lagre KS/HMS'));
  user={...user,firmaadmin:false};late={};await act(async()=>w.dispatchEvent(new w.Event('focus')));assert(!w.document.querySelector('input'),'fresh access read clears old controls');
  const old=late.resolve;late=null;await render('access',{companyId:'new',userId:'other'});assert(w.document.querySelector('[role=alert]'),'mismatched response refused');await act(async()=>old({data:user}));assert(!w.document.querySelector('input'),'late old response refused');
  await render('access',{companyId:'c'});assert(input('HR').checked);await act(async()=>input('HR').click());await act(async()=>button('Lagre firmaets moduler').click());assert.equal(company.hr,false);assert(w.document.body.textContent.includes('Ikke aktivert på firmaet.'));assert.equal(writes.at(-1).name,'people_modules_company_set');
  await act(async()=>w.__unmount());assert.equal(w.localStorage.length,0);assert.equal(w.sessionStorage.length,0);
  console.log('People access / complete Help React PASS: every root icon, workflow order, effective generic/module/role and supplemental gates, old actor rejection, company activation, atomic scoped user save, inherited firmaadmin, unavailable license, failed CAS, fresh clearing and late response refusal. Synthetic transport.');
 }finally{dom.window.close();}
}finally{fs.rmSync(temp,{recursive:true,force:true});}
