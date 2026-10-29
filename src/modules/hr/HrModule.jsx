import {isRpcConflict} from '../app/rpcErrors.mjs';
import {hrEmployeeLabel} from './hrEmployeeLabel.mjs';
import React,{useCallback,useEffect,useRef,useState} from 'react';
import {createHrFoundationSession,hrClosureMessage} from './hrFoundation.mjs';
import {hrRpc} from './hrAccess.js';
import {MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT,publishManagedAccessChange} from '../access/moduleAccessClient.js';
import {WORK_PROFILE_EVENT} from '../access/workProfileClient.js';
import './hr.css';
import './hrWorkspace036.css';
import ModuleHeading from '../ui/ModuleHeading.jsx';
import DeviationDialog from '../deviations/DeviationDialog.jsx';
import {UserRound,ShieldCheck,ChevronRight,UsersRound,Settings,FileCheck2,Info,ArrowRight,HeartPulse,BookOpen} from 'lucide-react';
import HrTextSuggestion from './HrTextSuggestion.jsx';
import PrivateContact from './PrivateContact.jsx';
import {HR_SETUP_SUGGESTIONS,suggestedReviewDate} from './hrSetupSuggestions.mjs';
import HrConversationTemplates from './HrConversationTemplates.jsx';
import HrSickLeaveSetup from './HrSickLeaveSetup.jsx';
import HrPracticeConversation from './HrPracticeConversation.jsx';
import HrConversations from './HrConversations.jsx';
import HrSickLeaveCases from './HrSickLeaveCases.jsx';
import HrFollowupTasks from './HrFollowupTasks.jsx';
import {practiceAvailable} from './hrPracticeConversation.mjs';
import {createModuleNavigationMemory} from '../ui/moduleNavigationMemory.mjs';
import {HrTimeEntry} from '../time/TimeEntryPoint.jsx';

