import { jsx, jsxs, Fragment } from 'react/jsx-runtime';

const import_jsx_runtime = { jsx, jsxs, Fragment };

export function createInstallationViewTools({
  Section,
  Grid,
  Select,
  Input,
  Textarea,
  Plus,
  uid,
  installCats
}) {
  function renderInstallationPanel({
    inst,
    setInst,
    uploadImages,
    authorName = "Ukjent"
  }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Fag, deler og utstyr", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", onClick: () => setInst((prev) => [...prev, { id: uid(), category: "Rørlegger", name: "", qty: "", supplier: "", desc: "", fdvUrl: "", photos: [], by: authorName, created: (/* @__PURE__ */ new Date()).toLocaleString("no-NO") }]), children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 18 }),
        " Legg til post"
      ] }),
      inst.map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Kategori", value: x.category, options: installCats, onChange: (v) => setInst(inst.map((i) => i.id === x.id ? { ...i, category: v } : i)) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Navn/produkt", value: x.name, onChange: (v) => setInst(inst.map((i) => i.id === x.id ? { ...i, name: v } : i)) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Antall/mengde", value: x.qty, onChange: (v) => setInst(inst.map((i) => i.id === x.id ? { ...i, qty: v } : i)) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Leverandør", value: x.supplier, onChange: (v) => setInst(inst.map((i) => i.id === x.id ? { ...i, supplier: v } : i)) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Beskrivelse/plassering", value: x.desc, onChange: (v) => setInst(inst.map((i) => i.id === x.id ? { ...i, desc: v } : i)) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "FDV-/databladlink", value: x.fdvUrl || "", onChange: (v) => setInst(inst.map((i) => i.id === x.id ? { ...i, fdvUrl: v } : i)) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "upload", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 18 }),
          " Last opp bilder",
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "file", accept: "image/*", multiple: true, onChange: async (e) => {
            const imgs = await uploadImages(e.target.files, "installasjoner");
            setInst(inst.map((i) => i.id === x.id ? { ...i, photos: [...i.photos || [], ...imgs] } : i));
          } })
        ] }),
        (x.photos || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
          "📷 ",
          (x.photos || []).length,
          " bilder lagt til"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "photos", children: (x.photos || []).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "photo", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: p.url }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: p.name })
        ] }, p.id)) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
          "Lagt inn av ",
          x.by,
          " · ",
          x.created
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => setInst(inst.filter((i) => i.id !== x.id)), children: "Fjern" })
      ] }, x.id))
    ] });
  }

  return { renderInstallationPanel };
}
