import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import Workspace from "../../src/modules/bolig/BoligVisualWorkspace.jsx";
import "../../src/style.css";
import "../../src/modules/bolig/bolig.css";
const uid = (n) => `78000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
window.__context = {
  user_id: uid(1),
  company_id: uid(2),
  role: "manager",
  enabled: true,
};
window.__root = { id: uid(3), revision: 1, archived: false };
window.__block = uid(4);
window.__unit = uid(5);
window.__targets = [1, 2, 3, 4].map((i) => ({
  id: uid(10 + i),
  label: `H0${i}01`,
  entrance_id: uid(6),
  position: (i % 2) + 1,
  floor: Math.ceil(i / 2),
}));
window.__rooms = [
  { id: uid(21), label: "Bad 1", floor: "1" },
  { id: uid(22), label: "Vaskerom", floor: "1" },
];
window.__store = JSON.parse(
  localStorage.getItem("qa.visual.documents") || "{}",
);
window.__calls = [];
window.__waiters = [];
const clone = (x) => JSON.parse(JSON.stringify(x));
window.__client = {
  storage: {
    from: () => ({
      upload: async (path, file) => {
        const bytes = Array.from(new Uint8Array(await file.arrayBuffer()));
        localStorage.setItem(
          "qa.visual.file:" + path,
          JSON.stringify({ type: file.type, bytes }),
        );
        window.__calls.push({ name: "upload", path });
        if (window.__loseUpload) {
          window.__loseUpload = false;
          return { error: { message: "Lost upload receipt" } };
        }
        return {};
      },
      download: async (path) => {
        window.__calls.push({ name: "download", path });
        if (window.__deny) return { error: { code: "42501" } };
        const value = JSON.parse(
          localStorage.getItem("qa.visual.file:" + path) || "null",
        );
        return value
          ? {
              data: new Blob([new Uint8Array(value.bytes)], {
                type: value.type,
              }),
            }
          : { error: { message: "Missing image" } };
      },
    }),
  },
  rpc: async (name, args) => {
    window.__calls.push({ name, args: clone(args) });
    if (name !== "bolig_visuals") throw Error("Unexpected RPC: " + name);
    if (window.__deny)
      return { error: { code: "42501", message: "Tilgangen er fjernet." } };
    const scope = args.p_scope_id,
      kind = scope === window.__block ? "facade" : "plan",
      targets = kind === "facade" ? window.__targets : window.__rooms;
    const scopeKey = args.p_company_id + "/" + scope,
      state = (window.__store[scopeKey] ||= {
        sheets: [],
        versions: [],
        receipts: {},
      });
    const reply = () => ({
      data: clone({
        context: window.__context,
        root_id: args.p_root_id,
        scope_id: scope,
        kind,
        basis: window.__basis || "basis-1",
        targets,
        root_archived: false,
        sheets: state.sheets,
      }),
    });
    if (args.p_action === "list") {
      const response = reply();
      if (window.__holdList)
        return new Promise((resolve) =>
          window.__waiters.push(() => resolve(response)),
        );
      return response;
    }
    const p = args.p_payload;
    if (args.p_action === "history")
      return {
        data: {
          ...reply().data,
          history: state.versions
            .filter((v) => v.sheet_id === p.sheet_id)
            .toReversed(),
        },
      };
    if (window.__context.role !== "manager")
      return { error: { code: "42501", message: "Prosjektleder kreves." } };
    let receipt = state.receipts[p.request_id];
    const sheet = state.sheets.find((s) => s.id === p.sheet_id);
    if (!receipt) {
      if (
        args.p_revision !== (sheet?.revision || 0) ||
        p.basis !== (window.__basis || "basis-1")
      )
        return {
          error: {
            code: "PT409",
            message:
              "Bildet eller rom-/boligoppsettet er endret. Kladden er beholdt.",
          },
        };
      const revision = (sheet?.revision || 0) + 1,
        current = clone(p);
      const s = {
        id: p.sheet_id,
        title: p.title,
        revision,
        archived: p.archived,
        kind,
        current,
        version_id: p.request_id,
        created_at: new Date().toISOString(),
      };
      if (sheet) state.sheets[state.sheets.indexOf(sheet)] = s;
      else state.sheets.push(s);
      state.versions.push({
        id: p.request_id,
        sheet_id: p.sheet_id,
        revision,
        snapshot: current,
        created_at: s.created_at,
      });
      receipt = { id: p.request_id, revision };
      state.receipts[p.request_id] = receipt;
      localStorage.setItem(
        "qa.visual.documents",
        JSON.stringify(window.__store),
      );
      if (window.__loseSave) {
        window.__loseSave = false;
        return {
          error: { message: "Lagringssvaret gikk tapt. Kladden er beholdt." },
        };
      }
    }
    if (window.__holdSave)
      await new Promise((resolve) => {
        window.__resumeSave = resolve;
      });
    return {
      data: {
        ...reply().data,
        receipt_id: receipt.id,
        receipt_revision: receipt.revision,
      },
    };
  },
};
const root = createRoot(document.getElementById("app"));
function App({ kind = "facade" }) {
  const [selected, setSelected] = useState("");
  return (
    <section
      className="bolig-page bolig-dialog"
      style={{
        maxWidth: 1100,
        padding: 16,
        margin: "auto",
        boxSizing: "border-box",
        width: "100%",
      }}
    >
      <h2>QA egne prosjektbilder</h2>
      <Workspace
        context={{ ...window.__context }}
        root={window.__root}
        scope={kind === "facade" ? window.__block : window.__unit}
        kind={kind}
        selected={selected}
        onSelect={setSelected}
        statusFor={() => ({ tone: "review", label: "Se over varegrunnlag" })}
      >
        <button type="button">Standardvisning</button>
      </Workspace>
      <output aria-label="Valgt stabil ID">{selected}</output>
    </section>
  );
}
window.__render = (kind = "facade") =>
  root.render(
    <App
      key={window.__context.company_id + kind + window.__context.role}
      kind={kind}
    />,
  );
window.__render();
