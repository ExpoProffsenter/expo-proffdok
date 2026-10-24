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
  "src/modules/sales/README.md",
  "supabase/config.toml",
  "vite.config.js",
  "supabase/functions/_shared/supplier-order-email.mjs",
  "scripts/project-mobile-header-browser-check.mjs",
  "scripts/fixtures/rpc-retry-legacy-migrations.json",
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

// Explicitly requested Min side integration: removing this isolated card must
// reproduce main byte for byte. No HR, time, navigation or profile behavior changes.
const personalPath = "src/modules/personal/PersonalPage.jsx";
const personalBase = git("show", `${base}:${personalPath}`);
const personalCurrent = fs.readFileSync(personalPath,"utf8").trim()
 .replace("const BoligPresenceCard=React.lazy(()=>import('../bolig/BoligPresenceCard.jsx'));\n","")
 .replace("  {userId&&authUser?.id===userId&&context?.user_id===userId&&context?.company_id&&<Suspense fallback={null}><BoligPresenceCard key={'presence:'+scope} context={context}/></Suspense>}\n","");
assert.equal(personalCurrent,personalBase,"Min side may only mount the isolated presence card");

// Old migrations and all existing critical checks must be byte-identical.
const existing = new Set(git("ls-tree", "-r", "--name-only", base).split("\n"));
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
