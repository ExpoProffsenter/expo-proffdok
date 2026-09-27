import fs from "node:fs";
import assert from "node:assert/strict";
import { resolveSalesDraftPreviewResumeStorageKey } from "../src/modules/sales/services/salesDraftPreviewResume.mjs";

const preview = fs.readFileSync("src/modules/sales/components/SalesDraftCustomerPreview.jsx", "utf8");
const entry = fs.readFileSync("src/modules/sales/SalesPreview.jsx", "utf8");
const detail = fs.readFileSync("src/modules/sales/components/SalesDetailView.jsx", "utf8");
const customerCore = fs.readFileSync("src/modules/sales/components/SalesCustomerViewCore.jsx", "utf8");
const previewReturnGuard = fs.readFileSync("src/modules/sales/salesDraftPreviewReturnGuard.js", "utf8");
const previewResumeResolver = fs.readFileSync("src/modules/sales/services/salesDraftPreviewResume.mjs", "utf8");
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
assert(detail.includes("data-draft-customer-preview-request-id"), "Forhåndsvisningsflaten må binde returvakten til synlig request_ref.");
assert(detail.includes("/sales-preview.html"), "Forhåndsvisningsknappen må bruke isolert preview-side.");
assert(detail.includes('"_blank"'), "Kundepreview skal åpnes i egen fane.");
assert(detail.includes("data-internal-product-number"), "Intern tilbudsvisning skal kunne vise varenummer.");
assert(!customerCore.includes("supplierProductNumber"), "Kundens tilbud skal ikke vise eller bruke leverandørvarenummer i presentasjonen.");
assert(!customerCore.includes("internalProductNumber"), "Kundens tilbud skal ikke vise internt varenummer i presentasjonen.");
assert(!customerCore.includes("Varenr."), "Kundens tilbud skal aldri ha varenummer-label.");

// Regression: systemadmin kan representere Bademiljø mens SalesModule fortsatt har
// den åpne saken lagret under profilfirmaets eldre scope. Preview-returvakten må da
// finne storage-nøkkelen som faktisk peker på akkurat request_ref-en på skjermen.
for (const required of [
  "buildSalesStorageKey",
  "markSalesResumeForBackground",
  "resolveSalesDraftPreviewResumeStorageKey",
  "readCachedWorkProfileState",
  "[data-draft-customer-preview-action='true']",
  "draftCustomerPreviewRequestId",
  'document.addEventListener("click", handlePreviewClickCapture, true)',
]) {
  assert(previewReturnGuard.includes(required), `Preview-returvakten mangler: ${required}`);
}
for (const required of [
  "SALES_STORAGE_PREFIX",
  'navigation?.mode === "detail"',
  "matches.length === 1",
]) {
  assert(previewResumeResolver.includes(required), `Preview-scope-resolver mangler: ${required}`);
}

function mockStorage(entries = {}) {
  const values = new Map(Object.entries(entries));
  const keys = [...values.keys()];
  return {
    get length() {
      return keys.length;
    },
    key(index) {
      return keys[index] ?? null;
    },
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
  };
}

const userId = "systemadmin-user";
const requestId = "F-2026-0042";
const activeCompanyKey = `expo-proffdok-sales-preview-requests-v1:bademiljo-expo:${userId}`;
const actualMountedKey = `expo-proffdok-sales-preview-requests-v1:expo-proffsenter:${userId}`;
const mismatchStorage = mockStorage({
  [`${activeCompanyKey}:navigation`]: JSON.stringify({ mode: "list", selectedRequestId: null }),
  [`${actualMountedKey}:navigation`]: JSON.stringify({ mode: "detail", selectedRequestId: requestId }),
});
assert.equal(
  resolveSalesDraftPreviewResumeStorageKey({
    storage: mismatchStorage,
    userId,
    requestId,
    preferredStorageKey: activeCompanyKey,
  }),
  actualMountedKey,
  "Preview-retur må bruke faktisk åpen Sales-scope når Representerer og profilfirma avviker."
);

const wrongUserKey = "expo-proffdok-sales-preview-requests-v1:expo-proffsenter:other-user";
assert.equal(
  resolveSalesDraftPreviewResumeStorageKey({
    storage: mockStorage({
      [`${wrongUserKey}:navigation`]: JSON.stringify({ mode: "detail", selectedRequestId: requestId }),
    }),
    userId,
    requestId,
  }),
  "",
  "Preview-retur må aldri gjenbruke en annen brukers Sales-navigasjon."
);

const secondMatchingKey = `expo-proffdok-sales-preview-requests-v1:ringside-rorleggerbedrift-as:${userId}`;
assert.equal(
  resolveSalesDraftPreviewResumeStorageKey({
    storage: mockStorage({
      [`${actualMountedKey}:navigation`]: JSON.stringify({ mode: "detail", selectedRequestId: requestId }),
      [`${secondMatchingKey}:navigation`]: JSON.stringify({ mode: "detail", selectedRequestId: requestId }),
    }),
    userId,
    requestId,
  }),
  "",
  "Preview-retur skal feile lukket dersom samme request_ref finnes i flere lokale firmascope."
);

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
