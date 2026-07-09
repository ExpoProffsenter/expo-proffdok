import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Home,
  Mail,
  MapPin,
  Phone,
  Plus,
  Ruler,
  Save,
  Send,
} from "lucide-react";
import { useMemo, useState } from "react";
import "./sales.css";

const STORAGE_KEY = "expo-proffdok-sales-preview-requests-v1";

const initialRequests = [
  {
    id: "F-2026-0041",
    title: "Modernisering av bad",
    customer: "Ola Nordmann",
    phone: "900 00 000",
    email: "ola@example.no",
    address: "Kirkeveien 12",
    source: "Telefon",
    note: "Kunden ønsker modernisering av eksisterende bad. Sluk og fall må vurderes på befaring.",
    status: "Forespørsel",
    statusClass: "sales-status-new",
    nextStep: "Planlegg befaring",
    iconName: "clipboard",
  },
  {
    id: "F-2026-0040",
    title: "Flislegging entré og vaskerom",
    customer: "Anne Hansen",
    phone: "911 11 111",
    email: "anne@example.no",
    address: "Solfaret 8",
    source: "E-post",
    note: "Ønsker pris på flislegging i entré og vaskerom. Underlag må kontrolleres.",
    status: "Befaring",
    statusClass: "sales-status-survey",
    nextStep: "Fullfør befaringsnotat",
    iconName: "ruler",
  },
  {
    id: "F-2026-0039",
    title: "Membran og flisarbeider",
    customer: "Sameiet Parkveien 4",
    phone: "922 22 222",
    email: "styret@example.no",
    address: "Parkveien 4",
    source: "Eksisterende kunde",
    note: "Sameiet ønsker tilbud på membran og flisarbeider i felles våtrom.",
    status: "Tilbud",
    statusClass: "sales-status-quote",
    nextStep: "Send tilbud til kunde",
    iconName: "send",
  },
  {
    id: "F-2026-0038",
    title: "Oppgradering av dusjsone",
    customer: "Marius Berg",
    phone: "933 33 333",
    email: "marius@example.no",
    address: "Lindeveien 22",
    source: "Nettside",
    note: "Kunden ønsker ny dusjsone og vurdering av membran i eksisterende bad.",
    status: "Akseptert",
    statusClass: "sales-status-accepted",
    nextStep: "Aktiver som prosjekt",
    iconName: "home",
  },
];

const workTypes = [
  "Modernisering av bad",
  "Nybygg bad",
  "Flislegging",
  "Membranarbeider",
  "Avretting / støp",
  "Murarbeider",
  "Servicearbeid",
  "Annet",
];

const requestSources = [
  "Telefon",
  "E-post",
  "Nettside",
  "Butikk / showroom",
  "Eksisterende kunde",
  "Anbefaling",
  "Annet",
];

const iconMap = {
  clipboard: ClipboardList,
  ruler: Ruler,
  send: Send,
  home: Home,
};

const emptyForm = {
  customer: "",
  phone: "",
  email: "",
  address: "",
  title: "Modernisering av bad",
  source: "Telefon",
  note: "",
};

function loadRequests() {
  try {
    const storedRequests = window.localStorage.getItem(STORAGE_KEY);

    if (!storedRequests) return initialRequests;

    const parsedRequests = JSON.parse(storedRequests);

    if (!Array.isArray(parsedRequests)) return initialRequests;

    return parsedRequests;
  } catch {
    return initialRequests;
  }
}

function saveRequests(requests) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  } catch {
    // Lokal preview-lagring er kun for test.
  }
}

function createRequestId(requests) {
  const highestNumber = requests.reduce((highest, request) => {
    const match = request.id?.match(/F-2026-(\d+)/);
    if (!match) return highest;
    return Math.max(highest, Number(match[1]));
  }, 41);

  return `F-2026-${String(highestNumber + 1).padStart(4, "0")}`;
}

