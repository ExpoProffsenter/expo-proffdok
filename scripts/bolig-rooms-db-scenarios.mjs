// Run inside the existing foundation transaction and retain every prior assertion.
export default async function roomsScenarios({
  db,
  call,
  actor,
  eq,
  rejects,
  id,
  firm,
  other,
  admin,
  manager,
  reader,
  outsider,
}) {
  await db.exec("reset role");
  await db.query("update public.profiles set deactivated=false where id=$1", [
    reader,
  ]);
  await actor(admin);
  const access = await call("access");
  await call(
    "member",
    null,
    access.members.find((m) => m.user_id === reader).revision,
    { user_id: reader, role: "reader" },
  );
  await actor(manager);
  const plan = {
    request_id: id(9100),
    title: "QA rom",
    reference: "QA-ROOMS",
    buildings: [
      {
        name: "Bygg rom",
        building_type: "apartment",
        address: "Eksempelgata 1",
        house_floors: 1,
        entrances: [{ address: "Eksempelgata 1", counts: [2] }],
      },
    ],
  };
  const root = await call("create_plan", null, null, plan),
    u = root.units[0].id,
    u2 = root.units[1].id,
    r = root.root.id;
  const rpc = async (
    action = "list",
    rev = null,
    payload = {},
    unit = u,
    company = firm,
    rootId = r,
  ) =>
    (
      await db.query("select public.bolig_rooms($1,$2,$3,$4,$5,$6) v", [
        company,
        rootId,
        unit,
        action,
        rev,
        payload,
      ])
    ).rows[0].v;
  const before = await call("get", r),
    room = id(9101),
    room2 = id(9102);
  let state = await rpc();
  eq(state.rooms, [], "No implicit rooms");
  eq(state.revision, 0, "Independent room revision");
  state = await rpc("save", 0, {
    id: room,
    type: "bathroom",
    name: "Bad 1",
    floor: "",
  });
  eq(state.rooms[0].id, room);
  eq(state.revision, 1);
  state = await rpc("save", 1, {
    id: room2,
    type: "bathroom",
    name: "Bad 2",
    floor: "2. etasje",
  });
  eq(state.rooms.length, 2, "Repeated room type with separate names");
  state = await rpc("save", 2, {
    id: room,
    type: "bathroom",
    name: "Hovedbad",
    floor: "1. etasje",
  });
  eq(
    state.rooms.find((x) => x.id === room).name,
    "Hovedbad",
    "Stable ID after rename",
  );
  await rejects(
    () =>
      rpc("save", 2, {
        id: room,
        type: "bathroom",
        name: "Gammel verdi",
        floor: "",
      }),
    "PT409",
  );
  eq((await rpc()).revision, 3, "Conflict does not write");
  await rejects(
    () =>
      rpc("save", 3, {
        id: id(9103),
        type: "bathroom",
        name: " hovedbad ",
        floor: "",
      }),
    "23505",
  );
  await rejects(
    () => rpc("save", 3, { id: id(9103), type: "wrong", name: "X", floor: "" }),
    "22023",
  );
  await rejects(
    () => rpc("save", 3, { id: id(9103), type: "wc", name: " ", floor: "" }),
    "22023",
  );
  await rejects(
    () => rpc("save", 3, { id: id(9103), type: "wc", name: 5, floor: "" }),
    "22023",
  );
  await rejects(
    () =>
      rpc("save", 3, {
        id: id(9103),
        type: "wc",
        name: "X",
        floor: "x".repeat(41),
      }),
    "22023",
  );
  await rejects(
    () => rpc("archive", 3, { id: room, archived: "true" }),
    "22023",
  );
  await rejects(
    () =>
      rpc(
        "save",
        0,
        { id: room, type: "wc", name: "Foreign ID", floor: "" },
        u2,
      ),
    "42501",
  );
  state = await rpc("archive", 3, { id: room, archived: true });
  eq(state.rooms.find((x) => x.id === room).archived, true);
  await rejects(
    () => rpc("save", 4, { id: room, type: "bathroom", name: "X", floor: "" }),
    "22023",
  );
  state = await rpc("archive", 4, { id: room, archived: false });
  eq(
    state.rooms.find((x) => x.id === room).name,
    "Hovedbad",
    "Restore preserves name/id",
  );
  eq((await rpc("list", null, {}, u2)).rooms, [], "Other apartment unaffected");
  eq(
    await call("get", r),
    before,
    "Room writes do not alter structure, project links or contacts",
  );
  await actor(reader);
  eq((await rpc()).rooms.length, 2, "Reader can inspect rooms");
  await rejects(
    () => rpc("save", 5, { id: room, type: "wc", name: "Reader", floor: "" }),
    "42501",
  );
  await rejects(() => rpc("archive", 5, { id: room, archived: true }), "42501");
  for (const table of ["rooms", "room_states", "room_versions"])
    await rejects(
      () => db.query("select * from bolig_private." + table),
      "42501",
    );
  await actor(outsider, other);
  await rejects(() => rpc(), "42501");
  await rejects(() => rpc("list", null, {}, u, other), "42501");
  await actor(manager);
  await rejects(() => rpc("list", null, {}, u, other), "42501");
  await rejects(() => rpc("list", null, {}, id(9199)), "42501");
  await db.exec("reset role");
  eq(
    (
      await db.query(
        "select snapshot from bolig_private.room_versions where unit_id=$1 and revision=1",
        [u],
      )
    ).rows[0].snapshot[0].name,
    "Bad 1",
    "Prior name remains in immutable version",
  );
  eq(
    (
      await db.query(
        "select count(*)::int n from bolig_private.room_versions where unit_id=$1",
        [u],
      )
    ).rows[0].n,
    5,
    "Every successful mutation creates one version",
  );
  eq(
    (
      await db.query(
        "select bool_and(relrowsecurity) v from pg_class where oid in ('bolig_private.rooms'::regclass,'bolig_private.room_states'::regclass,'bolig_private.room_versions'::regclass)",
      )
    ).rows[0].v,
    true,
    "RLS on every new table",
  );
  await db.exec("set role anon");
  await rejects(() => rpc(), "42501");
  await actor(manager);
  let structure = await call("archive", r, before.root.revision, {
    kind: "root",
    id: r,
    archived: true,
  });
  eq((await rpc()).root_archived, true);
  await rejects(() => rpc("archive", 5, { id: room, archived: true }), "42501");
  structure = await call("archive", r, structure.root.revision, {
    kind: "root",
    id: r,
    archived: false,
  });
  structure = await call("archive", r, structure.root.revision, {
    kind: "block",
    id: structure.blocks[0].id,
    archived: true,
  });
  await rejects(() => rpc(), "42501");
  structure = await call("archive", r, structure.root.revision, {
    kind: "block",
    id: structure.blocks[0].id,
    archived: false,
  });
  eq((await rpc()).rooms.length, 2, "Room IDs survive parent archive/restore");
  // Verify room operations cannot change previously saved choice/order snapshots.
  await db.exec("reset role");
  const snapshots = (
    await db.query(
      "select coalesce(jsonb_agg(to_jsonb(x)),'[]') v from bolig_private.choice_versions x",
    )
  ).rows[0].v;
  const orders = (
    await db.query(
      "select coalesce(jsonb_agg(to_jsonb(x)),'[]') v from bolig_private.order_draft_versions x",
    )
  ).rows[0].v;
  eq(snapshots.length > 0, true, "Existing choice history is present");
  eq(orders.length > 0, true, "Existing order history is present");
  await actor(manager);
  await rpc("save", 5, {
    id: room,
    type: "bathroom",
    name: "Hovedbad",
    floor: "Kjeller",
  });
  await db.exec("reset role");
  eq(
    (
      await db.query(
        "select coalesce(jsonb_agg(to_jsonb(x)),'[]') v from bolig_private.choice_versions x",
      )
    ).rows[0].v,
    snapshots,
    "Choice history untouched",
  );
  eq(
    (
      await db.query(
        "select coalesce(jsonb_agg(to_jsonb(x)),'[]') v from bolig_private.order_draft_versions x",
      )
    ).rows[0].v,
    orders,
    "Order drafts untouched",
  );
}
