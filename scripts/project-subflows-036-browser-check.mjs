import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=process.cwd(),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'project-subflows036-'));
const workspacePath=path.join(root,'src/modules/ui/proffdokWorkspace.css');
let workspaceStyles=workspacePath;
if(process.env.PROJECT_036_NEGATIVE){workspaceStyles=path.join(tmp,'baseline.css');fs.writeFileSync(workspaceStyles,fs.readFileSync(workspacePath,'utf8').replace("@import './projectSubflows036.css';",'').replace(/@import '\.\/([^']+)'/g,(_,name)=>"@import '"+path.join(path.dirname(workspacePath),name)+"'"));}
const main=fs.readFileSync('src/main.jsx','utf8');
const native=(from,to)=>{const a=main.indexOf('  function '+from+'('),b=main.indexOf(to,a+1);assert(a>=0&&b>a,from+' native extraction');return main.slice(a,b);};
const primitives=native('Section','  const { renderProductSections }')+native('Input','  const { ProjectImagesPanel')+native('SignaturePad','  const { Report, CustomerReport }')+native('InfoCard','  function SignatureCard(');
const designStart=main.indexOf('tab === "prosjektering" &&')+('tab === "prosjektering" &&').length,designEnd=main.lastIndexOf('/* @__PURE__ */',main.indexOf('children: "Sjekkliste for prosjektering"'));
assert(designStart>30&&designEnd>designStart);
const designExpression=main.slice(designStart,designEnd).trim().replace(/,$/,'')+'] })';
const designHandlers=main.slice(main.indexOf('    const addProsjekteringPunkt ='),main.indexOf('    const updateProductDoc ='));
let browser,checks=0,visits=[];
const eq=(a,b,label)=>{assert.deepEqual(a,b,label);checks++;};
fs.writeFileSync(path.join(tmp,'entry.jsx'),`
import React,* as ReactNS from '${root}/node_modules/react/index.js';
import {createRoot} from '${root}/node_modules/react-dom/client.js';
import * as import_jsx_runtime from '${root}/node_modules/react/jsx-runtime.js';
import * as import_lucide_react from '${root}/node_modules/lucide-react/dist/esm/lucide-react.mjs';
import {createProjectOverviewTools} from '${root}/src/modules/project/projectOverviewTools.js';
import Fields from '${root}/src/modules/project/ProjectInformationFields.jsx';
import {createProductViewTools} from '${root}/src/modules/product/productViewTools.js';
import {createSurfaceViewTools,emptyBathroomEquipment} from '${root}/src/modules/surfaces/surfaceViewTools.js';
import {createInstallationViewTools} from '${root}/src/modules/installations/installationViewTools.js';
import {createCommunicationViewTools} from '${root}/src/modules/chat/chatViewTools.js';
import {createContractViewTools} from '${root}/src/modules/contract/contractViewTools.js';
import {createWarrantyViewTools} from '${root}/src/modules/warranty/warrantyViewTools.js';
import {createAccessViewTools} from '${root}/src/modules/portal/accessViewTools.js';
import {createDeviationCenter} from '${root}/src/modules/deviations/deviationViewTools.js';
import ProjectDeviationCreator from '${root}/src/modules/deviations/ProjectDeviationCreator.jsx';
import {renderOvertagelsePanel} from '${root}/src/modules/overtagelse/overtagelseTools.js';
import ProjectWorkspaceChrome,{ProjectHeaderActions} from '${root}/src/modules/project/ProjectWorkspaceChrome.jsx';
import {APP_RUNTIME_STYLES} from '${root}/src/modules/app/appRuntimeStyles.js';
import '${root}/src/style.css';import '${workspaceStyles}';
document.head.insertAdjacentHTML('beforeend','<style>'+APP_RUNTIME_STYLES+'</style>');
const import_react={default:React,...ReactNS};const stopInteractivePropagation=e=>e.stopPropagation();
${primitives}
const hasValue=v=>v!==undefined&&v!==null&&String(v).trim()!=='',uid=()=>crypto.randomUUID();

const deps={...import_lucide_react,Section,Grid,Input,Select,Textarea,CollapsibleBlock,InfoCard,hasValue,uid};
const overview=createProjectOverviewTools(deps),products=createProductViewTools({...deps,productSupportsColorChoice:()=>true,productReportDocumentOptions:[{key:'Fdv',field:'fdvUrl',label:'FDV'},{key:'Datablad',field:'databladUrl',label:'Datablad'}],hasProductReportChoice:()=>true});
const surfaces=createSurfaceViewTools(deps),installation=createInstallationViewTools({...deps,installCats:['Rørlegger','Elektriker','Annet']}),communication=createCommunicationViewTools(deps);
const emptyTilbud=()=>({sum:'',description:'',files:[],changes:[]}),contract=createContractViewTools({...deps,emptyTilbud});
const emptyWarranty=()=>({enabled:false,system:'',issued:false}),warrantyTools=createWarrantyViewTools({...deps,emptyWarranty,getWarrantyYears:()=>10,WARRANTY_YEAR_OPTIONS:['10','12','15'],WARRANTY_YEARS:10,makeWarrantyValidUntil:()=>'',checklistPointAnchor:(a,b)=>a+'-'+b,warrantyTermsPdfFileName:'terms.pdf',warrantyArchiveNotice:'Last ned dokumentasjonen.',standardWetroomTemplateTradeOptions:[],standardWetroomTemplateDefaultTrades:[],customChecklistTradeIconUrl:()=>''});
const DeviationCenter=createDeviationCenter({...deps,ProjectDeviationCreator,checklistPointAnchor:(c,i)=>c+'-'+i});
const accessTools=createAccessViewTools(deps),system={id:'sopro-aeb-815',name:'Sopro AEB815',sintefApproval:'TG20918'};
window.calls=[];window.mode='description';window.transportMode='ok';window.mockClient={auth:{getSession:async()=>({data:{session:{user:{id:'qa-user'}}}}),getUser:async()=>({data:{user:{id:'qa-user'}}})},rpc:async(name,args)=>{window.calls.push({name,args});return {data:[],error:null};},from:()=>{const chain=new Proxy({}, {get:(_,k)=>k==='then'?(resolve)=>Promise.resolve({data:[],error:null}).then(resolve):()=>chain});return chain;}};
function App(){
 const [mode,setMode]=React.useState('description'),[locked,setLocked]=React.useState(false);
 const [project,setProject]=React.useState({projectName:'QA – faktiske prosjektbarn',customer:'QA kunde',customerEmail:'qa@example.invalid',responsible:'QA leder',address:'Testveien1',projectDescription:'Eksisterende beskrivelse',projectDeviations:[{id:'d1',title:'Åpent QA-avvik',description:'Eksisterende tiltak',type:'Kvalitet',severity:'Middels',status:'Åpent',photos:[],responsible:'QA',dueDate:'2026-11-04'},{id:'d2',title:'Lukket QA-avvik',description:'Historisk tiltak',type:'HMS',severity:'Lav',status:'Lukket',photos:[],closeComment:'Kontrollert',closedBy:'QA',closedAt:'2026-10-29T10:00:00Z'}],date:'2026-10-30'});
 const [docs,setDocs]=React.useState({'QA primer':{fdvUrl:'/fdv.pdf',databladUrl:'/data.pdf',comment:'Eksisterende produkt'}}),[checked,setChecked]=React.useState({'QA primer':true}),[open,setOpen]=React.useState({Primer:true}),[manual,setManual]=React.useState([]);
 const [surf,setSurf]=React.useState({}),[equipment,setEquipment]=React.useState(emptyBathroomEquipment()),[inst,setInst]=React.useState([{id:'tool-a',category:'Rørlegger',name:'QA ventil',qty:'2',supplier:'QA leverandør',desc:'Teknisk rom',fdvUrl:'/fdv.pdf',photos:[],by:'QA',created:'30.10.2026'}]);
 const [notes,setNotes]=React.useState('Eksisterende internt notat'),[log,setLog]=React.useState({draft:'',enabled:false,messages:[]}),[chatFile,setChatFile]=React.useState(null);
 const [tilbud,setTilbud]=React.useState({...emptyTilbud(),sum:'100000',files:[{id:'contract',name:'Signert kontrakt.pdf',url:'/contract.pdf',documentType:'contract'}]}),[warranty,setWarranty]=React.useState({enabled:true,system:system.id,issued:false});
 const [overtagelse,setOvertagelse]=React.useState({enabled:false,dato:'2026-10-30',kommentar:'',signKunde:'',signUtførende:''}),[access,setAccess]=React.useState([]),[message,setMessage]=React.useState('');
 window.showProject036=(m,l=false)=>{setMode(m);setLocked(l);};
 window.setWarranty036=setWarranty;
 React.useEffect(()=>{window.committed=mode+':'+locked;},[mode,locked]);
 const call=(name)=>(...args)=>window.calls.push({name,args});
 const common={Section,Grid,Input,Textarea,SignaturePad,project,setProject,projectId:'qa-project',isProjectLocked:locked};
 ${designHandlers}
 const addPhoto=call('upload-design');
 const body=mode==='design'?(${designExpression}):mode==='deviations'?<Section title="Avvik/SJA/RUH"><DeviationCenter project={project} setProject={setProject} projectId="qa-project" userId="qa-user" checklist={{Kontroll:{'QA punkt':{status:'Avvik',comment:'Mangler kontroll'}}}} activeChecklistTemplate={[{category:'Kontroll',items:['QA punkt']}]} readOnly={locked} onSaveProjectDeviation={call('save-deviation')} onPrepareChatDraft={call('prepare-chat')}/></Section>:mode==='description'?overview.renderProjectDescriptionPanel({project,setProject,projectDescriptionTemplates:[{label:'QA standardtekst',text:'Ny standardtekst'}],appendProjectDescriptionTemplate:text=>setProject(p=>({...p,projectDescription:p.projectDescription+'\\n'+text}))}):
 mode==='information'?<div><section className="project-info-editor"><h2>Rediger kunde- og prosjektinfo</h2><CollapsibleBlock title="Kunde- og prosjektdata"><div className="grid"><Fields project={project} setProject={setProject} Input={Input} Textarea={Textarea} readOnly={locked}/></div><warrantyTools.ProjectWarrantySetup warranty={warranty} setWarranty={setWarranty} systems={[system]} project={project} onCreateStandardWetroomTemplate={call('create-template')}/></CollapsibleBlock></section></div>:
 mode==='products'?products.renderProductSections({effectiveProductSections:[{title:'Primer',items:['QA primer','QA alternativ']}],getManualProductsForSection:()=>manual,isProjectLocked:locked,checked,openProductSections:open,setOpenProductSections:setOpen,productDocs:docs,toggleProductChecked:(k,v)=>setChecked(p=>({...p,[k]:v})),updateProductDoc:(k,v)=>setDocs(p=>({...p,[k]:{...p[k],...v}})),getProductColorOptions:()=>['Hvit','Grå'],addManualProduct:()=>setManual(p=>[...p,{id:uid(),name:'',fdvUrl:'',comment:''}]),updateManualProduct:(s,id,v)=>setManual(p=>p.map(x=>x.id===id?{...x,...v}:x)),removeManualProduct:(s,id)=>setManual(p=>p.filter(x=>x.id!==id))}):
 mode==='surfaces'?surfaces.renderOverflaterOgInnredning({surf,setSurf,bathroomEquipment:equipment,setBathroomEquipment:setEquipment}):
 mode==='installation'?installation.renderInstallationPanel({inst,setInst,uploadImages:async()=>[],authorName:'QA'}):
 mode==='notes'?communication.renderInternalNotesPanel({internalNotes:notes,setInternalNotes:setNotes,saveProject:call('save-notes')}):
 mode==='chat'?communication.renderProjectChatPanel({unreadForAdmin:0,totalChatCount:0,customerChatCount:0,project,projectLog:log,setProjectLog:setLog,chatUploadFile:chatFile,setChatUploadFile:setChatFile,addProjectLogMessage:call('send-chat'),refreshProjectFromCloud:call('refresh-chat'),markChatAsRead:call('read-chat'),lastReadByAdmin:'',lastReadByCustomer:'',removeProjectLogMessage:call('remove-chat')}):
 mode==='contract'?contract.renderContractPanel({project,tilbud,setTilbud,uploadTilbudFiles:call('upload-contract'),readOnly:locked,onProjectSynced:call('contract-synced')}):
 mode==='handover'?renderOvertagelsePanel({...common,overtagelse,setOvertagelse,warranty,projectDirty:true,persistedProjectHasOvertagelse:false,projectGuideStats:{checklistDone:0},projectHasOvertagelse:(o=overtagelse)=>!!o.enabled&&!!o.signKunde&&!!o.signUtførende,overtagelseHasDraftContent:()=>true,overtagelseIsSignedByBoth:()=>!!overtagelse.signKunde&&!!overtagelse.signUtførende,emptyOvertagelse:()=>({}),getWarrantyYears:()=>10,warrantyTermsPdfFileName:'terms.pdf',saveProject:call('save-handover'),completeOvertagelseAndLock:call('complete-handover'),sendProjectCompletionEmailToCustomer:call('send-docs')}):
 mode==='warranty'?<warrantyTools.WarrantyPanel warranty={warranty} setWarranty={setWarranty} readiness={{ready:false,missing:['Sjekklisten mangler dokumentasjon'],systemChecklistTotal:14,systemChecklistDone:2,systemChecklistPercent:14,missingSystemChecklistPoints:[{item:'Kontroller membran',category:'Membran',anchorId:'qa-point'}]}} issueWarranty={call('issue-warranty')} systems={[system]} goToTab={call('warranty-tab')} project={project} company={{companyName:'QA'}} isProjectLocked={locked} overtagelse={overtagelse}/>:
 accessTools.renderAccessPanel({...common,accessEmailMessage:message,setAccessEmailMessage:setMessage,accessRoleInfo:[],access,setAccess,roles:['Kunde','Underentreprenør'],portalAccessRecordIsValid:()=>false,getPortalAccessRecord:()=>null,portalAccessPolicyText:()=> 'Ingen aktiv tilgang',ensurePortalAccessForProject:call('access-create'),copyAccessLink:call('access-copy'),sendAccessEmail:call('access-send'),supabaseClient:window.mockClient,controllerReadOnly:locked,controllerEmailBrand:{},controllerFromName:'QA'});
 return <div data-expo-app-shell="true" data-expo-project-shell="1"><header><div className="head"><div style={{width:260,height:80}}><b>EXPO Proffsenter</b></div><div><h1>Expo ProffDok</h1><p>Pågår</p></div><button className="secondary">Logg ut</button><ProjectHeaderActions dirty={false} saved readOnly={false} locked={locked} onSave={call('save-project')} onCopy={call('copy-project')} onPdf={call('pdf')} onLock={call('lock-project')}/><div className="workspace-view-control"><button>Fullskjermvisning</button></div><div id="expo-work-profile-switcher"><div className="workProfileControl"><button className="workProfileButton">Expo Proffsenter</button></div></div></div></header><main>{body}</main></div>;
}createRoot(document.getElementById('app')).render(<App/>);
`);
const result=await build({root,configFile:false,logLevel:'silent',resolve:{alias:{'react/jsx-runtime':root+'/node_modules/react/jsx-runtime.js'}},plugins:[react(),{name:'project036-isolated-transport',enforce:'pre',resolveId(id){if(id.endsWith('/appSupabaseClientRegistry.js'))return '\0qa-registry';},load(id){if(id==='\0qa-sales')return 'export const createDefaultSalesSupabaseClient=()=>({auth:{getSession:(...a)=>window.mockClient.auth.getSession(...a),getUser:(...a)=>window.mockClient.auth.getUser(...a)},from:(...a)=>window.mockClient.from(...a),rpc:(...a)=>window.mockClient.rpc(...a)});export const getSalesSupportCompanyId=()=>null;';if(id==='\0qa-registry')return 'export const getAppSupabaseClient=()=>window.mockClient;export const registerAppSupabaseClient=()=>{};';if(id==='\0qa-access')return 'export const rpcWithStoredSession=(...a)=>window.mockClient.rpc(...a);';},transform(code,id){if(id.endsWith('/moduleAccessClient.js')){const a=code.indexOf('export async function rpcWithStoredSession('),b=code.indexOf('function normalizeMyAccess',a);return code.slice(0,a)+'export async function rpcWithStoredSession(...a){return window.mockClient.rpc(...a);}' +code.slice(b);}}}],build:{write:false,minify:false,cssCodeSplit:false,rollupOptions:{input:path.join(tmp,'entry.jsx'),output:{inlineDynamicImports:true}}}});
const js=result.output.find(x=>x.type==='chunk').code,css=result.output.filter(x=>x.fileName.endsWith('.css')).map(x=>x.source).join('\n');
const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html;charset=utf-8');res.end('<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+'</style><div id="app"></div><script type="module">'+js.replaceAll('</script','<\\/script')+'</script>');});await new Promise(r=>server.listen(0,'127.0.0.1',r));
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:1363,height:936}}),errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error('PAGE ERROR',e.stack||e.message);});page.setDefaultTimeout(6000);await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());await page.goto('http://127.0.0.1:'+server.address().port);
 const show=async(mode,locked=false)=>{await page.evaluate(([m,l])=>window.showProject036(m,l),[mode,locked]);await page.waitForFunction(v=>window.committed===v,mode+':'+locked);};
 const measure=async(label)=>{
  const x=await page.locator('main').evaluate(e=>{const visible=n=>n.getClientRects().length&&getComputedStyle(n).visibility!=='hidden';return {overflow:document.documentElement.scrollWidth>innerWidth,fields:[...e.querySelectorAll('input:not([type=checkbox]):not([type=radio]):not([type=file]):not([type=hidden]),select,textarea')].filter(visible).map(n=>({name:n.labels?.[0]?.textContent?.slice(0,65),font:getComputedStyle(n).fontSize,h:n.getBoundingClientRect().height})),cards:[...e.querySelectorAll('.item,.out,.tile,.project-info-card,.collapsibleBlock,.project-customer-register,.project-deviation-record,.checklistPoint,.checklistSummaryCard,.deviationClosedBox')].filter(visible).map(n=>({c:n.className,r:getComputedStyle(n).borderRadius,b:getComputedStyle(n).borderTopWidth})),roots:[...e.querySelectorAll(':scope>section,.project-info-editor')].map(n=>({r:getComputedStyle(n).borderRadius,p:getComputedStyle(n).padding})),actions:[...e.querySelectorAll('button,summary')].filter(visible).map(n=>({name:n.textContent?.slice(0,65),font:getComputedStyle(n).fontSize,h:n.getBoundingClientRect().height}))};});
  eq(x.overflow,false,label+' no page overflow');eq(await page.locator('header>.head button').evaluateAll(es=>es.filter(e=>e.getClientRects().length&&e.scrollWidth>e.clientWidth+1).map(e=>e.textContent)),[],label+' header controls do not clip text');eq(x.fields.filter(n=>n.font!=='16px'||n.h<44),[],label+' native fields16/44');eq(x.cards.filter(n=>n.r!=='8px'||n.b!=='1px'),[],label+' actual child borders8/1');eq(x.roots.filter(n=>n.r!=='0px'||n.p!=='0px'),[],label+' open task root');eq(x.actions.filter(n=>n.font!=='16px'||n.h<44),[],label+' native actions16/44');visits.push(label);
 };
 for(const mode of ['description','design','deviations','information','products','surfaces','installation','notes','chat','contract','handover','warranty','access']){
  await show(mode);await page.locator('main>section,main .project-info-editor').first().waitFor().catch(async e=>{console.error(await page.locator('main').evaluate(x=>({html:x.outerHTML.slice(0,4000),style:getComputedStyle(x).display,children:[...x.children].map(c=>({tag:c.tagName,c:c.className,style:getComputedStyle(c).display,box:c.getBoundingClientRect().toJSON()}))})));throw e;});
  if(mode==='contract')await page.getByText('Henter kontraktsmuligheter …',{exact:true}).waitFor({state:'hidden'});
  if(['surfaces','deviations'].includes(mode)){for(const summary of await page.locator('main details>summary').all()){if(!await summary.locator('..').getAttribute('open').then(v=>v!==null))await summary.click();}}
  for(const width of [320,390,768,1363,1920]){await page.setViewportSize({width,height:936});await measure(mode+'-'+width);}
  if(process.env.PROJECT_UX_SCREENSHOTS){fs.mkdirSync(process.env.PROJECT_UX_SCREENSHOTS,{recursive:true});for(const width of [390,1363]){await page.setViewportSize({width,height:936});await page.screenshot({path:path.join(process.env.PROJECT_UX_SCREENSHOTS,mode+'-'+width+'.png')});}}
 }
 await page.setViewportSize({width:1363,height:936});
 eq(await page.locator('header>.head').evaluate(e=>e.getBoundingClientRect().height<=85),true,'actual project header structure fits one desktop row');
 await show('description');const field=page.getByRole('textbox',{name:/^Beskrivelse \/ nødvendig prosjektinformasjon/});await field.fill('Usendt prosjektbeskrivelse');const node=await field.elementHandle();
 const summary=page.locator('details').filter({has:page.getByText('Standardtekster',{exact:true})}).locator('summary');await summary.click();await page.getByRole('button',{name:'QA standardtekst',exact:true}).click();eq(await field.inputValue(),'Usendt prosjektbeskrivelse\nNy standardtekst','native append retains own text');await summary.click();eq(await field.evaluate((e,n)=>e===n,node),true,'disclosure retains actual textarea DOM');
 await show('notes');await page.getByRole('textbox',{name:/^Interne notater/}).fill('Usendt internt notat');await show('chat');await page.getByRole('textbox',{name:/^Ny melding/}).fill('Usendt chatmelding');await show('notes');eq(await page.getByRole('textbox',{name:/^Interne notater/}).inputValue(),'Usendt internt notat','native notes state retained across host visits');await show('chat');eq(await page.getByRole('textbox',{name:/^Ny melding/}).inputValue(),'Usendt chatmelding','native chat draft retained');eq(await page.evaluate(()=>window.calls.filter(c=>['send-chat','save-notes'].includes(c.name))),[],'opening/rendering does not invoke send or save');
 await show('products',true);eq(await page.getByLabel('Hvor brukt / kommentar',{exact:true}).isDisabled(),true,'native locked product comment remains disabled');eq(await page.getByRole('button',{name:/Legg til annet produkt/}).count(),0,'native locked product create action absent');
 await show('surfaces');const wc=page.getByRole('combobox',{name:/^Type WC/});if(!await wc.isVisible())await page.locator('summary').filter({hasText:'WC / toalett'}).click();await wc.selectOption('Vegghengt');eq(await page.getByLabel('Sisternemodell',{exact:true}).isVisible(),true,'native wall WC reveals cistern fields');for(const width of [320,390,768,1363,1920]){await page.setViewportSize({width,height:936});await measure('wall-wc-'+width);}await page.setViewportSize({width:1363,height:936});
 await show('design');await page.getByRole('button',{name:'Legg til punkt',exact:true}).click();await page.getByLabel('Punkt / tittel',{exact:true}).fill('Avklar terskel');eq(await page.getByLabel('Punkt / tittel',{exact:true}).inputValue(),'Avklar terskel','native design add/edit handler');for(const width of [320,390,768,1363,1920]){await page.setViewportSize({width,height:936});await measure('design-own-point-'+width);}await page.getByRole('button',{name:'Fjern punkt',exact:true}).click();eq(await page.getByLabel('Punkt / tittel',{exact:true}).count(),0,'native design remove handler');
 await show('installation');const name=page.getByLabel('Navn/produkt',{exact:true});await name.fill('Endret QA ventil');eq(await name.inputValue(),'Endret QA ventil','original installation handler receives edit');
 await show('handover',true);eq(await page.getByRole('button',{name:'Fullfør overtagelse og lås prosjekt',exact:true}).isDisabled(),true,'native locked completion gate retained');
 await show('warranty');eq(await page.getByRole('button',{name:'Utsted 10 års tetthetsgaranti',exact:true}).isDisabled(),true,'native missing documentation blocks issue');
 eq(await page.evaluate(()=>window.calls.filter(c=>['access-create','access-copy','access-send','send-chat','issue-warranty','complete-handover','send-docs','save-project'].includes(c.name))),[],'presentation sweep invokes no consequential command');
 for(const [mode,openName,title] of [['deviations','+ Nytt HMS/prosjektavvik','Nytt HMS/prosjektavvik'],['access','Administrer kontrollørtilgang','Uavhengig kontrollør']]){
  await show(mode);await page.getByRole('button',{name:openName,exact:true}).click();const dialog=page.getByRole('dialog',{name:title,exact:true});await dialog.waitFor();
  for(const width of [320,390,768,1363,1920]){await page.setViewportSize({width,height:936});const r=await dialog.boundingBox();eq(r.y,0,title+' top0 '+width);eq(Math.abs(r.x+r.width-width)<1,true,title+' right edge '+width);eq(r.height,936,title+' full height '+width);eq(await dialog.locator('.deviation-dialog-header').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(15, 34, 45)',title+' shared navy header');eq(await dialog.evaluate(e=>e.scrollWidth<=e.clientWidth+1),true,title+' no inner overflow');eq(await dialog.locator('input:not([type=checkbox]),select,textarea').evaluateAll(es=>es.filter(e=>e.getClientRects().length).every(e=>getComputedStyle(e).fontSize==='16px'&&e.getBoundingClientRect().height>=44)),true,title+' actual dialog fields16/44');visits.push(mode+'-dialog-'+width);}
  if(mode==='deviations'){await dialog.getByRole('button',{name:'Lagre avvik for oppfølging',exact:true}).click();eq(await dialog.getByLabel('Kort tittel',{exact:true}).evaluate(e=>e.validity.valueMissing),true,'native required before deviation save');await dialog.getByLabel('Kort tittel',{exact:true}).fill('Usendt QA avvik');}
  else {await dialog.getByRole('button',{name:'Lag kontrollørlenke',exact:true}).click();await dialog.getByText('Skriv navn eller firma for kontrolløren.',{exact:true}).waitFor();eq(await page.evaluate(()=>window.calls.filter(c=>c.name==='controller_access_command').length),0,'controller validation before any access command');await dialog.getByLabel('Kontrollørens navn / firma',{exact:true}).fill('Usendt QA kontrollør');}
  if(process.env.PROJECT_UX_SCREENSHOTS)await page.screenshot({path:path.join(process.env.PROJECT_UX_SCREENSHOTS,mode+'-dialog.png')});
  await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});await page.getByRole('button',{name:openName,exact:true}).click();await dialog.waitFor();eq(await dialog.getByLabel(mode==='deviations'?'Kort tittel':'Kontrollørens navn / firma',{exact:true}).inputValue(),mode==='deviations'?'Usendt QA avvik':'Usendt QA kontrollør',mode+' native close/reopen keeps draft');await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});
 }
 eq(await page.evaluate(()=>window.calls.filter(c=>c.name==='save-deviation'||c.name==='controller_access_command')),[],'dialog validation and close/reopen never save/create access');
 await show('warranty',true);
 await page.evaluate(()=>window.setWarranty036({enabled:true,system:'sopro-aeb-815',issued:false,status:'draft',guaranteeNumber:'QA-LEGACY-ONLY',issuedAt:'2026-09-15T12:00:00Z'}));
 await page.getByRole('heading',{name:'Garanti utstedt',exact:true}).waitFor();
 eq(await page.getByRole('button',{name:'✅ Garanti utstedt',exact:true}).isDisabled(),true,'legacy guarantee number remains issued and cannot issue again');
 eq(await page.locator('label').filter({has:page.getByText('Godkjent Sopro-system',{exact:true})}).locator('select').isDisabled(),true,'issued system remains immutable');
 eq(await page.getByRole('button',{name:'Trekk tilbake utstedelse',exact:true}).count(),0,'locked history cannot withdraw issuance');
 eq(await page.getByText('QA-LEGACY-ONLY',{exact:true}).count(),1,'native archive retains original guarantee number');
 await page.getByText('Vis mottaker og vilkårsforklaring',{exact:true}).click();
 eq(await page.locator('.warrantyReceiptValue').first().innerText(),'Mottaker\n\nQA kunde','receipt remains complete read-only text');
 eq(await page.locator('.warrantyReceipt input,.warrantyReceipt textarea').count(),0,'receipt has no editable control');
 for(const width of [320,390,768,1363,1920]){
  await page.setViewportSize({width,height:600});await measure('warranty-issued-'+width);
  eq(await page.locator('.warranty-workspace .checklistSummaryBadges>span').evaluateAll(es=>es.every(e=>e.scrollWidth<=e.clientWidth+1&&getComputedStyle(e).fontSize==='16px')),true,'issued requirements remain readable '+width);
  if(process.env.PROJECT_UX_SCREENSHOTS)await page.screenshot({path:path.join(process.env.PROJECT_UX_SCREENSHOTS,'warranty-issued-'+width+'.png'),fullPage:true});
 }
 await page.evaluate(()=>window.setWarranty036({enabled:false}));
 await page.getByText('Garantien er ikke aktivert. Prosjektet kan fortsatt dokumenteres som vanlig uten garanti.',{exact:true}).waitFor();
 eq(await page.getByRole('button',{name:/Utsted .*tetthetsgaranti/}).count(),0,'inactive warranty has no issue command');
 eq(errors,[],'no native React runtime errors');
 console.log('Project native subflows036 PASS: '+checks+' assertions / '+visits.length+' state×width views. Actual tools and wrappers; native main primitives; full static/runtime CSS; synthetic client transport only. No all-role/server/mobile/Safari attestation.');
}finally{await browser?.close();await new Promise(r=>server.close(r));fs.rmSync(tmp,{recursive:true,force:true});}
