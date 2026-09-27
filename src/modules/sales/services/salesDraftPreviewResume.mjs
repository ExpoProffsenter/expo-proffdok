// Expo ProffDok – FASE 45B
// Isolert resolver for kundepreview-retur. Den finner den faktiske Sales-lagringen
// som allerede peker på saken brukeren ser, i stedet for å anta at representert
// firmanavn og React-profil alltid bruker samme lokale storage-scope.

const SALES_STORAGE_PREFIX = "expo-proffdok-sales-preview-requests-v1:";

function compactText(value = "") {
  return String(value || "").trim();
}

function parseNavigation(storage, storageKey = "") {
  if (!storage || !storageKey) return null;
  try {
    const raw = storage.getItem(`${storageKey}:navigation`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function navigationMatchesRequest(navigation, requestId = "") {
  return Boolean(
    navigation?.mode === "detail" &&
      compactText(navigation?.selectedRequestId) === compactText(requestId)
  );
}

export function resolveSalesDraftPreviewResumeStorageKey({
  storage,
  userId = "",
  requestId = "",
  preferredStorageKey = "",
} = {}) {
  const normalizedRequestId = compactText(requestId);
  const normalizedUserId = compactText(userId);
  const preferred = compactText(preferredStorageKey);
  if (!storage || !normalizedRequestId) return "";

  if (
    preferred &&
    navigationMatchesRequest(parseNavigation(storage, preferred), normalizedRequestId)
  ) {
    return preferred;
  }

  const matches = [];
  try {
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (!key?.endsWith(":navigation")) continue;

      const storageKey = key.slice(0, -":navigation".length);
      if (!storageKey.startsWith(SALES_STORAGE_PREFIX)) continue;
      if (normalizedUserId && !storageKey.includes(`:${normalizedUserId}`)) continue;

      if (
        navigationMatchesRequest(
          parseNavigation(storage, storageKey),
          normalizedRequestId
        )
      ) {
        matches.push(storageKey);
      }
    }
  } catch {
    return "";
  }

  // Fail closed ved tvetydighet. Preview skal aldri armere recovery for feil firma.
  return matches.length === 1 ? matches[0] : "";
}
