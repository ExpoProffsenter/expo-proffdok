import { WORK_PROFILE_EVENT } from "../access/workProfileClient.js";
import React, { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Plus,
  Send,
  TriangleAlert,
} from "lucide-react";
import "./boligProgress.css";
import Dialog from "./BoligEditorDialog.jsx";
import {
  boligDraftKey,
  readBoligDraft,
  writeBoligDraft,
} from "./boligClient.js";
import {
  progressRpc,
  progressDate as date,
  progressLabels as labels,
  localToday,
  PROGRESS_EVENT,
} from "./boligProgressClient.js";
import Planning from "./BoligProgressPlanning.jsx";
import NoticePrint from "./BoligNoticePrint.jsx";
const COMPLETION_EVENT = "expo-proffdok-bolig-completion";
const empty = { editor: null, notice: null, pending: null };
const formTask = (unit, owner) => ({
  id: crypto.randomUUID(),
  unit_id: unit || "",
  room_id: "",
  title: "",
  owner_id: owner,
  planned_start: localToday(),
  planned_end: localToday(),
  actual_start: "",
  actual_end: "",
  status: "planned",
  predecessor_id: "",
  required: true,
  note: "",
});
export default function BoligProgress({ context, root, unit = null }) {
  const scope = `${context.user_id}/${context.company_id}/${root.id}/${unit?.id || "all"}`;
  const key = boligDraftKey(context, root.id, `progress-${unit?.id || "all"}`);
  const [draft, setDraft] = useState(() => readBoligDraft(key, empty)),
    [data, setData] = useState(null),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [filter, setFilter] = useState("open"),
    [query, setQuery] = useState(""),
    [page, setPage] = useState(0),
    [review, setReview] = useState(null),
    [confirmed, setConfirmed] = useState(false);
  const alive = useRef(false),
    epoch = useRef(0),
    operating = useRef(false),
    latest = useRef(draft),
    currentScope = useRef(scope);
  latest.current = draft;
  currentScope.current = scope;
  const persist = (next) => {
    if (!writeBoligDraft(key, next))
      throw Error("Kladden kunne ikke sikres lokalt. Behold siden åpen.");
    latest.current = next;
    setDraft(next);
  };
  const update = (fields) => {
    try {
      persist({ ...latest.current, ...fields });
    } catch (e) {
      setError(e.message);
    }
  };
  const load = async () => {
    if (operating.current) return;
    const ticket = ++epoch.current;
    try {
      const next = await progressRpc(context, root.id, unit?.id);
      if (
        alive.current &&
        ticket === epoch.current &&
        currentScope.current === scope
      ) {
        setData(next);
      }
    } catch (e) {
      if (alive.current && ticket === epoch.current) {
        setError(e.message);
        if (e.code === "42501") {
          setData(null);
          setReview(null);
        }
      }
    }
  };
  useEffect(() => {
    alive.current = true;
    setData(null);
    setReview(null);
    const saved = readBoligDraft(key, empty);
    latest.current = saved;
    setDraft(saved);
    load();
    const refresh = () => {
      if (document.visibilityState !== "hidden") load();
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener(PROGRESS_EVENT, refresh);
    window.addEventListener(WORK_PROFILE_EVENT, refresh);
    return () => {
      alive.current = false;
      ++epoch.current;
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener(PROGRESS_EVENT, refresh);
      window.removeEventListener(WORK_PROFILE_EVENT, refresh);
    };
  }, [scope]);
  const writable =
    context.enabled &&
    context.role === "manager" &&
    data?.context.role === "manager" &&
    !root.archived;
  const run = async (action, payload = {}, retry = false) => {
    if (operating.current || !writable || (!retry && latest.current.pending))
      return;
    operating.current = true;
    ++epoch.current;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const attempt = retry
        ? latest.current.pending
        : {
            action,
            payload: {
              ...payload,
              revision: payload.revision ?? data.revision,
              request_id: crypto.randomUUID(),
            },
          };
      persist({ ...latest.current, pending: attempt });
      const next = await progressRpc(
        context,
        root.id,
        unit?.id,
        attempt.action,
        attempt.payload,
      );
      if (!alive.current || currentScope.current !== scope) return;
      persist({
        ...latest.current,
        pending: null,
        ...(["save", "archive"].includes(attempt.action)
          ? { editor: null }
          : {}),
        ...(attempt.action === "notice" ? { notice: null } : {}),
        ...(attempt.action === "batch"
          ? attempt.payload.mode === "dates"
            ? { schedule: null }
            : { bulkPreview: null }
          : {}),
      });
      setData(next);
      setReview(null);
      setConfirmed(false);
      setNotice(
        attempt.action === "publish"
          ? "Varselet er publisert i beboerportalen. E-post følger egen utsendingsstatus."
          : attempt.action === "approve"
            ? "Varselet er godkjent. Publiser nå eller la godkjent dato styre publisering når varsling er aktivert."
            : "Endringen er lagret.",
      );
      return true;
    } catch (e) {
      if (alive.current && currentScope.current === scope) {
        setError(e.message);
        if (["22023", "42501", "PT409"].includes(e.code))
          persist({ ...latest.current, pending: null });
        if (e.code === "42501") {
          setData(null);
          setReview(null);
        }
      }
    } finally {
      operating.current = false;
      if (alive.current && currentScope.current === scope) {
        setBusy(false);
        window.dispatchEvent(new Event(PROGRESS_EVENT));
        window.dispatchEvent(new Event(COMPLETION_EVENT));
      }
    }
  };
  if (!context.enabled || !data)
    return (
      <section className="bolig-progress">
        <p role="status">{error || "Henter fremdrift …"}</p>
        <button type="button" onClick={load}>
          Hent fremdrift
        </button>
      </section>
    );
  const tasks = data.tasks.filter((t) => !t.archived),
    done = tasks.filter((t) => t.status === "done" && t.active).length,
    overdue = tasks.filter(
      (t) => t.status !== "done" && t.planned_end < localToday(),
    ).length;
  const shown = tasks.filter(
    (t) =>
      (filter === "all" ||
        (filter === "done"
          ? t.status === "done"
          : filter === "late"
            ? t.status !== "done" && t.planned_end < localToday()
            : t.status !== "done")) &&
      `${t.title} ${t.unit_number} ${t.address || ""} ${t.room_name || ""} ${t.owner_name || ""}`
        .toLocaleLowerCase("nb")
        .includes(query.toLocaleLowerCase("nb")),
  );
  const pages = Math.max(1, Math.ceil(shown.length / 8)),
    at = Math.min(page, pages - 1),
    disabled = busy || !!draft.pending;
  const edit = draft.editor,
    nd = draft.notice;
  const patch = (fields) =>
    update({ editor: { ...latest.current.editor, ...fields } });
  const notices = data.notices.filter((n) => !n.withdrawn);
  const mailStatus = (n) =>
    !data.mail_enabled
      ? "E-post satt på pause"
      : {
          accepted: "E-post akseptert av e-posttjenesten",
          pending: "E-post venter på utsending",
          sending: "Utsending pågår",
          suppressed: "Utsending stoppet etter ny kontroll",
          failed: "Utsending krever oppfølging",
        }[(data.deliveries || []).find((d) => d.notice_id === n.id)?.status] ||
        "E-post er ikke klargjort ennå";
  const cardStatus = (n) =>
    !n.current
      ? "Ny godkjenning kreves"
      : n.published_at
        ? "Publisert i portal"
        : n.valid
          ? "Godkjent"
          : "Utkast";
  return (
    <section className="bolig-progress" aria-label="Fremdrift og varsler">
      <div className="bolig-progress-heading">
        <div>
          <small>FRA PLAN TIL UTFØRT ARBEID</small>
          <h3>Fremdrift og varsler</h3>
          <p>
            Planlegg arbeid per bolig og rom. Registrer hva som faktisk er
            utført, og gjennomgå varselet før beboeren får se det.
          </p>
        </div>
        <button type="button" onClick={load} disabled={busy}>
          Oppdater status
        </button>
      </div>
      <div className="bolig-progress-metrics">
        <div>
          <CalendarDays size={21} />
          <strong>{tasks.length}</strong>
          <span>aktiviteter</span>
        </div>
        <div>
          <CheckCircle2 size={21} />
          <strong>
            {done}/{tasks.length}
          </strong>
          <span>utført</span>
        </div>
        <div>
          <Clock3 size={21} />
          <strong>{overdue}</strong>
          <span>passert planlagt slutt</span>
        </div>
      </div>
      <p className="bolig-progress-explainer">
        Varemottak, utført arbeid og godkjent overtagelse følges opp hver for
        seg. Planlagte datoer er arbeidsfrister dere setter selv.
      </p>
      {!data.mail_enabled && (
        <p className="bolig-progress-paused">
          <TriangleAlert size={18} />
          Automatisk publisering og e-post er satt på pause. Du kan godkjenne og
          publisere varsler i portalen manuelt. Ingen e-post sendes i denne
          testfasen.
        </p>
      )}
      {error && (
        <p role="alert" className="bolig-error">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="bolig-notice">
          {notice}
        </p>
      )}
      {draft.pending && (
        <div className="bolig-progress-pending">
          <strong>
            {busy ? "Lagrer endringen …" : "Lagringen er ikke bekreftet."}
          </strong>
          <p>
            Hent status eller prøv det samme forsøket igjen. Utkastet er bevart.
          </p>
          <button
            disabled={busy || !writable}
            onClick={() => run(null, {}, true)}
          >
            Prøv samme lagring igjen
          </button>
        </div>
      )}
      <Planning
        data={data}
        draft={draft}
        update={update}
        run={run}
        writable={writable}
        disabled={disabled}
        saving={busy}
        serverError={error}
        context={context}
        root={root}
        unit={unit}
        onEdit={(t) => {
          if (!t) return;
          update({
            editor: {
              ...t,
              room_id: t.room_id || "",
              predecessor_id: t.predecessor_id || "",
              actual_start: t.actual_start || "",
              actual_end: t.actual_end || "",
            },
          });
          setReview({ kind: "editor" });
        }}
      />
      <details className="bolig-progress-activity-list">
        <summary>Aktivitetsliste og enkeltaktiviteter</summary>
        <div className="bolig-progress-tools">
          <label>
            Søk i fremdrift
            <input
              type="search"
              placeholder="Bolig, rom, arbeid eller ansvarlig"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(0);
              }}
            />
          </label>
          <label>
            Vis
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPage(0);
              }}
            >
              <option value="open">Åpne aktiviteter</option>
              <option value="all">Alle aktiviteter</option>
              <option value="late">Passert planlagt slutt</option>
              <option value="done">Utført arbeid</option>
            </select>
          </label>
          {writable && (
            <button
              type="button"
              className="primary"
              disabled={disabled}
              onClick={() => {
                update({ editor: formTask(unit?.id, context.user_id) });
                setReview({ kind: "editor" });
              }}
            >
              <Plus size={17} />
              Ny aktivitet
            </button>
          )}
          {writable && edit && (
            <button type="button" onClick={() => setReview({ kind: "editor" })}>
              Fortsett aktivitetsutkast
            </button>
          )}
        </div>
        <div className="bolig-progress-list">
          {shown.slice(at * 8, at * 8 + 8).map((t) => (
            <article key={t.id} className={`bolig-progress-task ${t.status}`}>
              <div>
                <span className="bolig-progress-status">
                  {labels[t.status]}
                </span>
                <small>
                  {t.unit_number} · {t.room_name || "Hele boligen"}
                  {t.address ? ` · ${t.address}` : ""}
                </small>
              </div>
              <h4>{t.title}</h4>
              <p>
                {date(t.planned_start)} – {date(t.planned_end)}
              </p>
              <p className="bolig-progress-owner">
                {t.owner_name}
                {!t.owner_active ? " · Tilgang må avklares" : ""}
              </p>
              {t.actual_start && (
                <small>
                  Faktisk: {date(t.actual_start)}
                  {t.actual_end ? ` – ${date(t.actual_end)}` : ""}
                </small>
              )}
              {t.predecessor_id && (
                <small>
                  Etter:{" "}
                  {tasks.find((x) => x.id === t.predecessor_id)?.title ||
                    "Aktivitet må avklares"}
                </small>
              )}
              {!t.active && (
                <p role="status">
                  Bolig eller rom er endret. Avklar tilknytningen.
                </p>
              )}
              <div className="bolig-progress-task-actions">
                {writable && (
                  <>
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        update({
                          editor: {
                            ...t,
                            room_id: t.room_id || "",
                            predecessor_id: t.predecessor_id || "",
                            actual_start: t.actual_start || "",
                            actual_end: t.actual_end || "",
                          },
                        });
                        setReview({ kind: "editor" });
                      }}
                    >
                      Oppdater aktivitet
                    </button>
                    <button
                      type="button"
                      disabled={disabled || !t.active}
                      onClick={() => {
                        update({
                          notice: {
                            id: crypto.randomUUID(),
                            task_id: t.id,
                            body: `Vi planlegger ${t.title.toLocaleLowerCase("nb")} i ${t.room_name || "boligen"} fra ${date(t.planned_start)} til ${date(t.planned_end)}.`,
                            publish_on: localToday(),
                          },
                        });
                        setReview({ kind: "notice" });
                      }}
                    >
                      <Send size={15} />
                      Klargjør beboervarsel
                    </button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
        {shown.length === 0 && (
          <div className="bolig-progress-empty">
            <CalendarDays size={28} />
            <h4>
              {tasks.length
                ? "Ingen aktiviteter i dette utvalget"
                : "Start med første aktivitet"}
            </h4>
            <p>
              Legg til arbeid, datoer og ansvarlig. Beboervarsel lages og
              godkjennes separat.
            </p>
          </div>
        )}
        {pages > 1 && (
          <nav
            className="bolig-progress-pagination"
            aria-label="Sider i fremdrift"
          >
            <button disabled={!at} onClick={() => setPage(at - 1)}>
              Forrige
            </button>
            <span>
              Side {at + 1} av {pages}
            </span>
            <button disabled={at + 1 >= pages} onClick={() => setPage(at + 1)}>
              Neste
            </button>
          </nav>
        )}
      </details>
      <details className="bolig-progress-fold">
        <summary>
          Beboervarsler <span>{notices.length}</span>
        </summary>
        <p>
          Utkast → gjennomgang → godkjenning → publisering. Endret plan, tekst
          eller kontakt krever ny gjennomgang.
        </p>
        {writable && nd && (
          <button onClick={() => setReview({ kind: "notice" })}>
            Fortsett varselutkast
          </button>
        )}
        {notices.slice(0, 30).map((n) => (
          <article className="bolig-progress-notice" key={n.id}>
            <div>
              <strong>
                {n.unit_number} · {n.title}
              </strong>
              <span>{cardStatus(n)}</span>
            </div>
            <p>{n.body}</p>
            <small>
              Dato for publisering: {date(n.publish_on)} · Mottaker:{" "}
              {n.recipient || "E-post mangler"}
            </small>
            <small>{mailStatus(n)}</small>
            {writable && (
              <div className="bolig-progress-task-actions">
                <button
                  disabled={disabled || !n.current}
                  onClick={() => setReview({ kind: "print", id: n.id })}
                >
                  PDF / oppslag
                </button>
                <button
                  disabled={disabled}
                  onClick={() => {
                    setConfirmed(false);
                    setReview({ kind: "review", id: n.id });
                  }}
                >
                  Se over varselet
                </button>
                {!n.current && (
                  <button
                    disabled={disabled}
                    onClick={() => {
                      update({
                        notice: {
                          id: crypto.randomUUID(),
                          task_id: n.task_id,
                          body: n.body,
                          publish_on: localToday(),
                        },
                      });
                      setReview({ kind: "notice" });
                    }}
                  >
                    Lag ny varselutgave
                  </button>
                )}
                <button
                  disabled={disabled}
                  onClick={() => run("withdraw", { id: n.id })}
                >
                  Trekk tilbake
                </button>
              </div>
            )}
          </article>
        ))}
        {notices.length > 30 && (
          <p>Siste 30 varsler vises. Velg én bolig for kortere oversikt.</p>
        )}
      </details>
      <details className="bolig-progress-fold">
        <summary>
          Siste endringer <span>{data.history.length}</span>
        </summary>
        {data.history.map((h) => (
          <p key={h.revision}>
            #{h.revision} ·{" "}
            {new Date(h.created_at).toLocaleString("nb-NO", {
              timeZone: "Europe/Oslo",
            })}{" "}
            ·{" "}
            {
              {
                save: "Aktivitet lagret",
                batch_create: "Aktiviteter opprettet samlet",
                batch_dates: "Planlagte datoer flyttet samlet",
                archive: "Aktivitet arkivert",
                notice: "Varselutkast lagret",
                approve: "Varsel godkjent",
                publish: "Varsel publisert",
                withdraw: "Varsel trukket tilbake",
              }[h.action]
            }
          </p>
        ))}
      </details>
      {writable && edit && review?.kind === "editor" && (
        <Dialog
          title="Aktivitet og faktisk fremdrift"
          busy={busy}
          onClose={() => setReview(null)}
          className="bolig-progress-editor"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              run("save", edit);
            }}
          >
            <p>
              Utkastet beholdes når du lukker. Lagre endringer når datoer og
              utførelse er kontrollert.
            </p>
            <label>
              Arbeid
              <input
                required
                minLength={2}
                maxLength={120}
                value={edit.title}
                disabled={disabled}
                onChange={(e) => patch({ title: e.target.value })}
              />
            </label>
            <div className="bolig-progress-fields">
              <label>
                Bolig
                <select
                  aria-label="Bolig"
                  required
                  disabled={
                    disabled ||
                    !!unit ||
                    data.tasks.some((t) => t.id === edit.id)
                  }
                  value={edit.unit_id}
                  onChange={(e) =>
                    patch({
                      unit_id: e.target.value,
                      room_id: "",
                      predecessor_id: "",
                    })
                  }
                >
                  <option value="">Velg bolig</option>
                  {data.units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.number} · {u.address}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Rom
                <select
                  aria-label="Rom"
                  value={edit.room_id}
                  disabled={disabled}
                  onChange={(e) => patch({ room_id: e.target.value })}
                >
                  <option value="">Hele boligen</option>
                  {data.rooms
                    .filter((r) => r.unit_id === edit.unit_id)
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                Planlagt start
                <input
                  required
                  type="date"
                  value={edit.planned_start}
                  disabled={disabled}
                  onChange={(e) => patch({ planned_start: e.target.value })}
                />
              </label>
              <label>
                Planlagt slutt
                <input
                  required
                  type="date"
                  min={edit.planned_start}
                  value={edit.planned_end}
                  disabled={disabled}
                  onChange={(e) => patch({ planned_end: e.target.value })}
                />
              </label>
              <label>
                Ansvarlig
                <select
                  aria-label="Ansvarlig"
                  required
                  value={edit.owner_id}
                  disabled={disabled}
                  onChange={(e) => patch({ owner_id: e.target.value })}
                >
                  <option value="">Velg ansvarlig</option>
                  {data.members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Må utføres etter
                <select
                  aria-label="Må utføres etter"
                  value={edit.predecessor_id}
                  disabled={disabled}
                  onChange={(e) => patch({ predecessor_id: e.target.value })}
                >
                  <option value="">Ingen avhengighet</option>
                  {tasks
                    .filter(
                      (t) => t.id !== edit.id && t.unit_id === edit.unit_id,
                    )
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                Status
                <select
                  aria-label="Status"
                  value={edit.status}
                  disabled={disabled}
                  onChange={(e) =>
                    patch({
                      status: e.target.value,
                      ...(e.target.value !== "done" ? { actual_end: "" } : {}),
                    })
                  }
                >
                  {Object.entries(labels).map(([k, v]) => (
                    <option value={k} key={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Faktisk startet
                <input
                  type="date"
                  required={["working", "done"].includes(edit.status)}
                  max={localToday()}
                  value={edit.actual_start}
                  disabled={disabled}
                  onChange={(e) => patch({ actual_start: e.target.value })}
                />
              </label>
              {edit.status === "done" && (
                <label>
                  Faktisk ferdig
                  <input
                    required
                    type="date"
                    min={edit.actual_start}
                    max={localToday()}
                    value={edit.actual_end}
                    disabled={disabled}
                    onChange={(e) => patch({ actual_end: e.target.value })}
                  />
                </label>
              )}
            </div>
            <label className="bolig-progress-check">
              <input
                type="checkbox"
                checked={edit.required}
                disabled={disabled}
                onChange={(e) => patch({ required: e.target.checked })}
              />
              Påkrevd før ferdigstilling
            </label>
            <label>
              Arbeidsnotat / begrunnelse ved gjenåpning
              <textarea
                maxLength={2000}
                value={edit.note}
                disabled={disabled}
                onChange={(e) => patch({ note: e.target.value })}
              />
            </label>
            {error && <p role="alert">{error}</p>}
            <footer>
              {data.tasks.some((t) => t.id === edit.id) && (
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => setReview({ kind: "archive", id: edit.id })}
                >
                  Arkiver aktivitet
                </button>
              )}
              <button
                type="button"
                onClick={() => setReview(null)}
                disabled={busy}
              >
                Lukk og behold utkast
              </button>
              <button className="primary" type="submit" disabled={disabled}>
                Lagre endringer
              </button>
            </footer>
          </form>
        </Dialog>
      )}
      {writable && nd && review?.kind === "notice" && (
        <Dialog
          title="Klargjør beboervarsel"
          busy={busy}
          onClose={() => setReview(null)}
          className="bolig-progress-editor"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              run("notice", nd);
            }}
          >
            <p>
              Dette lagrer et utkast. Se over mottaker og datoer før du
              godkjenner.
            </p>
            <label>
              Melding til beboeren
              <textarea
                required
                minLength={3}
                maxLength={2000}
                value={nd.body}
                disabled={disabled}
                onChange={(e) =>
                  update({ notice: { ...nd, body: e.target.value } })
                }
              />
            </label>
            <label>
              Dato for publisering
              <input
                required
                type="date"
                value={nd.publish_on}
                disabled={disabled}
                onChange={(e) =>
                  update({ notice: { ...nd, publish_on: e.target.value } })
                }
              />
            </label>
            {error && <p role="alert">{error}</p>}
            <footer>
              <button
                disabled={busy}
                type="button"
                onClick={() => setReview(null)}
              >
                Lukk og behold utkast
              </button>
              <button type="submit" className="primary" disabled={disabled}>
                Lagre varselutkast
              </button>
            </footer>
          </form>
        </Dialog>
      )}
      {writable && review?.kind === "archive" && (
        <Dialog
          title="Arkiver aktivitet"
          busy={busy}
          onClose={() => setReview({ kind: "editor" })}
          className="bolig-progress-editor"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              run("archive", {
                id: review.id,
                confirmed: true,
                reason: draft.archive_reason || "",
              });
            }}
          >
            <p>
              Aktiviteten og historikken beholdes. Varsler stoppes og
              aktiviteten tas ut av den aktive planen. Avhengige aktiviteter må
              avklares først.
            </p>
            <label>
              Begrunnelse
              <textarea
                required
                minLength={3}
                maxLength={500}
                value={draft.archive_reason || ""}
                onChange={(e) => update({ archive_reason: e.target.value })}
                disabled={disabled}
              />
            </label>
            {error && <p role="alert">{error}</p>}
            <footer>
              <button
                type="button"
                disabled={busy}
                onClick={() => setReview({ kind: "editor" })}
              >
                Tilbake til aktiviteten
              </button>
              <button type="submit" disabled={disabled}>
                Bekreft arkivering
              </button>
            </footer>
          </form>
        </Dialog>
      )}
      {writable && review?.kind === "print" && data.notices.some((n) => n.id === review.id) && (
        <NoticePrint key={scope} context={context} root={root} unit={unit} notice={data.notices.find((n) => n.id === review.id)} onClose={() => setReview(null)} />
      )}
      {review?.kind === "review" &&
        (() => {
          const n = data.notices.find((x) => x.id === review.id);
          if (!n) return null;
          return (
            <Dialog
              title="Gjennomgå beboervarsel"
              busy={busy}
              onClose={() => setReview(null)}
              className="bolig-progress-editor"
            >
              <div className="bolig-progress-review">
                <small>{cardStatus(n)}</small>
                <h3>
                  {n.unit_number} · {n.title}
                </h3>
                <p>
                  <strong>Mottaker:</strong> {n.recipient || "E-post mangler"}
                </p>
                <p>
                  <strong>Planlagt arbeid:</strong> {date(n.planned_start)} –{" "}
                  {date(n.planned_end)}
                </p>
                <p className="bolig-progress-preview">{n.body}</p>
                <p>
                  Publisering {date(n.publish_on)}. Beboeren finner publiserte
                  varsler under Meldinger i sin personlige portal. E-post er en
                  egen utsending og er ikke bevis på at meldingen er lest.
                </p>
                {!n.current && (
                  <p role="alert">
                    Plan eller kontakt er endret. Lag en ny varselutgave.
                  </p>
                )}
                <label className="bolig-progress-check">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    disabled={disabled}
                    onChange={(e) => setConfirmed(e.target.checked)}
                  />
                  Jeg har kontrollert mottaker, datoer og innhold.
                </label>
                {error && <p role="alert">{error}</p>}
                <footer>
                  <button disabled={busy} onClick={() => setReview(null)}>
                    Tilbake
                  </button>
                  {!n.valid ? (
                    <button
                      className="primary"
                      disabled={disabled || !confirmed || !n.current}
                      onClick={() =>
                        run("approve", {
                          id: n.id,
                          basis: n.basis,
                          reviewed: true,
                        })
                      }
                    >
                      Godkjenn varselet
                    </button>
                  ) : (
                    <button
                      className="primary"
                      disabled={
                        disabled ||
                        !confirmed ||
                        n.publish_on > localToday() ||
                        !!n.published_at
                      }
                      onClick={() =>
                        run("publish", { id: n.id, reviewed: true })
                      }
                    >
                      Publiser i beboerportalen
                    </button>
                  )}
                </footer>
              </div>
            </Dialog>
          );
        })()}
    </section>
  );
}
