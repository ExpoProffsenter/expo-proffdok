import React,{useEffect,useRef,useState} from 'react';
import {getMyCompanyProfile,renameMyCompanyDisplayName} from './companyProfileClient.js';
import {getMyWorkProfileState} from '../access/workProfileClient.js';
import {MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT} from '../access/moduleAccessClient.js';

export default function CompanyNameEditor({onSaved}){
 const [profile,setProfile]=useState(null),[name,setName]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const epoch=useRef(0),locked=useRef(false),alive=useRef(true);
 useEffect(()=>{alive.current=true;const clear=()=>{++epoch.current;setProfile(null);setName('');setError('');};
  const hidden=()=>{if(document.visibilityState==='hidden')clear();};
  const events=[MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT];events.forEach(e=>window.addEventListener(e,clear));document.addEventListener('visibilitychange',hidden);
  return()=>{alive.current=false;++epoch.current;events.forEach(e=>window.removeEventListener(e,clear));document.removeEventListener('visibilitychange',hidden);};
 },[]);
 const open=async()=>{if(locked.current)return;locked.current=true;setBusy(true);setError('');setNotice('');const ticket=++epoch.current;
  try{const value=await getMyCompanyProfile();if(!alive.current||ticket!==epoch.current)return;if(!value?.canEdit||!value.companyId)throw Error('Firmaadmin må endre navnet på sitt primærfirma.');setProfile(value);setName(value.companyName);}
  catch(e){if(alive.current&&ticket===epoch.current)setError(e.message);}finally{locked.current=false;if(alive.current)setBusy(false);}
 };
 const save=async()=>{if(locked.current||!profile)return;locked.current=true;setBusy(true);setError('');const ticket=epoch.current;
  try{const fresh=await getMyCompanyProfile();if(!alive.current||ticket!==epoch.current)return;
   if(!fresh?.canEdit||fresh.companyId!==profile.companyId||fresh.companyName!==profile.companyName)throw Error('Firmaet eller navnet er endret. Hent firmanavnet på nytt.');
   const saved=await renameMyCompanyDisplayName({companyId:profile.companyId,expectedName:profile.companyName,name});
   if(!alive.current||ticket!==epoch.current)return;
   if(saved?.companyId!==profile.companyId||saved.companyName!==name.trim())throw Error('Navneendringen kunne ikke bekreftes. Hent firmanavnet på nytt.');
   onSaved?.(saved);setProfile(null);setName('');setNotice('Firmanavnet er lagret. Opprettede avdelinger og tidligere dokumenter beholder sine egne navn.');
   try{await getMyWorkProfileState();}catch{if(alive.current)setNotice('Firmanavnet er lagret. Oppdater siden når annet arbeid er lagret for å hente navnet i arbeidsprofilvelgeren.');}
  }catch(e){if(alive.current&&ticket===epoch.current)setError(e.message+' Ingen automatisk ny lagring er forsøkt. Hent firmanavnet på nytt før du fortsetter.');}
  finally{locked.current=false;if(alive.current)setBusy(false);}
 };
 return <section aria-label="Endre firmanavn" className="item">
  <button type="button" className="secondary" disabled={busy} onClick={open}>{profile?'Hent firmanavnet på nytt':'Endre firmanavn'}</button>
  {profile&&<form onSubmit={e=>{e.preventDefault();void save();}}><p>Du endrer firmaets visningsnavn: <strong>{profile.companyName}</strong>. Firmaets brukere, tilganger og historikk beholder samme tilknytning. Navnet øverst i organisasjonskartet og avdelingsnavn endres separat i Rediger kart.</p>
   <label style={{display:'grid',gap:7,marginBottom:18}}><span>Nytt firmanavn</span><input required minLength={2} maxLength={100} disabled={busy} value={name} onChange={e=>setName(e.target.value)}/></label>
   <button disabled={busy||name.trim()===profile.companyName||name.trim().length<2}>Lagre firmanavn</button> <button type="button" className="secondary" disabled={busy} onClick={()=>{++epoch.current;setProfile(null);setName('');setError('');}}>Avbryt navneendring</button>
  </form>}
  {busy&&<p role="status">Kontrollerer firma og navn …</p>}{error&&<p role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}
 </section>;
}
