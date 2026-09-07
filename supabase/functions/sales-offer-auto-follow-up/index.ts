import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const DEFAULT_APP_ORIGIN = "https://expo-proffdok.app";
const MAX_ATTEMPTS = 3;

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

function findStoreMeta(lines: any[] = []) {
  return (Array.isArray(lines) ? lines : []).find((line: any) =>
    line?.__storeOfferMeta || String(line?.id || "") === "__expo_store_offer_meta__"
  ) || null;
}

function findCompanySnapshot(lines: any[] = []) {
  return (Array.isArray(lines) ? lines : []).find((line: any) =>
    line?.__companyMeta || String(line?.id || "") === "__expo_company_snapshot__"
  ) || null;
}

function resolveAssetUrl(value: unknown) {
  const asset = String(value || "").trim();
  if (!asset) return "";
  if (/^https?:\/\//i.test(asset)) return asset;
  try {
    return new URL(asset, DEFAULT_APP_ORIGIN).href;
  } catch {
    return asset;
  }
}

function formatDate(value: unknown) {
  const date = new Date(String(value || ""));
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/Oslo",
  }).format(date);
}

function emailHtml({
  storeOffer,
  companyName,
  logoUrl,
  requestRef,
  offerTitle,
  customerName,
  customerAddress,
  responsibleName,
  originalSentAt,
  customerUrl,
}: any) {
  const safeLogo = resolveAssetUrl(logoUrl);
  const title = storeOffer ? "En liten påminnelse om butikktilbudet" : "En liten påminnelse om tilbudet";
  const intro = storeOffer
    ? "Vi minner om butikktilbudet du mottok for en uke siden. Tilbudet er fortsatt tilgjengelig via knappen nedenfor. Har du spørsmål, er du velkommen til å ta kontakt."
    : "Vi minner om tilbudet du mottok for en uke siden. Tilbudet er fortsatt tilgjengelig via knappen nedenfor. Har du spørsmål, er du velkommen til å ta kontakt.";

  return `<!doctype html><html><body style="margin:0;background:#eef3f5;font-family:Arial,Helvetica,sans-serif;color:#172126">
  <div style="max-width:720px;margin:0 auto;padding:24px 12px">
    <div style="background:#fff;border:1px solid #d7e0e3;border-radius:18px;overflow:hidden">
      <div style="padding:24px 28px;background:#20292d;color:#fff;display:flex;align-items:center;justify-content:space-between;gap:20px">
        <div><div style="font-size:26px;font-weight:900;color:#13c4cb">EXPO</div><div style="font-size:30px;font-weight:900">ProffDok</div></div>
        ${safeLogo ? `<img src="${escapeHtml(safeLogo)}" alt="${escapeHtml(companyName)}" style="max-width:160px;max-height:66px;background:#fff;padding:5px;border-radius:6px">` : ""}
      </div>
      <div style="padding:30px 28px">
        <h1 style="margin:0 0 10px;font-size:24px">${escapeHtml(title)}</h1>
        <p style="margin:0 0 24px;line-height:1.65;color:#435158">${escapeHtml(intro)}</p>
        <div style="background:#f5f8f9;border:1px solid #dbe4e7;border-radius:14px;padding:18px;line-height:1.7">
          <div><strong>Tilbud:</strong> ${escapeHtml(requestRef)}${offerTitle ? ` – ${escapeHtml(offerTitle)}` : ""}</div>
          <div><strong>Kunde:</strong> ${escapeHtml(customerName)}</div>
          ${customerAddress ? `<div><strong>Adresse:</strong> ${escapeHtml(customerAddress)}</div>` : ""}
          ${responsibleName ? `<div><strong>${storeOffer ? "Saksbehandler" : "Prosjektansvarlig"}:</strong> ${escapeHtml(responsibleName)}</div>` : ""}
          ${originalSentAt ? `<div><strong>Opprinnelig sendt:</strong> ${escapeHtml(formatDate(originalSentAt))}</div>` : ""}
        </div>
        <a href="${escapeHtml(customerUrl)}" style="display:inline-block;margin-top:24px;background:#087f88;color:#fff;text-decoration:none;font-weight:800;padding:13px 20px;border-radius:10px">Åpne tilbudet</a>
        <p style="margin:28px 0 0;color:#66767d;font-size:13px;line-height:1.5">Med vennlig hilsen<br><strong>${escapeHtml(companyName)}</strong></p>
        <p style="margin:16px 0 0;color:#88979d;font-size:12px;line-height:1.5">Denne påminnelsen er sendt automatisk én gang via Expo ProffDok.</p>
      </div>
    </div>
  </div></body></html>`;
}

