// Full-app support transport foundation. Not installed by bootstrap until
// Storage/Edge adapters and the complete customer journey have passed QA.
// The original administrator token stays in Auth; the server validates the
// support session and applies the target user's existing policies per request.
const SESSION_RPC = '/rest/v1/rpc/app_support_session';
const CONTEXT_RPC = '/rest/v1/rpc/app_support_context';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function failure(message) {
  return new Response(JSON.stringify({ code: '42501', message }), {
    status: 403, headers: { 'Content-Type': 'application/json' },
  });
}

export function createAppSupportRuntime({ backendUrl, nativeFetch, now = Date.now, onChange = () => {} }) {
  const origin = new URL(backendUrl).origin;
  let generation = 0;
  let state = Object.freeze({ phase: 'idle', session: null, error: '' });
  const publish = (phase, session, error = '') => {
    state = Object.freeze({ phase, session, error });
    onChange(state);
  };
  const block = (message) => {
    generation += 1;
    publish('blocked', state.session, message);
  };
  const sessionCall = async (credentials, body) => {
    const response = await nativeFetch(`${origin}${SESSION_RPC}`, {
      method: 'POST', headers: { ...credentials, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || 'Supportøkten kunne ikke bekreftes.');
    return data;
  };
  const checkIdentity = (value) => {
    if (!uuid.test(value?.id || '') || !uuid.test(value?.actor_id || '') ||
        !uuid.test(value?.target_user_id || '') || !uuid.test(value?.company_id || '') ||
        value.actor_id === value.target_user_id || value.target_user?.id !== value.target_user_id ||
        !(Date.parse(value.expires_at) > now()) || value.capabilities?.delete !== false) {
      throw new Error('Serveren returnerte en ugyldig supportkontekst.');
    }
    // Never mutate the native Auth user's object or trust UI-provided roles.
    return Object.freeze({ ...value, target_user: Object.freeze({ ...value.target_user }) });
  };
  const enter = async (credentials, command) => {
    if (state.phase !== 'idle') throw new Error('Avslutt gjeldende supportøkt først.');
    const attempt = ++generation;
    publish('loading', null);
    try {
      const session = checkIdentity(await sessionCall(credentials, command));
      if (attempt !== generation) throw new Error('Supportoppstarten ble avbrutt.');
      publish('loading', session);
      // A session record alone is insufficient: prove that PostgREST's hook is
      // installed and the request really uses the selected customer identity.
      const response = await nativeFetch(`${origin}${CONTEXT_RPC}`, {
        method: 'POST', headers: { ...credentials, 'Content-Type': 'application/json',
          'x-expo-support-session': session.id }, body: '{}',
      });
      const context = await response.json();
      if (!response.ok || context?.id !== session.id || context?.actor_id !== session.actor_id ||
          context?.target_user_id !== session.target_user_id || context?.company_id !== session.company_id) {
        throw new Error('Supporttransporten er ikke klar. Kundens app er ikke åpnet.');
      }
      if (attempt !== generation) throw new Error('Supportoppstarten ble avbrutt.');
      publish('active', session);
      return session;
    } catch (error) {
      if (attempt === generation) block(error.message);
      throw error;
    }
  };
  return {
    getState: () => state,
    start: (credentials, targetId, companyId) => enter(credentials, {
      p_action: 'start', p_target_user_id: targetId, p_company_id: companyId,
    }),
    restore: (credentials, sessionId) => enter(credentials, { p_action: 'get', p_session_id: sessionId }),
    // Callers unmount the customer app before exit. A full page load restores
    // own-branding/navigation; a failed end never falls back to admin reads.
    async end(credentials, sessionId = state.session?.id) {
      generation += 1;
      publish('ending', state.session);
      try {
        await sessionCall(credentials, { p_action: 'end', p_session_id: sessionId });
        publish('ended', null);
      } catch (error) { block(error.message); throw error; }
    },
    projectUser(actor) {
      if (state.phase === 'idle') return actor;
      if (state.phase !== 'active' || actor?.id !== state.session.actor_id ||
          Date.parse(state.session.expires_at) <= now()) {
        block('Supportøkten må bekreftes på nytt.');
        return null;
      }
      return { ...state.session.target_user };
    },
    async fetch(input, init) {
      if (state.phase === 'idle') return nativeFetch(input, init);
      const request = new Request(input, init);
      const url = new URL(request.url);
      // Auth refresh uses the real actor. Account changes are not support work.
      if (url.origin === origin && url.pathname.startsWith('/auth/v1/')) {
        const allowed = (request.method === 'GET' && url.pathname === '/auth/v1/user') ||
          (request.method === 'POST' && url.pathname === '/auth/v1/token' &&
           url.searchParams.get('grant_type') === 'refresh_token');
        return allowed ? nativeFetch(request) : failure('Kontohandlinger utføres utenfor supportmodus.');
      }
      // External assets can be read, but support headers and authenticated
      // backend requests must never be redirected to another host.
      if (url.origin !== origin) {
        if (!['GET', 'HEAD'].includes(request.method) || request.headers.has('x-expo-support-session') ||
            request.headers.has('Authorization') || request.headers.has('apikey')) {
          return failure('Denne handlingen støttes ikke i supportmodus.');
        }
        return nativeFetch(request);
      }
      if (state.phase !== 'active') return failure(state.error || 'Supportøkten er ikke aktiv.');
      const session = state.session;
      if (Date.parse(session.expires_at) <= now()) {
        block('Supportøkten er utløpt.');
        return failure(state.error);
      }
      const storage = url.pathname.startsWith('/storage/v1/object/');
      const supportEdge = url.pathname === '/functions/v1/bolig-contract-files' && request.method === 'POST';
      if (storage && (!['GET', 'HEAD', 'POST'].includes(request.method) ||
          /^\/storage\/v1\/object\/(move|copy|upload)(?:\/|$)/.test(url.pathname))) {
        return failure('Filer kan legges til, men ikke flyttes, erstattes eller slettes i supportmodus.');
      }
      if ((!url.pathname.startsWith('/rest/v1/') && !storage && !supportEdge) || url.pathname === SESSION_RPC) {
        return failure('Denne tjenesten mangler kontrollert supporttilgang.');
      }
      if (request.method === 'DELETE') return failure('Sletting er sperret i supportmodus.');
      const attempt = generation;
      const headers = new Headers(request.headers);
      headers.set('x-expo-support-session', session.id);
      if (storage && request.method === 'POST') headers.set('x-upsert', 'false');
      const response = await nativeFetch(new Request(request, { headers, redirect: 'error' }));
      if (attempt !== generation || state.phase !== 'active' || Date.parse(session.expires_at) <= now()) {
        return failure('Supportøkten er endret. Svaret er forkastet.');
      }
      if (response.status === 401) block('Innloggingen må bekreftes på nytt.');
      return response;
    },
  };
}

// A storage adapter for the dedicated support app. It preserves the actor's
// Auth session while drafts, navigation and recovery use a session namespace.
// Not installed globally: integration must cover IndexedDB and storage events.
export function createSupportStorage(storage, sessionId) {
  if (!uuid.test(sessionId)) throw new Error('Ugyldig supportøkt.');
  const prefix = `expo-support:${sessionId}:`;
  const authKey = (key) => /^sb-.+-auth-token(?:-code-verifier)?$/.test(key);
  const physical = (key) => authKey(String(key)) ? String(key) : prefix + String(key);
  const keys = () => {
    const result = [];
    for (let i = 0; i < storage.length; i += 1) {
      const key = storage.key(i);
      if (key?.startsWith(prefix)) result.push(key.slice(prefix.length));
      else if (key && authKey(key)) result.push(key);
    }
    return result;
  };
  return {
    get length() { return keys().length; },
    key: (index) => keys()[index] ?? null,
    getItem: (key) => storage.getItem(physical(key)),
    setItem: (key, value) => storage.setItem(physical(key), String(value)),
    removeItem: (key) => storage.removeItem(physical(key)),
    clear: () => keys().filter(key => !authKey(key)).forEach(key => storage.removeItem(physical(key))),
  };
}
