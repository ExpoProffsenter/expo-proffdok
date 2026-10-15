import React,{Suspense,useEffect,useState} from 'react';
import {ArrowUpRight,Clock3} from 'lucide-react';
import {createTimeSession} from './timeTransport.js';
import {TIME_SETTINGS_EVENT} from './timeCore.mjs';
import {personalRights} from '../personal/personalAccess.js';
import DeviationDialog from '../deviations/DeviationDialog.jsx';
import './mobileTimeShortcut.css';

const PersonalTimeWorkspace=React.lazy(()=>import('./TimeEntryPoint.jsx'));

function MobileTimeCard({context,companyName}){
 const [mobile,setMobile]=useState(false),[open,setOpen]=useState(false),[choice,setChoice]=useState(null);
 useEffect(()=>{
  const query=window.matchMedia('(max-width: 700px)');
  const update=()=>{setMobile(query.matches);if(!query.matches)setOpen(false);};
  update();query.addEventListener('change',update);
  return()=>query.removeEventListener('change',update);
 },[]);
 useEffect(()=>{
  setChoice(null);if(!mobile||!context)return;
  let alive=true,ticket=0;const session=createTimeSession(context);
  const refresh=async()=>{const current=++ticket;session.invalidate();setChoice(null);
   try{if(document.visibilityState!=='hidden'){const result=await session.call('time_tasks_get');if(alive&&current===ticket){const show=result.enabled===true&&result.registered===true&&result.mobile_shortcut===true;setChoice(show);if(!show)setOpen(false);}}}
   catch{if(alive&&current===ticket){setChoice(false);setOpen(false);}}
  };
  const settingsChanged=event=>{if(event.detail?.companyId===context.company_id)refresh();};
  refresh();window.addEventListener(TIME_SETTINGS_EVENT,settingsChanged);window.addEventListener('focus',refresh);document.addEventListener('visibilitychange',refresh);
  return()=>{alive=false;ticket++;session.dispose();window.removeEventListener(TIME_SETTINGS_EVENT,settingsChanged);window.removeEventListener('focus',refresh);document.removeEventListener('visibilitychange',refresh);};
 },[mobile,context?.company_id,context?.user_id]);
 if(!mobile)return null;
 return <>
  {context&&choice===true&&<button type="button" className="mobile-time-shortcut" onClick={()=>setOpen(true)} aria-haspopup="dialog">
   <span className="mobile-time-shortcut-icon"><Clock3 size={29} aria-hidden="true"/></span>
   <span className="mobile-time-shortcut-copy"><small>MIN ARBEIDSDAG</small><strong>Før timer</strong><span>Arbeidstid, reise og utlegg</span></span>
   <span className="mobile-time-shortcut-arrow"><ArrowUpRight size={23} aria-hidden="true"/></span>
  </button>}
  {open&&<DeviationDialog title="Mine timer og utlegg" context={companyName} closeLabel="Lukk mine timer" onClose={()=>setOpen(false)}><Suspense fallback={<p role="status">Henter mine timer …</p>}>{context&&choice===true?<PersonalTimeWorkspace context={context}/>:<p role="status">Kontrollerer tilgangen din …</p>}</Suspense></DeviationDialog>}
 </>;
}

export default function MobileTimeShortcut({personalContext,hrContext,userId}){
 const rights=personalRights(personalContext,null,hrContext,userId);
 // Remember only the open surface's scope during a fresh access check, never its permission or data.
 const [navigation,setNavigation]=useState(null);
 const previous=navigation?.userId===userId?navigation:null;
 const samePersonal=!personalContext||(personalContext.user_id===userId&&personalContext.company_id===previous?.companyId&&personalContext.company_hr===true);
 const sameHr=!hrContext||(hrContext.user_id===userId&&hrContext.company_id===previous?.companyId&&hrContext.available===true);
 const checking=previous&&(!personalContext||!hrContext)&&samePersonal&&sameHr;
 const next=rights.hr?{userId,companyId:hrContext.company_id,companyName:hrContext.company_name||'Aktivt firma'}:checking?previous:null;
 if(JSON.stringify(next)!==JSON.stringify(navigation))setNavigation(next);
 return next?<MobileTimeCard key={next.userId+':'+next.companyId} context={rights.hr?hrContext:null} companyName={next.companyName}/>:null;
}
