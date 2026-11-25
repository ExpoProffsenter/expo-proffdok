import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { build } from 'vite';
import react from '@vitejs/plugin-react';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = process.cwd(), temp = fs.mkdtempSync(path.join(os.tmpdir(),'option-quantity-'));
let browser, checks=0;
const eq=(a,b,label)=>{assert.deepEqual(a,b,label);checks++;};
const option={id:'spot',title:'Downlight',description:'Montert downlight',mainPostId:'rorlegger',mainPostTitle:'Rørlegger',optionType:'addition',amount:'2400',quantity:'1',unit:'stk',customerCanChooseQuantity:true,supplierProductNumber:'SPOT-1'};
const request={id:'QUANTITY-QA',isPublicOffer:true,publicToken:'synthetic',status:'Tilbud',offerTitle:'Syntetisk tilbud',offerIntro:'Velg eventuelle tillegg.',offerTotal:10000,offerLines:[{id:'base',mainPostId:'rorlegger',mainPostTitle:'Rørlegger',description:'Grunnarbeid',amount:'10000'}],offerOptions:[option,{...option,id:'fixed',title:'Fast tillegg',customerCanChooseQuantity:false,quantity:'2',amount:'100'}],offerVersions:[]};
fs.writeFileSync(path.join(temp,'entry.jsx'),`
import React,{useState}from'${root}/node_modules/react/index.js';import{createRoot}from'${root}/node_modules/react-dom/client.js';
import Customer from'${root}/src/modules/sales/components/SalesCustomerView.jsx';import Accepted from'${root}/src/modules/sales/components/SalesCustomerAcceptedView.jsx';import Builder from'${root}/src/modules/sales/components/SalesOfferBuilder.jsx';import Order from'${root}/src/modules/sales/components/StoreOfferOrderBasis.jsx';
import{applyCustomerOptionQuantities}from'${root}/src/modules/sales/utils/salesCustomerOptionQuantities.js';import{getOfferTotal}from'${root}/src/modules/sales/utils/salesUtils.js';
import'${root}/src/style.css';import'${root}/src/modules/app/mobileResponsive41A.css';import'${root}/src/modules/sales/sales.css';
window.__expoProffDokWorkProfile={active_company_id:"synthetic-company",active_company_profile:{companyName:"Ringside Rørleggerbedrift AS",companyId:"synthetic-company"}};
const fixture=${JSON.stringify(request)};function App(){const[mode,setMode]=useState('customer'),[form,setForm]=useState({name:'QA',confirmed:false,selectedOptionIds:[]}),[offer,setOffer]=useState({title:'Test',intro:'',lines:fixture.offerLines,options:fixture.offerOptions,reservations:'',included:'',excluded:'',customerSupplied:'',terms:'',paymentTerms:'10 dager',validityDays:'30'});const[expired,setExpired]=useState(false),[declined,setDeclined]=useState(false);window.form=form;window.offer=offer;
const chosen=applyCustomerOptionQuantities(fixture.offerOptions,form.selectedOptionQuantities).filter(o=>form.selectedOptionIds.includes(o.id));const accepted={...fixture,status:'Akseptert',isPublicOffer:false,acceptedAt:'2026-10-17T12:00:00Z',acceptedBy:'QA',acceptedOfferLines:fixture.offerLines,acceptedOptions:chosen,acceptedTotal:10000+getOfferTotal(chosen)};
return <><nav>{['customer','wetroom','general','accepted','order'].map(m=><button id={'mode-'+m} key={m} onClick={()=>setMode(m)}>{m}</button>)}<button id="expired" onClick={()=>setExpired(x=>!x)}>Utløpt</button><button id="declined" onClick={()=>setDeclined(x=>!x)}>Avvist</button></nav>{mode==='customer'?<Customer mode="customer-offer" hideDecisionControls selectedRequest={{...fixture,...(expired?{sentOfferAt:'2020-01-01',offerValidityDays:1}:{}),...(declined?{status:'Avvist'}:{})}} companyProfile={{companyName:'QA'}} acceptanceForm={form} setAcceptanceForm={setForm} toggleAcceptedOption={id=>setForm(f=>({...f,selectedOptionIds:f.selectedOptionIds.includes(id)?f.selectedOptionIds.filter(x=>x!==id):[...f.selectedOptionIds,id]}))} handleAcceptOffer={e=>e.preventDefault()}/>:mode==='accepted'?<Accepted selectedRequest={accepted}/>:mode==='order'?<Order request={accepted}/>:<Builder selectedRequest={{...fixture,isPublicOffer:false,source:mode==='general'?'Butikktilbud / varesalg':'Våtrom',directOffer:mode==='general'}} offerForm={mode==='general'?{...offer,lines:offer.lines.map(l=>({...l,mainPostId:'butikk-varer',mainPostTitle:'Varer'})),options:offer.options.map(o=>({...o,mainPostId:'butikk-varer',mainPostTitle:'Varer',storeParentProductId:'base'}))}:offer} updateOfferForm={(key,value)=>setOffer(f=>({...f,[key]:value}))} updateOfferOption={(id,key,value)=>setOffer(f=>({...f,options:f.options.map(o=>o.id===id?{...o,[key]:value}:o)}))} updateOfferLine={()=>{}} onBack={()=>{}} handleSaveOffer={e=>e?.preventDefault?.()} offerDraftSaveStatus="saved"/>}</>;}createRoot(document.getElementById('app')).render(<App/>);`);
try {
  const built=await build({root,configFile:false,logLevel:'silent',plugins:[react()],resolve:{alias:{react:path.join(root,'node_modules/react'),'react-dom':path.join(root,'node_modules/react-dom')}},define:{'process.env.NODE_ENV':'"production"'},build:{write:false,minify:false,lib:{entry:path.join(temp,'entry.jsx'),formats:['iife'],name:'QuantityQA',cssFileName:'quantity-qa'}}});
  const output=(Array.isArray(built)?built[0]:built).output,js=output.find(x=>x.type==='chunk'&&x.isEntry).code,css=output.filter(x=>x.type==='asset'&&x.fileName.endsWith('.css')).map(x=>x.source).join('\n');
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']});
  for(const width of [1363,768,390,320]){
    const page=await browser.newPage({viewport:{width,height:936},isMobile:width<761,hasTouch:width<761}),errors=[];page.setDefaultTimeout(5000);page.on('pageerror',e=>errors.push(e.message));
    await page.route('**/*',route=>route.fulfill({contentType:route.request().url().endsWith('/bundle.js')?'text/javascript':'text/html',body:route.request().url().endsWith('/bundle.js')?js:'<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><div id="app"></div><style>'+css+'</style><script src="/bundle.js"></script>'}));
    await page.goto('https://quantity.example.invalid');
    // Existing responsive main-post accordion must be opened on mobile.
    await page.locator('.sales-customer-option-card').first().waitFor({state:'attached'});
    for(const summary of await page.locator('.sales-expandable-offer-group:not([open]) > summary').all())await summary.click();
    const card=page.locator('.sales-customer-option-card').filter({has:page.getByRole('heading',{name:/Downlight/})});
    const qty=card.getByRole('textbox');await qty.waitFor();eq(await qty.isEnabled(),true,'unselected quantity is directly editable '+width);
    await qty.focus();eq(await card.getByRole('checkbox').isChecked(),false,'focus alone never selects an option '+width);
    const fixed=page.locator('.sales-customer-option-card').filter({has:page.getByRole('heading',{name:/Fast tillegg/})});
    await fixed.getByRole('checkbox').check();
    await card.getByRole('button',{name:/Øk antall/}).click();eq(await qty.inputValue(),'2','plus works before selecting option '+width);
    eq(await card.getByRole('checkbox').isChecked(),true,'plus selects option atomically '+width);
    eq(await fixed.getByRole('checkbox').isChecked(),true,'quantity change preserves other selected options '+width);
    await card.getByRole('button',{name:/Øk antall/}).click();eq(await page.evaluate(()=>window.form.selectedOptionIds.filter(id=>id==='spot').length),1,'repeated steps never duplicate selected id '+width);
    await card.getByRole('checkbox').uncheck();await qty.fill('4');
    eq(await card.getByRole('checkbox').isChecked(),true,'typing selects an unselected option '+width);
    await fixed.getByRole('checkbox').uncheck();await card.getByRole('checkbox').uncheck();
    eq(await page.locator('.sales-customer-option-quantity').count(),1,'fixed has no selector '+width);
    await card.getByRole('heading').click();eq(await card.getByRole('checkbox').isChecked(),true,'card body selects option '+width);await qty.fill('4');
    eq(await page.evaluate(()=>window.form.selectedOptionQuantities.spot),'4','input persists '+width);
    eq((await card.innerText()).includes('12\u00a0000'),true,'4 × 3000 includes VAT '+width);
    eq((await page.locator('.sales-customer-offer-app').innerText()).includes('24\u00a0500'),true,'base + selected total '+width);
    await card.getByRole('button',{name:/Øk antall/}).click();eq(await qty.inputValue(),'5','plus '+width);
    eq(await card.getByRole('checkbox').isChecked(),true,'step does not toggle selection '+width);
    await card.getByRole('button',{name:/Reduser antall/}).click();eq(await qty.inputValue(),'4','minus '+width);
    await qty.fill('0');eq(await card.getByRole('alert').isVisible(),true,'invalid count feedback '+width);
    await qty.fill('2,5');eq((await card.innerText()).includes('7\u00a0500'),true,'decimal comma '+width);
    await qty.fill('4');await card.getByRole('checkbox').uncheck();await card.getByRole('checkbox').check();eq(await qty.inputValue(),'4','reselect retains quantity '+width);
    await page.waitForTimeout(150);eq(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'no horizontal overflow '+width);
    if(process.env.OPTION_QUANTITY_QA_OUTPUT){fs.mkdirSync(process.env.OPTION_QUANTITY_QA_OUTPUT,{recursive:true});await page.screenshot({path:path.join(process.env.OPTION_QUANTITY_QA_OUTPUT,`customer-${width}.png`),fullPage:true});}
    await page.locator('#mode-accepted').click();eq((await page.locator('.sales-customer-accepted-app, .sales-app').innerText()).includes('4 stk'),true,'accepted quantity visible '+width);
    await page.locator('#mode-order').click();await page.getByRole('button',{name:/Åpne bestillingsgrunnlag/}).click();eq((await page.locator('#app').innerText()).includes('SPOT-1'),true,'accepted product identity retained '+width);eq(await page.locator('.storeOrderRow').filter({hasText:'SPOT-1'}).locator('.storeOrderQty strong').textContent(),'4','chosen count in order basis '+width);
    await page.getByRole('button',{name:'Lukk bestillingsgrunnlag'}).click();await page.locator('#mode-customer').click();await page.locator('#expired').click();eq(await page.locator('.sales-customer-option-quantity').count(),0,'expired selector locked '+width);await page.locator('#expired').click();await page.locator('#declined').click();eq(await page.locator('.sales-customer-option-quantity').count(),0,'declined selector locked '+width);await page.locator('#declined').click();
    await page.locator('#mode-wetroom').click();const choice=page.getByLabel('Kunden kan velge antall',{exact:true}).first();await choice.waitFor();eq(await choice.isChecked(),true,'wetroom opt-in '+width);await choice.uncheck();eq(await page.evaluate(()=>window.offer.options[0].customerCanChooseQuantity),false,'wetroom checkbox updates draft '+width);
    await page.locator('#mode-general').click();
    await page.waitForTimeout(150);
    await page.locator('.store-product-container > .store-group-heading').first().click();
    await page.locator('.store-option-card .store-group-heading').first().click();
    const generalChoice=page.getByLabel('Kunden kan velge antall',{exact:true}).first();
    await generalChoice.waitFor();eq(await generalChoice.isChecked(),false,'general editor reads saved opt-in '+width);await generalChoice.check();eq(await page.evaluate(()=>window.offer.options[0].customerCanChooseQuantity),true,'general editor opt-in persists '+width);
    eq(errors,[],'no runtime errors '+width);await page.close();
  }
  console.log(`PASS customer option quantities: ${checks} actual Chromium checks at four widths, real customer wrapper/editors/acceptance/order basis; synthetic state and no live requests.`);
} finally { await browser?.close();fs.rmSync(temp,{recursive:true,force:true}); }
await import('./sales-case-handler-browser-check.mjs');
