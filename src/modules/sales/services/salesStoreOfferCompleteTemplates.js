// Expo ProffDok – FASE 40B
// Komplette firmamaler for Butikktilbud.
// Nye maler lagrer struktur og kundetekst, men aldri intern nettopris eller tunge vedlegg/bilder.
// Katalogvarer prises på nytt mot aktivt internt vareregister når malen brukes.

import {
  createDefaultSalesSupabaseClient,
  deleteSalesOfferTemplate,
  fetchSalesOfferTemplates,
  getSalesSession,
  insertSalesOfferTemplate,
  resolveSalesCompanyScope,
} from "./salesSupabase.js";
import { STORE_TEXT_TEMPLATE_KIND } from "./salesStoreOffers.js";
import {
  buildNobbItemUrl,
  parseStoreNumber,
  storeDiscount,
  storeNumber,
} from "../utils/salesStoreOfferPricing.js";

export const STORE_COMPLETE_TEMPLATE_KIND = "store-offer-complete-v2";
export const STORE_COMPLETE_TEMPLATE_VERSION = 2;

const VAT_FACTOR = 1.25;
const TEMPLATE_TEXT_FIELDS = [
  "title",
  "intro",
  "reservations",
  "included",
  "excluded",
  "customerSupplied",
  "terms",
  "paymentTerms",
  "validityDays",
];

const client = createDefaultSalesSupabaseClient();

function cleanText(value) {
  return String(value || "").trim();
}

