// Expo ProffDok – FASE 30C2 / FASE 23C / FASE 29B3 / FASE 29B4
// Lokal nettleserlagring for Befaring / Tilbud / Aksept.
// FASE 30C2: robust tilbudsrecovery med rullerende sikkerhetskopier som ikke
// slettes ved normal serverlagring. Uavklart recovery lagres som en eksplisitt
// pending-tilstand og avgjøres kun av React-dialogen – aldri av browser-confirm.

import {
  STORAGE_KEY,
  initialRequests,
} from "../constants/salesConstants.js";

const OFFER_DRAFT_HISTORY_LIMIT = 10;
const OFFER_DRAFT_HISTORY_INTERVAL_MS = 60 * 1000;
const OFFER_DRAFT_RECOVERY_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const OFFER_DRAFT_CONFLICT_CLOCK_TOLERANCE_MS = 750;
const OFFER_SERVER_BASELINE_PREFIX = `${STORAGE_KEY}:offer-server-baseline`;
const OFFER_RECOVERY_PENDING_PREFIX = `${STORAGE_KEY}:offer-recovery-pending`;
const OFFER_RECOVERY_DECISION_PREFIX = `${STORAGE_KEY}:offer-recovery-decision`;

function getLocalStorage() {
  if (typeof window === "undefined" || !window.localStorage) return null;
  return window.localStorage;
}

function getSupportCompanyScope() {
  if (typeof window === "undefined") return "";
  try {
    return String(
      new URLSearchParams(window.location.search).get("salesSupportCompany") || ""
    ).trim();
  } catch {
    return "";
  }
}

