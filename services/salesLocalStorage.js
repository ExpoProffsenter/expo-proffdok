// Expo ProffDok – FASE 23C
// Lokal nettleserlagring for Befaring / Tilbud / Aksept.
// Ingen React-state, Supabase-kall, Storage-bucket-kall eller UI-rendering.

import {
  STORAGE_KEY,
  initialRequests,
} from "../constants/salesConstants.js";

function getLocalStorage() {
  if (typeof window === "undefined" || !window.localStorage) return null;
  return window.localStorage;
}

export function buildSalesStorageKey({
  integrationMode = "preview",
  companyName = "",
  userId = "anonymous",
} = {}) {
  if (integrationMode !== "app") return STORAGE_KEY;

  const companyScope = String(companyName || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const userScope = String(userId || "anonymous");

  return `${STORAGE_KEY}:${companyScope || "uten-firma"}:${userScope}`;
}

export function loadSalesNavigation(storageKey) {
  try {
    const storage = getLocalStorage();
    if (!storage) return { mode: "list", selectedRequestId: null };

    const storedNavigation = storage.getItem(`${storageKey}:navigation`);
    const parsedNavigation = storedNavigation
      ? JSON.parse(storedNavigation)
      : null;

    if (!parsedNavigation?.selectedRequestId) {
      return { mode: "list", selectedRequestId: null };
    }

    return {
      mode: parsedNavigation.mode || "detail",
      selectedRequestId: parsedNavigation.selectedRequestId,
    };
  } catch {
    return { mode: "list", selectedRequestId: null };
  }
}

export function saveSalesNavigation(storageKey, mode, selectedRequestId) {
  try {
    const storage = getLocalStorage();
    if (!storage) return;

    storage.setItem(
      `${storageKey}:navigation`,
      JSON.stringify({ mode, selectedRequestId })
    );
  } catch {
    // Navigasjon er kun et lokalt hjelpemiddel.
  }
}

export function loadRequests(storageKey = STORAGE_KEY) {
  try {
    const storage = getLocalStorage();
    if (!storage) return initialRequests;

    const storedRequests = storage.getItem(storageKey);
    if (!storedRequests) return initialRequests;

    const parsedRequests = JSON.parse(storedRequests);
    if (!Array.isArray(parsedRequests)) return initialRequests;

    return parsedRequests;
  } catch {
    return initialRequests;
  }
}

export function saveRequests(requests, storageKey = STORAGE_KEY) {
  try {
    const storage = getLocalStorage();
    if (!storage) return;

    storage.setItem(storageKey, JSON.stringify(requests));
  } catch {
    // Lokal preview-lagring er kun et sikkerhetsnett.
  }
}

export function buildStableOfferDraftKey({
  userId = "",
  userEmail = "",
  requestId = "",
} = {}) {
  const userScope = String(userId || userEmail || "innlogget-bruker")
    .trim()
    .toLowerCase();

  return `${STORAGE_KEY}:offer-draft:${userScope}:${requestId || "uten-sak"}`;
}

export function buildScopedOfferDraftKey(storageKey, requestId = "") {
  return `${storageKey}:offer-draft:${requestId || "uten-sak"}`;
}

export function saveOfferDraft(stableKey, formValue) {
  const storage = getLocalStorage();
  if (!storage) return;

  storage.setItem(
    stableKey,
    JSON.stringify({
      form: formValue,
      savedAt: new Date().toISOString(),
    })
  );
}

export function loadOfferDraft({
  requestId = "",
  stableKey = "",
  scopedKey = "",
} = {}) {
  if (!requestId) return null;

  const storage = getLocalStorage();
  if (!storage) return null;

  const candidateKeys = [stableKey, scopedKey].filter(Boolean);
  const legacySuffix = `:offer-draft:${requestId}`;

  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key?.startsWith(STORAGE_KEY) && key.endsWith(legacySuffix)) {
      candidateKeys.push(key);
    }
  }

  return candidateKeys.reduce((latest, key) => {
    try {
      const parsed = JSON.parse(storage.getItem(key) || "null");
      if (!parsed?.form) return latest;

      const savedAt = Date.parse(parsed.savedAt || "") || 0;
      return !latest || savedAt >= latest.savedAt
        ? { form: parsed.form, savedAt }
        : latest;
    } catch {
      return latest;
    }
  }, null)?.form || null;
}

export function clearOfferDraft(stableKey, scopedKey) {
  const storage = getLocalStorage();
  if (!storage) return;

  [stableKey, scopedKey].filter(Boolean).forEach((key) => storage.removeItem(key));
}

export function buildInspectionDraftKey(storageKey, requestId = "") {
  return `${storageKey}:inspection-draft:${requestId || "uten-sak"}`;
}

export function saveInspectionDraft(draftKey, formValue) {
  try {
    const storage = getLocalStorage();
    if (!storage) return;

    storage.setItem(
      draftKey,
      JSON.stringify({
        form: formValue,
        savedAt: new Date().toISOString(),
      })
    );
  } catch {
    // Lokal feature-kladd. Ingen database-/prosjektlagring.
  }
}

export function loadInspectionDraft(draftKey) {
  try {
    const storage = getLocalStorage();
    if (!storage) return null;

    const storedDraft = storage.getItem(draftKey);
    return storedDraft ? JSON.parse(storedDraft) : null;
  } catch {
    return null;
  }
}

export function clearInspectionDraft(draftKey) {
  try {
    const storage = getLocalStorage();
    if (!storage) return;

    storage.removeItem(draftKey);
  } catch {
    // Lokal feature-kladd.
  }
}
