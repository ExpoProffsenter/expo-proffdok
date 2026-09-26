import fs from "node:fs";
import assert from "node:assert/strict";
import {
  getSalesBackReturnTarget,
  salesNavigationWasLost,
  shouldRestoreSalesExternalReturn,
} from "../src/modules/sales/utils/salesNavigationContract.mjs";

const ux = fs.readFileSync(
  "src/modules/sales/salesNavigationContractUx.js",
  "utf8"
);
const indexHtml = fs.readFileSync("index.html", "utf8");
const salesCore = fs.readFileSync("src/modules/sales/SalesModuleCore.jsx", "utf8");

// Ren kontrakt: detail -> liste er en eksplisitt normalhandling og skal aldri
// fanges av sikkerhetslaget.
assert.equal(
  getSalesBackReturnTarget({
    navigation: { mode: "detail", selectedRequestId: "F-1" },
    label: "Tilbake",
  }),
  null,
  "Normal detail -> liste må forbli tillatt."
);

for (const childMode of [
  "edit-request",
  "survey-plan",
  "inspection-note",
  "project-activation",
]) {
  assert.deepEqual(
    getSalesBackReturnTarget({
      navigation: { mode: childMode, selectedRequestId: "F-1" },
      label: "Tilbake",
    }),
    { mode: "detail", selectedRequestId: "F-1" },
    `${childMode} må returnere til samme saks detail dersom navigasjonen mistes.`
  );
}

assert.deepEqual(
  getSalesBackReturnTarget({
    navigation: { mode: "offer-builder", selectedRequestId: "F-1" },
    label: "Tilbake til redigering",
  }),
  { mode: "offer-builder", selectedRequestId: "F-1" },
  "Lokal kundepreview må returnere til samme tilbudsbygger."
);

assert.equal(salesNavigationWasLost(null), true);
assert.equal(
  salesNavigationWasLost({ mode: "list", selectedRequestId: null }),
  true
);
assert.equal(
  salesNavigationWasLost({ mode: "detail", selectedRequestId: "F-1" }),
  false
);
assert.equal(
  salesNavigationWasLost({ mode: "offer-builder", selectedRequestId: "F-1" }),
  false
);

assert.equal(
  shouldRestoreSalesExternalReturn({
    currentNavigation: { mode: "list", selectedRequestId: null },
    expectedNavigation: { mode: "offer-builder", selectedRequestId: "F-1" },
    sameScope: true,
  }),
  true,
  "Retur fra kundepreview må reparere tapt Sales-sak."
);
assert.equal(
  shouldRestoreSalesExternalReturn({
    currentNavigation: { mode: "detail", selectedRequestId: "F-2" },
    expectedNavigation: { mode: "offer-builder", selectedRequestId: "F-1" },
    sameScope: true,
  }),
  false,
  "Eksplisitt videre navigasjon må vinne over preview-retur."
);
assert.equal(
  shouldRestoreSalesExternalReturn({
    currentNavigation: { mode: "list", selectedRequestId: null },
    expectedNavigation: { mode: "offer-builder", selectedRequestId: "F-1" },
    sameScope: false,
  }),
  false,
  "Navigasjon må aldri gjenopprettes på tvers av firmascopet."
);

for (const needle of [
  'params.get("publicOffer")',
  'params.get("offerPreview")',
  'params.get("publicContract")',
  '"se kundens tilbud"',
  '"forhåndsvis som kunde"',
  '"forhåndsvis kundetilbud"',
  'salesNavigationWasLost(now)',
  'expected.storageKey === activeStorageKey',
  'window.addEventListener("focus", restoreExternalPreviewReturnOnFocus)',
  'window.addEventListener("pageshow", restoreExternalPreviewReturnOnFocus)',
  'window.addEventListener(WORK_PROFILE_EVENT',
  'new CustomEvent("expo-proffdok-sales-rehydrate"',
]) {
  assert(ux.includes(needle), `Sales navigasjonskontrakt mangler: ${needle}`);
}

assert(
  !ux.includes("window.open ="),
  "Navigasjonskontrakten skal aldri monkey-patche global window.open."
);
assert(
  !ux.includes("history.back("),
  "Navigasjonskontrakten skal ikke styre nettleserhistorikken globalt."
);
assert(
  salesCore.includes('if (isPublicOfferView) return;'),
  "Offentlig kundevisning må fortsatt være sperret fra å overskrive intern Sales-navigasjon."
);
assert(
  salesCore.includes('function goToList()') &&
    salesCore.includes('setSelectedRequestId(null);'),
  "Eksplisitt detail -> oversikt skal fortsatt eie nullstilling av valgt sak."
);

// Aktiveringsasserten blir sann først når index er koblet til kontrakten. Guard-en
// ligger i critical/build og vil dermed stoppe enhver delvis senere endring.
assert(
  indexHtml.includes("installSalesNavigationContractUx"),
  "Sales navigasjonskontrakten må installeres fra app-entry."
);

console.log("critical-sales-navigation-contract-check: OK");
