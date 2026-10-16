import React,{useEffect,useMemo,useRef,useState} from 'react';
import KshmsProgressBoard from '../kshms/KshmsProgressBoard.jsx';
import {KSHMS_PROGRESS_OPERATIONS,classifiedExportPlan} from '../kshms/kshmsProgressCodes.mjs';
import {downloadProgressPdf,openProgressPreview,progressBrandMeta} from '../kshms/kshmsProgressPdf.mjs';
import {downloadStaffingCsv} from '../kshms/kshmsProgressStaffing.mjs';
import {downloadProgressPlanIcs} from './progressPlanCalendarExport.js';
import {STANDARD_PROGRESS_OPERATIONS} from './progressPlanStandardOperations.js';
import {getProgressSupabaseClient,loadInternalProgressProjectMeta,loadAcceptedOfferActivities} from './progressPlanSupabase.js';
import {ProgressPlanExportActions} from './progressPlanExportV3.jsx';
import {projectProgressSession,projectProgressDrafts as drafts} from './projectProgressSession.mjs';
import {MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT} from '../access/moduleAccessClient.js';
import {getAppSupabaseClient} from '../access/appSupabaseClientRegistry.js';
import {WORK_PROFILE_EVENT} from '../access/workProfileClient.js';
async function projectRpc(name,args){const c=getAppSupabaseClient();if(!c)throw Error('Innloggingen er ikke klar.');const {data,error}=await c.rpc(name,args);if(error)throw Object.assign(Error(error.message),{code:error.code});return data;}
export default function ProjectProgressPlanner({projectId,onDirtyChange}){
 const client=useMemo(()=>getProgressSupabaseClient(),[]),session=useMemo(()=>projectProgressSession({rpc:projectRpc,projectId}),[projectId]);
 const [value,setValue]=useState(null),[plan,setPlan]=useState(null),[meta,setMeta]=useState(null),[customerVisible,setCustomerVisible]=useState(false),[dirty,setDirty]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false),[checking,setChecking]=useState(true),[conflict,setConflict]=useState(null);
 const live=useRef(false),epoch=useRef(0),state=useRef({}),exportRef=useRef(null),busyRef=useRef(false);state.current={value,plan,meta,customerVisible,dirty};
 const current=t=>live.current&&epoch.current===t;
 const draftKey=v=>v.context.company_id+':'+v.context.user_id+':'+projectId;
 const refresh=async()=>{
  const ticket=++epoch.current;setChecking(true);setError('');setValue(null);setPlan(null);setMeta(null);setConflict(null);setBusy(false);busyRef.current=false;
  if(document.visibilityState==='hidden')return;
  try{const fresh=await session.get();if(!current(ticket))return;const m=await loadInternalProgressProjectMeta(client,projectId);if(!current(ticket))return;if(!m||m.id!==projectId)throw Error('Prosjektet er ikke tilgjengelig.');
   const k=draftKey(fresh),local=drafts.get(k),matching=local&&local.revision===fresh.record.revision;
   setValue(fresh);setMeta({...m,companyName:m.row?.data?.company?.name||m.row?.data?.company?.companyName||'Expo ProffDok',planReference:m.requestRef});
   setPlan(matching?local.plan:fresh.record.plan);setCustomerVisible(matching?local.customerVisible:fresh.record.customerVisible);setDirty(Boolean(matching));setConflict(local&&!matching?local:null);
   if(matching)setNotice('Ulagret kladd er gjenopprettet. Lagre når planen er klar.');
  }catch(e){if(current(ticket))setError(e.message);}finally{if(current(ticket))setChecking(false);}
 };
 useEffect(()=>{live.current=true;refresh();const events=[WORK_PROFILE_EVENT,MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT,'focus'];events.forEach(n=>window.addEventListener(n,refresh));document.addEventListener('visibilitychange',refresh);return()=>{live.current=false;++epoch.current;events.forEach(n=>window.removeEventListener(n,refresh));document.removeEventListener('visibilitychange',refresh);};},[projectId]);
 useEffect(()=>{onDirtyChange?.(dirty||Boolean(conflict));},[dirty,conflict,onDirtyChange]);
 const change=(next,visible=customerVisible)=>{if(!value||value.record.locked||busyRef.current||checking||conflict)return;drafts.set(draftKey(value),{revision:value.record.revision,plan:next,customerVisible:visible});setPlan(next);setCustomerVisible(visible);setDirty(true);setNotice('');};
 const save=async()=>{if(!value||value.record.locked||busyRef.current||conflict)return false;const ticket=epoch.current;busyRef.current=true;setBusy(true);setError('');const snapshot=state.current;
  try{const fresh=await session.save({plan:snapshot.plan,revision:snapshot.value.record.revision,customerVisible:snapshot.customerVisible});if(!current(ticket))return false;
   drafts.delete(draftKey(fresh));setValue(fresh);setPlan(fresh.record.plan);setCustomerVisible(fresh.record.customerVisible);setDirty(false);setNotice('Fremdriftsplanen er lagret.');return true;
  }catch(e){if(current(ticket))setError(e.message);return false;}finally{if(current(ticket)){busyRef.current=false;setBusy(false);}}
 };
 const importOffer=async()=>{if(busyRef.current||!value||conflict)return;const ticket=epoch.current;busyRef.current=true;setBusy(true);setError('');try{
  const fresh=await session.get();if(!current(ticket))return;if(fresh.record.locked||fresh.record.revision!==value.record.revision)throw Error('Planen er endret. Hent siste lagrede plan først.');
  const items=await loadAcceptedOfferActivities(client,meta);if(!current(ticket))return;
  const keys=new Set(plan.activities.map(a=>String(a.sourceMainPostId||a.title).trim().toLocaleLowerCase('nb-NO'))),added=items.filter(a=>!keys.has(String(a.sourceMainPostId||a.title).trim().toLocaleLowerCase('nb-NO')));
  if(!added.length){setNotice('Ingen nye arbeidsoperasjoner fra tilbudet.');return;}
  const next={...plan,source:{type:'accepted-offer',requestRef:meta.requestRef,importedAt:new Date().toISOString()},activities:[...plan.activities,...added]};
  drafts.set(draftKey(value),{revision:value.record.revision,plan:next,customerVisible});setPlan(next);setDirty(true);setNotice(`${added.length} arbeidsoperasjoner er hentet fra tilbudet. Planlegg datoene og lagre planen.`);
 }catch(e){if(current(ticket))setError(e.message);}finally{if(current(ticket)){busyRef.current=false;setBusy(false);}}};
 const exportPlan=async kind=>{
  const snapshot=state.current;if(!snapshot.value||snapshot.dirty||drafts.get(draftKey(snapshot.value))||busyRef.current)return 'Lagre planen før eksport.';
  const ticket=epoch.current,printing=['pdf','staffing-pdf'].includes(kind),target=printing?window.open('','_blank'):null;if(printing&&!target)return 'Tillat forhåndsvisningsvinduet og prøv igjen.';
  busyRef.current=true;setBusy(true);setError('');
  try{const load=async()=>{if(!current(ticket)||state.current.dirty)throw Error('Planvisningen er endret.');const fresh=await session.get();if(!current(ticket))throw Error('Arbeidsprofilen er endret.');const freshMeta=await loadInternalProgressProjectMeta(client,projectId);if(!current(ticket)||!freshMeta)throw Error('Prosjektet er ikke tilgjengelig.');return {plan:fresh.record.plan,meta:await progressBrandMeta({rpc:projectRpc,companyId:fresh.context.company_id,meta:{...snapshot.meta,...freshMeta}})};};
   if(kind.endsWith('-download'))await downloadProgressPdf({kind:kind==='staffing-download'?'staffing':'schedule',load,isCurrent:()=>current(ticket)});
   else{const fresh=await load();if(printing)openProgressPreview({target,kind:kind==='pdf'?'schedule':'staffing',...fresh,onDownload:()=>exportRef.current(kind==='pdf'?'pdf-download':'staffing-download')});else if(kind==='staffing-csv')downloadStaffingCsv(fresh.meta,fresh.plan);else downloadProgressPlanIcs({projectId,meta:fresh.meta,plan:classifiedExportPlan(fresh.plan)});}
  }catch(e){target?.close();if(current(ticket))setError(e.message);return e.message;}finally{if(current(ticket)){busyRef.current=false;setBusy(false);}}
 };exportRef.current=exportPlan;
 if(checking)return <p role="status">Kontrollerer tilgang og henter fremdriftsplanen …</p>;
 if(!value||!plan||!meta)return <div role="alert">{error||'Planen er ikke tilgjengelig.'}<button type="button" onClick={refresh}>Prøv igjen</button></div>;
 if(conflict)return <section role="alert"><h3>Du har en annen ulagret kladd</h3><p>Planen er endret på serveren. Velg hvilken versjon du vil arbeide videre med.</p><button type="button" onClick={()=>{drafts.delete(draftKey(value));setConflict(null);setDirty(false);}}>Bruk lagret plan</button><button type="button" onClick={()=>{drafts.set(draftKey(value),{...conflict,revision:value.record.revision});setPlan(conflict.plan);setCustomerVisible(conflict.customerVisible);setDirty(true);setConflict(null);}}>Fortsett med min kladd</button></section>;
 const tools=<details className="module-guide"><summary>Prosjektvalg, tilbud og deling</summary><p><strong>{meta.title}</strong>{meta.address?' · '+meta.address:''}</p>
  {!value.record.locked&&<>{meta.publicToken&&<button type="button" className="secondary" disabled={busy} onClick={importOffer}>Hent arbeidsoperasjoner fra tilbud</button>}{!meta.simpleOrder&&<label><input type="checkbox" checked={customerVisible} disabled={busy} onChange={e=>change(plan,e.target.checked)}/>Vis lagret fremdriftsplan i kundeportalen</label>}</>}
  <p>{value.record.locked?'Prosjektet er låst. Planen vises som historikk.':'Velg arbeidsoperasjoner, planlegg periodene og lagre. Endringer i oversikten er kladd til du lagrer.'}</p>
  <button type="button" className="secondary" disabled={busy} onClick={()=>{if(!dirty||window.confirm('Forkast ulagret kladd og hent lagret plan?')){drafts.delete(draftKey(value));refresh();}}}>Hent lagret plan</button>
  <ProgressPlanExportActions projectId={projectId} dirty={dirty||busy} shareOnly/>
 </details>;
 return <KshmsProgressBoard key={draftKey(value)} plan={plan} meta={{...meta,title:meta.title}} readOnly={value.record.locked} dirty={dirty} saving={busy} loading={false} error={error} notice={notice} onPlanChange={change} onSave={save} operations={KSHMS_PROGRESS_OPERATIONS} standardOperations={STANDARD_PROGRESS_OPERATIONS} people={value.people||[]} stateKey={'project:'+draftKey(value)} launchToken={0} tools={tools} onExport={exportPlan} participantHint="Deltakerne hentes fra prosjektets firma. Valget gir tilgang til egne aktive oppgaver på Min side, og gir ikke redigeringstilgang til prosjektet."/>;
}
