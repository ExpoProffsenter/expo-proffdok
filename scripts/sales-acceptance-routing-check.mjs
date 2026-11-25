import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { stripTypeScriptTypes } from "node:module";

let checks = 0;
const eq = (actual, expected, label) => { assert.deepEqual(JSON.parse(JSON.stringify(actual)), JSON.parse(JSON.stringify(expected)), label); checks++; };
const source = fs.readFileSync("supabase/functions/sales-offer-acceptance-notify/index.ts", "utf8");
const deployed = fs.readFileSync("scripts/fixtures/sales-offer-acceptance-notify-v7.txt", "utf8");
const handlerId = "10000000-0000-4000-8000-000000000001";
const publisherId = "10000000-0000-4000-8000-000000000002";

function fixture(code = source, changes = {}) {
  const state = {
    sends: [], reservations: new Map(), queries: [], lookups: 0, writes: [],
    handler: { status: "ready", userId: handlerId, email: "handler@example.invalid", displayName: "QA Saksbehandler", revision: 2 },
    offer: { id: "offer", company_id: "company", request_ref: "QA-1", status: "accepted", accepted_at: "2026-10-29T10:42:00Z", accepted_by: "QA Kunde", customer_name: "QA Kunde <test>", customer_email: "customer@example.invalid", accepted_payload: { version_id: "version", selected_options: [{ title: "QA tillegg", amount: "100", quantity: "2" }] } },
    version: { id: "version", offer_id: "offer", title: "QA Tilbud", total_ex_vat: 1000, published_by: publisherId, lines: [] },
    requestPayload: { responsible: "QA Navn", projectResponsible: "QA Navn", companyName: "QA Firma" },
    ...changes,
  };
  const service = {
    auth: { admin: { getUserById: async id => ({ data: { user: { id, email: "publisher@example.invalid" } } }) } },
    rpc: async (name, args) => {
      state.lookups++;
      eq(name, "sales_acceptance_case_handler", "only canonical resolver may select internal recipient");
      eq(args, { p_offer_id: "offer" }, "resolver receives server-loaded offer identity");
      if (state.lookupError) return { data: null, error: { message: "mock denied" } };
      return { data: state.changedDuringReservation && state.lookups > 1 ? { status: "no_access" } : state.handler, error: null };
    },
    from(table) {
      const query = { table, filters: {}, operation: "select" };
      state.queries.push(query);
      const chain = {
        select(columns) { query.columns = columns; return chain; },
        eq(key, value) { query.filters[key] = value; return chain; },
        insert(value) { query.operation = "insert"; query.value = value; return chain; },
        update(value) { query.operation = "update"; query.value = value; return chain; },
        single: async () => {
          assert.equal(table, "sales_offer_acceptance_notifications");
          const type = query.value.recipient_type;
          if (state.reservations.has(type)) return { data: null, error: { code: "23505" } };
          const row = { ...query.value, id: `notification-${type}` };
          state.reservations.set(type, row);
          return { data: row, error: null };
        },
        maybeSingle: async () => {
          if (table === "sales_offers") return { data: state.offer, error: null };
          if (table === "sales_offer_versions") return { data: state.version, error: null };
          if (table === "profiles") return { data: { email: "publisher@example.invalid", company_name: "QA Firma", logo_url: "" }, error: null };
          if (table === "sales_requests") return { data: { payload: state.requestPayload }, error: null };
          if (table === "sales_offer_acceptance_notifications") return { data: state.reservations.get(query.filters.recipient_type), error: null };
          throw Error(`Unexpected table ${table}`);
        },
        then(resolve, reject) {
          if (query.operation !== "update" || table !== "sales_offer_acceptance_notifications") throw Error("Unexpected mock query");
          state.writes.push(query);
          const row = [...state.reservations.values()].find(row => row.id === query.filters.id);
          if (row) Object.assign(row, query.value);
          return Promise.resolve({ data: null, error: null }).then(resolve, reject);
        },
      };
      return chain;
    },
  };
  let handle;
  const stripped = stripTypeScriptTypes(code.replace(/^import .*;\n/gm, ""), { mode: "strip" });
  vm.runInNewContext(stripped, {
    serve: callback => { handle = callback; }, createClient: () => service,
    Deno: { env: { get: () => "synthetic-test-configuration" } },
    Request, Response, URL, Intl, Date,
    fetch: async (url, options) => {
      eq(url, "https://api.resend.com/emails", "all transport intercepted; no real network");
      const mail = JSON.parse(options.body);
      state.sends.push(mail);
      return { ok: !(state.providerFailure && mail.to[0] === "handler@example.invalid"), text: async () => "mock-provider" };
    },
  });
  return { state, handle, post: async (body = { publicOfferToken: "synthetic-token", to: "forged@example.invalid", responsibleUserId: publisherId }) => handle(new Request("https://qa.invalid", { method: "POST", body: JSON.stringify(body) })) };
}

