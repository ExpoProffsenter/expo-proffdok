import React,{Suspense,useEffect,useRef,useState} from 'react';
import {Bell,CalendarDays,ArrowRight} from 'lucide-react';
import {hrRpc} from './hrAccess.js';
import {readFollowupNotice,readFollowupEmployee,followupTitle,followupStep} from './hrFollowupNotice.mjs';
import {osloToday} from './hrPracticeConversation.mjs';
import {MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT} from '../access/moduleAccessClient.js';
import {WORK_PROFILE_EVENT} from '../access/workProfileClient.js';
import DeviationDialog from '../deviations/DeviationDialog.jsx';
import './hrFollowupNotice.css';
const Conversations=React.lazy(()=>import('./HrConversations.jsx'));
const SickLeave=React.lazy(()=>import('./HrSickLeaveCases.jsx'));
const date=value=>value.split('-').reverse().join('.');

export default function HrFollowupNotice({context,userId,onSetup}){
 const companyId=Boolean(userId)&&context?.user_id===userId&&context?.available&&context?.enabled?context.company_id:null;
 const scope=companyId&&userId?companyId+':'+userId:null;
 const [value,setValue]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[employee,setEmployee]=useState(null),[selected,setSelected]=useState(null),[retry,setRetry]=useState(0);
 const epoch=useRef(0),alive=useRef(false),busyRef=useRef(false),selection=useRef(null),lastScope=useRef(null);
 const resetSelection=()=>{selection.current=null;setSelected(null);setEmployee(null);};
 useEffect(()=>{
  alive.current=true;++epoch.current;setValue(null);setEmployee(null);setError('');
  if(scope&&lastScope.current&&lastScope.current!==scope)resetSelection();
  if(scope)lastScope.current=scope;
  if(!scope){setBusy(false);busyRef.current=false;return()=>{alive.current=false;++epoch.current;};}
  const refresh=async(clear=true)=>{
   const ticket=++epoch.current;busyRef.current=true;setBusy(true);setValue(null);setError('');if(clear)setEmployee(null);
   try{
    if(document.visibilityState==='hidden')return;
    const next=await readFollowupNotice({rpc:hrRpc,companyId,userId});
    const target=selection.current?.scope===scope?selection.current:null;
    const fresh=target?await readFollowupEmployee({rpc:hrRpc,companyId,userId,task:target.task}):null;
    if(alive.current&&ticket===epoch.current){setValue({...next,scope});setEmployee(fresh);}
   }catch(e){if(alive.current&&ticket===epoch.current){setValue(null);resetSelection();setError(e.code==='42501'?'Oppfølgingene er ikke tilgjengelige. Kontroller arbeidsprofil og HR-tilgang.':e.message);}}
   finally{if(alive.current&&ticket===epoch.current){busyRef.current=false;setBusy(false);}}
  };
  refresh();const events=[WORK_PROFILE_EVENT,MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT,'focus'];
  const invalidate=()=>refresh(true),changed=()=>refresh(false);
  events.forEach(name=>window.addEventListener(name,invalidate));document.addEventListener('visibilitychange',invalidate);window.addEventListener('hr-sick-leave-changed',changed);
  const timer=window.setInterval(()=>{if(!busyRef.current&&document.visibilityState!=='hidden')refresh(false);},60000);
  return()=>{alive.current=false;++epoch.current;window.clearInterval(timer);events.forEach(name=>window.removeEventListener(name,invalidate));document.removeEventListener('visibilitychange',invalidate);window.removeEventListener('hr-sick-leave-changed',changed);};
 },[scope,retry]);
 const open=async task=>{
  if(busyRef.current||!scope)return;const ticket=++epoch.current;busyRef.current=true;setBusy(true);setError('');
  try{
   const fresh=await readFollowupNotice({rpc:hrRpc,companyId,userId,after:task.page_after});
   const current=fresh.tasks.find(t=>t.case_id===task.case_id&&t.task_key===task.task_key&&t.kind===task.kind&&t.employee_id===task.employee_id&&t.due_on===task.due_on);
   if(!current)throw Error('Oppgaven er endret eller ferdig. Hent oppfølgingene på nytt.');
   const record=await readFollowupEmployee({rpc:hrRpc,companyId,userId,task:current});
   if(alive.current&&ticket===epoch.current){const target={scope,task:current,entryKey:crypto.randomUUID()};selection.current=target;setSelected(target);setEmployee(record);setValue({...fresh,scope});}
  }catch(e){if(alive.current&&ticket===epoch.current){setValue(null);resetSelection();setError(e.message);}}
  finally{if(alive.current&&ticket===epoch.current){busyRef.current=false;setBusy(false);}}
 };
 const more=async()=>{
  if(busyRef.current||!value?.next)return;const ticket=++epoch.current;busyRef.current=true;setBusy(true);setError('');
  try{const next=await readFollowupNotice({rpc:hrRpc,companyId,userId,after:value.next});if(alive.current&&ticket===epoch.current)setValue(previous=>previous?.scope===scope?{...next,scope,tasks:[...previous.tasks,...next.tasks.filter(t=>!previous.tasks.some(p=>p.case_id===t.case_id&&p.task_key===t.task_key))]}:null);}
  catch(e){if(alive.current&&ticket===epoch.current){setValue(null);setError(e.message);}}
  finally{if(alive.current&&ticket===epoch.current){busyRef.current=false;setBusy(false);}}
 };
 if(!scope)return null;
 const tasks=value?.scope===scope?value.tasks:[],target=selected?.scope===scope?selected.task:null;
 return <>
  {(tasks.length>0||error)&&<section className="hr-followup-notice" aria-label="Dine varsler og oppfølginger" aria-busy={busy}>
   <div className="hr-followup-notice-heading"><Bell aria-hidden="true"/><div><h2>Dine varsler og oppfølginger <span>{tasks.length}{value?.next?'+':''}</span></h2><p>Dette venter på deg i {context.company_name||'aktivt firma'}.</p></div></div>
   {error&&<><p role="alert">{error}</p><button type="button" className="secondary" disabled={busy} onClick={()=>setRetry(n=>n+1)}>Oppdater varsler</button></>}
   <ul>{tasks.map(t=><li key={t.case_id+':'+t.task_key}>
    <div><h3>{followupTitle(t)}</h3>
     {t.meeting?<><p><CalendarDays size={17} aria-hidden="true"/> {date(t.meeting.on)} · {t.meeting.time?'kl. '+t.meeting.time:'Klokkeslett ikke avtalt'}</p><p>Sted: {t.meeting.location||'Ikke avtalt'}</p><strong className="hr-followup-status">{t.meeting.shared?'Forberedelsen er delt med leder':'Forberedelsen er ikke levert'}</strong></>:<p>Frist: {date(t.due_on)}{t.due_on<osloToday()?' · Fristen har passert':t.due_on===osloToday()?' · I dag':''}</p>}
    </div>
    {t.kind==='review'?(onSetup?<button type="button" disabled={busy} onClick={onSetup}>Åpne HR-oppsett <ArrowRight size={17} aria-hidden="true"/></button>:<p>Åpne HR → Oppsett og kontrollfrist.</p>):<button type="button" disabled={busy} onClick={()=>open(t)}>{t.kind==='conversation'?'Åpne samtalen':'Åpne oppfølgingen'} <ArrowRight size={17} aria-hidden="true"/></button>}
   </li>)}</ul>
   {value?.next&&<button type="button" className="secondary" disabled={busy} onClick={more}>Hent flere oppfølginger</button>}
  </section>}
  {target&&employee&&<DeviationDialog title={target.kind==='conversation'?'Medarbeidersamtale':'Sykefraværsoppfølging'} context={context.company_name||'HR'} onClose={resetSelection} closeLabel="Lukk oppfølgingen"><div className="hr-module hr-direct-followup"><Suspense fallback={<p role="status">Henter oppfølgingen …</p>}>
   {target.kind==='conversation'?<Conversations key={scope+':'+employee.id+':'+employee.revision} context={context} employee={employee} initialCaseId={target.case_id} initialEntryKey={selected.entryKey} initialStep={followupStep(target)}/>:<SickLeave key={scope+':'+employee.id+':'+employee.revision} context={context} employee={employee} initialCaseId={target.case_id} initialEntryKey={selected.entryKey} initialStep={followupStep(target)}/>}</Suspense></div></DeviationDialog>}
 </>;
}
