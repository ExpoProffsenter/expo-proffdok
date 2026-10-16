import React,{useEffect,useMemo,useRef,useState} from 'react';
import {kshmsRpc} from './kshmsAccess.js';
import {progressSession} from './kshmsProgressClient.mjs';
import KshmsProgressBoard from './KshmsProgressBoard.jsx';
import {KSHMS_PROGRESS_OPERATIONS,classifiedExportPlan} from './kshmsProgressCodes.mjs';
import {todayOslo,shortDate} from './kshmsProgressTimeline.mjs';
import {downloadProgressPdf,openProgressPreview} from './kshmsProgressPdf.mjs';
import {downloadProgressPlanIcs} from '../progress/progressPlanCalendarExport.js';
import {downloadStaffingCsv} from './kshmsProgressStaffing.mjs';
import {WORK_PROFILE_EVENT} from '../access/workProfileClient.js';
import {MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT} from '../access/moduleAccessClient.js';
// Navigation pointers only. Every mount/focus reauthorizes and rereads the data.
const selections=new Map();
export default function KshmsMyProgressPlans({context}){
 const scope=context.company_id+':'+context.user_id,session=useMemo(()=>progressSession({rpc:kshmsRpc,companyId:context.company_id,userId:context.user_id}),[scope]);
 const [data,setData]=useState(null),[record,setRecord]=useState(null),[selected,setSelected]=useState(()=>selections.get(scope)||null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[nonce,setNonce]=useState(0);
 const epoch=useRef(0),alive=useRef(false),selectedRef=useRef(selected),dateRef=useRef('');
 selectedRef.current=selected;
 const refresh=async()=>{
  const ticket=++epoch.current;setData(null);setRecord(null);setBusy(false);setError('');
  if(document.visibilityState==='hidden')return;
  try{const value=await session.mine();if(!alive.current||ticket!==epoch.current)return;dateRef.current=value.active_date;setData(value);
   if(selectedRef.current){try{const detail=await session.mine(selectedRef.current);if(alive.current&&ticket===epoch.current)setRecord(detail.record);}catch(e){if(alive.current&&ticket===epoch.current){setSelected(null);selections.delete(scope);setError(e.message);}}}
  }catch(e){if(alive.current&&ticket===epoch.current)setError(e.message);}
 };
 useEffect(()=>{
  alive.current=true;refresh();const events=[WORK_PROFILE_EVENT,MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT,'focus'];events.forEach(name=>window.addEventListener(name,refresh));document.addEventListener('visibilitychange',refresh);
  const timer=setInterval(()=>{if(dateRef.current&&dateRef.current!==todayOslo())refresh();},60000);
  return()=>{alive.current=false;++epoch.current;clearInterval(timer);events.forEach(name=>window.removeEventListener(name,refresh));document.removeEventListener('visibilitychange',refresh);};
 },[scope]);
 const open=async id=>{const ticket=++epoch.current;setBusy(true);setRecord(null);setError('');try{const value=await session.mine(id);if(alive.current&&ticket===epoch.current){setSelected(id);selections.set(scope,id);setRecord(value.record);setNonce(n=>n+1);}}catch(e){if(alive.current&&ticket===epoch.current)setError(e.message);}finally{if(alive.current&&ticket===epoch.current)setBusy(false);}};
 const exportOwn=async kind=>{
  const printing=kind==='pdf'||kind==='staffing-pdf',target=printing?window.open('','_blank'):null,ticket=epoch.current;
  if(printing&&!target)return 'Tillat utskriftsvinduet og prøv igjen.';
  try{const load=async()=>{const fresh=await session.mine(record.id);if(!alive.current||ticket!==epoch.current)throw Error('Arbeidsprofilen er endret.');const r=fresh.record;return {plan:r.plan,meta:{id:r.id,title:r.title+' – mine oppgaver',address:r.address,planReference:r.reference,companyName:context.company_name}};};
   if(kind.endsWith('-download')){await downloadProgressPdf({kind:kind==='staffing-download'?'staffing':'schedule',load,isCurrent:()=>alive.current&&ticket===epoch.current});return;}
   const fresh=await session.mine(record.id);if(!alive.current||ticket!==epoch.current)throw Error('Arbeidsprofilen er endret.');const r=fresh.record,meta={id:r.id,title:r.title+' – mine oppgaver',address:r.address,planReference:r.reference,companyName:context.company_name},plan=classifiedExportPlan(r.plan);
   if(printing)openProgressPreview({target,kind:kind==='pdf'?'schedule':'staffing',meta,plan:r.plan,onDownload:()=>exportOwn(kind==='pdf'?'pdf-download':'staffing-download')});
   else if(kind==='staffing-csv')downloadStaffingCsv(meta,r.plan);else downloadProgressPlanIcs({projectId:r.id,meta,plan});
  }catch(e){target?.close();return e.message;}
 };
 return <><article className="personal-card personal-progress-card" aria-label="Mine aktive fremdriftsplaner">
  <span className="personal-card-eyebrow">DITT PLANLAGTE ARBEID</span><h3>Mine aktive fremdriftsplaner</h3><p>Her ser du planer du er deltaker i. Planen vises fra første til siste planlagte dato på dine oppgaver som ikke er ferdige. Datoen følger norsk tid. Åpne planen for å se dine oppgaver.</p>
  {error&&<p role="alert">{error}</p>}{!data&&!error&&<p role="status">Henter aktive fremdriftsplaner …</p>}
  {data&&<><div className="ks-progress-list">{data.plans.map(p=><button type="button" className="secondary" disabled={busy} key={p.id} onClick={()=>open(p.id)}><strong>{p.title}</strong><span>{[p.reference,p.address].filter(Boolean).join(' · ')} · {shortDate(p.first_date)}–{shortDate(p.last_date)}</span></button>)}</div>{!data.plans.length&&<p>Du har ingen aktive fremdriftsplaner nå.</p>}{data.next&&<button type="button" className="secondary" disabled={busy} onClick={async()=>{const ticket=epoch.current;try{const next=await session.mine(null,data.next);if(alive.current&&ticket===epoch.current)setData(old=>({...next,plans:[...old.plans,...next.plans]}));}catch(e){if(alive.current&&ticket===epoch.current)setError(e.message);}}}>Hent flere aktive planer</button>}</>}
  <button type="button" className="secondary" disabled={busy} onClick={refresh}>Oppdater mine planer</button>
 </article>
  {record&&data&&<KshmsProgressBoard key={scope+':'+record.id+':'+nonce} plan={record.plan} meta={record} readOnly dirty={false} saving={false} loading={false} error="" notice="Viser bare dine oppgaver. Planen redigeres under KS/HMS." onPlanChange={()=>{}} onSave={async()=>false} operations={KSHMS_PROGRESS_OPERATIONS} people={[{id:context.user_id,name:'Deg'}]} stateKey={'personal:'+scope+':'+record.id} launchToken={nonce} onDismiss={()=>{setRecord(null);setSelected(null);selections.delete(scope);}} onExport={exportOwn}/>}
 </>;
}
