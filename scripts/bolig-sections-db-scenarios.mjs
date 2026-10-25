export default async function sectionScenarios({
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
    request_id: id(11000),
    title: "QA package sections",
    reference: "QA-SECTIONS",
    buildings: [
      {
        name: "Blokk",
        address: "QA 1",
        building_type: "apartment",
        house_floors: 1,
        entrances: [{ address: "QA 1A", counts: [2] }],
      },
    ],
  });
  const root = structure.root.id,
    unit = structure.units[0].id,
    second = structure.units[1].id;
  const cat = async (
    action = "state",
    revision = null,
    payload = {},
    company = firm,
  ) =>
    (
      await db.query("select public.bolig_catalog($1,$2,$3,$4,$5) v", [
        company,
        root,
        action,
        revision,
        payload,
      ])
    ).rows[0].v;
  const choice = async (
    action = "get",
    revision = null,
    payload = {},
    u = second,
  ) =>
    (
      await db.query(
        "select public.bolig_package_choices($1,$2,$3,$4,$5,$6) v",
        [firm, root, u, action, revision, payload],
      )
    ).rows[0].v;
  const order = async (action = "get", rev = null, cr = null, payload = {}) =>
    (
      await db.query(
        "select public.bolig_order_draft($1,$2,$3,$4,$5,$6,$7) v",
        [firm, root, unit, action, rev, cr, payload],
      )
    ).rows[0].v;
  const sections = [
    { id: "tiles", name: "Fliser", description: "Gulv og vegg" },
    { id: "furniture", name: "Baderomsinnredning", description: "" },
  ];
  const line = (key, name, section_id = "") => ({
    key,
    name,
    section_id,
    sku: key.toUpperCase(),
    quantity: 1,
    unit: "stk",
    credit_cents: key === "basin" ? 5000 : null,
    image_url: "",
    product_url: "",
  });
  const base = {
    name: "Standard bad med avsnitt",
    sections,
    lines: [
      line("basin", "Servant", "furniture"),
      line("tile", "Flis", "tiles"),
    ],
  };
  let state = await cat("package", 0, base),
    pkg = state.packages[0];
  eq(pkg.sections, sections, "Persist ordered section names and descriptions");
  eq(
    pkg.lines.map((l) => l.key),
    ["tile", "basin"],
    "Server order matches section order",
  );
  eq(
    pkg.lines.map((l) => l.section_name),
    ["Fliser", "Baderomsinnredning"],
    "Frozen goods carry section labels",
  );
  for (const payload of [
    { ...base, sections: [{ id: "a", name: "" }] },
    { ...base, sections: [sections[0], sections[0]] },
    {
      ...base,
      sections: Array.from({ length: 31 }, (_, i) => ({
        id: "s" + i,
        name: "S" + i,
      })),
    },
    { ...base, lines: [line("orphan", "Feil", "unknown")] },
    { ...base, lines: [line("duplicate", "A"), line("duplicate", "B")] },
    { ...base, lines: [{ ...line("bad", "A"), quantity: 0 }] },
    { ...base, lines: [{ ...line("bad", "A"), quantity: 1.0001 }] },
    { ...base, lines: [{ ...line("bad", "A"), credit_cents: 1.5 }] },
    {
      ...base,
      lines: [{ ...line("bad", "A"), image_url: "http://bad.invalid" }],
    },
    { ...base, sections: null },
  ])
    await rejects(() => cat("package", state.revision, payload), "22023");
  eq((await cat()).revision, state.revision, "Rejected sections are atomic");
  const option = {
    name: "Dusj og møbel",
    sections: [
      { id: "shower", name: "Dusjvegger", description: "Komplett løsning" },
      { id: "storage", name: "Innredning", description: "" },
    ],
    lines: [
      line("wall", "Dusjvegg", "shower"),
      line("cabinet", "Møbel", "storage"),
    ],
    sku: "",
    quantity: 1,
    unit: "pakke",
    price_cents: 25000,
    replace_key: "basin",
    deduct_base: true,
  };
  state = await cat("option", state.revision, option);
  let opt = state.options[0];
  eq(opt.lines.length, 2, "One selectable option package has multiple goods");
  eq(opt.sections[0].description, "Komplett løsning");
  await rejects(
    () =>
      cat("option", state.revision, {
        ...option,
        id: opt.id,
        lines: [line("x", "Feil", "missing")],
      }),
    "22023",
  );
  await rejects(
    () => cat("option", state.revision, { ...option, id: opt.id, lines: [] }),
    "22023",
  );
  const { lines: omitLines, sections: omitSections, ...oldOption } = option;
  await rejects(
    () => cat("option", state.revision, { ...oldOption, id: opt.id }),
    "PT409",
  );
  const { sections: omitBaseSections, ...oldBase } = base;
  await rejects(
    () => cat("package", state.revision, { ...oldBase, id: pkg.id }),
    "PT409",
  );
  state = await cat("choose", state.revision, {
    unit_id: unit,
    package_id: pkg.id,
    option_ids: [opt.id],
    choice_revision: 0,
  });
  let saved = state.selection.snapshot;
  eq(
    saved.goods.map((g) => g.name),
    ["Flis", "Dusjvegg", "Møbel"],
    "Legacy choice expands every option product and removes replaced base line",
  );
  eq(saved.total_cents, 20000, "Package price less the single base deduction");
  eq(
    saved.goods.map((g) => g.section_name),
    ["Fliser", "Dusjvegger", "Innredning"],
  );
  eq(
    new Set(saved.goods.map((g) => g.key)).size,
    3,
    "Option goods have stable unique keys",
  );
  let draft = await order("save", 0, state.selection.revision, {
    selected_positions: [0, 2],
  });
  eq(
    draft.draft.snapshot.goods.map((g) => g.name),
    ["Flis", "Møbel"],
    "Order can exclude one product within a selected option package",
  );
  const frozen = JSON.stringify(saved);
  state = await cat("option", state.revision, {
    ...option,
    id: opt.id,
    sections: [
      { ...option.sections[1], name: "Oppbevaring" },
      option.sections[0],
    ],
  });
  eq(
    JSON.stringify(
      (await cat("unit", null, { unit_id: unit })).selection.snapshot,
    ),
    frozen,
    "Editing sections never rewrites historic choices",
  );
  state = await cat("choose", state.revision, {
    unit_id: unit,
    package_id: pkg.id,
    option_ids: [opt.id],
    choice_revision: state.selection?.revision || 1,
  });
  eq(
    state.selection.snapshot.goods.map((g) => g.name),
    ["Flis", "Møbel", "Dusjvegg"],
    "Reordering sections moves frozen goods in the next choice only",
  );
  draft = await order();
  eq(
    draft.suggested_positions,
    [0, 1],
    "Unchanged excluded product remains excluded after section reordering",
  );
  let scoped = await choice();
  const payload = {
    scope_id: "common",
    package_id: pkg.id,
    option_ids: [opt.id],
    catalog_revision: state.revision,
    rooms_revision: scoped.rooms_revision,
  };
  const preview = await choice("preview", 0, payload);
  eq(preview.proposal.goods.length, 3, "Scoped preview expands option package");
  eq((await choice()).selection, null, "Preview remains read-only");
  scoped = await choice("save", 0, payload);
  eq(
    scoped.selection.snapshot.goods.length,
    3,
    "Scoped save preserves every product",
  );
  eq(scoped.selection.snapshot.total_cents, 20000);
  eq(
    scoped.selection.snapshot.goods.every((g) => g.scope_id === "common"),
    true,
    "Scope stays attached to each expanded option good",
  );
  // Converting a pre-existing single product keeps its old good key for order exclusions.
  state = await cat("option", state.revision, {
    name: "Eldre enkeltvare",
    sku: "LEG",
    quantity: 2,
    unit: "stk",
    price_cents: 10001,
    replace_key: "",
    deduct_base: false,
  });
  const legacy = state.options.find((o) => o.name === "Eldre enkeltvare");
  state = await cat("option", state.revision, {
    ...legacy,
    sections: [],
    lines: [{ ...line("legacy", legacy.name), sku: "LEG", quantity: 2 }],
  });
  const newLegacy = state.options.find((o) => o.id === legacy.id);
  eq(
    newLegacy.price_cents,
    10001,
    "Legacy total is never divided or rounded on conversion",
  );
  await actor(reader);
  eq(
    (await cat()).options.find((o) => o.id === opt.id).lines.length,
    2,
    "Reader can see grouped content",
  );
  await rejects(() => cat("option", state.revision, option), "42501");
  await actor(outsider);
  await rejects(() => cat("state", null, {}, firm), "42501");
  await actor(manager);
  await rejects(() => cat("state", null, {}, other), "42501");
  await rejects(
    () => db.query("select bolig_private.catalog_content($1,true)", [base]),
    "42501",
  );
  await rejects(
    () => db.query("select bolig_private.option_goods($1)", [newLegacy]),
    "42501",
  );
}
