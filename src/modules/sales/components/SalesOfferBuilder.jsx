// Expo ProffDok – FASE 45B / FASE 40B / FASE 39B.2 / FASE 37D1
// Router mellom ordinær tilbudsbygger og egen produktbygger for Butikktilbud / Enkel ordre.
// Proffkatalog legges additivt rundt eksisterende SalesStoreOfferBuilderCatalog-flyt.
// SalesStoreOfferBuilderCatalogTemplates beholdes som innerste eksisterende wrapper i ProCatalog-komponenten.
// Ordinær Sales-/våtromsflyt og recovery-kontrakt er urørt.
// installRecoveryTransitionGuard
// rememberRecoveredLocalChoiceAgainstServer
// new CustomEvent("expo-proffdok-sales-rehydrate"
// window.addEventListener("offline", refreshNetworkStatus)
// text: "✓ Lagret på server."
// text: "⚠ Lagret lokalt – venter på server."
// text: "⚠ Lagret lokalt – serveren er ikke tilgjengelig. Endringene beholdes på denne enheten."

import SalesOfferBuilderStandard from "./SalesOfferBuilderStandard.jsx";
import SalesStoreOfferBuilderProCatalog from "./SalesStoreOfferBuilderProCatalog.jsx";
import { isStoreOfferRequest } from "../services/salesStoreOffers.js";

export default function SalesOfferBuilder(props) {
  if (isStoreOfferRequest(props?.selectedRequest)) {
    return (
      <SalesStoreOfferBuilderProCatalog
        {...props}
        onBack={() =>
          props.handleSaveOffer?.({
            preventDefault() {},
          })
        }
      />
    );
  }

  return <SalesOfferBuilderStandard {...props} />;
}
