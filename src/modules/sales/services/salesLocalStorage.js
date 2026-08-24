// Expo ProffDok – FASE 30C3 / FASE 30C2
// Sikkerhets-wrapper rundt lokal tilbudslagring.
// Beholder komplett revisjonshistorikk for reelle tilbudsendringer, fjerner kun
// strukturelt tomme rader og lar recovery prioritere siste faktiske offline-versjon.
// FASE 30C3 blokkerer lagring fra en ny SalesModule-cycle til aktuell tilbudssak
// faktisk er lest inn. Dette hindrer at tom initialform blir «siste kladd» ved remount.

export * from "./salesLocalStorageCore.js";

import { STORAGE_KEY } from "../constants/salesConstants.js";
import * as core from "./salesLocalStorageCore.js";

const AUDIT_LIMIT = 20;
const AUDIT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const AUDIT_TRANSITION_MS = 1800;
const AUDIT_SUFFIX = ":audit-v2";
const AUDIT_DECISION_SUFFIX = ":audit-decision-v2";
const AUDIT_TRANSITION_SUFFIX = ":audit-transition-v2";
const SERVER_BASELINE_PREFIX = `${STORAGE_KEY}:offer-server-baseline`;

let offerDraftHydrationCycle = 0;
const hydratedOfferDraftRequests = new Map();

export function beginOfferDraftHydrationCycle() {
  offerDraftHydrationCycle += 1;
  hydratedOfferDraftRequests.clear();
  return offerDraftHydrationCycle;
}

function markOfferDraftHydrated(requestId = "", cycle = offerDraftHydrationCycle) {
  const normalized = String(requestId || "").trim();
  if (!normalized || cycle !== offerDraftHydrationCycle) return false;
  hydratedOfferDraftRequests.set(normalized, cycle);
  return true;
}

function scheduleOfferDraftHydrated(requestId = "") {
  const normalized = String(requestId || "").trim();
  if (!normalized) return;
  const cycle = offerDraftHydrationCycle;
  window.setTimeout(() => {
    markOfferDraftHydrated(normalized, cycle);
  }, 0);
}

export function isOfferDraftHydratedForCurrentCycle(requestId = "") {
  const normalized = String(requestId || "").trim();
  return Boolean(
    normalized && hydratedOfferDraftRequests.get(normalized) === offerDraftHydrationCycle
  );
}

