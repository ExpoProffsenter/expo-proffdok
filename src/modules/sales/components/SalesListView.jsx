// Expo ProffDok – FASE 37D1 / FASE 37A1 / FASE 30C2 / FASE 28B1 / FASE 29B4 / FASE 29C1
// FASE 37D1 skiller Butikktilbud og Våtromstilbud i samme Sales-oversikt uten
// å lage parallell lagring. Eksisterende arbeidsstatus, søk og arkiv beholdes.
// FASE 37A1 legger søk, arbeidsfaner og trygg arkivering oppå eksisterende Sales-data.
// Ingen tilbudsversjoner, aksepter eller prosjektaktivering omskrives. Arkiv bruker
// eksisterende sales_requests.archived_at og kan alltid gjenopprettes.
// FASE 30C2 viser ekte lastestatus mens salgssaker hentes, slik at 0 aldri presenteres
// som et ferdig resultat mens Supabase fortsatt arbeider eller har feilet.
// Viser når kundetilbud faktisk ble sendt på e-post og markerer tilbud som bør
// følges opp etter 7 dager uten aksept. I Systemadmin-support kan eksisterende
// saker åpnes, men nye forespørsler opprettes ikke uten ansvarlig i målbedriften.
// Expo ProffDok – FASE 23H
// Presentasjonskomponent for saksoversikten i Befaring / Tilbud / Aksept.

import { useEffect, useMemo, useState } from "react";
import {
  Archive,
  ClipboardList,
  Home,
  Hourglass,
  Plus,
  RotateCcw,
  Ruler,
  Search,
  Send,
} from "lucide-react";
import SalesSupportNotice from "./SalesSupportNotice.jsx";
import {
  createDefaultSalesSupabaseClient,
  getSalesRequestsLoadState,
  getSalesSupportCompanyId,
  resolveSalesCompanyScope,
  setSalesRequestArchivedAt,
  subscribeSalesRequestsLoadState,
} from "../services/salesSupabase.js";
import { isStoreOfferRequest } from "../services/salesStoreOffers.js";

const iconMap = {
  clipboard: ClipboardList,
  ruler: Ruler,
  send: Send,
  home: Home,
};

const OFFER_FOLLOW_UP_DAYS = 7;
const OFFER_TYPE_TABS = [
  { id: "all", label: "Alle tilbud" },
  { id: "wetroom", label: "Våtromstilbud" },
  { id: "store", label: "Butikktilbud" },
];
const WORK_TABS = [
  { id: "work", label: "Under arbeid" },
  { id: "follow-up", label: "Må følges opp" },
  { id: "accepted", label: "Akseptert" },
  { id: "archive", label: "Arkiv" },
  { id: "all", label: "Alle" },
];

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

function normalizeSearchText(value) {
  return String(value ?? "")
    .toLocaleLowerCase("nb-NO")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function requestMatchesSearch(request, query) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return true;

  const haystack = [
    request?.customer,
    request?.title,
    request?.offerTitle,
    request?.address,
    request?.postnr,
    request?.city,
    request?.phone,
    request?.email,
    request?.id,
    request?.responsible,
    request?.surveyResponsible,
    request?.projectResponsible,
    request?.source,
  ]
    .map(normalizeSearchText)
    .filter(Boolean)
    .join(" ");

  return haystack.includes(normalizedQuery);
}

function isArchivedRequest(request) {
  return Boolean(String(request?.archivedAt || "").trim());
}

function requestBucket(request) {
  if (isArchivedRequest(request)) return "archive";
  if (request?.status === "Akseptert") return "accepted";

  const followUp = getOfferFollowUpInfo(request);
  if (followUp?.shouldFollowUp) return "follow-up";

  return "work";
}

function filterRequestForTab(request, activeTab) {
  if (activeTab === "all") return true;
  return requestBucket(request) === activeTab;
}

function filterRequestForType(request, activeOfferType) {
  if (activeOfferType === "all") return true;
  const storeOffer = isStoreOfferRequest(request);
  return activeOfferType === "store" ? storeOffer : !storeOffer;
}

