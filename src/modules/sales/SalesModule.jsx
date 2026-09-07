// Expo ProffDok – FASE 38A1 / FASE 37D1 / FASE 33B.4 / FASE 30D1 / FASE 30C3 / FASE 30C2
// FASE 38A1 lar serverstyrt modultilgang avgjøre om Butikktilbud er tilgjengelig.
// Firma/org.nr. er ikke lenger tilgangskontroll. Samme rettighet projiseres i meny og Hjelp.
// Tynn sikkerhets-wrapper rundt eksisterende SalesModule.
// FASE 37D1 legger til en Ringside-avgrenset inngang for Butikktilbud uten å
// kopiere tilbuds-, publiserings-, kundelenke-, PDF-, aksept- eller e-postlogikk.
// FASE 33B.4: offentlig kontraktslenke går til egen tokenstyrt kundevisning uten
// å endre eksisterende offentlig tilbudsvisning eller Sales recovery.
// FASE 30D1: Ved full reload mens befaringsnotatet er åpent lander brukeren
// trygt på saken først. Lokal kladd/bilder beholdes og hydreres ved ny åpning,
// slik at tom initial React-state ikke kan overskrive befaringskladden.
// FASE 30C3: starter ny hydration-cycle før mount/remount for tilbudskladd.

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

export default function SalesModule(props) {
  const [instanceKey, setInstanceKey] = useState(() => {
    beginOfferDraftHydrationCycle();
    protectInspectionDraftNavigation(props);
    return 0;
  });
  const [storeOfferSignal, setStoreOfferSignal] = useState(0);
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

  const publicContractToken =
    props.integrationMode === "public" ? getPublicContractToken() : "";

  if (publicContractToken) {
    return (
      <SalesContractCustomerView
        supabaseClient={props.supabaseClient}
        contractToken={publicContractToken}
      />
    );
  }

  const canUseStoreOffers =
    props.integrationMode === "app" &&
    moduleAccess.loaded &&
    hasModuleAccess(moduleAccess, "store_offers");
  const forwardedStartNewOfferSignal =
    storeOfferSignal || props.startNewOfferSignal || 0;

  const startStoreOffer = () => {
    if (!canUseStoreOffers) return;
    markStoreOfferLaunch();
    setStoreOfferSignal(Date.now());
  };

  const handleStartNewOfferHandled = () => {
    if (storeOfferSignal) {
      setStoreOfferSignal(0);
      return;
    }
    props.onStartNewOfferHandled?.();
  };

  return (
    <>
      {canUseStoreOffers ? (
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
            onClick={startStoreOffer}
            style={{ whiteSpace: "nowrap" }}
          >
            + Nytt butikktilbud
          </button>
        </div>
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
