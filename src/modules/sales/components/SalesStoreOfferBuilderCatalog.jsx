// Expo ProffDok – FASE 39B.2C
// Tynn katalog-wrapper rundt grouped Butikktilbud-bygger.
// Katalogens nettopris kopieres aldri til offerForm/kundevisning.
// Server-autosave lagrer kun aktuell Butikktilbud-sak.

import { useEffect, useRef, useState } from "react";
import SalesStoreOfferBuilderGrouped from "./SalesStoreOfferBuilderGrouped.jsx";
import {
  StoreCatalogAdminOnlyPanel,
  StoreCatalogInlineLookup,
} from "../../storeCatalog/StoreCatalogOfferTools.jsx";
import { persistStoreOfferDraft } from "../services/salesStoreOfferAutosave.js";
import { buildNobbItemUrl } from "../utils/salesStoreOfferPricing.js";

const PRODUCT_POST = { id: "butikk-varer", title: "Varer" };

function createId(prefix) {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
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
  return { ...shared, title: description };
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
    storeSectionId: "",
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

export default function SalesStoreOfferBuilderCatalog(props) {
  const currentLines = Array.isArray(props.offerForm?.lines) ? props.offerForm.lines : [];
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
    const firstInstallation = nextLines.findIndex((entry) => entry?.mainPostId === "butikk-montering");
    const metaIndex = nextLines.findIndex((entry) => entry?.__storeOfferMeta);
    const insertAt = firstInstallation >= 0 ? firstInstallation : metaIndex >= 0 ? metaIndex : nextLines.length;
    nextLines.splice(insertAt, 0, line);
    props.updateOfferForm?.("lines", nextLines);
  }

  const visibleSaveStatus = storeDraftSaveStatus === "idle"
    ? props.offerDraftSaveStatus
    : storeDraftSaveStatus;

  return (
    <>
      <SalesStoreOfferBuilderGrouped
        {...props}
        offerDraftSaveStatus={visibleSaveStatus}
        renderCatalogLookup={renderCatalogLookup}
      />
      <StoreCatalogAdminOnlyPanel onSelectItem={addCatalogItem} />
    </>
  );
}
