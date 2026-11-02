import fs from "node:fs/promises";
export default async function ({
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
  await db.exec(`reset role;
 alter table public.projects add column if not exists share_enabled boolean default true;
 alter table public.kshms_deviations add column if not exists title text;
 alter table public.kshms_deviations add column if not exists due_on date;
 alter table public.kshms_deviations add column if not exists responsible_id uuid;
 alter table public.kshms_deviations add column if not exists created_by uuid;
 alter table public.kshms_deviations add column if not exists handler_id uuid;
 create table public.kshms_executions(id uuid,company_id uuid,project_id uuid,responsible_id uuid,created_by uuid,kind text,content jsonb,status text);
 create function public.get_kshms_context() returns jsonb language sql as $$select jsonb_build_object('company_id',public.current_active_company_scope_id(),'user_id',auth.uid(),'enabled',coalesce(current_setting('qa.ks',true),'yes')<>'no','manage',false)$$;
 create function kshms_private.deviation_visible(d public.kshms_deviations,x jsonb) returns boolean language sql as $$select d.company_id=(x->>'company_id')::uuid and (x->>'user_id')::uuid in(d.responsible_id,d.created_by,d.handler_id)$$;
 create function kshms_private.execution_visible(e public.kshms_executions,x jsonb) returns boolean language sql as $$select e.company_id=(x->>'company_id')::uuid and e.responsible_id=auth.uid()$$;`);
  await db.exec(
    await fs.readFile(
      "supabase/migrations/20261024115852_bolig_project_integration.sql",
      "utf8",
    ),
  );
  await actor(manager);
  const r = await call("create_plan", null, null, {
    request_id: id(993000),
    title: "QA Samlet prosjekt",
    reference: "QA-LINK",
    buildings: [
      {
        name: "QA",
        building_type: "house",
        address: "",
        house_floors: 1,
        entrances: [{ address: "", counts: [1] }],
      },
    ],
  });
  const root = r.root.id,
    unit = r.units[0].id;
  const baseline = await call("get", root),
    p1 = id(993001),
    p2 = id(993002),
    foreign = id(993003);
  let seq = 993100;
  const req = (p) => ({ ...p, request_id: id(seq++) });
  const rpc = async (a = "get", p = {}, c = firm, rt = root) =>
    (
      await db.query("select public.bolig_project_integration($1,$2,$3,$4) v", [
        c,
        rt,
        a,
        p,
      ])
    ).rows[0].v;
  const mine = async (p = {}, c = firm) =>
    (await db.query("select public.bolig_my_project_tasks($1,$2) v", [c, p]))
      .rows[0].v;
  await db.exec("reset role");
  await db.query(
    'insert into public.projects(id,company_scope_id,user_id,title,data) values($1,$2,$3,\'Existing untouched\',\'{"project":{"projectName":"Existing project"},"checklist":{"Keep":"unchanged"}}\'),($4,$5,$3,\'Foreign project\',\'{}\')',
    [p2, firm, manager, foreign, other],
  );
  const prior = (
    await db.query("select to_jsonb(p) v from public.projects p where id=$1", [
      p2,
    ])
  ).rows[0].v;
  await actor(manager);
  eq((await rpc()).has_link, false);
  const priorTaskCount = (await mine()).count;
  await rejects(
    () => rpc("link", req({ revision: 0, project_id: foreign })),
    "42501",
  );
  const create = req({ revision: 0, project_id: p1 });
  let s = await rpc("create", create);
  eq(s.project.id, p1);
  eq(s.project.title, "QA Samlet prosjekt");
  eq(s.receipt_id, create.request_id);
  eq(s.revision, 1);
  eq((await rpc("create", create)).project.id, p1, "lost answer exact replay");
  await rejects(() => rpc("create", { ...create, project_id: p2 }), "PT409");
  await rejects(
    () => rpc("link", req({ revision: 0, project_id: p2 })),
    "PT409",
  );
  await rejects(
    () => rpc("link", req({ revision: 1, project_id: p2 })),
    "22023",
  );
  eq(await call("get", root), baseline, "root, units and contacts unchanged");
  await db.exec("reset role");
  eq(
    (
      await db.query(
        "select count(*)::int n from public.projects where id=$1",
        [p1],
      )
    ).rows[0].n,
    1,
  );
  eq(
    (
      await db.query(
        "select to_jsonb(p) v from public.projects p where id=$1",
        [p2],
      )
    ).rows[0].v,
    prior,
    "existing project remains byte identical",
  );
  await db.query(
    "insert into public.kshms_deviations(id,company_id,project_id,revision,status,title,responsible_id,due_on) values($1,$2,$3,1,'open','Own RUH',$4,current_date),($5,$2,$3,1,'open','Someone else RUH',$6,current_date)",
    [id(993010), firm, p1, manager, id(993011), reader],
  );
  await db.query(
    'insert into public.kshms_executions values($1,$2,$3,$4,$4,\'round\',\'{"title":"Own control","planned_on":"2026-01-15"}\',\'draft\')',
    [id(993012), firm, p1, manager],
  );
  await actor(manager);
  const task = id(993013);
  await db.query("select public.bolig_progress($1,$2,$3,'save',$4)", [
    firm,
    root,
    unit,
    req({
      revision: 0,
      id: task,
      unit_id: unit,
      title: "Own progress",
      owner_id: manager,
      planned_start: "2026-01-15",
      planned_end: "2026-01-16",
      status: "planned",
      required: true,
      note: "",
      room_id: "",
      predecessor_id: "",
    }),
  ]);
  s = await mine();
  eq(s.count, priorTaskCount + 3);
  eq(
    (await mine({ selected_id: task, selected_kind: "progress" })).selected.id,
    task,
  );
  let page = await mine(),
    all = [];
  do {
    all.push(...page.items);
    page = page.next ? await mine({ after: page.next }) : null;
  } while (page);
  eq(all.length, priorTaskCount + 3, "pagination includes all own tasks");
  // Due-date ordering can put today's deviation beyond the first 100 tasks.
  // Verify the same three assigned kinds after the existing full pagination.
  eq(
    all
      .filter((x) => x.root_id === root)
      .map((x) => x.kind)
      .sort(),
    ["deviation", "progress", "round"],
  );
  eq(all.filter((x) => x.root_id === root).length, 3);

  eq(
    new Set(all.map((x) => x.kind + ":" + x.id)).size,
    all.length,
    "no duplicate tasks across pages",
  );
  const outside = all.at(-1);
  eq(
    (await mine({ selected_id: outside.id, selected_kind: outside.kind }))
      .selected.id,
    outside.id,
    "selected task beyond first page stays authorized",
  );
  await actor(reader);
  s = await mine();
  eq(
    s.items.filter((x) => x.root_id === root).length,
    1,
    "only own assigned task",
  );
  eq(s.items.find((x) => x.root_id === root).title, "Someone else RUH");
  await rejects(
    () => rpc("link", req({ revision: 0, project_id: p2 })),
    "42501",
  );
  await actor(outsider, other);
  await rejects(() => rpc(), "42501");
  await rejects(() => mine({}, firm), "42501");
  await actor(manager);
  await db.exec("select set_config('qa.ks','no',false)");
  s = await mine();
  eq(s.count, priorTaskCount + 1);
  eq(s.ks_context, null);
  eq(
    s.items.find((x) => x.root_id === root).kind,
    "progress",
    "no KS access leaks no HMS tasks",
  );
  await db.exec(
    "select set_config('qa.ks','yes',false);select set_config('qa.project_read','no',false)",
  );
  s = await mine();
  eq(s.count, priorTaskCount + 1);
  eq((await rpc()).project, null);
  eq((await rpc()).has_link, true, "link existence distinct from permission");
  await db.exec("select set_config('qa.project_read','yes',false)");
  await db.exec("reset role");
  await db.query(
    "update public.kshms_deviations set status='closed' where id=$1",
    [id(993010)],
  );
  await db.query(
    "update public.kshms_executions set status='completed' where id=$1",
    [id(993012)],
  );
  await actor(manager);
  eq(
    (await mine()).count,
    priorTaskCount + 1,
    "closed source records disappear without a duplicate task engine",
  );
  await db.exec("reset role");
  await db.query(
    "update bolig_private.progress_tasks set status='done',actual_start=planned_start,actual_end=planned_end where id=$1",
    [task],
  );
  await actor(manager);
  eq(
    (await mine({ selected_id: task, selected_kind: "progress" })).selected,
    null,
  );
  eq((await mine()).count, priorTaskCount);
  const root2 = (
    await call("create_plan", null, null, {
      request_id: id(993020),
      title: "QA Existing link",
      reference: "QA-LINK2",
      buildings: [
        {
          name: "QA",
          building_type: "house",
          address: "",
          house_floors: 1,
          entrances: [{ address: "", counts: [1] }],
        },
      ],
    })
  ).root.id;
  await rpc("link", req({ revision: 0, project_id: p2 }), firm, root2);
  await db.exec("reset role");
  eq(
    (
      await db.query(
        "select to_jsonb(p) v from public.projects p where id=$1",
        [p2],
      )
    ).rows[0].v,
    prior,
  );
  await actor(manager);
  await rejects(
    () => db.query("select * from bolig_private.project_links"),
    "42501",
  );
  await db.exec("select set_config('qa.projects','no',false)");
  await rejects(() => mine(), "42501");
  await db.exec("select set_config('qa.projects','yes',false)");
  await call("archive", root, baseline.root.revision, {
    kind: "root",
    id: root,
    archived: true,
  });
  eq(
    (await mine()).items.every((x) => x.root_id !== root),
    true,
  );
  await rejects(
    () => rpc("create", req({ revision: 1, project_id: id(993099) })),
    "42501",
  );
  await db.exec("reset role;set role anon");
  await rejects(() => rpc(), "42501");
  await rejects(() => mine(), "42501");
  await actor(manager);
}

