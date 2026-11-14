import React,{useEffect,useRef,useState} from 'react';
import {collaborationRpc} from './boligCollaborationClient.js';
import Dialog from './BoligEditorDialog.jsx';
import './bolig.css';
import './boligWorkspace.css';
import './boligCollaboration.css';
import BoligCatalog from './BoligCatalog.jsx';
import UnitOverview from './BoligShopUnitOverview.jsx';
import ShopProposal from './BoligShopProposal.jsx';
import BoligPackageChoices from './BoligPackageChoices.jsx';
export default function BoligMyCollaborations({userId}){
 const [list,setList]=useState([]),[selected,setSelected]=useState(''),[data,setData]=useState(null),[unit,setUnit]=useState(''),[query,setQuery]=useState(''),[catalog,setCatalog]=useState(false),[error,setError]=useState(''),[loading,setLoading]=useState(true),[switchBlocked,setSwitchBlocked]=useState(false);
 const seq=useRef(0);
 useEffect(()=>{let alive=true;const load=async()=>{const n=++seq.current;setLoading(true);try{const next=await collaborationRpc('bolig_my_collaborations',{p_root_id:selected||null},userId);if(!alive||n!==seq.current)return;if(selected){if(next?.root?.id!==selected||!Array.isArray(next?.units))throw Error('Prosjektgrunnlaget kunne ikke leses. Prøv igjen.');setData(next);}else{if(!Array.isArray(next?.projects))throw Error('Prosjektoversikten kunne ikke leses. Prøv igjen.');setList(next.projects);setData(null);}setError('');}catch(e){if(alive&&n===seq.current){setData(null);setList([]);setError(e.code==='PGRST202'?'':e.message);}}finally{if(alive&&n===seq.current)setLoading(false);}};
 const refresh=()=>{if(document.visibilityState!=='hidden')load();};load();window.addEventListener('focus',refresh);document.addEventListener('visibilitychange',refresh);const interval=setInterval(refresh,30000);return()=>{alive=false;++seq.current;clearInterval(interval);window.removeEventListener('focus',refresh);document.removeEventListener('visibilitychange',refresh);};},[userId,selected]);
 const chosen=data?.units.find(u=>u.id===unit);
 const matches=data?.units.filter(u=>`${u.number} ${u.address} ${u.contact_name}`.toLocaleLowerCase('nb').includes(query.toLocaleLowerCase('nb'))) || [];
 // Keep the actual selected apartment visible while narrowing the other options.
 // Unmounting its editor here would interrupt an unfinished draft.
 const options=chosen&&!matches.some(u=>u.id===chosen.id)?[chosen,...matches]:matches;
 if(!selected&&!list.length&&!error)return null;
 return <section className="personal-card" aria-label="Mine boligprosjekter"><h3>Mine boligprosjekter</h3><p>Prosjekter du personlig har fått tilgang til. Ditt vanlige arbeidsfirma beholdes.</p>{!selected&&error&&<p role="alert">{error}</p>}
 {!selected&&loading&&<p role="status">Kontrollerer prosjekttilgang …</p>}
 {!selected?list.map(p=><button key={p.id} onClick={()=>{setSelected(p.id);setUnit('');setData(null);setCatalog(false);setQuery('');}}>{p.title} · {p.company}</button>):<Dialog title={data?.root.title||'Mine boligprosjekter'} className="bolig-collaboration-dialog" onClose={()=>{setSelected('');setData(null);setUnit('');}}>
 <div className="bolig-collaboration-body">
 {loading&&!data&&<p role="status">Kontrollerer prosjekttilgang …</p>}
 {error&&<p role="alert">{error}</p>}
 <button onClick={()=>{setSelected('');setData(null);setUnit('');}}>Tilbake til mine boligprosjekter</button>
 {data&&<><h4>{data.root.title} · {data.context.company_name}</h4><p>Grunnpakke og boligvalg vises nedenfor. Butikktillegg kan publiseres direkte til beboerportalen med egen prosjektrettighet. Beboeren godkjenner selv.</p>
 <button onClick={()=>setCatalog(!catalog)}>{catalog?'Skjul felles pakker':'Vis felles pakker'}</button>
 {catalog&&<BoligCatalog context={data.context} root={data.root}/>}
 <label>Finn bolig<input type="search" value={query} onChange={e=>setQuery(e.target.value)}/></label>
 {query&&<p role="status">{matches.length} treff.{chosen?' Valgt bolig beholdes til du velger en annen.':!matches.length?' Prøv et annet bolignummer eller en adresse.':''} <button type="button" onClick={()=>setQuery('')}>Tøm søk</button></p>}
 <label>Bytt bolig<select disabled={switchBlocked} value={chosen?.id||''} onChange={e=>setUnit(e.target.value)}><option value="">Velg bolig</option>{options.map(u=><option key={u.id} value={u.id}>{u.address} · {u.number} · {u.contact_name}</option>)}</select></label>
 {chosen&&!matches.some(u=>u.id===chosen.id)&&<p role="status">Valgt bolig {chosen.number} · {chosen.address} · {chosen.contact_name} er utenfor søket. Velg riktig treff for å bytte.</p>}
 {query&&matches.length>0&&<div className="bolig-unit-results" aria-label="Søkeresultater">{matches.map(u=><button type="button" key={u.id} disabled={switchBlocked} aria-pressed={chosen?.id===u.id} onClick={()=>setUnit(u.id)}>{chosen?.id===u.id?'Valgt: ':'Velg: '}Bolig {u.number} · {u.address} · {u.contact_name||'Kontakt ikke registrert'}</button>)}</div>}
 {switchBlocked&&<p role="status">Vent til bildet eller publiseringen er ferdig før du bytter bolig.</p>}
 {chosen&&Object.hasOwn(chosen,'activities')&&<UnitOverview unit={chosen}/>}
 {chosen&&<ShopProposal onSwitchBlocked={setSwitchBlocked} key={`shop-${chosen.id}`} context={data.context} root={data.root} unit={chosen}/>}
 {chosen&&<BoligPackageChoices collaborationView key={chosen.id} context={data.context} root={data.root} unit={chosen}/>}
 </>}
 </div>
 </Dialog>}
 </section>;
}
