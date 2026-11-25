import fs from "node:fs";
import assert from "node:assert/strict";

const read = (path) => fs.readFileSync(path, "utf8");
const migration = read("supabase/migrations/20260929123032_company_invite_and_general_offer_access.sql");
const guardMarkerMigration = read("supabase/migrations/20260929131000_limit_company_invite_guard_marker.sql");
const hardeningMigration = read("supabase/migrations/20260929132500_harden_company_module_access.sql");
const main = read("src/main.jsx");
const signup = read("src/modules/auth/companySignupOnboarding.js");
const client = read("src/modules/access/moduleAccessClient.js");
const companyAdmin = read("src/modules/access/systemAdminCompanyAccessUx.jsx");
const unifiedUser = read("src/modules/access/systemAdminUnifiedUserAccessUx.jsx");
const firmaAdmin = read("src/modules/access/firmaAdminProNetPriceUx.js");
const help = read("src/modules/help/help45b.js");

for (const needle of [
  "create table if not exists public.company_module_access",
  "company_has_store_offers_access",
  "set_company_store_offers_access",
  "sync_company_store_offers_users",
  "accept_company_user_invite",
  "expo.accepting_company_invite",
  "Kontoen er deaktivert og må behandles av Systemadministrator",
  "inviter.company_role = 'firmaadmin'",
  "inviter.system_role = 'systemadmin'",
  "company_store_offers_enabled",
  "Generelle tilbud styres samlet for hele firmaet av Systemadministrator",
  "Firmaadministrator kan ikke gi seg selv prisinnsyn",
]) {
  assert(migration.includes(needle), `Ny firma-/invitasjonskontrakt mangler: ${needle}`);
}

assert(
  migration.includes("join public.user_module_access uma") &&
    migration.includes("uma.module_key = 'store_offers'") &&
    migration.includes("on conflict (company_id, module_key) do nothing"),
  "Eksisterende Generelle tilbud må seedes som firmatilgang uten å overskrive senere valg."
);
assert(
  migration.includes("cross join unnest(array['sales', 'store_offers']::text[]) as module_row(module_key)") &&
    migration.includes("perform public.sync_company_store_offers_users(v_company_id)"),
  "Alle eksisterende og nye firmabrukere må arve sales/store_offers."
);
assert(
  migration.includes("revoke all on public.company_module_access from anon, authenticated") &&
    migration.includes("revoke all on function public.sync_company_store_offers_users(uuid) from public, anon, authenticated") &&
    hardeningMigration.includes("company_module_access_granted_by_idx") &&
    hardeningMigration.includes("company_has_store_offers_access(uuid)"),
  "Firmatilgangstabell og intern synkfunksjon skal ikke være direkte klienttilgjengelig."
);
assert(
  migration.includes("set_config('expo.accepting_company_invite', 'off', true)") &&
    guardMarkerMigration.includes("set_config('expo.accepting_company_invite', 'off', true)"),
  "Den validerte invitasjonsmarkøren må slås av straks profiloppdateringen er ferdig."
);

assert(main.includes('supabase.rpc("accept_company_user_invite")'), "Innlogging må bruke autoritativ invitasjons-RPC.");
assert(main.includes("?signup=1&invited=1&email="), "Invitasjonslenken må åpne eksplisitt invitert registrering.");
assert(main.includes("invitationAcceptedImmediately"), "Eksisterende konto uten ferdig firmatilknytning må beholde en ventende invitasjon.");
assert(main.includes("Det kreves ingen ny Systemadmin-godkjenning"), "Firmaadmin må få korrekt beskjed om godkjenningsflyten.");
assert(!main.includes("(ikke i registrerte firmaer)"), "Gyldig firma skal ikke vises som en falsk uregistrert duplikatverdi.");
assert(read("src/modules/auth/authLanding.css").includes("inviterte brukere kobles automatisk til firmaet"), "Registreringsoverskriften må skille inviterte brukere fra nye firma.");

for (const needle of [
  "readInviteContext",
  "params.get('invited') !== '1'",
  "mode: 'invite'",
  "kobles kontoen automatisk",
]) {
  assert(signup.includes(needle), `Invitert registrerings-UX mangler: ${needle}`);
}

for (const needle of [
  "get_company_store_offers_access",
  "set_company_store_offers_access",
  'source: "company-store-offers-access"',
]) {
  assert(client.includes(needle), `Klient for firmatilgang mangler: ${needle}`);
}

for (const needle of [
  "CompanyStoreOffersAccess",
  "Gjelder alle brukere i firmaet",
  "Alle nåværende og nye brukere i firmaet får modulen",
  "Firmaets individuelle tilganger til «Din nto pris» fjernes samtidig",
]) {
  assert(companyAdmin.includes(needle), `Systemadmin-firmaflaten mangler: ${needle}`);
}
assert(
  companyAdmin.includes("companyKey(user.company_scope_id, user.company_name) === activeCompanyKey") &&
    !companyAdmin.includes("companyKey(user.company_scope_id, user.company_name) === activeCompanyKey &&\n    userMatchesStatus") &&
    !companyAdmin.includes("companyAdminLegacyNormalized") &&
    companyAdmin.includes('allButton?.classList.contains("secondary")'),
  "Åpnet firma må vise alle brukerne selv om et skjult legacy-filter var aktivt."
);

for (const needle of [
  "company_store_offers_enabled",
  "Aktivert for alle brukere i firmaet",
  'module.key === "sales" && companyStoreEnabled',
]) {
  assert(unifiedUser.includes(needle), `Brukerkortet mangler firmadekkende modulvern: ${needle}`);
}
assert(firmaAdmin.includes("company_store_offers_enabled"), "Firmaadmin-flaten må lese samme firmatilgang.");
assert(help.includes("Tilgangen gjelder automatisk alle nåværende og nye brukere i firmaet"), "Hjelp må forklare firmatilgangen.");
assert(help.includes("gyldig invitasjon fra Firmaadmin"), "Hjelp må forklare automatisk godkjenning av inviterte brukere.");

console.log("critical-company-invite-access-check: OK");
