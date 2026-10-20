import { getAppSupabaseClient } from "../access/appSupabaseClientRegistry.js";
export async function boligRpc(
  action = "context",
  { companyId = null, rootId = null, revision = null, payload = {} } = {},
) {
  const client = getAppSupabaseClient();
  if (!client) throw Error("Appens innlogging er ikke klar.");
  const { data, error } = await client.rpc("bolig_workspace", {
    p_company_id: companyId,
    p_action: action,
    p_root_id: rootId,
    p_revision: revision,
    p_payload: payload,
  });
  if (error)
    throw Object.assign(
      new Error(
        error.code === "23505"
          ? "Navn, adresse, leilighetsnummer eller prosjektkobling finnes allerede. Se over feltene. Kladden er beholdt."
          : error.message,
      ),
      { code: error.code },
    );
  return data;
}
export const boligDraftKey = (context, root = "new", form = "root") =>
  `expo-proffdok.bolig-draft.v1:${context.user_id}:${context.company_id}:${root}:${form}`;
export function readBoligDraft(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}
export function writeBoligDraft(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
export function clearBoligDraft(key) {
  try {
    localStorage.removeItem(key);
  } catch {}
}
