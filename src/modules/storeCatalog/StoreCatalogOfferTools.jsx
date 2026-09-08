// Expo ProffDok – FASE 39B.2
// Butikkbrukeren søker katalogen direkte i hver varelinje og vareopsjon.
// Prisadministrasjon nederst er kun synlig for systemadministrator.
// Produktkortet kan starte opsjon eller montering direkte uten å endre Sales-motoren.

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

function findStoreSection(title) {
  if (typeof document === "undefined") return null;
  return Array.from(
    document.querySelectorAll(".store-offer-builder-app .store-builder-section")
  ).find((section) => {
    const heading = section.querySelector(":scope > .store-section-head h2");
    return String(heading?.textContent || "").trim() === title;
  }) || null;
}

function productContextFromTarget(target) {
  if (!(target instanceof Element)) return null;
  const card = target.closest(".store-item-card");
  const section = card?.closest(".store-builder-section");
  const heading = section?.querySelector(":scope > .store-section-head h2");
  if (!(card instanceof HTMLElement) || String(heading?.textContent || "").trim() !== "Varer") {
    return null;
  }

  const cards = Array.from(
    section.querySelectorAll(":scope > .store-item-list > .store-item-card")
  );
  const index = cards.indexOf(card);
  if (index < 0) return null;

  const name = String(
    card.querySelector(".store-product-name input")?.value || `Vare ${index + 1}`
  ).trim() || `Vare ${index + 1}`;

  return { card, section, index, name };
}

function setControlledValue(element, value) {
  if (!(element instanceof HTMLInputElement) && !(element instanceof HTMLTextAreaElement) && !(element instanceof HTMLSelectElement)) {
    return false;
  }

  const prototype = element instanceof HTMLSelectElement
    ? HTMLSelectElement.prototype
    : element instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
  if (!setter) return false;

  setter.call(element, value);
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}

function afterStoreRender(callback) {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => callback());
  });
}

function addInstallationForProduct(eventTarget) {
  const context = productContextFromTarget(eventTarget);
  const section = findStoreSection("Montering");
  const addButton = section?.querySelector(":scope > .store-section-head button");
  if (!context || !(section instanceof HTMLElement) || !(addButton instanceof HTMLButtonElement)) {
    return;
  }

  const beforeCount = section.querySelectorAll(":scope > .store-item-list > .store-item-card").length;
  addButton.click();
  afterStoreRender(() => {
    const cards = Array.from(section.querySelectorAll(":scope > .store-item-list > .store-item-card"));
    const card = cards[beforeCount] || cards[cards.length - 1];
    if (!(card instanceof HTMLElement)) return;
    const description = card.querySelector(":scope > .sales-field input");
    if (description instanceof HTMLInputElement && !String(description.value || "").trim()) {
      setControlledValue(description, `Montering av ${context.name}`);
    }
    card.scrollIntoView({ behavior: "smooth", block: "center" });
    description?.focus?.();
  });
}

function addOptionForProduct(eventTarget, type = "addition") {
  const context = productContextFromTarget(eventTarget);
  const section = findStoreSection("Opsjoner");
  const addButton = section?.querySelector(":scope > .store-section-head button");
  if (!context || !(section instanceof HTMLElement) || !(addButton instanceof HTMLButtonElement)) {
    return;
  }

  const beforeCount = section.querySelectorAll(":scope > .store-item-list > .store-item-card").length;
  addButton.click();
  afterStoreRender(() => {
    const cards = Array.from(section.querySelectorAll(":scope > .store-item-list > .store-item-card"));
    const card = cards[beforeCount] || cards[cards.length - 1];
    if (!(card instanceof HTMLElement)) return;

    if (type === "alternative") {
      const typeSelect = card.querySelector(".store-option-top-grid select");
      if (typeSelect instanceof HTMLSelectElement) {
        setControlledValue(typeSelect, "alternative");
        afterStoreRender(() => {
          const selects = card.querySelectorAll(".store-option-top-grid select");
          const replacementSelect = selects[1];
          if (replacementSelect instanceof HTMLSelectElement) {
            const targetOption = replacementSelect.options[context.index + 1];
            if (targetOption?.value) setControlledValue(replacementSelect, targetOption.value);
          }
          card.scrollIntoView({ behavior: "smooth", block: "center" });
          card.querySelector(".store-inline-catalog-search input")?.focus?.();
        });
        return;
      }
    }

    const description = card.querySelector("textarea");
    if (description instanceof HTMLTextAreaElement && !String(description.value || "").trim()) {
      setControlledValue(description, `Tillegg / oppgradering til ${context.name}`);
    }
    card.scrollIntoView({ behavior: "smooth", block: "center" });
    card.querySelector(".store-inline-catalog-search input")?.focus?.();
  });
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
        {item.gtin ? (
          <button
            type="button"
            className="sales-secondary-button"
            onClick={(event) => {
              event.stopPropagation();
              onAlternatives(item);
            }}
          >
            Leverandører
          </button>
        ) : null}
        <button
          type="button"
          className="sales-primary-button"
          onClick={(event) => {
            event.stopPropagation();
            onUse(item);
          }}
        >
          Velg
        </button>
      </div>
    </div>
  );
}

