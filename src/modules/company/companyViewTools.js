import CompanyBrandPreview from './CompanyBrandPreview.jsx';
// FASE 27E FIRMA: Mekanisk uttrekk av eksisterende Firmaprofil- og Firmaadministrasjon-visninger fra main.jsx.
// FASE 41B.3E: Tydeliggjør forskjellen mellom brukerens primære firmaprofil og systemadmins Representerer-scope.
import React, * as ReactNS from 'react';
import CompanyNameEditor from './CompanyNameEditor.jsx';
import CompanyAdminPanel from './CompanyAdminPanel.jsx';
import { Building2, Plus } from 'lucide-react';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';

const import_react = { default: React, ...ReactNS };
const import_lucide_react = { Building2, Plus };
const import_jsx_runtime = { jsx, jsxs, Fragment };

function getSystemAdminRepresentationContext(companyName = '') {
  if (typeof window === 'undefined') return null;
  const state = window.__expoProffDokWorkProfile || null;
  if (!state?.is_systemadmin) return null;

  const activeId = String(state.active_company_id || '');
  const primaryId = String(state.primary_company_id || '');
  if (!activeId || !primaryId || activeId === primaryId) return null;

  const workspaces = Array.isArray(state.workspaces) ? state.workspaces : [];
  const active = workspaces.find((workspace) => String(workspace?.company_id || '') === activeId);
  if (!active?.company_name) return null;

  return {
    activeCompanyName: String(active.company_name || '').trim(),
    primaryCompanyName: String(companyName || '').trim()
      || String(workspaces.find((workspace) => String(workspace?.company_id || '') === primaryId)?.company_name || '').trim()
      || 'ditt primærfirma'
  };
}

export function createCompanyViewTools({
  Section,
  CollapsibleBlock,
  Brand,
  Grid,
  Input,
  hasValue
}) {
  function renderCompanyProfilePanel({
    company,
    setCompany,
    name,
    uploadLogo,
    saveProfile,
    canEdit = false,
    onCompanyNameSaved,
    loginEmail = ""
  }) {
    const representation = getSystemAdminRepresentationContext(company?.companyName);
    const profileNote = representation
      ? `Du representerer nå ${representation.activeCompanyName} for nye tilbud og prosjekter. Her redigerer du fortsatt din primære firmaprofil: ${representation.primaryCompanyName}.`
      : `Firmaprofilen er felles for alle brukere i ${company?.companyName || "firmaet"}.`;
    const missingRequired =
      !hasValue(company.orgNumber) ||
      !hasValue(company.address) ||
      !hasValue(company.phone) ||
      !hasValue(company.email);

    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
      title: "Firmaprofil",
      className: "company-profile-workspace",
      icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Building2, {}),
      children: [
        (0, import_jsx_runtime.jsx)(CompanyBrandPreview,{company}),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
          className: "note",
          children: profileNote
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
          className: "note",
          children: [
            "Firmaets kontakt-e-post brukes i prosjekter, rapporter og kundekommunikasjon. Den endrer ikke e-postadressen du logger inn med",
            loginEmail ? ` (${loginEmail})` : "",
            "."
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollapsibleBlock, {
          title: "Firmainfo og logo",
          defaultOpen: !hasValue(company.companyName) || missingRequired,
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
            className: "two",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                className: "logoBox",
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, {
                    logo: company.logoUrl,
                    name
                  }),
                  canEdit && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
                    className: "upload",
                    children: [
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 18 }),
                      " Last opp firmalogo",
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
                        type: "file",
                        accept: "image/*",
                        onChange: (e) => uploadLogo(e.target.files?.[0])
                      })
                    ]
                  }),
                  canEdit && company.logoUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
                    className: "secondary",
                    onClick: () => setCompany({ ...company, logoUrl: "" }),
                    children: "Fjern logo"
                  })
                ]
              }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, {
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
                    label: "Firmanavn",
                    value: company.companyName,
                    disabled: true,
                    onChange: () => {}
                  }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
                    label: "Foretaksnummer *",
                    value: company.orgNumber,
                    disabled: !canEdit,
                    onChange: (v) => setCompany({ ...company, orgNumber: v })
                  }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
                    label: "Adresse *",
                    value: company.address,
                    disabled: !canEdit,
                    autoComplete: "street-address",
                    onChange: (v) => setCompany({ ...company, address: v })
                  }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
                    label: "Telefon *",
                    value: company.phone,
                    disabled: !canEdit,
                    type: "tel",
                    autoComplete: "tel",
                    onChange: (v) => setCompany({ ...company, phone: v })
                  }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
                    label: "Firma-e-post *",
                    value: company.email,
                    disabled: !canEdit,
                    type: "email",
                    autoComplete: "email",
                    onChange: (v) => setCompany({ ...company, email: v })
                  }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
                    label: "Hjemmeside",
                    value: company.website,
                    disabled: !canEdit,
                    autoComplete: "url",
                    onChange: (v) => setCompany({ ...company, website: v })
                  })
                ]
              })
            ]
          })
        }),
        canEdit && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CompanyNameEditor, {onSaved:onCompanyNameSaved}),
        canEdit ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
            className: "note",
            children: "* Foretaksnummer, adresse, telefon og firma-e-post må fylles ut før firmaprofilen kan lagres."
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
            onClick: saveProfile,
            children: "Lagre firmaprofil"
          })
        ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
          className: "note",
          children: "Firmaprofilen kan endres av Firmaadmin."
        })
      ]
    });
  }
  function renderCompanyAdminPanel({authUser}) {
    return jsx(Section, {
      title: "Firma",
      icon: jsx(Building2, {}),
      children: jsx(CompanyAdminPanel, {authUser})
    });
  }

  return {
    renderCompanyProfilePanel,
    renderCompanyAdminPanel
  };
}
