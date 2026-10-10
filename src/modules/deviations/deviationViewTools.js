import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { formatDeviationDate } from './deviationDates.mjs';

const import_jsx_runtime = { jsx, jsxs, Fragment };
const foldRecord=(content,{id,title,status,meta,scope})=>jsxs('details',{className:'project-deviation-record','data-project-record-id':id,children:[jsxs('summary',{children:[jsx('strong',{children:title||'Avvik uten tittel'}),jsx('span',{className:status==='Lukket'||status==='Lukket avvik'?'project-deviation-status closed':'project-deviation-status open',children:status}),jsx('small',{children:meta})]}),jsx('div',{className:'project-deviation-record-content',children:content})]},scope+':'+id);


export function createDeviationCenter({
  uid,
  checklistPointAnchor,
  Grid,
  Select,
  Input,
  Textarea,
  ProjectDeviationCreator,
  Plus
}) {
  function DeviationCenter({ project, setProject, checklist = {}, activeChecklistTemplate = [], uploadImages = null, onGoToChecklistPoint = null, onPrepareChatDraft = null, onLinkKshms = null, onOpenKshms = null, projectId = null, userId = null, kshmsContext = null, onSaveProjectDeviation = null, onCreatedKshms = null, readOnly = false }) {
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
        ks_deviation_id: value.ks_deviation_id || null,
        anchorId: checklistPointAnchor(group.category, item)
      };
    }).filter(Boolean));
    const scope=[userId,kshmsContext?.company_id,projectId].join(':');
    const openChecklistDeviations = checklistDeviationRows.filter((row) => row.status === "Avvik").length;
    const openProjectDeviations = projectDeviations.filter((entry) => (entry?.status || "Åpent") !== "Lukket").length;
    const updateProjectDeviation = (id, patch = {}) => {
      if (projectDeviations.find(entry => entry.id === id)?.ks_deviation_id) return;
      setProject({
        ...project,
        projectDeviations: projectDeviations.map((entry) => entry.id === id ? { ...entry, ...patch } : entry)
      });
    };
    const removeProjectDeviation = (id) => {
      if (projectDeviations.find(entry => entry.id === id)?.ks_deviation_id) return;
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
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Åpne en gruppe og deretter saken du vil følge opp. Rader viser status, ansvarlig og frist. Nytt HMS/prosjektavvik registreres med knappen nedenfor." }),
        ProjectDeviationCreator && (0, import_jsx_runtime.jsx)(ProjectDeviationCreator, { uid, project, projectId, userId, context: kshmsContext, onSave: onSaveProjectDeviation, onCreatedKshms, onOpenKshms, disabled: readOnly })
      ] }),
      checklistDeviationRows.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", { className: "item project-deviation-group", children: [
        jsxs("summary", { children: [jsx("strong",{children:"Sjekkpunktavvik"}),jsx("span",{children:`${openChecklistDeviations} åpne · ${checklistDeviationRows.length-openChecklistDeviations} lukkede`})] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Disse avvikene kommer direkte fra sjekklistene. Trykk Gå til punkt for å åpne riktig sjekkpunkt og lukke avviket der." }),
        [...checklistDeviationRows].sort((a,b)=>(a.status!=="Avvik")-(b.status!=="Avvik")).map((row) => foldRecord(/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `checklistPoint checklistPoint-${row.status === "Avvik" ? "avvik" : "done"}`, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "checklistHeader", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "checklistPointTitle", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: row.item }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: row.category }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "warrantyPointBadge", children: row.status })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => onGoToChecklistPoint && onGoToChecklistPoint(row), children: "Gå til punkt" }),
            onPrepareChatDraft && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => onPrepareChatDraft({ ...row, source: "checklist", type: "Sjekkpunktavvik", title: row.item, description: row.comment }), children: "Klargjør i chat" })
            , row.ks_deviation_id && onOpenKshms && (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => onOpenKshms(row.ks_deviation_id), children: "Åpne i KS/HMS" })
            , !row.ks_deviation_id && row.status === "Avvik" && onLinkKshms && (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => onLinkKshms({ source_kind: "checklist", source_group: row.category, source_item: row.item, title: row.item, event: row.comment, category: "quality" }), children: "Koble til KS/HMS" })
          ] }),
          row.ks_deviation_id && (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Dette avviket følger KS/HMS. Ansvarlig dokumenterer kontrollen og lukker der." }),
          row.comment ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Avvik: " }), row.comment] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Avvik registrert uten kommentar." }),
          row.closeComment && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Lukket: " }), row.closeComment] }),
          (row.photos || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { className: "note", children: ["📷 ", (row.photos || []).length, " bilder"] })
        ] }, row.id), {id:row.id,title:row.item,status:row.status,meta:row.category,scope}))
      ] },scope+":checklist"),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", { className: "item project-deviation-group", children: [
        jsxs("summary", { children: [jsx("strong",{children:"HMS- og prosjektavvik"}),jsx("span",{children:`${openProjectDeviations} åpne · ${projectDeviations.length-openProjectDeviations} lukkede`})] }),
        projectDeviations.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Ingen HMS- eller prosjektavvik er registrert." }),
        [...projectDeviations].sort((a,b)=>((a.status||"Åpent")==="Lukket")-((b.status||"Åpent")==="Lukket")).map((entry) => {
          const isClosed = (entry.status || "Åpent") === "Lukket";
          const summary={id:entry.id,title:entry.title,status:entry.status||"Åpent",meta:`${entry.type||"HMS"} · Ansvarlig: ${entry.responsible||"Ikke oppgitt"} · Frist: ${formatDeviationDate(entry.dueDate)||"Ikke oppgitt"}`,scope};
          if (entry.ks_deviation_id) return foldRecord((0, import_jsx_runtime.jsxs)("div", { className: `checklistPoint checklistPoint-${isClosed ? "done" : "avvik"}`, children: [
            (0, import_jsx_runtime.jsx)("h4", { children: entry.title }),
            (0, import_jsx_runtime.jsx)("p", { children: entry.description }),
            (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [entry.status, " · Ansvarlig: ", entry.responsible, " · Frist: ", formatDeviationDate(entry.dueDate)] }),
            (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Avviket er koblet til KS/HMS. Endringer og lagret lukking styres der. Prosjektets øvrige avvik følger dagens flyt." }),
            isClosed && (0, import_jsx_runtime.jsx)("p", { children: entry.closeComment }),
            onOpenKshms && (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => onOpenKshms(entry.ks_deviation_id), children: "Åpne i KS/HMS" })
          ], "data-project-deviation-id": entry.id, tabIndex: -1 }, entry.id),summary);
          const missingSummary = !String(entry.title || "").trim() && !String(entry.description || "").trim();
          return foldRecord(/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `checklistPoint checklistPoint-${isClosed ? "done" : "avvik"}`, children: [
            missingSummary && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { fontWeight: 700 }, children: "⚠️ Dette eldre avviket mangler tittel og beskrivelse. Fyll inn hva avviket gjelder, eller fjern det hvis det ble opprettet ved en feil." }),
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
              !isClosed && onLinkKshms && (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => onLinkKshms({ source_kind: "project", source_key: entry.id, title: entry.title, event: entry.description, due_on: entry.dueDate, category: ["HMS", "SHA"].includes(entry.type) ? "hms" : "quality" }), children: "Koble til KS/HMS" }),
              isClosed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => reopenProjectDeviation(entry), children: "Åpne igjen" }),
              onPrepareChatDraft && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => onPrepareChatDraft({ ...entry, source: "project" }), children: "Klargjør i chat" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => removeProjectDeviation(entry.id), children: "Fjern" })
            ] })
          ], "data-project-deviation-id": entry.id, tabIndex: -1 }, entry.id),summary);
        })
      ] },scope+":project")
    ] });
  }

  return DeviationCenter;
}
