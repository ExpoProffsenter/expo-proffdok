import React, {useEffect,useRef,useState} from 'react';
import {collaborationRpc} from './boligCollaborationClient.js';
import {boligDraftKey,readBoligDraft,writeBoligDraft} from './boligClient.js';
import './boligPartners.css';
export default function BoligShopStaff({context,root}) {
 const key=boligDraftKey(context,root.id,'shop-staff');
 const [email,setEmail]=useState(()=>readBoligDraft(key,{})?.email||''),[days,setDays]=useState(90),[data,setData]=useState(null),[candidate,setCandidate]=useState(null),[checked,setChecked]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[pending,setPending]=useState(()=>readBoligDraft(key,{})?.pending||null);
 const alive=useRef(true),operation=useRef(false);
 const rpc=(action,payload={})=>collaborationRpc('bolig_shop_staff',{p_company_id:context.company_id,p_root_id:root.id,p_action:action,p_payload:payload},context.user_id);
 const persist=(nextEmail,nextPending)=>{if(!writeBoligDraft(key,{email:nextEmail,pending:nextPending}))throw Error('Kladden kunne ikke sikres. Behold siden åpen.');};
 useEffect(()=>{alive.current=true;rpc('list').then(v=>{if(alive.current)setData(v);}).catch(e=>{if(alive.current)setError(e.code==='PGRST202'?'Butikktilgang er ikke klargjort i dette miljøet.':e.message);});return()=>{alive.current=false;};},[key]);
 async function run(action,payload={}) {
  if(operation.current)return;operation.current=true;setBusy(true);setError('');setNotice('');
  const mutation=['assign','revoke'].includes(action);const attempt=(mutation&&pending)||{action,payload};
  try {
   if(mutation){persist(email,attempt);setPending(attempt);}
   const v=await rpc(attempt.action,attempt.payload);if(!alive.current)return;
   setData(v);
   if(mutation){persist(email,null);setPending(null);setCandidate(null);setChecked(false);setNotice(action==='revoke'?'Tilgangen er trukket tilbake.':'Tilgangen er lagret. Den ansatte finner prosjektet på Min side → Mine boligprosjekter.');}
   else if(action==='lookup'){setCandidate(v.candidate);setChecked(true);}
  } catch(e) {
   if(alive.current){setError(e.message);if(['42501','22023','PT409'].includes(e.code)){persist(email,null);setPending(null);setCandidate(null);setChecked(false);if(e.code==='42501')setData(null);}}
  } finally {operation.current=false;if(alive.current)setBusy(false);}
 }
 return <section className="bolig-partners" aria-label="Butikktilgang">
  <header className="bolig-partner-hero"><div><h2>Butikktilgang</h2><p>Butikkansatte kan hjelpe beboerne med tilvalg og publisere varer og montering i beboerportalen. Beboeren godkjenner selv.</p></div></header>
  {error&&<p role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}
  {!data?<button disabled={busy} onClick={()=>run('list')}>Hent tilgangene</button>:<>
  <p>{data.can_assign?'Du tildeler tilgang som systemadmin.':'Systemadmin tildeler butikkansatte. Du kan se og trekke tilbake prosjektets tilganger her.'} {data.support?'Handlingen loggføres på deg som systemadmin i supportmodus.':''}</p>
  {data.can_assign&&<form onSubmit={e=>{e.preventDefault();run('lookup',{email});}}>
   <fieldset disabled={busy||!!pending}><legend>Legg til butikkansatt</legend>
    <label>E-post til den ansatte<input type="email" required maxLength={254} autoComplete="off" value={email} onChange={e=>{try{persist(e.target.value,null);setEmail(e.target.value);setCandidate(null);setChecked(false);}catch(err){setError(err.message);}}}/></label>
    <button type="submit">Finn ansatt</button>
   </fieldset>
   {checked&&!candidate&&<p role="status">Ingen godkjent ansatt ble funnet. Kontroller e-posten. Mangler brukeren, opprett eller inviter personen via brukeradministrasjonen i Bademiljø Expo, Expo Proffsenter eller Ringside, og godkjenn firmatilgangen. Gå deretter tilbake hit og velg «Finn ansatt». E-posten beholdes her. Ingen prosjektadgang eller e-post opprettes nå.</p>}
   {candidate&&<fieldset disabled={busy||!!pending}><legend>Kontroller tildelingen</legend><p><strong>{candidate.email}</strong><br/>{candidate.companies}</p><p>Prosjekt: <strong>{root.title}</strong><br/>Kan se grunnpakker, endre boligtilvalg og publisere butikktillegg. Felles pakker og øvrige firmatilganger endres ikke.</p>
    <label>Gyldig i<select value={days} onChange={e=>setDays(Number(e.target.value))}><option value={30}>30 dager</option><option value={90}>90 dager</option><option value={365}>1 år</option></select></label>
    <button type="button" className="bolig-primary" onClick={()=>run('assign',{email,user_id:candidate.id,revision:candidate.revision,days,reviewed:true,request_id:crypto.randomUUID()})}>Gi tilgang til dette prosjektet</button>
   </fieldset>}
  </form>}
  {pending&&<p role="status">Lagringen mangler kvittering. <button disabled={busy} onClick={()=>run(pending.action,pending.payload)}>Kontroller samme lagring igjen</button></p>}
  <div className="bolig-partner-toolbar"><h3>Ansatte med prosjekttilgang</h3><button disabled={busy||!!pending} onClick={()=>run('list')}>Hent siste status</button></div>
  {!data.staff.length&&<p>Ingen butikkansatte er tildelt her ennå.</p>}
  <div className="bolig-partner-cards">{data.staff.map(p=><article className="bolig-partner-card" key={p.id}><strong>{p.email}</strong><span>{!p.enabled?'Tilbakekalt':p.active?'Aktiv':'Utløpt eller ansatt ikke lenger godkjent'}</span><span>Til {new Date(p.expires_at).toLocaleDateString('nb-NO')}</span>{p.enabled&&<button disabled={busy||!!pending} onClick={()=>run('revoke',{id:p.id,revision:p.revision,request_id:crypto.randomUUID()})}>Trekk tilbake tilgang for {p.email}</button>}</article>)}</div>
  <p>Den ansatte bruker sin vanlige innlogging og finner alle tildelte prosjekter under <strong>Min side → Mine boligprosjekter</strong>. Det sendes ingen e-post her.</p>
  </>}
 </section>;
}
