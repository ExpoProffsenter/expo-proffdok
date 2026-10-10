import React,{useEffect,useRef,useState} from 'react';
import {Network,Plus,Download,Search,ChevronDown,ChevronRight,UsersRound,GraduationCap,UserRound,Building2,BriefcaseBusiness,GitBranch,X,Pencil,RefreshCw,Save,Trash2,Eye,CheckCircle2} from 'lucide-react';
import {kshmsRpc} from '../kshms/kshmsAccess.js';
import {ORG_COLORS,ORG_KINDS,orgBranches,orgPersonRows,createOrgSession,orgFingerprint,orgLayout,orgSubtree,orgLayoutPayload,orgUnitCompany} from './orgModel.mjs';
import {MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT,publishManagedAccessChange} from '../access/moduleAccessClient.js';
import {WORK_PROFILE_EVENT} from '../access/workProfileClient.js';

import './organization.css';
import OrganizationGroups from './OrganizationGroups.jsx';

// Volatile structure draft only; fresh server access is always required before display/save.
let pendingLayout=null;
const blankUnit={id:null,name:'',parent_id:'',manager_id:'',color:'teal'};
function Input({label,children}){return <label className="org-field"><span>{label}</span>{children}</label>;}
function IconButton({icon:Icon,children,...props}){return <button type="button" {...props}><Icon size={17} aria-hidden="true"/>{children}</button>;}

