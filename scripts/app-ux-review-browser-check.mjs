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
import Tools from '${root}/src/modules/ui/WorkspaceTools.jsx';
import {publishModuleAccess} from '${root}/src/modules/access/moduleAccessClient.js';
import Delivery from '${root}/src/modules/report/DeliverySummary.jsx';
import Brand from '${root}/src/modules/company/CompanyBrandPreview.jsx';
import {installProjectWorkspaceHeaderGuide} from '${root}/src/modules/app/projectWorkspaceHeaderGuide.js';
import '${root}/src/style.css';import '${root}/src/modules/ui/appUxReview.css';
publishModuleAccess({loaded:true,moduleKeys:['projects','sales','store_offers']});window.clicks=[];window.photos=[{url:'/a.png',cat:'Membran'}];window.checklist={Kontroll:{Punkt:{photos:[{url:'/a.png'},{url:'/b.png'}]}}};window.collectedPhotos=collectProjectPhotos(window.photos,window.checklist);window.photoCount=window.collectedPhotos.length;
const labels=${JSON.stringify(labels)};document.getElementById('source').innerHTML=labels.map((label,i)=>'<button class="'+(i===0?'on':'')+'">'+label+'</button>').join('');document.querySelectorAll('#source>button').forEach(button=>button.onclick=()=>{window.clicks.push(button.textContent);document.querySelectorAll('#source>button').forEach(b=>b.classList.toggle('on',b===button));});
const render=(hr=true,toolTab="sales",projectWorkspace=false,contextProps={})=>createRootForApp.render(<><Tools {...contextProps} canPersonal canHr={hr} canKshms canManageChecklists canCatalog onPersonal={()=>window.clicks.push('personal')} onHr={()=>window.clicks.push('hr')} onKshms={()=>window.clicks.push('safety')} onChecklists={()=>window.clicks.push('templates')} onProjects={()=>window.clicks.push('projects')} onNewProject={()=>window.clicks.push('new-project')} onCatalog={()=>window.clicks.push('catalog')} onOrder={()=>window.clicks.push('order')} onRequest={()=>window.clicks.push('request')} onOffer={()=>window.clicks.push('offer')} onSales={()=>window.clicks.push('sales')} tab={toolTab} projectWorkspace={projectWorkspace} projectTabs={labels.map((label,i)=>[String(i),label])} onNavigate={id=>window.clicks.push(id)} scopeKey="synthetic-qa"/><input aria-label="Ulagret kontrollfelt" defaultValue="Behold denne teksten"/><Shortcuts canPersonal canHr={hr} canKshms canManageChecklists canCatalog onPersonal={()=>window.clicks.push('personal')} onHr={()=>window.clicks.push('hr')} onKshms={()=>window.clicks.push('safety')} onChecklists={()=>window.clicks.push('templates')} onProjects={()=>window.clicks.push('projects')} onNewProject={()=>window.clicks.push('new-project')} onCatalog={()=>window.clicks.push('catalog')} onOrder={()=>window.clicks.push('order')} onRequest={()=>window.clicks.push('request')} onOffer={()=>window.clicks.push('offer')} onSales={()=>window.clicks.push('sales')}/><Products sections={[{title:'Flis',items:['Produkt A','Produkt B']}]} checked={{'Produkt A':true,'Produkt B':true}} docs={{'Produkt A':{fdvUrl:' ',databladUrl:'/valid'}}} getManual={()=>[]} onOpen={value=>window.clicks.push(value)}/><Photos photos={window.photos} checklist={window.checklist} onChecklist={()=>window.clicks.push('checklist')}/><Delivery items={[{id:'photo',label:'Legg til bildedokumentasjon'}]} onOpen={item=>window.clicks.push(item.id)} warrantyEnabled warrantyMissing={['Mangler signatur']} onWarranty={()=>window.clicks.push('warranty')}/><Brand company={{companyName:'QA Firma',address:'Testveien 1',email:'qa@example.invalid'}}/></>);
const createRootForApp=createRoot(document.getElementById('app'));window.render=render;render();installProjectWorkspaceHeaderGuide();`);
const result=await build({root,configFile:false,logLevel:'silent',resolve:{alias:{'react/jsx-runtime':root+'/node_modules/react/jsx-runtime.js'}},plugins:[react()],build:{write:false,minify:false,cssCodeSplit:false,rollupOptions:{input:entry,output:{inlineDynamicImports:true}}}});
const js=result.output.find(x=>x.type==='chunk').code,css=result.output.filter(x=>x.fileName.endsWith('.css')).map(x=>x.source).join('\n');
const server=http.createServer((req,res)=>{if(req.url.endsWith('.png')){res.setHeader('Content-Type','image/svg+xml');res.end('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="teal"/></svg>');return;}res.setHeader('Content-Type','text/html; charset=utf-8');res.end(`<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}#source{display:none}#expo-desktop-menu-bar{display:flex}main{padding:12px}</style><div id="expo-desktop-menu-bar"></div><nav id="source"></nav><main><div id="app"></div></main><script type="module">${js.replaceAll('</script','<\\/script')}</script>`);});await new Promise(r=>server.listen(0,'127.0.0.1',r));
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:1363,height:936}}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(7000);
 await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
 await page.goto('http://127.0.0.1:'+server.address().port);await page.locator('.expoProjectMenuGroup').first().waitFor();eq(await page.locator('.expoProjectMenuGroup').count(),3);eq(await page.locator('.expoProjectWorkspaceQuickButton').count(),18,'all native destinations retained');
 for(const label of labels){const b=page.locator('.expoProjectWorkspaceQuickButton').filter({hasText:label==='Prosjektoversikt'?'Oversikt':label});await b.locator('xpath=ancestor::details').evaluate(el=>el.open=true);await b.click();await page.waitForFunction(value=>window.clicks.at(-1)===value,label);checks++;}
 await page.locator('.expoProjectMenuGroup').first().evaluate(el=>el.open=false);await page.evaluate(()=>document.querySelector('#source>button').click());await page.waitForFunction(()=>document.querySelector('.expoProjectMenuGroup').open);checks++;
 eq(await page.evaluate(()=>window.photoCount),2,'same photo appears only once');eq(await page.evaluate(()=>window.collectedPhotos[0].locations.length),2,'deduplication preserves both original locations');await page.getByText(/Samlet bildeoversikt/).click();eq(await page.locator('.ux-grid img').count(),2);await page.getByLabel('Vis bildekilde').selectOption('Sjekkliste');eq(await page.locator('.ux-grid img:visible').count(),2,'shared photo keeps both source tags');await page.getByRole('button',{name:'Åpne Sjekklister',exact:true}).first().click();eq(await page.evaluate(()=>window.clicks.at(-1)),'checklist');
 eq(await page.getByText('1 valgte produkter uten FDV-/databladlenke',{exact:true}).count(),1,'valid datablad offsets blank FDV');await page.getByText('Se produktene som mangler lenke').click();await page.getByRole('button',{name:'Produkt B · Flis',exact:true}).click();eq(await page.evaluate(()=>window.clicks.at(-1)),'Flis');
 // The approved task overview replaces the former dropdown. Preserve every action and revoke it when access changes.
 eq(await page.locator('.pd-home-task').count(),6,'six authorized work areas');
 for(const [label,result] of [['Ny forespørsel','request'],['Nytt tilbud','offer'],['Varesøk','catalog'],['Varebestilling','order'],['Åpne prosjekter','projects'],['Prosjektsjekklister','projects'],['Sjekklistemaler','templates'],['Min side','personal'],['HR','hr'],['HMS/KS','safety']]){
  await page.locator('.pd-home-workspace').getByRole('button',{name:label,exact:true}).click();eq(await page.evaluate(()=>window.clicks.at(-1)),result,'native shortcut '+label);
 }
 await page.getByLabel('Ulagret kontrollfelt').fill('Ulagret tekst skal beholdes');
 await page.getByRole('button',{name:'Verktøy og maler',exact:true}).click();
 const tools=page.getByRole('dialog',{name:'Forespørsel og tilbud',exact:true});await tools.waitFor();
 eq(await tools.getByRole('heading',{name:'Tilbud',exact:true}).count(),1,'contextual offer tools');
 eq(await tools.getByRole('button',{name:'Varebestilling',exact:true}).count(),0,'irrelevant tools omitted');
 await tools.getByRole('button',{name:'Utvid arbeidsflaten',exact:true}).click();eq(await tools.evaluate(el=>el.classList.contains('is-wide')),true,'panel expands');
 await page.keyboard.press('Escape');eq(await tools.isVisible(),false,'Escape closes tools');
 eq(await page.getByLabel('Ulagret kontrollfelt').inputValue(),'Ulagret tekst skal beholdes','opening and closing leaves work mounted');
 eq(await page.getByRole('button',{name:'Verktøy og maler',exact:true}).evaluate(el=>document.activeElement===el),true,'focus returns to trigger');
 await page.getByRole('button',{name:'Verktøy og maler',exact:true}).click();await tools.getByRole('button',{name:'Se tilbud',exact:true}).click();eq(await page.evaluate(()=>window.clicks.at(-1)),'sales','tools invokes existing callback');eq(await tools.isVisible(),false,'action closes panel');
 await page.evaluate(()=>window.render(false));await page.locator('.pd-home-workspace').getByRole('button',{name:'HR',exact:true}).waitFor({state:'detached'});eq(await page.locator('.pd-home-workspace').getByRole('button',{name:'HR',exact:true}).count(),0,'revoked shortcut removed');
 await page.getByText(/Før overlevering/).click();await page.getByRole('button',{name:'Legg til bildedokumentasjon',exact:true}).click();eq(await page.evaluate(()=>window.clicks.at(-1)),'photo');await page.getByRole('button',{name:'Åpne garantigrunnlaget',exact:true}).click();eq(await page.evaluate(()=>window.clicks.at(-1)),'warranty');
 for(const width of [1363,768,390,320]){await page.setViewportSize({width,height:900});eq(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'no overflow '+width);eq(await page.locator('.pd-home-workspace').isVisible(),true,'shared task overview on desktop and mobile '+width);}
 // Actual drawer headings and both controls must fit small and short viewports.
 for(const [toolTab,projectWorkspace,title] of [['bolig',false,'Boligprosjekter'],['prosjekt',true,'Prosjektverktøy']]){
  await page.evaluate(args=>window.render(true,...args),[toolTab,projectWorkspace]);
  for(const [width,height] of [[320,320],[320,480],[390,640],[768,900],[1366,900]]){
   await page.setViewportSize({width,height});
   await page.getByRole('button',{name:'Verktøy og maler',exact:true}).click();
   const drawer=page.getByRole('dialog',{name:title,exact:true});
   const g=await drawer.evaluate(d=>{
    const header=d.querySelector('.pd-workspace-drawer-header'),r=header.getBoundingClientRect();
    const buttons=[...header.querySelectorAll('button')].map(b=>{const q=b.getBoundingClientRect();return {left:q.left,right:q.right,top:q.top,bottom:q.bottom,width:q.width,height:q.height};});
    const footer=d.querySelector('.pd-workspace-drawer-footer').getBoundingClientRect();
    return {fits:header.scrollWidth<=header.clientWidth+1,buttons,footerBottom:footer.bottom,width:innerWidth,height:innerHeight};
   });
   eq(g.fits,true,title+' header fits '+width+'x'+height+': '+JSON.stringify(g));
   eq(g.buttons.every(b=>b.left>=0&&b.right<=g.width&&b.top>=0&&b.bottom<=g.height&&b.width>=44&&b.height>=44),true,title+' controls fit and remain at least 44px');
   eq(g.footerBottom<=height,true,title+' footer remains in viewport');
   await drawer.getByRole('button',{name:'Lukk arbeidsverktøy',exact:true}).click();
   eq(await drawer.isVisible(),false,'close works '+title);
  }
 }
 // Explicit case tools use current native actions and never discover unrelated DOM tools.
 await page.evaluate(()=>window.render(true,'sales',false,{contextTitle:'Valgt sak',contextKey:'case-a',rowLabel:'Sak',actionGroups:[{id:'case',title:'Arbeid med saken',description:'Gjeldende sak.',actions:[{label:'Åpne befaringsnotat',onClick:()=>window.clicks.push('case-inspection')},{label:'Sperret handling',disabled:true,onClick:()=>window.clicks.push('forbidden')}]}]}));
 const work=page.getByLabel('Ulagret kontrollfelt');await work.fill('Samme felt og samme kladd');const workNode=await work.elementHandle();
 await page.getByRole('button',{name:'Verktøy og maler',exact:true}).click();
 const caseTools=page.getByRole('dialog',{name:'Valgt sak',exact:true});await caseTools.waitFor();
 eq(await caseTools.getByRole('button',{name:'Sperret handling',exact:true}).isDisabled(),true,'explicit disabled state is preserved');
 eq(await caseTools.getByRole('heading',{name:'Arbeid med saken',exact:true}).count(),1,'case tools use explicit native group');
 eq(await caseTools.getByRole('button',{name:'Se tilbud',exact:true}).count(),0,'global module actions do not leak into case tools');
 await page.keyboard.press('Escape');
 eq(await work.evaluate((el,node)=>el===node,workNode),true,'case drawer keeps the actual work element');
 eq(await work.inputValue(),'Samme felt og samme kladd','case drawer preserves work');
 await page.getByRole('button',{name:'Verktøy og maler',exact:true}).click();await caseTools.getByRole('button',{name:'Åpne befaringsnotat',exact:true}).click();
 eq(await page.evaluate(()=>window.clicks.at(-1)),'case-inspection','explicit action delegates to native callback');eq(await caseTools.isVisible(),false,'explicit action closes drawer');
 await page.getByRole('button',{name:'Verktøy og maler',exact:true}).click();
 await page.evaluate(()=>window.render(true,'sales',false,{contextTitle:'Ny valgt sak',contextKey:'case-b',actionGroups:[]}));
 await page.locator('.pd-workspace-drawer').waitFor({state:'hidden'});eq(await page.locator('.pd-workspace-drawer').isVisible(),false,'case change closes the old action drawer');
 eq(await work.inputValue(),'Samme felt og samme kladd','changing tools context does not remount unrelated work');
 eq(errors,[]);console.log('App UX review: '+checks+' checks PASS — preserved 18 native destinations, dynamic group, task callbacks, native right dialog/focus/draft preservation, permission revocation, read-only filters, deduplicated photos, documentation links and four widths; no live writes.');
}finally{await browser?.close();await new Promise(r=>server.close(r));fs.rmSync(tmp,{recursive:true,force:true});}

await import("./people-workspace-browser-check.mjs");
await import("./home-followup-036-browser-check.mjs");
await import("./personal-workspace-036-browser-check.mjs");
await import("./hr-workspace-036-browser-check.mjs");
await import("./hr-subflows-036-browser-check.mjs");
await import("./kshms-workspace-036-browser-check.mjs");
await import("./kshms-subflows-036-browser-check.mjs");
await import("./kshms-governance-036-browser-check.mjs");

await import("./systemadmin-company-panel-browser-check.mjs");
await import("./profile-support-register-browser-check.mjs");

await import("./report-choice-workspace-browser-check.mjs");

await import("./project-media-portal-browser-check.mjs");

await import("./sales-entry-workspace-browser-check.mjs");

await import("./housing-first-screen-036-browser-check.mjs");
await import("./sales-flow-036-browser-check.mjs");

await import("./project-subflows-036-browser-check.mjs");
