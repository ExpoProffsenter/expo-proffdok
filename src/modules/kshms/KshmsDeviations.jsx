import { useEffect,useId,useRef,useState } from 'react';
import { getAppSupabaseClient } from '../access/appSupabaseClientRegistry.js';
import { kshmsRpc } from './kshmsAccess.js';
import { ProjectChoice, RoutineChoice, useKshmsJobChoices } from './KshmsJobChoices.jsx';
import { appendSjaSuggestion } from './kshmsSja.mjs';
import { RUH_HINTS, RUH_SUGGESTIONS, ruhRegistrationIssues } from './kshmsRuh.mjs';
import { identityText } from './kshmsPersonal.mjs';
import { formatDeviationDate, formatDeviationDateTime } from '../deviations/deviationDates.mjs';
import { DeviationEditorSurface } from '../deviations/DeviationDialog.jsx';
import KshmsRuhPdfButton from './KshmsRuhPdfButton.jsx';
import { DEVIATION_CATEGORY,DEVIATION_STATUS,DEVIATION_CHANGE_EVENT,DEVIATION_CLOSURE_REQUIREMENTS,deviationClosureIssues,deviationForm,validateDeviation,saveDeviation,publishDeviationChange,storeDeviationDraft,readDeviationDraft,deviationDraftKey,deviationFileType } from './kshmsDeviations.mjs';

const when=formatDeviationDateTime;
const notes=[['Årsak','cause'],['Strakstiltak','immediate_action'],['Utførte tiltak / forbedring','improvement_action'],['Videre oppfølging','follow_up'],['Egen kontroll av resultatet','control_note']];
const eventNames={create:'Registrert',save:'Endret',close:'Lukket etter egen kontroll',reopen:'Gjenåpnet',file:'Vedlegg lagt til'};
function Field({label,value,onChange,multiline=false,type='text',required=false,maxLength=20000,hint='',error='',inputRef,suggestions=[]}) {
 const id=useId(),descriptionId=`${id}-description`;
 const props={ref:inputRef,id,value:value||'',onChange:e=>onChange(e.target.value),required,maxLength,'aria-invalid':error?true:undefined,'aria-describedby':hint||error?descriptionId:undefined};
 return <div className={`ks-field${error?' ks-field-invalid':''}`}><label htmlFor={id}>{label}</label>{(hint||error)&&<small id={descriptionId} className={error?'ks-field-error':'ks-field-hint'}>{error||hint}</small>}{multiline?<textarea {...props} rows={4}/>:<input {...props} type={type}/>}{suggestions.length>0&&<details className="sja-suggestions"><summary>Se forslag til {label.toLocaleLowerCase('nb-NO')}</summary><p>Velg og tilpass til det som faktisk skjedde. Erstatt [klammene]. Forslaget bekrefter ingen utførte tiltak.</p>{suggestions.map(text=><button type="button" className="secondary" key={text} onClick={()=>onChange(appendSjaSuggestion(value,text,multiline?'\n':' · '))}>{text}</button>)}</details>}</div>;
}
function Snapshot({row}) {
 return <dl className="ks-case-snapshot"><dt>Tittel</dt><dd>{row.title}</dd><dt>Hendelse</dt><dd>{row.event}</dd><dt>Type</dt><dd>{DEVIATION_CATEGORY[row.category]}</dd>{row.project_id&&<><dt>Prosjekt</dt><dd>Koblet til firmaprosjekt</dd></>}{row.project_reference&&<><dt>Ekstern / egen referanse</dt><dd>{row.project_reference}</dd></>}{row.routines&&<><dt>Rutiner</dt><dd>{row.routines}</dd></>}<dt>Ansvarlig</dt><dd>{identityText(row.responsible_identity)}</dd><dt>Frist / status</dt><dd>{formatDeviationDate(row.due_on)} · {DEVIATION_STATUS[row.status]}</dd>{notes.map(([label,key])=>row[key]?<div key={key}><dt>{label}</dt><dd>{row[key]}</dd></div>:null)}{row.closed_at&&<><dt>Lagret lukking</dt><dd>{identityText(row.closed_identity)} · {when(row.closed_at)}</dd></>}</dl>;
}

