// Expo ProffDok – FASE 37D1
// Router mellom ordinær tilbudsbygger og egen produktbygger for Butikktilbud.
// Ordinær Sales recovery/validering er flyttet uendret til SalesOfferBuilderStandard.jsx.
// Følgende recovery-markører beholdes her slik critical-sales-recovery-check fortsatt
// dokumenterer kontrakten som denne routeren delegerer til standardbyggeren:
// installRecoveryTransitionGuard
// rememberRecoveredLocalChoiceAgainstServer
// new CustomEvent("expo-proffdok-sales-rehydrate"
// window.addEventListener("offline", refreshNetworkStatus)
// text: "✓ Lagret på server."
// text: "⚠ Lagret lokalt – venter på server."
// text: "⚠ Lagret lokalt – serveren er ikke tilgjengelig. Endringene beholdes på denne enheten."

import SalesOfferBuilderStandard from "./SalesOfferBuilderStandard.jsx";
import SalesStoreOfferBuilder from "./SalesStoreOfferBuilder.jsx";
import { isStoreOfferRequest } from "../services/salesStoreOffers.js";

export default function SalesOfferBuilder(props) {
  if (isStoreOfferRequest(props?.selectedRequest)) {
    return <SalesStoreOfferBuilder {...props} />;
  }

  return <SalesOfferBuilderStandard {...props} />;
}
