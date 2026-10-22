import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import http from 'node:http';import {build} from 'vite';import react from '@vitejs/plugin-react';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');const root=process.cwd(),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'stocktake-')),entry=path.join(tmp,'entry.jsx');
fs.writeFileSync(entry,`import React from '${root}/node_modules/react/index.js';import {createRoot} from '${root}/node_modules/react-dom/client.js';import Entry from '${root}/src/modules/stocktake/StocktakeEntry.jsx';import Admin from '${root}/src/modules/stocktake/StocktakeCompanyAccess.jsx';const root=createRoot(document.getElementById('app'));globalThis.render=()=>root.render(React.createElement(React.Fragment,null,React.createElement(Admin,{companyId:'company'}),React.createElement(Entry)));globalThis.render();`);
const bundled=await build({root,configFile:false,logLevel:'silent',plugins:[react(),{name:'api-boundary',enforce:'pre',resolveId(id){if(id.endsWith('/moduleAccessClient.js'))return '\0access';if(id.endsWith('/workProfileClient.js'))return '\0profile';if(id.endsWith('/PriceSearchBarcodeScanner.jsx'))return '\0scan';},load(id){
 if(id==='\0access')return `export const MANAGED_ACCESS_EVENT='managed',MODULE_ACCESS_EVENT='module';export const rpcWithStoredSession=(n,a)=>window.api(n,a);export const publishManagedAccessChange=()=>window.dispatchEvent(new Event('managed'));`;
 if(id==='\0profile')return `export const WORK_PROFILE_EVENT='profile';`;
 if(id==='\0scan')return `import React from '${root}/node_modules/react/index.js';export default function Scanner(p){return React.createElement('button',{onClick:()=>p.onScan('07000000000001')},'QA camera scan');}`;
}}],build:{write:false,cssCodeSplit:false,minify:false,rollupOptions:{input:entry,output:{inlineDynamicImports:true}}}});
const js=bundled.output.find(f=>f.type==='chunk').code,css=bundled.output.filter(f=>f.fileName.endsWith('.css')).map(f=>f.source).join('\n');
const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html; charset=utf-8');res.end(`<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font:15px Arial;margin:8px} ${css}</style><div id="app"></div><script type="module">${js.replaceAll('</script','<\\/script')}</script>`);});await new Promise(r=>server.listen(0,'127.0.0.1',r));
let browser,checks=0;const eq=(a,b,n)=>{assert.deepEqual(a,b,n);checks++;};
try{
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:1200,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{
  const prior=JSON.parse(sessionStorage.getItem('__qaBackend')||'null');window.enabled=prior?.enabled||false;window.scope=prior?.scope||'company';window.rows=prior?.rows||[];window.sessions=prior?.sessions||[];window.commands=prior?.commands||{};window.calls=[];window.loss=false;window.nextError=null;
  const product=(supplier)=>({id:supplier,supplier_name:'Leverandør '+supplier,supplier_product_number:'00123',description:'Rørdel '+supplier,gtin:'07000000000001',total_count:2,purchase_net_ex_vat:987654});
  window.api=async(n,a={})=>{window.calls.push({n,a:structuredClone(a)});
   if(n==='stocktake_admin_get')return {company_id:a.p_company_id,enabled:window.enabled,revision:window.enabled?1:0};
   if(n==='stocktake_admin_set'){window.enabled=a.p_enabled;return {company_id:a.p_company_id,enabled:window.enabled,revision:1};}
   if(n==='get_cordel_export_access')return true;
   if(n==='stocktake_context')return {company_id:window.scope,user_id:'user',company_name:window.scope==='company'?'QA Firma':'Annet firma',enabled:window.enabled};
   if(n==='search_internal_store_catalog_prices_page'||n==='search_internal_store_catalog_prices_smart')return [product('A'),product('B')];
   if(a.p_company_id!==window.scope||!window.enabled)throw Error('Ingen tilgang');
   if(n==='stocktake_list')return window.scope==='company'?window.sessions.map(s=>({...s,line_count:window.rows.length})):[];
   if(n==='stocktake_create'){let s=window.sessions.find(x=>x.id===a.p_id);if(!s){s={id:a.p_id,title:a.p_title,warehouse:a.p_warehouse,count_date:a.p_date,company_id:window.scope,closed:false,revision:1};window.sessions.push(s);}return structuredClone(s);}
   const session=window.sessions.find(x=>x.id===a.p_id);if(!session)throw Error('Tellingen finnes ikke.');
   if(n==='stocktake_get')return {session:structuredClone(session),total:window.rows.length,items:structuredClone(window.rows.slice(a.p_offset||0,(a.p_offset||0)+100))};
   if(n==='stocktake_record'){
    if(window.commands[a.p_command_id])return structuredClone(window.commands[a.p_command_id]);
    if(window.nextError){const error=window.nextError;window.nextError=null;return {error,code:'PT409'};}
    const i=a.p_input;let result;
    if(i.action==='add'){
     const data=i.catalog_id?{supplier:'Leverandør '+i.catalog_id,number:'00123',description:'Rørdel '+i.catalog_id,gtin:'07000000000001',location:i.location,catalog_id:i.catalog_id}:i;
     let row=window.rows.find(l=>l.supplier===data.supplier&&l.number===data.number&&l.location===data.location);
     if(row){row.quantity+=Number(i.quantity);row.revision++;}else{row={...data,quantity:Number(i.quantity),revision:1,id:crypto.randomUUID()};window.rows.push(row);}result=row;
    }else if(i.action==='set'){const row=window.rows.find(l=>l.id===i.line_id);row.quantity=Number(i.quantity);row.revision++;result=row;}
    else if(i.action==='delete'){window.rows=window.rows.filter(l=>l.id!==i.line_id);result={deleted:i.line_id};}
    else if(i.action==='close'){session.closed=true;result={closed:true};}
    session.revision++;window.commands[a.p_command_id]=structuredClone(result);
    if(window.loss){window.loss=false;throw Error('Svaret ble borte');}return result;
   }
   throw Error('Unexpected RPC '+n);
  };
 });
 await page.goto(`http://127.0.0.1:${server.address().port}`);const button=name=>page.getByRole('button',{name,exact:true});
 await page.getByLabel('Aktiver varetelling',{exact:false}).waitFor();eq(await button('Åpne varetelling').count(),0,'disabled firm has no entry or help');eq(await page.getByText('Slik bruker du varetelling',{exact:true}).count(),0);
 await page.getByLabel('Aktiver varetelling',{exact:false}).check();await button('Åpne varetelling').click();await page.getByLabel('Lager i Cordel',{exact:true}).fill('1 – Expo lager');await button('Opprett telling').click();await page.getByRole('heading',{name:'Finn varen du teller',exact:true}).waitFor();
 await button('Skann strekkode').click();await button('QA camera scan').click();await page.getByText('Leverandør B · Varenr. 00123',{exact:true}).waitFor();eq(await page.locator('.stocktakeResult').count(),2,'shared barcode offers both suppliers, no automatic selection');
 eq((await page.evaluate(()=>window.calls.filter(c=>c.n.startsWith('search_internal_store_catalog_prices')).at(-1))).n,'search_internal_store_catalog_prices_smart');
 await page.getByLabel('Smartere søk',{exact:false}).uncheck();await button('Søk vare').click();await page.getByText('Leverandør B · Varenr. 00123',{exact:true}).waitFor();eq((await page.evaluate(()=>window.calls.filter(c=>c.n.startsWith('search_internal_store_catalog_prices')).at(-1))).n,'search_internal_store_catalog_prices_page','classic lookup remains available');await page.getByLabel('Smartere søk',{exact:false}).check();await button('Søk vare').click();await page.getByText('Leverandør B · Varenr. 00123',{exact:true}).waitFor();
 await page.locator('.stocktakeResult').nth(1).click();eq(await page.getByLabel('Leverandør',{exact:true}).inputValue(),'Leverandør B');await page.getByLabel('Antall du har telt',{exact:true}).fill('0');await button('Registrer antall').click();await page.getByText('Antallet er lagret i firmaet.',{exact:true}).waitFor();eq((await page.evaluate(()=>window.rows))[0].quantity,0);
 await button('Legg inn vare manuelt').click();await page.getByLabel('Leverandør',{exact:true}).fill('Manuell grossist');await page.getByLabel('Varenummer i Cordel',{exact:true}).fill('00045');await page.getByLabel('Beskrivelse',{exact:true}).fill('Uten strekkode');await page.getByLabel('Område / hylle (valgfritt)',{exact:true}).fill('Reol B');await page.getByLabel('Antall du har telt',{exact:true}).fill('2,5');
 eq(await button('Ny telling').isDisabled(),true,'unsaved line cannot be silently replaced by another count');
 await page.evaluate(()=>sessionStorage.setItem('__qaBackend',JSON.stringify({enabled:window.enabled,scope:window.scope,rows:window.rows,sessions:window.sessions,commands:window.commands})));
 await page.reload();await page.getByLabel('Varenummer i Cordel',{exact:true}).waitFor();eq(await page.getByLabel('Varenummer i Cordel',{exact:true}).inputValue(),'00045','manual draft survives reload');eq(await page.getByLabel('Antall du har telt',{exact:true}).inputValue(),'2,5');

 await page.evaluate(()=>window.loss=true);await button('Registrer antall').click();await button('Prøv registrering igjen').waitFor();eq(await page.getByLabel('Varenummer i Cordel',{exact:true}).isDisabled(),true,'unknown result locks exact payload');
 await button('Prøv registrering igjen').click();await page.getByText('Antallet er lagret i firmaet.',{exact:true}).waitFor();const calls=await page.evaluate(()=>window.calls.filter(c=>c.n==='stocktake_record'));eq(calls.length,2);eq(calls[0].a.p_command_id,calls[1].a.p_command_id);eq((await page.evaluate(()=>window.rows.find(r=>r.number==='00045'))).quantity,2.5,'accepted but lost response is never counted twice');
 await page.locator('.stocktakeLine').filter({hasText:'Uten strekkode'}).getByRole('button',{name:'Endre antall',exact:true}).click();await page.getByLabel('Samlet talt antall',{exact:true}).fill('7.125');await button('Lagre nytt antall').click();await page.getByText('Antallet er lagret i firmaet.',{exact:true}).waitFor();eq((await page.evaluate(()=>window.rows.find(r=>r.number==='00045'))).quantity,7.125);
 await page.locator('.stocktakeLine').filter({hasText:'Uten strekkode'}).getByRole('button',{name:'Endre antall',exact:true}).click();await page.getByLabel('Samlet talt antall',{exact:true}).fill('8');await page.evaluate(()=>window.nextError='Varen er endret av en annen bruker. Hent på nytt.');await button('Lagre nytt antall').click();await page.getByRole('alert').filter({hasText:'Varen er endret'}).waitFor();eq(await page.getByLabel('Samlet talt antall',{exact:true}).inputValue(),'8','conflict keeps the proposed number');await button('Avbryt innlegging').click();
 await page.evaluate(()=>{for(let i=0;i<120;i++)window.rows.push({id:crypto.randomUUID(),supplier:'Bulk',number:'B'+i,description:'Bulk '+i,gtin:'',location:'Lager',quantity:1,revision:1});window.sessions[0].revision++;});await button('Hent telling på nytt').click();await page.getByText('122 registrerte varelinjer',{exact:false}).waitFor();eq(await page.locator('.stocktakeLine').count(),100);await button('Neste 100').click();await page.getByText('Viser 101–122 av 122',{exact:true}).waitFor();eq(await page.locator('.stocktakeLine').count(),22);
 const download=page.waitForEvent('download');await button('Last ned Cordel-tekstfil').click();const file=await download;eq(file.suggestedFilename(),'ProffDok_Cordel_Varetelling.txt');const content=fs.readFileSync(await file.path());eq(new TextDecoder('windows-1252').decode(content).trimEnd().split('\r\n').length,122,'export includes every page');
 const shots=process.env.STOCKTAKE_QA_DIR||tmp;fs.mkdirSync(shots,{recursive:true});await page.screenshot({path:path.join(shots,'stocktake-desktop.png'),fullPage:true});
 await page.setViewportSize({width:390,height:844});eq(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'mobile no horizontal overflow');await page.screenshot({path:path.join(shots,'stocktake-mobile.png'),fullPage:true});
 await button('Avslutt telling').click();await button('Bekreft avslutning').click();await page.getByText('Tellingen er avsluttet og kan eksporteres.',{exact:true}).waitFor();eq(await button('Registrer antall').count(),0);eq(await button('Last ned Cordel-tekstfil').isEnabled(),true);
 await page.evaluate(()=>{window.scope='other';window.dispatchEvent(new Event('profile'));});await button('Åpne varetelling').click();await page.getByRole('heading',{name:'Start en varetelling',exact:true}).waitFor();eq(await page.locator('.stocktakeLine').count(),0,'company switch clears old rows');eq(await page.getByLabel('Lager i Cordel',{exact:true}).inputValue(),'','other company never gets prior draft');
 await page.evaluate(()=>{window.enabled=false;window.dispatchEvent(new Event('managed'));});await button('Åpne varetelling').waitFor({state:'hidden'});eq(await page.getByText('Slik bruker du varetelling',{exact:true}).count(),0,'revocation removes help too');eq(errors,[],'no React errors');
 console.log(`stocktake-react-check: ${checks} assertions OK (Chromium PC/mobile, shared barcode, manual zero/count, draft reload, lost response retry, conflicts, 122 rows, all-page export, closure and scope revocation)`);

}finally{await browser?.close();await new Promise(r=>server.close(r));fs.rmSync(tmp,{recursive:true,force:true});}
