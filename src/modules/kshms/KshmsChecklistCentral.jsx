import { useEffect,useId,useRef,useState } from 'react';
import { kshmsRpc } from './kshmsAccess.js';
import DeviationDialog from '../deviations/DeviationDialog.jsx';
import { CHECKLIST_TRADES,blankChecklist,checklistDraftKey,persistChecklistDraft,readChecklistDraft,sameChecklistContent,saveChecklistTemplate } from './kshmsChecklists.mjs';
import './kshmsChecklists.css';
import KshmsDocumentPdfButton from './KshmsDocumentPdfButton.jsx';

function Field({label,value,onChange,multiline=false,maxLength=600}) {
 const id=useId();
 return <label className="ks-field" htmlFor={id}><span>{label}</span>{multiline?<textarea id={id} rows={3} maxLength={maxLength} value={value||''} onChange={e=>onChange(e.target.value)}/>:<input id={id} maxLength={maxLength} value={value||''} onChange={e=>onChange(e.target.value)}/>}</label>;
}
export default function KshmsChecklistCentral({context,active=true}) {
 const companyId=context.company_id,userId=context.user_id;
 const [data,setData]=useState(null),[editor,setEditor]=useState(null),[cached,setCached]=useState(null),[dirty,setDirty]=useState(false);
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[query,setQuery]=useState(''),[trade,setTrade]=useState('');
 const scopeRef=useRef(null),locked=useRef(false);
 const current=scope=>scope?.active&&scopeRef.current===scope;
 const load=async()=>{
  const scope=scopeRef.current;const state=await kshmsRpc('kshms_checklist_state',{p_company_id:companyId});
  if(!current(scope))return null;
  if(state.context?.company_id!==companyId||state.context.user_id!==userId||!state.context.manage)throw new Error('Tilgangen til firmaets sjekklister er endret.');
  setData(state);return state;
 };
 useEffect(()=>{const scope={active:true};scopeRef.current=scope;
  setCached(readChecklistDraft(window.localStorage,userId,companyId));
  load().catch(cause=>{if(current(scope))setError(cause.message);});
  return()=>{scope.active=false;};
 },[companyId,userId]);
 useEffect(()=>{const warn=event=>{if(dirty){event.preventDefault();event.returnValue='';}};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);},[dirty]);
 const cache=next=>{
  setEditor(next);setDirty(true);setNotice('');
  try{persistChecklistDraft(window.localStorage,userId,companyId,next);setCached(next);}catch{setError('Kladden kunne ikke sikres på denne enheten. La dialogen stå åpen og lagre når forbindelsen virker.');}
 };
 const change=content=>cache({...editor,requestId:crypto.randomUUID(),content});
 const choose=row=>{
  if(busy)return;
  if(cached&&cached.id!==row?.id&&!window.confirm('Åpne en annen sjekkliste? Det lokale utkastet erstattes når du skriver i den nye.'))return;
  const recovered=row&&cached?.id===row.id?cached:null;
  setEditor(recovered||(row?{id:row.id,revision:row.revision,requestId:crypto.randomUUID(),content:row.draft}:blankChecklist()));
  setDirty(Boolean(recovered));setError('');setNotice('');
 };
 const save=async action=>{
  if(locked.current||!editor)return;
  const scope=scopeRef.current;if(!current(scope))return;
  locked.current=true;setBusy(true);setError('');setNotice('');
  try{
   const saved=await saveChecklistTemplate({companyId,userId,editor,action,rpc:kshmsRpc,isCurrent:()=>current(scope)});
   if(!saved||!current(scope))return;
   setData(saved.state);setDirty(false);setCached(null);
   window.localStorage.removeItem(checklistDraftKey(userId,companyId));
   setNotice(action==='publish'?`«${saved.template.draft.title}» er publisert som versjon ${saved.version.number}. Den kan nå hentes under Sjekklister i generelle ordrer og under Fag/utstyr i våtromsprosjekter.`:'Utkastet er lagret. Publiser når sjekklisten er klar for prosjekter.');
   setEditor(action==='publish'?null:{id:saved.template.id,revision:saved.template.revision,requestId:crypto.randomUUID(),content:saved.template.draft});
  }catch(cause){if(current(scope)){if(cause.code==='40001'){try{await load();}catch{}setError('En annen person har endret sjekklisten. Din kladd er beholdt. Sammenlign teksten under før du lagrer igjen.');}else setError(`${cause.message} Kladden er beholdt.`);}}
  finally{locked.current=false;if(current(scope))setBusy(false);}
 };
 const archive=async row=>{
  if(locked.current||!window.confirm('Arkivere sjekklisten? Den kan ikke hentes inn på nytt. Kopier som allerede finnes i prosjekter, beholdes.'))return;
  const scope=scopeRef.current;locked.current=true;setBusy(true);setError('');
  try{await kshmsRpc('kshms_checklist_command',{p_company_id:companyId,p_action:'archive',p_request_id:crypto.randomUUID(),p_payload:{id:row.id,revision:row.revision}});const state=await load();if(current(scope)&&state?.templates.some(item=>item.id===row.id&&item.archived))setNotice('Sjekklisten er arkivert. Prosjektenes utgaver er beholdt.');}
  catch(cause){if(current(scope))setError(cause.message);}
  finally{locked.current=false;if(current(scope))setBusy(false);}
 };
 const pointChange=(id,key,value)=>change({...editor.content,points:editor.content.points.map(point=>point.id===id?{...point,[key]:value}:point)});
 const move=(index,direction)=>{const points=[...editor.content.points],target=index+direction;if(target<0||target>=points.length)return;[points[index],points[target]]=[points[target],points[index]];change({...editor.content,points});};
 const latest=editor&&data?.templates.find(row=>row.id===editor.id);
 const conflict=latest&&latest.revision!==editor.revision;
 const subforms=(data?.versions||[]).filter(version=>version.template_id!==editor?.id&&!data?.templates.find(template=>template.id===version.template_id)?.archived);
 const subformLabel=version=>`${version.content.title} · v${version.number} · ${version.content.trade}`;
 const visible=(data?.templates||[]).filter(row=>!row.archived&&(!trade||row.draft.trade===trade)&&`${row.draft.title} ${row.draft.trade}`.toLocaleLowerCase('nb-NO').includes(query.toLocaleLowerCase('nb-NO')));
 return <div className="ks-checklists">
  <div className="ks-card"><h3>Sjekklistesentral</h3><p>Bygg firmaets sjekklister og velg fag. Trykk «Lagre og publiser» når listen er klar. Prosjektbrukere kan hente den under Sjekklister i generelle ordrer og under Fag/utstyr i våtromsprosjekter.</p><p className="ks-field-hint">En publisert utgave er fast. Endringer publiseres som en ny versjon. Prosjekter beholder utgaven de har hentet inn.</p>
   <div className="ks-checklist-actions"><button type="button" disabled={busy||!data} onClick={()=>choose(null)}>Ny sjekkliste</button>{cached&&<button type="button" className="secondary" disabled={busy} onClick={()=>{setEditor(cached);setDirty(true);setError('');}}>Fortsett lokalt utkast</button>}<button type="button" className="secondary" disabled={busy} onClick={()=>load().catch(cause=>setError(cause.message))}>Oppdater sjekklister</button></div>
  </div>
  {error&&!editor&&<p role="alert" className="ks-error">{error}</p>}{notice&&<p role="status" className="ks-notice">{notice}</p>}
  {!data?<p role="status">Henter sjekklister …</p>:<>
   <div className="ks-checklist-filters"><Field label="Søk i sjekklister" value={query} onChange={setQuery}/><label className="ks-field"><span>Fag</span><select value={trade} onChange={e=>setTrade(e.target.value)}><option value="">Alle fag</option>{CHECKLIST_TRADES.map(value=><option key={value}>{value}</option>)}</select></label></div>
   {!visible.length&&<p>Ingen sjekklister i dette utvalget. Bruk «Ny sjekkliste» for å bygge en.</p>}
   <div className="ks-checklist-grid">{visible.map(row=>{const version=data.versions.find(item=>item.template_id===row.id);const published=version&&sameChecklistContent(row.draft,version.content);return <article className="ks-card" key={row.id}><span className="ks-badge">{row.draft.trade}</span><h4>{row.draft.title}</h4><p>{`${row.draft.points.length} sjekkpunkter · ${version?published?`Publisert · v${version.number}`:`Endret utkast · v${version.number} er publisert`:'Utkast'}`}</p><div className="ks-checklist-actions"><button type="button" className="secondary" disabled={busy} onClick={()=>choose(row)}>Rediger sjekkliste</button><button type="button" className="secondary" disabled={busy} onClick={()=>archive(row)}>Arkiver sjekkliste</button></div>{version&&<details><summary>Publisert sjekklistemal · v{version.number}</summary><p>{version.content.title} · {version.content.trade}. PDF-en er en tom mal. Endringer i utkastet følger ikke med.</p><KshmsDocumentPdfButton kind="template" row={version} companyId={companyId} userId={userId} active={active}/></details>}</article>;})}</div>
  </>}
  {editor&&active&&<DeviationDialog title="Bygg sjekkliste" context="KS/HMS · Firmaets sjekklistesentral" closeLabel="Lukk sjekklistedialog" busy={busy} onClose={()=>{if(!locked.current){setEditor(null);setDirty(false);setError('');}}}>
   <form className="ks-checklists" onSubmit={event=>{event.preventDefault();save('publish');}}>
    {error&&<p role="alert" className="ks-error">{error}</p>}
    {conflict&&<div className="ks-closure-missing"><strong>Lagret utgave er endret</strong><details><summary>Sammenlign med lagret tekst</summary><p>{latest.draft.title} · {latest.draft.trade}</p><p>{latest.draft.instructions}</p><ol>{latest.draft.points.map(point=><li key={point.id}>{point.title}{point.guidance&&<p>{point.guidance}</p>}</li>)}</ol></details>{!latest.archived&&<button type="button" className="secondary" disabled={busy} onClick={()=>{cache({...editor,revision:latest.revision,requestId:crypto.randomUUID()});setError('Din tekst er beholdt. Neste lagring erstatter det lagrede utkastet.');}}>Fortsett med min tekst på nyeste utgave</button>}</div>}
    <fieldset disabled={busy} className="ks-checklist-fields"><Field label="Navn på sjekklisten" value={editor.content.title} maxLength={160} onChange={value=>change({...editor.content,title:value})}/><label className="ks-field"><span>Fag for sjekklisten</span><select value={editor.content.trade} onChange={e=>change({...editor.content,trade:e.target.value})}>{CHECKLIST_TRADES.map(value=><option key={value}>{value}</option>)}</select></label><Field label="Beskrivelse / når brukes sjekklisten?" value={editor.content.instructions} multiline maxLength={4000} onChange={value=>change({...editor.content,instructions:value})}/>
     <h3>Sjekkpunkter</h3>{editor.content.points.map((point,index)=><fieldset className="ks-checklist-point" key={point.id}><legend>{`Sjekkpunkt ${index+1}`}</legend><Field label={`Tekst for sjekkpunkt ${index+1}`} value={point.title} onChange={value=>pointChange(point.id,'title',value)}/><Field label={`Hjelpetekst for sjekkpunkt ${index+1}`} multiline maxLength={2000} value={point.guidance} onChange={value=>pointChange(point.id,'guidance',value)}/><div className="ks-options"><label><input type="checkbox" checked={point.image_required===true} onChange={e=>pointChange(point.id,'image_required',e.target.checked)}/>Bilde påkrevd</label><label><input type="checkbox" checked={point.comment_required===true} onChange={e=>pointChange(point.id,'comment_required',e.target.checked)}/>Kommentar påkrevd</label></div><label className="ks-field"><span>{`Underskjema etter sjekkpunkt ${index+1} (valgfritt)`}</span><select value={point.subform_version_id||''} onChange={e=>pointChange(point.id,'subform_version_id',e.target.value||null)}><option value="">Ingen underskjema</option>{subforms.map(version=><option key={version.id} value={version.id}>{subformLabel(version)}</option>)}</select><small>Eksakt publisert versjon kopieres inn. Senere endringer i underskjemaet påvirker ikke denne utgaven.</small></label><div className="ks-checklist-actions"><button type="button" className="secondary" disabled={index===0} onClick={()=>move(index,-1)} aria-label={`Flytt sjekkpunkt ${index+1} opp`}>Flytt opp</button><button type="button" className="secondary" disabled={index===editor.content.points.length-1} onClick={()=>move(index,1)} aria-label={`Flytt sjekkpunkt ${index+1} ned`}>Flytt ned</button><button type="button" className="secondary" disabled={editor.content.points.length===1} onClick={()=>change({...editor.content,points:editor.content.points.filter(item=>item.id!==point.id)})}>Fjern sjekkpunkt</button></div></fieldset>)}
     <button type="button" className="secondary" disabled={editor.content.points.length>=100} onClick={()=>change({...editor.content,points:[...editor.content.points,{id:crypto.randomUUID(),title:'',guidance:'',image_required:false,comment_required:false,subform_version_id:null}]})}>Legg til sjekkpunkt</button>
    </fieldset>
    <div className="ks-checklist-actions"><button type="submit" disabled={busy||Boolean(conflict)}>Lagre og publiser</button><button type="button" className="secondary" disabled={busy||Boolean(conflict)} onClick={()=>save('save')}>Lagre utkast</button></div>
    <p className="ks-field-hint">Utkast er synlige bare i sentralen. Publiserte lister kan hentes av prosjektbrukere i firmaet, også uten personlig KS/HMS-tilgang.</p>
   </form>
  </DeviationDialog>}
 </div>;
}
