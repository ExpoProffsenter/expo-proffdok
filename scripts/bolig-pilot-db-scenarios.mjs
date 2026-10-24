import fs from "node:fs/promises";
export default async function ({ db, call, actor, eq, firm, manager }) {
  await actor(manager);
  await db.query("select set_config('qa.pilot_company',$1,true)", [firm]);
  const sql = await fs.readFile("scripts/bolig-pilot-sandbox-seed.sql", "utf8");
  await db.exec(sql);
  const roots = (await call("list")).roots,
    root = roots.find((r) => r.reference === "QA-PILOT-40-20261023").id;
  const rec = await call("get", root);
  eq(rec.units.length, 40, "Pilot builds 40 real apartments");
  eq(rec.blocks.length, 2, "Two pilot buildings");
  const state = (
    await db.query("select public.bolig_prepare($1,$2) v", [firm, root])
  ).rows[0].v;
  eq(state.templates.length, 1, "Pilot reuses one saved room template");
  eq(
    state.unit_states.filter((s) => s.rooms > 0).length,
    40,
    "Template prepared all apartments",
  );
  const p = (
    await db.query("select public.bolig_progress($1,$2) v", [firm, root])
  ).rows[0].v;
  eq(
    p.tasks.length,
    161,
    "160 bulk activities plus one real restpoint follow-up",
  );
  eq(
    p.tasks.filter((t) => t.planned_start === "2026-10-28").length,
    78,
    "Parallel trades share a day, with one explicit individual exception",
  );
  const c = (
    await db.query("select public.bolig_coordination($1,$2) v", [firm, root])
  ).rows[0].v;
  eq(c.groups.length, 2, "Two explicit riser groups");
  eq(
    c.groups.every((g) => g.unit_ids.length === 5),
    true,
    "Risers select five apartment IDs each",
  );
  eq(
    c.inbox.length,
    1,
    "Only the enabled apartment receives a fictitious pending question",
  );
  const follow = p.tasks.find((t) => t.title === "DEMO – Etterjuster rosett"),
    unit = follow.unit_id;
  const d = (
    await db.query("select public.bolig_deliveries($1,$2,$3) v", [
      firm,
      root,
      unit,
    ])
  ).rows[0].v;
  eq(d.orders[0].status, "partial", "Pilot retains a partial receipt");
  eq(
    d.orders[0].snapshot.goods[1].quantity,
    1,
    "Proposed post-order change never rewrites supplier order",
  );
  const commerce = (
    await db.query("select public.bolig_commerce($1,$2,$3) v", [
      firm,
      root,
      unit,
    ])
  ).rows[0].v;
  eq(
    commerce.documents.some(
      (x) => x.kind === "choice" && x.status === "accepted",
    ),
    true,
    "Standard accepted through resident gateway",
  );
  eq(
    commerce.documents.some((x) => x.kind === "change" && x.status === "draft"),
    true,
    "Change after order remains an explicit proposal",
  );
  const h = (
    await db.query("select public.bolig_handover_review($1,$2,$3) v", [
      firm,
      root,
      unit,
    ])
  ).rows[0].v;
  eq(!!h.record, true, "Actual fictional handover is recorded");
  eq(
    h.cases.some((c) => c.category === "Restpunkt"),
    true,
    "Restpoint remains open after handover",
  );
  const links = (
    await db.query("select public.bolig_handover_followup($1,$2,$3) v", [
      firm,
      root,
      unit,
    ])
  ).rows[0].v;
  eq(
    links.links.length,
    1,
    "Restpoint is linked to ordinary progress activity",
  );
  const exp = (
    await db.query("select public.bolig_documentation_export($1,$2,$3) v", [
      firm,
      root,
      unit,
    ])
  ).rows[0].v;
  eq(
    exp.scopes
      .find((s) => s.id === unit)
      .handover_review.record.reference.includes("Fiktiv"),
    true,
    "Fictional handover appears in scoped documentation",
  );
  await db.exec(sql);
  eq(
    (await call("list")).roots.length,
    roots.length,
    "Rerunning pilot never resets or duplicates the project",
  );
}
