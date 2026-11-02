import {useCallback,useEffect,useRef,useState} from 'react';
import {createTimeSession} from './timeTransport.js';
import {TIME_SETTINGS_EVENT} from './timeCore.mjs';
import {WORK_PROFILE_EVENT} from '../access/workProfileClient.js';
import {MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT} from '../access/moduleAccessClient.js';

// A navigation fact is retained during same-scope revalidation, never time data.
// The still-mounted native time workspace owns its drafts and fresh data gates.
export default function usePersonalTimeAccess({context,scope,eligible}){
 const key=eligible?scope:null;
 const valid=Boolean(key&&context&&`${context.user_id}:${context.company_id}`===key);
 const companyId=valid?context.company_id:null,userId=valid?context.user_id:null;
 const [state,setState]=useState(null),refreshRef=useRef(null);
 useEffect(()=>{
  const checking=previous=>({key,listed:previous?.key===key&&previous.listed===true,allowed:false,pending:true,tasks:null,error:''});
  if(!key){setState(null);return;}
  if(!valid){setState(checking);return;}
  let alive=true,epoch=0;
  const session=createTimeSession({company_id:companyId,user_id:userId});
  const refresh=async()=>{
   const ticket=++epoch;session.invalidate();setState(checking);
   if(document.visibilityState==='hidden')return;
   try{
    const tasks=await session.call('time_tasks_get');
    if(alive&&ticket===epoch)setState({key,listed:tasks.enabled===true,allowed:tasks.enabled===true,pending:false,tasks:tasks.enabled===true?tasks:null,error:''});
   }catch(error){if(alive&&ticket===epoch)setState(previous=>({key,listed:error.code!=='42501'&&previous?.key===key&&previous.listed===true,allowed:false,pending:false,tasks:null,error:error.code==='42501'?'':'Kunne ikke kontrollere firmaets timeføring. Prøv igjen.'}));}
  };
  refreshRef.current=refresh;refresh();
  const changed=event=>{if(event.type===TIME_SETTINGS_EVENT&&event.detail?.companyId&&event.detail.companyId!==companyId)return;refresh();};
  const events=['focus',WORK_PROFILE_EVENT,MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT,TIME_SETTINGS_EVENT];
  events.forEach(name=>window.addEventListener(name,changed));document.addEventListener('visibilitychange',changed);
  return()=>{alive=false;epoch++;session.dispose();refreshRef.current=null;events.forEach(name=>window.removeEventListener(name,changed));document.removeEventListener('visibilitychange',changed);};
 },[key,valid,companyId,userId]);
 const retry=useCallback(()=>refreshRef.current?.(),[]);
 return {...(state?.key===key&&key?state:{listed:false,allowed:false,pending:Boolean(key),tasks:null,error:''}),retry};
}
