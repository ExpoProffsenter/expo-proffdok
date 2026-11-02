import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=process.cwd(),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'warranty-workspace-'));
const warrantyModule=process.env.WARRANTY_UI_SOURCE||path.join(root,'src/modules/warranty/warrantyViewTools.js');
const workspacePath=path.join(root,'src/modules/ui/proffdokWorkspace.css');
const workspaceStyles=workspacePath;
const main=fs.readFileSync('src/main.jsx','utf8');
const native=(from,to)=>{const a=main.indexOf('  function '+from+'('),b=main.indexOf(to,a+1);assert(a>=0&&b>a,from+' native extraction');return main.slice(a,b);};
const primitives=native('Section','  const { renderProductSections }')+native('Input','  const { ProjectImagesPanel')+native('SignaturePad','  const { Report, CustomerReport }')+native('InfoCard','  function SignatureCard(');
let browser,checks=0,visits=[];
const eq=(a,b,label)=>{assert.deepEqual(a,b,label);checks++;};
fs.writeFileSync(path.join(tmp,'entry.jsx'),`
import React,* as ReactNS from '${root}/node_modules/react/index.js';
import {createRoot} from '${root}/node_modules/react-dom/client.js';
import * as import_jsx_runtime from '${root}/node_modules/react/jsx-runtime.js';
import * as import_lucide_react from '${root}/node_modules/lucide-react/dist/esm/lucide-react.mjs';
import {createWarrantyViewTools} from '${warrantyModule}';
import {createChecklistEditor} from '${root}/src/modules/checklist/checklistTools.js';
import {SOPRO_SYSTEM_CHECKLIST_TEMPLATES} from '${root}/src/modules/config/soproChecklistTemplates.mjs';
import {soproWarrantySystems} from '${root}/src/modules/config/projectConfig.js';
import {APP_RUNTIME_STYLES} from '${root}/src/modules/app/appRuntimeStyles.js';
import '${root}/src/style.css';import '${workspaceStyles}';
document.head.insertAdjacentHTML('beforeend','<style>'+APP_RUNTIME_STYLES+'</style>');
const import_react={default:React,...ReactNS};const stopInteractivePropagation=e=>e.stopPropagation();
${primitives}
const hasValue=v=>v!=null&&String(v).trim()!=='';
${main.slice(main.indexOf('  var soproSystemChecklistTemplates ='),main.indexOf('  var dedupeChecklistTemplate ='))}
${main.slice(main.indexOf('  var getDynamicSoproWarrantyRequirementStatus ='),main.indexOf('  var emptyWarranty ='))}
const tools=createWarrantyViewTools({Section,Grid,Input,Select,hasValue,emptyWarranty:()=>({enabled:false,system:'',issued:false}),getWarrantyYears:w=>Number(w?.durationYears)||10,WARRANTY_YEAR_OPTIONS:[10,12,15],WARRANTY_YEARS:10,makeWarrantyValidUntil:()=> '2041-10-01',checklistPointAnchor,warrantyTermsPdfFileName:'qa-vilkar.pdf',warrantyArchiveNotice:'Bevar originaldokumentasjonen.',standardWetroomTemplateTradeOptions:['Rørlegger','Elektriker'],standardWetroomTemplateDefaultTrades:[],customChecklistTradeIconUrl:()=>''});
const Editor=createChecklistEditor({Section,Grid,Textarea,getActiveChecklistTemplate:getSoproChecklistTemplate,getWarrantyYears:w=>w.durationYears||15,canUseCustomChecklistForWarranty:()=>false,customChecklistTradeOptions:[],hasValue,customChecklistCategoryPrefix:'Egne sjekkpunkter',checklistPointAnchor,isWarrantyCheckpoint:isSoproWarrantyPoint,isSoproWarrantyPoint,isSoproWarrantyCategory,checklistAttachmentTradeOptions:[],checklistAttachmentDocumentTypeOptions:[],publicProjectFileUrl:()=>''});
window.calls=[];window.transport='satisfied';window.pending=[];
window.mockClient={rpc:async(name)=>{window.calls.push({name});return {data:'qa-company',error:null};},from:()=>{const chain=new Proxy({}, {get:(_,key)=>key==='then'?(resolve)=>{const mode=window.transport;const reply=()=>resolve(mode==='error'?{data:null,error:{message:'Syntetisk lesefeil'}}:{data:mode==='missing'?[]:[{id:'qa-project',data:{project:window.projectIdentity,tilbud:{files:[{documentType:'contract',name:'Syntetisk kontrakt.pdf'}]}}}],error:null});if(mode==='pending')window.pending.push(reply);else reply();}:()=>chain});return chain;}};
const baseProject={projectName:'Syntetisk våtrom – garanti',projectNumber:'QA-036',customer:'Syntetisk mottaker med et langt, norsk navn som skal vises fullstendig uten vannrett scrolling ÆØÅ',address:'Syntetisk adresse',date:'2026-10-01'};
function App(){
 const [scenario,setScenario]=React.useState({system:'sopro-fdf-525-527',state:'empty',years:15}),[revision,setRevision]=React.useState(0);
 const [warranty,setWarranty]=React.useState({enabled:true,system:'sopro-fdf-525-527',durationYears:15});
 const [project,setProject]=React.useState(baseProject),[tab,setTab]=React.useState('garanti');
 window.projectIdentity=project;
 const dynamicGroups=scenario.dynamic?[{category:'Sopro garantikontrollpunkter – Syntetisk produkt',items:['Syntetisk produktkontroll – bilde eller kommentar'],requirements:{'Syntetisk produktkontroll – bilde eller kommentar':{image_required:true,comment_required:true}}}]:[];
 const groups=[...getSoproChecklistTemplate(scenario.system),...dynamicGroups],checklist=Object.fromEntries(groups.map(g=>[g.category,Object.fromEntries(g.items.map((item,index)=>[item,scenario.state==='complete'||scenario.state==='issued'||scenario.state==='legacy'?{status:'Ok',comment:'Syntetisk dokumentasjon'}:scenario.state==='partial'&&index===0?{status:'Ok',comment:'Syntetisk dokumentasjon'}:{}]))]));
 const fixed=getSoproWarrantyPointStatus(checklist,scenario.system),dynamic=getDynamicSoproWarrantyRequirementStatus(checklist,dynamicGroups);
 const points={points:[...fixed.points,...dynamic.points],missing:[...fixed.missing,...dynamic.points.filter(p=>!p.done)],total:fixed.total+dynamic.total,done:fixed.done+dynamic.done,complete:fixed.complete&&dynamic.complete,percent:Math.round((fixed.done+dynamic.done)/(fixed.total+dynamic.total)*100)},complete=points.complete;
 const readiness={ready:complete,missing:complete?[]:['Alle kontrollpunkter for valgt Sopro-system må være fullført.'],systemChecklistTotal:points.total,systemChecklistDone:points.done,systemChecklistPercent:points.percent,missingSystemChecklistPoints:points.missing,systemChecklistPoints:points.points,systemChecklistComplete:complete,checklistComplete:complete,checklistTotal:points.total,checklistDone:points.done,overtagelseSigned:complete,openDeviationCount:0,hasPhotos:complete,termsAccepted:complete,approvedSoproSystemSelected:!!scenario.system,reportGenerated:scenario.state==='issued'};
 window.showWarrantyQA=(next)=>{window.transport=next.transport||'satisfied';setScenario(next);setProject({...baseProject,projectNumber:'QA-'+(next.identity||'036')});setWarranty({enabled:next.state!=='inactive',system:next.system,durationYears:next.years||15,issued:next.state==='issued',status:next.state==='issued'?'issued':'draft',guaranteeNumber:['issued','legacy'].includes(next.state)?'SYNTHETIC-GARANTI-001':'',issuedAt:'2026-10-01T12:00:00Z',termsAccepted:next.state==='issued',termsAcceptedAt:'2026-10-01T12:00:00Z',reportGeneratedAt:'2026-10-02T12:00:00Z',reportGeneratedFileName:'Syntetisk sluttdokumentasjon med lang filreferanse ÆØÅ.pdf'});setTab('garanti');setRevision(v=>v+1);};
 window.getWarrantyQA=()=>({warranty,project,scenario,points,tab});
 React.useEffect(()=>{window.qaRevision=revision;},[revision]);
 const navigate=next=>{window.calls.push({name:'navigate',tab:next});setTab(next);};
 return <div data-expo-app-shell="true" data-expo-project-shell="1"><main><p className="note">Isolert native komponenttest · syntetisk backend · ${process.env.WARRANTY_UI_LABEL||'kandidat'}</p>{tab==='garanti'?<tools.WarrantyPanel key={revision} warranty={warranty} setWarranty={setWarranty} readiness={readiness} issueWarranty={()=>window.calls.push({name:'issue'})} systems={soproWarrantySystems} goToTab={navigate} project={project} company={{companyName:'Syntetisk QA-firma'}} name="Syntetisk QA-firma" overtagelse={{dato:'2026-10-01'}} isProjectLocked={['locked','issued','legacy'].includes(scenario.state)} downloadClickablePdfReport={()=>window.calls.push({name:'pdf'})}/>:<section><h2>Sjekklister</h2><Editor checklist={checklist} setChecklistValue={(...args)=>window.calls.push({name:'answer',args})} addChecklistPhoto={()=>{}} addFiles={()=>{}} files={[]} setFiles={()=>{}} warranty={warranty} activeChecklistTemplate={groups} initiallyExpanded customChecklistEnabled={false} consumeChecklistJump={false}/></section>}</main></div>;
}createRoot(document.getElementById('app')).render(<App/>);
`);
const result=await build({root,configFile:false,logLevel:'silent',resolve:{alias:{'react/jsx-runtime':root+'/node_modules/react/jsx-runtime.js'}},plugins:[react(),{name:'warranty-isolated-read-transport',enforce:'pre',resolveId(id){if(id.endsWith('/salesSupabase.js'))return '\0qa-sales';},load(id){if(id==='\0qa-sales')return 'export const createDefaultSalesSupabaseClient=()=>({from:(...a)=>window.mockClient.from(...a),rpc:(...a)=>window.mockClient.rpc(...a)});';},transform(code,id){if(process.env.WARRANTY_UI_CSS&&id.endsWith('/projectSubflows036.css'))return fs.readFileSync(process.env.WARRANTY_UI_CSS,'utf8');}}],build:{write:false,minify:false,cssCodeSplit:false,rollupOptions:{input:path.join(tmp,'entry.jsx'),output:{inlineDynamicImports:true}}}});
const js=result.output.find(x=>x.type==='chunk').code,css=result.output.filter(x=>x.fileName.endsWith('.css')).map(x=>x.source).join('\n');
const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html;charset=utf-8');res.end('<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+'</style><div id="app"></div><script type="module">'+js.replaceAll('</script','<\\/script')+'</script>');});await new Promise(r=>server.listen(0,'127.0.0.1',r));
try {
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1363,height:936}}),errors=[];
 page.on('pageerror',e=>{errors.push(e.message);console.error(e.stack||e.message);});page.setDefaultTimeout(6000);
 await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
 await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>window.qaRevision===0);
 const show=async (system,state='empty',extra={})=>{const before=await page.evaluate(()=>window.qaRevision);await page.evaluate(s=>window.showWarrantyQA(s),{system,state,...extra});await page.waitForFunction(n=>window.qaRevision>n,before);};
 const photo=async name=>{if(process.env.WARRANTY_UI_SCREENSHOTS){fs.mkdirSync(process.env.WARRANTY_UI_SCREENSHOTS,{recursive:true});await page.screenshot({path:path.join(process.env.WARRANTY_UI_SCREENSHOTS,name+'.png'),fullPage:true});}};
 const bounds=async label=>{
  eq(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,label+' no page overflow');
  eq(await page.locator('.warranty-workspace button,.warranty-workspace summary').evaluateAll(es=>es.filter(e=>e.getClientRects().length).every(e=>getComputedStyle(e).fontSize==='16px'&&e.getBoundingClientRect().height>=44&&e.scrollWidth<=e.clientWidth+1)),true,label+' every action readable16/44');
  if(!process.env.WARRANTY_UI_BASELINE)eq(await page.locator('.warrantyReceiptValue p').evaluateAll(es=>es.filter(e=>e.getClientRects().length).every(e=>e.scrollWidth<=e.clientWidth+1&&getComputedStyle(e).fontSize==='16px')),true,label+' full receipt wraps');
  visits.push(label);
 };
 const systems=['sopro-aeb-815','sopro-fdf-525-527'];
 for(const system of systems){
  await show(system);const actual=await page.evaluate(()=>window.getWarrantyQA().points);
  eq(actual.total,system===systems[0]?14:19,'original source point count');
  eq(await page.locator('.warrantyJumpButton').count(),actual.total,'all original missing points present');
  if(!process.env.WARRANTY_UI_BASELINE){eq(await page.locator('.warrantyMissingGroup').count(),4,'four source categories');eq(await page.locator('.warrantyMissingGroup h4').allTextContents(),[...new Set(actual.points.map(p=>p.category))],'full original category labels');}
  eq(await page.getByRole('button',{name:'Utsted 15 års tetthetsgaranti',exact:true}).isDisabled(),true,'empty points keep issue blocked');
  for(const width of [320,390,768,1363,1920]){await page.setViewportSize({width,height:600});await bounds(system+' missing '+width);if([390,1363].includes(width))await photo(system+'-missing-'+width);}
  if(process.env.WARRANTY_UI_BASELINE)continue;
  for(const point of actual.points){
   await show(system);const jump=page.getByRole('button',{name:'Gå til: '+point.item,exact:true});
   if(point===actual.points[0]){await jump.focus();await page.keyboard.press('Enter');}else await jump.click();
   await page.locator('#'+point.anchorId+'.checklistPointFocus').waitFor();
   eq(await page.evaluate(()=>window.getWarrantyQA().tab),'sjekklister','native navigation '+point.anchorId);
   eq(await page.locator('#'+point.anchorId+' .checklistPointTitle>b').innerText(),point.item,'exact source text reached in native ChecklistEditor');
  }
  await show(system,'partial');eq(await page.locator('.warrantyJumpButton').count(),actual.total-4,'only documented points leave missing list');
  await show(system,'complete');await page.getByRole('heading',{name:'Klar til garanti',exact:true}).waitFor();
  eq(await page.getByRole('button',{name:'Utsted 15 års tetthetsgaranti',exact:true}).isEnabled(),true,'ready plus contract allows original issue gate without invoking');
  eq(await page.locator('.warrantyJumpButton').count(),0,'complete has no fabricated missing points');
  await show(system,'locked');eq(await page.getByRole('button',{name:'Garanti kan ikke utstedes i låst prosjekt',exact:true}).isDisabled(),true,'locked unissued stays blocked');
 }
 if(!process.env.WARRANTY_UI_BASELINE){
  await show(systems[1],'empty',{dynamic:true});eq(await page.locator('.warrantyMissingGroup').count(),5,'dynamic product category retained');eq(await page.locator('.warrantyJumpButton').count(),20,'original19 plus exact dynamic product point');
  const point=await page.evaluate(()=>window.getWarrantyQA().points.points.at(-1));await page.getByRole('button',{name:'Gå til: '+point.item,exact:true}).click();await page.locator('#'+point.anchorId+'.checklistPointFocus').waitFor();eq(await page.locator('#'+point.anchorId+' .checklistPointTitle>b').innerText(),point.item,'dynamic point reaches native editor');
 }
 await show(systems[1],'issued');await page.getByText('Vis mottaker og vilkårsforklaring',{exact:true}).click();
 await page.getByText('Vis grunnlag for garantien',{exact:true}).click();
 for(const width of [320,390,768,1363,1920]){await page.setViewportSize({width,height:600});await bounds('issued receipt '+width);if([390,1363].includes(width))await photo('fdf-issued-receipt-'+width);}
 if(!process.env.WARRANTY_UI_BASELINE){
  eq(await page.locator('.warrantyReceiptValue').first().innerText(),'Mottaker\n\n'+await page.evaluate(()=>window.getWarrantyQA().project.customer),'full long recipient remains visible');
  eq(await page.locator('.warrantyReceiptValue input,.warrantyReceiptValue textarea').count(),0,'receipt is static read-only information');
  eq(await page.getByRole('button',{name:'✅ Garanti utstedt',exact:true}).isDisabled(),true,'issued immutable');
  eq(await page.getByRole('button',{name:'Trekk tilbake utstedelse',exact:true}).count(),0,'locked history cannot withdraw');
  await page.getByRole('button',{name:'⬇ Last ned garantibevis / komplett PDF',exact:true}).click();
  eq(await page.evaluate(()=>window.calls.filter(c=>c.name==='pdf').length),1,'existing PDF callback once');
  await show(systems[1],'legacy');eq(await page.getByRole('heading',{name:'Garanti utstedt',exact:true}).count(),1,'legacy number retains issued state');
  for(const transport of ['missing','error','pending']){
   await show(systems[1],'complete',{transport,identity:transport});
   await page.getByText(transport==='missing'?'Lagre prosjektet før signert kontrakt kan kontrolleres.':transport==='error'?'Signert kontrakt kunne ikke kontrolleres. Oppdater siden og prøv igjen før garantien utstedes.':'Kontrollerer signert kontrakt i Avtalegrunnlag …',{exact:true}).waitFor();
   eq(await page.getByRole('button',{name:'Utsted 15 års tetthetsgaranti',exact:true}).isDisabled(),true,transport+' contract gate preserved');
   if(transport==='error'){for(const width of [320,390,768,1363,1920]){await page.setViewportSize({width,height:600});await bounds('contract error '+width);}await photo('fdf-contract-error-1920');}
  }
  await show(systems[0],'empty',{identity:'new'});await page.evaluate(()=>window.pending.splice(0).forEach(reply=>reply()));
  eq(await page.getByRole('button',{name:'Utsted 15 års tetthetsgaranti',exact:true}).isDisabled(),true,'late old contract does not bypass new missing points');
  await show(systems[1],'inactive');eq(await page.getByRole('button',{name:/Utsted.*tetthetsgaranti/}).count(),0,'inactive has no issuance');
  eq(await page.evaluate(()=>window.calls.filter(c=>c.name==='issue')),[],'zero issuance callbacks');
 }
 eq(errors,[],'no runtime errors');
 console.log(`Warranty native workspace PASS: ${checks} assertions / ${visits.length} state-width views; ${process.env.WARRANTY_UI_BASELINE?'baseline presentation only':'source AEB14/FDF19; all point jumps into expanded native editor; receipt, contract error/pending/late, locked/legacy.'} Synthetic backend only; no issuance/signature/customer write, no live FDF/all-role attestation.`);
}finally{await browser?.close();await new Promise(r=>server.close(r));fs.rmSync(tmp,{recursive:true,force:true});}
