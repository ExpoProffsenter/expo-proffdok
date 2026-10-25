import fs from "node:fs/promises";
export default async function portalScenarios({
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
      "supabase/migrations/20261022203739_bolig_resident_portal.sql",
      "utf8",
    ),
  );
  await actor(manager);
  const rec = await call("create_plan", null, null, {
    request_id: id(40000),
    title: "QA portal",
    reference: "QA-PORTAL",
    buildings: [
      {
        name: "Portalbygg",
        building_type: "apartment",
        address: "Portalgate 1",
        house_floors: 1,
        entrances: [{ address: "Portalgate 1", counts: [2] }],
      },
    ],
  });
  const root = rec.root.id,
    unit = rec.units[0].id,
    neighbor = rec.units[1].id;
  let seq = 40100;
  const internal = async (action = "get", payload = {}, u = unit, c = firm) =>
    (
      await db.query("select public.bolig_resident_portal($1,$2,$3,$4,$5) v", [
        c,
        root,
        u,
        action,
        payload,
      ])
    ).rows[0].v;
  const anonymous = async () =>
    db.exec("reset role;select set_config('qa.user','',false);set role anon;");
  const pub = async (token, action = "get", payload = {}) =>
    (
      await db.query("select public.bolig_portal($1,$2,$3) v", [
        token,
        action,
        payload,
      ])
    ).rows[0].v;
  const cat = async (action, rev, payload) =>
    (
      await db.query("select public.bolig_catalog($1,$2,$3,$4,$5) v", [
        firm,
        root,
        action,
        rev,
        payload,
      ])
    ).rows[0].v;
  const choices = async (action = "get", rev = null, payload = {}) =>
    (
      await db.query(
        "select public.bolig_package_choices($1,$2,$3,$4,$5,$6) v",
        [firm, root, unit, action, rev, payload],
      )
    ).rows[0].v;
  let s = await internal();
  eq(s.portal, null);
  let rev = 0;
  const command = async (action, payload = {}) => {
    const next = await internal(action, {
      request_id: id(seq++),
      revision: rev,
      ...payload,
    });
    rev = next.revision;
    return next;
  };
  await rejects(
    () => command("publish", { token: "a".repeat(64), reviewed: true }),
    "22023",
  );
  let catalog = await cat("package", 0, {
    name: "Portal grunnpakke",
    lines: [
      {
        key: "basin",
        name: "Standardservant",
        sku: "BASE",
        quantity: 1,
        unit: "stk",
        credit_cents: 10000,
      },
    ],
  });
  const pkg = catalog.packages[0].id;
  catalog = await cat("option", catalog.revision, {
    name: "Eikeservant",
    sku: "OAK",
    quantity: 1,
    unit: "stk",
    price_cents: 25000,
    replace_key: "basin",
    deduct_base: true,
  });
  const option = catalog.options[0].id;
  let cs = await choices();
  cs = await choices("save", 0, {
    scope_id: "common",
    package_id: pkg,
    option_ids: [],
    catalog_revision: cs.revision,
    rooms_revision: cs.rooms_revision,
  });
  await db.exec("reset role");
  await db.query(
    "update bolig_private.units set contact_name='QA Beboer',contact_email='qa@example.invalid' where id=$1",
    [unit],
  );
  await actor(manager);
  s = await command("offer", {
    current: true,
    title: "Grunnpakke",
    choice_revision: 1,
  });
  eq(s.portal.offers_draft[0].total_cents, 0);
  const base = s.portal.offers_draft[0].id;
  s = await command("offer", {
    title: "Tilvalgspakke i eik",
    choice_revision: 1,
    choice: {
      scope_id: "common",
      package_id: pkg,
      option_ids: [option],
      catalog_revision: cs.revision,
      rooms_revision: cs.rooms_revision,
    },
  });
  eq(
    s.portal.offers_draft[1].total_cents,
    15000,
    "price and base deduction come from server",
  );
  const oak = s.portal.offers_draft[1].id;
  eq(
    (await choices()).selection.revision,
    1,
    "preparing alternatives does not overwrite selections",
  );
  s = await command("document", {
    title: "FDV fra produsent",
    url: "https://example.invalid/fdv.pdf",
  });
  await rejects(
    () =>
      command("document", { title: "Bad link", url: "javascript:alert(1)" }),
    "22023",
  );
  const token = "a".repeat(64);
  s = await command("publish", { token, reviewed: true });
  eq(s.portal.offers.length, 2);
  eq(JSON.stringify(s).includes(token), false);
  const publishedRevision = rev;
  await anonymous();
  let visible = await pub(token);
  eq(visible.identity.unit, rec.units[0].number);
  eq(visible.offers.length, 2);
  for (const word of [
    "credit_cents",
    "source_revision",
    "contact_email",
    "contact_name",
    "token_hash",
    "catalog_revision",
    "created_by",
    "root_id",
    "supplier_order",
  ])
    eq(
      JSON.stringify(visible).includes('"' + word + '"'),
      false,
      "public projection excludes " + word,
    );
  await rejects(() => pub("b".repeat(64)), "42501");
  await rejects(() => internal(), "42501");
  await rejects(
    () => db.query("select * from bolig_private.resident_portals"),
    "42501",
  );
  await rejects(
    () =>
      pub(token, "request", {
        request_id: id(seq++),
        offer_id: "bogus",
        menu_version: 1,
      }),
    "22023",
  );
  await rejects(
    () =>
      pub(token, "request", {
        request_id: id(seq++),
        offer_id: oak,
        menu_version: 0,
      }),
    "PT409",
  );
  const request = {
    request_id: id(seq++),
    offer_id: oak,
    menu_version: 1,
    body: "Jeg ønsker denne pakken",
    total_cents: 1,
  };
  visible = await pub(token, "request", request);
  eq(
    visible.events[0].offer.total_cents,
    15000,
    "resident cannot inject a price",
  );
  eq(visible.events[0].status, "pending");
  eq(
    (await pub(token, "request", request)).events.length,
    1,
    "lost request response replays without duplicate",
  );
  await rejects(
    () => pub(token, "request", { ...request, body: "Changed" }),
    "PT409",
  );
  await rejects(
    () =>
      pub(token, "request", {
        ...request,
        request_id: id(seq++),
        offer_id: base,
      }),
    "PT409",
  );
  const message = {
    request_id: id(seq++),
    body: "Hei prosjektleder, jeg har et spørsmål.",
  };
  visible = await pub(token, "message", message);
  eq(visible.events.length, 2);
  eq((await pub(token, "message", message)).events.length, 2);
  const event = visible.events.find((e) => e.kind === "request");
  await actor(manager);
  s = await internal();
  rev = s.revision;
  eq(rev, publishedRevision + 2);
  eq(
    (await choices()).selection.revision,
    1,
    "resident request is not an internal selection",
  );
  await rejects(
    () =>
      internal("reply", {
        revision: publishedRevision,
        request_id: id(seq++),
        body: "Stale",
      }),
    "PT409",
  );
  s = await command("reply", { body: "Takk! Vi gjennomgår valget ditt." });
  s = await command("apply", {
    event_id: event.id,
    note: "Valget er klart til avtalegjennomgang.",
  });
  cs = await choices();
  eq(cs.selection.revision, 2);
  eq(cs.selection.snapshot.goods[0].sku, "OAK");
  eq(cs.selection.snapshot.total_cents, 15000);
  await anonymous();
  visible = await pub(token);
  eq(visible.events.find((e) => e.id === event.id).status, "applied");
  eq(
    visible.events.some((e) => e.sender === "manager"),
    true,
  );
  await actor(reader);
  s = await internal();
  eq(s.portal.id, visible.id);
  await rejects(() => command("revoke"), "42501");
  await actor(outsider, other);
  await rejects(() => internal(), "42501");
  await rejects(() => internal("get", {}, unit, other), "42501");
  await actor(manager);
  eq((await internal("get", {}, neighbor)).portal, null);
  rev = (await internal()).revision;
  await rejects(
    () => command("publish", { token: "b".repeat(64), reviewed: true }),
    "PT409",
  );
  // A stale or ordered unit must use the existing change agreement flow.
  await anonymous();
  visible = await pub(token, "request", {
    request_id: id(seq++),
    offer_id: base,
    menu_version: 1,
    body: "",
  });
  const next = visible.events.find(
    (e) => e.status === "pending" && e.kind === "request",
  );
  await actor(manager);
  rev = (await internal()).revision;
  await rejects(
    () => command("apply", { event_id: next.id, note: "Stale proposal" }),
    "PT409",
  );
  s = await command("review", {
    event_id: next.id,
    note: "Vi lager en egen endringsavtale.",
  });
  // Portal agreements expose no drafts and keep exact-version acceptance/receipt.
  const commerce = async (action, payload) =>
    (
      await db.query("select public.bolig_commerce($1,$2,$3,$4,$5) v", [
        firm,
        root,
        unit,
        action,
        payload,
      ])
    ).rows[0].v;
  let ds = await commerce("create", {
    request_id: id(seq++),
    kind: "choice",
    choice_revision: 2,
    reason: "QA portal avtale",
  });
  let doc = ds.documents[0];
  ds = await commerce("approve", {
    request_id: id(seq++),
    document_id: doc.id,
    revision: doc.revision,
  });
  doc = ds.documents[0];
  await anonymous();
  eq(
    (await pub(token)).agreements.length,
    0,
    "unpublished agreements remain private",
  );
  await actor(manager);
  ds = await commerce("publish", {
    request_id: id(seq++),
    document_id: doc.id,
    revision: doc.revision,
    token: "d".repeat(64),
  });
  doc = ds.documents[0];
  await anonymous();
  visible = await pub(token);
  eq(visible.agreements[0].id, doc.id);
  const decision = {
    request_id: id(seq++),
    document_id: doc.id,
    name: "QA Beboer",
    confirmed: true,
  };
  await rejects(
    () => pub(token, "accept", { ...decision, document_id: id(99999) }),
    "42501",
  );
  visible = await pub(token, "accept", decision);
  eq(visible.agreements[0].status, "accepted");
  const timestamp = visible.agreements[0].accepted_at;
  eq(
    (await pub(token, "accept", decision)).agreements[0].accepted_at,
    timestamp,
    "acceptance retry preserves receipt",
  );
  await rejects(() => pub(token, "decline", decision), "PT409");
  await actor(manager);
  rev = (await internal()).revision;
  s = await command("revoke");
  await anonymous();
  await rejects(() => pub(token), "42501");
  await actor(manager);
  rev = s.revision;
  // Clear stale offers, then rotate the capability. The old URL stays invalid.
  for (const o of s.portal.offers_draft) {
    s = await command("remove_offer", { offer_id: o.id });
  }
  s = await command("publish", { token: "b".repeat(64), reviewed: true });
  await anonymous();
  await rejects(() => pub(token), "42501");
  eq((await pub("b".repeat(64))).offers.length, 0);
  await db.exec("reset role");
  await db.query(
    "update bolig_private.units set contact_email='new@example.invalid' where id=$1",
    [unit],
  );
  await anonymous();
  await rejects(() => pub("b".repeat(64)), "42501");
  await actor(manager);
  rev = (await internal()).revision;
  s = await command("publish", { token: "c".repeat(64), reviewed: true });
  await anonymous();
  eq(
    (await pub("c".repeat(64))).events.length,
    0,
    "new contact does not inherit previous resident messages or requests",
  );
  await rejects(
    () =>
      db.query(
        "select bolig_resident_private.portal_decision(null,'accept',null,'{}')",
      ),
    "42501",
  );
  await actor(manager);
  await db.exec("reset role");
  await db.query(
    "update bolig_private.resident_portals set expires_at=now()-interval '1 second' where id=$1",
    [s.portal.id],
  );
  await anonymous();
  await rejects(() => pub("c".repeat(64)), "42501");
  await actor(manager);
}
