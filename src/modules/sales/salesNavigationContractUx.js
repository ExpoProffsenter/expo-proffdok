// Expo ProffDok – FASE 45B
// Sentral sikkerhetskontrakt for Sales-navigasjon.
// Eksisterende React-navigasjon er fortsatt primær. Denne modulen reparerer kun
// dokumenterte feiltilfeller: underflate -> liste/null ved Tilbake/Lukk, eller
// retur fra ekstern fane til en annen intern Sales-flate enn den som ble forlatt.

import {
  buildSalesStorageKey,
  loadSalesNavigation,
  saveSalesNavigation,
} from "./services/salesLocalStorage.js";
import {
  createDefaultSalesSupabaseClient,
  getSalesSession,
} from "./services/salesSupabase.js";
import {
  WORK_PROFILE_EVENT,
  readCachedWorkProfileState,
} from "../access/workProfileClient.js";

const INSTALL_FLAG = "__expoSalesNavigationContractInstalled";
const EXTERNAL_ORIGIN_KEY = "expo-proffdok:sales:navigation-contract:external-origin:v1";
const EXTERNAL_ORIGIN_MAX_AGE_MS = 30 * 60 * 1000;
const CHILD_MODES = new Set([
  "edit-request",
  "survey-plan",
  "inspection-note",
  "offer-builder",
  "project-activation",
]);
const BACK_LABELS = new Set([
  "tilbake",
  "lukk",
  "avbryt",
  "tilbake til redigering",
  "tilbake til intern visning",
]);

let authUserId = "";
let activeCompanyName = "";
let activeStorageKey = "";
let lastNavigation = null;
let pendingBackExpectation = null;
let scheduledFrame = 0;
let originalWindowOpen = null;
let identityClient = null;

