import fs from "node:fs";

function read(path) {
  return fs.readFileSync(path, "utf8");
}

function requireNeedles(path, needles) {
  const text = read(path);
  for (const needle of needles) {
    if (!text.includes(needle)) {
      throw new Error(`${path}: mangler tilgangs-/mobilguard: ${needle}`);
    }
  }
  return text;
}

const approvalGuard = requireNeedles(
  "supabase/migrations/20260911131500_fase41b3g_approval_guard.sql",
  [
    "Godkjenning og deaktivering kan bare endres av systemadministrator",
    "Firmainvitasjon kan ikke godkjenne eller reaktivere en bruker",
    "new.approved is distinct from old.approved",
    "new.deactivated is distinct from old.deactivated",
    "if v_is_systemadmin then return new",
    "i.status in ('pending', 'active')",
  ]
);

if (/coalesce\(new\.approved,\s*false\)\s*<>\s*true/i.test(approvalGuard)) {
  throw new Error("Firmainvitasjon skal ikke kreve eller gi approved=true.");
}

const companyPolicy = requireNeedles(
  "supabase/migrations/20260915155500_fase42k_company_approval_and_internal_access_policy.sql",
  [
    "fase42k_require_company_before_approval",
    "Velg firma før brukeren godkjennes",
    "coalesce(old.approved, false) = false",
    "nullif(trim(coalesce(new.company_name, '')), '') is null",
    "fase42k_cleanup_internal_access_on_company_change",
    "Ringside Rørleggerbedrift AS",
    "Bademiljø Expo",
    "Expo Proffsenter",
    "module_key = 'store_offers'",
    "feature_key = 'view_internal_net_prices'",
  ]
);

if (/update\s+public\.profiles/i.test(companyPolicy)) {
  throw new Error("42K skal ikke backfille eller endre eksisterende profiler som del av policy-migrasjonen.");
}

const companyPolicyUx = requireNeedles("src/modules/access/systemAdminUserPolicyGuard.js", [
  "Velg Firma for brukeren før du godkjenner",
  "Enkel ordre / Proff vareregister",
  "company_has_pro_catalog",
  "Aktiver minst én leverandør for firmaet under Proff vareregister først",
  "INTERNAL_STORE_COMPANIES",
  "listManagedModuleAccess",
  "guardApprovalWithoutCompany",
]);

if (companyPolicyUx.includes("supabase.from(") || companyPolicyUx.includes(".update(")) {
  throw new Error("Systemadmin UX-guard skal ikke skrive direkte til database.");
}
if (companyPolicyUx.includes("appendHelpLine") || companyPolicyUx.includes("applySystemAdminHelpPolicy")) {
  throw new Error("Tilgangs-UX skal ikke manipulere Hjelp utenfor React-kjernen.");
}

const unifiedUserAccess = requireNeedles("src/modules/access/systemAdminUnifiedUserAccessUx.jsx", [
  "Brukere og tilganger",
  "Hovedmoduler og prisinnsyn styres her på samme brukerkort",
  "Enkel ordre / Proff vareregister",
  "Se «Din nto pris»",
  "Se interne nettopriser",
  "setManagedModuleAccess",
  "setManagedInternalNetPriceAccess",
  "setManagedProCatalogNetPriceAccess",
]);
if (unifiedUserAccess.includes("supabase.from(") || unifiedUserAccess.includes(".update(")) {
  throw new Error("Samlet brukerflate skal kun bruke autoriserte RPC-klienter.");
}

const help = requireNeedles("src/modules/help/helpToolsCore.js", [
  "Firma må være valgt før en ny bruker kan godkjennes",
  "Butikktilbud kan bare tildeles Ringside Rørleggerbedrift AS, Bademiljø Expo og Expo Proffsenter",
  "Expo Proffsenter-logo kan brukes som standardlogo",
]);
if (help.includes("DOM-innsprøyting") && !help.includes("Ingen DOM-innsprøyting")) {
  throw new Error("React-Hjelp skal ikke erstattes med DOM-innsprøyting.");
}

const priceSearch = requireNeedles("src/modules/storeCatalog/storePriceSearchUx.jsx", [
  'const MOBILE_BUTTON_ID = "expo-price-search-mobile-button"',
  'document.querySelector(".mobileMenuQuickGrid")',
  'button.className = "secondary mobileMenuQuickButton"',
  'button.style.gridColumn = "1 / -1"',
  'icon.textContent = "🔎"',
  'label.textContent = "Prissøk"',
  "grid.appendChild(button)",
  "findInternalNav() || findMobileQuickGrid()",
  'window.addEventListener("expo-proffdok-module-access"',
  'rpcWithStoredSession("current_user_has_internal_store_price_search_access")',
]);

if (!priceSearch.includes("syncMobileButton();")) {
  throw new Error("Prissøk må synkroniseres inn som mobil hurtigtilgang.");
}
if (priceSearch.includes('document.querySelector(".mobileAllFunctionsGrid")')) {
  throw new Error("Prissøk skal ikke lenger plasseres nederst i Alle funksjoner.");
}

const portalGuard = requireNeedles("src/modules/storeCatalog/priceSearchPortalGuard.js", [
  "priceSearchPrintPortal",
  "expo-price-search-inline",
  "portals.forEach((portal) => portal.remove())",
  'activePortal.style.display = "none"',
]);
if (!portalGuard.includes("MutationObserver")) {
  throw new Error("Prissøk må rydde foreldreløse printportaler også etter remount/dvale.");
}

requireNeedles("src/modules/app/mobileResponsive41A.css", [
  "[data-systemadmin-unified-access] input[type=\"checkbox\"]",
  "[data-systemadmin-work-profiles] input[type=\"checkbox\"]",
  "width: 24px !important",
  "flex: 0 0 24px !important",
  "grid-template-columns: minmax(0, 1fr) !important",
]);

requireNeedles("index.html", ["installSystemAdminUserPolicyGuard"]);

console.log("✅ Expo ProffDok samlet brukeradgang / mobil Prissøk / portal-opprydding check OK");
