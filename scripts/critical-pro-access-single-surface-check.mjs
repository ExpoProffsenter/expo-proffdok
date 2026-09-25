import fs from "node:fs";
import assert from "node:assert/strict";

const storeCatalogUx = fs.readFileSync("src/modules/storeCatalog/systemAdminStoreCatalogUx.jsx", "utf8");
const adminPanel = fs.readFileSync("src/modules/storeCatalog/ProStoreCatalogAdminPanel.jsx", "utf8");
const unifiedSystemAdmin = fs.readFileSync("src/modules/access/systemAdminUnifiedUserAccessUx.jsx", "utf8");
const companyAdmin = fs.readFileSync("src/modules/access/systemAdminCompanyAccessUx.jsx", "utf8");
const companyModal = fs.readFileSync("src/modules/access/systemAdminCompanyModalUx.js", "utf8");
const firmaAdminAccess = fs.readFileSync("src/modules/access/firmaAdminProNetPriceUx.js", "utf8");
const indexHtml = fs.readFileSync("index.html", "utf8");
const aclParity = fs.readFileSync("supabase/migrations/20260924123500_fase45b_baseline_acl_parity.sql", "utf8");

assert(!storeCatalogUx.includes("ProStoreCatalogAdminPanel"), "Proffleverandører skal ikke ligge som separat Systemadmin-flate.");
assert(storeCatalogUx.includes("Internt vareregister"), "Internt ERP-vareregister skal fortsatt være egen systemoppgave.");
assert(!storeCatalogUx.includes("FIRMAADMIN_MOUNT_ID"), "Proff vareregister skal ikke montere en separat Firmaadmin-brukerflate.");
assert(!storeCatalogUx.includes('mode="firmaadmin"'), "Firmaadmin skal ikke få en ekstra prisadministrasjon under Firma.");

assert(companyAdmin.includes("ProStoreCatalogAdminPanel"), "Leverandør/rabatt skal ligge i samlet firmaflate.");
for (const needle of [
  'PANEL_TITLE = "Firmaer, brukere og tilganger"',
  "listManagedModuleAccess",
  "listCatalogCompanies",
  "company_scope_id",
  "aria-expanded",
  "Søk firma, bruker eller e-post",
  "Brukere i firmaet",
  "activeCompanyKey",
  "companyAdminUserCard",
  "INTERNAL_COMMERCE_COMPANIES",
  "STATUS_FILTERS",
  "Nye",
  "Godkjente",
  "Deaktiverte",
  "Systemadmin",
  "Oppdater",
  "hideLegacyToolbar",
  "ensureLegacyUsersLoaded",
  "companyAdminLegacyToolbar",
  "USER_STAGE_ID",
]) {
  assert(companyAdmin.includes(needle), `Samlet firmaflate mangler: ${needle}`);
}
assert(companyAdmin.includes("LEGACY_MARKER_ID"), "Legacy-brukerkort må fortsatt kunne få tilgangskontroller etter firmanavigasjon.");
assert(companyAdmin.includes('text === "Godkjenn bruker"'), "Eksisterende Godkjenn bruker-flyt skal fortsatt trigge reload av samlet firmaflate.");
assert(companyAdmin.includes('text === "Deaktiver bruker"'), "Eksisterende Deaktiver bruker-flyt skal fortsatt trigge reload av samlet firmaflate.");
assert(indexHtml.includes("installSystemAdminCompanyAccessUx"), "Samlet firmaflate må installeres fra app-entry.");

for (const needle of [
  "installSystemAdminCompanyModalUx",
  "data-company-admin-modal-open",
  "Lagre og lukk",
  "dirtyAccessButtons",
  "waitForAccessSaves",
  "Status, firma og rolle lagres med en gang etter bekreftelse",
  "aria-modal",
  "Escape",
  "transform:translate(-50%,-50%)",
  ".company-access-user-heading{display:none!important}",
  "height:auto!important",
  "setTextIfChanged",
  "setAttributeIfChanged",
]) {
  assert(companyModal.includes(needle), `Firmamodal mangler sikker UX-kontrakt: ${needle}`);
}
assert(!companyModal.includes("if (title) title.textContent = activeCompanyName(row)"), "Firmamodal må ikke skrive samme tittel for hver MutationObserver-render.");
assert(!companyModal.includes('if (summary) summary.textContent = activeCompanySummary(row) || "Firmaadministrasjon"'), "Firmamodal må ikke skrive samme summary for hver MutationObserver-render.");
assert(indexHtml.includes("installSystemAdminCompanyModalUx"), "Firmamodal må installeres etter samlet firmaflate.");
assert(indexHtml.indexOf("installSystemAdminCompanyAccessUx") < indexHtml.indexOf("installSystemAdminCompanyModalUx"), "Firmamodal skal installeres etter firmanavigasjonen.");

assert(!adminPanel.includes("Hvem kan se «Din nto pris»"), "Leverandør/rabatt-panelet skal ikke duplisere brukerens Din nto pris-kontroll.");
assert(!adminPanel.includes("listUserNetPriceAccess"), "Leverandør/rabatt-panelet skal ikke hente brukernes pristilganger.");
assert(!adminPanel.includes("setUserNetPriceAccess"), "Leverandør/rabatt-panelet skal ikke endre brukernes pristilganger.");
assert(adminPanel.includes("brukerkortet nedenfor"), "Leverandør/rabatt-panelet skal peke til brukerkortene i samme samlede seksjon.");

for (const needle of ["Brukere og tilganger", "Enkel ordre / Proff vareregister", "Se «Din nto pris»"]) {
  assert(unifiedSystemAdmin.includes(needle), `Systemadmin samlet brukerkort mangler: ${needle}`);
}
for (const needle of ["Se «Din nto pris»", "set_store_catalog_user_net_price_access"]) {
  assert(firmaAdminAccess.includes(needle), `Firmaadmin samlet brukerkort mangler: ${needle}`);
}

for (const needle of [
  "alter function public.module_access_valid_key(text)",
  "set search_path = public, pg_temp",
  "current_profile_is_firmaadmin() from public, anon",
  "current_profile_is_systemadmin() from public, anon",
  "current_sales_company_scope_id() from public, anon",
  "get_my_module_access() from public, anon",
  "get_sales_support_company_profile(uuid) from public, anon",
  "list_sales_request_summaries(uuid) from public, anon",
  "list_sales_support_companies() from public, anon",
  "resolve_sales_company_scope() from public, anon",
  "resolve_sales_support_company_scope(uuid) from public, anon",
  "resolve_sales_support_company_scope_by_name(text) from public, anon",
  "fase38a_transition_seed_modules_on_approval()",
  "from public, anon, authenticated",
]) {
  assert(aclParity.includes(needle), `Final ACL-paritet mangler: ${needle}`);
}

console.log("critical-pro-access-single-surface-check: OK");