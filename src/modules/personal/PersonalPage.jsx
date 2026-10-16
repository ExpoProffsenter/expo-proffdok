import React,{Suspense,useState} from 'react';
import {BookOpen,UserRound,MessageSquare,HeartPulse,Settings,ArrowRight,LayoutDashboard,ShieldCheck,FileClock,CalendarDays} from 'lucide-react';
import {personalRights} from './personalAccess.js';
import AccountContact from './AccountContact.jsx';
import PrivateContact from '../hr/PrivateContact.jsx';
import HomeFollowups from '../home/HomeFollowups.jsx';
import './personal.css';
import {PersonalTimeCard} from '../time/TimeEntryPoint.jsx';
const KshmsMyProgressPlans=React.lazy(()=>import('../kshms/KshmsMyProgressPlans.jsx'));
const PersonalTimeWorkspace=React.lazy(()=>import('../time/TimeEntryPoint.jsx'));
const KshmsModule=React.lazy(()=>import('../kshms/KshmsModule.jsx'));
const HrModule=React.lazy(()=>import('../hr/HrModule.jsx'));
const sections={overview:'Oversikt',handbook:'Personalhåndbok',time:'Mine timer',hr:'Mine oppfølginger',profile:'Profil og e-post'};
const sectionIcons={overview:LayoutDashboard,handbook:BookOpen,time:FileClock,hr:UserRound,profile:Settings};
export default function PersonalPage({context,kshmsContext,hrContext,userId,authUser,supabaseClient,onOpenHrSetup,children}){
 const rights=personalRights(context,kshmsContext,hrContext,userId);
 // Remember only navigation, never an access context or HR payload. Fresh rights still gate every module.
 const [navigation,setNavigation]=useState(null),[selection,setSelection]=useState({scope:null,screen:'overview',employeeId:null});
 const scope=userId&&context?.user_id===userId&&context.company_id?userId+':'+context.company_id:null;
 const previous=navigation?.userId===userId?navigation:null;
 const nav=scope?{scope,userId,enabled:rights.enabled,kshms:rights.kshms||Boolean(!kshmsContext&&previous?.scope===scope&&previous.kshms&&context.company_kshms),hr:rights.hr||Boolean(!hrContext&&previous?.scope===scope&&previous.hr&&context.company_hr)}:context===null&&userId&&authUser?.id===userId?previous:null;
 if(JSON.stringify(nav)!==JSON.stringify(navigation))setNavigation(nav);
 if(selection.scope!==nav?.scope&&selection.scope!==null)setSelection({scope:nav?.scope||null,screen:'overview',employeeId:null});
 const visible=['overview',...(nav?.hr?['time']:[]),...(nav?.kshms?['handbook']:[]),...(nav?.hr?['hr']:[]),'profile'];
 const selected=selection.scope===nav?.scope?selection.screen:'overview';
 const screen=!nav?.enabled?'profile':visible.includes(selected)?selected:'overview';
 const choose=id=>setSelection({scope:nav?.scope,screen:id,employeeId:null});
 const pending=Boolean(nav?.enabled&&(!rights.enabled||(screen==='handbook'&&!rights.kshms)||(['hr','time'].includes(screen)&&!rights.hr)));
 const fullName=String(authUser?.user_metadata?.full_name||authUser?.user_metadata?.name||'').trim();
 const firstName=fullName.split(/\s+/)[0];
 return <section className={nav?.enabled?'personal-page':undefined} aria-label={nav?.enabled?'Min side':'Min profil / e-postvalg'} aria-busy={pending}>
  {nav?.enabled&&<header className="personal-heading"><div><span className="personal-eyebrow"><ShieldCheck size={16} aria-hidden="true"/> DIN ARBEIDSHVERDAG</span><h2>{firstName?'Hei, '+firstName:'Min side'}{' '}<span>Dette er din plass.</span></h2><p>Håndboka, oppfølgingene og profilen din – enkelt å finne, lett å bruke.</p></div><div className="personal-avatar" aria-hidden="true">{fullName?fullName.split(/\s+/).slice(0,2).map(part=>part[0]).join('').toLocaleUpperCase('nb-NO'):<UserRound/>}</div></header>}
  {nav?.enabled&&<nav className="personal-tabs" aria-label="Min side visning">{visible.map(id=>{const Icon=sectionIcons[id];return <button key={id} type="button" className={screen===id?'active':'secondary'} aria-pressed={screen===id} disabled={pending} onClick={()=>choose(id)}><Icon size={18} aria-hidden="true"/>{sections[id]}</button>;})}</nav>}
  <div className="personal-notices" hidden={screen!=='overview'||pending}><HomeFollowups key={nav?.scope||'personal'} hrContext={rights.hr?hrContext:null} userId={userId} onSetup={onOpenHrSetup}/></div>
  {pending&&<div className="personal-checking" role="status"><ShieldCheck aria-hidden="true"/><div><strong>Kontrollerer tilgangen din …</strong><p>Du kommer tilbake til samme visning når kontrollen er ferdig.</p></div></div>}
  {screen==='overview'&&!pending&&<div className="personal-cards">
   {rights.enabled&&<article className="personal-card personal-plans-card" aria-label="Mine aktive planer">
    <div className="personal-plans-heading"><div className="personal-card-icon"><CalendarDays aria-hidden="true"/></div><div><span className="personal-card-eyebrow">DITT PLANLAGTE ARBEID</span><h3>Mine aktive planer</h3></div></div>
    <p>Planene vises fra første til siste dato på dine uferdige oppgaver. Åpne en plan for å se oppgavene dine. Datoene følger norsk tid.</p>
    <div className="personal-plan-sources">
     <Suspense fallback={<p role="status">Henter prosjektplaner …</p>}><KshmsMyProgressPlans key={'project:'+scope} source="project" context={context} grouped/></Suspense>
     {rights.kshms&&<Suspense fallback={<p role="status">Henter andre fremdriftsplaner …</p>}><KshmsMyProgressPlans key={scope} context={kshmsContext} grouped/></Suspense>}
    </div>
   </article>}
   {rights.hr&&<PersonalTimeCard context={hrContext} onOpen={()=>choose('time')}/>}
   {rights.kshms&&<article className="personal-card personal-card-handbook"><div className="personal-card-icon"><BookOpen aria-hidden="true"/></div><span className="personal-card-eyebrow">TRYGG I JOBBEN</span><h3>Personalhåndboka</h3><p>Finn rutinene du har fått. Les, bekreft og slå opp tidligere utgaver når du trenger dem.</p><button type="button" className="secondary" onClick={()=>choose('handbook')}>Åpne personalhåndboka <ArrowRight aria-hidden="true"/></button></article>}
   {rights.hr&&<article className="personal-card personal-card-hr"><div className="personal-card-icon"><UserRound aria-hidden="true"/></div><span className="personal-card-eyebrow">DEG OG DIN LEDER</span><h3>Mine oppfølginger</h3>
    <div className="personal-upcoming"><MessageSquare aria-hidden="true"/><div><strong>Medarbeidersamtale <span className="personal-status">Tilgjengelig</span></strong><p>Du forbereder. Du og leder fullfører sammen.</p></div></div>
    <div className="personal-upcoming"><HeartPulse aria-hidden="true"/><div><strong>Sykefraværsoppfølging <span className="personal-status">Tilgjengelig</span></strong><p>Nærmeste leder starter saken.</p></div></div>
    <p className="personal-note">Åpne en invitasjon eller frist i varsler øverst. Her finner du også egne oppfølginger og opplysninger som er delt med deg.</p><button type="button" className="secondary" onClick={()=>choose('hr')}>Se mine oppfølginger <ArrowRight aria-hidden="true"/></button></article>}
   {!rights.kshms&&!rights.hr&&<article className="personal-card"><UserRound aria-hidden="true"/><h3>Dine modulvalg</h3><p>Her finner du profilen din og eventuelle egne prosjektplaner. Firmaadmin styrer tilgangen til andre moduler.</p></article>}
   <article className="personal-card personal-card-profile"><div className="personal-card-icon"><Settings aria-hidden="true"/></div><span className="personal-card-eyebrow">OPPDATERT OG TILGJENGELIG</span><h3>Profil og e-post</h3><p>Kontroller profilopplysningene dine og velg om du ønsker nyheter og tilbud på e-post.</p><button type="button" className="secondary" onClick={()=>choose('profile')}>Åpne profil og e-post <ArrowRight aria-hidden="true"/></button></article>
  </div>}
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
