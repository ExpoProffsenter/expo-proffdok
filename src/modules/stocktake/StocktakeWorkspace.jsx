import React,{lazy,Suspense,useEffect,useRef,useState} from 'react';
import {stocktakeRpc,allStocktakeLines} from './stocktakeClient.js';
import {EMPTY_COUNT,countQuantity,stocktakeStorageKey,readCountDraft,writeCountDraft,stocktakeCordel,stocktakeCsv,aggregateStocktake} from './stocktakeModel.mjs';
import {downloadCordelFile} from '../cordel/cordelFiles.mjs';
import {StocktakeHelp} from '../help/StocktakeHelp.jsx';
import {useCordelAccess,readCordelAccess} from '../cordel/cordelAccess.js';
const Scanner=lazy(()=>import('../storeCatalog/PriceSearchBarcodeScanner.jsx'));
const today=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Oslo'}).format(new Date());
export default function StocktakeWorkspace({context}) {
 const key=stocktakeStorageKey(context),initial=useRef(readCountDraft(key));
 const [saved,setSaved]=useState(()=>({...initial.current,open:true,draft:{...EMPTY_COUNT,...initial.current?.draft},create:initial.current?.create||{id:crypto.randomUUID(),title:'Varetelling',warehouse:'',date:today()}}));
 const state=useRef(saved),alive=useRef(true),busyRef=useRef(false),searchVersion=useRef(0);
 const [sessions,setSessions]=useState([]),[page,setPage]=useState(null),[offset,setOffset]=useState(0),[busy,setBusy]=useState(false),[loading,setLoading]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[storageError,setStorageError]=useState(false);
 const [query,setQuery]=useState(''),[results,setResults]=useState([]),[totalResults,setTotalResults]=useState(0),[searchBusy,setSearchBusy]=useState(false),[scanning,setScanning]=useState(false),[showManual,setShowManual]=useState(false);
 const cordelAllowed=useCordelAccess();
 const [confirmClose,setConfirmClose]=useState(false);
 function persist(patch){const next={...state.current,...patch};state.current=next;setSaved(next);setStorageError(!writeCountDraft(key,next));return next;}
 const args={p_company_id:context.company_id};
 async function refresh(id=state.current.activeId,start=offset){setLoading(true);try{const list=await stocktakeRpc('stocktake_list',args);const p=id?await stocktakeRpc('stocktake_get',{...args,p_id:id,p_offset:start}):null;if(!alive.current)return;setSessions(list);setPage(p);setOffset(start);}catch(e){if(alive.current)setError(e.message);}finally{if(alive.current)setLoading(false);}}
 useEffect(()=>{alive.current=true;refresh(state.current.activeId,0);return()=>{alive.current=false;searchVersion.current++;};},[]);
 const draft=saved.draft,locked=busy||Boolean(saved.pending)||loading||page?.session.closed;
 const hasDraft=Object.entries(draft).some(([k,v])=>k!=='location'&&String(v??'').length>0)||Boolean(saved.editing);
 function updateDraft(field,value){persist({draft:{...state.current.draft,[field]:value}});}
 async function run(task){if(busyRef.current)return;busyRef.current=true;setBusy(true);setError('');setNotice('');try{await task();}catch(e){if(alive.current)setError(e.message);}finally{busyRef.current=false;if(alive.current)setBusy(false);}}
 async function createSession(){await run(async()=>{const c=state.current.create;const row=await stocktakeRpc('stocktake_create',{...args,p_id:c.id,p_title:c.title,p_warehouse:c.warehouse,p_date:c.date});if(!alive.current)return;persist({activeId:row.id,draft:{...EMPTY_COUNT},editing:null});await refresh(row.id,0);setNotice('Tellingen er opprettet. Søk eller skann den første varen.');});}
 async function openSession(id){if(saved.pending)return;persist({activeId:id,draft:{...EMPTY_COUNT},editing:null});setPage(null);setResults([]);setQuery('');setError('');setNotice('');setConfirmClose(false);await refresh(id,0);}
 async function command(input){
  let pending=state.current.pending;
  if(!pending){pending={id:crypto.randomUUID(),sessionId:state.current.activeId,input};persist({pending});}
  await run(async()=>{const result=await stocktakeRpc('stocktake_record',{...args,p_id:pending.sessionId,p_command_id:pending.id,p_input:pending.input});if(!alive.current)return;
   if(result?.error){persist({pending:null});setError(result.error);await refresh(pending.sessionId,offset);return;}
   persist({pending:null,draft:{...EMPTY_COUNT,location:state.current.draft.location},editing:null});setShowManual(false);setQuery('');setResults([]);setTotalResults(0);setConfirmClose(false);
   setNotice(result.closed?'Tellingen er avsluttet og kan eksporteres.':result.deleted?'Varen er fjernet.':'Antallet er lagret i firmaet.');await refresh(pending.sessionId,offset);
  });
 }
 function saveCount(event){event.preventDefault();try{const quantity=countQuantity(draft.quantity);
  if(saved.editing)void command({action:'set',line_id:saved.editing.id,revision:saved.editing.revision,quantity});
  else void command({action:'add',...draft,quantity});
 }catch(e){setError(e.message);}}
 async function search(value,start=0){const t=++searchVersion.current;setError('');setSearchBusy(true);if(!start){setResults([]);setTotalResults(0);}try{
  const rows=await stocktakeRpc('search_internal_store_catalog_prices_page',{p_query:value,p_limit:50,p_offset:start});
  if(!alive.current||t!==searchVersion.current)return;setResults(old=>start?[...old,...rows]:rows);setTotalResults(Number(rows[0]?.total_count||0));
 }catch(e){if(alive.current&&t===searchVersion.current)setError(e.message);}finally{if(alive.current&&t===searchVersion.current)setSearchBusy(false);}}
 function choose(item){persist({draft:{...EMPTY_COUNT,catalog_id:item.id,supplier:item.supplier_name,number:item.supplier_product_number,description:item.description,gtin:item.gtin||'',location:state.current.draft.location},editing:null});setResults([]);setTotalResults(0);setQuery('');setShowManual(false);setNotice('Angi antallet du har telt, og trykk «Registrer antall».');}
 async function exportFile(cordel){await run(async()=>{if(cordel&&!(await readCordelAccess()))throw Error('Cordel-tilgangen er ikke aktiv.');const data=await allStocktakeLines(context.company_id,state.current.activeId);if(!alive.current)return;if(!data.items.length)throw Error('Tellingen er tom.');
  const bytes=cordel?stocktakeCordel(data.items):stocktakeCsv(data.session,data.items,context.company_name);
  const name=`Varetelling_${data.session.count_date}_${data.session.warehouse}`.replace(/[^\p{L}\p{N}_-]/gu,'_');downloadCordelFile(cordel?'ProffDok_Cordel_Varetelling.txt':`${name}.csv`,bytes,cordel?'text/plain':'text/csv');
  setNotice(`${cordel?aggregateStocktake(data.items).length:data.items.length} varelinjer er lastet ned. ${cordel?'Antall fra flere områder er summert per leverandør og varenummer.':''}`);
 });}
 const pending=Boolean(saved.pending),active=saved.activeId;
 return <div className="stocktakeWorkspace">
  {storageError?<p role="alert">Kladden kunne ikke sikres i denne fanen. Hold siden åpen til registreringen er lagret i firmaet.</p>:null}
  {error?<p className="stocktakeError" role="alert">{error}</p>:null}{notice?<p className="stocktakeNotice" role="status">{notice}</p>:null}
  {pending?<div className="stocktakePending"><strong>Registreringen er ikke bekreftet.</strong><p>Prøv samme registrering igjen. Den blir bare lagret én gang, selv om svaret fra serveren ble borte.</p><button type="button" disabled={busy} onClick={()=>command()}>Prøv registrering igjen</button></div>:null}
  <div className="stocktakeBar"><label>Åpne lagret telling<select aria-label="Åpne lagret telling" value={active||''} disabled={busy||pending||loading||hasDraft} onChange={e=>{if(e.target.value)void openSession(e.target.value);}}><option value="">Velg telling</option>{sessions.map(s=><option key={s.id} value={s.id}>{s.count_date} · {s.warehouse} · {s.title} ({s.line_count} linjer){s.closed?' – avsluttet':''}</option>)}</select></label>
   <button type="button" className="secondary" disabled={busy||pending||loading||hasDraft} onClick={()=>{persist({activeId:null,draft:{...EMPTY_COUNT},editing:null,create:{id:crypto.randomUUID(),title:'Varetelling',warehouse:'',date:today()}});setPage(null);setQuery('');setResults([]);setError('');setNotice('');}}>Ny telling</button>
   <button type="button" className="secondary" disabled={busy||loading} onClick={()=>refresh()}>Hent telling på nytt</button></div>
  {loading?<p role="status">Henter lagrede varer …</p>:null}
  {!active?<form className="stocktakeCreate" onSubmit={e=>{e.preventDefault();createSession();}}><h3>Start en varetelling</h3><p>Bruk én telling per lager. Område eller hylle kan angis for hver vare.</p><div className="stocktakeFields">
   <label>Navn på telling<input required maxLength={120} value={saved.create.title} onChange={e=>persist({create:{...saved.create,title:e.target.value}})}/></label>
   <label>Lager i Cordel<input required maxLength={80} value={saved.create.warehouse} placeholder="For eksempel 1 – Expo lager" onChange={e=>persist({create:{...saved.create,warehouse:e.target.value}})}/></label>
   <label>Telledato<input required type="date" value={saved.create.date} onChange={e=>persist({create:{...saved.create,date:e.target.value}})}/></label></div><button disabled={busy||loading}>{busy?'Oppretter …':'Opprett telling'}</button></form>:null}
  {active&&page?<>
   <div className="stocktakeSession"><div><small>{page.session.count_date} · {page.session.warehouse}</small><h3>{page.session.title}</h3><p>{page.total} registrerte varelinjer · {page.session.closed?'Avsluttet – klar for eksport':'Åpen – deles med firmaets tellere'}</p></div><span className="stocktakeBadge">{page.session.closed?'Avsluttet':'Pågår'}</span></div>
   {!page.session.closed?<section className="stocktakeCount" aria-label="Registrer telleantall">{hasDraft?<p>Lagre eller avbryt innleggingen før du velger en annen vare eller telling.</p>:null}<h3>{saved.editing?'Endre lagret antall':'Finn varen du teller'}</h3><p>Søk på varenummer, navn eller strekkode. Velg riktig leverandør før du registrerer antallet. Flere registreringer av samme vare på samme område legges sammen.</p>
    {!saved.editing?<><form className="stocktakeSearch" onSubmit={e=>{e.preventDefault();if(query.trim().length>=2)search(query.trim());}}><label className="stocktakeGrow">Søk eller les strekkode<input disabled={locked||hasDraft} value={query} onChange={e=>{searchVersion.current++;setSearchBusy(false);setQuery(e.target.value);setResults([]);setTotalResults(0);}} placeholder="Varenummer, navn eller strekkode"/></label><button disabled={locked||hasDraft||searchBusy||query.trim().length<2}>Søk vare</button><button type="button" className="secondary" disabled={locked||hasDraft} onClick={()=>setScanning(true)}>Skann strekkode</button><button type="button" className="secondary" disabled={locked||hasDraft} onClick={()=>{persist({draft:{...EMPTY_COUNT,location:draft.location},editing:null});setShowManual(true);setResults([]);}}>Legg inn vare manuelt</button></form>
    {scanning?<Suspense fallback={<p>Starter kamera …</p>}><Scanner onScan={code=>{setScanning(false);setQuery(code);search(code);}} onCancel={()=>setScanning(false)} onError={e=>{setScanning(false);setError(e?.message||String(e));}}/></Suspense>:null}
    {searchBusy?<p role="status">Søker etter varer …</p>:null}
    {results.length?<div className="stocktakeResults"><strong>Velg vare og leverandør ({results.length} av {totalResults})</strong>{results.map(item=><button type="button" className="stocktakeResult" key={item.id} disabled={locked||hasDraft} onClick={()=>choose(item)}><span><strong>{item.description}</strong><small>{item.supplier_name} · Varenr. {item.supplier_product_number}</small><small>Strekkode: {item.gtin||'Ikke registrert'}</small></span><b>Velg</b></button>)}{results.length<totalResults?<button type="button" className="secondary" disabled={searchBusy||locked||hasDraft} onClick={()=>search(query,results.length)}>Vis flere leverandører og varer</button>:null}</div>:null}
    {!searchBusy&&query.trim().length>=2&&!results.length&&totalResults===0?<small>Trykk «Søk vare». Finner du ikke varen, bruk «Legg inn vare manuelt».</small>:null}</>:null}
    {showManual||hasDraft?<form className="stocktakeForm" onSubmit={saveCount}><fieldset disabled={Boolean(locked)}><legend>{saved.editing?'Sett samlet antall for denne varelinjen':draft.catalog_id?'Valgt katalogvare':'Manuell vare'}</legend><div className="stocktakeFields">
     <label>Leverandør<input required maxLength={120} readOnly={Boolean(draft.catalog_id||saved.editing)} value={draft.supplier} onChange={e=>updateDraft('supplier',e.target.value)}/></label>
     <label>Varenummer i Cordel<input required maxLength={120} readOnly={Boolean(draft.catalog_id||saved.editing)} value={draft.number} onChange={e=>updateDraft('number',e.target.value)}/></label>
     <label className="stocktakeWide">Beskrivelse<input required maxLength={500} readOnly={Boolean(draft.catalog_id||saved.editing)} value={draft.description} onChange={e=>updateDraft('description',e.target.value)}/></label>
     <label>Strekkode (valgfritt)<input maxLength={50} readOnly={Boolean(draft.catalog_id||saved.editing)} value={draft.gtin} onChange={e=>updateDraft('gtin',e.target.value)}/></label>
     <label>Område / hylle (valgfritt)<input maxLength={120} readOnly={Boolean(saved.editing)} value={draft.location} onChange={e=>updateDraft('location',e.target.value)} placeholder="For eksempel reol A"/></label>
     <label>{saved.editing?'Samlet talt antall':'Antall du har telt'}<input required inputMode="decimal" value={draft.quantity} onChange={e=>updateDraft('quantity',e.target.value)} placeholder="0 eller mer"/></label></div><div className="stocktakeBar"><button>{busy?'Lagrer …':saved.editing?'Lagre nytt antall':'Registrer antall'}</button><button type="button" className="secondary" onClick={()=>{persist({draft:{...EMPTY_COUNT,location:draft.location},editing:null});setShowManual(false);}}>Avbryt innlegging</button></div></fieldset></form>:null}
   </section>:null}
   <section aria-label="Telte varer"><h3>Telte varer</h3><p>Antall 0 er en registrert telling. «Endre antall» erstatter antallet på raden.</p><div className="stocktakeLines">{page.items.map(l=><article className="stocktakeLine" key={l.id}><div><strong>{l.description}</strong><small>{l.supplier} · {l.number} · {l.location||'Uten område'}</small></div><b>{new Intl.NumberFormat('nb-NO',{maximumFractionDigits:3}).format(l.quantity)}</b>{!page.session.closed?<div className="stocktakeLineActions"><button type="button" className="secondary" disabled={locked||hasDraft} onClick={()=>{persist({editing:{id:l.id,revision:l.revision},draft:{...EMPTY_COUNT,...Object.fromEntries(Object.keys(EMPTY_COUNT).map(k=>[k,l[k]??'']))}});setResults([]);setShowManual(false);}}>Endre antall</button><button type="button" className="secondary" disabled={locked||hasDraft} onClick={()=>command({action:'delete',line_id:l.id,revision:l.revision})}>Fjern</button></div>:null}</article>)}</div>
    {!page.total?<p>Ingen varer er registrert ennå.</p>:null}<div className="stocktakeBar"><span>Viser {page.total?offset+1:0}–{Math.min(offset+100,page.total)} av {page.total}</span><button type="button" className="secondary" disabled={offset===0||busy||loading||pending} onClick={()=>refresh(active,Math.max(offset-100,0))}>Forrige 100</button><button type="button" className="secondary" disabled={offset+100>=page.total||busy||loading||pending} onClick={()=>refresh(active,offset+100)}>Neste 100</button></div>
   </section>
   <section className="stocktakeExport" aria-label="Eksport av varetelling"><h3>Last ned tellingen</h3><p>Cordel-filen summerer områdene per leverandør og varenummer. Kontrollfilen beholder alle områdene. Bare registrerte varer er med.</p><details><summary>Import i Cordel</summary><p>Åpne riktig lager og varetelling i Cordel. Bruk «Import → ASCII-Tekstfil» med samme vareoppsett som ellers: NR = kolonne 1, Mengde = kolonne 2, Fagområde/leverandør = kolonne 3. Filen bruker semikolon, desimalkomma og Windows ANSI. Ingen overskriftsrad eller priser.</p><p>Fast filnavn: ProffDok_Cordel_Varetelling.txt. Legg filen i P:\Expo ProffDok i Cordel-miljøet, og gjenbruk importdefinisjonen. Kontroller om tellingen skal legges til eller erstatte beholdningen før import.</p></details><div className="stocktakeBar">{cordelAllowed?<button type="button" disabled={busy||loading||pending||hasDraft||!page.total} onClick={()=>exportFile(true)}>Last ned Cordel-tekstfil</button>:null}<button type="button" className="secondary" disabled={busy||loading||pending||hasDraft||!page.total} onClick={()=>exportFile(false)}>Last ned kontrollfil (CSV)</button></div>
    {!page.session.closed?<div className="stocktakeBar">{confirmClose?<><p>Avslutte tellingen? Da låses registreringene, og filene kan fortsatt lastes ned.</p><button type="button" disabled={busy||pending||loading||hasDraft} onClick={()=>command({action:'close',revision:page.session.revision})}>Bekreft avslutning</button><button type="button" className="secondary" disabled={busy||pending} onClick={()=>setConfirmClose(false)}>Fortsett telling</button></>:<button type="button" className="secondary" disabled={busy||pending||loading||hasDraft} onClick={()=>setConfirmClose(true)}>Avslutt telling</button>}</div>:null}
   </section>
  </>:null}
  <StocktakeHelp/>
 </div>;
}
