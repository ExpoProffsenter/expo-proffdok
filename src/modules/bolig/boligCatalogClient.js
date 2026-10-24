import { getAppSupabaseClient } from "../access/appSupabaseClientRegistry.js";
export const packageErrorMessage = (message) =>
  String(message || "Kunne ikke behandle pakken.")
    .replace(/\bEt tilvalg\b/g, "En tilvalgspakke")
    .replace(/\bet tilvalg\b/g, "en tilvalgspakke")
    .replace(/\bSamme tilvalg\b/g, "Samme tilvalgspakke")
    .replace(/\bTilvalget\b/g, "Tilvalgspakken")
    .replace(/\btilvalget\b/g, "tilvalgspakken")
    .replace(/\bTilvalg\b/g, "Tilvalgspakker")
    .replace(/\btilvalg\b/g, "tilvalgspakker");
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
          : packageErrorMessage(error.message),
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

export async function boligOrderRpc(
  context,
  rootId,
  unitId,
  action = "get",
  basis = {},
  payload = {},
) {
  const client = getAppSupabaseClient();
  if (!client) throw Error("Appens innlogging er ikke klar.");
  const pending = client.rpc("bolig_order_draft", {
    p_company_id: context.company_id,
    p_root_id: rootId,
    p_unit_id: unitId,
    p_action: action,
    p_revision: basis.order_revision ?? null,
    p_choice_revision: basis.choice_revision ?? null,
    p_payload: payload,
  });
  const { data, error } = await (typeof pending.retry === "function"
    ? pending.retry(false)
    : pending);
  if (error)
    throw Object.assign(new Error(error.message), { code: error.code });
  if (
    data?.context?.user_id !== context.user_id ||
    data?.context?.company_id !== context.company_id ||
    data?.root_id !== rootId ||
    data?.unit_id !== unitId
  )
    throw Error("Firma eller bolig er endret.");
  return data;
}
