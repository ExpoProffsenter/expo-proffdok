import { readFileSync } from "node:fs";
import {
  SALES_BACKGROUND_RESUME_KEY,
  SALES_BACKGROUND_RESUME_MAX_AGE_MS,
  SALES_RELOAD_NAVIGATION_KEY,
  SALES_RELOAD_TAB_KEY,
  clearSalesResumeMarkers,
  consumeSalesResumeNavigation,
  markSalesResumeForBackground,
  shouldBootstrapRestoreSales,
} from "../src/modules/sales/services/salesResumeRecovery.mjs";

const failures = [];

function read(path) {
  try {
    return readFileSync(path, "utf8");
  } catch (error) {
    failures.push(`${path}: kunne ikke leses (${error?.message || error})`);
    return "";
  }
}

function requireText(source, needle, message) {
  if (!source.includes(needle)) failures.push(message);
}

function forbidText(source, needle, message) {
  if (source.includes(needle)) failures.push(message);
}

function requireRecovery(condition, message) {
  if (!condition) failures.push(`Sales resume scenario: ${message}`);
}

function memoryStorage(initial = {}, { throwOnSet = false } = {}) {
  const entries = new Map(Object.entries(initial));
  return {
    getItem(key) {
      return entries.has(key) ? entries.get(key) : null;
    },
    setItem(key, value) {
      if (throwOnSet) throw new Error("storage set blocked");
      entries.set(key, String(value));
    },
    removeItem(key) {
      entries.delete(key);
    },
  };
}

const bootstrapPath = "src/bootstrap.jsx";
const salesModulePath = "src/modules/sales/SalesModule.jsx";
const salesResumeRecoveryPath = "src/modules/sales/services/salesResumeRecovery.mjs";
const salesModuleCorePath = "src/modules/sales/SalesModuleCore.jsx";
const offerBuilderPath = "src/modules/sales/components/SalesOfferBuilder.jsx";
const inspectionNotePath = "src/modules/sales/components/SalesInspectionNote.jsx";
const inspectionDraftDbPath = "src/modules/sales/services/salesInspectionDraftDb.js";
const localStoragePath = "src/modules/sales/services/salesLocalStorage.js";
const localStorageCorePath = "src/modules/sales/services/salesLocalStorageCore.js";
const localStorageBasePath = "src/modules/sales/services/salesLocalStorageBase.js";
const salesSupabasePath = "src/modules/sales/services/salesSupabase.js";
const salesSupabaseBasePath = "src/modules/sales/services/salesSupabaseBase.js";
const signaturePath = "src/modules/sales/utils/salesOfferDraftSignature.js";
const offerLogicPath = "src/modules/sales/utils/salesOfferLogic.js";
const helpPath = "src/modules/help/helpTools.js";
const helpCorePath = "src/modules/help/helpToolsCore.js";

const bootstrap = read(bootstrapPath);
const salesModule = read(salesModulePath);
const salesResumeRecovery = read(salesResumeRecoveryPath);
const salesModuleCore = read(salesModuleCorePath);
const offerBuilder = read(offerBuilderPath);
const inspectionNote = read(inspectionNotePath);
const inspectionDraftDb = read(inspectionDraftDbPath);
const localStorage = read(localStoragePath);
const localStorageCore = read(localStorageCorePath);
const localStorageBase = read(localStorageBasePath);
const salesSupabase = read(salesSupabasePath);
const salesSupabaseBase = read(salesSupabaseBasePath);
const signature = read(signaturePath);
const offerLogic = read(offerLogicPath);
const help = read(helpPath);
const helpCore = read(helpCorePath);

if (bootstrap) {
  requireText(bootstrap, "shouldBootstrapRestoreSales", `${bootstrapPath}: bootstrap bruker ikke delt Sales resume-vakt.`);
  requireText(bootstrap, "function restoreSalesTabAfterReload()", `${bootstrapPath}: bootstrap kan ikke gjenåpne salgfanen etter full reload.`);
  requireText(bootstrap, "const shouldRestore = shouldBootstrapRestoreSales();", `${bootstrapPath}: bootstrap vurderer ikke localStorage-fallback før Startsiden velges.`);
  requireText(bootstrap, "document.querySelectorAll('button')", `${bootstrapPath}: salgfanen finnes ikke kontrollert etter at hovedappen er rendret.`);
  requireText(bootstrap, ".trim() === 'Befaring/Tilbud'", `${bootstrapPath}: reload-retur peker ikke eksplisitt på Befaring/Tilbud.`);
  requireText(bootstrap, ".then(() => restoreSalesTabAfterReload())", `${bootstrapPath}: reload-retur kjøres ikke etter lasting av main.`);
}

