import { useEffect, useState } from 'react';
import { getAppSupabaseClient } from '../access/appSupabaseClientRegistry.js';
import { MANAGED_ACCESS_EVENT, MODULE_ACCESS_EVENT } from '../access/moduleAccessClient.js';
import { WORK_PROFILE_EVENT } from '../access/workProfileClient.js';
export async function kshmsRpc(name,args={}) {
 const client=getAppSupabaseClient();
 if (!client) throw new Error('Appens innlogging er ikke klar.');
 const {data,error}=await client.rpc(name,args);
 if(error) throw Object.assign(new Error(error.message),{code:error.code});
 return data;
}
export function useKshmsAccess(userId) {
 const [context,setContext]=useState(null);
 useEffect(()=>{
  let active=true, revision=0;
  setContext(null);
  if(!userId)return;
  const refresh=(event)=>{
   const current=++revision;
   // Same contract as Sales' syncWorkProfileScope: a refreshed profile for
   // the same firm must not remount the workspace and discard local input.
   // A real firm change (or missing scope) still hides the old context at once.
   if(event?.type===WORK_PROFILE_EVENT) setContext(previous=>previous?.company_id===event.detail?.active_company_id ? previous : null);
   // The existing managed-access event identifies the affected user. Editing
   // another member's grant cannot change our grant; keep this workspace while
   // rechecking the server. Own/unscoped changes still fail closed immediately.
   if(event?.type===MANAGED_ACCESS_EVENT&&(!event.detail?.userId||event.detail.userId===userId)) setContext(null);
   kshmsRpc('get_kshms_context').then(value=>{if(active && current===revision)setContext(value?.user_id===userId ? value : null);})
    .catch(()=>{if(active && current===revision)setContext(null);});
  };
  refresh();
  const events=[WORK_PROFILE_EVENT,MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT,'focus'];
  events.forEach(e=>window.addEventListener(e,refresh));
  return ()=>{active=false;events.forEach(e=>window.removeEventListener(e,refresh));};
 },[userId]);
 return context?.user_id===userId ? context : null;
}
