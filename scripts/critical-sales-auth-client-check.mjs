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

const salesSupabase = readFileSync(salesSupabasePath, "utf8");
const salesWrapper = readFileSync(salesWrapperPath, "utf8");
const salesCore = readFileSync(salesCorePath, "utf8");
const main = readFileSync(mainPath, "utf8");

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
