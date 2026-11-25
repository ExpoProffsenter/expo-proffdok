// Present the server-verified customer identity to existing modules without
// replacing the real administrator's persisted Auth session or refresh token.
const views = new WeakMap();
export function wrapSupportClient(client, runtime) {
  if (!client || !runtime) return client;
  if (!views.has(runtime)) views.set(runtime, new WeakMap());
  const clients = views.get(runtime);
  if (clients.has(client)) return clients.get(client);
  const sessionView = session => {
    if (!session) { runtime.projectUser(null); return null; }
    return { ...session, user: runtime.projectUser(session.user) };
  };
  const blockedChannels = new WeakSet();
  const auth = new Proxy(client.auth, {
    get(target, key) {
      if (key === 'getSession') return async (...args) => {
        const result = await target.getSession(...args);
        return { ...result, data: { ...result.data, session: sessionView(result.data?.session) } };
      };
      if (key === 'getUser') return async (...args) => {
        const result = await target.getUser(...args);
        return { ...result, data: { ...result.data, user: runtime.projectUser(result.data?.user) } };
      };
      if (key === 'onAuthStateChange') return callback => target.onAuthStateChange((event, session) => {
        callback(event, sessionView(session));
      });
      const value = Reflect.get(target, key, target);
      return typeof value === 'function' ? value.bind(target) : value;
    },
  });
  const view = new Proxy(client, {
    get(target, key) {
      if (key === 'auth') return auth;
      // Realtime cannot apply the request-local support context. Existing
      // project chat keeps its authenticated REST polling every five seconds.
      if (key === 'channel' && runtime.getState().phase !== 'idle') return () => {
        const channel = { on() { return this; }, subscribe() { return this; }, async unsubscribe() { return 'ok'; } };
        blockedChannels.add(channel); return channel;
      };
      if (key === 'removeChannel') return channel => blockedChannels.has(channel) ? Promise.resolve('ok') : target.removeChannel(channel);
      const value = Reflect.get(target, key, target);
      return typeof value === 'function' ? value.bind(target) : value;
    },
  });
  clients.set(client, view);
  clients.set(view, view);
  return view;
}
