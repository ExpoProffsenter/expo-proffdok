import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { build } from "vite";
import react from "@vitejs/plugin-react";
const { JSDOM } = await import(process.env.KSHMS_JSDOM_PATH || "jsdom");
const cwd = process.cwd(),
  temp = fs.mkdtempSync(path.join(os.tmpdir(), "bolig-overview-"));
fs.writeFileSync(
  path.join(temp, "entry.jsx"),
  `import React,{act} from '${cwd}/node_modules/react/index.js';import {createRoot} from '${cwd}/node_modules/react-dom/client.js';import Overview from '${cwd}/src/modules/bolig/BoligBuildingOverview.jsx';import Lookup from '${cwd}/src/modules/bolig/BoligCatalogLookup.jsx';import Form from '${cwd}/src/modules/bolig/BoligDraftForm.jsx';const root=createRoot(document.getElementById('app'));globalThis.__act=act;globalThis.__render=(mode,props)=>root.render(mode==='lookup'?<Lookup {...props}/>:mode==='form'?<Form context={props.context} rootId="r" name="atomic" basis={{catalog_revision:1}} initial={{name:'Old',sku:'OLD'}} submitLabel="Save" onSave={v=>{globalThis.__saved=v;return false;}}>{(v,c)=><><output>{v.name}:{v.sku}</output><button type="button" onClick={()=>c({name:'New',sku:'NEW',image_url:'https://example.invalid/i.jpg'})}>Use catalog product</button></>}</Form>:<Overview {...props}/>);globalThis.__unmount=()=>root.render(null);`,
);
try {
  const built = await build({
    root: cwd,
    configFile: false,
    logLevel: "silent",
    define: { "process.env.NODE_ENV": '"development"' },
    plugins: [
      react({ jsxRuntime: "classic" }),
      {
        name: "qa-client",
        enforce: "pre",
        resolveId(id) {
          if (id.endsWith("appSupabaseClientRegistry.js")) return "\0qa-client";
        },
        load(id) {
          if (id === "\0qa-client")
            return "export const getAppSupabaseClient=()=>globalThis.__client;";
        },
      },
    ],
    build: {
      write: false,
      minify: false,
      lib: {
        cssFileName: "qa",
        entry: path.join(temp, "entry.jsx"),
        formats: ["iife"],
        name: "Proof",
      },
    },
  });
  const dom = new JSDOM('<div id="app"></div>', {
    url: "https://example.invalid",
    runScripts: "outside-only",
    pretendToBeVisual: true,
  });
  const w = dom.window,
    d = w.document;
  w.IS_REACT_ACT_ENVIRONMENT = true;
  w.MessageChannel = class {
    constructor() {
      this.port1 = { onmessage: null };
      this.port2 = {
        postMessage: () => setImmediate(() => this.port1.onmessage?.()),
      };
    }
  };
  let context = {
    user_id: "self",
    company_id: "a",
    enabled: true,
    role: "manager",
  };
  let fail = false,
    held = null;
  const calls = [];
  w.__client = {
    rpc: async (name, args) => {
      calls.push({ name, args });
      if (name === "bolig_completion") {
        if (fail) return { error: { message: "Denied" } };
        return { data: {
          context: { ...context }, root_id: args.p_root_id, scope_id: args.p_scope_id,
          rows: record.units.map((unit) => ({ scope_id: unit.id, kind: "unit", status: "not_started" })),
        } };
      }
      if (name === "bolig_workspace") return { data: { ...context } };
      if (name === "current_user_has_internal_store_catalog_access")
        return { data: false };
      if (name === "current_user_has_pro_store_catalog_access")
        return { data: true };
      if (name === "search_pro_store_catalog")
        return {
          data: [
            {
              id: "p",
              description: "Servant",
              supplier_name: "Allowed supplier",
              supplier_product_number: "SKU-1",
              image_url: "https://example.invalid/product.jpg",
              suggested_sale_price_incl_vat: 125,
              purchase_net_ex_vat: 10,
              discount_percent: 99,
            },
          ],
        };
      if (name === "bolig_coordination") {
        if (fail) return { error: { message: "Denied" } };
        const data = {
          context: { ...context },
          root_id: args.p_root_id,
          revision: 0,
          groups: [],
          inbox: [
            {
              unit_id: "u1",
              number: "H0101",
              address: "Testveien 1",
              unread: 1,
              pending: 1,
              latest_at: "2026-10-23T10:00:00Z",
              preview:
                context.company_id === "a"
                  ? "OLD-FIRM-INBOX"
                  : "NEW-FIRM-INBOX",
              enabled: true,
            },
          ],
          members: [],
          units: [],
          messaging_enabled: false,
          manager_id: null,
        };
        if (held)
          return new Promise((resolve) => held.push(() => resolve({ data })));
        return { data };
      }
      assert.equal(name, "bolig_overview");
      if (fail) return { error: { message: "Denied" } };
      const data = {
        context: { ...context },
        root_id: args.p_root_id,
        units: [
          {
            unit_id: "u1",
            choice_revision: 1,
            order_revision: 0,
            catalog_changed: false,
            order_outdated: false,
          },
          {
            unit_id: "u2",
            choice_revision: 2,
            order_revision: 1,
            catalog_changed: false,
            order_outdated: true,
          },
        ],
      };
      if (held)
        return new Promise((resolve) => held.push(() => resolve({ data })));
      return { data };
    },
  };
  w.eval(
    (Array.isArray(built) ? built[0] : built).output.find(
      (x) => x.type === "chunk",
    ).code,
  );
  const act = async (fn, ms = 20) =>
    w.__act(async () => {
      fn?.();
      await new Promise((r) => setTimeout(r, ms));
    });
  const record = {
    root: { id: "root", revision: 1 },
    blocks: [
      { id: "b1", name: "Blokk A" },
      { id: "b2", name: "Blokk B" },
    ],
    entrances: [
      { id: "e1", block_id: "b1", address: "Testveien 1", counts: [1, 1] },
      { id: "e2", block_id: "b2", address: "Testveien 2", counts: [1] },
    ],
    units: [
      {
        id: "u1",
        entrance_id: "e1",
        floor: 1,
        number: "H0101",
        has_project: true,
      },
      { id: "u2", entrance_id: "e1", floor: 2, number: "H0201" },
      {
        id: "u3",
        entrance_id: "e2",
        floor: 1,
        number: "H0101",
        contact_name: "Ola Eksempel",
      },
    ],
  };
  let selected = "";
  const props = () => ({
    context: { ...context },
    record: structuredClone(record),
    unitId: selected,
    onSelect: (id) => {
      selected = id;
    },
    onSetup: () => {},
    query: "",
    onQuery: () => {},
  });
  const button = (text) =>
    [...d.querySelectorAll("button")].find(
      (b) => b.textContent.trim() === text,
    );
  await act(() => w.__render("overview", props()));
  assert.equal(
    d.querySelector(".bolig-facade-floor small").textContent,
    "2. etg.",
    "Floors rendered from top to ground",
  );
  assert.equal(d.querySelectorAll(".bolig-window").length, 2);
  assert(
    d.querySelector('[aria-label="H0101 · Testveien 1 · Boligvalg lagret"]'),
  );
  await act(() => d.querySelector(".bolig-window").click());
  assert.equal(selected, "u2");
  await act(() => button("Bestilling og levering").click());
  assert(
    d.querySelector(
      '[aria-label="H0201 · Testveien 1 · Se over varegrunnlag"]',
    ),
  );
  assert(
    d.querySelector('[aria-label="H0101 · Testveien 1 · Klargjør bestilling"]'),
  );
  await act(() => button("Prosjektkobling").click());
  assert(
    d.querySelector('[aria-label="H0101 · Testveien 1 · Prosjekt koblet"]'),
  );
  await act(() =>
    w.__render("overview", { ...props(), query: "Testveien 2 Ola" }),
  );
  assert.equal(
    d.querySelectorAll(".bolig-search-results button").length,
    1,
    "Search crosses all blocks and combines terms",
  );
  await act(() => d.querySelector(".bolig-search-results button").click());
  assert.equal(selected, "u3");
  fail = true;
  await act(() => w.dispatchEvent(new w.Event("focus")));
  await act(() => w.__render("overview", props()));
  await act(() => button("Boligvalg").click());
  assert(d.body.textContent.includes("Kunne ikke hente boligstatus"));
  assert(
    [...d.querySelectorAll(".bolig-window")].every((b) =>
      b.classList.contains("unknown"),
    ),
    "Failed status reads must not invent missing/completed states",
  );
  fail = false;
  held = [];
  await act(() => w.dispatchEvent(new w.Event("focus")));
  const old = held;
  held = null;
  context = { ...context, company_id: "b" };
  record.root.id = "root-b";
  await act(() => w.__render("overview", props()));
  await act(() => old.forEach((resolve) => resolve()));
  assert(
    !d.querySelector("[role=status]"),
    "Old-firm response cannot overwrite latest successful result",
  );
  assert(
    d.body.textContent.includes("NEW-FIRM-INBOX"),
    "Fresh firm dialogue must be shown",
  );
  assert(
    !d.body.textContent.includes("OLD-FIRM-INBOX"),
    "Delayed prior-firm dialogue must never reappear",
  );
  await act(() => w.__unmount());
  let used;
  await act(() =>
    w.__render("lookup", {
      context,
      onUse: (item) => {
        used = item;
      },
    }),
  );
  const field = d.querySelector('input[type="search"]');
  assert(field);
  await act(() => {
    Object.getOwnPropertyDescriptor(
      w.HTMLInputElement.prototype,
      "value",
    ).set.call(field, "servant");
    field.dispatchEvent(new w.Event("input", { bubbles: true }));
  }, 350);
  await act(() => {});
  assert.equal(d.querySelectorAll(".bolig-lookup-results button").length, 1);
  assert(
    !calls.some((c) => c.name === "search_internal_store_catalog"),
    "Proff user never searches internal catalog",
  );
  await act(() => d.querySelector(".bolig-lookup-results button").click());
  assert.equal(used.sku, "SKU-1");
  assert.equal(used.price, "125");
  assert.equal(used.image_url, "https://example.invalid/product.jpg");
  assert.equal(used.purchase_net_ex_vat, undefined);
  assert.equal(used.discount_percent, undefined);
  await act(() =>
    w.dispatchEvent(
      new w.CustomEvent("expo-proffdok-work-profile", {
        detail: { active_company_id: "c" },
      }),
    ),
  );
  assert.equal(
    d.querySelector('input[type="search"]'),
    null,
    "Work-profile event clears catalog results immediately",
  );
  await act(() => w.__unmount());
  await act(() => w.__render("form", { context }));
  await act(() => button("Use catalog product").click());
  assert.equal(
    d.querySelector("output").textContent,
    "New:NEW",
    "Product fields update atomically",
  );
  await act(() =>
    d
      .querySelector("form")
      .dispatchEvent(
        new w.Event("submit", { bubbles: true, cancelable: true }),
      ),
  );
  assert.equal(w.__saved.sku, "NEW");
  assert.equal(w.__saved.name, "New");
  await act(() => w.__unmount());
  dom.window.close();
  console.log(
    "PASS facade React: descending floors, real choice/order/project status, stale-order warning, cross-block search, neutral failures, old-firm fence, proff supplier-only lookup, no purchase-net propagation, immediate access invalidation and atomic product fields.",
  );
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
