import React, {useEffect, useRef, useState} from 'react';
import {orderRpc} from './proCatalogOrderClient.js';
import './proCatalogSearch.css';

const money = new Intl.NumberFormat('nb-NO', {style:'currency',currency:'NOK'});
export function customerPrice(item) {
 const net=item?.my_net_price_ex_vat;
 const own=net!==null&&net!==undefined&&net!=='';
 const value=own?net:item?.suggested_sale_price_ex_vat;
 return {own, value:value===null||value===undefined||value===''?null:Number(value)};
}
export function CustomerPrices({item,compact=false}) {
 const {own,value}=customerPrice(item);
 if(value===null||!Number.isFinite(value))return <p>Pris ikke tilgjengelig.</p>;
 if(compact)return <span className="pro-customer-result-price"><small>{own?'Din pris':'Veiledende pris'} eks. mva.</small><strong>{money.format(value)}</strong></span>;
 const incl=own?Math.round(value*125)/100:Number(item.suggested_sale_price_incl_vat??value*1.25);
 return <div className="pro-customer-prices"><div><small>{own?'Din pris':'Veiledende pris'} eks. mva.</small><strong>{money.format(value)}</strong></div><div><small>{own?'Din pris':'Veiledende pris'} inkl. mva.</small><strong>{money.format(incl)}</strong></div></div>;
}
// Price values stay in memory and are always read through the existing access boundary.
export function OrderItemPrices({item,context,pending}) {
 const [current,setCurrent]=useState(null);
 useEffect(()=>{let active=true;setCurrent(null);if(pending)return;
 orderRpc('pro_catalog_order_search',{p_query:item.supplier_product_number,p_limit:50}).then(rows=>{if(active)setCurrent(rows?.find(x=>x.id===item.id)||null);}).catch(()=>{});
 return()=>{active=false;};},[item.id,item.supplier_product_number,context,pending]);
 return current&&!pending?<CustomerPrices item={current}/>:<small>{pending?'Kontrollerer prisinnsyn …':'Pris hentes ved nytt vareoppslag.'}</small>;
}
export default function ProCatalogSearch({context,pending,onAdd,disabled,initialQuery='',onQueryChange,supportCompanyId=null}) {
 const [query,setQuery]=useState(initialQuery),[smart,setSmart]=useState(true),[rows,setRows]=useState([]),[selected,setSelected]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[total,setTotal]=useState(0),[quantity,setQuantity]=useState('1');
 const selectedId=useRef(null),generation=useRef(0),detail=useRef(null),callbacks=useRef(onQueryChange);callbacks.current=onQueryChange;
 useEffect(()=>{
  const ticket=++generation.current;setRows([]);setSelected(null);setTotal(0);setError('');
  if(pending||query.trim().length<2){setBusy(false);return;}
  setBusy(true);
  const timer=setTimeout(async()=>{try{
   let data=await orderRpc(smart?'search_pro_store_catalog_smart':supportCompanyId?'search_pro_store_catalog_support':'search_pro_store_catalog',{p_query:query.trim(),p_limit:50,...(supportCompanyId?{p_company_id:supportCompanyId}:{})});
   if(supportCompanyId&&context.showOwnPrices!==true)data=(data||[]).map(item=>({...item,my_net_price_ex_vat:null}));
   if(ticket!==generation.current)return;setRows(data||[]);setSelected(data?.find(x=>x.id===selectedId.current)||null);setTotal(Number(data?.[0]?.total_count??data?.length??0));
  }catch(e){if(ticket===generation.current)setError(e.message);}finally{if(ticket===generation.current)setBusy(false);}},220);
  return()=>{clearTimeout(timer);++generation.current;};
 },[query,smart,context,pending,supportCompanyId]);
 const choose=item=>{selectedId.current=item.id;setSelected(item);setQuantity('1');};
 useEffect(()=>{if(selected)detail.current?.focus({preventScroll:true});},[selected]);
 return <div className="pro-customer-search">
  <label className="pro-customer-query">Søk i firmaets varekatalog<input type="search" value={query} maxLength={160} placeholder="Søk varenavn, varenummer eller GTIN/EAN" onChange={e=>{selectedId.current=null;setQuery(e.target.value);callbacks.current?.(e.target.value);}} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();if(!busy&&rows.length)choose(rows[0]);}}}/></label>
  <label className="pro-customer-smart"><input type="checkbox" checked={smart} onChange={e=>setSmart(e.target.checked)}/>Smartere søk</label>
  <p>{smart?'Skriv flere ord i valgfri rekkefølge. Vanlige fagord og forkortelser tas med.':'Vanlig søk: ordene må stå i samme rekkefølge som i varenavnet.'}</p>
  {busy&&<p role="status">Søker …</p>}{error&&<p role="alert">{error}</p>}
  {!busy&&!error&&query.trim().length>=2&&<p role="status">{rows.length?`${total} treff${total>rows.length?` · viser de første ${rows.length}. Avgrens søket for flere varer.`:''}`:'Ingen treff.'}</p>}
  <div className="pro-customer-columns"><div className="pro-customer-results" aria-label="Søkeresultater">{rows.map(item=><button type="button" key={item.id} className="pro-customer-result" aria-pressed={selected?.id===item.id} onClick={()=>choose(item)}><span><strong>{item.description}</strong><small>{item.supplier_name} · varenr. {item.supplier_product_number}</small>{item.match_kind==='related'&&<small>Treff på beslektet fagord</small>}</span><CustomerPrices item={item} compact/></button>)}</div>
  {selected&&<section className="pro-customer-detail" tabIndex={-1} ref={detail} aria-label="Valgt vare"><h3>{selected.description}</h3><p>{selected.supplier_name}</p><dl>{[['Varenummer',selected.supplier_product_number],['GTIN/EAN',selected.gtin],['NOBB',selected.nobb_number],['Varegruppe',selected.product_group],['Prisdatert',selected.price_date?selected.price_date.slice(0,10).split('-').reverse().join('.'):null]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value||'–'}</dd></div>)}</dl><CustomerPrices item={selected}/>{!supportCompanyId&&<><label>Antall<input inputMode="decimal" value={quantity} onChange={e=>setQuantity(e.target.value)}/></label><button type="button" disabled={disabled||pending} onClick={()=>onAdd(selected,quantity)}>Legg i varebestilling</button><p>Varen legges bare til når du velger knappen. Du blir i varesøket.</p></>} {supportCompanyId&&<p>Skrivebeskyttet supportvisning av valgt brukers varekort og prisinnsyn. Dette sender ingen bestilling.</p>}</section>}
  </div>
 </div>;
}
