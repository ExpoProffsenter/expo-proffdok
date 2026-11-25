import { supplierOrderFrom } from "./supplier-order-email.mjs";
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export function protocolConfirmationMail(snapshot) {
  const { protocol: p, company: c } = snapshot,
    confirmation = p.confirmation;
  const time = new Date(confirmation.at).toLocaleString("nb-NO", {
    timeZone: "Europe/Oslo",
  });
  const lines = [
    `Prosjekt: ${snapshot.project}`,
    `Arbeidsområde: ${snapshot.scope}`,
    `Protokoll: ${p.title}`,
    `Original: ${snapshot.original?.name || ""}`,
    `Bekreftet av: ${confirmation.by_name}`,
    `Bekreftet: ${time}`,
    `Bekreftelse: ${confirmation.note}`,
    ...p.remarks.map((r, i) => `${i + 1}. ${r.text}\nRetting: ${r.evidence}`),
    ...(!p.remarks.length ? [`Ingen merknader: ${p.no_remarks}`] : []),
    "Denne e-posten dokumenterer avsenderens bekreftelse på retting. Originalprotokollen og vedleggene oppbevares i ProffDok. Dette er ikke en ny overtagelsesprotokoll eller kontrollørens signatur.",
  ];
  const html = `<!doctype html><html lang="nb"><meta charset="utf-8"><body style="margin:0;background:#edf3f4;font-family:Arial,Helvetica,sans-serif;color:#18343a"><main style="max-width:720px;margin:24px auto;background:white;border:1px solid #bed3d6;border-radius:16px;overflow:hidden"><header style="padding:24px;background:#123e44;color:white"><strong style="font-size:23px">EXPO ProffDok</strong><p>${esc(c.companyName)}</p></header><section style="padding:24px"><h1 style="font-size:24px">Bekreftelse på retting</h1>${lines.map((v) => `<p style="white-space:pre-wrap;line-height:1.6;overflow-wrap:anywhere">${esc(v)}</p>`).join("")}<hr><p>Med vennlig hilsen<br><strong>${esc(c.companyName)}</strong><br>${[c.address, c.phone, c.email].filter(Boolean).map(esc).join("<br>")}</p><small>Bekreftelses-ID: ${esc(confirmation.id)}</small></section></main></body></html>`;
  const mail = {
    to: [snapshot.to],
    subject: `Retting bekreftet – ${snapshot.project} – ${snapshot.scope}`
      .replace(/[\r\n]/g, " ")
      .slice(0, 240),
    html,
    text: lines.join("\n\n"),
  };
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email || "")) mail.reply_to = c.email;
  return mail;
}
export async function handleBoligProtocolEmail(req, deps) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
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
        { error: "Logg inn før du sender bekreftelsen.", uncertain: false },
        401,
      );
    const raw = await req.text();
    if (raw.length > 2000)
      return response({ error: "Ugyldig forespørsel.", uncertain: false }, 413);
    const b = JSON.parse(raw);
    const key = deps.env("RESEND_API_KEY"),
      from = deps.env("CHAT_FROM_EMAIL");
    if (!key || !from)
      return response(
        { error: "E-posttjenesten er ikke konfigurert.", uncertain: false },
        503,
      );
    const args = {
      p_company_id: b.companyId,
      p_root_id: b.rootId,
      p_scope_id: b.scopeId,
      p_payload: { request_id: b.requestId },
    };
    const { data: prepared, error } = await client.rpc("bolig_protocol_mail", {
      ...args,
      p_action: "inspect",
    });
    if (error)
      return response(
        { error: error.message, uncertain: false },
        error.code === "42501" ? 403 : 409,
      );
    if (prepared.sent) return response({ ok: true, alreadySent: true });
    const mail = protocolConfirmationMail(prepared.snapshot),
      sender = supplierOrderFrom(from, prepared.snapshot.company.companyName);
    const { data: claim, error: claimError } = await client.rpc(
      "bolig_protocol_mail",
      { ...args, p_action: "begin" },
    );
    if (claimError)
      return response(
        { error: claimError.message, uncertain: false },
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
        "Idempotency-Key": `bolig-protocol/${prepared.id}`,
      },
      body: JSON.stringify({ from: sender, ...mail }),
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
      .rpc("bolig_protocol_mail_complete", {
        p_request_id: prepared.id,
        p_provider_id: receipt.id,
      });
    if (ack)
      return response(
        {
          error:
            "E-posttjenesten har tatt imot bekreftelsen. Prøv samme sending igjen for å lagre kvitteringen.",
          uncertain: true,
        },
        502,
      );
    return response({ ok: true });
  } catch (e) {
    return response(
      {
        error: begun
          ? "Sendestatus er uavklart. Prøv samme sending igjen."
          : e.message || "Bekreftelsen kunne ikke behandles.",
        uncertain: begun,
      },
      begun ? 502 : 400,
    );
  }
}
