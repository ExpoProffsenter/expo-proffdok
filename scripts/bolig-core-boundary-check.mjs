import assert from "node:assert/strict";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import {
  supplierOrderMail,
  supplierOrderFrom,
} from "../supabase/functions/_shared/supplier-order-email.mjs";

// Compare the full current checkout with actual main, including unstaged work.
// The generic Demo guard remains unchanged and is not a Bolig scope guard.
const base = process.argv[2] || "origin/main";
const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();
const files = git("diff", "--name-only", base).split("\n").filter(Boolean);
if (
  !files.some(
    (p) =>
      p.startsWith("src/modules/bolig/") ||
      /supabase\/(functions\/(_shared\/)?bolig-|migrations\/\d+_bolig)/.test(p),
  )
) {
  console.log("Bolig core boundary: not applicable (no Bolig feature change)");
  process.exit(0);
}
const integrations = new Set([
  ".github/workflows/pr-core-safety.yml",
  "PROJECT_GUARDRAILS.md",
  "README.md",
  "bolig-kunde.html",
  "src/boligResident.jsx",
  "src/main.jsx",
  "src/modules/app/SystemAdminWorkspace.jsx",
  "src/modules/app/WorkspaceViewMode.jsx",
  "src/modules/app/workspaceViewMode.css",
  "src/modules/company/CompanyAdminPanel.jsx",
  "src/modules/kshms/KshmsProgressBoard.jsx",
  "src/modules/project/projectNavigationTabs.mjs",
  "src/modules/personal/PersonalPage.jsx",
  "src/modules/access/PeopleModuleAccess.jsx",
  "src/modules/deviations/DeviationDialog.jsx",
  "src/modules/ui/DialogPortalTarget.js",
  "src/modules/sales/README.md",
  "supabase/config.toml",
  "vite.config.js",
  "supabase/functions/_shared/supplier-order-email.mjs",
  "scripts/project-mobile-header-browser-check.mjs",
  "scripts/people-module-access-react-check.mjs",
  "scripts/time-registration-db-check.mjs",
  "scripts/fixtures/rpc-retry-legacy-migrations.json",
  "api/bolig-contract-review.mjs",
  "package.json",
  "package-lock.json",
]);
const inScope = (p) =>
  integrations.has(p) ||
  p.startsWith("docs/") ||
  p.startsWith("src/modules/bolig/") ||
  p.startsWith("src/modules/help/Bolig") ||
  p.startsWith("public/bolig/") ||
  p.startsWith("scripts/bolig-") ||
  p.startsWith("scripts/fixtures/bolig-") ||
  /^supabase\/migrations\/\d+_bolig[^/]*\.sql$/.test(p) ||
  p.startsWith("supabase/functions/bolig-") ||
  p.startsWith("supabase/functions/_shared/bolig-");
assert.deepEqual(
  files.filter((p) => !inScope(p)),
  [],
  "Unreviewed files outside Bolig scope",
);
// Private contract OCR/analysis adds only pinned libraries. Existing scripts,
// dependencies and package settings retain their exact main values.
const basePackage=JSON.parse(git('show',`${base}:package.json`));
const contractPackage=JSON.parse(fs.readFileSync('package.json','utf8'));
for(const [name,version] of Object.entries({'ai':'7.0.153','@hyzyla/pdfium':'3.0.0','tesseract.js':'7.0.0','@tesseract.js-data/nor':'1.0.0','@tesseract.js-data/eng':'1.0.0'})){
 assert.equal(contractPackage.dependencies[name],version,'Only reviewed pinned contract libraries may be added');
 delete contractPackage.dependencies[name];
}
assert.deepEqual(contractPackage,basePackage,'Existing package behavior must remain identical');
const baseLock=JSON.parse(git('show',`${base}:package-lock.json`)),contractLock=JSON.parse(fs.readFileSync('package-lock.json','utf8'));
for(const [name,entry] of Object.entries(baseLock.packages||{}))if(name&&entry.version)assert.equal(contractLock.packages[name]?.version,entry.version,`Existing dependency ${name} must not be upgraded or removed`);

// Explicitly requested Min side integration: removing this isolated card must
// reproduce main byte for byte. No HR, time, navigation or profile behavior changes.
const personalPath = "src/modules/personal/PersonalPage.jsx";
const personalBase = git("show", `${base}:${personalPath}`);
const personalCurrent = fs.readFileSync(personalPath,"utf8").trim()
 .replace("const BoligMyTasks=React.lazy(()=>import('../bolig/BoligMyTasks.jsx'));\n","")
 .replace("const BoligPresenceCard=React.lazy(()=>import('../bolig/BoligPresenceCard.jsx'));\n","")
 .replace("  {userId&&authUser?.id===userId&&context?.user_id===userId&&context?.company_id&&<Suspense fallback={null}><BoligPresenceCard key={'presence:'+scope} context={context}/></Suspense>}\n","")
 .replace("   {rights.enabled&&<Suspense fallback={null}><BoligMyTasks key={'tasks:'+scope} context={context}/></Suspense>}\n","");
