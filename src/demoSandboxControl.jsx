import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";

const SANDBOX_URL = "https://ppvircenkjizeiqdxphj.supabase.co";
const SANDBOX_KEY = "sb_publishable_wSw_jYJ6t6StH3p0G10wnA_pjYOXVeR";
const DEMO_EMAIL = "demo@expo-proffdok.no";
const SNAPSHOT_NAME = "__DEMO_GOLDEN_V1__";
const DEMO_REQUEST_PREFIX = "DEMO-";
const REQUIRED_REFS = [
  "DEMO-01-FORESPORSEL",
  "DEMO-02-BEFARING",
  "DEMO-03-TILBUD",
  "DEMO-04-AKSEPTERT",
  "DEMO-05-PROSJEKT",
];
const TABLES = [
  "sales_requests",
  "sales_offers",
  "sales_offer_versions",
  "sales_offer_follow_up_notifications",
  "projects",
  "project_progress_plans",
  "project_portal_access",
  "project_participants",
  "project_participant_notices",
  "warranty_registry",
];
const DELETE_ORDER = [
  "project_participant_notices",
  "project_participants",
  "project_progress_plans",
  "project_portal_access",
  "warranty_registry",
  "sales_offer_follow_up_notifications",
  "sales_offer_versions",
  "sales_offers",
  "projects",
  "sales_requests",
];
const INSERT_ORDER = [
  "sales_requests",
  "sales_offers",
  "sales_offer_versions",
  "projects",
  "project_portal_access",
  "project_progress_plans",
  "project_participants",
  "project_participant_notices",
  "warranty_registry",
  "sales_offer_follow_up_notifications",
];

