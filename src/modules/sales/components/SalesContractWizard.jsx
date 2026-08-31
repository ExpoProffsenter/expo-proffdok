// Expo ProffDok – FASE 33B.4
// Wrapper rundt den testede 33B.3-veiviseren. Core eier utfylling/redigering,
// mens denne filen eier bedriftens bekreftelse, låsing og sikker kundelenke.

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  ExternalLink,
  FileSignature,
  LockKeyhole,
  Pencil,
  ShieldCheck,
} from "lucide-react";
import SalesContractWizardCore from "./SalesContractWizardCore.jsx";
import SalesContractDocument from "./SalesContractDocument.jsx";
import { createDefaultSalesSupabaseClient } from "../services/salesSupabase.js";
import {
  CONTRACT_CHANGED_EVENT,
  buildCustomerContractLink,
  fetchActiveSalesContract,
  signExpoSalesContractCompany,
} from "../services/salesContracts.js";
import {
  getAcceptedSalesOfferId,
  getAcceptedSalesOfferVersionId,
} from "../utils/salesContractModel.js";

function formatDateTime(value = "") {
  if (!value) return "Ikke registrert";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

function companySnapshotToProfile(snapshot = {}) {
  return {
    companyName: snapshot.company_name || snapshot.companyName || "",
    orgNumber: snapshot.org_number || snapshot.orgNumber || "",
    address: snapshot.address || "",
    phone: snapshot.phone || "",
    email: snapshot.email || "",
    website: snapshot.website || "",
    logoUrl: snapshot.logo_url || snapshot.logoUrl || "/expo-logo.png",
  };
}

function StatusCard({ contract }) {
  const signed = contract?.status === "signed";
  const awaiting = contract?.status === "awaiting_customer";

  return (
    <div
      style={{
        display: "grid",
        gap: 8,
        padding: 15,
        borderRadius: 14,
        border: `1px solid ${signed ? "#b9dfc8" : awaiting ? "#9fd6da" : "#d8e5e9"}`,
        background: signed ? "#f1fbf5" : awaiting ? "#eefafb" : "#f8fbfc",
        color: signed ? "#176b42" : "#33545d",
      }}
    >
      <div style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 900 }}>
        {signed ? <CheckCircle2 size={19} /> : awaiting ? <LockKeyhole size={19} /> : <FileSignature size={19} />}
        {signed
          ? "Kontrakten er signert av begge parter"
          : awaiting
            ? "Kontrakten er låst og venter på kunden"
            : "Kontraktsutkastet er lagret"}
      </div>
      {contract?.company_signed_at ? (
        <div>
          Bedriften: <strong>{contract.company_signed_by_name || "Bekreftet"}</strong> · {formatDateTime(contract.company_signed_at)}
        </div>
      ) : null}
      {contract?.customer_signed_at ? (
        <div>
          Kunden: <strong>{contract.customer_signed_by_name || "Signert"}</strong> · {formatDateTime(contract.customer_signed_at)}
        </div>
      ) : null}
      {awaiting ? (
        <span>Innholdet kan ikke redigeres mens kontrakten ligger til signering hos kunden.</span>
      ) : null}
      {signed ? <span>Signaturene og kontraktsgrunnlaget er låst historikk.</span> : null}
    </div>
  );
}

