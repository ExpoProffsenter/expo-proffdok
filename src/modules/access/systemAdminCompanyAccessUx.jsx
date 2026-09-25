// Expo ProffDok – FASE 45B
// Samler Systemadmins firma-, bruker- og profftilgangsadministrasjon i én skalerbar flate.
// Eksisterende legacy-kort eier fortsatt godkjenning, firma, rolle og brukerstatus; de flyttes
// ikke i DOM-en. Dette laget grupperer firmaer, viser ett firma om gangen og monterer
// leverandør/rabatt i samme administrasjonsseksjon.

import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { listManagedModuleAccess } from "./moduleAccessClient.js";
import ProStoreCatalogAdminPanel from "../storeCatalog/ProStoreCatalogAdminPanel.jsx";
import { listCatalogCompanies } from "../storeCatalog/proStoreCatalogClient.js";
import { createDefaultSalesSupabaseClient } from "../sales/services/salesSupabase.js";

const MOUNT_ID = "expo-systemadmin-company-access";
const LEGACY_MARKER_ID = "expo-systemadmin-legacy-user-access-marker";
const PANEL_TITLE = "Firmaer, brukere og tilganger";
const PANEL_INTRO = "Velg firma og administrer brukere, roller, moduler, prisinnsyn og leverandør/rabatt på samme sted. Firmaene er kollapset slik at flaten skalerer når listen blir lang.";
const INTERNAL_COMMERCE_COMPANIES = new Set([
  "ringside rorleggerbedrift as",
  "bademiljo expo",
  "expo proffsenter",
]);

