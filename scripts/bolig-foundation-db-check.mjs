import fs from "node:fs/promises";
import assert from "node:assert/strict";
import streamlined from "./bolig-streamlined-db-scenarios.mjs";
import progressScenarios from "./bolig-progress-db-scenarios.mjs";
import portalScenarios from "./bolig-portal-db-scenarios.mjs";
import commerceScenarios from "./bolig-commerce-db-scenarios.mjs";
import qualityScenarios from "./bolig-quality-db-scenarios.mjs";
import completionScenarios from "./bolig-completion-db-scenarios.mjs";
import customizationScenarios from "./bolig-customization-db-scenarios.mjs";
import imageScenarios from "./bolig-images-db-scenarios.mjs";
import deliveryScenarios from "./bolig-delivery-db-scenarios.mjs";
import sectionScenarios from "./bolig-sections-db-scenarios.mjs";
import preparationScenarios from "./bolig-preparation-db-scenarios.mjs";
import packageScenarios from "./bolig-package-choices-db-scenarios.mjs";
import contentScenarios from "./bolig-room-content-db-scenarios.mjs";
import roomsScenarios from "./bolig-rooms-db-scenarios.mjs";
const { PGlite } = await import(
  process.env.HR_PGLITE_PATH || "@electric-sql/pglite"
);
const db = await PGlite.create();
const id = (n) => "30000000-0000-4000-8000-" + String(n).padStart(12, "0");
const firm = id(1),
  other = id(2),
  admin = id(3),
  manager = id(4),
  reader = id(5),
  outsider = id(6),
  system = id(7),
  project = id(8),
  otherProject = id(9);
const q = (x) => "'" + String(x).replaceAll("'", "''") + "'";
let checks = 0;
const eq = (a, b, m) => {
  assert.deepEqual(a, b, m);
  checks++;
};
const actor = async (u = admin, c = firm) =>
  db.exec(
    `reset role;select set_config('qa.user',${q(u)},false);select set_config('qa.company',${q(c)},false);set role authenticated;`,
  );
