// Expo ProffDok – FASE 45B
// Smal sikkerhetsvakt for intern "Forhåndsvis som kunde".
// En ekte pointerdown rydder med vilje gammel Sales-recovery. Denne click-capture-
// vakten armerer derfor et NYTT snapshot av akkurat den synlige Sales-saken før
// React åpner preview i ny fane. Ingen generell Back/Lukk/window.open-logikk.
//
// VIKTIG: systemadmin kan representere et annet firma enn profile.company_name.
// Vi finner derfor den faktiske lokale Sales-navigasjonen for request_ref-en som
// står på skjermen, i stedet for å anta at arbeidsprofilnavn == storage-scope.

import { buildSalesStorageKey } from "./services/salesLocalStorage.js";
import { markSalesResumeForBackground } from "./services/salesResumeRecovery.mjs";
import { resolveSalesDraftPreviewResumeStorageKey } from "./services/salesDraftPreviewResume.mjs";
import { readCachedWorkProfileState } from "../access/workProfileClient.js";

const INSTALL_FLAG = "__expoSalesDraftPreviewReturnGuardInstalled";
const PREVIEW_ACTION_SELECTOR = "[data-draft-customer-preview-action='true']";

function compactText(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function currentUserId(storage) {
  if (!storage) return "";
  try {
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (!key?.startsWith("sb-") || !key.includes("-auth-token")) continue;
      const raw = storage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      const id = compactText(
        parsed?.user?.id ||
          parsed?.currentSession?.user?.id ||
          parsed?.session?.user?.id
      );
      if (id) return id;
    }
  } catch {
    return "";
  }
  return "";
}

function activeCompanyName() {
  const state = readCachedWorkProfileState();
  const profile = state?.active_company_profile || null;
  return compactText(profile?.companyName || profile?.company_name);
}

export function armSalesDraftPreviewReturn(requestId = "") {
  if (typeof window === "undefined" || !window.localStorage) return false;

  const normalizedRequestId = compactText(requestId);
  const companyName = activeCompanyName();
  const userId = currentUserId(window.localStorage);
  if (!normalizedRequestId || !userId) return false;

  const preferredStorageKey = companyName
    ? buildSalesStorageKey({
        integrationMode: "app",
        companyName,
        userId,
      })
    : "";

  const storageKey = resolveSalesDraftPreviewResumeStorageKey({
    storage: window.localStorage,
    userId,
    requestId: normalizedRequestId,
    preferredStorageKey,
  });
  if (!storageKey) return false;

  markSalesResumeForBackground(storageKey);
  return true;
}

function handlePreviewClickCapture(event) {
  if (typeof Element === "undefined" || !(event.target instanceof Element)) return;
  const button = event.target.closest("button");
  if (!(button instanceof HTMLButtonElement)) return;

  const action = button.closest(PREVIEW_ACTION_SELECTOR);
  if (!(action instanceof HTMLElement)) return;
  if (compactText(button.textContent).toLowerCase() !== "forhåndsvis som kunde") return;

  const requestId = compactText(action.dataset.draftCustomerPreviewRequestId);
  if (!requestId) return;

  // click skjer etter pointerdown. Dermed er eventuell gammel recovery allerede
  // ryddet, og dette blir et ferskt snapshot av akkurat saken previewen åpnes fra.
  armSalesDraftPreviewReturn(requestId);
}

export function installSalesDraftPreviewReturnGuard() {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (window[INSTALL_FLAG]) return;
  window[INSTALL_FLAG] = true;
  document.addEventListener("click", handlePreviewClickCapture, true);
}
