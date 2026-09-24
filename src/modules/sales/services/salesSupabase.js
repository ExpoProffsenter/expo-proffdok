// Expo ProffDok – FASE 42I / FASE 39B.2 / FASE 37A2 / FASE 37A1 / FASE 34B / FASE 32
// FASE 46A HOTFIX: Standard Sales-klient er nå lazy slik at produksjonsappen ikke
// oppretter flere GoTrue/Supabase-klienter mot samme auth-storage ved modulimport.
// Firmascope-RPC nekter i tillegg å kjøre uten bekreftet autentisert session.
// FASE 42I laster kun en lett saksprojeksjon i Sales-oversikten. Komplett payload,
// bilder og tilbudshistorikk hentes først for valgt sak. Dette bevarer server-first
// recovery uten at hundrevis av tilbud lastes ved åpning av sakslisten.

export * from "./salesSupabaseBase.js";

import * as core from "./salesSupabaseBase.js";
import { STORAGE_KEY } from "../constants/salesConstants.js";
import {
  buildOfferFormForSignatureFromRequest,
  createOfferDraftContentSignature,
} from "../utils/salesOfferDraftSignature.js";

const OFFER_SERVER_BASELINE_PREFIX = `${STORAGE_KEY}:offer-server-baseline`;
const RUNTIME_PAYLOAD_KEYS = [
  "__createdByUserId",
  "__createdByName",
  "__createdAt",
  "__searchText",
  "__summaryOnly",
  "__detailLoaded",
  "offerOriginalEmailSentAt",
  "offerAutoFollowUpSentAt",
  "offerAutoFollowUpVersionId",
  "offerAutoFollowUpVersionNumber",
  "offerAutoFollowUpSourceSentAt",
  "offerAutoFollowUpReminderNumber",
];
const ACCEPTANCE_NOTIFY_FUNCTION = "sales-offer-acceptance-notify";
const DECLINE_NOTIFY_FUNCTION = "sales-offer-decline-notify";

let sharedDefaultSalesSupabaseClient;
const preloadedDetailRows = new Map();
const salesRequestLoadListeners = new Set();
let loadSequence = 0;
let salesRequestLoadState = {
  status: "idle",
  error: "",
  startedAt: "",
  completedAt: "",
};

function setSalesRequestLoadState(nextState = {}) {
  salesRequestLoadState = { ...salesRequestLoadState, ...nextState };
  salesRequestLoadListeners.forEach((listener) => {
    try {
      listener({ ...salesRequestLoadState });
    } catch {
      // Kun presentasjonsstøtte.
    }
  });
}

export function getSalesRequestsLoadState() {
  return { ...salesRequestLoadState };
}

export function subscribeSalesRequestsLoadState(listener) {
  if (typeof listener !== "function") return () => {};
  salesRequestLoadListeners.add(listener);
  listener({ ...salesRequestLoadState });
  return () => salesRequestLoadListeners.delete(listener);
}

function createLazyDefaultSalesSupabaseClient() {
  let resolvedClient;

  const getClient = () => {
    if (resolvedClient === undefined) {
      resolvedClient = core.createDefaultSalesSupabaseClient();
    }
    return resolvedClient;
  };

  return new Proxy(
    {},
    {
      get(_target, property) {
        const client = getClient();
        const value = client?.[property];
        return typeof value === "function" ? value.bind(client) : value;
      },
    }
  );
}

export function createDefaultSalesSupabaseClient() {
  if (sharedDefaultSalesSupabaseClient === undefined) {
    sharedDefaultSalesSupabaseClient = createLazyDefaultSalesSupabaseClient();
  }
  return sharedDefaultSalesSupabaseClient;
}

export async function resolveSalesCompanyScope(client) {
  if (!client?.auth?.getSession || !client?.rpc) {
    return { data: null, error: new Error("Supabase-klient mangler eller er ikke klar.") };
  }

  let sessionResult;
  try {
    sessionResult = await client.auth.getSession();
  } catch (error) {
    return { data: null, error };
  }

  const sessionError = sessionResult?.error || null;
  const session = sessionResult?.data?.session || null;
  if (sessionError) return { data: null, error: sessionError };
  if (!session?.user?.id || !session?.access_token) {
    return {
      data: null,
      error: new Error("Innloggingen er ikke klar ennå. Prøv igjen."),
    };
  }

  return core.resolveSalesCompanyScope(client);
}

