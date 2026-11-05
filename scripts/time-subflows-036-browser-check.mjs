import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=process.cwd();let browser,checks=0,views=0;const eq=(a,b,label)=>{assert.deepEqual(a,b,label);checks++;};
const bundled=await build({root,configFile:false,logLevel:'silent',plugins:[react(),{name:'time-read-boundary',enforce:'pre',resolveId(id){if(id.endsWith('/hrAccess.js'))return '\0time-reads';},load(id){if(id==='\0time-reads')return 'export const hrRpc=(name,args)=>window.timeApi(name,args);';}}],build:{write:false,minify:false,cssCodeSplit:false,rollupOptions:{input:path.join(root,'scripts/fixtures/time-subflows-036-harness.jsx'),output:{inlineDynamicImports:true}}}});
const js=bundled.output.find(x=>x.type==='chunk').code,css=bundled.output.filter(x=>x.fileName.endsWith('.css')).map(x=>x.source).join('\n');
const server=http.createServer((req,res)=>{res.setHeader('content-type','text/html;charset=utf-8');res.end('<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+'</style><div id="app"></div><script type="module">'+js.replaceAll('</script','<\\/script')+'</script>');});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']});const page=await browser.newPage(),errors=[],outbound=[];page.setDefaultTimeout(8000);page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():(outbound.push(route.request().url()),route.abort()));
 await page.goto('http://127.0.0.1:'+server.address().port);await page.getByRole('button',{name:'Ny registrering',exact:true}).waitFor();
 const measure=async label=>{for(const [width,height] of [[320,600],[390,360],[768,600],[1363,600],[1920,936]]){
  await page.setViewportSize({width,height});views++;
  eq(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,label+' page fits '+width);
  const styles=await page.locator('.time-workspace,.time-editor,.time-setup').evaluateAll(nodes=>nodes.flatMap(node=>[...node.querySelectorAll('button,summary,input:not([type="checkbox"]):not([type="radio"]),select,textarea')]).filter(n=>n.checkVisibility()).map(n=>({name:n.getAttribute('aria-label')||n.textContent?.slice(0,45),height:n.getBoundingClientRect().height,font:parseFloat(getComputedStyle(n).fontSize)})));
  eq(styles.filter(n=>n.height<43.99||n.font<16),[],label+' native controls remain readable '+width);
  eq(await page.locator('.time-config-section,.time-category,.time-day,.time-summary article,.time-history,.time-project-search,.time-upload,.time-archive-row,.time-review-row').evaluateAll(nodes=>nodes.filter(n=>n.checkVisibility()).every(n=>getComputedStyle(n).borderRadius==='8px')),true,label+' native card frames '+width);
 }};
 await measure('own week');
 // Opening also loads project choices and disables the original trigger.
 for(const width of [320,390,768,1363,1920]){
  await page.setViewportSize({width,height:936});
  for(const close of ['Avbryt','Lukk registrering','Escape']){
   const opener=page.getByRole('button',{name:'Ny registrering',exact:true}),node=await opener.elementHandle();
   await page.evaluate(()=>{window.qa.holdProjects=true;});await opener.click();await page.waitForFunction(()=>window.qa.projectWaiters.length>0);
   eq(await opener.isEnabled(),false,'time entry trigger disabled during real project read '+width+' '+close);
   await page.evaluate(()=>{window.qa.holdProjects=false;window.qa.projectWaiters.splice(0).forEach(resolve=>resolve());});await page.waitForFunction(()=>document.querySelector('.time-editor fieldset')?.disabled===false);
   if(close==='Escape')await page.keyboard.press('Escape');else await page.getByRole('dialog',{name:'Registrer timer eller utlegg',exact:true}).getByRole('button',{name:close,exact:true}).click();
   await page.waitForFunction(()=>!document.querySelector('.time-editor'));await page.waitForFunction(node=>document.activeElement===node,node);
   eq(await opener.evaluate((e,n)=>e===n&&e===document.activeElement,node),true,'time dialog returns exact source node '+width+' '+close);
  }
 }
 await page.setViewportSize({width:1363,height:936});
 // Escape remains available while the real project request is pending.
 for(const width of [320,390,768,1363,1920]){
  await page.setViewportSize({width,height:936});
  const opener=page.getByRole('button',{name:'Ny registrering',exact:true}),node=await opener.elementHandle();
  await page.evaluate(()=>{window.qa.holdProjects=true;});await opener.click();await page.waitForFunction(()=>window.qa.projectWaiters.length>0);
  await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('.time-editor'));
  eq(await opener.isEnabled(),false,'early Escape does not cancel pending project transport '+width);
  eq(await page.evaluate(()=>document.activeElement===document.body),true,'disabled trigger is not focused early '+width);
  await page.evaluate(()=>{window.qa.holdProjects=false;window.qa.projectWaiters.splice(0).forEach(resolve=>resolve());});
  await page.waitForFunction(node=>document.activeElement===node,node);
  eq(await opener.evaluate(e=>e===document.activeElement),true,'early Escape restores exact trigger after read '+width);
  await opener.click();await page.waitForFunction(()=>document.querySelector('.time-editor fieldset')?.disabled===false);
  eq(await page.getByLabel('Merknad',{exact:true}).inputValue(),'','early closed draft stays discarded '+width);await page.keyboard.press('Escape');
 }
 for(const action of ['keyboard','pointer','hidden workspace','hidden page']){
  const opener=page.getByRole('button',{name:'Ny registrering',exact:true});
  await page.evaluate(()=>{window.qa.holdProjects=true;});await opener.click();await page.waitForFunction(()=>window.qa.projectWaiters.length>0);await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('.time-editor'));
  if(action==='keyboard')await page.keyboard.press('Tab');
  if(action==='pointer')await page.getByRole('button',{name:'Vis hele uken',exact:true}).click();
  if(action==='hidden workspace')await page.getByRole('button',{name:'QA administrasjon',exact:true}).click();
  if(action==='hidden page')await page.evaluate(()=>{Object.defineProperty(document,'visibilityState',{configurable:true,value:'hidden'});document.dispatchEvent(new Event('visibilitychange'));});
  const focused=await page.evaluateHandle(()=>document.activeElement);
  await page.evaluate(()=>{window.qa.holdProjects=false;window.qa.projectWaiters.splice(0).forEach(resolve=>resolve());});
  await page.waitForFunction(()=>document.querySelector('.time-workspace')?.getAttribute('aria-busy')==='false');
  eq(await page.evaluate(node=>document.activeElement===node,focused),true,'late project read does not steal focus after '+action);
  eq(await page.locator('.time-editor').count(),0,'late project read does not reopen editor after '+action);
  if(action==='hidden workspace')await page.getByRole('button',{name:'QA egne timer',exact:true}).click();
  if(action==='hidden page'){await page.evaluate(()=>{delete document.visibilityState;document.dispatchEvent(new Event('visibilitychange'));});await page.waitForFunction(()=>document.querySelector('.time-workspace')?.getAttribute('aria-busy')==='false');}
  await focused.dispose();
 }
 await page.setViewportSize({width:1363,height:936});
 for(const label of ['Før timer i dag','Start tidtaking',/^Legg til /]){
  const opener=page.getByRole('button',{name:label}).filter({visible:true}).first(),node=await opener.elementHandle();await opener.click();await page.waitForFunction(()=>document.querySelector('.time-editor fieldset')?.disabled===false);await page.getByRole('button',{name:'Avbryt',exact:true}).click();await page.waitForFunction(()=>!document.querySelector('.time-editor'));await page.waitForFunction(node=>document.activeElement===node,node);eq(await opener.evaluate(e=>e===document.activeElement),true,'daily/timer/day entry has original focus '+String(label));
 }
 await page.getByRole('button',{name:'Ny registrering',exact:true}).click();await page.getByLabel('Merknad',{exact:true}).fill('Bevart usendt time- og utleggstekst');
 const note=await page.getByLabel('Merknad',{exact:true}).elementHandle();await measure('work entry');
 await page.getByLabel('Registreringsmåte',{exact:true}).selectOption('clock');await page.getByLabel('Fra klokken',{exact:true}).fill('22:00');await page.getByLabel('Til klokken',{exact:true}).fill('06:00');await measure('clock and overnight fields');
 const expense=await page.getByLabel('Kategori',{exact:true}).getByRole('option').evaluateAll(nodes=>nodes.find(n=>n.textContent.startsWith('Utlegg ·'))?.value);assert(expense,'native expense category');await page.getByLabel('Kategori',{exact:true}).selectOption(expense);await measure('expense and receipt fields');
 eq(await page.getByLabel('Merknad',{exact:true}).evaluate((n,handle)=>n===handle,note),true,'same editor DOM through units/mode changes');eq(await page.getByLabel('Merknad',{exact:true}).inputValue(),'Bevart usendt time- og utleggstekst','same unsent note');
 await page.keyboard.press('Escape');await page.getByRole('button',{name:'Ny registrering',exact:true}).waitFor();
 await page.getByRole('button',{name:'Vis historikk',exact:true}).click();await page.locator('.time-history').waitFor();await page.locator('.time-history>details>summary').first().click();await measure('history reader');
 await page.getByRole('button',{name:'QA administrasjon',exact:true}).click();await page.getByRole('button',{name:'Hent uker i perioden',exact:true}).waitFor();await measure('review period');
 await page.getByRole('button',{name:'Timeoppsett',exact:true}).click();await page.getByRole('button',{name:'Lagre timeoppsett',exact:true}).waitFor();await measure('settings categories and payroll fields');
 await page.getByRole('button',{name:'Lønnseksport',exact:true}).click();await page.getByRole('button',{name:'Opprett og last ned lønnsfil',exact:true}).waitFor();await measure('export and archive');
 eq(await page.evaluate(()=>window.qa.writes),[],'layout/navigation never submit/save/upload/export');eq(outbound,[],'no external traffic');eq(errors,[],'no browser errors');
 console.log(`Time subflows 03.6: ${checks} Chromium assertions PASS, ${views} native views; work/clock/expense/receipt fields/history/review/setup/export, late CSS and short screens; synthetic reads only, existing command/Storage tests remain separate.`);
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
