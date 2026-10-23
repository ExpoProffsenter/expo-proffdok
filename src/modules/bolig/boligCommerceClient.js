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

// Each server step keeps its own request ID. Persist before calling it so a
// lost response or remount replays the exact step, including the original token.
export function commerceAttempt(action, payload) {
  const { document_status, ...basis } = payload;
  const request = (action, payload) => ({ action, payload: { ...payload, request_id: crypto.randomUUID() } });
  if (action === "create_link") return { ...request("create", basis), flow: { token: newResidentToken(), created: true } };
  if (action === "publish_ready") {
    const token = newResidentToken();
    return { ...request(document_status === "draft" ? "approve" : "publish", { ...basis, ...(document_status === "draft" ? {} : { token }) }), flow: { token, created: false } };
  }
  return request(action, basis);
}
export function nextCommerceAttempt(attempt, result) {
  if (!attempt.flow || attempt.action === "publish") return null;
  const doc = result.documents.find(d => d.id === (result.document_id || attempt.payload.document_id));
  const action = attempt.action === "create" ? "approve" : "publish";
  if (!doc || doc.status !== (action === "approve" ? "draft" : "approved")) throw Error("Avtaleutgaven kunne ikke bekreftes. Prøv samme lagring igjen.");
  return { action, payload: { document_id: doc.id, revision: doc.revision, ...(action === "publish" ? { token: attempt.flow.token } : {}), request_id: crypto.randomUUID() }, flow: attempt.flow };
}
