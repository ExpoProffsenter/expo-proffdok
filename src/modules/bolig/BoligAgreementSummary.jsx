import React from "react";
import { OfferTextAt } from "./BoligOfferText.jsx";
import {PortalGoods,PortalPrices} from "./BoligPortalChoiceCards.jsx";
import {shopGoodsTotal} from "./boligShopCore.js";
import { agreementMoney as money, goodsDiff } from "./boligCommerceCore.js";

const amount = g => g ? `${g.quantity} ${g.unit} · ${g.name}${g.sku ? ` · varenr. ${g.sku}` : ""}` : "Utgår";
export default function BoligAgreementSummary({ document }) {
  const s = document.snapshot;
  if(s.source==='resident')return <section className="bolig-agreement-summary" aria-label="Bekreftet bestilling"><h3>Bekreftet grunnpakke og tilvalg</h3><p>{s.reason}</p><PortalGoods goods={s.goods}/><PortalPrices items={s.price_details}/><div className="bolig-commerce-price"><span>Pristillegg inkl. mva.</span><strong>{money(s.total_cents)}</strong><small>Grunnpakken er inkludert i hovedleveransen.</small></div>{s.requires_supplier_followup&&<p>Endrede varer følges opp av prosjektleder.</p>}</section>;
  if(s.source==='shop')return <section className="bolig-agreement-summary" aria-label="Butikktillegg til aksept"><h3>{s.reason}</h3><p>Dette kommer i tillegg til grunnpakken og tidligere avtaler.</p>
    <OfferTextAt blocks={s.text_blocks} position={0}/>
    <ul className="bolig-agreement-goods">{s.shop_lines.map((g,i)=><React.Fragment key={g.key||i}><li>
      {g.image_url&&<img className="bolig-shop-thumb" src={g.image_url} alt={g.name} loading="lazy" referrerPolicy="no-referrer"/>}
      <div><strong>{g.name}</strong><small>{g.quantity} {g.unit}{g.sku?` · varenr. ${g.sku}`:''}{g.room_name?` · ${g.room_name}`:''}</small>
      <p>Vare: {money(g.price_cents)} per {g.unit} · {money(shopGoodsTotal(g))}<br/>Montering: {money(g.installation_cents)} for varelinjen</p></div>
    </li><OfferTextAt blocks={s.text_blocks} position={i+1} inList/></React.Fragment>)}</ul><div className="bolig-commerce-price"><span>Dette tillegget inkl. mva.</span><strong>{money(s.delta_cents)}</strong></div>
    <details><summary>Grunnlag som beholdes · {(s.base_goods||[]).length} varelinjer</summary><Goods goods={s.base_goods||[]}/></details>
    </section>;
  const rows = document.kind === "change" ? goodsDiff(s.before_goods, s.goods) : [];
  return <section className="bolig-agreement-summary" aria-label="Avtalegrunnlag">
    <div className="bolig-commerce-price">
      <span>{document.kind === "change" ? "Pristillegg / fratrekk" : "Tilvalg og tilpasninger"}</span>
      <strong>{money(document.kind === "change" ? s.delta_cents : s.total_cents)}</strong>
      <small>Inkl. mva. · Grunnpakken er inkludert i hovedleveransen.</small>
    </div>
    <p className="bolig-commerce-reason">{s.reason}</p>
    {document.kind === "change" ? <>
      <p>Endring av bestilling <strong>{s.order_number}</strong>. Se hva som endres før du svarer.</p>
      {rows.length ? <div className="bolig-change-rows">{rows.map(row => <article key={row.key}>
        <strong>{row.after?.room_name || row.before?.room_name || "Felles for boligen"}</strong>
        <div><span>Før</span><p>{amount(row.before)}</p></div>
        <div><span>Etter</span><p>{amount(row.after)}</p></div>
      </article>)}</div> : <p>Varene beholdes. Bare prisen endres.</p>}
      <details open={s.text_blocks?.length ? true : undefined}><summary>Vis hele leveransen etter endringen · {s.goods.length} varelinjer</summary><Goods goods={s.goods} blocks={s.text_blocks}/></details>
    </> : <details open><summary>Varer og valgte tilvalg · {s.goods.length} varelinjer</summary><Goods goods={s.goods} blocks={s.text_blocks}/></details>}
  </section>;
}
function Goods({ goods, blocks = [] }) {
  return <><OfferTextAt blocks={blocks} position={0}/><ul className="bolig-agreement-goods">{goods.map((g,i) => <React.Fragment key={g.key}><li>
    <div><strong>{g.name}</strong><small>{g.room_name || "Felles for boligen"}{g.sku ? ` · varenr. ${g.sku}` : ""}</small></div>
    <span>{g.quantity} {g.unit}</span>
  </li><OfferTextAt blocks={blocks} position={i+1} inList/></React.Fragment>)}</ul></>;
}
