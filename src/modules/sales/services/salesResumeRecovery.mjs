// Expo ProffDok – FASE 42J / FASE 42F HOTFIX / FASE 42F
// Delt, liten recovery-hjelper for intern Befaring/Tilbud.
// Holder bootstrap og SalesModule på samme markører/TTL uten å endre salgsdata.
// I tillegg bevares et separat arbeidsbilde-snapshot når nettleserfanen går i
// bakgrunnen. Det snapshotet påvirkes ikke av React-unmount/auth-refresh og kan
// derfor gjenåpne nøyaktig samme Sales-arbeidsbilde ved retur.
// HOTFIX: enhver ekte brukerinteraksjon i den interne appen avslutter gammel
// foreground-recovery før handlingen behandles. Automatisk recovery får dermed
// aldri overstyre Tilbake/Lagre/Avbryt/meny eller annen bevisst navigasjon.
// FASE 42J: nye forespørsler/direkte tilbud har ingen request_ref før første lagring,
// men er likevel gyldige arbeidsbilder ved PC-fanebytte og mobil appbytte.

export const SALES_RELOAD_TAB_KEY = "expo-proffdok:sales:restore-tab-after-reload";
export const SALES_RELOAD_NAVIGATION_KEY = "expo-proffdok:sales:restore-navigation-after-reload";
export const SALES_BACKGROUND_RESUME_KEY = "expo-proffdok:sales:background-resume-v1";
export const SALES_WORKSPACE_RESUME_KEY = "expo-proffdok:sales:workspace-resume-v2";
export const SALES_BACKGROUND_RESUME_MAX_AGE_MS = 2 * 60 * 60 * 1000;

const SALES_RESUME_GUARD_FLAG = "__expoProffDokSalesResumeGuardV2";
const RESUME_RETRY_DELAYS_MS = [0, 120, 500, 1500, 4000, 10000, 20000, 30000];
const REQUEST_ID_OPTIONAL_MODES = new Set(["new", "new-offer"]);

function browserStorage(kind) {
  if (typeof window === "undefined") return null;
  try {
    return window[kind] || null;
  } catch {
    return null;
  }
}

function resolveStorage(explicitStorage, kind) {
  return explicitStorage === undefined ? browserStorage(kind) : explicitStorage;
}

function safeGet(storage, key) {
  try {
    return storage?.getItem?.(key) ?? null;
  } catch {
    return null;
  }
}

function safeSet(storage, key, value) {
  try {
    storage?.setItem?.(key, value);
    return true;
  } catch {
    return false;
  }
}

function safeRemove(storage, key) {
  try {
    storage?.removeItem?.(key);
  } catch {
    // Recovery-markører er kun UX-støtte.
  }
}

function parseJson(raw) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function parseBackgroundMarker(raw) {
  return parseJson(raw);
}

function normalizeNavigation(value = null) {
  if (!value || typeof value !== "object") return null;
  const mode = String(value.mode || "detail").trim() || "detail";
  const selectedRequestId = String(value.selectedRequestId || "").trim();

  // Ny forespørsel / nytt direkte tilbud finnes ennå ikke på server og har derfor
  // ingen request_ref. Arbeidsbildet må likevel overleve SMS, Outlook, annen fane
  // og mobil dvale uten at brukeren sendes tilbake til Startsiden.
  if (REQUEST_ID_OPTIONAL_MODES.has(mode)) {
    return { mode, selectedRequestId: null };
  }

  if (!selectedRequestId) return null;
  return {
    mode,
    selectedRequestId,
  };
}

export function isFreshSalesBackgroundResumeMarker(
  marker,
  { now = Date.now(), storageKey = "" } = {}
) {
  if (!marker || typeof marker !== "object") return false;
  const markerStorageKey = String(marker.storageKey || "").trim();
  if (!markerStorageKey) return false;
  if (storageKey && markerStorageKey !== String(storageKey).trim()) return false;

  const age = Number(now) - Number(marker.at || 0);
  return (
    Number.isFinite(age) &&
    age >= 0 &&
    age <= SALES_BACKGROUND_RESUME_MAX_AGE_MS
  );
}

export function markSalesWorkspaceResumeSnapshot(
  { storageKey = "", navigation = null } = {},
  { localStorage, now = Date.now() } = {}
) {
  const local = resolveStorage(localStorage, "localStorage");
  const normalizedStorageKey = String(storageKey || "").trim();
  const normalizedNavigation = normalizeNavigation(navigation);

  return safeSet(
    local,
    SALES_WORKSPACE_RESUME_KEY,
    JSON.stringify({
      at: Number(now),
      storageKey: normalizedStorageKey,
      navigation: normalizedNavigation,
    })
  );
}

