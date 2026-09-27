// Rutinemeldinger fra Supabase Auth kan sendes mellom faner når en ny klient
// starter med en allerede gyldig sesjon. De skal holde sesjonen fersk, men må
// ikke starte hele app-/profilinnlastingen på nytt for samme bruker.

const ROUTINE_SAME_USER_EVENTS = new Set([
  "INITIAL_SESSION",
  "SIGNED_IN",
  "TOKEN_REFRESHED",
]);

function normalizedUserId(value) {
  return String(value || "").trim();
}

export function shouldRebootstrapAuthState({
  event = "",
  previousUserId = null,
  nextUserId = null,
} = {}) {
  const previous = normalizedUserId(previousUserId);
  const next = normalizedUserId(nextUserId);

  if (previous !== next) return true;
  if (!next) return false;

  return !ROUTINE_SAME_USER_EVENTS.has(String(event || "").trim());
}
