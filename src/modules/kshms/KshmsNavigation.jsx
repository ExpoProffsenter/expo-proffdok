import React from 'react';
import {kshmsNavigationGroups} from './kshmsNavigation.mjs';

export default function KshmsNavigation({screen,canManage,pendingCount,onNavigate}) {
 return <nav className="ks-navigation" aria-label="KS/HMS visning">
  {kshmsNavigationGroups({canManage,pendingCount}).map(group=><div className="ks-navigation-group" key={group.label} role="group" aria-label={group.label}>
   <span className="ks-navigation-label">{group.label}</span>
   <div className="ks-tabs">{group.items.map(([key,label])=><button type="button" key={key} className={screen===key?'active':'secondary'} aria-pressed={screen===key} onClick={()=>onNavigate(key)}>{label}</button>)}</div>
  </div>)}
 </nav>;
}
