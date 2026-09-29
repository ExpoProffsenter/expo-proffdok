import fs from "node:fs";
import assert from "node:assert/strict";

const read = (path) => fs.readFileSync(path, "utf8");
const migration = read("supabase/migrations/20260929134500_company_profile_contact_identity.sql");
const helperAccessMigration = read("supabase/migrations/20260929142000_harden_company_profile_helper_access.sql");
const client = read("src/modules/company/companyProfileClient.js");
const panel = read("src/modules/company/companyViewTools.js");
const main = read("src/main.jsx");
const salesCommunication = read("src/modules/sales/services/salesCommunication.js");
const salesContractModel = read("src/modules/sales/utils/salesContractModel.js");
const salesContractPdf = read("src/modules/sales/services/salesContractPdf.js");
const reportTools = read("src/modules/report/reportTools.js");

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
  "public.current_profile_is_systemadmin()",
  "from public.sales_company_memberships mine",
  "mine.user_id = auth.uid()",
  "mine.company_id = p_company_id",
  "revoke all on function public.work_profile_company_profile(uuid) from public, anon",
]) {
  assert(helperAccessMigration.includes(needle), "Firmaprofilhjelperen mangler firmascope-/ACL-vakt: " + needle);
}

for (const needle of [
  'getAppSupabaseClient',
  'rpcWithAppSession("get_my_company_profile")',
  'rpcWithAppSession("set_my_company_profile"',
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

for (const needle of [
  'client.rpc("get_my_work_profile_state")',
  "active_company_profile",
  "orgNumber: profile.orgNumber",
  "phone: profile.phone",
  "email: profile.email",
  "logoUrl: profile.logoUrl || DEFAULT_COMPANY_LOGO_URL",
]) {
  assert(salesCommunication.includes(needle), "Tilbud/kontrakt mangler delt firmaprofil: " + needle);
}

for (const needle of [
  "org_number: profile?.orgNumber",
  "address: profile?.address",
  "phone: profile?.phone",
  "email: profile?.email",
  "website: profile?.website",
  "logo_url: profile?.logoUrl",
]) {
  assert(salesContractModel.includes(needle), "Kontrakt-snapshot mangler firmadata: " + needle);
}

for (const needle of [
  '{ label: "Utførende firma", value: company.name }',
  '{ label: "Organisasjonsnummer", value: company.org }',
  '{ label: "Firmaadresse", value: company.address }',
  '{ label: "E-post firma", value: company.email }',
  '{ label: "Telefon firma", value: company.phone }',
  '{ label: "Nettside firma", value: company.website }',
]) {
  assert(salesContractPdf.includes(needle), "Kontrakt-PDF mangler firmadata: " + needle);
}

for (const needle of [
  '["Utførende firma", name || company.companyName || "Expo ProffDok"]',
  '["Adresse", company.address]',
  '["Org.nr", company.orgNumber]',
  '["E-post", company.email]',
  '["Nettside", company.website]',
  '["Prosjektansvarlig", project.responsible]',
]) {
  assert(reportTools.includes(needle), "Prosjektrapporten mangler firma-/ansvarligdata: " + needle);
}

assert(
  main.includes('responsible: user?.name || authUser?.email || ""'),
  "Nye prosjekter må fortsatt bruke innlogget bruker som standard prosjektansvarlig."
);

const saveStart = main.indexOf("    const saveProfile = async () => {");
const saveEnd = main.indexOf("    const loadAdminUsers = async () => {", saveStart);
assert(saveStart >= 0 && saveEnd > saveStart, "Fant ikke saveProfile-blokken.");
const saveProfile = main.slice(saveStart, saveEnd);
assert(
  !saveProfile.includes("email: company.email || authUser.email"),
  "Firmaprofil må ikke skrive firma-e-post til brukerens profiles.email."
);

console.log("critical-company-profile-check: OK");
