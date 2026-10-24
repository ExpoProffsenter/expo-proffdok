import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "../../src/style.css";
import Card from "../../src/modules/bolig/BoligPresenceCard.jsx";
import People from "../../src/modules/bolig/BoligAttendancePeople.jsx";
const ctx = {
    user_id: "user",
    company_id: "company",
    enabled: true,
    role: "manager",
  },
  root = { id: "root", title: "QA Prosjekt" };
let state = JSON.parse(localStorage.getItem("qa.self-state") || "null") || {
  revision: 1,
  visit: null,
  receipts: {},
  people: [],
};
window.writes = 0;
window.denied = false;
window.lost = false;
window.empty = false;
window.__client = {
  rpc: async (n, a) => {
    if (window.readDelay && a.p_action === "get") await new Promise(resolve => setTimeout(resolve, window.readDelay));
    if (window.denied)
      return { error: { code: "42501", message: "Tilgang tilbakekalt" } };
    const p = a.p_payload || {},
      action = a.p_action;
    if (n === "bolig_attendance_people") {
      if (action === "add" && !state.receipts[p.request_id]) {
        state.people.push({
          id: "person",
          user_id: "user",
          name: p.name,
          company: "QA Firma",
          enabled: true,
          revision: 1,
        });
        state.receipts[p.request_id] = true;
      }
      if (action === "toggle" && !state.receipts[p.request_id]) {
        state.people[0].enabled = p.enabled;
        state.people[0].revision++;
        state.receipts[p.request_id] = true;
      }
      localStorage.setItem("qa.self-state", JSON.stringify(state));
      return {
        data: {
          context: ctx,
          root_id: root.id,
          people: state.people,
          users: [{ id: "user", email: "qa@example.invalid" }],
          partners: [{ id: "ue", name: "QA UE", company: "UE Firma" }],
          receipt_id: action === "get" ? null : p.request_id,
        },
      };
    }
    if (action !== "get" && !state.receipts[p.request_id]) {
      if (p.revision !== state.revision)
        return { error: { code: "PT409", message: "Status er endret" } };
      state.revision++;
      window.writes++;
      state.receipts[p.request_id] = true;
      state.visit =
        action === "in"
          ? { id: "visit", arrived_at: new Date().toISOString() }
          : null;
      localStorage.setItem("qa.self-state", JSON.stringify(state));
      if (window.lost) {
        window.lost = false;
        return { error: { message: "Tapt svar" } };
      }
    }
    return {
      data: {
        context: ctx,
        id: "ue",
        entries: window.empty
          ? []
          : [
              {
                id: "person",
                root_id: "root",
                name: "QA Person",
                company: "QA Firma",
                project: "QA Prosjekt",
                revision: state.revision,
                visit: state.visit,
              },
              {
                id: "second",
                root_id: "root2",
                name: "QA Person",
                company: "QA Firma",
                project: "Et annet prosjekt",
                revision: 1,
                visit: null,
              },
            ],
        receipt_id: action === "get" ? null : p.request_id,
      },
    };
  },
};
window.fetch = async (url, options) => {
  const p = JSON.parse(options.body);
  const result = await window.__client.rpc("bolig_my_attendance", {
    p_action: p.p_action,
    p_payload: p.p_payload,
  });
  return { ok: !result.error, json: async () => result.error || result.data };
};
function App() {
  const [ue, setUe] = useState(false);
  return (
    <main>
      <button onClick={() => setUe((x) => !x)}>Bytt intern / UE</button>
      <Card
        key={String(ue)}
        context={ctx}
        token={ue ? "ab".repeat(32) : undefined}
      />
      <People context={ctx} root={root} enabled />
    </main>
  );
}
createRoot(document.getElementById("app")).render(<App />);
