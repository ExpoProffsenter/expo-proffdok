import React,{useEffect,useRef,useState} from 'react';
import {collaborationRpc} from './boligCollaborationClient.js';
import {boligDraftKey,readBoligDraft,writeBoligDraft} from './boligClient.js';
import {agreementMoney as money} from './boligCommerceCore.js';
import {newShopLine,shopDraftFrom,shopPayload,shopPhoto,shopTotal} from './boligShopCore.js';
import Summary from './BoligAgreementSummary.jsx';
import Lookup from './BoligCatalogLookup.jsx';
export default function BoligShopProposal({context,root,unit,onSwitchBlocked}){
 const key=boligDraftKey(context,root.id,`shop-${unit.id}`),epoch=useRef(0),operating=useRef(false),latest=useRef(null),reviewHeading=useRef(null);
 const [data,setData]=useState(null),[draft,setDraft]=useState(null),[pending,setPending]=useState(null),[error,setError]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false),[review,setReview]=useState(null),[lookup,setLookup]=useState(false),[uploading,setUploading]=useState(false);
 useEffect(()=>{if(review){reviewHeading.current?.focus({preventScroll:true});reviewHeading.current?.scrollIntoView?.({block:"start",behavior:"auto"});}},[review]);
 useEffect(()=>{onSwitchBlocked?.(busy||uploading);return()=>onSwitchBlocked?.(false);},[busy,uploading,onSwitchBlocked]);
 const rpc=(action='get',payload={})=>collaborationRpc('bolig_shop_proposal',{p_company_id:context.company_id,p_root_id:root.id,p_unit_id:unit.id,p_action:action,p_payload:payload},context.user_id).then(next=>{if(next.root_id!==root.id||next.unit_id!==unit.id||next.context.company_id!==context.company_id)throw Error('Boligen er endret. Åpne den på nytt.');return next;});
 const persist=value=>{if(!writeBoligDraft(key,value))throw Error('Kladden kunne ikke sikres lokalt. Behold siden åpen.');latest.current=value;};
 const load=async(n=epoch.current)=>{const next=await rpc();if(n!==epoch.current)return;setData(next);if(!latest.current){const doc=next.documents.find(d=>d.status==='published');setDraft(shopDraftFrom(doc));}else {setDraft(latest.current.draft);setPending(latest.current.pending||null);}};
 useEffect(()=>{const n=++epoch.current;latest.current=readBoligDraft(key,null);load(n).catch(e=>{if(n===epoch.current)setError(e.message);});return()=>{++epoch.current;};},[key]);
 const change=next=>{try{persist({draft:next,pending:null,basis:latest.current?.basis||data.basis});setDraft(next);setReview(null);setNotice('');setError('');}catch(e){setError(e.message);}};
 const lineChange=(id,fields)=>change({...draft,lines:draft.lines.map(l=>l.key===id?{...l,...fields}:l)});
 const publish=async()=>{if(operating.current||uploading||(!pending&&!review))return;operating.current=true;setBusy(true);setError('');const n=epoch.current;
 try{const attempt=pending||{...review,request_id:crypto.randomUUID(),reviewed:true};persist({draft,pending:attempt,basis:attempt.basis});setPending(attempt);const next=await rpc('publish',attempt);if(n!==epoch.current)return;persist(null);setData(next);setDraft(shopDraftFrom(next.documents.find(d=>d.status==='published')));setPending(null);setReview(null);setNotice('Forslaget er publisert. Beboerportalen oppdateres automatisk innen 20 sekunder. Venter på beboerens aksept.');}
 catch(e){if(n===epoch.current){setError(e.message);if(['PT409','42501','22023'].includes(e.code)){persist({draft,pending:null,basis:latest.current?.basis});setPending(null);setReview(null);if(e.code==='42501')setData(null);}}}
 finally{operating.current=false;if(n===epoch.current)setBusy(false);}};
 const refresh=async()=>{setBusy(true);setError('');setNotice('');setReview(null);try{const next=await rpc();setData(next);if(!latest.current){setDraft(shopDraftFrom(next.documents.find(d=>d.status==='published')));}else if(draft){persist({draft,pending:null,basis:next.basis});setNotice('Siste status er hentet. Din kladd er beholdt. Sammenlign med publisert forslag før du oppdaterer.');}}catch(e){setError(e.message);if(e.code==='42501')setData(null);}finally{setBusy(false);}};
 const canEdit=data?.context.publish_shop&&data.portal_ready&&data.has_base;
 return <section className="bolig-shop" aria-label="Butikktillegg"><h3>Butikktillegg · bolig {unit.number}</h3><p>Legg til varer og eventuell montering. Alle priser er beboerens priser inkludert mva. Grunnpakken og tidligere avtaler beholdes.</p>
 {error&&<p role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}
 {!data&&!error&&<p role="status">Henter bolig og avtaler …</p>}
 {data&&<><details><summary>Grunnlag · {data.base_goods.length} varelinjer</summary><ul>{data.base_goods.map(g=><li key={g.key}>{g.quantity} {g.unit} · {g.name} {g.sku&&`· ${g.sku}`}</li>)}</ul><small>Grunnpakke og tidligere boligvalg. Disse endres ikke av butikktillegget.</small></details>
 {!data.portal_ready&&<p role="alert">Prosjektleder må aktivere beboerportalen for denne boligen først.</p>}{!data.has_base&&<p role="alert">Prosjektleder må lagre boligens grunnpakke først.</p>}{!data.context.publish_shop&&<p>Du kan se forslagene. Prosjektleder må gi deg rettigheten «Publisere butikktillegg» for å sende et forslag til beboeren.</p>}
 <button type="button" disabled={busy||!!pending||uploading} onClick={refresh}>Hent siste status</button>
 {data.documents.filter(d=>['published','accepted','handled'].includes(d.status)).map(d=><details key={d.id}><summary>{d.status==='published'?'Publisert – venter på svar':'Akseptert'} · {d.snapshot.reason} · {money(d.snapshot.delta_cents)}</summary><Summary document={d}/></details>)}
 {draft&&canEdit&&<><fieldset disabled={busy||!!pending||uploading}><legend>Nytt eller oppdatert forslag</legend>
 <label>Tittel<input maxLength={160} value={draft.title} onChange={e=>change({...draft,title:e.target.value})}/></label>
 <button type="button" onClick={()=>setLookup(!lookup)}>{lookup?'Skjul varesøk':'Finn vare i din katalog'}</button>{lookup&&<Lookup context={{...context,collaboration_root:root.id}} onUse={item=>{change({...draft,lines:[...draft.lines,newShopLine(item)]});setLookup(false);}}/>}
 {draft.lines.map((line,i)=><article className="bolig-shop-line" key={line.key}><h4>Vare {i+1}</h4><div className="bolig-shop-grid">
 {[['name','Varenavn'],['sku','Varenummer (valgfritt)'],['room_name','Rom / plassering (valgfritt)'],['quantity','Antall'],['unit','Enhet'],['price','Beboerpris per enhet (kr inkl. mva.)'],['installation','Montering for denne varelinjen (kr inkl. mva.)']].map(([field,label])=><label key={field}>{label}<input inputMode={['price','installation','quantity'].includes(field)?'decimal':undefined} value={line[field]} onChange={e=>lineChange(line.key,{[field]:e.target.value})}/></label>)}
 </div><label>Bilde fra enheten (valgfritt)<input type="file" accept="image/jpeg,image/png,image/webp" onChange={async e=>{const file=e.target.files?.[0];e.target.value='';if(!file)return;const n=epoch.current;setUploading(true);try{const image_url=await shopPhoto(file);if(n===epoch.current)lineChange(line.key,{image_url});}catch(err){if(n===epoch.current)setError(err.message);}finally{if(n===epoch.current)setUploading(false);}}}/></label>
 <label>Bildelenke (valgfritt)<input type="url" placeholder="https://…" value={line.image_url.startsWith('data:')?'':line.image_url} onChange={e=>lineChange(line.key,{image_url:e.target.value})}/></label>
 {line.image_url&&<div className="bolig-shop-image"><img src={line.image_url} alt={line.name||'Valgt varebilde'} referrerPolicy="no-referrer"/><button type="button" onClick={()=>lineChange(line.key,{image_url:''})}>Fjern bilde</button></div>}
 <button type="button" onClick={()=>change({...draft,lines:draft.lines.filter(l=>l.key!==line.key)})}>Fjern vare {i+1}</button></article>)}
 <button type="button" disabled={draft.lines.length>=50} onClick={()=>change({...draft,lines:[...draft.lines,newShopLine()]})}>Legg til vare manuelt</button>
 </fieldset><small>{uploading?'Klargjør bilde …':'Kladden sikres i denne nettleseren. Beboeren ser først forslaget når du publiserer.'}</small>
 {!review&&!pending&&<button type="button" disabled={busy||uploading||!draft.lines.length} onClick={()=>{try{const payload=shopPayload(draft);setReview({...payload,basis:latest.current?.basis||data.basis});setError('');}catch(e){setError(e.message);}}}>Kontroller beboerens forslag</button>}
 {review&&<><p><strong>Mottaker: bolig {unit.number} · {unit.address} · {unit.contact_name||'Kontakt ikke registrert'}</strong></p><h4 ref={reviewHeading} tabIndex={-1} style={{scrollMarginTop:16}}>Kontroller før publisering</h4><Summary document={{kind:'change',snapshot:{source:'shop',reason:review.title,shop_lines:review.lines,goods:review.lines,before_goods:[],delta_cents:shopTotal(review),base_goods:data.base_goods}}}/><p>Dette publiserer forslaget i den eksisterende beboerportalen. En tidligere ubesvart utgave av butikktillegget erstattes.</p></>}
 {(review||pending)&&<button type="button" disabled={busy||uploading} onClick={publish}>{busy?'Oppdaterer …':pending?'Kontroller samme publisering igjen':'Oppdater beboerportalen'}</button>}
 </>}
 </>}
 </section>;
}
