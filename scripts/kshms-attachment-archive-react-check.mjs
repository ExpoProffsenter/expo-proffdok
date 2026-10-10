import {legacyFixture} from './critical-kshms-legacy-extract-check.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
import {company,user,project} from './critical-kshms-ruh-pdf-check.mjs';
import {sources,selection as baseSelection,fixtureRpc,context} from './critical-kshms-inspection-extract-check.mjs';
import {deviationFixture} from './critical-kshms-deviation-extract-check.mjs';
const legacyQA=Boolean(process.env.KSHMS_LEGACY_QA),legacy=legacyQA?legacyFixture():null;
const deviationQA=Boolean(process.env.KSHMS_DEVIATION_QA);
const {JSDOM}=await import(process.env.KSHMS_JSDOM_PATH||'jsdom');
import {webcrypto} from 'node:crypto';
import {attachmentSource,storageUrl,verifyArchive} from './critical-kshms-attachment-archive-check.mjs';
const root=process.cwd(),temp=fs.mkdtempSync(path.join(os.tmpdir(),'ks-extract-')),entry=path.join(temp,'entry.jsx');
const output=process.env.KSHMS_ATTACHMENT_OUTPUT;assert(output);fs.mkdirSync(output,{recursive:true});
fs.writeFileSync(entry,`import React,{act} from '${root}/node_modules/react/index.js';import {createRoot} from '${root}/node_modules/react-dom/client.js';import Extract from '${root}/src/modules/kshms/KshmsInspectionExtract.jsx';const root=createRoot(document.getElementById('app'));window.__act=act;window.__render=props=>root.render(<Extract {...props}/>);window.__unmount=()=>root.unmount();`);
const built=await build({root,configFile:false,logLevel:'silent',resolve:{alias:{react:path.join(root,'node_modules/react'),'react-dom':path.join(root,'node_modules/react-dom')}},define:{'process.env.NODE_ENV':'"development"'},plugins:[{name:'fixture',enforce:'pre',resolveId(id){if(id==='https://esm.sh/jspdf@2.5.1')return '\0qa-jspdf';},load(id){if(id.endsWith('kshmsAccess.js'))return 'export const kshmsRpc=(name,args)=>window.__rpc(name,args);';if(id.endsWith('appSupabaseClientRegistry.js'))return 'export const getAppSupabaseClient=()=>window.__client;';if(id==='\0qa-jspdf')return `export function jsPDF(){throw Error('PDF not used in ZIP test');}`;}},react()],build:{write:false,minify:false,lib:{entry,formats:['iife'],name:'ExtractPDF',cssFileName:'extract-pdf'}}});
const dom=new JSDOM('<div id="app"></div>',{url:'https://qa.example.invalid',pretendToBeVisual:true,runScripts:'outside-only'}),{window}=dom,document=window.document;
window.MessageChannel=class{constructor(){this.port1={};this.port2={postMessage:()=>window.setTimeout(()=>this.port1.onmessage?.({data:null}),0)};}};window.IS_REACT_ACT_ENVIRONMENT=true;window.TextEncoder=TextEncoder;

