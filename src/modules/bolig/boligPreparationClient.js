import { getAppSupabaseClient } from "../access/appSupabaseClientRegistry.js";

export async function preparationRpc(
  context,
  rootId,
  action = "get",
  payload = {},
) {
  const client = getAppSupabaseClient();
  if (!client) throw Error("Appens innlogging er ikke klar.");
  const request = client.rpc("bolig_prepare", {
    p_company_id: context.company_id,
    p_root_id: rootId,
    p_action: action,
    p_payload: payload,
  });
  const { data, error } = await (typeof request.retry === "function"
    ? request.retry(false)
    : request);
  if (error)
    throw Object.assign(new Error(error.message), { code: error.code });
  if (
    data?.context?.user_id !== context.user_id ||
    data?.context?.company_id !== context.company_id ||
    data?.root_id !== rootId
  )
    throw Object.assign(new Error("Firma eller prosjekt er endret."), {
      code: "42501",
    });
  return data;
}

export const preparationUnits = (data) => {
  const blocks = (data?.blocks || []).filter((b) => !b.archived);
  const entrances = (data?.entrances || []).filter(
    (e) => !e.archived && blocks.some((b) => b.id === e.block_id),
  );
  return (data?.units || [])
    .filter((u) => !u.archived && entrances.some((e) => e.id === u.entrance_id))
    .map((u) => {
      const entrance = entrances.find((e) => e.id === u.entrance_id);
      return {
        ...u,
        entrance,
        block: blocks.find((b) => b.id === entrance.block_id),
      };
    })
    .sort(
      (a, b) =>
        a.block.name.localeCompare(b.block.name, "nb", { numeric: true }) ||
        a.entrance.address.localeCompare(b.entrance.address, "nb", {
          numeric: true,
        }) ||
        a.floor - b.floor ||
        a.position - b.position,
    );
};

export function suggestNumbers(
  units,
  { mode = "floor", prefix = "", start = 1, digits = 3, restart = true },
) {
  if (
    !Number.isInteger(Number(start)) ||
    Number(start) < 0 ||
    Number(start) > 999999 ||
    !Number.isInteger(Number(digits)) ||
    Number(digits) < 1 ||
    Number(digits) > 6 ||
    prefix.length > 40
  )
    throw Error(
      "Velg et startnummer mellom 0 og 999999, 1–6 sifre og et kort prefiks.",
    );
  let sequence = Number(start),
    entrance = null;
  return units.map((u) => {
    if (restart && entrance !== u.entrance_id) sequence = Number(start);
    entrance = u.entrance_id;
    const number =
      mode === "official"
        ? `H${String(u.floor).padStart(2, "0")}${String(u.position).padStart(2, "0")}`
        : mode === "floor"
          ? `${prefix}${u.floor}${String(u.position).padStart(2, "0")}`
          : `${prefix}${String(sequence++).padStart(Number(digits), "0")}`;
    return { id: u.id, number, official_number: u.official_number || "" };
  });
}
