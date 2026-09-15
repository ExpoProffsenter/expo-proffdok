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
const offerPreviewClient = read("src/modules/demo/demoOfferPreviewClient.js");
const offerPreview = read("src/modules/demo/DemoCustomerOfferPreview.jsx");
const openEvent = read("src/modules/demo/demoSalesOpenEvent.js");
const navigation = read("src/modules/demo/demoStageNavigation.js");
const homeFollowUp = read("src/modules/sales/components/SalesHomeFollowUp.jsx");
const main = read("src/main.jsx");
const mount = read("src/modules/storeCatalog/systemAdminStoreCatalogUx.jsx");
const publishing = read("src/modules/sales/services/salesPublishing.js");
const acceptancePdf = read("src/modules/sales/services/salesAcceptancePdf.js");
const help = read("src/modules/help/helpToolsCore.js");
const packageJson = read("package.json");

assertContains(safety, 'DEMO_SUITE_KEY = "expo-proffdok-demo-42l"', "42L: fast demo-suite key mangler.");
assertContains(safety, 'DEMO_OPERATOR_EMAIL = "kenneth@ringside.no"', "42L: Demo/Test skal være låst til Kenneth.");
assertContains(safety, "assertDemoOperator", "42L: felles Kenneth/systemadmin-grense mangler.");
assertContains(safety, "workProfile?.is_systemadmin", "42L: Kenneth må fortsatt være systemadmin for Demo/Test.");
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
assertContains(client, "assertDemoOperator(user, workProfile)", "42L: alle demo backend-handlinger må kontrollere Kenneth + systemadmin.");
assertContains(client, "active_company_id", "42L: Demo/Test må følge Representerer-firma.");
assertContains(client, 'DEMO_TEMPLATE_NAME = "Tilbud – Andreas Bad"', "42L: Andreas-malen må være eksplisitt demo-kilde.");
assertContains(client, '.from("sales_offer_templates")', "42L: demosuiten må lese firmamalen read-only.");
assertContains(client, '.eq("name", DEMO_TEMPLATE_NAME)', "42L: demosuiten må bare kopiere den navngitte Andreas-malen.");
assertNotContains(client, '.from("sales_offer_templates")\n    .update', "42L: Demo/Test må aldri endre firmamalene.");
assertNotContains(client, '.from("sales_offer_templates")\n    .delete', "42L: Demo/Test må aldri slette firmamalene.");
assertContains(client, "buildAcceptedOfferProgressActivities", "42L: demo-fremdrift skal bruke eksisterende tilbud→fremdrift-transformasjon.");
assertContains(client, 'type: "accepted-offer-testcopy"', "42L: fremdriftsplanen må merkes som demo-kopi av akseptert tilbud.");
assertContains(client, '.from("project_progress_plans")', "42L: demo-prosjektet skal ha ferdig gjenbrukbar fremdriftsplan.");
assertContains(client, 'guaranteeNumber: "DEMO-GARANTI-2026-001"', "42L: garantivisningen må være tydelig DEMO-merket.");
assertContains(client, 'system: "sopro-aeb-815"', "42L: demo-garantien må bruke et gyldig Sopro-system.");
assertContains(client, 'demoAcceptedOfferSnapshot', "42L: demo-prosjektet må beholde sporbar kopi av tilbudsgrunnlaget.");
assertContains(client, "projectLog:", "42L: demo-prosjektet må ha kundedialog for chatvisning.");
assertNotContains(client, "issueWarranty(", "42L: demosuiten skal aldri utstede ekte garanti.");
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
assertContains(panel, "kun tilgjengelig for Kenneth", "42L: Systemadmin-panelet må forklare Kenneth-only-grensen.");
assertContains(panel, "if (unauthorized) return null", "42L: Demo/Test-panelet skal være usynlig for andre brukere.");
assertContains(panel, "Tilbakestill demosaker", "42L: reset-handling mangler i Systemadmin-panelet.");
assertContains(panel, "Opprette Demo/Test", "42L: første opprettelse må ha egen, forståelig bekreftelsestekst.");
assertContains(panel, "const refreshInFlightRef = useRef(false)", "42L: Demo/Test må sperre parallelle arbeidsprofil/status-refresh.");
assertContains(panel, "if (refreshInFlightRef.current) return;", "42L: WORK_PROFILE_EVENT må ignoreres mens Demo/Test selv refresher.");
assertContains(panel, "nextCompanyId === currentCompanyId", "42L: uendret Representerer-firma må ikke starte ny statusrefresh.");
assertNotContains(panel, "button.sales-request-card", "42L: Systemadmin-panelet skal ikke eie demo-navigasjon.");
assertNotContains(panel, "const onWorkProfile = () => refresh();", "42L: direkte WORK_PROFILE_EVENT→refresh kan skape rekursiv refresh-loop.");