window.Uint8Array=Uint8Array;window.Blob=Blob;window.structuredClone=structuredClone;Object.defineProperty(window,'crypto',{value:webcrypto});
let mode='',contexts=0,deferred=null;const source=attachmentSource(),fixture=deviationQA?deviationFixture(source):null,selection=fixture?[...baseSelection,...fixture.selected]:baseSelection,original=JSON.stringify(source),calls=[],storage=[],exports=[];
const inner=fixture?.rpc||fixtureRpc({source});
const rpc=(name,args)=>{calls.push({name,args});return inner(name,args);};
window.__rpc=async(name,args)=>{if(name==='get_kshms_context'){contexts++;if(mode==='role-final'&&contexts===2)return {...context,manage:false};if(deferred&&contexts===2)await deferred.promise;}return rpc(name,args);};
window.__client={from:table=>{assert.equal(table,'projects');return {select:columns=>{assert.equal(columns,'id,company_scope_id,deviations:data->project->projectDeviations');return {eq:(key,value)=>{assert.equal(key,'id');assert.equal(value,project);return {eq:(key,value)=>{assert.equal(key,'company_scope_id');assert.equal(value,company);return {maybeSingle:async()=>({data:structuredClone(legacy.data)})};}};}};}};},supabaseUrl:storageUrl,storage:{from:bucket=>({download:async object=>{storage.push({bucket,object});if(mode==='storage')return {error:{message:'denied'}};const file=[...source.files,...(fixture?.attachments||[])].find(f=>f.object_name===object)||legacy?.data.deviations.flatMap(d=>d.photos||[]).find(f=>f.path===object)||source.runs[0].answers.Koblinger.photos[0];return {data:new Blob(['x'.repeat(file.size_bytes||file.size)],{type:file.mime_type||file.type||(file.name.endsWith('.pdf')?'application/pdf':'image/png')})};}})}};
const blobs=new Map();window.URL.createObjectURL=blob=>{const url='blob:archive-'+blobs.size;blobs.set(url,blob);return url;};window.URL.revokeObjectURL=()=>{};
window.HTMLAnchorElement.prototype.click=function(){exports.push({name:this.download,blob:blobs.get(this.href)});};
window.eval((Array.isArray(built)?built[0]:built).output.find(x=>x.type==='chunk'&&x.isEntry).code);
const act=window.__act,pause=ms=>new Promise(resolve=>window.setTimeout(resolve,ms));
const render=async x=>act(async()=>{window.__render({context,...x});await pause(30);});
const button=name=>[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===name);
const click=async name=>{const b=typeof name==='string'?button(name):name;assert(b,name);assert(!b.disabled,name+' disabled');await act(async()=>{b.click();await pause(150);});};
const fill=async(element,value)=>act(async()=>{const proto=element.tagName==='TEXTAREA'?window.HTMLTextAreaElement.prototype:window.HTMLSelectElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(element,value);element.dispatchEvent(new window.Event(element.tagName==='SELECT'?'change':'input',{bubbles:true}));await pause(10);});
const check=async el=>act(async()=>{el.click();await pause(20);});
const choose=async kind=>{for(const row of selection.filter(v=>v.kind===kind))await check([...document.querySelectorAll('fieldset label')].find(l=>l.textContent.includes(row.id)).querySelector('input'));};
const confirm=()=>check([...document.querySelectorAll('label')].find(l=>l.textContent.includes('Jeg har kontrollert vedleggslisten')).querySelector('input'));
await render();await fill(document.querySelector('textarea'),'QA vedlegg');await click('Hent dokumentlisten');assert(button('Vis vedleggslisten').disabled);assert(!button('Last ned vedlegg (ZIP)'));
await fill(document.querySelector('select'),project);await click('Hent prosjektkontroller');if(legacyQA){await click('Hent eldre prosjektavvik');for(const label of [...document.querySelectorAll('fieldset label')].filter(l=>l.textContent.includes(project+':old-')))await check(label.querySelector('input'));}for(const kind of ['sjas','ruhs','rounds','risks','runs',...(deviationQA?['deviations']:[])])await choose(kind);
await click('Vis vedleggslisten');assert.equal(storage.length,0,'Preview must not download');assert.equal(document.querySelectorAll('[aria-label="Vedleggslisten"] li').length,(deviationQA?11:7)+(legacyQA?2:0));assert(button('Last ned vedlegg (ZIP)').disabled);
await confirm();contexts=0;await click('Last ned vedlegg (ZIP)');assert.equal(exports.length,1);const bytes=await exports[0].blob.arrayBuffer(),manifest=verifyArchive(bytes);assert.equal(manifest.files.length,(deviationQA?11:7)+(legacyQA?2:0));assert(manifest.files.some(f=>f.documentGroup==='SJA'&&f.originalName==='SJA-bilde-1.jpg'));assert(manifest.files.some(f=>f.documentGroup.includes('Risikovurdering')&&f.originalName==='Risiko-1-bilde-1.png'&&f.point==='Støv'));assert.equal(storage.filter(v=>v.bucket==='kshms-private').length,deviationQA?7:3);assert.equal(storage.filter(v=>v.bucket==='project-images').length,legacyQA?3:1);if(legacyQA){assert.equal(manifest.files.filter(f=>f.contentHash).length,2);assert(manifest.files.some(f=>f.originalName==='Eldre-original.pdf'));}if(deviationQA){assert.equal(manifest.files.filter(f=>fixture.cases.some(c=>c.id===f.documentId)).length,4);assert(manifest.files.some(f=>f.originalName==='quality-Original.pdf'));assert(manifest.files.some(f=>f.originalName==='hms-Original.pdf'));}
fs.writeFileSync(path.join(output,legacyQA?'actual-react-legacy-attachments.zip':deviationQA?'actual-react-quality-hms-attachments.zip':'actual-react-attachments.zip'),Buffer.from(bytes));
for(const failure of ['storage','role-final']){mode=failure;contexts=0;await click('Last ned vedlegg (ZIP)');assert.equal(exports.length,1);assert(document.querySelector('[role="alert"]'));}mode='';
await fill(document.querySelector('textarea'),'Ny avgrensning');assert(!button('Last ned vedlegg (ZIP)'));await click('Vis vedleggslisten');assert(button('Last ned vedlegg (ZIP)').disabled);await confirm();
await choose('runs');assert(!button('Last ned vedlegg (ZIP)'));await click('Vis vedleggslisten');assert.equal(document.querySelectorAll('[aria-label="Vedleggslisten"] li').length,(deviationQA?10:6)+(legacyQA?2:0));assert(button('Last ned vedlegg (ZIP)').disabled);
if(legacyQA)for(const label of [...document.querySelectorAll('fieldset label')].filter(l=>l.textContent.includes(project+':old-')))await check(label.querySelector('input'));if(deviationQA)await choose('deviations');await choose('ruhs');await choose('rounds');await choose('sjas');await click('Vis vedleggslisten');assert.equal(document.querySelectorAll('[aria-label="Vedleggslisten"] li').length,1);assert(document.body.textContent.includes('Risiko-1-bilde-1.png'));assert(button('Last ned vedlegg (ZIP)').disabled);await choose('risks');await choose('sjas');await choose('ruhs');await click('Vis vedleggslisten');await confirm();
const defer=()=>{let resolve;return {promise:new Promise(r=>resolve=r),resolve};};
for(const action of ['company','user','unmount']){
 contexts=0;deferred=defer();await click('Last ned vedlegg (ZIP)');assert(button('Last ned vedlegg (ZIP)').disabled);
 if(action==='company')await render({context:{...context,company_id:crypto.randomUUID()}});if(action==='user')await render({context:{...context,user_id:crypto.randomUUID()}});if(action==='unmount')await act(async()=>window.__unmount());
 deferred.resolve();deferred=null;await act(async()=>pause(80));assert.equal(exports.length,1,'Late export after '+action);
 if(action!=='unmount'){await render();assert(!button('Last ned vedlegg (ZIP)'));assert.equal(document.querySelector('textarea').value,'');await fill(document.querySelector('textarea'),'QA avbrudd');await click('Hent dokumentlisten');await choose('ruhs');await click('Vis vedleggslisten');await confirm();}
}
assert.equal(JSON.stringify(source),original);assert(!calls.some(v=>v.name.endsWith('_command')));dom.window.close();fs.rmSync(temp,{recursive:true,force:true});console.log(JSON.stringify({result:'PASS',archives:exports.length,files:manifest.files.length,output,scenarios:'actual React preview/ZIP bytes/manifest, private and project Storage, confirmation/empty/reset/error, role and late company/user/unmount, no writes'}));
