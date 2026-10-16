import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import http from 'node:http';import {build} from 'vite';import react from '@vitejs/plugin-react';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');const root=process.cwd(),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'price-mobile-')),entry=path.join(tmp,'entry.jsx');
fs.writeFileSync(entry,`import React from '${root}/node_modules/react/index.js';import {createRoot} from '${root}/node_modules/react-dom/client.js';import View from '${root}/src/modules/storeCatalog/StorePriceSearchView.jsx';import '${root}/src/style.css';import '${root}/src/modules/app/mobileResponsive41A.css';createRoot(document.getElementById('app')).render(React.createElement(View));`);
const result=await build({root,configFile:false,logLevel:'silent',define:{'process.env.NODE_ENV':'"development"'},plugins:[react(),{name:'mobile-api',enforce:'pre',resolveId(id){if(id.endsWith('moduleAccessClient.js'))return '\0access';if(id.endsWith('workProfileClient.js'))return '\0profile';if(id.endsWith('PriceSearchBarcodeScanner.jsx'))return '\0scan';},load(id){if(id==='\0access')return `export const MANAGED_ACCESS_EVENT='managed',MODULE_ACCESS_EVENT='module';export const getStoredSupabaseSession=()=>({userId:'user',accessToken:'qa'});export const rpcWithStoredSession=(...a)=>window.api(...a);`;if(id==='\0profile')return `export const WORK_PROFILE_EVENT='profile';export const readCachedWorkProfileState=()=>({active_company_id:'company'});export const getMyWorkProfileState=async()=>({active_company_id:'company'});`;if(id==='\0scan')return `import React from '${root}/node_modules/react/index.js';export default function Scanner(p){return React.createElement('button',{onClick:()=>p.onScan('07000000000001')},'QA skann vare');}`;}}],build:{write:false,minify:false,lib:{entry,formats:['iife'],name:'MobileQa',cssFileName:'mobile-qa'}}});
const output=(Array.isArray(result)?result[0]:result).output,js=output.find(x=>x.type==='chunk').code,css=output.filter(x=>x.fileName.endsWith('.css')).map(x=>x.source).join('\n');const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html; charset=utf-8');res.end(`<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font:16px Arial;margin:12px}${css}</style><div id="app"></div><script>${js.replaceAll('</script','<\\/script')}</script>`);});await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser,checks=0;const eq=(a,b,n)=>{assert.deepEqual(a,b,n);checks++;};
try{
browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']});
for(const width of [1363,768,390,320]){
 const page=await browser.newPage({viewport:{width,height:936},isMobile:width<761,hasTouch:width<761});page.setDefaultTimeout(8000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{
  const product=n=>({id:'qa-'+n,supplier_name:'QA Oras',supplier_product_number:'SKU-'+n,description:'MEDIPRO SERVANTKRAN '+n,gtin:'07000000000001',customer_price_incl_vat:250,customer_price_ex_vat:200,purchase_net_ex_vat:null,match_kind:'related',total_count:32});
  window.calls=[];window.scope='company';window.profile=()=>window.scope;
  window.api=async(name,args)=>{
   window.calls.push({name,args});
   if(name==='stocktake_context')return {enabled:false,user_id:'user',company_id:window.scope};
   if(name==='get_cordel_export_access')return true;
   if(name==='list_mobile_store_picklists')return [];
   if(name==='search_internal_store_catalog_prices_smart'){
    if(args.p_query==='medipro servantbatteri')return args.p_offset===30?await new Promise(resolve=>{window.more=()=>resolve([product(30),product(31)]);}):Array.from({length:30},(_,n)=>product(n));
    if(args.p_query==='07000000000001')return [{...product(0),match_kind:'number',total_count:1}];
    if(args.p_query==='blocked')throw Error('Du har ikke tilgang til Prissøk.');
    return [];
   }
   if(name==='search_internal_store_catalog_prices_page')return [{...product(100),description:'Vanlig treff',match_kind:undefined,total_count:1}];
   if(name==='search_internal_store_catalog_prices')return [product(0)];
   throw Error('Unexpected '+name);
  };
 });
 await page.goto(`http://127.0.0.1:${server.address().port}`);
 const input=page.getByLabel('Søk i vareregisteret',{exact:true}),toggle=page.getByLabel('Smartere søk',{exact:true});
 await toggle.waitFor();eq(await toggle.isChecked(),true,'smart is default '+width);
 if(width<761)eq(await input.evaluate(el=>el===document.activeElement),false,'mobile no autofocus '+width);
 await input.fill('medipro servantbatteri');await page.locator('.priceSearchResult').nth(29).waitFor();
 eq(await page.locator('.priceSearchResult').count(),30,'first page '+width);
 eq(await page.getByText('Treff via tilsvarende fagord eller forkortelse',{exact:true}).count(),30,'expanded matches disclosed '+width);
 eq(await page.getByText('Viser 30 av 32 treff',{exact:true}).count(),1,'total from server '+width);
 eq(await page.getByText('Intern netto eks. mva.',{exact:true}).count(),0,'masked net not displayed '+width);
 eq(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'no overflow '+width);
 eq((await page.locator('.priceSearchSmartOptions label').boundingBox()).height>=44,true,'toggle touch target '+width);
 if(process.env.SMART_SEARCH_QA_OUTPUT){fs.mkdirSync(process.env.SMART_SEARCH_QA_OUTPUT,{recursive:true});await page.screenshot({path:path.join(process.env.SMART_SEARCH_QA_OUTPUT,'search-'+width+'.png')});}
 // A late page must not be appended after mode changes, even if the query text is identical.
 await page.getByRole('button',{name:/Vis \d+ flere/}).click();await page.waitForFunction(()=>Boolean(window.more));await toggle.uncheck();await page.getByRole('button',{name:'Legg til: Vanlig treff',exact:true}).waitFor();
 await page.evaluate(()=>window.more());await page.waitForTimeout(80);eq(await page.locator('.priceSearchResult').count(),1,'old smart page discarded after switching mode '+width);
 eq(await page.getByText('Treff via tilsvarende fagord eller forkortelse',{exact:true}).count(),0,'classic results unlabelled '+width);
 eq((await page.evaluate(()=>window.calls.filter(c=>c.name.startsWith('search_internal_store_catalog_prices')).at(-1))).name,'search_internal_store_catalog_prices_page','original RPC remains selectable '+width);
 await toggle.check();await page.locator('.priceSearchResult').nth(29).waitFor();await page.getByRole('button',{name:/Vis \d+ flere/}).click();await page.waitForFunction(()=>Boolean(window.more));await page.evaluate(()=>window.more());await page.locator('.priceSearchResult').nth(31).waitFor();
 eq(await page.locator('.priceSearchResult').count(),32,'more results completes '+width);
 await input.fill('07000000000001');await page.waitForFunction(()=>document.querySelectorAll('.priceSearchResult').length===1);
 eq((await page.evaluate(()=>window.calls.filter(c=>c.name==='search_internal_store_catalog_prices_smart').at(-1))).args.p_query,'07000000000001','barcode passed unchanged '+width);
 await page.getByRole('button',{name:'Legg til: MEDIPRO SERVANTKRAN 0',exact:true}).click();await page.getByRole('heading',{name:'Plukkliste (1)',exact:true}).waitFor();eq(await input.inputValue(),'','selection keeps existing clear-search flow '+width);
 const refs=await page.evaluate(()=>Object.entries(sessionStorage).filter(([key])=>key.includes('price-search:worklist')).map(([,value])=>value).join(''));
 eq(refs.includes('purchase_net')||refs.includes('customer_price')||refs.includes('match_kind'),false,'no prices or search metadata persisted '+width);
 await input.fill('blocked');await page.getByText('Du har ikke tilgang til Prissøk.',{exact:true}).waitFor();eq(await page.locator('.priceSearchResult').count(),0,'error clears previous results '+width);
 eq((await page.evaluate(()=>window.calls)).some(c=>/save|delete|supplier_order_prepare/.test(c.name)),false,'search/selection never saves/sends/orders '+width);
 eq(errors,[],'no browser errors '+width);await page.close();
}
console.log('smart-price-search-browser-check: '+checks+' Chromium checks PASS, mode toggle, expanded labels, pagination/race, barcode, worklist, permissions and four widths.');
}finally{await browser?.close();await new Promise(r=>server.close(r));fs.rmSync(tmp,{recursive:true,force:true});}
