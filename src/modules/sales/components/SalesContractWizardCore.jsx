// Expo ProffDok – FASE 33B.3
// Stegvis intern veiviser for enkel forbrukerkontrakt etter akseptert tilbud.
// Ulagrede felt og aktivt steg sikres i sessionStorage. Serverlagring skjer først
// når brukeren selv velger Lagre kontraktsutkast.

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  Info,
  Save,
  ShieldCheck,
  X,
} from "lucide-react";
import { formatNok } from "../utils/salesUtils.js";
import {
  AGREEMENT_CHANNELS,
  PRICE_FORMS,
  agreementChannelNeedsWithdrawalInfo,
  calculateExpectedFinishDate,
  createCompanyContractSnapshot,
  createInitialSalesContractDraft,
  getAcceptedSalesOfferId,
  getAcceptedSalesOfferVersionId,
  getAcceptedSalesOfferVersionNumber,
  normalizeSalesContractDraft,
  validateSalesContractStep,
} from "../utils/salesContractModel.js";
import {
  createExpoSalesContract,
  fetchActiveSalesContract,
  saveExpoSalesContractDraft,
} from "../services/salesContracts.js";
import { fetchSalesCompanyProfile } from "../services/salesCommunication.js";
import { createDefaultSalesSupabaseClient } from "../services/salesSupabase.js";
import SalesContractDocument from "./SalesContractDocument.jsx";

const FORBRUKERRADET_HANDVERKER_URL =
  "https://www.forbrukerradet.no/forside/bolig/bruk-av-handverker/sjekkliste-handverker/";
const FORBRUKERRADET_ANGRERETT_URL =
  "https://www.forbrukerradet.no/forside/angrer-du-pa-et-kjop/";
const WIZARD_SESSION_PREFIX = "expo-proffdok:sales-contract-wizard-draft:";
const STEP_LABELS = ["Grunnlag", "Tid og betaling", "Avtalevalg", "Kontroller dokument"];

function inputStyle() {
  return {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #cbdce2",
    borderRadius: 10,
    padding: "11px 12px",
    background: "#ffffff",
    color: "#0f172a",
    font: "inherit",
  };
}

function labelStyle() {
  return { display: "grid", gap: 6, color: "#183b46", fontWeight: 800 };
}

function clampStep(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 1;
  return Math.max(1, Math.min(4, Math.round(parsed)));
}

function wizardSessionKey(requestId = "", offerVersionId = "") {
  const requestPart = String(requestId || "").trim();
  const versionPart = String(offerVersionId || "").trim();
  return requestPart
    ? `${WIZARD_SESSION_PREFIX}${requestPart}:${versionPart || "accepted"}`
    : "";
}

function readWizardSession(key) {
  if (!key || typeof window === "undefined") return null;
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(key) || "null");
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function writeWizardSession(key, value) {
  if (!key || typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      key,
      JSON.stringify({ ...value, updatedAt: new Date().toISOString() })
    );
  } catch {
    // Lokal sikring er kun UX-vern.
  }
}

