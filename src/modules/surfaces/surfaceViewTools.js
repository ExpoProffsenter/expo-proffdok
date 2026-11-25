import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { surfaces, bathroomEquipmentSections } from '../config/projectConfig.js';

const import_jsx_runtime = { jsx, jsxs, Fragment };

const hasValue = (value) => value !== undefined && value !== null && String(value).trim() !== "";

export const emptyBathroomEquipment = () => ({});

const equipmentValue = (equipment = {}, key = "", field = "") => equipment?.[`${key}_${field}`] || "";
const equipmentHasGenericContent = (equipment = {}, key = "") => ["product", "supplier", "fdvUrl", "certificateUrl", "comment"].some((field) => hasValue(equipmentValue(equipment, key, field)));
const equipmentSectionStorageKey = (title = "") => `custom_${String(title || "annet").toLowerCase().replace(/[åä]/g, "a").replace(/[øö]/g, "o").replace(/[æ]/g, "ae").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "")}`;
const equipmentCustomItemsForSection = (equipment = {}, title = "") => {
  const value = equipment?.[equipmentSectionStorageKey(title)];
  return Array.isArray(value) ? value : [];
};
const equipmentCustomItemHasContent = (item = {}) => ["product", "supplier", "fdvUrl", "certificateUrl", "comment"].some((field) => hasValue(item?.[field]));
const wcHasContent = (equipment = {}) => ["wcType", "wcProduct", "wcSupplier", "wcProductFdvUrl", "wcProductCertificateUrl", "wcCistern", "wcCisternSupplier", "wcCisternFdvUrl", "wcCisternCertificateUrl", "wcFlushPlate", "wcFlushPlateSupplier", "wcFlushPlateFdvUrl", "wcFlushPlateCertificateUrl", "wcFdvUrl", "wcCertificateUrl", "wcComment"].some((field) => hasValue(equipment?.[field]));

