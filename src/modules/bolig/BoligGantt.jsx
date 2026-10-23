import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  calendarWindow,
  dayNumber,
  shiftDay,
  shortDate,
  todayOslo,
  nextAnchor,
} from "../kshms/kshmsProgressTimeline.mjs";
import { useBoligUiState } from "./boligUiState.js";
export default function BoligGantt({
  tasks,
  groups = [],
  context,
  root,
  unit,
  onEdit,
  onChange,
  disabled,
  readOnly,
  onSave,
  dirty,
}) {
  const key = `${root.id}:${unit?.id || "all"}:gantt`;
  const [view, setView] = useBoligUiState(context, `${key}:view`, "week"),
    [anchor, setAnchor] = useBoligUiState(
      context,
      `${key}:date`,
      tasks[0]?.planned_start || todayOslo(),
    ),
    [groupBy, setGroupBy] = useBoligUiState(context, `${key}:group`, "unit"),
    [closed, setClosed] = useBoligUiState(context, `${key}:closed`, {}),
    [query, setQuery] = useState(""),
    [onlyGroup, setOnlyGroup] = useState("");
  const [limit, setLimit] = useState(120),
    [drag, setDrag] = useState(null),
    [error, setError] = useState("");
  const dragRef = useRef(null);
  const range = calendarWindow(anchor, view),
    days = range.dates.length;
  const unitGroups = useMemo(
    () => new Map(groups.flatMap((g) => g.unit_ids.map((id) => [id, g]))),
    [groups],
  );
  const matching = tasks.filter(
    (t) =>
      t.active &&
      !t.archived &&
      (!onlyGroup || unitGroups.get(t.unit_id)?.id === onlyGroup) &&
      `${t.title} ${t.unit_number} ${t.owner_name || ""} ${t.address || ""}`
        .toLocaleLowerCase("nb")
        .includes(query.toLocaleLowerCase("nb")),
  );
  const buckets = new Map();
  for (const t of matching) {
    const group = unitGroups.get(t.unit_id);
    const id =
      groupBy === "group"
        ? group?.id || "ungrouped"
        : groupBy === "activity"
          ? t.title
          : t.unit_id;
    const label =
      groupBy === "group"
        ? group?.name || "Uten stammegruppe"
        : groupBy === "activity"
          ? t.title
          : `${t.unit_number} · ${t.address || ""}`;
    if (!buckets.has(id))
      buckets.set(id, {
        id,
        label,
        address: t.address || "",
        unit_number: t.unit_number || "",
        tasks: [],
      });
    buckets.get(id).tasks.push(t);
  }
  const rows = [];
  const compare = (a, b) =>
    String(a).localeCompare(String(b), "nb", {
      numeric: true,
      sensitivity: "base",
    });
  const orderedBuckets = [...buckets.values()].sort((a, b) =>
    groupBy === "unit"
      ? compare(a.address, b.address) ||
        compare(a.unit_number, b.unit_number) ||
        compare(a.id, b.id)
      : compare(a.label, b.label) || compare(a.id, b.id),
  );
  for (const b of orderedBuckets) {
    rows.push({ ...b, summary: true });
    if (!closed[`${groupBy}/${b.id}`])
      for (const t of b.tasks)
        rows.push({
          id: t.id,
          task: t,
          label:
            groupBy === "activity"
              ? `${t.unit_number} · ${t.address || ""}`
              : groupBy === "group"
                ? `${t.unit_number} · ${t.title}`
                : t.title,
        });
  }
  useEffect(() => {
    setLimit(120);
  }, [query, onlyGroup, groupBy]);
  useEffect(() => {
    const cancel = () => {
      dragRef.current = null;
      setDrag(null);
    };
    const key = (e) => {
      if (e.key === "Escape") cancel();
    };
    window.addEventListener("blur", cancel);
    window.addEventListener("keydown", key);
    document.addEventListener("visibilitychange", cancel);
    return () => {
      window.removeEventListener("blur", cancel);
      window.removeEventListener("keydown", key);
      document.removeEventListener("visibilitychange", cancel);
    };
  }, []);
  const geometry = (t) => {
    const start = dayNumber(t.planned_start),
      end = dayNumber(t.planned_end);
    return {
      left: Math.max(0, ((start - range.from) / days) * 100),
      width: Math.max(
        0,
        ((Math.min(end, range.to) - Math.max(start, range.from) + 1) / days) *
          100,
      ),
      hidden: end < range.from || start > range.to,
    };
  };
  const move = (t, delta, mode = "move") => {
    if (readOnly || disabled) return;
    try {
      const next = {
        ...t,
        planned_start:
          mode === "end" ? t.planned_start : shiftDay(t.planned_start, delta),
        planned_end:
          mode === "start" ? t.planned_end : shiftDay(t.planned_end, delta),
      };
      if (next.planned_end < next.planned_start)
        throw Error("Slutt kan ikke være før start.");
      onChange(next);
      setError("");
    } catch (e) {
      setError(e.message);
    }
  };
  const begin = (e, t, mode) => {
    if (
      disabled ||
      readOnly ||
      e.button !== 0 ||
      t.actual_start ||
      t.actual_end ||
      !["planned", "blocked"].includes(t.status)
    )
      return;
    e.preventDefault();
    e.stopPropagation();
    const value = {
      task: t,
      mode,
      start: e.clientX,
      width: e.currentTarget
        .closest(".bolig-gantt-track")
        .getBoundingClientRect().width,
      delta: 0,
    };
    dragRef.current = value;
    setDrag(value);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const pointerMove = (e) => {
    const d = dragRef.current;
    if (!d) return;
    const next = {
      ...d,
      delta: Math.round(((e.clientX - d.start) / d.width) * days),
    };
    dragRef.current = next;
    setDrag(next);
  };
  const finish = () => {
    const d = dragRef.current;
    dragRef.current = null;
    setDrag(null);
    if (!d) return;
    if (d.delta) move(d.task, d.delta, d.mode);
    else onEdit(d.task);
  };
  return (
    <section className="bolig-gantt" aria-label="Samlet Gantt-skjema">
      <div className="bolig-gantt-heading">
        <div>
          <small>ÉN PLAN · ALLE BOLIGER</small>
          <h4>Samlet fremdriftsplan</h4>
        </div>
        <div className="bolig-plan-launchers">
          <button
            type="button"
            onClick={() => setAnchor(nextAnchor(anchor, view, -1))}
            aria-label="Forrige periode"
          >
            ←
          </button>
          <button type="button" onClick={() => setAnchor(todayOslo())}>
            I dag
          </button>
          <button
            type="button"
            onClick={() => setAnchor(nextAnchor(anchor, view, 1))}
            aria-label="Neste periode"
          >
            →
          </button>
          <button
            type="button"
            onClick={() =>
              setAnchor(
                [...tasks].sort((a, b) =>
                  a.planned_start.localeCompare(b.planned_start),
                )[0]?.planned_start || todayOslo(),
              )
            }
          >
            Vis første arbeid
          </button>
        </div>
      </div>
      <div className="bolig-gantt-filters">
        <label>
          Visning
          <select
            aria-label="Visning"
            value={view}
            onChange={(e) => setView(e.target.value)}
          >
            <option value="day">Dag</option>
            <option value="week">Uke</option>
            <option value="month">Måned</option>
          </select>
        </label>
        <label>
          Grupper etter
          <select
            aria-label="Grupper etter"
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
          >
            <option value="unit">Leilighet</option>
            <option value="group">Stammegruppe</option>
            <option value="activity">Arbeid / fag</option>
          </select>
        </label>
        <label>
          Stammegruppe
          <select
            aria-label="Stammegruppe"
            value={onlyGroup}
            onChange={(e) => setOnlyGroup(e.target.value)}
          >
            <option value="">Alle grupper</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Søk i Gantt
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Bolig, aktivitet eller ansvarlig"
          />
        </label>
        <label>
          Dato
          <input
            type="date"
            value={anchor}
            onChange={(e) => e.target.value && setAnchor(e.target.value)}
          />
        </label>
      </div>
      <div className="bolig-plan-launchers">
        <button
          type="button"
          onClick={() =>
            setClosed(
              Object.fromEntries(
                [...buckets.keys()].map((id) => [`${groupBy}/${id}`, true]),
              ),
            )
          }
        >
          Fold sammen alle
        </button>
        <button type="button" onClick={() => setClosed({})}>
          Vis alle aktiviteter
        </button>
        {!readOnly && (
          <button type="button" disabled={disabled || !dirty} onClick={onSave}>
            {dirty ? "Se over datoendringer" : "Datoer er lagret"}
          </button>
        )}
      </div>
      <p>
        {shortDate(range.dates[0])}–{shortDate(range.dates.at(-1))}{" "}
        {anchor.slice(0, 4)} · {matching.length} aktiviteter. Trykk en stolpe
        for detaljer. Dra for å flytte; endene endrer varighet.
      </p>
      {error && <p role="alert">{error}</p>}
      <div className="bolig-gantt-scroll">
        <div
          className="bolig-gantt-grid"
          style={{ minWidth: view === "month" ? 1180 : 700 }}
        >
          <div className="bolig-gantt-row bolig-gantt-calendar">
            <strong>Bolig / arbeid</strong>
            <div
              className="bolig-gantt-days"
              style={{ gridTemplateColumns: `repeat(${days},1fr)` }}
            >
              {range.dates.map((d) => (
                <span key={d} className={d === todayOslo() ? "today" : ""}>
                  {shortDate(d)}
                </span>
              ))}
            </div>
          </div>
          {rows.slice(0, limit).map((r) => (
            <div
              key={`${r.summary ? "group" : "task"}/${r.id}`}
              className={`bolig-gantt-row ${r.summary ? "summary" : ""}`}
            >
              <div className="bolig-gantt-label">
                {r.summary ? (
                  <button
                    type="button"
                    aria-expanded={!closed[`${groupBy}/${r.id}`]}
                    onClick={() =>
                      setClosed({
                        ...closed,
                        [`${groupBy}/${r.id}`]: !closed[`${groupBy}/${r.id}`],
                      })
                    }
                  >
                    {closed[`${groupBy}/${r.id}`] ? "▸" : "▾"} {r.label}{" "}
                    <small>{r.tasks.length} aktiviteter</small>
                  </button>
                ) : (
                  <button type="button" onClick={() => onEdit(r.task)}>
                    {r.label}
                    <small>{r.task.owner_name}</small>
                  </button>
                )}
              </div>
              <div
                className="bolig-gantt-track"
                style={{ backgroundSize: `${100 / days}% 100%` }}
              >
                {r.summary
                  ? r.tasks.map((t, i) => {
                      const g = geometry(t);
                      return (
                        !g.hidden && (
                          <span
                            key={t.id}
                            className={`bolig-gantt-summary ${t.status}`}
                            style={{
                              left: `${g.left}%`,
                              width: `${g.width}%`,
                              top: 8 + (i % 3) * 7,
                            }}
                          />
                        )
                      );
                    })
                  : (() => {
                      const t =
                          drag?.task.id === r.task.id
                            ? {
                                ...r.task,
                                planned_start:
                                  drag.mode === "end"
                                    ? r.task.planned_start
                                    : shiftDay(
                                        r.task.planned_start,
                                        drag.delta,
                                      ),
                                planned_end:
                                  drag.mode === "start"
                                    ? r.task.planned_end
                                    : shiftDay(r.task.planned_end, drag.delta),
                              }
                            : r.task,
                        g = geometry(t);
                      return (
                        !g.hidden && (
                          <div
                            role="button"
                            tabIndex={0}
                            className={`bolig-gantt-bar ${t.status}`}
                            style={{ left: `${g.left}%`, width: `${g.width}%` }}
                            aria-label={`${t.unit_number} · ${t.title} · ${t.planned_start} til ${t.planned_end}`}
                            onClick={(e) => {
                              if (
                                !disabled &&
                                (readOnly ||
                                  r.task.actual_start ||
                                  r.task.actual_end ||
                                  !["planned", "blocked"].includes(
                                    r.task.status,
                                  ))
                              )
                                onEdit(r.task);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                onEdit(r.task);
                              } else if (
                                !r.task.actual_start &&
                                !r.task.actual_end &&
                                ["planned", "blocked"].includes(
                                  r.task.status,
                                ) &&
                                e.altKey &&
                                ["ArrowLeft", "ArrowRight"].includes(e.key)
                              ) {
                                e.preventDefault();
                                move(
                                  r.task,
                                  e.key === "ArrowLeft" ? -1 : 1,
                                  e.shiftKey ? "end" : "move",
                                );
                              }
                            }}
                            onPointerDown={(e) => begin(e, r.task, "move")}
                            onPointerMove={pointerMove}
                            onPointerUp={finish}
                            onPointerCancel={() => {
                              dragRef.current = null;
                              setDrag(null);
                            }}
                          >
                            <span
                              className="bolig-gantt-handle"
                              aria-hidden="true"
                              onPointerDown={(e) => begin(e, r.task, "start")}
                            />
                            <span>{t.title}</span>
                            <span
                              className="bolig-gantt-handle"
                              aria-hidden="true"
                              onPointerDown={(e) => begin(e, r.task, "end")}
                            />
                          </div>
                        )
                      );
                    })()}
              </div>
            </div>
          ))}
          {!matching.length && (
            <p>
              Ingen aktiviteter i utvalget. Velg «Planlegg flere boliger» for å
              lage en plan.
            </p>
          )}
        </div>
      </div>
      {rows.length > limit && (
        <button type="button" onClick={() => setLimit((n) => n + 120)}>
          Vis flere rader ({rows.length - limit} gjenstår)
        </button>
      )}
    </section>
  );
}