function parseStoredJson(storage, key) {
  try {
    const value = storage?.getItem?.(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function getCurrentAuthUserId(storage) {
  if (!storage) return "";

  try {
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (!key?.startsWith("sb-") || !key.includes("-auth-token")) continue;

      const parsed = parseStoredJson(storage, key);
      const userId = String(
        parsed?.user?.id ||
          parsed?.currentSession?.user?.id ||
          parsed?.session?.user?.id ||
          ""
      ).trim();

      if (userId) return userId;
    }
  } catch {
    return "";
  }

  return "";
}

function compactOfferDraftForHistory(formValue = {}) {
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

  return {
    ...formValue,
    lines: (formValue.lines || []).map(({ imageDataUrl, ...line }) => ({
      ...line,
      imageDataUrl: "",
      attachmentFile: compactAttachment(line.attachmentFile),
    })),
    options: (formValue.options || []).map(({ imageDataUrl, ...option }) => ({
      ...option,
      imageDataUrl: "",
      attachmentFile: compactAttachment(option.attachmentFile),
    })),
  };
}

function getOfferDraftMetrics(formValue = {}) {
  const compact = compactOfferDraftForHistory(formValue);
  const meaningfulLines = (compact.lines || []).filter(
    (line) =>
      String(line?.description || "").trim() ||
      String(line?.amount ?? "").trim() ||
      String(line?.internalProductNumber || "").trim()
  ).length;
  const meaningfulOptions = (compact.options || []).filter(
    (option) =>
      String(option?.title || "").trim() ||
      String(option?.description || "").trim() ||
      String(option?.amount ?? "").trim()
  ).length;

  let size = 0;
  try {
    size = JSON.stringify(compact).length;
  } catch {
    size = 0;
  }

  return { meaningfulLines, meaningfulOptions, size };
}

function shouldForceOfferDraftSnapshot(previousForm, nextForm) {
  const previous = getOfferDraftMetrics(previousForm);
  const next = getOfferDraftMetrics(nextForm);

  return Boolean(
    next.meaningfulLines < previous.meaningfulLines ||
      next.meaningfulOptions < previous.meaningfulOptions ||
      (previous.size > 1000 && next.size < previous.size * 0.8)
  );
}

function isMoreCompleteOfferDraft(candidateForm, currentForm) {
  const candidate = getOfferDraftMetrics(candidateForm);
  const current = getOfferDraftMetrics(currentForm);

  return Boolean(
    candidate.meaningfulLines > current.meaningfulLines ||
      candidate.meaningfulOptions > current.meaningfulOptions ||
      (candidate.meaningfulLines === current.meaningfulLines &&
        candidate.meaningfulOptions === current.meaningfulOptions &&
        current.size > 1000 &&
        candidate.size > current.size * 1.2)
  );
}

function mergeRecoveredOfferDraftMedia(recoveredForm = {}, liveForm = {}) {
  const liveLines = new Map(
    (liveForm.lines || []).map((line) => [String(line?.id || ""), line])
  );
  const liveOptions = new Map(
    (liveForm.options || []).map((option) => [String(option?.id || ""), option])
  );

  return {
    ...recoveredForm,
    lines: (recoveredForm.lines || []).map((line) => {
      const live = liveLines.get(String(line?.id || ""));
      if (!live) return line;
      return {
        ...line,
        imageDataUrl: line.imageDataUrl || live.imageDataUrl || "",
        imageName: line.imageName || live.imageName || "",
        attachmentFile: line.attachmentFile || live.attachmentFile || null,
      };
    }),
    options: (recoveredForm.options || []).map((option) => {
      const live = liveOptions.get(String(option?.id || ""));
      if (!live) return option;
      return {
        ...option,
        imageDataUrl: option.imageDataUrl || live.imageDataUrl || "",
        imageName: option.imageName || live.imageName || "",
        attachmentFile: option.attachmentFile || live.attachmentFile || null,
      };
    }),
  };
}

function offerDraftHistoryKey(baseKey) {
  return `${baseKey}:history`;
}

function offerDraftServerSavedKey(baseKey) {
  return `${baseKey}:server-saved`;
}

function preserveOfferDraftSnapshot(
  storage,
  baseKey,
  record,
  { force = false, reason = "" } = {}
) {
  if (!storage || !baseKey || !record?.form) return;

  const historyKey = offerDraftHistoryKey(baseKey);
  const existing = parseStoredJson(storage, historyKey);
  const history = Array.isArray(existing) ? existing : [];
  const savedAt = record.savedAt || new Date().toISOString();
  const savedAtMs = Date.parse(savedAt) || Date.now();
  const last = history[history.length - 1] || null;
  const lastSavedAtMs = Date.parse(last?.savedAt || "") || 0;
  const snapshot = {
    form: compactOfferDraftForHistory(record.form),
    savedAt,
    ...(reason ? { reason } : {}),
  };

  let sameAsLast = false;
  try {
    sameAsLast =
      Boolean(last?.form) &&
      JSON.stringify(last.form) === JSON.stringify(snapshot.form);
  } catch {
    sameAsLast = false;
  }

  let nextHistory = history;

  if (!last) {
    nextHistory = [snapshot];
  } else if (sameAsLast) {
    nextHistory = [...history.slice(0, -1), snapshot];
  } else if (force || savedAtMs - lastSavedAtMs >= OFFER_DRAFT_HISTORY_INTERVAL_MS) {
    nextHistory = [...history, snapshot];
  } else {
    nextHistory = [...history.slice(0, -1), snapshot];
  }

  storage.setItem(
    historyKey,
    JSON.stringify(nextHistory.slice(-OFFER_DRAFT_HISTORY_LIMIT))
  );
}

function normalizeOfferDraftLoadInput(input = {}) {
  if (typeof input === "string") {
    return { requestId: input, stableKey: "", scopedKey: "" };
  }

  return {
    requestId: String(input?.requestId || ""),
    stableKey: String(input?.stableKey || ""),
    scopedKey: String(input?.scopedKey || ""),
  };
}

function collectOfferDraftCandidateKeys(storage, { requestId, stableKey, scopedKey }) {
  const candidateKeys = [stableKey, scopedKey].filter(Boolean);
  const requestSuffix = `:${requestId}`;
  const historySuffix = `${requestSuffix}:history`;
  const supportScope = getSupportCompanyScope();

  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (!key?.startsWith(STORAGE_KEY) || !key.includes(":offer-draft:")) continue;

    if (key.endsWith(historySuffix)) {
      candidateKeys.push(key.slice(0, -":history".length));
      continue;
    }

    if (key.endsWith(requestSuffix)) {
      candidateKeys.push(key);
    }
  }

  const unique = [...new Set(candidateKeys)];
  const currentUserId = getCurrentAuthUserId(storage);
  const currentUserKeys = currentUserId
    ? unique.filter((key) => key.includes(`:${currentUserId}`))
    : [];
  const userScoped = currentUserKeys.length ? currentUserKeys : unique;

  if (!supportScope) return userScoped;

  return userScoped.filter(
    (key) => !key.includes(":support:") || key.includes(`:support:${supportScope}:`)
  );
}

function collectOfferDraftHistoryCandidates(storage, candidateKeys) {
  return candidateKeys.flatMap((key) => {
    const history = parseStoredJson(storage, offerDraftHistoryKey(key));
    return Array.isArray(history)
      ? history
          .filter((record) => record?.form)
          .map((record) => ({
            form: record.form,
            savedAt: Date.parse(record.savedAt || "") || 0,
            savedAtText: record.savedAt || "",
            reason: record.reason || "",
            key,
          }))
      : [];
  });
}

function getLatestServerSavedAt(storage, candidateKeys) {
  return candidateKeys.reduce((latest, key) => {
    const marker = parseStoredJson(storage, offerDraftServerSavedKey(key));
    const time = Date.parse(marker?.savedAt || "") || 0;
    return Math.max(latest, time);
  }, 0);
}

function getConfirmedServerOfferBaseline(storage, requestId) {
  if (!storage || !requestId) return null;

  const currentUserId = getCurrentAuthUserId(storage);
  const supportScope = getSupportCompanyScope();
  const suffix = `:${requestId}`;
  const candidates = [];

  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (!key?.startsWith(OFFER_SERVER_BASELINE_PREFIX) || !key.endsWith(suffix)) {
      continue;
    }

    const baseline = parseStoredJson(storage, key);
    if (!baseline || String(baseline.requestRef || "") !== String(requestId)) continue;

    if (
      currentUserId &&
      baseline.userId &&
      String(baseline.userId) !== String(currentUserId)
    ) {
      continue;
    }

    if (
      supportScope &&
      String(baseline.companyId || "") !== String(supportScope)
    ) {
      continue;
    }

    const savedAt = Date.parse(
      baseline.offerDraftSavedAt || baseline.serverSavedAt || ""
    ) || 0;
    const observedAt = Date.parse(baseline.observedAt || "") || 0;

    if (!savedAt && !observedAt) continue;

    candidates.push({
      ...baseline,
      savedAt: savedAt || observedAt,
      observedAt,
      key,
    });
  }

  return candidates.sort((a, b) => b.observedAt - a.observedAt)[0] || null;
}

