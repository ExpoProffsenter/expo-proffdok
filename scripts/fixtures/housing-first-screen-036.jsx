import React from 'react';
import {createRoot} from 'react-dom/client';
import {WORK_PROFILE_EVENT} from '../../src/modules/access/workProfileClient.js';
import Entry from '../../src/modules/bolig/BoligEntry.jsx';
import '../../src/style.css';
import '../../src/modules/app/mobileResponsive41A.css';
import '../../src/modules/ui/proffdokWorkspace.css';
import {APP_RUNTIME_STYLES} from '../../src/modules/app/appRuntimeStyles.js';
const runtime=document.createElement('style');runtime.textContent=APP_RUNTIME_STYLES;document.head.appendChild(runtime);
const context={user_id:'qa-user',company_id:'qa-company',company_name:'QA Firma',enabled:true,licensed:true,role:'manager'};
const root={id:'qa-root',title:'PILOT – Løpende overtakelse · 12 leiligheter',reference:'QA-FIRST-SCREEN',revision:1};
const blocks=[{id:'b-a',name:'Pilotbygg A',building_type:'apartment'},{id:'b-b',name:'Pilotbygg B',building_type:'apartment'}];
const entrances=blocks.map((b,i)=>({id:'e-'+i,block_id:b.id,address:'Pilotveien '+(101+i),floors:3,units_per_floor:2,counts:[2,2,2]}));
const units=entrances.flatMap(e=>Array.from({length:6},(_,i)=>({id:e.id+'-'+i,entrance_id:e.id,floor:Math.floor(i/2)+1,number:'H0'+(Math.floor(i/2)+1)+'0'+(i%2+1),contact_name:'QA Beboer',contact_email:'qa@example.invalid',contact_phone:'12345678'})));
const record={context,root,blocks,entrances,units,projects:[]};
window.qa={calls:[],role:'manager'};window.qa.sameProfile=()=>window.dispatchEvent(new CustomEvent(WORK_PROFILE_EVENT,{detail:{active_company_id:context.company_id}}));
window.qa.client={rpc:async(name,args={})=>{
 window.qa.calls.push({name,args});
 const ctx={...context,role:window.qa.role};
 const data={context:ctx,root_id:root.id,scope_id:args.p_scope_id??null,units:[],rows:[],items:[],packages:[],options:[],sheets:[],targets:[],groups:[],members:[],inbox:[],projects:[],revision:1};
 if(name==='bolig_workspace'){
  if(args.p_action==='context')return{data:ctx};
  if(args.p_action==='list')return{data:{context:ctx,roots:[{...root,unit_count:12}],projects:[]}};
  if(args.p_action==='get')return{data:{...record,context:ctx}};
  throw Error('No housing workspace writes in fixture: '+args.p_action);
 }
 if(name==='bolig_overview')return{data:{...data,units:units.map(u=>({unit_id:u.id,choice_revision:1,choice_outdated:false,completion:'not_started'}))}};
 if(name==='bolig_coordination')return{data:{...data,messaging_enabled:true,units:units.map((u,i)=>({...u,unread:i===2?1:0,unread_count:i===2?1:0})),inbox:[{unit_id:units[2].id,number:units[2].number,address:'Pilotveien 101',preview:'QA melding som krever oppfølging',enabled:true,body:'QA melding som krever oppfølging',latest_message:'QA melding som krever oppfølging',pending:1,unread:1,unread_count:1,latest_at:'2026-10-30T10:00:00Z'}]}};
 if(name==='bolig_completion')return{data:{...data,rows:units.map((u,i)=>({kind:'unit',scope_id:u.id,status:i%6<2?'handed_over':'not_started'}))}};
 if(name==='bolig_visuals')return{data:{...data,scope:args.p_scope_id,sheets:[]}};
 if(name==='bolig_catalog'&&args.p_action==='state')return{data};
 if(args.p_action&&!['get','list','context'].includes(args.p_action))throw Error('No write in fixture: '+name+'/'+args.p_action);
 return{data};
}};
createRoot(document.getElementById('app')).render(<div data-expo-app-shell="true"><header style={{height:83,background:'#fff',display:'flex',alignItems:'center',padding:24,fontSize:28,fontWeight:600}}>Expo ProffDok · QA Firma</header><nav style={{height:48,background:'#10212b',color:'#fff',padding:12}}>Startside · Befaring/Tilbud · Boligprosjekter</nav><main style={{padding:'20px 24px',margin:'0 auto',maxWidth:1800}}><div className="pd-workspace-tool-row"><span>Arbeidsrom › Boligprosjekter</span><button type="button">Verktøy og maler</button></div><Entry userId="qa-user"/></main></div>);
