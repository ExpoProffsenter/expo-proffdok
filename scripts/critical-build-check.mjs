import { readFileSync } from "node:fs";

const failures = [];

function readRequiredFile(path) {
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

function sectionBetween(source, startNeedle, endNeedle, label) {
  const start = source.indexOf(startNeedle);
  if (start === -1) {
    failures.push(`${label}: fant ikke "${startNeedle}"`);
    return "";
  }

  const end = source.indexOf(endNeedle, start + startNeedle.length);
  if (end === -1) {
    failures.push(`${label}: fant ikke avslutningen "${endNeedle}"`);
    return source.slice(start);
  }

  return source.slice(start, end);
}

const reportPath = "src/modules/report/reportViewTools.js";
const mainPath = "src/main.jsx";
const boundaryPath = "src/modules/app/AppErrorBoundary.jsx";
const salesListPath = "src/modules/sales/components/SalesListView.jsx";
const salesRequestPath = "src/modules/sales/components/SalesRequestForm.jsx";
const salesSurveyPath = "src/modules/sales/components/SalesSurveyPlan.jsx";
const salesDetailPath = "src/modules/sales/components/SalesDetailView.jsx";
const salesDetailCorePath = "src/modules/sales/components/SalesDetailViewCore.jsx";
const salesActivationPath = "src/modules/sales/components/SalesProjectActivation.jsx";
const salesSupabasePath = "src/modules/sales/services/salesSupabase.js";
const salesSupabaseBasePath = "src/modules/sales/services/salesSupabaseBase.js";
const salesLocalStoragePath = "src/modules/sales/services/salesLocalStorage.js";
const bootstrapPath = "src/bootstrap.jsx";
const privateDocumentRedirectPath = "src/modules/documents/privateDocumentRedirect.js";

const reportSource = readRequiredFile(reportPath);
const mainSource = readRequiredFile(mainPath);
const boundarySource = readRequiredFile(boundaryPath);
const salesListSource = readRequiredFile(salesListPath);
const salesRequestSource = readRequiredFile(salesRequestPath);
const salesSurveySource = readRequiredFile(salesSurveyPath);
const salesDetailSource = readRequiredFile(salesDetailPath);
const salesDetailCoreSource = readRequiredFile(salesDetailCorePath);
const salesActivationSource = readRequiredFile(salesActivationPath);
const salesSupabaseSource = readRequiredFile(salesSupabasePath);
const salesSupabaseBaseSource = readRequiredFile(salesSupabaseBasePath);
const salesSupabaseGuardSource = `${salesSupabaseSource}\n${salesSupabaseBaseSource}`;
const salesLocalStorageSource = readRequiredFile(salesLocalStoragePath);
const bootstrapSource = readRequiredFile(bootstrapPath);
const privateDocumentRedirectSource = readRequiredFile(privateDocumentRedirectPath);

// Rapport: en manglende avtalesum-init har tidligere kunnet gi blank Rapport-fane.
if (reportSource) {
  requireText(
    reportSource,
    "const contractTotals =",
    `${reportPath}: contractTotals mangler. Avtalesumkontrollen kan ikke verifiseres.`
  );

  const reportSection = sectionBetween(
    reportSource,
    "function Report(",
    "function CustomerReport(",
    "Report"
  );

  const customerReportSection = sectionBetween(
    reportSource,
    "function CustomerReport(",
    "return { Report, CustomerReport };",
    "CustomerReport"
  );

  const totalsInit = "const agreementTotals = contractTotals(project, tilbud);";

  if (reportSection) {
    requireText(
      reportSection,
      totalsInit,
      `${reportPath}: Report mangler initialisering av agreementTotals. Dette kan gi blank Rapport-fane.`
    );
  }

  if (customerReportSection) {
    requireText(
      customerReportSection,
      totalsInit,
      `${reportPath}: CustomerReport mangler initialisering av agreementTotals. Dette kan gi blank kunderapport.`
    );
  }
}

// App-shell: en renderfeil skal fanges i stedet for å gi permanent blank skjerm.
if (mainSource) {
  requireText(
    mainSource,
    "import AppErrorBoundary from './modules/app/AppErrorBoundary.jsx';",
    `${mainPath}: AppErrorBoundary-import mangler.`
  );

  const boundaryUsed =
    mainSource.includes("(AppErrorBoundary, {") ||
    mainSource.includes("<AppErrorBoundary");

  if (!boundaryUsed) {
    failures.push(`${mainPath}: AppErrorBoundary er ikke koblet rundt hovedappen.`);
  }
}

if (boundarySource) {
  requireText(
    boundarySource,
    "getDerivedStateFromError",
    `${boundaryPath}: getDerivedStateFromError mangler.`
  );
  requireText(
    boundarySource,
    "componentDidCatch",
    `${boundaryPath}: componentDidCatch mangler.`
  );
}

// Systemadmin-support: nye saker skal ikke kunne opprettes uten valgt ansvarlig i målbedriften.
if (salesListSource) {
  requireText(
    salesListSource,
    "const supportMode = Boolean(getSalesSupportCompanyId());",
    `${salesListPath}: supportmodus detekteres ikke eksplisitt.`
  );
  requireText(
    salesListSource,
    "onClick={supportMode ? undefined : onCreateRequest}",
    `${salesListPath}: Ny forespørsel kan igjen åpnes i supportmodus.`
  );
  requireText(
    salesListSource,
    "disabled={supportMode}",
    `${salesListPath}: Ny forespørsel er ikke deaktivert i supportmodus.`
  );
}

if (salesRequestSource) {
  requireText(
    salesRequestSource,
    "if (supportMode && !isEditingRequest) {",
    `${salesRequestPath}: direkte Ny forespørsel/Nytt tilbud er ikke sperret i supportmodus.`
  );
}

// Befaring: Systemadmin skal ikke overskrive firmaets lagrede saks-/befaringsansvarlige.
if (salesSurveySource) {
  requireText(
    salesSurveySource,
    "const storedResponsible = String(",
    `${salesSurveyPath}: lagret ansvarlig brukes ikke som supportreferanse.`
  );
  requireText(
    salesSurveySource,
    "if (supportMode) {",
    `${salesSurveyPath}: befaring er ikke skrivebeskyttet i supportmodus.`
  );
}

// Befaring -> tilbud: både befaringsnotat og direkte tilbud uten notat er godkjente flyter.
if (salesDetailCoreSource) {
  requireText(
    salesDetailCoreSource,
    'data-sales-regression-inspection-note="true"',
    `${salesDetailCorePath}: Befaring mangler eksplisitt vei til befaringsnotat.`
  );
  requireText(
    salesDetailCoreSource,
    'data-sales-regression-direct-offer="true"',
    `${salesDetailCorePath}: Befaring kan ikke lenger gå direkte til tilbud uten befaringsnotat.`
  );
  requireText(
    salesDetailCoreSource,
    "Opprett tilbud uten befaringsnotat",
    `${salesDetailCorePath}: teksten for direkte tilbud uten befaringsnotat mangler.`
  );
}

if (salesDetailSource) {
  requireText(
    salesDetailSource,
    'import SalesDetailViewCore from "./SalesDetailViewCore.jsx";',
    `${salesDetailPath}: presentasjons-wrapper rundt SalesDetailViewCore mangler.`
  );
  requireText(
    salesDetailSource,
    "hasMeaningfulOfferDraft",
    `${salesDetailPath}: eksisterende tilbudskladd detekteres ikke før label velges.`
  );
  requireText(
    salesDetailSource,
    'return "Fortsett på tilbud";',
    `${salesDetailPath}: eksisterende Befaring-tilbud vises ikke som «Fortsett på tilbud».`
  );
}

// Tilbudsrecovery: lokal kladd lagres på stabil nøkkel med bruker-ID før saksnummer.
if (salesLocalStorageSource) {
  requireText(
    salesLocalStorageSource,
    'const requestSuffix = `:${requestId}`;',
    `${salesLocalStoragePath}: recovery mangler generell requestId-suffiks for stabil tilbudskladd.`
  );
  requireText(
    salesLocalStorageSource,
    'key.includes(":offer-draft:")',
    `${salesLocalStoragePath}: recovery skanner ikke tilbudskladdnøkler eksplisitt.`
  );
  requireText(
    salesLocalStorageSource,
    "key.endsWith(requestSuffix)",
    `${salesLocalStoragePath}: stabil tilbudskladd med bruker-ID kan ikke finnes igjen.`
  );
}

// Prosjektaktivering: dobbel sperre i både presentasjon og service-lag.
if (salesActivationSource) {
  requireText(
    salesActivationSource,
    "if (supportMode) {",
    `${salesActivationPath}: prosjektaktivering er ikke sperret i support-UI.`
  );
}

if (salesSupabaseGuardSource) {
  const activationSection = sectionBetween(
    salesSupabaseGuardSource,
    "export async function createSalesProject(client, projectRow)",
    "export function fetchProfileById",
    "createSalesProject"
  );

  if (activationSection) {
    requireText(
      activationSection,
      "if (isSalesSupportMode()) {",
      `${salesSupabaseBasePath}: service-laget tillater prosjektaktivering i supportmodus.`
    );
  }

  requireText(
    salesSupabaseGuardSource,
    "acceptedOfferLines",
    `${salesSupabaseBasePath}: aksepterte tilbudslinjer overføres ikke til prosjektgrunnlaget.`
  );
  requireText(
    salesSupabaseGuardSource,
    "acceptedOptions",
    `${salesSupabaseBasePath}: valgte aksepterte opsjoner overføres ikke til prosjektgrunnlaget.`
  );
  requireText(
    salesSupabaseGuardSource,
    'documentType: "accepted-offer-attachment"',
    `${salesSupabaseBasePath}: aksepterte tilbudsvedlegg mangler dokumentmerking.`
  );
  requireText(
    salesSupabaseGuardSource,
    'role: "kunde"',
    `${salesSupabaseBasePath}: prosjektbundne private salgsdokumenter mangler kunderolle.`
  );
}

// Private dokumenter: Preview/portal skal beholde aktiv origin og verifisert portalsesjon.
if (bootstrapSource) {
  requireText(
    bootstrapSource,
    "rewritePrivateDocumentAnchorForCurrentOrigin",
    `${bootstrapPath}: private dokumentlenker omskrives ikke til aktiv app-origin.`
  );
  requireText(
    bootstrapSource,
    "documentProjectId === currentProjectId",
    `${bootstrapPath}: prosjekt-ID kontrolleres ikke før portalens private dokument åpnes.`
  );
  requireText(
    bootstrapSource,
    "window.location.assign(privateDocumentUrl.toString())",
    `${bootstrapPath}: portalens private dokument åpnes ikke i samme fane; sessionStorage kan gå tapt.`
  );
}

if (privateDocumentRedirectSource) {
  requireText(
    privateDocumentRedirectSource,
    "resolveAuthenticatedSalesCompanyScope",
    `${privateDocumentRedirectPath}: autentisert firmascope for private salgsdokumenter mangler.`
  );
  requireText(
    privateDocumentRedirectSource,
    "privateSalesRequestRefFromLogicalPath",
    `${privateDocumentRedirectPath}: requestRef utledes ikke fra privat salgsdokument.`
  );
  requireText(
    privateDocumentRedirectSource,
    "requestRef !== projectRequestRef",
    `${privateDocumentRedirectPath}: privat salgsdokument valideres ikke mot prosjektets salgssak.`
  );
  requireText(
    privateDocumentRedirectSource,
    "window.sessionStorage.getItem(portalStorageKey(projectId, role))",
    `${privateDocumentRedirectPath}: verifisert portaltilgang gjenbrukes ikke fra sessionStorage.`
  );
  requireText(
    privateDocumentRedirectSource,
    "createSignedUrl(physicalPath, 10 * 60",
    `${privateDocumentRedirectPath}: private dokumenter bruker ikke kortlivet signert Storage-lenke.`
  );
}

if (failures.length) {
  console.error("\n❌ Expo ProffDok critical build check FEILET:\n");
  failures.forEach((failure) => console.error(`- ${failure}`));
  console.error("\nBuild stoppes før Vercel deploy.\n");
  process.exit(1);
}

console.log("✅ Expo ProffDok critical build check OK");
