import { readFileSync } from "node:fs";

const failures = [];

function requireCondition(condition, message) {
  if (!condition) failures.push(message);
}

function requireText(source, needle, message) {
  if (!source.includes(needle)) failures.push(message);
}

const salesSupabasePath = "src/modules/sales/services/salesSupabase.js";
const salesWrapperPath = "src/modules/sales/SalesModule.jsx";
const salesCorePath = "src/modules/sales/SalesModuleCore.jsx";
const mainPath = "src/main.jsx";
const supportProjectionPath = "src/modules/access/supportModeProjection.js";
const appClientRegistryPath = "src/modules/access/appSupabaseClientRegistry.js";
const projectParticipantsPath = "src/modules/project/projectParticipantsUxV3.jsx";

const salesSupabase = readFileSync(salesSupabasePath, "utf8");
const salesWrapper = readFileSync(salesWrapperPath, "utf8");
const salesCore = readFileSync(salesCorePath, "utf8");
const main = readFileSync(mainPath, "utf8");
const supportProjection = readFileSync(supportProjectionPath, "utf8");
const appClientRegistry = readFileSync(appClientRegistryPath, "utf8");
const projectParticipants = readFileSync(projectParticipantsPath, "utf8");

const registryRuntime = await import(
  `../src/modules/access/appSupabaseClientRegistry.js?critical=${Date.now()}`
);
const firstClient = { name: "critical-first-client" };
const secondClient = { name: "critical-second-client" };
let deferredClient = null;
let deferredCalls = 0;
const stopWaiting = registryRuntime.whenAppSupabaseClientRegistered((client) => {
  deferredClient = client;
  deferredCalls += 1;
});
registryRuntime.registerAppSupabaseClient(firstClient);
registryRuntime.registerAppSupabaseClient(secondClient);
stopWaiting();

requireCondition(
  deferredClient === firstClient && deferredCalls === 1,
  "Sales auth: ventende integrasjonslag får ikke nøyaktig den første registrerte appklienten."
);

let immediateClient = null;
registryRuntime.whenAppSupabaseClientRegistered((client) => {
  immediateClient = client;
});
requireCondition(
  immediateClient === secondClient,
  "Sales auth: integrasjonslag som starter sent får ikke aktiv appklient umiddelbart."
);

requireText(
  salesSupabase,
  "function createLazyDefaultSalesSupabaseClient()",
  "Sales auth: defaultklienten er ikke lazy. Modulimport kan da opprette en ekstra GoTrue-klient."
);
requireText(
  salesSupabase,
  "sharedDefaultSalesSupabaseClient = createLazyDefaultSalesSupabaseClient();",
  "Sales auth: createDefaultSalesSupabaseClient bruker ikke den lazy singleton-klienten."
);
requireText(
  salesSupabase,
  "const appClient = getAppSupabaseClient();",
  "Sales auth: fallback-fabrikken gjenbruker ikke hovedappens registrerte Supabase-klient."
);
requireCondition(
  (salesSupabase.match(/if \(appClient\) return appClient;/g) || []).length >= 2,
  "Sales auth: både eksisterende lazy proxy og nye fallback-kall må prioritere hovedappens klient."
);
requireCondition(
  !salesSupabase.includes(
    "sharedDefaultSalesSupabaseClient = core.createDefaultSalesSupabaseClient();"
  ),
  "Sales auth: defaultklienten opprettes fortsatt direkte ved første modulimport."
);

const scopeStart = salesSupabase.indexOf(
  "export async function resolveSalesCompanyScope(client)"
);
const scopeEnd = salesSupabase.indexOf("\nfunction browserStorage()", scopeStart);
requireCondition(
  scopeStart >= 0 && scopeEnd > scopeStart,
  "Sales auth: autentisert resolveSalesCompanyScope-wrapper mangler."
);

