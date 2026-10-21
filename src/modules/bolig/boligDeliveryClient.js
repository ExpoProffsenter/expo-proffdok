import { getAppSupabaseClient } from "../access/appSupabaseClientRegistry.js";
export async function deliveryRpc(
  context,
  rootId,
  unitId,
  action = "get",
  payload = {},
) {
  const client = getAppSupabaseClient();
  if (!client) throw Error("Appens innlogging er ikke klar.");
  const request = client.rpc("bolig_deliveries", {
    p_company_id: context.company_id,
    p_root_id: rootId,
    p_unit_id: unitId,
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
    data?.root_id !== rootId ||
    data?.unit_id !== unitId
  )
    throw Object.assign(new Error("Firma eller bolig er endret."), {
      code: "42501",
    });
  return data;
}
export const deliveryStatus = {
  prepared: "Klargjort",
  ordered: "Bestilt",
  partial: "Delvis levert",
  delivered: "Levert",
  cancelled: "Annullert",
};
export const localDay = () =>
  new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Oslo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
export const quantity = (n) =>
  new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 3 }).format(
    Number(n),
  );
export const deliveryAddress = (state) =>
  state.unit_settings.address_mode === "individual"
    ? state.unit_settings.address
    : state.settings.address;
// The saved draft and frozen orders use the same stable, room-specific goods keys.
export const availableDeliveryPositions = (draft, orders) =>
  (draft?.snapshot.goods || []).flatMap((g, i) =>
    orders.some(
      (o) =>
        o.status !== "cancelled" &&
        o.snapshot.goods.some((x) => x.key === g.key),
    )
      ? []
      : [i],
  );
export async function prepareOrderMail(context, rootId, unitId, payload) {
  const client = getAppSupabaseClient();
  if (!client) throw Error("Appens innlogging er ikke klar.");
  const request = client.rpc("bolig_order_mail", {
    p_company_id: context.company_id,
    p_root_id: rootId,
    p_unit_id: unitId,
    p_action: "prepare",
    p_payload: payload,
  });
  const { data, error } = await (typeof request.retry === "function"
    ? request.retry(false)
    : request);
  if (error)
    throw Object.assign(new Error(error.message), { code: error.code });
  if (
    data?.snapshot?.order_id !== payload.order_id ||
    data?.id !== payload.request_id
  )
    throw Error("Bestillingsgrunnlaget stemmer ikke.");
  return data;
}
export async function sendOrderMail(context, rootId, unitId, requestId) {
  const client = getAppSupabaseClient();
  if (!client) throw Error("Appens innlogging er ikke klar.");
  const { data: sessionData, error: sessionError } =
    await client.auth.getSession();
  if (sessionError || !sessionData?.session?.access_token)
    throw Error("Innloggingen må fornyes.");
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bolig-order-email`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sessionData.session.access_token}`,
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        companyId: context.company_id,
        rootId,
        unitId,
        requestId,
      }),
    },
  );
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.ok)
    throw Object.assign(
      new Error(
        result?.error ||
          "Sendingen kunne ikke bekreftes. Prøv samme sending igjen.",
      ),
      { uncertain: result?.uncertain !== false },
    );
  return result;
}
export async function inspectOrderMail(context, rootId, unitId, requestId) {
  const client = getAppSupabaseClient();
  if (!client) throw Error("Appens innlogging er ikke klar.");
  const { data, error } = await client.rpc("bolig_order_mail", {
    p_company_id: context.company_id,
    p_root_id: rootId,
    p_unit_id: unitId,
    p_action: "inspect",
    p_payload: { request_id: requestId },
  });
  if (error)
    throw Object.assign(new Error(error.message), { code: error.code });
  if (data?.id !== requestId) throw Error("Sendereferansen stemmer ikke.");
  return data;
}
