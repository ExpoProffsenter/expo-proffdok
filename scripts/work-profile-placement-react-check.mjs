import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
const {JSDOM}=await import(process.env.KSHMS_JSDOM_PATH||'jsdom');
const cwd=process.cwd(),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'profile-placement-'));
let checks=0;const eq=(a,b,label)=>{assert.deepEqual(a,b,label);checks++;};
fs.writeFileSync(path.join(tmp,'entry.jsx'),`
import {act} from '${cwd}/node_modules/react/index.js';
import {installWorkProfileUx} from '${cwd}/src/modules/access/workProfileUx.jsx';
window.qaAct=act;installWorkProfileUx();
`);
const bundled=await build({root:cwd,configFile:false,logLevel:'silent',define:{'process.env.NODE_ENV':'"development"'},plugins:[react(),{
 name:'profile-placement-transport',enforce:'pre',resolveId(id){if(id.endsWith('/workProfileClient.js'))return '\0profile';},
 load(id){if(id==='\0profile')return `export const WORK_PROFILE_EVENT='qa-profile';export const readCachedWorkProfileState=()=>({...window.qa.state});export const getMyWorkProfileState=async()=>{const next={...window.qa.state};window.dispatchEvent(new CustomEvent('qa-profile',{detail:next}));return next;};export const setActiveWorkProfile=id=>{window.qa.writes.push(id);return new Promise((resolve,reject)=>{window.qa.reject=reject;});};`;}
}],build:{write:false,minify:false,lib:{entry:path.join(tmp,'entry.jsx'),formats:['iife'],name:'ProfilePlacement'}}});
const dom=new JSDOM('<div id="root"><header><div class="head"><div><img></div><h1>QA</h1></div></header><main><textarea>Bevart kladd</textarea></main></div>',{url:'https://qa.vercel.app/',runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window,errors=[];
const observers=[],NativeObserver=w.MutationObserver;
w.MutationObserver=class extends NativeObserver{constructor(callback){super(callback);observers.push(this);}};
const frames=new Set(),nativeFrame=w.requestAnimationFrame.bind(w),nativeCancel=w.cancelAnimationFrame.bind(w);
w.requestAnimationFrame=callback=>{const id=nativeFrame(time=>{frames.delete(id);callback(time);});frames.add(id);return id;};
w.addEventListener('error',e=>errors.push(e.message));w.IS_REACT_ACT_ENVIRONMENT=true;
w.MessageChannel=class{constructor(){this.port1={onmessage:null};this.port2={postMessage:()=>setImmediate(()=>this.port1.onmessage?.())};}};
w.mobile=false;w.matchMedia=()=>({matches:w.mobile});w.confirm=()=>false;
w.qa={writes:[],state:{can_switch:true,selection_required:true,active_company_id:'a',workspaces:[{company_id:'a',company_name:'QA Firma A'},{company_id:'b',company_name:'QA Firma B'}]}};
w.eval((Array.isArray(bundled)?bundled[0]:bundled).output.find(x=>x.type==='chunk').code);
const act=w.qaAct,settle=()=>act(async()=>{await new Promise(r=>w.requestAnimationFrame(()=>w.requestAnimationFrame(r)));});
const required=()=>w.document.querySelector('[role=dialog]');const host=()=>w.document.getElementById('expo-work-profile-switcher');
const emit=async patch=>{await act(async()=>{w.qa.state={...w.qa.state,...patch};w.dispatchEvent(new w.CustomEvent('qa-profile',{detail:{...w.qa.state}}));});await settle();};
const resize=async mobile=>{await act(async()=>{w.mobile=mobile;const marker=w.document.createElement('i');w.document.body.append(marker);marker.remove();});await settle();};
try{
 await resize(false);const original=required(),originalHost=host(),draft=w.document.querySelector('textarea');assert(original);
 for(const mobile of [true,false,true,false]){
  await resize(mobile);eq(required()===original,true,'required selection preserves exact node across responsive placement '+mobile);
  eq(host()===originalHost,true,'same root host across responsive placement');eq(original.isConnected,true,'required barrier stays connected');
  eq(mobile?host().previousElementSibling.className:host().parentElement.className,'head','native desktop/mobile placement retained');
  eq(w.document.querySelector('textarea')===draft,true,'unrelated draft node retained');
 }
 const choice=original.querySelector('button');await act(async()=>choice.click());await settle();eq(w.qa.writes,['a'],'one deliberate required selection invokes original setter');
 for(const mobile of [true,false]){
  await resize(mobile);eq([...required().querySelectorAll('button')].every(n=>n.disabled),true,'pending selection remains disabled after placement');
  await act(async()=>required().querySelector('button').click());eq(w.qa.writes,['a'],'responsive move cannot duplicate pending selection');
 }
 await act(async()=>w.qa.reject(Error('QA byttefeil')));await settle();eq(required().textContent.includes('QA byttefeil'),true,'original failure stays visible');
 await resize(true);await resize(false);eq(required().textContent.includes('QA byttefeil'),true,'responsive placement preserves failure instead of restarting picker');
 await act(async()=>w.document.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true})));await settle();eq(required()===original,true,'Escape cannot dismiss required selection');
 await emit({can_switch:false});eq(host(),null,'fresh revoked permission removes selector');
 await emit({can_switch:true,selection_required:false});eq(required(),null,'fresh server state ends required selection');eq(Boolean(host()),true,'authorized ordinary selector returns');
 const opener=host().querySelector('button');await act(async()=>opener.click());await settle();const menu=host().querySelector('.workProfileMenu'),option=menu.querySelectorAll('button')[1];option.focus();
 await resize(true);eq(host().querySelector('.workProfileMenu')===menu,true,'ordinary open picker survives placement');eq(w.document.activeElement===option,true,'focused option survives placement');
 await act(async()=>w.document.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true})));await settle();eq(host().querySelector('.workProfileMenu'),null,'ordinary Escape still closes menu');eq(w.document.activeElement===opener,true,'ordinary Escape restores original opener');
 eq(draft.value,'Bevart kladd','underlying unsent work is untouched');eq(w.qa.writes,['a'],'no automatic company switch');
 await act(async()=>w.history.replaceState({},'', '/?project=qa&role=kunde'));await resize(false);eq(host(),null,'customer portal never gains internal selector');eq(errors,[],'no asynchronous DOM errors');
 console.log('Work profile placement React: '+checks+' assertions PASS; actual adapter, required/pending/error/focus, fresh revocation, unchanged draft and no automatic switch. Synthetic transport only.');
}finally{for(const observer of observers)observer.disconnect();for(const id of frames)nativeCancel(id);dom.window.close();fs.rmSync(tmp,{recursive:true,force:true});}
