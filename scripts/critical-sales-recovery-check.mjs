import { readFileSync } from "node:fs";

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

const salesModulePath = "src/modules/sales/SalesModule.jsx";
const salesModuleCorePath = "src/modules/sales/SalesModuleCore.jsx";
const offerBuilderPath = "src/modules/sales/components/SalesOfferBuilder.jsx";
const localStoragePath = "src/modules/sales/services/salesLocalStorage.js";
const localStorageCorePath = "src/modules/sales/services/salesLocalStorageCore.js";
const localStorageBasePath = "src/modules/sales/services/salesLocalStorageBase.js";
const salesSupabasePath = "src/modules/sales/services/salesSupabase.js";
const salesSupabaseBasePath = "src/modules/sales/services/salesSupabaseBase.js";
const signaturePath = "src/modules/sales/utils/salesOfferDraftSignature.js";
const offerLogicPath = "src/modules/sales/utils/salesOfferLogic.js";
const helpPath = "src/modules/help/helpTools.js";
const helpCorePath = "src/modules/help/helpToolsCore.js";

const salesModule = read(salesModulePath);
const salesModuleCore = read(salesModuleCorePath);
const offerBuilder = read(offerBuilderPath);
const localStorage = read(localStoragePath);
const localStorageCore = read(localStorageCorePath);
const localStorageBase = read(localStorageBasePath);
const salesSupabase = read(salesSupabasePath);
const salesSupabaseBase = read(salesSupabaseBasePath);
const signature = read(signaturePath);
const offerLogic = read(offerLogicPath);
const help = read(helpPath);
const helpCore = read(helpCorePath);

if (salesModule) {
  requireText(salesModule, 'import SalesModuleCore from "./SalesModuleCore.jsx";', `${salesModulePath}: sikkerhets-wrapper rundt SalesModuleCore mangler.`);
  requireText(salesModule, '"expo-proffdok-sales-rehydrate"', `${salesModulePath}: recovery kan ikke remounte bare salgmodulen.`);
  requireText(salesModule, "beginOfferDraftHydrationCycle", `${salesModulePath}: ny salgsmount starter ikke en ny tilbuds-hydration-cycle.`);
  requireText(salesModule, 'window.addEventListener("beforeunload", blockPreHydrationUnloadSave)', `${salesModulePath}: sidegjenlasting sperrer ikke pre-hydration cleanup-save.`);
  requireText(salesModule, 'window.addEventListener("pagehide", blockPreHydrationUnloadSave)', `${salesModulePath}: pagehide sperrer ikke pre-hydration cleanup-save.`);
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
