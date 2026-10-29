import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {build} from 'vite';import react from '@vitejs/plugin-react';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'./qa/node_modules/playwright/index.mjs');
const root=process.cwd(),temp=fs.mkdtempSync(path.join(os.tmpdir(),'pro-order-browser-'));let browser,count=0;const eq=(a,b,m)=>{assert.deepEqual(a,b,m);count++;};

// Normalize only Chromium numerical noise (e.g.43.99997px for computed44px).
// The44px target remains; actual40/42px controls still fail.
async function assertDesignLayout(page,label){
 const frame=await page.locator('.pro-catalog-orders').evaluate(el=>({shadow:getComputedStyle(el).boxShadow,background:getComputedStyle(el).backgroundColor,title:parseFloat(getComputedStyle(el.querySelector('header h2')).fontSize),paired:(()=>{const cart=el.querySelector('.pro-order-cart'),work=el.querySelector('form,.pro-order-preview,.pro-order-receipt');if(!work)return true;const a=cart.getBoundingClientRect(),b=work.getBoundingClientRect();return innerWidth>=1100?b.left>=a.right-1&&Math.abs(a.top-b.top)<2:b.top>=a.bottom-1;})()}));
 eq(frame.shadow,'none','order uses shared open frame '+label);eq(frame.background,'rgba(0, 0, 0, 0)','order removes legacy outer card '+label);eq(frame.title>=29,true,'order retains shared readable title '+label);eq(frame.paired,true,'order work uses desktop columns / mobile stack '+label);
 const layout=await page.locator('.pro-catalog-orders').evaluate(el=>({count:[...el.querySelectorAll('button')].filter(b=>b.getClientRects().length).length,small:[...el.querySelectorAll('button,.pro-order-quantity input')].filter(b=>b.getClientRects().length).map(b=>({name:b.getAttribute('aria-label')||b.textContent.trim(),width:b.getBoundingClientRect().width,height:b.getBoundingClientRect().height})).filter(b=>b.width+0.001<44||b.height+0.001<44),overflow:[el,...el.querySelectorAll('.pro-order-cart,.pro-order-preview,.pro-order-fields')].filter(b=>b.getClientRects().length&&b.scrollWidth>b.clientWidth+1).map(b=>b.className)}));
 eq(layout.count>0,true,'visible native order actions measured '+label);
 eq(layout.small,[],'order buttons and quantity targets are at least 44px '+label);
 eq(layout.overflow,[],'no internal order overflow '+label);
}

