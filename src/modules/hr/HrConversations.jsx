import React,{useEffect,useRef,useState} from 'react';
import {hrRpc} from './hrAccess.js';
import {createConversationSession,CONVERSATION_STAGES,conversationOpeningStep} from './hrConversationSession.mjs';
import {sameHrTemplate} from './hrConversationTemplates.mjs';
import {osloToday} from './hrPracticeConversation.mjs';
import {MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT} from '../access/moduleAccessClient.js';
import {WORK_PROFILE_EVENT} from '../access/workProfileClient.js';
import './hrPracticeConversation.css';
import './hrConversations.css';
import HrConversationFeedback from './HrConversationFeedback.jsx';
import {hrEmployeeLabel} from './hrEmployeeLabel.mjs';
import HrConversationReview from './HrConversationReview.jsx';
// Only volatile navigation/drafts, scoped to actor/company/employee. Never browser storage.
const workspaces=new Map();
const remember=(scope,v)=>{const entryKey=v.entryKey??workspaces.get(scope)?.entryKey;workspaces.delete(scope);workspaces.set(scope,{...v,entryKey});if(workspaces.size>4)workspaces.delete(workspaces.keys().next().value);};
const editable=c=>({preparation:c.preparation,meeting:c.meeting,actions:c.actions,next_on:c.next_on,comments:c.comments,on:c.on,meeting_time:c.meeting_time||'',meeting_location:c.meeting_location||''});
const copy=v=>JSON.parse(JSON.stringify(v));
const emailText={disabled:'E-postutsending er avslått i dette miljøet.',not_queued:'E-postinvitasjonen er ikke sendt.',pending:'E-post er lagt i kø for utsending.',sending:'E-post sendes …',sent:'E-post er sendt. Utsendingen er bekreftet av e-posttjenesten.',failed:'E-post kunne ikke sendes. Kontakt firmaadmin.',suppressed:'E-postutsendingen er stoppet fordi tidspunkt eller tilgang er endret.'};
function Field({label,children}){return <label className="hrp-field"><span>{label}</span>{children}</label>;}
export default function HrConversations({context,employee,initialCaseId=null,initialEntryKey=null,initialStep=0,feedbackNotice=null,onFeedbackHandled=null}){
 const companyId=context.company_id,userId=context.user_id,employeeId=employee.id,scope=companyId+':'+userId+':'+employeeId;
 const [listing,setListing]=useState(null),[value,setValue]=useState(null),[draft,setDraft]=useState(null);
 const [templates,setTemplates]=useState(null),[templateId,setTemplateId]=useState(''),[on,setOn]=useState(osloToday);
 const [location,setLocation]=useState('');
 const [time,setTime]=useState(''),[calendarMinutes,setCalendarMinutes]=useState(60);
 const [createOpen,setCreateOpen]=useState(()=>Boolean(workspaces.get(scope)?.startAttempt)),[startPending,setStartPending]=useState(()=>Boolean(workspaces.get(scope)?.startAttempt)),[delivery,setDelivery]=useState(null);
 const startAttempt=useRef(workspaces.get(scope)?.startAttempt||null),creationFocus=useRef(false),receipt=useRef(null);
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[conflict,setConflict]=useState(false);
 const [step,setStep]=useState(()=>workspaces.get(scope)?.step||0),[historyVersion,setHistoryVersion]=useState('');
 const session=useRef(null),epoch=useRef(0),busyRef=useRef(false),body=useRef(null),latest=useRef(null),alive=useRef(false);
 const entryHandled=useRef(false);
 const dirty=Boolean(value&&draft&&!sameHrTemplate(editable(value.conversation),draft));
 const keep=(next,valueOverride=value)=>{remember(scope,{id:valueOverride?.conversation.id,revision:valueOverride?.current_revision,
  employeeRevision:valueOverride?.employee.revision,version:valueOverride?.historical?valueOverride.conversation.revision:null,draft:copy(next),dirty:!sameHrTemplate(next,editable(valueOverride.conversation)),step});setDraft(next);};
 const install=(result,preserve=false)=>{
  const saved=preserve?workspaces.get(scope):null;
  const unchanged=Boolean(saved?.draft&&saved.id===result.conversation.id&&saved.revision===result.current_revision&&saved.employeeRevision===result.employee.revision);
  setValue(result);latest.current=result;setDraft(unchanged?saved.draft:editable(result.conversation));setConflict(false);
  if(startAttempt.current?.id===result.conversation.id){
   startAttempt.current=null;setStartPending(false);setCreateOpen(false);setTemplateId('');setTime('');setLocation('');
   creationFocus.current=true;setDelivery({id:result.conversation.id,created:true,status:null});
  }
  if(saved?.dirty&&saved.id===result.conversation.id&&!unchanged&&!sameHrTemplate(saved.draft,editable(result.conversation))){setDraft(saved.draft);setConflict(true);setError('Samtalen eller tilgangen er endret. Kladden din er beholdt, men kan ikke lagres over den nye utgaven.');}
  else remember(scope,{id:result.conversation.id,revision:result.current_revision,employeeRevision:result.employee.revision,version:result.historical?result.conversation.revision:null,draft:copy(unchanged?saved.draft:editable(result.conversation)),dirty:unchanged&&Boolean(saved?.dirty),step:saved?.step??step});
 };
 useEffect(()=>{
  alive.current=true;++epoch.current;
  const denied=()=>{workspaces.delete(scope);startAttempt.current=null;if(alive.current){setValue(null);latest.current=null;setDraft(null);setListing(null);setDelivery(null);setStartPending(false);setCreateOpen(false);}};
  const s=createConversationSession({rpc:hrRpc,companyId,userId,employeeId,onDenied:denied});session.current=s;
  const refresh=async()=>{
   const ticket=++epoch.current;s.invalidate();setBusy(true);busyRef.current=true;setError('');
   setValue(null);latest.current=null;setDraft(null);setListing(null);setTemplates(null);
   try{
    if(document.visibilityState==='hidden')return;
    const rows=await s.list();if(!alive.current||ticket!==epoch.current)return;setListing(rows);
    const saved=workspaces.get(scope);
    const requested=initialCaseId&&!entryHandled.current;entryHandled.current=true;
    if(requested&&(!saved?.dirty||saved.id===initialCaseId)&&!saved?.startAttempt){
     const result=await s.get(initialCaseId);if(alive.current&&ticket===epoch.current){install(result,true);setStep(saved?.id===initialCaseId&&saved.entryKey===initialEntryKey?saved.step||0:feedbackNotice?conversationOpeningStep(result.conversation):initialStep);remember(scope,{...workspaces.get(scope),entryKey:initialEntryKey});}
    }else if(saved?.id&&(rows.conversations.some(c=>c.id===saved.id)||initialCaseId)){
     const result=await s.get(saved.id,saved.version??null);if(alive.current&&ticket===epoch.current){install(result,true);setStep(saved.step||0);if(requested&&saved.id!==initialCaseId)setNotice('Du har en ulagret kladd. Lagre den eller velg Åpne valgt samtale før du bytter.');}
    }else if(saved?.id)workspaces.delete(scope);
   }catch(e){if(alive.current&&ticket===epoch.current){setError(e.code==='42501'?'Samtaler er ikke tilgjengelige for denne medarbeideren ennå.':e.message);if(e.code==='42501')denied();}}
   finally{if(alive.current&&ticket===epoch.current){setBusy(false);busyRef.current=false;}}
  };
  refresh();const events=[WORK_PROFILE_EVENT,MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT,'focus'];
  events.forEach(name=>window.addEventListener(name,refresh));document.addEventListener('visibilitychange',refresh);
  return()=>{alive.current=false;epoch.current++;s.dispose();session.current=null;events.forEach(name=>window.removeEventListener(name,refresh));document.removeEventListener('visibilitychange',refresh);};
 },[companyId,userId,employeeId]);
 useEffect(()=>{if(workspaces.has(scope))remember(scope,{...workspaces.get(scope),step});const target=creationFocus.current?receipt.current:body.current;creationFocus.current=false;target?.focus();target?.scrollIntoView({block:'start'});},[step,value?.conversation.id]);
 useEffect(()=>{
  const id=value?.conversation.id,s=session.current;if(!id||value.historical||!s){setDelivery(null);return;}
  let stopped=false,timer,attempts=0;
  const refresh=async()=>{
   if(stopped)return;
   if(document.visibilityState==='hidden'){timer=setTimeout(refresh,5000);return;}
   try{const status=await s.invitationStatus(id);if(stopped||latest.current?.conversation.id!==id)return;
    setDelivery(previous=>({...previous,id,created:previous?.id===id&&Boolean(previous.created),status,error:''}));
    if(['pending','sending'].includes(status.email_status)&&++attempts<18)timer=setTimeout(refresh,5000);
   }catch(e){if(!stopped&&e.code!=='42501')setDelivery(previous=>({...previous,id,created:previous?.id===id&&Boolean(previous.created),status:null,error:'Varslingsstatus kunne ikke hentes. Samtalen er lagret.'}));}
  };refresh();return()=>{stopped=true;clearTimeout(timer);};
 },[value?.conversation.id,value?.current_revision,value?.conversation.stage,value?.historical,scope,delivery?.status?.email_status]);
 useEffect(()=>{if(!dirty)return;const handler=e=>{e.preventDefault();e.returnValue='';};window.addEventListener('beforeunload',handler);return()=>window.removeEventListener('beforeunload',handler);},[dirty]);
 const run=async(job)=>{
  if(busyRef.current||!session.current)return;const ticket=++epoch.current,s=session.current;
  const current=()=>alive.current&&ticket===epoch.current&&session.current===s;
  busyRef.current=true;setBusy(true);setError('');setNotice('');
  try{await job(s,current);}catch(e){if(current()){setError(e.code==='40001'?'En annen bruker har endret samtalen. Kladden er beholdt. Hent lagret utgave før du fortsetter.':e.message);if(e.code==='40001')setConflict(true);}}
  finally{if(current()){busyRef.current=false;setBusy(false);}}
 };
 const leave=()=>!dirty||window.confirm('Du har ulagrede endringer. Vil du åpne en annen samtale og legge kladden til side?');
 const open=(id,version=null)=>run(async(s,current)=>{if(!leave())return;const result=await s.get(id,version);if(current()){install(result);setStep(conversationOpeningStep(result.conversation));setHistoryVersion('');body.current?.focus();body.current?.scrollIntoView({block:'start'});}});
 const change=patch=>keep({...draft,...patch});
 const act=(action,data={})=>run(async(s,current)=>{
  const result=await s.command(value,action,data);if(current()){install(result);setNotice('Lagret på serveren · utgave '+result.current_revision+'.');if(action==='share')setStep(1);if(action==='ready'||action==='confirm')setStep(3);}
 });
 const save=()=>run(async(s,current)=>{
  if(conflict||value?.historical)return;const wanted=copy(draft);let result=value;
  if(value.employee.leader_id===userId&&['preparation','meeting'].includes(value.conversation.stage)
   &&!sameHrTemplate([wanted.on,wanted.meeting_time,wanted.meeting_location],[value.conversation.on,value.conversation.meeting_time||'',value.conversation.meeting_location||'']))
   result=await s.schedule(result,{on:wanted.on,time:wanted.meeting_time,location:wanted.meeting_location});
  if(!current())return;
  if(value.permissions.prepare&&!sameHrTemplate(wanted.preparation,value.conversation.preparation))
   result=await s.command(result,'preparation',{answers:wanted.preparation});
  if(!current())return;
  if(value.permissions.meeting&&!sameHrTemplate([wanted.meeting,wanted.actions,wanted.next_on],[value.conversation.meeting,value.conversation.actions,value.conversation.next_on]))
   result=await s.command(result,'meeting',{answers:wanted.meeting,actions:wanted.actions,next_on:wanted.next_on});
  if(!current())return;const side=value.employee.user_id===userId?'employee':'leader';
  if(value.permissions.comment&&wanted.comments[side]!==value.conversation.comments[side])
   result=await s.command(result,'comment',{text:wanted.comments[side]});
  if(current()){install(result);setNotice('Lagret på serveren · utgave '+result.current_revision+'.');}
 });
 const cleanAction=action=>{if(dirty){setError('Lagre endringene først.');return;}act(action);};
 const exportPdf=()=>run(async(s,current)=>{
  if(dirty){setError('Lagre endringene før PDF.');return;}
  const fresh=await s.get(value.conversation.id,value.historical?value.conversation.revision:null);if(!current())return;
  if(fresh.current_revision!==value.current_revision){setError('Samtalen er endret. Hent ny utgave før PDF.');return;}
  const {downloadConversationPdf}=await import('./hrConversationPdf.mjs');
  const result=await downloadConversationPdf({value:fresh,companyName:context.company_name,isCurrent:current});if(result&&current())setNotice('Referatet er lastet ned. Samtalen står fortsatt åpen.');
 });
 const calendar=()=>run(async(s,current)=>{
  if(dirty){setError('Lagre endringene før kalenderavtalen.');return;}
  const fresh=await s.get(value.conversation.id);if(!current())return;
    if(![fresh.employee.user_id,fresh.employee.leader_id].includes(userId))throw Error('Kalenderavtalen er bare tilgjengelig for medarbeideren og gjeldende nærmeste leder.');
  if(fresh.current_revision!==value.current_revision){setError('Samtalen er endret. Hent ny utgave før kalenderavtalen.');return;}
  const {downloadConversationCalendar}=await import('./hrConversationCalendar.mjs');
  if(await downloadConversationCalendar({value:fresh,minutes:calendarMinutes,isCurrent:current})&&current())setNotice('Kalenderfilen er lastet ned. Åpne den og bekreft avtalen i kalenderen din.');
 });
 const outlook=()=>{
  if(busyRef.current||dirty)return;
  // Open synchronously on the click, before the two fresh authorized server reads.
  const popup=window.open('about:blank','_blank');
  if(!popup){setError('Nettleseren blokkerte Outlook-vinduet. Tillat nytt vindu, eller bruk Last ned kalenderfil (.ics).');return;}
  popup.opener=null;
  run(async(s,current)=>{
   let opened=false;
   try{
    const fresh=await s.get(value.conversation.id);if(!current())return;
    if(![fresh.employee.user_id,fresh.employee.leader_id].includes(userId))throw Error('Kalenderavtalen er bare tilgjengelig for medarbeideren og gjeldende nærmeste leder.');
    if(fresh.current_revision!==value.current_revision)throw Error('Samtalen er endret. Hent ny utgave før kalenderavtalen.');
    const {conversationOutlookUrl}=await import('./hrConversationCalendar.mjs');if(!current())return;
    if(popup.closed)throw Error('Outlook-vinduet ble lukket. Trykk Åpne i Outlook / Office 365 igjen.');
    popup.location.replace(conversationOutlookUrl(fresh,{minutes:calendarMinutes}));opened=true;
    setNotice('Outlook er åpnet. Kontroller jobbkonto, kalender og tidspunkt, og lagre avtalen der.');
   }finally{if(!opened)popup.close();}
  });
 };
 const c=value?.conversation,permitted=value&&!value.historical&&!conflict,prep=permitted&&value.permissions.prepare,meeting=permitted&&value.permissions.meeting;
 const schedule=permitted&&value.employee.leader_id===userId&&['preparation','meeting'].includes(c.stage);
 const stages=['Forberedelse','Felles møte','Tiltak','Referat'];
 const ownSide=value?.employee.user_id===userId?'employee':'leader';
 return <section className="hrp hr-real-conversation" aria-label="Medarbeidersamtaler">
  <h3>Medarbeidersamtaler</h3>
  {value&&<p className="hrp-employee-identity"><strong>Medarbeider: {hrEmployeeLabel(value.employee)}</strong>{value.employee.full_name&&value.employee.email&&<span> · {value.employee.email}</span>}</p>}
  <p>Forbered samtalen, gå gjennom temaene sammen og avtal oppfølging. Lagre underveis. Begge bekrefter selv når referatet er lest.</p>
  {busy&&<p role="status">Kontrollerer tilgang og lagring …</p>}{error&&<p role="alert" className="hrp-error">{error}</p>}{notice&&<p role="status" className="hrp-notice">{notice}</p>}
  {delivery&&c?.id===delivery.id&&!value.historical&&<div ref={receipt} tabIndex={-1} className="hrp-creation-receipt" role="status" aria-live="polite">
   <h4>{delivery.created?'Samtalen er opprettet':'Varsling til medarbeideren'}</h4>
   <p>{c.template.title} · {c.on?.split('-').reverse().join('.')} · {c.meeting_time?'kl. '+c.meeting_time:'Klokkeslett ikke avtalt'}</p><p>Sted: {c.meeting_location||'Ikke avtalt'}</p>
   {delivery.status?<><p>{c.shared?'Medarbeiderens forberedelse er delt. Fortsett i den åpne samtalen.':delivery.status.app_notification?'Varsel om forberedelse er opprettet på medarbeiderens Min side.':c.stage==='preparation'?'Medarbeideren mangler HR-tilgang. Kontroller HR-tilgang i firmaet samtalen tilhører. Firmaadmin bruker Firmaadmin → Brukere og tilganger. Systemadmin bruker Systemadmin → Firmaer, brukere og tilganger. Velg HR på riktig brukerkort og lagre tilgangen. Trykk deretter Oppdater varslingsstatus her.':'Medarbeideren har ingen åpen forberedelsesoppgave.'}</p><p>{emailText[delivery.status.email_status]}</p>{delivery.status.location_required&&c.stage==='preparation'&&value.employee.leader_id===userId&&<p>Åpne Endre tidspunkt og sted, fyll ut stedet og trykk Lagre samtale før du sender invitasjonen.</p>}</>:<p>{delivery.error||'Kontrollerer varslingsstatus …'}</p>}
   <button type="button" className="secondary" disabled={busy} onClick={()=>run(async(s,current)=>{const status=await s.invitationStatus(c.id);if(current())setDelivery(previous=>({...previous,id:c.id,status,error:''}));})}>Oppdater varslingsstatus</button>
   {delivery.status?.can_notify&&value.employee.leader_id===userId&&<button type="button" disabled={busy||dirty} onClick={()=>run(async(s,current)=>{const status=await s.notify(value);if(current())setDelivery(previous=>({...previous,id:c.id,status,error:''}));})}>Send e-postinvitasjon</button>}
  </div>}
  {initialCaseId&&value&&value.conversation.id!==initialCaseId&&<button type="button" className="secondary" disabled={busy||startPending} onClick={()=>open(initialCaseId)}>Åpne valgt samtale</button>}
  {listing?.can_start&&<details className="hrp-saved" open={createOpen} onToggle={e=>setCreateOpen(e.currentTarget.open)}><summary onClick={()=>{if(!templates)run(async(s,current)=>{const r=await s.templates();if(current())setTemplates(r.templates);});}}>Opprett ny medarbeidersamtale</summary><p>Dette oppretter en ny samtale. Fortsett i den åpne samtalen nedenfor hvis medarbeideren allerede har sendt inn sin forberedelse.</p>
   <form onSubmit={e=>{e.preventDefault();run(async(s,current)=>{if(!leave())return;const t=templates?.find(t=>t.id===templateId);if(!t&&!startAttempt.current)return;
    const args=startAttempt.current||{id:crypto.randomUUID(),employeeRevision:listing.employee.revision,templateId:t.id,templateRevision:t.revision,on,time,location};
    startAttempt.current=args;setStartPending(true);remember(scope,{id:args.id,revision:0,employeeRevision:args.employeeRevision,draft:null,step:0,startAttempt:args});
    let r;try{r=await s.start(args);}catch(e){if(['22023','40001','42501'].includes(e.code)){startAttempt.current=null;setStartPending(false);}throw e;}
    if(current()){install(r);setListing(previous=>({...previous,conversations:[...previous.conversations.filter(row=>row.id!==r.conversation.id),{id:r.conversation.id,title:r.conversation.template.title,revision:r.current_revision,stage:r.conversation.stage,on:r.conversation.on,meeting_time:r.conversation.meeting_time}]}));setStep(0);}
   });}}><fieldset disabled={busy||startPending}><Field label="Samtalemal"><select required value={templateId} onChange={e=>setTemplateId(e.target.value)}><option value="">Velg mal</option>{templates?.map(t=><option key={t.id} value={t.id}>{t.title}</option>)}</select></Field>
   {templates?.length===0&&<p>Firmaadmin lager og lagrer en samtalemal under HR → Samtalemaler først.</p>}
   <Field label="Samtaledato"><input required type="date" value={on} onChange={e=>setOn(e.target.value)}/></Field>
   <Field label="Klokkeslett"><input required type="time" step="60" value={time} onChange={e=>setTime(e.target.value)}/></Field><p>Klokkeslettet er norsk tid.</p><Field label="Sted"><input required maxLength={200} value={location} placeholder="Møterom eller adresse" onChange={e=>setLocation(e.target.value)}/></Field><p>Skriv hvor dere skal møtes. Stedet følger invitasjonen og kalenderavtalen.</p>
   </fieldset>{startPending&&<p>Oppretting er sendt. Kontroller samme oppretting før du prøver en ny samtale.</p>}
   <button disabled={busy||(!startPending&&(!templateId||!time||!location.trim()))}>{startPending?'Kontroller oppretting':'Opprett samtale'}</button></form>
  </details>}
  {listing&&<details className="hrp-saved" open><summary>Lagrede samtaler og historikk ({listing.conversations.length})</summary>
   {!listing.conversations.length&&<p>Ingen samtaler er opprettet. Nærmeste leder starter samtalen.</p>}
   {listing.conversations.map(row=>{const saved=row.id===c?.id&&!value.historical?c:row;return <button type="button" className="secondary" key={row.id} disabled={busy} onClick={()=>open(row.id)}>{row.title} · {saved.on} · {saved.meeting_time?'kl. '+saved.meeting_time:'Klokkeslett ikke avtalt'} · {CONVERSATION_STAGES[row.id===c?.id?c.stage:row.stage]}</button>;})}
   {listing.next&&<button disabled={busy} onClick={()=>run(async(s,current)=>{const r=await s.list(listing.next);if(current())setListing(previous=>({...r,conversations:[...previous.conversations,...r.conversations]}));})}>Hent flere samtaler</button>}
  </details>}
  {value&&draft&&<><div className="hrp-toolbar"><strong>{c.template.title}</strong><span>{CONVERSATION_STAGES[c.stage]} · utgave {c.revision} · {dirty?'Ulagrede endringer':'Lagret på serveren'}</span>
   <button type="button" className="secondary" disabled={busy} onClick={()=>run(async(s,current)=>{const r=await s.get(c.id);if(current()){install(r,true);setNotice('Lagret utgave er hentet.');}})}>Hent lagret utgave</button>
   {conflict&&<button type="button" disabled={busy} onClick={()=>{if(window.confirm('Vil du forkaste kladden og bruke den lagrede utgaven?')){workspaces.delete(scope);install(value);}}}>Bruk lagret utgave</button>}
  </div>
  <p className="hrp-stage-guide" role="status">{c.stage==='preparation'?'Medarbeideren forbereder seg. Lagre egne svar, og trykk «Klar til samtale» for å dele dem med lederen.':c.stage==='meeting'?'Forberedelsen er delt. Gå gjennom svarene i Felles møte, skriv møtereferatet og avtal eventuelle tiltak. Se over Referat før det sendes til begge for gjennomgang.':c.stage==='awaiting'?'Referatet er sendt til gjennomgang. Begge må lese og trykke «Jeg har lest referatet» fra sin egen konto.':'Begge har lest referatet. Samtalen er ferdig. Avtalte tiltak må fortsatt følges opp.'}</p>
  <p><strong>Sted:</strong> {c.meeting_location||'Ikke avtalt'}</p>
  <p><strong>Avtalt tidspunkt:</strong> {c.on?.split('-').reverse().join('.')} · {c.meeting_time?'kl. '+c.meeting_time+' (norsk tid)':'Klokkeslett ikke avtalt'}</p>
  {!value.historical&&[value.employee.user_id,value.employee.leader_id].includes(userId)&&c.meeting_time&&<div className="hrp-calendar">
   <Field label="Varighet i kalenderen"><select value={calendarMinutes} disabled={busy} onChange={e=>setCalendarMinutes(Number(e.target.value))}>{[30,45,60,90,120].map(n=><option key={n} value={n}>{n} minutter</option>)}</select></Field>
   <button type="button" disabled={busy||dirty} onClick={outlook}>Åpne i Outlook / Office 365</button>
   <button type="button" className="secondary" disabled={busy||dirty} onClick={calendar}>Last ned kalenderfil (.ics)</button>
   <p>Outlook åpner en ny avtale med lagret dato, klokkeslett og valgt varighet. Kontroller at du bruker riktig jobbkonto og velg kalender i Outlook før du lagrer. Avtalen er først lagt i kalenderen når du har lagret den der.</p>
   <details><summary>Bruke kalenderfil i Office 365 eller annen kalender</summary><p>Last ned kalenderfilen. I Outlook på nettet: Kalender → Legg til kalender → Last opp fra fil. Velg filen, velg riktig kalender og trykk Importer. Andre kalenderprogrammer kan åpne filen direkte.</p></details>
   <p>Ved endret tidspunkt må du oppdatere avtalen i kalenderen. Gjentatt åpning i Outlook kan lage en ny avtale.</p>
  </div>}
  {schedule&&<div className="hrp-leader-reminder"><label><input type="checkbox" checked={c.leader_email_reminder===true&&c.leader_reminder_user_id===userId} disabled={busy||dirty} onChange={e=>{const enabled=e.target.checked;run(async(s,current)=>{const result=await s.reminder(value,enabled);if(current()){install(result);setNotice(enabled?'E-postpåminnelse til deg er valgt.':'E-postpåminnelse til deg er slått av.');}});}}/> Send meg e-postpåminnelse dagen før</label><p>Påminnelsen sendes 24 timer før avtalen. Velger du den senere, sendes den så snart som mulig før møtet. E-post må være aktivert i miljøet.</p></div>}
  {schedule&&<details className="hrp-saved"><summary>Endre tidspunkt og sted</summary><fieldset disabled={busy}>
   <Field label="Ny samtaledato"><input required type="date" value={draft.on} onChange={e=>change({on:e.target.value})}/></Field>
   <Field label="Nytt klokkeslett"><input required type="time" step="60" value={draft.meeting_time} onChange={e=>change({meeting_time:e.target.value})}/></Field>
   <Field label="Nytt sted"><input required maxLength={200} value={draft.meeting_location} placeholder="Møterom eller adresse" onChange={e=>change({meeting_location:e.target.value})}/></Field><p>Trykk «Lagre samtale» for å lagre tidspunkt og sted. Endret sted eller tidspunkt krever ny invitasjon og oppdatering av kalenderavtalen.</p></fieldset></details>}
  {value.historical&&<p className="hrp-readonly">Historisk utgave. Denne kan bare leses. <button className="secondary" disabled={busy} onClick={()=>open(c.id)}>Åpne gjeldende utgave</button></p>}
  <HrConversationFeedback value={value} context={context} feedback={feedbackNotice} blocked={busy||dirty||conflict} onHandled={onFeedbackHandled}/>
  <nav className="hrp-steps" aria-label="Steg i medarbeidersamtalen">{stages.map((title,i)=><button key={title} disabled={busy} aria-current={step===i?'step':undefined} onClick={()=>setStep(i)}><span>{i+1}</span>{title}</button>)}</nav>
  <div ref={body} tabIndex={-1} className="hrp-step-body">
  <h4>{stages[step]}</h4>
  {step===0&&<><p>{c.shared?'Medarbeiderens forberedelse er delt med lederen. De opprinnelige svarene beholdes. Fortsett i Felles møte.':'Medarbeideren skriver egne svar. De er private til medarbeideren trykker «Klar til samtale».'}</p>
   {!c.shared&&!prep&&<p>Forberedelsen er ikke delt ennå.</p>}
   {c.template.questions.filter(q=>q.phase==='preparation').map(q=><article className="hrp-question" key={q.id}><h5>{q.topic}</h5><Field label={q.prompt+(q.required?' *':'')}><textarea rows={4} maxLength={4000} disabled={busy||!prep} value={draft.preparation[q.id]||''} onChange={e=>change({preparation:{...draft.preparation,[q.id]:e.target.value}})}/></Field></article>)}
   {prep&&<><p>Lagre svarene med «Lagre samtale». Trykk deretter «Klar til samtale» når du vil dele dem med lederen.</p><button disabled={busy||dirty} onClick={()=>cleanAction('share')}>Klar til samtale</button></>}
  </>}
  {step===1&&<><p>Gå gjennom medarbeiderens innspill sammen. Nærmeste leder skriver møtereferatet. Medarbeiderens opprinnelige svar beholdes.</p>
   {c.template.questions.filter(q=>q.phase==='preparation').map(q=><article className="hrp-question" key={q.id}><h5>{q.topic}</h5><blockquote>{c.preparation[q.id]||'Ikke delt eller ikke utfylt'}</blockquote></article>)}
   {c.shared&&c.comments.employee&&<article className="hrp-question"><h5>Medarbeiderens delte kommentar</h5><blockquote>{c.comments.employee}</blockquote><p>Begge egne kommentarer kan leses og redigeres under Referat.</p></article>}
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
  {step===3&&<><p>Se over medarbeiderens delte forberedelse, møtereferatet og tiltakene nedenfor. Begge bekrefter selv når referatet er lest. Bekreftelse betyr gjennomlest; uenighet kan stå i egen kommentar.</p>
   <HrConversationReview conversation={c} employee={value.employee} leaderEmail={value.leader_email} draft={draft} dirty={dirty}/>
   {['employee','leader'].map(side=><Field key={side} label={side==='employee'?'Medarbeiderens kommentar':'Lederens kommentar'}><textarea rows={3} maxLength={4000} disabled={busy||!permitted||!value.permissions.comment||side!==ownSide} value={draft.comments[side]} onChange={e=>change({comments:{...draft.comments,[side]:e.target.value}})}/></Field>)}
   <p>Medarbeider: {c.confirmations.employee?'Bekreftet':'Venter på bekreftelse'} · Leder: {c.confirmations.leader?'Bekreftet':'Venter på bekreftelse'}</p>
   {meeting&&c.stage==='meeting'&&<><p>«Lagre samtale» lagrer arbeidet. Når referatet er klart, trykker lederen «Send til begge for gjennomgang». Samtalen blir ferdig først når begge har lest og bekreftet.</p><button disabled={busy||dirty} onClick={()=>cleanAction('ready')}>Send til begge for gjennomgang</button></>}
   {c.stage==='awaiting'&&<p>Referatet venter på bekreftelsene som mangler. Det skal ikke sendes på nytt. Endrer dere referatet eller en delt kommentar, må begge bekrefte den nye utgaven.</p>}
   {permitted&&value.permissions.confirm&&!c.confirmations[ownSide]&&<button disabled={busy||dirty} onClick={()=>cleanAction('confirm')}>Jeg har lest referatet</button>}
   {permitted&&value.employee.leader_id===userId&&c.stage==='completed'&&<button className="secondary" disabled={busy||dirty} onClick={()=>cleanAction('revise')}>Lag ny referatutgave</button>}
   <button className="secondary" disabled={busy||dirty} onClick={exportPdf}>Last ned referat som PDF</button>
   <Field label="Åpne historisk utgave"><input type="number" min="1" max={value.current_revision} value={historyVersion} onChange={e=>setHistoryVersion(e.target.value)}/></Field>
   <button className="secondary" disabled={busy||!historyVersion} onClick={()=>open(c.id,Number(historyVersion))}>Åpne utgave</button>
  </>}
  {dirty&&<p className="hrp-notice">Du har ulagrede endringer. Trykk «Lagre samtale» før du deler forberedelsen, sender referatet til gjennomgang eller bekrefter at du har lest det.</p>}
  <p>Forrige og Neste bytter steg. De lagrer ikke endringer.</p>
  <div className="hrp-toolbar">{permitted&&(prep||meeting||schedule||value.permissions.comment)&&<button disabled={busy||!dirty} onClick={save}>Lagre samtale</button>}
   {step>0&&<button className="secondary" disabled={busy} onClick={()=>setStep(step-1)}>Forrige</button>}{step<3&&<button className="secondary" disabled={busy} onClick={()=>setStep(step+1)}>Neste</button>}
  </div></div></>}
 </section>;
}
