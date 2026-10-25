import { getAppSupabaseClient } from "../access/appSupabaseClientRegistry.js";
export function residentMailToken(link, kind) {
  try {
    const url = new URL(link);
    const token = url.hash.replace(
      kind === "agreement" ? /^#/ : /^#portal=/,
      "",
    );
    return url.pathname === "/bolig-kunde.html" && /^[a-f0-9]{64}$/.test(token)
      ? token
      : null;
  } catch {
    return null;
  }
}
export async function residentMailRpc(
  context,
  rootId,
  unitId,
  targetId,
  kind,
  token,
) {
  const client = getAppSupabaseClient();
  if (!client) throw Error("Innloggingen er ikke klar.");
  const request = client.rpc("bolig_resident_link_mail", {
    p_company_id: context.company_id,
    p_root_id: rootId,
    p_unit_id: unitId,
    p_target_id: targetId,
    p_kind: kind,
    p_action: "get",
    p_payload: { token },
  });
  const { data, error } = await (typeof request.retry === "function"
    ? request.retry(false)
    : request);
  if (error) throw Object.assign(Error(error.message), { code: error.code });
  if (
    data?.context?.company_id !== context.company_id ||
    data?.context?.user_id !== context.user_id ||
    data?.context?.role !== context.role ||
    data?.root_id !== rootId ||
    data?.unit_id !== unitId ||
    data?.target_id !== targetId ||
    data?.kind !== kind
  )
    throw Object.assign(Error("Tilgangen eller firmaet er endret."), {
      code: "42501",
    });
  return data;
}
export async function sendResidentInvitation(
  context,
  rootId,
  unitId,
  targetId,
  kind,
  attempt,
  token,
) {
  const client = getAppSupabaseClient();
  if (!client) throw Error("Innloggingen er ikke klar.");
  const { data: auth, error } = await client.auth.getSession();
  if (error || !auth?.session?.access_token)
    throw Error("Innloggingen må fornyes.");
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bolig-resident-link-email`,
    {
      method: "POST",
      signal: AbortSignal.timeout(30000),
      headers: {
        Authorization: `Bearer ${auth.session.access_token}`,
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        companyId: context.company_id,
        rootId,
        unitId,
        targetId,
        kind,
        requestId: attempt.id,
        revision: attempt.revision,
        to: attempt.to,
        token,
      }),
    },
  );
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.ok)
    throw Object.assign(
      Error(
        result?.error ||
          "Sendingen kunne ikke bekreftes. Prøv samme sending igjen.",
      ),
      { code: result?.code, uncertain: result?.uncertain !== false },
    );
  return result;
}
