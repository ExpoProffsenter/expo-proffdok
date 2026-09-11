import fs from "node:fs";

const migration = fs.readFileSync(
  "supabase/migrations/20260911133000_fase41b5c_internal_commerce_access_guard.sql",
  "utf8"
);
const priceUx = fs.readFileSync(
  "src/modules/storeCatalog/storePriceSearchUx.jsx",
  "utf8"
);
const surveyStoreUx = fs.readFileSync(
  "src/modules/sales/storeOfferFromSurveyUx.jsx",
  "utf8"
);
const surveyFilterUx = fs.readFileSync(
  "src/modules/sales/salesSurveyFilterUx.js",
  "utf8"
);
const index = fs.readFileSync("index.html", "utf8");

const requiredMigration = [
  "current_user_has_internal_store_catalog_access",
  "current_user_has_internal_store_price_search_access",
  "current_user_has_module_access('store_offers')",
  "is_internal_work_profile_company(public.current_active_company_scope_id())",
  "Kun systemadministrator kan gi eller fjerne tilgang til Butikktilbud og Prissøk.",
  "Ringside Rørleggerbedrift AS",
  "Bademiljø Expo",
  "Expo Proffsenter",
];

for (const marker of requiredMigration) {
  if (!migration.includes(marker)) {
    throw new Error(`41B.5C critical: mangler sikkerhetsmarkør i migrasjon: ${marker}`);
  }
}

if (!priceUx.includes("current_user_has_internal_store_price_search_access")) {
  throw new Error("41B.5C critical: Prissøk må fortsatt spørre backend om tilgang før meny vises.");
}

for (const company of [
  "Ringside Rørleggerbedrift AS",
  "Bademiljø Expo",
  "Expo Proffsenter",
]) {
  if (!surveyStoreUx.includes(company)) {
    throw new Error(`41B.5C critical: Befaring → Butikktilbud mangler internt firma: ${company}`);
  }
}

if (!surveyStoreUx.includes('hasModuleAccess(access, "store_offers")')) {
  throw new Error("41B.5C critical: Befaring → Butikktilbud mangler eksplisitt store_offers-gate.");
}

for (const marker of [
  'BUTTON_ID = "expo-sales-survey-filter"',
  'SURVEY_QUERY = "Befaring"',
  'aria-label="Arbeidsstatus"',
  "setReactInputValue",
]) {
  if (!surveyFilterUx.includes(marker)) {
    throw new Error(`41B.5C critical: Befaring-filter mangler markør: ${marker}`);
  }
}

if (!index.includes("installSalesSurveyFilterUx")) {
  throw new Error("41B.5C critical: Befaring-filter er ikke installert i app-shell.");
}

console.log(
  "✅ Expo ProffDok intern handel / systemadmin-tildeling / Befaring-filter check OK"
);
