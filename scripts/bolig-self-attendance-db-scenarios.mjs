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
  // Preserve the production landing expression; this fixture has no HR schema.
  await db.exec(
    `create function public.get_my_personal_context() returns jsonb language plpgsql security definer set search_path='' as $$declare c uuid:=public.current_active_company_scope_id();u uuid:=auth.uid();ks boolean:=false;hr boolean:=false;begin return jsonb_build_object('personal_page',ks or hr or exists(select 1 where false),'other_right',false);end$$;`,
  );
  await db.exec(
    await fs.readFile(
      "supabase/migrations/20261024100223_bolig_named_self_attendance.sql",
      "utf8",
    ),
  );
  await actor(manager);
  const root = (
    await call("create_plan", null, null, {
      request_id: id(992000),
      title: "QA Egen tilstedeværelse",
      reference: "QA-SELF",
      buildings: [
        {
          name: "QA",
          building_type: "house",
          address: "",
          house_floors: 1,
          entrances: [{ address: "", counts: [1] }],
        },
      ],
    })
  ).root.id;
  const baseline = await call("get", root);
  const sql = async (name, args) =>
    (
      await db.query(
        `select public.${name}(${args.map((_, i) => "$" + (i + 1)).join(",")}) v`,
        args,
      )
    ).rows[0].v;
  const people = (a = "get", p = {}) =>
    sql("bolig_attendance_people", [firm, root, a, p]);
  const self = (a = "get", p = {}, c = firm) =>
    sql("bolig_my_attendance", [c, a, p]);
  const ue = (t, a = "get", p = {}) => sql("bolig_ue_attendance", [t, a, p]);
  let n = 992100;
  const req = (p) => ({ ...p, request_id: id(n++) });
  const token = "da".repeat(32),
    aid = id(992001);
  await sql("bolig_partners", [
    firm,
    root,
    "create",
    req({
      id: aid,
      token,
      name: "QA UE Person",
      email: "qa@ue.invalid",
      organisation: "QA UE",
      kind: "ue",
      days: 30,
      access_mode: "project",
      features: ["progress"],
      reviewed: true,
    }),
  ]);
  let s = await people("add", req({ user_id: reader, name: "QA Ansatt" }));
  const internal = s.people[0];
  const externalPayload = req({ access_id: aid });
  s = await people("add", externalPayload);
  const external = s.people.find((p) => p.access_id === aid);
  eq(
    (await people("add", externalPayload)).people.length,
    2,
    "exact manager replay",
  );
  await rejects(
    () => people("add", { ...externalPayload, name: "Changed" }),
    "PT409",
  );
  await rejects(
    () => people("add", req({ user_id: outsider, name: "Wrong company" })),
    "42501",
  );
  await rejects(
    () => people("add", req({ user_id: reader, name: "Duplicate" })),
    "22023",
  );
  await actor(reader);
  eq((await self()).entries, [], "disabled project hides card");
  await rejects(
    () => self("in", req({ id: internal.id, revision: 1, visit_id: null })),
    "42501",
  );
  await rejects(() => people(), "42501");
  await actor(manager);
  await sql("bolig_attendance", [
    firm,
    root,
    "enable",
    req({ enabled: true, revision: 0 }),
  ]);
  await actor(reader);
  s = await self();
  eq(s.entries.length, 1);
  eq(s.entries[0].visit, null);
  eq(s.entries[0].id, internal.id);
  eq((await sql("get_my_personal_context", [])).personal_page, true);
  eq((await sql("get_my_personal_context", [])).other_right, false);
  const enter = req({ id: internal.id, revision: 1, visit_id: null });
  s = await self("in", enter);
  const visit = s.entries[0].visit;
  eq(s.receipt_id, enter.request_id);
  eq(!!visit.id, true);
  eq(
    (await self("in", enter)).entries[0].visit.id,
    visit.id,
    "lost answer replays once",
  );
  await rejects(
    () => self("in", req({ id: internal.id, revision: 1, visit_id: null })),
    "PT409",
  );
  await rejects(
    () => self("in", req({ id: external.id, revision: 1, visit_id: null })),
    "42501",
  );
  await rejects(
    () => self("out", req({ id: internal.id, revision: 2, visit_id: id(1) })),
    "PT409",
  );
  const exit = req({ id: internal.id, revision: 2, visit_id: visit.id });
  s = await self("out", exit);
  eq(s.entries[0].visit, null);
  eq(
    (await self("in", enter)).entries[0].visit,
    null,
    "old replay never resurrects",
  );
  eq((await self("out", exit)).entries[0].revision, 3, "exit retry once");
  await actor(outsider, other);
  await rejects(() => self(), "42501");
  eq((await self("get", {}, other)).entries, []);
  await db.exec("reset role;set role anon");
  s = await ue(token);
  eq(s.entries.length, 1);
  eq(s.entries[0].id, external.id);
  eq(s.entries[0].name, "QA UE Person");
  eq(s.entries[0].user_id, undefined);
  eq(s.entries[0].visit, null);
  const ueIn = req({ id: external.id, revision: 1, visit_id: null });
  s = await ue(token, "in", ueIn);
  const ueVisit = s.entries[0].visit;
  eq((await ue(token, "in", ueIn)).entries[0].visit.id, ueVisit.id);
  await rejects(
    () =>
      ue(token, "in", req({ id: internal.id, revision: 3, visit_id: null })),
    "42501",
  );
  await rejects(
    () => db.query("select * from bolig_private.attendance_people"),
    "42501",
  );
  await rejects(() => ue("bad"), "42501");
  await ue(
    token,
    "out",
    req({ id: external.id, revision: 2, visit_id: ueVisit.id }),
  );
  await actor(manager);
  s = await sql("bolig_attendance", [firm, root, "get", {}]);
  eq(s.visits.length, 2);
  eq(s.events.length, 4);
  eq(
    s.events.some((x) => x.payload.source === "ue_link"),
    true,
  );
  eq(
    s.visits.every((x) => x.departed_at >= x.arrived_at),
    true,
  );
  eq(await call("get", root), baseline, "existing project unchanged");
  s = await people(
    "toggle",
    req({ id: internal.id, revision: 3, enabled: false }),
  );
  await actor(reader);
  eq((await self()).entries, []);
  await rejects(
    () => self("in", req({ id: internal.id, revision: 4, visit_id: null })),
    "42501",
  );
  await actor(manager);
  await sql("bolig_partners", [firm, root, "revoke", req({ id: aid })]);
  await db.exec("reset role;set role anon");
  await rejects(() => ue(token), "42501");
  await actor(manager);
  await people("toggle", req({ id: internal.id, revision: 4, enabled: true }));
  await actor(reader);
  s = await self("in", req({ id: internal.id, revision: 5, visit_id: null }));
  await actor(manager);
  await rejects(
    () =>
      people("toggle", req({ id: internal.id, revision: 6, enabled: false })),
    "22023",
  );
  await sql("bolig_attendance", [
    firm,
    root,
    "visit",
    req({
      id: s.entries[0].visit.id,
      name: internal.name,
      company: internal.company,
      arrived: "2026-01-15T07:00",
      departed: "2026-01-15T15:00",
      reason: "Prosjektleder rettet glemt utregistrering",
      revision: 6,
    }),
  ]);
  await actor(reader);
  eq(
    (await self()).entries[0].visit,
    null,
    "manual correction reflected on Min side",
  );
  await actor(manager);
}
