import { formatDeviationDate } from '../deviations/deviationDates.mjs';
import { useEffect,useRef,useState } from 'react';
import { kshmsRpc } from './kshmsAccess.js';
import { DEVIATION_CHANGE_EVENT,readDeviationLink } from './kshmsDeviations.mjs';
import './kshms.css';

export default function KshmsTasks({context,onOpen}) {
 const {company_id:companyId,user_id:userId}=context;
 const [tasks,setTasks]=useState(null),[error,setError]=useState(''),refreshRef=useRef(null);
 const [emailLink,setEmailLink]=useState(()=>readDeviationLink(window.location.search,companyId));
 useEffect(()=>{
  let active=true,revision=0;
  const refresh=async()=>{const request=++revision;
   try{const value=await kshmsRpc('kshms_deviation_tasks',{p_company_id:companyId});
    if(active&&request===revision&&value.company_id===companyId&&value.user_id===userId){setTasks(value);setError('');}
   }catch(e){if(active&&request===revision){if(e.code==='42501')setTasks(null);setError(e.code==='42501'?'Tilgangen til KS/HMS må kontrolleres på nytt.':'Varslene kunne ikke oppdateres. Sist bekreftede oppgaver er beholdt.');}}
  };
  refreshRef.current=refresh;setTasks(null);setError('');refresh();
  const changed=e=>{if(e.detail?.company_id===companyId)refresh();};
  const visible=()=>{if(document.visibilityState==='visible')refresh();};
  const timer=window.setInterval(()=>{if(document.visibilityState==='visible')refresh();},30000);
  window.addEventListener(DEVIATION_CHANGE_EVENT,changed);window.addEventListener('focus',refresh);document.addEventListener('visibilitychange',visible);
  return()=>{active=false;revision++;window.clearInterval(timer);window.removeEventListener(DEVIATION_CHANGE_EVENT,changed);window.removeEventListener('focus',refresh);document.removeEventListener('visibilitychange',visible);refreshRef.current=null;};
 },[companyId,userId]);
 const open=async id=>{if(await onOpen(id))setEmailLink(null);};
 if(!tasks?.count&&!error&&!emailLink)return null;
 return <aside className="ks-task-banner" aria-label="Dine åpne KS/HMS-avvik">
  {tasks?.count>0&&<><div className="ks-task-heading"><strong>Du er ansvarlig for {tasks.count} {tasks.count===1?'åpent avvik':'åpne avvik'}</strong>{tasks.overdue>0&&<span> · {tasks.overdue} etter fristen</span>}</div>
  <details className="ks-task-details"><summary aria-label={`Vis oppgaver (${tasks.count})`}><span className="ks-task-long-label">Vis oppgaver</span><span className="ks-task-short-label">Vis</span></summary><div className="ks-task-content"><p>Dokumenter tiltak og egen kontroll i KS/HMS. Varselet står til lukkingen er lagret.</p><ul>{tasks.items.map(row=><li key={row.id}><button type="button" className="secondary" onClick={()=>open(row.id)}>{row.title} · frist {formatDeviationDate(row.due_on)}</button></li>)}</ul>{tasks.count>tasks.items.length&&<button type="button" className="secondary" onClick={()=>open(null)}>Se alle i Avvikssentral</button>}</div></details>
  <button type="button" className="ks-task-open" aria-label="Åpne avvik" onClick={()=>open(tasks.items[0]?.id||null)}><span className="ks-task-long-label">Åpne avvik</span><span className="ks-task-short-label">Åpne</span></button></>}
  {error&&<p className="ks-task-message" role="status">{error} <button type="button" className="secondary" onClick={()=>refreshRef.current?.()}>Prøv igjen</button></p>}
  {emailLink&&<div className="ks-task-message"><p>{emailLink.matchingCompany?'Du har åpnet en lenke til et KS/HMS-avvik.':'Lenken gjelder et annet firma. Bytt til riktig arbeidsprofil før du åpner saken.'}</p>{emailLink.matchingCompany&&<button type="button" onClick={()=>open(emailLink.id)}>Åpne saken fra e-posten</button>}</div>}
 </aside>;
}
