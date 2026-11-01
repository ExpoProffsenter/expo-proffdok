import assert from 'node:assert/strict';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import http from 'node:http';
import {build} from 'vite';import react from '@vitejs/plugin-react';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
let checks=0;const eq=(a,b,message)=>{assert.deepEqual(a,b,message);checks++;};
const cwd=process.cwd(),main=fs.readFileSync('src/main.jsx','utf8');
const leave=main.slice(main.indexOf('    const leaveProjectWorkspace ='),main.indexOf('    const cancelNewProject =')).trim();
const navStart=main.lastIndexOf('        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", { children: tabs.map');
const navigation=main.slice(navStart,main.indexOf('        projectDirty &&',navStart));
assert(navStart>0&&navigation.includes('data-expo-global-nav-source'));
const headerStart=main.lastIndexOf('(0, import_jsx_runtime.jsxs)("div", { className: "head",');
const header=main.slice(headerStart,navStart).trim().replace(/,$/,'');
const brand=main.slice(main.indexOf('  function Brand('),main.indexOf('  function AppInstallGuide('));
// Execute the actual departure function, not a copied approximation.
for(const mutation of ['none','cancel','projectId','tab','userId','companyName','readOnly','revoked','support','event']){
 const events=[],globalTabs=[['prosjekt','Startside'],['prosjektliste','Prosjektliste'],['sales','Befaring/Tilbud']];
 const initial={projectId:'p',tab:'bilder',userId:'u',companyName:'QA',readOnly:false,globalTabIds:globalTabs.map(([id])=>id)};
 const scope={projectId:'p',mobileCreatingProject:false,globalTabs,projectStepContextRef:{current:{...initial}},user:{},authUser:{id:'u'},profile:null,isProjectSupportReadOnly:mutation==='support',supportProjectCompanyName:'QA',supportSelectedCompany:'',document:{title:'QA'},window:{location:{href:'https://example.invalid/?project=p',pathname:'/'},history:{replaceState(){events.push(['url']);}}},setTimeout(){},scrollToMobileTabTarget(){},pauseDirtyTrackingBriefly(){},resetProjectDirty(){},confirmLeaveWithUnsavedChanges:async()=>{if(mutation in initial)scope.projectStepContextRef.current={...initial,[mutation]:'changed'};if(mutation==='revoked')scope.projectStepContextRef.current={...initial,globalTabIds:['prosjekt']};return mutation!=='cancel';}};
 for(const name of new Set(leave.match(/\bset[A-Z]\w+/g)))scope[name]=value=>events.push([name,value]);
 for(const name of new Set(leave.match(/\bempty\w+(?=\()/g)))scope[name]=()=>({});
 const run=new Function('scope',`with(scope){${leave};return leaveProjectWorkspace;}`)(scope);
 await run(mutation==='event'?{type:'click'}:'sales');
 const blocked=['cancel','projectId','tab','userId','companyName','readOnly','revoked'].includes(mutation);
 eq(events.length===0,blocked,'cancelled/stale departure has no side effects: '+mutation);
 if(!blocked){eq(events.findLast(([name])=>name==='setTab')[1],mutation==='support'?'admin':mutation==='event'?'prosjekt':'sales','exact authorized destination '+mutation);eq(events.some(([name])=>name==='setProjectId'),true,'native cleanup runs '+mutation);}
}
// The actual permission-aware price-search opener must leave through the same guard.
const price=fs.readFileSync('src/modules/storeCatalog/storePriceSearchUx.jsx','utf8');
const priceNav=price.slice(price.indexOf('function syncNavButton()'),price.indexOf('function syncMobileButton()'));
const priceClick=priceNav.slice(priceNav.indexOf('  button.addEventListener('),priceNav.indexOf('  salesButton.insertAdjacentElement'));
for(const scenario of ['global','cancel','accepted','stale-project','stale-destination']){
 let listener,opened=0,left=0;
 const button={addEventListener:(name,callback)=>listener=callback},nav=scenario==='global'?{}:{expoLeaveProjectWorkspace:async id=>{eq(id,'prosjekt','price search uses native global exit');left++;return scenario!=='cancel';}};
 new Function('button','nav','openPriceSearch','window','document','activeNativeLabel',priceClick)(button,nav,()=>opened++,{requestAnimationFrame:callback=>callback()},{querySelector:()=>scenario==='stale-project'?{}:null},()=>scenario==='stale-destination'?'HR':'Startside');
 await listener({preventDefault(){}});
 eq(opened,['global','accepted'].includes(scenario)?1:0,'price search respects cancel/stale intent: '+scenario);
 eq(left,scenario==='global'?0:1,'price search uses one departure: '+scenario);
}
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'project-common-frame-'));let server,browser;
try{
fs.writeFileSync(path.join(temp,'entry.jsx'),`
import React,{useState,useRef} from '${cwd}/node_modules/react/index.js';
import {createRoot} from '${cwd}/node_modules/react-dom/client.js';import * as jsxRuntime from '${cwd}/node_modules/react/jsx-runtime.js';
import Chrome,{ProjectHeaderActions} from '${cwd}/src/modules/project/ProjectWorkspaceChrome.jsx';
import WorkspaceViewMode from '${cwd}/src/modules/app/WorkspaceViewMode.jsx';
import {createGlobalAppTabs,createProjectWorkspaceTabs} from '${cwd}/src/modules/project/projectNavigationTabs.mjs';
import {installDesktopSideMenu} from '${cwd}/src/modules/app/desktopSideMenu.js';
import {installProjectWorkspaceHeaderGuide} from '${cwd}/src/modules/app/projectWorkspaceHeaderGuide.js';
import '${cwd}/src/style.css';import '${cwd}/src/modules/ui/proffdokWorkspace.css';
const renderNav=new Function('scope',${JSON.stringify('with(scope){return ['+navigation+'];}')});
const renderHeader=new Function('scope',${JSON.stringify('with(scope){'+brand+';return '+header+';}')});
const nativeLeave=new Function('scope',${JSON.stringify('with(scope){'+leave+';return leaveProjectWorkspace;}')});
window.calls=[];window.allow=true;
function App(){
 const [projectId,setProjectId]=useState('qa'),[tab,setTab]=useState('prosjekt'),[hr,setHr]=useState(true),[note,setNote]=useState('Min usendte arbeidsmerknad');
 const globalTabs=createGlobalAppTabs({canUseHr:hr,canUseBolig:true,canUseKshms:true,personalPage:true,canUseProCatalogOrders:true}),tabs=projectId?createProjectWorkspaceTabs({canUseKshms:true}):globalTabs;
 const context=useRef(null);context.current={projectId,tab,userId:'u',companyName:'QA',readOnly:false,globalTabIds:globalTabs.map(([id])=>id)};
 const project={projectName:'QA – Badrenovering i arbeid',customer:'Syntetisk kunde',address:'Testveien 42',postnr:'0001',city:'Oslo'};
 const values={String,Boolean,Number,Object,Array,URL,JSON,Math,Date,import_jsx_runtime:jsxRuntime,ProjectHeaderActions,WorkspaceViewMode,globalTabs,tabs,tab,projectId,projectStepContextRef:context,mobileCreatingProject:false,hasActiveProjectWorkspace:!!projectId,isProjectSupportReadOnly:false,profile:null,user:{name:'QA'},authUser:{id:'u',email:'qa@example.invalid'},company:{companyName:'QA',logoUrl:'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="210" height="50"><text x="2" y="35" fill="%2300aab5" font-size="24">EXPO | Proffsenter</text></svg>'},name:'QA',project,currentStatus:{label:'Pågår',icon:'🟡'},isSimpleOrderProject:()=>false,projectDirty:false,isProjectLocked:false,confirmLeaveWithUnsavedChanges:async()=>window.allow,setProjectId,setTab,document,window,setTimeout(){},scrollToMobileTabTarget(){},pauseDirtyTrackingBriefly(){},resetProjectDirty(){}};
 const scope=new Proxy(values,{has:()=>true,get:(target,key)=>key===Symbol.unscopables?undefined:key in target?target[key]:typeof key==='string'&&key.startsWith('empty')?()=>({}):(...args)=>window.calls.push([key,...args])});
 const leaveProjectWorkspace=nativeLeave(scope);values.leaveProjectWorkspace=leaveProjectWorkspace;values.goToTab=id=>{window.calls.push(['tab',id]);setTab(id);};
 window.setHr=setHr;window.reopen=()=>{setProjectId('qa');setTab('prosjekt');};
 return <div data-expo-app-shell="true" data-expo-project-shell={projectId?'1':undefined} data-expo-project-global-shell={projectId?'1':undefined}>
  <header>{renderHeader(scope)}{renderNav(scope)}</header>
  {projectId&&<Chrome tabs={tabs} appTabs={globalTabs} onAppNavigate={leaveProjectWorkspace} activeTab={tab} project={project} saved status={{label:'Pågår',icon:'🟡'}} deviations={4} unread={2} onNavigate={values.goToTab} onStatus={()=>{}} onExit={()=>leaveProjectWorkspace('prosjektliste')} onContinue={()=>{}}/>}
  <main><h2>{projectId?'Prosjektoversikt':globalTabs.find(([id])=>id===tab)?.[1]}</h2><p>Syntetisk testdata. Dette er en test av faktiske komponenter, ikke en innlogget kundesak.</p>{projectId&&<label>Arbeidsmerknad<textarea value={note} onChange={event=>setNote(event.target.value)}/></label>}</main>
 </div>;
}
createRoot(document.getElementById('root')).render(<App/>);installDesktopSideMenu();installProjectWorkspaceHeaderGuide();
`);
const bundle=await build({root:cwd,configFile:false,logLevel:'silent',resolve:{alias:{'react/jsx-runtime':path.join(cwd,'node_modules/react/jsx-runtime.js')}},plugins:[react()],build:{write:false,minify:false,cssCodeSplit:false,rollupOptions:{input:path.join(temp,'entry.jsx'),output:{inlineDynamicImports:true}}}});
const js=bundle.output.find(x=>x.type==='chunk').code,css=bundle.output.filter(x=>x.fileName.endsWith('.css')).map(x=>x.source).join('\n');
server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html;charset=utf-8');res.end(`<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style><div id="root"></div><script type="module">${js.replaceAll('</script','<\\/script')}</script>`);});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
for(const [width,height] of [[1920,1080],[1363,936],[1181,800],[768,900],[390,844],[320,480]]){
 const page=await browser.newPage({viewport:{width,height}}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(6000);await page.goto('http://127.0.0.1:'+server.address().port);
 await page.getByRole('heading',{name:'QA – Badrenovering i arbeid',exact:true}).waitFor();
 const back=page.locator('.project-workspace-back').getByRole('button',{name:'Tilbake',exact:true});eq(await back.isVisible(),true,'same Back button '+width);
 const b=await back.boundingBox(),h=await page.locator('.project-workspace-heading').boundingBox();eq(b.y+b.height<=h.y+1,true,'Back precedes project title '+width);
 eq(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'no horizontal page overflow '+width);
 if(width>=1181){
  const global=page.locator('#expo-desktop-primary-nav');await global.waitFor();
  eq(await global.getByRole('button',{name:'Startside',exact:true}).isVisible(),true,'global menu remains in project '+width);
  const allAreas=page.locator('.expoDesktopMenuToggle');eq(await allAreas.isVisible(),true,'Alle områder remains visible '+width);await allAreas.click();await page.locator('.expoDesktopMenuDrawer.isOpen').waitFor();eq(await page.locator('.expoDesktopDrawerNav').getByRole('button',{name:'Firmaprofil',exact:true}).isVisible(),true,'remaining app areas are accessible '+width);await page.locator('.expoDesktopDrawerClose').click();
  eq(await global.getByRole('button',{name:'Prosjektliste',exact:true}).getAttribute('aria-current'),'page','project list is selected global area '+width);
  eq(await global.evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(16, 33, 43)','same dark menu as Sales '+width);
  await page.evaluate(()=>window.allow=false);await global.getByRole('button',{name:'Befaring/Tilbud',exact:true}).click();eq(await back.isVisible(),true,'cancel global departure keeps project '+width);
  eq(await page.getByRole('textbox',{name:'Arbeidsmerknad'}).inputValue(),'Min usendte arbeidsmerknad','cancel preserves draft '+width);
  await page.evaluate(()=>window.setHr(false));await page.waitForFunction(()=>![...document.querySelectorAll('#expo-desktop-primary-nav button')].some(e=>e.textContent==='HR'));eq(await global.getByRole('button',{name:'HR',exact:true}).count(),0,'revoked destination disappears '+width);
  if(process.env.PROJECT_FRAME_EVIDENCE&&width===1363){fs.mkdirSync(process.env.PROJECT_FRAME_EVIDENCE,{recursive:true});await page.screenshot({path:path.join(process.env.PROJECT_FRAME_EVIDENCE,'project-common-frame-desktop.jpg'),type:'jpeg',quality:70});}
  await page.evaluate(()=>window.allow=true);await global.getByRole('button',{name:'Befaring/Tilbud',exact:true}).click();await page.waitForFunction(()=>!document.querySelector('[data-expo-project-shell]'));
  eq(await page.locator('main h2').textContent(),'Befaring/Tilbud','global choice uses guarded real cleanup '+width);
  eq(await global.evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(16, 33, 43)','global/project menu have identical color '+width);
 }else{
  const all=page.locator('.project-workspace-app-menu');await all.click();const menu=page.getByRole('dialog',{name:'Prosjektmeny',exact:true});await menu.waitFor();
  eq(await menu.locator('.project-global-mobile').getByRole('button',{name:'Befaring/Tilbud',exact:true}).isVisible(),true,'mobile has global areas '+width);
  await page.evaluate(()=>window.allow=false);await menu.locator('.project-global-mobile').getByRole('button',{name:'Befaring/Tilbud',exact:true}).click();eq(await menu.isVisible(),true,'cancel keeps mobile menu/project '+width);
  await menu.press('Escape');await menu.waitFor({state:'hidden'});eq(await back.isVisible(),true,'menu close retains return '+width);
  if(process.env.PROJECT_FRAME_EVIDENCE&&width===390){await page.screenshot({path:path.join(process.env.PROJECT_FRAME_EVIDENCE,'project-common-frame-mobile.jpg'),type:'jpeg',quality:70});}
 }
 await page.evaluate(()=>{window.allow=true;window.reopen();});await back.waitFor();await back.click();await page.waitForFunction(()=>!document.querySelector('[data-expo-project-shell]'));eq(await page.locator('main h2').textContent(),'Prosjektliste','Back uses original list destination '+width);
 eq(errors,[],'no React/browser errors '+width);await page.close();
}
console.log(`Project common frame: ${checks} assertions PASS — real main navigation/departure, dark app menu, cancelled/stale/revoked exit, native Back and six screen sizes`);
}finally{await browser?.close();if(server)await new Promise(resolve=>server.close(resolve));fs.rmSync(temp,{recursive:true,force:true});}
