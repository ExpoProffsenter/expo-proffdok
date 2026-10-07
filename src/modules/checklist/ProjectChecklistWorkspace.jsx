import {useEffect,useRef,useState} from 'react';
import DeviationDialog from '../deviations/DeviationDialog.jsx';
import {kshmsRpc} from '../kshms/kshmsAccess.js';
import {identityText} from '../kshms/kshmsPersonal.mjs';
import {MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT} from '../access/moduleAccessClient.js';
import {WORK_PROFILE_EVENT} from '../access/workProfileClient.js';
import {answersForDefinition,checklistRunDraftKey,commitChecklistRun,completionProblem,currentRunAnswers,readRunDraft,runDefinition} from './checklistRuns.mjs';
import './projectChecklistWorkspace.css';

export default function ProjectChecklistWorkspace({Editor,companyId,userId,projectId,checklist,activeChecklistTemplate,instances=[],readOnly=false,customChecklistAllowed=false,isWarrantyPoint=()=>false,onSaved,uploadImages,...editorProps}) {
 const [data,setData]=useState(null),[selected,setSelected]=useState(null),[expanded,setExpanded]=useState({}),[error,setError]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false),[uploads,setUploads]=useState(0);
 const owner=useRef(null),locked=useRef(false),selection=useRef(null),cached=useRef(new Map());
 selection.current=selected;
 const current=scope=>scope?.active&&owner.current===scope;
 const key=category=>checklistRunDraftKey(userId,companyId,projectId,category);
 const remember=value=>{
  if(value.readOnly)return true;
  try {window.localStorage.setItem(key(value.definition.category),JSON.stringify(value));cached.current.set(value.definition.category,value);return true;}
  catch {setError('Kladden kunne ikke sikres på denne enheten. Behold popupen åpen til listen er lagret.');return false;}
 };
 const load=async scope=>{
  if(!projectId||!companyId||!userId)return {runs:[],checklist};
  const state=await kshmsRpc('project_checklist_state',{p_company_id:companyId,p_project_id:projectId});
  if(!current(scope))return null;
  if(state.context?.company_id!==companyId||state.context.project_id!==projectId||state.context.user_id!==userId)throw new Error('Prosjektets firmatilgang er endret.');
  setData(state);return state;
 };
 useEffect(()=>{
  const scope={active:true};owner.current=scope;cached.current=new Map();setData(null);setSelected(null);setExpanded({});setError('');setNotice('');setBusy(false);
  const refresh=event=>{
   if(event?.type===WORK_PROFILE_EVENT&&event.detail?.active_company_id!==companyId){scope.active=false;owner.current=null;setSelected(null);setData(null);return;}
   load(scope).catch(cause=>{if(current(scope))setError(cause.message);});
  };
  refresh();const events=['focus',MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT,WORK_PROFILE_EVENT];events.forEach(event=>window.addEventListener(event,refresh));
  return()=>{scope.active=false;events.forEach(event=>window.removeEventListener(event,refresh));};
 },[companyId,userId,projectId]);
 const select=value=>{selection.current=value;setSelected(value);setError('');setNotice('');};
 const begin=async(group,{fresh=false,run=null,viewSaved=false,followPoint=null}={})=>{
  if(locked.current)return;
  const scope=owner.current;locked.current=true;setBusy(true);setError('');
  try {
   const state=await load(scope);if(!state||!current(scope))return;
   const latest=state.runs.find(value=>value.category===group.category);
   const saved=run||latest;
   if(followPoint&&saved?.status==='completed'&&state.checklist?.[group.category]?.[followPoint]?.status==='Avvik'&&!state.checklist?.[group.category]?.[followPoint]?.ks_deviation_id&&!readOnly)fresh=true;
   if(run||viewSaved){
    select({...saved,definition:saved.definition,answers:currentRunAnswers(saved,state.checklist),readOnly:true});return;
   }
   const local=readRunDraft(window.localStorage,key(group.category));
   const meaningfulLocal=local&&(local.pendingAction||Object.values(local.answers).some(answer=>answer?.status||answer?.comment||answer?.photos?.length));
   if(!fresh&&local&&!readOnly&&(meaningfulLocal||!latest)){
    const definition=!local.pendingAction&&group.category.startsWith('Egne sjekkpunkter')?{...local.definition,items:[...new Set([...local.definition.items,...group.items])]}:local.definition;
    select({...local,definition,answers:answersForDefinition(definition,local.answers)});
    if(latest&&(latest.id!==local.id||latest.revision!==local.revision))setError('Det finnes en nyere lagret kontroll. Din kladd er beholdt. Bruk «Vis lagret kontroll» for å sammenligne.');return;
   }
   if(!fresh&&saved?.status==='completed'){
    select({...saved,answers:saved.answers,readOnly:true});return;
   }
   if(fresh&&meaningfulLocal){select(local);setNotice('Du har en kladd til denne sjekklisten. Lagre eller fullfør den før du starter en ny kontroll.');return;}
   if(saved?.status==='draft'){
    const definition=group.category.startsWith('Egne sjekkpunkter')?{...saved.definition,items:[...new Set([...saved.definition.items,...group.items])]}:saved.definition;
    select({...saved,definition,answers:answersForDefinition(definition,currentRunAnswers(saved,state.checklist)),requestId:crypto.randomUUID(),readOnly});
    if(fresh)setNotice('En kontroll er allerede påbegynt. Du fortsetter den lagrede kontrollen.');return;
   }
   const definition=runDefinition(group,instances,isWarrantyPoint(group.category));
   const value={id:crypto.randomUUID(),revision:0,predecessor_id:latest?.id||null,definition,answers:answersForDefinition(definition,state.checklist?.[group.category]||checklist?.[group.category],fresh),requestId:crypto.randomUUID(),readOnly};
   select(value);if(!readOnly)remember(value);
  } catch(cause){if(current(scope))setError(cause.message);}
  finally{locked.current=false;if(current(scope))setBusy(false);}
 };
 const beginRef=useRef(begin);beginRef.current=begin;
 useEffect(()=>{
  const jump=()=>{
   try {
    const value=JSON.parse(window.sessionStorage.getItem('expoProffDokChecklistJumpTarget'));
    const group=activeChecklistTemplate.find(row=>row.category===value?.category);if(!group)return;
    window.sessionStorage.removeItem('expoProffDokChecklistJumpTarget');beginRef.current(group,{followPoint:value.item});
   }catch { /* A missing navigation target does not affect the draft. */ }
  };
  jump();window.addEventListener('expoProffDokChecklistJump',jump);return()=>window.removeEventListener('expoProffDokChecklistJump',jump);
 },[activeChecklistTemplate]);
 const change=(category,item,patch)=>{
  const value=selection.current;if(!value||value.readOnly||readOnly||locked.current||value.pendingAction)return;
  const next={...value,answers:{...value.answers,[item]:{...value.answers[item],...patch}},requestId:crypto.randomUUID()};
  selection.current=next;setSelected(next);remember(next);setError('');
 };
 const addPhoto=async(category,item,files)=>{
  const value=selection.current,scope=owner.current;
  if(!value||value.readOnly||readOnly||locked.current||value.pendingAction)return;
  setUploads(count=>count+1);
  try {const photos=await uploadImages(files,'sjekklister');
   if(current(scope)&&selection.current?.id===value.id&&photos.length)change(category,item,{photos:[...(selection.current.answers[item]?.photos||[]),...photos]});
  }catch(cause){if(current(scope))setError(cause.message);}
  finally{if(current(scope))setUploads(count=>count-1);}
 };
 const save=async action=>{
  const value=selection.current,scope=owner.current;
  if(!value||value.readOnly||readOnly||locked.current||uploads)return;
  if(!companyId||!projectId){setError('Lagre ordren eller prosjektet først. Kladden er beholdt.');remember(value);return;}
  const actual=value.pendingAction||action,problem=actual==='complete'?completionProblem(value.definition,value.answers):'';
  if(problem){setError(problem);return;}
  const attempt={...value,pendingAction:actual};remember(attempt);selection.current=attempt;setSelected(attempt);locked.current=true;setBusy(true);setError('');
  try {
   const result=await commitChecklistRun({companyId,userId,projectId,draft:attempt,action:actual,rpc:kshmsRpc,isCurrent:()=>current(scope)});
   if(!result||!current(scope))return;
   await onSaved(result.run.category,result.answers);
   if(!current(scope))return;
   window.localStorage.removeItem(key(result.run.category));cached.current.delete(result.run.category);setData(result.state);
   const next={...result.run,answers:result.run.answers,requestId:crypto.randomUUID(),readOnly:actual==='complete'};
   selection.current=next;setSelected(next);setNotice(actual==='complete'?'Sjekklisten er fullført og lagret. Start en ny kontroll neste gang.':'Sjekklisten er lagret. Flere personer kan fortsette kontrollen.');
  }catch(cause){if(current(scope)){
   setError(cause.message);
   if(cause.code){const next={...value,requestId:crypto.randomUUID()};selection.current=next;setSelected(next);remember(next);}
  }}finally{locked.current=false;if(current(scope))setBusy(false);}
 };
 const dismiss=()=>{
  if(locked.current||uploads)return;
  const value=selection.current;if(value&&!remember(value))return;
  setSelected(null);selection.current=null;
 };
 const continueSaved=async()=>{
  const value=selection.current,scope=owner.current;
  if(!value||readOnly||locked.current)return;
  locked.current=true;setBusy(true);setError('');
  try {
   const state=await load(scope);if(!state||!current(scope))return;
   const latest=state.runs.find(row=>row.category===value.definition.category);
   if(!latest||latest.status!=='draft')throw new Error('Denne kontrollen er allerede fullført. Åpne den fullførte kontrollen og start en ny.');
   const local=readRunDraft(window.localStorage,key(latest.category));
   if(local)window.localStorage.setItem(key(latest.category)+':previous',JSON.stringify(local));
   const next={...latest,answers:currentRunAnswers(latest,state.checklist),requestId:crypto.randomUUID(),readOnly:false};
   if(!remember(next))return;
   select(next);setNotice(local?'Du fortsetter den lagrede kontrollen. Din tidligere kladd kan fortsatt vises.':'Du fortsetter den lagrede kontrollen.');
  }catch(cause){if(current(scope))setError(cause.message);}
  finally{locked.current=false;if(current(scope))setBusy(false);}
 };
 const groups=activeChecklistTemplate;
 const historical=(data?.runs||[]).filter(value=>value.status==='completed');
 const previousGroups=Object.entries(data?.checklist||checklist||{}).filter(([category,answers])=>!groups.some(group=>group.category===category)&&Object.values(answers||{}).some(answer=>answer?.status||answer?.comment||answer?.photos?.length));
 const title=definition=>definition.category.replace(/^KS\/HMS sjekkliste – /,'');
 return <div className="project-checklist-workspace">
  <p className="note">Åpne en sjekkliste for å fylle den ut. «Lagre» lar deg eller en kollega fortsette senere. «Sjekkliste fullført» lagrer en ferdig kontroll.</p>
  {!selected&&error&&<p role="alert" className="ks-error">{error}</p>}
  <details className="item"><summary>Egne sjekkpunkter og vedlegg</summary><fieldset disabled={readOnly}><Editor {...editorProps} checklist={checklist} activeChecklistTemplate={[]} customChecklistEnabled={customChecklistAllowed} toolsOnly consumeChecklistJump={false}/></fieldset></details>
  {!groups.length&&<p>Ingen sjekklister er lagt til. Legg til egne sjekkpunkter, eller hent en publisert liste fra KS/HMS når firmaet har tilgang.</p>}
  {groups.map(group=>{
   const latest=data?.runs?.find(run=>run.category===group.category),answers=latest?.answers||checklist?.[group.category]||{},done=group.items.filter(item=>answers[item]?.status).length;
   return <article className="item project-checklist-card" key={group.category}>
    <button type="button" className="secondary project-checklist-heading" aria-expanded={!!expanded[group.category]} onClick={()=>setExpanded(value=>({...value,[group.category]:!value[group.category]}))}>
     <span aria-hidden="true">{expanded[group.category]?'▾':'▸'}</span><b>{title(group)}</b><span>{done}/{group.items.length} vurdert · {latest?.status==='completed'?'Fullført':done?'Pågår':'Ikke påbegynt'}</span>
    </button>
    <div className="project-checklist-card-actions"><button type="button" disabled={busy} onClick={()=>begin(group)}>{latest?.status==='completed'?'Åpne fullført sjekkliste':'Åpne sjekkliste'}</button></div>
    {expanded[group.category]&&<div><p>{group.instructions||'Kontroller punktene og legg til dokumentasjon der det trengs.'}</p><ul>{group.items.map(item=><li key={item}>{item}</li>)}</ul>
     {latest?.updated_identity&&<p className="note">Sist lagret av {identityText(latest.updated_identity)} · {new Date(latest.updated_at).toLocaleString('nb-NO')}</p>}
     {historical.filter(run=>run.category===group.category).map(run=><button type="button" className="secondary" key={run.id} disabled={busy} onClick={()=>begin(group,{run})}>Fullført {new Date(run.completed_at).toLocaleString('nb-NO')} · {identityText(run.completed_identity)}</button>)}
    </div>}
   </article>;
  })}
  {!!previousGroups.length&&<details className="item"><summary>Tidligere dokumentasjon</summary><p>Lagrede svar fra lister som ikke brukes her nå, er beholdt.</p>{previousGroups.map(([category,answers])=><button type="button" className="secondary" key={category} onClick={()=>select({id:`legacy:${category}`,definition:{category,items:Object.keys(answers)},answers,readOnly:true})}>{category}</button>)}</details>}
  {selected&&<DeviationDialog title={title(selected.definition)} context={selected.readOnly?'Lagret kontroll':`Kontroll under arbeid${selected.revision?' · lagret versjon '+selected.revision:''}`} onClose={dismiss} busy={busy||uploads>0} closeLabel="Lukk sjekklistedialog">
   {error&&<p role="alert" className="ks-error">{error}</p>}{notice&&<p role="status" className="ks-notice">{notice}</p>}
   {selected.completed_identity&&<p>Fullført av {identityText(selected.completed_identity)} · {new Date(selected.completed_at).toLocaleString('nb-NO')}</p>}
   <fieldset disabled={readOnly||selected.readOnly||busy||uploads>0||!!selected.pendingAction}><Editor {...editorProps} key={selected.id} embedded initiallyExpanded consumeChecklistJump={false} customChecklistEnabled={false} showOpenDeviationsOnly={false} setShowOpenDeviationsOnly={null} activeChecklistTemplate={[selected.definition]} checklist={{[selected.definition.category]:selected.answers}} setChecklistValue={change} addChecklistPhoto={addPhoto} onOpenKshmsDeviation={editorProps.onOpenKshmsDeviation?id=>{if(remember(selection.current)){setSelected(null);selection.current=null;editorProps.onOpenKshmsDeviation(id);}}:null}/></fieldset>
   <div className="project-checklist-footer">
    {!selected.readOnly&&!readOnly&&<><button type="button" disabled={busy||uploads>0} onClick={()=>save('save')}>{selected.pendingAction?'Prøv lagring igjen':'Lagre'}</button><button type="button" disabled={busy||uploads>0||!!selected.pendingAction} onClick={()=>save('complete')}>Sjekkliste fullført</button></>}
    {selected.readOnly&&selected.status==='completed'&&!readOnly&&groups.some(group=>group.category===selected.definition.category)&&<button type="button" disabled={busy} onClick={()=>begin(groups.find(group=>group.category===selected.definition.category),{fresh:true})}>Start ny kontroll</button>}
    {!selected.readOnly&&data?.runs?.some(run=>run.category===selected.definition.category)&&<button type="button" className="secondary" disabled={busy} onClick={()=>begin(selected.definition,{viewSaved:true})}>Vis lagret kontroll</button>}
    {selected.readOnly&&selected.status==='draft'&&!readOnly&&!selected.earlierDraft&&<button type="button" disabled={busy} onClick={continueSaved}>Fortsett med lagret kontroll</button>}
    {readRunDraft(window.localStorage,key(selected.definition.category)+':previous')&&!selected.earlierDraft&&<button type="button" className="secondary" disabled={busy} onClick={()=>select({...readRunDraft(window.localStorage,key(selected.definition.category)+':previous'),readOnly:true,earlierDraft:true})}>Vis tidligere kladd</button>}
    {selected.readOnly&&readRunDraft(window.localStorage,key(selected.definition.category))&&!readOnly&&<button type="button" className="secondary" onClick={()=>select(readRunDraft(window.localStorage,key(selected.definition.category)))}>Tilbake til kladden</button>}
    <button type="button" className="secondary" disabled={busy||uploads>0} onClick={dismiss}>Lukk</button>
   </div>
   {!selected.readOnly&&<p className="note">Fullført kontroll lukker ikke åpne avvik. De følges opp under Avvik.</p>}
  </DeviationDialog>}
 </div>;
}
