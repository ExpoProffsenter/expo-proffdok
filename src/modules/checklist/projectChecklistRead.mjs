// Support is an explicit read route, never a replacement for ordinary writes.
export function projectChecklistReadRpc(rpc,{supportReadOnly,companyId,projectId}) {
 if(!supportReadOnly)return rpc;
 return (name,args={})=>{
  if(name==='project_checklist_state'&&args.p_company_id===companyId&&args.p_project_id===projectId)
   return rpc('project_checklist_support_state',{p_project_id:projectId});
  if(name==='work_profile_company_profile'&&args.p_company_id===companyId)return rpc(name,args);
  throw Error('Supportmodus tillater bare lesing av dette prosjektet.');
 };
}
