import React,{useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {kshmsRpc} from './kshmsAccess.js';
import {progressSession} from './kshmsProgressClient.mjs';
import {KSHMS_PROGRESS_OPERATIONS,PROGRESS_CODE_SOURCE,classifiedExportPlan} from './kshmsProgressCodes.mjs';
import {ProgressPlanWorkspace} from '../progress/ProgressPlanWorkspace.jsx';
import {downloadProgressPdf,openProgressPreview,progressBrandMeta} from './kshmsProgressPdf.mjs';
import {downloadProgressPlanIcs} from '../progress/progressPlanCalendarExport.js';
import {WORK_PROFILE_EVENT} from '../access/workProfileClient.js';
import {MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT} from '../access/moduleAccessClient.js';
import './kshmsProgressPlans.css';
import {progressDrafts as drafts} from './kshmsProgressDraft.mjs';
import {downloadStaffingCsv} from './kshmsProgressStaffing.mjs';
import KshmsProgressBoard from './KshmsProgressBoard.jsx';
const empty={title:'',address:'',reference:''};
export default function KshmsProgressPlans({context,active=true}){
 const companyId=context.company_id,userId=context.user_id,scope=companyId+':'+userId;
 const session=useMemo(()=>progressSession({rpc:kshmsRpc,companyId,userId}),[scope]);
 const [list,setList]=useState(null),[selected,setSelected]=useState(null),[archived,setArchived]=useState(false),[query,setQuery]=useState(''),[form,setForm]=useState(empty),[creating,setCreating]=useState(false),[editing,setEditing]=useState(false),[dirty,setDirty]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[reload,setReload]=useState(()=>crypto.randomUUID()),[choosing,setChoosing]=useState(true);
 const exportRef=useRef(null),peopleRef=useRef([]);
 const epoch=useRef(0),alive=useRef(false),recordRef=useRef(null),busyRef=useRef(false),detailsRevision=useRef(null);
 const refresh=useCallback(async()=>{
  const ticket=++epoch.current;setError('');
  try{const [value,roster]=await Promise.all([session.list(archived),session.people()]);value.people=roster.people;if(alive.current&&ticket===epoch.current)setList(value);}
  catch(e){if(alive.current&&ticket===epoch.current){setList(null);setError(e.message);}}
 },[session,archived]);
 useEffect(()=>{
  alive.current=true;
  if(active)refresh();
  const invalidate=()=>{++epoch.current;setList(null);if(document.visibilityState!=='hidden'&&active)refresh();};
  const events=[WORK_PROFILE_EVENT,MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT,'focus'];events.forEach(name=>window.addEventListener(name,invalidate));document.addEventListener('visibilitychange',invalidate);
  return()=>{alive.current=false;++epoch.current;events.forEach(name=>window.removeEventListener(name,invalidate));document.removeEventListener('visibilitychange',invalidate);};
 },[scope,active,refresh,context.manage]);
 const ownList=list?.context?.company_id===companyId&&list.context.user_id===userId?list:null;
 peopleRef.current=ownList?.people||[];
 const manage=Boolean(context.manage&&ownList?.context.manage);
 const current=()=>alive.current&&active;
 const open=async (id,{discard=false}={})=>{
  if(busyRef.current)return;
  if(dirty&&!discard&&!window.confirm('Du har ulagrede endringer. Behold kladden og åpne en annen plan?'))return;
  busyRef.current=true;setBusy(true);setError('');const ticket=++epoch.current;
  try{const value=await session.get(id);if(current()&&ticket===epoch.current){setSelected(value.record);recordRef.current=value.record;setDirty(false);setEditing(false);setCreating(false);setChoosing(false);setReload(()=>crypto.randomUUID());}}
  catch(e){if(current()&&ticket===epoch.current)setError(e.message);}
  finally{if(current()){busyRef.current=false;setBusy(false);}}
 };
 const adapter=useMemo(()=>!selected?null:{
  meta:{id:selected.id,title:selected.title,address:selected.address,locked:!manage||selected.archived},
  operations:KSHMS_PROGRESS_OPERATIONS,
  renderWorkspace:props=><KshmsProgressBoard {...props} operations={KSHMS_PROGRESS_OPERATIONS} stateKey={scope+':'+selected.id} launchToken={reload} people={peopleRef.current} onExport={kind=>exportRef.current(kind)}/>,
  load:async()=>{
   const value=await session.get(selected.id);if(!current())throw Error('Planen er lukket.');recordRef.current=value.record;
   const draft=drafts.get(scope+':'+selected.id);
   if(draft&&draft.revision!==value.record.revision)throw Error('Lagret plan er endret. Kladden er beholdt. Bruk Hent lagret plan for å forkaste kladden og hente siste utgave.');
   return {...(draft?.plan||value.record.plan),dirty:Boolean(draft),locked:!value.context.manage||value.record.archived};
  },
  onDraftChange:plan=>{if(current()&&recordRef.current?.id===selected.id)drafts.set(scope+':'+selected.id,{revision:recordRef.current.revision,plan});},
  save:async plan=>{
   if(!current()||!manage||busyRef.current||recordRef.current?.id!==selected.id)throw Error('Kontroller tilgangen før lagring.');
   busyRef.current=true;setBusy(true);
   try{const value=await session.save({...recordRef.current,plan:{...plan,source:null}});
    if(!current())throw Error('Arbeidsprofilen er endret.');recordRef.current=value.record;drafts.delete(scope+':'+selected.id);return value.record.plan;
   }finally{if(current()){busyRef.current=false;setBusy(false);}}
  },
 },[selected?.id,scope,manage,reload,active]);
 const command=async work=>{
  if(busyRef.current||!manage)return;
  busyRef.current=true;setBusy(true);setError('');
  try{await work();}catch(e){if(current())setError(e.message);}finally{if(current()){busyRef.current=false;setBusy(false);}}
 };
 const saveDetails=event=>{
  event.preventDefault();command(async()=>{
   if(dirty)throw Error('Lagre fremdriftsplanen før du endrer planopplysninger.');
   const fresh=editing?(await session.get(selected.id)).record:null;
   if(editing&&fresh.revision!==detailsRevision.current)throw Error('Planopplysningene er endret av en annen. Hent lagret plan og prøv igjen.');
   const record=editing?{...fresh,...form}:{id:crypto.randomUUID(),revision:0,...form,plan:{version:1,activities:[],source:null,excludeSundays:true},archived:false};
   const value=await session.save(record);if(!current())return;
   recordRef.current=value.record;setSelected(value.record);setForm(empty);setCreating(false);setEditing(false);setChoosing(false);setReload(()=>crypto.randomUUID());await refresh();
  });
 };
 const changeArchive=()=>command(async()=>{
  if(dirty)throw Error('Lagre fremdriftsplanen før arkivering.');
  if(!window.confirm(selected.archived?'Gjenopprett denne planen?':'Arkiver denne planen? Den kan hentes tilbake under Arkiverte planer.'))return;
  const fresh=await session.get(selected.id);
  if(fresh.record.revision!==recordRef.current.revision||fresh.record.archived!==selected.archived)throw Error('Planen er endret. Hent lagret plan før du arkiverer eller gjenoppretter.');
  await session.save({...fresh.record,archived:!selected.archived});
  if(current()){setSelected(null);setChoosing(true);recordRef.current=null;await refresh();}
 });
 const exportPlan=async kind=>{
  if(dirty||drafts.has(scope+':'+selected.id)||busyRef.current)return 'Lagre planen og vent til pågående arbeid er ferdig før eksport.';
  const printing=['pdf','staffing-pdf'].includes(kind);
  const printWindow=printing?window.open('','_blank'):null;
  if(printing&&!printWindow){setError('Tillat utskriftsvinduet i nettleseren og prøv igjen.');return 'Tillat utskriftsvinduet i nettleseren og prøv igjen.';}
  busyRef.current=true;setBusy(true);setError('');
  try{
   const load=async()=>{if(!current()||drafts.has(scope+':'+selected.id))throw Error('Planvisningen er endret eller har ulagret kladd.');const fresh=await session.get(selected.id);if(!current())throw Error('Arbeidsprofilen er endret.');const record=fresh.record;return {plan:record.plan,meta:await progressBrandMeta({rpc:kshmsRpc,companyId,meta:{companyName:context.company_name,id:record.id,title:record.title,address:record.address,requestRef:record.reference,planReference:record.reference,row:{data:{company:{name:context.company_name}}}}})};};
   if(kind.endsWith('-download')){await downloadProgressPdf({kind:kind==='staffing-download'?'staffing':'schedule',load,isCurrent:current});return;}
   const value=await session.get(selected.id);if(!current())throw Error('Arbeidsprofilen er endret.');
   const record=value.record,plan=classifiedExportPlan(record.plan),meta=await progressBrandMeta({rpc:kshmsRpc,companyId,meta:{companyName:context.company_name,id:record.id,title:record.title,address:record.address,requestRef:record.reference,planReference:record.reference,row:{data:{company:{name:context.company_name}}}}});if(!current())throw Error('Arbeidsprofilen er endret.');
   if(kind==='staffing-pdf')openProgressPreview({target:printWindow,kind:'staffing',meta,plan:record.plan,onDownload:()=>exportRef.current('staffing-download')});
   else if(kind==='staffing-csv')downloadStaffingCsv(meta,record.plan);
   else if(kind==='pdf')openProgressPreview({target:printWindow,kind:'schedule',meta,plan:record.plan,onDownload:()=>exportRef.current('pdf-download')});
   else downloadProgressPlanIcs({projectId:record.id,meta,plan});
  }catch(e){printWindow?.close();if(current())setError(e.message);return e.message;}finally{if(current()){busyRef.current=false;setBusy(false);}}
 };
 exportRef.current=exportPlan;
 const dirtyChanged=useCallback(value=>setDirty(value),[]);
 if(!active)return null;
 return <section className="ks-progress" aria-label="Fremdriftsplaner i KS/HMS">
  <div className="ks-progress-header"><div><small>KS/HMS · Fremdriftsplaner</small><h2>{selected?.title||'Fremdriftsplaner'}</h2><p>{selected?[selected.reference,selected.address].filter(Boolean).join(' · '): 'Planlegg oppdrag med datoer, fag og personer.'}</p></div>{manage&&<button type="button" disabled={busy||dirty} onClick={()=>{setCreating(true);setEditing(false);setForm(empty);}}>Ny fremdriftsplan</button>}</div>
  {error&&<p role="alert" className="ks-error">{error}</p>}
  {(creating||editing)&&manage&&<form className="ks-card" onSubmit={saveDetails}><h3>{editing?'Endre planopplysninger':'Ny fremdriftsplan'}</h3><div className="ks-progress-fields">{[['title','Navn på planen',160],['address','Adresse',250],['reference','Prosjektnummer / referanse',100]].map(([key,label,max])=><label key={key}>{label}<input required={key==='title'} maxLength={max} value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))}/></label>)}</div><button disabled={busy}>{editing?'Lagre planopplysninger':'Opprett plan'}</button> <button type="button" className="secondary" onClick={()=>{setCreating(false);setEditing(false);}}>Avbryt</button></form>}
  <details className="ks-progress-plan-choice" open={choosing||!selected} onToggle={e=>setChoosing(e.currentTarget.open)}><summary>{selected?'Bytt plan / finn arkiverte':'Velg fremdriftsplan'}</summary>
  <div className="ks-progress-list-controls"><label>Søk etter plan<input type="search" value={query} onChange={e=>setQuery(e.target.value)}/></label><label><input type="checkbox" checked={archived} onChange={e=>setArchived(e.target.checked)}/>Arkiverte planer</label><button className="secondary" disabled={busy} onClick={refresh}>Oppdater oversikten</button></div>
  {!ownList?<p role="status">{error?'Oversikten er ikke tilgjengelig. Prøv å oppdatere.':'Henter planer …'}</p>:<><div className="ks-progress-list">{ownList.plans.filter(p=>[p.title,p.address,p.reference].join(' ').toLocaleLowerCase('nb').includes(query.toLocaleLowerCase('nb'))).map(p=><button type="button" className={'secondary'+(selected?.id===p.id?' active':'')} key={p.id} disabled={busy} onClick={()=>open(p.id)}><strong>{p.title}</strong><span>{[p.reference,p.address].filter(Boolean).join(' · ')||'Ingen referanse eller adresse'}</span></button>)}</div>{!ownList.plans.length&&<p>Ingen {archived?'arkiverte ':''}planer ennå.{manage?' Velg Ny fremdriftsplan for å begynne.':''}</p>}{ownList.next&&<button disabled={busy} className="secondary" onClick={async()=>{try{const page=await session.list(archived,ownList.next);if(current())setList(previous=>({...page,plans:[...previous.plans,...page.plans]}));}catch(e){if(current())setError(e.message);}}}>Hent flere planer</button>}</>}
  </details>
  {selected&&!ownList&&<p role="status">{error?'Planen er ikke tilgjengelig.':'Kontrollerer tilgang og henter planen …'}</p>}
  {selected&&ownList&&<>
   <details className="ks-progress-plan-options"><summary>Planvalg og eksport</summary><div className="ks-progress-tools"><button className="secondary" disabled={dirty||busy} onClick={()=>exportPlan('pdf')}>Forhåndsvis fremdriftsplan</button><button className="secondary" disabled={dirty||busy} onClick={()=>exportPlan('pdf-download')}>Last ned fremdriftsplan (PDF)</button><button className="secondary" disabled={dirty||busy} onClick={()=>exportPlan('staffing-download')}>Last ned bemanningsplan (PDF)</button><button className="secondary" disabled={dirty||busy} onClick={()=>exportPlan('ics')}>Last ned kalender (.ics)</button>{manage&&<><button className="secondary" disabled={dirty||busy} onClick={()=>{detailsRevision.current=recordRef.current.revision;setEditing(true);setCreating(false);setForm({title:recordRef.current.title,address:recordRef.current.address,reference:recordRef.current.reference});}}>Endre planopplysninger</button><button className="secondary" disabled={dirty||busy} onClick={changeArchive}>{selected.archived?'Gjenopprett plan':'Arkiver plan'}</button></>}<button className="secondary" disabled={busy} onClick={()=>{if(!(dirty||drafts.has(scope+':'+selected.id))||window.confirm('Forkast ulagret kladd og hent siste lagrede plan?')){drafts.delete(scope+':'+selected.id);open(selected.id,{discard:true});}}}>Hent lagret plan</button></div>
   <details className="module-guide"><summary>Fag og NS 3451-koder</summary><p>Velg bygningsdelen arbeidet gjelder. Mur/flis og maler kan bruke samme bygningsdel. Arbeidsoperasjonen beskriver selve jobben, for eksempel membran eller maling. Rigg og drift kan legges inn uten bygningsdelskode.</p><p>Utvalget viser bygningsdeler og noen systemkoder fra NS 3451:2022. Du kan skrive en annen kode selv og velge kodetype. Dette er et begrenset utvalg, ikke den komplette standarden.</p><a href={PROGRESS_CODE_SOURCE} target="_blank" rel="noreferrer">Se offentlig kodegrunnlag fra Bergen kommune (2025)</a></details>
   </details>
   <div id="kshms-progress-workspace"><ProgressPlanWorkspace key={scope+':'+selected.id+':'+reload} mode="kshms" standalone={adapter} onDirtyChange={dirtyChanged}/></div>
  </>}
 </section>;
}
