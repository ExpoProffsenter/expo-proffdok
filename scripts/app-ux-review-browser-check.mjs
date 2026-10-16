import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
import {matchesProjectStatus} from '../src/modules/project/projectListStatus.mjs';
import {checklistDisplayState} from '../src/modules/checklist/checklistDisplay.mjs';
import {filterHelpSections} from '../src/modules/help/helpSearch.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
let checks=0,browser;const eq=(a,b,label)=>{assert.deepEqual(a,b,label);checks++;};
for(const tone of ['open','progress','deviation','customer_ready','waiting'])eq(matchesProjectStatus(tone,'active'),true,'all unfinished states are active');
for(const tone of ['done','locked']){eq(matchesProjectStatus(tone,'active'),false);eq(matchesProjectStatus(tone,'archive'),true);}
eq(matchesProjectStatus('open','progress'),false,'exact status remains exact');
const def={items:['A','B','C'],requirements:{A:{image_required:true},B:{documentation_either:true},C:{image_required:true}}};
const answers={A:{status:'Avvik'},B:{status:'OK',comment:'Dokumentert'},C:{status:'Ikke aktuelt'}};
const before=JSON.stringify(answers);eq(checklistDisplayState(def,answers),{assessed:3,deviations:1,missingImages:1,complete:false,ready:true});eq(JSON.stringify(answers),before,'display does not mutate answers');
const allowed=[{title:'Timer',chapters:[{title:'Kvittering',workflow:['Last opp utlegg']}]},{title:'Bilder',workflow:['Last opp bilde']}];
eq(filterHelpSections(allowed,'TIMER kvittering').length,1);eq(filterHelpSections(allowed,'systemadmin'),[],'search cannot introduce unauthorized topics');
const root=process.cwd(),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'app-ux-')),entry=path.join(tmp,'entry.jsx');
const labels=['Prosjektoversikt','Salgsgrunnlag','Prosjektbeskrivelse','Avtalegrunnlag','Prosjektering','Fremdrift','Produkter','Overflater og innredning','Bilder','Tilgang','Fag/utstyr','Sjekklister','Avvik/SJA/RUH','Chat (2)','Interne notater','Overtagelse','Garanti','Rapport'];
fs.writeFileSync(entry,`import React from '${root}/node_modules/react/index.js';import {createRoot} from '${root}/node_modules/react-dom/client.js';
import Photos,{collectProjectPhotos} from '${root}/src/modules/images/PhotoOverview.jsx';
import Products from '${root}/src/modules/product/ProductDocumentationSummary.jsx';
import Shortcuts from '${root}/src/modules/home/WorkdayShortcuts.jsx';
import Delivery from '${root}/src/modules/report/DeliverySummary.jsx';
import Brand from '${root}/src/modules/company/CompanyBrandPreview.jsx';
import {installProjectWorkspaceHeaderGuide} from '${root}/src/modules/app/projectWorkspaceHeaderGuide.js';
import '${root}/src/style.css';import '${root}/src/modules/ui/appUxReview.css';
window.clicks=[];window.photos=[{url:'/a.png',cat:'Membran'}];window.checklist={Kontroll:{Punkt:{photos:[{url:'/a.png'},{url:'/b.png'}]}}};window.photoCount=collectProjectPhotos(window.photos,window.checklist).length;
const labels=${JSON.stringify(labels)};document.getElementById('source').innerHTML=labels.map((label,i)=>'<button class="'+(i===0?'on':'')+'">'+label+'</button>').join('');document.querySelectorAll('#source>button').forEach(button=>button.onclick=()=>{window.clicks.push(button.textContent);document.querySelectorAll('#source>button').forEach(b=>b.classList.toggle('on',b===button));});
const render=(hr=true)=>createRootForApp.render(<><Shortcuts canPersonal canHr={hr} canKshms={false} onPersonal={()=>window.clicks.push('personal')} onHr={()=>window.clicks.push('hr')}/><Products sections={[{title:'Flis',items:['Produkt A','Produkt B']}]} checked={{'Produkt A':true,'Produkt B':true}} docs={{'Produkt A':{fdvUrl:' ',databladUrl:'/valid'}}} getManual={()=>[]} onOpen={value=>window.clicks.push(value)}/><Photos photos={window.photos} checklist={window.checklist} onChecklist={()=>window.clicks.push('checklist')}/><Delivery items={[{id:'photo',label:'Legg til bildedokumentasjon'}]} onOpen={item=>window.clicks.push(item.id)} warrantyEnabled warrantyMissing={['Mangler signatur']} onWarranty={()=>window.clicks.push('warranty')}/><Brand company={{companyName:'QA Firma',address:'Testveien 1',email:'qa@example.invalid'}}/></>);
const createRootForApp=createRoot(document.getElementById('app'));window.render=render;render();installProjectWorkspaceHeaderGuide();`);
const result=await build({root,configFile:false,logLevel:'silent',resolve:{alias:{'react/jsx-runtime':root+'/node_modules/react/jsx-runtime.js'}},plugins:[react()],build:{write:false,minify:false,cssCodeSplit:false,rollupOptions:{input:entry,output:{inlineDynamicImports:true}}}});
const js=result.output.find(x=>x.type==='chunk').code,css=result.output.filter(x=>x.fileName.endsWith('.css')).map(x=>x.source).join('\n');
const server=http.createServer((req,res)=>{if(req.url.endsWith('.png')){res.end();return;}res.setHeader('Content-Type','text/html; charset=utf-8');res.end(`<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}#source{display:none}#expo-desktop-menu-bar{display:flex}main{padding:12px}</style><div id="expo-desktop-menu-bar"></div><nav id="source"></nav><main><div id="app"></div></main><script type="module">${js.replaceAll('</script','<\\/script')}</script>`);});await new Promise(r=>server.listen(0,'127.0.0.1',r));
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:1363,height:936}}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(7000);
 await page.goto('http://127.0.0.1:'+server.address().port);await page.locator('.expoProjectMenuGroup').first().waitFor();eq(await page.locator('.expoProjectMenuGroup').count(),3);eq(await page.locator('.expoProjectWorkspaceQuickButton').count(),18,'all native destinations retained');
 for(const label of labels){const b=page.locator('.expoProjectWorkspaceQuickButton').filter({hasText:label==='Prosjektoversikt'?'Oversikt':label});await b.locator('xpath=ancestor::details').evaluate(el=>el.open=true);await b.click();await page.waitForFunction(value=>window.clicks.at(-1)===value,label);checks++;}
 await page.locator('.expoProjectMenuGroup').first().evaluate(el=>el.open=false);await page.evaluate(()=>document.querySelector('#source>button').click());await page.waitForFunction(()=>document.querySelector('.expoProjectMenuGroup').open);checks++;
 eq(await page.evaluate(()=>window.photoCount),2,'same photo appears only once');await page.getByText(/Samlet bildeoversikt/).click();eq(await page.locator('.ux-grid img').count(),2);await page.getByLabel('Vis bildekilde').selectOption('Sjekkliste');eq(await page.locator('.ux-grid img:visible').count(),2,'shared photo keeps both source tags');await page.getByRole('button',{name:'Åpne Sjekklister',exact:true}).first().click();eq(await page.evaluate(()=>window.clicks.at(-1)),'checklist');
 eq(await page.getByText('1 valgte produkter uten FDV-/databladlenke',{exact:true}).count(),1,'valid datablad offsets blank FDV');await page.getByText('Se produktene som mangler lenke').click();await page.getByRole('button',{name:'Produkt B · Flis',exact:true}).click();eq(await page.evaluate(()=>window.clicks.at(-1)),'Flis');
 await page.getByLabel('Hva skal du gjøre?').selectOption('lead');await page.getByRole('button',{name:'Åpne HR og ledelse',exact:true}).click();eq(await page.evaluate(()=>window.clicks.at(-1)),'hr');await page.evaluate(()=>window.render(false));await page.getByRole('option',{name:'HR og ledelse',exact:true}).waitFor({state:'detached'});eq(await page.getByRole('option',{name:'HR og ledelse',exact:true}).count(),0,'revoked shortcut removed');
 await page.getByText(/Før overlevering/).click();await page.getByRole('button',{name:'Legg til bildedokumentasjon',exact:true}).click();eq(await page.evaluate(()=>window.clicks.at(-1)),'photo');await page.getByRole('button',{name:'Åpne garantigrunnlaget',exact:true}).click();eq(await page.evaluate(()=>window.clicks.at(-1)),'warranty');
 for(const width of [1363,768,390,320]){await page.setViewportSize({width,height:900});eq(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'no overflow '+width);eq(await page.locator('.ux-workday-shortcuts').isVisible(),width>700,'existing mobile shortcut setting preserved '+width);}
 eq(errors,[]);console.log('App UX review: '+checks+' checks PASS — preserved 18 native destinations, dynamic group, permission revocation, read-only filters, deduplicated photos, documentation links and four widths; no live writes.');
}finally{await browser?.close();await new Promise(r=>server.close(r));fs.rmSync(tmp,{recursive:true,force:true});}
