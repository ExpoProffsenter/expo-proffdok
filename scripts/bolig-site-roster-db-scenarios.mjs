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
  // Calendar months clamp to the last day of the target month. Date.setUTCMonth
  // overflows (31 October + 6 months becomes 1 May), unlike PostgreSQL.
  const sixCalendarMonths = (day) => {
    const date = new Date(`${day}T00:00:00Z`);
    const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 7, 0));
    target.setUTCDate(Math.min(date.getUTCDate(), target.getUTCDate()));
    return target.toISOString().slice(0, 10);
  };
  for (const [day, expected] of [
    ["2026-10-31", "2027-04-30"],
    ["2026-10-30", "2027-04-30"],
    ["2026-08-31", "2027-02-28"],
    ["2023-08-31", "2024-02-29"],
    ["2024-02-29", "2024-08-29"],
    ["2026-01-31", "2026-07-31"],
  ]) {
    eq(sixCalendarMonths(day), expected, `six calendar months from ${day}`);
    eq(
      (await db.query("select (($1::date + interval '6 months')::date)::text v", [day])).rows[0].v,
      expected,
      `PostgreSQL calendar retention from ${day}`,
    );
  }
  await db.exec("reset role");
  const fingerprints = (
    await db.query(
      "select oid::regprocedure::text signature,md5(prosrc) hash from pg_proc where proname in('bolig_attendance','attendance_workspace','bolig_attendance_people','attendance_people_workspace','bolig_my_presence','bolig_partner_presence') order by 1",
    )
  ).rows;
  await db.exec(
    await fs.readFile(
      "supabase/migrations/20261025202418_bolig_site_roster.sql",
      "utf8",
    ),
  );
  eq(
    (
      await db.query(
        "select oid::regprocedure::text signature,md5(prosrc) hash from pg_proc where proname in('bolig_attendance','attendance_workspace','bolig_attendance_people','attendance_people_workspace','bolig_my_presence','bolig_partner_presence') order by 1",
      )
    ).rows,
    fingerprints,
    "established attendance functions unchanged",
  );
  await actor(manager);
  const r = await call("create_plan", null, null, {
    request_id: id(995000),
    title: "QA Oversiktsliste",
    reference: "QA-ROSTER",
    buildings: [
      {
        name: "QA",
        building_type: "house",
        address: "QA gate 1",
        house_floors: 1,
        entrances: [{ address: "QA gate 1", counts: [1] }],
      },
    ],
  });
  const root = r.root.id,
    baseline = await call("get", root),
    rpc = async (action = "get", p = {}, c = firm, rootId = root) =>
      (
        await db.query("select public.bolig_site_roster($1,$2,$3,$4) v", [
          c,
          rootId,
          action,
          p,
        ])
      ).rows[0].v;
  let n = 995100,
    s = await rpc();
  const today = s.today,
    yesterday = new Date(Date.parse(today) - 86400000)
      .toISOString()
      .slice(0, 10);
  const write = async (action, values = {}, extra = {}) => {
    s = await rpc(action, {
      request_id: id(n++),
      revision: s.revision,
      values,
      ...extra,
    });
    return s;
  };
  eq(s.checked, false);
  eq(s.revision, 0);
  eq(s.document.people, []);
  eq(s.document.site.address, "QA gate 1");
  eq(s.missing[0].fields, ["Byggherrens navn"]);
  eq(
    (await rpc("get", { day: yesterday })).document,
    null,
    "no fabricated history",
  );
  await rejects(() => write("review", {}, { confirmed: true }), "22023");
  await write("settings", {
    ...s.document.site,
    client_name: "QA Byggherre",
    keeper_name: "QA Leder",
    ended_on: today,
  });
  eq(s.history.length, 1);
  const settingsVersion = s.history[0].id;
  eq(
    s.retain_until,
    sixCalendarMonths(today),
  );
  const employer = {
    id: id(995010),
    name: "QA Arbeidsgiver",
    organisation_number: "999 888 777",
    registration_required: true,
  };
  await write("employer", employer);
  eq(s.document.employers[0].organisation_number, "999888777");
  await write("employer", {
    id: id(995011),
    name: "QA Innleier",
    organisation_number: "999888778",
    registration_required: true,
  });
  const person = {
    id: id(995012),
    name: "QA Łukasz Жуков",
    starts_on: today,
    birth_date: "1990-01-02",
    employer_id: employer.id,
    employment_type: "hired",
    card_status: "number",
    card_number: "QA-HMS-001",
  };
  await write("person", person);
  eq(s.missing[0].fields, ["Innleievirksomhet"]);
  await rejects(() => write("review", {}, { confirmed: true }), "22023");
  await write("person", { ...person, hirer_id: id(995011) });
  eq(s.missing, []);
  const original = s.history[0].id;
  await write("review", {}, { confirmed: true });
  eq(s.checked, true);
  eq(s.document.review.by, manager);
  const archived = await rpc("get", { snapshot_id: original });
  eq(archived.readonly, true);
  eq(archived.checked, false);
  eq(archived.document.people[0].card_number, "QA-HMS-001");
  const payload = {
    request_id: id(n++),
    revision: s.revision,
    values: {
      ...person,
      hirer_id: id(995011),
      card_status: "applied",
      application_reference: "Søknad QA 123",
    },
  };
  s = await rpc("person", payload);
  eq(s.checked, false, "change invalidates daily review");
  eq(s.document.people[0].card_number, "");
  eq(s.missing, []);
  const revision = s.revision;
  eq(
    (await rpc("person", payload)).revision,
    revision,
    "exact retry does not duplicate",
  );
  await rejects(
    () =>
      rpc("person", {
        ...payload,
        values: { ...payload.values, name: "Changed" },
      }),
    "PT409",
  );
  await rejects(
    () => rpc("person", { ...payload, request_id: id(n++) }),
    "PT409",
  );
  eq(
    (await rpc("get", { snapshot_id: original })).document.people[0]
      .card_number,
    "QA-HMS-001",
    "old version immutable",
  );
  await rejects(
    () => write("person", { ...person, id: id(995013), hirer_id: id(995011) }),
    "PT409",
  );
  await write("person", {
    ...person,
    id: id(995013),
    name: "QA Annen",
    hirer_id: id(995011),
  });
  eq(
    s.document.people.length,
    2,
    "distinct name same birthday/employer allowed",
  );
  await write("person", {
    ...person,
    id: id(995014),
    name: "QA Fremtidig",
    starts_on: "2099-01-01",
    birth_date: null,
    card_number: "",
  });
  eq(s.missing, [], "future people not counted as present-day missing");
  await rejects(
    () => write("person", { ...person, birth_date: "2099-01-01" }),
    "22023",
  );
  await rejects(
    () => write("person", { ...person, ends_on: yesterday }),
    "22023",
  );
  await rejects(
    () => write("employer", { ...employer, organisation_number: "123" }),
    "22023",
  );
  await rejects(
    () => write("settings", { ...s.document.site, ended_on: "2099-01-01" }),
    "22023",
  );
  await rejects(
    () =>
      rpc("review", {
        request_id: id(n++),
        revision: s.revision,
        confirmed: true,
        day: yesterday,
      }),
    "22023",
  );
  await rejects(() => rpc("get", { day: "2099-01-01" }), "22023");
  await rejects(() => rpc("get", { snapshot_id: id(1) }), "42501");
  const pid = id(995020),
    vid = id(995021);
  await db.exec("reset role");
  await db.query(
    "insert into bolig_private.attendance_people(id,root_id,user_id,name,company,created_by) values($1,$2,$3,'QA Deltaker','QA Firma',$3)",
    [pid, root, manager],
  );
  await db.query(
    "insert into bolig_private.attendance_visits(id,root_id,name,company,arrived_at) values($1,$2,'QA Manuell','QA Firma',clock_timestamp())",
    [vid, root],
  );
  const attendanceBefore = (
    await db.query(
      "select to_jsonb(p) v from bolig_private.attendance_people p where root_id=$1",
      [root],
    )
  ).rows;
  await actor(manager);
  s = await rpc();
  eq(s.candidates.length, 2);
  eq(
    Object.hasOwn(s.candidates[0], "user_id"),
    false,
    "candidate has no account or portal identifiers",
  );
  await write("person", {
    id: id(995022),
    name: "QA Deltaker",
    source_person_id: pid,
    starts_on: today,
  });
  eq(s.candidates.find((c) => c.id === pid).registered_id, id(995022));
  await rejects(
    () =>
      write("person", {
        id: id(995023),
        name: "Duplicate source",
        source_person_id: pid,
        starts_on: today,
      }),
    "PT409",
  );
  await rejects(
    () =>
      write("person", {
        id: id(995022),
        name: "QA Deltaker",
        starts_on: today,
      }),
    "22023",
  );
  await write("person", {
    id: id(995024),
    name: "QA Manuell",
    source_visit_id: vid,
    starts_on: today,
  });
  for (const user of [reader, outsider]) {
    await actor(user);
    await rejects(() => rpc(), "42501");
    await rejects(() => rpc("get", { snapshot_id: original }), "42501");
  }
  await actor(manager, other);
  await rejects(() => rpc("get", {}, other), "42501");
  await actor(manager);
  await rejects(() => rpc("get", {}, firm, id(1)), "42501");
  await db.exec("select set_config('qa.projects','no',false)");
  await rejects(() => rpc(), "42501");
  await db.exec("select set_config('qa.projects','yes',false)");
  await db.exec("reset role");
  await db.query(
    "update bolig_private.member_access set access_role=$1 where company_id=$2 and user_id=$3",
    ["reader", firm, manager],
  );
  await actor(manager);
  await rejects(() => rpc(), "42501");
  await db.exec("reset role");
  await db.query(
    "update bolig_private.member_access set access_role=$1 where company_id=$2 and user_id=$3",
    ["manager", firm, manager],
  );
  await actor(manager);
  for (const t of [
    "site_roster_people",
    "site_roster_employers",
    "site_roster_state",
    "site_roster_versions",
  ])
    await rejects(() => db.query(`select * from bolig_private.${t}`), "42501");
  await rejects(
    () => db.query("select bolig_private.site_roster_payload($1)", [root]),
    "42501",
  );
  for (const role of ["anon", "service_role"]) {
    await db.exec("reset role;set role " + role);
    await rejects(() => rpc(), "42501");
  }
  await actor(manager);
  await db.exec("reset role");
  await db.query(
    "update bolig_private.firms set enabled=false where company_id=$1",
    [firm],
  );
  await actor(manager);
  await rejects(() => rpc(), "42501");
  await db.exec("reset role");
  await db.query(
    "update bolig_private.firms set enabled=true where company_id=$1",
    [firm],
  );
  // Fixture: simulate an earlier capture before the later versions above.
  await db.query(
    "update bolig_private.site_roster_versions set day=$1 where id=$2",
    [yesterday, settingsVersion],
  );
  await actor(manager);
  const priorDay = await rpc("get", { day: yesterday });
  eq(priorDay.document.revision, 1, "past day must not include later versions");
  eq(priorDay.source_day, yesterday);
  eq(priorDay.readonly, true);
  eq(priorDay.checked, false);
  eq(
    await call("get", root),
    baseline,
    "roster does not mutate project structure",
  );
  await call("archive", root, baseline.root.revision, {
    kind: "root",
    id: root,
    archived: true,
  });
  eq((await rpc()).readonly, true);
  await rejects(() => write("settings", { client_name: "Changed" }), "42501");
  await db.exec("reset role");
  eq(
    (
      await db.query(
        "select to_jsonb(p) v from bolig_private.attendance_people p where root_id=$1",
        [root],
      )
    ).rows,
    attendanceBefore,
    "roster does not alter existing participants",
  );
  await actor(manager);
}
