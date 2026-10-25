import { getAppSupabaseClient } from "../access/appSupabaseClientRegistry.js";
export const PORTAL_EVENT = "expo-bolig-portal-changed";
export async function portalManagerRpc(
  context,
  root,
  unit,
  action = "get",
  payload = {},
) {
  const client = getAppSupabaseClient();
  if (!client) throw Error("Appens innlogging er ikke klar.");
  const request = client.rpc("bolig_resident_portal", {
    p_company_id: context.company_id,
    p_root_id: root,
    p_unit_id: unit,
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
    data.root_id !== root ||
    data.unit_id !== unit ||
    !data.context.enabled
  )
    throw Object.assign(Error("Firma eller boligtilgang er endret."), {
      code: "42501",
    });
  return data;
}
export async function portalResidentRpc(token, action = "get", payload = {}) {
  let response;
  try {
    response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc/bolig_portal`,
      {
        method: "POST",
        signal: AbortSignal.timeout(20000),
        headers: {
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          p_token: token,
          p_action: action,
          p_payload: payload,
        }),
      },
    );
  } catch {
    throw Error(
      "Forbindelsen ble brutt. Hent siste status eller prøv samme sending igjen.",
    );
  }
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.id)
    throw Object.assign(
      Error(
        ["22023", "42501", "PT409"].includes(result?.code)
          ? result.message
          : "Svaret kunne ikke bekreftes. Prøv samme sending igjen.",
      ),
      { code: result?.code },
    );
  return result;
}
export function portalUrl(token) {
  const url = new URL("bolig-kunde.html", window.location.origin);
  url.hash = `portal=${token}`;
  return url.toString();
}
export const portalStamp = (value) =>
  new Date(value).toLocaleString("nb-NO", {
    timeZone: "Europe/Oslo",
    dateStyle: "short",
    timeStyle: "short",
  });
export const portalStatus = {
  pending: "Venter på gjennomgang",
  applied: "Klart til avtale",
  reviewed: "Gjennomgått",
};
export function invitationText(contact, unit, url, reminder = false) {
  return `${reminder ? "Påminnelse: " : "Velkommen til "}beboerportalen\n\nHei ${contact?.name || ""}!\n\n${reminder ? "Du kan se status og svare i" : "Her finner du"} beboerportalen for ${unit.number}. Se boligvalg, avtaler, dokumentlenker og meldinger fra prosjektleder.\n\n${url}\n\nLenken er personlig. Ikke videresend den. Valg sendes først til gjennomgang. En avtale aksepteres separat etter at du har sett varer og pris.`;
}
