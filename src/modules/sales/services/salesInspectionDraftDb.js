// Expo ProffDok – FASE 30D1
// Lokal-first sikkerhetslagring for befaringsbilder.
// Binære bildefiler lagres i IndexedDB før de tas inn i React-skjemaet.
// Ingen Supabase-, Storage-, SQL-, RLS- eller Edge-endring.

const DB_NAME = "expo-proffdok-sales-drafts";
const DB_VERSION = 1;
const STORE_NAME = "inspectionPhotos";
const SCOPE_INDEX = "scope";

function browserIndexedDb() {
  return typeof window !== "undefined" ? window.indexedDB : null;
}

function parseJson(value) {
  try {
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function currentAuthUserId() {
  if (typeof window === "undefined" || !window.localStorage) return "";

  try {
    const storage = window.localStorage;
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (!key?.startsWith("sb-") || !key.includes("-auth-token")) continue;
      const parsed = parseJson(storage.getItem(key));
      const userId = String(
        parsed?.user?.id ||
          parsed?.currentSession?.user?.id ||
          parsed?.session?.user?.id ||
          ""
      ).trim();
      if (userId) return userId;
    }
  } catch {
    return "";
  }

  return "";
}

function supportCompanyScope() {
  if (typeof window === "undefined") return "";
  try {
    return String(
      new URLSearchParams(window.location.search).get("salesSupportCompany") || ""
    ).trim();
  } catch {
    return "";
  }
}

function inspectionScope(requestId = "") {
  const userId = currentAuthUserId() || "innlogget-bruker";
  const supportCompanyId = supportCompanyScope();
  return [
    userId,
    supportCompanyId ? `support-${supportCompanyId}` : "firma",
    String(requestId || "uten-sak"),
  ].join(":");
}

function openDb() {
  const indexedDb = browserIndexedDb();
  if (!indexedDb) {
    return Promise.reject(
      new Error("Denne nettleseren støtter ikke lokal sikkerhetslagring for bilder.")
    );
  }

  return new Promise((resolve, reject) => {
    const request = indexedDb.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      let store;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        store = db.createObjectStore(STORE_NAME, { keyPath: "key" });
      } else {
        store = request.transaction.objectStore(STORE_NAME);
      }
      if (!store.indexNames.contains(SCOPE_INDEX)) {
        store.createIndex(SCOPE_INDEX, "scope", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error || new Error("Kunne ikke åpne lokal bildelagring."));
    request.onblocked = () =>
      reject(new Error("Lokal bildelagring er midlertidig blokkert. Lukk andre faner og prøv igjen."));
  });
}

function waitForTransaction(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(transaction.error || new Error("Lokal bildelagring feilet."));
    transaction.onabort = () =>
      reject(transaction.error || new Error("Lokal bildelagring ble avbrutt."));
  });
}

export function isInspectionDraftDbAvailable() {
  return Boolean(browserIndexedDb());
}

export async function requestPersistentInspectionStorage() {
  try {
    if (!navigator?.storage?.persist) return false;
    return Boolean(await navigator.storage.persist());
  } catch {
    return false;
  }
}

export async function saveInspectionPhotoBlob({
  requestId,
  photoId,
  name = "Befaringsbilde",
  blob,
  type = "",
  lastModified = 0,
} = {}) {
  if (!requestId || !photoId || !(blob instanceof Blob)) {
    throw new Error("Befaringsbildet mangler nødvendig lokal lagringsinformasjon.");
  }

  const db = await openDb();
  const scope = inspectionScope(requestId);
  const key = `${scope}:${photoId}`;
  const createdAt = new Date().toISOString();
  const record = {
    key,
    scope,
    requestId: String(requestId),
    id: String(photoId),
    name: String(name || "Befaringsbilde"),
    type: String(type || blob.type || "image/jpeg"),
    size: Number(blob.size || 0),
    lastModified: Number(lastModified || 0),
    createdAt,
    blob,
  };

  try {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put(record);
    await waitForTransaction(transaction);
    return record;
  } finally {
    db.close();
  }
}

export async function listInspectionPhotoBlobs(requestId = "") {
  if (!requestId) return [];
  const db = await openDb();
  const scope = inspectionScope(requestId);

  try {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index(SCOPE_INDEX);
    const request = index.getAll(scope);
    const records = await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(Array.isArray(request.result) ? request.result : []);
      request.onerror = () =>
        reject(request.error || new Error("Kunne ikke lese lokalt sikrede befaringsbilder."));
    });
    await waitForTransaction(transaction);
    return records.sort((a, b) =>
      String(a?.createdAt || "").localeCompare(String(b?.createdAt || ""))
    );
  } finally {
    db.close();
  }
}

export async function removeInspectionPhotoBlobByKey(key = "") {
  if (!key) return false;
  const db = await openDb();
  try {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).delete(key);
    await waitForTransaction(transaction);
    return true;
  } finally {
    db.close();
  }
}

export async function removeInspectionPhotoBlob(requestId = "", photoId = "") {
  if (!requestId || !photoId) return false;
  const scope = inspectionScope(requestId);
  return removeInspectionPhotoBlobByKey(`${scope}:${photoId}`);
}
