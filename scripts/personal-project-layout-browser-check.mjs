import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const cwd=process.cwd(),temp=fs.mkdtempSync(path.join(os.tmpdir(),'personal-project-layout-'));
let checks=0,browser;
const eq=(a,b,label)=>{assert.deepEqual(a,b,label);checks++;};
// Actual components, actual global/local CSS, synthetic read transport. No signed-in data.
fs.writeFileSync(path.join(temp,'entry.jsx'),`
import React,{useState} from '${cwd}/node_modules/react/index.js';
import {createRoot} from '${cwd}/node_modules/react-dom/client.js';
import Personal from '${cwd}/src/modules/personal/PersonalPage.jsx';
import {usePersonalAccess} from '${cwd}/src/modules/personal/personalAccess.js';
import {useHrAccess} from '${cwd}/src/modules/hr/hrAccess.js';
import {useKshmsAccess} from '${cwd}/src/modules/kshms/kshmsAccess.js';
import {installWorkProfileProjectListUx} from '${cwd}/src/modules/access/workProfileProjectListUx.jsx';
import {createProjectListTools,projectMatchesSearch} from '${cwd}/src/modules/project/projectListTools.js';
import '${cwd}/src/style.css';
import {APP_RUNTIME_STYLES} from '${cwd}/src/modules/app/appRuntimeStyles.js';
document.head.insertAdjacentHTML('beforeend','<style>'+APP_RUNTIME_STYLES+'</style>');
const sectionSource=${JSON.stringify(fs.readFileSync('src/main.jsx','utf8').split('  function Section(')[1].split('  function CollapsibleBlock')[0])};
const Section=new Function('import_jsx_runtime','return function Section('+sectionSource)({jsx:(type,props)=>React.createElement(type,props),jsxs:(type,props)=>React.createElement(type,props)});
const Grid=({children})=><div className="grid">{children}</div>;
const Input=({label,value,onChange})=><label>{label}<input aria-label={label} value={value} onChange={e=>onChange(e.target.value)}/></label>;
const Select=({label,value,onChange,options,optionLabels})=><label>{label}<select aria-label={label} value={value} onChange={e=>onChange(e.target.value)}>{options.map(v=><option value={v} key={v}>{optionLabels[v]}</option>)}</select></label>;
const tools=createProjectListTools({Section,Grid,Input,Select,getWarrantyYears:()=>10});
const rows=['Pågående prosjekt','Arkivprosjekt'].map((title,i)=>({row:{id:'p'+i,title,updated_at:'2026-10-16T12:00:00Z'},listProject:{customer:'QA Kunde',address:'Testveien 1',responsible:'QA Leder'},listStatus:{tone:i?'done':'progress',label:i?'Ferdigstilt':'Pågår',icon:'●'},unreadForAdminInList:i?0:2,latestMessage:null,imageSummary:{total:0,previews:[]},openDeviationCount:i?0:3,productSummary:{total:4},listWarranty:{enabled:true,issued:true},projectCompanyName:'QA firma'}));
function Projects(){const [q,setQ]=useState(''),[status,setStatus]=useState('alle'),[unread,setUnread]=useState(false);
 const filtered=rows.filter(r=>projectMatchesSearch(r.row.title,q)&&(status==='alle'||r.listStatus.tone===status)&&(!unread||r.unreadForAdminInList));
 return tools.renderProjectListPanel({projectListStats:{total:2,active:1,unread:2,finished:1,visible:filtered.length},projectSearch:q,setProjectSearch:setQ,projectStatusFilter:status,setProjectStatusFilter:setStatus,projectUnreadOnly:unread,setProjectUnreadOnly:setUnread,loadProjects:()=>window.refreshes++,authUser:{id:'self'},projects:rows,filteredProjectListRows:filtered,isSystemAdminUser:false,statusStyle:()=>({}),openProjectById:(...args)=>window.opened.push(args),deleteProject:id=>window.deleted.push(id)});}
const root=createRoot(document.getElementById('app'));
function PersonalHarness(){const personal=usePersonalAccess('self'),hr=useHrAccess('self',true),ks=useKshmsAccess('self');return <Personal context={personal} hrContext={hr} kshmsContext={ks} userId="self" authUser={{id:'self',email:'qa@example.invalid',user_metadata:{full_name:'QA Medarbeider'}}} supabaseClient={window.client}/>;}
window.render=(kind='personal')=>root.render(kind==='projects'?<Projects/>:<PersonalHarness/>);
window.render();installWorkProfileProjectListUx();
`);
const result=await build({root:cwd,configFile:false,logLevel:'silent',resolve:{alias:{'react/jsx-runtime':cwd+'/node_modules/react/jsx-runtime.js'}},plugins:[react(),{name:'synthetic-transport',enforce:'pre',resolveId(id,importer){if(importer?.endsWith('/workProfileProjectListUx.jsx')&&id.endsWith('/moduleAccessClient.js'))return '\0shared-client';if(importer?.endsWith('/workProfileProjectListUx.jsx')&&id.endsWith('/workProfileClient.js'))return '\0shared-profile';if(id.endsWith('/appSupabaseClientRegistry.js'))return '\0client';},load(id){if(id==='\0shared-client')return 'export const getStoredSupabaseSession=()=>({userId:"self"});export const rpcWithStoredSession=()=>{window.sharedReads++;return Promise.resolve({company_id:"a",company_name:"QA Firma",projects:[]});};';if(id==='\0shared-profile')return 'export const WORK_PROFILE_EVENT="qa-work-profile";export const readCachedWorkProfileState=()=>({can_switch:true,active_company_id:"a"});export const getMyWorkProfileState=async()=>readCachedWorkProfileState();';if(id==='\0client')return 'export const getAppSupabaseClient=()=>window.client;';}}],build:{write:false,minify:false,cssCodeSplit:false,rollupOptions:{input:path.join(temp,'entry.jsx'),output:{inlineDynamicImports:true}}}});
const js=result.output.find(x=>x.type==='chunk').code,css=result.output.filter(x=>x.fileName.endsWith('.css')).map(x=>x.source).join('\n');
const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html; charset=utf-8');res.end(`<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style><header style="height:156px;display:block">Expo ProffDok</header><main><div id="app"></div></main><script type="module">${js.replaceAll('</script','<\\/script')}</script>`);});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1363,height:936}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{
  window.holdMetadata=false;window.metadataWaiters=[];window.holdPlans=false;window.planWaiters=[];window.sharedReads=0;window.company='a';window.denied=false;window.calls=[];window.opened=[];window.deleted=[];window.refreshes=0;window.setup=0;
  window.ctx=()=>({company_id:window.company,user_id:'self',available:true,enabled:true,company_name:'QA Firma',administer:false});
  window.client={auth:{getUser:async()=>({data:{user:{id:'self'}}})},rpc:async(name,args)=>{
   window.calls.push({name,args});const context=window.ctx();if(['get_my_personal_context','get_hr_context','get_kshms_context'].includes(name)){if(window.holdMetadata)await new Promise(resolve=>window.metadataWaiters.push(resolve));return window.denied?{error:{code:'42501',message:'Tilgang borte'}}:{data:{...context,personal_page:true,company_hr:true,company_kshms:true}};}if(window.denied)return {error:{code:'42501',message:'Tilgang borte'}};
   if(name==='hr_followup_tasks')return {data:{context,tasks:Array.from({length:7},(_,i)=>({case_id:'c'+i,kind:'review',task_key:'hr-review',due_on:i?'2026-10-18':'2026-01-01'})),next:null}};
   if(name==='hr_conversation_feedback_notices')return {data:{context,tasks:[],next:null}};
   if(name==='hr_contact_get')return {data:{context,registered:true,available:true,editable:true,employee:{id:'e',revision:1},revision:1,data:{}}};
   if(name==='time_tasks_get')return {data:{context,enabled:false,missing_week:null,returned_count:0,review_count:0,can_manage:false}};
   if(name==='kshms_progress_mine'||name==='project_progress_mine'){if(window.holdPlans)await new Promise(resolve=>window.planWaiters.push(resolve));const plan={version:2,excludeSundays:true,activities:[{id:'own-task',title:'Min oppgave',trade:'Rørlegger',status:'Ikke startet',sessions:[{id:'s',date:'2026-10-16',startTime:'08:00',endTime:'16:00'}]}]};return {data:{context,active_date:'2026-10-16',record:args.p_id?{id:name,company_id:context.company_id,title:'Egen plan',revision:1,plan}:null,plans:[{id:name,title:name==='project_progress_mine'?'Mitt prosjekt':'Min KS/HMS-plan',address:'QA sted',first_date:'2026-10-16',last_date:'2026-12-16'}],next:null}};}
   return {error:{message:'Synthetic unavailable: '+name}};
  }};
 });
 await page.goto('http://127.0.0.1:'+server.address().port+'/');
 await page.waitForFunction(()=>document.querySelectorAll('.personal-progress-card').length===2);
 const notice=page.locator('.home-followups'),toggle=page.locator('.home-followups-toggle'),tabs=page.locator('.personal-tabs');
 await page.waitForFunction(()=>document.querySelector('.home-followups-title b')?.textContent==='8');
 await page.evaluate(()=>{window.holdMetadata=true;window.dispatchEvent(new Event('blur'));window.dispatchEvent(new Event('focus'));});
 await page.waitForFunction(()=>window.metadataWaiters.length>=3);
 eq(await page.locator('.personal-checking').count(),0,'visible focus must keep page while fresh metadata is delayed');
 eq(await page.locator('.personal-progress-card').count(),2,'source presentation remains during visible focus');
 await page.evaluate(()=>{window.holdMetadata=false;window.metadataWaiters.splice(0).forEach(resolve=>resolve());});
 await page.waitForFunction(()=>document.querySelectorAll('.personal-progress-card').length===2);
 eq(await toggle.getAttribute('aria-expanded'),'false','personal summary initially collapsed');
 eq(await page.locator('.personal-plans-card').count(),1,'one combined plan card');
 eq(await page.getByRole('heading',{name:'Mine aktive planer',exact:true}).count(),1,'one shared plan heading');
 eq(await page.getByRole('heading',{name:'Fra ProffDok-prosjekter',exact:true}).count(),1,'project source explicit');
 eq(await page.getByRole('heading',{name:'Andre fremdriftsplaner',exact:true}).count(),1,'standalone source explicit');
 eq(await notice.locator('li:visible').count(),0,'seven tasks do not obstruct work');
 eq((await toggle.innerText()).includes('HR 7'),true,'all seven counted');
 eq((await toggle.innerText()).includes('Kontakt 1'),true,'contact counted once');
 eq((await toggle.innerText()).includes('1 etter fristen'),true,'overdue remains visible');
 for(const width of [1363,768,390,320]){
  await page.setViewportSize({width,height:936});
  eq(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'personal fits '+width);
  eq((await tabs.boundingBox()).y<480,true,'tabs reachable '+width);
  eq((await tabs.boundingBox()).y<(await notice.boundingBox()).y,true,'tabs before alerts '+width);
  eq((await notice.boundingBox()).height<210,true,'summary remains compact '+width);
  if(width===1363){const plans=await page.locator('.personal-progress-card').all();eq((await plans[0].boundingBox()).y,(await plans[1].boundingBox()).y,'own plan sources share desktop row');}
  if(process.env.UX_LAYOUT_SCREENSHOTS)await page.screenshot({path:path.join(process.env.UX_LAYOUT_SCREENSHOTS,'personal-'+width+'.png'),fullPage:true});
 }
 await page.setViewportSize({width:1363,height:936});
 for(const label of ['Fra ProffDok-prosjekter','Andre fremdriftsplaner']){
  await page.getByRole('region',{name:label,exact:true}).locator('.ks-progress-list button').click();await page.locator('dialog.ks-plan-expanded[open]').waitFor();
  await page.getByRole('button',{name:'Måned',exact:true}).click();
  await page.evaluate(()=>{window.ownDialog=document.querySelector('dialog.ks-plan-expanded[open]');window.holdMetadata=true;window.holdPlans=true;window.dispatchEvent(new Event('blur'));window.dispatchEvent(new Event('focus'));});
  await page.waitForFunction(()=>window.metadataWaiters.length>=3&&window.planWaiters.length>=2);
  eq(await page.evaluate(()=>window.ownDialog===document.querySelector('dialog.ks-plan-expanded[open]')),true,'same open plan node during snipping '+label);
  eq(await page.getByRole('button',{name:'Måned',exact:true}).getAttribute('aria-pressed'),'true','view retained during snipping '+label);
  eq(await page.locator('.ks-plan-surface details button').first().isEnabled(),false,'export locked while checking '+label);
  await page.evaluate(()=>{window.holdMetadata=false;window.holdPlans=false;window.metadataWaiters.splice(0).forEach(resolve=>resolve());window.planWaiters.splice(0).forEach(resolve=>resolve());});
  await page.waitForFunction(()=>[...document.querySelectorAll('.personal-plan-source')].every(e=>e.getAttribute('aria-busy')==='false'));
  eq(await page.evaluate(()=>window.ownDialog===document.querySelector('dialog.ks-plan-expanded[open]')),true,'same plan after fresh checks '+label);
  await page.evaluate(()=>{window.holdPlans=true;window.dispatchEvent(new Event('focus'));});await page.waitForFunction(()=>window.planWaiters.length>=2);
  await page.getByRole('button',{name:'Lukk planbygger',exact:true}).click();
  await page.evaluate(()=>{window.holdPlans=false;window.planWaiters.splice(0).forEach(resolve=>resolve());});
  await page.waitForFunction(()=>[...document.querySelectorAll('.personal-plan-source')].every(e=>e.getAttribute('aria-busy')==='false'));
  eq(await page.locator('dialog.ks-plan-expanded[open]').count(),0,'close wins over delayed checks '+label);
 }
 await page.getByRole('region',{name:'Fra ProffDok-prosjekter',exact:true}).locator('.ks-progress-list button').click();await page.locator('dialog.ks-plan-expanded[open]').waitFor();
 await page.evaluate(()=>{Object.defineProperty(document,'visibilityState',{value:'hidden',configurable:true});document.dispatchEvent(new Event('visibilitychange'));});
 // React commits the visibility handler asynchronously; await that render, not the event dispatch.
 await page.waitForFunction(()=>!document.querySelector('dialog.ks-plan-expanded[open]'),{},{timeout:2000});
 eq(await page.locator('dialog.ks-plan-expanded[open]').count(),0,'real hidden page clears own payload');
 await page.evaluate(()=>{window.denied=true;Object.defineProperty(document,'visibilityState',{value:'visible',configurable:true});document.dispatchEvent(new Event('visibilitychange'));});
 eq(await page.locator('dialog.ks-plan-expanded[open]').count(),0,'denied return never restores own payload');
 await page.evaluate(()=>{window.denied=false;window.dispatchEvent(new Event('focus'));});
 await page.locator('.personal-plans-card').waitFor();
 await page.waitForFunction(()=>document.querySelectorAll('.personal-plan-source .ks-progress-list button').length===2&&[...document.querySelectorAll('.personal-plan-source')].every(e=>e.getAttribute('aria-busy')==='false'));
 if(await page.locator('dialog.ks-plan-expanded[open]').count())await page.getByRole('button',{name:'Lukk planbygger',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('.home-followups-title b')?.textContent==='8');
 await toggle.click();eq(await notice.locator('.hr-followup-notice li:visible').count(),7,'all tasks retained on demand');
 await notice.getByRole('button',{name:'Fyll ut kontaktopplysninger'}).click();
 await page.getByRole('dialog').getByLabel('Adresse',{exact:true}).waitFor();checks++;
 await page.getByRole('button',{name:'Lukk kontaktopplysninger'}).click();
 await page.getByRole('button',{name:'Mine timer',exact:true}).first().click();
 eq(await notice.isVisible(),false,'no overview alerts before time workspace');
 await page.getByRole('button',{name:'Oversikt',exact:true}).click();
 eq(await toggle.getAttribute('aria-expanded'),'true','own explicit expansion retained across tabs');
 await toggle.click();
 await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
 await page.waitForFunction(()=>document.querySelector('.home-followups-title b')?.textContent==='8');
 eq(await toggle.getAttribute('aria-expanded'),'false','fresh authorization keeps collapsed preference');
 await page.evaluate(()=>{window.denied=true;window.dispatchEvent(new Event('focus'));});
 await page.waitForFunction(()=>document.querySelectorAll('.hr-followup-notice li').length===0);checks++;
 eq(await page.getByRole('dialog').count(),0,'revocation removes details');
 eq(await page.evaluate(()=>window.calls.some(x=>/save|send|command/.test(x.name))),false,'layout does not write or send');
 await page.evaluate(()=>window.render('projects'));
 await page.locator('.projectListCard').first().waitFor();
 await page.locator('.workProfileSharedEmpty').waitFor();
 eq(await page.locator('#expo-work-profile-project-list').evaluate(e=>e.parentElement===e.closest('section')),true,'shared host remains direct section child');
 eq(await page.locator('.workProfileSharedProjects').isVisible(),true,'actual shared project adapter remains visible');
 await page.evaluate(()=>new Promise(resolve=>{let frames=0;const next=()=>++frames===15?resolve():requestAnimationFrame(next);requestAnimationFrame(next);}));
 eq(await page.evaluate(()=>window.sharedReads),1,'adapter is stable without repeated remount/reads');
 for(const width of [1363,768,390,320]){
  await page.setViewportSize({width,height:936});await page.evaluate(()=>scrollTo(0,0));
  eq(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'project list fits '+width);
  eq(await page.locator('.projectListCard').count(),2,'all project cards remain '+width);
  eq(await page.locator('.projectListCard').first().getByText('QA Leder',{exact:true}).isVisible(),true,'responsible remains visible '+width);
  eq(await page.locator('.projectListActions').first().getByRole('button').count(),8,'all shortcuts retained '+width);
  if(width===1363)eq((await page.locator('.projectListCard').first().boundingBox()).y<850,true,'first project above desktop fold');
  if(process.env.UX_LAYOUT_SCREENSHOTS)await page.screenshot({path:path.join(process.env.UX_LAYOUT_SCREENSHOTS,'projects-'+width+'.png'),fullPage:true});
 }
 const card=page.locator('.projectListCard').first();
 for(const [label,args] of [['📂 Åpne',['p0','prosjekt']],['📦 Produkter',['p0','produkter']],['📷 Bilder',['p0','bilder']],['✅ Sjekklister',['p0','sjekklister']],['📄 Rapport',['p0','rapport']],['💬 Chat (2)',['p0','chat']],['⚠️ Avvik (3)',['p0','sjekklister',{showOpenDeviationsOnly:true}]]]){
  await card.getByRole('button',{name:label,exact:true}).click();eq(await page.evaluate(()=>window.opened.at(-1)),args,'same shortcut '+label);
 }
 await card.getByRole('button',{name:'⚠️ Åpne avvik: 3',exact:true}).click();eq(await page.evaluate(()=>window.opened.at(-1)),['p0','sjekklister',{showOpenDeviationsOnly:true}],'count opens existing filtered deviations');
 await page.getByRole('button',{name:'Arkiv',exact:true}).click();eq(await page.locator('.projectListCard').count(),1,'archive filter');
 await page.getByRole('button',{name:'Nullstill',exact:true}).click();eq(await page.locator('.projectListCard').count(),2,'reset');
 await page.getByLabel('Søk i prosjektlisten',{exact:true}).fill('pågående');eq(await page.locator('.projectListCard').count(),1,'search');
 await page.getByRole('button',{name:'Nullstill',exact:true}).click();await page.getByRole('button',{name:'Kun uleste',exact:true}).click();eq(await page.locator('.projectListCard').count(),1,'unread filter');
 await page.getByRole('button',{name:'Oppdater liste',exact:true}).click();eq(await page.evaluate(()=>window.refreshes),1,'refresh retained');
 eq(await page.evaluate(()=>window.deleted),[],'no accidental delete from navigation');
 eq(errors,[],'no browser errors');
 console.log('Personal/project layout: '+checks+' Chromium checks PASS. Actual components/CSS; synthetic transport, no live writes.');
}finally{await browser?.close();server.close();fs.rmSync(temp,{recursive:true,force:true});}