export default function SalesListView({
  activeRequests = [],
  activatedRequests = [],
  onCreateRequest,
  onOpenRequest,
}) {
  const supportMode = Boolean(getSalesSupportCompanyId());
  const [loadState, setLoadState] = useState(() => getSalesRequestsLoadState());
  const [longWait, setLongWait] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeOfferType, setActiveOfferType] = useState("all");
  const [activeTab, setActiveTab] = useState("work");
  const [archiveBusyId, setArchiveBusyId] = useState("");
  const salesClient = useMemo(() => createDefaultSalesSupabaseClient(), []);

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

  const offerTypeCounts = useMemo(() => {
    const store = activeRequests.filter(isStoreOfferRequest).length;
    return {
      all: activeRequests.length,
      store,
      wetroom: Math.max(0, activeRequests.length - store),
    };
  }, [activeRequests]);

  const requestCounts = useMemo(() => {
    const typeScopedRequests = activeRequests.filter((request) =>
      filterRequestForType(request, activeOfferType)
    );
    const counts = {
      work: 0,
      "follow-up": 0,
      accepted: 0,
      archive: 0,
      all: typeScopedRequests.length,
    };

    typeScopedRequests.forEach((request) => {
      const bucket = requestBucket(request);
      counts[bucket] = (counts[bucket] || 0) + 1;
    });

    return counts;
  }, [activeRequests, activeOfferType]);

  const overviewSummary = useMemo(
    () => [
      { label: "Under arbeid", value: requestCounts.work },
      { label: "Må følges opp", value: requestCounts["follow-up"] },
      { label: "Akseptert", value: requestCounts.accepted },
      { label: "Arkiv", value: requestCounts.archive },
    ],
    [requestCounts]
  );

  const filteredRequests = useMemo(
    () =>
      activeRequests.filter(
        (request) =>
          filterRequestForType(request, activeOfferType) &&
          filterRequestForTab(request, activeTab) &&
          requestMatchesSearch(request, searchQuery)
      ),
    [activeRequests, activeOfferType, activeTab, searchQuery]
  );

  const filteredActivatedRequests = useMemo(
    () =>
      activatedRequests.filter(
        (request) =>
          filterRequestForType(request, activeOfferType) &&
          requestMatchesSearch(request, searchQuery)
      ),
    [activatedRequests, activeOfferType, searchQuery]
  );

  async function toggleArchive(request) {
    if (supportMode || archiveBusyId || !request?.id) return;
    if (!salesClient) {
      alert("Kunne ikke koble til serveren for å oppdatere arkivet.");
      return;
    }

    setArchiveBusyId(request.id);
    const restoring = isArchivedRequest(request);
    const archivedAt = restoring ? null : new Date().toISOString();

    try {
      const { data: companyId, error: companyError } =
        await resolveSalesCompanyScope(salesClient);

      if (companyError || !companyId) {
        throw new Error(
          companyError?.message || "Firmatilknytningen kunne ikke bekreftes."
        );
      }

      const { error } = await setSalesRequestArchivedAt(salesClient, {
        companyId,
        requestRef: request.id,
        archivedAt,
      });

      if (error) {
        throw error;
      }

      window.dispatchEvent(new Event("expo-proffdok-sales-rehydrate"));
    } catch (error) {
      alert(
        error?.message ||
          (restoring
            ? "Saken kunne ikke gjenopprettes fra arkivet."
            : "Saken kunne ikke arkiveres.")
      );
      setArchiveBusyId("");
    }
  }

  const emptyListText = searchQuery.trim()
    ? "Ingen saker matcher søket i denne fanen."
    : activeTab === "follow-up"
      ? "Ingen tilbud må følges opp akkurat nå."
      : activeTab === "accepted"
        ? "Ingen aksepterte tilbud venter på videre behandling."
        : activeTab === "archive"
          ? "Arkivet er tomt."
          : activeTab === "all"
            ? "Ingen salgssaker er registrert."
            : supportMode
              ? "Ingen saker under arbeid i dette firmaet."
              : "Ingen saker under arbeid. Opprett en ny forespørsel for å starte en befaring eller et tilbud.";

  const activeTypeLabel =
    OFFER_TYPE_TABS.find((tab) => tab.id === activeOfferType)?.label || "Alle tilbud";

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
              <h1 className="sales-title">Forespørsler og tilbud</h1>
              <p className="sales-subtitle">
                Våtromstilbud og Butikktilbud ligger i samme sikre tilbudsmotor,
                men kan filtreres separat under.
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
            {overviewSummary.map((item) => (
              <article className="sales-summary-card" key={item.label}>
                <span className="sales-summary-label">{item.label}</span>
                <strong className="sales-summary-value">
                  {requestsLoading ? "…" : requestsLoadFailed ? "–" : item.value}
                </strong>
              </article>
            ))}
          </section>

          <section
            className="sales-panel"
            aria-label="Søk og filtrering"
            style={{ marginBottom: 18 }}
          >
            <div
              style={{
                display: "flex",
                gap: 12,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <label
                style={{
                  position: "relative",
                  display: "block",
                  flex: "1 1 340px",
                  minWidth: 0,
                }}
              >
                <span className="sr-only">Søk i forespørsler, befaringer og tilbud</span>
                <Search
                  size={18}
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                    opacity: 0.65,
                  }}
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Søk kunde, adresse, e-post, telefon, saksnr., tittel eller ansvarlig"
                  style={{
                    width: "100%",
                    minHeight: 46,
                    padding: "10px 14px 10px 42px",
                    border: "1px solid #cbd5e1",
                    borderRadius: 12,
                    background: "#fff",
                    font: "inherit",
                  }}
                />
              </label>
            </div>

            <div style={{ marginTop: 14 }}>
              <strong style={{ display: "block", marginBottom: 7, fontSize: 13 }}>
                Tilbudstype
              </strong>
              <div
                role="tablist"
                aria-label="Tilbudstype"
                style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
              >
                {OFFER_TYPE_TABS.map((tab) => {
                  const selected = activeOfferType === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      onClick={() => setActiveOfferType(tab.id)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 7,
                        minHeight: 38,
                        padding: "7px 12px",
                        borderRadius: 999,
                        border: selected ? "1px solid #0f5265" : "1px solid #cbd5e1",
                        background: selected ? "#0f5265" : "#fff",
                        color: selected ? "#fff" : "#17313a",
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                    >
                      {tab.label}
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          minWidth: 23,
                          height: 23,
                          padding: "0 6px",
                          borderRadius: 999,
                          background: selected ? "rgba(255,255,255,0.18)" : "#f1f5f9",
                          fontSize: 12,
                        }}
                      >
                        {offerTypeCounts[tab.id] || 0}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              role="tablist"
              aria-label="Arbeidsstatus"
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                marginTop: 14,
              }}
            >
              {WORK_TABS.map((tab) => {
                const selected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                      minHeight: 38,
                      padding: "7px 12px",
                      borderRadius: 999,
                      border: selected ? "1px solid #0f5265" : "1px solid #cbd5e1",
                      background: selected ? "#0f5265" : "#fff",
                      color: selected ? "#fff" : "#17313a",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    {tab.label}
                    <span
                      aria-label={`${requestCounts[tab.id] || 0} saker`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minWidth: 23,
                        height: 23,
                        padding: "0 6px",
                        borderRadius: 999,
                        background: selected ? "rgba(255,255,255,0.18)" : "#f1f5f9",
                        fontSize: 12,
                      }}
                    >
                      {requestCounts[tab.id] || 0}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="sales-panel">
            <div className="sales-panel-header">
              <div>
                <h2 className="sales-panel-title">
                  {activeTypeLabel} · {WORK_TABS.find((tab) => tab.id === activeTab)?.label || "Salgssaker"}
                  {searchQuery.trim() ? ` · ${filteredRequests.length} treff` : ""}
                </h2>
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

              {!requestsLoading && !requestsLoadFailed && filteredRequests.length === 0 ? (
                <p className="sales-subtitle">{emptyListText}</p>
              ) : null}

              {filteredRequests.map((request) => {
                const Icon = iconMap[request.iconName] || ClipboardList;
                const offerFollowUp = getOfferFollowUpInfo(request);
                const archived = isArchivedRequest(request);
                const archiveBusy = archiveBusyId === request.id;
                const storeOffer = isStoreOfferRequest(request);

                return (
                  <div
                    key={request.id}
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "stretch",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      className="sales-request-card"
                      type="button"
                      onClick={() => onOpenRequest?.(request.id)}
                      style={{ flex: "1 1 520px", width: "auto", minWidth: 0 }}
                    >
                      <div className="sales-request-main">
                        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                          <h3 className="sales-request-title">{request.title}</h3>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              minHeight: 23,
                              padding: "2px 8px",
                              borderRadius: 999,
                              fontSize: 11,
                              fontWeight: 900,
                              background: storeOffer ? "#e8f9fb" : "#f1f5f9",
                              color: storeOffer ? "#0b737b" : "#475569",
                            }}
                          >
                            {storeOffer ? "Butikktilbud" : "Våtromstilbud"}
                          </span>
                        </div>
                        <p className="sales-request-customer">
                          {[request.customer, request.address, request.id]
                            .filter(Boolean)
                            .join(" · ")}
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

                            {offerFollowUp.shouldFollowUp && !archived ? (
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
                        <span className="sales-next-label">
                          {archived ? "Arkivert" : "Neste steg"}
                        </span>
                        <span className="sales-next-step">
                          <Icon size={16} />
                          {archived ? "Kan gjenopprettes" : request.nextStep}
                        </span>
                      </div>

                      <span className={`sales-status ${request.statusClass}`}>
                        {request.status}
                      </span>
                    </button>

                    {!supportMode ? (
                      <button
                        type="button"
                        disabled={archiveBusy}
                        onClick={() => toggleArchive(request)}
                        title={archived ? "Gjenopprett saken fra arkivet" : "Arkiver saken"}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 7,
                          flex: "0 0 auto",
                          minHeight: 44,
                          padding: "10px 13px",
                          border: "1px solid #cbd5e1",
                          borderRadius: 12,
                          background: archived ? "#effaf5" : "#fff",
                          color: archived ? "#166534" : "#334155",
                          fontWeight: 800,
                          cursor: archiveBusy ? "wait" : "pointer",
                          opacity: archiveBusy ? 0.65 : 1,
                        }}
                      >
                        {archived ? <RotateCcw size={17} /> : <Archive size={17} />}
                        {archiveBusy ? "Lagrer …" : archived ? "Gjenopprett" : "Arkiver"}
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>

          {filteredActivatedRequests.length > 0 ? (
            <section className="sales-panel">
              <div className="sales-panel-header">
                <div>
                  <h2 className="sales-panel-title">
                    Aktiverte prosjekter ({filteredActivatedRequests.length})
                  </h2>
                </div>
              </div>

              <div className="sales-request-list">
                {filteredActivatedRequests.map((request) => {
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
                          {[request.customer, request.address, request.id]
                            .filter(Boolean)
                            .join(" · ")}
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