function recoveryScope(storage) {
  const userId = getCurrentAuthUserId(storage) || "anonymous";
  const supportScope = getSupportCompanyScope();
  return `${userId}${supportScope ? `:support:${supportScope}` : ""}`;
}

function pendingRecoveryKey(storage, requestId) {
  return `${OFFER_RECOVERY_PENDING_PREFIX}:${recoveryScope(storage)}:${requestId}`;
}

function decisionStorageKey(decisionKey) {
  return `${OFFER_RECOVERY_DECISION_PREFIX}:${decisionKey}`;
}

function readRecoveryDecision(storage, decisionKey) {
  const decision = parseStoredJson(storage, decisionStorageKey(decisionKey));
  if (!decision?.choice) return "";
  const expiresAt = Date.parse(decision.expiresAt || "") || 0;
  if (expiresAt && expiresAt < Date.now()) {
    storage.removeItem(decisionStorageKey(decisionKey));
    return "";
  }
  return decision.choice;
}

function storeRecoveryDecision(storage, decisionKey, choice) {
  storage.setItem(
    decisionStorageKey(decisionKey),
    JSON.stringify({
      choice,
      decidedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + OFFER_DRAFT_RECOVERY_MAX_AGE_MS).toISOString(),
    })
  );
}

function setPendingRecovery(storage, requestId, recovery) {
  if (!storage || !requestId || !recovery) return;
  storage.setItem(
    pendingRecoveryKey(storage, requestId),
    JSON.stringify({
      ...recovery,
      requestId,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + OFFER_DRAFT_RECOVERY_MAX_AGE_MS).toISOString(),
    })
  );
  try {
    window.dispatchEvent(
      new CustomEvent("expo-proffdok-offer-recovery", {
        detail: { requestId },
      })
    );
  } catch {
    // React-wrapperen leser også pending direkte ved render/focus.
  }
}

function clearPendingRecovery(storage, requestId) {
  if (!storage || !requestId) return;
  storage.removeItem(pendingRecoveryKey(storage, requestId));
}

export function getPendingOfferDraftRecovery(requestId = "") {
  const storage = getLocalStorage();
  if (!storage || !requestId) return null;
  const pending = parseStoredJson(storage, pendingRecoveryKey(storage, requestId));
  if (!pending) return null;

  const expiresAt = Date.parse(pending.expiresAt || "") || 0;
  if (expiresAt && expiresAt < Date.now()) {
    clearPendingRecovery(storage, requestId);
    return null;
  }

  return pending;
}

