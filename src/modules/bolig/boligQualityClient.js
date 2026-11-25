import { getAppSupabaseClient } from "../access/appSupabaseClientRegistry.js";
export const QUALITY_EVENT = "expo-proffdok:bolig-quality-changed";
export async function qualityRpc(
  context,
  root,
  scope,
  action = "get",
  revision = null,
  payload = {},
) {
  const pending = getAppSupabaseClient().rpc("bolig_quality", {
    p_company_id: context.company_id,
    p_root_id: root,
    p_scope_id: scope,
    p_action: action,
    p_revision: revision,
    p_payload: payload,
  });
  const { data, error } = await (typeof pending.retry === "function"
    ? pending.retry(false)
    : pending);
  if (error) throw Object.assign(Error(error.message), { code: error.code });
  if (
    data?.context?.company_id !== context.company_id ||
    data?.context?.user_id !== context.user_id ||
    !data?.context?.enabled ||
    data.root_id !== root ||
    data.scope_id !== scope
  )
    throw Object.assign(Error("Firma eller dokumenttilgang er endret."), {
      code: "42501",
    });
  return data;
}
export const DOCUMENT_BUCKET = "bolig-documents";
export async function uploadQualityFile(
  context,
  root,
  scope,
  file,
  isCurrent = () => true,
) {
  const types = {
    "application/pdf": "pdf",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  if (!file || !types[file.type] || !file.size || file.size > 20 * 1024 * 1024)
    throw Error("Velg PDF, JPG, PNG eller WebP på inntil 20 MB.");
  const path = `${context.company_id}/${root}/${scope}/${crypto.randomUUID()}.${types[file.type]}`;
  const { error } = await getAppSupabaseClient()
    .storage.from(DOCUMENT_BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw Error("Filen kunne ikke lastes opp. Prøv igjen.");
  if (!isCurrent()) return null;
  return { path, name: file.name.slice(0, 180) };
}
export async function openQualityFile(file, isCurrent = () => true) {
  const { data, error } = await getAppSupabaseClient()
    .storage.from(DOCUMENT_BUCKET)
    .createSignedUrl(file.path, 120);
  if (error || !data?.signedUrl)
    throw Error("Filen kunne ikke åpnes. Kontroller tilgangen og prøv igjen.");
  if (!isCurrent()) return;
  // Short-lived private URL is opened only after fresh Storage authorization.
  const link = document.createElement("a");
  link.href = data.signedUrl;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.click();
}
