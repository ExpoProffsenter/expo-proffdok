import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
const {JSDOM}=await import(process.env.KSHMS_JSDOM_PATH||'jsdom');
const dir=process.cwd(),temp=fs.mkdtempSync(path.join(os.tmpdir(),'participants-workspace-'));
let checks=0;const eq=(a,b,label)=>{assert.deepEqual(a,b,label);checks++;};
fs.writeFileSync(path.join(temp,'entry.jsx'),`
import React,{act,useState} from '${dir}/node_modules/react/index.js';
import {createRoot} from '${dir}/node_modules/react-dom/client.js';
import {installProjectParticipantsUx} from '${dir}/src/modules/project/projectParticipantsUxV3.jsx';
import Chrome,{ProjectWorkspaceFooter} from '${dir}/src/modules/project/ProjectWorkspaceChrome.jsx';
import {createProjectWorkspaceTabs} from '${dir}/src/modules/project/projectNavigationTabs.mjs';
import {createAccessViewTools} from '${dir}/src/modules/portal/accessViewTools.js';
const root=createRoot(document.getElementById('app'));
const tools=createAccessViewTools({Section:({title,children})=><section><h2>{title}</h2>{children}</section>,Textarea:()=>null,Grid:({children})=><div>{children}</div>,Input:()=>null,Select:()=>null,uid:()=> 'qa'});
function App({version=0,readOnly=false}){
 const [tab,setTab]=useState('prosjekt');window.tab=tab;const tabs=createProjectWorkspaceTabs();
 const props={tabs,activeTab:tab,project:{projectName:'QA'},saved:true,readOnly,status:{label:'Pågår'},onNavigate:id=>{setTab(id);return true;},onContinue:()=>{window.genericSaves++;},onExit:()=>setTab('away')};
 return <div data-expo-project-shell="1"><Chrome {...props}/><main>{tab==='prosjekt'?<section key={version}><h2>Rediger kunde- og prosjektinfo</h2></section>:tab==='tilgang'?tools.renderAccessPanel({project:{},projectId:'qa',controllerReadOnly:readOnly,access:[],accessRoleInfo:[],roles:[],portalAccessRecordIsValid:()=>false,getPortalAccessRecord:()=>null,portalAccessPolicyText:()=> 'QA',setAccess(){},copyAccessLink:()=>window.portalCalls++,sendAccessEmail:()=>window.portalCalls++}):<p>Other content</p>}</main><ProjectWorkspaceFooter {...props}/></div>;
}
window.qaAct=act;window.qaRender=props=>root.render(<App {...props}/>);window.genericSaves=0;window.portalCalls=0;window.qaUnmount=()=>root.render(null);installProjectParticipantsUx();
`);
const bundle=await build({root:dir,configFile:false,logLevel:'silent',resolve:{alias:{'react/jsx-runtime':path.join(dir,'node_modules/react/jsx-runtime.js')}},define:{'process.env.NODE_ENV':'"development"'},plugins:[react(),{name:'participant-transport',enforce:'pre',resolveId(id){if(id.endsWith('/salesSupabase.js'))return '\0client';if(id.endsWith('/appSupabaseClientRegistry.js'))return '\0registry';if(id.endsWith('/progressPlanSupabase.js'))return '\0safe';},load(id){if(id==='\0client')return 'export const createDefaultSalesSupabaseClient=()=>({});';if(id==='\0registry')return 'export const whenAppSupabaseClientRegistered=()=>{};';if(id==='\0safe')return 'export const isProgressSafePreviewMode=()=>true;';}}],build:{write:false,minify:false,lib:{entry:path.join(temp,'entry.jsx'),formats:['iife'],name:'ParticipantsProof',fileName:'proof'}}});
const dom=new JSDOM('<div id="app"></div>',{url:'https://qa.vercel.app/?project=qa&role=admin&progressTest=safe',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window;
w.IS_REACT_ACT_ENVIRONMENT=true;w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=function(){};w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});w.MessageChannel=class{constructor(){this.port1={onmessage:null};this.port2={postMessage:()=>setImmediate(()=>this.port1.onmessage?.())};}};
w.eval((Array.isArray(bundle)?bundle[0]:bundle).output.find(x=>x.type==='chunk').code);
const act=w.qaAct,settle=async()=>act(async()=>{await new Promise(resolve=>w.requestAnimationFrame(()=>w.requestAnimationFrame(resolve)));});
const panel=()=>w.document.getElementById('expo-project-participants-root');
const button=(name,scope=w.document)=>[...scope.querySelectorAll('button')].find(e=>e.getAttribute('aria-label')===name||e.textContent.trim()===name);
const click=async(name,scope)=>{const e=button(name,scope);assert(e,'Missing button '+name);await act(async()=>e.click());await settle();};
const fill=async(field,value)=>{const e=panel().querySelector('[data-participant-field='+field+']');assert(e);await act(async()=>{Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype,'value').set.call(e,value);e.dispatchEvent(new w.Event('input',{bubbles:true}));});return e;};
try{
 await act(async()=>w.qaRender({}));await settle();eq(Boolean(panel()),true,'existing overview still hosts participant list');
 await click('+ Legg til',panel());const input=await fill('name','QA retained name');await fill('email','qa@example.invalid');
 let confirms=0;w.confirm=()=>{confirms++;return false;};
 await click('Deltakere og tilganger');eq(w.tab,'prosjekt','cancelled participant leave stays on overview');eq(confirms,1,'new labelled map button uses existing dirty guard');eq(panel().querySelector('[data-participant-field=name]').value,'QA retained name','cancel keeps name');
 await act(async()=>w.qaRender({version:1}));await settle();eq(panel().querySelector('[data-participant-field=name]'),input,'actual root reattaches without replacing edited input');
 await click('Lagre prosjektinvolverte',panel());eq(panel().textContent.includes('Prosjektinvolverte er lagret lokalt'),true,'own participant save retains its confirmation');
 await click('Deltakere og tilganger');eq(w.tab,'tilgang','new map opens existing access tab');eq(panel().parentElement.hasAttribute('data-project-participants-slot'),true,'same participant list is visible before portals');eq(w.document.querySelectorAll('#expo-project-participants-root').length,1,'no duplicate participant editor');eq(panel().querySelector('[data-participant-field=email]').value,'qa@example.invalid','saved contact retained in combined area');
 eq(w.portalCalls,0,'contact registration never sends or creates portal access');eq(w.genericSaves,0,'contact registration never uses generic project saving');
 await fill('name','QA unsaved access name');w.confirm=()=>{confirms++;return false;};const before=confirms;
 const footer=w.document.querySelector('.project-flow-footer');await click('Gå til Prosjektbeskrivelse →',footer);eq(w.tab,'tilgang','footer respects independent participant draft');eq(confirms,before+1,'footer guard fires once');
 await click('Sjekklister',w.document.querySelector('.project-field-bar'));eq(w.tab,'tilgang','mobile quick action also respects participant draft');
 await act(async()=>{w.dispatchEvent(new w.Event('blur'));w.dispatchEvent(new w.Event('focus'));});await settle();eq(panel().querySelector('[data-participant-field=name]').value,'QA unsaved access name','focus roundtrip retains contact draft');
 await click('Lagre prosjektinvolverte',panel());await click('Gå til Prosjektbeskrivelse →',footer);eq(w.tab,'prosjektinfo','saved contact allows normal next navigation');
 await click('Deltakere og tilganger');eq(panel().querySelector('[data-participant-field=name]').value,'QA unsaved access name','reopen reads saved contact again');
 await act(async()=>w.history.replaceState({},'', '/?project=other&role=admin&progressTest=safe'));await act(async()=>w.qaRender({version:2}));await settle();eq(panel().querySelectorAll('[data-participant-field=name]').length,0,'another project does not receive previous contacts');
 await act(async()=>w.qaRender({version:3,readOnly:true}));await settle();eq(panel(),null,'read-only access does not gain a participant editor');
 await act(async()=>w.qaRender({version:4}));await settle();
 await act(async()=>w.history.replaceState({},'', '/?project=other&role=kunde'));await act(async()=>w.qaRender({version:3}));await settle();eq(panel(),null,'participant editor is never injected into customer portal');
 console.log('Participants workspace React: '+checks+' assertions PASS — shared placement, retained input, existing save, dirty guards, mobile, focus and project/portal isolation');
}finally{await act(async()=>w.qaUnmount());dom.window.close();fs.rmSync(temp,{recursive:true,force:true});}
