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
  await db.exec("reset role");
  await db.exec(
    await fs.readFile(
      "supabase/migrations/20261023130433_bolig_manager_handover_review.sql",
      "utf8",
    ),
  );
  await actor(manager);
  const rec = await call("create_plan", null, null, {
    request_id: id(81000),
    title: "QA faktisk overtakelse",
    reference: "QA-HANDOVER",
    buildings: [
      {
        name: "Bygg A",
        building_type: "apartment",
        address: "",
        house_floors: 1,
        entrances: [{ address: "", counts: [2] }],
      },
    ],
  });
  const root = rec.root.id,
    unit = rec.units[0].id,
    second = rec.units[1].id,
    block = rec.blocks[0].id;
  const rpc = async (
    scope = unit,
    action = "get",
    v = null,
    p = {},
    company = firm,
  ) =>
    (
      await db.query(
        "select public.bolig_handover_review($1,$2,$3,$4,$5,$6) v",
        [
          company,
          root,
          scope,
          action,
          v?.revision ?? null,
          { ...p, ...(v ? { basis: v.basis } : {}) },
        ],
      )
    ).rows[0].v;
  const completion = async (scope = unit, action = "get", row = null, p = {}) =>
    (
      await db.query("select public.bolig_completion($1,$2,$3,$4,$5,$6) v", [
        firm,
        root,
        scope,
        action,
        row?.revision ?? null,
        { ...p, ...(row ? { basis: row.basis } : {}) },
      ])
    ).rows[0].v;
  let v = await rpc();
  const partial = await rpc(unit, "assess", v, {
    request_id: crypto.randomUUID(),
    decisions: [],
    confirmed: false,
  });
  eq(
    partial.assessment.complete,
    false,
    "Partial review can be saved without manufactured decisions",
  );
  v = partial;

  eq(
    v.cases.some((c) => c.category === "Intern godkjenning"),
    true,
    "Missing internal approval is an explicit open case",
  );
  eq(v.record, null, "No invented actual handover");
  await db.exec("reset role");
  await db.query(
    `insert into bolig_private.quality_states(root_id,scope_id,data) values($1,$2,$3)`,
    [
      root,
      unit,
      {
        checks: [],
        documents: [],
        protocols: [
          {
            id: id(81001),
            title: "QA Protokoll",
            remarks: [
              {
                id: id(81002),
                text: "Kritisk lekkasje må vurderes særskilt",
                severity: "critical",
                rectified: false,
              },
            ],
          },
        ],
        fdv: {},
      },
    ],
  );
  await db.query(
    `insert into bolig_private.progress_tasks(id,root_id,unit_id,title,owner_id,planned_start,planned_end,status,required) values($1,$2,$3,'QA aktivitet', $4,'2026-10-23','2026-10-23','planned',false)`,
    [id(81003), root, unit, manager],
  );
  await db.query(
    `update bolig_private.units set contact_name='QA Beboer',contact_email='qa@example.invalid' where id=$1`,
    [unit],
  );
  await db.query(
    `insert into bolig_private.resident_portals(id,root_id,unit_id,created_by,contact_basis) select $1,$2,id,$3,md5(jsonb_build_array(contact_name,contact_email)::text) from bolig_private.units where id=$4`,
    [id(81004), root, manager, unit],
  );
  await db.query(
    `insert into bolig_private.resident_events(id,portal_id,kind,sender,contact_basis,body) select $1,id,'message','resident',contact_basis,'Secret text should not appear in the overview' from bolig_private.resident_portals where id=$2`,
    [id(81005), id(81004)],
  );
  await actor(manager);
  v = await rpc();
  eq(
    v.cases.some((c) => c.critical),
    true,
    "Critical case remains visible",
  );
  eq(
    v.cases.some((c) => c.category === "Aktivitet"),
    true,
    "Optional uncompleted work is also visible",
  );
  eq(
    v.cases.some((c) => c.category === "Beboermelding"),
    true,
    "Unprocessed resident messages included even with messaging disabled",
  );
  eq(
    JSON.stringify(v.cases).includes("Secret text"),
    false,
    "No message body copied into case list",
  );
  const decisions = () =>
    v.cases.map((c) => ({
      id: c.id,
      decision: "carry",
      reason: c.critical
        ? "QA leder har vurdert forholdet særskilt og følger opp dokumentert."
        : "QA avklart til videre oppfølging",
      owner_id: manager,
      critical_confirmed: c.critical,
    }));
  const payload = () => ({
    request_id: crypto.randomUUID(),
    decisions: decisions(),
    confirmed: true,
    date: "2026-10-23",
    reference: "QA protokoll 23.10.2026",
  });
  await rejects(
    () => rpc(unit, "record", v, { ...payload(), confirmed: false }),
    "22023",
  );
  await rejects(
    () =>
      rpc(unit, "record", v, { ...payload(), decisions: decisions().slice(1) }),
    "22023",
  );
  await rejects(
    () =>
      rpc(unit, "record", v, {
        ...payload(),
        decisions: decisions().map((d) => ({ ...d, id: "forged" })),
      }),
    "22023",
  );
  await rejects(
    () =>
      rpc(unit, "record", v, {
        ...payload(),
        decisions: decisions().map((d) => ({
          ...d,
          critical_confirmed: false,
        })),
      }),
    "22023",
  );
  await rejects(
    () =>
      rpc(unit, "record", v, {
        ...payload(),
        decisions: decisions().map((d) => ({ ...d, owner_id: outsider })),
      }),
    "42501",
  );
  await rejects(
    () =>
      rpc(unit, "record", v, {
        ...payload(),
        decisions: decisions().map((d) => ({ ...d, decision: "block" })),
      }),
    "PT409",
  );
  await rejects(
    () => rpc(unit, "record", v, { ...payload(), date: "2999-01-01" }),
    "22023",
  );
  const blocked = {
    ...payload(),
    decisions: decisions().map((d) => ({ ...d, decision: "block" })),
  };
  v = await rpc(unit, "assess", v, blocked);
  eq(
    v.assessment.decisions.every((d) => d.decision === "block"),
    true,
    "Blocking assessment can be saved without handover",
  );
  eq(v.record, null, "Assessment does not record actual handover");
  const before = v,
    p = payload();
  v = await rpc(unit, "record", v, p);
  eq(
    v.record.reference,
    p.reference,
    "Actual reference recorded with open controls and critical finding",
  );
  eq(
    v.assessment.decisions.every((d) => d.decision === "carry"),
    true,
    "All carried matters have explicit decision",
  );
  eq(
    v.history.length,
    3,
    "Assessment and record have independent immutable history",
  );
  eq(
    (await rpc(unit, "record", before, p)).revision,
    v.revision,
    "Exact lost-response retry returns same receipt",
  );
  await rejects(
    () => rpc(unit, "record", before, { ...p, reference: "changed" }),
    "PT409",
  );
  let tree = await completion();
  let row = tree.rows.find((r) => r.scope_id === unit);
  eq(
    row.status,
    "handed_over_with_rest",
    "Actual handover is visible despite open internal controls",
  );
  eq(
    row.control_status,
    "not_started",
    "Actual handover never certifies unperformed controls",
  );
  eq(row.approval, null, "No fabricated internal approval");
  eq(row.manager_handover, true, "Manager registration is distinct");
  await db.exec("reset role");
  eq(
    (
      await db.query(
        "select handled_at from bolig_private.resident_events where id=$1",
        [id(81005)],
      )
    ).rows[0].handled_at,
    null,
    "Handover does not handle messages",
  );
  eq(
    (
      await db.query(
        "select status from bolig_private.progress_tasks where id=$1",
        [id(81003)],
      )
    ).rows[0].status,
    "planned",
    "Handover does not finish work",
  );
  const beforeText = JSON.stringify(v.assessment);
  await db.query(
    `update bolig_private.progress_tasks set title='QA endret aktivitet',revision=revision+1 where id=$1`,
    [id(81003)],
  );
  await actor(manager);
  const changed = await rpc();
  eq(
    changed.basis !== v.basis,
    true,
    "Changed underlying work invalidates review basis",
  );
  eq(
    JSON.stringify(changed.assessment),
    beforeText,
    "Original review snapshot remains intact",
  );
  eq(
    changed.record.reference,
    p.reference,
    "Actual handover remains recorded after change",
  );
  await rejects(() => rpc(unit, "assess", v, payload()), "PT409");
  v = changed;
  await rejects(() => rpc(unit, "record", v, payload()), "22023");
  v = await rpc(unit, "record", v, {
    ...payload(),
    correction_reason: "QA retter protokollreferanse",
    reference: "QA korrigert protokoll",
  });
  eq(v.history.length, 4, "Correction preserves previous record in history");
  eq(
    v.history[1].snapshot.record.reference,
    p.reference,
    "Prior actual handover retained in snapshot",
  );
  // Export full evidence for selected area; no parent review leaks to neighbour.
  const parent = await rpc(block);
  let par = await rpc(block, "assess", parent, {
    request_id: crypto.randomUUID(),
    basis: parent.basis,
    confirmed: true,
    decisions: parent.cases.map((c) => ({
      id: c.id,
      decision: "carry",
      reason: "QA felles vurdering med boligens private referanse",
      owner_id: manager,
      critical_confirmed: true,
    })),
  });
  const ex = async (scope) =>
    (
      await db.query("select public.bolig_documentation_export($1,$2,$3) v", [
        firm,
        root,
        scope,
      ])
    ).rows[0].v;
  const own = await ex(unit);
  eq(
    own.scopes.find((s) => s.id === unit).handover_review.history.length,
    4,
    "Selected documentation includes immutable manager history",
  );
  const neighbour = await ex(second);
  eq(
    JSON.stringify(neighbour).includes("QA korrigert protokoll"),
    false,
    "Apartment package does not expose neighbour handover",
  );
  eq(
    JSON.stringify(neighbour).includes(
      "QA felles vurdering med boligens private referanse",
    ),
    false,
    "Parent common section does not leak parent decisions",
  );
  await actor(reader);
  eq(
    (await rpc()).record.reference,
    "QA korrigert protokoll",
    "Authorized reader can see actual handover",
  );
  await rejects(() => rpc(unit, "assess", v, payload()), "42501");
  await actor(outsider, other);
  await rejects(() => rpc(), "42501");
  await actor(manager);
  await rejects(() => rpc(unit, "get", null, {}, other), "42501");
  await rejects(
    () => db.query("select * from bolig_private.handover_states"),
    "42501",
  );
  await rejects(
    () => db.query("select * from bolig_private.handover_events"),
    "42501",
  );
  // Losing linked-project access hides snapshots and blocks all writes.
  await db.exec("reset role");
  const linked = id(81007);
  await db.query(
    "insert into public.projects(id,company_scope_id,user_id,title,data) values($1,$2,$3,$4,$5)",
    [linked, firm, manager, "QA linked", {}],
  );
  await db.query("update bolig_private.units set project_id=$1 where id=$2", [
    linked,
    unit,
  ]);
  await actor(manager);
  await db.exec("select set_config('qa.project_read','no',false)");
  const hidden = await rpc();
  eq(hidden.restricted, true, "Fresh project access checked");
  eq(hidden.record, null, "Unavailable linked source hides record");
  eq(hidden.history.length, 0, "Unavailable source hides history");
  eq(
    hidden.cases.length,
    0,
    "Unavailable source hides all aggregate case details",
  );
  await rejects(() => rpc(unit, "assess", hidden, payload()), "42501");
  await db.exec("select set_config('qa.project_read','yes',false)");
  let internalTree = await completion();
  let internalRow = internalTree.rows.find((r) => r.scope_id === unit);
  internalTree = await completion(unit, "start", internalRow);
  internalRow = internalTree.rows.find((r) => r.scope_id === unit);
  internalTree = await completion(unit, "review_all", internalRow, {
    confirmed: true,
    note: "QA kontrollert faktisk arbeid",
  });
  internalRow = internalTree.rows.find((r) => r.scope_id === unit);
  await rejects(() => completion(unit, "approve", internalRow), "PT409");
  await db.exec("reset role");
  await db.query(
    "update bolig_private.quality_states set data=jsonb_set(data,'{protocols,0,remarks,0,rectified}','true') where root_id=$1 and scope_id=$2",
    [root, unit],
  );
  await actor(manager);
  internalTree = await completion();
  internalRow = internalTree.rows.find((r) => r.scope_id === unit);
  internalTree = await completion(unit, "approve", internalRow);
  internalRow = internalTree.rows.find((r) => r.scope_id === unit);
  eq(
    !!internalRow.approval,
    true,
    "Internal approval remains usable after separately recorded handover",
  );
  eq(
    internalRow.handover.reference,
    "QA korrigert protokoll",
    "Later internal control never replaces actual handover",
  );
  await db.exec("reset role;set role anon");
  await rejects(() => rpc(), "42501");
  await actor(manager);
}
