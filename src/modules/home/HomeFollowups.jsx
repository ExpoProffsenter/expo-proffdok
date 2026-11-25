import React,{createContext,useCallback,useContext,useEffect,useId,useState} from 'react';
import {Bell,ChevronDown} from 'lucide-react';
import HrFollowupNotice from '../hr/HrFollowupNotice.jsx';
import KshmsTasks from '../kshms/KshmsTasks.jsx';
import './homeFollowups.css';

// Presentation only. Existing notice controllers retain their reads, actions and dialogs.
const HomeNoticeContext=createContext(null);
function HomeNotice({id,label,summary,children}){
 const {open,report}=useContext(HomeNoticeContext);
 const {count=0,overdue=0,today=0,soon=0,plannedOverdue=0,more=false,error=false,email=false,nextDate=''}=summary;
 const active=Boolean(children);
 useEffect(()=>{
  report(id,active?{label,count,overdue,today,soon,plannedOverdue,more,error,email,nextDate}:null);
  return()=>report(id,null);
 },[report,id,label,active,count,overdue,today,soon,plannedOverdue,more,error,email,nextDate]);
 return <div className="home-followup-group" data-category={id} hidden={!open||!active}>{children}</div>;
}
const deviations=(node,summary)=><HomeNotice id="deviations" label="Avvik" summary={summary}>{node}</HomeNotice>;
const executions=(node,summary)=><HomeNotice id="executions" label="Kontroller" summary={summary}>{node}</HomeNotice>;
const hr=(node,summary)=><HomeNotice id="hr" label="HR" summary={summary}>{node}</HomeNotice>;
const contact=(node,summary)=><HomeNotice id="contact" label="Kontakt" summary={summary}>{node}</HomeNotice>;
const order=['deviations','executions','hr','contact'];
const date=value=>value.split('-').reverse().join('.');

export default function HomeFollowups({hrContext,kshmsContext,userId,onOpenDeviation,onSetup}){
 const [open,setOpen]=useState(false),[groups,setGroups]=useState({});
 const contentId=useId();
 const report=useCallback((id,value)=>setGroups(previous=>({...previous,[id]:value})),[]);
 const items=order.map(id=>groups[id]).filter(Boolean);
 const total=items.reduce((n,item)=>n+item.count,0),more=items.some(item=>item.more);
 const overdue=items.reduce((n,item)=>n+item.overdue,0),today=items.reduce((n,item)=>n+item.today,0);
 const soon=items.reduce((n,item)=>n+item.soon,0),planned=items.reduce((n,item)=>n+item.plannedOverdue,0);
 const error=items.some(item=>item.error),email=items.some(item=>item.email);
 const nextDate=items.map(item=>item.nextDate).filter(Boolean).sort()[0];
 return <HomeNoticeContext.Provider value={{open,report}}>
  <section className="home-followups" aria-label="Dine varsler og oppfølginger" hidden={!items.length}>
   <button type="button" className="home-followups-toggle" aria-expanded={open} aria-controls={contentId} onClick={()=>setOpen(value=>!value)}>
    <Bell size={20} aria-hidden="true"/>
    <span className="home-followups-copy"><span className="home-followups-title">Varsler og oppfølginger <b>{total}{more?'+':''}</b></span>
     <span className="home-followups-categories">{items.map(item=><span key={item.label}>{item.label} {item.count}{item.more?'+':''}</span>)}</span>
     <span className="home-followups-priority">
      {overdue>0&&<strong className="home-followups-urgent">{overdue} etter fristen</strong>}
      {today>0&&<strong>{today} i dag</strong>}
      {soon>0&&<span>{soon} med frist innen tre dager</span>}
      {planned>0&&<span>{planned} etter planlagt kontrolldato</span>}
      {nextDate&&!overdue&&!today&&!planned&&<span>Nærmeste HR-dato: {date(nextDate)}</span>}
      {error&&<strong className="home-followups-urgent">Varsler må oppdateres</strong>}
      {email&&<strong>Sak fra e-post</strong>}
     </span>
    </span>
    <span className="home-followups-action"><span>{open?'Skjul':'Vis detaljer'}</span><ChevronDown size={18} aria-hidden="true"/></span>
   </button>
   <div id={contentId} className="home-followups-content">
    {kshmsContext?.enabled&&<KshmsTasks key={kshmsContext.company_id+':'+kshmsContext.user_id} context={kshmsContext} onOpen={onOpenDeviation} renderDeviationNotice={deviations} renderExecutionNotice={executions}/>}
    <HrFollowupNotice context={hrContext} userId={userId} onSetup={onSetup} heading="HR-oppfølginger" renderNotice={hr} renderContactNotice={contact}/>
   </div>
  </section>
 </HomeNoticeContext.Provider>;
}
