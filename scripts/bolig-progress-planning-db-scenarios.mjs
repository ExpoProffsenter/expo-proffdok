import fs from "node:fs/promises";
export default async function scenarios({
  db,
  call,
  actor,
  eq,
  rejects,
  id,
  firm,
  other,
  manager,
  reader,
  outsider,
}) {
  await db.exec("reset role");
  await db.exec(
    await fs.readFile(
      "supabase/migrations/20261022231401_bolig_progress_bulk_planning.sql",
      "utf8",
    ),
  );
  await db.exec(
    await fs.readFile(
      "supabase/migrations/20261022232949_bolig_progress_gateway_invoker.sql",
      "utf8",
    ),
  );
  eq(
    (
      await db.query(
        "select prosecdef from pg_proc where oid='public.bolig_progress(uuid,uuid,uuid,text,jsonb)'::regprocedure",
      )
    ).rows[0].prosecdef,
    false,
    "Public gateway retains invoker semantics",
  );
  await actor(manager);
  const rec = await call("create_plan", null, null, {
    request_id: id(61000),
    title: "QA masseplan",
    reference: "QA-BULK",
    buildings: [
      {
        name: "Massebygg",
        building_type: "apartment",
        address: "Taktveien 1",
        house_floors: 5,
        entrances: [{ address: "Taktveien 1", counts: [20, 20, 20, 20, 20] }],
      },
    ],
  });
  const root = rec.root.id,
    units = rec.units;
  let seq = 62000,
    revision = 0;
  const rpc = async (
    action = "get",
    payload = {},
    unit = null,
    company = firm,
  ) =>
    (
      await db.query("select public.bolig_progress($1,$2,$3,$4,$5) v", [
        company,
        root,
        unit,
        action,
        payload,
      ])
    ).rows[0].v;
  let s = await rpc();
  eq(
    s.units.length,
    100,
    "100 units available from project, no per-unit visit",
  );
  eq(
    s.units.every(
      (u) => u.block_name === "Massebygg" && u.floor > 0 && u.entrance_id,
    ),
    true,
    "Grouped selection projection",
  );
  const items = units.flatMap((u, i) =>
    Array.from({ length: 4 }, (_, j) => ({
      id: id(seq++),
      unit_id: u.id,
      title: "Arbeid " + (j + 1),
      owner_id: manager,
      planned_start: `2026-11-${String(2 + j).padStart(2, "0")}`,
      planned_end: `2026-11-${String(2 + j).padStart(2, "0")}`,
      required: true,
      predecessor_id: j ? id(seq - 2) : "",
    })),
  );
  const attempt = {
    mode: "create",
    reviewed: true,
    request_id: id(seq++),
    revision,
    items,
  };
  s = await rpc("batch", attempt);
  revision = s.revision;
  eq(s.tasks.length, 400, "100 apartments × 4 activities saved atomically");
  eq(revision, 1, "One batch revision");
  eq(
    s.tasks.every(
      (t) => t.status === "planned" && !t.actual_start && !t.actual_end,
    ),
    true,
    "Planning never fabricates execution",
  );
  eq((await rpc("batch", attempt)).revision, 1, "Lost response exact replay");
  eq((await rpc()).tasks.length, 400, "Replay creates no duplicates");
  await rejects(
    () => rpc("batch", { ...attempt, items: items.slice(0, 1) }),
    "PT409",
  );
  await rejects(
    () => rpc("batch", { ...attempt, request_id: id(seq++) }),
    "PT409",
  );
  await actor(reader);
  await rejects(
    () => rpc("batch", { ...attempt, request_id: id(seq++), revision }),
    "42501",
  );
  await actor(outsider);
  await rejects(() => rpc(), "42501");
  await actor(manager);
  const unitView = await rpc("get", {}, units[0].id);
  eq(
    unitView.history[0].snapshot.tasks.length,
    4,
    "Unit history includes its batch activities",
  );
  eq(
    unitView.history[0].snapshot.tasks.every((t) => t.unit_id === units[0].id),
    true,
    "Unit history excludes neighbor snapshots",
  );
  await db.exec("reset role");
  await db.query(
    "update bolig_private.units set contact_name='QA masseplan',contact_email='qa-bulk@example.invalid' where id=$1",
    [units[0].id],
  );
  const completionBefore = (
    await db.query("select bolig_private.completion_source($1,$2,$3) s", [
      firm,
      root,
      units[0].id,
    ])
  ).rows[0].s;
  eq(
    completionBefore.issues.filter((i) => i.startsWith("Fremdrift:")).length,
    4,
    "Bulk required activities block completion",
  );
  await actor(manager);
  const nid = id(seq++),
    today = (
      await db.query("select (now() at time zone 'Europe/Oslo')::date::text d")
    ).rows[0].d;
  s = await rpc("notice", {
    id: nid,
    task_id: items[0].id,
    body: "Gjennomgått plan",
    publish_on: today,
    revision,
    request_id: id(seq++),
  });
  revision = s.revision;
  s = await rpc("approve", {
    id: nid,
    basis: s.notices[0].basis,
    reviewed: true,
    revision,
    request_id: id(seq++),
  });
  revision = s.revision;
  eq(s.notices[0].valid, true, "Notice approved before bulk shift");
  const first = items.slice(0, 4);
  const change = {
    mode: "dates",
    reviewed: true,
    revision,
    request_id: id(seq++),
    items: first.map((i, j) => ({
      id: i.id,
      planned_start: `2026-11-${12 + j}`,
      planned_end: `2026-11-${12 + j}`,
    })),
  };
  s = await rpc("batch", change);
  revision = s.revision;
  eq(
    s.notices[0].current,
    false,
    "Bulk shift invalidates prior resident approval",
  );
  eq(s.notices[0].valid, false, "Bulk shift cannot publish stale notice");
  await db.exec("reset role");
  const completionAfter = (
    await db.query("select bolig_private.completion_source($1,$2,$3) s", [
      firm,
      root,
      units[0].id,
    ])
  ).rows[0].s;
  eq(
    completionAfter.basis !== completionBefore.basis,
    true,
    "Bulk changes invalidate previous completion basis",
  );
  await actor(manager);
  eq(
    s.tasks
      .filter((t) => first.some((i) => i.id === t.id))
      .map((t) => t.planned_start)
      .sort(),
    ["2026-11-12", "2026-11-13", "2026-11-14", "2026-11-15"],
    "Entire dependency chain shifts against final dates",
  );
  const snapshot = JSON.stringify(s.tasks);
  const batch = (items, mode = "dates", extra = {}) =>
    rpc("batch", {
      mode,
      reviewed: true,
      revision,
      request_id: id(seq++),
      items,
      ...extra,
    });
  await rejects(
    () =>
      batch([
        {
          id: first[0].id,
          planned_start: "2026-12-01",
          planned_end: "2026-12-01",
        },
      ]),
    "22023",
  );
  eq(
    JSON.stringify((await rpc()).tasks),
    snapshot,
    "Dependency conflict rolls back all date writes",
  );
  await rejects(
    () =>
      batch([
        {
          id: first[0].id,
          planned_start: "2026-11-13",
          planned_end: "2026-11-12",
        },
      ]),
    "22023",
  );
  await rejects(
    () =>
      batch([
        {
          id: first[0].id,
          planned_start: "2026-11-12",
          planned_end: "2026-11-12",
        },
        {
          id: first[0].id,
          planned_start: "2026-11-12",
          planned_end: "2026-11-12",
        },
      ]),
    "22023",
  );
  await rejects(() => batch([]), "22023");
  await rejects(() => batch(Array.from({ length: 401 }, () => ({}))), "22023");
  await rejects(
    () => batch(change.items, "dates", { reviewed: false }),
    "22023",
  );
  await rejects(
    () =>
      rpc("batch", { ...change, revision, request_id: id(seq++) }, units[1].id),
    "42501",
  );
  await rejects(
    () =>
      rpc("batch", { ...change, revision, request_id: id(seq++) }, null, other),
    "42501",
  );
  // In a mixed write the valid first edit must not survive a later scope error.
  await rejects(
    () =>
      batch([
        {
          id: first[0].id,
          planned_start: "2026-11-12",
          planned_end: "2026-11-12",
        },
        {
          id: id(seq++),
          planned_start: "2026-11-12",
          planned_end: "2026-11-12",
        },
      ]),
    "42501",
  );
  eq(
    JSON.stringify((await rpc()).tasks),
    snapshot,
    "Later scope error rolls back earlier item",
  );
  const createBase = {
    ...items[0],
    id: id(seq++),
    predecessor_id: "",
    title: "Nytt arbete",
  };
  await rejects(
    () =>
      batch(
        [createBase, { ...createBase, id: id(seq++), owner_id: outsider }],
        "create",
      ),
    "42501",
  );
  eq(
    (await rpc()).tasks.length,
    400,
    "Invalid owner leaves no partial template",
  );
  await rejects(
    () => batch([{ ...createBase, predecessor_id: first[0].id }], "create"),
    "22023",
  );
  // Dates-only API cannot smuggle status/owner/note changes.
  s = await batch([
    {
      id: first[0].id,
      planned_start: "2026-11-12",
      planned_end: "2026-11-12",
      status: "done",
      actual_start: "2020-01-01",
      owner_id: outsider,
      note: "injected",
    },
  ]);
  revision = s.revision;
  eq(
    s.tasks.find((t) => t.id === first[0].id).status,
    "planned",
    "Dates-only action ignores execution fields",
  );
  eq(
    s.tasks.find((t) => t.id === first[0].id).note,
    "",
    "Dates-only action ignores private note changes",
  );
  await db.exec("reset role");
  await db.query(
    "update bolig_private.progress_tasks set status='working',actual_start=(now() at time zone 'Europe/Oslo')::date where id=$1",
    [first[0].id],
  );
  await actor(manager);
  await rejects(() => batch(change.items), "22023");
  eq(
    (await rpc()).tasks.find((t) => t.id === first[1].id).planned_start,
    "2026-11-13",
    "Started work rejects entire shift",
  );
  await db.exec("reset role");
  eq(
    (
      await db.query(
        "select has_function_privilege('anon','public.bolig_progress(uuid,uuid,uuid,text,jsonb)','execute') allowed",
      )
    ).rows[0].allowed,
    false,
    "Anonymous gateway denied",
  );
  eq(
    (
      await db.query(
        "select has_function_privilege('authenticated','bolig_private.progress_batch(uuid,uuid,uuid,jsonb)','execute') allowed",
      )
    ).rows[0].allowed,
    false,
    "Private batch helper is not directly executable",
  );
  await db.exec("reset role");
  await db.query("update bolig_private.roots set archived=true where id=$1", [
    root,
  ]);
  await actor(manager);
  await rejects(() => batch(change.items), "42501");
}