function compactText(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function normalizeCompany(value = "") {
  return compactText(value)
    .toLocaleLowerCase("nb-NO")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o");
}

function companyKey(companyId = "", companyName = "") {
  const id = compactText(companyId);
  if (id) return `id:${id}`;
  const name = normalizeCompany(companyName);
  return `name:${name || "uten-firma"}`;
}

function findLegacyPanel() {
  const headings = Array.from(document.querySelectorAll("h3"));
  const heading = headings.find((node) => {
    const text = compactText(node.textContent);
    return text === "Brukergodkjenning" || text === "Brukere og tilganger" || text === PANEL_TITLE;
  });
  return heading?.closest(".item") || null;
}

function findDirectPanelHeading(panel) {
  if (!panel) return null;
  return Array.from(panel.children).find((node) => {
    if (!(node instanceof HTMLElement) || node.tagName !== "H3") return false;
    const text = compactText(node.textContent);
    return text === "Brukergodkjenning" || text === "Brukere og tilganger" || text === PANEL_TITLE;
  }) || null;
}

function ensureLegacyMarker(panel) {
  if (!panel) return;
  let marker = panel.querySelector(`#${LEGACY_MARKER_ID}`);
  if (!marker) {
    marker = document.createElement("h3");
    marker.id = LEGACY_MARKER_ID;
    marker.textContent = "Brukere og tilganger";
    marker.setAttribute("aria-hidden", "true");
    marker.style.display = "none";
    panel.appendChild(marker);
  }
}

function renameAccordionButton() {
  const button = Array.from(document.querySelectorAll("button.secondary")).find((candidate) => {
    const text = compactText(candidate.textContent);
    return text.includes("Brukere og roller") || text.includes("Brukere og tilganger") || text.includes(PANEL_TITLE);
  });
  if (!button) return;
  const textNode = Array.from(button.childNodes).find((node) => node.nodeType === Node.TEXT_NODE);
  if (!textNode) return;
  const current = String(textNode.textContent || "");
  const next = current
    .replace("Brukere og roller", PANEL_TITLE)
    .replace("Brukere og tilganger", PANEL_TITLE);
  if (next !== current) textNode.textContent = next;
}

function preparePanel(panel) {
  if (!panel) return;
  const heading = findDirectPanelHeading(panel);
  if (heading) {
    if (compactText(heading.textContent) !== PANEL_TITLE) heading.textContent = PANEL_TITLE;
    const intro = heading.nextElementSibling;
    if (intro instanceof HTMLElement && intro.matches("p.note") && compactText(intro.textContent) !== compactText(PANEL_INTRO)) {
      intro.textContent = PANEL_INTRO;
    }
  }
  ensureLegacyMarker(panel);
  renameAccordionButton();
}

function buildCompanyRows(users = [], companies = []) {
  const rows = [];
  const byId = new Map();
  const byName = new Map();

  const addRow = ({ companyId = "", companyName = "", user = null } = {}) => {
    const cleanId = compactText(companyId);
    const cleanName = compactText(companyName) || "Uten firma";
    const normalizedName = normalizeCompany(cleanName);
    let row = cleanId ? byId.get(cleanId) : null;
    if (!row && normalizedName) row = byName.get(normalizedName) || null;
    if (!row) {
      row = {
        key: companyKey(cleanId, cleanName),
        companyId: cleanId,
        companyName: cleanName,
        users: [],
        hasProCatalog: false,
      };
      rows.push(row);
    }
    if (cleanId && !row.companyId) row.companyId = cleanId;
    if (cleanName !== "Uten firma" && row.companyName === "Uten firma") row.companyName = cleanName;
    if (cleanId) byId.set(cleanId, row);
    if (normalizedName) byName.set(normalizedName, row);
    if (user && !row.users.some((entry) => entry.user_id === user.user_id)) {
      row.users.push(user);
      row.hasProCatalog = row.hasProCatalog || user.company_has_pro_catalog === true;
    }
    return row;
  };

  (Array.isArray(companies) ? companies : []).forEach((company) => {
    addRow({
      companyId: company?.company_id,
      companyName: company?.display_name,
    });
  });

  (Array.isArray(users) ? users : []).forEach((user) => {
    addRow({
      companyId: user?.company_scope_id,
      companyName: user?.company_name,
      user,
    });
  });

  rows.forEach((row) => {
    row.key = companyKey(row.companyId, row.companyName);
    row.pendingCount = row.users.filter((user) => !user.approved && !user.deactivated).length;
    row.deactivatedCount = row.users.filter((user) => user.deactivated).length;
    row.internalCompany = INTERNAL_COMMERCE_COMPANIES.has(normalizeCompany(row.companyName));
  });

  return rows.sort((a, b) => {
    if (a.pendingCount !== b.pendingCount) return b.pendingCount - a.pendingCount;
    return a.companyName.localeCompare(b.companyName, "nb");
  });
}

function CompanyNavigator({ snapshot, activeKey, onActiveChange }) {
  const [client] = useState(() => createDefaultSalesSupabaseClient());
  const [companies, setCompanies] = useState([]);
  const [companyError, setCompanyError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    listCatalogCompanies(client)
      .then((rows) => {
        if (!cancelled) {
          setCompanies(Array.isArray(rows) ? rows : []);
          setCompanyError("");
        }
      })
      .catch((error) => {
        if (!cancelled) setCompanyError(error?.message || "Kunne ikke hente registrerte firmaer.");
      });
    return () => { cancelled = true; };
  }, [client]);

  const rows = useMemo(
    () => buildCompanyRows(snapshot?.users || [], companies),
    [snapshot?.users, companies]
  );

  const filteredRows = useMemo(() => {
    const needle = normalizeCompany(query);
    if (!needle) return rows;
    return rows.filter((row) => {
      const searchable = normalizeCompany([
        row.companyName,
        ...row.users.map((user) => `${user.email || ""} ${user.company_role || ""}`),
      ].join(" "));
      return searchable.includes(needle);
    });
  }, [rows, query]);

  useEffect(() => {
    if (activeKey && !rows.some((row) => row.key === activeKey)) onActiveChange("");
  }, [rows, activeKey, onActiveChange]);

  function toggleCompany(row) {
    onActiveChange(activeKey === row.key ? "" : row.key);
  }

  return (
    <div className="company-access-navigator" data-company-admin-navigator="1">
      <div className="company-access-intro">
        <div>
          <strong>Firmaer</strong>
          <small>Åpne ett firma om gangen. Brukerkortene nedenfor følger valgt firma.</small>
        </div>
        <span>{rows.length} firma</span>
      </div>

      <input
        className="company-access-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Søk firma, bruker eller e-post"
        aria-label="Søk firma, bruker eller e-post"
      />

      {companyError ? <small className="company-access-error">{companyError}</small> : null}

      <div className="company-access-list">
        {filteredRows.map((row) => {
          const open = activeKey === row.key;
          const userLabel = `${row.users.length} ${row.users.length === 1 ? "bruker" : "brukere"}`;
          return (
            <section key={row.key} className={`company-access-row${open ? " is-open" : ""}`}>
              <button
                type="button"
                className="company-access-toggle"
                aria-expanded={open}
                onClick={() => toggleCompany(row)}
              >
                <span className="company-access-chevron">{open ? "▼" : "▶"}</span>
                <span className="company-access-name">{row.companyName}</span>
                <span className="company-access-summary">
                  {userLabel}
                  {row.pendingCount ? ` · ${row.pendingCount} nye` : ""}
                  {row.internalCompany ? " · internt firma" : row.hasProCatalog ? " · proff aktiv" : ""}
                </span>
              </button>

              {open ? (
                <div className="company-access-body">
                  {row.companyId && !row.internalCompany ? (
                    <ProStoreCatalogAdminPanel companyId={row.companyId} />
                  ) : row.internalCompany ? (
                    <div className="company-access-note">
                      <strong>Internt firma</strong>
                      <span>ERP-vareregisteret administreres i «Internt vareregister». Brukere og tilganger styres her.</span>
                    </div>
                  ) : (
                    <div className="company-access-note is-warning">
                      <strong>Firmascope mangler</strong>
                      <span>Firmaet må ha gyldig firmascope før proffleverandører kan administreres.</span>
                    </div>
                  )}

                  <div className="company-access-user-heading">
                    <strong>Brukere i firmaet</strong>
                    <small>{userLabel}. Status, rolle, moduler og prisinnsyn redigeres på brukerkortene rett nedenfor.</small>
                  </div>
                </div>
              ) : null}
            </section>
          );
        })}
        {!filteredRows.length ? <small>Ingen firmaer eller brukere matcher søket.</small> : null}
      </div>

      <style>{`
        .company-access-navigator{display:grid;gap:12px;margin:16px 0;padding:14px;border:1px solid #cfe0e4;border-radius:14px;background:#fbfefe}
        .company-access-intro{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.company-access-intro div{display:grid;gap:3px}.company-access-intro small,.company-access-summary,.company-access-user-heading small{color:#60737b}.company-access-intro>span{font-size:12px;font-weight:800;color:#087f88;white-space:nowrap}
        .company-access-search{width:100%;min-height:42px;border:1px solid #ccdadd;border-radius:10px;padding:0 11px;background:#fff;font:inherit}
        .company-access-list{display:grid;gap:8px}.company-access-row{border:1px solid #d7e2e5;border-radius:11px;background:#fff;overflow:hidden}.company-access-row.is-open{border-color:#8bcbd2;box-shadow:0 1px 0 rgba(8,127,136,.08)}
        .company-access-toggle{width:100%;display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:9px;align-items:center;text-align:left;padding:12px 13px;border:0;border-radius:0;background:#fff;color:#10212b}.company-access-row.is-open .company-access-toggle{background:#f3fbfc}.company-access-chevron{font-size:12px}.company-access-name{font-weight:800;min-width:0}.company-access-summary{font-size:12px;text-align:right}
        .company-access-body{display:grid;gap:14px;padding:14px;border-top:1px solid #d7e2e5}.company-access-body .pro-catalog-admin{margin:0}.company-access-note,.company-access-user-heading{display:grid;gap:4px;padding:10px 11px;border:1px solid #d7e2e5;border-radius:10px;background:#f8fafc}.company-access-note span{font-size:13px;color:#60737b}.company-access-note.is-warning{border-color:#e9d2a8;background:#fffaf0}.company-access-error{color:#a33232;font-weight:800}
        @media(max-width:700px){.company-access-toggle{grid-template-columns:auto minmax(0,1fr)}.company-access-summary{grid-column:2;text-align:left}.company-access-intro{flex-direction:column}.company-access-body{padding:11px}}
      `}</style>
    </div>
  );
}

