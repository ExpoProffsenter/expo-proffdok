// Expo ProffDok – FASE 42I / FASE 42F / FASE 42A / FASE 39B.2C / FASE 38A1
// FASE 42I gjør server-first-gaten saksspesifikk: saksoversikten kan åpnes på en
// lett serverprojeksjon, mens reload/dvale/direkte åpning av én sak fortsatt primer
// akkurat den komplette saken før SalesCore får mounte. Ingen tom summary kan nå editor.
// FASE 42F deler recovery-markører med bootstrap og lar localStorage-recovery
// overleve selv om sessionStorage er utilgjengelig. Bevisst utgang fra Sales rydder markørene.

import { useEffect, useState } from "react";
import "./storeOfferTextBlocks.css";
import SalesModuleCore from "./SalesModuleCore.jsx";
import SalesContractCustomerView from "./components/SalesContractCustomerView.jsx";
import {
  beginOfferDraftHydrationCycle,
  buildSalesStorageKey,
  loadSalesNavigation,
  saveSalesNavigation,
} from "./services/salesLocalStorage.js";
import {
  clearSalesResumeMarkers,
  consumeSalesResumeNavigation,
  markSalesResumeForBackground,
} from "./services/salesResumeRecovery.mjs";
import {
  createDefaultSalesSupabaseClient,
  primeSalesRequestDetailRow,
  resolveSalesCompanyScope,
} from "./services/salesSupabase.js";
import { shouldGateSalesCoreUntilServerCache } from "./services/salesServerCacheHydration.mjs";
import { markStoreOfferLaunch } from "./services/salesStoreOffers.js";
import {
  MODULE_ACCESS_EVENT,
  hasModuleAccess,
  readCachedModuleAccess,
  refreshMyModuleAccess,
} from "../access/moduleAccessClient.js";

const SALES_REOPEN_INSPECTION_KEY = "expo-proffdok:sales:reopen-inspection-after-reload";
const SALES_OVERVIEW_INTRO_MARKER = "salesOverviewIntro";
const fallbackSalesSupabase = createDefaultSalesSupabaseClient();

