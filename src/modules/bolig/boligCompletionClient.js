import { getAppSupabaseClient } from "../access/appSupabaseClientRegistry.js";
export const completionLabels = {
  not_started: "Ikke startet",
  in_progress: "Under arbeid",
  executed: "Utført",
  controlled: "Kontrollert",
  ready: "Klar for overtagelse",
  handed_over: "Overtatt",
  review: "Ny kontroll kreves",
};
export async function completionRpc(
  context,
  rootId,
  scopeId = null,
  action = "get",
  row = null,
  payload = {},
) {
  const request = getAppSupabaseClient().rpc("bolig_completion", {
    p_company_id: context.company_id,
    p_root_id: rootId,
    p_scope_id: scopeId,
    p_action: action,
    p_revision: row?.revision ?? null,
    p_payload: action === "get" ? {} : { ...payload, basis: row?.basis },
  });
  const { data, error } = await (typeof request.retry === "function"
    ? request.retry(false)
    : request);
  if (error) throw Object.assign(Error(error.message), { code: error.code });
  if (
    data?.context?.company_id !== context.company_id ||
    data?.context?.user_id !== context.user_id ||
    data?.root_id !== rootId ||
    data?.scope_id !== scopeId
  )
    throw Object.assign(Error("Firma eller arbeidsområde er endret."), {
      code: "42501",
    });
  return data;
}
export function completionTone(status) {
  return ["ready", "handed_over"].includes(status)
    ? "ready"
    : status === "review"
      ? "review"
      : status === "not_started"
        ? "empty"
        : "pending";
}
