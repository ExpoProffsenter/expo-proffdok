import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import Sheet from '../../src/modules/time/TimeSheet.jsx';
import Management from '../../src/modules/time/TimeManagement.jsx';
import {defaultCategories,EXPORT_COLUMNS} from '../../src/modules/time/timeCore.mjs';
import '../../src/style.css';
import '../../src/modules/ui/proffdokWorkspace.css';
import {APP_RUNTIME_STYLES} from '../../src/modules/app/appRuntimeStyles.js';
const runtime=document.createElement('style');runtime.textContent=APP_RUNTIME_STYLES;document.head.appendChild(runtime);
window.qa={calls:[],writes:[],denied:false};
const context={company_id:'81000000-0000-4000-8000-000000000001',user_id:'81000000-0000-4000-8000-000000000004',available:true,enabled:true,time_admin:true,company_name:'QA Firma'};
const categories=defaultCategories();
const settings={enabled:true,mobile_shortcut:false,categories,employee_numbers:{},project_numbers:{},managers:[],deadline_day:0,deadline_time:'12:00',export:{separator:';',decimal:',',date_format:'yyyy-mm-dd',columns:EXPORT_COLUMNS.map(([key,label])=>({key,label}))}};
window.timeApi=async(name,args={})=>{
 window.qa.calls.push(name);if(window.qa.denied)throw Error('QA tilgang tilbakekalt');
 const data={context,employee:{id:'81000000-0000-4000-8000-000000000010',user_id:context.user_id,label:'QA Medarbeider'},settings,settings_revision:1,sheet:{id:'81000000-0000-4000-8000-000000000014',week_on:args.p_week,revision:1,state:'draft',entries:[],files:[]}};
 if(name==='time_sheet_get')return data;
 if(name==='time_timer_get')return {context,timer:null};
 if(name==='time_projects')return {context,projects:[{id:'81000000-0000-4000-8000-000000000013',label:'QA Prosjekt',number:'001'}],next:null};
 if(name==='time_history')return {context,history:[{revision:1,action:'save',saved_at:'2026-10-30T10:00:00Z',snapshot:{...data.sheet,employee_label:'QA Medarbeider'}}],next:null};
 if(name==='time_tasks_get')return {context,enabled:true,can_manage:true,review_count:0,missing_week:null};
 if(name==='time_review_list')return {context,sheets:[],next:null};
 if(name==='time_setup_get')return {context,revision:1,content:settings,members:[{user_id:context.user_id,label:'QA Medarbeider',active:true}]};
 if(name==='time_export_list')return {context,exports:[],next:null};
 window.qa.writes.push(name);throw Error('Unexpected write in read-only layout test: '+name);
};
function App(){const [mode,setMode]=useState('own');return <div data-expo-app-shell="true"><nav aria-label="QA flate"><button onClick={()=>setMode('own')}>QA egne timer</button><button onClick={()=>setMode('admin')}>QA administrasjon</button></nav><main><div hidden={mode!=='own'}><Sheet context={context}/></div><div hidden={mode!=='admin'}><Management context={context}/></div></main></div>;}
createRoot(document.getElementById('app')).render(<App/>);
