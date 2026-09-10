import fs from "node:fs";

function read(path) {
  return fs.readFileSync(path, "utf8");
}

function requireNeedles(path, needles) {
  const text = read(path);
  for (const needle of needles) {
    if (!text.includes(needle)) {
      throw new Error(`${path}: mangler kritisk 41B.2/41B.3-guard: ${needle}`);
    }
  }
  return text;
}

const migration = requireNeedles(
  "supabase/migrations/20260910132000_fase41b2_internal_price_search.sql",
  [
    "current_user_has_internal_store_price_search_access",
    "search_internal_store_catalog_prices",
    "Ringside Rørleggerbedrift AS",
    "Bademiljø Expo",
    "Expo Proffsenter",
    "coalesce(p.approved, false) = true",
    "coalesce(p.deactivated, false) = false",
    "security definer",
    "grant execute",
  ]
);

if (migration.includes("create or replace function public.current_user_has_internal_store_catalog_access")) {
  throw new Error("41B.2 skal ikke endre eksisterende Butikktilbud-katalogtilgang.");
}
if (/\b(insert|update|delete|truncate)\b/i.test(migration.replace(/--.*$/gm, ""))) {
  throw new Error("41B.2 Prissøk-migration skal være read-only og ikke skrive katalogdata.");
}

const sensitiveMigration = requireNeedles(
  "supabase/migrations/20260910133600_fase41b2a_sensitive_net_price_access.sql",
  [
    "user_feature_access",
    "view_internal_net_prices",
    "current_user_has_feature_access",
    "set_managed_sensitive_access",
    "Kun systemadministrator kan endre tilgang til interne nettopriser",
    "case when v_can_net then i.purchase_net_ex_vat else null end",
    "case when v_can_net then i.purchase_discount_percent else null end",
    "case when v_can_net then i.gross_margin_percent else null end",
    "create or replace function public.search_internal_store_catalog(",
    "create or replace function public.internal_store_catalog_alternatives(",
    "create or replace function public.search_internal_store_catalog_prices(",
  ]
);

if (sensitiveMigration.includes("create or replace function public.current_user_has_internal_store_catalog_access")) {
  throw new Error("41B.2A skal ikke utvide eksisterende Butikktilbud-firmatilgang.");
}

requireNeedles(
  "supabase/migrations/20260910134500_fase41b2a_sensitive_access_null_role_fix.sql",
  [
    "v_target_is_systemadmin := coalesce(v_target.system_role,'') = 'systemadmin'",
    "not v_target_is_systemadmin",
  ]
);

const view = requireNeedles("src/modules/storeCatalog/StorePriceSearchView.jsx", [
  "Prissøk",
  "search_internal_store_catalog_prices",
  "Kundepris inkl. mva.",
  "Kundepris eks. mva.",
  "Intern netto eks. mva.",
  "hasNetPrice",
  "Intern nto-pris vises bare for brukere med egen tilgang",
  "selectedProducts",
  "Valgte varer",
  "Midlertidig arbeidsliste",
  "Tøm liste",
  "purchase_discount_percent",
  "gross_margin_percent",
  "setSelectedProducts",
  "sessionStorage.getItem",
  "sessionStorage.setItem",
  "sessionStorage.removeItem",
  "toStoredReference",
  "restoreStoredProducts",
  "Skriv ut",
  "Inkluder interne priser",
  "window.print()",
  "createPortal",
  "priceSearchPrintPortal",
]);

