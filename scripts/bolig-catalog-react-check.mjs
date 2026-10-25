import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { build } from "vite";
import react from "@vitejs/plugin-react";
const { JSDOM } = await import(process.env.KSHMS_JSDOM_PATH || "jsdom");
const cwd = process.cwd(),
  temp = fs.mkdtempSync(path.join(os.tmpdir(), "bolig-catalog-")),
  entry = path.join(temp, "entry.jsx");
fs.writeFileSync(
  entry,
  `import React,{act} from '${cwd}/node_modules/react/index.js';import {createRoot} from '${cwd}/node_modules/react-dom/client.js';import Catalog from '${cwd}/src/modules/bolig/BoligCatalog.jsx';const root=createRoot(document.getElementById('app'));globalThis.__act=act;globalThis.__render=props=>root.render(React.createElement(Catalog,{...props,key:props.context.user_id+':'+props.context.company_id+':'+props.root.id+':'+(props.unit?.id||'setup')}));globalThis.__unmount=()=>root.render(null);`,
);
const ctx = {
    user_id: "user-a",
    company_id: "firm-a",
    enabled: true,
    role: "manager",
  },
  root = { id: "root-a", archived: false };
const line = {
  key: "base-1",
  name: "Standard servant",
  sku: "STD-1",
  quantity: 1,
  unit: "stk",
  credit_cents: 10000,
};
let state = {
  context: ctx,
  root_id: root.id,
  revision: 1,
  packages: [
    { id: "p1", name: "Standard", lines: [line], revision: 1, archived: false },
  ],
  options: [
    {
      id: "o1",
      name: "Alternativ servant",
      image_url: "https://example.invalid/product.jpg",
      product_url: "https://example.invalid/product",
      sku: "ALT-1",
      quantity: 1,
      unit: "stk",
      price_cents: 18000,
      replace_key: "base-1",
      deduct_base: true,
      revision: 1,
      archived: false,
    },
    {
      id: "o2",
      name: "Ekstra knagg",
      sku: "KNAGG",
      quantity: 2,
      unit: "stk",
      price_cents: 2500,
      replace_key: "",
      deduct_base: false,
      revision: 1,
      archived: false,
    },
  ],
  selection: null,
  history: [],
};
const calls = [];
let orderDraft = null,
  holdOrderSave = false,
  releaseOrderSave;
let conflict = false,
  held = null;
