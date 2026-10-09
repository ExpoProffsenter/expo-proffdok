import { routineNumber } from './kshmsJobChoices.mjs';
import { useEffect,useId,useRef,useState } from 'react';
import KshmsNavigation from './KshmsNavigation.jsx';
import { ACK_STATEMENT,CHAPTERS,ROUTINE_CATALOG,TRADES,blankRoutine,currentVersionSnapshot,suggestedRoutines } from './kshmsCatalog.mjs';
import { draftKey,persistDraft,readDraft,routineApprovalState,handbookProgress,pendingReadingVersions } from './kshmsDraft.mjs';
import { kshmsRpc } from './kshmsAccess.js';
import { publishManagedAccessChange } from '../access/moduleAccessClient.js';
import { addLibraryRoutines } from './kshmsLibrary.mjs';
import KshmsRoutineLibrary from './KshmsRoutineLibrary.jsx';
import KshmsSourceUpdates from './KshmsSourceUpdates.jsx';
import KshmsReviewReminder from './KshmsReviewReminder.jsx';
import KshmsAssignmentReminders from './KshmsAssignmentReminders.jsx';
import KshmsSourceProposal from './KshmsSourceProposal.jsx';
import {applySourceField,markSourceReviewed} from './kshmsSourceUpdates.mjs';
import KshmsRoutineSearch from './KshmsRoutineSearch.jsx';
import KshmsHandbookProgress from './KshmsHandbookProgress.jsx';
import KshmsAcknowledgments from './KshmsAcknowledgments.jsx';
import KshmsPersonalHandbook from './KshmsPersonalHandbook.jsx';
import KshmsVersionIdentity from './KshmsVersionIdentity.jsx';
import KshmsDocumentPdfButton from './KshmsDocumentPdfButton.jsx';
import { acknowledgmentOverview,pendingAssignmentOptions } from './kshmsFollowup.mjs';
import { filterFirmRoutines,matchesRoutineSearch } from './kshmsSearch.mjs';
import { SETUP_TEXT_FIELDS,ROUTINE_TEXT_SUGGESTIONS,fillEmptySetup,changeSetupTrades,routineWithSuggestions,fillEmptyRoutine,ROUTINE_WRITING_TIPS } from './kshmsWriting.mjs';
import './kshms.css';
import ModuleHeading from '../ui/ModuleHeading.jsx';
import {ShieldCheck,Info} from 'lucide-react';
import KshmsDeviations from './KshmsDeviations.jsx';
import KshmsChecklistCentral from './KshmsChecklistCentral.jsx';
import KshmsExecutions from './KshmsExecutions.jsx';
import KshmsSja from './KshmsSja.jsx';
import KshmsInspectionExtract from './KshmsInspectionExtract.jsx';
import {readNotificationLink} from './kshmsNotificationLinks.mjs';
const dateTime = value => new Date(value).toLocaleString('nb-NO');
const sourceTypes = {law:'Lov eller forskrift',professional:'Fag, veiledning eller kontrakt',company:'Firmaets egne regler',product:'ProffDoks valg'};
const emptySetup = {trades:[],activities:'',responsibilities:'',risks:'',responsible_user_id:'',revision:0};
export function ExecutionSurfaces({screen,companyId,userId,context}){
 const [opened,setOpened]=useState({});
 useEffect(()=>{if(['rounds','risk'].includes(screen))setOpened(previous=>({...previous,[screen]:true}));},[screen]);
 return <>{[['rounds','round'],['risk','risk']].map(([key,kind])=>(opened[key]||screen===key)&&<div key={key} hidden={screen!==key}><KshmsExecutions key={`${companyId}:${userId}:${kind}:${Boolean(context.manage)}`} context={context} kind={kind} active={screen===key}/></div>)}</>;
}
function Field({label,hint,value,onChange,type='text',multiline=false,required=false}) {
 const id=useId();
 const description=hint?`${id}-hint`:undefined;
 return <label className="ks-field" htmlFor={id}><span id={`${id}-label`}>{label}</span>{multiline ? <textarea id={id} aria-labelledby={`${id}-label`} aria-describedby={description} value={value||''} onChange={e=>onChange(e.target.value)} rows={5} required={required} maxLength={20000}/> : <input id={id} aria-labelledby={`${id}-label`} aria-describedby={description} type={type} value={value||''} onChange={e=>onChange(e.target.value)} required={required} maxLength={20000}/>} {hint&&<span id={description} className="ks-field-hint">{hint}</span>}</label>;
}
function Content({content,draft=false}) {
 return <div className="ks-content">{[['Mål','goal'],['Ansvar','responsibility'],[draft?'Forslag til fremgangsmåte':'I vår bedrift har vi følgende rutine','procedure'],['Dokumentasjon','documentation'],['Gjennomgang','confirmation']].map(([label,key])=><div key={key}><h4>{label}</h4><p>{content[key]}</p></div>)}
 <h4>Regler og kilder</h4><ul>{(content.references||[]).map((r,i)=><li key={i}><a href={/^https:\/\//.test(r.url)?r.url:undefined} target="_blank" rel="noreferrer">{r.title||r.url}</a> · {sourceTypes[r.kind]||r.kind} · kontrollert {r.checked_on}</li>)}</ul>
 </div>;
}
function validateReferences(refs) {
 for(const r of refs)if(!r.title?.trim()||!/^https:\/\//.test(r.url||'')||!Object.hasOwn(sourceTypes,r.kind)||!/^\d{4}-\d{2}-\d{2}$/.test(r.checked_on||''))throw new Error('Hver kilde må ha navn, https-lenke, type og kontrolldato.');
 return refs;
}
function References({value,onChange}) {
 const update=(i,key,next)=>onChange(value.map((r,index)=>index===i?{...r,[key]:next}:r));
 return <fieldset><legend>Regler og kilder</legend><p>Legg inn lenker til reglene rutinen bygger på. Velg om kilden er en lov, et fag- eller kontraktskrav, firmaets egen regel eller et valg i ProffDok. Skriv datoen du sjekket kilden.</p>{value.map((r,i)=><div className="ks-reference" key={i}>
  <Field label={`Kildenavn ${i+1}`} value={r.title} required onChange={v=>update(i,'title',v)}/><Field label={`Lenke til kilde ${i+1}`} value={r.url} type="url" required onChange={v=>update(i,'url',v)}/>
  <label className="ks-field"><span>Kildetype {i+1}</span><select value={r.kind} onChange={e=>update(i,'kind',e.target.value)}>{Object.entries(sourceTypes).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
  <Field label={`Kontrollert dato ${i+1}`} value={r.checked_on} type="date" required onChange={v=>update(i,'checked_on',v)}/>
  <button type="button" className="secondary" onClick={()=>onChange(value.filter((_,index)=>index!==i))}>Fjern kilde {i+1}</button>
 </div>)}<button type="button" className="secondary" onClick={()=>onChange([...value,{title:'',url:'',kind:'law',checked_on:new Date().toISOString().slice(0,10)}])}>Legg til kilde</button></fieldset>;
}
export default function KshmsModule({context,deviationRequest,personalOnly=false}) {
 const companyId=context.company_id,userId=context.user_id;
 const emailLink=readNotificationLink(window.location?.search||'',companyId);
 const [data,setData]=useState(null),[screen,setScreen]=useState(()=>personalOnly?'personal':context.manage?'handbook':'reading'),[error,setError]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false);
 const [deviationsOpened,setDeviationsOpened]=useState(false);
 const [checklistsOpened,setChecklistsOpened]=useState(false);
 const [sjaOpened,setSjaOpened]=useState(false);
 useEffect(()=>{if(deviationRequest?.companyId===companyId&&deviationRequest.userId===userId){firstView.current=true;setDeviationsOpened(true);setScreen('deviations');}},[deviationRequest?.nonce,companyId,userId]);
 useEffect(()=>{if(screen==='deviations')setDeviationsOpened(true);},[screen]);
 useEffect(()=>{if(screen==='checklists')setChecklistsOpened(true);},[screen]);
 useEffect(()=>{if(screen==='sja')setSjaOpened(true);},[screen]);
 const [setup,setSetup]=useState(emptySetup),[editor,setEditor]=useState(null),[sources,setSources]=useState([]),[dirty,setDirty]=useState(false),[cached,setCached]=useState(null),[proposal,setProposal]=useState(null);
 const [publication,setPublication]=useState(null),[summary,setSummary]=useState(''),[freshAck,setFreshAck]=useState(true),[selfAcknowledgment,setSelfAcknowledgment]=useState(false);
 const publicationRef=useRef(null),overviewRef=useRef(null),[publicationFocus,setPublicationFocus]=useState(0),[overviewFocus,setOverviewFocus]=useState(0),[publicationFeedback,setPublicationFeedback]=useState('');
 const publicationHeadingId=useId();
 const [reading,setReading]=useState(null),[checked,setChecked]=useState(false);
 const readingRef=useRef(null),readingDoneRef=useRef(null),completionRef=useRef(null),[readingFocus,setReadingFocus]=useState(0),[completionFocus,setCompletionFocus]=useState(0),[readingFeedback,setReadingFeedback]=useState('');
 const [handbookQuery,setHandbookQuery]=useState(''),[readingQuery,setReadingQuery]=useState(''),[personalQuery,setPersonalQuery]=useState('');
 const setupSuggestionFields=useRef(new Set());
 const reviewRef=useRef(null),[reviewFocus,setReviewFocus]=useState(0);
 const [findings,setFindings]=useState(''),[followUp,setFollowUp]=useState(''),[nextReview,setNextReview]=useState(''),[reviewChecked,setReviewChecked]=useState(false);
 const [selectedKeys,setSelectedKeys]=useState([]),[libraryFilter,setLibraryFilter]=useState('recommended'),[libraryPreview,setLibraryPreview]=useState(null),[libraryProgress,setLibraryProgress]=useState(null),[libraryFeedback,setLibraryFeedback]=useState(null),[libraryOpen,setLibraryOpen]=useState(false);
 const requestScope=useRef(null),editorRef=useRef(null),libraryPreviewRef=useRef(null),firstView=useRef(false),flowRef=useRef(null),setupRef=useRef(null),libraryRef=useRef(null),followupRef=useRef(null),[editorFocus,setEditorFocus]=useState(0),[flowFocus,setFlowFocus]=useState(0),[libraryFocus,setLibraryFocus]=useState(0);
 const load = async()=>{const value=await kshmsRpc('kshms_get_state',{p_company_id:companyId});setData(value);return value;};
 useEffect(()=>{let active=true;const scope={active:true};requestScope.current=scope;setData(null);setError('');setBusy(false);setLibraryProgress(null);
  kshmsRpc('kshms_get_state',{p_company_id:companyId}).then(value=>{if(active){setData(value);const prepared=fillEmptySetup(value.settings||emptySetup);setupSuggestionFields.current=new Set(prepared.filled);setSetup(prepared.setup);if(!firstView.current){const linkedTab=emailLink?.matchingCompany?emailLink.kind==='sja'?'sja':emailLink.kind==='reading'?'reading':emailLink.kind==='review'&&value.context.manage?'followup':null:null;setScreen(personalOnly?'personal':linkedTab||(value.context.manage?value.settings?'handbook':'setup':'reading'));firstView.current=true;}setCached(readDraft(window.localStorage,userId,companyId));setNextReview(value.settings?.next_review_on||new Date(Date.now()+360*86400000).toISOString().slice(0,10));}}).catch(e=>{if(active)setError(e.message)});
  return()=>{active=false;scope.active=false};
 },[companyId,userId,context.manage,context.publish,context.administer,personalOnly]);
 useEffect(()=>{const warn=e=>{if(dirty){e.preventDefault();e.returnValue='';}};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);},[dirty]);
 useEffect(()=>{if(editorFocus&&editorRef.current){editorRef.current.focus();editorRef.current.scrollIntoView({block:'start'});}},[editorFocus]);
 useEffect(()=>{if(libraryPreview&&libraryPreviewRef.current){libraryPreviewRef.current.focus();libraryPreviewRef.current.scrollIntoView({block:'start'});}},[libraryPreview]);
 useEffect(()=>{if(publicationFocus&&publicationRef.current){publicationRef.current.focus();publicationRef.current.scrollIntoView({block:'start'});}},[publicationFocus]);
 useEffect(()=>{if(readingFocus){const target=reading?readingRef.current:readingDoneRef.current;target?.focus();target?.scrollIntoView({block:'start'});}},[readingFocus]);
 useEffect(()=>{if(completionFocus){completionRef.current?.focus();completionRef.current?.scrollIntoView({block:'start'});}},[completionFocus]);
 useEffect(()=>{if(overviewFocus&&overviewRef.current){overviewRef.current.focus();overviewRef.current.scrollIntoView({block:'start'});}},[overviewFocus]);
 useEffect(()=>{if(flowFocus){const target=screen==='setup'?setupRef.current:screen==='followup'?followupRef.current:flowRef.current;target?.focus();target?.scrollIntoView({block:'start'});}},[flowFocus,screen]);
 useEffect(()=>{if(libraryFocus){libraryRef.current?.focus();libraryRef.current?.scrollIntoView({block:'start'});}},[libraryFocus]);
 useEffect(()=>{if(reviewFocus&&reviewRef.current){reviewRef.current.open=true;reviewRef.current.focus();reviewRef.current.scrollIntoView({block:'start'});}},[reviewFocus]);
 const openReview=()=>{if(busy||!data?.context?.responsible||data.context.company_id!==companyId||data.context.user_id!==userId)return;setScreen('followup');setReviewFocus(previous=>previous+1);};
 const run=async(action,payload,success='Lagret.',onSaved=null)=>{
  setBusy(true);setError('');setNotice('');
  try{const result=await kshmsRpc('kshms_command',{p_company_id:companyId,p_action:action,p_payload:payload});const value=await load();if(action==='settings'){setupSuggestionFields.current.clear();setSetup(value.settings||emptySetup);}setNotice(success);onSaved?.(result,value);return result;}
  catch(e){if(e.code==='40001'){try{await load()}catch{}setError('En annen person har lagret endringer. Sammenlign din tekst med den lagrede teksten før du lagrer igjen. Ditt utkast er beholdt på denne enheten.');}else setError(e.message);return null;}
  finally{setBusy(false);}
 };
 const chooseEditor=(draft,routine=null,compareSource=false)=>{
  if(dirty && !window.confirm('Åpne en annen rutine? Teksten du jobber med, er lagret på denne enheten. Du kan hente den inn igjen.'))return;
  setEditor({id:routine?.id||null,revision:routine?.revision||0,draft:structuredClone(draft)});setSources(structuredClone(draft.references||[]));setDirty(false);setProposal(compareSource?ROUTINE_CATALOG.find(r=>r.key===draft.source_key)||null:null);setScreen('handbook');setEditorFocus(previous=>previous+1);
 };
 const choosePublication=routine=>{
  if(busy)return;
  if(publication?.id!==routine.id||publication.revision!==routine.revision){setPublication(routine);setSummary('');setFreshAck(true);setSelfAcknowledgment(false);}
  setError('');setNotice('');setPublicationFeedback('');setPublicationFocus(previous=>previous+1);
 };
 const publishRoutine=async()=>{
  if(busy||dirty||!publication||summary.trim().length<5)return;
  const routine=publication,scope=requestScope.current,confirmSelf=selfAcknowledgment;let savedState;
  if(!scope?.active)return;
  const result=await run('publish',{id:routine.id,revision:routine.revision,change_summary:summary,requires_ack:data.versions.some(v=>v.routine_id===routine.id)?freshAck:true,...(confirmSelf?{acknowledge_self:true,self_statement:ACK_STATEMENT}:{})},'',(_,value)=>{savedState=value;});
  if(!scope.active||requestScope.current!==scope||!result?.id||savedState?.context?.company_id!==companyId||savedState.context.user_id!==userId||!savedState.context.publish)return;
  if(confirmSelf&&!savedState.acknowledgments.some(row=>row.user_id===userId&&row.version_id===result.id&&row.statement===ACK_STATEMENT)){setError('Rutinen er publisert, men vi kunne ikke kontrollere din egen bekreftelse. Kontroller utgaven i «Les og bekreft» før du prøver igjen.');return;}
  const progress=handbookProgress(savedState),next=progress.waiting[0];
  const feedback=`«${routine.draft.title}» er godkjent og publisert som versjon ${result.number}.${confirmSelf?' Din egen gjennomgang er også bekreftet.':''}`;
  if(next){choosePublication(next);if(!matchesRoutineSearch(next.draft,handbookQuery))setHandbookQuery('');setPublicationFeedback(`${feedback} Neste rutine som trenger godkjenning, er åpnet under.`);}
  else{setPublication(null);setSummary('');setFreshAck(true);setSelfAcknowledgment(false);setPublicationFeedback(`${feedback} Ansatte med KS/HMS-tilgang finner utgaven i «Les og bekreft».`);if(progress.step==='followup')setCompletionFocus(previous=>previous+1);else setFlowFocus(previous=>previous+1);}
 };
 const chooseReading=version=>{
  if(busy)return;
  setReading(version);setChecked(false);setReadingFeedback('');setError('');setNotice('');setReadingFocus(previous=>previous+1);
 };
 const acknowledgeRoutine=async()=>{
  if(busy||!checked||!reading)return;
  const version=reading,scope=requestScope.current;let savedState;
  if(!scope?.active)return;
  const result=await run('ack',{version_id:version.id,statement:ACK_STATEMENT},'',(_,value)=>{savedState=value;});
  if(!scope.active||requestScope.current!==scope||!result||savedState?.context?.company_id!==companyId||savedState.context.user_id!==userId)return;
  if(!savedState.acknowledgments.some(row=>row.user_id===userId&&row.version_id===version.id)){setError('Vi kunne ikke kontrollere at bekreftelsen er lagret. Prøv igjen.');return;}
  const next=pendingReadingVersions(savedState,userId)[0];
  const feedback=`Du har bekreftet «${version.content.title}», versjon ${version.number}. Navnet ditt, tidspunktet og utgaven er lagret.`;
  if(next){chooseReading(next);if(!matchesRoutineSearch(next.content,readingQuery))setReadingQuery('');setReadingFeedback(`${feedback} Neste rutine som mangler bekreftelse, er åpnet under.`);}
  else{setReading(null);setChecked(false);setReadingFeedback(feedback);setReadingFocus(previous=>previous+1);}
 };
 const addSelected=async keys=>{
  if(busy)return;
  const scope=requestScope.current;
  if(!scope?.active)return;
  setBusy(true);setLibraryFeedback(null);setError('');setNotice('');
  try {
   const result=await addLibraryRoutines({companyId,keys,rpc:kshmsRpc,isCurrent:()=>scope.active,onProgress:setLibraryProgress});
   if(result.cancelled||!scope.active)return;
   if(result.state)setData(result.state);
   setSelectedKeys(previous=>previous.filter(key=>!result.confirmedKeys.includes(key)));
   const added=result.addedCount===1?'1 rutine er lagt inn':`${result.addedCount} rutiner er lagt inn`;
   const existing=result.skippedCount?` ${result.skippedCount} var allerede lagt til og er beholdt.`:'';
   setLibraryFeedback(result.error?{error:true,message:`${added} som utkast.${existing} De resterende valgene er beholdt. Prøv igjen. ${result.error.message}`}:{error:false,message:`${added} som utkast.${existing} Bruk «Rediger her» for å tilpasse hver rutine.`});
   if(!result.error){setLibraryOpen(false);setFlowFocus(previous=>previous+1);}
  } catch(cause) {if(scope.active)setLibraryFeedback({error:true,message:cause.message});}
  finally {if(scope.active){setBusy(false);setLibraryProgress(null);}}
 };
 const cacheEditor=(next,sourceValue=sources)=>{
  setEditor(next);setDirty(true);
  try{persistDraft(window.localStorage,userId,companyId,{...next,sources:sourceValue});setCached(readDraft(window.localStorage,userId,companyId));}
  catch{setError('Utkastet kunne ikke sikres på denne enheten. Trykk «Lagre utkast» før du lukker appen.');}
 };
 const changeSourceDraft=key=>{
  if(busy||!editor||!proposal||!requestScope.current?.active||data.context.company_id!==companyId||data.context.user_id!==userId||data.context.enabled!==true||data.context.manage!==true)return;
  const draft={...editor.draft,references:sources};
  const next=key?applySourceField(draft,proposal,key):markSourceReviewed(draft,proposal);
  setSources(next.references);cacheEditor({...editor,draft:next},next.references);
 };
 const save=async e=>{e.preventDefault();let draft;
  try{draft={...editor.draft,references:validateReferences(sources)}}catch(err){setError(err.message);return;}
  const result=await run('save',{id:editor.id,revision:editor.revision,draft},'');
  if(result?.id){window.localStorage.removeItem(draftKey(userId,companyId));setCached(null);setDirty(false);setEditor(null);const approval=routineApprovalState({...result,draft},data.versions);if(data.context.publish&&approval.status!=='approved')choosePublication({...result,draft});else{setNotice(approval.status==='approved'?'Rutinen er lagret uten nye innholdsendringer. Den godkjente utgaven gjelder fortsatt.':'Utkastet er lagret og må godkjennes før ansatte får det.');setFlowFocus(previous=>previous+1);}}
 };
 const saveSetup=async e=>{
  e.preventDefault();if(busy||!setup.responsible_user_id||!setup.trades.length)return;
  const member=data.members.find(member=>member.id===setup.responsible_user_id);
  if(!member){setError('Velg en aktiv medarbeider i dette firmaet.');return;}
  const needsAccess=member.workspace_role!=='firmaadmin'&&!(member.enabled&&member.role==='responsible');
  if(needsAccess&&!data.context.administer){setError('Firmaadmin må gi personen KS/HMS-ansvarlig tilgang.');return;}
  const scope=requestScope.current;
  if(!scope?.active)return;
  if(needsAccess){const granted=await run('access',{user_id:member.id,role:'responsible',enabled:true},'');if(!granted||!scope?.active)return;}
  const result=await run('settings',setup,'Oppstart er lagret. Nå kan du velge og godkjenne firmaets rutiner.');
  if(!scope?.active)return;
  if(result){setScreen('handbook');setFlowFocus(previous=>previous+1);if(needsAccess)publishManagedAccessChange({source:'kshms-member-access',userId:member.id,companyId});}
  else if(needsAccess)setError(previous=>`Personen har fått KS/HMS-ansvarlig tilgang, men oppstart kunne ikke bekreftes. Valgene dine er beholdt. Kontroller feilen under før du prøver igjen. ${previous}`);
 };
 if(!data)return <section className="ks-module"><h2>KS/HMS</h2>{error?<p role="alert">{error}</p>:<p role="status">Henter firmaets håndbok …</p>}<button type="button" className="secondary" onClick={()=>load().catch(e=>setError(e.message))}>Prøv igjen</button></section>;
 const canManage=!personalOnly&&data.context.manage,canPublish=!personalOnly&&data.context.publish,canAdmin=!personalOnly&&data.context.administer===true;
 const progress=canManage?handbookProgress(data):null;
 const nextStep=()=>{if(busy||dirty)return;if(progress.step==='setup'){setScreen('setup');setFlowFocus(previous=>previous+1);}else if(progress.step==='approval'){setScreen('handbook');choosePublication(progress.waiting[0]);}else if(progress.step==='selection'){setScreen('handbook');setLibraryOpen(true);setLibraryFocus(previous=>previous+1);}else{setScreen('followup');setFlowFocus(previous=>previous+1);}};
 const pending=pendingReadingVersions(data,userId);
 const latest=data.routines.filter(r=>!r.archived).map(r=>data.versions.find(v=>v.routine_id===r.id)).filter(Boolean);
 const followup=canManage?acknowledgmentOverview(data):null;
 const assignmentOptions=canManage?pendingAssignmentOptions(data,latest):[];
 const overdue=data.settings && new Date(`${data.settings.next_review_on}T23:59:59`) < new Date();
 const visibleRoutines=filterFirmRoutines(data,handbookQuery);
 const ownAssignments=data.assignments.filter(assignment=>assignment.user_id===userId&&data.versions.some(version=>version.id===assignment.version_id));
 const visibleAssignments=ownAssignments.filter(assignment=>matchesRoutineSearch(data.versions.find(version=>version.id===assignment.version_id)?.content,readingQuery));
 const changeSetupText=(field,value)=>{setupSuggestionFields.current.delete(field);setSetup(previous=>({...previous,[field]:value}));};
 return <section className="ks-module" aria-label="KS/HMS håndbok">
  {personalOnly?<header className="ks-heading"><div><span className="ks-eyebrow">{context.company_name}</span><h2>Personalhåndboka</h2><p>Dine tildelte rutiner og egen gjennomgang</p></div><span className="ks-badge">Ansatt</span></header>:<ModuleHeading className="ks-heading" companyName={context.company_name} title="KS/HMS" description="Rutiner, trygt arbeid og dokumentasjon – samlet for firmaet." role={canManage?canAdmin?'Firmaadmin':'KS/HMS-ansvarlig':'Ansatt'} icon={ShieldCheck}/>}
  <details className="module-guide"><summary><Info aria-hidden="true"/>{personalOnly?'Slik bruker du personalhåndboka':'Slik bruker du KS/HMS'}</summary><p className="ks-scope">{canManage?'Du bygger firmaets KS/HMS-håndbok. Både firmaadmin og KS/HMS-ansvarlig kan velge, skrive, endre og godkjenne rutiner. En rutine forklarer hvordan en oppgave skal gjøres. Firmaadmin styrer ansattes tilgang. Firmaet må lære opp ansatte og følge rutinene i arbeidet.':'Her finner du rutinene du har fått. De forklarer hvordan du skal jobbe trygt og gjøre oppgavene riktig. I «Les og bekreft» ser du hva du skal lese og hva du allerede har bekreftet.'}</p></details>
  <KshmsNavigation screen={screen} canManage={canManage} pendingCount={pending.length} onNavigate={setScreen} personalOnly={personalOnly}/>
  {!personalOnly&&<KshmsAssignmentReminders key={`assignment-reminders:${companyId}:${userId}`} context={data.context} refreshKey={data.acknowledgments.length} busy={busy} onOpen={target=>setScreen(target)}/>}
  {!personalOnly&&<KshmsReviewReminder key={`${companyId}:${userId}`} context={data.context} settingsRevision={data.settings?.revision} busy={busy} onOpen={openReview}/>}
  {canManage&&screen==='extract'&&<KshmsInspectionExtract key={`${companyId}:${userId}`} context={data.context}/>}
  <ExecutionSurfaces screen={screen} companyId={companyId} userId={userId} context={context}/>
  {canManage&&(screen==='checklists'||checklistsOpened)&&<div hidden={screen!=='checklists'}><KshmsChecklistCentral key={`${companyId}:${userId}`} context={data.context} active={screen==='checklists'}/></div>}
  {(screen==='deviations'||deviationsOpened)&&<div hidden={screen!=='deviations'}><KshmsDeviations context={context} request={deviationRequest}/></div>}
  {(screen==='sja'||sjaOpened)&&<div hidden={screen!=='sja'}><KshmsSja key={`${companyId}:${userId}`} context={context} active={screen==='sja'}/></div>}
  {error&&!(screen==='handbook'&&publication)&&<p role="alert" className="ks-error">{error}</p>}{notice && <p role="status" className="ks-notice">{notice}</p>}
  {screen==='setup'&&canManage&&<>
   <div className="ks-card ks-flow-target" ref={setupRef} tabIndex={-1}><h3>1. Velg KS/HMS-ansvarlig</h3><p>Start med personen som skal følge opp håndboken og signere den årlige kontrollen. Firmaadmin velger en aktiv bruker i firmaet og kan velge seg selv.</p>
    <form onSubmit={saveSetup}>
     <label className="ks-field"><span>Utpekt KS/HMS-ansvarlig (firmaadmin velger)</span><select required disabled={!canAdmin||busy} value={setup.responsible_user_id||''} onChange={e=>setSetup({...setup,responsible_user_id:e.target.value})}><option value="">Velg ansvarlig</option>{data.members.map(m=><option key={m.id} value={m.id}>{m.email}{m.id===userId?' (deg)':''}{m.workspace_role==='firmaadmin'?' · Firmaadmin':''}</option>)}</select></label>
     <p className="ks-field-hint">{canAdmin?'Når du lagrer, får den valgte personen KS/HMS-ansvarlig tilgang. Personen kan bygge og godkjenne rutiner. Firmaadmin beholder sitt ansvar og styrer ansattes tilgang.':'Firmaadmin velger ansvarlig og styrer tilgang. Du kan tilpasse fag og beskrivelsen av arbeidet. Be firmaadmin fullføre valget hvis ansvarlig mangler.'}</p>
     <aside className="ks-role-help"><strong>KS/HMS-ansvarlig og verneombud er to ulike roller</strong><p>ProffDok ber firmaet velge en KS/HMS-ansvarlig, også i små firmaer. Fra fem ansatte skal virksomheten ha verneombud. Ved én til fire ansatte kan arbeidsgiver og ansatte avtale en annen ordning skriftlig. Risiko kan likevel gjøre verneombud nødvendig. Verneombudet velges av arbeidstakerne. Involver verneombudet i HMS-arbeidet. Dette valget i appen er ikke et verneombudsvalg.</p><a href="https://www.arbeidstilsynet.no/hms/roller-i-hms-arbeidet/verneombud/" target="_blank" rel="noreferrer">Arbeidstilsynet: regler om verneombud</a><span className="ks-field-hint"> · kilde kontrollert 2026-10-06</span></aside>
     <h3>2. Fortell hva firmaet gjør</h3><p>Velg minst ett fag. Du kan velge flere. Tekstfeltene har forslag som hjelper deg å komme i gang. KS/HMS-ansvarlig eller firmaadmin bør lese og tilpasse teksten til egen bedrift. Beskriv bare arbeid og ansvar dere faktisk har.</p>
     <aside className="ks-writing-help"><strong>Skrivehjelp – vises bare her</strong><p>Teksten i boksene kan redigeres. Den lagres først når du trykker «Lagre og gå videre». Forslagene følger fagvalget til du selv endrer teksten. Tipsene utenfor boksene følger ikke med i rutinene ansatte leser.</p></aside>
     <fieldset><legend>Fag</legend><div className="ks-options">{Object.entries(TRADES).map(([key,label])=><label key={key}><input type="checkbox" checked={setup.trades.includes(key)} onChange={e=>setSetup(previous=>changeSetupTrades(previous,e.target.checked?[...previous.trades,key]:previous.trades.filter(t=>t!==key),setupSuggestionFields.current))}/>{label}</label>)}</div></fieldset>
     <Field label="Aktiviteter – hva gjør dere?" hint="Tilpass forslaget til jobbene dere utfører. Ta bort oppgaver som ikke er aktuelle." value={setup.activities} multiline onChange={v=>changeSetupText('activities',v)}/>
     <Field label="Ansvar – hvem følger opp arbeidet?" hint="Tilpass rollene til firmaet. Ta med ansvar for tegninger og beregninger hvis dere har det." value={setup.responsibilities} multiline onChange={v=>changeSetupText('responsibilities',v)}/>
     <Field label="Risiko – hva kan gå galt?" hint="Tilpass farene til arbeidet deres. Dette er et utgangspunkt, ikke en ferdig risikovurdering av alle jobber." value={setup.risks} multiline onChange={v=>changeSetupText('risks',v)}/>
     {SETUP_TEXT_FIELDS.some(field=>!setup[field]?.trim())&&<button type="button" className="secondary" disabled={busy} onClick={()=>{const prepared=fillEmptySetup(setup);prepared.filled.forEach(field=>setupSuggestionFields.current.add(field));setSetup(prepared.setup);}}>Fyll tomme felt med tekstforslag</button>}
     <p className="ks-next-step" role="status">{!setup.responsible_user_id?'Velg ansvarlig først.':!setup.trades.length?'Velg minst ett fag før du går videre.':'Neste steg: Velg og tilpass rutinene i håndboken.'}</p>
     <button disabled={busy||!setup.responsible_user_id||!setup.trades.length}>Lagre og gå videre</button>
    </form>
   </div>
   {canAdmin&&<div className="ks-card"><h3>Her velger du hvem som får bruke KS/HMS</h3><p>Velg tilgang ved siden av navnet til hver ansatt. «Ansatt» kan lese og bekrefte rutiner. «KS/HMS-ansvarlig» kan også bygge håndboken og godkjenne rutiner. Valget lagres med en gang. Firmaadmin styrer tilgangen. Firmaadmin og KS/HMS-ansvarlig kan godkjenne rutinene.</p>
    {data.members.map(m=><div className="ks-member" key={m.id}><span>{m.email}{m.workspace_role==='firmaadmin'?' · Firmaadmin':''}</span><select aria-label={`Tilgang for ${m.email}`} value={m.workspace_role==='firmaadmin'?'off':m.enabled?m.role:'off'} disabled={busy||m.workspace_role==='firmaadmin'} onChange={async e=>{const role=e.target.value;const result=await run('access',{user_id:m.id,role:role==='off'?'reader':role,enabled:role!=='off'});if(result)publishManagedAccessChange({source:'kshms-member-access',userId:m.id,companyId});}}><option value="off">{m.workspace_role==='firmaadmin'?'Firmaadmin (automatisk)':'Ingen KS/HMS-tilgang'}</option><option value="reader">Ansatt – lese og bekrefte</option><option value="responsible">KS/HMS-ansvarlig – bygge og godkjenne</option></select></div>)}
   </div>}
  </>}
  {screen==='handbook'&&<>
   {canManage&&<KshmsHandbookProgress progress={progress} dirty={dirty} busy={busy} canPublish={canPublish} onNext={nextStep} targetRef={flowRef} feedback={publication?'':publicationFeedback}/>}
   {canManage&&<div className="ks-card"><h3>Her bygger du firmaets KS/HMS-håndbok</h3><p>Firmaets rutiner ligger under. «Utkast» er tekst som må vurderes. «Godkjent» er en utgave ansatte kan lese. Redigerer du en godkjent rutine, må endringene godkjennes før ansatte får dem.</p>
    <ol className="ks-steps"><li><strong>Velg rutiner</strong><span>Huk av rutinene firmaet trenger.</span></li><li><strong>Legg dem inn</strong><span>Se over listen og trykk «Legg inn».</span></li><li><strong>Tilpass teksten</strong><span>Trykk «Rediger her» og lagre utkastet.</span></li><li><strong>Godkjenn</strong><span>Firmaadmin eller KS/HMS-ansvarlig godkjenner. Ansatte leser og bekrefter.</span></li></ol>
    <p className="ks-field-hint">Det finnes {ROUTINE_CATALOG.length} forslag foreløpig. Flere rutiner og verktøy kommer etter hvert. Du kan også skrive en egen rutine.</p>
    <div className="ks-actions"><button type="button" disabled={busy} onClick={()=>chooseEditor(routineWithSuggestions())}>Ny rutine med tekstforslag</button><button type="button" className="secondary" disabled={busy} onClick={()=>chooseEditor(blankRoutine())}>Ny rutine fra blank mal</button></div>
    {cached&&<div className="ks-recovery"><p>Du har et ulagret utkast fra {dateTime(cached.savedLocallyAt)} på denne enheten. Trykk «Hent inn utkast» for å fortsette med teksten. Sammenlign med firmaets lagrede rutine før du lagrer igjen.</p><button type="button" className="secondary" onClick={()=>{setEditor({id:cached.id,revision:cached.revision,draft:cached.draft});setSources(Array.isArray(cached.sources)?cached.sources:cached.draft.references||[]);setDirty(true);}}>Hent inn utkast</button><button type="button" className="secondary" onClick={()=>{if(window.confirm('Slette utkastet som er lagret på denne enheten?')){window.localStorage.removeItem(draftKey(userId,companyId));setCached(null)}}}>Slett utkast på enheten</button></div>}
    <details className="ks-more-routines ks-flow-target" ref={libraryRef} tabIndex={-1} open={libraryOpen||progress.step==='selection'} onToggle={event=>setLibraryOpen(event.currentTarget.open)}><summary>{progress.total?'Legg til flere rutiner':'Velg rutiner fra ProffDoks forslag'}</summary>
     <KshmsRoutineLibrary routines={data.routines} versions={data.versions} recommended={suggestedRoutines(setup.trades,setup.activities,setup.responsibilities,setup.risks)} selectedKeys={selectedKeys} onSelectionChange={setSelectedKeys} filter={libraryFilter} onFilterChange={setLibraryFilter} busy={busy} progress={libraryProgress} feedback={null} onAdd={addSelected} onEdit={routine=>chooseEditor(routine.draft,routine)} onPreview={setLibraryPreview}/>
    </details>
    {libraryFeedback&&<p className={libraryFeedback.error?'ks-error':'ks-notice'} role={libraryFeedback.error?'alert':'status'}>{libraryFeedback.message}</p>}
    {libraryPreview&&<article className="ks-proposal ks-editor" ref={libraryPreviewRef} tabIndex={-1}><h4>Forslag til rutine: {libraryPreview.title}</h4><p>Her kan du lese ProffDoks forslag. For å bruke det, lukk visningen, huk av rutinen og trykk «Legg inn». Deretter kan du endre teksten så den passer firmaet.</p><Content content={libraryPreview} draft/><button type="button" className="secondary" onClick={()=>setLibraryPreview(null)}>Lukk forslag</button></article>}
   </div>}
   {editor&&canManage&&<div className="ks-card ks-editor" ref={editorRef} tabIndex={-1}><h3>{editor.id?`Rediger rutine: ${editor.draft.title}`:'Skriv en ny rutine'}</h3><p>Her endrer du teksten så den passer firmaet. Trykk «Lagre utkast» når du er ferdig. Firmaadmin eller KS/HMS-ansvarlig må godkjenne før ansatte får rutinen. Tidligere godkjente utgaver beholdes.</p><p className="ks-field-hint">Rutinene er felles for firmaet. Hold private opplysninger om enkeltansatte utenfor teksten.</p>
    <aside className="ks-writing-help"><strong>Skrivehjelp – vises bare her</strong><p>KS/HMS-ansvarlig eller firmaadmin bør tilpasse teksten til egen bedrift før godkjenning. Tipsene utenfor boksene lagres ikke som del av rutinen og vises ikke for ansatte eller i rapportgrunnlaget.</p><p>{ROUTINE_WRITING_TIPS[editor.draft.source_key]||'Tekstforslaget er en generell start. Beskriv den konkrete oppgaven, når rutinen gjelder, hvem som gjør hva, og hvordan dere kontrollerer resultatet.'}</p></aside>
    {Object.keys(ROUTINE_TEXT_SUGGESTIONS).some(field=>!editor.draft[field]?.trim())&&<button type="button" className="secondary" disabled={busy} onClick={()=>cacheEditor({...editor,draft:fillEmptyRoutine(editor.draft)})}>Fyll tomme rutinefelt med tekstforslag</button>}
    <form onSubmit={save}>{[['Tittel','title','Gi rutinen et kort navn som sier hva den handler om.'],['Kapittel','chapter','Skriv hvor rutinen skal ligge, for eksempel HMSK eller Personal og arbeidsforhold.'],['Mål','goal','Hva skal rutinen hjelpe dere å få til eller unngå?'],['Ansvar – hvem gjør hva?','responsibility','Skriv hvem som gjør arbeidet, og hvem som følger det opp.'],['I vår bedrift har vi følgende rutine','procedure','Beskriv oppgaven steg for steg. Ta med når rutinen skal brukes og hva en ansatt trenger å vite.'],['Dokumentasjon – hva skal lagres?','documentation','Skriv hva som skal dokumenteres, for eksempel bilder, en sjekkliste eller en kontroll.'],['Gjennomgang – hva skal den ansatte avklare?','confirmation','Skriv hva den ansatte skal lese og spørre om før arbeidet starter.']].map(([label,key,hint])=><Field key={key} label={label} hint={hint} value={editor.draft[key]} required multiline={!['title','chapter'].includes(key)} onChange={v=>cacheEditor({...editor,draft:{...editor.draft,[key]:v}})}/>)}
     <References value={sources} onChange={v=>{setSources(v);cacheEditor(editor,v)}}/>
     <div className="ks-actions"><button disabled={busy}>Lagre utkast</button><button type="button" className="secondary" onClick={()=>{setEditor(null);setDirty(false)}}>Lukk redigering</button>{editor.draft.source_key&&<button type="button" className="secondary" onClick={()=>setProposal(ROUTINE_CATALOG.find(r=>r.key===editor.draft.source_key)||null)}>Vurder ProffDoks tekstforslag</button>}</div>
    </form>
    {data.routines.some(r=>r.id===editor.id&&r.revision!==editor.revision)&&<aside className="ks-proposal"><h4>En annen person har endret rutinen</h4><p>Teksten under er lagret av en annen person. Sammenlign den med teksten du jobber med. Velg å beholde din tekst først når du har sjekket forskjellene.</p><Content content={data.routines.find(r=>r.id===editor.id).draft} draft/><button type="button" className="secondary" onClick={()=>{cacheEditor({...editor,revision:data.routines.find(r=>r.id===editor.id).revision});setError('')}}>Jeg har sammenlignet – behold min tekst</button></aside>}
    {proposal&&data.context.company_id===companyId&&data.context.user_id===userId&&data.context.enabled===true&&<KshmsSourceProposal draft={{...editor.draft,references:sources}} proposal={proposal} busy={busy} onApply={changeSourceDraft} onReviewed={()=>changeSourceDraft(null)} onClose={()=>setProposal(null)}/>}
   </div>}
   {publication&&canPublish&&<div className="ks-card ks-editor ks-publication" ref={publicationRef} tabIndex={-1} aria-labelledby={publicationHeadingId} aria-busy={busy}>
    <h3 id={publicationHeadingId}>Her godkjenner du rutinen: {publication.draft.title}</h3>
    {publicationFeedback&&<p className="ks-notice" role="status">{publicationFeedback}</p>}
    <p>Denne rutinen venter på godkjenning. Les den lagrede teksten under og sjekk at den passer firmaet. Skriv kort hva du har kontrollert eller endret. «Godkjenn og publiser» godkjenner bare denne rutinen og gir den til ansatte med KS/HMS-tilgang. Tidligere utgaver og bekreftelser beholdes.</p>
    <Content content={publication.draft} draft/>
    <Field label="Hva er vurdert eller endret?" hint="Skriv før du godkjenner. Eksempel: «Gjennomgått og tilpasset firmaets arbeid». Skriv det du faktisk har kontrollert (minst 5 tegn). En grå knapp betyr at vurderingen mangler, ikke at rutinen er godkjent." value={summary} onChange={setSummary} required multiline/>
    <label className="ks-check"><input type="checkbox" checked={freshAck} onChange={e=>setFreshAck(e.target.checked)}/>Ansatte skal lese og bekrefte på nytt (alltid ved ny rutine eller viktig endring)</label>
    <div className="ks-self-confirmation"><p>Du skal lese og bekrefte rutinene før du begynner å arbeide i firmaet. Det gjelder også firmaadmin og KS/HMS-ansvarlig. Her kan du bekrefte din egen gjennomgang samtidig med publisering. Gjør du det etterpå, bruker du «Les og bekreft». Påkrevde utgaver står som ubekreftet til du selv har bekreftet dem. Andre ansatte bekrefter selv.</p><p className="ks-confirmation">{ACK_STATEMENT}</p><label className="ks-check"><input type="checkbox" checked={selfAcknowledgment} disabled={busy} onChange={event=>setSelfAcknowledgment(event.target.checked)}/>Jeg bekrefter også egen gjennomgang av denne utgaven.</label></div>
    <p className="ks-field-hint" role="status">{busy?'Godkjenner rutinen …':dirty?'Lagre endringene i redigeringen før du godkjenner.':summary.trim().length<5?'Fyll ut vurderingen over før du godkjenner. Skriv en kort setning om det du har sjekket.':`Klar til å godkjenne «${publication.draft.title}».`}</p>
    {error&&<p role="alert" className="ks-error">{error}</p>}
    <div className="ks-actions"><button type="button" className="ks-publish-button" disabled={busy||dirty||summary.trim().length<5} onClick={publishRoutine}>{busy?'Godkjenner …':'Godkjenn og publiser'}</button><button type="button" className="secondary" disabled={busy} onClick={()=>{setPublication(null);setOverviewFocus(previous=>previous+1)}}>Avbryt</button></div>
   </div>}
   <div className="ks-routine-overview" ref={overviewRef} tabIndex={-1}><h3>Firmaets rutiner ({data.routines.filter(routine=>!routine.archived).length})</h3>{canManage&&<p>Se statusen ved hver rutine. «Rediger her» åpner teksten. «Åpne godkjenning» og «Godkjenn endringene» åpner vurderingen. Knappen «Godkjenn og publiser» lagrer godkjenningen.</p>}<KshmsRoutineSearch label="Søk i firmaets rutiner" query={handbookQuery} onChange={setHandbookQuery} count={visibleRoutines.length} total={filterFirmRoutines(data,'').length}/></div>
   {handbookQuery.trim()&&!visibleRoutines.length&&<p className="ks-notice">Ingen rutiner passer søket. Prøv et annet ord eller tøm søket.</p>}
   {!data.routines.length&&<div className="ks-card"><h3>{canManage?'Ingen rutiner ennå':'Ingen rutiner tildelt'}</h3><p>{canManage?'Huk av standardrutiner over og trykk «Legg inn», eller lag en rutine fra blank mal.':'Du får rutiner her når firmaets ansvarlige har gitt deg dem.'}</p></div>}
   {[...new Set(visibleRoutines.map(r=>r.draft?.chapter||data.versions.find(v=>v.routine_id===r.id)?.content.chapter||'Historikk'))].map(chapter=><div className="ks-chapter" key={chapter}><h3>{chapter}</h3>{visibleRoutines.filter(r=>(r.draft?.chapter||data.versions.find(v=>v.routine_id===r.id)?.content.chapter||'Historikk')===chapter).map(r=>{
    const versions=data.versions.filter(v=>v.routine_id===r.id),approval=routineApprovalState(r,versions),current=approval.current;
    const newerProposal=canManage&&ROUTINE_CATALOG.find(template=>template.key===r.draft?.source_key&&template.source_revision>r.draft.source_revision);
    return <article className="ks-card" key={r.id}><div className="ks-row"><h4>{routineNumber(r.reference_number)&&`${routineNumber(r.reference_number)} · `}{r.draft?.title||current?.content.title}</h4><span className={`ks-badge ks-status-${approval.status}`}>{approval.label}</span></div>
     {newerProposal&&<p className="ks-field-hint">ProffDoks tekstforslag er oppdatert. Firmaets tekst er beholdt. Åpne «Rediger her» og «Vurder ProffDoks tekstforslag» hvis du vil se eller bruke endringene.</p>}
     {current&&<details><summary>Les publisert versjon {current.number}</summary><p>Endring: {current.change_summary}</p><KshmsVersionIdentity version={current} acknowledgment={data.acknowledgments.find(row=>row.user_id===userId&&row.version_id===current.id)} data={data} userId={userId}/><Content content={current.content}/><KshmsDocumentPdfButton kind="routine" row={current} companyId={companyId} userId={userId}/></details>}
     {canManage&&<div className="ks-actions">{!r.archived&&<button type="button" className="secondary" disabled={busy} aria-label={`Rediger her: ${r.draft.title}`} onClick={()=>chooseEditor(r.draft,r)}>Rediger her</button>}<button type="button" className="secondary" onClick={()=>chooseEditor({...r.draft,title:`${r.draft.title} (kopi)`})}>Kopier</button>{!r.archived&&canPublish&&approval.status!=='approved'&&<button type="button" disabled={busy||dirty||progress.step==='setup'} aria-label={`Åpne godkjenning: ${r.draft.title}`} onClick={()=>choosePublication(r)}>{approval.status==='changed'?'Godkjenn endringene':'Åpne godkjenning'}</button>}{!r.archived&&canAdmin&&<button type="button" className="secondary" disabled={busy} onClick={()=>{if(window.confirm('Arkiver rutinen? Publiserte versjoner og bekreftelser beholdes.'))run('archive',{id:r.id,revision:r.revision},'Rutinen er arkivert; historikken er bevart.')}}>Arkiver</button>}</div>}
     {versions.length>0&&<details><summary>Versjonshistorikk ({versions.length})</summary>{versions.map(v=><details key={v.id}><summary>Versjon {v.number} · {dateTime(v.published_at)} · {v.change_summary}</summary><Content content={v.content}/><KshmsDocumentPdfButton kind="routine" row={v} companyId={companyId} userId={userId}/><p>Godkjenner: {data.members.find(m=>m.id===v.published_by)?.email||v.published_by} · innholdskontroll: {v.content_hash}</p></details>)}</details>}
    </article>;
   })}</div>)}
   {canManage&&progress.step==='followup'&&!dirty&&<KshmsHandbookProgress progress={progress} dirty={dirty} busy={busy} canPublish={canPublish} onNext={nextStep} targetRef={completionRef} feedback={publicationFeedback} label="Neste steg etter siste godkjenning" announce={false}/>}
  </>}
  {screen==='personal'&&<KshmsPersonalHandbook data={data} userId={userId} query={personalQuery} onQueryChange={setPersonalQuery} busy={busy} ContentComponent={Content} onRead={version=>{setScreen('reading');chooseReading(version);}}/>}
  {screen==='reading'&&emailLink?.kind==='reading'&&<div className="ks-notice"><p>{emailLink.matchingCompany?'Du har åpnet en lenke til en rutineutgave.':'Lenken gjelder et annet firma. Bytt til riktig arbeidsprofil før du åpner rutinen.'}</p>{emailLink.matchingCompany&&<button type="button" disabled={busy} onClick={()=>{const version=data.versions.find(v=>v.id===emailLink.id);if(version&&data.assignments.some(a=>a.version_id===version.id&&a.user_id===userId))chooseReading(version);else setError('Utgaven er ikke tildelt deg i dette firmaet.');}}>Åpne rutinen fra e-posten</button>}</div>}
  {screen==='reading'&&<div className="ks-card"><h3>Her leser du rutinene du har fått</h3><p>Firmaets regel er at du skal lese og bekrefte rutinene før du begynner å arbeide. Det gjelder også firmaadmin og KS/HMS-ansvarlig. Ledelsen følger opp hvem som mangler gjennomgang.</p><p>Åpne en rutine og les hele teksten. Spør ansvarlig hvis noe er uklart. Når du har lest, huker du av og trykker «Bekreft». Når bekreftelsen er lagret, åpnes neste rutine som mangler bekreftelse. Du må lese og bekrefte hver rutine selv. Bekreftelsen viser at du selv har lest denne utgaven.</p><p>En versjon er en bestemt utgave av rutinen. Hvis teksten endres, kan du få en ny utgave å lese. Du skal fortsatt få opplæringen du trenger før du gjør arbeidet.</p><p className="ks-notice" role="status">{pending.length?`${pending.length} ${pending.length===1?'rutine venter':'rutiner venter'} på din bekreftelse.`:'Ingen rutiner venter på din bekreftelse.'}</p>
   <KshmsRoutineSearch label="Søk i rutinene du har fått" query={readingQuery} onChange={setReadingQuery} count={visibleAssignments.length} total={ownAssignments.length}/>
   {readingQuery.trim()&&!visibleAssignments.length&&<p>Ingen av rutinene dine passer søket. Prøv et annet ord eller tøm søket.</p>}
   {visibleAssignments.map(a=>{const v=data.versions.find(v=>v.id===a.version_id),ack=data.acknowledgments.find(k=>k.user_id===userId&&k.version_id===a.version_id);if(!v)return null;return <div key={v.id} className="ks-reading-row"><button type="button" className="secondary" disabled={busy} onClick={()=>chooseReading(v)}>{v.content.title} · v{v.number}</button><span>{ack?`Bekreftet ${dateTime(ack.acknowledged_at)}`:v.requires_ack||v.number===1?'Gjennomgang mangler':'Informasjon – ny bekreftelse valgfri'}</span></div>})}
   {reading&&<article className="ks-reading ks-flow-target" ref={readingRef} tabIndex={-1}><h3>{reading.content.title} · versjon {reading.number}</h3>{readingFeedback&&<p className="ks-notice" role="status">{readingFeedback}</p>}<KshmsVersionIdentity version={reading} acknowledgment={data.acknowledgments.find(row=>row.user_id===userId&&row.version_id===reading.id)} data={data} userId={userId}/><Content content={reading.content}/><KshmsDocumentPdfButton kind="routine" row={reading} companyId={companyId} userId={userId}/><p className="ks-confirmation">{ACK_STATEMENT}</p>{data.acknowledgments.some(a=>a.version_id===reading.id&&a.user_id===userId)?<p>Din bekreftelse er registrert.</p>:<><label className="ks-check"><input type="checkbox" checked={checked} disabled={busy} onChange={e=>setChecked(e.target.checked)}/>Jeg bekrefter egen gjennomgang og teksten over.</label>{error&&<p role="alert" className="ks-error">{error}</p>}<button type="button" disabled={!checked||busy} onClick={acknowledgeRoutine}>{busy?'Lagrer bekreftelsen …':`Bekreft versjon ${reading.number}`}</button></>}</article>}
   {!reading&&ownAssignments.length>0&&!pending.length&&<div className="ks-card ks-handbook-progress ready ks-flow-target" ref={readingDoneRef} tabIndex={-1} role="region" aria-label="Gjennomgangen er fullført"><h3>Du er ferdig med gjennomgangen</h3><p>Alle rutineutgaver som krever bekreftelse, er bekreftet. Du kan åpne rutinene over når du trenger dem. Nye eller viktige endringer kan gi deg en ny utgave å lese og bekrefte.</p><button type="button" className="secondary" onClick={()=>setScreen('personal')}>Åpne Min personalhåndbok</button>{readingFeedback&&<p className="ks-notice" role="status">{readingFeedback}</p>}</div>}
  </div>}
  {screen==='followup'&&canManage&&<>
   <KshmsSourceUpdates data={data} companyId={companyId} userId={userId} busy={busy} onReview={(routine,compare)=>chooseEditor(routine.draft,routine,compare)}/>
   <div className="ks-card ks-flow-target" ref={followupRef} tabIndex={-1}><h3>Neste steg: Ansatte leser og bekrefter</h3><p>Ansatte skal lese og bekrefte rutinene før de begynner å arbeide. Dette er firmaets regel. Firmaadmin og KS/HMS-ansvarlig følger opp hvem som mangler gjennomgang.</p><p>Når du godkjenner en rutine, får firmaadmin og ansatte med KS/HMS-tilgang utgaven i «Les og bekreft». De åpner hver rutine i sin egen app, leser teksten og bekrefter egen gjennomgang. Avklar spørsmål og nødvendig opplæring med dem.</p><p>Firmaadmin gir andre ansatte tilgang i «Oppstart og tilgang». Etterpå kan du gi nye medarbeidere de godkjente rutinene under. Utgaver som krever egen gjennomgang, får også et e-postvarsel når firmaets e-postutsending er aktivert.</p>
    {canAdmin&&<button type="button" className="secondary" onClick={()=>{setScreen('setup');setFlowFocus(previous=>previous+1)}}>Velg ansattes tilgang</button>}
    {pending.length>0&&<p>Du har også egne rutiner å lese. Åpne fanen «Les og bekreft» og bekreft din egen gjennomgang.</p>}
    <KshmsAcknowledgments overview={followup}/>
    <details className="ks-followup-section"><summary>Gi godkjente rutiner til nye medarbeidere</summary><p>Dette bruker du når en medarbeider trenger en godkjent utgave som personen ikke har fått. Firmaadmin gir først KS/HMS-tilgang. Åpne rutinen og trykk «Tildel til» ved medarbeideren.</p>{assignmentOptions.length?assignmentOptions.map(({version,members})=><details key={version.id}><summary>{version.content.title} · v{version.number}</summary><div className="ks-actions">{members.map(member=><button type="button" className="secondary" key={member.id} disabled={busy} onClick={()=>run('assign',{version_id:version.id,user_id:member.id})}>Tildel til {member.email}</button>)}</div></details>):<p>{latest.length?'Alle med KS/HMS-tilgang har allerede fått de gjeldende godkjente utgavene. Du trenger ikke tildele dem på nytt.':'Godkjenn rutiner før du tildeler dem til medarbeidere.'}</p>}</details>
   </div>
   <div className="ks-card"><h3>Her kontrollerer dere at håndboken fortsatt passer</h3><p>Å kontrollere og oppdatere håndboken kalles revisjon. Les rutinene og sjekk om de passer arbeidet dere gjør nå. Noter hva som må endres, hvem som gjør det, og når det skal være klart.</p><p className={overdue?'ks-error':''}>Neste kontroll: {data.settings?.next_review_on||'Lagre oppstart først'}{overdue?' · Datoen er passert':''}</p><p>I ProffDok skal håndboken kontrolleres minst én gang i året. Dette er vår avtalte regel. Endringer eller hendelser kan gjøre at dere må kontrollere tidligere. Den valgte KS/HMS-ansvarlige signerer kontrollen.</p>
    <p>Neste steg etter publisering er at ansatte leser rutinene. Du trenger ikke signere en revisjon bare for å gå videre. Åpne kontrollen under når du faktisk skal gjennomgå håndboken.</p>
    <details className="ks-followup-section" ref={reviewRef} tabIndex={-1}><summary>Gjennomfør revisjon</summary>{data.context.responsible?<form onSubmit={async e=>{e.preventDefault();const result=await run('review',{settings_revision:data.settings.revision,version_snapshot:currentVersionSnapshot(data),findings,follow_up:followUp,next_review_on:nextReview},'Kontrollen er signert og lagret sammen med utgavene du kontrollerte.');if(result){setReviewChecked(false);setFindings('');setFollowUp('')}}}>
     <p>Kontrollen gjelder {latest.length} godkjente rutiner. Sjekk også om utkast må ferdigstilles eller gamle rutiner tas ut av bruk før du signerer.</p>
     <Field label="Hva har du kontrollert?" hint="Skriv hvilke rutiner du har gått gjennom, og om noe må endres." value={findings} onChange={setFindings} multiline required/>
     <Field label="Hva skal gjøres videre?" hint="Skriv hva som skal gjøres, hvem som gjør det, og fristen. Hvis alt er i orden, forklar kort hvorfor." value={followUp} onChange={setFollowUp} multiline required/>
     <Field label="Neste revisjonsdato (innen ett år)" value={nextReview} type="date" onChange={setNextReview} required/>
     <label className="ks-check"><input type="checkbox" checked={reviewChecked} onChange={e=>setReviewChecked(e.target.checked)}/>Jeg har vurdert de oppførte versjonene, relevans og etterlevelse, og dokumentert funn og oppfølging. Dette er ingen myndighetsgodkjenning.</label><button disabled={busy||!reviewChecked||!latest.length}>Signer revisjon</button>
    </form>:<p>Du kan følge opp og forberede endringer. Personen som er valgt som KS/HMS-ansvarlig i «Oppstart og tilgang», må signere kontrollen.</p>}</details>
    <details><summary>Revisjonshistorikk ({data.reviews.length})</summary>{data.reviews.map(r=><article key={r.id}><h4>{dateTime(r.signed_at)} · {data.members.find(m=>m.id===r.signed_by)?.email||r.signed_by}</h4><p>{r.statement}</p><p className="ks-text">{r.findings}</p><p className="ks-text">{r.follow_up}</p><p>Neste revisjon: {r.next_review_on} · {r.version_snapshot.length} versjoner</p>{r.version_snapshot.map(s=>{const v=data.versions.find(v=>v.id===s.id);return <p key={s.id}>{v?`${v.content.title} · v${v.number}`:s.id}</p>})}</article>)}</details>
   </div>
  </>}
 </section>;
}
