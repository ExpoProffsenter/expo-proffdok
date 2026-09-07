// Expo ProffDok – FASE 37A2 / FASE 37A1 / FASE 34B / FASE 32 / FASE 32A / FASE 30C2
// FASE 37A2 speiler serverens idempotente automatiske oppfølgingslogg inn som
// runtime-metadata i Sales. Feltene skrives aldri tilbake i sales_requests.payload.
// Når automatisk påminnelse er nyere enn siste manuelle utsending, brukes den som
// runtime-kontakttid slik at "Må følges opp" først kommer tilbake etter nye 7 dager.
// FASE 37A1 speiler eksisterende sales_requests.archived_at inn i runtime-payload
// slik at Sales-oversikten kan filtrere/arkivere uten ny SQL/RLS/migrasjon.
// Arkivering oppdaterer kun archived_at på eksisterende salgssak.
// FASE 34B sender serverstyrte, idempotente akseptvarsler til kunden og
// brukeren som publiserte den eksakte tilbudsversjonen kunden aksepterte.
// Varsling forsøkes kun som direkte følge av en ny digital aksept; åpning av
// historiske aksepterte tilbud utløser aldri e-post. Selve aksept-RPC-en beholdes
// uendret, og e-postfeil kan aldri reversere aksepten.
// FASE 32 deler én standard Supabase-klient i hele Sales-modulen. Det hindrer
// flere GoTrue/auth-klienter med samme browser-storage og lar bilde-/Storage-laget
// bruke samme innloggede session som resten av Sales.
// FASE 32A henter serverstemplet creator-snapshot for nye salgssaker uten å
// blande Opprettet av med ansvarlig. Sporbarhetsfeltene er kun runtime-metadata
// og skrives ikke tilbake i sales_requests.payload.
// Tynn wrapper rundt eksisterende Supabase-service.
// Legger et innholdsbasert fingeravtrykk på bekreftet serverbaseline slik at
// samme tilbud ikke utløser recovery bare fordi lokal savedAt er nyere.

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
  "offerOriginalEmailSentAt",
  "offerAutoFollowUpSentAt",
  "offerAutoFollowUpVersionId",
  "offerAutoFollowUpVersionNumber",
  "offerAutoFollowUpSourceSentAt",
];
const ACCEPTANCE_NOTIFY_FUNCTION = "sales-offer-acceptance-notify";

let sharedDefaultSalesSupabaseClient;

export function createDefaultSalesSupabaseClient() {
  if (sharedDefaultSalesSupabaseClient === undefined) {
    sharedDefaultSalesSupabaseClient = core.createDefaultSalesSupabaseClient();
  }
  return sharedDefaultSalesSupabaseClient;
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

  // hydrateOfferFollowUpState kan midlertidig gjøre offerEmailSentAt til siste
  // kontakt (automatisk påminnelse) for visning/7-dagersklokke. Ved lagring må
  // alltid den ekte, opprinnelige manuelle e-posttiden tilbake i payload.
  if (Object.prototype.hasOwnProperty.call(clean, "offerOriginalEmailSentAt")) {
    clean.offerEmailSentAt = clean.offerOriginalEmailSentAt || "";
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
  if (!client || !companyId || !Array.isArray(rows) || rows.length === 0) {
    return rows;
  }

  const { data: notificationRows, error } = await client
    .from("sales_offer_follow_up_notifications")
    .select("request_ref,offer_version_id,status,sent_at,source_email_sent_at")
    .eq("company_id", companyId)
    .eq("status", "sent")
    .order("sent_at", { ascending: false });

  // 37A2 kan rulles tilbake uavhengig av UI. Manglende tabell/tilgang skal aldri
  // stoppe lasting av Sales-saker.
  if (error || !Array.isArray(notificationRows) || notificationRows.length === 0) {
    return rows;
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
    });
  });

  return rows.map((row) => {
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
    const originalEmailSentAt = payload.offerEmailSentAt || "";
    const autoSentAtMs = validDateMs(state.sentAt);
    const originalSentAtMs = validDateMs(originalEmailSentAt);
    const autoIsLatestContact =
      autoVersionMatches &&
      autoSentAtMs > 0 &&
      autoSentAtMs >= originalSentAtMs;

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
      },
    };
  });
}

function announceCreatorTraceability(rows = []) {
  if (typeof window === "undefined") return;

  if (!window.__expoProffDokSalesTraceability) {
    window.__expoProffDokSalesTraceability = {};
  }

  (Array.isArray(rows) ? rows : []).forEach((row) => {
    const payload = row?.payload || {};
    const creatorName = String(payload.__createdByName || "").trim();
    if (!creatorName || !row?.request_ref) return;

    const detail = {
      requestRef: String(row.request_ref),
      createdByUserId: String(payload.__createdByUserId || ""),
      createdByName: creatorName,
      createdAt: payload.__createdAt || "",
    };

    window.__expoProffDokSalesTraceability[detail.requestRef] = detail;
    window.dispatchEvent(
      new CustomEvent("expo-proffdok-sales-traceability", { detail })
    );
  });
}

