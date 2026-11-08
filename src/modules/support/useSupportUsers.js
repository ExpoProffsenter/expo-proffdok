import {useCallback,useEffect,useRef,useState} from 'react';
import {MANAGED_ACCESS_EVENT} from '../access/moduleAccessClient.js';

// Read-only legacy support directory. Counts refer to profiles' primary firm,
// never grants or workspace memberships. The database still owns authorization.
export const SUPPORT_USER_COLUMNS='id,email,approved,deactivated,company_name,company_role,org_number,address,phone,website,logo_url';
const EMPTY={status:'idle',users:[],error:''};
export function useSupportUsers({client,userId,enabled}){
 const scope=enabled&&userId?String(userId):'';
 const [state,setState]=useState({...EMPTY,scope:''});
 const generation=useRef(0);
 const refresh=useCallback(async()=>{
  if(!scope)return;
  const ticket=++generation.current;setState({...EMPTY,scope,status:'loading'});
  try{
   const {data,error}=await client.from('profiles').select(SUPPORT_USER_COLUMNS).order('created_at',{ascending:false});
   if(ticket!==generation.current)return;
   if(error)throw error;
   if(!Array.isArray(data))throw Error('Ufullstendig svar.');
   setState({scope,status:'ready',users:data,error:''});
  }catch{if(ticket===generation.current)setState({...EMPTY,scope,status:'error',error:'Kunne ikke hente brukeroversikten. Prøv Oppdater supportdata på nytt.'});}
 },[client,scope]);
 useEffect(()=>{
  if(!scope){++generation.current;setState({...EMPTY,scope:''});return;}
  void refresh();
  window.addEventListener(MANAGED_ACCESS_EVENT,refresh);
  return()=>{++generation.current;window.removeEventListener(MANAGED_ACCESS_EVENT,refresh);};
 },[scope,refresh]);
 const visible=scope&&state.scope===scope?state:{...EMPTY,status:scope?'loading':'idle'};
 return {...visible,refresh};
}
