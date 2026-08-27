// Expo ProffDok – FASE 30D1
// Befaringsbilder lagres binært i IndexedDB før de tas inn i skjemaet. Lokalt
// sikrede bilder kan dermed gjenopprettes etter reload/appbytte før serverlagring.
// Eksisterende Supabase-opplasting ved «Lagre befaringsnotat» beholdes uendret.
// Expo ProffDok – FASE 30B
// Sikrer befaringsbilder mot rask lagring/navigering og viser tydelig status.
// Expo ProffDok – FASE 23K
// Presentasjonskomponent for befaringsnotat og befaringsbilder.

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  MapPin,
  Plus,
  Save,
} from "lucide-react";
import {
  isInspectionDraftDbAvailable,
  listInspectionPhotoBlobs,
  removeInspectionPhotoBlobByKey,
  requestPersistentInspectionStorage,
  saveInspectionPhotoBlob,
} from "../services/salesInspectionDraftDb.js";

function normalizeText(value = "") {
  return String(value || "").trim();
}

async function blobFromPreviewSource(source = "") {
  const value = String(source || "");
  if (!value) return null;
  const response = await fetch(value);
  if (!response.ok) throw new Error("Kunne ikke lese lokal bildekopi.");
  return response.blob();
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
  const [photoRestoreBusy, setPhotoRestoreBusy] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const objectUrlsRef = useRef(new Set());

  const photos = Array.isArray(inspectionForm.photos) ? inspectionForm.photos : [];
  const storedPhotoCount = photos.filter((photo) => photo?.path).length;
  const localSafePhotoCount = photos.filter(
    (photo) => !photo?.path && photo?.localDraftKey
  ).length;
  const unsafeLocalPhotoCount = photos.filter(
    (photo) => !photo?.path && photo?.dataUrl && !photo?.localDraftKey
  ).length;
  const initialPhotos = Array.isArray(selectedRequest?.inspectionPhotos)
    ? selectedRequest.inspectionPhotos
    : [];

  useEffect(() => {
    let cancelled = false;
    const objectUrls = objectUrlsRef.current;

    async function restoreLocalPhotos() {
      const requestId = String(selectedRequest?.id || "").trim();
      if (!requestId) return;

      if (!isInspectionDraftDbAvailable()) {
        setPhotoReadError(
          "Denne nettleseren støtter ikke lokal sikkerhetslagring for befaringsbilder. Bilder må lagres på server før siden forlates."
        );
        return;
      }

      setPhotoRestoreBusy(true);
      try {
        const serverIds = new Set(
          (Array.isArray(selectedRequest?.inspectionPhotos)
            ? selectedRequest.inspectionPhotos
            : []
          )
            .filter((photo) => photo?.path)
            .map((photo) => String(photo?.id || ""))
            .filter(Boolean)
        );

        let records = await listInspectionPhotoBlobs(requestId);
        const recordById = new Map(
          records.map((record) => [String(record?.id || ""), record])
        );

        for (const record of records) {
          if (!serverIds.has(String(record?.id || ""))) continue;
          await removeInspectionPhotoBlobByKey(record.key);
          recordById.delete(String(record?.id || ""));
        }

        // Migrer eldre DataURL/blob-URL-kladd til IndexedDB når den fortsatt kan leses.
        for (const photo of photos) {
          const photoId = String(photo?.id || "");
          if (
            !photoId ||
            photo?.path ||
            recordById.has(photoId) ||
            !photo?.dataUrl
          ) {
            continue;
          }

          try {
            const blob = await blobFromPreviewSource(photo.dataUrl);
            if (!blob) continue;
            const migrated = await saveInspectionPhotoBlob({
              requestId,
              photoId,
              name: photo.name || "Befaringsbilde",
              blob,
              type: blob.type,
            });
            recordById.set(photoId, migrated);
          } catch {
            // Eldre lokal URL kan være utløpt etter reload. Eventuelle andre
            // IndexedDB-kopier gjenopprettes fortsatt nedenfor.
          }
        }

        records = Array.from(recordById.values());
        if (cancelled) return;

        const currentById = new Map(
          photos.map((photo) => [String(photo?.id || ""), photo])
        );
        const merged = [];
        const includedIds = new Set();
        let changed = false;

        for (const photo of photos) {
          const photoId = String(photo?.id || "");
          if (!photoId || photo?.path) {
            merged.push(photo);
            if (photoId) includedIds.add(photoId);
            continue;
          }

          const record = recordById.get(photoId);
          if (!record?.blob) {
            merged.push(photo);
            if (photoId) includedIds.add(photoId);
            continue;
          }

          const objectUrl = URL.createObjectURL(record.blob);
          objectUrls.add(objectUrl);
          merged.push({
            ...photo,
            id: record.id,
            name: photo.name || record.name,
            dataUrl: objectUrl,
            localDraftKey: record.key,
            localStoredAt: record.createdAt,
            localOnly: true,
          });
          includedIds.add(photoId);
          changed = true;
        }

        for (const record of records) {
          const photoId = String(record?.id || "");
          if (!photoId || includedIds.has(photoId) || serverIds.has(photoId)) {
            continue;
          }

          const objectUrl = URL.createObjectURL(record.blob);
          objectUrls.add(objectUrl);
          merged.push({
            id: record.id,
            name: record.name || "Befaringsbilde",
            dataUrl: objectUrl,
            localDraftKey: record.key,
            localStoredAt: record.createdAt,
            localOnly: true,
          });
          includedIds.add(photoId);
          changed = true;
        }

        // Dersom en lokal post finnes i IndexedDB, men ikke lenger i React-formen,
        // skal den gjenoppstå. Dette dekker krasj/sovemodus mellom IDB-write og state-update.
        if (!changed && records.length) {
          changed = records.some(
            (record) => !currentById.has(String(record?.id || ""))
          );
        }

        if (!cancelled && changed) {
          onUpdateInspectionForm("photos", merged);
        }
      } catch (error) {
        console.error("Kunne ikke gjenopprette lokalt sikrede befaringsbilder", error);
        if (!cancelled) {
          setPhotoReadError(
            "Lokalt sikrede befaringsbilder kunne ikke leses. Ikke slett nettleserdata. Prøv å åpne befaringen på nytt."
          );
        }
      } finally {
        if (!cancelled) setPhotoRestoreBusy(false);
      }
    }

    void restoreLocalPhotos();

    return () => {
      cancelled = true;
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
      objectUrls.clear();
    };
    // Gjenoppretting skal kjøre én gang per åpnet salgssak, ikke ved hver state-endring.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRequest?.id]);

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
    if (!files.length || photoReadBusy || photoRestoreBusy || saveBusy) return;

    const requestId = String(selectedRequest?.id || "").trim();
    if (!requestId) {
      setPhotoReadError("Saken mangler saksreferanse. Bildene ble ikke lagt til.");
      return;
    }

    if (!isInspectionDraftDbAvailable()) {
      setPhotoReadError(
        "Lokal sikkerhetslagring er ikke tilgjengelig i denne nettleseren. Bildene ble ikke lagt til."
      );
      return;
    }

    setPhotoReadBusy(true);
    setPhotoReadCount(files.length);
    setPhotoReadError("");
    void requestPersistentInspectionStorage();

    const preparedPhotos = [];
    let failedCount = 0;

    for (const [index, file] of files.entries()) {
      try {
        const photoId = `${Date.now()}-${index}-${Math.random()}`;
        const record = await saveInspectionPhotoBlob({
          requestId,
          photoId,
          name: file.name || `Befaringsbilde ${index + 1}`,
          blob: file,
          type: file.type,
          lastModified: file.lastModified,
        });
        const objectUrl = URL.createObjectURL(file);
        objectUrlsRef.current.add(objectUrl);
        preparedPhotos.push({
          id: photoId,
          name: file.name || `Befaringsbilde ${index + 1}`,
          dataUrl: objectUrl,
          localDraftKey: record.key,
          localStoredAt: record.createdAt,
          localOnly: true,
        });
      } catch (error) {
        console.error("Kunne ikke sikre valgt befaringsbilde lokalt", error);
        failedCount += 1;
      }
    }

    if (preparedPhotos.length) {
      onUpdateInspectionForm("photos", [...photos, ...preparedPhotos]);
    }

    if (failedCount) {
      setPhotoReadError(
        `${failedCount} bilde(r) kunne ikke sikres lokalt og ble derfor ikke lagt til. Velg dem på nytt før du fortsetter.`
      );
    }

    setPhotoReadBusy(false);
    setPhotoReadCount(0);
  }

  async function handleRemovePhoto(photo) {
    if (photoReadBusy || photoRestoreBusy || saveBusy) return;

    if (photo?.localDraftKey) {
      try {
        await removeInspectionPhotoBlobByKey(photo.localDraftKey);
      } catch (error) {
        console.error("Kunne ikke fjerne lokal bildekopi", error);
        setPhotoReadError(
          "Bildet kunne ikke fjernes fra lokal sikkerhetslagring. Prøv igjen før du fortsetter."
        );
        return;
      }
    }

    onRemoveInspectionPhoto(photo.id);
  }

  function handleBack() {
    if (photoReadBusy || photoRestoreBusy || saveBusy) return;

    if (
      hasUnsavedChanges &&
      !window.confirm(
        "Du har endringer eller bilder som ikke er lagret varig på server ennå. Vil du gå tilbake uten å fullføre befaringsnotatet? Lokalt sikrede bilder beholdes på denne enheten."
      )
    ) {
      return;
    }

    onBack();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (photoReadBusy || photoRestoreBusy || saveBusy) return;

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

  const busy = photoReadBusy || photoRestoreBusy || saveBusy;

  return (
      <div className="sales-app">
        <div className="sales-shell">
          <header className="sales-header">
            <button
              className="sales-back-button"
              type="button"
              onClick={handleBack}
              disabled={busy}
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
                    disabled={photoRestoreBusy}
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
                    disabled={photoRestoreBusy}
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
                    disabled={photoRestoreBusy}
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
                    disabled={photoRestoreBusy}
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
                    aria-disabled={busy ? "true" : undefined}
                    style={{
                      width: "fit-content",
                      opacity: busy ? 0.65 : 1,
                      pointerEvents: busy ? "none" : "auto",
                    }}
                  >
                    <Plus size={18} />
                    {photoRestoreBusy
                      ? "Gjenoppretter lokale bilder …"
                      : photoReadBusy
                        ? `Sikrer ${photoReadCount} bilde(r) lokalt …`
                        : "Ta bilde eller velg bilder"}
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      multiple
                      disabled={busy}
                      onChange={handlePhotoSelection}
                      style={{ display: "none" }}
                    />
                  </label>

                  {photoRestoreBusy ? (
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
                      ⏳ Kontrollerer lokalt sikrede befaringsbilder før skjemaet kan brukes.
                    </div>
                  ) : null}

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
                      ⏳ Sikrer {photoReadCount} bilde(r) på denne enheten. Vent til bildene vises nedenfor.
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
                        {localSafePhotoCount > 0 ? (
                          <span>
                            {localSafePhotoCount} nye bilde(r) er lokalt sikret på denne enheten og lastes til server når du trykker «Lagre befaringsnotat».
                          </span>
                        ) : storedPhotoCount > 0 ? (
                          <span>Alle {storedPhotoCount} bilde(r) er lagret på saken.</span>
                        ) : null}
                        {unsafeLocalPhotoCount > 0 ? (
                          <span>
                            {" "}⚠ {unsafeLocalPhotoCount} eldre lokal(e) bildekopi(er) er ikke bekreftet i sikkerhetslageret ennå.
                          </span>
                        ) : null}
                      </div>

                      <div className="sales-photo-grid">
                        {photos.map((photo) => (
                          <div className="sales-photo-card" key={photo.id}>
                            <img src={photo.dataUrl} alt={photo.name || "Befaringsbilde"} />
                            <button
                              type="button"
                              className="sales-secondary-button"
                              disabled={busy}
                              onClick={() => void handleRemovePhoto(photo)}
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
                  disabled={busy}
                  onClick={handleBack}
                >
                  Avbryt
                </button>

                <button
                  className="sales-primary-button"
                  type="submit"
                  disabled={busy}
                >
                  <Save size={18} />
                  {photoRestoreBusy
                    ? "Vent – gjenoppretter bilder …"
                    : photoReadBusy
                      ? "Vent – sikrer bilder lokalt …"
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
