import { ClipboardCheck } from 'lucide-react';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';

const import_lucide_react = { ClipboardCheck };
const import_jsx_runtime = { jsx, jsxs, Fragment };

export function createProjectOverviewTools({
  Section,
  Grid,
  InfoCard,
  CollapsibleBlock,
  Textarea,
  hasValue
}) {
  function ProjectInformationReadOnly({ project }) {
    const fields = [
      ["Prosjektnavn", project?.projectName],
      ["Adresse", [project?.address, project?.postnr, project?.city].filter(Boolean).join(" ")],
      ["Prosjektansvarlig", project?.responsible],
      ["Kunde", project?.customer],
      ["Kunde e-post", project?.customerEmail],
      ["Kunde telefon", project?.customerPhone],
      ["Dato", project?.date]
    ].filter(([, value]) => hasValue(value));
    const hasDescription = hasValue(project?.projectDescription);
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Prosjektinformasjon/beskrivelse", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.ClipboardCheck, {}), children: [
      fields.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid, { children: fields.map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label, value }, label)) }),
      hasDescription ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", style: { marginTop: "14px" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Beskrivelse / nødvendig prosjektinformasjon" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: { whiteSpace: "pre-wrap" }, children: project.projectDescription })
      ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Prosjektleder har ikke lagt inn egen prosjektbeskrivelse ennå." })
    ] });
  }

  function renderProjectOverviewPanel({ project, goToTab, leaveProjectWorkspace }) {
    const salesOriginRef = String(project?.salesOrigin?.requestRef || "").trim();
    const salesPublicToken = String(project?.salesOrigin?.publicToken || "").trim();
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Prosjektoversikt", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.ClipboardCheck, {}), children: [
      salesOriginRef ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { "data-expo-sales-origin-ref": salesOriginRef, "data-expo-sales-public-token": salesPublicToken, style: { display: "none" }, "aria-hidden": "true" }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Her finner du kunde, kontaktinformasjon, adresse og prosjektansvarlig samlet. Feltene kan redigeres i seksjonen under." }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "guideGrid", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "guideCard", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: project.projectName || "Uten prosjektnavn" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Prosjekt" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "guideCard", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: project.customer || "Ikke registrert" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Kunde" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "guideCard", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: project.customerPhone || "Ikke registrert" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Telefon" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "guideCard", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: project.customerEmail || "Ikke registrert" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "E-post" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "guideCard", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: [project.address, project.postnr, project.city].filter(Boolean).join(" ") || "Ikke registrert" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Adresse" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "guideCard", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: project.responsible || "Ikke registrert" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Prosjektansvarlig" })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "14px" }, children: [
        salesOriginRef ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => goToTab("sales"), children: "Åpne salgsgrunnlag" }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => goToTab("chat"), children: "Åpne chat" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: leaveProjectWorkspace, children: "← Til startside" })
      ] })
    ] });
  }

  function renderProjectDescriptionPanel({
    project,
    setProject,
    projectDescriptionTemplates,
    appendProjectDescriptionTemplate
  }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { className: "projectInfoSection", title: "Prosjektbeskrivelse", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.ClipboardCheck, {}), children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Her kan prosjektleder legge inn praktisk prosjektbeskrivelse og informasjon som kunde og underentreprenører skal kunne lese i sine prosjektlenker." }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollapsibleBlock, { title: "Standardtekster", defaultOpen: !hasValue(project.projectDescription), children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Trykk på en mal for å legge den inn nederst i prosjektbeskrivelsen. Teksten kan redigeres fritt etterpå." }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "10px" }, children: projectDescriptionTemplates.map((template) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => appendProjectDescriptionTemplate(template.text), children: template.label }, template.label)) })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Beskrivelse / nødvendig prosjektinformasjon", value: project.projectDescription || "", onChange: (v) => setProject({ ...project, projectDescription: v }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollapsibleBlock, { title: "Portal/PDF-innstillinger", defaultOpen: !project.projectInfoIncludeInReport, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", style: { display: "flex", gap: "10px", alignItems: "center", marginTop: "4px" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", checked: !!project.projectInfoIncludeInReport, onChange: (e) => setProject({ ...project, projectInfoIncludeInReport: e.target.checked }), style: { width: "auto" } }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Ta med prosjektinformasjon/beskrivelse i rapport/PDF" })
      ] }) })
    ] });
  }

  return {
    ProjectInformationReadOnly,
    renderProjectOverviewPanel,
    renderProjectDescriptionPanel
  };
}
