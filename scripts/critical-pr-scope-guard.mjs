import { execFileSync } from "node:child_process";

const DEMO_MARKERS = [
  (file) => file.startsWith("src/modules/demo/"),
  (file) => file.startsWith("scripts/critical-demo-"),
  (file) => file === "demo-offer-preview.html",
  (file) => file === "demo-control.html",
  (file) => file === "public/demo-showcase.html",
  (file) => file.startsWith("public/demo-images/"),
  (file) => /demo[-_]/i.test(file) && file.startsWith("docs/"),
];

const ALLOWED_DEMO_PREFIXES = [
  "src/modules/demo/",
  "scripts/critical-demo-",
  "docs/",
  "public/demo/",
  "public/demo-images/",
];

const ALLOWED_DEMO_EXACT = new Set([
  "demo-offer-preview.html",
  "demo-control.html",
  "public/demo-showcase.html",
  "package.json",
  "vite.config.js",
  "README.md",
  "AGENTS.md",
  "PROJECT_GUARDRAILS.md",
  // Smale, eksplisitt avtalte integrasjonspunkter kan legges til her etter egen vurdering.
]);

export function evaluateChangedFiles(files = []) {
  const cleanFiles = [...new Set(files.map((file) => String(file || "").trim()).filter(Boolean))];
  const hasDemoChange = cleanFiles.some((file) => DEMO_MARKERS.some((matches) => matches(file)));
  if (!hasDemoChange) return [];

  return cleanFiles.filter((file) => {
    if (ALLOWED_DEMO_EXACT.has(file)) return false;
    if (ALLOWED_DEMO_PREFIXES.some((prefix) => file.startsWith(prefix))) return false;
    return true;
  });
}

function runSelfTest() {
  const assert = (condition, message) => {
    if (!condition) throw new Error(`PR-scope-guard self-test feilet: ${message}`);
  };

  assert(
    evaluateChangedFiles([
      "src/modules/demo/DemoHomeLauncher.jsx",
      "src/modules/sales/SalesModule.jsx",
    ]).includes("src/modules/sales/SalesModule.jsx"),
    "Demo + SalesModule skal blokkeres."
  );

  assert(
    evaluateChangedFiles([
      "src/modules/demo/DemoHomeLauncher.jsx",
      "src/main.jsx",
    ]).includes("src/main.jsx"),
    "Demo + main.jsx skal blokkeres."
  );

  assert(
    evaluateChangedFiles([
      "public/demo-images/ferdig-bad.jpg",
      "scripts/critical-sales-lazy-loading-check.mjs",
    ]).includes("scripts/critical-sales-lazy-loading-check.mjs"),
    "Demo-PR skal ikke få endre eksisterende Sales-critical-check."
  );

  assert(
    evaluateChangedFiles([
      "src/modules/demo/DemoHomeLauncher.jsx",
      "scripts/critical-demo-suite-check.mjs",
      "docs/architecture/DEMO_SANDBOX_ARCHITECTURE.md",
      "public/demo-images/ferdig-bad.jpg",
      "demo-control.html",
      "package.json",
      "vite.config.js",
    ]).length === 0,
    "Avtalte demo-/dokumentasjonsfiler skal være tillatt."
  );

  assert(
    evaluateChangedFiles(["src/modules/sales/SalesModule.jsx"]).length === 0,
    "En separat core-PR uten demoendringer skal ikke blokkeres av demo-isolasjonsvakten."
  );

  console.log("✅ PR Core Safety self-test OK");
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
      `Kunne ikke sammenligne PR mot ${baseRef}. Scope-vakten feiler lukket. ${stderr}`
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
const violations = evaluateChangedFiles(changedFiles);

if (violations.length) {
  console.error("\n❌ PR Core Safety: Demo/Test-endringen berører beskyttet kjerne.\n");
  console.error("Følgende filer er ikke tillatt i samme PR som Demo/Test:");
  violations.forEach((file) => console.error(`  - ${file}`));
  console.error(
    "\nStopp. Flytt kjerneendringen til en separat PR fra ren main, med eget scope, critical QA, Preview og eksplisitt TEST OK."
  );
  process.exit(1);
}

console.log(
  changedFiles.some((file) => DEMO_MARKERS.some((matches) => matches(file)))
    ? "✅ PR Core Safety OK – Demo/Test er isolert fra beskyttet kjerne"
    : "✅ PR Core Safety OK – ingen Demo/Test-endringer i denne PR-en"
);
