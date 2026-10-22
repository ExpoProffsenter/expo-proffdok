import React from "react";
import { agreementMoney as money, goodsDiff } from "./boligCommerceCore.js";

const amount = g => g ? `${g.quantity} ${g.unit} · ${g.name}${g.sku ? ` · varenr. ${g.sku}` : ""}` : "Utgår";
export default function BoligAgreementSummary({ document }) {
  const s = document.snapshot;
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
      <details><summary>Vis hele leveransen etter endringen · {s.goods.length} varelinjer</summary><Goods goods={s.goods}/></details>
    </> : <details open><summary>Varer og valgte tilvalg · {s.goods.length} varelinjer</summary><Goods goods={s.goods}/></details>}
  </section>;
}
function Goods({ goods }) {
  return <ul className="bolig-agreement-goods">{goods.map(g => <li key={g.key}>
    <div><strong>{g.name}</strong><small>{g.room_name || "Felles for boligen"}{g.sku ? ` · varenr. ${g.sku}` : ""}</small></div>
    <span>{g.quantity} {g.unit}</span>
  </li>)}</ul>;
}