export const buildBathroomEquipmentReportGroups = (surf = {}, bathroomEquipment = {}) => {
  const groups = [];
  const pushGroup = (title) => {
    let group = groups.find((entry) => entry.title === title);
    if (!group) {
      group = { title, items: [] };
      groups.push(group);
    }
    return group;
  };
  const surfaceRows = Object.entries(surf || {}).filter(([, value]) => hasValue(value));
  const surfaceExtras = (bathroomEquipmentSections.find((section) => section.title === "Overflater")?.items || []).filter((item) => equipmentHasGenericContent(bathroomEquipment, item.key));
  const surfaceCustomExtras = equipmentCustomItemsForSection(bathroomEquipment, "Overflater").filter(equipmentCustomItemHasContent);
  if (surfaceRows.length || surfaceExtras.length || surfaceCustomExtras.length) {
    const group = pushGroup("Overflater");
    surfaceRows.forEach(([label, value]) => group.items.push({ title: label, entries: [["Produkt / beskrivelse", value]], links: [] }));
    surfaceExtras.forEach((item) => {
      const entries = [
        ["Produkt / beskrivelse", equipmentValue(bathroomEquipment, item.key, "product")],
        ["Leverandør", equipmentValue(bathroomEquipment, item.key, "supplier")],
        ["Kommentar", equipmentValue(bathroomEquipment, item.key, "comment")]
      ].filter(([, value]) => hasValue(value));
      const links = [
        { label: "FDV", url: equipmentValue(bathroomEquipment, item.key, "fdvUrl") },
        { label: "Produktsertifikat", url: equipmentValue(bathroomEquipment, item.key, "certificateUrl") }
      ].filter((link) => hasValue(link.url));
      group.items.push({ title: item.label, entries, links });
    });
    surfaceCustomExtras.forEach((customItem, index) => {
      const entries = [
        ["Produkt / beskrivelse", customItem.product],
        ["Leverandør", customItem.supplier],
        ["Kommentar", customItem.comment]
      ].filter(([, value]) => hasValue(value));
      const links = [
        { label: "FDV", url: customItem.fdvUrl },
        { label: "Produktsertifikat", url: customItem.certificateUrl }
      ].filter((link) => hasValue(link.url));
      group.items.push({ title: customItem.title || `Eget produkt ${index + 1}`, entries, links });
    });
  }
  if (wcHasContent(bathroomEquipment)) {
    const type = bathroomEquipment.wcType || "";
    const group = pushGroup("Sanitærutstyr");
    if (type) {
      group.items.push({ title: "WC / toalett", entries: [["Type WC", type]], links: [] });
    }
    const wcProductLinks = [
      { label: "FDV", url: bathroomEquipment.wcProductFdvUrl || bathroomEquipment.wcFdvUrl },
      { label: "Produktsertifikat", url: bathroomEquipment.wcProductCertificateUrl || bathroomEquipment.wcCertificateUrl }
    ].filter((link) => hasValue(link.url));
    if (hasValue(bathroomEquipment.wcProduct) || hasValue(bathroomEquipment.wcSupplier) || wcProductLinks.length) {
      group.items.push({
        title: type === "Vegghengt" ? "WC – veggskål" : "WC-produkt",
        entries: [
          ["Produkt / modell", bathroomEquipment.wcProduct],
          ["Leverandør", bathroomEquipment.wcSupplier]
        ].filter(([, value]) => hasValue(value)),
        links: wcProductLinks
      });
    }
    if (type === "Vegghengt") {
      const cisternLinks = [
        { label: "FDV", url: bathroomEquipment.wcCisternFdvUrl },
        { label: "Produktsertifikat", url: bathroomEquipment.wcCisternCertificateUrl }
      ].filter((link) => hasValue(link.url));
      if (hasValue(bathroomEquipment.wcCistern) || hasValue(bathroomEquipment.wcCisternSupplier) || cisternLinks.length) {
        group.items.push({
          title: "WC – sisterne",
          entries: [
            ["Sisternemodell", bathroomEquipment.wcCistern],
            ["Leverandør", bathroomEquipment.wcCisternSupplier]
          ].filter(([, value]) => hasValue(value)),
          links: cisternLinks
        });
      }
      const flushPlateLinks = [
        { label: "FDV", url: bathroomEquipment.wcFlushPlateFdvUrl },
        { label: "Produktsertifikat", url: bathroomEquipment.wcFlushPlateCertificateUrl }
      ].filter((link) => hasValue(link.url));
      if (hasValue(bathroomEquipment.wcFlushPlate) || hasValue(bathroomEquipment.wcFlushPlateSupplier) || flushPlateLinks.length) {
        group.items.push({
          title: "WC – trykknapp",
          entries: [
            ["Trykknappmodell", bathroomEquipment.wcFlushPlate],
            ["Leverandør", bathroomEquipment.wcFlushPlateSupplier]
          ].filter(([, value]) => hasValue(value)),
          links: flushPlateLinks
        });
      }
    }
    if (hasValue(bathroomEquipment.wcComment)) {
      group.items.push({ title: "WC – kommentar", entries: [["Kommentar", bathroomEquipment.wcComment]], links: [] });
    }
  }
  bathroomEquipmentSections.filter((section) => section.title !== "Overflater").forEach((section) => {
    const group = pushGroup(section.title);
    section.items.filter((item) => equipmentHasGenericContent(bathroomEquipment, item.key)).forEach((item) => {
      const entries = [
        ["Produkt / beskrivelse", equipmentValue(bathroomEquipment, item.key, "product")],
        ["Leverandør", equipmentValue(bathroomEquipment, item.key, "supplier")],
        ["Kommentar", equipmentValue(bathroomEquipment, item.key, "comment")]
      ].filter(([, value]) => hasValue(value));
      const links = [
        { label: "FDV", url: equipmentValue(bathroomEquipment, item.key, "fdvUrl") },
        { label: "Produktsertifikat", url: equipmentValue(bathroomEquipment, item.key, "certificateUrl") }
      ].filter((link) => hasValue(link.url));
      group.items.push({ title: item.label, entries, links });
    });
    equipmentCustomItemsForSection(bathroomEquipment, section.title).filter(equipmentCustomItemHasContent).forEach((customItem, index) => {
      const entries = [
        ["Produkt / beskrivelse", customItem.product],
        ["Leverandør", customItem.supplier],
        ["Kommentar", customItem.comment]
      ].filter(([, value]) => hasValue(value));
      const links = [
        { label: "FDV", url: customItem.fdvUrl },
        { label: "Produktsertifikat", url: customItem.certificateUrl }
      ].filter((link) => hasValue(link.url));
      group.items.push({ title: customItem.title || `Eget produkt ${index + 1}`, entries, links });
    });
  });
  return groups.filter((group) => group.items.length > 0);
};

