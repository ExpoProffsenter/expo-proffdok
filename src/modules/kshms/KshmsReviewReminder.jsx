import {useEffect,useRef,useState} from 'react';
import {kshmsRpc} from './kshmsAccess.js';
import {formatDeviationDate} from '../deviations/deviationDates.mjs';
import {reviewDeadlineLabel,scopedReviewTask} from './kshmsReviewReminders.mjs';
export default function KshmsReviewReminder({context,settingsRevision,onOpen,busy=false}) {
 const {company_id:companyId,user_id:userId}=context;
 const eligible=context.enabled===true&&context.responsible===true&&context.manage===true;
 const [value,setValue]=useState(null),[error,setError]=useState(''),refreshRef=useRef(null);
 useEffect(()=>{
  let active=true,revision=0;
  setValue(null);setError('');
  if(!eligible)return;
  const refresh=async()=>{const request=++revision;
   try{const next=await kshmsRpc('kshms_review_task',{p_company_id:companyId});
    if(!active||request!==revision)return;
    if(next?.company_id!==companyId||next?.user_id!==userId){setValue(null);setError('Revisjonsoppgaven må kontrolleres på nytt.');return;}
    setValue(next);setError('');
   }catch(cause){if(active&&request===revision){if(cause.code==='42501')setValue(null);setError(cause.code==='42501'?'Tilgangen til revisjon må kontrolleres på nytt.':'Revisjonsoppgaven kunne ikke oppdateres. Sist bekreftede oppgave er beholdt.');}}
  };
  refreshRef.current=refresh;refresh();
  const visible=()=>{if(document.visibilityState==='visible')refresh();};
  const timer=window.setInterval(visible,30000);
  window.addEventListener('focus',refresh);document.addEventListener('visibilitychange',visible);
  return()=>{active=false;revision++;refreshRef.current=null;window.clearInterval(timer);window.removeEventListener('focus',refresh);document.removeEventListener('visibilitychange',visible);};
 },[companyId,userId,eligible,settingsRevision]);
 const task=eligible?scopedReviewTask(value,companyId,userId):null;
 if(!eligible||(!task&&!error))return null;
 return <aside className="ks-card" aria-label="Din håndbokrevisjon">
  {task&&<><h3>{reviewDeadlineLabel(task.deadline_status)}</h3><p>Du er utpekt til å kontrollere håndboken. Neste revisjon: {formatDeviationDate(task.due_on)}.</p><p>Gå gjennom rutinene, dokumenter funn og oppfølging, og signer din egen revisjon når gjennomgangen er utført. Oppgaven står til revisjonen er lagret.</p><button type="button" className="secondary" disabled={busy} onClick={onOpen}>Åpne håndbokrevisjon</button></>}
  {error&&<p role="status">{error} <button type="button" className="secondary" onClick={()=>refreshRef.current?.()}>Prøv igjen</button></p>}
 </aside>;
}
