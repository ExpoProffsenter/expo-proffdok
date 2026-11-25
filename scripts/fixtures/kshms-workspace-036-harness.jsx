import React,{useLayoutEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import Module from '../../src/modules/kshms/KshmsModule.jsx';
import {ROUTINE_CATALOG} from '../../src/modules/kshms/kshmsCatalog.mjs';
import {newExecution} from '../../src/modules/kshms/kshmsExecutions.mjs';
import '../../src/style.css';
import '../../src/modules/app/mobileResponsive41A.css';
import '../../src/modules/ui/proffdokWorkspace.css';

import {APP_RUNTIME_STYLES} from '../../src/modules/app/appRuntimeStyles.js';
const runtime=document.createElement('style');runtime.textContent=APP_RUNTIME_STYLES;document.head.appendChild(runtime);

const company='91000000-0000-4000-8000-000000000001',other='91000000-0000-4000-8000-000000000002';
const makeUser=serial=>'92000000-0000-4000-8000-'+String(serial).padStart(12,'0');
window.qa={calls:[],contexts:new Map(),serial:0,pending:[],holdCompany:null,empty:false};
function state(context){
 const draft={...ROUTINE_CATALOG[0],title:'QA Firmaets lagrede rutine'};
 const version={id:'93000000-0000-4000-8000-000000000001',routine_id:'routine',number:1,content:draft,content_hash:'qa-version-hash',published_by:context.user_id,published_at:'2026-10-28T10:00:00Z',requires_ack:true};
 return {context,settings:{revision:1,trades:['vvs'],responsible_user_id:context.user_id,activities:'Firmaets lagrede arbeid',responsibilities:'Firmaets lagrede ansvar',risks:'Firmaets lagrede risiko',next_review_on:'2026-11-01'},routines:window.qa.empty?[]:[{id:'routine',company_id:context.company_id,revision:1,reference_number:1,archived:false,draft}],versions:window.qa.empty?[]:[version],assignments:window.qa.empty?[]:[{user_id:context.user_id,version_id:version.id}],acknowledgments:[],members:[{id:context.user_id,email:'qa@example.invalid',enabled:true,role:context.manage?'responsible':'reader',workspace_role:context.manage?'firmaadmin':'employee'}],reviews:[],audit:[]};
}
window.rpc=async(name,args)=>{
 window.qa.calls.push({name,args});
 const context=window.qa.contexts.get(args.p_company_id)||window.qa.current;
 if(/command|publish|assign$/.test(name))throw Error('No commands or real transport in this fixture');
 if(name==='kshms_get_state'){
  const value=state(context);
  if(window.qa.holdCompany===args.p_company_id)return new Promise(resolve=>window.qa.pending.push(()=>resolve(value)));
  return value;
 }
 if(name==='kshms_execution_tasks')return {company_id:context.company_id,user_id:context.user_id,count:window.qa.empty?0:1,overdue:0,items:window.qa.empty?[]:[{id:'94000000-0000-4000-8000-000000000001',kind:'round',title:'QA Kontroll av arbeidssted',due_on:'2026-11-02',accessible:true}]};
 if(name==='kshms_assignment_reminder_tasks')return {company_id:context.company_id,user_id:context.user_id,as_of:'2026-10-29',groups:window.qa.empty?[]:[{kind:'sja',count:1}]};
 if(name==='kshms_review_task')return {company_id:context.company_id,user_id:context.user_id,as_of:'2026-10-29',task:window.qa.empty?null:{due_on:'2026-11-01',deadline_status:'soon'}};
 if(name==='kshms_sja_state')return {context,items:[],total:0,next:null,members:[{id:context.user_id,identity:{id:context.user_id,name:'QA Bruker'}}]};
 if(name==='kshms_sja_detail')return {context,sja:null};
 if(name==='kshms_job_choices')return {context,projects:[],routines:[],project_total:0};
 if(name==='kshms_execution_state')return {context,records:[],templates:[],members:[{id:context.user_id,identity:{id:context.user_id,name:'QA Bruker'}}],next:null};
 if(name==='kshms_execution_detail'){
  const record={...newExecution('round',context.user_id),id:args.p_id,company_id:context.company_id,revision:1,status:'draft'};
  record.content.title='QA Kontroll av arbeidssted';record.title=record.content.title;
  return {context,record,links:[]};
 }
 throw Error('Unexpected read in KS workspace fixture: '+name);
};
function App(){
 const [config,setConfig]=useState({role:'manager',companyId:company,serial:++window.qa.serial});
 const userId=makeUser(config.serial);
 const context={company_id:config.companyId,user_id:userId,company_name:config.companyId===company?'QA Firma A':'QA Firma B',enabled:true,available:true,manage:config.role==='manager',publish:config.role==='manager',administer:config.role==='manager',responsible:config.role==='manager'};
 window.qa.current=context;window.qa.contexts.set(context.company_id,context);
 window.qa.render=(role='manager',empty=false,companyId=company)=>{window.qa.empty=empty;const serial=++window.qa.serial;setConfig({role,companyId,serial});return serial;};
 window.qa.remount=()=>setConfig(previous=>({...previous,mount:(previous.mount||0)+1}));
 window.qa.release=()=>{window.qa.holdCompany=null;window.qa.pending.splice(0).forEach(resolve=>resolve());};
 useLayoutEffect(()=>{window.qa.committed=config;},[config]);
 return <div data-expo-app-shell="true"><main><Module key={config.serial+':'+(config.mount||0)} context={context} personalOnly={config.role==='personal'}/></main></div>;
}
createRoot(document.getElementById('app')).render(<App/>);
