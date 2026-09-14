// Expo ProffDok – FASE 42F
// Delt, liten recovery-hjelper for intern Befaring/Tilbud.
// Holder bootstrap og SalesModule på samme markører/TTL uten å endre salgsdata.

export const SALES_RELOAD_TAB_KEY = "expo-proffdok:sales:restore-tab-after-reload";
export const SALES_RELOAD_NAVIGATION_KEY = "expo-proffdok:sales:restore-navigation-after-reload";
export const SALES_BACKGROUND_RESUME_KEY = "expo-proffdok:sales:background-resume-v1";
export const SALES_BACKGROUND_RESUME_MAX_AGE_MS = 2 * 60 * 60 * 1000;

function browserStorage(kind) {
  if (typeof window === "undefined") return null;
  try {
    return window[kind] || null;
  } catch {
    return null;
  }
}

function resolveStorage(explicitStorage, kind) {
  return explicitStorage === undefined ? browserStorage(kind) : explicitStorage;
}

function safeGet(storage, key) {
  try {
    return storage?.getItem?.(key) ?? null;
  } catch {
    return null;
  }
}

function safeSet(storage, key, value) {
  try {
    storage?.setItem?.(key, value);
    return true;
  } catch {
    return false;
  }
}

function safeRemove(storage, key) {
  try {
    storage?.removeItem?.(key);
  } catch {
    // Recovery-markører er kun UX-støtte.
  }
}

function parseBackgroundMarker(raw) {
  if (!raw) return null;
  try {
    const marker = JSON.parse(raw);
    return marker && typeof marker === "object" ? marker : null;
  } catch {
    return null;
  }
}

export function isFreshSalesBackgroundResumeMarker(
  marker,
  { now = Date.now(), storageKey = "" } = {}
) {
  if (!marker || typeof marker !== "object") return false;
  const markerStorageKey = String(marker.storageKey || "").trim();
  if (!markerStorageKey) return false;
  if (storageKey && markerStorageKey !== String(storageKey).trim()) return false;

  const age = Number(now) - Number(marker.at || 0);
  return (
    Number.isFinite(age) &&
    age >= 0 &&
    age <= SALES_BACKGROUND_RESUME_MAX_AGE_MS
  );
}

export function shouldBootstrapRestoreSales({
  sessionStorage,
  localStorage,
  now = Date.now(),
} = {}) {
  const session = resolveStorage(sessionStorage, "sessionStorage");
  const local = resolveStorage(localStorage, "localStorage");

  if (safeGet(session, SALES_RELOAD_TAB_KEY) === "1") return true;

  const raw = safeGet(local, SALES_BACKGROUND_RESUME_KEY);
  if (!raw) return false;
  const marker = parseBackgroundMarker(raw);
  const shouldRestore = isFreshSalesBackgroundResumeMarker(marker, { now });

  if (!shouldRestore) safeRemove(local, SALES_BACKGROUND_RESUME_KEY);
  return shouldRestore;
}

export function markSalesResumeForBackground(
  storageKey,
  { sessionStorage, localStorage, now = Date.now() } = {}
) {
  const normalizedStorageKey = String(storageKey || "").trim();
  if (!normalizedStorageKey) return;

  const session = resolveStorage(sessionStorage, "sessionStorage");
  const local = resolveStorage(localStorage, "localStorage");

  // Forsøk lagrene uavhengig. Safari/private mode kan avvise sessionStorage
  // samtidig som localStorage fortsatt er tilgjengelig.
  safeSet(session, SALES_RELOAD_TAB_KEY, "1");
  safeSet(session, SALES_RELOAD_NAVIGATION_KEY, "1");
  safeSet(
    local,
    SALES_BACKGROUND_RESUME_KEY,
    JSON.stringify({ at: Number(now), storageKey: normalizedStorageKey })
  );
}

export function consumeSalesResumeNavigation(
  storageKey,
  { sessionStorage, localStorage, now = Date.now() } = {}
) {
  const normalizedStorageKey = String(storageKey || "").trim();
  const session = resolveStorage(sessionStorage, "sessionStorage");
  const local = resolveStorage(localStorage, "localStorage");

  let shouldRestore = safeGet(session, SALES_RELOAD_NAVIGATION_KEY) === "1";
  safeRemove(session, SALES_RELOAD_NAVIGATION_KEY);
  safeRemove(session, SALES_RELOAD_TAB_KEY);

  const raw = safeGet(local, SALES_BACKGROUND_RESUME_KEY);
  if (!shouldRestore && raw) {
    const marker = parseBackgroundMarker(raw);
    shouldRestore = isFreshSalesBackgroundResumeMarker(marker, {
      now,
      storageKey: normalizedStorageKey,
    });
  }

  safeRemove(local, SALES_BACKGROUND_RESUME_KEY);
  return shouldRestore;
}

export function clearSalesResumeMarkers({ sessionStorage, localStorage } = {}) {
  const session = resolveStorage(sessionStorage, "sessionStorage");
  const local = resolveStorage(localStorage, "localStorage");

  safeRemove(session, SALES_RELOAD_TAB_KEY);
  safeRemove(session, SALES_RELOAD_NAVIGATION_KEY);
  safeRemove(local, SALES_BACKGROUND_RESUME_KEY);
}
