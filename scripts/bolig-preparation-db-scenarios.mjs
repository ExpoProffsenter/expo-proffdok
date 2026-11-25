export default async function preparationScenarios({
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
  await actor(manager);
  const structure = await call("create_plan", null, null, {
    request_id: id(9700),
    title: "QA samlet klargjøring",
    reference: "QA-PREPARE",
    buildings: [
      {
        name: "Blokk A",
        address: "QA gate 10",
        building_type: "apartment",
        house_floors: 2,
        entrances: [
          { address: "QA gate 10A", counts: [2, 2] },
          { address: "QA gate 10B", counts: [2] },
        ],
      },
    ],
  });
  const root = structure.root.id,
    first = structure.units[0],
    second = structure.units[1];
  const rpc = async (action = "get", payload = {}, company = firm) =>
    (
      await db.query("select public.bolig_prepare($1,$2,$3,$4) v", [
        company,
        root,
        action,
        payload,
      ])
    ).rows[0].v;
  let state = await rpc();
  eq(state.units.length, 6, "Preparation returns all units");
  eq(state.templates, []);
  eq(
    state.unit_states.length,
    6,
    "Preparation returns unit revision summaries",
  );
  let request = 0;
  const envelope = (kind, data, basis = state.basis, intent = "preview") => ({
    kind,
    data,
    basis,
    intent,
    ...(intent === "preview" ? {} : { request_id: id(9800 + request++) }),
  });
  const save = async (kind, data) => {
    state = await rpc();
    const preview = await rpc("preview", envelope(kind, data));
    const payload = envelope(kind, data, state.basis, "save");
    const result = await rpc("save", payload);
    return { result, payload, preview };
  };
  const rows = [
    { id: first.id, number: second.number, official_number: "H0101" },
    { id: second.id, number: first.number, official_number: "H0102" },
  ];
  let before = await call("get", root);
  let p = await rpc("preview", envelope("numbering", { rows }));
  eq(p.proposal.length, 2);
  eq(
    (await call("get", root)).units,
    before.units,
    "Preview does not number units",
  );
  const numbered = await save("numbering", { rows });
  eq(numbered.result.affected, 2);
  state = await rpc();
  eq(state.units.find((u) => u.id === first.id).number, second.number);
  eq(state.units.find((u) => u.id === first.id).official_number, "H0101");
  eq(
    state.basis,
    numbered.result.basis,
    "Returned basis includes committed changes",
  );
  eq((await rpc("save", numbered.payload)).replayed, true);
  eq((await rpc()).basis, state.basis, "Replay does not increment revisions");
  await rejects(
    () =>
      rpc("save", { ...numbered.payload, data: { rows: rows.slice(0, 1) } }),
    "PT409",
  );
  await rejects(
    () =>
      rpc(
        "preview",
        envelope("numbering", { rows: [{ ...rows[0], number: first.number }] }),
      ),
    "23505",
  );
  await rejects(
    () => rpc("preview", envelope("numbering", { rows: [rows[0], rows[0]] })),
    "42501",
  );
  await rejects(
    () =>
      rpc(
        "preview",
        envelope("numbering", { rows: [{ ...rows[0], number: "" }] }),
      ),
    "22023",
  );
  await rejects(
    () =>
      rpc(
        "preview",
        envelope("numbering", {
          rows: [{ ...rows[0], official_number: "H0102" }],
        }),
      ),
    "23505",
  );
  await rejects(
    () =>
      rpc(
        "preview",
        envelope("numbering", { rows: [rows[0]] }, before.basis || {}),
      ),
    "PT409",
  );
  const block = state.blocks[0],
    en = state.entrances.find((e) => e.block_id === block.id);
  let building = {
    id: block.id,
    name: "Blokk Nord",
    address: "Ny gate 10",
    building_type: "apartment",
    house_floors: 3,
    entrance_id: en.id,
    entrance_address: "Ny gate 10A",
    counts: [2],
  };
  p = await rpc("preview", envelope("building", building));
  eq(p.proposal[0].hidden, en.counts.length > 1 ? 2 : 0);
  eq(p.proposal[0].added, 0);
  await save("building", building);
  state = await rpc();
  eq(state.blocks.find((b) => b.id === block.id).name, "Blokk Nord");
  eq(
    state.units.find((u) => u.id === first.id).number,
    second.number,
    "Stable identity and edited number survive resize",
  );
  building = { ...building, counts: [2, 2] };
  const grown = await save("building", building);
  eq(grown.result.proposal[0].restored, en.counts.length > 1 ? 2 : 0);
  await rejects(
    () =>
      rpc(
        "preview",
        envelope(
          "building",
          { ...building, building_type: "house" },
          grown.result.basis,
        ),
      ),
    "22023",
  );
  state = await rpc();
  await rejects(
    () => rpc("preview", envelope("building", { ...building, counts: [0] })),
    "22023",
  );
  // Fresh packages are project-owned; bulk never copies data from another root.
  let cat = (
    await db.query("select public.bolig_catalog($1,$2) v", [firm, root])
  ).rows[0].v;
  cat = (
    await db.query("select public.bolig_catalog($1,$2,$3,$4,$5) v", [
      firm,
      root,
      "package",
      cat.revision,
      {
        name: "Bad standard",
        lines: [
          {
            key: "tap",
            name: "Servantbatteri",
            sku: "123",
            quantity: 1,
            unit: "stk",
            credit_cents: null,
            image_url: "",
            product_url: "",
          },
        ],
      },
    ])
  ).rows[0].v;
  const pkg = cat.packages[0].id;
  let definition = {
    rooms: [
      {
        key: id(9701),
        name: "Bad 1",
        type: "bathroom",
        floor: "",
        package_id: pkg,
      },
      {
        key: id(9702),
        name: "Bad 2",
        type: "bathroom",
        floor: "2",
        package_id: pkg,
      },
    ],
    common_package_id: pkg,
  };
  let template = {
    id: id(9703),
    name: "To bad og fellespakke",
    definition,
    unit_ids: [first.id, second.id],
    include_existing: false,
  };
  state = await rpc();
  let templatePayload = envelope(
    "template",
    template,
    state.basis,
    "template_save",
  );
  let savedTemplate = await rpc("template_save", templatePayload);
  eq(savedTemplate.affected, 1);
  eq((await rpc("template_save", templatePayload)).replayed, true);
  state = await rpc();
  eq(state.templates[0].definition, definition);
  await rejects(
    () => rpc("preview", envelope("template", template, cat.basis || {})),
    "PT409",
  );
  const pre = await rpc("preview", envelope("template", template));
  eq(
    pre.proposal.map((p) => p.new_rooms),
    [2, 2],
  );
  eq(
    pre.proposal.map((p) => p.new_packages),
    [3, 3],
  );
  eq(
    (await rpc()).unit_states.find((s) => s.unit_id === first.id).rooms,
    0,
    "Template preview creates no rooms",
  );
  const applied = await save("template", template);
  eq(applied.result.affected, 2);
  state = await rpc();
  eq(state.unit_states.find((s) => s.unit_id === first.id).rooms, 2);
  eq(state.unit_states.find((s) => s.unit_id === first.id).choice, 3);
  eq((await rpc("save", applied.payload)).replayed, true);
  let scopes = (
    await db.query("select public.bolig_package_choices($1,$2,$3) v", [
      firm,
      root,
      first.id,
    ])
  ).rows[0].v;
  eq(scopes.components.length, 3);
  eq(scopes.selection.snapshot.goods.length, 3);
  eq(
    new Set(scopes.selection.snapshot.goods.map((g) => g.key)).size,
    3,
    "Same SKU has distinct scopes",
  );
  let order = (
    await db.query("select public.bolig_order_draft($1,$2,$3,$4,$5,$6,$7) v", [
      firm,
      root,
      first.id,
      "save",
      0,
      scopes.selection.revision,
      { selected_positions: [1, 2] },
    ])
  ).rows[0].v;
  const oldOrder = order.draft,
    oldComponents = scopes.components;
  state = await rpc();
  p = await rpc("preview", envelope("template", template));
  eq(
    p.proposal.map((p) => p.status),
    ["skipped", "skipped"],
    "Existing units skipped by default",
  );
  const additive = { ...template, include_existing: true };
  p = await rpc("preview", envelope("template", additive));
  eq(
    p.proposal.map((p) => p.status),
    ["unchanged", "unchanged"],
  );
  const extended = {
    ...additive,
    definition: {
      ...definition,
      rooms: [
        ...definition.rooms,
        {
          key: id(9704),
          name: "Teknisk rom",
          type: "technical",
          floor: "",
          package_id: pkg,
        },
      ],
    },
  };
  await save("template", extended);
  scopes = (
    await db.query("select public.bolig_package_choices($1,$2,$3) v", [
      firm,
      root,
      first.id,
    ])
  ).rows[0].v;
  eq(
    scopes.components.filter((c) =>
      oldComponents.some((o) => o.scope_id === c.scope_id),
    ),
    oldComponents,
    "Existing frozen components untouched",
  );
  order = (
    await db.query("select public.bolig_order_draft($1,$2,$3) v", [
      firm,
      root,
      first.id,
    ])
  ).rows[0].v;
  eq(order.draft, oldOrder, "Bulk leaves existing order immutable");
  eq(order.selection.snapshot.goods.length, 4);
  const archived = scopes.rooms.find((r) => r.name === "Bad 1");
  await db.query("select public.bolig_rooms($1,$2,$3,$4,$5,$6)", [
    firm,
    root,
    first.id,
    "archive",
    scopes.rooms_revision,
    { id: archived.id, archived: true },
  ]);
  state = await rpc();
  p = await rpc("preview", envelope("template", extended));
  eq(
    p.proposal.find((p) => p.id === first.id).status,
    "review",
    "Archived same-name room is never revived implicitly",
  );
  await rejects(
    () =>
      rpc(
        "preview",
        envelope("template", { ...template, unit_ids: [first.id, first.id] }),
      ),
    "22023",
  );
  await rejects(
    () =>
      rpc(
        "preview",
        envelope("template", {
          ...template,
          definition: {
            rooms: [{ ...definition.rooms[0], package_id: id(9997) }],
          },
        }),
      ),
    "22023",
  );
  await rejects(
    () =>
      rpc(
        "preview",
        envelope("template", {
          ...template,
          definition: {
            ...definition,
            rooms: [
              definition.rooms[0],
              { ...definition.rooms[1], name: " bad 1 " },
            ],
          },
        }),
      ),
    "23505",
  );
  // Stale root/room/catalog/template snapshots all reject; failed batches roll back.
  const stale = state.basis;
  await rpc(
    "template_save",
    envelope(
      "template",
      { ...template, name: "Endret mal" },
      state.basis,
      "template_save",
    ),
  );
  await rejects(
    () => rpc("preview", envelope("template", template, stale)),
    "PT409",
  );
  state = await rpc();
  const current = await call("get", root);
  const fresh = current.units.find(
    (u) => !u.archived && !template.unit_ids.includes(u.id),
  );
  const beforeFresh = state.unit_states.find((s) => s.unit_id === fresh.id);
  await rejects(
    () =>
      rpc(
        "save",
        envelope(
          "template",
          { ...template, unit_ids: [fresh.id, id(9998)] },
          state.basis,
          "save",
        ),
      ),
    "42501",
  );
  eq(
    (await rpc()).unit_states.find((s) => s.unit_id === fresh.id),
    beforeFresh,
    "Invalid late target rolls back earlier work",
  );
  await actor(reader);
  eq((await rpc()).context.role, "reader");
  await rejects(() => rpc("preview", envelope("template", template)), "42501");
  await actor(outsider, other);
  await rejects(() => rpc(), "42501");
  await actor(manager);
  await rejects(() => rpc("get", {}, other), "42501");
  await rejects(
    () => db.query("select * from bolig_private.room_templates"),
    "42501",
  );
  await rejects(
    () => db.query("select * from bolig_private.preparation_receipts"),
    "42501",
  );
  await db.exec("reset role;set role anon");
  await rejects(() => rpc(), "42501");
  await actor(manager);
}
