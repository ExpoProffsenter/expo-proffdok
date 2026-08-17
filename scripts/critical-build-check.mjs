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

const reportSource = readRequiredFile(reportPath);
const mainSource = readRequiredFile(mainPath);
const boundarySource = readRequiredFile(boundaryPath);

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

if (failures.length) {
  console.error("\n❌ Expo ProffDok critical build check FEILET:\n");
  failures.forEach((failure) => console.error(`- ${failure}`));
  console.error("\nBuild stoppes før Vercel deploy.\n");
  process.exit(1);
}

console.log("✅ Expo ProffDok critical build check OK");
