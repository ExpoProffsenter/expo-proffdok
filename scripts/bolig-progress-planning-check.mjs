import assert from "node:assert/strict";
import {
  buildBulkPlan,
  buildShiftPlan,
  shiftPlanDate,
  boligTimelinePlan,
  timelineDates,
} from "../src/modules/bolig/boligProgressPlanning.mjs";
let count = 0;
const eq = (a, b) => {
  assert.deepEqual(a, b);
  count++;
};
const bad = (f) => {
  assert.throws(f);
  count++;
};
const units = [
  { id: "b", number: "H0201", address: "A", floor: 2 },
  { id: "a", number: "H0101", address: "A", floor: 1 },
];
let n = 0;
const config = {
  units,
  selected: ["a", "b"],
  start: "2026-10-23",
  cadence: 2,
  weekdays: true,
  owner: "owner",
  steps: [
    { title: "Riving", duration: 2, required: true },
    { title: "Montering", duration: 3, required: true },
  ],
};
const plan = buildBulkPlan(config, () => String(++n));
eq(
  plan.map((t) => [t.unit_id, t.planned_start, t.planned_end]),
  [
    ["a", "2026-10-23", "2026-10-26"],
    ["a", "2026-10-27", "2026-10-29"],
    ["b", "2026-10-27", "2026-10-28"],
    ["b", "2026-10-29", "2026-11-02"],
  ],
);
eq(
  plan.map((t) => t.predecessor_id),
  ["", "1", "", "3"],
);
eq(
  buildBulkPlan({ ...config, cadence: 0 }, () => String(++n))[2].planned_start,
  "2026-10-23",
);
eq(shiftPlanDate("2026-10-26", -1, true), "2026-10-23");
eq(shiftPlanDate("2026-10-24", 0, true), "2026-10-26");
eq(shiftPlanDate("2026-10-25", 1, false), "2026-10-26");
eq(shiftPlanDate("2028-02-28", 1, false), "2028-02-29");
for (const patch of [
  { selected: [] },
  { cadence: 1.5 },
  { start: "2026-02-30" },
  { steps: [] },
  { steps: [{ title: "X", duration: 2 }] },
  { steps: [{ title: "Test", duration: 0 }] },
  { owner: "" },
])
  bad(() => buildBulkPlan({ ...config, ...patch }));
bad(() =>
  buildBulkPlan({
    ...config,
    units: Array.from({ length: 401 }, (_, i) => ({
      id: String(i),
      number: String(i),
    })),
    selected: Array.from({ length: 401 }, (_, i) => String(i)),
  }),
);
const tasks = plan.map((t) => ({
  ...t,
  active: true,
  status: "planned",
  unit_number: t.unit_id,
  owner_name: "Owner",
}));
tasks[0].status = "done";
tasks[0].actual_start = "2026-10-22";
tasks[0].actual_end = "2026-10-22";
const shifted = buildShiftPlan(tasks, ["a", "b"], 2, true);
eq(shifted.skipped, 1);
eq(shifted.items.length, 3);
eq(shifted.items[0].planned_start, "2026-10-29");
bad(() => buildShiftPlan(tasks, ["a"], 0));
const projection = boligTimelinePlan(tasks);
eq(timelineDates(projection, tasks), []);
projection.activities[1].sessions.forEach(
  (s) => (s.date = shiftPlanDate(s.date, 1)),
);
eq(timelineDates(projection, tasks).length, 1);
projection.activities[0].sessions.forEach(
  (s) => (s.date = shiftPlanDate(s.date, 1)),
);
bad(() => timelineDates(projection, tasks));
console.log(
  `PASS bolig planning: ${count} date/cadence/template/exception assertions`,
);
