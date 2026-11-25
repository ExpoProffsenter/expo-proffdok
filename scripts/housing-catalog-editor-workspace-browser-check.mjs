import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=process.cwd(),temp=fs.mkdtempSync(path.join(os.tmpdir(),'housing-catalog-workspace-'));
fs.writeFileSync(path.join(temp,'entry.jsx'),`
import React from '${root}/node_modules/react/index.js';
import {createRoot} from '${root}/node_modules/react-dom/client.js';
import Catalog from '${root}/src/modules/bolig/BoligCatalog.jsx';
import '${root}/src/style.css';
import '${root}/src/modules/bolig/bolig.css';
import '${root}/src/modules/app/mobileResponsive41A.css';
import '${root}/src/modules/ui/proffdokWorkspace.css';
import {APP_RUNTIME_STYLES} from '${root}/src/modules/app/appRuntimeStyles.js';
const runtime=document.createElement('style');runtime.textContent=APP_RUNTIME_STYLES;document.head.appendChild(runtime);
const context={user_id:'qa',company_id:'firm',enabled:true,role:'manager'};
const line={key:'sink',name:'QA servant',sku:'QA-S1',quantity:1,unit:'stk',credit_cents:10000};
const state={context,root_id:'root',revision:1,packages:[{id:'p1',name:'QA komplett bad',lines:[line],sections:[],revision:1,archived:false}],options:[{id:'o1',name:'QA speil',sku:'QA-M1',quantity:1,unit:'stk',price_cents:10000,replace_key:'',deduct_base:false,revision:1,archived:false}],history:[],selection:null};
window.qa={calls:[]};window.qa.client={rpc:async(name,args)=>{window.qa.calls.push({name,args});if(name==='bolig_catalog'&&args.p_action==='state')return {data:state};return {error:{code:'42501',message:'Katalogoppslag ikke aktivert i isolert prøve'}};}};
createRoot(document.getElementById('app')).render(<div data-expo-app-shell="true"><section className="bolig-dialog bolig-page"><Catalog context={context} root={{id:'root',archived:false}}/></section></div>);
`);
const built=await build({root,configFile:false,logLevel:'silent',plugins:[react({jsxRuntime:'classic'}),{name:'catalog-transport-only',enforce:'pre',resolveId(id){if(id.endsWith('/appSupabaseClientRegistry.js'))return '\0qa';},load(id){if(id==='\0qa')return 'export const getAppSupabaseClient=()=>window.qa.client;';}}],define:{'process.env.NODE_ENV':'"production"'},build:{write:false,minify:false,target:'esnext',lib:{entry:path.join(temp,'entry.jsx'),formats:['es'],cssFileName:'qa'}}});
const output=(Array.isArray(built)?built[0]:built).output,css=output.filter(i=>i.type==='asset'&&i.fileName.endsWith('.css')).map(i=>i.source).join('\n');
const server=http.createServer((req,res)=>{const filename=new URL(req.url,'http://localhost').pathname,chunk=output.find(i=>i.type==='chunk'&&('/'+i.fileName===filename||filename==='/bundle.js'&&i.isEntry));if(chunk){res.setHeader('content-type','text/javascript');res.end(chunk.code);}else{res.setHeader('content-type','text/html;charset=utf-8');res.end('<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+'</style><div id="app"></div><script type="module" src="/bundle.js"></script>');}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
let browser,checks=0;const eq=(a,b,label)=>{assert.deepEqual(a,b,label);checks++;};
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']});const page=await browser.newPage(),errors=[],outbound=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():(outbound.push(r.request().url()),r.abort()));await page.goto('http://127.0.0.1:'+server.address().port);await page.getByRole('button',{name:'Ny grunnpakke',exact:true}).waitFor();
 for(const [width,height]of [[1920,936],[1363,936],[768,600],[390,600],[320,600],[390,320]]){
  await page.setViewportSize({width,height});
  for(const kind of ['Grunnpakker','Tilvalgspakker']){
   await page.getByRole('button',{name:kind,exact:true}).click();const library=page.locator('.bolig-catalog-library');await library.locator('summary').click();
   eq(await page.locator('.bolig-catalog').evaluate(n=>n.scrollWidth<=n.clientWidth+1),true,kind+' library fits '+width);
   eq(await page.locator('.bolig-catalog button,.bolig-catalog summary').evaluateAll(nodes=>nodes.filter(n=>n.checkVisibility()).filter(n=>parseFloat(getComputedStyle(n).fontSize)<16||n.getBoundingClientRect().height<44).map(n=>({text:n.textContent,font:getComputedStyle(n).fontSize,height:n.getBoundingClientRect().height}))),[],kind+' library controls16/44 '+width);
   eq(await library.locator('h4').evaluateAll(nodes=>nodes.every(n=>parseFloat(getComputedStyle(n).fontSize)>=18)),true,kind+' readable saved titles '+width);
   eq(await library.locator('.bolig-catalog-cards>article').evaluate(n=>getComputedStyle(n).borderRadius),'8px',kind+' shared8px saved card '+width);
   await library.locator('summary').click();
  }
  for(const [kind,label,title,field,value]of [['package','Rediger grunnpakke: QA komplett bad','Rediger grunnpakke','Pakkenavn','QA komplett bad'],['package','Ny grunnpakke','Ny grunnpakke','Pakkenavn',''],['option','Rediger tilvalgspakke: QA speil','Rediger tilvalgspakke','Navn på tilvalgspakke','QA speil'],['option','Ny tilvalgspakke','Ny tilvalgspakke','Navn på tilvalgspakke','']]){
   await page.getByRole('button',{name:kind==='package'?'Grunnpakker':'Tilvalgspakker',exact:true}).click();await page.getByRole('button',{name:label,exact:true}).click();const d=page.getByRole('dialog',{name:title,exact:true});await d.waitFor();
   const fit=async()=>{const g=await d.evaluate(n=>{const r=n.getBoundingClientRect(),head=n.querySelector(':scope>header'),close=head.querySelector('button'),h=close.getBoundingClientRect();return {top:r.top,right:r.right,height:r.height,width:r.width,viewport:[innerWidth,innerHeight],bg:getComputedStyle(head).backgroundColor,title:getComputedStyle(head.querySelector('h2')).fontSize,overflow:n.scrollWidth>n.clientWidth,close:[h.top>=0,h.bottom<=innerHeight,h.height>=44,h.width>=44]};});eq([g.top,g.right,g.height,g.width],[0,width,height,Math.min(680,width)],title+' shared panel geometry '+width+'x'+height);eq(g.bg,'rgb(16, 33, 43)',title+' shared navy header');eq(g.title,width<=620?'25px':'28px',title+' readable title');eq(g.overflow,false,title+' no horizontal overflow');eq(g.close,[true,true,true,true],title+' persistent44px close');};
   await fit();eq(await d.getByLabel(field,{exact:true}).inputValue(),value,title+' native value preserved');
   const fold=d.locator('.bolig-edit-line>summary').first();await fold.click();
   eq(await d.locator('input:not([type="file"]):not([type="checkbox"]),select,textarea,button,summary').evaluateAll(nodes=>nodes.filter(n=>n.checkVisibility()).every(n=>parseFloat(getComputedStyle(n).fontSize)>=16&&n.getBoundingClientRect().height>=44)),true,title+' all actual expanded controls16/44');
   if(kind==='option'){await d.getByLabel('Tilvalgspakketype',{exact:true}).selectOption('alternative');eq(await d.getByLabel('Erstatter standardvare',{exact:true}).inputValue(),'sink',title+' same native replacement field');await d.getByLabel('Tilvalgspakketype',{exact:true}).selectOption('additional');}
   await d.locator(':scope>form').evaluate(n=>n.scrollTop=n.scrollHeight);await fit();const save=d.getByRole('button',{name:kind==='package'?'Lagre grunnpakke':'Lagre tilvalgspakke',exact:true});eq(await save.evaluate(n=>{const r=n.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight;}),true,title+' actual save remains reachable after long-content scroll');
   if(process.env.HOUSING_CATALOG_SCREENSHOTS&&['390','1363'].includes(String(width))&&height>320&&label.startsWith('Rediger')){fs.mkdirSync(process.env.HOUSING_CATALOG_SCREENSHOTS,{recursive:true});await page.screenshot({path:path.join(process.env.HOUSING_CATALOG_SCREENSHOTS,kind+'-'+width+'.png')});}
   await page.keyboard.press('Escape');await d.waitFor({state:'hidden'});
  }
 }
 await page.setViewportSize({width:1363,height:936});await page.getByRole('button',{name:'Ny grunnpakke',exact:true}).click();let d=page.getByRole('dialog',{name:'Ny grunnpakke',exact:true});await d.getByLabel('Pakkenavn',{exact:true}).fill('QA bevart lokalt bad');await page.keyboard.press('Escape');await page.getByRole('button',{name:'Ny grunnpakke',exact:true}).click();d=page.getByRole('dialog',{name:'Ny grunnpakke',exact:true});eq(await d.getByLabel('Pakkenavn',{exact:true}).inputValue(),'QA bevart lokalt bad','close/reopen retains native unsent local draft');await d.getByRole('button',{name:'Lukk ny grunnpakke',exact:true}).click();await d.waitFor({state:'hidden'});
 eq(await page.evaluate(()=>window.qa.calls.filter(c=>c.name==='bolig_catalog'&&c.args.p_action!=='state')),[],'no catalog write');eq(errors,[],'no render errors');eq(outbound,[],'no live transport');console.log('Housing catalog editors: '+checks+' assertions PASS;24 native new/edit package/option views, expanded controls, replacement fields, scrolling/close/draft; synthetic reads only.');
}finally{await browser?.close();await new Promise(r=>server.close(r));}
