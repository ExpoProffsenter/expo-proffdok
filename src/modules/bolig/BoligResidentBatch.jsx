import React,{useEffect,useRef,useState} from 'react';
import Dialog from './BoligEditorDialog.jsx';
import './boligResidentBatch.css';
import {boligDraftKey,readBoligDraft,writeBoligDraft} from './boligClient.js';
import {residentBatchRpc} from './boligResidentBatchClient.js';
import {batchRecipients,batchVisible,selectionRows,validResidentEmail} from './boligResidentBatch.mjs';
import {newResidentToken} from './boligCommerceClient.js';
import {portalUrl} from './boligPortalClient.js';
import {residentMailRpc,sendResidentInvitation} from './boligResidentMailClient.js';
const initial={selected:[],mode:'links',deadline:'',deadline_time:'',pending:null,prepared:null,attempts:[]};
export default function BoligResidentBatch({context,record,onChanged}){
 const [open,setOpen]=useState(false);
 if(context.role!=='manager'||!context.enabled||record.root.archived)return null;
 const installed=record.units.every(u=>Object.hasOwn(u,'choice_deadline'));
 return <section className="bolig-resident-import-entry"><button type="button" disabled={!installed} onClick={()=>setOpen(true)}>Beboerlenker og frister samlet</button>
 {!installed&&<small>Samlet behandling må klargjøres i dette miljøet før bruk.</small>}
 {open&&<BatchDialog key={`${context.user_id}/${context.company_id}/${record.root.id}/${context.role}/${context.enabled}`} context={context} root={record.root} onClose={()=>setOpen(false)} onChanged={onChanged}/>}</section>;
}
function BatchDialog({context,root,onClose,onChanged}){
 const key=boligDraftKey(context,root.id,'resident-batch');
 const [draft,setDraft]=useState(()=>readBoligDraft(key,initial));
 const latest=useRef(draft),alive=useRef(true),operating=useRef(false),generation=useRef(0),dataRef=useRef(null);
 const [data,setData]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const [block,setBlock]=useState(''),[group,setGroup]=useState(''),[confirmed,setConfirmed]=useState(false),[replace,setReplace]=useState(false);
 const save=fields=>{const next={...latest.current,...fields};if(!writeBoligDraft(key,next))throw Error('Kladden kunne ikke sikres. Frigjør lagringsplass før du fortsetter.');latest.current=next;if(alive.current)setDraft(next);return next;};
 const change=fields=>{try{save(fields);setConfirmed(false);setNotice('');}catch(e){setError(e.message);}};
 const load=async()=>{if(operating.current)return;const ticket=++generation.current;try{const next=await residentBatchRpc(context,root.id);if(!alive.current||ticket!==generation.current)return;
 if(dataRef.current&&(JSON.stringify(dataRef.current.units)!==JSON.stringify(next.units)||dataRef.current.project_revision!==next.project_revision))setConfirmed(false);dataRef.current=next;setData(next);setError('');}catch(e){if(alive.current&&ticket===generation.current){setError(e.message);setData(null);setConfirmed(false);}}};
 useEffect(()=>{alive.current=true;load();const refresh=()=>{if(document.visibilityState!=='hidden')load();};window.addEventListener('focus',refresh);document.addEventListener('visibilitychange',refresh);
 return()=>{alive.current=false;++generation.current;window.removeEventListener('focus',refresh);document.removeEventListener('visibilitychange',refresh);};},[key,context.role,context.enabled,root.archived]);
 const units=data?.units||[],selected=units.filter(u=>draft.selected.includes(u.id));
 const shown=batchVisible(units,block,group),audience=batchRecipients(selected);
 const projectClock=draft.mode==='time',clock=draft.deadline_time||data?.deadline_time||'12:00';
 const locked=busy||!!draft.pending||!!draft.prepared;
 const run=async(retry=false)=>{
  if(operating.current||!data||(!retry&&!confirmed))return;
  operating.current=true;++generation.current;setBusy(true);setError('');setNotice('');
  try{
   let attempt=latest.current.pending;
   if(!retry){const action=latest.current.mode==='time'?'deadline_time':latest.current.mode==='deadline'?'deadlines':'publish';const rows=action==='deadline_time'?[]:selectionRows(data.units,latest.current.selected);
    attempt={action,payload:{request_id:crypto.randomUUID(),reviewed:true,deadline:latest.current.deadline,deadline_time:clock,revision:data.project_revision,replace_links:replace,
     units:rows.map(u=>({id:u.id,basis:u.basis,portal_revision:u.portal_revision,...(action==='publish'?{request_id:crypto.randomUUID(),token:newResidentToken()}: {})}))},recipients:batchRecipients(rows).recipients};
    save({pending:attempt});
   }
   if(!attempt)throw Error('Ingen uavklart handling. Hent siste oversikt.');
   const next=await residentBatchRpc(context,root.id,attempt.action,attempt.payload);if(!alive.current)return;
   if(attempt.action==='publish'){
    const attempts=attempt.recipients.map(recipient=>{const portal=next.portals.find(p=>p.unit_id===recipient.unit_id),entry=attempt.payload.units.find(u=>u.id===recipient.unit_id);
     return {...recipient,id:crypto.randomUUID(),to:recipient.email,revision:portal.revision,target_id:portal.target_id,token:entry.token,status:'ready'};});
    save({pending:null,prepared:attempt.payload,attempts});setNotice('Lenkene er klargjort. Ingen e-post er sendt. Se over mottakerne før du bekrefter sending.');
   }else{save({pending:null});setNotice(attempt.action==='deadline_time'?`Klokkeslett ${attempt.payload.deadline_time} gjelder nå for hele prosjektet. Datoene er uendret.`:`Bestillingsfristen er lagret for ${attempt.payload.units.length} boliger. Ingen avtalesvarfrister er endret.`);}
   setData(next);setConfirmed(false);onChanged?.();
  }catch(e){if(alive.current){setError(e.message);if(e.code==='PT409'){save({pending:null});setConfirmed(false);}if(e.code==='42501')setData(null);}}
  finally{operating.current=false;if(alive.current)setBusy(false);}
 };
 const send=async()=>{
  if(operating.current||!data?.mail_enabled||!confirmed||!latest.current.prepared)return;
  operating.current=true;++generation.current;setBusy(true);setError('');
  try{for(const item of latest.current.attempts){
   if(!alive.current)return;if(item.status==='sent')continue;
   const current=await residentMailRpc(context,root.id,item.unit_id,item.target_id,'portal',item.token,item.email);
   if(!alive.current)return;
   if(!current.enabled)throw Error('E-postutsending er pauset i dette miljøet.');
   if(current.revision!==item.revision||current.snapshot.to!==item.email)throw Error('Mottaker eller lenke er endret. Kontroller denne boligen før videre sending.');
   save({attempts:latest.current.attempts.map(a=>a.id===item.id?{...a,status:'pending'}:a)});
   await sendResidentInvitation(context,root.id,item.unit_id,item.target_id,'portal',item,item.token);
   if(!alive.current)return;
   save({attempts:latest.current.attempts.map(a=>a.id===item.id?{...a,status:'sent'}:a)});
  }if(alive.current){setNotice('E-posttjenesten har bekreftet alle sendingene. Dette er ikke en lesebekreftelse.');setConfirmed(false);}}
  catch(e){if(alive.current){setError(`${e.message} Bekreftede sendinger hoppes over ved fortsettelse. Uavklart sending bruker samme forsøksreferanse.`);if(e.code==='42501')setData(null);}}
  finally{operating.current=false;if(alive.current)setBusy(false);}
 };
 const unique=(field,label)=>[...new Map(units.filter(u=>u[field]).map(u=>[u[field],u[label]])).entries()];
 const canPublish=selected.every(u=>u.contacts?.[0]?.name?.trim().length>=2&&validResidentEmail(u.contacts?.[0]?.email));
 return <Dialog title="Beboerlenker og frister samlet" busy={busy} onClose={onClose} className="bolig-preparation-dialog bolig-resident-batch">
 <div className="bolig-preparation-body">
 {error&&<p role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}
 {!data?<><p>Oversikten må hentes med gyldig prosjektledertilgang.</p><button disabled={busy} onClick={load}>Hent siste oversikt</button></>:<>
 {!draft.prepared&&<fieldset disabled={locked}><label>Handling<select value={draft.mode} onChange={e=>change({mode:e.target.value})}><option value="links">Klargjør og send beboerlenker</option><option value="deadline">Sett bestillingsfrist</option>{Object.hasOwn(data,'deadline_time')&&<option value="time">Klokkeslett for hele prosjektet</option>}</select></label>
 {!projectClock&&<><div className="bolig-preparation-filters"><label>Bygg eller blokk<select value={block} onChange={e=>{setBlock(e.target.value);setConfirmed(false);}}><option value="">Alle bygg</option>{unique('block_id','block_name').map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label>
 <label>Stammegruppe<select value={group} onChange={e=>{setGroup(e.target.value);setConfirmed(false);}}><option value="">Alle stammer</option>{unique('group_id','group_name').map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label></div>
 <button type="button" onClick={()=>change({selected:[...new Set([...draft.selected,...shown.map(u=>u.id)])]})}>Velg alle viste boliger</button> <button type="button" onClick={()=>change({selected:[]})}>Tøm utvalget</button>
 {shown.map(u=><label key={u.id}><input type="checkbox" checked={draft.selected.includes(u.id)} onChange={e=>change({selected:e.target.checked?[...draft.selected,u.id]:draft.selected.filter(id=>id!==u.id)})}/>{u.block_name} · Bolig {u.number} · {u.group_name||'Uten stamme'} · Frist: {u.deadline||'Ikke satt'}{u.portal_active?' · Har aktiv lenke':''}</label>)}</>}
 {draft.mode==='deadline'&&<label>Bestillingsdato ({data.deadline_time?`kl. ${data.deadline_time}`:'til slutten av dagen'}, norsk tid)<input type="date" value={draft.deadline} onChange={e=>change({deadline:e.target.value})}/></label>}
 {projectClock&&<><label>Felles klokkeslett (norsk tid)<input type="time" value={clock} onChange={e=>change({deadline_time:e.target.value})}/></label><p>Gjelder alle {units.length} boliger, uansett bygg, filter eller utvalg. Datoene beholdes. Nå: {data.deadline_time||'slutten av dagen'} → {clock}. En tidligere tid kan stenge valg som er åpne nå.</p></>}
 </fieldset>}
 {!draft.prepared&&!projectClock&&<section><h3>Kontroller {selected.length} valgte boliger</h3>
 <ul>{selected.map(u=><li key={u.id}>{u.block_name} · {u.number}{draft.mode==='deadline'?` · ${u.deadline||'Ingen frist'} → ${draft.deadline||'Velg dato'}`:` · ${u.offer_count} valgmuligheter`}</li>)}</ul>
 {draft.mode==='links'?<><p>{audience.recipients.length} separate e-poster. Eierne på samme bolig får samme portal. {audience.missing.length} kontakter uten gyldig e-post får ingen melding.</p>
 <ul>{audience.recipients.map(r=><li key={`${r.unit_id}/${r.email}`}>Bolig {r.number}: {r.name} · {r.email}</li>)}{audience.missing.map((r,i)=><li key={`missing-${i}`}>Bolig {r.number}: {r.name||'Mangler navn'} – mangler gyldig e-post</li>)}</ul>
 {!canPublish&&<p role="alert">Alle valgte boliger må ha navn og gyldig e-post på hovedkontakten før lenker kan klargjøres.</p>}
 {selected.some(u=>u.portal_active)&&<label><input disabled={locked} type="checkbox" checked={replace} onChange={e=>{setReplace(e.target.checked);setConfirmed(false);}}/>Erstatt eksisterende lenker for disse boligene. Gamle lenker slutter å virke.</label>}
 <p>Klargjøring deler boligens klargjorte valgmuligheter. Ingen avtaler aksepteres og ingen bestillinger opprettes.</p></>:<p>Etter fristen stoppes nye tilvalg. Meldinger og eksisterende avtaler beholdes. Gi en ny frist til utvalgte boliger for å åpne igjen.</p>}
 </section>}
 {draft.prepared&&<section><h3>Mottakere og sendestatus</h3><p>Samme lenke deles bare med registrerte eiere på den aktuelle boligen.</p>
 <ul>{draft.attempts.map(a=><li key={a.id}>Bolig {a.number}: {a.name} · {a.email} — {a.status==='sent'?'Sending bekreftet':a.status==='pending'?'Uavklart – fortsett samme sending':'Klar'} <a href={portalUrl(a.token)} target="_blank" rel="noreferrer">Åpne boligportal</a></li>)}</ul>
 {!data.mail_enabled&&<p>E-postutsending er pauset i dette miljøet. Ingen meldinger kan sendes her nå.</p>}
 </section>}
 <label><input disabled={busy||!!draft.pending} type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/>{draft.prepared?'Jeg har kontrollert mottakerne og vil sende til disse eierne':projectClock?'Jeg bekrefter klokkeslettet for hele prosjektet':'Jeg har kontrollert boligene og innholdet ovenfor'}</label>
 </>}
 </div><footer className="bolig-preparation-footer"><button disabled={busy} onClick={onClose}>Lukk og behold utkast</button>
 {draft.pending?<button disabled={busy||!data} onClick={()=>run(true)}>Kontroller samme handling igjen</button>:draft.prepared?<>
 <button disabled={busy||!confirmed||!data?.mail_enabled||draft.attempts.every(a=>a.status==='sent')} onClick={send}>Bekreft utsending til {draft.attempts.filter(a=>a.status!=='sent').length} eiere</button>
 {!draft.attempts.some(a=>a.status==='pending')&&<button disabled={busy} onClick={()=>change({prepared:null,attempts:[],selected:[]})}>{draft.attempts.every(a=>a.status==='sent')?'Start nytt utvalg':'Avslutt listen uten flere sendinger'}</button>}
 </>:<button disabled={busy||!data||!confirmed||(projectClock?!clock:!selected.length||(draft.mode==='deadline'?!draft.deadline:!canPublish||(selected.some(u=>u.portal_active)&&!replace)))} onClick={()=>run(false)}>{projectClock?'Bekreft klokkeslett for hele prosjektet':draft.mode==='deadline'?'Bekreft bestillingsfrist':'Klargjør valgte beboerlenker'}</button>}
 </footer></Dialog>;
}
