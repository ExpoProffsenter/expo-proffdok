import React from "REPO/node_modules/react/index.js";
import { createRoot } from "REPO/node_modules/react-dom/client.js";
import Manager from "REPO/src/modules/bolig/BoligPartners.jsx";
import Portal from "REPO/src/modules/bolig/BoligPartnerPage.jsx";
import "REPO/src/modules/bolig/bolig.css";
import "REPO/src/modules/bolig/boligResident.css";
const ctx = {
    user_id: "qa",
    company_id: "firm",
    role: "manager",
    enabled: true,
  },
  root = { id: "root", title: "Solgløtt borettslag" };
const order = {
  id: "order1",
  kind: "order",
  basis: "order-basis",
  title: "B-3",
  number: "H0101",
  address: "Demoparken 101",
  delivery_address: "Demoparken 101, varemottak",
  reference: "00420",
  supplier_reference: "",
  requested_date: "2026-11-02",
  status: "partial",
  goods: [
    {
      name: "Servant",
      sku: "00123",
      quantity: 2,
      unit: "stk",
      room_name: "Bad",
      received: 1,
    },
  ],
};
const task = {
  id: "task1",
  kind: "task",
  basis: "task-basis",
  title: "Monter servant",
  number: "H0101",
  address: "Demoparken 101",
  planned_start: "2026-11-02",
  planned_end: "2026-11-03",
  status: "planned",
  revision: 1,
  room_name: "Bad",
};
let state = {
    context: ctx,
    root_id: "root",
    partners: [],
    orders: [order],
    tasks: [task],
    quality: {
      scopes: [{ id: "unit1", title: "Demoparken 101 · H0101" }],
      checks: [],
      documents: [],
    },
    qualityRevision: 0,
    unit_count: 40,
    suppliers: ["QA Leverandør"],
    checklists: [
      {
        id: "check1",
        scope_id: "unit1",
        title: "Sluttkontroll",
        trade: "Rør",
        number: "H0101",
        address: "Demoparken 101",
        status: "completed",
        points: [{ id: "p1", title: "Servant kontrollert", status: "Avvik" }],
      },
    ],
  },
  events = [];
