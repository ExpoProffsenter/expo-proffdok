import React,{useEffect,useRef,useState} from 'react';
import {kshmsRpc} from '../kshms/kshmsAccess.js';
import {MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT,publishManagedAccessChange} from './moduleAccessClient.js';
import {WORK_PROFILE_EVENT} from './workProfileClient.js';
import './PeopleModuleAccess.css';

// Administrative metadata only. No employee records or personal HR grant.
export default function PeopleModuleAccess({companyId,userId=null}) {
 const [saved,setSaved]=useState(null),[draft,setDraft]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
 const revision=useRef(0),ownSignal=useRef(false);
 const read=async()=>{
  const ticket=++revision.current;setSaved(null);setDraft(null);setError('');setMessage('');
  if(!companyId)return;
  try{
   const value=await kshmsRpc(userId?'people_modules_user_get':'people_modules_company_get',{p_company_id:companyId,...(userId?{p_user_id:userId}:{})});
   if(ticket!==revision.current)return;
   if(value?.company_id!==companyId||(userId&&value.user_id!==userId))throw Error('Arbeidsfirma eller bruker er endret. Hent på nytt.');
   setSaved(value);setDraft(value);
  }catch(e){if(ticket===revision.current)setError(e.message);}
 };
 useEffect(()=>{
  read();const events=[MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT,WORK_PROFILE_EVENT,'focus'];
  const clear=(event)=>{
   if(ownSignal.current)return; // The successful response is already fresh; keep its confirmation.
   // A saved grant on another card changes neither this target nor its license.
   // Keep independent drafts/results while the modal saves several user cards.
   if(event?.type===MANAGED_ACCESS_EVENT&&event.detail?.source==='people-module-access'&&event.detail.userId&&event.detail.userId!==userId)return;
   if(document.visibilityState==='hidden'){revision.current++;setSaved(null);setDraft(null);}else read();
  };
  events.forEach(e=>window.addEventListener(e,clear));document.addEventListener('visibilitychange',clear);
  return()=>{revision.current++;events.forEach(e=>window.removeEventListener(e,clear));document.removeEventListener('visibilitychange',clear);};
 },[companyId,userId]);
 const dirty=saved&&draft&&(['kshms','hr',...(userId?['kshms_role']:[])].some(k=>saved[k]!==draft[k]));
 const save=async()=>{
  if(!dirty||busy)return;const ticket=++revision.current;setBusy(true);setError('');setMessage('');
  try{
   const value=await kshmsRpc(userId?'people_modules_user_set':'people_modules_company_set',{p_company_id:companyId,p_expected:saved,p_kshms:draft.kshms,p_hr:draft.hr,...(userId?{p_user_id:userId,p_kshms_role:draft.kshms_role}:{})});
   if(ticket!==revision.current)return;
   if(value?.company_id!==companyId||(userId&&value.user_id!==userId))throw Error('Arbeidsfirma eller bruker er endret. Hent på nytt.');
   setSaved(value);setDraft(value);setMessage('KS/HMS- og HR-tilgang lagret.');
   ownSignal.current=true;
   try{publishManagedAccessChange({source:'people-module-access',companyId,userId:userId||''});}finally{ownSignal.current=false;}
  }catch(e){if(ticket===revision.current)setError(e.message);}finally{setBusy(false);}
 };
 const company=saved?.company||saved;
 return <section className="people-module-access" style={{marginTop:12,padding:12,border:'1px solid #cfe0e4',borderRadius:10,background:'#f8fcfc'}}>
  <b>{userId?'KS/HMS og HR':'Firmaets KS/HMS- og HR-avtale'}</b>
  <p className="note">{userId?'Firmaet må ha aktivert modulen først. HR gir adgang til modulen; innsyn krever også egen medarbeider, nærmeste leder, firmaadmin eller uttrykkelig lesetilgang.':'Systemadministrator aktiverer modulene firmaet har avtalt å kjøpe. Dette registrerer tilgang og starter ingen betaling. Deretter velges brukertilgang på kortene nedenfor.'}</p>
  {!companyId?<p className="note">Velg et gyldig firma først.</p>:!draft&&!error?<p role="status">Henter modulavtale og tilgang …</p>:null}
  {draft?<div style={{display:'grid',gap:10}}>
   {['kshms','hr'].map(key=>{
    const inherited=userId&&saved.firmaadmin;const licensed=!userId||company[key];
    return <label key={key} style={{display:'flex',alignItems:'flex-start',gap:10,minHeight:44}}>
     <input type="checkbox" checked={Boolean(inherited?licensed:draft[key])} disabled={busy||Boolean(inherited)||(!licensed&&!draft[key])} onChange={e=>setDraft(d=>({...d,[key]:e.target.checked}))}/>
     <span><b>{key==='hr'?'HR':'KS/HMS'}</b><small style={{display:'block'}}>{!licensed?'Ikke aktivert på firmaet. Kontakt systemadministrator.':inherited?'Firmaadmin har tilgang gjennom firmarollen.':userId?'Individuelt tildelt modultilgang.':dirty?'Endringen må lagres.':saved[key]?'Aktivert på firmaet.':'Ikke aktivert på firmaet.'}</small></span>
    </label>;
   })}
   {userId&&draft.kshms&&!saved.firmaadmin?<label className="people-module-role">KS/HMS-rolle<select aria-label="KS/HMS-rolle" value={draft.kshms_role} disabled={busy||!company.kshms} onChange={e=>setDraft(d=>({...d,kshms_role:e.target.value}))}><option value="reader">Medarbeider – lese og utføre</option><option value="responsible">KS/HMS-ansvarlig – forvalte og godkjenne</option></select></label>:null}
   {!(userId&&saved.firmaadmin)?<button type="button" data-people-module-save={userId?'user':'company'} data-access-saving={busy?'true':'false'} disabled={!dirty||busy} onClick={save}>{busy?'Lagrer …':userId?'Lagre KS/HMS- og HR-tilgang':'Lagre firmaets moduler'}</button>:null}
  </div>:null}
  {error?<div><p role="alert">{error}</p><button type="button" className="secondary" disabled={busy} onClick={read}>Hent modultilgang på nytt</button></div>:null}
  {message?<p role="status">{message}</p>:null}
 </section>;
}