if (scopeStart >= 0 && scopeEnd > scopeStart) {
  const scopeBlock = salesSupabase.slice(scopeStart, scopeEnd);
  const sessionIndex = scopeBlock.indexOf("await client.auth.getSession()");
  const tokenIndex = scopeBlock.indexOf("session?.access_token");
  const rpcIndex = scopeBlock.indexOf("return core.resolveSalesCompanyScope(client);");

  requireCondition(
    sessionIndex >= 0,
    "Sales auth: firmascope sjekker ikke aktiv Supabase-session før RPC."
  );
  requireCondition(
    tokenIndex >= 0,
    "Sales auth: firmascope verifiserer ikke access token før RPC."
  );
  requireCondition(
    rpcIndex > sessionIndex,
    "Sales auth: firmascope-RPC kan fortsatt kjøres før session er bekreftet."
  );
}

requireText(
  salesWrapper,
  "const activeSupabase = props.supabaseClient || fallbackSalesSupabase;",
  "Sales auth: wrapper prioriterer ikke appens injiserte Supabase-klient."
);
requireText(
  salesCore,
  "const activeSupabase = supabaseClient || supabase;",
  "Sales auth: SalesCore prioriterer ikke appens injiserte Supabase-klient."
);

requireText(
  main,
  "registerAppSupabaseClient(supabase);",
  "Sales auth: hovedappens ene Supabase-klient registreres ikke for integrasjonslagene."
);
requireText(
  appClientRegistry,
  "export function getAppSupabaseClient()",
  "Sales auth: registeret for hovedappens Supabase-klient mangler."
);
requireText(
  appClientRegistry,
  "export function whenAppSupabaseClientRegistered(listener)",
  "Sales auth: integrasjonslag kan ikke vente på hovedappens registrerte klient."
);
requireText(
  projectParticipants,
  "whenAppSupabaseClientRegistered((client) => {",
  "Sales auth: prosjektinvolverte starter auth før hovedappens klient er registrert."
);
const participantInstallStart = projectParticipants.indexOf(
  "export function installProjectParticipantsUx()"
);
const participantInstallBlock =
  participantInstallStart >= 0
    ? projectParticipants.slice(participantInstallStart)
    : "";
requireCondition(
  participantInstallStart >= 0,
  "Sales auth: fant ikke installasjon av prosjektinvolverte."
);
requireCondition(
  !participantInstallBlock.includes(
    "const client = createDefaultSalesSupabaseClient();"
  ),
  "Sales auth: prosjektinvolverte kan fortsatt løse ut fallback-klienten før main.jsx."
);
requireText(
  supportProjection,
  "const salesClient = getAppSupabaseClient();",
  "Sales auth: prosjekt-support bruker ikke hovedappens Supabase-klient."
);
requireText(
  supportProjection,
  "entry?.display_name || entry?.company_name",
  "Sales auth: prosjekt-support tåler ikke det eksisterende company_name-feltet fra support-RPC-en."
);
requireText(
  supportProjection,
  "normalizedEntryName(entry) === bannerCompany",
  "Sales auth: prosjektets eksplisitte firma prioriteres ikke ved support-scope."
);
requireText(
  supportProjection,
  "normalizedEntryName(entry) === targetCompany",
  "Sales auth: prosjekt-support mangler kontrollert fallback til prosjekteierens firma."
);
requireCondition(
  !supportProjection.includes("createDefaultSalesSupabaseClient"),
  "Sales auth: prosjekt-support kan fortsatt opprette en ekstra GoTrue-klient."
);

const appSalesStart = main.indexOf('tab === "sales"');
const appSalesBlock =
  appSalesStart >= 0 ? main.slice(appSalesStart, appSalesStart + 2600) : "";
requireCondition(appSalesStart >= 0, "Sales auth: fant ikke intern Sales-mount i main.jsx.");
requireText(
  appSalesBlock,
  "supabaseClient: supabase",
  "Sales auth: intern Sales-mount sender ikke hovedappens Supabase-klient videre."
);
requireText(
  appSalesBlock,
  'integrationMode: "app"',
  "Sales auth: intern Sales-mount mangler integrationMode app."
);

if (failures.length) {
  console.error("Critical Sales auth/client check feilet:\n");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(
  "Critical Sales auth/client check OK: én app-klient, lazy preview-fallback og session-gate før firmascope-RPC."
);
