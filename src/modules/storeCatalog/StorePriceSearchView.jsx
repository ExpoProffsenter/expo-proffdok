// Expo ProffDok – FASE 41B.2 / 41B.2A / 41B.3 / 41B.3C
// Read-only Prissøk mot aktivt ERP-vareregister.
// FASE 41B.3 viser Prissøk som en ordinær arbeidsflate inne i Expo ProffDok.
// FASE 41B.3C bruker en midlertidig React-arbeidsliste som forsvinner ved
// sidebytte/refresh. Valgte varer ligger over søket og kan foldes sammen.

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink, Plus, Search, Trash2 } from "lucide-react";
import { rpcWithStoredSession } from "../access/moduleAccessClient.js";

const moneyIncl = new Intl.NumberFormat("nb-NO", {
  style: "currency",
  currency: "NOK",
  maximumFractionDigits: 2,
});

const percent = new Intl.NumberFormat("nb-NO", {
  maximumFractionDigits: 2,
});

function formatMoney(value) {
  if (value === null || value === undefined || value === "") return "–";
  const number = Number(value);
  return Number.isFinite(number) ? moneyIncl.format(number) : "–";
}

function formatPercent(value) {
  if (value === null || value === undefined || value === "") return "–";
  const number = Number(value);
  return Number.isFinite(number) ? `${percent.format(number)} %` : "–";
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

function PriceResult({ item, selected, onSelect }) {
  const hasNetPrice = item.purchase_net_ex_vat !== null && item.purchase_net_ex_vat !== undefined;

  const selectFromCard = (event) => {
    if (selected) return;
    if (event.target instanceof Element && event.target.closest("a,button")) return;
    onSelect(item);
  };

  const handleKeyDown = (event) => {
    if (selected || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault();
    onSelect(item);
  };

  return (
    <article
      className={`priceSearchResult${selected ? " isSelected" : ""}`}
      role="button"
      tabIndex={0}
      onClick={selectFromCard}
      onKeyDown={handleKeyDown}
      aria-label={`${selected ? "Valgt" : "Legg til"}: ${item.description || "vare"}`}
    >
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

      <div className="priceSearchResultActions">
        {item.product_url ? (
          <a className="priceSearchProductLink" href={item.product_url} target="_blank" rel="noreferrer">
            Produktinfo <ExternalLink size={15} />
          </a>
        ) : null}
        <button
          type="button"
          className={selected ? "secondary" : ""}
          disabled={selected}
          onClick={() => onSelect(item)}
        >
          <Plus size={16} /> {selected ? "Lagt til" : "Legg til"}
        </button>
      </div>
    </article>
  );
}

function SelectedProduct({ item, onRemove }) {
  const hasNetPrice = item.purchase_net_ex_vat !== null && item.purchase_net_ex_vat !== undefined;
  const hasDiscount = item.purchase_discount_percent !== null && item.purchase_discount_percent !== undefined;
  const hasMargin = item.gross_margin_percent !== null && item.gross_margin_percent !== undefined;

  return (
    <article className="priceSearchSelectedProduct">
      {item.image_url ? (
        <div className="priceSearchSelectedImage">
          <img src={item.image_url} alt={item.description || "Produktbilde"} loading="lazy" />
        </div>
      ) : null}

      <div className="priceSearchSelectedDetails">
        <div className="priceSearchSelectedHeading">
          <div>
            <strong>{item.description || "Vare uten beskrivelse"}</strong>
            <span>{item.supplier_name || "Ukjent leverandør"}</span>
          </div>
          <button type="button" className="secondary priceSearchRemove" onClick={() => onRemove(item.id)}>
            <Trash2 size={16} /> Slett
          </button>
        </div>

        <div className="priceSearchSelectedFacts">
          <div><span>Varenummer</span><strong>{item.supplier_product_number || "–"}</strong></div>
          <div><span>GTIN/EAN</span><strong>{item.gtin || "–"}</strong></div>
          <div><span>NOBB</span><strong>{item.nobb_number || "–"}</strong></div>
          <div><span>Varegruppe</span><strong>{item.product_group || "–"}</strong></div>
          <div><span>Prisdatert</span><strong>{item.price_date ? formatDate(item.price_date) : "–"}</strong></div>
        </div>

        <div className="priceSearchSelectedPrices">
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
          {hasNetPrice && hasDiscount ? (
            <div className="priceSearchSensitivePrice">
              <span>Innkjøpsrabatt</span>
              <strong>{formatPercent(item.purchase_discount_percent)}</strong>
            </div>
          ) : null}
          {hasNetPrice && hasMargin ? (
            <div className="priceSearchSensitivePrice">
              <span>Bruttomargin</span>
              <strong>{formatPercent(item.gross_margin_percent)}</strong>
            </div>
          ) : null}
        </div>

        {item.product_url ? (
          <a className="priceSearchProductLink" href={item.product_url} target="_blank" rel="noreferrer">
            Åpne produktinformasjon <ExternalLink size={15} />
          </a>
        ) : null}
      </div>
    </article>
  );
}

export default function StorePriceSearchView() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedExpanded, setSelectedExpanded] = useState(true);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState("");
  const searchInputRef = useRef(null);

  const cleanQuery = query.trim();
  const selectedIds = useMemo(
    () => new Set(selectedProducts.map((item) => String(item.id))),
    [selectedProducts]
  );
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

  const addSelectedProduct = (item) => {
    if (!item?.id || selectedIds.has(String(item.id))) return;
    setSelectedProducts((current) => [...current, item]);
    setQuery("");
    setResults([]);
    setMessage("");
    window.requestAnimationFrame(() => searchInputRef.current?.focus?.());
  };

  const removeSelectedProduct = (itemId) => {
    setSelectedProducts((current) => current.filter((item) => String(item.id) !== String(itemId)));
  };

  const clearSelectedProducts = () => {
    setSelectedProducts([]);
    setSelectedExpanded(true);
    window.requestAnimationFrame(() => searchInputRef.current?.focus?.());
  };

  return (
    <div className="priceSearchInlineView" aria-label="Prissøk">
      <section className="priceSearchIntro">
        <small>Expo ProffDok</small>
        <h2>Prissøk</h2>
        <p>Søk etter varer og legg dem i en midlertidig arbeidsliste mens du sammenligner produkter og priser.</p>
      </section>

      {selectedProducts.length ? (
        <section className="priceSearchSelected" aria-label="Valgte varer">
          <div className="priceSearchSelectedHeader">
            <div>
              <small>Midlertidig arbeidsliste</small>
              <h3>Valgte varer ({selectedProducts.length})</h3>
              <p>Listen forsvinner når du forlater Prissøk eller laster siden på nytt.</p>
            </div>
            <div className="priceSearchSelectedHeaderActions">
              <button
                type="button"
                className="secondary"
                onClick={() => setSelectedExpanded((current) => !current)}
                aria-expanded={selectedExpanded}
              >
                {selectedExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                {selectedExpanded ? "Skjul valgte varer" : "Vis valgte varer"}
              </button>
              <button type="button" className="secondary" onClick={clearSelectedProducts}>
                <Trash2 size={16} /> Tøm liste
              </button>
            </div>
          </div>
          {selectedExpanded ? (
            <div className="priceSearchSelectedList">
              {selectedProducts.map((item) => (
                <SelectedProduct key={item.id} item={item} onRemove={removeSelectedProduct} />
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      <section className={`priceSearchCard${selectedProducts.length ? " hasSelectedProducts" : ""}`}>
        <label htmlFor="expo-price-search-input">Søk i vareregisteret</label>
        <div className="priceSearchInputWrap">
          <Search size={20} />
          <input
            ref={searchInputRef}
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
          <small>Valgte varer lagres ikke. Intern nto-pris vises bare for brukere med egen tilgang.</small>
        </div>
      </section>

      {message ? <div className="priceSearchMessage isError">{message}</div> : null}
      {!message && cleanQuery.length >= 2 && !searching && results.length === 0 ? (
        <div className="priceSearchMessage">Ingen varer matcher søket.</div>
      ) : null}

      {results.length ? (
        <section className="priceSearchResults" aria-label="Søkeresultater">
          {results.map((item) => (
            <PriceResult
              key={item.id}
              item={item}
              selected={selectedIds.has(String(item.id))}
              onSelect={addSelectedProduct}
            />
          ))}
        </section>
      ) : null}

      <style>{`
        main.expoPriceSearchActive > :not(#expo-price-search-inline){display:none!important}
        .priceSearchInlineView{width:100%;color:#10212b;font-family:inherit}
        .priceSearchIntro{margin-bottom:18px}
        .priceSearchIntro small,.priceSearchSelectedHeader small{font-weight:800;color:#159aa3}
        .priceSearchIntro h2{margin:4px 0 6px;font-size:34px}
        .priceSearchIntro p,.priceSearchSelectedHeader p{margin:0;color:#60737b;max-width:780px}
        .priceSearchCard{padding:20px;border:1px solid #cfe1e6;border-radius:18px;background:#fff;box-shadow:0 10px 30px rgba(15,23,42,.05)}
        .priceSearchCard.hasSelectedProducts{margin-top:16px}
        .priceSearchCard label{display:block;font-weight:900;margin-bottom:8px}
        .priceSearchInputWrap{position:relative}
        .priceSearchInputWrap svg{position:absolute;left:15px;top:50%;transform:translateY(-50%);color:#60757e;pointer-events:none}
        .priceSearchInputWrap input{width:100%;min-height:56px;box-sizing:border-box;padding:0 16px 0 48px;border:1px solid #bcd0d7;border-radius:14px;background:#fff;font:inherit;font-size:18px;color:#10212b;outline:none}
        .priceSearchInputWrap input:focus{border-color:#18aeb8;box-shadow:0 0 0 4px rgba(24,174,184,.12)}
        .priceSearchMeta{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-top:10px;color:#60737b}
        .priceSearchMeta span{font-weight:800;color:#334b56}
        .priceSearchMeta small{max-width:650px;text-align:right}
        .priceSearchSelected{padding:18px;border:1px solid #bcdde1;border-radius:18px;background:#f9ffff;box-shadow:0 10px 28px rgba(15,23,42,.04)}
        .priceSearchSelectedHeader{display:flex;align-items:flex-start;justify-content:space-between;gap:18px}
        .priceSearchSelectedHeader h3{margin:3px 0 5px;font-size:21px}
        .priceSearchSelectedHeaderActions{display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:flex-end}
        .priceSearchSelectedHeader button,.priceSearchResultActions button,.priceSearchRemove{display:inline-flex;align-items:center;justify-content:center;gap:6px;white-space:nowrap}
        .priceSearchSelectedList{display:grid;gap:12px;margin-top:15px}
        .priceSearchSelectedProduct{display:grid;grid-template-columns:auto minmax(0,1fr);gap:16px;padding:16px;border:1px solid #d6e4e8;border-radius:15px;background:#fff}
        .priceSearchSelectedImage{width:96px;height:96px;display:grid;place-items:center;border:1px solid #e0e9ec;border-radius:12px;overflow:hidden;background:#fff}
        .priceSearchSelectedImage img{max-width:100%;max-height:100%;object-fit:contain}
        .priceSearchSelectedDetails{display:grid;gap:12px;min-width:0}
        .priceSearchSelectedHeading{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}
        .priceSearchSelectedHeading>div{display:grid;gap:3px;min-width:0}
        .priceSearchSelectedHeading strong{font-size:17px}
        .priceSearchSelectedHeading span{color:#60737b}
        .priceSearchSelectedFacts,.priceSearchSelectedPrices{display:flex;gap:8px;flex-wrap:wrap}
        .priceSearchSelectedFacts>div,.priceSearchSelectedPrices>div{display:grid;gap:2px;padding:8px 10px;border-radius:10px;background:#f7fafb;min-width:108px}
        .priceSearchSelectedFacts span,.priceSearchSelectedPrices span{font-size:11px;color:#647982;font-weight:750}
        .priceSearchSelectedFacts strong,.priceSearchSelectedPrices strong{font-size:14px}
        .priceSearchSelectedPrices .priceSearchPrimaryPrice{background:#e8f9fa}
        .priceSearchSelectedPrices .priceSearchPrimaryPrice strong{color:#087b82;font-size:16px}
        .priceSearchSelectedPrices .priceSearchSensitivePrice{background:#fff8e8;border:1px solid #f5d69a}
        .priceSearchResults{display:grid;gap:10px;margin-top:16px;padding:0;background:transparent;border:0;box-shadow:none}
        .priceSearchResult{display:grid;grid-template-columns:minmax(0,1fr) minmax(300px,auto) auto;gap:20px;align-items:center;padding:16px 18px;border:1px solid #d6e4e8;border-radius:15px;background:#fff;cursor:pointer}
        .priceSearchResult:hover{border-color:#9fd1d6;box-shadow:0 6px 18px rgba(15,23,42,.05)}
        .priceSearchResult.isSelected{opacity:.65;cursor:default}
        .priceSearchIdentity{display:grid;gap:3px;min-width:0}
        .priceSearchIdentity strong{font-size:17px}
        .priceSearchIdentity span,.priceSearchIdentity small{color:#60737b}
        .priceSearchPrices{display:grid;grid-template-columns:repeat(auto-fit,minmax(135px,1fr));gap:9px;min-width:300px}
        .priceSearchPrices>div{display:grid;gap:2px;padding:9px 10px;border-radius:10px;background:#f7fafb;white-space:nowrap}
        .priceSearchPrices span{font-size:11px;color:#647982;font-weight:750}
        .priceSearchPrices strong{font-size:14px}
        .priceSearchPrices .priceSearchPrimaryPrice{background:#e8f9fa}
        .priceSearchPrices .priceSearchPrimaryPrice strong{font-size:17px;color:#087b82}
        .priceSearchPrices .priceSearchSensitivePrice{background:#fff8e8;border:1px solid #f5d69a}
        .priceSearchResultActions{display:flex;align-items:center;gap:8px;justify-content:flex-end;flex-wrap:wrap}
        .priceSearchProductLink{display:inline-flex;align-items:center;gap:5px;color:#087b82;font-weight:800;text-decoration:none;white-space:nowrap;width:max-content}
        .priceSearchMessage{margin-top:16px;padding:15px 18px;border:1px solid #d6e4e8;border-radius:13px;background:#fff;color:#60737b;font-weight:700}
        .priceSearchMessage.isError{border-color:#fecaca;background:#fff7f7;color:#a33232}
        @media(max-width:900px){
          .priceSearchIntro h2{font-size:28px}
          .priceSearchResult{grid-template-columns:1fr}
          .priceSearchPrices{grid-template-columns:repeat(auto-fit,minmax(130px,1fr));min-width:0}
          .priceSearchResultActions{justify-content:flex-start}
          .priceSearchMeta small{text-align:left}
        }
        @media(max-width:620px){
          .priceSearchIntro{margin-bottom:14px}
          .priceSearchCard,.priceSearchSelected{padding:14px}
          .priceSearchInputWrap input{font-size:16px;min-height:52px}
          .priceSearchMeta,.priceSearchSelectedHeader,.priceSearchSelectedHeading{align-items:stretch;flex-direction:column}
          .priceSearchSelectedHeaderActions{justify-content:stretch}
          .priceSearchSelectedHeaderActions button{width:100%}
          .priceSearchSelectedProduct{grid-template-columns:1fr;padding:14px}
          .priceSearchSelectedImage{width:100%;height:160px}
          .priceSearchRemove{width:100%}
          .priceSearchResult{padding:14px}
          .priceSearchPrices{grid-template-columns:1fr}
          .priceSearchPrices>div{white-space:normal}
          .priceSearchResultActions{align-items:stretch;flex-direction:column}
          .priceSearchResultActions button,.priceSearchProductLink{width:100%;box-sizing:border-box;justify-content:center}
        }
      `}</style>
    </div>
  );
}
