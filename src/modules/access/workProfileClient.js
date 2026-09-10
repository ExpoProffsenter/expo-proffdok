// Expo ProffDok – FASE 41B.3
// Klientkontrakt for serverstyrte arbeidsprofiler. Database/RLS er autoritativ.

import { rpcWithStoredSession } from "./moduleAccessClient.js";

export const WORK_PROFILE_EVENT = "expo-proffdok-work-profile";
export const WORK_PROFILE_GLOBAL = "__expoProffDokWorkProfile";

function normalizeState(payload = {}) {
  const workspaces = Array.isArray(payload?.workspaces) ? payload.workspaces : [];
  return {
    ...payload,
    workspaces,
    can_switch: Boolean(payload?.can_switch),
    selection_required: Boolean(payload?.selection_required),
    active_company_id: String(payload?.active_company_id || ""),
    primary_company_id: String(payload?.primary_company_id || ""),
    active_company_profile: payload?.active_company_profile || null,
  };
}

export function publishWorkProfileState(payload = {}) {
  const next = normalizeState(payload);
  if (typeof window !== "undefined") {
    window[WORK_PROFILE_GLOBAL] = next;
    window.dispatchEvent(new CustomEvent(WORK_PROFILE_EVENT, { detail: next }));
  }
  return next;
}

export function readCachedWorkProfileState() {
  if (typeof window === "undefined") return normalizeState({});
  return normalizeState(window[WORK_PROFILE_GLOBAL] || {});
}

export async function getMyWorkProfileState() {
  const payload = await rpcWithStoredSession("get_my_work_profile_state");
  return publishWorkProfileState(payload || {});
}

export async function setActiveWorkProfile(companyId) {
  const payload = await rpcWithStoredSession("set_active_work_profile", {
    requested_company_id: companyId,
  });
  return publishWorkProfileState(payload || {});
}

export async function listManagedWorkProfiles() {
  const payload = await rpcWithStoredSession("list_managed_work_profiles");
  return {
    is_systemadmin: Boolean(payload?.is_systemadmin),
    companies: Array.isArray(payload?.companies) ? payload.companies : [],
    users: Array.isArray(payload?.users) ? payload.users : [],
  };
}

export async function setManagedWorkProfiles(userId, companyIds = []) {
  return rpcWithStoredSession("set_managed_work_profiles", {
    target_user_id: userId,
    requested_company_ids: companyIds,
  });
}
