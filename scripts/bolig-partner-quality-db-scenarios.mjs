export default async function ({
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
}) {
  const token = "9a".repeat(32),
    otherToken = "9b".repeat(32),
    grant = id(98300);
  const quality = async (action, payload = {}, t = token) =>
    (
      await db.query("select public.bolig_partner_quality($1,$2,$3) v", [
        t,
        action,
        payload,
      ])
    ).rows[0].v;
  const anon = () =>
    db.exec("reset role;select set_config('qa.user','',false);set role anon");
  await actor(manager);
  const base = {
    id: grant,
    request_id: id(98301),
    name: "QA UE",
    email: "ue@qa.invalid",
    organisation: "QA UE Firma",
    kind: "ue",
    days: 7,
    token,
    access_mode: "project",
    features: ["checklists"],
    reviewed: true,
  };
  await rejects(
    () =>
      rpc("create", {
        ...base,
        id: id(98302),
        request_id: id(98303),
        kind: "supplier",
        features: ["checklists", "quality_write"],
      }),
    "22023",
  );
  await rejects(
    () =>
      rpc("create", {
        ...base,
        id: id(98302),
        request_id: id(98303),
        features: ["quality_write"],
      }),
    "22023",
  );
  await rpc("create", base);
  await rpc("create", {
    ...base,
    id: id(98304),
    request_id: id(98305),
    token: otherToken,
  });
  await anon();
  let s = await portal(token);
  eq(s.quality.checks, []);
  eq(s.quality.documents, []);
  eq(s.quality.scopes.length, 44, "root, two blocks and 41 active units");
  const scope = s.checklists[0].scope_id,
    source = s.checklists[0].id;
  const copy = {
    id: id(98306),
    request_id: id(98307),
    scope_id: scope,
    source_id: source,
    source_scope_id: scope,
  };
  await rejects(() => quality("check_add", copy), "42501");
  await actor(manager);
  s = await rpc();
  let g = s.partners.find((x) => x.id === grant);
  await rpc("permissions", {
    id: grant,
    request_id: id(98308),
    revision: g.revision,
    access_mode: "project",
    features: ["checklists", "quality_write"],
    reviewed: true,
  });
  await anon();
  s = await quality("check_add", copy);
  eq(s.quality.checks.length, 1);
  eq(
    (await quality("check_add", copy)).quality.checks.length,
    1,
    "copy exact replay",
  );
  eq(s.quality.checks[0].record.partner_id, grant);
  eq(s.quality.checks[0].record.required, false);
  await rejects(
    () =>
      quality("check_save", {
        id: source,
        scope_id: scope,
        request_id: id(98309),
        revision: s.quality.checks[0].revision,
        answers: {},
        complete: false,
      }),
    "42501",
  );
  await rejects(
    () =>
      quality("check_save", {
        id: copy.id,
        scope_id: scope,
        request_id: id(98309),
        revision: s.quality.checks[0].revision,
        answers: {},
        complete: false,
        required: true,
      }),
    "22023",
  );
  const own = s.quality.checks[0],
    point = own.record.definition.points[0];
  let answer = {
    id: copy.id,
    scope_id: scope,
    request_id: id(98310),
    revision: own.revision,
    answers: { [point.id]: { status: "OK", comment: "UE kontrollert" } },
    complete: true,
  };
  s = await quality("check_save", answer);
  eq(s.quality.checks[0].record.status, "completed");
  eq(s.quality.checks[0].record.completed_by, null);
  eq(s.quality.checks[0].record.completed_partner_id, grant);
  eq(
    (await quality("check_save", answer)).quality.checks[0].revision,
    s.quality.checks[0].revision,
    "completed answer replay does not duplicate revision",
  );
  await rejects(
    () =>
      quality("check_save", {
        ...answer,
        request_id: id(98311),
        revision: s.quality.checks[0].revision,
      }),
    "PT409",
  );
  await rejects(
    () =>
      quality("check_save", { ...answer, request_id: id(98312) }, otherToken),
    "42501",
  );
  // Reservation and actual object presence are both required. Raw Storage remains denied.
  const file = {
    id: id(98313),
    scope_id: scope,
    name: "kontroll.pdf",
    mime: "application/pdf",
    size: 20,
    sha256: "a".repeat(64),
  };
  let upload = await quality("file_prepare", file);
  eq((await quality("file_prepare", file)).path, upload.path);
  await rejects(() => quality("file_prepare", { ...file, size: 21 }), "PT409");
  await rejects(
    () =>
      quality("file_prepare", { ...file, id: id(98314), mime: "text/html" }),
    "22023",
  );
  await rejects(
    () =>
      quality("document", {
        id: file.id,
        scope_id: scope,
        title: "Egen PDF-liste",
        request_id: id(98315),
      }),
    "22023",
  );
  await rejects(
    () =>
      db.query(
        "insert into storage.objects(bucket_id,name) values('bolig-documents',$1)",
        [upload.path],
      ),
    "42501",
  );
  await db.exec("reset role");
  await db.query(
    "insert into storage.objects(bucket_id,name) values('bolig-documents',$1)",
    [upload.path],
  );
  await anon();
  const document = {
    id: file.id,
    scope_id: scope,
    title: "Egen PDF-liste",
    request_id: id(98315),
  };
  s = await quality("document", document);
  eq(s.quality.documents.length, 1);
  eq((await quality("document", document)).quality.documents.length, 1);
  eq((await quality("file_get", { id: file.id })).path, upload.path);
  await rejects(
    () => quality("file_get", { id: file.id }, otherToken),
    "42501",
  );
  eq(
    JSON.stringify(s.quality.documents).includes("path"),
    false,
    "own file list does not publish Storage paths",
  );
  const numeric = id(98317),
    sign = id(98318),
    p1 = id(98319),
    p2 = id(98320);
  const create = {
    id: id(98316),
    scope_id: scope,
    request_id: id(98321),
    content: {
      title: "UE målekontroll",
      trade: "Rørlegger",
      instructions: "Mål og bekreft",
      points: [
        {
          id: p1,
          title: "Måling",
          image_required: true,
          comment_required: true,
          fields: [
            {
              id: numeric,
              type: "number",
              label: "Trykk",
              required: true,
              min: 1,
            },
          ],
        },
        {
          id: p2,
          title: "Bekreft arbeidet",
          fields: [
            {
              id: sign,
              type: "confirmation",
              label: "Egen bekreftelse",
              required: true,
            },
          ],
        },
      ],
    },
  };
  s = await quality("check_add", create);
  g = s.quality.checks.find((x) => x.record.id === create.id);
  const write = {
    id: create.id,
    scope_id: scope,
    request_id: id(98322),
    revision: g.revision,
    answers: {
      [p1]: {
        status: "OK",
        comment: "Målt",
        values: { [numeric]: "5" },
        documents: [file.id],
      },
      [p2]: {
        status: "OK",
        values: { [sign]: { confirmed: true, confirmation_id: id(98323) } },
      },
    },
    complete: true,
  };
  await rejects(
    () => quality("check_save", write),
    "22023",
    "PDF is not an image",
  );
  const photo = {
    ...file,
    id: id(98324),
    name: "bilde.png",
    mime: "image/png",
  };
  upload = await quality("file_prepare", photo);
  await db.exec("reset role");
  await db.query(
    "insert into storage.objects(bucket_id,name) values('bolig-documents',$1)",
    [upload.path],
  );
  await anon();
  s = await quality("document", {
    id: photo.id,
    scope_id: scope,
    title: "UE kontrollbilde",
    request_id: id(98325),
  });
  await rejects(
    () => quality("check_save", write),
    "PT409",
    "scope revision changed by upload",
  );
  const save = {
    ...write,
    revision: s.quality.checks.find((x) => x.record.id === create.id).revision,
    answers: {
      ...write.answers,
      [p1]: { ...write.answers[p1], documents: [photo.id] },
    },
  };
  s = await quality("check_save", save);
  g = s.quality.checks.find((x) => x.record.id === create.id);
  eq(g.record.status, "completed");
  eq(g.record.answers[p2].values[sign].signed_by, grant);
  eq(g.record.answers[p2].values[sign].identity.via, "partner_link");
  await db.exec("reset role");
  const native = (
    await db.query(
      "select data,revision from bolig_private.quality_states where root_id=$1 and scope_id=$2",
      [root, scope],
    )
  ).rows[0];
  eq(
    native.data.checks.find((x) => x.id === source).status,
    "completed",
    "original source never overwritten",
  );
  eq(native.data.documents.filter((x) => x.partner_id === grant).length, 2);
  const events = (
    await db.query(
      "select actor_id,partner_id from bolig_private.quality_events where root_id=$1 and partner_id=$2",
      [root, grant],
    )
  ).rows;
  eq(events.length, 6);
  eq(
    events.every((x) => x.actor_id === null && x.partner_id === grant),
    true,
    "truthful external audit, no issuer impersonation",
  );
  await actor(manager);
  s = await rpc();
  g = s.partners.find((x) => x.id === grant);
  const nativeView = (
    await db.query("select public.bolig_quality($1,$2,$3) v", [
      firm,
      root,
      scope,
    ])
  ).rows[0].v;
  eq(
    [
      ...new Set(
        nativeView.history
          .filter((h) => h.actor_name.startsWith("UE-lenke:"))
          .map((h) => h.action),
      ),
    ].sort(),
    ["partner_check_add", "partner_check_save", "partner_document"],
    "native history reads stored event actions, not the get parameter",
  );
  await rpc("permissions", {
    id: grant,
    request_id: id(98326),
    revision: g.revision,
    access_mode: "project",
    features: ["checklists"],
    reviewed: true,
  });
  await anon();
  await rejects(
    () => quality("check_save", save),
    "42501",
    "write removal before receipt replay",
  );
  await rejects(() => quality("file_prepare", photo), "42501");
  eq(
    (await quality("file_get", { id: photo.id })).name,
    photo.name,
    "retained checklist read can read own files",
  );
  await actor(manager);
  await rpc("revoke", { id: grant, request_id: id(98327) });
  await anon();
  await rejects(() => quality("file_get", { id: photo.id }), "42501");
  await rejects(() => quality("check_save", save), "42501");
  await rejects(
    () => db.query("select * from bolig_private.partner_uploads"),
    "42501",
  );
  await actor(manager);
}
