import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import {build} from 'vite';
import react from '@vitejs/plugin-react';

// Real profile, support, catalog and native Productmaster form. Only transport
// and host state/callbacks are synthetic. Never import/activate/send real data.
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=process.cwd(),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'profile-support-register-'));
const source=fs.readFileSync('src/main.jsx','utf8');
const primitives=source.slice(source.indexOf('  function Section('),source.indexOf('  const { renderProductSections }'));
const inputs=source.slice(source.indexOf('  function Input('),source.indexOf('  const { ProjectImagesPanel,'));
const newProductButton=source.indexOf('children: showNewProductMasterForm ?');
const formStart=source.lastIndexOf('/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [',newProductButton);
const formEnd=source.indexOf('            (productMaster || []).length === 0',newProductButton);
assert(formStart>0&&formEnd>formStart,'native new-product source boundary');
const nativeProduct=source.slice(formStart,formEnd).trim().replace(/,$/,'');
fs.writeFileSync(path.join(tmp,'entry.jsx'),`
import React,{useState,Fragment} from '${root}/node_modules/react/index.js';
import * as import_jsx_runtime from '${root}/node_modules/react/jsx-runtime.js';
import {createRoot} from '${root}/node_modules/react-dom/client.js';
import {createCompanyViewTools} from '${root}/src/modules/company/companyViewTools.js';
import Admin from '${root}/src/modules/app/SystemAdminWorkspace.jsx';
import Support from '${root}/src/modules/support/SupportWorkspace.jsx';
import {registerAppSupabaseClient} from '${root}/src/modules/access/appSupabaseClientRegistry.js';
import {installSystemAdminStoreCatalogUx} from '${root}/src/modules/storeCatalog/systemAdminStoreCatalogUx.jsx';
import '${root}/src/style.css';
import '${root}/src/modules/ui/appUxReview.css';
import '${root}/src/modules/ui/proffdokWorkspace.css';
window.calls=[];window.writes=[];window.selected=[];
const ticket='97000000-0000-4000-8000-000000000123';
const client={auth:{getUser:async()=>({data:{user:{id:'qa'}}})},functions:{invoke:async()=>({data:{ok:true,mailEnabled:false,emailRepliesEnabled:false}})},rpc:async(name,args)=>{
 window.calls.push({name,args});
 if(name==='current_user_has_internal_store_catalog_access'||name==='current_user_can_manage_internal_store_catalog')return {data:true};
 if(name==='get_pending_internal_store_catalog_import')return {data:null};
 if(name==='search_internal_store_catalog')return {data:[{id:'item-a',description:'QA Armatur med langt produktnavn',supplier_name:'QA Leverandør',supplier_product_number:'0012',gtin:'1234567890123',customer_price_incl_vat:1250,purchase_net_ex_vat:600}]};
 if(name==='support_context')return {data:{user_id:'qa',company_id:'c',company:'QA Firma',sender:'qa@example.invalid',is_admin:false,admins:[]}};
 if(name==='support_list')return {data:{items:[{id:ticket,number:5,subject:'QA samtale med lang tittel som må bryte på mobil',category:'question',status:'working',updated_at:'2026-10-30T10:00:00Z'}],total:1}};
 if(name==='support_get')return {data:{ticket:{id:ticket,number:5,subject:'QA samtale med lang tittel som må bryte på mobil',category:'question',status:'working'},messages:[{id:ticket,kind:'support',body:'Et bevart svar med lesbar tekst.',created_at:'2026-10-30T10:00:00Z',source:'app'}]}};
 throw Error('Unexpected transport/write '+name);
}};
registerAppSupabaseClient(client);
const stopInteractivePropagation=e=>e.stopPropagation();
${primitives}
${inputs}
const tools=createCompanyViewTools({Section,CollapsibleBlock,Grid,Input,hasValue:v=>Boolean(String(v||'').trim()),Brand:({name})=><strong>{name}</strong>});
function NativeProduct(){
 const [showNewProductMasterForm,setShowNewProductMasterForm]=useState(false),[newProductMaster,setNewProductMaster]=useState({});
 const productCategoryOptions=['Fugemasse / silikon','Membran'],productCheckpointTypeOptions=['standard'],productCheckpointTypeLabels={},productCheckpointSystemOptions=['all'],productCheckpointSystemLabels={};
 const emptyNewProductMaster=()=>({}),createProductMasterRow=()=>window.writes.push(['product',newProductMaster]);
 return ${nativeProduct};
}
function App(){
 const [mode,setMode]=useState('profile'),[area,setArea]=useState('products'),[canEdit,setEdit]=useState(true),[company,setCompany]=useState({companyName:'QA Firma med langt navn',orgNumber:'123456789',address:'QA Gate 1',phone:'12345678',email:'firma@example.invalid',website:'https://example.invalid'});
 window.setEdit=setEdit;
 return <div data-expo-app-shell="true"><nav aria-label="QA flater">{['profile','support','admin'].map(id=><button key={id} onClick={()=>setMode(id)}>{id}</button>)}</nav><main>
 <div hidden={mode!=='profile'}>{tools.renderCompanyProfilePanel({company,setCompany,name:company.companyName,canEdit,loginEmail:'login@example.invalid',uploadLogo:()=>window.writes.push('logo'),saveProfile:()=>window.writes.push(['profile',company])})}</div>
 <div hidden={mode!=='support'}><Support authUser={{id:'qa'}} supabaseClient={client} standalone/></div>
 <section hidden={mode!=='admin'}><h2>Systemadmin</h2><Admin authUser={{id:'qa'}} supabaseClient={client} area={area} onAreaChange={setArea}><div className="item adminAccordionItem" data-admin-area="products"><div className="item"><h3>Admin Produktmaster</h3><div className="cards projectListHeaderCards">{['Produkter/varianter','Koblet mot app','Med dokumenter','Status'].map(label=><div className="tile" key={label}><b>0</b><span>{label}</span></div>)}</div><NativeProduct/></div></div></Admin></section>
 </main></div>;
}
createRoot(document.getElementById('app')).render(<App/>);installSystemAdminStoreCatalogUx();
`);
const result=await build({root,configFile:false,logLevel:'silent',plugins:[react()],resolve:{alias:{'react/jsx-runtime':root+'/node_modules/react/jsx-runtime.js'}},build:{write:false,minify:false,cssCodeSplit:false,rollupOptions:{input:path.join(tmp,'entry.jsx'),output:{inlineDynamicImports:true}}}});
const js=result.output.find(x=>x.type==='chunk').code,css=result.output.filter(x=>x.fileName.endsWith('.css')).map(x=>x.source).join('\n');
const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html; charset=utf-8');res.end('<meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+'</style><div id="app"></div><script type="module">'+js.replaceAll('</script','<\\/script')+'</script>');});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
let browser,checks=0;const eq=(a,b,label)=>{assert.deepEqual(a,b,label);checks++;};
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1363,height:936}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(7000);
 await page.goto('http://127.0.0.1:'+server.address().port);
 await page.getByRole('heading',{name:'Firmaprofil',exact:true}).waitFor();
 await page.locator('.company-profile-workspace .collapsibleBlock>summary').click();
 await page.getByLabel('Adresse *',{exact:true}).fill('Bevart usendt profiladresse');
 const address=await page.getByLabel('Adresse *',{exact:true}).elementHandle();
 await page.locator('.company-profile-workspace .ux-preview>summary').click();
 await page.getByText('Bevart usendt profiladresse',{exact:true}).first().waitFor();
 for(const width of [320,390,768,1363,1920]){
  await page.setViewportSize({width,height:936});
  eq(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'profile no horizontal overflow '+width);
  eq(await page.locator('.company-profile-workspace>h2').evaluate(el=>getComputedStyle(el).fontSize),width<=620?'29px':'32px','profile shared title '+width);
  eq(await page.getByLabel('Adresse *',{exact:true}).evaluate(el=>getComputedStyle(el).fontSize),'16px','profile input text '+width);
  eq(await page.locator('.logoBox').evaluate(el=>{const nodes=[...el.children].map(n=>n.getBoundingClientRect());return nodes.every((rect,i)=>i===0||rect.top>=nodes[i-1].bottom);}),true,'logo controls never overlap '+width);
  eq(await page.getByRole('button',{name:'Lagre firmaprofil',exact:true}).evaluate(el=>el.getBoundingClientRect().height>=44),true,'profile target '+width);
 }
 await page.setViewportSize({width:1363,height:936});await page.screenshot({path:'/tmp/profile-workspace-036.png',fullPage:true});
 await page.getByRole('button',{name:'support',exact:true}).click();
 await page.getByRole('button',{name:'Ny henvendelse',exact:true}).click();
 await page.getByLabel('Emne',{exact:true}).fill('Usendt kontroll');await page.getByLabel('Beskrivelse',{exact:true}).fill('Behold dette spørsmålet.');
 const description=await page.getByLabel('Beskrivelse',{exact:true}).elementHandle();
 await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
 await page.getByLabel('Beskrivelse',{exact:true}).waitFor({state:'visible'});
 eq(await page.getByLabel('Beskrivelse',{exact:true}).evaluate((el,node)=>el===node,description),true,'support retains actual textarea after revalidation');
 eq(await page.getByLabel('Beskrivelse',{exact:true}).inputValue(),'Behold dette spørsmålet.','support retains unsent draft');
 await page.getByRole('button',{name:'Avbryt',exact:true}).click();
 await page.getByRole('button',{name:/#5 QA samtale/}).click();await page.getByText('Et bevart svar med lesbar tekst.',{exact:true}).waitFor();
 await page.getByLabel('Skriv svar',{exact:true}).fill('Usendt svar');
 for(const width of [320,390,768,1363,1920]){
  await page.setViewportSize({width,height:936});
  eq(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'support no horizontal overflow '+width);
  eq(await page.locator('.pd-support-page-heading h2').evaluate(el=>getComputedStyle(el).fontSize),width<=620?'29px':'32px','support shared title '+width);
  eq(await page.locator('.pd-support-message-body').evaluate(el=>getComputedStyle(el).fontSize),'16px','support readable message '+width);
 }
 await page.screenshot({path:'/tmp/support-workspace-036.png',fullPage:true});
 await page.getByRole('button',{name:'admin',exact:true}).click();
 await page.getByRole('button',{name:'▶ Nytt produkt',exact:true}).click();await page.getByLabel('Produktnavn',{exact:true}).fill('Bevart produktkladd');
 await page.getByLabel('Legg til Sopro garantikontrollpunkt samtidig',{exact:true}).check();await page.getByLabel('Garantikontrollpunkttekst',{exact:true}).fill('Bevart kontrollpunkt');
 const product=await page.getByLabel('Produktnavn',{exact:true}).elementHandle();
 for(const width of [320,390,768,1363,1920]){
  await page.setViewportSize({width,height:936});
  eq(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'native product form no overflow '+width);
  eq(await page.getByLabel('Produktnavn',{exact:true}).evaluate(el=>getComputedStyle(el).fontSize),'16px','native product input text '+width);
  eq(await page.getByLabel('Legg til Sopro garantikontrollpunkt samtidig',{exact:true}).evaluate(el=>el.getBoundingClientRect().width),20,'checkbox uses native compact width '+width);
  eq(await page.locator('.projectListHeaderCards').evaluate(el=>new Set([...el.children].map(child=>child.getBoundingClientRect().top)).size),width<=760?2:1,'compact product metrics '+width);
 }
 await page.setViewportSize({width:1363,height:936});await page.screenshot({path:'/tmp/product-workspace-036.png',fullPage:true});
 await page.getByRole('button',{name:'Internt vareregister',exact:true}).click();
 await page.locator('#expo-systemadmin-store-catalog .catalog-import>summary').click();
 await page.getByPlaceholder('Søk etter vare, varenummer eller GTIN …',{exact:true}).fill('armatur');
 await page.getByText('QA Armatur med langt produktnavn',{exact:true}).waitFor();
 eq(await page.getByRole('button',{name:'Kontroller og last opp',exact:true}).isDisabled(),true,'catalog no upload without chosen file');
 for(const width of [320,390,768,1363,1920]){
  await page.setViewportSize({width,height:936});
  eq(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'catalog no horizontal overflow '+width);
  eq(await page.locator('.catalog-import-body>p').evaluate(el=>getComputedStyle(el).fontSize),'16px','catalog readable import instructions '+width);
  eq(await page.locator('#expo-systemadmin-store-catalog>div>h3').evaluate(el=>getComputedStyle(el).fontSize),width<=620?'29px':'32px','catalog shared title '+width);
 }
 await page.screenshot({path:'/tmp/catalog-workspace-036.png',fullPage:true});
 await page.getByRole('button',{name:'Produktmaster',exact:true}).click();
 eq(await page.getByLabel('Produktnavn',{exact:true}).evaluate((el,node)=>el===node,product),true,'native product stays mounted on area switch');
 eq(await page.getByLabel('Produktnavn',{exact:true}).inputValue(),'Bevart produktkladd','native product keeps draft');
 eq(await page.getByLabel('Garantikontrollpunkttekst',{exact:true}).inputValue(),'Bevart kontrollpunkt','nested checkpoint keeps draft');
 await page.getByRole('button',{name:'profile',exact:true}).click();
 eq(await page.getByLabel('Adresse *',{exact:true}).evaluate((el,node)=>el===node,address),true,'profile retains actual field');
 eq(await page.getByLabel('Adresse *',{exact:true}).inputValue(),'Bevart usendt profiladresse','profile keeps unsaved value');
 await page.evaluate(()=>window.setEdit(false));
 await page.getByText('Firmaprofilen kan endres av Firmaadmin.',{exact:true}).waitFor();
 eq(await page.getByLabel('Adresse *',{exact:true}).isDisabled(),true,'profile read-only fields remain disabled');
 eq(await page.getByRole('button',{name:'Lagre firmaprofil',exact:true}).count(),0,'read-only profile has no save');
 eq(await page.evaluate(()=>window.writes),[],'no profile/product/upload callbacks during layout and navigation');
 eq(await page.evaluate(()=>window.calls.filter(c=>!['support_context','support_list','support_get','current_user_has_internal_store_catalog_access','current_user_can_manage_internal_store_catalog','get_pending_internal_store_catalog_import','search_internal_store_catalog'].includes(c.name))),[],'read-only transport only');
 eq(errors,[],'no page errors');
 console.log('Profile/support/register: '+checks+' Chromium assertions PASS; four real surfaces, five widths, native product/checkpoint form extracted from current main, actual DOM/drafts and no external writes.');
}finally{await browser?.close();await new Promise(r=>server.close(r));fs.rmSync(tmp,{recursive:true,force:true});}
