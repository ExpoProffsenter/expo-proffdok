// Expo ProffDok – FASE 34B / FASE 32 / FASE 32A / FASE 30C2
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
const TRACEABILITY_PAYLOAD_KEYS = [
  "__createdByUserId",
  "__createdByName",
  "__createdAt",
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
  TRACEABILITY_PAYLOAD_KEYS.forEach((key) => delete clean[key]);
  return clean;
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

export async function fetchSalesRequests(client, companyId) {
  const result = await core.fetchSalesRequests(client, companyId);
  if (!result?.error) {
    const hydratedRows = await hydrateCreatorTraceability(
      client,
      companyId,
      result?.data || []
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
