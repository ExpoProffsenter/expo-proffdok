import React from 'react';
import WorkspaceToolDrawer from '../ui/WorkspaceToolDrawer.jsx';
import {kshmsNavigationGroups} from './kshmsNavigation.mjs';

// Native screen IDs and callbacks remain the single navigation contract. The
// daily overview only changes which existing workspace is presented first.
export default function KshmsNavigation({screen,canManage,pendingCount,onNavigate,personalOnly=false,overview=false,onOverview,scopeKey}) {
 const groups=kshmsNavigationGroups({canManage,pendingCount,personalOnly});
 const isDaily=['sja','rounds','risk','progress'].includes(screen);
 const actions=groups.map((group,index)=>({id:`ks-${index}`,title:group.label,description:index===0?'Åpne registreringer og arbeid som følger firmaet.':index===1?'Dine rutiner og opplysninger.':'Firmaets håndbok, kontroll og oppsett.',actions:group.items.map(([key,label])=>({label,onClick:()=>onNavigate(key)}))}));
 return <div className={personalOnly?'ks-workspace-navigation is-personal':'ks-workspace-navigation'}>
  <label className="ks-view-select"><span>Visning</span><select aria-label="Velg KS/HMS-visning" value={overview?'':screen} onChange={event=>event.target.value===''?onOverview?.():onNavigate(event.target.value)}>
   {!personalOnly&&onOverview&&<option value="">Daglig arbeid</option>}
   {groups.map(group=><optgroup key={group.label} label={group.label}>{group.items.map(([key,label])=><option key={key} value={key}>{label}</option>)}</optgroup>)}
  </select></label>
  <nav className="ks-workspace-phases" aria-label="KS/HMS visning">
   {personalOnly?groups[0].items.map(([key,label])=><button type="button" key={key} className={screen===key?'active':''} aria-current={screen===key?'page':undefined} onClick={()=>onNavigate(key)}>{label}</button>):<>
    <button type="button" className={overview||isDaily?'active':''} aria-current={overview||isDaily?'page':undefined} onClick={onOverview}>Daglig arbeid</button>
    <button type="button" className={!overview&&['reading','personal','handbook'].includes(screen)?'active':''} aria-current={!overview&&['reading','personal','handbook'].includes(screen)?'page':undefined} onClick={()=>onNavigate(canManage?'handbook':'personal')}>Rutiner og håndbok</button>
    <button type="button" className={!overview&&screen==='deviations'?'active':''} aria-current={!overview&&screen==='deviations'?'page':undefined} onClick={()=>onNavigate('deviations')}>Avvik og RUH</button>
    {canManage&&<button type="button" className={!overview&&['setup','followup','checklists','extract'].includes(screen)?'active':''} aria-current={!overview&&['setup','followup','checklists','extract'].includes(screen)?'page':undefined} onClick={()=>onNavigate('followup')}>Forvaltning</button>}
   </>}
  </nav>
  {!personalOnly&&<WorkspaceToolDrawer tab="kshms" scopeKey={scopeKey} contextKey={`${screen}:${overview}`} contextTitle="KS/HMS-verktøy" rowClassName="ks-workspace-tools" actionGroups={actions}/>}
 </div>;
}
