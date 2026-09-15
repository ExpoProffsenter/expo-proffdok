import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";

const SANDBOX_URL = "https://ppvircenkjizeiqdxphj.supabase.co";
const SANDBOX_KEY = "sb_publishable_wSw_jYJ6t6StH3p0G10wnA_pjYOXVeR";
const DEMO_EMAIL = "demo@expo-proffdok.no";
const PRODUCTION_REPO = "ExpoProffsenter/expo-proffdok";
const SANDBOX_PRODUCTION_BASELINE = "1b98fef90fe57c24996982f39619a5bc0ce8a4f2";
const DEMO_SKETCH_REQUEST_IDS = ["DEMO-01-FORESPORSEL", "DEMO-02-BEFARING"];
const DEMO_BATHROOM_SKETCH = {
  version: 15,
  dimensions: { walls: true, openings: true, fixtures: true },
  walls: [
    { id: "demo-wall-top", x1: 120, y1: 70, x2: 600, y2: 70, lengthMm: "2420", createdAt: 1 },
    { id: "demo-wall-right", x1: 600, y1: 70, x2: 600, y2: 390, lengthMm: "2150", createdAt: 2 },
    { id: "demo-wall-bottom", x1: 600, y1: 390, x2: 120, y2: 390, lengthMm: "2420", createdAt: 3 },
    { id: "demo-wall-left", x1: 120, y1: 390, x2: 120, y2: 70, lengthMm: "2150", createdAt: 4 },
  ],
  openings: [
    { id: "demo-door", type: "door", wallId: "demo-wall-left", t: 0.72, widthMm: "800", heightMm: "2100", sillHeightMm: "", hingeSide: "end", swingSide: "positive", createdAt: 5 },
    { id: "demo-window", type: "window", wallId: "demo-wall-top", t: 0.66, widthMm: "900", heightMm: "600", sillHeightMm: "1300", hingeSide: "start", swingSide: "negative", createdAt: 6 },
  ],
  markers: [
    { id: "demo-drain", type: "drain", x: 520, y: 315, diameterMm: "", createdAt: 7 },
    { id: "demo-waste", type: "waste", x: 235, y: 320, diameterMm: "110", createdAt: 8 },
    { id: "demo-cold", type: "cold", x: 285, y: 135, diameterMm: "30", createdAt: 9 },
    { id: "demo-hot", type: "hot", x: 335, y: 135, diameterMm: "30", createdAt: 10 },
  ],
  boxes: [
    { id: "demo-sink", x: 255, y: 125, widthMm: "600", depthMm: "450", label: "Servant", snap: "wall", snapWallId: "demo-wall-top", wallOffsetMm: "0", rotation: 0, createdAt: 11 },
    { id: "demo-toilet", x: 250, y: 335, widthMm: "360", depthMm: "550", label: "WC", snap: "wall", snapWallId: "demo-wall-bottom", wallOffsetMm: "0", rotation: 180, createdAt: 12 },
    { id: "demo-shower", x: 515, y: 300, widthMm: "900", depthMm: "900", label: "Dusj", snap: "free", snapWallId: "", wallOffsetMm: "0", rotation: 0, createdAt: 13 },
  ],
  strokes: [],
};

