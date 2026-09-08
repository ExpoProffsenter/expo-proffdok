// Expo ProffDok – FASE 39B.2C / FASE 37A2 / FASE 37D1 / FASE 31A2
// Tom lokal nettleserkladd får aldri overstyre et eksisterende, meningsfullt
// servertilbud ved hydrering. Butikktilbud-avsnitt holdes utenfor ordinær
// pris/antall-validering og bevarer egen linjetype gjennom lagring/recovery.
// Butikktilbud beholder skjult, versjonslåst metadata i kundevisning.
// FASE 37A2 mapper i tillegg publiseringstid og digital avvisning slik at kunde-
// og internpresentasjon kan avslutte Butikktilbud uten prosjektaktivering.
// Recovery-kontrakt: prepareOfferFormForSaveCore(pruneEmptyOfferDraftRows(formValue))
// er fortsatt prinsippet; 39B.2C skiller bare ut store_text-avsnitt før core-validering.

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

const STORE_SECTION_LINE_TYPE = "store_text";
const STORE_SECTION_MARKER = "#expo-store-text-block";

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

function isOfferMetaLine(line = {}) {
  return Boolean(
    line?.__companyMeta || line?.__offerTermsMeta || line?.__storeOfferMeta
  );
}

function isStoreSectionLine(line = {}) {
  return Boolean(
    line?.lineType === STORE_SECTION_LINE_TYPE ||
      line?.storeSectionMode === "group" ||
      String(line?.productUrl || "").trim() === STORE_SECTION_MARKER ||
      String(line?.id || "").startsWith("store-section-")
  );
}

function normalizeStoreSectionLine(line = {}) {
  let title = String(line.storeTextTitle || "").trim();
  let body = String(line.storeTextBody || "").trim();

  if (title === "Nytt avsnitt" && body) {
    title = body;
    body = "";
  } else if (title === "Nytt avsnitt") {
    title = "";
  }

  const description =
    [title, body].filter(Boolean).join("\n") || String(line.description || "").trim();

  return {
    ...line,
    lineType: STORE_SECTION_LINE_TYPE,
    storeSectionMode: "group",
    storeSectionId: line.storeSectionId || line.id || "",
    storeTextTitle: title,
    storeTextBody: body,
    description,
    productUrl: STORE_SECTION_MARKER,
    amount: "0",
    quantity: "0",
    unit: "",
  };
}

function meaningfulOfferRowCount(form = {}) {
  const clean = pruneEmptyOfferDraftRows(form || {});
  const lines = (Array.isArray(clean.lines) ? clean.lines : []).filter(
    (line) => !isOfferMetaLine(line)
  );
  const options = Array.isArray(clean.options) ? clean.options : [];
  return lines.length + options.length;
}

function hasMeaningfulLocalDraftText(form = {}) {
  return [
    form?.title,
    form?.intro,
    form?.reservations,
    form?.included,
    form?.excluded,
    form?.customerSupplied,
    form?.terms,
  ].some((value) => String(value || "").trim());
}

export function recalculateAdministrationLines(lines = []) {
  const rawLines = Array.isArray(lines) ? lines : [];
  const ordinaryLines = rawLines.filter((line) => !isStoreSectionLine(line));
  const normalizedOrdinary = core
    .normalizeOfferLines(ordinaryLines)
    .map(normalizeQuantityFields);

  const baseTotals = normalizedOrdinary.reduce((totals, line) => {
    if (line.lineType === "administration") return totals;
    const current = totals.get(line.mainPostId) || 0;
    totals.set(line.mainPostId, current + getOfferTotal([line]));
    return totals;
  }, new Map());

  const recalculatedOrdinary = normalizedOrdinary.map((line) => {
    if (line.lineType !== "administration" || line.adminMode === "fixed") return line;
    const percentText = String(line.adminPercent ?? "").trim();
    if (!percentText) return { ...line, amount: "" };
    const percent = parseOfferNumber(percentText);
    const baseTotal = baseTotals.get(line.mainPostId) || 0;
    return { ...line, amount: toStoredOfferAmount(baseTotal * (percent / 100)) };
  });

  let ordinaryIndex = 0;
  return rawLines.map((line) => {
    if (isStoreSectionLine(line)) return normalizeStoreSectionLine(line);
    const normalized = recalculatedOrdinary[ordinaryIndex];
    ordinaryIndex += 1;
    return normalized || line;
  });
}

function normalizeOptionsWithQuantity(options = []) {
  return core.normalizeOfferOptions(options).map(normalizeQuantityFields);
}

