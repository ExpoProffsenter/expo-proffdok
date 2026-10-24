export default async function packageScenarios({
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
    request_id: id(9300),
    title: "QA scoped packages",
    reference: "QA-PACKAGE-SCOPES",
    buildings: [
      {
        name: "Bygg",
        building_type: "apartment",
        address: "Test 1",
        house_floors: 1,
        entrances: [{ address: "Test 1", counts: [2] }],
      },
    ],
  });
  const root = structure.root.id,
    unit = structure.units[0].id,
    second = structure.units[1].id,
    bad1 = id(9301),
    bad2 = id(9302);
  const catalog = async (action = "state", revision = null, payload = {}) =>
    (
      await db.query("select public.bolig_catalog($1,$2,$3,$4,$5) v", [
        firm,
        root,
        action,
        revision,
        payload,
      ])
    ).rows[0].v;
  const rooms = async (action = "list", revision = null, payload = {}) =>
    (
      await db.query("select public.bolig_rooms($1,$2,$3,$4,$5,$6) v", [
        firm,
        root,
        unit,
        action,
        revision,
        payload,
      ])
    ).rows[0].v;
  const scopes = async (
    action = "get",
    revision = null,
    payload = {},
    u = unit,
    c = firm,
  ) =>
    (
      await db.query(
        "select public.bolig_package_choices($1,$2,$3,$4,$5,$6) v",
        [c, root, u, action, revision, payload],
      )
    ).rows[0].v;
  const content = async (action = "get", revision = null, payload = {}) =>
    (
      await db.query("select public.bolig_room_content($1,$2,$3,$4,$5,$6) v", [
        firm,
        root,
        unit,
        action,
        revision,
        payload,
      ])
    ).rows[0].v;
  const order = async (
    action = "get",
    revision = null,
    choice = null,
    payload = {},
  ) =>
    (
      await db.query(
        "select public.bolig_order_draft($1,$2,$3,$4,$5,$6,$7) v",
        [firm, root, unit, action, revision, choice, payload],
      )
    ).rows[0].v;
  await rooms("save", 0, {
    id: bad1,
    type: "bathroom",
    name: "Bad 1",
    floor: "",
  });
  await rooms("save", 1, {
    id: bad2,
    type: "bathroom",
    name: "Bad 2",
    floor: "",
  });
  const line = (key, name, quantity = 1) => ({
    key,
    name,
    quantity,
    unit: "stk",
    sku: key.toUpperCase(),
    credit_cents: key === "basin" ? 10000 : null,
  });
  let cat = await catalog("package", 0, {
    name: "Felles",
    lines: [line("heater", "Bereder"), line("old", "Gammel servant")],
  });
  const common = cat.packages.find((p) => p.name === "Felles").id;
  cat = await catalog("package", cat.revision, {
    name: "Bad standard",
    lines: [line("basin", "Servant"), line("tap", "Batteri")],
  });
  const bath = cat.packages.find((p) => p.name === "Bad standard").id;
  cat = await catalog("option", cat.revision, {
    name: "Alternativ servant",
    sku: "ALT",
    quantity: 1,
    unit: "stk",
    price_cents: 18000,
    replace_key: "basin",
    deduct_base: true,
  });
  const alt = cat.options[0].id;
  cat = await catalog("option", cat.revision, {
    name: "Ekstra speil",
    sku: "MIRROR",
    quantity: 1,
    unit: "stk",
    price_cents: 30000,
    replace_key: "",
    deduct_base: false,
  });
  const mirror = cat.options.find((o) => o.name === "Ekstra speil").id;
  cat = await catalog("choose", cat.revision, {
    unit_id: unit,
    package_id: common,
    option_ids: [],
    choice_revision: 0,
  });
  await content("save", 0, {
    choice_revision: 1,
    rooms_revision: 2,
    allocations: [{ position: 1, room_id: bad1, quantity: 1 }],
  });
  const original = await order("save", 0, 1, { selected_positions: [1] });
  let s = await scopes();
  eq(s.components[0].scope_id, "common");
  eq(
    s.components[0].allocations.length,
    1,
    "Legacy manual allocation is visible without writes",
  );
  eq(s.selection, cat.selection);
  const payload = (scope, package_id, option_ids = [], remove = false) => ({
    scope_id: scope,
    package_id,
    option_ids,
    remove,
    catalog_revision: cat.revision,
    rooms_revision: 2,
  });
  const p1 = payload(bad1, bath, [alt]);
  let preview = await scopes("preview", 1, p1);
  eq(preview.proposal.components.length, 2);
  eq(
    preview.components.length,
    1,
    "Preview response keeps persisted and proposed components separate",
  );
  eq(preview.proposal.total_cents, 8000, "Room credit exactly once");
  eq((await scopes()).selection.revision, 1, "Preview never creates choice");
  eq((await order()).draft, original.draft, "Preview never alters order");
  s = await scopes("save", 1, p1);
  eq(s.selection.revision, 2);
  eq(s.selection.snapshot.format, "scoped-v1");
  eq(s.selection.snapshot.goods.length, 4);
  eq(
    s.components.find((p) => p.scope_id === "common").allocations.length,
    1,
    "Conversion preserves manual common allocations",
  );
  eq(
    s.selection.snapshot.goods
      .filter((g) => g.room_id === bad1)
      .some((g) => g.sku === "BASIN"),
    false,
    "Replaced standard is absent only in selected room",
  );
  eq((await order()).draft, original.draft, "Existing order still immutable");
  eq(
    (await order()).suggested_positions.includes(0),
    false,
    "Legacy excluded heater stays excluded after common key prefix",
  );
  await rejects(
    () =>
      catalog("choose", cat.revision, {
        unit_id: unit,
        package_id: common,
        option_ids: [],
        choice_revision: 2,
      }),
    "PT409",
  );
  await rejects(
    () =>
      content("save", 1, {
        choice_revision: 2,
        rooms_revision: 2,
        allocations: [],
      }),
    "PT409",
  );
  await rejects(() => scopes("save", 1, p1), "PT409");
  await rejects(
    () => scopes("save", 2, { ...p1, catalog_revision: 0 }),
    "PT409",
  );
  await rejects(() => scopes("save", 2, { ...p1, rooms_revision: 0 }), "PT409");
  await rejects(
    () => scopes("save", 2, { ...p1, scope_id: id(9399) }),
    "42501",
  );
  await rejects(() => scopes("save", 2, payload(bad2, common, [alt])), "22023");
  await rejects(
    () => scopes("save", 2, payload(bad2, bath, [mirror, mirror])),
    "22023",
  );
  s = await scopes("save", 2, payload(bad2, bath, [mirror]));
  eq(s.components.length, 3);
  eq(
    s.selection.snapshot.total_cents,
    38000,
    "Separate per-room option totals",
  );
  eq(
    s.selection.snapshot.goods
      .filter((g) => g.room_id === bad2)
      .some((g) => g.sku === "BASIN"),
    true,
    "Other room keeps original standard",
  );
  eq(
    s.selection.snapshot.goods.filter((g) => g.sku === "TAP").length,
    2,
    "Same package is reusable for two rooms",
  );
  eq(
    new Set(s.selection.snapshot.goods.map((g) => g.key)).size,
    s.selection.snapshot.goods.length,
    "Scope-qualified goods IDs are unique",
  );
  s = await scopes("save", 3, payload("common", common, []));
  eq(
    s.components.find((p) => p.scope_id === "common").allocations.length,
    1,
    "Unchanged common goods retain shares",
  );
  const frozen = s.components.find((p) => p.scope_id === bad2);
  cat = await catalog("package", cat.revision, {
    id: bath,
    name: "Bad standard",
    lines: [line("basin", "NY servant"), line("tap", "Batteri")],
  });
  s = await scopes("get");
  eq(
    s.components.find((p) => p.scope_id === bad2),
    frozen,
    "Catalog edits do not rewrite frozen room choices",
  );
  await rejects(() => scopes("save", 4, p1), "PT409");
  const refreshed = {
    ...payload(bad1, bath, [alt]),
    catalog_revision: cat.revision,
  };
  s = await scopes("save", 4, refreshed);
  eq(
    s.components.find((p) => p.scope_id === bad2),
    frozen,
    "Editing one room preserves other room",
  );
  const draft = await order();
  eq(
    draft.suggested_positions.includes(0),
    false,
    "Exclusion survives multiple choice revisions",
  );
  const saved = await order("save", 1, s.selection.revision, {
    selected_positions: draft.suggested_positions.filter(
      (i) =>
        !(
          s.selection.snapshot.goods[i].room_id === bad2 &&
          s.selection.snapshot.goods[i].sku === "TAP"
        ),
    ),
  });
  eq(
    saved.draft.snapshot.goods.some((g) => g.room_id === bad2),
    true,
    "Order contains room metadata",
  );
  eq(
    saved.draft.snapshot.goods.some((g) => g.sku === "HEATER"),
    false,
  );
  eq(
    saved.draft.snapshot.goods.some(
      (g) => g.room_id === bad1 && g.sku === "TAP",
    ),
    true,
    "Same SKU in another room stays selected",
  );
  eq(
    saved.draft.snapshot.goods.some(
      (g) => g.room_id === bad2 && g.sku === "TAP",
    ),
    false,
    "Room-specific exclusion is independent",
  );
  await rooms("archive", 2, { id: bad1, archived: true });
  await rejects(
    () => scopes("save", 5, { ...refreshed, rooms_revision: 3 }),
    "42501",
  );
  s = await scopes("save", 5, {
    ...refreshed,
    rooms_revision: 3,
    remove: true,
  });
  eq(
    s.components.some((p) => p.room_id === bad1),
    false,
    "Archived room component can be explicitly removed",
  );
  eq(
    s.components.find((p) => p.room_id === bad2),
    frozen,
  );
  const shifted = await order();
  eq(
    shifted.suggested_positions.some(
      (i) =>
        s.selection.snapshot.goods[i].room_id === bad2 &&
        s.selection.snapshot.goods[i].sku === "TAP",
    ),
    false,
    "Room exclusion survives removal of a different room and position shift",
  );
  eq(
    (await scopes("get", null, {}, second)).selection,
    null,
    "Other unit unaffected",
  );
  const r2 = "a" + id(9351).slice(1);
  await db.query("select public.bolig_rooms($1,$2,$3,'save',0,$4)", [
    firm,
    root,
    second,
    { id: r2, type: "bathroom", name: "Eget bad", floor: "" },
  ]);
  let roomOnly = await scopes(
    "save",
    0,
    {
      ...payload(r2.toUpperCase(), bath, []),
      catalog_revision: cat.revision,
      rooms_revision: 1,
    },
    second,
  );
  eq(
    roomOnly.components.length,
    1,
    "Room package works without any common package",
  );
  eq(roomOnly.components[0].scope_id, r2, "UUID spelling is canonical");
  roomOnly = await scopes(
    "save",
    1,
    {
      ...payload(r2, bath, []),
      catalog_revision: cat.revision,
      rooms_revision: 1,
    },
    second,
  );
  eq(
    roomOnly.components.length,
    1,
    "Canonical scope never duplicates one room",
  );
  roomOnly = await scopes(
    "save",
    2,
    {
      ...payload(r2, bath, [], true),
      catalog_revision: cat.revision,
      rooms_revision: 1,
    },
    second,
  );
  eq(
    roomOnly.selection.snapshot.goods,
    [],
    "Last room package can be removed explicitly",
  );
  cat = await catalog("package", cat.revision, {
    name: "Stor pakke",
    lines: Array.from({ length: 100 }, (_, i) =>
      line("large-" + i, "Vare " + i),
    ),
  });
  const large = cat.packages.find((p) => p.name === "Stor pakke").id;
  let sourceRev = 3,
    roomRev = 1;
  for (let i = 0; i < 11; i++) {
    const rid = id(9360 + i);
    await db.query("select public.bolig_rooms($1,$2,$3,'save',$4,$5)", [
      firm,
      root,
      second,
      roomRev,
      { id: rid, type: "other", name: "Rom " + i, floor: "" },
    ]);
    roomRev++;
    const request = {
      scope_id: rid,
      package_id: large,
      option_ids: [],
      catalog_revision: cat.revision,
      rooms_revision: roomRev,
    };
    if (i < 10) {
      roomOnly = await scopes("save", sourceRev, request, second);
      sourceRev++;
    } else
      await rejects(() => scopes("save", sourceRev, request, second), "22023");
  }
  eq(
    roomOnly.selection.snapshot.goods.length,
    1000,
    "One aggregate respects exact 1000-line cap",
  );
  const largeOrder = (
    await db.query(
      "select public.bolig_order_draft($1,$2,$3,'save',0,$4,$5) v",
      [
        firm,
        root,
        second,
        sourceRev,
        { selected_positions: Array.from({ length: 1000 }, (_, i) => i) },
      ],
    )
  ).rows[0].v;
  eq(
    largeOrder.draft.snapshot.goods.length,
    1000,
    "Order supports aggregate beyond previous 200-line limit",
  );
  await rejects(
    () =>
      scopes("save", 6, {
        scope_id: null,
        catalog_revision: cat.revision,
        rooms_revision: 3,
      }),
    "22023",
  );
  const cleared = await scopes("save", 6, {
    scope_id: "common",
    package_id: common,
    option_ids: [],
    catalog_revision: cat.revision,
    rooms_revision: 3,
    clear_allocations: true,
  });
  eq(
    cleared.components.find((p) => p.scope_id === "common").allocations,
    [],
    "Explicit clearing removes only old manual shares",
  );
  eq(
    cleared.components.find((p) => p.scope_id === "common").goods.length,
    2,
    "Common goods remain after clearing shares",
  );
  await actor(reader);
  eq((await scopes()).components.length, 2, "Reader can inspect all scopes");
  await rejects(
    () => scopes("preview", 6, { ...refreshed, rooms_revision: 3 }),
    "42501",
  );
  for (const fn of ["catalog_legacy", "room_content_legacy"])
    await rejects(
      () =>
        db.query(
          `select bolig_private.${fn}(${fn === "catalog_legacy" ? "$1,$2,'unit',null,jsonb_build_object('unit_id',$3::uuid)" : "$1,$2,$3,'get',null,'{}'"})`,
          [firm, root, unit],
        ),
      "42501",
    );
  await actor(outsider, other);
  await rejects(() => scopes(), "42501");
  await actor(manager);
  await rejects(() => scopes("get", null, {}, unit, other), "42501");
  await db.exec("reset role;set role anon");
  await rejects(() => scopes(), "42501");
  await actor(manager);
  await db.exec("reset role");
  eq(
    (
      await db.query(
        "select snapshot from bolig_private.choice_versions where unit_id=$1 and revision=1",
        [unit],
      )
    ).rows[0].snapshot,
    cat.history.find((h) => h.revision === 1)?.snapshot ||
      original.selection.snapshot,
    "Original history immutable",
  );
  await actor(manager);
  await call("archive", root, structure.root.revision, {
    kind: "root",
    id: root,
    archived: true,
  });
  await rejects(
    () => scopes("save", 6, { ...refreshed, rooms_revision: 3 }),
    "42501",
  );
}
