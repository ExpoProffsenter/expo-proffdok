import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
const {JSDOM}=await import(process.env.KSHMS_JSDOM_PATH||'jsdom');
const dir=process.cwd(),temp=fs.mkdtempSync(path.join(os.tmpdir(),'personal-react-'));
try{
 const entry=path.join(temp,'entry.jsx');
 fs.writeFileSync(entry,`import React,{act} from '${dir}/node_modules/react/index.js';import {createRoot} from '${dir}/node_modules/react-dom/client.js';import Page from '${dir}/src/modules/personal/PersonalPage.jsx';import Private from '${dir}/src/modules/hr/PrivateContact.jsx';import Suggestion from '${dir}/src/modules/hr/HrTextSuggestion.jsx';import Email from '${dir}/src/modules/app/MarketingEmailPreference.jsx';const root=createRoot(document.getElementById('app'));globalThis.__act=act;globalThis.__render=(kind,props)=>root.render(React.createElement(kind==='private'?Private:kind==='suggestion'?Suggestion:Page,props,kind==='page'?React.createElement(Email,{supabaseClient:globalThis.__client,authUser:props.authUser}):null));globalThis.__unmount=()=>root.render(null);`);
 const bundle=await build({root:dir,configFile:false,logLevel:'silent',define:{'process.env.NODE_ENV':'"development"'},build:{write:false,minify:false,lib:{entry,formats:['iife'],name:'PersonalProof',cssFileName:'personal-proof'}},plugins:[react(),{name:'test-boundaries',enforce:'pre',resolveId(id){if(id.endsWith('KshmsModule.jsx'))return '\0handbook';if(id.endsWith('appSupabaseClientRegistry.js'))return '\0client';},load(id){if(id==='\0handbook')return 'import React from "react";export default function Stub(p){return React.createElement("p",null,p.personalOnly?"Handbook personal route":"Unexpected management");}';if(id==='\0client')return 'export const getAppSupabaseClient=()=>globalThis.__client;';}}]});
 const dom=new JSDOM('<div id="app"></div>',{url:'https://example.invalid',runScripts:'outside-only',pretendToBeVisual:true});
 try{
  const w=dom.window;w.IS_REACT_ACT_ENVIRONMENT=true;w.HTMLElement.prototype.scrollIntoView=function(){};
  w.MessageChannel=class{constructor(){this.port1={onmessage:null};this.port2={postMessage:()=>setImmediate(()=>this.port1.onmessage?.())};}};
  let account={id:'self',email:'self@example.invalid',user_metadata:{full_name:'QA Medarbeider',mobile:'12345678',other:'preserve'}},updates=[],pref=false,prefWrites=[],contactAvailable=false,contactRev=1,employeeRev=3,revoked=false,lateContact=null;
  const context={company_id:'a',user_id:'self',enabled:true,available:true,administer:false};
  let contactData={address:'QA Gate',relative_name:'QA Pårørende',relative_phone:'87654321'};
  const contact=()=>({context,registered:true,available:contactAvailable,editable:true,employee:{id:'e',revision:employeeRev},revision:contactRev,data:contactAvailable?structuredClone(contactData):null});
  w.__client={auth:{getUser:async()=>({data:{user:structuredClone(account)}}),updateUser:async p=>{updates.push(structuredClone(p));account={...account,user_metadata:p.data};return {data:{user:structuredClone(account)}};}},rpc:async(name,args)=>{
   if(name==='get_my_marketing_email_preference')return {data:{email_opt_in:pref}};
   if(name==='set_my_marketing_email_preference'){pref=args.p_opt_in;prefWrites.push(pref);return {data:{email_opt_in:pref}};}
   if(name==='hr_contact_get'){
    if(lateContact)return new Promise(resolve=>lateContact.resolve=resolve);
    if(revoked)return {error:{code:'42501',message:'revoked'}};
    return {data:contact()};
   }
   if(name==='hr_contact_save'){assert.equal(args.p_contact_revision,contactRev);assert.equal(args.p_employee_revision,employeeRev);contactData=structuredClone(args.p_data);contactRev++;return {data:{context,employee:{id:'e',revision:employeeRev},revision:contactRev}};}
   if(name==='hr_personal_list')return {data:{context,employees:[],next:null}};
   throw new Error('Unexpected RPC '+name);
  }};
  w.eval((Array.isArray(bundle)?bundle[0]:bundle).output.find(i=>i.type==='chunk').code);
  const act=w.__act,doc=w.document;
  const button=text=>{const b=[...doc.querySelectorAll('button')].find(b=>b.textContent.trim()===text);assert(b,'Missing button '+text);return b;};
  const click=async text=>act(async()=>button(text).click());
  const input=label=>{const l=[...doc.querySelectorAll('label')].find(l=>l.querySelector('span')?.textContent===label||l.firstChild?.textContent===label);assert(l,'Missing '+label);return l.querySelector('input');};
  const write=async(label,value)=>act(async()=>{const i=input(label);Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype,'value').set.call(i,value);i.dispatchEvent(new w.Event('input',{bubbles:true}));});
  const submit=async text=>act(async()=>button(text).closest('form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true})));
  const personal={...context,company_name:'QA Firma',personal_page:true,company_kshms:true,company_hr:true,hr_management:false};
  const props=()=>({context:personal,kshmsContext:{...context},hrContext:context,userId:'self',authUser:structuredClone(account),supabaseClient:w.__client});
  await act(async()=>w.__render('page',{context:null,userId:undefined,authUser:null,supabaseClient:w.__client}));
  assert(!doc.querySelector('.personal-page'),'anonymous loading must not crash or expose Min side');
  await act(async()=>w.__render('page',props()));
  assert.equal(doc.querySelectorAll('.personal-card').length,3,'compact overview has three cards');
  assert.equal(doc.querySelectorAll('.personal-upcoming').length,2,'upcoming HR types are grouped');
  assert.equal(doc.querySelectorAll('.personal-status').length,2);
  await click('Profil og e-post');assert.equal(input('Fullt navn').value,'QA Medarbeider');assert.equal(input('E-postadresse').readOnly,true);
  assert(!doc.querySelector('input[autocomplete="street-address"]'),'closed private gate must not collect data');
  await write('Fullt navn','QA Endret navn');await write('Mobilnummer','11223344');
  const optIn=doc.querySelector('input[type=checkbox]');assert(optIn);await act(async()=>optIn.click());assert(optIn.checked);
  await click('Oversikt');await click('Personalhåndbok');assert(doc.body.textContent.includes('Handbook personal route'));
  await click('Profil og e-post');assert.equal(input('Fullt navn').value,'QA Endret navn');assert(optIn.checked,'email draft survives navigation');
  await act(async()=>w.__render('page',{...props(),context:null}));assert.equal(input('Fullt navn').value,'QA Endret navn');assert(optIn.checked,'email draft survives temporary access refresh');
  await act(async()=>w.__render('page',props()));await click('Profil og e-post');
  await submit('Lagre kontaktopplysninger');assert.equal(updates.length,1);assert.equal(updates[0].data.full_name,'QA Endret navn');assert.equal(updates[0].data.mobile,'11223344');assert.equal(updates[0].data.other,'preserve');assert(!('relative_name' in updates[0].data));assert(doc.body.textContent.includes('Kontaktopplysningene er lagret'));
  await act(async()=>w.__render('page',props()));assert(button('Lagre kontaktopplysninger').disabled);
  await click('Lagre e-postvalg');assert.deepEqual(prefWrites,[true]);
  await write('Fullt navn','QA Skal ikke lagres');account={...account,id:'someone-else'};await submit('Lagre kontaktopplysninger');assert.equal(updates.length,1,'different authenticated actor must not receive old form');assert(doc.querySelector('[role=alert]'));
  await act(async()=>w.__unmount());
  account.id='self';contactAvailable=true;
  await act(async()=>w.__render('private',{context}));assert.equal(input('Pårørendes fulle navn').value,'QA Pårørende');await write('Pårørendes telefon','44556677');await act(async()=>w.dispatchEvent(new w.Event('focus')));assert.equal(input('Pårørendes telefon').value,'44556677','unchanged foreground check preserves contact draft');await submit('Lagre adresse og pårørende');assert.equal(contactData.relative_phone,'44556677');assert.equal(contactRev,2);assert(doc.body.textContent.includes('Kontaktprofilen er lagret'));
  revoked=true;await act(async()=>w.dispatchEvent(new w.Event('focus')));assert(!doc.querySelector('input'),'revocation removes private fields');assert(doc.querySelector('[role=alert]'));
  revoked=false;lateContact={};await act(async()=>w.dispatchEvent(new w.Event('focus')));const pending=lateContact.resolve;assert(pending);await act(async()=>w.__unmount());lateContact=null;await act(async()=>pending({data:contact()}));assert(!doc.querySelector('input'),'late data cannot revive old UI');
  let suggestionWrites=[];await act(async()=>w.__render('suggestion',{label:'formål',text:'Forslag',value:'Min tekst',onUse:value=>suggestionWrites.push(value)}));assert.equal(suggestionWrites.length,0,'never replace existing text on mount');await click('Bruk forslag til formål');assert.equal(suggestionWrites.length,0);await click('Behold min tekst');assert.equal(suggestionWrites.length,0);await click('Bruk forslag til formål');await click('Erstatt teksten');assert.deepEqual(suggestionWrites,['Forslag']);
  assert.equal(w.localStorage.length,0);assert.equal(w.sessionStorage.length,0);
  await act(async()=>w.__unmount());
  console.log('Actual Min side/contacts/suggestions/email React PASS: three compact cards, own account save, fresh wrong-actor rejection, preserved account/email drafts, personal handbook route, closed private gate, contact CAS save, revocation and late unmount, explicit suggestion replacement. Synthetic transport; handbook body stubbed. No live user/profile changes.');
 }finally{dom.window.close();}
}finally{fs.rmSync(temp,{recursive:true,force:true});}
