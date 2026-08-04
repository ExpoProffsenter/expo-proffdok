// api/inspection-assistant.js
// FASE 19.10 SAMME-ORIGIN PROXY
// Mottar autentisert lydrequest fra Expo ProffDok på samme Vercel-origin og
// videresender den server-til-server til Supabase Edge Function.
// Ingen lyd lagres her.

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  "https://dqffxflaoyarbxyiyhop.supabase.co";

const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxZmZ4Zmxhb3lhcmJ4eWl5aG9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NzcxNTEsImV4cCI6MjA5MzA1MzE1MX0.5fkVNPooHGlayw4NgYM3fUVrAiv0XbUyTixkfeToMSE";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "12mb",
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const authorization = String(req.headers.authorization || "");

  if (!authorization.startsWith("Bearer ")) {
    return res.status(401).json({ ok: false, error: "Mangler innlogging." });
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/inspection-assistant`,
      {
        method: "POST",
        headers: {
          Authorization: authorization,
          apikey: SUPABASE_ANON_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body || {}),
      }
    );

    const responseText = await response.text();
    let payload;

    try {
      payload = JSON.parse(responseText);
    } catch {
      payload = {
        ok: false,
        error:
          response.status === 403
            ? "Supabase avviste AI-kallet før funksjonen ble kjørt."
            : "Befaringsassistenten returnerte et ugyldig svar.",
      };
    }

    return res.status(response.status).json(payload);
  } catch (error) {
    console.error("inspection-assistant proxy error", error);
    return res.status(502).json({
      ok: false,
      error: "Kunne ikke kontakte befaringsassistenten.",
    });
  }
}
