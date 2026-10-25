import React, {Suspense,useState} from 'react';
const SiteRoster=React.lazy(()=>import('./BoligSiteRoster.jsx'));
import AttendancePeople from './BoligAttendancePeople.jsx';
import {useBoligAttendance} from './boligAttendance.js';
import './boligAttendance.css';
export function osloInput(value=new Date()) {
 const parts=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Oslo',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(value));
 return parts.replace(' ','T');
}
const show=t=>t?new Intl.DateTimeFormat('nb-NO',{timeZone:'Europe/Oslo',dateStyle:'short',timeStyle:'short'}).format(new Date(t)):'Ikke registrert ut';
export function attendanceCsv(title, day, visits) {
 const cell=x=>'"'+String(x??'').replace(/^[=+@\-\t\r]/,"'$&").replaceAll('"','""')+'"';
 return '\ufeff'+[['Registrert tilstedeværelse',title,day,'Europe/Oslo'],['Navn','Firma','Inn','Ut'],...visits.map(v=>[v.name,v.company,show(v.arrived_at),show(v.departed_at)])].map(row=>row.map(cell).join(';')).join('\r\n');
}
export default function BoligAttendance({context,root}) {
 const {data,error,busy,draft,update,run,load,disabled}=useBoligAttendance(context,root);
 const [rosterOpen,setRosterOpen]=useState(false);
 const day=draft.day||osloInput().slice(0,10), form=draft.form;
 const set=(key,value)=>update({form:{...form,[key]:value}});
 const exportList=()=>{const url=URL.createObjectURL(new Blob([attendanceCsv(root.title,day,data.visits)],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`bemanning-${day}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 if(context.role!=='manager') return <p>Bemanningslisten er tilgjengelig for prosjektleder.</p>;
 return <section className="bolig-attendance" aria-label="Faktisk bemanning">
 <h3>Faktisk bemanning</h3>
 <button type="button" onClick={()=>setRosterOpen(true)}>Oversiktsliste ved tilsyn</button>
 {rosterOpen&&<Suspense fallback={<p role="status">Henter oversiktslisten …</p>}><SiteRoster context={context} root={root} onClose={()=>setRosterOpen(false)}/></Suspense>}<p>Registrer hvem som er på prosjektet. Dette er registrert tilstedeværelse, uavhengig av planlagt bemanning. Tidene vises i norsk tid.</p>
 {error&&<p role="alert">{error}</p>}<button type="button" disabled={busy} onClick={load}>Hent siste liste</button>
 {draft.pending&&<p role="status">Lagring er ikke bekreftet. <button type="button" disabled={busy||!data} onClick={()=>run(null,{},true)}>Prøv samme lagring igjen</button></p>}
 {!data?<p role="status">Listen må bekreftes mot server før bruk. Kladden er beholdt.</p>:<>
 <p><strong>{data.enabled?'Bemanning er aktivert':'Bemanning er av'}</strong></p>
 <button type="button" disabled={disabled||root.archived||!!form} onClick={()=>run('enable',{enabled:!data.enabled,day,revision:data.revision})}>{data.enabled?'Deaktiver bemanning':'Aktiver bemanning'}</button>
 <p>Deaktivering beholder registreringene og historikken. Prosjektleder kan registrere manuelt her. Navngitte deltakere registrerer seg selv på Min side eller sin personlige UE-lenke.</p>
 <AttendancePeople context={context} root={root} enabled={data.enabled}/>
 <label>Prosjektdag<input type="date" value={day} disabled={disabled||!!form} onChange={e=>{update({day:e.target.value,basisRevision:null});load();}}/></label>
 <p><strong>{data.visits.filter(v=>!v.departed_at).length} registrert inne</strong> · {data.visits.length} registreringer i valgt dag eller fortsatt åpne fra tidligere dager.</p>
 <div className="bolig-attendance-actions"><button type="button" disabled={disabled} onClick={exportList}>Eksporter liste (CSV)</button><button type="button" disabled={disabled||!data.enabled||root.archived||!!form} onClick={()=>update({form:{id:crypto.randomUUID(),name:'',company:'',arrived:osloInput(),departed:'',reason:''}})}>Registrer deltaker inn</button></div>
 {form&&<form onSubmit={async e=>{e.preventDefault();await run('visit',{...form,day});}}>
 <h4>{form.editing?'Rett registrering':'Ny registrering'}</h4>
 <label>Navn<input required maxLength={120} value={form.name} onChange={e=>set('name',e.target.value)} disabled={disabled}/></label>
 <label>Firma<input required maxLength={120} value={form.company} onChange={e=>set('company',e.target.value)} disabled={disabled}/></label>
 <label>Registrert inn<input required type="datetime-local" value={form.arrived} onChange={e=>set('arrived',e.target.value)} disabled={disabled}/></label>
 <label>Registrert ut (valgfritt)<input type="datetime-local" value={form.departed} onChange={e=>set('departed',e.target.value)} disabled={disabled}/></label>
 {form.editing&&<label>Begrunn rettingen<textarea required minLength={3} maxLength={500} value={form.reason} onChange={e=>set('reason',e.target.value)} disabled={disabled}/></label>}
 {draft.basisRevision!=null&&draft.basisRevision!==data.revision&&<p role="alert">Listen er endret. Se over siste liste og kladden før du fortsetter. <button type="button" disabled={disabled} onClick={()=>update({basisRevision:data.revision})}>Jeg har gjennomgått siste liste</button></p>}
 <button disabled={disabled||!data.enabled||root.archived||draft.basisRevision!==data.revision}>Lagre registrering</button><button type="button" disabled={disabled} onClick={()=>update({form:null,basisRevision:null})}>Avbryt redigering</button>
 </form>}
 <div className="bolig-attendance-list">{data.visits.map(v=><article key={v.id}>
 <h4><span className={v.departed_at?'presence-out':'presence-in'}>{v.departed_at?'● Registrert ut':'● Registrert inne'}</span> · {v.name}</h4><p>{v.company}</p><p>Inn: {show(v.arrived_at)} · Ut: {show(v.departed_at)}</p>
 {!v.departed_at&&v.arrived_at.slice(0,10)<day&&<p>Åpen fra tidligere dag. Kontroller faktisk uttid.</p>}
 <button type="button" disabled={disabled||!data.enabled||root.archived||!!form} onClick={()=>update({form:{id:v.id,name:v.name,company:v.company,arrived:osloInput(v.arrived_at),departed:v.departed_at?osloInput(v.departed_at):osloInput(),editing:true,reason:''}})}>{v.departed_at?'Rett tidspunkt':'Registrer ut / rett tidspunkt'}</button>
 <details><summary>Registreringshistorikk</summary>{data.events.filter(e=>e.after_value?.id===v.id).map(e=><p key={e.id}>{show(e.created_at)} · Registrert av {e.payload.source_label||e.actor_label||e.actor} · {e.payload.reason||'Førstegangsregistrering'}<br/>Opprinnelig: {e.before_value?`${show(e.before_value.arrived_at)} – ${show(e.before_value.departed_at)}`:'Ingen'}<br/>Etter: {show(e.after_value.arrived_at)} – {show(e.after_value.departed_at)}</p>)}</details>
 </article>)}</div>{!data.visits.length&&<p>Ingen registreringer for denne dagen.</p>}
 </>}
 </section>;
}
