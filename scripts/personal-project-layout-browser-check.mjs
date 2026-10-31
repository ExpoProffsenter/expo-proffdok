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
import React,{useState,useLayoutEffect} from '${cwd}/node_modules/react/index.js';
import {createRoot} from '${cwd}/node_modules/react-dom/client.js';
import Personal from '${cwd}/src/modules/personal/PersonalPage.jsx';
import {usePersonalAccess} from '${cwd}/src/modules/personal/personalAccess.js';
import {useHrAccess} from '${cwd}/src/modules/hr/hrAccess.js';
import {useKshmsAccess} from '${cwd}/src/modules/kshms/kshmsAccess.js';
import {installWorkProfileProjectListUx} from '${cwd}/src/modules/access/workProfileProjectListUx.jsx';
import {createProjectListTools,projectMatchesSearch} from '${cwd}/src/modules/project/projectListTools.js';
import {matchesProjectStatus} from '${cwd}/src/modules/project/projectListStatus.mjs';
import '${cwd}/src/style.css';
import '${cwd}/src/modules/ui/proffdokWorkspace.css';
import {APP_RUNTIME_STYLES} from '${cwd}/src/modules/app/appRuntimeStyles.js';
document.head.insertAdjacentHTML('beforeend','<style>'+APP_RUNTIME_STYLES+'</style>');
const sectionSource=${JSON.stringify(fs.readFileSync('src/main.jsx','utf8').split('  function Section(')[1].split('  function CollapsibleBlock')[0])};
const Section=new Function('import_jsx_runtime','return function Section('+sectionSource)({jsx:(type,props)=>React.createElement(type,props),jsxs:(type,props)=>React.createElement(type,props)});
// Use the current app's own form wrappers, including propagation and label markup.
const mainSource=${JSON.stringify(fs.readFileSync('src/main.jsx','utf8'))};
const native=(name,next)=>new Function('import_jsx_runtime','stopInteractivePropagation','return function '+name+mainSource.split('  function '+name)[1].split('  '+next)[0])({jsx:(type,props)=>React.createElement(type,props),jsxs:(type,props)=>React.createElement(type,props)},e=>e.stopPropagation());
const Grid=native('Grid','const { renderProductSections');
const Input=native('Input','function Textarea');
const Select=native('Select','const { ProjectImagesPanel');
const tools=createProjectListTools({Section,Grid,Input,Select,getWarrantyYears:()=>10});
const rows=['Pågående prosjekt','Arkivprosjekt'].map((title,i)=>({row:{id:'p'+i,title,updated_at:'2026-10-16T12:00:00Z'},listProject:{customer:'QA Kunde',customerEmail:'qa.customer@example.invalid',customerPhone:'90000000',address:'Testveien 1',responsible:'QA Leder'},listStatus:{tone:i?'done':'progress',label:i?'Ferdigstilt':'Pågår',icon:'●'},unreadForAdminInList:i?0:2,latestMessage:null,imageSummary:{total:i?0:5,photos:1,checklist:2,install:1,chat:1,previews:i?[]:[{url:'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="60"%3E%3Crect width="80" height="60" fill="%23bcdde1"/%3E%3C/svg%3E',label:'Syntetisk prosjektbilde',source:'Bilder'}]},openDeviationCount:i?0:3,productSummary:{total:4},listWarranty:{enabled:true,issued:true},projectCompanyName:'QA firma'}));
window.setProjectName=value=>{rows[0].row.title=value;window.render('projects');};
function Projects(){const [q,setQ]=useState(''),[status,setStatus]=useState('alle'),[unread,setUnread]=useState(false),[view,setView]=useState(null);useLayoutEffect(()=>{window.committedProjectName=rows[0].row.title;});if(view)return <section aria-label="Åpnet prosjektprøve"><h2>{view[0]}</h2><button onClick={()=>setView(null)}>Tilbake til prosjektlisten</button></section>;
 const filtered=rows.filter(r=>projectMatchesSearch(r.row.title,q)&&matchesProjectStatus(r.listStatus.tone,status)&&(!unread||r.unreadForAdminInList));
 return tools.renderProjectListPanel({projectListStats:{total:2,active:1,unread:2,finished:1,visible:filtered.length},projectSearch:q,setProjectSearch:setQ,projectStatusFilter:status,setProjectStatusFilter:setStatus,projectUnreadOnly:unread,setProjectUnreadOnly:setUnread,loadProjects:()=>window.refreshes++,authUser:{id:'self'},projects:rows,filteredProjectListRows:filtered,isSystemAdminUser:false,statusStyle:()=>({}),openProjectById:(...args)=>{window.opened.push(args);if(window.testReturn)setView(args);},deleteProject:id=>window.deleted.push(id)});}
