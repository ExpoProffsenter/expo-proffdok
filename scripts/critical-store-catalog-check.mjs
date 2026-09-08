import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  parseStoreCatalogLine,
  serializeStoreCatalogItem,
  STORE_CATALOG_FIELD_COUNT,
} from "../src/modules/storeCatalog/storeCatalogImport.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function assert(condition, message) {
  if (!condition) throw new Error(`FASE 39B.1 critical check: ${message}`);
}

assert(STORE_CATALOG_FIELD_COUNT === 18, "ERP-formatet skal ha 18 felt.");

const acceptedLine = [
  "Testleverandør",
  "ABC-123",
  "1000,00",
  "25,00",
  "750,00",
  "33,33",
  "25,00",
  "1000,00",
  "1250,00",
  "Testgruppe",
  "20260908",
  "1",
  "1",
  "0",
  "0",
  'Testprodukt 80 cm "matt"',
  "1234567890123",
  "",
].join(";");

const accepted = parseStoreCatalogLine(acceptedLine, 7);
assert(accepted.status === "accepted", "gyldig vare skal aksepteres.");
assert(accepted.item.purchaseNetExVat === 750, "nettopris skal leses fra felt 5.");
assert(accepted.item.customerPriceExVat === 1000, "kundepris eks. mva. skal leses fra felt 8.");
assert(accepted.item.customerPriceInclVat === 1250, "kundepris inkl. mva. skal leses fra felt 9.");
assert(accepted.item.priceDate === "2026-09-08", "ERP-dato skal normaliseres.");
assert(accepted.item.gtin === "1234567890123", "GTIN skal bevares.");

const serialized = serializeStoreCatalogItem(accepted.item, 7);
assert(serialized.purchase_net_ex_vat === 750, "RPC-payload skal beholde intern nettopris.");
assert(serialized.customer_price_incl_vat === 1250, "RPC-payload skal beholde kundepris.");
assert(serialized.source_line_no === 7, "kildelinje skal følge importen.");

const zeroPriceFields = acceptedLine.split(";");
zeroPriceFields[4] = "0,00";
assert(
  parseStoreCatalogLine(zeroPriceFields.join(";"), 8).status === "skipped_zero_price",
  "vare med null nettopris skal droppes."
);

const zeroSaleFields = acceptedLine.split(";");
zeroSaleFields[8] = "0,00";
assert(
  parseStoreCatalogLine(zeroSaleFields.join(";"), 9).status === "skipped_zero_price",
  "vare med null utsalgspris skal droppes."
);

const missingSkuFields = acceptedLine.split(";");
missingSkuFields[1] = "";
assert(
  parseStoreCatalogLine(missingSkuFields.join(";"), 10).status === "skipped_missing_sku",
  "vare uten varenummer skal droppes."
);

const migrationPath = path.join(
  root,
  "supabase/migrations/20260908105500_fase39b1_internal_store_catalog.sql"
);
const migration = fs.readFileSync(migrationPath, "utf8");

for (const needle of [
  "internal_store_catalog_items",
  "internal_store_catalog_stage",
  "current_user_has_internal_store_catalog_access",
  "current_user_has_module_access('store_offers')",
  "Ringside Rørleggerbedrift AS",
  "Bademiljø Expo",
  "purchase_net_ex_vat",
  "enable row level security",
  "revoke all on public.internal_store_catalog_items from anon, authenticated",
  "search_internal_store_catalog",
  "internal_store_catalog_alternatives",
]) {
  assert(migration.includes(needle), `migreringen mangler sikkerhets-/grunnmurkrav: ${needle}`);
}

assert(
  !migration.includes("915407692"),
  "katalogtilgang skal ikke låses til org.nr.; faktisk Sales-firmascope skal brukes."
);

console.log("✅ Expo ProffDok internt vareregister check OK");