async function hydrateCreatorTraceability(client, companyId, rows = []) {
  if (!client || !companyId || !Array.isArray(rows) || rows.length === 0) {
    return rows;
  }

  const { data: traceRows, error } = await client
    .from("sales_requests")
    .select("request_ref,created_by,created_by_name,created_at")
    .eq("company_id", companyId);

  if (error || !Array.isArray(traceRows)) return rows;

  const traceByRef = new Map(
    traceRows.map((row) => [String(row.request_ref || ""), row])
  );

  return rows.map((row) => {
    const trace = traceByRef.get(String(row?.request_ref || ""));
    const creatorName = String(trace?.created_by_name || "").trim();

    // Gamle saker backfilles ikke. Uten serverstemplet navn vises heller ingen
    // kunstig creator basert på ansvarlig eller andre mutable felt.
    if (!creatorName) return row;

    return {
      ...row,
      payload: {
        ...(row?.payload || {}),
        __createdByUserId: String(trace?.created_by || ""),
        __createdByName: creatorName,
        __createdAt: trace?.created_at || "",
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
    const companyId = String(row?.company_id || fallbackCompanyId || "").trim();
    const requestRef = String(row?.request_ref || "").trim();
    if (!companyId || !requestRef) continue;

    const payload = row?.payload || {};
    const offerDraftSignature = createOfferDraftContentSignature(
      buildOfferFormForSignatureFromRequest(payload)
    );
    if (!offerDraftSignature) continue;

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
          observedAt: previous.observedAt || observedAt,
        })
      );
    } catch {
      // Fingeravtrykket er kun et ekstra sikkerhetsnett.
    }
  }
}

async function notifySalesOfferAcceptance(client, token) {
  const publicOfferToken = String(token || "").trim();
  if (!client?.functions?.invoke || !publicOfferToken) {
    return { data: null, error: null };
  }

  return client.functions.invoke(ACCEPTANCE_NOTIFY_FUNCTION, {
    body: { publicOfferToken },
  });
}

export async function acceptSalesOffer(client, args = {}) {
  const result = await core.acceptSalesOffer(client, args);

  // Aksept er autoritativ og ferdig før e-post forsøkes. Varslingsfeil skal aldri
  // gi kunden inntrykk av at aksepten feilet eller prøve å skrive aksepten om igjen.
  if (!result?.error) {
    try {
      await notifySalesOfferAcceptance(client, args?.token);
    } catch {
      // Aksepten er allerede lagret. Varsling er sekundær og påvirker ikke aksepten.
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
    return {
      data: null,
      error: new Error("Salgssaken kunne ikke identifiseres for arkivering."),
    };
  }

  return client
    .from("sales_requests")
    .update({ archived_at: archivedAt || null })
    .eq("company_id", safeCompanyId)
    .eq("request_ref", safeRequestRef)
    .select("request_ref,archived_at")
    .maybeSingle();
}

export async function fetchSalesRequests(client, companyId) {
  const result = await core.fetchSalesRequests(client, companyId);
  if (!result?.error) {
    const archiveHydratedRows = hydrateArchiveState(result?.data || []);
    const followUpHydratedRows = await hydrateOfferFollowUpState(
      client,
      companyId,
      archiveHydratedRows
    );
    const hydratedRows = await hydrateCreatorTraceability(
      client,
      companyId,
      followUpHydratedRows
    );
    result.data = hydratedRows;
    announceCreatorTraceability(hydratedRows);
    await rememberOfferContentSignatures(client, hydratedRows, companyId);
  }
  return result;
}

export async function upsertSalesRequests(client, rows) {
  const safeRows = (Array.isArray(rows) ? rows : []).map((row) => ({
    ...row,
    payload: stripRuntimeTraceability(row?.payload || {}),
  }));
  const result = await core.upsertSalesRequests(client, safeRows);
  if (!result?.error) {
    await rememberOfferContentSignatures(client, safeRows || []);

    const companyIds = [
      ...new Set(
        safeRows.map((row) => String(row?.company_id || "").trim()).filter(Boolean)
      ),
    ];
    for (const companyId of companyIds) {
      const companyRows = safeRows.filter(
        (row) => String(row?.company_id || "").trim() === companyId
      );
      const hydratedRows = await hydrateCreatorTraceability(
        client,
        companyId,
        companyRows
      );
      announceCreatorTraceability(hydratedRows);
    }
  }
  return result;
}
