// Expo ProffDok – FASE 30B
// Sikrer befaringsbilder mot rask lagring/navigering: bilder leses ferdig lokalt før
// lagreknappen aktiveres, lesefeil vises, tom befaring krever bekreftelse og brukeren
// får tydelig status på hva som er lagret vs. klart for opplasting.
// Ingen Supabase-, Storage-, RLS- eller databaseendring.
// Expo ProffDok – FASE 23K
// Presentasjonskomponent for befaringsnotat og befaringsbilder.

import { useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  MapPin,
  Plus,
  Save,
} from "lucide-react";

function readSelectedFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Kunne ikke lese bildet."));
    reader.readAsDataURL(file);
  });
}

function normalizeText(value = "") {
  return String(value || "").trim();
}

export default function SalesInspectionNote({
  selectedRequest,
  inspectionForm,
  loggedInResponsible = "",
  onBack,
  onSubmit,
  onUpdateInspectionForm,
  onRemoveInspectionPhoto,
}) {
  const [photoReadBusy, setPhotoReadBusy] = useState(false);
  const [photoReadCount, setPhotoReadCount] = useState(0);
  const [photoReadError, setPhotoReadError] = useState("");
  const [saveBusy, setSaveBusy] = useState(false);

  const photos = Array.isArray(inspectionForm.photos) ? inspectionForm.photos : [];
  const storedPhotoCount = photos.filter((photo) => photo?.path).length;
  const newPhotoCount = photos.filter((photo) => !photo?.path && photo?.dataUrl).length;
  const initialPhotos = Array.isArray(selectedRequest?.inspectionPhotos)
    ? selectedRequest.inspectionPhotos
    : [];

  const hasUnsavedChanges = Boolean(
    normalizeText(inspectionForm.customerWishes) !==
      normalizeText(selectedRequest?.inspectionCustomerWishes) ||
      normalizeText(inspectionForm.existingConditions) !==
        normalizeText(selectedRequest?.inspectionExistingConditions) ||
      normalizeText(inspectionForm.measurements) !==
        normalizeText(selectedRequest?.inspectionMeasurements) ||
      normalizeText(inspectionForm.observations) !==
        normalizeText(selectedRequest?.inspectionObservations) ||
      photos.length !== initialPhotos.length ||
      photos.some((photo, index) => {
        const initial = initialPhotos[index];
        if (!initial) return true;
        return (
          String(photo?.path || "") !== String(initial?.path || "") ||
          String(photo?.id || "") !== String(initial?.id || "")
        );
      })
  );

  const inspectionIsEmpty = Boolean(
    !normalizeText(inspectionForm.customerWishes) &&
      !normalizeText(inspectionForm.existingConditions) &&
      !normalizeText(inspectionForm.measurements) &&
      !normalizeText(inspectionForm.observations) &&
      photos.length === 0
  );

  async function handlePhotoSelection(event) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length || photoReadBusy || saveBusy) return;

    setPhotoReadBusy(true);
    setPhotoReadCount(files.length);
    setPhotoReadError("");

    try {
      const preparedPhotos = await Promise.all(
        files.map(async (file, index) => ({
          id: `${Date.now()}-${index}-${Math.random()}`,
          name: file.name || `Befaringsbilde ${index + 1}`,
          dataUrl: await readSelectedFileAsDataUrl(file),
        }))
      );

      onUpdateInspectionForm("photos", [...photos, ...preparedPhotos]);
    } catch (error) {
      console.error("Kunne ikke lese valgt befaringsbilde", error);
      setPhotoReadError(
        "Ett eller flere bilder kunne ikke leses. De er ikke lagret. Velg bildene på nytt før du fortsetter."
      );
    } finally {
      setPhotoReadBusy(false);
      setPhotoReadCount(0);
    }
  }

  function handleBack() {
    if (photoReadBusy || saveBusy) return;

    if (
      hasUnsavedChanges &&
      !window.confirm(
        "Du har endringer eller bilder som ikke er lagret varig ennå. Vil du gå tilbake uten å lagre befaringsnotatet?"
      )
    ) {
      return;
    }

    onBack();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (photoReadBusy || saveBusy) return;

    if (
      inspectionIsEmpty &&
      !window.confirm(
        "Befaringsnotatet er helt tomt og har ingen bilder. Vil du likevel markere befaringen som gjennomført?"
      )
    ) {
      return;
    }

    setSaveBusy(true);
    setPhotoReadError("");
    try {
      await onSubmit(event);
    } finally {
      setSaveBusy(false);
    }
  }

  return (
      <div className="sales-app">
        <div className="sales-shell">
          <header className="sales-header">
            <button
              className="sales-back-button"
              type="button"
              onClick={handleBack}
              disabled={photoReadBusy || saveBusy}
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

            <form className="sales-form-panel" onSubmit={handleSubmit}>
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
                  <label
                    className="sales-secondary-button"
                    aria-disabled={photoReadBusy || saveBusy ? "true" : undefined}
                    style={{
                      width: "fit-content",
                      opacity: photoReadBusy || saveBusy ? 0.65 : 1,
                      pointerEvents: photoReadBusy || saveBusy ? "none" : "auto",
                    }}
                  >
                    <Plus size={18} />
                    {photoReadBusy
                      ? `Klargjør ${photoReadCount} bilde(r) …`
                      : "Ta bilde eller velg bilder"}
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      multiple
                      disabled={photoReadBusy || saveBusy}
                      onChange={handlePhotoSelection}
                      style={{ display: "none" }}
                    />
                  </label>

                  {photoReadBusy ? (
                    <div
                      role="status"
                      style={{
                        marginTop: 10,
                        padding: "12px 14px",
                        border: "1px solid #b9d9df",
                        borderRadius: 12,
                        background: "#f2fafb",
                        fontWeight: 800,
                      }}
                    >
                      ⏳ Klargjør {photoReadCount} bilde(r). Vent til bildene vises nedenfor før du lagrer.
                    </div>
                  ) : null}

                  {photoReadError ? (
                    <div
                      role="alert"
                      style={{
                        marginTop: 10,
                        padding: "12px 14px",
                        border: "1px solid #e8aaaa",
                        borderRadius: 12,
                        background: "#fff3f3",
                        fontWeight: 800,
                      }}
                    >
                      {photoReadError}
                    </div>
                  ) : null}

                  {photos.length ? (
                    <>
                      <div
                        style={{
                          marginTop: 10,
                          padding: "12px 14px",
                          border: "1px solid #d7e4ea",
                          borderRadius: 12,
                          background: "#f8fbfc",
                          lineHeight: 1.5,
                        }}
                      >
                        <strong>{photos.length} bilde(r) i befaringen.</strong>{" "}
                        {newPhotoCount > 0 ? (
                          <span>
                            {newPhotoCount} nye bilde(r) er klare, men lagres først varig når du trykker «Lagre befaringsnotat».
                          </span>
                        ) : (
                          <span>Alle {storedPhotoCount} bilde(r) er lagret på saken.</span>
                        )}
                      </div>

                      <div className="sales-photo-grid">
                        {photos.map((photo) => (
                          <div className="sales-photo-card" key={photo.id}>
                            <img src={photo.dataUrl} alt={photo.name || "Befaringsbilde"} />
                            <button
                              type="button"
                              className="sales-secondary-button"
                              disabled={photoReadBusy || saveBusy}
                              onClick={() => onRemoveInspectionPhoto(photo.id)}
                            >
                              Fjern
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
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
                    {photos.length} bilde(r)
                  </span>
                </div>
              </div>

              {saveBusy ? (
                <div
                  role="status"
                  style={{
                    marginBottom: 14,
                    padding: "14px 16px",
                    border: "1px solid #8be4e8",
                    borderRadius: 14,
                    background: "#e9fafb",
                    fontWeight: 800,
                  }}
                >
                  ⏳ Laster opp og lagrer befaringsnotatet. Ikke lukk siden før du er tilbake på saken.
                </div>
              ) : null}

              <div className="sales-form-actions">
                <button
                  className="sales-secondary-button"
                  type="button"
                  disabled={photoReadBusy || saveBusy}
                  onClick={handleBack}
                >
                  Avbryt
                </button>

                <button
                  className="sales-primary-button"
                  type="submit"
                  disabled={photoReadBusy || saveBusy}
                >
                  <Save size={18} />
                  {photoReadBusy
                    ? "Vent – klargjør bilder …"
                    : saveBusy
                      ? "Laster opp og lagrer …"
                      : `Lagre befaringsnotat${photos.length ? ` · ${photos.length} bilde(r)` : ""}`}
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>
  );
}
