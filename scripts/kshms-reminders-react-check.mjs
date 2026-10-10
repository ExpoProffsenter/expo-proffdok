import assert from 'node:assert/strict';
import fs from 'node:fs';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
import os from 'node:os';
import path from 'node:path';
const {JSDOM}=await import(process.env.KSHMS_JSDOM_PATH||'jsdom');
const dir=process.cwd(),temporary=fs.mkdtempSync(path.join(os.tmpdir(),'kshms-reminders-')),entry=path.join(temporary,'entry.jsx');
try {
 fs.writeFileSync(entry,`import React,{act} from '${dir}/node_modules/react/index.js';import {createRoot} from '${dir}/node_modules/react-dom/client.js';import Tasks from '${dir}/src/modules/kshms/KshmsTasks.jsx';const root=createRoot(document.getElementById('app'));globalThis.__act=act;globalThis.__render=p=>root.render(React.createElement(Tasks,p));globalThis.__unmount=()=>root.unmount();`);
 const bundled=await build({root:dir,configFile:false,logLevel:'silent',define:{'process.env.NODE_ENV':'"development"'},build:{write:false,minify:false,lib:{entry,formats:['iife'],name:'ReminderProof',cssFileName:'reminder-proof'}},plugins:[react(),{name:'test-boundaries',enforce:'pre',resolveId(id){if(/kshmsAccess\.js$/.test(id))return '\0rpc';if(/KshmsExecutionTasks\.jsx$/.test(id))return '\0executions';},load(id){if(id==='\0rpc')return 'export const kshmsRpc=(...a)=>globalThis.__rpc(...a);';if(id==='\0executions')return 'export default function(){return null;}';}}]});
 const dom=new JSDOM('<div id="app"></div>',{url:'https://example.invalid',runScripts:'outside-only',pretendToBeVisual:true});
 try {
  const {window}=dom;window.IS_REACT_ACT_ENVIRONMENT=true;
  window.MessageChannel=class{constructor(){this.port1={onmessage:null};this.port2={postMessage:()=>setImmediate(()=>this.port1.onmessage?.())};}};
  const company='11111111-1111-4111-8111-111111111111',user='22222222-2222-4222-8222-222222222222';
  const context={company_id:company,user_id:user,enabled:true},opened=[],calls=[];
  const tasks={company_id:company,user_id:user,count:4,overdue:1,due_today:1,due_soon:1,items:['overdue','today','soon','later'].map((status,i)=>({id:`00000000-0000-4000-8000-00000000000${i}`,title:`QA ${status}`,due_on:`2026-10-${8+i}`,deadline_status:status}))};
  let reply=tasks,offline=false;
  window.__rpc=async(name,args)=>{calls.push(name);assert.equal(name,'kshms_deviation_tasks');assert.equal(args.p_company_id,company);if(offline)throw Error('Offline fixture');return reply;};
  window.eval((Array.isArray(bundled)?bundled.flatMap(x=>x.output):bundled.output).find(x=>x.type==='chunk').code);const act=window.__act;
  const props={context,onOpen:async id=>{opened.push(id);return true;}};
  await act(async()=>window.__render(props));
  for(const text of ['1 etter fristen','1 med frist i dag','1 med frist innen tre dager','Fristen er passert','Frist i dag','Frist innen tre dager'])assert(window.document.body.textContent.includes(text),text);
  const late=[...window.document.querySelectorAll('button')].find(x=>x.textContent.includes('QA overdue'));
  await act(async()=>late.click());assert.equal(opened[0],tasks.items[0].id);
  offline=true;await act(async()=>window.dispatchEvent(new window.Event('focus')));
  assert(window.document.body.textContent.includes('Sist bekreftede oppgaver er beholdt'));assert(window.document.body.textContent.includes('QA overdue'));
  offline=false;reply={...tasks,count:0,overdue:0,due_today:0,due_soon:0,items:[]};
  await act(async()=>window.dispatchEvent(new window.CustomEvent('expo:kshms:deviation-change',{detail:{company_id:company}})));
  assert.equal(window.document.querySelector('aside'),null,'confirmed closure clears deadline banner');
  reply=tasks;await act(async()=>window.__render({...props,context:{...context,enabled:false}}));
  assert.equal(window.document.querySelector('aside'),null);const before=calls.length;await act(async()=>window.dispatchEvent(new window.Event('focus')));assert.equal(calls.length,before,'disabled component removed listeners');
  assert(calls.every(name=>name==='kshms_deviation_tasks'),'reading reminder UI issued a command');
  await act(async()=>window.__unmount());
 } finally {dom.window.close();}
} finally {fs.rmSync(temporary,{recursive:true,force:true});}
console.log('Real React reminder tasks: PASS — deadline labels, protected case opening, offline retention, confirmed closure and disabled cleanup; read-only RPCs.');
