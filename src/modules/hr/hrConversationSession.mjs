import {sameHrTemplate} from './hrConversationTemplates.mjs';
export const CONVERSATION_STAGES={preparation:'Medarbeideren forbereder seg',meeting:'Felles møte',awaiting:'Venter på begge bekreftelser',completed:'Ferdig'};
export function createConversationSession({rpc,companyId,userId,employeeId,onDenied=()=>{}}){
 let epoch=0,disposed=false;
 const check=(v,ticket)=>{
  if(disposed||ticket!==epoch)throw Error('Samtaleforespørselen er utløpt.');
  if(v?.context?.company_id!==companyId||v.context.user_id!==userId||v.employee&&v.employee.id!==employeeId){
   epoch++;onDenied();throw Error('Firma eller medarbeidertilgang er endret.');
  }return v;
 };
 const call=async(name,args={})=>{
  if(disposed)throw Error('Samtaleøkten er avsluttet.');const ticket=epoch;
  try{
   const v=check(await rpc(name,{...args,p_company_id:companyId,p_employee_id:employeeId}),ticket);
   if(name==='hr_conversation_list'&&(!Array.isArray(v.conversations)||v.employee?.id!==employeeId)
    ||name==='hr_conversation_templates'&&!Array.isArray(v.templates)
    ||['hr_conversation_get','hr_conversation_start','hr_conversation_command'].includes(name)&&(
     !Number.isInteger(v.current_revision)||v.current_revision<1||!Number.isInteger(v.conversation?.revision)
     ||!Array.isArray(v.conversation?.actions)||!Array.isArray(v.conversation?.template?.questions)||!v.permissions||v.employee?.id!==employeeId))
    throw Error('Serverens samtalesvar kunne ikke bekreftes. Hent på nytt.');
   return v;
  }
  catch(e){if(!disposed&&ticket===epoch&&e.code==='42501'){epoch++;onDenied();}throw e;}
 };
 const get=async(id,version=null)=>{
  const ticket=epoch,args={p_conversation_id:id,p_version:version};
  const first=await call('hr_conversation_get',args),fresh=await call('hr_conversation_get',args);check(fresh,ticket);
  if(first.conversation?.id!==id||fresh.conversation?.id!==id||first.current_revision!==fresh.current_revision
   ||first.employee?.revision!==fresh.employee?.revision||!sameHrTemplate(first.conversation,fresh.conversation)
   ||!sameHrTemplate(first.permissions,fresh.permissions))throw Error('Samtalen eller tilgangen er endret. Hent ny utgave.');
  return fresh;
 };
 const readback=async(result)=>{
  const fresh=await get(result.conversation.id);
  if(result.current_revision!==fresh.current_revision||!sameHrTemplate(result.conversation,fresh.conversation))
   throw Error('Lagringen er sendt, men kunne ikke bekreftes. Hent lagret samtale før du prøver igjen.');
  return fresh;
 };
 return {get,invalidate(){epoch++;},dispose(){disposed=true;epoch++;},
  list(after=null){return call('hr_conversation_list',{p_after:after});},
  templates(){return call('hr_conversation_templates');},
  async start({id,employeeRevision,templateId,templateRevision,on}){
   return readback(await call('hr_conversation_start',{p_conversation_id:id,p_employee_revision:employeeRevision,
    p_template_id:templateId,p_template_revision:templateRevision,p_on:on}));
  },
  async command(value,action,data={}){
   if(value.historical)throw Error('En historisk utgave kan bare leses.');
   return readback(await call('hr_conversation_command',{p_conversation_id:value.conversation.id,
    p_employee_revision:value.employee.revision,p_revision:value.current_revision,p_action:action,p_data:data}));
  }
 };
}
