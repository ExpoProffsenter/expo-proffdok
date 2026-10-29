import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// FASE 34B skal aldri sende retroaktive akseptvarsler for historiske tilbud.
const NOTIFICATION_ROLLOUT_AT = Date.parse("2026-09-04T11:30:00Z");
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

function parseMoney(value: unknown) {
  let text = String(value ?? "").trim().replace(/\s/g, "").replace(/,-$/, "");
  if (!text) return 0;
  const hasComma = text.includes(",");
  const hasDot = text.includes(".");
  if (hasComma && hasDot) text = text.replace(/\./g, "").replace(",", ".");
  else if (hasComma) text = text.replace(",", ".");
  text = text.replace(/[^0-9.-]/g, "");
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : 0;
}

function optionTotal(option: any) {
  const quantity = parseMoney(option?.quantity);
  return parseMoney(option?.amount) * (quantity > 0 ? quantity : 1);
}

function formatNok(value: number) {
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value || 0);
}

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
      // Eldre tilbud kan ha relativ logo. Bruk produksjonsorigin som trygg fallback.
    }
  }
  return DEFAULT_APP_ORIGIN;
}

function emailHtml({
  title,
  intro,
  companyName,
  logoUrl,
  requestRef,
  offerTitle,
  customerName,
  address,
  acceptedBy,
  acceptedAt,
  acceptedTotalInclVat,
  optionTitles,
  selectionLabel = "Valgte opsjoner",
  noSelectionText = "Ingen",
  buttonText,
  buttonUrl,
}: any) {
  const options = Array.isArray(optionTitles) ? optionTitles.filter(Boolean) : [];
  const optionsHtml = options.length
    ? `<div style="margin-top:18px"><strong>${escapeHtml(selectionLabel)}:</strong><ul style="margin:8px 0 0;padding-left:20px">${options.map((item: string) => `<li style="margin:0 0 5px">${escapeHtml(item)}</li>`).join("")}</ul></div>`
    : `<div style="margin-top:18px"><strong>${escapeHtml(selectionLabel)}:</strong> ${escapeHtml(noSelectionText)}</div>`;
  const safeLogo = String(logoUrl || "").trim();
  const safeUrl = escapeHtml(buttonUrl || "");

  return `<!doctype html><html><body style="margin:0;background:#eef3f5;font-family:Arial,Helvetica,sans-serif;color:#172126">
  <div style="max-width:720px;margin:0 auto;padding:24px 12px">
    <div style="background:#fff;border:1px solid #d7e0e3;border-radius:18px;overflow:hidden">
      <div style="padding:24px 28px;background:#20292d;color:#fff;display:flex;align-items:center;justify-content:space-between;gap:20px">
        <div><div style="font-size:26px;font-weight:900;color:#13c4cb">EXPO</div><div style="font-size:30px;font-weight:900">ProffDok</div></div>
        ${safeLogo ? `<img src="${escapeHtml(safeLogo)}" alt="${escapeHtml(companyName)}" style="max-width:150px;max-height:64px;background:#fff;padding:5px;border-radius:6px">` : ""}
      </div>
      <div style="padding:30px 28px">
        <h1 style="margin:0 0 10px;font-size:24px">${escapeHtml(title)}</h1>
        <p style="margin:0 0 24px;line-height:1.6;color:#435158">${escapeHtml(intro)}</p>
        <div style="background:#f5f8f9;border:1px solid #dbe4e7;border-radius:14px;padding:18px;line-height:1.65">
          <div><strong>Tilbud:</strong> ${escapeHtml(requestRef)}${offerTitle ? ` – ${escapeHtml(offerTitle)}` : ""}</div>
          <div><strong>Kunde:</strong> ${escapeHtml(customerName)}</div>
          ${address ? `<div><strong>Adresse:</strong> ${escapeHtml(address)}</div>` : ""}
          <div><strong>Akseptert av:</strong> ${escapeHtml(acceptedBy)}</div>
          <div><strong>Tidspunkt:</strong> ${escapeHtml(formatDateTime(acceptedAt))}</div>
          <div><strong>Akseptert sum:</strong> ${escapeHtml(formatNok(acceptedTotalInclVat))} inkl. mva.</div>
          ${optionsHtml}
        </div>
        ${safeUrl ? `<a href="${safeUrl}" style="display:inline-block;margin-top:24px;background:#087f88;color:#fff;text-decoration:none;font-weight:800;padding:13px 20px;border-radius:10px">${escapeHtml(buttonText)}</a>` : ""}
        <p style="margin:28px 0 0;color:#66767d;font-size:13px;line-height:1.5">Denne e-posten er sendt automatisk via Expo ProffDok.</p>
      </div>
    </div>
  </div></body></html>`;
}

