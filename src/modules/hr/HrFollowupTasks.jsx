import React,{useEffect,useRef,useState} from 'react';
import {hrRpc} from './hrAccess.js';
import {MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT} from '../access/moduleAccessClient.js';
import {WORK_PROFILE_EVENT} from '../access/workProfileClient.js';
import {osloToday} from './hrPracticeConversation.mjs';
import './hrSickLeaveCases.css';
const titles={'hr-review':'Kontroll av HR-oppsett og tilgang',preparation:'Forbered medarbeidersamtalen',plan:'Oppfølgingsplan',meeting1:'Dialogmøte 1 – vurdering og oppfølging',activity:'Underlag til NAVs aktivitetsvurdering',meeting2:'Forberedelse til NAVs dialogmøte 2',next:'Neste oppfølging'};
export default function HrFollowupTasks({context,onOpen,onSetup,onSummaryChange}){
 const {company_id:companyId,user_id:userId}=context;
 const [value,setValue]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const epoch=useRef(0),busyRef=useRef(false),alive=useRef(false);
 useEffect(()=>{onSummaryChange?.({count:value?.tasks.length??null,more:Boolean(value?.next),error:Boolean(error)});},[value,error,onSummaryChange]);
 const check=v=>{if(v?.context?.company_id!==companyId||v.context.user_id!==userId||!Array.isArray(v.tasks)
  ||v.tasks.some(t=>!t.case_id||(!t.employee_id&&t.task_key!=='hr-review')||typeof t.task_key!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(t.due_on)))throw Error('Firma eller fristtilgang er endret. Oppdater listen.');return v;};
 useEffect(()=>{
  alive.current=true;
  const refresh=async()=>{
   const ticket=++epoch.current;setValue(null);setError('');setBusy(true);busyRef.current=true;
   try{if(document.visibilityState==='hidden')return;const v=check(await hrRpc('hr_followup_tasks',{p_company_id:companyId}));if(alive.current&&ticket===epoch.current)setValue(v);}
   catch(e){if(alive.current&&ticket===epoch.current)setError(e.code==='42501'?'Fristene er ikke tilgjengelige. Kontroller firma og HR-tilgang.':e.message);}
   finally{if(alive.current&&ticket===epoch.current){setBusy(false);busyRef.current=false;}}
  };
  refresh();const events=[WORK_PROFILE_EVENT,MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT,'focus','hr-sick-leave-changed'];
  const timer=window.setInterval(()=>{if(!busyRef.current&&document.visibilityState!=='hidden')refresh();},60000);
  events.forEach(e=>window.addEventListener(e,refresh));document.addEventListener('visibilitychange',refresh);
  return()=>{alive.current=false;epoch.current++;window.clearInterval(timer);events.forEach(e=>window.removeEventListener(e,refresh));document.removeEventListener('visibilitychange',refresh);};
 },[companyId,userId]);
 const more=async()=>{
  if(busyRef.current||!value?.next)return;const ticket=++epoch.current;busyRef.current=true;setBusy(true);setError('');
  try{const v=check(await hrRpc('hr_followup_tasks',{p_company_id:companyId,p_after:value.next}));if(alive.current&&ticket===epoch.current)setValue(previous=>({...v,tasks:[...previous.tasks,...v.tasks]}));}
  catch(e){if(alive.current&&ticket===epoch.current){setValue(null);setError(e.message);}}
  finally{if(alive.current&&ticket===epoch.current){busyRef.current=false;setBusy(false);}}
 };
 return <details className="hr-card hr-followup-tasks" open={Boolean(value?.tasks.length)}><summary>Dine frister og åpne tiltak{value?` (${value.tasks.length}${value.next?'+':''})`:''}</summary>
  <p>Her ser du oppfølging du selv har ansvar for i aktivt firma. Åpne medarbeideren, velg den lagrede medarbeidersamtalen eller sykefraværsoppfølgingen. Ferdige punkter og avsluttede saker tas ut av listen.</p>
  {busy&&<p role="status">Henter frister …</p>}{error&&<p role="alert">{error}</p>}
  {value&&<><p>{value.email_enabled?'Generelle e-postpåminnelser er aktivert.':'E-postpåminnelser er ikke aktivert i dette miljøet. Bruk listen i appen.'}</p>
   {!value.tasks.length&&<p>Ingen åpne frister eller tiltak er tildelt deg.</p>}
   <ul>{value.tasks.map(t=><li key={t.case_id+':'+t.task_key}><strong>{titles[t.task_key]||'Avtalt tiltak'}</strong><p>Frist: <time dateTime={t.due_on}>{t.due_on.split('-').reverse().join('.')}</time>{t.due_on<osloToday()?' · Fristen har passert':t.due_on===osloToday()?' · I dag':''}</p>{t.task_key==='hr-review'?(onSetup?<button type="button" className="secondary" disabled={busy} onClick={onSetup}>Åpne HR-oppsett</button>:<p>Åpne HR → Oppsett og kontrollfrist for å gjennomføre kontrollen.</p>):<button type="button" className="secondary" disabled={busy} onClick={()=>onOpen(t.employee_id)}>Åpne medarbeider</button>}</li>)}</ul>
   {value.next&&<button type="button" disabled={busy} onClick={more}>Hent flere frister</button>}
  </>}
 </details>;
}
