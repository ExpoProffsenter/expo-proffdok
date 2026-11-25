const canonical=value=>JSON.stringify(value,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b))):v);
export function progressSession({rpc,companyId,userId}){
 const check=value=>{
  if(value?.context?.company_id!==companyId||value.context.user_id!==userId||!value.context.enabled)throw Error('Arbeidsprofil eller KS/HMS-tilgang er endret.');
  return value;
 };
 const get=async (id,mine=false)=>{
  const first=check(await rpc(mine?'kshms_progress_mine':'kshms_progress_get',{p_company_id:companyId,p_id:id}));
  const second=check(await rpc(mine?'kshms_progress_mine':'kshms_progress_get',{p_company_id:companyId,p_id:id}));
  if(first.record?.id!==id||second.record?.id!==id||first.record.company_id!==companyId||second.record.company_id!==companyId||first.record.revision!==second.record.revision)throw Error('Planen eller tilgangen er endret. Hent planen på nytt.');
  return second;
 };
 return {
  get,
  mine:async(id=null,after=null)=>id?get(id,true):check(await rpc('kshms_progress_mine',{p_company_id:companyId,p_id:null,p_after:after})),
  people:async()=>check(await rpc('kshms_progress_people',{p_company_id:companyId})),
  list:async(archived=false,after=null)=>check(await rpc('kshms_progress_list',{p_company_id:companyId,p_archived:archived,p_after:after})),
  save:async record=>{
   const saved=check(await rpc('kshms_progress_save',{p_company_id:companyId,p_id:record.id,p_revision:record.revision,p_title:record.title,p_address:record.address,p_reference:record.reference,p_plan:record.plan,p_archived:record.archived}));
   if(saved.record?.id!==record.id||saved.record.company_id!==companyId||saved.record.revision!==record.revision+1)throw Error('Lagringen kunne ikke bekreftes. Kladden er beholdt.');
   const fresh=await get(record.id);
   for(const key of ['plan','title','address','reference','archived'])if(canonical(fresh.record[key])!==canonical(saved.record[key]))throw Error('Planen er lagret, men endret på nytt. Kladden er beholdt.');
   if(fresh.record.revision!==saved.record.revision)throw Error('Planen er endret etter lagring. Hent på nytt.');
   return fresh;
  },
 };
}
