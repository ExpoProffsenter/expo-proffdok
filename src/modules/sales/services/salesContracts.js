// Expo ProffDok – FASE 33B.4
// Tynn klient rundt kontraktgrunnlaget fra FASE 33B.2–33B.4. Bruker eksisterende
// delt Sales Supabase-klient og endrer ikke tilbud, aksept eller prosjektaktivering.

const CONTRACT_CHANGED_EVENT = "expo-proffdok-sales-contract-changed";

function notifyContractChanged(detail = {}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CONTRACT_CHANGED_EVENT, { detail }));
}

export async function fetchActiveSalesContract(
  client,
  { offerId = "", offerVersionId = "" } = {}
) {
  if (!client || !offerId) return { data: null, error: null };

  let query = client
    .from("sales_contracts")
    .select(
      "id,company_id,request_ref,offer_id,offer_version_id,source,status,snapshot,customer_token,company_signed_by_name,company_signed_at,customer_signed_by_name,customer_signed_at,customer_acknowledgements,external_document,final_document,created_at,updated_at"
    )
    .eq("offer_id", offerId)
    .neq("status", "void")
    .order("created_at", { ascending: false })
    .limit(1);

  if (offerVersionId) {
    query = query.eq("offer_version_id", offerVersionId);
  }

  const { data, error } = await query;
  return {
    data: Array.isArray(data) ? data[0] || null : data || null,
    error,
  };
}

export async function createExpoSalesContract(
  client,
  { offerId, contract, companySnapshot } = {}
) {
  if (!client) throw new Error("Supabase er ikke tilgjengelig.");
  if (!offerId) throw new Error("Akseptert tilbudsreferanse mangler.");

  const { data, error } = await client.rpc("create_sales_contract", {
    payload: {
      offer_id: offerId,
      contract: contract || {},
      company_snapshot: companySnapshot || {},
    },
  });

  if (error) throw error;
  if (data?.source && data.source !== "expo") {
    throw new Error(
      "Det er allerede registrert en ekstern kontrakt for den aksepterte tilbudsversjonen."
    );
  }
  if (data?.status && data.status !== "draft") {
    throw new Error("Kontrakten er allerede sendt eller signert og kan ikke redigeres.");
  }
  return data;
}

export async function saveExpoSalesContractDraft(
  client,
  { contractId, contract, companySnapshot } = {}
) {
  if (!client) throw new Error("Supabase er ikke tilgjengelig.");
  if (!contractId) throw new Error("Kontraktsreferanse mangler.");

  const { data, error } = await client.rpc("save_sales_contract_draft", {
    contract_id: contractId,
    contract_data: contract || {},
    company_snapshot: companySnapshot || {},
  });

  if (error) throw error;
  notifyContractChanged({ id: data?.id || contractId, status: data?.status || "draft" });
  return data;
}

export async function signExpoSalesContractCompany(client, contractId) {
  if (!client) throw new Error("Supabase er ikke tilgjengelig.");
  if (!contractId) throw new Error("Kontraktsreferanse mangler.");

  const { data, error } = await client.rpc("sign_sales_contract_company", {
    contract_id: contractId,
  });
  if (error) throw error;
  notifyContractChanged({ id: data?.id || contractId, status: data?.status || "awaiting_customer" });
  return data;
}

export async function fetchPublicSalesContract(client, token) {
  if (!client || !token) return null;
  const { data, error } = await client.rpc("get_sales_contract_by_token", {
    token,
  });
  if (error) throw error;
  return data || null;
}

export async function signPublicSalesContractCustomer(
  client,
  { token, acceptedName, acknowledgements } = {}
) {
  if (!client) throw new Error("Supabase er ikke tilgjengelig.");
  if (!token) throw new Error("Kontraktslenken er ugyldig.");

  const { data, error } = await client.rpc("sign_sales_contract_customer", {
    token,
    accepted_name: String(acceptedName || "").trim(),
    acknowledgements: acknowledgements || {},
  });
  if (error) throw error;
  return data;
}

export function buildCustomerContractLink(
  currentUrl,
  { contractToken = "", offerToken = "" } = {}
) {
  if (!contractToken) return "";
  const url = new URL(currentUrl);
  url.searchParams.delete("salesSupportCompany");
  // `publicOffer` er inngangen til eksisterende offentlig Sales-ruting i main.jsx.
  // Eldre aksepterte saker kan mangle historisk tilbudstoken; kontrakts-RPC-en
  // bruker likevel sin egen sikre token og trenger bare en ikke-tom routingmarkør.
  url.searchParams.set("publicOffer", offerToken || "contract");
  url.searchParams.set("publicContract", contractToken);
  return url.toString();
}

export { CONTRACT_CHANGED_EVENT };
