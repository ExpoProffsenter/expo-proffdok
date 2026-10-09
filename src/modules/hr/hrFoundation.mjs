// H1 transport is intentionally detached from navigation and content editors.
// No persistent cache, signed URLs, exports, or sensitive content accepted.
export function createHrFoundationSession({rpc,companyId,userId,onClear=()=>{}}) {
 if (typeof rpc!=='function'||!companyId||!userId) throw new Error('HR-scope mangler.');
 let generation=0,disposed=false;
 const clear=()=>{generation++;onClear();};
 const validate=(value,ticket)=>{
  if(disposed||ticket!==generation) throw new Error('HR-forespørselen er utløpt.');
  if(value?.context?.company_id!==companyId||value.context.user_id!==userId) {
   clear();throw new Error('HR-arbeidsprofilen er endret.');
  }
  return value;
 };
 const call=async(name,args)=>{
  if(disposed) throw new Error('HR-økten er avsluttet.');
  const ticket=generation;
  try {return validate(await rpc(name,{...args,p_company_id:companyId}),ticket);}
  catch(error){if(!disposed&&ticket===generation)clear();throw error;}
 };
 return {
  invalidate:clear,
  dispose(){disposed=true;clear();},
  list(after=null){return call('hr_employee_list',{p_after:after});},
  state(afterUser=null){return call('hr_foundation_state',{p_after_user:afterUser});},
  async get(employeeId){
   const ticket=generation;
   const first=await call('hr_employee_get',{p_employee_id:employeeId});
   if(disposed||ticket!==generation)throw new Error('HR-forespørselen er utløpt.');
   const fresh=await call('hr_employee_get',{p_employee_id:employeeId});
   if(first.employee?.id!==employeeId||fresh.employee?.id!==employeeId||first.employee.revision!==fresh.employee.revision) {
    clear();throw new Error('HR-tilgangen eller ledertilknytningen er endret. Hent på nytt.');
   }
   return validate(fresh,ticket);
  },
  command(action,payload){return call('hr_employee_command',{p_action:action,p_payload:payload});},
  configure({revision,enabled,purpose,legalBasis,reviewOn}){
   return call('hr_foundation_configure',{p_revision:revision,p_enabled:enabled,p_purpose:purpose,p_legal_basis:legalBasis,p_review_on:reviewOn});
  }
 };
}
