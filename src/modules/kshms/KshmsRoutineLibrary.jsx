import { useId,useState } from 'react';
import { ROUTINE_CATALOG } from './kshmsCatalog.mjs';
import { routinesBySource,selectedCatalogRoutines } from './kshmsLibrary.mjs';
import { routineApprovalState } from './kshmsDraft.mjs';
import { matchesRoutineSearch } from './kshmsSearch.mjs';
import KshmsRoutineSearch from './KshmsRoutineSearch.jsx';

export default function KshmsRoutineLibrary({routines,versions,recommended,selectedKeys,onSelectionChange,filter,onFilterChange,busy,progress,feedback,onAdd,onEdit,onPreview}) {
 const id=useId(),[query,setQuery]=useState(''),existing=routinesBySource(routines);
 const selected=selectedCatalogRoutines(selectedKeys).filter(routine=>!existing.has(routine.key));
 const selectedSet=new Set(selected.map(routine=>routine.key));
 const available=filter==='all'?ROUTINE_CATALOG:recommended;
 const visible=available.filter(routine=>matchesRoutineSearch(routine,query));
 const selectable=visible.filter(routine=>!existing.has(routine.key));
 const toggle=(key,checked)=>onSelectionChange(previous=>checked?[...new Set([...previous,key])]:previous.filter(value=>value!==key));
 return <section className="ks-routine-library" aria-label="Velg standardrutiner">
  <h4>Velg rutinene firmaet trenger</h4>
  <p>Huk av én eller flere rutiner. «Anbefalte» viser forslag som passer det du skrev i oppstarten. «Alle forslag» viser hele listen. Velg bare rutiner som passer firmaets arbeid.</p>
  <div className="ks-library-toolbar">
   <div className="ks-actions" role="group" aria-label="Vis standardutkast">
    <button type="button" className={filter==='recommended'?'active':'secondary'} aria-pressed={filter==='recommended'} disabled={busy} onClick={()=>onFilterChange('recommended')}>Anbefalte ({recommended.length})</button>
    <button type="button" className={filter==='all'?'active':'secondary'} aria-pressed={filter==='all'} disabled={busy} onClick={()=>onFilterChange('all')}>Alle forslag ({ROUTINE_CATALOG.length})</button>
   </div>
   <div className="ks-library-counts"><span className="ks-badge" role="status">{selected.length} valgt</span><span>{ROUTINE_CATALOG.filter(routine=>existing.has(routine.key)).length} av {ROUTINE_CATALOG.length} forslag lagt til</span></div>
  </div>
  <KshmsRoutineSearch label="Søk i ProffDoks forslag" query={query} onChange={setQuery} count={visible.length} total={available.length}/>
  {query.trim()&&!visible.length&&<p>Ingen forslag passer søket. Prøv «Alle forslag», et annet ord eller tøm søket.</p>}
  {query.trim()&&<p className="ks-field-hint">Valgene dine beholdes når du søker. Hele utvalget står under «Disse rutinene legges inn».</p>}
  <div className="ks-actions">
   <button type="button" className="secondary" disabled={busy||!selectable.some(routine=>!selectedSet.has(routine.key))} onClick={()=>onSelectionChange(previous=>[...new Set([...previous,...selectable.map(routine=>routine.key)])])}>Velg alle viste</button>
   <button type="button" className="secondary" disabled={busy||!selected.length} onClick={()=>onSelectionChange([])}>Fjern markeringer</button>
  </div>
  <div className="ks-library">
   {visible.map(routine=>{
    const added=existing.get(routine.key),checked=Boolean(added)||selectedSet.has(routine.key),approval=added?routineApprovalState(added,versions):null;
    return <article key={routine.key} className={`ks-library-card${added?approval.status==='approved'?' approved':' added':checked?' selected':''}`}>
     <div className="ks-library-card-heading">
      {added?<strong>{routine.title}</strong>:<label htmlFor={`${id}-${routine.key}`}><input id={`${id}-${routine.key}`} type="checkbox" aria-label={`Velg rutine: ${routine.title}`} aria-describedby={`${id}-${routine.key}-description`} checked={checked} disabled={busy} onChange={event=>toggle(routine.key,event.target.checked)}/><strong>{routine.title}</strong></label>}
      <span className="ks-library-status">{approval?approval.label:checked?'Valgt':'Ikke valgt'}</span>
     </div>
     <p id={`${id}-${routine.key}-description`}>{routine.relevance}</p>
     <div className="ks-actions">
      {added&&<button type="button" disabled={busy} aria-label={`Rediger her: ${added.draft.title}`} onClick={()=>onEdit(added)}>Rediger her</button>}
      <button type="button" className="secondary" disabled={busy} aria-label={`Les forslag: ${routine.title}`} onClick={()=>onPreview(routine)}>Les forslag</button>
     </div>
    </article>;
   })}
  </div>
  <div className="ks-selection-review" aria-labelledby={`${id}-selection`}>
   <div className="ks-row"><h4 id={`${id}-selection`}>Disse rutinene legges inn</h4><span className="ks-badge">{selected.length} valgt</span></div>
   {selected.length?<ul className="ks-selected-list">{selected.map(routine=><li key={routine.key}>{routine.title}</li>)}</ul>:<p>Huk av rutinene du vil legge inn. Rutinene som er lagt til, kan du tilpasse med «Rediger her».</p>}
   <p>Trykk «Legg inn» for å lagre alle valgte rutiner som utkast. Etterpå bruker du «Rediger her» for å tilpasse dem. Firmaadmin eller KS/HMS-ansvarlig godkjenner når teksten er klar.</p>
   <button type="button" disabled={busy||!selected.length} onClick={()=>onAdd(selected.map(routine=>routine.key))}>{progress?`Legger inn ${progress.completed} av ${progress.total} …`:selected.length?`Legg inn ${selected.length} ${selected.length===1?'rutine':'rutiner'}`:'Legg inn valgte rutiner'}</button>
   {feedback&&<p className={feedback.error?'ks-error':'ks-notice'} role={feedback.error?'alert':'status'}>{feedback.message}</p>}
  </div>
 </section>;
}