const call = async (
  action = "context",
  root = null,
  rev = null,
  payload = {},
  company = firm,
) => {
  const r = await db.query("select public.bolig_workspace($1,$2,$3,$4,$5) v", [
    company,
    action,
    root,
    rev,
    payload,
  ]);
  return r.rows[0].v;
};
const rejects = async (fn, code) => {
  await db.exec("savepoint denied");
  let error;
  try {
    await fn();
  } catch (e) {
    error = e;
  }
  await db.exec("rollback to savepoint denied;release savepoint denied");
  assert(error, "Expected denial");
  if (code) assert.equal(error.code, code, error.message);
  checks++;
};
try {
  await db.exec(
    `create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql as $$select nullif(current_setting('qa.user',true),'')::uuid$$;create function public.current_active_company_scope_id() returns uuid language sql as $$select nullif(current_setting('qa.company',true),'')::uuid$$;create table public.sales_company_scopes(id uuid primary key,display_name text);create table public.profiles(id uuid primary key,email text,approved boolean default true,deactivated boolean default false,role text default 'member',system_role text);create table public.sales_company_memberships(company_id uuid,user_id uuid,workspace_role text);create table public.projects(id uuid primary key,company_scope_id uuid,user_id uuid,title text,locked boolean default false,updated_at timestamptz default now());create function public.current_profile_is_systemadmin() returns boolean language sql security definer as $$select exists(select 1 from public.profiles where id=auth.uid() and system_role='systemadmin' and approved and not deactivated)$$;create function public.current_user_has_module_access(text) returns boolean language sql as $$select coalesce(current_setting('qa.projects',true),'yes')<>'no'$$;create function public.project_row_access_allowed(uuid,uuid) returns boolean language sql as $$select public.current_profile_is_systemadmin() or ($1=public.current_active_company_scope_id() and coalesce(current_setting('qa.project_read',true),'yes')<>'no')$$;grant usage on schema auth to authenticated;`,
  );
  await db.query(
    "insert into public.sales_company_scopes values($1,$2),($3,$4)",
    [firm, "Firma A", other, "Firma B"],
  );
  for (const [u, role, company] of [
    [admin, "firmaadmin", firm],
    [manager, "ansatt", firm],
    [reader, "ansatt", firm],
    [outsider, "ansatt", other],
    [system, "firmaadmin", firm],
  ]) {
    await db.query("insert into auth.users values($1)", [u]);
    await db.query(
      "insert into public.profiles(id,email,system_role) values($1,$2,$3)",
      [
        u,
        "test-" + u.slice(-1) + "@example.invalid",
        u === system ? "systemadmin" : null,
      ],
    );
    await db.query(
      "insert into public.sales_company_memberships values($1,$2,$3)",
      [company, u, role],
    );
  }
  await db.query(
    "insert into public.projects(id,company_scope_id,user_id,title) values($1,$2,$3,$4),($5,$6,$3,$4)",
    [project, firm, admin, "Ordinary project", otherProject, other],
  );
  await db.exec(
    await fs.readFile(
      "supabase/migrations/20261020201453_boligprosjekter_foundation.sql",
      "utf8",
    ),
  );
  await db.exec(
    await fs.readFile(
      "supabase/migrations/20261020202637_boligprosjekter_fk_indexes.sql",
      "utf8",
    ),
  );
  await db.exec(
    await fs.readFile(
      "supabase/migrations/20261020203617_boligprosjekter_root_list_scope.sql",
      "utf8",
    ),
  );
  await db.exec(
    await fs.readFile(
      "supabase/migrations/20261020204107_boligprosjekter_conflict_http_status.sql",
      "utf8",
    ),
  );
  await db.exec(
    await fs.readFile(
      "supabase/migrations/20261020205027_boligprosjekter_project_link_lifecycle.sql",
      "utf8",
    ),
  );
  await db.exec(
    await fs.readFile(
      "supabase/migrations/20261020212755_boligprosjekter_systemadmin_firm_access.sql",
      "utf8",
    ),
  );
  await db.exec(
    await fs.readFile(
      "supabase/migrations/20261020214210_boligprosjekter_packages_choices.sql",
      "utf8",
    ),
  );
  await db.exec(
    await fs.readFile(
      "supabase/migrations/20261020215336_boligprosjekter_choice_unit_index.sql",
      "utf8",
    ),
  );
  await db.exec(
    await fs.readFile(
      "supabase/migrations/20261020220230_boligprosjekter_order_drafts_product_images.sql",
      "utf8",
    ),
  );
  await db.exec(
    await fs.readFile(
      "supabase/migrations/20261020223523_boligprosjekter_overview_status.sql",
      "utf8",
    ),
  );
  await db.exec(
    await fs.readFile(
      "supabase/migrations/20261020230426_boligprosjekter_unit_contact.sql",
      "utf8",
    ),
  );
  await db.exec(
    await fs.readFile(
      "supabase/migrations/20261021000023_bolig_project_builder.sql",
      "utf8",
    ),
  );
  await db.exec(
    await fs.readFile(
      "supabase/migrations/20261021001124_bolig_building_household_guard.sql",
      "utf8",
    ),
  );
  await db.exec(
    await fs.readFile(
      "supabase/migrations/20261021145003_bolig_rooms.sql",
      "utf8",
    ),
  );
  await db.exec(
    await fs.readFile(
      "supabase/migrations/20261021145829_bolig_room_fk_indexes.sql",
      "utf8",
    ),
  );
  await db.exec(
    await fs.readFile(
      "supabase/migrations/20261021155350_bolig_room_contents.sql",
      "utf8",
    ),
  );
  await db.exec(
    await fs.readFile(
      "supabase/migrations/20261021163256_bolig_scoped_package_choices.sql",
      "utf8",
    ),
  );
  await db.exec(
    `create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);create table storage.objects(bucket_id text,name text,primary key(bucket_id,name));alter table storage.objects enable row level security;grant usage on schema storage to authenticated,anon;grant select,insert,update,delete on storage.objects to authenticated,anon;`,
  );
  await db.exec(
    await fs.readFile(
      "supabase/migrations/20261021173913_bolig_catalog_image_uploads.sql",
      "utf8",
    ),
  );
  await db.exec(await fs.readFile("supabase/migrations/20261021182208_bolig_project_preparation.sql", "utf8"));
  await db.exec(await fs.readFile("supabase/migrations/20261021194409_bolig_catalog_sections.sql", "utf8"));
  await db.exec(await fs.readFile("supabase/migrations/20261021202352_bolig_orders_deliveries.sql", "utf8"));
  await db.exec(`alter table auth.users add column email text default 'qa@example.invalid';create function public.get_cordel_export_access() returns boolean language sql as $$select coalesce(current_setting('qa.cordel',true),'yes')<>'no'$$;create function public.work_profile_company_profile(uuid) returns jsonb language sql as $$select '{"companyName":"QA Firma","address":"QA gate"}'::jsonb$$;`);
  await db.exec(await fs.readFile("supabase/migrations/20261021203036_bolig_order_email_attachments.sql", "utf8"));
  await db.exec(await fs.readFile("supabase/migrations/20261021204213_bolig_delivery_overview.sql", "utf8"));
  await db.exec(await fs.readFile("supabase/migrations/20261021205031_bolig_delivery_fk_indexes.sql", "utf8"));
  await db.exec(await fs.readFile("supabase/migrations/20261021213014_bolig_unit_customization.sql", "utf8"));
  await db.exec(await fs.readFile("supabase/migrations/20261021215044_bolig_order_mail_sender_access.sql", "utf8"));
  await db.exec("begin");
  await actor();
  eq((await call()).enabled, false);
  await rejects(() => call("create", null, null, { title: "Denied" }), "42501");
  await rejects(() => call("license", null, 0, { enabled: true }), "42501");
  await actor(system);
  let access = await call("license", null, 0, { enabled: true });
  eq(access.context.enabled, true);
  await rejects(() => call("license", null, 0, { enabled: false }), "PT409");
  await actor();
  access = await call("member", null, 0, { user_id: manager, role: "manager" });
  await call("member", null, 0, { user_id: reader, role: "reader" });
  await rejects(
    () => call("member", null, 0, { user_id: outsider, role: "manager" }),
    "42501",
  );
  await rejects(
    () => call("member", null, 0, { user_id: manager, role: "reader" }),
    "PT409",
  );
  await actor(manager);
  let result = await call("create", null, null, {
    title: "Felles boligprosjekt",
    reference: "BP-1",
  });
  const root = result.root.id;
  eq(
    (await call("list")).roots.map((x) => x.id),
    [root],
    "Created root must appear in shared list",
  );
  eq(result.root.revision, 1);
  const mutate = async (action, payload) => {
    result = await call(action, root, result.root.revision, payload);
    return result;
  };
  await mutate("block", { name: "Blokk A" });
  const block = result.blocks[0].id;
  await mutate("entrance", {
    block_id: block,
    address: "Eksempelgata 1A",
    counts: Array(25).fill(20),
  });
  eq(result.units.length, 500);
  const entrance = result.entrances[0].id;
  const unit = result.units[0];
  await mutate("unit", {
    id: unit.id,
    number: "H0101",
    contact_name: "Eksempel Person",
    contact_email: " EKSEMPEL@EXAMPLE.INVALID ",
    contact_phone: " +47 900 00 000 ",
    project_id: project,
  });
  eq(result.units.find((x) => x.id === unit.id).project_id, project);
  eq(
    result.units.find((x) => x.id === unit.id).contact_email,
    "eksempel@example.invalid",
  );
  eq(
    result.units.find((x) => x.id === unit.id).contact_phone,
    "+47 900 00 000",
  );
  await rejects(
    () =>
      mutate("unit", {
        id: unit.id,
        number: "H0101",
        contact_email: "invalid",
        project_id: project,
      }),
    "23514",
  );
  await rejects(
    () =>
      mutate("unit", {
        id: unit.id,
        number: "H0101",
        contact_phone: "x".repeat(41),
        project_id: project,
      }),
    "23514",
  );
  await rejects(
    () =>
      mutate("unit", {
        id: unit.id,
        number: "H0101",
        contact_email: 42,
        project_id: project,
      }),
    "22023",
  );
  await mutate("unit", {
    id: unit.id,
    number: "H0101",
    contact_name: "Eksempel Person",
    project_id: project,
  });
  eq(
    result.units.find((x) => x.id === unit.id).contact_email,
    "eksempel@example.invalid",
    "Older clients must not erase contacts",
  );
  await mutate("resize", {
    id: entrance,
    address: "Eksempelgata 1A",
    counts: [20],
  });
  eq(result.units.length, 500);
  eq(result.units.filter((x) => !x.archived).length, 20);
  await mutate("resize", {
    id: entrance,
    address: "Eksempelgata 1A",
    counts: Array(25).fill(20),
  });
  eq(
    result.units.find((x) => x.id === unit.id).contact_name,
    "Eksempel Person",
  );
  await rejects(() => call("block", root, 1, { name: "Stale draft" }), "PT409");
  const revision = result.root.revision;
  await actor(reader);
  eq((await call("get", root)).units.length, 500);
  eq(
    (await call("get", root)).units.find((x) => x.id === unit.id).contact_phone,
    "+47 900 00 000",
  );
  await rejects(
    () =>
      call("unit", root, result.root.revision, {
        id: unit.id,
        number: "H0101",
        contact_email: "changed@example.invalid",
      }),
    "42501",
  );
  eq((await call("list")).roots[0].unit_count, 500);
  await db.exec(
    "reset role;select set_config('qa.project_read','no',false);set role authenticated",
  );
  const masked = (await call("get", root)).units.find((x) => x.id === unit.id);
  eq(masked.has_project, true);
  eq(masked.project_id, null);
  eq((await call("projects", root)).projects, []);
  await db.exec(
    "reset role;select set_config('qa.project_read','yes',false);set role authenticated",
  );
  await rejects(
    () => call("block", root, revision, { name: "Denied" }),
    "42501",
  );
  await rejects(() => call("access"), "42501");
  await rejects(() => db.query("select * from bolig_private.units"), "42501");
  await actor(system, other);
  await call("license", null, 0, { enabled: true }, other);
  await call("member", null, 0, { user_id: outsider, role: "manager" }, other);
  await actor(outsider, other);
  eq((await call("context", null, null, {}, other)).enabled, true);
  eq((await call("list", null, null, {}, other)).roots, []);
  await rejects(() => call("get", root, null, {}, other), "42501");
  await actor(manager, other);
  await rejects(() => call("get", root), "42501");
  await actor(manager);
  await rejects(
    () =>
      mutate("unit", {
        id: unit.id,
        number: "H0101",
        project_id: otherProject,
      }),
    "42501",
  );
  await rejects(
    () =>
      mutate("entrance", { block_id: block, address: "Invalid", counts: [0] }),
    "22023",
  );
  eq((await call("get", root)).root.revision, revision);
  await mutate("archive", { kind: "block", id: block, archived: true });
  await mutate("archive", { kind: "block", id: block, archived: false });
  eq(result.units.find((x) => x.id === unit.id).project_id, project);
  await rejects(
    () =>
      mutate("unit", {
        id: result.units[1].id,
        number: "H0102",
        project_id: project,
      }),
    "23505",
  );
  await db.exec(
    `reset role;update public.projects set locked=true where id=${q(project)}`,
  );
  await actor(manager);
  await rejects(
    () => mutate("unit", { id: unit.id, number: "H0101", project_id: project }),
    "42501",
  );
  const deletable = id(10),
    secondUnit = result.units[1].id;
  await db.exec("reset role");
  await db.query(
    "insert into public.projects(id,company_scope_id,user_id,title) values($1,$2,$3,$4)",
    [deletable, firm, manager, "Disposable QA project"],
  );
  await actor(manager);
  await mutate("unit", {
    id: secondUnit,
    number: "H0102",
    contact_name: "Keep unit",
    project_id: deletable,
  });
  await db.exec("reset role");
  await db.query("delete from public.projects where id=$1", [deletable]);
  await actor(manager);
  const retained = (await call("get", root)).units.find(
    (x) => x.id === secondUnit,
  );
  eq(retained.project_id, null);
  eq(retained.contact_name, "Keep unit");
  const moved = id(11);
  await db.exec("reset role");
  await db.query(
    "insert into public.projects(id,company_scope_id,user_id,title) values($1,$2,$3,$4)",
    [moved, firm, manager, "Movable QA project"],
  );
  await actor(manager);
  await mutate("unit", { id: secondUnit, number: "H0102", project_id: moved });
  await db.exec("reset role");
  await db.query("update public.projects set company_scope_id=$1 where id=$2", [
    other,
    moved,
  ]);
  await actor(system);
  const scoped = (await call("get", root)).units.find(
    (x) => x.id === secondUnit,
  );
  eq(scoped.has_project, true);
  eq(scoped.project_id, null);
  const catalog = async (
    action = "state",
    expected = null,
    payload = {},
    rootId = root,
    company = firm,
  ) =>
    (
      await db.query("select public.bolig_catalog($1,$2,$3,$4,$5) v", [
        company,
        rootId,
        action,
        expected,
        payload,
      ])
    ).rows[0].v;
  let catalogState = await catalog();
  eq(catalogState.revision, 0);
  const baseLine = {
    key: "standard-servant",
    name: "Standard servant",
    sku: "STD-1",
    quantity: 1,
    unit: "stk",
    credit_cents: 10000,
  };
  catalogState = await catalog("package", 0, {
    name: "Standard",
    lines: [baseLine],
  });
  const packageId = catalogState.packages[0].id;
  await rejects(
    () => catalog("package", 0, { name: "Conflict", lines: [baseLine] }),
    "PT409",
  );
  await rejects(
    () =>
      catalog("package", 1, {
        name: "Duplicate keys",
        lines: [baseLine, baseLine],
      }),
    "22023",
  );
  await rejects(
    () =>
      catalog("package", 1, {
        name: "Fractional cents",
        lines: [{ ...baseLine, credit_cents: 1.5 }],
      }),
    "22023",
  );
  const extra = {
    name: "Ekstra knagg",
    sku: "EXTRA-1",
    quantity: 2,
    unit: "stk",
    price_cents: 2500,
    replace_key: "",
    deduct_base: false,
  };
  catalogState = await catalog("option", 1, extra);
  const extraId = catalogState.options.find((o) => o.name === extra.name).id;
  const alternative = {
    ...extra,
    name: "Alternativ servant",
    sku: "ALT-1",
    quantity: 1,
    price_cents: 18000,
    replace_key: baseLine.key,
    deduct_base: true,
  };
  catalogState = await catalog("option", 2, alternative);
  const altId = catalogState.options.find(
    (o) => o.name === alternative.name,
  ).id;
  catalogState = await catalog("option", 3, {
    ...alternative,
    name: "Alternativ uten fratrekk",
    deduct_base: false,
  });
  const noCreditId = catalogState.options.find(
    (o) => o.name === "Alternativ uten fratrekk",
  ).id;
  await rejects(
    () =>
      catalog("option", 4, {
        ...extra,
        name: "Invalid additional deduction",
        deduct_base: true,
      }),
    "22023",
  );
  await rejects(
    () =>
      catalog("option", 4, {
        ...extra,
        name: "Unknown base",
        replace_key: "unknown",
      }),
    "22023",
  );
  await rejects(
    () => catalog("option", 4, { ...extra, name: "Negative", price_cents: -1 }),
    "23514",
  );
  const choose = {
    unit_id: unit.id,
    package_id: packageId,
    option_ids: [extraId, altId],
    choice_revision: 0,
    total_cents: 1,
  };
  let choiceState = await catalog("choose", 4, choose);
  eq(
    choiceState.selection.snapshot.total_cents,
    10500,
    "Gross minus base credit plus standalone extra; client total ignored",
  );
  eq(
    choiceState.selection.snapshot.options.find((o) => o.id === altId)
      .deduction_cents,
    10000,
  );
  eq(
    choiceState.selection.snapshot.options.find((o) => o.id === altId)
      .net_cents,
    8000,
  );
  eq(
    choiceState.selection.snapshot.goods.map((l) => l.sku).sort(),
    ["ALT-1", "EXTRA-1"],
    "Replaced standard SKU must not remain in goods",
  );
  const immutable = JSON.stringify(choiceState.selection.snapshot);
  await rejects(
    () =>
      catalog("choose", 4, {
        ...choose,
        option_ids: [altId, noCreditId],
        choice_revision: 1,
      }),
    "22023",
  );
  await rejects(
    () =>
      catalog("choose", 4, {
        ...choose,
        option_ids: [altId, altId],
        choice_revision: 1,
      }),
    "22023",
  );
  await rejects(() => catalog("choose", 4, choose), "PT409");
  const noCredit = await catalog("choose", 4, {
    ...choose,
    unit_id: secondUnit,
    option_ids: [noCreditId],
    choice_revision: 0,
  });
  eq(
    noCredit.selection.snapshot.total_cents,
    18000,
    "Alternative may replace standard goods without a deduction",
  );
  eq(noCredit.selection.snapshot.goods.length, 1);
  catalogState = await catalog("option", 4, {
    ...alternative,
    id: altId,
    price_cents: 30000,
  });
  catalogState = await catalog("package", 5, {
    id: packageId,
    name: "Standard ny",
    lines: [{ ...baseLine, credit_cents: 12000 }],
  });
  eq(
    JSON.stringify(
      (await catalog("unit", null, { unit_id: unit.id })).selection.snapshot,
    ),
    immutable,
    "Catalog and base-credit changes never rewrite saved choice",
  );
  await rejects(
    () => catalog("choose", 4, { ...choose, choice_revision: 1 }),
    "PT409",
  );
  choiceState = await catalog("choose", 6, { ...choose, choice_revision: 1 });
  eq(choiceState.selection.snapshot.total_cents, 20500);
  eq(choiceState.history.length, 2);
  eq(
    JSON.stringify(choiceState.history.find((h) => h.revision === 1).snapshot),
    immutable,
  );
  const otherRoot = (
    await call("create", null, null, { title: "Separate catalog" })
  ).root.id;
  await rejects(
    () =>
      catalog(
        "package",
        0,
        { id: packageId, name: "Stolen", lines: [baseLine] },
        otherRoot,
      ),
    "42501",
  );
  await rejects(
    () => catalog("unit", null, { unit_id: unit.id }, otherRoot),
    "42501",
  );
  await rejects(() => catalog("state", null, {}, root, other), "42501");
  await actor(reader);
  eq((await catalog()).packages.length, 1);
  await rejects(() => catalog("option", 6, extra), "42501");
  await actor(manager);
  catalogState = await catalog("archive", 6, {
    kind: "package",
    id: packageId,
    archived: true,
  });
  await rejects(
    () => catalog("choose", 7, { ...choose, choice_revision: 2 }),
    "22023",
  );
  eq(
    JSON.stringify(
      (await catalog("unit", null, { unit_id: unit.id })).history.find(
        (h) => h.revision === 1,
      ).snapshot,
    ),
    immutable,
  );
  catalogState = await catalog("archive", 7, {
    kind: "package",
    id: packageId,
    archived: false,
  });
  const archivedRoot = await call(
    "archive",
    root,
    (await call("get", root)).root.revision,
    { kind: "root", id: root, archived: true },
  );
  await rejects(() => catalog("option", 8, extra), "42501");
  await call("archive", root, archivedRoot.root.revision, {
    kind: "root",
    id: root,
    archived: false,
  });
  const noSumState = await catalog("package", 8, {
    name: "Inkludert uten sum",
    lines: [{ ...baseLine, credit_cents: null }],
  });
  const noSumId = noSumState.packages.find(
    (p) => p.name === "Inkludert uten sum",
  ).id;
  const thirdUnit = result.units[2].id;
  const noSumChoice = await catalog("choose", 9, {
    unit_id: thirdUnit,
    package_id: noSumId,
    option_ids: [],
    choice_revision: 0,
  });
  eq(
    noSumChoice.selection.snapshot.total_cents,
    0,
    "Included base package needs no total price",
  );
  eq(
    noSumChoice.selection.snapshot.goods[0].sku,
    "STD-1",
    "Unpriced base goods retain SKU and quantity for later ordering",
  );
  eq(
    noSumChoice.selection.snapshot.package.lines[0].credit_cents,
    null,
    "Unspecified credit is distinct from an explicit zero",
  );
  await rejects(
    () =>
      catalog("choose", 9, {
        unit_id: thirdUnit,
        package_id: noSumId,
        option_ids: [altId],
        choice_revision: 1,
      }),
    "22023",
  );
  const noSumAlternative = await catalog("choose", 9, {
    unit_id: thirdUnit,
    package_id: noSumId,
    option_ids: [noCreditId],
    choice_revision: 1,
  });
  eq(noSumAlternative.selection.snapshot.total_cents, 18000);
  const order = async (
    action = "get",
    orderRev = null,
    choiceRev = null,
    payload = {},
    u = unit.id,
    rootId = root,
    company = firm,
  ) =>
    (
      await db.query(
        "select public.bolig_order_draft($1,$2,$3,$4,$5,$6,$7) v",
        [company, rootId, u, action, orderRev, choiceRev, payload],
      )
    ).rows[0].v;
  const allOrder = await order("save", 0, 2, { selected_positions: [0, 1] });
  eq(allOrder.draft.snapshot.goods.length, 2);
  const partialOrder = await order("save", 1, 2, {
    selected_positions: [0],
    goods: [{ sku: "FORGED" }],
  });
  eq(
    partialOrder.draft.snapshot.goods.map((l) => l.sku),
    ["EXTRA-1"],
    "Only server source goods are used; independently excluded line stays out",
  );
  eq(partialOrder.draft.snapshot.excluded_count, 1);
  eq(
    (await catalog("unit", null, { unit_id: unit.id })).selection.snapshot.goods
      .length,
    2,
    "Order exclusion never modifies unit choice",
  );
  await rejects(
    () => order("save", 1, 2, { selected_positions: [0] }),
    "PT409",
  );
  await rejects(
    () => order("save", 2, 2, { selected_positions: [0, 0] }),
    "22023",
  );
  await rejects(() => order("save", 2, 2, { selected_positions: [] }), "22023");
  await rejects(
    () => order("save", 2, 2, { selected_positions: [99] }),
    "22023",
  );
  await rejects(
    () => order("get", null, null, {}, unit.id, otherRoot),
    "42501",
  );
  await actor(reader);
  eq((await order()).draft.revision, 2);
  await rejects(
    () => order("save", 2, 2, { selected_positions: [0] }),
    "42501",
  );
  await actor(manager);
  await rejects(
    () =>
      catalog("option", 9, {
        ...extra,
        name: "Unsafe image",
        image_url: "javascript:alert(1)",
      }),
    "22023",
  );
  const withImage = await catalog("option", 9, {
    ...alternative,
    id: altId,
    image_url: "https://example.invalid/product.jpg",
    product_url: "https://example.invalid/product",
  });
  eq(
    withImage.options.find((o) => o.id === altId).image_url,
    "https://example.invalid/product.jpg",
  );
  const nextChoice = await catalog("choose", 10, {
    ...choose,
    choice_revision: 2,
  });
  eq(
    nextChoice.selection.snapshot.goods.find((l) => l.sku === "ALT-1")
      .image_url,
    "https://example.invalid/product.jpg",
  );
  await rejects(
    () => order("save", 2, 2, { selected_positions: [0] }),
    "PT409",
  );
  eq(
    (await order()).draft.source_choice_revision,
    2,
    "Existing order source remains immutable after new unit choice",
  );
  const beforeNewOrder = (
    await db.query("select public.bolig_overview($1,$2) v", [firm, root])
  ).rows[0].v.units.find((u) => u.unit_id === choose.unit_id);
  eq(beforeNewOrder.choice_revision, 3, "Overview uses latest choice revision");
  eq(beforeNewOrder.order_outdated, true, "Old source is marked for review");
  const freshOrder = await order("save", 2, 3, { selected_positions: [0, 1] });
  const afterNewOrder = (
    await db.query("select public.bolig_overview($1,$2) v", [firm, root])
  ).rows[0].v.units.find((u) => u.unit_id === choose.unit_id);
  eq(afterNewOrder.order_revision, 3, "Overview reads newly saved order");
  eq(
    afterNewOrder.order_outdated,
    false,
    "Reviewed order points to latest choice",
  );
  await actor(reader);
  eq(
    (await db.query("select public.bolig_overview($1,$2) v", [firm, root]))
      .rows[0].v.units.length,
    500,
    "Reader may view summaries but gets no write action",
  );
  await actor(manager);
  eq(freshOrder.draft.source_choice_revision, 3);
  await db.exec("reset role;set role authenticated");
  await rejects(
    () => db.query("select * from bolig_private.order_draft_versions"),
    "42501",
  );
  await db.exec("reset role;set role anon");
  await rejects(() => order(), "42501");
  await actor(manager);

  await db.exec("reset role;set role authenticated");
  await rejects(
    () => db.query("select * from bolig_private.choice_versions"),
    "42501",
  );
  await db.exec("reset role;set role anon");
  await rejects(() => catalog(), "42501");
  await actor(manager);
  await actor(manager);
  await roomsScenarios({
    db,
    call,
    actor,
    eq,
    rejects,
    id,
    firm,
    other,
    admin,
    manager,
    reader,
    outsider,
  });
  await contentScenarios({
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
  });
  await imageScenarios({
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
  });
  await customizationScenarios({ db, call, actor, eq, rejects, id, firm, other, manager, reader, outsider });
  await packageScenarios({
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
  });
  await preparationScenarios({db,call,actor,eq,rejects,id,firm,other,manager,reader,outsider});
  await sectionScenarios({db,call,actor,eq,rejects,id,firm,other,manager,reader,outsider});
  await deliveryScenarios({db,call,actor,eq,rejects,id,firm,other,manager,reader,outsider});
  await completionScenarios({db,call,actor,eq,rejects,id,firm,other,manager,reader,outsider});
  await qualityScenarios({db,call,actor,eq,rejects,id,firm,other,manager,reader,outsider});
  await streamlined({db,call,actor,eq,rejects,id,firm,other,manager,reader,outsider});
  await commerceScenarios({db,call,actor,eq,rejects,id,firm,other,manager,reader,outsider});
  await portalScenarios({db,call,actor,eq,rejects,id,firm,other,manager,reader,outsider});
  await progressScenarios({db,call,actor,eq,rejects,id,firm,other,manager,reader,outsider});
  const {default:coordinationScenarios}=await import("./bolig-coordination-db-scenarios.mjs");
  await coordinationScenarios({db,call,actor,eq,rejects,id,firm,other,manager,reader,outsider});
  const {default:handoverScenarios}=await import("./bolig-handover-db-scenarios.mjs");
  await handoverScenarios({db,call,actor,eq,rejects,id,firm,other,manager,reader,outsider});
  const {default:followupScenarios}=await import("./bolig-followup-db-scenarios.mjs");
  await followupScenarios({db,call,actor,eq,rejects,id,firm,other,manager,reader,outsider});
  const {default:pilotScenarios}=await import("./bolig-pilot-db-scenarios.mjs");
  await pilotScenarios({db,call,actor,eq,firm,manager});
  const {default:partnerScenarios}=await import("./bolig-partner-db-scenarios.mjs");
  await partnerScenarios({db,call,actor,eq,rejects,id,firm,other,manager,reader,outsider});
  const {default:residentMail}=await import("./bolig-resident-mail-db-scenarios.mjs");
  await residentMail({db,call,actor,eq,rejects,id,firm,other,manager,reader,outsider});
  const {default:noticeComposer}=await import("./bolig-notice-composer-db-scenarios.mjs");
  await noticeComposer({db,call,actor,eq,rejects,firm,other,manager,reader,outsider});
  const {default:visualScenarios}=await import("./bolig-visuals-db-scenarios.mjs");
  await visualScenarios({db,call,actor,eq,rejects,id,firm,other,manager,reader,outsider});
  const {default:attendanceScenarios}=await import("./bolig-attendance-db-scenarios.mjs");
  await attendanceScenarios({db,call,actor,eq,rejects,id,firm,other,manager,reader,outsider});
  const {default:selfAttendance}=await import("./bolig-self-attendance-db-scenarios.mjs");
  await selfAttendance({db,call,actor,eq,rejects,id,firm,other,manager,reader,outsider});
  const {default:siteRoster}=await import("./bolig-site-roster-db-scenarios.mjs");
  await siteRoster({db,call,actor,eq,rejects,id,firm,other,manager,reader,outsider});
  const {default:integrationScenarios}=await import("./bolig-integration-db-scenarios.mjs");
  await integrationScenarios({db,call,actor,eq,rejects,id,firm,other,manager,reader,outsider});
  const {default:contractScenarios}=await import("./bolig-contract-db-scenarios.mjs");
  await contractScenarios({db,call,actor,eq,rejects,id,firm,other,manager,reader,outsider});
  const {default:deadlineScenarios}=await import("./bolig-deadline-db-scenarios.mjs");
  await deadlineScenarios({db,call,actor,eq,rejects,id,firm,other,manager,reader,outsider});
  await db.exec(
    `reset role;update public.profiles set deactivated=true where id=${q(reader)}`,
  );
  const overview = async (company = firm, rootId = root) =>
    (await db.query("select public.bolig_overview($1,$2) v", [company, rootId]))
      .rows[0].v;
  await actor(admin);
  const statusOverview = await overview();
  eq(
    statusOverview.root_id,
    root,
    "Overview returns requested firm-owned root",
  );
  eq(statusOverview.context.company_id, firm);
  eq(
    statusOverview.units.length,
    (await call("get", root)).units.filter((u) => !u.archived).length,
    "Overview lists active units only",
  );
  eq(
    statusOverview.units.every(
      (u) => !("snapshot" in u) && !("total_cents" in u),
    ),
    true,
    "Overview exposes no financial snapshots",
  );
  await rejects(() => overview(other, root), "42501");
  await rejects(() => overview(firm, id(999)), "42501");
  await db.exec("reset role;set role anon");
  await rejects(() => overview(), "42501");
  await db.exec("reset role;set role service_role");
  await rejects(() => overview(), "42501");
  await actor(reader);
  await rejects(() => call("get", root), "42501");
  await actor(manager);
  await db.exec(
    "reset role;select set_config('qa.projects','no',false);set role authenticated",
  );
  await rejects(() => call("get", root), "42501");
  await db.exec(
    "reset role;select set_config('qa.projects','yes',false);set role authenticated",
  );
  await actor(admin);
  await call("member", null, 1, { user_id: manager, role: "none" });
  await actor(manager);
  await rejects(() => call("get", root), "42501");
  await actor(system);
  await call("license", null, 1, { enabled: false });
  await actor(admin);
  await rejects(() => call("get", root), "42501");
  await db.exec("reset role;set role anon");
  await rejects(() => call("context"), "42501");
  const firmCall = async (c = null, rev = null, enabled = null) =>
    (
      await db.query("select public.bolig_firm_access($1,$2,$3) v", [
        c,
        rev,
        enabled,
      ])
    ).rows[0].v;
  await rejects(() => firmCall(), "42501");
  await actor(admin);
  await rejects(() => firmCall(), "42501");
  await rejects(() => firmCall(other, 0, true), "42501");
  await actor(system);
  await db.exec("reset role");
  const priorLicenseAudit = (
    await db.query(
      "select count(*)::int n from bolig_private.audit where company_id=$1 and action='license'",
      [other],
    )
  ).rows[0].n;
  await actor(system);
  const beforeFirm = (await firmCall()).companies.find(
    (c) => c.company_id === other,
  );
  const crossFirm = await firmCall(other, beforeFirm.revision, true);
  eq(
    crossFirm.companies.find((c) => c.company_id === other).licensed,
    true,
    "Systemadmin can activate firm without membership or workspace switch",
  );
  eq(
    (await call()).company_id,
    firm,
    "Firm activation preserves active workspace",
  );
  await rejects(() => firmCall(other, beforeFirm.revision, false), "PT409");
  await rejects(() => firmCall(id(999), 0, true), "22023");
  await db.exec("reset role");
  eq(
    (
      await db.query(
        "select count(*)::int n from bolig_private.audit where company_id=$1 and action='license'",
        [other],
      )
    ).rows[0].n,
    priorLicenseAudit + 1,
    "Only successful license write is audited",
  );
  await db.exec(
    `update public.profiles set deactivated=true where id=${q(system)}`,
  );
  await actor(system);
  await rejects(() => firmCall(), "42501");
  await db.exec("reset role;set role service_role");
  await rejects(() => firmCall(), "42501");
  await db.exec("rollback");
  await db.exec("begin");
  await actor(system);
  await call("license", null, 0, { enabled: true });
  await actor(admin);
  await call("member", null, 0, { user_id: manager, role: "manager" });
  // Atomic builder: scale, mixed types, duplicate response recovery, rollback and access.
  await actor(manager);
  const plan = {
    request_id: id(1000),
    title: "Builder QA",
    reference: "QA-ONLY",
    buildings: Array.from({ length: 20 }, (_, i) => ({
      name: `Bygg ${i + 1}`,
      building_type: "apartment",
      address: `Testgata ${i + 1}`,
      house_floors: 2,
      entrances: ["A", "B"].map((l) => ({
        address: `Testgata ${i + 1}${l}`,
        counts: [2, 2, 2, 2, 2],
      })),
    })),
  };
  const built = await call("create_plan", null, null, plan);
  eq(built.units.length, 400, "20 buildings created atomically");
  eq(built.blocks.length, 20);
  eq(built.entrances.length, 40);
  eq(built.receipt.created, true);
  const replay = await call("create_plan", null, null, plan);
  eq(replay.root.id, built.root.id, "Lost response recovers the same root");
  eq(
    replay.units.map((u) => u.id),
    built.units.map((u) => u.id),
    "Replay preserves stable entity IDs",
  );
  eq(replay.receipt.created, false);
  await rejects(
    () => call("create_plan", null, null, { ...plan, title: "Changed" }),
    "PT409",
  );
  const mixed = await call("create_plan", null, null, {
    ...plan,
    request_id: id(1001),
    buildings: [
      {
        name: "Hus",
        building_type: "house",
        address: "Testhus 1",
        house_floors: 3,
        entrances: [{ address: "Testhus 1", counts: [1] }],
      },
      {
        name: "Tomann",
        building_type: "duplex",
        address: "Testhus 2",
        house_floors: 2,
        entrances: [{ address: "Testhus 2", counts: [1, 1] }],
      },
      {
        name: "Langblokk",
        building_type: "apartment",
        address: "Langgata",
        house_floors: 2,
        entrances: Array.from({ length: 20 }, (_, i) => ({
          address: `Langgata ${i + 1}`,
          counts: [4, 4, 4, 4, 4, 4],
        })),
      },
    ],
  });
  eq(mixed.units.length, 483);
  eq(mixed.blocks.length, 3);
  eq(mixed.blocks.find((b) => b.building_type === "house").house_floors, 3);
  eq(
    mixed.units.filter((u) => u.number === "Bolig").length,
    1,
    "House floors do not create households",
  );
  const houseEntrance = mixed.entrances.find(
    (e) =>
      mixed.blocks.find((b) => b.id === e.block_id)?.building_type === "house",
  );
  await rejects(
    () =>
      call("resize", mixed.root.id, mixed.root.revision, {
        id: houseEntrance.id,
        address: houseEntrance.address,
        counts: [1, 1],
      }),
    "22023",
  );
  await rejects(
    () =>
      call("entrance", mixed.root.id, mixed.root.revision, {
        block_id: houseEntrance.block_id,
        address: "Another house entrance",
        counts: [1],
      }),
    "22023",
  );
  const beforeBad = (await call("list")).roots.length;
  const invalid = structuredClone(plan);
  invalid.request_id = id(1002);
  invalid.buildings[19].entrances[1].counts = [0];
  await rejects(() => call("create_plan", null, null, invalid), "22023");
  eq(
    (await call("list")).roots.length,
    beforeBad,
    "Invalid final building leaves no partial root",
  );
  invalid.buildings[19].entrances[1].counts = [1];
  invalid.buildings[19].entrances[1].address =
    invalid.buildings[0].entrances[0].address;
  await rejects(() => call("create_plan", null, null, invalid), "23505");
  eq(
    (await call("list")).roots.length,
    beforeBad,
    "Duplicate final address rolls back all entities",
  );
  await actor(reader);
  await rejects(() => call("create_plan", null, null, plan), "42501");
  await actor(outsider, other);
  await rejects(() => call("create_plan", null, null, plan), "42501");
  await actor(manager);
  await rejects(() => call("create_plan", null, null, plan, other), "42501");
  await rejects(
    () => db.query("select * from bolig_private.creation_receipts"),
    "42501",
  );
  await db.exec("rollback");
  console.log(
    "PASS bolig PostgreSQL: " +
      checks +
      " assertions; 500 units, shared reads, firm/member/license/role/lock gates, immutable project scope, stable IDs, conflict rollback and direct-table/anon denials.",
  );
} catch (error) {
  console.error(
    JSON.stringify({
      message: error.message,
      stack: error.stack,
      code: error.code,
      where: error.where,
      params: error.params,
      position: error.position, internalPosition: error.internalPosition, internalQuery: error.internalQuery,
    }),
  );
  process.exitCode = 1;
} finally {
  await db.close();
}