function customerAddress(request = {}) {
  return [request.address, [request.postnr, request.city].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");
}

function formatDate(value = "") {
  if (!value) return "Ikke beregnet";
  const parsed = new Date(`${value}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed);
}

function FieldSummary({ label, value }) {
  return (
    <div
      style={{
        display: "grid",
        gap: 3,
        padding: "11px 12px",
        border: "1px solid #d9e7eb",
        borderRadius: 10,
        background: "#f8fbfc",
      }}
    >
      <span style={{ color: "#64748b", fontSize: 12, fontWeight: 800 }}>{label}</span>
      <strong style={{ color: "#0f172a" }}>{value || "Ikke registrert"}</strong>
    </div>
  );
}

function StepIndicator({ step }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        gap: 8,
        marginBottom: 18,
      }}
    >
      {STEP_LABELS.map((label, index) => {
        const number = index + 1;
        const active = number === step;
        const done = number < step;
        return (
          <div
            key={label}
            style={{
              minWidth: 0,
              padding: "9px 8px",
              borderRadius: 10,
              border: `1px solid ${active || done ? "#76c8ce" : "#d9e7eb"}`,
              background: active ? "#eaf9fa" : done ? "#f2fbf8" : "#ffffff",
              color: active ? "#0b737b" : done ? "#176b42" : "#64748b",
              fontWeight: 900,
              fontSize: 12,
              textAlign: "center",
            }}
          >
            {done ? "✓" : number}. {label}
          </div>
        );
      })}
    </div>
  );
}

function BinaryChoice({ value, onChange }) {
  const choices = [
    {
      value: false,
      title: "Nei",
      text: "Ingen særskilt dagmulkt tas inn i kontrakten.",
    },
    {
      value: true,
      title: "Ja",
      text: "Dagmulkt avtales tydelig med kunden i kontrakten.",
    },
  ];

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ color: "#183b46", fontWeight: 800 }}>Skal dagmulkt avtales?</div>
      <div
        role="group"
        aria-label="Dagmulkt"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: 10,
        }}
      >
        {choices.map((choice) => {
          const active = value === choice.value;
          return (
            <button
              key={String(choice.value)}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(choice.value)}
              style={{
                display: "grid",
                gridTemplateColumns: "42px minmax(0,1fr)",
                gap: 10,
                alignItems: "center",
                width: "100%",
                padding: 12,
                borderRadius: 12,
                border: `2px solid ${active ? "#16a7b0" : "#d9e7eb"}`,
                background: active ? "#eefafb" : "#ffffff",
                color: "#183b46",
                textAlign: "left",
                cursor: "pointer",
                font: "inherit",
              }}
            >
              <span
                style={{
                  display: "grid",
                  placeItems: "center",
                  width: 34,
                  height: 34,
                  borderRadius: 999,
                  background: active ? "#16a7b0" : "#eef3f5",
                  color: active ? "#ffffff" : "#52616b",
                  fontWeight: 900,
                }}
              >
                {active ? "✓" : ""}
              </span>
              <span>
                <strong style={{ display: "block", marginBottom: 2 }}>{choice.title}</strong>
                <span style={{ color: "#52616b", lineHeight: 1.35 }}>{choice.text}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function SalesContractWizard({ request, onClose }) {
  const client = useMemo(() => createDefaultSalesSupabaseClient(), []);
  const offerId = getAcceptedSalesOfferId(request);
  const offerVersionId = getAcceptedSalesOfferVersionId(request);
  const requestId = String(request?.id || "");
  const sessionKey = useMemo(
    () => wizardSessionKey(requestId, offerVersionId),
    [requestId, offerVersionId]
  );
  const initialSession = useMemo(() => readWizardSession(sessionKey), [sessionKey]);

  const [step, setStep] = useState(() => clampStep(initialSession?.step || 1));
  const [companyProfile, setCompanyProfile] = useState(null);
  const [draft, setDraft] = useState(() =>
    normalizeSalesContractDraft(
      initialSession?.draft || createInitialSalesContractDraft(request),
      request
    )
  );
  const [contractId, setContractId] = useState(initialSession?.contractId || "");
  const [existingStatus, setExistingStatus] = useState("");
  const [existingSource, setExistingSource] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [sessionReady, setSessionReady] = useState(false);

  function persistSessionNow(next = {}) {
    writeWizardSession(sessionKey, {
      step: next.step ?? step,
      draft: next.draft ?? draft,
      contractId: next.contractId ?? contractId,
    });
  }

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const [profile, existing] = await Promise.all([
          fetchSalesCompanyProfile(client),
          fetchActiveSalesContract(client, { offerId, offerVersionId }),
        ]);

        if (!active) return;
        setCompanyProfile(profile || {});

        if (existing?.error) throw existing.error;
        if (existing?.data) {
          setContractId(existing.data.id || contractId || "");
          setExistingStatus(existing.data.status || "");
          setExistingSource(existing.data.source || "");
          if (existing.data.source === "expo" && !initialSession?.draft) {
            setDraft(normalizeSalesContractDraft(existing.data.snapshot?.contract || {}, request));
          }
        }
      } catch (loadError) {
        if (!active) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Kontraktsgrunnlaget kunne ikke lastes."
        );
      } finally {
        if (active) {
          setSessionReady(true);
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [client, offerId, offerVersionId, requestId, sessionKey]);

  useEffect(() => {
    if (!sessionReady) return;
    persistSessionNow();
  }, [sessionReady, sessionKey, step, draft, contractId]);

  function updateDraft(field, value) {
    setDraft((current) => ({ ...current, [field]: value }));
    setSavedMessage("");
  }

  function updateSchedule(field, value) {
    setDraft((current) => {
      const next = { ...current, [field]: value };
      const weeks =
        next.expected_duration_weeks === ""
          ? ""
          : Number(next.expected_duration_weeks || 0);
      next.expected_finish_date = calculateExpectedFinishDate(next.start_date, weeks);
      return next;
    });
    setSavedMessage("");
  }

  function updatePaymentPlan(index, field, value) {
    setDraft((current) => ({
      ...current,
      payment_plan: current.payment_plan.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: field === "percent" ? Number(value || 0) : value,
            }
          : item
      ),
    }));
    setSavedMessage("");
  }

  function goNext() {
    const validationError = validateSalesContractStep(step, draft);
    if (validationError) {
      setError(validationError);
      return;
    }
    const nextStep = Math.min(4, step + 1);
    setError("");
    setStep(nextStep);
    persistSessionNow({ step: nextStep });
    window.scrollTo?.({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    const nextStep = Math.max(1, step - 1);
    setError("");
    setStep(nextStep);
    persistSessionNow({ step: nextStep });
    window.scrollTo?.({ top: 0, behavior: "smooth" });
  }

  function closeWizard() {
    persistSessionNow();
    onClose?.();
  }

  async function saveDraft() {
    const stepTwoError = validateSalesContractStep(2, draft);
    const stepThreeError = validateSalesContractStep(3, draft);
    if (stepTwoError || stepThreeError) {
      setError(stepTwoError || stepThreeError);
      return;
    }
    if (!offerId) {
      setError(
        "Denne eldre aksepten mangler sikker serverreferanse til tilbudet. Bruk eksisterende opplasting av egen kontrakt for denne saken."
      );
      return;
    }
    if (existingSource && existingSource !== "expo") {
      setError(
        "Det er allerede registrert en ekstern kontrakt for den aksepterte tilbudsversjonen."
      );
      return;
    }
    if (existingStatus && existingStatus !== "draft") {
      setError("Kontrakten er allerede sendt eller signert og kan ikke redigeres.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const companySnapshot = createCompanyContractSnapshot(companyProfile || {});
      const contractForSave = normalizeSalesContractDraft(draft, request);
      let id = contractId;

      if (!id) {
        const created = await createExpoSalesContract(client, {
          offerId,
          contract: contractForSave,
          companySnapshot,
        });
        id = created?.id || "";
        if (!id) throw new Error("Kontraktsutkastet ble ikke opprettet.");
        setContractId(id);
        setExistingSource(created?.source || "expo");
        setExistingStatus(created?.status || "draft");
      }

      const saved = await saveExpoSalesContractDraft(client, {
        contractId: id,
        contract: contractForSave,
        companySnapshot,
      });
      setDraft(contractForSave);
      setExistingStatus(saved?.status || "draft");
      setSavedMessage("Kontraktsutkastet er lagret på server.");
      persistSessionNow({ contractId: id, draft: contractForSave });
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Kontraktsutkastet kunne ikke lagres."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="sales-app">
        <div className="sales-shell">
          <main className="sales-main">
            <div className="sales-form-panel">Laster kontraktsgrunnlag …</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="sales-app">
      <div className="sales-shell">
        <header className="sales-header">
          <button className="sales-back-button" type="button" onClick={closeWizard}>
            <ArrowLeft size={18} />
            Tilbake til saken
          </button>
          <div className="sales-brand sales-brand-compact">
            <div className="sales-brand-mark"><FileText size={22} /></div>
            <div className="sales-brand-copy">
              <strong>Expo ProffDok</strong>
              <span>Enkel forbrukerkontrakt</span>
            </div>
          </div>
        </header>

        <main className="sales-main">
          <section className="sales-form-hero">
            <p className="sales-eyebrow">Kontrakt etter akseptert tilbud</p>
            <h1 className="sales-title">{request.title}</h1>
            <p className="sales-subtitle">
              {request.customer} · {customerAddress(request) || "Adresse ikke registrert"}
            </p>
          </section>

          <div className="sales-form-panel">
            <StepIndicator step={step} />

            {existingSource === "external" ? (
              <div
                style={{
                  padding: 14,
                  borderRadius: 12,
                  border: "1px solid #f2d59b",
                  background: "#fffaf0",
                  marginBottom: 16,
                }}
              >
                Det er allerede registrert en ekstern kontrakt for denne aksepten.
                Eksisterende opplastingsflyt beholdes som gjeldende valg.
              </div>
            ) : null}

            {step === 1 ? (
              <div style={{ display: "grid", gap: 16 }}>
                <div>
                  <h2 style={{ marginTop: 0 }}>Kontroller grunnlaget</h2>
                  <p className="sales-subtitle">
                    Mest mulig er allerede hentet fra firma, kunde og det aksepterte
                    tilbudet. Du skal ikke skrive samme informasjon på nytt.
                  </p>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
                    gap: 10,
                  }}
                >
                  <FieldSummary label="Utførende firma" value={companyProfile?.companyName} />
                  <FieldSummary label="Org.nr." value={companyProfile?.orgNumber} />
                  <FieldSummary label="Kunde" value={request.customer} />
                  <FieldSummary label="Prosjektadresse" value={draft.project_address} />
                  <FieldSummary
                    label="Akseptert tilbud"
                    value={
                      getAcceptedSalesOfferVersionNumber(request)
                        ? `Versjon ${getAcceptedSalesOfferVersionNumber(request)}`
                        : "Akseptert tilbud"
                    }
                  />
                  <FieldSummary
                    label="Avtalesum inkl. mva."
                    value={formatNok(draft.price_incl_vat || 0)}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 9,
                    alignItems: "flex-start",
                    padding: 13,
                    borderRadius: 12,
                    background: "#f2fafb",
                    color: "#33545d",
                  }}
                >
                  <ShieldCheck size={18} style={{ marginTop: 2, flex: "0 0 auto" }} />
                  <span>
                    Akseptert tilbud og valgte opsjoner forblir låst historikk. Kontrakten
                    legger bare til de avtalepunktene som mangler.
                  </span>
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div style={{ display: "grid", gap: 18 }}>
                <div>
                  <h2 style={{ marginTop: 0 }}>Fremdrift og betaling</h2>
                  <p className="sales-subtitle">
                    Angi avtalt oppstart og hvor mange uker arbeidet forventes å vare.
                    Expo ProffDok beregner forventet ferdigstillelse automatisk.
                  </p>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
                    gap: 12,
                  }}
                >
                  <label style={labelStyle()}>
                    <span>Avtalt oppstart</span>
                    <input
                      type="date"
                      value={draft.start_date}
                      onChange={(event) => updateSchedule("start_date", event.target.value)}
                      style={inputStyle()}
                    />
                  </label>
                  <label style={labelStyle()}>
                    <span>Forventet varighet i uker</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      inputMode="numeric"
                      value={draft.expected_duration_weeks}
                      onChange={(event) =>
                        updateSchedule("expected_duration_weeks", event.target.value)
                      }
                      placeholder="F.eks. 6"
                      style={inputStyle()}
                    />
                  </label>
                  <div
                    style={{
                      gridColumn: "1 / -1",
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
                      gap: 10,
                      padding: 13,
                      borderRadius: 12,
                      border: "1px solid #cfe5e8",
                      background: "#f2fafb",
                    }}
                  >
                    <FieldSummary
                      label="Beregnet forventet ferdigstillelse"
                      value={formatDate(draft.expected_finish_date)}
                    />
                    <div style={{ color: "#52616b", lineHeight: 1.45, alignSelf: "center" }}>
                      Datoen beregnes fra avtalt oppstart og forventet varighet. Fristen kan
                      forskyves ved dokumenterte forhold som gir rett til fristforlengelse.
                    </div>
                  </div>
                  <label style={{ ...labelStyle(), gridColumn: "1 / -1" }}>
                    <span>Prisform</span>
                    <select
                      value={draft.price_form}
                      onChange={(event) => updateDraft("price_form", event.target.value)}
                      style={inputStyle()}
                    >
                      {PRICE_FORMS.map((item) => (
                        <option key={item.value} value={item.value}>{item.label}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div>
                  <strong style={{ display: "block", color: "#183b46", marginBottom: 8 }}>
                    Betalingsplan
                  </strong>
                  <p className="sales-subtitle" style={{ marginTop: 0 }}>
                    Standardforslaget er 40 / 40 / 20 og kan justeres dersom prosjektet
                    krever det.
                  </p>
                  <div style={{ display: "grid", gap: 10 }}>
                    {(draft.payment_plan || []).map((item, index) => (
                      <div
                        key={item.id}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "90px minmax(0,1fr)",
                          gap: 10,
                          padding: 12,
                          border: "1px solid #d9e7eb",
                          borderRadius: 12,
                          background: "#ffffff",
                        }}
                      >
                        <label style={labelStyle()}>
                          <span>Andel</span>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={item.percent}
                            onChange={(event) =>
                              updatePaymentPlan(index, "percent", event.target.value)
                            }
                            style={inputStyle()}
                          />
                        </label>
                        <label style={labelStyle()}>
                          <span>{item.title}</span>
                          <input
                            value={item.description}
                            onChange={(event) =>
                              updatePaymentPlan(index, "description", event.target.value)
                            }
                            style={inputStyle()}
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div style={{ display: "grid", gap: 18 }}>
                <div>
                  <h2 style={{ marginTop: 0 }}>Noen få avtalevalg</h2>
                  <p className="sales-subtitle">
                    Bare punkter som ikke allerede finnes i tilbudet må fylles ut.
                  </p>
                </div>

                <label style={labelStyle()}>
                  <span>Hvordan er avtalen inngått?</span>
                  <select
                    value={draft.agreement_channel}
                    onChange={(event) => {
                      updateDraft("agreement_channel", event.target.value);
                      if (!agreementChannelNeedsWithdrawalInfo(event.target.value)) {
                        updateDraft("early_start_requested", false);
                      }
                    }}
                    style={inputStyle()}
                  >
                    <option value="">Velg …</option>
                    {AGREEMENT_CHANNELS.map((item) => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                </label>

                {agreementChannelNeedsWithdrawalInfo(draft.agreement_channel) ? (
                  <label
                    style={{
                      display: "grid",
                      gridTemplateColumns: "24px minmax(0,1fr)",
                      gap: 11,
                      alignItems: "start",
                      padding: 14,
                      borderRadius: 12,
                      background: "#fffaf0",
                      border: "1px solid #f2d59b",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={draft.early_start_requested}
                      onChange={(event) =>
                        updateDraft("early_start_requested", event.target.checked)
                      }
                      style={{ marginTop: 4 }}
                    />
                    <span style={{ display: "grid", gap: 4 }}>
                      <strong style={{ color: "#183b46" }}>
                        Oppstart før eventuell angrefrist er utløpt
                      </strong>
                      <span style={{ color: "#52616b", lineHeight: 1.45 }}>
                        Kryss av bare dersom kunden ønsker at arbeidet skal starte før en
                        eventuell angrefrist er utløpt. Kunden må bekrefte dette uttrykkelig
                        når kontrakten signeres.
                      </span>
                    </span>
                  </label>
                ) : null}

                <div
                  style={{
                    display: "grid",
                    gap: 5,
                    padding: 13,
                    borderRadius: 12,
                    background: "#eef8fb",
                    border: "1px solid #cde6ea",
                    color: "#33545d",
                  }}
                >
                  <strong style={{ color: "#183b46" }}>Faglig anbefaling – kun internt</strong>
                  <span style={{ lineHeight: 1.45 }}>
                    En tydelig avtale om dagmulkt kan gi begge parter klare forventninger til
                    fremdriften og fremstå profesjonelt. Denne anbefalingen vises bare for
                    brukeren i Expo ProffDok og tas ikke med i kundens kontrakt.
                  </span>
                </div>

                <BinaryChoice
                  value={Boolean(draft.daily_penalty_agreed)}
                  onChange={(nextValue) => {
                    updateDraft("daily_penalty_agreed", nextValue);
                    if (!nextValue) updateDraft("daily_penalty_text", "");
                  }}
                />

                {draft.daily_penalty_agreed ? (
                  <div style={{ display: "grid", gap: 12 }}>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
                        gap: 12,
                      }}
                    >
                      <label style={labelStyle()}>
                        <span>Avtalt tilleggsfrist før dagmulkt</span>
                        <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 8 }}>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            inputMode="numeric"
                            value={draft.daily_penalty_grace_days}
                            onChange={(event) =>
                              updateDraft("daily_penalty_grace_days", event.target.value)
                            }
                            style={inputStyle()}
                          />
                          <div style={{ alignSelf: "center", color: "#52616b" }}>
                            kalenderdager etter gjeldende ferdigstillelsesfrist
                          </div>
                        </div>
                      </label>
                      <label style={labelStyle()}>
                        <span>Avtalt dagmulkt</span>
                        <input
                          value={draft.daily_penalty_text}
                          onChange={(event) =>
                            updateDraft("daily_penalty_text", event.target.value)
                          }
                          placeholder="F.eks. kr per kalenderdag og eventuell maksgrense"
                          style={inputStyle()}
                        />
                      </label>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gap: 7,
                        padding: 14,
                        borderRadius: 12,
                        background: "#f7fafb",
                        border: "1px solid #d9e7eb",
                        color: "#33545d",
                        lineHeight: 1.45,
                      }}
                    >
                      <strong style={{ color: "#183b46" }}>Når kan dagmulkt bli aktuelt?</strong>
                      <span>
                        <strong>Forsinkelse håndverkeren svarer for:</strong> Avtalt dagmulkt
                        kan begynne å løpe etter at den avtalte tilleggsfristen er utløpt.
                      </span>
                      <span>
                        <strong>Forsinkelse på kundens side:</strong> Kundens egne valg eller
                        leveranser, manglende tilgang, sene avklaringer eller andre dokumenterte
                        forhold på kundens side gir tilsvarende fristforlengelse og utløser ikke
                        dagmulkt.
                      </span>
                    </div>
                  </div>
                ) : null}

                <label style={labelStyle()}>
                  <span>Særskilte avtalevilkår (valgfritt)</span>
                  <textarea
                    rows={4}
                    value={draft.special_terms}
                    onChange={(event) => updateDraft("special_terms", event.target.value)}
                    placeholder="Kun dersom noe ikke allerede er dekket av tilbudet."
                    style={{ ...inputStyle(), resize: "vertical" }}
                  />
                </label>

                <div
                  style={{
                    display: "grid",
                    gap: 7,
                    padding: 13,
                    borderRadius: 12,
                    background: "#eef8fb",
                    color: "#33545d",
                  }}
                >
                  <div style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 900 }}>
                    <Info size={17} /> Nyttige offentlige råd
                  </div>
                  <a
                    href={FORBRUKERRADET_HANDVERKER_URL}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => persistSessionNow()}
                  >
                    Forbrukerrådet – råd ved bruk av håndverker ↗
                  </a>
                  <a
                    href={FORBRUKERRADET_ANGRERETT_URL}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => persistSessionNow()}
                  >
                    Forbrukerrådet – angrerett ↗
                  </a>
                  <small>
                    Lenker til Forbrukerrådet er kun informasjon og innebærer ikke at
                    kontrakten er godkjent av Forbrukerrådet.
                  </small>
                </div>
              </div>
            ) : null}

            {step === 4 ? (
              <div style={{ display: "grid", gap: 18 }}>
                <div>
                  <h2 style={{ marginTop: 0 }}>Kontroller dokumentet</h2>
                  <p className="sales-subtitle">
                    Kundeaksepten og det aksepterte tilbudet inngår tydelig i
                    avtalegrunnlaget. Gå tilbake hvis noe skal endres, og lagre deretter
                    utkastet på server.
                  </p>
                </div>
                <SalesContractDocument
                  request={request}
                  companyProfile={companyProfile || {}}
                  draft={draft}
                />
              </div>
            ) : null}

            {error ? (
              <div
                role="alert"
                style={{
                  marginTop: 16,
                  padding: 12,
                  borderRadius: 10,
                  border: "1px solid #f2b8b5",
                  background: "#fff5f5",
                  color: "#9b1c1c",
                  fontWeight: 700,
                }}
              >
                {error}
              </div>
            ) : null}

            {savedMessage ? (
              <div
                style={{
                  marginTop: 16,
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  padding: 12,
                  borderRadius: 10,
                  background: "#f1fbf5",
                  border: "1px solid #b9dfc8",
                  color: "#176b42",
                  fontWeight: 800,
                }}
              >
                <CheckCircle2 size={18} />
                {savedMessage}
              </div>
            ) : null}

            <div className="sales-form-actions" style={{ marginTop: 20, justifyContent: "space-between" }}>
              <button
                className="sales-secondary-button"
                type="button"
                onClick={step === 1 ? closeWizard : goBack}
              >
                {step === 1 ? <X size={18} /> : <ArrowLeft size={18} />}
                {step === 1 ? "Avbryt" : "Forrige"}
              </button>

              {step < 4 ? (
                <button className="sales-primary-button" type="button" onClick={goNext}>
                  Neste <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  className="sales-primary-button"
                  type="button"
                  onClick={saveDraft}
                  disabled={saving || existingSource === "external"}
                >
                  <Save size={18} />
                  {saving ? "Lagrer kontrakt …" : "Lagre kontraktsutkast"}
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