const supabase = createClient(SANDBOX_URL, SANDBOX_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

const shell = { maxWidth: 1100, margin: "0 auto", padding: "28px 18px 64px" };
const card = { background: "#fff", border: "1px solid #cbdde3", borderRadius: 20, padding: 20, boxShadow: "0 10px 30px rgba(16,33,43,.07)", marginBottom: 16 };
const button = { border: "1px solid #aac8d2", background: "#fff", color: "#10212b", borderRadius: 13, padding: "11px 15px", fontWeight: 800, cursor: "pointer" };
const primaryButton = { ...button, background: "#18c4cf", borderColor: "#18c4cf" };
const dangerButton = { ...button, background: "#fff4f2", borderColor: "#f2b8ae", color: "#9b2c22" };

const LABELS = {
  production_baseline: "Produksjonskode synkron",
  local_sketch: "Redigerbar Badskisse på denne enheten",
  sales: "Fem demo-stopp",
  offer: "Tilbudsgrunnlag",
  main_project: "HOVED-prosjekt",
  reserve_project: "RESERVE ferdig prosjekt",
  portal: "Kunde- og UE-link",
  participants: "Prosjektinvolverte",
  progress_main: "HOVED fremdrift",
  progress_finished: "RESERVE fremdrift",
  contract: "Signert kontrakt",
  warranty_docs: "Garantipunkter",
  finished_deviations: "RESERVE avvik",
  handover: "Overtagelse",
  warranty: "Garantidokument",
  storage: "Storage",
  snapshot: "Golden snapshot",
};

function bathroomSketchStorageKey(requestId = "") {
  return `expo-proffdok:bathroom-sketch:v1:${String(requestId || "").trim()}`;
}

function seedLocalDemoState() {
  let seeded = 0;
  for (const requestId of DEMO_SKETCH_REQUEST_IDS) {
    try {
      window.localStorage.setItem(bathroomSketchStorageKey(requestId), JSON.stringify(DEMO_BATHROOM_SKETCH));
      seeded += 1;
    } catch {}
  }
  return seeded;
}

function checkLocalDemoAssets() {
  let valid = 0;
  for (const requestId of DEMO_SKETCH_REQUEST_IDS) {
    try {
      const raw = window.localStorage.getItem(bathroomSketchStorageKey(requestId));
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed?.version === 15 && Array.isArray(parsed?.walls) && parsed.walls.length >= 4 && Array.isArray(parsed?.boxes) && parsed.boxes.length >= 3) valid += 1;
    } catch {}
  }
  return {
    ok: valid === DEMO_SKETCH_REQUEST_IDS.length,
    key: "local_sketch",
    detail: valid === DEMO_SKETCH_REQUEST_IDS.length
      ? `Klar for DEMO-01 og DEMO-02 (${valid}/${DEMO_SKETCH_REQUEST_IDS.length})`
      : `${valid}/${DEMO_SKETCH_REQUEST_IDS.length} lokal(e) skisse(r) installert. Trykk «Installer demoskisse».`,
  };
}

function clearLocalDemoState() {
  const removed = [];
  const clearStore = (storage, label) => {
    if (!storage) return;
    const keys = [];
    for (let i = 0; i < storage.length; i += 1) keys.push(storage.key(i));
    keys.filter(Boolean).forEach((key) => {
      const lower = String(key).toLowerCase();
      if (lower.startsWith("sb-")) return; // behold sandbox-login
      if (
        lower.includes("expoproffdok") || lower.includes("expo-proffdok") ||
        lower.includes("sales") || lower.includes("befaring") || lower.includes("offer") ||
        lower.includes("prosjekt") || lower.includes("project") || lower.includes("progress")
      ) {
        storage.removeItem(key);
        removed.push(`${label}:${key}`);
      }
    });
  };
  try { clearStore(window.localStorage, "local"); } catch {}
  try { clearStore(window.sessionStorage, "session"); } catch {}
  return removed;
}

async function callRpc(name) {
  const { data, error } = await supabase.rpc(name);
  if (error) throw error;
  return data || {};
}

async function checkProductionBaseline() {
  try {
    const response = await fetch(`https://api.github.com/repos/${PRODUCTION_REPO}/commits/main`, {
      headers: { Accept: "application/vnd.github+json" },
      cache: "no-store",
    });
    if (!response.ok) {
      return {
        ok: false,
        key: "production_baseline",
        detail: `Kunne ikke kontrollere main (${response.status}). Kjør ny preflight når nettet er stabilt.`,
      };
    }
    const payload = await response.json();
    const currentMainSha = String(payload?.sha || "").trim();
    const matches = Boolean(currentMainSha) && currentMainSha === SANDBOX_PRODUCTION_BASELINE;
    return {
      ok: matches,
      key: "production_baseline",
      detail: matches
        ? `Synkron med main ${currentMainSha.slice(0, 8)}`
        : `Sandbox ${SANDBOX_PRODUCTION_BASELINE.slice(0, 8)} · main ${currentMainSha.slice(0, 8) || "ukjent"}. Synk main → sandbox før demo.`,
    };
  } catch (error) {
    return {
      ok: false,
      key: "production_baseline",
      detail: `Produksjonsbaseline kunne ikke kontrolleres: ${error.message}`,
    };
  }
}

async function runFullPreflight() {
  const [serverResult, baselineCheck] = await Promise.all([
    callRpc("demo_sandbox_preflight"),
    checkProductionBaseline(),
  ]);
  const serverChecks = Array.isArray(serverResult?.checks) ? serverResult.checks : [];
  const localSketchCheck = checkLocalDemoAssets();
  const checks = [baselineCheck, localSketchCheck, ...serverChecks.filter((item) => item?.key !== "production_baseline" && item?.key !== "local_sketch")];
  return {
    ...serverResult,
    checks,
    ok: Boolean(serverResult?.ok) && checks.every((item) => item?.ok),
    productionBaseline: {
      sandboxMainSha: SANDBOX_PRODUCTION_BASELINE,
      repository: PRODUCTION_REPO,
    },
  };
}

