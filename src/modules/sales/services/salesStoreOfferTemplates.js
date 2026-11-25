// Expo ProffDok – FASE 37D1
// Firmadelte tekst-/vilkårsmaler for Butikktilbud. Gjenbruker eksisterende
// sales_offer_templates-tabell og RLS, men lagrer aldri varer eller priser i denne maltypen.

import {
  createDefaultSalesSupabaseClient,
  deleteSalesOfferTemplate,
  fetchSalesOfferTemplates,
  getSalesSession,
  insertSalesOfferTemplate,
  resolveSalesCompanyScope,
} from "./salesSupabase.js";
import { STORE_TEXT_TEMPLATE_KIND } from "./salesStoreOffers.js";

const client = createDefaultSalesSupabaseClient();

async function resolveContext() {
  if (!client) throw new Error("Supabase er ikke tilgjengelig.");

  const { data: sessionData } = await getSalesSession(client);
  const userId = sessionData?.session?.user?.id;
  if (!userId) throw new Error("Du må være innlogget for å bruke maler.");

  const { data: companyId, error } = await resolveSalesCompanyScope(client);
  if (error || !companyId) {
    throw error || new Error("Firmatilknytningen kunne ikke bekreftes.");
  }

  return { companyId, userId };
}

function isStoreTextTemplate(template = {}) {
  return template?.payload?.templateKind === STORE_TEXT_TEMPLATE_KIND;
}

export async function loadStoreTextTemplates() {
  const { companyId } = await resolveContext();
  const { data, error } = await fetchSalesOfferTemplates(client, companyId);
  if (error) throw error;

  return (Array.isArray(data) ? data : []).filter(isStoreTextTemplate);
}

export async function saveStoreTextTemplate(name, offerForm = {}) {
  const { companyId, userId } = await resolveContext();
  const cleanName = String(name || "").trim();
  if (!cleanName) throw new Error("Malen må ha et navn.");

  const payload = {
    templateKind: STORE_TEXT_TEMPLATE_KIND,
    title: String(offerForm.title || "").trim(),
    intro: String(offerForm.intro || "").trim(),
    reservations: String(offerForm.reservations || "").trim(),
    terms: String(offerForm.terms || "").trim(),
    paymentTerms: String(offerForm.paymentTerms || "").trim(),
    validityDays: String(offerForm.validityDays || "30"),
  };

  const { data, error } = await insertSalesOfferTemplate(client, {
    companyId,
    name: cleanName,
    payload,
    createdBy: userId,
  });
  if (error) throw error;
  return data;
}

export async function removeStoreTextTemplate(templateId) {
  const { companyId } = await resolveContext();
  const { error } = await deleteSalesOfferTemplate(client, templateId, companyId);
  if (error) throw error;
}
