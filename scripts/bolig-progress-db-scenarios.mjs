import fs from "node:fs/promises";
export default async function progressScenarios({
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
  await db.exec(
    `reset role;create schema if not exists vault;create table vault.decrypted_secrets(id uuid primary key,decrypted_secret text);create function vault.create_secret(s text,n text,d text) returns uuid language plpgsql as $$declare i uuid:=gen_random_uuid();begin insert into vault.decrypted_secrets values(i,s);return i;end$$;create schema if not exists extensions;create function extensions.gen_random_bytes(n integer) returns bytea language sql as $$select decode(repeat('ab',n),'hex')$$;create schema cron;create function cron.schedule(text,text,text) returns bigint language sql as $$select 1::bigint$$;`,
  );
  await db.exec(
    await fs.readFile(
      "supabase/migrations/20261022222308_bolig_progress_notices.sql",
      "utf8",
    ),
  );
  await db.exec(
    await fs.readFile(
      "supabase/migrations/20261022224451_bolig_progress_read_projection_alias.sql",
      "utf8",
    ),
  );
  await db.exec(
    "create table public.user_module_access(user_id uuid,module_key text,primary key(user_id,module_key));",
  );
  await db.query(
    "insert into public.user_module_access values($1,'projects'),($2,'projects')",
    [manager, reader],
  );
  await db.exec(
    await fs.readFile(
      "supabase/migrations/20261022225347_bolig_progress_recipient_module_access.sql",
      "utf8",
    ),
  );
  await actor(manager);
  const rec = await call("create_plan", null, null, {
    request_id: id(50000),
    title: "QA fremdrift",
    reference: "QA-PROGRESS",
    buildings: [
      {
        name: "Fremdriftsbygg",
        building_type: "apartment",
        address: "Plangata 1",
        house_floors: 1,
        entrances: [{ address: "Plangata 1", counts: [2] }],
      },
    ],
  });
  const root = rec.root.id,
    unit = rec.units[0].id,
    neighbor = rec.units[1].id,
    task = id(50001),
    second = id(50002),
    room = id(50003);
  let seq = 50100,
    rev = 0;
  const rpc = async (action = "get", payload = {}, u = unit, c = firm) => {
    const r = (
      await db.query("select public.bolig_progress($1,$2,$3,$4,$5) v", [
        c,
        root,
        u,
        action,
        payload,
      ])
    ).rows[0].v;
    rev = r.revision;
    return r;
  };
  const write = (a, p = {}, u = unit) =>
    rpc(a, { request_id: id(seq++), revision: rev, ...p }, u);
  const today = (
    await db.query("select (now() at time zone 'Europe/Oslo')::date::text d")
  ).rows[0].d;
  const base = {
    id: task,
    title: "Monter baderom",
    owner_id: manager,
    unit_id: unit,
    room_id: "",
    planned_start: today,
    planned_end: today,
    actual_start: "",
    actual_end: "",
    status: "planned",
    predecessor_id: "",
    required: true,
    note: "",
  };
  let s = await rpc();
  eq(s.tasks.length, 0, "Empty plan is not fabricated completed work");
  eq(s.mail_enabled, false, "Transport paused by default");
  s = await write("save", base);
  eq(
    s.tasks[0].status,
    "planned",
    "Task is stored as planned, separate from goods",
  );
  eq(s.revision, 1, "Root concurrency revision");
  let rid = id(seq++),
    attempt = {
      ...base,
      title: "Revidert arbeid",
      request_id: rid,
      revision: rev,
    };
  s = await rpc("save", attempt);
  eq(
    (await rpc("save", attempt)).revision,
    s.revision,
    "Lost response replay is exact",
  );
  await rejects(() => rpc("save", { ...attempt, title: "Other" }), "PT409");
  await rejects(
    () => rpc("save", { ...base, request_id: id(seq++), revision: 0 }),
    "PT409",
  );
  await rejects(() => write("save", { ...base, owner_id: outsider }), "42501");
  await rejects(() => write("save", { ...base, status: "done" }), "22023");
  await rejects(
    () => write("save", { ...base, planned_end: "2000-01-01" }),
    "22023",
  );
  await rejects(() => write("save", { ...base, room_id: id(99999) }), "42501");
  await rejects(
    () => write("save", { ...base, predecessor_id: task }),
    "22023",
  );
  s = await write("save", {
    ...base,
    id: second,
    title: "Sluttkontroll",
    predecessor_id: task,
  });
  eq(s.tasks.length, 2, "Linked second activity");
  await rejects(
    () => write("save", { ...base, predecessor_id: second }),
    "22023",
  );
  await rejects(
    () =>
      write("save", {
        ...base,
        id: second,
        title: "Sluttkontroll",
        predecessor_id: task,
        status: "working",
        actual_start: today,
      }),
    "22023",
  );
  s = await write("save", {
    ...base,
    status: "done",
    actual_start: today,
    actual_end: today,
  });
  eq(
    s.tasks.find((t) => t.id === task).status,
    "done",
    "Actual work dates required",
  );
  s = await write("save", {
    ...base,
    id: second,
    title: "Sluttkontroll",
    predecessor_id: task,
    status: "working",
    actual_start: today,
  });
  eq(
    s.tasks.find((t) => t.id === second).status,
    "working",
    "Completed predecessor unlocks start",
  );
  await rejects(() => write("save", { ...base, note: "Gjenåpne" }), "22023");
  await rejects(
    () => write("archive", { id: task, confirmed: true, reason: "Arkivere" }),
    "22023",
  );
  await actor(reader);
  s = await rpc();
  eq(s.tasks.length, 2, "Reader can inspect plan");
  await rejects(() => write("save", base), "42501");
  await actor(outsider, other);
  await rejects(() => rpc(), "42501");
  await actor(manager);
  await rejects(() => rpc("get", {}, neighbor, other), "42501");
  eq(
    (await rpc("get", {}, neighbor)).tasks.length,
    0,
    "Unit view never includes neighbor tasks",
  );
  s = await rpc("get", {}, null);
  eq(s.tasks.length, 2, "Project leader overview aggregates");
  s = await write(
    "save",
    { ...base, id: id(50004), title: "Felles boligaktivitet" },
    null,
  );
  eq(s.unit_id, null, "Project write returns project scope, not mutated unit");
  eq(s.tasks.length, 3, "Project write retains aggregate view");
  // Completion source includes unperformed required work and preserves all earlier checks.
  await db.exec("reset role");
  let source = (
    await db.query("select bolig_private.completion_source($1,$2,$3) v", [
      firm,
      root,
      unit,
    ])
  ).rows[0].v;
  eq(
    source.issues.some((i) => i.includes("Fremdrift: Sluttkontroll")),
    true,
    "Required work blocks handover",
  );
  await db.query(
    "insert into bolig_private.rooms(id,unit_id,root_id,type,name) values($1,$2,$3,$4,$5)",
    [room, unit, root, "bathroom", "Bad"],
  );
  await actor(manager);
  s = await rpc();
  const n1 = id(50010);
  s = await write("notice", {
    id: n1,
    task_id: task,
    body: "Vi kommer for å arbeide på badet.",
    publish_on: today,
  });
  let n = s.notices.find((n) => n.id === n1);
  eq(n.valid, false, "Draft is not approval");
  await rejects(() => write("publish", { id: n1, reviewed: true }), "PT409");
  await db.exec("reset role");
  await db.query(
    "update bolig_private.units set contact_name=$2,contact_email=$3 where id=$1",
    [unit, "QA Beboer", "qa@example.invalid"],
  );
  await actor(manager);
  eq((await rpc()).notices.length, 1, "Plain unit GET retains saved notice");
  eq(
    (await rpc("get", {}, null)).notices.length,
    1,
    "Project GET retains notice after reload",
  );
  s = await rpc();
  // Changing contact after draft invalidates approval; immutable editions must be replaced.
  await rejects(
    () => write("approve", { id: n1, basis: n.basis, reviewed: true }),
    "PT409",
  );
  const n2 = id(50011);
  s = await write("notice", {
    id: n2,
    task_id: task,
    body: "Vi kommer for å arbeide på badet.",
    publish_on: today,
  });
  n = s.notices.find((n) => n.id === n2);
  s = await write("approve", { id: n2, basis: n.basis, reviewed: true });
  eq(s.notices.find((n) => n.id === n2).valid, true, "Exact basis approved");
  s = await write("publish", { id: n2, reviewed: true });
  eq(
    !!s.notices.find((n) => n.id === n2).published_at,
    true,
    "Explicit approved portal publication",
  );
  await db.exec("reset role");
  const portal = id(50012);
  await db.query(
    "insert into bolig_private.resident_portals(id,root_id,unit_id,created_by,contact_basis) select $1,$2,id,$4,md5(jsonb_build_array(contact_name,contact_email)::text) from bolig_private.units where id=$3",
    [portal, root, unit, manager],
  );
  let pub = (
    await db.query(
      "select bolig_private.portal_state(p) v from bolig_private.resident_portals p where id=$1",
      [portal],
    )
  ).rows[0].v;
  eq(
    pub.progress_notices.length,
    1,
    "Only approved published exact unit appears in portal",
  );
  eq(
    JSON.stringify(pub.progress_notices).includes("owner_id"),
    false,
    "Public projection has no staff data",
  );
  // Mail queue uses current recipients, generations, attempt fences and bounded retries.
  eq(
    (await db.query("select public.bolig_progress_worker_reserve() v")).rows[0]
      .v,
    null,
    "Paused queue cannot send",
  );
  await db.exec(
    "update bolig_private.progress_mail_settings set enabled=true,enabled_since=now()-interval '1 day';select bolig_private.progress_tick();",
  );
  let deliveries = (
    await db.query("select * from bolig_private.progress_deliveries")
  ).rows;
  eq(
    deliveries.filter((d) => d.kind === "resident").length,
    1,
    "One approved resident mail job",
  );
  eq(
    deliveries.filter((d) => d.kind === "owner").length,
    2,
    "Only unfinished owners receive due tasks",
  );
  await db.exec("select bolig_private.progress_tick()");
  await actor(manager);
  s = await rpc();
  eq(s.deliveries.length, 3, "GET projects queued delivery statuses");
  await db.exec("reset role");
  eq(
    (
      await db.query(
        "select count(*)::int n from bolig_private.progress_deliveries",
      )
    ).rows[0].n,
    3,
    "Collector deduplicates",
  );
  const j = (await db.query("select public.bolig_progress_worker_reserve() v"))
    .rows[0].v;
  eq(!!j.id, true, "Service reserve has attempt");
  eq(
    (
      await db.query("select public.bolig_progress_worker_validate($1,$2) v", [
        j.id,
        j.attempt,
      ])
    ).rows[0].v,
    true,
    "Fresh canonical validation",
  );
  eq(
    (
      await db.query(
        "select public.bolig_progress_worker_finish($1,$2,true) v",
        [j.id, id(99998)],
      )
    ).rows[0].v,
    false,
    "Wrong attempt cannot finish",
  );
  eq(
    (
      await db.query(
        "select public.bolig_progress_worker_finish($1,$2,false) v",
        [j.id, j.attempt],
      )
    ).rows[0].v,
    true,
    "Uncertain result stays pending for same-ID retry",
  );
  await actor(manager);
  s = await rpc();
  s = await write("save", {
    ...base,
    title: "Endret planlagt arbeid",
    status: "done",
    actual_start: today,
    actual_end: today,
  });
  eq(
    s.notices.find((n) => n.id === n2).valid,
    false,
    "Relevant task change invalidates publication",
  );
  await db.exec("reset role");
  pub = (
    await db.query(
      "select bolig_private.portal_state(p) v from bolig_private.resident_portals p where id=$1",
      [portal],
    )
  ).rows[0].v;
  eq(
    pub.progress_notices.length,
    0,
    "Outdated notice is not served as current",
  );
  eq(
    (
      await db.query(
        "select bolig_private.progress_delivery_valid(d) v from bolig_private.progress_deliveries d where kind=$1",
        ["resident"],
      )
    ).rows[0].v,
    false,
    "Queued resident email stops after basis change",
  );
  await actor(manager);
  s = await rpc();
  const future = "2030-01-01",
    n3 = id(50013);
  s = await write("notice", {
    id: n3,
    task_id: task,
    body: "Varsel for senere publisering",
    publish_on: future,
  });
  n = s.notices.find((n) => n.id === n3);
  s = await write("approve", { id: n3, basis: n.basis, reviewed: true });
  await rejects(() => write("publish", { id: n3, reviewed: true }), "PT409");
  s = await write("withdraw", { id: n3 });
  eq(
    s.notices.find((n) => n.id === n3).withdrawn,
    true,
    "Withdrawn notice remains historical",
  );
  // Scheduled publication uses the same approved basis. Contact/access changes stop it.
  await actor(manager);
  s = await rpc();
  const scheduled = id(50020);
  s = await write("notice", {
    id: scheduled,
    task_id: task,
    body: "Godkjent publisering fra planen",
    publish_on: today,
  });
  n = s.notices.find((n) => n.id === scheduled);
  s = await write("approve", { id: scheduled, basis: n.basis, reviewed: true });
  await db.exec("reset role;select bolig_private.progress_tick()");
  eq(
    !!(
      await db.query(
        "select published_at from bolig_private.progress_notices where id=$1",
        [scheduled],
      )
    ).rows[0].published_at,
    true,
    "Approved scheduled notice publishes through worker tick",
  );
  await db.query(
    "update bolig_private.units set contact_email=$2 where id=$1",
    [unit, "new-contact@example.invalid"],
  );
  eq(
    (
      await db.query(
        "select bolig_private.progress_notice_valid(n) v from bolig_private.progress_notices n where id=$1",
        [scheduled],
      )
    ).rows[0].v,
    false,
    "Contact replacement invalidates scheduled approval",
  );
  eq(
    (
      await db.query(
        "select count(*)::int n from bolig_private.progress_deliveries d where kind='resident' and bolig_private.progress_delivery_valid(d)",
      )
    ).rows[0].n,
    0,
    "Contact replacement suppresses all previous recipient jobs",
  );
  await db.query(
    "update bolig_private.member_access set access_role='none' where company_id=$1 and user_id=$2",
    [firm, manager],
  );
  eq(
    (
      await db.query(
        "select count(*)::int n from bolig_private.progress_deliveries d where kind='owner' and bolig_private.progress_delivery_valid(d)",
      )
    ).rows[0].n,
    0,
    "Revoked owner access stops pending mail",
  );
  await db.query(
    "update bolig_private.member_access set access_role='manager' where company_id=$1 and user_id=$2",
    [firm, manager],
  );
  eq(
    (
      await db.query(
        "select has_function_privilege('anon','bolig_private.completion_source(uuid,uuid,uuid)','execute') v",
      )
    ).rows[0].v,
    false,
    "New completion wrapper remains private",
  );
  await actor(manager);
  s = await rpc();
  await rejects(
    () =>
      write("save", {
        ...base,
        id: id(50030),
        status: "done",
        actual_start: "2030-01-01",
        actual_end: "2030-01-01",
      }),
    "22023",
  );
  await actor(reader);
  await rejects(
    () => db.query("select public.bolig_progress_worker_reserve()"),
    "42501",
  );
  await rejects(
    () => db.query("select * from bolig_private.progress_tasks"),
    "42501",
  );
  await rejects(
    () => db.query("select bolig_private.progress_tick()"),
    "42501",
  );
  await db.exec("reset role;set role anon");
  await rejects(() => rpc(), "42501");
  await db.exec("reset role");
  eq(
    (
      await db.query(
        "select count(*)::int n from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='bolig_private' and c.relname like 'progress_%' and c.relkind='r' and not c.relrowsecurity",
      )
    ).rows[0].n,
    0,
    "Every private progress table has RLS",
  );
  await db.exec("reset role");
  eq(
    (
      await db.query("select bolig_private.progress_member($1,$2) v", [
        firm,
        manager,
      ])
    ).rows[0].v,
    true,
    "Recipient module baseline is active",
  );
  await db.query(
    "delete from public.user_module_access where user_id=$1 and module_key='projects'",
    [manager],
  );
  eq(
    (
      await db.query("select bolig_private.progress_member($1,$2) v", [
        firm,
        manager,
      ])
    ).rows[0].v,
    false,
    "Revoked projects entitlement removes recipient",
  );
  eq(
    (
      await db.query(
        "select count(*)::int n from bolig_private.progress_deliveries d where kind='owner' and bolig_private.progress_delivery_valid(d)",
      )
    ).rows[0].n,
    0,
    "Module revocation suppresses pending owner deliveries",
  );
  await db.query(
    "insert into public.user_module_access values($1,'projects')",
    [manager],
  );
  await db.exec(
    "update bolig_private.progress_mail_settings set enabled=false",
  );
  await actor(manager);
}