if (salesResumeRecovery) {
  requireText(salesResumeRecovery, 'expo-proffdok:sales:restore-tab-after-reload', `${salesResumeRecoveryPath}: delt tab-markør mangler.`);
  requireText(salesResumeRecovery, 'expo-proffdok:sales:restore-navigation-after-reload', `${salesResumeRecoveryPath}: delt navigasjonsmarkør mangler.`);
  requireText(salesResumeRecovery, 'expo-proffdok:sales:background-resume-v1', `${salesResumeRecoveryPath}: bakgrunnsmarkør mangler.`);
  requireText(salesResumeRecovery, "2 * 60 * 60 * 1000", `${salesResumeRecoveryPath}: recovery-markør har ikke eksplisitt stale-grense.`);
  requireText(salesResumeRecovery, "markerStorageKey !== String(storageKey).trim()", `${salesResumeRecoveryPath}: Sales-sak valideres ikke mot riktig bruker/firmascope.`);
  requireText(salesResumeRecovery, "safeSet(session, SALES_RELOAD_TAB_KEY, \"1\")", `${salesResumeRecoveryPath}: sessionStorage-markør skrives ikke separat.`);
  requireText(salesResumeRecovery, "safeSet(\n    local,\n    SALES_BACKGROUND_RESUME_KEY", `${salesResumeRecoveryPath}: localStorage-fallback skrives ikke uavhengig av sessionStorage.`);
  requireText(salesResumeRecovery, "if (!shouldRestore) safeRemove(local, SALES_BACKGROUND_RESUME_KEY)", `${salesResumeRecoveryPath}: ugyldig/stale bootstrap-markør ryddes ikke.`);
}

if (salesModule) {
  requireText(salesModule, 'import SalesModuleCore from "./SalesModuleCore.jsx";', `${salesModulePath}: sikkerhets-wrapper rundt SalesModuleCore mangler.`);
  requireText(salesModule, '"expo-proffdok-sales-rehydrate"', `${salesModulePath}: recovery kan ikke remounte bare salgmodulen.`);
  requireText(salesModule, "beginOfferDraftHydrationCycle", `${salesModulePath}: ny salgsmount starter ikke en ny tilbuds-hydration-cycle.`);
  requireText(salesModule, 'window.addEventListener("beforeunload", blockPreHydrationUnloadSave)', `${salesModulePath}: sidegjenlasting sperrer ikke pre-hydration cleanup-save.`);
  requireText(salesModule, 'window.addEventListener("pagehide", blockPreHydrationUnloadSave)', `${salesModulePath}: pagehide sperrer ikke pre-hydration cleanup-save.`);
  requireText(salesModule, 'document.addEventListener("visibilitychange", handleVisibilityChange)', `${salesModulePath}: mobil bakgrunn/dvale markeres ikke før siden kan forkastes.`);
  requireText(salesModule, "protectInspectionDraftNavigation", `${salesModulePath}: reload-vernet for befaringskladd mangler.`);
  requireText(salesModule, 'navigation?.mode === "inspection-note"', `${salesModulePath}: reload direkte i befaringsnotat normaliseres ikke til trygg saksvisning.`);
  requireText(salesModule, 'saveSalesNavigation(\n      salesStorageKey,\n      "detail",', `${salesModulePath}: befaringsreload bevarer ikke valgt sak mens modusen flyttes til detail.`);
  requireText(salesModule, "markSalesResumeForBackground(salesStorageKeyForProps(props))", `${salesModulePath}: unload/pagehide skriver ikke delt Sales resume-state.`);
  requireText(salesModule, "consumeSalesResumeNavigation(salesStorageKeyForProps(props))", `${salesModulePath}: SalesModule bruker ikke samme recovery-state som bootstrap.`);
  requireText(salesModule, "clearSalesResumeMarkers();", `${salesModulePath}: recovery-markører kan ikke ryddes ved bevisst navigasjon.`);
  requireText(salesModule, "Bevisst navigasjon bort fra Sales skal aldri gjenopplive en gammel sak.", `${salesModulePath}: eksplisitt utgang fra Sales er ikke beskyttet mot gammel markør.`);
  requireText(salesModule, 'props.integrationMode !== "app"', `${salesModulePath}: offentlig/standalone salg kan feilaktig markere intern salgfaneretning.`);
  requireText(salesModule, "markSalesTabForReload(props)", `${salesModulePath}: unload/pagehide setter ikke reload-markøren.`);
}

