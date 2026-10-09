import {useEffect,useState} from 'react';
import {hrRpc} from '../hr/hrAccess.js';
import {MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT} from '../access/moduleAccessClient.js';
import {WORK_PROFILE_EVENT} from '../access/workProfileClient.js';
export function usePersonalAccess(userId){
 const [context,setContext]=useState(null);
 useEffect(()=>{
  let alive=true,revision=0;
  const refresh=async()=>{
   const ticket=++revision;setContext(null);
   if(!userId||document.visibilityState==='hidden')return;
   try{const value=await hrRpc('get_my_personal_context');
    if(alive&&ticket===revision)setContext(value?.user_id===userId&&value.company_id?value:null);
   }catch{if(alive&&ticket===revision)setContext(null);}
  };
  refresh();const events=[WORK_PROFILE_EVENT,MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT,'focus'];
  events.forEach(name=>window.addEventListener(name,refresh));document.addEventListener('visibilitychange',refresh);
  return()=>{alive=false;revision++;events.forEach(name=>window.removeEventListener(name,refresh));document.removeEventListener('visibilitychange',refresh);};
 },[userId]);
 return context?.user_id===userId?context:null;
}
export function personalRights(personal,kshms,hr,userId){
 const valid=Boolean(personal?.user_id===userId&&personal.company_id);
 const same=value=>valid&&value?.user_id===userId&&value.company_id===personal.company_id;
 return {enabled:valid&&personal.personal_page===true,kshms:Boolean(same(kshms)&&personal.company_kshms===true&&kshms.enabled),
  hr:Boolean(same(hr)&&personal.company_hr===true&&hr.available),hrManagement:Boolean(same(hr)&&personal.company_hr===true&&hr.available&&personal.hr_management===true)};
}
