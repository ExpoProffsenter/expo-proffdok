import {useEffect,useRef,useState} from 'react';
import {getProCatalogOrderContext} from './proCatalogOrderClient.js';
import {MODULE_ACCESS_EVENT,MANAGED_ACCESS_EVENT} from '../access/moduleAccessClient.js';
import {WORK_PROFILE_EVENT} from '../access/workProfileClient.js';
import {whenAppSupabaseClientRegistered} from '../access/appSupabaseClientRegistry.js';
export function useProCatalogOrderAccess(userId){
 const [state,setState]=useState({context:null,pending:false,error:''}),generation=useRef(0);
 useEffect(()=>{
  let active=true;setState({context:null,pending:Boolean(userId),error:''});
  const refresh=async(event)=>{
   const ticket=++generation.current;
   if(!userId||document.hidden){setState({context:null,pending:false,error:''});return;}
   const clear=[WORK_PROFILE_EVENT,MODULE_ACCESS_EVENT,MANAGED_ACCESS_EVENT].includes(event?.type);
   setState(s=>({...s,context:clear?null:s.context,pending:true,error:''}));
   try{const c=await getProCatalogOrderContext();if(active&&ticket===generation.current)setState({context:c?.user_id===userId?c:null,pending:false,error:''});}
   catch(e){if(active&&ticket===generation.current)setState({context:null,pending:false,error:e.message});}
  };
  const unregister=whenAppSupabaseClientRegistered(()=>{if(userId)refresh();});
  const events=[WORK_PROFILE_EVENT,MODULE_ACCESS_EVENT,MANAGED_ACCESS_EVENT,'focus'];events.forEach(e=>window.addEventListener(e,refresh));document.addEventListener('visibilitychange',refresh);
  return()=>{active=false;++generation.current;unregister();events.forEach(e=>window.removeEventListener(e,refresh));document.removeEventListener('visibilitychange',refresh);};
 },[userId]);
 return {...state,context:state.context?.user_id===userId?state.context:null};
}
