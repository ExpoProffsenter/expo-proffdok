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

function requireOrderedText(source, first, second, message) {
  const firstIndex = source.indexOf(first);
  const secondIndex = source.indexOf(second);
  if (firstIndex < 0 || secondIndex < 0 || firstIndex >= secondIndex) {
    failures.push(message);
  }
}

const supabasePath = "src/modules/sales/services/salesSupabase.js";
const lazyPath = "src/modules/sales/services/salesRequestLazyLoading.js";
const listPath = "src/modules/sales/components/SalesListView.jsx";
const wrapperPath = "src/modules/sales/SalesModule.jsx";
const localStoragePath = "src/modules/sales/services/salesLocalStorageCore.js";
const migrationPath = "supabase/migrations/20260915134500_fase42i_sales_list_projection.sql";
const indexMigrationPath = "supabase/migrations/20260915135500_fase42i_sales_summary_indexes.sql";

const supabase = read(supabasePath);
const lazy = read(lazyPath);
const list = read(listPath);
const wrapper = read(wrapperPath);
const localStorage = read(localStoragePath);
const migration = read(migrationPath);
const indexMigration = read(indexMigrationPath);

if (supabase) {
  requireText(
    supabase,
    'client.rpc("list_sales_request_summaries"',
    `${supabasePath}: Sales-oversikten bruker ikke lett summary-RPC.`
  );
  requireText(
    supabase,
    "fetchSalesRequestDetailRow",
    `${supabasePath}: komplett enkeltsak kan ikke hentes separat.`
  );
  requireText(
    supabase,
    "primeSalesRequestDetailRow",
    `${supabasePath}: valgt sak kan ikke primes før Core mountes.`
  );
  requireText(
    supabase,
    ".filter((row) => !row?.payload?.__summaryOnly)",
    `${supabasePath}: summary-rader kan igjen bli skrevet tilbake som komplett payload.`
  );
  requireText(
    supabase,
    "if (row?.payload?.__summaryOnly) continue;",
    `${supabasePath}: summary-data kan igjen flytte tilbudets serverbaseline.`
  );
}

if (lazy) {
  requireText(
    lazy,
    "loadSalesRequestDetailForOpen",
    `${lazyPath}: on-demand detaljlaster mangler.`
  );
  requireText(
    lazy,
    "fetchSalesRequestDetailRow",
    `${lazyPath}: detaljlasteren henter ikke én komplett serverrad.`
  );
  requireText(
    lazy,
    "__summaryOnly: false",
    `${lazyPath}: komplett sak markeres ikke som hydrert.`
  );
  requireText(
    lazy,
    "hydrateInspectionPhotos",
    `${lazyPath}: befaringsbilder får ikke ferske signerte URL-er ved åpning.`
  );
  requireText(
    lazy,
    "acceptedRequestState",
    `${lazyPath}: akseptert tilbudsstatus hydreres ikke ved åpning.`
  );
  requireText(
    lazy,
    "repairMissingActivatedProject",
    `${lazyPath}: eksisterende reparasjon av feilaktig prosjektaktivering er mistet.`
  );
}

if (list) {
  requireText(
    list,
    "if (!request.__summaryOnly)",
    `${listPath}: allerede komplett sak blir ikke gjenkjent.`
  );
  requireText(
    list,
    "loadSalesRequestDetailForOpen",
    `${listPath}: klikk på summary henter ikke komplett sak før åpning.`
  );
  requireText(
    list,
    "Object.assign(request, detail",
    `${listPath}: komplett serverdata legges ikke inn før mode skifter til detail.`
  );
  requireText(
    list,
    "openBusyId",
    `${listPath}: dobbeltklikk kan starte parallelle detaljhentinger.`
  );
}

