// Expo ProffDok – FASE 33B.4
// Offentlig, tokenstyrt kundevisning for Expo-kontrakt. Kunden kan bare lese
// låst kontraktsgrunnlag og signere gjennom server-RPC.

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, FileSignature, ShieldCheck } from "lucide-react";
import SalesContractDocument from "./SalesContractDocument.jsx";
import {
  fetchPublicSalesContract,
  signPublicSalesContractCustomer,
} from "../services/salesContracts.js";

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

function mapContractForDocument(contract = {}) {
  const snapshot = contract?.snapshot || {};
  const offer = snapshot.offer || {};
  const acceptance = snapshot.acceptance || {};
  const customer = snapshot.customer || {};
  const company = snapshot.company || {};
  const draft = snapshot.contract || {};

  return {
    request: {
      id: contract.id || "",
      requestRef: contract.request_ref || "",
      request_ref: contract.request_ref || "",
      title: offer.title || "Forbrukerkontrakt",
      customer: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || draft.project_address || "",
      acceptedTotal: Number(offer.total_ex_vat || 0),
      acceptedOfferVersionNumber: offer.version_number || "",
      acceptedOptions: Array.isArray(acceptance.selected_options)
        ? acceptance.selected_options
        : [],
      acceptedAt: acceptance.accepted_at || "",
      acceptedBy: acceptance.accepted_by || customer.name || "",
      acceptedPayload: {
        accepted_by: acceptance.accepted_by || customer.name || "",
        accepted_at: acceptance.accepted_at || "",
        selected_options: Array.isArray(acceptance.selected_options)
          ? acceptance.selected_options
          : [],
        version_id: offer.version_id || "",
        version_number: offer.version_number || "",
        version_snapshot: offer,
      },
    },
    companyProfile: {
      companyName: company.company_name || company.companyName || "",
      orgNumber: company.org_number || company.orgNumber || "",
      address: company.address || "",
      phone: company.phone || "",
      email: company.email || "",
      website: company.website || "",
      logoUrl: company.logo_url || company.logoUrl || "/expo-logo.png",
    },
    draft,
  };
}

