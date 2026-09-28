export const MESSAGE_TYPES = Object.freeze({
  operational: "Driftsmelding",
  marketing: "Nyheter og markedsføring",
});

export const RECIPIENT_GROUPS = Object.freeze({
  active: "Aktive, godkjente brukere",
  pending: "Brukere som venter på godkjenning",
  all_registered: "Alle registrerte, ikke deaktiverte brukere",
  systemadmins: "Systemadministratorer",
});

export const clean = (value) => String(value ?? "").trim();
export const normalizeEmail = (value) => clean(value).toLowerCase();

export const escapeHtml = (value) => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

function activeBan(user) {
  const value = Date.parse(clean(user?.banned_until));
  return Number.isFinite(value) && value > Date.now();
}

function profileMatchesGroup(profile, group) {
  const approved = Boolean(profile?.approved);
  const deactivated = Boolean(profile?.deactivated);
  if (group === "active") return approved && !deactivated;
  if (group === "pending") return Boolean(profile) && !approved && !deactivated;
  if (group === "systemadmins") {
    return approved && !deactivated && clean(profile?.system_role) === "systemadmin";
  }
  return !deactivated;
}

function displayName(user, profile) {
  const metadata = user?.user_metadata || user?.raw_user_meta_data || {};
  return clean(
    metadata.full_name ||
    metadata.name ||
    profile?.full_name ||
    profile?.name
  );
}

