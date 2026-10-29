import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

let checks = 0, support = false;
const eq = (a, b, label) => { assert.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)), label); checks++; };
const service = fs.readFileSync("src/modules/sales/services/salesCaseHandlers.js", "utf8");
const helpers = vm.runInNewContext(`(() => { ${service.replace(/^import .*;\n/gm, "").replaceAll("export ", "")} return { fetchSalesCaseHandlers,validateSalesCaseHandler,salesCaseHandlerFields,setSalesCaseHandler }; })()`, { getSalesSupportCompanyId: () => support });
const a = { userId: "10000000-0000-4000-8000-000000000001", displayName: "Samme Navn", email: "a@example.invalid" };
const b = { userId: "10000000-0000-4000-8000-000000000002", displayName: "Samme Navn", email: "b@example.invalid" };
let candidates = [a, b], calls = [], rpcError = null;
const client = { rpc: async (name, args) => {
  calls.push({ name, args });
  return rpcError ? { error: rpcError } : { data: name === "sales_case_handler_candidates" ? candidates : { ...b, revision: 4 }, error: null };
} };
eq((await helpers.validateSalesCaseHandler(client, "company", b.userId)).email, b.email, "duplicate names select exact UUID");
for (const value of ["Samme Navn", "publisher-id", "", null]) {
  await assert.rejects(helpers.validateSalesCaseHandler(client, "company", value)); checks++;
}
candidates = [a, a]; await assert.rejects(helpers.validateSalesCaseHandler(client, "company", a.userId)); checks++;
candidates = [a, b];
eq(await helpers.setSalesCaseHandler(client, "company", "QA-1", b.userId, 3), { ...b, revision: 4 }, "server-confirmed revision returned");
eq(calls.at(-1), { name: "sales_set_case_handler", args: { p_company_id: "company", p_request_ref: "QA-1", p_user_id: b.userId, p_expected_revision: 3 } }, "explicit UUID and expected revision survive RPC boundary");
rpcError = { code: "PT409", message: "Changed" }; await assert.rejects(helpers.setSalesCaseHandler(client, "company", "QA-1", b.userId, 1), error => error.code === "PT409"); checks++;
rpcError = null; support = true; const count = calls.length;
await assert.rejects(helpers.setSalesCaseHandler(client, "company", "QA-1", b.userId, 3)); checks++;
eq(calls.length, count, "support view never calls assignment RPC"); support = false;

// Execute both actual creation handlers: chosen handler is paired with the name,
// and the person operating the form cannot silently become the responsible user.
const core = fs.readFileSync("src/modules/sales/SalesModuleCore.jsx", "utf8");
const form = { title: "QA Tilbud", customer: "QA Kunde", phone: "123", email: "customer@example.invalid", address: "QA gate", postnr: "0001", city: "Oslo", source: "Telefon", note: "QA notat", responsibleUserId: b.userId };
for (const direct of [false, true]) {
  const name = direct ? "handleCreateDirectOffer" : "handleCreateRequest";
  const start = core.indexOf(`  async function ${name}(event) {`);
  const end = direct ? core.indexOf("\n  async function handleCreateRequest(", start) : core.indexOf('\n  if (mode === "new"', start);
  assert(start >= 0 && end > start);
  let persisted, mode, nextRequests, alerts = [];
  const context = {
    ...helpers, form, activeSupabase: client, salesCompanyId: "company", requests: [],
    caseHandlerRequestScopeRef: { current: { key: "scope-a", active: true } },
    validateRequiredCustomerFields: () => true, isStoreOfferSource: () => false,
    loggedInResponsible: "QA Publisher", authUser: { id: a.userId },
    createRequestId: () => "QA-1", latestRequestsRef: { current: [] },
    setRequests: value => { nextRequests = value; }, persistRequests: async value => { persisted = value; },
    alert: value => alerts.push(value), resetForm() {}, setSelectedRequestId() {},
    setMode: value => { mode = value; }, buildOfferFormFromRequest: value => value,
    offerFormHydratedRequestIdRef: {}, offerFormSavedBaselineRef: {}, createOfferFormChangeSignature: () => "signature",
    setOfferForm() {}, setOfferFormReady() {}, setOfferDraftSaveStatus() {},
  };
  const handle = vm.runInNewContext(`(${core.slice(start, end).trim()})`, context);
  await handle({ preventDefault() {} });
  eq(persisted[0].responsibleUserId, b.userId, "actual create handler persists chosen UUID " + name);
  eq(persisted[0].responsible, b.displayName, "actual create handler pairs candidate name " + name);
  eq(persisted[0].responsibleRevision, 1, "new atomic binding starts at revision1 " + name);
  eq(mode, direct ? "offer-builder" : "detail", "existing destination preserved " + name);
  eq(alerts, [], "valid choice permits existing creation " + name);
  candidates = [a]; persisted = null; nextRequests = null;
  await handle({ preventDefault() {} });
  eq(persisted, null, "revoked choice cannot create a request " + name);
  eq(nextRequests, null, "revoked choice cannot enter local state " + name);
  candidates = [a, b];
  persisted = null; nextRequests = null;
  context.validateSalesCaseHandler = async () => { context.caseHandlerRequestScopeRef.current.key = "scope-b"; return b; };
  await handle({ preventDefault() {} });
  eq(persisted, null, "late candidate response after company change never persists " + name);
  eq(nextRequests, null, "late candidate response after company change never changes UI " + name);
}
eq(core.includes('caseHandlerControl={integrationMode === "app"'), true, "existing/accepted cases expose explicit binding without modifying accepted customer data");
const formSource = fs.readFileSync("src/modules/sales/components/SalesRequestForm.jsx", "utf8");
eq(formSource.includes('"responsibleUserId"') && formSource.includes('"responsibleName"'), true, "entry recovery retains the selected identity/name pair");
console.log(`PASS sales case-handler contract: ${checks} assertions; actual creation handlers and RPC adapters, no real writes.`);
