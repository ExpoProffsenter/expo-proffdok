import React from 'react';
import {AlertTriangle,ClipboardCheck,ClipboardList,ShieldCheck,BookOpen,BookMarked,CheckCheck,CalendarCheck,FileArchive,Settings,Layers,UserRound,BriefcaseBusiness,Network} from 'lucide-react';
import {kshmsNavigationGroups} from './kshmsNavigation.mjs';
const icons={organization:Network,deviations:AlertTriangle,sja:ClipboardCheck,rounds:ClipboardList,risk:ShieldCheck,reading:CheckCheck,personal:BookMarked,handbook:BookOpen,checklists:ClipboardList,followup:CalendarCheck,extract:FileArchive,setup:Settings};
const groupIcons={'Daglig arbeid':BriefcaseBusiness,'Mine rutiner':UserRound,'Forvaltning':Layers};
export default function KshmsNavigation({screen,canManage,pendingCount,onNavigate,personalOnly=false}) {
 return <nav className={personalOnly?'ks-navigation ks-navigation-personal':'ks-navigation'} aria-label="KS/HMS visning">
  {kshmsNavigationGroups({canManage,pendingCount,personalOnly}).map(group=>{const GroupIcon=groupIcons[group.label];return <div className="ks-navigation-group" key={group.label} role="group" aria-label={group.label}>
   <span className="ks-navigation-label"><span className="ks-navigation-icon"><GroupIcon aria-hidden="true"/></span>{group.label}</span>
   <div className="ks-tabs">{group.items.map(([key,label])=>{const Icon=icons[key];return <button type="button" key={key} className={screen===key?'active':'secondary'} aria-pressed={screen===key} onClick={()=>onNavigate(key)}><Icon aria-hidden="true"/><span>{label.split('/').map((part,index)=><React.Fragment key={index}>{index>0&&<>/<wbr/></>}{part}</React.Fragment>)}</span></button>;})}</div>
  </div>;})}
 </nav>;
}
