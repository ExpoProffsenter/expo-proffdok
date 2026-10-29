import React from 'react';
import {useWorkspaceTasks} from '../home/WorkdayShortcuts.jsx';
import WorkspaceToolDrawer from './WorkspaceToolDrawer.jsx';

const names={prosjekt:'Startside',sales:'Forespørsel og tilbud',prosjektliste:'Prosjekter',bolig:'Boligprosjekter',hr:'HR',kshms:'HMS/KS',innlogging:'Min side',catalog_order:'Varebestilling',pro_catalog:'Varesøk',admin:'Systemadmin',firmaadmin:'Firmaadmin'};
// Module bindings and native template discovery stay outside the presentation drawer.
export default function WorkspaceTools(props){
 const tasks=useWorkspaceTasks(props);
 const relevant=props.tab==='sales'?['requests','offers']:['pro_catalog','catalog_order'].includes(props.tab)?['catalog']:props.tab==='kshms'?['people','checklists']:props.tab==='hr'?['people']:null;
 const explicitGroups=Array.isArray(props.actionGroups);
 const groups=explicitGroups?props.actionGroups:props.projectWorkspace?[{id:'project',title:'Prosjektverktøy',description:'Fortsett i prosjektets arbeidsflate.',actions:props.projectTabs.filter(([,label])=>!['Hjelp','Support'].includes(label)).map(([id,label])=>({label,onClick:()=>props.onNavigate(id)}))}]:tasks.filter(task=>!relevant||relevant.includes(task.id));
 const getAdditionalActions=()=>{
  if(explicitGroups)return [];
  const shortcuts=[];
  const templatePanel=document.querySelector('.sales-offer-template-panel,.store-complete-template-inline');
  if(templatePanel)shortcuts.push({label:'Tilbudsmaler – bruk og rediger',onClick:()=>{templatePanel.scrollIntoView({block:'center',behavior:'instant'});templatePanel.querySelector('select')?.focus({preventScroll:true});}});
  const saveTemplate=Array.from(document.querySelectorAll('.sales-app button')).find(button=>button.textContent.trim()==='Lagre som mal'&&!button.disabled&&button.getBoundingClientRect().height>0);
  if(saveTemplate)shortcuts.push({label:'Lagre tilbudet som mal',onClick:()=>saveTemplate.click()});
  return shortcuts;
 };
 const title=props.contextTitle||(props.projectWorkspace?'Prosjektverktøy':names[props.tab]||'Arbeidsrom');
 return <WorkspaceToolDrawer {...props} contextTitle={title} actionGroups={groups} getAdditionalActions={getAdditionalActions}/>;
}
