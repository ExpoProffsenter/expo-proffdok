import fs from "node:fs/promises";
export default async function ({
  db,
  call,
  actor,
  eq,
  rejects,
  firm,
  other,
  manager,
  reader,
  outsider,
}) {
  await db.exec("reset role");
  for (const file of [
    "20261023144403_bolig_handover_followup.sql",
    "20261023144404_bolig_contact_agreement_boundary.sql",
    "20261023144405_bolig_delivery_effective_order_alias.sql",
  ])
    await db.exec(await fs.readFile("supabase/migrations/" + file, "utf8"));
  await actor(manager);
  const rec = await call("create_plan", null, null, {
    request_id: crypto.randomUUID(),
    title: "QA follow-up and contact boundaries",
    reference: "QA-FOLLOWUP",
    buildings: [
      {
        name: "A",
        building_type: "apartment",
        address: "",
        house_floors: 1,
        entrances: [{ address: "", counts: [2] }],
      },
      {
        name: "B",
        building_type: "apartment",
        address: "",
        house_floors: 1,
        entrances: [{ address: "", counts: [1] }],
      },
    ],
  });
  const root = rec.root.id,
    unit = rec.units[0].id,
    neighbor = rec.units[1].id,
    foreign = rec.units[2].id;
  const rpc = async (action = "get", payload = {}, scope = unit, c = firm) =>
    (
      await db.query(
        "select public.bolig_handover_followup($1,$2,$3,$4,$5) v",
        [c, root, scope, action, payload],
      )
    ).rows[0].v;
  const review = async (scope = unit) =>
    (
      await db.query("select public.bolig_handover_review($1,$2,$3) v", [
        firm,
        root,
        scope,
      ])
    ).rows[0].v;
  let s = await rpc(),
    r = await review();
  eq(s.units.length, 1, "Follow-up choices are scoped to one apartment");
  eq(s.links, [], "No invented links");
  const source = r.cases.find((c) => c.category !== "Aktivitet"),
    task = crypto.randomUUID();
  const p = {
    request_id: crypto.randomUUID(),
    basis: r.basis,
    case_id: source.id,
    task_id: task,
    unit_id: unit,
    title: "QA etterjustering",
    owner_id: manager,
    planned_start: "2026-10-26",
    planned_end: "2026-10-28",
  };
  await rejects(() => rpc("create", { ...p, unit_id: neighbor }), "42501");
  await rejects(() => rpc("create", { ...p, owner_id: outsider }), "42501");
  await rejects(
    () => rpc("create", { ...p, planned_end: "2026-10-20" }),
    "22023",
  );
  eq(
    (await rpc()).tasks.length,
    0,
    "Rejected follow-up leaves no partial task",
  );
  s = await rpc("create", p);
  eq(s.tasks[0].id, task, "Creates an actual existing-engine activity");
  eq(
    s.tasks[0].required,
    false,
    "A follow-up does not introduce a mandatory handover gate",
  );
  eq(s.tasks[0].owner_id, manager, "Actual activity owner is registered");
  eq(
    s.tasks[0].planned_end,
    "2026-10-28",
    "Deadline is stored in progress engine",
  );
  eq(s.links[0].source.id, source.id, "Original source snapshot retained");
  eq(
    await rpc("create", p),
    s,
    "Lost reply replays exact result despite changed handover basis",
  );
  await rejects(() => rpc("create", { ...p, title: "Different" }), "PT409");
  await rejects(
    () => rpc("create", { ...p, request_id: crypto.randomUUID() }),
    "PT409",
  );
  r = await review();
  eq(
    r.cases.some((c) => c.id === source.id),
    true,
    "Creating work never closes the source",
  );
  eq(
    r.cases.some((c) => c.id === "task:" + task),
    true,
    "New work appears in the unified open list",
  );
  const secondSource = r.cases.find(
    (c) => c.id !== source.id && c.category !== "Aktivitet",
  );
  if (secondSource) {
    const link = {
      request_id: crypto.randomUUID(),
      basis: r.basis,
      case_id: secondSource.id,
      task_id: task,
    };
    s = await rpc("link", link);
    eq(s.links.length, 2, "Several related matters can share one activity");
    eq(s.tasks.length, 1, "Linking does not duplicate work");
  }
  await actor(reader);
  await rejects(() => rpc("create", p), "42501");
  eq(
    (await rpc()).links.length > 0,
    true,
    "Reader can inspect existing follow-up",
  );
  await actor(outsider, other);
  await rejects(() => rpc(), "42501");
  await actor(manager);
  await rejects(() => rpc("get", {}, unit, other), "42501");
  await rejects(
    () => db.query("select * from bolig_private.handover_followups"),
    "42501",
  );
  // Contact boundary: real public links before and after the actual unit action.
  await db.exec("reset role");
  const doc = crypto.randomUUID(),
    tok = crypto.randomUUID().replaceAll("-", "").repeat(2),
    portal = crypto.randomUUID(),
    ptok = crypto.randomUUID().replaceAll("-", "").repeat(2),
    newToken = crypto.randomUUID().replaceAll("-", "").repeat(2);
  await db.query(
    "update bolig_private.units set contact_name='Old QA',contact_email='old@example.invalid' where id=$1",
    [unit],
  );
  await db.query(
    "insert into bolig_private.commercial_documents(id,root_id,unit_id,group_id,version,kind,status,snapshot,token_hash,expires_at,created_by) values($1,$2,$3,$1,1,'choice','accepted',$4,sha256(convert_to($5,'UTF8')),now()+interval '10 days',$6)",
    [
      doc,
      root,
      unit,
      {
        goods: [{ sku: "ORIGINAL", quantity: 1 }],
        identity: { unit: "H0101" },
      },
      tok,
      manager,
    ],
  );
  await db.query(
    "insert into bolig_private.resident_portals(id,root_id,unit_id,created_by,token_hash,expires_at,revoked,contact_basis) select $1,$2,id,$3,sha256(convert_to($4,'UTF8')),now()+interval '10 days',false,md5(jsonb_build_array(contact_name,contact_email)::text) from bolig_private.units where id=$5",
    [portal, root, manager, ptok, unit],
  );
  const anon = () =>
    db.exec("reset role;select set_config('qa.user','',false);set role anon");
  const oldAgreement = async () =>
    (await db.query("select public.bolig_resident_decision($1) v", [tok]))
      .rows[0].v;
  const port = async (t) =>
    (await db.query("select public.bolig_portal($1) v", [t])).rows[0].v;
  await anon();
  eq(
    (await oldAgreement()).snapshot.goods[0].sku,
    "ORIGINAL",
    "Old link demonstrably worked before change",
  );
  eq(
    (await port(ptok)).agreements.length,
    1,
    "Current contact sees current agreement",
  );
  await actor(manager);
  let latest = await call("get", root);
  await call("unit", root, latest.root.revision, {
    id: unit,
    number: rec.units[0].number,
    contact_name: "New QA",
    contact_email: "new@example.invalid",
    contact_phone: "",
  });
  await anon();
  await rejects(() => oldAgreement(), "42501");
  await rejects(() => port(ptok), "42501");
  await actor(manager);
  let portalState = (
    await db.query("select public.bolig_resident_portal($1,$2,$3) v", [
      firm,
      root,
      unit,
    ])
  ).rows[0].v;
  portalState = (
    await db.query(
      "select public.bolig_resident_portal($1,$2,$3,'publish',$4) v",
      [
        firm,
        root,
        unit,
        {
          request_id: crypto.randomUUID(),
          revision: portalState.revision,
          token: newToken,
          reviewed: true,
        },
      ],
    )
  ).rows[0].v;
  await anon();
  eq(
    (await port(newToken)).agreements.length,
    0,
    "New contact cannot inherit prior agreements",
  );
  await rejects(
    () =>
      db.query("select public.bolig_portal($1,'accept',$2)", [
        newToken,
        {
          document_id: doc,
          name: "New QA",
          confirmed: true,
          request_id: crypto.randomUUID(),
        },
      ]),
    "42501",
  );
  await actor(manager);
  latest = await call("get", root);
  await call("unit", root, latest.root.revision, {
    id: unit,
    number: rec.units[0].number,
    contact_name: "Old QA",
    contact_email: "old@example.invalid",
    contact_phone: "",
  });
  await anon();
  await rejects(() => port(ptok), "42501");
  await rejects(() => oldAgreement(), "42501");
  await db.exec("reset role");
  eq(
    (
      await db.query(
        "select snapshot from bolig_private.commercial_documents where id=$1",
        [doc],
      )
    ).rows[0].snapshot.goods[0].sku,
    "ORIGINAL",
    "Historical commercial snapshot is unchanged",
  );
  eq(
    (
      await db.query(
        "select status from bolig_private.commercial_documents where id=$1",
        [doc],
      )
    ).rows[0].status,
    "accepted",
    "Historical decision survives A-B-A change",
  );
  await actor(manager);
}
