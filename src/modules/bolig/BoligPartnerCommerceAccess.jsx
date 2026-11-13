import React,{useEffect,useRef,useState} from 'react';
import {boligDraftKey,readBoligDraft,writeBoligDraft} from './boligClient.js';
import {collaborationRpc} from './boligCollaborationClient.js';
export default function BoligPartnerCommerceAccess({context,root,partner}){
 const [data,setData]=useState(null),[draft,setDraft]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[confirmed,setConfirmed]=useState(false),[pending,setPending]=useState(null);
 const generation=useRef(0),operating=useRef(false),latest=useRef(null);
 const key=boligDraftKey(context,root.id,`partner-commerce-${partner.id}`);
 const persist=(value)=>{if(!writeBoligDraft(key,value))throw Error('Endringen kunne ikke sikres lokalt. Behold siden åpen.');latest.current=value;};
 const load=async(n=generation.current)=>{const v=await rpc();if(n===generation.current){setData(v);const saved=latest.current;setDraft(saved?.draft||v);setPending(saved?.pending||null);}};

 const rpc=(action='get',payload={},revision=null)=>collaborationRpc('bolig_partner_commerce_access',{p_company_id:context.company_id,p_root_id:root.id,p_access_id:partner.id,p_action:action,p_revision:revision,p_payload:payload},context.user_id);
 useEffect(()=>{const n=++generation.current;latest.current=readBoligDraft(key,null);setData(null);setDraft(null);setPending(null);setConfirmed(false);load(n).catch(e=>{if(n===generation.current)setError(e.code==='PGRST202'?'Persontilgang må klargjøres i dette miljøet.':e.message);});return()=>{++generation.current;};},[key]);
 const change=(field,value)=>{try{const next={...draft,[field]:value,...(field==='enabled'&&!value?{edit_choices:false,edit_catalog:false}:{})};persist({draft:next,pending:null});setDraft(next);setConfirmed(false);}catch(e){setError(e.message);}};

 const save=async()=>{if(operating.current||busy||(!pending&&!confirmed))return;operating.current=true;setBusy(true);setError('');const n=generation.current;
 const attempt=pending||{revision:data.revision,payload:{request_id:crypto.randomUUID(),reviewed:true,enabled:draft.enabled,edit_choices:draft.edit_choices,edit_catalog:draft.edit_catalog}};
 try{persist({draft,pending:attempt});setPending(attempt);const next=await rpc('save',attempt.payload,attempt.revision);if(n===generation.current){persist(null);setData(next);setDraft(next);setPending(null);setConfirmed(false);}}
 catch(e){if(n===generation.current){setError(e.message);if(['PT409','42501','22023'].includes(e.code)){persist({draft,pending:null});setPending(null);setConfirmed(false);if(e.code==='42501')setData(null);if(e.code==='PT409')await load(n);}}}
 finally{operating.current=false;if(n===generation.current)setBusy(false);}};
 return <section aria-label="Grunnpakke og tilvalg – persontilgang"><h3>Grunnpakke og tilvalg</h3><p>Gjelder bare {partner.name}, innlogget med {partner.email}. Vises på personens Min side → Mine samarbeid. Partnerlenken alene gir ikke tilgang til priser eller boligvalg.</p>
 {error&&<p role="alert">{error}</p>}{data&&draft&&<><p>{data.registered?'Kontaktens registrerte brukerkonto er funnet.':'Kontakten må ha godkjent brukerkonto hos Bademiljø Expo, Expo Proffsenter eller Ringside.'}</p>
 <fieldset disabled={busy||!!pending||!data.registered}>{[['enabled','Se prosjektets grunnpakker og tilvalg'],['edit_choices','Endre boligtilvalg, legge til varer og arbeid'],['edit_catalog','Redigere felles pakker for hele prosjektet']].map(([key,label])=><label key={key}><input type="checkbox" checked={draft[key]} onChange={e=>change(key,e.target.checked)} disabled={key!=='enabled'&&!draft.enabled}/>{label}</label>)}</fieldset>
 <p>Tilgangen følger partneradgangens utløpsdato og stoppes hvis den tilbakekalles. Ingen e-post sendes. Beboerens godkjenning gjøres i beboerportalen.</p>
 <label><input type="checkbox" checked={confirmed} disabled={busy||!!pending} onChange={e=>setConfirmed(e.target.checked)}/>Jeg har kontrollert personen og rettighetene</label>
 <button disabled={busy||!data.registered||(!pending&&!confirmed)} onClick={save}>{pending?'Kontroller samme lagring igjen':'Lagre personrettigheter'}</button>
 </>}
 </section>;
}
