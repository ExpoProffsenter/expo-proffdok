import fs from "node:fs";
import assert from "node:assert/strict";

const preview = fs.readFileSync("src/modules/sales/components/SalesDraftCustomerPreview.jsx", "utf8");
const entry = fs.readFileSync("src/modules/sales/SalesPreview.jsx", "utf8");
const detail = fs.readFileSync("src/modules/sales/components/SalesDetailView.jsx", "utf8");
const customerCore = fs.readFileSync("src/modules/sales/components/SalesCustomerViewCore.jsx", "utf8");

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
assert(detail.includes("/sales-preview.html"), "Forhåndsvisningsknappen må bruke isolert preview-side.");
assert(detail.includes('"_blank"'), "Kundepreview skal åpnes i egen fane.");
assert(detail.includes("data-internal-product-number"), "Intern tilbudsvisning skal kunne vise varenummer.");
assert(!customerCore.includes("supplierProductNumber"), "Kundens tilbud skal ikke vise eller bruke leverandørvarenummer i presentasjonen.");
assert(!customerCore.includes("internalProductNumber"), "Kundens tilbud skal ikke vise internt varenummer i presentasjonen.");
assert(!customerCore.includes("Varenr."), "Kundens tilbud skal aldri ha varenummer-label.");

console.log("critical-customer-draft-preview-check: OK");
