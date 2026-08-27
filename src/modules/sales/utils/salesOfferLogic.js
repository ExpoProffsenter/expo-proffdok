// Expo ProffDok – FASE 31A1
// Stopper ikke-numeriske tilbudsbeløp ved ordinær lagring/publisering uten å
// endre 30C2-recovery, autosave-guard eller eksisterende lagringsmodell.
// Gyldige nullbeløp, negative beløp, komma/punktum og mellomrom beholdes.
// Expo ProffDok – FASE 30C2
// Sikker wrapper rundt tilbudslogikken. Recovery blokkerer autosave, og helt
// tomme rader fjernes før lokal/server-lagring. Påbegynte brukerlinjer beholdes.

export * from "./salesOfferLogicCore.js";

import {
  hasPendingOfferDraftRecovery,
  pruneEmptyOfferDraftRows,
} from "../services/salesLocalStorage.js";
import {
  mergeOfferDraftIntoRequests as mergeOfferDraftIntoRequestsCore,
  prepareOfferFormForSave as prepareOfferFormForSaveCore,
} from "./salesOfferLogicCore.js";

function isValidOfferAmount(value) {
  const normalized = String(value ?? "")
    .trim()
    .replace(/\s/g, "")
    .replace(",", ".");

  if (!normalized) return false;
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) return false;

  return Number.isFinite(Number(normalized));
}

export function mergeOfferDraftIntoRequests(
  currentRequests,
  formValue,
  requestId,
  savedAt
) {
  if (hasPendingOfferDraftRecovery(requestId)) {
    return currentRequests;
  }

  return mergeOfferDraftIntoRequestsCore(
    currentRequests,
    pruneEmptyOfferDraftRows(formValue),
    requestId,
    savedAt
  );
}

export function prepareOfferFormForSave(formValue = {}) {
  const prepared = prepareOfferFormForSaveCore(
    pruneEmptyOfferDraftRows(formValue)
  );

  const invalidLineAmount = prepared.cleanLines.find(
    (line) => line.amount !== "" && !isValidOfferAmount(line.amount)
  );
  const invalidOptionAmount = prepared.cleanOptions.find(
    (option) => option.amount !== "" && !isValidOfferAmount(option.amount)
  );

  return {
    ...prepared,
    incompleteLine: prepared.incompleteLine || invalidLineAmount || null,
    incompleteOption: prepared.incompleteOption || invalidOptionAmount || null,
  };
}
