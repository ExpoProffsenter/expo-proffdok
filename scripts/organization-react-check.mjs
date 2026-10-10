import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
const {JSDOM}=await import(process.env.KSHMS_JSDOM_PATH||'jsdom');
const rootDir=process.cwd(),temp=fs.mkdtempSync(path.join(os.tmpdir(),'org-react-'));
try{
 const entry=path.join(temp,'entry.jsx');fs.writeFileSync(entry,`import React,{act} from '${rootDir}/node_modules/react/index.js';import {createRoot} from '${rootDir}/node_modules/react-dom/client.js';import Chart from '${rootDir}/src/modules/organization/OrganizationChart.jsx';import Ks from '${rootDir}/src/modules/kshms/KshmsModule.jsx';const root=createRoot(document.getElementById('app'));globalThis.__act=act;globalThis.__render=p=>root.render(React.createElement(p.kind==='ks'?Ks:Chart,p));globalThis.__unmount=()=>root.render(null);`);
 const bundled=await build({root:rootDir,configFile:false,logLevel:'silent',define:{'process.env.NODE_ENV':'"development"'},build:{write:false,minify:false,lib:{entry,formats:['iife'],name:'OrgProof',cssFileName:'org-proof'}},plugins:[react(),{name:'org-client',enforce:'pre',resolveId(id){if(/appSupabaseClientRegistry\.js$/.test(id))return '\0org-client';},load(id){if(id==='\0org-client')return 'export const getAppSupabaseClient=()=>globalThis.__client;';}}]});
 const dom=new JSDOM('<div id="app"></div>',{url:'https://example.invalid',runScripts:'outside-only',pretendToBeVisual:true});
 try{
  const {window}=dom;window.IS_REACT_ACT_ENVIRONMENT=true;window.HTMLElement.prototype.scrollIntoView=function(){};
  window.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
  window.MessageChannel=class{constructor(){this.port1={onmessage:null};this.port2={postMessage:()=>setImmediate(()=>this.port1.onmessage?.())};}};
  const context={company_id:'c',user_id:'admin',company_name:'Syntetisk firma',administer:true};
  const baseline={context,revision:1,units:[{id:'service',name:'Service',parent_id:null,manager_id:'head',manager_name:'Leder',color:'teal',editable:true},{id:'store',name:'Butikk',parent_id:null,color:'blue',editable:true},{id:'project',name:'Prosjekt',parent_id:'service',color:'amber',editable:true}],people:[{id:'employee',user_id:'employee',name:'Anne Bjørnstad',revision:2,hr_registered:true,unit_id:'service',title:'Rørleggerlærling',kind:'apprentice',leader_id:'head'},{id:'head',user_id:'head',name:'Leder',revision:0,hr_registered:false,unit_id:'service',title:'Avdelingsleder',kind:'leader',leader_id:null},{id:'new',user_id:'new',name:'Ny leder',revision:0,hr_registered:false,unit_id:null,title:'Medarbeider',kind:'employee',leader_id:null}],members:[{id:'head',name:'Leder',can_edit_chart:true,can_lead_hr:true},{id:'new',name:'Ny leder',can_edit_chart:true,can_lead_hr:true}]};
  let state=structuredClone(baseline),revoked=false,late=null;const commands=[];
  window.__client={rpc:async(name,args)=>{
   assert.equal(args.p_company_id,'c');
   if(name==='kshms_get_state')return {data:{context:{...state.context,enabled:true,manage:false,publish:false,responsible:false},settings:null,routines:[],versions:[],assignments:[],acknowledgments:[],reviews:[],members:[]}};
   if(name==='kshms_assignment_reminder_tasks')return {data:{company_id:'c',user_id:state.context.user_id,groups:[]}};
   if(revoked)return {error:{code:'42501',message:'KS-tilgang trukket tilbake'}};
   if(name==='organization_state'){if(late)return new Promise(resolve=>late.resolve=resolve);return {data:structuredClone(state)};}
   assert(['organization_command','organization_save_layout'].includes(name));commands.push(structuredClone(args));assert.equal(args.p_revision,state.revision);state.revision++;
   if(name==='organization_save_layout'){state.chart_name=args.p_payload.chart_name;state.units=args.p_payload.units.map(u=>({...u,editable:true}));for(const person of state.people)if(!state.units.some(u=>u.id===person.unit_id))person.unit_id=null;}
   if(args.p_action==='unit'){const p=args.p_payload;state.units.push({id:'created',...p,editable:true});}
   if(args.p_action==='place'){const p=args.p_payload;Object.assign(state.people.find(person=>person.id===p.employee_id),{unit_id:p.unit_id,title:p.title,kind:p.kind,leader_id:p.leader_id});}
   return {data:structuredClone(state)};
  }};
  window.eval((Array.isArray(bundled)?bundled[0]:bundled).output.find(v=>v.type==='chunk').code);const act=window.__act;
  const buttons=()=>[...window.document.querySelectorAll('button')];
  const button=text=>{const node=buttons().find(b=>b.textContent.trim()===text);assert(node,'Missing '+text);return node;};
  const click=async text=>act(async()=>button(text).click());
  const expandService=async()=>{const section=[...window.document.querySelectorAll('.org-branch')].find(s=>s.querySelector('h4')?.textContent==='Service');const toggle=section.querySelector('.org-expand');if(toggle.getAttribute('aria-expanded')==='false')await act(async()=>toggle.click());};
  const field=label=>{const node=[...window.document.querySelectorAll('.org-field')].find(l=>l.querySelector('span')?.textContent===label)?.querySelector('input,select');assert(node,label);return node;};
  const write=async(label,value)=>act(async()=>{const node=field(label);const proto=node.tagName==='SELECT'?window.HTMLSelectElement.prototype:window.HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(node,value);node.dispatchEvent(new window.Event(node.tagName==='SELECT'?'change':'input',{bubbles:true}));});
  const submit=async()=>act(async()=>window.document.querySelector('dialog form').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true})));
  await act(async()=>window.__render({context}));
  assert.equal(window.document.querySelectorAll('.org-stats>div').length,4);assert.equal(window.document.querySelectorAll('.org-branch').length,3);
  await expandService();
  assert(window.document.querySelector('.org-person-apprentice svg'));
  await click('Ny avdeling');await write('Avdelingsnavn','Teknisk prosjektavdeling');await write('Plasser under','service');await submit();
  assert.equal(commands.length,0,'Applying structure only stages it');assert(window.document.body.textContent.includes('Trykk Lagre kart'));assert.equal(window.document.querySelector('dialog'),null);
  assert(button('Last ned PDF').disabled);assert(window.document.body.textContent.includes('Ulagrede endringer'));
  const rootName=window.document.querySelector('[aria-label="Navn øverst i kartet"]');await act(async()=>{Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set.call(rootName,'Ringside');rootName.dispatchEvent(new window.Event('input',{bubbles:true}));});
  await act(async()=>window.dispatchEvent(new window.Event('focus')));assert.equal(window.document.querySelector('[aria-label="Navn øverst i kartet"]').value,'Ringside','Draft survives fresh focus');
  await act(async()=>window.__unmount());await act(async()=>window.__render({context}));assert.equal(window.document.querySelector('[aria-label="Navn øverst i kartet"]').value,'Ringside','Volatile scoped draft survives rights remount after fresh read');
  await click('Lagre kart');assert.equal(commands[0].p_payload.units.find(u=>u.name==='Teknisk prosjektavdeling').parent_id,'service');assert.equal(commands[0].p_payload.chart_name,'Ringside');assert(window.document.body.textContent.includes('Kartet er lagret.'));assert(!button('Last ned PDF').disabled);
  await expandService();
  await act(async()=>window.document.querySelector('.org-person-apprentice').click());await write('Nærmeste leder','new');
  assert(window.document.body.textContent.includes('Ny leder får HR-historikken'));
  assert(button('Lagre plassering').disabled);
  await act(async()=>window.document.querySelector('.org-access-change input').click());assert(!button('Lagre plassering').disabled);await submit();
  assert.equal(commands.at(-1).p_payload.confirm_leader_change,true);assert.equal(commands.at(-1).p_payload.leader_id,'new');
  await click('Rediger kart');const remove=buttons().find(b=>b.getAttribute('aria-label')==='Slett Service');await act(async()=>remove.click());
  assert(window.document.body.textContent.includes('Stillinger, nærmeste leder og HR beholdes'));await click('Slett fra kladden');assert.equal(state.units.length,4,'Deletion staged, server unchanged');await click('Lagre kart');assert.equal(state.units.length,1);assert.equal(state.people[0].unit_id,null);assert.equal(state.people[0].leader_id,'new');assert(commands.at(-1).p_payload.confirm_removal);assert.equal(commands.at(-1).p_payload.removed_ids.length,3);
  await click('Rediger kart');await click('Ny avdeling');await write('Avdelingsnavn','Kladd beholdes');await submit();state.revision++;
  await act(async()=>window.dispatchEvent(new window.Event('focus')));assert(window.document.body.textContent.includes('Kladd beholdes'));assert(button('Lagre kart').disabled,'Fresh conflict cannot overwrite');await click('Forkast endringer');assert(!window.document.body.textContent.includes('Kladd beholdes'));
  // Real focus handlers clear old payload and reject late re-appearance after revoke.
  revoked=true;await act(async()=>window.dispatchEvent(new window.Event('focus')));assert(!window.document.querySelector('.org-canvas'));assert(!window.document.body.textContent.includes('Anne Bjørnstad'));assert(window.document.body.textContent.includes('KS-tilgang trukket tilbake'));
  revoked=false;state=structuredClone(baseline);state.context={...context,user_id:'head',administer:false};state.units.forEach(unit=>unit.editable=unit.id!=='store');
  await act(async()=>window.__render({context:state.context}));await click('Rediger kart');await expandService();
  const edit=buttons().find(b=>b.getAttribute('aria-label')==='Rediger Service');await act(async()=>edit.click());assert(field('Avdelingsleder med redigeringstilgang').disabled);assert(field('Plasser under').disabled);await click('Lukk');
  const apprentice=window.document.querySelector('.org-person-apprentice');assert(apprentice);await act(async()=>apprentice.click());assert(field('Nærmeste leder').disabled);assert(![...field('Avdeling').options].some(o=>o.value==='store'));await click('Lukk');
  await act(async()=>window.__unmount());state=structuredClone(baseline);state.context={...context,user_id:'employee',administer:false};state.units.forEach(unit=>unit.editable=false);
  await act(async()=>window.__render({context:state.context}));assert(!buttons().some(b=>b.textContent==='Ny avdeling'));
  await expandService();await act(async()=>window.document.querySelector('.org-person-apprentice').click());assert(window.document.querySelector('dialog fieldset').disabled);assert(!buttons().some(b=>b.textContent==='Lagre plassering'));await click('Lukk');
  late={};await act(async()=>window.dispatchEvent(new window.Event('focus')));assert(!window.document.body.textContent.includes('Anne Bjørnstad'));await act(async()=>window.__unmount());await act(async()=>late.resolve({data:structuredClone(state)}));assert.equal(window.document.getElementById('app').textContent,'');
  state={...structuredClone(baseline),units:[],people:[]};late=null;await act(async()=>window.__render({context}));assert(window.document.body.textContent.includes('Bygg et kart som passer dere'));assert(button('Legg til første avdeling'));await act(async()=>window.__unmount());
  state=structuredClone(baseline);await act(async()=>window.__render({context,kind:'ks'}));await click('Organisasjonskart');assert(window.document.querySelector('.org-workspace'));
  await act(async()=>window.__unmount());await act(async()=>window.__render({context,kind:'ks'}));assert(window.document.querySelector('.org-workspace'),'Organization screen survives rights-remount only after fresh KS + organization reads');
  await click('Min personalhåndbok');await act(async()=>window.__unmount());await act(async()=>window.__render({context,kind:'ks'}));assert(!window.document.querySelector('.org-workspace'),'Deliberate navigation away clears new screen memory');await act(async()=>window.__unmount());
  console.log('Actual organization React PASS: departments/subdepartment, apprenticeship, create/readback, HR confirmation, branch scope/readonly, revoke/focus/late reply and honest empty onboarding. Synthetic transport.');
 }finally{dom.window.close();}
}finally{fs.rmSync(temp,{recursive:true,force:true});}
