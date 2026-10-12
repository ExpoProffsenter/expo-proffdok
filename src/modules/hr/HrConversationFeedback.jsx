import React,{useEffect,useRef,useState} from 'react';
import {hrRpc} from './hrAccess.js';
import {createConversationSession} from './hrConversationSession.mjs';

// Render only after the editor has freshly loaded the exact current case.
// Opening, polling and private drafts never acknowledge an employee's input.
export default function HrConversationFeedback({value,context,feedback,onHandled,blocked=false}){
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[handled,setHandled]=useState(false);
 const live=useRef(false),epoch=useRef(0),running=useRef(false);
 const eligible=Boolean(value&&!value.historical&&feedback?.case_id===value.conversation.id
  &&context.user_id===value.employee.leader_id&&value.conversation.shared===true
  &&feedback.feedback_revision===value.conversation.employee_feedback_revision);
 useEffect(()=>{live.current=true;epoch.current++;setBusy(false);running.current=false;setError('');setHandled(false);
  return()=>{live.current=false;epoch.current++;};
 },[context.company_id,context.user_id,value?.employee.revision,feedback?.case_id,feedback?.feedback_revision,eligible]);
 const handle=async()=>{
  if(blocked||!eligible||running.current||handled||document.visibilityState==='hidden')return;
  const ticket=++epoch.current;running.current=true;setBusy(true);setError('');
  const current=()=>live.current&&ticket===epoch.current;
  const session=createConversationSession({rpc:hrRpc,companyId:context.company_id,userId:context.user_id,employeeId:value.employee.id});
  try{
   const fresh=await session.get(feedback.case_id);
   if(!current())return;
   if(fresh.employee.leader_id!==context.user_id||fresh.employee.revision!==value.employee.revision
    ||fresh.conversation.employee_feedback_revision!==feedback.feedback_revision)throw Error('Innspillet eller tilgangen er endret. Åpne samtalen på nytt.');
   const result=await hrRpc('hr_conversation_feedback_handle',{p_company_id:context.company_id,p_employee_id:value.employee.id,
    p_employee_revision:fresh.employee.revision,p_conversation_id:feedback.case_id,p_feedback_revision:feedback.feedback_revision});
   if(!current())return;
   if(result?.context?.company_id!==context.company_id||result.context.user_id!==context.user_id
    ||result.employee_id!==value.employee.id||result.conversation_id!==feedback.case_id
    ||result.feedback_revision!==feedback.feedback_revision||result.handled!==true)throw Error('Håndteringen kunne ikke bekreftes. Prøv igjen.');
   setHandled(true);onHandled?.(feedback);
  }catch(e){if(current())setError(e.message);}
  finally{session.dispose();if(current()){running.current=false;setBusy(false);}}
 };
 if(!eligible)return null;
 return <section className="hrp-saved" aria-label="Håndtering av medarbeiderinnspill">
  <p>{handled?'Innspillet er markert som håndtert.':'Les medarbeiderens delte forberedelse og kommentar. Marker innspillet når du har fulgt det opp.'}</p>
  {!handled&&<button type="button" className="secondary" disabled={busy||blocked} onClick={handle}>{busy?'Markerer innspillet …':'Marker innspillet som håndtert'}</button>}
  <p>Kortet fjernes fra Startsiden og Min side. En senere endret kommentar gir nytt varsel. Samtalen og e-postvarslet endres ikke.</p>
  {error&&<p role="alert">{error}</p>}
 </section>;
}
