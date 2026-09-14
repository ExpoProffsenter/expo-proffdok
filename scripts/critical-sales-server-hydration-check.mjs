import { readFileSync } from "node:fs";
import {
  buildServerInspectionForm,
  clearStructurallyEmptyInspectionDraftsForServerRows,
  hasMeaningfulInspectionContent,
  mapSalesServerRowsToRequests,
  mergeSalesServerRowsIntoCache,
  shouldGateSalesCoreUntilServerCache,
} from "../src/modules/sales/services/salesServerCacheHydration.mjs";

const failures = [];

function requireCondition(condition, message) {
  if (!condition) failures.push(message);
}

function requireText(source, needle, message) {
  if (!source.includes(needle)) failures.push(message);
}

function memoryStorage(initial = {}) {
  const entries = new Map(Object.entries(initial));
  return {
    get length() {
      return entries.size;
    },
    key(index) {
      return [...entries.keys()][index] ?? null;
    },
    getItem(key) {
      return entries.has(key) ? entries.get(key) : null;
    },
    setItem(key, value) {
      entries.set(key, String(value));
    },
    removeItem(key) {
      entries.delete(key);
    },
  };
}

const wrapperPath = "src/modules/sales/SalesModule.jsx";
const wrapper = readFileSync(wrapperPath, "utf8");

const serverRow = {
  request_ref: "F-2026-0043",
  payload: {
    customer: "Test Demo",
    inspectionCustomerWishes:
      "Kunden ønsker et moderne bad med storformat fliser og nytt utstyr.",
    inspectionExistingConditions:
      "Eksisterende bad fra 60-tallet med slitt innredning.",
    inspectionMeasurements: "Rommet måler 3x2 meter.",
    inspectionObservations:
      "Sluket må flyttes. Vindu bør byttes og slagretning på dør vurderes.",
    inspectionPhotos: Array.from({ length: 4 }, (_, index) => ({
      id: `photo-${index + 1}`,
      path: `demo/photo-${index + 1}.jpg`,
    })),
    offerTitle: "Tilbud – Modernisering av bad",
    offerLines: Array.from({ length: 15 }, (_, index) => ({
      id: `line-${index + 1}`,
      description: `Linje ${index + 1}`,
      amount: "1000",
    })),
    offerOptions: Array.from({ length: 4 }, (_, index) => ({
      id: `option-${index + 1}`,
      title: `Opsjon ${index + 1}`,
      amount: "100",
    })),
  },
};

const mapped = mapSalesServerRowsToRequests([serverRow]);
requireCondition(mapped.length === 1, "Serverhydrering: serverrad ble ikke mappet til én Sales-sak.");
requireCondition(mapped[0]?.id === "F-2026-0043", "Serverhydrering: request_ref ble ikke bevart.");
requireCondition(mapped[0]?.offerLines?.length === 15, "Serverhydrering: 15 serverlinjer ble ikke bevart.");
requireCondition(mapped[0]?.offerOptions?.length === 4, "Serverhydrering: 4 serveropsjoner ble ikke bevart.");

const merged = mergeSalesServerRowsIntoCache(
  [serverRow],
  [
    {
      id: "F-2026-0043",
      customer: "Stale cache",
      offerLines: [],
      offerOptions: [],
    },
    {
      id: "LOCAL-ONLY-1",
      customer: "Ikke synkronisert ennå",
    },
  ]
);

const authoritative = merged.find((request) => request.id === "F-2026-0043");
requireCondition(
  authoritative?.offerLines?.length === 15 && authoritative?.offerOptions?.length === 4,
  "Serverhydrering: stale lokal cache kan fortsatt overstyre serverens eksisterende tilbud."
);
requireCondition(
  merged.some((request) => request.id === "LOCAL-ONLY-1"),
  "Serverhydrering: lokal-only sak ble kastet før den kan synkroniseres."
);

const serverInspectionForm = buildServerInspectionForm(mapped[0]);
requireCondition(
  hasMeaningfulInspectionContent(serverInspectionForm) &&
    serverInspectionForm.photos.length === 4,
  "Serverhydrering: serverens befaringsnotat/bilder ble ikke gjenkjent som meningsfullt innhold."
);

