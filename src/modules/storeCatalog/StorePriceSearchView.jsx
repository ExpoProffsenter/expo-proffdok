// Expo ProffDok – FASE 41B.2 / 41B.2A / 41B.3 / 41B.3C
// Read-only Prissøk mot aktivt ERP-vareregister.
// FASE 41B.3 viser Prissøk som en ordinær arbeidsflate inne i Expo ProffDok.
// FASE 41B.3C bruker en midlertidig arbeidsliste i sessionStorage slik at vanlig
// mobil-dvale/refresh tåles. Kun vare-ID/oppslagsnøkkel lagres; priser hentes på
// nytt gjennom backend. Arbeidslisten kan også skrives ut uten å lagre historikk.

import React, { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Camera, ChevronDown, ChevronUp, ExternalLink, Plus, Printer, Search, Trash2 } from "lucide-react";
import { getStoredSupabaseSession, rpcWithStoredSession } from "../access/moduleAccessClient.js";
import { WORK_PROFILE_EVENT, getMyWorkProfileState, readCachedWorkProfileState } from "../access/workProfileClient.js";
import {
  MAX_PICKLIST_ITEMS, deleteSavedPicklist, normalizePickQuantity,
  picklistStorageKey, readSavedPicklist, savePicklist, toPicklistReference,
} from "./mobilePicklistStorage.mjs";

const PriceSearchBarcodeScanner = lazy(() => import("./PriceSearchBarcodeScanner.jsx"));
const WORKLIST_SESSION_KEY = "expo-proffdok:price-search:worklist:v1";
const ORDER_SESSION_KEY = "expo-proffdok:price-search:order:v1";
const MAX_STORED_WORKLIST_ITEMS = MAX_PICKLIST_ITEMS;
const PRICE_SEARCH_PAGE_SIZE = 30;

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

function formatPrintTimestamp() {
  return new Intl.DateTimeFormat("nb-NO", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date());
}

async function searchPrices(query, limit = 30) {
  const payload = await rpcWithStoredSession("search_internal_store_catalog_prices", {
    p_query: query,
    p_limit: limit,
  });
  return Array.isArray(payload) ? payload : [];
}

async function searchPricePage(query, offset = 0, limit = PRICE_SEARCH_PAGE_SIZE) {
  const payload = await rpcWithStoredSession("search_internal_store_catalog_prices_page", {
    p_query: query,
    p_limit: limit,
    p_offset: offset,
  });
  const rows = Array.isArray(payload) ? payload : [];
  const totalCount = rows.length ? Number(rows[0]?.total_count || rows.length) : 0;
  const items = rows.map((row) => {
    const item = { ...row };
    delete item.total_count;
    return item;
  });
  return { items, totalCount };
}

function toStoredReference(item) {
  return toPicklistReference(item);
}

function readStoredReferences() {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(WORKLIST_SESSION_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => item && item.id && (item.supplier_product_number || item.gtin))
      .slice(0, MAX_STORED_WORKLIST_ITEMS)
      .map((item) => ({
        id: String(item.id),
        supplier_product_number: String(item.supplier_product_number || ""),
        gtin: String(item.gtin || ""),
        quantity: normalizePickQuantity(item.quantity),
      }));
  } catch {
    return [];
  }
}

function readSessionOrderNumber() {
  try {
    return String(window.sessionStorage.getItem(ORDER_SESSION_KEY) || "").slice(0, 64);
  } catch {
    return "";
  }
}

function persistSessionOrderNumber(value) {
  try {
    if (value) window.sessionStorage.setItem(ORDER_SESSION_KEY, value);
    else window.sessionStorage.removeItem(ORDER_SESSION_KEY);
  } catch {
    // Valgte varer og manuelt ordrenummer kan fortsatt brukes uten sessionStorage.
  }
}

function currentPicklistIdentity() {
  return {
    userId: getStoredSupabaseSession().userId,
    companyId: readCachedWorkProfileState().active_company_id,
  };
}

function persistStoredReferences(items) {
  if (typeof window === "undefined") return;
  try {
    const refs = items.slice(0, MAX_STORED_WORKLIST_ITEMS).map(toStoredReference);
    if (!refs.length) {
      window.sessionStorage.removeItem(WORKLIST_SESSION_KEY);
      return;
    }
    window.sessionStorage.setItem(WORKLIST_SESSION_KEY, JSON.stringify(refs));
  } catch {
    // sessionStorage kan være utilgjengelig i enkelte nettlesermoduser. Prissøk skal fortsatt virke.
  }
}

