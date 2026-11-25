export async function residentRpc(token, action = "get", documentId = null, payload = {}) {
  let response;
  try { response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc/bolig_resident_decision`, {
    method: "POST", signal: AbortSignal.timeout(20000),
    headers: { apikey: import.meta.env.VITE_SUPABASE_ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ p_token: token, p_action: action, p_document_id: documentId, p_payload: payload }),
  }); } catch {
    throw Error("Forbindelsen ble brutt. Prøv igjen med samme svar. Kvitteringen vises når registreringen er bekreftet.");
  }
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.id) throw Object.assign(Error(
    ["22023", "42501", "PT409"].includes(result?.code) ? result.message : "Svaret kunne ikke bekreftes. Prøv samme forsøk igjen eller kontakt prosjektleder."
  ), { code: result?.code });
  return result;
}
