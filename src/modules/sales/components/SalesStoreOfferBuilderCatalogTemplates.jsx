// Expo ProffDok – FASE 40B
// Tynn ytterwrapper: komplette maler legges kun rundt eksisterende Butikktilbud-bygger.
// Ingen ordinær Sales-/våtromslogikk endres.

import SalesStoreOfferBuilderCatalog from "./SalesStoreOfferBuilderCatalog.jsx";
import StoreOfferCompleteTemplatePanel from "./StoreOfferCompleteTemplatePanel.jsx";

export default function SalesStoreOfferBuilderCatalogTemplates(props) {
  return (
    <>
      <StoreOfferCompleteTemplatePanel
        requestId={String(props?.selectedRequest?.id || "")}
        offerForm={props?.offerForm || {}}
        updateOfferForm={props?.updateOfferForm}
      />
      <SalesStoreOfferBuilderCatalog {...props} />
    </>
  );
}
