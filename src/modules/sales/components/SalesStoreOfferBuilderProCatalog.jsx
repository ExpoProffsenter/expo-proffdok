// Expo ProffDok – FASE 45B
// Additiv wrapper rundt eksisterende Butikktilbud-/Enkel ordre-bygger.
// Proffkatalogen kan kun legge inn ufarlige salgsfelt. Din nto pris lagres aldri i tilbudet.

import { useEffect, useState } from "react";
import SalesStoreOfferBuilderCatalogTemplates from "./SalesStoreOfferBuilderCatalogTemplates.jsx";
import ProStoreCatalogInlineLookup from "../../storeCatalog/ProStoreCatalogInlineLookup.jsx";
import { createDefaultSalesSupabaseClient } from "../services/salesSupabase.js";
import { canAccessProStoreCatalog } from "../../storeCatalog/proStoreCatalogClient.js";

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return `line-${crypto.randomUUID()}`;
  return `line-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function buildOfferLine(item = {}) {
  const saleExVat = toNumber(item.suggested_sale_price_ex_vat);
  const saleInclVat = toNumber(item.suggested_sale_price_incl_vat) || saleExVat * 1.25;
  const supplierProductNumber = String(item.supplier_product_number || "").trim();

  return {
    id: createId(),
    mainPostId: "butikk-varer",
    mainPostTitle: "Varer",
    lineType: "work",
    description: String(item.description || "").trim(),
    nobbNumber: String(item.nobb_number || "").trim(),
    supplierProductNumber,
    internalProductNumber: supplierProductNumber,
    quantity: "1",
    unit: "stk",
    storeUnitPriceInclVat: saleInclVat > 0 ? String(saleInclVat) : "",
    storeDiscountPercent: "",
    amount: saleExVat > 0 ? String(saleExVat) : "",
    productUrl: String(item.product_url || "").trim(),
    storeAutoProductUrl: false,
    storeCatalogItemId: String(item.id || ""),
    storeCatalogGtin: String(item.gtin || ""),
    imageDataUrl: "",
    imageName: "",
    attachmentFile: null,
  };
}

export default function SalesStoreOfferBuilderProCatalog(props) {
  const [client] = useState(() => createDefaultSalesSupabaseClient());
  const [proAccess, setProAccess] = useState(false);

  useEffect(() => {
    let active = true;
    canAccessProStoreCatalog(client)
      .then((allowed) => active && setProAccess(allowed === true))
      .catch(() => active && setProAccess(false));
    return () => { active = false; };
  }, [client, props?.selectedRequest?.id]);

  useEffect(() => {
    if (!proAccess) return;
    const lines = Array.isArray(props?.offerForm?.lines) ? props.offerForm.lines : [];
    let changed = false;
    const nextLines = lines.map((line) => {
      if (!line?.__storeOfferMeta || line?.simpleOrder === true) return line;
      changed = true;
      return {
        ...line,
        simpleOrder: true,
        simpleOrderVersion: 1,
        offerKind: "simple-order-v1",
      };
    });
    if (changed) props?.updateOfferForm?.("lines", nextLines);
  }, [proAccess, props?.offerForm?.lines, props?.updateOfferForm]);

  function addCatalogItem(item) {
    const lines = Array.isArray(props?.offerForm?.lines) ? props.offerForm.lines : [];
    props?.updateOfferForm?.("lines", [...lines, buildOfferLine(item)]);
  }

  return (
    <>
      {proAccess ? (
        <section className="sales-card" data-pro-catalog-quick-add="true" style={{ marginBottom: 12, padding: 14 }}>
          <div style={{ display: "grid", gap: 5, marginBottom: 10 }}>
            <strong>Enkel ordre · varesøk</strong>
            <span className="note">
              Kun leverandører firmaet har tilgang til vises. Kundepris eks. mva. legges inn som foreslått salgspris og kan endres i tilbudet.
            </span>
          </div>
          <ProStoreCatalogInlineLookup onUse={addCatalogItem} />
        </section>
      ) : null}
      <SalesStoreOfferBuilderCatalogTemplates {...props} />
    </>
  );
}
