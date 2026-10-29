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
import '${root}/src/style.css';import '${root}/src/modules/app/mobileResponsive41A.css';import '${root}/src/modules/sales/sales.css';import '${root}/src/modules/ui/proffdokWorkspace.css';
installSalesSurveyFilterUx();
const request=(id,status,extra={})=>({id,title:'Bad '+id,customer:'QA Kunde',email:'qa@example.invalid',address:'Testveien',status,statusClass:'status-survey',nextStep:'Opprett tilbud',offerLines:[],offerOptions:[],inspectionPhotos:[],...extra});
function App(){const [id,setId]=useState(null),[scope,setScope]=useState('firma-a'),view=useRef(null);
const [requests,setRequests]=useState(()=>[request('REQ','Forespørsel'),...Array.from({length:12},(_,i)=>request('SURVEY-'+i,'Befaring',{__summaryOnly:i===0})),request('ACCEPT','Akseptert'),request('DECLINE','Avvist'),request('ARCHIVE','Tilbud',{archivedAt:'2026-01-01'}),request('DUE','Tilbud',{offerEmailSentAt:'2026-01-01',offerEmailVersionNumber:1}),request('OFFER','Tilbud',{sentOfferVersionId:'version-1',publicToken:'synthetic',offerTitle:'QA Tilbud',offerLines:[{id:'l',description:'Arbeid',amount:'1000'}]})]);
window.switchScope=()=>{setId(null);setScope('firma-b');};
window.openOffer=()=>setId('OFFER');window.openOverview=()=>setId(null);window.addGeneralOffer=()=>setRequests(previous=>[...previous,request('GENERAL','Tilbud',{directOffer:true,source:'Butikktilbud / varesalg',offerTitle:'QA generelt tilbud'})]);window.useLongTitles=()=>setRequests(previous=>previous.map(r=>({...r,title:r.title+' · Rehabilitering av flere våtrom med omfattende leveranse og koordinering i en eiendom med lang prosjektbetegnelse',customer:'QA Eiendom og prosjektutvikling med et svært langt firmanavn AS',address:'Eksempelveien 123, oppgang med lang adressebeskrivelse'})));window.calls??=[];
const callback=name=>(...args)=>window.calls.push({name,args});
return <div data-expo-app-shell="true"><header style={{height:156,display:"grid",placeItems:"center",background:"#e9eff2",color:"#455e68",fontSize:14,border:"1px dashed #a8bbc4",boxShadow:"none"}}>Appheader · isolert komponentprøve</header><main data-scope={scope}><section className="sales-workspace-intro"><h2>Befaring / Tilbud / Aksept</h2><p className="note">Her håndterer du forespørsler, Våtromstilbud og Generelle tilbud.</p></section><div data-sales-resume-workspace="true"><div className="sales-module-actions"><button onClick={callback('offer')}>+ Nytt tilbud</button></div>{id?<Detail selectedRequest={requests.find(r=>r.id===id)} summary={{}} goToList={()=>setId(null)} loggedInResponsible="QA" openEditRequest={callback('editCustomer')} openSurveyPlanning={callback('survey')} openInspectionNote={callback('inspection')} openOfferBuilder={callback('editOffer')} openCustomerOfferFromRequestId={callback('customerOffer')} copyCustomerOfferLink={callback('copy')} sendOfferEmail={callback('send')} handleDownloadPublishedOfferPdf={callback('pdf')}/>:<List key={scope} activeRequests={requests} viewStateRef={view} viewScope={scope} onOpenRequest={setId} onCreateRequest={callback('create')} onCreateOffer={callback('offer')}/>}</div></main></div>;
}createRoot(document.getElementById('app')).render(<App/>);`);
const bundle=await build({configFile:false,root,define:{'process.env.NODE_ENV':'"production"'},logLevel:'silent',resolve:{alias:{react:path.join(root,'node_modules/react'),'react-dom':path.join(root,'node_modules/react-dom')}},plugins:[react(),{name:'isolated-transport',enforce:'pre',resolveId(id){if(id.endsWith('/salesSupabase.js'))return '\0transport';if(id.endsWith('/salesRequestLazyLoading.js'))return '\0lazy';if(/\/(SalesSupportNotice|CordelOfferExport|SalesContractActions|SalesContractWizard|SalesWetroomFollowUpActions)\.jsx$/.test(id))return '\0empty';},load(id){if(id==='\0empty')return 'export default function(){return null;}';if(id==='\0transport')return 'export const createDefaultSalesSupabaseClient=()=>({});export const getStoragePublicUrl=()=>"";export const uploadStorageFile=async()=>{throw Error("No upload in UX check");};export const getSalesRequestsLoadState=()=>({status:"ready"});export const subscribeSalesRequestsLoadState=()=>()=>{};export const getSalesSupportCompanyId=()=>"";export const resolveSalesCompanyScope=async()=>({data:"firma-a"});export const setSalesRequestArchivedAt=async(c,args)=>{window.calls.push({name:"archive",args});return {};};';if(id==='\0lazy')return 'export async function loadSalesRequestDetailForOpen(c,company,id){window.pendingId=id;await new Promise(resolve=>window.resolveDetail=resolve);return window.denyDetail?{error:{message:"Tilgang borte"}}:{data:{id,note:"Fersk servertekst"}};}';if(process.env.SALES_UX_AUDIT_BASELINE&&id.endsWith('/proffdokWorkspace.css'))return execFileSync('git',['show','HEAD:src/modules/ui/proffdokWorkspace.css'],{encoding:'utf8'});if(process.env.SALES_UX_BASELINE&&id.endsWith('/components/SalesListView.jsx'))return execFileSync('git',['show','origin/main:src/modules/sales/components/SalesListView.jsx'],{encoding:'utf8'});}}],build:{write:false,minify:false,lib:{entry:path.join(temp,'entry.jsx'),formats:['iife'],name:'SalesUX',cssFileName:'sales-ux'}}});
const out=(Array.isArray(bundle)?bundle[0]:bundle).output, js=out.find(x=>x.type==='chunk').code,css=out.filter(x=>x.fileName.endsWith('.css')).map(x=>x.source).join('\n');
const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html; charset=utf-8');res.end('<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+'</style><div id="app"></div><script>'+js.replaceAll('</script','<\\/script')+'</script>');});
await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
try{browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:1363,height:936}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort('blockedbyclient'));
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
for(const [label,name] of [['Se kundens tilbud','customerOffer'],['Rediger tilbud','editOffer'],['Befaringsnotat','inspection'],['Rediger kunde','editCustomer'],['Kopier kundelink','copy'],['Send tilbud på e-post','send'],['Last ned tilbud PDF','pdf']]){await page.getByRole('button',{name:label,exact:true}).click();eq((await page.evaluate(()=>window.calls)).at(-1).name,name,'same callback '+label);}
for(const width of [1363,390,320]){await page.setViewportSize({width,height:936});await page.evaluate(()=>scrollTo(0,300));eq(await page.locator('.sales-case-app .sales-header').evaluate(e=>getComputedStyle(e).position),'static','case header never sticky '+width);eq(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'case fits '+width);await page.evaluate(()=>scrollTo(0,0));if(process.env.SALES_UX_SCREENSHOTS)await page.screenshot({path:path.join(process.env.SALES_UX_SCREENSHOTS,'sales-case-'+width+'.png'),fullPage:true});}

// The native list/case callbacks above remain covered. Add visual contracts with
// the actual design cascade and realistic long labels, not a simplified mock UI.
await page.evaluate(()=>{window.openOverview();window.addGeneralOffer();});
await page.getByRole('tab',{name:/^Generelle tilbud\s*1$/}).waitFor();
const offerTypes=page.getByRole('tablist',{name:'Tilbudstype',exact:true});
await offerTypes.getByRole('tab',{name:/^Generelle tilbud\s*1$/}).click();
await page.getByRole('searchbox').fill('GENERAL');
eq(await page.locator('.sales-request-card').count(),1,'general-offer type filter reaches its original native case');
await page.locator('.sales-request-card').click();await page.getByRole('button',{name:'Tilbake',exact:true}).click();
eq(await page.getByRole('searchbox').inputValue(),'GENERAL','general-offer return retains search');
eq(await offerTypes.getByRole('tab',{name:/^Generelle tilbud\s*1$/}).getAttribute('aria-selected'),'true','general-offer return retains type filter');
await page.getByRole('searchbox').fill('');await offerTypes.getByRole('tab',{name:/^Våtromstilbud\s*18$/}).click();
eq(await page.locator('.sales-request-card').filter({hasText:'GENERAL'}).count(),0,'wetroom type filter excludes general offers');
await offerTypes.getByRole('tab',{name:/^Alle tilbud\s*19$/}).click();await page.getByRole('tab',{name:'Forespørsler 1 saker'}).click();
await page.getByRole('button',{name:'Ny forespørsel',exact:true}).click();eq((await page.evaluate(()=>window.calls)).at(-1).name,'create','same create-request callback');
await page.evaluate(()=>window.useLongTitles());
const visualEvidence=[];
const configurations=[{width:320,height:936},{width:390,height:936},{width:768,height:936},{width:1363,height:936},{width:1920,height:936},{width:1363,height:600},{width:390,height:600}];
const shots=process.env.SALES_UX_SCREENSHOTS;
if(shots)fs.mkdirSync(shots,{recursive:true});
for(const surface of ['overview','case']){
 await page.evaluate(mode=>mode==='overview'?window.openOverview():window.openOffer(),surface);
 await page.locator(surface==='overview'?'.sales-overview-app':'.sales-case-app').waitFor();
 for(const viewport of configurations){
  await page.setViewportSize(viewport);await page.evaluate(()=>scrollTo(0,0));
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  const layout=await page.locator(surface==='overview'?'.sales-overview-app':'.sales-case-app').evaluate(el=>{
   const round=value=>Math.round(value*1000)/1000;
   const visible=node=>node.getClientRects().length&&getComputedStyle(node).visibility!=='hidden';
   const name=node=>(node.getAttribute('aria-label')||node.textContent||node.getAttribute('placeholder')||'').trim().slice(0,100);
   const buttons=[...el.querySelectorAll('button')].filter(visible).map(node=>({name:name(node),width:round(node.getBoundingClientRect().width),height:round(node.getBoundingClientRect().height)}));
   const panels=[el,...el.querySelectorAll('.sales-shell,.sales-main,.sales-card,.sales-request-list,.sales-request-card,.sales-detail-card,.sales-hero,.sales-detail-hero,.sales-status-overview')].filter(visible);
   const primary=[...el.querySelectorAll('button,input:not([type=checkbox]),select,.sales-title,.sales-request-title')].filter(visible);
   const secondary=[...el.querySelectorAll('.sales-subtitle,.sales-request-customer,.sales-next-label,.sales-detail-card p')].filter(visible);
   const titles=[...el.querySelectorAll('.sales-title,.sales-request-title')].filter(visible);
   const hero=el.querySelector('.sales-hero,.sales-detail-hero'),title=el.querySelector('.sales-title');
   const heroStyle=hero&&getComputedStyle(hero),titleStyle=title&&getComputedStyle(title);
   const primaryIcons=[...el.querySelectorAll('button.sales-primary-button svg')].filter(visible);
   const noteButton=[...el.querySelectorAll('button')].find(node=>visible(node)&&node.textContent.trim()==='Befaringsnotat');
   let inspectionLines=null;
   if(noteButton){const walker=document.createTreeWalker(noteButton,NodeFilter.SHOW_TEXT);let node;const tops=[];while(node=walker.nextNode()){if(!node.textContent.includes('Befaringsnotat'))continue;const range=document.createRange();range.selectNodeContents(node);for(const rect of range.getClientRects())if(rect.width>0)tops.push(round(rect.top));}inspectionLines=new Set(tops).size;}
   return {
    primaryIconCount:primaryIcons.length,
    primaryIconColorMismatches:primaryIcons.filter(node=>getComputedStyle(node).color!==getComputedStyle(node.closest('button')).color).map(node=>({button:name(node.closest('button')),icon:getComputedStyle(node).color,buttonColor:getComputedStyle(node.closest('button')).color})),
    customerWeights:[...el.querySelectorAll('.sales-request-customer')].filter(visible).map(node=>getComputedStyle(node).fontWeight),
    inspectionLines,
    parity:{heroFound:Boolean(hero),heroImage:heroStyle?.backgroundImage,heroShadow:heroStyle?.boxShadow,heroRadius:heroStyle?.borderRadius,titleWeight:titleStyle?.fontWeight,titleSize:round(parseFloat(titleStyle?.fontSize||'0')),cardShadows:[...el.querySelectorAll('.sales-panel,.sales-detail-card,.sales-next-card')].filter(visible).filter(node=>getComputedStyle(node).boxShadow!=='none').map(node=>({className:node.className,shadow:getComputedStyle(node).boxShadow})),visibleBranding:[...el.querySelectorAll('.sales-brand')].filter(visible).length},
    pageFits:document.documentElement.scrollWidth<=innerWidth+1,
    buttonCount:buttons.length,
    smallButtons:buttons.filter(node=>node.width<44||node.height<44),
    internalOverflow:panels.filter(node=>node.scrollWidth>node.clientWidth+1).map(node=>({className:node.className,scroll:node.scrollWidth,client:node.clientWidth})),
    smallPrimary:primary.filter(node=>round(parseFloat(getComputedStyle(node).fontSize))<16).map(node=>({name:name(node),font:getComputedStyle(node).fontSize})),
    smallSecondary:secondary.filter(node=>round(parseFloat(getComputedStyle(node).fontSize))<14).map(node=>({name:name(node),font:getComputedStyle(node).fontSize})),
    titleOverflow:titles.filter(node=>node.scrollWidth>node.clientWidth+1).map(node=>({name:name(node),scroll:node.scrollWidth,client:node.clientWidth})),
   };
  });
  const label=surface+' '+viewport.width+'x'+viewport.height;
  visualEvidence.push({surface,...viewport,...layout});
  if(shots)await page.screenshot({path:path.join(shots,`long-${surface}-${viewport.width}x${viewport.height}.png`),fullPage:true});
  if(!process.env.SALES_UX_AUDIT_BASELINE){
   eq(layout.pageFits,true,'long-title page has no sideways overflow '+label);
   eq(layout.buttonCount>0,true,'visible native action geometry measured '+label);
   eq(layout.smallButtons,[],'all visible action targets >=44px, rounded to 0.001px '+label);
   eq(layout.internalOverflow,[],'no hidden horizontal overflow inside sales panels '+label);
   eq(layout.smallPrimary,[],'primary text and fields at least 16px '+label);
   eq(layout.smallSecondary,[],'secondary sales text at least 14px '+label);
   eq(layout.titleOverflow,[],'long titles fit their actual container '+label);
   eq(layout.parity.heroFound,true,'actual sales hero measured '+label);
   eq(layout.parity.heroImage,'none','hero has no decorative gradient '+label);
   eq(layout.parity.heroShadow,'none','hero is an open work surface '+label);
   eq(layout.parity.heroRadius,'0px','hero does not create another rounded card '+label);
   eq(layout.parity.titleWeight,'600','sales heading matches approved Startside weight '+label);
   eq(layout.parity.titleSize>(viewport.width<=760?28:33),true,'sales heading matches approved Startside scale '+label);
   eq(layout.parity.cardShadows,[],'list and case cards have no nested decorative shadows '+label);
   eq(layout.parity.visibleBranding,0,'no duplicate visible branding inside sales '+label);
   eq(layout.primaryIconCount>0,true,'actual primary icons measured '+label);
   eq(layout.primaryIconColorMismatches,[],'primary icon uses the same accessible color as button text '+label);
   if(surface==='overview')eq([...new Set(layout.customerWeights)],['400'],'secondary customer text has normal weight '+label);
   if(surface==='case'&&viewport.width<=420)eq(layout.inspectionLines,1,'Befaringsnotat remains one whole readable word '+label);
  }
 }
}
if(shots)fs.writeFileSync(path.join(shots,'geometry.json'),JSON.stringify(visualEvidence,null,2));
eq(errors,[],'no browser errors');console.log('PASS Sales overview/case UX: '+n+' Chromium checks');
}finally{await browser?.close();server.close();fs.rmSync(temp,{recursive:true,force:true});}
