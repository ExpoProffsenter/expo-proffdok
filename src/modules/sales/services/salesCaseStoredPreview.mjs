import { observeSalesDraftPreviewSession } from './salesDraftPreviewSession.mjs';
import { mapPublicOfferToRequest } from '../utils/salesOfferLogic.js';
import { buildSalesCaseCustomerPreview } from '../utils/salesCaseCustomerPreview.js';
import { WORK_PROFILE_EVENT } from '../../access/workProfileClient.js';

// A separate reading model. Never hydrate the editable request or persist this
// result: older cases may keep their published snapshot only in sales_offers.
export async function loadSalesCaseStoredPreview({ request, companyId, readRequest, readOffer }) {
  const terminal = ['Akseptert', 'Aktivert'].includes(request.status);
  const versionId = terminal ? request.acceptedOfferVersionId || request.sentOfferVersionId : request.sentOfferVersionId;
  if (!request.id || !request.publicToken || !versionId) throw new Error('Kundeversjonen kunne ikke identifiseres.');
  async function authorize() {
    const { data: row, error } = await readRequest(companyId, request.id);
    if (error || !row || row.company_id !== companyId || row.request_ref !== request.id || row.payload?.publicToken !== request.publicToken) {
      throw new Error('Saken er ikke tilgjengelig i valgt firma. Åpne saken på nytt.');
    }
    const current = terminal ? row.payload.acceptedOfferVersionId || row.payload.sentOfferVersionId : row.payload.sentOfferVersionId;
    if (current !== versionId) throw new Error('Kundeversjonen er endret. Åpne saken på nytt.');
  }
  await authorize();
  const { data, error } = await readOffer(request.publicToken);
  if (error || !data?.offer || !data?.version) throw new Error('Kunne ikke hente den lagrede kundeversjonen. Prøv igjen.');
  const { offer, version } = data;
  if (offer.request_ref !== request.id || (offer.company_id && offer.company_id !== companyId) ||
      version.id !== versionId || (version.offer_id && version.offer_id !== offer.id) ||
      (terminal && offer.status !== 'accepted')) {
    throw new Error('Kundeversjonen samsvarer ikke med saken. Åpne saken på nytt.');
  }
  await authorize(); // A late public response is insufficient after access loss.
  const mapped = mapPublicOfferToRequest(data);
  const preview = buildSalesCaseCustomerPreview({
    ...request, ...mapped,
    status: request.status === 'Aktivert' ? 'Aktivert' : mapped.status,
    offerVersions: [version],
  });
  if (preview.kind === 'empty') throw new Error('Den lagrede kundeversjonen har ikke tilgjengelige tilbudsposter.');
  return preview;
}

export function observeSalesCaseStoredPreview({ request, client, getSession, resolveScope, readRequest, readOffer,
  onReset, onLoading, onReady, onError, foreground = globalThis.window, visibility = globalThis.document }) {
  let companyId = '';
  const observer = observeSalesDraftPreviewSession({ client, getSession,
    resolveScope: async (value) => {
      const result = await resolveScope(value);
      if (!result.error && result.data) companyId = result.data;
      return result;
    },
    loadContent: (scope) => loadSalesCaseStoredPreview({ request, companyId: scope, readRequest, readOffer }),
    onReset, onLoading, onReady, onError, foreground, visibility,
  });
  const profileChanged = (event) => {
    const next = event.detail?.active_company_id;
    if (next && companyId && next === companyId) return;
    onReset();
    observer.retry(); // Invalidates pending work synchronously, then reauthorizes.
  };
  foreground?.addEventListener(WORK_PROFILE_EVENT, profileChanged);
  return { retry: observer.retry, dispose() {
    observer.dispose();
    foreground?.removeEventListener(WORK_PROFILE_EVENT, profileChanged);
  } };
}
