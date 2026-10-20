import { getAppSupabaseClient } from "../access/appSupabaseClientRegistry.js";
export async function boligCatalogRpc(
  context,
  rootId,
  action = "state",
  revision = null,
  payload = {},
) {
  const client = getAppSupabaseClient();
  if (!client) throw Error("Appens innlogging er ikke klar.");
  const request = client.rpc("bolig_catalog", {
    p_company_id: context.company_id,
    p_root_id: rootId,
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
          ? "Navnet finnes allerede i dette hovedprosjektet."
          : error.message,
      ),
      { code: error.code },
    );
  if (
    data?.context?.company_id !== context.company_id ||
    data?.context?.user_id !== context.user_id ||
    data?.root_id !== rootId
  )
    throw Error("Firma eller hovedprosjekt er endret.");
  return data;
}
export const money = (cents) =>
  new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK" }).format(
    Number(cents || 0) / 100,
  );
export function toCents(value) {
  const normalized = String(value).trim().replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized))
    throw Error("Skriv beløp med høyst to desimaler.");
  const [whole, fraction = ""] = normalized.split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(cents) || cents > 1000000000)
    throw Error("Beløpet er for stort.");
  return cents;
}
export const optionBreakdown = (option, pkg) => {
  const line = pkg?.lines.find((l) => l.key === option.replace_key);
  const deduction = option.deduct_base && line ? Number(line.credit_cents) : 0;
  return {
    missingCredit: !!option.deduct_base && !!line && line.credit_cents == null,
    deduction,
    net: Number(option.price_cents) - deduction,
    compatible: !option.replace_key || !!line,
  };
};