const emptyInspectionKey =
  "expo-proffdok:sales:v1:test:user:inspection-draft:F-2026-0043";
const emptyInspectionStorage = memoryStorage({
  [emptyInspectionKey]: JSON.stringify({
    form: {
      customerWishes: "",
      existingConditions: "",
      measurements: "",
      observations: "",
      photos: [],
    },
    savedAt: "2026-09-14T19:00:00.000Z",
  }),
});
const clearedEmptyDrafts = clearStructurallyEmptyInspectionDraftsForServerRows(
  [serverRow],
  emptyInspectionStorage
);
requireCondition(
  clearedEmptyDrafts.includes(emptyInspectionKey) &&
    emptyInspectionStorage.getItem(emptyInspectionKey) === null,
  "Serverhydrering: tom lokal befaringskladd kan fortsatt skjule serverens eksisterende notat."
);

const meaningfulInspectionStorage = memoryStorage({
  [emptyInspectionKey]: JSON.stringify({
    form: {
      customerWishes: "Ny lokal endring som ikke er lagret på server ennå",
      existingConditions: "",
      measurements: "",
      observations: "",
      photos: [],
    },
    savedAt: "2026-09-14T19:05:00.000Z",
  }),
});
clearStructurallyEmptyInspectionDraftsForServerRows(
  [serverRow],
  meaningfulInspectionStorage
);
requireCondition(
  Boolean(meaningfulInspectionStorage.getItem(emptyInspectionKey)),
  "Serverhydrering: meningsfull lokal befaringskladd ble feilaktig slettet."
);

const noServerInspectionRow = {
  request_ref: "F-EMPTY",
  payload: { customer: "Ny befaring uten notat" },
};
const freshEmptyKey =
  "expo-proffdok:sales:v1:test:user:inspection-draft:F-EMPTY";
const freshEmptyStorage = memoryStorage({
  [freshEmptyKey]: JSON.stringify({
    form: {
      customerWishes: "",
      existingConditions: "",
      measurements: "",
      observations: "",
      photos: [],
    },
  }),
});
clearStructurallyEmptyInspectionDraftsForServerRows(
  [noServerInspectionRow],
  freshEmptyStorage
);
requireCondition(
  Boolean(freshEmptyStorage.getItem(freshEmptyKey)),
  "Serverhydrering: tom kladd for en faktisk ny befaring ble feilaktig slettet."
);

requireCondition(
  shouldGateSalesCoreUntilServerCache({
    integrationMode: "app",
    authUserId: "user-1",
    serverCacheReady: false,
  }),
  "Serverhydrering: app-modus kan mounte SalesCore før servercache er klar."
);
requireCondition(
  !shouldGateSalesCoreUntilServerCache({
    integrationMode: "app",
    authUserId: "user-1",
    serverCacheReady: true,
  }),
  "Serverhydrering: SalesCore forblir blokkert etter bekreftet servercache."
);
requireCondition(
  !shouldGateSalesCoreUntilServerCache({
    integrationMode: "preview",
    authUserId: "",
    serverCacheReady: false,
  }),
  "Serverhydrering: standalone preview ble feilaktig gjort avhengig av Supabase-gate."
);

requireText(
  wrapper,
  "primeSalesServerCacheBeforeCore",
  `${wrapperPath}: wrapperen primer ikke servercache før SalesModuleCore.`
);
requireText(
  wrapper,
  "mergeSalesServerRowsIntoCache",
  `${wrapperPath}: serverdata erstatter ikke stale cache kontrollert.`
);
requireText(
  wrapper,
  "shouldGateSalesCoreUntilServerCache",
  `${wrapperPath}: SalesModuleCore mangler eksplisitt serverhydrering-gate.`
);
requireText(
  wrapper,
  "Henter siste lagrede salgssaker",
  `${wrapperPath}: bruker får ingen trygg ventestatus mens serverdata hentes.`
);

if (failures.length) {
  console.error("❌ Expo ProffDok Sales server hydration check feilet:");
  failures.forEach((failure) => console.error(` - ${failure}`));
  process.exit(1);
}

console.log(
  "✅ Expo ProffDok Sales server hydration check OK – ny nettleser/stale cache må laste tilbud og befaringsnotat fra server før editor mountes"
);
