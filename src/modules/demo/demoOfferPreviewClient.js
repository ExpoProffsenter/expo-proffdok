// Expo ProffDok – FASE 42L
// Leser kun den eksakte DEMO42L-tilbudssaken for kundevisning i Demo/Test.
// Ingen publisering, token, e-post, aksept eller tilbudshistorikk opprettes.

import { getMyWorkProfileState } from "../access/workProfileClient.js";
import { createDefaultSalesSupabaseClient } from "../sales/services/salesSupabase.js";
import {
  DEMO_REQUEST_REFS,
  assertDemoOperator,
  isDemoRequest,
} from "./demoCaseSafety.js";

export async function loadDemoCustomerOfferPreview() {
  const workProfile = await getMyWorkProfileState();
  const companyId = String(workProfile?.active_company_id || "").trim();
  if (!companyId) throw new Error("Velg firma under Representerer først.");

  const client = createDefaultSalesSupabaseClient();
  if (!client) throw new Error("Supabase er ikke tilgjengelig.");

  const { data: sessionData, error: sessionError } = await client.auth.getSession();
  if (sessionError) throw sessionError;
  const user = sessionData?.session?.user || null;
  if (!user?.id) throw new Error("Innloggingen er ikke klar ennå.");
  assertDemoOperator(user, workProfile);

  const { data: row, error } = await client
    .from("sales_requests")
    .select("request_ref,status,payload")
    .eq("company_id", companyId)
    .eq("request_ref", DEMO_REQUEST_REFS.offer)
    .maybeSingle();
  if (error) throw error;
  if (!row?.payload || !isDemoRequest(row.payload)) {
    throw new Error("Demo-tilbudet er ikke klart. Tilbakestill demosuiten i Systemadmin.");
  }

  const companyProfile = workProfile?.active_company_profile || {};
  return {
    request: {
      ...row.payload,
      id: row.request_ref,
      status: row.status || row.payload.status,
      isPublicOffer: true,
      sentOfferVersionNumber: 1,
      companyName: companyProfile.companyName || "",
      companyOrgNumber: companyProfile.orgNumber || "",
      companyAddress: companyProfile.address || "",
      companyPhone: companyProfile.phone || "",
      companyEmail: companyProfile.email || "",
      companyWebsite: companyProfile.website || "",
      companyLogoUrl: companyProfile.logoUrl || "/expo-logo.png",
    },
    companyProfile,
  };
}
