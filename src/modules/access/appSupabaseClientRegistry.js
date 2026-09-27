// Deler hovedappens ene Supabase-klient med tynne integrasjonslag som monteres
// utenfor React-treet. Dette hindrer ekstra GoTrue-klienter mot samme auth-storage.

let appSupabaseClient = null;

export function registerAppSupabaseClient(client) {
  appSupabaseClient = client || null;
  return appSupabaseClient;
}

export function getAppSupabaseClient() {
  return appSupabaseClient;
}
