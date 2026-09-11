import fs from "node:fs";

function read(path) {
  return fs.readFileSync(path, "utf8");
}

function requireNeedles(path, needles) {
  const text = read(path);
  for (const needle of needles) {
    if (!text.includes(needle)) {
      throw new Error(`${path}: mangler 41B.3G-guard: ${needle}`);
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

const priceSearch = requireNeedles("src/modules/storeCatalog/storePriceSearchUx.jsx", [
  'const MOBILE_BUTTON_ID = "expo-price-search-mobile-button"',
  'document.querySelector(".mobileAllFunctionsGrid")',
  'button.className = "secondary mobileMenuAllButton"',
  'button.textContent = "Prissøk"',
  "grid.appendChild(button)",
  "findInternalNav() || findMobileFunctionsGrid()",
  'window.addEventListener("expo-proffdok-module-access"',
  'rpcWithStoredSession("current_user_has_internal_store_price_search_access")',
]);

if (!priceSearch.includes("syncMobileButton();")) {
  throw new Error("Prissøk må synkroniseres inn i dagens mobile Alle funksjoner-meny.");
}

requireNeedles("src/modules/app/mobileResponsive41A.css", [
  "[data-systemadmin-unified-access] input[type=\"checkbox\"]",
  "[data-systemadmin-work-profiles] input[type=\"checkbox\"]",
  "width: 24px !important",
  "flex: 0 0 24px !important",
  "grid-template-columns: minmax(0, 1fr) !important",
]);

console.log("✅ Expo ProffDok mobil Prissøk / Systemadmin-layout / godkjenningsgrense check OK");
