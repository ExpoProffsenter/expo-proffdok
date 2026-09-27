import { ClipboardCheck } from 'lucide-react';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { installSimpleOrderWorkspaceUx } from './simpleOrderWorkspaceUx.js';

const import_lucide_react = { ClipboardCheck };
const import_jsx_runtime = { jsx, jsxs, Fragment };

// Ligger her fordi projectOverviewTools lastes sammen med den interne prosjektmotoren.
// Adapteren er passiv for ordinære prosjekter og aktiveres kun ved workflowType=simple_order.
installSimpleOrderWorkspaceUx();

const isSimpleOrderProject = (project = {}) =>
  String(project?.workflowType || '').trim().toLowerCase() === 'simple_order' || project?.simpleOrder === true;

const formatAcceptedTotal = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return '';
  return new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency: 'NOK',
    maximumFractionDigits: 0,
  }).format(number);
};

export function createProjectOverviewTools({
  Section,
  Grid,
  InfoCard,
  CollapsibleBlock,
  Textarea,
  hasValue
}) {
  function ProjectInformationReadOnly({ project }) {
    const simpleOrder = isSimpleOrderProject(project);
    const fields = [
      [simpleOrder ? "Ordrenavn" : "Prosjektnavn", project?.projectName],
      ["Adresse", [project?.address, project?.postnr, project?.city].filter(Boolean).join(" ")],
      [simpleOrder ? "Ordreansvarlig" : "Prosjektansvarlig", project?.responsible],
      ["Kunde", project?.customer],
      ["Kunde e-post", project?.customerEmail],
      ["Kunde telefon", project?.customerPhone],
      ["Dato", project?.date]
    ].filter(([, value]) => hasValue(value));
    const hasDescription = hasValue(project?.projectDescription);
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: simpleOrder ? "Ordreinformasjon/beskrivelse" : "Prosjektinformasjon/beskrivelse", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.ClipboardCheck, {}), children: [
      fields.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid, { children: fields.map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label, value }, label)) }),
      hasDescription ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", style: { marginTop: "14px" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: simpleOrder ? "Beskrivelse / nødvendig ordreinformasjon" : "Beskrivelse / nødvendig prosjektinformasjon" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: { whiteSpace: "pre-wrap" }, children: project.projectDescription })
      ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: simpleOrder ? "Det er ikke lagt inn egen ordrebeskrivelse ennå." : "Prosjektleder har ikke lagt inn egen prosjektbeskrivelse ennå." })
    ] });
  }

  function renderProjectOverviewPanel({ project, goToTab, leaveProjectWorkspace }) {
    const simpleOrder = isSimpleOrderProject(project);
    const salesOriginRef = String(project?.salesOrigin?.requestRef || "").trim();
    const salesPublicToken = String(project?.salesOrigin?.publicToken || "").trim();
    const acceptedTotal = formatAcceptedTotal(project?.salesOrigin?.acceptedTotal);
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: simpleOrder ? "Ordreoversikt" : "Prosjektoversikt", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.ClipboardCheck, {}), children: [
      simpleOrder ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { "data-expo-workflow-type": "simple_order", style: { display: "none" }, "aria-hidden": "true" }) : null,
      salesOriginRef ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { "data-expo-sales-origin-ref": salesOriginRef, "data-expo-sales-public-token": salesPublicToken, style: { display: "none" }, "aria-hidden": "true" }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: simpleOrder ? "Enkel ordre bruker samme dokumentasjonsmotor som ProffDok, men uten kundelenke. Bruk bare de verktøyene som er relevante for oppdraget." : "Her finner du kunde, kontaktinformasjon, adresse og prosjektansvarlig samlet. Feltene kan redigeres i seksjonen under." }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "guideGrid", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "guideCard", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: project.projectName || (simpleOrder ? "Uten ordrenavn" : "Uten prosjektnavn") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: simpleOrder ? "Enkel ordre" : "Prosjekt" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "guideCard", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: project.customer || "Ikke registrert" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Kunde" })
        ] }),
        acceptedTotal ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "guideCard", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: acceptedTotal }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Akseptert tilbudssum inkl. mva." })
        ] }) : null,
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
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: simpleOrder ? "Ordreansvarlig" : "Prosjektansvarlig" })
        ] })
      ] }),
      simpleOrder ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", style: { marginTop: "14px", background: "#f6fbfc", borderColor: "#cde5e8" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Arbeidsverktøy for denne ordren" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Fremdrift, FDV, bilder, sjekklister og UE brukes bare når oppdraget trenger det. Sluttdokumentasjon samler det som faktisk er registrert." }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "10px" }, children: [
          ["fremdrift", "Fremdrift"],
          ["produkter", "Produkter / FDV"],
          ["bilder", "Bilder"],
          ["sjekklister", "Sjekklister"],
          ["tilgang", "UE-tilgang"],
          ["rapport", "Sluttdokumentasjon"]
        ].map(([tabId, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => goToTab(tabId), children: label }, tabId)) })
      ] }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "14px" }, children: [
        salesOriginRef ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => goToTab("sales"), children: simpleOrder ? "Åpne tilbudsgrunnlag" : "Åpne salgsgrunnlag" }) : null,
        !simpleOrder ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => goToTab("chat"), children: "Åpne chat" }) : null,
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
    const simpleOrder = isSimpleOrderProject(project);
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { className: "projectInfoSection", title: simpleOrder ? "Ordrebeskrivelse" : "Prosjektbeskrivelse", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.ClipboardCheck, {}), children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: simpleOrder ? "Legg inn praktisk informasjon som er relevant for utførelsen av ordren. Enkel ordre har ingen kundelenke." : "Her kan prosjektleder legge inn praktisk prosjektbeskrivelse og informasjon som kunde og underentreprenører skal kunne lese i sine prosjektlenker." }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollapsibleBlock, { title: "Standardtekster", defaultOpen: !hasValue(project.projectDescription), children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: simpleOrder ? "Trykk på en mal for å legge den inn nederst i ordrebeskrivelsen. Teksten kan redigeres fritt etterpå." : "Trykk på en mal for å legge den inn nederst i prosjektbeskrivelsen. Teksten kan redigeres fritt etterpå." }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "10px" }, children: projectDescriptionTemplates.map((template) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => appendProjectDescriptionTemplate(template.text), children: template.label }, template.label)) })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: simpleOrder ? "Beskrivelse / nødvendig ordreinformasjon" : "Beskrivelse / nødvendig prosjektinformasjon", value: project.projectDescription || "", onChange: (v) => setProject({ ...project, projectDescription: v }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollapsibleBlock, { title: simpleOrder ? "Sluttdokumentasjon/PDF" : "Portal/PDF-innstillinger", defaultOpen: !project.projectInfoIncludeInReport, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", style: { display: "flex", gap: "10px", alignItems: "center", marginTop: "4px" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", checked: !!project.projectInfoIncludeInReport, onChange: (e) => setProject({ ...project, projectInfoIncludeInReport: e.target.checked }), style: { width: "auto" } }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: simpleOrder ? "Ta med ordrebeskrivelsen i sluttdokumentasjon/PDF" : "Ta med prosjektinformasjon/beskrivelse i rapport/PDF" })
      ] }) })
    ] });
  }

  return {
    ProjectInformationReadOnly,
    renderProjectOverviewPanel,
    renderProjectDescriptionPanel
  };
}
