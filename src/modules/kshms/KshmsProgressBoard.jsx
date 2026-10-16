import React, {useEffect,useId,useMemo,useRef,useState} from 'react';
import {progressCodeGroups,PROGRESS_CODE_SOURCE} from './kshmsProgressCodes.mjs';
import KshmsProgressStaffing from './KshmsProgressStaffing.jsx';
import {calendarWindow,isSunday,shiftWorkday,clock,dayNumber,dayString,laneBands,minutes,moveBand,newPlanId,nextAnchor,periodSessions,plannedBands,replaceBand,shortDate,shiftDay,todayOslo,visibleBands} from './kshmsProgressTimeline.mjs';
import './kshmsProgressBoard.css';

const statuses=['Ikke startet','Pågår','Avventer','Ferdig'];
const tones={'Ikke startet':'todo','Pågår':'active','Avventer':'waiting','Ferdig':'done'};
const weekday=date=>new Intl.DateTimeFormat('nb-NO',{weekday:'short',timeZone:'UTC'}).format(new Date(date+'T12:00:00Z'));
const bandLabel=band=>`${shortDate(band.from)}${band.to!==band.from?'–'+shortDate(band.to):''} · ${band.startTime}–${band.endTime}`;
// View pointers only; records/drafts still require fresh scoped authorization.
const views=new Map();
let bodyLocks=0,originalOverflow='';

function PlanDialog({title,onClose,children,side=false,expanded=false}){
 const ref=useRef(null),id=useId();
 useEffect(()=>{
  const previous=document.activeElement;
  let frame,locked=false;
  const open=()=>{ref.current.showModal();locked=true;if(bodyLocks++===0)originalOverflow=document.body.style.overflow;document.body.style.overflow='hidden';};
  const parent=ref.current.parentElement.closest('dialog');
  if(parent&&!parent.open)frame=requestAnimationFrame(open);else open();
  return()=>{cancelAnimationFrame(frame);if(locked&&--bodyLocks===0)document.body.style.overflow=originalOverflow;if(previous?.isConnected)previous.focus({preventScroll:true});};
 },[]);
 return <dialog ref={ref} className={'ks-plan-dialog'+(side?' ks-plan-drawer':'')+(expanded?' ks-plan-expanded':'')} aria-labelledby={id} onCancel={e=>{e.preventDefault();onClose();}} onClick={e=>{if(e.target===e.currentTarget){const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)onClose();}}}>
  <div className="ks-plan-dialog-head"><h3 id={id}>{title}</h3><button type="button" className="secondary" aria-label={expanded?'Lukk planbygger':'Lukk planvindu'} onClick={onClose}>{expanded?'Tilbake':'Lukk'}</button></div>{children}
 </dialog>;
}

function OperationPicker({onAdd,onClose,operations}){
 const [search,setSearch]=useState(''),[trade,setTrade]=useState('');
 const groups=useMemo(()=>progressCodeGroups(search,trade),[search,trade]);
 const choice=o=><button type="button" key={o.id} className="secondary ks-code-choice" onClick={()=>onAdd({...o,trade:trade||o.trade})}><b>{o.nsCode}</b><span>{o.title.split(' · ').slice(1).join(' · ')}<small>{o.nsKind==='system'?'Systemkode':'Bygningsdel'} · {o.trades.join(', ')}</small></span><span aria-hidden="true">+</span></button>;
 return <PlanDialog title="Legg til arbeidsoperasjon" onClose={onClose}>
  <p className="ks-plan-hint">Søk etter kode eller navn. Åpne en hovedkode for å velge underkode. Du kan tilpasse navn og fag etterpå.</p>
  <div className="ks-plan-picker-filters"><label>Søk i NS 3451<input type="search" autoFocus value={search} onChange={e=>setSearch(e.target.value)} placeholder="F.eks. 322, rørnett eller belysning"/></label><label>Fag<select aria-label="Fag" value={trade} onChange={e=>setTrade(e.target.value)}><option value="">Alle fag</option>{[...new Set(operations.flatMap(o=>o.trades||[o.trade]))].map(t=><option key={t}>{t}</option>)}</select></label></div>
  <div className="ks-code-tree">{groups.map(({root,rootMatches,children})=><details key={root.id} open={search.trim()?true:undefined}>
   <summary><b>{root.nsCode}</b> {root.title.split(' · ')[1]}<small>{children.length} underkoder / systemer</small></summary>
   {rootMatches&&choice(root)}<div className="ks-code-children">{children.map(choice)}</div>
  </details>)}{!groups.length&&<p>Ingen treff. Prøv et annet søk eller legg til en egen arbeidsoperasjon.</p>}</div>
  <div className="ks-plan-dialog-foot"><button type="button" onClick={()=>onAdd(null)}>+ Egen arbeidsoperasjon</button></div>
  <details className="ks-plan-source"><summary>Om kodene</summary><p>Utvalgte NS 3451:2022-koder med egne korte navn. Bygningsdel og system er ulike kodetyper. Beskriv selve jobben i arbeidsoperasjonen. Rigg og drift kan stå uten kode.</p><a href={PROGRESS_CODE_SOURCE} target="_blank" rel="noreferrer">Offentlig kodegrunnlag, Bergen kommune (2025)</a></details>
 </PlanDialog>;
}

