import fs from "node:fs";

function read(path) {
  return fs.readFileSync(path, "utf8");
}

function requireNeedles(path, needles) {
  const text = read(path);
  for (const needle of needles) {
    if (!text.includes(needle)) throw new Error(`${path}: mangler 41B.3-guard: ${needle}`);
  }
  return text;
}

const foundation = requireNeedles("supabase/migrations/20260910142000_fase41b3a_work_profile_foundation.sql", [
  "user_active_company_scope",
  "current_active_company_scope_id",
  "get_my_work_profile_state",
  "set_active_work_profile",
  "set_managed_work_profiles",
  "Ringside Rørleggerbedrift AS",
  "Bademiljø Expo",
  "Expo Proffsenter",
  "v_id=v_primary_id",
  "Kun systemadministrator kan endre arbeidsprofiler",
]);
if (foundation.includes("delete from public.projects") || foundation.includes("delete from public.sales_requests")) {
  throw new Error("Arbeidsprofil-foundation skal aldri flytte/slette historiske prosjekter eller tilbud.");
}

requireNeedles("supabase/migrations/20260910142500_fase41b3b_active_work_profile_scope.sql", [
  "current_sales_company_scope_id",
  "current_active_company_scope_id",
  "project_row_access_allowed",
  "project_row_delete_allowed",
  "p_user_id=auth.uid()",
  "current_user_has_multiple_work_profiles",
]);

const sharedProjects = requireNeedles("supabase/migrations/20260910151200_fase41b3_shared_project_list.sql", [
  "list_active_work_profile_projects",
  "current_user_has_module_access('projects')",
  "current_user_has_multiple_work_profiles",
  "project_row_access_allowed",
]);
if (/\b(insert|update|delete|truncate)\b/i.test(sharedProjects.replace(/--.*$/gm, ""))) {
  throw new Error("Felles prosjektliste skal være read-only.");
}

requireNeedles("supabase/migrations/20260910151800_fase41b3_managed_work_profile_metadata.sql", [
  "list_managed_work_profiles",
  "system_role",
  "approved",
  "deactivated",
  "workspace_company_ids",
]);

requireNeedles("supabase/migrations/20260910152200_fase41b3_work_profile_target_guard.sql", [
  "Systemadministrator bruker ikke ekstra arbeidsprofiler",
  "Arbeidsprofiler kan bare gis til godkjente, aktive brukere",
  "coalesce(v_profile.approved,false)",
  "coalesce(v_profile.deactivated,false)",
  "Kun systemadministrator kan endre arbeidsprofiler",
]);

const adminRepresentation = requireNeedles("supabase/migrations/20260910161200_fase41b3d_systemadmin_representation.sql", [
  "current_profile_is_systemadmin()",
  "is_internal_work_profile_company(a.company_id)",
  "'is_systemadmin', state.is_systemadmin",
  "not state.is_systemadmin",
  "not public.current_profile_is_systemadmin() and not exists",
  "Dette er ikke supportmodus",
]);
if (/insert\s+into\s+public\.sales_company_memberships/i.test(adminRepresentation)) {
  throw new Error("Systemadmins representasjonsvalg skal ikke opprette ekstra firmamedlemskap.");
}

const companyProfileGuard = requireNeedles("supabase/migrations/20260910162600_fase41b3e_company_profile_source_guard.sql", [
  "work_profile_company_profile",
  "sales_normalize_company_name(p.company_name) = s.normalized_name",
  "/brands/ringside-rorleggerbedrift.png",
  "/brands/bademiljo-expo-ringside.png",
  "Expo Proffsenter",
  "'/expo-logo.png'",
]);
if (!companyProfileGuard.includes("Ekstra arbeidsprofil") || !companyProfileGuard.includes("aldri kunne låne logo/kontaktdata")) {
  throw new Error("Firmabranding må være eksplisitt beskyttet mot data fra ekstra arbeidsprofiler.");
}

requireNeedles("src/modules/access/workProfileClient.js", [
  "get_my_work_profile_state",
  "set_active_work_profile",
  "list_managed_work_profiles",
  "set_managed_work_profiles",
  "WORK_PROFILE_EVENT",
  "is_systemadmin: Boolean(payload?.is_systemadmin)",
]);

const switcher = requireNeedles("src/modules/access/workProfileUx.jsx", [
  "Velg arbeidsprofil",
  "Arbeidsprofil",
  "Representerer",
  "Nye tilbud og prosjekter opprettes på valgt firma",
  "setActiveWorkProfile",
  "window.location.assign(window.location.pathname)",
  "active_company_profile",
  "SYSTEMADMIN SUPPORTMODUS",
  "id === activeId && !state?.selection_required",
  "let rootHost = null",
  "rootHost !== host",
  "host.parentElement !== head",
  "!state?.selection_required ? (",
]);
if (/localStorage\s*\.\s*setItem/.test(switcher)) {
  throw new Error("Aktiv arbeidsprofil skal lagres server-side, ikke i localStorage.");
}

requireNeedles("src/modules/access/systemAdminWorkProfileUx.jsx", [
  "Arbeidsprofiler",
  "Ekstra arbeidsprofil",
  "Primærfirma",
  "setManagedWorkProfiles",
  "disabled={isPrimary || saving}",
  "!user.approved || user.deactivated || user.system_role === \"systemadmin\"",
  "target?.closest(`[${MOUNT_ATTR}]`)",
]);

requireNeedles("src/modules/company/companyViewTools.js", [
  "getSystemAdminRepresentationContext",
  "Du representerer nå ${representation.activeCompanyName} for nye tilbud og prosjekter",
  "Her redigerer du fortsatt din primære firmaprofil",
]);

requireNeedles("src/modules/sales/services/salesCommunication.js", [
  "get_my_work_profile_state",
  "active_company_profile",
  "fetchActiveWorkProfile",
]);

requireNeedles("src/modules/access/workProfileProjectListUx.jsx", [
  "Felles prosjekter i",
  "list_active_work_profile_projects",
  "Dine egne prosjektkort vises fortsatt",
  "openProject(item",
]);

requireNeedles("index.html", [
  "installSystemAdminWorkProfileUx",
  "installWorkProfileUx",
  "installWorkProfileProjectListUx",
]);

console.log("✅ Expo ProffDok arbeidsprofiler / flerfirma / systemadmin representasjon / firmabranding check OK");
