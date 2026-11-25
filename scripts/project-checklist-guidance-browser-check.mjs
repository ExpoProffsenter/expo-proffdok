import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
let checks=0;
const eq=(actual,expected,label)=>{assert.deepEqual(actual,expected,label);checks++;};
const cwd=process.cwd(),temp=fs.mkdtempSync(path.join(os.tmpdir(),'checklist-guidance-'));
let browser,server;
try {
 fs.writeFileSync(path.join(temp,'entry.jsx'),`
import React,{useState} from '${cwd}/node_modules/react/index.js';
import {createRoot} from '${cwd}/node_modules/react-dom/client.js';
import Panel from '${cwd}/src/modules/checklist/ProjectChecklistPanel.jsx';
import Workspace from '${cwd}/src/modules/checklist/ProjectChecklistWorkspace.jsx';
import '${cwd}/src/style.css';
import '${cwd}/src/modules/ui/proffdokWorkspace.css';
import '${cwd}/src/modules/ui/proffdokProjectWorkspace.css';
const requirements=[{image_required:true},{comment_required:true},{fields:[{id:'00000000-0000-4000-8000-000000000001',type:'text',label:'Måling',required:true}]},{documentation_either:true},{},{}];
const names=['Bildekrav','Kommentarkrav','Underfelt','Alternativ dokumentasjon','Klar kontroll','Historikk'];
const groups=names.map((category,i)=>({category,items:['Punkt'],requirements:{Punkt:requirements[i]}}));
const runs=groups.map((definition,i)=>({id:'run-'+i,category:definition.category,status:i===5?'completed':'draft',revision:1,definition,answers:{Punkt:{status:'Ok'}},completed_at:i===5?'2026-11-01T12:00:00Z':null}));
window.calls=[];
window.rpc=async name=>{window.calls.push(name);if(name!=='project_checklist_state')throw Error('Unexpected write: '+name);return {context:{company_id:'company',project_id:'project',user_id:'user'},runs,checklist:{}};};
function Editor({activeChecklistTemplate,checklist,setChecklistValue}){const group=activeChecklistTemplate[0];if(!group)return null;return <label>Kommentar<textarea value={checklist[group.category]?.Punkt?.comment||''} onChange={event=>setChecklistValue(group.category,'Punkt',{comment:event.target.value})}/></label>;}
function App(){const [readOnly,setReadOnly]=useState(false);window.lock=()=>setReadOnly(true);return <div data-expo-app-shell="true" data-expo-project-shell="1"><Panel projectName="Syntetisk prosjekt – arbeidsstatus" onClose={()=>false}><Workspace Editor={Editor} companyId="company" projectId="project" userId="user" checklist={{}} activeChecklistTemplate={groups} readOnly={readOnly} autoOpenOnEntry={false} showTools={false} onSaved={()=>{throw Error('No write allowed in guidance review');}}/></Panel></div>;}
createRoot(document.getElementById('app')).render(<App/>);
`);
 const bundle=await build({root:cwd,configFile:false,logLevel:'silent',resolve:{alias:{'react/jsx-runtime':path.join(cwd,'node_modules/react/jsx-runtime.js')}},plugins:[react(),{name:'guidance-rpc',enforce:'pre',resolveId(id){if(id.endsWith('kshmsAccess.js'))return '\0rpc';},load(id){if(id==='\0rpc')return 'export const kshmsRpc=(...args)=>window.rpc(...args);';}}],build:{write:false,minify:false,cssCodeSplit:false,rollupOptions:{input:path.join(temp,'entry.jsx'),output:{inlineDynamicImports:true}}}});
 const js=bundle.output.find(x=>x.type==='chunk').code,css=bundle.output.filter(x=>x.fileName.endsWith('.css')).map(x=>x.source).join('\n');
 server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html;charset=utf-8');res.end(`<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style><div id="app"></div><script type="module">${js.replaceAll('</script','<\\/script')}</script>`);});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
 for(const [width,height] of [[1363,936],[390,844],[320,480]]) {
  const page=await browser.newPage({viewport:{width,height}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));page.setDefaultTimeout(5000);
  await page.goto('http://127.0.0.1:'+server.address().port);
  const panel=page.getByRole('dialog',{name:'Sjekklister',exact:true});await panel.waitFor();
  const cards=panel.locator('.project-checklist-card:not([hidden])');
  await panel.getByRole('button',{name:'Arbeid gjenstår: 4',exact:true}).waitFor();
  eq(await panel.locator('.project-checklist-stages button').count(),3,'three clear stages '+width);
  eq(await panel.getByRole('button',{name:'Til sluttkontroll: 1',exact:true}).count(),1,'one content-ready control '+width);
  eq(await panel.getByRole('button',{name:'Fullført: 1',exact:true}).count(),1,'one persisted completed control '+width);
  eq(await panel.locator('.project-checklist-resume button').count(),4,'all four missing requirements remain actionable '+width);
  eq(await panel.evaluate(node=>node.scrollWidth<=node.clientWidth+1),true,'no horizontal panel overflow '+width);
  for(const button of await panel.locator('.project-checklist-stages button').all()){
   const box=await button.boundingBox();eq(box.height>=44,true,'stage touch target '+width);eq(box.x>=0&&box.x+box.width<=width+1,true,'stage inside viewport '+width);
  }
  await panel.getByRole('button',{name:'Til sluttkontroll: 1',exact:true}).click();
  eq(await cards.locator('h3').allTextContents(),['Klar kontroll'],'ready filter excludes missing evidence '+width);
  await cards.first().getByRole('button',{name:'Fortsett sjekkliste: Klar kontroll',exact:true}).click();
  let editor=page.getByRole('dialog',{name:'Klar kontroll',exact:true});await editor.waitFor();
  eq(await editor.getByRole('button',{name:'Lagre',exact:true}).count(),1,'review is not completion '+width);
  await editor.press('Escape');await editor.waitFor({state:'hidden'});
  eq(await panel.locator('select').inputValue(),'ready','return preserves chosen filter '+width);
  await panel.locator('select').selectOption('images');
  eq(await cards.locator('h3').allTextContents(),['Bildekrav','Kommentarkrav','Underfelt','Alternativ dokumentasjon'],'documentation filter covers comment and fields '+width);
  const commentCard=cards.filter({has:page.getByRole('heading',{name:'Kommentarkrav',exact:true})});
  eq((await commentCard.textContent()).includes('Legg til kommentar'),true,'specific missing comment shown before opening '+width);
  await commentCard.getByRole('button',{name:'Fortsett sjekkliste: Kommentarkrav',exact:true}).click();
  editor=page.getByRole('dialog',{name:'Kommentarkrav',exact:true});await editor.waitFor();
  await editor.getByRole('textbox',{name:'Kommentar',exact:true}).fill('Dokumentert lokalt');
  await editor.press('Escape');await editor.waitFor({state:'hidden'});
  eq(await cards.locator('h3').allTextContents(),['Bildekrav','Underfelt','Alternativ dokumentasjon'],'local evidence updates filter without writing '+width);
  eq(await panel.getByRole('button',{name:'Til sluttkontroll: 2',exact:true}).count(),1,'local documented draft reaches review stage '+width);
  await panel.getByRole('button',{name:'Til sluttkontroll: 2',exact:true}).click();
  await cards.filter({has:page.getByRole('heading',{name:'Kommentarkrav',exact:true})}).getByRole('button',{name:'Fortsett sjekkliste: Kommentarkrav',exact:true}).click();
  editor=page.getByRole('dialog',{name:'Kommentarkrav',exact:true});await editor.waitFor();
  eq(await editor.getByRole('textbox',{name:'Kommentar',exact:true}).inputValue(),'Dokumentert lokalt','same local draft reopened '+width);
  await editor.press('Escape');await editor.waitFor({state:'hidden'});
  await panel.locator('select').selectOption('deviations');
  eq(await cards.count(),0,'empty filter does not show unrelated control '+width);
  eq(await panel.getByText('Ingen sjekklister passer dette filteret.',{exact:true}).count(),1,'empty filter explained '+width);
  await panel.getByRole('button',{name:'Vis alle sjekklister',exact:true}).click();eq(await cards.count(),6,'reset restores all controls '+width);
  await page.evaluate(()=>window.lock());
  await page.waitForFunction(()=>!document.querySelector('.project-checklist-stages'));
  eq(await panel.locator('.project-checklist-resume button').count(),0,'locked project has no edit recommendations '+width);
  eq(await panel.getByRole('button',{name:'Vis dokumentasjon',exact:true}).count(),6,'locked data uses documentation action '+width);
  eq(await panel.locator('.project-checklist-next-issue').count(),0,'locked project has no impossible completion advice '+width);
  await panel.locator('select').selectOption('completed');eq(await cards.locator('h3').allTextContents(),['Historikk'],'history remains truly completed '+width);
  eq(await page.evaluate(()=>window.calls.every(name=>name==='project_checklist_state')),true,'read-only transport throughout '+width);
  eq(errors,[],'no React/browser errors '+width);
  await page.close();
 }
 console.log(`Checklist guidance browser: ${checks} assertions PASS — actual React panels, evidence filtering, local draft, immutable history, return and 320×480 layout`);
} finally {
 await browser?.close();if(server)await new Promise(resolve=>server.close(resolve));fs.rmSync(temp,{recursive:true,force:true});
}
