import React,{useLayoutEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import Deviations from '../../src/modules/kshms/KshmsDeviations.jsx';
import Sja from '../../src/modules/kshms/KshmsSja.jsx';
import Executions from '../../src/modules/kshms/KshmsExecutions.jsx';
import {blankSja} from '../../src/modules/kshms/kshmsSja.mjs';
import {newExecution} from '../../src/modules/kshms/kshmsExecutions.mjs';
import '../../src/style.css';
import '../../src/modules/app/mobileResponsive41A.css';
import '../../src/modules/ui/proffdokWorkspace.css';
import '../../src/modules/kshms/kshms.css';
import '../../src/modules/kshms/kshmsWorkspace036.css';
import {APP_RUNTIME_STYLES} from '../../src/modules/app/appRuntimeStyles.js';
const runtime=document.createElement('style');runtime.textContent=APP_RUNTIME_STYLES;document.head.appendChild(runtime);
const company='91000000-0000-4000-8000-000000000001',user='92000000-0000-4000-8000-000000000001';
const context={company_id:company,user_id:user,enabled:true,manage:true,company_name:'QA Firma'};
const members=[{id:user,identity:{id:user,name:'QA Leder'}}];
window.qa={calls:[],unexpected:[],serial:0};
const record=status=>({id:'93000000-0000-4000-8000-000000000001',company_id:company,revision:1,status,category:'ruh',title:'QA lagret RUH',event:'QA hendelse',responsible_id:user,responsible_identity:members[0].identity,creator_identity:members[0].identity,created_at:'2026-10-30T10:00:00Z',due_on:'2026-11-02',project_id:null,source_kind:'company',cause:'QA årsak',immediate_action:'QA sikring',improvement_action:'QA tiltak',follow_up:'QA oppfølging',control_note:'QA kontroll',...(status==='closed'?{closed_at:'2026-10-30T11:00:00Z',closed_identity:members[0].identity}:{})});
const savedSja=()=>({...blankSja(),id:'95000000-0000-4000-8000-000000000001',company_id:company,revision:1,status:'signed',title:'QA signert SJA',signed_at:'2026-10-30T11:00:00Z',signed_identity:members[0].identity,leader_identity:members[0].identity});
const savedExecution=()=>({...newExecution(window.qa.kind,user),id:'96000000-0000-4000-8000-000000000001',company_id:company,revision:1,status:'completed',title:'QA fullført kontroll',completed_at:'2026-10-30T11:00:00Z',completed_identity:members[0].identity});
window.rpc=async(name,args)=>{
 window.qa.calls.push({name,args});
 if(name==='kshms_deviation_state')return {context,members,cases:[record(args.p_status==='closed'?'closed':'open')],counts:{open:1,closed:1},next:null};
 if(name==='kshms_deviation_detail'){const row=record(window.qa.closed?'closed':'open');return {case:row,events:[{id:'event',action:'create',created_at:row.created_at,actor_identity:members[0].identity,snapshot:row}],next:null};}
 if(name==='kshms_deviation_files')return [];
 if(name==='kshms_job_choices')return {context,projects:[],routines:[],project_total:0};
 if(name==='kshms_sja_detail'){if(window.qa.holdSja)await new Promise(resolve=>{window.qa.releaseSja=resolve;});return {context,sja:window.qa.saved?savedSja():null};}
 if(name==='kshms_sja_state')return {context,items:window.qa.saved?[savedSja()]:[],total:window.qa.saved?1:0,next:null,members};
 if(name==='kshms_execution_state')return {context,records:window.qa.saved?[savedExecution()]:[],templates:[],members,next:null};
 if(name==='kshms_execution_detail')return {context,record:savedExecution(),links:[]};
 window.qa.unexpected.push(name);throw Error('Unexpected transport: '+name);
};
function App(){const [view,setView]=useState({kind:'ruh',serial:0});window.qa.render=(kind,closed=false,saved=false)=>{window.qa.closed=closed;window.qa.kind=kind;window.qa.saved=saved;const serial=++window.qa.serial;setView({kind,serial});return serial;};useLayoutEffect(()=>{window.qa.committed=view.serial;},[view]);return <div data-expo-app-shell="true"><main><div className="ks-workspace-036 ks-module" key={view.serial}>{view.kind==='ruh'?<Deviations context={context}/>:view.kind==='sja'?<Sja context={context}/>:<Executions context={context} kind={view.kind}/>}</div></main></div>;}
createRoot(document.getElementById('app')).render(<App/>);
