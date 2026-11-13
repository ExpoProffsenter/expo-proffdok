import {progressDate as displayDate} from "./boligProgressClient.js";
import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  dayNumber,
  shiftDay,
  shortDate,
  todayOslo,
  nextAnchor,
} from "../kshms/kshmsProgressTimeline.mjs";
import { createPortal } from "react-dom";
import { boligGanttRange } from "./boligGanttRange.mjs";
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
  initiallyCollapsed = false,
}) {
  const [tip, setTip] = useState(null);
  const hideTipTimer = useRef(null);
  const hideTip = () => { clearTimeout(hideTipTimer.current); setTip(null); };
  const deferHideTip = () => { hideTipTimer.current = setTimeout(() => setTip(null), 120); };
  const showTip = (event, task) => {
    clearTimeout(hideTipTimer.current);
    const node = event.currentTarget, rect = node.getBoundingClientRect();
    setTip({ task, target: node.closest('dialog') || document.body,
      left: Math.max(8, Math.min(rect.left, window.innerWidth - 328)),
      top: rect.top > 160 ? rect.top - 8 : rect.bottom + 8,
      above: rect.top > 160 });
  };
  useEffect(() => {
    const escape = event => { if (event.key === 'Escape') setTip(null); };
    const clear = () => setTip(null);
    window.addEventListener('scroll', clear, true);
    window.addEventListener('resize', clear);
    window.addEventListener('keydown', escape);
    return () => { clearTimeout(hideTipTimer.current); window.removeEventListener('scroll', clear, true); window.removeEventListener('resize', clear); window.removeEventListener('keydown', escape); };
  }, []);
  const key = `${root.id}:${unit?.id || "all"}:gantt`;
  const [view, setView] = useBoligUiState(context, `${key}:view-fit-v2`, "all"),
    [anchor, setAnchor] = useBoligUiState(
      context,
      `${key}:date`,
      tasks[0]?.planned_start || todayOslo(),
    ),
    [groupBy, setGroupBy] = useBoligUiState(context, `${key}:group`, "unit"),
    [closed, setClosed] = useBoligUiState(
      context,
      `${key}:closed`,
      initiallyCollapsed
        ? Object.fromEntries(tasks.map((t) => [`unit/${t.unit_id}`, true]))
        : {},
    ),
    [query, setQuery] = useBoligUiState(context, `${key}:query`, ""),
    [onlyGroup, setOnlyGroup] = useBoligUiState(
      context,
      `${key}:only-group`,
      "",
    );
  const [limit, setLimit] = useState(120),
    [drag, setDrag] = useState(null),
    [error, setError] = useState("");
  const dragRef = useRef(null);
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
  const range = boligGanttRange(matching, anchor, view), days = range.to - range.from + 1;
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
    if (readOnly || disabled || view === "all") return;
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
      view === "all" ||
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
            disabled={view === "all"}
            onClick={() => setAnchor(nextAnchor(anchor, view, -1))}
            aria-label="Forrige periode"
          >
            ←
          </button>
          <button type="button" onClick={() => {setView("week");setAnchor(todayOslo());}}>
            I dag
          </button>
          <button
            type="button"
            disabled={view === "all"}
            onClick={() => setAnchor(nextAnchor(anchor, view, 1))}
            aria-label="Neste periode"
          >
            →
          </button>
          <button
            type="button"
            onClick={() => setView("all")}
          >
            Vis hele planen
          </button>
        </div>
      </div>
      <div className="bolig-gantt-filters">
        <label>
          Visning
          <select
            aria-label="Visning"
            value={view}
            onChange={(e) => {if(view === "all")setAnchor(range.dates[0]);setView(e.target.value);}}
          >
            <option value="all">Hele planen</option>
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
            {!!groups.length && <option value="group">Stammegruppe</option>}
            <option value="activity">Arbeid / fag</option>
          </select>
        </label>
        {!!groups.length && (
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
        )}
        <label>
          Søk i Gantt
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              readOnly
                ? "Bolig, adresse eller aktivitet"
                : "Bolig, aktivitet eller ansvarlig"
            }
          />
        </label>
        <label>
          Dato
          <input
            type="date"
            value={view === "all" ? range.dates[0] : anchor}
            onChange={(e) => {if(e.target.value){setView("week");setAnchor(e.target.value);}}}
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
        {displayDate(range.dates[0])} – {displayDate(range.dates.at(-1))} · {matching.length} aktiviteter. Trykk en stolpe
        for detaljer.{view === "all" ? " Hele perioden til aktivitetene i utvalget vises. Velg dag, uke eller måned for å flytte datoer." : !readOnly && " Dra for å flytte; endene endrer varighet."}
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
              style={{ gridTemplateColumns: range.columns.map(c=>`${c.days}fr`).join(" ") }}
            >
              {range.columns.map((c) => (
                <span key={c.date} className={c.date === todayOslo() ? "today" : ""}>
                  {c.label || shortDate(c.date)}
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
                    {r.label}{" "}
                    <small>{displayDate(r.task.planned_start)} – {displayDate(r.task.planned_end)}</small>
                    <small>{r.task.owner_name}</small>
                  </button>
                )}
              </div>
              <div
                className="bolig-gantt-track"
                style={{ backgroundSize: `${100 / days}% 100%`, backgroundImage: view === "all" && days > 32 ? "none" : undefined }}
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
                            style={{ left: `${g.left}%`, width: `${g.width}%`, minWidth: view === "all" ? 4 : undefined, maxWidth: `${100-g.left}%` }}
                            aria-label={`${t.unit_number} · ${t.title} · ${displayDate(t.planned_start)} til ${displayDate(t.planned_end)}`}
                            aria-describedby={tip?.task.id === t.id ? `bolig-gantt-tip-${t.id}` : undefined}
                            onMouseEnter={event => showTip(event, t)}
                            onMouseLeave={deferHideTip}
                            onFocus={event => showTip(event, t)}
                            onBlur={hideTip}
                            onClick={(e) => {
                              hideTip();
                              if (
                                !disabled &&
                                (readOnly || view === "all" ||
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
                            onPointerDown={(e) => { hideTip(); begin(e, r.task, "move"); }}
                            onPointerMove={pointerMove}
                            onPointerUp={finish}
                            onPointerCancel={() => {
                              dragRef.current = null;
                              setDrag(null);
                            }}
                          >
                            <span
                              className="bolig-gantt-handle"
                              hidden={view === "all"}
                              aria-hidden="true"
                              onPointerDown={(e) => begin(e, r.task, "start")}
                            />
                            <span>{t.title}</span>
                            <span
                              className="bolig-gantt-handle"
                              hidden={view === "all"}
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
              Ingen aktiviteter i utvalget.
              {!readOnly &&
                " Velg «Planlegg flere boliger» for å lage en plan."}
            </p>
          )}
        </div>
      </div>
      {rows.length > limit && (
        <button type="button" onClick={() => setLimit((n) => n + 120)}>
          Vis flere rader ({rows.length - limit} gjenstår)
        </button>
      )}
      {tip && createPortal(<div role="tooltip" id={`bolig-gantt-tip-${tip.task.id}`}
        className="bolig-gantt-tooltip" style={{left:tip.left,top:tip.top,transform:tip.above?'translateY(-100%)':undefined}}
        onMouseEnter={() => clearTimeout(hideTipTimer.current)} onMouseLeave={deferHideTip}>
        <strong>{tip.task.title}</strong>
        <div>Bolig {tip.task.unit_number} · {tip.task.address || 'Adresse ikke oppgitt'}</div>
        <div>{displayDate(tip.task.planned_start)} – {displayDate(tip.task.planned_end)}</div>
        {tip.task.owner_name && <div>Ansvarlig: {tip.task.owner_name}</div>}
        <small>Trykk for å åpne aktiviteten.</small>
      </div>, tip.target)}
    </section>
  );
}
