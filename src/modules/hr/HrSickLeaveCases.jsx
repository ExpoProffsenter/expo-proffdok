import React,{useEffect,useRef,useState} from 'react';
import {hrRpc} from './hrAccess.js';
import {createSickLeaveSession,CONVERSATION_STAGES} from './hrSickLeaveSession.mjs';
import {sameHrTemplate} from './hrConversationTemplates.mjs';
import {osloToday} from './hrPracticeConversation.mjs';
import {MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT} from '../access/moduleAccessClient.js';
import {WORK_PROFILE_EVENT} from '../access/workProfileClient.js';
import './hrPracticeConversation.css';
import './hrConversations.css';
import {sickLeaveMilestones,formatSickLeaveDate} from './hrSickLeave.mjs';
import './hrSickLeaveCases.css';
// Only volatile navigation/drafts, scoped to actor/company/employee. Never browser storage.
const workspaces=new Map();
const remember=(scope,v)=>{workspaces.delete(scope);workspaces.set(scope,v);if(workspaces.size>4)workspaces.delete(workspaces.keys().next().value);};
const editable=c=>({preparation:c.preparation,meeting:c.meeting,actions:c.actions,next_on:c.next_on,comments:c.comments,followup:{on:c.on,absence_mode:c.absence_mode,milestones:c.milestones,correction_reason:c.correction_reason||''}});
const copy=v=>JSON.parse(JSON.stringify(v));
function Field({label,children}){return <label className="hrp-field"><span>{label}</span>{children}</label>;}
export default function HrSickLeaveCases({context,employee}){
 const companyId=context.company_id,userId=context.user_id,employeeId=employee.id,scope=companyId+':'+userId+':'+employeeId;
 const [listing,setListing]=useState(null),[value,setValue]=useState(null),[draft,setDraft]=useState(null);
 const [templates,setTemplates]=useState(null),[templateId,setTemplateId]=useState(''),[on,setOn]=useState(osloToday),[mode,setMode]=useState('full');
 const [shareTarget,setShareTarget]=useState('sykmelder'),[shareOn,setShareOn]=useState(osloToday),[shareVersion,setShareVersion]=useState(''),[shareChannel,setShareChannel]=useState('nav_portal'),[shareConfirmed,setShareConfirmed]=useState(false),[closeOn,setCloseOn]=useState(osloToday),[closeConfirmed,setCloseConfirmed]=useState(false);
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[conflict,setConflict]=useState(false);
 const [step,setStep]=useState(()=>workspaces.get(scope)?.step||0),[historyVersion,setHistoryVersion]=useState('');
 const session=useRef(null),epoch=useRef(0),busyRef=useRef(false),body=useRef(null),latest=useRef(null),alive=useRef(false);
 const dirty=Boolean(value&&draft&&!sameHrTemplate(editable(value.conversation),draft));
 const keep=(next,valueOverride=value)=>{remember(scope,{id:valueOverride?.conversation.id,revision:valueOverride?.current_revision,
  employeeRevision:valueOverride?.employee.revision,version:valueOverride?.historical?valueOverride.conversation.revision:null,draft:copy(next),dirty:!sameHrTemplate(next,editable(valueOverride.conversation)),step});setDraft(next);};
 const install=(result,preserve=false)=>{
  const saved=preserve?workspaces.get(scope):null;
  const unchanged=Boolean(saved?.draft&&saved.id===result.conversation.id&&saved.revision===result.current_revision&&saved.employeeRevision===result.employee.revision);
  setValue(result);latest.current=result;setDraft(unchanged?saved.draft:editable(result.conversation));setConflict(false);
  if(saved?.dirty&&saved.id===result.conversation.id&&!unchanged&&!sameHrTemplate(saved.draft,editable(result.conversation))){setDraft(saved.draft);setConflict(true);setError('Oppfølgingen eller tilgangen er endret. Kladden din er beholdt, men kan ikke lagres over den nye utgaven.');}
  else remember(scope,{id:result.conversation.id,revision:result.current_revision,employeeRevision:result.employee.revision,version:result.historical?result.conversation.revision:null,draft:copy(unchanged?saved.draft:editable(result.conversation)),dirty:unchanged&&Boolean(saved?.dirty),step:saved?.step??step});
 };
 useEffect(()=>{
  alive.current=true;++epoch.current;
  const denied=()=>{workspaces.delete(scope);if(alive.current){setValue(null);latest.current=null;setDraft(null);setListing(null);}};
  const s=createSickLeaveSession({rpc:hrRpc,companyId,userId,employeeId,onDenied:denied});session.current=s;
  const refresh=async()=>{
   const ticket=++epoch.current;s.invalidate();setBusy(true);busyRef.current=true;setError('');
   setValue(null);latest.current=null;setDraft(null);setListing(null);setTemplates(null);
   try{
    if(document.visibilityState==='hidden')return;
    const rows=await s.list();if(!alive.current||ticket!==epoch.current)return;setListing(rows);
    const saved=workspaces.get(scope);
    if(saved?.id&&rows.conversations.some(c=>c.id===saved.id)){
     const result=await s.get(saved.id,saved.version??null);if(alive.current&&ticket===epoch.current){install(result,true);setStep(saved.step||0);}
    }else if(saved?.id)workspaces.delete(scope);
   }catch(e){if(alive.current&&ticket===epoch.current){setError(e.code==='42501'?'Oppfølging er ikke tilgjengelig for denne medarbeideren ennå.':e.message);if(e.code==='42501')denied();}}
   finally{if(alive.current&&ticket===epoch.current){setBusy(false);busyRef.current=false;}}
  };
  refresh();const events=[WORK_PROFILE_EVENT,MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT,'focus'];
  events.forEach(name=>window.addEventListener(name,refresh));document.addEventListener('visibilitychange',refresh);
  return()=>{alive.current=false;epoch.current++;s.dispose();session.current=null;events.forEach(name=>window.removeEventListener(name,refresh));document.removeEventListener('visibilitychange',refresh);};
 },[companyId,userId,employeeId]);
 useEffect(()=>{if(workspaces.has(scope))remember(scope,{...workspaces.get(scope),step});body.current?.focus();body.current?.scrollIntoView({block:'start'});},[step,value?.conversation.id]);
 useEffect(()=>{if(!dirty)return;const handler=e=>{e.preventDefault();e.returnValue='';};window.addEventListener('beforeunload',handler);return()=>window.removeEventListener('beforeunload',handler);},[dirty]);
 const changed=()=>window.dispatchEvent(new Event('hr-sick-leave-changed'));
 const run=async(job)=>{
  if(busyRef.current||!session.current)return;const ticket=++epoch.current,s=session.current;
  const current=()=>alive.current&&ticket===epoch.current&&session.current===s;
  busyRef.current=true;setBusy(true);setError('');setNotice('');
  try{await job(s,current);}catch(e){if(current()){setError(e.code==='40001'?'En annen bruker har endret oppfølgingen. Kladden er beholdt. Hent lagret utgave før du fortsetter.':e.message);if(e.code==='40001')setConflict(true);}}
  finally{if(current()){busyRef.current=false;setBusy(false);}}
 };
 const leave=()=>!dirty||window.confirm('Du har ulagrede endringer. Vil du åpne en annen oppfølging og legge kladden til side?');
 const open=(id,version=null)=>run(async(s,current)=>{if(!leave())return;const result=await s.get(id,version);if(current()){install(result);setStep(result.conversation.stage==='preparation'?0:1);setHistoryVersion('');body.current?.focus();body.current?.scrollIntoView({block:'start'});}});
 const change=patch=>keep({...draft,...patch});
 const act=(action,data={})=>run(async(s,current)=>{
  const result=await s.command(value,action,data);if(current()){install(result);changed();setNotice('Lagret på serveren · utgave '+result.current_revision+'.');if(action==='share')setStep(1);if(action==='ready'||action==='confirm')setStep(3);}
 });
 const save=()=>run(async(s,current)=>{
  if(conflict||value?.historical)return;const wanted=copy(draft);let result=value;
  if(value.permissions.prepare&&!sameHrTemplate(wanted.preparation,value.conversation.preparation))
   result=await s.command(result,'preparation',{answers:wanted.preparation});
  if(!current())return;
  if(value.permissions.meeting&&!sameHrTemplate([wanted.meeting,wanted.actions,wanted.next_on],[value.conversation.meeting,value.conversation.actions,value.conversation.next_on]))
   result=await s.command(result,'meeting',{answers:wanted.meeting,actions:wanted.actions,next_on:wanted.next_on});
  if(!current())return;
  if(value.permissions.followup&&!sameHrTemplate(wanted.followup,editable(value.conversation).followup))result=await s.command(result,'followup',wanted.followup);
  if(!current())return;const side=value.employee.user_id===userId?'employee':'leader';
  if(value.permissions.comment&&wanted.comments[side]!==value.conversation.comments[side])
   result=await s.command(result,'comment',{text:wanted.comments[side]});
  if(current()){install(result);changed();setNotice('Lagret på serveren · utgave '+result.current_revision+'.');}
 });
 const cleanAction=action=>{if(dirty){setError('Lagre endringene først.');return;}act(action);};
 const exportPdf=()=>run(async(s,current)=>{
  if(dirty){setError('Lagre endringene før PDF.');return;}
  const fresh=await s.get(value.conversation.id,value.historical?value.conversation.revision:null);if(!current())return;
  if(fresh.current_revision!==value.current_revision){setError('Oppfølgingen er endret. Hent ny utgave før PDF.');return;}
  const {downloadSickLeavePdf}=await import('./hrSickLeavePdf.mjs');
  const result=await downloadSickLeavePdf({value:fresh,companyName:context.company_name,isCurrent:current});if(result&&current())setNotice('Oppfølgingsplanen er lastet ned. Du står fortsatt i samme oppfølging.');
 });
 const c=value?.conversation,permitted=value&&!value.historical&&!conflict,prep=permitted&&value.permissions.prepare,meeting=permitted&&value.permissions.meeting;
 const stages=['Forberedelse','Felles plan','Tiltak','Gjennomgang','Frister','Deling og avslutning'];
 const followup=permitted&&value.permissions.followup;
 let milestones=[];try{if(c)milestones=sickLeaveMilestones(draft.followup.on,draft.followup.absence_mode);}catch{}
 const changeMilestone=(key,patch)=>change({followup:{...draft.followup,milestones:{...draft.followup.milestones,[key]:{...draft.followup.milestones[key],...patch}}}});
 const ownSide=value?.employee.user_id===userId?'employee':'leader';
 return <section className="hrp hr-real-conversation hr-sick-case" aria-label="Sykefraværsoppfølging">
  <h3>Sykefraværsoppfølging</h3><p>Beskriv arbeidsoppgaver, tilrettelegging og videre oppfølging. Hold diagnose og medisinske detaljer utenfor. Medarbeider og leder lager planen sammen, og begge bekrefter sin egen gjennomgang.</p>
  {busy&&<p role="status">Kontrollerer tilgang og lagring …</p>}{error&&<p role="alert" className="hrp-error">{error}</p>}{notice&&<p role="status" className="hrp-notice">{notice}</p>}
  {listing?.can_start&&<details className="hrp-saved"><summary onClick={()=>{if(!templates)run(async(s,current)=>{const r=await s.templates();if(current())setTemplates(r.templates);});}}>Start sykefraværsoppfølging</summary>
   <form onSubmit={e=>{e.preventDefault();run(async(s,current)=>{if(!leave())return;const t=templates?.find(t=>t.id===templateId);if(!t)return;
    const id=crypto.randomUUID();remember(scope,{id,revision:0,employeeRevision:listing.employee.revision,draft:null,step:0});
    const r=await s.start({id,employeeRevision:listing.employee.revision,templateId:t.id,templateRevision:t.revision,on,mode});
    if(current()){install(r);changed();setListing(previous=>({...previous,conversations:[...previous.conversations,{id,title:r.conversation.template.title,revision:1,stage:'preparation',on}]}));setStep(0);setNotice('Oppfølgingen er opprettet. Medarbeideren finner den på Min side.');}
   });}}><Field label="Sykefraværsmal"><select required value={templateId} onChange={e=>setTemplateId(e.target.value)}><option value="">Velg mal</option>{templates?.map(t=><option key={t.id} value={t.id}>{t.title}</option>)}</select></Field>
   {templates?.length===0&&<p>Firmaadmin lager og lagrer en sykefraværsmal under HR → Sykefraværsmaler først.</p>}
   <Field label="Første fraværsdag"><input required type="date" value={on} onChange={e=>setOn(e.target.value)}/></Field><Field label="Fraværstype"><select value={mode} onChange={e=>setMode(e.target.value)}><option value="full">Fullt fravær</option><option value="partial">Gradert fravær</option></select></Field><button disabled={busy||!templateId}>Opprett oppfølging</button></form>
  </details>}
  {listing&&<details className="hrp-saved" open><summary>Lagrede oppfølginger og historikk ({listing.conversations.length})</summary>
   {!listing.conversations.length&&<p>Ingen oppfølging er opprettet. Nærmeste leder starter saken.</p>}
   {listing.conversations.map(row=><button type="button" className="secondary" key={row.id} disabled={busy} onClick={()=>open(row.id)}>{row.title} · {row.on} · {(row.id===c?.id?c.case_status:row.case_status)==='closed'?'Avsluttet · ':''}{CONVERSATION_STAGES[row.id===c?.id?c.stage:row.stage]}</button>)}
   {listing.next&&<button disabled={busy} onClick={()=>run(async(s,current)=>{const r=await s.list(listing.next);if(current())setListing(previous=>({...r,conversations:[...previous.conversations,...r.conversations]}));})}>Hent flere oppfølginger</button>}
  </details>}
  {value&&draft&&<><div className="hrp-toolbar"><strong>{c.template.title}{c.case_status==='closed'?' · Avsluttet':''}</strong><span>{CONVERSATION_STAGES[c.stage]} · utgave {c.revision} · {dirty?'Ulagrede endringer':'Lagret på serveren'}</span>
   <button type="button" className="secondary" disabled={busy} onClick={()=>run(async(s,current)=>{const r=await s.get(c.id);if(current()){install(r,true);setNotice('Lagret utgave er hentet.');}})}>Hent lagret utgave</button>
   {conflict&&<button type="button" disabled={busy} onClick={()=>{if(window.confirm('Vil du forkaste kladden og bruke den lagrede utgaven?')){workspaces.delete(scope);install(value);}}}>Bruk lagret utgave</button>}
  </div>
  {value.historical&&<p className="hrp-readonly">Historisk utgave. Denne kan bare leses. <button className="secondary" disabled={busy} onClick={()=>open(c.id)}>Åpne gjeldende utgave</button></p>}
  <nav className="hrp-steps" aria-label="Steg i sykefraværsoppfølgingen">{stages.map((title,i)=><button key={title} disabled={busy} aria-current={step===i?'step':undefined} onClick={()=>setStep(i)}><span>{i+1}</span>{title}</button>)}</nav>
  <div ref={body} tabIndex={-1} className="hrp-step-body">
  <h4>{stages[step]}</h4>
  {step===0&&<><p>Medarbeideren skriver egne svar. De er private til medarbeideren trykker «Del forberedelsen med leder».</p>
   {!c.shared&&!prep&&<p>Forberedelsen er ikke delt ennå.</p>}
   {c.template.questions.filter(q=>q.phase==='preparation').map(q=><article className="hrp-question" key={q.id}><h5>{q.topic}</h5><Field label={q.prompt+(q.required?' *':'')}><textarea rows={4} maxLength={4000} disabled={busy||!prep} value={draft.preparation[q.id]||''} onChange={e=>change({preparation:{...draft.preparation,[q.id]:e.target.value}})}/></Field></article>)}
   {prep&&<button disabled={busy||dirty} onClick={()=>cleanAction('share')}>Del forberedelsen med leder</button>}
  </>}
  {step===1&&<><p>Gå gjennom medarbeiderens innspill sammen. Nærmeste leder skriver møtereferatet. Medarbeiderens opprinnelige svar beholdes.</p>
   {c.template.questions.filter(q=>q.phase==='preparation').map(q=><article className="hrp-question" key={q.id}><h5>{q.topic}</h5><blockquote>{c.preparation[q.id]||'Ikke delt eller ikke utfylt'}</blockquote></article>)}
   {c.template.questions.filter(q=>q.phase==='meeting').map(q=><article className="hrp-question" key={q.id}><h5>{q.topic}</h5><Field label={q.prompt+(q.required?' *':'')}><textarea rows={4} maxLength={4000} disabled={busy||!meeting} value={draft.meeting[q.id]||''} onChange={e=>change({meeting:{...draft.meeting,[q.id]:e.target.value}})}/></Field></article>)}
  </>}
  {step===2&&<><p>Tiltak er valgfrie når ingen oppfølging trengs. Hvert avtalt tiltak trenger ansvarlig og frist.</p>
   {draft.actions.map((a,i)=><article className="hrp-action" key={a.id}><h5>Tiltak {i+1}</h5><fieldset disabled={busy||!meeting}>
    <Field label="Hva skal gjøres?"><textarea value={a.task} maxLength={600} onChange={e=>change({actions:draft.actions.map(x=>x.id===a.id?{...x,task:e.target.value}:x)})}/></Field>
    <Field label="Ansvarlig"><select value={a.owner_id} onChange={e=>change({actions:draft.actions.map(x=>x.id===a.id?{...x,owner_id:e.target.value}:x)})}><option value={value.employee.user_id}>{value.employee.email||'Medarbeider'}</option>{value.employee.leader_id&&<option value={value.employee.leader_id}>{value.leader_email||'Leder'}</option>}</select></Field>
    <Field label="Frist"><input type="date" value={a.due_on} onChange={e=>change({actions:draft.actions.map(x=>x.id===a.id?{...x,due_on:e.target.value}:x)})}/></Field>
    <label className="hrp-check"><input type="checkbox" checked={a.done} onChange={e=>change({actions:draft.actions.map(x=>x.id===a.id?{...x,done:e.target.checked}:x)})}/>Utført</label>
    <button type="button" className="secondary" onClick={()=>change({actions:draft.actions.filter(x=>x.id!==a.id)})}>Fjern tiltak</button></fieldset></article>)}
   {meeting&&<button disabled={busy||draft.actions.length>=12} onClick={()=>change({actions:[...draft.actions,{id:crypto.randomUUID(),task:'',owner_id:value.employee.user_id,due_on:'',done:false}]})}>Legg til tiltak</button>}
   <Field label="Neste oppfølging"><input type="date" disabled={busy||!meeting} value={draft.next_on} onChange={e=>change({next_on:e.target.value})}/></Field>
  </>}
  {step===3&&<><p>Begge leser oppfølgingsplanen og bekrefter selv. Bekreftelse betyr gjennomlest; uenighet kan stå i egen kommentar. Deling med sykmelder eller NAV gjøres separat.</p>
   {['employee','leader'].map(side=><Field key={side} label={side==='employee'?'Medarbeiderens kommentar':'Lederens kommentar'}><textarea rows={3} maxLength={4000} disabled={busy||!permitted||!value.permissions.comment||side!==ownSide} value={draft.comments[side]} onChange={e=>change({comments:{...draft.comments,[side]:e.target.value}})}/></Field>)}
   <p>Medarbeider: {c.confirmations.employee?'Bekreftet':'Venter på bekreftelse'} · Leder: {c.confirmations.leader?'Bekreftet':'Venter på bekreftelse'}</p>
   {meeting&&<button disabled={busy||dirty} onClick={()=>cleanAction('ready')}>Send til begge for gjennomgang</button>}
   {permitted&&value.permissions.confirm&&!c.confirmations[ownSide]&&<button disabled={busy||dirty} onClick={()=>cleanAction('confirm')}>Jeg har lest oppfølgingsplanen</button>}
   {permitted&&value.employee.leader_id===userId&&c.stage==='completed'&&c.case_status==='active'&&<button className="secondary" disabled={busy||dirty} onClick={()=>cleanAction('revise')}>Rediger planen som ny utgave</button>}
   <button className="secondary" disabled={busy||dirty} onClick={exportPdf}>Last ned oppfølgingsplan som PDF</button>
   <Field label="Åpne historisk utgave"><input type="number" min="1" max={value.current_revision} value={historyVersion} onChange={e=>setHistoryVersion(e.target.value)}/></Field>
   <button className="secondary" disabled={busy||!historyVersion} onClick={()=>open(c.id,Number(historyVersion))}>Åpne utgave</button>
  </>}
  {step===4&&<><p>Datoene regnes fra første dag i det sammenhengende fraværet. Gradert fravær eller ny sykmelding starter ikke fristene på nytt. Leder dokumenterer hva som er håndtert; NAV avgjør aktivitet og sine møter.</p>
   <fieldset disabled={busy||!followup}><Field label="Første fraværsdag"><input type="date" max={osloToday()} min="1000-01-01" value={draft.followup.on} onChange={e=>change({followup:{...draft.followup,on:e.target.value}})}/></Field>
    <Field label="Begrunnelse ved retting av startdato"><textarea maxLength={1000} value={draft.followup.correction_reason} onChange={e=>change({followup:{...draft.followup,correction_reason:e.target.value}})}/></Field>
    <Field label="Gjeldende fraværstype"><select value={draft.followup.absence_mode} onChange={e=>change({followup:{...draft.followup,absence_mode:e.target.value}})}><option value="full">Fullt fravær</option><option value="partial">Gradert fravær</option></select></Field>
    {milestones.map(row=><article key={row.id} className="hrp-question"><h5>{row.title} · {row.weeks} uker · {formatSickLeaveDate(row.date)}</h5><p>{row.instruction}</p><small>Ansvar: {row.owner}. Registreringen gjelder din dokumenterte oppfølging.</small>
     <Field label={row.title+' – status'}><select value={draft.followup.milestones[row.id].status} onChange={e=>changeMilestone(row.id,{status:e.target.value})}><option value="open">Gjenstår</option><option value="review">Behov skal vurderes</option><option value="done">Håndtert</option><option value="exempt">Unntak dokumentert</option></select></Field>
     <Field label={row.title+' – dato for håndtering/vurdering'}><input type="date" max={osloToday()} value={draft.followup.milestones[row.id].on} onChange={e=>changeMilestone(row.id,{on:e.target.value})}/></Field>
     <Field label={row.title+' – kort dokumentasjon'}><textarea maxLength={1000} rows={3} value={draft.followup.milestones[row.id].note} onChange={e=>changeMilestone(row.id,{note:e.target.value})}/></Field></article>)}
   </fieldset><p className="hrp-readonly">Appen viser dine frister og åpne tiltak. Når e-post er aktiv i miljøet, får nærmeste leder og ansvarlig for tiltaket en generell HR-påminnelse tre dager før, på fristen og deretter ukentlig. Ferdige punkter og avsluttet sak gir ingen nye påminnelser.</p>
  </>}
  {step===5&&<><p>En lagret eller bekreftet plan er ikke sendt til NAV eller sykmelder. Last ned planen, kontroller innholdet og bruk riktig kanal utenfor ProffDok. Registrer først etter at du faktisk har delt den. ProffDok sender ingen plan til NAV.</p>
   <a href="https://www.nav.no/arbeidsgiver/oppfolgingsplan" target="_blank" rel="noopener noreferrer">Se hvordan oppfølgingsplanen deles hos NAV</a>
   {['sykmelder','nav'].map(target=><article className="hrp-question" key={target}><h5>{target==='nav'?'Deling med NAV':'Deling med sykmelder'}</h5>{c.sharing[target].length?c.sharing[target].map((item,i)=><p key={i}>Utgave {item.version} · {item.on} · {item.channel==='nav_portal'?'NAVs løsning':item.channel==='paper'?'Papir':'Annen avtalt kanal'}</p>):<p>Ingen deling registrert.</p>}</article>)}
   {followup&&<fieldset disabled={busy}><Field label="Delt med"><select value={shareTarget} onChange={e=>setShareTarget(e.target.value)}><option value="sykmelder">Sykmelder</option><option value="nav">NAV</option></select></Field><Field label="Faktisk delingsdato"><input type="date" max={osloToday()} value={shareOn} onChange={e=>setShareOn(e.target.value)}/></Field><Field label="Delt lagret utgave"><input type="number" min="1" max={value.current_revision} value={shareVersion||value.current_revision} onChange={e=>setShareVersion(e.target.value)}/></Field><Field label="Kanal brukt"><select value={shareChannel} onChange={e=>setShareChannel(e.target.value)}><option value="nav_portal">NAVs løsning</option><option value="paper">Papir</option><option value="other">Annen avtalt kanal</option></select></Field><label className="hrp-check"><input type="checkbox" checked={shareConfirmed} onChange={e=>setShareConfirmed(e.target.checked)}/>Jeg bekrefter at denne utgaven faktisk er delt.</label><button type="button" disabled={dirty||!shareConfirmed} onClick={()=>{act('log_sharing',{target:shareTarget,on:shareOn,version:Number(shareVersion||value.current_revision),channel:shareChannel,confirmed:true});setShareConfirmed(false);}}>Registrer faktisk deling</button></fieldset>}
   <article className="hrp-question"><h5>{c.case_status==='closed'?'Oppfølgingen er avsluttet':'Avslutt oppfølgingen'}</h5><p>Avslutning beholder historikken og stopper nye påminnelser. Dette avslutter ikke arbeidsforholdet. Avslutningsdato: {c.returned_on||'Ikke registrert'}.</p>
    {followup&&<><Field label="Faktisk avslutningsdato"><input type="date" max={osloToday()} value={closeOn} onChange={e=>setCloseOn(e.target.value)}/></Field><label className="hrp-check"><input type="checkbox" checked={closeConfirmed} onChange={e=>setCloseConfirmed(e.target.checked)}/>Jeg bekrefter at denne oppfølgingen skal avsluttes.</label><button type="button" disabled={busy||dirty||!closeConfirmed} onClick={()=>{act('close',{on:closeOn,confirmed:true});setCloseConfirmed(false);}}>Avslutt oppfølging</button></>}
    {permitted&&value.permissions.reopen&&<button type="button" disabled={busy||dirty} onClick={()=>cleanAction('reopen')}>Gjenåpne oppfølging</button>}
   </article>
  </>}
  <div className="hrp-toolbar">{permitted&&(prep||meeting||followup||value.permissions.comment)&&<button disabled={busy||!dirty} onClick={save}>Lagre oppfølging</button>}
   {step>0&&<button className="secondary" disabled={busy} onClick={()=>setStep(step-1)}>Forrige</button>}{step<5&&<button className="secondary" disabled={busy} onClick={()=>setStep(step+1)}>Neste</button>}
  </div></div></>}
 </section>;
}
