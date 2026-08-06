// Expo ProffDok - FASE 23J
// Presentasjonskomponent for planlegging og oppdatering av befaring.
// Ingen React-state, Supabase-kall, Storage-kall eller forretningslogikk.

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  MapPin,
  Save,
} from "lucide-react";
import { formatInspectionDateTime } from "../utils/salesUtils.js";

export default function SalesSurveyPlan({
  selectedRequest,
  surveyForm,
  loggedInResponsible = "",
  customerEmailBusy = false,
  onBack,
  onSubmit,
  onUpdateSurveyForm,
}) {
  return (
    <div className="sales-app">
      <div className="sales-shell">
        <header className="sales-header">
          <button
            className="sales-back-button"
            type="button"
            onClick={onBack}
          >
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
          <section className="sales-form-hero">
            <p className="sales-eyebrow">Planlegg befaring</p>
            <h1 className="sales-title">{selectedRequest.title}</h1>
            <p className="sales-subtitle">
              {selectedRequest.customer} · {selectedRequest.address} · {selectedRequest.id}
            </p>
          </section>

          <form className="sales-form-panel" onSubmit={onSubmit}>
            <div className="sales-form-grid">
              <label className="sales-field">
                <span>Dato</span>
                <input
                  type="date"
                  value={surveyForm.date}
                  onChange={(event) => onUpdateSurveyForm("date", event.target.value)}
                  required
                />
              </label>

              <label className="sales-field">
                <span>Tidspunkt</span>
                <input
                  type="time"
                  value={surveyForm.time}
                  onChange={(event) => onUpdateSurveyForm("time", event.target.value)}
                  required
                />
              </label>

              <label className="sales-field sales-field-full">
                <span>Prosjektansvarlig</span>
                <input
                  value={loggedInResponsible}
                  readOnly
                  aria-readonly="true"
                />
              </label>

              <label className="sales-field sales-field-full">
                <span>Intern merknad</span>
                <textarea
                  value={surveyForm.note}
                  onChange={(event) => onUpdateSurveyForm("note", event.target.value)}
                  placeholder="Eksempel: Avklar parkering. Kunde ønsker vurdering av sluk og fall."
                  rows={4}
                />
              </label>
            </div>

            <label className="sales-acceptance-check sales-field-full" style={{ marginTop: 18 }}>
              <input
                type="checkbox"
                checked={surveyForm.sendConfirmation}
                disabled={!selectedRequest.email || customerEmailBusy}
                onChange={(event) =>
                  onUpdateSurveyForm("sendConfirmation", event.target.checked)
                }
              />
              <span>
                {selectedRequest.email
                  ? `${selectedRequest.surveyConfirmationSentAt ? "Send bekreftelsen på nytt" : "Send befaringsbekreftelse"} til ${selectedRequest.email}`
                  : "Registrer kundens e-postadresse for å sende befaringsbekreftelse"}
              </span>
            </label>

            <div className="sales-form-preview">
              <h2>Befaringsplan</h2>
              <div className="sales-preview-lines">
                <span>
                  <CalendarDays size={16} />
                  {surveyForm.date
                    ? formatInspectionDateTime(surveyForm.date, surveyForm.time)
                    : "Dato og tidspunkt ikke valgt"}
                </span>
                <span>
                  <CheckCircle2 size={16} />
                  {loggedInResponsible || "Ansvarlig ikke valgt"}
                </span>
                <span>
                  <MapPin size={16} />
                  {selectedRequest.address}
                </span>
              </div>
            </div>

            <div className="sales-form-actions">
              <button
                className="sales-secondary-button"
                type="button"
                onClick={onBack}
              >
                Avbryt
              </button>

              <button className="sales-primary-button" type="submit">
                <Save size={18} />
                {customerEmailBusy
                  ? "Lagrer og sender …"
                  : selectedRequest.surveyDate
                    ? "Lagre endringer"
                    : "Lagre befaringsplan"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
