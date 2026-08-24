// Expo ProffDok – FASE 30C3 / FASE 30C2
// Tynn sikkerhets-wrapper rundt eksisterende SalesModule. Recovery kan remounte
// bare salgmodulen uten å laste hele ProffDok eller sende brukeren til Startsiden.
// FASE 30C3 starter en ny hydration-cycle før hver mount/remount slik at en tom
// initial tilbudsform aldri kan lagres før aktuell salgssak er ferdig hydrert.

import { useEffect, useState } from "react";
import SalesModuleCore from "./SalesModuleCore.jsx";
import { beginOfferDraftHydrationCycle } from "./services/salesLocalStorage.js";

export default function SalesModule(props) {
  const [instanceKey, setInstanceKey] = useState(() => {
    beginOfferDraftHydrationCycle();
    return 0;
  });

  useEffect(() => {
    const rehydrateSalesModule = () => {
      beginOfferDraftHydrationCycle();
      setInstanceKey((current) => current + 1);
    };

    const blockPreHydrationUnloadSave = () => {
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

  return <SalesModuleCore key={instanceKey} {...props} />;
}