// FASE 42F: reelle scenario-invarianter. Disse kjøres i hver build og låser
// akkurat regresjonen som sendte brukeren til Startsiden etter dvale/appbytte.
{
  const now = 2_000_000_000_000;
  const storageKey = "expo-proffdok:sales:v1:app:test-company:test-user";

  // A: sessionStorage mangler, men fersk localStorage-markør skal få bootstrap
  // inn i Sales og SalesModule skal deretter kunne konsumere samme sak/scope.
  const sessionA = memoryStorage();
  const localA = memoryStorage({
    [SALES_BACKGROUND_RESUME_KEY]: JSON.stringify({ at: now - 5_000, storageKey }),
  });
  requireRecovery(
    shouldBootstrapRestoreSales({ sessionStorage: sessionA, localStorage: localA, now }),
    "A: bootstrap åpner ikke Sales fra gyldig localStorage når sessionStorage mangler."
  );
  requireRecovery(
    consumeSalesResumeNavigation(storageKey, { sessionStorage: sessionA, localStorage: localA, now }),
    "A: SalesModule gjenoppretter ikke navigasjonen fra samme localStorage-markør."
  );

  // B: begge lagre finnes. Én recovery skal konsumeres én gang uten konflikt.
  const sessionB = memoryStorage();
  const localB = memoryStorage();
  markSalesResumeForBackground(storageKey, {
    sessionStorage: sessionB,
    localStorage: localB,
    now,
  });
  requireRecovery(
    sessionB.getItem(SALES_RELOAD_TAB_KEY) === "1" &&
      sessionB.getItem(SALES_RELOAD_NAVIGATION_KEY) === "1" &&
      Boolean(localB.getItem(SALES_BACKGROUND_RESUME_KEY)),
    "B: sessionStorage og localStorage får ikke samme recovery-intensjon."
  );
  requireRecovery(
    shouldBootstrapRestoreSales({ sessionStorage: sessionB, localStorage: localB, now }),
    "B: bootstrap avviser recovery når begge markører finnes."
  );
  requireRecovery(
    consumeSalesResumeNavigation(storageKey, { sessionStorage: sessionB, localStorage: localB, now }),
    "B: SalesModule kan ikke konsumere recovery når begge markører finnes."
  );
  requireRecovery(
    !consumeSalesResumeNavigation(storageKey, { sessionStorage: sessionB, localStorage: localB, now }),
    "B: samme recovery kan konsumeres flere ganger og kan lage navigasjonsloop."
  );

  // C: eksplisitt utgang til Startside rydder markørene og skal ikke tvinge
  // brukeren tilbake til en gammel Sales-sak.
  const sessionC = memoryStorage();
  const localC = memoryStorage();
  markSalesResumeForBackground(storageKey, {
    sessionStorage: sessionC,
    localStorage: localC,
    now,
  });
  clearSalesResumeMarkers({ sessionStorage: sessionC, localStorage: localC });
  requireRecovery(
    !shouldBootstrapRestoreSales({ sessionStorage: sessionC, localStorage: localC, now }),
    "C: ryddet/bevisst Startside kan fortsatt bli tvunget tilbake til Sales."
  );

  // D: gammel markør skal verken åpne Sales eller bli liggende og trigge senere.
  const sessionD = memoryStorage();
  const localD = memoryStorage({
    [SALES_BACKGROUND_RESUME_KEY]: JSON.stringify({
      at: now - SALES_BACKGROUND_RESUME_MAX_AGE_MS - 1,
      storageKey,
    }),
  });
  requireRecovery(
    !shouldBootstrapRestoreSales({ sessionStorage: sessionD, localStorage: localD, now }),
    "D: stale markør åpner gammel Sales-økt."
  );
  requireRecovery(
    localD.getItem(SALES_BACKGROUND_RESUME_KEY) === null,
    "D: stale markør blir liggende etter bootstrap-kontroll."
  );

  // E: mobil/browser kan blokkere ett web storage-lager. localStorage-fallback
  // må fortsatt skrives selv om sessionStorage.setItem kaster.
  const sessionE = memoryStorage({}, { throwOnSet: true });
  const localE = memoryStorage();
  markSalesResumeForBackground(storageKey, {
    sessionStorage: sessionE,
    localStorage: localE,
    now,
  });
  requireRecovery(
    Boolean(localE.getItem(SALES_BACKGROUND_RESUME_KEY)),
    "E: sessionStorage-feil hindrer localStorage-markør før browserforkasting."
  );
  requireRecovery(
    shouldBootstrapRestoreSales({ sessionStorage: sessionE, localStorage: localE, now }),
    "E: bootstrap kan ikke gjenopprette etter sessionStorage-feil."
  );
}

