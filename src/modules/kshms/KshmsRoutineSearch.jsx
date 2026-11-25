import { useId } from 'react';

export default function KshmsRoutineSearch({label,query,onChange,count,total}) {
 const id=useId();
 return <div className="ks-search">
  <label className="ks-field" htmlFor={id}><span id={`${id}-label`}>{label}</span><input id={id} type="search" value={query} onChange={event=>onChange(event.target.value)} aria-labelledby={`${id}-label`} aria-describedby={`${id}-hint`} maxLength={200}/><span id={`${id}-hint`} className="ks-field-hint">Skriv et navn, kapittel eller ord i teksten. Listen endres mens du skriver.</span></label>
  <div className="ks-search-result"><p role="status">{query.trim()?`${count} av ${total} treff`:`${total} ${total===1?'rutine':'rutiner'}`}</p>{query&&<button type="button" className="secondary" onClick={()=>onChange('')}>Tøm søk</button>}</div>
 </div>;
}
