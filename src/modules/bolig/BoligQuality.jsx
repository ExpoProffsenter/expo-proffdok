import React, { useEffect, useRef, useState } from "react";
import {
  ClipboardCheck,
  Files,
  BookOpen,
  FileCheck2,
  Plus,
  ArrowUpRight,
  Download,
  RefreshCw,
} from "lucide-react";
import Dialog from "./BoligEditorDialog.jsx";
import DraftForm from "./BoligDraftForm.jsx";
import ChecklistFields, {
  ChecklistFieldBuilder,
} from "../checklist/ChecklistFields.jsx";
import { invalidateFieldConfirmations } from "../checklist/checklistFields.mjs";
import { PROJECT_DESIGN_CHECKLIST } from "../config/projectDesignChecklist.mjs";
import { WORK_PROFILE_EVENT } from "../access/workProfileClient.js";
import {
  MANAGED_ACCESS_EVENT,
  MODULE_ACCESS_EVENT,
} from "../access/moduleAccessClient.js";
import {
  qualityRpc,
  QUALITY_EVENT,
  uploadQualityFile,
  openQualityFile,
} from "./boligQualityClient.js";
import { downloadBoligFdv } from "./boligFdvPdf.mjs";
import DocumentationExport from "./BoligDocumentationExport.jsx";
import QualityDistribution from "./BoligQualityDistribution.jsx";
import ProtocolMail from "./BoligProtocolMail.jsx";
const date = (v) =>
  v ? new Date(v).toLocaleString("nb-NO", { timeZone: "Europe/Oslo" }) : "";
