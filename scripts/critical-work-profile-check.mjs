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

requireNeedles("src/modules/access/workProfileClient.js", [
  "get_my_work_profile_state",
  "set_active_work_profile",
  "list_managed_work_profiles",
  "set_managed_work_profiles",
  "WORK_PROFILE_EVENT",
]);

const switcher = requireNeedles("src/modules/access/workProfileUx.jsx", [
  "Velg arbeidsprofil",
  "Arbeidsprofil",
  "setActiveWorkProfile",
  "window.location.assign(window.location.pathname)",
  "active_company_profile",
  "SYSTEMADMIN SUPPORTMODUS",
  "id === activeId && !state?.selection_required",
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

console.log("✅ Expo ProffDok arbeidsprofiler / flerfirma check OK");