assert.equal(personalCurrent,personalBase,"Min side may only mount the isolated Bolig presence and task cards");

// Kenneth explicitly included HR for Bolig users. This shared card may only
// display the server-confirmed bundle source; all existing grant controls stay.
const peoplePath="src/modules/access/PeopleModuleAccess.jsx";
const peopleNote='  {saved?.bolig_hr_included&&<p className="note" data-bolig-hr-included>HR er inkludert via Boligprosjekter{userId?\' for denne brukeren\':\'\'}. Avkryssingen for HR nedenfor gjelder separat HR-tilgang. Firmaets HR-oppsett og vanlige innsynsrettigheter gjelder fortsatt.</p>}\n';
assert.equal(fs.readFileSync(peoplePath,"utf8").replace(peopleNote,"").trim(),git("show",`${base}:${peoplePath}`),"Shared people controls may only add the explicit Bolig HR source note");

const dialogPath="src/modules/deviations/DeviationDialog.jsx";
const originalDialog=fs.readFileSync(dialogPath,"utf8")
 .replace("useContext, ","")
 .replace("import {DialogPortalTarget} from '../ui/DialogPortalTarget.js';\n","")
 .replace("  const portalTarget = useContext(DialogPortalTarget);\n","")
 .replace("portalTarget || document.body","document.body").trim();
assert.equal(originalDialog,git("show",`${base}:${dialogPath}`),"Native dialog may only accept the optional containing portal; all default behavior stays identical");

// Old migrations and all existing critical checks must be byte-identical.
const existing = new Set(git("ls-tree", "-r", "--name-only", base).split("\n"));
// CI ran in the repeated Oslo hour on 25 October. Only deterministic fixture
// setup and additional DST assertions may differ; all prior time checks remain.
const timeTestPath='scripts/time-registration-db-check.mjs';
const originalTimeTest=fs.readFileSync(timeTestPath,'utf8')
 .replace(/^ \/\/ BEGIN deterministic time QA clock\n[\s\S]*?^ \/\/ END deterministic time QA clock\n/m,'')
 .replace(/^ \/\/ BEGIN explicit DST QA scenarios\n[\s\S]*?^ \/\/ END explicit DST QA scenarios\n/m,'').trim();
assert.equal(originalTimeTest,git('show',`${base}:${timeTestPath}`),'All existing time-registration assertions must remain byte-identical');
const forbidden = files.filter(
  (p) =>
    existing.has(p) &&
    (p.startsWith("supabase/migrations/") || p.startsWith("scripts/critical-")),
);
assert.deepEqual(forbidden, [], "Existing migration / critical check changed");
// Exporting the existing helper must not change any established supplier code.
const supplierPath = "supabase/functions/_shared/supplier-order-email.mjs";
const before = git("show", `${base}:${supplierPath}`);
assert.equal(
  fs.readFileSync(supplierPath, "utf8").trim(),
  before.replace(
    /^function supplierOrderLogo\(company\)/m,
    "export function supplierOrderLogo(company)",
  ),
  "Supplier mail may only expose the existing helper, with identical behavior",
);
const baseline = await import(
  `data:text/javascript;base64,${Buffer.from(before).toString("base64")}`
);
let checks = 3;
for (const companyName of [
  "QA Firma",
  "Expo Proffsenter",
  "Ringside Rørleggerbedrift",
  "Bademiljø Expo",
]) {
  for (const logoUrl of [
    undefined,
    "",
    " ",
    "/brands/qa.png",
    "https://example.invalid/logo.png",
    "javascript:alert(1)",
  ]) {
    const order = {
      to: "qa@example.invalid",
      supplierName: "QA Grossist",
      reference: "QA-1",
      deliveryAddress: "Eksempelgate 1",
      message: "Kun syntetisk prøve",
      totalNet: 100,
      replyTo: "sender@example.invalid",
      company: {
        companyName,
        logoUrl,
        orgNumber: "999",
        address: "QA gate",
        phone: "123",
      },
      items: [
        {
          id: "item",
          description: "QA Vare",
          number: "001",
          quantity: 1,
          unitNet: 100,
          lineNet: 100,
        },
      ],
    };
    assert.deepEqual(
      supplierOrderMail(order, "qa"),
      baseline.supplierOrderMail(order, "qa"),
    );
    assert.equal(
      supplierOrderFrom("QA <sender@example.invalid>", companyName),
      baseline.supplierOrderFrom("QA <sender@example.invalid>", companyName),
    );
    checks += 2;
  }
}
console.log(
  `Bolig core boundary: PASS (${checks} assertions; ${files.length} reviewed paths vs ${git("rev-parse", "--short", base)})`,
);