async function reserveNotification(serviceClient: any, candidate: any) {
  const now = new Date().toISOString();
  const existingId = String(candidate?.existing_notification_id || "").trim();
  const existingStatus = String(candidate?.existing_notification_status || "").trim();
  const existingAttempts = Number(candidate?.existing_attempt_count || 0) || 0;

  if (existingStatus === "sent" || existingAttempts >= MAX_ATTEMPTS) {
    return { shouldSend: false, id: existingId || null, status: existingStatus || "exhausted" };
  }

  if (existingId) {
    const { data, error } = await serviceClient
      .from("sales_offer_follow_up_notifications")
      .update({
        status: "pending",
        attempt_count: existingAttempts + 1,
        last_attempt_at: now,
        error_message: null,
        updated_at: now,
      })
      .eq("id", existingId)
      .neq("status", "sent")
      .select("id,status,attempt_count")
      .maybeSingle();

    if (error) throw new HttpError(500, "Kunne ikke reservere oppfølgingsforsøk.");
    if (!data) return { shouldSend: false, id: existingId, status: "already_sent" };
    return { shouldSend: true, id: data.id, status: data.status };
  }

  const { data, error } = await serviceClient
    .from("sales_offer_follow_up_notifications")
    .insert({
      offer_id: candidate.offer_id,
      offer_version_id: candidate.offer_version_id,
      company_id: candidate.company_id,
      request_ref: candidate.request_ref,
      recipient_email: candidate.customer_email,
      source_email_sent_at: candidate.source_email_sent_at,
      status: "pending",
      attempt_count: 1,
      last_attempt_at: now,
    })
    .select("id,status,attempt_count")
    .single();

  if (!error) return { shouldSend: true, id: data.id, status: data.status };

  if (error.code === "23505") {
    const { data: existing } = await serviceClient
      .from("sales_offer_follow_up_notifications")
      .select("id,status,attempt_count")
      .eq("offer_id", candidate.offer_id)
      .eq("offer_version_id", candidate.offer_version_id)
      .maybeSingle();
    return {
      shouldSend: false,
      id: existing?.id || null,
      status: existing?.status || "existing",
    };
  }

  throw new HttpError(500, "Kunne ikke reservere automatisk oppfølging.");
}

