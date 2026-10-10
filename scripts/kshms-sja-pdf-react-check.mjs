import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
import {company,user,project,signed,draft} from './critical-kshms-sja-pdf-check.mjs';
const {JSDOM}=await import(process.env.KSHMS_JSDOM_PATH||'jsdom');
const {getDocument}=await import(process.env.KSHMS_PDFJS_PATH||'pdfjs-dist/legacy/build/pdf.mjs');
const jspdf=process.env.KSHMS_JSPDF_PATH;assert(jspdf);
const root=process.cwd(),temp=fs.mkdtempSync(path.join(os.tmpdir(),'ks-sja-pdf-')),entry=path.join(temp,'entry.jsx');
fs.writeFileSync(entry,`import React,{act} from '${root}/node_modules/react/index.js';import {createRoot} from '${root}/node_modules/react-dom/client.js';import Sja from '${root}/src/modules/kshms/KshmsSja.jsx';const root=createRoot(document.getElementById('app'));window.__act=act;window.__render=props=>root.render(<Sja {...props}/>);window.__unmount=()=>root.unmount();`);
const result=await build({root,configFile:false,logLevel:'silent',resolve:{alias:{react:path.join(root,'node_modules/react'),'react-dom':path.join(root,'node_modules/react-dom')}},define:{'process.env.NODE_ENV':'"development"'},plugins:[{name:'pdf-fixture',enforce:'pre',resolveId(id){if(id==='https://esm.sh/jspdf@2.5.1')return '\0qa-jspdf';},load(id){if(id.endsWith('kshmsAccess.js'))return 'export const kshmsRpc=(name,args)=>window.__rpc(name,args);';if(id==='\0qa-jspdf')return `import {jsPDF as Real} from '${jspdf}';export function jsPDF(options){const doc=new Real(options);doc.save=name=>window.__save(name,doc.output('arraybuffer'));return doc;}`;}},react()],build:{write:false,minify:false,lib:{entry,formats:['iife'],name:'SjaPDF',cssFileName:'sja-pdf'}}});
const dom=new JSDOM('<div id="app"></div>',{url:'https://qa.example.invalid',pretendToBeVisual:true,runScripts:'outside-only'}),{window}=dom,document=window.document;
window.MessageChannel=class{constructor(){this.port1={};this.port2={postMessage:()=>window.setTimeout(()=>this.port1.onmessage?.({data:null}),0)};}};
window.IS_REACT_ACT_ENVIRONMENT=true;window.TextEncoder=TextEncoder;window.confirm=()=>true;window.HTMLElement.prototype.scrollIntoView=()=>{};
const logo='data:image/png;base64,'+fs.readFileSync(process.env.KSHMS_QA_LOGO).toString('base64');
window.Image=class{set src(value){this.width=400;this.height=100;window.setTimeout(()=>this.onload?.(),0);}};
window.HTMLCanvasElement.prototype.getContext=()=>({drawImage(){}});window.HTMLCanvasElement.prototype.toDataURL=()=>logo;
const rows=[structuredClone(signed),structuredClone(draft),{...structuredClone(signed),id:crypto.randomUUID(),project_id:project,project_name:'QA koblet prosjekt',project_locked:true,content:{...structuredClone(signed.content),title:'QA prosjekt-SJA'}}];
rows[1].content.title='QA SJA utkast';
rows[0].content.task='Kontroller ventil og trykk før arbeid. '.repeat(100)+'QA LANGTEKST SLUTT';
const before=JSON.stringify(rows),exports=[],calls=[];let context={company_id:company,user_id:user,company_name:'QA firma',enabled:true,manage:true},mode='',deferred=null,reads=0;
window.__save=(name,bytes)=>exports.push({name,bytes:new Uint8Array(bytes)});
window.__rpc=async(name,args)=>{
 calls.push(name);
 if(name==='work_profile_company_profile')return {companyId:company,companyName:'QA firma',logoUrl:'/logo.png'};
 if(name==='kshms_job_choices')return {context,projects:[],routines:[]};
 if(name==='kshms_sja_state'||name==='kshms_project_sja_state')return {context:{...context,project_id:args.p_project_id},project:args.p_project_id?{id:project,name:'QA koblet prosjekt',locked:true}:null,members:[{id:user,identity:{id:user,name:'NYTT PROFILNAVN'}}],total:rows.length,items:rows.filter(r=>!args.p_project_id||r.project_id===args.p_project_id).map(r=>({...r,title:r.content.title,workplace:r.content.workplace}))};
 if(name==='kshms_sja_detail'){
  reads++;if(mode==='denied'||mode==='denied-final'&&reads===2)throw Error('QA tilgang tilbakekalt');
  const row=structuredClone(rows.find(r=>r.id===args.p_id));
  if(mode==='revision')row.revision++;if(mode==='changed-final'&&reads===2)row.content.task='QA nyere tekst';
  if(deferred&&reads===2)await deferred.promise;
  return {context,sja:row};
 }
 throw Error('Unexpected mutation '+name);
};
window.eval((Array.isArray(result)?result[0]:result).output.find(x=>x.type==='chunk'&&x.isEntry).code);
const act=window.__act,pause=ms=>new Promise(r=>window.setTimeout(r,ms));
const render=async(props={})=>act(async()=>{window.__render({context,...props});await pause(30);});
const button=label=>[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===label||b.getAttribute('aria-label')===label);
const click=async label=>{const b=button(label);assert(b,label);assert(!b.disabled,label+' disabled');await act(async()=>{b.dispatchEvent(new window.MouseEvent('click',{bubbles:true}));await pause(100);});};
const open=async title=>{const b=[...document.querySelectorAll('.sja-list-row')].find(b=>b.querySelector('strong').textContent===title);assert(b);await act(async()=>{b.click();await pause(100);});reads=0;};
const readPdf=async item=>{const pdf=await getDocument({data:new Uint8Array(item.bytes),useSystemFonts:true}).promise;let text='',images=0;for(let i=1;i<=pdf.numPages;i++){const page=await pdf.getPage(i);text+=(await page.getTextContent()).items.map(x=>x.str).join(' ');images+=(await page.getOperatorList()).fnArray.filter(x=>x===85||x===86).length;}const pages=pdf.numPages;await pdf.destroy();return {text,pages,images};};
const out=process.env.KSHMS_SJA_PDF_OUTPUT;assert(out);fs.mkdirSync(out,{recursive:true});
await render();await click('Ny SJA');assert(!button('Last ned PDF'),'Unsaved new SJA can export');await click('Lukk SJA');
await open(rows[0].content.title);await click('Last ned PDF');assert.equal(exports.length,1);let pdf=await readPdf(exports.at(-1));
for(const value of ['Lagret signatur','Lagret prosjektleder','Lagret deltaker','Deltok i vurderingen','R-007 utgave 2','QA LANGTEKST SLUTT','08.10.2026','20:00:00',signed.id])assert(pdf.text.replace(/\s+/g,'').includes(value.replace(/\s+/g,'')),value);
assert(pdf.pages>1);assert(pdf.images>=2);assert(pdf.text.includes('Bilder fra arbeidsstedet'));assert(!pdf.text.includes('NYTT PROFILNAVN'));assert(!pdf.text.includes('PRIVATE'));fs.writeFileSync(path.join(out,'sja-signed.pdf'),exports.at(-1).bytes);
for(const failure of ['denied','denied-final','revision','changed-final']){mode=failure;reads=0;const prior=exports.length;await click('Last ned PDF');assert.equal(exports.length,prior,failure);assert(document.querySelector('[role="alert"]'));assert(document.querySelector('[role="dialog"]'));}mode='';
await click('Lukk SJA');await open(rows[1].content.title);
await click('Last ned PDF');pdf=await readPdf(exports.at(-1));assert(pdf.text.includes('IKKE SIGNERT'));assert(!pdf.text.includes('Lagret signatur'));fs.writeFileSync(path.join(out,'sja-draft.pdf'),exports.at(-1).bytes);
const input=document.querySelector('[data-sja-field="task"]');await act(async()=>{Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype,'value').set.call(input,'QA ULAGRET');input.dispatchEvent(new window.Event('input',{bubbles:true}));});assert(button('Last ned PDF').disabled);assert(!calls.includes('kshms_sja_command'));await click('Lukk SJA');
await render({projectId:project});await open('QA prosjekt-SJA');await click('Last ned PDF');pdf=await readPdf(exports.at(-1));assert(pdf.text.includes('QA koblet prosjekt'));assert(pdf.text.includes('Lagret signatur'));fs.writeFileSync(path.join(out,'sja-project-locked.pdf'),exports.at(-1).bytes);
const defer=()=>{let resolve;return {promise:new Promise(r=>{resolve=r;}),resolve};};
for(const action of ['close','inactive','company','user']){
 reads=0;deferred=defer();const prior=exports.length;await click('Last ned PDF');assert(button('Lager PDF …').disabled);
 if(action==='close')await click('Lukk SJA');if(action==='inactive')await render({projectId:project,active:false});
 if(action==='company'){context={...context,company_id:crypto.randomUUID()};await render({projectId:project});}
 if(action==='user'){context={...context,user_id:crypto.randomUUID()};await render({projectId:project});}
 deferred.resolve();deferred=null;await act(async()=>pause(100));assert.equal(exports.length,prior,'Late PDF after '+action);
 context={company_id:company,user_id:user,company_name:'QA firma',enabled:true,manage:true};await render({projectId:project,active:true});if(!document.querySelector('[role="dialog"]'))await open('QA prosjekt-SJA');
}
assert.equal(JSON.stringify(rows),before);assert(!calls.includes('kshms_sja_command'),'PDF saved or signed SJA');
await act(async()=>window.__unmount());dom.window.close();fs.rmSync(temp,{recursive:true,force:true});console.log(JSON.stringify({result:'PASS',actualPdfs:exports.length,output:out,scenarios:'actual SJA button, historical signature/participants, draft and locked project, long text, unsaved block, revoked/new revision and final changed content, dialog close/inactive/company/user cancellation, no save/sign'}));
