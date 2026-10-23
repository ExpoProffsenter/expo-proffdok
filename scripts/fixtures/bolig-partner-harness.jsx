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
  kind: "supplier",
  active: true,
  project: {
    title: "Solgløtt borettslag",
    company: "QA Firma",
    reference: "00420",
  },
  expires_at: "2026-12-01",
  orders: [order],
  tasks: [task],
  events: [...events].reverse(),
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
          order_ids: p.order_ids,
          task_ids: p.task_ids,
        });
      state.created_id = p.id;
      if (window.__fail) {
        window.__fail = false;
        return { error: { message: "Mistet kvittering" } };
      }
    }
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
  const p = JSON.parse(args.body);
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
