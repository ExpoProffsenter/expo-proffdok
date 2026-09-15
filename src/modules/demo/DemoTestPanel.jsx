// Expo ProffDok – FASE 42L
// Systemadmin-panel for oppretting/reset av en resetbar demosuite som følger aktiv arbeidsprofil.
// Selve demovisningen åpnes fra Demo/Test-hurtigvalget på Startsiden.

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DEMO_REQUEST_REFS } from "./demoCaseSafety.js";
import { getDemoSuiteStatus, resetDemoSuite } from "./demoSuiteClient.js";
import { WORK_PROFILE_EVENT } from "../access/workProfileClient.js";

const STAGES = [
  { key: "request", label: "1. Forespørsel", ref: DEMO_REQUEST_REFS.request },
  { key: "survey", label: "2. Befaring", ref: DEMO_REQUEST_REFS.survey },
  { key: "offer", label: "3. Tilbud", ref: DEMO_REQUEST_REFS.offer },
  { key: "accepted", label: "4. Akseptert – klar for prosjekt", ref: DEMO_REQUEST_REFS.accepted },
  { key: "project", label: "5. Prosjekt", ref: DEMO_REQUEST_REFS.project },
];

export function DemoTestPanel() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const refreshInFlightRef = useRef(false);
  const statusRef = useRef(null);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const refresh = useCallback(async ({ background = false } = {}) => {
    if (refreshInFlightRef.current) return;
    refreshInFlightRef.current = true;

    if (!background || !statusRef.current) setLoading(true);
    setError("");
    try {
      const nextStatus = await getDemoSuiteStatus();
      statusRef.current = nextStatus;
      setStatus(nextStatus);
    } catch (loadError) {
      if (!background || !statusRef.current) setStatus(null);
      setError(loadError?.message || "Kunne ikke lese Demo/Test-status.");
    } finally {
      setLoading(false);
      refreshInFlightRef.current = false;
    }
  }, []);

  useEffect(() => {
    void refresh();

    const onWorkProfile = (event) => {
      if (refreshInFlightRef.current) return;

      const nextCompanyId = String(event?.detail?.active_company_id || "").trim();
      const currentCompanyId = String(statusRef.current?.companyId || "").trim();
      if (nextCompanyId && nextCompanyId === currentCompanyId) return;

      void refresh({ background: true });
    };

    window.addEventListener(WORK_PROFILE_EVENT, onWorkProfile);
    return () => window.removeEventListener(WORK_PROFILE_EVENT, onWorkProfile);
  }, [refresh]);

  const stageState = useMemo(() => {
    const map = new Map((status?.stages || []).map((item) => [item.requestRef, item]));
    return STAGES.map((stage) => ({ ...stage, current: map.get(stage.ref) || null }));
  }, [status]);

  const reset = async () => {
    if (resetting) return;
    const companyName = status?.companyName || "firmaet du representerer";
    const creating = !status?.ready;
    const title = creating
      ? `Opprette Demo/Test for ${companyName}?`
      : `Tilbakestille Demo/Test for ${companyName}?`;
    const explanation = creating
      ? "Det opprettes fem tydelig merkede demosaker og ett demo-prosjekt. Ekte saker og prosjekter berøres ikke."
      : "Kun de fem servermerkede DEMO42L-sakene og demo-prosjekter som er knyttet til disse resettes. Ekte saker og prosjekter skal ikke berøres.";
    const confirmed = window.confirm(`${title}\n\n${explanation}`);
    if (!confirmed) return;

    setResetting(true);
    setMessage("");
    setError("");
    try {
      const result = await resetDemoSuite();
      setMessage(
        creating
          ? `Demo/Test er opprettet og klar for ${result.companyName}. Åpne Startsiden for å velge demosteg.`
          : `Demo/Test er tilbakestilt og klar for ${result.companyName}. Åpne Startsiden for å velge demosteg.`
      );
      await refresh({ background: true });
    } catch (resetError) {
      setError(
        resetError?.message ||
          (creating ? "Kunne ikke opprette Demo/Test." : "Kunne ikke tilbakestille Demo/Test.")
      );
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="item adminAccordionItem" style={{ marginTop: 16 }} data-demo-test-panel>
      <h3 style={{ marginTop: 0 }}>Demo/Test</h3>
      <p className="note" style={{ marginBottom: 10 }}>
        Opprett eller tilbakestill demosuiten her. Når den er klar, åpner du de fem demostegene
        direkte fra Demo/Test-hurtigvalget på Startsiden.
      </p>

      <div
        style={{
          padding: "10px 12px",
          border: "1px solid #cbd5e1",
          borderRadius: 10,
          background: "#f8fafc",
          marginBottom: 12,
        }}
      >
        <b>{loading && !status ? "Leser valgt firma …" : status?.companyName || "Firma ikke valgt"}</b>
        <div style={{ fontSize: 13, color: "#64748b", marginTop: 3 }}>
          {status?.ready
            ? "Demosuiten er klar. Bruk Startsiden til selve visningen, og kom tilbake hit når den skal tilbakestilles."
            : "Opprett demosakene én gang før visningen."}
        </div>
      </div>

      <div style={{ display: "grid", gap: 7, marginBottom: 12 }}>
        {stageState.map((stage) => (
          <div
            key={stage.ref}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              padding: "8px 10px",
              border: "1px solid #e2e8f0",
              borderRadius: 9,
              background: "#fff",
            }}
          >
            <span>
              <b>{stage.label}</b>
              <small style={{ display: "block", color: "#64748b", marginTop: 2 }}>
                {stage.current?.status || "Ikke opprettet"}
              </small>
            </span>
            <span style={{ fontWeight: 800, color: stage.current ? "#087f88" : "#94a3b8" }}>
              {stage.current ? "Klar" : "–"}
            </span>
          </div>
        ))}
      </div>

      {message ? (
        <p style={{ color: "#087f88", fontWeight: 800, margin: "8px 0" }}>{message}</p>
      ) : null}
      {error ? (
        <p style={{ color: "#991b1b", fontWeight: 800, margin: "8px 0" }}>{error}</p>
      ) : null}

      <button type="button" onClick={reset} disabled={loading || resetting || !status?.companyId}>
        {resetting
          ? status?.ready
            ? "Tilbakestiller Demo/Test …"
            : "Oppretter Demo/Test …"
          : status?.ready
            ? "Tilbakestill demosaker"
            : "Opprett demosaker"}
      </button>
    </div>
  );
}