function StatusDot({ ok }) {
  return <span style={{ display: "inline-block", width: 12, height: 12, borderRadius: 999, background: ok ? "#0f9f6e" : "#d33b31", marginRight: 9 }} />;
}

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [preflight, setPreflight] = useState(null);

  const allowed = useMemo(() => String(session?.user?.email || "").toLowerCase() === DEMO_EMAIL, [session]);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data?.session || null);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => { active = false; data?.subscription?.unsubscribe?.(); };
  }, []);

  const runPreflight = async () => {
    setBusy("preflight"); setMessage("");
    try {
      const result = await runFullPreflight();
      setPreflight(result);
      setMessage(result.ok ? "✅ Demo Sandbox er klar." : "⚠️ Preflight fant røde punkter. Ikke start kundedemo før de er avklart.");
      return result;
    } catch (error) {
      setMessage(`Preflight feilet: ${error.message}`);
      return null;
    } finally { setBusy(""); }
  };

  const resetDemo = async () => {
    if (!window.confirm("Tilbakestille alle DEMO-saker og demo-prosjekter til Golden Demo? Kun sandbox påvirkes.")) return;
    setBusy("reset"); setMessage("");
    try {
      const restored = await callRpc("demo_sandbox_reset");
      const removed = clearLocalDemoState();
      const seeded = seedLocalDemoState();
      const checked = await runFullPreflight();
      setPreflight(checked);
      setMessage(checked.ok
        ? `✅ Demo tilbakestilt: ${restored.sales || 0} Sales-saker / ${restored.projects || 0} prosjekter. ${removed.length} lokale demo-/recovery-nøkler ryddet og ${seeded} redigerbare Badskisser installert. Innlogging er beholdt.`
        : `⚠️ Demo-data er tilbakestilt, men preflight er ikke grønn. ${removed.length} lokale demo-/recovery-nøkler ble ryddet og ${seeded} Badskisser installert. Ikke start kundedemo før røde punkter er avklart.`
      );
    } catch (error) {
      setMessage(`Reset stoppet uten å fortsette: ${error.message}`);
    } finally { setBusy(""); }
  };

  const captureGolden = async () => {
    if (!window.confirm("Er dagens sandbox kontrollert og godkjent? Dette erstatter Golden Demo-snapshotet som brukes ved fremtidig reset.")) return;
    setBusy("capture"); setMessage("");
    try {
      const baseline = await checkProductionBaseline();
      if (!baseline.ok) {
        setPreflight({ ok: false, checks: [baseline, checkLocalDemoAssets()] });
        setMessage("⚠️ Golden Demo ble ikke oppdatert fordi sandboxen ikke er verifisert synkron med gjeldende main.");
        return;
      }
      const result = await callRpc("demo_sandbox_capture_golden");
      setMessage(`✅ Ny Golden Demo lagret: ${result.sales || 0} Sales-saker / ${result.projects || 0} prosjekter.`);
      await runPreflight();
    } catch (error) {
      setMessage(`Gullkopi ble ikke endret: ${error.message}`);
    } finally { setBusy(""); }
  };

  const resetLocal = async () => {
    if (!window.confirm("Rydde lokale demo-kladd/recovery-data på denne enheten og installere ren DEMO-Badskisse? Innlogging beholdes.")) return;
    const removed = clearLocalDemoState();
    const seeded = seedLocalDemoState();
    setMessage(`✅ ${removed.length} lokale demo-/recovery-nøkler ryddet. ${seeded} DEMO-Badskisser installert. Innlogging er beholdt.`);
    await runPreflight();
  };

  const installSketch = async () => {
    const seeded = seedLocalDemoState();
    setMessage(`✅ ${seeded} redigerbare DEMO-Badskisser installert på denne enheten.`);
    await runPreflight();
  };

  useEffect(() => {
    if (allowed) runPreflight();
  }, [allowed]);

  if (loading) return <main style={shell}><div style={card}>Kontrollerer sandbox-session…</div></main>;

  const checks = Array.isArray(preflight?.checks) ? preflight.checks : [];

  return <main style={shell}>
    <div style={{ ...card, background: "#153f54", color: "white" }}>
      <div style={{ fontWeight: 900, letterSpacing: ".08em", color: "#77e6ec", fontSize: 13 }}>DEMO SANDBOX · IKKE PRODUKSJON</div>
      <h1 style={{ margin: "8px 0 6px", fontSize: 36 }}>Golden Demo – kontroll</h1>
      <p style={{ margin: 0, color: "#dbeaf0", maxWidth: 860 }}><b>HOVED</b> er den sammenhengende demoen du bruker normalt. DEMO-02–05 og <b>RESERVE – Ferdig våtrom</b> er kun sikkerhetsnett hvis du vil hoppe frem eller vise et ferdig sluttresultat.</p>
    </div>

    {!session && <div style={card}><b>Ikke innlogget i sandboxen.</b><p>Åpne hovedappen, logg inn som demo-bruker og gå tilbake hit.</p><a href="/" style={{ ...primaryButton, display: "inline-block", textDecoration: "none" }}>Åpne sandbox-app</a></div>}
    {session && !allowed && <div style={{ ...card, borderColor: "#f2b8ae" }}><b>Kontrollsiden er sperret.</b><p>Kun dedikert demo-bruker kan kjøre preflight/reset. Aktiv bruker: {session.user.email}</p></div>}

    {allowed && <>
      <div style={card}>
        <h2 style={{ marginTop: 0 }}>Slik viser du flyten</h2>
        <ol style={{ lineHeight: 1.7 }}>
          <li>Start i <b>DEMO-01 – Forespørsel</b> og følg vanlig flyt så langt du ønsker.</li>
          <li>Vis live-handlinger som planlegg befaring, Badskisse, tilbud, kundevisning og «Hent fra tilbud» når det passer.</li>
          <li>Hvis du vil spare tid, åpne et ferdig checkpoint i Sales-listen.</li>
          <li>For sluttfasen kan du åpne <b>DEMO – RESERVE – Ferdig våtrom med garanti</b> i Prosjektlisten.</li>
          <li>Etter møtet: trykk <b>Tilbakestill demo</b> her. Neste demo starter likt.</li>
        </ol>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a href="/" style={{ ...primaryButton, display: "inline-block", textDecoration: "none" }}>Åpne sandbox-app</a>
          <a href="/demo-showcase.html" style={{ ...button, display: "inline-block", textDecoration: "none" }}>Nød-demo uten backend</a>
        </div>
      </div>

      <div style={card}>
        <h2 style={{ marginTop: 0 }}>Demo klar?</h2>
        <p style={{ marginTop: -4, color: "#61747f" }}>Første kontroll er alltid at sandboxen bygger på samme produksjonsbaseline som gjeldende <code>main</code>. I tillegg må denne nettleseren ha den redigerbare DEMO-Badskissen. Hvis Production har gått videre eller skissen mangler, blir kontrollen rød.</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
          <button style={primaryButton} disabled={!!busy} onClick={runPreflight}>{busy === "preflight" ? "Kontrollerer…" : "Kjør preflight"}</button>
          <button style={button} disabled={!!busy} onClick={installSketch}>Installer demoskisse</button>
          <button style={button} disabled={!!busy} onClick={resetLocal}>Rydd lokal demo-state</button>
        </div>
        {checks.length > 0 && <div style={{ display: "grid", gap: 8 }}>
          {checks.map((item) => <div key={item.key} style={{ padding: "10px 12px", border: "1px solid #dce9ed", borderRadius: 12, background: item.ok ? "#f3fcf8" : "#fff6f4" }}><StatusDot ok={item.ok}/><b>{LABELS[item.key] || item.key}</b><span style={{ color: "#61747f", marginLeft: 8 }}>{item.detail}</span></div>)}
        </div>}
      </div>

      <div style={card}>
        <h2 style={{ marginTop: 0 }}>Tilbakestill neste demo</h2>
        <p>Reseten kjører på serveren og gjenoppretter bare DEMO-saker/prosjekter i den isolerte sandboxen. Den rydder deretter lokal demo-/recovery-state på denne enheten, installerer ren redigerbar Badskisse og beholder innloggingen.</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button style={dangerButton} disabled={!!busy} onClick={resetDemo}>{busy === "reset" ? "Tilbakestiller…" : "Tilbakestill demo"}</button>
          <button style={button} disabled={!!busy} onClick={captureGolden}>{busy === "capture" ? "Lagrer gullkopi…" : "Oppdater Golden Demo (kun når godkjent)"}</button>
        </div>
      </div>

      {message && <div style={{ ...card, borderColor: message.includes("⚠️") || message.toLowerCase().includes("feil") || message.toLowerCase().includes("stoppet") ? "#f2b8ae" : "#9bd7c0" }}><b>{message}</b></div>}
    </>}
  </main>;
}

createRoot(document.getElementById("root")).render(<App />);