export function hasPendingOfferDraftRecovery(requestId = "") {
  return Boolean(getPendingOfferDraftRecovery(requestId));
}

function findHistoryRecord(storage, key, savedAtMs) {
  const history = parseStoredJson(storage, offerDraftHistoryKey(key));
  if (!Array.isArray(history)) return null;
  return (
    history.find(
      (record) => (Date.parse(record?.savedAt || "") || 0) === Number(savedAtMs || 0)
    ) || null
  );
}

export function resolvePendingOfferDraftRecovery(requestId = "", choice = "") {
  const storage = getLocalStorage();
  if (!storage || !requestId || !["local", "server"].includes(choice)) {
    return false;
  }

  const pending = getPendingOfferDraftRecovery(requestId);
  if (!pending?.decisionKey) return false;

  if (pending.type === "history" && choice === "local") {
    const live = parseStoredJson(storage, pending.liveKey);
    const recovery = findHistoryRecord(
      storage,
      pending.recoveryKey,
      pending.recoverySavedAt
    );

    if (!live?.form || !recovery?.form) return false;

    const recoveredForm = mergeRecoveredOfferDraftMedia(recovery.form, live.form);
    const recoveredRecord = {
      form: recoveredForm,
      savedAt: new Date().toISOString(),
    };

    preserveOfferDraftSnapshot(storage, pending.liveKey, live, {
      force: true,
      reason: "before-recovery",
    });
    storage.setItem(pending.liveKey, JSON.stringify(recoveredRecord));
    preserveOfferDraftSnapshot(storage, pending.liveKey, recoveredRecord, {
      force: true,
      reason: "recovered",
    });
  }

  storeRecoveryDecision(storage, pending.decisionKey, choice);
  clearPendingRecovery(storage, requestId);
  return true;
}

