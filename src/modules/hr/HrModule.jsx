import React,{useCallback,useEffect,useRef,useState} from 'react';
import {createHrFoundationSession,hrClosureMessage} from './hrFoundation.mjs';
import {hrRpc} from './hrAccess.js';
import {MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT,publishManagedAccessChange} from '../access/moduleAccessClient.js';
import {WORK_PROFILE_EVENT} from '../access/workProfileClient.js';
import './hr.css';
import ModuleHeading from '../ui/ModuleHeading.jsx';
import {UserRound,ShieldCheck,ChevronRight,UsersRound,Settings,FileCheck2,Info,ArrowRight,HeartPulse} from 'lucide-react';
import HrTextSuggestion from './HrTextSuggestion.jsx';
import PrivateContact from './PrivateContact.jsx';
import {HR_SETUP_SUGGESTIONS,suggestedReviewDate} from './hrSetupSuggestions.mjs';

const emptyConfig={purpose:'',legalBasis:'',reviewOn:'',enabled:false};
function Field({label,children}) {return <label className="hr-field"><span>{label}</span>{children}</label>;}
function UserSelect({label,value,onChange,members,exclude=[],required=false}) {
 return <Field label={label}><select value={value} onChange={event=>onChange(event.target.value)} required={required}>
  <option value="">{required?'Velg bruker':'Ingen leder valgt'}</option>
  {members.filter(member=>!exclude.includes(member.id)).map(member=><option key={member.id} value={member.id}>{member.email||'Aktiv bruker'}</option>)}
 </select></Field>;
}

