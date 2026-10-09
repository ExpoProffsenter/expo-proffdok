import React,{useEffect,useRef,useState} from 'react';
import {Network,Plus,Download,Search,ChevronDown,ChevronRight,UsersRound,GraduationCap,UserRound,Building2,BriefcaseBusiness,GitBranch,X,Pencil,RefreshCw} from 'lucide-react';
import {kshmsRpc} from '../kshms/kshmsAccess.js';
import {ORG_COLORS,ORG_KINDS,orgBranches,orgPersonRows,createOrgSession} from './orgModel.mjs';
import {MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT,publishManagedAccessChange} from '../access/moduleAccessClient.js';
import {WORK_PROFILE_EVENT} from '../access/workProfileClient.js';

import './organization.css';

const blankUnit={id:null,name:'',parent_id:'',manager_id:'',color:'teal'};
function Input({label,children}){return <label className="org-field"><span>{label}</span>{children}</label>;}
function IconButton({icon:Icon,children,...props}){return <button type="button" {...props}><Icon size={17} aria-hidden="true"/>{children}</button>;}

export default function OrganizationChart({context}) {
 const companyId=context.company_id,userId=context.user_id;
 const [data,setData]=useState(null),[error,setError]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false);
 const [query,setQuery]=useState(''),[filter,setFilter]=useState(''),[expanded,setExpanded]=useState(new Set()),[zoom,setZoom]=useState(100);
 const [modal,setModal]=useState(null),[draft,setDraft]=useState(blankUnit);
 const session=useRef(null),epoch=useRef(0),locked=useRef(false),dialog=useRef(null),lastFocus=useRef(null);
 const clear=()=>{setData(null);setModal(null);setDraft(blankUnit);};
 const refreshRef=useRef(null);
 useEffect(()=>{
  let alive=true;
  const current=createOrgSession({rpc:kshmsRpc,companyId,userId,onClear:clear});session.current=current;
  const refresh=async()=>{
   const ticket=++epoch.current;current.invalidate();setError('');
   if(document.visibilityState==='hidden')return;
   try{const value=await current.read();if(alive&&ticket===epoch.current){setData(value);setFilter(previous=>value.units.some(unit=>unit.id===previous)?previous:'');}}
   catch(cause){if(alive&&ticket===epoch.current)setError(cause.message);}
  };
  refreshRef.current=refresh;void refresh();
  const events=['focus',MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT,WORK_PROFILE_EVENT];
  events.forEach(event=>window.addEventListener(event,refresh));document.addEventListener('visibilitychange',refresh);
  return()=>{alive=false;++epoch.current;current.dispose();session.current=null;refreshRef.current=null;
   events.forEach(event=>window.removeEventListener(event,refresh));document.removeEventListener('visibilitychange',refresh);};
 },[companyId,userId]);
 useEffect(()=>{
  if(modal&&dialog.current){if(typeof dialog.current.showModal==='function'&&!dialog.current.open)dialog.current.showModal();else dialog.current.open=true;}
  if(!modal)lastFocus.current?.focus();
 },[modal]);
 const begin=(type,value,event)=>{lastFocus.current=event.currentTarget;setDraft(value);setModal(type);setError('');setNotice('');};
 const work=async(fn)=>{
  if(locked.current||!data)return;locked.current=true;setBusy(true);setError('');setNotice('');
  const current=session.current,ticket=epoch.current;
  try{await fn(current,()=>current===session.current&&ticket===epoch.current&&document.visibilityState!=='hidden');}
  catch(cause){if(current===session.current&&ticket===epoch.current)setError(cause.message);}
  finally{locked.current=false;if(current===session.current)setBusy(false);}
 };
 const save=action=>work(async(current,isCurrent)=>{
  const payload=action==='unit'?{...draft,parent_id:draft.parent_id||null,manager_id:draft.manager_id||null}
   :action==='remove_unit'?{id:draft.id}:action==='unplace'?{employee_id:draft.employee_id,employee_revision:draft.employee_revision}
   :{...draft,leader_id:draft.leader_id||null};
  const fresh=await current.command(data,action,payload);
  if(isCurrent()){setData(fresh);setModal(null);setNotice(action==='unit'?'Avdelingen er lagret.':action==='remove_unit'?'Den tomme avdelingen er fjernet.':action==='unplace'?'Medarbeideren er flyttet til Ikke plassert.':'Plassering og stilling er lagret.');
   if(action==='place'&&draft.leader_id!==(data.people.find(p=>p.id===draft.employee_id)?.leader_id||''))
    publishManagedAccessChange({source:'org-leader',companyId});}
 });
 const download=()=>work(async(current,isCurrent)=>{
  const {downloadOrgPdf}=await import('./orgPdf.mjs');
  await downloadOrgPdf({session:current,expected:data,companyName:context.company_name,isCurrent});
  if(isCurrent())setNotice('PDF er lastet ned. Kontroller innholdet før du sender den videre.');
 });
 const model=data?orgBranches(data):null,admin=data?.context.administer===true;
 const editable=model?[...model.units.values()].filter(unit=>unit.editable):[];
 const term=query.trim().toLocaleLowerCase('nb-NO');
 const matches=person=>!term||`${person.name} ${person.title} ${ORG_KINDS[person.kind]}`.toLocaleLowerCase('nb-NO').includes(term);
 const nameFor=id=>data?.members.find(member=>member.id===id)?.name||data?.people.find(person=>person.user_id===id)?.name||'Ingen leder valgt';
 const personButton=person=><button className={`org-person org-person-${person.kind}`} type="button" key={person.id}
  style={{'--org-depth':Math.min(person.depth||0,4)}} onClick={event=>begin('person',{
   employee_id:person.id,employee_revision:person.revision,unit_id:person.unit_id||'',title:person.title,
   kind:person.kind,leader_id:person.leader_id||'',confirm_leader_change:false},event)}>
  <span className="org-avatar">{person.kind==='apprentice'?<GraduationCap aria-hidden="true"/>:<UserRound aria-hidden="true"/>}</span>
  <span><strong>{person.name}</strong><small>{person.title}</small></span><span className="org-kind">{ORG_KINDS[person.kind]}</span>
 </button>;
 const branch=unit=>{
  const show=expanded.has(unit.id)||Boolean(term),people=orgPersonRows(unit.people).filter(matches);
  return <section className={`org-branch org-${unit.color}`} key={unit.id}>
   <div className="org-unit-head"><span className="org-unit-icon"><Building2 aria-hidden="true"/></span><div><h4>{unit.name}</h4><p>{unit.manager_name||'Avdelingsleder ikke valgt'}</p></div>
    {unit.editable&&<button type="button" className="org-edit-icon" aria-label={`Rediger ${unit.name}`} onClick={event=>begin('unit',{
     id:unit.id,name:unit.name,parent_id:unit.parent_id||'',manager_id:unit.manager_id||'',color:unit.color},event)}><Pencil size={16} aria-hidden="true"/></button>}</div>
   <div className="org-unit-counts"><span><UsersRound size={14} aria-hidden="true"/>{unit.people.length} medarbeidere</span>
    {unit.people.some(p=>p.kind==='apprentice')&&<span><GraduationCap size={14} aria-hidden="true"/>{unit.people.filter(p=>p.kind==='apprentice').length} lærlinger</span>}</div>
   <button type="button" className="org-expand" aria-expanded={show} onClick={()=>setExpanded(previous=>{const next=new Set(previous);if(next.has(unit.id))next.delete(unit.id);else next.add(unit.id);return next;})}>
    {show?<ChevronDown size={16} aria-hidden="true"/>:<ChevronRight size={16} aria-hidden="true"/>}{show?'Skjul medarbeidere':'Vis medarbeidere'}</button>
   {show&&<div className="org-people">{people.map(personButton)}{!people.length&&<p className="org-empty-line">{term?'Ingen treff i avdelingen.':'Ingen medarbeidere plassert her ennå.'}</p>}</div>}
   {!!unit.children.length&&<div className="org-subunits">{unit.children.map(branch)}</div>}
  </section>;
 };
 const selected=data?.people.find(person=>person.id===draft.employee_id);
 const canPlace=admin||Boolean(selected?.unit_id&&model?.units.get(selected.unit_id)?.editable);
 const leaderChanged=modal==='person'&&draft.leader_id!==(selected?.leader_id||'');
 return <section className="org-workspace" aria-label="Organisasjonskart">
  <div className="org-intro"><span><Network aria-hidden="true"/></span><div><h3>Organisasjonskart</h3><p>{admin?'Bygg firmaets organisasjon.':'Menneskene og avdelingene i firmaet.'} Åpne en avdeling for å se medarbeidere.</p></div></div>
  <div className="org-stats"><div><Building2 aria-hidden="true"/><strong>{data?.units.length??'–'}</strong><span>avdelinger</span></div><div><UsersRound aria-hidden="true"/><strong>{data?.people.length??'–'}</strong><span>medarbeidere</span></div><div><GraduationCap aria-hidden="true"/><strong>{data?.people.filter(p=>p.kind==='apprentice').length??'–'}</strong><span>lærlinger</span></div><div><GitBranch aria-hidden="true"/><strong>{model?.unplaced.length??'–'}</strong><span>ikke plassert</span></div></div>
  {error&&<p className="org-message org-error" role="alert">{error} <button type="button" onClick={()=>void refreshRef.current?.()}>Hent kartet på nytt</button></p>}
  {notice&&<p className="org-message" role="status">{notice}</p>}
  {!data&&!error&&<p role="status">Henter firmaets organisasjon …</p>}
  {data&&<><div className="org-toolbar"><label className="org-search"><Search size={18} aria-hidden="true"/><input aria-label="Søk i organisasjonskart" type="search" placeholder="Finn person, stilling eller lærling" value={query} onChange={event=>setQuery(event.target.value)}/></label>
   <select aria-label="Vis avdeling" value={filter} onChange={event=>setFilter(event.target.value)}><option value="">Hele firmaet</option>{data.units.map(unit=><option key={unit.id} value={unit.id}>{unit.name}</option>)}</select>
   <IconButton icon={RefreshCw} className="secondary" disabled={busy} onClick={()=>void refreshRef.current?.()}>Oppdater</IconButton>
   <IconButton icon={Download} className="secondary" disabled={busy} onClick={download}>Last ned PDF</IconButton>
   {(admin||editable.length>0)&&<IconButton icon={Plus} disabled={busy} onClick={event=>begin('unit',{...blankUnit,parent_id:admin?'':editable[0].id},event)}>Ny avdeling</IconButton>}</div>
   {!data.units.length?<div className="org-onboarding"><span className="org-onboarding-icon"><Network aria-hidden="true"/></span><h3>Bygg et kart som passer dere</h3><p>Start med firmaets avdelinger. Legg til underavdelinger, velg ledere og plasser medarbeiderne når strukturen er klar.</p>
    <div className="org-onboarding-steps"><span><b>1</b>Avdelinger</span><span><b>2</b>Ledere og stillinger</span><span><b>3</b>Ansatte og lærlinger</span></div>
    {admin&&<IconButton icon={Plus} onClick={event=>begin('unit',blankUnit,event)}>Legg til første avdeling</IconButton>}</div>
   :<><div className="org-canvas-toolbar"><span><Network size={16} aria-hidden="true"/>Firmaets struktur</span><div><button type="button" aria-label="Zoom ut" disabled={zoom<=70} onClick={()=>setZoom(Math.max(70,zoom-10))}>−</button><button type="button" onClick={()=>setZoom(100)}>{zoom}%</button><button type="button" aria-label="Zoom inn" disabled={zoom>=130} onClick={()=>setZoom(Math.min(130,zoom+10))}>+</button></div></div>
    <div className="org-canvas" tabIndex={0} aria-label="Kartflate, rull inne i kartet ved behov"><div className="org-map" style={{zoom:zoom/100}}>
     <div className="org-company-node"><span><BriefcaseBusiness aria-hidden="true"/></span><strong>{context.company_name||'Ditt firma'}</strong><small>{data.people.length} medarbeidere · {data.units.length} avdelinger</small></div>
     <div className="org-root-branches">{(filter?[model.units.get(filter)].filter(Boolean):model.roots).map(branch)}</div></div></div></>}
   {!!model.unplaced.length&&<details className="org-unplaced"><summary><GitBranch size={17} aria-hidden="true"/>{model.unplaced.length} medarbeidere venter på plassering</summary><p>Listen kommer fra firmaets aktive brukere. Firmaadmin velger avdeling, stilling og rolle for hver medarbeider.</p><div className="org-people">{model.unplaced.filter(matches).map(personButton)}</div></details>}
   <p className="org-footnote">Avdelingsleder styrer kartet i sin avdeling. Individuelt HR-innsyn følger nærmeste leder og særskilt lesetilgang. PDF inneholder organisasjonen, navn og stillinger; kontroller hvem den deles med.</p>
  </>}
  {modal&&data&&<dialog ref={dialog} className="org-dialog" onCancel={event=>{event.preventDefault();if(!busy)setModal(null);}}><form onSubmit={event=>{event.preventDefault();save(modal==='unit'?'unit':'place');}}>
   <div className="org-dialog-title"><div><small>{modal==='unit'?'Bygg organisasjonen':'Medarbeiderens plass'}</small><h3>{modal==='unit'?draft.id?'Rediger avdeling':'Ny avdeling':selected?.name}</h3></div><button type="button" className="secondary" aria-label="Lukk kartredigering" disabled={busy} onClick={()=>setModal(null)}><X size={19} aria-hidden="true"/></button></div>
   <fieldset disabled={busy||modal==='person'&&!canPlace}>
    {modal==='unit'?<><Input label="Avdelingsnavn"><input required autoFocus minLength={2} maxLength={80} placeholder="For eksempel Service eller Butikk" value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})}/></Input>
     <Input label="Plasser under"><select disabled={!admin&&Boolean(draft.id)} value={draft.parent_id} onChange={e=>setDraft({...draft,parent_id:e.target.value})}>{admin&&<option value="">Direkte under firmaet</option>}{data.units.filter(u=>u.id!==draft.id&&(admin||u.editable)).map(u=><option key={u.id} value={u.id}>{u.name}</option>)}</select></Input>
     <Input label="Avdelingsleder med redigeringstilgang"><select disabled={!admin} value={draft.manager_id} onChange={e=>setDraft({...draft,manager_id:e.target.value})}><option value="">Ingen valgt ennå</option>{data.members.filter(m=>m.can_edit_chart).map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></Input><p className="org-hint">Avdelingsrollen gir kartredigering, ikke automatisk innsyn i personalsaker.</p>
     <Input label="Avdelingsfarge"><div className="org-color-picker">{Object.entries(ORG_COLORS).map(([key,[background,color]])=><button type="button" key={key} style={{background,color}} aria-label={`Farge ${key}`} aria-pressed={draft.color===key} onClick={()=>setDraft({...draft,color:key})}><span/>{draft.color===key?'✓':''}</button>)}</div></Input></>
    :<><Input label="Avdeling"><select required value={draft.unit_id} onChange={e=>setDraft({...draft,unit_id:e.target.value})}><option value="">Velg avdeling</option>{data.units.filter(u=>admin||u.editable).map(u=><option key={u.id} value={u.id}>{u.name}</option>)}</select></Input>
     <div className="org-dialog-grid"><Input label="Stilling"><input required minLength={2} maxLength={100} value={draft.title} placeholder="For eksempel Prosjektleder" onChange={e=>setDraft({...draft,title:e.target.value})}/></Input><Input label="Rolle i kartet"><select value={draft.kind} onChange={e=>setDraft({...draft,kind:e.target.value})}>{Object.entries(ORG_KINDS).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></Input></div>
     {selected?.hr_registered&&<p className="org-hint">Lederkoblingen er felles med HR-registeret.</p>}<Input label="Nærmeste leder"><select disabled={!admin} value={draft.leader_id} onChange={e=>setDraft({...draft,leader_id:e.target.value,confirm_leader_change:false})}><option value="">Ingen valgt ennå</option>{data.members.filter(m=>m.id!==selected?.user_id&&(!selected?.hr_registered||m.can_lead_hr||m.id===selected?.leader_id)).map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></Input>
     {leaderChanged&&<div className="org-access-change"><strong>{nameFor(selected?.leader_id)} → {nameFor(draft.leader_id)}</strong><p>{selected?.hr_registered?'Ny leder får HR-historikken. Tidligere leder mister ledertilgang og eventuell særskilt lesetilgang. Firmaadmins tilgang består.':'Dette endrer lederlinjen i kartet. Medarbeideren er ikke registrert i HR.'}</p><label><input type="checkbox" checked={draft.confirm_leader_change} onChange={e=>setDraft({...draft,confirm_leader_change:e.target.checked})}/>{selected?.hr_registered?'Jeg bekrefter endringen i HR-tilgang.':'Jeg bekrefter ny nærmeste leder.'}</label></div>}
     {!admin&&<p className="org-hint">Firmaadmin bekrefter eventuelle endringer av nærmeste leder.</p>}</>}
   </fieldset>
   {error&&<p role="alert" className="org-error">{error}</p>}
   <div className="org-dialog-actions"><button type="button" className="secondary" disabled={busy} onClick={()=>setModal(null)}>Lukk</button>{(modal==='unit'||canPlace)&&<button disabled={busy||leaderChanged&&!draft.confirm_leader_change}>{busy?'Lagrer …':modal==='unit'?'Lagre avdeling':'Lagre plassering'}</button>}</div>
   {modal==='unit'&&draft.id&&<button type="button" className="org-remove" disabled={busy} onClick={()=>save('remove_unit')}>Fjern tom avdeling</button>}
   {modal==='person'&&selected?.unit_id&&canPlace&&<button type="button" className="org-remove" disabled={busy} onClick={()=>save('unplace')}>Flytt til Ikke plassert</button>}
  </form></dialog>}
 </section>;
}
