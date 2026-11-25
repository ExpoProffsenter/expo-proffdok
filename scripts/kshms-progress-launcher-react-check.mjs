import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
const {JSDOM}=await import(process.env.KSHMS_JSDOM_PATH||'jsdom');
const root=process.cwd(),temp=fs.mkdtempSync(path.join(os.tmpdir(),'plan-launcher-'));
let checks=0;
try{
 const entry=path.join(temp,'entry.jsx');
 fs.writeFileSync(entry,`import React,{act} from '${root}/node_modules/react/index.js';import {createRoot} from '${root}/node_modules/react-dom/client.js';import Board from '${root}/src/modules/kshms/KshmsProgressBoard.jsx';const root=createRoot(document.getElementById('app'));window.act=act;window.render=p=>root.render(React.createElement(Board,p));window.clear=()=>root.render(null);`);
 const bundle=await build({root,configFile:false,logLevel:'silent',plugins:[react()],define:{'process.env.NODE_ENV':'"development"'},build:{write:false,minify:false,lib:{entry,formats:['iife'],name:'PlanLauncherProof',cssFileName:'plan-launcher-proof'}}});
 const dom=new JSDOM('<button id="outside">Other owner</button><div id="app"></div>',{url:'https://example.invalid',pretendToBeVisual:true,runScripts:'outside-only'});
 try{
  const w=dom.window;w.IS_REACT_ACT_ENVIRONMENT=true;
  w.HTMLElement.prototype.scrollIntoView=function(){};w.HTMLElement.prototype.scrollTo=function(){};
  // JSDOM has no layout/native top layer; geometry and showModal are synthetic.
  // The actual React board, dialog lifetime, refs and focus cleanup run unchanged.
  w.HTMLElement.prototype.getClientRects=function(){return this.closest('[hidden],[inert]')?[]:[{width:100,height:44}];};
  w.HTMLDialogElement.prototype.showModal=function(){this.open=true;this.querySelector('button')?.focus();};
  w.ResizeObserver=class{observe(){}disconnect(){}};
  w.MessageChannel=class{constructor(){this.port1={onmessage:null};this.port2={postMessage:()=>setImmediate(()=>this.port1.onmessage?.())};}};
  w.eval((Array.isArray(bundle)?bundle[0]:bundle).output.find(x=>x.type==='chunk').code);
  const plan={version:1,excludeSundays:true,activities:[{id:'one',title:'QA retained activity',trade:'Rørlegger',resource:'QA',status:'Ikke startet',sessions:[]}]};
  const baseline=JSON.stringify(plan);let writes=0,serial=0;
  const props=extra=>({plan,meta:{title:'QA Plan'},readOnly:false,dirty:true,saving:false,operations:[],stateKey:'qa:'+ ++serial,onPlanChange:()=>writes++,onSave:()=>writes++,...extra});
  const button=name=>{const n=[...w.document.querySelectorAll('button')].find(n=>(n.getAttribute('aria-label')||n.textContent).trim()===name);assert(n,'Missing '+name);return n;};
  const click=async name=>w.act(async()=>button(name).click());
  const check=(value,label)=>{assert(value,label);checks++;};
  await w.act(async()=>w.render(props()));
  await click('Lukk planbygger');check(w.document.activeElement===button('Åpne fremdriftsplan'),'auto-opened plan close must focus its newly mounted schedule launcher');
  await click('Åpne bemanningsplan');await click('Lukk planbygger');check(w.document.activeElement===button('Åpne bemanningsplan'),'staffing close must focus its staffing launcher');
  await click('Åpne fremdriftsplan');await click('Lukk planbygger');check(w.document.activeElement===button('Åpne fremdriftsplan'),'reopened schedule keeps its own return');
  check(JSON.stringify(plan)===baseline&&writes===0,'launcher cycles preserve the actual dirty plan without writes');
  check(w.document.querySelector('.ks-plan-launcher').textContent.includes('ulagrede endringer'),'dirty reminder remains after explicit close');
  await w.act(async()=>w.clear());
  const outside=w.document.getElementById('outside');
  await w.act(async()=>w.render(props({returnFocusTarget:()=>outside})));await click('Lukk planbygger');check(w.document.activeElement===outside,'explicit external owner keeps focus priority');
  await w.act(async()=>w.clear());
  await w.act(async()=>w.render(props({returnFocusTarget:()=>null})));await click('Lukk planbygger');check(w.document.activeElement!==button('Åpne fremdriftsplan'),'rejected external owner must not fall back to launcher');
  await w.act(async()=>w.clear());
  await w.act(async()=>w.render(props()));Object.defineProperty(w.document,'visibilityState',{value:'hidden',configurable:true});await click('Lukk planbygger');check(w.document.activeElement!==button('Åpne fremdriftsplan'),'hidden document never receives launcher focus');Object.defineProperty(w.document,'visibilityState',{value:'visible',configurable:true});
  await w.act(async()=>w.clear());
  await w.act(async()=>w.render(props()));w.document.getElementById('app').hidden=true;await click('Lukk planbygger');check(w.document.activeElement!==button('Åpne fremdriftsplan'),'hidden owner never receives launcher focus');w.document.getElementById('app').hidden=false;
  await w.act(async()=>w.clear());
  const first=props();await w.act(async()=>w.render(first));await w.act(async()=>w.render({...first,stateKey:'other-company:other-plan'}));await click('Lukk planbygger');check(w.document.activeElement!==button('Åpne fremdriftsplan'),'changed owner identity cannot receive previous plan focus');
  check(JSON.stringify(plan)===baseline&&writes===0,'all focus/revocation scenarios leave plan and writes unchanged');
  await w.act(async()=>w.clear());
 }finally{dom.window.close();}
}finally{fs.rmSync(temp,{recursive:true,force:true});}
console.log(`Plan launcher actual React: ${checks} assertions PASS; schedule/staffing return, dirty plan, explicit owner/null, hidden document/owner and changed scope; synthetic native dialog/layout only.`);
