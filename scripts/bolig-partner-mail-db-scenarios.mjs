import fs from "node:fs/promises";
export default async function ({
  db,
  actor,
  eq,
  rejects,
  id,
  firm,
  other,
  manager,
  reader,
  outsider,
  root,
  rpc,
}) {
  await db.exec("reset role");
  await db.exec(
    await fs.readFile(
      "supabase/migrations/20261023210201_bolig_partner_invitation_mail.sql",
      "utf8",
    ),
  );
  await actor(manager);
  const access = id(98700),
    token = "ac".repeat(32);
  await rpc("create", {
    id: access,
    request_id: id(98701),
    name: "QA Mottaker",
    email: "ue@qa.invalid",
    organisation: "QA UE Firma",
    kind: "ue",
    token,
    days: 7,
    access_mode: "project",
    features: ["progress", "checklists"],
    reviewed: true,
  });
  const mail = async (
    action = "get",
    payload = {},
    company = firm,
    rootId = root,
    accessId = access,
  ) =>
    (
      await db.query("select public.bolig_partner_mail($1,$2,$3,$4,$5) v", [
        company,
        rootId,
        accessId,
        action,
        payload,
      ])
    ).rows[0].v;
  let s = await mail();
  eq(s.enabled, false, "transport starts paused");
  eq(s.snapshot.to, "ue@qa.invalid");
  eq(
    s.snapshot.origin,
    "https://expo-proffdok.app",
    "canonical server-owned origin",
  );
  eq(s.history, []);
  eq(JSON.stringify(s).includes(token), false, "no raw token in manager read");
  const attempt = {
    request_id: id(98702),
    token,
    revision: s.revision,
    to: s.snapshot.to,
  };
  await rejects(
    () => mail("prepare", { ...attempt, to: "other@qa.invalid" }),
    "22023",
  );
  await rejects(
    () => mail("prepare", { ...attempt, token: "bb".repeat(32) }),
    "42501",
  );
  await rejects(
    () => mail("prepare", { ...attempt, revision: s.revision + 1 }),
    "PT409",
  );
  s = await mail("prepare", {
    ...attempt,
    origin: "https://attacker.invalid",
    html: "forged",
  });
  eq(s.snapshot.origin, "https://expo-proffdok.app");
  eq(JSON.stringify(s).includes("forged"), false);
  eq((await mail("prepare", attempt)).id, s.id, "exact replay reuses request");
  await rejects(
    () => mail("begin", attempt),
    "PT409",
    "paused transport never claims sending",
  );
  for (const person of [reader, outsider]) {
    await actor(person);
    await rejects(() => mail(), "42501");
  }
  await actor(manager, other);
  await rejects(() => mail(), "42501");
  await actor(manager);
  await rejects(() => mail("get", {}, other), "42501");
  await rejects(() => mail("get", {}, firm, id(98799)), "42501");
  await db.exec("reset role;set role anon");
  await rejects(() => mail(), "42501");
  await db.exec(
    "reset role;update bolig_private.partner_mail_settings set enabled=true",
  );
  await actor(manager);
  s = await mail("begin", attempt);
  eq(!!s.begun_at, true);
  eq(
    (await mail("begin", attempt)).begun_at,
    s.begun_at,
    "concurrent retry keeps original attempt time",
  );
  await rejects(
    () => mail("prepare", { ...attempt, request_id: id(98703) }),
    "PT409",
    "unresolved attempt blocks duplicate send",
  );
  await rejects(
    () =>
      db.query("select public.bolig_partner_mail_complete($1,$2)", [
        attempt.request_id,
        "forged-provider",
      ]),
    "42501",
  );
  await db.exec("reset role;set role service_role");
  await db.query("select public.bolig_partner_mail_complete($1,$2)", [
    attempt.request_id,
    "provider-qa",
  ]);
  await db.query("select public.bolig_partner_mail_complete($1,$2)", [
    attempt.request_id,
    "provider-qa",
  ]);
  await rejects(
    () =>
      db.query("select public.bolig_partner_mail_complete($1,$2)", [
        attempt.request_id,
        "different-provider",
      ]),
    "PT409",
  );
  await actor(manager);
  s = await mail("prepare", attempt);
  eq(s.sent, true, "lost completion reply recovers receipt");
  await rejects(
    () => mail("prepare", { ...attempt, request_id: id(98704) }),
    "PT409",
    "recently sent guard",
  );
  const history = (await mail()).history;
  eq(history.length, 1);
  eq(history[0].recipient, "ue@qa.invalid");
  eq(history[0].own, true);
  eq(!!history[0].sent_at, true);
  await db.exec("reset role");
  eq(
    (
      await db.query(
        "select snapshot::text v from bolig_private.partner_mail where id=$1",
        [attempt.request_id],
      )
    ).rows[0].v.includes(token),
    false,
    "database freezes no raw token",
  );
  await db.query(
    "update bolig_private.partner_mail set sent_at=clock_timestamp()-interval '2 minutes' where id=$1",
    [attempt.request_id],
  );
  await actor(manager);
  const stale = { ...attempt, request_id: id(98705) };
  await mail("prepare", stale);
  let partner = (await rpc()).partners.find((p) => p.id === access);
  await rpc("permissions", {
    id: access,
    request_id: id(98706),
    revision: partner.revision,
    access_mode: "project",
    features: ["progress"],
    reviewed: true,
  });
  await rejects(
    () => mail("begin", stale),
    "PT409",
    "changed features block a prepared invitation",
  );
  partner = (await rpc()).partners.find((p) => p.id === access);
  const next = {
    ...attempt,
    request_id: id(98707),
    revision: partner.revision,
  };
  await mail("prepare", next);
  await mail("begin", next);
  await db.exec("reset role");
  await db.query(
    "update bolig_private.partner_mail set begun_at=clock_timestamp()-interval '24 hours' where id=$1",
    [next.request_id],
  );
  await actor(manager);
  await rejects(
    () => mail("begin", next),
    "PT409",
    "never retry beyond provider deduplication window",
  );
  await db.exec("reset role");
  const beforeExpiry = (
    await db.query(
      "select expires_at from bolig_private.partner_access where id=$1",
      [access],
    )
  ).rows[0].expires_at;
  await db.query(
    "update bolig_private.partner_access set expires_at=clock_timestamp()-interval '1 minute' where id=$1",
    [access],
  );
  await actor(manager);
  await rejects(() => mail(), "42501", "expired grant not emailable");
  await db.exec("reset role");
  await db.query(
    "update bolig_private.partner_access set expires_at=$1 where id=$2",
    [beforeExpiry, access],
  );
  await actor(manager);
  await db.exec("select set_config('qa.projects','no',false)");
  await rejects(
    () => mail(),
    "42501",
    "lost Projects entitlement stops invitations",
  );
  await db.exec("select set_config('qa.projects','yes',false)");
  await rpc("revoke", { id: access, request_id: id(98708) });
  await rejects(
    () => mail("prepare", attempt),
    "42501",
    "revocation checked before receipt replay",
  );
  await rejects(() => mail(), "42501");
  await db.exec(
    "reset role;update bolig_private.partner_mail_settings set enabled=false",
  );
  await actor(manager);
}
