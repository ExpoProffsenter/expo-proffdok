import assert from "node:assert/strict";
import fs from "node:fs";
import {
  MAX_PICKLIST_ITEMS, MAX_SAVED_PICKLISTS, deleteLegacyPicklist,
  legacyPicklistStorageKey, normalizePickQuantity, picklistReferences,
  readLegacyPicklist, samePicklistContents,
} from "../src/modules/storeCatalog/mobilePicklistStorage.mjs";

const userA = { userId: "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa", companyId: "11111111-1111-4111-8111-111111111111" };
const userB = { userId: "bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb", companyId: userA.companyId };
const data = new Map();
const storage = {
  getItem: (key) => data.get(key) ?? null,
  setItem: (key, value) => data.set(key, value),
  removeItem: (key) => data.delete(key),
};
const item = {
  id: "aaaaaaaa-1111-4111-8111-111111111111",
  supplier_product_number: "R-123", gtin: "9900000000004", pickQuantity: "2,5",
  customer_price_incl_vat: 1000, purchase_net_ex_vat: 500,
  image_url: "https://example.invalid/image.jpg",
};
assert.equal(MAX_SAVED_PICKLISTS, 3);
assert.equal(MAX_PICKLIST_ITEMS, 30);
assert.equal(normalizePickQuantity("2,5"), "2.5");
assert.equal(normalizePickQuantity("0"), "1");
assert.deepEqual(picklistReferences([item]), [{
  id: item.id, supplier_product_number: "R-123", gtin: "9900000000004", quantity: "2.5",
}]);
assert(samePicklistContents([item], " C-123 ", picklistReferences([item]), "C-123"));
assert(!samePicklistContents([item], "C-123", [{ ...item, pickQuantity: "3" }], "C-123"));

// En gammel lokal Preview-liste kan leses, men fjernes først etter vellykket serversave.
storage.setItem(legacyPicklistStorageKey(userA), JSON.stringify({ version: 1, items: picklistReferences([item]), orderNumber: "C-123" }));
assert.equal(readLegacyPicklist(userA, storage)?.items[0]?.quantity, "2.5");
assert.equal(readLegacyPicklist(userB, storage), null);
deleteLegacyPicklist(userA, storage);
assert.equal(readLegacyPicklist(userA, storage), null);

const view = fs.readFileSync("src/modules/storeCatalog/StorePriceSearchView.jsx", "utf8");
const client = fs.readFileSync("src/modules/storeCatalog/mobilePicklistClient.js", "utf8");
const migration = fs.readFileSync("supabase/migrations/20260930151150_mobile_store_picklists.sql", "utf8");
const offerLookup = fs.readFileSync("src/modules/storeCatalog/StoreCatalogOfferTools.jsx", "utf8");
const priceMenu = fs.readFileSync("src/modules/storeCatalog/storePriceSearchUx.jsx", "utf8");
const groupedOffer = fs.readFileSync("src/modules/sales/components/SalesStoreOfferBuilderGrouped.jsx", "utf8");
const scanner = fs.readFileSync("src/modules/storeCatalog/PriceSearchBarcodeScanner.jsx", "utf8");

for (const needle of [
  "Lagrede plukklister", "MAX_SAVED_PICKLISTS", "Lagre plukkliste", "Lagre endringer",
  "Slett plukkliste", "Bekreft sletting", "Ordrenummer i Cordel", "Antall til Cordel",
  "Skriv ut plukkliste", "picklistMode={picklistMode}", "listMobilePicklists()",
  "await saveMobilePicklist(", "await deleteMobilePicklist(id)", "activeRevision",
  "persistActivePicklistSession", "samePicklistContents", "readLegacyPicklist(picklistIdentity)",
  "restoreStoredProducts(refs)", "searchPrices(lookup, 10)",
]) assert(view.includes(needle), `Plukkliste/PC-flyt mangler: ${needle}`);
assert(!view.includes("const picklistMode = isMobile || Boolean(activePicklistId)"),
  "En ny PC-plukkliste skal ha antall, ordrenummer og lagring uten å åpne en tidligere lagret liste.");
