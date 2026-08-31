// Expo ProffDok – FASE 33B.5 / FASE 33B.4
// Tynn klient rundt kontraktgrunnlaget fra FASE 33B.2–33B.5.
// Signert kontrakt kan ferdigstilles som privat PDF og synkroniseres idempotent
// til riktig ProffDok-prosjekt uten å endre tilbud, aksept eller historikk.

import {
  PRIVATE_DOCUMENT_BUCKET,
  buildPrivateDocumentAppUrl,
  buildPrivateSalesStoragePath,
} from "../../documents/privateDocumentTools.js";
import { sanitizeStoragePart } from "../utils/salesUtils.js";
import {
  removeStorageFiles,
  resolveSalesCompanyScope,
  uploadStorageFile,
} from "./salesSupabase.js";
import { createFinalSalesContractPdf } from "./salesContractPdf.js";

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

export async function attachFinalSalesContractDocument(
  client,
  { contractId, document } = {}
) {
  if (!client) throw new Error("Supabase er ikke tilgjengelig.");
  if (!contractId) throw new Error("Kontraktsreferanse mangler.");
  if (!document?.path && !document?.url) {
    throw new Error("Endelig kontraktsdokument mangler filreferanse.");
  }

  const { data, error } = await client.rpc("attach_sales_contract_final_document", {
    contract_id: contractId,
    document,
  });
  if (error) throw error;
  notifyContractChanged({
    id: contractId,
    status: "signed",
    finalDocument: data?.final_document || document,
  });
  return data;
}

export async function syncFinalSalesContractToProject(client, contractId) {
  if (!client) throw new Error("Supabase er ikke tilgjengelig.");
  if (!contractId) throw new Error("Kontraktsreferanse mangler.");

  const { data, error } = await client.rpc(
    "sync_sales_contract_final_document_to_project",
    { contract_id: contractId }
  );
  if (error) throw error;
  return data || { updated_projects: 0, project_ids: [] };
}

function finalDocumentReference(contract, { fileName, path, blob, pageCount }) {
  const now = new Date();
  return {
    id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
    name: fileName,
    url: buildPrivateDocumentAppUrl({ path }),
    path,
    storagePath: path,
    bucket: PRIVATE_DOCUMENT_BUCKET,
    storageBucket: PRIVATE_DOCUMENT_BUCKET,
    private: true,
    isPrivate: true,
    type: "application/pdf",
    mimeType: "application/pdf",
    size: Number(blob?.size || 0),
    created: now.toLocaleString("no-NO"),
    createdAt: now.toISOString(),
    documentType: "contract",
    contractSource: "expo",
    contractId: contract.id,
    requestRef: contract.request_ref || "",
    pageCount: Number(pageCount || 0),
  };
}

export async function ensureFinalSalesContractDocument(client, contract = {}) {
  if (!client) throw new Error("Supabase er ikke tilgjengelig.");
  if (!contract?.id || contract?.status !== "signed" || contract?.source !== "expo") {
    throw new Error("Kun signert Expo-kontrakt kan ferdigstilles som PDF.");
  }

  if (contract.final_document?.path || contract.final_document?.url) {
    let syncResult = null;
    let syncError = null;
    try {
      syncResult = await syncFinalSalesContractToProject(client, contract.id);
    } catch (error) {
      syncError = error;
    }
    return {
      contract,
      finalDocument: contract.final_document,
      created: false,
      syncResult,
      syncError,
    };
  }

  const { data: sessionData, error: sessionError } = await client.auth.getSession();
  if (sessionError) throw sessionError;
  const userId = String(sessionData?.session?.user?.id || "").trim();
  if (!userId) throw new Error("Du må være innlogget for å arkivere kontrakten.");

  const { blob, fileName, pageCount } = await createFinalSalesContractPdf(contract);
  const requestRef = sanitizeStoragePart(contract.request_ref || "kontrakt");
  const path = `sales-contracts/${userId}/${requestRef}/${Date.now()}-${sanitizeStoragePart(fileName)}`;

  const { error: uploadError } = await uploadStorageFile(
    client,
    "project-images",
    path,
    blob,
    {
      cacheControl: "3600",
      contentType: "application/pdf",
      upsert: false,
    }
  );
  if (uploadError) throw uploadError;

  const document = finalDocumentReference(contract, {
    fileName,
    path,
    blob,
    pageCount,
  });

  let attached;
  try {
    attached = await attachFinalSalesContractDocument(client, {
      contractId: contract.id,
      document,
    });
  } catch (error) {
    try {
      await removeStorageFiles(client, "project-images", [path]);
    } catch {
      // Best effort cleanup. Kontraktsraden er fortsatt urørt dersom attach feiler.
    }
    throw error;
  }

  const finalDocument = attached?.final_document || document;
  const nextContract = { ...contract, final_document: finalDocument };
  let syncResult = null;
  let syncError = null;
  try {
    syncResult = await syncFinalSalesContractToProject(client, contract.id);
  } catch (error) {
    // PDF-en er allerede trygt arkivert. Prosjektsynk kan prøves igjen idempotent.
    syncError = error;
  }

  return {
    contract: nextContract,
    finalDocument,
    created: true,
    syncResult,
    syncError,
  };
}

export async function openFinalSalesContractDocument(
  client,
  document = {},
  { download = false } = {}
) {
  if (!client) throw new Error("Supabase er ikke tilgjengelig.");
  const logicalPath = String(
    document?.path || document?.storagePath || document?.filePath || ""
  ).trim();
  if (!logicalPath) throw new Error("Kontraktsdokumentet mangler Storage-path.");

  const reservedWindow =
    !download && typeof window !== "undefined" ? window.open("", "_blank") : null;

  try {
    const { data: companyScopeId, error: scopeError } =
      await resolveSalesCompanyScope(client);
    if (scopeError) throw scopeError;
    const physicalPath = buildPrivateSalesStoragePath({
      companyScopeId,
      logicalPath,
    });
    if (!physicalPath) throw new Error("Kunne ikke bygge sikker dokumentpath.");

    const signedOptions = download
      ? { download: document?.name || "signert-kontrakt.pdf" }
      : undefined;
    const { data, error } = await client.storage
      .from(PRIVATE_DOCUMENT_BUCKET)
      .createSignedUrl(physicalPath, 10 * 60, signedOptions);
    if (error) throw error;
    if (!data?.signedUrl) throw new Error("Kunne ikke lage sikker dokumentlenke.");

    if (download && typeof document !== "undefined") {
      const anchor = window.document.createElement("a");
      anchor.href = data.signedUrl;
      anchor.download = document?.name || "signert-kontrakt.pdf";
      anchor.rel = "noopener noreferrer";
      window.document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      return data.signedUrl;
    }

    if (reservedWindow && !reservedWindow.closed) {
      reservedWindow.location.replace(data.signedUrl);
    } else if (typeof window !== "undefined") {
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    }
    return data.signedUrl;
  } catch (error) {
    if (reservedWindow && !reservedWindow.closed) reservedWindow.close();
    throw error;
  }
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
