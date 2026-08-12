// FASE 25A FORSTÅELIG TILBUD/KONTRAKT: Deler fanen i Opprinnelig avtale, Endringer etter avtale og Vedlegg. Forklarer eksplisitt at tillegg/fradrag er dokumentasjon og ikke pris-/fakturaberegning. Ingen lagrings-/backendendring.
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
    const files = Array.isArray(tilbud?.files) ? tilbud.files : [];
    const acceptanceFile = files.find((file) =>
      file?.documentType === "acceptance-proof" ||
      /aksept/i.test(String(file?.name || ""))
    );
    const contractFile = files.find((file) =>
      file?.documentType === "contract" ||
      /kontrakt/i.test(String(file?.name || ""))
    );
    const hasSalesOrigin = Boolean(salesOrigin?.requestRef);
    const hasOriginalAgreementDocumentation = Boolean(hasSalesOrigin || acceptanceFile || contractFile);
    const acceptedTotal = Number(salesOrigin?.acceptedTotal);
    const hasAcceptedTotal = Number.isFinite(acceptedTotal) && acceptedTotal > 0;
    const acceptedAt = salesOrigin?.acceptedAt
      ? new Date(salesOrigin.acceptedAt).toLocaleString("no-NO")
      : "";
    const hasChangeContent = Boolean(
      String(tilbud?.tillegg || "").trim() ||
      String(tilbud?.fradrag || "").trim() ||
      String(tilbud?.kommentar || "").trim()
    );
    const hasReportContent = Boolean(hasChangeContent || files.length);
    const formatNok = (value) => new Intl.NumberFormat("no-NO", {
      style: "currency",
      currency: "NOK",
      maximumFractionDigits: 0
    }).format(Number(value || 0));
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Tilbud / kontrakt", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, {}), children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Her dokumenterer du hva som er avtalt med kunden, og eventuelle endringer som kommer senere. Fanen er valgfri for prosjekter som ikke har tilbud eller kontrakt." }),
      hasOriginalAgreementDocumentation ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", style: { marginBottom: "14px" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { style: { marginTop: 0 }, children: "1. Opprinnelig avtale" }),
        hasSalesOrigin ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
          salesOrigin.acceptedOfferVersionNumber ? `Tilbud v${salesOrigin.acceptedOfferVersionNumber}` : "Tilbud registrert via Befaring/Tilbud",
          hasAcceptedTotal ? ` · Avtalt sum ${formatNok(acceptedTotal)} eks. mva. / ${formatNok(acceptedTotal * 1.25)} inkl. mva.` : "",
          salesOrigin.acceptedBy ? ` · Akseptert av ${salesOrigin.acceptedBy}` : "",
          acceptedAt ? ` · ${acceptedAt}` : ""
        ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Prosjektet har et akseptbevis eller en kontrakt, men er opprettet med eldre prosjektdata som ikke har separat tilbudssammendrag. Se dokumentene under Vedlegg." }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "10px", flexWrap: "wrap" }, children: [
          acceptanceFile?.url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: acceptanceFile.url, target: "_blank", rel: "noopener noreferrer", className: "secondary", children: "Åpne akseptbevis" }),
          contractFile?.url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: contractFile.url, target: "_blank", rel: "noopener noreferrer", className: "secondary", children: "Åpne kontrakt" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginBottom: 0 }, children: "Opprinnelig avtale skal ikke skrives på nytt i feltene nedenfor. De brukes bare dersom avtalen endres senere." })
      ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", style: { marginBottom: "14px" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { style: { marginTop: 0 }, children: "1. Ingen opprinnelig avtale registrert" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginBottom: 0 }, children: "Dette er normalt for prosjekter som er opprettet direkte i Expo ProffDok uten tilbud. Hvis prosjektet har et eksternt tilbud eller en kontrakt, kan dokumentet lastes opp under Vedlegg. Hvis ikke, trenger du ikke gjøre noe i denne fanen." })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", style: { marginBottom: "14px" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { style: { marginTop: 0 }, children: "2. Endringer etter avtale" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginBottom: 0 }, children: "Bruk bare disse feltene når kunden og firmaet senere har avtalt en endring. Feltene beregner ikke pris, faktura eller ny kontrakt automatisk – de dokumenterer bare hva som er endret." })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Tillegg – beskrivelse og eventuelt beløp", value: tilbud.tillegg || "", onChange: (v) => setTilbud({ ...emptyTilbud(), ...tilbud, tillegg: v }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Fradrag – beskrivelse og eventuelt beløp", value: tilbud.fradrag || "", onChange: (v) => setTilbud({ ...emptyTilbud(), ...tilbud, fradrag: v }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Annen avtaleendring / kommentar", value: tilbud.kommentar || "", onChange: (v) => setTilbud({ ...emptyTilbud(), ...tilbud, kommentar: v }) }),
        hasReportContent ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", style: { display: "flex", alignItems: "center", gap: "8px" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", style: { width: "auto", minHeight: "auto", padding: 0, margin: 0, flex: "0 0 auto" }, checked: !!tilbud.enabled, onChange: (e) => setTilbud({ ...emptyTilbud(), ...tilbud, enabled: e.target.checked }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { margin: 0 }, children: "Ta med Tilbud/kontrakt i rapport" })
        ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "item", style: { margin: 0 }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { margin: 0 }, children: "Rapportvalg vises når du har registrert en endring eller lastet opp et dokument." }) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "3. Vedlegg / avtaledokumenter" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Last opp tilbud, akseptbevis, kontrakt eller andre avtaledokumenter dersom prosjektet har dette. Dokumentene lagres på prosjektet og vises i kundelinken. Underentreprenør har ikke tilgang til Tilbud/kontrakt." }),
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
