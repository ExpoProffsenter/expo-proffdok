import {useEffect,useState} from 'react';
import {getAppSupabaseClient} from '../access/appSupabaseClientRegistry.js';
import {MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT} from '../access/moduleAccessClient.js';
import {WORK_PROFILE_EVENT} from '../access/workProfileClient.js';
export function useHelpModuleAccess(userId){
 const [access,setAccess]=useState(null);
 useEffect(()=>{
  let alive=true,revision=0;
  const refresh=async()=>{
   const ticket=++revision;setAccess(null);
   if(!userId||document.visibilityState==='hidden')return;
   try{const client=getAppSupabaseClient();if(!client)return;
    const {data,error}=await client.rpc('get_my_module_access');if(error)throw error;
    if(alive&&ticket===revision)setAccess({userId,isSystemAdmin:data?.is_systemadmin===true,isCompanyAdmin:data?.is_firmaadmin===true,moduleKeys:Array.isArray(data?.module_keys)?data.module_keys:[]});
   }catch{if(alive&&ticket===revision)setAccess(null);}
  };
  refresh();const events=[WORK_PROFILE_EVENT,MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT,'focus'];events.forEach(e=>window.addEventListener(e,refresh));document.addEventListener('visibilitychange',refresh);
  return()=>{alive=false;revision++;events.forEach(e=>window.removeEventListener(e,refresh));document.removeEventListener('visibilitychange',refresh);};
 },[userId]);
 return access?.userId===userId?access:null;
}
