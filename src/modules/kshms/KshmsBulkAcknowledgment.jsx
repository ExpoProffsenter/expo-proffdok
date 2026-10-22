import {isRpcConflict} from '../app/rpcErrors.mjs';
import { useEffect, useId, useRef, useState } from 'react';
import { kshmsRpc } from './kshmsAccess.js';
import { BATCH_ACK_STATEMENT, acknowledgmentScope, batchAcknowledgmentVersions, batchVersionKey, verifiedBatchReceipts } from './kshmsBulkAcknowledgment.mjs';
import { acknowledgmentTime } from './kshmsAcknowledgmentTime.mjs';

export default function KshmsBulkAcknowledgment({data,companyId,userId,busy,onBusy,onState,onRead}) {
 const [snapshot,setSnapshot]=useState(null),[checked,setChecked]=useState(false),[saving,setSaving]=useState(false),[feedback,setFeedback]=useState(null);
 const scopeRef=useRef(null),inFlight=useRef(false),confirmationRef=useRef(null),id=useId();
 const pending=batchAcknowledgmentVersions(data,companyId,userId),pendingKey=batchVersionKey(pending);
 const scopeValid=acknowledgmentScope(data,companyId,userId);
 useEffect(()=>{const scope={active:true};scopeRef.current=scope;setSnapshot(null);setChecked(false);setFeedback(null);setSaving(false);return()=>{scope.active=false;if(inFlight.current)onBusy(false);};},[companyId,userId,onBusy]);
 useEffect(()=>{
  if(snapshot&&!saving&&(!scopeValid||batchVersionKey(snapshot)!==pendingKey)){setSnapshot(null);setChecked(false);setFeedback({error:true,message:'Listen over rutineutgaver er endret. Åpne samlet bekreftelse igjen og kontroller den nye listen.'});}
 },[pendingKey,scopeValid,snapshot,saving]);
 useEffect(()=>{
  const target=confirmationRef.current;
  if(!snapshot||!target)return;
  target.focus({preventScroll:true});
  // The sticky app header can also contain several task banners. Keep the
  // exact-list heading visible without changing any other module's scrolling.
  target.style.scrollMarginTop=`${Math.max(90,document.querySelector('header')?.getBoundingClientRect().bottom||0)+16}px`;
  target.scrollIntoView({block:'start'});
 },[snapshot]);
 const reset=()=>{setSnapshot(null);setChecked(false);};
 const open=()=>{if(busy||!pending.length)return;setFeedback(null);setChecked(false);setSnapshot(structuredClone(pending));};
 const confirm=async()=>{
  if(busy||inFlight.current||!checked||!snapshot?.length||!scopeValid||batchVersionKey(snapshot)!==pendingKey)return;
  const ids=snapshot.map(row=>row.id);
  const scope=scopeRef.current,isCurrent=()=>scope?.active&&scopeRef.current===scope;
  if(!isCurrent())return;
  inFlight.current=true;setSaving(true);onBusy(true);setFeedback(null);
  let commandError=null,fresh=null;
  try {
   // A single transaction records the exact editions displayed above. The
   // server checks the actor and current assignments again under its lock.
   try {await kshmsRpc('kshms_acknowledge_batch',{p_company_id:companyId,p_user_id:userId,p_version_ids:ids,p_statement:BATCH_ACK_STATEMENT});}
   catch(error){commandError=error;}
   if(!isCurrent())return;
   try {fresh=await kshmsRpc('kshms_get_state',{p_company_id:companyId});}catch{}
   if(!isCurrent())return;
   if(fresh&&!acknowledgmentScope(fresh,companyId,userId)){
    reset();onState(null);setFeedback({error:true,message:'Arbeidsprofil eller tilgang er endret. Åpne personalhåndboka på nytt.'});return;
   }
   const receipts=verifiedBatchReceipts(fresh,companyId,userId,ids);
   if(fresh)onState(fresh);
   reset();
   if(receipts){
    const times=[...new Set(receipts.map(row=>row.acknowledged_at))];
    setFeedback({error:false,message:`Din egen bekreftelse er kontrollert og registrert på alle ${ids.length} rutineutgavene.${times.length===1?` Tidspunkt: ${acknowledgmentTime(times[0])}.`:' Dato og klokkeslett vises på hver rutineutgave.'}`});
   }else if(isRpcConflict(commandError)){
    setFeedback({error:true,message:'Rutinene eller tildelingene er endret. Kontroller den oppdaterte listen og les nye utgaver før du bekrefter igjen.'});
   }else if(commandError?.code==='42501'){
    if(!fresh)onState(null);
    setFeedback({error:true,message:'Tilgangen eller arbeidsprofilen er endret. Samlet bekreftelse kunne ikke registreres for denne listen.'});
   }else{
    setFeedback({error:true,message:'Vi kunne ikke kontrollere alle bekreftelsene. Last personalhåndboka på nytt og se status på hver rutineutgave før du prøver igjen.'});
   }
  }finally{inFlight.current=false;if(isCurrent()){setSaving(false);onBusy(false);}}
 };
 if(!scopeValid)return null;
 return <section className="ks-card ks-bulk-ack" aria-label="Samlet bekreftelse av egne rutiner">
  <h3>Bekreft alle rutiner ett sted</h3>
  <p>Du kan bekrefte dine tildelte rutiner samlet etter at du har lest og forstått dem. Du kan også åpne og bekrefte én rutine om gangen. Samme mulighet gjelder medarbeider, KS/HMS-ansvarlig og firmaadmin.</p>
  <p>Samlet bekreftelse gjelder alle aktive utgaver som er tildelt deg og mangler din bekreftelse, også utgaver der ny bekreftelse er valgfri. Søket i håndboka begrenser ikke listen. Tidligere bekreftelser beholdes.</p>
  {!snapshot&&<button type="button" disabled={busy||!pending.length} onClick={open}>{pending.length?`Se og bekreft alle ${pending.length} rutineutgaver`:'Alle dine aktive rutineutgaver er bekreftet'}</button>}
  {snapshot&&<div className="ks-selection-review ks-flow-target" ref={confirmationRef} tabIndex={-1} aria-labelledby={`${id}-heading`}>
   <h4 id={`${id}-heading`}>Din bekreftelse gjelder disse {snapshot.length} rutineutgavene</h4>
   <p>Kontroller hele listen. Åpne rutiner du trenger å lese, og spør ansvarlig hvis noe er uklart. Du bekrefter på din egen bruker.</p>
   <ul className="ks-selected-list">{snapshot.map(version=><li key={version.id}><button type="button" className="secondary" disabled={busy} onClick={()=>{reset();onRead(version);}}>{version.content.title} · versjon {version.number}</button></li>)}</ul>
   <p className="ks-confirmation">{BATCH_ACK_STATEMENT}</p>
   <label className="ks-check" htmlFor={`${id}-consent`}><input id={`${id}-consent`} type="checkbox" checked={checked} disabled={busy} onChange={event=>setChecked(event.target.checked)}/>Jeg bekrefter at jeg har lest og forstått alle rutineutgavene i listen over.</label>
   <div className="ks-actions"><button type="button" disabled={busy||!checked} onClick={confirm}>{saving?'Lagrer alle bekreftelsene …':`Bekreft alle ${snapshot.length} rutineutgaver`}</button><button type="button" className="secondary" disabled={busy} onClick={reset}>Avbryt</button></div>
  </div>}
  {feedback&&<p className={feedback.error?'ks-error':'ks-notice'} role={feedback.error?'alert':'status'}>{feedback.message}</p>}
 </section>;
}
