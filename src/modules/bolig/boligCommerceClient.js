import { getAppSupabaseClient } from "../access/appSupabaseClientRegistry.js";

export const COMMERCE_EVENT = "expo-bolig-commerce-changed";
export const commerceLabels = {
  draft: "Kladd", approved: "Internt godkjent", published: "Venter på beboer",
  accepted: "Akseptert", declined: "Avslått", revoked: "Tilbakekalt",
  superseded: "Annen utgave akseptert", expired: "Svarfrist utløpt", handled: "Avklart og fulgt opp",
};
export async function commerceRpc(context, rootId, unitId, action = "get", payload = {}) {
  const client = getAppSupabaseClient();
  if (!client) throw Error("Appens innlogging er ikke klar.");
  const request = client.rpc("bolig_commerce", {
    p_company_id: context.company_id, p_root_id: rootId, p_unit_id: unitId,
    p_action: action, p_payload: payload,
  });
  const { data, error } = await (typeof request.retry === "function" ? request.retry(false) : request);
  if (error) throw Object.assign(Error(error.message), { code: error.code });
  if (data?.context?.user_id !== context.user_id || data?.context?.company_id !== context.company_id ||
    data?.root_id !== rootId || data?.unit_id !== unitId) {
    throw Object.assign(Error("Firma eller bolig er endret."), { code: "42501" });
  }
  return data;
}
export function newResidentToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)), n => n.toString(16).padStart(2, "0")).join("");
}
export function residentUrl(token) {
  const url = new URL("bolig-kunde.html", window.location.origin);
  url.hash = token;
  return url.toString();
}
