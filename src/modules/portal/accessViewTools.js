// FASE 27F TILGANG: Mekanisk uttrekk av intern Tilgang og deling-visning fra main.jsx.
// Portal-/tilgangslogikk, prosjektlagring, Supabase, RLS, Storage og e-postfunksjoner forblir eid av main/eksisterende portalverktøy.
import React from 'react';
import { Plus } from 'lucide-react';
import { jsx, jsxs } from 'react/jsx-runtime';

const import_react = { default: React };
const import_lucide_react = { Plus };
const import_jsx_runtime = { jsx, jsxs };

export function createAccessViewTools({
  Section,
  Textarea,
  Grid,
  Input,
  Select,
  uid
}) {
  function renderAccessPanel({
    project,
    projectId,
    accessEmailMessage,
    setAccessEmailMessage,
    accessRoleInfo,
    access,
    setAccess,
    roles,
    portalAccessRecordIsValid,
    getPortalAccessRecord,
    portalAccessPolicyText,
    ensurePortalAccessForProject,
    copyAccessLink,
    sendAccessEmail
  }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Tilgang og deling", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Administrer tilgang til prosjektet. Kunde får egen kundelink og egen tilgangskode. Underentreprenører får separat link og separat tilgangskode for dokumentasjon innenfor relevante deler av prosjektet. Kodene følger e-postene, ligger ikke i URL-en og gjenbrukes ved senere chatvarsler. Tilgangene er gyldige så lenge prosjektet er aktivt, og i 30 dager etter låsing/arkivering." }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cards", style: { marginTop: "12px" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Kundeportal" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: portalAccessRecordIsValid(getPortalAccessRecord(project, "kunde"), project) ? "🟢 Aktiv kode" : "⚪ Ingen aktiv kode" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: getPortalAccessRecord(project, "kunde")?.code ? "Tilgangskode: ••••••" : "Tilgangskode: Ikke sendt/generert ennå" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: portalAccessPolicyText(project, getPortalAccessRecord(project, "kunde")) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", type: "button", onClick: async () => {
            if (!projectId) {
              alert("Lagre prosjektet før du genererer tilgangskode.");
              return;
            }
            const rec = await ensurePortalAccessForProject({ roleParam: "kunde", forceNew: true });
            if (rec?.code) alert("Ny kundekode er generert. Send kundelenke på nytt for å dele koden.");
          }, children: "Generer ny tilgangskode" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Underentreprenørportal" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: portalAccessRecordIsValid(getPortalAccessRecord(project, "underleverandor"), project) ? "🟢 Aktiv kode" : "⚪ Ingen aktiv kode" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: getPortalAccessRecord(project, "underleverandor")?.code ? "Tilgangskode: ••••••" : "Tilgangskode: Ikke sendt/generert ennå" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: portalAccessPolicyText(project, getPortalAccessRecord(project, "underleverandor")) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", type: "button", onClick: async () => {
            if (!projectId) {
              alert("Lagre prosjektet før du genererer tilgangskode.");
              return;
            }
            const rec = await ensurePortalAccessForProject({ roleParam: "underleverandor", forceNew: true });
            if (rec?.code) alert("Ny underentreprenørkode er generert. Send underentreprenørlenke på nytt for å dele koden.");
          }, children: "Generer ny tilgangskode" })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Melding i e-post med tilgangslink", value: accessEmailMessage, onChange: setAccessEmailMessage }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "cards", children: accessRoleInfo.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: r.role }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: r.text })
      ] }, r.role)) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", marginTop: "16px", flexWrap: "wrap" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { onClick: () => setAccess([...access, { id: uid(), name: "", email: "", role: "Underleverandør" }]), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 18 }),
          " Legg til person/firma"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => copyAccessLink("kunde"), children: "Kopier kundelenke og kode" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => copyAccessLink("Underleverandør"), children: "Kopier UE-lenke og kode" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => sendAccessEmail({ role: "kunde", toEmail: project.customerEmail, recipientName: project.customer }), children: "Send kundelink på e-post" })
      ] }),
      access.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "16px" }, children: "Ingen ekstra tilganger er lagt til ennå." }),
      access.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Navn/firma", value: a.name, onChange: (v) => setAccess(access.map((x) => x.id === a.id ? { ...x, name: v } : x)) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "E-post", value: a.email, onChange: (v) => setAccess(access.map((x) => x.id === a.id ? { ...x, email: v } : x)) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Rolle", value: a.role, options: roles, onChange: (v) => setAccess(access.map((x) => x.id === a.id ? { ...x, role: v } : x)) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: accessRoleInfo.find((r) => r.role === a.role)?.text || "" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", flexWrap: "wrap" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => copyAccessLink(a.role), children: "Kopier lenke og kode" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => sendAccessEmail({ role: a.role, toEmail: a.email, recipientName: a.name }), children: "Send e-post med link" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => setAccess(access.filter((x) => x.id !== a.id)), children: "Fjern" })
        ] })
      ] }, a.id))
    ] });
  }

  return { renderAccessPanel };
}
