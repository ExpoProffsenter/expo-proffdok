import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(`FASE 40B template check: ${message}`);
}

const service = read(
  "src/modules/sales/services/salesStoreOfferCompleteTemplates.js"
);
for (const needle of [
  'STORE_COMPLETE_TEMPLATE_KIND = "store-offer-complete-v2"',
  "structureVersion: STORE_COMPLETE_TEMPLATE_VERSION",
  "lines: visibleTemplateLines(offerForm.lines)",
  "options: visibleTemplateOptions(offerForm.options)",
  'safe.imageDataUrl = ""',
  "safe.attachmentFile = null",
  'safe.storeUnitPriceInclVat = ""',
  'safe.amount = ""',
  'from("internal_store_catalog_items")',
  'customer_price_incl_vat',
  "remapTemplateIds",
  '"storeSectionId"',
  '"storeParentProductId"',
  '"replacementLineId"',
  '"storeInstallationReplacementLineId"',
]) assert(service.includes(needle), `malmotor mangler kontrakt: ${needle}`);

for (const forbidden of [
  'select("id,purchase_net_ex_vat',
  'select("purchase_net_ex_vat',
]) assert(!service.includes(forbidden), `malmotor skal ikke hente intern nettopris: ${forbidden}`);

const panel = read(
  "src/modules/sales/components/StoreOfferCompleteTemplatePanel.jsx"
);
for (const needle of [
  "Komplette Butikktilbud-maler",
  "saveCompleteStoreOfferTemplate",
  "materializeStoreOfferTemplate",
  "recalculateStoreOption",
  "currentMetaLines(offerForm)",
  "erstatter eksisterende avsnitt, poster, montering og opsjoner",
  "katalogpris",
  "Manuelle poster beholder prisen",
  "Bruk firmamal",
  "Lagre som mal",
  "createPortal",
  "data-store-complete-template-top-host",
  "data-store-complete-template-save-host",
  ".store-summary-actions",
  "data-sales-save-offer-button",
  "insertBefore(createdSaveHost, saveOfferButton)",
]) assert(panel.includes(needle), `malpanelet mangler: ${needle}`);

for (const forbidden of [
  "store-complete-template-trigger",
  "store-complete-template-backdrop",
  "position:fixed",
  ".store-workbar",
]) assert(!panel.includes(forbidden), `mal-UI skal følge Våtromstilbud og ikke bruke flytende/arbeidslinje-plassering: ${forbidden}`);

const outer = read(
  "src/modules/sales/components/SalesStoreOfferBuilderCatalogTemplates.jsx"
);
assert(
  outer.includes("<SalesStoreOfferBuilderCatalog {...props} />") &&
    outer.includes("<StoreOfferCompleteTemplatePanel"),
  "komplette maler skal ligge som tynn wrapper rundt eksisterende Butikktilbud-bygger."
);

const router = read("src/modules/sales/components/SalesOfferBuilder.jsx");
assert(
  router.includes("if (isStoreOfferRequest(props?.selectedRequest))") &&
    router.includes("SalesStoreOfferBuilderCatalogTemplates") &&
    router.includes("return <SalesOfferBuilderStandard {...props} />"),
  "ordinær Sales-bygger må forbli separat og urørt."
);

console.log("✅ Expo ProffDok komplette Butikktilbud-maler check OK");