function browserStorage() {
  return typeof window !== "undefined" && window.localStorage
    ? window.localStorage
    : null;
}

function parseJson(storage, key) {
  try {
    const raw = storage?.getItem?.(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function stripRuntimeTraceability(payload = {}) {
  if (!payload || typeof payload !== "object") return payload;
  const clean = { ...payload };

  if (Object.prototype.hasOwnProperty.call(clean, "offerOriginalEmailSentAt")) {
    clean.offerEmailSentAt = clean.offerOriginalEmailSentAt || clean.offerEmailSentAt || "";
  }

  RUNTIME_PAYLOAD_KEYS.forEach((key) => delete clean[key]);
  return clean;
}

function hydrateArchiveState(rows = []) {
  return (Array.isArray(rows) ? rows : []).map((row) => ({
    ...row,
    payload: {
      ...(row?.payload || {}),
      archivedAt: row?.archived_at || "",
    },
  }));
}

function validDateMs(value) {
  const parsed = Date.parse(String(value || ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

async function hydrateOfferFollowUpState(client, companyId, rows = []) {
  const safeRows = Array.isArray(rows) ? rows : [];
  const requestRefs = [...new Set(safeRows.map((row) => String(row?.request_ref || "").trim()).filter(Boolean))];
  if (!client || !companyId || requestRefs.length === 0) return safeRows;

  let notificationQuery = client
    .from("sales_offer_follow_up_notifications")
    .select("request_ref,offer_version_id,reminder_number,status,sent_at,source_email_sent_at")
    .eq("company_id", companyId)
    .eq("status", "sent")
    .order("sent_at", { ascending: false });
  notificationQuery = notificationQuery.in("request_ref", requestRefs);

  const { data: notificationRows, error } = await notificationQuery;
  if (error || !Array.isArray(notificationRows) || notificationRows.length === 0) {
    return safeRows;
  }

  const versionIds = [
    ...new Set(
      notificationRows
        .map((row) => String(row?.offer_version_id || "").trim())
        .filter(Boolean)
    ),
  ];

  let versionNumberById = new Map();
  if (versionIds.length > 0) {
    const { data: versionRows, error: versionError } = await client
      .from("sales_offer_versions")
      .select("id,version_number")
      .in("id", versionIds);

    if (!versionError && Array.isArray(versionRows)) {
      versionNumberById = new Map(
        versionRows.map((row) => [String(row.id || ""), Number(row.version_number) || 0])
      );
    }
  }

  const latestByRequest = new Map();
  notificationRows.forEach((row) => {
    const requestRef = String(row?.request_ref || "").trim();
    if (!requestRef || latestByRequest.has(requestRef)) return;
    const versionId = String(row?.offer_version_id || "").trim();
    latestByRequest.set(requestRef, {
      sentAt: row?.sent_at || "",
      versionId,
      versionNumber: Number(versionNumberById.get(versionId) || 0),
      sourceSentAt: row?.source_email_sent_at || "",
      reminderNumber: Number(row?.reminder_number || 0),
    });
  });

  return safeRows.map((row) => {
    const state = latestByRequest.get(String(row?.request_ref || "").trim());
    if (!state) return row;

    const payload = row?.payload || {};
    const currentVersionNumber = Number(
      payload.offerEmailVersionNumber || payload.sentOfferVersionNumber || 0
    ) || 0;
    const autoVersionMatches =
      state.versionNumber > 0 &&
      currentVersionNumber > 0 &&
      state.versionNumber === currentVersionNumber;
    const originalEmailSentAt = payload.offerOriginalEmailSentAt || payload.offerEmailSentAt || "";
    const autoSentAtMs = validDateMs(state.sentAt);
    const originalSentAtMs = validDateMs(originalEmailSentAt);
    const autoIsLatestContact =
      autoVersionMatches && autoSentAtMs > 0 && autoSentAtMs >= originalSentAtMs;

    return {
      ...row,
      payload: {
        ...payload,
        offerOriginalEmailSentAt: originalEmailSentAt,
        offerEmailSentAt: autoIsLatestContact ? state.sentAt : originalEmailSentAt,
        offerAutoFollowUpSentAt: state.sentAt,
        offerAutoFollowUpVersionId: state.versionId,
        offerAutoFollowUpVersionNumber: state.versionNumber,
        offerAutoFollowUpSourceSentAt: state.sourceSentAt,
        offerAutoFollowUpReminderNumber: state.reminderNumber,
      },
    };
  });
}

function announceCreatorTraceability(rows = []) {
  if (typeof window === "undefined") return;
  if (!window.__expoProffDokSalesTraceability) window.__expoProffDokSalesTraceability = {};

  (Array.isArray(rows) ? rows : []).forEach((row) => {
    const payload = row?.payload || {};
    const creatorName = String(payload.__createdByName || row?.created_by_name || "").trim();
    if (!creatorName || !row?.request_ref) return;
    const detail = {
      requestRef: String(row.request_ref),
      createdByUserId: String(payload.__createdByUserId || row?.created_by || ""),
      createdByName: creatorName,
      createdAt: payload.__createdAt || row?.created_at || "",
    };
    window.__expoProffDokSalesTraceability[detail.requestRef] = detail;
    window.dispatchEvent(new CustomEvent("expo-proffdok-sales-traceability", { detail }));
  });
}

async function hydrateCreatorTraceability(client, companyId, rows = []) {
  const safeRows = Array.isArray(rows) ? rows : [];
  const requestRefs = [...new Set(safeRows.map((row) => String(row?.request_ref || "").trim()).filter(Boolean))];
  if (!client || !companyId || requestRefs.length === 0) return safeRows;

  const { data: traceRows, error } = await client
    .from("sales_requests")
    .select("request_ref,created_by,created_by_name,created_at")
    .eq("company_id", companyId)
    .in("request_ref", requestRefs);
  if (error || !Array.isArray(traceRows)) return safeRows;

  const traceByRef = new Map(traceRows.map((row) => [String(row.request_ref || ""), row]));
  return safeRows.map((row) => {
    const trace = traceByRef.get(String(row?.request_ref || ""));
    const creatorName = String(trace?.created_by_name || row?.created_by_name || "").trim();
    if (!creatorName) return row;
    return {
      ...row,
      payload: {
        ...(row?.payload || {}),
        __createdByUserId: String(trace?.created_by || row?.created_by || ""),
        __createdByName: creatorName,
        __createdAt: trace?.created_at || row?.created_at || "",
      },
    };
  });
}

async function rememberOfferContentSignatures(client, rows = [], fallbackCompanyId = "") {
  const storage = browserStorage();
  if (!storage || !client?.auth?.getSession) return;
  let userId = "";
  try {
    const { data } = await client.auth.getSession();
    userId = String(data?.session?.user?.id || "").trim();
  } catch {
    userId = "";
  }
  if (!userId) return;

  const observedAt = new Date().toISOString();
  for (const row of Array.isArray(rows) ? rows : []) {
    if (row?.payload?.__summaryOnly) continue;
    const companyId = String(row?.company_id || fallbackCompanyId || "").trim();
    const requestRef = String(row?.request_ref || "").trim();
    if (!companyId || !requestRef) continue;
    const payload = row?.payload || {};
    const offerDraftSignature = createOfferDraftContentSignature(
      buildOfferFormForSignatureFromRequest(payload)
    );
    const meaningfulLines = (Array.isArray(payload.offerLines) ? payload.offerLines : []).filter(
      (line) => String(line?.description || "").trim() || String(line?.amount ?? "").trim() || String(line?.internalProductNumber || "").trim()
    ).length;
    const meaningfulOptions = (Array.isArray(payload.offerOptions) ? payload.offerOptions : []).filter(
      (option) => String(option?.title || "").trim() || String(option?.description || "").trim() || String(option?.amount ?? "").trim()
    ).length;
    const key = `${OFFER_SERVER_BASELINE_PREFIX}:${userId}:${companyId}:${requestRef}`;
    const previous = parseJson(storage, key) || {};
    try {
      storage.setItem(
        key,
        JSON.stringify({
          ...previous,
          userId,
          companyId,
          requestRef,
          offerDraftSignature,
          offerDraftSavedAt: payload.offerDraftSavedAt || row?.updated_at || observedAt,
          meaningfulLines,
          meaningfulOptions,
          observedAt,
        })
      );
    } catch {
      // Fingeravtrykk/baseline er ekstra sikkerhetsnett.
    }
  }
}

function preloadedKey(companyId = "", requestRef = "") {
  return `${String(companyId || "").trim()}:${String(requestRef || "").trim()}`;
}

export async function fetchSalesRequestDetailRow(client, companyId, requestRef) {
  const safeCompanyId = String(companyId || "").trim();
  const safeRequestRef = String(requestRef || "").trim();
  if (!client || !safeCompanyId || !safeRequestRef) {
    return { data: null, error: new Error("Salgssaken kunne ikke identifiseres.") };
  }

  const result = await client
    .from("sales_requests")
    .select("company_id,request_ref,payload,status,archived_at,updated_at,created_by,created_by_name,created_at")
    .eq("company_id", safeCompanyId)
    .eq("request_ref", safeRequestRef)
    .maybeSingle();

  if (result?.error || !result?.data) return result;

  let rows = hydrateArchiveState([result.data]);
  rows = await hydrateOfferFollowUpState(client, safeCompanyId, rows);
  rows = await hydrateCreatorTraceability(client, safeCompanyId, rows);
  rows = rows.map((row) => ({
    ...row,
    payload: { ...(row.payload || {}), __detailLoaded: true },
  }));
  announceCreatorTraceability(rows);
  await rememberOfferContentSignatures(client, rows, safeCompanyId);
  return { ...result, data: rows[0] || null };
}

export async function primeSalesRequestDetailRow(client, companyId, requestRef) {
  const result = await fetchSalesRequestDetailRow(client, companyId, requestRef);
  if (!result?.error && result?.data) {
    preloadedDetailRows.set(preloadedKey(companyId, requestRef), result.data);
  }
  return result;
}

export async function fetchSalesRequests(client, companyId) {
  const sequence = ++loadSequence;
  setSalesRequestLoadState({
    status: "loading",
    error: "",
    startedAt: new Date().toISOString(),
    completedAt: "",
  });

  try {
    const supportCompanyId = core.getSalesSupportCompanyId?.() || "";
    const result = await client.rpc("list_sales_request_summaries", {
      requested_company_id: supportCompanyId || null,
    });

    if (result?.error) {
      if (sequence === loadSequence) {
        setSalesRequestLoadState({
          status: "error",
          error: result.error.message || "Kunne ikke hente salgssaker.",
          completedAt: new Date().toISOString(),
        });
      }
      return result;
    }

    let rows = hydrateArchiveState(result?.data || []);
    rows = rows.map((row) => {
      const key = preloadedKey(companyId, row?.request_ref);
      const preloaded = preloadedDetailRows.get(key);
      if (!preloaded) return row;
      preloadedDetailRows.delete(key);
      return {
        ...preloaded,
        status: row.status || preloaded.status,
        archived_at: row.archived_at ?? preloaded.archived_at,
        updated_at: row.updated_at || preloaded.updated_at,
        payload: {
          ...(preloaded.payload || {}),
          ...(row.payload || {}),
          archivedAt: row.archived_at || "",
          __summaryOnly: false,
          __detailLoaded: true,
        },
      };
    });

    announceCreatorTraceability(rows);
    result.data = rows;

    // React får først returnert metadata og kan sette requests/tellere. Ready
    // publiseres i neste task slik at UI ikke får et mellomsteg «0 saker».
    window.setTimeout(() => {
      if (sequence !== loadSequence) return;
      setSalesRequestLoadState({
        status: "ready",
        error: "",
        completedAt: new Date().toISOString(),
      });
    }, 0);

    return result;
  } catch (error) {
    if (sequence === loadSequence) {
      setSalesRequestLoadState({
        status: "error",
        error: error?.message || "Kunne ikke hente salgssaker.",
        completedAt: new Date().toISOString(),
      });
    }
    return { data: null, error };
  }
}

async function notifySalesOfferAcceptance(client, token) {
  const publicOfferToken = String(token || "").trim();
  if (!client?.functions?.invoke || !publicOfferToken) return { data: null, error: null };
  return client.functions.invoke(ACCEPTANCE_NOTIFY_FUNCTION, {
    body: { publicOfferToken },
  });
}

async function notifySalesOfferDecline(client, token) {
  const publicOfferToken = String(token || "").trim();
  if (!client?.functions?.invoke || !publicOfferToken) return { data: null, error: null };
  return client.functions.invoke(DECLINE_NOTIFY_FUNCTION, {
    body: { publicOfferToken },
  });
}

export async function getSalesOfferByToken(client, token) {
  const result = await core.getSalesOfferByToken(client, token);
  const offer = result?.data?.offer || {};
  if (!result?.error && (offer?.status === "declined" || offer?.declined_at || offer?.declined_payload)) {
    try {
      await notifySalesOfferDecline(client, token);
    } catch {
      // Avvisningen er allerede lagret. Varsling er sekundær og idempotent.
    }
  }
  return result;
}

export async function acceptSalesOffer(client, args = {}) {
  const result = await core.acceptSalesOffer(client, args);
  if (!result?.error) {
    try {
      await notifySalesOfferAcceptance(client, args?.token);
    } catch {
      // Aksepten er allerede lagret. Varsling er sekundær.
    }
  }
  return result;
}

export async function declineSalesOffer(client, { token, declinedName }) {
  if (!client?.rpc) {
    return { data: null, error: new Error("Supabase er ikke tilgjengelig.") };
  }
  const result = await client.rpc("decline_sales_offer", {
    token,
    declined_name: String(declinedName || "").trim(),
  });
  if (!result?.error) {
    try {
      await notifySalesOfferDecline(client, token);
    } catch {
      // Avvisningen er allerede lagret. Varsling er sekundær.
    }
  }
  return result;
}

export async function setSalesRequestArchivedAt(
  client,
  { companyId = "", requestRef = "", archivedAt = null } = {}
) {
  const safeCompanyId = String(companyId || "").trim();
  const safeRequestRef = String(requestRef || "").trim();
  if (!client || !safeCompanyId || !safeRequestRef) {
    return { data: null, error: new Error("Salgssaken kunne ikke identifiseres for arkivering.") };
  }
  return client
    .from("sales_requests")
    .update({ archived_at: archivedAt || null })
    .eq("company_id", safeCompanyId)
    .eq("request_ref", safeRequestRef)
    .select("request_ref,archived_at")
    .maybeSingle();
}

export async function upsertSalesRequests(client, rows) {
  const safeRows = (Array.isArray(rows) ? rows : [])
    .filter((row) => !row?.payload?.__summaryOnly)
    .map((row) => ({
      ...row,
      payload: stripRuntimeTraceability(row?.payload || {}),
    }));

  if (!safeRows.length) return { data: [], error: null };

  const result = await core.upsertSalesRequests(client, safeRows);
  if (!result?.error) {
    await rememberOfferContentSignatures(client, safeRows);
    const companyIds = [
      ...new Set(safeRows.map((row) => String(row?.company_id || "").trim()).filter(Boolean)),
    ];
    for (const companyId of companyIds) {
      const companyRows = safeRows.filter((row) => String(row?.company_id || "").trim() === companyId);
      const hydratedRows = await hydrateCreatorTraceability(client, companyId, companyRows);
      announceCreatorTraceability(hydratedRows);
    }
  }
  return result;
}
