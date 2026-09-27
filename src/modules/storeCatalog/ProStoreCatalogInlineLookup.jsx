import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { createDefaultSalesSupabaseClient } from "../sales/services/salesSupabase.js";
import { canAccessProStoreCatalog, searchProStoreCatalog } from "./proStoreCatalogClient.js";

const money = new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK", maximumFractionDigits: 2 });
function price(value) { const n = Number(value); return Number.isFinite(n) ? money.format(n) : "–"; }

export default function ProStoreCatalogInlineLookup({
  onUse,
  placeholder = "Søk varenavn, varenummer eller GTIN/EAN",
}) {
  const [client] = useState(() => createDefaultSalesSupabaseClient());
  const [allowed, setAllowed] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    canAccessProStoreCatalog(client).then((value) => active && setAllowed(value === true)).catch(() => active && setAllowed(false));
    return () => { active = false; };
  }, [client]);

  useEffect(() => {
    if (!allowed) return undefined;
    const clean = query.trim();
    if (clean.length < 2) { setResults([]); setMessage(""); return undefined; }
    let active = true;
    const timer = window.setTimeout(() => {
      setBusy(true); setMessage("");
      searchProStoreCatalog(client, clean, 12)
        .then((items) => active && setResults(Array.isArray(items) ? items : []))
        .catch((error) => { if (active) { setResults([]); setMessage(error?.message || "Kunne ikke søke i vareregisteret."); } })
        .finally(() => active && setBusy(false));
    }, 220);
    return () => { active = false; window.clearTimeout(timer); };
  }, [allowed, client, query]);

  if (!allowed) return null;
  return (
    <div className="pro-store-catalog-lookup">
      <div className="pro-store-catalog-head"><strong>Proff vareregister</strong><span>Kun leverandører firmaet har avtale med.</span></div>
      <label className="pro-store-catalog-search"><Search size={17}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={placeholder} autoComplete="off"/></label>
      {busy ? <small>Søker …</small> : null}
      {results.length ? <div className="pro-store-catalog-results">{results.map((item) => <button key={item.id} type="button" className="pro-store-catalog-result" onClick={() => { onUse?.(item); setQuery(""); setResults([]); }}><span><strong>{item.description || "Vare uten beskrivelse"}</strong><small>{item.supplier_name} · varenr. {item.supplier_product_number}</small></span><span className="pro-store-catalog-prices"><strong>{price(item.suggested_sale_price_ex_vat)} eks. mva.</strong>{item.my_net_price_ex_vat !== null && item.my_net_price_ex_vat !== undefined ? <small>Din nto pris {price(item.my_net_price_ex_vat)} eks. mva.</small> : null}</span></button>)}</div> : null}
      {!busy && query.trim().length >= 2 && !results.length && !message ? <small>Ingen treff.</small> : null}
      {message ? <small className="is-error">{message}</small> : null}
      <style>{`.pro-store-catalog-lookup{display:grid;gap:8px;padding:10px;border:1px solid #b9d7d8;border-radius:12px;background:#f7fbfb;margin:0 0 12px}.pro-store-catalog-head{display:flex;justify-content:space-between;gap:12px}.pro-store-catalog-head span,.pro-store-catalog-result small{font-size:12px;color:#60737b}.pro-store-catalog-search{position:relative}.pro-store-catalog-search svg{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#60757e}.pro-store-catalog-search input{width:100%;min-height:44px;box-sizing:border-box;padding:0 12px 0 38px;border:1px solid #bcd0d7;border-radius:11px;background:#fff;font:inherit}.pro-store-catalog-results{display:grid;gap:7px;max-height:330px;overflow:auto}.pro-store-catalog-result{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;text-align:left;align-items:center;padding:10px;border:1px solid #d6e4e8;border-radius:10px;background:#fff;color:inherit;cursor:pointer}.pro-store-catalog-result>span{display:grid;gap:2px}.pro-store-catalog-prices{text-align:right;white-space:nowrap}.pro-store-catalog-lookup .is-error{color:#a33232}@media(max-width:760px){.pro-store-catalog-head,.pro-store-catalog-result{grid-template-columns:1fr;display:grid}.pro-store-catalog-prices{text-align:left}}`}</style>
    </div>
  );
}
