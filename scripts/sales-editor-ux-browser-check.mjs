import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=process.cwd(), temp=fs.mkdtempSync(path.join(os.tmpdir(),'sales-editor-ux-'));
let count=0;const eq=(a,b,label)=>{assert.deepEqual(a,b,label);count++;};
// Real editors inside the app shell + global/mobile/sales/design CSS; synthetic callbacks, no live transport.
fs.writeFileSync(path.join(temp,'entry.jsx'),`
import {APP_RUNTIME_STYLES} from '${root}/src/modules/app/appRuntimeStyles.js';
const runtime=document.createElement('style');runtime.textContent=APP_RUNTIME_STYLES;document.head.appendChild(runtime);

import React,{useState}from'${root}/node_modules/react/index.js';
import{createRoot}from'${root}/node_modules/react-dom/client.js';
import Inspection from'${root}/src/modules/sales/components/SalesInspectionNote.jsx';
import Sketch from'${root}/src/modules/sales/components/SalesBathroomSketch.jsx';
import Offer from'${root}/src/modules/sales/components/SalesOfferBuilderCore.jsx';
import'${root}/src/style.css';import'${root}/src/modules/app/mobileResponsive41A.css';import'${root}/src/modules/sales/sales.css';import'${root}/src/modules/ui/proffdokWorkspace.css';
const image='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000"><rect width="1600" height="1000" fill="teal"/></svg>');
const request={inspectionCustomerWishes:'Ønsker fra server',inspectionExistingConditions:'Forhold fra server',inspectionMeasurements:'2,42 x 2,15 m',inspectionObservations:'Observasjoner fra server',id:'QA-EDITOR',title:'Totalrenovering av bad med lange beskrivelser',customer:'QA kunde',address:'Testveien',surveyDate:'2026-10-16',surveyResponsible:'QA',inspectionPhotos:[{id:'photo',name:'Lagret bilde',path:'synthetic/photo',dataUrl:image},{id:'bathroom-sketch-QA-EDITOR',name:'Badskisse.svg',kind:'bathroom-sketch',path:'synthetic/sketch',dataUrl:image}]};
window.calls=[];const callback=name=>(...args)=>{window.calls.push({name,args:args.map(a=>a?.preventDefault?'event':a)});args[0]?.preventDefault?.();};
function App(){const[mode,setMode]=useState('inspection');const[revision,setRevision]=useState(0);const[form,setForm]=useState({customerWishes:'Ønsker fra server',existingConditions:'Forhold fra server',measurements:'2,42 x 2,15 m',observations:'Observasjoner fra server',photos:request.inspectionPhotos});const[offer,setOffer]=useState({title:'Syntetisk tilbud',intro:'Innledning',reservations:'Forbehold',included:'Inkludert',excluded:'Unntatt',customerSupplied:'Kundeleveranse',terms:'Vilkår',paymentTerms:'10 dager',validityDays:'30',lines:[{id:'l1',mainPostId:'rorlegger',mainPostTitle:'Rørlegger',description:'Montering av lang beskrevet vare',amount:'1000',quantity:'2',unit:'stk'}],options:[{id:'o1',mainPostId:'rorlegger',mainPostTitle:'Rørlegger',title:'Alternativ',description:'Bevart opsjon',amount:'200',optionType:'addition'}]});
window.showEmptySketch=()=>setMode('empty-sketch');window.openEmptyInspection=()=>{setForm(f=>({...f,customerWishes:'',existingConditions:'',measurements:'',observations:''}));setMode('inspection');setRevision(n=>n+1);};return <div data-expo-app-shell="true"><header style={{height:156}}>Expo ProffDok</header><button id="mode" onClick={()=>setMode(mode==='inspection'?'offer':'inspection')}>Bytt testflate</button><section className="sales-workspace-intro"><h2>Befaring / Tilbud / Aksept</h2><p>Modulintroduksjon</p></section><div data-sales-resume-workspace="true">{mode==='empty-sketch'?<Sketch value={null} onChange={callback('sketch')}/>:mode==='inspection'?<Inspection key={revision} selectedRequest={request} inspectionForm={form} loggedInResponsible="QA" onUpdateInspectionForm={(key,value)=>setForm(f=>({...f,[key]:value}))} onBack={callback('back')} onSubmit={callback('inspectionSave')} onRemoveInspectionPhoto={callback('removePhoto')}/>:<Offer selectedRequest={request} offerForm={offer} offerDraftSaveStatus="saved" offerTemplates={[{id:'template',name:'Eksisterende mal'}]} selectedOfferTemplateId="template" handleSelectOfferTemplate={callback('selectTemplate')} handleApplyOfferTemplate={callback('applyTemplate')} handleDeleteOfferTemplate={callback('deleteTemplate')} onBack={callback('back')} handleSaveOffer={callback('offerSave')} handleSaveOfferTemplate={callback('saveTemplate')} updateOfferForm={(key,value)=>setOffer(f=>({...f,[key]:value}))} updateOfferLine={callback('line')} updateOfferOption={callback('option')} addInspectionContextToOfferIntro={callback('inspectionIntro')} />}</div></div>;}
createRoot(document.getElementById('app')).render(<App/>);`);
// Execute the existing production viewer/anchor listener, without booting auth/app.
const bootstrap=fs.readFileSync('src/bootstrap.jsx','utf8');
const viewerStart=bootstrap.indexOf("const SALES_IMAGE_LIGHTBOX_ID =");
const viewerEnd=bootstrap.indexOf('function rewritePrivateDocumentAnchorForCurrentOrigin',viewerStart);
assert(viewerStart>=0&&viewerEnd>viewerStart,'Existing production image viewer must be present');
const imageViewerRuntime=bootstrap.slice(viewerStart,viewerEnd);
let browser;
try{
const built=await build({root,configFile:false,logLevel:'silent',plugins:[react()],resolve:{alias:{react:path.join(root,'node_modules/react'),'react-dom':path.join(root,'node_modules/react-dom')}},define:{'process.env.NODE_ENV':'"production"'},build:{write:false,minify:false,lib:{entry:path.join(temp,'entry.jsx'),formats:['iife'],name:'EditorQA',cssFileName:'editor-qa'}}});
const output=(Array.isArray(built)?built[0]:built).output,js=output.find(x=>x.type==='chunk'&&x.isEntry).code,css=output.filter(x=>x.type==='asset'&&x.fileName.endsWith('.css')).map(x=>x.source).join('\n');
browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']});
for(const width of [1920,1363,768,390,320]){
 const page=await browser.newPage({viewport:{width,height:936},isMobile:width<761,hasTouch:width<761});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',async d=>{eq(d.message().includes('ikke er lagret varig på server'),true,'unsaved inspection warning retained');await d.accept();});
 await page.route('**/*',route=>route.fulfill({contentType:route.request().url().endsWith('/bundle.js')?'text/javascript':'text/html',body:route.request().url().endsWith('/bundle.js')?js:'<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><div id="app"></div><style>'+css+'</style><script src="/bundle.js"></script>'}));
 await page.goto('https://editor-qa.example.invalid');await page.waitForTimeout(200);if(errors.length)console.log(errors);await page.getByLabel('Kundens ønsker').waitFor({timeout:3000});
 await page.waitForFunction(()=>!document.querySelector('textarea')?.disabled);
 await page.addScriptTag({content:imageViewerRuntime});
 eq(await page.getByLabel('Kundens ønsker').inputValue(),'Ønsker fra server','existing inspection text '+width);
 eq(await page.getByAltText('Lagret bilde').count(),1,'existing photo '+width);
 eq(await page.getByAltText('Lagret badskisse').count(),1,'stored sketch remains '+width);
 eq(await page.getByText('Den lagrede badskissen vises ovenfor.',{exact:true}).count(),1,'stored remote sketch has honest status '+width);eq(await page.getByText('Ingen badskisse registrert ennå.',{exact:true}).count(),0,'no contradictory empty sketch status '+width);
 const photoLink=page.getByRole('link',{name:'Åpne større bilde: Lagret bilde',exact:true});
 await page.getByLabel('Kundens ønsker').fill('Ulagret tekst mens bildet åpnes');
 const submitsBefore=await page.evaluate(()=>window.calls.filter(c=>c.name==='inspectionSave').length);
 await photoLink.click();
 let enlarged=page.getByRole('dialog',{name:'Lagret bilde',exact:true});await enlarged.waitFor();
 eq(await enlarged.getByRole('img').getAttribute('src'),await photoLink.getAttribute('href'),'same original saved image '+width);
 eq(await enlarged.getByRole('img').evaluate(el=>getComputedStyle(el).objectFit),'contain','full uncropped image '+width);
 eq(await enlarged.getByRole('img').evaluate(el=>el.getBoundingClientRect().width)>(await photoLink.locator('img').boundingBox()).width,true,'photo is actually larger than thumbnail '+width);
 eq(await page.getByLabel('Kundens ønsker').inputValue(),'Ulagret tekst mens bildet åpnes','viewing keeps unsaved note '+width);
 eq(await page.evaluate(()=>window.calls.filter(c=>c.name==='inspectionSave').length),submitsBefore,'opening never submits note '+width);
 eq(page.context().pages().length,1,'viewer stays in same tab '+width);
 await enlarged.getByRole('button',{name:'Lukk bilde',exact:true}).click();
 eq(await page.getByRole('dialog').count(),0,'close button works '+width);
 await photoLink.focus();await photoLink.press('Enter');await enlarged.waitFor();await page.keyboard.press('Escape');
 eq(await page.getByRole('dialog').count(),0,'keyboard opening and Escape '+width);
 await photoLink.click();await enlarged.waitFor();await page.mouse.click(2,2);
 eq(await page.getByRole('dialog').count(),0,'backdrop closes '+width);
 await page.getByRole('link',{name:'Åpne større bilde: Lagret badskisse',exact:true}).click();
 const sketchView=page.getByRole('dialog',{name:'Lagret badskisse',exact:true});await sketchView.waitFor();
 eq(await sketchView.getByRole('img').getAttribute('src'),await page.getByRole('link',{name:'Åpne større bilde: Lagret badskisse',exact:true}).getAttribute('href'),'saved sketch opens original '+width);
 await sketchView.getByRole('button',{name:'Lukk bilde',exact:true}).click();
 await page.evaluate(()=>{window.dispatchEvent(new Event('focus'));document.dispatchEvent(new Event('visibilitychange'));});
 eq(await page.getByLabel('Kundens ønsker').inputValue(),'Ulagret tekst mens bildet åpnes','close/focus keeps note '+width);
 await page.getByLabel('Kundens ønsker').fill('Ønsker fra server');

 for(const mode of ['inspection','offer']){
  if(mode==='offer'){await page.locator('#mode').click();await page.getByLabel('Tilbudstittel',{exact:true}).waitFor();}
  eq(await page.locator('.sales-workspace-intro').isVisible(),false,'redundant intro hidden '+mode+'/'+width);
  eq(await page.locator('.sales-editor-app .sales-header').evaluate(el=>getComputedStyle(el).position),'static','no sticky overlap '+mode+'/'+width);
  eq(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'no sideways scroll '+mode+'/'+width);
  const actions=await page.locator('.sales-editor-app .sales-form-actions>button,.sales-editor-app .sales-back-button').evaluateAll(nodes=>nodes.filter(el=>el.getBoundingClientRect().height>0).map(el=>{const r=el.getBoundingClientRect();return {label:el.textContent.trim(),width:r.width,height:r.height};}));
  eq(actions.length>=2,true,'existing save/back controls present '+mode+'/'+width);
  eq(actions.every(b=>b.width>=44&&b.height>=44),true,'save/back targets at least 44px '+mode+'/'+width+': '+JSON.stringify(actions));
  eq(await page.locator('.sales-editor-app').evaluate(el=>el.scrollWidth<=el.clientWidth+1),true,'editor has no internal sideways overflow '+mode+'/'+width);
  if(width===1920)eq(await page.locator('.sales-editor-app .sales-main').evaluate(el=>el.getBoundingClientRect().width>1180&&el.getBoundingClientRect().width<=1600),true,'editor content uses available desktop width '+mode);

  const cards=await page.locator('.sales-note-field').evaluateAll(nodes=>nodes.map(el=>({x:el.getBoundingClientRect().x,y:el.getBoundingClientRect().y,width:el.getBoundingClientRect().width})));
  eq(cards.length,4,'all note fields '+mode+'/'+width);
  eq(mode==='offer'?cards[1].y>cards[0].y:(width>760?Math.abs(cards[0].y-cards[1].y)<1:cards[1].y>cards[0].y),true,'offer full-width sections / original inspection layout '+mode+'/'+width);
  if(mode==='offer'){
   eq(await page.locator('.sales-offer-text-section').evaluateAll(nodes=>nodes.every(n=>!n.open)),true,'offer text starts compact '+width);
   for(const summary of await page.locator('.sales-offer-text-section > summary').all())await summary.click();
   eq(await page.locator('.sales-offer-text-section textarea').evaluateAll(nodes=>nodes.every(el=>el.getBoundingClientRect().height>=(innerWidth<=760?280:320)&&getComputedStyle(el).fontSize==='16px')),true,'expanded offer fields are large and readable '+width);
  }
  eq(await page.locator('.sales-note-field textarea').evaluateAll(nodes=>nodes.every(el=>el.getBoundingClientRect().height>=116&&getComputedStyle(el).resize==='vertical')),true,'roomy resizable fields '+mode+'/'+width);
  if(mode==='offer'){
   eq(await page.locator('.sales-offer-line').count()>0,true,'offer lines retained '+width);
   eq(await page.getByText('Bevart opsjon',{exact:true}).count()+await page.locator('input,textarea').evaluateAll(nodes=>nodes.filter(n=>n.value==='Bevart opsjon').length)>0,true,'option retained '+width);
   await page.getByRole('button',{name:'Bruk valgt mal',exact:true}).click();eq((await page.evaluate(()=>window.calls)).at(-1).name,'applyTemplate','template action '+width);
   await page.getByLabel('Dette er inkludert',{exact:true}).fill('Ny tilbudstekst\nAndre avsnitt med uferdig tekst');
   const section=page.locator('.sales-offer-text-section').filter({has:page.getByLabel('Dette er inkludert',{exact:true})});
   const field=page.getByLabel('Dette er inkludert',{exact:true});
   await field.evaluate(el=>{el.dataset.originalNode='retained';});
   await section.locator('summary').click();eq(await field.isVisible(),false,'collapse hides large editor '+width);
   eq((await section.locator('summary').innerText()).includes('Ny tilbudstekst'),true,'collapsed summary reflects latest text '+width);
   await page.evaluate(()=>{document.dispatchEvent(new Event('visibilitychange'));window.dispatchEvent(new Event('focus'));window.dispatchEvent(new Event('expo-proffdok-work-profile'));});
   await section.locator('summary').focus();await section.locator('summary').press('Enter');
   eq(await field.inputValue(),'Ny tilbudstekst\nAndre avsnitt med uferdig tekst','collapse/focus/reopen keeps entire unsaved text '+width);
   eq(await field.getAttribute('data-original-node'),'retained','collapse never unmounts controlled field '+width);
   eq(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'expanded note never overflows sideways '+width);
   await page.locator('#sales-offer-builder-form').getByRole('button',{name:'Lagre tilbud',exact:true}).click();eq((await page.evaluate(()=>window.calls)).at(-1).name,'offerSave','original save callback '+width);
  }
  if(process.env.EDITOR_QA_OUTPUT){fs.mkdirSync(process.env.EDITOR_QA_OUTPUT,{recursive:true});await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(process.env.EDITOR_QA_OUTPUT,mode+'-'+width+'.png'),fullPage:false});}
 }
 await page.locator('#mode').click();await page.waitForFunction(()=>!document.querySelector('textarea')?.disabled);await page.getByLabel('Kundens ønsker').fill('Ny befaringstekst');eq(await page.getByLabel('Kundens ønsker').inputValue(),'Ny befaringstekst','inspection updates '+width);
 await page.getByRole('button',{name:/Lagre befaringsnotat/}).click();eq((await page.evaluate(()=>window.calls)).at(-1).name,'inspectionSave','same inspection save '+width);
 await page.waitForFunction(()=>!Array.from(document.querySelectorAll('button')).find(b=>b.textContent.trim()==='Avbryt')?.disabled);await page.getByRole('button',{name:'Avbryt',exact:true}).click();eq((await page.evaluate(()=>window.calls)).at(-1).name,'back','same back '+width);
 await page.evaluate(()=>window.openEmptyInspection());await page.getByRole('button',{name:'Bruk teksten fra saken',exact:true}).waitFor();
 eq(await page.getByRole('button',{name:/Lagre befaringsnotat/}).isDisabled(),true,'empty local text cannot overwrite server without choice '+width);
 eq(await page.getByLabel('Kundens ønsker').inputValue(),'','local draft untouched before choice '+width);
 await page.getByRole('button',{name:'Bruk teksten fra saken',exact:true}).click();eq(await page.getByLabel('Kundens ønsker').inputValue(),'Ønsker fra server','explicit server text restored '+width);
 eq(await page.getByAltText('Lagret bilde').count(),1,'restore keeps photo '+width);eq(await page.getByAltText('Lagret badskisse').count(),1,'restore keeps sketch '+width);
 await page.evaluate(()=>window.openEmptyInspection());await page.getByRole('button',{name:'Behold tom lokal tekst',exact:true}).click();eq(await page.getByLabel('Kundens ønsker').inputValue(),'','explicit empty draft respected '+width);
 await page.waitForFunction(()=>!Array.from(document.querySelectorAll('button')).find(b=>b.textContent.includes('Lagre befaringsnotat'))?.disabled);
 eq(await page.getByRole('button',{name:/Lagre befaringsnotat/}).isDisabled(),false,'explicit local choice permits save '+width);
 await page.evaluate(()=>window.showEmptySketch());await page.getByText('Ingen badskisse registrert ennå.',{exact:true}).waitFor();eq(await page.getByText('Den lagrede badskissen vises ovenfor.',{exact:true}).count(),0,'empty native sketch keeps its own empty status '+width);
 eq(errors,[],'no page errors '+width);await page.close();
}
console.log('PASS Sales editor UX: '+count+' actual Chromium checks, real editors/global CSS, five widths, actual design shell and preserved callbacks/media.');
}finally{await browser?.close();fs.rmSync(temp,{recursive:true,force:true});}

// Keep the active general-offer editor in the same existing CI entry point.
// It has its own isolated state/transport fixture and real design styles.
await import('./sales-store-layout-browser-check.mjs');
