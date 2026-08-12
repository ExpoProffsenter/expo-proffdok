import { jsx, jsxs, Fragment } from 'react/jsx-runtime';

const import_jsx_runtime = { jsx, jsxs, Fragment };

export const normalizeSearchText = (value = "") => String(value ?? "")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/æ/g, "ae")
  .replace(/ø/g, "o")
  .replace(/å/g, "a")
  .replace(/Æ/g, "ae")
  .replace(/Ø/g, "o")
  .replace(/Å/g, "a")
  .toLowerCase();

export const compactSearchText = (value = "") => normalizeSearchText(value).replace(/[\s.\-+()_/:;,]/g, "");

export const makeSearchableText = (values = []) => {
  const raw = values.filter((value) => value !== null && value !== void 0 && value !== false).map((value) => {
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
    try { return JSON.stringify(value); } catch { return String(value); }
  }).filter(Boolean).join(" ");
  const normalized = normalizeSearchText(raw);
  const compact = compactSearchText(raw);
  return `${normalized} ${compact}`;
};

export const projectMatchesSearch = (searchable = "", searchTerm = "") => {
  const normalizedTerm = normalizeSearchText(searchTerm).trim();
  if (!normalizedTerm) return true;
  const compactTerm = compactSearchText(searchTerm);
  const terms = normalizedTerm.split(/\s+/).filter(Boolean);
  const compactTerms = terms.map(compactSearchText).filter(Boolean);
  return terms.every((term, index) => searchable.includes(term) || (compactTerms[index] && searchable.includes(compactTerms[index]))) || (!!compactTerm && searchable.includes(compactTerm));
};

