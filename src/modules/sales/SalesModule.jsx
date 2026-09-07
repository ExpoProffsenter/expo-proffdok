// Expo ProffDok – FASE 38A1 / FASE 37D1 / FASE 33B.4 / FASE 30D1 / FASE 30C3 / FASE 30C2
// FASE 38A1 lar serverstyrt modultilgang avgjøre hvilke direkte tilbudstyper brukeren kan starte.
// + Ny forespørsel og eksisterende Befaring/Tilbud-flyt er urørt. + Nytt tilbud er én inngang:
// Våtromstilbud for Sales-brukere, og i tillegg Butikktilbud når store_offers er tildelt.
// Firma/org.nr. er ikke tilgangskontroll. Samme rettighet projiseres i meny og Hjelp.
// Tynn sikkerhets-wrapper rundt eksisterende SalesModule.
// FASE 37D1 legger Butikktilbud oppå samme tilbudsmotor uten å kopiere
// publisering, kundelenke, PDF, aksept eller e-postlogikk.

import { useEffect, useState } from "react";
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
const SALES_OVERVIEW_INTRO_MARKER = "salesOverviewIntro";

function compactText(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function protectInspectionDraftNavigation(props = {}) {
  const salesStorageKey = buildSalesStorageKey({
    integrationMode: props.integrationMode || "preview",
    companyName:
      props.profile?.company_name || props.profile?.companyName || "",
    userId: props.authUser?.id || "anonymous",
  });
  const navigation = loadSalesNavigation(salesStorageKey);

  if (
    navigation?.mode === "inspection-note" &&
    navigation?.selectedRequestId
  ) {
    saveSalesNavigation(
      salesStorageKey,
      "detail",
      navigation.selectedRequestId
    );
  }
}

function markSalesTabForReload(props = {}) {
  if (props.integrationMode !== "app") return;
  try {
    window.sessionStorage?.setItem(SALES_RELOAD_TAB_KEY, "1");
  } catch {
    // Engangsmarkøren er kun navigasjonshjelp. Salgsdata påvirkes ikke.
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
    protectInspectionDraftNavigation(props);
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

    window.addEventListener(
      "expo-proffdok-sales-rehydrate",
      rehydrateSalesModule
    );
    window.addEventListener("beforeunload", blockPreHydrationUnloadSave);
    window.addEventListener("pagehide", blockPreHydrationUnloadSave);

    return () => {
      window.removeEventListener(
        "expo-proffdok-sales-rehydrate",
        rehydrateSalesModule
      );
      window.removeEventListener("beforeunload", blockPreHydrationUnloadSave);
      window.removeEventListener("pagehide", blockPreHydrationUnloadSave);
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

  // Startsidens eksisterende + Nytt tilbud-signal skal fortsatt fungere. Dersom
  // brukeren også har Butikktilbud, stopper wrapperen signalet før Core og lar
  // brukeren velge type. Uten Butikktilbud går signalet urørt til ordinær flyt.
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