function CheckboxRow({ checked, onChange, title, text }) {
  return (
    <label
      style={{
        display: "grid",
        gridTemplateColumns: "24px minmax(0,1fr)",
        gap: 11,
        alignItems: "start",
        padding: 13,
        border: "1px solid #d7e4ea",
        borderRadius: 12,
        background: checked ? "#f1fbf5" : "#ffffff",
        cursor: "pointer",
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        style={{ marginTop: 4 }}
      />
      <span style={{ display: "grid", gap: 3 }}>
        <strong style={{ color: "#183b46" }}>{title}</strong>
        {text ? <span style={{ color: "#52616b", lineHeight: 1.45 }}>{text}</span> : null}
      </span>
    </label>
  );
}

export default function SalesContractCustomerView({ supabaseClient, contractToken }) {
  const client = supabaseClient;
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState("");
  const [acceptedName, setAcceptedName] = useState("");
  const [contractAccepted, setContractAccepted] = useState(false);
  const [offerBasisAccepted, setOfferBasisAccepted] = useState(false);
  const [earlyStartConfirmed, setEarlyStartConfirmed] = useState(false);

  const presentation = useMemo(
    () => mapContractForDocument(contract || {}),
    [contract]
  );
  const requiresEarlyStart = Boolean(
    presentation?.draft?.early_start_requested
  );

  async function loadContract() {
    setLoading(true);
    setError("");
    try {
      const data = await fetchPublicSalesContract(client, contractToken);
      if (!data) {
        throw new Error(
          "Kontrakten er ikke tilgjengelig. Kontroller at du har åpnet den nyeste lenken."
        );
      }
      setContract(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Kontrakten kunne ikke lastes."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadContract();
  }, [contractToken]);

  async function signContract() {
    const cleanName = String(acceptedName || "").trim();
    if (!cleanName) {
      setError("Skriv inn fullt navn før du signerer.");
      return;
    }
    if (!contractAccepted || !offerBasisAccepted) {
      setError("Bekreft kontrakten og det aksepterte tilbudsgrunnlaget før signering.");
      return;
    }
    if (requiresEarlyStart && !earlyStartConfirmed) {
      setError("Bekreft ønsket om oppstart før eventuell angrefrist er utløpt.");
      return;
    }

    setSigning(true);
    setError("");
    try {
      await signPublicSalesContractCustomer(client, {
        token: contractToken,
        acceptedName: cleanName,
        acknowledgements: {
          contract_accepted: true,
          accepted_offer_basis: true,
          early_start_confirmed: requiresEarlyStart ? true : false,
        },
      });
      await loadContract();
      window.scrollTo?.({ top: 0, behavior: "smooth" });
    } catch (signError) {
      setError(
        signError instanceof Error
          ? signError.message
          : "Kontrakten kunne ikke signeres."
      );
    } finally {
      setSigning(false);
    }
  }

  if (loading) {
    return (
      <div className="sales-app">
        <div className="sales-shell">
          <main className="sales-main">
            <div className="sales-form-panel">Laster kontrakt …</div>
          </main>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="sales-app">
        <div className="sales-shell">
          <main className="sales-main">
            <div className="sales-form-panel">
              <h1 style={{ marginTop: 0 }}>Kontrakten kunne ikke åpnes</h1>
              <p>{error || "Lenken er ugyldig eller kontrakten er ikke lenger tilgjengelig."}</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const signed = contract.status === "signed";

  return (
    <div className="sales-app">
      <div className="sales-shell">
        <main className="sales-main">
          <section className="sales-form-hero">
            <p className="sales-eyebrow">Kontrakt til signering</p>
            <h1 className="sales-title">{presentation.request.title}</h1>
            <p className="sales-subtitle">
              {presentation.companyProfile.companyName || "Utførende firma"} · {presentation.request.customer}
            </p>
          </section>

          <div className="sales-form-panel" style={{ display: "grid", gap: 18 }}>
            <div
              style={{
                display: "grid",
                gap: 8,
                padding: 14,
                borderRadius: 12,
                border: "1px solid #b9e0e3",
                background: "#eefafb",
                color: "#33545d",
              }}
            >
              <div style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 900, color: "#0b737b" }}>
                <ShieldCheck size={18} /> Kontrakten er bekreftet av utførende firma
              </div>
              <div>
                <strong>{contract.company_signed_by_name || presentation.companyProfile.companyName}</strong>
                {contract.company_signed_at ? ` · ${formatDateTime(contract.company_signed_at)}` : ""}
              </div>
              <span>
                Kontraktsgrunnlaget er låst. Kunden kan lese og signere, men ikke endre innholdet.
              </span>
            </div>

            {signed ? (
              <div
                style={{
                  display: "grid",
                  gap: 8,
                  padding: 16,
                  borderRadius: 12,
                  border: "1px solid #b9dfc8",
                  background: "#f1fbf5",
                  color: "#176b42",
                }}
              >
                <div style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 900 }}>
                  <CheckCircle2 size={20} /> Kontrakten er signert av begge parter
                </div>
                <span>
                  Kunde: <strong>{contract.customer_signed_by_name}</strong>
                  {contract.customer_signed_at ? ` · ${formatDateTime(contract.customer_signed_at)}` : ""}
                </span>
                <span>Kontrakten kan ikke endres etter signering.</span>
              </div>
            ) : null}

            <SalesContractDocument
              request={presentation.request}
              companyProfile={presentation.companyProfile}
              draft={presentation.draft}
              signatures={{
                companyName: contract.company_signed_by_name || "",
                companyAt: contract.company_signed_at || "",
                customerName: contract.customer_signed_by_name || "",
                customerAt: contract.customer_signed_at || "",
              }}
            />

            {!signed ? (
              <section
                style={{
                  maxWidth: 860,
                  width: "100%",
                  boxSizing: "border-box",
                  margin: "0 auto",
                  padding: 18,
                  borderRadius: 16,
                  border: "1px solid #d8e5e9",
                  background: "#ffffff",
                  display: "grid",
                  gap: 13,
                }}
              >
                <div>
                  <h2 style={{ margin: "0 0 6px", color: "#183b46" }}>Signer kontrakten</h2>
                  <p style={{ margin: 0, color: "#52616b", lineHeight: 1.5 }}>
                    Les kontrakten og bekreft punktene nedenfor før du signerer med fullt navn.
                  </p>
                </div>

                <CheckboxRow
                  checked={contractAccepted}
                  onChange={setContractAccepted}
                  title="Jeg har lest og aksepterer kontrakten"
                />
                <CheckboxRow
                  checked={offerBasisAccepted}
                  onChange={setOfferBasisAccepted}
                  title="Jeg bekrefter avtalegrunnlaget"
                  text="Det tidligere aksepterte tilbudet med valgte opsjoner og vedlegg inngår i avtalen."
                />
                {requiresEarlyStart ? (
                  <CheckboxRow
                    checked={earlyStartConfirmed}
                    onChange={setEarlyStartConfirmed}
                    title="Jeg ønsker oppstart før eventuell angrefrist er utløpt"
                    text="Denne bekreftelsen gjelder bare fordi tidlig oppstart er registrert i kontrakten."
                  />
                ) : null}

                <label style={{ display: "grid", gap: 6, color: "#183b46", fontWeight: 800 }}>
                  <span>Fullt navn</span>
                  <input
                    value={acceptedName}
                    onChange={(event) => setAcceptedName(event.target.value)}
                    autoComplete="name"
                    placeholder="Skriv fullt navn"
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      border: "1px solid #cbdce2",
                      borderRadius: 10,
                      padding: "12px 13px",
                      font: "inherit",
                    }}
                  />
                </label>

                {error ? (
                  <div role="alert" style={{ color: "#9b1c1c", fontWeight: 700 }}>{error}</div>
                ) : null}

                <button
                  className="sales-primary-button"
                  type="button"
                  onClick={signContract}
                  disabled={signing}
                  style={{ justifySelf: "start" }}
                >
                  <FileSignature size={18} />
                  {signing ? "Signerer …" : "Signer kontrakt"}
                </button>
              </section>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