export function readSalesWorkspaceResumeSnapshot({
  localStorage,
  now = Date.now(),
} = {}) {
  const local = resolveStorage(localStorage, "localStorage");
  const snapshot = parseJson(safeGet(local, SALES_WORKSPACE_RESUME_KEY));
  if (!snapshot) return null;

  const age = Number(now) - Number(snapshot.at || 0);
  if (
    !Number.isFinite(age) ||
    age < 0 ||
    age > SALES_BACKGROUND_RESUME_MAX_AGE_MS
  ) {
    safeRemove(local, SALES_WORKSPACE_RESUME_KEY);
    return null;
  }

  return {
    at: Number(snapshot.at || 0),
    storageKey: String(snapshot.storageKey || "").trim(),
    navigation: normalizeNavigation(snapshot.navigation),
  };
}

export function clearSalesWorkspaceResumeSnapshot({ localStorage } = {}) {
  const local = resolveStorage(localStorage, "localStorage");
  safeRemove(local, SALES_WORKSPACE_RESUME_KEY);
}

export function armSalesNavigationRestore({ sessionStorage } = {}) {
  const session = resolveStorage(sessionStorage, "sessionStorage");
  safeSet(session, SALES_RELOAD_TAB_KEY, "1");
  safeSet(session, SALES_RELOAD_NAVIGATION_KEY, "1");
}

export function restoreSalesWorkspaceNavigation(
  snapshot,
  { localStorage, sessionStorage } = {}
) {
  if (!snapshot || typeof snapshot !== "object") return false;

  const local = resolveStorage(localStorage, "localStorage");
  const storageKey = String(snapshot.storageKey || "").trim();
  const navigation = normalizeNavigation(snapshot.navigation);

  if (storageKey && navigation) {
    safeSet(local, `${storageKey}:navigation`, JSON.stringify(navigation));
  }

  armSalesNavigationRestore({ sessionStorage });
  return true;
}

export function isInternalSalesRecoverySearch(search = "") {
  try {
    const params = new URLSearchParams(String(search || ""));
    if (params.get("publicOffer") || params.get("publicContract")) return false;
    if (params.get("privateDocument") === "1") return false;
    const access = String(params.get("access") || params.get("role") || "")
      .trim()
      .toLowerCase();
    if (
      access === "customer" ||
      access === "kunde" ||
      access === "ue" ||
      access === "underleverandor" ||
      access === "underleverandør" ||
      access === "underentreprenør"
    ) {
      return false;
    }
    return true;
  } catch {
    return true;
  }
}

export function shouldBootstrapRestoreSales({
  sessionStorage,
  localStorage,
  now = Date.now(),
  search =
    typeof window !== "undefined" ? window.location.search : "",
} = {}) {
  // Bootstrap må aldri dra en offentlig kunde-/kontrakts-/portalrute tilbake
  // til intern Befaring/Tilbud, selv om nettleseren har ferske recovery-markører.
  if (!isInternalSalesRecoverySearch(search)) return false;

  const session = resolveStorage(sessionStorage, "sessionStorage");
  const local = resolveStorage(localStorage, "localStorage");

  if (safeGet(session, SALES_RELOAD_TAB_KEY) === "1") return true;

  const raw = safeGet(local, SALES_BACKGROUND_RESUME_KEY);
  if (raw) {
    const marker = parseBackgroundMarker(raw);
    const shouldRestore = isFreshSalesBackgroundResumeMarker(marker, { now });
    if (!shouldRestore) safeRemove(local, SALES_BACKGROUND_RESUME_KEY);
    if (shouldRestore) return true;
  }

  const workspaceSnapshot = readSalesWorkspaceResumeSnapshot({
    localStorage: local,
    now,
  });
  if (!workspaceSnapshot) return false;

  // Dersom vanlig React/Sales-cleanup allerede har fjernet de eldre markørene,
  // re-armer bootstrap dem fra det uavhengige arbeidsbilde-snapshotet.
  restoreSalesWorkspaceNavigation(workspaceSnapshot, {
    localStorage: local,
    sessionStorage: session,
  });
  return true;
}

export function markSalesResumeForBackground(
  storageKey,
  { sessionStorage, localStorage, now = Date.now() } = {}
) {
  const normalizedStorageKey = String(storageKey || "").trim();
  if (!normalizedStorageKey) return;

  const session = resolveStorage(sessionStorage, "sessionStorage");
  const local = resolveStorage(localStorage, "localStorage");

  // Forsøk lagrene uavhengig. Safari/private mode kan avvise sessionStorage
  // samtidig som localStorage fortsatt er tilgjengelig.
  safeSet(session, SALES_RELOAD_TAB_KEY, "1");
  safeSet(session, SALES_RELOAD_NAVIGATION_KEY, "1");
  safeSet(
    local,
    SALES_BACKGROUND_RESUME_KEY,
    JSON.stringify({ at: Number(now), storageKey: normalizedStorageKey })
  );

  // Fang arbeidsbildet i samme synkrone operasjon som SalesModule faktisk kaller
  // ved visibilitychange/pagehide. Da er vi ikke avhengige av listener-rekkefølge,
  // microtasks eller at en bestemt React-komponent fortsatt finnes i DOM-et.
  const navigation = parseJson(
    safeGet(local, `${normalizedStorageKey}:navigation`)
  );
  markSalesWorkspaceResumeSnapshot(
    { storageKey: normalizedStorageKey, navigation },
    { localStorage: local, now }
  );
}

