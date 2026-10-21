import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Building2,
  MapPin,
  Plus,
  X,
  Home,
} from "lucide-react";
import {
  boligDraftKey,
  readBoligDraft,
  writeBoligDraft,
  clearBoligDraft,
} from "./boligClient.js";
import {
  BUILDING_TYPES,
  newBuilding,
  buildingTotal,
  localId,
  typeInfo,
  planPayload,
  validatePlan,
} from "./boligStructure.js";
import BoligBuildingArt from "./BoligBuildingArt.jsx";

const seed = () => ({
  version: 1,
  request_id: localId(),
  title: "",
  reference: "",
  type: "apartment",
  buildings: [newBuilding(0)],
  step: 0,
  selected: 0,
  submitted: false,
});
const steps = [
  "Prosjekt og boligtype",
  "Bygg og adresser",
  "Etasjer og boliger",
  "Se over og opprett",
];
export default function BoligProjectBuilder({ context, onCreate, busy }) {
  const key = boligDraftKey(context, "new", "builder");
  const [draft, setDraft] = useState(() => {
    const saved = readBoligDraft(key, null);
    return saved?.version === 1 &&
      Array.isArray(saved.buildings) &&
      saved.buildings.length
      ? saved
      : seed();
  });
  const [open, setOpen] = useState(false),
    [error, setError] = useState(""),
    [warning, setWarning] = useState(""),
    [startChoice, setStartChoice] = useState(false),
    [confirmDiscard, setConfirmDiscard] = useState(false);
  const dialog = useRef(null),
    trigger = useRef(null),
    returnFocus = useRef(null),
    heading = useRef(null),
    choiceHeading = useRef(null),
    sending = useRef(false);
  const update = (next) => {
    if (sending.current) return;
    const value = { ...draft, ...next };
    if (!writeBoligDraft(key, value))
      setWarning(
        "Kladden kunne ikke sikres i nettleseren. Behold siden åpen til prosjektet er opprettet.",
      );
    setDraft(value);
    setError("");
  };
  const close = () => {
    if (!sending.current) setOpen(false);
  };
  useEffect(() => {
    if (open) {
      if (!dialog.current?.open) dialog.current?.showModal();
      (startChoice ? choiceHeading : heading).current?.focus();
    } else if (dialog.current?.open) {
      dialog.current.close();
      (returnFocus.current || trigger.current)?.focus({ preventScroll: true });
    }
  }, [open, startChoice]);
  useEffect(() => {
    if (open) {
      heading.current?.focus();
      dialog.current?.querySelector(".bolig-builder-body")?.scrollTo?.(0, 0);
    }
  }, [draft.step]);
  const b = draft.buildings[draft.selected] || draft.buildings[0];
  const activeDraftEntrance =
    b.entrances.find((e) => e.key === b.entrance_key) || b.entrances[0];
  const changeBuilding = (values) =>
    update({
      buildings: draft.buildings.map((v) =>
        v.key === b.key ? { ...v, ...values } : v,
      ),
    });
  const resizeBuildings = (n) => {
    if (!Number.isInteger(n) || n < 1 || n > 100) return;
    if (n < draft.buildings.length) {
      setError(
        "Bruk «Fjern bygg» på bygget du vil ta bort. Da unngår du å miste et utfylt oppsett ved en feil.",
      );
      return;
    }
    update({
      buildings: Array.from(
        { length: n },
        (_, i) =>
          draft.buildings[i] ||
          newBuilding(i, draft.type === "field" ? "house" : draft.type),
      ),
    });
  };
  const changeType = (type) => {
    if (type === draft.type) return;
    const actual = type === "field" ? "house" : type;
    update({
      type,
      buildings: draft.buildings.map((v) => ({
        ...v,
        building_type: actual,
        entrances: [
          {
            key: v.entrances[0].key,
            address: v.entrances[0].address,
            counts: [...typeInfo(actual).floors],
          },
        ],
      })),
    });
  };
  const next = () => {
    const failure =
      draft.step === 0
        ? !draft.title.trim()
          ? "Gi prosjektet et navn."
          : ""
        : draft.step === 1
          ? draft.buildings.some((v) => !v.name.trim() || !v.address.trim())
            ? "Fyll inn navn og adresse for alle bygg."
            : ""
          : validatePlan(draft);
    if (failure) {
      setError(failure);
      return;
    }
    update({ step: Math.min(3, draft.step + 1) });
  };
  const submit = async () => {
    if (sending.current || busy) return;
    const failure = validatePlan(draft);
    if (failure) {
      setError(failure);
      return;
    }
    const frozen = { ...draft, submitted: true };
    // Persist the exact attempt before dispatch. A lost response is retried with this key.
    if (!writeBoligDraft(key, frozen)) {
      setWarning(
        "Kunne ikke sikre opprettelsen lokalt. Frigjør lagringsplass i nettleseren før du prøver igjen.",
      );
      return;
    }
    setDraft(frozen);
    sending.current = true;
    setError("");
    try {
      await onCreate(planPayload(frozen));
      clearBoligDraft(key);
      setDraft(seed());
      setOpen(false);
    } catch (e) {
      if (["22023", "23505", "23514", "42501"].includes(e.code)) {
        const editable = { ...frozen, submitted: false };
        writeBoligDraft(key, editable);
        setDraft(editable);
      }
      setError(
        e.message ||
          "Forbindelsen ble brutt. Kontroller opprettelsen med samme oppsett. Det blir ikke laget et ekstra prosjekt.",
      );
    } finally {
      sending.current = false;
    }
  };
  const hasDraft = Boolean(
    draft.type !== "apartment" ||
    draft.title ||
    draft.reference ||
    draft.step ||
    draft.submitted ||
    draft.buildings.some(
      (v) => v.address || v.entrances.some((e) => e.address),
    ),
  );
  const launch = (resume = false, target) => {
    returnFocus.current = target;
    setStartChoice(!resume && hasDraft);
    setConfirmDiscard(false);
    setOpen(true);
  };
  const restart = () => {
    if (draft.submitted || busy) return;
    const fresh = seed();
    if (!writeBoligDraft(key, fresh)) {
      setWarning("Kunne ikke sikre en ny kladd. Den gamle kladden er beholdt.");
      return;
    }
    setDraft(fresh);
    setStartChoice(false);
    setConfirmDiscard(false);
    setError("");
    setWarning("");
  };
  const total = draft.buildings.reduce((s, v) => s + buildingTotal(v), 0);
  return (
    <>
      <button
        ref={trigger}
        type="button"
        className="bolig-primary"
        disabled={busy}
        onClick={(e) => launch(false, e.currentTarget)}
      >
        <Plus size={17} />
        Bygg nytt prosjekt
      </button>
      {hasDraft && (
        <button
          type="button"
          className="bolig-resume-draft"
          disabled={busy}
          onClick={(e) => launch(true, e.currentTarget)}
        >
          Fortsett prosjektkladd
        </button>
      )}
      {createPortal(
        <dialog
          ref={dialog}
          className="bolig-dialog bolig-builder-dialog"
          aria-labelledby="bolig-builder-title"
          onCancel={(e) => {
            e.preventDefault();
            e.stopPropagation();
            close();
          }}
        >
          <header>
            <div>
              <small>{context.company_name} · NYTT BOLIGPROSJEKT</small>
              <h2 id="bolig-builder-title">Bygg nytt prosjekt</h2>
              <p>Fra bygg og adresser til en oversikt du kan jobbe i.</p>
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={close}
              aria-label="Lukk og behold prosjektkladd"
            >
              <X size={20} />
            </button>
          </header>
          {startChoice && (
            <section className="bolig-builder-start-choice">
              <h3 ref={choiceHeading} tabIndex={-1}>
                Du har en prosjektkladd
              </h3>
              <p>
                <b>{draft.title || "Prosjekt uten navn"}</b> · Trinn{" "}
                {draft.step + 1} av 4
              </p>
              <p>
                Kladden ligger i denne nettleseren. Fortsett der du slapp, eller
                forkast den før du starter på nytt.
              </p>
              {draft.submitted && (
                <p role="status">
                  Opprettelse er forsøkt. Kontroller resultatet fra kladden før
                  du starter et nytt prosjekt.
                </p>
              )}
              <div>
                <button
                  type="button"
                  className="bolig-primary"
                  onClick={() => setStartChoice(false)}
                >
                  Fortsett med kladden
                </button>
                {!draft.submitted &&
                  (!confirmDiscard ? (
                    <button
                      type="button"
                      onClick={() => setConfirmDiscard(true)}
                    >
                      Forkast kladd og start på nytt
                    </button>
                  ) : (
                    <>
                      <p>
                        Dette fjerner oppsettet «
                        {draft.title || "Prosjekt uten navn"}» fra denne
                        nettleseren.
                      </p>
                      <button type="button" onClick={restart}>
                        Ja, forkast kladden
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDiscard(false)}
                      >
                        Behold kladden
                      </button>
                    </>
                  ))}
              </div>
              {warning && <p role="alert">{warning}</p>}
            </section>
          )}
          <ol
            hidden={startChoice}
            className="bolig-builder-steps"
            aria-label="Trinn i prosjektopprettelsen"
          >
            {steps.map((s, i) => (
              <li
                key={s}
                aria-current={draft.step === i ? "step" : undefined}
                data-complete={i < draft.step}
              >
                <span>{i < draft.step ? <Check size={15} /> : i + 1}</span>
                <b>{s}</b>
              </li>
            ))}
          </ol>
          <form
            hidden={startChoice}
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              draft.step === 3 ? submit() : next();
            }}
          >
            <div className="bolig-builder-body">
              <h3 ref={heading} tabIndex={-1}>
                {steps[draft.step]}
              </h3>
              {draft.submitted && (
                <p className="bolig-notice" role="status">
                  Opprettelse er forsøkt. Kontroller resultatet med samme
                  oppsett før du starter et nytt prosjekt.
                </p>
              )}
              <fieldset disabled={busy || draft.submitted}>
                {draft.step === 0 && (
                  <>
                    <div className="bolig-builder-fields">
                      <label>
                        Prosjektnavn
                        <input
                          required
                          maxLength={160}
                          value={draft.title}
                          onChange={(e) => update({ title: e.target.value })}
                          placeholder="F.eks. Solgløtt borettslag"
                        />
                      </label>
                      <label>
                        Prosjektnummer <small>valgfritt</small>
                        <input
                          maxLength={80}
                          value={draft.reference}
                          onChange={(e) =>
                            update({ reference: e.target.value })
                          }
                          placeholder="Deres prosjektnummer"
                        />
                      </label>
                    </div>
                    <p className="bolig-builder-hint">
                      Hva skal du bygge opp? Du kan velge ulik boligtype for
                      hvert bygg i neste trinn.
                    </p>
                    <div className="bolig-type-cards">
                      {[
                        ...BUILDING_TYPES,
                        {
                          id: "field",
                          label: "Boligfelt",
                          detail: "Flere hus med hver sin adresse",
                        },
                      ].map((t) => (
                        <button
                          type="button"
                          key={t.id}
                          className="bolig-type-card"
                          aria-pressed={draft.type === t.id}
                          onClick={() => changeType(t.id)}
                        >
                          <BoligBuildingArt type={t.id} />
                          <span>
                            <b>{t.label}</b>
                            <small>{t.detail}</small>
                          </span>
                          <CheckCircle2 size={19} />
                        </button>
                      ))}
                    </div>
                  </>
                )}
                {(draft.step === 1 || draft.step === 2) && (
                  <>
                    <p className="bolig-builder-hint">
                      {draft.step === 1
                        ? "Gi hvert bygg et navn og en adresse. En lang blokk med flere oppganger er ett bygg."
                        : "Velg et bygg. Tilpass oppganger og boliger. Totalen regnes ut for deg."}
                    </p>
                    <div className="bolig-builder-layout">
                      <aside className="bolig-builder-sidebar">
                        <label>
                          Antall bygg
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={draft.buildings.length}
                            onChange={(e) =>
                              resizeBuildings(Number(e.target.value))
                            }
                          />
                        </label>
                        <nav aria-label="Velg bygg i prosjektkladd">
                          {draft.buildings.map((v, i) => (
                            <button
                              type="button"
                              key={v.key}
                              aria-pressed={v.key === b.key}
                              onClick={() => update({ selected: i })}
                            >
                              <Building2 size={16} />
                              <span>
                                <b>{v.name}</b>
                                <small>{v.address || "Adresse mangler"}</small>
                              </span>
                              <small>{buildingTotal(v)}</small>
                            </button>
                          ))}
                        </nav>
                        <button
                          type="button"
                          onClick={() =>
                            resizeBuildings(draft.buildings.length + 1)
                          }
                        >
                          <Plus size={16} />
                          Legg til bygg
                        </button>
                      </aside>
                      <div className="bolig-builder-editor">
                        <div className="bolig-builder-building-head">
                          <BoligBuildingArt type={b.building_type} />
                          <div>
                            <small>{typeInfo(b.building_type).label}</small>
                            <h4>{b.name}</h4>
                            <p>
                              {buildingTotal(b)} boliger
                              {b.building_type === "apartment"
                                ? ` · ${b.entrances.length} ${b.entrances.length === 1 ? "oppgang" : "oppganger"}`
                                : ""}
                            </p>
                          </div>
                        </div>
                        {draft.step === 1 ? (
                          <>
                            <div className="bolig-builder-fields">
                              <label>
                                Byggnavn
                                <input
                                  required
                                  maxLength={100}
                                  value={b.name}
                                  onChange={(e) =>
                                    changeBuilding({ name: e.target.value })
                                  }
                                />
                              </label>
                              <label>
                                Boligtype
                                <select
                                  value={b.building_type}
                                  onChange={(e) =>
                                    changeBuilding({
                                      building_type: e.target.value,
                                      entrances: [
                                        {
                                          key: b.entrances[0].key,
                                          address: "",
                                          counts: [
                                            ...typeInfo(e.target.value).floors,
                                          ],
                                        },
                                      ],
                                    })
                                  }
                                >
                                  {BUILDING_TYPES.map((t) => (
                                    <option key={t.id} value={t.id}>
                                      {t.label}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <label className="bolig-span-all">
                                Byggets adresse
                                <input
                                  required
                                  maxLength={200}
                                  value={b.address}
                                  onChange={(e) =>
                                    changeBuilding({ address: e.target.value })
                                  }
                                  placeholder="Gate og husnummer, postnummer og sted"
                                />
                              </label>
                            </div>
                            <div className="bolig-builder-tools">
                              <button
                                type="button"
                                onClick={() => {
                                  const copy = {
                                    ...b,
                                    key: localId(),
                                    name: `Bygg ${draft.buildings.length + 1}`,
                                    address: "",
                                    entrances: b.entrances.map((e) => ({
                                      ...e,
                                      key: localId(),
                                      address: "",
                                      counts: [...e.counts],
                                    })),
                                  };
                                  update({
                                    buildings: [...draft.buildings, copy],
                                    selected: draft.buildings.length,
                                  });
                                }}
                                disabled={draft.buildings.length >= 100}
                              >
                                <Copy size={15} />
                                Kopier oppsett til nytt bygg
                              </button>
                              {draft.buildings.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    update({
                                      buildings: draft.buildings.filter(
                                        (v) => v.key !== b.key,
                                      ),
                                      selected: 0,
                                    })
                                  }
                                >
                                  Fjern bygg
                                </button>
                              )}
                            </div>
                            <small className="bolig-builder-hint">
                              Kopiering tar med boligtype og etasjer. Fyll inn
                              en ny adresse.
                            </small>
                          </>
                        ) : b.building_type === "house" ? (
                          <>
                            <label>
                              Etasjer i huset
                              <input
                                type="number"
                                min="1"
                                max="30"
                                value={b.house_floors}
                                onChange={(e) =>
                                  changeBuilding({
                                    house_floors: Number(e.target.value),
                                  })
                                }
                              />
                            </label>
                            <p className="bolig-builder-house-note">
                              <Home size={22} />
                              Huset registreres som én bolig. Flere etasjer blir
                              ikke flere husstander.
                            </p>
                          </>
                        ) : (
                          <>
                            {b.building_type === "apartment" && (
                              <label>
                                Antall oppganger
                                <input
                                  type="number"
                                  min="1"
                                  max="100"
                                  value={b.entrances.length}
                                  onChange={(e) => {
                                    const n = Number(e.target.value);
                                    if (
                                      Number.isInteger(n) &&
                                      n >= b.entrances.length &&
                                      n <= 100
                                    )
                                      changeBuilding({
                                        entrances: Array.from(
                                          { length: n },
                                          (_, i) =>
                                            b.entrances[i] || {
                                              key: localId(),
                                              address: "",
                                              counts: [
                                                ...b.entrances[0].counts,
                                              ],
                                            },
                                        ),
                                      });
                                    else if (n < b.entrances.length)
                                      setError(
                                        "Bruk «Fjern oppgang» på den oppgangen du vil ta bort.",
                                      );
                                  }}
                                />
                              </label>
                            )}
                            {b.entrances.length > 1 && (
                              <div className="bolig-builder-entrance-picker">
                                <label>
                                  Oppgang i bygget
                                  <select
                                    aria-label="Oppgang i bygget"
                                    value={activeDraftEntrance.key}
                                    onChange={(e) =>
                                      changeBuilding({
                                        entrance_key: e.target.value,
                                      })
                                    }
                                  >
                                    {b.entrances.map((e, i) => (
                                      <option key={e.key} value={e.key}>
                                        {i + 1}.{" "}
                                        {e.address || "Adresse mangler"}
                                      </option>
                                    ))}
                                  </select>
                                </label>
                                <small>
                                  {
                                    b.entrances.filter((e) => e.address.trim())
                                      .length
                                  }{" "}
                                  av {b.entrances.length} oppgangsadresser fylt
                                  inn
                                </small>
                              </div>
                            )}
                            {b.entrances
                              .filter((e) => e.key === activeDraftEntrance.key)
                              .map((e) => (
                                <details
                                  className="bolig-builder-entrance"
                                  key={e.key}
                                  open
                                >
                                  <summary>
                                    {b.building_type === "apartment"
                                      ? `Oppgang ${b.entrances.indexOf(e) + 1}`
                                      : "Boligfordeling"}
                                    <span>
                                      {e.address || b.address} ·{" "}
                                      {e.counts.reduce(
                                        (s, n) => s + Number(n),
                                        0,
                                      )}{" "}
                                      boliger
                                    </span>
                                  </summary>
                                  <div>
                                    {b.entrances.length > 1 && (
                                      <label>
                                        Oppgangens adresse
                                        <input
                                          required
                                          maxLength={200}
                                          value={e.address}
                                          placeholder={b.address}
                                          onChange={(ev) =>
                                            changeBuilding({
                                              entrances: b.entrances.map((v) =>
                                                v.key === e.key
                                                  ? {
                                                      ...v,
                                                      address: ev.target.value,
                                                    }
                                                  : v,
                                              ),
                                            })
                                          }
                                        />
                                      </label>
                                    )}
                                    <label>
                                      Antall etasjer
                                      <input
                                        type="number"
                                        min="1"
                                        max="30"
                                        value={e.counts.length}
                                        onChange={(ev) => {
                                          const n = Number(ev.target.value);
                                          if (
                                            Number.isInteger(n) &&
                                            n >= 1 &&
                                            n <= 30
                                          )
                                            changeBuilding({
                                              entrances: b.entrances.map((v) =>
                                                v.key === e.key
                                                  ? {
                                                      ...v,
                                                      counts: Array.from(
                                                        { length: n },
                                                        (_, i) =>
                                                          v.counts[i] ??
                                                          v.counts[0],
                                                      ),
                                                    }
                                                  : v,
                                              ),
                                            });
                                        }}
                                      />
                                    </label>
                                    <div className="bolig-builder-floor-grid">
                                      {e.counts.map((n, floor) => (
                                        <label key={floor}>
                                          {floor + 1}. etasje
                                          <input
                                            type="number"
                                            min="1"
                                            max="20"
                                            required
                                            value={n}
                                            onChange={(ev) =>
                                              changeBuilding({
                                                entrances: b.entrances.map(
                                                  (v) =>
                                                    v.key === e.key
                                                      ? {
                                                          ...v,
                                                          counts: v.counts.map(
                                                            (x, i) =>
                                                              i === floor
                                                                ? ev.target
                                                                    .value
                                                                : x,
                                                          ),
                                                        }
                                                      : v,
                                                ),
                                              })
                                            }
                                          />
                                          <small>boliger</small>
                                        </label>
                                      ))}
                                    </div>
                                    {b.entrances.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          changeBuilding({
                                            entrances: b.entrances.filter(
                                              (v) => v.key !== e.key,
                                            ),
                                          })
                                        }
                                      >
                                        Fjern oppgang
                                      </button>
                                    )}
                                  </div>
                                </details>
                              ))}
                          </>
                        )}
                      </div>
                    </div>
                  </>
                )}
                {draft.step === 3 && (
                  <>
                    <p className="bolig-builder-hint">
                      Se over byggene før du oppretter prosjektforsiden. Du kan
                      gå tilbake og rette ett bygg uten å starte på nytt.
                    </p>
                    <div className="bolig-plan-totals">
                      <span>
                        <b>{draft.title}</b>
                        <small>
                          {draft.reference || "Uten prosjektnummer"} ·{" "}
                          {context.company_name}
                        </small>
                      </span>
                      <span>
                        <b>{draft.buildings.length}</b>
                        <small>bygg</small>
                      </span>
                      <span>
                        <b>{total}</b>
                        <small>boliger</small>
                      </span>
                    </div>
                    <div className="bolig-builder-review">
                      {draft.buildings.map((v, i) => (
                        <article key={v.key}>
                          <BoligBuildingArt type={v.building_type} />
                          <div>
                            <b>{v.name}</b>
                            <small>
                              <MapPin size={13} />
                              {v.address}
                            </small>
                            <small>
                              {typeInfo(v.building_type).label} ·{" "}
                              {buildingTotal(v)} boliger
                            </small>
                            {v.building_type === "apartment" && (
                              <>
                                <small>
                                  {v.entrances.length}{" "}
                                  {v.entrances.length === 1
                                    ? "oppgang"
                                    : "oppganger"}{" "}
                                  ·{" "}
                                  {Math.min(
                                    ...v.entrances.map((e) => e.counts.length),
                                  ) ===
                                  Math.max(
                                    ...v.entrances.map((e) => e.counts.length),
                                  )
                                    ? v.entrances[0].counts.length
                                    : `${Math.min(...v.entrances.map((e) => e.counts.length))}–${Math.max(...v.entrances.map((e) => e.counts.length))}`}{" "}
                                  etasjer
                                </small>
                                <details className="bolig-review-distribution">
                                  <summary>
                                    Se oppganger og boligfordeling
                                  </summary>
                                  <div>
                                    {v.entrances.map((e, index) => (
                                      <p key={e.key}>
                                        <b>
                                          {index + 1}. {e.address || v.address}
                                        </b>
                                        <small>
                                          {e.counts.length} etasjer ·{" "}
                                          {e.counts.reduce(
                                            (sum, n) => sum + Number(n),
                                            0,
                                          )}{" "}
                                          boliger
                                        </small>
                                      </p>
                                    ))}
                                  </div>
                                </details>
                              </>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => update({ selected: i, step: 1 })}
                          >
                            Rediger bygg
                          </button>
                        </article>
                      ))}
                    </div>
                    <div className="bolig-builder-house-note">
                      <CheckCircle2 size={23} />
                      <p>
                        Etter opprettelse velger du grunnpakker og tilvalg. Rom
                        og dokumentasjon kan legges til senere.
                      </p>
                    </div>
                  </>
                )}
              </fieldset>
              {error && (
                <p role="alert" className="bolig-error">
                  {error}
                </p>
              )}
              {warning && (
                <p role="status" className="bolig-error">
                  {warning}
                </p>
              )}
            </div>
            <footer className="bolig-builder-footer">
              <span>
                <small>Kladd i denne nettleseren</small>
                <b>
                  {draft.buildings.length} bygg · {total} boliger
                </b>
              </span>
              <div>
                <button
                  type="button"
                  disabled={busy || draft.submitted}
                  onClick={() =>
                    draft.step ? update({ step: draft.step - 1 }) : close()
                  }
                >
                  <ArrowLeft size={16} />
                  {draft.step ? "Tilbake" : "Lukk"}
                </button>
                <button className="bolig-primary" type="submit" disabled={busy}>
                  {busy
                    ? "Oppretter …"
                    : draft.submitted
                      ? "Kontroller opprettelsen"
                      : draft.step === 3
                        ? "Opprett prosjektforside"
                        : "Neste"}
                  {draft.step === 3 ? (
                    <Check size={17} />
                  ) : (
                    <ArrowRight size={17} />
                  )}
                </button>
              </div>
            </footer>
          </form>
        </dialog>,
        document.body,
      )}
    </>
  );
}