if (wrapper) {
  requireText(
    wrapper,
    "primeSelectedSalesRequestBeforeCore",
    `${wrapperPath}: reload/dvale primer ikke valgt komplett sak.`
  );
  requireText(
    wrapper,
    "if (!requestIdToPrime)",
    `${wrapperPath}: vanlig oversikt kan igjen tvinges gjennom full hydrering.`
  );
  requireText(
    wrapper,
    "primeSalesRequestDetailRow",
    `${wrapperPath}: reload/dvale bruker ikke saksspesifikk server-first-henting.`
  );
  requireText(
    wrapper,
    "serverCacheError",
    `${wrapperPath}: feil under detaljhenting kan slippe ufullstendig summary videre.`
  );
  requireText(
    wrapper,
    "Komplett sak kunne ikke hentes",
    `${wrapperPath}: bruker får ingen kontrollert sperre når komplett sak mangler.`
  );
  requireText(
    wrapper,
    "Prøv igjen",
    `${wrapperPath}: nettfeil kan ikke prøves på nytt uten å forlate recoveryflyten.`
  );
  requireText(
    wrapper,
    "setServerCacheReady(false)",
    `${wrapperPath}: nettfeil kan fortsatt mounte SalesCore på ufullstendig data.`
  );
  forbidText(
    wrapper,
    "fetchSalesRequests(",
    `${wrapperPath}: wrapperen laster igjen hele Sales-listen før Core mountes.`
  );

  const rehydrateStart = wrapper.indexOf("const rehydrateSalesModule = () => {");
  const rehydrateEnd = wrapper.indexOf(
    "const blockPreHydrationUnloadSave",
    rehydrateStart
  );
  const rehydrateBlock =
    rehydrateStart >= 0 && rehydrateEnd > rehydrateStart
      ? wrapper.slice(rehydrateStart, rehydrateEnd)
      : "";

  requireText(
    rehydrateBlock,
    "protectInspectionDraftNavigation(props);",
    `${wrapperPath}: Demo-recovery bevarer ikke lenger inspeksjonsnavigasjonen før remount.`
  );
  requireText(
    rehydrateBlock,
    'setServerCacheError("")',
    `${wrapperPath}: recovery-remount rydder ikke gammel serverfeil før ny prime.`
  );
  requireText(
    rehydrateBlock,
    "setServerCacheReady(false)",
    `${wrapperPath}: recovery-remount kan igjen mounte Core før komplett serverrad er primet.`
  );
  requireOrderedText(
    rehydrateBlock,
    "setServerCacheReady(false)",
    "setInstanceKey((current) => current + 1)",
    `${wrapperPath}: recovery-remount endrer instanceKey før server-first-gaten er stengt.`
  );
  requireText(
    wrapper,
    "props.openRequestSignal,\n    instanceKey,\n    serverCacheRetryKey,",
    `${wrapperPath}: recovery-remount trigger ikke ny saksspesifikk server-prime.`
  );
}

if (localStorage) {
  requireText(
    localStorage,
    "compactRequestForAppListCache",
    `${localStoragePath}: appens listecache komprimeres ikke.`
  );
  requireText(
    localStorage,
    "compact.__summaryOnly = true",
    `${localStoragePath}: lokal listecache kan forveksles med komplett serverdata.`
  );
  requireText(
    localStorage,
    "if (storageKey === STORAGE_KEY)",
    `${localStoragePath}: standalone preview beholder ikke eksisterende lokal oppførsel.`
  );
}

if (migration) {
  requireText(
    migration,
    "add column if not exists list_payload jsonb",
    `${migrationPath}: persistert lett listeprojeksjon mangler.`
  );
  requireText(
    migration,
    "sales_requests_refresh_list_payload",
    `${migrationPath}: listeprojeksjonen oppdateres ikke automatisk ved payload-endringer.`
  );
  requireText(
    migration,
    "list_sales_request_summaries",
    `${migrationPath}: summary-RPC mangler.`
  );
  requireText(
    migration,
    "'__summaryOnly', true",
    `${migrationPath}: serveren markerer ikke eksplisitt at list-data er ufullstendig.`
  );
  requireText(
    migration,
    "resolve_sales_support_company_scope",
    `${migrationPath}: Systemadmin-supportscoping er ikke bevart i summary-RPC.`
  );
  requireText(
    migration,
    "resolve_sales_company_scope",
    `${migrationPath}: ordinært firmascope er ikke bevart i summary-RPC.`
  );
}

if (indexMigration) {
  requireText(
    indexMigration,
    "sales_offers_company_request_updated_idx",
    `${indexMigrationPath}: latest-offer-oppslag mangler skaleringsindeks.`
  );
  requireText(
    indexMigration,
    "sales_offer_follow_up_company_request_status_sent_idx",
    `${indexMigrationPath}: oppfølgingsoppslag mangler skaleringsindeks.`
  );
}

if (failures.length) {
  console.error("❌ Expo ProffDok Sales lazy-loading check feilet:");
  failures.forEach((failure) => console.error(` - ${failure}`));
  process.exit(1);
}

console.log(
  "✅ Expo ProffDok Sales lazy-loading check OK – oversikten bruker lett projeksjon, valgt sak hydreres komplett før redigering, Demo-recovery bevarer inspeksjonsnavigasjon, server-gaten stenges før Core remountes, summary kan ikke lagres tilbake, nettfeil blokkerer ufullstendig editor og 42F recovery/server-first er bevart"
);
