import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
const {JSDOM}=await import(process.env.KSHMS_JSDOM_PATH||'jsdom');
const rootDir=process.cwd(),temp=fs.mkdtempSync(path.join(os.tmpdir(),'hr-react-')),entry=path.join(temp,'entry.jsx');
try{
 fs.writeFileSync(entry,`import React,{act,useState} from '${rootDir}/node_modules/react/index.js';import {createRoot} from '${rootDir}/node_modules/react-dom/client.js';import Hr from '${rootDir}/src/modules/hr/HrModule.jsx';import Nav from '${rootDir}/src/modules/kshms/KshmsNavigation.jsx';import {createHelpCenter} from '${rootDir}/src/modules/help/helpToolsCore.js';const Box=({children})=>React.createElement('div',null,children);const Help=createHelpCenter({Section:Box,Grid:Box,AppInstallGuide:()=>null,EXPO_PROFFDOK_TERMS_VERSION:'test',expoProffDokTermsSections:[]});const root=createRoot(document.getElementById('app'));function Navigation(){const [screen,setScreen]=useState('handbook');return React.createElement(Nav,{screen,canManage:true,pendingCount:3,onNavigate:setScreen});}globalThis.__act=act;globalThis.__render=(kind,p)=>root.render(React.createElement(kind==='nav'?Navigation:kind==='help'?Help:Hr,p));globalThis.__unmount=()=>root.render(null);`);
 const bundled=await build({root:rootDir,configFile:false,logLevel:'silent',define:{'process.env.NODE_ENV':'"development"'},build:{write:false,minify:false,lib:{entry,formats:['iife'],name:'HrProof',cssFileName:'hr-proof'}},plugins:[react(),{name:'app-client',enforce:'pre',resolveId(id){if(/cordelAccess\.js$/.test(id))return '\0cordel';if(/appSupabaseClientRegistry\.js$/.test(id))return '\0client';},load(id){if(id==='\0cordel')return 'export const useCordelAccess=()=>false;';if(id==='\0client')return 'export const getAppSupabaseClient=()=>globalThis.__client;';}}]});
 const dom=new JSDOM('<div id="app"></div>',{url:'https://example.invalid',runScripts:'outside-only',pretendToBeVisual:true});
 try{
  const {window}=dom;window.IS_REACT_ACT_ENVIRONMENT=true;window.HTMLElement.prototype.scrollIntoView=function(){};
  window.MessageChannel=class{constructor(){this.port1={onmessage:null};this.port2={postMessage:()=>setImmediate(()=>this.port1.onmessage?.())};}};
  const context={company_id:'firm',user_id:'admin',company_name:'Syntetisk firma',available:true,enabled:false,administer:true};
  const members=['admin','self','old','new','reader'].map(id=>({id,email:id+'@example.invalid'}));
  let settings=null,employees=[],revoked=false,lateGet=null,failAfterWrite=false,pendingClosure=false,purges=[];
  const commands=[],calls=[];
  window.__client={rpc:async(name,args)=>{
   calls.push({name,args:structuredClone(args)});assert.equal(args.p_company_id,'firm');
   if(revoked)return {data:null,error:{code:'42501',message:'HR-tilgang avslått'}};
   const result=()=>({context,content_enabled:false});
   if(name==='hr_purge_status')return {data:{...result(),receipts:structuredClone(purges),next:null}};
   if(name==='hr_foundation_state')return {data:{...result(),settings,members:args.p_after_user?members.slice(3):members.slice(0,3),next:args.p_after_user?null:'old'}};
   if(name==='hr_employee_list'){if(failAfterWrite){failAfterWrite=false;return {error:{message:'Nettfeil etter lagret handling'}};}return {data:{...result(),employees:structuredClone(employees),next:null}};}
   if(name==='hr_contact_get')return {data:{context,registered:true,available:false,employee:{id:args.p_employee_id,revision:1}}};
   if(name==='hr_employee_get'){
    if(lateGet)return await new Promise(resolve=>lateGet.resolve=resolve);
    return {data:{...result(),employee:structuredClone(employees.find(e=>e.id===args.p_employee_id))}};
   }
   if(name==='hr_foundation_configure'){settings={revision:(settings?.revision||0)+1,purpose:args.p_purpose,legal_basis:args.p_legal_basis,review_on:args.p_review_on,enabled:args.p_enabled};context.enabled=settings.enabled;return {data:{...result(),settings}};}
   assert.equal(name,'hr_employee_command');const p=args.p_payload;commands.push(structuredClone(args));
   if(args.p_action==='create'){const employee={id:'e',user_id:p.user_id,email:p.user_id+'@example.invalid',leader_id:p.leader_id,revision:1,readers:[]};employees.push(employee);return {data:{...result(),employee:structuredClone(employee)}};}
   const employee=employees.find(e=>e.id===p.id);assert.equal(p.revision,employee.revision);
   if(args.p_action==='leader'){if(p.clear_old_leader_reader)employee.readers=employee.readers.filter(g=>g.user_id!==employee.leader_id);employee.leader_id=p.leader_id;}
   if(args.p_action==='reader')employee.readers.push({user_id:p.reader_id,reason:p.reason,granted_by:'admin',granted_at:'2026-10-09T19:00:00Z'});
   if(args.p_action==='revoke_reader')employee.readers=employee.readers.filter(g=>g.user_id!==p.reader_id);
   if(args.p_action==='end'){employees=[];if(pendingClosure)purges=[{id:p.id,kind:'employment',state:'pending',requested_at:'2026-10-09T19:00:00Z',completed_at:null}];return {data:{...result(),deleted:!pendingClosure,purge_state:pendingClosure?'pending':'complete',receipt_id:p.id}};}
   employee.revision++;return {data:{...result(),employee:structuredClone(employee)}};
  }};
  window.eval((Array.isArray(bundled)?bundled[0]:bundled).output.find(item=>item.type==='chunk').code);
  const act=window.__act,buttons=()=>[...window.document.querySelectorAll('button')];
  const button=text=>{const found=buttons().find(b=>b.textContent.trim()===text);assert(found,'Missing '+text);return found;};
  const click=async text=>act(async()=>button(text).click());
  const field=label=>{const found=[...window.document.querySelectorAll('label')].find(l=>l.querySelector('span')?.textContent===label)?.querySelector('input,select,textarea');assert(found,'Missing field '+label);return found;};
  const write=async(label,value)=>{const input=field(label);await act(async()=>{const proto=input.tagName==='SELECT'?window.HTMLSelectElement.prototype:input.tagName==='TEXTAREA'?window.HTMLTextAreaElement.prototype:window.HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(input,value);input.dispatchEvent(new window.Event(input.tagName==='SELECT'?'change':'input',{bubbles:true}));});};
  const tick=async text=>act(async()=>{const label=[...window.document.querySelectorAll('label')].find(l=>l.textContent.includes(text));assert(label,text);label.querySelector('input[type=checkbox]').click();});
  const submit=async text=>act(async()=>button(text).closest('form').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true})));
  await act(async()=>window.__render('help',{isSystemAdmin:true,authUser:{id:'admin'},helpAccess:{userId:'admin',isSystemAdmin:true,isCompanyAdmin:true,moduleKeys:['projects','sales','store_offers']},kshmsContext:{user_id:'admin',enabled:true},hrContext:{user_id:'admin',available:true}}));
  const helpRoot=title=>buttons().find(b=>b.querySelector('b')?.textContent===title);
  assert.equal(buttons().filter(b=>b.querySelector('b')?.textContent==='KS/HMS').length,1);assert.equal(buttons().filter(b=>b.querySelector('b')?.textContent==='HR').length,1);
  assert(!buttons().some(b=>/^KS\/HMS –/.test(b.querySelector('b')?.textContent||'')));assert.equal(window.document.querySelectorAll('.help-topic-chapter').length,0);
  await act(async()=>helpRoot('KS/HMS').click());assert.equal(helpRoot('KS/HMS').getAttribute('aria-expanded'),'true');assert.equal(window.document.querySelectorAll('.help-topic-chapter').length,11);assert(![...window.document.querySelectorAll('.help-topic-chapter')].some(d=>d.open));
  const chapters=[...window.document.querySelectorAll('.help-topic-chapter')];assert.equal(chapters[0].querySelector('summary').textContent,'Bygg firmaets håndbok');
  await act(async()=>chapters[0].querySelector('summary').click());assert(chapters[0].open);assert(chapters[0].textContent.includes('Godkjenn og publiser'));
  const sourceChapter=chapters.find(chapter=>chapter.querySelector('summary').textContent==='Vurder nye tekstforslag');assert(sourceChapter);await act(async()=>sourceChapter.querySelector('summary').click());assert(sourceChapter.open);assert(sourceChapter.textContent.includes('Sammenlign tekstforslag'));
  await act(async()=>helpRoot('HR').click());assert.equal(helpRoot('KS/HMS').getAttribute('aria-expanded'),'false');assert.equal(window.document.querySelectorAll('.help-topic-chapter').length,1);assert(window.document.body.textContent.includes('Oppsett og kontrollfrist'));
  const hrChapter=window.document.querySelector('.help-topic-chapter');await act(async()=>hrChapter.querySelector('summary').click());assert(hrChapter.open);
  const recommended=[...hrChapter.querySelectorAll('h4')].find(h=>h.textContent==='Anbefalt bruk');assert(recommended);assert.equal(recommended.nextElementSibling.tagName,'UL');const recommendations=[...recommended.nextElementSibling.querySelectorAll('li')];assert(recommendations.length>0);assert(recommendations.every(item=>item.textContent.trim()));assert(recommendations.some(item=>item.textContent.includes('nærmeste leder')));
  const salesHelp=buttons().find(b=>b.querySelector('b')?.textContent.includes('Befaring / Våtromstilbud'));assert(salesHelp);await act(async()=>salesHelp.click());assert(window.document.body.textContent.includes('Publiserte og aksepterte tilbudsversjoner'));assert.equal(window.document.querySelectorAll('.help-topic-chapter').length,0);
  await act(async()=>window.__render('nav',{}));
  assert.deepEqual([...window.document.querySelectorAll('[role=group]')].map(g=>g.getAttribute('aria-label')),['Daglig arbeid','Mine rutiner','Forvaltning']);
  assert.equal(button('Håndbok').getAttribute('aria-pressed'),'true');await click('Avvik/RUH');assert.equal(button('Avvik/RUH').getAttribute('aria-pressed'),'true');assert.equal(button('Håndbok').getAttribute('aria-pressed'),'false');
  await act(async()=>window.__render('hr',{context}));assert(window.document.body.textContent.includes('registeret er avslått'));assert(!buttons().some(b=>b.textContent==='Legg til i registeret'));
  await write('Formål med registeret','Syntetisk lederregister');await write('Firmaets vurderte behandlingsgrunnlag','Syntetisk vurdering av grunnlag');await write('Neste kontroll av behov og tilgang','2026-11-09');await tick('Aktiver medarbeiderregisteret');await submit('Lagre HR-oppsett');
  assert(button('Legg til i registeret').disabled);await click('Hent flere appbrukere til valgene');await write('Medarbeider','self');await write('Nærmeste leder for ny medarbeider','old');await submit('Legg til i registeret');assert.equal(employees.length,1);assert.equal(commands.at(-1).p_action,'create');
  await click('Hent flere appbrukere til valgene');await write('Ekstra leser','old');await write('Begrunnelse for ekstra lesetilgang','Syntetisk særskilt begrunnelse');await submit('Gi lesetilgang');assert(window.document.querySelector('.hr-grants').textContent.includes('Syntetisk særskilt begrunnelse'));
  await click('Hent flere appbrukere til valgene');await write('Nærmeste leder','new');assert(button('Lagre nærmeste leder').disabled);await tick('Fjern også tidligere leders særskilte');await submit('Lagre nærmeste leder');assert.equal(employees[0].leader_id,'new');assert.equal(employees[0].readers.length,0);assert.equal(commands.at(-1).p_payload.clear_old_leader_reader,true);
  await click('Hent flere appbrukere til valgene');await write('Ekstra leser','reader');await write('Begrunnelse for ekstra lesetilgang','Syntetisk avtalt ekstra leser');await submit('Gi lesetilgang');await click('Trekk tilbake lesetilgang');assert.equal(employees[0].readers.length,0);
  await click('Hent flere appbrukere til valgene');await write('Nærmeste leder','old');employees[0].revision++;const before=commands.length;await submit('Lagre nærmeste leder');assert.equal(commands.length,before,'Stale detail issued write');assert(!window.document.querySelector('.hr-detail'));assert(window.document.querySelector('[role=alert]'));
  await click('Oppdater registeret');await act(async()=>window.document.querySelector('.hr-employee').click());assert(window.document.querySelector('.hr-detail'));lateGet={};await act(async()=>window.dispatchEvent(new window.Event('focus')));assert(!window.document.querySelector('.hr-detail'),'Foreground must remove old payload before fresh authorization');const resume=lateGet.resolve;assert(resume);lateGet=null;await act(async()=>resume({data:{context,employee:structuredClone(employees[0])}}));assert(window.document.querySelector('.hr-detail'),'Same selected record returns only after fresh scoped list and double read');
  await act(async()=>window.document.querySelector('.hr-employee').click());assert(button('Avslutt og slett HR-registeroppføring').disabled);await tick('Jeg bekrefter at arbeidsforholdet');failAfterWrite=true;await click('Avslutt og slett HR-registeroppføring');assert.equal(employees.length,0);assert(window.document.querySelector('[role=status]').textContent.includes('avsluttet'));assert(window.document.querySelector('[role=alert]').textContent.includes('Handlingen er lagret'));
  await click('Oppdater registeret');await write('Medarbeider','self');await submit('Legg til i registeret');await click('Lukk medarbeider');
  await act(async()=>window.document.querySelector('.hr-employee').click());await tick('Jeg bekrefter at arbeidsforholdet');pendingClosure=true;await click('Avslutt og slett HR-registeroppføring');assert(window.document.querySelector('[role=status]').textContent.includes('Filsletting pågår'));assert(!window.document.querySelector('[role=status]').textContent.endsWith('er slettet.'));
  assert(window.document.body.textContent.includes('Tilgang sperret · filsletting pågår'));purges[0].state='complete';await click('Oppdater registeret');assert([...window.document.querySelectorAll('details.hr-card strong')].some(n=>n.textContent==='Slettet'));
  pendingClosure=false;await write('Medarbeider','self');await submit('Legg til i registeret');await click('Lukk medarbeider');
  lateGet={};let opening;await act(async()=>{window.document.querySelector('.hr-employee').click();});assert(lateGet.resolve);const old=lateGet.resolve;lateGet=null;
  await act(async()=>window.__unmount());await act(async()=>old({data:{context,employee:employees[0]}}));assert(!window.document.querySelector('.hr-detail'),'Late personal data revived unmounted UI');
  const selfContext={...context,user_id:'self',administer:false};context.user_id='self';context.administer=false;
  await act(async()=>window.__render('hr',{context:selfContext}));assert(!window.document.body.textContent.includes('Ekstra lesetilgang'));assert(!buttons().some(b=>b.textContent==='Lagre HR-oppsett'));assert(window.document.body.textContent.includes('Mine oppfølginger'));
  revoked=true;await act(async()=>window.dispatchEvent(new window.Event('focus')));assert(!window.document.querySelector('.hr-employee'));assert(window.document.querySelector('[role=alert]'));
  assert.equal(window.localStorage.length,0);assert.equal(window.sessionStorage.length,0);
  await act(async()=>window.__unmount());
  console.log('Real HR/menu/Help React PASS: grouped Help roots and retained chapters, honest pending/complete purge states, setup, paging, create, leader/explicit old grant, reader/revoke, fresh revision, foreground payload clear/fresh selected-row recovery, closure confirmation, committed-response failure, late unmount and employee/revocation views. Synthetic transport, no live browser or files.');
 }finally{dom.window.close();}
}finally{fs.rmSync(temp,{recursive:true,force:true});}
