import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
const {JSDOM}=await import(process.env.KSHMS_JSDOM_PATH||'jsdom');
const root=process.cwd(),temp=fs.mkdtempSync(path.join(os.tmpdir(),'supplier-drawer-'));
let checks=0;const eq=(a,b,message)=>{assert.deepEqual(a,b,message);checks++;};
try {
 const entry=path.join(temp,'entry.jsx');
 fs.writeFileSync(entry,`import React,{act} from '${root}/node_modules/react/index.js';import {createRoot} from '${root}/node_modules/react-dom/client.js';import Order from '${root}/src/modules/storeCatalog/SupplierOrder.jsx';window.act=act;const app=createRoot(document.getElementById('app'));window.render=()=>app.render(<Order companyId="qa-firm" orderNumber="00458" items={[{id:'a',description:'QA vare',supplier_name:'QA produsent',pickQuantity:'2,5'}]}/>);window.unmount=()=>app.unmount();`);
 const out=await build({root,configFile:false,logLevel:'silent',define:{'process.env.NODE_ENV':JSON.stringify('development')},resolve:{alias:{'react/jsx-runtime':root+'/node_modules/react/jsx-runtime.js'}},plugins:[react(),{name:'supplier-mock',enforce:'pre',resolveId(id){if(id.endsWith('/supplierOrderClient.js'))return '\0supplier-mock';},load(id){if(id==='\0supplier-mock')return 'export const supplierOrderContext=()=>window.context();export const prepareSupplierOrder=(...args)=>window.prepare(...args);export const sendSupplierOrder=()=>{throw Error("Sending forbidden in drawer-only test");};export const deleteSupplierOrderContact=()=>{throw Error("Contact deletion forbidden");};';}}],build:{write:false,minify:false,lib:{entry,formats:['iife'],name:'SupplierDrawerProof',cssFileName:'supplier-drawer-proof'}}});
 const dom=new JSDOM('<div id="app"></div>',{url:'https://example.invalid/',runScripts:'outside-only',pretendToBeVisual:true});
 try {
  const w=dom.window;w.IS_REACT_ACT_ENVIRONMENT=true;
  w.MessageChannel=class{constructor(){this.port1={onmessage:null};this.port2={postMessage:()=>setImmediate(()=>this.port1.onmessage?.())};}};
  w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};
  w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');this.dispatchEvent(new w.Event('close'));};
  const calls=[];let release;
  w.context=async()=>({company:{companyName:'QA firma'},replyTo:'sender@example.invalid',contacts:[]});
  w.prepare=async(company,id,order)=>{calls.push({company,id,order});return new Promise(resolve=>{release=()=>resolve({snapshot:{...order,company:{companyName:'QA firma'},replyTo:'sender@example.invalid',totalNet:10,items:[]}});});};
  w.eval((Array.isArray(out)?out[0]:out).output.find(x=>x.type==='chunk').code);
  const doc=w.document,button=name=>[...doc.querySelectorAll('button')].find(b=>b.textContent.trim()===name||b.getAttribute('aria-label')===name);
  const click=async name=>{assert(button(name),name);await w.act(async()=>button(name).click());};
  const fill=async(label,value)=>{const field=[...doc.querySelectorAll('label')].find(l=>l.textContent.startsWith(label)).querySelector('input,textarea');await w.act(async()=>{Object.getOwnPropertyDescriptor(field.tagName==='TEXTAREA'?w.HTMLTextAreaElement.prototype:w.HTMLInputElement.prototype,'value').set.call(field,value);field.dispatchEvent(new w.Event('input',{bubbles:true}));});};
  await w.act(async()=>w.render());await click('Send bestilling til leverandør');
  eq(doc.querySelector('dialog').open,true,'actual panel opens');
  eq(button('Forhåndsvis bestilling').form,doc.querySelector('form'),'footer submits actual form');
  eq(doc.querySelector('.pd-workspace-drawer-footer').contains(button('Forhåndsvis bestilling')),true,'primary action belongs to fixed footer');
  await fill('Leverandørnavn','QA mottaker');await fill('E-post til leverandør','recipient@example.invalid');await fill('Leveringsadresse','QA testadresse');
  await click('Forhåndsvis bestilling');
  eq(calls.length,1,'one explicit prepare');eq(calls[0].company,'qa-firm','same firm scope');eq(calls[0].order.to,'recipient@example.invalid','same chosen recipient');eq(calls[0].order.items[0].quantity,'2.5','same normalized quantity');
  eq(button('Lukk bestilling').disabled,true,'header blocked during attempt');eq(button('Avbryt').disabled,true,'footer blocked during attempt');
  const cancel=new w.Event('cancel',{bubbles:false,cancelable:true});await w.act(async()=>doc.querySelector('dialog').dispatchEvent(cancel));eq(cancel.defaultPrevented,true,'Escape prevented while busy');
  await w.act(async()=>doc.querySelector('dialog').dispatchEvent(new w.MouseEvent('click',{bubbles:true})));eq(doc.querySelector('dialog').open,true,'backdrop cannot dismiss busy attempt');
  await w.act(async()=>release());eq(button('Send bestilling').disabled,false,'preview unlocks canonical send');
  eq(doc.querySelector('.pd-workspace-drawer-footer').contains(button('Send bestilling')),true,'send stays in footer');
  await click('Rediger bestilling');await click('Lukk bestilling');eq(doc.querySelector('dialog'),null,'header close unmounts drawer');
  await click('Send bestilling til leverandør');eq([...doc.querySelectorAll('input')].some(i=>i.value==='QA mottaker'),true,'recipient draft survives close/reopen');eq(calls.length,1,'reopen never submits');
  await w.act(async()=>w.unmount());eq(doc.querySelector('dialog'),null,'unmount removes portal');
  console.log('Supplier drawer actual React: '+checks+' assertions PASS; native form association, scoped payload, footer actions, busy close/cancel/backdrop and retained draft. No send transport.');
 } finally {dom.window.close();}
} finally {fs.rmSync(temp,{recursive:true,force:true});}
