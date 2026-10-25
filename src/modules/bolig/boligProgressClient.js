import { getAppSupabaseClient } from "../access/appSupabaseClientRegistry.js";
export const PROGRESS_EVENT = "expo-bolig-progress-changed";
export const progressLabels = {
  planned: "Planlagt",
  working: "Under arbeid",
  blocked: "Stoppet",
  done: "Utført",
};
export const localToday = () =>
  new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(
    new Date(),
  );
export const progressDate = (value) =>
  value ? value.split("-").reverse().join(".") : "Ikke registrert";
export async function progressRpc(
  context,
  root,
  unit,
  action = "get",
  payload = {},
) {
  const client = getAppSupabaseClient();
  if (!client) throw Error("Appens innlogging er ikke klar.");
  const request = client.rpc("bolig_progress", {
    p_company_id: context.company_id,
    p_root_id: root,
    p_unit_id: unit || null,
    p_action: action,
    p_payload: payload,
  });
  const { data, error } = await (typeof request.retry === "function"
    ? request.retry(false)
    : request);
  if (error) throw Object.assign(Error(error.message), { code: error.code });
  if (
    data?.context?.user_id !== context.user_id ||
    data?.context?.company_id !== context.company_id ||
    !data?.context?.enabled ||
    data.root_id !== root ||
    data.unit_id !== (unit || null)
  )
    throw Object.assign(Error("Firma eller boligtilgang er endret."), {
      code: "42501",
    });
  return data;
}
