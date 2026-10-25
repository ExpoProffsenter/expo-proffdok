import fs from "node:fs/promises";
export default async function qualityScenarios({
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
  await db.exec(`reset role;create schema if not exists kshms_private;
 create function kshms_private.identity_snapshot(uuid) returns jsonb language sql as $$select jsonb_build_object('name','QA User','user_id',$1)$$;
 create table public.kshms_checklist_templates(id uuid primary key,company_id uuid,archived boolean default false);
 create table public.kshms_checklist_versions(id uuid primary key,template_id uuid,company_id uuid,number int,content jsonb,content_hash text);
 create table public.company_module_access(company_id uuid,module_key text,enabled boolean);`);
  const helpers = await fs.readFile(
    "supabase/migrations/20261017133759_flexible_checklist_fields_hot_work.sql",
    "utf8",
  );
  await db.exec(
    helpers.slice(
      0,
      helpers.indexOf(
        "\n\n\n--",
        helpers.indexOf(
          "create or replace function kshms_private.checklist_content",
        ),
      ),
    ),
  );
  await db.exec(
    await fs.readFile(
      "supabase/migrations/20261021231138_bolig_native_documentation.sql",
      "utf8",
    ),
  );
  await actor(manager);
  const record = await call("create_plan", null, null, {
    request_id: id(21000),
    title: "QA Native documentation",
    reference: "QA-NATIVE",
    buildings: [
      {
        name: "Bygg A",
        building_type: "apartment",
        address: "QA 22",
        house_floors: 1,
        entrances: [{ address: "QA 22", counts: [2] }],
      },
    ],
  });
  const root = record.root.id,
    unit = record.units[0].id,
    second = record.units[1].id,
    block = record.blocks[0].id;
  const rpc = async (
    scope = unit,
    action = "get",
    rev = null,
    payload = {},
    company = firm,
  ) =>
    (
      await db.query("select public.bolig_quality($1,$2,$3,$4,$5,$6) v", [
        company,
        root,
        scope,
        action,
        rev,
        payload,
      ])
    ).rows[0].v;
  const crpc = async (scope = unit) =>
    (
      await db.query("select public.bolig_completion($1,$2,$3) v", [
        firm,
        root,
        scope,
      ])
    ).rows[0].v;
  const row = async (scope = unit) =>
    (await crpc(scope)).rows.find((x) => x.scope_id === scope);
  let state = await rpc();
  eq(state.revision, 0);
  eq(state.kind, "unit");
  eq((await rpc(block)).kind, "block");
  eq((await rpc(root)).kind, "project");
  const content = {
    title: "Egen boligkontroll",
    trade: "Felles – alle fag",
    instructions: "Kontroller denne leveransen",
    points: [
      {
        id: id(21001),
        title: "Funksjonstest",
        guidance: "",
        comment_required: true,
        image_required: true,
        fields: [
          {
            id: id(21002),
            label: "Trykk",
            type: "number",
            min: 2,
            required: true,
          },
        ],
      },
    ],
  };
  await actor(reader);
  await rejects(() => rpc(unit, "check_add", 0, { content }), "42501");
  await actor(outsider, other);
  await rejects(() => rpc(), "42501");
  await actor(manager);
  state = await rpc(unit, "check_add", 0, { content });
  eq(state.data.checks[0].definition, content);
  const check = state.data.checks[0].id;
  eq(
    (await row()).issues.some((x) => x.includes("ikke fullført")),
    true,
    "Native draft blocks completion",
  );
  await rejects(() => rpc(unit, "check_add", 0, { content }), "PT409");
  const answer = {
    status: "OK",
    comment: "Målt og dokumentert",
    values: { [id(21002)]: "3" },
    documents: [],
  };
  await rejects(
    () =>
      rpc(unit, "check_save", state.revision, {
        id: check,
        answers: { [id(21001)]: answer },
        complete: true,
      }),
    "22023",
  );
  const path = `${firm}/${root}/${unit}/${id(21003)}.jpg`;
  await db.query(
    "insert into storage.objects(bucket_id,name) values('bolig-documents',$1)",
    [path],
  );
  state = await rpc(unit, "document", state.revision, {
    file: { path, title: "Funksjonstest", name: "test.jpg", kind: "photo" },
  });
  const photo = state.data.documents[0].id;
  answer.documents = [photo];
  state = await rpc(unit, "check_save", state.revision, {
    id: check,
    answers: { [id(21001)]: answer },
    complete: true,
  });
  eq(state.data.checks[0].status, "completed");
  eq(state.data.checks[0].completed_by, manager);
  await rejects(
    () =>
      rpc(unit, "check_save", state.revision, {
        id: check,
        answers: {},
        complete: false,
      }),
    "PT409",
  );
  const basis = (await row()).basis;
  state = await rpc(unit, "check_reopen", state.revision, {
    id: check,
    reason: "Ny kontroll etter justering",
  });
  eq(state.data.checks[0].sequence, 2);
  eq(
    (await row()).basis === basis,
    false,
    "Native change invalidates completion basis",
  );
  answer.status = "Lukket avvik";
  await rejects(
    () =>
      rpc(unit, "check_save", state.revision, {
        id: check,
        answers: { [id(21001)]: answer },
        complete: false,
      }),
    "22023",
  );
  answer.status = "Avvik";
  state = await rpc(unit, "check_save", state.revision, {
    id: check,
    answers: { [id(21001)]: answer },
    complete: true,
  });
  eq(
    (await row()).issues.some((x) => x.includes("åpne avvik")),
    true,
  );
  state = await rpc(unit, "check_reopen", state.revision, {
    id: check,
    reason: "Avvik rettet",
  });
  answer.status = "Lukket avvik";
  answer.comment = "Rettet og testet med nytt resultat";
  state = await rpc(unit, "check_save", state.revision, {
    id: check,
    answers: { [id(21001)]: answer },
    complete: true,
  });
  eq(state.data.checks[0].answers[id(21001)].rectified_by, manager);
  eq(
    (await row()).issues.some((x) => x.includes("åpne avvik")),
    false,
  );
  const foreign = `${firm}/${root}/${second}/${id(21004)}.pdf`;
  await db.query(
    "insert into storage.objects(bucket_id,name) values('bolig-documents',$1)",
    [foreign],
  );
  await rejects(
    () =>
      rpc(unit, "document", state.revision, {
        file: {
          path: foreign,
          name: "protocol.pdf",
          title: "Protokoll",
          kind: "protocol",
        },
      }),
    "22023",
  );
  const pdf = `${firm}/${root}/${unit}/${id(21005)}.pdf`;
  await db.query(
    "insert into storage.objects(bucket_id,name) values('bolig-documents',$1)",
    [pdf],
  );
  state = await rpc(unit, "document", state.revision, {
    file: {
      path: pdf,
      name: "protocol.pdf",
      title: "Ekstern kontroll",
      kind: "protocol",
    },
  });
  const doc = state.data.documents[1].id;
  const remarks = [
    {
      id: id(21006),
      text: "Juster skapdør",
      rectified: false,
      evidence: "",
      documents: [],
    },
  ];
  state = await rpc(unit, "protocol_add", state.revision, {
    title: "Ekstern overtagelsesprotokoll",
    document_id: doc,
    remarks,
    no_remarks: "",
  });
  const protocol = state.data.protocols[0].id;
  await rejects(
    () =>
      rpc(unit, "protocol_confirm", state.revision, {
        id: protocol,
        reason: "Alt er kontrollert",
      }),
    "22023",
  );
  remarks[0].rectified = true;
  remarks[0].evidence = "Skapdør justert og kontrollert";
  remarks[0].documents = [photo];
  state = await rpc(unit, "protocol_save", state.revision, {
    id: protocol,
    remarks,
    no_remarks: "",
  });
  state = await rpc(unit, "protocol_confirm", state.revision, {
    id: protocol,
    reason: "Merknadene er rettet og kontrollert",
  });
  eq(state.data.protocols[0].confirmation.by, manager);
  await rejects(
    () =>
      rpc(unit, "protocol_save", state.revision, {
        id: protocol,
        remarks,
        no_remarks: "",
      }),
    "PT409",
  );
  eq(
    (await row()).issues.some((x) => x.includes("eksterne protokoller")),
    false,
  );
  const confirmed = state.data.protocols[0].confirmation;
  state = await rpc(unit, "protocol_add", state.revision, {
    title: "Revidert protokoll",
    document_id: doc,
    replaces: protocol,
    reason: "Ny utgave fra kontrollør",
    remarks,
    no_remarks: "",
  });
  eq(
    state.data.protocols[0].confirmation,
    confirmed,
    "Original confirmation remains immutable",
  );
  eq(state.data.protocols[0].superseded, true);
  eq(
    (await row()).issues.some((x) => x.includes("eksterne protokoller")),
    true,
  );
  await actor(reader);
  eq((await rpc()).data.protocols.length, 2);
  await rejects(
    () =>
      db.query(
        "insert into storage.objects(bucket_id,name) values('bolig-documents',$1)",
        [`${firm}/${root}/${unit}/${id(21008)}.pdf`],
      ),
    "42501",
  );
  eq(
    (await db.query("select public.bolig_document_access($1,true) v", [pdf]))
      .rows[0].v,
    false,
  );
  await actor(manager);
  const templateId = id(21009),
    versionId = id(21010);
  await db.exec("reset role");
  await db.query(
    "insert into public.kshms_checklist_templates values($1,$2,false)",
    [templateId, firm],
  );
  await db.query(
    "insert into public.kshms_checklist_versions values($1,$2,$3,1,$4,$5)",
    [versionId, templateId, firm, content, "frozen-hash"],
  );
  await db.query(
    "insert into public.company_module_access values($1,'kshms',true)",
    [firm],
  );
  await actor(manager);
  state = await rpc();
  eq(state.templates[0].id, versionId);
  state = await rpc(unit, "check_add", state.revision, {
    version_id: versionId,
    content: { title: "Forged" },
  });
  eq(
    state.data.checks[1].definition,
    content,
    "Imported edition copied by server",
  );
  eq(state.data.checks[1].source_hash, "frozen-hash");
  await rejects(
    () => rpc(unit, "check_add", state.revision, { version_id: id(99999) }),
    "42501",
  );
  // Read histories are scoped. Full immutable snapshots are inaccessible directly.
  eq(state.history.length > 5, true);
  await rejects(
    () => db.query("select * from bolig_private.quality_events"),
    "42501",
  );
  // New FDV links survive normalization and frozen choice snapshots.
  const cat = async (action = "state", revision = null, payload = {}) =>
    (
      await db.query("select public.bolig_catalog($1,$2,$3,$4,$5) v", [
        firm,
        root,
        action,
        revision,
        payload,
      ])
    ).rows[0].v;
  let catalog = await cat("package", 0, {
    name: "QA FDV",
    sections: [],
    lines: [
      {
        key: "tap",
        name: "Batteri",
        sku: "QA-TAP",
        quantity: 1,
        unit: "stk",
        fdv_url: "https://example.org/fdv.pdf",
        image_url: "",
        product_url: "",
      },
    ],
  });
  eq(catalog.packages[0].lines[0].fdv_url, "https://example.org/fdv.pdf");
  await rejects(
    () =>
      cat("package", catalog.revision, {
        name: "Bad URL",
        sections: [],
        lines: [
          {
            key: "tap",
            name: "Batteri",
            quantity: 1,
            unit: "stk",
            fdv_url: "javascript:alert(1)",
          },
        ],
      }),
    "22023",
  );
  await cat("choose", catalog.revision, {
    unit_id: unit,
    package_id: catalog.packages[0].id,
    option_ids: [],
    choice_revision: 0,
  });
  state = await rpc();
  eq(state.fdv[0].fdv_url, "https://example.org/fdv.pdf");
  const key = state.fdv[0].key;
  state = await rpc(unit, "fdv_link", state.revision, {
    key,
    url: "https://example.org/new-fdv.pdf",
    reason: "Ny produsentlenke",
  });
  eq(state.fdv[0].corrected, true);
  eq(state.fdv[0].fdv_url, "https://example.org/new-fdv.pdf");
  eq((await rpc(root)).fdv.length, 1);
  eq((await rpc(block)).fdv.length, 1);
  await rejects(
    () =>
      rpc(second, "fdv_link", 0, {
        key,
        url: "https://example.org/evil",
        reason: "Wrong unit",
      }),
    "22023",
  );
  await db.exec("reset role");
  const frozen = (
    await db.query(
      "select snapshot from bolig_private.choice_versions where unit_id=$1",
      [unit],
    )
  ).rows[0].snapshot;
  eq(
    frozen.goods[0].fdv_url,
    "https://example.org/fdv.pdf",
    "Frozen choice not rewritten by correction",
  );
  await actor(manager);
  await db.exec("reset role");
  await db.exec(
    await fs.readFile(
      "supabase/migrations/20261021231808_bolig_protocol_confirmation_email.sql",
      "utf8",
    ),
  );
  await actor(manager);
  state = await rpc();
  const newer = state.data.protocols.find((p) => !p.superseded);
  state = await rpc(unit, "protocol_confirm", state.revision, {
    id: newer.id,
    reason: "Ny utgave kontrollert og rettet",
  });
  const confirmation = state.data.protocols.find(
    (p) => p.id === newer.id,
  ).confirmation;
  const mail = async (action, payload = {}, company = firm) =>
    (
      await db.query("select public.bolig_protocol_mail($1,$2,$3,$4,$5) v", [
        company,
        root,
        unit,
        action,
        { protocol_id: newer.id, ...payload },
      ])
    ).rows[0].v;
  const requestId = id(21101);
  await rejects(
    () =>
      mail("prepare", {
        request_id: requestId,
        confirmation_id: confirmation.id,
        to: "bad\r\nbcc@example.org",
      }),
    "22023",
  );
  let prepared = await mail("prepare", {
    request_id: requestId,
    confirmation_id: confirmation.id,
    to: "QA-Recipient@EXAMPLE.INVALID",
  });
  eq(prepared.snapshot.to, "qa-recipient@example.invalid");
  eq(prepared.snapshot.protocol.confirmation.id, confirmation.id);
  eq(prepared.sent, false);
  eq(prepared.begun_at, null, "Preparing does not send");
  const duplicate = await mail("prepare", {
    request_id: id(21102),
    confirmation_id: confirmation.id,
    to: "qa-recipient@example.invalid",
  });
  eq(duplicate.id, requestId, "Same confirmation/recipient reuses attempt");
  await actor(reader);
  await rejects(() => mail("inspect", { request_id: requestId }), "42501");
  await actor(outsider, other);
  await rejects(() => mail("inspect", { request_id: requestId }), "42501");
  await actor(manager);
  const claim = await mail("begin", { request_id: requestId });
  eq(Boolean(claim.begun_at), true);
  await rejects(
    () =>
      mail("prepare", {
        request_id: id(21103),
        confirmation_id: confirmation.id,
        to: "second@example.invalid",
      }),
    "PT409",
  );
  await rejects(
    () =>
      db.query("select public.bolig_protocol_mail_complete($1,$2)", [
        requestId,
        "provider-qa",
      ]),
    "42501",
  );
  const repeat = await mail("begin", { request_id: requestId });
  eq(repeat.id, claim.id);
  eq(
    repeat.begun_at,
    claim.begun_at,
    "Retry is same provider idempotency window",
  );
  await db.exec("reset role;set role service_role");
  await db.query("select public.bolig_protocol_mail_complete($1,$2)", [
    requestId,
    "provider-qa",
  ]);
  await actor(manager);
  eq((await mail("inspect", { request_id: requestId })).sent, true);
  state = await rpc(unit, "protocol_reopen", state.revision, {
    id: newer.id,
    reason: "Etterkontroll nødvendig",
  });
  await rejects(
    () =>
      mail("prepare", {
        request_id: id(21104),
        confirmation_id: confirmation.id,
        to: "second@example.invalid",
      }),
    "PT409",
  );
  eq(
    (await mail("list")).history[0].snapshot.protocol.confirmation.id,
    confirmation.id,
    "Frozen mail survives later reopening",
  );
  const oldData = await rpc(unit, "history", state.revision - 1);
  eq(
    oldData.data.protocols.find((p) => p.id === newer.id).confirmation.id,
    confirmation.id,
    "Historical protocol is readable unchanged",
  ); // Protocol import can atomically register a newly uploaded original.
  const inlinePath = `${firm}/${root}/${block}/${id(21110)}.pdf`;
  await db.query(
    "insert into storage.objects(bucket_id,name) values('bolig-documents',$1)",
    [inlinePath],
  );
  const imported = await rpc(block, "protocol_add", 0, {
    title: "Byggets protokoll",
    file: {
      path: inlinePath,
      name: "byggprotokoll.pdf",
      title: "Byggets protokoll",
      kind: "protocol",
    },
    remarks: [],
    no_remarks: "Originalen er kontrollert. Ingen merknader.",
  });
  eq(imported.data.documents.length, 1, "New original registered atomically");
  eq(imported.data.protocols[0].document_id, imported.data.documents[0].id);
  await rejects(
    () =>
      rpc(block, "protocol_add", imported.revision, {
        title: "Feil scope",
        file: {
          path: pdf,
          name: "foreign.pdf",
          title: "Feil",
          kind: "protocol",
        },
        remarks: [],
        no_remarks: "Ingen",
      }),
    "22023",
  );
  const beforeConfirm = (await crpc(block)).rows.find(
    (x) => x.scope_id === block,
  );
  eq(
    beforeConfirm.issues.some((x) => x.includes("eksterne protokoller")),
    true,
    "Own common-scope protocol blocks parent completion",
  );
  const confirmedBlock = await rpc(
    block,
    "protocol_confirm",
    imported.revision,
    {
      id: imported.data.protocols[0].id,
      reason: "Originalen kontrollert uten merknader",
    },
  );
  eq(Boolean(confirmedBlock.data.protocols[0].confirmation.id), true);
}
