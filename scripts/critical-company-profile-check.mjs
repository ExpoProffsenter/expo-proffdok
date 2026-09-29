import fs from "node:fs";
import assert from "node:assert/strict";

const read = (path) => fs.readFileSync(path, "utf8");
const migration = read("supabase/migrations/20260929134500_company_profile_contact_identity.sql");
const client = read("src/modules/company/companyProfileClient.js");
const panel = read("src/modules/company/companyViewTools.js");
const main = read("src/main.jsx");

for (const needle of [
  "create or replace function public.get_my_company_profile()",
  "create or replace function public.set_my_company_profile(",
  "public.current_primary_company_scope_id()",
  "Kun Firmaadmin eller Systemadministrator kan endre firmaprofilen",
  "Foretaksnummer må inneholde 9 sifre",
  "Firmaadresse må fylles ut",
  "Firmatelefon må inneholde minst 8 sifre",
  "Skriv inn en gyldig firma-e-post",
  "update public.companies",
]) {
  assert(migration.includes(needle), "Firmaprofilkontrakten mangler: " + needle);
}

assert(
  !/update\s+public\.profiles[\s\S]{0,500}\bemail\s*=/i.test(migration),
  "Firma-e-post må aldri endre profiles.email eller brukerens innlogging."
);
assert(
  migration.includes("revoke all on function public.set_my_company_profile") &&
    migration.includes("grant execute on function public.set_my_company_profile") &&
    migration.includes("to authenticated"),
  "Skrive-RPC-en må være lukket for anon og eksplisitt åpnet for innloggede brukere."
);

for (const needle of [
  'rpcWithStoredSession("get_my_company_profile")',
  'rpcWithStoredSession("set_my_company_profile"',
  "p_org_number",
  "p_email",
]) {
  assert(client.includes(needle), "Firmaprofilklienten mangler: " + needle);
}

for (const needle of [
  "Firmaprofilen er felles for alle brukere",
  "Den endrer ikke e-postadressen du logger inn med",
  'label: "Foretaksnummer *"',
  'label: "Adresse *"',
  'label: "Telefon *"',
  'label: "Firma-e-post *"',
  "Firmaprofilen kan endres av Firmaadmin",
  "disabled: !canEdit",
]) {
  assert(panel.includes(needle), "Firmaprofilvisningen mangler: " + needle);
}

for (const needle of [
  "getMyCompanyProfile",
  "setMyCompanyProfile",
  "companyProfileDraft",
  "await loadMyCompanyProfile(data)",
  "Firmaets e-post endrer ikke innloggingen din",
]) {
  assert(main.includes(needle), "Hovedappen mangler felles firmaprofil: " + needle);
}

const saveStart = main.indexOf("    const saveProfile = async () => {");
const saveEnd = main.indexOf("    const loadAdminUsers = async () => {", saveStart);
assert(saveStart >= 0 && saveEnd > saveStart, "Fant ikke saveProfile-blokken.");
const saveProfile = main.slice(saveStart, saveEnd);
assert(
  !saveProfile.includes("email: company.email || authUser.email"),
  "Firmaprofil må ikke skrive firma-e-post til brukerens profiles.email."
);

console.log("critical-company-profile-check: OK");
