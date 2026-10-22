import {
  dayNumber,
  dayString,
  shiftDay,
} from "../kshms/kshmsProgressTimeline.mjs";
export const MAX_PLAN_BATCH = 400;
export const orderedUnits = (units) =>
  [...units].sort(
    (a, b) =>
      `${a.block_name || ""}\0${a.address || ""}`.localeCompare(
        `${b.block_name || ""}\0${b.address || ""}`,
        "nb",
        { numeric: true },
      ) ||
      (a.floor || 0) - (b.floor || 0) ||
      (a.position || 0) - (b.position || 0) ||
      a.number.localeCompare(b.number, "nb", { numeric: true }),
  );
const integer = (v, min, max, label) => {
  const n = Number(v);
  if (!Number.isInteger(n) || n < min || n > max)
    throw Error(`${label}: velg et helt tall fra ${min} til ${max}.`);
  return n;
};
export function shiftPlanDate(value, delta, weekdays = false) {
  dayNumber(value);
  let date = value;
  if (!weekdays) return shiftDay(date, delta);
  const weekend = (d) =>
    [0, 6].includes(new Date(dayNumber(d) * 86400000).getUTCDay());
  if (!delta) {
    while (weekend(date)) date = shiftDay(date, 1);
    return date;
  }
  for (let i = 0; i < Math.abs(delta); i++) {
    do {
      date = shiftDay(date, Math.sign(delta));
    } while (weekend(date));
  }
  return date;
}
export function buildBulkPlan(
  { units, selected, start, cadence, weekdays, steps, owner },
  idFactory = () => crypto.randomUUID(),
) {
  const chosen = orderedUnits(units).filter((u) => selected.includes(u.id));
  if (!chosen.length) throw Error("Velg minst én bolig.");
  if (!steps.length || steps.length > 20)
    throw Error("Velg fra 1 til 20 aktiviteter i malen.");
  if (chosen.length * steps.length > MAX_PLAN_BATCH)
    throw Error(
      "Velg færre boliger eller aktiviteter. Du kan lagre inntil 400 aktiviteter samlet.",
    );
  if (!owner) throw Error("Velg en ansvarlig.");
  const takt = integer(cadence, 0, 365, "Takt");
  const first = shiftPlanDate(start, 0, weekdays);
  const normalized = steps.map((s) => {
    const title = s.title.trim();
    if (title.length < 2 || title.length > 120)
      throw Error("Aktivitetens navn må ha fra 2 til 120 tegn.");
    return { ...s, title, duration: integer(s.duration, 1, 366, "Varighet") };
  });
  return chosen.flatMap((u, index) => {
    let cursor = shiftPlanDate(first, index * takt, weekdays),
      previous = "";
    return normalized.map((s) => {
      const id = idFactory(),
        end = shiftPlanDate(cursor, s.duration - 1, weekdays);
      const item = {
        id,
        unit_id: u.id,
        title: s.title,
        owner_id: owner,
        planned_start: cursor,
        planned_end: end,
        required: s.required !== false,
        predecessor_id: previous,
      };
      previous = id;
      cursor = shiftPlanDate(end, 1, weekdays);
      return item;
    });
  });
}
export function buildShiftPlan(tasks, selected, delta, weekdays = false) {
  const days = integer(delta, -365, 365, "Forskyvning");
  if (!days) throw Error("Velg hvor mange dager planen skal flyttes.");
  const selectedTasks = tasks.filter(
    (t) => selected.includes(t.unit_id) && !t.archived && t.active,
  );
  const eligible = selectedTasks.filter(
    (t) =>
      !t.actual_start &&
      !t.actual_end &&
      ["planned", "blocked"].includes(t.status),
  );
  if (!eligible.length)
    throw Error(
      "Ingen aktiviteter kan flyttes. Påbegynt og utført arbeid avklares enkeltvis.",
    );
  if (eligible.length > MAX_PLAN_BATCH)
    throw Error(
      "Velg færre boliger. Du kan flytte inntil 400 aktiviteter samlet.",
    );
  return {
    items: eligible.map((t) => ({
      id: t.id,
      planned_start: shiftPlanDate(t.planned_start, days, weekdays),
      planned_end: shiftPlanDate(t.planned_end, days, weekdays),
    })),
    skipped: selectedTasks.length - eligible.length,
  };
}
const statuses = {
  planned: "Ikke startet",
  working: "Pågår",
  blocked: "Avventer",
  done: "Ferdig",
};
// A projection only. Bolig tasks remain authoritative; no project/KS plan is copied.
export function boligTimelinePlan(tasks) {
  return {
    version: 1,
    excludeSundays: false,
    activities: tasks
      .filter((t) => !t.archived && t.active)
      .map((t) => ({
        id: t.id,
        title: `${t.unit_number} · ${t.title}`,
        trade: t.address || "",
        resource: t.owner_name || "",
        status: statuses[t.status],
        sessions: Array.from(
          { length: dayNumber(t.planned_end) - dayNumber(t.planned_start) + 1 },
          (_, n) => ({
            id: `${t.id}-${n}`,
            date: dayString(dayNumber(t.planned_start) + n),
            startTime: "08:00",
            endTime: "16:00",
            note: "",
          }),
        ),
      })),
  };
}
export function timelineDates(plan, tasks) {
  const items = [];
  for (const a of plan.activities) {
    const task = tasks.find((t) => t.id === a.id);
    if (!task) throw Error("Aktiviteten er endret. Hent siste status.");
    const dates = a.sessions.map((s) => s.date).sort();
    if (!dates.length)
      throw Error("Aktiviteten må ha planlagt start og slutt.");
    if (dates[0] === task.planned_start && dates.at(-1) === task.planned_end)
      continue;
    if (
      task.actual_start ||
      task.actual_end ||
      !["planned", "blocked"].includes(task.status)
    )
      throw Error("Påbegynt eller utført arbeid må avklares enkeltvis.");
    items.push({
      id: a.id,
      planned_start: dates[0],
      planned_end: dates.at(-1),
    });
  }
  if (items.length > MAX_PLAN_BATCH)
    throw Error("Lagre høyst 400 datoendringer samlet.");
  return items;
}
