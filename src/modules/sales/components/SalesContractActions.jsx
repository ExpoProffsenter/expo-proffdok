// Expo ProffDok – FASE 33B.5
// Fast kontraktflate på akseptert Sales-sak. Gjør kontrakt/kundelenke tilgjengelig
// uten å åpne veiviseren først, og ferdigstiller signert Expo-kontrakt idempotent.

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  FileSignature,
  FileText,
  LockKeyhole,
  RefreshCw,
} from "lucide-react";
import { createDefaultSalesSupabaseClient } from "../services/salesSupabase.js";
import {
  CONTRACT_CHANGED_EVENT,
  buildCustomerContractLink,
  ensureFinalSalesContractDocument,
  fetchActiveSalesContract,
  openFinalSalesContractDocument,
} from "../services/salesContracts.js";
import {
  getAcceptedSalesOfferId,
  getAcceptedSalesOfferVersionId,
} from "../utils/salesContractModel.js";

function statusText(contract = {}) {
  if (contract.status === "signed") return "Signert av begge parter";
  if (contract.status === "awaiting_customer") return "Venter på kundens signatur";
  if (contract.status === "draft") return "Kontraktsutkast lagret";
  return "Kontrakt opprettet";
}

export default function SalesContractActions({ request, onOpenWizard }) {
  const client = useMemo(() => createDefaultSalesSupabaseClient(), []);
  const offerId = getAcceptedSalesOfferId(request);
  const offerVersionId = getAcceptedSalesOfferVersionId(request);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(Boolean(offerId));
  const [finalizing, setFinalizing] = useState(false);
  const [openingPdf, setOpeningPdf] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const finalizedKeyRef = useRef("");

  async function loadContract() {
    if (!client || !offerId) {
      setLoading(false);
      setContract(null);
      return;
    }
    setLoading(true);
    try {
      const result = await fetchActiveSalesContract(client, { offerId, offerVersionId });
      if (result?.error) throw result.error;
      setContract(result?.data || null);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Kontraktsstatus kunne ikke lastes."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setError("");
    setMessage("");
    finalizedKeyRef.current = "";
    loadContract();
  }, [offerId, offerVersionId]);

  useEffect(() => {
    const handleChanged = () => loadContract();
    window.addEventListener(CONTRACT_CHANGED_EVENT, handleChanged);
    return () => window.removeEventListener(CONTRACT_CHANGED_EVENT, handleChanged);
  }, [offerId, offerVersionId]);

  async function finalizeContract({ force = false } = {}) {
    if (!contract?.id || contract.status !== "signed" || finalizing) return;
    const key = `${contract.id}:${contract.final_document?.path || "pending"}`;
    if (!force && finalizedKeyRef.current === key) return;
    finalizedKeyRef.current = key;

    setFinalizing(true);
    setError("");
    try {
      const result = await ensureFinalSalesContractDocument(client, contract);
      const nextContract = result?.contract || {
        ...contract,
        final_document: result?.finalDocument || contract.final_document,
      };
      setContract(nextContract);
      const updatedProjects = Number(result?.syncResult?.updated_projects || 0);
      if (result?.syncError) {
        setMessage(
          "Signert PDF er arkivert. Overføring til et allerede aktivert prosjekt kan prøves igjen."
        );
      } else if (updatedProjects > 0) {
        setMessage("Signert PDF er også lagt i prosjektets Tilbud / kontrakt.");
      } else if (result?.created) {
        setMessage("Signert PDF er arkivert og følger med ved prosjektaktivering.");
      }
    } catch (finalizeError) {
      finalizedKeyRef.current = "";
      setError(
        finalizeError instanceof Error
          ? finalizeError.message
          : "Signert kontrakt kunne ikke ferdigstilles som PDF."
      );
    } finally {
      setFinalizing(false);
    }
  }

  useEffect(() => {
    if (contract?.status === "signed") finalizeContract();
  }, [contract?.id, contract?.status, contract?.final_document?.path]);

  const customerLink = useMemo(() => {
    if (!contract?.customer_token || typeof window === "undefined") return "";
    return buildCustomerContractLink(window.location.href, {
      contractToken: contract.customer_token,
      offerToken: request?.publicToken || "",
    });
  }, [contract?.customer_token, request?.publicToken]);

  async function copyCustomerLink() {
    if (!customerLink) return;
    setError("");
    try {
      await navigator.clipboard.writeText(customerLink);
      setMessage("Kundelenken er kopiert.");
    } catch {
      setError("Kunne ikke kopiere kundelenken automatisk.");
    }
  }

  async function openPdf(download = false) {
    if (!contract?.final_document || openingPdf) return;
    setOpeningPdf(true);
    setError("");
    try {
      await openFinalSalesContractDocument(client, contract.final_document, { download });
    } catch (openError) {
      setError(
        openError instanceof Error
          ? openError.message
          : "Signert kontrakt-PDF kunne ikke åpnes."
      );
    } finally {
      setOpeningPdf(false);
    }
  }

  if (request?.status !== "Akseptert") return null;
  if (loading && !contract) {
    return (
      <div style={{ color: "#52616b", fontWeight: 700 }}>
        Henter kontraktsstatus …
      </div>
    );
  }

  if (!contract) {
    if (request?.contractFile) return null;
    return (
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <button className="sales-primary-button" type="button" onClick={onOpenWizard}>
          <FileSignature size={18} /> Opprett enkel kontrakt
        </button>
        <span style={{ color: "#42606b", fontWeight: 700 }}>
          Eller bruk «Last opp egen kontrakt» under.
        </span>
      </div>
    );
  }

  const signed = contract.status === "signed";
  const awaiting = contract.status === "awaiting_customer";

  return (
    <div
      style={{
        display: "grid",
        gap: 11,
        padding: 13,
        borderRadius: 12,
        border: signed ? "1px solid #b9dfc8" : "1px solid #b9e0e3",
        background: signed ? "#f1fbf5" : "#eefafb",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          color: signed ? "#176b42" : "#0b737b",
          fontWeight: 900,
        }}
      >
        {signed ? (
          <CheckCircle2 size={18} />
        ) : awaiting ? (
          <LockKeyhole size={18} />
        ) : (
          <FileSignature size={18} />
        )}
        {statusText(contract)}
      </div>

      <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
        <button className="sales-primary-button" type="button" onClick={onOpenWizard}>
          <FileSignature size={17} /> Åpne kontrakt
        </button>

        {customerLink ? (
          <>
            <button
              className="sales-secondary-button"
              type="button"
              onClick={() => window.open(customerLink, "_blank", "noopener,noreferrer")}
            >
              <ExternalLink size={17} /> Åpne kundelenke
            </button>
            <button className="sales-secondary-button" type="button" onClick={copyCustomerLink}>
              <Copy size={17} /> Kopier kundelenke
            </button>
          </>
        ) : null}

        {contract.final_document ? (
          <button
            className="sales-secondary-button"
            type="button"
            onClick={() => openPdf(false)}
            disabled={openingPdf}
          >
            <FileText size={17} /> Åpne signert PDF
          </button>
        ) : null}
      </div>

      {finalizing ? (
        <span style={{ color: "#52616b" }}>
          Oppretter og arkiverer endelig signert kontrakt-PDF …
        </span>
      ) : null}
      {message ? <span style={{ color: "#176b42", fontWeight: 750 }}>{message}</span> : null}
      {error ? (
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <span role="alert" style={{ color: "#9b1c1c", fontWeight: 700 }}>
            {error}
          </span>
          {signed ? (
            <button
              className="sales-secondary-button"
              type="button"
              onClick={() => finalizeContract({ force: true })}
              disabled={finalizing}
            >
              <RefreshCw size={16} /> Prøv PDF/synk på nytt
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
