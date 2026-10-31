import React from "react";
import { createRoot } from "react-dom/client";
import "../../src/style.css";
import "../../src/modules/bolig/bolig.css";
import Integration from "../../src/modules/bolig/BoligProjectIntegration.jsx";
import Tasks from "../../src/modules/bolig/BoligMyTasks.jsx";
const ctx = {
    company_id: "firm",
    user_id: "self",
    enabled: true,
    role: "manager",
  },
  personal = { company_id: "firm", user_id: "self" },
  ks = { company_id: "firm", user_id: "self", enabled: true, manage: true },
  hr = { ...ks, available: true };
let state = JSON.parse(localStorage.getItem("qa.integration") || "null") || {
  project: null,
  revision: 0,
  receipts: {},
};
window.writes = 0;
window.denied = false;
window.lost = false;
window.nav = [];
window.leaves = [];
window.caseClosed = false;
window.taskReadFailure = new URLSearchParams(location.search).has('tasks-error');
window.tasksEmpty = new URLSearchParams(location.search).has('tasks-empty');
window.taskReads = 0;
window.tasks = () => [
  {
    id: "progress1",
    kind: "progress",
    root_id: "root",
    unit_id: "unit",
    project_title: "QA Boligprosjekt",
    unit_number: "H0101",
    title: "Monter bad",
    due_on: "2026-01-15",
    date_label: "Planlagt ferdig",
  },
  ...(!window.caseClosed
    ? [
        {
          id: "case1",
          kind: "deviation",
          project_id: "project",
          root_id: "root",
          project_title: "QA Boligprosjekt",
          title: "Min RUH",
          due_on: "2026-01-16",
          date_label: "Frist",
        },
      ]
    : []),
];
window.__client = {
  rpc: async (name, a) => {
    if (name === "bolig_project_integration" && a.p_action === "get" && window.integrationDelay)
      await new Promise(resolve=>setTimeout(resolve,window.integrationDelay));
    if (window.denied)
      return { error: { code: "42501", message: "Tilgang tilbakekalt" } };
    if (name === "get_hr_context") return { data: hr };
    if (["kshms_project_report", "kshms_project_execution_report"].includes(name))
      return {data:{context:{...ks,project_id:a.p_project_id},choices:{sjas:[],ruhs:[],rounds:[],risks:[]}}};
    if (name === "bolig_my_project_tasks") {
      window.taskReads++;
      if (window.taskReadFailure) return {error:{message:'Midlertidig nettverksfeil'}};
      const all = window.tasksEmpty ? [] : new URLSearchParams(location.search).has('tasks-many') ? Array.from({length:24},(_,i)=>({...window.tasks()[i%2],id:'many-'+i,kind:['progress','deviation','round','risk'][i%4],title:'Boligoppgave '+(i+1)})) : window.tasks();
      const start=Number(a.p_payload?.after||0),items=all.slice(start,start+8);
      return {
        data: {
          context: ctx,
          ks_context: ks,
          count: all.length,
          items,
          next: start+8<all.length?String(start+8):null,
          selected:
            all.find(
              (x) =>
                x.id === a.p_payload?.selected_id &&
                x.kind === a.p_payload?.selected_kind,
            ) || null,
        },
      };
    }
    const p = a.p_payload || {},
      action = a.p_action;
    if (action !== "get" && !state.receipts[p.request_id]) {
      if (p.revision !== state.revision)
        return { error: { code: "PT409", message: "Koblingen er endret" } };
      state.revision++;
      state.project = {
        id: p.project_id,
        title:
          action === "create" ? "QA Boligprosjekt" : "Eksisterende prosjekt",
        locked: false,
      };
      state.receipts[p.request_id] = true;
      window.writes++;
      localStorage.setItem("qa.integration", JSON.stringify(state));
      if (window.lost) {
        window.lost = false;
        return { error: { message: "Tapt svar" } };
      }
    }
    return {
      data: {
        context: ctx,
        root_id: "root",
        ks_context: ks,
        revision: state.revision,
        has_link: !!state.project,
        project: state.project,
        candidates: [{ id: "existing", title: "Eksisterende prosjekt" }],
        receipt_id: action === "get" ? null : p.request_id,
      },
    };
  },
};
const record = {
  root: { id: "root", title: "QA Boligprosjekt", reference: "QA-1" },
  units: [{ id: "unit", number: "H0101", project_id: "apartment" }],
};
createRoot(document.getElementById("app")).render(
  <main>
    <Integration
      context={ctx}
      record={record}
      onOpenProject={(id, tab) => window.nav.push({ id, tab })}
    />
    <Tasks context={personal} />
  </main>,
);
