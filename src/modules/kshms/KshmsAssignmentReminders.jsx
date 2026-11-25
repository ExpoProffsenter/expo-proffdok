import {useEffect,useRef,useState} from 'react';
import {kshmsRpc} from './kshmsAccess.js';
import {EXECUTION_CHANGE_EVENT} from './kshmsExecutions.mjs';
import {TASK_REMINDER_TARGETS,scopedTaskReminderGroups} from './kshmsTaskReminders.mjs';
export default function KshmsAssignmentReminders({context,refreshKey,onOpen,busy=false}) {
 const {company_id:companyId,user_id:userId,enabled}=context;
 const [value,setValue]=useState(null),[error,setError]=useState(''),refreshRef=useRef(null);
 useEffect(()=>{
  let active=true,serial=0;setValue(null);setError('');if(!enabled)return;
  const refresh=async()=>{const request=++serial;
   try{const next=await kshmsRpc('kshms_assignment_reminder_tasks',{p_company_id:companyId});
    if(!active||request!==serial)return;
    if(next?.company_id!==companyId||next?.user_id!==userId||!Array.isArray(next.groups)||next.groups.length&&!scopedTaskReminderGroups(next,companyId,userId).length){setValue(null);setError('Oppgavene må kontrolleres på nytt.');return;}
    setValue(next);setError('');
   }catch(cause){if(active&&request===serial){if(cause.code==='42501')setValue(null);setError(cause.code==='42501'?'Tilgangen til oppgavene må kontrolleres på nytt.':'Oppgavene kunne ikke oppdateres. Sist bekreftede oppgaver er beholdt.');}}
  };
  refreshRef.current=refresh;refresh();const visible=()=>{if(document.visibilityState==='visible')refresh();};
  const changed=e=>{if(e.detail?.company_id===companyId)refresh();};
  const timer=window.setInterval(visible,30000);window.addEventListener('focus',refresh);document.addEventListener('visibilitychange',visible);window.addEventListener(EXECUTION_CHANGE_EVENT,changed);
  return()=>{active=false;serial++;refreshRef.current=null;window.clearInterval(timer);window.removeEventListener('focus',refresh);document.removeEventListener('visibilitychange',visible);window.removeEventListener(EXECUTION_CHANGE_EVENT,changed);};
 },[companyId,userId,enabled,refreshKey]);
 const groups=enabled?scopedTaskReminderGroups(value,companyId,userId):[];
 if(!enabled||(!groups.length&&!error))return null;
 return <aside className="ks-card" aria-label="Dine oppgaver til oppfølging">
  {groups.length>0&&<><h3>Oppgaver du fortsatt skal fullføre</h3><p>Disse oppgavene har vært tildelt deg i minst sju dager. Åpne oppgaven og dokumenter din egen gjennomgang. Oppfølgingen lager ingen ny arbeidsfrist.</p><div className="ks-actions">{groups.map(group=><button type="button" className="secondary" key={group.kind} disabled={busy} onClick={()=>onOpen(TASK_REMINDER_TARGETS[group.kind].screen)}>Åpne {TASK_REMINDER_TARGETS[group.kind].label} ({group.count})</button>)}</div></>}
  {error&&<p role="status">{error} <button type="button" className="secondary" onClick={()=>refreshRef.current?.()}>Prøv igjen</button></p>}
 </aside>;
}
