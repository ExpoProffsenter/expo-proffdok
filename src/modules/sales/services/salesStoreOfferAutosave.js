// Expo ProffDok – FASE 39B.2
// Egen, liten sikkerhetsventil for Butikktilbud-kladd.
// Lagrer kun aktuell salgssak i Supabase slik at vareinnlegging ikke er avhengig
// av at hele Sales-listen kan sendes i samme autosave-kall.
// Helt tomme nye vare-/monterings-/opsjonsrader sendes ikke til server.

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

function attachmentHasContent(file) {
  return Boolean(String(file?.url || file?.path || file?.name || "").trim());
}

function lineHasDraftContent(line = {}) {
  if (line?.__storeOfferMeta) return true;
  if (line?.lineType === "store_text") {
    return Boolean(
      String(line.storeTextTitle || "").trim() ||
      String(line.storeTextBody || "").trim() ||
      String(line.description || "").trim()
    );
  }

  return Boolean(
    String(line.description || "").trim() ||
    String(line.amount ?? "").trim() ||
    String(line.storeUnitPriceInclVat ?? "").trim() ||
    String(line.supplierProductNumber || line.internalProductNumber || "").trim() ||
    String(line.nobbNumber || "").trim() ||
    String(line.productUrl || "").trim() ||
    String(line.storeCatalogItemId || "").trim() ||
    line.imageDataUrl ||
    attachmentHasContent(line.attachmentFile)
  );
}

function optionHasDraftContent(option = {}) {
  return Boolean(
    String(option.title || "").trim() ||
    String(option.description || "").trim() ||
    String(option.amount ?? "").trim() ||
    String(option.storeUnitPriceInclVat ?? "").trim() ||
    String(option.supplierProductNumber || option.internalProductNumber || "").trim() ||
    String(option.nobbNumber || "").trim() ||
    String(option.productUrl || "").trim() ||
    String(option.storeCatalogItemId || "").trim() ||
    option.imageDataUrl ||
    attachmentHasContent(option.attachmentFile)
  );
}

export function pruneStoreOfferDraftRows(offerForm = {}) {
  return {
    ...offerForm,
    lines: (Array.isArray(offerForm?.lines) ? offerForm.lines : []).filter(lineHasDraftContent),
    options: (Array.isArray(offerForm?.options) ? offerForm.options : []).filter(optionHasDraftContent),
  };
}

export function buildStoreOfferDraftRequest(selectedRequest = {}, offerForm = {}, savedAt = new Date().toISOString()) {
  const prunedForm = pruneStoreOfferDraftRows(offerForm);
  const lines = prunedForm.lines || [];
  const options = prunedForm.options || [];

  return {
    ...selectedRequest,
    offerTitle: String(prunedForm?.title || ""),
    offerIntro: String(prunedForm?.intro || ""),
    offerLines: lines,
    offerOptions: options,
    offerReservations: String(prunedForm?.reservations || ""),
    offerIncluded: String(prunedForm?.included || ""),
    offerExcluded: String(prunedForm?.excluded || ""),
    offerCustomerSupplied: String(prunedForm?.customerSupplied || ""),
    offerTerms: String(prunedForm?.terms || ""),
    offerPaymentTerms: String(prunedForm?.paymentTerms || ""),
    offerValidityDays: String(prunedForm?.validityDays || ""),
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
