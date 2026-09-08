// Expo ProffDok – FASE 39B.2
// Egen, liten sikkerhetsventil for Butikktilbud-kladd.
// Lagrer kun aktuell salgssak i Supabase slik at vareinnlegging ikke er avhengig
// av at hele Sales-listen kan sendes i samme autosave-kall.

import {
  createDefaultSalesSupabaseClient,
  getSalesSession,
  resolveSalesCompanyScope,
  upsertSalesRequests,
} from "./salesSupabase.js";
import {
  getOfferTotal,
  stripTransientPhotoData,
} from "../utils/salesUtils.js";

const defaultClient = createDefaultSalesSupabaseClient();

export function buildStoreOfferDraftRequest(selectedRequest = {}, offerForm = {}, savedAt = new Date().toISOString()) {
  const lines = Array.isArray(offerForm?.lines) ? offerForm.lines : [];
  const options = Array.isArray(offerForm?.options) ? offerForm.options : [];

  return {
    ...selectedRequest,
    offerTitle: String(offerForm?.title || ""),
    offerIntro: String(offerForm?.intro || ""),
    offerLines: lines,
    offerOptions: options,
    offerReservations: String(offerForm?.reservations || ""),
    offerIncluded: String(offerForm?.included || ""),
    offerExcluded: String(offerForm?.excluded || ""),
    offerCustomerSupplied: String(offerForm?.customerSupplied || ""),
    offerTerms: String(offerForm?.terms || ""),
    offerPaymentTerms: String(offerForm?.paymentTerms || ""),
    offerValidityDays: String(offerForm?.validityDays || ""),
    offerTotal: getOfferTotal(lines),
    offerDraftSavedAt: savedAt,
  };
}

export async function persistStoreOfferDraft(selectedRequest = {}, offerForm = {}, client = defaultClient) {
  const requestRef = String(selectedRequest?.id || "").trim();
  if (!requestRef) throw new Error("Butikktilbudet mangler saksreferanse.");
  if (!client) throw new Error("Supabase er ikke tilgjengelig.");

  const { data: sessionData } = await getSalesSession(client);
  if (!sessionData?.session?.user?.id) {
    throw new Error("Innloggingen er utløpt. Logg inn på nytt.");
  }

  const { data: companyId, error: companyError } = await resolveSalesCompanyScope(client);
  if (companyError || !companyId) {
    throw companyError || new Error("Firmatilknytningen kunne ikke bekreftes.");
  }

  const savedAt = new Date().toISOString();
  const request = buildStoreOfferDraftRequest(selectedRequest, offerForm, savedAt);
  const row = {
    company_id: companyId,
    request_ref: requestRef,
    status: request.status || "Tilbud",
    archived_at: request.archivedAt || null,
    payload: stripTransientPhotoData(request),
    updated_at: savedAt,
  };

  const { error } = await upsertSalesRequests(client, [row]);
  if (error) throw error;

  return { savedAt, request };
}