export function StoreCatalogInlineLookup({
  onUse,
  placeholder = "Søk vareregister: varenavn, varenummer eller GTIN/EAN",
}) {
  const [client] = useState(() => createDefaultSalesSupabaseClient());
  const [access, setAccess] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState("");
  const [alternativeSource, setAlternativeSource] = useState(null);
  const [alternatives, setAlternatives] = useState([]);
  const [productActionOpen, setProductActionOpen] = useState(false);
  const isProductLookup = String(placeholder || "").startsWith("Søk vareregister:");

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
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          autoComplete="off"
        />
      </div>
      {isProductLookup ? (
        <div className="store-product-quick-actions">
          <button
            type="button"
            className="sales-secondary-button"
            onClick={() => setProductActionOpen((current) => !current)}
          >
            + Opsjon på denne varen
          </button>
          <button
            type="button"
            className="sales-secondary-button"
            onClick={(event) => addInstallationForProduct(event.currentTarget)}
          >
            + Montering på denne varen
          </button>
          {productActionOpen ? (
            <div className="store-product-option-picker">
              <span>Velg type opsjon:</span>
              <button
                type="button"
                onClick={(event) => {
                  addOptionForProduct(event.currentTarget, "addition");
                  setProductActionOpen(false);
                }}
              >
                Tillegg / oppgradering
              </button>
              <button
                type="button"
                onClick={(event) => {
                  addOptionForProduct(event.currentTarget, "alternative");
                  setProductActionOpen(false);
                }}
              >
                Alternativ som erstatter denne varen
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
      {searching ? <small className="store-inline-catalog-message">Søker …</small> : null}
      {alternativeSource ? (
        <div className="store-inline-catalog-alternative-head">
          <strong>Velg leverandør for samme GTIN</strong>
          <button type="button" onClick={() => { setAlternativeSource(null); setAlternatives([]); }}>
            Tilbake til treff
          </button>
        </div>
      ) : null}
      {visible.length ? (
        <div className="store-inline-catalog-results">
          {visible.map((item) => (
            <InlineCatalogResult
              key={item.id}
              item={item}
              onUse={choose}
              onAlternatives={showAlternatives}
            />
          ))}
        </div>
      ) : null}
      {!searching && query.trim().length >= 2 && !visible.length && !message ? (
        <small className="store-inline-catalog-message">Ingen treff.</small>
      ) : null}
      {message ? <small className="store-inline-catalog-message is-error">{message}</small> : null}
      <style>{`
        .store-inline-catalog{display:grid;gap:8px;padding:10px;border:1px solid #cfe1e6;border-radius:12px;background:#f4fafb;margin:0 0 12px}
        .store-inline-catalog-search{position:relative}.store-inline-catalog-search svg{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#60757e;pointer-events:none}.store-inline-catalog-search input{width:100%;min-height:44px;box-sizing:border-box;padding:0 12px 0 38px;border:1px solid #bcd0d7;border-radius:11px;background:#fff;font:inherit;color:#10212b;outline:none}.store-inline-catalog-search input:focus{border-color:#18aeb8;box-shadow:0 0 0 3px rgba(24,174,184,.12)}
        .store-offer-builder-app .store-item-card[data-store-product-active="1"]{border:2px solid #18aeb8!important;background:#f7fdfe!important;box-shadow:0 0 0 3px rgba(24,174,184,.10)}
        .store-product-quick-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.store-product-quick-actions>.sales-secondary-button{min-height:36px;padding:7px 10px;width:auto}.store-product-option-picker{display:flex;gap:7px;align-items:center;flex-wrap:wrap;width:100%;padding:8px 10px;border:1px solid #c9dde2;border-radius:10px;background:#fff}.store-product-option-picker span{font-size:12px;font-weight:800;color:#526b74}.store-product-option-picker button{border:1px solid #bcd0d7;border-radius:9px;background:#f7fbfc;padding:7px 9px;font-weight:750;cursor:pointer;color:#17323c}.store-product-option-picker button:hover{border-color:#18aeb8;background:#eefafb}
        .store-inline-catalog-results{display:grid;gap:7px;max-height:330px;overflow:auto}.store-inline-catalog-result{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:12px;align-items:center;padding:9px 10px;border:1px solid #d6e4e8;border-radius:10px;background:#fff;cursor:pointer;transition:border-color .12s ease,background .12s ease}.store-inline-catalog-result:hover,.store-inline-catalog-result:focus{border-color:#18aeb8;background:#f4fcfd;outline:none}.store-inline-catalog-copy{display:grid;gap:2px;min-width:0}.store-inline-catalog-copy strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.store-inline-catalog-copy span,.store-inline-catalog-copy small,.store-inline-catalog-price small{color:#60737b;font-size:12px}.store-inline-catalog-price{display:grid;text-align:right;gap:2px;white-space:nowrap}.store-inline-catalog-actions{display:flex;gap:6px}.store-inline-catalog-actions button{width:auto;min-height:38px;padding:7px 10px}.store-inline-catalog-message{color:#60737b;font-weight:650}.store-inline-catalog-message.is-error{color:#a33232}.store-inline-catalog-alternative-head{display:flex;justify-content:space-between;align-items:center;gap:10px}.store-inline-catalog-alternative-head button{border:0;background:transparent;color:#087b82;font-weight:800;cursor:pointer}
        @media(max-width:760px){.store-inline-catalog-result{grid-template-columns:1fr}.store-inline-catalog-price{text-align:left}.store-inline-catalog-actions{justify-content:flex-start}.store-inline-catalog-actions button{width:auto}.store-product-quick-actions>.sales-secondary-button{flex:1 1 220px}}
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
