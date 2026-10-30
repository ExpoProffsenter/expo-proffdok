import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=process.cwd(),output=process.env.KS_SUBFLOW_036_SCREENSHOTS;
if(output)fs.mkdirSync(output,{recursive:true});
let checks=0,browser;const eq=(actual,expected,label)=>{assert.deepEqual(actual,expected,label);checks++;};
const built=await build({root,configFile:false,logLevel:'silent',plugins:[react(),{name:'ks-transport-only',enforce:'pre',resolveId(id){if(id.endsWith('/kshmsAccess.js'))return '\0ks-rpc';if(id.endsWith('/appSupabaseClientRegistry.js'))return '\0ks-client';},load(id){if(id==='\0ks-rpc')return 'export const kshmsRpc=(...args)=>window.rpc(...args);';if(id==='\0ks-client')return 'export const getAppSupabaseClient=()=>null;';}}],resolve:{alias:{react:path.join(root,'node_modules/react'),'react-dom':path.join(root,'node_modules/react-dom')}},define:{'process.env.NODE_ENV':'"production"','import.meta.env.VITE_EXPO_BACKEND_TARGET':'"sandbox"'},build:{write:false,minify:false,target:'esnext',lib:{entry:path.join(root,'scripts/fixtures/kshms-subflows-036-harness.jsx'),formats:['es'],name:'KsSubflows036',cssFileName:'ks-subflows036'}}});
const items=(Array.isArray(built)?built[0]:built).output,entry=items.find(item=>item.type==='chunk'&&item.isEntry).fileName,chunks=new Map(items.filter(item=>item.type==='chunk').map(item=>[item.fileName,item.code])),css=items.filter(item=>item.fileName.endsWith('.css')).map(item=>item.source).join('\n');
const server=http.createServer((req,res)=>{const name=new URL(req.url,'http://127.0.0.1').pathname.slice(1);if(chunks.has(name)){res.setHeader('Content-Type','text/javascript; charset=utf-8');res.end(chunks.get(name));return;}res.setHeader('Content-Type','text/html; charset=utf-8');res.end('<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+'</style><div id="app"></div><script type="module" src="/'+entry+'"></script>');});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const seen=[];
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']});
 const page=await browser.newPage(),errors=[],outbound=[];page.setDefaultTimeout(10000);
 page.on('pageerror',e=>{errors.push(e.message);console.error(e.message);});page.on('dialog',d=>d.accept());
 await page.route('**/*',route=>{if(new URL(route.request().url()).hostname==='127.0.0.1')return route.continue();outbound.push(route.request().url());return route.abort();});
 await page.goto('http://127.0.0.1:'+server.address().port);
 const panel=()=>page.getByRole('dialog');
 const render=async(kind,closed=false,saved=false)=>{const serial=await page.evaluate(({kind,closed,saved})=>window.qa.render(kind,closed,saved),{kind,closed,saved});await page.waitForFunction(serial=>window.qa.committed===serial,serial);};
 const inspect=async(label)=>{
  seen.push(label);
  const geometry=await panel().evaluate(n=>{const r=n.getBoundingClientRect(),s=getComputedStyle(n),h=getComputedStyle(n.querySelector('header'));return {right:Math.abs(r.right-innerWidth)<2,width:r.width<=Math.min(680,innerWidth)+1,height:Math.abs(r.height-innerHeight)<2,radius:s.borderRadius,header:h.backgroundColor,overflow:n.scrollWidth<=n.clientWidth+1};});
  eq(geometry,{right:true,width:true,height:true,radius:'0px',header:'rgb(15, 34, 45)',overflow:true},label+' shared 03.6 panel');
  const bad=await panel().evaluate(n=>[...n.querySelectorAll('button,summary,input:not([type=checkbox]):not([type=radio]),select,textarea')].filter(n=>n.checkVisibility()).flatMap(n=>{const r=n.getBoundingClientRect(),s=getComputedStyle(n);return parseFloat(s.fontSize)<16||r.height<43.99?[{tag:n.tagName,text:n.textContent.slice(0,60),font:s.fontSize,height:r.height}]:[];}));
  eq(bad,[],label+' 16px and 44px actual controls');
  eq(await panel().evaluate(n=>n.querySelector('.deviation-dialog-body').scrollWidth<=n.querySelector('.deviation-dialog-body').clientWidth+1),true,label+' body fits');
  eq(await panel().locator('.ks-case-closure,.ks-case-files,.ks-case-history,.sja-section,.sja-step,.sja-signing,.ks-execution-point,.ks-risk-phase,.ks-execution-completion').evaluateAll(nodes=>nodes.filter(n=>n.checkVisibility()).map(n=>{const s=getComputedStyle(n);return {radius:s.borderRadius,border:s.borderTopWidth,background:s.backgroundColor};}).filter(s=>s.radius!=='8px'||s.border!=='1px'||s.background!=='rgb(255, 255, 255)')),[],label+' shared native subsection frame');
  if(output)await page.screenshot({path:path.join(output,label+'.png')});
 };
 for(const [width,height] of [[1363,700],[1920,936],[768,600],[390,600],[320,480]]){
  await page.setViewportSize({width,height});
  for(const kind of ['ruh','sja','round','risk']){
   await render(kind);
   let start=page.getByRole('button',{name:{ruh:'Registrer RUH',sja:'Ny SJA',round:'Ny vernerunde / kontroll',risk:'Ny risikovurdering'}[kind],exact:true});await page.waitForFunction(name=>[...document.querySelectorAll('button')].some(n=>n.textContent===name&&!n.disabled),{ruh:'Registrer RUH',sja:'Ny SJA',round:'Ny vernerunde / kontroll',risk:'Ny risikovurdering'}[kind]);if(kind==='sja'&&await page.locator('.sja-intro').getByRole('button',{name:'Fortsett lokal kladd',exact:true}).count())start=page.locator('.sja-intro').getByRole('button',{name:'Fortsett lokal kladd',exact:true});await start.click();await panel().waitFor();
   await inspect(kind+'-'+width);
   if(kind==='ruh'&&width===1363){await panel().getByRole('button',{name:'Lagre RUH for oppfølging',exact:true}).click();eq(await panel().getByText('Dette mangler før du kan registrere RUH',{exact:true}).isVisible(),true,'required RUH fields explained before transport');await inspect('ruh-required-'+width);}
   const input=panel().locator('textarea').first();await input.fill('QA lokal tekst '+kind);const handle=await input.elementHandle();
   const disclosures=panel().locator('details>summary');
   for(let i=0;i<await disclosures.count();i++){
    const summary=disclosures.nth(i);await summary.click();await inspect(kind+'-'+width+'-underpunkt-'+i);await summary.click();
   }
   eq(await input.inputValue(),'QA lokal tekst '+kind,kind+' '+width+' original field text retained');eq(await input.evaluate((node,original)=>node===original,handle),true,kind+' '+width+' same original field DOM');
   await page.keyboard.press('Escape');await panel().waitFor({state:'hidden'});eq(await start.evaluate(n=>n===document.activeElement),true,kind+' '+width+' focus returned');
  }
  for(const kind of ['sja','round','risk']){
   await render(kind,false,true);
   if(kind==='sja')await page.locator('.sja-list-row').click();else await page.getByRole('button',{name:'Åpne dokumentasjon',exact:true}).click();
   await panel().waitFor();await inspect(kind+'-read-only-'+width);
   eq(await panel().locator('fieldset:disabled').count()>0,true,kind+' completed documentation keeps disabled native fields');
   await page.keyboard.press('Escape');await panel().waitFor({state:'hidden'});
  }
  for(const closed of [false,true]){
   await render('ruh',closed);if(closed)await page.getByRole('button',{name:'Lukkede (1)',exact:true}).click();await page.locator('.ks-case-row').click();await panel().waitFor();await inspect('ruh-'+(closed?'closed':'saved')+'-'+width);
   if(!closed)eq(await panel().getByRole('button',{name:'Lagre og lukk RUH',exact:true}).isDisabled(),true,'reading never confirms closure');
   else eq(await panel().getByRole('button',{name:'Lagre uten å lukke',exact:true}).count(),0,'closed snapshot stays read only');
   const history=panel().locator('.ks-case-history details>summary');await history.click();await inspect('ruh-history-'+closed+'-'+width);await history.click();
   if(closed){await panel().getByText('Åpne saken igjen',{exact:true}).click();await inspect('ruh-reopen-'+width);eq(await panel().getByRole('button',{name:'Lagre gjenåpning',exact:true}).isDisabled(),true,'reading never reopens a case');}
   await page.keyboard.press('Escape');await panel().waitFor({state:'hidden'});
  }
 }
 eq((await page.evaluate(()=>window.qa.calls)).filter(c=>/command|notify|publish|upload|signed|close/.test(c.name)),[],'no commands in native design sweep');eq(await page.evaluate(()=>window.qa.unexpected),[],'every native read contract explicit');eq(outbound,[],'no external transport');eq(errors,[],'no browser errors');
 console.log(`PASS KS underflows 03.6: ${checks} assertions / ${seen.length} visited states and widths; actual RUH/SJA/round/risk, nested suggestions/checkpoints, saved/closed/history/reopen, original field DOM and focus, full late runtime CSS; synthetic reads only.`);
 if(process.env.KS_SUBFLOW_036_EVIDENCE)fs.writeFileSync(process.env.KS_SUBFLOW_036_EVIDENCE,JSON.stringify({checks,visited:seen,transport:'synthetic reads only',runtime_css:true},null,2)+'\n');
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
