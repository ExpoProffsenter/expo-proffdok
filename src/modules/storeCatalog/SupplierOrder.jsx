import React, { useEffect, useRef, useState } from 'react';
import { Mail } from 'lucide-react';
import { supplierOrderContext, deleteSupplierOrderContact, prepareSupplierOrder, sendSupplierOrder } from './supplierOrderClient.js';
import './supplierOrder.css';

export default function SupplierOrder({items,companyId,orderNumber='',disabled=false}) {
 const [open,setOpen]=useState(false),[context,setContext]=useState(null),[loadError,setLoadError]=useState('');
 const [contact,setContact]=useState(''),[name,setName]=useState(''),[email,setEmail]=useState('');
 const [reference,setReference]=useState(orderNumber),[address,setAddress]=useState(''),[message,setMessage]=useState('');
 const [remember,setRemember]=useState(false),[excluded,setExcluded]=useState([]);
 const [preview,setPreview]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[sent,setSent]=useState(false),[uncertain,setUncertain]=useState(false);
 const attempt=useRef(null),busyRef=useRef(false),panel=useRef(null),referenceTouched=useRef(false);
 const allowed=!disabled&&Boolean(companyId);
 const selected=items.filter(i=>!excluded.includes(i.id)).map(i=>i.id);
 useEffect(()=>{
  if(!open||context)return;
  let live=true;
  supplierOrderContext(companyId).then(data=>{if(live){setContext(data);setLoadError('');}}).catch(e=>{if(live)setLoadError(e.message);});
  return()=>{live=false;};
 },[open,companyId,context]);
 useEffect(()=>{if(open)panel.current?.focus();},[open]);
 const chooseContact=id=>{
  setContact(id);const row=context?.contacts?.find(c=>c.id===id);
  setName(row?.name||'');setEmail(row?.email||'');setRemember(false);
 };
 const removeContact=async()=>{
  if(busyRef.current||!contact||!allowed)return;
  busyRef.current=true;setBusy(true);setError('');
  try{await deleteSupplierOrderContact(companyId,contact);setContext(current=>({...current,contacts:current.contacts.filter(c=>c.id!==contact)}));setContact('');}
  catch(e){setError(e.message);}finally{busyRef.current=false;setBusy(false);}
 };
 const review=async event=>{
  event.preventDefault();if(busyRef.current||!allowed)return;
  busyRef.current=true;setBusy(true);setError('');
  try{
   const chosen=items.filter(i=>selected.includes(i.id));
   if(!chosen.length)throw new Error('Velg minst én vare.');
   const quantities=chosen.map(i=>String(i.pickQuantity??i.quantity??'1').trim().replace(',','.'));
   if(quantities.some(q=>!/^\d+(\.\d{1,3})?$/.test(q)||Number(q)<0.001||Number(q)>99999))throw new Error('Kontroller antall i plukklisten før du bestiller.');
   const order={to:email.trim().toLowerCase(),supplierName:name.trim(),reference:reference.trim(),deliveryAddress:address.trim(),message:message.trim(),remember,items:chosen.map((i,n)=>({id:i.id,quantity:quantities[n]}))};
   const requestId=crypto.randomUUID();
   const result=await prepareSupplierOrder(companyId,requestId,order);
   attempt.current={requestId,order};setPreview(result.snapshot);setUncertain(false);
  }catch(e){setError(e.message||'Kunne ikke hente forhåndsvisningen.');}
  finally{busyRef.current=false;setBusy(false);}
 };
 const send=async()=>{
  if(busyRef.current||!allowed||!attempt.current||sent)return;
  busyRef.current=true;setBusy(true);setError('');
  try{await sendSupplierOrder(companyId,attempt.current.requestId,attempt.current.order);setSent(true);setUncertain(false);setContext(null);}
  catch(e){setError(e.message);setUncertain(e.uncertain!==false);}
  finally{busyRef.current=false;setBusy(false);}
 };
 const newOrder=()=>{setPreview(null);setSent(false);setError('');setRemember(false);attempt.current=null;setExcluded([]);};
 return <div className="supplierOrder">
  <button type="button" className="secondary" disabled={!allowed||!items.length||busy} aria-expanded={open} onClick={()=>{if(!open&&!referenceTouched.current&&!preview)setReference(orderNumber);setOpen(v=>!v);}}><Mail size={16}/> Send bestilling til leverandør</button>
  {open?<section className="supplierOrderPanel" ref={panel} tabIndex={-1} aria-label="Bestilling til leverandør">
   <h3>{sent?'Bestillingen er sendt':preview?'Se over bestillingen':'Send plukkliste som bestilling'}</h3>
   {sent?<>
    <p role="status">Bestillingen til {preview.supplierName} er sendt til <strong>{preview.to}</strong>. E-posttjenesten har bekreftet sendingen. Be leverandøren bekrefte bestillingen.</p>
    {preview.remember?<p>Leverandør og e-postadresse er lagret for firmaet.</p>:null}
    <p>Varene er fortsatt i plukklisten.</p><button type="button" className="secondary" onClick={newOrder}>Ny bestilling</button>
   </>:preview?<>
    <p><strong>Til:</strong> {preview.supplierName} · {preview.to}</p>
    <p><strong>Fra:</strong> {preview.company.companyName} · {preview.replyTo}</p>
    <p><strong>Referanse:</strong> {preview.reference||'Ikke oppgitt'}</p>
    {preview.deliveryAddress?<p className="supplierOrderText"><strong>Leveringsadresse:</strong> {preview.deliveryAddress}</p>:null}
    {preview.message?<p className="supplierOrderText"><strong>Melding:</strong> {preview.message}</p>:null}
    <div className="supplierOrderTable"><table><thead><tr>{['Vare','Vareleverandør','Varenummer','GTIN/EAN','Antall'].map(t=><th key={t}>{t}</th>)}</tr></thead><tbody>{preview.items.map(i=><tr key={i.id}><td>{i.description}</td><td>{i.supplier}</td><td>{i.number||'–'}</td><td>{i.gtin||'–'}</td><td>{i.quantity}</td></tr>)}</tbody></table></div>
    <p>Bestillingen sendes uten priser. Leverandøren kan svare direkte til {preview.replyTo}.</p>
    {preview.remember?<p>Leverandør og e-post lagres for firmaet når sendingen er bekreftet.</p>:null}
    <div className="supplierOrderActions"><button type="button" onClick={()=>void send()} disabled={busy||!allowed}>{busy?'Sender …':uncertain?'Prøv sending igjen':'Send bestilling'}</button>
    {!uncertain?<button type="button" className="secondary" disabled={busy} onClick={()=>{setPreview(null);setError('');}}>Rediger bestilling</button>:<p>Prøv samme sending igjen for å unngå dobbeltbestilling.</p>}</div>
   </>:!context?<div>{loadError?<><p role="alert">{loadError}</p><button type="button" className="secondary" onClick={()=>{setLoadError('');setOpen(false);}}>Lukk og prøv igjen</button></>:<p role="status">Henter leverandører og avsender …</p>}</div>:<form onSubmit={review}>
    <p>Velg varene som skal sendes til denne leverandøren. Bestillingen sendes uten priser.</p>
    <fieldset disabled={busy||!allowed}>
     <div className="supplierOrderFields">
      <label>Lagret leverandør<select aria-label="Lagret leverandør" value={contact} onChange={e=>chooseContact(e.target.value)}><option value="">Skriv inn leverandør selv</option>{context.contacts.map(c=><option key={c.id} value={c.id}>{c.name} – {c.email}</option>)}</select></label>
      {contact?<button type="button" className="secondary" onClick={()=>void removeContact()}>Slett lagret leverandør</button>:null}
      <label>Leverandørnavn<input required maxLength={120} value={name} onChange={e=>setName(e.target.value)} autoComplete="off"/></label>
      <label>E-post til leverandør<input required type="email" maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} autoComplete="off"/></label>
      <label>Bestillingsreferanse (valgfritt)<input maxLength={120} value={reference} onChange={e=>{referenceTouched.current=true;setReference(e.target.value);}} placeholder="Prosjektnummer, navn eller adresse"/></label>
      <label>Leveringsadresse (valgfritt)<textarea rows={2} maxLength={500} value={address} onChange={e=>setAddress(e.target.value)}/></label>
      <label>Melding til leverandør (valgfritt)<textarea rows={3} maxLength={2000} value={message} onChange={e=>setMessage(e.target.value)}/></label>
     </div>
     <label className="supplierOrderCheck"><input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)}/> Husk leverandør og e-post for senere bestillinger i firmaet</label>
     <div className="supplierOrderItems"><strong>Varer i bestillingen</strong>
      {new Set(items.map(i=>i.supplier_name)).size>1?<label>Velg varer fra vareleverandør<select aria-label="Velg varer fra vareleverandør" defaultValue="*" onChange={e=>setExcluded(items.filter(i=>e.target.value!=='*'&&(i.supplier_name||'')!==e.target.value).map(i=>i.id))}><option value="*">Alle varer</option>{[...new Set(items.map(i=>i.supplier_name||''))].map(s=><option key={s} value={s}>{s||'Ukjent leverandør'}</option>)}</select></label>:null}
      {items.map(i=><label className="supplierOrderCheck" key={i.id}><input type="checkbox" checked={selected.includes(i.id)} onChange={e=>setExcluded(ids=>e.target.checked?ids.filter(id=>id!==i.id):[...ids,i.id])}/><span>{i.pickQuantity||i.quantity||1} × {i.description} <small>{i.supplier_name} · Varenr. {i.supplier_product_number||'–'}</small></span></label>)}
     </div>
     <p>Avsender: {context.company?.companyName}. Svar går til {context.replyTo}.</p>
     <button type="submit" disabled={!selected.length}>{busy?'Henter forhåndsvisning …':'Forhåndsvis bestilling'}</button>
    </fieldset>
   </form>}
   {error?<p role="alert">{error}</p>:null}
   <button type="button" className="secondary supplierOrderClose" disabled={busy} onClick={()=>setOpen(false)}>{sent?'Lukk':'Avbryt'}</button>
  </section>:null}
 </div>;
}