export default function HrModule({context,audience='legacy',initialEmployeeId=null,onEmployeeSelect}) {
 const {company_id:companyId,user_id:userId}=context;
 const administer=context.administer===true&&audience!=='personal';
 const list=(session,after=null)=>audience==='personal'?session.personalList(after):audience==='management'?session.managementList(after):session.list(after);
 const [data,setData]=useState(null),[members,setMembers]=useState([]),[memberNext,setMemberNext]=useState(null);
 const [detail,setDetail]=useState(null),[error,setError]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false);
 const [config,setConfig]=useState(emptyConfig),[employeeUser,setEmployeeUser]=useState(''),[newLeader,setNewLeader]=useState('');
 const [leader,setLeader]=useState(''),[clearOld,setClearOld]=useState(false),[reader,setReader]=useState(''),[reason,setReason]=useState(''),[ending,setEnding]=useState(false),[endConfirmed,setEndConfirmed]=useState(false);
 const [query,setQuery]=useState('');
 const registerRef=useRef(null),setupCardRef=useRef(null),purgeCardRef=useRef(null);
 const goTo=target=>{const element=target.current;if(!element)return;if(element.tagName==='DETAILS')element.open=true;element.focus();element.scrollIntoView({block:'start'});};
 const sessionRef=useRef(null),revision=useRef(0),busyRef=useRef(false),detailRef=useRef(null),regionRef=useRef(null);
 // This ref holds only the chosen record ID. Every return performs a new scoped list + double read.
 const selectedId=useRef(initialEmployeeId),selectionScope=useRef(companyId+':'+userId),selectionCallback=useRef(onEmployeeSelect);selectionCallback.current=onEmployeeSelect;
 if(selectionScope.current!==companyId+':'+userId){selectionScope.current=companyId+':'+userId;selectedId.current=null;}
 const selectId=id=>{selectedId.current=id;selectionCallback.current?.(id);};
 const clear=useCallback(()=>{setData(null);setMembers([]);setMemberNext(null);setDetail(null);detailRef.current=null;setLeader('');setReader('');setReason('');setClearOld(false);setEnding(false);setEndConfirmed(false);},[]);
 const installDetail=employee=>{setDetail(employee);detailRef.current=employee;setLeader(employee?.leader_id||'');setClearOld(false);setReader('');setReason('');setEnding(false);setEndConfirmed(false);};
 const load=useCallback(async(session)=>{
  const state=administer?await session.state():null;
  const enabled=state?Boolean(state.settings?.enabled):context.enabled;
  const listing=enabled?await list(session):{employees:[],next:null};
  const purges=administer?await session.purgeStatus():{receipts:[],next:null};
  return {state,listing,enabled,purges};
 },[administer,context.enabled,audience]);
 const install=result=>{
  setData({settings:result.state?.settings||null,...result.listing,enabled:result.enabled,purges:result.purges});
  setMembers(result.state?.members||[]);setMemberNext(result.state?.next||null);
  if(result.state){const s=result.state.settings;setConfig(s?{purpose:s.purpose,legalBasis:s.legal_basis,reviewOn:s.review_on,enabled:s.enabled}:emptyConfig);}
 };
 useEffect(()=>{
  let alive=true;
  const session=createHrFoundationSession({rpc:hrRpc,companyId,userId,onClear:()=>{if(alive)clear();}});
  sessionRef.current=session;
  const refresh=async()=>{
   const ticket=++revision.current;session.invalidate();setError('');setNotice('');setBusy(true);busyRef.current=true;
   try{if(document.visibilityState!=='hidden'){const result=await load(session);const id=selectedId.current;const fresh=id&&result.listing.employees.some(employee=>employee.id===id)?await session.get(id):null;if(alive&&ticket===revision.current){install(result);if(fresh)installDetail(fresh.employee);else selectId(null);}}}
   catch(e){if(alive&&ticket===revision.current)setError(e.code==='42501'?'HR-tilgangen er endret. Kontroller aktivt firma eller kontakt firmaadmin.':e.message);}
   finally{if(alive&&ticket===revision.current){setBusy(false);busyRef.current=false;}}
  };
  refresh();
  // Backgrounding immediately removes records. No HR data is stored offline.
  const events=[WORK_PROFILE_EVENT,MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT,'focus'];
  events.forEach(name=>window.addEventListener(name,refresh));document.addEventListener('visibilitychange',refresh);
  const timer=window.setInterval(async()=>{
   if(document.visibilityState==='hidden'||busyRef.current)return;
   const ticket=++revision.current;
   busyRef.current=true;setBusy(true);
   try{
    const selected=detailRef.current;
    const result=await load(session);
    const fresh=selected?await session.get(selected.id):null;
    if(alive&&ticket===revision.current){
     setData({settings:result.state?.settings||null,...result.listing,enabled:result.enabled,purges:result.purges});
     if(fresh&&fresh.employee.revision!==selected.revision){installDetail(fresh.employee);setNotice('Tilgangen er endret. Se over den oppdaterte medarbeideren.');}
    }
   }catch(e){if(alive&&ticket===revision.current)setError(e.message);}
   finally{if(alive&&ticket===revision.current){busyRef.current=false;setBusy(false);}}
  },60000);
  return ()=>{alive=false;revision.current++;session.dispose();sessionRef.current=null;window.clearInterval(timer);events.forEach(name=>window.removeEventListener(name,refresh));document.removeEventListener('visibilitychange',refresh);};
 },[companyId,userId,administer,load,clear]);
 const run=async(job)=>{
  if(busyRef.current||!sessionRef.current)return;
  const ticket=++revision.current,session=sessionRef.current;
  setError('');setNotice('');setBusy(true);busyRef.current=true;
  const current=()=>ticket===revision.current&&sessionRef.current===session;
  try{await job(session,current);}
  catch(e){if(current())setError(e.code==='40001'?'En annen bruker har endret registeret. Trykk «Oppdater registeret» og se over endringen.':e.message);}
  finally{if(current()){setBusy(false);busyRef.current=false;}}
 };
 const open=id=>run(async(session,current)=>{installDetail(null);const result=await session.get(id);if(current()){installDetail(result.employee);selectId(result.employee.id);regionRef.current?.focus();}});
 const command=(action,payload,message)=>run(async(session,current)=>{
  // Fresh detail before every edit; expected revision still protects the write.
  if(action!=='create'){const fresh=await session.get(payload.id);if(fresh.employee.revision!==payload.revision){session.invalidate();throw new Error('Medarbeideren er endret. Oppdater registeret før du fortsetter.');}}
  const result=await session.command(action,payload);
  if(action==='end')message=hrClosureMessage(result);
  let refreshed;
  try{refreshed=await load(session);}catch(e){if(current()){installDetail(null);setNotice(message);setError('Handlingen er lagret. Registeret kunne ikke hentes på nytt. Kontroller aktivt firma og oppdater registeret.');}return;}
  if(current()){install(refreshed);installDetail(result.employee||null);selectId(result.employee?.id||null);setEmployeeUser('');setNewLeader('');setNotice(message);}
  // Other sessions must still freshly check in the database; this clears this tab's subscribers.
 });
 const refresh=()=>run(async(session,current)=>{session.invalidate();const result=await load(session);if(current())install(result);});
 const labelFor=id=>members.find(member=>member.id===id)?.email||'Bruker ikke i den hentede listen';
 const employees=data?.employees||[],shown=employees.filter(employee=>(employee.email||'').toLocaleLowerCase('nb-NO').includes(query.trim().toLocaleLowerCase('nb-NO')));
 const oldHasReader=Boolean(detail?.leader_id&&detail.readers?.some(grant=>grant.user_id===detail.leader_id));
 const selectedLeaderMissing=Boolean(leader&&!members.some(member=>member.id===leader));
 return <section className={audience==='personal'?'hr-module hr-personal':'hr-module'} aria-label={audience==='personal'?'Mine oppfølginger':'HR'}>
  {audience!=='personal'&&<ModuleHeading className="hr-heading" companyName={context.company_name} title="HR" description={administer?'Medarbeidere, nærmeste leder og trygg tilgang.':audience==='management'?'Medarbeiderne du følger opp som nærmeste leder.':'Dine tilgjengelige oppføringer og oppfølginger.'} role={administer?'Firmaadmin':audience==='management'?'Nærmeste leder':'Personlig tilgang'} icon={UsersRound}/>}
  {audience==='personal'?<div className="hr-personal-intro"><ShieldCheck aria-hidden="true"/><div><strong>Din oppføring. Din tilgang.</strong><p>Se egen medarbeideroppføring og det firmaadmin har delt med deg.</p></div></div>:<><p className="hr-coming"><HeartPulse size={16} aria-hidden="true"/>Samtaler og sykefraværsoppfølging kommer i neste del.</p><details className="module-guide"><summary><Info aria-hidden="true"/>Slik bruker du HR</summary><div className="hr-intro"><strong>Riktig leder. Riktig tilgang.</strong><p>{administer?'Registrer medarbeidere og velg nærmeste leder. Se over hvem som får lese før dere begynner med oppfølging.':audience==='management'?'Her ser du medarbeiderne du er registrert som nærmeste leder for. Egne oppfølginger ligger på Min side.':'Her ser du egen registeroppføring og medarbeidere du har fått uttrykkelig lesetilgang til.'}</p><p>Samtaler og sykefraværsoppfølging kommer i neste del. Du kan foreløpig ikke lagre referat, fraværsopplysninger eller filer her.</p></div></details></>}
  {audience!=='personal'&&data&&<nav className="hr-workspace-cards" aria-label="HR snarveier">
   <article className="hr-workspace-card"><span className="hr-workspace-icon"><UsersRound aria-hidden="true"/></span><h3>{administer?'Medarbeiderregister':audience==='management'?'Dine medarbeidere':'Dine oppføringer'}</h3><p>{administer?'Finn medarbeideren og kontroller leder og lesetilgang.':audience==='management'?'Åpne en medarbeider du er registrert som nærmeste leder for.':'Se egen oppføring og medarbeidere du har fått lesetilgang til.'}</p><button type="button" className="secondary" onClick={()=>goTo(registerRef)}>Se medarbeidere <ArrowRight aria-hidden="true"/></button></article>
   {administer&&<><article className="hr-workspace-card"><span className="hr-workspace-icon"><Settings aria-hidden="true"/></span><h3>Oppsett og kontrollfrist</h3><p>Se over firmaets formål, grunnlag og neste kontroll av tilgangen.</p><button type="button" className="secondary" onClick={()=>goTo(setupCardRef)}>Åpne oppsett <ArrowRight aria-hidden="true"/></button></article>
   <article className="hr-workspace-card"><span className="hr-workspace-icon"><FileCheck2 aria-hidden="true"/></span><h3>Slettekvitteringer</h3><p>Kontroller om en avslutning er ferdig slettet eller om filsletting pågår.</p><button type="button" className="secondary" onClick={()=>goTo(purgeCardRef)}>Se slettekvitteringer <ArrowRight aria-hidden="true"/></button></article></>}
  </nav>}
  <div className="hr-toolbar hr-register-target" ref={registerRef} tabIndex={-1}><h3>{administer?'Medarbeiderregister':audience==='personal'?'Dine oppføringer':'Mine oppfølginger'}</h3><button type="button" className="secondary" disabled={busy} onClick={refresh}>Oppdater registeret</button></div>
  {error&&<p className="hr-error" role="alert">{error}</p>}{notice&&<p className="hr-notice" role="status">{notice}</p>}
  {busy&&<p role="status">Kontrollerer tilgang og register …</p>}
  {data?.enabled&&<>
   {administer&&<details className="hr-card"><summary>Legg til medarbeider</summary><p>Velg en aktiv appbruker i firmaet og personens nærmeste leder. Du kan legge til medarbeideren nå og velge leder senere.</p>
    <form onSubmit={event=>{event.preventDefault();command('create',{user_id:employeeUser,leader_id:newLeader||null},'Medarbeideren er lagt til.');}}><fieldset disabled={busy}>
     <div className="hr-fields"><UserSelect label="Medarbeider" value={employeeUser} onChange={id=>{setEmployeeUser(id);if(id===newLeader)setNewLeader('');}} members={members} exclude={employees.map(e=>e.user_id)} required/>
     <UserSelect label="Nærmeste leder for ny medarbeider" value={newLeader} onChange={setNewLeader} members={members} exclude={[employeeUser]}/></div><button disabled={!employeeUser}>Legg til i registeret</button>
    </fieldset></form>
   </details>}
   {administer&&memberNext&&<button type="button" className="secondary" disabled={busy} onClick={()=>run(async(session,current)=>{const page=await session.state(memberNext);if(current()){setMembers(previous=>[...previous,...page.members.filter(member=>!previous.some(p=>p.id===member.id))]);setMemberNext(page.next);}})}>Hent flere appbrukere til valgene</button>}
   {employees.length>(audience==='personal'?1:0)&&<Field label="Søk etter medarbeider"><input type="search" value={query} onChange={e=>setQuery(e.target.value)}/></Field>}
   <div className="hr-list">{shown.map(employee=><button type="button" className="hr-employee secondary" key={employee.id} disabled={busy} aria-pressed={detail?.id===employee.id} onClick={()=>open(employee.id)}><span className="hr-personal-avatar" aria-hidden="true"><UserRound/></span><span className="hr-employee-label"><strong>{audience==='personal'&&employee.user_id===userId?'Min medarbeideroppføring':employee.email||'Medarbeider'}</strong><small>{audience==='personal'&&employee.user_id===userId?employee.email:employee.user_id===userId?'Din medarbeidertilgang':audience==='personal'?'Delt med deg · ekstra lesetilgang':employee.leader_id===userId?'Du er nærmeste leder':administer?'Firmaregister':'Ekstra lesetilgang'}</small></span><span className="hr-employee-state">{employee.leader_id?'Leder registrert':'Leder mangler'} {audience==='personal'?<ChevronRight size={18} aria-hidden="true"/>:'→'}</span></button>)}</div>
   {!shown.length&&<div className="hr-empty"><h4>{employees.length?'Ingen treff':'Ingen medarbeidere å vise'}</h4><p>{employees.length?'Prøv et annet søk.':administer?'Start med «Legg til medarbeider». Deretter velger du leder og kontrollerer tilgangen.':'Firmaadmin registrerer medarbeider og nærmeste leder. Oppfølgingene vises her når de er tilgjengelige for deg.'}</p></div>}
   {data.next&&<button type="button" className="secondary" disabled={busy} onClick={()=>run(async(session,current)=>{const page=await list(session,data.next);if(current())setData(previous=>({...previous,employees:[...previous.employees,...page.employees.filter(employee=>!previous.employees.some(p=>p.id===employee.id))],next:page.next}));})}>Hent flere medarbeidere</button>}
  </>}
  {administer&&data&&<details className="hr-card" ref={setupCardRef} tabIndex={-1} open={!data.settings}>
   <summary>Oppsett og kontrollfrist{!data.enabled?' · registeret er avslått':''}</summary>
   <p>Beskriv hvorfor firmaet trenger registeret, hvilket grunnlag dere bruker, og når dere skal kontrollere behov og tilgang igjen. Hold private opplysninger om enkeltansatte utenfor disse feltene.</p>
   <form onSubmit={event=>{event.preventDefault();if(/\[[^\]]+\]/.test(config.legalBasis)){setError('Fyll ut firmaets egen vurdering der forslaget har klammer før du lagrer.');return;}run(async(session,current)=>{await session.configure({revision:data.settings?.revision||0,...config});const result=await load(session);if(current()){install(result);setNotice('HR-oppsettet er lagret.');}publishManagedAccessChange({source:'hr-config',companyId});});}}>
    <fieldset disabled={busy}><div className="hr-fields hr-setup-fields"><div><Field label="Formål med registeret"><textarea required minLength={10} maxLength={500} rows={3} value={config.purpose} onChange={e=>setConfig({...config,purpose:e.target.value})}/></Field>
    <HrTextSuggestion label="formål" text={HR_SETUP_SUGGESTIONS.purpose} value={config.purpose} onUse={value=>setConfig(previous=>({...previous,purpose:value}))}/></div>
    <div><Field label="Firmaets vurderte behandlingsgrunnlag"><textarea required minLength={10} maxLength={500} rows={3} value={config.legalBasis} onChange={e=>setConfig({...config,legalBasis:e.target.value})}/></Field>
    <HrTextSuggestion label="behandlingsgrunnlag" text={HR_SETUP_SUGGESTIONS.legalBasis} value={config.legalBasis} onUse={value=>setConfig(previous=>({...previous,legalBasis:value}))}/></div></div>
    <div className="hr-review"><Field label="Neste kontroll av behov og tilgang"><input type="date" required value={config.reviewOn} onChange={e=>setConfig({...config,reviewOn:e.target.value})}/></Field>
    <div className="hr-review-options"><button type="button" className="secondary" onClick={()=>setConfig(previous=>({...previous,reviewOn:suggestedReviewDate(3)}))}>Om 3 måneder</button><button type="button" className="secondary" onClick={()=>setConfig(previous=>({...previous,reviewOn:suggestedReviewDate(6)}))}>Om 6 måneder</button></div></div>
    <p className="hr-hint">Datoen er firmaets egen kontrollfrist. Tekstforslaget er et utkast; firmaet må vurdere grunnlaget før lagring.</p>
    <label className="hr-check"><input type="checkbox" checked={config.enabled} onChange={e=>setConfig({...config,enabled:e.target.checked})}/>Aktiver medarbeiderregisteret</label>
    <button>Lagre HR-oppsett</button></fieldset>
   </form>
  </details>}
  {administer&&data?.purges&&<details className="hr-card" ref={purgeCardRef} tabIndex={-1}><summary>Slettekvitteringer</summary><p>Tilgangen sperres straks ved avslutning. «Slettet» vises først når registrert innhold og filer er slettet. Ved filfeil prøver systemet igjen.</p>
   {!data.purges.receipts.length&&<p className="hr-hint">Ingen slettekvitteringer ennå. De vises når et arbeidsforhold eller HR-innhold avsluttes og slettes.</p>}
   <ul>{data.purges.receipts.map(receipt=><li key={receipt.id}>{receipt.kind==='employment'?'Avsluttet arbeidsforhold':'Slettet HR-innhold'} · {new Date(receipt.requested_at).toLocaleString('nb-NO',{timeZone:'Europe/Oslo'})} · <strong>{receipt.state==='complete'?'Slettet':'Tilgang sperret · filsletting pågår'}</strong></li>)}</ul>
   {data.purges.next&&<button type="button" className="secondary" disabled={busy} onClick={()=>run(async(session,current)=>{const page=await session.purgeStatus(data.purges.next);if(current())setData(previous=>({...previous,purges:{receipts:[...previous.purges.receipts,...page.receipts.filter(receipt=>!previous.purges.receipts.some(p=>p.id===receipt.id))],next:page.next}}));})}>Hent flere slettekvitteringer</button>}
  </details>}
  {audience==='personal'&&<details className="hr-personal-roadmap"><summary><UserRound size={18} aria-hidden="true"/>Hva kommer her?</summary><p>Medarbeidersamtaler og sykefraværsoppfølging kommer i neste del. Da forbereder du samtalen, og du og leder fullfører sammen. Nærmeste leder starter sykefraværsoppfølging. Du kan ikke lagre referat, fraværsopplysninger eller filer ennå.</p></details>}
  {detail&&<article className="hr-card hr-detail" ref={regionRef} tabIndex={-1} aria-label="Medarbeiderens tilgang"><div className="hr-toolbar"><h3>{detail.email||'Medarbeider'}</h3><button type="button" className="secondary" onClick={()=>{installDetail(null);selectId(null);}}>Lukk medarbeider</button></div>
   <p>{administer?'Kontroller leder og ekstra lesere. Endringen lagres først når du trykker knappen.':'Dette er din tilgjengelige registeroppføring. Firmaadmin styrer leder og ekstra lesetilgang.'}</p>
   <PrivateContact key={detail.id+':'+detail.revision} context={context} employee={detail}/>
   {!administer&&<p>{detail.leader_id?'Nærmeste leder er registrert.':'Nærmeste leder er ikke registrert. Kontakt firmaadmin.'}</p>}
   {administer&&<><form onSubmit={event=>{event.preventDefault();command('leader',{id:detail.id,revision:detail.revision,leader_id:leader||null,clear_old_leader_reader:clearOld},'Nærmeste leder er oppdatert.');}}><fieldset disabled={busy}>
    <UserSelect label="Nærmeste leder" value={leader} onChange={id=>{setLeader(id);setClearOld(false);}} members={selectedLeaderMissing?[{id:leader,email:'Nåværende leder – hent flere brukere for å kontrollere'},...members]:members} exclude={[detail.user_id]}/>
    <p>Ny leder får den registrerte ledertilgangen. Tidligere leder mister den.</p>
    {oldHasReader&&leader!==detail.leader_id&&<label className="hr-check"><input type="checkbox" checked={clearOld} onChange={e=>setClearOld(e.target.checked)}/>Fjern også tidligere leders særskilte lesetilgang til denne medarbeideren.</label>}
    <button disabled={leader===(detail.leader_id||'')||(oldHasReader&&leader!==detail.leader_id&&!clearOld)}>Lagre nærmeste leder</button>
   </fieldset></form>
   <h4>Ekstra lesetilgang</h4><p>Medarbeideren selv, nærmeste leder og firmaadmin har ordinær tilgang. En ekstra leser får bare lese denne medarbeiderens opplysninger. KS/HMS-rolle eller systemadmin gir ingen egen HR-rett.</p>
   <ul className="hr-grants">{detail.readers.map(grant=><li key={grant.user_id}><strong>{labelFor(grant.user_id)}</strong><p>{grant.reason}</p><small>Gitt av {labelFor(grant.granted_by)} · {new Date(grant.granted_at).toLocaleString('nb-NO',{timeZone:'Europe/Oslo'})}</small><button type="button" className="secondary" disabled={busy} onClick={()=>command('revoke_reader',{id:detail.id,revision:detail.revision,reader_id:grant.user_id},'Den særskilte lesetilgangen er fjernet.')}>Trekk tilbake lesetilgang</button>{(grant.user_id===detail.leader_id||grant.user_id===userId)&&<small>Ordinær leder-/firmaadminrett påvirkes ikke av dette valget.</small>}</li>)}</ul>
   <form onSubmit={event=>{event.preventDefault();command('reader',{id:detail.id,revision:detail.revision,reader_id:reader,reason},'Ekstra lesetilgang er lagret.');}}><fieldset disabled={busy}>
    <UserSelect label="Ekstra leser" value={reader} onChange={setReader} members={members} exclude={[detail.user_id]} required/>
    <Field label="Begrunnelse for ekstra lesetilgang"><input required minLength={10} maxLength={200} value={reason} onChange={e=>setReason(e.target.value)}/></Field><button disabled={!reader||reason.trim().length<10}>Gi lesetilgang</button>
   </fieldset></form>
   <details className="hr-ending" open={ending} onToggle={event=>setEnding(event.currentTarget.open)}><summary>Avslutt arbeidsforhold i HR</summary><p>Dette fjerner medarbeideren fra HR-registeret og sperrer personens HR-tilgang i firmaet. Leder- og lesertildelinger for personen fjernes også hos andre medarbeidere. Register, ekstra lesere og HR-innhold slettes. Filer slettes i en egen kø. Slettekvitteringen viser når alt er slettet. Et minimalt slettebevis beholdes. Ordinær ProffDok-konto avsluttes ikke.</p><p>Valget kan ikke angres her. Gjenansettelse krever en egen avklaring med firmaadmin.</p>
    <label className="hr-check"><input type="checkbox" checked={endConfirmed} disabled={busy} onChange={e=>setEndConfirmed(e.target.checked)}/>Jeg bekrefter at arbeidsforholdet er avsluttet og at HR-registeroppføringen skal slettes.</label>
    <button type="button" className="hr-danger" disabled={busy||!endConfirmed} onClick={()=>command('end',{id:detail.id,revision:detail.revision,confirm:'END_AND_DELETE'},'Arbeidsforholdet er avsluttet i HR. Registeroppføring og tildelinger er slettet.')}>Avslutt og slett HR-registeroppføring</button>
   </details></>}
  </article>}
 </section>;
}