export function consumeSalesResumeNavigation(
  storageKey,
  { sessionStorage, localStorage, now = Date.now() } = {}
) {
  const normalizedStorageKey = String(storageKey || "").trim();
  const session = resolveStorage(sessionStorage, "sessionStorage");
  const local = resolveStorage(localStorage, "localStorage");

  let shouldRestore = safeGet(session, SALES_RELOAD_NAVIGATION_KEY) === "1";
  safeRemove(session, SALES_RELOAD_NAVIGATION_KEY);
  safeRemove(session, SALES_RELOAD_TAB_KEY);

  const raw = safeGet(local, SALES_BACKGROUND_RESUME_KEY);
  if (!shouldRestore && raw) {
    const marker = parseBackgroundMarker(raw);
    shouldRestore = isFreshSalesBackgroundResumeMarker(marker, {
      now,
      storageKey: normalizedStorageKey,
    });
  }

  safeRemove(local, SALES_BACKGROUND_RESUME_KEY);
  return shouldRestore;
}

export function clearSalesResumeMarkers({
  sessionStorage,
  localStorage,
  preserveWorkspace,
} = {}) {
  const useBrowserDefaults =
    sessionStorage === undefined && localStorage === undefined;
  const keepWorkspace = preserveWorkspace ?? useBrowserDefaults;
  const session = resolveStorage(sessionStorage, "sessionStorage");
  const local = resolveStorage(localStorage, "localStorage");

  safeRemove(session, SALES_RELOAD_TAB_KEY);
  safeRemove(session, SALES_RELOAD_NAVIGATION_KEY);
  safeRemove(local, SALES_BACKGROUND_RESUME_KEY);

  // SalesModule kaller denne uten argumenter når en synlig fane er tilbake eller
  // React unmountes. Da må arbeidsbilde-snapshotet overleve akkurat lenge nok til
  // at den globale foreground-vakten kan reparere eventuell Startside-reset.
  // Eksplisitte kall med lagre (tester/hard clear) rydder derimot alt.
  if (!keepWorkspace) {
    safeRemove(local, SALES_WORKSPACE_RESUME_KEY);
  }
}

export function shouldCancelSalesRecoveryForTrustedInteraction({
  isTrusted = false,
  visibilityState = "visible",
  internalRoute = true,
} = {}) {
  return Boolean(
    isTrusted &&
      visibilityState !== "hidden" &&
      internalRoute
  );
}

function isInternalSalesRoute() {
  if (typeof window === "undefined") return false;
  return isInternalSalesRecoverySearch(window.location.search);
}

function salesSurfaceIsMounted() {
  if (typeof document === "undefined") return false;
  return Boolean(document.querySelector(".sales-app"));
}

function findSalesTabButton() {
  if (typeof document === "undefined") return null;
  return (
    Array.from(document.querySelectorAll("button")).find(
      (button) =>
        String(button.textContent || "")
          .replace(/\s+/g, " ")
          .trim() === "Befaring/Tilbud"
    ) || null
  );
}

function captureCurrentSalesWorkspace() {
  if (!isInternalSalesRoute() || !salesSurfaceIsMounted()) return;
  const local = browserStorage("localStorage");

  // SalesModule skriver den vanlige bakgrunnsmarkøren i samme visibilitychange-
  // event. Kjøring i microtask gjør at vi kan hente korrekt bruker/firmascope og
  // den sist lagrede interne modusen (f.eks. offer-builder/inspection-note).
  const background = parseBackgroundMarker(
    safeGet(local, SALES_BACKGROUND_RESUME_KEY)
  );
  const storageKey = String(background?.storageKey || "").trim();
  const navigation = storageKey
    ? parseJson(safeGet(local, `${storageKey}:navigation`))
    : null;

  markSalesWorkspaceResumeSnapshot(
    { storageKey, navigation },
    { localStorage: local }
  );
}

function scheduleCaptureCurrentSalesWorkspace() {
  if (!isInternalSalesRoute() || !salesSurfaceIsMounted()) return;
  if (typeof queueMicrotask === "function") {
    queueMicrotask(captureCurrentSalesWorkspace);
  } else if (typeof window !== "undefined") {
    window.setTimeout(captureCurrentSalesWorkspace, 0);
  }
}

