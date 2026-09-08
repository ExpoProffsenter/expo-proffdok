import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Inkluderer siste Preview-test med F-2026-0062, men sender ikke eldre avvisninger retroaktivt.
const NOTIFICATION_ROLLOUT_AT = Date.parse("2026-09-08T16:30:00Z");
const DEFAULT_APP_ORIGIN = "https://expo-proffdok.app";

class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const normalizeEmail = (value: unknown) => String(value ?? "").trim().toLowerCase();
const escapeHtml = (value: unknown) => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

function formatDateTime(value: unknown) {
  const date = new Date(String(value || ""));
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("nb-NO", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Oslo",
  }).format(date);
}

function findStoreMeta(lines: any[] = []) {
  return (Array.isArray(lines) ? lines : []).find((line: any) =>
    line?.__storeOfferMeta || String(line?.id || "") === "__expo_store_offer_meta__"
  ) || null;
}

function appOriginFromStoreMeta(storeMeta: any) {
  const logoUrl = String(storeMeta?.brandLogoUrl || "").trim();
  if (logoUrl) {
    try {
      return new URL(logoUrl).origin;
    } catch {
      // Bruk produksjonsorigin dersom historisk logo ikke er en absolutt URL.
    }
  }
  return DEFAULT_APP_ORIGIN;
}

async function reserveNotification(
  serviceClient: any,
  offerId: string,
  versionId: string,
  recipientEmail: string,
) {
  const { data, error } = await serviceClient
    .from("sales_offer_decline_notifications")
    .insert({
      offer_id: offerId,
      offer_version_id: versionId,
      recipient_type: "publisher",
      recipient_email: recipientEmail,
      status: "pending",
    })
    .select("id,status")
    .single();

  if (!error) return { shouldSend: true, id: data.id, status: data.status };
  if (error.code === "23505") {
    const { data: existing } = await serviceClient
      .from("sales_offer_decline_notifications")
      .select("id,status,sent_at,error_message")
      .eq("offer_id", offerId)
      .eq("offer_version_id", versionId)
      .eq("recipient_type", "publisher")
      .maybeSingle();
    return {
      shouldSend: false,
      id: existing?.id || null,
      status: existing?.status || "existing",
    };
  }
  throw new HttpError(500, "Kunne ikke reservere avvisningsvarsel.");
}

function buildEmailHtml({
  companyName,
  logoUrl,
  requestRef,
  offerTitle,
  customerName,
  address,
  declinedBy,
  declinedAt,
  internalUrl,
}: any) {
  const safeLogo = String(logoUrl || "").trim();
  return `<!doctype html><html><body style="margin:0;background:#eef3f5;font-family:Arial,Helvetica,sans-serif;color:#172126">
  <div style="max-width:720px;margin:0 auto;padding:24px 12px">
    <div style="background:#fff;border:1px solid #d7e0e3;border-radius:18px;overflow:hidden">
      <div style="padding:24px 28px;background:#20292d;color:#fff;display:flex;align-items:center;justify-content:space-between;gap:20px">
        <div><div style="font-size:26px;font-weight:900;color:#13c4cb">EXPO</div><div style="font-size:30px;font-weight:900">ProffDok</div></div>
        ${safeLogo ? `<img src="${escapeHtml(safeLogo)}" alt="${escapeHtml(companyName)}" style="max-width:150px;max-height:64px;background:#fff;padding:5px;border-radius:6px">` : ""}
      </div>
      <div style="padding:30px 28px">
        <h1 style="margin:0 0 10px;font-size:24px">Butikktilbud avvist</h1>
        <p style="margin:0 0 24px;line-height:1.6;color:#435158">Kunden har avvist tilbudet. Avvisningen er registrert i Expo ProffDok og automatisk oppfølging er stoppet.</p>
        <div style="background:#f5f8f9;border:1px solid #dbe4e7;border-radius:14px;padding:18px;line-height:1.65">
          <div><strong>Tilbud:</strong> ${escapeHtml(requestRef)}${offerTitle ? ` – ${escapeHtml(offerTitle)}` : ""}</div>
          <div><strong>Kunde:</strong> ${escapeHtml(customerName)}</div>
          ${address ? `<div><strong>Adresse:</strong> ${escapeHtml(address)}</div>` : ""}
          <div><strong>Avvist av:</strong> ${escapeHtml(declinedBy)}</div>
          <div><strong>Tidspunkt:</strong> ${escapeHtml(formatDateTime(declinedAt))}</div>
        </div>
        <a href="${escapeHtml(internalUrl)}" style="display:inline-block;margin-top:24px;background:#087f88;color:#fff;text-decoration:none;font-weight:800;padding:13px 20px;border-radius:10px">Åpne Expo ProffDok</a>
        <p style="margin:28px 0 0;color:#66767d;font-size:13px;line-height:1.5">Denne e-posten er sendt automatisk via Expo ProffDok.</p>
      </div>
    </div>
  </div></body></html>`;
}

