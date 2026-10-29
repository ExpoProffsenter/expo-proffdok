import React,{useEffect,useState} from 'react';
import {ClipboardList,FileText,PackageSearch,FolderOpen,UsersRound,ShieldCheck,ArrowRight} from 'lucide-react';
import {MODULE_ACCESS_EVENT,readCachedModuleAccess,hasModuleAccess} from '../access/moduleAccessClient.js';
import './workdayShortcuts.css';

export function useWorkspaceTasks(props){
 const [access,setAccess]=useState(readCachedModuleAccess);
 useEffect(()=>{const sync=()=>setAccess(readCachedModuleAccess());window.addEventListener(MODULE_ACCESS_EVENT,sync);sync();return()=>window.removeEventListener(MODULE_ACCESS_EVENT,sync);},[]);
 const sales=access.loaded&&hasModuleAccess(access,'sales'),projects=access.loaded&&hasModuleAccess(access,'projects');
 const action=(label,onClick)=>({label,onClick});
 return [
  sales&&{id:'requests',title:'Forespørsel og befaring',icon:ClipboardList,description:'Registrer en henvendelse, planlegg befaring og følg opp saken.',actions:[action('Ny forespørsel',props.onRequest),action('Se forespørsler og befaringer',props.onSales)]},
  sales&&{id:'offers',title:'Tilbud',icon:FileText,description:hasModuleAccess(access,'store_offers')?'Våtromstilbud og generelle tilbud – med firmaets egne maler.':'Våtromstilbud – med firmaets egne maler.',actions:[action('Nytt tilbud',props.onOffer),action('Se tilbud',props.onSales)]},
  props.canCatalog&&{id:'catalog',title:'Varesøk og bestilling',icon:PackageSearch,description:'Finn varer, juster antall og samle bestillingen.',actions:[action('Varesøk',props.onCatalog),action('Varebestilling',props.onOrder)]},
  projects&&{id:'projects',title:'Prosjekter',icon:FolderOpen,description:'Fortsett prosjektarbeidet med dokumentasjon og sjekklister.',actions:[action('Åpne prosjekter',props.onProjects),action('Nytt prosjekt',props.onNewProject),...(props.canBolig?[action('Boligprosjekter',props.onBolig)]:[])]},
  (props.canHr||props.canKshms)&&{id:'people',title:'HR og HMS/KS',icon:UsersRound,description:'Medarbeidere, rutiner, sikkert arbeid og oppfølging.',actions:[...(props.canHr?[action('HR',props.onHr)]:[]),...(props.canKshms?[action('HMS/KS',props.onKshms)]:[])]},
  (projects||props.canManageChecklists)&&{id:'checklists',title:'Sjekklister',icon:ShieldCheck,description:'Fyll ut i prosjektet. Lag og vedlikehold firmaets sjekklistemaler.',actions:[...(projects?[action('Prosjektsjekklister',props.onProjects)]:[]),...(props.canManageChecklists?[action('Sjekklistemaler',props.onChecklists)]:[])]},
 ].filter(Boolean);
}

export default function WorkdayShortcuts(props){
 const tasks=useWorkspaceTasks(props);
 return <section className="pd-home-workspace" aria-labelledby="pd-home-title">
  <div className="pd-home-heading"><div><h2 id="pd-home-title">Hva vil du jobbe med?</h2><p>Start noe nytt eller fortsett der du slapp.</p></div>{props.canPersonal&&<button type="button" className="secondary" onClick={props.onPersonal}>Min side <ArrowRight size={17} aria-hidden="true"/></button>}</div>
  <div className="pd-home-tasks">{tasks.map(({id,title,icon:Icon,description,actions})=><article className="pd-home-task" key={id}>
   <div className="pd-home-task-title"><Icon size={21} aria-hidden="true"/><h3>{title}</h3></div><p>{description}</p>
   <div className="pd-home-task-actions">{actions.map(({label,onClick},index)=><button key={label} type="button" className={index===0?'pd-task-main':'pd-task-link'} onClick={onClick}>{label}{index===0&&<ArrowRight size={16} aria-hidden="true"/>}</button>)}</div>
  </article>)}</div>
 </section>;
}

