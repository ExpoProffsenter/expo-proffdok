// Expo ProffDok – FASE 42L
// Systemadmin-panel for en resetbar demosuite som følger aktiv arbeidsprofil.
// Panelet lytter på den etablerte arbeidsprofilen, men har en eksplisitt in-flight
// sperre slik at egen statuslesing aldri kan starte en WORK_PROFILE_EVENT-loop.

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

function compact(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function clickNativeSalesButton() {
  const buttons = Array.from(document.querySelectorAll("button"));
  const target = buttons.find((button) => {
    const text = compact(button.textContent);
    return text === "Befaring/Tilbud" || text === "Befaring / Våtromstilbud";
  });
  target?.click?.();
  return Boolean(target);
}

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
      // Ved bakgrunnsrefresh beholder vi siste kjente, gyldige firmastatus i UI.
      // Et kort nettverksavbrudd eller remount skal ikke flimre til «Firma ikke valgt».
      if (!background || !statusRef.current) setStatus(null);
      setError(loadError?.message || "Kunne ikke lese Demo/Test-status.");
    } finally {
      if (!background || !statusRef.current) setLoading(false);
      else setLoading(false);
      refreshInFlightRef.current = false;
    }
  }, []);

  useEffect(() => {
    void refresh();

    const onWorkProfile = (event) => {
      // getDemoSuiteStatus() leser den serverstyrte arbeidsprofilen. Den lesingen
      // publiserer samme WORK_PROFILE_EVENT. In-flight-sperren gjør at panelet
      // aldri reagerer rekursivt på sitt eget refresh-kall.
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
    const confirmed = window.confirm(
      `Tilbakestille Demo/Test for ${companyName}?\n\nKun de fem servermerkede DEMO42L-sakene og demo-prosjekter som er knyttet til disse resettes. Ekte saker og prosjekter skal ikke berøres.`
    );
    if (!confirmed) return;

    setResetting(true);
    setMessage("");
    setError("");
    try {
      const result = await resetDemoSuite();
      setMessage(
        `Demo/Test er klar for ${result.companyName}. Fem demosaker er satt tilbake til starttilstand.`
      );
      await refresh({ background: true });
    } catch (resetError) {
      setError(resetError?.message || "Kunne ikke tilbakestille Demo/Test.");
    } finally {
      setResetting(false);
    }
  };

  const openSales = () => {
    if (!clickNativeSalesButton()) {
      setError("Fant ikke Befaring/Tilbud-knappen. Gå til Startsiden og åpne Befaring/Tilbud derfra.");
    }
  };

  const openProject = () => {
    const projectStage = status?.stages?.find(
      (stage) => stage.requestRef === DEMO_REQUEST_REFS.project
    );
    if (!projectStage?.projectId) {
      setError("Demo-prosjektet finnes ikke ennå. Tilbakestill demosakene først.");
      return;
    }
    window.location.assign(
      `${window.location.pathname}?project=${encodeURIComponent(projectStage.projectId)}&access=admin&tab=prosjekt`
    );
  };

  return (
    <div className="item adminAccordionItem" style={{ marginTop: 16 }} data-demo-test-panel>
      <h3 style={{ marginTop: 0 }}>Demo/Test</h3>
      <p className="note" style={{ marginBottom: 10 }}>
        Fem tydelig merkede demosaker følger firmaet du har valgt under <b>Representerer</b>.
        De bruker den ordinære Sales- og prosjektflaten, men publisering og andre irreversible
        kundehandlinger sperres der det er nødvendig.
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
            ? "Demosuiten er klar. Du kan resettes tilbake til samme starttilstand så ofte du vil."
            : "Demosuiten er ikke komplett ennå. Opprett/tilbakestill den før demo."}
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
                {stage.current?.status || "Ikke opprettet"} · {stage.ref}
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

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <button type="button" onClick={reset} disabled={loading || resetting || !status?.companyId}>
          {resetting
            ? "Tilbakestiller Demo/Test …"
            : status?.ready
              ? "Tilbakestill demosaker"
              : "Opprett demosaker"}
        </button>
        <button type="button" className="secondary" onClick={openSales} disabled={resetting}>
          Åpne Befaring/Tilbud
        </button>
        <button type="button" className="secondary" onClick={openProject} disabled={resetting || !status?.ready}>
          Åpne demo-prosjekt
        </button>
      </div>

      <p className="note" style={{ marginTop: 12, marginBottom: 0 }}>
        Tips til visning: start i «DEMO – Ny forespørsel», hopp deretter til de ferdig klargjorte
        stegene. «DEMO – Akseptert» kan aktiveres som et ekte prosjekt; neste reset rydder bare
        prosjektet som er knyttet til den servermerkede demosaken.
      </p>
    </div>
  );
}
