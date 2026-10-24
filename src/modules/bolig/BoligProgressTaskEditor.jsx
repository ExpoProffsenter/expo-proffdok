import React from "react";
import Dialog from "./BoligEditorDialog.jsx";
import {
  progressDate as date,
  progressLabels as labels,
  localToday,
} from "./boligProgressClient.js";

// Both the plan and a linked case use this exact editor and the parent's
// existing save/retry handler. This component performs no server writes.
export default function BoligProgressTaskEditor({
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
}) {
  return (
    <>
      {writable && edit && review?.kind === "editor" && (
        <Dialog
          title="Aktivitet og faktisk fremdrift"
          busy={busy}
          onClose={closeTask}
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
            {edit.revision != null &&
              edit.revision !== data.revision &&
              !draft.pending && (
                <div className="bolig-notice">
                  <p>
                    Planen er endret. Kontroller siste status før du bruker
                    utkastet.
                  </p>
                  {data.tasks
                    .filter((t) => t.id === edit.id)
                    .map((t) => (
                      <p key={t.id}>
                        Nå lagret: {t.title} · {t.owner_name} ·{" "}
                        {date(t.planned_start)} – {date(t.planned_end)} ·{" "}
                        {labels[t.status]}
                      </p>
                    ))}
                  {data.tasks
                    .filter((t) => t.id === edit.id)
                    .map((t) => (
                      <div key={t.id}>
                        <p>Sist lagret arbeidsnotat: {t.note || "Ingen"}</p>
                        <p>
                          Rom: {t.room_name || "Hele boligen"} · Faktisk
                          startet: {date(t.actual_start)} · Faktisk ferdig:{" "}
                          {date(t.actual_end)}
                        </p>
                        <p>
                          {t.required
                            ? "Påkrevd før ferdigstilling"
                            : "Valgfritt arbeid"}{" "}
                          · Må utføres etter:{" "}
                          {tasks.find((x) => x.id === t.predecessor_id)
                            ?.title || "Ingen avhengighet"}
                        </p>
                      </div>
                    ))}
                  <p>
                    Utkastet ditt beholdes. Ta med endringene du ønsker før du
                    lagrer.
                  </p>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => patch({ revision: data.revision })}
                  >
                    Se over og bruk siste grunnlag
                  </button>
                </div>
              )}
            {error && <p role="alert">{error}</p>}
            {draft.pending && (
              <div role="status">
                <p>Lagringen er ikke bekreftet. Utkastet er beholdt.</p>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => run(null, {}, true)}
                >
                  Prøv samme lagring igjen
                </button>
              </div>
            )}
            <footer>
              {data.tasks.some((t) => t.id === edit.id) && (
                <button
                  type="button"
                  disabled={
                    disabled ||
                    (edit.revision != null && edit.revision !== data.revision)
                  }
                  onClick={() => setReview({ kind: "archive", id: edit.id })}
                >
                  Arkiver aktivitet
                </button>
              )}
              <button type="button" onClick={closeTask} disabled={busy}>
                Lukk og behold utkast
              </button>
              <button
                className="primary"
                type="submit"
                disabled={
                  disabled ||
                  (edit.revision != null && edit.revision !== data.revision)
                }
              >
                Lagre endringer
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
                revision: edit?.revision ?? data.revision,
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
            {draft.pending && (
              <button
                type="button"
                disabled={busy}
                onClick={() => run(null, {}, true)}
              >
                Prøv samme lagring igjen
              </button>
            )}
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
      {writable && review?.kind === "draft-choice" && (
        <Dialog title="Du har et aktivitetsutkast" onClose={closeTask}>
          <p>
            Utkastet «{draft.editor?.title || "Ny aktivitet"}» gjelder en annen
            aktivitet. Velg hva du vil gjøre før du åpner «{review.task.title}».
          </p>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setReview({ kind: "editor" })}
          >
            Fortsett lagret utkast
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => openTask(review.task, true)}
          >
            Forkast utkast og åpne valgt aktivitet
          </button>
        </Dialog>
      )}
    </>
  );
}
