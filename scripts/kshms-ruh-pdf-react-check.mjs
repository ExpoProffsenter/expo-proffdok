import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
import {company,user,project,row,events,files,context} from './critical-kshms-ruh-pdf-check.mjs';
const {JSDOM}=await import(process.env.KSHMS_JSDOM_PATH||'jsdom');
const {getDocument}=await import(process.env.KSHMS_PDFJS_PATH||'pdfjs-dist/legacy/build/pdf.mjs');
const root=process.cwd(),temp=fs.mkdtempSync(path.join(os.tmpdir(),'ks-ruh-pdf-')),entry=path.join(temp,'entry.jsx');
const output=process.env.KSHMS_RUH_PDF_OUTPUT;assert(output);fs.mkdirSync(output,{recursive:true});
fs.writeFileSync(entry,`import React,{act} from '${root}/node_modules/react/index.js';import {createRoot} from '${root}/node_modules/react-dom/client.js';import Editor from '${root}/src/modules/kshms/KshmsDeviations.jsx';const root=createRoot(document.getElementById('app'));window.__act=act;window.__render=props=>root.render(<Editor {...props} key={props.context.user_id}/>);window.__unmount=()=>root.unmount();`);
const built=await build({root,configFile:false,logLevel:'silent',resolve:{alias:{react:path.join(root,'node_modules/react'),'react-dom':path.join(root,'node_modules/react-dom')}},define:{'process.env.NODE_ENV':'"development"'},plugins:[{name:'fixture',enforce:'pre',resolveId(id){if(id==='https://esm.sh/jspdf@2.5.1')return '\0qa-jspdf';},load(id){if(id.endsWith('kshmsAccess.js'))return 'export const kshmsRpc=(name,args)=>window.__rpc(name,args);';if(id.endsWith('appSupabaseClientRegistry.js'))return 'export const getAppSupabaseClient=()=>window.__client;';if(id==='\0qa-jspdf')return `import {jsPDF as Real} from '${process.env.KSHMS_JSPDF_PATH}';export function jsPDF(options){const doc=new Real(options);doc.save=name=>window.__save(name,doc.output('arraybuffer'));return doc;}`;}},react()],build:{write:false,minify:false,lib:{entry,formats:['iife'],name:'RuhPDF',cssFileName:'ruh-pdf'}}});
const dom=new JSDOM('<div id="app"></div>',{url:'https://qa.example.invalid',pretendToBeVisual:true,runScripts:'outside-only'}),{window}=dom,document=window.document;
window.MessageChannel=class{constructor(){this.port1={};this.port2={postMessage:()=>window.setTimeout(()=>this.port1.onmessage?.({data:null}),0)};}};window.IS_REACT_ACT_ENVIRONMENT=true;window.TextEncoder=TextEncoder;window.confirm=()=>true;window.HTMLElement.prototype.scrollIntoView=()=>{};
const photo='data:image/png;base64,'+fs.readFileSync(process.env.KSHMS_QA_PHOTO).toString('base64'),logo='data:image/png;base64,'+fs.readFileSync(process.env.KSHMS_QA_LOGO).toString('base64');
let revokedUrls=0,imageError=false;window.URL.createObjectURL=()=> 'blob:qa-photo';window.URL.revokeObjectURL=()=>revokedUrls++;
window.Image=class{set src(url){this.width=url.includes('logo')?400:500;this.height=url.includes('logo')?100:400;window.__imageUrl=url;window.setTimeout(()=>imageError?this.onerror?.():this.onload?.(),0);}};
window.HTMLCanvasElement.prototype.getContext=()=>({drawImage(){},fillRect(){}});window.HTMLCanvasElement.prototype.toDataURL=()=>window.__imageUrl.includes('logo')?logo:photo;
const source=structuredClone(row),history=structuredClone(events),attachments=structuredClone(files);source.follow_up='Kontroller tiltak og samarbeid videre. '.repeat(200)+'QA LANG TEKST SLUTT';history[0].snapshot=structuredClone(source);
const prior=JSON.stringify({source,history,attachments}),exports=[],calls=[],storageCalls=[];let failure='',exporting=false,reads=0,deferred=null;
window.__save=(name,bytes)=>exports.push({name,bytes:new Uint8Array(bytes)});
window.__client={storage:{from:bucket=>({download:async object=>{storageCalls.push({bucket,object});if(deferred)await deferred.promise;if(failure==='storage')throw Error('Private file denied');return {data:new window.Blob(['four'],{type:'image/png'}),error:null};}})}};
window.__rpc=async(name,args)=>{
 calls.push(name);if(name==='get_kshms_context')return context;
 if(name==='kshms_job_choices')return {context,projects:[],routines:[]};
 if(name==='kshms_project_ruh_state'||name==='kshms_deviation_state')return {context:{...context,project_id:project},cases:[structuredClone(source)],members:[{id:user,identity:{name:'QA aktiv konto'}}],counts:{open:source.status==='closed'?0:1,closed:source.status==='closed'?1:0},project:{id:project,name:'QA prosjekt',locked:name==='kshms_project_ruh_state'}};
 if(name==='work_profile_company_profile')return {companyId:company,companyName:'QA Ringside firma',logoUrl:'/qa-logo.png'};
 if(name==='kshms_deviation_files')return structuredClone(attachments);
 if(name==='kshms_deviation_detail'){if(exporting&&failure==='final-denied'&&++reads===2)throw Error('QA tilgang trukket tilbake');const value=structuredClone(source);if(exporting&&failure==='newer')value.revision++;return {case:value,events:structuredClone(history),next:null};}
 throw Error('Unexpected mutation '+name);
};
window.eval((Array.isArray(built)?built[0]:built).output.find(x=>x.type==='chunk'&&x.isEntry).code);
const act=window.__act,pause=ms=>new Promise(resolve=>window.setTimeout(resolve,ms));
const render=async props=>act(async()=>{window.__render({context,...props});await pause(50);});
const button=label=>[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===label||b.getAttribute('aria-label')===label);
const click=async label=>{const b=typeof label==='string'?button(label):label;assert(b,label);assert(!b.disabled,'disabled '+label);await act(async()=>{b.dispatchEvent(new window.MouseEvent('click',{bubbles:true}));await pause(120);});};
const readPdf=async file=>{const pdf=await getDocument({data:new Uint8Array(file.bytes),useSystemFonts:true}).promise;let text='',images=0;for(let i=1;i<=pdf.numPages;i++){const page=await pdf.getPage(i);text+=(await page.getTextContent()).items.map(x=>x.str).join(' ');images+=(await page.getOperatorList()).fnArray.filter(x=>x===85||x===86).length;}const pages=pdf.numPages;await pdf.destroy();return {text,pages,images};};
const includes=(text,expected)=>assert(text.replace(/\s+/g,'').includes(expected.replace(/\s+/g,'')),expected);
await render({projectId:project,ruhOnly:true});await click([...document.querySelectorAll('.ks-case-row')].find(b=>b.querySelector('strong')?.textContent===source.title));exporting=true;await click('Last ned RUH-PDF');assert.equal(exports.length,1);const pdf=await readPdf(exports[0]);assert(pdf.pages>5);assert(pdf.images>=2);for(const text of ['QA Ringside firma','QA LANG TEKST SLUTT','Lagret lukker','Tidligere meldernavn','OPPRINNELIG hendelse','Original.pdf','Originalfilen følger ikke PDF','R-007 v2'])includes(pdf.text,text);assert(!pdf.text.includes('private.png'));assert(!pdf.text.includes('blob:'));assert(!pdf.text.includes('QA aktiv konto'));assert(storageCalls.every(x=>x.bucket==='kshms-private'));assert.equal(revokedUrls,1);fs.writeFileSync(path.join(output,'ruh-history-images.pdf'),exports[0].bytes);
const n=exports.length;
for(const mode of ['newer','storage','final-denied','corrupt']){failure=mode;reads=0;imageError=mode==='corrupt';await click('Last ned RUH-PDF');assert.equal(exports.length,n);assert(document.querySelector('.ks-pdf-action [role="alert"]'),mode);imageError=false;}
failure='';deferred={};deferred.promise=new Promise(resolve=>deferred.resolve=resolve);await click('Last ned RUH-PDF');assert(button('Lager RUH-PDF …').disabled);await click('Lukk avviksdialog');await act(async()=>{deferred.resolve();deferred=null;await pause(120);});assert.equal(exports.length,n,'Late download survived dialog close');assert(!document.querySelector('[role="dialog"]'));
exporting=false;source.status='open';source.closed_at=null;source.closed_identity=null;source.responsible_id=user;await render({projectId:null});await click([...document.querySelectorAll('.ks-case-row')].find(b=>b.querySelector('strong')?.textContent===source.title));assert(!button('Last ned RUH-PDF').disabled);
const label=[...document.querySelectorAll('label')].find(l=>l.textContent==='Kort tittel');const title=document.getElementById(label?.htmlFor);assert(title);await act(async()=>{Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set.call(title,'ULAGRET RUH ENDRING');title.dispatchEvent(new window.Event('input',{bubbles:true}));await pause(50);});assert(button('Last ned RUH-PDF').disabled,'Unsaved changes allowed export');assert(document.body.textContent.includes('Lagre endringene'));
// Local editor changes cannot mutate the saved rows or acknowledge/close a case.
source.status=row.status;source.closed_at=row.closed_at;source.closed_identity=row.closed_identity;delete source.responsible_id;assert.equal(JSON.stringify({source,history,attachments}),prior);assert(!calls.some(x=>x.endsWith('_command')));
await act(async()=>window.__unmount());dom.window.close();console.log('kshms-ruh-pdf-react-check: PASS – actual editor/private Storage/jsPDF, historical text/images, locked project, unsaved gate, failure and dialog-close cancellation');
