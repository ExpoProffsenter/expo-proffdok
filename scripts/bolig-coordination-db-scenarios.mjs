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
      "supabase/migrations/20261023110103_bolig_planning_groups_dialogue.sql",
      "utf8",
    ),
  );
  await actor(manager);
  const rec = await call("create_plan", null, null, {
    request_id: id(71000),
    title: "QA stammer og dialog",
    reference: "QA-COORD",
    buildings: [
      {
        name: "Stammebygg",
        building_type: "apartment",
        address: "Stammeveien 1",
        house_floors: 2,
        entrances: [{ address: "Stammeveien 1", counts: [2, 2] }],
      },
    ],
  });
  const root = rec.root.id,
    [a, b, c, d] = rec.units.map((u) => u.id);
  let seq = 71100,
    rev = 0;
  const rpc = async (action = "get", payload = {}, r = root, company = firm) =>
    (
      await db.query("select public.bolig_coordination($1,$2,$3,$4) v", [
        company,
        r,
        action,
        payload,
      ])
    ).rows[0].v;
  const cmd = async (action, payload = {}) => {
    const s = await rpc(action, {
      request_id: id(seq++),
      revision: rev,
      ...payload,
    });
    rev = s.revision;
    return s;
  };
  let s = await rpc();
  eq(s.messaging_enabled, false);
  eq(s.groups, []);
  eq(s.units.length, 4);
  eq(s.inbox, []);
  s = await cmd("group", { id: id(71200), name: "Stamme A", unit_ids: [a, c] });
  eq(s.groups[0].unit_ids.length, 2);
  eq(s.groups[0].name, "Stamme A");
  await rejects(
    () => cmd("group", { id: id(71201), name: "Stamme B", unit_ids: [a, b] }),
    "22023",
  );
  eq(
    (await rpc()).groups.length,
    1,
    "moving membership requires explicit confirmation",
  );
  s = await cmd("group", {
    id: id(71201),
    name: "Stamme B",
    unit_ids: [a, b],
    move_confirmed: true,
  });
  eq(s.groups.find((g) => g.name === "Stamme A").unit_ids.length, 1);
  eq(s.groups.find((g) => g.name === "Stamme B").unit_ids.length, 2);
  await rejects(
    () =>
      cmd("group", { id: id(71202), name: "Feil", unit_ids: [d, id(999999)] }),
    "42501",
  );
  eq(
    (await rpc()).groups.length,
    2,
    "invalid last unit rolls back whole group",
  );
  await rejects(
    () =>
      rpc("group", {
        request_id: id(seq++),
        revision: 0,
        id: id(71202),
        name: "Gammel",
        unit_ids: [d],
      }),
    "PT409",
  );
  await actor(reader);
  await rejects(
    () =>
      rpc("settings", {
        request_id: id(seq++),
        revision: rev,
        enabled: true,
        manager_id: manager,
      }),
    "42501",
  );
  await actor(outsider, other);
  await rejects(() => rpc(), "42501");
  await actor(manager);
  const settings = {
    request_id: id(seq++),
    revision: rev,
    enabled: true,
    manager_id: manager,
  };
  s = await rpc("settings", settings);
  rev = s.revision;
  eq(s.messaging_enabled, true);
  eq(await rpc("settings", settings), s, "exact replay before revision check");
  await rejects(
    () => rpc("settings", { ...settings, enabled: false }),
    "PT409",
  );
  s = await cmd("units", { unit_ids: [a], mode: "off" });
  eq(s.units.find((u) => u.id === a).enabled, false);
  eq(s.units.find((u) => u.id === b).enabled, true);
  s = await cmd("units", { unit_ids: [a], mode: "inherit" });
  eq(s.units.find((u) => u.id === a).enabled, true);
  await db.exec("reset role");
  await db.query(
    "update bolig_private.units set contact_name=$1,contact_email=$2 where id=$3",
    ["QA beboer", "resident@example.invalid", a],
  );
  const portal = (
    await db.query(
      "insert into bolig_private.resident_portals(root_id,unit_id,created_by,token_hash,expires_at,revoked,contact_basis) select $1,$2,$3,sha256(convert_to($4,'UTF8')),now()+interval '10 days',false,md5(jsonb_build_array(contact_name,contact_email)::text) from bolig_private.units where id=$2 returning id",
      [root, a, manager, "b".repeat(64)],
    )
  ).rows[0].id;
  const publicRpc = async (action = "get", payload = {}) =>
    (
      await db.query("select public.bolig_portal($1,$2,$3) v", [
        "b".repeat(64),
        action,
        payload,
      ])
    ).rows[0].v;
  const anon = () =>
    db.exec("reset role;select set_config('qa.user','',false);set role anon;");
  await anon();
  eq((await publicRpc()).messaging_enabled, true);
  let portalState = await publicRpc("message", {
    request_id: id(seq++),
    body: "Første spørsmål",
  });
  const first = portalState.events.find((e) => e.kind === "message").id;
  await actor(manager);
  s = await rpc();
  eq(s.inbox[0].unread, 1);
  eq(s.inbox[0].pending, 1);
  const internal = async (action = "get", payload = {}) =>
    (
      await db.query("select public.bolig_resident_portal($1,$2,$3,$4,$5) v", [
        firm,
        root,
        a,
        action,
        payload,
      ])
    ).rows[0].v;
  let ps = await internal();
  ps = await internal("read", {
    request_id: id(seq++),
    revision: ps.revision,
    through_id: first,
  });
  s = await rpc();
  eq(s.inbox[0].unread, 0);
  eq(s.inbox[0].pending, 1, "read does not mean handled");
  await anon();
  portalState = await publicRpc("message", {
    request_id: id(seq++),
    body: "Nytt spørsmål etter visning",
  });
  const second = portalState.events
    .filter((e) => e.kind === "message")
    .at(-1).id;
  await actor(manager);
  ps = await internal();
  ps = await internal("handled", {
    request_id: id(seq++),
    revision: ps.revision,
    through_id: first,
  });
  s = await rpc();
  eq(s.inbox[0].unread, 1);
  eq(s.inbox[0].pending, 1, "watermark cannot clear new/unseen messages");
  ps = await internal("reply", {
    request_id: id(seq++),
    revision: ps.revision,
    through_id: second,
    body: "Svar fra prosjektleder",
  });
  eq(
    (await rpc()).inbox.length,
    0,
    "reply handles only seen resident messages",
  );
  await anon();
  portalState = await publicRpc("message", {
    request_id: id(seq++),
    body: "Nytt svar fra beboeren",
  });
  await actor(manager);
  eq((await rpc()).inbox[0].unread, 1, "new resident reply reopens followup");
  s = await cmd("units", { unit_ids: [a], mode: "off" });
  eq(s.inbox[0].enabled, false);
  eq(s.inbox[0].pending, 1, "disabling retains outstanding followup");
  await anon();
  eq(
    (await publicRpc()).events.length >= 4,
    true,
    "history remains available when messaging off",
  );
  await rejects(
    () => publicRpc("message", { request_id: id(seq++), body: "Skal avvises" }),
    "22023",
  );
  await actor(manager);
  ps = await internal();
  await rejects(
    () =>
      internal("reply", {
        request_id: id(seq++),
        revision: ps.revision,
        body: "Skal avvises",
      }),
    "22023",
  );
  await rejects(
    () => db.query("select * from bolig_private.coordination_states"),
    "42501",
  );
  await rejects(
    () => db.query("select bolig_private.dialogue_enabled($1)", [a]),
    "42501",
  );
  s = await cmd("remove_group", { id: id(71200) });
  eq(s.groups.length, 1);
  eq(s.units.length, 4, "removing group preserves apartments");
  // Real notification queue: no history mail, burst coalescing, revalidation, retry
  // identity and personally scoped notification links. All fixtures are local.
  await db.exec("reset role");
  await db.exec(
    "update bolig_private.progress_tasks set archived=true;update bolig_private.progress_deliveries set status='accepted';update bolig_private.progress_mail_settings set enabled=true,enabled_since=clock_timestamp()",
  );
  await db.query(
    "update bolig_private.units set messaging_override=true where id=$1",
    [a],
  );
  await db.exec("select bolig_private.dialogue_tick()");
  eq(
    (
      await db.query(
        "select count(*)::int n from bolig_private.dialogue_deliveries",
      )
    ).rows[0].n,
    0,
    "enabling does not notify old messages",
  );
  const addEvent = async (sender, body) => {
    await db.exec("reset role");
    return (
      await db.query(
        "insert into bolig_private.resident_events(portal_id,kind,sender,contact_basis,body) select id,case when $2='resident' then 'message' else 'reply' end,$2,contact_basis,$3 from bolig_private.resident_portals where id=$1 returning id",
        [portal, sender, body],
      )
    ).rows[0].id;
  };
  const burst1 = await addEvent("resident", "Ny melding én");
  await db.exec("select bolig_private.dialogue_tick()");
  const burst2 = await addEvent("resident", "Ny melding to");
  await db.exec("select bolig_private.dialogue_tick()");
  eq(
    (
      await db.query(
        "select count(*)::int n from bolig_private.dialogue_deliveries d where bolig_private.dialogue_delivery_valid(d)",
      )
    ).rows[0].n,
    1,
    "only latest event in burst is sendable",
  );
  await db.exec(
    "update bolig_private.dialogue_deliveries set available_at=now()-interval '1 second';set role service_role",
  );
  const reserve = async () =>
    (await db.query("select public.bolig_progress_worker_reserve() v")).rows[0]
      .v;
  let job;
  for (let i = 0; i < 5; i++) {
    job = await reserve();
    if (job && !job.suppressed) break;
  }
  eq(job.kind, "manager_message");
  eq(job.to, "test-4@example.invalid");
  eq(job.body, undefined, "no message body in worker payload");
  let valid = (
    await db.query("select public.bolig_progress_worker_validate($1,$2) v", [
      job.id,
      job.attempt,
    ])
  ).rows[0].v;
  eq(valid, true);
  await actor(manager);
  let psMail = await internal();
  await internal("read", {
    request_id: id(seq++),
    revision: psMail.revision,
    through_id: burst2,
  });
  await db.exec("reset role;set role service_role");
  eq(
    (
      await db.query("select public.bolig_progress_worker_validate($1,$2) v", [
        job.id,
        job.attempt,
      ])
    ).rows[0].v,
    false,
    "read after reserve suppresses email",
  );
  await db.exec("reset role");
  await db.query(
    "update bolig_private.dialogue_deliveries set status='suppressed' where id=$1",
    [job.id],
  );
  await addEvent("manager", "Privat svar som aldri skal stå i e-post");
  await db.exec(
    "select bolig_private.dialogue_tick();update bolig_private.dialogue_deliveries set available_at=now()-interval '1 second';set role service_role",
  );
  job = await reserve();
  eq(job.kind, "resident_message");
  eq(job.to, "resident@example.invalid");
  eq(
    job.url.startsWith("https://expo-proffdok.app/bolig-kunde.html#portal="),
    true,
  );
  eq(job.body, undefined);
  await db.query("select public.bolig_progress_worker_finish($1,$2,false)", [
    job.id,
    job.attempt,
  ]);
  await db.exec(
    "reset role;update bolig_private.dialogue_deliveries set available_at=now()-interval '1 second';set role service_role",
  );
  const retry = await reserve();
  eq(retry.id, job.id, "lost provider reply retries stable delivery ID");
  eq(retry.url, job.url, "notification capability stable on retry");
  eq(retry.attempt !== job.attempt, true);
  const linkToken = new URL(job.url).hash.slice("#portal=".length);
  await anon();
  const linked = (
    await db.query("select public.bolig_portal($1) v", [linkToken])
  ).rows[0].v;
  eq(linked.id, portal, "notification link resolves same apartment");
  await db.exec("reset role");
  await db.query(
    "update bolig_private.units set messaging_override=false where id=$1",
    [a],
  );
  await db.exec("set role service_role");
  eq(
    (
      await db.query("select public.bolig_progress_worker_validate($1,$2) v", [
        retry.id,
        retry.attempt,
      ])
    ).rows[0].v,
    false,
    "disabled dialogue stops reserved mail",
  );
  await anon();
  await rejects(
    () => db.query("select public.bolig_portal($1)", [linkToken]),
    "42501",
  );
  await actor(manager);
  await rejects(
    () => db.query("select public.bolig_progress_worker_reserve()"),
    "42501",
  );
  await rejects(
    () => db.query("select * from bolig_private.dialogue_links"),
    "42501",
  );
  await db.exec(
    "reset role;update bolig_private.progress_mail_settings set enabled=false",
  );
  await actor(manager);
  await db.exec("reset role");
  await db.query(
    "update bolig_private.units set contact_email=$1 where id=$2",
    ["new@example.invalid", a],
  );
  await actor(manager);
  eq(
    (await rpc()).inbox.length,
    0,
    "old contact messages not exposed to new resident",
  );
  await anon();
  await rejects(() => publicRpc(), "42501");
  await actor(manager);
}
