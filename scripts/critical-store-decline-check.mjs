import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(`FASE 39B.2 decline check: ${message}`);
}

const migration = read("supabase/migrations/20260908165435_fase39b2_store_decline_notifications.sql");
for (const needle of [
  "sales_offer_decline_notifications",
  "unique (offer_id, offer_version_id, recipient_type)",
  "enable row level security",
  "revoke all on table public.sales_offer_decline_notifications from anon, authenticated",
]) assert(migration.includes(needle), `avvisningsloggen mangler sikkerhetskrav: ${needle}`);

const edge = read("supabase/functions/sales-offer-decline-notify/index.ts");
for (const needle of [
  'offer.status !== "declined"',
  "offer.declined_payload?.version_id",
  'recipient_type: "publisher"',
  'from("profiles")',
  "version.published_by",
  'from("sales_offer_decline_notifications")',
  "Butikktilbud avvist",
]) assert(edge.includes(needle), `servervarsel mangler: ${needle}`);
assert(!edge.includes("body?.recipientEmail"), "klienten skal ikke kunne velge mottaker for avvisningsvarsel.");

const salesSupabase = read("src/modules/sales/services/salesSupabase.js");
for (const needle of [
  'DECLINE_NOTIFY_FUNCTION = "sales-offer-decline-notify"',
  "notifySalesOfferDecline",
  "core.getSalesOfferByToken(client, token)",
  'offer?.status === "declined"',
  'client.rpc("decline_sales_offer"',
]) assert(salesSupabase.includes(needle), `klient-recovery mangler: ${needle}`);

const customerCss = read("src/modules/sales/components/salesCustomerOptionality.css");
for (const needle of [
  '.store-customer-decline-check > input[type="checkbox"]',
  "width: 18px !important",
  "flex: 0 0 18px !important",
  "overflow-wrap: anywhere",
]) assert(customerCss.includes(needle), `mobil avvisning mangler: ${needle}`);

const salesDetail = read("src/modules/sales/components/SalesDetailView.jsx");
for (const needle of [
  "rewriteStoreOfferDeclinedFlow",
  'request?.status === "Avvist"',
  "saken er avsluttet i Sales",
  "Det sendes ikke flere automatiske påminnelser",
  "Det avviste tilbudet beholdes som historikk og slettes ikke",
  "Se avvist tilbud",
  "buildDeclinedOfferHref",
]) assert(salesDetail.includes(needle), `intern avvist-visning mangler: ${needle}`);

console.log("✅ Expo ProffDok Butikktilbud-avvisning check OK");
