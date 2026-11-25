export default async function customizationScenarios({
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
  const record = await call("create_plan", null, null, {
    request_id: id(16000),
    title: "QA Individual",
    reference: "QA-CUSTOM",
    buildings: [
      {
        name: "Bygg",
        building_type: "apartment",
        address: "QA gate 1",
        house_floors: 1,
        entrances: [{ address: "QA gate 1", counts: [2] }],
      },
    ],
  });
  const root = record.root.id,
    unit = record.units[0].id,
    second = record.units[1].id;
  const rpc = async (
    name,
    action = "get",
    revision = null,
    payload = {},
    u = unit,
    c = firm,
  ) =>
    (
      await db.query(`select public.${name}($1,$2,$3,$4,$5,$6) v`, [
        c,
        root,
        u,
        action,
        revision,
        payload,
      ])
    ).rows[0].v;
  const cat = async (action = "state", revision = null, payload = {}) =>
    (
      await db.query("select public.bolig_catalog($1,$2,$3,$4,$5) v", [
        firm,
        root,
        action,
        revision,
        payload,
      ])
    ).rows[0].v;
  let catalog = await cat("package", 0, {
    name: "Standard",
    sections: [],
    lines: [
      {
        key: "basin",
        name: "Servant",
        sku: "00123",
        quantity: 1,
        unit: "stk",
        credit_cents: null,
      },
      { key: "tap", name: "Batteri", sku: "00456", quantity: 1, unit: "stk" },
    ],
  });
  const pkg = catalog.packages[0].id;
  const basis = (s) => ({
    catalog_revision: s.revision,
    rooms_revision: s.rooms_revision,
  });
  for (const u of [unit, second]) {
    const s = await rpc("bolig_package_choices", "get", null, {}, u);
    await rpc(
      "bolig_package_choices",
      "save",
      0,
      { ...basis(s), scope_id: "common", package_id: pkg, option_ids: [] },
      u,
    );
  }
  let state = await rpc("bolig_unit_customization");
  const before = JSON.stringify(state.selection),
    catalogBefore = JSON.stringify(await cat());
  const payload = {
    ...basis(state),
    scope_id: "common",
    sections: [],
    lines: [
      {
        key: "basin",
        name: "Servant",
        sku: "00123",
        quantity: 2.5,
        unit: "stk",
      },
      {
        key: "extra",
        name: "Ekstra knagg",
        sku: "00002",
        quantity: 2,
        unit: "stk",
      },
    ],
    adjustment_cents: 15000,
    reason: "Avvik i denne leiligheten",
  };
  let preview = await rpc("bolig_unit_customization", "preview", 1, payload);
  eq(
    preview.proposal.goods[0].quantity,
    2.5,
    "Override preview changes quantity",
  );
  eq(
    JSON.stringify((await rpc("bolig_unit_customization")).selection),
    before,
    "Preview never writes",
  );
  state = await rpc("bolig_unit_customization", "save", 1, payload);
  eq(state.selection.revision, 2);
  eq(state.selection.snapshot.total_cents, 15000);
  eq(
    state.selection.snapshot.goods.map((g) => g.sku),
    ["00123", "00002"],
    "Replace/add/remove exact goods with leading zeros",
  );
  eq(
    JSON.stringify(await cat()),
    catalogBefore,
    "Shared catalog remains byte-for-byte unchanged",
  );
  eq(
    (await rpc("bolig_package_choices", "get", null, {}, second)).selection
      .snapshot.goods[0].quantity,
    1,
    "Another apartment remains unchanged",
  );

  eq(
    state.history.find((h) => h.revision === 1).snapshot.goods[0].quantity,
    1,
    "Historical choice remains immutable",
  );
  await rejects(
    () => rpc("bolig_unit_customization", "save", 1, payload),
    "PT409",
  );
  await rejects(
    () =>
      rpc("bolig_package_choices", "save", 2, {
        ...basis(state),
        scope_id: "common",
        package_id: pkg,
        option_ids: [],
      }),
    "PT409",
  );
  await rejects(
    () =>
      rpc("bolig_unit_customization", "preview", 2, {
        ...payload,
        lines: [{ ...payload.lines[0], quantity: -1 }],
      }),
    "22023",
  );
  await rejects(
    () =>
      rpc("bolig_unit_customization", "preview", 2, {
        ...payload,
        adjustment_cents: 1.5,
      }),
    "22023",
  );
  await rejects(
    () =>
      rpc("bolig_unit_customization", "preview", 2, {
        ...payload,
        reason: " ",
      }),
    "22023",
  );
  await rejects(
    () =>
      rpc("bolig_unit_customization", "preview", 2, {
        ...payload,
        scope_id: id(16999),
      }),
    "42501",
  );
  await rejects(
    () =>
      rpc("bolig_unit_customization", "preview", 2, {
        ...payload,
        lines: [payload.lines[0], payload.lines[0]],
      }),
    "22023",
  );
  await actor(reader);
  eq(
    (await rpc("bolig_unit_customization")).selection.revision,
    2,
    "Reader sees saved customized choice",
  );
  await rejects(
    () => rpc("bolig_unit_customization", "save", 2, payload),
    "42501",
  );
  await actor(outsider, other);
  await rejects(() => rpc("bolig_unit_customization"), "42501");
  await actor(manager);
  await rejects(
    () => rpc("bolig_unit_customization", "get", null, {}, unit, other),
    "42501",
  );
  const reset = {
    ...basis(state),
    scope_id: "common",
    reason: "Gjenopprett opprinnelig leveranse",
  };
  preview = await rpc("bolig_unit_customization", "reset_preview", 2, reset);
  eq(
    preview.proposal.goods.map((g) => g.sku),
    ["00123", "00456"],
  );
  state = await rpc("bolig_unit_customization", "reset", 2, reset);
  eq(state.selection.snapshot.total_cents, 0);
  eq(
    !!state.components[0].customization,
    false,
    "Reset removes override without rewriting historical revision",
  );
  eq(
    state.history.find((h) => h.revision === 2).snapshot.goods[0].quantity,
    2.5,
  );
  // An active prepared order blocks changes as strictly as an ordered delivery.
  const draft = (
    await db.query("select public.bolig_order_draft($1,$2,$3,$4,$5,$6,$7) v", [
      firm,
      root,
      unit,
      "save",
      0,
      3,
      { selected_positions: [0, 1] },
    ])
  ).rows[0].v;
  let delivery = (
    await db.query("select public.bolig_deliveries($1,$2,$3,$4,$5) v", [
      firm,
      root,
      unit,
      "settings",
      {
        request_id: id(16001),
        revision: 0,
        settings: { address: "QA gate", note: "" },
      },
    ])
  ).rows[0].v;
  delivery = (
    await db.query("select public.bolig_deliveries($1,$2,$3,$4,$5) v", [
      firm,
      root,
      unit,
      "create",
      {
        request_id: id(16002),
        revision: delivery.revision,
        draft_revision: draft.draft.revision,
        positions: [0, 1],
        reference: "QA",
        supplier: "QA",
        supplier_reference: "",
        requested_date: "",
        note: "",
        review: true,
      },
    ])
  ).rows[0].v;
  await rejects(
    () => rpc("bolig_unit_customization", "save", 3, payload),
    "PT409",
  );
  eq(
    (await rpc("bolig_unit_customization")).selection.revision,
    3,
    "Blocked write leaves choice untouched",
  );
  await rejects(
    () =>
      db.query(
        "select bolig_private.package_choices_standard($1,$2,$3,$4,$5,$6)",
        [firm, root, unit, "get", null, {}],
      ),
    "42501",
  );
  await db.exec("set local role anon");
  await rejects(() => rpc("bolig_unit_customization"), "42501");
  await actor(manager);
}
