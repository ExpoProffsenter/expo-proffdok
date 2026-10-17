import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { build } from 'vite';
import react from '@vitejs/plugin-react';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const cwd = process.cwd(), temp = fs.mkdtempSync(path.join(os.tmpdir(), 'project-mobile-header-'));
const main = fs.readFileSync('src/main.jsx', 'utf8');
const start = main.lastIndexOf('(0, import_jsx_runtime.jsxs)("div", { className: "head",');
const end = main.indexOf('\n        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav",', start);
assert(start >= 0 && end > start, 'Use the complete actual app header, including Logg ut and return button');
const header = main.slice(start, end).trim().replace(/,$/, '');
const brand = main.slice(main.indexOf('  function Brand('), main.indexOf('  function AppInstallGuide('));
const profileSource = fs.readFileSync('src/modules/access/workProfileUx.jsx', 'utf8');
const profileStyle = profileSource.match(/<style>\{`([\s\S]*?)`\}<\/style>/)[1].replaceAll('${HOST_ID}', 'expo-work-profile-switcher');
const navigation=main.slice(main.indexOf('    const requestChecklistEntry ='),main.indexOf('    const openKshmsDeviation ='));
fs.writeFileSync(path.join(temp, 'entry.jsx'), `
import React, {useState} from '${cwd}/node_modules/react/index.js';
import {createRoot} from '${cwd}/node_modules/react-dom/client.js';
import * as jsxRuntime from '${cwd}/node_modules/react/jsx-runtime.js';
import Chrome,{ProjectHeaderActions} from '${cwd}/src/modules/project/ProjectWorkspaceChrome.jsx';
import {createProjectWorkspaceTabs} from '${cwd}/src/modules/project/projectNavigationTabs.mjs';
import Workspace from '${cwd}/src/modules/checklist/ProjectChecklistWorkspace.jsx';
import '${cwd}/src/style.css';
import {APP_RUNTIME_STYLES} from '${cwd}/src/modules/app/appRuntimeStyles.js';
document.head.insertAdjacentHTML('beforeend', '<style>'+APP_RUNTIME_STYLES+'</style><style>'+${JSON.stringify(profileStyle)}+'</style>');
const actualHeader = new Function('scope', ${JSON.stringify('with(scope){' + brand + ';return ' + header + ';}')});
const actualNavigation=new Function('scope',${JSON.stringify('with(scope){'+navigation+';return goToTab(target);}')});
const checklistGroups=[{category:'Ferdig kontroll',items:['Punkt']},{category:'Neste kontroll',items:['Punkt']}];
window.rpc=async name=>{if(name!=='project_checklist_state')throw Error('Shortcut must not save');return {context:{company_id:'company',project_id:'qa',user_id:'user'},runs:[{id:'completed',category:'Ferdig kontroll',status:'completed',revision:1,definition:checklistGroups[0],answers:{Punkt:{status:'Ok'}}}],checklist:{}};};
function Editor({activeChecklistTemplate,checklist,setChecklistValue}){const group=activeChecklistTemplate[0];if(!group)return null;return <label>Kontrollkommentar<textarea aria-label="Kontrollkommentar" value={checklist[group.category].Punkt?.comment||''} onChange={e=>setChecklistValue(group.category,'Punkt',{comment:e.target.value})}/></label>;}
window.calls={save:0,copy:0,pdf:0,new:0,exit:0,logout:0,lock:[]};
function App(){
 const [kind,setKind]=useState('saved'),[profile,setProfile]=useState(true),[tab,setTab]=useState('sjekklister');
 const [request,setRequest]=useState(null);
 window.changeKind=setKind;window.showProfile=setProfile;
 const saved=kind!=='new',readOnly=kind==='support';
 const scope={import_jsx_runtime:jsxRuntime,ProjectHeaderActions,company:{logoUrl:'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="260" height="80"><text x="0" y="45">QA Firma</text></svg>'},name:'QA Firma',projectId:saved?'qa':null,currentStatus:{icon:'🟡',label:'Pågår'},authUser:{email:'qa@example.invalid'},hasActiveProjectWorkspace:true,isProjectSupportReadOnly:readOnly,mobileCreatingProject:!saved,projectDirty:kind==='dirty',isProjectLocked:kind==='locked',project:{},isSimpleOrderProject:()=>kind==='order',signOut:()=>window.calls.logout++,createNewProject:()=>window.calls.new++,cancelNewProject:()=>window.calls.exit++,leaveProjectWorkspace:()=>window.calls.exit++,saveProject:()=>window.calls.save++,saveAsNewProject:()=>window.calls.copy++,downloadClickablePdfReport:()=>window.calls.pdf++,setProjectLockedState:value=>window.calls.lock.push(value)};
 const tabs=createProjectWorkspaceTabs({isNewProject:!saved,hasSalesOrigin:saved,canUseKshms:true});
 const goToTab=target=>actualNavigation({target,tab,tabs,projectId:scope.projectId,kshmsContext:{company_id:'company'},authUser:{id:'user'},setChecklistEntryRequest:setRequest,setMobileStatusOpen(){},hasActiveProjectWorkspace:true,setTab,setMobileMenuOpen(){},scrollToMobileTabTarget(){},confirmLeaveWithUnsavedChanges:async()=>true,syncInternalProjectUrl(){},setTimeout(){}});
 return <div data-expo-project-shell="1"><header>{actualHeader(scope)}{profile&&<div id="expo-work-profile-switcher"><div className="workProfileControl"><button className="secondary workProfileButton"><span><small>Representerer</small><b>Et firma med et svært langt navn som må passe på mobil</b></span></button></div></div>}</header><Chrome tabs={tabs} activeTab={tab} project={{projectName:'Modernisering av bad',customer:'QA Kunde',address:'Testveien 6',postnr:'0001',city:'Oslo'}} saved={saved} simpleOrder={kind==='order'} status={{icon:'🟡',label:'Pågår'}} deviations={0} unread={0} onNavigate={goToTab} onExit={()=>window.calls.exit++} onStatus={()=>{}} readOnly={readOnly}/><main><h2>Sjekklister og vedlegg</h2><label>Kladd<input aria-label="Kladd" defaultValue="Behold arbeidet mitt"/></label>{tab==='sjekklister'&&<Workspace Editor={Editor} companyId="company" userId="user" projectId={scope.projectId} activeChecklistTemplate={checklistGroups} checklist={{}} showTools={false} readOnly={readOnly||kind==='locked'} entryRequest={request} onEntryHandled={id=>setRequest(current=>current?.id===id?null:current)}/>}</main></div>;
}
createRoot(document.getElementById('app')).render(<App/>);
`);
const result = await build({root:cwd,configFile:false,logLevel:'silent',resolve:{alias:{'react/jsx-runtime':path.join(cwd,'node_modules/react/jsx-runtime.js')}},plugins:[react(),{name:'header-checklist-rpc',enforce:'pre',resolveId(id){if(/kshmsAccess\.js$/.test(id))return '\0rpc';},load(id){if(id==='\0rpc')return 'export const kshmsRpc=(...args)=>window.rpc(...args);';}}],build:{write:false,minify:false,cssCodeSplit:false,rollupOptions:{input:path.join(temp,'entry.jsx'),output:{inlineDynamicImports:true}}}});
const js=result.output.find(x=>x.type==='chunk').code, css=result.output.filter(x=>x.fileName.endsWith('.css')).map(x=>x.source).join('\n');
const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html;charset=utf-8');res.end(`<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style><div id="app"></div><script type="module">${js.replaceAll('</script','<\\/script')}</script>`);});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser,checks=0;
const eq=(a,b,label)=>{assert.deepEqual(a,b,label);checks++;};
try {
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
 const errors=[];
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 page.on('pageerror',e=>{errors.push(e.message);console.error(e.message);});page.setDefaultTimeout(4000);
 await page.goto('http://127.0.0.1:'+server.address().port);
 const trigger=page.getByRole('button',{name:'Flere handlinger',exact:true});
 await trigger.waitFor();
 for(const width of [390,320,375,430,700]) {
  await page.setViewportSize({width,height:844});
  const boxes=await page.locator('header').evaluate(header=>{
   const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,right:r.right,bottom:r.bottom};};
   const head=header.querySelector('.head'),actions=head.querySelector('.project-header-actions');
   return {head:rect(head),actions:rect(actions),profile:rect(header.querySelector('#expo-work-profile-switcher')),buttons:[...actions.querySelectorAll(':scope > button,:scope > div > button')].map(rect),overflow:document.documentElement.scrollWidth-innerWidth};
  });
  eq(boxes.overflow,0,'actual header does not widen viewport '+width);
  const context=await page.locator('.project-workspace').boundingBox();
  eq(context.x>=11&&context.x+context.width<=width-11,true,'entire project context keeps both side margins '+width);
  eq(boxes.actions.x>=10&&boxes.actions.right<=width-10,true,'action row fits inside header '+width);
  eq(boxes.actions.width>=width-24,true,'actions span complete header rather than logo column '+width);
  eq(Math.abs(boxes.buttons[0].y-boxes.buttons[1].y)<=1,true,'save and dropdown share one row (including 1px hover transform) '+width);
  eq(Math.abs(boxes.buttons[0].width-boxes.buttons[1].width)<1,true,'buttons have equal usable widths '+width);
  eq(boxes.profile.right<=width,true,'profile width includes side padding '+width);
  eq(await trigger.evaluate(button=>{const r=button.getBoundingClientRect(),range=document.createRange();range.selectNodeContents(button);return [...range.getClientRects()].every(text=>text.left>=r.left&&text.right<=r.right&&text.top>=r.top&&text.bottom<=r.bottom);}),true,'complete dropdown label stays inside button '+width);
  await trigger.click();const menu=page.getByRole('menu',{name:'Flere handlinger',exact:true});
  const m=await menu.boundingBox(),t=await trigger.boundingBox();
  eq(m.x>=0&&m.x+m.width<=width,true,'open dropdown fits viewport '+width);
  eq(m.y>=t.y+t.height,true,'dropdown opens below trigger '+width);
  await menu.press('Escape');
  eq(await trigger.evaluate(e=>document.activeElement===e),true,'Escape returns focus '+width);
 }
 for(const kind of ['dirty','order','new','locked','support']) {
  await page.evaluate(kind=>window.changeKind(kind),kind);
  eq(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'state retains header width '+kind);
  await trigger.click();const menu=page.getByRole('menu',{name:'Flere handlinger',exact:true});
  if(kind==='new')eq(await menu.getByRole('menuitem',{name:'Lagre som kopi',exact:true}).count(),0,'new project cannot copy');
  if(kind==='support')eq(await page.locator('.project-header-actions > button').count(),0,'support still has no save');
  await menu.getByRole('menuitem',{name:'Last ned PDF',exact:true}).click();
 }
 eq(await page.evaluate(()=>window.calls.pdf),5,'PDF callback retained once per state');
 eq(await page.getByLabel('Kladd').inputValue(),'Behold arbeidet mitt','layout and actions preserve field value');
 await page.evaluate(()=>{window.showProfile(false);window.changeKind('saved');});
 eq(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'single-firm user has no overflow');
 await trigger.click();await page.getByRole('menuitem',{name:'Lagre som kopi',exact:true}).click();
 await trigger.click();await page.getByRole('menuitem',{name:'+ Nytt prosjekt',exact:true}).click();
 await trigger.click();await page.getByRole('menuitem',{name:'🔒 Avslutt prosjekt',exact:true}).click();
 await page.getByRole('button',{name:'Oppdater prosjekt',exact:true}).click();
 await page.getByRole('button',{name:'← Til startside',exact:true}).click();
 await page.getByRole('button',{name:'Logg ut',exact:true}).click();
 eq(await page.evaluate(()=>window.calls),{save:1,copy:1,pdf:5,new:1,exit:1,logout:1,lock:[true]},'all actual header callbacks retained');
 eq(errors,[],'no browser exceptions');
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.showProfile(true));
 const shortcuts=page.getByRole('navigation',{name:'Prosjektverktøy på mobil',exact:true});
 await shortcuts.getByRole('button',{name:'Sjekklister',exact:true}).click();
 const dialog=page.getByRole('dialog',{name:'Neste kontroll',exact:true});await dialog.waitFor();
 eq(await dialog.isVisible(),true,'real mobile shortcut opens first unfinished list and skips completed one');
 await dialog.getByLabel('Kontrollkommentar').fill('Behold mobilkladden');
 await page.evaluate(()=>{window.dispatchEvent(new Event('blur'));window.dispatchEvent(new Event('focus'));});
 eq(await dialog.getByLabel('Kontrollkommentar').inputValue(),'Behold mobilkladden','focus retains current editor and answers');
 await dialog.getByRole('button',{name:'Lukk',exact:true}).click();
 eq(await page.getByRole('dialog').count(),0,'closing returns to checklist overview');
 await shortcuts.getByRole('button',{name:'Bilder',exact:true}).click();
 await shortcuts.getByRole('button',{name:'Sjekklister',exact:true}).click();await dialog.waitFor();
 eq(await dialog.getByLabel('Kontrollkommentar').inputValue(),'Behold mobilkladden','mobile tab return resumes the same local draft');
 await dialog.getByRole('button',{name:'Lukk',exact:true}).click();
 eq(errors,[],'no browser exceptions after actual mobile checklist flow');
 if(process.env.PROJECT_HEADER_SCREENSHOT){await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:process.env.PROJECT_HEADER_SCREENSHOT,fullPage:true});}
 console.log('Project mobile header browser QA: PASS ('+checks+' assertions) — actual main header, complete labels, profile padding, dropdown and existing callbacks');
} finally {await browser?.close();await new Promise(resolve=>server.close(resolve));fs.rmSync(temp,{recursive:true,force:true});}