function uniqueByEmail(rows) {
  const seen = new Set();
  return rows.filter((row) => {
    const key = normalizeEmail(row?.email);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function selectBroadcastRecipients({
  authUsers = [],
  profiles = [],
  preferences = [],
  recipientGroup = "active",
  messageType = "operational",
} = {}) {
  if (!RECIPIENT_GROUPS[recipientGroup]) throw new Error("Ugyldig mottakergruppe.");
  if (!MESSAGE_TYPES[messageType]) throw new Error("Ugyldig meldingstype.");

  const profileByUser = new Map(profiles.map((row) => [clean(row?.id), row]));
  const preferenceByUser = new Map(preferences.map((row) => [clean(row?.user_id), row]));
  let excludedInvalid = 0;

  const grouped = [];
  for (const user of authUsers) {
    const userId = clean(user?.id);
    const profile = profileByUser.get(userId);
    if (user?.deleted_at || activeBan(user) || !profileMatchesGroup(profile, recipientGroup)) continue;

    const email = normalizeEmail(user?.email || profile?.email);
    if (!email || !email.includes("@")) {
      excludedInvalid += 1;
      continue;
    }

    const preference = preferenceByUser.get(userId);
    grouped.push({
      userId,
      email,
      name: displayName(user, profile),
      marketingOptIn: Boolean(preference?.email_opt_in),
      unsubscribeToken: clean(preference?.unsubscribe_token),
    });
  }

  const uniqueGrouped = uniqueByEmail(grouped);
  const recipients = messageType === "marketing"
    ? uniqueGrouped.filter((row) => row.marketingOptIn && row.unsubscribeToken)
    : uniqueGrouped;

  return {
    recipients,
    groupCount: uniqueGrouped.length,
    eligibleCount: recipients.length,
    excludedNoConsent: messageType === "marketing"
      ? uniqueGrouped.length - recipients.length
      : 0,
    excludedInvalid,
  };
}

export function expoProffsenterFrom(configuredFrom) {
  const configured = clean(configuredFrom).replaceAll("\r", "").replaceAll("\n", "");
  const bracketMatch = configured.match(/<([^<>\s]+@[^<>\s]+)>/);
  const address = normalizeEmail(bracketMatch?.[1] || configured);
  const safeAddress = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)
    ? address
    : "onboarding@resend.dev";
  return `Expo Proffsenter <${safeAddress}>`;
}

export function buildUnsubscribeUrl(supabaseUrl, token) {
  return `${clean(supabaseUrl).replace(/\/$/, "")}/functions/v1/marketing-email-unsubscribe?token=${encodeURIComponent(clean(token))}`;
}

export function renderBroadcastEmail({
  subject,
  message,
  messageType,
  recipientName = "",
  logoUrl = "https://expo-proffdok.app/expo-logo.png",
  appUrl = "https://expo-proffdok.app",
  unsubscribeUrl = "",
  isTest = false,
} = {}) {
  const typeLabel = MESSAGE_TYPES[messageType] || MESSAGE_TYPES.operational;
  const safeMessage = escapeHtml(clean(message)).replaceAll("\n", "<br>");
  const greeting = clean(recipientName) && !normalizeEmail(recipientName).includes("@")
    ? `Hei ${escapeHtml(recipientName)},`
    : "Hei,";
  const marketingFooter = messageType === "marketing"
    ? isTest
      ? `<p style="margin:24px 0 0;color:#64748b;font-size:12px;line-height:1.5">I en reell utsending får hver mottaker en personlig avmeldingslenke.</p>`
      : `<p style="margin:24px 0 0;color:#64748b;font-size:12px;line-height:1.5">Du mottar dette fordi du har samtykket til nyheter og markedsføring fra Expo Proffsenter. <a href="${escapeHtml(unsubscribeUrl)}" style="color:#087f88">Endre eller avslutt e-postsamtykket</a>.</p>`
    : `<p style="margin:24px 0 0;color:#64748b;font-size:12px;line-height:1.5">Dette er en driftsmelding om Expo ProffDok og skal ikke brukes til markedsføring.</p>`;

  const html = `<!doctype html><html><body style="margin:0;background:#eef3f5;font-family:Arial,Helvetica,sans-serif;color:#172126">
  <div style="max-width:720px;margin:0 auto;padding:24px 12px">
    <div style="background:#fff;border:1px solid #d7e0e3;border-radius:18px;overflow:hidden">
      <div style="padding:22px 28px;background:#20292d">
        <img src="${escapeHtml(logoUrl)}" alt="Expo Proffsenter" style="display:block;max-width:290px;width:100%;max-height:82px;object-fit:contain;object-position:left center;background:#fff;border-radius:8px;padding:8px 10px" />
      </div>
      <div style="padding:30px 28px">
        ${isTest ? `<div style="display:inline-block;margin:0 0 16px;padding:7px 10px;border-radius:999px;background:#fff4ce;color:#7a4d00;font-size:12px;font-weight:900">TEST – ingen andre mottakere</div>` : ""}
        <div style="font-size:12px;font-weight:900;letter-spacing:.08em;color:#087f88;text-transform:uppercase">${escapeHtml(typeLabel)}</div>
        <h1 style="margin:7px 0 20px;font-size:25px;line-height:1.25">${escapeHtml(subject)}</h1>
        <p style="margin:0 0 14px;line-height:1.65">${greeting}</p>
        <div style="font-size:15px;line-height:1.7;color:#334155">${safeMessage}</div>
        <a href="${escapeHtml(appUrl)}" style="display:inline-block;margin-top:24px;background:#087f88;color:#fff;text-decoration:none;font-weight:800;padding:13px 20px;border-radius:10px">Åpne Expo ProffDok</a>
        ${marketingFooter}
      </div>
    </div>
  </div></body></html>`;

  const textFooter = messageType === "marketing"
    ? isTest
      ? "I en reell utsending får hver mottaker en personlig avmeldingslenke."
      : `Du mottar dette fordi du har samtykket til nyheter og markedsføring. Avmelding: ${unsubscribeUrl}`
    : "Dette er en driftsmelding om Expo ProffDok og skal ikke brukes til markedsføring.";
  const text = `${isTest ? "TEST – ingen andre mottakere\n\n" : ""}${typeLabel}\n${clean(subject)}\n\n${greeting.replaceAll(/<[^>]+>/g, "")}\n\n${clean(message)}\n\nÅpne Expo ProffDok: ${appUrl}\n\n${textFooter}`;

  return { html, text };
}
