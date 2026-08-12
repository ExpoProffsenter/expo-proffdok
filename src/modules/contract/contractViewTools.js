// FASE 24S.1 TYDELIG AVTALELOGIKK: Skiller opprinnelig akseptert tilbud fra senere tillegg, fradrag og avtaleendringer. Prosjekter uten tilbud/kontrakt kan la fanen stå tom. Ingen lagrings-/backendendring.
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';

const import_jsx_runtime = { jsx, jsxs, Fragment };

export function createContractViewTools({
  Section,
  Grid,
  Textarea,
  FileText,
  Plus,
  emptyTilbud
}) {
  function renderContractPanel({
    project,
    tilbud,
    setTilbud,
    uploadTilbudFiles
  }) {
    const salesOrigin = project?.salesOrigin || {};
    const hasOriginalAgreement = Boolean(salesOrigin?.requestRef);
    const acceptedTotal = Number(salesOrigin?.acceptedTotal);
    const hasAcceptedTotal = Number.isFinite(acceptedTotal) && acceptedTotal > 0;
    const acceptedAt = salesOrigin?.acceptedAt
      ? new Date(salesOrigin.acceptedAt).toLocaleString("no-NO")
      : "";
    const formatNok = (value) => new Intl.NumberFormat("no-NO", {
      style: "currency",
      currency: "NOK",
      maximumFractionDigits: 0
    }).format(Number(value || 0));
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Tilbud / kontrakt", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, {}), children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Denne fanen er valgfri. Bruk den når prosjektet har tilbud, kontrakt eller senere pris-/avtaleendringer. Prosjekter uten avtalt pris eller kontrakt kan la feltene stå tomme." }),
      hasOriginalAgreement && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", style: { marginBottom: "14px" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Opprinnelig avtale fra Befaring/Tilbud" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", style: { margin: "6px 0 0" }, children: [
          salesOrigin.acceptedOfferVersionNumber ? `Akseptert tilbud v${salesOrigin.acceptedOfferVersionNumber}` : "Akseptert tilbud",
          hasAcceptedTotal ? ` · ${formatNok(acceptedTotal)} eks. mva. / ${formatNok(acceptedTotal * 1.25)} inkl. mva.` : "",
          salesOrigin.acceptedBy ? ` · Akseptert av ${salesOrigin.acceptedBy}` : "",
          acceptedAt ? ` · ${acceptedAt}` : ""
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginBottom: 0 }, children: "Detaljene i det opprinnelige tilbudet dokumenteres av akseptbeviset og eventuell kontrakt under Vedlegg. Feltene nedenfor brukes bare for endringer etter den opprinnelige avtalen." })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "item", style: { marginBottom: "14px" }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Pris- og avtaleendringer" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginBottom: 0 }, children: "Brukes bare dersom det finnes en avtalt pris eller kontrakt som senere er endret. Tillegg er arbeid eller leveranser som øker avtalt pris. Fradrag er arbeid eller leveranser som trekkes fra avtalt pris." })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Tillegg til avtalt pris", value: tilbud.tillegg || "", onChange: (v) => setTilbud({ ...emptyTilbud(), ...tilbud, tillegg: v }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Fradrag fra avtalt pris", value: tilbud.fradrag || "", onChange: (v) => setTilbud({ ...emptyTilbud(), ...tilbud, fradrag: v }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Avtaleendring / kommentar", value: tilbud.kommentar || "", onChange: (v) => setTilbud({ ...emptyTilbud(), ...tilbud, kommentar: v }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", style: { display: "flex", alignItems: "center", gap: "8px" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", style: { width: "auto", minHeight: "auto", padding: 0, margin: 0, flex: "0 0 auto" }, checked: !!tilbud.enabled, onChange: (e) => setTilbud({ ...emptyTilbud(), ...tilbud, enabled: e.target.checked }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { margin: 0 }, children: "Ta med Tilbud/kontrakt i rapport" })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Vedlegg" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Valgfritt. Last opp tilbud, kontrakt eller andre avtaledokumenter dersom prosjektet har dette. Vedleggene lagres på prosjektet og vises i kundelinken. Underentreprenør har ikke tilgang til tilbud/kontrakt." }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "upload", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 18 }),
          " Last opp tilbud / kontrakt",
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "file", multiple: true, style: { display: "none" }, onChange: (e) => {
            uploadTilbudFiles(e.target.files);
            e.target.value = "";
          } })
        ] }),
        (tilbud.files || []).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "12px" }, children: "Ingen tilbud eller kontrakter er lastet opp ennå." }),
        (tilbud.files || []).map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "file", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: f.name }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
            "Lastet opp av ",
            f.by || "Ukjent",
            " · ",
            f.created
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: f.url, target: "_blank", rel: "noopener noreferrer", children: "Åpne" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => setTilbud({ ...emptyTilbud(), ...tilbud, files: (tilbud.files || []).filter((x) => x.id !== f.id) }), children: "Fjern" })
        ] }, f.id))
      ] })
    ] });
  }

  return { renderContractPanel };
}