assert(view.includes("onQuantityChange={updateSelectedQuantity} picklistMode\n"),
  "Valgte varer skal ha antall også i en ny PC-kladd.");
assert(view.includes("{listDirty || !activePicklistId ? ("),
  "Lagre plukkliste skal være tilgjengelig for nye PC-lister.");
for (const needle of ["Skriv ut priser", "printSelectedProducts(true)", "printSelectedProducts(false)",
  "picklistMode={printPicklistMode}", "!printPicklistMode && canPrintInternal && includeInternalPrint"]) {
  assert(view.includes(needle), `Separat, tilgangsstyrt pris-/plukklisteutskrift mangler: ${needle}`);
}
const printHandler = view.match(/const printSelectedProducts = [\s\S]*?\n  \};/)?.[0] || "";
assert(printHandler.indexOf("flushSync(") >= 0
  && printHandler.indexOf("flushSync(") < printHandler.indexOf("window.print()"),
"Bytte mellom prisutskrift og prisfri plukkliste må oppdatere dokumentet før native utskrift.");
assert(!/(?:window\.)?localStorage\s*\./.test(view), "Ny plukkliste må ikke skrives til mobilens localStorage.");
assert(!/\.insert\s*\(|\.update\s*\(|\.upsert\s*\(/.test(view), "Ingen direkte tabellskriving fra Prissøk.");
for (const rpc of ["list_mobile_store_picklists", "save_mobile_store_picklist", "delete_mobile_store_picklist"]) {
  assert(client.includes(`rpcWithStoredSession("${rpc}"`), `Mangler brukerbundet ${rpc}-RPC`);
  assert(migration.includes(`public.${rpc}`), `Mangler serverfunksjon ${rpc}`);
}
assert(client.includes("picklistReferences(items)"), "Prisfelter skal filtreres bort før save-RPC.");
for (const guard of [
  "enable row level security", "revoke all on table public.mobile_store_picklists from public, anon, authenticated",
  "public.current_user_has_internal_store_catalog_access()", "where p.user_id = v_uid",
  "from public.profiles where id = v_uid for update", ">= 3", "p.revision = p_expected_revision",
  "v_clean_items := v_clean_items || jsonb_build_array", "grant execute", "on delete cascade",
]) assert(migration.includes(guard), `Manglende databasevern: ${guard}`);
assert(!migration.includes("customer_price") && !migration.includes("purchase_net"), "Ingen prisfelt i lagret tabell/RPC.");

for (const needle of [
  'lazy(() => import("./PriceSearchBarcodeScanner.jsx"))',
  "canAccessInternalStoreCatalog(client)", 'window.matchMedia("(max-width: 700px)")',
  'window.addEventListener("resize", updateMobile)', "updateMobile();",
  ".store-inline-catalog-scan{display:none", "@media(max-width:700px){.store-inline-catalog-scan{display:inline-flex}}",
  "setQuery(code)", "searchStoreCatalog(client, clean, 12)", "onUse?.(item)",
]) assert(offerLookup.includes(needle), `Generelt tilbud mangler mobil skanneguard: ${needle}`);
assert(!/\.insert\s*\(|\.update\s*\(|\.upsert\s*\(/.test(offerLookup));
assert(groupedOffer.includes('.store-follow-up-toggle input[type="checkbox"]{width:20px;height:20px;'),
  "Mobil avkryssing ved Automatisk oppfølging må være kompakt.");
assert(priceMenu.includes("En midlertidig nettfeil er ikke et avslag på tilgang"));
assert(priceMenu.includes("lastConfirmedScope") && priceMenu.includes("const requestScope = currentScope()"));
assert(priceMenu.includes("currentScope() !== requestScope") && priceMenu.includes("retryAttempt = Math.min(retryAttempt + 1, 5)"));
assert(scanner.includes("cameraStream?.getTracks?.().forEach((track) => track.stop())"));
assert(!/\b(?:localStorage|sessionStorage|indexedDB|fetch|XMLHttpRequest)\b/.test(scanner));

console.log("critical-mobile-picklist-offer-scan-check: OK");
