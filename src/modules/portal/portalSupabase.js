// FASE 29A2: Sikker server-side portalbro for kunde- og underentreprenørtilgang.
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

export const clearStoredPortalAccessCode = (projectId = "", role = "kunde") => {
  const key = portalAccessStorageKey(projectId, role);
  if (!key || typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(key);
  } catch {
  }
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
} = {}) => runRpc(supabase, "verify_project_portal_access", {
  p_project_id: projectId,
  p_role: normalizePortalRole(role),
  p_code: normalizePortalAccessCode(code)
});

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