async function sendReservedEmail({ serviceClient, reservation, to, subject, html }: any) {
  if (!reservation?.shouldSend || !reservation?.id) {
    return { sent: false, status: reservation?.status || "skipped" };
  }

  const apiKey = Deno.env.get("RESEND_API_KEY") || "";
  if (!apiKey) throw new HttpError(500, "Mangler e-postkonfigurasjon.");
  const fromEmail = Deno.env.get("CHAT_FROM_EMAIL") || "Expo ProffDok <onboarding@resend.dev>";

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: fromEmail, to: [to], subject, html }),
    });
    const result = await response.text();
    if (!response.ok) throw new Error(result || `Resend ${response.status}`);

    await serviceClient
      .from("sales_offer_decline_notifications")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        error_message: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", reservation.id);

    return { sent: true, status: "sent" };
  } catch (error) {
    await serviceClient
      .from("sales_offer_decline_notifications")
      .update({
        status: "failed",
        error_message: String(error instanceof Error ? error.message : error).slice(0, 1000),
        updated_at: new Date().toISOString(),
      })
      .eq("id", reservation.id);
    return { sent: false, status: "failed" };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const token = String(body?.publicOfferToken || body?.token || "").trim();
    if (!token) throw new HttpError(400, "Mangler tilbudstoken.");

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    if (!supabaseUrl || !serviceRoleKey) throw new HttpError(500, "Mangler Supabase-konfigurasjon.");

    const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: offer, error: offerError } = await serviceClient
      .from("sales_offers")
      .select("id,company_id,request_ref,status,declined_at,declined_by,declined_payload,customer_name,customer_address")
      .eq("public_token", token)
      .maybeSingle();

    if (offerError || !offer) throw new HttpError(404, "Tilbudet finnes ikke.");
    if (offer.status !== "declined" || !offer.declined_payload) {
      throw new HttpError(409, "Tilbudet er ikke avvist ennå.");
    }

    const declinedAt = offer.declined_at || offer.declined_payload?.declined_at || "";
    const declinedAtMs = Date.parse(String(declinedAt || ""));
    if (!Number.isFinite(declinedAtMs) || declinedAtMs < NOTIFICATION_ROLLOUT_AT) {
      return new Response(JSON.stringify({ ok: true, requestRef: offer.request_ref, skipped: "pre_rollout_decline" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const versionId = String(offer.declined_payload?.version_id || "").trim();
    if (!versionId) throw new HttpError(500, "Avvist tilbudsversjon mangler.");

    const { data: version, error: versionError } = await serviceClient
      .from("sales_offer_versions")
      .select("id,offer_id,version_number,title,published_by,published_by_name,lines")
      .eq("id", versionId)
      .eq("offer_id", offer.id)
      .maybeSingle();
    if (versionError || !version) throw new HttpError(500, "Avvist tilbudsversjon finnes ikke.");

    const storeMeta = findStoreMeta(version.lines || []);
    if (!storeMeta?.__storeOfferMeta) throw new HttpError(403, "Avvisningsvarsel gjelder kun Butikktilbud.");

    let publisherEmail = "";
    let publisherCompanyName = "";
    let publisherLogoUrl = "";
    if (version.published_by) {
      const { data: profile } = await serviceClient
        .from("profiles")
        .select("email,company_name,logo_url")
        .eq("id", version.published_by)
        .maybeSingle();
      publisherEmail = normalizeEmail(profile?.email);
      publisherCompanyName = String(profile?.company_name || "").trim();
      publisherLogoUrl = String(profile?.logo_url || "").trim();

      if (!publisherEmail) {
        try {
          const { data: authUserData } = await serviceClient.auth.admin.getUserById(version.published_by);
          publisherEmail = normalizeEmail(authUserData?.user?.email);
        } catch {
          publisherEmail = "";
        }
      }
    }

    if (!publisherEmail) {
      return new Response(JSON.stringify({ ok: true, requestRef: offer.request_ref, sent: false, status: "missing_email" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: requestRow } = await serviceClient
      .from("sales_requests")
      .select("payload")
      .eq("company_id", offer.company_id)
      .eq("request_ref", offer.request_ref)
      .maybeSingle();
    const requestPayload = requestRow?.payload || {};

    const companyName = String(
      storeMeta?.brandLabel || requestPayload?.companyName || publisherCompanyName || "Expo ProffDok",
    ).trim();
    const companyLogoUrl = String(
      storeMeta?.brandLogoUrl || requestPayload?.companyLogoUrl || publisherLogoUrl || "",
    ).trim();
    const customerName = String(offer.customer_name || requestPayload?.customer || "Kunde").trim();
    const address = String(offer.customer_address || requestPayload?.address || "").trim();
    const declinedBy = String(offer.declined_by || offer.declined_payload?.declined_by || customerName).trim();
    const internalUrl = `${appOriginFromStoreMeta(storeMeta)}/`;

    const reservation = await reserveNotification(serviceClient, offer.id, version.id, publisherEmail);
    const result = await sendReservedEmail({
      serviceClient,
      reservation,
      to: publisherEmail,
      subject: `Butikktilbud avvist – ${offer.request_ref} – ${customerName}`,
      html: buildEmailHtml({
        companyName,
        logoUrl: companyLogoUrl,
        requestRef: offer.request_ref,
        offerTitle: version.title,
        customerName,
        address,
        declinedBy,
        declinedAt,
        internalUrl,
      }),
    });

    return new Response(JSON.stringify({
      ok: true,
      requestRef: offer.request_ref,
      versionId: version.id,
      result,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    return new Response(JSON.stringify({
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
