import fs from "node:fs";
import assert from "node:assert/strict";
import {
  buildSalesStorageScopedProfile,
  resolveSalesStorageCompanyName,
} from "../src/modules/sales/services/salesWorkProfileStorageScope.mjs";

const preview = fs.readFileSync("src/modules/sales/components/SalesDraftCustomerPreview.jsx", "utf8");
const entry = fs.readFileSync("src/modules/sales/SalesPreview.jsx", "utf8");
const detail = fs.readFileSync("src/modules/sales/components/SalesDetailView.jsx", "utf8");
const salesModule = fs.readFileSync("src/modules/sales/SalesModule.jsx", "utf8");
const customerCore = fs.readFileSync("src/modules/sales/components/SalesCustomerViewCore.jsx", "utf8");
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
assert(
  !entry.includes('import SalesModule from "./SalesModule"') &&
    !entry.includes('import SalesModule from "./SalesModule.jsx"'),
  "Kundepreview skal ikke statisk importere intern Sales/recovery-runtime."
);
assert(
  entry.includes('import("./SalesModule.jsx")'),
  "Vanlig utviklingspreview må fortsatt kunne lazy-laste SalesModule."
);
assert(
  entry.indexOf("if (offerPreview)") >= 0 &&
    entry.indexOf("if (offerPreview)") < entry.indexOf('import("./SalesModule.jsx")'),
  "offerPreview må avgjøres før intern SalesModule lastes."
);

assert(detail.includes("Forhåndsvis som kunde"), "Tilbudssaken mangler forhåndsvisningsknapp.");
assert(detail.includes("/sales-preview.html"), "Forhåndsvisningsknappen må bruke isolert preview-side.");
assert(detail.includes('"_blank"'), "Kundepreview skal åpnes i egen fane.");
assert(detail.includes("data-internal-product-number"), "Intern tilbudsvisning skal kunne vise varenummer.");
assert(!customerCore.includes("supplierProductNumber"), "Kundens tilbud skal ikke vise eller bruke leverandørvarenummer i presentasjonen.");
assert(!customerCore.includes("internalProductNumber"), "Kundens tilbud skal ikke vise internt varenummer i presentasjonen.");
assert(!customerCore.includes("Varenr."), "Kundens tilbud skal aldri ha varenummer-label.");

// Rotkontrakt: lokal Sales-cache/recovery skal følge aktivt Representerer i app,
// men vanlige brukere og preview/public skal beholde eksisterende profilfallback.
const primaryProfile = {
  company_name: "Expo Proffsenter",
  full_name: "Demo Systemadmin",
};
const bademiljoState = {
  active_company_profile: { companyName: "Bademiljø Expo" },
};
const ringsideState = {
  active_company_profile: { company_name: "Ringside Rørleggerbedrift AS" },
};

assert.equal(
  resolveSalesStorageCompanyName({
    integrationMode: "app",
    profile: primaryProfile,
    workProfileState: bademiljoState,
  }),
  "Bademiljø Expo",
  "Systemadmin Sales-storage følger ikke aktivt Bademiljø-representasjon."
);
assert.equal(
  resolveSalesStorageCompanyName({
    integrationMode: "app",
    profile: primaryProfile,
    workProfileState: ringsideState,
  }),
  "Ringside Rørleggerbedrift AS",
  "Systemadmin Sales-storage følger ikke aktiv Ringside-representasjon."
);
assert.equal(
  resolveSalesStorageCompanyName({
    integrationMode: "app",
    profile: primaryProfile,
    workProfileState: {},
  }),
  "Expo Proffsenter",
  "Vanlig bruker/fallback skal fortsatt bruke profilfirma."
);
assert.equal(
  resolveSalesStorageCompanyName({
    integrationMode: "preview",
    profile: primaryProfile,
    workProfileState: bademiljoState,
  }),
  "Expo Proffsenter",
  "Preview/public må ikke overstyres av intern Representerer-state."
);

const scopedProfile = buildSalesStorageScopedProfile(
  primaryProfile,
  "Bademiljø Expo"
);
assert.equal(scopedProfile.company_name, "Bademiljø Expo");
assert.equal(scopedProfile.companyName, "Bademiljø Expo");
assert.equal(
  scopedProfile.full_name,
  primaryProfile.full_name,
  "Storage-scope må ikke endre øvrige brukerprofilfelt."
);

for (const required of [
  "WORK_PROFILE_EVENT",
  "readCachedWorkProfileState",
  "resolveSalesStorageCompanyName",
  "buildSalesStorageScopedProfile",
  "salesStorageCompanyName",
  "markSalesTabForReload(props)",
  "salesStorageKeyForProps(props, salesStorageCompanyName)",
  "clearSalesResumeMarkers({ preserveWorkspace: false })",
  "profile={coreProfile}",
]) {
  assert(salesModule.includes(required), `Sales work-profile storage-kontrakt mangler: ${required}`);
}

assert(
  salesModule.includes("markSalesResumeForBackground(salesStorageKeyForProps(props))") &&
    salesModule.includes("consumeSalesResumeNavigation(salesStorageKeyForProps(props))"),
  "Eksisterende og gjennomtestet Sales recovery-kallkontrakt skal beholdes mens scope-resolveren endres."
);
assert(
  !fs.existsSync("src/modules/sales/salesDraftPreviewReturnGuard.js") &&
    !fs.existsSync("src/modules/sales/services/salesDraftPreviewResume.mjs"),
  "Gamle preview-spesialplaster skal være fjernet etter rotfixen."
);
assert(
  !indexHtml.includes("installSalesDraftPreviewReturnGuard"),
  "App-entry skal ikke installere den gamle preview-returvakten."
);
assert(
  !indexHtml.includes("installSalesNavigationContractUx") &&
    !packageJson.includes("critical-sales-navigation-contract-check.mjs"),
  "Den brede, supersederte navigasjonsvakten må ikke være aktiv eller del av build-kjeden."
);
assert(
  packageJson.includes("critical-customer-draft-preview-check.mjs"),
  "Kundepreview/work-profile-regresjonen må være del av critical/build."
);

console.log("critical-customer-draft-preview-check: OK – preview isolert og Sales-storage følger aktivt Representerer");
