// Expo ProffDok – FASE 31A2B
// Kundetilbudet beholder eksisterende, testet visning som Core og får kun
// et presentasjonslag som viser antall × enhetspris på poster og opsjoner.
// Ingen lagring, aksept, SQL, RLS, Storage eller Edge-logikk endres.

import SalesCustomerViewCore from "./SalesCustomerViewCore.jsx";
import { decorateRequestForQuantityPresentation } from "../utils/salesOfferQuantityPresentation.js";

export default function SalesCustomerView(props) {
  return (
    <SalesCustomerViewCore
      {...props}
      selectedRequest={decorateRequestForQuantityPresentation(
        props.selectedRequest
      )}
    />
  );
}
