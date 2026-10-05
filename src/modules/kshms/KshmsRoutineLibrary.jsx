import { useId } from 'react';
import { ROUTINE_CATALOG } from './kshmsCatalog.mjs';
import { routinesBySource,selectedCatalogRoutines } from './kshmsLibrary.mjs';

export default function KshmsRoutineLibrary({routines,recommended,selectedKeys,onSelectionChange,filter,onFilterChange,busy,progress,feedback,onAdd,onEdit,onPreview}) {
 const id=useId(),existing=routinesBySource(routines);
 const selected=selectedCatalogRoutines(selectedKeys).filter(routine=>!existing.has(routine.key));
 const selectedSet=new Set(selected.map(routine=>routine.key));
 const visible=filter==='all'?ROUTINE_CATALOG:recommended;
 const selectable=visible.filter(routine=>!existing.has(routine.key));
 const toggle=(key,checked)=>onSelectionChange(previous=>checked?[...new Set([...previous,key])]:previous.filter(value=>value!==key));
 return <section className="ks-routine-library" aria-label="Velg standardrutiner">
  <h4>1. Velg rutiner til håndboken</h4>
  <p>Huk av én eller flere rutiner. Forslagene bygger på oppstarten; vurder relevans og firmaets egne behov.</p>
  <div className="ks-library-toolbar">
   <div className="ks-actions" role="group" aria-label="Vis standardutkast">
    <button type="button" className={filter==='recommended'?'active':'secondary'} aria-pressed={filter==='recommended'} disabled={busy} onClick={()=>onFilterChange('recommended')}>Anbefalte ({recommended.length})</button>
    <button type="button" className={filter==='all'?'active':'secondary'} aria-pressed={filter==='all'} disabled={busy} onClick={()=>onFilterChange('all')}>Alle standardutkast ({ROUTINE_CATALOG.length})</button>
   </div>
   <div className="ks-library-counts"><span className="ks-badge" role="status">{selected.length} valgt</span><span>{ROUTINE_CATALOG.filter(routine=>existing.has(routine.key)).length} av {ROUTINE_CATALOG.length} standardutkast lagt til</span></div>
  </div>
  <div className="ks-actions">
   <button type="button" className="secondary" disabled={busy||!selectable.some(routine=>!selectedSet.has(routine.key))} onClick={()=>onSelectionChange(previous=>[...new Set([...previous,...selectable.map(routine=>routine.key)])])}>Velg alle viste</button>
   <button type="button" className="secondary" disabled={busy||!selected.length} onClick={()=>onSelectionChange([])}>Fjern markeringer</button>
  </div>
  <div className="ks-library">
   {visible.map(routine=>{
    const added=existing.get(routine.key),checked=Boolean(added)||selectedSet.has(routine.key);
    return <article key={routine.key} className={`ks-library-card${added?' added':checked?' selected':''}`}>
     <div className="ks-library-card-heading">
      <label htmlFor={`${id}-${routine.key}`}><input id={`${id}-${routine.key}`} type="checkbox" aria-label={`${added?'Lagt til':'Velg rutine'}: ${routine.title}`} aria-describedby={`${id}-${routine.key}-description`} checked={checked} disabled={busy||Boolean(added)} onChange={event=>toggle(routine.key,event.target.checked)}/><strong>{routine.title}</strong></label>
      <span className="ks-library-status">{added?'Lagt til':checked?'Valgt':'Ikke valgt'}</span>
     </div>
     <p id={`${id}-${routine.key}-description`}>{routine.relevance}</p>
     <div className="ks-actions">
      {added&&<button type="button" disabled={busy} aria-label={`Rediger her: ${added.draft.title}`} onClick={()=>onEdit(added)}>Rediger her</button>}
      <button type="button" className="secondary" disabled={busy} aria-label={`Les standardutkast: ${routine.title}`} onClick={()=>onPreview(routine)}>Les standardutkast</button>
     </div>
    </article>;
   })}
  </div>
  <div className="ks-selection-review" aria-labelledby={`${id}-selection`}>
   <div className="ks-row"><h4 id={`${id}-selection`}>Disse rutinene legges inn</h4><span className="ks-badge">{selected.length} valgt</span></div>
   {selected.length?<ul className="ks-selected-list">{selected.map(routine=><li key={routine.key}>{routine.title}</li>)}</ul>:<p>Huk av rutinene du vil legge inn. Rutinene som er lagt til, kan du tilpasse med «Rediger her».</p>}
   <p>Rutinene lagres som kladder. Tilpass dem til firmaet før firmaadmin godkjenner publisering.</p>
   <button type="button" disabled={busy||!selected.length} onClick={()=>onAdd(selected.map(routine=>routine.key))}>{progress?`Legger inn ${progress.completed} av ${progress.total} …`:selected.length?`Legg inn ${selected.length} ${selected.length===1?'rutine':'rutiner'}`:'Legg inn valgte rutiner'}</button>
   {feedback&&<p className={feedback.error?'ks-error':'ks-notice'} role={feedback.error?'alert':'status'}>{feedback.message}</p>}
  </div>
 </section>;
}
