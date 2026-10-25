import '../../src/style.css';import '../../src/modules/bolig/bolig.css';
import {osloDay,utcFromOslo} from './bolig-attendance-time.mjs';
import React from 'react';import {createRoot} from 'react-dom/client';import Attendance from '../../src/modules/bolig/BoligAttendance.jsx';
const ctx={enabled:true,role:'manager',user_id:'user',company_id:'company'},root={id:'root',title:'QA Bemanning'};
let state=JSON.parse(localStorage.getItem('qa.attendance')||'null')||{context:ctx,root_id:root.id,enabled:false,revision:0,visits:[],events:[]},receipts={};window.denied=false;window.lost=false;window.writes=0;
window.bump=()=>{state.revision++;};
window.__client={rpc:async(n,a)=>{
 if(window.denied)return {error:{code:'42501',message:'Tilgang tilbakekalt'}};
 const p=a.p_payload;
 if(a.p_action!=='get'){
  if(!receipts[p.request_id]){
   if(p.revision!==state.revision)return {error:{code:'PT409',message:'Listen er endret'}};
   window.writes++;state.revision++;
   if(a.p_action==='enable')state.enabled=p.enabled;
   else{const before=state.visits.find(v=>v.id===p.id);const v={id:p.id,name:p.name,company:p.company,arrived_at:utcFromOslo(p.arrived),departed_at:p.departed?utcFromOslo(p.departed):null};state.visits=state.visits.filter(v=>v.id!==p.id).concat(v);state.events.unshift({id:p.request_id,actor:'user',created_at:new Date().toISOString(),payload:p,before_value:before,after_value:v});}
   receipts[p.request_id]=true;localStorage.setItem('qa.attendance',JSON.stringify(state));
  }
  if(window.lost){window.lost=false;return {error:{message:'Tapt svar'}};}
 }
 const day=p.day||new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Oslo'}).format(new Date());
 return {data:structuredClone({...state,day,visits:state.visits.filter(v=>osloDay(v.arrived_at)<=day&&(!v.departed_at||osloDay(v.departed_at)>=day)),receipt_id:a.p_action==='get'?null:p.request_id})};
}};
createRoot(document.getElementById('app')).render(<Attendance context={ctx} root={root}/>);
