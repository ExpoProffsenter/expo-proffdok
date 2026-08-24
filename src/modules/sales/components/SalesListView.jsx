// Expo ProffDok – FASE 30C2 / FASE 28B1 / FASE 29B4 / FASE 29C1
// FASE 30C2 viser ekte lastestatus mens salgssaker hentes, slik at 0 aldri presenteres
// som et ferdig resultat mens Supabase fortsatt arbeider eller har feilet.
// Viser når kundetilbud faktisk ble sendt på e-post og markerer tilbud som bør
// følges opp etter 7 dager uten aksept. I Systemadmin-support kan eksisterende
// saker åpnes, men nye forespørsler opprettes ikke uten ansvarlig i målbedriften.
// Expo ProffDok – FASE 23H
// Presentasjonskomponent for saksoversikten i Befaring / Tilbud / Aksept.

import { useEffect, useState } from "react";
import { ClipboardList, Home, Hourglass, Plus, Ruler, Send } from "lucide-react";
import SalesSupportNotice from "./SalesSupportNotice.jsx";
import {
  getSalesRequestsLoadState,
  getSalesSupportCompanyId,
  subscribeSalesRequestsLoadState,
} from "../services/salesSupabase.js";

const iconMap = {
  clipboard: ClipboardList,
  ruler: Ruler,
  send: Send,
  home: Home,
};

const OFFER_FOLLOW_UP_DAYS = 7;

function getOfferFollowUpInfo(request) {
  if (
    request?.status !== "Tilbud" ||
    request?.acceptedAt ||
    !request?.offerEmailSentAt
  ) {
    return null;
  }

  const sentAt = new Date(request.offerEmailSentAt);

  if (Number.isNaN(sentAt.getTime())) {
    return null;
  }

  const ageInDays = Math.max(
    0,
    Math.floor((Date.now() - sentAt.getTime()) / (24 * 60 * 60 * 1000))
  );
  const sentDate = sentAt.toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const ageText =
    ageInDays === 0
      ? "i dag"
      : `${ageInDays} ${ageInDays === 1 ? "dag" : "dager"} siden`;

  return {
    text: `Sendt ${sentDate} · ${ageText}`,
    shouldFollowUp: ageInDays >= OFFER_FOLLOW_UP_DAYS,
  };
}

