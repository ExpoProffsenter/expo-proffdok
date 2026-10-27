import React,{useRef,useState} from 'react';
import OrderCatalogLookup from './OrderCatalogLookup.jsx';
import {orderRpc,orderScope,readOrderDraft,writeOrderDraft,sendProCatalogOrder} from './proCatalogOrderClient.js';
import './proCatalogOrders.css';
import {parseOrderQuantity,stepOrderQuantity,formatOrderQuantity} from './orderQuantity.mjs';
const empty=()=>({query:'',items:[],to:'',recipient_name:'',reference:'',address:'',requested_date:'',requested_time:'',note:'',deliveryChoice:'agreed',attempt:null,preview:null,uncertain:false,sent:false});
export default function ProCatalogOrders({context,pending=false,mode='search',onSearch,onOrder}){
 const [draft,setDraft]=useState(()=>({...empty(),...readOrderDraft(context)})),[contacts,setContacts]=useState(context.contacts||[]),[error,setError]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false);
 const internal=context.internal_catalog===true,[searchOpen,setSearchOpen]=useState(!draft.items.length),[searchFocus,setSearchFocus]=useState(0),[quantityFocus,setQuantityFocus]=useState(null);
 const quantityInputs=useRef(new Map()),focusSequence=useRef(0);
 const latest=useRef(draft),alive=useRef(true),scope=orderScope(context),scopeRef=useRef(scope),lock=useRef(false);latest.current=draft;scopeRef.current=scope;
 React.useEffect(()=>{alive.current=true;return()=>{alive.current=false;};},[]);
 React.useEffect(()=>setContacts(context.contacts||[]),[context.contacts]);
 const persist=next=>{writeOrderDraft(context,next);latest.current=next;setDraft(next);};
 const change=fields=>{if(lock.current||pending||draft.uncertain||draft.sent)return false;try{persist({...latest.current,...fields,attempt:null,preview:null});setError('');return true;}catch{setNotice('');setError('Kladden kunne ikke sikres. Behold siden åpen.');return false;}};
 const valid=()=>alive.current&&scopeRef.current===scope;
 const run=async job=>{if(lock.current||pending)return;lock.current=true;setBusy(true);setError('');try{await job();}catch(e){if(valid())setError(e.message);}finally{lock.current=false;if(valid())setBusy(false);}};
 const openItemSearch=()=>{if(lock.current||pending||latest.current.uncertain||latest.current.sent)return;setSearchOpen(true);setSearchFocus(++focusSequence.current);};
 const updateQuantity=(id,value)=>change({items:latest.current.items.map(x=>x.id===id?{...x,quantity:value}:x)});
 const stepQuantity=(id,direction)=>{const item=latest.current.items.find(x=>x.id===id);if(!item)return;const next=stepOrderQuantity(item.quantity,direction);if(next===null){setError('Skriv et gyldig antall først. Bruk komma eller punktum for desimaler.');quantityInputs.current.get(id)?.focus();return;}updateQuantity(id,next);};
 const quantityKey=(event,item)=>{
  if(event.isComposing)return;
  if(event.key==='ArrowUp'||event.key==='ArrowDown'){event.preventDefault();stepQuantity(item.id,event.key==='ArrowUp'?1:-1);return;}
  if(event.key!=='Enter')return;event.preventDefault();
  const value=parseOrderQuantity(latest.current.items.find(x=>x.id===item.id)?.quantity);
  if(value===null){setError('Antall må være over null og høyst 99999, med inntil tre desimaler.');return;}
  if(updateQuantity(item.id,formatOrderQuantity(value)))openItemSearch();
 };
 const add=item=>{
  const items=latest.current.items,found=items.find(x=>x.id===item.id);
  if(!found&&items.length>=100){setError('En bestilling kan ha høyst 100 ulike varer.');return false;}
  const next=found?stepOrderQuantity(found.quantity,1):'1';
  if(next===null||found&&next===found.quantity){setError('Kontroller antallet på varen som allerede er valgt. Maksimalt antall er 99999.');return false;}
  const added=change({query:'',items:found?items.map(x=>x.id===item.id?{...x,quantity:next}:x):[...items,{id:item.id,description:item.description,supplier_name:item.supplier_name,supplier_product_number:item.supplier_product_number,quantity:next}]});
  if(added){setNotice('Varen er lagt i bestillingen.');setSearchOpen(false);setSearchFocus(0);setQuantityFocus({id:item.id,sequence:++focusSequence.current});}
  return added;
 };
 const payload=()=>({to:draft.to,recipient_name:draft.recipient_name,reference:draft.reference,address:draft.address,requested_date:draft.deliveryChoice==='requested'?draft.requested_date:'',requested_time:draft.deliveryChoice==='requested'?draft.requested_time:'',note:draft.note,items:draft.items.map(i=>({id:i.id,quantity:i.quantity}))});
 const review=e=>{e.preventDefault();run(async()=>{const attempt={companyId:context.company_id,requestId:crypto.randomUUID(),order:payload()};const result=await orderRpc('pro_catalog_order_prepare',{p_company_id:attempt.companyId,p_request_id:attempt.requestId,p_order:attempt.order});if(valid())persist({...latest.current,attempt,preview:result.snapshot,uncertain:false,sent:false});});};
 const send=()=>run(async()=>{if(!draft.attempt||draft.sent)return;
  // Persist an unresolved state BEFORE starting transport. Closing/reloading keeps the same retry identity.
  const attempt=draft.attempt;persist({...latest.current,uncertain:true});
  try{await sendProCatalogOrder(attempt);if(valid())persist({...latest.current,uncertain:false,sent:true});}
  catch(e){if(valid()){persist({...latest.current,uncertain:e.uncertain!==false});throw e;}}
 });
 const contact=action=>run(async()=>{const result=await orderRpc('pro_catalog_order_contact',{p_company_id:context.company_id,p_action:action,p_contact:action==='save'?{name:draft.recipient_name,email:draft.to}:{id:contacts.find(c=>c.email===draft.to)?.id}});if(valid()){setContacts(result.contacts);setNotice(action==='save'?'Mottakeren er lagret for firmaet.':'Mottakeren er fjernet fra listen.');}});
 const disabled=busy||pending||draft.uncertain||draft.sent;
 const reset=()=>{try{persist(empty());setSearchOpen(true);setSearchFocus(++focusSequence.current);setError('');setNotice('Ny bestilling er klar.');}catch{setError('Kunne ikke rydde kladden.');}};
 const preview=draft.preview;
 React.useEffect(()=>{if(!quantityFocus||disabled)return;const input=quantityInputs.current.get(quantityFocus.id);if(input){input.focus();input.select();input.scrollIntoView({block:'nearest'});}setQuantityFocus(null);},[quantityFocus,disabled]);
 return <section className="pro-catalog-orders" aria-label={mode==='search'?'Varesøk':'Varebestilling'} aria-busy={busy||pending}>
  <header><div><small>{context.company.companyName}</small><h2>{mode==='search'?'Varesøk':'Varebestilling'}</h2><p>Finn varer i firmaets katalog, velg antall og send en bestilling. Mottakeren bekrefter ordren og leveringstidspunktet.</p></div><button type="button" className="secondary" disabled={mode==='search'?false:disabled} onClick={mode==='search'?onOrder:openItemSearch}>{mode==='search'?`Se varebestilling (${draft.items.length})`:'Finn flere varer'}</button></header>
  {pending&&<p role="status">Kontrollerer tilgangen …</p>}{error&&<p role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}
  {mode==='search'&&disabled&&<p>{draft.sent?'Bestillingen er sendt. Åpne varebestillingen for å starte en ny.':draft.uncertain?'Sendingen må avklares. Åpne varebestillingen og prøv samme sending igjen.':'Vent mens tilgangen kontrolleres.'}</p>}
  <div className="pro-order-cart"><h3>Varer i bestillingen · {draft.items.length}</h3><p className="pro-order-entry-help">Bruk +/− eller skriv antall. Trykk Enter i antallsfeltet for å legge til neste vare.</p>{!draft.items.length&&<p>Bestillingen er tom. Søk etter en vare nedenfor, velg treffet og angi antall.</p>}
   {draft.items.map(i=><article key={i.id}><div className="pro-order-item-identity"><strong>{i.description}</strong><small>{i.supplier_name} · varenr. {i.supplier_product_number}</small></div><label>Antall<div className="pro-order-quantity"><button type="button" className="secondary" aria-label={'Reduser antall '+i.description} disabled={disabled||(parseOrderQuantity(i.quantity)!==null&&parseOrderQuantity(i.quantity)<=1)} onClick={()=>stepQuantity(i.id,-1)}>−</button><input ref={node=>{if(node)quantityInputs.current.set(i.id,node);else quantityInputs.current.delete(i.id);}} role="spinbutton" aria-label={'Antall '+i.description} aria-valuemin={0.001} aria-valuemax={99999} aria-valuenow={parseOrderQuantity(i.quantity)??undefined} inputMode="decimal" value={i.quantity} disabled={disabled} onKeyDown={e=>quantityKey(e,i)} onChange={e=>updateQuantity(i.id,e.target.value)}/><button type="button" className="secondary" aria-label={'Øk antall '+i.description} disabled={disabled||parseOrderQuantity(i.quantity)>=99999} onClick={()=>stepQuantity(i.id,1)}>+</button></div></label><button type="button" className="secondary" disabled={disabled} onClick={()=>change({items:draft.items.filter(x=>x.id!==i.id)})}>Fjern</button></article>)}
   {!disabled&&!preview&&<div className="pro-order-add-row">{mode==='search'||searchOpen?<><strong>Legg til neste vare</strong><OrderCatalogLookup internal={internal} focusRequest={searchFocus} initialQuery={draft.query||''} onQueryChange={query=>change({query})} onUse={add} placeholder="Søk og legg varer i bestillingen"/></>:<button type="button" className="secondary" onClick={openItemSearch}>+ Legg til vare</button>}</div>}
  </div>
  {mode==='order'&&(draft.sent?<div className="pro-order-receipt" role="status"><h3>Bestillingen er sendt</h3><p>E-posttjenesten har bekreftet sending til <strong>{preview?.to}</strong>. Ordren og leveringstidspunktet må bekreftes av mottakeren.</p><p>Ordrebekreftelse er bedt sendt til {preview?.replyTo}.</p><button type="button" onClick={reset}>Ny bestilling</button></div>:preview?<div className="pro-order-preview"><h3>Se over bestillingen</h3><p><strong>Til:</strong> {preview.recipient_name} · {preview.to}</p><p><strong>Fra:</strong> {preview.company.companyName} · {preview.replyTo}</p><p><strong>Referanse:</strong> {preview.reference||'Ikke oppgitt'}</p><p><strong>Levering:</strong> {preview.address} · {preview.requested_date||'Tidspunkt avtales'} {preview.requested_time}</p><p>{preview.note}</p><ul>{preview.goods.map(g=><li key={g.id}>{g.quantity} × {g.name} · {g.sku} · {g.supplier}</li>)}</ul><p>ASCII og Excel inneholder samme varer og antall. Mottakeren blir bedt om å sende ordrebekreftelse med leveringstidspunkt til {preview.replyTo}.</p>{draft.uncertain&&<p role="alert">Svar på sendingen mangler. Prøv samme sending igjen for å unngå dobbeltbestilling.</p>}<div className="pro-order-actions"><button type="button" disabled={busy||pending} onClick={send}>{busy?'Sender …':draft.uncertain?'Prøv samme sending igjen':'Send bestilling'}</button>{!draft.uncertain&&<button type="button" className="secondary" disabled={busy||pending} onClick={()=>change({preview:null})}>Rediger bestilling</button>}</div></div>:<form onSubmit={review}><h3>Mottaker og levering</h3><fieldset disabled={disabled}>
   <label>Lagret mottaker<select aria-label="Lagret mottaker" value={contacts.find(c=>c.email===draft.to)?.id||''} onChange={e=>{const c=contacts.find(x=>x.id===e.target.value);change({to:c?.email||'',recipient_name:c?.name||''});}}><option value="">Skriv inn mottaker</option>{contacts.map(c=><option key={c.id} value={c.id}>{c.name} · {c.email}</option>)}</select></label>
   <div className="pro-order-fields"><label>Mottakernavn<input required maxLength={120} value={draft.recipient_name} onChange={e=>change({recipient_name:e.target.value})}/></label><label>E-post til mottaker<input required type="email" maxLength={254} value={draft.to} onChange={e=>change({to:e.target.value})}/></label></div><div className="pro-order-actions"><button type="button" className="secondary" disabled={!draft.to||!draft.recipient_name} onClick={()=>contact('save')}>Lagre mottaker</button>{contacts.some(c=>c.email===draft.to)&&<button type="button" className="secondary" onClick={()=>contact('delete')}>Fjern lagret mottaker</button>}</div>
   <label>Bestillingsreferanse (valgfritt)<input maxLength={120} value={draft.reference} placeholder="Prosjektnummer, navn eller adresse" onChange={e=>change({reference:e.target.value})}/></label>
   <label>Leveringsadresse<textarea required maxLength={500} rows={2} value={draft.address} onChange={e=>change({address:e.target.value})}/></label>
   <label>Leveringstidspunkt<select aria-label="Leveringstidspunkt" value={draft.deliveryChoice} onChange={e=>change({deliveryChoice:e.target.value})}><option value="agreed">Avtales med mottaker</option><option value="requested">Jeg ønsker et bestemt tidspunkt</option></select></label>
   {draft.deliveryChoice==='requested'&&<div className="pro-order-fields"><label>Ønsket leveringsdato<input type="date" required value={draft.requested_date} onChange={e=>change({requested_date:e.target.value})}/></label><label>Ønsket klokkeslett (valgfritt, norsk tid)<input type="time" value={draft.requested_time} onChange={e=>change({requested_time:e.target.value})}/></label></div>}
   <label>Merknad (valgfritt)<textarea maxLength={2000} rows={3} value={draft.note} onChange={e=>change({note:e.target.value})}/></label>
   <p>Ordrebekreftelse skal sendes til <strong>{context.replyTo}</strong>. Mottakeren får en tydelig påminnelse om dette i e-posten.</p><p>Ønsket levering må bekreftes av mottakeren. Kladden beholdes i denne nettleseren til bestillingen er sendt eller du starter en ny.</p><button type="submit" disabled={!draft.items.length}>{busy?'Henter grunnlaget …':'Se over bestillingen'}</button>
  </fieldset></form>)}
 </section>;
}