assertContains(launcher, "Kun Kenneth", "42L: Startside-hurtigvalget må være tydelig Kenneth-only.");
assertContains(launcher, "if (hidden || !status?.ready) return null", "42L: Demo/Test skal ikke vises før gyldig suite er klar.");
assertContains(launcher, "openDemoSalesStage", "42L: Startside-hurtigvalget må bruke isolert Sales-åpning.");
assertContains(launcher, "openDemoProject", "42L: Startside-hurtigvalget må kunne åpne demo-prosjektet.");
assertContains(launcher, "Kundevisning tilbud", "42L: Kenneth må kunne vise kundens tilbud uten publisering.");
assertContains(launcher, 'label: "Fremdrift"', "42L: demo-hurtigvalg for fremdrift mangler.");
assertContains(launcher, 'label: "Rapport"', "42L: demo-hurtigvalg for rapport mangler.");
assertContains(launcher, 'label: "Garanti"', "42L: demo-hurtigvalg for garanti mangler.");
assertContains(launcher, 'label: "Chat"', "42L: demo-hurtigvalg for chat mangler.");
assertContains(launcher, 'label: "Kundelink"', "42L: demo-hurtigvalg for kundelink mangler.");
assertContains(launcher, "nextCompanyId === currentCompanyId", "42L: Startside-hurtigvalget må følge Representerer uten refresh-loop.");

assertContains(offerPreviewClient, "assertDemoOperator(user, workProfile)", "42L: kundevisningen må ha samme Kenneth-only-grense.");
assertContains(offerPreviewClient, "DEMO_REQUEST_REFS.offer", "42L: kundevisningen må lese eksakt demo-tilbud.");
assertContains(offerPreviewClient, "isDemoRequest(row.payload)", "42L: kundevisningen må serververifisere demo-markøren.");
assertNotContains(offerPreviewClient, "publishSalesOffer", "42L: kundevisning skal aldri publisere tilbud.");
assertContains(offerPreview, "SalesCustomerViewCore", "42L: demo-kundevisning skal gjenbruke ekte kundepresentasjon.");
assertContains(offerPreview, "handleAcceptOffer", "42L: demo-kundevisning må eie en eksplisitt akseptsperre.");
assertContains(offerPreview, "Digital aksept er sperret", "42L: kundevisning må forklare at aksept ikke lagres.");

assertContains(openEvent, "expo-proffdok-demo-open-sales-request", "42L: isolert demo-Sales eventnavn mangler.");
assertContains(navigation, "new CustomEvent(DEMO_OPEN_SALES_REQUEST_EVENT", "42L: demo Sales-åpning må bruke isolert event til eksisterende Startsiden-callback.");
assertContains(navigation, "window.dispatchEvent", "42L: demo Sales-åpning må dispatches uten DOM-klikk.");
assertContains(navigation, "return detail.handled === true", "42L: demo-knappen må vite om eksisterende Startsiden-callback håndterte åpningen.");
assertContains(navigation, '"fremdrift"', "42L: direkte demo-prosjektfane for fremdrift mangler.");
assertContains(navigation, '"rapport"', "42L: direkte demo-prosjektfane for rapport mangler.");
assertContains(navigation, '"garanti"', "42L: direkte demo-prosjektfane for garanti mangler.");
assertNotContains(navigation, "setInterval", "42L: demo Sales-åpning skal ikke poll'e DOM.");
assertNotContains(navigation, "sales-request-card", "42L: demo Sales-åpning skal ikke finne/klikke Sales-kort.");
assertNotContains(navigation, "Arbeidsstatus", "42L: demo Sales-åpning skal ikke endre Sales-filtre.");
assertNotContains(navigation, "nativeSalesButton", "42L: demo Sales-åpning skal ikke klikke native navigasjonsknapper.");
assertContains(navigation, "window.location.assign", "42L: demo-prosjekt skal bruke eksisterende admin-prosjektlenke.");

assertContains(homeFollowUp, "DEMO_OPEN_SALES_REQUEST_EVENT", "42L: eksisterende Startsiden Sales-komponent må eie demo-eventbroen.");
assertContains(homeFollowUp, "window.addEventListener", "42L: Startsiden må lytte på isolert demo-open event.");
assertContains(homeFollowUp, "detail.handled = true", "42L: bare én desktop/mobil Startsiden-lytter skal håndtere demo-open.");
assertContains(homeFollowUp, "onOpenRequest(requestId)", "42L: demo-open må videresendes til eksisterende onOpenRequest callback.");
assertContains(main, "onOpenRequest: openSalesRequestFromHome", "42L: Startsiden må fortsatt koble SalesHomeFollowUp til eksisterende openSalesRequestFromHome.");
assertContains(main, "openRequestSignal: salesOpenRequestSignal", "42L: eksisterende Sales openRequestSignal-kontrakt må være intakt.");

assertContains(mount, "<DemoTestPanel />", "42L: Demo/Test er ikke montert i Systemadmin.");
assertContains(mount, "<DemoHomeLauncher />", "42L: Demo/Test-hurtigvalg er ikke montert på Startsiden.");
assertContains(mount, "MOBILE_HOME_QUERY", "42L: Startside-mount må velge mobil/desktop eksplisitt.");
assertContains(mount, '.mobileProjectChooser', "42L: Demo/Test må støtte mobil Startsiden.");
assertContains(mount, '.desktopNoProjectWelcome', "42L: Demo/Test må støtte desktop Startsiden.");
assertContains(mount, "element.getClientRects().length === 0", "42L: skjult Startside-container må ikke godtas som mount-target.");
assertContains(mount, 'section.closest(".sales-app")', "42L: Demo/Test-hurtigvalg må aldri monteres inne i Sales-flaten.");
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

console.log("✅ Demo/Test 42L Kenneth-only / Andreas-mal / customer preview / rich project / progress / report / warranty / chat / reset / Sales bridge safety check OK");
