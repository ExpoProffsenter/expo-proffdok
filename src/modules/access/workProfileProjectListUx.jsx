// Expo ProffDok – FASE 41B.3
// Tilleggsvisning i eksisterende Prosjektliste for flerfirma-brukere.
// Viser kollegaenes prosjekter i aktiv arbeidsprofil. Eksisterende prosjektmotor
// og egne prosjektkort beholdes urørt; åpning går tilbake til ordinær prosjektflate.

import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Building2, RefreshCw } from "lucide-react";
import {
  getStoredSupabaseSession,
  rpcWithStoredSession,
} from "./moduleAccessClient.js";
import {
  WORK_PROFILE_EVENT,
  getMyWorkProfileState,
  readCachedWorkProfileState,
} from "./workProfileClient.js";

const HOST_ID = "expo-work-profile-project-list";
const SUPPORT_LABEL = "SYSTEMADMIN SUPPORTMODUS";
let root = null;
let lastPanel = null;
let filterTimer = 0;

function compactText(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function normalize(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "a")
    .toLocaleLowerCase("nb-NO");
}

function supportModeActive() {
  return Array.from(document.querySelectorAll("strong")).some(
    (node) => compactText(node.textContent) === SUPPORT_LABEL
  );
}

function findProjectListSection() {
  if (supportModeActive()) return null;
  const heading = Array.from(document.querySelectorAll("h2,h3")).find(
    (node) => compactText(node.textContent) === "Prosjektliste"
  );
  return heading?.closest("section") || heading?.parentElement || null;
}

function findSearchPanel(section) {
  return section?.querySelector(".projectListSearchPanel") || null;
}

function readUiFilters(panel) {
  const input = panel?.querySelector("input") || null;
  const select = panel?.querySelector("select") || null;
  const unreadButton = Array.from(panel?.querySelectorAll("button") || []).find((button) => {
    const text = compactText(button.textContent);
    return text === "Kun uleste" || text === "Vis alle";
  });
  return {
    query: String(input?.value || ""),
    status: String(select?.value || "alle"),
    unreadOnly: compactText(unreadButton?.textContent) === "Vis alle",
  };
}

function projectTone(item = {}) {
  const project = item.project || {};
  if (item.locked === true || project.locked === true || project.status === "locked") return "locked";
  const status = String(project.workflowStatus || project.status || "").trim();
  if (status === "Ferdigstilt" || status === "done") return "done";
  if (status === "Utkast" || status === "draft") return "draft";
  if (status === "Avventer" || status === "waiting") return "waiting";
  if (status === "Klar for kunde" || status === "customer_ready") return "customer_ready";
  if (status === "Avvik åpent" || status === "deviation") return "deviation";
  return "progress";
}

function projectStatusLabel(item = {}) {
  const tone = projectTone(item);
  const labels = {
    locked: "Arkivert / låst",
    done: "Ferdigstilt",
    draft: "Utkast",
    waiting: "Avventer",
    customer_ready: "Klar for kunde",
    deviation: "Avvik åpent",
    progress: "Pågår",
  };
  return labels[tone] || "Pågår";
}

function unreadCustomerCount(item = {}) {
  const log = item.project_log || {};
  const messages = Array.isArray(log.messages) ? log.messages : [];
  const lastRead = String(log.lastReadByAdmin || "");
  return messages.filter(
    (message) => message?.role === "kunde" && (!lastRead || String(message?.created || "") > lastRead)
  ).length;
}

function searchable(item = {}) {
  return normalize(JSON.stringify([
    item.id,
    item.title,
    item.company_name,
    item.owner_email,
    item.project || {},
    item.warranty || {},
  ]));
}

function matchesSearch(item, query) {
  const terms = normalize(query).split(/[\s,;:/|\\]+/).map((term) => term.trim()).filter(Boolean);
  if (!terms.length) return true;
  const source = searchable(item);
  return terms.every((term) => source.includes(term));
}

function matchesStatus(item, status) {
  const clean = String(status || "alle");
  if (clean === "alle") return true;
  const tone = projectTone(item);
  if (clean === "open" || clean === "progress") return tone === "progress";
  if (clean === "done") return tone === "done" || tone === "locked";
  return tone === clean;
}

