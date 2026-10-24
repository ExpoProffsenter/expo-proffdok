import React,{useEffect,useRef,useState} from 'react';
import {contractReviewRpc,downloadContract,analyzeContract} from './boligContractsClient.js';
import './boligContractReview.css';
const kinds={requirement:'Funnet formulering',risk:'Mulig rødt flagg',uncertain:'Må avklares'};
const topics={delivery:'Leveranse',deadline:'Frister',payment:'Betaling',notification:'Varsling',documentation:'Dokumentasjon',change:'Endringer',guarantee:'Garantier',other:'Øvrig'};
const uncertain=p=>p.text.trim().length<40||(p.method==='ocr'&&p.confidence<70);
const when=t=>new Intl.DateTimeFormat('nb-NO',{dateStyle:'short',timeStyle:'short'}).format(new Date(t));
const excerpt=(text,query)=>{const at=text.toLocaleLowerCase('nb').indexOf(query.toLocaleLowerCase('nb')),start=Math.max(0,at-90);return(start?'…':'')+text.slice(start,start+380)+(text.length>start+380?'…':'');};
export default function BoligContractReview({context,root,documents,active,foreground,manage,onView,onAccessLost}){
 const [meta,setMeta]=useState(null),[tab,setTab]=useState('text'),[query,setQuery]=useState(''),[matches,setMatches]=useState(null),[question,setQuestion]=useState('');
 const [chosen,setChosen]=useState(null),[busy,setBusy]=useState(false),[progress,setProgress]=useState(''),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const [text,setText]=useState(null),[report,setReport]=useState(null),[reportId,setReportId]=useState(''),[textId,setTextId]=useState('');
 const [configurationOpen,setConfigurationOpen]=useState(manage);
 const epoch=useRef(0),reads=useRef(0),live=useRef(active),inFront=useRef(foreground),controller=useRef(null);live.current=active;inFront.current=foreground;
 const current=()=>live.current;
 const load=async()=>{const read=reads.current,value=await contractReviewRpc(context,root.id);if(current()&&read===reads.current)setMeta(value);return value;};
 const lost=e=>{if(e.code==='42501')onAccessLost();};
 useEffect(()=>{
  // An ACL refresh may temporarily hide the dialog while the same foreground
  // job continues. Real background/unmount cancels it; every save rechecks SQL ACL.
  if(!foreground){epoch.current++;controller.current?.abort();setBusy(false);setProgress('');}
  const ticket=epoch.current,read=++reads.current;setMeta(null);setMatches(null);setText(null);setReport(null);
  if(active){
   contractReviewRpc(context,root.id).then(value=>{if(live.current&&ticket===epoch.current&&read===reads.current){setMeta(value);setError('');}}).catch(e=>{if(live.current&&ticket===epoch.current&&read===reads.current){setError(e.message);lost(e);}});
   if(reportId)contractReviewRpc(context,root.id,'review',{id:reportId}).then(value=>{if(live.current&&ticket===epoch.current&&read===reads.current)setReport(value);}).catch(e=>{if(live.current&&ticket===epoch.current&&read===reads.current){setError(e.message);lost(e);}});
   if(textId)contractReviewRpc(context,root.id,'text',{id:textId}).then(value=>{if(live.current&&ticket===epoch.current&&read===reads.current)setText(value);}).catch(e=>{if(live.current&&ticket===epoch.current&&read===reads.current){setError(e.message);lost(e);}});
  }
 },[active,foreground,context.user_id,context.company_id,context.role,root.id]);
 useEffect(()=>()=>{epoch.current++;controller.current?.abort();},[]);
 const run=async job=>{
  if(busy||!active)return;reads.current++;const ticket=++epoch.current;const aborter=new AbortController();controller.current=aborter;setBusy(true);setError('');setNotice('');
  const valid=()=>inFront.current&&ticket===epoch.current&&!aborter.signal.aborted;
  try{await job(valid,aborter.signal);}catch(e){if(valid()){setError(e.message);lost(e);}}
  finally{if(valid()){reads.current++;setBusy(false);setProgress('');await load().catch(e=>{if(valid()){setError(e.message);lost(e);}});}}
 };
 const prepare=file=>run(async(valid,signal)=>{
  if(!manage)return;setProgress('Henter originalen …');
  const blob=await downloadContract(context,root.id,file,signal);if(!valid())return;
  const {readContractText}=await import('./boligContractText.js');if(!valid())return;
  const pages=await readContractText(blob,{signal,onProgress:p=>{if(valid())setProgress(`Leser side ${p.page} av ${p.total}${p.stage==='ocr'?' · gjenkjenner skannet tekst':''} …`);}});
  if(!valid())return;setProgress('Lagrer tekstutgaven …');const value=await contractReviewRpc(context,root.id,'save_text',{id:crypto.randomUUID(),file_id:file.id,pages});
  if(valid()){setText(value);setTextId(value.id);setChosen(previous=>previous===null?null:[...new Set([...previous,file.id])]);setNotice('Tekstutgaven er lagret. Kontroller sider med usikker tekst før gjennomgang.');}
 });
 const search=e=>{e.preventDefault();run(async valid=>{const result=await contractReviewRpc(context,root.id,'search',{query:query.trim()});if(valid())setMatches(result.matches);});};
 const available=documents.map(doc=>({doc,text:meta?.texts.find(t=>t.file_id===doc.file.id)}));
 const selected=available.filter(({doc,text})=>text&&(chosen===null||chosen.includes(doc.file.id)));
 const analyze=e=>{e.preventDefault();run(async(valid,signal)=>{
  if(!manage||!selected.length)return;setProgress('Gjennomgår valgte tekstutgaver og kontrollerer kildeutdrag …');
  const value=await analyzeContract(context,root.id,{id:crypto.randomUUID(),text_ids:selected.map(s=>s.text.id),question:question.trim()},signal);
  if(valid()){setReport(value);setReportId(value.id);setConfigurationOpen(false);setNotice('Gjennomgangen er lagret som et forslag. Kontroller kildene før du bruker funnene.');}
 });};
 const showText=id=>run(async valid=>{const value=await contractReviewRpc(context,root.id,'text',{id});if(valid()){setText(value);setTextId(id);}});
 const showReport=id=>run(async valid=>{const value=await contractReviewRpc(context,root.id,'review',{id});if(valid()){setReport(value);setReportId(id);setConfigurationOpen(false);}});
 const textDocument=text&&documents.find(d=>d.file.id===text.file_id),textFile=textDocument?.file;
 const historical=report?.sources?.some(s=>!documents.some(d=>d.file.id===s.file_id)||(meta?.texts.find(t=>t.file_id===s.file_id)?.id&&meta.texts.find(t=>t.file_id===s.file_id).id!==s.id));
 return <div className="bolig-contract-review" hidden={!active}>
  <p>Søk i teksten eller få forslag til oppfølging. Kontroller funnene mot kildesidene.</p>
  <div className="bolig-contract-review-tabs"><button type="button" className="secondary" aria-pressed={tab==='text'} onClick={()=>setTab('text')}>Tekst og søk</button><button type="button" className="secondary" aria-pressed={tab==='review'} onClick={()=>setTab('review')}>Gjennomgang</button></div>
  {error&&<p role="alert" className="bolig-contract-error">{error}</p>}{notice&&<p role="status">{notice}</p>}{busy&&<p role="status">{progress||'Henter …'}</p>}
  {!meta&&!error&&<p role="status">Henter tekstutgaver og gjennomganger …</p>}
  {tab==='text'&&<>
   <div className="bolig-contract-review-docs">{available.map(({doc,text})=><article key={doc.id}><div><strong>{doc.title}</strong><p>Versjon {doc.file.version} · {text?`${text.page_count} sider · ${text.uncertain_pages?text.uncertain_pages+' med usikker tekst':'tekst tilgjengelig'}`:'Ikke gjort søkbar'}</p></div><div>{text&&<button type="button" className="secondary" disabled={busy} onClick={()=>showText(text.id)}>Les tekst</button>}{manage&&<button type="button" className="secondary" disabled={busy} onClick={()=>prepare(doc.file)}>{text?'Les originalen på nytt':'Gjør søkbar'}</button>}</div></article>)}</div>
   <p>Tekstgjenkjenning leser skannede sider. Første behandling kan ta litt tid. Utydelige sider må kontrolleres mot originalen.</p>
   <form onSubmit={search} className="bolig-contract-review-search"><label>Søk i kontraktstekst<input type="search" minLength={2} maxLength={160} value={query} onChange={e=>setQuery(e.target.value)} placeholder="Søk etter et ord eller uttrykk"/></label><button disabled={busy||query.trim().length<2}>Søk i teksten</button></form>
   <p>Søket gjelder nyeste lagrede tekstutgave av hver gjeldende filversjon. Inntil 50 treff vises.</p>
   {matches&&<div><p role="status">{matches.length?matches.length+' sidetreff':'Ingen treff i tilgjengelig tekst. Dokumenter uten tekst er ikke søkt.'}</p>{matches.map(m=><article className="bolig-contract-review-source" key={m.text_id+':'+m.page}><strong>{m.title} · versjon {m.file.version} · side {m.page}</strong><p>{excerpt(m.text,query)}</p>{(m.method==='ocr'&&(m.confidence<70||m.text.trim().length<40))&&<p className="bolig-contract-review-warning">Usikker tekst. Kontroller originalen.</p>}<button type="button" className="secondary" onClick={()=>onView(m.file,m.page)}>Åpne kildeside</button></article>)}</div>}
   {text&&<details open className="bolig-contract-review-pages"><summary>{textDocument?textDocument.title+' · versjon '+textFile.version:'Tidligere dokumentversjon'} · Tekstutgave · {text.pages.length} sider · {when(text.created_at)}</summary>{text.pages.map(p=><details key={p.number}><summary>Side {p.number} · {p.method==='ocr'?'Gjenkjent tekst':'PDF-tekst'}{uncertain(p)?' · Må kontrolleres':''}</summary>{uncertain(p)&&<p className="bolig-contract-review-warning">Teksten er ufullstendig eller usikker. Kontroller originalen før du bruker siden som grunnlag.</p>}<p className="bolig-contract-review-page-text">{p.text||'Ingen lesbar tekst funnet.'}</p>{textFile&&<button type="button" className="secondary" onClick={()=>onView(textFile,p.number)}>Åpne kildeside</button>}</details>)}</details>}
  </>}
  {tab==='review'&&<>
   <details open={configurationOpen} onToggle={e=>setConfigurationOpen(e.currentTarget.open)} className="bolig-contract-review-configuration"><summary>Grunnlag og spørsmål · {selected.length} {selected.length===1?'dokument':'dokumenter'}</summary><form onSubmit={analyze}><fieldset disabled={busy||!manage}><legend>Velg dokumentgrunnlag</legend>{available.map(({doc,text})=><label className="bolig-contract-review-choice" key={doc.id}><input type="checkbox" disabled={!text} checked={!!text&&(chosen===null||chosen.includes(doc.file.id))} onChange={e=>setChosen(previous=>{const old=previous===null?available.filter(s=>s.text).map(s=>s.doc.file.id):previous;return e.target.checked?[...new Set([...old,doc.file.id])]:old.filter(id=>id!==doc.file.id);})}/><span>{doc.title} · versjon {doc.file.version}{!text?' · Gjør søkbar først':text.uncertain_pages?' · Usikre sider må kontrolleres':''}</span></label>)}
    <label>Spørsmål til kontrakten (valgfritt)<textarea maxLength={500} value={question} onChange={e=>setQuestion(e.target.value)} placeholder="For eksempel: Hva står det om varsling av endringer?"/></label>
    <p>Uten spørsmål får du en oversikt over krav og mulige røde flagg. Valgte dokumenter gis ingen automatisk juridisk rang.</p>
    <p>Når du starter, sendes de valgte tekstutgavene til analysetjenesten. Originalfilene sendes ikke. Gjennomgangen er et forslag som må kontrolleres, og endrer ingen avtale eller oppgave.</p>
    <button disabled={busy||!manage||!selected.length||selected.length>10}>Start gjennomgang ({selected.length})</button>
   </fieldset></form></details>
   {!manage&&<p>Du kan lese lagrede gjennomganger. En kontraktsadministrator klargjør teksten og starter nye gjennomganger.</p>}
   {!!meta?.reviews.length&&<details className="bolig-contract-review-history"><summary>Tidligere gjennomganger ({meta.reviews.length})</summary>{meta.reviews.map(r=><div key={r.id}><button type="button" className="secondary" disabled={busy} onClick={()=>showReport(r.id)}>{when(r.created_at)} · {r.state==='ready'?'Lagret forslag':r.state==='failed'?'Ikke fullført':'Startet'}{r.question?' · '+r.question.slice(0,75):''}</button></div>)}</details>}
   {report&&<section aria-label="Lagret kontraktsgjennomgang"><h3>Forslag fra gjennomgangen</h3><p>{when(report.created_at)} · {report.state==='ready'?'Lagret forslag':report.state==='failed'?'Gjennomgangen ble ikke fullført':'Gjennomgangen er startet. Hent status igjen om litt.'}</p>{historical&&<p className="bolig-contract-review-warning">Dette er et historisk grunnlag. Prosjektet har andre eller nyere dokumentversjoner. Start en ny gjennomgang for dagens grunnlag.</p>}
    {report.question&&<p><strong>Spørsmål:</strong> {report.question}</p>}
    <details><summary>Dokumenter brukt i gjennomgangen</summary>{report.sources?.map(s=><p key={s.id}>{s.title} · versjon {s.file.version} · tekstutgave {when(s.created_at)}</p>)}</details>
    {report.result?.findings.map((f,i)=><details className={'bolig-contract-review-finding '+f.kind} key={i}><summary><span>{kinds[f.kind]} · {topics[f.topic]}</span><strong>{f.title}</strong></summary><p>{f.explanation}</p>{f.sources.map((ref,n)=>{const s=report.sources?.find(s=>s.id===ref.text_id);return <div className="bolig-contract-review-source" key={n}><p><strong>{s?.title} · versjon {s?.file.version} · side {ref.page}</strong></p><blockquote>{ref.quote}</blockquote>{s&&<button type="button" className="secondary" onClick={()=>onView(s.file,ref.page)}>Åpne kildeside</button>}</div>;})}</details>)}
    {report.result&&!report.result.findings.length&&<p>Ingen kildebelagte funn ble formulert. Dette bekrefter ikke at kontrakten er uten risiko.</p>}
    {!!report.result?.not_found.length&&<div className="bolig-contract-review-warning"><h4>Ikke funnet i valgt tekstgrunnlag</h4><ul>{report.result.not_found.map((t,i)=><li key={i}>{t}</li>)}</ul></div>}
    {!!report.result?.limitations.length&&<div className="bolig-contract-review-warning"><h4>Begrensninger i gjennomgangen</h4><ul>{report.result.limitations.map((t,i)=><li key={i}>{t}</li>)}</ul></div>}
   </section>}
  </>}
 </div>;
}
