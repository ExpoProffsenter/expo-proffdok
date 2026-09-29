// Felles firmaprofil for brukerens primærfirma.
// Database-RPC-ene er autoritative og holder firmaets kontakt-e-post adskilt
// fra brukerens innloggingsadresse.

import { getAppSupabaseClient } from "../access/appSupabaseClientRegistry.js";
import { rpcWithStoredSession } from "../access/moduleAccessClient.js";

async function rpcWithAppSession(functionName, args = {}) {
  const client = getAppSupabaseClient();
  if (!client?.rpc) return rpcWithStoredSession(functionName, args);

  const { data, error } = await client.rpc(functionName, args);
  if (error) throw error;
  return data;
}

export async function getMyCompanyProfile() {
  return rpcWithAppSession("get_my_company_profile");
}

export async function setMyCompanyProfile(company = {}) {
  return rpcWithAppSession("set_my_company_profile", {
    p_org_number: String(company?.orgNumber || "").trim(),
    p_address: String(company?.address || "").trim(),
    p_phone: String(company?.phone || "").trim(),
    p_email: String(company?.email || "").trim(),
    p_website: String(company?.website || "").trim(),
    p_logo_url: String(company?.logoUrl || "").trim(),
  });
}
