import fs from "node:fs";
import {
  buildUnsubscribeUrl,
  expoProffsenterFrom,
  renderBroadcastEmail,
  selectBroadcastRecipients,
} from "../supabase/functions/_shared/systemadmin-broadcast-email.mjs";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(`Systemadmin e-post-check feilet: ${message}`);
};
const requireNeedles = (path, needles) => {
  const text = read(path);
  for (const needle of needles) {
    assert(text.includes(needle), `${path} mangler ${needle}`);
  }
  return text;
};

const authUsers = [
  { id: "u1", email: "admin@example.no", user_metadata: { full_name: "Ada Admin" } },
  { id: "u2", email: "active@example.no" },
  { id: "u3", email: "pending@example.no" },
  { id: "u4", email: "off@example.no" },
  { id: "u5", email: "profileless@example.no" },
];
const profiles = [
  { id: "u1", approved: true, deactivated: false, system_role: "systemadmin" },
  { id: "u2", approved: true, deactivated: false },
  { id: "u3", approved: false, deactivated: false },
  { id: "u4", approved: false, deactivated: true },
];
const preferences = [
  { user_id: "u1", email_opt_in: true, unsubscribe_token: "token-1" },
  { user_id: "u3", email_opt_in: true, unsubscribe_token: "token-3" },
  { user_id: "u4", email_opt_in: true, unsubscribe_token: "token-4" },
];

const activeOperational = selectBroadcastRecipients({
  authUsers,
  profiles,
  preferences,
  recipientGroup: "active",
  messageType: "operational",
});
assert(activeOperational.eligibleCount === 2, "driftsmelding skal treffe begge aktive brukere");

const activeMarketing = selectBroadcastRecipients({
  authUsers,
  profiles,
  preferences,
  recipientGroup: "active",
  messageType: "marketing",
});
assert(activeMarketing.eligibleCount === 1, "markedsføring skal bare treffe aktiv bruker med samtykke");
assert(activeMarketing.excludedNoConsent === 1, "manglende samtykke skal telles som utelatt");
assert(activeMarketing.recipients[0].email === "admin@example.no", "mottaker skal normaliseres uten å eksponeres i UI");

const pending = selectBroadcastRecipients({
  authUsers,
  profiles,
  recipientGroup: "pending",
  messageType: "operational",
});
assert(pending.eligibleCount === 1, "venter-gruppen skal ikke ta med aktive eller deaktiverte");

const allRegistered = selectBroadcastRecipients({
  authUsers,
  profiles,
  recipientGroup: "all_registered",
  messageType: "operational",
});
assert(allRegistered.eligibleCount === 4, "alle registrerte skal utelate deaktiverte, men ta med profil-løse auth-brukere");

const rendered = renderBroadcastEmail({
  subject: "Viktig <test>",
  message: "Hei <script>alert(1)</script>",
  messageType: "marketing",
  unsubscribeUrl: "https://example.no/unsubscribe?token=abc",
});
assert(!rendered.html.includes("<script>"), "brukertekst skal HTML-escapes");
assert(rendered.html.includes("Endre eller avslutt e-postsamtykket"), "markedsføring skal ha synlig avmelding");
assert(rendered.text.includes("Avmelding:"), "tekstversjonen skal ha avmelding");
assert(expoProffsenterFrom("Expo ProffDok <post@example.no>") === "Expo Proffsenter <post@example.no>", "avsendernavnet skal være Expo Proffsenter");
assert(buildUnsubscribeUrl("https://abc.supabase.co/", "a b").endsWith("token=a%20b"), "avmeldingstoken skal URL-kodes");

const migration = requireNeedles("supabase/migrations/20260928155108_systemadmin_broadcast_email.sql", [
  "create table if not exists public.marketing_email_preferences",
  "unsubscribe_token uuid not null default gen_random_uuid()",
  "create table if not exists public.marketing_email_preference_events",
  "create table if not exists public.systemadmin_email_campaigns",
  "alter table public.marketing_email_preferences enable row level security",
  "revoke all on table public.marketing_email_preferences from public, anon, authenticated, service_role",
  "create policy marketing_email_preferences_client_deny",
  "create or replace function public.get_my_marketing_email_preference()",
  "create or replace function public.set_my_marketing_email_preference(p_opt_in boolean)",
]);
assert(!/grant\s+select\s+on\s+table\s+public\.marketing_email_preferences\s+to\s+authenticated/i.test(migration), "nettleseren skal ikke kunne lese avmeldingstoken direkte");
requireNeedles("supabase/migrations/20260928160502_systemadmin_broadcast_email_acl_hardening.sql", [
  "revoke all on table public.marketing_email_preferences",
  "from public, anon, authenticated, service_role",
  "grant select, update on table public.marketing_email_preferences to service_role",
  "grant select, insert, update on table public.systemadmin_email_campaigns to service_role",
  "create policy systemadmin_email_campaigns_client_deny",
]);

const broadcast = requireNeedles("supabase/functions/systemadmin-broadcast-email/index.ts", [
  "profile?.system_role !== \"systemadmin\"",
  "selectBroadcastRecipients",
  "https://api.resend.com/emails/batch",
  "Idempotency-Key",
  "List-Unsubscribe",
  "List-Unsubscribe-Post",
  "confirmation !== `SEND ${selection.eligibleCount}`",
  "systemadmin_email_campaigns",
  "body.testEmail || user.email || profile?.email",
  "Oppgi en gyldig testadresse",
]);
assert(!/\bbcc\s*:/i.test(broadcast), "utsendingen skal ikke samle mottakere i BCC");

requireNeedles("supabase/functions/marketing-email-unsubscribe/index.ts", [
  "req.method !== \"GET\" && req.method !== \"POST\"",
  "unsubscribe_token",
  "consent_source: \"email_unsubscribe\"",
  "Samme nøytrale svar",
]);
requireNeedles("src/modules/app/SystemAdminBroadcastEmail.jsx", [
  "1. Kontroller mottakere",
  "2. Send test",
  "3. Send til mottakergruppen",
  "Markedsføring sendes bare til brukere som aktivt har samtykket",
  "Testmottaker",
  "testEmail: testEmail.trim()",
  "invokeError.context",
  "inkludert varsel om SoPro-forutsetningen",
]);
requireNeedles("src/modules/app/MarketingEmailPreference.jsx", [
  "get_my_marketing_email_preference",
  "set_my_marketing_email_preference",
  "Ja, jeg ønsker nyheter og markedsføring på e-post",
  "Som registrert bruker vil du kunne motta nødvendige driftsmeldinger",
  "kan tilgangen begrenses",
  "Driftsmeldinger er en del av tjenesten",
]);
requireNeedles("src/modules/help/helpToolsCore.js", [
  "Som registrert bruker vil du kunne motta nødvendige driftsmeldinger",
  "tilgangen kan bli begrenset, suspendert eller avsluttet",
  "Driftsmeldinger er en del av tjenesten",
]);
requireNeedles("src/main.jsx", [
  "MarketingEmailPreference",
  "supabaseClient: supabase, authUser",
]);
requireNeedles("src/modules/project/projectNavigationTabs.mjs", [
  '["innlogging", "Min profil / e-postvalg"]',
]);

console.log("✅ Systemadmin e-post, samtykke og avmelding check OK");
