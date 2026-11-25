import React,{useEffect,useRef,useState} from 'react';
import {indexSeries,fetchIndexValues,fetchInvoiceIndex,contractIndexRpc} from './boligContractIndex.js';
import {financeDraft,keepFinanceDraft,clearFinanceDraft,newFinanceSetup,setupFromBasis,financeAgreement,contractFinanceRpc,amountText,newInvoiceForm,invoiceFormFromEntry,invoiceInput,invoiceAmounts} from './boligContractFinance.js';
import BoligContractIndex from './BoligContractIndex.jsx';
import './boligContractFinance.css';
const money=n=>new Intl.NumberFormat('nb-NO',{style:'currency',currency:'NOK'}).format(n/100);
const monthName=m=>new Intl.DateTimeFormat('nb-NO',{month:'long',year:'numeric',timeZone:'Europe/Oslo'}).format(new Date(m+'-15T12:00:00Z'));
const dateName=d=>new Intl.DateTimeFormat('nb-NO',{dateStyle:'short',timeZone:'Europe/Oslo'}).format(new Date(d+'T12:00:00Z'));
function Summary({lines}){
 const sum=key=>lines.reduce((n,l)=>n+Number(l[key]||0),0);
 return <section className="bolig-finance-summary" aria-label="Fakturert hittil"><dl>
  <div><dt>Kontraktssum inkl. avtalte opsjoner</dt><dd>{money(sum('contract_cents'))}</dd></div><div><dt>Fakturert a konto hittil</dt><dd>{money(sum('principal_cents'))}</dd></div><div><dt>Fakturert indeksregulering hittil</dt><dd>{money(sum('index_cents'))}</dd></div><div><dt>Samlet fakturert hittil</dt><dd>{money(sum('principal_cents')+sum('index_cents'))}</dd></div><div><dt>Gjenstår av kontrakt og opsjoner</dt><dd>{money(sum('contract_cents')-sum('principal_cents'))}</dd></div>
 </dl><p>Alle registrerte fakturaer minus kreditnotaer er med. Fakturert er ikke det samme som betalt. Beløp er ekskl. mva.</p>
 <div aria-label="Fordeling på grunnleveranse og opsjoner">{lines.map(l=><article key={l.id}><strong>{l.name}</strong><p>Avtalt: {money(l.contract_cents)} · A konto: {money(l.principal_cents)} · Indeks fakturert: {money(l.index_cents)} · Gjenstår: {money(l.contract_cents-l.principal_cents)}</p></article>)}</div></section>;
}
export default function BoligContractFinance({context,root,documents,active,foreground,manage,onAccessLost}){
 const scope=`${context.user_id}:${context.company_id}:${root.id}:${context.role}`;
 const [draft,setDraft]=useState(()=>financeDraft(scope)),ref=useRef(draft);ref.current=draft;
 const [meta,setMeta]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const [indexBusy,setIndexBusy]=useState(false),[indexError,setIndexError]=useState(''),[indexRetry,setIndexRetry]=useState(0);
 const live=useRef(active&&foreground),epoch=useRef(0),working=useRef(false),abort=useRef(null),lastAgreement=useRef(null);live.current=active&&foreground;
 if(meta)lastAgreement.current=meta.agreement;
 const change=fields=>{const next={...ref.current,...fields};ref.current=next;keepFinanceDraft(scope,next);setDraft(next);setNotice('');};
 const form=fields=>change({form:{...ref.current.form,...fields}});
 const fail=e=>{setError(e.message);if(e.code==='PT409'||/^2[23]/.test(e.code||''))change({attempt:null});if(e.code==='42501'){clearFinanceDraft(scope);setMeta(null);onAccessLost();}};
 const load=async valid=>{
  const value=await contractFinanceRpc(context,root.id);
  if(valid()){
   setMeta(value);const patch={};
   if(!ref.current.setup){patch.setup=value.agreement?setupFromBasis(value.agreement):newFinanceSetup();patch.setup_revision=value.revision;}
   if(!ref.current.form?.register_version){patch.form=newInvoiceForm(value.agreement);patch.form_revision=value.revision;patch.edit_id=null;patch.entry_revision=0;patch.invoice_agreement=null;}
   if(value.agreement&&ref.current.setup_revision!==value.revision){try{if(JSON.stringify(financeAgreement(ref.current.setup))===JSON.stringify(financeAgreement(setupFromBasis(value.agreement))))patch.setup_revision=value.revision;}catch{/* Preserve unfinished contract terms. */}}
   if(Object.keys(patch).length)change(patch);
  }
  return value;
 };
 useEffect(()=>{
  const ticket=++epoch.current;abort.current?.abort();setMeta(null);
  if(active&&foreground)load(()=>live.current&&ticket===epoch.current).catch(e=>{if(live.current&&ticket===epoch.current)fail(e);});
  return()=>{epoch.current++;abort.current?.abort();};
 },[active,foreground,scope]);
 const run=async job=>{if(working.current||!live.current)return;working.current=true;setBusy(true);setError('');setNotice('');const ticket=++epoch.current,controller=new AbortController();abort.current=controller;const valid=()=>live.current&&ticket===epoch.current;try{await job(valid,controller.signal);}catch(e){if(valid()&&e.name!=='AbortError')fail(e);}finally{working.current=false;setBusy(false);}};
 const send=(action,input,revision)=>run(async valid=>{
  if(!manage)return;let attempt=ref.current.attempt;
  if(!attempt){attempt={action,payload:{id:action==='save'?(ref.current.edit_id||crypto.randomUUID()):crypto.randomUUID(),...(action==='save'?{request_id:crypto.randomUUID(),entry_revision:ref.current.entry_revision||0}:{}),input,revision}};change({attempt});}
  const value=await contractFinanceRpc(context,root.id,attempt.action,attempt.payload);
  if(valid()){
   if(attempt.action==='save')change({attempt:null,edit_id:value.entry.id,entry_revision:value.entry.revision,invoice_agreement:value.entry.result.agreement,form:{...invoiceFormFromEntry(value.entry),index_key:ref.current.form.index_key,needs_confirmation:ref.current.form.needs_confirmation,candidates:ref.current.form.candidates},form_revision:value.revision});
   else change({attempt:null,setup_revision:value.revision,form_revision:value.revision,surface:'overview',...(!ref.current.edit_id?{invoice_agreement:null,form:{...ref.current.form,apply_index:value.entry.input.factor>0&&value.entry.input.lines.some(l=>l.selected),index_key:'',target_index:'',index_confirmed:false}}:{})});
   await load(valid);
   if(valid())setNotice(attempt.action==='save'?'Fakturaene er lagret. Summene er oppdatert.':'Kontraktssum og vilkår er lagret.');
  }
 });
 const s=draft.setup,f=draft.form?.register_version?draft.form:newInvoiceForm();
 const calcAgreement=draft.invoice_agreement||meta?.agreement;
 const sourceKey=calcAgreement?JSON.stringify([calcAgreement.series,calcAgreement.base_month,calcAgreement.base_index,calcAgreement.factor,calcAgreement.lines]):'';
 const indexKey=JSON.stringify([f.date,sourceKey,f.manual_month||'']);
 useEffect(()=>{
  if(!active||!foreground||!meta||!manage||f.mode!=='period'||!f.apply_index||!calcAgreement||draft.attempt){setIndexBusy(false);return;}
  if(f.index_key===indexKey&&f.target_index){setIndexBusy(false);return;}
  const controller=new AbortController();let current=true;setIndexBusy(true);setIndexError('');
  fetchInvoiceIndex(calcAgreement.series,calcAgreement.base_month,f.date,controller.signal,f.manual_month||'').then(value=>{
   if(Number(value.base_index.replace(',','.'))!==calcAgreement.base_index)throw Error('SSBs basisindeks avviker fra kontrakten. Kontroller basisindeksen under Kontraktssum og vilkår.');
   if(current&&live.current){setIndexBusy(false);const next={...ref.current,form:{...ref.current.form,...value,index_key:indexKey}};ref.current=next;keepFinanceDraft(scope,next);setDraft(next);}
  }).catch(e=>{if(current&&e.name!=='AbortError')setIndexError(e.message);}).finally(()=>{if(current)setIndexBusy(false);});
  return()=>{current=false;controller.abort();};
 },[active,foreground,scope,!!meta,manage,f.mode,f.apply_index,indexKey,f.index_key,indexRetry,!!draft.attempt]);
 const setup=fields=>change({setup:{...ref.current.setup,...fields}});
 const lineSetup=(id,fields)=>setup({lines:ref.current.setup.lines.map(l=>l.id===id?{...l,...fields}:l)});
 const setValue=(id,key,value)=>form({values:{...ref.current.form.values,[id]:{...ref.current.form.values[id],[key]:value}}});
 const surface=draft.surface||(!meta?.agreement&&manage?'agreement':'overview');
 const showSurface=name=>change({surface:name});
 const fresh=()=>change({surface:'overview',edit_id:null,entry_revision:0,invoice_agreement:null,form:newInvoiceForm(meta.agreement),form_revision:meta.revision,attempt:null});
 const edit=entry=>{const next=invoiceFormFromEntry(entry),agreement=entry.result.agreement||meta.agreement;next.index_key=JSON.stringify([next.date,JSON.stringify([agreement.series,agreement.base_month,agreement.base_index,agreement.factor,agreement.lines]),'']);change({surface:'overview',edit_id:entry.id,entry_revision:entry.revision,invoice_agreement:agreement,form:next,form_revision:meta.revision,attempt:null});setIndexError('');};
 let amounts=null;try{if(calcAgreement)amounts=invoiceAmounts(f,{...calcAgreement,lines:meta.agreement.lines.map(l=>calcAgreement.lines.find(x=>x.id===l.id)||{...l,selected:false})});}catch{/* Incomplete fields remain editable. */}
 const indexReady=f.mode!=='period'||!f.apply_index||(f.index_key===indexKey&&!!f.target_index&&(!f.needs_confirmation||f.index_confirmed));
 return <div className="bolig-contract-finance" hidden={!active||!foreground}>
  <p>Før a konto og indeksregulering her. Lagre beløpene nå, og fyll inn fakturanumrene senere om nødvendig.</p>
  {error&&<p role="alert" className="bolig-contract-error">{error}</p>}{notice&&<p role="status">{notice}</p>}
  {!meta&&<p>Henter økonomioversikten …</p>}
  {meta&&<>
   <div className="bolig-finance-tabs" role="group" aria-label="Kontraktsøkonomi">{[...(manage?[['agreement','Kontraktssum og vilkår']]:[]),['overview','Fakturert og a konto'],['history','Fakturaoversikt']].map(([id,label])=><button key={id} type="button" aria-pressed={surface===id} disabled={busy} className={surface===id?'':'secondary'} onClick={()=>showSurface(id)}>{label}</button>)}<button type="button" className="secondary" disabled={busy} onClick={()=>run(async valid=>{const value=await load(valid);if(valid())change({form_revision:value.revision});})}>Hent siste økonomioversikt</button></div>
   {surface==='overview'&&meta.agreement&&<Summary lines={meta.totals}/>}
   {surface==='overview'&&!meta.agreement&&<p>Legg inn kontraktssummen under Kontraktssum og vilkår først.</p>}
   {!manage&&<p>Du kan lese fakturaene. En kontraktsadministrator kan lagre og redigere.</p>}
   <section hidden={surface!=='agreement'}>{manage&&s&&<section className="bolig-finance-setup"><h3>Kontraktssum og opsjoner</h3><p>Start med kontraktssummen for grunnleveransen. Legg inn avtalte opsjoner separat nedenfor. Alle beløp er ekskl. mva.</p>
    <form onSubmit={e=>{e.preventDefault();try{if(ref.current.attempt)send();else send('agreement',financeAgreement(s),draft.setup_revision??meta.revision);}catch(e){setError(e.message);}}}><fieldset disabled={busy||!!draft.attempt}>
     {s.lines.filter(l=>l.kind==='base').map(l=><label key={l.id}>Kontraktssum ekskl. mva.<input required inputMode="decimal" value={l.amount} onChange={e=>lineSetup(l.id,{amount:e.target.value})}/><small>Grunnleveransen til byggherre. Opsjonene nedenfor kommer i tillegg.</small></label>)}
     {s.lines.filter(l=>l.kind==='option').map((l,i)=><article className="bolig-finance-line bolig-finance-grid" key={l.id}><label>Navn på opsjon {i+1}<input required maxLength={120} value={l.name} onChange={e=>lineSetup(l.id,{name:e.target.value})}/></label><label>Beløp for opsjon {i+1} ekskl. mva.<input required inputMode="decimal" value={l.amount} onChange={e=>lineSetup(l.id,{amount:e.target.value})}/></label></article>)}
     <button type="button" className="secondary" disabled={s.lines.length>=51} onClick={()=>setup({lines:[...s.lines,{id:crypto.randomUUID(),kind:'option',name:'',amount:'',selected:false}]})}>Legg til avtalt opsjon</button>
     <label>Merknad til kontrakten (valgfritt)<textarea rows={2} maxLength={500} value={s.reference} onChange={e=>setup({reference:e.target.value})} placeholder="For eksempel kontraktsnummer eller punkt om betalingsvilkår. Kan stå tomt."/></label>
     <h4>Indeksregulering</h4><p>Velg indeksvilkårene fra kontrakten, og kryss av hvilke deler som skal reguleres.</p>
     {s.lines.map(l=><label key={l.id} className="bolig-finance-check"><input type="checkbox" checked={l.selected} onChange={e=>lineSetup(l.id,{selected:e.target.checked})}/>Indeksreguler {l.kind==='base'?'grunnleveransen':l.name||'denne opsjonen'}</label>)}
     {meta.agreement&&<button type="button" className="secondary" onClick={()=>change({setup:setupFromBasis(meta.agreement),setup_revision:meta.revision})}>Hent lagret avtalegrunnlag</button>}
     <button type="button" className="secondary" disabled={!!meta.agreement} onClick={()=>run(async valid=>{const history=await contractIndexRpc(context,root.id);if(!history.reports.length)throw Error('Ingen godkjent indeksberegning å hente. Fyll inn avtalen nedenfor.');const value=await contractIndexRpc(context,root.id,'report',{id:history.reports[0].id});if(valid())setup(setupFromBasis(value.report.basis));})}>Hent grunnlag fra siste indeksberegning</button>
     <label>Felles indeksserie<select value={s.series} onChange={e=>setup({series:e.target.value,base_index:'',origin:'manual'})}>{indexSeries.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
     <div className="bolig-finance-grid"><label>Basismåned for avtalen<input type="month" min="1900-01" max="2099-12" required value={s.base_month} onChange={e=>setup({base_month:e.target.value,base_index:'',origin:'manual'})}/></label><label>Basisindeks for avtalen<input inputMode="decimal" required value={s.base_index} onChange={e=>setup({base_index:e.target.value,origin:'manual'})}/></label><label>Avtalt reduksjonsfaktor<input inputMode="decimal" required value={s.factor} onChange={e=>setup({factor:e.target.value})}/></label></div>
     <button type="button" className="secondary" disabled={!s.base_month} onClick={()=>run(async(valid,signal)=>{const value=await fetchIndexValues(s.series,s.base_month,s.base_month,AbortSignal.any([signal,AbortSignal.timeout(15000)]));if(valid())setup({base_index:value.base_index,origin:value.origin});})}>Hent basisindeks fra SSB</button>
     <p>Faktor 1,00 gir full regulering. 0,90 gir 90 % av indeksendringen. Samme faktor gjelder ved nedgang. Endret avtalegrunnlag gjelder nye registreringer; historikken beholder tidligere vilkår.</p>
     </fieldset><button disabled={busy||(!!draft.attempt&&draft.attempt.action!=='agreement')}>Lagre kontraktssum og vilkår</button></form></section>}</section>
   <section hidden={surface!=='overview'}>{manage&&meta.agreement&&<form aria-label="Fakturaregister" onSubmit={e=>{e.preventDefault();try{if(ref.current.attempt){send();return;}if(!indexReady)throw Error('Vent på indeks eller bekreft riktig indeksmåned.');send('save',invoiceInput(ref.current.form,meta.agreement),ref.current.form_revision??meta.revision);}catch(e){setError(e.message);}}}>
    <div className="bolig-finance-tabs"><h3>{draft.edit_id?'Rediger fakturaer':'Ny a konto'}</h3>{draft.edit_id&&<button type="button" className="secondary" disabled={busy||!!draft.attempt} onClick={fresh}>Ny a konto</button>}</div>
    <fieldset disabled={busy||!!draft.attempt}>
     <div className="bolig-finance-grid"><label>Fakturadato<input type="date" required min="1900-01-01" max="2099-12-31" value={f.date} onChange={e=>form({date:e.target.value,period:e.target.value.slice(0,7),target_index:'',index_key:'',manual_month:'',index_confirmed:false,needs_confirmation:false})}/></label><label>Fakturatype<select aria-label="Fakturatype" value={f.mode==='period'?f.method:f.mode} onChange={e=>form({mode:['payment','documented'].includes(e.target.value)?'period':e.target.value,method:e.target.value,apply_index:['payment','documented'].includes(e.target.value),index_key:'',index_confirmed:false})}><option value="payment">Iht. betalingsplan</option><option value="documented">Dokumentert utført/medgått</option><option value="manual">Tidligere faktura / egne beløp</option><option value="credit" disabled={!!draft.edit_id&&f.mode!=='credit'}>Kreditnota</option></select></label></div>
     {f.mode==='credit'&&<label>Opprinnelig faktura<select aria-label="Opprinnelig faktura" required value={f.credit_of} onChange={e=>form({credit_of:e.target.value})}><option value="">Velg faktura</option>{meta.entries.filter(e=>e.kind==='invoice'&&e.id!==draft.edit_id).map(e=><option key={e.id} value={e.id}>{e.input.number||e.input.index_number||'Uten fakturanummer'} · {e.input.date}</option>)}</select></label>}
     <p>Oppgi bare denne fakturaens beløp ekskl. mva. Tidligere fakturaer er allerede med i summene ovenfor.</p>
     {meta.agreement.lines.map(l=><article className="bolig-finance-line" key={l.id}><strong>{l.name}</strong><label>{(f.mode==='period'&&f.method==='documented'?'Utført/medgått denne perioden – ':'A konto denne perioden – ')+l.name}<input inputMode="decimal" value={f.values[l.id]?.principal||''} onChange={e=>setValue(l.id,'principal',e.target.value)} placeholder="0,00"/></label>{f.mode!=='period'&&<label>Indeksbeløp – {l.name}<input inputMode="decimal" value={f.values[l.id]?.index||''} onChange={e=>setValue(l.id,'index',e.target.value)} placeholder="0,00"/></label>}</article>)}
     {f.mode==='period'&&<section aria-label="Indeks på fakturadato"><label className="bolig-finance-check"><input type="checkbox" checked={f.apply_index} onChange={e=>form({apply_index:e.target.checked,index_key:''})}/>Beregn indeksregulering iht. kontrakten</label>{f.apply_index&&<>
      {indexBusy&&<p role="status">Henter indeksen som gjaldt på fakturadatoen …</p>}{indexError&&<p role="alert">{indexError} <button type="button" className="secondary" onClick={()=>setIndexRetry(n=>n+1)}>Hent indeks igjen</button></p>}
      {f.target_index&&<p><strong>Måned for SSB-indeksen: {monthName(f.target_month)} · indekstall {f.target_index}</strong>{f.index_published&&<> · publisert {dateName(f.index_published)}</>}</p>}
      {f.needs_confirmation&&<><p>SSB gir ikke bekreftet publiseringsdato for denne eldre fakturadatoen. Kontroller hvilken indeksmåned som var tilgjengelig da.</p><label>Måned for SSB-indeksen<select aria-label="Måned for SSB-indeksen" value={f.target_month} onChange={e=>form({manual_month:e.target.value,target_month:e.target.value,target_index:'',index_key:'',index_confirmed:false})}>{f.candidates?.map(m=><option key={m} value={m}>{monthName(m)}</option>)}</select></label><label className="bolig-finance-check"><input type="checkbox" checked={!!f.index_confirmed} onChange={e=>form({index_confirmed:e.target.checked})}/>Jeg har kontrollert at denne indeksen var tilgjengelig på fakturadatoen</label></>}
      <p>Indeks faktureres separat. Fakturadatoen bestemmer hvilken publisert indeks som brukes.</p>
     </>}</section>}
     <section className="bolig-finance-result" aria-label="Fakturaer denne perioden"><h4>Fakturaer denne perioden</h4><div className="bolig-finance-grid"><label>Fakturanummer a konto (valgfritt)<input maxLength={80} value={f.number} onChange={e=>form({number:e.target.value})}/></label><div><strong>A konto ekskl. mva.</strong><p>{amounts?money(amounts.principal_cents):'Fyll inn beløp'}</p></div><label>Fakturanummer indeksregulering (valgfritt)<input maxLength={80} value={f.index_number} onChange={e=>form({index_number:e.target.value})}/></label><div><strong>Indeksregulering ekskl. mva.</strong><p>{amounts&&indexReady?money(amounts.index_cents):'Henter / kontrollerer indeks'}</p></div></div><p><strong>Samlet ekskl. mva.: {amounts&&indexReady?money(amounts.principal_cents+amounts.index_cents):'–'}</strong></p></section>
     <label>Merknad (valgfritt)<textarea rows={2} maxLength={500} value={f.reason} onChange={e=>form({reason:e.target.value})}/></label>
    </fieldset>
    <div className="bolig-finance-save"><span>{draft.attempt&&!busy?'Svar på lagring mangler. Trykk Lagre igjen for samme forsøk.':'Lagre oppdaterer begge hittil-summene. Fakturanumrene kan fylles inn senere.'}</span><button disabled={busy||indexBusy||(!draft.attempt&&!indexReady)} type="submit">{busy?'Lagrer …':'Lagre'}</button></div>
   </form>}</section>
   {surface==='history'&&<p>Her finner du lagrede fakturaer og kreditnotaer. {manage?'Velg Rediger for å se eller endre en faktura. ':''}Tidligere godkjente indeksberegninger vises nedenfor og teller ikke som fakturert.</p>}
   {(surface==='overview'||surface==='history')&&<section aria-label="Lagrede fakturaer" className="bolig-finance-history"><h3>Lagrede fakturaer</h3>{!meta.entries.length&&<p>Ingen fakturaer er lagret ennå.</p>}{meta.entries.map(e=><article key={e.id} className="bolig-finance-line"><strong>{e.kind==='credit'?'Kreditnota':'Fakturaer'} · {e.input.date}</strong><p>A konto: {e.input.number||'Nummer ikke fylt inn'} · {money(e.result.principal_cents)}<br/>Indeksregulering: {e.input.index_number||(e.result.principal_cents===0?e.input.number:'')||'Nummer ikke fylt inn'} · {money(e.result.index_cents)}</p>{manage&&<button type="button" className="secondary" disabled={busy||!!draft.attempt} onClick={()=>edit(e)}>Rediger {e.input.number||e.input.index_number||e.input.date}</button>}</article>)}{meta.entries.length>0&&meta.entries.length%50===0&&<button type="button" className="secondary" disabled={busy} onClick={()=>run(async valid=>{const value=await contractFinanceRpc(context,root.id,'get',{before_revision:meta.entries.at(-1).revision});if(valid())setMeta(old=>({...value,entries:[...old.entries,...value.entries]}));})}>Vis eldre registreringer</button>}</section>}
   {surface==='overview'&&meta.agreement&&<button type="button" className="secondary" onClick={()=>showSurface('index')}>Beregn indeks for hele kontrakten</button>}
  </>}
  <section hidden={!meta||(surface!=='history'&&surface!=='index')}><BoligContractIndex context={context} root={root} documents={documents} agreement={lastAgreement.current} active={active&&!!meta} foreground={foreground} manage={manage} historyOnly={surface!=='index'} onEditAgreement={()=>showSurface('agreement')} onAccessLost={onAccessLost}/></section>
 </div>;
}
