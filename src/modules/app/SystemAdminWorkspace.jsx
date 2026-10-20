import React,{useState} from 'react';
import {LayoutDashboard,MessagesSquare,Building2,UsersRound,Package,Newspaper,Mail,RefreshCw,ShieldCheck,Layers,BriefcaseBusiness,Settings} from 'lucide-react';
import AppNewsAdmin from './AppNewsAdmin.jsx';
import SupportWorkspace from '../support/SupportWorkspace.jsx';
import SupportSummary from '../support/SupportSummary.jsx';
import SystemAdminSalesSupport from './SystemAdminSalesSupport.jsx';
import './systemAdminWorkspace.css';
import BoligFirmAccessPanel from '../bolig/BoligFirmAccessPanel.jsx';
const groups=[
 {label:'Oppfølging',icon:BriefcaseBusiness,items:[['overview','Oversikt',LayoutDashboard],['support','Supportsaker',MessagesSquare],['projects','Firmaer og prosjekter',Building2]]},
 {label:'Forvaltning',icon:Layers,items:[['users','Brukere og roller',UsersRound],['products','Produktmaster',Package],['store','Internt vareregister',Package]]},
 {label:'Informasjon og drift',icon:Settings,items:[['news','Nyheter i appen',Newspaper],['broadcast','E-postutsending',Mail],['sync','Dokumentsynk',RefreshCw]]},
];
const description={support:'Les henvendelser, svar brukeren og følg opp åpne saker.',projects:'Finn riktig firma og åpne prosjektet i eksisterende supportmodus.',users:'Godkjenn brukere og vedlikehold firma, roller og tilgang.',products:'Vedlikehold produktregisteret og dokumentasjonen.',store:'Oppdater det interne ERP-vareregisteret med eksisterende importverktøy.',news:'Publiser informasjon som brukerne ser i appen.',broadcast:'Kontroller mottakere og send test før du sender e-post.',sync:'Oppdater produktdokumenter i aktive prosjekter med de eksisterende synkvalgene.'};
export default function SystemAdminWorkspace({children,supabaseClient,authUser,area='overview',onAreaChange}){
 const selected=groups.flatMap(g=>g.items).some(([id])=>id===area)?area:'overview';
 const [visited,setVisited]=useState(()=>new Set([selected]));
 if(!visited.has(selected))setVisited(old=>new Set([...old,selected]));
 const original=React.Children.toArray(children);
 return <div className="pd-admin-workspace">
  <header className="pd-admin-heading"><span><ShieldCheck aria-hidden="true"/> SYSTEMADMINISTRASJON</span><h2>Oversikt og oppfølging</h2><p>Velg området du vil jobbe med. Hvert område har sin egen arbeidsflate.</p></header>
  <nav className="pd-admin-navigation" aria-label="Systemadmin visning">{groups.map(group=>{const Icon=group.icon;return <div className="pd-admin-group" role="group" aria-label={group.label} key={group.label}>
   <span className="pd-admin-group-label"><Icon aria-hidden="true"/>{group.label}</span><div>{group.items.map(([id,label,ItemIcon])=><button key={id} type="button" className={selected===id?'active':'secondary'} aria-pressed={selected===id} onClick={()=>onAreaChange(id)}><ItemIcon aria-hidden="true"/><span>{label}</span></button>)}</div>
  </div>;})}</nav>
  {groups.flatMap(g=>g.items).filter(([id])=>visited.has(id)||id===selected||id==='store').map(([id,label])=><div key={id} className="pd-admin-panel" hidden={selected!==id} aria-label={label}>
   {id==='overview'?<>
    <SupportSummary supabaseClient={supabaseClient} authUser={authUser} admin onOpen={()=>onAreaChange('support')}/>
    <div className="pd-admin-overview">{groups.flatMap(g=>g.items).filter(([key])=>!['overview','support'].includes(key)).map(([key,title,Icon])=><button type="button" className="secondary" key={key} onClick={()=>onAreaChange(key)}><Icon aria-hidden="true"/><strong>{title}</strong><span>{description[key]}</span></button>)}</div>
   </>:id==='support'?<SupportWorkspace supabaseClient={supabaseClient} authUser={authUser} admin standalone/>:<>
    {!['news','broadcast','store'].includes(id)&&<div className="pd-admin-panel-heading"><h3>{label}</h3><p>{description[id]}</p></div>}
    {id==='store'&&<div data-systemadmin-store-catalog-slot/>}
    {original.filter(child=>child.props['data-admin-area']===id)}
    {id==='projects'&&<BoligFirmAccessPanel userId={authUser?.id}/>}
    {id==='projects'&&<SystemAdminSalesSupport supabaseClient={supabaseClient} authUser={authUser}/>}
    {['news','broadcast'].includes(id)&&<AppNewsAdmin supabaseClient={supabaseClient} authUser={authUser} area={id}/>}
   </>}
  </div>)}
 </div>;
}
