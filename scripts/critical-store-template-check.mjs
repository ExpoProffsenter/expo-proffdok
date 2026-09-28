import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

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
  "withReusableTemplateMedia(item)",
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

const mediaModule = await import(
  pathToFileURL(
    path.join(root, "src/modules/sales/utils/salesOfferTemplateMedia.mjs")
  ).href
);
for (const imageDataUrl of [
  "https://example.invalid/template-image.jpg",
  "/auth-bathroom.jpg",
]) {
  const item = mediaModule.withReusableTemplateMedia({
    id: "option-1",
    imageDataUrl,
    imageName: "Opsjonsbilde.jpg",
    attachmentFile: { url: "https://example.invalid/attachment.pdf" },
  });
  assert(item.imageDataUrl === imageDataUrl, "varig tilbudsbilde må følge malen");
  assert(item.imageName === "Opsjonsbilde.jpg", "bildenavn må følge malen");
  assert(item.attachmentFile === null, "PDF-vedlegg må ikke følge malen");
}
for (const imageDataUrl of ["data:image/jpeg;base64,abc", "blob:https://example.invalid/abc"]) {
  const item = mediaModule.withReusableTemplateMedia({
    imageDataUrl,
    imageName: "Midlertidig.jpg",
  });
  assert(item.imageDataUrl === "", "midlertidig/tung bilde-URL må ikke lagres i mal-JSON");
  assert(item.imageName === "", "bildenavn må fjernes når bildet ikke kan gjenbrukes");
}

const standardBuilder = read("src/modules/sales/SalesModuleCore.jsx");
for (const needle of [
  'from "./utils/salesOfferTemplateMedia.mjs"',
  "lines: cleanLines.map(withReusableTemplateMedia)",
  "options: cleanOptions.map(withReusableTemplateMedia)",
  "...withReusableTemplateMedia(line)",
  "...withReusableTemplateMedia(option)",
]) assert(standardBuilder.includes(needle), `Våtromsmal mangler bildegjenbruk: ${needle}`);

for (const forbidden of [
  'select("id,purchase_net_ex_vat',
  'select("purchase_net_ex_vat',
]) assert(!service.includes(forbidden), `malmotor skal ikke hente intern nettopris: ${forbidden}`);

const panel = read(
  "src/modules/sales/components/StoreOfferCompleteTemplatePanel.jsx"
);
for (const needle of [
  "Komplette maler for Generelt tilbud",
  "saveCompleteStoreOfferTemplate",
  "materializeStoreOfferTemplate",
  "recalculateStoreOption",
  "currentMetaLines(offerForm)",
  "erstatter eksisterende avsnitt, poster, montering og opsjoner",
  "katalogpris",
  "beholder prisen som ble lagret",
  "Bruk firmamal",
  "Lagre som mal",
  "createPortal",
  "data-store-complete-template-top-host",
  "data-store-complete-template-save-host",
  ".store-summary-actions",
  "data-sales-save-offer-button",
  "insertBefore(createdSaveHost, saveOfferButton)",
  "data-store-template-action-notice",
  "setActionNotice",
  'materialized.missingCatalogItems ? "warning" : "success"',
  'aria-live="polite"',
  "document.body",
  "Bilder som er lagret i appens",
  "PDF-vedlegg følger ikke",
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
