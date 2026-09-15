// Expo ProffDok – FASE 42I / FASE 30C2
// FASE 42I holder firmascopet sakslist-cache liten. Komplett tilbud/bilder skal aldri
// serialiseres som hel saksoversikt i localStorage; tilbudskladd og inspeksjonskladd
// har egne recovery-lagre. Preview beholder eksisterende full lokal lagring.

export * from "./salesLocalStorageBase.js";

import * as base from "./salesLocalStorageBase.js";
import { STORAGE_KEY } from "../constants/salesConstants.js";
import { createOfferDraftContentSignature } from "../utils/salesOfferDraftSignature.js";

const OFFER_SERVER_BASELINE_PREFIX = `${STORAGE_KEY}:offer-server-baseline`;

function storage() {
  return typeof window !== "undefined" && window.localStorage
    ? window.localStorage
    : null;
}

function parseJson(store, key) {
  try {
    const raw = store?.getItem?.(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function currentUserId(store) {
  if (!store) return "";
  try {
    for (let index = 0; index < store.length; index += 1) {
      const key = store.key(index);
      if (!key?.startsWith("sb-") || !key.includes("-auth-token")) continue;
      const parsed = parseJson(store, key);
      const id = String(
        parsed?.user?.id ||
          parsed?.currentSession?.user?.id ||
          parsed?.session?.user?.id ||
          ""
      ).trim();
      if (id) return id;
    }
  } catch {
    return "";
  }
  return "";
}

function latestBaseline(requestId) {
  const store = storage();
  if (!store || !requestId) return null;
  const suffix = `:${requestId}`;
  const userId = currentUserId(store);
  const candidates = [];

  for (let index = 0; index < store.length; index += 1) {
    const key = store.key(index);
    if (!key?.startsWith(OFFER_SERVER_BASELINE_PREFIX) || !key.endsWith(suffix)) continue;
    const baseline = parseJson(store, key);
    if (!baseline) continue;
    if (userId && baseline.userId && String(baseline.userId) !== userId) continue;
    const observedAt = Date.parse(baseline.observedAt || "") || 0;
    candidates.push({ ...baseline, observedAt });
  }

  return candidates.sort((a, b) => b.observedAt - a.observedAt)[0] || null;
}

function requestIdFromInput(input = {}) {
  return typeof input === "string"
    ? input
    : String(input?.requestId || "");
}

function suppressEquivalentServerConflict(requestId = "") {
  const pending = base.getPendingOfferDraftRecovery(requestId);
  if (!pending || pending.type !== "server") return pending;

  const store = storage();
  const localRecord = parseJson(store, pending.localKey);
  const baseline = latestBaseline(requestId);
  const serverSignature = String(baseline?.offerDraftSignature || "");
  const localSignature = localRecord?.form
    ? createOfferDraftContentSignature(localRecord.form)
    : "";

  if (!serverSignature || !localSignature || serverSignature !== localSignature) {
    return pending;
  }

  base.resolvePendingOfferDraftRecovery(requestId, "server");
  return null;
}

function compactRequestForAppListCache(request = {}) {
  const keys = [
    "id",
    "title",
    "customer",
    "phone",
    "email",
    "address",
    "postnr",
    "city",
    "source",
    "note",
    "responsible",
    "surveyResponsible",
    "projectResponsible",
    "surveyDate",
    "surveyTime",
    "surveyNote",
    "surveyConfirmationSentAt",
    "surveyConfirmationSentTo",
    "projectId",
    "projectName",
    "directOffer",
    "offerTitle",
    "offerEmailSentAt",
    "offerOriginalEmailSentAt",
    "offerEmailVersionNumber",
    "sentOfferVersionNumber",
    "offerAutoFollowUpSentAt",
    "offerAutoFollowUpVersionId",
    "offerAutoFollowUpVersionNumber",
    "offerAutoFollowUpSourceSentAt",
    "offerAutoFollowUpReminderNumber",
    "storeOfferMeta",
    "offerRevisionDraftFromVersion",
    "status",
    "statusClass",
    "nextStep",
    "iconName",
    "acceptedAt",
    "declinedAt",
    "archivedAt",
    "__createdByUserId",
    "__createdByName",
    "__createdAt",
    "__searchText",
  ];
  const compact = {};
  keys.forEach((key) => {
    if (request[key] !== undefined) compact[key] = request[key];
  });
  compact.__summaryOnly = true;
  return compact;
}

export function saveRequests(requests, storageKey = STORAGE_KEY) {
  if (storageKey === STORAGE_KEY) {
    return base.saveRequests(requests, storageKey);
  }

  const compact = (Array.isArray(requests) ? requests : []).map(
    compactRequestForAppListCache
  );
  return base.saveRequests(compact, storageKey);
}

export function loadOfferDraft(input = {}) {
  const requestId = requestIdFromInput(input);
  const loaded = base.loadOfferDraft(input);
  suppressEquivalentServerConflict(requestId);
  return loaded;
}

export function getPendingOfferDraftRecovery(requestId = "") {
  return suppressEquivalentServerConflict(requestId);
}

export function hasPendingOfferDraftRecovery(requestId = "") {
  return Boolean(getPendingOfferDraftRecovery(requestId));
}
