import {
  supplierOrderFrom,
  supplierOrderLogo,
} from "./supplier-order-email.mjs";
const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const names = {
  progress: "Fremdrift",
  checklists: "Sjekklister",
  orders: "Bestillinger og leveranser",
  quality_write: "Egne sjekklister, vedlegg og bilder",
};
export function partnerInvitationMail(snapshot, token) {
  if (!/^[0-9a-f]{64}$/.test(token)) throw Error("Tilgangslenken mangler.");
  const origin = new URL(snapshot.origin);
  if (origin.protocol !== "https:" || origin.origin !== snapshot.origin)
    throw Error("Ugyldig prosjektadresse.");
  const link = `${origin.origin}/bolig-kunde.html#partner=${token}`;
  const company = snapshot.company;
  const expires = new Intl.DateTimeFormat("nb-NO", {
    dateStyle: "long",
    timeZone: "Europe/Oslo",
  }).format(new Date(snapshot.expires_at));
  const features =
    snapshot.access_mode === "project"
      ? (snapshot.features || [])
          .filter((x) => names[x])
          .map((x) => names[x])
          .join(" · ")
      : "Utvalgte leveranser og aktiviteter";
  const intro = `${company.companyName} har gitt deg tilgang til ${snapshot.project}.`;
  const detail = [
    [
      "Prosjekt",
      [snapshot.project, snapshot.reference].filter(Boolean).join(" · "),
    ],
    ["Mottaker", `${snapshot.name} · ${snapshot.organisation}`],
    ["Tilgang", features],
    ["Gyldig til", expires],
  ];
  const instructions =
    "Åpne prosjektet med knappen nedenfor. Lenken gir tilgang til den som har den. Behold den for deg selv og kontakt avsender hvis mottakeren er feil.";
  return brandedInvitationMail({
    snapshot,
    link,
    title: "Tilgang til prosjekt",
    intro,
    detail,
    instructions,
    button: "Åpne prosjektet",
    subject: `Prosjekttilgang – ${snapshot.project}`,
  });
}
export function brandedInvitationMail({
  snapshot,
  link,
  title,
  intro,
  detail,
  instructions,
  button,
  subject,
}) {
  const company = snapshot.company;
  const footer = [
    company.companyName,
    company.orgNumber && `Org.nr. ${company.orgNumber}`,
    company.address,
    company.phone,
    company.email,
  ].filter(Boolean);
  // Same established invitation layout as controller-access-email: dark card,
  // teal Expo heading/button, sender logo, details panel and company signature.
  const html = `<!doctype html><html lang="nb"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>@media(max-width:480px){.partner-email-brand{font-size:24px!important;letter-spacing:-1px!important}.partner-email-logo{width:95px!important}.partner-email-header,.partner-email-content{padding:20px 16px!important}}@media(max-width:320px){.partner-email-header td{display:block!important;width:100%!important;text-align:left!important}.partner-email-logo{margin-top:16px!important}}</style></head><body style="margin:0;padding:0;background:#51585a;font-family:Arial,Helvetica,sans-serif;color:#dbe7f0;"><div style="max-width:760px;margin:0 auto;padding:20px 12px;"><div style="background:#242424;border:1px solid #dbe7f0;border-radius:18px;overflow:hidden;"><div class="partner-email-header" style="padding:28px 24px 24px;border-bottom:1px solid #dbe7f0;"><table role="presentation" width="100%" style="table-layout:fixed;"><tr><td style="width:55%;"><div class="partner-email-brand" style="font-size:42px;line-height:.9;font-weight:900;letter-spacing:-2px;color:#08b9c3;">EXPO</div><div class="partner-email-brand" style="font-size:40px;line-height:1.1;font-weight:900;letter-spacing:-2px;color:#ffffff;">ProffDok</div></td><td align="right"><img class="partner-email-logo" src="${esc(supplierOrderLogo(company))}" alt="${esc(company.companyName)}" width="150" style="width:150px;max-width:100%;height:auto;background:#fff;padding:4px;"></td></tr></table></div><div class="partner-email-content" style="padding:28px 24px;"><h1 style="font-size:24px;line-height:1.3;margin:0 0 14px;color:#dbe7f0;font-weight:900;overflow-wrap:anywhere;">${esc(title)}</h1><p style="font-size:16px;line-height:1.6;margin:0 0 12px;color:#cbd5e1;">Hei ${esc(snapshot.name)}.</p><p style="font-size:16px;line-height:1.6;margin:0 0 26px;color:#cbd5e1;">${esc(intro)}</p><div style="background:#5a5d60;border:1px solid #dbe7f0;border-radius:14px;padding:16px 18px;margin-bottom:20px;">${detail.map(([label, value]) => `<p style="margin:6px 0;line-height:1.6;overflow-wrap:anywhere;"><strong>${esc(label)}:</strong> ${esc(value)}</p>`).join("")}</div><p style="line-height:1.7;color:#ffffff;">${esc(instructions)}</p><a href="${esc(link)}" style="display:inline-block;background:#007f89;color:#ffffff;text-decoration:none;font-weight:900;padding:14px 24px;border-radius:12px;font-size:15px;">${esc(button)}</a><p style="font-size:13px;color:#b8c7d3;line-height:1.6;margin-top:24px;overflow-wrap:anywhere;">Hvis knappen ikke fungerer, kan du kopiere denne lenken:<br><a href="${esc(link)}" style="color:#08d5d8;overflow-wrap:anywhere;">${esc(link)}</a></p><hr style="border:none;border-top:1px solid #dbe7f0;margin:32px 0;"><p style="margin:0 0 8px;color:#cbd5e1;font-size:15px;">Med vennlig hilsen</p><p style="margin:0;color:#dbe7f0;font-size:15px;line-height:1.6;">${footer.map(esc).join("<br>")}</p><p style="margin:6px 0 0;color:#aebbc7;font-size:13px;">Dokumentasjon levert gjennom Expo ProffDok</p></div></div><p style="text-align:center;color:#aebbc7;font-size:12px;margin:18px 0 0;">Denne e-posten er sendt via Expo ProffDok.</p></div></body></html>`;
  const mail = {
    to: [snapshot.to],
    subject: subject.replace(/[\r\n]/g, " ").slice(0, 240),
    html,
    text: [
      `Hei ${snapshot.name}.`,
      intro,
      ...detail.map(([k, v]) => `${k}: ${v}`),
      instructions,
      `Åpne prosjektet: ${link}`,
      "Med vennlig hilsen",
      ...footer,
    ].join("\n\n"),
  };
  if (/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(company.email || ""))
    mail.reply_to = company.email;
  return mail;
}
export async function handlePartnerInvitationEmail(req, deps) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  };
  const response = (body, status = 200) =>
    new Response(JSON.stringify(body), { status, headers });
  if (req.method === "OPTIONS") return response({ ok: true });
  if (req.method !== "POST")
    return response({ error: "Bare POST er tillatt.", uncertain: false }, 405);
  let begun = false;
  try {
    const client = deps.userClient(req.headers.get("Authorization") || "");
    const { data: auth, error: authError } = await client.auth.getUser();
    if (authError || !auth?.user)
      return response(
        { error: "Logg inn før du sender tilgangslenken.", uncertain: false },
        401,
      );
    const raw = await req.text();
    if (raw.length > 2000)
      return response({ error: "Ugyldig forespørsel.", uncertain: false }, 413);
    const b = JSON.parse(raw);
    const args = {
      p_company_id: b.companyId,
      p_root_id: b.rootId,
      p_access_id: b.accessId,
      p_payload: {
        request_id: b.requestId,
        revision: b.revision,
        to: b.to,
        token: b.token,
      },
    };
    const { data: prepared, error } = await client.rpc("bolig_partner_mail", {
      ...args,
      p_action: "prepare",
    });
    if (error)
      return response(
        { error: error.message, code: error.code, uncertain: false },
        error.code === "42501" ? 403 : 409,
      );
    if (prepared.sent) return response({ ok: true, alreadySent: true });
    if (!prepared.enabled)
      return response(
        {
          error: "E-postutsending er pauset i dette miljøet.",
          code: "paused",
          uncertain: false,
        },
        409,
      );
    const key = deps.env("RESEND_API_KEY"),
      configuredFrom = deps.env("CHAT_FROM_EMAIL");
    if (!key || !configuredFrom)
      return response(
        { error: "E-posttjenesten er ikke konfigurert.", uncertain: false },
        503,
      );
    const mail = partnerInvitationMail(prepared.snapshot, b.token);
    const from = supplierOrderFrom(
      configuredFrom,
      prepared.snapshot.company.companyName,
    );
    const { data: claim, error: claimError } = await client.rpc(
      "bolig_partner_mail",
      { ...args, p_action: "begin" },
    );
    if (claimError)
      return response(
        { error: claimError.message, code: claimError.code, uncertain: false },
        claimError.code === "42501" ? 403 : 409,
      );
    if (claim.sent) return response({ ok: true, alreadySent: true });
    begun = true;
    const provider = await deps.fetch("https://api.resend.com/emails", {
      method: "POST",
      redirect: "error",
      signal: AbortSignal.timeout(20000),
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `bolig-partner/${prepared.id}`,
      },
      body: JSON.stringify({ from, ...mail }),
    });
    const receipt = await provider.json().catch(() => null);
    if (
      !provider.ok ||
      typeof receipt?.id !== "string" ||
      !receipt.id ||
      receipt.id.length > 150
    )
      return response(
        {
          error: "Sendingen kunne ikke bekreftes. Prøv samme sending igjen.",
          uncertain: true,
        },
        502,
      );
    const { error: ack } = await deps
      .adminClient()
      .rpc("bolig_partner_mail_complete", {
        p_request_id: prepared.id,
        p_provider_id: receipt.id,
      });
    if (ack)
      return response(
        {
          error:
            "E-posttjenesten har tatt imot meldingen. Prøv samme sending igjen for å lagre kvitteringen.",
          uncertain: true,
        },
        502,
      );
    return response({ ok: true });
  } catch {
    // Do not echo provider/network errors: they can contain the capability URL.
    return response(
      {
        error: begun
          ? "Sendestatus er uavklart. Prøv samme sending igjen."
          : "Tilgangslenken kunne ikke sendes. Prøv samme forsøk igjen.",
        uncertain: begun,
      },
      begun ? 502 : 400,
    );
  }
}
