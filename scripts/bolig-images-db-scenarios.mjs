// Real RLS execution against the isolated Postgres Storage table, with the
// production migration, firm/member context and immutable-object contract.
export default async function imageScenarios({
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
  const root = (await call("create", null, null, { title: "Image policy QA" }))
    .root.id;
  const path = `${firm}/${root}/${id(801)}.jpg`,
    foreign = `${other}/${root}/${id(802)}.jpg`;
  const access = async (name, writing = false) =>
    (
      await db.query("select public.bolig_catalog_image_access($1,$2) v", [
        name,
        writing,
      ])
    ).rows[0].v;
  const insert = (name) =>
    db.query(
      "insert into storage.objects(bucket_id,name) values('bolig-catalog-images',$1)",
      [name],
    );
  const visible = async () =>
    (
      await db.query(
        "select name from storage.objects where bucket_id='bolig-catalog-images'",
      )
    ).rows.map((x) => x.name);
  eq(await access(path, true), true, "Manager uploads into own active root");
  await insert(path);
  eq(await visible(), [path], "Manager can read uploaded image");
  eq(
    await access(foreign, true),
    false,
    "Root cannot be borrowed by another firm folder",
  );
  eq(
    await access("not/a/uuid.jpg", true),
    false,
    "Malformed paths fail closed",
  );
  await rejects(() => insert(foreign), "42501");
  await rejects(() => insert(`${firm}/${root}/${id(803)}.svg`), "42501");
  eq(
    (
      await db.query(
        "update storage.objects set name=$1 where name=$2 returning name",
        [`${firm}/${root}/${id(804)}.jpg`, path],
      )
    ).rows.length,
    0,
    "Saved image cannot be overwritten",
  );
  eq(
    (
      await db.query(
        "delete from storage.objects where name=$1 returning name",
        [path],
      )
    ).rows.length,
    0,
    "Old snapshot image cannot be deleted",
  );
  await actor(reader);
  eq(await access(path), true, "Reader can view project images");
  eq(await access(path, true), false, "Reader cannot upload");
  eq(await visible(), [path]);
  await rejects(() => insert(`${firm}/${root}/${id(805)}.jpg`), "42501");
  await actor(outsider, other);
  eq(await visible(), [], "Other firm cannot list or sign private images");
  eq(await access(path), false);
  await rejects(() => insert(`${firm}/${root}/${id(806)}.jpg`), "42501");
  await actor(manager);
  await db.exec("savepoint image_archive");
  const r = await call("get", root);
  await call("archive", root, r.root.revision, {
    kind: "root",
    id: root,
    archived: true,
  });
  eq(await access(path), true, "Archived project history retains image access");
  eq(await access(path, true), false, "Archived project rejects uploads");
  await db.exec(
    "rollback to savepoint image_archive;release savepoint image_archive",
  );
  await db.exec("savepoint image_revoke");
  await db.exec(
    `reset role;update bolig_private.member_access set access_role='none' where company_id='${firm}' and user_id='${manager}';set role authenticated`,
  );
  eq(await access(path), false, "Revoked member loses new signed image access");
  eq(await visible(), []);
  await db.exec(
    "rollback to savepoint image_revoke;release savepoint image_revoke",
  );
  await db.exec("reset role;set role anon");
  await rejects(() => access(path), "42501");
  eq(
    (
      await db.query(
        "select name from storage.objects where bucket_id='bolig-catalog-images'",
      )
    ).rows.length,
    0,
    "Anonymous image access denied",
  );
  await actor(manager);
}
