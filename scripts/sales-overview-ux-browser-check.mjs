import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import {execFileSync} from 'node:child_process';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=process.cwd(), temp=fs.mkdtempSync(path.join(os.tmpdir(),'sales-overview-ux-'));
let n=0;const eq=(a,b,label)=>{assert.deepEqual(a,b,label);n++;};
// Actual list and legacy case renderer, global CSS and existing Befaring adapter.
// Only transport and unrelated contract surfaces are synthetic. No live writes.
const source=fs.readFileSync('src/modules/sales/SalesModuleCore.jsx','utf8');
eq(source.includes('viewStateRef={listViewStateRef}'),true,'core owns view state beyond list unmount');
eq(source.includes('viewScope={salesStorageKey}'),true,'view scope uses existing company/user boundary');
fs.writeFileSync(path.join(temp,'entry.jsx'),`
import React,{useState,useRef} from '${root}/node_modules/react/index.js';
import {createRoot} from '${root}/node_modules/react-dom/client.js';
import List from '${root}/src/modules/sales/components/SalesListView.jsx';
import Detail from '${root}/src/modules/sales/components/SalesDetailViewLegacy.jsx';
import {installSalesSurveyFilterUx} from '${root}/src/modules/sales/salesSurveyFilterUx.js';
import '${root}/src/style.css';import '${root}/src/modules/sales/sales.css';
installSalesSurveyFilterUx();
const request=(id,status,extra={})=>({id,title:'Bad '+id,customer:'QA Kunde',email:'qa@example.invalid',address:'Testveien',status,statusClass:'status-survey',nextStep:'Opprett tilbud',offerLines:[],offerOptions:[],inspectionPhotos:[],...extra});
function App(){const [id,setId]=useState(null),[scope,setScope]=useState('firma-a'),view=useRef(null);
const [requests]=useState(()=>[request('REQ','Forespørsel'),...Array.from({length:12},(_,i)=>request('SURVEY-'+i,'Befaring',{__summaryOnly:i===0})),request('ACCEPT','Akseptert'),request('DECLINE','Avvist'),request('ARCHIVE','Tilbud',{archivedAt:'2026-01-01'}),request('DUE','Tilbud',{offerEmailSentAt:'2026-01-01',offerEmailVersionNumber:1}),request('OFFER','Tilbud',{sentOfferVersionId:'version-1',publicToken:'synthetic',offerTitle:'QA Tilbud',offerLines:[{id:'l',description:'Arbeid',amount:'1000'}]})]);
window.switchScope=()=>{setId(null);setScope('firma-b');};
window.openOffer=()=>setId('OFFER');window.calls??=[];
const callback=name=>(...args)=>window.calls.push({name,args});
return <><header style={{height:156}}>Expo ProffDok</header><main data-scope={scope}><section className="sales-workspace-intro"><h2>Befaring / Tilbud / Aksept</h2><p className="note">Her håndterer du forespørsler, Våtromstilbud og Generelle tilbud.</p></section><div data-sales-resume-workspace="true"><div className="sales-module-actions"><button onClick={callback('offer')}>+ Nytt tilbud</button></div>{id?<Detail selectedRequest={requests.find(r=>r.id===id)} summary={{}} goToList={()=>setId(null)} loggedInResponsible="QA" openEditRequest={callback('editCustomer')} openSurveyPlanning={callback('survey')} openInspectionNote={callback('inspection')} openOfferBuilder={callback('editOffer')} openCustomerOfferFromRequestId={callback('customerOffer')} copyCustomerOfferLink={callback('copy')} sendOfferEmail={callback('send')} handleDownloadPublishedOfferPdf={callback('pdf')}/>:<List key={scope} activeRequests={requests} viewStateRef={view} viewScope={scope} onOpenRequest={setId} onCreateRequest={callback('create')} onCreateOffer={callback('offer')}/>}</div></main></>;
}createRoot(document.getElementById('app')).render(<App/>);`);
const bundle=await build({configFile:false,root,define:{'process.env.NODE_ENV':'"production"'},logLevel:'silent',resolve:{alias:{react:path.join(root,'node_modules/react'),'react-dom':path.join(root,'node_modules/react-dom')}},plugins:[react(),{name:'isolated-transport',enforce:'pre',resolveId(id){if(id.endsWith('/salesSupabase.js'))return '\0transport';if(id.endsWith('/salesRequestLazyLoading.js'))return '\0lazy';if(/\/(SalesSupportNotice|CordelOfferExport|SalesContractActions|SalesContractWizard|SalesWetroomFollowUpActions)\.jsx$/.test(id))return '\0empty';},load(id){if(id==='\0empty')return 'export default function(){return null;}';if(id==='\0transport')return 'export const createDefaultSalesSupabaseClient=()=>({});export const getStoragePublicUrl=()=>"";export const uploadStorageFile=async()=>{throw Error("No upload in UX check");};export const getSalesRequestsLoadState=()=>({status:"ready"});export const subscribeSalesRequestsLoadState=()=>()=>{};export const getSalesSupportCompanyId=()=>"";export const resolveSalesCompanyScope=async()=>({data:"firma-a"});export const setSalesRequestArchivedAt=async(c,args)=>{window.calls.push({name:"archive",args});return {};};';if(id==='\0lazy')return 'export async function loadSalesRequestDetailForOpen(c,company,id){window.pendingId=id;await new Promise(resolve=>window.resolveDetail=resolve);return window.denyDetail?{error:{message:"Tilgang borte"}}:{data:{id,note:"Fersk servertekst"}};}';if(process.env.SALES_UX_BASELINE&&id.endsWith('/components/SalesListView.jsx'))return execFileSync('git',['show','origin/main:src/modules/sales/components/SalesListView.jsx'],{encoding:'utf8'});}}],build:{write:false,minify:false,lib:{entry:path.join(temp,'entry.jsx'),formats:['iife'],name:'SalesUX',cssFileName:'sales-ux'}}});
const out=(Array.isArray(bundle)?bundle[0]:bundle).output, js=out.find(x=>x.type==='chunk').code,css=out.filter(x=>x.fileName.endsWith('.css')).map(x=>x.source).join('\n');
const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html; charset=utf-8');res.end('<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+'</style><div id="app"></div><script>'+js.replaceAll('</script','<\\/script')+'</script>');});
await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
try{browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:1363,height:936}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForTimeout(100);if(errors.length)throw Error(errors.join('\n'));await page.getByRole('tab',{name:'Under arbeid 13 saker'}).waitFor();
eq(await page.getByRole('button',{name:'+ Nytt tilbud',exact:true}).count(),1,'one visible direct offer shortcut');await page.getByRole('button',{name:'+ Nytt tilbud',exact:true}).click();eq((await page.evaluate(()=>window.calls)).at(-1).name,'offer','same offer callback');
// Return to the same view rather than resetting to an empty queue.
await page.getByRole('tab',{name:'Under arbeid 13 saker'}).click();await page.getByRole('button',{name:/SURVEY-11/}).scrollIntoViewIfNeeded();
const scroll=await page.evaluate(()=>scrollY);await page.getByRole('button',{name:/SURVEY-11/}).click();await page.getByRole('button',{name:'Tilbake',exact:true}).click();
eq(await page.getByRole('tab',{name:'Under arbeid 13 saker'}).getAttribute('aria-selected'),'true','return keeps work queue');
await page.waitForFunction(y=>Math.abs(scrollY-y)<4,scroll);n++;
await page.getByRole('searchbox').fill('SURVEY-0');eq(await page.getByRole('tab',{name:'Alle 18 saker'}).getAttribute('aria-selected'),'true','existing search still selects all');
await page.getByRole('button',{name:/SURVEY-0/}).click();await page.waitForFunction(()=>window.pendingId==='SURVEY-0');
eq(await page.locator('.sales-case-app').count(),0,'summary cannot open before fresh detail');
await page.evaluate(()=>window.resolveDetail());await page.getByRole('button',{name:'Tilbake',exact:true}).click();eq(await page.getByRole('searchbox').inputValue(),'SURVEY-0','search survives detail');
await page.evaluate(()=>window.switchScope());await page.waitForFunction(()=>document.querySelector('main[data-scope]')?.dataset.scope==='firma-b');eq(await page.getByRole('searchbox').inputValue(),'','new company cannot reuse old filter');eq(await page.getByRole('tab',{name:'Forespørsler 1 saker'}).getAttribute('aria-selected'),'true','new scope starts normally');
// Real adapter still finds direct text labels and delegates to existing search.
await page.getByRole('tab',{name:'Vis saker som står i Befaring'}).click();eq(await page.getByRole('searchbox').inputValue(),'Befaring','Befaring shortcut preserved');eq(await page.locator('.sales-request-card').count(),12,'all survey cases remain');
await page.getByRole('tab',{name:'Akseptert 1 saker'}).click();eq(await page.getByRole('searchbox').inputValue(),'','native status clears only survey query');eq(await page.locator('.sales-request-card').count(),1,'accepted bucket preserved');
for(const width of [1363,768,390,320]){await page.setViewportSize({width,height:936});await page.evaluate(()=>scrollTo(0,0));eq(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'no sideways scroll '+width);eq(await page.locator('.sales-summary-grid').count(),0,'no duplicate passive counters '+width);const actions=page.locator('.sales-create-actions');eq((await actions.boundingBox()).y>(await page.locator('.sales-hero').boundingBox()).y,true,'creation actions inside hero '+width);eq(await page.locator('.sales-module-actions').isVisible(),false,'no standalone action row '+width);const box=await page.getByRole('searchbox').boundingBox();if(box.y>=500&&process.env.SALES_UX_SCREENSHOTS){await page.screenshot({path:path.join(process.env.SALES_UX_SCREENSHOTS,'failing-'+width+'.png'),fullPage:true});console.log(width,box);}eq(box.y<500,true,'search reachable '+width);eq((await page.getByRole('tab',{name:'Akseptert 1 saker'}).boundingBox()).height>=44,true,'status target usable '+width);if(width<=390)eq((await page.getByRole('tab',{name:'Forespørsler 1 saker'}).boundingBox()).width<(await page.locator('.sales-status-overview').boundingBox()).width*.6,true,'two status columns '+width);if(process.env.SALES_UX_SCREENSHOTS)await page.screenshot({path:path.join(process.env.SALES_UX_SCREENSHOTS,'sales-list-'+width+'.png'),fullPage:true});}
await page.setViewportSize({width:1363,height:936});await page.evaluate(()=>window.openOffer());await page.locator('.sales-case-app').waitFor();
eq(await page.locator('.sales-module-actions').isVisible(),true,'original shortcut still visible outside overview');
eq(await page.getByRole('button',{name:'Se kundens tilbud',exact:true}).count(),1,'one customer offer action');eq(await page.getByRole('button',{name:'Rediger tilbud',exact:true}).count(),1,'one edit offer action');
for(const [label,name] of [['Se kundens tilbud','customerOffer'],['Rediger tilbud','editOffer'],['Befaringsnotat','inspection'],['Rediger kunde','editCustomer'],['Kopier kundelink','copy'],['Send tilbud på e-post','send']]){await page.getByRole('button',{name:label,exact:true}).click();eq((await page.evaluate(()=>window.calls)).at(-1).name,name,'same callback '+label);}
for(const width of [1363,390,320]){await page.setViewportSize({width,height:936});await page.evaluate(()=>scrollTo(0,300));eq(await page.locator('.sales-case-app .sales-header').evaluate(e=>getComputedStyle(e).position),'static','case header never sticky '+width);eq(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'case fits '+width);await page.evaluate(()=>scrollTo(0,0));if(process.env.SALES_UX_SCREENSHOTS)await page.screenshot({path:path.join(process.env.SALES_UX_SCREENSHOTS,'sales-case-'+width+'.png'),fullPage:true});}
eq(errors,[],'no browser errors');console.log('PASS Sales overview/case UX: '+n+' Chromium checks');
}finally{await browser?.close();server.close();fs.rmSync(temp,{recursive:true,force:true});}
