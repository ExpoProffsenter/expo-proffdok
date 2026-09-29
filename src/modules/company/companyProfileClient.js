// Felles firmaprofil for brukerens primærfirma.
// Database-RPC-ene er autoritative og holder firmaets kontakt-e-post adskilt
// fra brukerens innloggingsadresse.

import { rpcWithStoredSession } from "../access/moduleAccessClient.js";

export async function getMyCompanyProfile() {
  return rpcWithStoredSession("get_my_company_profile");
}

export async function setMyCompanyProfile(company = {}) {
  return rpcWithStoredSession("set_my_company_profile", {
    p_org_number: String(company?.orgNumber || "").trim(),
    p_address: String(company?.address || "").trim(),
    p_phone: String(company?.phone || "").trim(),
    p_email: String(company?.email || "").trim(),
    p_website: String(company?.website || "").trim(),
    p_logo_url: String(company?.logoUrl || "").trim(),
  });
}