async function restoreStoredProducts(refs) {
  const restored = [];
  let missingCount = 0;
  for (const ref of refs) {
    const lookup = ref.supplier_product_number || ref.gtin;
    if (!lookup) continue;
    try {
      const items = await searchPrices(lookup, 10);
      let exact = items.find((item) => String(item.id) === String(ref.id));
      if (!exact && ref.gtin && ref.gtin !== lookup) {
        const byGtin = await searchPrices(ref.gtin, 30);
        exact = byGtin.find((item) => String(item.id) === String(ref.id));
      }
      if (exact) restored.push({ ...exact, pickQuantity: normalizePickQuantity(ref.quantity) });
      else missingCount += 1;
    } catch (error) {
      // Nettfeil må ikke overskrive en lagret plukkliste med et delvis resultat.
      throw new Error(error?.message || "Kunne ikke hente varene i plukklisten.");
    }
  }
  return { items: restored, missingCount };
}

function PriceResult({ item, selected, disabled = false, onSelect }) {
  const hasNetPrice = item.purchase_net_ex_vat !== null && item.purchase_net_ex_vat !== undefined;

  const selectFromCard = (event) => {
    if (selected || disabled) return;
    if (event.target instanceof Element && event.target.closest("a,button")) return;
    onSelect(item);
  };

  const handleKeyDown = (event) => {
    if (selected || disabled || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault();
    onSelect(item);
  };

  return (
    <article
      className={`priceSearchResult${selected ? " isSelected" : ""}`}
      role="button"
      tabIndex={0}
      aria-disabled={disabled || selected}
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
          disabled={selected || disabled}
          onClick={() => onSelect(item)}
        >
          <Plus size={16} /> {selected ? "Lagt til" : "Legg til"}
        </button>
      </div>
    </article>
  );
}

function SelectedProduct({ item, onRemove, onQuantityChange, printMode = false, includeInternal = true, picklistMode = false, readOnly = false }) {
  const hasNetPrice = item.purchase_net_ex_vat !== null && item.purchase_net_ex_vat !== undefined;
  const hasDiscount = item.purchase_discount_percent !== null && item.purchase_discount_percent !== undefined;
  const hasMargin = item.gross_margin_percent !== null && item.gross_margin_percent !== undefined;
  const showInternal = hasNetPrice && includeInternal;

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
          {!printMode ? (
            <button type="button" className="secondary priceSearchRemove" onClick={() => onRemove(item.id)} disabled={readOnly}>
              <Trash2 size={16} /> Slett
            </button>
          ) : null}
        </div>

        <div className="priceSearchSelectedFacts">
          <div><span>Varenummer</span><strong>{item.supplier_product_number || "–"}</strong></div>
          <div><span>GTIN/EAN</span><strong>{item.gtin || "–"}</strong></div>
          <div><span>NOBB</span><strong>{item.nobb_number || "–"}</strong></div>
          <div><span>Varegruppe</span><strong>{item.product_group || "–"}</strong></div>
          <div><span>Prisdatert</span><strong>{item.price_date ? formatDate(item.price_date) : "–"}</strong></div>
        </div>

        {picklistMode ? (
          printMode ? (
            <p className="priceSearchPickQuantityPrint"><strong>Antall:</strong> {normalizePickQuantity(item.pickQuantity)}</p>
          ) : (
            <label className="priceSearchPickQuantity">
              <span>Antall til Cordel</span>
              <input
                type="number" inputMode="decimal" min="0.001" max="99999" step="any"
                value={item.pickQuantity ?? "1"}
                disabled={readOnly}
                onChange={(event) => onQuantityChange(item.id, event.target.value)}
                onBlur={() => onQuantityChange(item.id, normalizePickQuantity(item.pickQuantity))}
                aria-label={`Antall for ${item.description || item.supplier_product_number || "vare"}`}
              />
            </label>
          )
        ) : null}

        {(!picklistMode || !printMode) ? <div className="priceSearchSelectedPrices">
          <div className="priceSearchPrimaryPrice">
            <span>Kundepris inkl. mva.</span>
            <strong>{formatMoney(item.customer_price_incl_vat)}</strong>
          </div>
          <div>
            <span>Kundepris eks. mva.</span>
            <strong>{formatMoney(item.customer_price_ex_vat)}</strong>
          </div>
          {showInternal ? (
            <div className="priceSearchSensitivePrice">
              <span>Intern netto eks. mva.</span>
              <strong>{formatMoney(item.purchase_net_ex_vat)}</strong>
            </div>
          ) : null}
          {showInternal && hasDiscount ? (
            <div className="priceSearchSensitivePrice">
              <span>Innkjøpsrabatt</span>
              <strong>{formatPercent(item.purchase_discount_percent)}</strong>
            </div>
          ) : null}
          {showInternal && hasMargin ? (
            <div className="priceSearchSensitivePrice">
              <span>Bruttomargin</span>
              <strong>{formatPercent(item.gross_margin_percent)}</strong>
            </div>
          ) : null}
        </div> : null}

        {!printMode && item.product_url ? (
          <a className="priceSearchProductLink" href={item.product_url} target="_blank" rel="noreferrer">
            Åpne produktinformasjon <ExternalLink size={15} />
          </a>
        ) : null}
      </div>
    </article>
  );
}