function ActivityDrawer({people=[],excludeSundays,activity,readOnly,saving,onChange,onRemove,onMove,onClose,onSave,error,notice}){
 const [periodId,setPeriodId]=useState(''),[localError,setLocalError]=useState(''),[peopleQuery,setPeopleQuery]=useState('');
 const bands=plannedBands(activity.sessions,excludeSundays),band=bands.find(b=>b.sessions.some(s=>s.id===periodId))||bands[0];
 const patch=values=>onChange({...activity,...values});
 const applyPeriod=values=>{
  try{
   const next={...band,...values};
   if(next.from>next.to){if(values.from)next.to=next.from;else next.from=next.to;}
   const sessions=periodSessions({...next,excludeSundays},band.sessions);
   onChange(replaceBand(activity,band,sessions));setPeriodId(sessions[0].id);setLocalError('');
  }catch(e){setLocalError(e.message);}
 };
 const addPeriod=()=>{
  try{
   const date=excludeSundays?shiftWorkday(bands.length?bands[bands.length-1].to:todayOslo(),bands.length?1:0):bands.length?shiftDay(bands[bands.length-1].to,1):todayOslo();
   const sessions=periodSessions({from:date,to:date,startTime:'08:00',endTime:'16:00',excludeSundays});
   onChange(replaceBand(activity,null,sessions));setPeriodId(sessions[0].id);setLocalError('');
  }catch(e){setLocalError(e.message);}
 };
 return <PlanDialog title={readOnly?'Se arbeidsoperasjon':'Rediger arbeidsoperasjon'} side onClose={onClose}>
  <p className="ks-plan-hint">Endringene følger kladden. Lagre planen når den er klar.</p>
  {(localError||error)&&<p role="alert" className="ks-plan-error">{localError||error}</p>}{notice&&<p role="status">{notice}</p>}
  <fieldset disabled={readOnly||saving} className="ks-plan-editor">
   <label>Arbeidsoperasjon<input maxLength={200} value={activity.title} onChange={e=>patch({title:e.target.value})}/></label>
   <div className="ks-plan-editor-pair"><label>Fag<input maxLength={160} value={activity.trade} onChange={e=>patch({trade:e.target.value})}/></label><label>Person / firma<input maxLength={250} value={activity.resource} onChange={e=>patch({resource:e.target.value})}/></label></div>
   <div className="ks-plan-editor-pair"><label>Status<select aria-label="Status" value={activity.status} onChange={e=>patch({status:e.target.value})}>{statuses.map(s=><option key={s}>{s}</option>)}</select></label><label>NS 3451-kode (valgfri)<input inputMode="numeric" maxLength={4} value={activity.nsCode||''} onChange={e=>patch({nsCode:e.target.value,nsKind:activity.nsKind||'building'})}/></label></div>
   <details className="ks-plan-participants"><summary>Deltakere fra appen ({activity.assigneeIds?.length||0})</summary><p>Velg brukerne som skal delta på denne oppgaven. De finner planen på Min side når deres planlagte periode pågår. Antall personer nedenfor settes separat og kan også omfatte andre arbeidere.</p><label>Søk etter deltaker<input type="search" value={peopleQuery} onChange={e=>setPeopleQuery(e.target.value)}/></label><div className="ks-plan-people">{people.filter(p=>p.name.toLocaleLowerCase('nb-NO').includes(peopleQuery.toLocaleLowerCase('nb-NO'))).map(p=><label key={p.id}><input type="checkbox" checked={Boolean(activity.assigneeIds?.includes(p.id))} onChange={e=>{const ids=activity.assigneeIds||[];if(e.target.checked&&ids.length>=50){setLocalError('Velg høyst 50 deltakere.');return;}patch({assigneeIds:e.target.checked?[...ids,p.id]:ids.filter(id=>id!==p.id)});}}/>{p.name}</label>)}{(activity.assigneeIds||[]).filter(id=>!people.some(p=>p.id===id)).map(id=><label key={id}><input type="checkbox" checked onChange={()=>patch({assigneeIds:activity.assigneeIds.filter(value=>value!==id)})}/>Bruker som ikke finnes i deltakerlisten</label>)}</div></details>
   <label>Antall personer (valgfritt)<input aria-label="Antall personer (valgfritt)" type="number" min="1" max="999" step="1" inputMode="numeric" value={activity.crewSize??''} onChange={e=>patch({crewSize:e.target.value===''?null:Number(e.target.value)})}/><small>Antallet gjelder hver planlagt arbeidsøkt. La feltet stå tomt hvis det er ukjent.</small></label>
   <label>Kodetype<select aria-label="Kodetype" value={activity.nsKind||'building'} onChange={e=>patch({nsKind:e.target.value})}><option value="building">Bygningsdel</option><option value="system">System</option></select></label>
   <div className="ks-plan-period-heading"><h4>Planlagte perioder</h4><button type="button" className="secondary" onClick={addPeriod}>+ Legg til periode</button></div>
   <div className="ks-plan-periods">{bands.map(b=><button type="button" className="secondary" aria-pressed={b.id===band?.id} key={b.id} onClick={()=>setPeriodId(b.id)}>{bandLabel(b)}</button>)}</div>
   {!bands.length&&<p>Ingen planlagte tider. Legg til en periode for å vise oppgaven i tidslinjen.</p>}
   {band&&<section className="ks-plan-period-editor" aria-label="Rediger periode">
    <div className="ks-plan-editor-pair"><label>Startdato<input type="date" value={band.from} onChange={e=>e.target.value&&applyPeriod({from:e.target.value})}/></label><label>Sluttdato<input type="date" value={band.to} onChange={e=>e.target.value&&applyPeriod({to:e.target.value})}/></label></div>
    <div className="ks-plan-editor-pair"><label>Fra kl.<input type="time" value={band.startTime} onChange={e=>e.target.value&&applyPeriod({startTime:e.target.value})}/></label><label>Til kl.<input type="time" value={band.endTime} onChange={e=>e.target.value&&applyPeriod({endTime:e.target.value})}/></label></div>
    <label>Merknad<input maxLength={5000} value={band.note} onChange={e=>applyPeriod({note:e.target.value})}/></label>
    <small>{excludeSundays?'Søndager er utelatt. Lørdager er med.':'Perioden omfatter alle datoene, også helg.'} Del opp perioder for andre fridager.</small>
    <button type="button" className="secondary" onClick={()=>onChange(replaceBand(activity,band,[]))}>Fjern valgt periode</button>
   </section>}
   <details><summary>Endre rekkefølge eller fjern oppgaven</summary><div className="ks-plan-more"><button type="button" className="secondary" onClick={()=>onMove(-1)}>Flytt opp</button><button type="button" className="secondary" onClick={()=>onMove(1)}>Flytt ned</button><button type="button" className="ks-plan-danger" onClick={()=>{if(window.confirm('Fjern arbeidsoperasjonen fra planen?'))onRemove();}}>Fjern arbeidsoperasjon</button></div></details>
  </fieldset>
  <div className="ks-plan-dialog-foot"><button type="button" className="secondary" onClick={onClose}>Tilbake til oversikten</button>{!readOnly&&<button type="button" disabled={saving} onClick={async()=>{if(await onSave())onClose();}}>{saving?'Lagrer …':'Lagre fremdriftsplan'}</button>}</div>
 </PlanDialog>;
}

