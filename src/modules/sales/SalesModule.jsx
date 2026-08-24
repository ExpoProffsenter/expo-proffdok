// Expo ProffDok – FASE 30C2
// Tynn sikkerhets-wrapper rundt eksisterende SalesModule. Recovery kan remounte
// bare salgmodulen uten å laste hele ProffDok eller sende brukeren til Startsiden.

import { useEffect, useState } from "react";
import SalesModuleCore from "./SalesModuleCore.jsx";

export default function SalesModule(props) {
  const [instanceKey, setInstanceKey] = useState(0);

  useEffect(() => {
    const rehydrateSalesModule = () => {
      setInstanceKey((current) => current + 1);
    };

    window.addEventListener(
      "expo-proffdok-sales-rehydrate",
      rehydrateSalesModule
    );

    return () => {
      window.removeEventListener(
        "expo-proffdok-sales-rehydrate",
        rehydrateSalesModule
      );
    };
  }, []);

  return <SalesModuleCore key={instanceKey} {...props} />;
}
