import { getAppSupabaseClient } from "../access/appSupabaseClientRegistry.js";
export async function integrationRpc(
  context,
  root,
  action = "get",
  payload = {},
) {
  const client = getAppSupabaseClient();
  if (!client) throw Error("Innloggingen er ikke klar.");
  const request = client.rpc(
    root ? "bolig_project_integration" : "bolig_my_project_tasks",
    root
      ? {
          p_company_id: context.company_id,
          p_root_id: root,
          p_action: action,
          p_payload: payload,
        }
      : { p_company_id: context.company_id, p_payload: payload },
  );
  const { data, error } = await (typeof request.retry === "function"
    ? request.retry(false)
    : request);
  if (error) throw Object.assign(Error(error.message), { code: error.code });
  if (
    data?.context?.user_id !== context.user_id ||
    data?.context?.company_id !== context.company_id ||
    !data?.context?.enabled ||
    (context.role && data.context.role !== context.role) ||
    (root && data.root_id !== root)
  )
    throw Object.assign(
      Error("Bruker, firma eller prosjekttilgang er endret."),
      { code: "42501" },
    );
  if (!root && (!Array.isArray(data.items) || !Number.isInteger(data.count)))
    throw Error("Oppgavene kunne ikke bekreftes.");
  return data;
}
