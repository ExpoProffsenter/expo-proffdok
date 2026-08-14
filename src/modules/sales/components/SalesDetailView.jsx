// Expo ProffDok – FASE 23L
// Presentasjonskomponent for intern saksdetalj i Befaring / Tilbud / Aksept.
// Ingen egen React-state, Supabase-kall, Storage-kall eller forretningslogikk.

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Download,
  FileText,
  Home,
  Mail,
  MapPin,
  Phone,
  Plus,
  Ruler,
  Send,
  Trash2,
  Upload,
} from "lucide-react";
import {
  formatInspectionDateTime,
  formatNok,
  getOfferTotal,
  getWorkflowSteps,
  sanitizeStoragePart,
} from "../utils/salesUtils.js";

export default function SalesDetailView({
  acceptanceProofBusy,
  acceptanceProofError,
  offerPdfBusy,
  offerPdfError,
  contractUploadBusy,
  contractUploadError,
  copyCustomerOfferLink,
  customerEmailBusy,
  customerEmailFeedback,
  customerLinkCopied,
  goToList,
  handleContractUpload,
  handleCreateAcceptanceProof,
  handleDownloadPublishedOfferPdf,
  handleCreateOfferRevisionAfterAcceptance,
  handleRemoveContract,
  loggedInResponsible,
  openCustomerOfferFromRequestId,
  openCustomerOfferPreview,
  openEditRequest,
  openInspectionNote,
  openOfferBuilder,
  openOutlookCalendar,
  openProjectActivation,
  openSurveyPlanning,
  publishFeedback,
  resendInspectionConfirmation,
  selectedInspectionPhoto,
  selectedRequest,
  sendOfferEmail,
  setSelectedInspectionPhoto,
  summary,
}) {
    const workflowSteps = getWorkflowSteps(selectedRequest);
    const customerAddress = [
      selectedRequest.address,
      [selectedRequest.postnr, selectedRequest.city].filter(Boolean).join(" "),
    ]
      .filter(Boolean)
      .join(", ");
    const hasPublishedCustomerOffer = Boolean(
      selectedRequest.publicToken ||
        selectedRequest.salesOfferId ||
        selectedRequest.sentOfferVersionId ||
        selectedRequest.sentOfferVersionNumber
    );
    const hasUnpublishedOfferChanges = Boolean(
      selectedRequest.status === "Tilbud" &&
        selectedRequest.offerLines?.length &&
        !selectedRequest.sentOfferVersionId
    );
    const customerOfferActionLabel = hasUnpublishedOfferChanges
      ? hasPublishedCustomerOffer
        ? "Publiser ny versjon"
        : "Publiser kundetilbud"
      : "Vis kundens tilbud";
    const publishLineCount = selectedRequest.offerLines?.length || 0;
    const publishOptionCount = selectedRequest.offerOptions?.length || 0;
    const publishedVersionNumber =
      publishFeedback?.requestId === selectedRequest.id
        ? Number(publishFeedback.versionNumber) || 0
        : Number(selectedRequest.sentOfferVersionNumber) || 0;
    const canDownloadPublishedOffer = Boolean(selectedRequest.publicToken);
    const publishedOfferDownloadLabel = hasUnpublishedOfferChanges
      ? "Last ned sist publiserte tilbud PDF"
      : publishedVersionNumber
        ? `Last ned tilbud PDF v${publishedVersionNumber}`
        : "Last ned tilbud PDF";
    const hasInspectionContent = Boolean(
      selectedRequest.inspectionCustomerWishes ||
        selectedRequest.inspectionExistingConditions ||
        selectedRequest.inspectionMeasurements ||
        selectedRequest.inspectionObservations ||
        selectedRequest.inspectionPhotos?.length
    );
    const currentAcceptedHistoryEntry = selectedRequest.acceptedAt
      ? {
          id: `current-accepted-offer-${selectedRequest.acceptedOfferVersionId || selectedRequest.acceptedAt}`,
          versionId:
            selectedRequest.acceptedOfferVersionId ||
            selectedRequest.sentOfferVersionId ||
            "",
          versionNumber:
            selectedRequest.acceptedOfferVersionNumber ||
            selectedRequest.sentOfferVersionNumber ||
            "",
          acceptedBy: selectedRequest.acceptedBy || "",
          acceptedAt: selectedRequest.acceptedAt || "",
          acceptedTotal: Number(selectedRequest.acceptedTotal || 0),
          selectedOptions: selectedRequest.acceptedOptions || [],
          lines:
            selectedRequest.acceptedOfferLines ||
            selectedRequest.offerLines ||
            [],
          acceptanceProofFile: selectedRequest.acceptanceProofFile || null,
        }
      : null;
    const acceptedOfferHistoryEntries = [
      ...(Array.isArray(selectedRequest.acceptedOfferHistory)
        ? selectedRequest.acceptedOfferHistory
        : []),
      ...(currentAcceptedHistoryEntry ? [currentAcceptedHistoryEntry] : []),
    ]
      .filter(
        (entry, index, entries) =>
          entries.findIndex(
            (candidate) =>
              String(candidate.versionId || candidate.versionNumber || "") ===
                String(entry.versionId || entry.versionNumber || "") &&
              String(candidate.acceptedAt || "") === String(entry.acceptedAt || "")
          ) === index
      )
      .sort(
        (left, right) =>
          new Date(right.acceptedAt || 0).getTime() -
          new Date(left.acceptedAt || 0).getTime()
      );
    const nextStepTitle = (() => {
      if (selectedRequest.status === "Forespørsel") return "Planlegg befaring";
      if (selectedRequest.status === "Befaring" && selectedRequest.nextStep === "Opprett tilbud") return "Opprett tilbud";
      if (selectedRequest.status === "Befaring") return "Fullfør befaringsnotat";
      if (selectedRequest.status === "Tilbud" && hasUnpublishedOfferChanges) {
        return hasPublishedCustomerOffer ? "Oppdater kundens tilbud" : "Publiser kundetilbud";
      }
      if (selectedRequest.status === "Tilbud") return "Kundetilbud er publisert";
      if (selectedRequest.status === "Akseptert") return "Klar for prosjektaktivering";
      if (selectedRequest.status === "Aktivert") return "Prosjekt aktivert";
      return selectedRequest.nextStep || "Neste steg";
    })();
    const nextStepHelp = (() => {
      if (selectedRequest.status === "Forespørsel") {
        return "Start med å sette dato, tidspunkt og ansvarlig. Saken flyttes da videre til Befaring.";
      }
      if (selectedRequest.status === "Befaring" && selectedRequest.nextStep === "Opprett tilbud") {
        return "Befaringen er registrert. Neste naturlige steg er å bygge tilbudet fra samme sak.";
      }
      if (selectedRequest.status === "Befaring") {
        return "Registrer kundens ønsker, eksisterende forhold, målinger, observasjoner og bilder.";
      }
      if (selectedRequest.status === "Tilbud" && hasUnpublishedOfferChanges) {
        return "Tilbudet er endret internt. Kunden ser ikke endringene før du publiserer en ny versjon av kundetilbudet.";
      }
      if (selectedRequest.status === "Tilbud") {
        return "Kundelinken er klar. Kunden kan åpne tilbudet, velge opsjoner og akseptere digitalt.";
      }
      if (selectedRequest.status === "Akseptert") {
        return "Kunden har akseptert tilbudet. Akseptert innhold låses i denne flyten før senere prosjektaktivering.";
      }
      if (selectedRequest.status === "Aktivert") {
        return "Saken er ferdig aktivert. Prosjektet og overførte dokumenter kan åpnes direkte i den ordinære ProffDok-prosjektlisten.";
      }
      return "Følg neste tydelige handling i saken.";
    })();

    return (
      <div className="sales-app">
        <div className="sales-shell">
          <header className="sales-header">
            <button className="sales-back-button" type="button" onClick={goToList}>
              <ArrowLeft size={18} />
              Tilbake
            </button>

            <div className="sales-brand sales-brand-compact">
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
            <section className="sales-detail-hero">
              <div>
                <span className={`sales-status ${selectedRequest.statusClass}`}>
                  {selectedRequest.status}
                </span>
                <h1 className="sales-title">{selectedRequest.title}</h1>
                <p className="sales-subtitle">
                  {selectedRequest.customer} · {customerAddress || "Adresse ikke registrert"} · {selectedRequest.id}
                </p>

                {selectedRequest.surveyDate ? (
                  <div
                    className="sales-detail-lines"
                    style={{ marginTop: 14, gap: 8 }}
                    aria-label="Avtalt befaring"
                  >
                    <span>
                      <CalendarDays size={16} />
                      <strong>Befaring avtalt:</strong>{" "}
                      {formatInspectionDateTime(
                        selectedRequest.surveyDate,
                        selectedRequest.surveyTime
                      )}
                    </span>
                    {selectedRequest.surveyResponsible ? (
                      <span>
                        <CheckCircle2 size={16} />
                        <strong>Prosjektansvarlig:</strong>{" "}
                        {loggedInResponsible}
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <div className="sales-hero-actions">
                {["Forespørsel", "Befaring", "Tilbud"].includes(selectedRequest.status) ? (
                  <button
                    className="sales-secondary-button"
                    type="button"
                    onClick={openEditRequest}
                  >
                    <ClipboardList size={18} />
                    {selectedRequest.status === "Tilbud"
                      ? "Rediger kunde"
                      : "Rediger forespørsel"}
                  </button>
                ) : null}

                {selectedRequest.status === "Befaring" ? (
                  <button
                    className="sales-secondary-button"
                    type="button"
                    onClick={openSurveyPlanning}
                  >
                    <CalendarDays size={18} />
                    Rediger befaring
                  </button>
                ) : null}

                {selectedRequest.surveyDate &&
                !["Akseptert", "Aktivert"].includes(selectedRequest.status) ? (
                  <button
                    className="sales-secondary-button"
                    type="button"
                    onClick={() => openOutlookCalendar(selectedRequest)}
                  >
                    <CalendarDays size={18} />
                    Legg til i Outlook
                  </button>
                ) : null}

                {selectedRequest.status === "Tilbud" ? (
                  <button
                    className="sales-secondary-button"
                    type="button"
                    onClick={openInspectionNote}
                  >
                    <Ruler size={18} />
                    Befaringsnotat
                  </button>
                ) : null}

                {selectedRequest.status === "Tilbud" ? (
                  <button
                    className="sales-secondary-button"
                    type="button"
                    onClick={openOfferBuilder}
                  >
                    <ClipboardList size={18} />
                    Rediger tilbud
                  </button>
                ) : null}

                <button
                  className="sales-primary-button"
                  type="button"
                  onClick={
                    selectedRequest.status === "Forespørsel"
                      ? openSurveyPlanning
                      : selectedRequest.status === "Befaring" &&
                          selectedRequest.nextStep === "Opprett tilbud"
                        ? openOfferBuilder
                        : selectedRequest.status === "Befaring"
                          ? openInspectionNote
                          : selectedRequest.status === "Tilbud"
                            ? openCustomerOfferPreview
                            : selectedRequest.status === "Akseptert"
                              ? openProjectActivation
                              : selectedRequest.status === "Aktivert" && selectedRequest.projectId
                                ? () => window.location.assign(
                                    `${window.location.pathname}?project=${encodeURIComponent(selectedRequest.projectId)}&access=admin&tab=prosjekt`
                                  )
                                : undefined
                  }
                >
                  <CalendarDays size={18} />
                  {selectedRequest.status === "Tilbud"
                    ? customerOfferActionLabel
                    : selectedRequest.status === "Akseptert"
                      ? "Aktiver som prosjekt"
                      : selectedRequest.nextStep}
                </button>
              </div>
            </section>

            <section className="sales-workflow" aria-label="Arbeidsflyt">
              {workflowSteps.map((step) => (
                <div className={`sales-workflow-step sales-workflow-${step.state}`} key={step.label}>
                  <span className="sales-workflow-dot">
                    {step.state === "done" ? <CheckCircle2 size={16} /> : null}
                  </span>
                  <span>{step.label}</span>
                </div>
              ))}
            </section>

            <section className="sales-detail-grid">
              <article className="sales-detail-card">
                <h2>Kunde</h2>
                <div className="sales-detail-lines">
                  <span>{selectedRequest.customer}</span>
                  <span>
                    <Phone size={16} />
                    {selectedRequest.phone || "Telefon ikke registrert"}
                  </span>
                  <span>
                    <Mail size={16} />
                    {selectedRequest.email || "E-post ikke registrert"}
                  </span>
                </div>
              </article>

              <article className="sales-detail-card">
                <h2>Sted og opprinnelse</h2>
                <div className="sales-detail-lines">
                  <span>
                    <MapPin size={16} />
                    {customerAddress || "Adresse ikke registrert"}
                  </span>
                  <span>
                    <ClipboardList size={16} />
                    Kom via {selectedRequest.source || "ikke registrert"}
                  </span>
                </div>
              </article>

              <article className="sales-detail-card sales-detail-card-wide">
                <h2>Notat</h2>
                <p>{selectedRequest.note || "Ingen notat registrert ennå."}</p>
              </article>

              <article className="sales-next-card sales-detail-card-wide">
                <span className="sales-next-label">Neste steg</span>
                <h2>{nextStepTitle}</h2>
                <p style={{ marginBottom: 16 }}>{nextStepHelp}</p>
                {customerEmailFeedback ? (
                  <div
                    style={{
                      marginBottom: 16,
                      padding: "14px 16px",
                      border: customerEmailFeedback.type === "success" ? "1px solid #8be4e8" : "1px solid #e8aaaa",
                      borderRadius: 16,
                      background: customerEmailFeedback.type === "success" ? "#e9fafb" : "#fff3f3",
                      fontWeight: 800,
                    }}
                  >
                    {customerEmailFeedback.text}
                  </div>
                ) : null}
                {selectedRequest.status === "Tilbud" ? (
                  <div
                    style={{
                      marginBottom: 16,
                      padding: "14px 16px",
                      border: "1px solid #d7e4ea",
                      borderRadius: 16,
                      background: "#f8fbfc",
                      fontWeight: 700,
                      lineHeight: 1.5,
                    }}
                  >
                    Tilbudslinjer: {publishLineCount} · Opsjoner:{" "}
                    {publishOptionCount} ·{" "}
                    {hasUnpublishedOfferChanges
                      ? publishedVersionNumber
                        ? `Neste publisering oppretter ny versjon etter v${publishedVersionNumber}`
                        : "Neste publisering oppretter ny tilbudsversjon"
                      : publishedVersionNumber
                        ? `Publisert versjon v${publishedVersionNumber}`
                        : "Ikke publisert"}
                  </div>
                ) : null}
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                    marginBottom: 18,
                  }}
                >
                  {selectedRequest.status === "Forespørsel" ? (
                    <button className="sales-primary-button" type="button" onClick={openSurveyPlanning}>
                      <CalendarDays size={18} />
                      Planlegg befaring
                    </button>
                  ) : null}

                  {selectedRequest.status === "Befaring" ? (
                    <>
                      <button
                        className="sales-primary-button"
                        type="button"
                        onClick={selectedRequest.nextStep === "Opprett tilbud" ? openOfferBuilder : openInspectionNote}
                      >
                        {selectedRequest.nextStep === "Opprett tilbud" ? <ClipboardList size={18} /> : <Ruler size={18} />}
                        {selectedRequest.nextStep === "Opprett tilbud" ? "Opprett tilbud" : "Fullfør befaringsnotat"}
                      </button>
                      {selectedRequest.surveyDate && selectedRequest.email ? (
                        <button
                          className="sales-secondary-button"
                          type="button"
                          disabled={customerEmailBusy}
                          onClick={() => resendInspectionConfirmation(selectedRequest)}
                        >
                          <Mail size={18} />
                          {customerEmailBusy
                            ? "Sender …"
                            : selectedRequest.surveyConfirmationSentAt
                              ? "Send bekreftelse på nytt"
                              : "Send befaringsbekreftelse"}
                        </button>
                      ) : null}
                    </>
                  ) : null}

                  {selectedRequest.status === "Tilbud" ? (
                    <>
                      <button
                        className={hasUnpublishedOfferChanges ? "sales-primary-button" : "sales-secondary-button"}
                        type="button"
                        onClick={() => openCustomerOfferFromRequestId(selectedRequest.id)}
                      >
                        <Send size={18} />
                        {customerOfferActionLabel}
                      </button>
                      <button className="sales-secondary-button" type="button" onClick={openOfferBuilder}>
                        <ClipboardList size={18} />
                        Rediger tilbud
                      </button>
                      <button className="sales-secondary-button" type="button" onClick={openInspectionNote}>
                        <Ruler size={18} />
                        {hasInspectionContent ? "Se befaringsnotat" : "Legg til befaringsnotat"}
                      </button>
                    </>
                  ) : null}

                  {selectedRequest.status === "Akseptert" ? (
                    <>
                      <button className="sales-primary-button" type="button" onClick={openProjectActivation}>
                        <Home size={18} />
                        Aktiver som prosjekt
                      </button>
                      <button
                        className="sales-secondary-button"
                        type="button"
                        onClick={handleCreateOfferRevisionAfterAcceptance}
                      >
                        <Plus size={18} />
                        Opprett ny tilbudsversjon
                      </button>
                    </>
                  ) : null}
                </div>
                {selectedRequest.status === "Aktivert" &&
                selectedRequest.projectActivatedAt ? (
                  <div className="sales-detail-lines">
                    <span>
                      <Home size={16} />
                      Aktivert som prosjekt: {selectedRequest.projectName}
                    </span>
                    {selectedRequest.projectNumber ? (
                      <span>
                        <ClipboardList size={16} />
                        Prosjektnummer: {selectedRequest.projectNumber}
                      </span>
                    ) : null}
                    {selectedRequest.projectResponsible ? (
                      <span>
                        <CheckCircle2 size={16} />
                        Ansvarlig: {selectedRequest.projectResponsible}
                      </span>
                    ) : null}
                    <p>
                      Aktivert{" "}
                      {new Date(selectedRequest.projectActivatedAt).toLocaleString(
                        "nb-NO"
                      )}.
                    </p>
                    <p>Prosjektet er opprettet i den ordinære ProffDok-prosjektlisten.</p>
                    {selectedRequest.projectId ? (
                      <button
                        className="sales-primary-button"
                        type="button"
                        style={{ alignSelf: "flex-start", marginTop: 8 }}
                        onClick={() =>
                          window.location.assign(
                            `${window.location.pathname}?project=${encodeURIComponent(selectedRequest.projectId)}&access=admin&tab=prosjekt`
                          )
                        }
                      >
                        <Home size={18} />
                        Åpne ProffDok-prosjekt
                      </button>
                    ) : null}
                  </div>
                ) : selectedRequest.status === "Akseptert" &&
                selectedRequest.acceptedBy ? (
                  <div className="sales-detail-lines">
                    <span>
                      <CheckCircle2 size={16} />
                      Akseptert av {selectedRequest.acceptedBy}
                    </span>
                    <p>
                      Digital aksept registrert{" "}
                      {new Date(selectedRequest.acceptedAt).toLocaleString("nb-NO")}.
                    </p>
                    {selectedRequest.acceptedOfferVersionNumber ? (
                      <p>
                        Aksepten gjelder tilbudsversjon v
                        {selectedRequest.acceptedOfferVersionNumber}.
                      </p>
                    ) : null}
                    {(selectedRequest.acceptedOfferLines?.length ||
                      selectedRequest.offerLines?.length) ? (
                      <div style={{ marginTop: 14 }}>
                        <p><strong>Aksepterte arbeider og priser:</strong></p>
                        <div style={{ display: "grid", gap: 8, maxWidth: 720 }}>
                          {(
                            selectedRequest.acceptedOfferLines ||
                            selectedRequest.offerLines ||
                            []
                          ).map((line, index) => (
                            <div
                              key={line.id}
                              style={{
                                display: "grid",
                                gridTemplateColumns: "28px 1fr minmax(140px, auto)",
                                gap: 10,
                                alignItems: "center",
                              }}
                            >
                              <ClipboardList size={16} />
                              <div>
                                <span>
                                  {index + 1}. {line.description}
                                </span>
                                {line.imageDataUrl || line.productUrl ? (
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: 10,
                                      alignItems: "center",
                                      marginTop: 8,
                                      flexWrap: "wrap",
                                    }}
                                  >
                                    {line.imageDataUrl ? (
                                      <img
                                        src={line.imageDataUrl}
                                        alt={line.imageName || line.description || "Produktbilde"}
                                        style={{
                                          width: 72,
                                          height: 72,
                                          objectFit: "cover",
                                          borderRadius: 10,
                                          border: "1px solid #d7e4ea",
                                        }}
                                      />
                                    ) : null}
                                    {line.productUrl ? (
                                      <a
                                        href={line.productUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                      >
                                        Se produkt / dokumentasjon
                                      </a>
                                    ) : null}
                                  </div>
                                ) : null}
                              </div>
                              <strong style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                                {formatNok(getOfferTotal([line]))} eks. mva.
                              </strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {selectedRequest.acceptedOptions?.length ? (
                      <div style={{ marginTop: 18 }}>
                        <p><strong>Valgte opsjoner:</strong></p>
                        <div style={{ display: "grid", gap: 8, maxWidth: 720 }}>
                          {selectedRequest.acceptedOptions.map((option) => (
                            <div
                              key={option.id}
                              style={{
                                display: "grid",
                                gridTemplateColumns: "28px 1fr minmax(140px, auto)",
                                gap: 10,
                                alignItems: "center",
                              }}
                            >
                              <Plus size={16} />
                              <div>
                                <span>{option.title || "Opsjon"}</span>
                                {option.description ? (
                                  <p style={{ margin: "4px 0 0" }}>{option.description}</p>
                                ) : null}
                                {option.imageDataUrl || option.productUrl ? (
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: 10,
                                      alignItems: "center",
                                      marginTop: 8,
                                      flexWrap: "wrap",
                                    }}
                                  >
                                    {option.imageDataUrl ? (
                                      <img
                                        src={option.imageDataUrl}
                                        alt={option.imageName || option.title || "Opsjon"}
                                        style={{
                                          width: 72,
                                          height: 72,
                                          objectFit: "cover",
                                          borderRadius: 10,
                                          border: "1px solid #d7e4ea",
                                        }}
                                      />
                                    ) : null}
                                    {option.productUrl ? (
                                      <a
                                        href={option.productUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                      >
                                        Se produkt / dokumentasjon
                                      </a>
                                    ) : null}
                                  </div>
                                ) : null}
                              </div>
                              <strong style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                                {formatNok(getOfferTotal([option]))} eks. mva.
                              </strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {selectedRequest.acceptedTotal ? (
                      <div
                        style={{
                          marginTop: 14,
                          paddingTop: 14,
                          borderTop: "1px solid #d7e4ea",
                          maxWidth: 430,
                          marginLeft: "auto",
                        }}
                      >
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr minmax(130px, auto)",
                            gap: 18,
                            alignItems: "center",
                          }}
                        >
                          <span>Akseptert sum eks. mva.</span>
                          <strong style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                            {formatNok(selectedRequest.acceptedTotal)}
                          </strong>
                        </div>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr minmax(130px, auto)",
                            gap: 18,
                            alignItems: "center",
                            marginTop: 6,
                          }}
                        >
                          <span>Akseptert sum inkl. mva.</span>
                          <strong style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                            {formatNok(selectedRequest.acceptedTotal * 1.25)}
                          </strong>
                        </div>
                      </div>
                    ) : null}
                    <div
                      style={{
                        marginTop: 20,
                        padding: 18,
                        border: "1px solid #b9d9df",
                        borderRadius: 16,
                        background: "#f2fafb",
                      }}
                    >
                      <p style={{ margin: "0 0 6px" }}>
                        <strong>Låst akseptbevis</strong>
                      </p>
                      <p style={{ margin: "0 0 14px" }}>
                        PDF-en dokumenterer tilbudsversjonen, aksepttidspunktet,
                        akseptert total, valgte opsjoner og alle avtalebetingelser.
                      </p>
                      {selectedRequest.acceptanceProofFile?.url ? (
                        <div>
                          <p style={{ margin: "0 0 12px", color: "#176b42", fontWeight: 800 }}>
                            Akseptbeviset er opprettet og lagret. Trykk på knappen under for å åpne PDF-en.
                          </p>
                          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                          <a
                            className="sales-primary-button"
                            href={selectedRequest.acceptanceProofFile.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FileText size={18} />
                            Åpne PDF i ny fane
                          </a>
                          <a
                            className="sales-secondary-button"
                            href={selectedRequest.acceptanceProofFile.url}
                            download={
                              selectedRequest.acceptanceProofFile.name ||
                              `Akseptbevis-${sanitizeStoragePart(selectedRequest.id)}.pdf`
                            }
                          >
                            <Download size={18} />
                            Last ned PDF
                          </a>
                          <span style={{ color: "#42606b", fontWeight: 700 }}>
                            Låst dokument - følger automatisk med til prosjektet.
                          </span>
                          </div>
                        </div>
                      ) : (
                        <button
                          className="sales-primary-button"
                          type="button"
                          onClick={handleCreateAcceptanceProof}
                          disabled={acceptanceProofBusy}
                        >
                          <FileText size={18} />
                          {acceptanceProofBusy ? "Oppretter akseptbevis …" : "Opprett akseptbevis"}
                        </button>
                      )}
                      {acceptanceProofError ? (
                        <p style={{ margin: "12px 0 0", color: "#a83232", fontWeight: 700 }}>
                          {acceptanceProofError}
                        </p>
                      ) : null}
                    </div>
                    <div
                      style={{
                        marginTop: 20,
                        padding: 18,
                        border: "1px solid #d7e4ea",
                        borderRadius: 16,
                        background: "#f8fbfc",
                      }}
                    >
                      <p style={{ margin: "0 0 6px" }}>
                        <strong>Kontrakt</strong>
                      </p>
                      <p style={{ margin: "0 0 14px" }}>
                        Håndverksbedriften kan laste opp sin egen ferdigstilte kontrakt.
                        Sluttkunden skal kontrollere og signere kontrakten etter bedriftens
                        vanlige rutiner.
                      </p>
                      {selectedRequest.contractFile ? (
                        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                          <a
                            className="sales-secondary-button"
                            href={selectedRequest.contractFile.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <FileText size={18} />
                            Åpne {selectedRequest.contractFile.name || "kontrakt"}
                          </a>
                          <button
                            className="sales-secondary-button"
                            type="button"
                            onClick={handleRemoveContract}
                            disabled={contractUploadBusy}
                          >
                            <Trash2 size={18} />
                            Fjern kontrakt
                          </button>
                          <span style={{ color: "#42606b", fontWeight: 700 }}>
                            Kontrakten følger automatisk med til ProffDok-prosjektet.
                          </span>
                        </div>
                      ) : (
                        <label
                          className="sales-secondary-button"
                          style={{ display: "inline-flex", cursor: contractUploadBusy ? "wait" : "pointer" }}
                        >
                          <Upload size={18} />
                          {contractUploadBusy ? "Laster opp kontrakt …" : "Last opp egen kontrakt"}
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            onChange={handleContractUpload}
                            disabled={contractUploadBusy}
                            style={{ display: "none" }}
                          />
                        </label>
                      )}
                      {contractUploadError ? (
                        <p style={{ margin: "12px 0 0", color: "#a83232", fontWeight: 700 }}>
                          {contractUploadError}
                        </p>
                      ) : null}
                    </div>
                    <p>
                      Neste steg er å aktivere saken som et vanlig ProffDok-prosjekt.
                    </p>
                    <p>
                      Aksepten er låst i denne arbeidsflyten. Eventuelle endringer
                      skal senere håndteres som revidert tilbud / ny tilbudsversjon,
                      ikke ved å overskrive akseptert tilbud.
                    </p>
                  </div>
                ) : selectedRequest.status === "Tilbud" &&
                selectedRequest.offerLines?.length ? (
                  <div className="sales-detail-lines">
                    <p><strong>{selectedRequest.offerTitle}</strong></p>

                    <div
                      style={{
                        marginTop: 14,
                        marginBottom: 16,
                        padding: 14,
                        border: "1px solid #d7e4ea",
                        borderRadius: 16,
                        background: "#f8fbfc",
                      }}
                    >
                      <p style={{ marginBottom: 10 }}>
                        <strong>
                          {hasUnpublishedOfferChanges
                            ? hasPublishedCustomerOffer
                              ? "Revidert tilbud klart for publisering:"
                              : "Kundetilbud klart for publisering:"
                            : "Kundelink:"}
                        </strong>{" "}
                        {hasUnpublishedOfferChanges
                          ? "Publiser for å lage en ny tilbudsversjon på kundelinken. Kunden ser ikke endringene før dette er gjort."
                          : "Kunden åpner tilbudet via egen lenke og kan velge opsjoner og akseptere digitalt."}
                      </p>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <button
                          className={
                            hasUnpublishedOfferChanges
                              ? "sales-primary-button"
                              : "sales-secondary-button"
                          }
                          type="button"
                          onClick={() =>
                            openCustomerOfferFromRequestId(selectedRequest.id)
                          }
                        >
                          <Send size={18} />
                          {hasUnpublishedOfferChanges
                            ? hasPublishedCustomerOffer
                              ? "Publiser ny versjon"
                              : "Publiser kundetilbud"
                            : "Åpne kundelink"}
                        </button>
                        <button
                          className="sales-secondary-button"
                          type="button"
                          onClick={() => copyCustomerOfferLink(selectedRequest.id)}
                        >
                          <ClipboardList size={18} />
                          {customerLinkCopied
                            ? "Kopiert"
                            : hasUnpublishedOfferChanges
                              ? "Publiser og kopier lenke"
                              : "Kopier kundelink"}
                        </button>
                        <button
                          className="sales-primary-button"
                          type="button"
                          disabled={customerEmailBusy || !selectedRequest.email}
                          onClick={() =>
                            sendOfferEmail(selectedRequest.id, {
                              publishFirst: hasUnpublishedOfferChanges,
                            })
                          }
                        >
                          <Mail size={18} />
                          {customerEmailBusy
                            ? "Sender …"
                            : hasUnpublishedOfferChanges
                              ? "Publiser og send e-post"
                              : selectedRequest.offerEmailSentAt
                                ? "Send tilbudet på nytt"
                                : "Send tilbud på e-post"}
                        </button>
                      </div>

                      {customerEmailFeedback ? (
                        <div
                          style={{
                            marginTop: 14,
                            padding: "14px 16px",
                            border: customerEmailFeedback.type === "success" ? "1px solid #8be4e8" : "1px solid #e8aaaa",
                            borderRadius: 16,
                            background: customerEmailFeedback.type === "success" ? "#e9fafb" : "#fff3f3",
                            fontWeight: 800,
                          }}
                        >
                          {customerEmailFeedback.text}
                        </div>
                      ) : null}

                      {publishFeedback?.requestId === selectedRequest.id ? (
                        <div
                          style={{
                            marginTop: 14,
                            padding: "14px 16px",
                            border: "1px solid #8be4e8",
                            borderRadius: 16,
                            background: "#e9fafb",
                          }}
                        >
                          <p style={{ margin: 0, fontWeight: 900, color: "#087b82" }}>
                            Ny tilbudsversjon er publisert
                          </p>
                          <p style={{ margin: "5px 0 0" }}>
                            Kundelinken er oppdatert.
                            {publishFeedback.versionNumber
                              ? ` Versjon v${publishFeedback.versionNumber} er nå tilgjengelig for kunden.`
                              : " Nyeste tilbud er nå tilgjengelig for kunden."}
                          </p>
                        </div>
                      ) : null}

                      <div
                        style={{
                          marginTop: 14,
                          padding: "16px 16px",
                          border: "1px solid #e4c86b",
                          borderRadius: 16,
                          background: "#fffbea",
                        }}
                      >
                        <p style={{ margin: "0 0 6px", fontWeight: 900, color: "#6f5600" }}>
                          Viktig – lagre tilbudet i eget arkiv
                        </p>
                        <p style={{ margin: "0 0 12px", lineHeight: 1.55 }}>
                          Expo ProffDok lagrer tilbudsdata som del av tjenesten, men permanent dokumentlagring kan ikke garanteres. Last ned den publiserte tilbuds-PDF-en og arkiver den i bedriftens eget dokumentarkiv.
                        </p>
                        {hasUnpublishedOfferChanges && hasPublishedCustomerOffer ? (
                          <p style={{ margin: "0 0 12px", color: "#7a650f", fontWeight: 700 }}>
                            Tilbudet har upubliserte endringer. Knappen under laster derfor ned sist publiserte kundeversjon.
                          </p>
                        ) : !canDownloadPublishedOffer ? (
                          <p style={{ margin: "0 0 12px", color: "#7a650f", fontWeight: 700 }}>
                            Publiser kundetilbudet først. Deretter kan PDF-en lastes ned.
                          </p>
                        ) : null}
                        <button
                          className="sales-secondary-button"
                          type="button"
                          onClick={handleDownloadPublishedOfferPdf}
                          disabled={!canDownloadPublishedOffer || offerPdfBusy}
                        >
                          <Download size={18} />
                          {offerPdfBusy ? "Oppretter tilbuds-PDF …" : publishedOfferDownloadLabel}
                        </button>
                        {offerPdfError ? (
                          <p style={{ margin: "12px 0 0", color: "#a83232", fontWeight: 700 }}>
                            {offerPdfError}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gap: 10,
                        maxWidth: 720,
                      }}
                    >
                      {selectedRequest.offerLines.map((line, index) => (
                        <div
                          key={line.id}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "28px 1fr minmax(140px, auto)",
                            gap: 10,
                            alignItems: "start",
                          }}
                        >
                          <ClipboardList size={16} />
                          <span>
                            {index + 1}. {line.description}
                          </span>
                          <strong style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                            {formatNok(getOfferTotal([line]))} eks. mva.
                          </strong>
                        </div>
                      ))}
                    </div>

                    <div
                      style={{
                        marginTop: 18,
                        paddingTop: 14,
                        borderTop: "1px solid #d7e4ea",
                        maxWidth: 430,
                        marginLeft: "auto",
                      }}
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr minmax(130px, auto)",
                          gap: 18,
                          alignItems: "center",
                        }}
                      >
                        <span>Sum eks. mva.</span>
                        <strong style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                          {formatNok(selectedRequest.offerTotal || 0)}
                        </strong>
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr minmax(130px, auto)",
                          gap: 18,
                          alignItems: "center",
                          marginTop: 6,
                        }}
                      >
                        <span>Sum inkl. mva.</span>
                        <strong style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                          {formatNok((selectedRequest.offerTotal || 0) * 1.25)}
                        </strong>
                      </div>
                    </div>

                    {selectedRequest.offerOptions?.length ? (
                      <p>
                        <strong>Opsjoner:</strong>{" "}
                        {selectedRequest.offerOptions.length} opsjon(er) registrert.
                        Kunden velger opsjoner i kundevisningen før aksept.
                      </p>
                    ) : null}
                  </div>
                ) : selectedRequest.inspectionCustomerWishes ||
                selectedRequest.inspectionExistingConditions ||
                selectedRequest.inspectionMeasurements ||
                selectedRequest.inspectionObservations ||
                selectedRequest.inspectionPhotos?.length ? (
                  <div className="sales-detail-lines">
                    {selectedRequest.inspectionCustomerWishes ? (
                      <p><strong>Kundens ønsker:</strong> {selectedRequest.inspectionCustomerWishes}</p>
                    ) : null}
                    {selectedRequest.inspectionExistingConditions ? (
                      <p><strong>Eksisterende forhold:</strong> {selectedRequest.inspectionExistingConditions}</p>
                    ) : null}
                    {selectedRequest.inspectionMeasurements ? (
                      <p><strong>Målinger:</strong> {selectedRequest.inspectionMeasurements}</p>
                    ) : null}
                    {selectedRequest.inspectionObservations ? (
                      <p><strong>Faglige observasjoner:</strong> {selectedRequest.inspectionObservations}</p>
                    ) : null}
                    {(selectedRequest.inspectionPhotos || []).length ? (
                      <div style={{ marginTop: 10 }}>
                        <strong>
                          {(selectedRequest.inspectionPhotos || []).length} befaringsbilde(r)
                        </strong>
                        <div
                          className="sales-photo-grid"
                          style={{ marginTop: 10 }}
                          aria-label="Befaringsbilder"
                        >
                          {(selectedRequest.inspectionPhotos || []).map((photo, index) => (
                            <button
                              key={photo.id || photo.path || index}
                              type="button"
                              className="sales-photo-card"
                              onClick={() => setSelectedInspectionPhoto(photo)}
                              disabled={!photo.dataUrl}
                              aria-label={`Åpne befaringsbilde ${index + 1} i stor visning`}
                              style={{
                                padding: 0,
                                border: "1px solid #d7e4ea",
                                borderRadius: 14,
                                overflow: "hidden",
                                cursor: photo.dataUrl ? "zoom-in" : "not-allowed",
                                background: "#f8fbfc",
                              }}
                            >
                              {photo.dataUrl ? (
                                <img
                                  src={photo.dataUrl}
                                  alt={photo.name || `Befaringsbilde ${index + 1}`}
                                  loading="lazy"
                                  style={{ display: "block", width: "100%", height: 150, objectFit: "cover" }}
                                />
                              ) : (
                                <span style={{ display: "grid", minHeight: 120, placeItems: "center", padding: 12 }}>
                                  Bildet kunne ikke lastes inn
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                        <p className="sales-subtitle" style={{ margin: "8px 0 0" }}>
                          Trykk på et bilde for å se det i stor størrelse.
                        </p>
                      </div>
                    ) : null}
                  </div>
                ) : selectedRequest.status === "Befaring" &&
                  selectedRequest.surveyDate ? (
                  <div className="sales-detail-lines">
                    <span>
                      <CalendarDays size={16} />
                      {formatInspectionDateTime(
                        selectedRequest.surveyDate,
                        selectedRequest.surveyTime
                      )}
                    </span>
                    <span>
                      <CheckCircle2 size={16} />
                      Prosjektansvarlig: {loggedInResponsible}
                    </span>
                    {selectedRequest.surveyNote ? (
                      <p>{selectedRequest.surveyNote}</p>
                    ) : null}
                  </div>
                ) : (
                  <p>
                    Registrer dato, tidspunkt, ansvarlig og en kort intern merknad.
                    Når planen lagres flyttes saken til Befaring.
                  </p>
                )}
              </article>

              {acceptedOfferHistoryEntries.length ? (
                <article className="sales-detail-card sales-detail-card-wide">
                  <h2>Tilbuds- og aksepthistorikk</h2>
                  <p style={{ marginTop: 0 }}>
                    Aksepterte versjoner er skrivebeskyttet og beholdes som
                    dokumentasjon selv om det senere opprettes et revidert tilbud.
                  </p>
                  <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
                    {acceptedOfferHistoryEntries.map((entry, index) => {
                      const optionCount = Array.isArray(entry.selectedOptions)
                        ? entry.selectedOptions.length
                        : 0;
                      const lineCount = Array.isArray(entry.lines)
                        ? entry.lines.length
                        : 0;
                      const versionLabel = entry.versionNumber
                        ? `v${entry.versionNumber}`
                        : "Ukjent versjon";

                      return (
                        <details
                          key={entry.id || `${entry.versionId}-${entry.acceptedAt}-${index}`}
                          open={index === 0}
                          style={{
                            border: "1px solid #d7e4ea",
                            borderRadius: 16,
                            background: "#f8fbfc",
                            padding: "14px 16px",
                          }}
                        >
                          <summary
                            style={{
                              cursor: "pointer",
                              fontWeight: 900,
                              color: "#183744",
                            }}
                          >
                            Tilbud {versionLabel} · {formatNok(entry.acceptedTotal || 0)} eks. mva.
                          </summary>
                          <div className="sales-detail-lines" style={{ marginTop: 14 }}>
                            <span>
                              <CheckCircle2 size={16} />
                              Akseptert av {entry.acceptedBy || "kunde"}
                            </span>
                            <p style={{ margin: 0 }}>
                              {entry.acceptedAt
                                ? new Date(entry.acceptedAt).toLocaleString("nb-NO")
                                : "Aksepttidspunkt ikke registrert"}
                            </p>
                            <p style={{ margin: 0 }}>
                              {lineCount} tilbudspost{lineCount === 1 ? "" : "er"} · {optionCount} valgt{optionCount === 1 ? "" : "e"} opsjon{optionCount === 1 ? "" : "er"}
                            </p>
                            <p style={{ margin: 0 }}>
                              <strong>Sum inkl. mva.:</strong>{" "}
                              {formatNok(Number(entry.acceptedTotal || 0) * 1.25)}
                            </p>
                            {entry.acceptanceProofFile?.url ? (
                              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 6 }}>
                                <a
                                  className="sales-secondary-button"
                                  href={entry.acceptanceProofFile.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <FileText size={18} />
                                  Åpne akseptbevis
                                </a>
                                <a
                                  className="sales-secondary-button"
                                  href={entry.acceptanceProofFile.url}
                                  download={
                                    entry.acceptanceProofFile.name ||
                                    `Akseptbevis-${sanitizeStoragePart(selectedRequest.id)}-${sanitizeStoragePart(versionLabel)}.pdf`
                                  }
                                >
                                  <Download size={18} />
                                  Last ned PDF
                                </a>
                              </div>
                            ) : (
                              <p style={{ margin: "6px 0 0", color: "#6b4f00", fontWeight: 700 }}>
                                Aksepten er lagret, men denne versjonen har ikke et eget PDF-bevis.
                              </p>
                            )}
                          </div>
                        </details>
                      );
                    })}
                  </div>
                </article>
              ) : null}
            </section>
          </main>
        </div>
        {selectedInspectionPhoto?.dataUrl ? (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Befaringsbilde i stor visning"
            onClick={() => setSelectedInspectionPhoto(null)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              display: "grid",
              placeItems: "center",
              padding: 20,
              background: "rgba(5, 19, 27, 0.88)",
            }}
          >
            <button
              type="button"
              onClick={() => setSelectedInspectionPhoto(null)}
              aria-label="Lukk bilde"
              style={{
                position: "fixed",
                top: 16,
                right: 16,
                width: 44,
                height: 44,
                border: 0,
                borderRadius: 999,
                background: "#ffffff",
                color: "#132733",
                fontSize: 28,
                lineHeight: 1,
                cursor: "pointer",
              }}
            >
              ×
            </button>
            <img
              src={selectedInspectionPhoto.dataUrl}
              alt={selectedInspectionPhoto.name || "Befaringsbilde"}
              onClick={(event) => event.stopPropagation()}
              style={{
                display: "block",
                maxWidth: "min(1200px, 96vw)",
                maxHeight: "90vh",
                objectFit: "contain",
                borderRadius: 14,
                boxShadow: "0 24px 70px rgba(0, 0, 0, 0.38)",
              }}
            />
          </div>
        ) : null}
      </div>
    );
  
}
