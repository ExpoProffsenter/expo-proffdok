import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import {execFileSync} from 'node:child_process';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=process.cwd(),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'project-report-workspace-'));
const artifactDir=process.env.PROJECT_REPORT_ARTIFACTS||tmp;fs.mkdirSync(artifactDir,{recursive:true});
let browser,checks=0;const eq=(a,b,label)=>{assert.deepEqual(a,b,label);checks++;};
const main=fs.readFileSync('src/main.jsx','utf8'),start=main.indexOf('    const goToTab = async (id) => {'),end=main.indexOf('\n    const openKshmsDeviation',start);
assert(start>=0&&end>start);
// Real navigation function, panel, chooser, report DOM and PDF engine. Only RPC
// transport/data are synthetic; doc.save performs a genuine browser download.
fs.writeFileSync(path.join(tmp,'entry.jsx'),`import React,{useState} from '${root}/node_modules/react/index.js';import {createRoot} from '${root}/node_modules/react-dom/client.js';
import ProjectReportWorkspace,{useProjectReportWorkspace} from '${root}/src/modules/report/ProjectReportWorkspace.jsx';
import ReportArchiveConfirmation,{useReportArchiveConfirmation} from '${root}/src/modules/report/ReportArchiveConfirmation.jsx';
import {useKshmsProjectReport,KshmsProjectReportChoice,KshmsProjectReportDialog} from '${root}/src/modules/kshms/KshmsProjectReport.jsx';
import {createReportViewTools} from '${root}/src/modules/report/reportViewTools.js';import {createReportTools} from '${root}/src/modules/report/reportTools.js';
import '${root}/src/modules/ui/proffdokWorkspace.css';
const Box=({children,label,value,name})=><div>{label}{value}{name}{children}</div>;const Link=({href,children})=><a href={href}>{children}</a>;
const {Report}=createReportViewTools({Brand:Box,Grid:Box,PdfSafeLink:Link,hasValue:v=>v!=null&&String(v).trim()!=='',projectHasOvertagelse:()=>false,InfoCard:Box,SignatureCard:Box,normalizeExternalUrl:v=>v||'',publicProjectFileUrl:()=>'',buildBathroomEquipmentReportGroups:()=>[]});
function App(){const [tab,setTab]=useState('bilder'),[projectId,setProjectId]=useState('project-a'),[available,setAvailable]=useState(true),[company,setCompany]=useState('company-a');
 const reportArchive=useReportArchiveConfirmation({scopeKey:'user:'+company+':'+projectId,enabled:available});
 const reportWorkspace=useProjectReportWorkspace({scopeKey:'user:'+company+':'+projectId,tab,available});
 const kshmsProjectReport=useKshmsProjectReport({context:{enabled:true,company_id:company,user_id:'user'},userId:'user',projectId,disabled:!available});
 const hasActiveProjectWorkspace=!!projectId,tabs=[['bilder','Bilder'],['rapport','Rapport'],['prosjekt','Prosjekt']],requestChecklistEntry=()=>{},setMobileStatusOpen=()=>{},setMobileMenuOpen=()=>{},scrollToMobileTabTarget=()=>{},syncInternalProjectUrl=()=>{window.urlWrites++;},confirmLeaveWithUnsavedChanges=async()=>{window.leaveChecks++;return true;};
 ${main.slice(start,end)}
 window.control={setTab,setProjectId,setAvailable,setCompany};window.currentTab=tab;
 const props={company:{companyName:'QA firma'},name:'QA firma',project:{projectName:'QA rapport i høyrepanel – ÆØÅ',customer:'QA kunde',address:'Testveien 42'},selected:[],manualProducts:[],other:{},surf:{},bathroomEquipment:{},photos:[],access:[],inst:[],files:[],checklist:{},tilbud:{enabled:false},overtagelse:{},projectLog:{}};
 const tools=createReportTools({...props,user:{name:'QA bruker'},authUser:{id:'user'},projectId,manualSelected:[],DEFAULT_REPORT_HERO_IMAGE_URL:'',activeChecklistTemplate:[],warranty:{enabled:false},warrantyReadiness:{},emptyWarranty:()=>({enabled:false}),getOpenDeviationCount:()=>0,getPhotoIdentity:p=>p.id,getWarrantyYears:()=>10,hasValue:v=>v!=null&&String(v).trim()!=='',isProjectLocked:true,makeProjectLink:()=>'',normalizeExternalUrl:v=>v||'',projectHasOvertagelse:()=>false,publicProjectFileUrl:()=>'',buildBathroomEquipmentReportGroups:()=>[],shouldIncludeProductReportDoc:()=>false,productReportDocumentOptions:[],setTab,setWarranty:()=>{throw Error('Locked export must not write');},confirmArchiveReport:reportArchive.confirm,prepareKshmsReport:kshmsProjectReport.prepareExport,isKshmsReportCurrent:kshmsProjectReport.isCurrent});
 return <div data-expo-app-shell="true"><main><h1>Prosjekt – {projectId}</h1><label>Usendt kladd<input defaultValue="Bevar dette arbeidet"/></label><button onClick={()=>goToTab('rapport')}>Rapport</button><button onClick={()=>goToTab('prosjekt')}>Prosjekt</button>
 <ReportArchiveConfirmation confirmation={reportArchive.confirmation}/>{!reportWorkspace.isOpen&&<KshmsProjectReportDialog chooser={kshmsProjectReport.chooser}/>}
 {reportWorkspace.isOpen&&<ProjectReportWorkspace projectName={props.project.projectName} onClose={()=>{kshmsProjectReport.chooser?.cancel();reportWorkspace.close();}} chooserOpen={!!kshmsProjectReport.chooser} onPdf={tools.downloadClickablePdfReport}><KshmsProjectReportDialog chooser={kshmsProjectReport.chooser}/><KshmsProjectReportChoice report={kshmsProjectReport}/><Report {...props} kshmsReport={kshmsProjectReport.reportData}/></ProjectReportWorkspace>}
 </main></div>;
}
window.leaveChecks=0;window.urlWrites=0;window.rpc=async(name,args)=>name==='project_checklist_state'?{runs:[]}:{context:{enabled:true,company_id:args.p_company_id,user_id:'user',project_id:args.p_project_id},choices:name==='kshms_project_report'?{sjas:[],ruhs:[]}:{rounds:[],risks:[]}};
createRoot(document.getElementById('app')).render(<App/>);`);
const result=await build({root,configFile:false,logLevel:'silent',resolve:{alias:{react:path.join(root,'node_modules/react'),'react-dom':path.join(root,'node_modules/react-dom')}},plugins:[{name:'synthetic-report-transport',enforce:'pre',resolveId(id){if(id==='https://esm.sh/jspdf@2.5.1')return '\0pdf-engine';},load(id){if(id==='\0pdf-engine')return `export {jsPDF} from '${root}/scripts/qa/node_modules/jspdf/dist/jspdf.es.min.js';`;if(id.endsWith('/kshmsAccess.js'))return 'export const kshmsRpc=(name,args)=>window.rpc(name,args);';}},react()],build:{write:false,minify:false,cssCodeSplit:false,rollupOptions:{input:path.join(tmp,'entry.jsx'),output:{inlineDynamicImports:true}}}});
const js=result.output.find(x=>x.type==='chunk').code,css=result.output.filter(x=>x.fileName.endsWith('.css')).map(x=>x.source).join('\n');
const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html;charset=utf-8');res.end(`<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style><div id="app"></div><script type="module">${js.replaceAll('</script','<\\/script')}</script>`);});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1363,height:936},acceptDownloads:true}),errors=[],dialogs=[];
 page.setDefaultTimeout(15000);page.on('pageerror',e=>{errors.push(e.message);console.error('Browser:',e.message);});page.on('dialog',async dialog=>{dialogs.push(dialog.message());console.log('Native dialog:',dialog.message().slice(0,240));await dialog.accept();});
 await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
 await page.goto('http://127.0.0.1:'+server.address().port+'/');
 const draft=page.getByLabel('Usendt kladd'),trigger=page.getByRole('button',{name:'Rapport',exact:true});await draft.fill('Usendt arbeid – skal stå');const handle=await draft.elementHandle();
 console.log('Opening report');await trigger.click();const panel=page.locator('dialog.project-report-workspace');await panel.waitFor({state:'visible'});
 eq(await page.evaluate(()=>window.currentTab),'bilder','report action preserves current tab');eq(await page.evaluate(()=>window.leaveChecks),0,'opening overlay does not leave unsaved work');eq(await page.evaluate(()=>window.urlWrites),0,'opening report preserves project URL');
 eq(await panel.locator('.report').count(),1,'native Report preview appears once');
 for(const width of [1861,1363,768,390,320]){
  await page.setViewportSize({width,height:700});const box=await panel.boundingBox();eq(Math.round(box.x+box.width),width,'report panel attaches to right edge '+width);
  eq(await panel.getByRole('button',{name:'Last ned PDF',exact:true}).isVisible(),true,'PDF is directly visible '+width);
  eq(await panel.locator('.pd-workspace-drawer-body').evaluate(e=>e.scrollWidth<=e.clientWidth+1),true,'report body fits '+width);
  const footer=await panel.locator('.pd-workspace-drawer-footer').boundingBox();eq(footer.y+footer.height<=701,true,'PDF footer remains in viewport '+width);
 }
 console.log('Geometry passed');await page.setViewportSize({width:1363,height:936});
 await panel.getByRole('button',{name:'Velg KS/HMS til rapport',exact:true}).click();const chooser=page.locator('.ks-report-dialog');await chooser.waitFor();
 await chooser.press('Escape');await chooser.waitFor({state:'hidden'});eq(await panel.isVisible(),true,'Escape cancels selection and keeps report open');
 eq(await panel.getByRole('button',{name:'Velg KS/HMS til rapport',exact:true}).evaluate(e=>document.activeElement===e),true,'chooser returns focus inside report');
 await panel.getByRole('button',{name:'Last ned PDF',exact:true}).click();await chooser.waitFor();
 console.log('Downloading real PDF');await chooser.getByRole('button',{name:'Fortsett uten KS/HMS',exact:true}).click();const archive=page.locator('dialog.report-archive-confirmation');await archive.waitFor();eq(await archive.innerText().then(t=>t.includes('Viktig før nedlasting')),true,'original archive notice is shown');for(const width of [1363,768,390,320]){await page.setViewportSize({width,height:700});const footer=await archive.locator('.pd-workspace-drawer-footer').boundingBox();eq(footer.y+footer.height<=701,true,'archive actions visible '+width);eq(await archive.locator('.pd-workspace-drawer-body').evaluate(e=>e.scrollWidth<=e.clientWidth+1),true,'archive notice readable '+width);}await page.setViewportSize({width:1363,height:936});await archive.getByRole('button',{name:'Avbryt',exact:true}).click();await archive.waitFor({state:'hidden'});eq(await panel.getByRole('button',{name:'Last ned PDF',exact:true}).isEnabled(),true,'cancel returns to report without export');await panel.getByRole('button',{name:'Last ned PDF',exact:true}).click();await chooser.getByRole('button',{name:'Fortsett uten KS/HMS',exact:true}).click();await archive.waitFor();const downloadPromise=page.waitForEvent('download',{timeout:20000});await archive.getByRole('button',{name:'Generer PDF',exact:true}).click();const downloaded=await downloadPromise;const pdf=path.join(artifactDir,'project-report-workspace.pdf');await downloaded.saveAs(pdf);
 eq(fs.readFileSync(pdf).subarray(0,5).toString(),'%PDF-','real browser downloaded a PDF');
 const pdfText=execFileSync('pdftotext',[pdf,'-'],{encoding:'utf8'});eq(pdfText.includes('QA kunde'),true,'download contains native project data');eq(dialogs.some(t=>t.includes('Viktig før nedlasting')),false,'app confirmation avoids browser-native JS prompt');
 eq(await panel.locator('#expo-pdf-progress-overlay').count(),await page.locator('#expo-pdf-progress-overlay').count(),'progress uses active top-layer panel when present');
 await page.waitForFunction(()=>!document.querySelector('#expo-pdf-progress-overlay'));
 await page.screenshot({path:path.join(artifactDir,'project-report-workspace.png')});
 await panel.getByRole('button',{name:'Tilbake til prosjektet',exact:true}).click();await panel.waitFor({state:'hidden'});
 eq(await handle.evaluate(e=>e.isConnected),true,'same draft DOM survives open/close');eq(await draft.inputValue(),'Usendt arbeid – skal stå','draft retained');eq(await trigger.evaluate(e=>document.activeElement===e),true,'native close restores focus to report trigger');
 await trigger.click();await panel.waitFor();await page.evaluate(()=>{window.dispatchEvent(new Event('blur'));window.dispatchEvent(new Event('focus'));});eq(await panel.isVisible(),true,'focus cycle keeps report open');
 await page.evaluate(()=>window.control.setProjectId('project-b'));await panel.waitFor({state:'hidden'});eq(await page.locator('.report').count(),0,'project change removes old report');
 await trigger.click();await panel.waitFor();await page.evaluate(()=>window.control.setAvailable(false));await panel.waitFor({state:'hidden'});eq(await page.locator('.report').count(),0,'revocation immediately removes report');
 await page.evaluate(()=>{window.control.setAvailable(true);window.control.setTab('rapport');});await panel.waitFor();eq(await panel.isVisible(),true,'historical report URL route opens same panel');await panel.getByRole('button',{name:'Lukk rapport',exact:true}).click();await panel.waitFor({state:'hidden'});
 await page.evaluate(()=>window.control.setTab('bilder'));await trigger.click();await panel.waitFor();await panel.getByRole('button',{name:'Last ned PDF',exact:true}).click();await chooser.waitFor();await page.evaluate(()=>window.control.setProjectId('project-c'));await panel.waitFor({state:'hidden'});eq(await chooser.count(),0,'closing report cancels pending selection');await trigger.click();await panel.waitFor();await panel.getByRole('button',{name:'Last ned PDF',exact:true}).click();await chooser.getByRole('button',{name:'Fortsett uten KS/HMS',exact:true}).click();await archive.waitFor();await page.evaluate(()=>window.control.setCompany('company-b'));await archive.waitFor({state:'hidden'});await panel.waitFor({state:'hidden'});eq(await page.locator('.report').count(),0,'company change cancels archive confirmation and old report');
 eq(errors,[],'no React/browser errors');console.log(JSON.stringify({result:'PASS',checks,pdf:fs.statSync(pdf).size,artifacts:artifactDir}));
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));fs.rmSync(tmp,{recursive:true,force:true});}
