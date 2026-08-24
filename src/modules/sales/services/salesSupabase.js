// Expo ProffDok – FASE 30C2
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

export async function fetchSalesRequests(client, companyId) {
  const result = await core.fetchSalesRequests(client, companyId);
  if (!result?.error) {
    await rememberOfferContentSignatures(client, result?.data || [], companyId);
  }
  return result;
}

export async function upsertSalesRequests(client, rows) {
  const result = await core.upsertSalesRequests(client, rows);
  if (!result?.error) {
    await rememberOfferContentSignatures(client, rows || []);
  }
  return result;
}
