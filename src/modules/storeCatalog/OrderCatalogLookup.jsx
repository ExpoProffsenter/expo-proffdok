import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { orderRpc } from "./proCatalogOrderClient.js";

const money = new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK", maximumFractionDigits: 2 });
function price(value) { const n = Number(value); return Number.isFinite(n) ? money.format(n) : "–"; }

export default function OrderCatalogLookup({
  internal = false,
  focusRequest = 0,
  onUse,
  initialQuery = "",
  onQueryChange = null,
  placeholder = "Søk varenavn, varenummer eller GTIN/EAN",
}) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [readyQuery,setReadyQuery]=useState('');
  const input=useRef(null),request=useRef(0),timer=useRef(null),currentQuery=useRef(query),callbacks=useRef({onUse,onQueryChange});
  currentQuery.current=query;callbacks.current={onUse,onQueryChange};
  const choose=item=>{
    if(callbacks.current.onUse?.(item)===false)return;
    ++request.current;window.clearTimeout(timer.current);currentQuery.current='';
    setQuery('');setResults([]);setReadyQuery('');setBusy(false);setMessage('');
  };
  const search=async(clean,pickFirst=false)=>{
    if(clean.length<2)return;const ticket=++request.current;
    setBusy(true);setMessage('');
    try{
      const data=await orderRpc('pro_catalog_order_search',{p_query:clean,p_limit:12});
      if(ticket!==request.current||currentQuery.current.trim()!==clean)return;
      const items=Array.isArray(data)?data:[];setResults(items);setReadyQuery(clean);setBusy(false);
      if(pickFirst&&items.length)choose(items[0]);
    }catch(error){if(ticket===request.current){setResults([]);setReadyQuery('');setBusy(false);setMessage(error?.message||'Kunne ikke søke i vareregisteret.');}}
  };
  useEffect(()=>{
    const clean=query.trim();
    if(clean.length<2){setResults([]);setReadyQuery('');setBusy(false);setMessage('');return;}
    setBusy(true);timer.current=window.setTimeout(()=>search(clean),220);
    return()=>{++request.current;window.clearTimeout(timer.current);};
  },[query,internal]);
  useEffect(()=>()=>{++request.current;window.clearTimeout(timer.current);},[]);
  useEffect(()=>{if(focusRequest){input.current?.focus();input.current?.scrollIntoView({block:'nearest'});}},[focusRequest]);
  const changeQuery=value=>{
    ++request.current;window.clearTimeout(timer.current);currentQuery.current=value;
    setQuery(value);setResults([]);setReadyQuery('');setMessage('');setBusy(value.trim().length>=2);
    callbacks.current.onQueryChange?.(value);
  };
  const keyDown=event=>{
    if(event.key!=='Enter'||event.isComposing)return;event.preventDefault();
    const clean=currentQuery.current.trim();if(clean.length<2){setMessage('Skriv minst to tegn for å søke.');return;}
    window.clearTimeout(timer.current);
    if(!busy&&readyQuery===clean&&results.length)choose(results[0]);else void search(clean,true);
  };

  return (
    <div className="pro-store-catalog-lookup">
      <div className="pro-store-catalog-head"><strong>{internal ? "Vareregister" : "Proff vareregister"}</strong><span>{internal ? "Aktive varer fra Prissøk. Bestillingsfilene har ingen priser." : "Kun leverandører firmaet har avtale med."}</span></div>
      <label className="pro-store-catalog-search"><Search size={17}/><input ref={input} aria-label="Søk etter neste vare" value={query} onChange={e=>changeQuery(e.target.value)} onKeyDown={keyDown} placeholder={placeholder} autoComplete="off"/></label>
      {busy ? <small role="status">Søker …</small> : results.length ? <small>Trykk Enter for å velge første treff, eller velg varen i listen.</small> : null}
      {results.length ? <div className="pro-store-catalog-results">{results.map((item) => <button key={item.id} type="button" className="pro-store-catalog-result" onClick={()=>choose(item)}><span><strong>{item.description || "Vare uten beskrivelse"}</strong><small>{item.supplier_name} · varenr. {item.supplier_product_number}</small></span><span className="pro-store-catalog-prices"><strong>{price(item.suggested_sale_price_ex_vat)} eks. mva.</strong>{item.my_net_price_ex_vat !== null && item.my_net_price_ex_vat !== undefined ? <small>Din nto pris {price(item.my_net_price_ex_vat)} eks. mva.</small> : null}</span></button>)}</div> : null}
      {!busy && query.trim().length >= 2 && !results.length && !message ? <small>Ingen treff.</small> : null}
      {message ? <small className="is-error">{message}</small> : null}
      <style>{`.pro-store-catalog-lookup{display:grid;gap:8px;padding:10px;border:1px solid #b9d7d8;border-radius:12px;background:#f7fbfb;margin:0 0 12px}.pro-store-catalog-head{display:flex;justify-content:space-between;gap:12px}.pro-store-catalog-head span,.pro-store-catalog-result small{font-size:12px;color:#60737b}.pro-store-catalog-search{position:relative}.pro-store-catalog-search svg{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#60757e}.pro-store-catalog-search input{width:100%;min-height:44px;box-sizing:border-box;padding:0 12px 0 38px;border:1px solid #bcd0d7;border-radius:11px;background:#fff;font:inherit}.pro-store-catalog-results{display:grid;gap:7px;max-height:330px;overflow:auto}.pro-store-catalog-result{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;text-align:left;align-items:center;padding:10px;border:1px solid #d6e4e8;border-radius:10px;background:#fff;color:inherit;cursor:pointer}.pro-store-catalog-result>span{display:grid;gap:2px}.pro-store-catalog-prices{text-align:right;white-space:nowrap}.pro-store-catalog-lookup .is-error{color:#a33232}@media(max-width:760px){.pro-store-catalog-head,.pro-store-catalog-result{grid-template-columns:1fr;display:grid}.pro-store-catalog-prices{text-align:left}}`}</style>
    </div>
  );
}
