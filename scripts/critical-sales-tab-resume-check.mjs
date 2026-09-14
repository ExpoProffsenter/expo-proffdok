import {
  SALES_BACKGROUND_RESUME_MAX_AGE_MS,
  SALES_RELOAD_NAVIGATION_KEY,
  SALES_RELOAD_TAB_KEY,
  SALES_WORKSPACE_RESUME_KEY,
  clearSalesResumeMarkers,
  clearSalesWorkspaceResumeSnapshot,
  markSalesResumeForBackground,
  markSalesWorkspaceResumeSnapshot,
  readSalesWorkspaceResumeSnapshot,
  restoreSalesWorkspaceNavigation,
  shouldBootstrapRestoreSales,
} from "../src/modules/sales/services/salesResumeRecovery.mjs";

const failures = [];

function requireResume(condition, message) {
  if (!condition) failures.push(message);
}

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    get length() {
      return values.size;
    },
    key(index) {
      return [...values.keys()][index] ?? null;
    },
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
    removeItem(key) {
      values.delete(key);
    },
  };
}

const now = 2_000_000_000_000;
const storageKey = "expo-proffdok:sales:v1:test-company:test-user";
const navigation = {
  mode: "offer-builder",
  selectedRequestId: "F-2026-0066",
};

// 1) Dette er den faktiske integrasjonsveien SalesModule bruker når fanen går
// i bakgrunnen. Den må lagre både gammel reload-markør OG nøyaktig arbeidsbilde.
const localA = memoryStorage({
  [`${storageKey}:navigation`]: JSON.stringify(navigation),
});
const sessionA = memoryStorage();
markSalesResumeForBackground(storageKey, {
  sessionStorage: sessionA,
  localStorage: localA,
  now,
});
const capturedA = readSalesWorkspaceResumeSnapshot({ localStorage: localA, now });
requireResume(
  Boolean(localA.getItem(SALES_WORKSPACE_RESUME_KEY)),
  "Den faktiske background-handleren lagrer ikke arbeidsbilde-snapshot."
);
requireResume(
  capturedA?.storageKey === storageKey &&
    capturedA?.navigation?.mode === navigation.mode &&
    capturedA?.navigation?.selectedRequestId === navigation.selectedRequestId,
  "Den faktiske background-handleren fanger ikke Rediger tilbud + riktig sak."
);

// 2) Foreground/React-cleanup må kunne rydde de korte markørene uten å miste
// arbeidsbildet før den globale resume-vakten har fått kontrollert resultatet.
clearSalesResumeMarkers({
  sessionStorage: sessionA,
  localStorage: localA,
  preserveWorkspace: true,
});
requireResume(
  Boolean(localA.getItem(SALES_WORKSPACE_RESUME_KEY)),
  "Foreground-cleanup sletter arbeidsbilde-snapshotet før recovery er ferdig."
);

// 3) Ved retur skal nøyaktig samme interne mode/sak legges tilbake før Sales åpnes.
const snapshotA = readSalesWorkspaceResumeSnapshot({ localStorage: localA, now });
restoreSalesWorkspaceNavigation(snapshotA, {
  localStorage: localA,
  sessionStorage: sessionA,
});
requireResume(
  localA.getItem(`${storageKey}:navigation`) === JSON.stringify(navigation),
  "Rediger tilbud/saksposisjon gjenopprettes ikke før Sales remountes."
);
requireResume(
  sessionA.getItem(SALES_RELOAD_TAB_KEY) === "1" &&
    sessionA.getItem(SALES_RELOAD_NAVIGATION_KEY) === "1",
  "Sales-tab og intern navigasjon re-armeres ikke før gjenåpning."
);

// 4) Full browserforkasting / mobil dvale skal også kunne bruke snapshotet alene,
// selv om både sessionStorage-markør og ordinær background-marker er borte.
const localB = memoryStorage();
const sessionB = memoryStorage();
markSalesWorkspaceResumeSnapshot(
  { storageKey, navigation },
  { localStorage: localB, now }
);
requireResume(
  shouldBootstrapRestoreSales({
    sessionStorage: sessionB,
    localStorage: localB,
    now,
  }),
  "Bootstrap gjenåpner ikke Sales fra arbeidsbilde-snapshot etter browserforkasting/mobil dvale."
);
requireResume(
  sessionB.getItem(SALES_RELOAD_NAVIGATION_KEY) === "1" &&
    localB.getItem(`${storageKey}:navigation`) === JSON.stringify(navigation),
  "Bootstrap gjenoppretter ikke offer-builder før Sales åpnes."
);

// 5) En gammel markør skal aldri dra brukeren tilbake senere.
const localC = memoryStorage();
markSalesWorkspaceResumeSnapshot(
  { storageKey, navigation },
  {
    localStorage: localC,
    now: now - SALES_BACKGROUND_RESUME_MAX_AGE_MS - 1,
  }
);
requireResume(
  readSalesWorkspaceResumeSnapshot({ localStorage: localC, now }) === null,
  "Utløpt arbeidsbilde-snapshot blir fortsatt brukt."
);
requireResume(
  localC.getItem(SALES_WORKSPACE_RESUME_KEY) === null,
  "Utløpt arbeidsbilde-snapshot blir ikke ryddet."
);

// 6) Snapshot må fortsatt kunne ryddes ved eksplisitt utgang fra Sales, slik at
// en senere bevisst tur til Startsiden ikke gjenoppliver gammel sak.
const localD = memoryStorage();
markSalesWorkspaceResumeSnapshot(
  { storageKey, navigation },
  { localStorage: localD, now }
);
clearSalesWorkspaceResumeSnapshot({ localStorage: localD });
requireResume(
  localD.getItem(SALES_WORKSPACE_RESUME_KEY) === null,
  "Arbeidsbilde-snapshot kan ikke ryddes etter eksplisitt utgang fra Sales."
);

if (failures.length) {
  console.error("\n❌ Expo ProffDok Sales browser-tab resume check FEILET:\n");
  failures.forEach((failure) => console.error(`- ${failure}`));
  console.error("\nBuild stoppes før Vercel deploy.\n");
  process.exit(1);
}

console.log(
  "✅ Expo ProffDok Sales browser-tab resume check OK – Rediger tilbud / befaring / mobil dvale bevares"
);
