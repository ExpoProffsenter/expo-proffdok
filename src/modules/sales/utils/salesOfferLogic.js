// Expo ProffDok – FASE 37A2 / FASE 37D1 / FASE 31A2
// Butikktilbud beholder skjult, versjonslåst metadata i kundevisning.
// FASE 37A2 mapper i tillegg publiseringstid og digital avvisning slik at kunde-
// og internpresentasjon kan avslutte Butikktilbud uten prosjektaktivering.

export * from "./salesOfferLogicCore.js";

import {
  hasPendingOfferDraftRecovery,
  pruneEmptyOfferDraftRows,
} from "../services/salesLocalStorage.js";
import { getOfferTotal, getStoreOfferMeta } from "./salesUtils.js";
import {
  prepareOfferFormForSave as prepareOfferFormForSaveCore,
} from "./salesOfferLogicCore.js";
import * as core from "./salesOfferLogicCore.js";

function normalizeOfferAmountForValidation(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s/g, "")
    .replace(/([,.])-$/, "$1")
    .replace(",", ".");
}

function isValidOfferAmount(value) {
  const normalized = normalizeOfferAmountForValidation(value);
  if (!normalized) return false;
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) return false;
  return Number.isFinite(Number(normalized));
}

function isValidOfferQuantity(value) {
  const text = String(value ?? "").trim();
  if (!text) return true;
  const normalized = normalizeOfferAmountForValidation(text);
  if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) return false;
  const quantity = Number(normalized);
  return Number.isFinite(quantity) && quantity > 0;
}

function parseOfferNumber(value) {
  const normalized = normalizeOfferAmountForValidation(value);
  if (!normalized) return 0;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toStoredOfferAmount(value) {
  if (!Number.isFinite(value)) return "";
  return String(Number(value.toFixed(2)));
}

function normalizeQuantityFields(item = {}) {
  return {
    ...item,
    quantity: String(item?.quantity ?? "").trim(),
    unit: String(item?.unit || "").trim(),
  };
}

export function recalculateAdministrationLines(lines = []) {
  const normalizedLines = core.normalizeOfferLines(lines).map(normalizeQuantityFields);
  const baseTotals = normalizedLines.reduce((totals, line) => {
    if (line.lineType === "administration") return totals;
    const current = totals.get(line.mainPostId) || 0;
    totals.set(line.mainPostId, current + getOfferTotal([line]));
    return totals;
  }, new Map());

  return normalizedLines.map((line) => {
    if (line.lineType !== "administration" || line.adminMode === "fixed") return line;
    const percentText = String(line.adminPercent ?? "").trim();
    if (!percentText) return { ...line, amount: "" };
    const percent = parseOfferNumber(percentText);
    const baseTotal = baseTotals.get(line.mainPostId) || 0;
    return { ...line, amount: toStoredOfferAmount(baseTotal * (percent / 100)) };
  });
}

function normalizeOptionsWithQuantity(options = []) {
  return core.normalizeOfferOptions(options).map(normalizeQuantityFields);
}

export function buildOfferFormFromRequest(request) {
  const form = core.buildOfferFormFromRequest(request);
  return {
    ...form,
    lines: recalculateAdministrationLines(form.lines || []),
    options: normalizeOptionsWithQuantity(form.options || []),
  };
}

export function normalizeStoredOfferDraft(storedDraft, request) {
  const form = core.normalizeStoredOfferDraft(storedDraft, request);
  return {
    ...form,
    lines: recalculateAdministrationLines(form.lines || []),
    options: normalizeOptionsWithQuantity(form.options || []),
  };
}

export function mergeOfferDraftIntoRequests(currentRequests, formValue, requestId, savedAt) {
  if (hasPendingOfferDraftRecovery(requestId)) return currentRequests;
  const pruned = pruneEmptyOfferDraftRows(formValue);
  const merged = core.mergeOfferDraftIntoRequests(currentRequests, pruned, requestId, savedAt);
  return merged.map((request) => {
    if (request.id !== requestId) return request;
    const offerLines = recalculateAdministrationLines(request.offerLines || []);
    const offerOptions = normalizeOptionsWithQuantity(request.offerOptions || []);
    return { ...request, offerLines, offerOptions, offerTotal: getOfferTotal(offerLines) };
  });
}

export function prepareOfferFormForSave(formValue = {}) {
  const prepared = prepareOfferFormForSaveCore(pruneEmptyOfferDraftRows(formValue));
  const cleanLines = recalculateAdministrationLines(prepared.cleanLines || []).map(normalizeQuantityFields);
  const cleanOptions = normalizeOptionsWithQuantity(prepared.cleanOptions || []);
  const invalidLineAmount = cleanLines.find((line) => line.amount !== "" && !isValidOfferAmount(line.amount));
  const invalidOptionAmount = cleanOptions.find((option) => option.amount !== "" && !isValidOfferAmount(option.amount));
  const invalidLineQuantity = cleanLines.find((line) => line.quantity !== "" && !isValidOfferQuantity(line.quantity));
  const invalidOptionQuantity = cleanOptions.find((option) => option.quantity !== "" && !isValidOfferQuantity(option.quantity));

  return {
    ...prepared,
    cleanLines,
    cleanOptions,
    incompleteLine: prepared.incompleteLine || invalidLineAmount || invalidLineQuantity || null,
    incompleteOption: prepared.incompleteOption || invalidOptionAmount || invalidOptionQuantity || null,
    invalidLineQuantity: invalidLineQuantity || null,
    invalidOptionQuantity: invalidOptionQuantity || null,
  };
}

export function mapPublicOfferToRequest(result) {
  const mapped = core.mapPublicOfferToRequest(result);
  if (!mapped) return null;

  const publishedLines = Array.isArray(result?.version?.lines) ? result.version.lines : [];
  const offerStatus = String(result?.offer?.status || "").trim().toLowerCase();
  const declined = offerStatus === "declined";

  return {
    ...mapped,
    storeOfferMeta: getStoreOfferMeta(publishedLines),
    sentOfferAt: result?.version?.created_at || mapped.sentOfferAt || "",
    offerPublishedAt: result?.version?.created_at || "",
    declinedAt: result?.offer?.declined_at || "",
    declinedBy: result?.offer?.declined_by || "",
    ...(declined
      ? {
          status: "Avvist",
          statusClass: "sales-status-quote",
          nextStep: "Tilbudet er avvist",
          iconName: "send",
        }
      : {}),
  };
}
