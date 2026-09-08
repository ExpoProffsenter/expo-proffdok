// Expo ProffDok – FASE 39B.2C
// Katalogverktøyet gjør kun søk/leverandørvalg.
// Vare -> montering/opsjon håndteres nativt av grouped Butikktilbud-bygger.

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { createDefaultSalesSupabaseClient } from "../sales/services/salesSupabase.js";
import {
  canAccessInternalStoreCatalog,
  canManageInternalStoreCatalog,
  getStoreCatalogAlternatives,
  searchStoreCatalog,
} from "./storeCatalogClient.js";
import StoreCatalogPanel from "./StoreCatalogPanel.jsx";

const money = new Intl.NumberFormat("nb-NO", {
  style: "currency",
  currency: "NOK",
  maximumFractionDigits: 2,
});

function formatMoney(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? money.format(number) : "–";
}

function InlineCatalogResult({ item, onUse, onAlternatives }) {
  function chooseFromRow(event) {
    if (event.target instanceof Element && event.target.closest("button")) return;
    onUse(item);
  }

  return (
    <div
      className="store-inline-catalog-result"
      role="button"
      tabIndex={0}
      onClick={chooseFromRow}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onUse(item);
        }
      }}
    >
      <div className="store-inline-catalog-copy">
        <strong>{item.description || "Vare uten beskrivelse"}</strong>
        <span>{item.supplier_name} · varenr. {item.supplier_product_number}</span>
        <small>{item.gtin ? `GTIN ${item.gtin}` : "Uten GTIN"}</small>
      </div>
      <div className="store-inline-catalog-price">
        <strong>{formatMoney(item.customer_price_incl_vat)} inkl. mva.</strong>
        <small>Intern nto {formatMoney(item.purchase_net_ex_vat)} eks. mva.</small>
      </div>
      <div className="store-inline-catalog-actions">
        {item.gtin ? <button type="button" className="sales-secondary-button" onClick={(event) => { event.stopPropagation(); onAlternatives(item); }}>Leverandører</button> : null}
        <button type="button" className="sales-primary-button" onClick={(event) => { event.stopPropagation(); onUse(item); }}>Velg</button>
      </div>
    </div>
  );
}

