import {useEffect,useId,useRef,useState} from 'react';
import {kshmsRpc} from './kshmsAccess.js';
import {ACK_STATEMENT} from './kshmsCatalog.mjs';
import {COMPANY_APPROVAL_STATEMENT,pendingCompanyPublications,publicationScope,publicationListKey,publicationSnapshotCurrent,verifiedCompanyPublications} from './kshmsBulkPublication.mjs';
import {acknowledgmentTime} from './kshmsAcknowledgmentTime.mjs';

export default function KshmsBulkPublication({data,companyId,userId,busy,dirty,onBusy,onState,onPublished,onEdit,ContentComponent}){
 const [open,setOpen]=useState(false),[selected,setSelected]=useState([]),[snapshot,setSnapshot]=useState(null),[assessment,setAssessment]=useState(''),[consent,setConsent]=useState(false),[requiresAck,setRequiresAck]=useState(true),[confirmSelf,setConfirmSelf]=useState(false),[feedback,setFeedback]=useState(null);
 const scopeRef=useRef(null),inFlight=useRef(false),reviewRef=useRef(null),id=useId();
 const waiting=pendingCompanyPublications(data,companyId,userId),listKey=publicationListKey(waiting),allowed=publicationScope(data,companyId,userId);
 useEffect(()=>{const scope={active:true};scopeRef.current=scope;setOpen(false);setSnapshot(null);setSelected([]);setAssessment('');setConsent(false);setRequiresAck(true);setConfirmSelf(false);setFeedback(null);return()=>{scope.active=false;if(inFlight.current)onBusy(false);};},[companyId,userId,onBusy]);
 useEffect(()=>{
  if(snapshot&&!inFlight.current&&(dirty||!publicationSnapshotCurrent(snapshot,data,companyId,userId))){setSnapshot(null);setConsent(false);setConfirmSelf(false);setFeedback({error:true,message:'Et valgt utkast eller tilgangen er endret. Vurder den oppdaterte teksten før du godkjenner. Vurderingsfeltet ditt er beholdt.'});}
 },[snapshot,listKey,allowed,dirty,data,companyId,userId]);
 useEffect(()=>{const target=reviewRef.current;if(snapshot&&target){target.focus({preventScroll:true});target.style.scrollMarginTop=`${Math.max(90,document.querySelector('header')?.getBoundingClientRect().bottom||0)+16}px`;target.scrollIntoView({block:'start'});}},[snapshot]);
 const currentScope=()=>{const scope=scopeRef.current;return()=>scope?.active&&scopeRef.current===scope;};
 const begin=async()=>{
  if(busy||dirty||inFlight.current||!allowed||!data.settings)return;
  const isCurrent=currentScope();inFlight.current=true;onBusy(true);setFeedback(null);
  try{const fresh=await kshmsRpc('kshms_get_state',{p_company_id:companyId});if(!isCurrent())return;if(!publicationScope(fresh,companyId,userId)){onState(null);return;}onState(fresh);setOpen(true);setSnapshot(null);setConsent(false);setRequiresAck(true);setConfirmSelf(false);setSelected(previous=>previous.filter(key=>pendingCompanyPublications(fresh,companyId,userId).some(row=>row.id===key)));}
  catch(error){if(isCurrent()){if(error.code==='42501')onState(null);else setFeedback({error:true,message:'Kunne ikke hente oppdaterte utkast. Ingen rutiner er godkjent. Prøv igjen.'});}}
  finally{inFlight.current=false;if(isCurrent())onBusy(false);}
 };
 const review=()=>{if(busy||dirty)return;const rows=waiting.filter(row=>selected.includes(row.id));if(!rows.length)return;setSnapshot(structuredClone(rows));setConsent(false);setRequiresAck(true);setConfirmSelf(false);setFeedback(null);};
 const publish=async()=>{
  if(busy||dirty||inFlight.current||!consent||!snapshot||assessment.trim().length<5||assessment.trim().length>1500||!publicationSnapshotCurrent(snapshot,data,companyId,userId))return;
  const isCurrent=currentScope(),frozen=structuredClone(snapshot),reason=assessment.trim(),own=confirmSelf,required=requiresAck;
  inFlight.current=true;onBusy(true);setFeedback(null);let error=null,fresh=null;
  try{
   try{await kshmsRpc('kshms_publish_batch',{p_company_id:companyId,p_user_id:userId,p_routines:frozen.map(({id,revision,draft,next_number,previous_version_id})=>({id,revision,draft,next_number,previous_version_id})),p_assessment:reason,p_approval_statement:COMPANY_APPROVAL_STATEMENT,p_requires_ack:required,p_acknowledge_self:own,p_self_statement:own?ACK_STATEMENT:null});}catch(e){error=e;}
   if(!isCurrent())return;
   try{fresh=await kshmsRpc('kshms_get_state',{p_company_id:companyId});}catch{}
   if(!isCurrent())return;
   if(fresh&&!publicationScope(fresh,companyId,userId)){onState(null);return;}
   const versions=verifiedCompanyPublications({data:fresh,companyId,userId,snapshot:frozen,assessment:reason,requiresAck:required,selfAcknowledgment:own});
   if(fresh)onState(fresh);setSnapshot(null);setConsent(false);setConfirmSelf(false);
   if(versions){setSelected([]);setOpen(false);setAssessment('');onPublished(frozen.map(row=>row.id));setFeedback({error:false,message:`${versions.length} rutiner er godkjent og publisert. Hver utgave har din godkjenning, vurderingen og tidspunktet ${acknowledgmentTime(versions[0].published_at)}.${own?' Din egen lesebekreftelse er også registrert på hver utgave.':' Ansatte bekrefter sin egen gjennomgang i «Les og bekreft».'}`});}
   else if(error?.code==='40001')setFeedback({error:true,message:'Et valgt utkast er endret eller publisert av noen andre. Ingen delvis publisering fra denne handlingen. Vurder den oppdaterte teksten og godkjenn på nytt. Vurderingsfeltet ditt er beholdt.'});
   else if(error?.code==='42501'){if(!fresh)onState(null);setFeedback({error:true,message:'Arbeidsprofil eller rett til godkjenning er endret. Åpne håndboka på nytt.'});}
   else setFeedback({error:true,message:'Vi kunne ikke kontrollere alle nye utgaver. Oppdater håndboka før du prøver igjen. Vurderingsfeltet ditt er beholdt.'});
  }finally{inFlight.current=false;if(isCurrent())onBusy(false);}
 };
 if(!allowed)return null;
 return <section className="ks-card ks-bulk-publication" aria-label="Samlet firmagodkjenning">
  <h3>Godkjenn flere rutiner</h3>
  <details className="module-guide ux-reference"><summary>Vis veiledning for samlet godkjenning</summary><p>Firmaadmin og KS/HMS-ansvarlig kan godkjenne flere ferdige rutiner samlet. Les og tilpass teksten først. Velg bare utkast som er klare for firmaets arbeid. Hver rutine får sin egen godkjente utgave.</p></details>
  {dirty&&<p className="ks-notice">Du har ulagret rutinetekst. Lagre utkastet, eller fjern det ulagrede utkastet på enheten, før samlet godkjenning. Ulagret tekst blir ikke publisert her.</p>}
  {!data.settings&&<p className="ks-notice">Fullfør «Oppstart og tilgang» før rutiner godkjennes for firmaet.</p>}
  {!open&&<button type="button" disabled={busy||dirty||!data.settings||!waiting.length} onClick={begin}>{waiting.length?`Godkjenn flere rutiner (${waiting.length})`:'Alle lagrede rutiner er godkjent'}</button>}
  {open&&!snapshot&&<>
   <h4>Velg rutinene som er klare</h4><p>{waiting.length} lagrede utkast venter. «Velg alle som venter» velger hele listen. Arkiverte og allerede godkjente rutiner inngår ikke.</p>
   <div className="ks-actions"><button type="button" className="secondary" disabled={busy||dirty||!waiting.length} onClick={()=>setSelected(waiting.map(row=>row.id))}>Velg alle som venter ({waiting.length})</button><button type="button" className="secondary" disabled={busy||!selected.length} onClick={()=>setSelected([])}>Fjern valg</button></div>
   <ul className="ks-bulk-publication-list">{waiting.map(row=><li key={row.id}><label className="ks-check"><input type="checkbox" disabled={busy||dirty} checked={selected.includes(row.id)} onChange={e=>setSelected(previous=>e.target.checked?[...new Set([...previous,row.id])]:previous.filter(key=>key!==row.id))}/>{row.draft.title} · ny versjon {row.next_number}</label><details><summary>Les lagret tekst</summary><ContentComponent content={row.draft} draft/></details><button type="button" className="secondary" disabled={busy||dirty} onClick={()=>{setOpen(false);setSnapshot(null);setConsent(false);onEdit(row);}}>Rediger før godkjenning</button></li>)}</ul>
   <div className="ks-actions"><button type="button" disabled={busy||dirty||!waiting.some(row=>selected.includes(row.id))} onClick={review}>Se over {waiting.filter(row=>selected.includes(row.id)).length} valgte rutiner</button><button type="button" className="secondary" disabled={busy} onClick={()=>{setOpen(false);setSelected([]);}}>Avbryt</button></div>
  </>}
  {snapshot&&<div className="ks-selection-review ks-flow-target" ref={reviewRef} tabIndex={-1}>
   <h4>Godkjenningen gjelder disse {snapshot.length} rutineutkastene</h4>
   <ul className="ks-bulk-publication-list">{snapshot.map(row=><li key={row.id}><strong>{row.draft.title} · publiseres som versjon {row.next_number}</strong><details><summary>Les teksten som blir publisert</summary><ContentComponent content={row.draft} draft/></details></li>)}</ul>
   <label className="ks-field" htmlFor={`${id}-assessment`}><span>Felles vurdering – hva er kontrollert eller endret?</span><textarea id={`${id}-assessment`} value={assessment} maxLength={1500} disabled={busy} onChange={e=>setAssessment(e.target.value)}/></label>
   <p>Skriv hva du har vurdert for disse rutinene. Vurderingen lagres på hver utgave. Gjør egne endringer i rutiner som ikke passer før du godkjenner dem.</p>
   {snapshot.some(row=>row.next_number>1)&&<label className="ks-check"><input type="checkbox" checked={requiresAck} disabled={busy} onChange={e=>setRequiresAck(e.target.checked)}/>Krev ny lesebekreftelse for endrede rutiner. Første utgave krever alltid lesebekreftelse.</label>}
   <p className="ks-confirmation">{COMPANY_APPROVAL_STATEMENT}</p>
   <label className="ks-check"><input type="checkbox" checked={consent} disabled={busy||dirty} onChange={e=>setConsent(e.target.checked)}/>Jeg har vurdert alle oppførte utkast og godkjenner dem for firmaet.</label>
   <details><summary>Valgfritt: Bekreft også egen gjennomgang</summary><p>{ACK_STATEMENT}</p><label className="ks-check"><input type="checkbox" checked={confirmSelf} disabled={busy||dirty} onChange={e=>setConfirmSelf(e.target.checked)}/>Jeg bekrefter også at jeg selv har lest og forstått alle utgavene som publiseres.</label></details>
   <div className="ks-actions"><button type="button" disabled={busy||dirty||!consent||assessment.trim().length<5} onClick={publish}>{busy?'Godkjenner og publiserer …':`Godkjenn og publiser ${snapshot.length} valgte rutiner`}</button><button type="button" className="secondary" disabled={busy} onClick={()=>{setSnapshot(null);setConsent(false);setConfirmSelf(false);}}>Tilbake til utvalget</button><button type="button" className="secondary" disabled={busy} onClick={()=>{setOpen(false);setSnapshot(null);setConsent(false);setConfirmSelf(false);}}>Avbryt</button></div>
  </div>}
  {feedback&&<p className={feedback.error?'ks-error':'ks-notice'} role={feedback.error?'alert':'status'}>{feedback.message}</p>}
 </section>;
}
