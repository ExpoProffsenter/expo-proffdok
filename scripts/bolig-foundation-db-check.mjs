import fs from "node:fs/promises";
import assert from "node:assert/strict";
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
    project_id: project,
  });
  eq(result.units.find((x) => x.id === unit.id).project_id, project);
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
  await actor(manager);
  await db.exec(
    `reset role;update public.profiles set deactivated=true where id=${q(reader)}`,
  );
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
  console.log(
    "PASS bolig PostgreSQL: " +
      checks +
      " assertions; 500 units, shared reads, firm/member/license/role/lock gates, immutable project scope, stable IDs, conflict rollback and direct-table/anon denials.",
  );
} catch (error) {
  console.error(
    JSON.stringify({
      message: error.message,
      code: error.code,
      where: error.where,
      params: error.params,
    }),
  );
  process.exitCode = 1;
} finally {
  await db.close();
}
