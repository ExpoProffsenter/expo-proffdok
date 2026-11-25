import {useEffect,useRef,useState} from 'react';
import {getProjectPortalAccessStatus} from './portalSupabase.js';

// Read-only status, separate from explicit code creation/rotation and sharing.
export function usePortalAccessStatus({client,userId,projectId,scopeKey='',enabled,onRecords}) {
 const key=JSON.stringify([userId,projectId,scopeKey]);
 const [state,setState]=useState({key:'',status:'idle'});
 const [revision,setRevision]=useState(0);
 const sequence=useRef(0);
 useEffect(()=>{
  if(!enabled||!userId||!projectId)return;
  let active=true;
  const request=++sequence.current;
  const current=()=>active&&sequence.current===request;
  setState({key,status:'loading'});
  getProjectPortalAccessStatus(client,{projectId}).then(status=>{
   if(!current())return;
   if(!status?.ok)throw new Error('Portalstatus kunne ikke hentes.');
   const record=(role,value={})=>({role,active:!!value.active,code:value.active?'stored':'',createdAt:value.created_at||'',validUntil:value.valid_until||status.valid_until||'',accessPolicy:status.access_policy||'active_project_plus_locked_30_days',lockedGraceDays:Number(status.locked_grace_days||30)});
   onRecords({kunde:record('kunde',status.kunde||{}),underleverandor:record('underleverandor',status.underleverandor||{})});
   setState({key,status:'ready'});
  }).catch(()=>{if(current())setState({key,status:'error'});});
  return()=>{active=false;};
 },[client,userId,projectId,scopeKey,enabled,key,revision,onRecords]);
 return {
  status:!enabled||!userId||!projectId?'idle':state.key===key?state.status:'loading',
  retry:()=>{sequence.current++;setState({key,status:'loading'});setRevision(value=>value+1);}
 };
}
