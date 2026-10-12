import {createConversationSession} from './hrConversationSession.mjs';
import {createHrFoundationSession} from './hrFoundation.mjs';
import {osloToday} from './hrPracticeConversation.mjs';

const titles={'employee-feedback':'Nytt innspill til medarbeidersamtalen',preparation:'Du er invitert til medarbeidersamtale',plan:'Oppfølgingsplan',meeting1:'Dialogmøte 1 – vurdering og oppfølging',activity:'Underlag til NAVs aktivitetsvurdering',meeting2:'Forberedelse til NAVs dialogmøte 2',next:'Neste oppfølging','hr-review':'Kontroll av HR-oppsett og tilgang'};
export function followupVisible(task,today=osloToday()){
 // Annual administration should not compete with invitations and work that can start now.
 if(task.task_key!=='hr-review')return true;
 const days=(Date.parse(task.due_on+'T12:00:00Z')-Date.parse(today+'T12:00:00Z'))/86400000;
 return Number.isFinite(days)&&days<=30;
}
export const followupTitle=task=>titles[task.task_key]||'Avtalt tiltak';
export const followupStep=task=>task.kind==='conversation'?(task.task_key==='employee-feedback'?3:task.task_key==='preparation'?0:2):task.task_key==='plan'?1:task.task_key.startsWith('action:')||task.task_key==='next'?2:4;
export function checkFollowupTasks(value,companyId,userId){
 if(value?.context?.company_id!==companyId||value.context.user_id!==userId||!Array.isArray(value.tasks)||value.tasks.length>50
  ||value.tasks.some(t=>typeof t.case_id!=='string'||!t.case_id||typeof t.task_key!=='string'||!t.task_key||!/^\d{4}-\d{2}-\d{2}$/.test(t.due_on)
   ||!['conversation','sickleave','review'].includes(t.kind)||(t.kind==='review'?t.task_key!=='hr-review':typeof t.employee_id!=='string'||!t.employee_id)
   ||['preparation','employee-feedback'].includes(t.task_key)&&t.kind!=='conversation'
   ||t.task_key==='employee-feedback'&&(!Number.isInteger(t.feedback_revision)||t.feedback_revision<1)))throw Error('Firma eller oppfølgingstilgang er endret. Hent oversikten på nytt.');
 // Only pointers and meeting metadata enter the notice. Never keep the full case payload here.
 return {tasks:value.tasks.map(t=>({case_id:t.case_id,employee_id:t.employee_id,task_key:t.task_key,due_on:t.due_on,kind:t.kind,...(t.task_key==='employee-feedback'?{feedback_revision:t.feedback_revision}:{})})),next:value.next||null};
}
export async function readFollowupNotice({rpc,companyId,userId,after=null,feedbackAfter=null}){
 const args={p_company_id:companyId,...(after?{p_after:after}:{})};
 const empty={context:{company_id:companyId,user_id:userId},tasks:[],next:null};
 const [raw,feedback]=await Promise.all([after===false?empty:rpc('hr_followup_tasks',args),feedbackAfter===false?empty:rpc('hr_conversation_feedback_notices',{p_company_id:companyId,p_after:feedbackAfter})]);
 const value=checkFollowupTasks(raw,companyId,userId),notices=checkFollowupTasks(feedback,companyId,userId);
 if(notices.tasks.some(t=>t.task_key!=='employee-feedback'))throw Error('Serverens innspillsvar kunne ikke bekreftes.');
 const meeting=await Promise.all(value.tasks.filter(t=>t.task_key==='preparation').slice(0,6).map(async t=>{
  const session=createConversationSession({rpc,companyId,userId,employeeId:t.employee_id});
  try{const result=await session.get(t.case_id),c=result.conversation;
   if(c.stage!=='preparation'||c.on!==t.due_on)return [t.case_id,null];
   return [t.case_id,{on:c.on,time:c.meeting_time||'',location:c.meeting_location||'',shared:c.shared===true}];
  }finally{session.dispose();}
 }));
 const byId=new Map(meeting);
 return {...value,feedbackNext:notices.next,tasks:[...notices.tasks.map(t=>({...t,feedback_after:feedbackAfter})),...value.tasks.filter(t=>followupVisible(t)&&(t.task_key!=='preparation'||!byId.has(t.case_id)||byId.get(t.case_id)!==null)).map(t=>({...t,page_after:after,meeting:t.task_key==='preparation'?byId.get(t.case_id)||null:null}))]};
}
export async function readFollowupEmployee({rpc,companyId,userId,task}){
 const session=createHrFoundationSession({rpc,companyId,userId});
 try{return (await session.get(task.employee_id)).employee;}finally{session.dispose();}
}
