import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { build } from 'vite';
import react from '@vitejs/plugin-react';
const { JSDOM } = await import(process.env.KSHMS_JSDOM_PATH || 'jsdom');

// Use React's keyed source buttons and the real production presentation adapters.
// Leaving an order must preserve the new labels that React has already rendered.
const dir = process.cwd();
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'project-menu-return-'));
const entry = path.join(temporary, 'entry.jsx');
const main = fs.readFileSync(path.join(dir,'src/main.jsx'),'utf8');
const navLine = main.split('\n').find(line=>line.includes('("nav", { children: tabs.map'));
assert(navLine,'Missing actual production source-nav renderer');
const navExpression = navLine.slice(navLine.indexOf('(0, import_jsx_runtime.jsx)')).replace(/,$/,'');
fs.writeFileSync(entry, `
import React,{act} from '${dir}/node_modules/react/index.js';
import * as jsxRuntime from '${dir}/node_modules/react/jsx-runtime.js';
import {createRoot} from '${dir}/node_modules/react-dom/client.js';
import {createGlobalAppTabs,createProjectWorkspaceTabs} from '${dir}/src/modules/project/projectNavigationTabs.mjs';
import {installDesktopSideMenu} from '${dir}/src/modules/app/desktopSideMenu.js';
import {installProjectWorkspaceHeaderGuide} from '${dir}/src/modules/app/projectWorkspaceHeaderGuide.js';
import {installProjectWorkflowUx} from '${dir}/src/modules/project/projectWorkflowUx.js';
import {installSimpleOrderWorkspaceUx} from '${dir}/src/modules/project/simpleOrderWorkspaceUx.js';
const root=createRoot(document.getElementById('root'));
const sourceNav=new Function('import_jsx_runtime','tabs','tab','goToTab',${JSON.stringify('return '+navExpression)});
function App({kind,active='prosjekt',withKshms=true}){
 const global=kind==='global';
 const tabs=global?createGlobalAppTabs({isCompanyAdminUser:true,canUseAdminProjectSync:true,canUseKshms:withKshms}):createProjectWorkspaceTabs({hasSalesOrigin:kind!=='new',isNewProject:kind==='new'});
 return <><header><div className='head'><h1>Expo ProffDok</h1>{!global&&<button onClick={()=>globalThis.__open('global')}>← Til startside</button>}</div>{sourceNav(jsxRuntime,tabs,active,id=>globalThis.__select(id))}<div className='mobileNavSelectWrap'><select value={active} onChange={event=>globalThis.__select(event.target.value)}>{tabs.map(([id,label])=><option key={id} value={id} data-expo-nav-label={label}>{label}</option>)}</select></div></header><main>{global?<h2>Hva vil du jobbe med?</h2>:<section><h2>{kind==='order'?'Ordreoversikt':'Prosjektoversikt'}</h2>{kind==='order'&&<span data-expo-workflow-type='simple_order'/>}{kind!=='new'&&<span data-expo-sales-origin-ref='synthetic-order'/>}</section>}</main></>;
}
globalThis.__act=act;
globalThis.__render=props=>root.render(<App {...props}/>);
globalThis.__install=()=>{installDesktopSideMenu();installProjectWorkspaceHeaderGuide();installProjectWorkflowUx();installSimpleOrderWorkspaceUx();};
`);
const bundle = await build({root:dir,configFile:false,logLevel:'silent',resolve:{alias:{'react/jsx-runtime':path.join(dir,'node_modules/react/jsx-runtime.js')}},define:{'process.env.NODE_ENV':'"development"'},build:{write:false,minify:false,lib:{entry,formats:['iife'],name:'MenuReturnProof',fileName:'proof'}},plugins:[react(),{name:'qa-client',enforce:'pre',resolveId(id){if(/appSupabaseClientRegistry\.js$/.test(id))return '\0client';},load(id){if(id==='\0client')return 'export const getAppSupabaseClient=()=>({from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:{data:{project:{workflowType:globalThis.__kind===\"order\"?\"simple_order\":\"wetroom\"}}},error:null})})})})});';}}]});