async function markResult(serviceClient: any, reservationId: string, sent: boolean, errorMessage = "") {
  const now = new Date().toISOString();
  await serviceClient
    .from("sales_offer_follow_up_notifications")
    .update({
      status: sent ? "sent" : "failed",
      sent_at: sent ? now : null,
      error_message: sent ? null : String(errorMessage || "Ukjent e-postfeil").slice(0, 1000),
      updated_at: now,
    })
    .eq("id", reservationId);
}

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const resendKey = Deno.env.get("RESEND_API_KEY") || "";
    if (!supabaseUrl || !serviceRoleKey || !resendKey) {
      throw new HttpError(500, "Mangler serverkonfigurasjon.");
    }

    const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: runtime, error: runtimeError } = await serviceClient
      .from("sales_offer_follow_up_runtime")
      .select("enabled,rollout_at,cron_secret")
      .eq("id", 1)
      .maybeSingle();
    if (runtimeError || !runtime) throw new HttpError(500, "Oppfølgingskonfigurasjon mangler.");

    const suppliedSecret = String(req.headers.get("x-expo-cron-secret") || "").trim();
    if (!suppliedSecret || suppliedSecret !== String(runtime.cron_secret || "")) {
      throw new HttpError(403, "Ugyldig worker-signatur.");
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const dryRun = body?.dryRun === true;
    if (!runtime.enabled && !dryRun) {
      return new Response(JSON.stringify({ ok: true, enabled: false, sent: 0 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const limit = Math.max(1, Math.min(Number(body?.limit || 50) || 50, 200));
    const { data: candidates, error: candidateError } = await serviceClient.rpc(
      "list_sales_offer_follow_up_candidates",
      { p_limit: limit, p_ignore_enabled: dryRun }
    );
    if (candidateError) throw new HttpError(500, candidateError.message || "Kunne ikke hente tilbud for oppfølging.");

    const candidateRows = Array.isArray(candidates) ? candidates : [];
    if (dryRun) {
      return new Response(JSON.stringify({
        ok: true,
        enabled: Boolean(runtime.enabled),
        rolloutAt: runtime.rollout_at,
        candidateCount: candidateRows.length,
        candidates: candidateRows.map((item: any) => ({
          requestRef: item.request_ref,
          versionNumber: item.version_number,
          sourceEmailSentAt: item.source_email_sent_at,
        })),
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const apiFrom = Deno.env.get("CHAT_FROM_EMAIL") || "Expo ProffDok <onboarding@resend.dev>";
    const results: any[] = [];

    for (const candidate of candidateRows) {
      const recipient = normalizeEmail(candidate?.customer_email);
      if (!recipient) {
        results.push({ requestRef: candidate?.request_ref, sent: false, status: "missing_email" });
        continue;
      }

      const reservation = await reserveNotification(serviceClient, candidate);
      if (!reservation.shouldSend || !reservation.id) {
        results.push({ requestRef: candidate?.request_ref, sent: false, status: reservation.status });
        continue;
      }

      const lines = Array.isArray(candidate?.lines) ? candidate.lines : [];
      const storeMeta = findStoreMeta(lines);
      const companySnapshot = findCompanySnapshot(lines);
      const storeOffer = Boolean(storeMeta?.__storeOfferMeta);
      const companyName = String(
        storeOffer
          ? (storeMeta?.brandLabel || companySnapshot?.companyName || "Expo ProffDok")
          : (companySnapshot?.companyName || candidate?.request_payload?.companyName || "Expo ProffDok")
      ).trim();
      const logoUrl = String(
        storeOffer
          ? (storeMeta?.brandLogoUrl || companySnapshot?.logoUrl || "")
          : (companySnapshot?.logoUrl || candidate?.request_payload?.companyLogoUrl || "")
      ).trim();
      const responsibleName = String(
        storeOffer
          ? (storeMeta?.signatureName || candidate?.published_by_name || candidate?.request_payload?.projectResponsible || "")
          : (candidate?.published_by_name || candidate?.request_payload?.projectResponsible || candidate?.request_payload?.responsible || "")
      ).trim();
      const customerUrl = `${DEFAULT_APP_ORIGIN}/?publicOffer=${encodeURIComponent(String(candidate.public_token || ""))}`;
      const subject = `${storeOffer ? "Påminnelse om butikktilbud" : "Påminnelse om tilbud"} – ${candidate.request_ref}`;
      const html = emailHtml({
        storeOffer,
        companyName,
        logoUrl,
        requestRef: candidate.request_ref,
        offerTitle: candidate.offer_title,
        customerName: candidate.customer_name,
        customerAddress: candidate.customer_address,
        responsibleName,
        originalSentAt: candidate.source_email_sent_at,
        customerUrl,
      });

      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: apiFrom,
            to: [recipient],
            subject,
            html,
          }),
        });
        const responseText = await response.text();
        if (!response.ok) throw new Error(responseText || `Resend ${response.status}`);

        await markResult(serviceClient, reservation.id, true);
        results.push({ requestRef: candidate.request_ref, versionNumber: candidate.version_number, sent: true, status: "sent" });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        await markResult(serviceClient, reservation.id, false, message);
        results.push({ requestRef: candidate.request_ref, versionNumber: candidate.version_number, sent: false, status: "failed" });
      }
    }

    return new Response(JSON.stringify({
      ok: true,
      enabled: true,
      candidateCount: candidateRows.length,
      sent: results.filter((item) => item.sent).length,
      failed: results.filter((item) => item.status === "failed").length,
      results,
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    return new Response(JSON.stringify({
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }
});
