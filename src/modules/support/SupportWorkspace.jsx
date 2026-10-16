import React,{useEffect,useRef,useState} from 'react';
import {getAppSupabaseClient} from '../access/appSupabaseClientRegistry.js';
import {WORK_PROFILE_EVENT} from '../access/workProfileClient.js';
import {MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT} from '../access/moduleAccessClient.js';
import {SUPPORT_CHANGED_EVENT} from './supportOverview.js';
import './support.css';
const statusLabels={new:'Ny',working:'Under behandling',solved:'Løst'};
const categoryLabels={question:'Spørsmål',error:'Feil i appen',suggestion:'Forslag'};
const deliveryLabels={pending:'Lagret · e-post venter',sending:'Lagret · utsending pågår',accepted:'Lagret · e-posttjenesten har akseptert meldingen',failed:'Lagret · e-postsending feilet',uncertain:'Lagret · e-poststatus er usikker',review:'Lagret · utsending må kontrolleres av Systemadmin'};
const date=value=>new Intl.DateTimeFormat('nb-NO',{dateStyle:'short',timeStyle:'short'}).format(new Date(value));
const uuid=()=>crypto.randomUUID();

export default function SupportWorkspace({authUser,admin=false,supabaseClient,standalone=false,requestedTicket=null}){
 const client=supabaseClient||getAppSupabaseClient();
 const [open,setOpen]=useState(()=>new URL(window.location.href).searchParams.has('supportCase'));
 const [epoch,setEpoch]=useState(0);
 // Every account/company/access invalidation immediately unmounts private content.
 // No support data or drafts are written to browser storage.
 useEffect(()=>{
  const clear=()=>setEpoch(n=>n+1);
  const events=[WORK_PROFILE_EVENT,MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT];
  events.forEach(e=>window.addEventListener(e,clear));
  return()=>{events.forEach(e=>window.removeEventListener(e,clear));};
 },[]);
 return <section className="pd-support" aria-label={admin?'Supportinnboks':'Kontakt support'}>
  {standalone?<header className="pd-support-page-heading"><span className="pd-support-eyebrow">{admin?'OPPFØLGING':'VI HJELPER DEG'}</span><h2>{admin?'Supportinnboks':'Support'}</h2><p>{admin?'Les nye henvendelser og fortsett dialogen i én sak om gangen.':'Send en henvendelse eller åpne en av sakene dine. Svar i appen og på e-post samles i samme samtale når e-post er aktivert.'}</p></header>:<button type="button" className="pd-support-launch" aria-expanded={open} onClick={()=>setOpen(v=>!v)}>
   <span><strong>{admin?'Support · innboks og svar':'Kontakt support'}</strong><small>{admin?'Følg opp henvendelser og svar i ProffDok.':'Send en henvendelse og følg dialogen her.'}</small></span><span aria-hidden="true">{open?'−':'+'}</span>
  </button>}
  {(standalone||open)&&<SupportSession key={`${authUser?.id}:${epoch}:${admin}`} client={client} userId={authUser?.id} admin={admin} requestedTicket={requestedTicket}/>}
 </section>;
}
export function SupportSession({client,userId,admin,requestedTicket}){
 const [context,setContext]=useState(null),[items,setItems]=useState([]),[total,setTotal]=useState(0);
 const [offset,setOffset]=useState(0),[filter,setFilter]=useState(''),[detail,setDetail]=useState(null),[creating,setCreating]=useState(false);
 const [subject,setSubject]=useState(''),[category,setCategory]=useState('question'),[body,setBody]=useState(''),[reply,setReply]=useState(''),[internal,setInternal]=useState(false);
 const [locked,setLocked]=useState(false);
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[mail,setMail]=useState(null);
 const alive=useRef(true),generation=useRef(0),busyRef=useRef(false),saveRequest=useRef(null),replyRequest=useRef(null),selection=useRef(null);
 async function rpc(name,args={}){const {data,error}=await client.rpc(name,args);if(error)throw error;return data;}
 async function invoke(input){
  const {data,error}=await client.functions.invoke('support-mail',{body:input});
  if(error||!data?.ok)throw Error('Meldingen er lagret. E-poststatus kunne ikke bekreftes. Prøv sending igjen.');return data;
 }
 async function list(ctx,page=offset,status=filter){
  const data=await rpc('support_list',{p_company_id:ctx.company_id,p_admin:admin,p_offset:page,p_status:status});return data;
 }
 useEffect(()=>{
  alive.current=true;const rev=++generation.current;
  async function load(){try{
   if(!client||!userId)throw Error('Logg inn for å bruke support.');
   const ctx=await rpc('support_context');if(ctx.user_id!==userId||admin&&!ctx.is_admin)throw Error('Du har ikke tilgang til support.');
   const data=await list(ctx,0,'');
   if(!alive.current||rev!==generation.current)return;
   setContext(ctx);setItems(data.items);setTotal(data.total);
   invoke({action:'status'}).then(info=>{if(alive.current&&rev===generation.current)setMail(info);}).catch(()=>{});
   const requested=requestedTicket?.id||new URL(window.location.href).searchParams.get('supportCase');
   if(/^[a-f0-9-]{36}$/i.test(requested||'')){
    const result=await rpc('support_get',{p_company_id:ctx.company_id,p_ticket_id:requested,p_admin:admin});
    if(alive.current&&rev===generation.current){selection.current=requested;setDetail(result);}
   }
  }catch(e){if(alive.current&&rev===generation.current)setError(e.code==='PGRST202'?'Support er ikke aktivert i dette miljøet ennå.':e.message||'Kunne ikke hente support.');}}
  void load();return()=>{alive.current=false;generation.current++;};
 },[client,userId,admin,requestedTicket?.id,requestedTicket?.nonce]);
 useEffect(()=>{
  if(!context)return;
  let active=true,revision=0;
  const revalidate=async()=>{
   const version=++revision;setLocked(true);
   if(document.visibilityState==='hidden')return;
   try{
    const fresh=await rpc('support_context');
    if(fresh.user_id!==userId||fresh.company_id!==context.company_id||admin&&!fresh.is_admin)throw Error('Tilgangen er endret. Åpne support på nytt.');
    await refresh(context);
    if(active&&version===revision)setLocked(false);
   }catch{if(active&&version===revision){setContext(null);setItems([]);setDetail(null);setReply('');setBody('');setSubject('');setError('Tilgangen er endret. Lukk og åpne support på nytt.');}}
  };
  window.addEventListener('focus',revalidate);document.addEventListener('visibilitychange',revalidate);
  return()=>{active=false;revision++;window.removeEventListener('focus',revalidate);document.removeEventListener('visibilitychange',revalidate);};
 },[context,client,userId,admin,offset,filter]);
 async function task(fn){if(busyRef.current||locked)return;busyRef.current=true;setBusy(true);setError('');setNotice('');try{await fn();}catch(e){if(alive.current){if(e.code==='42501'){setContext(null);setItems([]);setDetail(null);setReply('');setBody('');setSubject('');}setError(e.message||'Kunne ikke lagre. Prøv igjen.');}}finally{busyRef.current=false;if(alive.current)setBusy(false);}}
 async function refresh(ctx=context,page=offset,status=filter,ticket=selection.current){
  const data=await list(ctx,page,status);
  const result=ticket?await rpc('support_get',{p_company_id:ctx.company_id,p_ticket_id:ticket,p_admin:admin}):null;
  if(!alive.current)return;setItems(data.items);setTotal(data.total);if(ticket===selection.current)setDetail(result);
 }
 async function openTicket(id){await task(async()=>{
  const result=await rpc('support_get',{p_company_id:context.company_id,p_ticket_id:id,p_admin:admin});
  if(!alive.current)return;selection.current=id;setDetail(result);setItems(rows=>rows.map(t=>t.id===id?{...t,unread:false}:t));setCreating(false);setReply('');replyRequest.current=null;setInternal(false);window.dispatchEvent(new Event(SUPPORT_CHANGED_EVENT));
 });}
 async function sendEmail(messageId){
  const result=await invoke({companyId:context.company_id,messageId,admin});
  return result.state==='accepted'?'E-posttjenesten har akseptert meldingen. Mottak er ikke bekreftet.':result.state==='disabled'?'E-post er avslått i dette miljøet. Meldingen er lagret.':result.state==='not_configured'?'Meldingen er lagret. E-postoppsettet mangler.':result.state==='unchanged'?'Oppdatert sendestatus.':deliveryLabels[result.state]||'Meldingen er lagret.';
 }
 async function create(event){event.preventDefault();await task(async()=>{
  const input={subject:subject.trim(),category,body:body.trim()};
  if(!saveRequest.current||JSON.stringify(saveRequest.current.input)!==JSON.stringify(input))saveRequest.current={id:uuid(),input};
  const id=await rpc('support_create',{p_company_id:context.company_id,p_id:saveRequest.current.id,p_subject:input.subject,p_category:category,p_body:input.body});
  if(!alive.current)return;selection.current=id;setCreating(false);setSubject('');setBody('');saveRequest.current=null;
  setNotice('Henvendelsen er lagret.');await refresh(context,0,filter,id);setOffset(0);window.dispatchEvent(new Event(SUPPORT_CHANGED_EVENT));
  try{const text=await sendEmail(id);if(alive.current)setNotice(text);}catch(e){if(alive.current)setError(e.message);}
  await refresh(context,0,filter,id);
 });}
 async function sendReply(event){event.preventDefault();await task(async()=>{
  const input={ticket:detail.ticket.id,body:reply.trim(),internal:admin&&internal};
  if(!replyRequest.current||JSON.stringify(replyRequest.current.input)!==JSON.stringify(input))replyRequest.current={id:uuid(),input};
  const id=await rpc('support_reply',{p_company_id:context.company_id,p_ticket_id:input.ticket,p_id:replyRequest.current.id,p_body:input.body,p_admin:admin,p_internal:input.internal});
  if(!alive.current)return;setReply('');replyRequest.current=null;setNotice(input.internal?'Intern merknad er lagret.':'Svaret er lagret.');
  await refresh();
  window.dispatchEvent(new Event(SUPPORT_CHANGED_EVENT));
  if(!input.internal){try{const text=await sendEmail(id);if(alive.current)setNotice(text);}catch(e){if(alive.current)setError(e.message);}await refresh();}
 });}
 async function update(status,assigned){await task(async()=>{await rpc('support_update',{p_company_id:context.company_id,p_ticket_id:detail.ticket.id,p_revision:detail.ticket.revision,p_status:status,p_assigned_id:assigned||null});await refresh();if(alive.current)setNotice('Saken er oppdatert.');});}
 async function retry(id){await task(async()=>{const text=await sendEmail(id);await refresh();if(alive.current)setNotice(text);});}
 const leave=()=>{selection.current=null;setDetail(null);setCreating(false);setReply('');replyRequest.current=null;setError('');setNotice('');};
 if(locked&&context)return <div className="pd-support-content" role="status">Kontrollerer supporttilgang …</div>;
 return <div className="pd-support-content" aria-busy={busy}>
  {error&&<p role="alert" className="pd-support-error">{error}</p>}{notice&&<p role="status" className="pd-support-notice">{notice}</p>}
  {!context&&!error&&<p role="status">Henter support …</p>}
  {context&&<>
   <div className="pd-support-toolbar"><div><h3>{admin?'Supportinnboks':'Mine supportsaker'}</h3><p className="note">{admin?'Alle firmaer · bare Systemadmin har tilgang.':`${context.company} · bare du og Systemadmin kan lese sakene dine.`}</p></div>
    <div className="pd-support-actions"><button type="button" className="secondary" disabled={busy} onClick={()=>task(()=>refresh())}>Oppdater</button>{!admin&&!creating&&!detail&&<button type="button" disabled={busy} onClick={()=>{setCreating(true);setError('');setNotice('');}}>Ny henvendelse</button>}</div>
   </div>
   {creating?<form onSubmit={create} className="pd-support-form">
    <p>Beskriv hva du trenger hjelp med. Du får et saksnummer når du sender.</p>
    <p className="note">Avsender: {context.sender} · Firma: {context.company}</p>
    <label>Emne<input required maxLength={160} value={subject} disabled={busy} onChange={e=>setSubject(e.target.value)} placeholder="Hva gjelder det?"/></label>
    <label>Kategori<select aria-label="Kategori" value={category} disabled={busy} onChange={e=>setCategory(e.target.value)}>{Object.entries(categoryLabels).map(([v,t])=><option key={v} value={v}>{t}</option>)}</select></label>
    <label>Beskrivelse<textarea aria-label="Beskrivelse" required maxLength={12000} rows={6} value={body} disabled={busy} onChange={e=>setBody(e.target.value)} placeholder="Hva gjorde du, hva skjedde, og hva forventet du?"/></label>
    <p className="note">Ikke skriv passord eller sensitive personalopplysninger. Vedlegg støttes ikke ennå.</p>
    <div className="pd-support-actions"><button disabled={busy||!subject.trim()||!body.trim()}>{busy?'Lagrer …':'Send henvendelse'}</button><button type="button" className="secondary" disabled={busy} onClick={()=>setCreating(false)}>Avbryt</button></div>
   </form>:detail?<div className="pd-support-detail">
    <button type="button" className="secondary" disabled={busy} onClick={leave}>Tilbake til saker</button>
    <div className="pd-support-title"><span className={`pd-support-badge pd-support-${detail.ticket.status}`}>{statusLabels[detail.ticket.status]}</span><span>#{detail.ticket.number} · {categoryLabels[detail.ticket.category]}</span><h4>{detail.ticket.subject}</h4></div>
    {admin&&<p className="note">{detail.ticket.company} · {detail.ticket.owner}</p>}
    {admin&&<div className="pd-support-admin-controls"><label>Status<select aria-label="Status" disabled={busy} value={detail.ticket.status} onChange={e=>update(e.target.value,detail.ticket.assigned_id)}>{Object.entries(statusLabels).map(([v,t])=><option key={v} value={v}>{t}</option>)}</select></label><label>Ansvarlig<select aria-label="Ansvarlig" disabled={busy} value={detail.ticket.assigned_id||''} onChange={e=>update(detail.ticket.status,e.target.value)}><option value="">Ikke tildelt</option>{context.admins.map(a=><option key={a.id} value={a.id}>{a.label}</option>)}</select></label></div>}
    <ol className="pd-support-messages">{detail.messages.map(m=><li key={m.id} className={`pd-support-message pd-support-message-${m.kind}`}>
     <div className="pd-support-message-meta"><strong>{m.kind==='internal'?'Intern merknad · bare Systemadmin':m.kind==='support'?'ProffDok Support':'Henvendelse fra bruker'}</strong><span>{date(m.created_at)}{m.source==='email'?' · e-post':''}</span></div>
     <p className="pd-support-message-body">{m.body}</p>
     {m.delivery&&<div className="pd-support-delivery"><small>{mail?.mailEnabled===false?"Lagret · e-post er avslått i dette miljøet":deliveryLabels[m.delivery]}</small>{mail?.mailEnabled!==false&&['pending','failed','uncertain','sending'].includes(m.delivery)&&<button type="button" className="secondary" disabled={busy} onClick={()=>retry(m.id)}>Prøv sending igjen</button>}</div>}
    </li>)}</ol>
    <form onSubmit={sendReply} className="pd-support-form">
     {admin&&<label className="pd-support-checkbox"><input type="checkbox" checked={internal} disabled={busy} onChange={e=>setInternal(e.target.checked)}/>Intern merknad · ikke synlig for brukeren</label>}
     <label>{admin&&internal?'Intern merknad':'Skriv svar'}<textarea aria-label={admin&&internal?"Intern merknad":"Skriv svar"} required maxLength={12000} rows={4} value={reply} disabled={busy} onChange={e=>setReply(e.target.value)}/></label>
     <p className="note">{internal?'Merknaden lagres kun i saken.':mail?.emailRepliesEnabled?'Dialogen kan fortsette her eller ved direkte svar på e-posten.':'Du kan fortsette dialogen her. Direkte e-postsvar er ikke aktivert.'}</p>
     <button disabled={busy||!reply.trim()}>{busy?'Lagrer …':admin&&internal?'Lagre intern merknad':'Send svar'}</button>
    </form>
   </div>:<>
    <div className="pd-support-toolbar"><label>Vis status<select aria-label="Vis status" value={filter} disabled={busy} onChange={e=>{const v=e.target.value;setFilter(v);setOffset(0);task(()=>refresh(context,v===filter?offset:0,v,null));}}><option value="">Alle saker</option><option value="unread">{admin?'Uleste henvendelser':'Uleste svar'}</option>{Object.entries(statusLabels).map(([v,t])=><option key={v} value={v}>{t}</option>)}</select></label><span className="note">{total} saker{items.some(t=>t.unread)?' · uleste er merket':''}</span></div>
    <div className="pd-support-list">{items.map(t=><button type="button" key={t.id} className="pd-support-ticket" disabled={busy} onClick={()=>openTicket(t.id)}><span className="pd-support-ticket-main"><strong>{t.unread&&<span className="pd-support-unread">Ulest · </span>}#{t.number} {t.subject}</strong><small>{admin?`${t.company} · ${t.owner}`:categoryLabels[t.category]} · {date(t.updated_at)}</small></span><span className={`pd-support-badge pd-support-${t.status}`}>{statusLabels[t.status]}</span></button>)}</div>
    {!items.length&&<div className="pd-support-empty"><strong>{filter?'Ingen saker med denne statusen.':'Ingen supportsaker ennå.'}</strong><p>{admin?'Nye henvendelser vises her.':'Trykk Ny henvendelse når du trenger hjelp.'}</p></div>}
    {total>40&&<div className="pd-support-actions"><button type="button" className="secondary" disabled={busy||offset===0} onClick={()=>{const v=offset-40;setOffset(v);task(()=>refresh(context,v,filter,null));}}>Forrige</button><span>{offset+1}–{Math.min(offset+40,total)} av {total}</span><button type="button" className="secondary" disabled={busy||offset+40>=total} onClick={()=>{const v=offset+40;setOffset(v);task(()=>refresh(context,v,filter,null));}}>Neste</button></div>}
   </>}
  </>}
 </div>;
}
