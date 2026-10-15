import React,{useEffect,useRef,useState} from 'react';
import {Bell,ArrowRight} from 'lucide-react';
import {hrRpc} from './hrAccess.js';
import {HR_CONTACT_SAVED_EVENT,readContactReminder} from './hrContactReminder.mjs';
import {MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT} from '../access/moduleAccessClient.js';
import {WORK_PROFILE_EVENT} from '../access/workProfileClient.js';
import DeviationDialog from '../deviations/DeviationDialog.jsx';
import PrivateContact from './PrivateContact.jsx';
import './hrContactReminder.css';

export default function HrContactReminder({context,userId}){
 const companyId=userId&&context?.user_id===userId&&context.available&&context.enabled?context.company_id:null;
 const scope=companyId&&userId?companyId+':'+userId:null;
 const [value,setValue]=useState(null),[opened,setOpened]=useState(null);
 const epoch=useRef(0);
 useEffect(()=>{
  let alive=true,busy=false;
  setValue(null);setOpened(null);
  const refresh=async(clear=true)=>{
   const ticket=++epoch.current;
   if(clear)setValue(null);
   if(!scope||document.visibilityState==='hidden')return;
   busy=true;
   try{
    const result=await readContactReminder({rpc:hrRpc,companyId,userId});
    if(alive&&ticket===epoch.current)setValue({...result,scope});
   }catch{if(alive&&ticket===epoch.current){setValue(null);setOpened(null);}}
   finally{if(alive&&ticket===epoch.current)busy=false;}
  };
  refresh();
  const invalidate=()=>refresh(),saved=()=>refresh(false);
  const events=[WORK_PROFILE_EVENT,MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT,'focus'];
  events.forEach(name=>window.addEventListener(name,invalidate));
  document.addEventListener('visibilitychange',invalidate);window.addEventListener(HR_CONTACT_SAVED_EVENT,saved);
  const timer=window.setInterval(()=>{if(!busy)refresh(false);},60000);
  return()=>{alive=false;++epoch.current;window.clearInterval(timer);events.forEach(name=>window.removeEventListener(name,invalidate));document.removeEventListener('visibilitychange',invalidate);window.removeEventListener(HR_CONTACT_SAVED_EVENT,saved);};
 },[scope,companyId,userId]);
 if(!scope||value?.scope!==scope||!value.available)return null;
 return <>
  {value.missing.length>0&&<section className="hr-contact-reminder" aria-label="Påminnelse om kontaktopplysninger">
   <Bell aria-hidden="true"/><div><h2>Fullfør kontaktopplysningene dine</h2><p>Registrer adressen din og hvem vi kan kontakte ved en ulykke.</p><p className="hr-contact-missing">Mangler: {value.missing.join(', ')}.</p></div>
   <button type="button" onClick={()=>setOpened(scope)}>Fyll ut kontaktopplysninger <ArrowRight size={17} aria-hidden="true"/></button>
  </section>}
  {opened===scope&&<DeviationDialog title="Adresse og nærmeste pårørende" context={context.company_name||'Min side'} onClose={()=>setOpened(null)} closeLabel="Lukk kontaktopplysninger"><div className="hr-module"><PrivateContact context={context} initiallyOpen/></div></DeviationDialog>}
 </>;
}