function currentNavigationForSnapshot(snapshot, local) {
  if (!snapshot?.storageKey) return null;
  return normalizeNavigation(
    parseJson(safeGet(local, `${snapshot.storageKey}:navigation`))
  );
}

function navigationMatches(left, right) {
  if (!left || !right) return left === right;
  return (
    String(left.mode || "") === String(right.mode || "") &&
    String(left.selectedRequestId || "") === String(right.selectedRequestId || "")
  );
}

function tryRecoverSalesWorkspace() {
  if (
    typeof window === "undefined" ||
    typeof document === "undefined" ||
    document.visibilityState === "hidden" ||
    !isInternalSalesRoute()
  ) {
    return false;
  }

  const local = browserStorage("localStorage");
  const session = browserStorage("sessionStorage");
  const snapshot = readSalesWorkspaceResumeSnapshot({ localStorage: local });
  if (!snapshot) return false;

  if (salesSurfaceIsMounted()) {
    const expectedNavigation = normalizeNavigation(snapshot.navigation);
    const currentNavigation = currentNavigationForSnapshot(snapshot, local);

    // Hvis hovedfanen overlevde, men React/auth-refresh har flyttet selve
    // arbeidsbildet (f.eks. Rediger tilbud -> detalj/list), legg snapshotet tilbake
    // og remount kun Sales-kjernen. Ingen andre app-funksjoner berøres.
    if (
      snapshot.storageKey &&
      expectedNavigation &&
      !navigationMatches(expectedNavigation, currentNavigation)
    ) {
      restoreSalesWorkspaceNavigation(snapshot, {
        localStorage: local,
        sessionStorage: session,
      });
      window.dispatchEvent(new CustomEvent("expo-proffdok-sales-rehydrate"));
      return true;
    }

    return false;
  }

  const salesButton = findSalesTabButton();
  if (!(salesButton instanceof HTMLButtonElement)) return false;

  // Hovedappen er blitt sendt til Startsiden mens fanen var i bakgrunnen.
  // Re-armer navigasjonen rett før vi åpner Sales, slik at wrapperens normale
  // mount beholder offer-builder/befaringsnotat i stedet for å nullstille til list.
  // Snapshotet beholdes gjennom hele returfasen; auth/React kan fortsatt remounte
  // hovedappen etter første vellykkede åpning. Neste ekte brukerinteraksjon i den
  // interne appen avslutter derimot recovery umiddelbart, uansett arbeidsflate.
  restoreSalesWorkspaceNavigation(snapshot, {
    localStorage: local,
    sessionStorage: session,
  });
  salesButton.click();
  return true;
}

function scheduleSalesWorkspaceRecovery() {
  if (typeof window === "undefined") return;
  for (const delay of RESUME_RETRY_DELAYS_MS) {
    window.setTimeout(() => {
      if (tryRecoverSalesWorkspace()) return;
    }, delay);
  }
}

export function installSalesBackgroundResumeGuard() {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (window[SALES_RESUME_GUARD_FLAG]) return;
  window[SALES_RESUME_GUARD_FLAG] = true;

  const onVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      scheduleCaptureCurrentSalesWorkspace();
      return;
    }
    scheduleSalesWorkspaceRecovery();
  };

  const onPageHide = () => {
    scheduleCaptureCurrentSalesWorkspace();
  };

  const cancelRecoveryAfterTrustedAppInteraction = (event) => {
    if (
      !shouldCancelSalesRecoveryForTrustedInteraction({
        isTrusted: Boolean(event?.isTrusted),
        visibilityState: document.visibilityState,
        internalRoute: isInternalSalesRoute(),
      })
    ) {
      return;
    }

    // Når brukeren faktisk gjør noe i appen igjen, er foreground-recovery ferdig.
    // Rydd alle midlertidige markører FØR React/button-handleren kjører, slik at
    // senere retry-timere aldri kan reversere Tilbake/Lagre/Avbryt/menyvalg.
    clearSalesResumeMarkers({ preserveWorkspace: false });
  };

  document.addEventListener("visibilitychange", onVisibilityChange);
  window.addEventListener("pagehide", onPageHide);
  window.addEventListener("pageshow", scheduleSalesWorkspaceRecovery);
  window.addEventListener("focus", scheduleSalesWorkspaceRecovery);
  document.addEventListener(
    "pointerdown",
    cancelRecoveryAfterTrustedAppInteraction,
    true
  );
  document.addEventListener(
    "keydown",
    cancelRecoveryAfterTrustedAppInteraction,
    true
  );
}

// Modulen importeres både av bootstrap og SalesModule. Installer én global,
// passiv resume-vakt så den fortsatt lever dersom React-fanen blir unmountet.
installSalesBackgroundResumeGuard();
