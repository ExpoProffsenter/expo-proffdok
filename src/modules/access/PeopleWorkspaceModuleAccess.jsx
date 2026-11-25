import React,{useEffect,useRef,useState} from 'react';
import PeopleModuleAccess from './PeopleModuleAccess.jsx';
import {listManagedWorkProfiles,WORK_PROFILE_EVENT} from './workProfileClient.js';
import {MANAGED_ACCESS_EVENT} from './moduleAccessClient.js';

export default function PeopleWorkspaceModuleAccess({companyId,userId}){
 const [snapshot,setSnapshot]=useState(null),[selection,setSelection]=useState(null),[error,setError]=useState('');
 const host=useRef(null),ticket=useRef(0);
 useEffect(()=>{
  const read=async()=>{
   const current=++ticket.current;setSnapshot(null);setError('');
   if(document.visibilityState==='hidden')return;
   try{
    const value=await listManagedWorkProfiles();if(current!==ticket.current)return;
    if(!value.is_systemadmin)throw Error('Systemadmintilgangen er endret. Oppdater brukerlisten.');
    const user=value.users.find(u=>u.user_id===userId);
    const ids=new Set(user?.workspace_company_ids||[]);
    const companies=value.companies.filter(c=>ids.has(c.company_id));
    setSnapshot({userId,companyId,companies});
   }catch(e){if(current===ticket.current)setError(e.message||'Kunne ikke hente arbeidsfirma. Prøv igjen.');}
  };
  const refresh=e=>{
   // A module grant does not change workspace membership or this selector.
   if(e?.detail?.source==='people-module-access')return;
   read();
  };
  read();const events=[MANAGED_ACCESS_EVENT,WORK_PROFILE_EVENT,'focus'];
  events.forEach(e=>window.addEventListener(e,refresh));document.addEventListener('visibilitychange',refresh);
  return()=>{ticket.current++;events.forEach(e=>window.removeEventListener(e,refresh));document.removeEventListener('visibilitychange',refresh);};
 },[companyId,userId]);
 const current=snapshot?.userId===userId&&snapshot.companyId===companyId?snapshot:null;
 const companies=current?.companies||[];
 const selected=selection?.userId===userId&&companies.some(c=>c.company_id===selection.id)?selection.id:
  companies.some(c=>c.company_id===companyId)?companyId:companies[0]?.company_id||companyId;
 const choose=e=>{
  const id=e.target.value;if(id===selected||!companies.some(c=>c.company_id===id))return;
  const save=host.current?.querySelector('[data-people-module-save="user"]');
  if(save?.getAttribute('data-access-saving')==='true'){setError('Vent til tilgangen er ferdig lagret før du bytter firma.');return;}
  if(save&&!save.disabled&&!window.confirm('Du har ulagrede KS/HMS- eller HR-valg. Forkaste disse valgene og bytte firma?'))return;
  setError('');setSelection({userId,id});
 };
 return <div ref={host} className="people-workspace-access">
  <p className="note">KS/HMS og HR gjelder firmaet du velger her. Dette flytter ikke brukeren eller samtalene. Andre tilganger på brukerkortet beholder sitt firmascope.</p>
  {companies.length>1&&<label>Firma for KS/HMS og HR<select aria-label="Firma for KS/HMS og HR" value={selected} onChange={choose}>{companies.map(c=><option key={c.company_id} value={c.company_id}>{c.company_name}</option>)}</select></label>}
  {!current&&!error?<p role="status">Henter arbeidsfirma …</p>:null}
  {current&&<PeopleModuleAccess key={userId+':'+selected} companyId={selected} userId={userId}/>}
  {error?<p role="alert">{error}</p>:null}
 </div>;
}
