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

const client = read("src/modules/demo/demoSuiteClient.js");
const workProfileUx = read("src/modules/access/workProfileUx.jsx");

assertContains(
  client,
  'DEMO_TEMPLATE_COMPANY_NAME = "Ringside Rørleggerbedrift AS"',
  "42L: kanonisk Ringside-kilde for Andreas-malen mangler."
);
assertContains(
  client,
  '.from("sales_company_scopes")',
  "42L: demoen må slå opp kanonisk template-scope read-only."
);
assertContains(
  client,
  '.eq("display_name", DEMO_TEMPLATE_COMPANY_NAME)',
  "42L: template-scope må være Ringside Rørleggerbedrift AS."
);
assertContains(
  client,
  '.eq("company_id", templateCompanyId)',
  "42L: Andreas-malen må leses fra kanonisk scope, ikke Representerer-scope."
);
assertContains(
  client,
  '.eq("name", DEMO_TEMPLATE_NAME)',
  "42L: kun eksplisitt Andreas-mal skal kopieres."
);
assertNotContains(
  client,
  '.from("sales_offer_templates")\n    .update',
  "42L: Demo/Test må aldri endre Andreas-malen."
);
assertNotContains(
  client,
  '.from("sales_offer_templates")\n    .delete',
  "42L: Demo/Test må aldri slette Andreas-malen."
);
assertContains(
  workProfileUx,
  'profile.logoUrl || "/expo-logo.png"',
  "42L: den etablerte Expo-logoen skal fortsatt være default når firma mangler egen logo."
);
assertContains(
  client,
  'companyProfile?.logoUrl || "/expo-logo.png"',
  "42L: demo-prosjektet skal bruke samme etablerte Expo-logo fallback."
);

console.log("✅ Demo/Test 42L canonical Andreas source / Expo default logo check OK");