function createId(prefix = "template") {
  if (globalThis.crypto?.randomUUID) return `${prefix}-${globalThis.crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function resolveContext() {
  if (!client) throw new Error("Supabase er ikke tilgjengelig.");

  const { data: sessionData } = await getSalesSession(client);
  const userId = sessionData?.session?.user?.id;
  if (!userId) throw new Error("Du må være innlogget for å bruke maler.");

  const { data: companyId, error } = await resolveSalesCompanyScope(client);
  if (error || !companyId) {
    throw error || new Error("Firmatilknytningen kunne ikke bekreftes.");
  }

  return { companyId, userId };
}

function isKnownStoreTemplate(template = {}) {
  const kind = template?.payload?.templateKind;
  return kind === STORE_COMPLETE_TEMPLATE_KIND || kind === STORE_TEXT_TEMPLATE_KIND;
}

export function isCompleteStoreOfferTemplate(template = {}) {
  return template?.payload?.templateKind === STORE_COMPLETE_TEMPLATE_KIND;
}

function copyTextFields(source = {}) {
  const fields = {};
  TEMPLATE_TEXT_FIELDS.forEach((field) => {
    if (field === "validityDays") {
      fields[field] = String(source?.[field] || "30");
    } else {
      fields[field] = String(source?.[field] || "").trim();
    }
  });
  return fields;
}

function stripSensitiveAndHeavyFields(item = {}) {
  const safe = { ...item };

  // Media hører til den konkrete tilbudssaken, ikke firmamalen.
  safe.imageDataUrl = "";
  safe.imageName = "";
  safe.attachmentFile = null;

  // Forsvar i dybden: disse feltene skal aldri finnes i kunde-/mal-JSON.
  [
    "purchase_net_ex_vat",
    "purchaseNetExVat",
    "supplier_list_price_ex_vat",
    "supplierListPriceExVat",
    "gross_margin_percent",
    "grossMarginPercent",
    "purchase_discount_percent",
    "purchaseDiscountPercent",
    "markup_percent",
    "markupPercent",
  ].forEach((key) => delete safe[key]);

  // Avledede alternativsummer må beregnes på nytt når malen brukes.
  [
    "storeAlternativeDeltaInclVat",
    "storeAlternativeItemTotalInclVat",
    "storeReplacedItemTotalInclVat",
    "storeInstallationOriginalTotalInclVat",
    "storeAlternativePackageTotalInclVat",
  ].forEach((key) => delete safe[key]);

  if (cleanText(safe.storeCatalogItemId)) {
    // Katalogprisen er aldri malens sannhet. Den hentes fra aktiv katalog ved bruk.
    safe.storeUnitPriceInclVat = "";
    safe.amount = "";
  }

  delete safe.__companyMeta;
  delete safe.__offerTermsMeta;
  delete safe.__storeOfferMeta;
  return safe;
}

function visibleTemplateLines(lines = []) {
  return (Array.isArray(lines) ? lines : [])
    .filter(
      (line) =>
        !line?.__storeOfferMeta && !line?.__companyMeta && !line?.__offerTermsMeta
    )
    .map(stripSensitiveAndHeavyFields);
}

function visibleTemplateOptions(options = []) {
  return (Array.isArray(options) ? options : []).map(stripSensitiveAndHeavyFields);
}

function buildCompletePayload(offerForm = {}) {
  return {
    templateKind: STORE_COMPLETE_TEMPLATE_KIND,
    structureVersion: STORE_COMPLETE_TEMPLATE_VERSION,
    ...copyTextFields(offerForm),
    lines: visibleTemplateLines(offerForm.lines),
    options: visibleTemplateOptions(offerForm.options),
  };
}

export async function loadStoreOfferTemplates() {
  const { companyId } = await resolveContext();
  const { data, error } = await fetchSalesOfferTemplates(client, companyId);
  if (error) throw error;
  return (Array.isArray(data) ? data : []).filter(isKnownStoreTemplate);
}

export async function saveCompleteStoreOfferTemplate(name, offerForm = {}) {
  const { companyId, userId } = await resolveContext();
  const cleanName = cleanText(name);
  if (!cleanName) throw new Error("Malen må ha et navn.");

  const payload = buildCompletePayload(offerForm);
  const { data, error } = await insertSalesOfferTemplate(client, {
    companyId,
    name: cleanName,
    payload,
    createdBy: userId,
  });
  if (error) throw error;
  return data;
}

export async function removeStoreOfferTemplate(templateId) {
  const { companyId } = await resolveContext();
  const { error } = await deleteSalesOfferTemplate(client, templateId, companyId);
  if (error) throw error;
}

async function fetchCurrentCatalogItems(ids = []) {
  const uniqueIds = [...new Set(ids.map(cleanText).filter(Boolean))];
  if (!uniqueIds.length) return new Map();

  const rows = [];
  for (let index = 0; index < uniqueIds.length; index += 100) {
    const batch = uniqueIds.slice(index, index + 100);
    const { data, error } = await client
      .from("internal_store_catalog_items")
      .select(
        "id,supplier_name,supplier_product_number,customer_price_incl_vat,gtin,nobb_number,product_url,is_active"
      )
      .in("id", batch)
      .eq("is_active", true);
    if (error) throw new Error(error.message || "Kunne ikke hente gjeldende katalogpriser.");
    rows.push(...(Array.isArray(data) ? data : []));
  }

  return new Map(rows.map((row) => [String(row.id), row]));
}

function catalogPricePatch(item = {}, catalog = null) {
  if (!catalog) {
    return {
      storeUnitPriceInclVat: "",
      amount: "",
      storeTemplateCatalogMissing: true,
    };
  }

  const gross = Number(catalog.customer_price_incl_vat || 0);
  const discount = storeDiscount(item.storeDiscountPercent);
  const netAfterDiscount =
    Number.isFinite(gross) && gross > 0
      ? (gross * (1 - discount / 100)) / VAT_FACTOR
      : 0;
  const supplierProductNumber = cleanText(catalog.supplier_product_number);
  const nobbNumber = cleanText(catalog.nobb_number);
  const productUrl = cleanText(catalog.product_url) || buildNobbItemUrl(nobbNumber);

  return {
    supplierProductNumber,
    internalProductNumber: supplierProductNumber,
    nobbNumber,
    productUrl,
    storeAutoProductUrl: Boolean(
      nobbNumber && productUrl === buildNobbItemUrl(nobbNumber)
    ),
    storeCatalogGtin: cleanText(catalog.gtin),
    storeUnitPriceInclVat: Number.isFinite(gross) && gross > 0 ? storeNumber(gross) : "",
    amount: netAfterDiscount > 0 ? storeNumber(netAfterDiscount) : "",
    storeTemplateCatalogMissing: false,
  };
}

function remapTemplateIds(lines = [], options = []) {
  const idMap = new Map();
  const allItems = [...lines, ...options];

  allItems.forEach((item) => {
    const oldId = cleanText(item?.id);
    if (!oldId || idMap.has(oldId)) return;
    const prefix =
      item?.lineType === "store_text" || item?.storeSectionMode === "group"
        ? "store-section"
        : options.includes(item)
          ? "option"
          : "line";
    idMap.set(oldId, createId(prefix));
  });

  const mappedRef = (value) => {
    const clean = cleanText(value);
    return clean && idMap.has(clean) ? idMap.get(clean) : clean;
  };

  const remap = (item = {}) => {
    const oldId = cleanText(item.id);
    const next = {
      ...item,
      id: oldId && idMap.has(oldId) ? idMap.get(oldId) : createId("template-item"),
    };

    [
      "storeSectionId",
      "storeParentProductId",
      "replacementLineId",
      "storeInstallationReplacementLineId",
    ].forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(next, field)) {
        next[field] = mappedRef(next[field]);
      }
    });

    if (next.lineType === "store_text" || next.storeSectionMode === "group") {
      next.storeSectionId = next.id;
      next.amount = "0";
      next.quantity = "0";
      next.unit = "";
    }

    return next;
  };

  return {
    lines: lines.map(remap),
    options: options.map(remap),
  };
}

function legacyTextFields(payload = {}) {
  return copyTextFields(payload);
}

export async function materializeStoreOfferTemplate(template = {}) {
  const payload = template?.payload || {};
  if (payload.templateKind === STORE_TEXT_TEMPLATE_KIND) {
    return {
      mode: "legacy-text",
      fields: legacyTextFields(payload),
      lines: null,
      options: null,
      refreshedCatalogItems: 0,
      missingCatalogItems: 0,
    };
  }

  if (payload.templateKind !== STORE_COMPLETE_TEMPLATE_KIND) {
    throw new Error("Malen er ikke en gyldig Butikktilbud-mal.");
  }

  const sourceLines = visibleTemplateLines(payload.lines);
  const sourceOptions = visibleTemplateOptions(payload.options);
  const catalogIds = [...sourceLines, ...sourceOptions]
    .map((item) => cleanText(item.storeCatalogItemId))
    .filter(Boolean);
  const catalogById = await fetchCurrentCatalogItems(catalogIds);

  let refreshedCatalogItems = 0;
  let missingCatalogItems = 0;
  const hydrate = (item = {}) => {
    const catalogId = cleanText(item.storeCatalogItemId);
    if (!catalogId) return stripSensitiveAndHeavyFields(item);
    const catalog = catalogById.get(catalogId) || null;
    if (catalog) refreshedCatalogItems += 1;
    else missingCatalogItems += 1;
    return {
      ...stripSensitiveAndHeavyFields(item),
      ...catalogPricePatch(item, catalog),
    };
  };

  const hydratedLines = sourceLines.map(hydrate);
  const hydratedOptions = sourceOptions.map(hydrate);
  const remapped = remapTemplateIds(hydratedLines, hydratedOptions);

  return {
    mode: "complete",
    fields: copyTextFields(payload),
    lines: remapped.lines,
    options: remapped.options,
    refreshedCatalogItems,
    missingCatalogItems,
  };
}

export function summarizeStoreOfferTemplate(offerForm = {}) {
  const lines = visibleTemplateLines(offerForm.lines);
  const options = visibleTemplateOptions(offerForm.options);
  const sections = lines.filter(
    (line) => line?.lineType === "store_text" || line?.storeSectionMode === "group"
  ).length;
  const posts = lines.filter(
    (line) =>
      line?.mainPostId === "butikk-varer" &&
      line?.lineType !== "store_text" &&
      line?.storeSectionMode !== "group"
  ).length;
  const installations = lines.filter(
    (line) => line?.mainPostId === "butikk-montering"
  ).length;
  const catalogItems = [...lines, ...options].filter((item) => cleanText(item.storeCatalogItemId)).length;
  return { sections, posts, installations, options: options.length, catalogItems };
}

export function normalizeTemplateQuantity(value, fallback = "1") {
  const parsed = parseStoreNumber(value, Number.NaN);
  return Number.isFinite(parsed) && parsed > 0 ? String(value) : fallback;
}
