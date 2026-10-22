import React, { useMemo, useState } from "react";
import Board from "../kshms/KshmsProgressBoard.jsx";
import { STANDARD_PROGRESS_OPERATIONS } from "../progress/progressPlanStandardOperations.js";
import Dialog from "./BoligEditorDialog.jsx";
import { localToday, progressDate as date } from "./boligProgressClient.js";
import {
  orderedUnits,
  buildBulkPlan,
  buildShiftPlan,
  boligTimelinePlan,
  timelineDates,
} from "./boligProgressPlanning.mjs";

const initialForm = (owner, unit) => ({
  selected: unit ? [unit] : [],
  start: localToday(),
  cadence: 2,
  weekdays: true,
  owner,
  delta: 2,
  steps: [{ title: "Montering", duration: 1, required: true }],
});
export default function BoligProgressPlanning({
  data,
  draft,
  update,
  run,
  writable,
  disabled,
  saving,
  serverError,
  context,
  root,
  unit,
  onEdit,
}) {
  const [open, setOpen] = useState(""),
    [timeline, setTimeline] = useState(false),
    [checking, setChecking] = useState(false),
    [error, setError] = useState(""),
    [timelineUnit, setTimelineUnit] = useState(""),
    [timelinePage, setTimelinePage] = useState(0),
    [launchToken, setLaunchToken] = useState(0),
    [inspect, setInspect] = useState(null);
  const form = draft.bulk || initialForm(context.user_id, unit?.id),
    schedule = draft.schedule;
  const units = useMemo(
    () => orderedUnits(data.units.filter((u) => !unit || u.id === unit.id)),
    [data.units, unit?.id],
  );
  const [block, setBlock] = useState(""),
    [entrance, setEntrance] = useState(""),
    [floor, setFloor] = useState(""),
    [search, setSearch] = useState("");
  const visible = units.filter(
    (u) =>
      (!block || u.block_id === block) &&
      (!entrance || u.entrance_id === entrance) &&
      (!floor || String(u.floor) === floor) &&
      `${u.number} ${u.address} ${u.block_name || ""}`
        .toLocaleLowerCase("nb")
        .includes(search.toLocaleLowerCase("nb")),
  );
  const selected = form.selected.filter((id) => units.some((u) => u.id === id));
  const patch = (fields) => {
    update({ bulk: { ...form, ...fields }, bulkPreview: null });
    setError("");
  };
  const launch = (mode) => {
    setError("");
    setChecking(false);
    setOpen(mode);
  };
  const preview = () => {
    try {
      const result =
        open === "create"
          ? { items: buildBulkPlan({ ...form, units, selected }), skipped: 0 }
          : buildShiftPlan(data.tasks, selected, form.delta, form.weekdays);
      update({
        bulk: form,
        bulkPreview: {
          ...result,
          mode: open,
          revision: data.revision,
          reviewed: true,
        },
      });
      setChecking(true);
      setError("");
    } catch (e) {
      setError(e.message);
    }
  };
  const save = async (payload) => {
    const ok = await run("batch", payload);
    if (ok) {
      setOpen("");
      setChecking(false);
      setTimeline(false);
    }
  };
  const currentPreview =
    draft.bulkPreview?.mode === open ? draft.bulkPreview : null;
  const taskById = new Map(data.tasks.map((t) => [t.id, t]));
  const matchingTimeline = data.tasks.filter(
    (t) =>
      !t.archived &&
      t.active &&
      (!selected.length || selected.includes(t.unit_id)) &&
      (!timelineUnit || t.unit_id === timelineUnit),
  );
  const timelinePages = Math.max(1, Math.ceil(matchingTimeline.length / 200));
  const timelineAt = Math.min(timelinePage, timelinePages - 1);
  const timelineTasks = matchingTimeline.slice(
    timelineAt * 200,
    (timelineAt + 1) * 200,
  );
  const timelinePlan = useMemo(() => {
    if (!timeline) return null;
    const changes = new Map((schedule?.items || []).map((i) => [i.id, i]));
    return boligTimelinePlan(
      timelineTasks.map((t) => ({ ...t, ...changes.get(t.id) })),
    );
  }, [timeline, timelineTasks, schedule]);
  const changedPlan = (plan) => {
    try {
      const changed = timelineDates(plan, timelineTasks),
        visibleIds = new Set(timelineTasks.map((t) => t.id));
      const items = [
        ...(schedule?.items || []).filter((i) => !visibleIds.has(i.id)),
        ...changed,
      ];
      update({
        schedule: items.length
          ? {
              items,
              revision: schedule?.revision ?? data.revision,
              mode: "dates",
              reviewed: true,
            }
          : null,
      });
      setError("");
    } catch (e) {
      setError(e.message);
    }
  };
  const rows = (items) => (
    <div className="bolig-plan-preview-scroll">
      <table>
        <thead>
          <tr>
            <th>Bolig / arbeid</th>
            <th>Før</th>
            <th>Ny plan</th>
          </tr>
        </thead>
        <tbody>
          {items.map((i) => {
            const old = taskById.get(i.id),
              u = units.find((u) => u.id === (i.unit_id || old?.unit_id));
            return (
              <tr key={i.id}>
                <td>
                  {u?.number} · {u?.address}
                  <strong>{i.title || old?.title}</strong>
                </td>
                <td>
                  {old
                    ? `${date(old.planned_start)}–${date(old.planned_end)}`
                    : "Ny aktivitet"}
                </td>
                <td>
                  {date(i.planned_start)}–{date(i.planned_end)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
  const reviewInfo = (
    <p className="bolig-progress-paused">
      Kontroller datoene før lagring. Beboervarsler som berøres, krever ny
      utgave og godkjenning. Denne handlingen publiserer ingen varsler.
    </p>
  );
  return (
    <div className="bolig-plan-workspace">
      <div className="bolig-plan-launchers">
        <button
          type="button"
          onClick={() => {
            setError("");
            setTimeline(true);
            setLaunchToken((n) => n + 1);
          }}
        >
          Åpne samlet tidslinje
        </button>
        {writable && (
          <>
            <button
              type="button"
              disabled={disabled}
              onClick={() => launch("create")}
            >
              {draft.bulk ? "Fortsett masseoppsett" : "Planlegg flere boliger"}
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => launch("dates")}
            >
              Flytt datoer samlet
            </button>
          </>
        )}
      </div>
      <p>
        Bruk samme plan for alle boligene. Legg opp arbeidet samlet, og tilpass
        unntak på den enkelte aktiviteten.
      </p>
      {writable && schedule?.items?.length > 0 && !timeline && (
        <p role="status">
          {schedule.items.length} datoendringer er bevart i utkastet. Åpne
          tidslinjen for å fortsette.
        </p>
      )}
      {["create", "dates"].includes(open) && writable && (
        <Dialog
          title={
            open === "create" ? "Planlegg flere boliger" : "Flytt datoer samlet"
          }
          busy={saving}
          onClose={() => setOpen("")}
          className="bolig-plan-dialog"
        >
          <div className="bolig-plan-dialog-body">
            <p>
              1. Velg boliger. 2. Sett opp planen. 3. Se over alle datoene og
              lagre samlet.
            </p>
            {(error ||
              serverError ||
              (checking && data.revision !== currentPreview?.revision)) && (
              <p role="alert" className="bolig-error">
                {error ||
                  serverError ||
                  "Fremdriften er endret. Gå tilbake og forhåndsvis på nytt."}
              </p>
            )}
            {!checking ? (
              <fieldset disabled={disabled}>
                <h3>Velg boliger ({selected.length})</h3>
                <div className="bolig-plan-fields">
                  <label>
                    Bygg
                    <select
                      aria-label="Bygg"
                      value={block}
                      onChange={(e) => {
                        setBlock(e.target.value);
                        setEntrance("");
                        setFloor("");
                      }}
                    >
                      <option value="">Alle bygg</option>
                      {[
                        ...new Map(
                          units
                            .filter((u) => u.block_id)
                            .map((u) => [u.block_id, u.block_name]),
                        ).entries(),
                      ].map(([id, name]) => (
                        <option key={id} value={id}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Oppgang
                    <select
                      aria-label="Oppgang"
                      value={entrance}
                      onChange={(e) => {
                        setEntrance(e.target.value);
                        setFloor("");
                      }}
                    >
                      <option value="">Alle oppganger</option>
                      {[
                        ...new Map(
                          units
                            .filter((u) => !block || u.block_id === block)
                            .map((u) => [
                              u.entrance_id || u.address,
                              u.address,
                            ]),
                        ).entries(),
                      ].map(([id, name]) => (
                        <option key={id} value={id}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Etasje
                    <select
                      aria-label="Etasje"
                      value={floor}
                      onChange={(e) => setFloor(e.target.value)}
                    >
                      <option value="">Alle etasjer</option>
                      {[...new Set(units.map((u) => u.floor).filter(Boolean))]
                        .sort((a, b) => a - b)
                        .map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                    </select>
                  </label>
                  <label>
                    Søk etter bolig
                    <input
                      type="search"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </label>
                </div>
                <div className="bolig-plan-launchers">
                  <button
                    type="button"
                    onClick={() =>
                      patch({
                        selected: [
                          ...new Set([
                            ...selected,
                            ...visible.map((u) => u.id),
                          ]),
                        ],
                      })
                    }
                  >
                    Velg alle treff ({visible.length})
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      patch({
                        selected: selected.filter(
                          (id) => !visible.some((u) => u.id === id),
                        ),
                      })
                    }
                  >
                    Fjern treff fra utvalget
                  </button>
                  <button type="button" onClick={() => patch({ selected: [] })}>
                    Tøm utvalg
                  </button>
                </div>
                <div className="bolig-plan-unit-list">
                  {visible.map((u) => (
                    <label key={u.id}>
                      <input
                        type="checkbox"
                        checked={selected.includes(u.id)}
                        onChange={(e) =>
                          patch({
                            selected: e.target.checked
                              ? [...selected, u.id]
                              : selected.filter((id) => id !== u.id),
                          })
                        }
                      />
                      <span>
                        {u.number}
                        <small>
                          {u.block_name} · {u.address}
                          {u.floor ? ` · Etasje ${u.floor}` : ""}
                        </small>
                      </span>
                    </label>
                  ))}
                </div>
                <p>
                  Rekkefølge: bygg, oppgang, etasje og bolignummer. Utvalget
                  beholdes når du bytter filter.
                </p>
                <h3>
                  {open === "create" ? "Plan og arbeidsmal" : "Forskyvning"}
                </h3>
                <div className="bolig-plan-fields">
                  {open === "create" ? (
                    <>
                      <label>
                        Første oppstart
                        <input
                          type="date"
                          value={form.start}
                          onChange={(e) => patch({ start: e.target.value })}
                        />
                      </label>
                      <label>
                        Dager mellom boligstarter
                        <input
                          type="number"
                          min="0"
                          max="365"
                          value={form.cadence}
                          onChange={(e) => patch({ cadence: e.target.value })}
                        />
                        <small>
                          0 starter alle samtidig. 2 starter neste bolig to
                          dager senere.
                        </small>
                      </label>
                      <label>
                        Ansvarlig
                        <select
                          value={form.owner}
                          onChange={(e) => patch({ owner: e.target.value })}
                        >
                          <option value="">Velg ansvarlig</option>
                          {data.members.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name}
                            </option>
                          ))}
                        </select>
                      </label>
                    </>
                  ) : (
                    <label>
                      Flytt antall dager
                      <input
                        type="number"
                        min="-365"
                        max="365"
                        value={form.delta}
                        onChange={(e) => patch({ delta: e.target.value })}
                      />
                      <small>
                        Positivt tall flytter frem. Negativt tall flytter
                        tilbake.
                      </small>
                    </label>
                  )}
                  <label className="bolig-plan-check">
                    <input
                      type="checkbox"
                      checked={form.weekdays}
                      onChange={(e) => patch({ weekdays: e.target.checked })}
                    />
                    Tell bare mandag–fredag
                  </label>
                </div>
                {open === "create" ? (
                  <>
                    <p>
                      Aktivitetene følger etter hverandre i hver bolig. Varighet
                      er antall dager med valgt ukeregel. Helligdager må dere
                      justere selv.
                    </p>
                    <label>
                      Legg til standardaktivitet
                      <select
                        value=""
                        onChange={(e) => {
                          const operation = STANDARD_PROGRESS_OPERATIONS.find(
                            (o) => o.id === e.target.value,
                          );
                          if (operation && form.steps.length < 20)
                            patch({
                              steps: [
                                ...form.steps,
                                {
                                  title: operation.title,
                                  duration: 1,
                                  required: true,
                                },
                              ],
                            });
                        }}
                      >
                        <option value="">
                          Velg fra appens standardaktiviteter
                        </option>
                        {STANDARD_PROGRESS_OPERATIONS.map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.title}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="bolig-plan-steps">
                      {form.steps.map((s, i) => (
                        <div key={i} className="bolig-plan-step">
                          <label>
                            Arbeid {i + 1}
                            <input
                              maxLength={120}
                              value={s.title}
                              onChange={(e) =>
                                patch({
                                  steps: form.steps.map((v, j) =>
                                    j === i
                                      ? { ...v, title: e.target.value }
                                      : v,
                                  ),
                                })
                              }
                            />
                          </label>
                          <label>
                            Varighet {i + 1}
                            <input
                              type="number"
                              min="1"
                              max="366"
                              value={s.duration}
                              onChange={(e) =>
                                patch({
                                  steps: form.steps.map((v, j) =>
                                    j === i
                                      ? { ...v, duration: e.target.value }
                                      : v,
                                  ),
                                })
                              }
                            />
                          </label>
                          <label className="bolig-plan-check">
                            <input
                              type="checkbox"
                              checked={s.required}
                              onChange={(e) =>
                                patch({
                                  steps: form.steps.map((v, j) =>
                                    j === i
                                      ? { ...v, required: e.target.checked }
                                      : v,
                                  ),
                                })
                              }
                            />
                            Påkrevd
                          </label>
                          <button
                            type="button"
                            aria-label={`Fjern arbeid ${i + 1}`}
                            onClick={() =>
                              patch({
                                steps: form.steps.filter((_, j) => j !== i),
                              })
                            }
                          >
                            Fjern
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      disabled={form.steps.length >= 20}
                      onClick={() =>
                        patch({
                          steps: [
                            ...form.steps,
                            { title: "", duration: 1, required: true },
                          ],
                        })
                      }
                    >
                      Legg til eget arbeid
                    </button>
                    <p>
                      {selected.length * form.steps.length} nye aktiviteter.
                      Inntil 400 per lagring. Eksisterende aktiviteter beholdes.
                    </p>
                  </>
                ) : (
                  <p>
                    Alle åpne aktiviteter uten faktisk oppstart i utvalget
                    flyttes. Påbegynt og utført arbeid beholdes og telles i
                    forhåndsvisningen.
                  </p>
                )}
                <div className="bolig-plan-dialog-actions">
                  <button type="button" onClick={() => setOpen("")}>
                    Lukk og behold utkast
                  </button>
                  <button type="button" className="primary" onClick={preview}>
                    Forhåndsvis planen
                  </button>
                </div>
              </fieldset>
            ) : (
              currentPreview && (
                <>
                  <h3>Se over {currentPreview.items.length} aktiviteter</h3>
                  {currentPreview.skipped > 0 && (
                    <p>
                      {currentPreview.skipped} påbegynte eller utførte
                      aktiviteter beholdes uendret.
                    </p>
                  )}
                  {currentPreview.mode === "create" &&
                    data.tasks.some(
                      (t) => selected.includes(t.unit_id) && !t.archived,
                    ) && (
                      <p className="bolig-progress-paused">
                        Utvalget har allerede aktiviteter. Dette legger til nye
                        aktiviteter. Se etter dobbelt oppsett før du lagrer.
                      </p>
                    )}
                  {reviewInfo}
                  {rows(currentPreview.items)}
                  <div className="bolig-plan-dialog-actions">
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => setChecking(false)}
                    >
                      Tilbake til oppsett
                    </button>
                    <button
                      type="button"
                      className="primary"
                      disabled={
                        disabled || data.revision !== currentPreview.revision
                      }
                      onClick={() => save(currentPreview)}
                    >
                      Lagre {currentPreview.items.length} aktiviteter samlet
                    </button>
                  </div>
                </>
              )
            )}
            {draft.pending && (
              <p role="status">
                Lagringen er ikke bekreftet. Lukk vinduet og bruk «Prøv samme
                lagring igjen». Utkastet beholdes.
              </p>
            )}
          </div>
        </Dialog>
      )}
      {timeline && timelinePlan && (
        <Board
          key={`${timelineUnit}/${timelineAt}`}
          dateOnly
          plan={timelinePlan}
          meta={{
            title: `${root.title || "Boligprosjekt"} – samlet tidslinje`,
          }}
          readOnly={!writable}
          dirty={!!schedule?.items?.length}
          saving={disabled}
          loading={false}
          error={error}
          notice="Planlagte datoer. Dra for å flytte. Faktisk utførelse registreres på aktiviteten."
          stateKey={`bolig-plan/${context.user_id}/${context.company_id}/${root.id}/${unit?.id || "all"}/${timelineUnit}/${timelineAt}`}
          launchToken={launchToken}
          operations={[]}
          onPlanChange={changedPlan}
          onSave={() => {
            setOpen("timeline");
            setChecking(true);
          }}
          onDismiss={() => setTimeline(false)}
          onOpenActivity={(id) => {
            setTimeline(false);
            if (writable) onEdit(taskById.get(id));
            else setInspect(taskById.get(id));
          }}
          tools={
            <div className="bolig-plan-timeline-tools">
              <label>
                Vis bolig
                <select
                  aria-label="Vis bolig"
                  value={timelineUnit}
                  onChange={(e) => {
                    setTimelineUnit(e.target.value);
                    setTimelinePage(0);
                  }}
                >
                  <option value="">Alle valgte boliger</option>
                  {units
                    .filter((u) => !selected.length || selected.includes(u.id))
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.number} · {u.address}
                      </option>
                    ))}
                </select>
              </label>
              <p>
                {matchingTimeline.length} aktiviteter · Side {timelineAt + 1} av{" "}
                {timelinePages}. Søk i tidslinjen gjelder denne siden.
              </p>
              <button
                type="button"
                disabled={timelineAt === 0}
                onClick={() => setTimelinePage(timelineAt - 1)}
              >
                Forrige aktiviteter
              </button>
              <button
                type="button"
                disabled={timelineAt >= timelinePages - 1}
                onClick={() => setTimelinePage(timelineAt + 1)}
              >
                Neste aktiviteter
              </button>
            </div>
          }
        />
      )}
      {inspect && (
        <Dialog title="Aktivitet" onClose={() => setInspect(null)}>
          <div className="bolig-plan-dialog-body">
            <h3>
              {inspect.unit_number} · {inspect.title}
            </h3>
            <p>
              Planlagt: {date(inspect.planned_start)}–
              {date(inspect.planned_end)}
            </p>
            <p>Ansvarlig: {inspect.owner_name}</p>
            {inspect.actual_start && (
              <p>
                Faktisk: {date(inspect.actual_start)}–{date(inspect.actual_end)}
              </p>
            )}
            <button type="button" onClick={() => setInspect(null)}>
              Lukk
            </button>
          </div>
        </Dialog>
      )}
      {open === "timeline" && writable && schedule?.items?.length > 0 && (
        <Dialog
          title="Se over datoendringer"
          busy={saving}
          onClose={() => setOpen("")}
          className="bolig-plan-dialog"
        >
          <div className="bolig-plan-dialog-body">
            {serverError && (
              <p role="alert" className="bolig-error">
                {serverError}
              </p>
            )}
            {reviewInfo}
            {data.revision !== schedule.revision && (
              <p role="alert" className="bolig-error">
                Fremdriften er endret siden utkastet. Behold utkastet eller
                forkast datoendringene og start fra siste status.
              </p>
            )}
            {rows(schedule.items)}
            <div className="bolig-plan-dialog-actions">
              <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen("")}
              >
                Tilbake til tidslinjen
              </button>
              <button
                type="button"
                disabled={disabled}
                onClick={() => {
                  update({ schedule: null });
                  setOpen("");
                }}
              >
                Forkast datoendringer
              </button>
              <button
                type="button"
                disabled={disabled || schedule.revision !== data.revision}
                onClick={() => save(schedule)}
              >
                Lagre datoendringer
              </button>
            </div>
            {draft.pending && (
              <p>Lukk tidslinjen og prøv samme lagring igjen fra oversikten.</p>
            )}
          </div>
        </Dialog>
      )}
    </div>
  );
}
