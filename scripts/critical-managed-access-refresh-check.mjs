import fs from "node:fs";
import assert from "node:assert/strict";

const read = (path) => fs.readFileSync(path, "utf8");

const client = read("src/modules/access/moduleAccessClient.js");
const companyAdmin = read("src/modules/access/systemAdminCompanyAccessUx.jsx");
const unifiedAdmin = read("src/modules/access/systemAdminUnifiedUserAccessUx.jsx");
const policyGuard = read("src/modules/access/systemAdminUserPolicyGuard.js");
const moduleAccess = read("src/modules/access/moduleAccessUx.jsx");
const workProfiles = read("src/modules/access/systemAdminWorkProfileUx.jsx");
const supportProjection = read("src/modules/access/supportModeProjection.js");
const firmaAdmin = read("src/modules/access/firmaAdminProNetPriceUx.js");
const supplierPanel = read("src/modules/storeCatalog/ProStoreCatalogAdminPanel.jsx");
const help45b = read("src/modules/help/help45b.js");
const helpCore = read("src/modules/help/helpToolsCore.js");
const architecture = read("docs/architecture/EXPO_PROFFDOK_ARCHITECTURE.md");
const main = read("src/main.jsx");

for (const needle of [
  'MANAGED_ACCESS_EVENT = "expo-proffdok-managed-access-changed"',
  "export function publishManagedAccessChange",
  'source: String(detail?.source || "managed-access")',
  "if (notify)",
  'source: "module-access"',
]) {
  assert(client.includes(needle), `Felles oppdateringssignal mangler: ${needle}`);
}
assert(
  !client.includes('window.dispatchEvent(new Event("focus"))'),
  "Tilgangsendring skal ikke simuleres som nettleserfokus."
);

for (const [name, source] of [
  ["samlet firmaflate", companyAdmin],
  ["samlet brukerflate", unifiedAdmin],
  ["firmapolicy-guard", policyGuard],
  ["modultilgang/approval-guard", moduleAccess],
  ["arbeidsprofiler", workProfiles],
  ["supportprojeksjon", supportProjection],
  ["firmaadmin-prisinnsyn", firmaAdmin],
]) {
  assert(source.includes("MANAGED_ACCESS_EVENT"), `${name} lytter ikke på ferdig lagret tilgangsendring.`);
  assert(source.includes("addEventListener(MANAGED_ACCESS_EVENT"), `${name} mangler aktiv refresh-listener.`);
}

for (const [name, source] of [
  ["samlet firmaflate", companyAdmin],
  ["samlet brukerflate", unifiedAdmin],
  ["firmapolicy-guard", policyGuard],
  ["arbeidsprofiler", workProfiles],
  ["firmaadmin-prisinnsyn", firmaAdmin],
]) {
  assert(source.includes("reloadAfterManagedAccessChange"), `${name} kan miste refresh mens en eldre lesing pågår.`);
  assert(source.includes("const pending = "), `${name} mangler kø for pågående lesing.`);
}

