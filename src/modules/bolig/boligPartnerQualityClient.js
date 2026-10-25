export async function partnerQualityRpc(token, action, payload) {
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc/bolig_partner_quality`,
    {
      method: "POST",
      signal: AbortSignal.timeout(30000),
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
  const data = await response.json();
  if (!response.ok)
    throw Object.assign(
      Error(
        data.message || "Lagringen kunne ikke bekreftes. Kladden er beholdt.",
      ),
      { code: data.code },
    );
  return data;
}
export async function partnerFile(token, action, value) {
  const body =
    action === "upload"
      ? new FormData()
      : JSON.stringify({ token, action: "download", id: value });
  if (action === "upload") {
    body.set("token", token);
    body.set("id", value.id);
    body.set("scope_id", value.scope_id);
    body.set("file", value.file);
  }
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bolig-partner-files`,
    {
      method: "POST",
      signal: AbortSignal.timeout(60000),
      headers: {
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        ...(action === "upload" ? {} : { "Content-Type": "application/json" }),
      },
      body,
    },
  );
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw Object.assign(
      Error(
        data.message ||
          "Filen kunne ikke overføres. Prøv igjen med samme utkast.",
      ),
      { code: data.code },
    );
  }
  return action === "upload" ? response.json() : response.blob();
}
export function partnerUploadDraft(key, value) {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open("expo-bolig-partner-files-v1", 1);
    open.onupgradeneeded = () => open.result.createObjectStore("drafts");
    open.onerror = () =>
      reject(Error("Kunne ikke sikre filkladden i nettleseren."));
    open.onsuccess = () => {
      const db = open.result;
      const tx = db.transaction(
          "drafts",
          value === undefined ? "readonly" : "readwrite",
        ),
        store = tx.objectStore("drafts");
      const req =
        value === undefined
          ? store.get(key)
          : value === null
            ? store.delete(key)
            : store.put(value, key);
      let result;
      req.onsuccess = () => (result = req.result);
      tx.oncomplete = () => {
        db.close();
        resolve(result || null);
      };
      tx.onerror = () => {
        db.close();
        reject(Error("Kunne ikke sikre filkladden i nettleseren."));
      };
    };
  });
}
