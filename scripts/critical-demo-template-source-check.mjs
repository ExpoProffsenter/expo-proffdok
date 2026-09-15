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
const workProfileClient = read("src/modules/access/workProfileClient.js");
const workProfileUx = read("src/modules/access/workProfileUx.jsx");

assertContains(
  client,
  'DEMO_TEMPLATE_COMPANY_ID = "ab801c5d-ec8e-42ab-b382-849d48ba0686"',
  "42L: kanonisk Ringside-scope for Andreas-malen mangler."
);
assertNotContains(
  client,
  '.from("sales_company_scopes")',
  "42L: Demo/Test skal ikke bruke RLS-blokkert sales_company_scopes for Andreas-malen."
);
assertContains(
  client,
  '.from("sales_offer_templates")',
  "42L: Andreas-malen må leses direkte fra tilbudsmalene."
);
assertContains(
  client,
  '.eq("company_id", DEMO_TEMPLATE_COMPANY_ID)',
  "42L: Andreas-malen må leses fra eksplisitt kanonisk Ringside-scope."
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
  workProfileClient,
  'EXPO_PROFFSENTER_COMPANY_NAME = "Expo Proffsenter"',
  "42L: eksplisitt Expo Proffsenter-branding mangler."
);
assertContains(
  workProfileClient,
  "1777576456114-pm0wocm9lamolv4joy-Expo_proffsenter.png",
  "42L: eksisterende Expo Proffsenter-logo fra Storage må brukes som fallback for firmaet."
);
assertContains(
  workProfileClient,
  "if (explicitLogo || companyName !== EXPO_PROFFSENTER_COMPANY_NAME) return profile;",
  "42L: eksplisitte firmalogoer og andre firmaer må passere urørt."
);
assertContains(
  workProfileUx,
  'profile.logoUrl || "/expo-logo.png"',
  "42L: generell etablert logo-fallback i headeren skal fortsatt finnes."
);
assertContains(
  client,
  'companyProfile?.logoUrl || "/expo-logo.png"',
  "42L: demo-prosjektet skal fortsatt ha generell fallback hvis aktiv firmaprofil mangler logo."
);

console.log("✅ Demo/Test 42L canonical Andreas source / Expo Proffsenter branding check OK");
