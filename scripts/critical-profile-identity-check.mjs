import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(`Profilidentitet-check feilet: ${message}`);
};

const main = read("src/main.jsx");
const profilePanelStart = main.indexOf('tab === "innlogging" &&');
const profilePanelEnd = main.indexOf('tab === "prosjektering"', profilePanelStart);
assert(profilePanelStart >= 0 && profilePanelEnd > profilePanelStart, "fant ikke brukerprofilpanelet");
const profilePanel = main.slice(profilePanelStart, profilePanelEnd);

for (const needle of [
  "const applyProfile = (row, identityUser = authUser) => {",
  "identityUser?.user_metadata?.full_name",
  "identityUser?.user_metadata?.name",
  "name: authenticatedName || current.name || \"\"",
  "applyProfile(data, sessionUser);",
]) {
  assert(main.includes(needle), `src/main.jsx mangler ${needle}`);
}
assert(!main.includes('name: row.full_name || current.name || ""'), "navn må ikke leses fra en profiles.full_name-kolonne som ikke finnes");

for (const needle of [
  'label: "Rolle i prosjekt/rapport"',
  "Dette endrer ikke konto-, firma- eller systemtilgang",
  "Brukere og tilganger",
  "Supportmodus – prosjektets rapportopplysninger",
  'title: isProjectSupportReadOnly ? "Prosjektets rapportopplysninger" : "Innlogging og brukerprofil"',
  'isProjectSupportReadOnly ? "Navn i prosjektets rapport" : "Navn"',
  'isProjectSupportReadOnly ? "E-post i prosjektets rapport" : "E-post i rapport"',
  'label: "Rolle i prosjektets rapport"',
  "Opplysningene nedenfor er lagret i prosjektet",
  "Ditt personlige e-postvalg vises ikke i supportmodus",
  "!isProjectSupportReadOnly &&",
]) {
  assert(profilePanel.includes(needle), `brukerprofilpanelet mangler ${needle}`);
}
assert(!profilePanel.includes('label: "Rolle"'), "generisk Rolle-etikett kan feilaktig oppfattes som en tilgangsrolle");
assert(
  profilePanel.indexOf("!isProjectSupportReadOnly &&") < profilePanel.indexOf("MarketingEmailPreference"),
  "personlig e-postvalg må skjules mens et annet firmas prosjekt vises i supportmodus"
);

const emailPreference = read("supabase/migrations/20260928155108_systemadmin_broadcast_email.sql");
for (const needle of [
  "create or replace function public.get_my_marketing_email_preference()",
  "create or replace function public.set_my_marketing_email_preference(p_opt_in boolean)",
  "v_uid uuid := auth.uid()",
  "where user_id = v_uid",
]) {
  assert(emailPreference.includes(needle), `personlig e-postvalg mangler kontosperre: ${needle}`);
}

const roleGuard = read("supabase/migrations/20260911131500_fase41b3g_approval_guard.sql");
for (const needle of [
  "if new.system_role is distinct from old.system_role",
  "or new.is_admin is distinct from old.is_admin",
  "or new.role is distinct from old.role",
  "Systemrolle og systemtilknytning kan bare endres av systemadministrator",
  "Egen rolle, godkjenning eller deaktivering kan ikke endres direkte",
]) {
  assert(roleGuard.includes(needle), `databasesperren mangler ${needle}`);
}

console.log("✅ Expo ProffDok profilnavn / rapportrolle / rolleeskalering check OK");
