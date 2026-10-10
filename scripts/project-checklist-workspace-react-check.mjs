import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
const {JSDOM}=await import(process.env.KSHMS_JSDOM_PATH||'jsdom');
const dir=process.cwd(),temporary=fs.mkdtempSync(path.join(os.tmpdir(),'project-checklist-qa-')),entry=path.join(temporary,'entry.jsx');
fs.writeFileSync(entry,`import React,{act} from '${dir}/node_modules/react/index.js';import {createRoot} from '${dir}/node_modules/react-dom/client.js';import Workspace from '${dir}/src/modules/checklist/ProjectChecklistWorkspace.jsx';import {createChecklistEditor} from '${dir}/src/modules/checklist/checklistTools.js';import {installDesktopSideMenu} from '${dir}/src/modules/app/desktopSideMenu.js';import {installProjectWorkspaceHeaderGuide} from '${dir}/src/modules/app/projectWorkspaceHeaderGuide.js';
const Editor=createChecklistEditor({Section:p=>React.createElement('section',{},p.children),Grid:p=>React.createElement('div',{},p.children),Textarea:p=>React.createElement('label',{},p.label,React.createElement('textarea',{value:p.value||'',onChange:e=>p.onChange(e.target.value)})),getActiveChecklistTemplate:()=>[],getWarrantyYears:()=>5,canUseCustomChecklistForWarranty:()=>false,customChecklistTradeOptions:['Rørlegger'],customChecklistCategoryFromTrade:trade=>'Egne sjekkpunkter – '+trade,customChecklistTradeFromCategory:category=>category.split(' – ').at(-1),customChecklistTradeIconUrl:()=> 'https://example.invalid/icon.svg',hasValue:value=>String(value||'').trim().length>0,customChecklistCategoryPrefix:'Egne sjekkpunkter',checklistPointAnchor:(group,item)=>group+item,isWarrantyCheckpoint:()=>false,isSoproWarrantyPoint:()=>false,isSoproWarrantyCategory:()=>false,checklistAttachmentTradeOptions:[],checklistAttachmentDocumentTypeOptions:[],publicProjectFileUrl:()=>''});
const root=createRoot(document.getElementById('app'));globalThis.__act=act;globalThis.__render=props=>root.render(React.createElement(Workspace,{...props,Editor}));globalThis.__unmount=()=>root.render(null);globalThis.__menus=()=>{installDesktopSideMenu();installProjectWorkspaceHeaderGuide();};`);
const bundle=await build({root:dir,configFile:false,logLevel:'silent',define:{'process.env.NODE_ENV':'"development"'},build:{write:false,minify:false,lib:{entry,formats:['iife'],name:'WorkspaceProof',fileName:'proof'}},plugins:[react(),{name:'qa-rpc',enforce:'pre',resolveId(id){if(/kshmsAccess\.js$/.test(id))return '\0rpc';if(/appSupabaseClientRegistry\.js$/.test(id))return '\0client';},load(id){if(id==='\0rpc')return 'export const kshmsRpc=(...args)=>globalThis.__rpc(...args);';if(id==='\0client')return 'export const getAppSupabaseClient=()=>null;';}}]});
const dom=new JSDOM('<header><nav><button>Ordreoversikt</button><button>Ordrebeskrivelse</button><button>Sjekklister</button><button>Bilder</button><button style="display:none">Garanti</button><button>Hjelp</button></nav></header><main><div id="app"></div></main>',{url:'https://example.invalid',runScripts:'outside-only',pretendToBeVisual:true});
const {window}=dom;window.IS_REACT_ACT_ENVIRONMENT=true;window.confirm=()=>true;window.prompt=()=> 'OK';window.alert=()=>{};
window.matchMedia=()=>({matches:true,addEventListener(){},removeEventListener(){}});
window.HTMLElement.prototype.scrollIntoView=function(){};
window.MessageChannel=class{constructor(){this.port1={onmessage:null};this.port2={postMessage:()=>setImmediate(()=>this.port1.onmessage?.())};}};
const frames=[];window.requestAnimationFrame=callback=>{frames.push(callback);return frames.length;};
const company='11111111-1111-4111-8111-111111111111',project='99999999-9999-4999-8999-999999999999',category='Egne sjekkpunkter – Rørlegger';
const group={category,items:['Kontroller rør','Kontroller merking'],requirements:{}};
let runs=[],checklist={},failAfterCommit=false,lastRequest=null,lateResolve=null;
const receipts=new Map(),identity={id:'user',name:'QA Utførende'};
window.__rpc=async(name,args)=>{
 if(name==='project_checklist_state'){
  if(lateResolve){await new Promise(resolve=>{lateResolve.resolve=resolve;});}
  return {context:{company_id:company,project_id:project,user_id:'user'},runs:structuredClone(runs),checklist:structuredClone(checklist)};
 }
 assert.equal(name,'project_checklist_command');lastRequest=args.p_request_id;
 if(receipts.has(args.p_request_id))return receipts.get(args.p_request_id);
 const old=runs.find(row=>row.id===args.p_payload.id);
 if(old&&old.revision!==args.p_payload.revision){const error=Error('En annen person har lagret. Kladden er beholdt.');error.code='40001';throw error;}
 const row={...structuredClone(args.p_payload),category,company_id:company,project_id:project,revision:(old?.revision||0)+1,status:args.p_action==='complete'?'completed':'draft',updated_at:'2026-10-07T19:00:00Z',updated_identity:identity,...(args.p_action==='complete'?{completed_at:'2026-10-07T19:00:00Z',completed_identity:identity}:{})};
 runs=[row,...runs.filter(value=>value.id!==row.id)];checklist={...checklist,[category]:row.answers};
 const result={context:{company_id:company,project_id:project,user_id:'user'},run:row,answers:row.answers};receipts.set(args.p_request_id,result);
 if(failAfterCommit){failAfterCommit=false;throw Error('Svaret ble borte etter lagring');}return result;
};
window.eval((Array.isArray(bundle)?bundle[0]:bundle).output.find(value=>value.type==='chunk').code);
const act=window.__act,button=text=>[...window.document.querySelectorAll('button')].find(node=>node.textContent.trim()===text);
const click=async node=>{assert(node,'Missing button');await act(async()=>node.click());};
const choose=async(value,index=0)=>click([...window.document.querySelectorAll('button')].filter(node=>node.textContent.trim()===value)[index]);
const props=()=>({companyId:company,userId:'user',projectId:project,checklist,activeChecklistTemplate:[group],customChecklistAllowed:true,files:[],setFiles(){},addFiles(){},customChecklistGroups:[],onSaved:async(cat,answers)=>{checklist={...checklist,[cat]:answers};},uploadImages:async()=>[{id:'photo',url:'https://example.invalid/proof.jpg'}]});
await act(async()=>window.__render(props()));assert.equal(window.document.querySelector('.project-checklist-heading').getAttribute('aria-expanded'),'false');
assert(!window.document.body.textContent.includes('Kontroller rør'),'Collapsed list leaked points');
await click(button('Åpne sjekkliste'));assert(window.document.querySelector('[role="dialog"]'));await choose('Ok');
const dialog=window.document.querySelector('[role="dialog"]');dialog.scrollTop=120;await click(button('Lagre'));
assert.equal(window.document.querySelector('[role="dialog"]'),dialog);assert.equal(dialog.scrollTop,120);assert.equal(runs[0].answers['Kontroller rør'].status,'Ok');
await click(button('Lukk'));await act(async()=>window.__unmount());await act(async()=>window.__render(props()));await click(button('Åpne sjekkliste'));
assert.equal(runs.length,1);assert(window.document.body.textContent.includes('Kontroll under arbeid'));await choose('Ikke aktuelt',1);
await click(button('Sjekkliste fullført'));assert.equal(runs[0].status,'completed');assert(window.document.body.textContent.includes('QA Utførende'));
const first=structuredClone(runs[0]);await click(button('Start ny kontroll'));assert.equal(window.document.querySelector('fieldset:disabled'),null);assert.equal(window.document.querySelectorAll('button.statusOn').length,0);
await choose('Avvik');await choose('Ikke aktuelt',1);failAfterCommit=true;await click(button('Lagre'));assert(window.document.body.textContent.includes('Svaret ble borte'));const retry=lastRequest;
await click(button('Prøv lagring igjen'));assert.equal(lastRequest,retry);assert.equal(runs.length,2);assert.deepEqual(runs[1],first);
await click(button('Lukk'));await click(button('Åpne sjekkliste'));
// A second colleague saves while this person's local draft is open.
await choose('Ok');runs[0]={...runs[0],revision:runs[0].revision+1,answers:{...runs[0].answers,'Kontroller rør':{status:'Avvik',comment:'Kollegas retting'}}};checklist={[category]:runs[0].answers};
await click(button('Lagre'));assert(window.document.body.textContent.includes('En annen person har lagret'));
await click(button('Vis lagret kontroll'));await click(button('Fortsett med lagret kontroll'));assert(window.document.body.textContent.includes('Kollegas retting'));
await click(button('Vis tidligere kladd'));assert(window.document.querySelector('fieldset:disabled'));await click(button('Tilbake til kladden'));
await click(button('✅ Lukk avvik'));await click(button('Sjekkliste fullført'));assert.equal(runs[0].answers['Kontroller rør'].status,'Lukket avvik');assert.deepEqual(runs[1],first);
await click(button('Start ny kontroll'));await choose('Avvik');await choose('Ikke aktuelt',1);await click(button('Sjekkliste fullført'));
const deviationControl=structuredClone(runs[0]);await click(button('Lukk'));
await act(async()=>{window.sessionStorage.setItem('expoProffDokChecklistJumpTarget',JSON.stringify({category,item:'Kontroller rør'}));window.dispatchEvent(new window.Event('expoProffDokChecklistJump'));});
assert.equal(window.document.querySelector('fieldset:disabled'),null,'Go to point opened an immutable control instead of a follow-up');await click(button('✅ Lukk avvik'));await click(button('Lagre'));assert.equal(runs[0].answers['Kontroller rør'].status,'Lukket avvik');assert.deepEqual(runs[1],deviationControl);
await click(button('Lukk'));await act(async()=>window.__unmount());
// Late readback must not re-open a project after a scope change.
lateResolve={};await act(async()=>window.__render(props()));await act(async()=>window.__unmount());await act(async()=>lateResolve.resolve());lateResolve=null;assert.equal(window.document.querySelector('[role="dialog"]'),null);
window.__menus();for(let index=0;index<4&&frames.length;index++)frames.shift()();
assert(window.document.body.textContent.includes('Ordremeny'));assert(!window.document.querySelector('.expoProjectWorkspaceQuickActions')?.textContent.includes('Garanti'));
dom.window.close();fs.rmSync(temporary,{recursive:true,force:true});
console.log('Project checklist real React flow: PASS — collapsed lists, popup, save/reopen, immutable history, lost response, concurrent colleague, retained draft, legacy deviation follow-up and compact order menu');