if (/\b(?:supabase|client)\s*\.\s*from\s*\(/.test(view) || /\.insert\s*\(|\.update\s*\(|\.upsert\s*\(/.test(view)) {
  throw new Error("StorePriceSearchView skal ikke skrive direkte til database.");
}
if (/(?:window\.)?localStorage\s*\.\s*(?:getItem|setItem|removeItem|clear)\s*\(|\bindexedDB\s*\./i.test(view)) {
  throw new Error("Prissøk-arbeidslisten skal ikke bruke varig lokal lagring.");
}
const storedReferenceBlock = view.match(/function toStoredReference\(item\) \{[\s\S]*?\n\}/)?.[0] || "";
if (!storedReferenceBlock || /purchase_net_ex_vat|purchase_discount_percent|gross_margin_percent|customer_price_/i.test(storedReferenceBlock)) {
  throw new Error("sessionStorage skal bare lagre vare-ID/oppslagsnøkler, aldri pris- eller marginfelt.");
}
if (!view.includes("restoreStoredProducts") || !view.includes("searchPrices(lookup, 10)")) {
  throw new Error("Mobil-sikker arbeidsliste skal rehydreres via backend etter reload.");
}
if (/Tilbake til Expo ProffDok|priceSearchShell|aria-modal=/.test(view)) {
  throw new Error("Prissøk skal ligge inne i appens arbeidsflate, ikke som fullskjerm-overlay.");
}

const storeOfferTools = requireNeedles("src/modules/storeCatalog/StoreCatalogOfferTools.jsx", [
  "hasNetPrice",
  "Intern nto",
  "hasNetPrice ?",
]);
if (storeOfferTools.includes("Intern nto {formatMoney(item.purchase_net_ex_vat)}") && !storeOfferTools.includes("hasNetPrice ?")) {
  throw new Error("Butikktilbud må skjule nto helt når backend maskerer feltet.");
}

const ux = requireNeedles("src/modules/storeCatalog/storePriceSearchUx.jsx", [
  'button.textContent = "Prissøk"',
  "current_user_has_internal_store_price_search_access",
  "ringside rorleggerbedrift as",
  "bademiljo expo",
  "expo proffsenter",
  "SYSTEMADMIN SUPPORTMODUS",
  "expoPriceSearchActive",
  "StorePriceSearchView",
]);

if (/\b(?:supabase|client)\s*\.\s*from\s*\(/.test(ux) || /\.insert\s*\(|\.update\s*\(|\.upsert\s*\(/.test(ux)) {
  throw new Error("storePriceSearchUx skal ikke skrive direkte til database.");
}

requireNeedles("src/modules/access/sensitiveAccessClient.js", [
  "view_internal_net_prices",
  "set_managed_sensitive_access",
]);

const unifiedAdmin = requireNeedles("src/modules/access/systemAdminUnifiedUserAccessUx.jsx", [
  "Brukere og tilganger",
  "Se interne nettopriser",
  "setManagedModuleAccess",
  "setManagedInternalNetPriceAccess",
  "expo-module-access-manager",
  'mount.style.display = "none"',
  "Kun systemadministrator kan gi denne tilgangen",
]);
if (!unifiedAdmin.includes("targetIsSystemAdmin") || !unifiedAdmin.includes("disabled={targetIsSystemAdmin")) {
  throw new Error("Systemadministrator-rader skal være låst og alltid ha alle tilganger.");
}

const help = requireNeedles("src/modules/help/priceSearchHelpUx.js", [
  "🔎 Prissøk",
  "Prissøk oppretter eller endrer aldri tilbud, prosjekter eller vareregisteret",
  "Se interne nettopriser",
  "Uten rettigheten sendes de sensitive prisfeltene ikke fra serveren",
  "Systemadmin behandler nå brukerstatus, firma, rolle, hovedmoduler og eventuell nto-pristilgang på samme brukerkort",
  "godkjente og aktive brukere",
  "applyStoreHelpEligibility",
  "approvedActiveHelpHidden",
  'hasModuleAccess(access, "store_offers")',
  'button.setAttribute("aria-expanded", "false")',
  'headerRow.style.justifyContent = "space-between"',
]);
if (help.includes("new MutationObserver")) {
  throw new Error("Prissøk-Hjelp skal ikke innføre en ny global MutationObserver.");
}

requireNeedles("docs/architecture/FASE41B2_PRICE_SEARCH_AND_SENSITIVE_ACCESS.md", [
  "Prissøk, sensitiv nto-tilgang og samlet brukeradministrasjon",
  "view_internal_net_prices",
  "server-side",
  "FASE 41B.3",
]);

requireNeedles("index.html", [
  "installStorePriceSearchUx",
  "installSystemAdminUnifiedUserAccessUx",
  "installPriceSearchHelpUx",
]);

console.log("✅ Expo ProffDok Prissøk / sensitiv tilgang / mobil-sikker arbeidsliste / utskrift check OK");