let snapshot = null;
let loadPromise = null;
let activeCompanyKey = "";
let root = null;
let rootMount = null;
let frame = 0;

function userCompanyLookup() {
  const byEmail = new Map();
  (snapshot?.users || []).forEach((user) => {
    const email = compactText(user.email).toLocaleLowerCase("nb-NO");
    if (!email) return;
    byEmail.set(email, companyKey(user.company_scope_id, user.company_name));
  });
  return byEmail;
}

function applyCompanyVisibility(panel = findLegacyPanel()) {
  if (!panel || !snapshot?.is_systemadmin) return;
  const byEmail = userCompanyLookup();
  Array.from(panel.querySelectorAll(":scope > .item, :scope .item")).forEach((card) => {
    const directBold = Array.from(card.children).find((child) => child.tagName === "B");
    const email = compactText(directBold?.textContent).toLocaleLowerCase("nb-NO");
    const key = byEmail.get(email);
    if (!key) return;
    card.dataset.companyAdminUserCard = key;
    if (activeCompanyKey && key === activeCompanyKey) card.style.removeProperty("display");
    else card.style.display = "none";
  });
}

function mountNavigator(panel) {
  if (!panel || !snapshot?.is_systemadmin) return;
  preparePanel(panel);

  let mount = panel.querySelector(`#${MOUNT_ID}`);
  if (!mount) {
    mount = document.createElement("div");
    mount.id = MOUNT_ID;
    const heading = findDirectPanelHeading(panel);
    const intro = heading?.nextElementSibling;
    if (intro instanceof HTMLElement && intro.matches("p.note")) intro.insertAdjacentElement("afterend", mount);
    else heading?.insertAdjacentElement("afterend", mount);
  }

  if (!root || rootMount !== mount) {
    root?.unmount?.();
    rootMount = mount;
    root = createRoot(mount);
  }

  root.render(
    <CompanyNavigator
      snapshot={snapshot}
      activeKey={activeCompanyKey}
      onActiveChange={(nextKey) => {
        if (nextKey === activeCompanyKey) return;
        activeCompanyKey = nextKey;
        mountNavigator(findLegacyPanel());
        applyCompanyVisibility();
      }}
    />
  );
  applyCompanyVisibility(panel);
}