function compactText(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function normalizeNavigation(value = null) {
  if (!value || typeof value !== "object") return null;
  const mode = compactText(value.mode);
  const selectedRequestId = compactText(value.selectedRequestId);
  if (!mode) return null;
  return {
    mode,
    selectedRequestId: selectedRequestId || null,
  };
}

function sameNavigation(left, right) {
  const a = normalizeNavigation(left);
  const b = normalizeNavigation(right);
  return Boolean(
    a &&
      b &&
      a.mode === b.mode &&
      String(a.selectedRequestId || "") === String(b.selectedRequestId || "")
  );
}

function isPublicSalesSurface() {
  if (typeof window === "undefined") return true;
  const params = new URLSearchParams(window.location.search);
  return Boolean(
    params.get("publicOffer") ||
      params.get("offerPreview") ||
      params.get("publicContract")
  );
}

function companyNameFromState(state = null) {
  const profile = state?.active_company_profile || null;
  return compactText(profile?.companyName || profile?.company_name);
}

function refreshStorageKey(state = null) {
  if (!authUserId) return "";
  const companyName = companyNameFromState(state || readCachedWorkProfileState());
  if (!companyName) return "";
  activeCompanyName = companyName;
  activeStorageKey = buildSalesStorageKey({
    integrationMode: "app",
    companyName,
    userId: authUserId,
  });
  return activeStorageKey;
}

async function refreshIdentity(state = null) {
  try {
    identityClient ||= createDefaultSalesSupabaseClient();
    const { data } = await getSalesSession(identityClient);
    authUserId = compactText(data?.session?.user?.id);
    refreshStorageKey(state);
  } catch {
    // Kontrakten er UX-sikkerhet. Ordinær React-navigasjon fortsetter uendret.
  }
}

function currentNavigation() {
  if (isPublicSalesSurface()) return null;
  if (!activeStorageKey) refreshStorageKey();
  if (!activeStorageKey) return null;
  return normalizeNavigation(loadSalesNavigation(activeStorageKey));
}

function currentContext() {
  const navigation = currentNavigation();
  if (!navigation) return null;
  return {
    storageKey: activeStorageKey,
    companyName: activeCompanyName,
    navigation,
  };
}

function saveExternalOrigin() {
  const context = currentContext();
  if (!context?.navigation?.selectedRequestId) return;
  try {
    window.sessionStorage.setItem(
      EXTERNAL_ORIGIN_KEY,
      JSON.stringify({
        ...context,
        savedAt: Date.now(),
      })
    );
  } catch {
    // Ingen endring av hovedflyt dersom sessionStorage er utilgjengelig.
  }
}

function readExternalOrigin() {
  try {
    const raw = window.sessionStorage.getItem(EXTERNAL_ORIGIN_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!parsed?.storageKey || !parsed?.navigation) return null;
    const savedAt = Number(parsed.savedAt || 0);
    if (!savedAt || Date.now() - savedAt > EXTERNAL_ORIGIN_MAX_AGE_MS) {
      window.sessionStorage.removeItem(EXTERNAL_ORIGIN_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function clearExternalOrigin() {
  try {
    window.sessionStorage.removeItem(EXTERNAL_ORIGIN_KEY);
  } catch {
    // UX-markør בלבד.
  }
}

function restoreNavigation(expected, reason = "") {
  const navigation = normalizeNavigation(expected?.navigation || expected);
  const storageKey = compactText(expected?.storageKey || activeStorageKey);
  if (!storageKey || !navigation?.selectedRequestId) return false;
  if (storageKey !== activeStorageKey) return false;

  saveSalesNavigation(
    storageKey,
    navigation.mode,
    navigation.selectedRequestId
  );

  try {
    window.dispatchEvent(
      new CustomEvent("expo-proffdok-sales-rehydrate", {
        detail: {
          reason: reason || "navigation-contract",
          mode: navigation.mode,
          selectedRequestId: navigation.selectedRequestId,
        },
      })
    );
  } catch {
    return false;
  }
  return true;
}

function restoreExternalOriginOnFocus() {
  if (isPublicSalesSurface()) return;
  const origin = readExternalOrigin();
  if (!origin) return;

  // Firma kan aldri krysses av denne sikkerhetsmekanismen.
  if (!activeStorageKey || origin.storageKey !== activeStorageKey) {
    clearExternalOrigin();
    return;
  }

  const now = currentNavigation();
  if (!sameNavigation(now, origin.navigation)) {
    restoreNavigation(origin, "external-preview-return");
  }
  clearExternalOrigin();
}

function navigationDepth(mode = "") {
  if (mode === "list") return 0;
  if (mode === "detail") return 1;
  if (CHILD_MODES.has(mode)) return 2;
  return 1;
}

function observeNavigationTransition() {
  if (isPublicSalesSurface()) return;
  const next = currentNavigation();
  if (!next) return;

  const previous = lastNavigation;
  if (
    previous &&
    previous.selectedRequestId &&
    next.selectedRequestId &&
    previous.selectedRequestId === next.selectedRequestId &&
    navigationDepth(next.mode) > navigationDepth(previous.mode)
  ) {
    pendingBackExpectation = {
      childMode: next.mode,
      parent: {
        storageKey: activeStorageKey,
        navigation: previous,
      },
    };
  }

  // Når normal React-navigasjon allerede har returnert korrekt til forelderen,
  // er fallbacken brukt opp og skal ikke påvirke neste handling.
  if (
    pendingBackExpectation?.parent?.navigation &&
    sameNavigation(next, pendingBackExpectation.parent.navigation)
  ) {
    pendingBackExpectation = null;
  }

  lastNavigation = next;
}

function scheduleObserve() {
  if (scheduledFrame || typeof window === "undefined") return;
  scheduledFrame = window.requestAnimationFrame(() => {
    scheduledFrame = 0;
    observeNavigationTransition();
  });
}

function isBackLikeControl(control) {
  const text = compactText(control?.textContent).toLocaleLowerCase("nb-NO");
  if (!text) return false;
  if (BACK_LABELS.has(text)) return true;
  return text.startsWith("tilbake til ");
}

function verifyBackResult(expected) {
  const check = () => {
    if (!expected?.parent?.navigation) return;
    const now = currentNavigation();
    if (!now) return;

    // Native React-retur til detail/forelder er riktig. Vi reparerer kun det
    // dokumenterte feiltilfellet: hele saken mistes eller brukeren havner i list.
    if (
      now.mode === "list" ||
      !now.selectedRequestId
    ) {
      restoreNavigation(expected.parent, "child-back-fell-to-list");
    }
  };

  window.setTimeout(check, 0);
  window.setTimeout(check, 120);
  window.setTimeout(check, 320);
}

function handleDocumentClickCapture(event) {
  if (isPublicSalesSurface()) return;
  const control = event.target instanceof Element
    ? event.target.closest("button,a,[role='button']")
    : null;
  if (!(control instanceof Element)) return;
  if (!control.closest(".sales-app")) return;

  if (isBackLikeControl(control) && pendingBackExpectation) {
    verifyBackResult(pendingBackExpectation);
  }

  scheduleObserve();
}

function installWindowOpenOriginGuard() {
  if (originalWindowOpen || typeof window === "undefined") return;
  originalWindowOpen = window.open.bind(window);

  window.open = (...args) => {
    if (!isPublicSalesSurface() && document.querySelector(".sales-app")) {
      saveExternalOrigin();
    }
    return originalWindowOpen(...args);
  };
}

export function installSalesNavigationContractUx() {
  if (typeof window === "undefined" || window[INSTALL_FLAG]) return;
  window[INSTALL_FLAG] = true;

  void refreshIdentity(readCachedWorkProfileState()).then(scheduleObserve);
  installWindowOpenOriginGuard();

  document.addEventListener("click", handleDocumentClickCapture, true);
  window.addEventListener("focus", restoreExternalOriginOnFocus);
  window.addEventListener("pageshow", restoreExternalOriginOnFocus);
  window.addEventListener(WORK_PROFILE_EVENT, (event) => {
    pendingBackExpectation = null;
    lastNavigation = null;
    clearExternalOrigin();
    void refreshIdentity(event?.detail || readCachedWorkProfileState()).then(scheduleObserve);
  });

  const observer = new MutationObserver(scheduleObserve);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  scheduleObserve();
}
