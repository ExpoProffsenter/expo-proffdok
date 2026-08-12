// FASE 24E SJEKKLISTEMODUL: Mekanisk uttrekk av eksisterende ChecklistEditor fra main.jsx. Ingen funksjons-, garanti-, rapport-, database-, RLS-, Storage-, Edge Function- eller e-postendring.
import React, * as ReactNS from 'react';
import { FileText, Plus } from 'lucide-react';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';

const import_react = { default: React, ...ReactNS };
const import_lucide_react = { FileText, Plus };
const import_jsx_runtime = { jsx, jsxs, Fragment };

export function createChecklistEditor({
  Section,
  Grid,
  Textarea,
  getActiveChecklistTemplate,
  getWarrantyYears,
  canUseCustomChecklistForWarranty,
  customChecklistTradeOptions,
  customChecklistCategoryFromTrade,
  hasValue,
  customChecklistCategoryPrefix,
  checklistPointAnchor,
  isWarrantyCheckpoint,
  isSoproWarrantyPoint,
  customChecklistTradeFromCategory,
  customChecklistTradeIconUrl,
  isSoproWarrantyCategory,
  checklistAttachmentTradeOptions,
  checklistAttachmentDocumentTypeOptions,
  publicProjectFileUrl
}) {
  return function ChecklistEditor({ checklist, setChecklistValue, addChecklistPhoto, addFiles, files, setFiles, closedByName = "Utførende", showOpenDeviationsOnly = false, setShowOpenDeviationsOnly = null, warranty = {}, activeChecklistTemplate: providedActiveChecklistTemplate = null, customChecklistGroups = [], onAddCustomChecklistPoint = null, onRemoveCustomChecklistPoint = null, onSaveChecklistNow = null, checklistSaveStatus = "" }) {
    const activeChecklistTemplate = providedActiveChecklistTemplate || getActiveChecklistTemplate(warranty);
    const customChecklistAllowed = canUseCustomChecklistForWarranty(warranty);
    const [newCustomChecklistTrade, setNewCustomChecklistTrade] = import_react.default.useState(customChecklistTradeOptions[0] || "Rørlegger");
    const [newCustomChecklistText, setNewCustomChecklistText] = import_react.default.useState("");
    const customChecklistEntries = Array.isArray(customChecklistGroups) ? customChecklistGroups : [];
    const submitCustomChecklistPoint = () => {
      if (!customChecklistAllowed) return;
      if (!onAddCustomChecklistPoint) return;
      onAddCustomChecklistPoint(newCustomChecklistTrade, newCustomChecklistText);
      setNewCustomChecklistText("");
      setOpenCategories((prev) => ({ ...prev, [customChecklistCategoryFromTrade(newCustomChecklistTrade)]: true }));
    };
    const [openCategories, setOpenCategories] = import_react.default.useState(() => {
      const firstMissingGroup = activeChecklistTemplate.find((group) => (group.items || []).some((item) => !hasValue(checklist?.[group.category]?.[item]?.status)));
      return { [firstMissingGroup?.category || activeChecklistTemplate[0]?.category || ""]: true };
    });
    const mobileInitialChecklistJumpRef = import_react.default.useRef(false);
    import_react.default.useEffect(() => {
      if (!showOpenDeviationsOnly) return;
      const openGroups = Object.fromEntries(activeChecklistTemplate.map((group) => [
        group.category,
        group.items.some((item) => checklist?.[group.category]?.[item]?.status === "Avvik")
      ]));
      setOpenCategories(openGroups);
    }, [showOpenDeviationsOnly, checklist]);
    const groupHasOpenDeviation = (group) => group.items.some((item) => checklist?.[group.category]?.[item]?.status === "Avvik");
    const visibleChecklistGroups = showOpenDeviationsOnly ? activeChecklistTemplate.filter(groupHasOpenDeviation) : activeChecklistTemplate;
    const customChecklistQuickGroups = activeChecklistTemplate.filter((group) => String(group?.category || "").startsWith(customChecklistCategoryPrefix) && (group.items || []).length > 0);
    const flatChecklistPoints = activeChecklistTemplate.flatMap((group) => (group.items || []).map((item) => ({ category: group.category, item, anchorId: checklistPointAnchor(group.category, item) })));
    const firstIncompletePoint = flatChecklistPoints.find((point) => !hasValue(checklist?.[point.category]?.[point.item]?.status));
    const firstOpenDeviationPoint = flatChecklistPoints.find((point) => checklist?.[point.category]?.[point.item]?.status === "Avvik");
    const openDeviationJumpRef = import_react.default.useRef(false);
    const scrollToChecklistPoint = (point, block = "start") => {
      if (!point) return;
      setOpenCategories((prev) => ({ ...prev, [point.category]: true }));
      window.setTimeout(() => {
        const el = document.getElementById(point.anchorId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: window.innerWidth <= 700 ? block : "center" });
          el.classList.add("checklistPointFocus");
          window.setTimeout(() => el.classList.remove("checklistPointFocus"), 1600);
        }
      }, 180);
    };
    const scrollToCustomChecklistGroup = (group) => {
      const firstItem = group?.items?.[0];
      if (!group?.category || !firstItem) return;
      if (setShowOpenDeviationsOnly) setShowOpenDeviationsOnly(false);
      setOpenCategories((prev) => ({ ...prev, [group.category]: true }));
      window.setTimeout(() => scrollToChecklistPoint({ category: group.category, item: firstItem, anchorId: checklistPointAnchor(group.category, firstItem) }, "start"), 260);
    };
    import_react.default.useEffect(() => {
      if (!showOpenDeviationsOnly) {
        openDeviationJumpRef.current = false;
        return;
      }
      if (openDeviationJumpRef.current || !firstOpenDeviationPoint) return;
      openDeviationJumpRef.current = true;
      window.setTimeout(() => scrollToChecklistPoint(firstOpenDeviationPoint, "start"), 320);
    }, [showOpenDeviationsOnly, firstOpenDeviationPoint?.anchorId]);
    import_react.default.useEffect(() => {
      try {
        const rawTarget = window.sessionStorage.getItem("expoProffDokChecklistJumpTarget");
        if (!rawTarget) return;
        window.sessionStorage.removeItem("expoProffDokChecklistJumpTarget");
        const targetPoint = JSON.parse(rawTarget);
        if (!targetPoint?.category || !targetPoint?.item) return;
        scrollToChecklistPoint({
          category: targetPoint.category,
          item: targetPoint.item,
          anchorId: targetPoint.anchorId || checklistPointAnchor(targetPoint.category, targetPoint.item)
        }, "start");
      } catch (error) {
        console.warn("Kunne ikke hoppe til sjekkpunkt:", error);
      }
    }, []);
    import_react.default.useEffect(() => {
      if (mobileInitialChecklistJumpRef.current) return;
      if (showOpenDeviationsOnly) return;
      if (typeof window === "undefined" || window.innerWidth > 700) return;
      if (!firstIncompletePoint) return;
      mobileInitialChecklistJumpRef.current = true;
      scrollToChecklistPoint(firstIncompletePoint, "start");
    }, [firstIncompletePoint?.anchorId, showOpenDeviationsOnly]);
    const scrollToNextChecklistPoint = (category, item) => {
      const index = flatChecklistPoints.findIndex((point) => point.category === category && point.item === item);
      const nextPoint = flatChecklistPoints.slice(index + 1).find((point) => !hasValue(checklist?.[point.category]?.[point.item]?.status)) || flatChecklistPoints[index + 1];
      if (!nextPoint) return;
      scrollToChecklistPoint(nextPoint, "start");
    };
    const handleStatusClick = (category, item, status) => {
      const currentValue = checklist?.[category]?.[item] || {};
      const hasWarrantyDocumentation = (currentValue?.photos || []).some((photo) => hasValue(photo?.url)) || hasValue(currentValue?.comment);
      const isWarrantyCheckpoint = isSoproWarrantyPoint(category);
      setChecklistValue(category, item, { status }, { autoSave: true });
      if (status !== "Avvik" && isWarrantyCheckpoint && !hasWarrantyDocumentation) {
        alert("Garantipunktet må dokumenteres med bilde eller kommentar før du går videre til neste punkt.");
        scrollToChecklistPoint({ category, item, anchorId: checklistPointAnchor(category, item) }, "start");
        return;
      }
      if (status !== "Avvik") scrollToNextChecklistPoint(category, item);
    };
    const stopChecklistFileDragNavigation = (event) => {
      event.preventDefault();
      event.stopPropagation();
    };
    const handleChecklistPhotoDrop = (category, item, event) => {
      event.preventDefault();
      event.stopPropagation();
      const droppedFiles = event?.dataTransfer?.files;
      if (droppedFiles && droppedFiles.length) addChecklistPhoto(category, item, droppedFiles);
    };
    const handleChecklistAttachmentDrop = (event) => {
      event.preventDefault();
      event.stopPropagation();
      const droppedFiles = event?.dataTransfer?.files;
      if (droppedFiles && droppedFiles.length) addFiles(droppedFiles);
    };
    const updateChecklistAttachmentFile = (fileId, patch = {}) => {
      setFiles((prev) => (prev || []).map((file) => file.id === fileId ? { ...file, ...patch } : file));
    };
    const groupStats = (group) => {
      const total = group.items.length;
      const done = group.items.filter((item) => hasValue(checklist?.[group.category]?.[item]?.status)).length;
      const deviations = group.items.filter((item) => checklist?.[group.category]?.[item]?.status === "Avvik").length;
      const closedDeviations = group.items.filter((item) => checklist?.[group.category]?.[item]?.status === "Lukket avvik").length;
      const photos = group.items.reduce((sum, item) => sum + (checklist?.[group.category]?.[item]?.photos || []).length, 0);
      return { total, done, missing: Math.max(0, total - done), deviations, closedDeviations, photos };
    };
    const totalStats = activeChecklistTemplate.reduce((acc, group) => {
      const stats = groupStats(group);
      acc.total += stats.total;
      acc.done += stats.done;
      acc.missing += stats.missing;
      acc.deviations += stats.deviations;
      acc.closedDeviations += stats.closedDeviations;
      acc.photos += stats.photos;
      return acc;
    }, { total: 0, done: 0, missing: 0, deviations: 0, closedDeviations: 0, photos: 0 });
    const percent = totalStats.total ? Math.round(totalStats.done / totalStats.total * 100) : 0;
    const toggleCategory = (category) => setOpenCategories((prev) => ({ ...prev, [category]: !prev[category] }));
    const expandAll = () => setOpenCategories(Object.fromEntries(activeChecklistTemplate.map((group) => [group.category, true])));
    const showRemainingAndJump = () => {
      const targetPoint = firstIncompletePoint;
      setShowOpenDeviationsOnly && setShowOpenDeviationsOnly(false);
      setOpenCategories(Object.fromEntries(activeChecklistTemplate.map((group) => {
        const stats = groupStats(group);
        return [group.category, stats.missing > 0 || stats.deviations > 0 || group.category === targetPoint?.category];
      })));
      if (targetPoint) {
        window.setTimeout(() => scrollToChecklistPoint(targetPoint, "start"), 260);
      }
    };
    const collapseDone = showRemainingAndJump;
    const closeDeviation = (category, item, value = {}) => {
      const closeComment = window.prompt("Kommentar til lukking av avvik:", value.closeComment || "Utført/kontrollert og lukket.");
      if (closeComment === null) return;
      setChecklistValue(category, item, {
        status: "Lukket avvik",
        closedAt: (/* @__PURE__ */ new Date()).toISOString(),
        closedBy: closedByName || "Utførende",
        closeComment: closeComment.trim()
      });
    };
    const reopenDeviation = (category, item) => {
      if (!window.confirm("Vil du åpne avviket igjen?")) return;
      setChecklistValue(category, item, {
        status: "Avvik",
        closedAt: "",
        closedBy: "",
        closeComment: ""
      });
    };
    const toggleOpenDeviationView = () => {
      if (!setShowOpenDeviationsOnly) return;
      if (showOpenDeviationsOnly) {
        setShowOpenDeviationsOnly(false);
        openDeviationJumpRef.current = false;
        return;
      }
      setShowOpenDeviationsOnly(true);
      if (firstOpenDeviationPoint) {
        setOpenCategories((prev) => ({ ...prev, [firstOpenDeviationPoint.category]: true }));
        window.setTimeout(() => scrollToChecklistPoint(firstOpenDeviationPoint, "start"), 320);
      }
    };
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "checklistSummaryCard", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Sjekklistefremdrift" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
            totalStats.done,
            " av ",
            totalStats.total,
            " punkter vurdert \xB7 ",
            percent,
            "% ferdig"
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "checklistProgress", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { width: `${percent}%` } }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "checklistSummaryBadges", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
            "\u2705 ",
            totalStats.done,
            " utfylt"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
            "\u26AA ",
            totalStats.missing,
            " mangler"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
            "\u26A0\uFE0F ",
            totalStats.deviations,
            " åpne avvik"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
            "\u2705 ",
            totalStats.closedDeviations,
            " lukket"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
            "\u{1F4F7} ",
            totalStats.photos,
            " bilder"
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "checklistSummaryActions", children: [
          firstIncompletePoint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => scrollToChecklistPoint(firstIncompletePoint, "start"), children: "Gå til neste punkt" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: expandAll, children: "\xC5pne alle" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: collapseDone, children: "Vis det som gjenst\xE5r" }),
          totalStats.deviations > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: toggleOpenDeviationView, children: showOpenDeviationsOnly ? "Vis alle punkter" : "Vis bare åpne avvik" })
        ] }),
        showOpenDeviationsOnly && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Viser bare sjekkpunkter med åpne avvik. Trykk ‘Vis alle punkter’ for normal sjekkliste." }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "checklistSummaryActions", style: { marginTop: "10px" }, children: [
          onSaveChecklistNow && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: onSaveChecklistNow, children: "Lagre nå" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "note", children: checklistSaveStatus || "Autolagring aktiv" })
        ] })
      ] }),
      customChecklistQuickGroups.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", style: { marginBottom: "14px", background: "#f8fbff" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { style: { marginTop: 0 }, children: "📋 Egne sjekkpunkter" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Trykk på et fag for å hoppe direkte til egne sjekkpunkter i prosjektet." }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { display: "flex", flexWrap: "wrap", gap: "10px" }, children: customChecklistQuickGroups.map((group) => {
          const trade = customChecklistTradeFromCategory(group.category);
          const stats = groupStats(group);
          return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "secondary", onClick: () => scrollToCustomChecklistGroup(group), style: { minWidth: "116px", minHeight: "76px", display: "grid", placeItems: "center", gap: "4px", padding: "10px 12px", borderRadius: "16px", fontWeight: 900 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: customChecklistTradeIconUrl(trade), alt: "", "aria-hidden": "true", style: { width: "42px", height: "42px", objectFit: "contain", display: "block" } }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: trade }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { className: "note", children: [stats.done, "/", stats.total, " utfylt"] })
          ] }, group.category);
        }) })
      ] }),
      customChecklistAllowed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", style: { marginBottom: "14px" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { style: { marginTop: 0 }, children: "Egne sjekkpunkter per fag" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Legg til prosjektspesifikke kontrollpunkter for rørlegger, tømrer, elektriker eller andre fag. Punktene bruker samme status, avvik, kommentar og bildeopplasting som øvrige sjekkpunkter, og følger med hvis prosjektet kopieres som mal." }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
            "Fag",
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", { value: newCustomChecklistTrade, onChange: (e) => setNewCustomChecklistTrade(e.target.value), children: customChecklistTradeOptions.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: option, children: option }, option)) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
            "Sjekkpunkt",
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { value: newCustomChecklistText, onChange: (e) => setNewCustomChecklistText(e.target.value), placeholder: "F.eks. Bunnledning spylt og kamerakontrollert" })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: submitCustomChecklistPoint, children: "+ Legg til eget sjekkpunkt" }),
        customChecklistEntries.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { marginTop: "12px" }, children: customChecklistEntries.map((entry) => {
          const trade = entry?.trade || entry?.fag || "Annet fag";
          const text = entry?.text || entry?.item || entry?.title || "";
          if (!text) return null;
          return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "file", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: trade }),
              " · ",
              text
            ] }),
            onRemoveCustomChecklistPoint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => onRemoveCustomChecklistPoint(trade, text), children: "Fjern" })
          ] }, entry?.id || `${trade}-${text}`);
        }) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "checklistList checklistAccordion", children: visibleChecklistGroups.map((group) => {
        const stats = groupStats(group);
        const isOpen = openCategories[group.category] !== false;
        const groupTone = stats.deviations > 0 ? "avvik" : stats.missing === 0 ? "done" : stats.done > 0 ? "progress" : "missing";
        return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `item checklistGroup checklistGroup-${groupTone}`, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "checklistGroupHeader", onClick: () => toggleCategory(group.category), "aria-expanded": isOpen, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "checklistGroupCaret", "aria-hidden": "true", children: isOpen ? "\u25BE" : "\u25B8" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "checklistGroupTitle", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { style: { display: "inline-flex", alignItems: "center", gap: "8px" }, children: [
                isSoproWarrantyCategory(group.category) ? "🛡️ " : String(group.category || "").startsWith(customChecklistCategoryPrefix) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: customChecklistTradeIconUrl(customChecklistTradeFromCategory(group.category)), alt: "", "aria-hidden": "true", style: { width: "24px", height: "24px", objectFit: "contain", display: "inline-block", flex: "0 0 auto" } }) : "",
                group.category
              ] }),
              isSoproWarrantyCategory(group.category) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "warrantyPointBadge", children: `${getWarrantyYears(warranty)} ÅRS GARANTI` }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
                stats.done,
                "/",
                stats.total,
                " utfylt",
                stats.deviations ? ` \xB7 ${stats.deviations} avvik` : "",
                stats.photos ? ` \xB7 ${stats.photos} bilder` : ""
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `checklistGroupBadge checklistGroupBadge-${groupTone}`, children: stats.deviations > 0 ? "\u26A0\uFE0F Avvik" : stats.missing === 0 ? "\u2705 Ferdig" : stats.done > 0 ? "\u{1F7E1} P\xE5g\xE5r" : "\u26AA Mangler" })
          ] }),
          isOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "checklistGroupBody", children: group.items.filter((item) => !showOpenDeviationsOnly || checklist?.[group.category]?.[item]?.status === "Avvik").map((item) => {
            const value = checklist[group.category]?.[item] || {};
            const pointTone = value.status === "Avvik" ? "avvik" : value.status === "Lukket avvik" ? "done" : value.status ? "done" : "missing";
            const warrantyPoint = isSoproWarrantyPoint(group.category);
            const pointRequirement = warrantyPoint ? { ...group.requirements?.[item] || {}, image_required: true, comment_required: true } : group.requirements?.[item] || {};
            const anchorId = checklistPointAnchor(group.category, item);
            return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { id: anchorId, className: `checklistPoint checklistPoint-${pointTone}${warrantyPoint ? " checklistWarrantyPoint" : ""}`, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "checklistHeader", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "checklistPointTitle", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: item }),
                  warrantyPoint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "warrantyPointBadge", children: "🛡️ Garantipunkt" }),
                  warrantyPoint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "warrantyPointBadge", children: "📷/✍️ Bilde eller kommentar" }),
                  !warrantyPoint && pointRequirement.image_required && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "warrantyPointBadge", children: "📷 Bilde påkrevd" }),
                  !warrantyPoint && pointRequirement.comment_required && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "warrantyPointBadge", children: "✍️ Kommentar påkrevd" }),
                  String(group.category || "").startsWith(customChecklistCategoryPrefix) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "warrantyPointBadge", children: "Eget sjekkpunkt" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
                    value.status || "Ikke vurdert",
                    (value.photos || []).length > 0 ? ` \xB7 \u{1F4F7} ${(value.photos || []).length} bilder` : ""
                  ] })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "checklistStatusButtons", children: ["Ok", "Ikke aktuelt", "Avvik"].map((status) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "button",
                  {
                    type: "button",
                    className: value.status === status ? "" : "secondary",
                    onClick: () => handleStatusClick(group.category, item, status),
                    children: status
                  },
                  status
                )) })
              ] }),
              (String(group.category || "").startsWith(customChecklistCategoryPrefix) || value.status || value.comment || (value.photos || []).length > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                Textarea,
                {
                  label: "Kommentar",
                  value: value.comment || "",
                  onChange: (v) => setChecklistValue(group.category, item, { comment: v })
                }
              ),
              value.status === "Avvik" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "deviationCloseBox", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Avviket er åpent. Lukk det når tiltak er utført og kontrollert." }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => closeDeviation(group.category, item, value), children: "✅ Lukk avvik" })
              ] }),
              value.status === "Lukket avvik" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "deviationClosedBox", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "✅ Avvik lukket" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
                  value.closeComment || "Avviket er lukket.",
                  value.closedBy ? ` Lukket av ${value.closedBy}.` : "",
                  value.closedAt ? ` ${new Date(value.closedAt).toLocaleString("no-NO")}.` : ""
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => reopenDeviation(group.category, item), children: "Åpne avvik igjen" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "stretch" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "upload checklistUpload", onClick: (e) => e.stopPropagation(), onDragOver: stopChecklistFileDragNavigation, onDragEnter: stopChecklistFileDragNavigation, onDrop: (e) => handleChecklistPhotoDrop(group.category, item, e), title: "Dra bilde hit eller velg bilde fra bildebibliotek", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 18 }),
                  (value.photos || []).length > 0 ? ` 🖼️ ${(value.photos || []).length} bilde${(value.photos || []).length === 1 ? "" : "r"} lastet opp – velg flere` : " 🖼️ Velg bilde fra bildebibliotek / dra bilde hit",
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "file", accept: "image/*", multiple: true, onClick: (e) => e.stopPropagation(), onChange: (e) => addChecklistPhoto(group.category, item, e.target.files) })
                ] })
              ] }),
              (value.photos || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "photos checklistPhotos", children: value.photos.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "photo", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: p.url }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: p.name })
              ] }, p.id)) })
            ] }, item);
          }) })
        ] }, group.category);
      }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Opplastede sjekklister / vedlegg fra andre fag", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.FileText, {}), children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "upload checklistUpload", onDragOver: stopChecklistFileDragNavigation, onDragEnter: stopChecklistFileDragNavigation, onDrop: handleChecklistAttachmentDrop, title: "Dra PDF, bilde eller dokument hit – eller klikk for å laste opp", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 18 }),
          " Last opp sjekkliste / vedlegg – dra filer hit eller klikk",
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "file", multiple: true, onChange: (e) => addFiles(e.target.files) })
        ] }),
        files.map((f) => {
          const fileUrl = publicProjectFileUrl(f);
          return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "file", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: f.name }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
              "Lastet opp av ",
              f.by || "Ukjent",
              " \xB7 ",
              f.created || ""
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
                "Fag/rolle",
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", { value: f.trade || f.fag || f.role || "Uspesifisert", onChange: (e) => updateChecklistAttachmentFile(f.id, { trade: e.target.value }), children: checklistAttachmentTradeOptions.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: option, children: option }, option)) })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
                "Dokumenttype",
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", { value: f.documentType || f.docType || f.typeLabel || "Sjekkliste", onChange: (e) => updateChecklistAttachmentFile(f.id, { documentType: e.target.value }), children: checklistAttachmentDocumentTypeOptions.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: option, children: option }, option)) })
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Kort beskrivelse / kommentar", value: f.description || f.comment || "", onChange: (v) => updateChecklistAttachmentFile(f.id, { description: v }) }),
            fileUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: fileUrl, target: "_blank", rel: "noopener noreferrer", children: "\xC5pne" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { style: { color: "#991b1b", fontWeight: 800 }, children: "Dokumentlenke mangler – last opp filen på nytt" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => setFiles(files.filter((x) => x.id !== f.id)), children: "Fjern" })
          ] }, f.id);
        })
      ] })
    ] });
  }
}
