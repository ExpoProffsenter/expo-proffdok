import fs from "node:fs/promises";
export default async function ({
  db,
  call,
  actor,
  eq,
  rejects,
  firm,
  other,
  manager,
  reader,
  outsider,
}) {
  await db.exec(
    "reset role;create or replace function public.work_profile_company_profile(uuid) returns jsonb language sql as $$select jsonb_build_object('companyId',$1,'companyName','QA Bedrift','logoUrl','/expo-logo.png')$$;",
  );
  await db.exec(
    await fs.readFile(
      "supabase/migrations/20261023155220_bolig_resident_notice_composer.sql",
      "utf8",
    ),
  );
  await actor(manager);
  const rec = await call("create_plan", null, null, {
    request_id: crypto.randomUUID(),
    title: "QA notice composer",
    reference: "QA-NOTICE",
    buildings: [
      {
        name: "A",
        building_type: "apartment",
        address: "Testgata 1",
        house_floors: 1,
        entrances: [{ address: "Testgata 1", counts: [2] }],
      },
      {
        name: "B",
        building_type: "apartment",
        address: "Testgata 3",
        house_floors: 1,
        entrances: [{ address: "Testgata 3", counts: [1] }],
      },
    ],
  });
  const root = rec.root.id,
    units = rec.units.map((u) => u.id);
  const rpc = async (action = "get", payload = {}, unit = null, c = firm) =>
    (
      await db.query("select public.bolig_progress($1,$2,$3,$4,$5) v", [
        c,
        root,
        unit,
        action,
        payload,
      ])
    ).rows[0].v;
  const today = (
    await db.query("select (now() at time zone 'Europe/Oslo')::date::text d")
  ).rows[0].d;
  let state = await rpc();
  const payload = (mode = "paper", ids = units) => ({
    id: crypto.randomUUID(),
    request_id: crypto.randomUUID(),
    revision: state.revision,
    mode,
    unit_ids: ids,
    title: "Vannet stenges",
    body: "Vannet er stengt kl. 09–12. Takk for forståelsen.",
    start: today,
    end: today,
    publish_on: today,
    audience_label: "Hele prosjektet",
    contact: {
      name: "QA Prosjektleder",
      phone: "12345678",
      email: "qa@example.invalid",
    },
    recipient_basis: Object.fromEntries(
      state.units.map((u) => [u.id, u.notice_basis]),
    ),
  });
  let p = payload();
  state = await rpc("resident_notice", p);
  eq(
    state.tasks.length,
    0,
    "General notice never adds artificial progress work",
  );
  eq(
    state.notices.length,
    3,
    "One scoped portal notice per selected apartment",
  );
  eq(
    state.notices.every((n) => n.paper_ready && !n.valid && !n.published_at),
    true,
    "Paper needs no resident email or separate approval, never publishes",
  );
  eq(
    await rpc("resident_notice", p),
    state,
    "Lost reply replays exact campaign once",
  );
  eq(
    (await rpc("get", {}, units[0])).notices.length,
    1,
    "Apartment overview contains only its own notice",
  );
  eq(
    (await rpc("get", {}, units[0])).history.every(
      (h) => !JSON.stringify(h).includes(units[1]),
    ),
    true,
    "Campaign history is scoped to apartment",
  );
  await rejects(
    () =>
      rpc("resident_notice", payload("paper", [units[0], units[1]]), units[0]),
    "42501",
  );
  await rejects(() => rpc("resident_notice", payload("publish")), "22023");
  eq(
    (await rpc()).notices.length,
    3,
    "Invalid last recipient rolls back complete batch",
  );
  const old = p.id;
  p = { ...payload("draft"), replaces: old };
  state = await rpc("resident_notice", p);
  eq(
    state.notices.filter((n) => !n.withdrawn).length,
    3,
    "Edited draft supersedes old edition without duplicate active cards",
  );
  await db.exec("reset role");
  for (const u of units)
    await db.query(
      "update bolig_private.units set contact_name='QA Resident',contact_email='resident@example.invalid' where id=$1",
      [u],
    );
  await actor(manager);
  await rejects(() => rpc("resident_notice", payload("publish")), "PT409");
  state = await rpc();
  p = payload("publish");
  state = await rpc("resident_notice", p);
  eq(
    state.notices
      .filter((n) => n.group_id === p.id)
      .every((n) => n.valid && n.published_at),
    true,
    "Single publish action records consent and publication together",
  );
  eq(
    state.notices.find((n) => n.group_id === p.id).company_brand.companyName,
    "QA Bedrift",
    "Brand comes from authenticated company profile",
  );
  const digital = p.id;
  await db.exec("reset role");
  const token = crypto.randomUUID().replaceAll("-", "").repeat(2);
  await db.query(
    "insert into bolig_private.resident_portals(root_id,unit_id,created_by,token_hash,expires_at,revoked,contact_basis) select $1,$2,$3,sha256(convert_to($4,'UTF8')),now()+interval '10 days',false,md5(jsonb_build_array(contact_name,contact_email)::text) from bolig_private.units where id=$2",
    [root, units[0], manager, token],
  );
  await db.exec("set role anon");
  const portal = (await db.query("select public.bolig_portal($1) v", [token]))
    .rows[0].v;
  eq(
    portal.progress_notices.filter((n) => n.title === "Vannet stenges").length,
    1,
    "Resident sees its own general notice through existing portal",
  );
  eq(
    JSON.stringify(portal.progress_notices).includes(
      "resident@example.invalid",
    ),
    false,
    "Portal notice projection exposes no other recipients",
  );
  await actor(manager);
  await db.exec(
    "reset role;update bolig_private.progress_mail_settings set enabled=true,enabled_since=now()-interval '1 hour';select bolig_private.progress_tick();select bolig_private.progress_tick();",
  );
  eq(
    (
      await db.query(
        "select count(*)::int n from bolig_private.progress_deliveries where notice_id in(select id from bolig_private.progress_notices where group_id=$1)",
        [digital],
      )
    ).rows[0].n,
    3,
    "Existing worker queues each recipient once with no task ID",
  );
  await db.query(
    "update bolig_private.progress_deliveries set available_at=now()-interval '1 day' where notice_id in(select id from bolig_private.progress_notices where group_id=$1)",
    [digital],
  );
  eq(
    (
      await db.query(
        "select count(*)::int n from bolig_private.progress_deliveries d where notice_id in(select id from bolig_private.progress_notices where group_id=$1) and bolig_private.progress_delivery_valid(d)",
        [digital],
      )
    ).rows[0].n,
    3,
    "General deliveries are valid under the original transport switch",
  );
  // Worker reserve is service-only, with the existing per-attempt revalidation.
  await db.exec("reset role;set role service_role");
  let job;
  for (let i = 0; i < 30; i++) {
    const j = (
      await db.query("select public.bolig_progress_worker_reserve() v")
    ).rows[0].v;
    if (j?.kind === "resident" && j.title === "Vannet stenges") {
      job = j;
      break;
    }
    if (!j) break;
  }
  eq(!!job, true, "Existing worker reserves general notice");
  eq(
    job.brand.companyName,
    "QA Bedrift",
    "Company logo/identity accompanies mail job",
  );
  eq(
    (
      await db.query("select public.bolig_progress_worker_validate($1,$2) v", [
        job.id,
        job.attempt,
      ])
    ).rows[0].v,
    true,
    "Reserved general notice validates before sending",
  );
  await db.exec("reset role");
  await db.query(
    "update bolig_private.units set contact_email='new@example.invalid' where id=$1",
    [units[0]],
  );
  await db.query(
    "update bolig_private.units set contact_email='resident@example.invalid' where id=$1",
    [units[0]],
  );
  eq(
    (
      await db.query(
        "select bolig_private.progress_notice_valid(n) v from bolig_private.progress_notices n where group_id=$1 and unit_id=$2",
        [digital, units[0]],
      )
    ).rows[0].v,
    false,
    "Contact A-B-A does not revive old campaign capability",
  );
  await db.exec(
    "update bolig_private.progress_mail_settings set enabled=false;",
  );
  await actor(manager);
  state = await rpc();
  const tid = crypto.randomUUID();
  state = await rpc("save", {
    id: tid,
    request_id: crypto.randomUUID(),
    revision: state.revision,
    unit_id: units[1],
    title: "Legacy activity",
    owner_id: manager,
    planned_start: today,
    planned_end: today,
    status: "planned",
    required: false,
  });
  const sourceTask = state.tasks.find((t) => t.id === tid);
  await rejects(
    () =>
      rpc("resident_notice", {
        ...payload("paper", [units[1]]),
        source_task_id: tid,
        source_task_revision: sourceTask.revision - 1,
      }),
    "PT409",
  );
  const tomorrow = new Date(new Date(today + "T12:00:00Z").getTime() + 86400000)
    .toISOString()
    .slice(0, 10);
  state = await rpc("resident_notice", {
    ...payload("publish", [units[1]]),
    publish_on: tomorrow,
  });
  eq(
    state.notices
      .filter((n) => n.publish_on === tomorrow)
      .every((n) => n.valid && !n.published_at),
    true,
    "Future publication is planned in one action without publishing early",
  );
  const nid = crypto.randomUUID();
  state = await rpc("notice", {
    id: nid,
    task_id: tid,
    request_id: crypto.randomUUID(),
    revision: state.revision,
    body: "Legacy message preserved",
    publish_on: today,
  });
  const legacy = state.notices.find((n) => n.id === nid);
  state = await rpc("approve", {
    id: nid,
    request_id: crypto.randomUUID(),
    revision: state.revision,
    basis: legacy.basis,
    reviewed: true,
  });
  state = await rpc("publish", {
    id: nid,
    request_id: crypto.randomUUID(),
    revision: state.revision,
    reviewed: true,
  });
  eq(
    state.notices.find((n) => n.id === nid).valid,
    true,
    "Previously stored activity notices retain validation and publication",
  );
  await actor(reader);
  await rejects(() => rpc("resident_notice", payload()), "42501");
  await actor(outsider, other);
  await rejects(() => rpc(), "42501");
  await actor(manager);
  await rejects(() => rpc("get", {}, null, other), "42501");
  await rejects(
    () => db.query("select * from bolig_private.progress_notices"),
    "42501",
  );
  await db.exec("reset role");
  eq(
    (
      await db.query(
        "select prosecdef from pg_proc where oid='public.bolig_progress(uuid,uuid,uuid,text,jsonb)'::regprocedure",
      )
    ).rows[0].prosecdef,
    false,
    "Public gateway remains invoker",
  );
  await actor(manager);
}
