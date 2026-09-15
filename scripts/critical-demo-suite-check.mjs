import fs from "node:fs";

function read(path) {
  return fs.readFileSync(path, "utf8");
}

function assertContains(source, needle, message) {
  if (!source.includes(needle)) throw new Error(message);
}

function assertNotContains(source, needle, message) {
  if (source.includes(needle)) throw new Error(message);
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
const launcher = read("src/modules/demo/DemoHomeLauncher.jsx");
const navigation = read("src/modules/demo/demoStageNavigation.js");
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

assertContains(panel, "Opprett eller tilbakestill demosuiten her", "42L: Systemadmin skal bare brukes til demo-oppsett/reset.");
assertContains(panel, "Demo/Test-hurtigvalget på Startsiden", "42L: Systemadmin må peke systemadmin videre til Startsiden for visning.");
assertContains(panel, "Tilbakestill demosaker", "42L: reset-handling mangler i Systemadmin-panelet.");
assertContains(panel, "Opprette Demo/Test", "42L: første opprettelse må ha egen, forståelig bekreftelsestekst.");
assertContains(panel, "const refreshInFlightRef = useRef(false)", "42L: Demo/Test må sperre parallelle arbeidsprofil/status-refresh.");
assertContains(panel, "if (refreshInFlightRef.current) return;", "42L: WORK_PROFILE_EVENT må ignoreres mens Demo/Test selv refresher.");
assertContains(panel, "nextCompanyId === currentCompanyId", "42L: uendret Representerer-firma må ikke starte ny statusrefresh.");
assertNotContains(panel, "button.sales-request-card", "42L: Systemadmin-panelet skal ikke eie demo-navigasjon.");
assertNotContains(panel, "const onWorkProfile = () => refresh();", "42L: direkte WORK_PROFILE_EVENT→refresh kan skape rekursiv refresh-loop.");

assertContains(launcher, "Kun systemadmin", "42L: Startside-hurtigvalget må være tydelig systemadmin-only.");
assertContains(launcher, "if (hidden || !status?.ready) return null", "42L: Demo/Test skal ikke vises på Startsiden før en gyldig systemadmin-suite er klar.");
assertContains(launcher, "openDemoSalesStage", "42L: Startside-hurtigvalget må bruke isolert native Sales-navigasjon.");
assertContains(launcher, "openDemoProject", "42L: Startside-hurtigvalget må kunne åpne demo-prosjektet.");
assertContains(launcher, "nextCompanyId === currentCompanyId", "42L: Startside-hurtigvalget må følge Representerer uten refresh-loop.");

assertContains(navigation, 'button.sales-request-card', "42L: direkte demosteg skal bruke eksisterende Sales-kort, ikke parallell editor.");
assertContains(navigation, 'button[role=\"tab\"]', "42L: direkte demosteg må kunne finne saken uavhengig av aktiv Sales-fane.");
assertContains(navigation, "nativeSalesButton.click()", "42L: Demo/Test skal åpne Sales gjennom eksisterende native inngang.");
assertContains(navigation, "window.location.assign", "42L: demo-prosjekt skal bruke eksisterende admin-prosjektlenke.");

assertContains(mount, "<DemoTestPanel />", "42L: Demo/Test er ikke montert i Systemadmin.");
assertContains(mount, "<DemoHomeLauncher />", "42L: Demo/Test-hurtigvalg er ikke montert på Startsiden.");
assertContains(mount, ".mobileProjectChooser", "42L: Demo/Test må støtte mobil Startsiden.");
assertContains(mount, ".desktopNoProjectWelcome", "42L: Demo/Test må støtte desktop Startsiden.");
assertNotContains(mount, "src/main.jsx", "42L: Demo/Test-mount skal ikke introdusere parallell main-navigation.");

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

console.log("✅ Demo/Test 42L safety / Startside launcher / native stage open / reset / publishing / project cleanup / work-profile stability / Help check OK");