function PrintDocument({ items, includeInternal, picklistMode = false, orderNumber = "" }) {
  return (
    <div className="priceSearchPrintPortal" aria-hidden="true">
      <header className="priceSearchPrintHeader">
        <small>Expo ProffDok</small>
        <h1>{picklistMode ? "Plukkliste til Cordel" : "Prissøk – valgte varer"}</h1>
        <p>{items.length} {items.length === 1 ? "vare" : "varer"} · skrevet ut {formatPrintTimestamp()}</p>
        {picklistMode ? <p><strong>Ordrenummer:</strong> {orderNumber || "Ikke oppgitt"}</p> : null}
        {!picklistMode && includeInternal ? <p><strong>Interne priser er inkludert.</strong></p> : null}
      </header>
      <main className="priceSearchPrintList">
        {items.map((item) => (
          <SelectedProduct
            key={item.id}
            item={item}
            onRemove={() => {}}
            printMode
            includeInternal={includeInternal}
            picklistMode={picklistMode}
          />
        ))}
      </main>
    </div>
  );
}

export default function StorePriceSearchView({ onClose }) {
  const [query, setQuery] = useState("");
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 700px)").matches
  );
  const [scanning, setScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState("");
  const [results, setResults] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedExpanded, setSelectedExpanded] = useState(true);
  const [includeInternalPrint, setIncludeInternalPrint] = useState(false);
  const [restoringSelected, setRestoringSelected] = useState(true);
  const [picklistIdentity, setPicklistIdentity] = useState(currentPicklistIdentity);
  const [profileResolved, setProfileResolved] = useState(() => Boolean(currentPicklistIdentity().companyId));
  const [savedPicklistActive, setSavedPicklistActive] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [picklistMessage, setPicklistMessage] = useState("");
  const [restoreIncomplete, setRestoreIncomplete] = useState(false);
  const [restoreFailed, setRestoreFailed] = useState(false);
  const [restoreRevision, setRestoreRevision] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [searching, setSearching] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [message, setMessage] = useState("");
  const searchInputRef = useRef(null);
  const restoredSelectionRef = useRef(false);
  const hydratedScopeRef = useRef("");
  const activeQueryRef = useRef("");
  const activeCompanyRef = useRef(picklistIdentity.companyId);

  const picklistScopeKey = picklistStorageKey(picklistIdentity);
  const hydrationScope = isMobile ? `mobile:${picklistScopeKey || "unavailable"}` : "desktop";
  const cleanQuery = query.trim();
  const selectedIds = useMemo(
    () => new Set(selectedProducts.map((item) => String(item.id))),
    [selectedProducts]
  );
  const canPrintInternal = useMemo(
    () => selectedProducts.some((item) => item.purchase_net_ex_vat !== null && item.purchase_net_ex_vat !== undefined),
    [selectedProducts]
  );
  const resultLabel = useMemo(() => {
    if (searching) return "Søker …";
    if (cleanQuery.length < 2) return "Skriv minst 2 tegn for å søke.";
    if (results.length < totalResults) return `Viser ${results.length} av ${totalResults} treff`;
    return `${totalResults} treff`;
  }, [cleanQuery.length, results.length, searching, totalResults]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 700px)");
    const updateMobile = () => {
      setScanning(false);
      setIsMobile(media.matches);
    };
    media.addEventListener("change", updateMobile);
    return () => media.removeEventListener("change", updateMobile);
  }, []);

  useEffect(() => {
    let active = true;
    const syncProfile = () => {
      if (!active) return;
      const nextIdentity = currentPicklistIdentity();
      if (activeCompanyRef.current && activeCompanyRef.current !== nextIdentity.companyId) {
        persistStoredReferences([]);
        persistSessionOrderNumber("");
        restoredSelectionRef.current = false;
        hydratedScopeRef.current = "";
        setSelectedProducts([]);
        setSavedPicklistActive(false);
        setOrderNumber("");
        setScanning(false);
      }
      activeCompanyRef.current = nextIdentity.companyId;
      setPicklistIdentity(nextIdentity);
      setProfileResolved(true);
    };
    window.addEventListener(WORK_PROFILE_EVENT, syncProfile);
    if (!readCachedWorkProfileState().active_company_id) {
      void getMyWorkProfileState().then(syncProfile).catch(() => {
        if (active) setProfileResolved(true);
      });
    }
    return () => {
      active = false;
      window.removeEventListener(WORK_PROFILE_EVENT, syncProfile);
    };
  }, []);

  const stopScanning = useCallback(() => setScanning(false), []);
  const handleScan = useCallback((code) => {
    setQuery(code);
    setScanning(false);
    window.requestAnimationFrame(() => searchInputRef.current?.focus?.());
  }, []);
  const handleScanError = useCallback((text) => {
    setScanning(false);
    setScanMessage(text);
  }, []);

  useEffect(() => {
    if (isMobile && !profileResolved) return undefined;
    let cancelled = false;
    restoredSelectionRef.current = false;
    hydratedScopeRef.current = "";
    setRestoringSelected(true);
    setPicklistMessage("");
    setRestoreFailed(false);
    setRestoreIncomplete(false);
    const saved = isMobile && picklistScopeKey ? readSavedPicklist(picklistIdentity) : null;
    const refs = saved?.items?.length ? saved.items : readStoredReferences();
    const nextOrderNumber = saved ? saved.orderNumber : readSessionOrderNumber();
    setSavedPicklistActive(Boolean(saved?.items?.length));
    setOrderNumber(nextOrderNumber);
    if (!refs.length) {
      setSelectedProducts([]);
      restoredSelectionRef.current = true;
      hydratedScopeRef.current = hydrationScope;
      setRestoringSelected(false);
      return () => {
        cancelled = true;
      };
    }

    setRestoringSelected(true);
    void restoreStoredProducts(refs).then(({ items, missingCount }) => {
      if (cancelled) return;
      restoredSelectionRef.current = true;
      hydratedScopeRef.current = hydrationScope;
      setSelectedProducts(items);
      if (missingCount && saved) {
        setRestoreIncomplete(true);
        setPicklistMessage(`${missingCount} vare(r) er ikke tilgjengelige i vareregisteret nå. Den lagrede originalen er beholdt; prøv igjen senere.`);
      } else {
        persistStoredReferences(items);
      }
      setRestoringSelected(false);
    }).catch(() => {
      if (cancelled) return;
      setSelectedProducts([]);
      setRestoringSelected(false);
      setRestoreFailed(true);
      setPicklistMessage("Kunne ikke hente alle varene akkurat nå. Listen er beholdt; prøv igjen når forbindelsen virker.");
    });

    return () => {
      cancelled = true;
    };
  }, [hydrationScope, isMobile, profileResolved, restoreRevision]);

  useEffect(() => {
    if (!restoredSelectionRef.current || hydratedScopeRef.current !== hydrationScope) return;
    persistStoredReferences(selectedProducts);
    persistSessionOrderNumber(orderNumber);
    if (isMobile && savedPicklistActive && !restoreIncomplete && picklistScopeKey && selectedProducts.length) {
      try {
        savePicklist(picklistIdentity, selectedProducts, orderNumber);
      } catch {
        setPicklistMessage("Kunne ikke lagre endringene på denne mobilen. Sjekk lagringsinnstillingene.");
      }
    }
  }, [selectedProducts, orderNumber, savedPicklistActive, restoreIncomplete, hydrationScope, isMobile, picklistScopeKey]);

  useEffect(() => {
    if (!canPrintInternal && includeInternalPrint) setIncludeInternalPrint(false);
  }, [canPrintInternal, includeInternalPrint]);

  useEffect(() => {
    activeQueryRef.current = cleanQuery;
    if (cleanQuery.length < 2) {
      setResults([]);
      setTotalResults(0);
      setMessage("");
      setSearching(false);
      setLoadingMore(false);
      return undefined;
    }

    let active = true;
    setSearching(true);
    setLoadingMore(false);
    setResults([]);
    setTotalResults(0);
    setMessage("");
    const timer = window.setTimeout(() => {
      searchPricePage(cleanQuery)
        .then(({ items, totalCount }) => {
          if (!active) return;
          setResults(items);
          setTotalResults(totalCount);
        })
        .catch((error) => {
          if (!active) return;
          setResults([]);
          setTotalResults(0);
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

  const loadMoreResults = () => {
    if (loadingMore || searching || results.length >= totalResults) return;
    const requestedQuery = cleanQuery;
    const offset = results.length;
    setLoadingMore(true);
    setMessage("");
    void searchPricePage(requestedQuery, offset)
      .then(({ items, totalCount }) => {
        if (activeQueryRef.current !== requestedQuery) return;
        setResults((current) => {
          const knownIds = new Set(current.map((item) => String(item.id)));
          return [...current, ...items.filter((item) => !knownIds.has(String(item.id)))];
        });
        setTotalResults(totalCount);
      })
      .catch((error) => {
        if (activeQueryRef.current !== requestedQuery) return;
        setMessage(error?.message || "Kunne ikke hente flere varer.");
      })
      .finally(() => {
        if (activeQueryRef.current === requestedQuery) setLoadingMore(false);
      });
  };

  const addSelectedProduct = (item) => {
    if (!item?.id || selectedIds.has(String(item.id)) || restoringSelected || restoreFailed || restoreIncomplete) return;
    if (selectedProducts.length >= MAX_PICKLIST_ITEMS) {
      setPicklistMessage(`Plukklisten kan inneholde opptil ${MAX_PICKLIST_ITEMS} varer. Skriv ut eller slett listen før du starter på en ny.`);
      return;
    }
    setSelectedProducts((current) => [...current, { ...item, pickQuantity: "1" }]);
    setConfirmDelete(false);
    setPicklistMessage("");
    setQuery("");
    setResults([]);
    setTotalResults(0);
    setMessage("");
    window.requestAnimationFrame(() => searchInputRef.current?.focus?.());
  };

  const removeSelectedProduct = (itemId) => {
    if (isMobile && savedPicklistActive && selectedProducts.length === 1) {
      try {
        deleteSavedPicklist(picklistIdentity);
        setSavedPicklistActive(false);
        setOrderNumber("");
      } catch {
        setPicklistMessage("Kunne ikke slette plukklisten fra denne mobilen.");
        return;
      }
    }
    setSelectedProducts((current) => current.filter((item) => String(item.id) !== String(itemId)));
    setConfirmDelete(false);
  };

  const updateSelectedQuantity = (itemId, quantity) => {
    setSelectedProducts((current) => current.map((item) =>
      String(item.id) === String(itemId) ? { ...item, pickQuantity: quantity } : item
    ));
  };

  const saveMobilePicklist = () => {
    try {
      savePicklist(picklistIdentity, selectedProducts, orderNumber);
      setSavedPicklistActive(true);
      setPicklistMessage("Plukklisten er lagret på denne mobilen. Endringer lagres automatisk.");
    } catch (error) {
      setPicklistMessage(error?.message || "Kunne ikke lagre plukklisten på denne mobilen.");
    }
  };

  const clearSelectedProducts = () => {
    if (isMobile && savedPicklistActive) {
      try {
        deleteSavedPicklist(picklistIdentity);
      } catch {
        setPicklistMessage("Kunne ikke slette plukklisten fra denne mobilen.");
        return;
      }
    }
    setSavedPicklistActive(false);
    setSelectedProducts([]);
    persistStoredReferences([]);
    setOrderNumber("");
    persistSessionOrderNumber("");
    setSelectedExpanded(true);
    setIncludeInternalPrint(false);
    setConfirmDelete(false);
    setPicklistMessage(isMobile ? "Plukklisten er slettet fra denne mobilen." : "");
    window.requestAnimationFrame(() => searchInputRef.current?.focus?.());
  };

  const printSelectedProducts = () => {
    if (!selectedProducts.length) return;
    window.print();
  };

  const printPortal = typeof document !== "undefined" && selectedProducts.length
    ? createPortal(
        <PrintDocument
          items={selectedProducts}
          includeInternal={!isMobile && canPrintInternal && includeInternalPrint}
          picklistMode={isMobile}
          orderNumber={orderNumber.trim()}
        />,
        document.body
      )
    : null;

  return (
    <div className="priceSearchInlineView" aria-label="Prissøk">
      <section className="priceSearchIntro">
        {isMobile ? (
          <button type="button" className="secondary priceSearchHome" onClick={onClose}>
            ← Startside
          </button>
        ) : null}
        <small>Expo ProffDok</small>
        <h2>Prissøk</h2>
        <p>{isMobile
          ? "Skann eller søk varer, angi antall og lagre en midlertidig plukkliste til senere registrering i Cordel."
          : "Søk etter varer og legg dem i en midlertidig arbeidsliste mens du sammenligner produkter og priser."}</p>
      </section>

      {restoringSelected && !selectedProducts.length ? (
        <div className="priceSearchMessage">Gjenoppretter midlertidig arbeidsliste …</div>
      ) : null}

      {selectedProducts.length ? (
        <section className="priceSearchSelected" aria-label="Valgte varer">
          <div className="priceSearchSelectedHeader">
            <div>
              <small>Midlertidig arbeidsliste</small>
              <h3>{isMobile ? "Plukkliste" : "Valgte varer"} ({selectedProducts.length})</h3>
              <p>{isMobile
                ? savedPicklistActive
                  ? "Lagret på denne mobilen for innlogget bruker og aktivt firma. Ingen priser lagres; endringer lagres automatisk til du sletter listen."
                  : "Arbeidslisten tåler refresh/dvale i denne fanen. Trykk Lagre plukkliste for å beholde den på mobilen etter at fanen lukkes."
                : "Listen lagres bare i denne nettleserfanen og tåler vanlig refresh/dvale. Prisene hentes på nytt etter reload."}</p>
            </div>
            <div className="priceSearchSelectedHeaderActions">
              {!isMobile && canPrintInternal ? (
                <label className="priceSearchPrintOption">
                  <input
                    type="checkbox"
                    checked={includeInternalPrint}
                    onChange={(event) => setIncludeInternalPrint(event.target.checked)}
                  />
                  Inkluder interne priser
                </label>
              ) : null}
              {isMobile && !savedPicklistActive ? (
                <button type="button" onClick={saveMobilePicklist} disabled={!picklistScopeKey}>
                  Lagre plukkliste
                </button>
              ) : null}
              <button type="button" className="secondary" onClick={printSelectedProducts} disabled={restoreIncomplete}>
                <Printer size={16} /> {isMobile ? "Skriv ut plukkliste" : "Skriv ut"}
              </button>
              <button
                type="button"
                className="secondary"
                onClick={() => setSelectedExpanded((current) => !current)}
                aria-expanded={selectedExpanded}
              >
                {selectedExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                {selectedExpanded ? "Skjul valgte varer" : "Vis valgte varer"}
              </button>
              <button
                type="button" className="secondary"
                onClick={() => isMobile && !confirmDelete ? setConfirmDelete(true) : clearSelectedProducts()}
              >
                <Trash2 size={16} /> {isMobile ? confirmDelete ? "Bekreft sletting" : "Slett plukkliste" : "Tøm liste"}
              </button>
            </div>
          </div>
          {isMobile ? (
            <label className="priceSearchOrderNumber">
              <span>Ordrenummer i Cordel (valgfritt)</span>
              <input
                value={orderNumber} maxLength={64} autoComplete="off" disabled={restoreIncomplete}
                onChange={(event) => setOrderNumber(event.target.value)}
                placeholder="Skriv inn ordrenummer manuelt"
              />
            </label>
          ) : null}
          {isMobile && !picklistScopeKey ? (
            <div className="priceSearchMessage isError">Velg aktivt firma og logg inn for å lagre plukklisten på mobilen.</div>
          ) : null}
          {picklistMessage ? <div className="priceSearchMessage" role="status">
            {picklistMessage}
            {restoreIncomplete ? <button type="button" className="secondary" onClick={() => setRestoreRevision((current) => current + 1)}>Prøv igjen</button> : null}
          </div> : null}
          <div className={`priceSearchSelectedList${selectedExpanded ? "" : " isCollapsed"}`}>
            {selectedProducts.map((item) => (
              <SelectedProduct
                key={item.id} item={item} onRemove={removeSelectedProduct}
                onQuantityChange={updateSelectedQuantity} picklistMode={isMobile}
                readOnly={restoreIncomplete}
              />
            ))}
          </div>
        </section>
      ) : null}

      {!selectedProducts.length && picklistMessage ? (
        <div className="priceSearchMessage" role="status">
          {picklistMessage}
          {restoreFailed || restoreIncomplete ? <button type="button" className="secondary" onClick={() => setRestoreRevision((current) => current + 1)}>Prøv igjen</button> : null}
          {savedPicklistActive && !restoreFailed ? (
            <button type="button" className="secondary" onClick={() => isMobile && !confirmDelete ? setConfirmDelete(true) : clearSelectedProducts()}>
              {confirmDelete ? "Bekreft sletting" : "Slett lagret plukkliste"}
            </button>
          ) : null}
        </div>
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
        {isMobile ? (
          <>
            <button
              type="button"
              className="secondary priceSearchScanButton"
              onClick={() => { setScanMessage(""); setScanning(true); }}
              disabled={scanning}
            >
              <Camera size={18} /> Skann strekkode
            </button>
            {scanning ? (
              <Suspense fallback={<div className="priceSearchMessage">Åpner kamera …</div>}>
                <PriceSearchBarcodeScanner
                  onScan={handleScan}
                  onCancel={stopScanning}
                  onError={handleScanError}
                />
              </Suspense>
            ) : null}
            {scanMessage ? <div className="priceSearchMessage isError" role="alert">{scanMessage}</div> : null}
          </>
        ) : null}
        <div className="priceSearchMeta" aria-live="polite">
          <span>{resultLabel}</span>
          <small>{isMobile
            ? "Plukklisten lagres på denne mobilen når du velger Lagre plukkliste. Priser hentes alltid på nytt fra serveren."
            : "Arbeidslisten lagres kun midlertidig i denne fanen. Intern nto-pris vises bare for brukere med egen tilgang."}</small>
        </div>
      </section>

      {message ? <div className="priceSearchMessage isError">{message}</div> : null}
      {!message && cleanQuery.length >= 2 && !searching && results.length === 0 ? (
        <div className="priceSearchMessage">Ingen varer matcher søket.</div>
      ) : null}

      {results.length ? (
        <>
          <section className="priceSearchResults" aria-label="Søkeresultater">
            {results.map((item) => (
              <PriceResult
                key={item.id}
                item={item}
                selected={selectedIds.has(String(item.id))}
                disabled={restoringSelected || restoreFailed || restoreIncomplete}
                onSelect={addSelectedProduct}
              />
            ))}
          </section>
          {results.length < totalResults ? (
            <div className="priceSearchLoadMore">
              <button type="button" className="secondary" onClick={loadMoreResults} disabled={loadingMore}>
                {loadingMore
                  ? "Henter flere …"
                  : `Vis ${Math.min(PRICE_SEARCH_PAGE_SIZE, totalResults - results.length)} flere`}
              </button>
            </div>
          ) : null}
        </>
      ) : null}

      {printPortal}

      <style>{`
        main.expoPriceSearchActive > :not(#expo-price-search-inline){display:none!important}
        .priceSearchInlineView{width:100%;color:#10212b;font-family:inherit}
        .priceSearchPrintPortal{display:none}
        .priceSearchIntro{margin-bottom:18px}
        .priceSearchHome{display:none}
        .priceSearchScanButton{display:none}
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
        .priceSearchPrintOption{display:inline-flex;align-items:center;gap:7px;min-height:42px;padding:0 10px;border:1px solid #f0cd83;border-radius:11px;background:#fff8e8;color:#7b5314;font-size:13px;font-weight:800;white-space:nowrap}
        .priceSearchPrintOption input{width:17px;height:17px;margin:0}
        .priceSearchSelectedList{display:grid;gap:12px;margin-top:15px}
        .priceSearchSelectedList.isCollapsed{display:none}
        .priceSearchOrderNumber,.priceSearchPickQuantity{display:grid;gap:6px;font-weight:800;color:#334b56}
        .priceSearchOrderNumber{margin-top:16px;max-width:420px}
        .priceSearchOrderNumber input,.priceSearchPickQuantity input{min-height:44px;box-sizing:border-box;padding:8px 12px;border:1px solid #bcd0d7;border-radius:10px;background:#fff;color:#10212b;font:inherit}
        .priceSearchPickQuantity{width:160px}
        .priceSearchPickQuantityPrint{margin:0}
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
        .priceSearchLoadMore{display:flex;justify-content:center;margin-top:16px}
        .priceSearchLoadMore button{min-width:180px}
        @media(max-width:900px){
          .priceSearchIntro h2{font-size:28px}
          .priceSearchResult{grid-template-columns:1fr}
          .priceSearchPrices{grid-template-columns:repeat(auto-fit,minmax(130px,1fr));min-width:0}
          .priceSearchResultActions{justify-content:flex-start}
          .priceSearchMeta small{text-align:left}
        }
        @media(max-width:700px){
          .priceSearchHome{display:inline-flex;align-items:center;min-height:44px;margin-bottom:12px}
          .priceSearchScanButton{display:inline-flex;align-items:center;justify-content:center;gap:8px;width:100%;min-height:48px;margin-top:12px}
          .priceSearchScanner{margin-top:12px;padding:12px;border:1px solid #cfe1e6;border-radius:14px;background:#f7fafb}
          .priceSearchScanner video{display:block;width:100%;max-height:360px;aspect-ratio:4/3;object-fit:contain;border-radius:10px;background:#10212b}
          .priceSearchScanner p{margin:10px 0;color:#334b56}
          .priceSearchCameraChoice,.priceSearchZoomChoice{display:grid;gap:6px;margin:10px 0;color:#10212b;font-weight:700}
          .priceSearchCameraChoice select{width:100%;min-height:44px;padding:8px;border:1px solid #aac8d2;border-radius:9px;background:#fff;color:#10212b}
          .priceSearchZoomChoice input{width:100%;min-height:40px;accent-color:#087c86}
          .priceSearchScanner button{width:100%;min-height:44px}
        }
        @media(max-width:620px){
          .priceSearchIntro{margin-bottom:14px}
          .priceSearchCard,.priceSearchSelected{padding:14px}
          .priceSearchInputWrap input{font-size:16px;min-height:52px}
          .priceSearchMeta,.priceSearchSelectedHeader,.priceSearchSelectedHeading{align-items:stretch;flex-direction:column}
          .priceSearchSelectedHeaderActions{justify-content:stretch}
          .priceSearchPrintOption,.priceSearchSelectedHeaderActions button{width:100%;box-sizing:border-box;justify-content:center}
          .priceSearchSelectedProduct{grid-template-columns:1fr;padding:14px}
          .priceSearchPickQuantity,.priceSearchPickQuantity input,.priceSearchOrderNumber{width:100%;max-width:none}
          .priceSearchSelectedImage{width:100%;height:160px}
          .priceSearchRemove{width:100%}
          .priceSearchResult{padding:14px}
          .priceSearchPrices{grid-template-columns:1fr}
          .priceSearchPrices>div{white-space:normal}
          .priceSearchResultActions{align-items:stretch;flex-direction:column}
          .priceSearchResultActions button,.priceSearchProductLink{width:100%;box-sizing:border-box;justify-content:center}
          .priceSearchLoadMore button{width:100%}
        }
        @media print{
          @page{size:A4;margin:12mm}
          #root{display:none!important}
          .priceSearchPrintPortal{display:block!important;font-family:Arial,sans-serif;color:#111;background:#fff;font-size:10pt}
          .priceSearchPrintHeader{margin-bottom:14px;padding-bottom:10px;border-bottom:2px solid #111}
          .priceSearchPrintHeader small{font-weight:700}
          .priceSearchPrintHeader h1{margin:3px 0 5px;font-size:20pt}
          .priceSearchPrintHeader p{margin:2px 0}
          .priceSearchPrintList{display:grid;gap:8px}
          .priceSearchPrintPortal .priceSearchSelectedProduct{break-inside:avoid;page-break-inside:avoid;padding:10px;border:1px solid #bbb;border-radius:6px;grid-template-columns:auto minmax(0,1fr);box-shadow:none}
          .priceSearchPrintPortal .priceSearchSelectedImage{width:70px;height:70px}
          .priceSearchPrintPortal .priceSearchSelectedDetails{gap:7px}
          .priceSearchPrintPortal .priceSearchSelectedFacts>div,.priceSearchPrintPortal .priceSearchSelectedPrices>div{padding:5px 7px;min-width:90px;border:1px solid #ddd;background:#fff}
          .priceSearchPrintPortal .priceSearchSelectedFacts span,.priceSearchPrintPortal .priceSearchSelectedPrices span{font-size:8pt}
          .priceSearchPrintPortal .priceSearchSelectedFacts strong,.priceSearchPrintPortal .priceSearchSelectedPrices strong{font-size:9pt}
          .priceSearchPrintPortal .priceSearchSelectedPrices .priceSearchPrimaryPrice,.priceSearchPrintPortal .priceSearchSelectedPrices .priceSearchSensitivePrice{background:#fff;border:1px solid #bbb}
        }
      `}</style>
    </div>
  );
}
