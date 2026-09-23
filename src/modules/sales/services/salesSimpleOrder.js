// Expo ProffDok – FASE 45B
// Valgt videreføring beholdes lokalt for UI og lagres på salgssaken før aktivering.
// Selve tilbuds-/ordreidentiteten ligger versjonslåst i __storeOfferMeta.

const PREFIX = "expo-proffdok:sales:simple-order-activation:";

function key(requestId = "") {
  const clean = String(requestId || "").trim();
  return clean ? `${PREFIX}${clean}` : "";
}

export function setSimpleOrderActivationMode(requestId, mode = "simple_order") {
  if (typeof window === "undefined") return;
  const storageKey = key(requestId);
  if (!storageKey) return;
  try {
    window.sessionStorage.setItem(
      storageKey,
      mode === "project" ? "project" : "simple_order"
    );
  } catch {
    // Lokal UI-state er kun fallback; servervalget lagres separat.
  }
}

export async function persistSimpleOrderActivationMode(
  supabase,
  requestId,
  mode = "simple_order"
) {
  const cleanRequestId = String(requestId || "").trim();
  const cleanMode = mode === "project" ? "project" : "simple_order";
  if (!cleanRequestId) throw new Error("Salgssak mangler.");
  if (!supabase?.rpc) throw new Error("Supabase-klient mangler.");

  setSimpleOrderActivationMode(cleanRequestId, cleanMode);
  const { data, error } = await supabase.rpc("set_simple_order_activation_mode", {
    p_request_ref: cleanRequestId,
    p_mode: cleanMode,
  });
  if (error) throw new Error(error.message || "Kunne ikke lagre valgt videreføring.");
  return data;
}

export function getSimpleOrderActivationMode(requestId) {
  if (typeof window === "undefined") return "simple_order";
  const storageKey = key(requestId);
  if (!storageKey) return "simple_order";
  try {
    return window.sessionStorage.getItem(storageKey) === "project"
      ? "project"
      : "simple_order";
  } catch {
    return "simple_order";
  }
}

export function clearSimpleOrderActivationMode(requestId) {
  if (typeof window === "undefined") return;
  const storageKey = key(requestId);
  if (!storageKey) return;
  try {
    window.sessionStorage.removeItem(storageKey);
  } catch {
    // Ingen serverdata påvirkes.
  }
}
