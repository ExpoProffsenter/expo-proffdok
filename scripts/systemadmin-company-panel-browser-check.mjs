import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import {build} from 'vite';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=process.cwd(),temp=fs.mkdtempSync(path.join(os.tmpdir(),'company-panel-036-')),shots=path.join(os.tmpdir(),'proffdok-admin-panel-036');fs.mkdirSync(shots,{recursive:true});
let browser,server,checks=0;
const eq=(a,b,label)=>{assert.deepEqual(a,b,label);checks++;};
try{
 const entry=path.join(temp,'entry.js');
 fs.writeFileSync(entry,`import {installSystemAdminCompanyModalUx} from '${root}/src/modules/access/systemAdminCompanyModalUx.js';import '${root}/src/style.css';import '${root}/src/modules/ui/proffdokWorkspace.css';installSystemAdminCompanyModalUx();`);
 const built=await build({root,configFile:false,logLevel:'silent',build:{write:false,minify:false,lib:{entry,formats:['iife'],name:'CompanyPanelQa',cssFileName:'qa'}}});
 const output=(Array.isArray(built)?built[0]:built).output,js=output.find(x=>x.type==='chunk').code,css=output.filter(x=>x.fileName.endsWith('.css')).map(x=>x.source).join('\n');
 server=http.createServer((req,res)=>{res.setHeader('content-type','text/html; charset=utf-8');res.end(`<!doctype html><html lang="nb"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}body{margin:0}.qa-long-body{min-height:1300px}.company-access-body[hidden]{display:none}</style><div data-expo-app-shell="true"><section><h2>Systemadmin</h2><div class="item"><h3>Firmaer, brukere og tilganger</h3><div class="company-access-list"><div class="company-access-row"><button class="company-access-toggle"><b class="company-access-name">Syntetisk firma med et langt navn</b><span class="company-access-summary">2 brukere · kun test</span></button><div class="company-access-body" hidden><p>Firmaets eksisterende arbeidsflate. Endringer krever eksplisitt lagring.</p><div data-company-admin-user-card><label>Ulagret kontrolltekst<input id="draft" value="Opprinnelig verdi"></label><label><input id="access" type="checkbox">Syntetisk tilgangsvalg</label><button id="native-save" disabled>Lagre tilganger</button><div id="save-error"></div></div><div class="qa-long-body"><p>Lang brukeroversikt med native kontroller.</p><small class="qa-help">Eksisterende kort forklaring.</small></div></div></div></div></div></section></div><script>
 window.qa={saves:0,alerts:[],fail:false};
 const row=document.querySelector('.company-access-row'),body=row.querySelector('.company-access-body'),save=document.getElementById('native-save');
 row.querySelector('.company-access-toggle').onclick=()=>{row.classList.toggle('is-open');body.hidden=!row.classList.contains('is-open');};
 document.getElementById('access').onchange=()=>{save.disabled=false;};
 save.onclick=()=>{window.qa.saves++;if(window.qa.fail){document.getElementById('save-error').innerHTML='<p role="alert">Kunne ikke lagre det syntetiske valget.</p>';return;}save.disabled=true;document.getElementById('save-error').textContent='';};
 </script><script>${js.replaceAll('</script','<\\/script')}</script></html>`);});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1363,height:936}}),errors=[],outbound=[],alerts=[];page.setDefaultTimeout(8000);page.on('pageerror',e=>errors.push(e.message));page.on('dialog',async d=>{alerts.push(d.message());await d.accept();});
 const base='http://127.0.0.1:'+server.address().port;await page.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():(outbound.push(r.request().url()),r.abort('blockedbyclient')));await page.goto(base+'/');
 const opener=()=>page.locator('.company-access-toggle'),panel=()=>page.getByRole('dialog',{name:'Administrer Syntetisk firma med et langt navn',exact:true});
 await opener().click();await panel().waitFor();const draft=page.getByLabel('Ulagret kontrolltekst');await draft.fill('Behold det faktiske feltet');await draft.evaluate(n=>window.qa.draftNode=n);
 for(const width of [320,390,768,1363,1920]){
  await page.setViewportSize({width,height:936});
  const g=await panel().evaluate(n=>{const r=n.getBoundingClientRect(),head=n.querySelector('#expo-systemadmin-company-modal-header'),foot=n.querySelector('#expo-systemadmin-company-modal-footer'),close=head.querySelector('button');return {right:Math.round(r.right),top:r.top,height:Math.round(r.height),title:getComputedStyle(head.querySelector('h2')).fontSize,background:getComputedStyle(head).backgroundColor,copy:getComputedStyle(n.querySelector('.company-access-body>p')).fontSize,hint:getComputedStyle(n.querySelector('.qa-help')).fontSize,close:Math.round(close.getBoundingClientRect().height),fits:n.scrollWidth<=n.clientWidth,footer:Math.round(foot.getBoundingClientRect().bottom)<=innerHeight};});
  eq(g.right,width,'same panel right edge '+width);eq(g.top,0,'full-height panel starts at top '+width);eq(g.height,936,'panel fits viewport height '+width);eq(g.title,width<=620?'25px':'28px','shared panel title '+width);eq(g.background,'rgb(16, 33, 43)','shared navy header '+width);eq(g.copy,'16px','readable panel text '+width);eq(g.hint,'14px','readable secondary explanation '+width);eq(g.close>=44&&g.fits&&g.footer,true,'close/scroll/footer remain usable '+width);
  eq(await draft.evaluate(n=>n===window.qa.draftNode),true,'same native field '+width);eq(await draft.inputValue(),'Behold det faktiske feltet','same draft '+width);
  if(width===390||width===1363)await page.screenshot({path:path.join(shots,'company-panel-'+width+'.png')});
 }
 eq(await page.evaluate(()=>window.qa.saves),0,'opening and layout never save');
 await panel().getByRole('button',{name:'Lukk firma',exact:true}).click();await panel().waitFor({state:'detached'});await opener().click();await panel().waitFor();eq(await draft.inputValue(),'Behold det faktiske feltet','close and reopen retains native field');
 await page.getByLabel('Syntetisk tilgangsvalg',{exact:true}).check();await panel().getByRole('button',{name:'Lukk firma',exact:true}).click();eq(await panel().isVisible(),true,'native dirty guard refuses close');eq(await page.evaluate(()=>window.qa.saves),0,'close never implicitly saves access');
 await panel().getByRole('button',{name:'Lagre og lukk',exact:true}).click();await panel().waitFor({state:'detached'});eq(await page.evaluate(()=>window.qa.saves),1,'aggregate save uses existing native handler exactly once');eq(await page.evaluate(()=>document.body.style.overflow),'','closing restores page scrolling');
 await opener().click();await panel().waitFor();await page.getByLabel('Syntetisk tilgangsvalg',{exact:true}).uncheck();await page.evaluate(()=>{window.qa.fail=true;});await panel().getByRole('button',{name:'Lagre og lukk',exact:true}).click();await panel().getByRole('button',{name:'Lagre og lukk',exact:true}).waitFor();await page.waitForFunction(()=>!document.querySelector('[data-company-modal-save]').disabled);eq(await panel().isVisible(),true,'save error keeps firm open');eq(await panel().getByRole('alert').textContent(),'Kunne ikke lagre det syntetiske valget.','native save error stays visible');
 await page.evaluate(()=>{window.qa.fail=false;document.getElementById('save-error').textContent='';});await panel().getByRole('button',{name:'Lagre og lukk',exact:true}).click();await panel().waitFor({state:'detached'});eq(await page.evaluate(()=>window.qa.saves),3,'retry delegates to native handler');
 await opener().click();await panel().waitFor();await page.keyboard.press('Escape');await panel().waitFor({state:'detached'});eq(await page.locator('#expo-systemadmin-company-modal-backdrop').count(),0,'Escape clears native backdrop');eq(alerts.length,2,'dirty and failed-save messages retained');eq(outbound,[],'no external transport');eq(errors,[],'no runtime errors');
 console.log('Systemadmin company panel: '+checks+' Chromium assertions PASS; native adapter, five widths, exact DOM/draft, explicit save, dirty/error/retry/Escape and no external transport. Internal visual evidence: '+shots);
}finally{await browser?.close();if(server)await new Promise(resolve=>server.close(resolve));fs.rmSync(temp,{recursive:true,force:true});}
