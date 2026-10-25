export default async function deliveryScenarios({
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
  const built = await call("create_plan", null, null, {
    request_id: id(13000),
    title: "QA orders and receipts",
    reference: "QA-DELIVERY",
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
  const root = built.root.id,
    unit = built.units[0].id,
    second = built.units[1].id;
  const cat = async (action = "state", rev = null, payload = {}) =>
    (
      await db.query("select public.bolig_catalog($1,$2,$3,$4,$5) v", [
        firm,
        root,
        action,
        rev,
        payload,
      ])
    ).rows[0].v;
  const order = async (action = "get", rev = null, cr = null, payload = {}) =>
    (
      await db.query(
        "select public.bolig_order_draft($1,$2,$3,$4,$5,$6,$7) v",
        [firm, root, unit, action, rev, cr, payload],
      )
    ).rows[0].v;
  let n = 13100;
  const raw = async (action = "get", payload = {}, u = unit, c = firm) =>
    (
      await db.query("select public.bolig_deliveries($1,$2,$3,$4,$5) v", [
        c,
        root,
        u,
        action,
        payload,
      ])
    ).rows[0].v;
  let state = await raw();
  const command = async (action, payload = {}) => {
    state = await raw(action, {
      revision: state.revision,
      request_id: id(n++),
      ...payload,
    });
    return state;
  };
  eq(state.orders, []);
  eq(state.unit_settings.address_mode, "common");
  const line = (key, q) => ({
    key,
    name: "Vare " + key,
    sku: "00" + key,
    quantity: q,
    unit: "stk",
    credit_cents: null,
    image_url: "",
    product_url: "",
  });
  let catalog = await cat("package", 0, {
    name: "Grunnpakke",
    lines: [line("a", 2.5), line("b", 1)],
  });
  await cat("choose", catalog.revision, {
    unit_id: unit,
    choice_revision: 0,
    package_id: catalog.packages[0].id,
    option_ids: [],
  });
  await order("save", 0, 1, { selected_positions: [0, 1] });
  const create = {
    draft_revision: 1,
    positions: [0, 1],
    reference: "0042",
    supplier: "QA leverandør",
    supplier_reference: "",
    requested_date: "2026-11-05",
    note: "QA",
    review: true,
  };
  await rejects(() => command("create", create), "22023");
  await command("settings", {
    settings: { address: "QA fellesadresse 1", note: "Port 2" },
  });
  const replay = { revision: state.revision, request_id: id(n++), ...create };
  state = await raw("create", replay);
  const oid = state.orders[0].id;
  eq(state.orders[0].status, "prepared");
  eq(state.orders[0].snapshot.supplier_reference, "");
  eq(state.orders[0].snapshot.address, "QA fellesadresse 1");
  eq(
    (await raw("create", replay)).orders.length,
    1,
    "network replay does not create second order",
  );
  await rejects(
    () => raw("create", { ...replay, supplier: "changed" }),
    "PT409",
  );
  await rejects(() => command("create", create), "PT409");
  await rejects(
    () =>
      raw("settings", {
        revision: 0,
        request_id: id(n++),
        settings: { address: "Stale", note: "" },
      }),
    "PT409",
  );
  await command("settings", {
    settings: { address: "Ny fellesadresse", note: "Ny port" },
  });
  eq(
    state.orders[0].snapshot.address,
    "QA fellesadresse 1",
    "existing order keeps frozen delivery address",
  );
  await rejects(
    () =>
      command("ordered", {
        order_id: oid,
        date: "2026-10-20",
        confirmed: false,
      }),
    "22023",
  );
  await command("ordered", {
    order_id: oid,
    date: "2026-10-20",
    confirmed: true,
  });
  eq(state.orders[0].status, "ordered");
  await rejects(
    () => command("cancel", { order_id: oid, confirmed: true }),
    "22023",
  );
  await rejects(
    () =>
      command("receive", {
        order_id: oid,
        date: "2026-10-20",
        note: "",
        lines: [{ position: 0, quantity: 1 }],
      }),
    "22023",
  );
  await command("receive", {
    order_id: oid,
    date: "2026-10-20",
    note: "Alt mottatt",
    lines: [
      { position: 0, quantity: 2.5 },
      { position: 1, quantity: 1 },
    ],
  });
  eq(state.orders[0].status, "delivered");
  await rejects(
    () =>
      command("receive", {
        order_id: oid,
        date: "2026-10-20",
        note: "",
        lines: [{ position: 0, quantity: 0.1 }],
      }),
    "22023",
  );
  await rejects(
    () =>
      command("receive", {
        order_id: oid,
        date: "2026-10-20",
        note: "",
        lines: [
          { position: 0, quantity: -2.5 },
          { position: 1, quantity: -1 },
        ],
      }),
    "22023",
  );
  await command("receive", {
    order_id: oid,
    date: "2026-10-20",
    note: "Feilført mottak korrigert",
    lines: [
      { position: 0, quantity: -2.5 },
      { position: 1, quantity: -1 },
    ],
  });
  eq(state.orders[0].status, "ordered");
  await command("supplier_reference", {
    order_id: oid,
    supplier_reference: "SUP-123",
  });
  eq(state.orders[0].snapshot.supplier_reference, "SUP-123");
  eq(state.orders[0].snapshot.goods.length, 2);
  // A separate unit can override the common address and split orders/receipts.
  const catState = await cat();
  await cat("choose", catState.revision, {
    unit_id: second,
    choice_revision: 0,
    package_id: catState.packages[0].id,
    option_ids: [],
  });
  await db.query("select public.bolig_order_draft($1,$2,$3,$4,$5,$6,$7)", [
    firm,
    root,
    second,
    "save",
    0,
    1,
    { selected_positions: [0, 1] },
  ]);
  const cmd2 = async (action, payload) => {
    state = await raw(
      action,
      { revision: state.revision, request_id: id(n++), ...payload },
      second,
    );
    return state;
  };
  await cmd2("unit_settings", {
    settings: {
      address_mode: "individual",
      address: "QA bolig 2",
      order_mode: "split",
      delivery_mode: "partial",
    },
  });
  await cmd2("create", { ...create, positions: [0] });
  const split = state.orders[0].id;
  eq(state.orders[0].snapshot.address, "QA bolig 2");
  eq(state.orders[0].snapshot.goods.length, 1);
  await cmd2("create", { ...create, positions: [1] });
  eq(state.orders.length, 2);
  await cmd2("ordered", {
    order_id: split,
    date: "2026-10-20",
    confirmed: true,
  });
  await cmd2("receive", {
    order_id: split,
    date: "2026-10-21",
    note: "",
    lines: [{ position: 0, quantity: 1.25 }],
  });
  eq(state.orders.find((o) => o.id === split).status, "partial");
  await rejects(
    () =>
      cmd2("receive", {
        order_id: split,
        date: "2026-10-21",
        note: "",
        lines: [{ position: 0, quantity: 0.0011 }],
      }),
    "22023",
  );
  await rejects(
    () =>
      cmd2("receive", {
        order_id: split,
        date: "2026-10-21",
        note: "",
        lines: [{ position: 0, quantity: 2 }],
      }),
    "22023",
  );
  await cmd2("receive", {
    order_id: split,
    date: "2026-10-21",
    note: "",
    lines: [{ position: 0, quantity: 1.25 }],
  });
  eq(state.orders.find((o) => o.id === split).status, "delivered");
  eq(state.events.filter((e) => e.action === "receive").length, 2);
  const prepared = state.orders.find((o) => o.status === "prepared");
  await cmd2("cancel", { order_id: prepared.id, confirmed: true });
  eq(state.orders.find((o) => o.id === prepared.id).status, "cancelled");
  await cmd2("create", { ...create, positions: [1] });
  eq(state.orders.length, 3, "annulled goods may be prepared again");
  await rejects(
    () =>
      raw(
        "receive",
        {
          revision: state.revision,
          request_id: id(n++),
          order_id: split,
          date: "2026-10-21",
          note: "",
          lines: [{ position: 0, quantity: -1 }],
        },
        unit,
      ),
    "42501",
  );
  await actor(reader);
  eq((await raw()).orders.length, 1);
  await rejects(
    () => command("settings", { settings: { address: "Denied", note: "" } }),
    "42501",
  );
  await rejects(
    () => db.query("select * from bolig_private.purchase_orders"),
    "42501",
  );
  await actor(outsider, other);
  await rejects(() => raw(), "42501");
  await actor(manager);
  await rejects(() => raw("get", {}, unit, other), "42501");
  await db.exec("set role anon");
  await rejects(() => raw(), "42501");
  await actor(manager);
  // Frozen recipient/attachments, fresh authorization and exactly-once provider ack.
  const mail = async (action, payload, u = second) =>
    (
      await db.query("select public.bolig_order_mail($1,$2,$3,$4,$5) v", [
        firm,
        root,
        u,
        action,
        payload,
      ])
    ).rows[0].v;
  const pendingOrder = state.orders.find((o) => o.status === "prepared");
  const mp = {
    request_id: id(n++),
    order_id: pendingOrder.id,
    revision: state.revision,
    to: "supplier@example.invalid",
    fag: ["QA Fag"],
  };
  await db.exec("select set_config('qa.cordel','no',false)");
  eq(
    (await db.query("select public.get_cordel_export_access() v")).rows[0].v,
    false,
    "Sender has no Cordel export access",
  );
  const preview = await mail("prepare", mp);
  eq(preview.snapshot.to, "supplier@example.invalid");
  eq(preview.snapshot.goods[0].sku, "00b");
  eq(preview.snapshot.goods[0].quantity, 1);
  eq(preview.snapshot.company.companyName, "QA Firma");
  eq(preview.snapshot.replyTo, "qa@example.invalid");
  eq(preview.snapshot.identity.project, "QA orders and receipts");
  eq(
    JSON.stringify(preview.snapshot).includes("credit_cents"),
    false,
    "email has no catalog prices",
  );
  eq((await mail("prepare", mp)).id, preview.id);
  await rejects(
    () => mail("prepare", { ...mp, to: "other@example.invalid" }),
    "PT409",
  );
  await rejects(
    () =>
      mail("prepare", { ...mp, request_id: id(n++), fag: ["Bad;delimiter"] }),
    "22023",
  );
  await rejects(
    () =>
      mail("prepare", { ...mp, request_id: id(n++), fag: ["Unsupported😀"] }),
    "22023",
  );
  await rejects(
    () =>
      mail("prepare", {
        ...mp,
        request_id: id(n++),
        to: "a@example.invalid,b@example.invalid",
      }),
    "22023",
  );
  await db.exec("select set_config('qa.cordel','no',false)");
  eq(
    (await mail("inspect", { request_id: preview.id })).id,
    preview.id,
    "Sender can inspect attachments without Cordel permission",
  );
  await actor(reader);
  await rejects(() => mail("begin", { request_id: preview.id }), "42501");
  await actor(manager);
  await mail("inspect", { request_id: preview.id });
  eq(
    (await raw("get", {}, second)).orders.find((o) => o.id === pendingOrder.id)
      .mail_request_id,
    null,
    "preview does not claim an external send",
  );
  await mail("begin", { request_id: preview.id });
  await rejects(
    () => cmd2("cancel", { order_id: pendingOrder.id, confirmed: true }),
    "PT409",
  );
  await rejects(
    () =>
      cmd2("ordered", {
        order_id: pendingOrder.id,
        confirmed: true,
        date: "2026-10-21",
      }),
    "PT409",
  );
  await rejects(
    () =>
      db.query("select public.bolig_order_mail_complete($1,$2)", [
        preview.id,
        "forged",
      ]),
    "42501",
  );
  await db.exec("set role service_role");
  await db.query("select public.bolig_order_mail_complete($1,$2)", [
    preview.id,
    "provider-test",
  ]);
  await db.query("select public.bolig_order_mail_complete($1,$2)", [
    preview.id,
    "provider-test",
  ]);
  await actor(manager);
  const sent = await raw("get", {}, second);
  eq(sent.orders.find((o) => o.id === pendingOrder.id).status, "ordered");
  eq(
    sent.events.filter((e) => e.action === "mail_sent").length,
    1,
    "ack replay creates no extra history",
  );
  eq((await mail("begin", { request_id: preview.id })).sent, true);
  const overview = (
    await db.query("select public.bolig_overview($1,$2) v", [firm, root])
  ).rows[0].v.units.find((u) => u.unit_id === second);
  eq(overview.purchase_count, 2);
  eq(overview.ordered_count, 1);
  eq(overview.delivered_count, 1);
  eq(overview.remaining_goods, 0);
  eq(overview.purchase_outdated, false);

  state = sent;
  await cmd2("supplier_reference", {
    order_id: pendingOrder.id,
    supplier_reference: "Etter mottatt ordrebekreftelse",
  });
  eq(
    state.orders.find((o) => o.id === pendingOrder.id).snapshot
      .supplier_reference,
    "Etter mottatt ordrebekreftelse",
  );
  await db.exec("select set_config('qa.cordel','yes',false)");
}
