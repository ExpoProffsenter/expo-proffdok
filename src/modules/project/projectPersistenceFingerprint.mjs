// Stable JSON fingerprint for data that is persisted in projects.data.
// PostgreSQL jsonb may return object keys in a different order than the browser created them.

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!value || typeof value !== "object") return value;

  return Object.keys(value)
    .filter((key) => value[key] !== undefined)
    .sort()
    .reduce((result, key) => {
      result[key] = canonicalize(value[key]);
      return result;
    }, {});
}

export function createProjectPersistenceFingerprint(value = {}) {
  try {
    return JSON.stringify(canonicalize(value));
  } catch {
    return null;
  }
}
