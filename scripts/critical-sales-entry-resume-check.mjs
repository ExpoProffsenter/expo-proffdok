import fs from "node:fs";

const failures = [];
const requireCheck = (condition, message) => {
  if (!condition) failures.push(message);
};

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    get length() { return values.size; },
    key(index) { return [...values.keys()][index] ?? null; },
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); },
  };
}

const local = memoryStorage();
const session = memoryStorage();
globalThis.window = { localStorage: local, sessionStorage: session };

const recovery = await import("../src/modules/sales/services/salesResumeRecovery.mjs");
const storage = await import("../src/modules/sales/services/salesLocalStorageCore.js");

const now = Date.now();
const storageKey = "expo-proffdok:sales:v1:ringside:test-user";
const newNavigation = { mode: "new", selectedRequestId: null };
local.setItem(`${storageKey}:navigation`, JSON.stringify(newNavigation));

const loadedNavigation = storage.loadSalesNavigation(storageKey);
requireCheck(
  loadedNavigation.mode === "new" && loadedNavigation.selectedRequestId === null,
  "Ny forespørsel uten request_ref blir fortsatt redusert til sakslisten."
);

const unsavedForm = {
  customer: "Kunde Fra SMS",
  phone: "90000000",
  email: "kunde@example.no",
  address: "Testveien 12",
  postnr: "0001",
  city: "Oslo",
  title: "Modernisering av bad",
  source: "Telefon",
  note: "Ulagret kundeinformasjon",
};
requireCheck(
  storage.saveSalesEntryDraft("new", unsavedForm),
  "Ulagret Ny forespørsel kan ikke mellomlagres lokalt."
);
requireCheck(
  storage.loadSalesEntryDraft("new") === null,
  "Vanlig navigasjon gjenoppliver en gammel entry-kladd uten bakgrunns-recovery."
);

recovery.markSalesWorkspaceResumeSnapshot(
  { storageKey, navigation: newNavigation },
  { localStorage: local, now }
);
const recoveredNew = storage.loadSalesEntryDraft("new");
requireCheck(
  recoveredNew?.form?.customer === unsavedForm.customer &&
    recoveredNew?.form?.address === unsavedForm.address,
  "Ny forespørsel gjenoppretter ikke kunde/adresse etter app-/fanebytte."
);
requireCheck(
  recovery.shouldBootstrapRestoreSales({
    sessionStorage: session,
    localStorage: local,
    now,
  }),
  "Bootstrap gjenåpner ikke Sales når aktivt arbeidsbilde er Ny forespørsel uten request_ref."
);

const editNavigation = { mode: "edit-request", selectedRequestId: "F-2026-0066" };
local.setItem(`${storageKey}:navigation`, JSON.stringify(editNavigation));
storage.loadSalesNavigation(storageKey);
const editedForm = { ...unsavedForm, customer: "Redigert kundenavn" };
requireCheck(
  storage.saveSalesEntryDraft("edit-request", editedForm),
  "Rediger forespørsel kan ikke mellomlagres lokalt."
);
recovery.markSalesWorkspaceResumeSnapshot(
  { storageKey, navigation: editNavigation },
  { localStorage: local, now: now + 500 }
);
const recoveredEdit = storage.loadSalesEntryDraft("edit-request");
requireCheck(
  recoveredEdit?.requestId === "F-2026-0066" &&
    recoveredEdit?.form?.customer === "Redigert kundenavn",
  "Rediger forespørsel gjenopprettes ikke saksspesifikt etter app-/fanebytte."
);

const resumeSource = fs.readFileSync(
  "src/modules/sales/services/salesResumeRecovery.mjs",
  "utf8"
);
const requestFormSource = fs.readFileSync(
  "src/modules/sales/components/SalesRequestForm.jsx",
  "utf8"
);
const storageSource = fs.readFileSync(
  "src/modules/sales/services/salesLocalStorageCore.js",
  "utf8"
);

requireCheck(
  resumeSource.includes('REQUEST_ID_OPTIONAL_MODES = new Set(["new", "new-offer"])') &&
    resumeSource.includes("return { mode, selectedRequestId: null }"),
  "Recovery-kontrakten tillater ikke nye saker uten request_ref."
);
requireCheck(
  requestFormSource.includes("loadSalesEntryDraft") &&
    requestFormSource.includes("saveSalesEntryDraft") &&
    requestFormSource.includes("if (!recoveryApplied) return;"),
  "Kundeskjemaet mangler recovery eller beskyttelse mot tom første-render."
);
requireCheck(
  storageSource.includes('new Set(["new", "new-offer", "edit-request"])') &&
    storageSource.includes("readSalesWorkspaceResumeSnapshot"),
  "Entry-kladd er ikke bundet til eksplisitt Sales recovery-snapshot."
);

if (failures.length) {
  console.error("\n❌ Expo ProffDok Sales entry resume check FEILET:\n");
  failures.forEach((failure) => console.error(`- ${failure}`));
  console.error("\nBuild stoppes før deploy.\n");
  process.exit(1);
}

console.log("✅ Expo ProffDok Sales entry resume check OK – Ny/Rediger forespørsel tåler PC-fanebytte og mobil appbytte uten datatap");
