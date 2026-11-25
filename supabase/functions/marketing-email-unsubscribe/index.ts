import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const pageHeaders = {
  "Content-Type": "text/html; charset=utf-8",
  "Cache-Control": "no-store",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Content-Security-Policy": "default-src 'none'; img-src https://expo-proffdok.app; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
};

function page({ completed = false, error = "", token = "" } = {}) {
  const content = completed
    ? `<h1>E-postvalget er oppdatert</h1><p>Du vil ikke lenger motta nyheter og markedsføring fra Expo Proffsenter.</p><p>Nødvendige driftsmeldinger om Expo ProffDok kan fortsatt bli sendt.</p>`
    : error
      ? `<h1>Lenken kan ikke brukes</h1><p>${error}</p>`
      : `<h1>Avslutt markedsførings-e-post?</h1><p>Du vil ikke lenger motta nyheter, tips eller tilbud fra Expo Proffsenter.</p><p>Nødvendige driftsmeldinger om Expo ProffDok påvirkes ikke.</p><form method="post" action="?token=${token}"><button type="submit">Ja, meld meg av</button></form>`;
  return `<!doctype html><html lang="no"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>E-postvalg – Expo Proffsenter</title></head><body style="margin:0;background:#eef3f5;font-family:Arial,Helvetica,sans-serif;color:#172126"><main style="max-width:640px;margin:48px auto;padding:0 16px"><section style="background:#fff;border:1px solid #d7e0e3;border-radius:18px;overflow:hidden"><div style="padding:20px 26px;background:#20292d"><img src="https://expo-proffdok.app/expo-logo.png" alt="Expo Proffsenter" style="display:block;width:100%;max-width:290px;background:#fff;border-radius:8px;padding:8px 10px"></div><div style="padding:30px 26px;line-height:1.65">${content}</div></section></main><style>h1{margin:0 0 14px;font-size:26px}p{color:#435158}button{margin-top:12px;border:0;border-radius:10px;background:#087f88;color:#fff;padding:13px 18px;font-size:15px;font-weight:800;cursor:pointer}</style></body></html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { status: 200 });
  if (req.method !== "GET" && req.method !== "POST") {
    return new Response(page({ error: "Denne siden støtter bare åpning og bekreftelse." }), {
      status: 405,
      headers: pageHeaders,
    });
  }

  const url = new URL(req.url);
  const token = String(url.searchParams.get("token") || "").trim();
  if (!UUID_PATTERN.test(token)) {
    return new Response(page({ error: "Avmeldingslenken er ugyldig eller ufullstendig." }), {
      status: 400,
      headers: pageHeaders,
    });
  }

  if (req.method === "GET") {
    return new Response(page({ token }), { status: 200, headers: pageHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const serviceKey = Deno.env.get("SUPABASE_SECRET_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  if (!supabaseUrl || !serviceKey) {
    return new Response(page({ error: "Tjenesten er midlertidig utilgjengelig. Prøv igjen senere." }), {
      status: 503,
      headers: pageHeaders,
    });
  }

  const serviceClient = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await serviceClient
    .from("marketing_email_preferences")
    .update({
      email_opt_in: false,
      consent_source: "email_unsubscribe",
      unsubscribed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("unsubscribe_token", token)
    .eq("email_opt_in", true);

  if (error) {
    console.error("Kunne ikke lagre avmelding:", error.message);
    return new Response(page({ error: "E-postvalget kunne ikke oppdateres. Prøv igjen senere." }), {
      status: 500,
      headers: pageHeaders,
    });
  }

  // Samme nøytrale svar brukes når lenken allerede er avmeldt, slik at endepunktet
  // ikke røper om en bestemt bruker eller token finnes.
  return new Response(page({ completed: true }), { status: 200, headers: pageHeaders });
});
