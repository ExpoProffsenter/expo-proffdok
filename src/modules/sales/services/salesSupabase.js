// Expo ProffDok – FASE 23D / FASE 28A1
// Samler alle Supabase-kall for Befaring / Tilbud / Aksept.
// FASE 28A1 legger til firmadelte tilbudsmaler.
// Ingen React-state, UI-logikk, RLS-regler eller Storage-regler endres her.

import { createClient } from "@supabase/supabase-js";

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

export function uploadStorageFile(client, bucket, path, file, options) {
  return client.storage.from(bucket).upload(path, file, options);
}

export function downloadStorageFile(client, bucket, path) {
  return client.storage.from(bucket).download(path);
}

export function createStorageSignedUrl(client, bucket, path, expiresIn) {
  return client.storage.from(bucket).createSignedUrl(path, expiresIn);
}

export function getStoragePublicUrl(client, bucket, path) {
  return client.storage.from(bucket).getPublicUrl(path);
}

export function removeStorageFiles(client, bucket, paths) {
  return client.storage.from(bucket).remove(paths);
}

export function invokeSmartWorker(client, payload) {
  return client.functions.invoke("smart-worker", { body: payload });
}
