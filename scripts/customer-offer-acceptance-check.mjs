import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { mapPublicOfferToRequest, getActiveOfferVersion } from '../src/modules/sales/utils/salesOfferLogicCore.js';
import { applyCustomerOptionQuantities, hasInvalidCustomerOptionQuantity } from '../src/modules/sales/utils/salesCustomerOptionQuantities.js';
import { getOfferTotal, getVisibleOfferLines } from '../src/modules/sales/utils/salesUtils.js';

// Execute the actual submit handler and RPC adapter together. Component-only
// quantity tests never traversed this boundary and missed an omitted RPC key.
const core = fs.readFileSync('src/modules/sales/SalesModuleCore.jsx', 'utf8');
const start = core.indexOf('  async function handleAcceptOffer(event) {');
const end = core.indexOf('\n  function openOfferBuilder()', start);
assert(start >= 0 && end > start);
const handler = core.slice(start, end).trim();
const service = fs.readFileSync('src/modules/sales/services/salesSupabaseBase.js', 'utf8');
const serviceStart = service.indexOf('export function acceptSalesOffer(');
const serviceEnd = service.indexOf('\nexport function publishSalesOffer(', serviceStart);
assert(serviceStart >= 0 && serviceEnd > serviceStart);
const acceptSalesOffer = vm.runInNewContext(`(${service.slice(serviceStart, serviceEnd).replace(/^export /, '')})`);
let checks = 0;
const eq = (a, b, label) => { assert.equal(JSON.stringify(a), JSON.stringify(b), label); checks++; };
const option = { id: 'spot', title: 'Downlight', amount: '2400', quantity: '1', unit: 'stk', customerCanChooseQuantity: true };
const versionId = '98000000-0000-4000-8000-000000000002';
const mapped = mapPublicOfferToRequest({
  offer: { id: 'offer', status: 'sent', public_token: 'synthetic-token' },
  version: { id: versionId, version_number: 1, lines: [{ id: 'base', amount: '10000' }], options: [option], total_ex_vat: 10000 },
});
eq(getActiveOfferVersion(mapped), null, 'public mapper has flattened fields, not an internal version-history snapshot');
eq(mapped.sentOfferVersionId, versionId, 'published version identity is available on the public request');

async function submit({ request = mapped, selected = [], quantities = {}, confirmed = true, name = 'Syntetisk QA', error = null } = {}) {
  const calls = [], alerts = [], saved = [];
  let mode = 'customer-offer', nextRequests;
  const result = { selected_options: [{ ...option, quantity: 4 }], accepted_total: 19600, accepted_at: '2026-10-22T12:00:00Z' };
  const context = {
    acceptanceForm: { name, confirmed, selectedOptionIds: selected, selectedOptionQuantities: quantities },
    selectedRequest: request, selectedRequestId: request.id, requests: [request],
    activeSupabase: { rpc: async (method, args) => {
      // Supabase serializes undefined properties away before PostgREST dispatch.
      calls.push({ method, args: JSON.parse(JSON.stringify(args)) });
      return { data: error ? null : result, error };
    } },
    getActiveOfferVersion, hasInvalidCustomerOptionQuantity, applyCustomerOptionQuantities,
    getOfferTotal, getVisibleOfferLines, acceptSalesOffer,
    alert: message => alerts.push(message),
    setRequests: value => { nextRequests = value; },
    persistRequests: async value => { saved.push(value); },
    setMode: value => { mode = value; },
  };
  await vm.runInNewContext(`(${handler})`, context)({ preventDefault() {} });
  return { calls, alerts, saved, mode, nextRequests, result };
}

for (const withOptions of [false, true]) {
  const r = await submit(withOptions ? { selected: ['spot'], quantities: { spot: '4' } } : {});
  eq(r.calls.length, 1, 'one acceptance RPC');
  eq(r.calls[0].method, 'accept_sales_offer_quantities', 'guarded version-aware endpoint');
  eq(Object.keys(r.calls[0].args).sort(), ['accepted_name', 'expected_version_id', 'selected_options', 'token'], 'all four named RPC parameters survive JSON serialization');
  eq(r.calls[0].args.expected_version_id, versionId, 'submit sends the published version shown to the customer');
  eq(r.calls[0].args.selected_options.length, withOptions ? 1 : 0, 'empty and non-empty option selections');
  if (withOptions) eq(r.calls[0].args.selected_options[0].quantity, 4, 'chosen quantity reaches the RPC');
  eq(r.mode, 'customer-accepted', 'successful response opens acceptance receipt');
  eq(r.nextRequests[0].acceptedTotal, r.result.accepted_total, 'persisted receipt uses server-confirmed amount');
  eq(r.nextRequests[0].acceptedAt, r.result.accepted_at, 'persisted receipt uses server-confirmed timestamp');
  eq(r.saved.length, 1, 'successful acceptance persists');
}
for (const error of [{ code: 'PT409', message: 'Tilbudet er oppdatert. Last inn siden på nytt.' }, { code: '40001', message: 'Tilbudet er oppdatert. Last inn siden på nytt.' }, { code: 'NETWORK', message: 'Ingen forbindelse' }]) {
  const r = await submit({ error });
  eq(r.mode, 'customer-offer', 'rejected or failed RPC never shows a successful receipt');
  eq(r.saved.length, 0, 'rejected or failed RPC never persists a local acceptance');
  eq(r.alerts, [error.message], 'server rejection is surfaced');
}
for (const args of [{ confirmed: false }, { name: '  ' }, { selected: ['spot'], quantities: { spot: '0' } }]) {
  const r = await submit(args);
  eq(r.calls.length, 0, 'incomplete confirmation/name or invalid quantity never reaches RPC');
  eq(r.saved.length, 0, 'invalid form does not persist');
}
const internal = await submit({ request: { ...mapped, isPublicOffer: false } });
eq(internal.calls.length, 0, 'internal acceptance remains local to existing persistence');
eq(internal.mode, 'detail', 'internal acceptance keeps its existing destination');
for (const missing of [undefined, null, '']) {
  let payload;
  await acceptSalesOffer({ rpc: async (_, args) => { payload = JSON.parse(JSON.stringify(args)); } }, { token: 'synthetic', acceptedName: 'QA', selectedOptions: [], expectedVersionId: missing });
  eq(Object.hasOwn(payload, 'expected_version_id'), true, 'missing version cannot silently change the RPC signature');
  eq(payload.expected_version_id, null, 'missing version reaches the existing server rejection as explicit null');
}
console.log(`PASS customer offer acceptance: ${checks} actual mapper → submit handler → RPC adapter checks; serialized version identity, quantities, server receipt, rejection and internal flow.`);
await import('./sales-acceptance-routing-check.mjs');
await import('./sales-case-handler-check.mjs');
