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
  const styles=await page.locator('.time-workspace,.time-editor,.time-setup').evaluateAll(nodes=>nodes.flatMap(node=>[...node.querySelectorAll('button,input:not([type="checkbox"]):not([type="radio"]),select,textarea')]).filter(n=>n.checkVisibility()).map(n=>({name:n.getAttribute('aria-label')||n.textContent?.slice(0,45),height:n.getBoundingClientRect().height,font:parseFloat(getComputedStyle(n).fontSize)})));
  eq(styles.filter(n=>n.height<43.99||n.font<16),[],label+' native controls remain readable '+width);
 }};
 await measure('own week');await page.getByRole('button',{name:'Ny registrering',exact:true}).click();await page.getByLabel('Merknad',{exact:true}).fill('Bevart usendt time- og utleggstekst');
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
