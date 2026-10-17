import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const cwd=process.cwd(),temp=fs.mkdtempSync(path.join(os.tmpdir(),'project-workspace-'));
let browser,checks=0;
const eq=(a,b,label)=>{assert.deepEqual(a,b,label);checks++;};
const main=fs.readFileSync('src/main.jsx','utf8');
const navLine=main.split('\n').find(line=>line.includes('("nav", { children: tabs.map'));
const navExpression=navLine.slice(navLine.indexOf('(0, import_jsx_runtime.jsx)')).replace(/,$/,'');
const statusStart=main.indexOf('        projectId && (0, import_jsx_runtime.jsxs)(ProjectStatusDialog,');
const statusEnd=main.indexOf('        tab === "prosjekt" && projectId && renderProjectOverviewPanel',statusStart);
assert(statusStart>=0&&statusEnd>statusStart);
const statusExpression=main.slice(statusStart,statusEnd).trim().replace(/,$/,'');
const scrollStart=main.indexOf('    const scrollToMobileTabTarget = (id) => {');
const scrollEnd=main.indexOf('\n    const openMobileStatus',scrollStart);
const scrollFunction=main.slice(scrollStart,scrollEnd).replace('const scrollToMobileTabTarget =','return');
fs.writeFileSync(path.join(temp,'entry.jsx'),`
import React,{useState} from '${cwd}/node_modules/react/index.js';
import {createRoot} from '${cwd}/node_modules/react-dom/client.js';
import * as jsxRuntime from '${cwd}/node_modules/react/jsx-runtime.js';
import Chrome,{ProjectHeaderActions,ProjectStatusDialog} from '${cwd}/src/modules/project/ProjectWorkspaceChrome.jsx';
import {createProjectWorkspaceTabs} from '${cwd}/src/modules/project/projectNavigationTabs.mjs';
import {installDesktopSideMenu} from '${cwd}/src/modules/app/desktopSideMenu.js';
import {installProjectWorkspaceHeaderGuide} from '${cwd}/src/modules/app/projectWorkspaceHeaderGuide.js';
import {installProjectWorkflowUx} from '${cwd}/src/modules/project/projectWorkflowUx.js';
import '${cwd}/src/style.css';
import {APP_RUNTIME_STYLES} from '${cwd}/src/modules/app/appRuntimeStyles.js';
document.head.insertAdjacentHTML('beforeend','<style>'+APP_RUNTIME_STYLES+'</style>');
const sourceNav=new Function('import_jsx_runtime','tabs','tab','goToTab',${JSON.stringify('return '+navExpression)});
const scrollToTarget=new Function(${JSON.stringify(scrollFunction)})();
const actualStatus=new Function('scope',${JSON.stringify('with(scope){return '+statusExpression+';}')});
const Section=({title,children,className})=><section className={className}><h2>{title}</h2>{children}</section>;
const Select=({label,value,onChange,options,disabled})=><label>{label}<select aria-label={label} value={value} disabled={disabled} onChange={e=>onChange(e.target.value)}>{options.map(v=><option key={v}>{v}</option>)}</select></label>;
function App(){
 const [kind,setKind]=useState('wetroom'),[tab,setTab]=useState('prosjekt'),[draft,setDraft]=useState(''),[statusOpen,setStatusOpen]=useState(false),[project,setProject]=useState({projectName:'Prosjekt ved Elveparken',customer:'QA Kunde',address:'Testveien 1',workflowStatus:'Pågår'});
 window.changeKind=kind=>{setKind(kind);setTab('prosjekt');setStatusOpen(false);};
 const order=kind==='order',readOnly=kind==='support',saved=kind!=='new';
 const tabs=createProjectWorkspaceTabs({isNewProject:!saved,hasSalesOrigin:kind!=='direct'&&saved,openDeviationCount:2,unreadForAdmin:3,canUseKshms:true});
 const goToTab=async id=>{window.navCalls.push(id);if(window.cancelNavigation)return false;setTab(id);setStatusOpen(false);scrollToTarget(id);return true;};
 const scope={projectId:saved?'qa':null,ProjectStatusDialog,import_jsx_runtime:jsxRuntime,Section,Select,import_lucide_react:{BadgeCheck:()=>null,ClipboardCheck:()=>null},mobileStatusOpen:statusOpen,setMobileStatusOpen:setStatusOpen,project,setProject,tab,currentStatus:{icon:'🟡',label:'Pågår',tone:'progress'},projectGuideStats:{openDeviationCount:2,completionPercent:88,productCount:2,photoCount:3,checklistDone:1,checklistMissing:3,hasOvertagelse:false},unreadForAdmin:3,statusStyle:()=>({}),openActiveDeviations:()=>goToTab('avvik'),isProjectLocked:false,isProjectSupportReadOnly:readOnly,workflowStatusOptions:['Pågår','Avventer'],suggestedWorkflowStatus:'Avventer',persistedProjectHasOvertagelse:false,overtagelse:{},overtagelseHasDraftContent:()=>true,overtagelseIsSignedByBoth:()=>false,projectHasOvertagelse:()=>false,totalChatCount:5,customerChatCount:2,latestChatMessage:null,projectGuideItems:[{id:'photo',label:'Kontroller bilder',tone:'missing'}],openProjectGuideItem:()=>goToTab('bilder')};
 return <div data-expo-project-shell="1"><header><div className="head"><div>ProffDok</div><h1>Expo ProffDok</h1><button onClick={()=>window.exits++}>← Til startside</button><ProjectHeaderActions dirty={!!draft} saved={saved} readOnly={readOnly} simpleOrder={order} locked={kind==='locked'} onNew={()=>window.newProjects++} onSave={()=>window.saves++} onCopy={()=>window.copies++} onPdf={()=>window.pdfs++} onLock={value=>window.locks.push(value)}/></div>{sourceNav(jsxRuntime,tabs,tab,goToTab)}</header>
 <Chrome tabs={tabs} activeTab={tab} project={project} saved={saved} simpleOrder={order} status={scope.currentStatus} deviations={2} unread={3} onNavigate={goToTab} onStatus={()=>setStatusOpen(true)} onExit={()=>window.exits++}/>
 <main>{actualStatus(scope)}<h2>Arbeidsinnhold: {tab}</h2><label>Kladd<textarea aria-label="Kladd" value={draft} onChange={e=>setDraft(e.target.value)}/></label></main></div>;
}
window.navCalls=[];window.newProjects=0;window.saves=0;window.copies=0;window.pdfs=0;window.exits=0;window.locks=[];window.cancelNavigation=false;
createRoot(document.getElementById('app')).render(<App/>);
installDesktopSideMenu();installProjectWorkspaceHeaderGuide();installProjectWorkflowUx();
`);
const result=await build({root:cwd,configFile:false,logLevel:'silent',resolve:{alias:{'react/jsx-runtime':path.join(cwd,'node_modules/react/jsx-runtime.js')}},plugins:[react()],build:{write:false,minify:false,cssCodeSplit:false,rollupOptions:{input:path.join(temp,'entry.jsx'),output:{inlineDynamicImports:true}}}});
const js=result.output.find(x=>x.type==='chunk').code,css=result.output.filter(x=>x.fileName.endsWith('.css')).map(x=>x.source).join('\n');
const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html;charset=utf-8');res.end(`<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style><div id="app"></div><script type="module">${js.replaceAll('</script','<\\/script')}</script>`);});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1363,height:1000}}),errors=[];page.setDefaultTimeout(4000);page.on('pageerror',e=>{errors.push(e.message);console.error('PAGE ERROR',e.message);});
 await page.goto('http://127.0.0.1:'+server.address().port+'/?progressTest=safe');
 const button=name=>page.getByRole('button',{name,exact:true});
 await page.locator('.project-workspace').waitFor();
 const nav=page.locator('.project-workspace-navigation');
 eq(await page.locator('#expo-project-workspace-guide').count(),0,'legacy duplicate guide removed');
 eq(await page.locator('.expoDesktopMenuToggle').isVisible(),false,'project drawer not duplicated');
 eq(await nav.getByRole('button',{name:'Oversikt',exact:true}).count(),1,'overview exists once');
 eq(await nav.getByRole('button',{name:'Bilder',exact:true}).count(),0,'other phase hidden');
 await page.getByLabel('Kladd',{exact:true}).fill('Arbeidet mitt');
 await page.evaluate(()=>window.scrollTo(0,300));
 await nav.getByRole('button',{name:'Gjennomføring',exact:true}).click();
 await nav.getByRole('button',{name:'Bilder',exact:true}).click();
 eq(await page.getByLabel('Kladd',{exact:true}).inputValue(),'Arbeidet mitt','draft preserved during native navigation');
 eq(await page.evaluate(()=>window.navCalls.at(-1)),'bilder','real tab ID');
 await page.waitForFunction(()=>scrollY===0);eq(await page.evaluate(()=>scrollY),0,'project context remains visible after navigation');
 for(const width of [1363,768,390,320]){
  await page.setViewportSize({width,height:1000});
  eq(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'fits '+width);
  eq((await page.locator('main>h2').boundingBox()).y<800,true,'content reachable '+width);
  if(width<1181){
   await button(/Prosjektmeny/).click();
   const dialog=page.getByRole('dialog',{name:'Prosjektmeny',exact:true});await dialog.waitFor();
   eq(await dialog.getByRole('button',{name:'Avvik/SJA/RUH (2)',exact:true}).count(),1,'dynamic deviation count '+width);
   eq(await dialog.getByRole('button',{name:'Chat (3 ulest)',exact:true}).count(),1,'unread label '+width);
   if(width<=700)eq(Math.round((await dialog.boundingBox()).height),1000,'full screen mobile '+width);
   await dialog.press('Escape');
   eq(await page.getByLabel('Kladd',{exact:true}).inputValue(),'Arbeidet mitt','close preserves draft '+width);
  }
  await button('Status og mangler').click();
  const status=page.getByRole('dialog',{name:'Status og mangler',exact:true});await status.waitFor();
  eq(await status.getByLabel('Arbeidsstatus',{exact:true}).isVisible(),true,'original editable status '+width);
  await status.getByText('sjekkliste · 1 av 4',{exact:true}).waitFor();
  eq(await status.getByText('sjekkliste · 1 av 4',{exact:true}).isVisible(),true,'original checklist calculation '+width);
  eq(await status.getByText('Kontroller bilder',{exact:true}).isVisible(),true,'guidance not collapsed '+width);
  await status.press('Escape');
 }
 await page.setViewportSize({width:390,height:1000});
 await button(/Prosjektmeny/).click();
 await page.evaluate(()=>window.cancelNavigation=true);
 await page.getByRole('dialog').getByRole('button',{name:'Prosjektbeskrivelse',exact:true}).click();
 eq(await page.getByRole('dialog').count(),1,'cancel navigation keeps menu open');
 eq(await page.getByRole('heading',{name:'Arbeidsinnhold: bilder'}).count(),1,'cancel preserves current tab');
 await page.evaluate(()=>{window.cancelNavigation=false;window.dispatchEvent(new Event('blur'));window.dispatchEvent(new Event('focus'));});
 eq(await page.getByRole('dialog').count(),1,'snipping focus keeps same dialog');
 await page.getByRole('dialog').getByRole('button',{name:'Fremdrift',exact:true}).click();
 eq(await page.getByRole('dialog').count(),0,'successful navigation closes menu');
 await button('Status og mangler').click();await page.getByRole('dialog').getByRole('button',{name:'Åpne',exact:true}).click();
 eq(await page.getByRole('dialog').count(),0,'status shortcut closes dialog via existing navigation');
 eq(await page.evaluate(()=>window.navCalls.at(-1)),'bilder','status callback retained');
 await button('Flere handlinger').click();await page.getByRole('dialog').getByRole('button',{name:'Lagre som kopi',exact:true}).click();
 eq(await page.evaluate(()=>window.copies),1,'copy callback once');
 await button('Flere handlinger').click();await page.getByRole('dialog').getByRole('button',{name:'+ Nytt prosjekt',exact:true}).click();eq(await page.evaluate(()=>window.newProjects),1,'new project callback retained');
 await button('Flere handlinger').click();await page.getByRole('dialog').getByRole('button',{name:'Last ned PDF',exact:true}).click();
 eq(await page.evaluate(()=>window.pdfs),1,'PDF callback once');
 await button('Flere handlinger').click();await page.getByRole('dialog').getByRole('button',{name:'🔒 Avslutt prosjekt',exact:true}).click();
 eq(await page.evaluate(()=>window.locks),[true],'lock callback retained');
 await button('● Lagre endringer').click();eq(await page.evaluate(()=>window.saves),1,'save callback retained');
 for(const kind of ['order','direct','new','support','locked']){
  await page.evaluate(kind=>window.changeKind(kind),kind);
  await button(kind==='order'?/Ordremeny/:/Prosjektmeny/).click();
  const dialog=page.getByRole('dialog');
  if(kind==='order'){
   for(const label of ['Ordreoversikt','Tilbudsgrunnlag','Ordrebeskrivelse','Fremdrift','Produkter / FDV','Bilder','Sjekklister','UE-tilgang','Sluttdokumentasjon'])eq(await dialog.getByRole('button',{name:label,exact:true}).count(),1,'order retains '+label);
   for(const label of ['Prosjektering','Overflater og innredning','Chat (3 ulest)','Overtagelse','Garanti'])eq(await dialog.getByRole('button',{name:label,exact:true}).count(),0,'order hides '+label);
  }
  if(kind==='direct'||kind==='new')eq(await dialog.getByRole('button',{name:'Salgsgrunnlag',exact:true}).count(),0,'no invented sales source '+kind);
  await dialog.press('Escape');
  if(kind==='support'){
   eq(await button('● Lagre endringer').count(),0,'support cannot save');
   await button('Status og mangler').click();eq(await page.getByRole('dialog').getByLabel('Arbeidsstatus',{exact:true}).isEnabled(),false,'support status remains read only');await page.getByRole('dialog').press('Escape');
   await button('Flere handlinger').click();eq(await page.getByRole('dialog').getByRole('button',{name:'Lagre som kopi',exact:true}).count(),0,'support cannot copy');eq(await page.getByRole('dialog').getByRole('button',{name:'🔒 Avslutt prosjekt',exact:true}).count(),0,'support cannot lock');await page.getByRole('dialog').press('Escape');
  }
  if(kind==='locked'){await button('Flere handlinger').click();await page.getByRole('dialog').getByRole('button',{name:'🔓 Lås opp prosjekt',exact:true}).click();eq(await page.evaluate(()=>window.locks),[true,false],'unlock callback retained');}
 }
 eq(errors,[],'no React or DOM exceptions');
 console.log('Project workspace browser QA: PASS ('+checks+' assertions) — full-screen dialogs, drafts, native callbacks, cancellation, responsive sizes, simple/direct/new projects and read-only support');
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));fs.rmSync(temp,{recursive:true,force:true});}
