// Expo ProffDok – FASE 34B
// Kundens ferdig aksepterte tilbud viser låst aksept med valgte opsjoner,
// akseptert totalsum inkl. mva. og signaturtidspunkt. Ingen akseptdata endres.

import { CheckCircle2 } from "lucide-react";
import { formatNok, getOfferTotal } from "../utils/salesUtils.js";

function formatAcceptedAt(value) {
  if (!value) return "Ikke registrert";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("nb-NO", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}

function getAcceptedOptions(request = {}) {
  if (Array.isArray(request.acceptedOptions)) return request.acceptedOptions;
  if (Array.isArray(request.acceptedPayload?.selected_options)) {
    return request.acceptedPayload.selected_options;
  }
  return [];
}

function getAcceptedTotalExVat(request = {}, options = []) {
  const explicit = Number(request.acceptedTotal);
  if (Number.isFinite(explicit)) return explicit;

  const snapshotBase = Number(
    request.acceptedPayload?.version_snapshot?.total_ex_vat ??
      request.acceptedPayload?.versionSnapshot?.total_ex_vat
  );
  if (Number.isFinite(snapshotBase)) {
    return snapshotBase + getOfferTotal(options);
  }

  return getOfferTotal(request.acceptedOfferLines || []) + getOfferTotal(options);
}

function optionTypeLabel(option = {}) {
  const amount = getOfferTotal([option]);
  if (option.optionType === "alternative") return "Valgt alternativ / prisendring";
  if (amount < 0) return "Valgt fradrag";
  return "Valgt tillegg";
}

export default function SalesCustomerAcceptedView({
  selectedRequest = {},
  companyProfile = {},
}) {
  const options = getAcceptedOptions(selectedRequest);
  const acceptedTotalExVat = getAcceptedTotalExVat(selectedRequest, options);
  const companyName =
    selectedRequest.companyName || companyProfile.companyName || "Utførende bedrift";
  const companyLogoUrl =
    selectedRequest.companyLogoUrl || companyProfile.logoUrl || "";
  const version =
    selectedRequest.acceptedOfferVersionNumber ||
    selectedRequest.acceptedPayload?.version_number ||
    "";

  return (
    <div className="sales-app sales-customer-offer-app">
      <div className="sales-shell sales-customer-shell">
        <header className="sales-header sales-customer-header">
          <div />
          <div className="sales-brand sales-brand-compact">
            <div className="sales-brand-mark">
              <CheckCircle2 size={22} />
            </div>
            <div className="sales-brand-copy">
              <strong>{companyName}</strong>
              <span>Akseptbekreftelse</span>
            </div>
          </div>
        </header>

        <main className="sales-main sales-customer-main">
          <section className="sales-customer-hero">
            <div className="sales-customer-hero-content">
              <p className="sales-eyebrow">Tilbud akseptert</p>
              <h1 className="sales-title sales-customer-title">
                Din aksept er registrert
              </h1>
              <p className="sales-subtitle sales-customer-lead">
                Dette er den registrerte og låste aksepten. Valgte opsjoner og
                totalsum nedenfor er hentet fra tilbudsversjonen du aksepterte.
              </p>

              <div className="sales-customer-meta-grid">
                <div>
                  <span>Tilbud</span>
                  <strong>{selectedRequest.id || "Ikke registrert"}</strong>
                </div>
                <div>
                  <span>Versjon</span>
                  <strong>{version ? `v${version}` : "Ikke registrert"}</strong>
                </div>
                <div>
                  <span>Kunde</span>
                  <strong>{selectedRequest.customer || "Ikke registrert"}</strong>
                </div>
                <div>
                  <span>Adresse</span>
                  <strong>{selectedRequest.address || "Ikke registrert"}</strong>
                </div>
                <div>
                  <span>Akseptert av</span>
                  <strong>{selectedRequest.acceptedBy || "Kunde"}</strong>
                </div>
                <div>
                  <span>Tidspunkt</span>
                  <strong>{formatAcceptedAt(selectedRequest.acceptedAt)}</strong>
                </div>
              </div>
            </div>

            <aside className="sales-customer-company-card">
              {companyLogoUrl ? (
                <img
                  className="sales-customer-company-logo"
                  src={companyLogoUrl}
                  alt={companyName}
                />
              ) : null}
              <span className="sales-customer-company-label">Tilbud fra</span>
              <strong className="sales-customer-company-name">{companyName}</strong>
              <span style={{ marginTop: 16, color: "#64748b" }}>
                {selectedRequest.acceptedOfferTitle || selectedRequest.offerTitle || "Tilbud"}
              </span>
            </aside>
          </section>

          <section className="sales-customer-offer-stack">
            <article className="sales-customer-section">
              <div className="sales-customer-section-heading">
                <div>
                  <span className="sales-section-kicker">01</span>
                  <h2>Valgte opsjoner</h2>
                </div>
                <span className="sales-customer-section-note">
                  Valgene er låst som en del av aksepten.
                </span>
              </div>

              {options.length ? (
                <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
                  {options.map((option, index) => {
                    const amountInclVat = getOfferTotal([option]) * 1.25;
                    return (
                      <div
                        key={option.id || `accepted-option-${index}`}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "minmax(0, 1fr) auto",
                          gap: 14,
                          padding: "14px 16px",
                          border: "1px solid #cfe6d9",
                          borderRadius: 12,
                          background: "#f4fbf7",
                        }}
                      >
                        <div>
                          <span
                            style={{
                              display: "block",
                              color: "#176b42",
                              fontSize: 12,
                              fontWeight: 900,
                              marginBottom: 4,
                            }}
                          >
                            {optionTypeLabel(option)}
                          </span>
                          <strong style={{ display: "block", color: "#0f172a" }}>
                            {option.title || option.description || "Valgt opsjon"}
                          </strong>
                          {option.description && option.title ? (
                            <span style={{ display: "block", marginTop: 4, color: "#52616b" }}>
                              {option.description}
                            </span>
                          ) : null}
                        </div>
                        <strong style={{ whiteSpace: "nowrap", color: "#0f172a" }}>
                          {formatNok(amountInclVat)} inkl. mva.
                        </strong>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="sales-subtitle" style={{ marginTop: 16 }}>
                  Ingen opsjoner ble valgt i denne aksepten.
                </p>
              )}
            </article>

            <article className="sales-customer-section">
              <div className="sales-customer-section-heading">
                <div>
                  <span className="sales-section-kicker">02</span>
                  <h2>Akseptert totalsum</h2>
                </div>
              </div>
              <div
                style={{
                  marginTop: 16,
                  padding: "18px 20px",
                  borderRadius: 14,
                  background: "#eef8fa",
                  border: "1px solid #b9d9df",
                }}
              >
                <strong style={{ display: "block", fontSize: 28, color: "#0f172a" }}>
                  {formatNok(acceptedTotalExVat * 1.25)} inkl. mva.
                </strong>
                <span style={{ display: "block", marginTop: 6, color: "#52616b" }}>
                  Inkluderer de valgte opsjonene ovenfor.
                </span>
              </div>
            </article>

            <article className="sales-customer-section sales-customer-intro-card">
              <span className="sales-section-kicker">✓</span>
              <div>
                <h2>Aksepten er ferdig registrert</h2>
                <p>
                  Ingen ytterligere handling er nødvendig i denne lenken.
                  Utførende bedrift følger opp saken videre.
                </p>
              </div>
            </article>
          </section>
        </main>
      </div>
    </div>
  );
}
