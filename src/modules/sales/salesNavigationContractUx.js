// Expo ProffDok – FASE 45B
// Sentral, additiv sikkerhetskontrakt for Sales-navigasjon.
// React-flyten er fortsatt fasit. Modulen gjør kun to smale reparasjoner:
// 1) Tilbake/Lukk fra en Sales-underflate skal aldri miste valgt sak og falle til listen.
// 2) Retur fra eksplisitt kunde-/tilbudspreview i ny fane skal ikke miste flaten som åpnet den.
// Offentlige kundesider, normal detail -> liste og firmaswitch røres ikke.

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
const EXTERNAL_RETURN_KEY = "expo-proffdok:sales:navigation-contract:external-return:v1";
const EXTERNAL_RETURN_MAX_AGE_MS = 30 * 60 * 1000;

const CHILD_MODES = new Set([
  "edit-request",
  "survey-plan",
  "inspection-note",
  "offer-builder",
  "project-activation",
]);

const SAME_SURFACE_RETURN_LABELS = new Set([
  "tilbake til redigering",
  "tilbake til intern visning",
]);

const EXTERNAL_PREVIEW_LABELS = new Set([
  "se kundens tilbud",
  "forhåndsvis som kunde",
  "forhåndsvis kundetilbud",
  "se avvist tilbud",
]);

let authUserId = "";
let activeCompanyName = "";
let activeStorageKey = "";
let identityClient = null;
let externalReturnExpectation = null;

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
  const companyName = companyNameFromState(
    state || readCachedWorkProfileState()
  );
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
    // Dette er kun UX-sikkerhet. Ordinær Sales-navigasjon fortsetter uendret.
  }
}

function currentNavigation() {
  if (isPublicSalesSurface()) return null;
  if (!activeStorageKey) refreshStorageKey();
  if (!activeStorageKey) return null;
  return normalizeNavigation(loadSalesNavigation(activeStorageKey));
}

function navigationWasLost(navigation) {
  const normalized = normalizeNavigation(navigation);
  return Boolean(!normalized || normalized.mode === "list" || !normalized.selectedRequestId);
}

function restoreNavigation(expected, reason = "") {
  const navigation = normalizeNavigation(expected?.navigation || expected);
  const storageKey = compactText(expected?.storageKey || activeStorageKey);
  if (!storageKey || !navigation?.selectedRequestId) return false;

  // En sikkerhetsmekanisme skal aldri krysse firmascopet.
  if (!activeStorageKey || storageKey !== activeStorageKey) return false;

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
    return true;
  } catch {
    return false;
  }
}

function labelForControl(control) {
  return compactText(control?.textContent).toLocaleLowerCase("nb-NO");
}

function isBackLikeLabel(label = "") {
  return Boolean(
    label === "tilbake" ||
      label === "lukk" ||
      label === "avbryt" ||
      label.startsWith("tilbake til ")
  );
}

function expectedParentForBack(navigation, label = "") {
  const current = normalizeNavigation(navigation);
  if (!current?.selectedRequestId || !CHILD_MODES.has(current.mode)) return null;

  // Lokal tilbuds-preview ligger inne i offer-builder og skal tilbake til akkurat
  // samme editor. Andre Sales-underflater har detail som nærmeste forelder.
  const expectedMode = SAME_SURFACE_RETURN_LABELS.has(label)
    ? current.mode
    : "detail";

  return {
    storageKey: activeStorageKey,
    navigation: {
      mode: expectedMode,
      selectedRequestId: current.selectedRequestId,
    },
  };
}

function verifyBackResult(expected) {
  if (!expected?.navigation?.selectedRequestId) return;

  const check = () => {
    const now = currentNavigation();

    // Viktig: korrekt React-retur til detail/editor får stå urørt. Vi reparerer
    // bare dokumentert feiltilstand: list/null etter Tilbake/Lukk fra underflate.
    if (navigationWasLost(now)) {
      restoreNavigation(expected, "child-back-fell-to-list");
    }
  };

  window.setTimeout(check, 0);
  window.setTimeout(check, 120);
  window.setTimeout(check, 320);
}