function storage() {
  return typeof window !== "undefined" ? window.localStorage : null;
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

function isOfferDraftKeyForRequest(key, requestId) {
  if (!key) return false;
  const requestSuffix = `:${requestId}`;
  const hasOfferDraftSegment = key.includes(":offer-draft:");
  return hasOfferDraftSegment && key.endsWith(requestSuffix);
}

function stableKeyForRequest(requestId) {
  const store = storage();
  const userId = currentUserId(store);
  if (!requestId || !store) return "";
  if (userId) return core.buildStableOfferDraftKey({ userId, requestId });

  // Bakoverkompatibel fallback dersom auth-token midlertidig ikke kan leses.
  for (let index = 0; index < store.length; index += 1) {
    const key = store.key(index);
    if (isOfferDraftKeyForRequest(key, requestId)) return key;
  }
  return "";
}

function attachmentHasContent(file) {
  return Boolean(String(file?.url || file?.path || file?.name || "").trim());
}

function lineHasUserContent(line = {}) {
  if (line.lineType === "administration") {
    return Boolean(
      String(line.adminPercent ?? "").trim() ||
        String(line.amount ?? "").trim() ||
        String(line.internalProductNumber || "").trim() ||
        String(line.productUrl || "").trim() ||
        line.imageDataUrl ||
        attachmentHasContent(line.attachmentFile)
    );
  }

  return Boolean(
    String(line.description || "").trim() ||
      String(line.amount ?? "").trim() ||
      String(line.internalProductNumber || "").trim() ||
      String(line.productUrl || "").trim() ||
      line.imageDataUrl ||
      attachmentHasContent(line.attachmentFile)
  );
}

function optionHasUserContent(option = {}) {
  return Boolean(
    String(option.title || "").trim() ||
      String(option.description || "").trim() ||
      String(option.amount ?? "").trim() ||
      String(option.internalProductNumber || "").trim() ||
      String(option.productUrl || "").trim() ||
      option.imageDataUrl ||
      attachmentHasContent(option.attachmentFile)
  );
}

export function pruneEmptyOfferDraftRows(formValue = {}) {
  return {
    ...formValue,
    lines: (Array.isArray(formValue.lines) ? formValue.lines : []).filter(lineHasUserContent),
    options: (Array.isArray(formValue.options) ? formValue.options : []).filter(optionHasUserContent),
  };
}

function compactForAudit(formValue = {}) {
  const compactAttachment = (file) =>
    file
      ? {
          id: file.id || "",
          name: file.name || "",
          path: file.path || "",
          url: file.url || "",
          type: file.type || "",
          size: Number(file.size || 0),
        }
      : null;

  const clean = pruneEmptyOfferDraftRows(formValue);
  return {
    ...clean,
    lines: (clean.lines || []).map(({ imageDataUrl, ...line }) => ({
      ...line,
      imageDataUrl: "",
      attachmentFile: compactAttachment(line.attachmentFile),
    })),
    options: (clean.options || []).map(({ imageDataUrl, ...option }) => ({
      ...option,
      imageDataUrl: "",
      attachmentFile: compactAttachment(option.attachmentFile),
    })),
  };
}

function metrics(formValue = {}) {
  const clean = pruneEmptyOfferDraftRows(formValue);
  let size = 0;
  try {
    size = JSON.stringify(compactForAudit(clean)).length;
  } catch {
    size = 0;
  }
  return {
    lines: (clean.lines || []).length,
    options: (clean.options || []).length,
    size,
  };
}

function isMoreComplete(candidate, current) {
  const a = metrics(candidate);
  const b = metrics(current || {});
  return Boolean(
    a.lines > b.lines ||
      a.options > b.options ||
      (a.lines === b.lines && a.options === b.options && a.size > b.size * 1.08)
  );
}

function auditKey(stableKey) {
  return `${stableKey}${AUDIT_SUFFIX}`;
}

function auditDecisionKey(stableKey, candidateSavedAt, liveSavedAt) {
  return `${stableKey}${AUDIT_DECISION_SUFFIX}:${candidateSavedAt}:${liveSavedAt}`;
}

function auditTransitionKey(stableKey) {
  return `${stableKey}${AUDIT_TRANSITION_SUFFIX}`;
}

function hasMeaningfulKnownOfferDraft(requestId, stableKey) {
  const store = storage();
  if (!store || !requestId) return false;

  const live = stableKey ? parseJson(store, stableKey) : null;
  const liveMetrics = metrics(live?.form || {});
  if (liveMetrics.lines > 0 || liveMetrics.options > 0) return true;

  const historyRaw = stableKey ? parseJson(store, auditKey(stableKey)) : null;
  const history = Array.isArray(historyRaw) ? historyRaw : [];
  if (
    history.some((record) => {
      const recordMetrics = metrics(record?.form || {});
      return recordMetrics.lines > 0 || recordMetrics.options > 0;
    })
  ) {
    return true;
  }

  const suffix = `:${requestId}`;
  for (let index = 0; index < store.length; index += 1) {
    const key = store.key(index);
    if (!key?.startsWith(SERVER_BASELINE_PREFIX) || !key.endsWith(suffix)) continue;
    const baseline = parseJson(store, key);
    if (
      Number(baseline?.meaningfulLines || 0) > 0 ||
      Number(baseline?.meaningfulOptions || 0) > 0
    ) {
      return true;
    }
  }

  return false;
}

function appendAuditSnapshot(stableKey, formValue) {
  const store = storage();
  if (!store || !stableKey) return;

  const form = compactForAudit(formValue);
  const historyRaw = parseJson(store, auditKey(stableKey));
  const history = Array.isArray(historyRaw) ? historyRaw : [];
  const last = history[history.length - 1] || null;

  let same = false;
  try {
    same = Boolean(last?.form) && JSON.stringify(last.form) === JSON.stringify(form);
  } catch {
    same = false;
  }
  if (same) return;

  const next = [
    ...history,
    { form, savedAt: new Date().toISOString(), reason: "edit" },
  ].slice(-AUDIT_LIMIT);

  try {
    store.setItem(auditKey(stableKey), JSON.stringify(next));
  } catch {
    // Core-lagringen fortsetter selv om revisjonshistorikken ikke får plass.
  }
}

function latestServerSavedAt(requestId) {
  const store = storage();
  if (!store || !requestId) return 0;
  const suffix = `:${requestId}`;
  let latest = 0;

  for (let index = 0; index < store.length; index += 1) {
    const key = store.key(index);
    if (!key?.startsWith(SERVER_BASELINE_PREFIX) || !key.endsWith(suffix)) continue;
    const baseline = parseJson(store, key);
    const savedAt = Date.parse(
      baseline?.offerDraftSavedAt || baseline?.serverSavedAt || ""
    ) || 0;
    latest = Math.max(latest, savedAt);
  }
  return latest;
}

function activeAuditTransition(requestId) {
  const store = storage();
  const stableKey = stableKeyForRequest(requestId);
  if (!store || !stableKey) return null;
  const transition = parseJson(store, auditTransitionKey(stableKey));
  if (!transition) return null;
  const expiresAt = Date.parse(transition.expiresAt || "") || 0;
  if (expiresAt <= Date.now()) {
    store.removeItem(auditTransitionKey(stableKey));
    return null;
  }
  return transition;
}

function installAuditTransition(stableKey, requestId) {
  const store = storage();
  if (!store || !stableKey) return;
  const now = Date.now();
  store.setItem(
    auditTransitionKey(stableKey),
    JSON.stringify({
      type: "transition",
      requestId,
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(now + AUDIT_TRANSITION_MS).toISOString(),
    })
  );
}

function preferredAuditRecovery(requestId) {
  const store = storage();
  const stableKey = stableKeyForRequest(requestId);
  if (!store || !stableKey || !requestId) return null;

  const live = parseJson(store, stableKey);
  if (!live?.form) return null;

  const liveSavedAt = Date.parse(live.savedAt || "") || 0;
  const serverSavedAt = latestServerSavedAt(requestId);
  const historyRaw = parseJson(store, auditKey(stableKey));
  const history = Array.isArray(historyRaw) ? historyRaw : [];
  const now = Date.now();

  const candidate = history
    .map((record) => ({ ...record, savedAtMs: Date.parse(record?.savedAt || "") || 0 }))
    .filter(
      (record) =>
        record?.form &&
        record.savedAtMs &&
        now - record.savedAtMs <= AUDIT_MAX_AGE_MS &&
        record.savedAtMs > serverSavedAt &&
        isMoreComplete(record.form, live.form)
    )
    .sort((a, b) => b.savedAtMs - a.savedAtMs)[0];

  if (!candidate) return null;

  const decisionKey = auditDecisionKey(stableKey, candidate.savedAtMs, liveSavedAt);
  const decision = parseJson(store, decisionKey);
  if (decision?.choice) return null;

  const local = metrics(candidate.form);
  const current = metrics(live.form);

  return {
    type: "audit",
    decisionKey,
    liveKey: stableKey,
    recoveryKey: auditKey(stableKey),
    recoverySavedAt: candidate.savedAtMs,
    recoverySavedAtText: candidate.savedAt || "",
    liveSavedAt,
    liveSavedAtText: live.savedAt || "",
    localLines: local.lines,
    localOptions: local.options,
    serverLines: current.lines,
    serverOptions: current.options,
    auditCandidate: candidate,
  };
}

function mergeRecoveredMedia(recovered = {}, live = {}) {
  const liveLines = new Map((live.lines || []).map((line) => [String(line?.id || ""), line]));
  const liveOptions = new Map((live.options || []).map((option) => [String(option?.id || ""), option]));
  return {
    ...recovered,
    lines: (recovered.lines || []).map((line) => {
      const old = liveLines.get(String(line?.id || ""));
      return old
        ? { ...line, imageDataUrl: line.imageDataUrl || old.imageDataUrl || "", imageName: line.imageName || old.imageName || "", attachmentFile: line.attachmentFile || old.attachmentFile || null }
        : line;
    }),
    options: (recovered.options || []).map((option) => {
      const old = liveOptions.get(String(option?.id || ""));
      return old
        ? { ...option, imageDataUrl: option.imageDataUrl || old.imageDataUrl || "", imageName: option.imageName || old.imageName || "", attachmentFile: option.attachmentFile || old.attachmentFile || null }
        : option;
    }),
  };
}

export function saveOfferDraft(stableKey, formValue) {
  const requestId = String(stableKey || "").split(":").pop() || "";
  if (requestId && hasPendingOfferDraftRecovery(requestId)) return false;

  const clean = pruneEmptyOfferDraftRows(formValue);

  if (requestId && !isOfferDraftHydratedForCurrentCycle(requestId)) {
    if (hasMeaningfulKnownOfferDraft(requestId, stableKey)) {
      return false;
    }

    // Ny sak uten tidligere tilbud kan starte direkte i tilbudsbyggeren uten en
    // separat loadOfferDraft-runde. Når ingen tidligere meningsfull kladd finnes,
    // er første skriveforsøk derfor trygt å autorisere i denne cyclen.
    markOfferDraftHydrated(requestId);
  }

  appendAuditSnapshot(stableKey, clean);
  return core.saveOfferDraft(stableKey, clean);
}

export function loadOfferDraft(input = {}) {
  const requestId = typeof input === "string" ? input : String(input?.requestId || "");
  const transition = activeAuditTransition(requestId);
  if (transition) {
    const store = storage();
    const stableKey = stableKeyForRequest(requestId);
    const form = parseJson(store, stableKey)?.form || null;
    scheduleOfferDraftHydrated(requestId);
    return form;
  }

  const loaded = core.loadOfferDraft(input);
  const auditRecovery = preferredAuditRecovery(requestId);
  if (auditRecovery) {
    const store = storage();
    const form = parseJson(store, auditRecovery.liveKey)?.form || loaded;
    scheduleOfferDraftHydrated(requestId);
    return form;
  }

  scheduleOfferDraftHydrated(requestId);
  return loaded;
}

export function getPendingOfferDraftRecovery(requestId = "") {
  const transition = activeAuditTransition(requestId);
  if (transition) return transition;
  return preferredAuditRecovery(requestId) || core.getPendingOfferDraftRecovery(requestId);
}

export function hasPendingOfferDraftRecovery(requestId = "") {
  return Boolean(getPendingOfferDraftRecovery(requestId));
}

export function resolvePendingOfferDraftRecovery(requestId = "", choice = "") {
  if (!["local", "server"].includes(choice)) return false;

  const store = storage();
  const auditRecovery = preferredAuditRecovery(requestId);
  if (!store || !auditRecovery) {
    return core.resolvePendingOfferDraftRecovery(requestId, choice);
  }

  const corePending = core.getPendingOfferDraftRecovery(requestId);
  if (corePending) core.resolvePendingOfferDraftRecovery(requestId, "server");

  if (choice === "local") {
    const live = parseJson(store, auditRecovery.liveKey);
    const recovered = mergeRecoveredMedia(auditRecovery.auditCandidate.form, live?.form || {});
    const recoveredRecord = {
      form: pruneEmptyOfferDraftRows(recovered),
      savedAt: new Date().toISOString(),
    };
    store.setItem(auditRecovery.liveKey, JSON.stringify(recoveredRecord));
    appendAuditSnapshot(auditRecovery.liveKey, recoveredRecord.form);
  }

  store.setItem(
    auditRecovery.decisionKey,
    JSON.stringify({ choice, decidedAt: new Date().toISOString() })
  );
  installAuditTransition(auditRecovery.liveKey, requestId);
  return true;
}

export function clearOfferDraft(stableKey, scopedKey) {
  // Core rydder aktiv live-kladd og markerer bekreftet serverlagring.
  // Audit beholdes i opptil syv dager som et bevisst sikkerhetsnett.
  return core.clearOfferDraft(stableKey, scopedKey);
}
