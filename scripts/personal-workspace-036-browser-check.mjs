import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=process.cwd(),output=process.env.PERSONAL_036_SCREENSHOTS||'/tmp/proffdok-personal-036';
fs.mkdirSync(output,{recursive:true});
let checks=0,browser;
const eq=(a,b,label)=>{assert.deepEqual(a,b,label);checks++;};
const result=await build({root,configFile:false,logLevel:'silent',plugins:[react(),{name:'qa-client-boundary',enforce:'pre',resolveId(id){if(id.endsWith('/appSupabaseClientRegistry.js'))return '\0qa-client';},load(id){if(id==='\0qa-client')return 'export const getAppSupabaseClient=()=>window.client;';}}],build:{write:false,minify:false,cssCodeSplit:false,rollupOptions:{input:path.join(root,'scripts/fixtures/personal-workspace-036.jsx'),output:{inlineDynamicImports:true}}}});
const js=result.output.find(file=>file.type==='chunk').code,css=result.output.filter(file=>file.fileName.endsWith('.css')).map(file=>file.source).join('\n');
const reference=process.env.PROFFDOK_ORIGINAL_REFERENCE;
const server=http.createServer((req,res)=>{
 if(reference&&req.url.startsWith('/reference/')){
  const filename=path.resolve(reference,'dist',decodeURIComponent(req.url.slice('/reference/'.length).split('?')[0])||'index.html');
  if(!filename.startsWith(path.resolve(reference,'dist')+path.sep)||!fs.existsSync(filename)){res.statusCode=404;res.end();return;}
  res.setHeader('Content-Type',filename.endsWith('.js')?'application/javascript':filename.endsWith('.css')?'text/css':filename.endsWith('.svg')?'image/svg+xml':'text/html');res.end(fs.readFileSync(filename));return;
 }
 res.setHeader('Content-Type','text/html; charset=utf-8');res.end(`<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}\n.qa-fixture-header{height:64px;display:flex;align-items:center;padding:0 24px;background:#10212b;color:white;font:14px Arial}body{margin:0}[data-expo-app-shell=true]>main{padding:24px;max-width:1800px;margin:auto}@media(max-width:600px){[data-expo-app-shell=true]>main{padding:20px 16px}}</style><div id="app"></div><script type="module">${js.replaceAll('</script','<\\/script')}</script>`);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1363,height:936}}),errors=[],blocked=[];
 page.on('pageerror',error=>errors.push(error.message));page.setDefaultTimeout(12000);
 const base='http://127.0.0.1:'+server.address().port;
 await page.route('**/*',route=>route.request().url().startsWith(base+'/')?route.continue():(blocked.push(route.request().url()),route.abort('blockedbyclient')));
 await page.clock.setFixedTime(new Date('2026-10-29T12:00:00Z'));
 await page.goto(base+'/');
 await page.getByRole('heading',{name:'Din arbeidsdag',exact:true}).waitFor();
 await page.locator('.ks-progress-list button').first().waitFor({state:'attached'});
 eq(await page.getByRole('button',{name:'I dag',exact:true}).getAttribute('aria-pressed'),'true','I dag is the actual overview route');
 eq(await page.getByRole('button',{name:'Mine planer',exact:true}).count(),1,'explicit native plans tab');
 eq(await page.getByText('Fjordtun 12',{exact:true}).count(),0,'reference example project never becomes app data');
 eq(await page.getByText('15 timer denne uken',{exact:false}).count(),0,'no invented weekly total');
 eq(await page.locator('.personal-plans-card').getAttribute('open'),null,'I dag starts with a compact native plan disclosure');
 eq(await page.locator('.ks-progress-list button').first().isVisible(),false,'collapsed plan lists retain their actual native DOM');
 await page.locator('.personal-plans-heading').focus();await page.keyboard.press('Enter');await page.getByRole('button',{name:/QA Prosjektplan/}).waitFor();
 eq(await page.getByRole('button',{name:/QA Prosjektplan/}).count(),1,'opening the disclosure exposes the same native plan');
 await page.locator('.personal-plans-heading').focus();await page.keyboard.press('Space');
 eq(await page.locator('.personal-day-side').evaluate(side=>{const notices=side.querySelector('.personal-notices'),hr=side.querySelector('.personal-card-hr'),time=side.querySelector('.time-personal-card');return Boolean(notices.compareDocumentPosition(hr)&Node.DOCUMENT_POSITION_FOLLOWING)&&Boolean(hr.compareDocumentPosition(time)&Node.DOCUMENT_POSITION_FOLLOWING);}),true,'actual notices and follow-up precede the generic time entry in reading order');
 const matrices=[];
 for(const view of ['I dag','Mine planer'])for(const long of [false,true]){
  await page.getByRole('button',{name:view,exact:true}).click();
  await page.evaluate(long=>window.configure({long}),long);await page.locator('.ks-progress-list button').first().waitFor({state:'attached'});
  for(const [width,height] of [[320,936],[390,936],[768,936],[1363,936],[1920,936],[390,600],[1363,600]]){
   await page.setViewportSize({width,height});await page.evaluate(()=>scrollTo(0,0));
   const m=await page.locator('.personal-page').evaluate(element=>({width:element.clientWidth,scroll:element.scrollWidth,doc:document.documentElement.scrollWidth,viewport:innerWidth,buttons:[...element.querySelectorAll('button,summary')].filter(button=>button.getBoundingClientRect().height&&getComputedStyle(button).visibility!=='hidden').map(button=>({text:button.textContent.trim(),width:button.getBoundingClientRect().width,height:button.getBoundingClientRect().height,font:parseFloat(getComputedStyle(button).fontSize)}))}));
   matrices.push({view,long,width,height,...m});
   fs.writeFileSync(path.join(output,'geometry.json'),JSON.stringify(matrices,null,2));
   await page.screenshot({path:path.join(output,`${view==='Mine planer'?'plans-':''}${long?'long-':''}personal-${width}x${height}.png`),fullPage:true});
   eq(m.doc<=width,true,'document fits '+[long,width,height]);eq(m.scroll<=m.width+1,true,'native workspace fits '+[long,width,height]);
   for(const button of m.buttons){eq(button.height>=43.99&&button.width>=43.99,true,'target44 '+button.text+' '+width);eq(button.font>=16,true,'legible action '+button.text+' '+width);}
   if(width>=1363&&view==='I dag'){const main=await page.locator('.personal-day-main').boundingBox(),side=await page.locator('.personal-day-side').boundingBox();eq(Math.abs(main.y-side.y)<2,true,'work and personal follow-up share a row');eq(main.x+main.width<=side.x,true,'primary and secondary areas do not overlap');}
   if(view==='Mine planer')eq(await page.getByRole('button',{name:/QA Prosjektplan/}).isVisible(),true,'complete native plan lists remain exposed at '+width);
  }
 }
 await page.evaluate(()=>window.configure({long:false}));await page.setViewportSize({width:1363,height:936});
 await page.getByRole('button',{name:'Mine planer',exact:true}).click();
 eq(await page.getByRole('button',{name:'Mine planer',exact:true}).getAttribute('aria-pressed'),'true','plans route selected');
 eq(await page.getByRole('heading',{name:'Mine aktive planer',exact:true}).isVisible(),true,'plans route uses actual plan sources');
 eq(await page.locator('.personal-day-side').isVisible(),false,'plans route gives native lists the full workspace');
 await page.getByRole('region',{name:'Fra ProffDok-prosjekter',exact:true}).locator('.ks-progress-list button').click();await page.locator('dialog.ks-plan-expanded[open]').waitFor();
 await page.getByRole('button',{name:'Måned',exact:true}).click();
 await page.evaluate(()=>{window.qa.hold=true;window.dispatchEvent(new Event('focus'));});
 await page.waitForFunction(()=>window.qa.waiters.length>=3);
 eq(await page.getByRole('button',{name:'Måned',exact:true}).getAttribute('aria-pressed'),'true','actual plan view survives delayed foreground reads');
 await page.getByRole('button',{name:'Lukk planbygger',exact:true}).click();await page.evaluate(()=>window.release());
 await page.waitForFunction(()=>!document.querySelector('dialog.ks-plan-expanded[open]'));
 eq(await page.getByRole('button',{name:'Mine planer',exact:true}).getAttribute('aria-pressed'),'true','explicit plan close preserves chosen tab');
 await page.getByRole('button',{name:'I dag',exact:true}).click();
 await page.getByRole('button',{name:/Mine oppgaver i boligprosjekter/}).click();
 await page.getByRole('button',{name:'Åpne oppgave',exact:true}).click();await page.getByRole('dialog').getByText(/QA Kontroll av leveranse/).waitFor();
 await page.getByRole('dialog').getByRole('button',{name:/Lukk/}).first().click();
 await page.getByRole('button',{name:'Registrer inn',exact:true}).click();await page.getByRole('button',{name:'Registrer ut',exact:true}).waitFor();
 eq(await page.getByText('Innlogget',{exact:true}).isVisible(),true,'native presence confirms in-state');
 await page.getByRole('button',{name:'Registrer ut',exact:true}).click();await page.getByRole('button',{name:'Registrer inn',exact:true}).waitFor();checks++;
 await page.getByRole('button',{name:'Åpne nyeste svar',exact:true}).click();eq(await page.evaluate(()=>window.qa.opened.at(-1)),{support:'qa-support'},'same support case callback');
 await page.getByRole('button',{name:'Se mine oppfølginger',exact:true}).click();await page.locator('.hr-employee').waitFor();checks++;
 await page.getByRole('button',{name:'Personalhåndbok',exact:true}).click();await page.getByRole('button',{name:'Min personalhåndbok',exact:true}).waitFor();checks++;
 await page.getByRole('button',{name:'Profil og e-post',exact:true}).click();
 await page.getByLabel('Fullt navn',{exact:true}).fill('QA Ulagret navn');
 await page.getByRole('button',{name:'I dag',exact:true}).click();await page.getByRole('button',{name:'Mine planer',exact:true}).click();await page.getByRole('button',{name:'Profil og e-post',exact:true}).click();
 eq(await page.getByLabel('Fullt navn',{exact:true}).inputValue(),'QA Ulagret navn','unsent profile draft survives all new routes');
 await page.getByRole('button',{name:'Mine timer',exact:true}).click();await page.getByRole('button',{name:'Ny registrering',exact:true}).click();
 await page.getByLabel('Prosjektnummer, navn eller adresse',{exact:false}).fill('QA Ulagret time');
 await page.evaluate(()=>{Object.defineProperty(document,'visibilityState',{value:'hidden',configurable:true});document.dispatchEvent(new Event('visibilitychange'));});
 await page.waitForFunction(()=>!document.querySelector('.time-editor'));
 await page.evaluate(()=>{Object.defineProperty(document,'visibilityState',{value:'visible',configurable:true});document.dispatchEvent(new Event('visibilitychange'));});
 eq(await page.getByLabel('Prosjektnummer, navn eller adresse',{exact:false}).inputValue(),'QA Ulagret time','native unsent time entry survives hidden/visible return');
 await page.getByRole('button',{name:'Lukk registrering',exact:true}).click();
 await page.getByRole('button',{name:'I dag',exact:true}).click();
 await page.locator('.personal-plans-heading').click();
 await page.evaluate(()=>window.configure({empty:true}));await page.getByText('Du har ingen aktive prosjektplaner nå.',{exact:true}).waitFor();
 eq(await page.getByText('Du har ingen aktive fremdriftsplaner nå.',{exact:true}).isVisible(),true,'both real sources expose honest empty state');
 await page.screenshot({path:path.join(output,'personal-empty-1363.png'),fullPage:true});
 await page.evaluate(()=>window.configure({company:'qa-other'}));await page.getByRole('button',{name:'I dag',exact:true}).waitFor();
 eq(await page.getByRole('button',{name:'I dag',exact:true}).getAttribute('aria-pressed'),'true','company change does not retain prior tab');
 await page.getByRole('button',{name:'Mine planer',exact:true}).click();await page.evaluate(()=>window.configure({denied:true}));
 await page.waitForFunction(()=>!document.querySelector('.personal-plan-source'));
 eq(await page.locator('dialog.ks-plan-expanded[open]').count(),0,'revoked scope cannot expose old plan payload');
 eq(errors,[],'no browser runtime errors');eq(blocked,[],'no unexpected external transport attempted');
 fs.writeFileSync(path.join(output,'geometry.json'),JSON.stringify(matrices,null,2));
 if(reference){
  await page.goto(base+'/reference/index.html');await page.locator('[data-screen="personal"]').first().click();
  await page.screenshot({path:path.join(output,'reference-personal-1363.png'),fullPage:true});
 }
 console.log(`PASS Personal 03.6 workspace: ${checks} Chromium assertions; actual native components, five widths/short viewports/long titles, synthetic transport. Screenshots: ${output}`);
}finally{await browser?.close();server.close();}