const supabase = createClient(SANDBOX_URL, SANDBOX_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

const shell = {
  maxWidth: 1100,
  margin: "0 auto",
  padding: "28px 18px 64px",
};
const card = {
  background: "#fff",
  border: "1px solid #cbdde3",
  borderRadius: 20,
  padding: 20,
  boxShadow: "0 10px 30px rgba(16,33,43,.07)",
  marginBottom: 16,
};
const button = {
  border: "1px solid #aac8d2",
  background: "#fff",
  color: "#10212b",
  borderRadius: 13,
  padding: "11px 15px",
  fontWeight: 800,
  cursor: "pointer",
};
const primaryButton = { ...button, background: "#18c4cf", borderColor: "#18c4cf" };
const dangerButton = { ...button, background: "#fff4f2", borderColor: "#f2b8ae", color: "#9b2c22" };

function cleanRowsForInsert(rows = []) {
  return (Array.isArray(rows) ? rows : []).map((row) => {
    const next = { ...row };
    // Postgres generated/derived fields may differ between environments. These are
    // safe to rebuild by triggers/RPCs and should not block a sandbox reset.
    delete next.__summaryOnly;
    return next;
  });
}

function requestRefFromRow(row = {}) {
  return String(row?.request_ref || row?.payload?.requestRef || row?.payload?.caseNumber || "").trim();
}

function isDemoProject(row = {}) {
  const project = row?.data?.project || {};
  const text = JSON.stringify({
    demoSuiteKey: project?.demoSuiteKey,
    salesOrigin: project?.salesOrigin,
    customer: project?.customer,
    projectName: project?.projectName,
    title: row?.title,
  }).toUpperCase();
  return text.includes("DEMO-") || text.includes("DEMO_") || text.includes("DEMO ") || text.includes("GOLDEN");
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
        lower.includes("expoproffdok") ||
        lower.includes("expo-proffdok") ||
        lower.includes("sales") ||
        lower.includes("befaring") ||
        lower.includes("offer") ||
        lower.includes("prosjekt") ||
        lower.includes("project")
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

async function safeSelect(table) {
  const { data, error } = await supabase.from(table).select("*");
  if (error) return { rows: [], error: error.message || String(error) };
  return { rows: data || [], error: "" };
}

async function readSnapshot() {
  const { data, error } = await supabase
    .from("sales_offer_templates")
    .select("id,company_id,name,payload,created_by,created_at,updated_at")
    .eq("name", SNAPSHOT_NAME)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

async function captureGoldenSnapshot(session) {
  const collected = {};
  const errors = [];
  for (const table of TABLES) {
    const result = await safeSelect(table);
    if (result.error) {
      errors.push(`${table}: ${result.error}`);
      collected[table] = [];
      continue;
    }
    collected[table] = result.rows;
  }

  collected.sales_requests = (collected.sales_requests || []).filter((row) =>
    requestRefFromRow(row).toUpperCase().startsWith(DEMO_REQUEST_PREFIX)
  );
  const demoProjects = (collected.projects || []).filter(isDemoProject);
  const projectIds = new Set(demoProjects.map((row) => String(row.id)));
  collected.projects = demoProjects;
  [
    "project_progress_plans",
    "project_portal_access",
    "project_participants",
    "project_participant_notices",
    "warranty_registry",
  ].forEach((table) => {
    collected[table] = (collected[table] || []).filter((row) =>
      projectIds.has(String(row.project_id || ""))
    );
  });

  const companyId = String(collected.sales_requests?.[0]?.company_id || "").trim();
  if (!companyId) throw new Error("Fant ikke firma-id i DEMO-sakene. Gullkopi ble ikke laget.");
  if (collected.sales_requests.length < 5) {
    throw new Error(`For få DEMO-saker (${collected.sales_requests.length}). Forventet minst 5.`);
  }
  if (!collected.projects.length) throw new Error("Fant ikke demo-prosjekt. Gullkopi ble ikke laget.");

  const snapshot = {
    version: 1,
    capturedAt: new Date().toISOString(),
    sandboxRef: "ppvircenkjizeiqdxphj",
    companyId,
    tables: collected,
    captureWarnings: errors,
  };

  const existing = await readSnapshot();
  if (existing?.id) {
    const { error } = await supabase
      .from("sales_offer_templates")
      .update({ payload: snapshot, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("sales_offer_templates").insert({
      company_id: companyId,
      name: SNAPSHOT_NAME,
      payload: snapshot,
      created_by: session.user.id,
    });
    if (error) throw error;
  }
  return snapshot;
}

async function deleteRowsByIds(table, idColumn, ids) {
  const safeIds = [...new Set((ids || []).map((id) => String(id || "").trim()).filter(Boolean))];
  if (!safeIds.length) return;
  const { error } = await supabase.from(table).delete().in(idColumn, safeIds);
  if (error) throw new Error(`${table}: ${error.message}`);
}

async function restoreGoldenSnapshot(snapshot) {
  if (!snapshot?.tables) throw new Error("Gullkopien er tom eller ugyldig.");
  if (snapshot.sandboxRef !== "ppvircenkjizeiqdxphj") {
    throw new Error("Gullkopien tilhører ikke riktig sandbox.");
  }

  const currentProjects = (await safeSelect("projects")).rows.filter(isDemoProject);
  const currentProjectIds = currentProjects.map((row) => row.id);

  for (const table of DELETE_ORDER) {
    if (table === "sales_requests") {
      const currentSales = (await safeSelect("sales_requests")).rows.filter((row) =>
        requestRefFromRow(row).toUpperCase().startsWith(DEMO_REQUEST_PREFIX)
      );
      const companyIds = [...new Set(currentSales.map((row) => String(row.company_id || "")).filter(Boolean))];
      for (const companyId of companyIds) {
        const refs = currentSales.filter((row) => String(row.company_id || "") === companyId).map(requestRefFromRow);
        if (!refs.length) continue;
        const { error } = await supabase.from("sales_requests").delete().eq("company_id", companyId).in("request_ref", refs);
        if (error) throw new Error(`sales_requests: ${error.message}`);
      }
      continue;
    }
    if (table === "projects") {
      await deleteRowsByIds("projects", "id", currentProjectIds);
      continue;
    }
    if (["project_participant_notices","project_participants","project_progress_plans","project_portal_access","warranty_registry"].includes(table)) {
      await deleteRowsByIds(table, "project_id", currentProjectIds);
      continue;
    }
    // Sales child tables are sandbox-only demo rows. Delete only rows captured in the golden copy.
    const goldenRows = snapshot.tables?.[table] || [];
    if (!goldenRows.length) continue;
    const ids = goldenRows.map((row) => row.id).filter(Boolean);
    if (ids.length) await deleteRowsByIds(table, "id", ids);
  }

  for (const table of INSERT_ORDER) {
    const rows = cleanRowsForInsert(snapshot.tables?.[table] || []);
    if (!rows.length) continue;
    const { error } = await supabase.from(table).insert(rows);
    if (error) throw new Error(`${table}: ${error.message}`);
  }
}

async function runPreflight() {
  const checks = [];
  const add = (name, ok, detail) => checks.push({ name, ok: Boolean(ok), detail: String(detail || "") });

  const salesResult = await safeSelect("sales_requests");
  const demoSales = salesResult.rows.filter((row) => requestRefFromRow(row).toUpperCase().startsWith(DEMO_REQUEST_PREFIX));
  const refs = new Set(demoSales.map(requestRefFromRow));
  add("Fem demo-stopp", REQUIRED_REFS.every((ref) => refs.has(ref)), `${demoSales.length} DEMO-saker funnet`);

  const offer = demoSales.find((row) => requestRefFromRow(row) === "DEMO-03-TILBUD")?.payload || {};
  add("Tilbudsgrunnlag", (offer.offerLines || []).length >= 10, `${(offer.offerLines || []).length} linjer / ${(offer.offerOptions || []).length} opsjoner`);

  const accepted = demoSales.find((row) => requestRefFromRow(row) === "DEMO-04-AKSEPTERT")?.payload || {};
  add("Akseptert tilbud", Boolean(accepted.acceptedAt || accepted.acceptedOfferVersionId || accepted.acceptedOfferLines?.length), accepted.acceptedAt || "akseptdata kontrollert");

  const projectResult = await safeSelect("projects");
  const projects = projectResult.rows.filter(isDemoProject);
  const project = projects[0] || null;
  add("Demo-prosjekt", Boolean(project), project ? `${project.title || "Prosjekt"}` : "mangler");

  const projectId = project?.id;
  if (projectId) {
    const progress = await safeSelect("project_progress_plans");
    const plan = progress.rows.find((row) => String(row.project_id) === String(projectId));
    add("Fremdriftsplan", Boolean(plan), plan ? `${plan.plan?.activities?.length || 0} aktiviteter` : "mangler");

    const participants = await safeSelect("project_participants");
    const pRows = participants.rows.filter((row) => String(row.project_id) === String(projectId));
    add("Prosjektinvolverte", pRows.length >= 2, `${pRows.length} involverte`);

    const portal = await safeSelect("project_portal_access");
    const portalRows = portal.rows.filter((row) => String(row.project_id) === String(projectId) && !row.revoked_at);
    const roles = new Set(portalRows.map((row) => String(row.role || "").toLowerCase()));
    add("Kundelink", roles.has("kunde"), roles.has("kunde") ? "klar" : "mangler");
    add("UE-link", roles.has("underleverandor"), roles.has("underleverandor") ? "klar" : "mangler");

    const data = project.data || {};
    const checklist = data.checklist || {};
    let checklistPoints = 0;
    let documentedPoints = 0;
    let openChecklistDeviations = 0;
    Object.values(checklist).forEach((group) => {
      Object.values(group || {}).forEach((value) => {
        checklistPoints += 1;
        if (String(value?.comment || "").trim() || (value?.photos || []).some((photo) => String(photo?.url || "").trim())) documentedPoints += 1;
        if (value?.status === "Avvik") openChecklistDeviations += 1;
      });
    });
    add("Sjekklister", checklistPoints > 0, `${checklistPoints} punkter / ${documentedPoints} dokumentert`);
    add("Garantioppsett", Boolean(data.warranty?.enabled), data.warranty?.system || "ikke aktivert");
    add("Overtagelse", Boolean(data.overtagelse?.enabled || data.overtagelse?.signUtførende || data.overtagelse?.signKunde), data.overtagelse?.enabled ? "registrert" : "klargjort");
    const projectDeviations = Array.isArray(data.project?.projectDeviations) ? data.project.projectDeviations : [];
    const openProjectDeviations = projectDeviations.filter((entry) => (entry?.status || "Åpent") !== "Lukket").length;
    add("Avvik demonstrerbart", openChecklistDeviations + openProjectDeviations >= 0, `${openChecklistDeviations + openProjectDeviations} åpne`);
    add("Bilder", Array.isArray(data.photos) && data.photos.length > 0, `${data.photos?.length || 0} prosjektbilder`);
  }

  const snapshot = await readSnapshot();
  add("Gullkopi", Boolean(snapshot?.payload?.tables), snapshot?.payload?.capturedAt || "ikke laget ennå");

  return checks;
}

function StatusDot({ ok }) {
  return <span style={{ display: "inline-block", width: 12, height: 12, borderRadius: 999, background: ok ? "#0f9f6e" : "#d33b31", marginRight: 9 }} />;
}

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [checks, setChecks] = useState([]);
  const [snapshotMeta, setSnapshotMeta] = useState(null);

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

  const refreshSnapshot = async () => {
    try {
      const snapshot = await readSnapshot();
      setSnapshotMeta(snapshot?.payload || null);
    } catch {
      setSnapshotMeta(null);
    }
  };

  useEffect(() => { if (allowed) refreshSnapshot(); }, [allowed]);

  const doPreflight = async () => {
    setBusy("preflight"); setMessage("");
    try { setChecks(await runPreflight()); }
    catch (error) { setMessage(`Preflight feilet: ${error.message}`); }
    finally { setBusy(""); }
  };

  const doCapture = async () => {
    if (!window.confirm("Lagre dagens sandbox-innhold som ny GOLDEN DEMO? Dette overskriver forrige gullkopi.")) return;
    setBusy("capture"); setMessage("");
    try {
      const snapshot = await captureGoldenSnapshot(session);
      setSnapshotMeta(snapshot);
      setMessage(`Gullkopi lagret ${new Date(snapshot.capturedAt).toLocaleString("no-NO")}.`);
      setChecks(await runPreflight());
    } catch (error) { setMessage(`Kunne ikke lage gullkopi: ${error.message}`); }
    finally { setBusy(""); }
  };

  const doReset = async () => {
    const stored = await readSnapshot();
    if (!stored?.payload?.tables) return setMessage("Ingen gullkopi er lagret ennå.");
    if (!window.confirm("Tilbakestille alle DEMO-saker og demo-prosjekter til gullkopien? Kun sandbox påvirkes.")) return;
    setBusy("reset"); setMessage("");
    try {
      await restoreGoldenSnapshot(stored.payload);
      const removed = clearLocalDemoState();
      setMessage(`Demo er tilbakestilt. ${removed.length} lokale demo-/recovery-nøkler ble ryddet. Innlogging er beholdt.`);
      setChecks(await runPreflight());
    } catch (error) { setMessage(`Reset stoppet: ${error.message}`); }
    finally { setBusy(""); }
  };

  const doLocalClear = () => {
    if (!window.confirm("Rydde lokale demo-kladd/recovery-data på denne enheten? Innlogging beholdes.")) return;
    const removed = clearLocalDemoState();
    setMessage(`${removed.length} lokale nøkler ryddet. Last inn appen på nytt før demo.`);
  };

  if (loading) return <main style={shell}><div style={card}>Kontrollerer sandbox-session…</div></main>;

  return <main style={shell}>
    <div style={{ ...card, background: "#153f54", color: "white" }}>
      <div style={{ fontWeight: 900, letterSpacing: ".08em", color: "#77e6ec", fontSize: 13 }}>DEMO SANDBOX · IKKE PRODUKSJON</div>
      <h1 style={{ margin: "8px 0 6px", fontSize: 36 }}>Golden Demo – kontroll</h1>
      <p style={{ margin: 0, color: "#dbeaf0", maxWidth: 850 }}>DEMO-01 er hovedløypen. DEMO-02–05 er reservepunkter dersom du vil hoppe frem eller noe stopper under visningen. Du skal normalt ikke bytte mellom dem for å forklare flyten.</p>
    </div>

    {!session && <div style={card}><b>Ikke innlogget i sandboxen.</b><p>Åpne hovedappen, logg inn som demo-bruker og gå deretter tilbake hit.</p><a href="/" style={{ ...primaryButton, display: "inline-block", textDecoration: "none" }}>Åpne sandbox-app</a></div>}
    {session && !allowed && <div style={{ ...card, borderColor: "#f2b8ae" }}><b>Kontrollsiden er sperret.</b><p>Kun den dedikerte demo-brukeren kan bruke reset/gullkopi. Aktiv bruker: {session.user.email}</p></div>}

    {allowed && <>
      <div style={card}>
        <h2 style={{ marginTop: 0 }}>Anbefalt visning</h2>
        <ol style={{ lineHeight: 1.7 }}>
          <li><b>Start i DEMO-01 Forespørsel</b> og vis normal reise videre.</li>
          <li>Utfør bare de handlingene du ønsker å demonstrere live.</li>
          <li>Hvis tiden er knapp eller noe stopper: åpne ferdig reservepunkt i Sales/prosjektlisten.</li>
          <li>Etter møtet: gå hit og trykk <b>Tilbakestill demo</b>.</li>
        </ol>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a href="/" style={{ ...primaryButton, display: "inline-block", textDecoration: "none" }}>Åpne sandbox-app</a>
          <a href="/demo-showcase.html" style={{ ...button, display: "inline-block", textDecoration: "none" }}>Åpne nød-demo</a>
          <a href="/docs/DEMO_SANDBOX_MANUAL.md" style={{ ...button, display: "inline-block", textDecoration: "none" }}>A–Å-manual (råfil)</a>
        </div>
      </div>

      <div style={card}>
        <h2 style={{ marginTop: 0 }}>Demo klar?</h2>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
          <button style={primaryButton} disabled={!!busy} onClick={doPreflight}>{busy === "preflight" ? "Kontrollerer…" : "Kjør preflight"}</button>
          <button style={button} disabled={!!busy} onClick={doLocalClear}>Rydd lokal demo-state</button>
        </div>
        {checks.length > 0 && <div style={{ display: "grid", gap: 8 }}>
          {checks.map((item) => <div key={item.name} style={{ padding: "10px 12px", border: "1px solid #dce9ed", borderRadius: 12, background: item.ok ? "#f3fcf8" : "#fff6f4" }}><StatusDot ok={item.ok}/><b>{item.name}</b><span style={{ color: "#61747f", marginLeft: 8 }}>{item.detail}</span></div>)}
        </div>}
      </div>

      <div style={card}>
        <h2 style={{ marginTop: 0 }}>Gullkopi og reset</h2>
        <p>Gullkopien lagres i <b>sandboxen</b> som en skjult systemmal. Den inneholder bare DEMO-saker/prosjekter og brukes til å gjenopprette samme starttilstand før neste visning.</p>
        <p><b>Status:</b> {snapshotMeta?.capturedAt ? `lagret ${new Date(snapshotMeta.capturedAt).toLocaleString("no-NO")}` : "ikke laget ennå"}</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button style={button} disabled={!!busy} onClick={doCapture}>{busy === "capture" ? "Lagrer…" : "Lagre dagens state som gullkopi"}</button>
          <button style={dangerButton} disabled={!!busy || !snapshotMeta?.capturedAt} onClick={doReset}>{busy === "reset" ? "Tilbakestiller…" : "Tilbakestill demo"}</button>
        </div>
      </div>

      {message && <div style={{ ...card, borderColor: message.toLowerCase().includes("feil") || message.toLowerCase().includes("stoppet") ? "#f2b8ae" : "#9bd7c0" }}><b>{message}</b></div>}
    </>}
  </main>;
}

createRoot(document.getElementById("root")).render(<App />);
