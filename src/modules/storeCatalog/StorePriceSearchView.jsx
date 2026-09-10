// Expo ProffDok – FASE 41B.2 / 41B.2A
// Selvstendig, read-only Prissøk mot aktivt ERP-vareregister.
// Oppretter eller endrer aldri tilbud, katalog eller prosjektdata.
// Sensitive nto-felter vises bare når backend faktisk returnerer dem.

import React, { useEffect, useMemo, useState } from "react";
import { Search, ExternalLink, X } from "lucide-react";
import { rpcWithStoredSession } from "../access/moduleAccessClient.js";

const moneyIncl = new Intl.NumberFormat("nb-NO", {
  style: "currency",
  currency: "NOK",
  maximumFractionDigits: 2,
});

function formatMoney(value) {
  if (value === null || value === undefined || value === "") return "–";
  const number = Number(value);
  return Number.isFinite(number) ? moneyIncl.format(number) : "–";
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? String(value)
    : new Intl.DateTimeFormat("nb-NO").format(date);
}

async function searchPrices(query, limit = 30) {
  const payload = await rpcWithStoredSession("search_internal_store_catalog_prices", {
    p_query: query,
    p_limit: limit,
  });
  return Array.isArray(payload) ? payload : [];
}

function PriceResult({ item }) {
  const hasNetPrice = item.purchase_net_ex_vat !== null && item.purchase_net_ex_vat !== undefined;

  return (
    <article className="priceSearchResult">
      <div className="priceSearchIdentity">
        <strong>{item.description || "Vare uten beskrivelse"}</strong>
        <span>{item.supplier_name || "Ukjent leverandør"} · varenr. {item.supplier_product_number || "–"}</span>
        <small>
          {item.gtin ? `GTIN/EAN ${item.gtin}` : "Uten GTIN/EAN"}
          {item.nobb_number ? ` · NOBB ${item.nobb_number}` : ""}
          {item.product_group ? ` · ${item.product_group}` : ""}
        </small>
        {item.price_date ? <small>Prisdatert {formatDate(item.price_date)}</small> : null}
      </div>

      <div className="priceSearchPrices">
        <div className="priceSearchPrimaryPrice">
          <span>Kundepris inkl. mva.</span>
          <strong>{formatMoney(item.customer_price_incl_vat)}</strong>
        </div>
        <div>
          <span>Kundepris eks. mva.</span>
          <strong>{formatMoney(item.customer_price_ex_vat)}</strong>
        </div>
        {hasNetPrice ? (
          <div className="priceSearchSensitivePrice">
            <span>Intern netto eks. mva.</span>
            <strong>{formatMoney(item.purchase_net_ex_vat)}</strong>
          </div>
        ) : null}
      </div>

      {item.product_url ? (
        <a className="priceSearchProductLink" href={item.product_url} target="_blank" rel="noreferrer">
          Produktinfo <ExternalLink size={15} />
        </a>
      ) : null}
    </article>
  );
}

