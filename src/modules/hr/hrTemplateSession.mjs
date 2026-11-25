import {validateHrTemplate,sameHrTemplate} from './hrConversationTemplates.mjs';
// Separate session: generic templates never flow through employee/content APIs.
export function createHrTemplateSession({rpc,companyId,userId,onClear=()=>{}}) {
 let epoch=0,disposed=false;
 const clear=()=>{epoch++;onClear();};
 const check=(value,ticket)=>{
  if(disposed||ticket!==epoch)throw Error('Malforespørselen er utløpt.');
  if(value?.context?.company_id!==companyId||value.context.user_id!==userId||value.context.administer!==true){clear();throw Error('Firma eller maltilgang er endret.');}
  return value;
 };
 const call=async(name,args={})=>{
  if(disposed)throw Error('Maløkten er avsluttet.');
  const ticket=epoch;
  try{return check(await rpc(name,{...args,p_company_id:companyId}),ticket);}
  catch(e){if(!disposed&&ticket===epoch)clear();throw e;}
 };
 const get=async(id,version=null)=>{
  const ticket=epoch,first=await call('hr_template_get',{p_template_id:id,p_version:version});
  check(first,ticket);
  const fresh=await call('hr_template_get',{p_template_id:id,p_version:version});check(fresh,ticket);
  if(first.template?.id!==id||fresh.template?.id!==id||first.template.revision!==fresh.template.revision||first.version?.revision!==fresh.version?.revision||!sameHrTemplate(first.version?.content,fresh.version?.content)){
   clear();throw Error('Malen er endret. Hent ny utgave.');
  }
  validateHrTemplate(fresh.version.content);return fresh;
 };
 return {
  invalidate:clear,dispose(){disposed=true;clear();},get,
  list(after=null){return call('hr_template_list',{p_after:after});},
  history(id,before=null){return call('hr_template_history',{p_template_id:id,p_before:before});},
  async save(id,revision,content,archived=false){
   validateHrTemplate(content);
   const ticket=epoch;
   const result=await call('hr_template_save',{p_template_id:id,p_revision:revision,p_content:content,p_archived:archived});
   check(result,ticket);
   const fresh=await get(id);check(fresh,ticket);
   if(result.template?.revision!==fresh.template.revision||fresh.template.archived!==archived||!sameHrTemplate(fresh.version.content,content)){
    clear();throw Error('Lagringen kunne ikke bekreftes. Hent malen på nytt.');
   }
   return fresh;
  }
 };
}
