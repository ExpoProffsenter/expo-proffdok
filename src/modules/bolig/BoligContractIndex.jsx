import React,{useEffect,useRef,useState} from 'react';
import {indexSeries,indexDraft,keepIndexDraft,clearIndexDraft,indexBasis,contractIndexRpc,fetchIndexValues} from './boligContractIndex.js';
import './boligContractIndex.css';
const money=n=>new Intl.NumberFormat('nb-NO',{style:'currency',currency:'NOK'}).format(n/100);
const percent=n=>new Intl.NumberFormat('nb-NO',{maximumFractionDigits:6}).format(n)+' %';
const when=t=>new Intl.DateTimeFormat('nb-NO',{dateStyle:'short',timeStyle:'short'}).format(new Date(t));
function Result({basis,calculation}){
 return <section className="bolig-index-result" aria-label="Beregningsresultat">
  <h4>{calculation.series_name}</h4><p>{basis.base_month} → {basis.target_month} · SSB-tabell {calculation.ssb_table}</p>
  <p>Indekstall: {basis.base_index} → {basis.target_index}<br/>Indeksendring: <strong>{percent(calculation.raw_percent)}</strong><br/>Reduksjonsfaktor: {basis.factor} · Anvendt regulering: <strong>{percent(calculation.applied_percent)}</strong></p>
  <p>{basis.reference}</p>{calculation.file&&<p>Dokument: {calculation.file.name} · versjon {calculation.file.version}</p>}
  <p>Alle beløp er ekskl. mva.</p>
  <div className="bolig-index-result-lines">{calculation.lines.map(line=><article key={line.id}><strong>{line.name}</strong><span>{line.selected?'Reguleres':'Reguleres ikke'}</span><dl><div><dt>Opprinnelig beløp</dt><dd>{money(line.amount_cents)}</dd></div><div><dt>Regulering</dt><dd>{money(line.adjustment_cents)}</dd></div><div><dt>Etter regulering</dt><dd>{money(line.new_amount_cents)}</dd></div></dl></article>)}</div>
  <dl className="bolig-index-totals"><div><dt>Samlet opprinnelig beløp</dt><dd>{money(calculation.original_cents)}</dd></div><div><dt>Samlet tillegg/fradrag</dt><dd>{money(calculation.adjustment_cents)}</dd></div><div><dt>Samlet beløp etter regulering</dt><dd>{money(calculation.new_cents)}</dd></div></dl>
  <details><summary>Beregningsmåte og kilde</summary><p>{calculation.formula}</p><p>{calculation.rounding}</p><p>{basis.origin==='ssb-client'?'Indekstall hentet fra SSB ved klargjøring.':'Indekstall ført inn manuelt.'} Kontroller valgt serie, måneder og tall mot kontrakten og SSB før godkjenning.</p></details>
 </section>;
}
export default function BoligContractIndex({context,root,documents,active,foreground,manage,onAccessLost}){
 const scope=`${context.user_id}:${context.company_id}:${root.id}:${context.role}`;
 const [draft,setDraft]=useState(()=>indexDraft(scope)),draftRef=useRef(draft);draftRef.current=draft;
 const [meta,setMeta]=useState(null),[preview,setPreview]=useState(null),[report,setReport]=useState(null),[reportId,setReportId]=useState('');
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const live=useRef(active&&foreground),epoch=useRef(0),working=useRef(false),abort=useRef(null);live.current=active&&foreground;
 const change=fields=>{const next={...draftRef.current,...fields,attempt:null};draftRef.current=next;keepIndexDraft(scope,next);setDraft(next);setPreview(null);setNotice('');};
 const fail=e=>{setError(e.message);if(e.code==='PT409'){const next={...draftRef.current,attempt:null};draftRef.current=next;keepIndexDraft(scope,next);setDraft(next);setPreview(null);}if(e.code==='42501'){clearIndexDraft(scope);setPreview(null);setReport(null);onAccessLost();}};
 useEffect(()=>{
  const ticket=++epoch.current;abort.current?.abort();setPreview(null);setMeta(null);setReport(null);
  if(active&&foreground){
   contractIndexRpc(context,root.id).then(value=>{if(live.current&&ticket===epoch.current){setMeta(value);setError('');}}).catch(e=>{if(live.current&&ticket===epoch.current)fail(e);});
   if(reportId)contractIndexRpc(context,root.id,'report',{id:reportId}).then(value=>{if(live.current&&ticket===epoch.current)setReport(value.report);}).catch(e=>{if(live.current&&ticket===epoch.current)fail(e);});
  }
  return()=>{epoch.current++;abort.current?.abort();};
 },[active,foreground,scope]);
 const run=async job=>{
  if(working.current||!live.current)return;working.current=true;setBusy(true);setError('');setNotice('');const ticket=++epoch.current,controller=new AbortController();abort.current=controller;
  const valid=()=>live.current&&ticket===epoch.current;
  try{await job(valid,controller.signal);}catch(e){if(valid()&&e.name!=='AbortError')fail(e);}finally{working.current=false;setBusy(false);}
 };
 const reload=()=>run(async valid=>{const value=await contractIndexRpc(context,root.id);if(valid()){setMeta(value);setPreview(null);}});
 const prepare=e=>{e.preventDefault();run(async valid=>{if(!manage)return;const value=await contractIndexRpc(context,root.id,'preview',{basis:indexBasis(draftRef.current)});if(valid()){setPreview(value);setReport(null);setReportId('');}});};
 const approve=()=>run(async valid=>{
  if(!manage||!preview)return;let attempt=draftRef.current.attempt;
  if(!attempt){attempt={id:crypto.randomUUID(),basis:preview.basis,revision:preview.revision};const next={...draftRef.current,attempt};draftRef.current=next;keepIndexDraft(scope,next);setDraft(next);}
  const value=await contractIndexRpc(context,root.id,'approve',attempt);
  if(valid()){
   setReport(value.report);setReportId(value.report.id);setPreview(null);
   const next={...draftRef.current,attempt:null};draftRef.current=next;keepIndexDraft(scope,next);setDraft(next);setNotice('Beregningen er godkjent og lagret.');
   const fresh=await contractIndexRpc(context,root.id);if(valid())setMeta(fresh);
  }
 });
 const lineChange=(id,fields)=>change({lines:draftRef.current.lines.map(l=>l.id===id?{...l,...fields}:l)});
 const series=indexSeries.find(s=>s.id===draft.series);
 return <div className="bolig-contract-index" hidden={!active||!foreground}>
  <p>Beregn regulering av grunnleveransen til byggherre og de opsjonene som omfattes av avtalen. Bruk opprinnelige beløp fra basismåneden.</p>
  {error&&<p role="alert" className="bolig-contract-error">{error}</p>}{notice&&<p role="status">{notice}</p>}{busy&&<p role="status">Behandler …</p>}
  <details open={!report} className="bolig-index-setup"><summary>Grunnlag for indeksregulering</summary>
   {!manage&&<p>Du kan lese godkjente beregninger. En kontraktsadministrator oppretter nye.</p>}
   {manage&&<form onSubmit={prepare}><fieldset disabled={busy||!meta||!!draft.attempt}>
    <label>Avtalehenvisning<textarea aria-label="Avtalehenvisning" required maxLength={500} value={draft.reference} onChange={e=>change({reference:e.target.value})} placeholder="For eksempel kontraktens punkt og avtalt reguleringstidspunkt"/></label>
    <label>Dokumentgrunnlag (valgfritt)<select aria-label="Dokumentgrunnlag (valgfritt)" value={draft.file_id} onChange={e=>change({file_id:e.target.value})}><option value="">Bruk avtalehenvisningen ovenfor</option>{!documents.some(d=>d.file.id===draft.file_id)&&draft.file_id&&<option value={draft.file_id}>Tidligere dokumentversjon</option>}{documents.map(d=><option key={d.file.id} value={d.file.id}>{d.title} · versjon {d.file.version}</option>)}</select></label>
    <label>Avtalt indeks<select aria-label="Avtalt indeks" value={draft.series} onChange={e=>change({series:e.target.value,base_index:'',target_index:'',origin:'manual'})}>{indexSeries.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
    <p><a href={'https://www.ssb.no/statbank/table/'+series.table} target="_blank" rel="noreferrer">Se valgt SSB-tabell {series.table}</a></p>
    <div className="bolig-index-grid"><label>Basismåned<input required type="month" min="1900-01" max="2099-12" value={draft.base_month} onChange={e=>change({base_month:e.target.value,base_index:'',target_index:'',origin:'manual'})}/></label><label>Reguleringsmåned<input required type="month" min={draft.base_month||'1900-01'} max="2099-12" value={draft.target_month} onChange={e=>change({target_month:e.target.value,base_index:'',target_index:'',origin:'manual'})}/></label></div>
    <button type="button" className="secondary" disabled={!draft.base_month||!draft.target_month} onClick={()=>run(async(valid,signal)=>{const values=await fetchIndexValues(draftRef.current.series,draftRef.current.base_month,draftRef.current.target_month,AbortSignal.any([signal,AbortSignal.timeout(15000)]));if(valid()){change(values);setNotice('Indekstallene er hentet fra SSB.');}})}>Hent indekstall fra SSB</button>
    <p>Velg måneder med publiserte tall. Du kan også føre inn kontrollerte indekstall manuelt.</p>
    <div className="bolig-index-grid"><label>Basisindeks<input required inputMode="decimal" value={draft.base_index} onChange={e=>change({base_index:e.target.value,origin:'manual'})}/></label><label>Ny indeks<input required inputMode="decimal" value={draft.target_index} onChange={e=>change({target_index:e.target.value,origin:'manual'})}/></label></div>
    <label>Reduksjonsfaktor<input required inputMode="decimal" value={draft.factor} onChange={e=>change({factor:e.target.value})}/></label><p>1,00 gir full indeksendring. Faktor 0,90 og indeksøkning på 10 % gir 9 % regulering. Faktoren gjelder også ved indeksnedgang.</p>
    <fieldset className="bolig-index-lines"><legend>Hva skal reguleres?</legend><p>Alle beløp er ekskl. mva. Kryss av de delene avtalen gir rett til å regulere. Oppgi hver opsjon som en egen del.</p>
     {draft.lines.map((line,i)=><article key={line.id}><label className="bolig-index-check"><input type="checkbox" checked={line.selected} onChange={e=>lineChange(line.id,{selected:e.target.checked})}/><span>{line.kind==='base'?'Grunnleveranse til byggherre':line.name||'Opsjon '+i}</span></label>
      {line.kind==='option'&&<label>Navn på opsjon {i}<input required maxLength={120} value={line.name} onChange={e=>lineChange(line.id,{name:e.target.value})}/></label>}
      <label>{line.kind==='base'?'Opprinnelig grunnleveranse ekskl. mva.':'Opprinnelig beløp for opsjon '+i+' ekskl. mva.'}<input inputMode="decimal" required value={line.amount} onChange={e=>lineChange(line.id,{amount:e.target.value})}/></label>
      {line.kind==='option'&&<button type="button" className="secondary" onClick={()=>change({lines:draft.lines.filter(l=>l.id!==line.id)})}>Fjern opsjon {i} fra beregningen</button>}
     </article>)}
     <button type="button" className="secondary" disabled={draft.lines.length>=51} onClick={()=>change({lines:[...draft.lines,{id:crypto.randomUUID(),kind:'option',name:'',amount:'',selected:false}]})}>Legg til opsjon</button>
    </fieldset>
    <button>Forhåndsvis regulering</button>
   </fieldset></form>}
   {!!draft.attempt&&<p>Et godkjenningsforsøk mangler bekreftelse. Prøv samme forsøk igjen eller hent historikken før du starter en ny beregning.</p>}
  </details>
  {preview&&<><Result basis={preview.basis} calculation={preview.calculation}/><p>Godkjenning lagrer denne beregningen i kontraktshistorikken. Grunnlaget er kontraktsbeløpene ovenfor; ingen vare- eller beboerpris hentes inn.</p><button type="button" disabled={busy||!manage} onClick={approve}>{draft.attempt?'Prøv samme godkjenning igjen':'Godkjenn og lagre beregning'}</button></>}
  {!!draft.attempt&&!preview&&<button type="button" disabled={busy||!manage} onClick={()=>run(async valid=>{const value=await contractIndexRpc(context,root.id,'approve',draftRef.current.attempt);if(valid()){setReport(value.report);setReportId(value.report.id);const next={...draftRef.current,attempt:null};draftRef.current=next;keepIndexDraft(scope,next);setDraft(next);const fresh=await contractIndexRpc(context,root.id);if(valid())setMeta(fresh);}})}>Prøv samme godkjenning igjen</button>}
  {report&&<section aria-label="Godkjent indeksberegning"><h3>Godkjent beregning · nr. {report.revision}</h3><p>{when(report.created_at)}</p><Result basis={report.basis} calculation={report.calculation}/><button type="button" className="secondary" onClick={()=>{setReport(null);setReportId('');}}>Ny beregning</button></section>}
  <p>Lagrede beregninger endrer ikke automatisk fakturaer, bestillinger eller andre avtaler. De følger ikke UE-, leverandør- eller beboerlenker.</p>
  <details><summary>Godkjente beregninger ({meta?.reports.length||0})</summary><button type="button" className="secondary" disabled={busy} onClick={reload}>Hent siste historikk</button>{meta?.reports.map(r=><button type="button" className="secondary" key={r.id} disabled={busy} onClick={()=>run(async valid=>{const value=await contractIndexRpc(context,root.id,'report',{id:r.id});if(valid()){setReport(value.report);setReportId(r.id);setPreview(null);}})}>Nr. {r.revision} · {r.target_month} · {money(r.adjustment_cents)} · {r.reference}</button>)}{meta&&meta.reports.length===50&&<p>Viser de siste 50 beregningene.</p>}</details>
 </div>;
}
