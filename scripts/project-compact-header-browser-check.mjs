import assert from 'node:assert/strict';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import http from 'node:http';
import {build} from 'vite';import react from '@vitejs/plugin-react';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const cwd=process.cwd(),temp=fs.mkdtempSync(path.join(os.tmpdir(),'project-compact-'));
let browser,server,checks=0;const measurements=[];
const eq=(actual,expected,label)=>{assert.deepEqual(actual,expected,label);checks++;};
try{
fs.writeFileSync(path.join(temp,'entry.jsx'),`
import React,{useState} from '${cwd}/node_modules/react/index.js';
import {createRoot} from '${cwd}/node_modules/react-dom/client.js';
import Chrome,{ProjectWorkspaceFooter} from '${cwd}/src/modules/project/ProjectWorkspaceChrome.jsx';
import WorkspaceTools from '${cwd}/src/modules/ui/WorkspaceTools.jsx';
import {createProjectWorkspaceTabs} from '${cwd}/src/modules/project/projectNavigationTabs.mjs';
import '${cwd}/src/style.css';import '${cwd}/src/modules/ui/proffdokWorkspace.css';
window.calls=[];
function App(){
 const [kind,setKind]=useState('locked'),[tab,setTab]=useState('prosjekt'),[note,setNote]=useState('Sikret arbeidsmerknad');
 window.kind=value=>{setKind(value);setTab('prosjekt');};window.tab=setTab;
 const readOnly=['locked','support'].includes(kind),saved=kind!=='new';
 const tabs=createProjectWorkspaceTabs({isNewProject:!saved,canUseKshms:true,openDeviationCount:readOnly?0:4,unreadForAdmin:2});
 const project={projectName:readOnly?'DEMO – RESERVE – Ferdig våtrom med garanti':'DEMO – HOVED – Badrenovering i arbeid',customer:'Demo Kunde',address:'Demoveien 42',postnr:'0001',city:'Oslo'};
 const navigate=id=>{window.calls.push(['navigate',id]);setTab(id);return true;};
 return <div data-fixture-kind={kind} data-expo-app-shell="true" data-expo-project-shell="1" data-expo-project-global-shell="1">
 <Chrome tabs={tabs} project={project} activeTab={tab} saved={saved} readOnly={readOnly} status={{icon:readOnly?'✅':'🟡',label:readOnly?'Ferdigstilt':'Pågår'}} deviations={readOnly?0:4} unread={2} onNavigate={navigate} onExit={()=>window.calls.push(['back'])} onStatus={()=>window.calls.push(['status'])} onContinue={id=>window.calls.push(['continue',id])}/>
 <main><WorkspaceTools projectWorkspace projectTabs={tabs} tab={tab} onNavigate={navigate}/><h2>Prosjektoversikt</h2><p>Syntetiske data. Faktiske appkomponenter, ikke en innlogget kundesak.</p><label>Arbeidsmerknad<textarea value={note} onChange={e=>setNote(e.target.value)}/></label></main>
 <ProjectWorkspaceFooter tabs={tabs} activeTab={tab} onNavigate={navigate} onContinue={id=>window.calls.push(['continue',id])} readOnly={readOnly}/>
 </div>;
}
createRoot(document.getElementById('root')).render(<App/>);
`);
const bundle=await build({root:cwd,configFile:false,logLevel:'silent',resolve:{alias:{'react/jsx-runtime':path.join(cwd,'node_modules/react/jsx-runtime.js')}},plugins:[react()],build:{write:false,minify:false,cssCodeSplit:false,rollupOptions:{input:path.join(temp,'entry.jsx'),output:{inlineDynamicImports:true}}}});
const js=bundle.output.find(x=>x.type==='chunk').code,css=bundle.output.filter(x=>x.fileName.endsWith('.css')).map(x=>x.source).join('\n');
server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html;charset=utf-8');res.end(`<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style><div id="root"></div><script type="module">${js.replaceAll('</script','<\\/script')}</script>`);});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
for(const [width,height] of [[1920,1080],[1363,600],[1181,800],[768,600],[390,844],[320,480]]){
 const page=await browser.newPage({viewport:{width,height}}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(5000);
 await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
 await page.goto('http://127.0.0.1:'+server.address().port);
 await page.locator('.project-workspace').waitFor();
 for(const kind of ['locked','support','active','new']){
  await page.evaluate(kind=>window.kind(kind),kind);await page.waitForFunction(kind=>document.querySelector('[data-fixture-kind]')?.getAttribute('data-fixture-kind')===kind,kind);
  const measurement=await page.evaluate(()=>({height:document.querySelector('.project-workspace').getBoundingClientRect().height,contentY:document.querySelector('main h2').getBoundingClientRect().top,pageWidth:document.documentElement.scrollWidth}));
  measurements.push({width,viewportHeight:height,kind,...measurement});
  if(process.env.COMPACT_HEADER_EVIDENCE&&width===1363){fs.mkdirSync(process.env.COMPACT_HEADER_EVIDENCE,{recursive:true});await page.screenshot({path:path.join(process.env.COMPACT_HEADER_EVIDENCE,kind+'.png')});}
  eq(measurement.pageWidth<=width+1,true,'no horizontal overflow '+kind+' '+width);
  const locked=['locked','support'].includes(kind);
  if(locked){
   eq(await page.getByRole('region',{name:'Anbefalt neste steg'}).count(),0,'read-only has no misleading next step '+kind+' '+width);
   eq(await page.getByRole('navigation',{name:'Neste og forrige prosjektsteg'}).count(),0,'read-only footer has no setup journey '+kind+' '+width);
   eq(await page.getByText('Skrivebeskyttet',{exact:true}).isVisible(),true,'read-only status visible '+width);
  }
  if(width>=1181&&kind!=='new'){
   eq(measurement.height<=215,true,'compact desktop context <=215px '+kind+' '+width);
   eq(measurement.contentY<=305,true,'actual work starts <=305px without app masthead '+kind+' '+width);
  }
  const status=page.getByRole('button',{name:'Status og mangler',exact:true});if(kind!=='new'){
   eq(await status.isVisible(),true,'status remains reachable '+width);await status.click();eq(await page.evaluate(()=>window.calls.at(-1)),['status'],'same status callback '+width);
  }
  const controls=await page.locator('.project-workspace button').evaluateAll(nodes=>nodes.filter(e=>e.getBoundingClientRect().height&&getComputedStyle(e).visibility!=='hidden').map(e=>({label:e.textContent,h:e.getBoundingClientRect().height,font:parseFloat(getComputedStyle(e).fontSize),field:!!e.closest('.project-field-bar')})));
  eq(controls.filter(c=>c.h<43.99||(!c.field&&c.font<16)),[],'readable targets unchanged '+width+' '+kind);
  if(kind==='active'){
   eq(await page.getByRole('region',{name:'Anbefalt neste steg'}).count(),0,'saved overview has no automatic setup advice '+width);
   const note=page.getByRole('textbox',{name:'Arbeidsmerknad'});await note.fill('Min kladd skal bli stående');
   await page.getByRole('button',{name:'Vis veiledning',exact:true}).click();eq(await page.getByRole('region',{name:'Anbefalt neste steg'}).isVisible(),true,'explicit setup guidance available '+width);
   await page.getByRole('region',{name:'Anbefalt neste steg'}).getByRole('button',{name:'Lagre og fortsett →',exact:true}).click();eq(await page.evaluate(()=>window.calls.at(-1)),['continue','tilgang'],'same continue/save callback '+width);
   await page.getByRole('button',{name:'Skjul veiledning',exact:true}).click();eq(await note.inputValue(),'Min kladd skal bli stående','hiding advice does not remount work '+width);
  }
  if(kind==='new')eq(await page.getByRole('region',{name:'Anbefalt neste steg'}).isVisible(),true,'new project still guided '+width);
  await page.locator('.project-workspace-toolbar').getByRole('button',{name:/Prosjektmeny/}).click();const menu=page.getByRole('dialog',{name:'Prosjektmeny',exact:true});await menu.waitFor();
  eq(await menu.getByRole('button',{name:'Deltakere og tilganger',exact:true}).count(),1,'participant function retained '+width);
  eq(await menu.getByRole('button',{name:'Rapport',exact:true}).count(),1,'report retained '+width);
  await menu.press('Escape');await menu.waitFor({state:'hidden'});
  await page.getByRole('button',{name:'Verktøy og maler',exact:true}).click();const tools=page.getByRole('dialog',{name:'Prosjektverktøy',exact:true});await tools.waitFor();eq(await tools.getByRole('button',{name:'Rapport',exact:true}).count(),1,'existing tools still complete '+width);await tools.press('Escape');await tools.waitFor({state:'hidden'});
 }
 eq(errors,[],'no React errors '+width);await page.close();
}
console.log(JSON.stringify({measurements},null,2));console.log(`Compact project header: ${checks} assertions PASS — read-only, overview, setup, callbacks, draft, 6 viewports`);
}finally{if(process.env.COMPACT_HEADER_EVIDENCE){fs.mkdirSync(process.env.COMPACT_HEADER_EVIDENCE,{recursive:true});fs.writeFileSync(path.join(process.env.COMPACT_HEADER_EVIDENCE,'measurements.json'),JSON.stringify(measurements,null,2));}await browser?.close();if(server)await new Promise(resolve=>server.close(resolve));fs.rmSync(temp,{recursive:true,force:true});}