export function buildOfferFormFromRequest(request) {
  const form = core.buildOfferFormFromRequest(request);
  return {
    ...form,
    lines: recalculateAdministrationLines(request?.offerLines || form.lines || []),
    options: normalizeOptionsWithQuantity(form.options || []),
  };
}

export function normalizeStoredOfferDraft(storedDraft, request) {
  const requestForm = buildOfferFormFromRequest(request);
  const serverRows = meaningfulOfferRowCount(requestForm);
  const localRows = meaningfulOfferRowCount(storedDraft || {});
  const localHasText = hasMeaningfulLocalDraftText(storedDraft || {});

  // Recovery-first: dersom serveren allerede har reelt tilbudsinnhold, skal en
  // strukturelt tom lokal kladd fra reload/remount aldri få nullstille editoren.
  // En faktisk lokal kladd med poster/opsjoner eller egen tekst beholdes som før.
  const preferServerDraft = Boolean(
    storedDraft && serverRows > 0 && localRows === 0 && !localHasText
  );

  const form = preferServerDraft
    ? requestForm
    : core.normalizeStoredOfferDraft(storedDraft, request);

  const sourceLines = preferServerDraft
    ? requestForm.lines || []
    : Array.isArray(storedDraft?.lines)
      ? storedDraft.lines
      : requestForm.lines || [];

  return {
    ...form,
    lines: recalculateAdministrationLines(sourceLines),
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
  const pruned = pruneEmptyOfferDraftRows(formValue);
  const originalLines = Array.isArray(pruned.lines) ? pruned.lines : [];
  const ordinaryLines = originalLines.filter((line) => !isStoreSectionLine(line));
  const prepared = prepareOfferFormForSaveCore({ ...pruned, lines: ordinaryLines });
  const cleanOrdinaryLines = recalculateAdministrationLines(
    prepared.cleanLines || []
  ).map(normalizeQuantityFields);
  const cleanOptions = normalizeOptionsWithQuantity(prepared.cleanOptions || []);

  const cleanOrdinaryById = new Map(
    cleanOrdinaryLines
      .filter((line) => line?.id)
      .map((line) => [String(line.id), line])
  );
  const usedOrdinaryIds = new Set();
  let fallbackOrdinaryIndex = 0;
  const cleanLines = [];

  originalLines.forEach((line) => {
    if (isStoreSectionLine(line)) {
      const section = normalizeStoreSectionLine(line);
      if (section.description) cleanLines.push(section);
      return;
    }

    const id = String(line?.id || "");
    const byId = id ? cleanOrdinaryById.get(id) : null;
    if (byId) {
      cleanLines.push(byId);
      usedOrdinaryIds.add(id);
      return;
    }

    while (
      fallbackOrdinaryIndex < cleanOrdinaryLines.length &&
      usedOrdinaryIds.has(String(cleanOrdinaryLines[fallbackOrdinaryIndex]?.id || ""))
    ) {
      fallbackOrdinaryIndex += 1;
    }
    const fallback = cleanOrdinaryLines[fallbackOrdinaryIndex];
    if (fallback && !fallback?.id) {
      cleanLines.push(fallback);
      fallbackOrdinaryIndex += 1;
    }
  });

  cleanOrdinaryLines.forEach((line) => {
    const id = String(line?.id || "");
    if (id && !usedOrdinaryIds.has(id)) cleanLines.push(line);
  });

  const invalidLineAmount = cleanOrdinaryLines.find(
    (line) => line.amount !== "" && !isValidOfferAmount(line.amount)
  );
  const invalidOptionAmount = cleanOptions.find(
    (option) => option.amount !== "" && !isValidOfferAmount(option.amount)
  );
  const invalidLineQuantity = cleanOrdinaryLines.find(
    (line) => line.quantity !== "" && !isValidOfferQuantity(line.quantity)
  );
  const invalidOptionQuantity = cleanOptions.find(
    (option) => option.quantity !== "" && !isValidOfferQuantity(option.quantity)
  );

  return {
    ...prepared,
    cleanLines,
    cleanOptions,
    incompleteLine:
      prepared.incompleteLine || invalidLineAmount || invalidLineQuantity || null,
    incompleteOption:
      prepared.incompleteOption || invalidOptionAmount || invalidOptionQuantity || null,
    invalidLineQuantity: invalidLineQuantity || null,
    invalidOptionQuantity: invalidOptionQuantity || null,
  };
}

export function mapPublicOfferToRequest(result) {
  const mapped = core.mapPublicOfferToRequest(result);
  if (!mapped) return null;

  const publishedLines = Array.isArray(result?.version?.lines)
    ? result.version.lines
    : [];
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
