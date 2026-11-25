import { getSalesSupportCompanyId } from "./salesSupabase.js";
// The selected UUID is authoritative; display names and publisher/signature fields are not.
export async function fetchSalesCaseHandlers(client, companyId, storeOffer = false) {
  if (!client?.rpc || !companyId) throw new Error("Firmatilgangen er ikke klar. Prøv igjen.");
  const { data, error } = await client.rpc("sales_case_handler_candidates", {
    p_company_id: companyId, p_store_offer: storeOffer,
  });
  if (error) throw error;
  if (!Array.isArray(data)) throw new Error("Kunne ikke hente saksbehandlere.");
  return data;
}

export async function validateSalesCaseHandler(client, companyId, userId, storeOffer = false) {
  const candidates = await fetchSalesCaseHandlers(client, companyId, storeOffer);
  const matches = candidates.filter(candidate => candidate.userId === userId);
  if (matches.length !== 1) throw new Error("Velg en saksbehandler som fortsatt har tilgang til saken.");
  return matches[0];
}

export function salesCaseHandlerFields(handler) {
  return {
    responsibleUserId: handler.userId,
    responsibleRevision: Number(handler.revision || 0),
    responsible: handler.displayName,
    projectResponsible: handler.displayName,
  };
}

export async function setSalesCaseHandler(client, companyId, requestRef, userId, revision) {
  if (getSalesSupportCompanyId()) throw new Error("Saksbehandler kan ikke endres i supportvisningen.");
  const { data, error } = await client.rpc("sales_set_case_handler", {
    p_company_id: companyId, p_request_ref: requestRef,
    p_user_id: userId, p_expected_revision: Number(revision || 0),
  });
  if (error) throw error;
  if (!data?.userId || !Number.isSafeInteger(Number(data.revision))) throw new Error("Saksbehandleren kunne ikke bekreftes lagret.");
  return data;
}