const dom = new JSDOM('<div id="root"></div>',{url:'https://example.invalid/?progressTest=safe',runScripts:'outside-only',pretendToBeVisual:true});
const { window } = dom;
window.IS_REACT_ACT_ENVIRONMENT = true;
let desktop = true;
window.matchMedia = () => ({get matches(){return desktop;},addEventListener(){},removeEventListener(){}});
window.HTMLElement.prototype.scrollIntoView = function(){};
window.MessageChannel = class{constructor(){this.port1={onmessage:null};this.port2={postMessage:()=>setImmediate(()=>this.port1.onmessage?.())};}};
const frames=[];
window.requestAnimationFrame = callback => {frames.push(callback);return frames.length;};
window.eval((Array.isArray(bundle)?bundle[0]:bundle).output.find(value=>value.type==='chunk').code);
const act=window.__act;
let current={kind:'global',active:'prosjekt',withKshms:true};
async function settle(){
 for(let index=0;index<12;index++){
  await act(async()=>{const batch=frames.splice(0);for(const callback of batch)callback();await Promise.resolve();});
 }
}
function navigate(kind){
 current={...current,kind,active:'prosjekt'};
 window.__kind=kind;
 window.history.replaceState({},'',kind==='global'?'/?progressTest=safe':`/?progressTest=safe&project=${kind}&role=admin`);
 window.__render(current);
}
async function open(kind){
 await act(async()=>navigate(kind));
 await settle();
}
window.__open = navigate;
window.__select = id => {current={...current,active:id};window.__render(current);};
await open('global');
window.__install();
await settle();
const nav=()=>window.document.querySelector('header nav');
const labels=()=>[...nav().querySelectorAll(':scope > button')].map(node=>node.textContent.trim());
const shell=()=>window.document.getElementById('expo-desktop-menu-bar');
const globalMenu=()=>{
 assert(shell(),`Main menu fell back to the legacy button row: ${labels().join(' | ')}`);
 assert(nav().classList.contains('expoDesktopSourceNavHidden'));
 assert(labels().includes('Startside'),`React Startside label was overwritten: ${labels()}`);
 assert(labels().includes('Befaring/Tilbud'),`React sales label was overwritten: ${labels()}`);
 assert(!window.document.getElementById('expo-project-workspace-guide'));
 assert(!window.document.getElementById('expo-simple-order-workspace-badge'));
};
globalMenu();
await open('order');
assert(labels().includes('Ordreoversikt'));
assert(window.document.body.textContent.includes('Ordremeny'));
assert(!window.document.querySelector('.expoProjectWorkspaceQuickActions')?.textContent.includes('Fag/utstyr'));
await act(async()=>window.document.getElementById('expo-desktop-home-button').click());
await settle();
globalMenu();
console.log('Desktop order → Startside: PASS');
await open('order');
await open('wetroom');
assert(labels().includes('Prosjektoversikt'));
assert(!labels().includes('Ordreoversikt'));
assert(window.document.querySelector('.expoProjectWorkspaceHint')?.textContent==='Prosjektmeny');
assert(window.document.querySelector('.expoProjectWorkspaceQuickActions')?.textContent.includes('Fag/utstyr'));
await open('global');
globalMenu();
// The drawer still clicks the real React source, including the new KS/HMS entry.
await act(async()=>window.document.querySelector('.expoDesktopMenuToggle').click());
await settle();
const ks=[...window.document.querySelectorAll('.expoDesktopDrawerButton')].find(node=>node.textContent==='KS/HMS');
assert(ks);
await act(async()=>ks.click());
await settle();
assert.equal(current.active,'kshms');
assert.equal(window.document.querySelector('.expoDesktopMenuToggle').getAttribute('aria-expanded'),'false');
current.withKshms=false;
await open('global');
assert(![...window.document.querySelectorAll('.expoDesktopDrawerButton')].some(node=>node.textContent==='KS/HMS'));
globalMenu();
desktop=false;
await open('order');
await open('global');
assert(!shell(),'Desktop drawer leaked into the mobile surface');
assert(labels().includes('Startside'));
assert(labels().includes('Befaring/Tilbud'));
const mobileLabels=[...window.document.querySelectorAll('.mobileNavSelectWrap option')].map(option=>option.textContent);
assert(mobileLabels.includes('Startside'));
assert(mobileLabels.includes('Befaring/Tilbud'));
dom.window.close();
fs.rmSync(temporary,{recursive:true,force:true});
console.log('Project menu real React flow: PASS — order → Startside, order → wetroom, native KS/HMS navigation, without KS/HMS and mobile labels');
