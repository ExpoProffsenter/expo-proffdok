import React,{useEffect,useMemo,useRef,useState} from 'react';
import {kshmsRpc} from './kshmsAccess.js';
import {progressSession} from './kshmsProgressClient.mjs';
import KshmsProgressBoard from './KshmsProgressBoard.jsx';
import {KSHMS_PROGRESS_OPERATIONS,classifiedExportPlan} from './kshmsProgressCodes.mjs';
import {todayOslo,shortDate} from './kshmsProgressTimeline.mjs';
import {downloadProgressPdf,openProgressPreview,progressBrandMeta} from './kshmsProgressPdf.mjs';
import {downloadProgressPlanIcs} from '../progress/progressPlanCalendarExport.js';
import {downloadStaffingCsv} from './kshmsProgressStaffing.mjs';
import {WORK_PROFILE_EVENT} from '../access/workProfileClient.js';
import {MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT} from '../access/moduleAccessClient.js';
// Navigation pointers only. Every mount/focus reauthorizes and rereads the data.
const selections=new Map();
export default function KshmsMyProgressPlans({context,source='kshms',grouped=false}){
 const scope=source+':'+context.company_id+':'+context.user_id,session=useMemo(()=>progressSession({rpc:source==='project'?async(name,args)=>{const v=await kshmsRpc('project_progress_mine',args);if(!args.p_id&&!Array.isArray(v?.plans))throw Error('Prosjektplanene kunne ikke bekreftes.');return v;}:kshmsRpc,companyId:context.company_id,userId:context.user_id}),[scope]);
 const [data,setData]=useState(null),[record,setRecord]=useState(null),[selected,setSelected]=useState(()=>selections.get(scope)||null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[nonce,setNonce]=useState(0);
 const epoch=useRef(0),alive=useRef(false),selectedRef=useRef(selected),dateRef=useRef('');
 selectedRef.current=selected;
 const refresh=async event=>{
  const ticket=++epoch.current,visibleCheck=['focus','visibilitychange'].includes(event?.type)&&document.visibilityState!=='hidden';
  if(!visibleCheck){setData(null);setRecord(null);}setError('');
  if(document.visibilityState==='hidden'){setBusy(false);return;}
  setBusy(true);
  try{const value=await session.mine();if(!alive.current||ticket!==epoch.current)return;dateRef.current=value.active_date;setData(value);
   const id=selectedRef.current;
   if(id&&!value.next&&!value.plans.some(p=>p.id===id)){setRecord(null);selectedRef.current=null;setSelected(null);selections.delete(scope);return;}
   if(id){const detail=await session.mine(id);if(alive.current&&ticket===epoch.current&&selectedRef.current===id)setRecord(detail.record);}
  }catch(e){if(alive.current&&ticket===epoch.current){setData(null);setRecord(null);selectedRef.current=null;setSelected(null);selections.delete(scope);setError(e.message);}}
  finally{if(alive.current&&ticket===epoch.current)setBusy(false);}
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
  try{const load=async()=>{const fresh=await session.mine(record.id);if(!alive.current||ticket!==epoch.current)throw Error('Arbeidsprofilen er endret.');const r=fresh.record;return {plan:r.plan,meta:await progressBrandMeta({rpc:kshmsRpc,companyId:context.company_id,meta:{id:r.id,title:r.title+' – mine oppgaver',address:r.address,planReference:r.reference,companyName:context.company_name}})};};
   if(kind.endsWith('-download')){await downloadProgressPdf({kind:kind==='staffing-download'?'staffing':'schedule',load,isCurrent:()=>alive.current&&ticket===epoch.current});return;}
   const fresh=await session.mine(record.id);if(!alive.current||ticket!==epoch.current)throw Error('Arbeidsprofilen er endret.');const r=fresh.record,meta=await progressBrandMeta({rpc:kshmsRpc,companyId:context.company_id,meta:{id:r.id,title:r.title+' – mine oppgaver',address:r.address,planReference:r.reference,companyName:context.company_name}}),plan=classifiedExportPlan(r.plan);
   if(!alive.current||ticket!==epoch.current)throw Error('Arbeidsprofilen er endret.');
   if(printing)openProgressPreview({target,kind:kind==='pdf'?'schedule':'staffing',meta,plan:r.plan,onDownload:()=>exportOwn(kind==='pdf'?'pdf-download':'staffing-download')});
   else if(kind==='staffing-csv')downloadStaffingCsv(meta,r.plan);else downloadProgressPlanIcs({projectId:r.id,meta,plan});
  }catch(e){target?.close();return e.message;}
 };
 if(!grouped&&source==='project'&&(!data||!data.plans.length)&&!record)return error?<p role="status">Prosjektplaner kunne ikke hentes. <button type="button" onClick={refresh}>Prøv igjen</button></p>:null;
 const Container=grouped?'section':'article',Heading=grouped?'h4':'h3';
 const heading=grouped?(source==='project'?'Fra ProffDok-prosjekter':'Andre fremdriftsplaner'):(source==='project'?'Mine aktive prosjektplaner':'Mine aktive fremdriftsplaner');
 const close=()=>{++epoch.current;selectedRef.current=null;setRecord(null);setSelected(null);setBusy(false);selections.delete(scope);};
 return <><Container className={(grouped?'personal-plan-source':'personal-card')+' personal-progress-card'} aria-label={heading} aria-busy={busy}>
  {!grouped&&<span className="personal-card-eyebrow">DITT PLANLAGTE ARBEID</span>}{grouped?<div className="personal-plan-source-heading"><Heading>{heading}</Heading><button type="button" className="secondary personal-plan-refresh" aria-label={source==='project'?'Oppdater prosjektplaner':'Oppdater andre planer'} disabled={busy} onClick={refresh}>Oppdater</button></div>:<Heading>{heading}</Heading>}
  <p>{grouped?(source==='project'?'Planer fra prosjekter i ProffDok.':'Selvstendige planer fra KS/HMS.'):'Her ser du planer du er deltaker i. Planen vises fra første til siste planlagte dato på dine oppgaver som ikke er ferdige. Datoen følger norsk tid. Åpne planen for å se dine oppgaver.'}</p>
  {error&&<p role="alert">{error}</p>}{!data&&!error&&<p role="status">Henter aktive fremdriftsplaner …</p>}
  {data&&<><div className="ks-progress-list">{data.plans.map(p=><button type="button" className="secondary" disabled={busy} key={p.id} onClick={()=>open(p.id)}><strong>{p.title}</strong><span>{[p.reference,p.address].filter(Boolean).join(' · ')} · {shortDate(p.first_date)}–{shortDate(p.last_date)}</span></button>)}</div>{!data.plans.length&&<p>{source==='project'?'Du har ingen aktive prosjektplaner nå.':'Du har ingen aktive fremdriftsplaner nå.'}</p>}{data.next&&<button type="button" className="secondary" disabled={busy} onClick={async()=>{const ticket=epoch.current;try{const next=await session.mine(null,data.next);if(alive.current&&ticket===epoch.current)setData(old=>({...next,plans:[...old.plans,...next.plans]}));}catch(e){if(alive.current&&ticket===epoch.current)setError(e.message);}}}>Hent flere aktive planer</button>}</>}
  {!grouped&&<button type="button" className="secondary" disabled={busy} onClick={refresh}>Oppdater mine planer</button>}
 </Container>
  {record&&data&&<KshmsProgressBoard key={scope+':'+record.id+':'+nonce} plan={record.plan} meta={record} readOnly dirty={false} saving={false} loading={busy} error="" notice={'Viser bare dine oppgaver. Planen redigeres under '+(source==='project'?'Prosjekt.':'KS/HMS.')} onPlanChange={()=>{}} onSave={async()=>false} operations={KSHMS_PROGRESS_OPERATIONS} people={[{id:context.user_id,name:'Deg'}]} stateKey={'personal:'+scope+':'+record.id} launchToken={nonce} onDismiss={close} onExport={exportOwn}/>}
 </>;
}
