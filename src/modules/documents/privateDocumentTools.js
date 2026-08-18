// FASE 29B: Felles bro for gamle offentlige og nye private prosjektdokumenter.
// Eksisterende project-images-filer skal fortsatt kunne åpnes. Nye sensitive dokumenter
// lagres i project-documents-private og får en varig Expo ProffDok-lenke som først lager
// en kortlivet Storage-URL når dokumentet faktisk åpnes.

export const PRIVATE_DOCUMENT_BUCKET = "project-documents-private";
export const LEGACY_PUBLIC_DOCUMENT_BUCKET = "project-images";
export const DEFAULT_PRIVATE_DOCUMENT_URL_TTL_SECONDS = 10 * 60;
export const EXPO_PROFFDOK_CANONICAL_URL = "https://expo-proffdok.app/";

const sanitizePathPart = (value = "", fallback = "fil") => {
  const clean = String(value || "")
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "");
  return clean || fallback;
};

export const isPrivateDocumentFile = (file = {}) =>
  file?.private === true ||
  file?.isPrivate === true ||
  String(file?.bucket || file?.storageBucket || "").trim() === PRIVATE_DOCUMENT_BUCKET;

export const hasStoredDocumentReference = (file = {}) => {
  if (!file || typeof file !== "object") return false;
  if (String(file?.url || file?.href || "").trim()) return true;
  return Boolean(String(file?.path || file?.storagePath || file?.filePath || "").trim());
};

export const documentStorageBucket = (file = {}) => {
  const explicit = String(file?.bucket || file?.storageBucket || "").trim();
  if (explicit) return explicit;
  return isPrivateDocumentFile(file)
    ? PRIVATE_DOCUMENT_BUCKET
    : LEGACY_PUBLIC_DOCUMENT_BUCKET;
};

export const documentStoragePath = (file = {}) =>
  String(file?.path || file?.storagePath || file?.filePath || "").trim();

export const buildPrivateDocumentAppUrl = ({
  path,
  projectId = "",
  role = "kunde",
  download = false
} = {}) => {
  const cleanPath = String(path || "").trim().replace(/^\/+/, "");
  if (!cleanPath) return "";
  const url = new URL(EXPO_PROFFDOK_CANONICAL_URL);
  url.searchParams.set("privateDocument", "1");
  url.searchParams.set("path", cleanPath);
  if (projectId) url.searchParams.set("project", String(projectId).trim());
  if (projectId && role) url.searchParams.set("role", String(role).trim().toLowerCase());
  if (download) url.searchParams.set("download", "1");
  return url.toString();
};

export const buildPrivateSalesDocumentPath = ({
  companyScopeId,
  requestRef,
  category = "documents",
  fileName = "document"
} = {}) => {
  const scope = sanitizePathPart(companyScopeId, "scope");
  const request = sanitizePathPart(requestRef, "request");
  const type = sanitizePathPart(category, "documents");
  const name = sanitizePathPart(fileName, `document-${Date.now()}`);
  return `${scope}/sales/${request}/${type}/${Date.now()}-${crypto.randomUUID()}-${name}`;
};

export const buildPrivateProjectDocumentPath = ({
  companyScopeId,
  projectId,
  category = "documents",
  fileName = "document"
} = {}) => {
  const scope = sanitizePathPart(companyScopeId, "scope");
  const project = sanitizePathPart(projectId, "project");
  const type = sanitizePathPart(category, "documents");
  const name = sanitizePathPart(fileName, `document-${Date.now()}`);
  return `${scope}/projects/${project}/${type}/${Date.now()}-${crypto.randomUUID()}-${name}`;
};

export const withPrivateDocumentProjectAccess = (
  file = {},
  { projectId = "", role = "kunde" } = {}
) => {
  if (!isPrivateDocumentFile(file)) return file;
  const path = documentStoragePath(file);
  return {
    ...file,
    url: buildPrivateDocumentAppUrl({ path, projectId, role })
  };
};

export async function uploadPrivateDocument(
  client,
  {
    path,
    file,
    name = "",
    documentType = "document",
    createdBy = "",
    projectId = "",
    role = "kunde",
    uploadOptions = {}
  } = {}
) {
  if (!client?.storage || !path || !file) {
    throw new Error("Mangler Storage-klient, fil eller privat dokumentpath.");
  }

  const { data, error } = await client.storage
    .from(PRIVATE_DOCUMENT_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      ...uploadOptions
    });

  if (error) throw error;

  const storedPath = String(data?.path || path);
  return {
    id: typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name: name || file?.name || "Dokument",
    url: buildPrivateDocumentAppUrl({ path: storedPath, projectId, role }),
    path: storedPath,
    storagePath: storedPath,
    bucket: PRIVATE_DOCUMENT_BUCKET,
    storageBucket: PRIVATE_DOCUMENT_BUCKET,
    private: true,
    isPrivate: true,
    type: file?.type || uploadOptions?.contentType || "application/octet-stream",
    mimeType: file?.type || uploadOptions?.contentType || "application/octet-stream",
    size: Number(file?.size || 0),
    created: new Date().toLocaleString("no-NO"),
    createdAt: new Date().toISOString(),
    by: createdBy || "",
    documentType
  };
}

export async function createDocumentAccessUrl(
  client,
  file = {},
  {
    expiresIn = DEFAULT_PRIVATE_DOCUMENT_URL_TTL_SECONDS,
    download = false
  } = {}
) {
  if (!hasStoredDocumentReference(file)) {
    throw new Error("Dokumentet mangler filreferanse.");
  }

  if (!isPrivateDocumentFile(file)) {
    const directUrl = String(file?.url || file?.href || "").trim();
    if (directUrl) return directUrl;

    const path = documentStoragePath(file);
    const bucket = documentStorageBucket(file);
    const { data } = client.storage.from(bucket).getPublicUrl(path);
    if (!data?.publicUrl) throw new Error("Kunne ikke lage offentlig dokumentlenke.");
    return data.publicUrl;
  }

  const path = documentStoragePath(file);
  if (!path) throw new Error("Privat dokument mangler Storage-path.");

  const signedOptions = download
    ? { download: file?.name || true }
    : undefined;
  const { data, error } = await client.storage
    .from(documentStorageBucket(file))
    .createSignedUrl(path, expiresIn, signedOptions);

  if (error) throw error;
  if (!data?.signedUrl) throw new Error("Kunne ikke lage sikker dokumentlenke.");
  return data.signedUrl;
}

export async function openStoredDocument(
  client,
  file = {},
  {
    download = false,
    expiresIn = DEFAULT_PRIVATE_DOCUMENT_URL_TTL_SECONDS
  } = {}
) {
  const reservedWindow = !download && typeof window !== "undefined"
    ? window.open("", "_blank")
    : null;

  try {
    const url = await createDocumentAccessUrl(client, file, { expiresIn, download });

    if (download && typeof document !== "undefined") {
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = file?.name || "dokument";
      anchor.rel = "noopener noreferrer";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      return url;
    }

    if (reservedWindow && !reservedWindow.closed) {
      reservedWindow.location.replace(url);
      return url;
    }

    if (typeof window !== "undefined") {
      window.open(url, "_blank", "noopener,noreferrer");
    }
    return url;
  } catch (error) {
    if (reservedWindow && !reservedWindow.closed) reservedWindow.close();
    throw error;
  }
}

export async function removeStoredDocument(client, file = {}) {
  const path = documentStoragePath(file);
  if (!client?.storage || !path) return { data: null, error: null };
  return client.storage.from(documentStorageBucket(file)).remove([path]);
}