try {
  const built = await build({
    root: cwd,
    configFile: false,
    logLevel: "silent",
    define: { "process.env.NODE_ENV": '"development"' },
    plugins: [
      react(),
      {
        name: "mock-client",
        enforce: "pre",
        resolveId(id) {
          if (id.endsWith("appSupabaseClientRegistry.js")) return "\0mock";
        },
        load(id) {
          if (id === "\0mock")
            return "export const getAppSupabaseClient=()=>globalThis.__client;";
        },
      },
    ],
    build: {
      write: false,
      minify: false,
      lib: { entry, formats: ["iife"], name: "CatalogProof" },
    },
  });
  const dom = new JSDOM('<div id="app"></div>', {
      url: "https://example.invalid",
      runScripts: "outside-only",
      pretendToBeVisual: true,
    }),
    w = dom.window,
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
  w.__client = {
    rpc: async (name, args) => {
      if (name === "bolig_order_draft") {
        if (args.p_action === "save") {
          if (holdOrderSave)
            await new Promise((resolve) => {
              releaseOrderSave = resolve;
            });
          assert.equal(args.p_choice_revision, state.selection.revision);
          orderDraft = {
            revision: (orderDraft?.revision || 0) + 1,
            source_choice_revision: state.selection.revision,
            snapshot: {
              selected_positions: args.p_payload.selected_positions,
              goods: state.selection.snapshot.goods.filter((_, i) =>
                args.p_payload.selected_positions.includes(i),
              ),
              excluded_count:
                state.selection.snapshot.goods.length -
                args.p_payload.selected_positions.length,
            },
          };
        }
        return {
          data: {
            context: { ...ctx },
            root_id: root.id,
            unit_id: args.p_unit_id,
            selection: state.selection,
            draft: orderDraft,
          },
        };
      }
      assert.equal(name, "bolig_catalog");
      calls.push(args);
      assert.equal(args.p_company_id, ctx.company_id);
      assert.equal(args.p_root_id, root.id);
      if (["state", "unit"].includes(args.p_action)) {
        const copy = structuredClone(state);
        if (held)
          return new Promise(
            (resolve) => (held.resolve = () => resolve({ data: copy })),
          );
        return { data: copy };
      }
      assert.equal(args.p_revision, state.revision);
      if (conflict)
        return {
          error: {
            code: "PT409",
            message: "Pakkeoppsettet er endret. Kladden er beholdt.",
          },
        };
      const p = args.p_payload;
      if (args.p_action === "package") {
        state.packages.push({ ...p, id: "p2", revision: 1, archived: false });
        state.revision++;
      }
      if (args.p_action === "option") {
        state.options.push({ ...p, id: "o3", revision: 1, archived: false });
        state.revision++;
      }
      if (args.p_action === "choose") {
        if (p.choice_revision !== (state.selection?.revision || 0))
          return {
            error: {
              code: "PT409",
              message: "Boligvalget er endret. Kladden er beholdt.",
            },
          };
        state.selection = {
          revision: (state.selection?.revision || 0) + 1,
          snapshot: {
            package: state.packages.find((x) => x.id === p.package_id),
            options: state.options.filter((o) => p.option_ids.includes(o.id)),
            total_cents: 10500,
            catalog_revision: state.revision,
            goods: [
              {
                name: "Alternativ servant",
                sku: "ALT-1",
                quantity: 1,
                unit: "stk",
              },
              { name: "Ekstra knagg", sku: "KNAGG", quantity: 2, unit: "stk" },
            ],
          },
        };
        state.history = [
          {
            revision: state.selection.revision,
            snapshot: state.selection.snapshot,
          },
        ];
      }
      return { data: structuredClone(state) };
    },
  };
  w.eval(
    (Array.isArray(built) ? built[0] : built).output.find(
      (o) => o.type === "chunk",
    ).code,
  );
  const act = async (fn) =>
    w.__act(async () => {
      await fn?.();
      await new Promise((r) => setTimeout(r, 15));
    });
  const render = async (unit = null) =>
    act(() => w.__render({ context: ctx, root, unit }));
  const button = (name) => {
    const b = [...d.querySelectorAll("button")].find(
      (n) => n.textContent.trim() === name,
    );
    assert(b, "Missing button " + name);
    return b;
  };
  const field = (name) => {
    const l = [...d.querySelectorAll("label")].find(
      (l) =>
        [...l.childNodes]
          .filter((n) => n.nodeType === 3)
          .map((n) => n.textContent)
          .join("")
          .replace(/\s+/g, " ")
          .trim() === name,
    );
    assert(l, "Missing field " + name);
    return l.querySelector("input,select");
  };
  const input = async (name, value) =>
    act(() => {
      const el = field(name);
      Object.getOwnPropertyDescriptor(
        w.HTMLInputElement.prototype,
        "value",
      ).set.call(el, value);
      el.dispatchEvent(new w.Event("input", { bubbles: true }));
    });
  const select = async (name, value) =>
    act(() => {
      const el = field(name);
      el.value = value;
      el.dispatchEvent(new w.Event("change", { bubbles: true }));
    });
  const submit = async () =>
    act(() =>
      d
        .querySelector("form")
        .dispatchEvent(
          new w.Event("submit", { bubbles: true, cancelable: true }),
        ),
    );
  await render();
  await act(() => button("Ny grunnpakke").click());
  assert.equal(
    field("Grunnsum inkl. mva. 1").required,
    false,
    "Base package has no required price",
  );
  await input("Pakkenavn", "Inkludert i entreprisen");
  await input("Varebeskrivelse 1", "Standard dusj");
  await input("Varenummer 1", "DUSJ-1");
  await act(() =>
    w.dispatchEvent(
      new w.CustomEvent("expo-proffdok-work-profile", {
        detail: { active_company_id: "firm-a" },
      }),
    ),
  );
  assert.equal(
    field("Pakkenavn").value,
    "Inkludert i entreprisen",
    "Profile refresh retains package editor",
  );
  await act(() => w.__unmount());
  await render();
  assert.equal(
    field("Varenummer 1").value,
    "DUSJ-1",
    "Remount restores package phase and draft",
  );
  await submit();
  assert.equal(
    calls.find((c) => c.p_action === "package").p_payload.lines[0].credit_cents,
    null,
  );
  assert(
    state.packages.some(
      (p) =>
        p.name === "Inkludert i entreprisen" && p.lines[0].sku === "DUSJ-1",
    ),
  );
  await act(() => button("Tilvalgspakker").click());
  assert(
    d.querySelector('img[src="https://example.invalid/product.jpg"]'),
    "Product image uses the familiar goods card",
  );
  await act(() => button("Ny tilvalgspakke").click());
  await input("Navn på tilvalgspakke", "Testalternativ");
  await input("Varebeskrivelse 1", "Alternativ dusj");
  await input("Varenummer 1", "QA-ALT");
  await select("Tilvalgspakketype", "alternative");
  const creditLabel = [...d.querySelectorAll("label")].find((l) =>
    l.textContent.includes("Trekk fra grunnsummen"),
  );
  assert(creditLabel);
  await act(() => creditLabel.querySelector("input").click());
  await input("Pris for hele tilvalgspakken inkl. mva.", "180,50");
  await act(() =>
    w.dispatchEvent(
      new w.CustomEvent("expo-proffdok-work-profile", {
        detail: { active_company_id: "firm-a" },
      }),
    ),
  );
  assert.equal(
    field("Navn på tilvalgspakke").value,
    "Testalternativ",
    "Profile refresh retains option phase",
  );
  await act(() => w.__unmount());
  await render();
  assert.equal(
    field("Pris for hele tilvalgspakken inkl. mva.").value,
    "180,50",
    "Remount restores option phase and price draft",
  );
  await submit();
  const saved = calls.find((c) => c.p_action === "option").p_payload;
  assert.equal(saved.price_cents, 18050);
  assert.equal(saved.replace_key, "base-1");
  assert.equal(saved.deduct_base, true);
  await act(() => button("Grunnpakker").click());
  await act(() => button("Ny grunnpakke").click());
  await input("Pakkenavn", "Bevart kladd");
  await input("Varebeskrivelse 1", "Usendt vare");
  conflict = true;
  const writes = calls.filter((c) => c.p_action === "package").length;
  await submit();
  assert.equal(
    calls.filter((c) => c.p_action === "package").length,
    writes + 1,
  );
  assert.equal(field("Pakkenavn").value, "Bevart kladd");
  assert(d.querySelector("[role=alert]"));
  await act(() => w.dispatchEvent(new w.Event("focus")));
  assert.equal(
    field("Pakkenavn").value,
    "Bevart kladd",
    "Focus cannot erase local catalog draft",
  );
  conflict = false;
  await act(() => w.__unmount());
  await render({ id: "unit-a", number: "H0101" });
  await select("Grunnpakke for boligen", "p1");
  const check = (name) =>
    [...d.querySelectorAll(".bolig-option-choice")]
      .find((l) => l.textContent.includes(name))
      .querySelector("input");
  await act(() => check("Alternativ servant").click());
  await act(() => check("Ekstra knagg").click());
  await act(() =>
    w.dispatchEvent(
      new w.CustomEvent("expo-proffdok-work-profile", {
        detail: { active_company_id: "firm-a" },
      }),
    ),
  );
  assert.equal(
    check("Ekstra knagg").checked,
    true,
    "Same-company profile keeps unsaved choice",
  );
  await act(() => w.__unmount());
  await render({ id: "unit-a", number: "H0101" });
  assert.equal(
    check("Alternativ servant").checked,
    true,
    "Remount restores choice draft without saving it",
  );
  assert(
    d.querySelector(".bolig-choice-total").textContent.includes("105,00"),
    "Alternative net plus additional amount",
  );
  await submit();
  assert(
    d.querySelector(".bolig-saved-choice").textContent.includes("versjon 1"),
  );
  assert(d.querySelector(".bolig-saved-choice").textContent.includes("ALT-1"));
  assert(!d.querySelector(".bolig-saved-choice").textContent.includes("STD-1"));
  assert.equal(
    field("Grunnpakke for boligen").value,
    "p1",
    "Save must retain selected package",
  );
  await act(() => check("Ekstra knagg").click());
  state.selection = { ...state.selection, revision: 2 };
  await act(() => w.dispatchEvent(new w.Event("focus")));
  assert(
    d.body.textContent.includes("Grunnlaget er endret"),
    "Automatic read must flag a changed choice revision",
  );
  await submit();
  assert.equal(
    calls.filter((c) => c.p_action === "choose").at(-1).p_payload
      .choice_revision,
    1,
    "Focus must not advance dirty draft revision",
  );
  assert(
    d
      .querySelector("[role=alert]")
      .textContent.includes("Boligvalget er endret"),
  );
  await act(() => button("Se over og bruk siste grunnlag").click());
  await submit();
  assert.equal(
    calls.filter((c) => c.p_action === "choose").at(-1).p_payload
      .choice_revision,
    2,
    "Only deliberate review rebases a draft",
  );

  await act(() => {});
  const orderRegion = d.querySelector('[aria-label="Bestillingsutkast"]');
  assert(orderRegion);
  const orderRebase = [...orderRegion.querySelectorAll("button")].find(
    (b) => b.textContent.trim() === "Se over og bruk siste grunnlag",
  );
  assert(
    orderRebase,
    "Changed choice revision preserves order basis and requires deliberate review",
  );
  await act(() => orderRebase.click());
  const orderChecks = [...orderRegion.querySelectorAll("input[type=checkbox]")];
  assert.equal(orderChecks.length, 2);
  assert(
    orderChecks.every((c) => c.checked),
    "Every order line is selected by default",
  );
  await act(() => orderChecks[1].click());
  await act(() =>
    w.dispatchEvent(
      new w.CustomEvent("expo-proffdok-work-profile", {
        detail: { active_company_id: "firm-a" },
      }),
    ),
  );
  assert.equal(
    [
      ...d.querySelectorAll(
        '[aria-label="Bestillingsutkast"] input[type=checkbox]',
      ),
    ][1].checked,
    false,
    "Profile refresh preserves order exclusion",
  );

  holdOrderSave = true;
  await act(() =>
    orderRegion
      .querySelector("form")
      .dispatchEvent(
        new w.Event("submit", { bubbles: true, cancelable: true }),
      ),
  );
  await act(() => {
    w.dispatchEvent(new w.Event("focus"));
    d.dispatchEvent(new w.Event("visibilitychange"));
  });
  await act(async () => {
    holdOrderSave = false;
    releaseOrderSave();
  });
  assert(
    orderRegion.textContent.includes("Bestillingsutkastet er lagret."),
    "Focus during save preserves the acknowledgement",
  );
  assert.equal(orderDraft.snapshot.goods.length, 1);
  assert.equal(
    state.selection.snapshot.goods.length,
    2,
    "Order exclusion must not change accepted/source choice goods",
  );
  assert(orderRegion.textContent.includes("1 varelinjer med"));
  await act(() =>
    w.__render({
      context: ctx,
      root,
      unit: { id: "unit-a", number: "H0101" },
      compact: true,
    }),
  );
  await act(() => button("Bestilling").click());
  const before = [
    ...d.querySelectorAll(
      '[aria-label="Bestillingsutkast"] input[type=checkbox]',
    ),
  ];
  await act(() => before[0].click());
  await act(() => {
    Object.defineProperty(d, "visibilityState", {
      configurable: true,
      value: "hidden",
    });
    d.dispatchEvent(new w.Event("visibilitychange"));
  });
  await act(() => {
    Object.defineProperty(d, "visibilityState", {
      configurable: true,
      value: "visible",
    });
    d.dispatchEvent(new w.Event("visibilitychange"));
    w.dispatchEvent(new w.Event("focus"));
    w.dispatchEvent(
      new w.CustomEvent("expo-proffdok-work-profile", {
        detail: { active_company_id: "firm-a" },
      }),
    );
  });
  assert.equal(
    [
      ...d.querySelectorAll(
        '[aria-label="Bestillingsutkast"] input[type=checkbox]',
      ),
    ][0].checked,
    false,
    "Order draft survives visibility + focus + repeated profile event",
  );
  await act(() => w.__unmount());
  await act(() =>
    w.__render({
      context: ctx,
      root,
      unit: { id: "unit-a", number: "H0101" },
      compact: true,
    }),
  );
  assert.equal(
    button("Bestilling").getAttribute("aria-pressed"),
    "true",
    "Order phase restores after access remount",
  );
  assert.equal(
    [
      ...d.querySelectorAll(
        '[aria-label="Bestillingsutkast"] input[type=checkbox]',
      ),
    ][0].checked,
    false,
    "Unsaved order exclusion restores without changing source choice",
  );
  ctx.role = "reader";
  state.context = { ...ctx };
  await render({ id: "unit-a", number: "H0101" });
  assert.equal(d.querySelector("form"), null, "Reader has no choice editor");
  assert(d.querySelector(".bolig-saved-choice"));
  ctx.role = "manager";
  state.context = { ...ctx };
  await render({ id: "unit-a", number: "H0101" });
  held = {};
  await act(() => w.dispatchEvent(new w.Event("focus")));
  const pending = held;
  held = null;
  ctx.company_id = "firm-b";
  root.id = "root-b";
  state = {
    ...state,
    context: { ...ctx },
    root_id: root.id,
    packages: [],
    options: [],
    selection: null,
    history: [],
  };
  await render();
  await act(() => pending.resolve());
  assert(
    !d.body.textContent.includes("Standard servant"),
    "Late old-company catalog cannot reappear",
  );
  await act(() => w.__unmount());
  dom.window.close();
  console.log(
    "PASS actual catalog React: optional base price with SKU, alternative/additional controls, explicit credit, exact cents, displayed net total, immutable saved goods, local draft/conflict/focus, reader limits, product images, all-selected order lines, independently saved exclusions and late company response fence.",
  );
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