try{
 const built=await build({root,configFile:false,logLevel:'silent',plugins:[react()],define:{'process.env.NODE_ENV':'"production"'},build:{write:false,minify:false,lib:{entry:path.join(root,'scripts/fixtures/pro-catalog-order-harness.jsx'),formats:['iife'],name:'ProOrdersQA',cssFileName:'pro-orders-qa'}}});
 const output=(Array.isArray(built)?built[0]:built).output,js=output.find(x=>x.type==='chunk'&&x.isEntry).code,css=output.filter(x=>x.type==='asset'&&x.fileName.endsWith('.css')).map(x=>x.source).join('\n');
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const width of [320,390,768,1366]){
  const page=await browser.newPage({viewport:{width,height:950},locale:'nb-NO'}),errors=[];page.on('pageerror',e=>{errors.push(e.message);console.log('PAGEERROR',e.message);});
  await page.route('**/*',r=>r.fulfill({contentType:r.request().url().endsWith('/bundle.js')?'text/javascript':'text/html',body:r.request().url().endsWith('/bundle.js')?js:'<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><div id="app" data-expo-app-shell="true"></div><style>'+css+'</style><script src="/bundle.js"></script>'}));
  await page.goto('https://orders-qa.example.invalid/');await page.getByRole('heading',{name:'Varesøk',exact:true}).waitFor();
  eq(await page.locator('.pro-catalog-orders>header').evaluate(el=>getComputedStyle(el).position),'static','header never overlaps fields');
  eq(await page.locator('nav button').allTextContents(),['Varesøk','Varebestilling'],'adjacent authorized menus');
  await page.getByPlaceholder('Søk og legg varer i bestillingen').fill('vare');await page.getByRole('button',{name:/QA Ø-vare.*eks/}).click();
  const quantity=page.getByLabel('Antall QA Ø-vare',{exact:true});
  await assertDesignLayout(page,'cart '+width);
  eq(await quantity.evaluate(el=>el===document.activeElement),true,'selected item focuses and selects quantity');
  await page.getByRole('button',{name:'Øk antall QA Ø-vare',exact:true}).click();eq(await quantity.inputValue(),'2','plus increases quantity');
  await page.getByRole('button',{name:'Reduser antall QA Ø-vare',exact:true}).click();eq(await quantity.inputValue(),'1','minus reduces quantity');
  eq(await page.getByRole('button',{name:'Reduser antall QA Ø-vare',exact:true}).isDisabled(),true,'minus cannot create zero');
  await quantity.fill('2,5');await quantity.press('ArrowUp');eq(await quantity.inputValue(),'3,5','keyboard increase preserves decimal comma');await quantity.press('ArrowDown');eq(await quantity.inputValue(),'2,5','keyboard decrease has no float noise');
  await quantity.press('Enter');const nextSearch=page.getByLabel('Søk etter neste vare',{exact:true});
  eq(await nextSearch.evaluate(el=>el===document.activeElement),true,'Enter opens and focuses new-item search');eq(await page.locator('.pro-order-cart article').count(),1,'search draft is not a ghost order line');
  await page.evaluate(()=>{window.qa.delay=120;});await nextSearch.fill('andre');await nextSearch.press('Enter');await page.getByLabel('Antall QA andre vare',{exact:true}).waitFor();
  eq(await page.getByLabel('Antall QA andre vare',{exact:true}).evaluate(el=>el===document.activeElement),true,'fast search Enter adds next item and focuses its quantity');eq(await quantity.inputValue(),'2,5','next item leaves previous quantity unchanged');
  await page.locator('.pro-order-cart article').filter({hasText:'QA andre vare'}).getByRole('button',{name:'Fjern',exact:true}).click();await page.evaluate(()=>{window.qa.delay=0;});
  await quantity.fill('0');await quantity.press('Enter');eq(await quantity.evaluate(el=>el===document.activeElement),true,'invalid quantity stays in its field');eq(await page.locator('.pro-order-cart article').count(),1,'invalid Enter never adds a blank line');
  await quantity.fill('99998,5');await page.getByRole('button',{name:'Øk antall QA Ø-vare',exact:true}).click();eq(await quantity.inputValue(),'99999','plus respects server maximum');eq(await page.getByRole('button',{name:'Øk antall QA Ø-vare',exact:true}).isDisabled(),true,'max disables plus');
  await quantity.fill('2,5');await page.getByRole('button',{name:'Se varebestilling (1)'}).click();
  await page.getByLabel('Mottakernavn',{exact:true}).fill('Expo QA');await page.getByLabel('E-post til mottaker').fill('orders@example.invalid');await page.getByRole('button',{name:'Lagre mottaker',exact:true}).click();await page.getByText('Mottakeren er lagret for firmaet.',{exact:true}).waitFor();eq(await page.getByLabel('Lagret mottaker').locator('option').count(),2);
  await page.getByLabel('Bestillingsreferanse').fill('0007');await page.getByLabel('Leveringsadresse').fill('QA gate 1');await page.getByLabel('Leveringstidspunkt',{exact:true}).selectOption('requested');await page.getByLabel('Ønsket leveringsdato').fill('2026-12-11');await page.getByLabel('Ønsket klokkeslett').fill('10:30');
  await page.evaluate(()=>{window.qa.delay=120;window.dispatchEvent(new Event('focus'));});await page.waitForFunction(()=>!document.querySelector('[aria-label="Varebestilling"]')?.getAttribute('aria-busy')?.includes('true'));
  eq(await page.getByLabel('Leveringsadresse').inputValue(),'QA gate 1','focus keeps draft');eq(await page.getByLabel('Antall QA Ø-vare',{exact:true}).inputValue(),'2,5');
  await assertDesignLayout(page,'delivery form '+width);
  fs.mkdirSync('/tmp/pro-order-screens',{recursive:true});await page.screenshot({path:'/tmp/pro-order-screens/form-'+width+'.png',fullPage:true});await page.getByRole('button',{name:'Se over bestillingen',exact:true}).click();await page.getByRole('heading',{name:'Se over bestillingen'}).waitFor();
  await assertDesignLayout(page,'preview '+width);
  eq((await page.locator('.pro-order-preview').innerText()).includes('10:30'),true,'delivery time in preview');eq((await page.locator('.pro-order-preview').innerText()).includes('buyer@example.invalid'),true,'confirmation to real buyer');
  await page.getByRole('button',{name:'Send bestilling',exact:true}).click();await page.getByRole('button',{name:'Prøv samme sending igjen'}).waitFor();
  eq(await page.getByLabel('Antall QA Ø-vare',{exact:true}).isDisabled(),true,'uncertain send freezes exact order');eq(await page.getByRole('button',{name:'Øk antall QA Ø-vare',exact:true}).isDisabled(),true,'uncertain send also freezes stepper');
  await page.reload();await page.getByRole('button',{name:'Se varebestilling (1)'}).click();await page.getByRole('button',{name:'Prøv samme sending igjen'}).click();await page.getByRole('heading',{name:'Bestillingen er sendt'}).waitFor();
  // Reload resets the synthetic provider, so the first retry is uncertain again.
  if(await page.getByRole('button',{name:'Prøv samme sending igjen'}).count()){await page.getByRole('button',{name:'Prøv samme sending igjen'}).click();}
  eq(await page.getByLabel('Antall QA Ø-vare',{exact:true}).isDisabled(),true);
  eq(await page.evaluate(()=>new Set(window.qa.sentIds).size),1,'durable same retry identity after reload');
  eq(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'no sideways scroll');
  fs.mkdirSync('/tmp/pro-order-screens',{recursive:true});await page.screenshot({path:'/tmp/pro-order-screens/sent-'+width+'.png',fullPage:true});
  await page.evaluate(()=>{window.qa.company='87000000-0000-4000-8000-000000000004';window.qa.contacts=[];window.dispatchEvent(new Event('expo-proffdok-work-profile'));});await page.getByText('Bestillingen er tom.',{exact:false}).waitFor();eq(await page.getByLabel('Antall QA Ø-vare',{exact:true}).count(),0,'company switch never reuses previous cart');
  await page.evaluate(()=>{window.qa.allowed=false;window.dispatchEvent(new Event('expo-proffdok-module-access'));});await page.getByText('Ingen katalogtilgang',{exact:true}).waitFor();eq(await page.locator('nav button').count(),0,'revocation hides menus');eq(await page.locator('.pro-catalog-orders').count(),0,'revocation clears private surface');eq(errors,[]);await page.close();
 }
 // Regression for the user's actual entry point: real Prissøk adapter, real menu and shortcut.
 for(const width of [320,390,768,1366]){
  const page=await browser.newPage({viewport:{width,height:950},locale:'nb-NO'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',r=>r.fulfill({contentType:r.request().url().endsWith('/bundle.js')?'text/javascript':'text/html',body:r.request().url().endsWith('/bundle.js')?js:'<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><div id="app" data-expo-app-shell="true"></div><style>'+css+'</style><script src="/bundle.js"></script>'}));
  await page.goto('https://orders-qa.example.invalid/?internal=1');
  await page.getByRole('heading',{name:'Varebestilling',exact:true}).waitFor();await page.locator('#expo-price-search-nav-button').waitFor();
  const labels=await page.locator('nav button').allTextContents(),index=labels.indexOf('Prissøk');
  eq(labels.slice(index,index+3),['Prissøk','Varebestilling','Firmaprofil'],'internal order directly below Prissøk before company profile');
  eq(labels.includes('Varesøk'),false,'no duplicate catalog menu for internal users');
  await page.locator('#expo-price-search-nav-button').click();await page.getByRole('heading',{name:'Prissøk',exact:true}).waitFor();
  await page.getByRole('button',{name:'Åpne varebestilling',exact:true}).click();await page.getByRole('heading',{name:'Varebestilling',exact:true}).waitFor();
  eq(await page.locator('#expo-price-search-inline').count(),0,'shortcut closes existing price-search surface');
  await page.getByPlaceholder('Søk og legg varer i bestillingen').fill('vare');await page.getByRole('button',{name:/QA Ø-vare.*eks/}).click();
  eq(await page.getByLabel('Antall QA Ø-vare',{exact:true}).inputValue(),'1','internal lookup adds actual item');
  await page.getByRole('button',{name:'Øk antall QA Ø-vare',exact:true}).click();eq(await page.getByLabel('Antall QA Ø-vare',{exact:true}).inputValue(),'2','internal stepper works');await page.getByLabel('Antall QA Ø-vare',{exact:true}).press('Enter');eq(await page.getByLabel('Søk etter neste vare').evaluate(el=>el===document.activeElement),true,'internal Enter focuses next search');
  await page.getByLabel('Antall QA Ø-vare',{exact:true}).fill('3');await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
  await page.waitForFunction(()=>!document.querySelector('[aria-label="Varebestilling"]')?.getAttribute('aria-busy')?.includes('true'));
  eq(await page.getByLabel('Antall QA Ø-vare',{exact:true}).inputValue(),'3','internal focus preserves quantity');
  await page.reload();await page.getByRole('heading',{name:'Varebestilling',exact:true}).waitFor();eq(await page.getByLabel('Antall QA Ø-vare',{exact:true}).inputValue(),'3','internal reload preserves order');await assertDesignLayout(page,'internal restored cart '+width);
  if(!await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)) console.error('Internal order overflow',width,await page.evaluate(()=>[...document.querySelectorAll('body *')].filter(el=>el.getClientRects().length).map(el=>({tag:el.tagName,cls:el.className,id:el.id,text:el.textContent.trim().slice(0,60),left:el.getBoundingClientRect().left,right:el.getBoundingClientRect().right,scroll:el.scrollWidth,client:el.clientWidth})).filter(el=>el.left<0||el.right>innerWidth+1||el.scroll>el.client+1).slice(0,18)));
  eq(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'internal order has no horizontal overflow');
  await page.screenshot({path:'/tmp/pro-order-screens/internal-'+width+'.png',fullPage:true});
  await page.evaluate(()=>{window.qa.allowed=false;window.dispatchEvent(new Event('expo-proffdok-module-access'));});
  await page.getByText('Ingen katalogtilgang',{exact:true}).waitFor();eq(await page.locator('nav [data-order-nav]').count(),0,'internal revoke removes order menu');
  eq(await page.locator('.pro-catalog-orders').count(),0,'internal revoke removes order surface');eq(errors,[],'internal menu/shortcut no runtime errors');await page.close();
 }
 console.log(`Pro catalog order browser: ${count} assertions PASS, actual menus/components/hooks, 320/390/768/1366px with actual design CSS/app wrapper, 44px actions/internal overflow, recipients, date/time, focus, persistent uncertain retry and revoked access; no live transport.`);
}finally{await browser?.close();fs.rmSync(temp,{recursive:true,force:true});}
