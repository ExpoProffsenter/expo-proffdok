import assert from "node:assert/strict";
import fs from "node:fs";
import {
  MAX_PICKLIST_ITEMS, deleteSavedPicklist, normalizePickQuantity,
  picklistStorageKey, readSavedPicklist, savePicklist,
} from "../src/modules/storeCatalog/mobilePicklistStorage.mjs";

const userA = { userId: "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa", companyId: "11111111-1111-4111-8111-111111111111" };
const userB = { userId: "bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb", companyId: userA.companyId };
const otherCompany = { userId: userA.userId, companyId: "22222222-2222-4222-8222-222222222222" };
const data = new Map();
const storage = {
  getItem: (key) => data.get(key) ?? null,
  setItem: (key, value) => data.set(key, value),
  removeItem: (key) => data.delete(key),
};

assert.equal(picklistStorageKey({ userId: "", companyId: userA.companyId }), "");
assert.notEqual(picklistStorageKey(userA), picklistStorageKey(userB));
assert.notEqual(picklistStorageKey(userA), picklistStorageKey(otherCompany));
assert.equal(normalizePickQuantity("2,5"), "2.5");
assert.equal(normalizePickQuantity("0"), "1");

savePicklist(userA, [{
  id: "catalog-1", supplier_product_number: "R-123", gtin: "9900000000004",
  pickQuantity: "2,5", description: "Vare", customer_price_incl_vat: 1000,
  purchase_net_ex_vat: 500, purchase_discount_percent: 20,
  gross_margin_percent: 50, image_url: "https://example.invalid/image.jpg",
}], "C-123", storage);
const storedBytes = data.get(picklistStorageKey(userA));
for (const forbidden of ["customer_price", "purchase_net", "discount", "margin", "image_url", "description"]) {
  assert(!storedBytes.includes(forbidden), `Plukkliste må ikke lagre ${forbidden}`);
}
assert.deepEqual(readSavedPicklist(userA, storage), {
  orderNumber: "C-123",
  items: [{ id: "catalog-1", supplier_product_number: "R-123", gtin: "9900000000004", quantity: "2.5" }],
});
assert.equal(readSavedPicklist(userB, storage), null);
assert.equal(readSavedPicklist(otherCompany, storage), null);
assert.throws(() => savePicklist(userA, Array(MAX_PICKLIST_ITEMS + 1).fill({ id: "x", gtin: "12345678" }), "", storage));
deleteSavedPicklist(userA, storage);
assert.equal(readSavedPicklist(userA, storage), null);

const view = fs.readFileSync("src/modules/storeCatalog/StorePriceSearchView.jsx", "utf8");
const offerLookup = fs.readFileSync("src/modules/storeCatalog/StoreCatalogOfferTools.jsx", "utf8");
const scanner = fs.readFileSync("src/modules/storeCatalog/PriceSearchBarcodeScanner.jsx", "utf8");
for (const needle of [
  "Lagre plukkliste", "Slett plukkliste", "Bekreft sletting", "Ordrenummer i Cordel",
  "Antall til Cordel", "Skriv ut plukkliste", "picklistMode={isMobile}",
  "getStoredSupabaseSession().userId", "readCachedWorkProfileState().active_company_id",
  "readSavedPicklist(picklistIdentity)", "savePicklist(picklistIdentity",
  "deleteSavedPicklist(picklistIdentity)", "persistStoredReferences(items)",
  "searchPrices(lookup, 10)", "!isMobile && canPrintInternal && includeInternalPrint",
]) assert(view.includes(needle), `Mobil plukkliste mangler: ${needle}`);
assert(!/(?:window\.)?localStorage\s*\./.test(view), "Prissøks vanlige arbeidsliste skal fortsatt være fanespesifikk.");
assert(!/\.insert\s*\(|\.update\s*\(|\.upsert\s*\(/.test(view), "Plukkliste skal ikke skrive til database.");

for (const needle of [
  'lazy(() => import("./PriceSearchBarcodeScanner.jsx"))',
  'canAccessInternalStoreCatalog(client)',
  'window.matchMedia("(max-width: 700px)")',
  'window.addEventListener(WORK_PROFILE_EVENT, invalidateAccess)',
  'window.addEventListener(MODULE_ACCESS_EVENT, invalidateAccess)',
  "setScanning(false)", "setQuery(code)", "searchStoreCatalog(client, clean, 12)",
  "onUse?.(item)", "Skann strekkode til denne posten",
]) assert(offerLookup.includes(needle), `Generelt tilbud mangler mobil skanneguard: ${needle}`);
assert(!/\.insert\s*\(|\.update\s*\(|\.upsert\s*\(/.test(offerLookup), "Skanning i tilbud skal bruke eksisterende søk.");
assert(scanner.includes("cameraStream?.getTracks?.().forEach((track) => track.stop())"));
assert(scanner.includes('document.addEventListener("visibilitychange"'));
assert(!/\b(?:localStorage|sessionStorage|indexedDB|fetch|XMLHttpRequest)\b/.test(scanner));

console.log("critical-mobile-picklist-offer-scan-check: OK");