const point = () => ({
  id: crypto.randomUUID(),
  title: "",
  guidance: "",
  image_required: false,
  comment_required: false,
  fields: [],
});
const blank = () => ({
  title: "",
  trade: "Felles – alle fag",
  instructions: "",
  points: [point()],
});
const tabs = [
  ["checks", "Sjekklister", ClipboardCheck],
  ["documents", "Filer og bilder", Files],
  ["fdv", "FDV", BookOpen],
  ["protocols", "Ekstern protokoll", FileCheck2],
];
const actions = {
  check_add: "Sjekkliste opprettet",
  check_requirement: "Krav til kontroll oppdatert",
  check_save: "Kontroll lagret",
  check_reopen: "Kontroll gjenåpnet",
  check_archive: "Kontroll arkivert",
  document: "Fil registrert",
  protocol_add: "Protokoll registrert",
  protocol_save: "Merknader lagret",
  protocol_confirm: "Retting bekreftet",
  protocol_reopen: "Bekreftelse gjenåpnet",
  fdv_link: "FDV-lenke oppdatert",
};
export default function BoligQuality({ context, root, scopeId, onChange }) {
  const [data, setData] = useState(null),
    [tab, setTab] = useState("checks"),
    [editor, setEditor] = useState(null),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [verified, setVerified] = useState(false),
    [mail, setMail] = useState(null),
    [distribution, setDistribution] = useState(false),
    [exportOpen, setExportOpen] = useState(false),
    [snapshot, setSnapshot] = useState(null);
  const epoch = useRef(0),
    alive = useRef(true);
  const currentTicket = (t) => alive.current && epoch.current === t;
  const load = async (revoke = false) => {
    const t = ++epoch.current;
    if (revoke) setVerified(false);
    try {
      const d = await qualityRpc(context, root.id, scopeId);
      if (!currentTicket(t)) return;
      setData(d);
      setVerified(true);
    } catch (e) {
      if (!currentTicket(t)) return;
      setMessage(e.message);
      setVerified(false);
      if (e.code === "42501") setData(null);
    }
  };
  useEffect(() => {
    alive.current = true;
    setEditor(null);
    setMail(null);
    setSnapshot(null);
    load(true);
    return () => {
      alive.current = false;
      ++epoch.current;
    };
  }, [context.company_id, context.user_id, context.role, root.id, scopeId]);
  useEffect(() => {
    const recheck = () => load(true);
    const events = [
      WORK_PROFILE_EVENT,
      MANAGED_ACCESS_EVENT,
      MODULE_ACCESS_EVENT,
    ];
    events.forEach((e) => window.addEventListener(e, recheck));
    return () => events.forEach((e) => window.removeEventListener(e, recheck));
  }, [context.company_id, context.user_id, context.role, root.id, scopeId]);
  const editable =
    context.role === "manager" &&
    verified &&
    data?.context?.role === "manager" &&
    !data.archived;
  const save = async (action, value, basis) => {
    if (!editable)
      throw Error("Hent dokumentasjonen og kontroller tilgangen først.");
    const t = epoch.current;
    setBusy(true);
    setMessage("");
    try {
      const next = await qualityRpc(
        context,
        root.id,
        scopeId,
        action,
        basis.revision,
        value,
      );
      if (!currentTicket(t)) return null;
      if (next.context.role !== "manager")
        throw Error("Skrivetilgangen er endret. Kladden er beholdt.");
      setData(next);
      setEditor(null);
      if (action === "protocol_confirm" && value.send_mail) {
        const confirmed = next.data.protocols.find((p) => p.id === value.id);
        if (confirmed?.confirmation)
          setMail({
            protocol: confirmed,
            initialTo: value.to,
            autoPrepare: true,
          });
      }
      setMessage(actions[action] + ".");
      window.dispatchEvent(
        new CustomEvent(QUALITY_EVENT, { detail: { rootId: root.id } }),
      );
      onChange?.();
      return next;
    } catch (e) {
      if (currentTicket(t) && e.code === "42501") {
        setVerified(false);
        setData(null);
      }
      throw e;
    } finally {
      if (alive.current) setBusy(false);
    }
  };
  const open = (mode, initial, title) => setEditor({ mode, initial, title });
  const form = (children, submitLabel, initial = editor.initial) => (
    <DraftForm
      context={context}
      rootId={root.id}
      name={`quality:${scopeId}:${editor.mode}:${["check_add", "document", "protocol_add"].includes(editor.mode) ? "new" : initial.id || initial.key || "new"}`}
      initial={initial}
      basis={{ revision: data.revision }}
      onRebase={(v) => v}
      busy={busy}
      submitLabel={submitLabel}
      onSave={(v, b) => save(editor.mode, v, b)}
      conflictMessage="Dokumentasjonen er oppdatert. Kladden er beholdt. Sammenlign med siste lagrede innhold før du fortsetter."
    >
      {children}
    </DraftForm>
  );
  const openFile = async (file) => {
    if (!file) {
      setMessage("Originalfilen finnes ikke i dette arbeidsområdet.");
      return;
    }
    const t = epoch.current;
    try {
      await openQualityFile(file, () => currentTicket(t) && verified);
    } catch (e) {
      if (currentTicket(t)) setMessage(e.message);
    }
  };
  if (
    !verified ||
    !data ||
    data.context.user_id !== context.user_id ||
    data.context.company_id !== context.company_id
  )
    return (
      <div className="bolig-quality">
        <p role="status">{message || "Henter dokumentasjon …"}</p>
        <button type="button" onClick={() => load(true)}>
          Hent dokumentasjon
        </button>
      </div>
    );
  const { checks, documents, protocols } = data.data,
    activeChecks = checks.filter((c) => !c.archived),
    activeProtocols = protocols.filter((p) => !p.superseded),
    missing = data.fdv.filter((g) => !g.fdv_url).length;
  return (
    <section
      className="bolig-quality"
      aria-label="Sjekklister, FDV og protokoller"
    >
      <div className="bolig-quality-heading">
        <div>
          <span className="bolig-completion-eyebrow">
            {data.kind === "unit"
              ? "Boligens dokumentasjon"
              : data.kind === "block"
                ? "Byggets fellesdokumentasjon"
                : "Prosjektets fellesdokumentasjon"}
          </span>
          <h3>{data.title}</h3>
        </div>
        <button
          type="button"
          className="bolig-quiet-action"
          aria-label="Oppdater dokumentasjon"
          disabled={busy}
          onClick={() => load()}
        >
          <RefreshCw size={18} />
        </button>
      </div>
      <div className="bolig-quality-export-entry">
        <span>Dokumentasjon for overlevering</span>
        <button type="button" onClick={() => setExportOpen(true)}>
          <Download size={18} />
          Samlet PDF og ZIP
        </button>
      </div>
      {exportOpen && (
        <DocumentationExport
          context={context}
          root={root}
          scopeId={scopeId}
          onClose={() => setExportOpen(false)}
        />
      )}
      <p>
        Før kontrollene og samle dokumentene her. FDV er informasjon om
        forvaltning, drift og vedlikehold. Fullfør dokumentasjonen før du
        godkjenner ferdigstillingen.
      </p>
      <nav className="bolig-quality-tabs" aria-label="Dokumentasjonsområder">
        {tabs.map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            aria-current={tab === id ? "page" : undefined}
            onClick={() => setTab(id)}
          >
            <Icon size={18} />
            {label}
            <span>
              {id === "checks"
                ? activeChecks.length
                : id === "documents"
                  ? documents.length
                  : id === "protocols"
                    ? activeProtocols.length
                    : data.fdv.length}
            </span>
          </button>
        ))}
      </nav>
      {distribution && (
        <QualityDistribution
          context={context}
          root={root}
          onClose={() => setDistribution(false)}
          onDistributed={() => load()}
        />
      )}
      {message && (
        <p role="status" className="bolig-quality-notice">
          {message}
        </p>
      )}
      {tab === "checks" && (
        <>
          <div className="bolig-quality-section-head">
            <div>
              <h4>Sjekklister for dette arbeidsområdet</h4>
              <p>
                Bygg prosjektlister eller hent publiserte firmamaler fra
                sjekklistesentralen. Boliger, bygg og prosjekt har hver sine
                kontroller.
              </p>
            </div>
            {editable && (
              <button
                type="button"
                onClick={() =>
                  open(
                    "check_add",
                    {
                      id: crypto.randomUUID(),
                      content: blank(),
                      version_id: "",
                      room_id: "",
                      required: true,
                    },
                    "Ny sjekkliste",
                  )
                }
              >
                <Plus size={18} />
                Ny sjekkliste
              </button>
            )}
          </div>
          {editable && (
            <div className="bolig-quality-distribution-entry">
              <span>Samme kontroll i flere boliger?</span>
              <button type="button" onClick={() => setDistribution(true)}>
                Fordel sjekklister
              </button>
            </div>
          )}
          {!activeChecks.length && (
            <div className="bolig-quality-empty">
              <ClipboardCheck size={30} />
              <strong>Kontrollene samles her</strong>
              <p>
                Start med prosjektets avtalte kontrollplan. Legg til lister for
                arbeidene dere skal dokumentere.
              </p>
            </div>
          )}
          <div className="bolig-quality-list">
            {activeChecks.map((c) => {
              const avvik = Object.values(c.answers).filter(
                (a) => a.status === "Avvik",
              ).length;
              return (
                <button
                  className="bolig-quality-card"
                  type="button"
                  key={c.id}
                  onClick={() =>
                    open(
                      "check_save",
                      {
                        id: c.id,
                        answers: c.answers,
                        required: c.required !== false,
                        complete: false,
                      },
                      c.definition.title,
                    )
                  }
                >
                  <span className="bolig-quality-card-icon">
                    <ClipboardCheck size={22} />
                  </span>
                  <span>
                    <strong>{c.definition.title}</strong>
                    <small>
                      {c.source_number
                        ? `Firmamal v${c.source_number}`
                        : "Egen sjekkliste"}{" "}
                      · Kontroll {c.sequence} ·{" "}
                      {c.required !== false ? "Påkrevd" : "Valgfri"}
                      {c.room_id
                        ? " · " +
                          (data.rooms.find((r) => r.id === c.room_id)?.name ||
                            "Arkivert rom")
                        : ""}
                    </small>
                    <small>
                      {Object.values(c.answers).filter((a) => a.status).length}{" "}
                      av {c.definition.points.length} besvart
                      {avvik ? ` · ${avvik} åpne avvik` : ""}
                    </small>
                  </span>
                  <span
                    className={`bolig-quality-status ${avvik ? "warning" : c.status === "completed" ? "done" : ""}`}
                  >
                    {c.status === "completed" ? "Fullført" : "Under arbeid"}
                  </span>
                  <ArrowUpRight size={18} />
                </button>
              );
            })}
          </div>
        </>
      )}
      {tab === "documents" && (
        <>
          <div className="bolig-quality-section-head">
            <div>
              <h4>Filer og bilder</h4>
              <p>
                Last opp PDF eller bilder. Filene kan brukes som bevis i
                sjekklister og ved retting av merknader.
              </p>
            </div>
            {editable && (
              <button
                type="button"
                onClick={() =>
                  open(
                    "document",
                    {
                      id: crypto.randomUUID(),
                      file: { title: "", name: "", path: "", kind: "document" },
                    },
                    "Last opp dokument",
                  )
                }
              >
                <Plus size={18} />
                Last opp fil
              </button>
            )}
          </div>
          {!documents.length && (
            <div className="bolig-quality-empty">
              <Files size={30} />
              <strong>Ingen filer lastet opp</strong>
              <p>
                Legg til tegninger, tester, bilder og annen dokumentasjon for
                dette arbeidsområdet.
              </p>
            </div>
          )}
          <div className="bolig-quality-list">
            {documents.map((f) => (
              <button
                className="bolig-quality-card"
                key={f.id}
                type="button"
                onClick={() => openFile(f)}
              >
                <Files size={22} />
                <span>
                  <strong>{f.title}</strong>
                  <small>
                    {f.name} · {f.by_name} · {date(f.at)}
                  </small>
                </span>
                <ArrowUpRight size={18} />
              </button>
            ))}
          </div>
        </>
      )}
      {tab === "fdv" && (
        <>
          <div className="bolig-quality-section-head">
            <div>
              <h4>
                FDV for{" "}
                {data.kind === "unit"
                  ? "boligen"
                  : data.kind === "block"
                    ? "bygget"
                    : "prosjektet"}
              </h4>
              <p>
                {data.kind === "unit"
                  ? "Oversikten følger boligens siste lagrede varevalg."
                  : "Oversikten samler siste lagrede varevalg fra alle aktive boliger i dette området."}{" "}
                Kontroller at varene er montert som angitt før oversikten brukes
                ved overlevering.
              </p>
            </div>
            <button
              type="button"
              disabled={busy || !data.fdv.length}
              onClick={async () => {
                const t = epoch.current;
                setBusy(true);
                try {
                  await downloadBoligFdv({
                    context,
                    rootId: root.id,
                    scopeId,
                    expected: data,
                    isCurrent: () => currentTicket(t),
                  });
                  if (currentTicket(t))
                    setMessage("FDV-oversikten er lastet ned.");
                } catch (e) {
                  if (currentTicket(t)) setMessage(e.message);
                } finally {
                  if (alive.current) setBusy(false);
                }
              }}
            >
              <Download size={18} />
              Last ned FDV-oversikt
            </button>
          </div>
          <div className="bolig-quality-notice">
            <strong>
              {data.fdv.length} varer · {missing} mangler FDV-lenke
            </strong>
            <p>
              PDF-en inneholder klikkbare dokumentlenker. Eksterne dokumenter er
              ikke vedlagt. Last opp egne FDV-filer under Filer og bilder.
            </p>
          </div>
          {!data.fdv.length && (
            <div className="bolig-quality-empty">
              <BookOpen size={30} />
              <strong>Varevalg mangler</strong>
              <p>
                Lagre grunnpakke og tilvalgspakker for boligene. Varene vises
                her med sine FDV-lenker.
              </p>
            </div>
          )}
          <div className="bolig-quality-list">
            {data.fdv.map((g, i) => (
              <article
                className="bolig-quality-card"
                key={g.unit_id + g.key + i}
              >
                <BookOpen size={22} />
                <div>
                  <strong>{g.name}</strong>
                  <small>
                    {g.block} · {g.unit}
                    {g.room ? " · " + g.room : ""} ·{" "}
                    {g.sku || "Uten varenummer"} · {g.quantity} {g.unit_name}
                  </small>
                  {g.fdv_url ? (
                    <a
                      href={g.fdv_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Åpne FDV{g.corrected ? " · korrigert lenke" : ""}
                      <ArrowUpRight size={15} />
                    </a>
                  ) : (
                    <span className="bolig-quality-missing">
                      FDV-lenke mangler
                    </span>
                  )}
                </div>
                {editable && data.kind === "unit" && (
                  <button
                    type="button"
                    onClick={() =>
                      open(
                        "fdv_link",
                        { key: g.key, url: g.fdv_url || "", reason: "" },
                        "FDV-lenke for " + g.name,
                      )
                    }
                  >
                    Rediger lenke
                  </button>
                )}
              </article>
            ))}
          </div>
          {data.kind !== "unit" && (
            <p>
              Åpne boligens FDV for å rette en lenke. Det opprinnelige
              varevalget og bestillingene beholdes.
            </p>
          )}
        </>
      )}
      {tab === "protocols" && (
        <>
          <div className="bolig-quality-section-head">
            <div>
              <h4>Ekstern overtagelsesprotokoll</h4>
              <p>
                Valgfritt. Last opp protokollen fra kontrolløren. Registrer
                merknadene og dokumenter rettingen. Deretter kan du bekrefte og
                velge om bekreftelsen skal sendes på e-post.
              </p>
            </div>
            {editable && (
              <button
                type="button"
                onClick={() =>
                  open(
                    "protocol_add",
                    {
                      id: crypto.randomUUID(),
                      title: "",
                      document_id: "",
                      remarks: [],
                      no_remarks: "",
                      replaces: "",
                      reason: "",
                    },
                    "Legg til ekstern protokoll",
                  )
                }
              >
                <Plus size={18} />
                Legg til protokoll
              </button>
            )}
          </div>
          {!activeProtocols.length && (
            <div className="bolig-quality-empty">
              <FileCheck2 size={30} />
              <strong>Ingen ekstern protokoll</strong>
              <p>
                Bruk dette når kontrollørens egen protokoll skal følges opp i
                Boligprosjekter.
              </p>
            </div>
          )}
          <div className="bolig-quality-list">
            {activeProtocols.map((p) => (
              <article key={p.id} className="bolig-quality-protocol">
                <div className="bolig-quality-section-head">
                  <div>
                    <strong>{p.title}</strong>
                    <small>
                      {p.remarks.filter((r) => r.rectified).length} av{" "}
                      {p.remarks.length} merknader rettet
                    </small>
                  </div>
                  <span
                    className={`bolig-quality-status ${p.confirmation ? "done" : "warning"}`}
                  >
                    {p.confirmation ? "Retting bekreftet" : "Til oppfølging"}
                  </span>
                </div>
                {p.confirmation && (
                  <p>
                    Bekreftet av {p.confirmation.by_name} ·{" "}
                    {date(p.confirmation.at)}
                    <br />
                    {p.confirmation.note}
                  </p>
                )}
                <div className="bolig-quality-actions">
                  <button
                    type="button"
                    onClick={() =>
                      openFile(documents.find((d) => d.id === p.document_id))
                    }
                  >
                    Åpne original
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      open(
                        "protocol_save",
                        {
                          id: p.id,
                          remarks: p.remarks,
                          no_remarks: p.no_remarks,
                        },
                        p.title,
                      )
                    }
                  >
                    {p.confirmation || !editable
                      ? "Se merknader"
                      : "Følg opp merknader"}
                  </button>
                  {editable &&
                    (p.confirmation ? (
                      <>
                        <button type="button" onClick={() => setMail(p)}>
                          Send bekreftelse på e-post
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            open(
                              "protocol_reopen",
                              { id: p.id, reason: "" },
                              "Gjenåpne bekreftelse",
                            )
                          }
                        >
                          Gjenåpne bekreftelse
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        disabled={
                          (!p.remarks.length && !p.no_remarks) ||
                          p.remarks.some((r) => !r.rectified)
                        }
                        onClick={() =>
                          open(
                            "protocol_confirm",
                            { id: p.id, reason: "", send_mail: false, to: "" },
                            "Bekreft retting",
                          )
                        }
                      >
                        Bekreft retting
                      </button>
                    ))}
                  {editable && !p.confirmation && (
                    <button
                      type="button"
                      disabled={
                        (!p.remarks.length && !p.no_remarks) ||
                        p.remarks.some((r) => !r.rectified)
                      }
                      onClick={() =>
                        open(
                          "protocol_confirm",
                          { id: p.id, reason: "", send_mail: true, to: "" },
                          "Bekreft og send",
                        )
                      }
                    >
                      Bekreft og send
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
          {protocols.some((p) => p.superseded) && (
            <details>
              <summary>Tidligere protokollutgaver</summary>
              {protocols
                .filter((p) => p.superseded)
                .map((p) => (
                  <p key={p.id}>
                    {p.title} ·{" "}
                    {p.confirmation ? "Tidligere bekreftet" : "Ikke bekreftet"}{" "}
                    <button
                      type="button"
                      onClick={() =>
                        openFile(documents.find((d) => d.id === p.document_id))
                      }
                    >
                      Åpne tidligere original
                    </button>
                  </p>
                ))}
            </details>
          )}
        </>
      )}
      <details className="bolig-quality-history">
        <summary>Dokumentasjonshistorikk · {data.history.length}</summary>
        {data.history.length ? (
          data.history.map((h) => (
            <p key={h.revision}>
              <strong>{actions[h.action] || h.action}</strong> · {h.actor_name}{" "}
              · {date(h.created_at)}
              <button
                type="button"
                className="bolig-quiet-action"
                onClick={async () => {
                  const t = epoch.current;
                  try {
                    const saved = await qualityRpc(
                      context,
                      root.id,
                      scopeId,
                      "history",
                      h.revision,
                    );
                    if (currentTicket(t)) setSnapshot(saved);
                  } catch (e) {
                    if (currentTicket(t)) setMessage(e.message);
                  }
                }}
              >
                Se lagret utgave {h.revision}
              </button>
              {h.reason && (
                <>
                  <br />
                  {h.reason}
                </>
              )}
            </p>
          ))
        ) : (
          <p>Ingen endringer lagret ennå.</p>
        )}
      </details>
      {editor && (
        <Dialog
          className="bolig-quality-dialog"
          title={editor.title}
          busy={busy}
          onClose={() => setEditor(null)}
        >
          <div className="bolig-quality-editor">
            {editor.mode === "check_add" &&
              form(
                (v, c) => (
                  <>
                    <label className="bolig-quality-choice">
                      <input
                        type="checkbox"
                        checked={v.required !== false}
                        onChange={(e) => c("required", e.target.checked)}
                      />
                      Påkrevd ved sluttgodkjenning
                    </label>
                    <p>
                      Valgfrie lister gir påminnelser. Kritiske avvik må alltid
                      avklares.
                    </p>
                    <label>
                      Hent mal
                      <select
                        value={v.version_id}
                        onChange={(e) => {
                          const id = e.target.value;
                          if (id === "planning") {
                            const t = PROJECT_DESIGN_CHECKLIST;
                            c({
                              version_id: "",
                              content: {
                                title: t.category,
                                trade: "Felles – alle fag",
                                instructions: t.instructions,
                                points: t.items.map((title) => ({
                                  ...point(),
                                  title,
                                })),
                              },
                            });
                          } else c("version_id", id);
                        }}
                      >
                        <option value="">Bygg manuelt</option>
                        <option value="planning">
                          ProffDok · Prosjektering
                        </option>
                        {data.templates.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.content.title} · firmamal v{t.number}
                          </option>
                        ))}
                      </select>
                    </label>
                    {!data.templates.length && (
                      <p>
                        Ingen publiserte firmamaler er tilgjengelige. Egne
                        lister kan bygges her.
                      </p>
                    )}
                    {data.rooms.length > 0 && (
                      <label>
                        Rom (valgfritt)
                        <select
                          value={v.room_id}
                          onChange={(e) => c("room_id", e.target.value)}
                        >
                          <option value="">Hele boligen</option>
                          {data.rooms.map((r) => (
                            <option value={r.id} key={r.id}>
                              {r.name}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}
                    {v.version_id ? (
                      <TemplatePreview
                        content={
                          data.templates.find((t) => t.id === v.version_id)
                            ?.content
                        }
                      />
                    ) : (
                      <ChecklistBuilder
                        value={v.content}
                        onChange={(content) => c("content", content)}
                      />
                    )}
                  </>
                ),
                "Opprett sjekkliste",
              )}
            {editor.mode === "check_save" &&
              (() => {
                const row = checks.find((x) => x.id === editor.initial.id),
                  readOnly = !editable || row.status === "completed";
                return (
                  <>
                    {form(
                      (v, c) => (
                        <>
                          <p>{row.definition.instructions}</p>
                          <label className="bolig-quality-choice">
                            <input
                              type="checkbox"
                              checked={v.required ?? row.required !== false}
                              disabled={readOnly}
                              onChange={(e) => c("required", e.target.checked)}
                            />
                            Påkrevd ved sluttgodkjenning
                          </label>
                          <p>
                            {readOnly
                              ? "Lagret kontroll. Gjenåpne med en begrunnelse for å endre svar."
                              : "Svar på punktene. Lagre underveis. Fullfør når alle påkrevde opplysninger er lagt inn."}
                          </p>
                          <fieldset disabled={readOnly}>
                            {row.definition.points.map((p, i) => {
                              const a = v.answers[p.id] || {};
                              const patch = (delta) => {
                                let answers = {
                                  ...v.answers,
                                  [p.id]: { ...a, ...delta },
                                };
                                const req = Object.fromEntries(
                                  row.definition.points.map((p) => [p.id, p]),
                                );
                                answers = invalidateFieldConfirmations(
                                  row.definition.points.map((p) => p.id),
                                  req,
                                  answers,
                                  p.id,
                                  delta._keepConfirmation,
                                );
                                delete answers[p.id]._keepConfirmation;
                                c("answers", answers);
                              };
                              return (
                                <fieldset
                                  className="bolig-quality-point"
                                  key={p.id}
                                >
                                  <legend>
                                    {i + 1}. {p.title}
                                  </legend>
                                  {p.guidance && <p>{p.guidance}</p>}
                                  {a.status === "Avvik" && (
                                    <label>
                                      Alvorlighetsgrad
                                      <select
                                        value={a.severity || "critical"}
                                        onChange={(e) =>
                                          patch({ severity: e.target.value })
                                        }
                                      >
                                        <option value="critical">
                                          Kritisk – stopper godkjenning
                                        </option>
                                        <option value="minor">
                                          Mindre restpunkt – følger overtagelsen
                                        </option>
                                      </select>
                                    </label>
                                  )}
                                  <label>
                                    Resultat
                                    <select
                                      value={a.status || ""}
                                      onChange={(e) =>
                                        patch({ status: e.target.value })
                                      }
                                    >
                                      <option value="">Velg resultat</option>
                                      <option>OK</option>
                                      <option>Avvik</option>
                                      {p.allow_na !== false && (
                                        <option>Ikke aktuelt</option>
                                      )}
                                      {["Avvik", "Lukket avvik"].includes(
                                        row.answers[p.id]?.status,
                                      ) && <option>Lukket avvik</option>}
                                    </select>
                                  </label>
                                  <label>
                                    Kommentar
                                    {p.comment_required ? " (påkrevd)" : ""}
                                    <textarea
                                      rows={3}
                                      maxLength={4000}
                                      value={a.comment || ""}
                                      onChange={(e) =>
                                        patch({ comment: e.target.value })
                                      }
                                    />
                                  </label>
                                  <ChecklistFields
                                    fields={p.fields}
                                    values={a.values}
                                    onChange={(values, keep) =>
                                      patch({ values, _keepConfirmation: keep })
                                    }
                                    userId={context.user_id}
                                    readOnly={readOnly}
                                  />
                                  <DocumentChoices
                                    documents={documents}
                                    selected={a.documents || []}
                                    onChange={(documents) =>
                                      patch({ documents })
                                    }
                                    label={
                                      p.image_required
                                        ? "Vedlegg · bilde påkrevd"
                                        : "Vedlegg (valgfritt)"
                                    }
                                  />
                                </fieldset>
                              );
                            })}
                            <label className="bolig-quality-choice">
                              <input
                                type="checkbox"
                                checked={v.complete}
                                onChange={(e) =>
                                  c("complete", e.target.checked)
                                }
                              />
                              Fullfør kontrollen ved lagring
                            </label>
                          </fieldset>
                          {readOnly && (
                            <p>
                              Fullført av {row.completed_by_name || row.by_name}{" "}
                              · {date(row.completed_at)}
                            </p>
                          )}
                        </>
                      ),
                      readOnly ? "Lukket kontroll" : "Lagre kontroll",
                    )}
                    {editable && row.status === "completed" && (
                      <button
                        type="button"
                        onClick={() =>
                          open(
                            "check_requirement",
                            { id: row.id, required: row.required !== false },
                            "Krav til sjekklisten",
                          )
                        }
                      >
                        Endre krav til kontroll
                      </button>
                    )}
                    {editable && row.status === "completed" && (
                      <button
                        type="button"
                        onClick={() =>
                          open(
                            "check_reopen",
                            { id: row.id, reason: "" },
                            "Gjenåpne kontroll",
                          )
                        }
                      >
                        Gjenåpne kontroll
                      </button>
                    )}
                    {editable && (
                      <button
                        type="button"
                        className="bolig-quiet-action"
                        onClick={() =>
                          open(
                            "check_archive",
                            { id: row.id, reason: "" },
                            "Arkiver sjekkliste",
                          )
                        }
                      >
                        Arkiver sjekkliste
                      </button>
                    )}
                  </>
                );
              })()}
            {editor.mode === "check_requirement" &&
              form(
                (v, c) => (
                  <>
                    <p>
                      Kontrollens svar og fullføring beholdes. Kravet lagres i
                      dokumentasjonshistorikken.
                    </p>
                    <label className="bolig-quality-choice">
                      <input
                        type="checkbox"
                        checked={v.required}
                        onChange={(e) => c("required", e.target.checked)}
                      />
                      Påkrevd ved sluttgodkjenning
                    </label>
                  </>
                ),
                "Lagre krav",
              )}
            {editor.mode === "document" &&
              form(
                (v, c) => (
                  <>
                    <p>
                      PDF, JPG, PNG eller WebP · inntil 20 MB. Lagrede
                      originaler beholdes.
                    </p>
                    <QualityUpload
                      value={v.file}
                      onChange={(file) => c("file", file)}
                      context={context}
                      rootId={root.id}
                      scopeId={scopeId}
                      isCurrent={() => alive.current}
                    />
                    <label>
                      Navn på dokumentet
                      <input
                        required
                        maxLength={160}
                        value={v.file.title}
                        onChange={(e) =>
                          c("file", { ...v.file, title: e.target.value })
                        }
                      />
                    </label>
                    <label>
                      Dokumenttype
                      <select
                        value={v.file.kind}
                        onChange={(e) =>
                          c("file", { ...v.file, kind: e.target.value })
                        }
                      >
                        <option value="document">Dokument</option>
                        <option value="photo">Bilde / fotobevis</option>
                        <option value="fdv">FDV</option>
                        <option value="protocol">Ekstern protokoll</option>
                      </select>
                    </label>
                  </>
                ),
                "Registrer fil",
              )}
            {editor.mode === "fdv_link" &&
              form(
                (v, c) => (
                  <>
                    <label>
                      FDV-lenke
                      <input
                        type="url"
                        placeholder="https://…/fdv.pdf"
                        maxLength={2000}
                        value={v.url}
                        onChange={(e) => c("url", e.target.value)}
                      />
                    </label>
                    <Reason value={v.reason} onChange={(v) => c("reason", v)} />
                    <p>
                      Lenken gjelder denne varen i boligen. Det opprinnelige
                      varevalget og sendte bestillinger beholdes.
                    </p>
                  </>
                ),
                "Lagre FDV-lenke",
              )}
            {[
              "check_reopen",
              "check_archive",
              "protocol_reopen",
              "protocol_confirm",
            ].includes(editor.mode) &&
              form(
                (v, c) => (
                  <>
                    <p>
                      {editor.mode === "protocol_confirm"
                        ? "Jeg har sammenlignet merknadene med originalprotokollen og kontrollert at rettingen er dokumentert. Dette registrerer min bekreftelse på retting."
                        : ""}
                    </p>
                    {editor.mode === "protocol_confirm" && (
                      <>
                        <label className="bolig-quality-choice">
                          <input
                            type="checkbox"
                            checked={!!v.send_mail}
                            onChange={(e) => c("send_mail", e.target.checked)}
                          />
                          Send bekreftelse på e-post
                        </label>
                        {v.send_mail && (
                          <>
                            <label>
                              E-postmottaker
                              <input
                                type="email"
                                required
                                maxLength={254}
                                value={v.to || ""}
                                onChange={(e) => c("to", e.target.value)}
                              />
                            </label>
                            <p>
                              Først lagres din rettingsbekreftelse. Deretter får
                              du se den ferdige e-posten til valgt mottaker og
                              trykker «Send bekreftelse». Ingenting sendes før
                              den gjennomgangen.
                            </p>
                          </>
                        )}
                      </>
                    )}
                    <Reason
                      value={v.reason}
                      onChange={(v) => c("reason", v)}
                      label={
                        editor.mode === "protocol_confirm"
                          ? "Samlet bekreftelse"
                          : "Begrunnelse"
                      }
                    />
                  </>
                ),
                editor.mode === "protocol_confirm"
                  ? "Lagre bekreftelse"
                  : editor.mode === "check_archive"
                    ? "Arkiver sjekkliste"
                    : "Gjenåpne",
              )}
            {["protocol_add", "protocol_save"].includes(editor.mode) &&
              (() => {
                const p = protocols.find((x) => x.id === editor.initial.id),
                  readOnly = !editable || Boolean(p?.confirmation);
                return form(
                  (v, c) => (
                    <fieldset disabled={readOnly}>
                      {editor.mode === "protocol_add" && (
                        <>
                          <p>
                            Last opp originalen her, eller velg en protokoll som
                            allerede er registrert.
                          </p>
                          <label>
                            Protokollnavn
                            <input
                              required
                              maxLength={160}
                              value={v.title}
                              onChange={(e) => c("title", e.target.value)}
                            />
                          </label>
                          <label>
                            Originalprotokoll
                            <select
                              required={!v.file?.path}
                              value={v.document_id}
                              onChange={(e) =>
                                c({ document_id: e.target.value, file: null })
                              }
                            >
                              <option value="">Velg opplastet protokoll</option>
                              {documents
                                .filter((f) => f.kind === "protocol")
                                .map((f) => (
                                  <option key={f.id} value={f.id}>
                                    {f.title} · {f.name}
                                  </option>
                                ))}
                            </select>
                          </label>
                          <QualityUpload
                            value={
                              v.file || {
                                name: "",
                                path: "",
                                title: "",
                                kind: "protocol",
                              }
                            }
                            onChange={(file) =>
                              c({
                                file: { ...file, kind: "protocol" },
                                document_id: "",
                              })
                            }
                            context={context}
                            rootId={root.id}
                            scopeId={scopeId}
                            isCurrent={() => alive.current}
                          />
                          <label>
                            Erstatter tidligere utgave (valgfritt)
                            <select
                              value={v.replaces}
                              onChange={(e) => c("replaces", e.target.value)}
                            >
                              <option value="">Ny selvstendig protokoll</option>
                              {activeProtocols.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.title}
                                </option>
                              ))}
                            </select>
                          </label>
                          {v.replaces && (
                            <Reason
                              value={v.reason}
                              onChange={(v) => c("reason", v)}
                            />
                          )}
                        </>
                      )}
                      <p>
                        Før inn merknadene fra originalen. Appen leser ikke
                        merknadene automatisk fra PDF-en. Kontroller at alle er
                        tatt med.
                      </p>
                      {v.remarks.map((r, i) => (
                        <fieldset className="bolig-quality-point" key={r.id}>
                          <legend>Merknad {i + 1}</legend>
                          <label>
                            Merknad fra kontrolløren
                            <textarea
                              required
                              maxLength={2000}
                              value={r.text}
                              onChange={(e) =>
                                c(
                                  "remarks",
                                  v.remarks.map((x) =>
                                    x.id === r.id
                                      ? { ...x, text: e.target.value }
                                      : x,
                                  ),
                                )
                              }
                            />
                          </label>
                          <label>
                            Alvorlighetsgrad
                            <select
                              value={r.severity || "critical"}
                              onChange={(e) =>
                                c(
                                  "remarks",
                                  v.remarks.map((x) =>
                                    x.id === r.id
                                      ? { ...x, severity: e.target.value }
                                      : x,
                                  ),
                                )
                              }
                            >
                              <option value="critical">
                                Kritisk – stopper godkjenning
                              </option>
                              <option value="minor">
                                Mindre restpunkt – følger overtagelsen
                              </option>
                            </select>
                          </label>
                          <label>
                            Utført retting / dokumentasjon
                            <textarea
                              maxLength={4000}
                              value={r.evidence}
                              onChange={(e) =>
                                c(
                                  "remarks",
                                  v.remarks.map((x) =>
                                    x.id === r.id
                                      ? { ...x, evidence: e.target.value }
                                      : x,
                                  ),
                                )
                              }
                            />
                          </label>
                          <DocumentChoices
                            documents={documents.filter(
                              (f) =>
                                f.id !== p?.document_id &&
                                f.id !== v.document_id,
                            )}
                            selected={r.documents || []}
                            onChange={(documents) =>
                              c(
                                "remarks",
                                v.remarks.map((x) =>
                                  x.id === r.id ? { ...x, documents } : x,
                                ),
                              )
                            }
                          />
                          <label className="bolig-quality-choice">
                            <input
                              type="checkbox"
                              checked={r.rectified}
                              onChange={(e) =>
                                c(
                                  "remarks",
                                  v.remarks.map((x) =>
                                    x.id === r.id
                                      ? { ...x, rectified: e.target.checked }
                                      : x,
                                  ),
                                )
                              }
                            />
                            Rettingen er kontrollert
                          </label>
                          {!p && (
                            <button
                              type="button"
                              onClick={() =>
                                c(
                                  "remarks",
                                  v.remarks.filter((x) => x.id !== r.id),
                                )
                              }
                            >
                              Fjern merknad
                            </button>
                          )}
                        </fieldset>
                      ))}
                      <button
                        type="button"
                        disabled={v.remarks.length >= 100}
                        onClick={() =>
                          c("remarks", [
                            ...v.remarks,
                            {
                              id: crypto.randomUUID(),
                              text: "",
                              evidence: "",
                              rectified: false,
                              documents: [],
                            },
                          ])
                        }
                      >
                        <Plus size={17} />
                        Legg til merknad
                      </button>
                      {!v.remarks.length && (
                        <label>
                          Ingen merknader – beskriv hva som er kontrollert
                          <textarea
                            maxLength={2000}
                            value={v.no_remarks}
                            onChange={(e) => c("no_remarks", e.target.value)}
                          />
                        </label>
                      )}
                      {readOnly && (
                        <p>
                          Bekreftelsen er lagret. Merknadene kan først endres
                          etter gjenåpning.
                        </p>
                      )}
                    </fieldset>
                  ),
                  readOnly
                    ? "Lagret protokoll"
                    : editor.mode === "protocol_add"
                      ? "Registrer protokoll"
                      : "Lagre merknader",
                );
              })()}
          </div>
        </Dialog>
      )}
      {snapshot && (
        <Dialog
          className="bolig-quality-dialog"
          title={`Dokumentasjon · lagret utgave ${snapshot.revision}`}
          onClose={() => setSnapshot(null)}
        >
          <QualitySnapshot
            snapshot={snapshot}
            userId={context.user_id}
            openFile={openFile}
          />
        </Dialog>
      )}
      {mail && (
        <ProtocolMail
          context={context}
          rootId={root.id}
          scopeId={scopeId}
          protocol={mail.protocol || mail}
          initialTo={mail.initialTo || ""}
          autoPrepare={Boolean(mail.autoPrepare)}
          onClose={() => setMail(null)}
        />
      )}
    </section>
  );
}
function Reason({ value, onChange, label = "Begrunnelse" }) {
  return (
    <label>
      {label}
      <textarea
        required
        minLength={3}
        maxLength={2000}
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
function DocumentChoices({
  documents,
  selected,
  onChange,
  label = "Vedlegg (valgfritt)",
}) {
  return (
    <details className="bolig-quality-attachments">
      <summary>
        {label} · {selected.length} valgt
      </summary>
      {documents.length ? (
        documents.map((f) => (
          <label key={f.id} className="bolig-quality-choice">
            <input
              type="checkbox"
              checked={selected.includes(f.id)}
              onChange={(e) =>
                onChange(
                  e.target.checked
                    ? [...selected, f.id]
                    : selected.filter((x) => x !== f.id),
                )
              }
            />
            {f.title} · {f.name}
          </label>
        ))
      ) : (
        <p>
          Last opp filer under Filer og bilder før du knytter dem til
          kontrollen.
        </p>
      )}
    </details>
  );
}
function TemplatePreview({ content }) {
  return content ? (
    <div className="bolig-quality-template">
      <strong>{content.title}</strong>
      <p>{content.instructions}</p>
      <ol>
        {content.points.map((p) => (
          <li key={p.id}>
            {p.title}
            {p.fields?.length ? ` · ${p.fields.length} underpunkter` : ""}
          </li>
        ))}
      </ol>
      <p>Den publiserte malutgaven beholdes i kontrollen.</p>
    </div>
  ) : null;
}
function ChecklistBuilder({ value, onChange }) {
  const patch = (id, d) =>
    onChange({
      ...value,
      points: value.points.map((p) => (p.id === id ? { ...p, ...d } : p)),
    });
  return (
    <>
      <label>
        Navn på sjekklisten
        <input
          required
          maxLength={160}
          value={value.title}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
        />
      </label>
      <label>
        Veiledning (valgfritt)
        <textarea
          rows={3}
          maxLength={4000}
          value={value.instructions}
          onChange={(e) => onChange({ ...value, instructions: e.target.value })}
        />
      </label>
      {value.points.map((p, i) => (
        <fieldset className="bolig-quality-point" key={p.id}>
          <legend>Sjekkpunkt {i + 1}</legend>
          <label>
            Hva skal kontrolleres?
            <textarea
              required
              maxLength={600}
              value={p.title}
              onChange={(e) => patch(p.id, { title: e.target.value })}
            />
          </label>
          <label>
            Veiledning for punktet (valgfritt)
            <textarea
              maxLength={2000}
              value={p.guidance}
              onChange={(e) => patch(p.id, { guidance: e.target.value })}
            />
          </label>
          <label className="bolig-quality-choice">
            <input
              type="checkbox"
              checked={p.image_required}
              onChange={(e) =>
                patch(p.id, { image_required: e.target.checked })
              }
            />
            Bilde påkrevd
          </label>
          <label className="bolig-quality-choice">
            <input
              type="checkbox"
              checked={p.comment_required}
              onChange={(e) =>
                patch(p.id, { comment_required: e.target.checked })
              }
            />
            Kommentar påkrevd
          </label>
          <ChecklistFieldBuilder
            fields={p.fields}
            onChange={(fields) => patch(p.id, { fields })}
          />
          <button
            type="button"
            disabled={value.points.length === 1}
            onClick={() =>
              latest.current.onChange({
                ...latest.current.value,
                points: value.points.filter((x) => x.id !== p.id),
              })
            }
          >
            Fjern sjekkpunkt
          </button>
        </fieldset>
      ))}
      <button
        type="button"
        disabled={value.points.length >= 100}
        onClick={() =>
          onChange({ ...value, points: [...value.points, point()] })
        }
      >
        <Plus size={18} />
        Legg til sjekkpunkt
      </button>
    </>
  );
}
function QualityUpload({
  value,
  onChange,
  context,
  rootId,
  scopeId,
  isCurrent,
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const alive = useRef(true),
    latest = useRef({ value, onChange });
  latest.current = { value, onChange };
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  return (
    <div data-image-uploading={busy ? "true" : undefined}>
      <label>
        Fil
        <input
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp"
          disabled={busy}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setBusy(true);
            setError("");
            try {
              const saved = await uploadQualityFile(
                context,
                rootId,
                scopeId,
                file,
                () => alive.current && isCurrent(),
              );
              if (saved)
                latest.current.onChange({
                  ...latest.current.value,
                  ...saved,
                  title:
                    latest.current.value.title ||
                    file.name.replace(/\.[^.]+$/, ""),
                  kind: file.type.startsWith("image/")
                    ? "photo"
                    : latest.current.value.kind,
                });
            } catch (e) {
              if (alive.current) setError(e.message);
            } finally {
              if (alive.current) setBusy(false);
            }
          }}
        />
      </label>
      <p role="status">
        {busy
          ? "Laster opp …"
          : value.path
            ? `${value.name} er lastet opp. Registrer filen for å knytte den til arbeidsområdet.`
            : "Velg en fil."}
      </p>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}

function QualitySnapshot({ snapshot, userId, openFile }) {
  return (
    <div className="bolig-quality-editor">
      <p>Historisk, lagret utgave. Endringer gjøres i gjeldende kontroll.</p>
      {snapshot.data.checks.map((c) => (
        <article className="bolig-quality-point" key={c.id}>
          <h3>{c.definition.title}</h3>
          <p>
            Kontroll {c.sequence} ·{" "}
            {c.status === "completed" ? "Fullført" : "Under arbeid"}
            {c.archived ? " · Arkivert" : ""}
          </p>
          {c.definition.points.map((p) => {
            const a = c.answers[p.id] || {};
            return (
              <div key={p.id}>
                <h4>{p.title}</h4>
                <p>
                  {a.status || "Ikke besvart"} · {a.comment}
                </p>
                <ChecklistFields
                  fields={p.fields}
                  values={a.values}
                  readOnly
                  userId={userId}
                />
                {(a.documents || []).map((id) => {
                  const f = snapshot.data.documents.find((f) => f.id === id);
                  return (
                    f && (
                      <button
                        key={id}
                        type="button"
                        onClick={() => openFile(f)}
                      >
                        {f.title}
                      </button>
                    )
                  );
                })}
              </div>
            );
          })}
        </article>
      ))}
      {snapshot.data.protocols.map((p) => (
        <article className="bolig-quality-point" key={p.id}>
          <h3>{p.title}</h3>
          <p>
            {p.confirmation
              ? "Bekreftet av " +
                p.confirmation.by_name +
                " · " +
                date(p.confirmation.at)
              : "Ikke bekreftet"}
          </p>
          {p.remarks.map((r) => (
            <p key={r.id}>
              <strong>{r.text}</strong>
              <br />
              {r.rectified ? "Rettet" : "Åpen"} · {r.evidence}
            </p>
          ))}
          {p.confirmation && <p>{p.confirmation.note}</p>}
        </article>
      ))}
      {Object.keys(snapshot.data.fdv).length > 0 && (
        <>
          <h4>FDV-lenker i denne utgaven</h4>
          {Object.entries(snapshot.data.fdv).map(([key, v]) => (
            <p key={key}>
              <strong>{v.product || "Vare"}</strong>
              <br />
              {v.url || "Lenke fjernet"}
              <br />
              {v.reason} · {v.by_name} · {date(v.at)}
            </p>
          ))}
        </>
      )}
      <h4>Registrerte filer</h4>
      {snapshot.data.documents.map((f) => (
        <p key={f.id}>
          <button type="button" onClick={() => openFile(f)}>
            {f.title} · {f.name}
          </button>
        </p>
      ))}
    </div>
  );
}