window.__calls = [];
window.__hold = false;
window.__deny = false;
window.__fail = false;
window.__received = 1;
window.__receipts = {};
const wait = async () => {
  if (window.__hold) {
    window.__hold = false;
    await new Promise((r) => (window.__release = r));
  }
};
const view = () => ({
  ...state.partners[0],
  id: "access1",
  name: "Per Partner",
  organisation: "QA Leverandør",
  kind: state.partners[0]?.kind || "supplier",
  active: true,
  project: {
    title: "Solgløtt borettslag",
    company: "QA Firma",
    reference: "00420",
  },
  expires_at: "2026-12-01",
  access_mode: "project",
  features: state.partners[0]?.features || ["orders", "progress", "checklists"],
  unit_count: state.unit_count,
  orders: (state.partners[0]?.features || ["orders"]).includes("orders")
    ? [order]
    : [],
  tasks: (state.partners[0]?.features || ["progress"]).includes("progress")
    ? state.tasks
    : [],
  checklists: (state.partners[0]?.features || ["checklists"]).includes(
    "checklists",
  )
    ? state.checklists
    : [],
  quality: state.partners[0]?.features?.includes("checklists")
    ? {
        ...state.quality,
        checks: state.quality.checks.map((x) => ({
          ...x,
          revision: state.qualityRevision,
        })),
        documents: state.quality.documents.map((x) => ({
          ...x,
          revision: state.qualityRevision,
        })),
      }
    : null,
  events: [...events]
    .reverse()
    .filter((e) =>
      (state.partners[0]?.features || ["orders", "progress"]).includes(
        e.kind === "order" ? "orders" : "progress",
      ),
    ),
});
window.__client = {
  rpc: async (name, args) => {
    window.__calls.push({ name, args });
    const captured = structuredClone(state);
    await wait();
    if (window.__deny)
      return {
        error: { code: "42501", message: "Tilgangen er trukket tilbake" },
      };
    const p = args.p_payload;
    if (args.p_action === "create") {
      if (!state.partners.length)
        state.partners.push({
          ...view(),
          id: p.id,
          name: p.name,
          organisation: p.organisation,
          email: p.email,
          revision: 1,
          features: p.features,
          supplier_name: p.supplier_name,
          access_mode: p.access_mode,
        });
      state.created_id = p.id;
      if (window.__fail) {
        window.__fail = false;
        return { error: { message: "Mistet kvittering" } };
      }
    }
    if (args.p_action === "permissions") {
      if (!window.__receipts[p.request_id]) {
        if (p.revision !== state.partners[0].revision)
          return { error: { code: "PT409", message: "Tilgangen er endret" } };
        Object.assign(state.partners[0], {
          features: p.features,
          supplier_name: p.supplier_name,
          revision: state.partners[0].revision + 1,
        });
        window.__receipts[p.request_id] = true;
      }
      state.created_id = p.id;
      if (window.__fail) {
        window.__fail = false;
        return { error: { message: "Mistet kvittering" } };
      }
    }
    state.partners = state.partners.map((p) => ({
      ...p,
      orders: p.features.includes("orders") ? [order] : [],
      tasks: p.features.includes("progress") ? state.tasks : [],
      checklists: p.features.includes("checklists") ? state.checklists : [],
      unit_count: state.unit_count,
    }));
    if (args.p_action === "revoke") state.partners[0].active = false;
    return {
      data:
        args.p_action === "get" && window.__old
          ? captured
          : structuredClone(state),
    };
  },
};
window.fetch = async (url, args) => {
  if (url.includes("/functions/v1/bolig-partner-files")) {
    await wait();
    if (window.__deny)
      return {
        ok: false,
        json: async () => ({ code: "42501", message: "Stanset" }),
      };
    if (args.body instanceof FormData) {
      window.__fileCalls ||= [];
      window.__fileCalls.push({
        id: args.body.get("id"),
        scope_id: args.body.get("scope_id"),
        name: args.body.get("file").name,
      });
      if (window.__failFile) {
        window.__failFile = false;
        throw Error("Mistet filkvittering");
      }
      return { ok: true, json: async () => ({ id: args.body.get("id") }) };
    }
    return {
      ok: true,
      blob: async () => new Blob(["%PDF-1.4 QA"], { type: "application/pdf" }),
    };
  }
  const p = JSON.parse(args.body);
  if (url.includes("/rpc/bolig_partner_quality")) {
    window.__calls.push(p);
    await wait();
    if (window.__deny || !state.partners[0].features.includes("quality_write"))
      return {
        ok: false,
        json: async () => ({ code: "42501", message: "Utfylling er stanset" }),
      };
    const a = p.p_payload;
    if (!window.__receipts[a.request_id]) {
      if (p.p_action === "check_save" && a.revision !== state.qualityRevision)
        return {
          ok: false,
          json: async () => ({
            code: "PT409",
            message: "Dokumentasjonen er endret",
          }),
        };
      if (p.p_action === "check_add")
        state.quality.checks.push({
          scope_id: a.scope_id,
          record: {
            id: a.id,
            partner_id: "access1",
            status: "draft",
            answers: {},
            definition: a.content || {
              title: "Sluttkontroll",
              instructions: "Kontroller arbeidet",
              points: [{ id: "p1", title: "Servant kontrollert", fields: [] }],
            },
          },
        });
      if (p.p_action === "check_save") {
        const x = state.quality.checks.find((x) => x.record.id === a.id);
        x.record.answers = structuredClone(a.answers);
        x.record.status = a.complete ? "completed" : "draft";
        x.record.completed_at = a.complete ? "2026-10-23T18:00:00Z" : null;
      }
      if (p.p_action === "document")
        state.quality.documents.push({
          scope_id: a.scope_id,
          id: a.id,
          title: a.title,
          name: window.__fileCalls.find((x) => x.id === a.id).name,
          kind: window.__fileCalls
            .find((x) => x.id === a.id)
            .name.endsWith(".png")
            ? "photo"
            : "document",
        });
      state.qualityRevision++;
      window.__receipts[a.request_id] = true;
    }
    if (window.__fail) {
      window.__fail = false;
      throw Error("Mistet kvittering");
    }
    return {
      ok: true,
      json: async () => ({ ...structuredClone(view()), saved_id: a.id }),
    };
  }
  window.__calls.push(p);
  await wait();
  if (window.__deny)
    return {
      ok: false,
      json: async () => ({
        code: "42501",
        message: "Tilgangen er utløpt eller trukket tilbake",
      }),
    };
  if (p.p_action === "respond") {
    const a = p.p_payload;
    if (
      a.basis !== (a.kind === "order" ? order.basis : task.basis) &&
      !window.__receipts[a.request_id]
    )
      return {
        ok: false,
        json: async () => ({ code: "PT409", message: "Grunnlaget er endret" }),
      };
    if (!window.__receipts[a.request_id]) {
      events.push({
        id: "event" + events.length,
        target_id: a.target_id,
        kind: a.kind,
        status: a.status,
        promised_date: a.date,
        reference: a.reference,
        body: a.body,
        current: true,
        created_at: "2026-10-23",
      });
      window.__receipts[a.request_id] = true;
    }
    if (window.__fail) {
      window.__fail = false;
      throw Error("Mistet svar");
    }
  }
  return { ok: true, json: async () => structuredClone(view()) };
};
window.__advanceRevision = () => {
  state.partners[0].revision++;
};
window.__writePortal = () => {
  state.partners = [
    { id: "access1", kind: "ue", features: ["checklists", "quality_write"] },
  ];
  window.__portal();
};
window.__managerRemount = () => {
  app.unmount();
  app = createRoot(document.getElementById("app"));
  window.__render();
};
window.__futureUnit = () => {
  state.unit_count++;
  state.tasks.push({
    ...task,
    id: "future-task",
    number: "H0201",
    title: "Ny leilighet",
  });
};
window.__features = (features) => {
  state.partners[0].features = features;
};
window.__changeBasis = () => {
  task.basis += "-new";
  task.planned_end = "2026-11-04";
  events.forEach((e) => {
    if (e.kind === "task") e.current = false;
  });
};
let app = createRoot(document.getElementById("app"));
window.__render = (role = "manager", company = "firm") => {
  state.context = { ...ctx, role, company_id: company };
  app.render(
    <Manager
      key={company}
      context={{ ...ctx, role, company_id: company }}
      root={root}
    />,
  );
};
window.__portal = () => {
  location.hash = "partner=" + "ab".repeat(32);
  app.unmount();
  app = createRoot(document.getElementById("app"));
  app.render(<Portal />);
};
window.__remount = () => {
  app.unmount();
  app = createRoot(document.getElementById("app"));
  app.render(<Portal />);
};
window.__render();

