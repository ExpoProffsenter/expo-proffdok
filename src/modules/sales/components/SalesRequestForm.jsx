// Expo ProffDok – FASE 42J / FASE 38A1 / FASE 37D1 / FASE 23I / FASE 29C1 / FASE 45B
// Presentasjonskomponent for ny og redigert forespørsel.
// FASE 42J bevarer kunde-/adressefelter ved PC-fanebytte og mobil appbytte før
// saken har rukket å få request_ref. Ingen serverrad opprettes før bruker lagrer.
// FASE 45B bruker eksisterende title-felt som tilbudsnavn for Generelt tilbud.
// Teknisk type/opprinnelse beholdes uendret for bakoverkompatibilitet.
// Nye saker opprettes ikke i Systemadmin-supportmodus fordi målbedriftens
// ansvarlige bruker ikke er valgt i denne flyten.

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ClipboardList,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
} from "lucide-react";
import { requestSources, workTypes } from "../constants/salesConstants.js";
import {
  loadSalesEntryDraft,
  saveSalesEntryDraft,
} from "../services/salesLocalStorage.js";
import { getSalesSupportCompanyId } from "../services/salesSupabase.js";
import {
  STORE_OFFER_SOURCE,
  STORE_OFFER_TITLE,
  clearStoreOfferLaunch,
  readStoreOfferLaunch,
} from "../services/salesStoreOffers.js";

const ENTRY_FIELDS = [
  "customer",
  "phone",
  "email",
  "address",
  "postnr",
  "city",
  "title",
  "source",
  "note",
];

