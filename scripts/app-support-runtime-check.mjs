import assert from 'node:assert/strict';
import { createAppSupportRuntime, createSupportStorage } from '../src/modules/access/appSupportRuntime.mjs';
let checks = 0;
const eq = (actual, expected, label) => { assert.deepEqual(actual, expected, label); checks++; };
const id = n => `81000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const origin = 'https://example.supabase.co';
const credentials = { apikey: 'public-test-key', Authorization: 'Bearer actual-admin-test-token' };
const session = { id: id(1), actor_id: id(2), target_user_id: id(3), company_id: id(4),
  target_user: { id: id(3), email: 'customer@example.invalid' },
  expires_at: '2026-11-11T23:00:00Z', capabilities: { read: true, create: true, update: true, delete: false } };
let clock = Date.parse('2026-11-11T22:00:00Z');
let calls = [];
let pendingResolve;
const fakeFetch = async (input, init) => {
  const request = new Request(input, init);
  calls.push(request);
  if (request.url.endsWith('/app_support_session')) {
    const command = await request.json();
    return Response.json(command.p_action === 'end' ? { ended: true } : session);
  }
  if (request.url.endsWith('/app_support_context')) return Response.json(session);
  if (request.url.endsWith('/slow')) return new Promise(resolve => { pendingResolve = resolve; });
  return Response.json({ ok: true });
};
const runtime = createAppSupportRuntime({ backendUrl: origin, nativeFetch: fakeFetch, now: () => clock });
const actor = { id: id(2), email: 'admin@example.invalid' };
eq(runtime.projectUser(actor), actor, 'ordinary Auth identity unchanged');
await runtime.fetch(`${origin}/rest/v1/projects`);
eq(calls.at(-1).headers.has('x-expo-support-session'), false, 'ordinary request unchanged');
await runtime.start(credentials, id(3), id(4));
eq(runtime.getState().phase, 'active', 'only active after server context probe');
eq(runtime.projectUser(actor).id, id(3), 'UI identity is customer');
eq(actor.id, id(2), 'original Auth object untouched');
await runtime.fetch(`${origin}/rest/v1/projects`, { method: 'POST', headers: credentials, body: '{"name":"QA"}' });
eq(calls.at(-1).headers.get('x-expo-support-session'), id(1), 'session accompanies database request');
eq(calls.at(-1).headers.get('Authorization'), credentials.Authorization, 'real actor token retained');
eq(calls.at(-1).redirect, 'error', 'support request cannot redirect credentials');
eq(await calls.at(-1).text(), '{"name":"QA"}', 'request body preserved');
await runtime.fetch(`${origin}/storage/v1/object/private/new.pdf`, { method: 'POST', headers: { ...credentials, 'x-upsert': 'true' }, body: 'new bytes' });
eq(calls.at(-1).headers.get('x-expo-support-session'), id(1), 'Storage policies receive verified session');
eq(calls.at(-1).headers.get('x-upsert'), 'false', 'uploads cannot replace existing files');
eq(await calls.at(-1).text(), 'new bytes', 'upload bytes preserved');
const beforeBlocked = calls.length;
for (const [path, method] of [['/rest/v1/projects', 'DELETE'], ['/storage/v1/object/x', 'PUT'], ['/storage/v1/object/move', 'POST'], ['/storage/v1/object/upload/sign/x', 'POST'],
  ['/functions/v1/send-mail', 'POST'], ['/auth/v1/user', 'PUT'], ['/rest/v1/rpc/app_support_session', 'POST']]) {
  eq((await runtime.fetch(origin + path, { method })).status, 403, `${method} ${path} fails closed`);
}
eq(calls.length, beforeBlocked, 'blocked operations never sent');
eq((await runtime.fetch('https://external.example.invalid/order', { method: 'POST' })).status, 403, 'external delivery blocked');
eq((await runtime.fetch('https://external.example.invalid/image', { headers: { 'x-expo-support-session': id(1) } })).status, 403, 'support header cannot leak');
eq((await runtime.fetch('https://external.example.invalid/image', { headers: credentials })).status, 403, 'actor credentials cannot leak to external host');
await runtime.fetch(`${origin}/auth/v1/token?grant_type=refresh_token`, { method: 'POST' });
eq(calls.at(-1).headers.has('x-expo-support-session'), false, 'actor refresh is not impersonated');
const slow = runtime.fetch(`${origin}/rest/v1/slow`);
await runtime.end(credentials);
pendingResolve(Response.json({ confidential: 'old customer' }));
eq((await slow).status, 403, 'late data after exit discarded');
eq(runtime.getState().phase, 'ended', 'explicit exit completed');
eq((await runtime.fetch(`${origin}/rest/v1/projects`)).status, 403, 'no silent fallback to admin after exit');
const expired = createAppSupportRuntime({ backendUrl: origin, nativeFetch: fakeFetch, now: () => clock });
await expired.restore(credentials, session.id);
clock += 3600001;
eq((await expired.fetch(`${origin}/rest/v1/projects`)).status, 403, 'expiry rejects before sending request');
eq(expired.getState().phase, 'blocked', 'expiry keeps customer app blocked');
clock -= 3600001;
const changedLogin = createAppSupportRuntime({ backendUrl: origin, nativeFetch: fakeFetch, now: () => clock });
await changedLogin.restore(credentials, session.id);
eq(changedLogin.projectUser({ id: id(9) }), null, 'different logged-in actor cannot project customer');
const wrongProbe = createAppSupportRuntime({ backendUrl: origin, now: () => clock,
  nativeFetch: async (input, init) => String(input).endsWith('/app_support_context')
    ? Response.json({ ...session, company_id: id(99) }) : fakeFetch(input, init) });
await assert.rejects(() => wrongProbe.start(credentials, id(3), id(4))); checks++;
eq(wrongProbe.getState().phase, 'blocked', 'wrong company probe blocks before UI mount');
eq(wrongProbe.getState().session.id, session.id, 'failed probe retains session for explicit exit');
await wrongProbe.end(credentials);
const missingHook = createAppSupportRuntime({ backendUrl: origin, now: () => clock,
  nativeFetch: async (input, init) => String(input).endsWith('/app_support_context')
    ? Response.json({ message: 'Supportkontekst mangler.' }, { status: 403 }) : fakeFetch(input, init) });
await assert.rejects(() => missingHook.restore(credentials, session.id)); checks++;
eq(missingHook.getState().phase, 'blocked', 'missing server hook never opens customer UI');
const values = new Map([['sales-draft', 'own unsaved draft'], ['sb-demo-auth-token', 'actor session'],
  [`expo-support:${id(99)}:sales-draft`, 'another support draft']]);
const storage = { get length() { return values.size; }, key: i => [...values.keys()][i] ?? null,
  getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
const scoped = createSupportStorage(storage, session.id);
eq(scoped.getItem('sales-draft'), null, 'own drafts not loaded into support');
eq(scoped.getItem('sb-demo-auth-token'), 'actor session', 'Auth storage remains shared');
scoped.setItem('sales-draft', 'customer draft');
eq(scoped.getItem('sales-draft'), 'customer draft', 'support draft persists within session');
eq(values.get('sales-draft'), 'own unsaved draft', 'own draft preserved');
eq(scoped.length, 2, 'enumeration excludes own and other support caches');
eq(createSupportStorage(storage, id(99)).getItem('sales-draft'), 'another support draft', 'support sessions isolated');
scoped.clear();
eq(values.get('sb-demo-auth-token'), 'actor session', 'clear never signs actor out');
eq(values.get('sales-draft'), 'own unsaved draft', 'clear never deletes own drafts');
eq(values.get(`expo-support:${id(99)}:sales-draft`), 'another support draft', 'clear never deletes another session drafts');
eq(scoped.getItem('sales-draft'), null, 'clear only clears this support namespace');
console.log(`app-support-runtime: ${checks} PASS – identity, lifecycle, transport boundaries, late responses and draft isolation`);