export default function SalesListView({
  activeRequests = [],
  activatedRequests = [],
  summary = [],
  onCreateRequest,
  onOpenRequest,
}) {
  const supportMode = Boolean(getSalesSupportCompanyId());
  const [loadState, setLoadState] = useState(() => getSalesRequestsLoadState());
  const [longWait, setLongWait] = useState(false);

  useEffect(() => subscribeSalesRequestsLoadState(setLoadState), []);

  useEffect(() => {
    if (["ready", "error"].includes(loadState.status)) {
      setLongWait(false);
      return undefined;
    }

    const timer = window.setTimeout(() => setLongWait(true), 5000);
    return () => window.clearTimeout(timer);
  }, [loadState.status]);

  const hasAnyRequest = activeRequests.length > 0 || activatedRequests.length > 0;
  const requestsLoading =
    !hasAnyRequest && ["idle", "loading"].includes(loadState.status);
  const requestsLoadFailed = !hasAnyRequest && loadState.status === "error";

  return (
    <div className="sales-app">
      <div className="sales-shell">
        <header className="sales-header">
          <div className="sales-brand">
            <div className="sales-brand-mark">
              <ClipboardList size={22} />
            </div>
            <div className="sales-brand-copy">
              <strong>Expo ProffDok</strong>
              <span>Befaring / Tilbud / Aksept</span>
            </div>
          </div>
        </header>

        <main className="sales-main">
          <SalesSupportNotice />

          <section className="sales-hero">
            <div>
              <h1 className="sales-title">Forespørsler</h1>
              <p className="sales-subtitle">
                Samle kundehenvendelser, befaring, tilbud og aksept før jobben
                aktiveres som et vanlig ProffDok-prosjekt.
              </p>
            </div>

            <button
              className="sales-primary-button"
              type="button"
              onClick={supportMode ? undefined : onCreateRequest}
              disabled={supportMode}
              title={
                supportMode
                  ? "Nye saker opprettes ikke i Systemadmin-supportmodus."
                  : undefined
              }
            >
              <Plus size={19} />
              {supportMode ? "Ny forespørsel sperret" : "Ny forespørsel"}
            </button>
          </section>

          {supportMode ? (
            <p className="sales-subtitle" style={{ marginTop: -12, marginBottom: 20 }}>
              Åpne og kontroller eksisterende saker. Nye saker må opprettes av
              målbedriften slik at riktig saksansvarlig blir registrert.
            </p>
          ) : null}

          {requestsLoading ? (
            <div
              role="status"
              aria-live="polite"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginBottom: 18,
                padding: "16px 18px",
                border: "1px solid #9edce0",
                borderRadius: 16,
                background: "#e9fafb",
                color: "#174f58",
                fontWeight: 900,
                boxShadow: "0 8px 24px rgba(16, 141, 151, 0.08)",
              }}
            >
              <Hourglass size={28} aria-hidden="true" />
              <div>
                <div>Henter saker fra server …</div>
                {longWait ? (
                  <div
                    className="sales-subtitle"
                    style={{ marginTop: 4, fontWeight: 700 }}
                  >
                    Dette tar lengre tid enn normalt. Vi venter fortsatt på serveren.
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          <section className="sales-summary-grid" aria-label="Oversikt">
            {summary.map((item) => (
              <article className="sales-summary-card" key={item.label}>
                <span className="sales-summary-label">{item.label}</span>
                <strong className="sales-summary-value">
                  {requestsLoading ? "…" : requestsLoadFailed ? "–" : item.value}
                </strong>
              </article>
            ))}
          </section>

          <section className="sales-panel">
            <div className="sales-panel-header">
              <div>
                <h2 className="sales-panel-title">Aktive forespørsler</h2>
              </div>
            </div>

            <div className="sales-request-list">
              {requestsLoadFailed ? (
                <div
                  role="alert"
                  style={{
                    padding: "16px 18px",
                    border: "1px solid #fed7aa",
                    borderRadius: 16,
                    background: "#fff7ed",
                    color: "#7c2d12",
                    lineHeight: 1.5,
                  }}
                >
                  <strong>Sakene kunne ikke hentes fra serveren.</strong>
                  <div style={{ marginTop: 4 }}>
                    Vi viser derfor ikke 0 som om listen er tom. Vent litt og åpne
                    Befaring/Tilbud på nytt når forbindelsen er stabil.
                  </div>
                  {loadState.error ? (
                    <div style={{ marginTop: 6, fontSize: 13 }}>
                      {loadState.error}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {!requestsLoading && !requestsLoadFailed && activeRequests.length === 0 ? (
                <p className="sales-subtitle">
                  {supportMode
                    ? "Ingen aktive forespørsler i dette firmaet."
                    : "Ingen aktive forespørsler. Opprett en ny forespørsel for å starte en befaring eller et tilbud."}
                </p>
              ) : null}

              {activeRequests.map((request) => {
                const Icon = iconMap[request.iconName] || ClipboardList;
                const offerFollowUp = getOfferFollowUpInfo(request);

                return (
                  <button
                    className="sales-request-card"
                    key={request.id}
                    type="button"
                    onClick={() => onOpenRequest?.(request.id)}
                  >
                    <div className="sales-request-main">
                      <h3 className="sales-request-title">{request.title}</h3>
                      <p className="sales-request-customer">
                        {request.customer} · {request.address} · {request.id}
                      </p>

                      {offerFollowUp ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            flexWrap: "wrap",
                            marginTop: 7,
                          }}
                        >
                          <span className="sales-subtitle" style={{ margin: 0 }}>
                            {offerFollowUp.text}
                          </span>

                          {offerFollowUp.shouldFollowUp ? (
                            <span
                              aria-label="Tilbud bør følges opp"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                minHeight: 24,
                                padding: "3px 8px",
                                borderRadius: 999,
                                fontSize: 12,
                                fontWeight: 700,
                                background: "#fff7ed",
                                color: "#9a3412",
                                border: "1px solid #fed7aa",
                              }}
                            >
                              Bør følges opp
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                    </div>

                    <div className="sales-request-next">
                      <span className="sales-next-label">Neste steg</span>
                      <span className="sales-next-step">
                        <Icon size={16} />
                        {request.nextStep}
                      </span>
                    </div>

                    <span className={`sales-status ${request.statusClass}`}>
                      {request.status}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {activatedRequests.length > 0 ? (
            <section className="sales-panel">
              <div className="sales-panel-header">
                <div>
                  <h2 className="sales-panel-title">
                    Aktiverte prosjekter ({activatedRequests.length})
                  </h2>
                </div>
              </div>

              <div className="sales-request-list">
                {activatedRequests.map((request) => {
                  const Icon = iconMap[request.iconName] || ClipboardList;

                  return (
                    <button
                      className="sales-request-card"
                      key={request.id}
                      type="button"
                      onClick={() => onOpenRequest?.(request.id)}
                    >
                      <div className="sales-request-main">
                        <h3 className="sales-request-title">{request.title}</h3>
                        <p className="sales-request-customer">
                          {request.customer} · {request.address} · {request.id}
                        </p>
                      </div>

                      <div className="sales-request-next">
                        <span className="sales-next-label">Prosjekt</span>
                        <span className="sales-next-step">
                          <Icon size={16} />
                          {request.nextStep}
                        </span>
                      </div>

                      <span className={`sales-status ${request.statusClass}`}>
                        {request.status}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          ) : null}
        </main>
      </div>
    </div>
  );
}