export function createProjectListTools({
  Section,
  Grid,
  Input,
  Select,
  getWarrantyYears
}) {
  function renderProjectListPanel({
    projectListStats,
    projectSearch,
    setProjectSearch,
    projectStatusFilter,
    setProjectStatusFilter,
    projectUnreadOnly,
    setProjectUnreadOnly,
    loadProjects,
    authUser,
    projects,
    filteredProjectListRows,
    isSystemAdminUser,
    statusStyle,
    openProjectById,
    deleteProject
  }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Prosjektliste", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Her får du rask oversikt over aktive prosjekter, uleste kundemeldinger, bildedokumentasjon og snarveier til de vanligste arbeidsflatene." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cards projectListHeaderCards", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: projectListStats.total }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Totalt" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: projectListStats.active }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Aktive" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: projectListStats.unread }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Ulest chat" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: projectListStats.finished }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Arkiv" })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item projectListSearchPanel", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Søk etter prosjekt, kunde, adresse, e-post, telefon, garantinr., ansvarlig eller produkt", value: projectSearch, onChange: setProjectSearch }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Statusfilter", value: projectStatusFilter, onChange: setProjectStatusFilter, options: ["alle", "draft", "progress", "waiting", "customer_ready", "deviation", "done", "locked"], optionLabels: { alle: "Alle", draft: "Utkast", progress: "Pågår", waiting: "Avventer", customer_ready: "Klar for kunde", deviation: "Avvik åpent", done: "Ferdigstilt", locked: "Arkivert / låst" } })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "projectListToolbar", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: () => loadProjects(authUser, true), children: "Oppdater" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: projectUnreadOnly ? "" : "secondary", onClick: () => setProjectUnreadOnly((v) => !v), children: projectUnreadOnly ? "Vis alle" : "Kun uleste" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: projectStatusFilter === "alle" ? "secondary" : "", onClick: () => setProjectStatusFilter("alle"), children: "Alle" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: projectStatusFilter === "progress" || projectStatusFilter === "open" ? "" : "secondary", onClick: () => setProjectStatusFilter(projectStatusFilter === "progress" || projectStatusFilter === "open" ? "alle" : "progress"), children: "Aktive" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: projectStatusFilter === "done" || projectStatusFilter === "locked" ? "" : "secondary", onClick: () => setProjectStatusFilter(projectStatusFilter === "done" || projectStatusFilter === "locked" ? "alle" : "done"), children: "Arkiv" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => {
                setProjectSearch("");
                setProjectStatusFilter("alle");
                setProjectUnreadOnly(false);
              }, children: "Nullstill" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
              "Viser ",
              projectListStats.visible,
              " av ",
              projectListStats.total,
              " prosjekter. Status: Åpen, Pågår, Ferdigstilt eller Avsluttet/låst."
            ] })
          ] }),
          projects.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "16px" }, children: "Ingen prosjekter hentet ennå. Trykk Oppdater." }),
          projects.length > 0 && filteredProjectListRows.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "16px" }, children: "Ingen prosjekter matcher søket eller filteret." }),
          filteredProjectListRows.map(({ row: p, listProject, listStatus, unreadForAdminInList, latestMessage, imageSummary, openDeviationCount, productSummary, listWarranty, projectCompanyName, projectOwnerEmail }) => {
            const locationLine = [listProject.address, listProject.postnr, listProject.city].filter(Boolean).join(", ");
            const updatedLabel = p.updated_at || p.created_at ? new Date(p.updated_at || p.created_at).toLocaleString("no-NO") : "Ukjent";
            const latestChatLabel = latestMessage?.created ? new Date(latestMessage.created).toLocaleString("no-NO") : "Ingen meldinger";
            return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item projectListCard", style: unreadForAdminInList > 0 ? { borderColor: "#fecaca", background: "#fff7f7" } : void 0, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "projectListCardTop", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "projectListTitleBlock", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { style: { fontSize: "19px" }, children: p.title || listProject.projectName || "Uten navn" }),
                  listProject.customer && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { style: { margin: "6px 0 0" }, children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Kunde:" }),
                    " ",
                    listProject.customer
                  ] }),
                  projectCompanyName && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: ["🏢 ", projectCompanyName] }),
                  listProject.customerEmail && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: ["✉ ", listProject.customerEmail] }),
                  listProject.customerPhone && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: ["☎ ", listProject.customerPhone] }),
                  locationLine && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: ["📍 ", locationLine] }),
                  isSystemAdminUser && projectOwnerEmail && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: ["👤 Prosjekteier: ", projectOwnerEmail] })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "projectListBadges", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: `statusBadge status-${listStatus.tone}`, style: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 10px", borderRadius: "999px", fontWeight: 700, border: "1px solid #dbe7ec", width: "fit-content", ...statusStyle(listStatus.tone) }, children: [
                    listStatus.icon,
                    " ",
                    listStatus.label
                  ] }),
                  listWarranty?.enabled && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "projectMiniBadge", style: { borderColor: listWarranty?.issued ? "#86efac" : "#fde68a", background: listWarranty?.issued ? "#ecfdf5" : "#fffbeb", color: listWarranty?.issued ? "#065f46" : "#92400e", fontWeight: 800 }, children: [
                    listWarranty?.issued ? `🛡️ Garanti ${getWarrantyYears(listWarranty)} år` : "🛡️ Garanti aktiv",
                    listWarranty?.guaranteeNumber ? ` · ${listWarranty.guaranteeNumber}` : ""
                  ] }),
                  unreadForAdminInList > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", onClick: () => openProjectById(p.id, "chat"), style: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 10px", borderRadius: "999px", fontWeight: 800, border: "1px solid #fecaca", background: "#fef2f2", color: "#991b1b", width: "fit-content", minHeight: "auto", boxShadow: "none" }, children: [
                    "💬 ",
                    unreadForAdminInList,
                    " ulest"
                  ] }),
                  openDeviationCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", onClick: () => openProjectById(p.id, "sjekklister", { showOpenDeviationsOnly: true }), style: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 10px", borderRadius: "999px", fontWeight: 800, border: "1px solid #fecaca", background: "#fef2f2", color: "#991b1b", width: "fit-content", minHeight: "auto", boxShadow: "none" }, children: [
                    "⚠️ ",
                    openDeviationCount,
                    " åpne avvik"
                  ] }),
                  productSummary.total > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "projectMiniBadge", children: [
                    "📦 ",
                    productSummary.total,
                    " produkter"
                  ] }),
                  imageSummary.total > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "projectMiniBadge", children: [
                    "📷 ",
                    imageSummary.total,
                    " bilder"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "projectImageCounts", style: { marginTop: "12px" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "projectMiniBadge", onClick: () => openProjectById(p.id, "produkter"), style: { cursor: "pointer", minHeight: "auto", boxShadow: "none" }, children: ["📦 Produkter: ", productSummary.total] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "projectMiniBadge", onClick: () => openProjectById(p.id, "sjekklister", { showOpenDeviationsOnly: openDeviationCount > 0 }), style: { cursor: "pointer", minHeight: "auto", boxShadow: "none", ...(openDeviationCount > 0 ? { borderColor: "#fecaca", background: "#fef2f2", color: "#991b1b" } : {}) }, children: ["⚠️ Åpne avvik: ", openDeviationCount] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "projectMiniBadge", onClick: () => openProjectById(p.id, "bilder"), style: { cursor: "pointer", minHeight: "auto", boxShadow: "none" }, children: ["📷 Bilder: ", imageSummary.total] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "projectMiniBadge", onClick: () => openProjectById(p.id, "chat"), style: { cursor: "pointer", minHeight: "auto", boxShadow: "none", ...(unreadForAdminInList > 0 ? { borderColor: "#fecaca", background: "#fef2f2", color: "#991b1b" } : {}) }, children: ["💬 Ulest chat: ", unreadForAdminInList] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cards projectListMetaCards", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Oppdatert" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: updatedLabel })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Siste chat" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: latestChatLabel })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Ansvarlig" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: listProject.responsible || "Ikke fylt ut" })
                ] })
              ] }),
              imageSummary.total > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "projectImageCounts", children: [
                  imageSummary.photos > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "projectMiniBadge", children: ["📁 Bilder: ", imageSummary.photos] }),
                  imageSummary.checklist > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "projectMiniBadge", children: ["✅ Sjekkliste: ", imageSummary.checklist] }),
                  imageSummary.install > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "projectMiniBadge", children: ["🧰 Fag/utstyr: ", imageSummary.install] }),
                  imageSummary.chat > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "projectMiniBadge", children: ["💬 Chat: ", imageSummary.chat] })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "projectImageStrip", "aria-label": "Bildeoversikt for prosjekt", children: [
                  imageSummary.previews.map((img, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "projectImageThumb", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: img.url, alt: img.label || img.source || "Prosjektbilde" }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: img.source })
                  ] }, `${p.id}-img-${index}`)),
                  imageSummary.total > imageSummary.previews.length && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "projectImageThumb", style: { display: "flex", alignItems: "center", justifyContent: "center", height: "58px", border: "1px dashed #c7d6dd", borderRadius: "12px", background: "#f8fafc", fontWeight: 800 }, children: [
                    "+",
                    imageSummary.total - imageSummary.previews.length
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "projectListActions projectListActionsV2", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: () => openProjectById(p.id, "prosjekt"), children: "📂 Åpne" }),
                openDeviationCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { onClick: () => openProjectById(p.id, "sjekklister", { showOpenDeviationsOnly: true }), children: ["⚠️ Avvik (", openDeviationCount, ")"] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => openProjectById(p.id, "produkter"), children: "📦 Produkter" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => openProjectById(p.id, "bilder"), children: "📷 Bilder" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => openProjectById(p.id, "sjekklister"), children: "✅ Sjekklister" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => openProjectById(p.id, "rapport"), children: "📄 Rapport" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: unreadForAdminInList > 0 ? "" : "secondary", onClick: () => openProjectById(p.id, "chat"), children: unreadForAdminInList > 0 ? `💬 Chat (${unreadForAdminInList})` : "💬 Chat" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => deleteProject(p.id), children: "🗑️ Slett" })
              ] })
            ] }, p.id);
          })
        ] });
  }

  return { renderProjectListPanel };
}
