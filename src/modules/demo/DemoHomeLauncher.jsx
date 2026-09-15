// Expo ProffDok – FASE 42L
// Kenneth-only hurtigvalg på Startsiden. Demosuiten opprettes/resettes i Systemadmin,
// mens visningen åpnes herfra gjennom eksisterende Sales-/prosjektflater.

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

const PROJECT_SHOWCASE = [
  { key: "progress", label: "Fremdrift", tab: "fremdrift" },
  { key: "report", label: "Rapport", tab: "rapport" },
  { key: "warranty", label: "Garanti", tab: "garanti" },
  { key: "chat", label: "Chat", tab: "chat" },
  { key: "access", label: "Kundelink", tab: "tilgang" },
];

export function DemoHomeLauncher() {
  const [status, setStatus] = useState(null);
  const [hidden, setHidden] = useState(false);
  const [error, setError] = useState("");
  const [openingStage, setOpeningStage] = useState("");
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
      statusRef.current = null;
      setStatus(null);
      setHidden(true);
      const message = String(loadError?.message || "");
      if (/demoansvarlig|systemadmin/i.test(message)) return;
      setError(message || "Demo/Test kunne ikke lastes.");
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
      setOpeningStage("");
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

  const projectStage = stages.find((stage) => stage.key === "project");
  const projectId = projectStage?.current?.projectId || "";

  const openStage = async (stage) => {
    if (openingStage) return;
    setError("");
    if (stage.key === "project") {
      if (!openDemoProject(stage.current?.projectId, "prosjekt")) {
        setError("Demo-prosjektet kunne ikke åpnes.");
      }
      return;
    }

    setOpeningStage(stage.key);
    try {
      const opened = await openDemoSalesStage(stage.ref);
      if (!opened) {
        setError("Befaring/Tilbud kunne ikke åpnes fra Startsiden.");
      }
    } catch (openError) {
      setError(openError?.message || "Den komplette demosaken kunne ikke hentes fra serveren.");
    } finally {
      setOpeningStage("");
    }
  };

  const openProjectShowcase = (tab) => {
    setError("");
    if (!openDemoProject(projectId, tab)) {
      setError("Demo-prosjektet kunne ikke åpnes på valgt visning.");
    }
  };

  const openCustomerOfferPreview = () => {
    setError("");
    const previewWindow = window.open("/demo-offer-preview.html", "_blank");
    if (!previewWindow) {
      setError("Nettleseren blokkerte kundevisningen. Tillat popup/ny fane og prøv igjen.");
      return;
    }
    try {
      previewWindow.opener = null;
    } catch {
      // Best effort. Kundevisningen er uansett read-only og Kenneth-only.
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
            {status.companyName}: gjenbrukbar presentasjonsløype med ferdige stoppunkter.
          </p>
          {status.sourceTemplateName ? (
            <small className="note" style={{ display: "block", marginTop: 3 }}>
              Tilbudsgrunnlag: {status.sourceTemplateName}
            </small>
          ) : null}
        </div>
        <span style={{ fontWeight: 800, color: "#087f88" }}>Kun Kenneth</span>
      </div>

      <div style={{ marginTop: 12 }}>
        <b style={{ display: "block", marginBottom: 7 }}>Kundereise</b>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {stages.map((stage) => (
            <button
              key={stage.ref}
              type="button"
              className={stage.key === "request" ? "" : "secondary"}
              onClick={() => void openStage(stage)}
              disabled={
                Boolean(openingStage) ||
                !stage.current ||
                (stage.key === "project" && !stage.current?.projectId)
              }
            >
              {openingStage === stage.key ? "Åpner …" : stage.label}
            </button>
          ))}
          <button type="button" className="secondary" onClick={openCustomerOfferPreview}>
            Kundevisning tilbud
          </button>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <b style={{ display: "block", marginBottom: 7 }}>Prosjekt og dokumentasjon</b>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {PROJECT_SHOWCASE.map((item) => (
            <button
              key={item.key}
              type="button"
              className="secondary"
              onClick={() => openProjectShowcase(item.tab)}
              disabled={!projectId}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <p style={{ color: "#991b1b", fontWeight: 800, margin: "10px 0 0" }}>{error}</p>
      ) : null}
    </div>
  );
}

export default DemoHomeLauncher;
