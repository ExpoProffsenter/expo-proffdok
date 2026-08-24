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
  return prepareOfferFormForSaveCore(pruneEmptyOfferDraftRows(formValue));
}
