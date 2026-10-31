import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=process.cwd(),temp=fs.mkdtempSync(path.join(os.tmpdir(),'people-design-'));
let browser,checks=0;const eq=(a,b,m)=>{assert.deepEqual(a,b,m);checks++;};
fs.writeFileSync(path.join(temp,'entry.jsx'),`
import React,{useState} from '${root}/node_modules/react/index.js';
import {createRoot} from '${root}/node_modules/react-dom/client.js';
import Hr from '${root}/src/modules/hr/HrModule.jsx';
import Ks from '${root}/src/modules/kshms/KshmsModule.jsx';
import {ROUTINE_CATALOG} from '${root}/src/modules/kshms/kshmsCatalog.mjs';
import '${root}/src/style.css';import '${root}/src/modules/ui/proffdokWorkspace.css';
const c='91000000-0000-4000-8000-000000000001',u='91000000-0000-4000-8000-000000000002';
const context={company_id:c,user_id:u,company_name:'QA Entreprenør og prosjektutvikling AS',enabled:true,available:true,administer:true,manage:true,publish:true,responsible:true};
const employees=[{id:'employee',user_id:'employee-user',full_name:'QA Medarbeider',email:'qa@example.invalid',leader_id:u,revision:1,readers:[]},{id:'colleague',user_id:'colleague-user',full_name:'QA Kollega',email:'kollega@example.invalid',leader_id:u,revision:1,readers:[]}];
const ks={context,settings:{revision:1,trades:['vvs'],responsible_user_id:u,activities:'Syntetisk arbeid',next_review_on:'2027-01-01'},routines:[{id:'r1',company_id:c,revision:1,archived:false,draft:{...ROUTINE_CATALOG[0],title:'QA rutine'}}],versions:[],assignments:[],acknowledgments:[],members:[{id:u,email:'leder@example.invalid',enabled:true,role:'responsible',workspace_role:'firmaadmin'}],reviews:[],audit:[]};
window.qa={calls:[],mode:'hr'};
window.rpc=async(name,args)=>{window.qa.calls.push(name);const data={context,content_enabled:false};
 if(name==='kshms_get_state')return structuredClone(ks);
 if(name==='kshms_execution_tasks')return {company_id:c,user_id:u,count:0,overdue:0,items:[]};
 if(name==='hr_foundation_state')return {...data,settings:{revision:1,enabled:true,purpose:'QA registerformål',legal_basis:'QA vurdert grunnlag',review_on:'2027-01-01'},members:ks.members,next:null};
 if(name==='hr_employee_list')return {...data,employees,next:null};
 if(name==='hr_purge_status')return {...data,receipts:[],next:null};
 if(name==='hr_followup_tasks')return {...data,tasks:[],next:null};
 if(name==='hr_employee_get')return {...data,employee:employees.find(e=>e.id===args.p_employee_id)};
 if(name==='hr_template_list')return {...data,templates:[],next:null};
 throw Error('Unexpected synthetic RPC '+name);};
function App(){const[mode,setMode]=useState('hr');window.qa.show=setMode;return <div data-expo-app-shell="${process.env.PEOPLE_DESIGN_BEFORE==='1'?'false':'true'}" data-qa-mode={mode}><main>{mode==='hr'?<Hr context={context}/>:<Ks context={context}/>}</main></div>;}createRoot(document.getElementById('app')).render(<App/>);
`);
const omitted=/\/(PrivateContact|HrConversations|HrSickLeaveCases|HrPracticeConversation|KshmsDeviations|KshmsChecklistCentral|KshmsExecutions|KshmsSja|KshmsInspectionExtract|KshmsDocumentPdfButton|KshmsAssignmentReminders|KshmsReviewReminder|OrganizationChart)\.jsx$/;
const result=await build({root,configFile:false,logLevel:'silent',define:{'process.env.NODE_ENV':'"production"','import.meta.env.VITE_EXPO_BACKEND_TARGET':'"production"'},resolve:{alias:{react:path.join(root,'node_modules/react'),'react-dom':path.join(root,'node_modules/react-dom')}},plugins:[react(),{name:'isolated-people-design',enforce:'pre',resolveId(id){if(/\/(hrAccess|kshmsAccess)\.js$/.test(id))return '\0rpc';if(/\/TimeEntryPoint\.jsx$/.test(id))return '\0time';if(omitted.test(id))return '\0private';},load(id){if(id==='\0rpc')return 'export const hrRpc=(...args)=>window.rpc(...args);export const kshmsRpc=(...args)=>window.rpc(...args);';if(id==='\0time')return 'export const HrTimeEntry=()=>null;';if(id==='\0private')return 'export default function(){return null;}';},transform(code,id){if(process.env.PEOPLE_DESIGN_BEFORE==='1'&&id.endsWith('/proffdokWorkspace.css'))return {code:code.replace("@import './proffdokPeopleWorkspace.css';",''),map:null};}}],build:{write:false,minify:false,lib:{entry:path.join(temp,'entry.jsx'),formats:['es'],name:'PeopleDesign',cssFileName:'people'}}});
const output=(Array.isArray(result)?result[0]:result).output,js=output.find(x=>x.type==='chunk').code,css=output.filter(x=>x.type==='asset'&&x.fileName.endsWith('.css')).map(x=>x.source).join('\n');
const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html; charset=utf-8');res.end('<meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+'</style><div id="app"></div><script type="module">'+js.replaceAll('</script','<\\/script')+'</script>');});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']});const page=await browser.newPage();const errors=[],outbound=[];
 page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>{if(new URL(r.request().url()).hostname==='127.0.0.1')return r.continue();outbound.push(r.request().url());return r.abort('blockedbyclient');});
 await page.goto('http://127.0.0.1:'+server.address().port);await page.getByRole('button',{name:/QA Medarbeider/}).waitFor();
 for(const mode of ['hr','ks']){
  await page.evaluate(value=>window.qa.show(value),mode);await page.locator('[data-qa-mode="'+mode+'"]').waitFor();await page.locator('header.module-heading').waitFor();
  for(const [width,height] of [[320,568],[390,844],[768,740],[1363,900],[1920,1000]]){
   await page.setViewportSize({width,height});
   if(process.env.PEOPLE_DESIGN_SCREENSHOTS){fs.mkdirSync(process.env.PEOPLE_DESIGN_SCREENSHOTS,{recursive:true});await page.screenshot({path:path.join(process.env.PEOPLE_DESIGN_SCREENSHOTS,mode+'-'+width+'.png'),fullPage:true});}
   const style=await page.locator('header.module-heading').evaluate(e=>({background:getComputedStyle(e).backgroundImage,shadow:getComputedStyle(e).boxShadow,font:parseFloat(getComputedStyle(e.querySelector('p')).fontSize),title:parseFloat(getComputedStyle(e.querySelector('h2')).fontSize)}));
   eq(style.background,'none',mode+'/'+width+' open module heading matches Start');eq(style.shadow,'none',mode+'/'+width+' no legacy header shadow');eq(style.font>=16,true,mode+'/'+width+' readable description');eq(style.title>=29,true,mode+'/'+width+' readable title');
   eq(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,mode+'/'+width+' no document overflow');
   const module=page.locator(mode==='hr'?'.hr-module':'.ks-module').first();
   eq(await module.evaluate(e=>e.scrollWidth<=e.clientWidth+1),true,mode+'/'+width+' no internal module overflow');
   const buttons=await module.locator('button:visible').evaluateAll(nodes=>nodes.map(e=>({w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height,font:parseFloat(getComputedStyle(e).fontSize),text:e.textContent.trim()})));
   eq(buttons.every(b=>b.w>=43.99&&b.h>=43.99),true,mode+'/'+width+' usable actions '+JSON.stringify(buttons.filter(b=>b.w<43.99||b.h<43.99)));eq(buttons.every(b=>b.font>=16),true,mode+'/'+width+' button labels >=16px');
  }
  if(mode==='hr'){
   await page.getByLabel('Søk etter medarbeider').fill('ingen treff');await page.getByText('Ingen treff',{exact:true}).waitFor();await page.getByLabel('Søk etter medarbeider').fill('QA Medarbeider');
   await page.getByRole('button',{name:/QA Medarbeider/}).click();await page.getByRole('dialog').waitFor();eq(await page.getByRole('dialog').getByRole('heading',{name:'QA Medarbeider',exact:true}).count(),1,'employee identity preserved');
   await page.keyboard.press('Escape');await page.getByRole('dialog').waitFor({state:'hidden'});eq(await page.getByLabel('Søk etter medarbeider').inputValue(),'QA Medarbeider','search survives employee dialog');
   await page.getByRole('button',{name:'Alle HR-funksjoner',exact:true}).click();await page.getByRole('button',{name:'Åpne oppsett',exact:true}).click();const purpose=page.getByLabel('Formål med registeret',{exact:true});await purpose.fill('Behold dette usendte oppsettet');await page.setViewportSize({width:390,height:568});eq(await purpose.inputValue(),'Behold dette usendte oppsettet','setup draft survives responsive layout');
  }else{
   const nav=page.getByRole('navigation',{name:'KS/HMS visning'});const names=await nav.getByRole('button').allTextContents();eq(names,['Daglig arbeid','Rutiner og håndbok','Avvik og RUH','Forvaltning'],'approved KS/HMS work phases');
   await page.setViewportSize({width:390,height:568});
   const nativeIds=await page.getByRole('combobox',{name:'Velg KS/HMS-visning',exact:true}).locator('option').evaluateAll(nodes=>nodes.map(node=>node.value).filter(Boolean));
   eq(nativeIds,['deviations','sja','rounds','risk','progress','reading','personal','organization','handbook','checklists','followup','extract','setup'],'all thirteen authorized native destinations retained behind the work phases');
   await page.setViewportSize({width:390,height:568});await page.getByRole('combobox',{name:'Velg KS/HMS-visning',exact:true}).selectOption('setup');await page.getByRole('heading',{name:'1. Velg KS/HMS-ansvarlig',exact:true}).waitFor();eq(await page.getByLabel('Utpekt KS/HMS-ansvarlig (firmaadmin velger)').inputValue(),'91000000-0000-4000-8000-000000000002','native setup and selected identity retained');
  }
 }
 eq(outbound,[],'all external transport blocked');eq(errors,[],'no runtime errors');eq(await page.evaluate(()=>window.qa.calls.some(x=>/command|configure|publish/.test(x))),false,'layout/navigation did not issue commands');
 console.log('People workspace design: '+checks+' Chromium checks PASS; actual HR register/detail/setup and KS/HMS handbook/navigation/setup, five widths, same native controls/draft, blocked external transport. Private conversation/other submodules omitted here and verified by their existing suites.');
}finally{await browser?.close();await new Promise(r=>server.close(r));fs.rmSync(temp,{recursive:true,force:true});}
