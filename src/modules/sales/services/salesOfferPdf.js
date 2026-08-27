// Expo ProffDok – FASE 31A2B
// Bruker profesjonell A4-generator som speiler kundelinken, har robust paginering
// og tydeliggjør at opsjoner er valgfrie. Ingen lagring/SQL/RLS/Storage/Edge-endring.

import { createPublishedOfferPdfPolishedV2 } from "./salesOfferPdfPolishedV2.js";
import { decorateRequestForOptionalityPresentation } from "../utils/salesOfferOptionalityPresentation.js";

export async function createPublishedOfferPdf(args = {}) {
  return createPublishedOfferPdfPolishedV2({
    ...args,
    selectedRequest: decorateRequestForOptionalityPresentation(
      args.selectedRequest
    ),
  });
}