export default function KshmsProgressBoard({plan,meta,readOnly,dirty,saving,loading,error,notice,onPlanChange,onSave,operations,stateKey,launchToken,onExport,people=[],onDismiss}){
 const firstDate=()=>plan.activities.flatMap(a=>a.sessions).map(s=>s.date).sort()[0]||todayOslo();
 const initial=views.get(stateKey)||{},excludeSundays=plan.excludeSundays===true;
 const [view,setView]=useState(initial.view||'week'),[anchor,setAnchor]=useState(initial.anchor||firstDate),[query,setQuery]=useState(initial.query||''),[trade,setTrade]=useState(initial.trade||''),[compact,setCompact]=useState(initial.compact||false),[picker,setPicker]=useState(false),[editing,setEditing]=useState(initial.editing||''),[drag,setDrag]=useState(null),[localError,setLocalError]=useState(''),[undoCount,setUndoCount]=useState(0),[expanded,setExpanded]=useState(initial.launchToken===launchToken?(initial.expanded??true):true),[surface,setSurface]=useState(initial.surface||'schedule'),[exporting,setExporting]=useState(false);
 useEffect(()=>{if(stateKey)views.set(stateKey,{view,anchor,query,trade,compact,editing,expanded,surface,launchToken});},[stateKey,view,anchor,query,trade,compact,editing,expanded,surface,launchToken]);
 const history=useRef([]),dragRef=useRef(null),scroll=useRef(null);
 const editable=!readOnly&&!saving&&!loading&&!exporting,windowRange=calendarWindow(anchor,view,excludeSundays);
 useEffect(()=>{if(excludeSundays&&isSunday(anchor))setAnchor(shiftWorkday(anchor));},[anchor,excludeSundays]);
 useEffect(()=>{
  let frame;
  const align=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{
   const container=scroll.current,track=container?.querySelector('.ks-timeline-track'),label=container?.querySelector('.ks-timeline-label');
   if(!container||!track||!label)return;
   const window=calendarWindow(anchor,view,excludeSundays),index=view==='day'?0:Math.max(0,window.dates.findIndex(d=>d>=anchor));
   const available=container.clientWidth-label.getBoundingClientRect().width;
   container.scrollTo({left:view==='day'?0:Math.max(0,index*track.getBoundingClientRect().width/window.dates.length-available/2)});
  });};
  align();let width=0;
  const observer=typeof ResizeObserver==='function'?new ResizeObserver(entries=>{const next=entries[0]?.contentRect.width;if(next!==width){width=next;align();}}):null;
  if(scroll.current)observer?.observe(scroll.current);
  window.addEventListener('resize',align);
  return()=>{cancelAnimationFrame(frame);observer?.disconnect();window.removeEventListener('resize',align);};
 },[view,anchor,expanded,excludeSundays,surface]);
 const changed=next=>{if(!editable)return;history.current.push(plan);if(history.current.length>30)history.current.shift();setUndoCount(history.current.length);onPlanChange(next);setLocalError('');};
 const changeActivity=activity=>changed({...plan,activities:plan.activities.map(a=>a.id===activity.id?activity:a)});
 const activity=plan.activities.find(a=>a.id===editing);
 const activities=plan.activities.filter(a=>(!trade||a.trade===trade)&&[a.title,a.trade,a.resource,a.nsCode].join(' ').toLocaleLowerCase('nb-NO').includes(query.toLocaleLowerCase('nb-NO')));
 const today=todayOslo();
 const daySessions=plan.activities.flatMap(a=>a.sessions).filter(s=>s.date===windowRange.dates[0]);
 const startHour=Math.min(6,...daySessions.map(s=>Math.floor(minutes(s.startTime)/60))),endHour=Math.max(20,...daySessions.map(s=>Math.ceil(minutes(s.endTime)/60)));
 const columns=view==='day'?Array.from({length:endHour-startHour},(_,i)=>clock((i+startHour)*60)):windowRange.dates;
 const unitTotal=view==='day'?(endHour-startHour)*60:windowRange.dates.length;
 const minTimelineWidth=view==='month'?columns.length*32:view==='day'?columns.length*44:columns.length*76;
 useEffect(()=>{const cancel=()=>{dragRef.current=null;setDrag(null);};const escape=e=>{if(e.key==='Escape'&&dragRef.current){e.preventDefault();cancel();}};window.addEventListener('blur',cancel);window.addEventListener('keydown',escape);document.addEventListener('visibilitychange',cancel);return()=>{dragRef.current=null;window.removeEventListener('blur',cancel);window.removeEventListener('keydown',escape);document.removeEventListener('visibilitychange',cancel);};},[]);
 useEffect(()=>{if(!editable){dragRef.current=null;setDrag(null);setPicker(false);}},[editable]);
 const add=operation=>{
  if(!editable)return;
  if(plan.activities.length>=500){setLocalError('Planen kan ha høyst 500 arbeidsoperasjoner.');return;}
  const id=newPlanId(),date=excludeSundays?shiftWorkday(anchor):anchor;
  const added={id,title:operation?.title||'Ny arbeidsoperasjon',trade:operation?.trade||'',resource:'',status:'Ikke startet',sessions:periodSessions({from:date,to:date,startTime:'08:00',endTime:'16:00',excludeSundays}),...(operation?{nsCode:operation.nsCode,nsKind:operation.nsKind,sourceSuggestionId:operation.id}:{})};
  changed({...plan,activities:[...plan.activities,added]});setPicker(false);setEditing(id);
 };
 const begin=(event,a,b,mode)=>{
  if(!editable||event.button!==0)return;
  event.preventDefault();event.stopPropagation();
  const width=event.currentTarget.closest('.ks-timeline-track').getBoundingClientRect().width;
  const value={activity:a,band:b,mode,startX:event.clientX,width,delta:0,view,unitTotal};
  dragRef.current=value;setDrag(value);event.currentTarget.closest('.ks-timeline-track').setPointerCapture(event.pointerId);
 };
 const pointerMove=event=>{
  const value=dragRef.current;if(!value)return;
  const raw=(event.clientX-value.startX)/value.width*value.unitTotal;
  const delta=value.view==='day'?Math.round(raw/30)*30:Math.round(raw);
  if(delta!==value.delta){const next={...value,delta};dragRef.current=next;setDrag(next);}
 };
 const finish=event=>{
  const value=dragRef.current;dragRef.current=null;setDrag(null);
  if(!value||!editable)return;
  if(value.delta===0){if(value.mode==='move')setEditing(value.activity.id);return;}
  try{
   const fresh=plan.activities.find(a=>a.id===value.activity.id);
   if(fresh!==value.activity)throw Error('Oppgaven er endret. Prøv flyttingen på nytt.');
   changeActivity(moveBand(fresh,value.band,value.mode,value.delta,value.view==='day'?'minute':'day',excludeSundays));
  }catch(e){setLocalError(e.message);}
 };
 const keyMove=(event,a,b)=>{
  if(!editable||!event.altKey||!['ArrowLeft','ArrowRight'].includes(event.key))return;
  event.preventDefault();try{changeActivity(moveBand(a,b,event.shiftKey?'end':'move',(event.key==='ArrowLeft'?-1:1)*(view==='day'?30:1),view==='day'?'minute':'day',excludeSundays));}catch(e){setLocalError(e.message);}
 };
 const title=view==='month'?new Intl.DateTimeFormat('nb-NO',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(anchor+'T12:00:00Z')):view==='day'?`${weekday(anchor)} ${shortDate(anchor)} ${anchor.slice(0,4)}`:`${shortDate(windowRange.dates[0])}–${shortDate(windowRange.dates.at(-1))} ${anchor.slice(0,4)}`;
 const exportSaved=async kind=>{setExporting(true);try{const message=await onExport(kind);setLocalError(message||'');}finally{setExporting(false);}};
 const changeSundays=checked=>{
  const count=plan.activities.reduce((n,a)=>n+a.sessions.filter(s=>isSunday(s.date)).length,0);
  if(checked&&count&&!window.confirm(`Fjern ${count} søndagsøkter fra kladden? Lagre planen for å bekrefte fjerningen.`))return;
  changed({...plan,excludeSundays:checked,activities:checked?plan.activities.map(a=>({...a,sessions:a.sessions.filter(s=>!isSunday(s.date))})):plan.activities});
 };
 const content=<section className="ks-plan-board" aria-label="Planoversikt">
  <div className="ks-plan-surface" role="group" aria-label="Planvisning"><button type="button" aria-pressed={surface==='schedule'} onClick={()=>setSurface('schedule')}>Fremdriftsplan</button><button type="button" aria-pressed={surface==='staffing'} onClick={()=>setSurface('staffing')}>Bemanningsplan</button><details><summary>Eksport</summary><div>{[['pdf-download','Last ned fremdriftsplan (PDF)'],['staffing-download','Last ned bemanningsplan (PDF)'],['pdf','Forhåndsvis fremdriftsplan'],['staffing-pdf','Forhåndsvis bemanningsplan'],['ics','Last ned kalender (.ics)'],['staffing-csv','Last ned bemanning (.csv)']].map(([key,label])=><button type="button" className="secondary" key={key} disabled={dirty||saving||exporting||loading} onClick={()=>exportSaved(key)}>{label}</button>)}</div></details></div>
  <div className="ks-plan-toolbar"><div className="ks-plan-view-controls"><div className="ks-plan-view" role="group" aria-label="Tidsvisning">{[['day','Dag'],['week','Uke'],['month','Måned']].map(([key,label])=><button type="button" key={key} aria-pressed={view===key} onClick={()=>{setView(key);dragRef.current=null;setDrag(null);scroll.current?.scrollTo({left:0});}}>{label}</button>)}</div>{!expanded&&<button type="button" className="secondary" aria-label="Utvid planen" onClick={()=>setExpanded(true)}>Utvid</button>}</div>
   <div className="ks-plan-actions">{!readOnly&&<><button type="button" className="secondary" disabled={!editable||!undoCount} onClick={()=>{const previous=history.current.pop();if(previous){onPlanChange(previous);setUndoCount(history.current.length);}}}>Angre</button><button type="button" className="secondary" disabled={!editable} onClick={()=>setPicker(true)}>+ Arbeidsoperasjoner</button><button type="button" disabled={!editable||!dirty} onClick={onSave}>{saving?'Lagrer …':dirty?'Lagre fremdriftsplan':'Lagret'}</button></>}{readOnly&&<strong>Kun visning</strong>}</div>
  </div>
  <div className="ks-plan-nav"><div><button type="button" className="secondary" aria-label="Forrige periode" onClick={()=>setAnchor(nextAnchor(anchor,view,-1,excludeSundays))}>‹</button><strong aria-live="polite">{title}</strong><button type="button" className="secondary" aria-label="Neste periode" onClick={()=>setAnchor(nextAnchor(anchor,view,1,excludeSundays))}>›</button></div><div><button type="button" className="secondary" onClick={()=>setAnchor(today)}>I dag</button><button type="button" className="secondary" onClick={()=>setAnchor(firstDate())}>Til planen</button><label className="ks-plan-date">Vis dato<input type="date" value={anchor} onChange={e=>{if(e.target.value)setAnchor(e.target.value);}}/></label></div></div>
  <label className="ks-plan-sunday"><input type="checkbox" checked={excludeSundays} disabled={!editable} onChange={e=>changeSundays(e.target.checked)}/>Utelat søndager</label>
  {surface==='schedule'&&<div className="ks-plan-filters"><label>Søk i oppgavene<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Navn, person eller kode"/></label><label>Vis fag<select aria-label="Vis fag" value={trade} onChange={e=>setTrade(e.target.value)}><option value="">Alle fag</option>{[...new Set(plan.activities.map(a=>a.trade).filter(Boolean))].sort().map(t=><option key={t}>{t}</option>)}</select></label><label className="ks-plan-compact"><input type="checkbox" checked={compact} onChange={e=>setCompact(e.target.checked)}/>Kompakte rader</label><small>{activities.length} av {plan.activities.length} oppgaver</small></div>}
  {(localError||error)&&<p role="alert" className="ks-plan-error">{localError||error}</p>}{notice&&<p role="status" className="ks-plan-success">{notice}</p>}
  {surface==='staffing'?<KshmsProgressStaffing plan={plan} range={windowRange} dirty={dirty} onEdit={setEditing}/>:<>
  <p className="ks-plan-hint ks-plan-gesture-help" role="status" aria-live="polite">{drag?<>{drag.mode==='move'?'Flytter':'Endrer varighet'} · {drag.delta>0?'+':''}{drag.delta} {view==='day'?'minutter':'dager'} · slipp for å bruke endringen</>:<>{readOnly?'Trykk på en oppgave for å se detaljer.':'Trykk for å redigere. Dra for å flytte, og dra i endene for å endre varighet.'} {view==='day'?'Dag viser klokkeslett.':'Uke og måned viser hele dager.'}</>}</p>
  <div className="ks-timeline-scroll" ref={scroll} tabIndex={0} aria-label="Rullbar tidslinje">
   <div className="ks-timeline" style={{'--timeline-min':minTimelineWidth+'px','--timeline-cols':columns.length,'--label-width':compact?'190px':'220px'}}>
    <div className="ks-timeline-axis"><div className="ks-timeline-label">Arbeidsoperasjon</div><div className="ks-timeline-columns">{columns.map((c,i)=><div key={c} className={(view!=='day'&&[0,6].includes(new Date(c+'T12:00:00Z').getUTCDay())?'weekend ':'')+(view!=='day'&&c===today?'today':'')}><b>{view==='day'?c:view==='month'?Number(c.slice(-2)):shortDate(c)}</b>{view!=='day'&&<small>{weekday(c)}</small>}</div>)}</div></div>
    {activities.map(a=>{
     let shown=a;
     if(drag?.activity.id===a.id){try{shown=moveBand(a,drag.band,drag.mode,drag.delta,view==='day'?'minute':'day',excludeSundays);}catch{/* Invalid preview leaves last valid geometry. */}}
     const bands=laneBands(visibleBands(shown,view,windowRange,excludeSundays),view),lanes=Math.max(1,...bands.map(b=>b.lane+1));
     return <div className={'ks-timeline-row '+(compact?'compact':'')} key={a.id} style={{minHeight:Math.max(compact?50:66,lanes*40+10)}}>
      <button type="button" className="ks-timeline-label" onClick={()=>setEditing(a.id)}><span className={'ks-plan-dot '+tones[a.status]} aria-label={a.status}/><span><b>{a.title}</b><small>{[a.nsCode,a.trade,a.crewSize?`${a.crewSize} pers.`:'',a.assigneeIds?.length?`${a.assigneeIds.length} fra appen`:'',compact?'':a.resource].filter(Boolean).join(' · ')}</small></span></button>
      <div className="ks-timeline-track" onPointerMove={pointerMove} onPointerUp={finish} onPointerCancel={()=>{dragRef.current=null;setDrag(null);}} style={{backgroundSize:`${100/columns.length}% 100%`}}>
       {view!=='day'&&windowRange.dates.map((date,i)=>[0,6].includes(new Date(date+'T12:00:00Z').getUTCDay())?<i className="ks-timeline-weekend" key={date} style={{left:100*i/columns.length+'%',width:100/columns.length+'%'}}/>:null)}
       {!a.sessions.length&&<button type="button" className="ks-plan-unplanned" onClick={()=>setEditing(a.id)}>{readOnly?'Ikke tidfestet':'+ Planlegg tid'}</button>}
       {bands.map(b=>{
        const from=view==='day'?minutes(b.startTime)-startHour*60:Math.max(0,windowRange.dates.findIndex(d=>d>=b.from));
        const to=view==='day'?minutes(b.endTime)-startHour*60:windowRange.dates.filter(d=>d<=b.to).length;
        const clippedLeft=view!=='day'&&dayNumber(b.from)<windowRange.from,clippedRight=view!=='day'&&dayNumber(b.to)>windowRange.to;
        return <div className={'ks-timeline-band '+tones[a.status]+(editable?' editable':'')+(drag?.activity.id===a.id&&drag.band.sessions.some(s=>b.sessions.some(t=>t.id===s.id))?' dragging':'')} key={drag?.activity.id===a.id&&b.sessions.some(s=>drag.band.sessions.some(t=>t.id===s.id))?drag.band.id:b.id} style={{left:100*from/unitTotal+'%',width:100*(to-from)/unitTotal+'%',top:5+b.lane*40}} title={bandLabel(b)}>
         {editable&&!clippedLeft&&<button type="button" className="ks-plan-handle start" aria-label={'Endre start: '+a.title} onPointerDown={e=>begin(e,a,b,'start')} onPointerMove={pointerMove} onPointerUp={finish} onPointerCancel={()=>{dragRef.current=null;setDrag(null);}} onKeyDown={e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();try{changeActivity(moveBand(a,b,'start',(e.key==='ArrowLeft'?-1:1)*(view==='day'?30:1),view==='day'?'minute':'day',excludeSundays));}catch(err){setLocalError(err.message);}}}}>⋮</button>}
         <button type="button" className="ks-plan-band-body" aria-label={'Rediger periode: '+a.title+' · '+bandLabel(b)} onPointerDown={e=>begin(e,a,b,'move')} onPointerMove={pointerMove} onPointerUp={finish} onPointerCancel={()=>{dragRef.current=null;setDrag(null);}} onClick={e=>{if(e.detail===0)setEditing(a.id);else if(!editable)setEditing(a.id);}} onKeyDown={e=>keyMove(e,a,b)}>{view==='day'?`${b.startTime}–${b.endTime}`:b.from===b.to?b.startTime:bandLabel(b)}</button>
         {editable&&!clippedRight&&<button type="button" className="ks-plan-handle end" aria-label={'Endre slutt: '+a.title} onPointerDown={e=>begin(e,a,b,'end')} onPointerMove={pointerMove} onPointerUp={finish} onPointerCancel={()=>{dragRef.current=null;setDrag(null);}} onKeyDown={e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();try{changeActivity(moveBand(a,b,'end',(e.key==='ArrowLeft'?-1:1)*(view==='day'?30:1),view==='day'?'minute':'day',excludeSundays));}catch(err){setLocalError(err.message);}}}}>⋮</button>}
        </div>;
       })}
      </div>
     </div>;
    })}
   </div>
   {!activities.length&&<div className="ks-plan-empty"><strong>{plan.activities.length?'Ingen oppgaver passer filteret.':'Begynn med arbeidsoperasjonene'}</strong><p>{plan.activities.length?'Endre søket eller velg Alle fag.':'Velg en hovedkode eller underkode, eller legg inn en egen oppgave.'}</p>{editable&&<button type="button" onClick={()=>setPicker(true)}>+ Arbeidsoperasjoner</button>}</div>}
  </div>
  </>}

  {picker&&editable&&<OperationPicker operations={operations} onAdd={add} onClose={()=>setPicker(false)}/>}
  {activity&&<ActivityDrawer key={activity.id} activity={activity} excludeSundays={excludeSundays} people={people} readOnly={readOnly} saving={saving} error={error} notice={notice} onChange={changeActivity} onClose={()=>setEditing('')} onSave={onSave} onRemove={()=>{changed({...plan,activities:plan.activities.filter(a=>a.id!==activity.id)});setEditing('');}} onMove={direction=>{const rows=[...plan.activities],index=rows.findIndex(a=>a.id===activity.id),to=index+direction;if(to>=0&&to<rows.length){[rows[index],rows[to]]=[rows[to],rows[index]];changed({...plan,activities:rows});}}}/>}
 </section>;
 return expanded?<PlanDialog title={meta.title||'Fremdriftsplan'} expanded onClose={()=>{setExpanded(false);onDismiss?.();}}>{content}</PlanDialog>:<div className="ks-plan-launcher"><p>Åpne planbyggeren for å arbeide med tidslinjen eller bemanningen.</p><button type="button" onClick={()=>{setSurface('schedule');setExpanded(true);}}>Åpne planbygger</button> <button type="button" className="secondary" onClick={()=>{setSurface('staffing');setExpanded(true);}}>Åpne bemanningsplan</button>{dirty&&<p>Du har ulagrede endringer i kladden.</p>}</div>;
}
