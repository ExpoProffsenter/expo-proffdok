// Expo ProffDok – FASE 39B.2
// Tynn katalog-wrapper rundt eksisterende Butikktilbud-bygger.
// Katalogens nettopris blir aldri kopiert til offerForm eller kundens tilbudsversjon.
// Prisnøytrale tekstavsnitt holdes utenfor varebyggeren, men følger tilbudsversjonen.
// Ferdige varekort komprimeres kun i intern redigering; kunderekkefølge og data er urørt.
// Butikktilbud får i tillegg en egen server-autosave av kun aktuell salgssak.

import { useEffect, useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import SalesStoreOfferBuilder from "./SalesStoreOfferBuilder.jsx";
import {
  StoreCatalogAdminOnlyPanel,
  StoreCatalogInlineLookup,
} from "../../storeCatalog/StoreCatalogOfferTools.jsx";
import { persistStoreOfferDraft } from "../services/salesStoreOfferAutosave.js";
import { buildNobbItemUrl } from "../utils/salesStoreOfferPricing.js";

const PRODUCT_POST = { id: "butikk-varer", title: "Varer" };
const TEXT_BLOCK_LINE_TYPE = "store_text";
const TEXT_BLOCK_MARKER = "#expo-store-text-block";

function createId(prefix) {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isTextBlock(line = {}) {
  return line?.lineType === TEXT_BLOCK_LINE_TYPE;
}

function isProductLine(line = {}) {
  return (
    line?.mainPostId === PRODUCT_POST.id &&
    !line?.__storeOfferMeta &&
    !isTextBlock(line)
  );
}

function textBlockDescription(block = {}) {
  return [block.storeTextTitle, block.storeTextBody]
    .map((value) => String(value || "").trim())
    .filter(Boolean)
    .join("\n");
}

function createTextBlock() {
  return {
    id: createId("store-text"),
    mainPostId: PRODUCT_POST.id,
    mainPostTitle: PRODUCT_POST.title,
    lineType: TEXT_BLOCK_LINE_TYPE,
    description: "",
    storeTextTitle: "",
    storeTextBody: "",
    storeAfterLineId: "",
    amount: "0",
    quantity: "0",
    unit: "",
    nobbNumber: "",
    supplierProductNumber: "",
    internalProductNumber: "",
    storeUnitPriceInclVat: "",
    storeDiscountPercent: "",
    productUrl: TEXT_BLOCK_MARKER,
    storeAutoProductUrl: false,
    imageDataUrl: "",
    imageName: "",
    attachmentFile: null,
  };
}

function mergeTextBlocks(nextLines = [], textBlocks = []) {
  const products = nextLines.filter(isProductLine);
  const productIds = new Set(products.map((line) => String(line.id || "")));
  const blocksBeforeFirst = [];
  const blocksByProduct = new Map();

  textBlocks.forEach((block) => {
    const anchor = String(block.storeAfterLineId || "");
    if (!anchor || !productIds.has(anchor)) {
      blocksBeforeFirst.push(block);
      return;
    }
    if (!blocksByProduct.has(anchor)) blocksByProduct.set(anchor, []);
    blocksByProduct.get(anchor).push(block);
  });

  const productSection = [...blocksBeforeFirst];
  products.forEach((product) => {
    productSection.push(product);
    productSection.push(...(blocksByProduct.get(String(product.id || "")) || []));
  });

  const firstProductIndex = nextLines.findIndex(isProductLine);
  if (firstProductIndex < 0) {
    const metaIndex = nextLines.findIndex((line) => line?.__storeOfferMeta);
    const insertionIndex = metaIndex >= 0 ? metaIndex : nextLines.length;
    return [
      ...nextLines.slice(0, insertionIndex),
      ...productSection,
      ...nextLines.slice(insertionIndex),
    ];
  }

  const beforeProducts = nextLines
    .slice(0, firstProductIndex)
    .filter((line) => !isProductLine(line));
  const afterProducts = nextLines
    .slice(firstProductIndex)
    .filter((line) => !isProductLine(line));

  return [...beforeProducts, ...productSection, ...afterProducts];
}

function catalogFields(item = {}) {
  const supplierProductNumber = String(item.supplier_product_number || "").trim();
  const nobbNumber = String(item.nobb_number || "").trim();
  const productUrl = String(item.product_url || "").trim() || buildNobbItemUrl(nobbNumber);
  const inclVat = Number(item.customer_price_incl_vat || 0);
  const exVat = Number(item.customer_price_ex_vat || 0);

  return {
    description: String(item.description || "").trim(),
    nobbNumber,
    supplierProductNumber,
    internalProductNumber: supplierProductNumber,
    storeUnitPriceInclVat: Number.isFinite(inclVat) ? String(inclVat) : "",
    storeDiscountPercent: "",
    amount: Number.isFinite(exVat) ? String(exVat) : "",
    productUrl,
    storeAutoProductUrl: Boolean(nobbNumber && productUrl === buildNobbItemUrl(nobbNumber)),
    storeCatalogItemId: String(item.id || ""),
    storeCatalogGtin: String(item.gtin || ""),
  };
}

function catalogOptionFields(item = {}) {
  const fields = catalogFields(item);
  const { description, ...shared } = fields;
  return {
    ...shared,
    title: description,
  };
}

function createCatalogOfferLine(item = {}) {
  return {
    id: createId("line"),
    mainPostId: PRODUCT_POST.id,
    mainPostTitle: PRODUCT_POST.title,
    lineType: "work",
    ...catalogFields(item),
    quantity: "1",
    unit: "stk",
    imageDataUrl: "",
    imageName: "",
    attachmentFile: null,
  };
}

function compactAttachment(file) {
  if (!file) return null;
  return {
    id: file.id || "",
    name: file.name || "",
    path: file.path || "",
    url: file.url || "",
    size: Number(file.size || 0),
  };
}

function compactAutosaveRow(item = {}) {
  return {
    ...item,
    imageDataUrl: item.imageDataUrl ? `image:${String(item.imageDataUrl).length}` : "",
    attachmentFile: compactAttachment(item.attachmentFile),
  };
}

function createStoreAutosaveSignature(form = {}) {
  return JSON.stringify({
    title: form.title || "",
    intro: form.intro || "",
    reservations: form.reservations || "",
    included: form.included || "",
    excluded: form.excluded || "",
    customerSupplied: form.customerSupplied || "",
    terms: form.terms || "",
    paymentTerms: form.paymentTerms || "",
    validityDays: form.validityDays || "",
    lines: (Array.isArray(form.lines) ? form.lines : []).map(compactAutosaveRow),
    options: (Array.isArray(form.options) ? form.options : []).map(compactAutosaveRow),
  });
}

function findProductSection() {
  if (typeof document === "undefined") return null;
  return Array.from(
    document.querySelectorAll(".store-offer-builder-app .store-builder-section")
  ).find((section) => {
    const heading = section.querySelector(":scope > .store-section-head h2");
    return String(heading?.textContent || "").trim() === "Varer";
  }) || null;
}

function readCompactProductSummary(card) {
  const name = String(card.querySelector(".store-product-name input")?.value || "").trim();
  const price = String(card.querySelector(".store-line-total strong")?.textContent || "").trim();
  const priceText = price && price !== "0 kr" ? price : "";
  return [name || "Uten varenavn", priceText].filter(Boolean).join(" · ");
}

function StoreOfferProductEditingUx({ products = [] }) {
  const productIdentity = products.map((item) => String(item?.id || "")).join("|");
  const previousProductIdentityRef = useRef(productIdentity);

  useEffect(() => {
    const previousIds = previousProductIdentityRef.current.split("|").filter(Boolean);
    const currentIds = productIdentity.split("|").filter(Boolean);
    const previousSet = new Set(previousIds);
    const addedProductId = currentIds.find((id) => !previousSet.has(id)) || "";
    previousProductIdentityRef.current = productIdentity;

    const section = findProductSection();
    if (!section) return undefined;

    const list = section.querySelector(":scope > .store-item-list");
    const addButton = section.querySelector(":scope > .store-section-head button");
    if (!(list instanceof HTMLElement) || !(addButton instanceof HTMLButtonElement)) {
      return undefined;
    }

    const cards = Array.from(list.querySelectorAll(":scope > .store-item-card"));
    if (!cards.length) return undefined;

    const listeners = [];

    function syncSummary(card) {
      const heading = card.querySelector(":scope > .store-item-heading");
      if (!(heading instanceof HTMLElement)) return;
      let summary = heading.querySelector(":scope > .store-collapsed-product-summary");
      if (!(summary instanceof HTMLElement)) {
        summary = document.createElement("span");
        summary.className = "store-collapsed-product-summary";
        const deleteButton = heading.querySelector(":scope > .store-icon-button");
        heading.insertBefore(summary, deleteButton || null);
      }
      summary.textContent = readCompactProductSummary(card);
    }

    function setActiveCard(nextCard, { focusSearch = false } = {}) {
      cards.forEach((card) => {
        syncSummary(card);
        const active = card === nextCard;
        card.classList.toggle("is-store-product-collapsed", !active);
        if (active) card.dataset.storeProductActive = "1";
        else delete card.dataset.storeProductActive;
      });

      if (!nextCard || !focusSearch) return;
      window.requestAnimationFrame(() => {
        nextCard.scrollIntoView({ behavior: "smooth", block: "center" });
        window.requestAnimationFrame(() => {
          const searchInput = nextCard.querySelector(".store-inline-catalog-search input");
          if (searchInput instanceof HTMLInputElement) searchInput.focus();
        });
      });
    }

    cards.forEach((card) => {
      const heading = card.querySelector(":scope > .store-item-heading");
      if (!(heading instanceof HTMLElement)) return;
      const onHeadingClick = (event) => {
        if (event.target instanceof Element && event.target.closest("button")) return;
        const collapsed = card.classList.contains("is-store-product-collapsed");
        setActiveCard(collapsed ? card : null, { focusSearch: false });
      };
      heading.addEventListener("click", onHeadingClick);
      listeners.push([heading, onHeadingClick]);
    });

    const addedIndex = addedProductId ? currentIds.indexOf(addedProductId) : -1;
    const addedCard = addedIndex >= 0 ? cards[addedIndex] : null;
    const existingActive = cards.find((card) => card.dataset.storeProductActive === "1");
    const activeCard = addedCard || existingActive || cards[cards.length - 1];
    setActiveCard(activeCard, { focusSearch: Boolean(addedCard) });

    let footerButton = section.querySelector(":scope > .store-add-product-footer");
    let createdFooter = false;
    if (!(footerButton instanceof HTMLButtonElement)) {
      footerButton = document.createElement("button");
      footerButton.type = "button";
      footerButton.className = "sales-primary-button store-add-product-footer";
      footerButton.innerHTML = "+&nbsp; Legg til vare";
      section.appendChild(footerButton);
      createdFooter = true;
    }
    const onFooterClick = () => addButton.click();
    footerButton.addEventListener("click", onFooterClick);

    return () => {
      listeners.forEach(([node, handler]) => node.removeEventListener("click", handler));
      footerButton?.removeEventListener("click", onFooterClick);
      if (createdFooter) footerButton?.remove();
    };
  }, [productIdentity]);

  return (
    <style>{`
      .store-item-card.is-store-product-collapsed{padding:10px 14px;background:#fff;cursor:pointer}
      .store-item-card.is-store-product-collapsed > :not(.store-item-heading){display:none!important}
      .store-item-card.is-store-product-collapsed .store-item-heading{margin-bottom:0;cursor:pointer}
      .store-item-card:not(.is-store-product-collapsed) .store-item-heading{cursor:pointer}
      .store-collapsed-product-summary{display:none;grid-column:2;grid-row:2;color:#60727a;font-size:13px;font-weight:650;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .store-item-card.is-store-product-collapsed .store-collapsed-product-summary{display:block}
      .store-item-card.is-store-product-collapsed .store-item-heading>.store-icon-button{grid-column:3;grid-row:1/3}
      .store-add-product-footer{position:sticky;bottom:12px;z-index:8;display:flex;margin:12px 0 0 auto;width:max-content;box-shadow:0 10px 26px rgba(15,23,42,.16)}
      @media(max-width:620px){.store-add-product-footer{width:100%;justify-content:center}.store-collapsed-product-summary{white-space:normal}}
    `}</style>
  );
}

function StoreOfferTextBlocks({ lines, onChange }) {
  const textBlocks = lines.filter(isTextBlock);
  const productLines = lines.filter(isProductLine);
  const builderLines = lines.filter((line) => !isTextBlock(line));

  function applyBlocks(nextBlocks) {
    onChange(mergeTextBlocks(builderLines, nextBlocks));
  }

  function addBlock() {
    applyBlocks([...textBlocks, createTextBlock()]);
  }

  function patchBlock(id, patch) {
    const nextBlocks = textBlocks.map((block) => {
      if (block.id !== id) return block;
      const next = { ...block, ...patch };
      return {
        ...next,
        description: textBlockDescription(next),
        productUrl: TEXT_BLOCK_MARKER,
        amount: "0",
      };
    });
    applyBlocks(nextBlocks);
  }

  function removeBlock(id) {
    applyBlocks(textBlocks.filter((block) => block.id !== id));
  }

  return (
    <section
      style={{
        maxWidth: 1180,
        margin: "14px auto 0",
        padding: "18px",
        border: "1px solid #d7e4ea",
        borderRadius: 18,
        background: "#fff",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 14,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2 style={{ margin: "0 0 4px", fontSize: 22 }}>Avsnitt i tilbudet</h2>
          <p style={{ margin: 0, color: "#60727a" }}>
            Legg inn prisfri tekst mellom varene. Avsnittene følger kundetilbudet og PDF-en.
          </p>
        </div>
        <button type="button" className="sales-secondary-button" onClick={addBlock}>
          <Plus size={18} /> Legg til avsnitt
        </button>
      </div>

      {textBlocks.length ? (
        <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
          {textBlocks.map((block, index) => (
            <article
              key={block.id}
              style={{
                display: "grid",
                gap: 12,
                padding: 14,
                border: "1px solid #d9e5ea",
                borderRadius: 14,
                background: "#f8fcfd",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <strong>Avsnitt {index + 1}</strong>
                <button
                  type="button"
                  className="store-icon-button"
                  onClick={() => removeBlock(block.id)}
                  aria-label="Slett avsnitt"
                >
                  <Trash2 size={17} />
                </button>
              </div>
              <div className="sales-form-grid">
                <label className="sales-field">
                  <span>Overskrift</span>
                  <input
                    value={block.storeTextTitle || ""}
                    onChange={(event) => patchBlock(block.id, { storeTextTitle: event.target.value })}
                    placeholder="F.eks. Om produktserien"
                  />
                </label>
                <label className="sales-field">
                  <span>Plassering</span>
                  <select
                    value={block.storeAfterLineId || ""}
                    onChange={(event) => patchBlock(block.id, { storeAfterLineId: event.target.value })}
                  >
                    <option value="">Før første vare</option>
                    {productLines.map((line) => (
                      <option key={line.id} value={line.id}>
                        Etter: {line.description || line.supplierProductNumber || "Vare"}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="sales-field sales-field-full">
                  <span>Tekst</span>
                  <textarea
                    value={block.storeTextBody || ""}
                    onChange={(event) => patchBlock(block.id, { storeTextBody: event.target.value })}
                    rows={3}
                    placeholder="Skriv teksten som kunden skal se."
                  />
                </label>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p style={{ margin: "14px 0 0", color: "#60727a" }}>
          Ingen egne avsnitt lagt til.
        </p>
      )}
    </section>
  );
}

export default function SalesStoreOfferBuilderCatalog(props) {
  const currentLines = Array.isArray(props.offerForm?.lines) ? props.offerForm.lines : [];
  const textBlocks = currentLines.filter(isTextBlock);
  const builderLines = currentLines.filter((line) => !isTextBlock(line));
  const productLines = builderLines.filter(isProductLine);
  const requestId = String(props.selectedRequest?.id || "");
  const [storeDraftSaveStatus, setStoreDraftSaveStatus] = useState("idle");
  const autosaveTimerRef = useRef(null);
  const autosaveRequestRef = useRef(requestId);
  const autosaveSignatureRef = useRef(createStoreAutosaveSignature(props.offerForm || {}));

  useEffect(() => {
    const nextSignature = createStoreAutosaveSignature(props.offerForm || {});

    if (!requestId) return undefined;
    if (autosaveRequestRef.current !== requestId) {
      autosaveRequestRef.current = requestId;
      autosaveSignatureRef.current = nextSignature;
      setStoreDraftSaveStatus("idle");
      return undefined;
    }
    if (autosaveSignatureRef.current === nextSignature) return undefined;

    autosaveSignatureRef.current = nextSignature;
    setStoreDraftSaveStatus("idle");
    if (autosaveTimerRef.current) window.clearTimeout(autosaveTimerRef.current);

    autosaveTimerRef.current = window.setTimeout(() => {
      setStoreDraftSaveStatus("saving");
      void persistStoreOfferDraft(props.selectedRequest, props.offerForm)
        .then(() => setStoreDraftSaveStatus("saved"))
        .catch((error) => {
          console.error("Kunne ikke mellomlagre Butikktilbud varig", error);
          setStoreDraftSaveStatus("error");
        });
    }, 850);

    return () => {
      if (autosaveTimerRef.current) {
        window.clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = null;
      }
    };
  }, [requestId, props.offerForm, props.selectedRequest]);

  function updateBuilderOfferForm(field, value) {
    if (field !== "lines") {
      props.updateOfferForm?.(field, value);
      return;
    }
    const nextBuilderLines = Array.isArray(value) ? value : [];
    props.updateOfferForm?.("lines", mergeTextBlocks(nextBuilderLines, textBlocks));
  }

  function updateTextBlocks(nextLines) {
    props.updateOfferForm?.("lines", nextLines);
  }

  function renderCatalogLookup({ kind, onPatch }) {
    const option = kind === "option";
    return (
      <StoreCatalogInlineLookup
        placeholder={option
          ? "Søk vare til opsjonen: varenavn, varenummer eller GTIN/EAN"
          : "Søk vareregister: varenavn, varenummer eller GTIN/EAN"}
        onUse={(item) => onPatch(option ? catalogOptionFields(item) : catalogFields(item))}
      />
    );
  }

  function addCatalogItem(item) {
    const line = createCatalogOfferLine(item);
    const nextLines = [...currentLines];
    let insertAt = -1;

    for (let index = 0; index < nextLines.length; index += 1) {
      const entry = nextLines[index];
      if (entry?.mainPostId === PRODUCT_POST.id && !entry?.__storeOfferMeta) {
        insertAt = index + 1;
      }
    }

    if (insertAt < 0) {
      const metaIndex = nextLines.findIndex((entry) => entry?.__storeOfferMeta);
      insertAt = metaIndex >= 0 ? metaIndex : nextLines.length;
    }

    nextLines.splice(insertAt, 0, line);
    props.updateOfferForm?.("lines", nextLines);
  }

  const visibleSaveStatus = storeDraftSaveStatus === "idle"
    ? props.offerDraftSaveStatus
    : storeDraftSaveStatus;

  return (
    <>
      <SalesStoreOfferBuilder
        {...props}
        offerDraftSaveStatus={visibleSaveStatus}
        offerForm={{ ...props.offerForm, lines: builderLines }}
        updateOfferForm={updateBuilderOfferForm}
        renderCatalogLookup={renderCatalogLookup}
      />
      <StoreOfferProductEditingUx products={productLines} />
      <StoreOfferTextBlocks lines={currentLines} onChange={updateTextBlocks} />
      <StoreCatalogAdminOnlyPanel onSelectItem={addCatalogItem} />
    </>
  );
}
