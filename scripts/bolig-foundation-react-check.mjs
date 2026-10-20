import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { build } from "vite";
import react from "@vitejs/plugin-react";
const { JSDOM } = await import(process.env.KSHMS_JSDOM_PATH || "jsdom");
const cwd = process.cwd(),
  temp = fs.mkdtempSync(path.join(os.tmpdir(), "bolig-react-")),
  entry = path.join(temp, "entry.jsx");
const main = fs.readFileSync("src/main.jsx", "utf8");
const integration = main.split("\n").find((s) => s.includes("(BoligEntry, {"));
assert(
  integration &&
    integration.includes("!hasActiveProjectWorkspace") &&
    integration.includes("!isProjectSupportReadOnly"),
);
fs.writeFileSync(
  entry,
  `import React,{act} from '${cwd}/node_modules/react/index.js';import {createRoot} from '${cwd}/node_modules/react-dom/client.js';import Entry from '${cwd}/src/modules/bolig/BoligEntry.jsx';const root=createRoot(document.getElementById('app'));globalThis.__act=act;globalThis.__render=id=>root.render(React.createElement('form',{id:'ordinary-project-form'},React.createElement(Entry,{userId:id,onOpenProject:(...a)=>globalThis.__opened=a})));globalThis.__unmount=()=>root.unmount();`,
);
try {
  const built = await build({
    root: cwd,
    configFile: false,
    logLevel: "silent",
    define: { "process.env.NODE_ENV": '"development"' },
    plugins: [
      react(),
      {
        name: "mock-app-client",
        enforce: "pre",
        resolveId(id) {
          if (id.endsWith("appSupabaseClientRegistry.js"))
            return "\0bolig-client";
        },
        load(id) {
          if (id === "\0bolig-client")
            return "export const getAppSupabaseClient=()=>globalThis.__client;";
        },
      },
    ],
    build: {
      write: false,
      minify: false,
      lib: {
        entry,
        cssFileName: "bolig-proof",
        formats: ["iife"],
        name: "BoligProof",
      },
    },
  });
  const dom = new JSDOM('<div id="app"></div>', {
    url: "https://example.invalid",
    runScripts: "outside-only",
    pretendToBeVisual: true,
  });
  const { window: w } = dom;
  w.IS_REACT_ACT_ENVIRONMENT = true;
  w.MessageChannel = class {
    constructor() {
      this.port1 = { onmessage: null };
      this.port2 = {
        postMessage: () => setImmediate(() => this.port1.onmessage?.()),
      };
    }
  };
  w.HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  w.HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
  let company = "firm-a",
    role = "manager",
    enabled = true,
    denied = false,
    conflict = false;
  const calls = [];
  let record = {
    root: {
      id: "root-1",
      title: "Felles prosjekt",
      revision: 1,
      archived: false,
    },
    blocks: [{ id: "b", root_id: "root-1", name: "Blokk A", archived: false }],
    entrances: [
      {
        id: "e",
        root_id: "root-1",
        block_id: "b",
        address: "Eksempelgata 1A",
        counts: [2],
        archived: false,
      },
    ],
    units: [
      {
        id: "u",
        root_id: "root-1",
        entrance_id: "e",
        number: "H0101",
        floor: 1,
        position: 1,
        contact_name: "Original",
        archived: false,
        has_project: false,
        project_id: null,
      },
    ],
  };
  const context = () => ({
    company_id: company,
    user_id: "self",
    company_name: company,
    role,
    enabled,
    licensed: enabled,
    license_revision: 1,
    manage_access: false,
    system_admin: false,
  });
  w.__client = {
    rpc: async (name, args) => {
      assert.equal(name, "bolig_workspace");
      calls.push(args);
      const ctx = context();
      if (args.p_action === "context") return { data: ctx };
      assert.equal(args.p_company_id, company);
      if (denied)
        return { error: { code: "42501", message: "Tilgangen er fjernet." } };
      if (args.p_action === "list")
        return {
          data: { context: ctx, roots: [{ ...record.root, unit_count: 2 }] },
        };
      if (args.p_action === "get")
        return { data: { ...structuredClone(record), context: ctx } };
      if (args.p_action === "unit") {
        if (conflict)
          return {
            error: {
              code: "PT409",
              message:
                "En annen bruker har endret strukturen. Kladden er beholdt.",
            },
          };
        record.units[0] = { ...record.units[0], ...args.p_payload };
        record.root.revision++;
        return { data: { ...structuredClone(record), context: ctx } };
      }
      throw Error("Unexpected action " + args.p_action);
    },
  };
  const transport = w.__client.rpc;
  w.__client.rpc = (...args) => ({
    retry(enabled) {
      assert.equal(
        enabled,
        false,
        "Bolig calls must explicitly disable SDK retries",
      );
      return transport(...args);
    },
  });
  const js = (Array.isArray(built) ? built[0] : built).output.find(
    (x) => x.type === "chunk",
  ).code;
  w.eval(js);
  const act = async (fn) =>
    w.__act(async () => {
      fn?.();
      await new Promise((r) => setTimeout(r, 20));
    });
  const q = (s) => w.document.querySelector(s),
    button = (text) =>
      [...w.document.querySelectorAll("button")].find(
        (b) => b.textContent === text,
      );
  await act(() => w.__render("self"));
  assert(button("Åpne boligprosjekter"));
  await act(() => button("Åpne boligprosjekter").click());
  assert(q("dialog[open]"));
  assert.equal(
    q("dialog").closest("#ordinary-project-form"),
    null,
    "Portal must avoid nested project forms.",
  );
  await act(() => button("Felles prosjekt2 boliger")?.click());
  if (!q(".bolig-grid")) await act(() => q(".bolig-root").click());
  assert(q(".bolig-grid"));
  await act(() => q(".bolig-grid button").click());
  const input = [...w.document.querySelectorAll("label")]
    .find((l) => l.textContent.startsWith("Kontaktperson"))
    .querySelector("input");
  await act(() => {
    const setter = Object.getOwnPropertyDescriptor(
      w.HTMLInputElement.prototype,
      "value",
    ).set;
    setter.call(input, "Usendt kladd");
    input.dispatchEvent(new w.Event("input", { bubbles: true }));
  });
  assert.equal(input.value, "Usendt kladd");
  const key = "expo-proffdok.bolig-draft.v1:self:firm-a:root-1:unit-u";
  assert(
    JSON.parse(w.localStorage.getItem(key)).contact_name === "Usendt kladd",
  );
  await act(() => w.dispatchEvent(new w.Event("focus")));
  assert(q(".bolig-unit input").value === "H0101");
  assert(q(".bolig-unit form").textContent.includes("Kontaktperson"));
  conflict = true;
  await act(() =>
    q(".bolig-unit form").dispatchEvent(
      new w.Event("submit", { bubbles: true, cancelable: true }),
    ),
  );
  assert(q("[role=alert]").textContent.includes("Kladden er beholdt"));
  assert.equal(
    JSON.parse(w.localStorage.getItem(key)).contact_name,
    "Usendt kladd",
  );
  assert.equal(record.units[0].contact_name, "Original");
  conflict = false;
  await act(() => button("Hent siste versjon").click());
  await act(() =>
    q(".bolig-unit form").dispatchEvent(
      new w.Event("submit", { bubbles: true, cancelable: true }),
    ),
  );
  assert.equal(record.units[0].contact_name, "Usendt kladd");
  assert.equal(w.localStorage.getItem(key), null);
  assert.equal(q("[role=status]").textContent, "Lagret i firmaet.");
  const setInput = async (input, value) =>
    act(() => {
      Object.getOwnPropertyDescriptor(
        w.HTMLInputElement.prototype,
        "value",
      ).set.call(input, value);
      input.dispatchEvent(new w.Event("input", { bubbles: true }));
    });
  const resize = [...w.document.querySelectorAll("details")].find(
    (x) =>
      x.querySelector("summary")?.textContent ===
      "Endre etasjer og leiligheter",
  );
  const floors = resize.querySelector(".bolig-floors input");
  await setInput(floors, "3");
  assert.equal(resize.querySelectorAll(".bolig-floor-fields input").length, 3);
  await setInput(resize.querySelector(".bolig-floor-fields input"), "5");
  assert(resize.querySelector("small").textContent.includes("13 leiligheter"));
  assert.equal(
    calls.filter((c) => c.p_action === "resize").length,
    0,
    "Shape changes require explicit save",
  );
  role = "reader";
  await act(() => w.dispatchEvent(new w.Event("focus")));
  assert.equal(
    q(".bolig-unit form"),
    null,
    "Role downgrade removes edit controls",
  );
  role = "manager";
  await act(() => w.dispatchEvent(new w.Event("focus")));
  record.units[0].has_project = true;
  record.units[0].project_id = "ordinary-project";
  await act(() => button("Hent siste versjon").click());
  await act(() => button("Åpne leilighetsprosjekt").click());
  assert.deepEqual(Array.from(w.__opened), ["ordinary-project", "prosjekt"]);
  assert.equal(q("dialog"), null);
  await act(() => button("Åpne boligprosjekter").click());
  await act(() => q(".bolig-root").click());
  await act(() => q(".bolig-grid button").click());
  denied = true;
  await act(() =>
    q(".bolig-unit form").dispatchEvent(
      new w.Event("submit", { bubbles: true, cancelable: true }),
    ),
  );
  assert.equal(q(".bolig-unit"), null, "Server denial clears old record");
  denied = false;
  company = "firm-b";
  await act(() =>
    w.dispatchEvent(
      new w.CustomEvent("expo-proffdok-work-profile", {
        detail: { active_company_id: "firm-b" },
      }),
    ),
  );
  assert.equal(q(".bolig-unit"), null);
  assert.equal(q("dialog"), null);
  enabled = false;
  await act(() => w.dispatchEvent(new w.Event("focus")));
  assert.equal(button("Åpne boligprosjekter"), undefined);
  await act(() => w.__unmount());
  dom.window.close();
  console.log(
    "PASS bolig actual React: authorized launcher, real component, portal isolation, scoped local drafts, focus preservation, conflict/retry, server readback, company switch and entitlement revocation.",
  );
} catch (e) {
  console.error(e.message);
  process.exitCode = 1;
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
