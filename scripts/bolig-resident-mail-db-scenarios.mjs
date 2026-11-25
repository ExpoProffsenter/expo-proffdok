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
      "supabase/migrations/20261023214107_bolig_resident_invitation_mail.sql",
      "utf8",
    ),
  );
  await actor(manager);
  const created = await call("create_plan", null, null, {
    request_id: id(99100),
    title: "QA link mail",
    reference: "QA-LINK-MAIL",
    buildings: [
      {
        name: "QA Bygg",
        building_type: "apartment",
        address: "QA Gate 1",
        house_floors: 1,
        entrances: [{ address: "QA Gate 1", counts: [2] }],
      },
    ],
  });
  const root = created.root.id,
    unit = created.units[0].id,
    neighbor = created.units[1].id,
    portal = id(99101),
    doc = id(99102),
    change = id(99103);
  const token = "e1".repeat(32),
    docToken = "e2".repeat(32),
    changeToken = "e3".repeat(32);
  await db.exec("reset role");
  await db.query(
    "update bolig_private.units set contact_name='QA Beboer',contact_email='resident@qa.invalid' where id=$1",
    [unit],
  );
  await db.query(
    "insert into bolig_private.resident_portals(id,root_id,unit_id,token_hash,expires_at,revoked,contact_basis,menu_version,created_by) select $1,$2,$3,sha256(convert_to($4,'UTF8')),clock_timestamp()+interval '7 days',false,md5(jsonb_build_array(contact_name,contact_email)::text),1,$5 from bolig_private.units where id=$3",
    [portal, root, unit, token, manager],
  );
  for (const [ref, kind, t] of [
    [doc, "choice", docToken],
    [change, "change", changeToken],
  ])
    await db.query(
      "insert into bolig_private.commercial_documents(id,root_id,unit_id,group_id,version,kind,status,revision,snapshot,token_hash,expires_at,created_by) values($1,$2,$3,$1,1,$4,'published',3,'{\"goods\":[],\"identity\":{},\"total_cents\":0}',sha256(convert_to($5,'UTF8')),clock_timestamp()+interval '7 days',$6)",
      [ref, root, unit, kind, t, manager],
    );
  await actor(manager);
  const mail = async (
    kind = "portal",
    target = portal,
    t = token,
    action = "get",
    payload = {},
    c = firm,
    u = unit,
    r = root,
  ) =>
    (
      await db.query(
        "select public.bolig_resident_link_mail($1,$2,$3,$4,$5,$6,$7) v",
        [c, r, u, target, kind, action, { token: t, ...payload }],
      )
    ).rows[0].v;
  let s = await mail();
  eq(s.enabled, false);
  eq(s.snapshot.to, "resident@qa.invalid");
  eq(s.revision, 1);
  eq(s.snapshot.unit, created.units[0].number);
  eq(JSON.stringify(s).includes(token), false, "no raw token in read");
  await rejects(() => mail("portal", portal, "bad"), "42501");
  await rejects(() => mail("portal", portal, docToken), "42501");
  await rejects(() => mail("unknown"), "22023");
  await rejects(() => mail("portal", portal, token, "get", {}, other), "42501");
  await rejects(
    () => mail("portal", portal, token, "get", {}, firm, neighbor),
    "42501",
  );
  for (const user of [reader, outsider]) {
    await actor(user);
    await rejects(() => mail(), "42501");
  }
  await actor(manager);
  await rejects(
    () => db.query("select * from bolig_private.resident_link_mail"),
    "42501",
  );
  await rejects(
    () =>
      db.query("select public.bolig_resident_link_mail_complete($1,$2)", [
        id(99110),
        "qa",
      ]),
    "42501",
  );
  const a = { request_id: id(99110), revision: 1, to: "resident@qa.invalid" };
  await rejects(
    () =>
      mail("portal", portal, token, "prepare", {
        ...a,
        to: "other@qa.invalid",
      }),
    "22023",
  );
  await rejects(
    () => mail("portal", portal, token, "prepare", { ...a, revision: 2 }),
    "PT409",
  );
  let prepared = await mail("portal", portal, token, "prepare", a);
  eq(prepared.id, a.request_id);
  eq(JSON.stringify(prepared).includes(token), false);
  eq(
    await mail("portal", portal, token, "prepare", a),
    prepared,
    "exact frozen replay",
  );
  await rejects(
    () => mail("reminder", portal, token, "prepare", a),
    "42501",
    "request ID cannot change purpose",
  );
  await rejects(
    () => mail("portal", portal, token, "begin", a),
    "PT409",
    "paused begin",
  );
  await db.exec(
    "reset role;update bolig_private.resident_link_mail_settings set enabled=true",
  );
  await actor(manager);
  prepared = await mail("portal", portal, token, "begin", a);
  eq(!!prepared.begun_at, true);
  await rejects(
    () =>
      mail("reminder", portal, token, "prepare", {
        ...a,
        request_id: id(99111),
      }),
    "PT409",
    "invitation/reminder share unresolved fence",
  );
  await db.exec("reset role;set role service_role");
  await db.query("select public.bolig_resident_link_mail_complete($1,$2)", [
    a.request_id,
    "qa-provider",
  ]);
  await actor(manager);
  eq(
    (await mail("portal", portal, token, "prepare", a)).sent,
    true,
    "receipt replay",
  );
  eq((await mail()).history[0].sent_at !== null, true);
  await rejects(
    () =>
      mail("reminder", portal, token, "prepare", {
        ...a,
        request_id: id(99112),
      }),
    "PT409",
    "cooldown also covers reminder",
  );
  await db.exec(
    "reset role;update bolig_private.resident_link_mail set sent_at=clock_timestamp()-interval '2 minutes'",
  );
  await actor(manager);
  const reminder = { ...a, request_id: id(99113) };
  eq(
    (await mail("reminder", portal, token, "prepare", reminder)).snapshot.kind,
    "reminder",
  );
  await db.exec("reset role");
  await db.query(
    "update bolig_private.resident_portals set menu_version=2 where id=$1",
    [portal],
  );
  await actor(manager);
  await rejects(
    () => mail("reminder", portal, token, "begin", reminder),
    "PT409",
    "republished menu invalidates old preparation",
  );
  for (const [ref, t, kind] of [
    [doc, docToken, "choice"],
    [change, changeToken, "change"],
  ]) {
    s = await mail("agreement", ref, t);
    eq(s.snapshot.document_kind, kind);
    eq(s.revision, 3);
    eq(s.snapshot.version, 1);
    const attempt = {
      request_id: kind === "choice" ? id(99114) : id(99115),
      revision: 3,
      to: s.snapshot.to,
    };
    await mail("agreement", ref, t, "prepare", attempt);
    await db.exec("reset role");
    await db.query(
      "update bolig_private.commercial_documents set status='declined' where id=$1",
      [ref],
    );
    await actor(manager);
    await rejects(
      () => mail("agreement", ref, t, "begin", attempt),
      "42501",
      "answered agreement cannot be sent",
    );
  }
  await db.exec("reset role");
  await db.query(
    "update bolig_private.resident_portals set expires_at=clock_timestamp()-interval '1 minute' where id=$1",
    [portal],
  );
  await actor(manager);
  await rejects(() => mail(), "42501", "expired portal");
  await db.exec("reset role");
  await db.query(
    "update bolig_private.resident_portals set expires_at=clock_timestamp()+interval '7 days',revoked=true where id=$1",
    [portal],
  );
  await actor(manager);
  await rejects(() => mail(), "42501", "revoked portal");
  await db.exec("reset role");
  await db.query(
    "update bolig_private.resident_portals set revoked=false where id=$1",
    [portal],
  );
  await actor(manager);
  await db.exec("select set_config('qa.projects','no',false)");
  await rejects(() => mail(), "42501", "Projects entitlement revoked");
  await db.exec("select set_config('qa.projects','yes',false)");
  await db.exec("reset role");
  await db.query(
    "update bolig_private.units set contact_name='Ny beboer' where id=$1",
    [unit],
  );
  await db.query(
    "update bolig_private.units set contact_name='QA Beboer' where id=$1",
    [unit],
  );
  await actor(manager);
  await rejects(
    () => mail(),
    "42501",
    "A-B-A contact switch never restores link",
  );
  await rejects(
    () => mail("portal", portal, token, "prepare", a),
    "42501",
    "receipt cannot bypass contact revocation",
  );
  await db.exec(
    "reset role;update bolig_private.resident_link_mail_settings set enabled=false",
  );
  await actor(manager);
}