const happy = fixture();
let response = await happy.post();
eq(response.status, 200, "accepted offer handled");
eq(happy.state.sends.map(mail => mail.to), [["handler@example.invalid"], ["customer@example.invalid"]], "only current canonical handler and unchanged customer receive mail");
eq(happy.state.reservations.get("publisher").recipient_email, "handler@example.invalid", "historical internal dedup slot retained");
eq(happy.state.queries.find(query => query.table === "sales_offer_versions").filters, { id: "version", offer_id: "offer" }, "version bound to accepted offer");
eq(happy.state.queries.find(query => query.table === "sales_offers").filters.public_token, "synthetic-token", "public capability verified by persisted offer");
eq(JSON.stringify(await response.json()).includes("handler@example.invalid"), false, "public response does not disclose internal recipient");
await happy.post();
eq(happy.state.sends.length, 2, "repeat acceptance does not duplicate internal or customer receipt");

for (const status of ["missing_case_handler", "ambiguous_case_handler", "no_access", "missing_email", "lookup_failed"]) {
  const blocked = fixture(source, { handler: { status } });
  response = await blocked.post();
  eq(response.status, 200, "internal failure does not fail completed customer acceptance");
  eq(blocked.state.sends.map(mail => mail.to), [["customer@example.invalid"]], `no publisher/name/signature fallback: ${status}`);
  eq(blocked.state.reservations.has("publisher"), false, "unresolved handler never consumes internal dedup slot");
  eq((await response.json()).results.caseHandler, { sent: false, status }, "unresolved internal delivery reported as unsent");
}
const unavailable = fixture(source, { lookupError: true });
await unavailable.post();
eq(unavailable.state.sends.length, 1, "resolver exception cannot suppress customer receipt or select fallback");

const reassigned = fixture(source, { changedDuringReservation: true });
await reassigned.post();
eq(reassigned.state.sends.map(mail => mail.to), [["customer@example.invalid"]], "reassignment/revocation while reserving suppresses old-handler send");
eq(reassigned.state.reservations.get("publisher").status, "failed", "reservation remains deduplicated and records internal failure");
const historical = fixture();
historical.state.reservations.set("publisher", { id: "historic", status: "sent", recipient_email: "publisher@example.invalid" });
await historical.post();
eq(historical.state.sends.map(mail => mail.to), [["customer@example.invalid"]], "routing change never resends a historical internal receipt");
const failedProvider = fixture(source, { providerFailure: true });
await failedProvider.post();
eq(failedProvider.state.reservations.get("publisher").status, "failed", "provider rejection remains logged");
eq(failedProvider.state.reservations.get("customer").status, "sent", "customer remains independent after provider rejection");

for (const store of [false, true]) {
  const changes = store ? { version: { ...happy.state.version, lines: [{ __storeOfferMeta: true, brandLabel: "QA Merke", brandLogoUrl: "https://qa.invalid/logo.svg" }] } } : {};
  const before = fixture(deployed, changes), after = fixture(source, changes);
  await before.post(); await after.post();
  eq(after.state.sends.find(mail => mail.to[0] === "customer@example.invalid"), before.state.sends.find(mail => mail.to[0] === "customer@example.invalid"), "customer envelope/template/option totals byte-identical to deployed v7 " + (store ? "general" : "wetroom"));
}
const old = fixture(); old.state.offer.accepted_at = "2026-09-01T00:00:00Z";
await old.post(); eq(old.state.sends.length, 0, "rollout prevents historical fanout");
for (const method of ["GET", "OPTIONS"]) {
  const endpoint = fixture(); response = await endpoint.handle(new Request("https://qa.invalid", { method }));
  eq(response.status, method === "GET" ? 405 : 200, method); eq(endpoint.state.sends.length, 0, "no transport on " + method);
}
const missing = fixture(); response = await missing.post({}); eq(response.status, 400, "missing token rejected"); eq(missing.state.sends.length, 0, "missing token never sends");

// Test the actual client acceptance wrapper, so the recorded acceptance traverses
// the notify boundary instead of stopping at a mocked RPC adapter.
const adapter = fs.readFileSync("src/modules/sales/services/salesSupabase.js", "utf8");
function functionSource(name, next) {
  const start = adapter.indexOf(`export async function ${name}(`), end = adapter.indexOf(`\nexport async function ${next}(`, start);
  assert(start >= 0 && end > start); return adapter.slice(start, end).replace(/^export /, "");
}
const endpoint = fixture(); let accepted = false, invoked = 0;
const accept = vm.runInNewContext(`(${functionSource("acceptSalesOffer", "declineSalesOffer")})`, {
  core: { acceptSalesOffer: async () => { accepted = true; return { data: { accepted: true }, error: null }; } },
  notifySalesOfferAcceptance: async (_client, token) => { eq(accepted, true, "persisted acceptance precedes notify"); invoked++; return endpoint.post({ publicOfferToken: token }); },
});
await accept({}, { token: "synthetic-token" });
eq(invoked, 1, "actual acceptance wrapper invokes notification once");
eq(endpoint.state.sends[0].to, ["handler@example.invalid"], "wrapper reaches canonical routing");
console.log(`PASS sales acceptance routing: ${checks} assertions, deployed-v7 comparison, actual Edge/client wrapper, mock transport only.`);
