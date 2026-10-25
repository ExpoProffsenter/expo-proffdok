import React, { useState } from "react";
import Dialog from "./BoligEditorDialog.jsx";
import { useSiteRoster } from "./boligSiteRoster.js";
import {
  activeRosterPeople,
  downloadSiteRoster,
  rosterStatus,
} from "./boligSiteRosterExport.mjs";
import "./boligSiteRoster.css";
const date = (x) =>
  x
    ? new Date(x).toLocaleString("nb-NO", { timeZone: "Europe/Oslo" })
    : "Ikke kontrollert";
const kindLabels = {
  employed: "Ansatt",
  hired: "Innleid",
  self_employed: "Enmannsbedrift",
};
const actionLabels = {
  settings: "Byggeplass endret",
  employer: "Virksomhet lagret",
  person: "Person lagret",
  review: "Daglig kontroll",
};
function Roster({ context, root, onClose }) {
  const {
    data,
    error,
    busy,
    draft,
    pending,
    query,
    load,
    edit,
    setDraft,
    save,
    isCurrent,
  } = useSiteRoster(context, root);
  const [tab, setTab] = useState("overview"),
    [search, setSearch] = useState(""),
    [page, setPage] = useState(0),
    [review, setReview] = useState(false),
    [closing, setClosing] = useState(false),
    [exporting, setExporting] = useState(false),
    [exportError, setExportError] = useState("");
  const doc = data?.document,
    locked = busy || !!pending || exporting,
    readonly = !data || data.readonly,
    dirty = !!draft || !!pending;
  const close = () => {
    if (dirty) setClosing(true);
    else onClose();
  };
  const set = (key, value) =>
    setDraft((d) => ({ ...d, values: { ...d.values, [key]: value } }));
  const newPerson = (source = null) => {
    edit("person", {
      id: crypto.randomUUID(),
      name: source?.name || "",
      birth_date: "",
      employer_id: "",
      employment_type: "employed",
      hirer_id: "",
      card_status: "number",
      card_number: "",
      application_reference: "",
      starts_on: data.today,
      ends_on: "",
      ...(source
        ? {
            [source.kind === "person" ? "source_person_id" : "source_visit_id"]:
              source.id,
          }
        : {}),
    });
    setTab("people");
  };
  const changeTab = (id) => {
    if (dirty) return;
    setTab(id);
    setSearch("");
    setPage(0);
    setReview(false);
  };
  const exportList = async (format) => {
    setExporting(true);
    setExportError("");
    try {
      await downloadSiteRoster({
        context,
        rootId: root.id,
        expected: data,
        query,
        format,
        isCurrent,
      });
    } catch (e) {
      setExportError(e.message);
      await load();
    } finally {
      setExporting(false);
    }
  };
  const text = (key, label, max = 160, type = "text", required = false) => (
    <label>
      {label}
      <input
        type={type}
        maxLength={max}
        required={required}
        value={draft.values[key] || ""}
        disabled={locked}
        onChange={(e) => set(key, e.target.value)}
      />
    </label>
  );
  const companySelect = (key, label) => (
    <label>
      {label}
      <select
        aria-label={label}
        value={draft.values[key] || ""}
        disabled={locked}
        onChange={(e) => set(key, e.target.value)}
      >
        <option value="">Velg virksomhet</option>
        {doc.employers.map((e) => (
          <option key={e.id} value={e.id}>
            {e.name}
            {e.organisation_number ? " · " + e.organisation_number : ""}
          </option>
        ))}
      </select>
    </label>
  );
  const filtered = (
    tab === "companies" ? doc?.employers || [] : doc?.people || []
  ).filter((p) =>
    p.name.toLocaleLowerCase("nb").includes(search.toLocaleLowerCase("nb")),
  );
  return (
    <Dialog
      title="Oversiktsliste ved tilsyn"
      className="bolig-site-roster"
      busy={busy || exporting}
      onClose={close}
    >
      <p>
        Før virksomheter og alle som skal arbeide her. Kontroller listen daglig.
        Last ned PDF eller CSV ved tilsyn.
      </p>
      {closing && (
        <div role="alert" className="roster-warning">
          <p>
            {pending
              ? "En lagring mangler bekreftelse. Hent siste liste og prøv samme lagring igjen før du lukker."
              : "Du har en ulagret kladd. Den forsvinner hvis du lukker eller laster siden på nytt."}
          </p>
          <button
            type="button"
            disabled={busy}
            onClick={() => setClosing(false)}
          >
            Fortsett her
          </button>
          <button type="button" disabled={busy} onClick={onClose}>
            Lukk og forkast kladden
          </button>
        </div>
      )}
      {error && <p role="alert">{error}</p>}
      {exportError && <p role="alert">{exportError}</p>}
      <div className="roster-actions">
        <button
          type="button"
          disabled={busy || exporting}
          onClick={() => load()}
        >
          Hent siste oversiktsliste
        </button>
        {pending && (
          <button
            type="button"
            disabled={busy || !data}
            onClick={() => save(null, null, true)}
          >
            Prøv samme lagring igjen
          </button>
        )}
      </div>
      {pending && (
        <p role="status">
          Lagring er ikke bekreftet. Prøv samme lagring igjen. Lukk ikke siden
          før svaret er bekreftet.
        </p>
      )}
      {!data ? (
        <p role="status">
          Bekrefter tilgang og lagrede opplysninger. Ulagret kladd beholdes i
          minnet mens denne siden er åpen.
        </p>
      ) : (
        <>
          <nav
            aria-label="Velg innhold i oversiktslisten"
            className="roster-tabs"
          >
            {[
              ["overview", "Oversikt"],
              ["people", `Personer (${doc?.people.length || 0})`],
              ["companies", `Virksomheter (${doc?.employers.length || 0})`],
              ["history", "Historikk"],
            ].map(([id, label]) => (
              <button
                type="button"
                key={id}
                aria-pressed={tab === id}
                disabled={dirty || locked}
                onClick={() => changeTab(id)}
              >
                {label}
              </button>
            ))}
          </nav>
          <div className="roster-date">
            <label>
              Dato for oversiktslisten
              <input
                type="date"
                value={data.day}
                max={data.today}
                disabled={dirty || locked}
                onChange={(e) => {
                  setReview(false);
                  load({ day: e.target.value });
                }}
              />
            </label>
            {(data.readonly || query.snapshot_id) && (
              <>
                <strong>
                  Leser lagret historikk
                  {root.archived ? " · Prosjektet er arkivert" : ""}
                </strong>
                <button
                  type="button"
                  disabled={locked}
                  onClick={() => load({})}
                >
                  Til dagens liste
                </button>
              </>
            )}
          </div>
          {!doc ? (
            <p>
              Ingen lagret oversiktsliste finnes for denne datoen. Velg en annen
              dato eller gå til dagens liste.
            </p>
          ) : (
            <>
              <div
                className={
                  "roster-summary " + (data.checked ? "roster-checked" : "")
                }
              >
                <strong>{rosterStatus(data)}</strong>
                <span>
                  {activeRosterPeople(data).length} personer på valgt dag ·
                  Versjon {doc.revision}
                </span>
                {data.source_day && (
                  <span>
                    Grunnlag fra {data.source_day}. Senere endringer inngår
                    ikke.
                  </span>
                )}
              </div>
              {tab === "overview" && (
                <>
                  <article>
                    <h3>{doc.site.name || "Byggeplass mangler navn"}</h3>
                    <p>
                      {doc.site.address || "Adresse mangler"}
                      <br />
                      Byggherre: {doc.site.client_name || "Mangler"}
                      <br />
                      Listefører: {doc.site.keeper_name || "Ikke angitt"}
                    </p>
                    <p>
                      Kontrollert: {date(doc.review?.at)}
                      {doc.review?.name ? " · " + doc.review.name : ""}
                    </p>
                    <button
                      type="button"
                      disabled={readonly || locked || dirty}
                      onClick={() => edit("settings", doc.site)}
                    >
                      Rediger byggeplass
                    </button>
                  </article>
                  <details>
                    <summary>Ansvar og kontroll av opplysninger</summary>
                    <p>
                      Byggherren har ansvaret for listen. Avtal skriftlig hvem
                      som fører den. Kontroller også hvem som faktisk skal
                      arbeide her. Utfylte felt er ingen automatisk kontroll av
                      registre eller HMS-kort. Inn-/utregistreringen brukes som
                      før og erstatter ikke denne listen.
                    </p>
                  </details>
                  <div
                    className={
                      data.missing.length ? "roster-warning" : "roster-complete"
                    }
                  >
                    <strong>
                      {data.missing.length
                        ? `${data.missing.length} registreringer mangler opplysninger`
                        : "Nødvendige felt er utfylt"}
                    </strong>
                    {data.missing.map((m) => (
                      <p key={m.kind + m.id}>
                        <b>{m.title}:</b> {m.fields.join(", ")}{" "}
                        <button
                          type="button"
                          disabled={readonly || locked || dirty}
                          onClick={() => {
                            if (m.kind === "site") edit("settings", doc.site);
                            else
                              edit(
                                m.kind === "person" ? "person" : "employer",
                                (m.kind === "person"
                                  ? doc.people
                                  : doc.employers
                                ).find((x) => x.id === m.id),
                              );
                          }}
                        >
                          Fyll ut
                        </button>
                      </p>
                    ))}
                  </div>
                  {!readonly && (
                    <div className="roster-review">
                      <label>
                        <input
                          type="checkbox"
                          checked={review}
                          disabled={locked || dirty || !!data.missing.length}
                          onChange={(e) => setReview(e.target.checked)}
                        />
                        Jeg har kontrollert opplysningene og at alle som skal
                        arbeide her i dag er med.
                      </label>
                      <button
                        type="button"
                        disabled={
                          locked || dirty || !review || !!data.missing.length
                        }
                        onClick={async () => {
                          if (await save("review", {})) setReview(false);
                        }}
                      >
                        Bekreft daglig kontroll
                      </button>
                    </div>
                  )}
                  <p>
                    {doc.site.ended_on
                      ? `Arbeidet avsluttet ${doc.site.ended_on}. Listen skal oppbevares minst til ${data.retain_until}.`
                      : "Registrer faktisk avslutningsdato under «Rediger byggeplass». Listen skal oppbevares minst seks måneder etter avsluttet bygge-/anleggsarbeid."}{" "}
                    Tidligere versjoner beholdes. Ingen automatisk sletting.
                  </p>
                </>
              )}
              {(tab === "people" || tab === "companies") && !draft && (
                <>
                  <div className="roster-actions">
                    <button
                      type="button"
                      disabled={readonly || locked}
                      onClick={() =>
                        tab === "people"
                          ? newPerson()
                          : edit("employer", {
                              id: crypto.randomUUID(),
                              name: "",
                              organisation_number: "",
                              registration_required: true,
                              exemption_reason: "",
                            })
                      }
                    >
                      {tab === "people"
                        ? "Legg til person"
                        : "Legg til virksomhet"}
                    </button>
                    <label>
                      Søk i {tab === "people" ? "personer" : "virksomheter"}
                      <input
                        type="search"
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value);
                          setPage(0);
                        }}
                      />
                    </label>
                  </div>
                  {tab === "people" && (
                    <p>
                      Personer trenger ikke appkonto. Arbeidsperioden styrer
                      hvem som kommer med i eksporten på valgt dato. Avslutt
                      perioden når personen slutter på plassen.
                    </p>
                  )}
                  <div className="roster-records">
                    {filtered.slice(page * 20, (page + 1) * 20).map((p) => (
                      <article key={p.id}>
                        <h3>{p.name}</h3>
                        {tab === "people" ? (
                          <p>
                            {doc.employers.find((e) => e.id === p.employer_id)
                              ?.name || "Arbeidsgiver mangler"}{" "}
                            · {kindLabels[p.employment_type]}
                            <br />
                            {p.starts_on} – {p.ends_on || "pågående"}
                            {p.starts_on > data.day ? " · Starter senere" : ""}
                            {p.ends_on && p.ends_on < data.day
                              ? " · Avsluttet"
                              : ""}
                          </p>
                        ) : (
                          <p>
                            {p.organisation_number ||
                              "Uten organisasjonsnummer"}
                            {!p.registration_required
                              ? " · Ikke registreringspliktig"
                              : ""}
                          </p>
                        )}
                        <button
                          type="button"
                          disabled={readonly || locked}
                          onClick={() =>
                            edit(tab === "people" ? "person" : "employer", p)
                          }
                        >
                          Rediger {tab === "people" ? "person" : "virksomhet"}
                        </button>
                      </article>
                    ))}
                  </div>
                  {!filtered.length && (
                    <p>
                      Ingen {tab === "people" ? "personer" : "virksomheter"} å
                      vise.
                    </p>
                  )}
                  {filtered.length > 20 && (
                    <div className="roster-actions">
                      <button
                        type="button"
                        disabled={!page}
                        onClick={() => setPage((p) => p - 1)}
                      >
                        Forrige side
                      </button>
                      <span>
                        Side {page + 1} av {Math.ceil(filtered.length / 20)}
                      </span>
                      <button
                        type="button"
                        disabled={(page + 1) * 20 >= filtered.length}
                        onClick={() => setPage((p) => p + 1)}
                      >
                        Neste side
                      </button>
                    </div>
                  )}
                  {tab === "people" && !readonly && (
                    <details>
                      <summary>
                        Hent fra deltakere og dagens manuelle registreringer
                      </summary>
                      <p>
                        Hent én person, velg virksomhet og fyll inn resten. Navn
                        brukes aldri til å slå sammen personer automatisk.
                      </p>
                      {data.candidates
                        .filter((c) => !c.registered_id)
                        .map((c) => (
                          <div className="roster-candidate" key={c.kind + c.id}>
                            <span>
                              {c.name} · {c.company}
                              {c.enabled === false
                                ? " · Deltaker deaktivert"
                                : ""}
                            </span>
                            <button
                              type="button"
                              disabled={locked}
                              onClick={() => newPerson(c)}
                            >
                              Hent person
                            </button>
                          </div>
                        ))}
                      {!data.candidates.some((c) => !c.registered_id) && (
                        <p>Ingen flere deltakere å hente.</p>
                      )}
                    </details>
                  )}
                </>
              )}
              {draft && (
                <form
                  className="roster-editor"
                  onSubmit={(e) => {
                    e.preventDefault();
                    save();
                  }}
                >
                  <h3>
                    {draft.action === "settings"
                      ? "Byggeplassen"
                      : draft.action === "person"
                        ? "Personopplysninger"
                        : "Virksomhet"}
                  </h3>
                  <p>
                    Kladden beholdes ved fanebytte. Lagre før du lukker eller
                    laster siden på nytt. Feltene kan fylles ut etter hvert.
                    Manglende opplysninger vises i oversikten.
                  </p>
                  <div className="roster-fields">
                    {draft.action === "settings" && (
                      <>
                        {text("name", "Navn på byggeplassen", 160)}
                        {text("address", "Byggeplassens adresse", 1000)}
                        {text("client_name", "Byggherrens navn", 160)}
                        {text("keeper_name", "Listefører (valgfritt)", 160)}
                        {text(
                          "ended_on",
                          "Faktisk avslutningsdato",
                          10,
                          "date",
                        )}
                      </>
                    )}
                    {draft.action === "employer" && (
                      <>
                        {text("name", "Virksomhetens navn", 160, "text", true)}
                        {text(
                          "organisation_number",
                          "Organisasjonsnummer (ni sifre)",
                          30,
                        )}
                        <label>
                          <input
                            type="checkbox"
                            checked={draft.values.registration_required}
                            disabled={locked}
                            onChange={(e) =>
                              set("registration_required", e.target.checked)
                            }
                          />
                          Virksomheten er registreringspliktig i Norge
                        </label>
                        {!draft.values.registration_required &&
                          text(
                            "exemption_reason",
                            "Begrunnelse for manglende registreringsplikt",
                            500,
                          )}
                      </>
                    )}
                    {draft.action === "person" && (
                      <>
                        {text("name", "Personens navn", 120, "text", true)}
                        {text("birth_date", "Fødselsdato", 10, "date")}
                        {companySelect(
                          "employer_id",
                          "Arbeidsgiver / enmannsbedrift",
                        )}
                        <label>
                          Arbeidsforhold
                          <select
                            aria-label="Arbeidsforhold"
                            value={draft.values.employment_type}
                            disabled={locked}
                            onChange={(e) =>
                              set("employment_type", e.target.value)
                            }
                          >
                            {Object.entries(kindLabels).map(([k, v]) => (
                              <option key={k} value={k}>
                                {v}
                              </option>
                            ))}
                          </select>
                        </label>
                        {draft.values.employment_type === "hired" &&
                          companySelect("hirer_id", "Innleievirksomhet")}
                        <label>
                          HMS-kort
                          <select
                            aria-label="HMS-kort"
                            value={draft.values.card_status}
                            disabled={locked}
                            onChange={(e) => set("card_status", e.target.value)}
                          >
                            <option value="number">Kortnummer</option>
                            <option value="applied">
                              Søknad sendt – dokumentasjon kan fremlegges
                            </option>
                          </select>
                        </label>
                        {draft.values.card_status === "number"
                          ? text("card_number", "HMS-kortnummer", 60)
                          : text(
                              "application_reference",
                              "Dokumentasjonsreferanse til HMS-kortsøknad",
                              500,
                            )}
                        {text(
                          "starts_on",
                          "Arbeider her fra",
                          10,
                          "date",
                          true,
                        )}
                        {text(
                          "ends_on",
                          "Siste arbeidsdag (valgfritt)",
                          10,
                          "date",
                        )}
                        {!doc.employers.length && (
                          <p>
                            Du kan lagre personen nå. Legg deretter til en
                            virksomhet og velg den på personen.
                          </p>
                        )}
                      </>
                    )}
                  </div>
                  {draft.revision !== data.revision && (
                    <div role="alert" className="roster-warning">
                      <p>
                        Listen er endret. Se over siste lagrede liste før du
                        bruker kladden.
                      </p>
                      <button
                        type="button"
                        disabled={locked}
                        onClick={() =>
                          setDraft((d) => ({ ...d, revision: data.revision }))
                        }
                      >
                        Jeg har sett siste liste
                      </button>
                    </div>
                  )}
                  <div className="roster-actions">
                    <button
                      disabled={
                        locked || readonly || draft.revision !== data.revision
                      }
                    >
                      Lagre endringer
                    </button>
                    <button
                      type="button"
                      disabled={locked}
                      onClick={() => setDraft(null)}
                    >
                      Forkast kladden
                    </button>
                  </div>
                </form>
              )}
              {tab === "history" && (
                <>
                  <p>
                    Hver lagring bevarer en versjon. Velg en versjon for å lese
                    og eksportere nøyaktig det lagrede grunnlaget.
                  </p>
                  {data.history.map((h) => (
                    <article key={h.id}>
                      <h3>
                        Versjon {h.revision} ·{" "}
                        {actionLabels[h.action] || h.action}
                      </h3>
                      <p>
                        {date(h.created_at)} · {h.actor_name}
                      </p>
                      <button
                        type="button"
                        disabled={locked}
                        onClick={() => load({ snapshot_id: h.id })}
                      >
                        Vis versjon {h.revision}
                      </button>
                    </article>
                  ))}
                  {data.history.length === 30 && (
                    <button
                      type="button"
                      disabled={locked}
                      onClick={() =>
                        load({
                          ...query,
                          before_revision: data.history.at(-1).revision,
                        })
                      }
                    >
                      Vis eldre versjoner
                    </button>
                  )}
                  {!data.history.length && (
                    <p>Ingen lagrede versjoner i denne delen av historikken.</p>
                  )}
                </>
              )}
              <footer className="roster-export">
                <p>
                  Eksport inneholder fødselsdato og HMS-opplysninger. Del bare
                  med dem som skal ha innsyn. Ulagret kladd inngår ikke.
                </p>
                <div className="roster-actions">
                  <button
                    type="button"
                    disabled={locked || dirty}
                    onClick={() => exportList("pdf")}
                  >
                    {exporting
                      ? "Forbereder eksport …"
                      : "Last ned oversiktsliste (PDF)"}
                  </button>
                  <button
                    type="button"
                    disabled={locked || dirty}
                    onClick={() => exportList("csv")}
                  >
                    Last ned oversiktsliste (CSV)
                  </button>
                  <button
                    type="button"
                    disabled={busy || exporting}
                    onClick={close}
                  >
                    Lukk oversiktslisten
                  </button>
                </div>
              </footer>
            </>
          )}
        </>
      )}
      <div className="roster-jumps" aria-label="Rull i oversiktslisten">
        <button
          type="button"
          aria-label="Til toppen av oversiktslisten"
          onClick={(e) =>
            e.currentTarget
              .closest("dialog")
              .scrollTo({ top: 0, behavior: "smooth" })
          }
        >
          ↑
        </button>
        <button
          type="button"
          aria-label="Til bunnen av oversiktslisten"
          onClick={(e) => {
            const d = e.currentTarget.closest("dialog");
            d.scrollTo({ top: d.scrollHeight, behavior: "smooth" });
          }}
        >
          ↓
        </button>
      </div>
    </Dialog>
  );
}
export default function BoligSiteRoster(props) {
  return (
    <Roster
      key={`${props.context.user_id}/${props.context.company_id}/${props.root.id}`}
      {...props}
    />
  );
}