function storeExternalReturnExpectation(expectation) {
  externalReturnExpectation = expectation;
  try {
    window.sessionStorage.setItem(
      EXTERNAL_RETURN_KEY,
      JSON.stringify({
        ...expectation,
        savedAt: Date.now(),
      })
    );
  } catch {
    // Minnet i modulen er tilstrekkelig dersom sessionStorage ikke er tilgjengelig.
  }
}

function readExternalReturnExpectation() {
  if (externalReturnExpectation) return externalReturnExpectation;
  try {
    const raw = window.sessionStorage.getItem(EXTERNAL_RETURN_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!parsed?.storageKey || !parsed?.navigation) return null;

    const savedAt = Number(parsed.savedAt || 0);
    if (!savedAt || Date.now() - savedAt > EXTERNAL_RETURN_MAX_AGE_MS) {
      window.sessionStorage.removeItem(EXTERNAL_RETURN_KEY);
      return null;
    }
    externalReturnExpectation = parsed;
    return parsed;
  } catch {
    return null;
  }
}

function clearExternalReturnExpectation() {
  externalReturnExpectation = null;
  try {
    window.sessionStorage.removeItem(EXTERNAL_RETURN_KEY);
  } catch {
    // UX-markøren er ikke kritisk for normal drift.
  }
}

function armExternalPreviewReturn(navigation) {
  const current = normalizeNavigation(navigation);
  if (!current?.selectedRequestId || !activeStorageKey) return;
  storeExternalReturnExpectation({
    storageKey: activeStorageKey,
    companyName: activeCompanyName,
    navigation: current,
  });
}

function restoreExternalPreviewReturnOnFocus() {
  if (isPublicSalesSurface()) return;
  const expected = readExternalReturnExpectation();
  if (!expected) return;

  // Firmanavn er kun ekstra vern; storageKey inkluderer også bruker og firma.
  if (
    !activeStorageKey ||
    expected.storageKey !== activeStorageKey ||
    (expected.companyName && expected.companyName !== activeCompanyName)
  ) {
    clearExternalReturnExpectation();
    return;
  }

  const now = currentNavigation();

  // Brukeren kan ha navigert videre med vilje mens den andre fanen var åpen.
  // Da skal vi aldri dra dem tilbake. Gjenopprett kun hvis saken faktisk er mistet.
  if (navigationWasLost(now)) {
    restoreNavigation(expected, "external-preview-return-lost-navigation");
  }

  clearExternalReturnExpectation();
}

function handleDocumentClickCapture(event) {
  if (isPublicSalesSurface()) return;

  const control = event.target instanceof Element
    ? event.target.closest("button,a,[role='button']")
    : null;
  if (!(control instanceof Element) || !control.closest(".sales-app")) return;

  const navigation = currentNavigation();
  if (!navigation?.selectedRequestId) return;

  const label = labelForControl(control);

  if (EXTERNAL_PREVIEW_LABELS.has(label)) {
    armExternalPreviewReturn(navigation);
  }

  if (isBackLikeLabel(label)) {
    const expected = expectedParentForBack(navigation, label);
    if (expected) verifyBackResult(expected);
  }
}

export function installSalesNavigationContractUx() {
  if (typeof window === "undefined" || window[INSTALL_FLAG]) return;
  window[INSTALL_FLAG] = true;

  void refreshIdentity(readCachedWorkProfileState());

  document.addEventListener("click", handleDocumentClickCapture, true);
  window.addEventListener("focus", restoreExternalPreviewReturnOnFocus);
  window.addEventListener("pageshow", restoreExternalPreviewReturnOnFocus);
  window.addEventListener(WORK_PROFILE_EVENT, (event) => {
    // Firmabytte er en eksplisitt brukerhandling og vinner alltid over gammel returstate.
    clearExternalReturnExpectation();
    activeStorageKey = "";
    activeCompanyName = "";
    void refreshIdentity(event?.detail || readCachedWorkProfileState());
  });
}
