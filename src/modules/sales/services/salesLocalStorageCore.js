// Expo ProffDok – FASE 42J / FASE 42I / FASE 30C2
// FASE 42J bevarer også en ulagret Ny forespørsel / Nytt tilbud ved mobil
// appbytte (f.eks. SMS) uten å opprette en Sales-sak før brukeren selv lagrer.
// FASE 42I holder firmascopet sakslist-cache liten. Komplett tilbud/bilder skal aldri
// serialiseres som hel saksoversikt i localStorage; tilbudskladd og inspeksjonskladd
// har egne recovery-lagre. Preview beholder eksisterende full lokal lagring.

export * from "./salesLocalStorageBase.js";

import * as base from "./salesLocalStorageBase.js";
import { STORAGE_KEY } from "../constants/salesConstants.js";
import { createOfferDraftContentSignature } from "../utils/salesOfferDraftSignature.js";
import {
  SALES_BACKGROUND_RESUME_MAX_AGE_MS,
  readSalesWorkspaceResumeSnapshot,
} from "./salesResumeRecovery.mjs";

const OFFER_SERVER_BASELINE_PREFIX = `${STORAGE_KEY}:offer-server-baseline`;
const ENTRY_DRAFT_SUFFIX = ":entry-draft-v1";
const RECOVERABLE_ENTRY_MODES = new Set(["new", "new-offer"]);
let activeSalesStorageKey = "";

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

export function normalizeSalesNavigationRecord(value = null) {
  if (!value || typeof value !== "object") return null;
  const mode = String(value.mode || "").trim();
  const selectedRequestId = String(value.selectedRequestId || "").trim();

  // Ny forespørsel / nytt direkte tilbud har med vilje ingen request_ref før
  // brukeren lagrer. De må likevel være gyldige arbeidsbilder ved SMS/appbytte.
  if (RECOVERABLE_ENTRY_MODES.has(mode)) {
    return { mode, selectedRequestId: null };
  }

  if (!selectedRequestId) return null;
  return {
    mode: mode || "detail",
    selectedRequestId,
  };
}

export function loadSalesNavigation(storageKey) {
  const normalizedStorageKey = String(storageKey || "").trim();
  if (normalizedStorageKey) activeSalesStorageKey = normalizedStorageKey;

  const store = storage();
  const parsed = normalizedStorageKey
    ? parseJson(store, `${normalizedStorageKey}:navigation`)
    : null;
  const normalized = normalizeSalesNavigationRecord(parsed);
  if (normalized) return normalized;

  return base.loadSalesNavigation(storageKey);
}

export function saveSalesNavigation(storageKey, mode, selectedRequestId) {
  const normalizedStorageKey = String(storageKey || "").trim();
  if (normalizedStorageKey) activeSalesStorageKey = normalizedStorageKey;
  return base.saveSalesNavigation(storageKey, mode, selectedRequestId);
}

function entryDraftKey(storageKey, mode) {
  return `${storageKey}${ENTRY_DRAFT_SUFFIX}:${mode}`;
}

function activeEntryNavigation(store) {
  if (!store || !activeSalesStorageKey) return null;
  return normalizeSalesNavigationRecord(
    parseJson(store, `${activeSalesStorageKey}:navigation`)
  );
}

function entryResumeIsArmed(store, mode) {
  if (!store || !activeSalesStorageKey || !RECOVERABLE_ENTRY_MODES.has(mode)) {
    return false;
  }

  const snapshot = readSalesWorkspaceResumeSnapshot({ localStorage: store });
  if (!snapshot || snapshot.storageKey !== activeSalesStorageKey) return false;

  const navigation = activeEntryNavigation(store);
  return Boolean(navigation?.mode === mode && !navigation?.selectedRequestId);
}

export function saveSalesEntryDraft(mode, formValue = {}) {
  const normalizedMode = String(mode || "").trim();
  const store = storage();
  if (!store || !activeSalesStorageKey || !RECOVERABLE_ENTRY_MODES.has(normalizedMode)) {
    return false;
  }

  try {
    store.setItem(
      entryDraftKey(activeSalesStorageKey, normalizedMode),
      JSON.stringify({
        mode: normalizedMode,
        form: formValue && typeof formValue === "object" ? formValue : {},
        savedAt: new Date().toISOString(),
      })
    );
    return true;
  } catch {
    return false;
  }
}

export function loadSalesEntryDraft(mode) {
  const normalizedMode = String(mode || "").trim();
  const store = storage();
  if (!entryResumeIsArmed(store, normalizedMode)) return null;

  const record = parseJson(
    store,
    entryDraftKey(activeSalesStorageKey, normalizedMode)
  );
  if (!record?.form || record.mode !== normalizedMode) return null;

  const savedAt = Date.parse(record.savedAt || "") || 0;
  if (
    !savedAt ||
    Date.now() - savedAt < 0 ||
    Date.now() - savedAt > SALES_BACKGROUND_RESUME_MAX_AGE_MS
  ) {
    try {
      store.removeItem(entryDraftKey(activeSalesStorageKey, normalizedMode));
    } catch {
      // Utløpt kladd er kun lokal UX-state.
    }
    return null;
  }

  return record;
}

export function clearSalesEntryDraft(mode) {
  const normalizedMode = String(mode || "").trim();
  const store = storage();
  if (!store || !activeSalesStorageKey || !RECOVERABLE_ENTRY_MODES.has(normalizedMode)) {
    return;
  }
  try {
    store.removeItem(entryDraftKey(activeSalesStorageKey, normalizedMode));
  } catch {
    // Lokal entry-kladd er kun UX-støtte.
  }
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
