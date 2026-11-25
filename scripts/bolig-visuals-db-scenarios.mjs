import fs from "node:fs/promises";
export default async function scenarios({
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
      "supabase/migrations/20261023224653_bolig_project_visuals.sql",
      "utf8",
    ),
  );
  await actor(manager);
  const rec = await call("create_plan", null, null, {
    request_id: id(980000),
    title: "QA egne bilder",
    reference: "QA-VISUAL",
    buildings: [
      {
        name: "Bildebygg",
        building_type: "apartment",
        address: "Bildegata 1",
        house_floors: 2,
        entrances: [{ address: "Bildegata 1", counts: [2, 2] }],
      },
      {
        name: "Nabobygg",
        building_type: "house",
        address: "Bildegata 2",
        house_floors: 1,
        entrances: [{ address: "Bildegata 2", counts: [1] }],
      },
    ],
  });
  const root = rec.root.id,
    block = rec.blocks.find((b) => b.name === "Bildebygg").id,
    second = rec.blocks.find((b) => b.id !== block).id;
  const unit = rec.units.find(
    (u) =>
      rec.entrances.find((e) => e.id === u.entrance_id)?.block_id === block,
  ).id;
  const room = id(980001),
    room2 = id(980002),
    sheet = id(980003),
    plan = id(980004);
  let seq = 980100;
  const rpc = async (
    scope = block,
    action = "list",
    revision = null,
    payload = {},
    company = firm,
    rootId = root,
  ) =>
    (
      await db.query("select public.bolig_visuals($1,$2,$3,$4,$5,$6) v", [
        company,
        rootId,
        scope,
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
  await rooms("save", 0, {
    id: room,
    type: "bathroom",
    name: "Bad 1",
    floor: "1",
  });
  await rooms("save", 1, { id: room2, type: "wc", name: "WC 1", floor: "1" });
  const before = await call("get", root),
    beforeRooms = await rooms();
  const initial = await rpc();
  eq(initial.kind, "facade");
  eq(initial.sheets, []);
  eq(initial.targets.length, 4);
  eq((await rpc(unit)).targets.length, 2);
  const path = `${firm}/${root}/${block}/${id(980010)}.jpg`,
    path2 = `${firm}/${root}/${block}/${id(980011)}.png`,
    planPath = `${firm}/${root}/${unit}/${id(980012)}.webp`;
  const upload = (path) =>
    db.query(
      "insert into storage.objects(bucket_id,name) values('bolig-project-visuals',$1)",
      [path],
    );
  const access = async (path, writing = false) =>
    (
      await db.query("select public.bolig_visual_file_access($1,$2) v", [
        path,
        writing,
      ])
    ).rows[0].v;
  await upload(path);
  await upload(path2);
  await upload(planPath);
  eq(await access(path, true), true);
  const draft = {
    request_id: id(seq++),
    sheet_id: sheet,
    title: "Fasade nord",
    path,
    width: 1200,
    height: 800,
    archived: false,
    basis: initial.basis,
    markers: initial.targets.map((t, i) => ({
      id: t.id,
      x: 0.1 + i * 0.15,
      y: 0.3,
      w: 0.1,
      h: 0.1,
    })),
  };
  const saved = await rpc(block, "publish", 0, draft);
  eq(saved.receipt_revision, 1);
  eq(saved.sheets[0].current.markers, draft.markers);
  eq(saved.targets, initial.targets);
  eq(
    await call("get", root),
    before,
    "Image publish leaves structure, contacts and project links unchanged",
  );
  eq(
    await rooms(),
    beforeRooms,
    "Image publish leaves room revisions/history unchanged",
  );
  eq(
    (await rpc(block, "publish", 0, draft)).receipt_id,
    draft.request_id,
    "Lost acknowledgement uses same receipt",
  );
  eq(
    (await rpc(block, "history", null, { sheet_id: sheet })).history.length,
    1,
  );
  await rejects(
    () => rpc(block, "publish", 0, { ...draft, title: "Changed retry" }),
    "PT409",
  );
  await rejects(() => rpc(second, "publish", 0, draft), "PT409");
  const next = {
    ...draft,
    request_id: id(seq++),
    title: "Fasade sør",
    path: path2,
  };
  await rejects(() => rpc(block, "publish", 0, next), "PT409");
  eq((await rpc(block, "publish", 1, next)).receipt_revision, 2);
  const replay = await rpc(block, "publish", 0, draft);
  eq(replay.receipt_revision, 1);
  eq(
    replay.sheets[0].revision,
    2,
    "Replaying earlier receipt cannot roll back latest visual",
  );
  const variants = [
    [{ basis: "old" }, "PT409"],
    [{ path: planPath }, "42501"],
    [{ path: `${firm}/${root}/${block}/${id(980099)}.jpg` }, "42501"],
    [{ width: 0 }, "22023"],
    [{ height: 12001 }, "22023"],
    [{ width: 22.5 }, "22023"],
    [{ title: "" }, "22023"],
    [{ archived: "false" }, "22023"],
    [{ markers: [{ ...draft.markers[0], id: room }] }, "PT409"],
    [{ markers: [draft.markers[0], draft.markers[0]] }, "22023"],
    [{ markers: [{ ...draft.markers[0], x: -0.1 }] }, "22023"],
    [{ markers: [{ ...draft.markers[0], w: 2 }] }, "22023"],
    [{ markers: [{ ...draft.markers[0], w: 0 }] }, "22023"],
    [{ markers: [{ ...draft.markers[0], y: "0.2" }] }, "22023"],
  ];
  for (const [patch, code] of variants)
    await rejects(
      () =>
        rpc(block, "publish", 2, { ...next, request_id: id(seq++), ...patch }),
      code,
    );
  eq(
    (await rpc(block, "history", null, { sheet_id: sheet })).history.length,
    2,
    "Rejected changes create no visual versions",
  );
  eq(
    (
      await db.query(
        "update storage.objects set name=name||'x' where bucket_id='bolig-project-visuals' returning name",
      )
    ).rows,
    [],
  );
  eq(
    (
      await db.query(
        "delete from storage.objects where bucket_id='bolig-project-visuals' returning name",
      )
    ).rows,
    [],
  );
  const unitState = await rpc(unit),
    pd = {
      ...draft,
      request_id: id(seq++),
      sheet_id: plan,
      title: "1. etasje",
      path: planPath,
      basis: unitState.basis,
      markers: [{ id: room, x: 0.2, y: 0.2, w: 0.2, h: 0.15 }],
    };
  eq((await rpc(unit, "publish", 0, pd)).sheets[0].kind, "plan");
  const pd2 = {
    ...pd,
    request_id: id(seq++),
    sheet_id: id(980005),
    title: "2. etasje",
    markers: [{ id: room2, x: 0.4, y: 0.4, w: 0.2, h: 0.15 }],
  };
  eq(
    (await rpc(unit, "publish", 0, pd2)).sheets.length,
    2,
    "Several plan sheets are independent in one unit",
  );
  await rooms("save", 2, {
    id: room,
    type: "bathroom",
    name: "Bad hovedetasje",
    floor: "1",
  });
  await rejects(
    () => rpc(unit, "publish", 1, { ...pd, request_id: id(seq++) }),
    "PT409",
  );
  const renamed = await rpc(unit);
  eq(renamed.targets.find((t) => t.id === room).label, "Bad hovedetasje");
  eq(
    renamed.sheets.find((s) => s.id === plan).current.markers[0].id,
    room,
    "Renaming preserves stable marker binding",
  );
  const hide = { ...next, request_id: id(seq++), archived: true };
  eq((await rpc(block, "publish", 2, hide)).sheets[0].archived, true);
  const restore = { ...draft, request_id: id(seq++) };
  eq((await rpc(block, "publish", 3, restore)).sheets[0].revision, 4);
  const history = await rpc(block, "history", null, { sheet_id: sheet });
  eq(
    history.history.map((v) => v.revision),
    [4, 3, 2, 1],
  );
  eq(history.history[3].snapshot.path, path);
  await rejects(
    () => db.query("select * from bolig_private.visual_versions"),
    "42501",
  );
  await rejects(
    () => db.query("select * from bolig_private.visual_sheets"),
    "42501",
  );
  await actor(reader);
  eq((await rpc()).sheets[0].current.path, path);
  eq(await access(path), true);
  eq(await access(planPath), true);
  eq(await access(path, true), false);
  const staged = `${firm}/${root}/${block}/${id(980020)}.jpg`;
  await rejects(() => upload(staged), "42501");
  await rejects(
    () => rpc(block, "publish", 4, { ...draft, request_id: id(seq++) }),
    "42501",
  );
  await actor(manager);
  await upload(staged);
  await actor(reader);
  eq(
    await access(staged),
    false,
    "Reader cannot sign unpublished staged files",
  );
  await actor(outsider, other);
  await rejects(() => rpc(block), "42501");
  eq(await access(path), false);
  await rejects(
    () => upload(`${other}/${root}/${block}/${id(980021)}.jpg`),
    "42501",
  );
  await actor(manager);
  await rejects(() => rpc(block, "list", null, {}, other), "42501");
  eq(await access("malformed/path"), false);
  const liveRoot = await call("get", root);
  await call("archive", root, liveRoot.root.revision, {
    kind: "root",
    id: root,
    archived: true,
  });
  eq((await rpc()).root_archived, true);
  eq(await access(path), true);
  eq(await access(path, true), false);
  await rejects(
    () => rpc(block, "publish", 4, { ...draft, request_id: id(seq++) }),
    "42501",
  );
  await db.exec("reset role;set role anon");
  await rejects(() => rpc(), "42501");
  eq(
    (
      await db.query(
        "select * from storage.objects where bucket_id='bolig-project-visuals'",
      )
    ).rows,
    [],
  );
  await actor(manager);
  await db.exec("savepoint visual_revoke");
  await db.exec(
    `reset role;update bolig_private.member_access set access_role='none' where company_id='${firm}' and user_id='${manager}';set role authenticated`,
  );
  await rejects(() => rpc(), "42501");
  eq(await access(path), false);
  await db.exec(
    "rollback to savepoint visual_revoke;release savepoint visual_revoke",
  );
  await actor(manager);
}