async function reserveNotification(
  serviceClient: any,
  offerId: string,
  versionId: string,
  recipientType: string,
  recipientEmail: string,
) {
  const { data, error } = await serviceClient
    .from("sales_offer_acceptance_notifications")
    .insert({
      offer_id: offerId,
      offer_version_id: versionId,
      recipient_type: recipientType,
      recipient_email: recipientEmail,
      status: "pending",
    })
    .select("id,status")
    .single();

  if (!error) return { shouldSend: true, id: data.id, status: data.status };
  if (error.code === "23505") {
    const { data: existing } = await serviceClient
      .from("sales_offer_acceptance_notifications")
      .select("id,status,sent_at,error_message")
      .eq("offer_id", offerId)
      .eq("offer_version_id", versionId)
      .eq("recipient_type", recipientType)
      .maybeSingle();
    return {
      shouldSend: false,
      id: existing?.id || null,
      status: existing?.status || "existing",
    };
  }
  throw new HttpError(500, "Kunne ikke reservere akseptvarsel.");
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
      .from("sales_offer_acceptance_notifications")
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
      .from("sales_offer_acceptance_notifications")
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
    if (!supabaseUrl || !serviceRoleKey) {
      throw new HttpError(500, "Mangler Supabase-konfigurasjon.");
    }

    const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: offer, error: offerError } = await serviceClient
      .from("sales_offers")
      .select("id,company_id,request_ref,status,accepted_at,accepted_by,accepted_payload,customer_name,customer_email,customer_address")
      .eq("public_token", token)
      .maybeSingle();

    if (offerError || !offer) throw new HttpError(404, "Tilbudet finnes ikke.");
    if (offer.status !== "accepted" || !offer.accepted_payload) {
      throw new HttpError(409, "Tilbudet er ikke akseptert ennå.");
    }

    const acceptedAt = offer.accepted_at || offer.accepted_payload?.accepted_at || "";
    const acceptedAtMs = Date.parse(String(acceptedAt || ""));
    if (!Number.isFinite(acceptedAtMs) || acceptedAtMs < NOTIFICATION_ROLLOUT_AT) {
      return new Response(JSON.stringify({
        ok: true,
        requestRef: offer.request_ref,
        skipped: "pre_rollout_acceptance",
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const versionId = String(offer.accepted_payload?.version_id || "").trim();
    if (!versionId) throw new HttpError(500, "Akseptert tilbudsversjon mangler.");

    const { data: version, error: versionError } = await serviceClient
      .from("sales_offer_versions")
      .select("id,offer_id,version_number,title,total_ex_vat,published_by,published_by_name,lines")
      .eq("id", versionId)
      .eq("offer_id", offer.id)
      .maybeSingle();
    if (versionError || !version) {
      throw new HttpError(500, "Akseptert tilbudsversjon finnes ikke.");
    }

    const storeMeta = findStoreMeta(version.lines || []);
    const isStoreOffer = Boolean(storeMeta?.__storeOfferMeta);

    let publisherCompanyName = "";
    let publisherLogoUrl = "";
    if (version.published_by) {
      const { data: profile } = await serviceClient
        .from("profiles")
        .select("company_name,logo_url")
        .eq("id", version.published_by)
        .maybeSingle();
      publisherCompanyName = String(profile?.company_name || "").trim();
      publisherLogoUrl = String(profile?.logo_url || "").trim();

    }

    const { data: requestRow } = await serviceClient
      .from("sales_requests")
      .select("payload")
      .eq("company_id", offer.company_id)
      .eq("request_ref", offer.request_ref)
      .maybeSingle();
    const requestPayload = requestRow?.payload || {};

    const legalCompanyName = String(
      requestPayload?.companyName || publisherCompanyName || "Expo ProffDok",
    ).trim();
    const companyName = String(
      isStoreOffer ? (storeMeta?.brandLabel || legalCompanyName) : legalCompanyName,
    ).trim();
    const companyLogoUrl = String(
      isStoreOffer
        ? (storeMeta?.brandLogoUrl || requestPayload?.companyLogoUrl || publisherLogoUrl || "")
        : (requestPayload?.companyLogoUrl || publisherLogoUrl || ""),
    ).trim();
    const customerEmail = normalizeEmail(offer.customer_email || requestPayload?.email);
    const customerName = String(
      offer.customer_name || requestPayload?.customer || "Kunde",
    ).trim();
    const address = String(
      offer.customer_address || requestPayload?.address || "",
    ).trim();
    const acceptedBy = String(
      offer.accepted_by || offer.accepted_payload?.accepted_by || customerName,
    ).trim();
    const selectedOptions = Array.isArray(offer.accepted_payload?.selected_options)
      ? offer.accepted_payload.selected_options
      : [];
    const optionTitles = selectedOptions
      .map((option: any) => String(option?.title || option?.description || (isStoreOffer ? "Valgt alternativ" : "Valgt opsjon")).trim())
      .filter(Boolean);
    const baseExVat = Number(version.total_ex_vat || 0) || 0;
    const optionsExVat = selectedOptions.reduce(
      (sum: number, option: any) => sum + optionTotal(option),
      0,
    );
    const acceptedTotalInclVat = (baseExVat + optionsExVat) * 1.25;

    const appOrigin = isStoreOffer ? appOriginFromStoreMeta(storeMeta) : DEFAULT_APP_ORIGIN;
    const internalUrl = `${appOrigin}/`;
    const customerUrl = `${appOrigin}/?publicOffer=${encodeURIComponent(token)}`;
    const results: any = {};
    const selectionLabel = isStoreOffer
      ? (optionTitles.length === 1 ? "Valgt alternativ/tillegg" : "Valgte alternativer og tillegg")
      : "Valgte opsjoner";

    // The historical publisher slot is retained only for durable deduplication.
    // Identity comes exclusively from the current canonical case-handler binding.
    let handler = null;
    try {
      const lookup = await serviceClient.rpc("sales_acceptance_case_handler", { p_offer_id: offer.id });
      if (!lookup.error) handler = lookup.data;
    } catch { /* Fail closed internally; the customer receipt still follows v7. */ }
    if (handler?.status === "ready" && handler.userId && handler.email) {
      const reservation = await reserveNotification(
        serviceClient,
        offer.id,
        version.id,
        "publisher",
        handler.email,
      );
      // Recheck after the reservation so a reassignment or revoked access cannot
      // route the pending notification to the previous handler.
      let current = null;
      try {
        const lookup = await serviceClient.rpc("sales_acceptance_case_handler", { p_offer_id: offer.id });
        if (!lookup.error) current = lookup.data;
      } catch { /* No fallback to cached identity. */ }
      const unchanged = current?.status === "ready" &&
        current.userId === handler.userId && current.revision === handler.revision &&
        current.email === handler.email;
      if (!unchanged && reservation.shouldSend) {
        await serviceClient.from("sales_offer_acceptance_notifications")
          .update({ status: "failed", error_message: "case_handler_changed_or_unavailable", updated_at: new Date().toISOString() })
          .eq("id", reservation.id);
      }
      results.caseHandler = unchanged ? await sendReservedEmail({
        serviceClient,
        reservation,
        to: handler.email,
        subject: `${isStoreOffer ? "Butikktilbud" : "Tilbud"} akseptert – ${offer.request_ref} – ${customerName}`,
        html: emailHtml({
          title: isStoreOffer ? "Butikktilbud akseptert" : "Tilbud akseptert",
          intro: isStoreOffer
            ? "Kunden har akseptert butikktilbudet. Aksepten er registrert i Expo ProffDok."
            : "Kunden har akseptert tilbudet. Aksepten er registrert i Expo ProffDok.",
          companyName,
          logoUrl: companyLogoUrl,
          requestRef: offer.request_ref,
          offerTitle: version.title,
          customerName,
          address,
          acceptedBy,
          acceptedAt,
          acceptedTotalInclVat,
          optionTitles,
          selectionLabel,
          noSelectionText: isStoreOffer ? "Ingen alternativer eller tillegg valgt" : "Ingen",
          buttonText: "Åpne Expo ProffDok",
          buttonUrl: internalUrl,
        }),
      }) : { sent: false, status: "case_handler_changed_or_unavailable" };
    } else {
      results.caseHandler = { sent: false, status: handler?.status || "case_handler_lookup_failed" };
    }

    if (customerEmail) {
      const reservation = await reserveNotification(
        serviceClient,
        offer.id,
        version.id,
        "customer",
        customerEmail,
      );
      results.customer = await sendReservedEmail({
        serviceClient,
        reservation,
        to: customerEmail,
        subject: `Bekreftelse på akseptert ${isStoreOffer ? "butikktilbud" : "tilbud"} – ${offer.request_ref}`,
        html: emailHtml({
          title: "Vi har registrert din aksept",
          intro: isStoreOffer
            ? `Takk. Vi bekrefter at din aksept av butikktilbudet fra ${companyName} er registrert.`
            : `Takk. Vi bekrefter at din aksept av tilbudet fra ${companyName} er registrert.`,
          companyName,
          logoUrl: companyLogoUrl,
          requestRef: offer.request_ref,
          offerTitle: version.title,
          customerName,
          address,
          acceptedBy,
          acceptedAt,
          acceptedTotalInclVat,
          optionTitles,
          selectionLabel,
          noSelectionText: isStoreOffer ? "Ingen alternativer eller tillegg valgt" : "Ingen",
          buttonText: "Se akseptbekreftelsen",
          buttonUrl: customerUrl,
        }),
      });
    } else {
      results.customer = { sent: false, status: "missing_email" };
    }

    return new Response(JSON.stringify({
      ok: true,
      requestRef: offer.request_ref,
      versionId: version.id,
      storeOffer: isStoreOffer,
      results,
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