function latestLocalOfferRecord(storage, candidateKeys) {
  const liveCandidates = candidateKeys
    .map((key) => {
      const parsed = parseStoredJson(storage, key);
      if (!parsed?.form) return null;
      return {
        form: parsed.form,
        savedAt: Date.parse(parsed.savedAt || "") || 0,
        savedAtText: parsed.savedAt || "",
        key,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.savedAt - a.savedAt);

  return liveCandidates[0] || null;
}

export function buildSalesStorageKey({
  integrationMode = "preview",
  companyName = "",
  userId = "anonymous",
} = {}) {
  if (integrationMode !== "app") return STORAGE_KEY;

  const companyScope = String(companyName || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const userScope = String(userId || "anonymous");
  const supportScope = getSupportCompanyScope();

  return `${STORAGE_KEY}:${companyScope || "uten-firma"}:${userScope}${
    supportScope ? `:support:${supportScope}` : ""
  }`;
}

export function loadSalesNavigation(storageKey) {
  try {
    const storage = getLocalStorage();
    if (!storage) return { mode: "list", selectedRequestId: null };

    const storedNavigation = storage.getItem(`${storageKey}:navigation`);
    const parsedNavigation = storedNavigation ? JSON.parse(storedNavigation) : null;

    if (!parsedNavigation?.selectedRequestId) {
      return { mode: "list", selectedRequestId: null };
    }

    return {
      mode: parsedNavigation.mode || "detail",
      selectedRequestId: parsedNavigation.selectedRequestId,
    };
  } catch {
    return { mode: "list", selectedRequestId: null };
  }
}

export function saveSalesNavigation(storageKey, mode, selectedRequestId) {
  try {
    const storage = getLocalStorage();
    if (!storage) return;
    storage.setItem(
      `${storageKey}:navigation`,
      JSON.stringify({ mode, selectedRequestId })
    );
  } catch {
    // Navigasjon er kun et lokalt hjelpemiddel.
  }
}

export function loadRequests(storageKey = STORAGE_KEY) {
  if (storageKey !== STORAGE_KEY) return [];

  try {
    const storage = getLocalStorage();
    if (!storage) return initialRequests;
    const storedRequests = storage.getItem(storageKey);
    if (!storedRequests) return initialRequests;
    const parsedRequests = JSON.parse(storedRequests);
    return Array.isArray(parsedRequests) ? parsedRequests : initialRequests;
  } catch {
    return initialRequests;
  }
}

export function saveRequests(requests, storageKey = STORAGE_KEY) {
  try {
    const storage = getLocalStorage();
    if (!storage) return;
    storage.setItem(storageKey, JSON.stringify(requests));
  } catch {
    // Lokal preview-lagring er kun et sikkerhetsnett.
  }
}

export function buildStableOfferDraftKey({
  userId = "",
  userEmail = "",
  requestId = "",
} = {}) {
  const userScope = String(userId || userEmail || "innlogget-bruker")
    .trim()
    .toLowerCase();
  const supportScope = getSupportCompanyScope();

  return `${STORAGE_KEY}:offer-draft:${userScope}${
    supportScope ? `:support:${supportScope}` : ""
  }:${requestId || "uten-sak"}`;
}

export function buildScopedOfferDraftKey(storageKey, requestId = "") {
  return `${storageKey}:offer-draft:${requestId || "uten-sak"}`;
}

export function saveOfferDraft(stableKey, formValue) {
  const storage = getLocalStorage();
  if (!storage || !stableKey) return false;

  const requestId = String(stableKey).split(":").pop() || "";
  if (requestId && hasPendingOfferDraftRecovery(requestId)) {
    return false;
  }

  const previous = parseStoredJson(storage, stableKey);
  const nextRecord = {
    form: formValue,
    savedAt: new Date().toISOString(),
  };

  let changed = true;
  if (previous?.form) {
    try {
      changed = JSON.stringify(previous.form) !== JSON.stringify(formValue);
    } catch {
      changed = true;
    }
  }

  if (changed && previous?.form) {
    const contentShrink = shouldForceOfferDraftSnapshot(previous.form, formValue);
    if (contentShrink) {
      preserveOfferDraftSnapshot(storage, stableKey, previous, {
        force: true,
        reason: "content-shrink",
      });
    }
  }

  storage.setItem(stableKey, JSON.stringify(nextRecord));

  if (!previous?.form || !shouldForceOfferDraftSnapshot(previous.form, formValue)) {
    preserveOfferDraftSnapshot(storage, stableKey, nextRecord, {
      reason: "autosave-current",
    });
  }
  return true;
}

export function loadOfferDraft(input = {}) {
  const { requestId, stableKey, scopedKey } = normalizeOfferDraftLoadInput(input);
  if (!requestId) return null;

  const storage = getLocalStorage();
  if (!storage) return null;

  const candidateKeys = collectOfferDraftCandidateKeys(storage, {
    requestId,
    stableKey,
    scopedKey,
  });
  const latestLive = latestLocalOfferRecord(storage, candidateKeys);
  const historyCandidates = collectOfferDraftHistoryCandidates(storage, candidateKeys);
  const now = Date.now();
  const recovery = latestLive?.form
    ? historyCandidates
        .filter(
          (candidate) =>
            candidate?.form &&
            candidate.savedAt &&
            now - candidate.savedAt <= OFFER_DRAFT_RECOVERY_MAX_AGE_MS &&
            isMoreCompleteOfferDraft(candidate.form, latestLive.form)
        )
        .sort((a, b) => b.savedAt - a.savedAt)[0] || null
    : null;

  if (latestLive?.form && recovery?.form) {
    const decisionKey = [
      "history",
      requestId,
      recovery.savedAt,
      latestLive.savedAt,
    ].join(":");
    const decision = readRecoveryDecision(storage, decisionKey);

    if (decision === "local") {
      const recoveredForm = mergeRecoveredOfferDraftMedia(
        recovery.form,
        latestLive.form
      );
      clearPendingRecovery(storage, requestId);
      return recoveredForm;
    }
    if (decision === "server") {
      clearPendingRecovery(storage, requestId);
      return latestLive.form;
    }

    const recoveryMetrics = getOfferDraftMetrics(recovery.form);
    const liveMetrics = getOfferDraftMetrics(latestLive.form);
    setPendingRecovery(storage, requestId, {
      type: "history",
      decisionKey,
      liveKey: latestLive.key,
      liveSavedAt: latestLive.savedAt,
      liveSavedAtText: latestLive.savedAtText,
      recoveryKey: recovery.key,
      recoverySavedAt: recovery.savedAt,
      recoverySavedAtText: recovery.savedAtText,
      localLines: recoveryMetrics.meaningfulLines,
      localOptions: recoveryMetrics.meaningfulOptions,
      serverLines: liveMetrics.meaningfulLines,
      serverOptions: liveMetrics.meaningfulOptions,
    });
    return latestLive.form;
  }

  const localRecord = latestLive ||
    historyCandidates
      .filter(
        (candidate) =>
          candidate?.form &&
          candidate.savedAt &&
          now - candidate.savedAt <= OFFER_DRAFT_RECOVERY_MAX_AGE_MS
      )
      .sort((a, b) => b.savedAt - a.savedAt)[0] || null;
  const confirmedServer = getConfirmedServerOfferBaseline(storage, requestId);

  if (confirmedServer?.savedAt && localRecord?.form) {
    const isLocalNewer =
      localRecord.savedAt >
      confirmedServer.savedAt + OFFER_DRAFT_CONFLICT_CLOCK_TOLERANCE_MS;

    if (isLocalNewer) {
      const decisionKey = [
        "server",
        requestId,
        localRecord.savedAt,
        confirmedServer.savedAt,
      ].join(":");
      const decision = readRecoveryDecision(storage, decisionKey);

      if (decision === "local") {
        clearPendingRecovery(storage, requestId);
        return localRecord.form;
      }
      if (decision === "server") {
        clearPendingRecovery(storage, requestId);
        return null;
      }

      const localMetrics = getOfferDraftMetrics(localRecord.form);
      setPendingRecovery(storage, requestId, {
        type: "server",
        decisionKey,
        localKey: localRecord.key,
        localSavedAt: localRecord.savedAt,
        localSavedAtText: localRecord.savedAtText || "",
        serverSavedAt: confirmedServer.savedAt,
        serverSavedAtText:
          confirmedServer.offerDraftSavedAt || confirmedServer.observedAt || "",
        localLines: localMetrics.meaningfulLines,
        localOptions: localMetrics.meaningfulOptions,
        serverLines: Number(confirmedServer.meaningfulLines || 0),
        serverOptions: Number(confirmedServer.meaningfulOptions || 0),
      });
      return null;
    }

    clearPendingRecovery(storage, requestId);
    return null;
  }

  clearPendingRecovery(storage, requestId);

  if (localRecord?.form) {
    if (latestLive?.form) return localRecord.form;

    const serverSavedAt = getLatestServerSavedAt(storage, candidateKeys);
    if (localRecord.savedAt > serverSavedAt) return localRecord.form;
  }

  return null;
}

export function loadOfferDraftHistory(input = {}) {
  const { requestId, stableKey, scopedKey } = normalizeOfferDraftLoadInput(input);
  if (!requestId) return [];
  const storage = getLocalStorage();
  if (!storage) return [];

  const candidateKeys = collectOfferDraftCandidateKeys(storage, {
    requestId,
    stableKey,
    scopedKey,
  });

  return collectOfferDraftHistoryCandidates(storage, candidateKeys)
    .sort((a, b) => b.savedAt - a.savedAt)
    .slice(0, OFFER_DRAFT_HISTORY_LIMIT)
    .map((record) => ({
      form: record.form,
      savedAt: record.savedAtText,
      reason: record.reason || "",
      key: record.key,
    }));
}

export function clearOfferDraft(stableKey, scopedKey) {
  const storage = getLocalStorage();
  if (!storage) return;

  const savedAt = new Date().toISOString();
  [stableKey, scopedKey]
    .filter(Boolean)
    .forEach((key) => {
      storage.removeItem(key);
      storage.setItem(
        offerDraftServerSavedKey(key),
        JSON.stringify({ savedAt })
      );
    });
}

export function buildInspectionDraftKey(storageKey, requestId = "") {
  return `${storageKey}:inspection-draft:${requestId || "uten-sak"}`;
}

export function saveInspectionDraft(draftKey, formValue) {
  try {
    const storage = getLocalStorage();
    if (!storage) return;
    storage.setItem(
      draftKey,
      JSON.stringify({ form: formValue, savedAt: new Date().toISOString() })
    );
  } catch {
    // Lokal feature-kladd. Ingen database-/prosjektlagring.
  }
}

export function loadInspectionDraft(draftKey) {
  try {
    const storage = getLocalStorage();
    if (!storage) return null;
    const storedDraft = storage.getItem(draftKey);
    return storedDraft ? JSON.parse(storedDraft) : null;
  } catch {
    return null;
  }
}

export function clearInspectionDraft(draftKey) {
  try {
    const storage = getLocalStorage();
    if (!storage) return;
    storage.removeItem(draftKey);
  } catch {
    // Lokal feature-kladd.
  }
}
