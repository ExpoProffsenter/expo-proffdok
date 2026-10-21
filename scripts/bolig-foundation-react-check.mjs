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
const { createGlobalAppTabs, createProjectWorkspaceTabs } =
  await import("../src/modules/project/projectNavigationTabs.mjs");
assert(
  createGlobalAppTabs({ canUseBolig: true }).some(
    ([id, label]) => id === "bolig" && label === "Boligprosjekter",
  ),
);
assert(!createGlobalAppTabs().some(([id]) => id === "bolig"));
assert(
  !createProjectWorkspaceTabs({ canUseBolig: true }).some(
    ([id]) => id === "bolig",
  ),
);
assert(
  main.includes(
    "canUseBolig: Boolean(boligContext?.enabled && boligContext.user_id === authUser?.id)",
  ),
);
assert(
  fs
    .readFileSync("src/modules/company/CompanyAdminPanel.jsx", "utf8")
    .includes('mode="company" expectedCompanyId={current.company_id}'),
);
assert(
  fs
    .readFileSync("src/modules/app/SystemAdminWorkspace.jsx", "utf8")
    .includes("<BoligFirmAccessPanel userId={authUser?.id}/>"),
);
const integration = main.split("\n").find((s) => s.includes("(BoligEntry, {"));
assert(
  integration &&
    integration.includes("!hasActiveProjectWorkspace") &&
    integration.includes("!isProjectSupportReadOnly") &&
    integration.includes('tab === "bolig"') &&
    !integration.includes('tab === "prosjekt"'),
);
fs.writeFileSync(
  entry,
  `import React,{act} from '${cwd}/node_modules/react/index.js';import {createRoot} from '${cwd}/node_modules/react-dom/client.js';import Entry from '${cwd}/src/modules/bolig/BoligEntry.jsx';import WorkspaceViewMode from '${cwd}/src/modules/app/WorkspaceViewMode.jsx';import Access from '${cwd}/src/modules/bolig/BoligAccessPanel.jsx';import FirmAccess from '${cwd}/src/modules/bolig/BoligFirmAccessPanel.jsx';import {useBoligContext} from '${cwd}/src/modules/bolig/boligAccess.js';function Availability({id}){const {context}=useBoligContext(id);return React.createElement('output',{'data-bolig-enabled':!!context?.enabled});}const root=createRoot(document.getElementById('app'));globalThis.__act=act;globalThis.__render=(id,mode='workspace')=>root.render(React.createElement('div',{'data-expo-app-shell':'true'},React.createElement('header',null,React.createElement('div',{className:'head'},React.createElement('h1',null,'Expo ProffDok'),React.createElement(WorkspaceViewMode,{key:id})),React.createElement('nav',null,'Appmeny')),React.createElement('main',null,React.createElement('form',{id:'ordinary-project-form'},React.createElement('input',{defaultValue:'Usendt ordinær prosjektkladd'})),React.createElement(Availability,{id}),mode==='workspace'?React.createElement(Entry,{userId:id,onExit:()=>globalThis.__exited=true,onOpenProject:(...a)=>globalThis.__opened=a}):mode==='system'?React.createElement(FirmAccess,{userId:id}):React.createElement(Access,{userId:id,mode}))));globalThis.__unmount=()=>root.render(null);globalThis.__dispose=()=>root.unmount();`,
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
      cssMinify: true,
      lib: {
        entry,
        cssFileName: "bolig-proof",
        formats: ["iife"],
        name: "BoligProof",
      },
    },
  });
  const dom = new JSDOM(
    '<style>header { backdrop-filter: blur(16px); }</style><div id="app"></div>',
    {
      url: "https://example.invalid",
      runScripts: "outside-only",
      pretendToBeVisual: true,
    },
  );
  const { window: w } = dom;
  const viewStyles = w.document.createElement("style");
  viewStyles.textContent = (Array.isArray(built) ? built[0] : built).output
    .filter((file) => file.type === "asset" && file.fileName.endsWith(".css"))
    .map((file) => String(file.source))
    .join("\n");
  w.document.head.append(viewStyles);
  // JSDOM has no backdrop layout. Check the emitted CSS, since the minifier
  // previously kept only the prefixed declaration and Chrome ignored it.
  const fullscreenHeaderRule = [...viewStyles.sheet.cssRules].find(
    (rule) =>
      rule.selectorText?.replaceAll(" ", "") ===
      "[data-expo-app-shell][data-expo-fullscreen]>header",
  );
  assert.equal(
    fullscreenHeaderRule?.style.getPropertyValue("backdrop-filter"),
    "none",
    "Built CSS must retain the standard backdrop property for the fixed return button",
  );
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
    conflict = false,
    licensed = true,
    manage = false,
    system = false,
    licenseRevision = 1,
    memberRole = "none",
    memberRevision = 0,
    accessConflict = false,
    holdAccess = false,
    holdContext = false,
    emptyListing = false;
  const contextWaiters = [];
  const accessWaiters = [];
  let externalLicensed = false,
    externalRevision = 0;
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
    enabled: enabled && licensed,
    licensed,
    license_revision: licenseRevision,
    manage_access: manage,
    system_admin: system,
  });
  w.__client = {
    rpc: async (name, args) => {
      calls.push(args);
      if (name === "bolig_firm_access") {
        if (!system)
          return { error: { code: "42501", message: "Systemadmin kreves." } };
        if (args.p_enabled !== null) {
          if (args.p_company_id === "external-firm") {
            assert.equal(args.p_revision, externalRevision);
            externalLicensed = args.p_enabled;
            externalRevision++;
          } else {
            assert.equal(args.p_company_id, company);
            assert.equal(args.p_revision, licenseRevision);
            licensed = args.p_enabled;
            licenseRevision++;
          }
        }
        return {
          data: {
            user_id: "self",
            system_admin: true,
            companies: [
              {
                company_id: company,
                company_name: company,
                licensed,
                revision: licenseRevision,
              },
              {
                company_id: "external-firm",
                company_name: "Eksternt firma",
                licensed: externalLicensed,
                revision: externalRevision,
              },
            ],
          },
        };
      }
      if (name === "bolig_overview")
        return {
          data: {
            context: context(),
            root_id: args.p_root_id,
            units: record.units.map((u) => ({
              unit_id: u.id,
              choice_revision: 0,
              order_revision: 0,
              catalog_changed: false,
              order_outdated: false,
            })),
          },
        };
      if (name === "bolig_catalog")
        return {
          data: {
            context: context(),
            root_id: args.p_root_id,
            revision: 0,
            packages: [],
            options: [],
            history: [],
            selection: null,
          },
        };
      assert.equal(name, "bolig_workspace");
      const ctx = context();
      if (args.p_action === "context") {
        if (holdContext)
          return new Promise((resolve) =>
            contextWaiters.push(() => resolve({ data: ctx })),
          );
        return { data: ctx };
      }
      assert.equal(args.p_company_id, company);
      if (denied)
        return { error: { code: "42501", message: "Tilgangen er fjernet." } };
      const members = [
        {
          user_id: "member-1",
          name: "QA Medarbeider",
          role: memberRole,
          revision: memberRevision,
          firmaadmin: false,
        },
      ];
      if (args.p_action === "access") {
        const response = { data: { context: ctx, members } };
        if (holdAccess)
          return new Promise((resolve) =>
            accessWaiters.push(() => resolve(response)),
          );
        return response;
      }
      if (args.p_action === "license") {
        assert(system);
        assert.equal(args.p_revision, licenseRevision);
        licensed = args.p_payload.enabled;
        licenseRevision++;
        return { data: { context: context(), members } };
      }
      if (args.p_action === "member") {
        if (accessConflict)
          return {
            error: { code: "PT409", message: "Brukertilgangen er endret." },
          };
        assert(manage && licensed);
        assert.equal(args.p_revision, memberRevision);
        memberRole = args.p_payload.role;
        memberRevision++;
        return {
          data: {
            context: context(),
            members: [
              { ...members[0], role: memberRole, revision: memberRevision },
            ],
          },
        };
      }
      if (args.p_action === "list")
        return {
          data: {
            context: ctx,
            roots: emptyListing ? [] : [{ ...record.root, unit_count: 2 }],
          },
        };
      if (args.p_action === "get")
        return { data: { ...structuredClone(record), context: ctx } };
      if (args.p_action === "create_plan") {
        emptyListing = false;
        record = {
          ...record,
          root: {
            ...record.root,
            id: "created-root",
            title: args.p_payload.title,
          },
        };
        return {
          data: {
            ...structuredClone(record),
            context: ctx,
            receipt: {
              request_id: args.p_payload.request_id,
              root_id: record.root.id,
              created: true,
            },
          },
        };
      }
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
        (b) => b.textContent.trim() === text,
      );
  await act(() => w.__render("self"));
  assert.equal(q(".bolig-entry"), null, "Startside card must be removed");
  assert(
    q("main > .bolig-page"),
    "Bolig opens inline inside the ordinary app main",
  );
  assert(
    !q('dialog[aria-label="Boligprosjekter"]'),
    "The module must not be a modal",
  );
  assert.equal(
    q(".bolig-page").closest("#ordinary-project-form"),
    null,
    "Inline module forms must be siblings of the ordinary project form.",
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
  const workspace = q(".bolig-page");
  const ordinaryDraft = q("#ordinary-project-form input");
  const readsBeforeViewChange = calls.length;
  await act(() => button("Fullskjermvisning").click());
  assert.equal(q("[data-expo-app-shell]").dataset.expoFullscreen, "true");
  assert.equal(w.getComputedStyle(q(".head h1")).display, "none");
  assert.equal(w.getComputedStyle(q("header > nav")).display, "none");
  assert.notEqual(
    w.getComputedStyle(q(".workspace-view-control")).display,
    "none",
  );
  assert.equal(
    q(".workspace-view-control button").getAttribute("aria-pressed"),
    "true",
  );
  assert(workspace === q(".bolig-page") && input.isConnected);
  assert.equal(input.value, "Usendt kladd");
  await act(() => button("Vanlig visning").click());
  assert(!q("[data-expo-fullscreen]"));
  assert.notEqual(w.getComputedStyle(q(".head h1")).display, "none");
  assert(workspace === q(".bolig-page") && input.isConnected);
  assert(ordinaryDraft === q("#ordinary-project-form input"));
  assert.equal(ordinaryDraft.value, "Usendt ordinær prosjektkladd");
  assert.equal(
    calls.length,
    readsBeforeViewChange,
    "View changes never reload or navigate",
  );

  await act(() => button("Bytt prosjekt").click());
  const picker = q(".bolig-project-dialog");
  assert(picker.open, "Project chooser opens as its own modal");
  assert.equal(
    q('section.bolig-page[aria-label="Boligprosjekter"] .bolig-root'),
    null,
    "Other projects take no space in the active workspace",
  );
  const pickerSearch = picker.querySelector("input[type=search]");
  await act(() => {
    Object.getOwnPropertyDescriptor(
      w.HTMLInputElement.prototype,
      "value",
    ).set.call(pickerSearch, "ingen treff");
    pickerSearch.dispatchEvent(new w.Event("input", { bubbles: true }));
  });
  assert.equal(picker.querySelectorAll(".bolig-root").length, 0);
  await act(() => {
    Object.getOwnPropertyDescriptor(
      w.HTMLInputElement.prototype,
      "value",
    ).set.call(pickerSearch, "");
    pickerSearch.dispatchEvent(new w.Event("input", { bubbles: true }));
  });
  const readsBefore = calls.filter((c) => c.p_action === "get").length;
  await act(() => picker.querySelector(".bolig-root").click());
  assert(!picker.open);
  assert.equal(
    calls.filter((c) => c.p_action === "get").length,
    readsBefore,
    "Choosing the active project must not reset its phase or draft",
  );
  assert(input.isConnected && input.value === "Usendt kladd");
  await act(() => button("Bytt prosjekt").click());
  await act(() =>
    picker.dispatchEvent(
      new w.Event("cancel", { bubbles: true, cancelable: true }),
    ),
  );
  assert(
    !picker.open && q(".bolig-page")?.isConnected,
    "Escape closes only the project popup, keeping the workspace open",
  );
  assert(!w.__exited, "Popup cancel must never navigate to Startside");
  const key = "expo-proffdok.bolig-draft.v1:self:firm-a:root-1:unit-u";
  assert(
    JSON.parse(w.localStorage.getItem(key)).contact_name === "Usendt kladd",
  );
  await act(() => w.dispatchEvent(new w.Event("focus")));
  assert(q(".bolig-task-dialog input").value === "H0101");
  assert(q(".bolig-task-dialog form").textContent.includes("Kontaktperson"));
  holdContext = true;
  await act(() =>
    w.dispatchEvent(
      new w.CustomEvent("expo-proffdok-work-profile", {
        detail: { active_company_id: "firm-a" },
      }),
    ),
  );
  assert.equal(
    q(".bolig-task-dialog form")?.contains(input),
    true,
    "Same-company profile refresh must retain current apartment and draft DOM while authorization is pending",
  );
  holdContext = false;
  await act(() => contextWaiters.splice(0).forEach((resolve) => resolve()));
  assert.equal(input.value, "Usendt kladd");
  await act(() => w.__unmount());
  await act(() => w.__render("self"));
  assert.equal(
    q(".bolig-task-dialog form input").value,
    "H0101",
    "Selected apartment is restored after access-gate remount",
  );
  const emailLabel = [...w.document.querySelectorAll("label")].find(
    (l) => l.textContent.trim() === "E-post",
  );
  const phoneLabel = [...w.document.querySelectorAll("label")].find(
    (l) => l.textContent.trim() === "Mobil",
  );
  const address = [...w.document.querySelectorAll("input")].find(
    (i) => i.readOnly,
  );
  assert.equal(
    address.value,
    "Eksempelgata 1A",
    "Address follows the selected apartment entrance",
  );
  await act(() => {
    const set = Object.getOwnPropertyDescriptor(
      w.HTMLInputElement.prototype,
      "value",
    ).set;
    for (const [el, value] of [
      [emailLabel.querySelector("input"), "demo@example.invalid"],
      [phoneLabel.querySelector("input"), "+47 900 00 000"],
    ]) {
      set.call(el, value);
      el.dispatchEvent(new w.Event("input", { bubbles: true }));
    }
  });
  conflict = true;
  await act(() =>
    q(".bolig-task-dialog form").dispatchEvent(
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
    q(".bolig-task-dialog form").dispatchEvent(
      new w.Event("submit", { bubbles: true, cancelable: true }),
    ),
  );
  assert.equal(record.units[0].contact_name, "Usendt kladd");
  assert.equal(record.units[0].contact_email, "demo@example.invalid");
  assert.equal(record.units[0].contact_phone, "+47 900 00 000");
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
  await act(() =>
    [...w.document.querySelectorAll('[aria-label="Arbeidsområde"] button')]
      .find((b) => b.textContent.trim() === "Oppsett")
      .click(),
  );
  holdContext = true;
  await act(() =>
    w.dispatchEvent(
      new w.CustomEvent("expo-proffdok-work-profile", {
        detail: { active_company_id: "firm-a" },
      }),
    ),
  );
  assert.equal(
    resize.querySelector(".bolig-floors input").value,
    "3",
    "Pending same-firm authorization retains structure draft",
  );
  holdContext = false;
  await act(() => contextWaiters.splice(0).forEach((resolve) => resolve()));
  await act(() => w.__unmount());
  await act(() => w.__render("self"));
  assert.equal(
    [...w.document.querySelectorAll('[aria-label="Arbeidsområde"] button')]
      .find((b) => b.textContent.trim() === "Oppsett")
      .getAttribute("aria-pressed"),
    "true",
    "Setup phase restores after gate remount",
  );
  assert.equal(
    [...w.document.querySelectorAll("details")]
      .find(
        (x) =>
          x.querySelector("summary")?.textContent ===
          "Endre etasjer og leiligheter",
      )
      .querySelector(".bolig-floors input").value,
    "3",
    "Unsaved floors restore without a server write",
  );
  role = "reader";
  await act(() => w.dispatchEvent(new w.Event("focus")));
  assert.equal(
    q(".bolig-task-dialog form"),
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
  assert.equal(q(".bolig-page"), null);
  await act(() => button("Åpne boligprosjekter").click());
  await act(() => q(".bolig-root").click());
  await act(() => q(".bolig-grid button").click());
  denied = true;
  await act(() =>
    q(".bolig-task-dialog form").dispatchEvent(
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
  assert.equal(q(".bolig-page"), null);
  enabled = false;
  await act(() => w.dispatchEvent(new w.Event("focus")));
  assert.equal(
    q(".bolig-page"),
    null,
    "Unavailable user must not enter workspace",
  );
  assert.equal(q("[data-bolig-enabled]").dataset.boligEnabled, "false");
  assert(!w.document.body.textContent.includes("Aktivering og tilganger"));
  await act(() => w.__unmount());
  enabled = true;
  licensed = false;
  manage = true;
  system = true;
  await act(() => w.__render("self", "system"));
  assert.equal(q("dialog"), null, "License belongs inline in Systemadmin");
  assert(q("input[type=checkbox]"));
  assert.equal(
    q('[aria-label="Boligtilgang for QA Medarbeider"]'),
    null,
    "Systemadmin license surface must not mix individual grants",
  );
  await act(() => w.dispatchEvent(new w.Event("focus")));
  assert(q("input[type=checkbox]"), "Focus preserves firm activation control");
  await act(() => button("Hent firmatilgangene på nytt").click());
  assert(q("input[type=checkbox]"));
  await act(() => q("input[type=checkbox]").click());
  assert.equal(licensed, true);
  assert(q("input[type=checkbox]").checked);
  assert.equal(
    q("[data-bolig-enabled]").dataset.boligEnabled,
    "true",
    "Saved license refreshes global menu entitlement",
  );
  const workCompany = company;
  await act(() => {
    const select = q('[aria-label="Firma for Boligprosjekter"]');
    select.value = "external-firm";
    select.dispatchEvent(new w.Event("change", { bubbles: true }));
  });
  await act(() => q("input[type=checkbox]").click());
  assert.equal(
    externalLicensed,
    true,
    "Systemadmin activates company outside current work profile",
  );
  assert.equal(
    company,
    workCompany,
    "Firm administration must not switch workspace",
  );
  await act(() => w.__unmount());
  system = false;
  await act(() => w.__render("self", "system"));
  assert.equal(
    q("input[type=checkbox]"),
    null,
    "Firmaadmin cannot render system activation control",
  );
  await act(() => w.__unmount());
  await act(() => w.__render("self", "company"));
  assert.equal(
    q("input[type=checkbox]"),
    null,
    "Firmaadmin gets no firm activation control",
  );
  assert(q('[aria-label="Boligtilgang for QA Medarbeider"]'));
  await act(() => {
    const select = q('[aria-label="Boligtilgang for QA Medarbeider"]');
    select.value = "manager";
    select.dispatchEvent(new w.Event("change", { bubbles: true }));
  });
  assert.equal(memberRole, "manager");
  await act(() => {
    const select = q('[aria-label="Boligtilgang for QA Medarbeider"]');
    select.value = "reader";
    select.dispatchEvent(new w.Event("change", { bubbles: true }));
  });
  assert.equal(memberRole, "reader");
  accessConflict = true;
  const memberWrites = calls.filter((c) => c.p_action === "member").length;
  await act(() => {
    const select = q("select");
    select.value = "none";
    select.dispatchEvent(new w.Event("change", { bubbles: true }));
  });
  assert.equal(
    calls.filter((c) => c.p_action === "member").length,
    memberWrites + 1,
    "Conflict must never replay a grant",
  );
  assert(q('[role="alert"]').textContent.includes("Brukertilgangen er endret"));
  assert.equal(q("select"), null, "Stale revision cannot be submitted again");
  accessConflict = false;
  await act(() => button("Hent tilgangene på nytt").click());
  assert.equal(q("select").value, "reader");
  holdAccess = true;
  await act(() => w.dispatchEvent(new w.Event("focus")));
  assert.equal(accessWaiters.length, 1);
  const oldCompany = company;
  company = "firm-c";
  holdAccess = false;
  await act(() =>
    w.dispatchEvent(
      new w.CustomEvent("expo-proffdok-work-profile", {
        detail: { active_company_id: company },
      }),
    ),
  );
  assert(q(".bolig-admin-access h3").textContent.includes("firm-c"));
  await act(() => accessWaiters.splice(0).forEach((resolve) => resolve()));
  assert(
    !q(".bolig-admin-access h3").textContent.includes(oldCompany),
    "Late old-company response must stay ignored",
  );
  licensed = false;
  await act(() => w.dispatchEvent(new w.Event("focus")));
  assert(q("select").disabled, "Unlicensed firm cannot delegate user grants");
  assert.equal(q("input[type=checkbox]"), null);
  manage = false;
  await act(() => w.dispatchEvent(new w.Event("focus")));
  assert.equal(
    q(".bolig-admin-access"),
    null,
    "Revoked admin loses access controls",
  );
  await act(() => w.__unmount());
  role = "reader";
  licensed = true;
  await act(() => w.__render("self"));
  assert(q(".bolig-page"));
  assert.equal(
    Boolean(
      q(
        'section.bolig-page[aria-label="Boligprosjekter"] input[type=checkbox]',
      ),
    ),
    false,
    "Reader workspace has no administrative grant toggles; project popup has its own archive filter",
  );
  assert(
    !q('section.bolig-page[aria-label="Boligprosjekter"]').textContent.includes(
      "Systemadmin",
    ),
    "Ordinary workspace has no admin instructions",
  );
  assert(!q(".bolig-page").textContent.includes("Firmaadmin"));
  assert(
    q(".bolig-help:not([open])"),
    "Guide is available but collapsed so the facade is the first workspace",
  );
  await act(() => w.__unmount());
  role = "manager";
  emptyListing = true;
  const builderKey = `expo-proffdok.bolig-draft.v1:self:${company}:new:builder`;
  w.localStorage.setItem(
    builderKey,
    JSON.stringify({
      version: 1,
      request_id: "qa-request",
      title: "First project",
      reference: "QA",
      type: "house",
      step: 3,
      selected: 0,
      submitted: false,
      buildings: [
        {
          key: "qa-building",
          name: "House",
          building_type: "house",
          address: "Example 1",
          house_floors: 2,
          entrances: [{ key: "e", address: "", counts: [1] }],
        },
      ],
    }),
  );
  await act(() => w.__render("self"));
  assert(
    !q(".bolig-project-header"),
    "First project starts from empty listing",
  );
  await act(() => button("Fortsett prosjektkladd").click());
  const builderDialog = q(".bolig-builder-dialog");
  await act(() =>
    builderDialog
      .querySelector("form")
      .dispatchEvent(
        new w.Event("submit", { bubbles: true, cancelable: true }),
      ),
  );
  assert.equal(q(".bolig-project-header h3").textContent, "First project");
  assert.equal(
    q(".bolig-builder-dialog"),
    builderDialog,
    "First creation keeps the wizard mounted across empty to populated workspace",
  );
  assert(!builderDialog.open, "Receipt closes builder");
  assert.equal(
    w.localStorage.getItem(builderKey),
    null,
    "Receipt clears exact local attempt",
  );
  assert(button("Bygg nytt prosjekt"), "Next creation starts with a clean wizard");
  await act(() => w.__unmount());
  await act(() => w.__dispose());
  dom.window.close();
  console.log(
    "PASS bolig actual React: server-gated menu, separate Systemadmin license and Firmaadmin member controls, no admin instructions in workspace, license/grant readback, reader/manager and revoked admin, real component, inline page/form isolation, shared fullscreen roundtrip without remount/RPC/draft loss, scoped local drafts, focus preservation, conflict/retry, server readback, company switch and entitlement revocation.",
  );
} catch (e) {
  console.error(e.stack || e.message);
  process.exitCode = 1;
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
