// Expo ProffDok – FASE 39B.2
// Tynn katalog-wrapper rundt eksisterende Butikktilbud-bygger.
// Katalogens nettopris blir aldri kopiert til offerForm eller kundens tilbudsversjon.
// Prisnøytrale tekstavsnitt holdes utenfor varebyggeren, men følger tilbudsversjonen.

import { Plus, Trash2 } from "lucide-react";
import SalesStoreOfferBuilder from "./SalesStoreOfferBuilder.jsx";
import {
  StoreCatalogAdminOnlyPanel,
  StoreCatalogInlinePortals,
} from "../../storeCatalog/StoreCatalogOfferTools.jsx";
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
    // Kun ufarlige katalogreferanser følger tilbudslinjen. Nettopris/salgsavanse gjør det ikke.
    storeCatalogItemId: String(item.id || ""),
    storeCatalogGtin: String(item.gtin || ""),
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

  function useCatalogItemInLine(lineId, item) {
    const patch = catalogFields(item);
    props.updateOfferForm?.(
      "lines",
      currentLines.map((line) =>
        String(line?.id || "") === String(lineId || "")
          ? { ...line, ...patch }
          : line
      )
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

  return (
    <>
      <SalesStoreOfferBuilder
        {...props}
        offerForm={{ ...props.offerForm, lines: builderLines }}
        updateOfferForm={updateBuilderOfferForm}
      />
      <StoreCatalogInlinePortals
        lines={currentLines}
        onUseItem={useCatalogItemInLine}
      />
      <StoreOfferTextBlocks lines={currentLines} onChange={updateTextBlocks} />
      <StoreCatalogAdminOnlyPanel onSelectItem={addCatalogItem} />
    </>
  );
}
