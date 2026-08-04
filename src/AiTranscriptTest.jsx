// FASE 19.7 KONTROLLERT AI-TRANSKRIPSJONSTEST
// Isolert testside på feature/befaring-tilbud. Bruker eksisterende Supabase-session
// fra Expo ProffDok på samme preview-origin. Ingen prosjekt-/database-/SalesModule-lagring.

import React, { useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://dqffxflaoyarbxyiyhop.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxZmZ4Zmxhb3lhcmJ4eWl5aG9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NzcxNTEsImV4cCI6MjA5MzA1MzE1MX0.5fkVNPooHGlayw4NgYM3fUVrAiv0XbUyTixkfeToMSE"
);

function App() {
  const [audio, setAudio] = useState(null);
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  function setAudioBlob(blob, name = "befaring.webm") {
    if (!blob?.size) {
      setError("Opptaket er tomt.");
      return;
    }
    setAudio({ blob, name, url: URL.createObjectURL(blob) });
    setResult(null);
    setError("");
    setStatus("Lyd klar for AI-test.");
  }

  async function startRecording() {
    setError("");
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("Direkte opptak støttes ikke her. Bruk Velg eller ta opp lydfil.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      streamRef.current = stream;
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data?.size) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        streamRef.current?.getTracks?.().forEach((track) => track.stop());
        streamRef.current = null;
        recorderRef.current = null;
        setRecording(false);
        setAudioBlob(blob, "befaring.webm");
      };
      recorder.start();
      setRecording(true);
      setStatus("Opptak pågår...");
    } catch {
      setError("Mikrofonen kunne ikke startes. Bruk Velg eller ta opp lydfil.");
    }
  }

  function stopRecording() {
    if (recorderRef.current?.state !== "inactive") recorderRef.current?.stop();
  }

  function handleFile(event) {
    const file = event.target.files?.[0];
    if (file) setAudioBlob(file, file.name || "befaring-audio");
    event.target.value = "";
  }

  async function runAiTest() {
    if (!audio?.blob) return;
    setError("");
    setResult(null);
    setStatus("Kontrollerer innlogging...");

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      let session = sessionData?.session || null;

      if (!session?.access_token) {
        throw new Error(
          "Ingen aktiv Expo ProffDok-session funnet. Åpne hovedappen på samme preview-lenke, logg inn der, og gå så tilbake til denne testsiden."
        );
      }

      const formData = new FormData();
      formData.append(
        "audio",
        new File([audio.blob], audio.name, {
          type: audio.blob.type || "audio/webm",
        })
      );

      setStatus("Transkriberer og lager strukturert forslag...");

      const response = await fetch(
        "https://dqffxflaoyarbxyiyhop.supabase.co/functions/v1/inspection-assistant",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            apikey:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxZmZ4Zmxhb3lhcmJ4eWl5aG9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NzcxNTEsImV4cCI6MjA5MzA1MzE1MX0.5fkVNPooHGlayw4NgYM3fUVrAiv0XbUyTixkfeToMSE",
          },
          body: formData,
        }
      );

      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error || `AI-test feilet (${response.status}).`);
      }

      setResult(payload);
      setStatus("AI-test fullført. Kontroller resultatet under.");
    } catch (err) {
      setStatus("");
      setError(err?.message || "AI-testen feilet.");
    }
  }

  const suggestion = result?.suggestion || {};

  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: 20, fontFamily: "Arial, sans-serif", color: "#17313d" }}>
      <section style={{ background: "#fff", border: "1px solid #dce7eb", borderRadius: 18, padding: 22 }}>
        <p style={{ marginTop: 0, fontWeight: 700, color: "#16708a" }}>FASE 19.7 · ISOLERT TEST</p>
        <h1>AI-transkripsjon av befaring</h1>
        <p>
          Denne siden tester kun innlogget bruker → lyd → inspection-assistant → transkripsjon → fire strukturerte felt.
          Ingenting lagres i prosjekt eller database.
        </p>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "20px 0" }}>
          {recording ? (
            <button type="button" onClick={stopRecording}>Stopp opptak</button>
          ) : (
            <button type="button" onClick={startRecording}>Ta opp befaringsnotat</button>
          )}
          <label style={{ border: "1px solid #9db3bc", borderRadius: 8, padding: "8px 12px", cursor: "pointer" }}>
            Velg eller ta opp lydfil
            <input type="file" accept="audio/*" capture onChange={handleFile} style={{ display: "none" }} />
          </label>
        </div>

        {audio ? (
          <div style={{ margin: "16px 0", padding: 16, background: "#f5f9fa", borderRadius: 12 }}>
            <strong>Lyd klar</strong>
            <audio controls src={audio.url} style={{ width: "100%", marginTop: 10 }} />
            <button type="button" onClick={runAiTest} style={{ marginTop: 12 }}>
              Send lyd til AI-transkripsjon
            </button>
          </div>
        ) : null}

        {status ? <p><strong>{status}</strong></p> : null}
        {error ? <p style={{ padding: 12, border: "1px solid #c77", borderRadius: 10 }}><strong>Feil:</strong> {error}</p> : null}

        {result ? (
          <section style={{ marginTop: 22 }}>
            <h2>Resultat</h2>
            <h3>Full transkripsjon</h3>
            <p style={{ whiteSpace: "pre-wrap", background: "#f5f9fa", padding: 14, borderRadius: 10 }}>{result.transcript}</p>
            <h3>Strukturert forslag</h3>
            <p><strong>Kundens ønsker:</strong><br />{suggestion.customerWishes || "—"}</p>
            <p><strong>Eksisterende forhold:</strong><br />{suggestion.existingConditions || "—"}</p>
            <p><strong>Målinger:</strong><br />{suggestion.measurements || "—"}</p>
            <p><strong>Faglige observasjoner:</strong><br />{suggestion.professionalObservations || "—"}</p>
          </section>
        ) : null}
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
