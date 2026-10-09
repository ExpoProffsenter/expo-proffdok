import React,{Suspense,useState} from 'react';
import {BookOpen,UserRound,MessageSquare,HeartPulse,Settings,ArrowRight} from 'lucide-react';
import {personalRights} from './personalAccess.js';
import AccountContact from './AccountContact.jsx';
import PrivateContact from '../hr/PrivateContact.jsx';
import './personal.css';
const KshmsModule=React.lazy(()=>import('../kshms/KshmsModule.jsx'));
const HrModule=React.lazy(()=>import('../hr/HrModule.jsx'));
const sections={overview:'Oversikt',handbook:'Personalhåndbok',hr:'Mine oppfølginger',profile:'Profil og e-post'};
export default function PersonalPage({context,kshmsContext,hrContext,userId,authUser,supabaseClient,children}){
 const rights=personalRights(context,kshmsContext,hrContext,userId);
 const [selected,setSelected]=useState('overview');
 const visible=['overview',...(rights.kshms?['handbook']:[]),...(rights.hr?['hr']:[]),'profile'];
 const screen=!rights.enabled?'profile':visible.includes(selected)?selected:'overview';
 return <section className={rights.enabled?'personal-page':undefined} aria-label={rights.enabled?'Min side':'Min profil / e-postvalg'}>
  {rights.enabled&&<header className="personal-heading"><span>{context.company_name||'Ditt firma'}</span><h2>Min side</h2><p>Dine rutiner, oppfølginger og innstillinger – samlet på ett sted.</p></header>}
  {rights.enabled&&<nav className="personal-tabs" aria-label="Min side visning">{visible.map(id=><button key={id} type="button" className={screen===id?'active':'secondary'} aria-pressed={screen===id} onClick={()=>setSelected(id)}>{sections[id]}</button>)}</nav>}
  {screen==='overview'&&<div className="personal-cards">
   {rights.kshms&&<article className="personal-card"><BookOpen aria-hidden="true"/><h3>Personalhåndboka</h3><p>Finn rutinene du har fått. Les, bekreft og slå opp tidligere utgaver når du trenger dem.</p><button type="button" className="secondary" onClick={()=>setSelected('handbook')}>Åpne personalhåndboka <ArrowRight aria-hidden="true"/></button></article>}
   {rights.hr&&<article className="personal-card"><UserRound aria-hidden="true"/><h3>Mine oppfølginger</h3>
    <div className="personal-upcoming"><MessageSquare aria-hidden="true"/><div><strong>Medarbeidersamtale <span className="personal-status">Kommer</span></strong><p>Du forbereder. Du og leder fullfører sammen.</p></div></div>
    <div className="personal-upcoming"><HeartPulse aria-hidden="true"/><div><strong>Sykefraværsoppfølging <span className="personal-status">Kommer</span></strong><p>Nærmeste leder starter saken.</p></div></div>
    <p className="personal-note">Kontroller egen registeroppføring og særskilt delt tilgang nå. Samtaler og fravær er ikke åpnet ennå.</p><button type="button" className="secondary" onClick={()=>setSelected('hr')}>Se mine oppfølginger <ArrowRight aria-hidden="true"/></button></article>}
   {!rights.kshms&&!rights.hr&&<article className="personal-card"><UserRound aria-hidden="true"/><h3>Dine modulvalg</h3><p>Firmaet har KS/HMS eller HR. Firmaadmin gir deg personlig tilgang. Inntil da finner du profil og e-postvalg her.</p></article>}
   <article className="personal-card"><Settings aria-hidden="true"/><h3>Profil og e-post</h3><p>Kontroller profilopplysningene dine og velg om du ønsker nyheter og tilbud på e-post.</p><button type="button" className="secondary" onClick={()=>setSelected('profile')}>Åpne profil og e-post <ArrowRight aria-hidden="true"/></button></article>
  </div>}
  {screen==='handbook'&&<Suspense fallback={<p role="status">Henter personalhåndboka …</p>}><KshmsModule context={kshmsContext} personalOnly/></Suspense>}
  {screen==='hr'&&<Suspense fallback={<p role="status">Kontrollerer dine oppfølginger …</p>}><HrModule context={hrContext} audience="personal"/></Suspense>}
  <div hidden={screen!=='profile'}>
   <div hidden={!rights.enabled}>{authUser&&<AccountContact authUser={authUser} supabaseClient={supabaseClient}/>}</div>
   {screen==='profile'&&rights.hr&&hrContext.enabled&&<PrivateContact context={hrContext}/>}
   <details className="personal-settings" open={!rights.enabled}><summary>Rapportopplysninger og e-postvalg</summary>{children}</details>
  </div>
 </section>;
}
