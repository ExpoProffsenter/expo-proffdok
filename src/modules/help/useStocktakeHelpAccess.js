import {useEffect,useState} from 'react';
import {MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT,rpcWithStoredSession} from '../access/moduleAccessClient.js';
import {WORK_PROFILE_EVENT} from '../access/workProfileClient.js';

// Read only: the existing server context checks both company activation and actor access.
export function useStocktakeHelpAccess(userId){
 const [context,setContext]=useState(null);
 useEffect(()=>{
  let alive=true,revision=0;
  const refresh=async()=>{
   const ticket=++revision;setContext(null);
   if(!userId||document.visibilityState==='hidden')return;
   try{
    const next=await rpcWithStoredSession('stocktake_context');
    if(alive&&ticket===revision&&next?.user_id===userId&&next?.company_id&&next?.enabled===true)setContext(next);
   }catch{/* Missing, disabled or inaccessible context grants no film. */}
  };
  refresh();
  const events=[WORK_PROFILE_EVENT,MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT,'focus'];
  events.forEach(event=>window.addEventListener(event,refresh));document.addEventListener('visibilitychange',refresh);
  return()=>{alive=false;revision++;events.forEach(event=>window.removeEventListener(event,refresh));document.removeEventListener('visibilitychange',refresh);};
 },[userId]);
 return Boolean(userId&&context?.user_id===userId&&context?.company_id&&context?.enabled===true);
}
