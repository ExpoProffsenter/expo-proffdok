import fs from "node:fs";
import assert from "node:assert/strict";

const storeCatalogUx = fs.readFileSync("src/modules/storeCatalog/systemAdminStoreCatalogUx.jsx", "utf8");
const adminPanel = fs.readFileSync("src/modules/storeCatalog/ProStoreCatalogAdminPanel.jsx", "utf8");
const unifiedSystemAdmin = fs.readFileSync("src/modules/access/systemAdminUnifiedUserAccessUx.jsx", "utf8");
const firmaAdminAccess = fs.readFileSync("src/modules/access/firmaAdminProNetPriceUx.js", "utf8");
const aclParity = fs.readFileSync("supabase/migrations/20260924123500_fase45b_baseline_acl_parity.sql", "utf8");

assert(storeCatalogUx.includes("ProStoreCatalogAdminPanel"), "Systemadmin skal fortsatt ha Proff vareregister for leverandør/rabatt.");
assert(!storeCatalogUx.includes("FIRMAADMIN_MOUNT_ID"), "Proff vareregister skal ikke montere en separat Firmaadmin-brukerflate.");
assert(!storeCatalogUx.includes('mode="firmaadmin"'), "Firmaadmin skal ikke få en ekstra prisadministrasjon under Firma.");
assert(!adminPanel.includes("Hvem kan se «Din nto pris»"), "Proff vareregister skal ikke duplisere brukerens Din nto pris-kontroll.");
assert(!adminPanel.includes("listUserNetPriceAccess"), "Leverandør/rabatt-panelet skal ikke hente brukernes pristilganger.");
assert(!adminPanel.includes("setUserNetPriceAccess"), "Leverandør/rabatt-panelet skal ikke endre brukernes pristilganger.");
assert(adminPanel.includes("Brukere og tilganger"), "Proff vareregister skal henvise brukeradministrasjon til samlet brukerkort.");

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
