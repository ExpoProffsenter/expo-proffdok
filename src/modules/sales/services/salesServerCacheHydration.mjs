// Expo ProffDok – FASE 42F
// Helpers for å prime firmascopet Sales-cache med siste serverdata før
// SalesModuleCore mountes. Samme request_ref fra server er alltid fasit, mens
// lokal-only saker beholdes som sikkerhetsnett dersom de ennå ikke finnes på server.
// Strukturelt tomme lokale befaringskladder får aldri overstyre et eksisterende,
// meningsfullt serverlagret befaringsnotat på ny nettleser/Preview eller etter remount.
// Serverlagrede bilder og Badskisse flettes alltid tilbake inn i en meningsfull
// lokal kladd, uten å overskrive lokale usynkroniserte bilder.

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

function isBathroomSketchMedia(value = {}) {
  return Boolean(
    value?.kind === "bathroom-sketch" ||
      String(value?.id || "").startsWith("bathroom-sketch-")
  );
}

function serverMediaLoadingDataUrl(value = {}) {
  const label = isBathroomSketchMedia(value)
    ? "Henter lagret badskisse fra server …"
    : "Henter lagret bilde fra server …";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540"><rect width="960" height="540" fill="#f2fafb"/><rect x="24" y="24" width="912" height="492" rx="20" fill="none" stroke="#b9d9df" stroke-width="4"/><text x="480" y="270" text-anchor="middle" dominant-baseline="middle" font-family="Arial,sans-serif" font-size="30" font-weight="700" fill="#355864">${label}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function prepareServerMediaForDisplay(item = {}) {
  const dataUrl = String(item?.dataUrl || "").trim();
  if (dataUrl || !String(item?.path || "").trim()) {
    return { ...item, serverHydrating: false };
  }
  return {
    ...item,
    dataUrl: serverMediaLoadingDataUrl(item),
    serverHydrating: true,
  };
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

  const includedIds = new Set();
  const includedPaths = new Set();
  const merged = current.map((item) => {
    const { id, path } = mediaIdentity(item);
    if (id) includedIds.add(id);
    if (path) includedPaths.add(path);

    // Lokale, ennå usynkroniserte bilder/skisser skal aldri overskrives av en
    // eldre serverkopi bare fordi de tilfeldigvis har samme id.
    if (!path) return item;

    const serverItem =
      (id ? serverById.get(id) : null) ||
      (path ? serverByPath.get(path) : null) ||
      null;
    if (!serverItem) return item;

    const freshDataUrl = String(serverItem?.dataUrl || "").trim();
    if (freshDataUrl) {
      return {
        ...item,
        kind: item?.kind || serverItem?.kind,
        name: item?.name || serverItem?.name,
        dataUrl: freshDataUrl,
        serverHydrating: false,
      };
    }

    if (!String(item?.dataUrl || "").trim() || item?.serverHydrating) {
      return prepareServerMediaForDisplay({ ...serverItem, ...item });
    }

    return item;
  });

  // Kritisk: lokal kladd kan være meningsfull og samtidig mangle ett eller flere
  // serverlagrede medier (typisk Badskisse). De skal legges tilbake, ikke bare
  // få oppdatert URL dersom de allerede finnes lokalt.
  server.forEach((item) => {
    const { id, path } = mediaIdentity(item);
    if ((id && includedIds.has(id)) || (path && includedPaths.has(path))) return;
    merged.push(prepareServerMediaForDisplay(item));
    if (id) includedIds.add(id);
    if (path) includedPaths.add(path);
  });

  return merged;
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

export function mergeServerInspectionMediaIntoLocalDraftsForServerRows(
  rows = [],
  storage = browserStorage()
) {
  if (!storage) return [];

  const serverRequests = mapSalesServerRowsToRequests(rows)
    .map((request) => ({
      requestId: String(request?.id || "").trim(),
      photos: buildServerInspectionForm(request).photos,
    }))
    .filter(
      ({ requestId, photos }) => requestId && Array.isArray(photos) && photos.length > 0
    );
  if (!serverRequests.length) return [];

  const updatedKeys = [];

  try {
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (!key || !key.includes(":inspection-draft:")) continue;

      const serverRequest = serverRequests.find(({ requestId }) =>
        key.endsWith(`:inspection-draft:${requestId}`)
      );
      if (!serverRequest) continue;

      const draft = parseStoredJson(storage, key);
      if (!draft?.form || !hasMeaningfulInspectionContent(draft.form)) continue;

      const currentPhotos = Array.isArray(draft.form.photos) ? draft.form.photos : [];
      const mergedPhotos = mergeInspectionMediaForDisplay(
        currentPhotos,
        serverRequest.photos
      );

      let changed = false;
      try {
        changed = JSON.stringify(currentPhotos) !== JSON.stringify(mergedPhotos);
      } catch {
        changed = true;
      }
      if (!changed) continue;

      storage.setItem(
        key,
        JSON.stringify({
          ...draft,
          form: {
            ...draft.form,
            photos: mergedPhotos,
          },
        })
      );
      updatedKeys.push(key);
    }
  } catch {
    return updatedKeys;
  }

  return updatedKeys;
}

export function mergeSalesServerRowsIntoCache(rows = [], localRequests = []) {
  // Kjør før SalesModuleCore mountes. Da kan ikke en tom lokal befaringskladd
  // fra en tidligere race vinne over serverens faktiske notat når openInspectionNote()
  // senere velger mellom lokal kladd og request-data.
  clearStructurallyEmptyInspectionDraftsForServerRows(rows);

  // En reell lokal kladd kan være nyere i tekstfeltene, men samtidig mangle et
  // allerede serverlagret bilde/Badskisse. Flett servermedia inn uten å endre
  // kladdens savedAt eller overskrive lokale usynkroniserte medier.
  mergeServerInspectionMediaIntoLocalDraftsForServerRows(rows);

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
