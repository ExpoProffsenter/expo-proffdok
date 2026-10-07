import { useEffect,useRef,useState } from 'react';
import { kshmsRpc } from '../kshms/kshmsAccess.js';
import { CHECKLIST_TRADES,importPublishedChecklist } from '../kshms/kshmsChecklists.mjs';
import { MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT } from '../access/moduleAccessClient.js';
import { WORK_PROFILE_EVENT } from '../access/workProfileClient.js';
import '../kshms/kshmsChecklists.css';

export default function ProjectChecklistPicker({companyId,userId,projectId,instances=[],readOnly,onImport,onOpen}) {
 const [data,setData]=useState(null),[trade,setTrade]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const scopeRef=useRef(null),request=useRef(0),locked=useRef(false),attempts=useRef(new Map());
 const current=scope=>scope?.active&&scopeRef.current===scope;
 const load=async()=>{
  const scope=scopeRef.current,revision=++request.current;
  try{
   const result=await kshmsRpc('kshms_project_checklists',{p_company_id:companyId,p_project_id:projectId});
   if(!current(scope)||revision!==request.current)return;
   if(result.context?.company_id!==companyId||result.context.user_id!==userId||result.context.project_id!==projectId)throw new Error('Prosjektets firmatilgang er endret.');
   setData(result);setError('');
  }catch(cause){if(current(scope)&&revision===request.current){setData(null);setError(cause.message);}}
 };
 useEffect(()=>{const scope={active:true};scopeRef.current=scope;
  const refresh=event=>{
   if(event?.type===WORK_PROFILE_EVENT&&event.detail?.active_company_id!==companyId)setData(null);
   load().catch(cause=>{if(current(scope)){setData(null);setError(cause.message);}});
  };
  if(companyId&&userId&&projectId)refresh();
  const events=[MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT,WORK_PROFILE_EVENT,'focus'];events.forEach(event=>window.addEventListener(event,refresh));
  return()=>{scope.active=false;events.forEach(event=>window.removeEventListener(event,refresh));};
 },[companyId,userId,projectId]);
 const installed=(Array.isArray(instances)?instances:[]).filter(item=>item.company_id===companyId);
 const take=async version=>{
  if(locked.current||readOnly)return;
  const scope=scopeRef.current;if(!current(scope))return;
  locked.current=true;setBusy(true);setError('');setNotice('');
  const instanceId=attempts.current.get(version.id)||crypto.randomUUID();attempts.current.set(version.id,instanceId);
  try{
   const saved=await importPublishedChecklist({companyId,userId,projectId,versionId:version.id,instanceId,rpc:kshmsRpc,saveProject:onImport,isCurrent:()=>current(scope)});
   if(saved&&current(scope))setNotice(`«${saved.content.title}», versjon ${saved.version}, er lagret i prosjektet. Bruk «Åpne sjekkliste» for å fylle den ut.`);
  }catch(cause){if(current(scope))setError(cause.message);}
  finally{locked.current=false;if(current(scope))setBusy(false);}
 };
 if(!projectId||!companyId||!userId||!installed.length&&data?.context.enabled===false)return null;
 const visible=(data?.versions||[]).filter(version=>!trade||version.content.trade===trade);
 return <section className="ks-checklists ks-project-checklists"><h2>Sjekklister for fag</h2><p>Hent firmaets publiserte sjekklister til dette prosjektet. Fyll dem ut i Sjekklister. Utgaven du henter, beholdes når firmaet senere endrer malen.</p>
  {error&&<p role="alert" className="ks-error">{error}</p>}{notice&&<p role="status" className="ks-notice">{notice}</p>}
  {!!installed.length&&<div className="ks-checklist-grid">{installed.map(instance=><article className="ks-card" key={instance.id}><span className="ks-badge">{instance.content.trade}</span><h3>{instance.content.title}</h3><p>{`Hentet inn · versjon ${instance.version}`}</p><button type="button" className="secondary" onClick={()=>onOpen(instance)}>Åpne sjekkliste</button></article>)}</div>}
  {data?.context.enabled&&<><div className="ks-checklist-filters"><label className="ks-field"><span>Velg fag</span><select value={trade} onChange={e=>setTrade(e.target.value)}><option value="">Alle fag</option>{CHECKLIST_TRADES.map(value=><option key={value}>{value}</option>)}</select></label><button type="button" className="secondary" disabled={busy} onClick={()=>load().catch(cause=>setError(cause.message))}>Oppdater publiserte sjekklister</button></div>
   {!visible.length&&<p>Ingen publiserte sjekklister for dette fagvalget. Firmaadmin eller KS/HMS-ansvarlig kan bygge og publisere dem i Sjekklistesentral.</p>}
   <div className="ks-checklist-grid">{visible.map(version=>{const exists=installed.some(instance=>instance.version_id===version.id);return <article className="ks-card" key={version.id}><span className="ks-badge">{version.content.trade}</span><h3>{version.content.title}</h3><p>{`${version.content.points.length} sjekkpunkter · versjon ${version.number}`}</p>{version.content.instructions&&<p>{version.content.instructions}</p>}<button type="button" disabled={readOnly||busy||exists} onClick={()=>take(version)}>{exists?'Denne utgaven er hentet inn':'Hent sjekkliste'}</button></article>;})}</div>
  </>}
  {!data&&!error&&<p role="status">Henter firmaets sjekklister …</p>}
  {error&&!data&&<button type="button" className="secondary" disabled={busy} onClick={()=>load().catch(cause=>setError(cause.message))}>Prøv igjen</button>}
  {readOnly&&<p>Prosjektet er skrivebeskyttet. Innhentede lister kan åpnes.</p>}
 </section>;
}
