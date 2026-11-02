import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
import {kshmsNavigationGroups} from '../src/modules/kshms/kshmsNavigation.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=process.cwd(),outputDir=process.env.KSHMS_WORKSPACE_SCREENSHOTS;
let checks=0,browser;const eq=(a,b,label)=>{assert.deepEqual(a,b,label);checks++;};
const stubs=new Map([['KshmsDeviations','Avvikssentral'],['KshmsChecklistCentral','Firmaets sjekklister'],['KshmsInspectionExtract','Dokumentuttrekk'],['KshmsProgressPlans','Firmaets fremdriftsplaner'],['OrganizationChart','Organisasjonskart']]);
const bundle=await build({root,configFile:false,logLevel:'silent',plugins:[react(),{name:'ks-native-transport',enforce:'pre',resolveId(id){if(id.endsWith('/kshmsAccess.js'))return '\0rpc';const name=id.split('/').at(-1)?.replace('.jsx','');if(stubs.has(name))return '\0native-'+name;},load(id){if(id==='\0rpc')return 'export const kshmsRpc=(...args)=>window.rpc(...args);';if(id.startsWith('\0native-'))return 'import React from "react";export default function Native(){return React.createElement("section",{"data-native-destination":"'+id.slice(8)+'"},React.createElement("h3",null,"'+stubs.get(id.slice(8))+'"));}';}}],define:{'process.env.NODE_ENV':'"production"','import.meta.env.VITE_EXPO_BACKEND_TARGET':'"production"'},resolve:{alias:{react:path.join(root,'node_modules/react'),'react-dom':path.join(root,'node_modules/react-dom')}},build:{write:false,minify:false,lib:{entry:path.join(root,'scripts/fixtures/kshms-workspace-036-harness.jsx'),formats:['es'],name:'KsWorkspace',cssFileName:'ks-workspace'}}});
const output=(Array.isArray(bundle)?bundle[0]:bundle).output,js=output.find(x=>x.type==='chunk'&&x.isEntry).code,css=output.filter(x=>x.type==='asset'&&x.fileName.endsWith('.css')).map(x=>x.source).join('\n');
const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html; charset=utf-8');res.end('<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+'</style><div id="app"></div><script type="module">'+js.replaceAll('</script','<\\/script')+'</script>');});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']});
 const page=await browser.newPage(),errors=[],outbound=[];page.on('pageerror',error=>errors.push(error.message));
 await page.route('**/*',route=>{if(new URL(route.request().url()).hostname==='127.0.0.1')return route.continue();outbound.push(route.request().url());return route.abort('blockedbyclient');});
 await page.goto('http://127.0.0.1:'+server.address().port);await page.locator('.ks-daily-workspace:not([hidden])').waitFor();
 const tools=()=>page.getByRole('button',{name:'Verktøy og maler',exact:true});
 const drawer=()=>page.getByRole('dialog',{name:'KS/HMS-verktøy',exact:true});
 const daily=async()=>{if(await page.locator('.ks-daily-workspace:not([hidden])').count())return;if((await page.viewportSize()).width<=1000)await page.getByRole('combobox',{name:'Velg KS/HMS-visning'}).selectOption('');else await page.getByRole('button',{name:'Daglig arbeid',exact:true}).click();await page.locator('.ks-daily-workspace:not([hidden])').waitFor();};
 const render=async(role,empty=false)=>{const serial=await page.evaluate(({role,empty})=>window.qa.render(role,empty),{role,empty});await page.waitForFunction(serial=>window.qa.committed.serial===serial,serial);await page.locator('header.module-heading,.ks-heading').first().waitFor();};
 for(const role of ['manager','reader','personal'])for(const [width,height] of [[320,600],[390,600],[768,600],[1363,600],[1920,936]]){
  await page.setViewportSize({width,height});await render(role);
  if(role!=='personal')await daily();
  eq(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,role+'/'+width+' document width');
  const module=page.locator('.ks-module').first();eq(await module.evaluate(node=>node.scrollWidth<=node.clientWidth+1),true,role+'/'+width+' native workspace width');
  const controls=await module.locator('button:visible').evaluateAll(nodes=>nodes.map(node=>({text:node.textContent.trim(),w:node.getBoundingClientRect().width,h:node.getBoundingClientRect().height,font:parseFloat(getComputedStyle(node).fontSize)})));
  eq(controls.every(node=>node.w>=43.99&&node.h>=43.99),true,role+'/'+width+' 44px actions '+JSON.stringify(controls));eq(controls.filter(node=>node.text).every(node=>node.font>=16),true,role+'/'+width+' readable action text');
  if(role!=='personal'){
   eq(await page.locator('.ks-daily-controls,.ks-daily-followups').count(),2,role+'/'+width+' controls and follow-up share actual workspace');
   eq(await page.locator('.ks-workspace-link').evaluate(node=>node.getBoundingClientRect().height<=48),true,role+'/'+width+' complete control link stays on one line');
   const geometry=await page.locator('.ks-daily-controls,.ks-daily-followups').evaluateAll(nodes=>nodes.map(node=>({x:node.getBoundingClientRect().x,y:node.getBoundingClientRect().y})));
   eq(width>1000?geometry[1].x>geometry[0].x:geometry[1].y>geometry[0].y,true,role+'/'+width+' sketch desktop columns / stacked mobile');
   eq(await page.getByText('Fjordtun 12',{exact:true}).count(),0,'no invented sketch project');
   await tools().click();await drawer().waitFor();
   const labels=await drawer().locator('.pd-workspace-tool-action').allTextContents();const expected=kshmsNavigationGroups({canManage:role==='manager',pendingCount:1}).flatMap(group=>group.items.map(([,label])=>label));eq(labels,expected,role+'/'+width+' exact native destinations and role gates');
   const rect=await drawer().evaluate(node=>{const r=node.getBoundingClientRect();return{x:r.x,right:r.right,width:r.width,height:r.height};});eq(Math.abs(rect.right-width)<2,true,role+'/'+width+' tools dock at right');eq(rect.width<=Math.min(680,width)+1,true,role+'/'+width+' original 680px drawer');
   await page.keyboard.press('Escape');await drawer().waitFor({state:'hidden'});eq(await tools().evaluate(node=>node===document.activeElement),true,role+'/'+width+' tools focus return');
  }else{
   eq(await tools().count(),0,'personal handbook does not expose management tools');eq(await page.locator('.ks-workspace-phases button').allTextContents(),['Min personalhåndbok','Les og bekreft (1)'],'personal-only exact native destinations');
   const search=page.getByRole('searchbox',{name:'Søk i min personalhåndbok',exact:true});eq((await search.boundingBox()).y<1000,true,'personal/'+width+' search before long explanations');eq((await page.locator('.ks-personal-routine>summary').boundingBox()).y<1200,true,'personal/'+width+' first actual routine before long explanations');
   const bulkInfo=page.getByText('Om samlet bekreftelse',{exact:true});await bulkInfo.click();eq(await page.getByText(/Samlet bekreftelse gjelder alle aktive utgaver/).isVisible(),true,'native bulk explanation remains accessible');await bulkInfo.click();
   const handbookInfo=page.getByText('Om personalhåndboka og PDF',{exact:true});await handbookInfo.click();eq(await page.getByRole('button',{name:'Last ned hele personalhåndboka (PDF)',exact:true}).isVisible(),true,'native handbook explanation and PDF remain accessible');await handbookInfo.click();
   await page.getByRole('button',{name:'Se og bekreft alle 1 rutineutgaver',exact:true}).click();eq(await page.locator('.ks-bulk-ack .ks-selected-list>li').count(),1,'actual own confirmation retains exact edition list');eq(await page.locator('.ks-bulk-ack input[type=checkbox]').isChecked(),false,'opening own confirmation never checks consent');await page.getByRole('button',{name:'Avbryt',exact:true}).click();
  }
  if(outputDir){fs.mkdirSync(outputDir,{recursive:true});await page.screenshot({path:path.join(outputDir,role+'-'+width+'.png'),fullPage:true});}
 }
 await page.setViewportSize({width:1363,height:600});await render('manager');await daily();
 await page.getByRole('region',{name:'Daglig arbeid og kontroller'}).getByText('Vis oppgaver',{exact:true}).click();
 await page.getByRole('button',{name:/Vernerunde: QA Kontroll av arbeidssted/}).click();
 const execution=page.getByRole('dialog',{name:'Vernerunde / kontroll',exact:true});await execution.waitFor();await execution.getByLabel('Navn',{exact:true}).fill('QA faktisk lokal kontrollkladd');
 eq(await execution.evaluate(node=>{const r=node.getBoundingClientRect();return Math.abs(r.right-innerWidth)<2&&r.width<=681&&r.height<=innerHeight+1;}),true,'actual control uses 680px right panel');
 await page.keyboard.press('Escape');await execution.waitFor({state:'hidden'});
 await tools().click();await drawer().getByRole('button',{name:'SJA',exact:true}).click();await page.getByRole('button',{name:'Ny SJA',exact:true}).waitFor();await page.getByRole('button',{name:'Ny SJA',exact:true}).click();
 const sja=page.getByRole('dialog',{name:'Sikker jobbanalyse',exact:true});await sja.waitFor();const task=sja.locator('[data-sja-field="task"]');await task.fill('QA behold egen arbeidsbeskrivelse');await task.evaluate(node=>window.qa.taskNode=node);
 eq(await sja.evaluate(node=>{const r=node.getBoundingClientRect();return Math.abs(r.right-innerWidth)<2&&r.width<=681&&r.height<=innerHeight+1;}),true,'actual SJA uses right panel');
 await page.evaluate(()=>document.querySelector('.ks-workspace-phases button').click());await sja.waitFor({state:'hidden'});eq(await page.locator('.ks-daily-workspace:not([hidden])').count(),1,'daily work hides native portals after deliberate view change');
 await tools().click();await drawer().getByRole('button',{name:'SJA',exact:true}).click();await sja.waitFor();eq(await task.inputValue(),'QA behold egen arbeidsbeskrivelse','same native SJA draft survives daily work return');
 await page.keyboard.press('Escape');await sja.waitFor({state:'hidden'});
 await tools().click();await drawer().getByRole('button',{name:'Oppstart og tilgang',exact:true}).click();const setup=page.getByLabel('Aktiviteter – hva gjør dere?',{exact:true});await setup.fill('QA behold egen oppstartstekst');await setup.evaluate(node=>window.qa.setupNode=node);await daily();
 await tools().click();await drawer().getByRole('button',{name:'Oppstart og tilgang',exact:true}).click();eq(await setup.inputValue(),'QA behold egen oppstartstekst','setup draft retained');eq(await setup.evaluate(node=>node===window.qa.setupNode),true,'daily overview preserves actual inline editor DOM');
 await tools().click();await page.evaluate(()=>window.qa.render('reader'));await drawer().waitFor({state:'hidden'});eq(await page.getByRole('button',{name:'Forvaltning',exact:true}).count(),0,'role downgrade removes management phase and old drawer');
 await page.evaluate(()=>{window.qa.holdCompany='91000000-0000-4000-8000-000000000001';window.qa.render('manager',false,'91000000-0000-4000-8000-000000000001');});await page.waitForFunction(()=>window.qa.pending.length>0);await page.evaluate(()=>window.qa.render('manager',false,'91000000-0000-4000-8000-000000000002'));await page.getByRole('heading',{name:'KS/HMS',exact:true}).waitFor();await page.evaluate(()=>window.qa.release());eq(await page.locator('header.module-heading').textContent().then(text=>text.includes('QA Firma B')),true,'late prior-company response cannot restore old company');
 await render('manager');await daily();await page.evaluate(()=>{history.replaceState({},'', '?kshmsVersion=93000000-0000-4000-8000-000000000001&kshmsCompany='+window.qa.current.company_id);window.qa.remount();});
 await page.getByRole('button',{name:'Åpne rutinen fra e-posten',exact:true}).waitFor();eq(await page.locator('[aria-label="Velg KS/HMS-visning"]').inputValue(),'reading','new authorized email intent wins remembered daily overview');eq(await page.locator('.ks-daily-workspace:not([hidden])').count(),0,'email destination is visible without another phase action');
 await page.evaluate(()=>history.replaceState({},'', '?kshmsReview='+window.qa.current.company_id+'&kshmsCompany='+window.qa.current.company_id));await render('reader');await page.locator('.ks-native-workspace:not([hidden])').waitFor();eq(await page.locator('[aria-label="Velg KS/HMS-visning"]').inputValue(),'reading','review email cannot open manager destination for reader');eq(await page.getByRole('button',{name:'Forvaltning',exact:true}).count(),0,'reader email retains native role gate');await page.evaluate(()=>history.replaceState({},'', '/'));
 await render('manager',true);await daily();eq(await page.getByText('QA Kontroll av arbeidssted',{exact:true}).count(),0,'empty live source has no invented check');eq(await page.getByText('Dine rutiner og bekreftelser',{exact:true}).count(),1,'empty routine source remains honest and actionable');
 eq(await page.evaluate(()=>window.qa.calls.some(call=>/command|publish|assign$/.test(call.name))),false,'navigation, reading and typing send no commands');eq(outbound,[],'all external transport blocked');eq(errors,[],'no runtime errors');
 console.log('KS workspace 03.6: '+checks+' Chromium checks PASS; 3 role contexts ×5 widths, exact native destinations, scoped actual tasks, right panels, SJA/setup draft and portal preservation, role/company/late-response gates. Transport mocked; other native destinations are mount adapters and retain their existing suites.');
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
