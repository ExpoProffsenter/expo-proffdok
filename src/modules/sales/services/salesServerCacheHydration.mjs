// Expo ProffDok – FASE 42F
// Helpers for å prime firmascopet Sales-cache med siste serverdata før
// SalesModuleCore mountes. Samme request_ref fra server er alltid fasit, mens
// lokal-only saker beholdes som sikkerhetsnett dersom de ennå ikke finnes på server.
// Strukturelt tomme lokale befaringskladder får aldri overstyre et eksisterende,
// meningsfullt serverlagret befaringsnotat på ny nettleser/Preview eller etter remount.

function browserStorage() {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

function parseStoredJson(storage, key) {
  try {
    const raw = storage?.getItem?.(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function mapSalesServerRowsToRequests(rows = []) {
  return (Array.isArray(rows) ? rows : [])
    .map((row) => {
      const requestRef = String(row?.request_ref || row?.payload?.id || "").trim();
      if (!requestRef) return null;
      return {
        ...(row?.payload || {}),
        id: requestRef,
      };
    })
    .filter(Boolean);
}

export function buildServerInspectionForm(request = {}) {
  return {
    customerWishes:
      request?.inspectionCustomerWishes || request?.customerWishes || "",
    existingConditions:
      request?.inspectionExistingConditions || request?.existingConditions || "",
    measurements:
      request?.inspectionMeasurements || request?.measurements || "",
    observations:
      request?.inspectionObservations ||
      request?.observations ||
      request?.inspectionNote ||
      "",
    photos: Array.isArray(request?.inspectionPhotos)
      ? request.inspectionPhotos
      : Array.isArray(request?.photos)
        ? request.photos
        : [],
  };
}

export function hasMeaningfulInspectionContent(value = {}) {
  const form = value?.form && typeof value.form === "object" ? value.form : value;
  const textFields = [
    form?.customerWishes,
    form?.existingConditions,
    form?.measurements,
    form?.observations,
  ];

  return Boolean(
    textFields.some((field) => String(field || "").trim()) ||
      (Array.isArray(form?.photos) && form.photos.length > 0)
  );
}

function mediaIdentity(value = {}) {
  const id = String(value?.id || "").trim();
  const path = String(value?.path || "").trim();
  return { id, path };
}

export function mergeInspectionMediaForDisplay(currentMedia = [], serverMedia = []) {
  const current = Array.isArray(currentMedia) ? currentMedia : [];
  const server = Array.isArray(serverMedia) ? serverMedia : [];

  const serverById = new Map();
  const serverByPath = new Map();
  server.forEach((item) => {
    const { id, path } = mediaIdentity(item);
    if (id) serverById.set(id, item);
    if (path) serverByPath.set(path, item);
  });

  return current.map((item) => {
    const { id, path } = mediaIdentity(item);
    if (!path) return item;

    const serverItem =
      (id ? serverById.get(id) : null) ||
      (path ? serverByPath.get(path) : null) ||
      null;
    const freshDataUrl = String(serverItem?.dataUrl || "").trim();

    if (!freshDataUrl || freshDataUrl === String(item?.dataUrl || "").trim()) {
      return item;
    }

    return {
      ...item,
      dataUrl: freshDataUrl,
    };
  });
}

export function clearStructurallyEmptyInspectionDraftsForServerRows(
  rows = [],
  storage = browserStorage()
) {
  if (!storage) return [];

  const serverRequests = mapSalesServerRowsToRequests(rows).filter((request) =>
    hasMeaningfulInspectionContent(buildServerInspectionForm(request))
  );
  if (!serverRequests.length) return [];

  const requestIds = new Set(
    serverRequests.map((request) => String(request?.id || "").trim()).filter(Boolean)
  );
  const keysToRemove = [];

  try {
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (!key || !key.includes(":inspection-draft:")) continue;

      const requestId = [...requestIds].find((id) => key.endsWith(`:inspection-draft:${id}`));
      if (!requestId) continue;

      const draft = parseStoredJson(storage, key);
      if (draft?.form && !hasMeaningfulInspectionContent(draft.form)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => storage.removeItem(key));
  } catch {
    return [];
  }

  return keysToRemove;
}

export function mergeSalesServerRowsIntoCache(rows = [], localRequests = []) {
  // Kjør før SalesModuleCore mountes. Da kan ikke en tom lokal befaringskladd
  // fra en tidligere race vinne over serverens faktiske notat når openInspectionNote()
  // senere velger mellom lokal kladd og request-data.
  clearStructurallyEmptyInspectionDraftsForServerRows(rows);

  const serverRequests = mapSalesServerRowsToRequests(rows);
  const serverIds = new Set(serverRequests.map((request) => String(request.id || "")));
  const localOnly = (Array.isArray(localRequests) ? localRequests : []).filter(
    (request) => {
      const id = String(request?.id || "").trim();
      return Boolean(id && !serverIds.has(id));
    }
  );

  return [...serverRequests, ...localOnly];
}

export function shouldGateSalesCoreUntilServerCache({
  integrationMode = "preview",
  authUserId = "",
  serverCacheReady = false,
} = {}) {
  if (integrationMode !== "app") return false;
  if (!String(authUserId || "").trim()) return true;
  return !serverCacheReady;
}