const root=createRoot(document.getElementById('app'));
function PersonalHarness(){const personal=usePersonalAccess('self'),hr=useHrAccess('self',true),ks=useKshmsAccess('self');return <Personal context={personal} hrContext={hr} kshmsContext={ks} userId="self" authUser={{id:'self',email:'qa@example.invalid',user_metadata:{full_name:'QA Medarbeider'}}} supabaseClient={window.client}/>;}
function Followup(){return <div>{tools.renderProjectFollowUpPanel({projectRows:[...rows,{row:{id:'ready',title:'Prosjekt klart for kunde'},listProject:{customer:'QA Kunde',address:'Testveien 2'},listStatus:{tone:'customer_ready'},unreadForAdminInList:0,openDeviationCount:0}],openProjectById:(...args)=>window.opened.push(args)})}</div>;}
window.render=(kind='personal')=>root.render(kind==='followup'?<Followup/>:kind==='projects'?<Projects/>:<PersonalHarness/>);
window.render(${JSON.stringify(process.env.UX_LAYOUT_PROJECT_ONLY?'projects':'personal')});installWorkProfileProjectListUx();
`);
const result=await build({root:cwd,configFile:false,logLevel:'silent',resolve:{alias:{'react/jsx-runtime':cwd+'/node_modules/react/jsx-runtime.js'}},plugins:[react(),{name:'synthetic-transport',enforce:'pre',resolveId(id,importer){if(importer?.endsWith('/workProfileProjectListUx.jsx')&&id.endsWith('/moduleAccessClient.js'))return '\0shared-client';if(importer?.endsWith('/workProfileProjectListUx.jsx')&&id.endsWith('/workProfileClient.js'))return '\0shared-profile';if(id.endsWith('/appSupabaseClientRegistry.js'))return '\0client';},load(id){if(id==='\0shared-client')return 'export const getStoredSupabaseSession=()=>({userId:"self"});export const rpcWithStoredSession=()=>{window.sharedReads++;return Promise.resolve({company_id:"a",company_name:"QA Firma",projects:window.sharedFixtures||[]});};';if(id==='\0shared-profile')return 'export const WORK_PROFILE_EVENT="qa-work-profile";export const readCachedWorkProfileState=()=>({can_switch:true,active_company_id:"a"});export const getMyWorkProfileState=async()=>readCachedWorkProfileState();';if(id==='\0client')return 'export const getAppSupabaseClient=()=>window.client;';}}],build:{write:false,minify:false,cssCodeSplit:false,rollupOptions:{input:path.join(temp,'entry.jsx'),output:{inlineDynamicImports:true}}}});
const js=result.output.find(x=>x.type==='chunk').code,css=result.output.filter(x=>x.fileName.endsWith('.css')).map(x=>x.source).join('\n');
const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html; charset=utf-8');res.end(`<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style><div data-expo-app-shell="true"><header style="height:156px;display:block">Expo ProffDok</header><main><div id="app"></div></main></div><script type="module">${js.replaceAll('</script','<\\/script')}</script>`);});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1363,height:936}}),errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error('Browser error:',e.stack);});
 page.setDefaultTimeout(10000);
 // Historical fixture: one overdue task and six future tasks on 16 October.
 // Fix Date only; browser timers and asynchronous recovery continue normally.
 await page.clock.setFixedTime(new Date('2026-10-16T12:00:00Z'));
 await page.addInitScript(()=>{
  window.holdMetadata=false;window.metadataWaiters=[];window.holdPlans=false;window.planWaiters=[];window.sharedReads=0;window.company='a';window.denied=false;window.calls=[];window.opened=[];window.deleted=[];window.refreshes=0;window.setup=0;
  window.ctx=()=>({company_id:window.company,user_id:'self',available:true,enabled:true,company_name:'QA Firma',administer:false});
  window.client={auth:{getUser:async()=>({data:{user:{id:'self'}}})},rpc:async(name,args)=>{
   window.calls.push({name,args});const context=window.ctx();if(['get_my_personal_context','get_hr_context','get_kshms_context'].includes(name)){if(window.holdMetadata)await new Promise(resolve=>window.metadataWaiters.push(resolve));return window.denied?{error:{code:'42501',message:'Tilgang borte'}}:{data:{...context,personal_page:true,company_hr:true,company_kshms:true}};}if(window.denied)return {error:{code:'42501',message:'Tilgang borte'}};
   if(name==='hr_followup_tasks')return {data:{context,tasks:Array.from({length:7},(_,i)=>({case_id:'c'+i,kind:'review',task_key:'hr-review',due_on:i?'2026-10-18':'2026-01-01'})),next:null}};
   if(name==='hr_conversation_feedback_notices')return {data:{context,tasks:[],next:null}};
   if(name==='hr_contact_get')return {data:{context,registered:true,available:true,editable:true,employee:{id:'e',revision:1},revision:1,data:{}}};
   if(name==='time_tasks_get')return {data:{context,enabled:true,missing_week:null,returned_count:0,review_count:0,can_manage:false}};
   if(name==='kshms_progress_mine'||name==='project_progress_mine'){if(window.holdPlans)await new Promise(resolve=>window.planWaiters.push(resolve));const plan={version:2,excludeSundays:true,activities:[{id:'own-task',title:'Min oppgave',trade:'Rørlegger',status:'Ikke startet',sessions:[{id:'s',date:'2026-10-16',startTime:'08:00',endTime:'16:00'}]}]};return {data:{context,active_date:'2026-10-16',record:args.p_id?{id:name,company_id:context.company_id,title:'Egen plan',revision:1,plan}:null,plans:[{id:name,title:name==='project_progress_mine'?'Mitt prosjekt':'Min KS/HMS-plan',address:'QA sted',first_date:'2026-10-16',last_date:'2026-12-16'}],next:null}};}
   return {error:{message:'Synthetic unavailable: '+name}};
  }};
 });
 await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
 await page.goto('http://127.0.0.1:'+server.address().port+'/');
 if(!process.env.UX_LAYOUT_PROJECT_ONLY){
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
 // I dag starts with the native plan disclosure closed; open the actual user entry.
 await page.locator('.personal-plans-card>summary').click();
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
 await page.getByRole('button',{name:'Mine planer',exact:true}).click();
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
 await page.getByRole('button',{name:'I dag',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('.home-followups-title b')?.textContent==='8');
 await toggle.click();eq(await notice.locator('.hr-followup-notice li:visible').count(),7,'all tasks retained on demand');
 await notice.getByRole('button',{name:'Fyll ut kontaktopplysninger'}).click();
 await page.getByRole('dialog').getByLabel('Adresse',{exact:true}).waitFor();checks++;
 await page.getByRole('button',{name:'Lukk kontaktopplysninger'}).click();
 await page.getByRole('button',{name:'Mine timer',exact:true}).first().click();
 eq(await notice.isVisible(),false,'no overview alerts before time workspace');
 await page.getByRole('button',{name:'I dag',exact:true}).click();
 eq(await toggle.getAttribute('aria-expanded'),'true','own explicit expansion retained across tabs');
 await toggle.click();
 await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
 await page.waitForFunction(()=>document.querySelector('.home-followups-title b')?.textContent==='8');
 eq(await toggle.getAttribute('aria-expanded'),'false','fresh authorization keeps collapsed preference');
 await page.evaluate(()=>{window.denied=true;window.dispatchEvent(new Event('focus'));});
 await page.waitForFunction(()=>document.querySelectorAll('.hr-followup-notice li').length===0);checks++;
 eq(await page.getByRole('dialog').count(),0,'revocation removes details');
 eq(await page.evaluate(()=>window.calls.some(x=>/save|send|command/.test(x.name))),false,'layout does not write or send');
 }
 await page.evaluate(()=>window.render('projects'));
 await page.locator('.projectListCard').first().waitFor();
 await page.locator('.workProfileSharedEmpty').waitFor();
 eq(await page.locator('#expo-work-profile-project-list').evaluate(e=>e.parentElement===e.closest('section')),true,'shared host remains direct section child');
 eq(await page.locator('.workProfileSharedProjects').isVisible(),true,'actual shared project adapter remains visible');
 await page.evaluate(()=>new Promise(resolve=>{let frames=0;const next=()=>++frames===15?resolve():requestAnimationFrame(next);requestAnimationFrame(next);}));
 eq(await page.evaluate(()=>window.sharedReads),1,'adapter is stable without repeated remount/reads');
 eq(await page.locator('.projectListDisclosureCard>details[open]').count(),0,'project cards start compact');eq(await page.getByLabel('Søk i prosjektlisten',{exact:true}).isVisible(),true,'search and status always visible together');
 eq(await page.getByRole('combobox',{name:/^Statusfilter/}).isVisible(),true,'all native statuses directly available');
 eq(await page.locator('.projectListCard').first().getByRole('button',{name:'Åpne',exact:true}).isVisible(),true,'primary open stays visible');
 const listChoice=async(name)=>{const details=page.locator('.projectListExtraFilters');if(!await details.evaluate(e=>e.open))await details.locator('summary').click();await details.getByRole('button',{name,exact:true}).click();if(await details.evaluate(e=>e.open))await details.locator('summary').click();};
 await page.locator('.projectListCard').first().getByRole('button',{name:'Åpne',exact:true}).click();eq(await page.evaluate(()=>window.opened.at(-1)),['p0','prosjekt'],'compact primary uses same project callback');eq(await page.locator('.projectListDisclosureCard>details[open]').count(),0,'opening project does not toggle presentation');
 await page.locator('.projectListCard').first().locator('summary').click();eq(await page.locator('.projectListCard').first().getByText('QA Leder',{exact:true}).first().isVisible(),true,'one card reveals original metadata');await page.locator('.projectListCard').first().locator('summary').press('Enter');eq(await page.locator('.projectListDisclosureCard>details[open]').count(),0,'keyboard collapses card');
 await listChoice('Vis alle detaljer');await page.waitForFunction(()=>document.querySelectorAll('.projectListDisclosureCard>details[open]').length===2);checks++;
 for(const width of [1920,1363,768,390,320]){
  await page.setViewportSize({width,height:600});await page.evaluate(()=>scrollTo(0,0));
  await listChoice('Kollaps alle detaljer');await page.waitForFunction(()=>document.querySelectorAll('.projectListDisclosureCard>details[open]').length===0);eq(await page.locator('.projectListCard').first().getByRole('button',{name:'Åpne',exact:true}).isVisible(),true,'compact primary stays available '+width);await page.evaluate(()=>scrollTo(0,0));
  const bounds=await page.locator('.projectListCard').first().evaluate(card=>{const b=card.querySelector('.projectListPrimaryOpen').getBoundingClientRect(),t=card.querySelector('.projectListTitleBlock>b').getBoundingClientRect();return b.left>=t.right-1||b.top>=t.bottom||b.bottom<=t.top;});eq(bounds,true,'compact open never overlays title '+width);
  if(width<760)eq((await page.locator('.projectListHeaderCards').boundingBox()).height<85,true,'mobile stats stay in two compact rows '+width);
  const compactGeometry=await page.locator('.projectListWorkspace').evaluate(panel=>{
   const visible=[...panel.querySelectorAll('button,input,select')].filter(e=>e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden');
   return visible.filter(e=>e.getBoundingClientRect().height<43.5||parseFloat(getComputedStyle(e).fontSize)<15.9||e.scrollWidth>e.clientWidth+1).map(e=>({label:e.textContent||e.getAttribute('aria-label'),height:e.getBoundingClientRect().height,font:getComputedStyle(e).fontSize,scroll:e.scrollWidth,width:e.clientWidth}));
  });eq(compactGeometry,[],'readable controls,44px targets and whole labels '+width);
  eq(await page.locator('.projectListCard').first().locator('.projectListResponsible').isVisible(),true,'responsible visible before expansion '+width);
  eq(await page.locator('.projectListCard').first().locator('.projectListLocation').isVisible(),true,'address visible before expansion '+width);
  const sharedEmptyBox=await page.locator('.workProfileSharedProjects').boundingBox();eq(sharedEmptyBox.height<(width>=1051?65:135),true,'empty shared scope stays compact with refresh '+width);
  const compactBox=await page.locator('.projectListCard').first().boundingBox();console.log('Compact project card',{width,height:compactBox.height,top:compactBox.y});if(width===1363||width===1920)eq(compactBox.height<=104,true,'desktop rows keep compact overview with all signals');if(process.env.UX_LAYOUT_SCREENSHOTS){await page.screenshot({path:path.join(process.env.UX_LAYOUT_SCREENSHOTS,'projects-compact-'+width+'.png'),fullPage:true,animations:'disabled'});await page.screenshot({path:path.join(process.env.UX_LAYOUT_SCREENSHOTS,'projects-viewport-'+width+'.png'),animations:'disabled'});}
  await listChoice('Vis alle detaljer');await page.waitForFunction(()=>document.querySelectorAll('.projectListDisclosureCard>details[open]').length===2);
  eq(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'project list fits '+width);
  eq(await page.locator('.projectListCard').count(),2,'all project cards remain '+width);
  eq(await page.locator('.projectListCard').first().getByText('QA Leder',{exact:true}).first().isVisible(),true,'responsible remains visible '+width);
  eq(await page.locator('.projectListCard').first().locator('.projectListActions>button,.projectListPrimaryOpen').count(),8,'all shortcuts retained '+width);
  for(const text of ['✉ qa.customer@example.invalid','☎ 90000000','🏢 QA firma'])eq(await page.locator('.projectListCard').first().getByText(text,{exact:true}).isVisible(),true,'original contact metadata retained '+text+' '+width);
  eq(await page.locator('.projectListCard').first().getByAltText('Syntetisk prosjektbilde').isVisible(),true,'original image preview retained '+width);
  if(width===1363)eq((await page.locator('.projectListCard').first().boundingBox()).y<600,true,'first project reachable in short desktop viewport');
  const detailGeometry=await page.locator('.projectListCard').first().evaluate(panel=>[...panel.querySelectorAll('button')].filter(e=>e.getClientRects().length).filter(e=>e.getBoundingClientRect().height<43.5||parseFloat(getComputedStyle(e).fontSize)<15.9||e.scrollWidth>e.clientWidth+1).map(e=>e.textContent));eq(detailGeometry,[],'all detailed actions readable and reachable '+width);
  await page.locator('.projectListCard').first().getByRole('button',{name:'🗑️ Slett',exact:true}).focus();
  eq(await page.locator('.projectListCard').first().getByRole('button',{name:'🗑️ Slett',exact:true}).evaluate(e=>{const b=e.getBoundingClientRect();return b.top>=0&&b.bottom<=innerHeight;}),true,'last action scrolls into short viewport '+width);
  if(process.env.UX_LAYOUT_SCREENSHOTS)await page.screenshot({path:path.join(process.env.UX_LAYOUT_SCREENSHOTS,'projects-'+width+'.png'),fullPage:true,animations:'disabled'});
 }
 const card=page.locator('.projectListCard').first();
 for(const [label,args] of [['Åpne',['p0','prosjekt']],['📦 Produkter',['p0','produkter']],['📷 Bilder',['p0','bilder']],['✅ Sjekklister',['p0','sjekklister']],['📄 Rapport',['p0','rapport']],['💬 Chat (2)',['p0','chat']],['⚠️ Avvik (3)',['p0','sjekklister',{showOpenDeviationsOnly:true}]]]){
  await card.getByRole('button',{name:label,exact:true}).click();eq(await page.evaluate(()=>window.opened.at(-1)),args,'same shortcut '+label);
 }
 for(const [label,args] of [['📦 Produkter: 4',['p0','produkter']],['📷 Bilder: 5',['p0','bilder']],['💬 Ulest chat: 2',['p0','chat']]]){await card.getByRole('button',{name:label,exact:true}).click();eq(await page.evaluate(()=>window.opened.at(-1)),args,'same original count callback '+label);}
 await card.getByRole('button',{name:'⚠️ Åpne avvik: 3',exact:true}).click();eq(await page.evaluate(()=>window.opened.at(-1)),['p0','sjekklister',{showOpenDeviationsOnly:true}],'count opens existing filtered deviations');
 await listChoice('Kollaps alle detaljer');eq(await page.locator('.projectListDisclosureCard>details[open]').count(),0,'all cards collapse without losing content');
 await listChoice('Arkiv');eq(await page.locator('.projectListCard').count(),1,'archive filter');
 await listChoice('Nullstill');eq(await page.locator('.projectListCard').count(),2,'reset');
 await page.getByLabel('Søk i prosjektlisten',{exact:true}).fill('pågående');eq(await page.locator('.projectListCard').count(),1,'search');
 await listChoice('Nullstill');await listChoice('Kun uleste');eq(await page.locator('.projectListCard').count(),1,'unread filter');
 await listChoice('Oppdater liste');eq(await page.evaluate(()=>window.refreshes),1,'refresh retained');
 await listChoice('Nullstill');
 await page.evaluate(()=>{window.sharedFixtures=[{id:'shared-p',user_id:'colleague',title:'Felles pågår',project:{status:'Pågår'}},{id:'shared-d',user_id:'colleague',title:'Felles avvik',project:{workflowStatus:'Avvik åpent'}},{id:'shared-a',user_id:'colleague',title:'Felles arkiv',locked:true,project:{status:'Ferdigstilt'}}];});await page.getByRole('button',{name:'Oppdater felles',exact:true}).click();await page.waitForFunction(()=>document.querySelectorAll('.workProfileSharedCard').length===3);checks++;
 await listChoice('Aktive');await page.waitForFunction(()=>document.querySelectorAll('.workProfileSharedCard').length===2);checks++;
 await listChoice('Arkiv');await page.waitForFunction(()=>document.querySelectorAll('.workProfileSharedCard').length===1);eq(await page.locator('.workProfileSharedCard').getByText('Felles arkiv',{exact:true}).count(),1,'shared archive filter');
 await listChoice('Alle');await page.waitForFunction(()=>document.querySelectorAll('.workProfileSharedCard').length===3);eq(await page.locator('.projectListActiveFilters').innerText(),'Alle statuser','active filter remains visible');
 for(const width of [1920,1363,768,390,320]){
  await page.setViewportSize({width,height:600});
  const shared=page.locator('.workProfileSharedCard').first();
  const geometry=await shared.locator('.workProfileSharedActions>button').evaluateAll(buttons=>buttons.map(button=>{const r=button.getBoundingClientRect();return {label:button.textContent,width:r.width,height:r.height,left:r.left,right:r.right,top:r.top,font:parseFloat(getComputedStyle(button).fontSize),overflow:button.scrollWidth>button.clientWidth+1};}));
  eq(geometry.length,4,'all four native shared-project actions retained '+width);
  eq(geometry.filter(b=>b.height<43.5||b.font<15.9||b.overflow||b.left<0||b.right>width),[],'shared actions have44px/16px whole labels and fit '+width);
  eq(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'filled shared list keeps page width '+width);
  if(width<=390)eq(geometry[0].top===geometry[1].top&&geometry[2].top===geometry[3].top&&geometry[2].top>geometry[0].top,true,'shared actions form two compact rows '+width+': '+JSON.stringify(geometry));
  if(process.env.UX_LAYOUT_SCREENSHOTS)await page.screenshot({path:path.join(process.env.UX_LAYOUT_SCREENSHOTS,'projects-shared-filled-'+width+'.png'),fullPage:true,animations:'disabled'});
 }
 eq(await page.evaluate(()=>window.sharedReads),2,'presentation and filter changes never reload shared projects');
 const select=page.getByRole('combobox',{name:/^Statusfilter/});
 eq(await select.locator('option').evaluateAll(options=>options.map(o=>o.value)),['alle','active','archive','draft','progress','waiting','customer_ready','deviation','done','locked'],'all ten existing status choices retained');
 for(const [value,count] of [['progress',1],['done',1],['active',1],['archive',1],['draft',0],['waiting',0],['customer_ready',0],['deviation',0],['locked',0],['alle',2]]){await select.selectOption(value);eq(await page.locator('.projectListCard').count(),count,'existing status choice '+value);}
 await page.getByLabel('Søk i prosjektlisten',{exact:true}).fill('finnes ikke');eq(await page.getByText('Ingen prosjekter matcher søket eller filteret.',{exact:true}).isVisible(),true,'empty result explains filter');
 await listChoice('Nullstill');
 eq(await page.evaluate(()=>window.deleted),[],'no accidental delete from navigation');
 await page.getByLabel('Søk i prosjektlisten',{exact:true}).fill('pågående');
 await page.evaluate(()=>{window.dispatchEvent(new Event('blur'));window.dispatchEvent(new Event('focus'));});
 eq(await page.getByLabel('Søk i prosjektlisten',{exact:true}).inputValue(),'pågående','list query retained through focus cycle');
 eq(await page.locator('.projectListCard').count(),1,'filtered rows retained through focus cycle');
 await page.evaluate(()=>{window.testReturn=true;});
 await page.locator('.projectListCard').first().getByRole('button',{name:'Åpne',exact:true}).click();
 await page.getByRole('region',{name:'Åpnet prosjektprøve'}).waitFor();
 await page.getByRole('button',{name:'Tilbake til prosjektlisten',exact:true}).click();
 eq(await page.getByLabel('Søk i prosjektlisten',{exact:true}).inputValue(),'pågående','native caller query remains through callback navigation and return');
 eq(await page.locator('.projectListCard').count(),1,'return keeps original filtered rows');
 await page.evaluate(()=>{window.testReturn=false;});
 await listChoice('Nullstill');
 await listChoice('Vis alle detaljer');await page.locator('.projectListCard').first().getByRole('button',{name:'🗑️ Slett',exact:true}).click();eq(await page.evaluate(()=>window.deleted),['p0'],'explicit delete invokes only original mocked callback');await listChoice('Kollaps alle detaljer');
 // Long real-world identity strings must wrap, never cover the existing actions.
 const longName='Rehabilitering av hovedbad og vaskerom i Strandveien 48 – første etasje og tilbygg';
 await page.evaluate(name=>window.setProjectName(name),longName);
 // root.render schedules an update; a resolved evaluate is not a React commit.
 // Wait for the fixture's layout effect before all original DOM/geometry asserts.
 await page.waitForFunction(name=>window.committedProjectName===name,longName);
 // root.render schedules React work; wait for this unique title's actual DOM commit.
 await page.waitForFunction(name=>document.querySelector('.projectListCard .projectListTitleBlock>b')?.textContent===name,longName);
 for(const width of [1920,1363,768,390,320]){
  await page.setViewportSize({width,height:600});await page.evaluate(()=>scrollTo(0,0));
  const first=page.locator('.projectListCard').first();
  eq(await first.locator('.projectListTitleBlock>b').innerText(),longName,'full long project title '+width);
  eq(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'long real project title keeps page width '+width);
  eq(await first.evaluate(card=>{const a=card.querySelector('.projectListPrimaryOpen').getBoundingClientRect(),b=card.querySelector('.projectListTitleBlock>b').getBoundingClientRect();return a.left>=b.right-1||a.top>=b.bottom||a.bottom<=b.top;}),true,'long title does not overlap open '+width);
  eq(await first.locator('.projectListAttention').isVisible(),true,'long title preserves unread/deviation signals '+width);
  eq(await first.locator('summary').evaluate(e=>e.getBoundingClientRect().height>=44),true,'long title preserves summary target '+width);
  console.log('Long project row',{width,height:(await first.boundingBox()).height});
  if(process.env.UX_LAYOUT_SCREENSHOTS)await page.screenshot({path:path.join(process.env.UX_LAYOUT_SCREENSHOTS,'projects-long-'+width+'.png'),fullPage:true,animations:'disabled'});
 }
 await page.evaluate(()=>window.setProjectName('Pågående prosjekt'));
 await page.waitForFunction(()=>window.committedProjectName==='Pågående prosjekt');
 // Same follow-up selection, counts and callbacks; compact row on wide screens.
 await page.evaluate(()=>window.render('followup'));await page.locator('.pd-followup-row').first().waitFor();
 eq(await page.locator('.pd-followup-row').count(),2,'only projects needing attention');
 for(const width of [1920,1363,768,390,320]){
  await page.setViewportSize({width,height:600});
  eq(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'follow-up fits '+width);
  eq(await page.locator('.pd-followup-row').first().getByText('2 uleste kundemeldinger',{exact:false}).isVisible(),true,'unread count retained '+width);
  eq(await page.locator('.pd-followup-row').first().getByRole('button',{name:'Se avvik',exact:true}).isVisible(),true,'action retained '+width);
  if(width===1363)eq((await page.locator('.pd-followup-row').first().boundingBox()).height<115,true,'desktop uses one compact row');
  eq(await page.locator('.pd-project-followup').evaluate(panel=>[...panel.querySelectorAll('button')].filter(e=>e.getBoundingClientRect().height<43.5||parseFloat(getComputedStyle(e).fontSize)<15.9||e.scrollWidth>e.clientWidth+1).map(e=>e.textContent)),[],'followup44px/16px whole action labels '+width);
  if(process.env.UX_LAYOUT_SCREENSHOTS)await page.screenshot({path:path.join(process.env.UX_LAYOUT_SCREENSHOTS,'followup-'+width+'.png'),fullPage:true,animations:'disabled'});
 }
 for(const [label,args] of [['Åpne chat',['p0','chat']],['Se avvik',['p0','sjekklister',{showOpenDeviationsOnly:true}]],['Åpne prosjekt',['ready','prosjekt']]]){
  await page.locator('.pd-project-followup').getByRole('button',{name:label,exact:true}).click();eq(await page.evaluate(()=>window.opened.at(-1)),args,'same follow-up callback '+label);
 }
 eq(errors,[],'no browser errors');
 console.log('Personal/project layout: '+checks+' Chromium checks PASS. Actual components/CSS; synthetic transport, no live writes.');
}finally{await browser?.close();server.close();fs.rmSync(temp,{recursive:true,force:true});}
