import {isRpcConflict} from '../app/rpcErrors.mjs';
import React,{useCallback,useEffect,useRef,useState} from 'react';
import {ShieldCheck} from 'lucide-react';
import {hrRpc} from './hrAccess.js';
import {MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT} from '../access/moduleAccessClient.js';
import {WORK_PROFILE_EVENT} from '../access/workProfileClient.js';
import './hr.css';
import {HR_CONTACT_SAVED_EVENT} from './hrContactReminder.mjs';
const fields=[['address','Adresse','street-address',160],['postal_code','Postnummer','postal-code',20],['city','Poststed','address-level2',80],['relative_name','Pårørendes fulle navn','off',120],['relative_relationship','Relasjon til deg','off',60],['relative_phone','Pårørendes telefon','off',40],['relative_email','Pårørendes e-post','off',254]];
const empty=()=>Object.fromEntries(fields.map(([key])=>[key,'']));
const contactDrafts=new Map();
const remember=(scope,v)=>{contactDrafts.delete(scope);contactDrafts.set(scope,v);if(contactDrafts.size>8)contactDrafts.delete(contactDrafts.keys().next().value);};
export default function PrivateContact({context,employee,initiallyOpen=false}) {
 const companyId=context.company_id,userId=context.user_id,employeeId=employee?.id||null;
 const scopeKey=companyId+':'+userId+':'+(employeeId||'self');
 const [value,setValue]=useState(null),[draft,setDraft]=useState(empty),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const [conflict,setConflict]=useState(false);
 const revision=useRef(0),busyRef=useRef(false),session=useRef(null),valueRef=useRef(null);
 const clear=useCallback(()=>{valueRef.current=null;setValue(null);setDraft(empty());setNotice('');},[]);
 useEffect(()=>{
  let alive=true;
  const scope={companyId,userId,employeeId};session.current=scope;
  const valid=result=>result?.context?.company_id===companyId&&result.context.user_id===userId&&(!employeeId||result.employee?.id===employeeId);
  const refresh=async(preserve=false)=>{
   const prior=preserve?valueRef.current:null;
   const ticket=++revision.current;if(!preserve)clear();setError('');busyRef.current=true;setBusy(true);
   try{
    if(document.visibilityState==='hidden')return;
    const first=await hrRpc('hr_contact_get',{p_company_id:companyId,p_employee_id:employeeId});
    if(!alive||ticket!==revision.current)return;
    if(!valid(first))throw new Error('Arbeidsprofilen er endret.');
    const result=first.available?await hrRpc('hr_contact_get',{p_company_id:companyId,p_employee_id:employeeId}):first;
    if(!valid(result)||first.employee?.revision!==result.employee?.revision||first.revision!==result.revision)throw new Error('Tilgangen eller kontaktprofilen er endret. Hent på nytt.');
    if(alive&&ticket===revision.current){
     const saved=contactDrafts.get(scopeKey);
     const unchanged=saved&&result.available&&saved.employeeId===result.employee?.id&&saved.employeeRevision===result.employee?.revision&&saved.revision===result.revision;
     valueRef.current=result;setValue(result);
     setConflict(false);
     if(unchanged&&saved.dirty)setDraft(saved.data);
     else if(saved?.dirty&&result.available&&saved.employeeId===result.employee?.id){setDraft(saved.data);setConflict(true);setError('Kontaktprofilen eller tilgangen er endret. Kladden er beholdt. Velg lagret kontaktprofil før du skriver videre.');}
     else{contactDrafts.delete(scopeKey);setDraft({...empty(),...result.data});if(prior?.available&&!unchanged)setNotice('Kontaktprofilen eller tilgangen er endret. Se over opplysningene på nytt.');}
    }
   }catch(e){if(alive&&ticket===revision.current){clear();if(e.code==='42501')contactDrafts.delete(scopeKey);setError(e.code==='42501'?'HR-tilgangen er endret. Kontakt firmaadmin.':e.message);}}
   finally{if(alive&&ticket===revision.current){setBusy(false);busyRef.current=false;}}
  };
  refresh();const reset=()=>refresh(false),focus=()=>refresh(document.visibilityState!=='hidden');
  const events=[WORK_PROFILE_EVENT,MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT];
  events.forEach(name=>window.addEventListener(name,reset));window.addEventListener('focus',focus);document.addEventListener('visibilitychange',reset);
  const timer=window.setInterval(()=>{if(!busyRef.current&&document.visibilityState!=='hidden')refresh(true);},60000);
  return()=>{alive=false;revision.current++;session.current=null;window.clearInterval(timer);events.forEach(name=>window.removeEventListener(name,reset));window.removeEventListener('focus',focus);document.removeEventListener('visibilitychange',reset);};
 },[companyId,userId,employeeId,scopeKey,clear]);
 const dirty=Boolean(value?.available&&fields.some(([key])=>draft[key]!==({...empty(),...value.data})[key]));
 useEffect(()=>{if(!dirty)return;const handler=e=>{e.preventDefault();e.returnValue='';};window.addEventListener('beforeunload',handler);return()=>window.removeEventListener('beforeunload',handler);},[dirty]);
 const save=async event=>{
  event.preventDefault();if(busyRef.current||conflict||!value?.available||!value.editable)return;
  const scope=session.current,ticket=++revision.current,current=()=>scope===session.current&&ticket===revision.current;
  setBusy(true);busyRef.current=true;setNotice('');setError('');
  try{
   const result=await hrRpc('hr_contact_save',{p_company_id:companyId,p_employee_id:value.employee.id,p_employee_revision:value.employee.revision,p_contact_revision:value.revision,p_data:draft});
   if(current()){
    if(result?.context?.company_id!==companyId||result.context.user_id!==userId||result.employee?.id!==value.employee.id)throw new Error('Arbeidsprofilen er endret.');
    clear();
    const fresh=await hrRpc('hr_contact_get',{p_company_id:companyId,p_employee_id:value.employee.id});
    if(current()&&fresh?.available&&fresh.context?.company_id===companyId&&fresh.context.user_id===userId&&fresh.employee?.id===value.employee.id&&fresh.employee?.revision===value.employee.revision&&fresh.revision===result.revision){contactDrafts.delete(scopeKey);setConflict(false);valueRef.current=fresh;setValue(fresh);setDraft({...empty(),...fresh.data});setNotice('Kontaktprofilen er lagret.');window.dispatchEvent(new Event(HR_CONTACT_SAVED_EVENT));}
    else if(current())throw new Error('Kontaktprofilen er lagret, men tilgangen er endret. Åpne profilen på nytt.');
   }
  }catch(e){if(current()){clear();if(e.code==='42501')contactDrafts.delete(scopeKey);setError(isRpcConflict(e)?'En annen økt har endret profilen eller tilgangen. Kladden er beholdt. Åpne profilen på nytt.':e.message);}}
  finally{if(current()){setBusy(false);busyRef.current=false;}}
 };
 return <details className="hr-private-contact" open={initiallyOpen||undefined}><summary><ShieldCheck size={18} aria-hidden="true"/>Adresse og nærmeste pårørende</summary>
  <p>Medarbeideren selv, registrert nærmeste leder, firmaadmin og uttrykkelige lesere har tilgang. Pårørende brukes som kontakt ved en ulykke. Bare medarbeideren kan redigere her.</p>
  {busy&&<p role="status">Kontrollerer privat tilgang …</p>}{error&&<p role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}
  {value&&!value.registered&&<p>Firmaadmin må registrere deg som medarbeider først.</p>}
  {value?.registered&&!value.available&&<p>Privat lagring er ikke åpnet ennå. Adresse og pårørende kan fylles ut når HR-lagring er aktivert for dette miljøet. Ingen pårørendeopplysninger lagres nå.</p>}
  {conflict&&value?.available&&<button className="secondary" type="button" disabled={busy} onClick={()=>{if(window.confirm('Vil du forkaste kladden og bruke den lagrede kontaktprofilen?')){contactDrafts.delete(scopeKey);setDraft({...empty(),...value.data});setConflict(false);setError('');}}}>Bruk lagret kontaktprofil</button>}
  {value?.available&&<form onSubmit={save}><fieldset disabled={busy||conflict}><div className="hr-fields">{fields.map(([key,label,autoComplete,maxLength])=><label className="hr-field" key={key}><span>{label}</span><input autoComplete={autoComplete} maxLength={maxLength} type={key.endsWith('phone')?'tel':key.endsWith('email')?'email':'text'} readOnly={!value.editable} value={draft[key]} onChange={e=>{const next={...draft,[key]:e.target.value};setDraft(next);remember(scopeKey,{employeeId:value.employee.id,employeeRevision:value.employee.revision,revision:value.revision,data:next,dirty:fields.some(([k])=>next[k]!==({...empty(),...value.data})[k])});setNotice('');}}/></label>)}</div>
   {value.editable&&<><p className="hr-hint">Bruk kontaktopplysninger personen har avtalt med deg. Lagre før du forlater siden. Feltene er valgfrie. Tomt felt fjerner opplysningen ved lagring.</p><button>Lagre adresse og pårørende</button></>}
  </fieldset></form>}
 </details>;
}
