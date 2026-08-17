// FASE 27E FIRMA: Mekanisk uttrekk av eksisterende Firmaprofil- og Firmaadministrasjon-visninger fra main.jsx.
// Ingen funksjons-, auth-, database-, RLS-, Storage-, Edge Function-, e-post- eller rolleendring.
import React, * as ReactNS from 'react';
import { Building2, Plus } from 'lucide-react';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';

const import_react = { default: React, ...ReactNS };
const import_lucide_react = { Building2, Plus };
const import_jsx_runtime = { jsx, jsxs, Fragment };

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
    saveProfile
  }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
      title: "Firmaprofil",
      icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Building2, {}),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
          className: "note",
          children: "Firmaprofilen lagres på brukeren din og brukes automatisk i prosjekter og rapporter."
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollapsibleBlock, {
          title: "Firmainfo og logo",
          defaultOpen: !hasValue(company.companyName) || !hasValue(company.email),
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
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
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
                  company.logoUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
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
                    onChange: (v) => setCompany({ ...company, companyName: v })
                  }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
                    label: "Org.nr",
                    value: company.orgNumber,
                    onChange: (v) => setCompany({ ...company, orgNumber: v })
                  }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
                    label: "Adresse",
                    value: company.address,
                    onChange: (v) => setCompany({ ...company, address: v })
                  }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
                    label: "Telefon",
                    value: company.phone,
                    onChange: (v) => setCompany({ ...company, phone: v })
                  }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
                    label: "E-post",
                    value: company.email,
                    onChange: (v) => setCompany({ ...company, email: v })
                  }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
                    label: "Hjemmeside",
                    value: company.website,
                    onChange: (v) => setCompany({ ...company, website: v })
                  })
                ]
              })
            ]
          })
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
          onClick: saveProfile,
          children: "Lagre firmaprofil"
        })
      ]
    });
  }

  function renderCompanyAdminPanel({
    currentCompanyName,
    companyAdminLoading,
    loadCompanyAdminData,
    newEmployeeEmail,
    setNewEmployeeEmail,
    newEmployeeRole,
    setNewEmployeeRole,
    inviteCompanyEmployee,
    companyUsers,
    updateCompanyUserRole,
    authUser,
    setCompanyUserDeactivated,
    companyInvites
  }) {
    const pendingInvites = (companyInvites || []).filter((invite) => (invite?.status || "pending") === "pending");

    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
      title: "Firma",
      icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Building2, {}),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
          className: "item companyAdminQuickStart",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Firmaadministrasjon" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
              className: "note",
              children: [
                "Her kan firmaadmin administrere ansatte i ",
                currentCompanyName || "eget firma",
                ". Firmaadmin kan administrere ansatte og se prosjekter i eget firma, men kan ikke endre Produktmaster eller systeminnstillinger."
              ]
            }),
            !currentCompanyName && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
              className: "note",
              style: { color: "#991b1b" },
              children: "Firmaprofil mangler firmanavn. Gå til Firmaprofil og lagre firmanavn før du legger til ansatte."
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
              type: "button",
              onClick: () => loadCompanyAdminData(true),
              children: companyAdminLoading ? "Henter firmaoversikt..." : "Oppdater firmaoversikt"
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
          className: "item",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Legg til ansatt" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
              className: "note",
              children: "Legg inn e-postadressen til den ansatte. Hvis brukeren ikke finnes ennå, får vedkommende invitasjon og må selv opprette bruker med fullt navn, mobilnummer og eget passord."
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
              className: "grid",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
                  label: "E-post",
                  value: newEmployeeEmail,
                  placeholder: "navn@firma.no",
                  onChange: setNewEmployeeEmail
                }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
                  children: [
                    "Rolle",
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
                      value: newEmployeeRole,
                      onChange: (e) => setNewEmployeeRole(e.target.value),
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "ansatt", children: "Ansatt" }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "firmaadmin", children: "Firmaadmin" })
                      ]
                    })
                  ]
                })
              ]
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
              type: "button",
              onClick: inviteCompanyEmployee,
              children: "Inviter ansatt"
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
          className: "item",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Brukere i firma" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
              className: "note",
              children: "Endring av rolle og status lagres direkte når du bekrefter valget. Det finnes derfor ingen egen lagreknapp her."
            }),
            companyUsers.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
              className: "note",
              children: "Ingen brukere hentet ennå. Trykk Oppdater firmaoversikt."
            }),
            companyUsers.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
              className: "item",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: u.email || "Ukjent e-post" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", {
                  children: [
                    "Rolle: ",
                    u.system_role === "systemadmin" ? "Systemadmin" : u.company_role === "firmaadmin" ? "Firmaadmin" : "Ansatt",
                    " · Status: ",
                    u.deactivated ? "Deaktivert" : u.approved ? "Aktiv" : "Venter"
                  ]
                }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                  style: { display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "10px" },
                  children: [
                    u.system_role !== "systemadmin" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
                      value: u.company_role === "firmaadmin" ? "firmaadmin" : "ansatt",
                      onChange: (e) => updateCompanyUserRole(u, e.target.value),
                      style: { maxWidth: "220px" },
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "ansatt", children: "Ansatt" }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "firmaadmin", children: "Firmaadmin" })
                      ]
                    }),
                    !u.deactivated && u.id !== authUser?.id && u.system_role !== "systemadmin" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
                      type: "button",
                      className: "secondary",
                      onClick: () => setCompanyUserDeactivated(u, true),
                      children: "Deaktiver"
                    }),
                    u.deactivated && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
                      type: "button",
                      onClick: () => setCompanyUserDeactivated(u, false),
                      children: "Reaktiver"
                    })
                  ]
                })
              ]
            }, u.id))
          ]
        }),
        pendingInvites.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
          className: "item",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Inviterte brukere" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
              className: "note",
              children: "Brukere som er invitert, men som ikke har registrert seg eller blitt aktivert i firmaet ennå."
            }),
            pendingInvites.map((invite) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
              className: "item",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: invite.email }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", {
                  children: [
                    "Rolle: ",
                    invite.company_role === "firmaadmin" ? "Firmaadmin" : "Ansatt",
                    " · Status: Venter på registrering"
                  ]
                })
              ]
            }, invite.id || invite.email))
          ]
        })
      ]
    });
  }

  return {
    renderCompanyProfilePanel,
    renderCompanyAdminPanel
  };
}