if (salesModuleCore) {
  requireText(salesModuleCore, "export default function SalesModule(", `${salesModuleCorePath}: eksisterende SalesModule-kjerne mangler.`);
}

if (offerBuilder) {
  forbidText(offerBuilder, "window.location.reload()", `${offerBuilderPath}: tilbudsrecovery laster hele ProffDok på nytt og kan sende brukeren til Startsiden.`);
  requireText(offerBuilder, "installRecoveryTransitionGuard", `${offerBuilderPath}: overgangssperre mot gammel cleanup mangler.`);
  requireText(offerBuilder, "rememberRecoveredLocalChoiceAgainstServer", `${offerBuilderPath}: gjenopprettet lokal kopi kan utløse samme serverkonflikt på nytt.`);
  requireText(offerBuilder, 'new CustomEvent("expo-proffdok-sales-rehydrate"', `${offerBuilderPath}: recovery remounter ikke salgmodulen kontrollert.`);
  requireText(offerBuilder, 'window.addEventListener("offline", refreshNetworkStatus)', `${offerBuilderPath}: tilbudsbyggeren følger ikke faktisk offline-status.`);
  requireText(offerBuilder, 'text: "✓ Lagret på server."', `${offerBuilderPath}: bekreftet serverstatus vises ikke eksplisitt.`);
  requireText(offerBuilder, 'text: "⚠ Lagret lokalt – venter på server."', `${offerBuilderPath}: lokal/offline-status vises ikke eksplisitt.`);
  requireText(offerBuilder, 'text: "⚠ Lagret lokalt – serveren er ikke tilgjengelig. Endringene beholdes på denne enheten."', `${offerBuilderPath}: serverfeil kan igjen gi falsk trygghet om lagring.`);
}

if (inspectionDraftDb) {
  requireText(inspectionDraftDb, 'const DB_NAME = "expo-proffdok-sales-drafts";', `${inspectionDraftDbPath}: egen lokal database for befaringsbilder mangler.`);
  requireText(inspectionDraftDb, 'const STORE_NAME = "inspectionPhotos";', `${inspectionDraftDbPath}: IndexedDB-store for befaringsbilder mangler.`);
  requireText(inspectionDraftDb, 'indexedDb.open(DB_NAME, DB_VERSION)', `${inspectionDraftDbPath}: befaringsbilder åpner ikke IndexedDB.`);
  requireText(inspectionDraftDb, 'store.createIndex(SCOPE_INDEX, "scope"', `${inspectionDraftDbPath}: lokale bilder er ikke scopet per bruker/sak.`);
  requireText(inspectionDraftDb, "blob,", `${inspectionDraftDbPath}: binær bildefil lagres ikke i IndexedDB.`);
  requireText(inspectionDraftDb, "export async function saveInspectionPhotoBlob", `${inspectionDraftDbPath}: lokal-first bildelagring mangler.`);
  requireText(inspectionDraftDb, "export async function listInspectionPhotoBlobs", `${inspectionDraftDbPath}: lokale bilder kan ikke gjenopprettes.`);
  requireText(inspectionDraftDb, "navigator.storage.persist", `${inspectionDraftDbPath}: nettleserens persistente lagring forsøkes ikke når tilgjengelig.`);
}

