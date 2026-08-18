// FASE 29A2 / 29A5: Sikker server-side portalbro og signert Storage-opplasting
// for kunde- og underentreprenørtilgang.
// Ingen direkte offentlig lesing/skriving av public.projects skal ligge her.

const normalizePortalRole = (role = "kunde") => {
  const clean = String(role || "").trim().toLowerCase();
  return clean === "underleverandor" || clean === "underleverandør" || clean === "underentreprenør"
    ? "underleverandor"
    : "kunde";
};

export const normalizePortalAccessCode = (value = "") =>
  String(value || "").trim().replace(/\s+/g, "").toUpperCase();

export const portalAccessStorageKey = (projectId = "", role = "kunde") => {
  const id = String(projectId || "").trim();
  if (!id) return "";
  return `expoProffDokPortalAccess:${id}:${normalizePortalRole(role)}`;
};

const portalUploadSecretStorageKey = (projectId = "", role = "kunde") => {
  const id = String(projectId || "").trim();
  if (!id) return "";
  return `expoProffDokPortalUploadSecret:${id}:${normalizePortalRole(role)}`;
};

export const readStoredPortalAccessCode = (projectId = "", role = "kunde") => {
  const key = portalAccessStorageKey(projectId, role);
  if (!key || typeof window === "undefined") return "";
  try {
    return normalizePortalAccessCode(window.sessionStorage.getItem(key) || "");
  } catch {
    return "";
  }
};

export const storePortalAccessCode = (projectId = "", role = "kunde", code = "") => {
  const key = portalAccessStorageKey(projectId, role);
  const normalized = normalizePortalAccessCode(code);
  if (!key || !normalized || typeof window === "undefined") return false;
  try {
    window.sessionStorage.setItem(key, normalized);
    return true;
  } catch {
    return false;
  }
};

const readStoredPortalUploadSecret = (projectId = "", role = "kunde") => {
  const key = portalUploadSecretStorageKey(projectId, role);
  if (!key || typeof window === "undefined") return "";
  try {
    return String(window.sessionStorage.getItem(key) || "").trim().toLowerCase();
  } catch {
    return "";
  }
};

const storePortalUploadSecret = (projectId = "", role = "kunde", secret = "") => {
  const key = portalUploadSecretStorageKey(projectId, role);
  const normalized = String(secret || "").trim().toLowerCase();
  if (!key || !normalized || typeof window === "undefined") return false;
  try {
    window.sessionStorage.setItem(key, normalized);
    return true;
  } catch {
    return false;
  }
};

const clearStoredPortalUploadSecret = (projectId = "", role = "kunde") => {
  const key = portalUploadSecretStorageKey(projectId, role);
  if (!key || typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(key);
  } catch {
  }
};

export const clearStoredPortalAccessCode = (projectId = "", role = "kunde") => {
  const key = portalAccessStorageKey(projectId, role);
  if (key && typeof window !== "undefined") {
    try {
      window.sessionStorage.removeItem(key);
    } catch {
    }
  }
  clearStoredPortalUploadSecret(projectId, role);
};

const cleanPortalStorageFileName = (value = "") => {
  const clean = String(value || "")
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(-255);
  return clean || `bilde-${Date.now()}.jpg`;
};

