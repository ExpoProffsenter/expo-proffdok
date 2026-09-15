import fs from "node:fs";

function read(path) {
  return fs.readFileSync(path, "utf8");
}

function assertContains(source, needle, message) {
  if (!source.includes(needle)) throw new Error(message);
}

function assertBefore(source, first, second, message) {
  const firstIndex = source.indexOf(first);
  const secondIndex = source.indexOf(second);
  if (firstIndex < 0 || secondIndex < 0 || firstIndex >= secondIndex) {
    throw new Error(message);
  }
}

const safety = read("src/modules/demo/demoCaseSafety.js");
const client = read("src/modules/demo/demoSuiteClient.js");
const panel = read("src/modules/demo/DemoTestPanel.jsx");
const mount = read("src/modules/storeCatalog/systemAdminStoreCatalogUx.jsx");
const publishing = read("src/modules/sales/services/salesPublishing.js");
const acceptancePdf = read("src/modules/sales/services/salesAcceptancePdf.js");
const help = read("src/modules/help/helpToolsCore.js");
const packageJson = read("package.json");

assertContains(safety, 'DEMO_SUITE_KEY = "expo-proffdok-demo-42l"', "42L: fast demo-suite key mangler.");
[
  "DEMO42L-01-FORESPORSEL",
  "DEMO42L-02-BEFARING",
  "DEMO42L-03-TILBUD",
  "DEMO42L-04-AKSEPTERT",
  "DEMO42L-05-PROSJEKT",
].forEach((requestRef) =>
  assertContains(safety, requestRef, `42L: deterministisk demo-ref mangler: ${requestRef}`)
);
assertContains(safety, "request?.demoCase === true", "42L: demoCase=true må være del av sikkerhetsmarkøren.");
assertContains(safety, "request?.demoSuiteKey === DEMO_SUITE_KEY", "42L: suite-key må verifiseres før demo-handling.");

assertContains(client, "getMyWorkProfileState", "42L: Demo/Test må bruke serverstyrt arbeidsprofil.");
assertContains(client, "if (!workProfile?.is_systemadmin)", "42L: Demo/Test må være systemadmin-only.");
assertContains(client, "active_company_id", "42L: Demo/Test må følge Representerer-firma.");
assertContains(client, '.eq("company_scope_id", companyId)', "42L: prosjektrydding må være company-scopet.");
assertContains(client, "verifiedRequestRefs", "42L: prosjektrydding må kreve serververifisert demo-Sales-rad.");
assertContains(client, "isDemoProjectData", "42L: demo-prosjektmarkør må brukes ved reset.");
assertContains(client, "requestRef === DEMO_REQUEST_REFS.accepted", "42L: prosjekt opprettet fra Akseptert-demo må kunne ryddes eksplisitt.");
assertContains(client, "created_by: context.userId", "42L: Sales-demo må beholde RLS creator-kontrakt.");
assertContains(client, ".upsert(rows, { onConflict: \"company_id,request_ref\" })", "42L: reset skal upserte bare deterministiske Sales-rader.");
if (/\.delete\(\)[\s\S]{0,160}(title|customer|ilike)/.test(client)) {
  throw new Error("42L: demo-reset må aldri slette prosjekt basert på navn/kunde/fritekst.");
}

assertContains(panel, "Fem tydelig merkede demosaker", "42L: Systemadmin-panelet må forklare demoavgrensningen.");
assertContains(panel, "Tilbakestill demosaker", "42L: reset-handling mangler i Systemadmin-panelet.");
assertContains(mount, "<DemoTestPanel />", "42L: Demo/Test er ikke montert i Systemadmin.");

assertContains(publishing, "isDemoRequest(request)", "42L: tilbudspublisering må kjenne demosaker.");
assertBefore(
  publishing,
  "if (isDemoRequest(request))",
  "await publishSalesOffer(",
  "42L: demo-sperren må kjøres før publish_sales_offer."
);
assertContains(acceptancePdf, "isDemoRequest(args?.selectedRequest", "42L: akseptbevis må sperres for demosaker før PDF/Storage.");

assertContains(help, "Demo/Test oppretter fem tydelig merkede steg", "42L: React-Hjelp må beskrive de fem Demo/Test-stegene.");
assertContains(help, "Tilbakestill demosaker", "42L: React-Hjelp må beskrive reset av demosaker.");
assertContains(help, "publisering av DEMO-tilbud", "42L: React-Hjelp må forklare irreversible demo-sperrer.");

assertContains(
  packageJson,
  "critical-demo-suite-check.mjs",
  "42L: demo-regresjonscheck må kjøres i package scripts."
);

console.log("✅ Demo/Test 42L safety / reset / publishing / project cleanup / Help check OK");
