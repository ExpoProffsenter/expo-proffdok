// Expo ProffDok – FASE 23I
// Presentasjonskomponent for ny og redigert forespørsel.
// Ingen React-state, Supabase-kall, Storage-kall eller forretningslogikk.

import { ArrowLeft, ClipboardList, Mail, MapPin, Phone, Save } from "lucide-react";
import { requestSources, workTypes } from "../constants/salesConstants.js";

export default function SalesRequestForm({
  form,
  isEditingRequest = false,
  isDirectOffer = false,
  onBack,
  onCancel,
  onSubmit,
  onUpdateForm,
}) {
  return (
    <div className="sales-app">
      <div className="sales-shell">
        <header className="sales-header">
          <button className="sales-back-button" type="button" onClick={onBack}>
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
            <p className="sales-eyebrow">
              {isEditingRequest
                ? "Rediger forespørsel"
                : isDirectOffer
                  ? "Nytt tilbud"
                  : "Ny forespørsel"}
            </p>
            <h1
              className="sales-title"
              style={{
                maxWidth: "100%",
                fontSize: "clamp(26px, 8vw, 56px)",
                overflowWrap: "anywhere",
              }}
            >
              {isEditingRequest
                ? "Oppdater kundehenvendelse"
                : isDirectOffer
                  ? "Registrer kunde og opprett tilbud"
                  : "Registrer kundehenvendelse"}
            </h1>
            <p className="sales-subtitle">
              {isEditingRequest
                ? "Oppdater kunde-, adresse- og prosjektinformasjon uten å opprette en ny sak."
                : isDirectOffer
                  ? "Legg inn kunde- og prosjektinformasjon. Du går deretter direkte til tilbudsbyggeren uten forespørsel eller befaring."
                  : "Fang opp det viktigste raskt. Resten kan fylles ut etter befaring."}
            </p>
          </section>

          <form className="sales-form-panel" onSubmit={onSubmit}>
            <div className="sales-form-grid">
              <label className="sales-field">
                <span>Kundenavn</span>
                <input
                  value={form.customer}
                  onChange={(event) => onUpdateForm("customer", event.target.value)}
                  placeholder="Ola Nordmann"
                  autoComplete="name"
                  autoFocus
                />
              </label>

              <label className="sales-field">
                <span>Telefon</span>
                <input
                  value={form.phone}
                  onChange={(event) => onUpdateForm("phone", event.target.value)}
                  placeholder="900 00 000"
                  inputMode="tel"
                  autoComplete="tel"
                />
              </label>

              <label className="sales-field">
                <span>E-post</span>
                <input
                  value={form.email}
                  onChange={(event) => onUpdateForm("email", event.target.value)}
                  placeholder="kunde@epost.no"
                  type="text"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                />
              </label>

              <label className="sales-field sales-field-full">
                <span>Adresse</span>
                <input
                  value={form.address}
                  onChange={(event) => onUpdateForm("address", event.target.value)}
                  placeholder="Kirkeveien 12"
                  autoComplete="address-line1"
                />
              </label>

              <label className="sales-field">
                <span>Postnummer</span>
                <input
                  value={form.postnr || ""}
                  onChange={(event) => onUpdateForm("postnr", event.target.value)}
                  placeholder="0368"
                  inputMode="numeric"
                  autoComplete="postal-code"
                />
              </label>

              <label className="sales-field">
                <span>Sted</span>
                <input
                  value={form.city || ""}
                  onChange={(event) => onUpdateForm("city", event.target.value)}
                  placeholder="Oslo"
                  autoComplete="address-level2"
                />
              </label>

              <label className="sales-field">
                <span>Type arbeid</span>
                <select
                  value={form.title}
                  onChange={(event) => onUpdateForm("title", event.target.value)}
                >
                  {workTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>

              <label className="sales-field">
                <span>{isDirectOffer ? "Tilbudet kom via" : "Forespørselen kom via"}</span>
                <select
                  value={form.source}
                  onChange={(event) => onUpdateForm("source", event.target.value)}
                >
                  {requestSources.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              </label>

              <label className="sales-field sales-field-full">
                <span>Kort notat</span>
                <textarea
                  value={form.note}
                  onChange={(event) => onUpdateForm("note", event.target.value)}
                  placeholder={
                    isDirectOffer
                      ? "Kort intern merknad om tilbudet eller kundens behov."
                      : "Kunden ønsker befaring for modernisering av bad. Sluk må vurderes."
                  }
                  rows={4}
                />
              </label>
            </div>

            <div className="sales-form-preview">
              <h2>Oppsummering</h2>

              <div className="sales-preview-lines">
                <span>
                  <ClipboardList size={16} />
                  {form.title}
                </span>
                <span>
                  <MapPin size={16} />
                  {[form.address, form.postnr, form.city]
                    .filter(Boolean)
                    .join(", ") || "Adresse ikke registrert"}
                </span>
                <span>
                  <Phone size={16} />
                  {form.phone || "Telefon ikke registrert"}
                </span>
                <span>
                  <Mail size={16} />
                  {form.email || "E-post ikke registrert"}
                </span>
              </div>
            </div>

            <div className="sales-form-actions">
              <button
                className="sales-secondary-button"
                type="button"
                onClick={onCancel}
              >
                Avbryt
              </button>

              <button className="sales-primary-button" type="submit">
                <Save size={18} />
                {isEditingRequest
                  ? "Lagre endringer"
                  : isDirectOffer
                    ? "Opprett tilbud"
                    : "Lagre forespørsel"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
