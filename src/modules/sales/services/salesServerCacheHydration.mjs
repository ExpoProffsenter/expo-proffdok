// Expo ProffDok – FASE 42F
// Pure helpers for å prime firmascopet Sales-cache med siste serverdata før
// SalesModuleCore mountes. Samme request_ref fra server er alltid fasit, mens
// lokal-only saker beholdes som sikkerhetsnett dersom de ennå ikke finnes på server.

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

export function mergeSalesServerRowsIntoCache(rows = [], localRequests = []) {
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
