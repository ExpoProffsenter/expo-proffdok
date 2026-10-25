import { getAppSupabaseClient } from "../access/appSupabaseClientRegistry.js";
export async function boligRoomsRpc(
  context,
  rootId,
  unitId,
  action = "list",
  revision = null,
  payload = {},
) {
  const client = getAppSupabaseClient();
  if (!client) throw Error("Appens innlogging er ikke klar.");
  const request = client.rpc("bolig_rooms", {
    p_company_id: context.company_id,
    p_root_id: rootId,
    p_unit_id: unitId,
    p_action: action,
    p_revision: revision,
    p_payload: payload,
  });
  const { data, error } = await (typeof request.retry === "function"
    ? request.retry(false)
    : request);
  if (error)
    throw Object.assign(
      new Error(
        error.code === "23505"
          ? "Et aktivt rom har allerede dette navnet. Velg et annet navn."
          : error.message,
      ),
      { code: error.code },
    );
  if (
    data?.context?.user_id !== context.user_id ||
    data?.context?.company_id !== context.company_id ||
    data?.root_id !== rootId ||
    data?.unit_id !== unitId
  )
    throw Error("Firma eller bolig er endret.");
  return data;
}
