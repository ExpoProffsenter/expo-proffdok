import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const clean = (value: unknown) => String(value ?? "").trim();
const email = (value: unknown) => clean(value).toLowerCase();
const escapeHtml = (value: unknown) => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "Kun POST er tillatt." }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const resendKey = Deno.env.get("RESEND_API_KEY") || "";
    const fromEmail = Deno.env.get("CHAT_FROM_EMAIL") || "Expo ProffDok <onboarding@resend.dev>";
    if (!supabaseUrl || !anonKey || !serviceRoleKey || !resendKey) {
      throw new HttpError(500, "Mangler nødvendig serverkonfigurasjon.");
    }

    const authorization = req.headers.get("Authorization") || "";
    if (!authorization) throw new HttpError(401, "Du må være logget inn.");

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: userData } = await userClient.auth.getUser();
    const user = userData?.user;
    if (!user?.id) throw new HttpError(401, "Du må være logget inn.");

    const { data: profile } = await serviceClient
      .from("profiles")
      .select("approved,deactivated")
      .eq("id", user.id)
      .maybeSingle();
    if (!profile?.approved || profile?.deactivated) {
      throw new HttpError(403, "E-postutsending krever en godkjent, aktiv bruker.");
    }

    const body = await req.json();
    const projectId = clean(body.projectId);
    const toEmail = email(body.toEmail);
    const subject = clean(body.subject) || "Oppdatering fra prosjektet";
    const message = clean(body.message);
    const mailKindRaw = clean(body.mailKind) || "project_update";
    const mailKind = mailKindRaw === "progress_plan" ? "progress_plan" : "project_update";

    if (!projectId || !toEmail) throw new HttpError(400, "Mangler prosjekt eller mottaker.");
    if (subject.length > 180) throw new HttpError(400, "Emnet er for langt.");
    if (message.length > 10000) throw new HttpError(400, "Meldingen er for lang.");

    const { data: project, error: projectError } = await userClient
      .from("projects")
      .select("id,title,data")
      .eq("id", projectId)
      .maybeSingle();
    if (projectError || !project) throw new HttpError(403, "Du har ikke tilgang til prosjektet.");

    const { data: participant, error: participantError } = await userClient
      .from("project_participants")
      .select("id,name,email,receive_email")
      .eq("project_id", projectId)
      .ilike("email", toEmail)
      .eq("receive_email", true)
      .maybeSingle();
    if (participantError || !participant) {
      throw new HttpError(403, "Mottakeren er ikke aktiv prosjektmottaker.");
    }

    const projectName = clean(project?.data?.project?.projectName || project?.title || "Prosjekt");
    const projectAddress = clean(project?.data?.project?.address || "");
    const companyName = clean(project?.data?.company?.name || project?.data?.company?.companyName || "Expo ProffDok");
    const logoUrl = clean(project?.data?.company?.logoUrl || "https://expo-proffdok.app/expo-logo.png");
    const targetTab = mailKind === "progress_plan" ? "fremdrift" : "prosjektinfo";
    const projectLink = `https://expo-proffdok.app/?project=${encodeURIComponent(projectId)}&tab=${encodeURIComponent(targetTab)}`;
    const safeMessage = escapeHtml(message).replaceAll("\n", "<br>");

    const html = `
      <div style="margin:0;padding:24px;background:#eef3f4;font-family:Arial,Helvetica,sans-serif;color:#172126;">
        <div style="max-width:720px;margin:0 auto;background:#ffffff;border:1px solid #dbe6e9;border-radius:18px;overflow:hidden;">
          <div style="background:#172126;color:#ffffff;padding:24px 28px;display:flex;justify-content:space-between;gap:20px;align-items:flex-start;">
            <div>
              <div style="font-size:12px;font-weight:900;letter-spacing:.08em;color:#61dce2;text-transform:uppercase;">Prosjektmelding</div>
              <h1 style="margin:6px 0 4px;font-size:26px;">${escapeHtml(projectName)}</h1>
              ${projectAddress ? `<div style="color:#d8e7e9;">${escapeHtml(projectAddress)}</div>` : ""}
            </div>
            <img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(companyName)}" style="max-width:150px;max-height:48px;background:#fff;border-radius:8px;padding:5px 8px;object-fit:contain;" />
          </div>
          <div style="padding:28px;">
            <h2 style="margin:0 0 14px;font-size:21px;">${escapeHtml(subject)}</h2>
            ${safeMessage ? `<div style="font-size:15px;line-height:1.65;color:#334155;margin-bottom:24px;">${safeMessage}</div>` : ""}
            <a href="${projectLink}" style="display:inline-block;background:#0c858e;color:#fff;text-decoration:none;font-weight:900;padding:13px 20px;border-radius:10px;">Åpne Expo ProffDok</a>
            <p style="margin:26px 0 0;color:#64748b;font-size:12px;">Denne e-posten er sendt til deg fordi du er registrert som prosjektinvolvert.</p>
          </div>
        </div>
      </div>`;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: fromEmail, to: [toEmail], subject: `${subject} – ${projectName}`, html }),
    });
    const resendResult = await resendResponse.text();
    if (!resendResponse.ok) throw new HttpError(resendResponse.status, resendResult || "Kunne ikke sende e-post.");

    const { error: noticeError } = await userClient.from("project_participant_notices").insert({
      project_id: projectId,
      recipient_email: toEmail,
      subject: `${subject} – ${projectName}`,
      message,
      mail_kind: mailKind,
    });
    if (noticeError) {
      console.error("E-post sendt, men prosjektvarsel kunne ikke lagres:", noticeError.message);
    }

    return new Response(JSON.stringify({ ok: true, noticeSaved: !noticeError }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    return new Response(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
