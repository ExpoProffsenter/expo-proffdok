import fs from "node:fs";
import assert from "node:assert/strict";

const preview = fs.readFileSync("src/modules/sales/components/SalesDraftCustomerPreview.jsx", "utf8");
const entry = fs.readFileSync("src/modules/sales/SalesPreview.jsx", "utf8");
const detail = fs.readFileSync("src/modules/sales/components/SalesDetailView.jsx", "utf8");
const customerCore = fs.readFileSync("src/modules/sales/components/SalesCustomerViewCore.jsx", "utf8");
const previewReturnGuard = fs.readFileSync("src/modules/sales/salesDraftPreviewReturnGuard.js", "utf8");
const indexHtml = fs.readFileSync("index.html", "utf8");
const packageJson = fs.readFileSync("package.json", "utf8");

for (const required of [
  "buildOfferSnapshot",
  "fetchSalesRequestDetailRow",
  "resolveSalesCompanyScope",
  "fetchSalesCompanyProfile",
  "Forhåndsvisning – ikke sendt til kunde",
  ".sales-customer-accept-form",
  ".store-customer-decision-shell",
]) {
  assert(preview.includes(required), `Kundepreview mangler sikkerhets-/presentasjonsmarkør: ${required}`);
}

for (const forbidden of [
  "publishSalesOffer",
  "publishSalesOfferAndBuildLink",
  "sendSalesCustomerEmail",
  "sendOfferEmail",
  "copyCustomerOfferLink",
  "acceptSalesOffer",
  "declineSalesOffer",
]) {
  assert(!preview.includes(forbidden), `Kundepreview må være skrivebeskyttet og inneholder: ${forbidden}`);
}

assert(entry.includes("offerPreview"), "sales-preview må route offerPreview til kundepreview.");
assert(entry.includes("SalesDraftCustomerPreview"), "sales-preview mangler kundepreview-komponent.");
assert(detail.includes("Forhåndsvis som kunde"), "Tilbudssaken mangler forhåndsvisningsknapp.");
assert(detail.includes("data-draft-customer-preview-action"), "Forhåndsvisningsknappen mangler smal retur-hook.");
assert(detail.includes("/sales-preview.html"), "Forhåndsvisningsknappen må bruke isolert preview-side.");
assert(detail.includes('"_blank"'), "Kundepreview skal åpnes i egen fane.");
assert(detail.includes("data-internal-product-number"), "Intern tilbudsvisning skal kunne vise varenummer.");
assert(!customerCore.includes("supplierProductNumber"), "Kundens tilbud skal ikke vise eller bruke leverandørvarenummer i presentasjonen.");
assert(!customerCore.includes("internalProductNumber"), "Kundens tilbud skal ikke vise internt varenummer i presentasjonen.");
assert(!customerCore.includes("Varenr."), "Kundens tilbud skal aldri ha varenummer-label.");

// Regression: preview-knappen er en ekte brukerhandling. Pointerdown-vakten rydder
// gammel recovery før Reacts click-handler åpner ny fane. En smal click-capture må
// derfor armere et ferskt snapshot av detail + samme sak før window.open kjøres.
for (const required of [
  "buildSalesStorageKey",
  "loadSalesNavigation",
  "markSalesResumeForBackground",
  "readCachedWorkProfileState",
  "[data-draft-customer-preview-action='true']",
  'navigation?.mode !== "detail"',
  'document.addEventListener("click", handlePreviewClickCapture, true)',
]) {
  assert(previewReturnGuard.includes(required), `Preview-returvakten mangler: ${required}`);
}
assert(
  indexHtml.includes("installSalesDraftPreviewReturnGuard"),
  "Den smale preview-returvakten må installeres fra app-entry."
);
assert(
  !previewReturnGuard.includes("window.open =") &&
    !previewReturnGuard.includes("history.back("),
  "Preview-returvakten skal aldri overstyre global window.open eller browserhistorikk."
);
assert(
  !indexHtml.includes("installSalesNavigationContractUx") &&
    !packageJson.includes("critical-sales-navigation-contract-check.mjs"),
  "Den brede, supersederte navigasjonsvakten må ikke være aktiv eller del av build-kjeden."
);

console.log("critical-customer-draft-preview-check: OK");
