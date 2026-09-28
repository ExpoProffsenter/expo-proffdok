import { execFileSync } from "node:child_process";

const ROOT_README = "README.md";
const ARCHITECTURE = "docs/architecture/EXPO_PROFFDOK_ARCHITECTURE.md";
const SALES_README = "src/modules/sales/README.md";

const isHelpFile = (file) => file.startsWith("src/modules/help/");

const isDocumentationOrQaOnly = (file) =>
  file === ROOT_README ||
  file === ARCHITECTURE ||
  file === SALES_README ||
  file.startsWith("docs/") ||
  isHelpFile(file) ||
  file.startsWith(".github/") ||
  file.startsWith("scripts/");

const isProductionImpacting = (file) => {
  if (isDocumentationOrQaOnly(file)) return false;
  if (file.startsWith("src/")) return true;
  if (file.startsWith("supabase/")) return true;
  if (file === "vite.config.js" || file === "index.html" || file === "package.json") return true;
  return false;
};

const isSalesDomainChange = (file) =>
  file.startsWith("src/modules/sales/") ||
  file.startsWith("src/modules/storeCatalog/") ||
  (file.startsWith("supabase/") && /(sales|offer|store_catalog|simple_order|catalog)/i.test(file));

export function evaluateReleaseDocumentation(files = []) {
  const changed = [...new Set(files.map((file) => String(file || "").trim()).filter(Boolean))];
  if (!changed.some(isProductionImpacting)) return [];

  const missing = [];
  if (!changed.includes(ROOT_README)) missing.push(ROOT_README);
  if (!changed.includes(ARCHITECTURE)) missing.push(ARCHITECTURE);
  if (!changed.some(isHelpFile)) missing.push("src/modules/help/<relevant HJELP-file>");

  if (changed.some(isSalesDomainChange) && !changed.includes(SALES_README)) {
    missing.push(SALES_README);
  }

  return missing;
}

function runSelfTest() {
  const assert = (condition, message) => {
    if (!condition) throw new Error(`Release-docs self-test feilet: ${message}`);
  };

  assert(
    evaluateReleaseDocumentation(["docs/qa/NOTE.md"]).length === 0,
    "Ren dokumentasjon/QA skal ikke kreve release-dokumentasjon."
  );

  const missingCore = evaluateReleaseDocumentation(["src/modules/project/example.js"]);
  assert(missingCore.includes(ROOT_README), "Kodeendring skal kreve root README.");
  assert(missingCore.includes(ARCHITECTURE), "Kodeendring skal kreve hoved-arkitekturkart.");
  assert(missingCore.some((item) => item.startsWith("src/modules/help/")), "Kodeendring skal kreve HJELP.");

  assert(
    evaluateReleaseDocumentation([
      "src/modules/project/example.js",
      ROOT_README,
      ARCHITECTURE,
      "src/modules/help/helpTools.js",
    ]).length === 0,
    "Kjerneendring med README + arkitektur + HJELP skal passere."
  );

  const missingSales = evaluateReleaseDocumentation([
    "src/modules/sales/example.js",
    ROOT_README,
    ARCHITECTURE,
    "src/modules/help/helpTools.js",
  ]);
  assert(missingSales.includes(SALES_README), "Sales-endring skal også kreve Sales README.");

  assert(
    evaluateReleaseDocumentation([
      "src/modules/sales/example.js",
      ROOT_README,
      ARCHITECTURE,
      SALES_README,
      "src/modules/help/helpTools.js",
    ]).length === 0,
    "Sales-endring med all påkrevd dokumentasjon skal passere."
  );

  console.log("✅ Production release documentation self-test OK");
}

function changedFilesAgainst(baseRef) {
  try {
    const output = execFileSync(
      "git",
      ["diff", "--name-only", `${baseRef}...HEAD`],
      { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }
    );
    return output.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  } catch (error) {
    const stderr = String(error?.stderr || error?.message || error).trim();
    throw new Error(
      `Kunne ikke kontrollere release-dokumentasjon mot ${baseRef}. Sperren feiler lukket. ${stderr}`
    );
  }
}

if (process.argv.includes("--self-test")) {
  runSelfTest();
  process.exit(0);
}

const requestedBase = String(process.argv[2] || "").trim();
const baseRef = requestedBase ||
  (process.env.GITHUB_BASE_REF ? `origin/${process.env.GITHUB_BASE_REF}` : "origin/main");

const changedFiles = changedFilesAgainst(baseRef);
const missing = evaluateReleaseDocumentation(changedFiles);

if (missing.length) {
  console.error("\n❌ Production release documentation: mangler påkrevd dokumentasjon.\n");
  console.error("Denne PR-en endrer produksjonspåvirkende kode/backend/config og kan ikke merges til main før følgende er oppdatert i samme PR:");
  missing.forEach((file) => console.error(`  - ${file}`));
  console.error("\nOppdater dokumentasjonen slik at repositoryet alene beskriver gjeldende løsning. Chat-historikk skal ikke være nødvendig for overlevering.");
  process.exit(1);
}

console.log("✅ Production release documentation OK");
