import { createSupportStorage } from './appSupportRuntime.mjs';
const authKey = key => /^sb-.+-auth-token(?:-code-verifier)?$/.test(key || '');
export function isolateSupportCaches(window, id, rawLocalStorage, rawSessionStorage) {
  const prefix = `expo-support:${id}:`;
  const local = createSupportStorage(rawLocalStorage, id);
  const session = createSupportStorage(rawSessionStorage, id);
  Object.defineProperty(window, 'localStorage', { configurable: true, get: () => local });
  Object.defineProperty(window, 'sessionStorage', { configurable: true, get: () => session });
  if (window.indexedDB) {
    const db = window.indexedDB;
    const open = db.open.bind(db), remove = db.deleteDatabase.bind(db);
    db.open = (name, ...args) => open(prefix + name, ...args);
    db.deleteDatabase = name => remove(prefix + name);
    if (db.databases) {
      const databases = db.databases.bind(db);
      db.databases = async () => (await databases()).filter(x => x.name?.startsWith(prefix))
        .map(x => ({ ...x, name: x.name.slice(prefix.length) }));
    }
  }
  // Other customer/admin tabs may update their own drafts. Only this namespace
  // and the real shared Auth session are visible to the support app.
  window.addEventListener('storage', event => {
    if (event.supportTranslated || authKey(event.key)) return;
    event.stopImmediatePropagation();
    if (event.key?.startsWith(prefix)) {
      const copy = new window.Event('storage');
      for (const [key, value] of Object.entries({ key: event.key.slice(prefix.length), oldValue: event.oldValue,
        newValue: event.newValue, url: event.url, storageArea: event.storageArea === rawLocalStorage ? local : session })) {
        Object.defineProperty(copy, key, { value });
      }
      // Mark synthetic events to avoid recursively translating the namespace.
      Object.defineProperty(copy, 'supportTranslated', { value: true });
      window.dispatchEvent(copy);
    }
  }, { capture: true });
}

