import assert from 'node:assert/strict';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import http from 'node:http';
import {build} from 'vite';import react from '@vitejs/plugin-react';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
let checks=0;const eq=(a,b,label)=>{assert.deepEqual(a,b,label);checks++;};
const source=fs.readFileSync('src/main.jsx','utf8');
const start=source.indexOf('    const leaveProjectWorkspace = '),end=source.indexOf('    const cancelNewProject',start),leaveSource=source.slice(start,end).trim();
const events=[];let allow=true;let supportEnds=0;
const scope={endProjectSupportProjection:async()=>{supportEnds++;},globalTabs:[['prosjekt','Startside'],['prosjektliste','Prosjektliste']],projectStepContextRef:{current:{projectId:'qa',tab:'prosjekt',userId:'user',companyName:'QA',readOnly:false,globalTabIds:['prosjekt','prosjektliste']}},projectId:'qa',mobileCreatingProject:false,isProjectSupportReadOnly:false,supportProjectCompanyName:'QA',supportSelectedCompany:'',profile:null,user:{name:'QA'},authUser:{email:'qa@example.invalid'},confirmLeaveWithUnsavedChanges:async()=>allow,pauseDirtyTrackingBriefly(){},resetProjectDirty(){},scrollToMobileTabTarget(){},setTimeout(){},document:{title:'QA'},window:{location:{href:'https://example.invalid/?project=qa',pathname:'/'},history:{replaceState(){}}},URL};
for(const name of new Set(leaveSource.match(/\bset[A-Z]\w+/g)))scope[name]=value=>events.push([name,value]);
for(const name of new Set(leaveSource.match(/\bempty\w+(?=\()/g)))scope[name]=()=>({});
const leave=new Function('scope',`with(scope){${leaveSource};return leaveProjectWorkspace;}`)(scope);
allow=false;await leave('prosjektliste');eq(events.length,0,'cancel exit preserves all project state');allow=true;await leave('prosjektliste');eq(events.findLast(([name])=>name==='setTab')[1],'prosjektliste','Bytt prosjekt reaches list');
events.length=0;await leave({type:'click'});eq(events.findLast(([name])=>name==='setTab')[1],'prosjekt','existing Startside button event keeps destination');
eq(supportEnds,0,'ordinary navigation does not end a support projection');
scope.isProjectSupportReadOnly=true;events.length=0;await leave('prosjektliste');eq(events.findLast(([name])=>name==='setTab')[1],'admin','support returns to authorized support overview');eq(supportEnds,1,'legacy support exit clears projected company and branding');
eq(source.includes('onExit: projectId ? () => leaveProjectWorkspace("prosjektliste") : cancelNewProject'),true,'actual project exit wiring');eq(source.includes('autoOpenOnEntry: false'),true,'project overview does not choose arbitrary checklist');
const cwd=process.cwd(),temp=fs.mkdtempSync(path.join(os.tmpdir(),'checklist-panel-'));let browser;
fs.writeFileSync(path.join(temp,'entry.jsx'),`
import React,{useState} from '${cwd}/node_modules/react/index.js';import {createRoot} from '${cwd}/node_modules/react-dom/client.js';
import Panel from '${cwd}/src/modules/checklist/ProjectChecklistPanel.jsx';import Workspace from '${cwd}/src/modules/checklist/ProjectChecklistWorkspace.jsx';
import '${cwd}/src/style.css';import '${cwd}/src/modules/ui/proffdokWorkspace.css';import '${cwd}/src/modules/ui/proffdokProjectWorkspace.css';
const groups=[{category:'Membran',items:['Underlag','Hjørner']},{category:'Flislegging',items:['Fuger']}];
const answers={Membran:{Underlag:{status:'Ok',comment:'Behold min kontroll'}}};window.closeCount=0;window.cancelClose=false;window.calls=[];
window.rpc=async(name)=>{window.calls.push(name);if(name!=='project_checklist_state')throw Error('Unexpected write');return {context:{company_id:'company',project_id:'project',user_id:'user'},runs:[],checklist:answers};};
function Editor({activeChecklistTemplate,checklist,setChecklistValue}){const category=activeChecklistTemplate[0]?.category;if(!category)return null;return <label>Arbeidsnotat<textarea value={checklist[category]?.Underlag?.comment||''} onChange={e=>setChecklistValue(category,'Underlag',{comment:e.target.value})}/></label>;}
function App(){const [open,setOpen]=useState(false),[readOnly,setReadOnly]=useState(false);window.lock=()=>setReadOnly(true);return <div data-expo-app-shell="true" data-expo-project-shell="1"><button onClick={()=>setOpen(true)}>Sjekklister</button>{open&&<Panel projectName="DEMO – RESERVE – Ferdig våtrom med garanti" onClose={()=>{if(window.cancelClose)return false;window.closeCount++;setOpen(false);return true;}}><Workspace Editor={Editor} companyId="company" projectId="project" userId="user" checklist={answers} activeChecklistTemplate={groups} readOnly={readOnly} autoOpenOnEntry={false} entryRequest={{id:'entry',companyId:'company',projectId:'project',userId:'user'}} onSaved={()=>{}} uploadImages={()=>[]}/></Panel>}</div>;}createRoot(document.getElementById('app')).render(<App/>);
`);
const bundle=await build({root:cwd,configFile:false,logLevel:'silent',resolve:{alias:{'react/jsx-runtime':path.join(cwd,'node_modules/react/jsx-runtime.js')}},plugins:[react(),{name:'rpc',enforce:'pre',resolveId(id){if(id.endsWith('kshmsAccess.js'))return '\0rpc';},load(id){if(id==='\0rpc')return 'export const kshmsRpc=(...args)=>window.rpc(...args);';}}],build:{write:false,minify:false,cssCodeSplit:false,rollupOptions:{input:path.join(temp,'entry.jsx'),output:{inlineDynamicImports:true}}}});
const js=bundle.output.find(x=>x.type==='chunk').code,css=bundle.output.filter(x=>x.fileName.endsWith('.css')).map(x=>x.source).join('\n');
const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html;charset=utf-8');res.end(`<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style><div id="app"></div><script type="module">${js.replaceAll('</script','<\\/script')}</script>`);});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});const page=await browser.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));page.setDefaultTimeout(5000);await page.goto('http://127.0.0.1:'+server.address().port);
 const panel=page.getByRole('dialog',{name:'Sjekklister',exact:true});
 for(const [width,height] of [[1363,936],[768,900],[390,844],[320,480]]){
  await page.setViewportSize({width,height});await page.getByRole('button',{name:'Sjekklister',exact:true}).click();await panel.waitFor();
  eq(await page.getByRole('dialog').count(),1,'entry shows overview, no arbitrary control '+width);
  const frame=await panel.boundingBox();eq(Math.round(frame.x+frame.width),width,'checklists share right edge '+width);eq(Math.round(frame.height),height,'panel fits screen '+width);
  eq(await panel.evaluate(e=>e.scrollWidth<=e.clientWidth+1),true,'panel has no horizontal overflow '+width);
  eq(await panel.locator('.project-checklist-card h3').allTextContents(),['Membran','Flislegging'],'started list precedes untouched list '+width);
  await panel.getByRole('button',{name:'Fortsett utfylling: Membran',exact:true}).click();const editor=page.getByRole('dialog',{name:'Membran',exact:true});await editor.waitFor();
  eq(await editor.locator('textarea').inputValue(),width===1363?'Behold min kontroll':'Behold arbeid etter dvale','same secured draft '+width);await editor.locator('textarea').fill('Behold arbeid etter dvale');await page.evaluate(()=>{window.dispatchEvent(new Event('blur'));window.dispatchEvent(new Event('focus'));});
  eq(await editor.locator('textarea').inputValue(),'Behold arbeid etter dvale','focus retains edit '+width);
  await editor.press('Escape');await editor.waitFor({state:'hidden'});eq(await panel.isVisible(),true,'Escape closes only inner control '+width);
  await panel.getByRole('button',{name:'Fortsett sjekkliste: Membran',exact:true}).click();await editor.waitFor();eq(await editor.locator('textarea').inputValue(),'Behold arbeid etter dvale','explicit resume reopens same local work '+width);await editor.press('Escape');
  if(process.env.PROJECT_UX_SCREENSHOTS){fs.mkdirSync(process.env.PROJECT_UX_SCREENSHOTS,{recursive:true});await page.screenshot({path:path.join(process.env.PROJECT_UX_SCREENSHOTS,'checklists-'+width+'.png')});}
  await panel.press('Escape');await panel.waitFor({state:'hidden'});
 }
 await page.getByRole('button',{name:'Sjekklister',exact:true}).click();await page.evaluate(()=>window.cancelClose=true);await panel.getByRole('button',{name:'Lukk sjekklister',exact:true}).click();await page.waitForFunction(()=>document.querySelector('dialog')?.open);eq(await panel.isVisible(),true,'cancelled navigation reopens same panel');await page.evaluate(()=>window.cancelClose=false);await panel.press('Escape');
 await page.evaluate(()=>window.lock());await page.getByRole('button',{name:'Sjekklister',exact:true}).click();await panel.waitFor();eq(await panel.getByRole('button',{name:'Vis dokumentasjon',exact:true}).count(),2,'locked legacy answers have read-only action');eq(await panel.getByText('Registrert dokumentasjon',{exact:false}).count()>0,true,'legacy is not falsely completed');eq(await panel.getByRole('button',{name:/Fortsett/}).count(),0,'locked project does not offer resume');eq(await panel.getByText(/kontroller og fullfør/).count(),0,'locked project never asks for completion');await panel.getByRole('button',{name:'Vis dokumentasjon',exact:true}).first().click();const saved=page.getByRole('dialog',{name:'Membran',exact:true});eq(await saved.locator('textarea').isDisabled(),true,'legacy read-only content remains disabled');eq(await saved.locator('textarea').inputValue(),'Behold min kontroll','locked document uses server, not private local draft');eq(await saved.getByRole('button',{name:'Lagre',exact:true}).count(),0,'read-only cannot save');eq(await saved.getByText(/Lagre kontrollen først|Tegn egen signatur før fullføring/).count(),0,'locked reader is never instructed to write');eq(await page.evaluate(()=>window.calls.every(name=>name==='project_checklist_state')),true,'review has no writes');eq(errors,[],'no native dialog or React errors');
 console.log('Project checklist panel browser QA: PASS ('+checks+' assertions) — shared right panel, explicit overview, nested Escape, same secured draft, short screens, cancelled exit and locked documentation');
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));fs.rmSync(temp,{recursive:true,force:true});}

await import('./checklist-guidance-check.mjs');
await import('./project-checklist-guidance-browser-check.mjs');