const emptyConfig={purpose:'',legalBasis:'',reviewOn:'',enabled:false};
const selectionMemory=createModuleNavigationMemory(id=>typeof id==='string'&&id.length>0&&id.length<=80);
function Field({label,children}) {
 const generatedId=React.useId(),inputId=children.props.id||generatedId,labelId=generatedId+'-label';
 return <label className="hr-field" htmlFor={inputId}><span id={labelId}>{label}</span>{React.cloneElement(children,{id:inputId,'aria-labelledby':children.props['aria-labelledby']||labelId})}</label>;
}
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
 const followupRef=useRef(null),toolsRef=useRef(null),addEmployeeRef=useRef(null),employeeTriggerRef=useRef(null);
 const registerRef=useRef(null),setupCardRef=useRef(null),purgeCardRef=useRef(null),templatesRef=useRef(null),sickLeaveRef=useRef(null),templateToken=useRef(0);
 const [templateRequest,setTemplateRequest]=useState(null);
 const goTo=target=>{const element=target.current;if(!element)return;if(element.tagName==='DETAILS')element.open=true;element.focus();element.scrollIntoView({block:'start'});};
 const sessionRef=useRef(null),revision=useRef(0),busyRef=useRef(false),detailRef=useRef(null);
 // This ref holds only the chosen record ID. Every return performs a new scoped list + double read.
 const navigationScope=JSON.stringify([companyId,userId,audience]);
 const focusScope=useRef(navigationScope);focusScope.current=navigationScope;
 // Min side owns its explicit selection; management has only a bounded ID pointer.
 const selectedId=useRef(onEmployeeSelect?initialEmployeeId:initialEmployeeId||selectionMemory.read(navigationScope)),selectionScope=useRef(companyId+':'+userId),selectionCallback=useRef(onEmployeeSelect);selectionCallback.current=onEmployeeSelect;
 if(selectionScope.current!==companyId+':'+userId){selectionScope.current=companyId+':'+userId;selectedId.current=null;}
 const selectId=id=>{selectedId.current=id;if(id)selectionMemory.remember(navigationScope,id);else selectionMemory.forget(navigationScope);selectionCallback.current?.(id);};
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
   catch(e){if(alive&&ticket===revision.current){if(e.code==='42501')selectId(null);setError(e.code==='42501'?'HR-tilgangen er endret. Kontroller aktivt firma eller kontakt firmaadmin.':e.message);}}
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
  catch(e){if(current())setError(isRpcConflict(e)?'En annen bruker har endret registeret. Trykk «Oppdater registeret» og se over endringen.':e.message);}
  finally{if(current()){setBusy(false);busyRef.current=false;}}
 };
 const open=(id,trigger=document.activeElement)=>{employeeTriggerRef.current={node:trigger,scope:navigationScope,id};return run(async(session,current)=>{installDetail(null);const result=await session.get(id);if(current()){installDetail(result.employee);selectId(result.employee.id);}});};
 const returnEmployeeFocus=()=>{const target=employeeTriggerRef.current;if(!target||target.scope!==focusScope.current)return null;if(target.node?.isConnected)return target.node;return Array.from(document.querySelectorAll('[data-hr-employee-id]')).find(node=>node.dataset.hrEmployeeId===target.id&&node.closest('[data-hr-workspace-scope]')?.dataset.hrWorkspaceScope===target.scope)||null;};
 const closeEmployee=()=>{if(busyRef.current)return;installDetail(null);selectId(null);};
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
 const employees=data?.employees||[],shown=employees.filter(employee=>(hrEmployeeLabel(employee)+' '+(employee.email||'')).toLocaleLowerCase('nb-NO').includes(query.trim().toLocaleLowerCase('nb-NO')));
 const oldHasReader=Boolean(detail?.leader_id&&detail.readers?.some(grant=>grant.user_id===detail.leader_id));
 const selectedLeaderMissing=Boolean(leader&&!members.some(member=>member.id===leader));
 const AccessContainer=audience==='personal'?React.Fragment:'details';
 const moreMembersButton=administer&&memberNext&&<button type="button" className="secondary" disabled={busy} onClick={()=>run(async(session,current)=>{const page=await session.state(memberNext);if(current()){setMembers(previous=>[...previous,...page.members.filter(member=>!previous.some(p=>p.id===member.id))]);setMemberNext(page.next);}})}>Hent flere appbrukere til valgene</button>;
 return <section className={audience==='personal'?'hr-module hr-personal':'hr-module hr-workspace-036'} aria-label={audience==='personal'?'Mine oppfølginger':'HR'} data-hr-workspace-scope={audience!=='personal'?navigationScope:undefined}>
  {audience==='personal'&&practiceAvailable(context,import.meta.env.VITE_EXPO_BACKEND_TARGET)&&<HrPracticeConversation key={'practice:'+companyId+':'+userId} context={context}/>}
  {audience!=='personal'&&<ModuleHeading className="hr-heading" companyName={context.company_name} title="Medarbeidere" description={administer?'Medarbeidere, nærmeste leder og trygg tilgang.':audience==='management'?'Medarbeiderne du følger opp som nærmeste leder.':'Dine tilgjengelige oppføringer og oppfølginger.'} role={administer?'Firmaadmin':audience==='management'?'Nærmeste leder':'Personlig tilgang'} icon={UsersRound}/>}
  {audience==='personal'&&<div className="hr-personal-intro"><ShieldCheck aria-hidden="true"/><div><strong>Din oppføring. Din tilgang.</strong><p>Åpne raden nedenfor for å se egen medarbeideroppføring eller en oppføring som er delt med deg. Kontakt firmaadmin hvis leder eller tilgang er feil. Medarbeidersamtaler og sykefraværsoppfølging ligger inne i medarbeidervinduet.</p></div></div>}
  {audience!=='personal'&&<nav className="hr-workspace-036-actions" aria-label="Arbeid med HR"><button type="button" className="secondary" onClick={()=>goTo(registerRef)}>Medarbeidere</button><button type="button" className="secondary" onClick={()=>goTo(followupRef)}>Avtalte tiltak</button>{administer&&data?.enabled&&<button type="button" onClick={()=>goTo(addEmployeeRef)}>Legg til medarbeider</button>}<button type="button" className="secondary" onClick={()=>goTo(toolsRef)}>Alle HR-funksjoner</button></nav>}
  <div className={audience!=='personal'?'hr-workspace-036-main':undefined}>
   <div className={audience!=='personal'?'hr-register-036':undefined}>
  <div className="hr-toolbar hr-register-target" ref={registerRef} tabIndex={-1}><h3>{administer?'Medarbeiderregister':audience==='personal'?'Dine oppføringer':'Mine oppfølginger'}</h3><button type="button" className="secondary" disabled={busy} onClick={refresh}>Oppdater registeret</button></div>
  {!detail&&error&&<p className="hr-error" role="alert">{error}</p>}{!detail&&notice&&<p className="hr-notice" role="status">{notice}</p>}
  {busy&&<p role="status">Kontrollerer tilgang og register …</p>}
  {audience!=='personal'&&data&&!data.enabled&&<div className="hr-empty"><h4>Registeret er ikke aktivert</h4><p>{administer?'Åpne oppsettet for å kontrollere formål, grunnlag og tilgang før registeret tas i bruk.':'Firmaadmin aktiverer registeret og avklarer tilgang før medarbeiderne kan følges opp her.'}</p>{administer&&<button type="button" className="secondary" onClick={()=>goTo(setupCardRef)}>Åpne oppsett</button>}</div>}
  {data?.enabled&&<>
   {administer&&<details className="hr-card" ref={addEmployeeRef} tabIndex={-1}><summary>Legg til medarbeider</summary><p className="hr-hint">Registeret er listen over medarbeidere som skal følges opp i HR. Inviterte brukere med HR valgt legges inn automatisk når de blir aktive. Andre kan legges inn med Legg til medarbeider. Personen må først være en aktiv appbruker i dette firmaet. Åpne en medarbeiderrad for å kontrollere leder og lesetilgang.</p><p>Velg en aktiv appbruker i firmaet og personens nærmeste leder. Du kan legge til medarbeideren nå og velge leder senere.</p><p className="hr-hint">Trykk Legg til i registeret for å lagre. Dette oppretter en HR-oppføring for en eksisterende bruker; det oppretter ingen ny appkonto og sender ingen invitasjon. Mangler personen i valget, kontroller brukeren under Firma → Brukere og tilganger.</p>
    <form onSubmit={event=>{event.preventDefault();command('create',{user_id:employeeUser,leader_id:newLeader||null},'Medarbeideren er lagt til.');}}><fieldset disabled={busy}>
     <div className="hr-fields"><UserSelect label="Medarbeider" value={employeeUser} onChange={id=>{setEmployeeUser(id);if(id===newLeader)setNewLeader('');}} members={members} exclude={employees.map(e=>e.user_id)} required/>
     <UserSelect label="Nærmeste leder for ny medarbeider" value={newLeader} onChange={setNewLeader} members={members} exclude={[employeeUser]}/></div><button disabled={!employeeUser}>Legg til i registeret</button>
    </fieldset></form>
   </details>}
   {!detail&&moreMembersButton}
   {employees.length>(audience==='personal'?1:0)&&<Field label="Søk etter medarbeider"><input type="search" value={query} onChange={e=>setQuery(e.target.value)}/></Field>}
   {audience!=='personal'&&shown.length>0&&<div className="hr-register-columns" aria-hidden="true"><span>Medarbeider</span><span>Din HR-tilgang</span><span>Leder</span></div>}
   <div className="hr-list">{shown.map(employee=><button type="button" className="hr-employee secondary" key={employee.id} disabled={busy} aria-pressed={detail?.id===employee.id} data-hr-employee-id={audience!=='personal'?employee.id:undefined} onClick={event=>open(employee.id,event.currentTarget)}><span className="hr-personal-avatar" aria-hidden="true"><UserRound/></span><span className="hr-employee-label"><strong>{audience==='personal'&&employee.user_id===userId?'Min medarbeideroppføring':hrEmployeeLabel(employee)}</strong><small>{audience!=='personal'?employee.email:<>{employee.full_name&&employee.email?employee.email+' · ':''}{audience==='personal'&&employee.user_id===userId?employee.email:employee.user_id===userId?'Din medarbeidertilgang':'Delt med deg · ekstra lesetilgang'}</>}</small></span>{audience!=='personal'&&<span className="hr-employee-relation"><span className="hr-036-sr-only">Din HR-tilgang: </span>{employee.user_id===userId?'Din oppføring':employee.leader_id===userId?'Nærmeste leder':administer?'Firmaadmin':'Ekstra lesetilgang'}</span>}<span className="hr-employee-state">{employee.leader_id?'Leder registrert':'Leder mangler'} {audience==='personal'?<ChevronRight size={18} aria-hidden="true"/>:'→'}</span></button>)}</div>
   {!shown.length&&<div className="hr-empty"><h4>{employees.length?'Ingen treff':'Ingen medarbeidere å vise'}</h4><p>{employees.length?'Prøv et annet søk.':administer?'Start med «Legg til medarbeider». Deretter velger du leder og kontrollerer tilgangen.':'Firmaadmin registrerer medarbeider og nærmeste leder. Oppfølgingene vises her når de er tilgjengelige for deg.'}</p></div>}
   {data.next&&<button type="button" className="secondary" disabled={busy} onClick={()=>run(async(session,current)=>{const page=await list(session,data.next);if(current())setData(previous=>({...previous,employees:[...previous.employees,...page.employees.filter(employee=>!previous.employees.some(p=>p.id===employee.id))],next:page.next}));})}>Hent flere medarbeidere</button>}
  </>}
   </div>
   {audience!=='personal'&&<aside className="hr-followup-036" ref={followupRef} tabIndex={-1} aria-label="Samtaler og avtalte tiltak"><div className="hr-followup-036-intro"><span className="hr-workspace-eyebrow">Samtaler og oppfølging</span><h3>Følg opp det dere avtalte</h3><p>Åpne medarbeideren for forberedelse, samtale og referat. Avtal ansvar og frist sammen.</p><button type="button" className="secondary" onClick={()=>goTo(registerRef)}>Se medarbeidere <ArrowRight size={17} aria-hidden="true"/></button></div>
  {data?.enabled&&<HrFollowupTasks key={'followup-tasks:'+companyId+':'+userId} context={context} onOpen={open} onSetup={administer?()=>goTo(setupCardRef):null}/>}</aside>}
  </div>
  {audience!=='personal'&&<><p className="hr-coming"><HeartPulse size={16} aria-hidden="true"/>Åpne medarbeideren for kontaktopplysninger og medarbeidersamtaler.</p><details className="module-guide"><summary><Info aria-hidden="true"/>Slik bruker du HR</summary><div className="hr-intro"><strong>Riktig leder. Riktig tilgang.</strong><p>{administer?'Registrer medarbeidere og velg nærmeste leder. Se over hvem som får lese før dere begynner med oppfølging.':audience==='management'?'Her ser du medarbeiderne du er registrert som nærmeste leder for. Egne oppfølginger ligger på Min side.':'Her ser du egen registeroppføring og medarbeidere du har fått uttrykkelig lesetilgang til.'}</p><p>Åpne medarbeideren for kontaktopplysninger og medarbeidersamtaler. Nærmeste leder starter samtalen. Medarbeideren forbereder seg på Min side. Begge bekrefter referatet selv. Sykefraværsoppfølging ligger også inne i medarbeidervinduet. Private filvedlegg åpnes senere.</p></div></details></>}
  {audience!=='personal'&&data&&<details className="hr-step-guide" open={!data.enabled} aria-label="Kom i gang med HR"><summary className="ux-readable-summary">Start her · oppsett og veiledning</summary>
   {administer?<><p>Her klargjør du medarbeiderregisteret og spørsmålene til medarbeidersamtaler.</p><ol>
    <li><strong>1. Kontroller oppsettet</strong><span>{data.enabled?'Registeret er aktivt. Bruk Åpne oppsett hvis formål, kontrollfrist eller aktivering skal endres.':'Trykk Åpne oppsett. Se over tekstfeltene, velg kontrollfrist, huk av Aktiver medarbeiderregisteret og trykk Lagre HR-oppsett.'}</span></li>
    <li><strong>2. Registrer medarbeider og leder</strong><span>Åpne Legg til medarbeider og trykk Legg til i registeret. Finn deretter medarbeideren i listen og åpne raden for å kontrollere leder og lesetilgang.</span></li>
    <li><strong>3. Klargjør oppfølgingen</strong><span>Trykk Åpne samtalemaler for å tilpasse og lagre spørsmål. Åpne sykefravær viser rutiner, tilrettelegging og frister. Nærmeste leder starter den personlige oppfølgingen i medarbeidervinduet.</span></li>
   </ol><p className="hr-hint">En mal er bare spørsmålene. Å lagre en mal starter ingen samtale og sender ingenting til ansatte. Nærmeste leder starter en medarbeidersamtale inne i medarbeidervinduet. Nærmeste leder kan også starte sykefraværsoppfølging her. Vedlegg kommer senere.</p></>:<><p>{audience==='management'?'Trykk Se medarbeidere og åpne en rad. Kontroller at personens nærmeste leder er registrert. Firmaadmin retter leder og lesetilgang.':'Trykk Se medarbeidere og åpne egen oppføring eller en oppføring som er delt med deg. Firmaadmin retter leder og lesetilgang.'}</p><p className="hr-hint">Du kan se tilgjengelige registeroppføringer nå. Egne oppfølginger ligger på Min side. Nærmeste leder starter en medarbeidersamtale inne i medarbeidervinduet. Nærmeste leder kan også starte sykefraværsoppfølging her. Vedlegg kommer senere.</p></>}
  </details>}
  {audience!=='personal'&&data&&<details className="hr-tools-disclosure" ref={toolsRef} tabIndex={-1} open={!data.enabled}><summary>Verktøy og oppsett</summary><nav className="hr-workspace-cards" aria-label="HR snarveier">
   {data.enabled&&<HrTimeEntry context={context}/>}
   <article className="hr-workspace-card"><span className="hr-workspace-icon"><UsersRound aria-hidden="true"/></span><h3>{administer?'Medarbeiderregister':audience==='management'?'Dine medarbeidere':'Dine oppføringer'}</h3><p>{administer?'Finn medarbeideren og kontroller leder og lesetilgang.':audience==='management'?'Åpne en medarbeider du er registrert som nærmeste leder for.':'Se egen oppføring og medarbeidere du har fått lesetilgang til.'}</p><button type="button" className="secondary" onClick={()=>goTo(registerRef)}>Se medarbeidere <ArrowRight aria-hidden="true"/></button></article>
   {administer&&<article className="hr-workspace-card hr-workspace-templates"><span className="hr-workspace-icon"><BookOpen aria-hidden="true"/></span><h3>Samtalemaler</h3><p>{data.enabled?'Velg et forslag, tilpass spørsmålene og lagre firmaets mal.':'Aktiver medarbeiderregisteret under Oppsett og kontrollfrist først.'}</p><button type="button" className="secondary" disabled={!data.enabled} onClick={()=>goTo(templatesRef)}>Åpne samtalemaler <ArrowRight aria-hidden="true"/></button></article>}
   <article className="hr-workspace-card hr-workspace-sick"><span className="hr-workspace-icon"><HeartPulse aria-hidden="true"/></span><h3>Sykefravær</h3><p>Klargjør oppfølgingen og se hva som skal gjøres underveis.</p><button type="button" className="secondary" onClick={()=>goTo(sickLeaveRef)}>Åpne sykefravær <ArrowRight aria-hidden="true"/></button></article>
   {administer&&<><article className="hr-workspace-card hr-workspace-setup"><span className="hr-workspace-icon"><Settings aria-hidden="true"/></span><h3>Oppsett og kontrollfrist</h3><p>Se over firmaets formål, grunnlag og neste kontroll av tilgangen.</p><button type="button" className="secondary" onClick={()=>goTo(setupCardRef)}>Åpne oppsett <ArrowRight aria-hidden="true"/></button></article>
   <article className="hr-workspace-card hr-workspace-purge"><span className="hr-workspace-icon"><FileCheck2 aria-hidden="true"/></span><h3>Slettekvitteringer</h3><p>Kontroller om en avslutning er ferdig slettet eller om filsletting pågår.</p><button type="button" className="secondary" onClick={()=>goTo(purgeCardRef)}>Se slettekvitteringer <ArrowRight aria-hidden="true"/></button></article></>}
  </nav></details>}
  {audience!=='personal'&&practiceAvailable(context,import.meta.env.VITE_EXPO_BACKEND_TARGET)&&<HrPracticeConversation key={'practice:'+companyId+':'+userId} context={context}/>}
  {administer&&data?.enabled&&<HrConversationTemplates key={companyId+':'+userId} context={context} targetRef={templatesRef} startRequest={templateRequest?.scope===companyId+':'+userId?templateRequest:null} onStartHandled={()=>setTemplateRequest(null)}/>}
  {audience!=='personal'&&data&&<HrSickLeaveSetup key={'sick:'+companyId+':'+userId} targetRef={sickLeaveRef} administer={administer} enabled={data.enabled} onRegister={()=>goTo(registerRef)} onTemplates={()=>{setTemplateRequest({scope:companyId+':'+userId,token:++templateToken.current,kind:'sickleave'});goTo(templatesRef);}}/>}
  {administer&&data&&<details className="hr-card" ref={setupCardRef} tabIndex={-1} open={!data.settings}>
   <summary>Oppsett og kontrollfrist{!data.enabled?' · registeret er avslått':''}</summary>
   <p>Beskriv hvorfor firmaet trenger registeret, hvilket grunnlag dere bruker, og når dere skal kontrollere behov og tilgang igjen. Hold private opplysninger om enkeltansatte utenfor disse feltene.</p><p className="hr-hint"><strong>Formål</strong> er hva dere skal bruke registeret til. <strong>Behandlingsgrunnlag</strong> er firmaets egen vurdering av grunnlaget for å bruke personopplysningene. Åpne tekstforslagene ved behov, tilpass dem og fyll ut tekst i klammer. Velg dato for neste gjennomgang, se over aktiveringen og trykk Lagre HR-oppsett.</p>
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
  {audience==='personal'&&<details className="hr-personal-roadmap"><summary><UserRound size={18} aria-hidden="true"/>Slik følger du opp</summary><p>Åpne egen medarbeideroppføring og en lagret medarbeidersamtale. Skriv forberedelsen og trykk Lagre samtale. Klar til samtale deler svarene med leder. Du og leder går gjennom referatet og bekrefter hver for dere. Ved sykefravær åpner du den lagrede oppfølgingen samme sted. Forberedelse, plan og frister vises i egne steg. Vedlegg kommer senere.</p></details>}
  {audience==='personal'&&data?.enabled&&<HrFollowupTasks key={'followup-tasks:'+companyId+':'+userId} context={context} onOpen={open} onSetup={administer?()=>goTo(setupCardRef):null}/>}
  {detail&&<DeviationDialog title={hrEmployeeLabel(detail)} context={'HR · '+(context.company_name||'Medarbeiderregister')} closeLabel="Lukk medarbeidervindu" busy={busy} onClose={closeEmployee} returnFocusTarget={audience!=='personal'?returnEmployeeFocus:undefined}><div className={audience==='personal'?'hr-module hr-employee-dialog':'hr-module hr-employee-dialog hr-employee-dialog-036'}><article className="hr-detail" aria-label="Medarbeiderens tilgang"><div className="hr-toolbar"><h3>{audience==='personal'?'Leder og tilgang':'Medarbeider og oppfølging'}</h3><button type="button" className="secondary" disabled={busy} onClick={closeEmployee}>Lukk medarbeider</button></div>
   {error&&<p role="alert" className="hr-error">{error}</p>}{notice&&<p role="status" className="hr-notice">{notice}</p>}
   <PrivateContact key={detail.id+':'+detail.revision} context={context} employee={detail}/>
   <HrConversations key={'conversations:'+detail.id+':'+detail.revision} context={context} employee={detail}/>
   <HrSickLeaveCases key={'sick-cases:'+detail.id+':'+detail.revision} context={context} employee={detail}/>
   <AccessContainer {...(audience!=='personal'?{className:'hr-access-036'}:{})}>{audience!=='personal'&&<summary>Leder og tilgang</summary>}
   <p>{administer?'Kontroller leder og ekstra lesere. Endringen lagres først når du trykker knappen.':'Dette er din tilgjengelige registeroppføring. Firmaadmin styrer leder og ekstra lesetilgang.'}</p>
   {moreMembersButton}
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
   <details className="hr-ending" open={ending} onToggle={event=>setEnding(event.currentTarget.open)}><summary>Avslutt arbeidsforhold i HR</summary><p>Dette fjerner medarbeideren fra HR-registeret og sperrer personens HR-tilgang i firmaet. Leder- og lesertildelinger for personen fjernes også hos andre medarbeidere. Register, ekstra lesere og HR-innhold slettes. Filer slettes i en egen kø. Slettekvitteringen viser når alt er slettet. Et minimalt slettebevis beholdes, og systemadmin får et slettevarsel. Ordinær ProffDok-konto avsluttes ikke.</p><p>Valget kan ikke angres her. Gjenansettelse krever en egen avklaring med firmaadmin.</p>
    <label className="hr-check"><input type="checkbox" checked={endConfirmed} disabled={busy} onChange={e=>setEndConfirmed(e.target.checked)}/>Jeg bekrefter at arbeidsforholdet er avsluttet og at HR-registeroppføringen skal slettes.</label>
    <button type="button" className="hr-danger" disabled={busy||!endConfirmed} onClick={()=>command('end',{id:detail.id,revision:detail.revision,confirm:'END_AND_DELETE'},'Arbeidsforholdet er avsluttet i HR. Registeroppføring og tildelinger er slettet.')}>Avslutt og slett HR-registeroppføring</button>
   </details></>}
   </AccessContainer>
  </article></div></DeviationDialog>}
 </section>;
}
