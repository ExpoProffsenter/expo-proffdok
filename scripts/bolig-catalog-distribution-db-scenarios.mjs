import fs from "node:fs/promises";

export default async function ({ db, call, actor, eq, rejects, id, firm, other, manager, outsider }) {
  await db.exec("reset role");
  await db.exec(await fs.readFile("supabase/migrations/20261125192900_bolig_catalog_distribution.sql", "utf8"));
  await actor(manager);

  let sequence = 2200000;
  const nextId = () => id(sequence++);
  const project = await call("create_plan", null, null, {
    request_id: nextId(),
    title: "Fordeling av pakker",
    reference: "QA-BULK",
    buildings: [{ name: "Bygg A", building_type: "multi", address: "QA 1", house_floors: 1, entrances: [{ address: "QA 1", counts: [3] }] }],
  });
  const root = project.root.id;
  const [a, b, c] = project.units.map((unit) => unit.id);
  for (const unit of project.units) {
    const latest = await call("get", root);
    await call("unit", root, latest.root.revision, {
      id: unit.id, number: unit.number, contact_name: "QA Beboer", contact_email: "qa@example.invalid",
    });
  }
  const rpc = async (query, parameters) => (await db.query(query, parameters)).rows[0].v;
  const catalog = (action = "state", revision = null, payload = {}, company = firm) =>
    rpc("select public.bolig_catalog($1,$2,$3,$4,$5) v", [company, root, action, revision, payload]);
  const batch = (action = "get", payload = {}) =>
    rpc("select public.bolig_resident_batch($1,$2,$3,$4) v", [firm, root, action, payload]);
  const portal = (unit, action = "get", payload = {}) =>
    rpc("select public.bolig_resident_portal($1,$2,$3,$4,$5) v", [firm, root, unit, action, payload]);
  const resident = (token, action = "get", payload = {}) =>
    rpc("select public.bolig_portal($1,$2,$3) v", [token, action, payload]);
  const tokens = ["a8", "b8", "c8"].map((value) => value.repeat(32));
  const line = (key, name, credit_cents) => ({ key, name, quantity: 1, unit: "stk", credit_cents });

  let state = await catalog("package", 0, { name: "Standard bad", lines: [line("servant", "Standard servant", 10000)], unit_ids: [a, b] });
  const base = state.packages[0].id;
  eq(state.distribution[base], [a, b].sort(), "A catalog save persists the exact reviewed unit list");
  eq(state.distribution_units.length, 3);
  eq(state.distribution_units.every((unit) => !("contacts" in unit)), true);
  await rejects(() => catalog("package", state.revision, { name: "Overlapper", lines: [line("bad", "Annet bad", 0)], unit_ids: [a] }), "PT409");
  eq((await catalog()).packages.length, 1, "Overlap rolls back the new package and revision");
  await rejects(() => catalog("option", state.revision, { name: "Utenfor", price_cents: 20000, quantity: 1, unit: "stk", deduct_base: false, unit_ids: [id(7777)] }), "PT409");

  state = await catalog("package", state.revision, { name: "Tilpasset bad", lines: [line("bad", "Tilpasset servant", 0)], unit_ids: [c] });
  const optionPayload = { name: "Oppgradert servant", price_cents: 37000, quantity: 1, unit: "stk", replace_key: "servant", deduct_base: true };
  state = await catalog("option", state.revision, { ...optionPayload, unit_ids: [a, b] });
  const option = state.options[0].id;
  const initialBatch = await batch();
  eq(initialBatch.units.find((unit) => unit.id === a).offer_count, 2);
  eq(initialBatch.units.find((unit) => unit.id === c).offer_count, 1);
  eq((await portal(a)).portal, null, "Package setup alone does not publish links");

  await actor(outsider, other);
  await rejects(() => catalog("state", null, {}, other), "42501");
  await rejects(() => db.exec("select * from bolig_private.catalog_distribution"), "42501");
  await actor(manager);
  state = await catalog("option", state.revision, { ...optionPayload, id: option, unit_ids: [a] });
  const publish = (review, ids, replace_links = false) => ({
    request_id: nextId(), reviewed: true, replace_links,
    units: review.units.filter((unit) => ids.includes(unit.id)).map((unit) => ({
      id: unit.id, basis: unit.basis, portal_revision: unit.portal_revision, request_id: nextId(),
      token: tokens[[a, b, c].indexOf(unit.id)],
    })),
  });
  await rejects(() => batch("publish", publish(initialBatch, [a, b, c])), "PT409");
  const payload = publish(await batch(), [a, b, c]);
  eq((await batch("publish", payload)).portals.length, 3, "One batch publishes different menus");
  eq((await batch("publish", payload)).replayed, true, "Retry does not create another version");

  await db.exec("reset role");
  await db.query("update bolig_private.roots set resident_confirmation_enabled=true where id=$1", [root]);
  const anon = () => db.exec("reset role;select set_config('qa.user','',false);set role anon");
  await anon();
  const views = await Promise.all(tokens.map((token) => resident(token)));
  eq(views.map((view) => view.offers.map((offer) => offer.title)), [
    ["Standard bad", "Oppgradert servant"], ["Standard bad"], ["Tilpasset bad"],
  ]);
  eq(views[0].offers[1].total_cents, 27000, "Deduction uses the assigned standard price");
  eq(views[0].combine_base_id, views[0].offers[0].id, "The resident gets selectable add-ons automatically");
  eq(JSON.stringify(views[0]).includes("distribution_units"), false);
  const accepted = await resident(tokens[0], "confirm", {
    request_id: nextId(), menu_version: views[0].menu_version, changes_revision: views[0].changes_revision,
    offer_ids: [views[0].offers[1].id], name: "QA Beboer", confirmed: true,
  });
  eq(accepted.confirmation.snapshot.total_cents, 27000, "The new menu uses the same resident confirmation flow");

  await actor(manager);
  state = await catalog("option", state.revision, { ...optionPayload, id: option, price_cents: 50000, unit_ids: [b] });
  await rejects(async () => batch("publish", publish(await batch(), [a], true)), "PT409");
  await anon();
  eq((await resident(tokens[0])).confirmation.id, accepted.confirmation.id, "A confirmed selection is preserved");
  eq((await resident(tokens[1])).offers.length, 1, "Editing the catalog does not change an already published menu");
  await actor(manager);
  const updated = publish(await batch(), [b], true);
  updated.units[0].token = "e8".repeat(32);
  await batch("publish", updated);
  await anon();
  await rejects(() => resident(tokens[1]), "42501");
  eq((await resident(updated.units[0].token)).offers[1].total_cents, 40000, "Explicit republish picks up the edited price");
  await actor(manager);
}
