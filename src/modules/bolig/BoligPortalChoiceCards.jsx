import React, {useState} from 'react';
import {agreementMoney as money} from './boligCommerceCore.js';
import './boligPortalChoices.css';

function ProductImage({good,caption=false}) {
 const [failed,setFailed]=useState(false);
 if(failed)return <span className="bolig-choice-image-missing">{caption?good.name+' · ':''}Bilde utilgjengelig</span>;
 return <a href={good.image_url} target="_blank" rel="noreferrer" aria-label={`Se større bilde av ${good.name}`}><img src={good.image_url} alt={good.name} loading="lazy" onError={()=>setFailed(true)}/>{caption&&<span>{good.name}</span>}</a>;
}
export function PortalGoods({goods=[]}) {
  const groups = new Map();
  goods.forEach(g => {const key=[g.room_name,g.section_name].filter(Boolean).join(' · ') || 'Varer og arbeid';if(!groups.has(key))groups.set(key,[]);groups.get(key).push(g);});
  return <div className="bolig-choice-goods">{[...groups].map(([name,rows])=><section key={name}><h4>{name}</h4>{rows.map(g=><article key={g.key}>
    {g.image_url?.startsWith('https://')&&<ProductImage key={g.image_url} good={g}/>}
    <div><strong>{g.name}</strong><small>{g.quantity} {g.unit}{g.sku?` · Varenr. ${g.sku}`:''}</small></div>
  </article>)}</section>)}</div>;
}
export function PortalPrices({items=[]}) {
  if(!items.length)return null;
  return <dl className="bolig-choice-prices">{items.map(o=><div key={o.id}><dt>{o.name}{o.replace_key&&<small>Erstatter en vare i grunnpakken</small>}</dt><dd>{money(o.net_cents)}<small>{Number(o.deduction_cents)>0?`${money(o.price_cents)} − ${money(o.deduction_cents)} for inkludert grunnvare`:'Tillegg til grunnpakken'}</small></dd></div>)}</dl>;
}
export default function BoligPortalChoiceCards({data,draft,disabled,onChange}) {
 const base=data.offers.find(o=>o.id===data.combine_base_id);
 const baseline=new Set(base?.goods.map(g=>g.key)||[]);
 const baseImages=(base?.goods||[]).filter(g=>g.image_url?.startsWith('https://')).slice(0,4);
 return <>
 {base&&<section className="bolig-choice-base"><h3>Dette er inkludert</h3><p>{base.title} · Ingen ekstra kostnad</p>
  {baseImages.length>0&&<div className="bolig-choice-base-images" aria-label="Bilder fra grunnpakken">{baseImages.map(g=><ProductImage key={g.key+g.image_url} good={g} caption/>)}</div>}
  <details><summary>Se grunnpakken · {base.goods.length} varer og arbeidsposter</summary><PortalGoods goods={base.goods}/></details></section>}
 <div className="bolig-portal-offers">{data.offers.filter(o=>o.id!==base?.id).map(o=>{
  const selected=base?(draft.offer_ids||[]).includes(o.id):draft.offer_id===o.id;
  const goods=base?o.goods.filter(g=>!baseline.has(g.key)):o.goods;
  return <article key={o.id} className={selected?'selected':''}>
   <label className="bolig-portal-choice"><input type={base?'checkbox':'radio'} name="offer" checked={selected} disabled={disabled} onChange={()=>onChange(base?{offer_ids:selected?(draft.offer_ids||[]).filter(id=>id!==o.id):[...(draft.offer_ids||[]),o.id],menu_version:data.menu_version}:{offer_id:o.id,menu_version:data.menu_version})}/><span><strong>{o.title}</strong><small>{Number(o.total_cents)===0?'Inkludert uten pristillegg':`Pristillegg: ${money(o.total_cents)} inkl. mva.`}</small></span></label>
   <details><summary>Se varer · {goods.length}</summary><PortalGoods goods={goods}/><PortalPrices items={o.price_details}/></details>
  </article>;
 })}</div>
 {base&&<p>Du kan velge flere tilvalg. Varer og arbeid som inngår i flere valgte pakker, telles bare én gang. To alternativer som erstatter samme vare, kan ikke kombineres.</p>}
 </>;
}