function getWorkflowSteps(request) {
  const activeStepByStatus = {
    Forespørsel: "Forespørsel",
    Befaring: "Befaring",
    Tilbud: "Tilbud",
    Akseptert: "Aksept",
  };

  const activeStep = activeStepByStatus[request.status] || "Forespørsel";
  const steps = ["Forespørsel", "Befaring", "Tilbud", "Aksept", "Prosjekt"];
  const activeIndex = steps.indexOf(activeStep);

  return steps.map((step, index) => ({
    label: step,
    state: index < activeIndex ? "done" : index === activeIndex ? "active" : "pending",
  }));
}

export default function SalesModule() {
  const [requests, setRequests] = useState(loadRequests);
  const [mode, setMode] = useState("list");
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [surveyForm, setSurveyForm] = useState({
    date: "",
    time: "",
    responsible: "",
    note: "",
  });
  const [inspectionForm, setInspectionForm] = useState({
    customerWishes: "",
    existingConditions: "",
    measurements: "",
    observations: "",
    photos: [],
  });
  const [offerForm, setOfferForm] = useState({
    title: "",
    intro: "",
    lines: [{ id: "line-1", description: "", amount: "" }],
    reservations: "",
    validityDays: "30",
  });

  const selectedRequest = useMemo(
    () => requests.find((request) => request.id === selectedRequestId) || null,
    [requests, selectedRequestId]
  );

  const summary = useMemo(
    () => [
      {
        label: "Forespørsler",
        value: requests.filter((request) => request.status === "Forespørsel")
          .length,
      },
      {
        label: "Befaring",
        value: requests.filter((request) => request.status === "Befaring").length,
      },
      {
        label: "Tilbud",
        value: requests.filter((request) => request.status === "Tilbud").length,
      },
      {
        label: "Aksept",
        value: requests.filter((request) => request.status === "Akseptert").length,
      },
    ],
    [requests]
  );

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
  }

  function goToList() {
    setMode("list");
    setSelectedRequestId(null);
  }

  function openOfferBuilder() {
    setOfferForm({
      title: selectedRequest?.offerTitle || `Tilbud – ${selectedRequest?.title || ""}`,
      intro:
        selectedRequest?.offerIntro ||
        `Vi viser til befaring og tilbyr med dette følgende arbeider for ${selectedRequest?.customer || "kunden"}.`,
      lines:
        selectedRequest?.offerLines?.length
          ? selectedRequest.offerLines
          : [{ id: `line-${Date.now()}`, description: "", amount: "" }],
      reservations: selectedRequest?.offerReservations || "",
      validityDays: selectedRequest?.offerValidityDays || "30",
    });
    setMode("offer-builder");
  }

  function updateOfferForm(field, value) {
    setOfferForm((current) => ({ ...current, [field]: value }));
  }

  function updateOfferLine(lineId, field, value) {
    setOfferForm((current) => ({
      ...current,
      lines: current.lines.map((line) =>
        line.id === lineId ? { ...line, [field]: value } : line
      ),
    }));
  }

  function addOfferLine() {
    setOfferForm((current) => ({
      ...current,
      lines: [
        ...current.lines,
        { id: `line-${Date.now()}-${Math.random()}`, description: "", amount: "" },
      ],
    }));
  }

  function removeOfferLine(lineId) {
    setOfferForm((current) => ({
      ...current,
      lines:
        current.lines.length === 1
          ? current.lines
          : current.lines.filter((line) => line.id !== lineId),
    }));
  }

  function getOfferTotal(lines) {
    return lines.reduce((sum, line) => {
      const normalized = String(line.amount || "")
        .replace(/\s/g, "")
        .replace(",", ".");
      const amount = Number(normalized);
      return sum + (Number.isFinite(amount) ? amount : 0);
    }, 0);
  }

  function formatNok(value) {
    return new Intl.NumberFormat("nb-NO", {
      style: "currency",
      currency: "NOK",
      maximumFractionDigits: 0,
    }).format(value);
  }

  function handleSaveOffer(event) {
    event.preventDefault();

    const cleanLines = offerForm.lines
      .map((line) => ({
        ...line,
        description: line.description.trim(),
        amount: String(line.amount || "").trim(),
      }))
      .filter((line) => line.description || line.amount);

    const nextRequests = requests.map((request) =>
      request.id === selectedRequestId
        ? {
            ...request,
            offerTitle: offerForm.title.trim(),
            offerIntro: offerForm.intro.trim(),
            offerLines: cleanLines,
            offerReservations: offerForm.reservations.trim(),
            offerValidityDays: offerForm.validityDays,
            offerTotal: getOfferTotal(cleanLines),
            status: "Tilbud",
            statusClass: "sales-status-quote",
            nextStep: "Send tilbud til kunde",
            iconName: "send",
          }
        : request
    );

    setRequests(nextRequests);
    saveRequests(nextRequests);
    setMode("detail");
  }

  function openInspectionNote() {
    setInspectionForm({
      customerWishes: selectedRequest?.inspectionCustomerWishes || "",
      existingConditions: selectedRequest?.inspectionExistingConditions || "",
      measurements: selectedRequest?.inspectionMeasurements || "",
      observations: selectedRequest?.inspectionObservations || "",
      photos: selectedRequest?.inspectionPhotos || [],
    });
    setMode("inspection-note");
  }

  function updateInspectionForm(field, value) {
    setInspectionForm((current) => ({ ...current, [field]: value }));
  }

  function handleInspectionPhotos(event) {
    const files = Array.from(event.target.files || []);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setInspectionForm((current) => ({
          ...current,
          photos: [
            ...current.photos,
            {
              id: `${Date.now()}-${Math.random()}`,
              name: file.name,
              dataUrl: reader.result,
            },
          ],
        }));
      };
      reader.readAsDataURL(file);
    });

    event.target.value = "";
  }

  function removeInspectionPhoto(photoId) {
    setInspectionForm((current) => ({
      ...current,
      photos: current.photos.filter((photo) => photo.id !== photoId),
    }));
  }

  function handleSaveInspectionNote(event) {
    event.preventDefault();

    const nextRequests = requests.map((request) =>
      request.id === selectedRequestId
        ? {
            ...request,
            inspectionCustomerWishes: inspectionForm.customerWishes.trim(),
            inspectionExistingConditions: inspectionForm.existingConditions.trim(),
            inspectionMeasurements: inspectionForm.measurements.trim(),
            inspectionObservations: inspectionForm.observations.trim(),
            inspectionPhotos: inspectionForm.photos,
            status: "Befaring",
            statusClass: "sales-status-survey",
            nextStep: "Opprett tilbud",
            iconName: "send",
          }
        : request
    );

    setRequests(nextRequests);
    saveRequests(nextRequests);
    setMode("detail");
  }

  function openOutlookCalendar(request) {
    if (!request?.surveyDate || !request?.surveyTime) return;

    const start = new Date(`${request.surveyDate}T${request.surveyTime}:00`);
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    const toLocalIso = (date) => {
      const pad = (value) => String(value).padStart(2, "0");
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
        date.getDate()
      )}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
    };

    const subject = `Befaring – ${request.title} – ${request.customer}`;
    const body = [
      `Kunde: ${request.customer}`,
      `Telefon: ${request.phone || "Ikke registrert"}`,
      `E-post: ${request.email || "Ikke registrert"}`,
      `Saksnummer: ${request.id}`,
      "",
      request.note ? `Forespørsel: ${request.note}` : "",
      request.surveyNote ? `Intern merknad: ${request.surveyNote}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const params = new URLSearchParams({
      subject,
      startdt: toLocalIso(start),
      enddt: toLocalIso(end),
      location: request.address || "",
      body,
      path: "/calendar/action/compose",
      rru: "addevent",
    });

    window.open(
      `https://outlook.office.com/calendar/0/deeplink/compose?${params.toString()}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function openSurveyPlanning() {
    setSurveyForm({
      date: selectedRequest?.surveyDate || "",
      time: selectedRequest?.surveyTime || "",
      responsible: selectedRequest?.surveyResponsible || "",
      note: selectedRequest?.surveyNote || "",
    });
    setMode("survey-plan");
  }

  function updateSurveyForm(field, value) {
    setSurveyForm((current) => ({ ...current, [field]: value }));
  }

  function handleSaveSurveyPlan(event) {
    event.preventDefault();

    const nextRequests = requests.map((request) =>
      request.id === selectedRequestId
        ? {
            ...request,
            surveyDate: surveyForm.date,
            surveyTime: surveyForm.time,
            surveyResponsible: surveyForm.responsible.trim(),
            surveyNote: surveyForm.note.trim(),
            status: "Befaring",
            statusClass: "sales-status-survey",
            nextStep: "Fullfør befaringsnotat",
            iconName: "ruler",
          }
        : request
    );

    setRequests(nextRequests);
    saveRequests(nextRequests);
    setMode("detail");
  }

  function handleCreateRequest(event) {
    event.preventDefault();

    const nextRequest = {
      id: createRequestId(requests),
      title: form.title,
      customer: form.customer.trim() || "Uten kundenavn",
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim() || "Adresse ikke registrert",
      source: form.source,
      note: form.note.trim(),
      status: "Forespørsel",
      statusClass: "sales-status-new",
      nextStep: "Planlegg befaring",
      iconName: "clipboard",
    };

    const nextRequests = [nextRequest, ...requests];

    setRequests(nextRequests);
    saveRequests(nextRequests);
    resetForm();
    setSelectedRequestId(nextRequest.id);
    setMode("detail");
  }

  if (mode === "new") {
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
            <section className="sales-form-hero">
              <p className="sales-eyebrow">Ny forespørsel</p>
              <h1 className="sales-title">Registrer kundehenvendelse</h1>
              <p className="sales-subtitle">
                Fang opp det viktigste raskt. Resten kan fylles ut etter
                befaring.
              </p>
            </section>

            <form className="sales-form-panel" onSubmit={handleCreateRequest}>
              <div className="sales-form-grid">
                <label className="sales-field">
                  <span>Kundenavn</span>
                  <input
                    value={form.customer}
                    onChange={(event) => updateForm("customer", event.target.value)}
                    placeholder="Ola Nordmann"
                    autoComplete="name"
                    autoFocus
                  />
                </label>

                <label className="sales-field">
                  <span>Telefon</span>
                  <input
                    value={form.phone}
                    onChange={(event) => updateForm("phone", event.target.value)}
                    placeholder="900 00 000"
                    inputMode="tel"
                    autoComplete="tel"
                  />
                </label>

                <label className="sales-field">
                  <span>E-post</span>
                  <input
                    value={form.email}
                    onChange={(event) => updateForm("email", event.target.value)}
                    placeholder="kunde@epost.no"
                    type="text"
                    inputMode="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                  />
                </label>

                <label className="sales-field">
                  <span>Adresse</span>
                  <input
                    value={form.address}
                    onChange={(event) => updateForm("address", event.target.value)}
                    placeholder="Kirkeveien 12"
                    autoComplete="street-address"
                  />
                </label>

                <label className="sales-field">
                  <span>Type arbeid</span>
                  <select
                    value={form.title}
                    onChange={(event) => updateForm("title", event.target.value)}
                  >
                    {workTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="sales-field">
                  <span>Forespørselen kom via</span>
                  <select
                    value={form.source}
                    onChange={(event) => updateForm("source", event.target.value)}
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
                    onChange={(event) => updateForm("note", event.target.value)}
                    placeholder="Kunden ønsker befaring for modernisering av bad. Sluk må vurderes."
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
                    {form.address || "Adresse ikke registrert"}
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
                  onClick={() => {
                    resetForm();
                    goToList();
                  }}
                >
                  Avbryt
                </button>

                <button className="sales-primary-button" type="submit">
                  <Save size={18} />
                  Lagre forespørsel
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>
    );
  }

  if (mode === "offer-builder" && selectedRequest) {
    const offerTotal = getOfferTotal(offerForm.lines);

    return (
      <div className="sales-app">
        <div className="sales-shell">
          <header className="sales-header">
            <button
              className="sales-back-button"
              type="button"
              onClick={() => setMode("detail")}
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
              <p className="sales-eyebrow">Tilbudsbygger</p>
              <h1 className="sales-title">Opprett tilbud</h1>
              <p className="sales-subtitle">
                {selectedRequest.customer} · {selectedRequest.address} · {selectedRequest.id}
              </p>
            </section>

            <form
              className="sales-form-panel"
              onSubmit={handleSaveOffer}
              onKeyDown={(event) => {
                if (event.key !== "Enter" || event.target.tagName === "TEXTAREA") {
                  return;
                }

                event.preventDefault();

                if (event.target.closest(".sales-offer-line")) {
                  addOfferLine();
                }
              }}
            >
              <div className="sales-form-grid">
                <label className="sales-field sales-field-full">
                  <span>Tilbudstittel</span>
                  <input
                    value={offerForm.title}
                    onChange={(event) => updateOfferForm("title", event.target.value)}
                    placeholder="Tilbud – Modernisering av bad"
                    required
                  />
                </label>

                <label className="sales-field sales-field-full">
                  <span>Innledning</span>
                  <textarea
                    value={offerForm.intro}
                    onChange={(event) => updateOfferForm("intro", event.target.value)}
                    rows={4}
                  />
                </label>

                <div className="sales-field sales-field-full">
                  <span>Arbeider og priser</span>

                  <div className="sales-offer-lines">
                    {offerForm.lines.map((line, index) => (
                      <div className="sales-offer-line" key={line.id}>
                        <div className="sales-offer-line-number">{index + 1}</div>

                        <input
                          value={line.description}
                          onChange={(event) =>
                            updateOfferLine(line.id, "description", event.target.value)
                          }
                          placeholder="Beskrivelse av arbeid"
                          required
                        />

                        <input
                          value={line.amount}
                          onChange={(event) =>
                            updateOfferLine(line.id, "amount", event.target.value)
                          }
                          placeholder="Beløp eks. mva."
                          inputMode="decimal"
                          required
                        />

                        <button
                          className="sales-secondary-button"
                          type="button"
                          onClick={() => removeOfferLine(line.id)}
                          disabled={offerForm.lines.length === 1}
                        >
                          Fjern
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    className="sales-secondary-button"
                    type="button"
                    onClick={addOfferLine}
                    style={{ width: "fit-content", marginTop: 12 }}
                  >
                    <Plus size={18} />
                    Legg til arbeid
                  </button>
                </div>

                <label className="sales-field sales-field-full">
                  <span>Forutsetninger og forbehold</span>
                  <textarea
                    value={offerForm.reservations}
                    onChange={(event) =>
                      updateOfferForm("reservations", event.target.value)
                    }
                    placeholder="Eksempel: Tilbudet forutsetter at eksisterende konstruksjoner er egnet for planlagte arbeider. Skjulte forhold prises som tillegg etter avtale."
                    rows={5}
                  />
                </label>

                <label className="sales-field">
                  <span>Tilbudet er gyldig i</span>
                  <select
                    value={offerForm.validityDays}
                    onChange={(event) =>
                      updateOfferForm("validityDays", event.target.value)
                    }
                  >
                    <option value="14">14 dager</option>
                    <option value="30">30 dager</option>
                    <option value="60">60 dager</option>
                    <option value="90">90 dager</option>
                  </select>
                </label>
              </div>

              <div className="sales-form-preview">
                <h2>Tilbudsoppsummering</h2>
                <div className="sales-preview-lines">
                  <span>
                    <ClipboardList size={16} />
                    {offerForm.lines.length} arbeidspost(er)
                  </span>
                  <span>
                    <Send size={16} />
                    Gyldig i {offerForm.validityDays} dager
                  </span>
                </div>
                <div className="sales-offer-total">
                  <span>Sum eks. mva.</span>
                  <strong>{formatNok(offerTotal)}</strong>
                </div>
                <div className="sales-offer-total sales-offer-total-muted">
                  <span>Mva. 25 %</span>
                  <strong>{formatNok(offerTotal * 0.25)}</strong>
                </div>
                <div className="sales-offer-total sales-offer-total-grand">
                  <span>Sum inkl. mva.</span>
                  <strong>{formatNok(offerTotal * 1.25)}</strong>
                </div>
              </div>

              <div className="sales-form-actions">
                <button
                  className="sales-secondary-button"
                  type="button"
                  onClick={() => setMode("detail")}
                >
                  Avbryt
                </button>

                <button className="sales-primary-button" type="submit">
                  <Save size={18} />
                  Lagre tilbud
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>
    );
  }

  if (mode === "inspection-note" && selectedRequest) {
    return (
      <div className="sales-app">
        <div className="sales-shell">
          <header className="sales-header">
            <button
              className="sales-back-button"
              type="button"
              onClick={() => setMode("detail")}
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

            <form className="sales-form-panel" onSubmit={handleSaveInspectionNote}>
              <div className="sales-form-grid">
                <label className="sales-field sales-field-full">
                  <span>Kundens ønsker</span>
                  <textarea
                    value={inspectionForm.customerWishes}
                    onChange={(event) =>
                      updateInspectionForm("customerWishes", event.target.value)
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
                      updateInspectionForm("existingConditions", event.target.value)
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
                      updateInspectionForm("measurements", event.target.value)
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
                      updateInspectionForm("observations", event.target.value)
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
                      onChange={handleInspectionPhotos}
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
                            onClick={() => removeInspectionPhoto(photo.id)}
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
                  onClick={() => setMode("detail")}
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

  if (mode === "survey-plan" && selectedRequest) {
    return (
      <div className="sales-app">
        <div className="sales-shell">
          <header className="sales-header">
            <button
              className="sales-back-button"
              type="button"
              onClick={() => setMode("detail")}
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

            <form className="sales-form-panel" onSubmit={handleSaveSurveyPlan}>
              <div className="sales-form-grid">
                <label className="sales-field">
                  <span>Dato</span>
                  <input
                    type="date"
                    value={surveyForm.date}
                    onChange={(event) => updateSurveyForm("date", event.target.value)}
                    required
                  />
                </label>

                <label className="sales-field">
                  <span>Tidspunkt</span>
                  <input
                    type="time"
                    value={surveyForm.time}
                    onChange={(event) => updateSurveyForm("time", event.target.value)}
                    required
                  />
                </label>

                <label className="sales-field sales-field-full">
                  <span>Ansvarlig</span>
                  <input
                    value={surveyForm.responsible}
                    onChange={(event) =>
                      updateSurveyForm("responsible", event.target.value)
                    }
                    placeholder="Navn på ansvarlig bruker"
                    autoComplete="off"
                    required
                  />
                </label>

                <label className="sales-field sales-field-full">
                  <span>Intern merknad</span>
                  <textarea
                    value={surveyForm.note}
                    onChange={(event) => updateSurveyForm("note", event.target.value)}
                    placeholder="Eksempel: Avklar parkering. Kunde ønsker vurdering av sluk og fall."
                    rows={4}
                  />
                </label>
              </div>

              <div className="sales-form-preview">
                <h2>Befaringsplan</h2>
                <div className="sales-preview-lines">
                  <span>
                    <CalendarDays size={16} />
                    {surveyForm.date || "Dato ikke valgt"}
                  </span>
                  <span>
                    <ClipboardList size={16} />
                    {surveyForm.time || "Tidspunkt ikke valgt"}
                  </span>
                  <span>
                    <CheckCircle2 size={16} />
                    {surveyForm.responsible || "Ansvarlig ikke valgt"}
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
                  onClick={() => setMode("detail")}
                >
                  Avbryt
                </button>

                <button className="sales-primary-button" type="submit">
                  <Save size={18} />
                  Lagre befaringsplan
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>
    );
  }

  if (mode === "detail" && selectedRequest) {
    const workflowSteps = getWorkflowSteps(selectedRequest);

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
                  {selectedRequest.customer} · {selectedRequest.address} · {selectedRequest.id}
                </p>
              </div>

              <div className="sales-hero-actions">
                {selectedRequest.surveyDate ? (
                  <button
                    className="sales-secondary-button"
                    type="button"
                    onClick={() => openOutlookCalendar(selectedRequest)}
                  >
                    <CalendarDays size={18} />
                    Legg til i Outlook
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
                            ? openOfferBuilder
                            : undefined
                  }
                >
                  <CalendarDays size={18} />
                  {selectedRequest.status === "Tilbud"
                    ? "Rediger tilbud"
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
                    {selectedRequest.address}
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
                <h2>{selectedRequest.nextStep}</h2>
                {selectedRequest.status === "Tilbud" &&
                selectedRequest.offerLines?.length ? (
                  <div className="sales-detail-lines">
                    <p><strong>{selectedRequest.offerTitle}</strong></p>
                    {selectedRequest.offerLines.map((line) => (
                      <span key={line.id}>
                        <ClipboardList size={16} />
                        {line.description}: {formatNok(getOfferTotal([line]))} eks. mva.
                      </span>
                    ))}
                    <p>
                      <strong>Sum eks. mva.:</strong>{" "}
                      {formatNok(selectedRequest.offerTotal || 0)}
                    </p>
                    <p>
                      <strong>Sum inkl. mva.:</strong>{" "}
                      {formatNok((selectedRequest.offerTotal || 0) * 1.25)}
                    </p>
                  </div>
                ) : selectedRequest.inspectionCustomerWishes ||
                selectedRequest.inspectionExistingConditions ||
                selectedRequest.inspectionMeasurements ||
                selectedRequest.inspectionObservations ? (
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
                    <span>
                      <Plus size={16} />
                      {(selectedRequest.inspectionPhotos || []).length} befaringsbilde(r)
                    </span>
                  </div>
                ) : selectedRequest.status === "Befaring" &&
                  selectedRequest.surveyDate ? (
                  <div className="sales-detail-lines">
                    <span>
                      <CalendarDays size={16} />
                      {selectedRequest.surveyDate} kl. {selectedRequest.surveyTime}
                    </span>
                    <span>
                      <CheckCircle2 size={16} />
                      Ansvarlig: {selectedRequest.surveyResponsible}
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
            </section>
          </main>
        </div>
      </div>
    );
  }

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
          <section className="sales-hero">
            <div>
              <h1 className="sales-title">Forespørsler</h1>
              <p className="sales-subtitle">
                Samle kundehenvendelser, befaring, tilbud og aksept før jobben
                aktiveres som et vanlig ProffDok-prosjekt.
              </p>
            </div>

            <button
              className="sales-primary-button"
              type="button"
              onClick={() => setMode("new")}
            >
              <Plus size={19} />
              Ny forespørsel
            </button>
          </section>

          <section className="sales-summary-grid" aria-label="Oversikt">
            {summary.map((item) => (
              <article className="sales-summary-card" key={item.label}>
                <span className="sales-summary-label">{item.label}</span>
                <strong className="sales-summary-value">{item.value}</strong>
              </article>
            ))}
          </section>

          <section className="sales-panel">
            <div className="sales-panel-header">
              <div>
                <h2 className="sales-panel-title">Aktive forespørsler</h2>
              </div>
            </div>

            <div className="sales-request-list">
              {requests.map((request) => {
                const Icon = iconMap[request.iconName] || ClipboardList;

                return (
                  <button
                    className="sales-request-card"
                    key={request.id}
                    type="button"
                    onClick={() => {
                      setSelectedRequestId(request.id);
                      setMode("detail");
                    }}
                  >
                    <div className="sales-request-main">
                      <h3 className="sales-request-title">{request.title}</h3>
                      <p className="sales-request-customer">
                        {request.customer} · {request.address} · {request.id}
                      </p>
                    </div>

                    <div className="sales-request-next">
                      <span className="sales-next-label">Neste steg</span>
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
        </main>
      </div>
    </div>
  );
}
