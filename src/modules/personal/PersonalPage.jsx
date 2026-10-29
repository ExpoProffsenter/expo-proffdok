import React,{Suspense,useState} from 'react';
import {BookOpen,UserRound,MessageSquare,HeartPulse,Settings,ArrowRight,LayoutDashboard,ShieldCheck,FileClock,CalendarDays} from 'lucide-react';
import {personalRights} from './personalAccess.js';
import AccountContact from './AccountContact.jsx';
import PrivateContact from '../hr/PrivateContact.jsx';
import HomeFollowups from '../home/HomeFollowups.jsx';
import './personal.css';
import './personalWorkspace036.css';
import SupportSummary from '../support/SupportSummary.jsx';
import {PersonalTimeCard} from '../time/TimeEntryPoint.jsx';
const BoligMyTasks=React.lazy(()=>import('../bolig/BoligMyTasks.jsx'));
const BoligPresenceCard=React.lazy(()=>import('../bolig/BoligPresenceCard.jsx'));
const KshmsMyProgressPlans=React.lazy(()=>import('../kshms/KshmsMyProgressPlans.jsx'));
const PersonalTimeWorkspace=React.lazy(()=>import('../time/TimeEntryPoint.jsx'));
const KshmsModule=React.lazy(()=>import('../kshms/KshmsModule.jsx'));
const HrModule=React.lazy(()=>import('../hr/HrModule.jsx'));
const sections={overview:'I dag',plans:'Mine planer',handbook:'Personalhåndbok',time:'Mine timer',hr:'Mine oppfølginger',profile:'Profil og e-post'};
const sectionIcons={overview:LayoutDashboard,plans:CalendarDays,handbook:BookOpen,time:FileClock,hr:UserRound,profile:Settings};
export default function PersonalPage({context,kshmsContext,hrContext,userId,authUser,supabaseClient,onOpenHrSetup,onOpenSupport,children}){
 const rights=personalRights(context,kshmsContext,hrContext,userId);
 // Remember only navigation, never an access context or HR payload. Fresh rights still gate every module.
 const [navigation,setNavigation]=useState(null),[selection,setSelection]=useState({scope:null,screen:'overview',employeeId:null});
 const [planDisclosure,setPlanDisclosure]=useState({scope:null,open:false});
 const scope=userId&&context?.user_id===userId&&context.company_id?userId+':'+context.company_id:null;
 const previous=navigation?.userId===userId?navigation:null;
 const nav=scope?{scope,userId,enabled:rights.enabled,kshms:rights.kshms||Boolean(!kshmsContext&&previous?.scope===scope&&previous.kshms&&context.company_kshms),hr:rights.hr||Boolean(!hrContext&&previous?.scope===scope&&previous.hr&&context.company_hr)}:context===null&&userId&&authUser?.id===userId?previous:null;
 if(JSON.stringify(nav)!==JSON.stringify(navigation))setNavigation(nav);
 if(selection.scope!==nav?.scope&&selection.scope!==null)setSelection({scope:nav?.scope||null,screen:'overview',employeeId:null});
 const visible=['overview','plans',...(nav?.hr?['time']:[]),...(nav?.kshms?['handbook']:[]),...(nav?.hr?['hr']:[]),'profile'];
 const selected=selection.scope===nav?.scope?selection.screen:'overview';
 const screen=!nav?.enabled?'profile':visible.includes(selected)?selected:'overview';
 const choose=id=>setSelection({scope:nav?.scope,screen:id,employeeId:null});
 const pending=Boolean(nav?.enabled&&(!rights.enabled||(screen==='handbook'&&!rights.kshms)||(['hr','time'].includes(screen)&&!rights.hr)));
 const fullName=String(authUser?.user_metadata?.full_name||authUser?.user_metadata?.name||'').trim();
 const firstName=fullName.split(/\s+/)[0];
 const plansOpen=planDisclosure.scope===scope&&planDisclosure.screen===screen?planDisclosure.open:screen==='plans';
 return <section className={nav?.enabled?'personal-page personal-workspace036':undefined} aria-label={nav?.enabled?'Min side':'Min profil / e-postvalg'} aria-busy={pending}>
  {nav?.enabled&&<header className="personal-heading"><div><span className="personal-eyebrow">MIN SIDE</span><h2>Din arbeidsdag</h2><p>{firstName?'Hei, '+firstName+'. ':''}Dine planer, oppgaver og oppfølginger – samlet på ett sted.</p></div><div className="personal-avatar" aria-hidden="true">{fullName?fullName.split(/\s+/).slice(0,2).map(part=>part[0]).join('').toLocaleUpperCase('nb-NO'):<UserRound/>}</div></header>}
  {userId&&authUser?.id===userId&&context?.user_id===userId&&context?.company_id&&<Suspense fallback={null}><BoligPresenceCard key={'presence:'+scope} context={context}/></Suspense>}
  {nav?.enabled&&<nav className="personal-tabs" aria-label="Min side visning">{visible.map(id=>{const Icon=sectionIcons[id];return <button key={id} type="button" className={screen===id?'active':'secondary'} aria-pressed={screen===id} disabled={pending} onClick={()=>choose(id)}><Icon size={18} aria-hidden="true"/>{sections[id]}</button>;})}</nav>}
  {pending&&<div className="personal-checking" role="status"><ShieldCheck aria-hidden="true"/><div><strong>Kontrollerer tilgangen din …</strong><p>Du kommer tilbake til samme visning når kontrollen er ferdig.</p></div></div>}
  <div className="personal-workday" data-personal-view={screen} hidden={!['overview','plans'].includes(screen)||pending}>
   <div className="personal-cards personal-day-grid">
    <div className="personal-day-main">
     {['overview','plans'].includes(screen)&&!pending&&rights.enabled&&<details className="personal-card personal-plans-card" aria-label="Mine aktive planer" open={plansOpen} onToggle={event=>setPlanDisclosure({scope,screen,open:event.currentTarget.open})}>
      <summary className="personal-plans-heading"><div className="personal-card-icon"><CalendarDays aria-hidden="true"/></div><div><span className="personal-card-eyebrow">DITT PLANLAGTE ARBEID</span><h3>Mine aktive planer</h3><span className="personal-plans-disclosure">{plansOpen?'Skjul planlistene':'Vis planlistene'}</span></div></summary>
      <p>Åpne en plan for å se dine uferdige oppgaver og datoene som er registrert. Datoene følger norsk tid.</p>
      <div className="personal-plan-sources">
       <Suspense fallback={<p role="status">Henter prosjektplaner …</p>}><KshmsMyProgressPlans key={'project:'+scope} source="project" context={context} grouped/></Suspense>
       {rights.kshms&&<Suspense fallback={<p role="status">Henter andre fremdriftsplaner …</p>}><KshmsMyProgressPlans key={scope} context={kshmsContext} grouped/></Suspense>}
      </div>
     </details>}
     {screen==='overview'&&!pending&&rights.enabled&&<section className="personal-daily-tasks" aria-label="Dine boligoppgaver"><div className="personal-section-heading"><h3>Dine boligoppgaver</h3><span>Tildelt deg</span></div><p>Har du åpne oppgaver i boligprosjekter, finner du dem her. Åpne oppgaven for å fortsette i arbeidsflaten.</p><Suspense fallback={<p role="status">Henter boligoppgavene …</p>}><BoligMyTasks key={'tasks:'+scope} context={context}/></Suspense></section>}
    </div>
    <aside className="personal-day-side" aria-label="Timer og personlig oppfølging" hidden={screen!=='overview'}>
     <div className="personal-notices" hidden={screen!=='overview'||pending}><HomeFollowups key={nav?.scope||'personal'} hrContext={rights.hr?hrContext:null} userId={userId} onSetup={onOpenHrSetup}/></div>
     {screen==='overview'&&!pending&&rights.hr&&<article className="personal-card personal-card-hr"><div className="personal-section-heading"><h3>Mine oppfølginger</h3><UserRound aria-hidden="true"/></div>
      <div className="personal-upcoming"><MessageSquare aria-hidden="true"/><div><strong>Medarbeidersamtale <span className="personal-status">Tilgjengelig</span></strong><p>Forbered samtalen og se det som er delt med deg.</p></div></div>
      <div className="personal-upcoming"><HeartPulse aria-hidden="true"/><div><strong>Sykefraværsoppfølging <span className="personal-status">Tilgjengelig</span></strong><p>Se egne oppfølginger når nærmeste leder har åpnet saken.</p></div></div>
      <button type="button" className="secondary" onClick={()=>choose('hr')}>Se mine oppfølginger <ArrowRight aria-hidden="true"/></button>
     </article>}
     {screen==='overview'&&!pending&&rights.hr&&<PersonalTimeCard context={hrContext} onOpen={()=>choose('time')}/>}
     {screen==='overview'&&!pending&&!rights.kshms&&!rights.hr&&<article className="personal-card"><UserRound aria-hidden="true"/><h3>Dine modulvalg</h3><p>Her finner du profilen din og eventuelle egne prosjektplaner. Firmaadmin styrer tilgangen til andre moduler.</p></article>}
    </aside>
    {screen==='overview'&&!pending&&<div className="personal-secondary-links">
     {rights.kshms&&<article className="personal-card personal-card-handbook"><div className="personal-card-icon"><BookOpen aria-hidden="true"/></div><div><h3>Personalhåndboka</h3><p>Rutiner, tidligere utgaver og dine bekreftelser.</p></div><button type="button" className="secondary" onClick={()=>choose('handbook')}>Åpne personalhåndboka <ArrowRight aria-hidden="true"/></button></article>}
     <article className="personal-card personal-card-profile"><div className="personal-card-icon"><Settings aria-hidden="true"/></div><div><h3>Profil og e-post</h3><p>Kontaktopplysninger, rapportopplysninger og e-postvalg.</p></div><button type="button" className="secondary" onClick={()=>choose('profile')}>Åpne profil og e-post <ArrowRight aria-hidden="true"/></button></article>
    </div>}
   </div>
   {authUser?.id===userId&&onOpenSupport&&!pending&&screen==='overview'&&<SupportSummary supabaseClient={supabaseClient} authUser={authUser} companyId={context?.company_id} onOpen={onOpenSupport}/>}
  </div>
  {authUser?.id===userId&&onOpenSupport&&!pending&&!nav?.enabled&&<SupportSummary supabaseClient={supabaseClient} authUser={authUser} companyId={context?.company_id} onOpen={onOpenSupport}/>}
  {screen==='time'&&rights.hr&&<Suspense fallback={<p role="status">Henter mine timer …</p>}><PersonalTimeWorkspace key={scope} context={hrContext}/></Suspense>}
  {screen==='handbook'&&rights.kshms&&<Suspense fallback={<p role="status">Henter personalhåndboka …</p>}><KshmsModule context={kshmsContext} personalOnly/></Suspense>}
  {screen==='hr'&&rights.hr&&<Suspense fallback={<p role="status">Kontrollerer dine oppfølginger …</p>}><HrModule key={scope} context={hrContext} audience="personal" initialEmployeeId={selection.scope===scope?selection.employeeId:null} onEmployeeSelect={id=>setSelection(previous=>previous.scope===scope?{...previous,employeeId:id}:previous)}/></Suspense>}
  <div hidden={screen!=='profile'}>
   <div hidden={!nav?.enabled}>{authUser&&<AccountContact authUser={authUser} supabaseClient={supabaseClient}/>}</div>
   {screen==='profile'&&rights.hr&&hrContext.enabled&&<PrivateContact context={hrContext}/>}
   <details className="personal-settings" open={!nav?.enabled}><summary>Rapportopplysninger og e-postvalg</summary>{children}</details>
  </div>
 </section>;
}
