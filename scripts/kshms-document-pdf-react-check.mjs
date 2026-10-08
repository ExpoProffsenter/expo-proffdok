import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
import {company,user,project,routine,version,template,edition,run,context,state,central,controls} from './critical-kshms-document-pdf-check.mjs';
const {JSDOM}=await import(process.env.KSHMS_JSDOM_PATH||'jsdom');
const {getDocument}=await import(process.env.KSHMS_PDFJS_PATH||'pdfjs-dist/legacy/build/pdf.mjs');
const root=process.cwd(),temp=fs.mkdtempSync(path.join(os.tmpdir(),'ks-document-pdf-')),entry=path.join(temp,'entry.jsx');
const output=process.env.KSHMS_DOCUMENT_PDF_OUTPUT;assert(output);fs.mkdirSync(output,{recursive:true});
fs.writeFileSync(entry,`import React,{act} from '${root}/node_modules/react/index.js';import {createRoot} from '${root}/node_modules/react-dom/client.js';import Module from '${root}/src/modules/kshms/KshmsModule.jsx';import Central from '${root}/src/modules/kshms/KshmsChecklistCentral.jsx';import Workspace from '${root}/src/modules/checklist/ProjectChecklistWorkspace.jsx';import Button from '${root}/src/modules/kshms/KshmsDocumentPdfButton.jsx';const root=createRoot(document.getElementById('app'));window.__act=act;const Editor=props=><label>Kommentar<textarea value={Object.values(props.checklist||{})[0]?.Koblinger?.comment||''} onChange={e=>props.setChecklistValue(props.activeChecklistTemplate[0].category,'Koblinger',{comment:e.target.value})}/></label>;window.__render=(kind,props)=>root.render(kind==='module'?<Module {...props} key={kind+props.context.user_id}/>:kind==='central'?<Central {...props} key={kind}/>:kind==='workspace'?<Workspace {...props} Editor={Editor} key={kind+props.userId}/>:<Button {...props} key={kind}/>);window.__unmount=()=>root.unmount();`);
const buildResult=await build({root,configFile:false,logLevel:'silent',resolve:{alias:{react:path.join(root,'node_modules/react'),'react-dom':path.join(root,'node_modules/react-dom')}},define:{'process.env.NODE_ENV':'"development"'},plugins:[{name:'pdf-fixture',enforce:'pre',resolveId(id){if(id==='https://esm.sh/jspdf@2.5.1')return '\0qa-jspdf';},load(id){if(id.endsWith('kshmsAccess.js'))return 'export const kshmsRpc=(name,args)=>window.__rpc(name,args);';if(id==='\0qa-jspdf')return `import {jsPDF as Real} from '${process.env.KSHMS_JSPDF_PATH}';export function jsPDF(options){const doc=new Real(options);doc.save=name=>window.__save(name,doc.output('arraybuffer'));return doc;}`;}},react()],build:{write:false,minify:false,lib:{entry,formats:['iife'],name:'DocumentPDF',cssFileName:'document-pdf'}}});
const dom=new JSDOM('<div id="app"></div>',{url:'https://qa.example.invalid',pretendToBeVisual:true,runScripts:'outside-only'}),{window}=dom,document=window.document;
window.MessageChannel=class{constructor(){this.port1={};this.port2={postMessage:()=>window.setTimeout(()=>this.port1.onmessage?.({data:null}),0)};}};window.IS_REACT_ACT_ENVIRONMENT=true;window.TextEncoder=TextEncoder;window.confirm=()=>true;window.HTMLElement.prototype.scrollIntoView=()=>{};
const logo='data:image/png;base64,'+fs.readFileSync(process.env.KSHMS_QA_LOGO).toString('base64'),photo='data:image/png;base64,'+fs.readFileSync(process.env.KSHMS_QA_PHOTO).toString('base64');
window.Image=class{set src(url){this.width=url.includes('logo')?400:500;this.height=url.includes('logo')?100:400;window.__imageUrl=url;window.setTimeout(()=>this.onload?.(),0);}};
window.HTMLCanvasElement.prototype.getContext=()=>({drawImage(){}});window.HTMLCanvasElement.prototype.toDataURL=()=>window.__imageUrl.includes('logo')?logo:photo;
const savedState=structuredClone(state),savedCentral=structuredClone(central),savedControls=structuredClone(controls);savedState.versions[0].content.procedure='Firmaets fremgangsmåte for kontroll av arbeid. '.repeat(600)+'QA RUTINETEKST SLUTT';savedControls.runs[0].answers.Koblinger.comment='Kontroller hele koblingen før innbygging. '.repeat(100)+'QA KONTROLLTEKST SLUTT';
savedCentral.templates[0].draft={...savedCentral.versions[0].content,title:'NYTT UPUBLISERT UTKAST'};
const prior=JSON.stringify({savedState,savedCentral,savedControls}),exports=[],calls=[];let fail=false,newer=false,deferred=null,revokedFinal=false,exportReads=0;
window.__save=(name,bytes)=>exports.push({name,bytes:new Uint8Array(bytes)});
window.__rpc=async(name,args)=>{
 calls.push(name);if(name==='work_profile_company_profile')return {companyId:company,companyName:'QA Ringside firma',logoUrl:'/qa-logo.png'};
 if(fail){fail=false;throw Error('QA tilgang avslått');}
 if(deferred)await deferred.promise;
 if(revokedFinal&&++exportReads===2)throw Error('QA tilgang trukket tilbake under bildefremhenting');
 if(name==='kshms_get_state')return structuredClone(savedState);
 if(name==='kshms_checklist_state')return structuredClone(savedCentral);
 if(name==='project_checklist_state'){const value=structuredClone(savedControls);if(newer)value.runs[0].revision++;return value;}
 throw Error('Unexpected mutation '+name);
};
window.eval((Array.isArray(buildResult)?buildResult[0]:buildResult).output.find(x=>x.type==='chunk'&&x.isEntry).code);
const act=window.__act,pause=ms=>new Promise(resolve=>window.setTimeout(resolve,ms));
const render=async(kind,props)=>act(async()=>{window.__render(kind,props);await pause(50);});
const button=label=>[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===label||b.getAttribute('aria-label')===label);
const click=async label=>{const b=typeof label==='string'?button(label):label;assert(b,label);assert(!b.disabled,'disabled '+label);await act(async()=>{b.dispatchEvent(new window.MouseEvent('click',{bubbles:true}));await pause(140);});};
const readPdf=async file=>{const pdf=await getDocument({data:new Uint8Array(file.bytes),useSystemFonts:true}).promise;let text='',images=0;for(let i=1;i<=pdf.numPages;i++){const page=await pdf.getPage(i);text+=(await page.getTextContent()).items.map(x=>x.str).join(' ');images+=(await page.getOperatorList()).fnArray.filter(x=>x===85||x===86).length;}const pages=pdf.numPages;await pdf.destroy();return {text,pages,images};};
const saveLast=async name=>{const file=exports.at(-1);fs.writeFileSync(path.join(output,name+'.pdf'),file.bytes);return readPdf(file);};
const includes=(text,expected)=>assert(text.replace(/\s+/g,'').includes(expected.replace(/\s+/g,'')),expected);
// Actual routine module: reading and personal handbook use the published edition,
// not the manager draft or another staff member's confirmation.
await render('module',{context});await click(savedState.versions[0].content.title+' · v2');await click('Last ned PDF');let pdf=await saveLast('routine');assert(pdf.pages>3);for(const text of ['R-007','Lagret godkjenner','QA RUTINETEKST SLUTT','QA kilde','QA Ringside firma'])includes(pdf.text,text);assert(!pdf.text.includes('ULAGRET'));assert(!pdf.text.includes('PRIVATE ANNET'));
await click('Min personalhåndbok');await click(document.querySelector('.ks-personal-routine summary'));await click('Last ned PDF');pdf=await saveLast('personal-routine');includes(pdf.text,'QA RUTINETEKST SLUTT');assert(!pdf.text.includes('PRIVATE ANNET'));
// Central PDF explicitly exports a published blank version alongside an edited
// draft. It cannot publish or replace the project copy.
await render('central',{context:{...context,manage:true}});await click([...document.querySelectorAll('summary')].find(s=>s.textContent.includes('Publisert sjekklistemal')));await click('Last ned PDF');pdf=await saveLast('checklist-template');includes(pdf.text,'TOM MAL');includes(pdf.text,'Lagret publisist');assert(!pdf.text.includes('NYTT UPUBLISERT'));const n=exports.length;fail=true;await click('Last ned PDF');assert.equal(exports.length,n);assert(document.querySelector('[role="alert"]'));
const workspaceProps=()=>({companyId:company,userId:user,projectId:project,checklist:{},activeChecklistTemplate:[savedControls.runs[0].definition],onSaved:()=>{},uploadImages:()=>[],resolveFileUrl:file=>file.url});
await render('workspace',workspaceProps());await click('Åpne fullført sjekkliste');await click('Last ned PDF');pdf=await saveLast('checklist-completed');for(const text of ['Lagret fullfører','QA KONTROLLTEKST SLUTT','case-id','Ikke aktuelt','fullført kontroll lukker ikke avvik'])includes(pdf.text,text);assert(pdf.images>=2,'Logo and saved control photo missing');assert(!pdf.text.includes('PRIVATE'));
const count=exports.length;newer=true;await click('Last ned PDF');assert.equal(exports.length,count);assert(document.querySelector('[role="alert"]').textContent.includes('nyere lagret'));newer=false;
revokedFinal=true;exportReads=0;await click('Last ned PDF');assert.equal(exports.length,count);assert(document.querySelector('[role="alert"]').textContent.includes('trukket tilbake'));revokedFinal=false;
await click('Lukk sjekklistedialog');savedControls.runs[0].status='draft';await click('Åpne fullført sjekkliste');await click('Last ned PDF');pdf=await saveLast('checklist-draft');includes(pdf.text,'IKKE FULLFØRT');assert(!pdf.text.includes('Lagret fullfører'));
const field=document.querySelector('[role="dialog"] textarea');await act(async()=>{Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype,'value').set.call(field,'QA ulagret kontrolltekst');field.dispatchEvent(new window.Event('input',{bubbles:true}));});assert(button('Last ned PDF').disabled);assert(document.body.textContent.includes('Lagre endringene først'));assert(!calls.some(name=>name.endsWith('_command')),'Export silently wrote, signed or completed');
// Leaving a document while the read is pending cancels the final file. The same
// contract is used for profile/screen changes by each button instance.
await render('button',{kind:'routine',row:savedState.versions[0],companyId:company,userId:user});deferred={};deferred.promise=new Promise(resolve=>deferred.resolve=resolve);await click('Last ned PDF');const lateCount=exports.length;await render('button',{kind:'routine',row:savedState.versions[0],companyId:company,userId:'other'});deferred.resolve();deferred=null;await act(async()=>pause(150));assert.equal(exports.length,lateCount);
savedControls.runs[0].status='completed';assert.equal(JSON.stringify({savedState,savedCentral,savedControls}),prior,'PDF mutated source');
await act(async()=>window.__unmount());dom.window.close();fs.rmSync(temp,{recursive:true,force:true});console.log(JSON.stringify({result:'PASS',actualPdfs:exports.length,output,scenarios:'actual routine reading/personal/central/project buttons; long text; saved images/logo; template/draft/completion; no staff/draft/URL leak; unsaved block; newer revision; final access revoke; late user switch; no mutation'}));
