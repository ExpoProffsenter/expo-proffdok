// Expo ProffDok – FASE 39B.2
// Tynn katalog-wrapper rundt eksisterende Butikktilbud-bygger.
// Katalogens nettopris blir aldri kopiert til offerForm eller kundens tilbudsversjon.

import SalesStoreOfferBuilder from "./SalesStoreOfferBuilder.jsx";
import StoreCatalogPanel from "../../storeCatalog/StoreCatalogPanel.jsx";
import { buildNobbItemUrl } from "../utils/salesStoreOfferPricing.js";

const PRODUCT_POST = { id: "butikk-varer", title: "Varer" };

function createCatalogOfferLine(item = {}) {
  const supplierProductNumber = String(item.supplier_product_number || "").trim();
  const nobbNumber = String(item.nobb_number || "").trim();
  const productUrl = String(item.product_url || "").trim() || buildNobbItemUrl(nobbNumber);
  const inclVat = Number(item.customer_price_incl_vat || 0);
  const exVat = Number(item.customer_price_ex_vat || 0);

  return {
    id: `line-${crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`}`,
    mainPostId: PRODUCT_POST.id,
    mainPostTitle: PRODUCT_POST.title,
    lineType: "work",
    description: String(item.description || "").trim(),
    nobbNumber,
    supplierProductNumber,
    internalProductNumber: supplierProductNumber,
    quantity: "1",
    unit: "stk",
    storeUnitPriceInclVat: Number.isFinite(inclVat) ? String(inclVat) : "",
    storeDiscountPercent: "",
    amount: Number.isFinite(exVat) ? String(exVat) : "",
    productUrl,
    storeAutoProductUrl: Boolean(nobbNumber && productUrl === buildNobbItemUrl(nobbNumber)),
    imageDataUrl: "",
    imageName: "",
    attachmentFile: null,
    // Kun ufarlige katalogreferanser følger tilbudslinjen. Nettopris/salgsavanse gjør det ikke.
    storeCatalogItemId: String(item.id || ""),
    storeCatalogGtin: String(item.gtin || ""),
  };
}

export default function SalesStoreOfferBuilderCatalog(props) {
  function addCatalogItem(item) {
    const line = createCatalogOfferLine(item);
    const currentLines = Array.isArray(props.offerForm?.lines) ? props.offerForm.lines : [];
    const metaIndex = currentLines.findIndex((entry) => entry?.__storeOfferMeta);
    const nextLines = [...currentLines];

    if (metaIndex >= 0) nextLines.splice(metaIndex, 0, line);
    else nextLines.push(line);

    props.updateOfferForm?.("lines", nextLines);
  }

  return (
    <>
      <StoreCatalogPanel onSelectItem={addCatalogItem} />
      <SalesStoreOfferBuilder {...props} />
    </>
  );
}
