import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
import {missingContactFields,readContactReminder} from '../src/modules/hr/hrContactReminder.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
let checks=0;const eq=(a,b,label)=>{assert.deepEqual(a,b,label);checks++;};
const full={address:'Private gate 2',postal_code:'1234',city:'Private sted',relative_name:'Private navn',relative_phone:'12345678'};
eq(missingContactFields(full),[],'relationship and email are optional');
eq(missingContactFields({...full,postal_code:' ',relative_phone:''}),['postnummer','pårørendes telefon']);
eq(missingContactFields(null).length,5);
const sample={context:{company_id:'firm',user_id:'self'},registered:true,available:true,editable:true,employee:{id:'employee',revision:1},revision:1,data:full};
for(const patch of [{registered:false},{available:false},{editable:false}]){
 let calls=0;const r=await readContactReminder({rpc:async()=>{calls++;return {...sample,...patch};},companyId:'firm',userId:'self'});
 eq(r,{available:false,missing:[]});eq(calls,1,'unavailable profiles never load contact content twice');
}
for(const patch of [{context:{company_id:'other',user_id:'self'}},{context:{company_id:'firm',user_id:'other'}},{revision:2},{employee:{id:'other',revision:1}},{employee:{id:'employee',revision:2}},{editable:false}]){
 let calls=0;await assert.rejects(()=>readContactReminder({rpc:async()=>++calls===1?sample:{...sample,...patch},companyId:'firm',userId:'self'}));checks++;
}
const summary=await readContactReminder({rpc:async()=>sample,companyId:'firm',userId:'self'});
eq(summary,{available:true,missing:[]});eq(JSON.stringify(summary).includes('Private'),false,'reminder keeps no contact values');

