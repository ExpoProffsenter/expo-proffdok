// Expo ProffDok – FASE 40B / FASE 39B.2 / FASE 37D1
// Router mellom ordinær tilbudsbygger og egen produktbygger for Butikktilbud.
// FASE 40B legger komplette Butikktilbud-maler som en tynn ytterwrapper rundt
// eksisterende katalog-/autosavebygger. Ordinær Sales-/våtromsflyt er urørt.
// 39B.2 legger internt vareregister som en tynn wrapper rundt eksisterende Butikktilbud.
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
import SalesStoreOfferBuilderCatalogTemplates from "./SalesStoreOfferBuilderCatalogTemplates.jsx";
import { isStoreOfferRequest } from "../services/salesStoreOffers.js";

export default function SalesOfferBuilder(props) {
  if (isStoreOfferRequest(props?.selectedRequest)) {
    return (
      <SalesStoreOfferBuilderCatalogTemplates
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
