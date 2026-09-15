// Expo ProffDok – FASE 42L
// Systemadmin-only hurtigvalg på Startsiden. Demosuiten opprettes/resettes i Systemadmin,
// mens visningen åpnes herfra gjennom den eksisterende native Sales-/prosjektflyten.

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DEMO_REQUEST_REFS } from "./demoCaseSafety.js";
import { getDemoSuiteStatus } from "./demoSuiteClient.js";
import { openDemoProject, openDemoSalesStage } from "./demoStageNavigation.js";
import { WORK_PROFILE_EVENT } from "../access/workProfileClient.js";

const STAGES = [
  { key: "request", label: "Forespørsel", ref: DEMO_REQUEST_REFS.request },
  { key: "survey", label: "Befaring", ref: DEMO_REQUEST_REFS.survey },
  { key: "offer", label: "Tilbud", ref: DEMO_REQUEST_REFS.offer },
  { key: "accepted", label: "Akseptert", ref: DEMO_REQUEST_REFS.accepted },
  { key: "project", label: "Prosjekt", ref: DEMO_REQUEST_REFS.project },
];

export function DemoHomeLauncher() {
  const [status, setStatus] = useState(null);
  const [hidden, setHidden] = useState(false);
  const [error, setError] = useState("");
  const refreshInFlightRef = useRef(false);
  const statusRef = useRef(null);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const refresh = useCallback(async ({ companySwitch = false } = {}) => {
    if (refreshInFlightRef.current) return;
    refreshInFlightRef.current = true;
    if (companySwitch) {
      statusRef.current = null;
      setStatus(null);
    }
    setError("");

    try {
      const nextStatus = await getDemoSuiteStatus();
      statusRef.current = nextStatus;
      setStatus(nextStatus);
      setHidden(false);
    } catch (loadError) {
      // Vanlige brukere skal aldri se Demo/Test på Startsiden. Ved nettfeil skjules
      // hurtigvalget også fremfor å vise en ustabil eller feil firmatilstand.
      statusRef.current = null;
      setStatus(null);
      setHidden(true);
      if (String(loadError?.message || "").toLowerCase().includes("systemadmin")) return;
      setError(loadError?.message || "Demo/Test kunne ikke lastes.");
    } finally {
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
      void refresh({ companySwitch: true });
    };

    window.addEventListener(WORK_PROFILE_EVENT, onWorkProfile);
    return () => window.removeEventListener(WORK_PROFILE_EVENT, onWorkProfile);
  }, [refresh]);

  const stages = useMemo(() => {
    const map = new Map((status?.stages || []).map((stage) => [stage.requestRef, stage]));
    return STAGES.map((stage) => ({ ...stage, current: map.get(stage.ref) || null }));
  }, [status]);

  if (hidden || !status?.ready) return null;

  const openStage = (stage) => {
    setError("");
    if (stage.key === "project") {
      const projectId = stage.current?.projectId;
      if (!openDemoProject(projectId)) setError("Demo-prosjektet kunne ikke åpnes.");
      return;
    }

    if (!openDemoSalesStage(stage.ref)) {
      setError("Befaring/Tilbud kunne ikke åpnes fra Startsiden.");
    }
  };

  return (
    <div
      className="item"
      data-demo-home-launcher
      style={{
        marginTop: 12,
        marginBottom: 12,
        border: "1px solid #9bdfe4",
        background: "#f2fcfd",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <b style={{ fontSize: 18 }}>Demo/Test</b>
          <p className="note" style={{ margin: "4px 0 0" }}>
            {status.companyName}: åpne et ferdig klargjort steg direkte.
          </p>
        </div>
        <span style={{ fontWeight: 800, color: "#087f88" }}>Kun systemadmin</span>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
        {stages.map((stage) => (
          <button
            key={stage.ref}
            type="button"
            className={stage.key === "request" ? "" : "secondary"}
            onClick={() => openStage(stage)}
            disabled={!stage.current || (stage.key === "project" && !stage.current?.projectId)}
          >
            {stage.label}
          </button>
        ))}
      </div>

      {error ? (
        <p style={{ color: "#991b1b", fontWeight: 800, margin: "10px 0 0" }}>{error}</p>
      ) : null}
    </div>
  );
}

export default DemoHomeLauncher;