const cwd=process.cwd(),temp=fs.mkdtempSync(path.join(os.tmpdir(),'contact-reminder-')),entry=path.join(temp,'entry.jsx');
fs.writeFileSync(entry,`import React from '${cwd}/node_modules/react/index.js';import {createRoot} from '${cwd}/node_modules/react-dom/client.js';import Notice from '${cwd}/src/modules/hr/HrFollowupNotice.jsx';import Page from '${cwd}/src/modules/personal/PersonalPage.jsx';const root=createRoot(document.getElementById('app'));window.render=(kind='notice')=>{const context=window.ctx();root.render(kind==='page'?React.createElement(Page,{context:context?{...context,personal_page:true,company_hr:true}:null,hrContext:context,userId:window.actor,authUser:{id:window.actor,user_metadata:{full_name:'Syntetisk'}},supabaseClient:window.client}):React.createElement(Notice,{context,userId:window.actor}));};window.render();`);
const result=await build({root:cwd,configFile:false,logLevel:'silent',plugins:[react(),{name:'contact-synthetic-transport',enforce:'pre',resolveId(id){if(id.endsWith('/appSupabaseClientRegistry.js'))return '\0client';},load(id){if(id==='\0client')return 'export const getAppSupabaseClient=()=>window.client;';}}],build:{write:false,minify:false,cssCodeSplit:false,rollupOptions:{input:entry,output:{inlineDynamicImports:true}}}});
const js=result.output.find(x=>x.type==='chunk').code,css=result.output.filter(x=>x.fileName.endsWith('.css')).map(x=>x.source).join('\n');
const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html; charset=utf-8');res.end(`<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font:15px Arial;margin:12px}input,button{box-sizing:border-box;max-width:100%;min-height:44px}button{padding:10px}${css}</style><div id="app"></div><script type="module">${js.replaceAll('</script','<\\/script')}</script>`);});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(7000);
 await page.addInitScript(()=>{
  window.actor='self';window.company='firm';window.enabled=true;window.denied=false;window.registered=true;window.available=true;window.editable=true;window.revision=0;window.fields={};window.calls=[];window.hold=false;window.waiters=[];window.saveFail=false;
  window.ctx=()=>window.enabled?{company_id:window.company,user_id:window.actor,available:true,enabled:true,company_name:'Syntetisk firma'}:null;
  window.profile=()=>({context:window.ctx(),registered:window.registered,available:window.available,editable:window.editable,employee:{id:'employee',revision:1},revision:window.revision,data:structuredClone(window.fields)});
  window.client={auth:{getUser:async()=>({data:{user:{id:window.actor,user_metadata:{full_name:'Syntetisk'}}}})},rpc:async(name,args)=>{
   window.calls.push({name,args:structuredClone(args)});
   if(name==='hr_contact_get'){
    if(window.denied)return {error:{code:'42501',message:'Tilgangen er endret'}};
    const data=window.profile();if(window.hold)return new Promise(resolve=>window.waiters.push(()=>resolve({data})));return {data};
   }
   if(name==='hr_contact_save'){
    if(window.saveFail)return {error:{message:'Syntetisk lagringsfeil'}};
    if(args.p_company_id!==window.company||args.p_contact_revision!==window.revision)return {error:{code:'40001',message:'Endret'}};
    window.fields=structuredClone(args.p_data);window.revision++;return {data:{context:window.ctx(),employee:{id:'employee',revision:1},revision:window.revision}};
   }
   if(name==='hr_followup_tasks'||name==='hr_conversation_feedback_notices')return {data:{context:window.ctx(),tasks:[],next:null}};
   if(name==='time_tasks_get')return {data:{context:window.ctx(),enabled:false,missing_week:null,returned_count:0,review_count:0,can_manage:false}};
   throw Error('Unexpected RPC '+name);
  }};
 });
 await page.goto('http://127.0.0.1:'+server.address().port+'/');
 const banner=page.getByRole('region',{name:'Påminnelse om kontaktopplysninger'}),dialog=page.getByRole('dialog');
 await banner.waitFor();checks++;
 eq(await banner.getByRole('heading').textContent(),'Fullfør kontaktopplysningene dine');
 eq(await page.evaluate(()=>window.calls.filter(c=>c.name==='hr_contact_get').length),2,'self is freshly authorized twice');
 for(const width of [320,390,1280]){
  await page.setViewportSize({width,height:900});
  eq(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'reminder fits '+width);
  const box=await banner.getByRole('button').boundingBox();eq(box.height>=44,true,'accessible touch target');
 }
 await banner.getByRole('button').click();await dialog.getByLabel('Adresse',{exact:true}).waitFor();
 eq(await dialog.locator('details').getAttribute('open'),'','click opens visible form');
 eq(await dialog.getByLabel('Adresse',{exact:true}).isEditable(),true);
 for(const width of [320,390,1280]){
  await page.setViewportSize({width,height:900});
  eq(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'contact dialog fits '+width);
  const box=await dialog.getByRole('button',{name:'Lagre adresse og pårørende'}).boundingBox();eq(box.width>0&&box.height>=44,true,'save remains usable at '+width);
  if(process.env.HR_CONTACT_SCREENSHOT_DIR&&width===390){fs.mkdirSync(process.env.HR_CONTACT_SCREENSHOT_DIR,{recursive:true});await page.screenshot({path:path.join(process.env.HR_CONTACT_SCREENSHOT_DIR,'contact-dialog-390.png')});}
 }
 await dialog.getByLabel('Adresse',{exact:true}).fill('Private gate 2');await dialog.getByLabel('Postnummer',{exact:true}).fill('1234');await dialog.getByLabel('Poststed',{exact:true}).fill('Private sted');
 await dialog.getByLabel('Pårørendes fulle navn',{exact:true}).fill('Private navn');await dialog.getByLabel('Pårørendes telefon',{exact:true}).fill('12345678');
 eq(await banner.count(),1,'unsaved form does not clear reminder');
 await page.evaluate(()=>{window.saveFail=true;});await dialog.getByRole('button',{name:'Lagre adresse og pårørende'}).click();await dialog.getByRole('alert').waitFor();
 eq(await banner.count(),1,'failed save never clears reminder');
 await dialog.getByRole('button',{name:'Lukk kontaktopplysninger'}).click();await banner.getByRole('button').click();await dialog.getByLabel('Adresse',{exact:true}).waitFor();
 eq(await dialog.getByLabel('Adresse',{exact:true}).inputValue(),'Private gate 2','failed save keeps draft on reopening');
 await page.evaluate(()=>{window.saveFail=false;});await dialog.getByRole('button',{name:'Lagre adresse og pårørende'}).click();await dialog.getByText('Kontaktprofilen er lagret.',{exact:true}).waitFor();
 await banner.waitFor({state:'detached'});checks++;
 eq(await dialog.count(),1,'verified save retains confirmation in open dialog');
 await dialog.getByRole('button',{name:'Lukk kontaktopplysninger'}).click();
 const focus=()=>page.evaluate(()=>window.dispatchEvent(new Event('focus')));
 await focus();eq(await banner.count(),0,'complete profile stays clear after focus');
 await page.evaluate(()=>{window.fields.relative_phone=' ';window.dispatchEvent(new Event('focus'));});await banner.waitFor();
 eq(await banner.locator('.hr-contact-missing').textContent(),'Mangler: pårørendes telefon.');
 eq((await banner.textContent()).includes('Private'),false,'banner never shows contact values');
 await page.evaluate(()=>window.render('page'));await page.locator('.personal-tabs').waitFor();const compact=page.locator('.home-followups-toggle');await compact.waitFor();
 eq(await compact.getAttribute('aria-expanded'),'false','Min side contact starts in collapsed summary');eq(await banner.isVisible(),false,'contact reminder does not push personal tabs down');await compact.click();await banner.waitFor();
 eq(await page.evaluate(()=>Boolean(document.querySelector('.personal-tabs').compareDocumentPosition(document.querySelector('.hr-contact-reminder'))&Node.DOCUMENT_POSITION_FOLLOWING)),true,'Min side tabs precede contact details');
 await banner.getByRole('button').click();await dialog.getByLabel('Pårørendes telefon',{exact:true}).waitFor();await page.keyboard.press('Escape');await dialog.waitFor({state:'detached'});
 eq(await banner.count(),1,'closing reminder editor does not dismiss incomplete status');
 for(const key of ['registered','available','editable']){
  await page.evaluate(key=>{window[key]=false;window.dispatchEvent(new Event('focus'));},key);await banner.waitFor({state:'detached'});checks++;
  await page.evaluate(key=>{window[key]=true;window.dispatchEvent(new Event('focus'));},key);await banner.waitFor();
 }
 await banner.getByRole('button').click();await dialog.getByLabel('Adresse',{exact:true}).waitFor();
 await page.evaluate(()=>{window.denied=true;window.dispatchEvent(new Event('focus'));});await dialog.waitFor({state:'detached'});await banner.waitFor({state:'detached'});checks++;
 await page.evaluate(()=>{window.denied=false;window.dispatchEvent(new Event('focus'));});await banner.waitFor();
 await page.evaluate(()=>{window.hold=true;window.dispatchEvent(new Event('focus'));});await banner.waitFor({state:'detached'});
 await page.waitForFunction(()=>window.waiters.length>0);
 await page.evaluate(()=>{window.enabled=false;window.render();window.waiters.splice(0).forEach(resolve=>resolve());window.hold=false;});
 await page.waitForTimeout(30);eq(await banner.count(),0,'late response cannot restore old access');
 await page.evaluate(()=>{window.actor='other';window.company='other-firm';window.fields={address:'New gate',postal_code:'4321',city:'New place',relative_name:'New name',relative_phone:'87654321'};window.enabled=true;window.render();});
 await page.waitForFunction(()=>window.calls.filter(c=>c.name==='hr_contact_get'&&c.args.p_company_id==='other-firm').length>=2);eq(await banner.count(),0,'new actor and company never inherit reminder');
 await page.evaluate(()=>{window.fields={};window.dispatchEvent(new Event('focus'));});await banner.waitFor();
 await page.evaluate(()=>{Object.defineProperty(document,'visibilityState',{value:'hidden',configurable:true});document.dispatchEvent(new Event('visibilitychange'));});await banner.waitFor({state:'detached'});checks++;
 await page.evaluate(()=>{Object.defineProperty(document,'visibilityState',{value:'visible',configurable:true});document.dispatchEvent(new Event('visibilitychange'));});await banner.waitFor();checks++;
 eq(await page.evaluate(()=>window.localStorage.length+window.sessionStorage.length),0,'no contact browser storage');
 eq(await page.evaluate(()=>window.calls.every(c=>['hr_contact_get','hr_contact_save','hr_followup_tasks','hr_conversation_feedback_notices','time_tasks_get'].includes(c.name))),true,'no mail, tasks or membership writes');
 eq(errors,[]);
 console.log('Contact reminder: '+checks+' assertions PASS: real Chromium notice/Min side/modal/save, 320/390/1280 widths, field completion, optional fields, readback, drafts, revocation, closed storage, late/actor/company/hidden state and no mail. Synthetic transport.');
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));fs.rmSync(temp,{recursive:true,force:true});}
