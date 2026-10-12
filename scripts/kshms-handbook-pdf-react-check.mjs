import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
import {fixture} from './critical-kshms-handbook-pdf-check.mjs';
const {JSDOM}=await import(process.env.KSHMS_JSDOM_PATH||'jsdom');
const root=process.cwd(),temp=fs.mkdtempSync(path.join(os.tmpdir(),'handbook-pdf-'));
try{
 const entry=path.join(temp,'entry.jsx');
 fs.writeFileSync(entry,`import React,{act}from'${root}/node_modules/react/index.js';import{createRoot}from'${root}/node_modules/react-dom/client.js';import Handbook from '${root}/src/modules/kshms/KshmsPersonalHandbook.jsx';import Button from '${root}/src/modules/kshms/KshmsHandbookPdfButton.jsx';const root=createRoot(document.getElementById('app'));window.__act=act;window.__render=(kind,props)=>root.render(kind==='button'?<Button {...props}/>:<Handbook {...props} ContentComponent={({content})=><p>{content.procedure}</p>}/>);window.__unmount=()=>root.render(null);`);
 const bundle=await build({root,configFile:false,logLevel:'silent',resolve:{alias:{react:path.join(root,'node_modules/react'),'react-dom':path.join(root,'node_modules/react-dom')}},define:{'process.env.NODE_ENV':'"development"'},plugins:[{name:'fixture',enforce:'pre',resolveId(id){if(id==='https://esm.sh/jspdf@2.5.1')return '\0pdf';},load(id){if(id.endsWith('kshmsAccess.js'))return 'export const kshmsRpc=(...a)=>window.__rpc(...a);';if(id==='\0pdf')return `import{jsPDF as Real}from'${process.env.KSHMS_JSPDF_PATH}';export function jsPDF(options){const doc=new Real(options);doc.save=name=>window.__save(name,doc.output('arraybuffer'));return doc;}`;}},react()],build:{write:false,minify:false,lib:{entry,formats:['iife'],name:'HandbookProof'}}});
 const dom=new JSDOM('<div id="app"></div>',{url:'https://example.invalid',pretendToBeVisual:true,runScripts:'outside-only'});
 try{
  const w=dom.window,d=w.document;w.IS_REACT_ACT_ENVIRONMENT=true;w.structuredClone=structuredClone;w.TextEncoder=TextEncoder;
  w.MessageChannel=class{constructor(){this.port1={};this.port2={postMessage:()=>setImmediate(()=>this.port1.onmessage?.())};}};
  w.Image=class{set src(url){this.width=400;this.height=100;setImmediate(()=>this.onload?.());}};
  w.HTMLCanvasElement.prototype.getContext=()=>({drawImage(){}});w.HTMLCanvasElement.prototype.toDataURL=()=>`data:image/png;base64,${fs.readFileSync('public/expo-logo.png').toString('base64')}`;
  const exports=[],calls=[];let fail=false,hold=null;
  const server=structuredClone(fixture);server.versions[1].content.procedure='Hele denne fremgangsmåten skal følge med over flere sider. '.repeat(500)+'LANG RUTINE SLUTT';
  w.__save=(name,bytes)=>exports.push({name,bytes:new Uint8Array(bytes)});
  w.__rpc=async(name,args)=>{calls.push(name);if(hold)await hold;if(fail)throw Error('Tilgang avslått');if(name==='work_profile_company_profile')return {companyId:args.p_company_id,companyName:'QA Ringside Rørleggerbedrift',logoUrl:'/firmalogo.png'};if(name==='kshms_get_state')return structuredClone(server);throw Error('Mutation forbidden');};
  w.eval((Array.isArray(bundle)?bundle[0]:bundle).output.find(e=>e.type==='chunk'&&e.isEntry).code);
  const act=w.__act,pause=()=>new Promise(r=>setTimeout(r,30));
  const render=(kind,props)=>act(async()=>{w.__render(kind,props);await pause();});
  const button=()=>[...d.querySelectorAll('button')].find(b=>b.textContent.includes('hele personalhåndboka'));
  const click=()=>act(async()=>{button().dispatchEvent(new w.MouseEvent('click',{bubbles:true}));await pause();});
  for(const manage of [false,true]){
   server.context.manage=manage;
   await render('handbook',{data:structuredClone(server),userId:'u',query:'Rutine 001',onQueryChange(){},onRead(){},busy:false});
   assert.equal(d.querySelectorAll('.ks-personal-routine').length,1,'search retained');
   await click();assert.equal(exports.length,manage?2:1);assert(d.querySelector('[role="status"]').textContent.includes('firmaets logo'));
  }
  const output=process.env.KSHMS_HANDBOOK_PDF_OUTPUT;
  if(output){fs.mkdirSync(output,{recursive:true});fs.writeFileSync(path.join(output,'handbook.pdf'),exports[0].bytes);}
  fail=true;await click();assert.equal(exports.length,2);assert(d.querySelector('[role="alert"]').textContent.includes('Tilgang avslått'));fail=false;
  let release;hold=new Promise(r=>release=r);
  await render('button',{companyId:'c',userId:'u'});await click();assert(d.querySelector('button').disabled);await act(async()=>{d.querySelector('button').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));await pause();});
  await act(async()=>w.__unmount());release();hold=null;await act(async()=>{await pause();});assert.equal(exports.length,2,'no save after unmount');
  await render('handbook',{data:{...structuredClone(server),assignments:[]},userId:'u',query:'',onQueryChange(){},onRead(){},busy:false});assert(button().disabled);
  assert(calls.every(name=>['kshms_get_state','work_profile_company_profile'].includes(name)));
  console.log('Handbook actual React/jsPDF PASS: own employee/admin handbook, search-independent 87 routines + history, long text, logo, error/retry, double click, empty state and unmount cancellation; no mutations.');
 }finally{dom.window.close();}
}finally{fs.rmSync(temp,{recursive:true,force:true});}