function cleanupDetachedRoot() {
  if (rootMount?.isConnected) return;
  root?.unmount?.();
  root = null;
  rootMount = null;
}

function render() {
  cleanupDetachedRoot();
  if (!snapshot?.is_systemadmin) return;
  const panel = findLegacyPanel();
  if (!panel) return;
  mountNavigator(panel);
}

function scheduleRender() {
  if (frame) return;
  frame = window.requestAnimationFrame(() => {
    frame = 0;
    render();
  });
}

async function loadSnapshot() {
  if (loadPromise) return loadPromise;
  loadPromise = listManagedModuleAccess()
    .then((data) => {
      snapshot = data;
      render();
      return data;
    })
    .catch(() => {
      snapshot = null;
      return null;
    })
    .finally(() => { loadPromise = null; });
  return loadPromise;
}

export function installSystemAdminCompanyAccessUx() {
  if (typeof window === "undefined" || window.__expoSystemAdminCompanyAccessInstalled) return;
  window.__expoSystemAdminCompanyAccessInstalled = true;

  const observer = new MutationObserver(scheduleRender);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  const scheduleReload = () => window.setTimeout(() => loadSnapshot(), 500);
  document.addEventListener("change", (event) => {
    if (event.target instanceof Element && event.target.closest(".adminAccordionItem")) scheduleReload();
  }, true);
  document.addEventListener("click", (event) => {
    const button = event.target instanceof Element ? event.target.closest("button") : null;
    if (!button) return;
    const text = compactText(button.textContent);
    if (
      text.includes("Brukere og roller") || text.includes("Brukere og tilganger") || text.includes(PANEL_TITLE) ||
      text === "Oppdater brukerliste" || text === "Godkjenn bruker" || text === "Avvis og slett bruker" ||
      text === "Deaktiver bruker" || text === "Reaktiver bruker" || text === "Gjør til systemadmin" ||
      text === "Fjern systemadmin" || text === "Legg til" || text === "Fjern" || text.includes("standardforslag")
    ) scheduleReload();
  }, true);
  window.addEventListener("focus", loadSnapshot);
  loadSnapshot();
}