// Mixed server states for checklist-priority regression coverage.
const baseChecklists = structuredClone(state.checklists);
window.__priorityFixture = () => {
  state.quality.scopes.push({ id: "unit2", title: "Demoparken 103 · H0201" });
  const own = (id, title, answers, status = "draft", scope_id = "unit1") => ({
    scope_id, record: { id, status, answers, completed_at: status === "completed" ? "2026-10-23T18:00:00Z" : null,
      definition: { title, points: [{ id: "p1", title: "Servant kontrollert", fields: [] }] } },
  });
  state.quality.checks = [
    own("done", "Ferdig UE", { p1: { status: "OK" } }, "completed"),
    own("new", "Neste UE", {}),
    own("answer", "Pågående UE", { p1: { status: "Avvik" } }),
    own("comment", "Kommentar UE", { p1: { comment: "Lagret merknad" } }),
    own("field", "Måling UE", { p1: { values: { pressure: 0 } } }, "draft", "unit2"),
    own("blank", "Tom UE", { p1: { status: "", comment: " ", values: {}, documents: [] } }),
    own("document", "Vedlegg UE", { p1: { documents: ["doc-id"] } }),
  ];
  state.checklists = Array.from({ length: 45 }, (_, i) => ({ ...baseChecklists[0], id: `done${i}`, title: `Ferdig prosjekt ${i}`, completed_at: "2026-10-23T18:00:00Z" }));
  state.checklists.push(
    { ...baseChecklists[0], id: "shared", title: "Neste prosjekt", status: "draft", points: [{ id: "p1", title: "Kontroll", status: null }] },
    { ...baseChecklists[0], id: "shared", scope_id: "unit2", title: "Pågående prosjekt", status: "draft", address: "Demoparken 103" },
  );
};
window.__priorityReadback = () => structuredClone({ checks: state.quality.checks, shared: state.checklists });
window.__resetPriority = () => {
  state.quality = { scopes: state.quality.scopes.slice(0, 1), checks: [], documents: [] };
  state.qualityRevision = 0;
  state.checklists = structuredClone(baseChecklists);
  window.__calls = [];
  window.__receipts = {};
};