export function StoreCatalogInlineLookup({ onUse, placeholder = "Søk vareregister: varenavn, varenummer eller GTIN/EAN" }) {
  const [client] = useState(() => createDefaultSalesSupabaseClient());
  const [access, setAccess] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState("");
  const [alternativeSource, setAlternativeSource] = useState(null);
  const [alternatives, setAlternatives] = useState([]);

  useEffect(() => {
    let active = true;
    canAccessInternalStoreCatalog(client)
      .then((allowed) => active && setAccess(Boolean(allowed)))
      .catch(() => active && setAccess(false));
    return () => { active = false; };
  }, [client]);

  useEffect(() => {
    if (!access) return undefined;
    const clean = query.trim();
    if (clean.length < 2) {
      setResults([]);
      setMessage("");
      return undefined;
    }

    let active = true;
    const timer = window.setTimeout(() => {
      setSearching(true);
      setMessage("");
      setAlternativeSource(null);
      setAlternatives([]);
      searchStoreCatalog(client, clean, 12)
        .then((items) => active && setResults(Array.isArray(items) ? items : []))
        .catch((error) => {
          if (!active) return;
          setResults([]);
          setMessage(error?.message || "Kunne ikke søke i vareregisteret.");
        })
        .finally(() => active && setSearching(false));
    }, 220);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [access, client, query]);

  async function showAlternatives(item) {
    setMessage("");
    setAlternativeSource(item);
    setAlternatives([]);
    try {
      const items = await getStoreCatalogAlternatives(client, item.id);
      setAlternatives(Array.isArray(items) ? items : []);
    } catch (error) {
      setAlternativeSource(null);
      setMessage(error?.message || "Kunne ikke hente leverandøralternativer.");
    }
  }

  function choose(item) {
    onUse?.(item);
    setQuery("");
    setResults([]);
    setAlternativeSource(null);
    setAlternatives([]);
    setMessage("");
  }

  if (!access) return null;
  const visible = alternativeSource ? alternatives : results;

  return (
    <div className="store-inline-catalog">
      <div className="store-inline-catalog-search">
        <Search size={17} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={placeholder} autoComplete="off" />
      </div>
      {searching ? <small className="store-inline-catalog-message">Søker …</small> : null}
      {alternativeSource ? <div className="store-inline-catalog-alternative-head"><strong>Velg leverandør for samme GTIN</strong><button type="button" onClick={() => { setAlternativeSource(null); setAlternatives([]); }}>Tilbake til treff</button></div> : null}
      {visible.length ? <div className="store-inline-catalog-results">{visible.map((item) => <InlineCatalogResult key={item.id} item={item} onUse={choose} onAlternatives={showAlternatives} />)}</div> : null}
      {!searching && query.trim().length >= 2 && !visible.length && !message ? <small className="store-inline-catalog-message">Ingen treff.</small> : null}
      {message ? <small className="store-inline-catalog-message is-error">{message}</small> : null}
      <style>{`
        .store-inline-catalog{display:grid;gap:8px;padding:10px;border:1px solid #cfe1e6;border-radius:12px;background:#f4fafb;margin:0 0 12px}.store-inline-catalog-search{position:relative}.store-inline-catalog-search svg{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#60757e;pointer-events:none}.store-inline-catalog-search input{width:100%;min-height:44px;box-sizing:border-box;padding:0 12px 0 38px;border:1px solid #bcd0d7;border-radius:11px;background:#fff;font:inherit;color:#10212b;outline:none}.store-inline-catalog-search input:focus{border-color:#18aeb8;box-shadow:0 0 0 3px rgba(24,174,184,.12)}
        .store-inline-catalog-results{display:grid;gap:7px;max-height:330px;overflow:auto}.store-inline-catalog-result{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:12px;align-items:center;padding:9px 10px;border:1px solid #d6e4e8;border-radius:10px;background:#fff;cursor:pointer}.store-inline-catalog-result:hover,.store-inline-catalog-result:focus{border-color:#18aeb8;background:#f4fcfd;outline:none}.store-inline-catalog-copy{display:grid;gap:2px;min-width:0}.store-inline-catalog-copy strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.store-inline-catalog-copy span,.store-inline-catalog-copy small,.store-inline-catalog-price small{color:#60737b;font-size:12px}.store-inline-catalog-price{display:grid;text-align:right;gap:2px;white-space:nowrap}.store-inline-catalog-actions{display:flex;gap:6px}.store-inline-catalog-actions button{width:auto;min-height:38px;padding:7px 10px}.store-inline-catalog-message{color:#60737b;font-weight:650}.store-inline-catalog-message.is-error{color:#a33232}.store-inline-catalog-alternative-head{display:flex;justify-content:space-between;align-items:center;gap:10px}.store-inline-catalog-alternative-head button{border:0;background:transparent;color:#087b82;font-weight:800;cursor:pointer}
        @media(max-width:760px){.store-inline-catalog-result{grid-template-columns:1fr}.store-inline-catalog-price{text-align:left}.store-inline-catalog-actions{justify-content:flex-start}}
      `}</style>
    </div>
  );
}

export function StoreCatalogAdminOnlyPanel({ onSelectItem }) {
  const [client] = useState(() => createDefaultSalesSupabaseClient());
  const [manage, setManage] = useState(false);

  useEffect(() => {
    let active = true;
    canManageInternalStoreCatalog(client)
      .then((allowed) => active && setManage(Boolean(allowed)))
      .catch(() => active && setManage(false));
    return () => { active = false; };
  }, [client]);

  if (!manage) return null;
  return <StoreCatalogPanel onSelectItem={onSelectItem} />;
}
