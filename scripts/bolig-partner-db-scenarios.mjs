import fs from "node:fs/promises";
import partnerQuality from "./bolig-partner-quality-db-scenarios.mjs";
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
  await db.exec(
    await fs.readFile(
      "supabase/migrations/20261023183331_bolig_partner_response_clock.sql",
      "utf8",
    ),
  );
  await db.exec(
    await fs.readFile(
      "supabase/migrations/20261023184654_bolig_partner_issuer_entitlement.sql",
      "utf8",
    ),
  );
  await db.exec(
    await fs.readFile(
      "supabase/migrations/20261023190621_bolig_partner_project_features.sql",
      "utf8",
    ),
  );
  await db.exec(
    await fs.readFile(
      "supabase/migrations/20261023193507_bolig_partner_quality_writes.sql",
      "utf8",
    ),
  );
  await db.exec(
    await fs.readFile(
      "supabase/migrations/20261023195824_bolig_quality_history_action.sql",
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
    "update bolig_private.partner_access set expires_at=clock_timestamp()-interval '1 millisecond' where id=$1",
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
    "delete from public.user_module_access where user_id=$1 and module_key='projects'",
    [manager],
  );
  await db.exec("set role anon");
  await rejects(() => portal(secondToken), "42501");
  await db.exec("reset role");
  await db.query(
    "insert into public.user_module_access(user_id,module_key) values($1,'projects')",
    [manager],
  );
  await db.exec("set role anon");
  eq(
    (await portal(secondToken)).tasks.length,
    1,
    "issuer entitlement is checked live without impersonation",
  );
  await db.exec("reset role");
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
  const ueToken = "ef".repeat(32),
    supplierToken = "12".repeat(32);
  const base = {
    access_mode: "project",
    request_id: id(98100),
    id: id(98101),
    token: ueToken,
    name: "QA UE",
    email: "ue@qa.invalid",
    organisation: "QA UE firma",
    kind: "ue",
    days: 30,
    features: ["progress", "checklists"],
    reviewed: true,
    supplier_name: "",
  };
  await rejects(() => rpc("create", { ...base, features: [] }), "22023");
  await rejects(() => rpc("create", { ...base, features: ["hr"] }), "22023");
  await rejects(
    () => rpc("create", { ...base, features: ["progress", "progress"] }),
    "22023",
  );
  await rejects(
    () => rpc("create", { ...base, features: ["orders"] }),
    "22023",
  );
  await rejects(
    () => rpc("create", { ...base, order_ids: [order.id] }),
    "22023",
  );
  s = await rpc("create", base);
  eq(s.created_id, base.id);
  eq(
    (await rpc("create", base)).partners.length,
    s.partners.length,
    "project create replay",
  );
  await db.exec(
    "reset role;select set_config('qa.user','',false);set role anon",
  );
  p = await portal(ueToken);
  eq(p.access_mode, "project");
  eq(p.unit_count, 40);
  eq(p.tasks.length, 161);
  eq(p.orders, []);
  eq(p.checklists.length, 1);
  eq(p.checklists[0].points[0].status, "Avvik");
  for (const key of [
    "by_name",
    "completed_by",
    "answers",
    "comment",
    "documents",
    "fdv",
    "values",
    "contact_email",
  ])
    eq(
      JSON.stringify(p.checklists).includes('"' + key + '"'),
      false,
      "checklist projection omits " + key,
    );
  await rejects(
    () => portal(ueToken, "respond", { ...answer, request_id: id(98102) }),
    "42501",
  );
  await rejects(
    () => portal(ueToken, "check_save", { id: p.checklists[0].id }),
    "42501",
  );
  await rejects(
    () => db.query("select public.bolig_quality($1,$2,$2)", [firm, root]),
    "42501",
  );
  // New apartment and new work automatically fall under a project function.
  await actor(manager);
  let rec = await call("get", root);
  rec = await call("entrance", root, rec.root.revision, {
    block_id: rec.blocks[0].id,
    address: "QA Future entrance",
    counts: [1],
  });
  const ent = rec.entrances.find((e) => e.address === "QA Future entrance");
  const newUnit = rec.units.find((u) => u.entrance_id === ent.id);
  const futureTask = id(98103),
    futureOrder = id(98104),
    otherOrder = id(98105);
  await db.exec("reset role");
  await db.query(
    "insert into bolig_private.progress_tasks(id,root_id,unit_id,title,owner_id,planned_start,planned_end,status) values($1,$2,$3,'QA future activity',$4,'2026-11-05','2026-11-06','planned')",
    [futureTask, root, newUnit.id, manager],
  );
  const supplier = (
    await db.query(
      "select snapshot->>'supplier' name from bolig_private.purchase_orders where id=$1",
      [order.id],
    )
  ).rows[0].name;
  for (const [oid, name] of [
    [futureOrder, supplier],
    [otherOrder, "QA other supplier"],
  ])
    await db.query(
      "insert into bolig_private.purchase_orders(id,root_id,unit_id,source_choice_revision,source_draft_revision,number,status,snapshot,created_by,ordered_at) select $1,root_id,$2,source_choice_revision,source_draft_revision,$3,'ordered',jsonb_set(snapshot,'{supplier}',to_jsonb($4::text)),created_by,ordered_at from bolig_private.purchase_orders where id=$5",
      [oid, newUnit.id, "QA-" + name, name, order.id],
    );
  await db.exec("select set_config('qa.user','',false);set role anon");
  p = await portal(ueToken);
  eq(p.unit_count, 41);
  eq(
    p.tasks.some((x) => x.id === futureTask),
    true,
    "new apartment/work included without assigning rows",
  );
  eq(
    (await portal(secondToken)).tasks.length,
    1,
    "old selected link remains narrow",
  );
  await actor(manager);
  const supplierGrant = {
    ...base,
    id: id(98106),
    request_id: id(98107),
    token: supplierToken,
    kind: "supplier",
    organisation: "QA Supplier",
    features: ["orders"],
    supplier_name: supplier,
  };
  await rpc("create", supplierGrant);
  await db.exec(
    "reset role;select set_config('qa.user','',false);set role anon",
  );
  p = await portal(supplierToken);
  eq(p.orders.length, 2);
  eq(
    p.orders.some((o) => o.id === futureOrder),
    true,
  );
  eq(
    p.orders.some((o) => o.id === otherOrder),
    false,
  );
  eq(p.tasks, []);
  eq(p.checklists, []);
  await rejects(
    () =>
      portal(supplierToken, "respond", {
        ...answer,
        target_id: otherOrder,
        basis: p.orders[0].basis,
        request_id: id(98108),
      }),
    "42501",
  );
  await rejects(
    () =>
      portal(supplierToken, "respond", {
        ...answer,
        kind: "task",
        target_id: futureTask,
        request_id: id(98109),
      }),
    "42501",
  );
  const source = p.orders.find((o) => o.id === order.id);
  const reply = { ...answer, basis: source.basis, request_id: id(98110) };
  await portal(supplierToken, "respond", reply);
  await actor(manager);
  s = await rpc();
  let grant = s.partners.find((x) => x.id === supplierGrant.id);
  const permission = {
    access_mode: "project",
    id: grant.id,
    request_id: id(98111),
    revision: grant.revision,
    features: ["progress"],
    supplier_name: "",
    reviewed: true,
  };
  s = await rpc("permissions", permission);
  eq(
    (await rpc("permissions", permission)).partners.find(
      (x) => x.id === grant.id,
    ).revision,
    s.partners.find((x) => x.id === grant.id).revision,
    "permission replay no extra revision",
  );
  await rejects(
    () =>
      rpc("permissions", {
        ...permission,
        request_id: id(98112),
        features: ["checklists"],
      }),
    "PT409",
  );
  await db.exec(
    "reset role;select set_config('qa.user','',false);set role anon",
  );
  p = await portal(supplierToken);
  eq(p.orders, []);
  eq(p.events, []);
  eq(p.tasks.length, 162);
  await rejects(
    () => portal(supplierToken, "respond", reply),
    "42501",
    "removed function checked before replay",
  );
  await actor(manager);
  await rpc("revoke", { id: base.id, request_id: id(98113) });
  await db.exec(
    "reset role;select set_config('qa.user','',false);set role anon",
  );
  await rejects(() => portal(ueToken), "42501");
  await actor(manager);
  await partnerQuality({
    db,
    actor,
    eq,
    rejects,
    id,
    firm,
    manager,
    root,
    rpc,
    portal,
  });
}
