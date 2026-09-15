// Expo ProffDok – FASE 42J / FASE 42I / FASE 30C2
// FASE 42J bevarer også ulagret Ny forespørsel / Nytt tilbud / Rediger forespørsel
// ved PC-fanebytte og mobil appbytte (f.eks. SMS) uten å opprette en Sales-sak
// før brukeren selv lagrer.
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
const RECOVERABLE_ENTRY_MODES = new Set(["new", "new-offer", "edit-request"]);
const REQUEST_ID_OPTIONAL_ENTRY_MODES = new Set(["new", "new-offer"]);
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

function hasMeaningfulInspectionDraft(formValue = {}) {
  return Boolean(
    String(formValue?.customerWishes || "").trim() ||
      String(formValue?.existingConditions || "").trim() ||
      String(formValue?.measurements || "").trim() ||
      String(formValue?.observations || "").trim() ||
      (Array.isArray(formValue?.photos) && formValue.photos.length > 0)
  );
}

function currentSupportCompanyScope() {
  if (typeof window === "undefined") return "";
  try {
    return String(
      new URLSearchParams(window.location.search).get("salesSupportCompany") || ""
    ).trim();
  } catch {
    return "";
  }
}

function inspectionRequestIdFromDraftKey(draftKey = "") {
  const normalized = String(draftKey || "").trim();
  const marker = ":inspection-draft:";
  const markerIndex = normalized.lastIndexOf(marker);
  return markerIndex >= 0
    ? normalized.slice(markerIndex + marker.length).trim()
    : "";
}

function collectInspectionDraftKeys(draftKey = "") {
  const store = storage();
  if (!store) return [];

  const normalizedDraftKey = String(draftKey || "").trim();
  const requestId = inspectionRequestIdFromDraftKey(normalizedDraftKey);
  const suffix = requestId ? `:inspection-draft:${requestId}` : "";
  const userId = currentUserId(store);
  const supportScope = currentSupportCompanyScope();
  const keys = normalizedDraftKey ? [normalizedDraftKey] : [];

  if (!suffix) return [...new Set(keys)];

  for (let index = 0; index < store.length; index += 1) {
    const key = store.key(index);
    if (!key?.startsWith(STORAGE_KEY) || !key.endsWith(suffix)) continue;
    if (userId && !key.includes(`:${userId}`)) continue;

    if (supportScope) {
      if (!key.includes(`:support:${supportScope}:`)) continue;
    } else if (key.includes(":support:")) {
      continue;
    }

    keys.push(key);
  }

  return [...new Set(keys)];
}

function latestMeaningfulInspectionDraft(draftKey = "") {
  return (
    collectInspectionDraftKeys(draftKey)
      .map((key) => {
        const record = base.loadInspectionDraft(key);
        if (!record?.form || !hasMeaningfulInspectionDraft(record.form)) {
          return null;
        }
        return {
          key,
          record,
          savedAt: Date.parse(record.savedAt || "") || 0,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.savedAt - a.savedAt)[0] || null
  );
}

export function loadInspectionDraft(draftKey) {
  return latestMeaningfulInspectionDraft(draftKey)?.record || null;
}

export function saveInspectionDraft(draftKey, formValue = {}) {
  const existing = latestMeaningfulInspectionDraft(draftKey)?.record || null;
  if (
    existing?.form &&
    hasMeaningfulInspectionDraft(existing.form) &&
    !hasMeaningfulInspectionDraft(formValue)
  ) {
    return false;
  }
  base.saveInspectionDraft(draftKey, formValue);
  return true;
}

export function clearInspectionDraft(draftKey) {
  collectInspectionDraftKeys(draftKey).forEach((key) => {
    base.clearInspectionDraft(key);
  });
}

export function normalizeSalesNavigationRecord(value = null) {
  if (!value || typeof value !== "object") return null;
  const mode = String(value.mode || "").trim();
  const selectedRequestId = String(value.selectedRequestId || "").trim();

  if (REQUEST_ID_OPTIONAL_ENTRY_MODES.has(mode)) {
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

function activeEntryNavigation(store) {
  if (!store || !activeSalesStorageKey) return null;
  return normalizeSalesNavigationRecord(
    parseJson(store, `${activeSalesStorageKey}:navigation`)
  );
}

function entryDraftKey(storageKey, mode, requestId = "") {
  return `${storageKey}${ENTRY_DRAFT_SUFFIX}:${mode}${
    requestId ? `:${requestId}` : ""
  }`;
}

function entryContext(mode) {
  const store = storage();
  const navigation = activeEntryNavigation(store);
  if (!store || !activeSalesStorageKey || !navigation) return null;
  if (navigation.mode !== mode) return null;

  const requestId = String(navigation.selectedRequestId || "").trim();
  if (mode === "edit-request" && !requestId) return null;
  return { store, navigation, requestId };
}

function entryResumeIsArmed(mode) {
  const context = entryContext(mode);
  if (!context || !RECOVERABLE_ENTRY_MODES.has(mode)) return false;

  const snapshot = readSalesWorkspaceResumeSnapshot({ localStorage: context.store });
  if (!snapshot || snapshot.storageKey !== activeSalesStorageKey) return false;

  return Boolean(
    snapshot.navigation?.mode === mode &&
      String(snapshot.navigation?.selectedRequestId || "") === context.requestId
  );
}

export function saveSalesEntryDraft(mode, formValue = {}) {
  const normalizedMode = String(mode || "").trim();
  const context = entryContext(normalizedMode);
  if (!context || !RECOVERABLE_ENTRY_MODES.has(normalizedMode)) return false;

  try {
    context.store.setItem(
      entryDraftKey(activeSalesStorageKey, normalizedMode, context.requestId),
      JSON.stringify({
        mode: normalizedMode,
        requestId: context.requestId,
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
  if (!entryResumeIsArmed(normalizedMode)) return null;

  const context = entryContext(normalizedMode);
  if (!context) return null;

  const key = entryDraftKey(
    activeSalesStorageKey,
    normalizedMode,
    context.requestId
  );
  const record = parseJson(context.store, key);
  if (!record?.form || record.mode !== normalizedMode) return null;

  const savedAt = Date.parse(record.savedAt || "") || 0;
  if (
    !savedAt ||
    Date.now() - savedAt < 0 ||
    Date.now() - savedAt > SALES_BACKGROUND_RESUME_MAX_AGE_MS
  ) {
    try {
      context.store.removeItem(key);
    } catch {
      // Utløpt kladd er kun lokal UX-state.
    }
    return null;
  }

  return record;
}

export function clearSalesEntryDraft(mode) {
  const normalizedMode = String(mode || "").trim();
  const context = entryContext(normalizedMode);
  if (!context || !RECOVERABLE_ENTRY_MODES.has(normalizedMode)) return;
  try {
    context.store.removeItem(
      entryDraftKey(activeSalesStorageKey, normalizedMode, context.requestId)
    );
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
