// Expo ProffDok – FASE 23D / FASE 28A1 / FASE 29B2
// Samler alle Supabase-kall for Befaring / Tilbud / Aksept.
// FASE 28A1 legger til firmadelte tilbudsmaler.
// FASE 29B2 ruter kontrakt og låst akseptbevis til privat, firmascopet Storage
// uten å endre SalesModule eller lagret logical path i saken.

import { createClient } from "@supabase/supabase-js";
import {
  LEGACY_PUBLIC_DOCUMENT_BUCKET,
  PRIVATE_DOCUMENT_BUCKET,
  buildPrivateDocumentAppUrl,
  buildPrivateSalesStoragePath,
  isPrivateSalesLogicalPath,
} from "../../documents/privateDocumentTools.js";

export function createDefaultSalesSupabaseClient() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  return supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;
}

export function getSalesSession(client) {
  return client.auth.getSession();
}

export function fetchCurrentSalesUser(client) {
  return client.auth.getUser();
}

export function subscribeToSalesAuthChanges(client, callback) {
  if (!client?.auth?.onAuthStateChange) return null;
  const { data } = client.auth.onAuthStateChange(callback);
  return data?.subscription || null;
}

export function resolveSalesCompanyScope(client) {
  return client.rpc("resolve_sales_company_scope");
}

export function getSalesOfferByToken(client, token) {
  return client.rpc("get_sales_offer_by_token", { token });
}

export function acceptSalesOffer(
  client,
  { token, acceptedName, selectedOptions }
) {
  return client.rpc("accept_sales_offer", {
    token,
    accepted_name: acceptedName,
    selected_options: selectedOptions,
  });
}

export function publishSalesOffer(client, payload) {
  return client.rpc("publish_sales_offer", { payload });
}

export function fetchSalesRequests(client, companyId) {
  return client
    .from("sales_requests")
    .select("request_ref,payload,status,archived_at")
    .eq("company_id", companyId)
    .order("updated_at", { ascending: false });
}

export function upsertSalesRequests(client, rows) {
  return client
    .from("sales_requests")
    .upsert(rows, { onConflict: "company_id,request_ref" });
}

export function fetchSalesOfferTemplates(client, companyId) {
  return client
    .from("sales_offer_templates")
    .select("id,company_id,name,payload,created_by,created_at,updated_at")
    .eq("company_id", companyId)
    .order("updated_at", { ascending: false });
}

export function insertSalesOfferTemplate(
  client,
  { companyId, name, payload, createdBy }
) {
  return client
    .from("sales_offer_templates")
    .insert({
      company_id: companyId,
      name,
      payload,
      created_by: createdBy,
    })
    .select("id,company_id,name,payload,created_by,created_at,updated_at")
    .single();
}

export function deleteSalesOfferTemplate(client, templateId, companyId) {
  return client
    .from("sales_offer_templates")
    .delete()
    .eq("id", templateId)
    .eq("company_id", companyId);
}

export function fetchProjectsByIds(client, projectIds) {
  return client.from("projects").select("id").in("id", projectIds);
}

export function fetchProjectById(client, projectId) {
  return client
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .maybeSingle();
}

export function fetchProjectsByOwner(client, userId) {
  return client.from("projects").select("id,data").eq("user_id", userId);
}

export function createSalesProject(client, projectRow) {
  return client.from("projects").insert(projectRow).select("id").single();
}

export function fetchProfileById(client, userId, profileSelect) {
  return client
    .from("profiles")
    .select(profileSelect)
    .eq("id", userId)
    .maybeSingle();
}

export function fetchProfileByEmail(client, email, profileSelect) {
  return client
    .from("profiles")
    .select(profileSelect)
    .ilike("email", email)
    .maybeSingle();
}

const shouldUsePrivateSalesStorage = (bucket, path) =>
  bucket === LEGACY_PUBLIC_DOCUMENT_BUCKET && isPrivateSalesLogicalPath(path);

async function resolvePrivateSalesStoragePath(client, bucket, path) {
  if (!shouldUsePrivateSalesStorage(bucket, path)) return "";

  const { data: companyScopeId, error } = await resolveSalesCompanyScope(client);
  if (error) throw error;
  if (!companyScopeId) {
    throw new Error("Kunne ikke fastslå firma for privat dokumentlagring.");
  }

  const privatePath = buildPrivateSalesStoragePath({
    companyScopeId,
    logicalPath: path,
  });
  if (!privatePath) {
    throw new Error("Kunne ikke bygge sikker Storage-path for dokumentet.");
  }
  return privatePath;
}

export async function uploadStorageFile(client, bucket, path, file, options) {
  if (!shouldUsePrivateSalesStorage(bucket, path)) {
    return client.storage.from(bucket).upload(path, file, options);
  }

  try {
    const privatePath = await resolvePrivateSalesStoragePath(client, bucket, path);
    return client.storage.from(PRIVATE_DOCUMENT_BUCKET).upload(privatePath, file, options);
  } catch (error) {
    return { data: null, error };
  }
}

export function downloadStorageFile(client, bucket, path) {
  return client.storage.from(bucket).download(path);
}

export function createStorageSignedUrl(client, bucket, path, expiresIn) {
  return client.storage.from(bucket).createSignedUrl(path, expiresIn);
}

export function getStoragePublicUrl(client, bucket, path) {
  if (shouldUsePrivateSalesStorage(bucket, path)) {
    return {
      data: {
        publicUrl: buildPrivateDocumentAppUrl({ path }),
      },
    };
  }
  return client.storage.from(bucket).getPublicUrl(path);
}

export async function removeStorageFiles(client, bucket, paths) {
  const safePaths = Array.isArray(paths) ? paths.filter(Boolean) : [];
  if (!safePaths.length) return { data: [], error: null };

  const privateLogicalPaths = safePaths.filter((path) =>
    shouldUsePrivateSalesStorage(bucket, path)
  );
  const ordinaryPaths = safePaths.filter((path) =>
    !shouldUsePrivateSalesStorage(bucket, path)
  );
  const removed = [];

  try {
    if (privateLogicalPaths.length) {
      const privatePaths = [];
      for (const logicalPath of privateLogicalPaths) {
        privatePaths.push(
          await resolvePrivateSalesStoragePath(client, bucket, logicalPath)
        );
      }
      const { data, error } = await client.storage
        .from(PRIVATE_DOCUMENT_BUCKET)
        .remove(privatePaths);
      if (error) return { data: null, error };
      if (Array.isArray(data)) removed.push(...data);
    }

    if (ordinaryPaths.length) {
      const { data, error } = await client.storage.from(bucket).remove(ordinaryPaths);
      if (error) return { data: null, error };
      if (Array.isArray(data)) removed.push(...data);
    }

    return { data: removed, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export function invokeSmartWorker(client, payload) {
  return client.functions.invoke("smart-worker", { body: payload });
}
