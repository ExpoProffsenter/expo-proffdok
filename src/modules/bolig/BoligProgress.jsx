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
import TaskEditor from "./BoligProgressTaskEditor.jsx";
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
import NoticeComposer from "./BoligResidentNoticeComposer.jsx";
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
const taskForm = (task, revision) => ({
  ...task,
  revision,
  room_id: task.room_id || "",
  predecessor_id: task.predecessor_id || "",
  actual_start: task.actual_start || "",
  actual_end: task.actual_end || "",
});
export default function BoligProgress({
  context,
  root,
  unit = null,
  taskId = null,
  onTaskClose,
}) {
  const scope = `${context.user_id}/${context.company_id}/${root.id}/${unit?.id || "all"}/${context.role}/${context.enabled}`;
  const key = boligDraftKey(context, root.id, `progress-${unit?.id || "all"}`);
  const [draft, setDraft] = useState(() => readBoligDraft(key, empty)),
    [data, setData] = useState(null),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [filter, setFilter] = useState("open"),
    [query, setQuery] = useState(""),
    [page, setPage] = useState(0),
    [review, setReview] = useState(null);
  const alive = useRef(false),
    epoch = useRef(0),
    operating = useRef(false),
    latest = useRef(draft),
    currentScope = useRef(scope),
    openedTask = useRef(null);
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
    openedTask.current = null;
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
    !root.archived &&
    (!taskId ||
      !!draft.pending ||
      data.tasks.some((t) => t.id === taskId && t.active && !t.archived));
  const openTask = (task, replace = false) => {
    if (latest.current.pending) {
      setReview({ kind: "pending" });
      return;
    }
    if (!task || task.archived || !writable) return;
    const saved = latest.current.editor;
    if (saved && saved.id !== task.id && !replace) {
      setReview({ kind: "draft-choice", task });
      return;
    }
    try {
      persist({
        ...latest.current,
        editor:
          !replace && saved?.id === task.id
            ? saved
            : taskForm(task, data.revision),
      });
      setReview({ kind: "editor" });
    } catch (e) {
      setError(e.message);
    }
  };
  useEffect(() => {
    if (
      !taskId ||
      !data ||
      !writable ||
      openedTask.current === `${scope}/${taskId}`
    )
      return;
    openedTask.current = `${scope}/${taskId}`;
    openTask(data.tasks.find((t) => t.id === taskId));
  }, [scope, taskId, data, writable]);
  const closeTask = () => {
    setReview(null);
    if (taskId) onTaskClose?.();
  };
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

      setNotice(
        attempt.action === "publish"
          ? "Varselet er publisert i beboerportalen. E-post følger egen utsendingsstatus."
          : attempt.action === "approve"
            ? "Varselet er godkjent. Publiser nå eller la godkjent dato styre publisering når varsling er aktivert."
            : "Endringen er lagret.",
      );
      if (taskId && ["save", "archive"].includes(attempt.action))
        onTaskClose?.();
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
  if (!context.enabled || !data) {
    const loading = (
      <section className="bolig-progress">
        <p role="status">{error || "Henter fremdrift …"}</p>
        <button type="button" onClick={load}>
          Hent fremdrift
        </button>
      </section>
    );
    return taskId ? (
      <Dialog title="Aktivitet og faktisk fremdrift" onClose={closeTask}>
        {loading}
      </Dialog>
    ) : (
      loading
    );
  }
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
  const allNotices = data.notices.filter((n) => !n.withdrawn);
  const notices = allNotices.filter(
    (n, i, a) =>
      !n.group_id || a.findIndex((x) => x.group_id === n.group_id) === i,
  );
  const mailStatus = (n) => {
    if (n.group_id && !n.digital)
      return n.paper_ready
        ? "PDF / oppslag – ingen digital utsending"
        : "Utkast – ingen utsending";
    if (n.group_id && data.mail_enabled) {
      const ids = allNotices
        .filter((x) => x.group_id === n.group_id)
        .map((x) => x.id);
      const jobs = (data.deliveries || []).filter(
        (d) => ids.includes(d.notice_id) && d.kind === "resident",
      );
      const count = (status) =>
        jobs.filter((d) => status.includes(d.status)).length;
      return `E-post: ${count(["accepted"])} akseptert av e-posttjenesten · ${count(["pending", "sending"])} venter · ${count(["failed", "suppressed"])} krever oppfølging`;
    }
    return !data.mail_enabled
      ? "E-post satt på pause"
      : {
          accepted: "E-post akseptert av e-posttjenesten",
          pending: "E-post venter på utsending",
          sending: "Utsending pågår",
          suppressed: "Utsending stoppet etter ny kontroll",
          failed: "Utsending krever oppfølging",
        }[(data.deliveries || []).find((d) => d.notice_id === n.id)?.status] ||
          "E-post er ikke klargjort ennå";
  };
  const cardStatus = (n) =>
    !n.current
      ? "Grunnlaget er endret"
      : n.published_at
        ? "Publisert i portal"
        : n.valid
          ? "Planlagt for publisering"
          : n.paper_ready
            ? "Ferdig PDF / oppslag"
            : "Utkast";
  const taskDialogs = (
    <TaskEditor
      {...{
        writable,
        edit,
        review,
        busy,
        disabled,
        unit,
        data,
        tasks,
        draft,
        error,
        patch,
        run,
        update,
        setReview,
        closeTask,
        openTask,
      }}
    />
  );
  if (taskId)
    return (
      <>
        {taskDialogs}
        {(!writable ||
          !["editor", "archive", "draft-choice"].includes(review?.kind)) && (
          <Dialog title="Aktivitet og faktisk fremdrift" onClose={closeTask}>
            {error && <p role="alert">{error}</p>}
            {draft.pending ? (
              <>
                <p>
                  Lagringen av «
                  {draft.pending.payload?.title || "tidligere endring"}» er ikke
                  bekreftet. Prøv det samme forsøket igjen før du åpner
                  aktiviteten.
                </p>
                <button
                  type="button"
                  disabled={busy || !writable}
                  onClick={() => run(null, {}, true)}
                >
                  Prøv samme lagring igjen
                </button>
              </>
            ) : (
              <p>
                Aktiviteten er ikke tilgjengelig for redigering. Kontroller
                tilgang og aktiv tilknytning.
              </p>
            )}
            <button type="button" onClick={closeTask} disabled={busy}>
              Tilbake til saken
            </button>
          </Dialog>
        )}
      </>
    );
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
        {writable && (
          <button
            className="primary"
            type="button"
            disabled={disabled}
            onClick={() => setReview({ kind: "composer" })}
          >
            <Plus size={16} /> Nytt beboervarsel
          </button>
        )}
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
          E-post er satt på pause i testmiljøet. Du kan lage PDF/oppslag og
          publisere varsler i beboerportalen. Ingen e-post sendes i denne
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
      {draft.pending && !["editor", "archive"].includes(review?.kind) && (
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
        onEdit={openTask}
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
                update({
                  editor: {
                    ...formTask(unit?.id, context.user_id),
                    revision: data.revision,
                  },
                });
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
                      onClick={() => openTask(t)}
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
              Legg til arbeid, datoer og ansvarlig. Velg «Nytt beboervarsel» for
              å varsle én bolig eller et større utvalg.
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
          Velg «Nytt beboervarsel». Skriv én melding til prosjektet, et bygg, en
          oppgang eller valgte boliger. PDF og publisering finnes i samme vindu.
        </p>
        {writable && (
          <button
            disabled={disabled}
            onClick={() => setReview({ kind: "composer" })}
          >
            Nytt beboervarsel
          </button>
        )}
        {writable && nd && (
          <button onClick={() => setReview({ kind: "notice" })}>
            Fortsett varselutkast
          </button>
        )}
        {notices.slice(0, 30).map((n) => (
          <article className="bolig-progress-notice" key={n.id}>
            <div>
              <strong>
                {n.group_id ? n.audience_label : n.unit_number} · {n.title}
              </strong>
              <span>{cardStatus(n)}</span>
            </div>
            <p>{n.body}</p>
            <small>
              Dato for publisering: {date(n.publish_on)} · Mottaker:{" "}
              {n.group_id
                ? `${allNotices.filter((x) => x.group_id === n.group_id).length} boliger`
                : n.recipient || "E-post mangler"}
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
                    setReview({ kind: "review", id: n.id });
                  }}
                >
                  Åpne varselet
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
                  onClick={() =>
                    run(n.group_id ? "notice_group_withdraw" : "withdraw", {
                      id: n.group_id || n.id,
                    })
                  }
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
      {taskDialogs}
      {writable &&
        ["composer", "notice", "review", "print"].includes(review?.kind) && (
          <NoticeComposer
            key={scope}
            context={context}
            root={root}
            unit={unit}
            data={data}
            source={
              review.id
                ? data.notices.find((n) => n.id === review.id)
                : review.kind === "notice"
                  ? nd
                  : null
            }
            onClose={() => {
              setReview(null);
              if (review.kind === "notice") update({ notice: null });
            }}
            onSaved={(next) => setData(next)}
          />
        )}
    </section>
  );
}
