import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {build} from 'vite';import react from '@vitejs/plugin-react';
const {JSDOM}=await import(process.env.KSHMS_JSDOM_PATH||'jsdom');
const cwd=process.cwd(),temp=fs.mkdtempSync(path.join(os.tmpdir(),'bolig-collab-'));
const rpc=path.join(temp,'rpc.js'),stub=path.join(temp,'stub.jsx'),entry=path.join(temp,'entry.jsx');
fs.writeFileSync(rpc,`export async function collaborationRpc(name,args,user){return window.__rpc(name,args,user);}`);
fs.writeFileSync(stub,`import React,{useEffect,useState} from '${cwd}/node_modules/react/index.js';export default function Editor(){const [note,setNote]=useState('');useEffect(()=>{window.__mounts++;return()=>window.__unmounts++;},[]);return <label>Arbeidsutkast<input value={note} onChange={e=>setNote(e.target.value)}/></label>;}`);
fs.writeFileSync(entry,`import React,{act} from '${cwd}/node_modules/react/index.js';import {createRoot} from '${cwd}/node_modules/react-dom/client.js';import Page from '${cwd}/src/modules/bolig/BoligMyCollaborations.jsx';const root=createRoot(document.getElementById('app'));window.__act=act;window.__render=()=>root.render(<Page userId="user"/>);window.__dispose=()=>root.unmount();`);
const built=await build({root:cwd,configFile:false,logLevel:'silent',define:{'process.env.NODE_ENV':'"development"'},plugins:[react({jsxRuntime:"classic"})],resolve:{alias:[{find:'./boligCollaborationClient.js',replacement:rpc},{find:'./BoligCatalog.jsx',replacement:stub},{find:'./BoligPackageChoices.jsx',replacement:stub}]},build:{write:false,minify:false,lib:{entry,formats:['iife'],name:'CollabProof',cssFileName:'collab-proof'}}});
const dom=new JSDOM('<div id="app"></div>',{url:'https://qa.invalid',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window;
w.MessageChannel=class{constructor(){this.port1={onmessage:null};this.port2={postMessage:()=>setImmediate(()=>this.port1.onmessage?.())};}};
w.IS_REACT_ACT_ENVIRONMENT=true;w.__mounts=0;w.__unmounts=0;let rejectAccess=false,resolveRefresh=null,hold=false,malformed=false;
w.__rpc=async(name,args)=>{if(hold)await new Promise(resolve=>resolveRefresh=resolve);if(malformed)return {};if(rejectAccess)throw Object.assign(Error('Tilgang tilbakekalt'),{code:'42501'});return args.p_root_id?{root:{id:'r',title:'QA'},context:{user_id:'user',company_id:'c',company_name:'QA'},units:[{id:'u',number:'38',address:'QA',contact_name:'QA'}]}:{projects:[{id:'r',title:'QA',company:'QA'}]};};
w.eval((Array.isArray(built)?built[0]:built).output.find(x=>x.type==='chunk').code);const act=w.__act;
try{
 await act(()=>w.__render());await act(()=>[...w.document.querySelectorAll('button')].find(b=>b.textContent==='QA · QA').click());
 await act(()=>{const select=w.document.querySelector('select');select.value='u';select.dispatchEvent(new w.Event('change',{bubbles:true}));});
 assert.equal(w.__mounts,1);const input=w.document.querySelector('input:not([type="search"])');
 await act(()=>{Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype,'value').set.call(input,'Uferdig vare og arbeid');input.dispatchEvent(new w.Event('input',{bubbles:true}));});
 hold=true;await act(()=>w.dispatchEvent(new w.Event('focus')));
 assert.equal(w.__unmounts,0,'Pending authorization refresh must retain editor');assert.equal(input.value,'Uferdig vare og arbeid');
 hold=false;await act(async()=>{resolveRefresh();await Promise.resolve();});assert.equal(w.__mounts,1,'Same access keeps same editor');assert.equal(input.value,'Uferdig vare og arbeid');
 rejectAccess=true;await act(()=>w.dispatchEvent(new w.Event('focus')));assert.equal(w.__unmounts,1,'Revoked access removes editor');assert(w.document.body.textContent.includes('Tilgang tilbakekalt'));
 rejectAccess=false;malformed=true;await act(()=>w.dispatchEvent(new w.Event('focus')));assert(w.document.body.textContent.includes('Prosjektgrunnlaget kunne ikke leses'));assert.equal(w.__mounts,1,'Malformed response cannot remount editor');
 console.log('PASS collaboration React: delayed refresh retains editor and draft; same access preserves mount; revocation removes access');
}finally{await act(()=>w.__dispose());dom.window.close();fs.rmSync(temp,{recursive:true,force:true});}
