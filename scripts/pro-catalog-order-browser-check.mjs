import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {build} from 'vite';import react from '@vitejs/plugin-react';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'./qa/node_modules/playwright/index.mjs');
const root=process.cwd(),temp=fs.mkdtempSync(path.join(os.tmpdir(),'pro-order-browser-'));let browser,count=0;const eq=(a,b,m)=>{assert.deepEqual(a,b,m);count++;};
try{
 const built=await build({root,configFile:false,logLevel:'silent',plugins:[react()],define:{'process.env.NODE_ENV':'"production"'},build:{write:false,minify:false,lib:{entry:path.join(root,'scripts/fixtures/pro-catalog-order-harness.jsx'),formats:['iife'],name:'ProOrdersQA',cssFileName:'pro-orders-qa'}}});
 const output=(Array.isArray(built)?built[0]:built).output,js=output.find(x=>x.type==='chunk'&&x.isEntry).code,css=output.filter(x=>x.type==='asset'&&x.fileName.endsWith('.css')).map(x=>x.source).join('\n');
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const width of [390,1366]){
  const page=await browser.newPage({viewport:{width,height:950},locale:'nb-NO'}),errors=[];page.on('pageerror',e=>{errors.push(e.message);console.log('PAGEERROR',e.message);});
  await page.route('**/*',r=>r.fulfill({contentType:r.request().url().endsWith('/bundle.js')?'text/javascript':'text/html',body:r.request().url().endsWith('/bundle.js')?js:'<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><div id="app"></div><style>'+css+'</style><script src="/bundle.js"></script>'}));
  await page.goto('https://orders-qa.example.invalid/');await page.getByRole('heading',{name:'Varesøk',exact:true}).waitFor();
  eq(await page.locator('.pro-catalog-orders>header').evaluate(el=>getComputedStyle(el).position),'static','header never overlaps fields');
  eq(await page.locator('nav button').allTextContents(),['Varesøk','Varebestilling'],'adjacent authorized menus');
  await page.getByPlaceholder('Søk og legg varer i bestillingen').fill('vare');await page.getByRole('button',{name:/QA Ø-vare.*eks/}).click();
  await page.getByLabel('Antall QA Ø-vare').fill('2,5');await page.getByRole('button',{name:'Se varebestilling (1)'}).click();
  await page.getByLabel('Mottakernavn',{exact:true}).fill('Expo QA');await page.getByLabel('E-post til mottaker').fill('orders@example.invalid');await page.getByRole('button',{name:'Lagre mottaker',exact:true}).click();await page.getByText('Mottakeren er lagret for firmaet.',{exact:true}).waitFor();eq(await page.getByLabel('Lagret mottaker').locator('option').count(),2);
  await page.getByLabel('Bestillingsreferanse').fill('0007');await page.getByLabel('Leveringsadresse').fill('QA gate 1');await page.getByLabel('Leveringstidspunkt',{exact:true}).selectOption('requested');await page.getByLabel('Ønsket leveringsdato').fill('2026-12-11');await page.getByLabel('Ønsket klokkeslett').fill('10:30');
  await page.evaluate(()=>{window.qa.delay=120;window.dispatchEvent(new Event('focus'));});await page.waitForFunction(()=>!document.querySelector('[aria-label="Varebestilling"]')?.getAttribute('aria-busy')?.includes('true'));
  eq(await page.getByLabel('Leveringsadresse').inputValue(),'QA gate 1','focus keeps draft');eq(await page.getByLabel('Antall QA Ø-vare').inputValue(),'2,5');
  fs.mkdirSync('/tmp/pro-order-screens',{recursive:true});await page.screenshot({path:'/tmp/pro-order-screens/form-'+width+'.png',fullPage:true});await page.getByRole('button',{name:'Se over bestillingen',exact:true}).click();await page.getByRole('heading',{name:'Se over bestillingen'}).waitFor();
  eq((await page.locator('.pro-order-preview').innerText()).includes('10:30'),true,'delivery time in preview');eq((await page.locator('.pro-order-preview').innerText()).includes('buyer@example.invalid'),true,'confirmation to real buyer');
  await page.getByRole('button',{name:'Send bestilling',exact:true}).click();await page.getByRole('button',{name:'Prøv samme sending igjen'}).waitFor();
  eq(await page.getByLabel('Antall QA Ø-vare').isDisabled(),true,'uncertain send freezes exact order');
  await page.reload();await page.getByRole('button',{name:'Se varebestilling (1)'}).click();await page.getByRole('button',{name:'Prøv samme sending igjen'}).click();await page.getByRole('heading',{name:'Bestillingen er sendt'}).waitFor();
  // Reload resets the synthetic provider, so the first retry is uncertain again.
  if(await page.getByRole('button',{name:'Prøv samme sending igjen'}).count()){await page.getByRole('button',{name:'Prøv samme sending igjen'}).click();}
  eq(await page.getByLabel('Antall QA Ø-vare').isDisabled(),true);
  eq(await page.evaluate(()=>new Set(window.qa.sentIds).size),1,'durable same retry identity after reload');
  eq(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'no sideways scroll');
  fs.mkdirSync('/tmp/pro-order-screens',{recursive:true});await page.screenshot({path:'/tmp/pro-order-screens/sent-'+width+'.png',fullPage:true});
  await page.evaluate(()=>{window.qa.company='87000000-0000-4000-8000-000000000004';window.qa.contacts=[];window.dispatchEvent(new Event('expo-proffdok-work-profile'));});await page.getByText('Bestillingen er tom.',{exact:false}).waitFor();eq(await page.getByLabel('Antall QA Ø-vare').count(),0,'company switch never reuses previous cart');
  await page.evaluate(()=>{window.qa.allowed=false;window.dispatchEvent(new Event('expo-proffdok-module-access'));});await page.getByText('Ingen katalogtilgang',{exact:true}).waitFor();eq(await page.locator('nav button').count(),0,'revocation hides menus');eq(await page.locator('.pro-catalog-orders').count(),0,'revocation clears private surface');eq(errors,[]);await page.close();
 }
 // Regression for the user's actual entry point: real Prissøk adapter, real menu and shortcut.
 for(const width of [390,1366]){
  const page=await browser.newPage({viewport:{width,height:950},locale:'nb-NO'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',r=>r.fulfill({contentType:r.request().url().endsWith('/bundle.js')?'text/javascript':'text/html',body:r.request().url().endsWith('/bundle.js')?js:'<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><div id="app"></div><style>'+css+'</style><script src="/bundle.js"></script>'}));
  await page.goto('https://orders-qa.example.invalid/?internal=1');
  await page.getByRole('heading',{name:'Varebestilling',exact:true}).waitFor();await page.locator('#expo-price-search-nav-button').waitFor();
  const labels=await page.locator('nav button').allTextContents(),index=labels.indexOf('Prissøk');
  eq(labels.slice(index,index+3),['Prissøk','Varebestilling','Firmaprofil'],'internal order directly below Prissøk before company profile');
  eq(labels.includes('Varesøk'),false,'no duplicate catalog menu for internal users');
  await page.locator('#expo-price-search-nav-button').click();await page.getByRole('heading',{name:'Prissøk',exact:true}).waitFor();
  await page.getByRole('button',{name:'Åpne varebestilling',exact:true}).click();await page.getByRole('heading',{name:'Varebestilling',exact:true}).waitFor();
  eq(await page.locator('#expo-price-search-inline').count(),0,'shortcut closes existing price-search surface');
  await page.getByPlaceholder('Søk og legg varer i bestillingen').fill('vare');await page.getByRole('button',{name:/QA Ø-vare.*eks/}).click();
  eq(await page.getByLabel('Antall QA Ø-vare').inputValue(),'1','internal lookup adds actual item');
  await page.getByLabel('Antall QA Ø-vare').fill('3');await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
  await page.waitForFunction(()=>!document.querySelector('[aria-label="Varebestilling"]')?.getAttribute('aria-busy')?.includes('true'));
  eq(await page.getByLabel('Antall QA Ø-vare').inputValue(),'3','internal focus preserves quantity');
  await page.reload();await page.getByRole('heading',{name:'Varebestilling',exact:true}).waitFor();eq(await page.getByLabel('Antall QA Ø-vare').inputValue(),'3','internal reload preserves order');
  eq(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'internal order has no horizontal overflow');
  await page.screenshot({path:'/tmp/pro-order-screens/internal-'+width+'.png',fullPage:true});
  await page.evaluate(()=>{window.qa.allowed=false;window.dispatchEvent(new Event('expo-proffdok-module-access'));});
  await page.getByText('Ingen katalogtilgang',{exact:true}).waitFor();eq(await page.locator('nav [data-order-nav]').count(),0,'internal revoke removes order menu');
  eq(await page.locator('.pro-catalog-orders').count(),0,'internal revoke removes order surface');eq(errors,[],'internal menu/shortcut no runtime errors');await page.close();
 }
 console.log(`Pro catalog order browser: ${count} assertions PASS, actual menus/components/hooks, 390/1366px, recipients, date/time, focus, persistent uncertain retry and revoked access; no live transport.`);
}finally{await browser?.close();fs.rmSync(temp,{recursive:true,force:true});}
