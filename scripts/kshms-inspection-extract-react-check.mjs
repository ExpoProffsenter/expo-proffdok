import {legacyFixture} from './critical-kshms-legacy-extract-check.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {webcrypto} from 'node:crypto';
import {storageUrl} from './critical-kshms-attachment-archive-check.mjs';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
import {company,user,project} from './critical-kshms-ruh-pdf-check.mjs';
import {sources,selection as baseSelection,fixtureRpc,context} from './critical-kshms-inspection-extract-check.mjs';
import {deviationFixture} from './critical-kshms-deviation-extract-check.mjs';
const legacyQA=Boolean(process.env.KSHMS_LEGACY_QA),legacy=legacyQA?legacyFixture():null;
const deviationQA=Boolean(process.env.KSHMS_DEVIATION_QA);
const {JSDOM}=await import(process.env.KSHMS_JSDOM_PATH||'jsdom');
const {getDocument}=await import(process.env.KSHMS_PDFJS_PATH||'pdfjs-dist/legacy/build/pdf.mjs');
const root=process.cwd(),temp=fs.mkdtempSync(path.join(os.tmpdir(),'ks-extract-')),entry=path.join(temp,'entry.jsx');
const output=process.env.KSHMS_EXTRACT_OUTPUT;assert(output);fs.mkdirSync(output,{recursive:true});
fs.writeFileSync(entry,`import React,{act} from '${root}/node_modules/react/index.js';import {createRoot} from '${root}/node_modules/react-dom/client.js';import Extract from '${root}/src/modules/kshms/KshmsInspectionExtract.jsx';const root=createRoot(document.getElementById('app'));window.__act=act;window.__render=props=>root.render(<Extract {...props}/>);window.__unmount=()=>root.unmount();`);
const built=await build({root,configFile:false,logLevel:'silent',resolve:{alias:{react:path.join(root,'node_modules/react'),'react-dom':path.join(root,'node_modules/react-dom')}},define:{'process.env.NODE_ENV':'"development"'},plugins:[{name:'fixture',enforce:'pre',resolveId(id){if(id==='https://esm.sh/jspdf@2.5.1')return '\0qa-jspdf';},load(id){if(id.endsWith('kshmsAccess.js'))return 'export const kshmsRpc=(name,args)=>window.__rpc(name,args);';if(id.endsWith('appSupabaseClientRegistry.js'))return 'export const getAppSupabaseClient=()=>window.__client;';if(id==='\0qa-jspdf')return `import {jsPDF as Real} from '${process.env.KSHMS_JSPDF_PATH}';export function jsPDF(options){const doc=new Real(options);doc.save=name=>window.__save(name,doc.output('arraybuffer'));return doc;}`;}},react()],build:{write:false,minify:false,lib:{entry,formats:['iife'],name:'ExtractPDF',cssFileName:'extract-pdf'}}});
const dom=new JSDOM('<div id="app"></div>',{url:'https://qa.example.invalid',pretendToBeVisual:true,runScripts:'outside-only'}),{window}=dom,document=window.document;
window.MessageChannel=class{constructor(){this.port1={};this.port2={postMessage:()=>window.setTimeout(()=>this.port1.onmessage?.({data:null}),0)};}};window.IS_REACT_ACT_ENVIRONMENT=true;window.TextEncoder=TextEncoder;Object.defineProperty(window,'crypto',{value:webcrypto});
const photo='data:image/png;base64,'+fs.readFileSync(process.env.KSHMS_QA_PHOTO).toString('base64'),logo='data:image/png;base64,'+fs.readFileSync(process.env.KSHMS_QA_LOGO).toString('base64');
let imageUrl='';window.URL.createObjectURL=()=> 'blob:qa-photo';window.URL.revokeObjectURL=()=>{};
window.Image=class{set src(url){this.width=url.includes('logo')?400:500;this.height=url.includes('logo')?100:400;imageUrl=url;window.setTimeout(()=>this.onload?.(),0);}};
window.HTMLCanvasElement.prototype.getContext=()=>({drawImage(){},fillRect(){}});window.HTMLCanvasElement.prototype.toDataURL=()=>imageUrl.includes('logo')?logo:photo;
let mode='',deferred=null,contextReads=0;const exports=[],calls=[],storage=[];
const source=structuredClone(sources),fixture=deviationQA?deviationFixture(source):null,selection=fixture?[...baseSelection,...fixture.selected]:baseSelection;source.sjas[0].content.task='Kontroller trykk og sperring. '.repeat(120)+'QA LANGTEKST SLUTT';source.risks[0].content.risks[0].photos[0].data=photo;
const original=JSON.stringify(source);
const inner=fixture?.rpc||fixtureRpc({source});
const rpc=(name,args)=>{calls.push({name,args});return inner(name,args);};
window.__rpc=async(name,args)=>{if(name==='get_kshms_context'){contextReads++;if(mode==='role-final'&&contextReads===2)return {...context,manage:false};if(deferred&&contextReads===2)await deferred.promise;}return rpc(name,args);};
window.__client={supabaseUrl:storageUrl,from:table=>{assert.equal(table,'projects');return {select:columns=>{assert.equal(columns,'id,company_scope_id,deviations:data->project->projectDeviations');return {eq:(key,value)=>{assert.equal(key,'id');assert.equal(value,project);return {eq:(key,value)=>{assert.equal(key,'company_scope_id');assert.equal(value,company);return {maybeSingle:async()=>({data:structuredClone(legacy.data)})};}};}};}};},storage:{from:bucket=>({download:async object=>{storage.push({bucket,object});if(mode==='storage')return {data:null,error:{message:'denied'}};return {data:new window.Blob(['four'],{type:'image/png'}),error:null};}})}};
window.__save=(name,bytes)=>exports.push({name,bytes:new Uint8Array(bytes)});
window.eval((Array.isArray(built)?built[0]:built).output.find(x=>x.type==='chunk'&&x.isEntry).code);
const act=window.__act,pause=ms=>new Promise(resolve=>window.setTimeout(resolve,ms));
const render=async x=>act(async()=>{window.__render({context,...x});await pause(30);});
const button=name=>[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===name);
const click=async name=>{const b=typeof name==='string'?button(name):name;assert(b,name);assert(!b.disabled,name+' disabled');await act(async()=>{b.click();await pause(150);});};
const fill=async(element,value)=>act(async()=>{const proto=element.tagName==='TEXTAREA'?window.HTMLTextAreaElement.prototype:element.tagName==='SELECT'?window.HTMLSelectElement.prototype:window.HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(element,value);element.dispatchEvent(new window.Event(element.tagName==='SELECT'?'change':'input',{bubbles:true}));await pause(10);});
const check=async el=>act(async()=>{el.click();await pause(20);});
const readPdf=async file=>{const pdf=await getDocument({data:new Uint8Array(file.bytes),useSystemFonts:true}).promise;let text='',images=0;const pageTexts=[];for(let i=1;i<=pdf.numPages;i++){const page=await pdf.getPage(i),content=(await page.getTextContent()).items.map(x=>x.str).join(' ');pageTexts.push(content);text+=content;images+=(await page.getOperatorList()).fnArray.filter(x=>x===85||x===86).length;}const pages=pdf.numPages;await pdf.destroy();return {text,images,pages,pageTexts};};
await render();assert(!button('Last ned samlet PDF'));await fill(document.querySelector('textarea'),'QA samlet tilsynsuttrekk');await click('Hent dokumentlisten');assert(button('Last ned samlet PDF').disabled);assert.equal(document.querySelectorAll('input:checked').length,0);
await fill(document.querySelector('select'),project);await click('Hent prosjektkontroller');if(legacyQA){await click('Hent eldre prosjektavvik');for(const label of [...document.querySelectorAll('fieldset label')].filter(l=>l.textContent.includes(project+':old-')))await check(label.querySelector('input'));}
for(const row of selection){const label=[...document.querySelectorAll('fieldset label')].find(l=>l.textContent.includes(row.id));assert(label,row.kind);await check(label.querySelector('input'));}
assert(button('Last ned samlet PDF').disabled);await check([...document.querySelectorAll('label')].find(l=>l.textContent.includes('Jeg har kontrollert omfanget')).querySelector('input'));
assert(!button('Last ned samlet PDF').disabled);contextReads=0;await click('Last ned samlet PDF');assert.equal(exports.length,1,document.querySelector('[role="alert"]')?.textContent||'PDF was not saved');
let pdf=await readPdf(exports[0]);for(const value of ['Manifest','Lagret signatur','Lagret revisjonssignatur','OPPRINNELIG hendelse','QA LANGTEKST SLUTT','Original.pdf','forventet effekt',...selection.map(r=>r.id)])assert(pdf.text.replace(/\s+/g,'').includes(value.replace(/\s+/g,'')),value);
for(const value of ['token=','PRIVATE EMPLOYEE','private.png','ULAGRET FORSLAG','NYTT UPUBLISERT'])assert(!pdf.text.includes(value),value);
assert(pdf.images>=8);assert(pdf.pages>=10);assert(storage.every(x=>legacyQA?['kshms-private','project-images'].includes(x.bucket):x.bucket==='kshms-private'));if(deviationQA)for(const value of ['Kvalitetsavvik med historikk','HMS-avvik med historikk','quality-Original.pdf','hms-Original.pdf'])assert(pdf.text.includes(value),value);
if(legacyQA){for(const value of ['QA eldre hendelse','Lagret tidligere lukker','uten versjonert hendelseshistorikk','Eldre-original.pdf'])assert(pdf.text.includes(value),value);assert(!pdf.text.includes('LINKED ALREADY IN KS'));assert(storage.some(s=>s.bucket==='project-images'));}
fs.writeFileSync(path.join(output,legacyQA?'extract-with-legacy.pdf':deviationQA?'extract-with-quality-hms.pdf':'extract-all-eight-types.pdf'),exports[0].bytes);
for(const failure of ['storage','role-final']){mode=failure;contextReads=0;await click('Last ned samlet PDF');assert.equal(exports.length,1);assert(document.querySelector('[role="alert"]'));}mode='';
await click([...document.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')===`Fjern ${selection[0].title} fra uttrekket`)||[...document.querySelectorAll('li')].find(l=>l.textContent.includes('Godkjente rutineutgaver:'))?.querySelector('button'));assert(button('Last ned samlet PDF').disabled);assert.equal(document.querySelectorAll('input:checked').length,selection.length-1+(legacyQA?2:0));
await check([...document.querySelectorAll('label')].find(l=>l.textContent.includes('Jeg har kontrollert omfanget')).querySelector('input'));contextReads=0;await click('Last ned samlet PDF');assert.equal(exports.length,2);pdf=await readPdf(exports[1]);assert(!pdf.text.includes('Firmaets lagrede fremgangsmåte'));fs.writeFileSync(path.join(output,'extract-without-routine.pdf'),exports[1].bytes);
const defer=()=>{let resolve;return {promise:new Promise(r=>resolve=r),resolve};};
for(const action of ['company','user','unmount']){
 contextReads=0;deferred=defer();await click('Last ned samlet PDF');assert(button('Arbeider …').disabled);
 if(action==='company')await render({context:{...context,company_id:crypto.randomUUID()}});if(action==='user')await render({context:{...context,user_id:crypto.randomUUID()}});if(action==='unmount')await act(async()=>window.__unmount());
 deferred.resolve();deferred=null;await act(async()=>pause(80));assert.equal(exports.length,2,'Late export after '+action);
 if(action!=='unmount'){
  await render();assert(!button('Last ned samlet PDF'));assert.equal(document.querySelector('textarea').value,'');
  await fill(document.querySelector('textarea'),'QA tilgangsbytte');await click('Hent dokumentlisten');
  const label=[...document.querySelectorAll('fieldset label')].find(l=>l.textContent.includes(selection.find(row=>row.kind==='ruhs').id));await check(label.querySelector('input'));
  await check([...document.querySelectorAll('label')].find(l=>l.textContent.includes('Jeg har kontrollert omfanget')).querySelector('input'));
 }
}
assert.equal(JSON.stringify(source),original);assert(!calls.some(x=>x.name.endsWith('_command')));
dom.window.close();fs.rmSync(temp,{recursive:true,force:true});console.log(JSON.stringify({result:'PASS',actualPdfs:exports.length,pages:pdf.pages,output,scenarios:'actual React/Storage/jsPDF eight-type selection/confirmation/manifest, long text, image, signature, review, matrix, remove choice, no auto selection or write, final access revocation and late company/user/unmount cancellation'}));
