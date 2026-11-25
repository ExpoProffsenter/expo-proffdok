import { ROUTINE_CATALOG } from './kshmsCatalog.mjs';

export function routinesBySource(routines) {
 const result=new Map();
 for(const routine of routines) {
  const key=routine.draft?.source_key;
  if(key&&!routine.archived&&!result.has(key))result.set(key,routine);
 }
 return result;
}

export function selectedCatalogRoutines(keys,catalog=ROUTINE_CATALOG) {
 const selected=new Set(keys);
 if([...selected].some(key=>!catalog.some(routine=>routine.key===key)))throw new Error('Utvalget inneholder et ukjent standardutkast. Velg rutinene på nytt.');
 return catalog.filter(routine=>selected.has(routine.key));
}

// Each draft uses the existing, authorized save command. A batch is not atomic:
// confirmed drafts remain saved if a later command fails. Re-read before retry
// so a lost response never causes the same template to be added again.
export async function addLibraryRoutines({companyId,keys,rpc,isCurrent=()=>true,onProgress=()=>{}}) {
 const selected=selectedCatalogRoutines(keys);
 let state,error=null,initialSources=new Map(),initialLoaded=false;
 const read=async()=>{
  const value=await rpc('kshms_get_state',{p_company_id:companyId});
  if(!isCurrent())return null;
  if(value?.context?.company_id!==companyId||!value.context.manage)throw new Error('Tilgangen til firmaets håndbok må kontrolleres på nytt.');
  return value;
 };
 try {
  if(!isCurrent())return {cancelled:true};
  state=await read();
  if(!isCurrent())return {cancelled:true};
  initialSources=routinesBySource(state.routines);
  initialLoaded=true;
  let completed=0;
  onProgress({completed,total:selected.length});
  for(const routine of selected) {
   if(!isCurrent())return {cancelled:true};
   if(!routinesBySource(state.routines).has(routine.key)) {
    const draft=structuredClone(routine);
    const saved=await rpc('kshms_command',{p_company_id:companyId,p_action:'save',p_payload:{id:null,revision:0,draft}});
    if(!isCurrent())return {cancelled:true};
    if(!saved?.id)throw new Error('Kunne ikke bekrefte at rutinekladden ble lagret.');
    state={...state,routines:[{...saved,company_id:companyId,archived:false,draft},...state.routines]};
   }
   onProgress({completed:++completed,total:selected.length});
  }
  state=await read();
 } catch(cause) {
  error=cause;
  if(isCurrent())try {state=await read();if(!initialLoaded)initialSources=routinesBySource(state.routines);}catch { /* Keep only already confirmed saves. */ }
 }
 if(!isCurrent())return {cancelled:true};
 const existing=routinesBySource(state?.routines||[]);
 const confirmedKeys=selected.filter(routine=>existing.has(routine.key)).map(routine=>routine.key);
 const addedCount=confirmedKeys.filter(key=>!initialSources.has(key)).length;
 if(confirmedKeys.length===selected.length)error=null;
 return {state,confirmedKeys,addedCount,skippedCount:confirmedKeys.length-addedCount,error};
}
