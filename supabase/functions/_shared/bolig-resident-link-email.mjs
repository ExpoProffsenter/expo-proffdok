import { brandedInvitationMail } from "./bolig-partner-email.mjs";
import { supplierOrderFrom } from "./supplier-order-email.mjs";
export function residentLinkMail(snapshot, token) {
  if (
    !/^[a-f0-9]{64}$/.test(token) ||
    !["portal", "reminder", "agreement"].includes(snapshot.kind)
  )
    throw Error("Ugyldig beboerlenke.");
  const origin = new URL(snapshot.origin);
  if (origin.protocol !== "https:" || origin.origin !== snapshot.origin)
    throw Error("Ugyldig prosjektadresse.");
  const agreement = snapshot.kind === "agreement",
    reminder = snapshot.kind === "reminder";
  const title = agreement
    ? snapshot.document_kind === "change"
      ? "Endringsordre til gjennomgang"
      : "Boligavtale til gjennomgang"
    : reminder
      ? "Påminnelse om beboerportalen"
      : "Velkommen til beboerportalen";
  const link = `${origin.origin}/bolig-kunde.html#${agreement ? "" : "portal="}${token}`;
  const intro = `${snapshot.company.companyName} ${agreement ? "ber deg se gjennom avtalen for" : "inviterer deg til beboerportalen for"} bolig ${snapshot.unit}.`;
  const detail = [
    ["Prosjekt", snapshot.project],
    ["Bolig", `${snapshot.unit} · ${snapshot.address || ""}`],
    ["Mottaker", snapshot.name],
    ...(agreement ? [["Utgave", snapshot.version]] : []),
    [
      "Gyldig til",
      new Intl.DateTimeFormat("nb-NO", {
        dateStyle: "long",
        timeZone: "Europe/Oslo",
      }).format(new Date(snapshot.expires_at)),
    ],
  ];
  const instructions = agreement
    ? "Se gjennom innholdet og prisene i avtalen før du svarer. Å åpne lenken er ingen aksept. Lenken er personlig og skal ikke videresendes."
    : "Her finner du prosjektets delte boligvalg, avtaler, dokumentlenker og meldinger. Valg sendes til gjennomgang. Avtaler må aksepteres separat. Lenken er personlig og skal ikke videresendes.";
  return brandedInvitationMail({
    snapshot,
    link,
    title,
    intro,
    detail,
    instructions,
    button: agreement ? "Se gjennom avtalen" : "Åpne beboerportalen",
    subject: `${title} · ${snapshot.unit} – ${snapshot.project}`,
  });
}
export async function handleResidentLinkEmail(req, deps) {
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
        { error: "Logg inn før du sender beboerlenken.", uncertain: false },
        401,
      );
    const raw = await req.text();
    if (raw.length > 2000)
      return response({ error: "Ugyldig forespørsel.", uncertain: false }, 413);
    const b = JSON.parse(raw);
    const args = {
      p_company_id: b.companyId,
      p_root_id: b.rootId,
      p_unit_id: b.unitId,
      p_target_id: b.targetId,
      p_kind: b.kind,
      p_payload: {
        request_id: b.requestId,
        revision: b.revision,
        to: b.to,
        token: b.token,
      },
    };
    const { data: prepared, error } = await client.rpc(
      "bolig_resident_link_mail",
      {
        ...args,
        p_action: "prepare",
      },
    );
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
    const mail = residentLinkMail(prepared.snapshot, b.token);
    const from = supplierOrderFrom(
      configuredFrom,
      prepared.snapshot.company.companyName,
    );
    const { data: claim, error: claimError } = await client.rpc(
      "bolig_resident_link_mail",
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
        "Idempotency-Key": `bolig-resident-link/${prepared.id}`,
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
      .rpc("bolig_resident_link_mail_complete", {
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
          : "Beboerlenken kunne ikke sendes. Prøv samme forsøk igjen.",
        uncertain: begun,
      },
      begun ? 502 : 400,
    );
  }
}
