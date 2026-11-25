import fs from "node:fs/promises";
export default async function streamlined({
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
  for (const file of [
    "20261022001627_bolig_streamlined_workflow.sql",
    "20261022002024_bolig_quality_distribution.sql",
    "20261022002357_bolig_documentation_export.sql",
  ])
    await db.exec(await fs.readFile("supabase/migrations/" + file, "utf8"));
  await actor(manager);
  const plan = await call("create_plan", null, null, {
    request_id: id(23000),
    title: "QA Enkel flyt",
    reference: "",
    buildings: [
      {
        name: "Foreløpig bygg",
        building_type: "apartment",
        address: "",
        house_floors: 1,
        entrances: [
          { address: "", counts: [2] },
          { address: "", counts: [1] },
        ],
      },
    ],
  });
  const root = plan.root.id,
    block = plan.blocks[0].id,
    unit = plan.units[0].id,
    second = plan.units[1].id;
  eq(
    plan.entrances.map((e) => e.address),
    ["", ""],
    "Multiple unknown addresses are real empty values",
  );
  const q = async (
    scope = unit,
    action = "get",
    payload = {},
    revision = null,
  ) =>
    (
      await db.query("select public.bolig_quality($1,$2,$3,$4,$5,$6) v", [
        firm,
        root,
        scope,
        action,
        revision,
        payload,
      ])
    ).rows[0].v;
  const qualityWrite = async (scope, action, payload) =>
    q(scope, action, payload, (await q(scope)).revision);
  const c = async (scope = unit, action = "get", payload = {}) => {
    const current = (
      await db.query("select public.bolig_completion($1,$2,$3) v", [
        firm,
        root,
        scope,
      ])
    ).rows[0].v;
    const row = current.rows.find((r) => r.scope_id === scope);
    return action === "get"
      ? row
      : (
          await db.query(
            "select public.bolig_completion($1,$2,$3,$4,$5,$6) v",
            [
              firm,
              root,
              scope,
              action,
              row.revision,
              { ...payload, basis: row.basis },
            ],
          )
        ).rows[0].v.rows.find((r) => r.scope_id === scope);
  };
  const d = async (action = "get", payload = {}, company = firm) =>
    (
      await db.query(
        "select public.bolig_quality_distribution($1,$2,$3,$4) v",
        [company, root, action, payload],
      )
    ).rows[0].v;
  const content = {
    title: "Prosjektets funksjonskontroll",
    trade: "Felles – alle fag",
    instructions: "Kontroller levert arbeid",
    points: [
      {
        id: id(23001),
        title: "Funksjon er kontrollert",
        guidance: "",
        fields: [],
        image_required: false,
        comment_required: false,
      },
    ],
  };
  let state = await qualityWrite(unit, "check_add", {
    content,
    required: false,
  });
  const check = state.data.checks[0].id;
  eq(state.data.checks[0].required, false);
  eq(
    (await c()).issues.some((x) => x.includes("sjekkliste")),
    false,
    "Optional draft does not block",
  );
  eq(
    (await c()).warnings.some((x) => x.includes("Valgfri")),
    true,
  );
  await qualityWrite(unit, "check_requirement", { id: check, required: true });
  eq(
    (await c()).issues.some((x) => x.includes("Påkrevd")),
    true,
  );
  await qualityWrite(unit, "check_save", {
    id: check,
    complete: true,
    answers: {
      [id(23001)]: {
        status: "Avvik",
        severity: "minor",
        comment: "Etterjustering av rosett",
        values: {},
        documents: [],
      },
    },
  });
  eq((await c()).restpoints.length, 1);
  eq(
    (await c()).issues.some((x) => x.includes("Kritisk")),
    false,
  );
  await c(unit, "start");
  let row = await c(unit, "review_all", { confirmed: true, note: "" });
  eq(row.status, "controlled");
  eq(row.done, 5);
  await rejects(() => c(unit, "review_all", { confirmed: false }), "22023");
  row = await c(unit, "approve");
  eq(row.status, "ready_with_rest");
  eq(row.approval.restpoints.length, 1);
  row = await c(unit, "handover", {
    reason: "Signert protokoll 22.10 med rosett som restpunkt",
  });
  eq(row.status, "handed_over_with_rest");
  // Reopening a completed control keeps answers but invalidates the approval.
  await qualityWrite(unit, "check_reopen", {
    id: check,
    reason: "Kontroll av restpunkt",
  });
  row = await c();
  eq(row.status, "review");
  eq(row.done, 5, "Original manual proofs survive changed documentation");
  await qualityWrite(unit, "check_save", {
    id: check,
    complete: true,
    answers: {
      [id(23001)]: {
        status: "Avvik",
        severity: "critical",
        comment: "Lekkasje ved prøving",
        values: {},
        documents: [],
      },
    },
  });
  eq(
    (await c()).issues.some((x) => x.includes("Kritisk")),
    true,
  );
  eq((await c()).restpoints.length, 0);
  await c(unit, "reopen", { reason: "Ny kontroll av kritisk feil" });
  await rejects(() => c(unit, "approve"), "PT409");
  await qualityWrite(unit, "check_reopen", {
    id: check,
    reason: "Rette lekkasje",
  });
  await qualityWrite(unit, "check_save", {
    id: check,
    complete: true,
    answers: {
      [id(23001)]: {
        status: "Lukket avvik",
        comment: "Rettet og trykkprøvd",
        severity: "critical",
        values: {},
        documents: [],
      },
    },
  });
  row = await c(unit, "approve");
  eq(row.status, "ready");
  // Native unclassified old Avvik stay critical; arbitrary severity is rejected.
  await qualityWrite(second, "check_add", { content, required: false });
  const secondCheck = (await q(second)).data.checks[0].id;
  await rejects(
    () =>
      qualityWrite(second, "check_save", {
        id: secondCheck,
        complete: false,
        answers: { [id(23001)]: { status: "Avvik", severity: "pretend-ok" } },
      }),
    "22023",
  );
  await qualityWrite(second, "check_save", {
    id: secondCheck,
    complete: true,
    answers: { [id(23001)]: { status: "Avvik" } },
  });
  eq(
    (await c(second)).issues.some((x) => x.includes("Kritisk")),
    true,
  );
  await qualityWrite(second, "check_reopen", {
    id: secondCheck,
    reason: "Rettet kontroll",
  });
  await qualityWrite(second, "check_save", {
    id: secondCheck,
    complete: true,
    answers: {
      [id(23001)]: { status: "Lukket avvik", comment: "Rettet og kontrollert" },
    },
  });
  // Snapshot copies contain definitions only; completed answers never spread.
  const options = await d();
  eq(options.targets.length, 3);
  eq(options.project_lists.length >= 2, true);
  const payload = {
    sources: [{ kind: "project", id: check, scope_id: unit }],
    targets: [
      { scope_id: unit, room_id: null },
      { scope_id: second, room_id: null },
    ],
    required: true,
  };
  let preview = await d("preview", payload);
  eq(preview.added, 1);
  eq(preview.skipped, 1);
  await actor(reader);
  await rejects(() => d(), "42501");
  await actor(outsider, other);
  await rejects(() => d("preview", payload, other), "42501");
  await actor(manager);
  const apply = { ...payload, basis: preview.basis, request_id: id(23002) };
  let distributed = await d("apply", apply);
  eq(distributed.added, 1);
  eq(distributed.skipped, 1);
  eq(distributed.replayed, false);
  eq((await d("apply", apply)).replayed, true, "Exact retry returns receipt");
  const after = await q(second);
  eq(after.data.checks.length, 2);
  eq(after.data.checks[1].answers, {});
  eq(
    after.data.checks[1].definition,
    (await q(unit)).data.checks[0].definition,
  );
  eq(
    after.data.checks[0].answers[id(23001)].status,
    "Lukket avvik",
    "Existing completed answers unchanged",
  );
  await rejects(() => d("apply", { ...apply, required: false }), "PT409");
  preview = await d("preview", payload);
  eq(preview.added, 0);
  eq(preview.skipped, 2, "Previously copied controls skipped");
  const stalePayload = {
    sources: [{ kind: "project", id: check, scope_id: unit }],
    targets: [{ scope_id: plan.units[2].id }],
    required: false,
  };
  preview = await d("preview", stalePayload);
  await qualityWrite(plan.units[2].id, "check_add", {
    content: { ...content, title: "Ny kontroll mellom preview og lagring" },
    required: false,
  });
  await rejects(
    () =>
      d("apply", {
        ...stalePayload,
        basis: preview.basis,
        request_id: id(23003),
      }),
    "PT409",
  );
  eq(
    (await q(plan.units[2].id)).data.checks.length,
    1,
    "Stale batch has no partial writes",
  );
  await rejects(
    () => d("preview", { ...payload, targets: [{ scope_id: id(99999) }] }),
    "42501",
  );
  await rejects(
    () =>
      d("preview", {
        ...payload,
        targets: [payload.targets[0], payload.targets[0]],
      }),
    "22023",
  );
  // Published central templates and explicit room targets use canonical snapshots.
  await db.exec("reset role");
  await db.query(
    "insert into public.kshms_checklist_templates(id,company_id) values($1,$2)",
    [id(23010), firm],
  );
  await db.query(
    "insert into public.kshms_checklist_versions(id,template_id,company_id,number,content,content_hash) values($1,$2,$3,1,$4,$5)",
    [id(23011), id(23010), firm, JSON.stringify(content), "central-v1"],
  );
  await db.query(
    "delete from public.company_module_access where company_id=$1 and module_key='kshms'",
    [firm],
  );
  await db.query(
    "insert into public.company_module_access(company_id,module_key,enabled) values($1,'kshms',true)",
    [firm],
  );
  await actor(manager);
  await db.query("select public.bolig_rooms($1,$2,$3,$4,$5,$6)", [
    firm,
    root,
    unit,
    "save",
    0,
    { id: id(23012), type: "bathroom", name: "Hovedbad", floor: "" },
  ]);
  const roomPayload = {
    sources: [{ kind: "template", id: id(23011) }],
    targets: [
      { scope_id: unit, room_id: id(23012) },
      { scope_id: plan.units[2].id },
    ],
    required: false,
  };
  preview = await d("preview", roomPayload);
  eq(preview.added, 2);
  await d("apply", {
    ...roomPayload,
    basis: preview.basis,
    request_id: id(23013),
  });
  const roomCopy = (await q(unit)).data.checks.find(
    (x) => x.room_id === id(23012),
  );
  eq(roomCopy.source_version_id, id(23011));
  eq(roomCopy.definition, content);
  eq(roomCopy.answers, {});
  eq(roomCopy.required, false);
  const v1Preview = await d("preview", {
    ...roomPayload,
    targets: [{ scope_id: second }],
  });
  await db.exec("reset role");
  await db.query(
    "insert into public.kshms_checklist_versions(id,template_id,company_id,number,content,content_hash) values($1,$2,$3,2,$4,$5)",
    [
      id(23014),
      id(23010),
      firm,
      JSON.stringify({ ...content, title: "Sentral mal utgave 2" }),
      "central-v2",
    ],
  );
  await actor(manager);
  await rejects(
    () =>
      d("apply", {
        ...roomPayload,
        targets: [{ scope_id: second }],
        basis: v1Preview.basis,
        request_id: id(23015),
      }),
    "PT409",
  );
  eq(
    (await q(unit)).data.checks.find((x) => x.room_id === id(23012))
      .source_hash,
    "central-v1",
    "Existing assigned template keeps exact published original",
  );
  // Conditional readiness propagates through building/project; a later critical
  // defect invalidates the entire approval chain while preserving manual proof.
  await c(unit, "reopen", { reason: "Gjennomgang etter romoppsett" });
  await qualityWrite(unit, "check_reopen", {
    id: check,
    reason: "Ny merknad på avsluttet kontroll",
  });
  await qualityWrite(unit, "check_save", {
    id: check,
    complete: true,
    answers: {
      [id(23001)]: {
        status: "Avvik",
        severity: "minor",
        comment: "Rosett etterjusteres",
      },
    },
  });
  await c(unit, "approve");
  const secondCopy = (await q(second)).data.checks.find(
    (x) => x.id !== secondCheck,
  );
  await qualityWrite(second, "check_save", {
    id: secondCopy.id,
    complete: true,
    answers: {
      [id(23001)]: {
        status: "Avvik",
        severity: "minor",
        comment: "SIBLING-REST-NOT-FOR-H0101",
      },
    },
  });
  for (const uid of [second, plan.units[2].id]) {
    await c(uid, "start");
    await c(uid, "review_all", { confirmed: true, note: "" });
    await c(uid, "approve");
  }
  await c(block, "no_common", { reason: "" });
  eq(
    (await c(block)).done,
    1,
    "No common works requires explicit choice, no invented explanation",
  );
  await c(block, "approve");
  eq((await c(block)).status, "ready_with_rest");
  eq((await c(block)).restpoints.length, 2);
  await c(root, "no_common", { reason: "" });
  await c(root, "approve");
  eq((await c(root)).status, "ready_with_rest");
  await rejects(
    () => c(block, "handover", { reason: "For tidlig samlet protokoll" }),
    "PT409",
  );
  for (const uid of [unit, second, plan.units[2].id])
    await c(uid, "handover", { reason: "Signert QA overtagelsesprotokoll" });
  await c(block, "handover", { reason: "Signert samlet byggprotokoll" });
  await c(root, "handover", { reason: "Signert samlet prosjektprotokoll" });
  eq((await c(root)).status, "handed_over_with_rest");
  const scopedPackage = (
    await db.query("select public.bolig_documentation_export($1,$2,$3) v", [
      firm,
      root,
      unit,
    ])
  ).rows[0].v;
  eq(
    JSON.stringify(scopedPackage).includes("SIBLING-REST-NOT-FOR-H0101"),
    false,
    "A unit package does not disclose sibling restpoints through parent approval/history",
  );
  await qualityWrite(unit, "check_reopen", {
    id: check,
    reason: "Ny kritisk lekkasje",
  });
  await qualityWrite(unit, "check_save", {
    id: check,
    complete: true,
    answers: {
      [id(23001)]: {
        status: "Avvik",
        severity: "critical",
        comment: "Lekkasje krever retting",
      },
    },
  });
  eq((await c(root)).status, "review");
  eq((await c(block)).status, "review");
  eq(
    (await c(unit)).done,
    5,
    "New source requires new approval, not retyping old manual evidence",
  );

  const exported = async (scope = unit, company = firm) =>
    (
      await db.query("select public.bolig_documentation_export($1,$2,$3) v", [
        company,
        root,
        scope,
      ])
    ).rows[0].v;
  const unitExport = await exported();
  eq(
    unitExport.scopes.length,
    3,
    "Unit includes own, building and project common documentation",
  );
  eq(
    unitExport.scopes.filter((s) => s.kind === "unit").length,
    1,
    "No sibling unit documents exported",
  );
  eq(
    unitExport.scopes.find((s) => s.id === unit).history.length > 5,
    true,
    "Immutable prior controls preserved in package data",
  );
  eq(
    (await exported(root)).scopes.length,
    5,
    "Project includes three units and own ancestors",
  );
  await actor(reader);
  eq(
    (await exported()).scope_id,
    unit,
    "Readers may download documents in their authorized scope",
  );
  await actor(outsider, other);
  await rejects(() => exported(unit, other), "42501");
  await actor(manager);
  // A failing later target rolls back earlier writes in the same distribution.
  await db.exec("reset role");
  await db.query(
    "update bolig_private.quality_states set data=jsonb_set(data,'{checks}',$3::jsonb) where root_id=$1 and scope_id=$2",
    [
      root,
      second,
      JSON.stringify(Array.from({ length: 50 }, () => after.data.checks[0])),
    ],
  );
  await actor(manager);
  const rollbackPayload = {
    sources: [{ kind: "project", id: check, scope_id: unit }],
    targets: [
      { scope_id: plan.units[2].id },
      { scope_id: second, room_id: null },
    ],
    required: true,
  };
  // Second already has this source; choose a new manual source for rollback.
  const origin = await qualityWrite(root, "check_add", {
    content: { ...content, title: "Ny felles prosjektliste" },
    required: false,
  });
  rollbackPayload.sources = [
    { kind: "project", id: origin.data.checks[0].id, scope_id: root },
  ];
  preview = await d("preview", rollbackPayload);
  const beforeCount = (await q(plan.units[2].id)).data.checks.length;
  await rejects(
    () =>
      d("apply", {
        ...rollbackPayload,
        basis: preview.basis,
        request_id: id(23004),
      }),
    "22023",
  );
  eq(
    (await q(plan.units[2].id)).data.checks.length,
    beforeCount,
    "Entire failed distribution rolls back",
  );
  await rejects(
    () => db.query("select * from bolig_private.quality_distribution_receipts"),
    "42501",
  );
}
