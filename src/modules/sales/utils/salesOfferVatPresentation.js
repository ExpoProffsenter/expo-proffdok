import { getOfferTermsSnapshot } from './salesUtils.js';
import { getActiveOfferVersion } from './salesOfferLogic.js';
// Frozen public/accepted data wins over later edits to the internal draft.
export function offerShowsExVat(request = {}, lines = null) {
  if (lines) return getOfferTermsSnapshot(lines).showPricesExVat === true;
  const accepted = request.acceptedPayload?.version_snapshot?.lines;
  if (accepted) return getOfferTermsSnapshot(accepted).showPricesExVat === true;
  if (request.acceptedOfferVersionId && typeof request.acceptedShowPricesExVat === 'boolean') return request.acceptedShowPricesExVat;
  // The public mapper extracts this flag from the server's immutable version.
  if (request.isPublicOffer) return request.offerShowPricesExVat === true;
  const published = getActiveOfferVersion(request)?.lines;
  if (published) return getOfferTermsSnapshot(published).showPricesExVat === true;
  if (request.acceptedOfferLines?.length) return getOfferTermsSnapshot(request.acceptedOfferLines).showPricesExVat === true;
  return request.offerShowPricesExVat === true;
}
export function offerVatPresentation(request = {}, lines = null) {
  const exVat = offerShowsExVat(request, lines);
  return { exVat, multiplier: exVat ? 1 : 1.25, label: exVat ? 'eks. mva.' : 'inkl. mva.', fromIncl: value => exVat ? Number(value) / 1.25 : Number(value) };
}