const sha256Hex = async (value = "") => {
  if (typeof crypto === "undefined" || !crypto.subtle || typeof TextEncoder === "undefined") {
    throw new Error("Nettleseren støtter ikke sikker filsignering.");
  }
  const bytes = new TextEncoder().encode(String(value));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

export const buildPortalStorageUploadPath = async ({
  projectId,
  role = "kunde",
  area = "chat",
  fileName = ""
} = {}) => {
  const normalizedProjectId = String(projectId || "").trim().toLowerCase();
  const normalizedRole = normalizePortalRole(role);
  const normalizedArea = String(area || "").trim().toLowerCase();
  const normalizedFileName = cleanPortalStorageFileName(fileName);
  const uploadSecret = readStoredPortalUploadSecret(normalizedProjectId, normalizedRole);

  if (!normalizedProjectId || !uploadSecret) {
    throw new Error("Portaltilgangen må bekreftes på nytt før fil kan lastes opp.");
  }
  if (!['chat', 'photos', 'sjekklister', 'vedlegg'].includes(normalizedArea)) {
    throw new Error("Ugyldig område for portalopplasting.");
  }
  if (normalizedRole === "kunde" && normalizedArea !== "chat") {
    throw new Error("Kunden har ikke tilgang til denne filopplastingen.");
  }
  if (normalizedRole === "underleverandor" && !['chat', 'photos', 'sjekklister', 'vedlegg'].includes(normalizedArea)) {
    throw new Error("Underentreprenøren har ikke tilgang til denne filopplastingen.");
  }

  const signaturePayload = `${uploadSecret}:${normalizedProjectId}:${normalizedRole}:${normalizedArea}:${normalizedFileName}`;
  const signature = await sha256Hex(signaturePayload);
  return `portal/${normalizedRole}/${normalizedProjectId}/${normalizedArea}/${signature}/${normalizedFileName}`;
};

const installPortalStorageRewriter = (supabase, { projectId, role } = {}) => {
  if (!supabase?.storage || typeof supabase.storage.from !== "function") return;

  supabase.__expoPortalStorageContext = {
    projectId: String(projectId || "").trim().toLowerCase(),
    role: normalizePortalRole(role)
  };
  if (supabase.__expoPortalStorageRewriterInstalled) return;

  const originalFrom = supabase.storage.from.bind(supabase.storage);
  supabase.storage.from = (bucketId) => {
    const bucket = originalFrom(bucketId);
    if (!bucket || typeof bucket.upload !== "function") return bucket;

    const originalUpload = bucket.upload.bind(bucket);
    bucket.upload = async (path, file, options) => {
      const context = supabase.__expoPortalStorageContext;
      if (!context?.projectId || !context?.role) return originalUpload(path, file, options);

      const legacyParts = String(path || "").split("/").filter(Boolean);
      let area = "";
      if (bucketId === "chat-images") {
        area = "chat";
      } else if (
        bucketId === "project-images" &&
        context.role === "underleverandor" &&
        ['photos', 'sjekklister', 'vedlegg'].includes(String(legacyParts[0] || "").toLowerCase())
      ) {
        area = String(legacyParts[0] || "").toLowerCase();
      }

      if (!area) return originalUpload(path, file, options);

      try {
        const sourceFileName = legacyParts[legacyParts.length - 1] || file?.name || `bilde-${Date.now()}.jpg`;
        const signedPath = await buildPortalStorageUploadPath({
          projectId: context.projectId,
          role: context.role,
          area,
          fileName: sourceFileName
        });
        return originalUpload(signedPath, file, options);
      } catch (error) {
        return { data: null, error: error instanceof Error ? error : new Error(String(error || "Filopplasting feilet.")) };
      }
    };
    return bucket;
  };
  supabase.__expoPortalStorageRewriterInstalled = true;
};

const unwrapRpcData = (data) => Array.isArray(data) ? data[0] ?? null : data ?? null;

const runRpc = async (supabase, name, args) => {
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw error;
  return unwrapRpcData(data);
};

export const ensureProjectPortalAccess = async (supabase, {
  projectId,
  role = "kunde",
  forceNew = false
} = {}) => runRpc(supabase, "ensure_project_portal_access", {
  p_project_id: projectId,
  p_role: normalizePortalRole(role),
  p_force_new: !!forceNew
});

export const getProjectPortalAccessStatus = async (supabase, { projectId } = {}) =>
  runRpc(supabase, "get_project_portal_access_status", {
    p_project_id: projectId
  });

export const verifyProjectPortalAccess = async (supabase, {
  projectId,
  role = "kunde",
  code = ""
} = {}) => {
  const normalizedRole = normalizePortalRole(role);
  const result = await runRpc(supabase, "verify_project_portal_access", {
    p_project_id: projectId,
    p_role: normalizedRole,
    p_code: normalizePortalAccessCode(code)
  });

  if (result?.ok && result?.upload_secret) {
    storePortalUploadSecret(projectId, normalizedRole, result.upload_secret);
    installPortalStorageRewriter(supabase, { projectId, role: normalizedRole });
  } else if (!result?.ok) {
    clearStoredPortalUploadSecret(projectId, normalizedRole);
    if (supabase) supabase.__expoPortalStorageContext = null;
  }
  return result;
};

export const saveUnderleverandorProjectContribution = async (supabase, {
  projectId,
  code = "",
  updates = {}
} = {}) => runRpc(supabase, "save_underleverandor_project_contribution", {
  p_project_id: projectId,
  p_code: normalizePortalAccessCode(code),
  p_updates: updates && typeof updates === "object" ? updates : {}
});

export const appendCustomerProjectMessage = async (supabase, {
  projectId,
  code = "",
  text = "",
  imageUrl = "",
  imageName = "",
  imagePath = ""
} = {}) => runRpc(supabase, "append_customer_project_message", {
  p_project_id: projectId,
  p_code: normalizePortalAccessCode(code),
  p_text: String(text || ""),
  p_image_url: String(imageUrl || ""),
  p_image_name: String(imageName || ""),
  p_image_path: String(imagePath || "")
});

export const markCustomerProjectChatRead = async (supabase, {
  projectId,
  code = ""
} = {}) => runRpc(supabase, "mark_customer_project_chat_read", {
  p_project_id: projectId,
  p_code: normalizePortalAccessCode(code)
});