export default function SalesContractWizard({ request, onClose }) {
  const client = useMemo(() => createDefaultSalesSupabaseClient(), []);
  const offerId = getAcceptedSalesOfferId(request);
  const offerVersionId = getAcceptedSalesOfferVersionId(request);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [confirmCompany, setConfirmCompany] = useState(false);
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState("");
  const [copyMessage, setCopyMessage] = useState("");

  async function loadContract({ leaveEditor = false } = {}) {
    setLoading(true);
    setError("");
    try {
      const result = await fetchActiveSalesContract(client, { offerId, offerVersionId });
      if (result?.error) throw result.error;
      setContract(result?.data || null);
      if (leaveEditor && result?.data?.status === "draft") setEditing(false);
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
    loadContract();
  }, [offerId, offerVersionId]);

  useEffect(() => {
    const handleContractChanged = () => loadContract({ leaveEditor: true });
    window.addEventListener(CONTRACT_CHANGED_EVENT, handleContractChanged);
    return () => window.removeEventListener(CONTRACT_CHANGED_EVENT, handleContractChanged);
  }, [offerId, offerVersionId]);

  async function signAsCompany() {
    if (!confirmCompany) {
      setError("Bekreft at kontrakten er kontrollert før du signerer på vegne av bedriften.");
      return;
    }
    if (!contract?.id) {
      setError("Kontraktsutkastet må lagres før det kan signeres.");
      return;
    }

    setSigning(true);
    setError("");
    try {
      await signExpoSalesContractCompany(client, contract.id);
      setConfirmCompany(false);
      await loadContract();
    } catch (signError) {
      setError(
        signError instanceof Error
          ? signError.message
          : "Kontrakten kunne ikke bekreftes."
      );
    } finally {
      setSigning(false);
    }
  }

  const customerLink = useMemo(() => {
    if (!contract?.customer_token || typeof window === "undefined") return "";
    return buildCustomerContractLink(window.location.href, {
      contractToken: contract.customer_token,
      offerToken: request?.publicToken || "",
    });
  }, [contract?.customer_token, request?.publicToken]);

  async function copyCustomerLink() {
    if (!customerLink) return;
    try {
      await navigator.clipboard.writeText(customerLink);
      setCopyMessage("Kundelenken er kopiert.");
    } catch {
      setCopyMessage("Kunne ikke kopiere automatisk. Åpne lenken og kopier fra adressefeltet.");
    }
  }

  if (loading && !contract) {
    return (
      <div className="sales-app">
        <div className="sales-shell">
          <main className="sales-main">
            <div className="sales-form-panel">Laster kontraktsstatus …</div>
          </main>
        </div>
      </div>
    );
  }

  if (!contract || editing) {
    return <SalesContractWizardCore request={request} onClose={onClose} />;
  }

  if (contract.source !== "expo") {
    return (
      <div className="sales-app">
        <div className="sales-shell">
          <main className="sales-main">
            <div className="sales-form-panel" style={{ display: "grid", gap: 14 }}>
              <h1 style={{ margin: 0 }}>Ekstern kontrakt er registrert</h1>
              <p style={{ margin: 0, color: "#52616b" }}>
                Denne tilbudsversjonen bruker bedriftens egen kontrakt. Eksisterende opplastingsflyt er fortsatt gjeldende.
              </p>
              <button className="sales-secondary-button" type="button" onClick={onClose} style={{ justifySelf: "start" }}>
                <ArrowLeft size={18} /> Tilbake til saken
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const draft = contract.snapshot?.contract || {};
  const companyProfile = companySnapshotToProfile(contract.snapshot?.company || {});
  const status = contract.status || "draft";
  const locked = status === "awaiting_customer" || status === "signed";

  return (
    <div className="sales-app">
      <div className="sales-shell">
        <header className="sales-header">
          <button className="sales-back-button" type="button" onClick={onClose}>
            <ArrowLeft size={18} /> Tilbake til saken
          </button>
          <div className="sales-brand sales-brand-compact">
            <div className="sales-brand-mark"><FileSignature size={22} /></div>
            <div className="sales-brand-copy">
              <strong>Expo ProffDok</strong>
              <span>Forbrukerkontrakt</span>
            </div>
          </div>
        </header>

        <main className="sales-main">
          <section className="sales-form-hero">
            <p className="sales-eyebrow">Kontrakt etter akseptert tilbud</p>
            <h1 className="sales-title">{request?.title || "Kontrakt"}</h1>
            <p className="sales-subtitle">
              {status === "draft"
                ? "Kontroller utkastet før bedriften bekrefter og signerer."
                : status === "signed"
                  ? "Kontrakten er signert av begge parter."
                  : "Kontrakten er bekreftet av bedriften og ligger til kundesignering."}
            </p>
          </section>

          <div className="sales-form-panel" style={{ display: "grid", gap: 18 }}>
            <StatusCard contract={contract} />

            <SalesContractDocument
              request={request}
              companyProfile={companyProfile}
              draft={draft}
              signatures={{
                companyName: contract.company_signed_by_name || "",
                companyAt: contract.company_signed_at || "",
                customerName: contract.customer_signed_by_name || "",
                customerAt: contract.customer_signed_at || "",
              }}
            />

            {status === "draft" ? (
              <section
                style={{
                  maxWidth: 860,
                  width: "100%",
                  boxSizing: "border-box",
                  margin: "0 auto",
                  padding: 17,
                  borderRadius: 14,
                  border: "1px solid #d8e5e9",
                  background: "#ffffff",
                  display: "grid",
                  gap: 13,
                }}
              >
                <div>
                  <h2 style={{ margin: "0 0 6px", color: "#183b46" }}>Bedriftens bekreftelse</h2>
                  <p style={{ margin: 0, color: "#52616b", lineHeight: 1.5 }}>
                    Når kontrakten bekreftes, låses innholdet mot den aksepterte tilbudsversjonen. Deretter opprettes en sikker kundelenke for signering.
                  </p>
                </div>

                <label
                  style={{
                    display: "grid",
                    gridTemplateColumns: "24px minmax(0,1fr)",
                    gap: 10,
                    padding: 13,
                    borderRadius: 12,
                    background: confirmCompany ? "#f1fbf5" : "#f8fbfc",
                    border: "1px solid #d7e4ea",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={confirmCompany}
                    onChange={(event) => setConfirmCompany(event.target.checked)}
                    style={{ marginTop: 4 }}
                  />
                  <span style={{ lineHeight: 1.45 }}>
                    <strong style={{ color: "#183b46" }}>Jeg har kontrollert kontrakten og signerer på vegne av bedriften.</strong>
                    <span style={{ display: "block", marginTop: 3, color: "#52616b" }}>
                      Navn og tidspunkt registreres automatisk fra innlogget bruker.
                    </span>
                  </span>
                </label>

                {error ? <div role="alert" style={{ color: "#9b1c1c", fontWeight: 700 }}>{error}</div> : null}

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button className="sales-secondary-button" type="button" onClick={() => setEditing(true)}>
                    <Pencil size={18} /> Rediger utkast
                  </button>
                  <button className="sales-primary-button" type="button" onClick={signAsCompany} disabled={signing}>
                    <FileSignature size={18} />
                    {signing ? "Bekrefter …" : "Bekreft og signer kontrakt"}
                  </button>
                </div>
              </section>
            ) : null}

            {locked ? (
              <section
                style={{
                  maxWidth: 860,
                  width: "100%",
                  boxSizing: "border-box",
                  margin: "0 auto",
                  padding: 17,
                  borderRadius: 14,
                  border: "1px solid #b9e0e3",
                  background: "#eefafb",
                  display: "grid",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 900, color: "#0b737b" }}>
                  <ShieldCheck size={19} /> Sikker kundelenke
                </div>
                <p style={{ margin: 0, color: "#42606b", lineHeight: 1.5 }}>
                  Kunden kan lese det låste kontraktsgrunnlaget og signere med fullt navn. Kunden kan ikke redigere kontrakten.
                </p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    className="sales-primary-button"
                    type="button"
                    onClick={() => window.open(customerLink, "_blank", "noopener,noreferrer")}
                    disabled={!customerLink}
                  >
                    <ExternalLink size={18} /> Åpne kundelenke
                  </button>
                  <button className="sales-secondary-button" type="button" onClick={copyCustomerLink} disabled={!customerLink}>
                    <Copy size={18} /> Kopier kundelenke
                  </button>
                </div>
                {copyMessage ? <div style={{ color: "#176b42", fontWeight: 800 }}>{copyMessage}</div> : null}
                {status === "awaiting_customer" ? (
                  <small style={{ color: "#52616b" }}>
                    Neste steg i denne fasen er at kunden åpner lenken, bekrefter avtalegrunnlaget og signerer.
                  </small>
                ) : null}
              </section>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
