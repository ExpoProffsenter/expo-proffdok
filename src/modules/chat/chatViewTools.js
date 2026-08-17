// FASE 27G KOMMUNIKASJON: Mekanisk uttrekk av intern prosjektchat og Interne notater fra main.jsx.
// Chatlagring, live refresh, e-postvarsling, Storage, prosjektpersistens og Supabase-logikk forblir i main/eksisterende tjenester.
import React from 'react';
import { FileText } from 'lucide-react';
import { jsx, jsxs } from 'react/jsx-runtime';

const import_react = { default: React };
const import_lucide_react = { FileText };
const import_jsx_runtime = { jsx, jsxs };

export function createCommunicationViewTools({
  Section,
  Textarea,
  hasValue
}) {
  function renderProjectChatPanel({
    unreadForAdmin,
    totalChatCount,
    customerChatCount,
    project,
    projectLog,
    setProjectLog,
    chatUploadFile,
    setChatUploadFile,
    addProjectLogMessage,
    refreshProjectFromCloud,
    markChatAsRead,
    lastReadByAdmin,
    lastReadByCustomer,
    removeProjectLogMessage
  }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
      title: unreadForAdmin > 0 ? `Chat (${unreadForAdmin} ulest)` : totalChatCount > 0 ? `Chat (${totalChatCount} meldinger)` : "Chat",
      icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.FileText, {}),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
          className: "note",
          children: "Chatten oppdateres automatisk live. Nye kundemeldinger står som ulest til du svarer, klikker på meldingen eller trykker Marker alle som lest. Skrivefeltet beholdes ved refresh."
        }),
        totalChatCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
          className: "note",
          style: { fontWeight: 700 },
          children: [
            "💬 Det finnes ",
            totalChatCount,
            " melding",
            totalChatCount === 1 ? "" : "er",
            " totalt i chatten",
            customerChatCount > 0 ? `, hvorav ${customerChatCount} fra kunde` : "",
            unreadForAdmin > 0 ? ` · ${unreadForAdmin} ulest fra kunde` : " · alt er lest",
            "."
          ]
        }),
        !hasValue(project.customerEmail) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
          className: "note",
          style: { fontWeight: 700 },
          children: "⚠️ Legg inn kunde e-post i Prosjektinformasjon for at kunde skal få e-postvarsling ved nye chatmeldinger."
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
          className: "check",
          style: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
              type: "checkbox",
              style: { width: "auto", minHeight: "auto", padding: 0, margin: 0, flex: "0 0 auto" },
              checked: !!projectLog.enabled,
              onChange: (e) => setProjectLog((prev) => ({ ...prev, enabled: e.target.checked }))
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
              style: { margin: 0 },
              children: "Ta med chat i rapport"
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
          label: "Ny melding",
          value: projectLog.draft || "",
          onChange: (v) => setProjectLog((prev) => ({ ...prev, draft: v }))
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
          style: { display: "flex", gap: "12px", marginTop: "12px", flexWrap: "wrap" },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
              className: "upload",
              style: { marginBottom: 0 },
              children: [
                "📷 Last opp bilde",
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
                  id: "admin-chat-image-input",
                  type: "file",
                  accept: "image/*",
                  onChange: (e) => setChatUploadFile(e.target.files?.[0] || null)
                }),
                chatUploadFile && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", {
                  style: { display: "block", marginTop: "6px" },
                  children: [
                    "Valgt: ",
                    chatUploadFile.name
                  ]
                })
              ]
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
              type: "button",
              onClick: addProjectLogMessage,
              children: "Send melding"
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
              type: "button",
              className: "secondary",
              onClick: () => refreshProjectFromCloud(false),
              children: "Oppdater chat"
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
              type: "button",
              className: "secondary",
              disabled: unreadForAdmin === 0,
              onClick: () => markChatAsRead("admin"),
              children: "Marker alle som lest"
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
              type: "button",
              className: "secondary",
              onClick: () => setProjectLog((prev) => ({ ...prev, draft: "" })),
              children: "Tøm skrivefelt"
            })
          ]
        }),
        (projectLog.messages || []).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
          className: "note",
          style: { marginTop: "16px" },
          children: "Ingen meldinger ennå."
        }),
        (projectLog.messages || []).slice().reverse().map((m) => {
          const isUnread = m.role === "kunde" && (!lastReadByAdmin || (m.created || "") > lastReadByAdmin);
          return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
            className: "item",
            onClick: () => isUnread && markChatAsRead("admin"),
            style: isUnread ? { borderColor: "#fecaca", background: "#fff7f7", cursor: "pointer" } : void 0,
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", {
                children: [
                  m.by || "Ukjent",
                  " ",
                  m.role === "kunde" ? "· Kunde" : "· Utførende"
                ]
              }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", {
                children: [
                  m.created ? new Date(m.created).toLocaleString("no-NO") : "",
                  m.role === "kunde"
                    ? isUnread ? " · Ulest for admin" : " · Lest av admin"
                    : !lastReadByCustomer || (m.created || "") > lastReadByCustomer
                      ? " · Ulest for kunde"
                      : " · Lest av kunde"
                ]
              }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: m.text }),
              m.imageUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                style: { marginTop: "10px" },
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
                    href: m.imageUrl,
                    target: "_blank",
                    rel: "noreferrer",
                    children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
                      src: m.imageUrl,
                      alt: m.imageName || "Chat bilde",
                      style: { maxWidth: "280px", width: "100%", borderRadius: "12px", border: "1px solid #dbe7ec" }
                    })
                  }),
                  m.imageName && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
                    style: { display: "block", marginTop: "6px" },
                    children: m.imageName
                  })
                ]
              }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
                type: "button",
                className: "secondary",
                onClick: (e) => {
                  e.stopPropagation();
                  removeProjectLogMessage(m.id);
                },
                children: "Fjern melding"
              })
            ]
          }, m.id);
        })
      ]
    });
  }

  function renderInternalNotesPanel({
    internalNotes,
    setInternalNotes,
    saveProject
  }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
      title: "Interne notater",
      icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.FileText, {}),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
          className: "note",
          children: "Dette feltet er kun internt. Det vises ikke i kundelink og tas ikke med i rapport."
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
          label: "Interne notater",
          value: internalNotes || "",
          onChange: setInternalNotes
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
          style: { display: "flex", gap: "12px", marginTop: "12px", flexWrap: "wrap" },
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
            type: "button",
            onClick: saveProject,
            children: "Lagre interne notater"
          })
        })
      ]
    });
  }

  return {
    renderProjectChatPanel,
    renderInternalNotesPanel
  };
}
