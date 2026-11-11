import { createClient } from '@supabase/supabase-js';
import { createAppSupportRuntime } from './appSupportRuntime.mjs';
import { wrapSupportClient } from './appSupportAuth.mjs';

const SESSION_KEY = 'expo-app-support-session';
import { isolateSupportCaches } from './appSupportBrowserStorage.mjs';
let runtime = null;
let actorClient = null;
let rawSessionStorage = null;
let rawLocalStorage = null;
const wrapped = new WeakMap();
let banner;
export function captureSupportActorClient(client) { actorClient ||= client; }
export function initialSupportClient() { return actorClient ? supportClient(actorClient) : null; }

export function effectiveSupportUserId(actorId) {
  return runtime?.getState().phase === 'active'
    ? runtime.projectUser({ id: actorId })?.id || '' : actorId;
}
export function supportClient(client) {
  if (!runtime || runtime.getState().phase === 'idle') return client;
  if (!wrapped.has(client)) wrapped.set(client, wrapSupportClient(client, runtime));
  return wrapped.get(client);
}
export function activeSupportSessionId() {
  return runtime?.getState().session?.id || '';
}
function config() {
  if (typeof import.meta.env === 'undefined') return {};
  return { url: import.meta.env.VITE_SUPABASE_URL, key: import.meta.env.VITE_SUPABASE_ANON_KEY };
}
async function credentials() {
  const result = await actorClient.auth.getSession();
  if (result.error || !result.data?.session?.access_token) throw new Error('Logg inn før du starter support.');
  return { apikey: config().key, Authorization: `Bearer ${result.data.session.access_token}` };
}
function paint(state) {
  if (state.phase === 'idle') return;
  if (!banner) {
    banner = document.createElement('aside');
    banner.setAttribute('data-app-support-banner', 'true');
    banner.setAttribute('aria-label', 'Supportmodus');
    document.body.prepend(banner);
  }
  banner.replaceChildren();
  const text = document.createElement('strong');
  text.textContent = state.phase === 'active'
    ? `Support: ${state.session.company_name} · ${state.session.target_email}. Endringer lagres. Sletting er sperret.`
    : state.error || 'Bekrefter supportøkten …';
  const button = document.createElement('button');
  button.type = 'button'; button.textContent = 'Avslutt supportmodus';
  button.onclick = async () => {
    button.disabled = true;
    try {
      await runtime.end(await credentials(), state.session?.id || rawSessionStorage.getItem(SESSION_KEY));
      rawSessionStorage.removeItem(SESSION_KEY);
      window.location.replace('/?tab=systemadmin');
    } catch (error) { text.textContent = error.message; button.disabled = false; }
  };
  banner.append(text, button);
  const blocked = state.phase !== 'active';
  banner.style.cssText = `position:${blocked ? 'fixed' : 'sticky'};top:0;left:0;right:0;${blocked ? 'bottom:0;' : ''}z-index:2147483647;padding:12px 20px;background:#fff4e5;color:#623000;border-bottom:2px solid #d48629;display:flex;gap:16px;align-items:center;justify-content:space-between;flex-wrap:wrap;`;
  document.getElementById('root')?.toggleAttribute('inert', blocked);
}

export async function startCustomerSupport(userId, companyId) {
  if (!runtime) throw new Error('Support er ikke tilgjengelig i dette miljøet.');
  const session = await runtime.start(await credentials(), userId, companyId);
  rawSessionStorage.setItem(SESSION_KEY, session.id);
  window.location.assign('/?tab=prosjekt');
}

async function initialize() {
  if (typeof window === 'undefined' || !config().url || !config().key) return;
  rawLocalStorage = window.localStorage;
  rawSessionStorage = window.sessionStorage;
  const nativeFetch = window.fetch.bind(window);
  runtime = createAppSupportRuntime({ backendUrl: config().url, nativeFetch, onChange: paint });
  // A document opened with noopener cannot inherit sessionStorage. This
  // fragment carries only a login-bound session ID, never a bearer token.
  const fragment = new URLSearchParams(window.location.hash.slice(1));
  const linked = fragment.get('expoSupport');
  if (linked && /^[0-9a-f-]{36}$/i.test(linked)) {
    rawSessionStorage.setItem(SESSION_KEY, linked);
    fragment.delete('expoSupport');
    window.history.replaceState(null, '', window.location.pathname + window.location.search + (fragment.size ? '#' + fragment : ''));
  }
  const sid = rawSessionStorage.getItem(SESSION_KEY);
  if (!sid) {
    // No global transport/cache changes for ordinary users.
    return;
  }
  window.fetch = (input, init) => runtime.fetch(input, init);
  isolateSupportCaches(window, sid, rawLocalStorage, rawSessionStorage);
  actorClient = createClient(config().url, config().key);
  try {
    const session = await runtime.restore(await credentials(), sid);
    window.setTimeout(() => runtime.projectUser({ id: session.actor_id }), Math.max(1, Date.parse(session.expires_at) - Date.now() + 1));
  }
  catch {
    // Never mount an administrator app beneath a failed customer projection.
    return new Promise(() => {});
  }
}
export const supportReady = initialize();
