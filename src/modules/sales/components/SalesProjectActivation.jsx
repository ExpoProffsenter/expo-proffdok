// Expo ProffDok – FASE 23N / FASE 29C1
// Presentasjonskomponent for aktivering av en akseptert salgssak som ProffDok-prosjekt.
// Prosjektaktivering er eksplisitt sperret i Systemadmin-supportmodus.

import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  FileText,
  Home,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { getSalesSupportCompanyId } from "../services/salesSupabase.js";

export default function SalesProjectActivation({
  selectedRequest,
  projectForm,
  projectActivationBusy = false,
  onBack,
  onSubmit,
  onUpdateProjectForm,
}) {
  const supportMode = Boolean(getSalesSupportCompanyId());

  if (supportMode) {
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
                <ShieldCheck size={22} />
              </div>
              <div className="sales-brand-copy">
                <strong>Systemadmin-support</strong>
                <span>Prosjektaktivering er sperret</span>
              </div>
            </div>
          </header>

          <main className="sales-main">
            <section className="sales-form-hero">
              <p className="sales-eyebrow">Handling sperret i supportmodus</p>
              <h1 className="sales-title">{selectedRequest.title}</h1>
              <p className="sales-subtitle">
                {selectedRequest.customer} · {selectedRequest.address} · {selectedRequest.id}
              </p>
            </section>

            <div className="sales-form-panel">
              <div className="sales-form-preview" style={{ marginTop: 0 }}>
                <h2>Aktivering utføres av firmaet</h2>
                <p className="sales-subtitle">
                  Systemadministrator kan kontrollere aksept, dokumenter og
                  prosjektgrunnlag, men oppretter ikke prosjektet på vegne av
                  målbedriften. Dette beskytter eierskap og ansvarlig bruker.
                </p>
              </div>

              <button className="sales-primary-button" type="button" onClick={onBack}>
                <ArrowLeft size={18} />
                Tilbake til saken
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
              <span>Aktiver som prosjekt</span>
            </div>
          </div>
        </header>

        <main className="sales-main">
          <section className="sales-form-hero">
            <p className="sales-eyebrow">Aktiver som ProffDok-prosjekt</p>
            <h1 className="sales-title">{selectedRequest.title}</h1>
            <p className="sales-subtitle">
              {selectedRequest.customer} · {selectedRequest.address} · {selectedRequest.id}
            </p>
          </section>

          <form className="sales-form-panel" onSubmit={onSubmit}>
            <div className="sales-form-grid">
              <label className="sales-field">
                <span>Prosjektnavn</span>
                <input
                  value={projectForm.projectName}
                  onChange={(event) =>
                    onUpdateProjectForm("projectName", event.target.value)
                  }
                  required
                />
              </label>

              <label className="sales-field">
                <span>Prosjektnummer</span>
                <input
                  value={projectForm.projectNumber}
                  onChange={(event) =>
                    onUpdateProjectForm("projectNumber", event.target.value)
                  }
                  placeholder="Valgfritt prosjektnummer"
                />
              </label>

              <label className="sales-field sales-field-full">
                <span>Ansvarlig</span>
                <input
                  value={projectForm.responsible}
                  onChange={(event) =>
                    onUpdateProjectForm("responsible", event.target.value)
                  }
                  placeholder="Navn på ansvarlig bruker"
                />
              </label>

              <label className="sales-field sales-field-full">
                <span>Intern merknad ved aktivering</span>
                <textarea
                  value={projectForm.note}
                  onChange={(event) =>
                    onUpdateProjectForm("note", event.target.value)
                  }
                  rows={4}
                />
              </label>
            </div>

            <div className="sales-form-preview">
              <h2>Data som skal følge videre</h2>
              <div className="sales-preview-lines">
                <span>
                  <ClipboardList size={16} />
                  Kunde, adresse, telefon og e-post
                </span>
                <span>
                  <CheckCircle2 size={16} />
                  Akseptert tilbud og valgte opsjoner
                </span>
                <span>
                  <Plus size={16} />
                  Befaringsnotat og bilder
                </span>
                <span>
                  <FileText size={16} />
                  {selectedRequest.contractFile
                    ? `Kontrakt: ${selectedRequest.contractFile.name}`
                    : "Ingen kontrakt lastet opp – kan legges til senere i prosjektet"}
                </span>
                <span>
                  <Home size={16} />
                  Vanlig ProffDok-prosjekt opprettes og åpnes direkte
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

              <button
                className="sales-primary-button"
                type="submit"
                disabled={projectActivationBusy}
              >
                <Home size={18} />
                {projectActivationBusy ? "Oppretter prosjekt …" : "Aktiver som prosjekt"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
