import {useEffect,useState} from 'react';
import {WORK_PROFILE_EVENT} from '../access/workProfileClient.js';
import {MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT} from '../access/moduleAccessClient.js';
export const SUPPORT_CHANGED_EVENT='proffdok-support-changed';
export function useSupportOverview(client,userId,admin=false,companyId=null){
 const [state,setState]=useState({value:null,loading:true});
 useEffect(()=>{
  let alive=true,version=0;
  async function load(){
   const current=++version;setState({value:null,loading:true});
   if(!client||!userId||document.visibilityState==='hidden'){setState({value:null,loading:false});return;}
   try{
    const {data,error}=await client.rpc('support_overview',{p_admin:admin});
    if(error||data?.user_id!==userId||!data.company_id||companyId&&data.company_id!==companyId||admin&&!data.is_admin)throw Error('Unavailable');
    if(alive&&current===version)setState({value:data,loading:false});
   }catch{if(alive&&current===version)setState({value:null,loading:false});}
  }
  const events=['focus',WORK_PROFILE_EVENT,MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT,SUPPORT_CHANGED_EVENT];
  events.forEach(name=>window.addEventListener(name,load));document.addEventListener('visibilitychange',load);void load();
  return()=>{alive=false;version++;events.forEach(name=>window.removeEventListener(name,load));document.removeEventListener('visibilitychange',load);};
 },[client,userId,admin,companyId]);
 return state.value&&(state.value.user_id!==userId||companyId&&state.value.company_id!==companyId)?{value:null,loading:true}:state;
}
