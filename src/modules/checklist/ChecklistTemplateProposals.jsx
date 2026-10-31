import {useEffect,useRef,useState} from 'react';
import DeviationDialog from '../deviations/DeviationDialog.jsx';
import {FIELD_TYPES} from './checklistFields.mjs';
import {identityText} from '../kshms/kshmsPersonal.mjs';
import '../kshms/kshmsChecklists.css';
import {checklistContent,sameChecklistContent} from '../kshms/kshmsChecklists.mjs';
import {kshmsRpc} from '../kshms/kshmsAccess.js';
import {WORK_PROFILE_EVENT} from '../access/workProfileClient.js';
import {MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT} from '../access/moduleAccessClient.js';
import {proposalContext,proposalDraftKey,proposalReviewKey,submitChecklistProposal,reviewChecklistProposal} from './checklistProposals.mjs';
const readJob=key=>{try{const raw=window.localStorage.getItem(key);if(!raw)return null;const job=JSON.parse(raw);return job&&typeof job.requestId==='string'&&Array.isArray(job.definition?.points)?job:{invalid:true};}catch{return {invalid:true};}};
const reviewNoteKey=(key,id)=>`${key}:note:${id}`;
const readNote=key=>{try{return window.localStorage.getItem(key)||'';}catch{return '';}};
const statusText={pending:'Venter på godkjenning',approved:'Godkjent som firmamal',rejected:'Avslått'};
function useProposalScope(companyId,userId){
 const live=useRef(null),[state,setState]=useState(null),[error,setError]=useState(''),[loading,setLoading]=useState(false);
 const current=token=>live.current===token&&token?.active;
 async function load(append=false){const token=live.current;if(!current(token))return;const serial=++token.serial;setLoading(true);
  try{const next=proposalContext(await kshmsRpc('checklist_template_proposal_state',{p_company_id:companyId,...(append&&state?.next?{p_before:state.next.created_at,p_before_id:state.next.id}:{})}),companyId,userId);if(!current(token)||serial!==token.serial)return;
   setState(old=>append?{...next,proposals:[...(old?.proposals||[]),...next.proposals]}:next);setError('');return next;
  }catch(e){if(current(token)&&serial===token.serial){setState(null);setError(e.message);}}
  finally{if(current(token)&&serial===token.serial)setLoading(false);}
 }
 const loadRef=useRef(load);loadRef.current=load;
 useEffect(()=>{const token={active:true,serial:0};live.current=token;setState(null);
  const refresh=event=>{if(event?.type===WORK_PROFILE_EVENT&&event.detail?.active_company_id!==companyId){token.active=false;setState(null);setError('Arbeidsfirmaet er endret.');return;}loadRef.current();};
  refresh();const events=['focus',WORK_PROFILE_EVENT,MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT];events.forEach(name=>window.addEventListener(name,refresh));return()=>{token.active=false;events.forEach(name=>window.removeEventListener(name,refresh));};
 },[companyId,userId]);
 return {state,error,loading,load,live,current};
}
export function ChecklistTemplateProposal({companyId,userId,recordId,definition,disabled}){
 const key=proposalDraftKey(userId,companyId,recordId),[job,setJob]=useState(()=>readJob(key)),[sent,setSent]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const live=useRef(null),lock=useRef(false);useEffect(()=>{const token={active:true};live.current=token;return()=>{token.active=false;};},[companyId,userId,recordId]);
 const send=async()=>{if(lock.current||disabled)return;const token=live.current;lock.current=true;setBusy(true);setError('');
  try{if(job?.invalid)throw Error('Det tidligere forsøket kunne ikke leses. Det er beholdt og må avklares før du sender et nytt forslag.');const next=job||{requestId:crypto.randomUUID(),definition:checklistContent(definition)};window.localStorage.setItem(key,JSON.stringify(next));setJob(next);
   const result=await submitChecklistProposal({rpc:kshmsRpc,companyId,userId,job:next,isCurrent:()=>token.active&&live.current===token});if(!result||!token.active)return;
   window.localStorage.removeItem(key);setJob(null);setSent(result);
  }catch(e){if(token.active)setError(e.message+(readJob(key)?' Samme forslag er beholdt til utfallet er avklart.':''));}finally{lock.current=false;if(token.active)setBusy(false);}
 };
 const unchanged=sent&&sameChecklistContent(sent.definition,definition);
 return <details className="checklist-proposal"><summary>Foreslå som firmamal</summary><p>Send sjekkpunktene til firmaadmin for godkjenning. Forslaget legges i firmaets godkjenningskø. Ordre, kunde, svar og signaturer følger ikke med.</p>
  {job?.invalid&&<p role="alert">Et tidligere forslag kunne ikke leses. Det er beholdt på denne enheten.</p>}{job&&!job.invalid&&<p>Et tidligere forsøk må avklares. Knappen bruker det samme forslaget igjen.</p>}
  <button type="button" disabled={disabled||busy||!!unchanged||!!job?.invalid} onClick={send}>{busy?'Sender forslag …':job?'Prøv samme forslag igjen':unchanged?'Forslaget er sendt':'Send forslag til firmaadmin'}</button>
  {sent&&<p role="status">{statusText[sent.status]}: {sent.definition.title}. Du kan følge behandlingen under Mine malforslag i sjekklisteoversikten.</p>}{error&&<p role="alert">{error}</p>}
 </details>;
}
export function ChecklistProposalInbox({companyId,userId,onPublished}){
 const {state,error,loading,load,live,current}=useProposalScope(companyId,userId),key=proposalReviewKey(userId,companyId);
 const [selected,setSelected]=useState(null),[job,setJob]=useState(()=>readJob(key)),[note,setNote]=useState(''),[confirmed,setConfirmed]=useState(false),[busy,setBusy]=useState(false),[problem,setProblem]=useState(''),[notice,setNotice]=useState('');
 const lock=useRef(false),intent=useRef(0);
 useEffect(()=>{intent.current++;setSelected(null);setJob(readJob(key));setNote('');setConfirmed(false);setProblem('');setNotice('');},[key]);
 const open=async id=>{if(lock.current)return;const token=live.current,serial=++intent.current;setBusy(true);setProblem('');
  try{const read=proposalContext(await kshmsRpc('checklist_template_proposal_state',{p_company_id:companyId,p_id:id}),companyId,userId);if(!current(token)||serial!==intent.current)return;setSelected(read.record);setNote(job?.id===id?job.note:readNote(reviewNoteKey(key,id)));setConfirmed(false);
  }catch(e){if(current(token))setProblem(e.message);}finally{if(current(token))setBusy(false);}
 };
 const decide=async decision=>{if(lock.current||loading||!state?.context.can_review||!selected||job&&job.id!==selected.id||!job&&decision==='approve'&&!confirmed)return;
  const token=live.current;lock.current=true;setBusy(true);setProblem('');
  try{const next=job||{id:selected.id,revision:selected.revision,requestId:crypto.randomUUID(),decision,note:note.trim(),definition:selected.definition};if(next.decision==='reject'&&!next.note)throw Error('Skriv en begrunnelse for avslaget.');
   window.localStorage.setItem(key,JSON.stringify(next));setJob(next);
   const result=await reviewChecklistProposal({rpc:kshmsRpc,companyId,userId,job:next,isCurrent:()=>current(token)});if(!result||!current(token))return;
   window.localStorage.removeItem(key);window.localStorage.removeItem(reviewNoteKey(key,result.id));setJob(null);setSelected(null);setConfirmed(false);setNotice(statusText[result.status]+': '+result.definition.title);await load();
   if(result.status==='approved')try{await onPublished?.();}catch{setNotice('Firmamalen er godkjent. Lukk og åpne sjekklisteoversikten for å hente den.');}
  }catch(e){if(current(token)){
   setProblem(e.message);
   if(['PT409','40001'].includes(e.code))try{const read=proposalContext(await kshmsRpc('checklist_template_proposal_state',{p_company_id:companyId,p_id:selected.id}),companyId,userId);if(current(token)&&read.record?.status!=='pending'&&read.record?.review_request_id!==readJob(key)?.requestId){window.localStorage.removeItem(key);setJob(null);setSelected(read.record);await load();}}catch{}
  }}finally{lock.current=false;if(current(token))setBusy(false);}
 };
 useEffect(()=>{if(state&&selected&&selected.submitted_by!==userId&&!state.context.can_review){intent.current++;setSelected(null);setConfirmed(false);}},[state?.context.can_review,selected?.id,userId]);
 const canSeeSelected=selected&&state?.context?.enabled&&(selected.submitted_by===userId||state.context.can_review);
 return <section className="checklist-proposals" aria-label="Malforslag"><h3>{state?.context.can_review?'Forslag til firmamaler':'Mine malforslag'}</h3><p>{state?.context.can_review?'Se gjennom sjekkpunktene før du godkjenner dem som firmamal.':'Her ser du om dine forslag venter, er godkjent eller er avslått.'}</p>
  {notice&&<p role="status">{notice}</p>}{((!canSeeSelected&&problem)||error)&&<p role="alert">{(!canSeeSelected&&problem)||error}</p>}
  {job?.invalid&&<p role="alert">En tidligere behandling kunne ikke leses. Den er beholdt og må avklares før en ny behandling.</p>}{job&&!job.invalid&&<div><p>En tidligere behandling må avklares før du behandler et annet forslag.</p><button type="button" disabled={busy||loading} onClick={()=>open(job.id)}>Vis tidligere behandling</button></div>}
  <button type="button" disabled={busy||loading} onClick={()=>load()}>Oppdater malforslag</button>
  {!state&&loading?<p>Henter malforslag …</p>:state&&!state.proposals.length?<p>Ingen malforslag ennå.</p>:null}
  {state?.proposals.map(r=><article key={r.id}><h4>{r.title}</h4><p>{statusText[r.status]} · {r.trade} · {r.point_count} sjekkpunkter</p><p>Foreslått av {identityText(r.submitted_identity)}</p>{r.decision_note&&<p>Begrunnelse: {r.decision_note}</p>}<button type="button" disabled={busy||loading} onClick={()=>open(r.id)}>Se malforslag</button></article>)}
  {state?.next&&<button type="button" disabled={busy||loading} onClick={()=>load(true)}>Vis flere malforslag</button>}
  {canSeeSelected&&<DeviationDialog title="Se malforslag" context={statusText[selected.status]} busy={busy} onClose={()=>{if(!lock.current){intent.current++;setSelected(null);setProblem('');}}}>
   <form className="ks-checklists checklist-proposal-review" onSubmit={e=>e.preventDefault()}>
   <h3>{selected.definition.title}</h3><p>{selected.definition.trade} · Foreslått av {identityText(selected.submitted_identity)}</p><p>{selected.definition.instructions}</p>
   {selected.definition.points.map((p,i)=><article className="ks-checklist-point" key={p.id}><h4>Sjekkpunkt {i+1}: {p.title}</h4>{p.guidance&&<p>{p.guidance}</p>}<p>{p.image_required?'Bilde er påkrevd.':'Bilde er valgfritt.'} {p.comment_required?'Kommentar er påkrevd.':'Kommentar er valgfri.'} {p.allow_na===false?'Ikke aktuelt er ikke tillatt.':'Ikke aktuelt er tillatt.'}</p>{p.fields?.length>0&&<details><summary>Underpunkter og svarfelt ({p.fields.length})</summary><ul>{p.fields.map(f=><li key={f.id}><strong>{f.label}</strong> · {FIELD_TYPES[f.type]||f.type} · {f.required?'Svar påkrevd':'Valgfritt svar'}{f.min!==undefined&&<p>Minsteverdi: {f.min}</p>}{f.options?.length>0&&<p>Valg: {f.options.join(', ')}</p>}{f.when&&<p>Vises når «{p.fields.find(parent=>parent.id===f.when.field_id)?.label}» er «{f.when.equals}».</p>}</li>)}</ul></details>}</article>)}
   {selected.status==='pending'&&state.context.can_review&&<><label className="ks-field">Kommentar til forslagsstiller<textarea aria-label="Kommentar til forslagsstiller" maxLength={2000} value={note} disabled={busy||!!job} onChange={e=>{setNote(e.target.value);try{window.localStorage.setItem(reviewNoteKey(key,selected.id),e.target.value);}catch{setProblem('Merknaden kunne ikke sikres på enheten. Behold vinduet åpent.');}}}/></label><label><input type="checkbox" checked={confirmed} disabled={busy||!!job} onChange={e=>setConfirmed(e.target.checked)}/>Jeg har gjennomgått sjekkpunktene og vil godkjenne denne firmamalen.</label></>}
   {job?.id===selected.id?<button type="button" disabled={busy||loading||!state.context.can_review} onClick={()=>decide(job.decision)}>Prøv samme behandling igjen</button>:selected.status==='pending'&&state.context.can_review?<><button type="button" disabled={busy||loading||!!job||!confirmed||!state.context.can_publish} onClick={()=>decide('approve')}>Godkjenn som firmamal</button><button type="button" disabled={busy||loading||!!job||!note.trim()} onClick={()=>decide('reject')}>Avslå forslag</button>{!state.context.can_publish&&<p>Firmaet må ha aktivert KS/HMS før malen kan godkjennes. Du kan fortsatt avslå med en begrunnelse.</p>}</>:null}
   {problem&&<p role="alert">{problem}</p>}
   </form>
  </DeviationDialog>}
 </section>;
}
