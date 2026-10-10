import React,{useEffect,useRef,useState} from 'react';
import {BookOpen,Plus,Save,Eye,ArrowUp,ArrowDown,Trash2,History,Archive,RotateCcw} from 'lucide-react';
import {hrRpc} from './hrAccess.js';
import {MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT} from '../access/moduleAccessClient.js';
import {WORK_PROFILE_EVENT} from '../access/workProfileClient.js';
import {HR_TEMPLATE_KINDS,HR_TEMPLATE_PHASES,suggestedHrTemplate,blankHrTemplate,sameHrTemplate,validateHrTemplate} from './hrConversationTemplates.mjs';
import {createHrTemplateSession} from './hrTemplateSession.mjs';
import './hrTemplates.css';

// Bounded, temporary generic-question drafts. No answers, storage or authority here.
const workspace=new Map();
function remember(scope,value){workspace.delete(scope);workspace.set(scope,value);if(workspace.size>8)workspace.delete(workspace.keys().next().value);}
function Field({label,children}){return <label className="hr-field"><span>{label}</span>{children}</label>;}
function Preview({content}) {
 return <div className="hr-template-preview"><h4>{content.title}</h4>{content.intro&&<p>{content.intro}</p>}
  {Object.entries(HR_TEMPLATE_PHASES).map(([phase,label])=>{
   const questions=content.questions.filter(q=>q.phase===phase);
   return questions.length>0&&<section key={phase}><h5>{label}</h5><ol>{questions.map(q=><li key={q.id}><strong>{q.topic}</strong><p>{q.prompt}</p><small>{q.required?'Svar kreves i denne fasen':'Valgfritt spørsmål'}</small></li>)}</ol></section>;
  })}<p className="hr-hint">Dette er en tom mal. Ansattes svar og referater kan ikke registreres her ennå.</p>
 </div>;
}
export default function HrConversationTemplates({context,targetRef,startRequest,onStartHandled}) {
 const {company_id:companyId,user_id:userId}=context,scope=companyId+':'+userId;
 const [open,setOpen]=useState(()=>workspace.get(scope)?.open||false);
 const [data,setData]=useState(null),[draft,setDraft]=useState(null),[view,setView]=useState(null),[history,setHistory]=useState(null);
 const [mode,setMode]=useState('preview'),[questionId,setQuestionId]=useState(null),[pending,setPending]=useState(null),[archiveConfirmed,setArchiveConfirmed]=useState(false);
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[conflict,setConflict]=useState(false),[showArchived,setShowArchived]=useState(false);
 const sessionRef=useRef(null),refreshRef=useRef(null),epoch=useRef(0),locked=useRef(false),region=useRef(null),handledRequest=useRef(null);
 const dirty=Boolean(draft&&(draft.revision===0||!sameHrTemplate(draft.content,draft.base)));
 const keep=next=>{remember(scope,{open:true,draft:next});setDraft(next);};
 const clear=()=>{setData(null);setDraft(null);setView(null);setHistory(null);setPending(null);setArchiveConfirmed(false);};
 useEffect(()=>{
  if(!open||context.administer!==true)return;
  let alive=true;
  const session=createHrTemplateSession({rpc:hrRpc,companyId,userId,onClear:()=>{if(alive)clear();}});sessionRef.current=session;
  const refresh=async()=>{
   const ticket=++epoch.current;session.invalidate();setBusy(true);locked.current=true;setError('');setNotice('');
   try {
    if(document.visibilityState==='hidden')return;
    const listing=await session.list(),saved=workspace.get(scope)?.draft;
    const fresh=saved&&(saved.revision>0||listing.templates.some(t=>t.id===saved.id))?await session.get(saved.id):null;
    if(!alive||ticket!==epoch.current)return;
    setData(listing);
    if(saved){
     if(fresh&&saved.revision===0&&sameHrTemplate(fresh.version.content,saved.content)){
      const confirmed={...saved,revision:fresh.template.revision,archived:fresh.template.archived,base:fresh.version.content};remember(scope,{open:true,draft:confirmed});setDraft(confirmed);setView(fresh);setConflict(false);setMode('preview');setQuestionId(saved.content.questions[0]?.id||null);setNotice('Tidligere lagring er bekreftet. Malen er lagret · utgave '+fresh.template.revision+'.');return;
     }
     const changed=fresh&&fresh.template.revision!==saved.revision;
     setConflict(Boolean(changed));setDraft(saved);setMode(saved.revision===0||!sameHrTemplate(saved.content,saved.base)?'edit':'preview');
     setQuestionId(saved.content.questions[0]?.id||null);setView(fresh);
     if(changed)setNotice('En nyere utgave er lagret. Kladden din er beholdt. Velg hvordan du vil fortsette.');
    }
   }catch(e){if(alive&&ticket===epoch.current){if(e.code==='42501')workspace.delete(scope);setError(e.message);}}
   finally{if(alive&&ticket===epoch.current){locked.current=false;setBusy(false);}}
  };
  refreshRef.current=refresh;refresh();const events=[WORK_PROFILE_EVENT,MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT,'focus'];
  events.forEach(name=>window.addEventListener(name,refresh));document.addEventListener('visibilitychange',refresh);
  return()=>{alive=false;epoch.current++;session.dispose();sessionRef.current=null;refreshRef.current=null;events.forEach(name=>window.removeEventListener(name,refresh));document.removeEventListener('visibilitychange',refresh);};
 },[open,companyId,userId,context.administer,scope]);
 const run=async job=>{
  if(locked.current||!sessionRef.current)return;
  const ticket=++epoch.current,session=sessionRef.current;locked.current=true;setBusy(true);setError('');setNotice('');
  const current=()=>epoch.current===ticket&&sessionRef.current===session;
  try{await job(session,current);}
  catch(e){if(current()){
   if(e.code==='42501')workspace.delete(scope);
   setError(e.code==='40001'?'En annen bruker har lagret en nyere utgave. Kladden din er beholdt. Trykk Oppdater maler.':e.message);
  }}finally{if(current()){locked.current=false;setBusy(false);}}
 };
 const install=result=>{
  const next={id:result.template.id,revision:result.template.revision,archived:result.template.archived,content:result.version.content,base:result.version.content};
  keep(next);setView(result);setHistory(null);setQuestionId(next.content.questions[0]?.id||null);setMode('preview');setConflict(false);setArchiveConfirmed(false);region.current?.focus();
 };
 const start=intent=>{
  setPending(null);setArchiveConfirmed(false);setHistory(null);setConflict(false);
  if(intent.type==='saved')return run(async(session,current)=>{const result=await session.get(intent.id);if(current())install(result);});
  const content=intent.type==='blank'?blankHrTemplate():suggestedHrTemplate(intent.kind);
  keep({id:crypto.randomUUID(),revision:0,archived:false,content,base:null});setView(null);setMode('edit');setQuestionId(content.questions[0].id);region.current?.focus();
 };
 const choose=intent=>{if(dirty)setPending(intent);else start(intent);};
 // A shortcut opens the same authorized editor, with the same dirty-draft choice.
 useEffect(()=>{if(startRequest?.kind==='sickleave'&&context.administer===true)setOpen(true);},[startRequest,context.administer]);
 useEffect(()=>{
  if(!startRequest||startRequest.kind!=='sickleave'||handledRequest.current===startRequest.token||!data||busy||!sessionRef.current)return;
  handledRequest.current=startRequest.token;choose({type:'suggestion',kind:'sickleave'});onStartHandled?.();
 },[startRequest,data,busy]);
 const change=patch=>keep({...draft,content:{...draft.content,...patch}});
 const question=draft?.content.questions.find(q=>q.id===questionId);
 const changeQuestion=patch=>change({questions:draft.content.questions.map(q=>q.id===questionId?{...q,...patch}:q)});
 const moveQuestion=step=>{const qs=[...draft.content.questions],index=qs.findIndex(q=>q.id===questionId),target=index+step;if(target<0||target>=qs.length)return;[qs[index],qs[target]]=[qs[target],qs[index]];change({questions:qs});};
 const save=archived=>run(async(session,current)=>{
  validateHrTemplate(draft.content);
  let result;
  try{result=await session.save(draft.id,draft.revision,draft.content,archived);}
  catch(e){if(e.code==='42501'||e.code==='40001')throw e;throw Error('Lagringen kunne ikke bekreftes. Trykk Oppdater maler og åpne eventuell lagret mal før du prøver igjen. '+e.message);}
  // Commit confirmation is independent of an optional catalogue refresh.
  if(!current())return;install(result);setNotice(archived?'Malen er arkivert. Gamle utgaver er beholdt.':'Malen er lagret · utgave '+result.template.revision+'.');
  try{const listing=await session.list();if(current())setData(listing);}catch{if(current())setError('Malen er lagret. Oppdater maler for å hente oversikten på nytt.');}
 });
 const refresh=()=>refreshRef.current?.();
 const discard=()=>{
  if(draft.revision>0)install({template:{id:draft.id,revision:draft.revision,archived:draft.archived},version:{content:draft.base,revision:draft.revision}});
  else{workspace.delete(scope);remember(scope,{open:true,draft:null});setDraft(null);setView(null);setMode('preview');setConflict(false);}
  setPending(null);
 };
 const rows=data?.templates.filter(t=>showArchived||!t.archived)||[];
 if(context.administer!==true)return null;
 return <details ref={targetRef} tabIndex={-1} className="hr-card hr-templates" open={open} onToggle={e=>{const value=e.currentTarget.open;setOpen(value);remember(scope,{open:value,draft:workspace.get(scope)?.draft});}}>
  <summary><BookOpen size={18} aria-hidden="true"/>Samtalemaler <small>Forbered spørsmålene til samtalen</small></summary>
  {open&&<><p className="hr-hint">Lag generelle spørsmål for firmaet. Ikke skriv navn, personreferater eller fraværsopplysninger. Samtaler med ansattes svar åpnes senere.</p>
   <section className="hr-step-guide" aria-label="Slik lager du en samtalemal"><h3>Slik lager du en mal</h3><ol>
    <li><strong>1. Velg utgangspunkt</strong><span>Velg et av malforslagene nedenfor. Lag egen mal starter med ett spørsmål. Ingen av valgene lagrer noe ennå.</span></li>
    <li><strong>2. Tilpass spørsmålene</strong><span>Gi malen et navn. Velg et spørsmål i listen, endre teksten og velg når det skal besvares. Legg til, fjern eller flytt spørsmål ved behov.</span></li>
    <li><strong>3. Se over og lagre</strong><span>Forhåndsvis mal viser spørsmålene slik de er satt opp. Bruk Rediger mal for å endre videre, og Lagre mal når du er fornøyd.</span></li>
   </ol><p className="hr-hint">Lagre mal lagrer spørsmålene for firmaet. Det starter ingen samtale og sender ingenting til ansatte. Velg en lagret mal i listen for å se eller endre den senere.</p></section>
   {error&&<p className="hr-error" role="alert">{error}</p>}{notice&&<p className="hr-notice" role="status">{notice}</p>}{busy&&<p role="status">Kontrollerer maltilgang …</p>}
   <div className="hr-template-toolbar"><button type="button" className="secondary" disabled={busy} onClick={refresh}><RotateCcw size={16} aria-hidden="true"/>Oppdater maler</button>{data&&<button type="button" disabled={busy} onClick={()=>choose({type:'blank'})}><Plus size={16} aria-hidden="true"/>Lag egen mal</button>}</div>
   {data&&<><div className="hr-template-starters" aria-label="Generelle malforslag">{['annual','probation','followup','sickleave'].map(kind=><button className="secondary" type="button" key={kind} disabled={busy} onClick={()=>choose({type:'suggestion',kind})}><BookOpen size={18} aria-hidden="true"/><strong>{HR_TEMPLATE_KINDS[kind]}</strong><small>Bruk forslag og tilpass</small></button>)}</div>
    {pending&&<div className="hr-template-choice" role="alert"><strong>Du har ulagrede endringer.</strong><p>Forkast kladden for å bytte mal, eller behold arbeidet.</p><button type="button" onClick={()=>start(pending)}>Forkast og fortsett</button><button type="button" className="secondary" onClick={()=>setPending(null)}>Behold kladden</button></div>}
    <label className="hr-check"><input type="checkbox" checked={showArchived} onChange={e=>setShowArchived(e.target.checked)}/>Vis arkiverte maler</label>
    <div className="hr-template-catalog">{rows.map(t=><button type="button" key={t.id} className="secondary" disabled={busy} aria-pressed={draft?.id===t.id} onClick={()=>choose({type:'saved',id:t.id})}><span><strong>{t.title}</strong><small>{HR_TEMPLATE_KINDS[t.kind]} · {t.question_count} spørsmål</small></span><span>Utgave {t.revision}{t.archived?' · arkivert':''}</span></button>)}</div>
    {!rows.length&&<p className="hr-hint">Ingen {showArchived?'':'aktive '}maler i den hentede listen. Velg et forslag eller lag egen mal.</p>}
    {data.next&&<button type="button" className="secondary" disabled={busy} onClick={()=>run(async(session,current)=>{const page=await session.list(data.next);if(current())setData(previous=>({...page,templates:[...previous.templates,...page.templates.filter(t=>!previous.templates.some(old=>old.id===t.id))]}));})}>Hent flere maler</button>}
   </>}
   {data&&draft&&<section className="hr-template-workbench" ref={region} tabIndex={-1} aria-label="Valgt samtalemal">
    <div className="hr-template-toolbar"><div><h3>{draft.content.title}</h3><span className="hr-template-state">{dirty?'Ulagrede endringer':draft.archived?'Arkivert mal':'Lagret · utgave '+draft.revision}</span></div>
     <div className="hr-template-actions"><button type="button" className="secondary" aria-pressed={mode==='preview'} disabled={busy} onClick={()=>setMode('preview')}><Eye size={16} aria-hidden="true"/>Forhåndsvis mal</button>
      {!draft.archived&&<button type="button" className="secondary" aria-pressed={mode==='edit'} disabled={busy} onClick={()=>{setMode('edit');setView(null);}}>Rediger mal</button>}
     </div></div>
    {conflict&&view&&<div className="hr-template-choice"><strong>Nyeste lagrede utgave er {view.template.revision}.</strong><p>Se over den nyeste malen før du velger. Din kladd blir ikke lagret automatisk.</p><details><summary>Se nyeste lagrede mal</summary><Preview content={view.version.content}/></details><button type="button" onClick={()=>install(view)}>Bruk nyeste og forkast kladd</button><button type="button" className="secondary" disabled={view.template.archived} onClick={()=>{keep({...draft,revision:view.template.revision,base:view.version.content,archived:false});setView(null);setConflict(false);setMode('edit');}}>Behold kladd som neste utgave</button></div>}
    {view&&view.version.revision!==draft.revision&&<p className="hr-notice" role="status">Viser utgave {view.version.revision}. Gjeldende malutgave er {draft.revision}.</p>}
    {mode==='edit'&&!draft.archived?<fieldset disabled={busy||conflict}>
     <p className="hr-hint">Malnavn gjør malen lett å finne, for eksempel «Årlig samtale – butikk». Kort innledning forklarer hvordan samtalen skal forberedes. Samtaletype hjelper dere å kjenne igjen formålet med malen.</p>
     <div className="hr-fields"><Field label="Malnavn"><input value={draft.content.title} maxLength={120} onChange={e=>change({title:e.target.value})}/></Field><Field label="Samtaletype"><select value={draft.content.kind} onChange={e=>change({kind:e.target.value})}>{Object.entries(HR_TEMPLATE_KINDS).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></Field></div>
     <Field label="Kort innledning"><textarea rows={2} maxLength={1000} value={draft.content.intro} onChange={e=>change({intro:e.target.value})}/></Field>
     <p className="hr-hint">Velg ett spørsmål om gangen i listen nedenfor. Tema er den korte overskriften, for eksempel «Trivsel». Spørsmålstekst er det medarbeideren eller dere sammen skal svare på senere.</p>
     <div className="hr-template-question-grid"><nav aria-label="Spørsmål i malen"><ol>{draft.content.questions.map((q,index)=><li key={q.id}><button type="button" className="secondary" aria-pressed={q.id===questionId} onClick={()=>setQuestionId(q.id)}>{index+1}. {q.topic||'Nytt tema'}<small>{q.phase==='preparation'?'Forberedelse':'Felles møte'}</small></button></li>)}</ol><button type="button" className="secondary" disabled={draft.content.questions.length>=24} onClick={()=>{const q={id:crypto.randomUUID(),topic:'Nytt tema',prompt:'',phase:'meeting',required:false};change({questions:[...draft.content.questions,q]});setQuestionId(q.id);}}><Plus size={16} aria-hidden="true"/>Legg til spørsmål</button></nav>
      {question&&<div className="hr-template-question"><Field label="Tema"><input value={question.topic} maxLength={80} onChange={e=>changeQuestion({topic:e.target.value})}/></Field><Field label="Spørsmålstekst"><textarea rows={4} maxLength={500} value={question.prompt} onChange={e=>changeQuestion({prompt:e.target.value})}/></Field><Field label="Når besvares spørsmålet?"><select value={question.phase} onChange={e=>changeQuestion({phase:e.target.value})}>{Object.entries(HR_TEMPLATE_PHASES).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></Field><label className="hr-check"><input type="checkbox" checked={question.required} onChange={e=>changeQuestion({required:e.target.checked})}/>Svar kreves i denne fasen</label><p className="hr-hint"><strong>Medarbeiderens forberedelse:</strong> medarbeideren svarer før møtet. <strong>Felles møte:</strong> medarbeider og leder svarer sammen. Avkrysningen angir om spørsmålet skal kreve svar i den valgte fasen når samtalefunksjonen åpnes.</p><div className="hr-template-actions"><button type="button" className="secondary" disabled={draft.content.questions[0].id===questionId} onClick={()=>moveQuestion(-1)}><ArrowUp size={16} aria-hidden="true"/>Flytt opp</button><button type="button" className="secondary" disabled={draft.content.questions.at(-1).id===questionId} onClick={()=>moveQuestion(1)}><ArrowDown size={16} aria-hidden="true"/>Flytt ned</button><button type="button" className="secondary" disabled={draft.content.questions.length===1} onClick={()=>{const qs=draft.content.questions.filter(q=>q.id!==questionId);change({questions:qs});setQuestionId(qs[0].id);}}><Trash2 size={16} aria-hidden="true"/>Fjern spørsmål</button></div></div>}
     </div>
    </fieldset>:<Preview content={view&&!dirty?view.version.content:draft.content}/>}
    <div className="hr-template-savebar"><div><strong>{dirty?'Kladd · ikke lagret':'Malen er lagret'}</strong><small>{dirty?'Lagre mal beholder endringene. Forkast endringer fjerner kladden.':draft.archived?'Malen er arkivert. Gjenåpne den under Malhistorikk og arkivering.':'Endre med Rediger mal. Lagre mal lager en ny utgave.'}</small></div><div className="hr-template-actions"><button type="button" disabled={busy||conflict||!dirty||draft.archived} onClick={()=>save(false)}><Save size={16} aria-hidden="true"/>Lagre mal</button>{dirty&&<button type="button" className="secondary" disabled={busy||conflict} onClick={discard}>Forkast endringer</button>}</div></div>
    {draft.revision>0&&!dirty&&!conflict&&<details className="hr-template-history"><summary><History size={16} aria-hidden="true"/>Malhistorikk og arkivering</summary><p className="hr-hint">En utgave er malen slik den var ved én lagring. Hent malhistorikk og velg Se utgave for å lese tidligere spørsmål. Bruk vist utgave som kladd lar deg lagre den som en ny utgave. Arkiver mal skjuler malen fra aktive valg og beholder historikken; finn den igjen med Vis arkiverte maler.</p><button type="button" className="secondary" disabled={busy} onClick={()=>run(async(session,current)=>{const result=await session.history(draft.id);if(current())setHistory(result);})}>Hent malhistorikk</button>
     {history&&<><ul>{history.versions.map(v=><li key={v.revision}><span>Utgave {v.revision} · {new Date(v.saved_at).toLocaleString('nb-NO',{timeZone:'Europe/Oslo'})}{v.archived?' · arkivert':''}</span><button type="button" className="secondary" disabled={busy} onClick={()=>run(async(session,current)=>{const result=await session.get(draft.id,v.revision);if(current()){setView(result);setMode('preview');}})}>Se utgave {v.revision}</button></li>)}</ul>{history.next&&<button type="button" className="secondary" disabled={busy} onClick={()=>run(async(session,current)=>{const result=await session.history(draft.id,history.next);if(current())setHistory(previous=>({...result,versions:[...previous.versions,...result.versions]}));})}>Hent eldre utgaver</button>}</>}
     {view&&view.version.revision!==draft.revision&&!draft.archived&&<button type="button" className="secondary" disabled={busy} onClick={()=>{keep({...draft,content:view.version.content});setView(null);setMode('edit');}}>Bruk vist utgave som kladd</button>}
     {draft.archived?<button type="button" disabled={busy} onClick={()=>save(false)}>Gjenåpne mal</button>:<><label className="hr-check"><input type="checkbox" checked={archiveConfirmed} onChange={e=>setArchiveConfirmed(e.target.checked)}/>Arkiver malen. Gamle utgaver beholdes, og malen fjernes fra aktive valg.</label><button type="button" className="secondary" disabled={busy||!archiveConfirmed} onClick={()=>save(true)}><Archive size={16} aria-hidden="true"/>Arkiver mal</button></>}
    </details>}
   </section>}
  </>}
 </details>;
}
