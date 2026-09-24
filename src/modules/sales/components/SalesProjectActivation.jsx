// Expo ProffDok – FASE 45B / FASE 37D2 / FASE 23N / FASE 29C1
// Presentasjonskomponent for aktivering av en akseptert salgssak.
// Legacy Butikktilbud og Systemadmin-supportmodus er fortsatt sperret fra prosjektaktivering.
// Enkel ordre kan videreføres enten som Enkel ordre eller som ordinært prosjekt.

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
import {
  isSimpleOrderRequest,
  isStoreOfferRequest,
} from "../services/salesStoreOffers.js";
import { getSimpleOrderActivationMode } from "../services/salesSimpleOrder.js";

function BlockedActivation({ selectedRequest, onBack, storeOffer = false }) {
  return (
    <div className="sales-app">
      <div className="sales-shell">
        <header className="sales-header">
          <button className="sales-back-button" type="button" onClick={onBack}>
            <ArrowLeft size={18} />
            Tilbake
          </button>
          <div className="sales-brand sales-brand-compact">
            <div className="sales-brand-mark"><ShieldCheck size={22} /></div>
            <div className="sales-brand-copy">
              <strong>{storeOffer ? "Butikktilbud" : "Systemadmin-support"}</strong>
              <span>Prosjektaktivering er sperret</span>
            </div>
          </div>
        </header>
        <main className="sales-main">
          <section className="sales-form-hero">
            <p className="sales-eyebrow">Handling sperret</p>
            <h1 className="sales-title">{selectedRequest.title}</h1>
            <p className="sales-subtitle">
              {selectedRequest.customer} · {selectedRequest.address} · {selectedRequest.id}
            </p>
          </section>
          <div className="sales-form-panel">
            <div className="sales-form-preview" style={{ marginTop: 0 }}>
              <h2>{storeOffer ? "Butikktilbud avsluttes i Sales" : "Aktivering utføres av firmaet"}</h2>
              <p className="sales-subtitle">
                {storeOffer
                  ? "Et akseptert butikktilbud oppretter ikke ProffDok-prosjekt. Aksept og dokumentasjon blir liggende på salgssaken."
                  : "Systemadministrator kan kontrollere aksept, dokumenter og prosjektgrunnlag, men oppretter ikke prosjektet på vegne av målbedriften. Dette beskytter eierskap og ansvarlig bruker."}
              </p>
            </div>
            <button className="sales-primary-button" type="button" onClick={onBack}>
              <ArrowLeft size={18} /> Tilbake til saken
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function SalesProjectActivation({
  selectedRequest,
  projectForm,
  projectActivationBusy = false,
  onBack,
  onSubmit,
  onUpdateProjectForm,
}) {
  const supportMode = Boolean(getSalesSupportCompanyId());
  const storeOffer = isStoreOfferRequest(selectedRequest);
  const simpleOrder = isSimpleOrderRequest(selectedRequest);
  const activationMode = simpleOrder
    ? getSimpleOrderActivationMode(selectedRequest?.id)
    : "project";
  const createSimpleOrder = simpleOrder && activationMode === "simple_order";

  // Behold denne eksplisitte sperren separat. Critical build check verifiserer
  // at supportmodus aldri kan nå ordinær prosjektaktivering.
  if (supportMode) {
    return (
      <BlockedActivation
        selectedRequest={selectedRequest}
        onBack={onBack}
        storeOffer={false}
      />
    );
  }

  // Legacy Butikktilbud avsluttes fortsatt i Sales. Kun versjonslåst Enkel ordre
  // kan bruke den eksisterende motoren videre.
  if (storeOffer && !simpleOrder) {
    return (
      <BlockedActivation
        selectedRequest={selectedRequest}
        onBack={onBack}
        storeOffer
      />
    );
  }

  const heading = createSimpleOrder ? "Lag enkel ordre" : "Aktiver som prosjekt";
  const eyebrow = createSimpleOrder
    ? "Opprett Enkel ordre"
    : "Aktiver som ProffDok-prosjekt";

  return (
    <div className="sales-app">
      <div className="sales-shell">
        <header className="sales-header">
          <button className="sales-back-button" type="button" onClick={onBack}>
            <ArrowLeft size={18} /> Tilbake
          </button>
          <div className="sales-brand sales-brand-compact">
            <div className="sales-brand-mark"><ClipboardList size={22} /></div>
            <div className="sales-brand-copy">
              <strong>Expo ProffDok</strong>
              <span>{heading}</span>
            </div>
          </div>
        </header>

        <main className="sales-main">
          <section className="sales-form-hero">
            <p className="sales-eyebrow">{eyebrow}</p>
            <h1 className="sales-title">{selectedRequest.title}</h1>
            <p className="sales-subtitle">
              {selectedRequest.customer} · {selectedRequest.address} · {selectedRequest.id}
            </p>
          </section>

          <form className="sales-form-panel" onSubmit={onSubmit}>
            {simpleOrder ? (
              <div className="sales-form-preview" style={{ marginTop: 0 }}>
                <h2>{createSimpleOrder ? "Enkel ordre" : "Ordinært prosjekt"}</h2>
                <p className="sales-subtitle">
                  {createSimpleOrder
                    ? "Bruk Enkel ordre for mindre oppdrag. Vi gjenbruker ProffDok-motoren under panseret, men ordren skal presenteres som Enkel ordre og uten kundelink."
                    : "Bruk prosjekt når oppdraget har blitt større og trenger ordinær prosjektflyt. Akseptert tilbud og dokumentasjon følger med videre."}
                </p>
              </div>
            ) : null}

            <div className="sales-form-grid">
              <label className="sales-field">
                <span>{createSimpleOrder ? "Ordrenavn" : "Prosjektnavn"}</span>
                <input
                  value={projectForm.projectName}
                  onChange={(event) => onUpdateProjectForm("projectName", event.target.value)}
                  required
                />
              </label>
              <label className="sales-field">
                <span>{createSimpleOrder ? "Ordrenummer" : "Prosjektnummer"}</span>
                <input
                  value={projectForm.projectNumber}
                  onChange={(event) => onUpdateProjectForm("projectNumber", event.target.value)}
                  placeholder={createSimpleOrder ? "Valgfritt ordrenummer" : "Valgfritt prosjektnummer"}
                />
              </label>
              <label className="sales-field sales-field-full">
                <span>Ansvarlig</span>
                <input
                  value={projectForm.responsible}
                  onChange={(event) => onUpdateProjectForm("responsible", event.target.value)}
                  placeholder="Navn på ansvarlig bruker"
                />
              </label>
              <label className="sales-field sales-field-full">
                <span>Intern merknad ved aktivering</span>
                <textarea
                  value={projectForm.note}
                  onChange={(event) => onUpdateProjectForm("note", event.target.value)}
                  rows={4}
                />
              </label>
            </div>

            <div className="sales-form-preview">
              <h2>Data som skal følge videre</h2>
              <div className="sales-preview-lines">
                <span><ClipboardList size={16} /> Kunde, adresse, telefon og e-post</span>
                <span><CheckCircle2 size={16} /> Akseptert tilbud og valgte opsjoner</span>
                <span><Plus size={16} /> Befaringsnotat og bilder</span>
                <span>
                  <FileText size={16} />
                  {selectedRequest.contractFile
                    ? `Kontrakt: ${selectedRequest.contractFile.name}`
                    : createSimpleOrder
                      ? "Kontrakt er valgfritt for Enkel ordre"
                      : "Ingen kontrakt lastet opp – kan legges til senere i prosjektet"}
                </span>
                <span>
                  <Home size={16} />
                  {createSimpleOrder
                    ? "Eksisterende ProffDok-motor gjenbrukes, men visningen skal være Enkel ordre"
                    : "Vanlig ProffDok-prosjekt opprettes og åpnes direkte"}
                </span>
              </div>
            </div>

            <div className="sales-form-actions">
              <button className="sales-secondary-button" type="button" onClick={onBack}>
                Avbryt
              </button>
              <button
                className="sales-primary-button"
                type="submit"
                disabled={projectActivationBusy}
              >
                <Home size={18} />
                {projectActivationBusy
                  ? createSimpleOrder ? "Oppretter ordre …" : "Oppretter prosjekt …"
                  : createSimpleOrder ? "Lag enkel ordre" : "Aktiver som prosjekt"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
