// Expo ProffDok – FASE 23K
// Presentasjonskomponent for befaringsnotat og befaringsbilder.
// Ingen React-state, Supabase-kall, Storage-kall eller forretningslogikk.

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  MapPin,
  Plus,
  Save,
} from "lucide-react";

export default function SalesInspectionNote({
  selectedRequest,
  inspectionForm,
  loggedInResponsible = "",
  onBack,
  onSubmit,
  onUpdateInspectionForm,
  onInspectionPhotos,
  onRemoveInspectionPhoto,
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
              <p className="sales-eyebrow">Befaringsnotat</p>
              <h1 className="sales-title">{selectedRequest.title}</h1>
              <p className="sales-subtitle">
                {selectedRequest.customer} · {selectedRequest.address} · {selectedRequest.id}
              </p>
            </section>

            <form className="sales-form-panel" onSubmit={onSubmit}>
              {(selectedRequest.note || selectedRequest.surveyDate || selectedRequest.surveyNote) ? (
                <div className="sales-form-preview" style={{ marginTop: 0, marginBottom: 22 }}>
                  <h2>Grunnlag fra saken</h2>
                  <div className="sales-detail-lines">
                    {selectedRequest.note ? (
                      <p><strong>Forespørsel:</strong> {selectedRequest.note}</p>
                    ) : null}
                    {selectedRequest.surveyDate ? (
                      <span>
                        <CalendarDays size={16} />
                        Befaring planlagt {selectedRequest.surveyDate}
                        {selectedRequest.surveyTime ? ` kl. ${selectedRequest.surveyTime}` : ""}
                      </span>
                    ) : null}
                    {selectedRequest.surveyResponsible ? (
                      <span>
                        <CheckCircle2 size={16} />
                        Prosjektansvarlig: {loggedInResponsible}
                      </span>
                    ) : null}
                    {selectedRequest.surveyNote ? (
                      <p><strong>Intern merknad:</strong> {selectedRequest.surveyNote}</p>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <div className="sales-form-grid">
                <label className="sales-field sales-field-full">
                  <span>Kundens ønsker</span>
                  <textarea
                    value={inspectionForm.customerWishes}
                    onChange={(event) =>
                      onUpdateInspectionForm("customerWishes", event.target.value)
                    }
                    placeholder="Hva ønsker kunden utført? Beskriv løsninger, uttrykk og viktige prioriteringer."
                    rows={5}
                  />
                </label>

                <label className="sales-field sales-field-full">
                  <span>Eksisterende forhold</span>
                  <textarea
                    value={inspectionForm.existingConditions}
                    onChange={(event) =>
                      onUpdateInspectionForm("existingConditions", event.target.value)
                    }
                    placeholder="Beskriv eksisterende bad, underlag, sluk, fall, rørføringer og andre synlige forhold."
                    rows={5}
                  />
                </label>

                <label className="sales-field sales-field-full">
                  <span>Målinger</span>
                  <textarea
                    value={inspectionForm.measurements}
                    onChange={(event) =>
                      onUpdateInspectionForm("measurements", event.target.value)
                    }
                    placeholder="Eksempel: Rom 2,40 x 2,15 m. Takhøyde 2,42 m. Sluk 82 cm fra vegg."
                    rows={4}
                  />
                </label>

                <label className="sales-field sales-field-full">
                  <span>Faglige observasjoner</span>
                  <textarea
                    value={inspectionForm.observations}
                    onChange={(event) =>
                      onUpdateInspectionForm("observations", event.target.value)
                    }
                    placeholder="Forhold som må vurderes, avklares eller tas med videre i tilbudet."
                    rows={5}
                  />
                </label>

                <div className="sales-field sales-field-full">
                  <span>Bilder fra befaring</span>
                  <label className="sales-secondary-button" style={{ width: "fit-content" }}>
                    <Plus size={18} />
                    Ta bilde eller velg bilder
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      multiple
                      onChange={onInspectionPhotos}
                      style={{ display: "none" }}
                    />
                  </label>

                  {inspectionForm.photos.length ? (
                    <div className="sales-photo-grid">
                      {inspectionForm.photos.map((photo) => (
                        <div className="sales-photo-card" key={photo.id}>
                          <img src={photo.dataUrl} alt={photo.name || "Befaringsbilde"} />
                          <button
                            type="button"
                            className="sales-secondary-button"
                            onClick={() => onRemoveInspectionPhoto(photo.id)}
                          >
                            Fjern
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="sales-subtitle">Ingen bilder registrert ennå.</p>
                  )}
                </div>
              </div>

              <div className="sales-form-preview">
                <h2>Oppsummering fra befaring</h2>
                <div className="sales-preview-lines">
                  <span>
                    <ClipboardList size={16} />
                    {inspectionForm.customerWishes
                      ? "Kundens ønsker registrert"
                      : "Kundens ønsker ikke registrert"}
                  </span>
                  <span>
                    <CheckCircle2 size={16} />
                    {inspectionForm.existingConditions
                      ? "Eksisterende forhold registrert"
                      : "Eksisterende forhold ikke registrert"}
                  </span>
                  <span>
                    <MapPin size={16} />
                    {inspectionForm.measurements
                      ? "Målinger registrert"
                      : "Målinger ikke registrert"}
                  </span>
                  <span>
                    <Plus size={16} />
                    {inspectionForm.photos.length} bilde(r)
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
                  Lagre befaringsnotat
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>
  );
}
