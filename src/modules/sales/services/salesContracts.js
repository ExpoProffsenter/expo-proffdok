// Expo ProffDok – FASE 33B.3
// Tynn klient rundt kontraktgrunnlaget fra FASE 33B.2. Bruker eksisterende delt
// Sales Supabase-klient og endrer ikke tilbud, aksept eller prosjektaktivering.

export async function fetchActiveSalesContract(
  client,
  { offerId = "", offerVersionId = "" } = {}
) {
  if (!client || !offerId) return { data: null, error: null };

  let query = client
    .from("sales_contracts")
    .select(
      "id,company_id,request_ref,offer_id,offer_version_id,source,status,snapshot,customer_token,company_signed_by_name,company_signed_at,customer_signed_by_name,customer_signed_at,external_document,final_document,created_at,updated_at"
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
  return data;
}
