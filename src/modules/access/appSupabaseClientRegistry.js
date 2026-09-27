// Deler hovedappens ene Supabase-klient med tynne integrasjonslag som monteres
// utenfor React-treet. Dette hindrer ekstra GoTrue-klienter mot samme auth-storage.

let appSupabaseClient = null;
const pendingRegistrationListeners = new Set();

export function registerAppSupabaseClient(client) {
  appSupabaseClient = client || null;

  if (appSupabaseClient && pendingRegistrationListeners.size) {
    const listeners = [...pendingRegistrationListeners];
    pendingRegistrationListeners.clear();
    listeners.forEach((listener) => {
      try {
        listener(appSupabaseClient);
      } catch (error) {
        console.error("Kunne ikke starte Supabase-integrasjonslag", error);
      }
    });
  }

  return appSupabaseClient;
}

export function getAppSupabaseClient() {
  return appSupabaseClient;
}

export function whenAppSupabaseClientRegistered(listener) {
  if (typeof listener !== "function") return () => {};
  if (appSupabaseClient) {
    listener(appSupabaseClient);
    return () => {};
  }

  pendingRegistrationListeners.add(listener);
  return () => pendingRegistrationListeners.delete(listener);
}