if (inspectionNote) {
  requireText(inspectionNote, 'from "../services/salesInspectionDraftDb.js";', `${inspectionNotePath}: befaringsskjema bruker ikke IndexedDB-sikkerhetslageret.`);
  requireText(inspectionNote, "await saveInspectionPhotoBlob({", `${inspectionNotePath}: valgt bilde sikres ikke lokalt før det tas inn i skjemaet.`);
  requireText(inspectionNote, "await listInspectionPhotoBlobs(requestId)", `${inspectionNotePath}: lokalt sikrede bilder gjenopprettes ikke ved ny åpning.`);
  requireText(inspectionNote, "localDraftKey: record.key", `${inspectionNotePath}: lokalt sikret bilde merkes ikke med varig lokal nøkkel.`);
  requireText(inspectionNote, "await removeInspectionPhotoBlobByKey(photo.localDraftKey)", `${inspectionNotePath}: fjernede bilder blir liggende og kan gjenoppstå fra IndexedDB.`);
  requireText(inspectionNote, "Lokalt sikrede bilder beholdes på denne enheten", `${inspectionNotePath}: brukeren får ikke korrekt varsel om lokal vs serverlagring.`);
  requireText(inspectionNote, "Sikrer {photoReadCount} bilde(r) på denne enheten", `${inspectionNotePath}: lokal sikringsstatus er ikke synlig under bildevalg.`);
  forbidText(inspectionNote, "reader.readAsDataURL(file)", `${inspectionNotePath}: nye mobilbilder går fortsatt via stor DataURL før lokal sikkerhetslagring.`);
}

if (localStorage) {
  requireText(localStorage, "if (requestId && hasPendingOfferDraftRecovery(requestId))", `${localStoragePath}: lokal autosave er ikke sperret mens recovery er uavklart.`);
  requireText(localStorage, "const AUDIT_LIMIT = 20;", `${localStoragePath}: tilbudsrecovery beholder ikke 20 lokale revisjoner.`);
  requireText(localStorage, 'const AUDIT_SUFFIX = ":audit-v2";', `${localStoragePath}: separat revisjonshistorikk for tilbud mangler.`);
  requireText(localStorage, "appendAuditSnapshot(stableKey, clean)", `${localStoragePath}: reelle tilbudsendringer tas ikke inn i revisjonshistorikken.`);
  requireText(localStorage, 'line.lineType === "administration"', `${localStoragePath}: ubrukt administrasjonsrad skilles ikke fra reell tilbudslinje.`);
  requireText(localStorage, "pruneEmptyOfferDraftRows", `${localStoragePath}: tomme tilbudsrader filtreres ikke før lokal lagring.`);
  requireText(localStorage, "export function beginOfferDraftHydrationCycle()", `${localStoragePath}: hydration-cycle kan ikke nullstilles ved ny mount/remount.`);
  requireText(localStorage, "isOfferDraftHydratedForCurrentCycle", `${localStoragePath}: aktuell tilbudssak har ingen eksplisitt hydration-status.`);
  requireText(localStorage, "if (requestId && !isOfferDraftHydratedForCurrentCycle(requestId))", `${localStoragePath}: pre-hydration autosave/cleanup er ikke blokkert.`);
  requireText(localStorage, "hasMeaningfulKnownOfferDraft(requestId, stableKey)", `${localStoragePath}: eksisterende meningsfull kladd beskytter ikke mot tom initialform.`);
  requireText(localStorage, "scheduleOfferDraftHydrated(requestId)", `${localStoragePath}: loadOfferDraft markerer ikke saken som hydrert etter innlasting.`);
}

if (localStorageCore) {
  requireText(localStorageCore, 'export * from "./salesLocalStorageBase.js";', `${localStorageCorePath}: falsk-konflikt-wrapper mangler.`);
  requireText(localStorageCore, "createOfferDraftContentSignature", `${localStorageCorePath}: lokal kladd sammenlignes ikke innholdsbasert med server.`);
  requireText(localStorageCore, "serverSignature !== localSignature", `${localStorageCorePath}: identisk lokal/server-kladd kan igjen utløse recovery.`);
}

