import { getAppSupabaseClient } from "../access/appSupabaseClientRegistry.js";
export const PACKAGE_CHOICES_EVENT = "expo-proffdok-bolig-catalog";
export const PACKAGE_EDITOR_EVENT = "expo-proffdok-bolig-package-editor";
export const packageChoiceBasis = (data) => ({
  choice_revision: data.selection?.revision || 0,
  catalog_revision: data.revision,
  rooms_revision: data.rooms_revision,
});
export async function packageChoicesRpc(
  context,
  rootId,
  unitId,
  action = "get",
  basis = {},
  payload = {},
) {
  const client = getAppSupabaseClient();
  if (!client) throw Error("Appens innlogging er ikke klar.");
  const request = client.rpc("bolig_package_choices", {
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
  if (error)
    throw Object.assign(new Error(error.message), { code: error.code });
  if (
    data?.context?.user_id !== context.user_id ||
    data?.context?.company_id !== context.company_id ||
    data?.root_id !== rootId ||
    data?.unit_id !== unitId
  )
    throw Object.assign(new Error("Firma eller bolig er endret."), {
      code: "42501",
    });
  return data;
}

// Match frozen goods across revision/position changes; scope keeps identical
// products in two rooms independent. Used only to rebase an explicit local draft.
export function rebaseOrderPositions(previous, selected, current, suggested) {
  if (!Array.isArray(previous)) return suggested;
  const same = (a, b) =>
    (a.key === b.key ||
      ((a.scope_id || "common") === "common" &&
        (b.scope_id || "common") === "common" &&
        (a.source_key || a.key) === (b.source_key || b.key))) &&
    (a.sku || "") === (b.sku || "") &&
    a.name === b.name &&
    Number(a.quantity) === Number(b.quantity) &&
    a.unit === b.unit;
  return current.flatMap((g, i) =>
    previous.some((old, p) => !selected.includes(p) && same(old, g)) ? [] : [i],
  );
}
