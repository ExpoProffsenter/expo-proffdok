import {useEffect,useState} from 'react';
import {getAppSupabaseClient} from '../access/appSupabaseClientRegistry.js';
import {MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT} from '../access/moduleAccessClient.js';
import {WORK_PROFILE_EVENT} from '../access/workProfileClient.js';

export async function hrRpc(name,args={}) {
 const client=getAppSupabaseClient();
 if(!client)throw new Error('Innloggingen er ikke klar.');
 const {data,error}=await client.rpc(name,args);
 if(error)throw Object.assign(new Error(error.message),{code:error.code});
 return data;
}
export function useHrAccess(userId) {
 const [context,setContext]=useState(null);
 useEffect(()=>{
  let alive=true,revision=0;
  const refresh=()=>{
   const ticket=++revision;setContext(null);
   if(!userId||document.visibilityState==='hidden')return;
   hrRpc('get_hr_context').then(value=>{
    if(alive&&ticket===revision)setContext(value?.user_id===userId&&value.company_id&&value.available?value:null);
   }).catch(()=>{if(alive&&ticket===revision)setContext(null);});
  };
  refresh();
  const events=[WORK_PROFILE_EVENT,MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT,'focus'];
  events.forEach(name=>window.addEventListener(name,refresh));
  document.addEventListener('visibilitychange',refresh);
  return ()=>{alive=false;revision++;events.forEach(name=>window.removeEventListener(name,refresh));document.removeEventListener('visibilitychange',refresh);};
 },[userId]);
 return context?.user_id===userId?context:null;
}
