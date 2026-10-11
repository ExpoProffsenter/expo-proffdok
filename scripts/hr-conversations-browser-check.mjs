// Optional actual Chromium proof; only the generated synthetic React fixture.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createServer} from 'node:http';
const {chromium}=await import(process.env.HR_PLAYWRIGHT_PATH||'playwright');
const dir=process.env.HR_CONVERSATION_BROWSER_DIR;if(!dir)throw Error('Generate the synthetic React fixture directory first.');
const server=createServer(async(req,res)=>{
 try{const name=req.url==='/'?'index.html':req.url.slice(1);if(!['index.html','fixture.js','app.js','app.css'].includes(name)){res.writeHead(404).end();return;}
 res.setHeader('content-type',name.endsWith('.css')?'text/css':name.endsWith('.js')?'application/javascript':'text/html');res.end(await fs.readFile(dir+'/'+name));}
 catch{res.writeHead(500).end();}
});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({...(process.env.HR_CHROMIUM_PATH?{executablePath:process.env.HR_CHROMIUM_PATH}:{}),headless:true,args:['--no-sandbox']});
try{
 for(const [width,height] of [[1280,900],[360,740]]){
  const page=await browser.newPage({viewport:{width,height}});page.setDefaultTimeout(10000);const dialogs=[];page.on('dialog',async d=>{dialogs.push(d.message());await d.dismiss();});
  await page.goto('http://127.0.0.1:'+server.address().port);await page.getByText('Start medarbeidersamtale',{exact:true}).click();await page.getByLabel('Samtalemal').selectOption('template');await page.getByRole('button',{name:'Opprett samtale',exact:true}).click();
  await page.evaluate(()=>{__state.actor='self';__render();});await page.getByRole('button',{name:/Årlig samtale ·/}).click();await page.getByLabel('Hvordan fungerer arbeidet? *',{exact:true}).fill('Medarbeiderens eget svar.');await page.getByRole('button',{name:'Lagre samtale',exact:true}).click();await page.getByRole('button',{name:'Klar til samtale',exact:true}).click();
  await page.evaluate(()=>{__state.actor='leader';__render();});await page.getByRole('button',{name:/Årlig samtale ·/}).click();await page.getByLabel('Hva er avtalt? *',{exact:true}).fill('Vi følger opp opplæring og avtaler neste møte.');await page.getByRole('button',{name:'Neste',exact:true}).click();
  const body=page.locator('.hrp-step-body');await body.waitFor();const y=await body.evaluate(e=>e.getBoundingClientRect().top);assert(y>=0&&y<height-160,'next-step heading and first field must be visible below the fixed header; y='+y);assert(await body.evaluate(e=>document.activeElement===e),'next step receives focus');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'no horizontal overflow');assert.equal(dialogs.length,0,'clean saved snapshots must never open a draft-discard confirmation');
  if(process.env.HR_CONVERSATION_SCREENSHOT_DIR)await page.screenshot({path:process.env.HR_CONVERSATION_SCREENSHOT_DIR+'/hr-conversation-'+width+'.png',fullPage:true});
  console.log(`Actual synthetic Chromium ${width}px: create/shared preparation/current leader/next-step focus and visible top/no horizontal overflow/no false conflict PASS`);await page.close();
 }
}finally{await browser.close();await new Promise(r=>server.close(r));}