export default function StorePriceSearchView({ onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState("");

  const cleanQuery = query.trim();
  const resultLabel = useMemo(() => {
    if (searching) return "Søker …";
    if (cleanQuery.length < 2) return "Skriv minst 2 tegn for å søke.";
    return `${results.length} treff`;
  }, [cleanQuery.length, results.length, searching]);

  useEffect(() => {
    if (cleanQuery.length < 2) {
      setResults([]);
      setMessage("");
      setSearching(false);
      return undefined;
    }

    let active = true;
    const timer = window.setTimeout(() => {
      setSearching(true);
      setMessage("");
      searchPrices(cleanQuery, 30)
        .then((items) => {
          if (active) setResults(items);
        })
        .catch((error) => {
          if (!active) return;
          setResults([]);
          setMessage(error?.message || "Kunne ikke søke i vareregisteret.");
        })
        .finally(() => {
          if (active) setSearching(false);
        });
    }, 220);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [cleanQuery]);

  return (
    <div className="priceSearchShell" role="dialog" aria-modal="true" aria-label="Prissøk">
      <div className="priceSearchTopbar">
        <div>
          <small>Expo ProffDok</small>
          <h1>Prissøk</h1>
          <p>Slå opp varer og gjeldende priser direkte i det aktive ERP-vareregisteret – uten å opprette et tilbud.</p>
        </div>
        <button type="button" className="priceSearchClose" onClick={onClose}>
          <X size={18} /> Tilbake til Expo ProffDok
        </button>
      </div>

      <main className="priceSearchContent">
        <section className="priceSearchCard">
          <label htmlFor="expo-price-search-input">Søk i vareregisteret</label>
          <div className="priceSearchInputWrap">
            <Search size={20} />
            <input
              id="expo-price-search-input"
              autoFocus
              autoComplete="off"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Søk varenavn, leverandør, varenummer eller GTIN/EAN"
            />
          </div>
          <div className="priceSearchMeta" aria-live="polite">
            <span>{resultLabel}</span>
            <small>Viser aktive varer fra siste aktiverte ERP-prisliste. Intern nto-pris vises bare for brukere med egen tilgang.</small>
          </div>
        </section>

        {message ? <div className="priceSearchMessage isError">{message}</div> : null}
        {!message && cleanQuery.length >= 2 && !searching && results.length === 0 ? (
          <div className="priceSearchMessage">Ingen varer matcher søket.</div>
        ) : null}

        {results.length ? (
          <section className="priceSearchResults" aria-label="Søkeresultater">
            {results.map((item) => <PriceResult key={item.id} item={item} />)}
          </section>
        ) : null}
      </main>

      <style>{`
        .priceSearchShell{position:fixed;inset:0;z-index:100000;background:#eef7f8;color:#10212b;overflow:auto;font-family:inherit}.priceSearchTopbar{position:sticky;top:0;z-index:2;display:flex;justify-content:space-between;align-items:center;gap:24px;padding:22px max(24px,calc((100vw - 1180px)/2));background:#fff;border-bottom:1px solid #d8e5e8;box-shadow:0 8px 24px rgba(15,23,42,.06)}.priceSearchTopbar small{font-weight:800;color:#159aa3}.priceSearchTopbar h1{margin:3px 0 4px;font-size:34px}.priceSearchTopbar p{margin:0;color:#60737b;max-width:760px}.priceSearchClose{display:inline-flex;align-items:center;gap:7px;min-height:46px;padding:0 16px;border:1px solid #bcd0d7;border-radius:13px;background:#fff;color:#10212b;font-weight:800;white-space:nowrap;cursor:pointer}.priceSearchContent{width:min(1180px,calc(100% - 32px));margin:28px auto 60px}.priceSearchCard{padding:20px;border:1px solid #cfe1e6;border-radius:18px;background:#fff;box-shadow:0 10px 30px rgba(15,23,42,.05)}.priceSearchCard label{display:block;font-weight:900;margin-bottom:8px}.priceSearchInputWrap{position:relative}.priceSearchInputWrap svg{position:absolute;left:15px;top:50%;transform:translateY(-50%);color:#60757e;pointer-events:none}.priceSearchInputWrap input{width:100%;min-height:56px;box-sizing:border-box;padding:0 16px 0 48px;border:1px solid #bcd0d7;border-radius:14px;background:#fff;font:inherit;font-size:18px;color:#10212b;outline:none}.priceSearchInputWrap input:focus{border-color:#18aeb8;box-shadow:0 0 0 4px rgba(24,174,184,.12)}.priceSearchMeta{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-top:10px;color:#60737b}.priceSearchMeta span{font-weight:800;color:#334b56}.priceSearchMeta small{max-width:650px;text-align:right}.priceSearchResults{display:grid;gap:10px;margin-top:16px}.priceSearchResult{display:grid;grid-template-columns:minmax(0,1fr) minmax(300px,auto) auto;gap:20px;align-items:center;padding:16px 18px;border:1px solid #d6e4e8;border-radius:15px;background:#fff}.priceSearchIdentity{display:grid;gap:3px;min-width:0}.priceSearchIdentity strong{font-size:17px}.priceSearchIdentity span,.priceSearchIdentity small{color:#60737b}.priceSearchPrices{display:grid;grid-template-columns:repeat(auto-fit,minmax(135px,1fr));gap:9px;min-width:300px}.priceSearchPrices>div{display:grid;gap:2px;padding:9px 10px;border-radius:10px;background:#f7fafb;white-space:nowrap}.priceSearchPrices span{font-size:11px;color:#647982;font-weight:750}.priceSearchPrices strong{font-size:14px}.priceSearchPrices .priceSearchPrimaryPrice{background:#e8f9fa}.priceSearchPrices .priceSearchPrimaryPrice strong{font-size:17px;color:#087b82}.priceSearchPrices .priceSearchSensitivePrice{background:#fff8e8;border:1px solid #f5d69a}.priceSearchProductLink{display:inline-flex;align-items:center;justify-content:center;gap:5px;color:#087b82;font-weight:800;text-decoration:none;white-space:nowrap}.priceSearchMessage{margin-top:16px;padding:15px 18px;border:1px solid #d6e4e8;border-radius:13px;background:#fff;color:#60737b;font-weight:700}.priceSearchMessage.isError{border-color:#fecaca;background:#fff7f7;color:#a33232}
        @media(max-width:900px){.priceSearchTopbar{align-items:flex-start;padding:18px 16px}.priceSearchTopbar h1{font-size:28px}.priceSearchResult{grid-template-columns:1fr}.priceSearchPrices{grid-template-columns:repeat(auto-fit,minmax(130px,1fr));min-width:0}.priceSearchProductLink{justify-self:start}.priceSearchContent{width:min(100% - 24px,1180px);margin-top:18px}.priceSearchMeta small{text-align:left}}
        @media(max-width:620px){.priceSearchTopbar{position:static;flex-direction:column;gap:14px}.priceSearchClose{width:100%;justify-content:center}.priceSearchCard{padding:14px}.priceSearchInputWrap input{font-size:16px;min-height:52px}.priceSearchMeta{align-items:flex-start;flex-direction:column}.priceSearchResult{padding:14px}.priceSearchPrices{grid-template-columns:1fr}.priceSearchPrices>div{white-space:normal}.priceSearchShell{overscroll-behavior:contain}}
      `}</style>
    </div>
  );
}