function compactText(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function salesStorageKeyForProps(props = {}) {
  return buildSalesStorageKey({
    integrationMode: props.integrationMode || "preview",
    companyName:
      props.profile?.company_name || props.profile?.companyName || "",
    userId: props.authUser?.id || "anonymous",
  });
}

function rememberInspectionReopen(requestId = "") {
  const normalized = String(requestId || "").trim();
  if (!normalized) return;
  try {
    window.sessionStorage?.setItem(SALES_REOPEN_INSPECTION_KEY, normalized);
  } catch {
    // Kun UX-gjenoppretting. Lokal inspeksjonskladd er fortsatt fasit.
  }
}

function protectInspectionDraftNavigation(props = {}) {
  const salesStorageKey = salesStorageKeyForProps(props);
  const navigation = loadSalesNavigation(salesStorageKey);

  if (
    navigation?.mode === "inspection-note" &&
    navigation?.selectedRequestId
  ) {
    rememberInspectionReopen(navigation.selectedRequestId);
    saveSalesNavigation(
      salesStorageKey,
      "detail",
      navigation.selectedRequestId
    );
  }
}

function clearBackgroundResumeMarkers() {
  clearSalesResumeMarkers();
}

function consumeSalesReloadNavigationMarker(props = {}) {
  if (props.integrationMode !== "app") return false;
  return consumeSalesResumeNavigation(salesStorageKeyForProps(props));
}

function prepareSalesEntryNavigation(props = {}) {
  if (props.integrationMode !== "app") {
    protectInspectionDraftNavigation(props);
    return;
  }

  const shouldRestoreNavigation = consumeSalesReloadNavigationMarker(props);
  if (shouldRestoreNavigation) {
    protectInspectionDraftNavigation(props);
    return;
  }

  // Vanlig klikk på Forespørsler/Befaring/Tilbud lander på oversikten. Bare en
  // ekte reload/dvale får gjenåpne lagret sak. Direkte startside-signal håndteres
  // separat og primes før Core mountes.
  saveSalesNavigation(salesStorageKeyForProps(props), "list", null);
}

function markSalesTabForReload(props = {}) {
  if (props.integrationMode !== "app") return;
  markSalesResumeForBackground(salesStorageKeyForProps(props));
}

function getPublicContractToken() {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("publicContract") || "";
}

function findSalesOverviewIntro() {
  const marked = document.querySelector(`[data-${SALES_OVERVIEW_INTRO_MARKER.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}="1"]`);
  if (marked instanceof HTMLParagraphElement) return marked;

  return Array.from(document.querySelectorAll("p.note")).find((note) => {
    const text = compactText(note.textContent);
    return text.startsWith("Opprett og følg en forespørsel gjennom befaring, tilbud, kundeaksept") ||
      text.startsWith("Her håndterer du forespørsler, våtromstilbud og butikktilbud") ||
      text.startsWith("Opprett og følg varebaserte Butikktilbud") ||
      text.startsWith("Opprett og følg forespørsler og våtromstilbud");
  }) || null;
}

function setSalesOverviewIntro(type = "all") {
  const note = findSalesOverviewIntro();
  if (!(note instanceof HTMLParagraphElement)) return false;

  note.dataset[SALES_OVERVIEW_INTRO_MARKER] = "1";
  if (type === "store") {
    note.textContent = "Opprett og følg varebaserte Butikktilbud med eventuell montering frem til kundeaksept. Butikktilbud avsluttes ved aksept og opprettes ikke som ProffDok-prosjekt.";
    return true;
  }
  if (type === "wetroom") {
    note.textContent = "Opprett og følg forespørsler og Våtromstilbud gjennom befaring, tilbud og kundeaksept. Akseptert Våtromstilbud kan aktiveres som ProffDok-prosjekt.";
    return true;
  }

  note.textContent = "Her håndterer du forespørsler, Våtromstilbud og Butikktilbud. Våtromstilbud kan gå videre til ProffDok-prosjekt etter aksept, mens Butikktilbud avsluttes ved aksept.";
  return true;
}

function OfferTypePicker({ canUseStoreOffers, onWetroom, onStore, onClose }) {
  return (
    <div
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10020,
        background: "rgba(5, 18, 25, 0.42)",
        display: "grid",
        placeItems: "center",
        padding: 18,
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="sales-offer-type-title"
        style={{
          width: "min(560px, 100%)",
          borderRadius: 20,
          background: "#fff",
          padding: 22,
          boxShadow: "0 24px 70px rgba(5,18,25,.28)",
        }}
      >
        <h2 id="sales-offer-type-title" style={{ margin: "0 0 7px" }}>
          Nytt tilbud
        </h2>
        <p className="note" style={{ marginTop: 0 }}>
          Velg tilbudstype. Dette oppretter et tilbud direkte og endrer ikke Ny forespørsel eller befaringsflyten.
        </p>

        <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
          <button
            type="button"
            onClick={onWetroom}
            style={{ textAlign: "left", padding: "14px 16px" }}
          >
            <strong style={{ display: "block" }}>Våtromstilbud</strong>
            <small style={{ display: "block", marginTop: 4, fontWeight: 600 }}>
              Opprett ordinært tilbud direkte uten å registrere befaring først.
            </small>
          </button>

          {canUseStoreOffers ? (
            <button
              type="button"
              className="secondary"
              onClick={onStore}
              style={{ textAlign: "left", padding: "14px 16px" }}
            >
              <strong style={{ display: "block" }}>Butikktilbud</strong>
              <small style={{ display: "block", marginTop: 4, fontWeight: 600 }}>
                Varebasert tilbud med eventuell montering. Avsluttes ved kundeaksept.
              </small>
            </button>
          ) : null}
        </div>

        <button
          type="button"
          className="secondary"
          onClick={onClose}
          style={{ marginTop: 14 }}
        >
          Avbryt
        </button>
      </section>
    </div>
  );
}

export default function SalesModule(props) {
  const [instanceKey, setInstanceKey] = useState(() => {
    beginOfferDraftHydrationCycle();
    prepareSalesEntryNavigation(props);
    return 0;
  });
  const [storeOfferSignal, setStoreOfferSignal] = useState(0);
  const [standardOfferSignal, setStandardOfferSignal] = useState(0);
  const [offerTypePickerOpen, setOfferTypePickerOpen] = useState(false);
  const [moduleAccess, setModuleAccess] = useState(() => readCachedModuleAccess());
  const [serverCacheReady, setServerCacheReady] = useState(
    () => props.integrationMode !== "app"
  );
  const [serverCacheError, setServerCacheError] = useState("");
  const [serverCacheRetryKey, setServerCacheRetryKey] = useState(0);

  useEffect(() => {
    const rehydrateSalesModule = () => {
      protectInspectionDraftNavigation(props);
      beginOfferDraftHydrationCycle();
      // En recovery-remount skal aldri få arve en gammel «ready»-tilstand. Lukk
      // server-first-gaten i samme render som instanceKey endres; prime-effekten
      // under kjører deretter på instanceKey og åpner først når full sak er klar.
      setServerCacheError("");
      setServerCacheReady(false);
      setInstanceKey((current) => current + 1);
    };

    const blockPreHydrationUnloadSave = () => {
      markSalesTabForReload(props);
      beginOfferDraftHydrationCycle();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        markSalesTabForReload(props);
        return;
      }
      clearBackgroundResumeMarkers();
    };

    window.addEventListener(
      "expo-proffdok-sales-rehydrate",
      rehydrateSalesModule
    );
    window.addEventListener("beforeunload", blockPreHydrationUnloadSave);
    window.addEventListener("pagehide", blockPreHydrationUnloadSave);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener(
        "expo-proffdok-sales-rehydrate",
        rehydrateSalesModule
      );
      window.removeEventListener("beforeunload", blockPreHydrationUnloadSave);
      window.removeEventListener("pagehide", blockPreHydrationUnloadSave);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      // Bevisst navigasjon bort fra Sales skal aldri gjenopplive en gammel sak.
      clearBackgroundResumeMarkers();
    };
  }, []);

  useEffect(() => {
    if (props.integrationMode !== "app") return undefined;

    let disposed = false;
    const syncAccess = (event) => {
      if (disposed) return;
      setModuleAccess(event?.detail || readCachedModuleAccess());
    };

    window.addEventListener(MODULE_ACCESS_EVENT, syncAccess);
    refreshMyModuleAccess(props.supabaseClient)
      .then((access) => {
        if (!disposed) setModuleAccess(access);
      })
      .catch(() => {
        if (!disposed) setModuleAccess(readCachedModuleAccess());
      });

    return () => {
      disposed = true;
      window.removeEventListener(MODULE_ACCESS_EVENT, syncAccess);
    };
  }, [props.integrationMode, props.supabaseClient, props.authUser?.id]);

  useEffect(() => {
    if (props.integrationMode !== "app") {
      setServerCacheError("");
      setServerCacheReady(true);
      return undefined;
    }

    if (!props.authUser?.id) {
      setServerCacheError("");
      setServerCacheReady(false);
      return undefined;
    }

    const storageKey = salesStorageKeyForProps(props);
    const navigation = loadSalesNavigation(storageKey);
    const directRequestId = String(props.openRequestSignal || "").trim();
    const resumedRequestId =
      navigation?.mode && navigation.mode !== "list"
        ? String(navigation?.selectedRequestId || "").trim()
        : "";
    const requestIdToPrime = directRequestId || resumedRequestId;

    // Vanlig saksoversikt trenger ingen komplett payload før Core mountes.
    if (!requestIdToPrime) {
      setServerCacheError("");
      setServerCacheReady(true);
      return undefined;
    }

    let cancelled = false;
    const activeSupabase = props.supabaseClient || fallbackSalesSupabase;
    setServerCacheError("");
    setServerCacheReady(false);

    async function primeSelectedSalesRequestBeforeCore() {
      try {
        if (!activeSupabase) {
          throw new Error("Supabase er ikke tilgjengelig.");
        }

        const { data: companyId, error: companyError } =
          await resolveSalesCompanyScope(activeSupabase);
        if (companyError || !companyId) {
          throw companyError || new Error("Firmatilknytningen kunne ikke bekreftes.");
        }

        const { error } = await primeSalesRequestDetailRow(
          activeSupabase,
          companyId,
          requestIdToPrime
        );
        if (error) throw error;
        if (cancelled) return;
        setServerCacheError("");
        setServerCacheReady(true);
      } catch (error) {
        // Lokal tilbuds-/befaringskladd beholdes urørt ved nettfeil. Core får ikke
        // mounte på en lett summary, fordi ufullstendig data aldri skal nå editor.
        console.warn(
          "Kunne ikke prime valgt Sales-sak før mount; blokkerer ufullstendig summary",
          error
        );
        if (!cancelled) {
          setServerCacheError(
            error?.message ||
              "Den komplette saken kunne ikke hentes fra serveren. Kontroller nettet og prøv igjen."
          );
          setServerCacheReady(false);
        }
      }
    }

    void primeSelectedSalesRequestBeforeCore();
    return () => {
      cancelled = true;
    };
  }, [
    props.integrationMode,
    props.supabaseClient,
    props.authUser?.id,
    props.profile?.company_name,
    props.profile?.companyName,
    props.openRequestSignal,
    instanceKey,
    serverCacheRetryKey,
  ]);

  useEffect(() => {
    if (props.integrationMode !== "app") return undefined;

    let requestId = "";
    try {
      requestId = String(window.sessionStorage?.getItem(SALES_REOPEN_INSPECTION_KEY) || "").trim();
    } catch {
      requestId = "";
    }
    if (!requestId) return undefined;

    let cancelled = false;
    let timer = null;
    let attempts = 0;

    const tryReopenInspection = () => {
      if (cancelled) return;
      attempts += 1;

      const navigation = loadSalesNavigation(salesStorageKeyForProps(props));
      const correctRequest = String(navigation?.selectedRequestId || "") === requestId;
      const buttons = Array.from(document.querySelectorAll("button"));
      const inspectionButton = correctRequest
        ? buttons.find((button) => {
            const text = compactText(button.textContent).toLowerCase();
            return text === "befaringsnotat" || text.includes("fullfør befaringsnotat");
          })
        : null;

      if (inspectionButton instanceof HTMLButtonElement) {
        try {
          window.sessionStorage?.removeItem(SALES_REOPEN_INSPECTION_KEY);
        } catch {
          // Markøren er kun UX-støtte.
        }
        inspectionButton.click();
        return;
      }

      if (attempts < 50) {
        timer = window.setTimeout(tryReopenInspection, 120);
      }
    };

    timer = window.setTimeout(tryReopenInspection, 80);
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [instanceKey, props.integrationMode, props.authUser?.id, props.profile?.company_name, props.profile?.companyName]);

  useEffect(() => {
    if (props.integrationMode !== "app") return undefined;

    let frame = window.requestAnimationFrame(() => setSalesOverviewIntro("all"));
    const onOfferFilterClick = (event) => {
      const button = event.target instanceof Element ? event.target.closest("button") : null;
      if (!(button instanceof HTMLButtonElement)) return;
      if (!button.closest('[aria-label="Søk og filtrering"]')) return;

      const text = compactText(button.textContent);
      let type = "";
      if (text.startsWith("Butikktilbud")) type = "store";
      else if (text.startsWith("Våtromstilbud")) type = "wetroom";
      else if (text.startsWith("Alle tilbud")) type = "all";
      if (!type) return;

      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => setSalesOverviewIntro(type));
    };

    document.addEventListener("click", onOfferFilterClick);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("click", onOfferFilterClick);
    };
  }, [props.integrationMode]);

  const publicContractToken =
    props.integrationMode === "public" ? getPublicContractToken() : "";

  const canUseSales =
    props.integrationMode === "app" &&
    moduleAccess.loaded &&
    hasModuleAccess(moduleAccess, "sales");
  const canUseStoreOffers =
    canUseSales && hasModuleAccess(moduleAccess, "store_offers");

  useEffect(() => {
    if (
      props.integrationMode !== "app" ||
      !props.startNewOfferSignal ||
      !moduleAccess.loaded ||
      !canUseStoreOffers
    ) {
      return;
    }

    setOfferTypePickerOpen(true);
    props.onStartNewOfferHandled?.();
  }, [
    props.integrationMode,
    props.startNewOfferSignal,
    moduleAccess.loaded,
    canUseStoreOffers,
  ]);

  if (publicContractToken) {
    return (
      <SalesContractCustomerView
        supabaseClient={props.supabaseClient}
        contractToken={publicContractToken}
      />
    );
  }

  const gateSalesCore = shouldGateSalesCoreUntilServerCache({
    integrationMode: props.integrationMode,
    authUserId: props.authUser?.id,
    serverCacheReady,
  });

  if (gateSalesCore && serverCacheError) {
    return (
      <div className="sales-app">
        <div className="sales-shell">
          <main className="sales-main">
            <section className="sales-form-hero" role="alert">
              <p className="sales-eyebrow">Forespørsler / Befaring / Tilbud</p>
              <h1 className="sales-title">Komplett sak kunne ikke hentes</h1>
              <p className="sales-subtitle">
                {serverCacheError} Lokal kladd er beholdt urørt. Vi åpner ikke
                saken på ufullstendig listedata.
              </p>
              <button
                type="button"
                className="sales-primary-button"
                onClick={() =>
                  setServerCacheRetryKey((current) => current + 1)
                }
                style={{ marginTop: 14 }}
              >
                Prøv igjen
              </button>
            </section>
          </main>
        </div>
      </div>
    );
  }

  if (gateSalesCore) {
    return (
      <div className="sales-app">
        <div className="sales-shell">
          <main className="sales-main">
            <section className="sales-form-hero" role="status" aria-live="polite">
              <p className="sales-eyebrow">Forespørsler / Befaring / Tilbud</p>
              <h1 className="sales-title">Henter valgt sak fra server …</h1>
              <p className="sales-subtitle">
                Vi henter den komplette serverversjonen før saken åpnes. Dette
                beskytter tilbud, bilder og recovery uten å laste alle andre saker.
              </p>
            </section>
          </main>
        </div>
      </div>
    );
  }

  const originalOfferSignal =
    props.integrationMode !== "app"
      ? props.startNewOfferSignal
      : moduleAccess.loaded && !canUseStoreOffers
        ? props.startNewOfferSignal
        : 0;
  const forwardedStartNewOfferSignal =
    storeOfferSignal || standardOfferSignal || originalOfferSignal || 0;

  const startWetroomOffer = () => {
    if (!canUseSales) return;
    setOfferTypePickerOpen(false);
    setStandardOfferSignal(Date.now());
  };

  const startStoreOffer = () => {
    if (!canUseStoreOffers) return;
    setOfferTypePickerOpen(false);
    markStoreOfferLaunch();
    setStoreOfferSignal(Date.now());
  };

  const startDirectOffer = () => {
    if (!canUseSales) return;
    if (canUseStoreOffers) {
      setOfferTypePickerOpen(true);
      return;
    }
    startWetroomOffer();
  };

  const handleStartNewOfferHandled = () => {
    if (storeOfferSignal) {
      setStoreOfferSignal(0);
      return;
    }
    if (standardOfferSignal) {
      setStandardOfferSignal(0);
      return;
    }
    props.onStartNewOfferHandled?.();
  };

  return (
    <>
      {canUseSales ? (
        <div
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            padding: "10px 16px 0",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            type="button"
            className="secondary"
            onClick={startDirectOffer}
            style={{ whiteSpace: "nowrap" }}
          >
            + Nytt tilbud
          </button>
        </div>
      ) : null}

      {offerTypePickerOpen ? (
        <OfferTypePicker
          canUseStoreOffers={canUseStoreOffers}
          onWetroom={startWetroomOffer}
          onStore={startStoreOffer}
          onClose={() => setOfferTypePickerOpen(false)}
        />
      ) : null}

      <SalesModuleCore
        key={instanceKey}
        {...props}
        startNewOfferSignal={forwardedStartNewOfferSignal}
        onStartNewOfferHandled={handleStartNewOfferHandled}
      />
    </>
  );
}