for (const [name, source] of [
  ["samlet firmaflate", companyAdmin],
  ["samlet brukerflate", unifiedAdmin],
  ["firmapolicy-guard", policyGuard],
  ["arbeidsprofiler", workProfiles],
]) {
  assert(
    !/setTimeout\([^\n]*loadSnapshot/.test(source),
    `${name} skal ikke gjette at en serverskriving er ferdig med en fast timeout.`
  );
}
assert(
  supportProjection.includes("const pending = syncPromise") &&
    supportProjection.includes("pending.catch(() => null).then(refresh)"),
  "Supportprojeksjonen må hente på nytt etter en pågående eldre lesing."
);

assert(main.includes("publishManagedAccessChange"), "Legacy brukeradministrasjon publiserer ikke ferdigsignal.");
const loadAdminUsers = main.slice(
  main.indexOf("const loadAdminUsers = async"),
  main.indexOf("const approveAdminUser = async")
);
assert(loadAdminUsers.includes("setAdminUsers(data || [])"), "Brukerlisten må oppdateres fra server.");
assert(
  loadAdminUsers.indexOf("publishManagedAccessChange") > loadAdminUsers.indexOf("setAdminUsers(data || [])"),
  "Ferdigsignalet må sendes etter vellykket serverhenting av brukerlisten."
);

const saveSupplier = supplierPanel.slice(
  supplierPanel.indexOf("async function saveSupplier"),
  supplierPanel.indexOf("async function applyDefaultSuggestions")
);
assert(saveSupplier.includes("await setCompanySupplierAccess"), "Leverandørlagring mangler.");
assert(
  saveSupplier.indexOf("publishManagedAccessChange") > saveSupplier.indexOf("await refreshAccess"),
  "Leverandørendring må publiseres først etter at panelet har hentet lagret tilstand."
);

const defaultSuppliersStart = supplierPanel.indexOf("async function applyDefaultSuggestions");
const defaultSuppliers = supplierPanel.slice(
  defaultSuppliersStart,
  supplierPanel.indexOf("\n  return (", defaultSuppliersStart)
);
assert(
  defaultSuppliers.indexOf("publishManagedAccessChange") > defaultSuppliers.indexOf("await refreshAccess"),
  "Standardleverandører må publisere ett ferdigsignal etter alle skriver er fullført."
);
assert(
  !companyAdmin.includes('text === "Legg til"') &&
    !companyAdmin.includes('text === "Fjern"') &&
    !companyAdmin.includes('text.includes("standardforslag")'),
  "Firmaflaten skal ikke gjette ferdigtidspunkt fra leverandørknappens klikk."
);

for (const [name, source] of [
  ["samlet brukerflate", unifiedAdmin],
  ["firmapolicy-guard", policyGuard],
  ["firmaadmin-prisinnsyn", firmaAdmin],
  ["leverandørpanelet", supplierPanel],
]) {
  assert(
    source.includes("Generelle tilbud / Proff vareregister"),
    `${name} mangler riktig navn på modultilgangen.`
  );
  assert(
    !source.includes("Enkel ordre / Proff vareregister"),
    `${name} viser fortsatt Enkel ordre som navn på modultilgangen.`
  );
}

for (const [name, source] of [
  ["Fase 45B-hjelp", help45b],
  ["Systemadmin-hjelp", helpCore],
  ["arkitektur", architecture],
]) {
  assert(source.includes("Generelle tilbud / Proff vareregister"), `${name} mangler riktig tilgangsnavn.`);
}
assert(help45b.includes("Enkel ordre velges først etter kundeaksept"), "Hjelp må skille modulnavnet fra videreføringen Enkel ordre.");
assert(help45b.includes("Brukervilkårstatus vises separat"), "Systemadmin-hjelp må skille vilkårstatus fra modul-/leverandørtilgang.");
assert(helpCore.includes("samt eksterne Proff-firma"), "Systemadmin-hjelp må beskrive ekstern Proff-tilgang.");

assert(
  !unifiedAdmin.toLocaleLowerCase("nb-NO").includes("brukervilkår") &&
    !policyGuard.toLocaleLowerCase("nb-NO").includes("brukervilkår"),
  "Brukervilkår skal ikke brukes som firmakatalog-/modulgate i UI."
);

const previousWindow = globalThis.window;
globalThis.window = new EventTarget();
const {
  MANAGED_ACCESS_EVENT,
  publishManagedAccessChange,
} = await import(`../src/modules/access/moduleAccessClient.js?managed-access-check=${Date.now()}`);
let received = null;
window.addEventListener(MANAGED_ACCESS_EVENT, (event) => {
  received = event.detail;
});
publishManagedAccessChange({ source: "critical-check", userId: "u-1", companyId: "c-1" });
assert.deepEqual(received, {
  source: "critical-check",
  userId: "u-1",
  companyId: "c-1",
});
if (previousWindow === undefined) delete globalThis.window;
else globalThis.window = previousWindow;

console.log("critical-managed-access-refresh-check: OK");
