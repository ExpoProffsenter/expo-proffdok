import { getAppSupabaseClient } from "../access/appSupabaseClientRegistry.js";
export function partnerMailToken(link) {
  try {
    const url = new URL(link);
    const token = url.hash.replace(/^#partner=/, "");
    return url.pathname === "/bolig-kunde.html" && /^[a-f0-9]{64}$/.test(token)
      ? token
      : null;
  } catch {
    return null;
  }
}
export async function partnerMailRpc(context, rootId, accessId) {
  const client = getAppSupabaseClient();
  if (!client) throw Error("Innloggingen er ikke klar.");
  const request = client.rpc("bolig_partner_mail", {
    p_company_id: context.company_id,
    p_root_id: rootId,
    p_access_id: accessId,
    p_action: "get",
    p_payload: {},
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
    data?.access_id !== accessId
  )
    throw Object.assign(Error("Tilgangen eller firmaet er endret."), {
      code: "42501",
    });
  return data;
}
export async function sendPartnerInvitation(
  context,
  rootId,
  accessId,
  attempt,
  token,
) {
  const client = getAppSupabaseClient();
  if (!client) throw Error("Innloggingen er ikke klar.");
  const { data: auth, error } = await client.auth.getSession();
  if (error || !auth?.session?.access_token)
    throw Error("Innloggingen må fornyes.");
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bolig-partner-email`,
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
        accessId,
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
