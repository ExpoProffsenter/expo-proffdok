// Expo ProffDok – FASE 38A1
// Én klientkontrakt for brukerens modultilganger. Server/RLS er autoritativ;
// denne filen brukes bare til å projisere samme tilgang i meny, Admin og Hjelp.

export const MODULE_ACCESS_EVENT = "expo-proffdok-module-access";
export const MODULE_ACCESS_GLOBAL = "__expoProffDokModuleAccess";

export const MODULE_CATALOG = [
  {
    key: "projects",
    label: "Prosjekter og dokumentasjon",
    shortLabel: "Prosjekter",
    description: "Prosjekter, dokumentasjon, sjekklister, bilder, avvik, garanti og rapport.",
  },
  {
    key: "sales",
    label: "Befaring / Våtromstilbud",
    shortLabel: "Befaring/Tilbud",
    description: "Forespørsler, befaring, ordinære tilbud, kundeaksept og kontrakt/prosjektflyt.",
  },
  {
    key: "store_offers",
    label: "Butikktilbud",
    shortLabel: "Butikktilbud",
    description: "Varebaserte butikktilbud. Krever samtidig Befaring / Våtromstilbud.",
    requires: ["sales"],
  },
];

const VALID_MODULE_KEYS = new Set(MODULE_CATALOG.map((module) => module.key));
const FALLBACK_SUPABASE_URL = "https://dqffxflaoyarbxyiyhop.supabase.co";
const FALLBACK_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxZmZ4Zmxhb3lhcmJ4eWl5aG9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NzcxNTEsImV4cCI6MjA5MzA1MzE1MX0.5fkVNPooHGlayw4NgYM3fUVrAiv0XbUyTixkfeToMSE";

function uniqueModuleKeys(keys = []) {
  return [...new Set((Array.isArray(keys) ? keys : []).map((key) => String(key || "").trim()))]
    .filter((key) => VALID_MODULE_KEYS.has(key));
}

export function normalizeModuleKeys(keys = []) {
  const normalized = uniqueModuleKeys(keys);
  if (normalized.includes("store_offers") && !normalized.includes("sales")) {
    normalized.push("sales");
  }
  return MODULE_CATALOG.map((module) => module.key).filter((key) => normalized.includes(key));
}

export function hasModuleAccess(access, moduleKey) {
  if (!moduleKey) return true;
  if (access?.isSystemAdmin || access?.is_systemadmin) return true;
  const keys = access?.moduleKeys || access?.module_keys || [];
  return normalizeModuleKeys(keys).includes(moduleKey);
}

export function readCachedModuleAccess() {
  if (typeof window === "undefined") {
    return { loaded: false, moduleKeys: [], isSystemAdmin: false, isFirmaAdmin: false };
  }
  const current = window[MODULE_ACCESS_GLOBAL];
  if (!current || typeof current !== "object") {
    return { loaded: false, moduleKeys: [], isSystemAdmin: false, isFirmaAdmin: false };
  }
  return {
    loaded: Boolean(current.loaded),
    moduleKeys: normalizeModuleKeys(current.moduleKeys || current.module_keys || []),
    isSystemAdmin: Boolean(current.isSystemAdmin ?? current.is_systemadmin),
    isFirmaAdmin: Boolean(current.isFirmaAdmin ?? current.is_firmaadmin),
    error: String(current.error || ""),
  };
}

export function publishModuleAccess(access = {}) {
  const next = {
    loaded: access.loaded !== false,
    moduleKeys: normalizeModuleKeys(access.moduleKeys || access.module_keys || []),
    isSystemAdmin: Boolean(access.isSystemAdmin ?? access.is_systemadmin),
    isFirmaAdmin: Boolean(access.isFirmaAdmin ?? access.is_firmaadmin),
    error: String(access.error || ""),
  };

  if (next.isSystemAdmin) {
    next.moduleKeys = MODULE_CATALOG.map((module) => module.key);
  }

  if (typeof window !== "undefined") {
    window[MODULE_ACCESS_GLOBAL] = next;
    window.dispatchEvent(new CustomEvent(MODULE_ACCESS_EVENT, { detail: next }));
  }
  return next;
}

function parseStoredSession(raw = "") {
  try {
    const value = JSON.parse(raw);
    const session = value?.currentSession || value?.session || value;
    return {
      accessToken: String(session?.access_token || "").trim(),
      userId: String(session?.user?.id || value?.user?.id || "").trim(),
    };
  } catch {
    return { accessToken: "", userId: "" };
  }
}

export function getStoredSupabaseSession() {
  if (typeof window === "undefined" || !window.localStorage) {
    return { accessToken: "", userId: "" };
  }

  const keys = [];
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (key && key.startsWith("sb-") && key.endsWith("-auth-token")) keys.push(key);
  }

  for (const key of keys) {
    const session = parseStoredSession(window.localStorage.getItem(key) || "");
    if (session.accessToken) return session;
  }
  return { accessToken: "", userId: "" };
}

function supabaseRestConfig() {
  return {
    url: String(import.meta.env.VITE_SUPABASE_URL || FALLBACK_SUPABASE_URL).replace(/\/$/, ""),
    anonKey: String(import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY),
  };
}

export async function rpcWithStoredSession(functionName, args = {}) {
  const { accessToken } = getStoredSupabaseSession();
  if (!accessToken) throw new Error("Innlogging er ikke klar ennå.");

  const { url, anonKey } = supabaseRestConfig();
  const response = await fetch(`${url}/rest/v1/rpc/${encodeURIComponent(functionName)}`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args || {}),
  });

  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }

  if (!response.ok) {
    const message = payload?.message || payload?.error_description || payload?.error || text;
    throw new Error(String(message || `Serverfeil ${response.status}`));
  }
  return payload;
}

function normalizeMyAccess(payload = {}) {
  return {
    loaded: true,
    moduleKeys: normalizeModuleKeys(payload?.module_keys || []),
    isSystemAdmin: Boolean(payload?.is_systemadmin),
    isFirmaAdmin: Boolean(payload?.is_firmaadmin),
    error: "",
  };
}

export async function getMyModuleAccess(client = null) {
  let payload;
  if (client?.rpc) {
    const { data, error } = await client.rpc("get_my_module_access");
    if (error) throw error;
    payload = data;
  } else {
    payload = await rpcWithStoredSession("get_my_module_access");
  }
  return normalizeMyAccess(payload || {});
}

export async function refreshMyModuleAccess(client = null) {
  try {
    const access = await getMyModuleAccess(client);
    return publishModuleAccess(access);
  } catch (error) {
    const previous = readCachedModuleAccess();
    return publishModuleAccess({
      ...previous,
      loaded: previous.loaded,
      error: error?.message || "Kunne ikke hente modultilgang.",
    });
  }
}

export async function listManagedModuleAccess() {
  const payload = await rpcWithStoredSession("list_managed_module_access");
  return {
    ...payload,
    caller_module_keys: normalizeModuleKeys(payload?.caller_module_keys || []),
    users: (Array.isArray(payload?.users) ? payload.users : []).map((user) => ({
      ...user,
      module_keys: normalizeModuleKeys(user?.module_keys || []),
    })),
  };
}

export async function setManagedModuleAccess(userId, moduleKeys) {
  const payload = await rpcWithStoredSession("set_managed_module_access", {
    target_user_id: userId,
    requested_module_keys: normalizeModuleKeys(moduleKeys),
  });
  return {
    ...payload,
    module_keys: normalizeModuleKeys(payload?.module_keys || []),
  };
}
