import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {build} from 'vite';import react from '@vitejs/plugin-react';
const {JSDOM}=await import(process.env.KSHMS_JSDOM_PATH||'jsdom');const cwd=process.cwd(),temp=fs.mkdtempSync(path.join(os.tmpdir(),'staff-react-'));
fs.writeFileSync(path.join(temp,'rpc.js'),`export const collaborationRpc=(...a)=>window.__rpc(...a);`);
fs.writeFileSync(path.join(temp,'entry.jsx'),`import React,{act} from '${cwd}/node_modules/react/index.js';import {createRoot} from '${cwd}/node_modules/react-dom/client.js';import Staff from '${cwd}/src/modules/bolig/BoligShopStaff.jsx';const root=createRoot(document.getElementById('app'));window.__act=act;window.__render=()=>root.render(<Staff key={window.__key||'first'} context={{user_id:'user',company_id:'firm'}} root={{id:'project',title:'QA Boligprosjekt'}}/>);window.__dispose=()=>root.unmount();`);
const built=await build({root:cwd,configFile:false,logLevel:'silent',plugins:[react({jsxRuntime:'classic'})],define:{'process.env.NODE_ENV':'"development"'},resolve:{alias:[{find:'./boligCollaborationClient.js',replacement:path.join(temp,'rpc.js')}]},build:{write:false,minify:false,lib:{entry:path.join(temp,'entry.jsx'),formats:['iife'],name:'StaffQA',cssFileName:'staff-qa'}}});
const dom=new JSDOM('<div id="app"></div>',{url:'https://qa.invalid',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window;w.IS_REACT_ACT_ENVIRONMENT=true;w.MessageChannel=class{constructor(){this.port1={onmessage:null};this.port2={postMessage:()=>setImmediate(()=>this.port1.onmessage?.())};}};
let owner=false,found=false,lost=false,deny=false,held=null,calls=[];const staff=[];
w.__rpc=async(name,args)=>{calls.push(structuredClone(args));if(deny)throw Object.assign(Error('Tilgangen er tilbakekalt'),{code:'42501'});if(held)await held;
 const p=args.p_payload;if(args.p_action==='assign'){if(!staff.length)staff.push({id:'a',email:p.email,enabled:true,active:true,revision:1,expires_at:'2027-01-01'});if(lost){lost=false;throw Error('Svar mangler');}}
 if(args.p_action==='revoke')staff[0].enabled=false;
 return {can_assign:!owner,support:!owner,staff:structuredClone(staff),candidate:args.p_action==='lookup'&&found?{id:'employee',email:p.email,companies:'QA Expo',revision:0}:null};};
w.eval((Array.isArray(built)?built[0]:built).output.find(x=>x.type==='chunk').code);
const act=w.__act,button=text=>[...w.document.querySelectorAll('button')].find(b=>b.textContent.includes(text));
const fill=async(value)=>act(()=>{const input=w.document.querySelector('input[type=email]');Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype,'value').set.call(input,value);input.dispatchEvent(new w.Event('input',{bubbles:true}));});
try{
 await act(()=>w.__render());assert(w.document.body.textContent.includes('systemadmin i supportmodus'));await fill('missing@example.invalid');await act(()=>button('Finn ansatt').click());assert(w.document.body.textContent.includes('Ingen godkjent ansatt'));assert(!button('Gi tilgang'));
 found=true;await fill('employee@example.invalid');await act(()=>button('Finn ansatt').click());assert(button('Gi tilgang'));await fill('another@example.invalid');assert(!button('Gi tilgang'),'Changing email invalidates previous lookup');
 await fill('employee@example.invalid');await act(()=>button('Finn ansatt').click());lost=true;await act(()=>button('Gi tilgang').click());assert(button('Kontroller samme lagring'));assert.equal(w.document.querySelector('input[type=email]').disabled,false);assert.equal(w.document.querySelector('fieldset').disabled,true,'Fields locked while uncertain save');
 // Simulate a reload: pending mutation and email are recovered, list read cannot execute it.
 const count=calls.filter(c=>c.p_action==='assign').length;w.__key='reload';await act(()=>w.__render());assert.equal(calls.filter(c=>c.p_action==='assign').length,count);assert.equal(w.document.querySelector('input[type=email]').value,'employee@example.invalid');
 await act(()=>button('Kontroller samme lagring').click());const assignments=calls.filter(c=>c.p_action==='assign');assert.deepEqual(assignments[0],assignments[1]);assert.equal(staff.length,1);assert(w.document.body.textContent.includes('Min side → Mine boligprosjekter'));
 owner=true;w.__key='owner';await act(()=>w.__render());assert(!button('Finn ansatt'));assert(button('Trekk tilbake'));await act(()=>button('Trekk tilbake').click());assert(w.document.body.textContent.includes('Tilbakekalt'));
 deny=true;await act(()=>button('Hent siste status').click());assert(!button('Trekk tilbake'));assert(w.document.querySelector('[role=alert]'));
 console.log('PASS staff React: missing account, explicit review, changed email invalidation, persisted retry after reload, same request, owner revoke, lost access and support guidance');
}finally{await act(()=>w.__dispose());dom.window.close();fs.rmSync(temp,{recursive:true,force:true});}
