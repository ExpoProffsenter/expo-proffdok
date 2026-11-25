import React,{useEffect,useRef,useState} from 'react';
import {indexSeries,indexDraft,keepIndexDraft,clearIndexDraft,indexNumber,contractIndexRpc,fetchIndexValues} from './boligContractIndex.js';
import {contractFinanceRpc} from './boligContractFinance.js';
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
export default function BoligContractIndex({context,root,documents=[],agreement,active,foreground,manage,historyOnly=false,onEditAgreement,onAccessLost}){
 const scope=`${context.user_id}:${context.company_id}:${root.id}:${context.role}`;
 const [draft,setDraft]=useState(()=>indexDraft(scope)),draftRef=useRef(draft);draftRef.current=draft;
 const [meta,setMeta]=useState(null),[preview,setPreview]=useState(null),[report,setReport]=useState(null),[reportId,setReportId]=useState('');
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const live=useRef(active&&foreground),epoch=useRef(0),working=useRef(false),abort=useRef(null);live.current=active&&foreground;
 const sourceKey=JSON.stringify(agreement);
 const change=fields=>{const next={...draftRef.current,...fields,attempt:null};draftRef.current=next;keepIndexDraft(scope,next);setDraft(next);setPreview(null);setNotice('');};
 const fail=e=>{setError(e.message);if(e.code==='PT409'){const next={...draftRef.current,attempt:null};draftRef.current=next;keepIndexDraft(scope,next);setDraft(next);setPreview(null);}if(e.code==='42501'){clearIndexDraft(scope);setPreview(null);setReport(null);onAccessLost();}};
 useEffect(()=>{
  if(!agreement||draftRef.current.sourceKey===sourceKey)return;
  // Bind the target number to its saved source across closing and reopening too.
  const next={...draftRef.current,sourceKey,...(!draftRef.current.attempt?{target_index:'',origin:'manual'}:{})};
  draftRef.current=next;keepIndexDraft(scope,next);setDraft(next);setPreview(null);
 },[sourceKey]);
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
 const freshAgreement=async()=>{const value=await contractFinanceRpc(context,root.id);if(JSON.stringify(value.agreement)!==sourceKey)throw Object.assign(Error('Kontraktsgrunnlaget er endret. Hent siste økonomioversikt før du beregner på nytt.'),{code:'PT409'});};
 const prepare=e=>{e.preventDefault();run(async valid=>{
  if(!manage||!agreement)return;await freshAgreement();
  const d=draftRef.current,basis={...agreement,file_id:d.file_id||null,target_month:d.target_month,target_index:indexNumber(d.target_index),origin:d.origin};
  const value=await contractIndexRpc(context,root.id,'preview',{basis});if(valid()){setPreview(value);setReport(null);setReportId('');}
 });};
 const finish=async(valid,attempt)=>{
  const value=await contractIndexRpc(context,root.id,'approve',attempt);
  if(valid()){
   setReport(value.report);setReportId(value.report.id);setPreview(null);
   const next={...draftRef.current,attempt:null,target_index:'',origin:'manual'};draftRef.current=next;keepIndexDraft(scope,next);setDraft(next);setNotice('Beregningen er godkjent og lagret.');
   const fresh=await contractIndexRpc(context,root.id);if(valid())setMeta(fresh);
  }
 };
 const approve=()=>run(async valid=>{
  if(!manage||!preview)return;let attempt=draftRef.current.attempt;
  if(!attempt){await freshAgreement();attempt={id:crypto.randomUUID(),basis:preview.basis,revision:preview.revision};const next={...draftRef.current,attempt};draftRef.current=next;keepIndexDraft(scope,next);setDraft(next);}
  await finish(valid,attempt);
 });
 const series=indexSeries.find(s=>s.id===agreement?.series);
 return <div className="bolig-contract-index" hidden={!active||!foreground}>
  <p>{historyOnly?'Her finner du tidligere godkjente indeksberegninger. De viser grunnlaget som gjaldt da beregningen ble lagret.':'Beregn indeks på hele det lagrede kontraktsgrunnlaget. Denne oversikten tar ikke hensyn til fakturert hittil og oppretter ingen faktura. Periodens fakturering og indeks føres under Fakturert og a konto.'}</p>
  {error&&<p role="alert" className="bolig-contract-error">{error}</p>}{notice&&<p role="status">{notice}</p>}{busy&&<p role="status">Behandler …</p>}
  {!historyOnly&&<section className="bolig-index-setup"><h3>Indeks på hele kontraktsgrunnlaget</h3>
   {!agreement?<p>Lagre kontraktssum og vilkår først.</p>:<section aria-label="Felles kontraktsgrunnlag"><p>{series?.name} · basismåned {agreement.base_month} · basisindeks {agreement.base_index} · reduksjonsfaktor {agreement.factor}</p>{agreement.lines.map(l=><p key={l.id}><strong>{l.name}</strong>: {money(l.amount_cents)} · {l.selected?'Indeksreguleres':'Reguleres ikke'}</p>)}</section>}
   {manage&&<button type="button" className="secondary" disabled={busy||!!draft.attempt} onClick={onEditAgreement}>Endre kontraktssum og vilkår</button>}
   {!manage&&<p>Du kan lese godkjente beregninger. En kontraktsadministrator oppretter nye.</p>}
   {manage&&agreement&&<form onSubmit={prepare}><fieldset disabled={busy||!meta||!!draft.attempt}>
    <label>Dokumentgrunnlag (valgfritt)<select value={draft.file_id} onChange={e=>change({file_id:e.target.value})}><option value="">Bruk lagret kontraktsgrunnlag</option>{!documents.some(d=>d.file.id===draft.file_id)&&draft.file_id&&<option value={draft.file_id}>Tidligere dokumentversjon</option>}{documents.map(d=><option key={d.file.id} value={d.file.id}>{d.title} · versjon {d.file.version}</option>)}</select></label>
    <div className="bolig-index-grid"><label>Reguleringsmåned<input required type="month" min={agreement.base_month} max="2099-12" value={draft.target_month} onChange={e=>change({target_month:e.target.value,target_index:'',origin:'manual'})}/></label><label>Ny indeks<input required inputMode="decimal" value={draft.target_index} onChange={e=>change({target_index:e.target.value,origin:'manual'})}/></label></div>
    <button type="button" className="secondary" disabled={!draft.target_month} onClick={()=>run(async(valid,signal)=>{
     await freshAgreement();const values=await fetchIndexValues(agreement.series,agreement.base_month,draftRef.current.target_month,AbortSignal.any([signal,AbortSignal.timeout(15000)]));
     if(indexNumber(values.base_index)!==agreement.base_index)throw Error('SSBs basisindeks avviker fra den lagrede avtalen. Kontroller kontraktssum og vilkår først.');
     if(valid()){change({target_index:values.target_index,origin:values.origin});setNotice('Indekstallene er hentet fra SSB.');}
    })}>Hent indekstall fra SSB</button>
    <p>Velg en måned med publiserte tall, eller før inn kontrollert ny indeks. Beløp, avkryssinger og indeksvilkår endres bare i det felles kontraktsgrunnlaget.</p>
    <button>Forhåndsvis regulering</button>
   </fieldset></form>}
  </section>}
  {!historyOnly&&preview&&<><Result basis={preview.basis} calculation={preview.calculation}/><button type="button" disabled={busy||!manage} onClick={approve}>{draft.attempt?'Prøv samme godkjenning igjen':'Godkjenn og lagre beregning'}</button></>}
  {!!draft.attempt&&!preview&&<><p>Et godkjenningsforsøk mangler bekreftelse. Samme forsøk bruker det opprinnelige grunnlaget, også om kontrakten senere er endret.</p><button type="button" disabled={busy||!manage} onClick={()=>run(valid=>finish(valid,draftRef.current.attempt))}>Prøv samme godkjenning igjen</button></>}
  {report&&<section aria-label="Godkjent indeksberegning"><h3>Godkjent beregning · nr. {report.revision}</h3><p>{when(report.created_at)}</p><Result basis={report.basis} calculation={report.calculation}/><button type="button" className="secondary" onClick={()=>{setReport(null);setReportId('');}}>Lukk indeksberegning</button></section>}
  <p>Lagrede indeksberegninger teller ikke som fakturert. De deles ikke gjennom UE-, leverandør- eller beboerlenker.</p>
  <details open={historyOnly} className="bolig-index-history"><summary>Godkjente indeksberegninger ({meta?.reports.length||0})</summary><button type="button" className="secondary" disabled={busy} onClick={()=>run(async valid=>{const value=await contractIndexRpc(context,root.id);if(valid())setMeta(value);})}>Hent siste indekshistorikk</button>{meta?.reports.map(r=><button type="button" className="secondary" key={r.id} disabled={busy} onClick={()=>run(async valid=>{const value=await contractIndexRpc(context,root.id,'report',{id:r.id});if(valid()){setReport(value.report);setReportId(r.id);setPreview(null);}})}>Nr. {r.revision} · {r.target_month} · {money(r.adjustment_cents)} · {r.reference}</button>)}{meta&&meta.reports.length===50&&<p>Viser de siste 50 beregningene.</p>}</details>
 </div>;
}
