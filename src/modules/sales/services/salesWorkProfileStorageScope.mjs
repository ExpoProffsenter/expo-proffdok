// Expo ProffDok – FASE 45B
// Ren resolver for lokal Sales-storage. Database/RLS er fortsatt autoritativ;
// denne sørger bare for at browser-cache/recovery følger aktivt Representerer.

function compactText(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function profileCompanyName(profile = {}) {
  return compactText(profile?.company_name || profile?.companyName);
}

function activeWorkProfileCompanyName(workProfileState = {}) {
  const active = workProfileState?.active_company_profile || {};
  return compactText(active?.company_name || active?.companyName);
}

export function resolveSalesStorageCompanyName({
  integrationMode = "preview",
  profile = null,
  workProfileState = null,
} = {}) {
  const fallback = profileCompanyName(profile || {});
  if (integrationMode !== "app") return fallback;
  return activeWorkProfileCompanyName(workProfileState || {}) || fallback;
}

export function buildSalesStorageScopedProfile(
  profile = null,
  companyName = ""
) {
  const resolvedCompanyName = compactText(companyName);
  if (!resolvedCompanyName) return profile;

  return {
    ...(profile || {}),
    company_name: resolvedCompanyName,
    companyName: resolvedCompanyName,
  };
}