export function createSurfaceViewTools({
  Section,
  Grid,
  Input,
  Select,
  Textarea,
  CollapsibleBlock,
  uid
}) {
  function renderOverflaterOgInnredning({
    surf = {},
    setSurf,
    bathroomEquipment = {},
    setBathroomEquipment
  }) {
    const updateBathroomEquipment = (patch = {}) => setBathroomEquipment((prev) => ({ ...prev || {}, ...patch }));

    const renderEquipmentItem = (item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: item.label }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Produkt / beskrivelse", value: equipmentValue(bathroomEquipment, item.key, "product"), onChange: (v) => updateBathroomEquipment({ [`${item.key}_product`]: v }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Leverandør", value: equipmentValue(bathroomEquipment, item.key, "supplier"), onChange: (v) => updateBathroomEquipment({ [`${item.key}_supplier`]: v }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "FDV-link", value: equipmentValue(bathroomEquipment, item.key, "fdvUrl"), onChange: (v) => updateBathroomEquipment({ [`${item.key}_fdvUrl`]: v }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Produktsertifikat-link", value: equipmentValue(bathroomEquipment, item.key, "certificateUrl"), onChange: (v) => updateBathroomEquipment({ [`${item.key}_certificateUrl`]: v }) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Kommentar", value: equipmentValue(bathroomEquipment, item.key, "comment"), onChange: (v) => updateBathroomEquipment({ [`${item.key}_comment`]: v }) })
    ] }, item.key);

    const addCustomEquipmentItem = (sectionTitle) => {
      const storageKey = equipmentSectionStorageKey(sectionTitle);
      const current = equipmentCustomItemsForSection(bathroomEquipment, sectionTitle);
      updateBathroomEquipment({ [storageKey]: [...current, { id: uid(), title: "", product: "", supplier: "", fdvUrl: "", certificateUrl: "", comment: "" }] });
    };

    const updateCustomEquipmentItem = (sectionTitle, id, patch) => {
      const storageKey = equipmentSectionStorageKey(sectionTitle);
      const current = equipmentCustomItemsForSection(bathroomEquipment, sectionTitle);
      updateBathroomEquipment({ [storageKey]: current.map((item) => item.id === id ? { ...item, ...patch } : item) });
    };

    const removeCustomEquipmentItem = (sectionTitle, id) => {
      const storageKey = equipmentSectionStorageKey(sectionTitle);
      const current = equipmentCustomItemsForSection(bathroomEquipment, sectionTitle);
      updateBathroomEquipment({ [storageKey]: current.filter((item) => item.id !== id) });
    };

    const renderCustomEquipmentSection = (sectionTitle) => {
      const customItems = equipmentCustomItemsForSection(bathroomEquipment, sectionTitle);
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Egne produkter / annet" }),
        customItems.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Legg til egne produkter dersom standardpunktene ikke dekker alt som skal dokumenteres." }),
        customItems.map((customItem, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", style: { marginTop: "12px" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center", flexWrap: "wrap" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: `Eget produkt ${index + 1}` }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => removeCustomEquipmentItem(sectionTitle, customItem.id), children: "Fjern" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Tittel / type", value: customItem.title || "", onChange: (v) => updateCustomEquipmentItem(sectionTitle, customItem.id, { title: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Produkt / beskrivelse", value: customItem.product || "", onChange: (v) => updateCustomEquipmentItem(sectionTitle, customItem.id, { product: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Leverandør", value: customItem.supplier || "", onChange: (v) => updateCustomEquipmentItem(sectionTitle, customItem.id, { supplier: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "FDV-link", value: customItem.fdvUrl || "", onChange: (v) => updateCustomEquipmentItem(sectionTitle, customItem.id, { fdvUrl: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Produktsertifikat-link", value: customItem.certificateUrl || "", onChange: (v) => updateCustomEquipmentItem(sectionTitle, customItem.id, { certificateUrl: v }) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Kommentar", value: customItem.comment || "", onChange: (v) => updateCustomEquipmentItem(sectionTitle, customItem.id, { comment: v }) })
        ] }, customItem.id)),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => addCustomEquipmentItem(sectionTitle), children: "+ Legg til eget produkt" })
      ] });
    };

    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Overflater og innredning", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Dokumenter synlige overflater, innredning, sanitærutstyr, armaturer, elektriske komponenter og annet utstyr. Bare utfylte punkter tas med i rapport/PDF." }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note collapsibleHelp", children: "Klikk på kategoriene under for å registrere produkter, FDV-lenker og dokumentasjon. Kun utfylte punkter tas med i rapporten." }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollapsibleBlock, { title: "Fliser og overflater", defaultOpen: Object.values(surf || {}).some(hasValue), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid, { children: surfaces.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: `${f} - produkt, farge og plassering`, value: surf[f] || "", onChange: (v) => setSurf({ ...surf, [f]: v }) }, f)) }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollapsibleBlock, { title: "WC / toalett", defaultOpen: wcHasContent(bathroomEquipment), children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "WC" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Type WC", value: bathroomEquipment.wcType || "", onChange: (v) => updateBathroomEquipment({ wcType: v }), options: ["", "Vegghengt", "Gulvstående"], optionLabels: { "": "Velg type" } }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: bathroomEquipment.wcType === "Vegghengt" ? "Veggskål / WC-produkt" : "WC-produkt / modell", value: bathroomEquipment.wcProduct || "", onChange: (v) => updateBathroomEquipment({ wcProduct: v }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: bathroomEquipment.wcType === "Vegghengt" ? "Leverandør veggskål" : "Leverandør", value: bathroomEquipment.wcSupplier || "", onChange: (v) => updateBathroomEquipment({ wcSupplier: v }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: bathroomEquipment.wcType === "Vegghengt" ? "FDV-link veggskål" : "FDV-link WC-produkt", value: bathroomEquipment.wcProductFdvUrl || bathroomEquipment.wcFdvUrl || "", onChange: (v) => updateBathroomEquipment({ wcProductFdvUrl: v, wcFdvUrl: v }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: bathroomEquipment.wcType === "Vegghengt" ? "Produktsertifikat veggskål" : "Produktsertifikat WC-produkt", value: bathroomEquipment.wcProductCertificateUrl || bathroomEquipment.wcCertificateUrl || "", onChange: (v) => updateBathroomEquipment({ wcProductCertificateUrl: v, wcCertificateUrl: v }) }),
          bathroomEquipment.wcType === "Vegghengt" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Sisternemodell", value: bathroomEquipment.wcCistern || "", onChange: (v) => updateBathroomEquipment({ wcCistern: v }) }),
          bathroomEquipment.wcType === "Vegghengt" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Leverandør sisterne", value: bathroomEquipment.wcCisternSupplier || "", onChange: (v) => updateBathroomEquipment({ wcCisternSupplier: v }) }),
          bathroomEquipment.wcType === "Vegghengt" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "FDV-link sisterne", value: bathroomEquipment.wcCisternFdvUrl || "", onChange: (v) => updateBathroomEquipment({ wcCisternFdvUrl: v }) }),
          bathroomEquipment.wcType === "Vegghengt" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Produktsertifikat sisterne", value: bathroomEquipment.wcCisternCertificateUrl || "", onChange: (v) => updateBathroomEquipment({ wcCisternCertificateUrl: v }) }),
          bathroomEquipment.wcType === "Vegghengt" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Trykknappmodell", value: bathroomEquipment.wcFlushPlate || "", onChange: (v) => updateBathroomEquipment({ wcFlushPlate: v }) }),
          bathroomEquipment.wcType === "Vegghengt" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Leverandør trykknapp", value: bathroomEquipment.wcFlushPlateSupplier || "", onChange: (v) => updateBathroomEquipment({ wcFlushPlateSupplier: v }) }),
          bathroomEquipment.wcType === "Vegghengt" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "FDV-link trykknapp", value: bathroomEquipment.wcFlushPlateFdvUrl || "", onChange: (v) => updateBathroomEquipment({ wcFlushPlateFdvUrl: v }) }),
          bathroomEquipment.wcType === "Vegghengt" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Produktsertifikat trykknapp", value: bathroomEquipment.wcFlushPlateCertificateUrl || "", onChange: (v) => updateBathroomEquipment({ wcFlushPlateCertificateUrl: v }) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Kommentar", value: bathroomEquipment.wcComment || "", onChange: (v) => updateBathroomEquipment({ wcComment: v }) })
      ] }) }),
      bathroomEquipmentSections.map((section) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollapsibleBlock, { title: section.title, defaultOpen: section.items.some((item) => equipmentHasGenericContent(bathroomEquipment, item.key)) || equipmentCustomItemsForSection(bathroomEquipment, section.title).some(equipmentCustomItemHasContent), children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cards", children: [
        ...section.items.map((item) => renderEquipmentItem(item)),
        renderCustomEquipmentSection(section.title)
      ] }) }, section.title))
    ] });
  }

  return { renderOverflaterOgInnredning };
}