export default function SalesRequestForm({
  form,
  isEditingRequest = false,
  isDirectOffer = false,
  onBack,
  onCancel,
  onSubmit,
  onUpdateForm,
}) {
  const supportMode = Boolean(getSalesSupportCompanyId());
  const [isStoreOffer] = useState(
    () => Boolean(isDirectOffer && readStoreOfferLaunch())
  );
  const entryMode = isEditingRequest
    ? "edit-request"
    : isDirectOffer
      ? "new-offer"
      : "new";
  const entryDraftStateRef = useRef({ mode: "", record: null });

  if (entryDraftStateRef.current.mode !== entryMode) {
    entryDraftStateRef.current = {
      mode: entryMode,
      record: loadSalesEntryDraft(entryMode),
    };
  }

  useEffect(() => {
    if (!isStoreOffer) return undefined;

    onUpdateForm("title", STORE_OFFER_TITLE);
    onUpdateForm("source", STORE_OFFER_SOURCE);

    return () => clearStoreOfferLaunch();
    // Markøren leses kun ved mount. Vi vil ikke reklassifisere en vanlig
    // direkte tilbudssak dersom parent-funksjonene får ny referanse ved rerender.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStoreOffer]);

  useEffect(() => {
    if (supportMode) return;
    const record = entryDraftStateRef.current.record;
    if (!record?.form || entryDraftStateRef.current.mode !== entryMode) return;

    ENTRY_FIELDS.forEach((field) => {
      if (record.form[field] === undefined) return;
      if (String(form?.[field] ?? "") === String(record.form[field] ?? "")) return;
      onUpdateForm(field, record.form[field]);
    });
    // Recovery skal kun bruke eksplisitt bakgrunns-snapshot. Dersom bruker har
    // navigert hit normalt returnerer loadSalesEntryDraft null.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entryMode, supportMode]);

  useEffect(() => {
    if (supportMode) return;
    const state = entryDraftStateRef.current;
    if (state.mode !== entryMode) return;

    if (state.record?.form) {
      const recoveryApplied = ENTRY_FIELDS.every(
        (field) =>
          String(form?.[field] ?? "") === String(state.record.form?.[field] ?? "")
      );
      // Ikke la første tomme React-render overskrive kladden vi nettopp skal
      // gjenopprette. Når parent-state matcher recovery-data kan normal lagring starte.
      if (!recoveryApplied) return;
      state.record = null;
    }

    saveSalesEntryDraft(entryMode, form);
  }, [entryMode, form, supportMode]);

  if (supportMode && !isEditingRequest) {
    return (
      <div className="sales-app">
        <div className="sales-shell">
          <header className="sales-header">
            <button className="sales-back-button" type="button" onClick={onBack || onCancel}>
              <ArrowLeft size={18} />
              Tilbake
            </button>
            <div className="sales-brand sales-brand-compact">
              <div className="sales-brand-mark">
                <ShieldCheck size={22} />
              </div>
              <div className="sales-brand-copy">
                <strong>Systemadmin-support</strong>
                <span>Befaring / Tilbud / Aksept</span>
              </div>
            </div>
          </header>

          <main className="sales-main">
            <section className="sales-form-hero">
              <p className="sales-eyebrow">Handling sperret i supportmodus</p>
              <h1 className="sales-title">
                {isStoreOffer
                  ? "Nytt generelt tilbud"
                  : isDirectOffer
                    ? "Nytt våtromstilbud"
                    : "Ny forespørsel"} må opprettes av firmaet
              </h1>
              <p className="sales-subtitle">
                Systemadministrator kan kontrollere og bistå på eksisterende saker,
                men oppretter ikke nye saker på vegne av firmaet før en ansvarlig
                bruker i målbedriften kan velges sikkert.
              </p>
            </section>

            <div className="sales-form-panel">
              <button
                className="sales-primary-button"
                type="button"
                onClick={onBack || onCancel}
              >
                <ArrowLeft size={18} />
                Tilbake til sakene
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

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
              <span>
                {isStoreOffer
                  ? "Generelt tilbud"
                  : isDirectOffer
                    ? "Våtromstilbud / Direkte tilbud"
                    : "Befaring / Tilbud / Aksept"}
              </span>
            </div>
          </div>
        </header>

        <main className="sales-main">
          <section className="sales-form-hero">
            <p className="sales-eyebrow">
              {isEditingRequest
                ? "Rediger forespørsel"
                : isStoreOffer
                  ? "Nytt generelt tilbud"
                  : isDirectOffer
                    ? "Nytt våtromstilbud"
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
                : isStoreOffer
                  ? "Registrer kunde og opprett tilbud"
                  : isDirectOffer
                    ? "Registrer kunde og opprett våtromstilbud"
                    : "Registrer kundehenvendelse"}
            </h1>
            <p className="sales-subtitle">
              {isEditingRequest
                ? "Oppdater kunde-, adresse- og prosjektinformasjon uten å opprette en ny sak."
                : isStoreOffer
                  ? "Opprett et tilbud for varer, arbeid, underentreprenører og andre leveranser."
                  : isDirectOffer
                    ? "Opprett et ordinært våtromstilbud direkte uten forespørsel eller befaring. Etter kundeaksept kan tilbudet gå videre til kontrakt og ProffDok-prosjekt."
                    : "Fang opp det viktigste raskt. Resten kan fylles ut etter befaring."}
            </p>
          </section>

          <form className="sales-form-panel" onSubmit={onSubmit}>
            <p className="sales-offer-price-guidance" style={{ marginBottom: 16 }}>
              Felter merket * må fylles ut.
            </p>
            <div className="sales-form-grid">
              <label className="sales-field">
                <span>Kundenavn *</span>
                <input
                  value={form.customer}
                  onChange={(event) => onUpdateForm("customer", event.target.value)}
                  placeholder="Skriv inn kundenavn"
                  autoComplete="name"
                  required
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
                <span>Adresse *</span>
                <input
                  value={form.address}
                  onChange={(event) => onUpdateForm("address", event.target.value)}
                  placeholder="Skriv inn adresse"
                  autoComplete="address-line1"
                  required
                />
              </label>

              <label className="sales-field">
                <span>Postnummer *</span>
                <input
                  value={form.postnr || ""}
                  onChange={(event) => onUpdateForm("postnr", event.target.value)}
                  placeholder="Skriv inn postnummer"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  required
                />
              </label>

              <label className="sales-field">
                <span>Sted *</span>
                <input
                  value={form.city || ""}
                  onChange={(event) => onUpdateForm("city", event.target.value)}
                  placeholder="Skriv inn sted"
                  autoComplete="address-level2"
                  required
                />
              </label>

              {isStoreOffer ? (
                <label className="sales-field sales-field-full">
                  <span>Tilbudsnavn *</span>
                  <input
                    value={form.title || ""}
                    onChange={(event) => onUpdateForm("title", event.target.value)}
                    placeholder={STORE_OFFER_TITLE}
                    required
                  />
                  <small>Dette navnet følger tilbudet videre til kunde, aksept og dokumentasjon.</small>
                </label>
              ) : (
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
              )}

              {!isStoreOffer ? (
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
              ) : null}

              <label className="sales-field sales-field-full">
                <span>Kort notat</span>
                <textarea
                  value={form.note}
                  onChange={(event) => onUpdateForm("note", event.target.value)}
                  placeholder={
                    isStoreOffer
                      ? "Kort intern merknad om leveransen, kunden eller oppdraget."
                      : isDirectOffer
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
                  {form.title || STORE_OFFER_TITLE}
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
                  : isStoreOffer
                    ? "Opprett tilbud"
                    : isDirectOffer
                      ? "Opprett våtromstilbud"
                      : "Lagre forespørsel"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