function openProject(item, tab = "prosjekt") {
  const params = new URLSearchParams();
  params.set("project", String(item.id));
  params.set("role", "admin");
  params.set("tab", tab);
  window.location.assign(`${window.location.pathname}?${params.toString()}`);
}

async function fetchSharedProjects() {
  const payload = await rpcWithStoredSession("list_active_work_profile_projects");
  return {
    companyId: String(payload?.company_id || ""),
    companyName: String(payload?.company_name || ""),
    projects: Array.isArray(payload?.projects) ? payload.projects : [],
  };
}

function SharedProjectList({ panel, workProfileState }) {
  const [payload, setPayload] = useState({ companyId: "", companyName: "", projects: [] });
  const [filters, setFilters] = useState(() => readUiFilters(panel));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const userId = getStoredSupabaseSession().userId;

  const refresh = async () => {
    setLoading(true);
    setError("");
    try {
      setPayload(await fetchSharedProjects());
    } catch (fetchError) {
      setError(fetchError?.message || "Kunne ikke hente felles prosjekter.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [workProfileState?.active_company_id]);

  useEffect(() => {
    const update = () => setFilters(readUiFilters(panel));
    const inputHandler = () => {
      if (filterTimer) window.clearTimeout(filterTimer);
      filterTimer = window.setTimeout(update, 20);
    };
    panel?.addEventListener("input", inputHandler, true);
    panel?.addEventListener("change", inputHandler, true);
    panel?.addEventListener("click", inputHandler, true);
    return () => {
      panel?.removeEventListener("input", inputHandler, true);
      panel?.removeEventListener("change", inputHandler, true);
      panel?.removeEventListener("click", inputHandler, true);
    };
  }, [panel]);

  const colleagues = useMemo(
    () => (payload.projects || []).filter((item) => String(item.user_id || "") !== String(userId || "")),
    [payload.projects, userId]
  );
  const visible = useMemo(
    () => colleagues.filter((item) =>
      matchesSearch(item, filters.query) &&
      matchesStatus(item, filters.status) &&
      (!filters.unreadOnly || unreadCustomerCount(item) > 0)
    ),
    [colleagues, filters]
  );

  if (!workProfileState?.can_switch) return null;

  return (
    <div className="workProfileSharedProjects">
      <div className="workProfileSharedHeader">
        <div>
          <small>Flerfirma / samarbeid</small>
          <h3>Felles prosjekter i {payload.companyName || workProfileState?.active_company_profile?.companyName || "aktiv arbeidsprofil"}</h3>
          <p>Viser kollegaenes prosjekter. Dine egne prosjektkort vises fortsatt i den ordinære listen under.</p>
        </div>
        <button type="button" className="secondary" onClick={refresh} disabled={loading}>
          <RefreshCw size={16} /> {loading ? "Henter..." : "Oppdater felles"}
        </button>
      </div>

      {error ? <p className="workProfileSharedError">{error}</p> : null}
      {!error && !loading ? (
        <p className="note">Viser {visible.length} av {colleagues.length} felles prosjekt{colleagues.length === 1 ? "" : "er"} med gjeldende søk/filter.</p>
      ) : null}

      {!error && !loading && colleagues.length === 0 ? (
        <div className="workProfileSharedEmpty">Ingen andre prosjekter ligger i denne arbeidsprofilen ennå.</div>
      ) : null}
      {!error && !loading && colleagues.length > 0 && visible.length === 0 ? (
        <div className="workProfileSharedEmpty">Ingen felles prosjekter matcher søket eller filteret.</div>
      ) : null}

      <div className="workProfileSharedList">
        {visible.map((item) => {
          const project = item.project || {};
          const location = [project.address, project.postnr, project.city].filter(Boolean).join(", ");
          const unread = unreadCustomerCount(item);
          const updated = item.updated_at ? new Date(item.updated_at).toLocaleString("no-NO") : "";
          return (
            <article key={item.id} className="item workProfileSharedCard">
              <div>
                <div className="workProfileSharedTitleRow">
                  <strong>{item.title || project.projectName || project.address || "Uten navn"}</strong>
                  <span>{projectStatusLabel(item)}</span>
                </div>
                {project.customer ? <p><b>Kunde:</b> {project.customer}</p> : null}
                <div className="workProfileSharedMeta">
                  {location ? <small>📍 {location}</small> : null}
                  {project.responsible ? <small>👤 Ansvarlig: {project.responsible}</small> : item.owner_email ? <small>👤 {item.owner_email}</small> : null}
                  {unread > 0 ? <small className="hasUnread">💬 {unread} ulest</small> : null}
                  {updated ? <small>Oppdatert {updated}</small> : null}
                </div>
              </div>
              <div className="workProfileSharedActions">
                <button type="button" onClick={() => openProject(item, "prosjekt")}>Åpne</button>
                <button type="button" className="secondary" onClick={() => openProject(item, "bilder")}>Bilder</button>
                <button type="button" className="secondary" onClick={() => openProject(item, "sjekklister")}>Sjekklister</button>
                <button type="button" className="secondary" onClick={() => openProject(item, "rapport")}>Rapport</button>
              </div>
            </article>
          );
        })}
      </div>

      <style>{`
        .workProfileSharedProjects{margin:16px 0;padding:18px;border:1px solid #bcdde1;border-radius:18px;background:#f9ffff}.workProfileSharedHeader{display:flex;justify-content:space-between;align-items:flex-start;gap:16px}.workProfileSharedHeader small{font-weight:800;color:#159aa3}.workProfileSharedHeader h3{margin:3px 0 5px}.workProfileSharedHeader p{margin:0;color:#60737b}.workProfileSharedHeader button{display:inline-flex;align-items:center;gap:6px;white-space:nowrap}.workProfileSharedList{display:grid;gap:10px;margin-top:12px}.workProfileSharedCard{display:flex;justify-content:space-between;gap:18px;align-items:center;background:#fff}.workProfileSharedCard p{margin:6px 0}.workProfileSharedTitleRow{display:flex;gap:10px;align-items:center;flex-wrap:wrap}.workProfileSharedTitleRow strong{font-size:18px}.workProfileSharedTitleRow span{display:inline-flex;padding:5px 9px;border-radius:999px;background:#eef6f8;color:#36545f;font-size:12px;font-weight:800}.workProfileSharedMeta{display:flex;gap:10px;flex-wrap:wrap;color:#64748b}.workProfileSharedMeta .hasUnread{color:#991b1b;font-weight:800}.workProfileSharedActions{display:flex;gap:7px;flex-wrap:wrap;justify-content:flex-end}.workProfileSharedEmpty,.workProfileSharedError{margin-top:12px;padding:13px;border-radius:11px;background:#fff;color:#60737b}.workProfileSharedError{border:1px solid #fecaca;background:#fff7f7;color:#991b1b;font-weight:800}
        @media(max-width:760px){.workProfileSharedProjects{padding:14px}.workProfileSharedHeader,.workProfileSharedCard{flex-direction:column;align-items:stretch}.workProfileSharedHeader button,.workProfileSharedActions button{width:100%}.workProfileSharedActions{display:grid;grid-template-columns:1fr 1fr}.workProfileSharedMeta{display:grid;gap:4px}}
        @media(max-width:460px){.workProfileSharedActions{grid-template-columns:1fr}}
      `}</style>
    </div>
  );
}

function mountSharedList() {
  const state = readCachedWorkProfileState();
  const section = findProjectListSection();
  const panel = findSearchPanel(section);
  if (!state?.can_switch || !section || !panel) {
    document.getElementById(HOST_ID)?.remove();
    root?.unmount?.();
    root = null;
    lastPanel = null;
    return;
  }

  let host = document.getElementById(HOST_ID);
  if (!host || host.parentElement !== section) {
    root?.unmount?.();
    root = null;
    host?.remove?.();
    host = document.createElement("div");
    host.id = HOST_ID;
    panel.insertAdjacentElement("afterend", host);
  }
  if (!root) root = createRoot(host);
  lastPanel = panel;
  root.render(<SharedProjectList panel={panel} workProfileState={state} />);
}

export function installWorkProfileProjectListUx() {
  if (typeof window === "undefined" || window.__expoWorkProfileProjectListUxInstalled) return;
  window.__expoWorkProfileProjectListUxInstalled = true;

  let frame = 0;
  const schedule = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      mountSharedList();
    });
  };

  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener(WORK_PROFILE_EVENT, schedule);
  window.addEventListener("focus", () => {
    getMyWorkProfileState().finally(schedule);
  });
  window.setTimeout(() => getMyWorkProfileState().finally(schedule), 650);
  window.setTimeout(schedule, 1100);
}
