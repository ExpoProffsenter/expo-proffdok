export default async function contentScenarios({
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
  const project = await call("create_plan", null, null, {
    request_id: id(9200),
    title: "QA rominnhold",
    reference: "QA-CONTENT",
    buildings: [
      {
        name: "Bygg",
        building_type: "apartment",
        address: "Testgata 1",
        house_floors: 1,
        entrances: [{ address: "Testgata 1", counts: [2] }],
      },
    ],
  });
  const root = project.root.id,
    unit = project.units[0].id,
    second = project.units[1].id,
    room = id(9201),
    room2 = id(9202);
  const rpc = async (
    action = "get",
    revision = null,
    payload = {},
    u = unit,
    c = firm,
  ) =>
    (
      await db.query("select public.bolig_room_content($1,$2,$3,$4,$5,$6) v", [
        c,
        root,
        u,
        action,
        revision,
        payload,
      ])
    ).rows[0].v;
  const rooms = async (action, revision, payload) =>
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
  const catalog = async (action, revision, payload) =>
    (
      await db.query("select public.bolig_catalog($1,$2,$3,$4,$5) v", [
        firm,
        root,
        action,
        revision,
        payload,
      ])
    ).rows[0].v;
  await rooms("save", 0, {
    id: room,
    type: "bathroom",
    name: "Bad 1",
    floor: "",
  });
  await rooms("save", 1, {
    id: room2,
    type: "bathroom",
    name: "Bad 2",
    floor: "",
  });
  eq((await rpc()).selection, null, "No fabricated choice from room content");
  await rejects(
    () =>
      rpc("save", 0, {
        choice_revision: 0,
        rooms_revision: 2,
        allocations: [],
      }),
    "PT409",
  );
  let cat = await catalog("package", 0, {
    name: "To bad",
    lines: [
      {
        key: "basin",
        name: "Servant",
        sku: "S1",
        quantity: 2,
        unit: "stk",
        credit_cents: null,
      },
      {
        key: "rail",
        name: "Skinne",
        sku: "R1",
        quantity: 1.5,
        unit: "m",
        credit_cents: null,
      },
    ],
  });
  cat = await catalog("choose", cat.revision, {
    unit_id: unit,
    package_id: cat.packages[0].id,
    option_ids: [],
    choice_revision: 0,
  });
  const order = await db.query(
    "select public.bolig_order_draft($1,$2,$3,'save',0,1,$4) v",
    [firm, root, unit, { selected_positions: [1] }],
  );
  const originalChoice = cat.selection,
    originalOrder = order.rows[0].v.draft;
  const payload = {
    choice_revision: 1,
    rooms_revision: 2,
    allocations: [
      { position: 0, room_id: room, quantity: 1 },
      { position: 0, room_id: room2, quantity: 1 },
      { position: 1, room_id: room2, quantity: 0.75 },
    ],
  };
  let state = await rpc("save", 0, payload);
  eq(state.content.revision, 1);
  eq(
    state.content.allocations.length,
    3,
    "One line can be split between two rooms",
  );
  eq(
    state.selection,
    originalChoice,
    "Allocation never changes choice or prices",
  );
  eq(
    (
      await db.query("select public.bolig_order_draft($1,$2,$3) v", [
        firm,
        root,
        unit,
      ])
    ).rows[0].v.draft,
    originalOrder,
    "Order exclusions and revision untouched",
  );
  await rejects(() => rpc("save", 0, payload), "PT409");
  await rejects(
    () => rpc("save", 1, { ...payload, choice_revision: 0 }),
    "PT409",
  );
  await rejects(
    () => rpc("save", 1, { ...payload, rooms_revision: 1 }),
    "PT409",
  );
  for (const allocations of [
    [{ position: 0, room_id: room, quantity: 3 }],
    [
      { position: 0, room_id: room, quantity: 1 },
      { position: 0, room_id: room2, quantity: 1.001 },
    ],
    [{ position: 0, room_id: room, quantity: 0 }],
    [{ position: 0, room_id: room, quantity: 0.0001 }],
    [{ position: 0, room_id: room, quantity: "1" }],
    [{ position: 0.1, room_id: room, quantity: 1 }],
    [{ position: 2, room_id: room, quantity: 1 }],
    [
      { position: 0, room_id: room, quantity: 1 },
      { position: 0, room_id: room, quantity: 1 },
    ],
  ])
    await rejects(() => rpc("save", 1, { ...payload, allocations }), "22023");
  await rejects(
    () =>
      rpc("save", 1, {
        ...payload,
        allocations: [{ position: 0, room_id: id(9299), quantity: 1 }],
      }),
    "42501",
  );
  await rejects(() => rpc("save", 0, payload, second), "PT409");
  eq(
    (await rpc()).content.revision,
    1,
    "Rejected allocations do not create versions",
  );
  await rooms("save", 2, {
    id: room,
    type: "bathroom",
    name: "Hovedbad",
    floor: "",
  });
  await rejects(() => rpc("save", 1, payload), "PT409");
  state = await rpc("save", 1, { ...payload, rooms_revision: 3 });
  eq(
    state.content.allocations.find((a) => a.room_id === room).room_name,
    "Hovedbad",
    "Room names are fresh server data",
  );
  await rooms("archive", 3, { id: room, archived: true });
  await rejects(
    () => rpc("save", 2, { ...payload, rooms_revision: 4 }),
    "42501",
  );
  eq(
    (await rpc()).content.allocations.some((a) => a.room_id === room),
    true,
    "Archive does not silently discard saved contents",
  );
  state = await rpc("save", 2, {
    ...payload,
    rooms_revision: 4,
    allocations: [],
  });
  eq(state.content.allocations, [], "Explicit unassignment is permitted");
  cat = await catalog("choose", cat.revision, {
    unit_id: unit,
    package_id: cat.packages[0].id,
    option_ids: [],
    choice_revision: 1,
  });
  eq(
    (await rpc()).content.source_choice_revision,
    1,
    "Changed choice leaves previous allocation frozen",
  );
  await rejects(
    () => rpc("save", 3, { ...payload, rooms_revision: 4 }),
    "PT409",
  );
  await actor(reader);
  eq((await rpc()).content.revision, 3, "Reader can inspect content");
  await rejects(
    () =>
      rpc("save", 3, {
        choice_revision: 2,
        rooms_revision: 4,
        allocations: [],
      }),
    "42501",
  );
  await rejects(
    () => db.query("select * from bolig_private.room_content_versions"),
    "42501",
  );
  await actor(outsider, other);
  await rejects(() => rpc(), "42501");
  await actor(manager);
  await rejects(() => rpc("get", null, {}, unit, other), "42501");
  await db.exec("reset role");
  eq(
    (
      await db.query(
        "select allocations from bolig_private.room_content_versions where unit_id=$1 and revision=1",
        [unit],
      )
    ).rows[0].allocations.find((a) => a.room_id === room).room_name,
    "Bad 1",
    "Prior room name immutable",
  );
  eq(
    (
      await db.query(
        "select relrowsecurity from pg_class where oid='bolig_private.room_content_versions'::regclass",
      )
    ).rows[0].relrowsecurity,
    true,
  );
  await db.exec("set role anon");
  await rejects(() => rpc(), "42501");
  await actor(manager);
  await call("archive", root, project.root.revision, {
    kind: "root",
    id: root,
    archived: true,
  });
  await rejects(
    () =>
      rpc("save", 3, {
        choice_revision: 2,
        rooms_revision: 4,
        allocations: [],
      }),
    "42501",
  );
}
