import React,{useEffect,useRef,useState} from 'react';
import {getAppSupabaseClient} from '../access/appSupabaseClientRegistry.js';
import {MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT} from '../access/moduleAccessClient.js';
import {WORK_PROFILE_EVENT} from '../access/workProfileClient.js';
import './hrDeletionAlerts.css';
export default function HrDeletionAlerts(){
 const [value,setValue]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const epoch=useRef(0),alive=useRef(false),busyRef=useRef(false),user=useRef(null);
 const rpc=async(name,args={})=>{const c=getAppSupabaseClient();if(!c)throw Error('Innloggingen er ikke klar.');const r=await c.rpc(name,args);if(r.error)throw Object.assign(Error(r.error.message),{code:r.error.code});return r.data;};
 const refresh=async()=>{
  const ticket=++epoch.current;setValue(null);setError('');setBusy(true);busyRef.current=true;
  try{if(document.visibilityState==='hidden')return;
   const first=await rpc('hr_deletion_alert_list'),fresh=await rpc('hr_deletion_alert_list');
   if(!fresh.user_id||first.user_id!==fresh.user_id)throw Error('Systemadmintilgangen er endret.');
   if(alive.current&&ticket===epoch.current){user.current=fresh.user_id;setValue(fresh);}
  }catch(e){if(alive.current&&ticket===epoch.current){user.current=null;if(e.code!=='42501')setError('Slettevarsler kunne ikke hentes. Prøv Oppdater senere.');}}
  finally{if(alive.current&&ticket===epoch.current){setBusy(false);busyRef.current=false;}}
 };
 useEffect(()=>{
  alive.current=true;refresh();const events=[WORK_PROFILE_EVENT,MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT,'focus'];
  events.forEach(n=>window.addEventListener(n,refresh));document.addEventListener('visibilitychange',refresh);
  const timer=window.setInterval(()=>{if(!busyRef.current&&document.visibilityState!=='hidden')refresh();},60000);
  return()=>{alive.current=false;epoch.current++;events.forEach(n=>window.removeEventListener(n,refresh));document.removeEventListener('visibilitychange',refresh);window.clearInterval(timer);};
 },[]);
 const acknowledge=async id=>{
  if(busyRef.current)return;const ticket=++epoch.current;busyRef.current=true;setBusy(true);setError('');
  try{const r=await rpc('hr_deletion_alert_ack',{p_receipt_id:id});if(alive.current&&ticket===epoch.current){if(r.user_id!==user.current)throw Error('Tilgangen er endret.');await refresh();}}
  catch(e){if(alive.current&&ticket===epoch.current){setError('Varselet kunne ikke bekreftes.');if(e.code==='42501')setValue(null);}}
  finally{if(alive.current&&ticket===epoch.current){busyRef.current=false;setBusy(false);}}
 };
 return <details className="hr-card hr-deletion-alerts"><summary>HR · slettevarsler{value?.unread?` (${value.unread} uleste)`:''}</summary>
  <p>Kontroller avsluttede arbeidsforhold og slettekvitteringer. Varslene inneholder ingen samtaletekst eller pårørendeopplysninger.</p>
  <button type="button" className="secondary" disabled={busy} onClick={refresh}>Oppdater slettevarsler</button>
  {busy&&<p role="status">Henter slettevarsler …</p>}{error&&<p role="alert">{error}</p>}
  {value?.alerts.length===0&&<p>Ingen slettevarsler.</p>}
  {value?.alerts.map(a=><article key={a.receipt_id}><h4>{a.company_name}</h4><p>Arbeidsforhold avsluttet {new Date(a.requested_at).toLocaleString('nb-NO',{timeZone:'Europe/Oslo'})}.</p>
   <p>{a.purge_state==='complete'?'Registrert innhold og filer er slettet.':'Tilgang sperret. Slettekontroll pågår.'} {a.email_sent?'E-postvarsel sendt.':'E-postvarsel er ikke bekreftet sendt.'}</p>
   <small>Medarbeider-ID: {a.employee_id} · Kvittering: {a.receipt_id}</small>
   {!a.reviewed_at&&<button type="button" className="secondary" disabled={busy} onClick={()=>acknowledge(a.receipt_id)}>Marker varsel som lest</button>}
  </article>)}
  {value?.next&&<button className="secondary" disabled={busy} onClick={async()=>{
   if(busyRef.current)return;const ticket=++epoch.current;busyRef.current=true;setBusy(true);
   try{const r=await rpc('hr_deletion_alert_list',{p_after:value.next});if(alive.current&&ticket===epoch.current){if(r.user_id!==user.current)throw Error('Tilgangen er endret.');setValue(previous=>({...r,alerts:[...previous.alerts,...r.alerts]}));}}
   catch(e){if(alive.current&&ticket===epoch.current){setValue(null);setError('Varslene kunne ikke hentes.');}}
   finally{if(alive.current&&ticket===epoch.current){busyRef.current=false;setBusy(false);}}
  }}>Hent flere slettevarsler</button>}
 </details>;
}
