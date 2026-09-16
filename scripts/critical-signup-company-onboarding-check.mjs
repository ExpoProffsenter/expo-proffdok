import fs from 'node:fs';

function read(path) {
  return fs.readFileSync(path, 'utf8');
}

function requireNeedles(path, needles) {
  const text = read(path);
  for (const needle of needles) {
    if (!text.includes(needle)) {
      throw new Error(`${path}: mangler Fase 42N-kontrakt: ${needle}`);
    }
  }
  return text;
}

const main = requireNeedles('src/main.jsx', [
  'const signUp = async () => {',
  'supabase.auth.signUp({',
  'notifySystemAdminsAboutSignup(cleanEmail, cleanName, cleanMobile)',
  'setAuthMode("login")',
  'company_user_invites',
  '["firmaadmin", "Firma"]',
]);

if (main.includes('expo_proffdok_company_name') || main.includes('signup_company_application_available')) {
  throw new Error('Fase 42N skal ikke bygges inn i main.jsx; eksisterende Auth-kjerne skal forbli urørt.');
}

requireNeedles('index.html', [
  'installCompanySignupOnboarding',
  "'/src/modules/auth/companySignupOnboarding.js'",
  'installCompanyAdminNavigationLabel',
  "'/src/modules/company/companyAdminNavigationLabel.js'",
]);

const ux = requireNeedles('src/modules/auth/companySignupOnboarding.js', [
  'Send registrering',
  'FIRMAOPPLYSNINGER',
  'Jeg er invitert til et eksisterende firma',
  'Firmanavn',
  'Organisasjonsnummer',
  'Firmaadresse (gate, postnr. og sted)',
  'Firmatelefon',
  'Nettside (valgfritt)',
  "endpoint.pathname = '/rest/v1/rpc/signup_company_application_available'",
  "request.method !== 'POST'",
  'auth\\/v1\\/signup',
]);

for (const needle of [
  'expo_proffdok_signup_mode',
  'expo_proffdok_company_name',
  'expo_proffdok_org_number',
  'expo_proffdok_company_address',
  'expo_proffdok_company_phone',
  'expo_proffdok_company_website',
]) {
  if (!ux.includes(needle)) throw new Error(`Mangler signup-metadata: ${needle}`);
}

if (!ux.includes("checked.draft.mode === 'invite'")) {
  throw new Error('Eksisterende firmainvitasjon må ha en eksplisitt urørt signup-vei.');
}
if (!ux.includes('nativeFetch(nextRequest)')) {
  throw new Error('42N skal supplere dagens signup-request og ikke erstatte React sin øvrige auth-flyt.');
}

const companyAdminLabel = requireNeedles('src/modules/company/companyAdminNavigationLabel.js', [
  "normalizeText(button.textContent) === 'Firma'",
  "companyAdminButton.textContent = 'Firmaadmin'",
  "companyAdminButton.dataset.expoCompanyAdminLabel = '1'",
  "labels.includes('Firmaprofil')",
  "labels.includes('Hjelp')",
]);
if (companyAdminLabel.includes("addEventListener('click'") || companyAdminLabel.includes('.click()')) {
  throw new Error('Firmaadmin-etiketten skal ikke overta eller endre native navigasjonshandling.');
}

const migration = requireNeedles('supabase/migrations/20260916152000_fase42n_signup_company_onboarding.sql', [
  'signup_company_application_available',
  'handle_auth_signup_company_application',
  'after insert on auth.users',
  "if v_mode <> 'new_company' then",
  'false,',
  "'firmaadmin'",
  'existing_company',
  'public.profiles',
  'public.companies',
  'public.sales_company_scopes',
  'grant execute on function public.signup_company_application_available(text, text) to anon, authenticated, service_role',
]);

if (/approved\s*=\s*true/i.test(migration) || /values\s*\([^;]*true\s*,\s*false/i.test(migration)) {
  throw new Error('Nyregistrering skal aldri godkjenne brukeren automatisk.');
}
if (!migration.includes("raise exception 'Firmaet finnes allerede i Expo ProffDok. Be firmaadministrator invitere deg.'")) {
  throw new Error('Backend må stoppe forsøk på å registrere eksisterende firma som nytt firma.');
}

requireNeedles('supabase/migrations/20260915155500_fase42k_company_approval_and_internal_access_policy.sql', [
  'fase42k_require_company_before_approval',
  'Velg firma før brukeren godkjennes',
]);

console.log('✅ Expo ProffDok Fase 42N firmaregistrering/godkjenning/Firmaadmin-navn check OK');