if (localStorageBase) {
  requireText(localStorageBase, "export function loadOfferDraft", `${localStorageBasePath}: eksisterende recovery-kjerne mangler.`);
}

if (salesSupabase) {
  requireText(salesSupabase, 'export * from "./salesSupabaseBase.js";', `${salesSupabasePath}: serverbaseline-wrapper mangler.`);
  requireText(salesSupabase, "offerDraftSignature", `${salesSupabasePath}: bekreftet serverbaseline mangler innholdsfingeravtrykk.`);
  requireText(salesSupabase, "rememberOfferContentSignatures", `${salesSupabasePath}: serverfingeravtrykk registreres ikke etter fetch/upsert.`);
}

if (salesSupabaseBase) {
  requireText(salesSupabaseBase, "export async function fetchSalesRequests", `${salesSupabaseBasePath}: eksisterende Supabase-kjerne mangler.`);
}

if (signature) {
  requireText(signature, "createOfferDraftContentSignature", `${signaturePath}: tilbudsfingeravtrykk mangler.`);
  requireText(signature, "canonicalize", `${signaturePath}: fingeravtrykket er ikke stabilt mot objektrekkefølge.`);
  requireText(signature, "buildOfferFormForSignatureFromRequest", `${signaturePath}: serverpayload kan ikke normaliseres til tilbudsform.`);
}

if (offerLogic) {
  requireText(offerLogic, "pruneEmptyOfferDraftRows(formValue)", `${offerLogicPath}: tomme tilbudsrader filtreres ikke før server-autosave.`);
  requireText(offerLogic, "prepareOfferFormForSaveCore(pruneEmptyOfferDraftRows(formValue))", `${offerLogicPath}: ubrukt administrasjonsrad kan igjen blokkere Lagre tilbud.`);
}

if (help) {
  requireText(help, 'Nytt i denne versjonen – tilbudssikkerhet', `${helpPath}: Hjelp mangler versjonsinformasjon om tilbudssikkerhet.`);
  requireText(help, '✓ Lagret på server betyr at siste kladd er bekreftet lagret på server.', `${helpPath}: Hjelp forklarer ikke bekreftet serverlagring.`);
  requireText(help, '⚠ Lagret lokalt – venter på server betyr at endringene er sikret på denne enheten', `${helpPath}: Hjelp forklarer ikke lokal/offline-lagring.`);
  requireText(help, 'Hvis Expo ProffDok finner en nyere lokal kladd enn serverversjonen', `${helpPath}: Hjelp forklarer ikke recovery-valget.`);
  requireText(help, 'Fortsett på tilbud', `${helpPath}: Hjelp beskriver ikke videreføring av eksisterende tilbud.`);
  requireText(help, 'En tom startkladd får ikke overskrive et eksisterende tilbud før den aktuelle saken er ferdig lastet inn.', `${helpPath}: Hjelp beskriver ikke hydration-sperren mot tom startkladd.`);
  requireText(help, 'Nye befaringsbilder sikres først lokalt på enheten før de vises i befaringsnotatet.', `${helpPath}: Hjelp beskriver ikke lokal-first sikring av befaringsbilder.`);
  requireText(help, 'Befaringsbildene lastes fortsatt til server når du trykker Lagre befaringsnotat.', `${helpPath}: Hjelp skiller ikke lokal bildesikring fra serverlagring.`);
  requireText(help, 'Ved full reload fra Befaring/Tilbud åpner appen salgfanen og aktuell sak igjen.', `${helpPath}: Hjelp beskriver ikke automatisk retur til salgfanen etter reload.`);
}

if (helpCore) {
  requireText(helpCore, "export function createHelpCenter", `${helpCorePath}: eksisterende brukerveiledning mangler etter Help-wrapper.`);
}

if (failures.length) {
  console.error("\n❌ Expo ProffDok sales recovery check FEILET:\n");
  failures.forEach((failure) => console.error(`- ${failure}`));
  console.error("\nBuild stoppes før Vercel deploy.\n");
  process.exit(1);
}

console.log("✅ Expo ProffDok sales recovery check OK");
