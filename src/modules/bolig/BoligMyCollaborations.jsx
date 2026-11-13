import React,{useEffect,useRef,useState} from 'react';
import {collaborationRpc} from './boligCollaborationClient.js';
import Dialog from './BoligEditorDialog.jsx';
import './bolig.css';
import './boligWorkspace.css';
import './boligCollaboration.css';
import BoligCatalog from './BoligCatalog.jsx';
import BoligPackageChoices from './BoligPackageChoices.jsx';
export default function BoligMyCollaborations({userId}){
 const [list,setList]=useState([]),[selected,setSelected]=useState(''),[data,setData]=useState(null),[unit,setUnit]=useState(''),[query,setQuery]=useState(''),[catalog,setCatalog]=useState(false),[error,setError]=useState(''),[loading,setLoading]=useState(true);
 const seq=useRef(0);
 useEffect(()=>{let alive=true;const load=async()=>{const n=++seq.current;setLoading(true);try{const next=await collaborationRpc('bolig_my_collaborations',{p_root_id:selected||null},userId);if(!alive||n!==seq.current)return;if(selected){if(next?.root?.id!==selected||!Array.isArray(next?.units))throw Error('Prosjektgrunnlaget kunne ikke leses. Prøv igjen.');setData(next);}else{if(!Array.isArray(next?.projects))throw Error('Prosjektoversikten kunne ikke leses. Prøv igjen.');setList(next.projects);setData(null);}setError('');}catch(e){if(alive&&n===seq.current){setData(null);setList([]);setError(e.code==='PGRST202'?'':e.message);}}finally{if(alive&&n===seq.current)setLoading(false);}};
 const refresh=()=>{if(document.visibilityState!=='hidden')load();};load();window.addEventListener('focus',refresh);document.addEventListener('visibilitychange',refresh);const interval=setInterval(refresh,30000);return()=>{alive=false;++seq.current;clearInterval(interval);window.removeEventListener('focus',refresh);document.removeEventListener('visibilitychange',refresh);};},[userId,selected]);
 const chosen=data?.units.find(u=>u.id===unit);
 const matches=data?.units.filter(u=>`${u.number} ${u.address} ${u.contact_name}`.toLocaleLowerCase('nb').includes(query.toLocaleLowerCase('nb'))) || [];
 // Keep the actual selected apartment visible while narrowing the other options.
 // Unmounting its editor here would interrupt an unfinished draft.
 const options=chosen&&!matches.some(u=>u.id===chosen.id)?[chosen,...matches]:matches;
 if(!selected&&!list.length&&!error)return null;
 return <section className="personal-card" aria-label="Mine samarbeid"><h3>Mine samarbeid</h3><p>Prosjekter du personlig har fått tilgang til. Ditt vanlige arbeidsfirma beholdes.</p>{error&&<p role="alert">{error}</p>}
 {loading&&<p role="status">Kontrollerer prosjekttilgang …</p>}
 {!selected?list.map(p=><button key={p.id} onClick={()=>{setSelected(p.id);setUnit('');setData(null);setCatalog(false);setQuery('');}}>{p.title} · {p.company}</button>):<Dialog title={data?.root.title||'Mine samarbeid'} className="bolig-collaboration-dialog" onClose={()=>{setSelected('');setData(null);setUnit('');}}>
 <div className="bolig-collaboration-body">
 <button onClick={()=>{setSelected('');setData(null);setUnit('');}}>Tilbake til mine samarbeid</button>
 {data&&<><h4>{data.root.title} · {data.context.company_name}</h4><p>Endringer lagres som boligvalg. Dette er ikke en bestilling eller beboeraksept. Prosjektleder deler det ferdige forslaget i beboerportalen.</p>
 <button onClick={()=>setCatalog(!catalog)}>{catalog?'Skjul felles pakker':'Vis felles pakker'}</button>
 {catalog&&<BoligCatalog context={data.context} root={data.root}/>}
 <label>Finn bolig<input type="search" value={query} onChange={e=>setQuery(e.target.value)}/></label>
 {query&&<p role="status">{matches.length} treff.{chosen?' Valgt bolig beholdes til du velger en annen.':!matches.length?' Prøv et annet bolignummer eller en adresse.':''} <button type="button" onClick={()=>setQuery('')}>Tøm søk</button></p>}
 <label>Bolig<select value={chosen?.id||''} onChange={e=>setUnit(e.target.value)}><option value="">Velg bolig</option>{options.map(u=><option key={u.id} value={u.id}>{u.address} · {u.number} · {u.contact_name}</option>)}</select></label>
 {chosen&&<BoligPackageChoices key={chosen.id} context={data.context} root={data.root} unit={chosen}/>}
 </>}
 </div>
 </Dialog>}
 </section>;
}
