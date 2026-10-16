import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
let checks=0;const eq=(a,b,label)=>{assert.deepEqual(a,b,label);checks++;};
const cwd=process.cwd(),temp=fs.mkdtempSync(path.join(os.tmpdir(),'home-followups-')),entry=path.join(temp,'entry.jsx');
// Exercise the actual app-shell mounting expressions, rather than a copied route condition.
const mainSource=fs.readFileSync('src/main.jsx','utf8');
const mountLines=mainSource.split('\n').filter(line=>line.includes('(HomeFollowups, {')||line.includes('(KshmsTasks, {'));
assert(mountLines.some(line=>line.includes('(HomeFollowups, {')),'Missing production Home integration');
const mountCode='const {tab,hasActiveProjectWorkspace,mobileCreatingProject,isProjectSupportReadOnly,kshmsContext,hrContext,authUser,ownRights,openKshmsDeviation,goToTab,kshmsScopeKey}=state;return React.createElement(React.Fragment,null,'+mountLines.map(line=>line.trim().replace(/,$/,'')).join(',')+');';
fs.writeFileSync(entry,`import React from '${cwd}/node_modules/react/index.js';import {createRoot} from '${cwd}/node_modules/react-dom/client.js';import * as jsxRuntime from '${cwd}/node_modules/react/jsx-runtime.js';import {createGlobalAppTabs,createProjectWorkspaceTabs} from '${cwd}/src/modules/project/projectNavigationTabs.mjs';import Home from '${cwd}/src/modules/home/HomeFollowups.jsx';import Tasks from '${cwd}/src/modules/kshms/KshmsTasks.jsx';import Notice from '${cwd}/src/modules/hr/HrFollowupNotice.jsx';import '${cwd}/src/style.css';import {APP_RUNTIME_STYLES} from '${cwd}/src/modules/app/appRuntimeStyles.js';document.head.insertAdjacentHTML('beforeend','<style>'+APP_RUNTIME_STYLES+'</style>');const root=createRoot(document.getElementById('app'));const sourceNotices=new Function('React','import_jsx_runtime','HomeFollowups','KshmsTasks','state',${JSON.stringify(mountCode)});window.noticeCases=[...createGlobalAppTabs({isCompanyAdminUser:true,canUseAdminProjectSync:true,canUseKshms:true,canUseHr:true,personalPage:true}).filter(([tab])=>tab!=='prosjekt').map(([tab,label])=>({tab,label})),...createProjectWorkspaceTabs({hasSalesOrigin:true,canUseKshms:true}).map(([tab,label])=>({tab,label:'Prosjekt '+label,hasActiveProjectWorkspace:true})),{tab:'prosjekt',label:'Nytt prosjekt mobil',mobileCreatingProject:true},{tab:'prosjekt',label:'Support',isProjectSupportReadOnly:true}];window.render=(mode='home')=>{const ctx=window.ctx();root.render(mode==='shell'?sourceNotices(React,jsxRuntime,Home,Tasks,{tab:'prosjekt',hasActiveProjectWorkspace:false,mobileCreatingProject:false,isProjectSupportReadOnly:false,...window.shell,kshmsContext:window.ks?ctx:null,hrContext:window.hr?ctx:null,authUser:{id:window.actor},ownRights:{hr:window.hr},openKshmsDeviation:window.openDeviation,goToTab:window.setup,kshmsScopeKey:window.company+':'+window.actor}):mode==='legacy'?React.createElement(React.Fragment,null,React.createElement(Tasks,{context:ctx,onOpen:window.openDeviation}),React.createElement(Notice,{context:ctx,userId:window.actor,onSetup:window.setup})):mode==='none'?null:React.createElement(Home,{hrContext:window.hr?ctx:null,kshmsContext:window.ks?ctx:null,userId:window.actor,onOpenDeviation:window.openDeviation,onSetup:window.setup}));};window.render();`);
const result=await build({root:cwd,configFile:false,logLevel:'silent',plugins:[react(),{name:'home-synthetic-transport',enforce:'pre',resolveId(id){if(id.endsWith('/appSupabaseClientRegistry.js'))return '\0client';},load(id){if(id==='\0client')return 'export const getAppSupabaseClient=()=>window.client;';}}],build:{write:false,minify:false,cssCodeSplit:false,rollupOptions:{input:entry,output:{inlineDynamicImports:true}}}});
const js=result.output.find(x=>x.type==='chunk').code,css=result.output.filter(x=>x.fileName.endsWith('.css')).map(x=>x.source).join('\n');
const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html; charset=utf-8');res.end(`<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style><header style="position:static;height:100px">Expo ProffDok</header><main><div id="app"></div><section id="following" style="height:1800px">Bevarte snarveier og prosjektinnhold</section></main><script type="module">${js.replaceAll('</script','<\\/script')}</script>`);});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];page.on('pageerror',e=>{errors.push(e.message);console.log('BROWSER ERROR',e.message);});page.setDefaultTimeout(7000);
 await page.addInitScript(()=>{
  window.actor='self';window.company=new URLSearchParams(location.search).get('kshmsCompany')||'firm';window.hr=true;window.ks=true;window.empty=false;window.fail=false;window.denied=false;window.hold=false;window.waiters=[];window.paged=true;window.fields={};window.revision=0;window.calls=[];window.opened=[];window.setups=0;
  window.today=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Oslo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  window.ctx=()=>({company_id:window.company,user_id:window.actor,company_name:'QA firma',available:true,enabled:true,manage:true});
  window.openDeviation=async id=>{window.opened.push(id);return true;};window.setup=()=>window.setups++;
  window.client={auth:{getUser:async()=>({data:{user:{id:window.actor}}})},rpc:async(name,args)=>{
   window.calls.push({name,args});const context=window.ctx();
   if(window.hold&&name!=='hr_contact_get')await new Promise(resolve=>window.waiters.push(resolve));
   if(window.denied)return {error:{code:'42501',message:'QA denied'}};
   if(window.fail&&name!=='hr_contact_get')return {error:{message:'QA offline'}};
   if(name==='kshms_deviation_tasks')return {data:{company_id:context.company_id,user_id:context.user_id,count:window.empty?0:3,overdue:1,due_today:1,due_soon:1,items:window.empty?[]:[{id:'11111111-1111-4111-8111-111111111111',title:'QA avvik',due_on:'2026-10-01',deadline_status:'overdue'}]}};
   if(name==='kshms_execution_tasks')return {data:{company_id:context.company_id,user_id:context.user_id,count:window.empty?0:2,overdue:1,items:window.empty?[]:[{id:'22222222-2222-4222-8222-222222222222',kind:'round',title:'QA kontroll',due_on:'2026-10-01',accessible:true},{id:'33333333-3333-4333-8333-333333333333',kind:'risk',accessible:false}]}};
   if(name==='hr_followup_tasks')return {data:{context,tasks:window.empty?[]:Array.from({length:args.p_after?1:7},(_,i)=>({case_id:args.p_after?'extra':'case-'+i,kind:'review',task_key:'hr-review',due_on:i===0?'2026-01-01':window.today()})),next:window.paged&&!args.p_after?{due_on:window.today(),case_id:'case-6',task_key:'hr-review'}:null}};
   if(name==='hr_conversation_feedback_notices')return {data:{context,tasks:[],next:null}};
   if(name==='hr_contact_get')return {data:{context,registered:true,available:true,editable:true,employee:{id:'employee',revision:1},revision:window.revision,data:window.empty?{address:'A',postal_code:'1',city:'B',relative_name:'C',relative_phone:'2'}:window.fields}};
   if(name==='hr_contact_save'){window.fields=structuredClone(args.p_data);window.revision++;return {data:{context,employee:{id:'employee',revision:1},revision:window.revision}};}
   if(name==='kshms_execution_state')return {data:{context,records:[],members:[],templates:[],next:null}};
   if(name==='kshms_execution_detail')return {data:{context,record:{id:args.p_id,company_id:context.company_id,kind:'round',responsible_id:'self',revision:1,status:'completed',content:{title:'QA kontroll',workplace:'QA',planned_on:'2026-10-01',points:[],answers:{},risks:[],responsible_id:'self'}},links:[]}};
   return {error:{message:'Unexpected RPC '+name}};
  }};
 });
 await page.goto('http://127.0.0.1:'+server.address().port+'/');
 const toggle=page.locator('.home-followups-toggle'),home=page.locator('.home-followups');
 await page.waitForFunction(()=>document.querySelector('.home-followups-title b')?.textContent==='13+');
 eq(await toggle.getAttribute('aria-expanded'),'false','starts collapsed');
 eq(await home.locator('.hr-followup-notice li:visible').count(),0,'no tall HR list on load');
 for(const text of ['Avvik 3','Kontroller 2','HR 7+','Kontakt 1','2 etter fristen','7 i dag','1 med frist innen tre dager','1 etter planlagt kontrolldato'])eq((await toggle.textContent()).includes(text),true,text);
 eq(await page.evaluate(()=>window.calls.filter(c=>c.name==='kshms_deviation_tasks').length),1,'no duplicate source mount');
 eq(await page.evaluate(()=>window.calls.some(c=>/save|command|notify|send/.test(c.name))),false,'presentation has no writes or email');
 for(const width of [320,390,768,1280]){
  await page.setViewportSize({width,height:900});
  eq(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'collapsed fits '+width);
  if(process.env.HOME_QA_SCREENSHOTS)await page.screenshot({path:path.join(process.env.HOME_QA_SCREENSHOTS,'home-'+width+'.png')});
  console.log('collapsed',width,await home.boundingBox());
  eq((await home.boundingBox()).height<210,true,'compact height '+width);
 }
 await toggle.focus();await page.keyboard.press('Enter');eq(await toggle.getAttribute('aria-expanded'),'true','keyboard expansion');
 eq(await home.locator('.hr-followup-notice li:visible').count(),7,'all HR tasks retained');
 await home.getByRole('button',{name:'Åpne HR-oppsett'}).first().click();eq(await page.evaluate(()=>window.setups),1,'HR setup action retained');
 await home.getByRole('button',{name:'Hent flere oppfølginger'}).click();await page.waitForFunction(()=>document.querySelectorAll('.hr-followup-notice li').length===8);eq(await home.locator('.hr-followup-notice li').count(),8,'pagination retained');
 eq(await page.evaluate(()=>{window.scrollTo(0,400);return getComputedStyle(document.querySelector('.home-followups')).position;}),'static','overview scrolls with the page');
 await home.getByRole('button',{name:'Åpne avvik',exact:true}).click();eq(await page.evaluate(()=>window.opened.length),1,'direct deviation action');
 await home.getByLabel('Vis oppgaver (3)',{exact:true}).click();
 await home.getByRole('button',{name:/QA avvik/}).click();eq(await page.evaluate(()=>window.opened.at(-1)),'11111111-1111-4111-8111-111111111111','exact deviation retained');
 await home.getByRole('button',{name:'Se alle i Avvikssentral'}).click();eq(await page.evaluate(()=>window.opened.at(-1)),null,'all deviations retained');
 await home.getByLabel('Vis gjennomføringer (2)',{exact:true}).click();eq(await home.getByText(/Be firmaadmin kontrollere prosjekttilgangen/).isVisible(),true,'inaccessible control message preserved');
 for(const width of [320,390,1280]){
  await page.setViewportSize({width,height:900});
  eq(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'expanded fits '+width);
  eq(await home.locator('.ks-task-content').evaluateAll(nodes=>nodes.every(node=>getComputedStyle(node).position==='static')),true,'details remain in flow');
  eq(await home.locator('.ks-task-banner').evaluateAll(nodes=>nodes.every(node=>getComputedStyle(node).position==='static')),true,'no sticky overlap');
  eq(await page.evaluate(()=>document.querySelector('#following').getBoundingClientRect().top>=document.querySelector('.home-followups').getBoundingClientRect().bottom),true,'next content below details');
 }
 await page.setViewportSize({width:390,height:900});
 await home.getByRole('button',{name:'Fyll ut kontaktopplysninger'}).click();const dialog=page.getByRole('dialog');await dialog.getByLabel('Adresse',{exact:true}).waitFor();
 for(const [label,value] of [['Adresse','QA gate'],['Postnummer','0123'],['Poststed','Oslo'],['Pårørendes fulle navn','QA kontakt'],['Pårørendes telefon','12345678']])await dialog.getByLabel(label,{exact:true}).fill(value);
 await dialog.getByRole('button',{name:'Lagre adresse og pårørende'}).click();await page.waitForFunction(()=>!document.querySelector('.hr-contact-reminder'));
 eq(await dialog.isVisible(),true,'contact stays open after confirmed save');await dialog.getByRole('button',{name:'Lukk kontaktopplysninger'}).click();eq(await toggle.getAttribute('aria-expanded'),'true','closing modal keeps expanded overview');
 await home.getByRole('button',{name:'Åpne gjennomføring',exact:true}).click();await page.getByRole('dialog').waitFor();eq(await page.getByRole('dialog').getByLabel('Navn',{exact:true}).inputValue(),'QA kontroll','actual execution dialog opens');await page.keyboard.press('Escape');await page.getByRole('dialog').waitFor({state:'hidden'});
 await toggle.click();await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await page.waitForFunction(()=>document.querySelector('.home-followups-title b')?.textContent==='12+');eq(await toggle.getAttribute('aria-expanded'),'false','focus preserves explicit collapse');
 await page.evaluate(()=>{window.fail=true;window.dispatchEvent(new Event('focus'));});await page.getByText('Varsler må oppdateres',{exact:true}).waitFor();eq(await toggle.isVisible(),true,'errors discoverable while collapsed');await toggle.click();eq(await home.getByRole('button',{name:'Prøv igjen'}).count(),2,'both KS retry actions kept');
 await page.evaluate(()=>{window.fail=false;window.empty=true;window.paged=false;window.dispatchEvent(new Event('focus'));});await home.waitFor({state:'hidden'});checks++;
 await page.evaluate(()=>{window.hr=false;window.ks=true;window.empty=false;window.render();window.dispatchEvent(new Event('focus'));});await home.waitFor();await page.waitForFunction(()=>document.querySelector('.home-followups-title b')?.textContent==='5');eq((await toggle.textContent()).includes('HR'),false,'KS-only profile');
 await page.evaluate(()=>{window.hr=true;window.ks=false;window.render();});await page.waitForFunction(()=>document.querySelector('.home-followups-title b')?.textContent==='7');eq((await toggle.textContent()).includes('Avvik'),false,'HR-only profile');
 await page.evaluate(()=>{window.denied=true;window.dispatchEvent(new Event('focus'));});await page.waitForFunction(()=>document.querySelectorAll('.hr-followup-notice li').length===0);eq((await toggle.textContent()).includes('HR 0'),true,'revocation hides tasks');
 await page.evaluate(()=>{window.denied=false;window.hr=true;window.ks=true;window.company='new-firm';window.actor='new-user';window.render();});await page.waitForFunction(()=>document.querySelector('.home-followups-title b')?.textContent==='12');checks++;
 await page.evaluate(()=>{window.hold=true;window.dispatchEvent(new Event('focus'));window.render('none');window.waiters.forEach(resolve=>resolve());});await home.waitFor({state:'detached'});eq(await page.getByRole('dialog').count(),0,'late replies after unmount cannot reopen');
 await page.evaluate(()=>{window.hold=false;window.render('legacy');});await page.locator('.ks-task-banner').first().waitFor();eq(await page.locator('.home-followups').count(),0,'standalone default renderer remains available');eq(await page.locator('.hr-followup-notice li:visible').count(),7,'legacy HR remains expanded');eq(await page.locator('.ks-task-banner').first().evaluate(node=>getComputedStyle(node).position),'sticky','legacy KS presentation retained');
 eq(errors,[],'no browser errors');
 if(process.env.HOME_QA_SCREENSHOTS){await page.evaluate(()=>window.render());await home.waitFor();await page.setViewportSize({width:390,height:900});await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:path.join(process.env.HOME_QA_SCREENSHOTS,'home-mobile.png')});await toggle.click();await page.setViewportSize({width:1280,height:900});await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:path.join(process.env.HOME_QA_SCREENSHOTS,'home-desktop.png')});}
 // A banner in the shared header was leaking into every working tab.
 for(const width of [1280,390]){
  await page.setViewportSize({width,height:900});await page.evaluate(()=>{window.shell={};window.render('shell');});await home.waitFor();
  eq(await page.locator('.home-followups').count(),1,'one overview on actual Startside gate '+width);
  eq(await page.locator('.ks-task-banner:visible').count(),0,'Startside remains initially collapsed '+width);
  const cases=await page.evaluate(()=>window.noticeCases);
  for(const scenario of cases){await page.evaluate(async value=>{window.shell=value;window.render('shell');await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));},scenario);eq(await page.locator('.home-followups,.ks-task-banner').count(),0,'no repeated notices on '+scenario.label+' at '+width);}
  await page.evaluate(()=>{window.shell={};window.render('shell');});await home.waitFor();await toggle.click();
  await home.getByRole('button',{name:'Åpne gjennomføring',exact:true}).waitFor();eq(await page.locator('.ks-task-banner:visible').count(),2,'both task types return in Startside details '+width);await toggle.click();
 }
 const emailCompany='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 await page.goto('http://127.0.0.1:'+server.address().port+'/?kshmsCompany='+emailCompany+'&kshmsDeviation=11111111-1111-4111-8111-111111111111');await page.evaluate(()=>window.render('shell'));
 await page.getByText('Sak fra e-post',{exact:true}).waitFor();eq(await toggle.getAttribute('aria-expanded'),'false','email arrival keeps compact overview');
 await page.evaluate(()=>{window.empty=true;window.hr=false;window.render();window.dispatchEvent(new Event('focus'));});await page.waitForFunction(()=>document.querySelector('.home-followups-title b')?.textContent==='0');eq(await toggle.isVisible(),true,'email link discoverable with no open tasks');
 await toggle.click();await page.getByRole('button',{name:'Åpne saken fra e-posten'}).click();eq(await page.evaluate(()=>window.opened.at(-1)),'11111111-1111-4111-8111-111111111111','email deviation action retained');
 await page.goto('http://127.0.0.1:'+server.address().port+'/?kshmsCompany='+emailCompany+'&kshmsExecution=22222222-2222-4222-8222-222222222222');await page.evaluate(()=>window.render('shell'));
 await page.getByText('Sak fra e-post',{exact:true}).waitFor();await toggle.click();await page.getByRole('button',{name:'Åpne gjennomføringen fra e-posten'}).click();await page.getByRole('dialog').waitFor();eq(await page.getByRole('dialog').getByLabel('Navn',{exact:true}).inputValue(),'QA kontroll','email execution action retained');
 await page.keyboard.press('Escape');eq(errors,[],'email entry has no browser errors');
 console.log(`Home followups: ${checks} assertions PASS; actual Chromium controllers with app CSS, synthetic transport, compact mobile/desktop, all actions/paging/contact save/dialogs, scope/errors/revocation/late replies, actual app-shell route gates, standalone defaults, no email.`);
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));fs.rmSync(temp,{recursive:true,force:true});}
