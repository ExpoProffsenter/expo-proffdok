import { getAppSupabaseClient } from "../access/appSupabaseClientRegistry.js";
export async function customizationRpc(
  context,
  rootId,
  unitId,
  action = "get",
  basis = {},
  payload = {},
) {
  const request = getAppSupabaseClient().rpc("bolig_unit_customization", {
    p_company_id: context.company_id,
    p_root_id: rootId,
    p_unit_id: unitId,
    p_action: action,
    p_revision: basis.choice_revision ?? null,
    p_payload:
      action === "get"
        ? {}
        : {
            ...payload,
            catalog_revision: basis.catalog_revision,
            rooms_revision: basis.rooms_revision,
          },
  });
  const { data, error } = await (typeof request.retry === "function"
    ? request.retry(false)
    : request);
  if (error) throw Object.assign(Error(error.message), { code: error.code });
  if (
    data?.context?.user_id !== context.user_id ||
    data?.context?.company_id !== context.company_id ||
    data?.root_id !== rootId ||
    data?.unit_id !== unitId
  )
    throw Object.assign(Error("Firma eller bolig er endret."), {
      code: "42501",
    });
  return data;
}
// Normalize section identities locally; never discard goods with identical product IDs.
export function customizationModel(part) {
  const sections = [],
    ids = new Map();
  const lines = part.goods.map((g) => {
    const name = g.section_name || "";
    if (name && !ids.has(name)) {
      const id = crypto.randomUUID();
      ids.set(name, id);
      sections.push({ id, name, description: "" });
    }
    return {
      ...g,
      section_id: ids.get(name) || "",
      image_url: g.image_url || "",
      product_url: g.product_url || "",
      sku: g.sku || "",
    };
  });
  return {
    lines,
    sections,
    reason: "",
    adjustment: String((part.customization?.adjustment_cents || 0) / 100),
    reset: false,
  };
}
export function signedCents(value) {
  const s = String(value).trim().replace(",", ".");
  if (!/^-?\d+(\.\d{1,2})?$/.test(s))
    throw Error("Skriv pristillegg eller fratrekk med høyst to desimaler.");
  const negative = s.startsWith("-"),
    [whole, fraction = ""] = s.replace("-", "").split(".");
  const amount = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(amount) || amount > 1000000000)
    throw Error("Beløpet er for stort.");
  return negative ? -amount : amount;
}
