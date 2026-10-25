import fs from "node:fs/promises";
export default async function completionScenarios({
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
  await db.exec(`reset role;alter table public.projects add column if not exists data jsonb default '{}';
 create table public.qa_completion_runs(project_id uuid,id uuid,sequence bigint,category text,status text);
 create table public.kshms_deviations(id uuid,company_id uuid,project_id uuid,revision bigint,status text);
 create function public.project_checklist_state(c uuid,p uuid) returns jsonb language sql security definer as $$select jsonb_build_object('runs',(select coalesce(jsonb_agg(to_jsonb(r)),'[]') from public.qa_completion_runs r where project_id=p),'checklist',(select coalesce(data->'checklist','{}') from public.projects where id=p))$$;`);
  await db.exec(
    await fs.readFile(
      "supabase/migrations/20261021222820_bolig_documented_completion.sql",
      "utf8",
    ),
  );
  await db.exec(
    await fs.readFile(
      "supabase/migrations/20261021223812_bolig_completion_aggregate_handover.sql",
      "utf8",
    ),
  );
  await actor(manager);
  await db.exec(
    "select set_config('qa.projects','yes',false);select set_config('qa.project_read','yes',false)",
  );
  const rec = await call("create_plan", null, null, {
    request_id: id(19000),
    title: "QA Completion",
    reference: "QA-DONE",
    buildings: [
      {
        name: "Bygg 1",
        building_type: "apartment",
        address: "QA kontrollgate",
        house_floors: 1,
        entrances: [{ address: "QA kontrollgate", counts: [2] }],
      },
    ],
  });
  const root = rec.root.id,
    block = rec.blocks[0].id,
    unit = rec.units[0].id,
    second = rec.units[1].id;
  const rpc = async (
    scope = null,
    action = "get",
    row = null,
    payload = {},
    company = firm,
  ) =>
    (
      await db.query("select public.bolig_completion($1,$2,$3,$4,$5,$6) v", [
        company,
        root,
        scope,
        action,
        row?.revision ?? null,
        { ...payload, ...(row ? { basis: row.basis } : {}) },
      ])
    ).rows[0].v;
  const getRow = (data, scope) => data.rows.find((r) => r.scope_id === scope);
  let data = await rpc(unit),
    row = getRow(data, unit);
  eq(row.status, "not_started", "No vacuous completion");
  await rejects(() => rpc(unit, "approve", row), "PT409");
  await actor(reader);
  await rejects(() => rpc(unit, "start", row), "42501");
  await actor(outsider, other);
  await rejects(() => rpc(unit), "42501");
  await actor(manager);
  data = await rpc(unit, "start", row);
  row = getRow(data, unit);
  eq(row.items.length, 5, "Five explicit core requirements");
  eq(row.owner_id, manager, "Actual responsible user");
  await rejects(
    () =>
      rpc(unit, "item", row, { id: row.items[0].id, done: true, evidence: "" }),
    "22023",
  );
  const old = row;
  for (const item of row.items) {
    data = await rpc(unit, "item", row, {
      id: item.id,
      done: true,
      evidence: "QA document version 1",
    });
    row = getRow(data, unit);
  }
  eq(row.status, "controlled", "Evidence is controlled, not approval");
  await rejects(
    () =>
      rpc(unit, "item", old, {
        id: old.items[0].id,
        done: true,
        evidence: "Stale writer",
      }),
    "PT409",
  );
  await rejects(() => rpc(unit, "owner", row, { owner_id: outsider }), "42501");
  data = await rpc(unit, "approve", row);
  row = getRow(data, unit);
  eq(row.status, "ready");
  await rejects(
    () =>
      rpc(unit, "item", row, {
        id: row.items[0].id,
        done: true,
        evidence: "Edit after approval",
      }),
    "PT409",
  );
  await rejects(() => rpc(unit, "handover", row, { reason: "" }), "PT409");
  data = await rpc(unit, "handover", row, {
    reason: "QA protocol 22 October 2026",
  });
  row = getRow(data, unit);
  eq(row.status, "handed_over");
  await rejects(
    () => rpc(unit, "handover", row, { reason: "Duplicate" }),
    "PT409",
  );
  eq(data.history[0].action, "handover", "Immutable history order");
  // Building remains blocked until both units and common work are checked.
  data = await rpc(block);
  let br = getRow(data, block);
  data = await rpc(block, "no_common", br, {
    reason: "QA no own common works",
  });
  br = getRow(data, block);
  eq(
    br.status,
    "in_progress",
    "Unfinished children cannot show executed building",
  );
  await rejects(() => rpc(block, "approve", br), "PT409");
  data = await rpc(second);
  let sr = getRow(data, second);
  data = await rpc(second, "start", sr);
  sr = getRow(data, second);
  for (const item of sr.items) {
    data = await rpc(second, "item", sr, {
      id: item.id,
      done: true,
      evidence: "QA second dwelling documentation",
    });
    sr = getRow(data, second);
  }
  data = await rpc(second, "approve", sr);
  br = getRow(data, block);
  eq(br.status, "controlled");
  data = await rpc(block, "approve", br);
  br = getRow(data, block);
  eq(br.status, "ready");
  await rejects(
    () =>
      rpc(block, "handover", br, {
        reason: "QA cannot hand over before second dwelling",
      }),
    "PT409",
  );
  let pr = getRow(data, root);
  eq(pr.status, "not_started", "Project has independent common scope");
  data = await rpc(root, "no_common", pr, {
    reason: "QA no project common works",
  });
  pr = getRow(data, root);
  eq(pr.status, "controlled");
  data = await rpc(root, "approve", pr);
  pr = getRow(data, root);
  eq(pr.status, "ready");
  // A new room changes source, invalidating unit proof + all ancestor approvals.
  const rooms = (
    await db.query("select public.bolig_rooms($1,$2,$3,$4,$5,$6) v", [
      firm,
      root,
      unit,
      "save",
      0,
      { id: id(19010), type: "bathroom", name: "New bath", floor: "" },
    ])
  ).rows[0].v;
  data = await rpc(unit);
  row = getRow(data, unit);
  eq(row.status, "review");
  eq(getRow(data, block).status, "review");
  eq(getRow(data, root).status, "review");
  eq(row.done, 0, "Changed source cannot retain stale green proof");
  await rejects(() => rpc(unit, "reopen", row, { reason: "" }), "22023");
  data = await rpc(unit, "reopen", row, {
    reason: "QA new room requires review",
  });
  row = getRow(data, unit);
  eq(row.handover, null);
  eq(
    data.history.some((h) => h.action === "handover"),
    true,
    "Original handover retained after reopening",
  );
  // Linked source: unfinished controls, open deviations, project rights, changed basis.
  const project = id(19020);
  await db.exec(
    `reset role;insert into public.projects(id,company_scope_id,user_id,title,data) values('${project}','${firm}','${manager}','QA Linked','{"checklist":{"Control":{"Point":{"status":"Avvik"}}}}');insert into public.qa_completion_runs values('${project}','${id(19021)}',1,'Control','draft');`,
  );
  await actor(manager);
  let fresh = await call("get", root);
  await call("unit", root, fresh.root.revision, {
    id: unit,
    number: rec.units[0].number,
    project_id: project,
    contact_name: "",
  });
  data = await rpc(unit);
  row = getRow(data, unit);
  eq(row.source.linked_project, true);
  eq(
    row.issues.some((x) => x.includes("ikke er fullført")),
    true,
  );
  eq(
    row.issues.some((x) => x.includes("åpne avvik")),
    true,
  );
  for (const item of row.items) {
    data = await rpc(unit, "item", row, {
      id: item.id,
      done: true,
      evidence: "QA linked proof",
    });
    row = getRow(data, unit);
  }
  await rejects(() => rpc(unit, "approve", row), "PT409");
  await db.exec(
    `reset role;update public.qa_completion_runs set status='completed';update public.projects set data='{"checklist":{"Control":{"Point":{"status":"Ok"}}}}' where id='${project}';insert into public.kshms_deviations values('${id(19030)}','${firm}','${project}',1,'open');`,
  );
  await actor(manager);
  data = await rpc(unit);
  row = getRow(data, unit);
  eq(
    row.issues.some((x) => x.includes("avvikssentralen")),
    true,
  );
  await db.exec(
    `reset role;update public.kshms_deviations set status='closed',revision=2;`,
  );
  await actor(manager);
  data = await rpc(unit);
  row = getRow(data, unit);
  for (const item of row.items) {
    data = await rpc(unit, "item", row, {
      id: item.id,
      done: true,
      evidence: "QA final linked proof",
    });
    row = getRow(data, unit);
  }
  eq(row.status, "controlled");
  data = await rpc(unit, "approve", row);
  eq(getRow(data, unit).status, "ready");
  await db.exec("select set_config('qa.project_read','no',false)");
  data = await rpc(unit);
  row = getRow(data, unit);
  eq(row.status, "review");
  eq(row.items, [], "Project evidence not leaked without project rights");
  eq(data.history, [], "Project history not leaked without project rights");
  await rejects(
    () => rpc(unit, "reopen", row, { reason: "No project access" }),
    "42501",
  );
  await db.exec("select set_config('qa.project_read','yes',false)");
  await rejects(
    () => db.query("select * from bolig_private.completion_states"),
    "42501",
  );
  await rejects(
    () => db.query("select bolig_private.completion_tree($1,$2)", [firm, root]),
    "42501",
  );
  await rejects(() => rpc(id(99999)), "42501");
  eq((await rpc(null)).rows.length, 4, "Exact active hierarchy");
}
