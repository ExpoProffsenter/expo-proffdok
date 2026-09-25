import { readFileSync } from "node:fs";
import {
  SALES_BACKGROUND_RESUME_KEY,
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
  shouldCancelSalesRecoveryForTrustedInteraction,
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
const recoverySource = readFileSync(
  "src/modules/sales/services/salesResumeRecovery.mjs",
  "utf8"
);

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
    search: "",
  }),
  "Bootstrap gjenåpner ikke Sales fra arbeidsbilde-snapshot etter browserforkasting/mobil dvale."
);
requireResume(
  sessionB.getItem(SALES_RELOAD_NAVIGATION_KEY) === "1" &&
    localB.getItem(`${storageKey}:navigation`) === JSON.stringify(navigation),
  "Bootstrap gjenoppretter ikke offer-builder før Sales åpnes."
);

// 4B) Offentlige kunde-/kontrakts-/portalruter må aldri bli dratt tilbake til
// intern Befaring/Tilbud av gamle/ferske Sales-recovery-markører.
const publicRouteCases = [
  "?publicContract=contract-token&publicOffer=offer-token",
  "?publicOffer=offer-token",
  "?privateDocument=1&path=sales-contracts/test.pdf",
  "?project=demo&role=kunde",
  "?project=demo&access=customer",
  "?project=demo&access=ue",
  "?project=demo&role=underleverandor",
  "?project=demo&role=underleverandør",
  "?project=demo&role=underentreprenør",
];

for (const search of publicRouteCases) {
  const sessionPublic = memoryStorage({
    [SALES_RELOAD_TAB_KEY]: "1",
    [SALES_RELOAD_NAVIGATION_KEY]: "1",
  });
  const localPublic = memoryStorage({
    [SALES_BACKGROUND_RESUME_KEY]: JSON.stringify({
      at: now,
      storageKey,
    }),
    [SALES_WORKSPACE_RESUME_KEY]: JSON.stringify({
      at: now,
      storageKey,
      navigation,
    }),
  });

  requireResume(
    !shouldBootstrapRestoreSales({
      sessionStorage: sessionPublic,
      localStorage: localPublic,
      now,
      search,
    }),
    `Offentlig rute ${search} kan fortsatt trigge intern Sales-recovery i bootstrap.`
  );
}

const internalSession = memoryStorage({ [SALES_RELOAD_TAB_KEY]: "1" });
requireResume(
  shouldBootstrapRestoreSales({
    sessionStorage: internalSession,
    localStorage: memoryStorage(),
    now,
    search: "?salesSupportCompany=test",
  }),
  "Intern app-rute blir feilaktig blokkert av bootstrap-rutesperren."
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

// 7) Recovery må ikke slette snapshotet automatisk like etter første gjenåpning.
// Auth/React kan fortsatt remounte hovedappen etter at Sales først er synlig.
requireResume(
  !recoverySource.includes(
    "clearSalesWorkspaceResumeSnapshot({ localStorage: local });"
  ),
  "Fanereturen rydder fortsatt recovery-snapshotet for tidlig etter første gjenåpning."
);
requireResume(
  recoverySource.includes("20000") && recoverySource.includes("30000"),
  "Fanereturen mangler sen recovery-kontroll dersom auth/React resetter Startsiden forsinket."
);

// 8) APP-REGEL: automatisk recovery skal aldri overstyre en bevisst brukerhandling.
// Dette må gjelde Tilbake/Lagre/Avbryt/meny og øvrige handlinger i hele internappen.
requireResume(
  shouldCancelSalesRecoveryForTrustedInteraction({
    isTrusted: true,
    visibilityState: "visible",
    internalRoute: true,
  }),
  "Ekte brukerinteraksjon i internappen stopper ikke gammel recovery."
);
requireResume(
  !shouldCancelSalesRecoveryForTrustedInteraction({
    isTrusted: false,
    visibilityState: "visible",
    internalRoute: true,
  }),
  "Programmatisk recovery blir feilaktig behandlet som bevisst brukerhandling."
);
requireResume(
  !shouldCancelSalesRecoveryForTrustedInteraction({
    isTrusted: true,
    visibilityState: "hidden",
    internalRoute: true,
  }),
  "Bakgrunnshendelser rydder recovery før fanen faktisk er tilbake."
);
requireResume(
  !shouldCancelSalesRecoveryForTrustedInteraction({
    isTrusted: true,
    visibilityState: "visible",
    internalRoute: false,
  }),
  "Offentlig kunde/UE-visning påvirkes av intern recovery-regel."
);
requireResume(
  recoverySource.includes('document.addEventListener(\n    "pointerdown",\n    cancelRecoveryAfterTrustedAppInteraction') &&
    recoverySource.includes('document.addEventListener(\n    "keydown",\n    cancelRecoveryAfterTrustedAppInteraction'),
  "Global recovery-vakt lytter ikke på både touch/mus og tastaturinteraksjon."
);
requireResume(
  !recoverySource.includes('if (target?.closest(".sales-app")) return;'),
  "Klikk inne i Sales kan fortsatt bli overstyrt av et gammelt recovery-snapshot."
);
requireResume(
  recoverySource.includes("clearSalesResumeMarkers({ preserveWorkspace: false })"),
  "Ekte brukerhandling rydder ikke alle midlertidige recovery-markører før navigasjon."
);

if (failures.length) {
  console.error("\n❌ Expo ProffDok Sales browser-tab resume check FEILET:\n");
  failures.forEach((failure) => console.error(`- ${failure}`));
  console.error("\nBuild stoppes før Vercel deploy.\n");
  process.exit(1);
}

console.log(
  "✅ Expo ProffDok Sales browser-tab resume check OK – fanebytte/dvale gjenopprettes, offentlig rute skjermes, og bevisst brukerhandling vinner"
);