export function OrganizationEditor({context,groupId=null,onDirtyChange=()=>{}}) {
 const companyId=context.company_id,userId=context.user_id,scope=`${companyId}:${userId}:${groupId||'firm'}`;
 const [view,setView]=useState('chart'),[layout,setLayout]=useState(null);
 const stage=value=>{pendingLayout=value?{scope,base:pendingLayout?.scope===scope?pendingLayout.base:orgFingerprint(data),value}:null;setLayout(value);};
 const startEditing=()=>{setView('edit');if(!layout&&data?.context.administer)stage(orgLayout(data));};
 const [receivedData,setData]=useState(null),[error,setError]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false);
 const data=receivedData?.context.company_id===companyId&&receivedData.context.user_id===userId?receivedData:null;
 const [query,setQuery]=useState(''),[filter,setFilter]=useState(''),[expanded,setExpanded]=useState(new Set()),[zoom,setZoom]=useState(100);
 const [modal,setModal]=useState(null),[draft,setDraft]=useState(blankUnit);
 const session=useRef(null),epoch=useRef(0),locked=useRef(false),dialog=useRef(null),lastFocus=useRef(null);
 const clear=()=>{setData(null);setModal(null);setDraft(blankUnit);};
 const refreshRef=useRef(null);
 useEffect(()=>{
  let alive=true;setLayout(null);if(pendingLayout?.scope!==scope)pendingLayout=null;
  const current=createOrgSession({rpc:kshmsRpc,companyId,userId,groupId,onClear:clear});session.current=current;
  const refresh=async()=>{
   const ticket=++epoch.current;current.invalidate();setError('');
   if(document.visibilityState==='hidden')return;
   try{const value=await current.read();if(alive&&ticket===epoch.current){setData(value);if(value.context.administer&&pendingLayout?.scope===scope){setLayout(pendingLayout.value);setView('edit');}else{setLayout(null);if(pendingLayout?.scope===scope)pendingLayout=null;}setFilter(previous=>value.units.some(unit=>unit.id===previous)?previous:'');}}
   catch(cause){if(alive&&ticket===epoch.current)setError(cause.message);}
  };
  refreshRef.current=refresh;void refresh();
  const events=['focus',MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT,WORK_PROFILE_EVENT];
  events.forEach(event=>window.addEventListener(event,refresh));document.addEventListener('visibilitychange',refresh);
  return()=>{alive=false;++epoch.current;current.dispose();session.current=null;refreshRef.current=null;
   events.forEach(event=>window.removeEventListener(event,refresh));document.removeEventListener('visibilitychange',refresh);};
 },[companyId,userId,groupId]);
 useEffect(()=>{
  if(modal&&dialog.current){if(typeof dialog.current.showModal==='function'&&!dialog.current.open)dialog.current.showModal();else dialog.current.open=true;dialog.current.querySelector('input:not(:disabled),select:not(:disabled)')?.focus();}
  if(!modal)lastFocus.current?.focus();
 },[modal]);
 const begin=(type,value,event)=>{if(type==='unit'&&data?.context.administer)startEditing();lastFocus.current=event.currentTarget;setDraft(value);setModal(type);setError('');setNotice('');};
 const work=async(fn)=>{
  if(locked.current||!data)return;locked.current=true;setBusy(true);setError('');setNotice('');
  const current=session.current,ticket=epoch.current;
  try{await fn(current,()=>current===session.current&&ticket===epoch.current&&document.visibilityState!=='hidden');}
  catch(cause){if(current===session.current&&ticket===epoch.current)setError(cause.message);}
  finally{locked.current=false;if(current===session.current)setBusy(false);}
 };
 const applyUnit=()=>{
  if(!layout)return;
  const unit={id:draft.id||crypto.randomUUID(),parent_id:draft.parent_id||null,name:draft.name.trim(),manager_id:draft.manager_id||null,color:draft.color,...(groupId?{company_id:draft.company_id||null}:{})};
  try{const units=layout.units.some(u=>u.id===unit.id)?layout.units.map(u=>u.id===unit.id?unit:u):[...layout.units,unit];orgLayoutPayload(data,{...layout,units});stage({...layout,units});setModal(null);setNotice('Endringen er klar. Trykk Lagre kart.');}catch(cause){setError(cause.message);}
 };
 const saveLayout=()=>work(async(current,isCurrent)=>{
  if(!layout||pendingLayout?.base!==orgFingerprint(data))throw Error('Kartet er endret av andre. Behold kladden for gjennomgang eller forkast den før du prøver på nytt.');
  const fresh=await current.command(data,'layout',orgLayoutPayload(data,layout));
  if(isCurrent()){stage(null);setData(fresh);setView('chart');setModal(null);setNotice('Kartet er lagret.');}
 });
 const removeBranch=()=>{const ids=orgSubtree(layout.units,draft.id);stage({...layout,units:layout.units.filter(u=>!ids.has(u.id))});setModal(null);setNotice('Slettingen er klar. Trykk Lagre kart for å fullføre.');};
 const save=action=>work(async(current,isCurrent)=>{
  const payload=groupId?{employee_id:draft.employee_id,company_id:selected.company_id,user_id:selected.user_id,...(action==='place'?{unit_id:draft.unit_id,title:draft.title,kind:draft.kind}:{})}:action==='unit'?{...draft,parent_id:draft.parent_id||null,manager_id:draft.manager_id||null}
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
 const admin=data?.context.administer===true;
 const shown=data&&layout?{...data,chart_name:layout.chart_name,units:layout.units.map(u=>({...u,editable:true,manager_name:data.members.find(m=>m.id===u.manager_id)?.name||null})),people:data.people.map(p=>({...p,unit_id:layout.units.some(u=>u.id===p.unit_id)?p.unit_id:null}))}:data;
 const model=shown?orgBranches(shown):null;
 const dirty=!!data&&!!layout&&JSON.stringify(layout)!==JSON.stringify(orgLayout(data));
 const conflict=!!data&&!!layout&&pendingLayout?.base!==orgFingerprint(data);
 useEffect(()=>{onDirtyChange(dirty);},[dirty,onDirtyChange]);
 const chartName=shown?.chart_name||context.company_name||'Ditt firma';
 const editable=model?[...model.units.values()].filter(unit=>unit.editable):[];
 const term=query.trim().toLocaleLowerCase('nb-NO');
 const matches=person=>!term||`${person.name} ${person.title} ${ORG_KINDS[person.kind]}`.toLocaleLowerCase('nb-NO').includes(term);
 const nameFor=id=>data?.members.find(member=>member.id===id)?.name||data?.people.find(person=>person.user_id===id)?.name||'Ingen leder valgt';
 const personButton=person=><button className={`org-person org-person-${person.kind}`} type="button" key={person.id}
  style={{'--org-depth':Math.min(person.depth||0,4)}} disabled={dirty} onClick={event=>begin('person',{
   employee_id:person.id,employee_revision:person.revision,unit_id:person.unit_id||'',title:person.title,
   kind:person.kind,leader_id:person.leader_id||'',confirm_leader_change:false},event)}>
  <span className="org-avatar">{person.kind==='apprentice'?<GraduationCap aria-hidden="true"/>:<UserRound aria-hidden="true"/>}</span>
  <span><strong>{person.name}</strong><small>{person.title}{groupId&&` · ${person.company_name}`}</small></span><span className="org-kind">{ORG_KINDS[person.kind]}</span>
 </button>;
 const branch=unit=>{
  const show=expanded.has(unit.id)||Boolean(term),people=orgPersonRows(unit.people).filter(matches);
  return <section className={`org-branch org-${unit.color}`} key={unit.id}><div className="org-unit-card">
   <div className="org-unit-head"><span className="org-unit-icon"><Building2 aria-hidden="true"/></span><div><h4>{unit.name}</h4><p>{unit.manager_name||'Avdelingsleder ikke valgt'}</p></div>
    {unit.editable&&view==='edit'&&<button type="button" className="org-edit-icon" aria-label={`Rediger ${unit.name}`} onClick={event=>begin('unit',{
     id:unit.id,name:unit.name,parent_id:unit.parent_id||'',manager_id:unit.manager_id||'',color:unit.color,company_id:unit.company_id||''},event)}><Pencil size={16} aria-hidden="true"/></button>}</div>
   <div className="org-unit-counts"><span><UsersRound size={14} aria-hidden="true"/>{unit.people.length} medarbeidere</span>
    {unit.people.some(p=>p.kind==='apprentice')&&<span><GraduationCap size={14} aria-hidden="true"/>{unit.people.filter(p=>p.kind==='apprentice').length} lærlinger</span>}</div>
   <button type="button" className="org-expand" aria-expanded={show} onClick={()=>setExpanded(previous=>{const next=new Set(previous);if(next.has(unit.id))next.delete(unit.id);else next.add(unit.id);return next;})}>
    {show?<ChevronDown size={16} aria-hidden="true"/>:<ChevronRight size={16} aria-hidden="true"/>}{show?'Skjul medarbeidere':'Vis medarbeidere'}</button>
   {show&&<div className="org-people">{people.map(personButton)}{!people.length&&<p className="org-empty-line">{term?'Ingen treff i avdelingen.':'Ingen medarbeidere plassert her ennå.'}</p>}</div>}
   </div>{!!unit.children.length&&<div className="org-subunits">{unit.children.map(branch)}</div>}
  </section>;
 };
 const selected=data?.people.find(person=>person.id===draft.employee_id);
 const canPlace=admin||Boolean(selected?.unit_id&&model?.units.get(selected.unit_id)?.editable);
 const leaderChanged=modal==='person'&&draft.leader_id!==(selected?.leader_id||'');
 return <section className="org-workspace" aria-label="Organisasjonskart">
  <div className="org-intro"><span><Network aria-hidden="true"/></span><div><h3>Organisasjonskart</h3><p>{admin?'Tilpass strukturen i Rediger kart. Lagre med Lagre kart.':'Menneskene og avdelingene i firmaet.'} Åpne kortene for å se medarbeidere.</p></div></div>
  <div className="org-stats"><div><Building2 aria-hidden="true"/><strong>{shown?.units.length??'–'}</strong><span>avdelinger</span></div><div><UsersRound aria-hidden="true"/><strong>{data?new Set(data.people.map(p=>p.user_id)).size:'–'}</strong><span>medarbeidere</span></div><div><GraduationCap aria-hidden="true"/><strong>{data?.people.filter(p=>p.kind==='apprentice').length??'–'}</strong><span>lærlinger</span></div><div><GitBranch aria-hidden="true"/><strong>{model?.unplaced.length??'–'}</strong><span>ikke plassert</span></div></div>
  {error&&<p className="org-message org-error" role="alert">{error} <button type="button" onClick={()=>void refreshRef.current?.()}>Hent kartet på nytt</button></p>}
  {notice&&<p className="org-message" role="status">{notice}</p>}
  {!data&&!error&&<p role="status">Henter firmaets organisasjon …</p>}
  {data&&<><div className="org-viewbar"><div className="org-view-tabs" role="group" aria-label="Kartvisning"><IconButton icon={Eye} className={view==='chart'?'active':'secondary'} disabled={busy} onClick={()=>setView('chart')}>Vis kart</IconButton>{(admin||editable.length>0)&&<IconButton icon={Pencil} className={view==='edit'?'active':'secondary'} disabled={busy} onClick={startEditing}>Rediger kart</IconButton>}</div><span className={`org-save-status ${dirty?'pending':''}`}><CheckCircle2 size={16} aria-hidden="true"/>{dirty?'Ulagrede endringer':'Lagret på firmaet'}</span>{admin&&layout&&<><IconButton icon={Save} disabled={busy||conflict||!dirty} onClick={saveLayout}>Lagre kart</IconButton><button type="button" className="secondary" disabled={busy} onClick={()=>{stage(null);setView('chart');setError('');setNotice('Endringene er forkastet. Lagret kart vises.');}}>Forkast endringer</button></>}</div>
   {conflict&&<p role="alert" className="org-error">En annen endring er lagret. Kladden er beholdt for gjennomgang, men kan ikke overskrive den nye utgaven. Forkast endringer for å starte fra det oppdaterte kartet.</p>}
   {view==='edit'&&<section className="org-builder" aria-label="Rediger kartstruktur"><fieldset disabled={busy}><div className="org-builder-header"><div><h4>Bygg strukturen</h4><p>{admin?'Velg hvor hvert kort hører hjemme. Bruk endring legger det i kladden. Lagre kart lagrer hele strukturen.':'Du kan redigere avdelinger i din gren. Lagre avdeling lagrer det ene kortet.'}</p></div><IconButton icon={Plus} onClick={event=>begin('unit',{...blankUnit,parent_id:admin?'':editable[0]?.id||''},event)}>Ny avdeling</IconButton></div>
    {admin&&layout&&<label className="org-root-name"><span>Navn øverst i kartet</span><input aria-label="Navn øverst i kartet" maxLength={100} value={layout.chart_name} onChange={event=>stage({...layout,chart_name:event.target.value})}/><small>For eksempel Ringside. {groupId?'Felles kart for de tilknyttede firmaene.':'Data lagres på '+context.company_name+'; dette bytter ikke firma.'}</small></label>}
    <div className="org-structure-list">{(()=>{const rows=[];const visit=(unit,depth)=>{rows.push({unit,depth});unit.children.forEach(child=>visit(child,depth+1));};model.roots.forEach(unit=>visit(unit,0));return rows.map(({unit,depth})=><div className="org-structure-row" key={unit.id} style={{'--org-level':depth}}><span className="org-row-icon"><Building2 size={18} aria-hidden="true"/></span><div><strong>{unit.name}</strong><small>{unit.parent_id?`Under ${model.units.get(unit.parent_id)?.name}`:`Under ${chartName}`} · {unit.people.length} medarbeidere</small></div>{unit.editable&&<><IconButton icon={Pencil} className="secondary" aria-label={`Rediger eller flytt ${unit.name}`} onClick={event=>begin('unit',{id:unit.id,name:unit.name,parent_id:unit.parent_id||'',manager_id:unit.manager_id||'',color:unit.color,company_id:unit.company_id||''},event)}>Rediger / flytt</IconButton><IconButton icon={Trash2} className="secondary org-danger" disabled={!admin&&(unit.people.length>0||unit.children.length>0)} aria-label={`Slett ${unit.name}`} onClick={event=>begin(admin?'remove':'unit',{id:unit.id,name:unit.name,parent_id:unit.parent_id||'',manager_id:unit.manager_id||'',color:unit.color,company_id:unit.company_id||''},event)}>Slett</IconButton></>}</div>);})()}</div>
    {!shown.units.length&&<p className="org-hint">Opprett for eksempel Styret direkte under toppen, deretter virksomhetene under Styret. Velg samme Plasser under for kort som skal stå ved siden av hverandre.</p>}
   </fieldset></section>}
   <div className="org-toolbar"><label className="org-search"><Search size={18} aria-hidden="true"/><input aria-label="Søk i organisasjonskart" type="search" placeholder="Finn person, stilling eller lærling" value={query} onChange={event=>setQuery(event.target.value)}/></label>
   <select aria-label="Vis avdeling" value={filter} onChange={event=>setFilter(event.target.value)}><option value="">Hele firmaet</option>{shown.units.map(unit=><option key={unit.id} value={unit.id}>{unit.name}</option>)}</select>
   <IconButton icon={RefreshCw} className="secondary" disabled={busy} onClick={()=>void refreshRef.current?.()}>Oppdater</IconButton>
   <IconButton icon={Download} className="secondary" disabled={busy||dirty} onClick={download}>Last ned PDF</IconButton>
   {view!=='edit'&&(admin||editable.length>0)&&<IconButton icon={Plus} disabled={busy} onClick={event=>begin('unit',{...blankUnit,parent_id:admin?'':editable[0].id},event)}>Ny avdeling</IconButton>}</div>
   {!shown.units.length?<div className="org-onboarding"><span className="org-onboarding-icon"><Network aria-hidden="true"/></span><h3>Bygg et kart som passer dere</h3><p>Start med firmaets avdelinger. Legg til underavdelinger, velg ledere og plasser medarbeiderne når strukturen er klar.</p>
    <div className="org-onboarding-steps"><span><b>1</b>Avdelinger</span><span><b>2</b>Ledere og stillinger</span><span><b>3</b>Ansatte og lærlinger</span></div>
    {admin&&<IconButton icon={Plus} onClick={event=>begin('unit',blankUnit,event)}>Legg til første avdeling</IconButton>}</div>
   :<><div className="org-canvas-toolbar"><span><Network size={16} aria-hidden="true"/>Firmaets struktur</span><div><button type="button" aria-label="Zoom ut" disabled={zoom<=70} onClick={()=>setZoom(Math.max(70,zoom-10))}>−</button><button type="button" onClick={()=>setZoom(100)}>{zoom}%</button><button type="button" aria-label="Zoom inn" disabled={zoom>=130} onClick={()=>setZoom(Math.min(130,zoom+10))}>+</button></div></div>
    <div className="org-canvas" tabIndex={0} aria-label="Kartflate, rull inne i kartet ved behov"><div className="org-map" style={{zoom:zoom/100}}>
     <div className="org-company-node"><span><BriefcaseBusiness aria-hidden="true"/></span><strong>{chartName}</strong><small>{new Set(data.people.map(p=>p.user_id)).size} personer · {shown.units.length} avdelinger</small></div>
     <div className="org-root-branches">{(filter?[model.units.get(filter)].filter(Boolean):model.roots).map(branch)}</div></div></div></>}
   {!!model.unplaced.length&&<details className="org-unplaced"><summary><GitBranch size={17} aria-hidden="true"/>{model.unplaced.length} medarbeidere venter på plassering</summary><p>Listen kommer fra firmaets aktive brukere. Firmaadmin velger avdeling, stilling og rolle for hver medarbeider.</p><div className="org-people">{model.unplaced.filter(matches).map(personButton)}</div></details>}
   <p className="org-footnote">{dirty&&'Lagre eller forkast strukturendringene før du plasserer medarbeidere eller laster ned PDF. '}{groupId?'Felleskartet krever KS/HMS i alle tilknyttede firmaer. Firmaadmin i alle firmaene redigerer kartet. Kartroller endrer ikke nærmeste leder.':'Avdelingsleder styrer kartet i sin avdeling.'} Individuelt HR-innsyn følger nærmeste leder og særskilt lesetilgang. PDF inneholder organisasjonen, navn og stillinger; kontroller hvem den deles med.</p>
  </>}
  {modal&&data&&<dialog ref={dialog} className="org-dialog" onCancel={event=>{event.preventDefault();if(!busy)setModal(null);}}><form onSubmit={event=>{event.preventDefault();if(modal==='remove')removeBranch();else if(modal==='unit'&&admin)applyUnit();else save(modal==='unit'?'unit':'place');}}>
   <div className="org-dialog-title"><div><small>{modal==='remove'?'Slett fra kartet':modal==='unit'?'Bygg organisasjonen':'Medarbeiderens plass'}</small><h3>{modal==='remove'?`Slett ${draft.name}?`:modal==='unit'?draft.id?'Rediger avdeling':'Ny avdeling':selected?.name}</h3></div><button type="button" className="secondary" aria-label="Lukk kartredigering" disabled={busy} onClick={()=>setModal(null)}><X size={19} aria-hidden="true"/></button></div>
   <fieldset disabled={busy||modal==='person'&&!canPlace}>
    {modal==='remove'?<div className="org-delete-review"><p>Dette fjerner avdelingen og dens underavdelinger fra kartet. Berørte medarbeidere flyttes til <strong>Ikke plassert</strong>. Stillinger, nærmeste leder og HR beholdes.</p><p><strong>{orgSubtree(layout.units,draft.id).size} kort</strong> og <strong>{data.people.filter(p=>orgSubtree(layout.units,draft.id).has(p.unit_id)).length} medarbeidere</strong> berøres. Slettingen skjer først når du trykker Lagre kart.</p></div>:modal==='unit'?<><Input label="Avdelingsnavn"><input required autoFocus minLength={2} maxLength={80} placeholder="For eksempel Service eller Butikk" value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})}/></Input>
     <Input label="Plasser under"><select disabled={!admin&&Boolean(draft.id)} value={draft.parent_id} onChange={e=>setDraft({...draft,parent_id:e.target.value})}>{admin&&<option value="">Direkte under firmaet</option>}{shown.units.filter(u=>!orgSubtree(shown.units,draft.id).has(u.id)&&(admin||u.editable)).map(u=><option key={u.id} value={u.id}>{u.name}</option>)}</select></Input>
     {groupId&&<Input label="Firma i kartet"><select value={draft.company_id||''} onChange={e=>setDraft({...draft,company_id:e.target.value,manager_id:''})}><option value="">Felles nivå / arver fra overordnet</option>{data.companies.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></Input>}<Input label={groupId?"Kartleder":"Avdelingsleder med redigeringstilgang"}><select disabled={!admin} value={draft.manager_id} onChange={e=>setDraft({...draft,manager_id:e.target.value})}><option value="">Ingen valgt ennå</option>{data.members.filter(m=>m.can_edit_chart&&(!groupId||(draft.company_id||orgUnitCompany(shown.units,draft.parent_id)?m.company_ids?.includes(draft.company_id||orgUnitCompany(shown.units,draft.parent_id)):m.company_ids?.length===data.companies.length))).map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></Input><p className="org-hint">{groupId?'Kartleder er en rolle i kartet. Firmaadmin i alle firmaene styrer redigering.':'Avdelingsrollen gir kartredigering, ikke automatisk innsyn i personalsaker.'}</p>
     <Input label="Avdelingsfarge"><div className="org-color-picker">{Object.entries(ORG_COLORS).map(([key,[background,color]])=><button type="button" key={key} style={{background,color}} aria-label={`Farge ${key}`} aria-pressed={draft.color===key} onClick={()=>setDraft({...draft,color:key})}><span/>{draft.color===key?'✓':''}</button>)}</div></Input></>
    :<><Input label="Avdeling"><select required value={draft.unit_id} onChange={e=>setDraft({...draft,unit_id:e.target.value})}><option value="">Velg avdeling</option>{data.units.filter(u=>(admin||u.editable)&&(!groupId||orgUnitCompany(data.units,u.id)===selected?.company_id)).map(u=><option key={u.id} value={u.id}>{u.name}</option>)}</select></Input>
     <div className="org-dialog-grid"><Input label="Stilling"><input required minLength={2} maxLength={100} value={draft.title} placeholder="For eksempel Prosjektleder" onChange={e=>setDraft({...draft,title:e.target.value})}/></Input><Input label="Rolle i kartet"><select value={draft.kind} onChange={e=>setDraft({...draft,kind:e.target.value})}>{Object.entries(ORG_KINDS).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></Input></div>
     {groupId&&<p className="org-hint">{selected?.company_name}. Stillingen gjelder denne firmagrenen. Kartet endrer ikke HR eller nærmeste leder.</p>}{selected?.hr_registered&&<p className="org-hint">Lederkoblingen er felles med HR-registeret.</p>}{!groupId&&<Input label="Nærmeste leder"><select disabled={!admin} value={draft.leader_id} onChange={e=>setDraft({...draft,leader_id:e.target.value,confirm_leader_change:false})}><option value="">Ingen valgt ennå</option>{data.members.filter(m=>m.id!==selected?.user_id&&(!selected?.hr_registered||m.can_lead_hr||m.id===selected?.leader_id)).map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></Input>}
     {leaderChanged&&<div className="org-access-change"><strong>{nameFor(selected?.leader_id)} → {nameFor(draft.leader_id)}</strong><p>{selected?.hr_registered?'Ny leder får HR-historikken. Tidligere leder mister ledertilgang og eventuell særskilt lesetilgang. Firmaadmins tilgang består.':'Dette endrer lederlinjen i kartet. Medarbeideren er ikke registrert i HR.'}</p><label><input type="checkbox" checked={draft.confirm_leader_change} onChange={e=>setDraft({...draft,confirm_leader_change:e.target.checked})}/>{selected?.hr_registered?'Jeg bekrefter endringen i HR-tilgang.':'Jeg bekrefter ny nærmeste leder.'}</label></div>}
     {!admin&&<p className="org-hint">Firmaadmin bekrefter eventuelle endringer av nærmeste leder.</p>}</>}
   </fieldset>
   {error&&<p role="alert" className="org-error">{error}</p>}
   <div className="org-dialog-actions"><button type="button" className="secondary" disabled={busy} onClick={()=>setModal(null)}>Lukk</button>{(modal==='remove'||modal==='unit'||canPlace)&&<button disabled={busy||leaderChanged&&!draft.confirm_leader_change}>{busy?'Lagrer …':modal==='remove'?'Slett fra kladden':modal==='unit'?admin?'Bruk endring':'Lagre avdeling':'Lagre plassering'}</button>}</div>
   {modal==='unit'&&draft.id&&!admin&&<button type="button" className="org-remove" disabled={busy} onClick={()=>save('remove_unit')}>Fjern tom avdeling</button>}
   {modal==='person'&&selected?.unit_id&&canPlace&&<button type="button" className="org-remove" disabled={busy} onClick={()=>save('unplace')}>Flytt til Ikke plassert</button>}
  </form></dialog>}
 </section>;
}

export default function OrganizationChart({context}){return <OrganizationGroups context={context} Editor={OrganizationEditor}/>;}
