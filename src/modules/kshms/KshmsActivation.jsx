import { useEffect,useState } from 'react';
import { kshmsRpc } from './kshmsAccess.js';
import { publishManagedAccessChange } from '../access/moduleAccessClient.js';
export default function KshmsActivation() {
 const [firms,setFirms]=useState([]),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 useEffect(()=>{let active=true;kshmsRpc('kshms_admin_firms').then(data=>{if(active)setFirms(data)}).catch(e=>{if(active)setError(e.message)});return()=>{active=false}},[]);
 const change=async firm=>{setBusy(true);setError('');try{
  await kshmsRpc('kshms_activate',{p_company_id:firm.id,p_enabled:!firm.enabled});
  setFirms(await kshmsRpc('kshms_admin_firms'));publishManagedAccessChange();
 }catch(e){setError(e.message)}finally{setBusy(false)}};
 return <div className="item"><h3>KS/HMS – velg hvilke firmaer som får tilgang</h3><p className="note">Trykk «Aktiver» for å åpne KS/HMS for et firma. Etterpå velger firmaadmin hvilke ansatte som får bruke det. Dette starter ingen betaling.</p>
  {error && <p role="alert">{error}</p>}
  {firms.map(f=><div key={f.id} style={{display:'flex',justifyContent:'space-between',gap:12,margin:'8px 0',alignItems:'center'}}><span>{f.name} · {f.enabled?'Aktiv':'Av'}</span><button type="button" className="secondary" disabled={busy} onClick={()=>change(f)}>{f.enabled?'Deaktiver':'Aktiver'}</button></div>)}
 </div>;
}
