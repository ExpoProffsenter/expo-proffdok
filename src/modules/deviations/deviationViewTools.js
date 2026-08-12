import { jsx, jsxs, Fragment } from 'react/jsx-runtime';

const import_jsx_runtime = { jsx, jsxs, Fragment };

export function createDeviationCenter({
  uid,
  checklistPointAnchor,
  Grid,
  Select,
  Input,
  Textarea,
  Plus
}) {
  function DeviationCenter({ project, setProject, checklist = {}, activeChecklistTemplate = [], uploadImages = null, onGoToChecklistPoint = null, onPrepareChatDraft = null }) {
    const projectDeviations = Array.isArray(project?.projectDeviations) ? project.projectDeviations : [];
    const checklistDeviationRows = (activeChecklistTemplate || []).flatMap((group) => (group.items || []).map((item) => {
      const value = checklist?.[group.category]?.[item] || {};
      if (value.status !== "Avvik" && value.status !== "Lukket avvik") return null;
      return {
        id: checklistPointAnchor(group.category, item),
        category: group.category,
        item,
        status: value.status,
        comment: value.comment || "",
        closeComment: value.closeComment || "",
        closedBy: value.closedBy || "",
        closedAt: value.closedAt || "",
        photos: value.photos || [],
        anchorId: checklistPointAnchor(group.category, item)
      };
    }).filter(Boolean));
    const openChecklistDeviations = checklistDeviationRows.filter((row) => row.status === "Avvik").length;
    const openProjectDeviations = projectDeviations.filter((entry) => (entry?.status || "Åpent") !== "Lukket").length;
    const updateProjectDeviation = (id, patch = {}) => {
      setProject({
        ...project,
        projectDeviations: projectDeviations.map((entry) => entry.id === id ? { ...entry, ...patch } : entry)
      });
    };
    const addProjectDeviation = () => {
      const next = {
        id: uid(),
        type: "HMS",
        severity: "Middels",
        status: "Åpent",
        title: "",
        description: "",
        action: "",
        responsible: "",
        dueDate: "",
        affectsWarranty: false,
        includeInReport: false,
        photos: [],
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        closedAt: "",
        closedBy: "",
        closeComment: ""
      };
      setProject({ ...project, projectDeviations: [next, ...projectDeviations] });
    };
    const removeProjectDeviation = (id) => {
      if (!window.confirm("Fjerne dette avviket?")) return;
      setProject({ ...project, projectDeviations: projectDeviations.filter((entry) => entry.id !== id) });
    };
    const closeProjectDeviation = (entry) => {
      const closeComment = window.prompt("Kommentar til lukking av avvik:", entry.closeComment || "Tiltak utført og kontrollert.");
      if (closeComment === null) return;
      updateProjectDeviation(entry.id, {
        status: "Lukket",
        closedAt: (/* @__PURE__ */ new Date()).toISOString(),
        closedBy: project?.responsible || "Utførende",
        closeComment: closeComment.trim()
      });
    };
    const reopenProjectDeviation = (entry) => {
      if (!window.confirm("Vil du åpne avviket igjen?")) return;
      updateProjectDeviation(entry.id, { status: "Åpent", closedAt: "", closedBy: "", closeComment: "" });
    };
    const addProjectDeviationPhotos = async (entry, fileList) => {
      if (!uploadImages) return;
      const uploaded = await uploadImages(fileList, "avvik");
      if (!uploaded.length) return;
      updateProjectDeviation(entry.id, { photos: [...entry.photos || [], ...uploaded] });
    };
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "checklistSummaryCard activeDeviationFocus", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Avvikssentral" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
            openChecklistDeviations,
            " åpne sjekkpunktavvik · ",
            openProjectDeviations,
            " åpne HMS/prosjektavvik"
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Bruk sjekkpunktavvik for konkrete kontrollpunkter, HMS-avvik for forhold knyttet til sikkerhet, helse og arbeidsmiljø, og Annet for øvrige prosjektavvik. Avvik vises ikke i kundeportalen. Sjekkpunktavvik blir alltid med i sluttrapporten. HMS-/prosjektavvik tas kun med hvis du aktivt velger «Ta med i sluttrapport». Bruk eventuelt Klargjør i chat for å lage et chatutkast dersom noe skal kommuniseres videre." }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: addProjectDeviation, children: "+ Nytt HMS/prosjektavvik" })
      ] }),
      checklistDeviationRows.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Sjekkpunktavvik" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Disse avvikene kommer direkte fra sjekklistene. Trykk Gå til punkt for å åpne riktig sjekkpunkt og lukke avviket der." }),
        checklistDeviationRows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `checklistPoint checklistPoint-${row.status === "Avvik" ? "avvik" : "done"}`, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "checklistHeader", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "checklistPointTitle", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: row.item }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: row.category }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "warrantyPointBadge", children: row.status })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => onGoToChecklistPoint && onGoToChecklistPoint(row), children: "Gå til punkt" }),
            onPrepareChatDraft && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => onPrepareChatDraft({ ...row, source: "checklist", type: "Sjekkpunktavvik", title: row.item, description: row.comment }), children: "Klargjør i chat" })
          ] }),
          row.comment ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Avvik: " }), row.comment] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Avvik registrert uten kommentar." }),
          row.closeComment && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Lukket: " }), row.closeComment] }),
          (row.photos || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { className: "note", children: ["📷 ", (row.photos || []).length, " bilder"] })
        ] }, row.id))
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "HMS- og prosjektavvik" }),
        projectDeviations.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Ingen HMS- eller prosjektavvik er registrert." }),
        projectDeviations.map((entry) => {
          const isClosed = (entry.status || "Åpent") === "Lukket";
          return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `checklistPoint checklistPoint-${isClosed ? "done" : "avvik"}`, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Type avvik", value: entry.type || "HMS", options: ["HMS", "SHA", "Kvalitet", "Fremdrift", "Leveranse", "Kundeavklaring", "Annet"], onChange: (v) => updateProjectDeviation(entry.id, { type: v }) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Alvorlighet", value: entry.severity || "Middels", options: ["Lav", "Middels", "Høy", "Kritisk"], onChange: (v) => updateProjectDeviation(entry.id, { severity: v }) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Status", value: entry.status || "Åpent", options: ["Åpent", "Under behandling", "Lukket"], onChange: (v) => updateProjectDeviation(entry.id, { status: v }) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Frist", type: "date", value: entry.dueDate || "", onChange: (v) => updateProjectDeviation(entry.id, { dueDate: v }) })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Kort tittel", value: entry.title || "", onChange: (v) => updateProjectDeviation(entry.id, { title: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Beskrivelse av avvik", value: entry.description || "", onChange: (v) => updateProjectDeviation(entry.id, { description: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Tiltak / videre oppfølging", value: entry.action || "", onChange: (v) => updateProjectDeviation(entry.id, { action: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Ansvarlig", value: entry.responsible || "", onChange: (v) => updateProjectDeviation(entry.id, { responsible: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", style: { display: "flex", gap: "10px", alignItems: "center", marginTop: "8px" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", checked: !!entry.affectsWarranty, onChange: (e) => updateProjectDeviation(entry.id, { affectsWarranty: e.target.checked }), style: { width: "auto" } }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Kan påvirke garanti/sluttdokumentasjon" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", style: { display: "flex", gap: "10px", alignItems: "center", marginTop: "8px" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", checked: !!entry.includeInReport, onChange: (e) => updateProjectDeviation(entry.id, { includeInReport: e.target.checked }), style: { width: "auto" } }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Ta med i sluttrapport" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "upload checklistUpload", title: "Last opp bilder til avviket", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 18 }),
              (entry.photos || []).length > 0 ? ` 📷 ${(entry.photos || []).length} bilder – legg til flere` : " 📷 Legg til bilde",
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "file", accept: "image/*", multiple: true, onChange: (e) => addProjectDeviationPhotos(entry, e.target.files) })
            ] }),
            (entry.photos || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "photos checklistPhotos", children: (entry.photos || []).map((photo) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "photo", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: photo.url }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: photo.name })
            ] }, photo.id)) }),
            isClosed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "deviationClosedBox", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "✅ Avvik lukket" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: entry.closeComment || "Avviket er lukket." })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "10px" }, children: [
              !isClosed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => closeProjectDeviation(entry), children: "✅ Lukk avvik" }),
              isClosed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => reopenProjectDeviation(entry), children: "Åpne igjen" }),
              onPrepareChatDraft && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => onPrepareChatDraft({ ...entry, source: "project" }), children: "Klargjør i chat" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => removeProjectDeviation(entry.id), children: "Fjern" })
            ] })
          ] }, entry.id);
        })
      ] })
    ] });
  }

  return DeviationCenter;
}
