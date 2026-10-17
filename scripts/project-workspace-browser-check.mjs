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
import {continueAfterProjectSave} from '${cwd}/src/modules/project/projectStepContinue.mjs';
import {createProjectOverviewTools} from '${cwd}/src/modules/project/projectOverviewTools.js';
import Chrome,{ProjectHeaderActions,ProjectStatusDialog,ProjectWorkspaceFooter} from '${cwd}/src/modules/project/ProjectWorkspaceChrome.jsx';
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
const tools=createProjectOverviewTools({Section,Grid:({children})=><div>{children}</div>,InfoCard:()=>null,CollapsibleBlock:({children})=><div>{children}</div>,Textarea:()=>null,hasValue:Boolean});
function App(){
 const [kind,setKind]=useState('wetroom'),[tab,setTab]=useState('prosjekt'),[draft,setDraft]=useState(''),[statusOpen,setStatusOpen]=useState(false),[continuing,setContinuing]=useState(false),[continueNotice,setContinueNotice]=useState(''),[project,setProject]=useState({projectName:'Prosjekt ved Elveparken',customer:'QA Kunde',address:'Testveien 1',postnr:'0001',city:'Oslo',customerEmail:'qa@example.invalid',customerPhone:'90000000',responsible:'QA Leder',salesOrigin:{acceptedTotal:10000},workflowStatus:'Pågår'});
 window.changeKind=kind=>{setKind(kind);setTab('prosjekt');setStatusOpen(false);};
 const order=kind==='order',readOnly=kind==='support',saved=kind!=='new';
 const [mobile,setMobile]=useState(window.innerWidth<=700);React.useEffect(()=>{const resize=()=>setMobile(window.innerWidth<=700);window.addEventListener('resize',resize);return()=>window.removeEventListener('resize',resize);},[]);
 const profileControl=<div id="expo-work-profile-switcher"><div className="workProfileControl"><button className="workProfileButton"><span><small>Representerer</small><b>Et firma med et langt navn</b></span></button></div></div>;
 const tabs=createProjectWorkspaceTabs({isNewProject:!saved,hasSalesOrigin:kind!=='direct'&&saved,openDeviationCount:2,unreadForAdmin:3,canUseKshms:true});
 const goToTab=async id=>{window.navCalls.push(id);if(window.cancelNavigation)return false;setTab(id);setStatusOpen(false);scrollToTarget(id);return true;};
 const continueNext=async id=>{setContinuing(true);setContinueNotice('');try{return await continueAfterProjectSave({save:async()=>{if(window.holdSave)await new Promise(resolve=>window.finishSave=resolve);return window.saveWorks?{ok:true,projectId:'qa'}:undefined;},navigate:()=>goToTab(id),isCurrent:()=>true,events:window,onFailure:()=>setContinueNotice('Lagringen er ikke bekreftet.')});}finally{setContinuing(false);}};
 const scope={projectId:saved?'qa':null,ProjectStatusDialog,import_jsx_runtime:jsxRuntime,Section,Select,import_lucide_react:{BadgeCheck:()=>null,ClipboardCheck:()=>null},mobileStatusOpen:statusOpen,setMobileStatusOpen:setStatusOpen,project,setProject,tab,currentStatus:{icon:'🟡',label:'Pågår',tone:'progress'},projectGuideStats:{openDeviationCount:2,completionPercent:88,productCount:2,photoCount:3,checklistDone:1,checklistMissing:3,hasOvertagelse:false},unreadForAdmin:3,statusStyle:()=>({}),openActiveDeviations:()=>goToTab('avvik'),isProjectLocked:false,isProjectSupportReadOnly:readOnly,workflowStatusOptions:['Pågår','Avventer'],suggestedWorkflowStatus:'Avventer',persistedProjectHasOvertagelse:false,overtagelse:{},overtagelseHasDraftContent:()=>true,overtagelseIsSignedByBoth:()=>false,projectHasOvertagelse:()=>false,totalChatCount:5,customerChatCount:2,latestChatMessage:null,projectGuideItems:[{id:'photo',label:'Kontroller bilder',tone:'missing'}],openProjectGuideItem:()=>goToTab('bilder')};
 return <div data-expo-project-shell="1"><header><div className="head"><div style={{width:260,height:80}}>Expo Proffsenter</div><div><h1>Expo ProffDok</h1></div><button onClick={()=>window.exits++}>← Til startside</button><ProjectHeaderActions dirty={!!draft} saved={saved} readOnly={readOnly} simpleOrder={order} locked={kind==='locked'} onNew={()=>window.newProjects++} onSave={()=>window.saves++} onCopy={()=>window.copies++} onPdf={()=>window.pdfs++} onLock={value=>window.locks.push(value)}/>{!mobile&&profileControl}</div>{mobile&&profileControl}{sourceNav(jsxRuntime,tabs,tab,goToTab)}</header>
 <Chrome tabs={tabs} activeTab={tab} project={project} saved={saved} simpleOrder={order} status={scope.currentStatus} deviations={2} unread={3} onContinue={continueNext} continuing={continuing} continueNotice={continueNotice} readOnly={readOnly||kind==='locked'} onNavigate={goToTab} onStatus={()=>setStatusOpen(true)} onExit={()=>window.exits++}/>
 <main>{actualStatus(scope)}{tab==='prosjekt'&&tools.renderProjectOverviewPanel({project:{...project,workflowType:order?'simple_order':'wetroom'},goToTab,leaveProjectWorkspace:()=>window.exits++})}<h2>Arbeidsinnhold: {tab}</h2><label>Kladd<textarea aria-label="Kladd" value={draft} onChange={e=>setDraft(e.target.value)}/></label></main><ProjectWorkspaceFooter tabs={tabs} activeTab={tab} simpleOrder={order} onNavigate={goToTab} onContinue={continueNext} continuing={continuing} readOnly={readOnly||kind==='locked'}/><div className="bottomPrevNext"><button>Old previous</button><button>Old next</button></div></div>;
}
window.saveWorks=true;window.holdSave=false;window.navCalls=[];window.newProjects=0;window.saves=0;window.copies=0;window.pdfs=0;window.exits=0;window.locks=[];window.cancelNavigation=false;
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
 // Wait for the fixture's responsive React commit, not a fixed sleep. Otherwise
 // geometry can still include the desktop profile host after changing viewport.
 const resize=async width=>{
  await page.setViewportSize({width,height:1000});
  await page.waitForFunction(()=>{const host=document.getElementById('expo-work-profile-switcher');return Boolean(host)&&(innerWidth<=700)===(host.parentElement.tagName==='HEADER');});
 };
 await page.locator('.project-workspace').waitFor();
 const nav=page.locator('.project-workspace-navigation');
 eq(await page.locator('#expo-project-workspace-guide').count(),0,'legacy duplicate guide removed');
 eq(await page.locator('.expoDesktopMenuToggle').isVisible(),false,'project drawer not duplicated');
 eq(await nav.getByRole('button',{name:'Oversikt',exact:true}).count(),1,'overview exists once');
 eq(await nav.getByRole('button',{name:'Bilder',exact:true}).count(),1,'all phases visible');
 eq(await page.locator('.bottomPrevNext').isVisible(),false,'legacy flow is not a second user route');
 const cards=await nav.locator('.project-phase-card').evaluateAll(els=>els.map(e=>{const r=e.getBoundingClientRect();return {top:r.top,width:r.width,height:r.height};}));
 eq(cards.length,3,'three aligned phase cards');eq(Math.max(...cards.map(c=>c.top))-Math.min(...cards.map(c=>c.top))<1,true,'phase cards share top edge');eq(Math.max(...cards.map(c=>c.width))-Math.min(...cards.map(c=>c.width))<1,true,'phase cards have equal widths');eq(Math.max(...cards.map(c=>c.height))-Math.min(...cards.map(c=>c.height))<1,true,'phase cards share bottom edge');
 eq((await page.locator('.head').boundingBox()).height<=80,true,'desktop app header stays in one compact row');
 eq((await page.locator('.project-workspace').boundingBox()).height<560,true,'project context and requested step guide stay compact');
 eq(await page.getByText('Prosjekt ved Elveparken',{exact:true}).count(),1,'project name shown once');
 eq(await page.getByText('QA Kunde · Testveien 1 0001 Oslo',{exact:true}).count(),1,'full customer address stays in heading');
 eq(await page.locator('.project-contact-overview .guideCard').count(),4,'overview prioritizes four contact/financial fields');
 eq(await page.locator('.project-contact-overview').getByText(/12\s500\skr/).count(),1,'accepted sum retains VAT');
 for(const width of [1363,768,390,320]){
  await resize(width);
  eq(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'contact overview fits '+width);
  eq(await page.locator('.project-contact-overview').getByText('qa@example.invalid',{exact:true}).isVisible(),true,'contact email retained '+width);
 }
 await resize(1363);
 eq(await nav.getByRole('group',{name:'Oppstart',exact:true}).locator('button').allTextContents().then(labels=>labels.map(text=>text.replace(/^[1-5]/,'').replace('Ved behov','').replace('Historikk','').trim())),['Oversikt','Deltakere og tilganger','Prosjektbeskrivelse','Avtalegrunnlag','Prosjektering','Fremdrift','Salgsgrunnlag'],'contacts and portal access precede work description; history is separate');
 eq(await page.getByRole('region',{name:'Anbefalt neste steg'}).getByText('Du er her: Oversikt',{exact:true}).isVisible(),true,'current setup position explicit');
 await page.getByRole('region',{name:'Anbefalt neste steg'}).getByRole('button',{name:'Lagre og fortsett →',exact:true}).click();
 await page.getByText('Du er her: Deltakere og tilganger',{exact:true}).waitFor();
 eq(await page.evaluate(()=>window.navCalls.at(-1)),'tilgang','visible continue button uses next setup step');
 await nav.getByRole('button',{name:'Prosjektbeskrivelse',exact:true}).click();
 await page.evaluate(()=>window.saveWorks=false);await page.getByRole('region',{name:'Anbefalt neste steg'}).getByRole('button',{name:'Lagre og fortsett →',exact:true}).click();
 await page.getByRole('region',{name:'Anbefalt neste steg'}).getByText('Lagringen er ikke bekreftet.',{exact:true}).waitFor();
 eq(await page.evaluate(()=>window.navCalls.at(-1)),'prosjektinfo','failed save stays at same step');
 await page.evaluate(()=>{window.saveWorks=true;window.holdSave=true;});await page.getByRole('region',{name:'Anbefalt neste steg'}).getByRole('button',{name:'Lagre og fortsett →',exact:true}).click();
 eq(await page.getByRole('region',{name:'Anbefalt neste steg'}).getByRole('button',{name:'Lagrer …',exact:true}).isEnabled(),false,'saving button blocks duplicate clicks');
 await nav.getByRole('button',{name:'Oversikt',exact:true}).click();
 await page.evaluate(()=>{window.holdSave=false;window.finishSave();});
 await page.getByRole('region',{name:'Anbefalt neste steg'}).getByRole('button',{name:'Lagre og fortsett →',exact:true}).waitFor();
 eq(await page.evaluate(()=>window.navCalls.at(-1)),'prosjekt','delayed save never overrides explicit tab choice');

 await nav.getByRole('button',{name:'Garanti',exact:true}).click();
 eq(await page.evaluate(()=>window.navCalls.at(-1)),'garanti','warranty remains reachable through explicit phase');
 await nav.getByRole('button',{name:'Oversikt',exact:true}).click();

 for(const label of ['Fremdrift','Deltakere og tilganger','Sjekklister','Bilder','Garanti']){
  await nav.getByRole('button',{name:label,exact:true}).click();
  const top=page.getByRole('region',{name:'Anbefalt neste steg'}),bottom=page.getByRole('navigation',{name:'Neste og forrige prosjektsteg'});
  eq(await top.locator('.project-step-next').innerText(),await bottom.locator('.project-step-next').innerText(),'top/footer share target and save semantics for '+label);
 }
 await nav.getByRole('button',{name:'Fremdrift',exact:true}).click();
 eq(await page.getByRole('region',{name:'Anbefalt neste steg'}).getByRole('button',{name:'Gå til Sjekklister →',exact:true}).count(),1,'planner never claims a generic save');
 await page.getByRole('navigation',{name:'Neste og forrige prosjektsteg'}).getByRole('button',{name:'Gå til Sjekklister →',exact:true}).click();
 eq(await page.evaluate(()=>window.navCalls.at(-1)),'sjekklister','reported footer mismatch fixed');
 await nav.getByRole('button',{name:'Deltakere og tilganger',exact:true}).click();
 eq(await page.getByRole('region',{name:'Anbefalt neste steg'}).getByText(/En kontakt får ikke tilgang automatisk/).isVisible(),true,'contact list does not imply portal access');
 await nav.getByRole('button',{name:'Oversikt',exact:true}).click();
 await page.getByLabel('Kladd',{exact:true}).fill('Arbeidet mitt');
 await page.evaluate(()=>window.scrollTo(0,300));

 await nav.getByRole('button',{name:'Bilder',exact:true}).click();
 eq(await page.getByLabel('Kladd',{exact:true}).inputValue(),'Arbeidet mitt','draft preserved during native navigation');
 eq(await page.evaluate(()=>window.navCalls.at(-1)),'bilder','real tab ID');
 await page.waitForFunction(()=>scrollY===0);eq(await page.evaluate(()=>scrollY),0,'project context remains visible after navigation');
 for(const width of [1363,768,390,320]){
  await resize(width);
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
 await resize(390);
 const fieldBar=page.getByRole('navigation',{name:'Prosjektverktøy på mobil',exact:true});
 await page.evaluate(()=>window.scrollTo(0,300));
 eq(await fieldBar.isVisible(),true,'field bar stays visible after scrolling');
 eq((await fieldBar.boundingBox()).y+(await fieldBar.boundingBox()).height<=1000,true,'field bar fits visible screen');
 await fieldBar.getByRole('button',{name:'Sjekklister',exact:true}).click();
 eq(await page.evaluate(()=>window.navCalls.at(-1)),'sjekklister','field user opens checklists in one click');
 await fieldBar.getByRole('button',{name:'Bilder',exact:true}).click();
 await fieldBar.getByRole('button',{name:'Meny',exact:true}).click();
 await page.getByRole('dialog').press('Escape');
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
 for(const width of [1363,768,390,320]){
  await resize(width);
  const trigger=button('Flere handlinger'),overflow=await page.locator('body').evaluate(e=>e.style.overflow);
  await trigger.click();const actions=page.getByRole('menu',{name:'Flere handlinger',exact:true});await actions.waitFor();
  eq(await page.getByRole('dialog').count(),0,'actions open without modal '+width);
  const menuBox=await actions.boundingBox(),triggerBox=await trigger.boundingBox();
  eq(menuBox.y>=triggerBox.y+triggerBox.height,true,'dropdown sits below trigger '+width);
  eq(menuBox.x>=0&&menuBox.x+menuBox.width<=width,true,'dropdown fits screen '+width);
  eq(await page.locator('body').evaluate(e=>e.style.overflow),overflow,'dropdown does not lock page '+width);
  await actions.press('Escape');eq(await actions.count(),0,'Escape closes dropdown '+width);
  eq(await trigger.evaluate(e=>document.activeElement===e),true,'Escape returns trigger focus '+width);
 }
 await button('Flere handlinger').press('ArrowUp');
 await page.getByRole('menu',{name:'Flere handlinger',exact:true}).waitFor();
 eq(await page.evaluate(()=>document.activeElement.textContent),'🔒 Avslutt prosjekt','ArrowUp opens last action');
 await page.getByRole('menu',{name:'Flere handlinger',exact:true}).press('Escape');
 await button('Flere handlinger').press('ArrowDown');
 const actions=page.getByRole('menu',{name:'Flere handlinger',exact:true});
 await actions.getByRole('menuitem',{name:'Last ned PDF',exact:true}).waitFor();
 await actions.press('End');eq(await page.evaluate(()=>document.activeElement.textContent),'🔒 Avslutt prosjekt','End reaches last action');
 await actions.press('ArrowDown');eq(await page.evaluate(()=>document.activeElement.textContent),'Last ned PDF','keyboard wraps to first action');
 await actions.press('Tab');eq(await actions.count(),0,'Tab closes dropdown');
 await button('Flere handlinger').click();await button('Flere handlinger').click();eq(await actions.count(),0,'trigger toggles dropdown closed');
 await button('Flere handlinger').click();await page.getByRole('heading',{name:'Arbeidsinnhold: bilder',exact:true}).click();eq(await actions.count(),0,'outside click closes dropdown');
 await button('Flere handlinger').click();await page.getByRole('menu',{name:'Flere handlinger',exact:true}).getByRole('menuitem',{name:'Lagre som kopi',exact:true}).click();
 eq(await page.evaluate(()=>window.copies),1,'copy callback once');
 await button('Flere handlinger').click();await page.getByRole('menu',{name:'Flere handlinger',exact:true}).getByRole('menuitem',{name:'+ Nytt prosjekt',exact:true}).click();eq(await page.evaluate(()=>window.newProjects),1,'new project callback retained');
 await button('Flere handlinger').click();await page.getByRole('menu',{name:'Flere handlinger',exact:true}).getByRole('menuitem',{name:'Last ned PDF',exact:true}).click();
 eq(await page.evaluate(()=>window.pdfs),1,'PDF callback once');
 await button('Flere handlinger').click();await page.getByRole('menu',{name:'Flere handlinger',exact:true}).getByRole('menuitem',{name:'🔒 Avslutt prosjekt',exact:true}).click();
 eq(await page.evaluate(()=>window.locks),[true],'lock callback retained');
 await button('● Lagre endringer').click();eq(await page.evaluate(()=>window.saves),1,'save callback retained');
 for(const kind of ['order','direct','new','support','locked']){
  await page.evaluate(kind=>window.changeKind(kind),kind);
  await button(kind==='order'?/Ordremeny/:/Prosjektmeny/).click();
  const dialog=page.getByRole('dialog');
  if(kind==='order'){
   for(const label of ['Ordreoversikt','Tilbudsgrunnlag','Ordrebeskrivelse','Fremdrift','Produkter / FDV','Bilder','Sjekklister','Deltakere og UE-tilgang','Sluttdokumentasjon'])eq(await dialog.getByRole('button',{name:label,exact:true}).count(),1,'order retains '+label);
   for(const label of ['Prosjektering','Overflater og innredning','Chat (3 ulest)','Overtagelse','Garanti'])eq(await dialog.getByRole('button',{name:label,exact:true}).count(),0,'order hides '+label);
  }
  if(kind==='direct'||kind==='new')eq(await dialog.getByRole('button',{name:'Salgsgrunnlag',exact:true}).count(),0,'no invented sales source '+kind);
  await dialog.press('Escape');
  if(kind==='support'){
   eq(await button('● Lagre endringer').count(),0,'support cannot save');
   await button('Status og mangler').click();eq(await page.getByRole('dialog').getByLabel('Arbeidsstatus',{exact:true}).isEnabled(),false,'support status remains read only');await page.getByRole('dialog').press('Escape');
   await button('Flere handlinger').click();eq(await page.getByRole('menu',{name:'Flere handlinger',exact:true}).getByRole('menuitem',{name:'Lagre som kopi',exact:true}).count(),0,'support cannot copy');eq(await page.getByRole('menu',{name:'Flere handlinger',exact:true}).getByRole('menuitem',{name:'🔒 Avslutt prosjekt',exact:true}).count(),0,'support cannot lock');await page.getByRole('menu',{name:'Flere handlinger',exact:true}).press('Escape');
  }
  if(kind==='locked'){await button('Flere handlinger').click();await page.getByRole('menu',{name:'Flere handlinger',exact:true}).getByRole('menuitem',{name:'🔓 Lås opp prosjekt',exact:true}).click();eq(await page.evaluate(()=>window.locks),[true,false],'unlock callback retained');}
 }
 eq(errors,[],'no React or DOM exceptions');
 console.log('Project workspace browser QA: PASS ('+checks+' assertions) — full-screen dialogs, drafts, native callbacks, cancellation, responsive sizes, simple/direct/new projects and read-only support');
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));fs.rmSync(temp,{recursive:true,force:true});}
