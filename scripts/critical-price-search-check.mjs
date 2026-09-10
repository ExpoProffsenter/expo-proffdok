import fs from "node:fs";

function read(path) {
  return fs.readFileSync(path, "utf8");
}

function requireNeedles(path, needles) {
  const text = read(path);
  for (const needle of needles) {
    if (!text.includes(needle)) {
      throw new Error(`${path}: mangler kritisk 41B.2-guard: ${needle}`);
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

const view = requireNeedles("src/modules/storeCatalog/StorePriceSearchView.jsx", [
  "Prissøk",
  "search_internal_store_catalog_prices",
  "Kundepris inkl. mva.",
  "Kundepris eks. mva.",
  "Intern netto eks. mva.",
  "uten å opprette et tilbud",
]);

if (/\b(?:supabase|client)\s*\.\s*from\s*\(/.test(view) || /\.insert\s*\(|\.update\s*\(|\.upsert\s*\(/.test(view)) {
  throw new Error("StorePriceSearchView skal ikke skrive direkte til database.");
}

const ux = requireNeedles("src/modules/storeCatalog/storePriceSearchUx.jsx", [
  'button.textContent = "Prissøk"',
  "current_user_has_internal_store_price_search_access",
  "ringside rorleggerbedrift as",
  "bademiljo expo",
  "expo proffsenter",
  "SYSTEMADMIN SUPPORTMODUS",
]);

if (/\b(?:supabase|client)\s*\.\s*from\s*\(/.test(ux) || /\.insert\s*\(|\.update\s*\(|\.upsert\s*\(/.test(ux)) {
  throw new Error("storePriceSearchUx skal ikke skrive direkte til database.");
}

requireNeedles("index.html", ["installStorePriceSearchUx"]);

console.log("✅ Expo ProffDok Prissøk check OK");