export default function KshmsDeviations({context,request,projectId=null,ruhOnly=false,scopeReadOnly=false,active=true}) {
 const companyId=context.company_id,userId=context.user_id;
 const [overview,setOverview]=useState(null),[status,setStatus]=useState('open'),[query,setQuery]=useState(''),[search,setSearch]=useState('');
 const [detail,setDetail]=useState(null),[form,setForm]=useState(null),[revision,setRevision]=useState(0),[source,setSource]=useState(null),[requestId,setRequestId]=useState('');
 const [files,setFiles]=useState([]),[fileLinks,setFileLinks]=useState({}),[dirty,setDirty]=useState(false),[cached,setCached]=useState(()=>readDeviationDraft(window.localStorage,userId,companyId,projectId));
 const [busy,setBusy]=useState(false),[loading,setLoading]=useState(false),[caseLoading,setCaseLoading]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[conflict,setConflict]=useState(null);
 const [controlled,setControlled]=useState(false),[reason,setReason]=useState(''),[reopenResponsible,setReopenResponsible]=useState(''),[reopenDue,setReopenDue]=useState(''),[pendingFile,setPendingFile]=useState(false);
 const [closureAttempted,setClosureAttempted]=useState(false),closureFields=useRef({});
 const [registrationAttempted,setRegistrationAttempted]=useState(false),[registrationFocus,setRegistrationFocus]=useState(0),registrationSummary=useRef(null),registrationFields=useRef({});
 const choices=useKshmsJobChoices(context,Boolean(form));
 const closureIssues=deviationClosureIssues(form||{});
 const scope=useRef(null),listSerial=useRef(0),caseSerial=useRef(0),locked=useRef(false),handled=useRef(null),pendingUpload=useRef(null);
 const current=owner=>owner?.active&&scope.current===owner;
 const members=overview?.members||[],row=detail?.case;
 const editable=Boolean(form&&!scopeReadOnly&&(!projectId||Boolean(overview))&&!overview?.project?.locked&&(!row||row.status!=='closed'&&(context.manage||row.responsible_id===userId)));
 const canClose=Boolean(editable&&row?.status!=='closed'&&row?.responsible_id===userId);
 const isRuh=form?.category==='ruh',registrationIssues=registrationAttempted&&isRuh?ruhRegistrationIssues(form,members):[];
 useEffect(()=>{if(registrationFocus)registrationSummary.current?.focus();},[registrationFocus]);

 useEffect(()=>{const owner={active:true};scope.current=owner;return()=>{owner.active=false;listSerial.current++;caseSerial.current++;};},[companyId,userId,projectId]);
 const loadOverview=async(cursor=null)=>{
  const owner=scope.current,serial=++listSerial.current;if(!current(owner))return;
  setLoading(true);
  try{const result=await kshmsRpc(projectId?'kshms_project_ruh_state':'kshms_deviation_state',{p_company_id:companyId,p_status:status,p_query:query,p_before:cursor?.before||null,p_before_id:cursor?.id||null,...(projectId?{p_project_id:projectId}:{})});
   if(!current(owner)||serial!==listSerial.current)return;
   if(result.context?.company_id!==companyId||result.context?.user_id!==userId||result.context?.enabled===false||projectId&&result.context.project_id!==projectId)throw new Error('Tilgangen til firmaet og prosjektet må kontrolleres på nytt.');
   setOverview(previous=>cursor&&previous?{...result,cases:[...new Map([...previous.cases,...result.cases].map(x=>[x.id,x])).values()]}:result);
  }catch(e){if(current(owner)&&serial===listSerial.current){if(e.code==='42501'){caseSerial.current++;setOverview(null);setDetail(null);setForm(null);setDirty(false);setConflict(null);setFiles([]);setFileLinks({});setCaseLoading(false);}setError(e.message);}}
  finally{if(current(owner)&&serial===listSerial.current)setLoading(false);}
 };
 useEffect(()=>{loadOverview();},[companyId,userId,projectId,status,query]);
 useEffect(()=>{const refresh=e=>{if(e.detail?.company_id===companyId)loadOverview();};window.addEventListener(DEVIATION_CHANGE_EVENT,refresh);return()=>window.removeEventListener(DEVIATION_CHANGE_EVENT,refresh);},[companyId,userId,status,query]);
 useEffect(()=>{const warn=e=>{if(dirty){e.preventDefault();e.returnValue='';}};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);},[dirty]);
 const keepDraft=(next,nextSource=source)=>{
  const draft={form:next,id:row?.id||null,revision,requestId,source:nextSource,projectId:row?.project_id||nextSource?.project_id||projectId};
  if(storeDeviationDraft(window.localStorage,userId,companyId,draft,projectId))setCached({...draft,userId,companyId});
  else setError('Denne enheten kunne ikke sikre kladden. Behold siden åpen til avviket er lagret.');
 };
 const change=(key,value)=>{const next={...form,[key]:value};setForm(next);setDirty(true);setControlled(false);keepDraft(next);};
 const selectProject=id=>{const nextSource={...source,project_id:id,source_kind:'company'};setSource(nextSource);setDirty(true);keepDraft(form,nextSource);};
 const leaveEditor=()=>!locked.current&&(!dirty||window.confirm('Bytte avvik? Den ulagrede kladden er beholdt på denne enheten.'))&&(!pendingUpload.current||window.confirm('Vedlegget er ikke ferdig lagret. Bytte sak? Du kan velge filen på nytt senere.'));
 const installDetail=result=>{
  setDetail(result);setForm({...deviationForm(result.case),include_in_report:result.case.include_in_report});setRevision(result.case.revision);setSource(null);setDirty(false);setControlled(false);setClosureAttempted(false);setConflict(null);
  setReopenResponsible(result.case.responsible_id);setReopenDue(result.case.due_on);setReason('');pendingUpload.current=null;setPendingFile(false);
 };
 const openCase=async(id,restore=null)=>{
  if(!leaveEditor())return;
  const recovered=restore||(cached?.id===id?cached:null);
  const owner=scope.current,serial=++caseSerial.current;setCaseLoading(true);setError('');setNotice('');setFiles([]);setFileLinks({});
  try{const result=await kshmsRpc('kshms_deviation_detail',{p_company_id:companyId,p_id:id});
   if(!current(owner)||serial!==caseSerial.current)return;
   if(result.case?.company_id!==companyId||result.case.id!==id||projectId&&(result.case.project_id!==projectId||result.case.category!=='ruh'))throw new Error('Saken kunne ikke kontrolleres for dette firmaet og prosjektet.');
   installDetail(result);
   if(recovered){setForm(recovered.form);setRevision(recovered.revision);setDirty(true);setNotice('Din ulagrede tekst er hentet tilbake.');if(result.case.revision!==recovered.revision)setConflict(result);}
   try{const items=await kshmsRpc('kshms_deviation_files',{p_company_id:companyId,p_id:id});if(current(owner)&&serial===caseSerial.current)setFiles(items);}catch{if(current(owner)&&serial===caseSerial.current)setError('Saken er åpnet, men vedleggene kunne ikke hentes. Trykk «Oppdater sak».');}
  }catch(e){if(current(owner)&&serial===caseSerial.current)setError(e.message);}
  finally{if(current(owner)&&serial===caseSerial.current)setCaseLoading(false);}
 };
 const newCase=(link=null,restore=null)=>{
  if(scopeReadOnly||overview?.project?.locked||!leaveEditor())return;
  if(projectId)link={...link,project_id:projectId,source_kind:'company',category:'ruh'};
  setRegistrationAttempted(false);
  caseSerial.current++;setCaseLoading(false);setDetail(null);setFiles([]);setFileLinks({});setConflict(null);setError('');setNotice('');setControlled(false);setClosureAttempted(false);setSource(restore?.source||link);setRequestId(restore?.requestId||crypto.randomUUID());setRevision(0);
  setForm(restore?.form||deviationForm({title:link?.title||'',event:link?.event||'',category:link?.category||'hms',due_on:link?.due_on||'',immediate_action:link?.immediate_action||''}));setDirty(Boolean(restore));pendingUpload.current=null;setPendingFile(false);
 };
 useEffect(()=>{
  if(!request||request.companyId!==companyId||request.userId!==userId||handled.current===request.nonce||locked.current)return;
  handled.current=request.nonce;
  if(request.id)openCase(request.id);else if(request.source)newCase(request.source);
 },[request?.nonce,companyId,userId,busy]);
 const restoreDraft=()=>{if(cached?.id)openCase(cached.id,cached);else if(cached)newCase(null,cached);};
 const dismissEditor=()=>{if(locked.current)return;if(dirty)keepDraft(form);caseSerial.current++;setCaseLoading(false);setForm(null);setDetail(null);setDirty(false);setConflict(null);setFiles([]);setFileLinks({});};
 const focusClosureField=key=>{const field=closureFields.current[key];field?.focus({preventScroll:true});field?.scrollIntoView({block:'center',behavior:'smooth'});};
 const save=async(action)=>{
  if(locked.current||!form||!editable)return;
  if(isRuh&&!row){setRegistrationAttempted(true);if(ruhRegistrationIssues(form,members).length){setError('');setRegistrationFocus(previous=>previous+1);return;}}
  if(action==='close'){setClosureAttempted(true);const missing=deviationClosureIssues(form);if(missing.length){setError('');focusClosureField(missing[0].key);return;}}
  const validation=validateDeviation(form,{closing:action==='close'});if(validation){setError(validation);return;}
  if(action==='close'&&(!canClose||!controlled))return;
  const owner=scope.current,id=row?.id,serial=caseSerial.current;
  if(!current(owner))return;
  locked.current=true;setBusy(true);setError('');setNotice('');keepDraft(form);
  try{const payload=id?{...form,id,revision,...(action==='close'?{controlled:true}:{})}:{...form,request_id:requestId,...(source?{project_id:source.project_id,source_kind:source.source_kind,source_key:source.source_key,source_group:source.source_group,source_item:source.source_item}:{source_kind:'company'})};
   const result=await saveDeviation({rpc:kshmsRpc,companyId,userId,action:id?action:'create',payload,isCurrent:()=>current(owner)&&serial===caseSerial.current});
   if(!result)return;
   installDetail(result);window.localStorage.removeItem(deviationDraftKey(userId,companyId,projectId));setCached(null);setNotice(action==='close'?'Avviket er lukket og lagret.':isRuh?'RUH-en er lagret.':'Avviket er lagret.');publishDeviationChange(result.case);
   if(action==='close'){setForm(null);setDetail(null);setFiles([]);setFileLinks({});return;}
   try{const items=await kshmsRpc('kshms_deviation_files',{p_company_id:companyId,p_id:result.case.id});if(current(owner)&&serial===caseSerial.current)setFiles(items);}catch{if(current(owner))setError('Avviket er lagret, men vedleggene kunne ikke oppdateres. Trykk «Oppdater sak».');}
  }catch(e){if(current(owner)&&serial===caseSerial.current){setError(e.code==='40001'?'En annen har endret saken. Din kladd er beholdt. Sammenlign med lagret sak under før du lagrer igjen.':`Kunne ikke bekrefte lagringen. Kladden er beholdt. ${e.message}`);if(id)try{const server=await kshmsRpc('kshms_deviation_detail',{p_company_id:companyId,p_id:id});if(current(owner)&&serial===caseSerial.current)setConflict(server);}catch{}}}
  finally{locked.current=false;if(current(owner))setBusy(false);}
 };
 const reopen=async()=>{
  if(locked.current||reason.trim().length<10||!context.manage||!row)return;
  const owner=scope.current,serial=caseSerial.current;locked.current=true;setBusy(true);setError('');
  try{const result=await saveDeviation({rpc:kshmsRpc,companyId,userId,action:'reopen',payload:{id:row.id,revision:row.revision,reason,responsible_id:reopenResponsible,due_on:reopenDue},isCurrent:()=>current(owner)&&serial===caseSerial.current});
   if(result){installDetail(result);setNotice('Saken er gjenåpnet. Valgt ansvarlig får oppgaven.');publishDeviationChange(result.case);}
  }catch(e){if(current(owner))setError(e.message);}finally{locked.current=false;if(current(owner))setBusy(false);}
 };
 const uploadFile=async(file=null)=>{
  if(locked.current||!row||row.status==='closed')return;
  const owner=scope.current,id=row.id,serial=caseSerial.current;locked.current=true;setBusy(true);setError('');
  try{
   let job=pendingUpload.current;
   if(file){job={file,type:deviationFileType(file),reservation:null};pendingUpload.current=job;}
   if(!job)return;
   if(!job.reservation)job.reservation=await kshmsRpc('kshms_deviation_file_command',{p_company_id:companyId,p_action:'reserve',p_payload:{deviation_id:id,name:job.file.name,mime_type:job.type,size_bytes:job.file.size}});
   if(!current(owner)||serial!==caseSerial.current)return;
   const args={p_company_id:companyId,p_action:'commit',p_payload:{deviation_id:id,id:job.reservation.id}};
   let committed=false;
   try{await kshmsRpc('kshms_deviation_file_command',args);committed=true;}catch(e){if(!e.message.includes('Upload missing or file metadata mismatch'))throw e;}
   if(!committed){const client=getAppSupabaseClient();if(!client)throw new Error('Innloggingen er ikke klar.');const uploaded=await client.storage.from('kshms-private').upload(job.reservation.object_name,job.file,{contentType:job.type,upsert:false});if(uploaded.error)throw uploaded.error;await kshmsRpc('kshms_deviation_file_command',args);}
   if(!current(owner)||serial!==caseSerial.current)return;
   pendingUpload.current=null;setPendingFile(false);setNotice('Vedlegget er lagret med tilgang til denne saken.');
   try{const items=await kshmsRpc('kshms_deviation_files',{p_company_id:companyId,p_id:id});if(current(owner)&&serial===caseSerial.current)setFiles(items);}catch{if(current(owner)&&serial===caseSerial.current)setError('Vedlegget er lagret, men listen kunne ikke oppdateres. Trykk «Oppdater sak».');}
  }catch(e){if(current(owner)&&serial===caseSerial.current){setPendingFile(Boolean(pendingUpload.current));setError(`Vedlegget kunne ikke bekreftes. ${e.message}`);}}
  finally{locked.current=false;if(current(owner))setBusy(false);}
 };
 const linkFile=async(file)=>{
  const owner=scope.current,serial=caseSerial.current;setError('');
  try{const client=getAppSupabaseClient();if(!client)throw new Error('Innloggingen er ikke klar.');const {data,error:failure}=await client.storage.from('kshms-private').createSignedUrl(file.object_name,60);if(failure)throw failure;if(current(owner)&&serial===caseSerial.current)setFileLinks(previous=>({...previous,[file.id]:data.signedUrl}));}
  catch(e){if(current(owner))setError(`Vedlegget kunne ikke åpnes. ${e.message}`);}
 };
 const olderEvents=async()=>{
  if(!detail?.next||locked.current)return;const owner=scope.current,serial=caseSerial.current;setCaseLoading(true);
  try{const result=await kshmsRpc('kshms_deviation_detail',{p_company_id:companyId,p_id:row.id,p_before:detail.next.before,p_before_id:detail.next.id});if(current(owner)&&serial===caseSerial.current)setDetail(previous=>({...previous,events:[...new Map([...previous.events,...result.events].map(x=>[x.id,x])).values()],next:result.next}));}
  catch(e){if(current(owner)&&serial===caseSerial.current)setError(e.message);}finally{if(current(owner)&&serial===caseSerial.current)setCaseLoading(false);}
 };

 return <section aria-label="KS/HMS avvikssentral">
  <div className="ks-card"><div className="ks-row"><h3>{projectId?'RUH for dette prosjektet':'Avvik og RUH'}</h3><div className="ks-actions">{!ruhOnly&&<button type="button" disabled={busy||caseLoading||scopeReadOnly} onClick={()=>newCase()}>Registrer avvik</button>}<button type="button" disabled={busy||caseLoading||scopeReadOnly||overview?.project?.locked||Boolean(projectId&&!overview)} onClick={()=>newCase({category:'ruh',source_kind:'company',project_id:projectId})}>Registrer RUH</button></div></div><p>Beskriv hendelsen, velg ansvarlig og sett frist. Ansvarlig dokumenterer tiltak og egen kontroll og lukker selv. Bare ansvarlig får det faste varselet. Private personalsaker og fortrolige varsler følger firmaets separate kanal.</p>
   <p>RUH betyr rapport om uønsket hendelse. Meld skader, farlige forhold og nestenulykker, også når det gikk bra denne gangen.</p>
   {!context.manage&&<p>Her ser du saker du har meldt eller fått ansvar for.</p>}
   <div className="ks-actions"><button type="button" className={status==='open'?'active':'secondary'} aria-pressed={status==='open'} onClick={()=>setStatus('open')}>Åpne ({overview?.counts?.open??'…'})</button><button type="button" className={status==='closed'?'active':'secondary'} aria-pressed={status==='closed'} onClick={()=>setStatus('closed')}>Lukkede ({overview?.counts?.closed??'…'})</button><button type="button" className="secondary" disabled={loading} onClick={()=>loadOverview()}>Oppdater liste</button></div>
   <form className="ks-case-search" onSubmit={e=>{e.preventDefault();setQuery(search.trim());}}><Field label="Søk i tittel, hendelse eller ansvarlig" value={search} onChange={setSearch} maxLength={200}/><button type="submit">Søk</button>{query&&<button type="button" className="secondary" onClick={()=>{setSearch('');setQuery('');}}>Tøm søk</button>}</form>
   {loading&&<p role="status">Henter saker …</p>}
   <div className="ks-case-list">{overview?.cases.map(item=><button type="button" className="secondary ks-case-row" key={item.id} disabled={busy||caseLoading} onClick={()=>openCase(item.id)}><strong>{item.title}</strong><span>{DEVIATION_CATEGORY[item.category]} · {DEVIATION_STATUS[item.status]} · frist {formatDeviationDate(item.due_on)}</span><span>Ansvarlig: {identityText(item.responsible_identity)}</span></button>)}</div>
   {overview&&!overview.cases.length&&!loading&&<p>{query?'Ingen saker passer søket.':status==='closed'?'Ingen lukkede saker å vise.':'Ingen åpne saker å vise.'}</p>}
   {overview?.next&&<button type="button" className="secondary" disabled={loading} onClick={()=>loadOverview(overview.next)}>Vis flere saker</button>}
  </div>
  {cached&&!dirty&&<div className="ks-card"><p>En ulagret avvikskladd er beholdt på denne enheten: «{cached.form.title||'Nytt avvik'}».</p><button type="button" className="secondary" disabled={busy||caseLoading} onClick={restoreDraft}>Hent avvikskladd</button><button type="button" className="secondary" disabled={busy} onClick={()=>{if(window.confirm('Slette den lokale avvikskladden?')){window.localStorage.removeItem(deviationDraftKey(userId,companyId,projectId));setCached(null);}}}>Slett lokal kladd</button></div>}
  {!form&&<>{error&&<p className="ks-error" role="alert">{error}</p>}{notice&&<p className="ks-notice" role="status">{notice}</p>}{caseLoading&&<p role="status">Henter sak …</p>}</>}
  {form&&active&&<DeviationEditorSurface modal title={row?row.title:isRuh?'Registrer RUH':'Registrer avvik'} onClose={dismissEditor} busy={busy||caseLoading}>
   {error&&<p className="ks-error" role="alert">{error}</p>}{notice&&<p className="ks-notice" role="status">{notice}</p>}{caseLoading&&<p role="status">Henter sak …</p>}
   {row&&<span className="ks-badge">{DEVIATION_STATUS[row.status]}</span>}
   {row&&<p>Meldt av {identityText(row.creator_identity)} · {when(row.created_at)} {row.project_id&&'· Koblet til prosjekt'}</p>}
   {row?.category==='ruh'&&<KshmsRuhPdfButton row={row} companyId={companyId} userId={userId} projectId={projectId} active={active} disabled={dirty||busy||caseLoading||pendingFile}/>}
   {source&&source.source_kind!=='company'&&<p>Dette kobler det lagrede {source.source_kind==='checklist'?'sjekkpunktavviket':'prosjektavviket'} til KS/HMS. Etter lagring styres lukkingen her.</p>}
   {row&&!editable?<Snapshot row={row}/>:<form noValidate={isRuh} onSubmit={e=>{e.preventDefault();save('save');}}>
    <fieldset disabled={busy||caseLoading||!editable} className="ks-case-fields"><legend>Hendelse og ansvar</legend>
     {isRuh&&registrationIssues.length>0&&<div className="ks-closure-missing" role="alert" tabIndex={-1} ref={registrationSummary}><strong>Dette mangler før du kan registrere RUH</strong><ul>{registrationIssues.map(item=><li key={item.key}><button type="button" className="secondary" onClick={()=>registrationFields.current[item.key]?.focus()}>{item.label}</button></li>)}</ul></div>}
     {isRuh&&<ProjectChoice choices={choices} projectId={row?.project_id||source?.project_id||null} projectName={overview?.project?.name} fixed={Boolean(row||projectId||source&&source.source_kind!=='company')} onSelect={selectProject}/>}
     {isRuh&&<Field label="Ekstern ordre / egen referanse" value={form.project_reference} onChange={v=>change('project_reference',v)} hint="For eksternt oppdrag eller din egen referanse. Firmaprosjekt velges i listen over." maxLength={4000} suggestions={['Eksternt oppdrag: [ordrenummer / oppdragsgiver]']}/>}
     <Field label="Kort tittel" value={form.title} onChange={v=>change('title',v)} required maxLength={200} inputRef={node=>{registrationFields.current.title=node;}} hint={isRuh?RUH_HINTS.title:''} suggestions={isRuh?RUH_SUGGESTIONS.title:[]}/><Field label="Hva skjedde / hva er feil?" value={form.event} onChange={v=>change('event',v)} multiline required inputRef={node=>{registrationFields.current.event=node;}} hint={isRuh?RUH_HINTS.event:''} suggestions={isRuh?RUH_SUGGESTIONS.event:[]}/>
     <div className="ks-case-grid"><label className="ks-field"><span>Type avvik</span><select disabled={ruhOnly} value={form.category} onChange={e=>change('category',e.target.value)}>{Object.entries(DEVIATION_CATEGORY).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
     <label className="ks-field"><span>Ansvarlig</span><select ref={node=>{registrationFields.current.responsible_id=node;}} required value={form.responsible_id} disabled={Boolean(row&&!context.manage)} onChange={e=>change('responsible_id',e.target.value)}><option value="">Velg medarbeider</option>{form.responsible_id&&!members.some(m=>m.id===form.responsible_id)&&<option value={form.responsible_id} disabled>{identityText(row?.responsible_identity)} – tilgang må avklares</option>}{members.map(member=><option key={member.id} value={member.id}>{identityText(member.identity)}</option>)}</select></label><Field label="Frist" value={form.due_on} onChange={v=>change('due_on',v)} type="date" required inputRef={node=>{registrationFields.current.due_on=node;}}/></div>
     <Field label="Strakstiltak / sikring nå" value={form.immediate_action} onChange={v=>change('immediate_action',v)} multiline hint={isRuh?RUH_HINTS.immediate_action:''} suggestions={isRuh?RUH_SUGGESTIONS.immediate_action:[]}/>
     {isRuh&&<><RoutineChoice choices={choices} onSelect={text=>change('routines',appendSjaSuggestion(form.routines,text))}/><Field label="Relevante rutiner" value={form.routines} onChange={v=>change('routines',v)} multiline maxLength={4000} hint="Valgfritt. Velg bedriftens rutiner over eller skriv annen relevant instruks."/></>}
     {row&&<><label className="ks-field"><span>Status under arbeid</span><select value={form.status} onChange={e=>change('status',e.target.value)}><option value="open">Åpent</option><option value="in_progress">Under behandling</option></select></label>{notes.filter(([,key])=>key!=='immediate_action').map(([label,key])=>{const requirement=DEVIATION_CLOSURE_REQUIREMENTS.find(item=>item.key===key);return <Field key={key} label={label} value={form[key]} onChange={v=>change(key,v)} multiline inputRef={element=>{closureFields.current[key]=element;}} suggestions={isRuh?RUH_SUGGESTIONS[key]||[]:[]} hint={[isRuh?RUH_HINTS[key]:'',requirement?'Kreves ved lukking. Kort tekst, for eksempel «OK», godtas.':''].filter(Boolean).join(' ')} error={closureAttempted?closureIssues.find(item=>item.key===key)?.message:''}/>;})}{row.source_kind==='project'&&<label className="ks-check"><input type="checkbox" checked={Boolean(form.include_in_report)} onChange={e=>change('include_in_report',e.target.checked)}/>Ta med i sluttrapport</label>}</>}
     <div className={!row?'deviation-dialog-footer':'ks-actions'}>{!row&&<button type="button" className="secondary" onClick={dismissEditor}>Behold kladd og lukk</button>}<button type="submit" className={row?'secondary':undefined}>{busy?'Lagrer …':row?'Lagre uten å lukke':isRuh?'Lagre RUH for oppfølging':'Lagre avvik for oppfølging'}</button></div>
    </fieldset>
   </form>}
   {row?.status!=='closed'&&row&&<div className="ks-case-closure"><h4>Lukking etter egen kontroll</h4>{canClose?<><p>Fyll feltene merket «Kreves ved lukking», bekreft egen kontroll og trykk «Lagre og lukk avvik». Knappen lagrer også teksten.</p>{closureAttempted&&closureIssues.length>0&&<div className="ks-closure-missing" role="alert"><strong>Fyll inn før du lukker:</strong><ul>{closureIssues.map(item=><li key={item.key}><button type="button" className="secondary" onClick={()=>focusClosureField(item.key)}>{item.label}</button></li>)}</ul></div>}<label className="ks-check"><input type="checkbox" checked={controlled} disabled={busy||caseLoading} onChange={e=>setControlled(e.target.checked)}/>Jeg har gjennomført og dokumentert tiltakene og kontrollert at resultatet er i orden.</label><button type="button" disabled={busy||caseLoading||!controlled||pendingFile} onClick={()=>save('close')}>{busy?'Lagrer …':isRuh?'Lagre og lukk RUH':'Lagre og lukk avvik'}</button>{pendingFile&&<p>Fullfør vedlegget før du lukker.</p>}</>:<p>Valgt ansvarlig må dokumentere kontrollen og lukke selv. {context.manage?'Du kan endre ansvarlig hvis oppgaven skal overtas av en annen.':'Lesing av saken fjerner ikke ansvarligvarselet.'}</p>}</div>}
   {row&&<section className="ks-case-files" aria-label="Vedlegg til avvik"><h4>Vedlegg ({files.length})</h4><p>Vedlegg kan åpnes av personer med tilgang til denne saken. PDF, bilder, Word og Excel, maks 10 MB per fil.</p><ul>{files.map(file=><li key={file.id}>{file.name} · {Math.ceil(file.size_bytes/1024)} KB <button type="button" className="secondary" onClick={()=>linkFile(file)}>Hent sikker lenke</button>{fileLinks[file.id]&&<a href={fileLinks[file.id]} target="_blank" rel="noreferrer">Åpne {file.name}</a>}</li>)}</ul>{row.status!=='closed'&&<label className="ks-field"><span>Legg til vedlegg</span><input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.docx,.xlsx" disabled={busy||caseLoading||pendingFile} onChange={e=>{const file=e.target.files?.[0];e.target.value='';if(file)uploadFile(file);}}/></label>}{pendingFile&&<button type="button" disabled={busy} onClick={()=>uploadFile()}>Fullfør vedlegg</button>}</section>}
   {row?.status==='closed'&&context.manage&&<details><summary>Åpne saken igjen</summary><p>Forklar hvorfor og velg en ansvarlig som fortsatt har tilgang. Historikken fra tidligere lukking beholdes.</p><Field label="Grunn til gjenåpning (minst 10 tegn)" value={reason} onChange={setReason} multiline/><label className="ks-field"><span>Ansvarlig ved gjenåpning</span><select value={reopenResponsible} onChange={e=>setReopenResponsible(e.target.value)}>{!members.some(m=>m.id===reopenResponsible)&&<option value="">Velg aktiv medarbeider</option>}{members.map(m=><option key={m.id} value={m.id}>{identityText(m.identity)}</option>)}</select></label><Field label="Ny frist" value={reopenDue} onChange={setReopenDue} type="date"/><button type="button" disabled={busy||reason.trim().length<10||!members.some(m=>m.id===reopenResponsible)||!reopenDue} onClick={reopen}>Lagre gjenåpning</button></details>}
   {detail&&<section className="ks-case-history" aria-label="Avvikshistorikk"><h4>Historikk</h4>{detail.events.map(event=><details key={event.id}><summary>{eventNames[event.action]||event.action} · {when(event.created_at)} · {identityText(event.actor_identity)}</summary>{event.action==='file'?<p>{event.snapshot.name} · {Math.ceil(event.snapshot.size_bytes/1024)} KB</p>:<Snapshot row={event.snapshot}/>}</details>)}{detail.next&&<button type="button" className="secondary" disabled={busy||caseLoading} onClick={olderEvents}>Vis eldre historikk</button>}</section>}
   {row&&<button type="button" className="secondary" disabled={busy||caseLoading} onClick={()=>openCase(row.id)}>Oppdater sak</button>}
   {conflict&&<article className="ks-card"><h3>Sist lagrede sak – sammenlign med kladden din</h3><Snapshot row={conflict.case}/><button type="button" className="secondary" disabled={busy} onClick={()=>{if(window.confirm('Erstatte teksten på skjermen med lagret sak? Den lokale kladden beholdes til neste lagring.'))installDetail(conflict);}}>Bruk lagret sak</button></article>}
  </DeviationEditorSurface>}
 </section>;
}
