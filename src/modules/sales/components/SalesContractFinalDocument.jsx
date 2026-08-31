// Expo ProffDok – FASE 33B.5
// Ferdigstiller signert Expo-kontrakt som privat PDF. Operasjonen er idempotent:
// eksisterende final_document gjenbrukes, og eventuell prosjektsynk kan kjøres igjen.

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Download, ExternalLink, FileText, RefreshCw } from "lucide-react";
import {
  ensureFinalSalesContractDocument,
  openFinalSalesContractDocument,
} from "../services/salesContracts.js";

export default function SalesContractFinalDocument({
  client,
  contract,
  onUpdated,
  compact = false,
}) {
  const attemptedKeyRef = useRef("");
  const [busy, setBusy] = useState(false);
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState("");
  const [syncMessage, setSyncMessage] = useState("");

  async function finalize({ force = false } = {}) {
    if (!client || !contract?.id || contract?.status !== "signed") return;
    const key = `${contract.id}:${contract.final_document?.path || "pending"}`;
    if (!force && attemptedKeyRef.current === key) return;
    attemptedKeyRef.current = key;

    setBusy(true);
    setError("");
    setSyncMessage("");
    try {
      const result = await ensureFinalSalesContractDocument(client, contract);
      const updatedContract = result?.contract || contract;
      if (result?.finalDocument && updatedContract.final_document !== result.finalDocument) {
        updatedContract.final_document = result.finalDocument;
      }
      onUpdated?.(updatedContract);

      const updatedProjects = Number(result?.syncResult?.updated_projects || 0);
      if (result?.syncError) {
        setSyncMessage(
          "PDF-en er arkivert, men overføring til et allerede aktivert prosjekt må prøves igjen."
        );
      } else if (updatedProjects > 0) {
        setSyncMessage(
          `PDF-en er også lagt i Tilbud / kontrakt på ${updatedProjects} aktivert prosjekt${updatedProjects === 1 ? "" : "er"}.`
        );
      } else {
        setSyncMessage(
          "PDF-en følger automatisk med til Tilbud / kontrakt når saken aktiveres som prosjekt."
        );
      }
    } catch (finalizeError) {
      attemptedKeyRef.current = "";
      setError(
        finalizeError instanceof Error
          ? finalizeError.message
          : "Den signerte kontrakten kunne ikke ferdigstilles som PDF."
      );
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (contract?.status === "signed") finalize();
  }, [contract?.id, contract?.status, contract?.final_document?.path]);

  async function openDocument(download = false) {
    if (!contract?.final_document || opening) return;
    setOpening(true);
    setError("");
    try {
      await openFinalSalesContractDocument(client, contract.final_document, { download });
    } catch (openError) {
      setError(
        openError instanceof Error
          ? openError.message
          : "Kontrakts-PDF-en kunne ikke åpnes."
      );
    } finally {
      setOpening(false);
    }
  }

  if (contract?.status !== "signed") return null;

  const finalDocument = contract.final_document;

  return (
    <section
      style={{
        maxWidth: compact ? "none" : 860,
        width: "100%",
        boxSizing: "border-box",
        margin: compact ? 0 : "0 auto",
        padding: compact ? 13 : 17,
        borderRadius: 14,
        border: "1px solid #b9dfc8",
        background: "#f1fbf5",
        display: "grid",
        gap: 11,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          color: "#176b42",
          fontWeight: 900,
        }}
      >
        {finalDocument ? <CheckCircle2 size={19} /> : <FileText size={19} />}
        {finalDocument
          ? "Endelig signert kontrakt er arkivert"
          : busy
            ? "Oppretter endelig kontrakt-PDF …"
            : "Endelig kontrakt-PDF klargjøres"}
      </div>

      {finalDocument ? (
        <>
          <span style={{ color: "#335d49", lineHeight: 1.45 }}>
            {finalDocument.name || "Signert kontrakt.pdf"}
            {Number(finalDocument.pageCount || 0) > 0
              ? ` · ${finalDocument.pageCount} sider`
              : ""}
          </span>
          <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
            <button
              className="sales-secondary-button"
              type="button"
              onClick={() => openDocument(false)}
              disabled={opening}
            >
              <ExternalLink size={17} /> Åpne signert PDF
            </button>
            <button
              className="sales-secondary-button"
              type="button"
              onClick={() => openDocument(true)}
              disabled={opening}
            >
              <Download size={17} /> Last ned PDF
            </button>
          </div>
        </>
      ) : null}

      {syncMessage ? (
        <span style={{ color: "#52616b", lineHeight: 1.45 }}>{syncMessage}</span>
      ) : null}

      {error ? (
        <div style={{ display: "grid", gap: 9 }}>
          <div role="alert" style={{ color: "#9b1c1c", fontWeight: 700 }}>
            {error}
          </div>
          <button
            className="sales-secondary-button"
            type="button"
            onClick={() => finalize({ force: true })}
            disabled={busy}
            style={{ justifySelf: "start" }}
          >
            <RefreshCw size={17} /> Prøv ferdigstilling på nytt
          </button>
        </div>
      ) : null}
    </section>
  );
}
