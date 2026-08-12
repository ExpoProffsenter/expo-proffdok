import { Plus } from 'lucide-react';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';

const import_lucide_react = { Plus };
const import_jsx_runtime = { jsx, jsxs, Fragment };

export function createProductViewTools({
  Section,
  Grid,
  Input,
  Select,
  hasValue,
  productSupportsColorChoice,
  productReportDocumentOptions,
  hasProductReportChoice
}) {
  function ProductReportDocumentSelector({ doc = {}, productName, updateProductDoc }) {
    const availableOptions = productReportDocumentOptions.filter((option) => hasValue(doc?.[option.field]));
    if (!availableOptions.length) return null;
    const hasChoice = hasProductReportChoice(doc);
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", style: { background: "#f8fafc", borderStyle: "dashed", marginTop: "10px" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Dokumenter som skal vises i rapport" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Kryss av kun dokumentene som er relevante for kunden. Lenker beholdes i prosjektet selv om de ikke vises i PDF." }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { display: "flex", flexWrap: "wrap", gap: "10px" }, children: availableOptions.map((option) => {
        const choiceKey = `include${option.key}InReport`;
        const checkedValue = doc?.[choiceKey] !== false;
        return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", style: { display: "inline-flex", alignItems: "center", gap: "7px", width: "auto", margin: 0 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", style: { width: "auto", minHeight: "auto", padding: 0, margin: 0 }, checked: checkedValue, onChange: (e) => updateProductDoc(productName, { [choiceKey]: e.target.checked }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: option.label })
        ] }, option.key);
      }) })
    ] });
  }

  function renderProductSections({
    effectiveProductSections = [],
    getManualProductsForSection,
    isProjectLocked = false,
    checked = {},
    openProductSections = {},
    setOpenProductSections,
    productDocs = {},
    toggleProductChecked,
    updateProductDoc,
    getProductColorOptions,
    addManualProduct,
    updateManualProduct,
    removeManualProduct,
    showReportSelectorWhenLocked = false
  }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: effectiveProductSections.map((s) => {
      const manualForSection = getManualProductsForSection(s.title);
      const visibleStandardItems = isProjectLocked ? (s.items || []).filter((i) => !!checked[i]) : s.items || [];
      const visibleManualItems = isProjectLocked ? manualForSection.filter((p) => hasValue(p?.name) || hasValue(p?.fdvUrl) || hasValue(p?.comment)) : manualForSection;
      const selectedInSection = (s.items || []).filter((i) => !!checked[i]).length;
      const manualInSection = manualForSection.filter((p) => hasValue(p?.name) || hasValue(p?.fdvUrl) || hasValue(p?.comment)).length;
      const hasUsedProducts = selectedInSection > 0 || manualInSection > 0;
      if (isProjectLocked && !hasUsedProducts) return null;
      const sectionOpen = isProjectLocked ? true : openProductSections?.[s.title] ?? hasUsedProducts;
      const totalVisible = visibleStandardItems.length + visibleManualItems.length;
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: s.title, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "secondary", onClick: () => setOpenProductSections((prev) => ({ ...prev || {}, [s.title]: !sectionOpen })), style: { width: "100%", justifyContent: "space-between", marginBottom: "12px" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
            sectionOpen ? "▼ " : "▶ ",
            s.title
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: isProjectLocked ? `${selectedInSection + manualInSection} brukt` : selectedInSection + manualInSection > 0 ? `${selectedInSection + manualInSection} valgt` : "Åpne" })
        ] }),
        !sectionOpen && !isProjectLocked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: selectedInSection + manualInSection > 0 ? `${selectedInSection + manualInSection} produkt${selectedInSection + manualInSection === 1 ? "" : "er"} er valgt i denne kategorien.` : "Trykk for å åpne og velge produkter i denne kategorien." }),
        sectionOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: isProjectLocked ? "Prosjektet er arkivert/låst. Kun produkter som er brukt vises her." : "Kryss av produkter som er brukt. Når et produkt er valgt, kan du legge inn FDV-/databladlink og hvor produktet er brukt direkte på produktet." }),
          isProjectLocked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { color: "#991b1b", fontWeight: 700 }, children: "🔒 Produkter kan ikke legges til, fjernes eller endres før prosjektet låses opp." }),
          totalVisible === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Ingen produkter valgt i denne kategorien ennå." }),
          visibleStandardItems.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "checklistList", children: visibleStandardItems.map((i) => {
            const doc = productDocs[i] || {};
            return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", style: { display: "flex", alignItems: "center", gap: "8px" }, children: [
                !isProjectLocked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", style: { width: "auto", minHeight: "auto", padding: 0, margin: 0, flex: "0 0 auto" }, checked: !!checked[i], onChange: (e) => toggleProductChecked(i, e.target.checked) }),
                isProjectLocked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { width: "18px", display: "inline-flex", justifyContent: "center", flex: "0 0 auto" }, children: "✓" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { margin: 0 }, children: i })
              ] }),
              checked[i] && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "FDV-/databladlink", value: doc.fdvUrl || "", disabled: isProjectLocked, onChange: (v) => updateProductDoc(i, { fdvUrl: v, fdvSource: "manual" }) }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Datablad", value: doc.databladUrl || "", disabled: isProjectLocked, onChange: (v) => updateProductDoc(i, { databladUrl: v, fdvSource: "manual" }) }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "DOP", value: doc.dopUrl || "", disabled: isProjectLocked, onChange: (v) => updateProductDoc(i, { dopUrl: v, fdvSource: "manual" }) }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "EPD", value: doc.epdUrl || "", disabled: isProjectLocked, onChange: (v) => updateProductDoc(i, { epdUrl: v, fdvSource: "manual" }) }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Sikkerhetsdatablad", value: doc.sikkerhetsdatabladUrl || "", disabled: isProjectLocked, onChange: (v) => updateProductDoc(i, { sikkerhetsdatabladUrl: v, fdvSource: "manual" }) }),
                  productSupportsColorChoice(i, s.title) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Fargekode", value: doc.colorCode || "", disabled: isProjectLocked, onChange: (v) => updateProductDoc(i, { colorCode: v }), options: getProductColorOptions(i, s.title) }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Hvor brukt / kommentar", value: doc.comment || "", disabled: isProjectLocked, onChange: (v) => updateProductDoc(i, { comment: v }) })
                ] }),
                (!isProjectLocked || showReportSelectorWhenLocked) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductReportDocumentSelector, { doc, productName: i, updateProductDoc }),
                doc.fdvSource === "product-master" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Dokumentlinker er hentet automatisk fra produktmaster." }),
                doc.fdvSource === "admin-register" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "FDV-link er hentet automatisk fra admin FDV-register." })
              ] })
            ] }, i);
          }) }),
          !isProjectLocked && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", { children: [
              "Andre produkter i ",
              s.title
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Bruk dette hvis produktet ikke ligger i standardlisten for denne kategorien." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", onClick: () => addManualProduct(s.title), children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 18 }),
              " Legg til annet produkt"
            ] }),
            visibleManualItems.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "12px" }, children: "Ingen andre produkter lagt til i denne kategorien." }),
            visibleManualItems.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Produktnavn", value: p.name || "", disabled: isProjectLocked, onChange: (v) => updateManualProduct(s.title, p.id, { name: v }) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "FDV-/databladlink", value: p.fdvUrl || "", disabled: isProjectLocked, onChange: (v) => updateManualProduct(s.title, p.id, { fdvUrl: v }) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Hvor brukt / kommentar", value: p.comment || "", disabled: isProjectLocked, onChange: (v) => updateManualProduct(s.title, p.id, { comment: v }) })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", disabled: isProjectLocked, onClick: () => removeManualProduct(s.title, p.id), children: "Fjern produkt" })
            ] }, p.id))
          ] }),
          isProjectLocked && visibleManualItems.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", { children: [
              "Andre produkter i ",
              s.title
            ] }),
            visibleManualItems.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "item", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: p.name || "Annet produkt" }),
              hasValue(p.fdvUrl) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: p.fdvUrl }),
              hasValue(p.comment) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: p.comment })
            ] }, p.id))
          ] })
        ] })
      ] }, s.title);
    }) });
  }

  return { ProductReportDocumentSelector, renderProductSections };
}
