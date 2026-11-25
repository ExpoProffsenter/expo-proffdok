import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  MESSAGE_TYPES,
  RECIPIENT_GROUPS,
  buildUnsubscribeUrl,
  clean,
  expoProffsenterFrom,
  normalizeEmail,
  renderBroadcastEmail,
  selectBroadcastRecipients,
} from "../_shared/systemadmin-broadcast-email.mjs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_RECIPIENTS = 500;
const RESEND_BATCH_SIZE = 100;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function json(data: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function listAuthUsers(serviceClient: any) {
  const users: any[] = [];
  const perPage = 1000;
  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await serviceClient.auth.admin.listUsers({ page, perPage });
    if (error) throw new HttpError(500, "Kunne ikke hente registrerte brukere.");
    const pageUsers = Array.isArray(data?.users) ? data.users : [];
    users.push(...pageUsers);
    if (pageUsers.length < perPage) break;
  }
  return users;
}

async function resolveRecipients(serviceClient: any, recipientGroup: string, messageType: string) {
  const [authUsers, profilesResult, preferencesResult] = await Promise.all([
    listAuthUsers(serviceClient),
    serviceClient
      .from("profiles")
      .select("id,email,approved,deactivated,system_role,company_role"),
    messageType === "marketing"
      ? serviceClient
        .from("marketing_email_preferences")
        .select("user_id,email_opt_in,unsubscribe_token")
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (profilesResult.error) throw new HttpError(500, "Kunne ikke hente brukerstatus.");
  if (preferencesResult.error) throw new HttpError(500, "Kunne ikke hente e-postsamtykker.");

  return selectBroadcastRecipients({
    authUsers,
    profiles: profilesResult.data || [],
    preferences: preferencesResult.data || [],
    recipientGroup,
    messageType,
  });
}

function validateMessage(body: Record<string, unknown>) {
  const messageType = clean(body.messageType);
  const recipientGroup = clean(body.recipientGroup);
  const subject = clean(body.subject);
  const message = clean(body.message);

  if (!MESSAGE_TYPES[messageType]) throw new HttpError(400, "Velg gyldig meldingstype.");
  if (!RECIPIENT_GROUPS[recipientGroup]) throw new HttpError(400, "Velg gyldig mottakergruppe.");
  if (!subject) throw new HttpError(400, "Emne mangler.");
  if (!message) throw new HttpError(400, "Melding mangler.");
  if (subject.length > 160) throw new HttpError(400, "Emnet kan være maksimalt 160 tegn.");
  if (message.length > 5000) throw new HttpError(400, "Meldingen kan være maksimalt 5000 tegn.");

  return { messageType, recipientGroup, subject, message };
}

async function sendTestEmail({
  resendKey,
  from,
  to,
  subject,
  message,
  messageType,
  logoUrl,
  appUrl,
  requestId,
}: any) {
  const rendered = renderBroadcastEmail({
    subject,
    message,
    messageType,
    logoUrl,
    appUrl,
    isTest: true,
  });
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `systemadmin-broadcast-test/${requestId}`,
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `[TEST] ${subject}`,
      html: rendered.html,
      text: rendered.text,
      tags: [
        { name: "message_type", value: messageType },
        { name: "delivery", value: "test" },
      ],
    }),
  });
  const responseText = await response.text();
  if (!response.ok) throw new HttpError(502, responseText || "Testutsendingen feilet.");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ ok: false, error: "Kun POST er tillatt." }, 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const publicKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || "";
    const serviceKey = Deno.env.get("SUPABASE_SECRET_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const resendKey = Deno.env.get("RESEND_API_KEY") || "";
    const configuredFrom = Deno.env.get("EXPO_BROADCAST_FROM_EMAIL") || Deno.env.get("CHAT_FROM_EMAIL") || "";
    const logoUrl = Deno.env.get("EXPO_BROADCAST_LOGO_URL") || "https://expo-proffdok.app/expo-logo.png";
    const appUrl = Deno.env.get("EXPO_APP_URL") || "https://expo-proffdok.app";

    if (!supabaseUrl || !publicKey || !serviceKey) {
      throw new HttpError(500, "Mangler nødvendig serverkonfigurasjon.");
    }

    const authorization = req.headers.get("Authorization") || "";
    if (!authorization) throw new HttpError(401, "Du må være logget inn.");

    const userClient = createClient(supabaseUrl, publicKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const serviceClient = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: userData, error: userError } = await userClient.auth.getUser();
    const user = userData?.user;
    if (userError || !user?.id) throw new HttpError(401, "Du må være logget inn.");

    const { data: profile, error: profileError } = await serviceClient
      .from("profiles")
      .select("approved,deactivated,system_role,email")
      .eq("id", user.id)
      .maybeSingle();
    if (
      profileError ||
      !profile?.approved ||
      profile?.deactivated ||
      profile?.system_role !== "systemadmin"
    ) {
      throw new HttpError(403, "Kun aktiv systemadministrator kan sende felles e-post.");
    }

    const body = await req.json() as Record<string, unknown>;
    const action = clean(body.action);
    const validated = validateMessage(body);
    const selection = await resolveRecipients(
      serviceClient,
      validated.recipientGroup,
      validated.messageType,
    );

    const preview = {
      messageType: validated.messageType,
      messageTypeLabel: MESSAGE_TYPES[validated.messageType],
      recipientGroup: validated.recipientGroup,
      recipientGroupLabel: RECIPIENT_GROUPS[validated.recipientGroup],
      groupCount: selection.groupCount,
      eligibleCount: selection.eligibleCount,
      excludedNoConsent: selection.excludedNoConsent,
      excludedInvalid: selection.excludedInvalid,
    };

    if (action === "preview") return json({ ok: true, preview });

    if (!resendKey) throw new HttpError(500, "E-posttjenesten er ikke konfigurert.");
    const from = expoProffsenterFrom(configuredFrom);

    if (action === "test") {
      const requestId = clean(body.clientRequestId);
      if (!UUID_PATTERN.test(requestId)) throw new HttpError(400, "Ugyldig test-ID.");
      const testEmail = normalizeEmail(body.testEmail || user.email || profile?.email);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail)) {
        throw new HttpError(400, "Oppgi en gyldig testadresse.");
      }
      await sendTestEmail({
        resendKey,
        from,
        to: testEmail,
        subject: validated.subject,
        message: validated.message,
        messageType: validated.messageType,
        logoUrl,
        appUrl,
        requestId,
      });
      return json({ ok: true, testSent: true, preview });
    }

    if (action !== "send") throw new HttpError(400, "Ugyldig handling.");
    if (!selection.eligibleCount) throw new HttpError(400, "Mottakergruppen har ingen kvalifiserte mottakere.");
    if (selection.eligibleCount > MAX_RECIPIENTS) {
      throw new HttpError(400, `Utsendingen er begrenset til ${MAX_RECIPIENTS} mottakere per kampanje.`);
    }

    const confirmedRecipientCount = Number(body.confirmedRecipientCount);
    const confirmation = clean(body.confirmation);
    if (
      confirmedRecipientCount !== selection.eligibleCount ||
      confirmation !== `SEND ${selection.eligibleCount}`
    ) {
      throw new HttpError(409, "Mottakerlisten er endret. Kontroller mottakerne på nytt før utsending.");
    }

    const clientRequestId = clean(body.clientRequestId);
    if (!UUID_PATTERN.test(clientRequestId)) throw new HttpError(400, "Ugyldig utsendings-ID.");

    const { data: campaign, error: campaignError } = await serviceClient
      .from("systemadmin_email_campaigns")
      .insert({
        client_request_id: clientRequestId,
        created_by: user.id,
        message_type: validated.messageType,
        recipient_group: validated.recipientGroup,
        subject: validated.subject,
        message: validated.message,
        recipient_count: selection.eligibleCount,
        status: "processing",
      })
      .select("id,status,recipient_count,sent_count,failed_count")
      .single();

    if (campaignError?.code === "23505") {
      const { data: existing } = await serviceClient
        .from("systemadmin_email_campaigns")
        .select("id,status,recipient_count,sent_count,failed_count")
        .eq("client_request_id", clientRequestId)
        .maybeSingle();
      return json({ ok: true, alreadyProcessed: true, campaign: existing || null });
    }
    if (campaignError || !campaign?.id) throw new HttpError(500, "Kunne ikke reservere utsendingen.");

    let sentCount = 0;
    const batchIds: string[] = [];
    const errors: string[] = [];

    for (let offset = 0; offset < selection.recipients.length; offset += RESEND_BATCH_SIZE) {
      const batchIndex = Math.floor(offset / RESEND_BATCH_SIZE);
      const recipients = selection.recipients.slice(offset, offset + RESEND_BATCH_SIZE);
      const payload = recipients.map((recipient: any) => {
        const unsubscribeUrl = validated.messageType === "marketing"
          ? buildUnsubscribeUrl(supabaseUrl, recipient.unsubscribeToken)
          : "";
        const rendered = renderBroadcastEmail({
          subject: validated.subject,
          message: validated.message,
          messageType: validated.messageType,
          recipientName: recipient.name,
          logoUrl,
          appUrl,
          unsubscribeUrl,
          isTest: false,
        });
        const headers = validated.messageType === "marketing"
          ? {
              "List-Unsubscribe": `<${unsubscribeUrl}>`,
              "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
            }
          : undefined;
        return {
          from,
          to: [recipient.email],
          subject: validated.subject,
          html: rendered.html,
          text: rendered.text,
          ...(headers ? { headers } : {}),
          tags: [
            { name: "message_type", value: validated.messageType },
            { name: "recipient_group", value: validated.recipientGroup },
          ],
        };
      });

      const resendResponse = await fetch("https://api.resend.com/emails/batch", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
          "Idempotency-Key": `systemadmin-broadcast/${campaign.id}/${batchIndex}`,
        },
        body: JSON.stringify(payload),
      });
      const responseText = await resendResponse.text();
      if (!resendResponse.ok) {
        errors.push(`Batch ${batchIndex + 1}: ${responseText || `Resend ${resendResponse.status}`}`);
        break;
      }

      sentCount += recipients.length;
      try {
        const parsed = JSON.parse(responseText);
        for (const item of parsed?.data || []) {
          if (clean(item?.id)) batchIds.push(clean(item.id));
        }
      } catch {
        // Antall sendte er autoritativt selv om Resend-svaret ikke kan logges som JSON.
      }
    }

    const failedCount = selection.eligibleCount - sentCount;
    const status = sentCount === selection.eligibleCount
      ? "sent"
      : sentCount > 0
        ? "partial"
        : "failed";
    const { error: updateError } = await serviceClient
      .from("systemadmin_email_campaigns")
      .update({
        sent_count: sentCount,
        failed_count: failedCount,
        status,
        resend_batch_ids: batchIds,
        error_summary: errors.join("\n").slice(0, 4000) || null,
        completed_at: new Date().toISOString(),
      })
      .eq("id", campaign.id);
    if (updateError) console.error("Utsending fullført, men auditlogg kunne ikke oppdateres:", updateError.message);

    if (status === "failed") throw new HttpError(502, "Ingen e-poster ble sendt. Utsendingen er loggført som feilet.");
    return json({
      ok: true,
      campaign: {
        id: campaign.id,
        status,
        recipientCount: selection.eligibleCount,
        sentCount,
        failedCount,
      },
    });
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    console.error(
      "systemadmin-broadcast-email:",
      error instanceof Error ? error.message : String(error),
    );
    return json({
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    }, status);
  }
});
