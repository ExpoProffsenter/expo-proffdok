// Expo ProffDok – FASE 42A / FASE 39B.2C / FASE 38A1 / FASE 37D1
// FASE 42A gjør Sales robust når mobil Safari legger appen i dvale: aktiv sak og
// befaringsnotat gjenåpnes etter reload/remount uten å omgå eksisterende lokal
// kladd-/recoveryflyt. Ingen SQL/RLS/Storage-policy-endring.
// FASE 39B.2C skiller vanlig inngang til Befaring/Tilbud fra faktisk side-reload:
// vanlig inngang åpner alltid sakslisten, mens reload inne i Sales kan gjenåpne samme sak.
// FASE 38A1 lar serverstyrt modultilgang avgjøre hvilke direkte tilbudstyper brukeren kan starte.
// + Ny forespørsel og eksisterende Befaring/Tilbud-flyt er urørt. + Nytt tilbud er én inngang:
// Våtromstilbud for Sales-brukere, og i tillegg Butikktilbud når store_offers er tildelt.
// Firma/org.nr. er ikke tilgangskontroll. Samme rettighet projiseres i meny og Hjelp.
// Tynn sikkerhets-wrapper rundt eksisterende SalesModule.
// FASE 37D1 legger Butikktilbud oppå samme tilbudsmotor uten å kopiere
// publisering, kundelenke, PDF, aksept eller e-postlogikk.

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
import { markStoreOfferLaunch } from "./services/salesStoreOffers.js";
import {
  MODULE_ACCESS_EVENT,
  hasModuleAccess,
  readCachedModuleAccess,
  refreshMyModuleAccess,
} from "../access/moduleAccessClient.js";

const SALES_RELOAD_TAB_KEY = "expo-proffdok:sales:restore-tab-after-reload";
const SALES_RELOAD_NAVIGATION_KEY = "expo-proffdok:sales:restore-navigation-after-reload";
const SALES_BACKGROUND_RESUME_KEY = "expo-proffdok:sales:background-resume-v1";
const SALES_REOPEN_INSPECTION_KEY = "expo-proffdok:sales:reopen-inspection-after-reload";
const SALES_BACKGROUND_RESUME_MAX_AGE_MS = 2 * 60 * 60 * 1000;
const SALES_OVERVIEW_INTRO_MARKER = "salesOverviewIntro";

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
    // Core åpnes først på trygg saksdetalj. Wrapperen gjenåpner deretter
    // befaringsnotatet via eksisterende openInspectionNote(), som laster lokal
    // kladd/skisse på samme måte som et vanlig brukerklikk.
    rememberInspectionReopen(navigation.selectedRequestId);
    saveSalesNavigation(
      salesStorageKey,
      "detail",
      navigation.selectedRequestId
    );
  }
}

function clearBackgroundResumeMarkers() {
  try {
    window.localStorage?.removeItem(SALES_BACKGROUND_RESUME_KEY);
    window.sessionStorage?.removeItem(SALES_RELOAD_TAB_KEY);
    window.sessionStorage?.removeItem(SALES_RELOAD_NAVIGATION_KEY);
  } catch {
    // UX-markører er valgfrie.
  }
}

function consumeSalesReloadNavigationMarker(props = {}) {
  if (props.integrationMode !== "app") return false;
  const salesStorageKey = salesStorageKeyForProps(props);

  try {
    let shouldRestore =
      window.sessionStorage?.getItem(SALES_RELOAD_NAVIGATION_KEY) === "1";

    window.sessionStorage?.removeItem(SALES_RELOAD_NAVIGATION_KEY);
    window.sessionStorage?.removeItem(SALES_RELOAD_TAB_KEY);

    if (!shouldRestore) {
      const raw = window.localStorage?.getItem(SALES_BACKGROUND_RESUME_KEY);
      if (raw) {
        try {
          const marker = JSON.parse(raw);
          const age = Date.now() - Number(marker?.at || 0);
          shouldRestore = Boolean(
            marker?.storageKey === salesStorageKey &&
              age >= 0 &&
              age <= SALES_BACKGROUND_RESUME_MAX_AGE_MS
          );
        } catch {
          shouldRestore = false;
        }
      }
    }

    window.localStorage?.removeItem(SALES_BACKGROUND_RESUME_KEY);
    return shouldRestore;
  } catch {
    return false;
  }
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

  // Vanlig klikk på Befaring/Tilbud skal alltid lande på oversikten. Det er kun
  // reload/dvale fra Sales som får gjenåpne sist valgte sak.
  saveSalesNavigation(salesStorageKeyForProps(props), "list", null);
}

function markSalesTabForReload(props = {}) {
  if (props.integrationMode !== "app") return;
  try {
    const storageKey = salesStorageKeyForProps(props);
    window.sessionStorage?.setItem(SALES_RELOAD_TAB_KEY, "1");
    window.sessionStorage?.setItem(SALES_RELOAD_NAVIGATION_KEY, "1");
    window.localStorage?.setItem(
      SALES_BACKGROUND_RESUME_KEY,
      JSON.stringify({ at: Date.now(), storageKey })
    );
  } catch {
    // Engangsmarkørene påvirker kun navigasjonshjelp.
  }
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

  useEffect(() => {
    const rehydrateSalesModule = () => {
      beginOfferDraftHydrationCycle();
      setInstanceKey((current) => current + 1);
    };

    const blockPreHydrationUnloadSave = () => {
      markSalesTabForReload(props);
      beginOfferDraftHydrationCycle();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // iOS/Safari sender ikke alltid en klassisk reload før appen blir kastet
        // fra minnet. Merk aktiv Sales-økt allerede når telefonen går i bakgrunnen.
        markSalesTabForReload(props);
        return;
      }

      // Dersom samme side overlevde dvalen, skal markøren ikke påvirke et senere
      // bevisst fanebytte inne i appen.
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
