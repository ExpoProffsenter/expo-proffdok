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
  await db.exec(
    await fs.readFile(
      "supabase/migrations/20261023181847_bolig_partner_access.sql",
      "utf8",
    ),
  );
  await actor(manager);
  const root = (await call("list")).roots.find(
    (r) => r.reference === "QA-PILOT-40-20261023",
  ).id;
  const rpc = async (action = "get", payload = {}, c = firm, r = root) =>
    (
      await db.query("select public.bolig_partners($1,$2,$3,$4) v", [
        c,
        r,
        action,
        payload,
      ])
    ).rows[0].v;
  const portal = async (token, action = "get", payload = {}) =>
    (
      await db.query("select public.bolig_partner_portal($1,$2,$3) v", [
        token,
        action,
        payload,
      ])
    ).rows[0].v;
  let s = await rpc();
  eq(s.partners, []);
  eq(s.tasks.length, 161);
  eq(s.orders.length, 1);
  const order = s.orders[0],
    task = s.tasks[0],
    unshared = s.tasks[1],
    token = "ab".repeat(32),
    secondToken = "cd".repeat(32);
  const payload = {
    request_id: id(98001),
    id: id(98002),
    token,
    name: "QA Partner",
    email: "qa@partner.invalid",
    organisation: "QA Firma",
    kind: "supplier",
    days: 30,
    order_ids: [order.id],
    task_ids: [task.id],
    reviewed: true,
    basis: { [order.id]: order.basis, [task.id]: task.basis },
  };
  await rejects(
    () => db.query("select * from bolig_private.partner_access"),
    "42501",
  );
  await rejects(
    () => rpc("create", { ...payload, task_ids: [id(999999)] }),
    "42501",
  );
  await rejects(() => rpc("create", { ...payload, basis: {} }), "PT409");
  await rejects(() => rpc("create", { ...payload, days: 91 }), "22023");
  await rejects(
    () => rpc("create", { ...payload, order_ids: [order.id, order.id] }),
    "22023",
  );
  await rejects(() => rpc("create", { ...payload, email: "bad" }), "22023");
  s = await rpc("create", payload);
  eq(s.created_id, payload.id);
  eq(s.partners.length, 1);
  eq(
    (await rpc("create", payload)).partners.length,
    1,
    "lost create response replays exact grant",
  );
  await rejects(() => rpc("create", { ...payload, name: "changed" }), "PT409");
  await actor(reader);
  eq((await rpc()).partners.length, 1);
  await rejects(
    () => rpc("revoke", { id: payload.id, request_id: id(98003) }),
    "42501",
  );
  await actor(outsider, other);
  await rejects(() => rpc(), "42501");
  await rejects(() => rpc("get", {}, other), "42501");
  await actor(manager);
  await db.exec("reset role");
  const before = (
    await db.query(
      "select jsonb_build_array((select to_jsonb(o) from bolig_private.purchase_orders o where id=$1),(select to_jsonb(t) from bolig_private.progress_tasks t where id=$2)) v",
      [order.id, task.id],
    )
  ).rows[0].v;
  await db.exec("select set_config('qa.user','',false);set role anon");
  let p = await portal(token);
  eq(p.orders.length, 1);
  eq(p.tasks.length, 1);
  eq(p.name, "QA Partner");
  eq("email" in p, false);
  eq("token_hash" in p, false);
  for (const word of [
    "unit_price",
    "margin",
    "contact_email",
    "contact_name",
    "owner_id",
    "note",
    "price",
    "created_by",
    "user_id",
  ])
    eq(
      JSON.stringify(p).includes('"' + word + '"'),
      false,
      "no " + word + " exposed",
    );
  eq(p.orders[0].goods[0].received, order.goods[0].received);
  eq(p.orders[0].delivery_address, order.delivery_address);
  await rejects(
    () => db.query("select * from bolig_private.partner_events"),
    "42501",
  );
  await rejects(
    () => db.query("select * from bolig_private.purchase_orders"),
    "42501",
  );
  await rejects(
    () => db.query("select * from bolig_private.progress_tasks"),
    "42501",
  );
  await rejects(
    () => db.query("select public.bolig_partners($1,$2)", [firm, root]),
    "42501",
  );
  await rejects(() => portal("00".repeat(32)), "42501");
  await rejects(
    () => portal(token, "respond", { kind: "task", target_id: unshared.id }),
    "42501",
  );
  await rejects(() => portal(token, "document", { id: order.id }), "42501");
  let answer = {
    request_id: id(98004),
    kind: "order",
    target_id: order.id,
    basis: order.basis,
    status: "confirmed",
    date: "2026-11-02",
    reference: "SUP-004",
    body: "QA leveranse",
  };
  await rejects(
    () => portal(token, "respond", { ...answer, basis: "old" }),
    "PT409",
  );
  await rejects(
    () => portal(token, "respond", { ...answer, date: "" }),
    "22023",
  );
  p = await portal(token, "respond", answer);
  eq(p.events.length, 1);
  eq(p.events[0].current, true);
  eq(p.events[0].promised_date, "2026-11-02");
  eq(p.events[0].reference, "SUP-004");
  eq(
    (await portal(token, "respond", answer)).events.length,
    1,
    "lost answer replay has no duplicate",
  );
  await rejects(
    () => portal(token, "respond", { ...answer, body: "changed" }),
    "PT409",
  );
  await portal(token, "respond", {
    ...answer,
    request_id: id(98005),
    kind: "task",
    target_id: task.id,
    basis: task.basis,
    status: "issue",
    date: "2026-11-03",
    body: "QA forsinkelse",
  });
  p = await portal(token);
  eq(p.events.length, 2);
  eq(p.events[0].status, "issue");
  await db.exec("reset role");
  const after = (
    await db.query(
      "select jsonb_build_array((select to_jsonb(o) from bolig_private.purchase_orders o where id=$1),(select to_jsonb(t) from bolig_private.progress_tasks t where id=$2)) v",
      [order.id, task.id],
    )
  ).rows[0].v;
  eq(
    after,
    before,
    "partner answer never changes plan, frozen order, receipt or supplier metadata",
  );
  await db.query(
    "update bolig_private.progress_tasks set planned_end=planned_end+1,revision=revision+1 where id=$1",
    [task.id],
  );
  await db.exec("set role anon");
  p = await portal(token);
  eq(
    p.events.find((e) => e.kind === "task").current,
    false,
    "changed basis keeps answer as history",
  );
  await rejects(
    () =>
      portal(token, "respond", {
        ...answer,
        request_id: id(98006),
        kind: "task",
        target_id: task.id,
        basis: task.basis,
      }),
    "PT409",
  );
  await actor(manager);
  s = await rpc();
  eq(s.partners[0].events.length, 2);
  eq(s.partners[0].events.find((e) => e.kind === "task").current, false);
  // second access sees only its own assigned task and no other partner's events
  const second = {
    ...payload,
    request_id: id(98007),
    id: id(98008),
    token: secondToken,
    order_ids: [],
    task_ids: [unshared.id],
    basis: { [unshared.id]: unshared.basis },
  };
  await rpc("create", second);
  await db.exec(
    "reset role;select set_config('qa.user','',false);set role anon",
  );
  p = await portal(secondToken);
  eq(p.orders.length, 0);
  eq(p.tasks.length, 1);
  eq(p.events.length, 0);
  await rejects(() => portal(secondToken, "respond", answer), "42501");
  await actor(manager);
  await rpc("revoke", { request_id: id(98009), id: payload.id });
  await db.exec(
    "reset role;select set_config('qa.user','',false);set role anon",
  );
  await rejects(() => portal(token), "42501");
  await rejects(() => portal(token, "respond", answer), "42501");
  eq((await portal(secondToken)).tasks.length, 1);
  await db.exec("reset role");
  await db.query(
    "update bolig_private.partner_access set expires_at=now()-interval '1 second' where id=$1",
    [second.id],
  );
  await db.exec("set role anon");
  await rejects(() => portal(secondToken), "42501");
  await db.exec("reset role");
  await db.query(
    "update bolig_private.partner_access set expires_at=now()+interval '1 day' where id=$1",
    [second.id],
  );
  await db.query("update bolig_private.roots set archived=true where id=$1", [
    root,
  ]);
  await db.exec("set role anon");
  await rejects(() => portal(secondToken), "42501");
  await db.exec("reset role");
  await db.query("update bolig_private.roots set archived=false where id=$1", [
    root,
  ]);
  await db.query(
    "update bolig_private.member_access set access_role='reader' where company_id=$1 and user_id=$2",
    [firm, manager],
  );
  await db.exec("set role anon");
  await rejects(() => portal(secondToken), "42501");
  await db.exec("reset role");
  await db.query(
    "update bolig_private.member_access set access_role='manager' where company_id=$1 and user_id=$2",
    [firm, manager],
  );
  await db.query(
    "update bolig_private.progress_tasks set archived=true where id=$1",
    [unshared.id],
  );
  await db.exec("set role anon");
  eq((await portal(secondToken)).tasks.length, 0);
  await rejects(
    () =>
      portal(secondToken, "respond", {
        ...answer,
        kind: "task",
        target_id: unshared.id,
      }),
    "42501",
  );
  await db.exec("reset role");
  await db.query(
    "update bolig_private.progress_tasks set archived=false where id=$1",
    [unshared.id],
  );
  await db.query(
    "update bolig_private.progress_tasks set planned_end=$2,revision=$3 where id=$1",
    [task.id, task.planned_end, task.revision],
  );
  await actor(manager);
  eq((await rpc()).partners.length, 2);
}
