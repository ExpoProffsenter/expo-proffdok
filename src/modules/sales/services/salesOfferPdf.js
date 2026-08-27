// Expo ProffDok – FASE 31A2B
// Beholder testet PDF-generator som Core. Presentasjonskopien av publisert tilbud
// får antall × enhetspris i post-/opsjonstekst før PDF genereres.
// Lagrede tilbudsdata endres ikke.

import { createPublishedOfferPdf as createPublishedOfferPdfCore } from "./salesOfferPdfCore.js";
import { decorateRequestForQuantityPresentation } from "../utils/salesOfferQuantityPresentation.js";

export async function createPublishedOfferPdf(args = {}) {
  return createPublishedOfferPdfCore({
    ...args,
    selectedRequest: decorateRequestForQuantityPresentation(
      args.selectedRequest
    ),
  });
}
