// FASE 27D GARANTI: Mekanisk uttrekk av eksisterende ProjectWarrantySetup og WarrantyPanel fra main.jsx. Ingen funksjons-, garanti-, PDF-, database-, RLS-, Storage-, Edge Function- eller e-postendring.
import React, * as ReactNS from 'react';
import { BadgeCheck } from 'lucide-react';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';

const import_react = { default: React, ...ReactNS };
const import_lucide_react = { BadgeCheck };
const import_jsx_runtime = { jsx, jsxs, Fragment };

export function createWarrantyViewTools({
  Section,
  Grid,
  Input,
  Select,
  emptyWarranty,
  getWarrantyYears,
  WARRANTY_YEAR_OPTIONS,
  WARRANTY_YEARS,
  makeWarrantyValidUntil,
  checklistPointAnchor,
  hasValue,
  warrantyTermsPdfFileName,
  warrantyArchiveNotice,
  standardWetroomTemplateTradeOptions,
  standardWetroomTemplateDefaultTrades,
  customChecklistTradeIconUrl
}) {
  function ProjectWarrantySetup({ warranty, setWarranty, systems, project = {}, onCreateStandardWetroomTemplate = null }) {
    const enabled = !!warranty?.enabled;
    const selectedSystem = systems.find((item) => item.id === warranty?.system);
    const standardWetroomAllowed = enabled && !!selectedSystem;
    const [standardWetroomTrades, setStandardWetroomTrades] = import_react.default.useState(standardWetroomTemplateDefaultTrades);
    const existingCustomChecklistCount = Array.isArray(project?.customChecklistGroups) ? project.customChecklistGroups.length : 0;
    const toggleStandardWetroomTrade = (trade) => {
      setStandardWetroomTrades((prev) => prev.includes(trade) ? prev.filter((item) => item !== trade) : [...prev, trade]);
    };
    const setEnabled = (value) => {
      setWarranty({
        ...emptyWarranty(),
        ...warranty,
        enabled: !!value,
        system: value ? warranty?.system || "" : "",
        sintefApproval: value ? warranty?.sintefApproval || selectedSystem?.sintefApproval || "" : "",
        issued: value ? !!warranty?.issued : false,
        issuedAt: value ? warranty?.issuedAt || null : null,
        status: value ? warranty?.status || "draft" : "draft",
        durationYears: value ? getWarrantyYears(warranty) : WARRANTY_YEARS
      });
    };
    const updateSystem = (systemId) => {
      const system = systems.find((item) => item.id === systemId);
      setWarranty({
        ...emptyWarranty(),
        ...warranty,
        enabled: true,
        system: system?.id || "",
        sintefApproval: system?.sintefApproval || "",
        status: warranty?.issued ? "issued" : "draft",
        durationYears: getWarrantyYears(warranty)
      });
    };
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item warrantyProjectSetup", style: { gridColumn: "1 / -1" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Dokumentert tetthetsgaranti" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Velg tidlig om prosjektet skal omfattes av dokumentert tetthetsgaranti. Hvis Ja velges aktiveres garantikravene og riktig Sopro-sjekkliste automatisk." }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "10px" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", style: { display: "flex", alignItems: "center", gap: "8px" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "radio", name: "projectWarrantyChoice", checked: enabled, onChange: () => setEnabled(true), style: { width: "auto", minHeight: "auto", padding: 0, margin: 0 } }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Ja" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", style: { display: "flex", alignItems: "center", gap: "8px" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "radio", name: "projectWarrantyChoice", checked: !enabled, onChange: () => setEnabled(false), style: { width: "auto", minHeight: "auto", padding: 0, margin: 0 } }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Nei" })
        ] })
      ] }),
      enabled && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginTop: "12px" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Garantiperiode", value: String(getWarrantyYears(warranty)), options: WARRANTY_YEAR_OPTIONS.map(String), optionLabels: Object.fromEntries(WARRANTY_YEAR_OPTIONS.map((year) => [String(year), `${year} år`])), onChange: (value) => setWarranty({ ...emptyWarranty(), ...warranty, enabled: true, durationYears: Number(value) }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Velg membransystem", value: warranty?.system || "", options: ["", ...systems.map((item) => item.id)], optionLabels: { "": "Velg Sopro-system", ...Object.fromEntries(systems.map((item) => [item.id, item.label])) }, onChange: updateSystem }),
        selectedSystem && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", style: { marginTop: "8px" }, children: [
          "Valgt system: ",
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: selectedSystem.product }),
          " · ",
          selectedSystem.sintefApproval,
          ". Garantikravene vises automatisk i Sjekklister og Garanti."
        ] }),
        standardWetroomAllowed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", style: { marginTop: "14px", borderColor: "#bfdbfe", background: "#f8fbff" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "📋 Sjekkpunkter for andre fag" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Velg selv hvilke andre fag som inngår i våtromsprosjektet. Ingen fag er valgt på forhånd. Når du klikker Legg til sjekkpunkter for andre fag, legges ferdige sjekkpunkter inn for fagene du har valgt. Murer/flislegger er ikke med her, fordi ProffDok allerede har ordinære sjekklister for mur, membran og flis." }),
          existingCustomChecklistCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { color: "#92400e" }, children: `Prosjektet har allerede ${existingCustomChecklistCount} egne sjekkpunkter. Nye standardpunkter legges kun til hvis de mangler fra før. Ingenting slettes eller overskrives.` }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "10px", marginTop: "10px" }, children: standardWetroomTemplateTradeOptions.map((trade) => {
            const checked = standardWetroomTrades.includes(trade);
            return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", onClick: () => toggleStandardWetroomTrade(trade), className: checked ? "" : "secondary", style: { minHeight: "58px", display: "flex", alignItems: "center", gap: "10px", justifyContent: "flex-start", textAlign: "left", padding: "12px", borderRadius: "14px", border: checked ? "1px solid #0f766e" : "1px solid #cbd5e1", background: checked ? "#ecfdf5" : "#ffffff", color: "#0f172a", width: "100%", minWidth: 0, whiteSpace: "normal" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { fontSize: "22px", lineHeight: 1 }, children: checked ? "☑" : "☐" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: customChecklistTradeIconUrl(trade), alt: "", "aria-hidden": "true", style: { width: "34px", height: "34px", objectFit: "contain", flex: "0 0 auto" } }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { fontWeight: 800, minWidth: 0, whiteSpace: "normal", overflowWrap: "anywhere" }, children: trade })
            ] }, trade);
          }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "12px", alignItems: "center" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => onCreateStandardWetroomTemplate && onCreateStandardWetroomTemplate(standardWetroomTrades), disabled: !standardWetroomTrades.length, children: "Legg til sjekkpunkter for andre fag" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { className: "note", style: { alignSelf: "center", flex: "1 1 260px", minWidth: 0, overflowWrap: "anywhere" }, children: "Punktene blir vanlige egne sjekkpunkter og kan redigeres, slettes og suppleres i Sjekklister." })
          ] })
        ] })
      ] }),
      !enabled && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "8px" }, children: "Garantien er ikke aktivert. Prosjektet kan fortsatt dokumenteres som vanlig." })
    ] });
  }

  function WarrantyPanel({ warranty, setWarranty, readiness, issueWarranty, systems, goToTab, project = {}, company = {}, name = "Expo ProffDok", overtagelse = {}, isProjectLocked = false, downloadClickablePdfReport = null }) {
    const selectedSystem = systems.find((item) => item.id === warranty?.system);
    const goToWarrantyPoint = (point) => {
      if (!point) return;
      if (typeof goToTab === "function") goToTab("sjekklister");
      window.setTimeout(() => {
        const el = document.getElementById(point.anchorId || checklistPointAnchor(point.category, point.item));
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.classList.add("checklistPointFocus");
          window.setTimeout(() => el.classList.remove("checklistPointFocus"), 2200);
        } else {
          alert("Gå til fanen Sjekklister og åpne riktig Sopro-kategori.");
        }
      }, 220);
    };
    const updateSystem = (systemId) => {
      const system = systems.find((item) => item.id === systemId);
      setWarranty({
        ...emptyWarranty(),
        ...warranty,
        system: system?.id || "",
        sintefApproval: system?.sintefApproval || "",
        status: warranty?.issued ? "issued" : "draft"
      });
    };
    const enabled = !!warranty?.enabled;
    // FASE 11D.8.1 HOTFIX:
    // Noen eksisterende prosjekter kan ha garantinummer/status lagret, selv om issued-flagget ikke er satt.
    // Visningen skal derfor tolke garanti som utstedt når issued=true, status=issued eller garantinummer finnes.
    const issued = !!warranty?.issued || warranty?.status === "issued" || hasValue(warranty?.guaranteeNumber);
    const warrantyYears = getWarrantyYears(warranty);
    const warrantyValidUntil = makeWarrantyValidUntil(overtagelse?.dato || project?.date || "", warranty);
    const warrantyStatusText = issued ? (warrantyValidUntil && new Date(warrantyValidUntil) < /* @__PURE__ */ new Date() ? "Utgått" : "Gyldig") : readiness?.ready ? "Klar til utstedelse" : "Ikke utstedt";
    const warrantyCanEdit = !isProjectLocked && !issued;
    const downloadWarrantyTermsPdf = async () => {
      try {
        const module = await import("https://esm.sh/jspdf@2.5.1");
        const JsPDF = module.jsPDF || module.default?.jsPDF;
        if (!JsPDF) throw new Error("Kunne ikke laste PDF-motor.");
        const doc = new JsPDF({ unit: "mm", format: "a4", compress: true });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 16;
        const contentWidth = pageWidth - margin * 2;
        let y = 18;
        const addTitle = (text, size = 18) => { doc.setFont("helvetica", "bold"); doc.setFontSize(size); doc.setTextColor(12, 42, 82); doc.text(text, margin, y); y += size === 18 ? 12 : 8; };
        const addText = (text, opts = {}) => { doc.setFont("helvetica", opts.bold ? "bold" : "normal"); doc.setFontSize(opts.size || 9); doc.setTextColor(31, 41, 55); const lines = doc.splitTextToSize(String(text || ""), contentWidth); if (y + lines.length * 4.6 > pageHeight - 18) { doc.addPage(); y = 18; } doc.text(lines, margin, y); y += lines.length * 4.6 + 4; };
        const addSection = (heading, body) => { addTitle(heading, 12); addText(body); };
        doc.setFillColor(248, 250, 252); doc.rect(0, 0, pageWidth, pageHeight, "F"); doc.setFillColor(255,255,255); doc.roundedRect(9, 9, pageWidth-18, pageHeight-18, 4, 4, "F");
        addTitle(`Garantivilkår – ${warrantyYears} års dokumentert tetthetsgaranti`, 18);
        addText(`Prosjekt: ${project?.projectName || project?.address || "Ikke oppgitt"}`, { bold: true });
        addText(`Kunde: ${project?.customer || "Ikke oppgitt"} · Utførende: ${name || company?.companyName || "Ikke oppgitt"}`);
        addText(`System: ${selectedSystem ? selectedSystem.product + " · " + selectedSystem.sintefApproval : warranty?.sintefApproval || "Ikke valgt"}`);
        addSection("1. Garantien", `Garantien gjelder tettheten i det dokumenterte membransystemet i ${warrantyYears} år fra dato for signert overtagelse. Garantien gjelder kun for det arbeidet som er dokumentert i Expo ProffDok.`);
        addSection("2. Forutsetninger", "Garantien forutsetter at godkjent Sopro-system er valgt, sjekklister og garantipunkter er fullført, nødvendig bildedokumentasjon foreligger, alle avvik er lukket og komplett sluttrapport er generert og arkivert.");
        addSection("3. Hva garantien omfatter", "Garantien omfatter dokumenterte feil i membransystemets tetthet når feilen skyldes utførelse eller installasjon av det dokumenterte systemet.");
        addSection("4. Hva garantien ikke omfatter", "Garantien omfatter ikke mekanisk skade, påboring, inngrep i konstruksjonen, skader etter overtagelse, brann, naturhendelser, manglende vedlikehold eller arbeider utført av andre etter overtagelse.");
        addSection("5. Varsling", "Forhold som kan omfattes av garantien skal meldes til garantigiver uten ugrunnet opphold etter at forholdet er oppdaget.");
        addSection("6. Dokumentasjon og arkiv", "Garantibeviset er gyldig sammen med komplett prosjekt­dokumentasjon, inkludert bilder, sjekklister, produktdokumentasjon og signert overtagelse. Utførende firma er ansvarlig for langsiktig arkivering.");
        addTitle("Kvittering for mottak", 12);
        addText(`Mottatt og akseptert av: ${warranty?.termsReceiptName || warranty?.termsAcceptedBy || "________________________"}`);
        addText(`Rolle: ${warranty?.termsReceiptRole || "Kunde"}     Dato: ${warranty?.termsAcceptedAt ? new Date(warranty.termsAcceptedAt).toLocaleString("no-NO") : "________________"}`);
        addText("Signatur: _______________________________________________");
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i += 1) { doc.setPage(i); doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(100,116,139); doc.text(`Expo ProffDok · Garantivilkår ${warrantyYears} år`, pageWidth / 2, pageHeight - 8, { align: "center" }); doc.text(`${i}/${pageCount}`, pageWidth - margin, pageHeight - 8, { align: "right" }); }
        doc.save(warrantyTermsPdfFileName);
      } catch (error) {
        alert("Kunne ikke lage garantivilkår-PDF: " + (error?.message || String(error)));
      }
    };
    const acceptWarrantyTerms = () => {
      const receiptName = (warranty?.termsReceiptName || project?.customer || "").trim();
      if (!receiptName) return alert("Fyll inn navn på den som bekrefter mottak av garantivilkår.");
      setWarranty({ ...emptyWarranty(), ...warranty, termsAccepted: true, termsAcceptedAt: new Date().toISOString(), termsAcceptedBy: receiptName, termsReceiptName: receiptName, termsReceiptRole: warranty?.termsReceiptRole || "Kunde" });
    };
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: enabled ? `${warrantyYears} års dokumentert tetthetsgaranti` : "Dokumentert tetthetsgaranti", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.BadgeCheck, {}), children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Garantien er valgfri og kan bare utstedes når overtagelse er signert, alle avvik er lukket, sjekklister er fullført, bildedokumentasjon er lastet opp og godkjent Sopro-system er valgt." }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", style: { display: "flex", alignItems: "center", gap: "10px" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", style: { width: "auto", minHeight: "auto", padding: 0, margin: 0 }, checked: enabled, disabled: !warrantyCanEdit, onChange: (e) => setWarranty({ ...emptyWarranty(), ...warranty, enabled: e.target.checked, system: e.target.checked ? warranty?.system || "" : "", sintefApproval: e.target.checked ? warranty?.sintefApproval || "" : "", issued: e.target.checked ? issued : false, issuedAt: e.target.checked ? warranty?.issuedAt || null : null, status: e.target.checked ? issued ? "issued" : "draft" : "draft" }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Aktiver dokumentert tetthetsgaranti for dette prosjektet" })
        ] }),
        !enabled && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Garantien er ikke aktivert. Prosjektet kan fortsatt dokumenteres som vanlig uten garanti." })
      ] }),
      enabled && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Godkjent Sopro-system", value: warranty?.system || "", disabled: !warrantyCanEdit, options: ["", ...systems.map((item) => item.id)], optionLabels: { "": "Velg Sopro-system", ...Object.fromEntries(systems.map((item) => [item.id, item.label])) }, onChange: updateSystem }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "SINTEF Teknisk Godkjenning", value: selectedSystem?.sintefApproval || warranty?.sintefApproval || "", onChange: (v) => setWarranty({ ...emptyWarranty(), ...warranty, sintefApproval: v }), disabled: true }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Garantiperiode", value: String(warrantyYears), disabled: !warrantyCanEdit, options: WARRANTY_YEAR_OPTIONS.map(String), optionLabels: Object.fromEntries(WARRANTY_YEAR_OPTIONS.map((year) => [String(year), `${year} år`])), onChange: (value) => setWarranty({ ...emptyWarranty(), ...warranty, enabled: true, durationYears: Number(value) }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Status", value: warrantyStatusText, onChange: () => {}, disabled: true })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", style: warranty?.termsAccepted ? { borderColor: "#bbf7d0", background: "#ecfdf5" } : { borderColor: "#fde68a", background: "#fffbeb" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: `📑 Garantivilkår ${warrantyYears} år` }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Garantivilkår aksepteres automatisk når kunden signerer overtagelsen og prosjektet fullføres. Kunden trenger ikke signere eller bekrefte vilkår et eget sted." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Mottaker", value: warranty?.termsReceiptName || overtagelse?.signKunde || project?.customer || "Kunde", disabled: true, onChange: () => {} }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Kvitteringsstatus", value: warranty?.termsAccepted || readiness?.termsAccepted ? `Bekreftet sammen med overtagelse${warranty?.termsAcceptedAt ? " " + new Date(warranty.termsAcceptedAt).toLocaleString("no-NO") : ""}` : "Bekreftes automatisk ved fullført overtagelse", disabled: true, onChange: () => {} })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", flexWrap: "wrap" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: downloadWarrantyTermsPdf, children: "⬇ Last ned garantivilkår PDF" }),
            !(warranty?.termsAccepted || readiness?.termsAccepted) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => goToTab && goToTab("overtagelse"), children: "Gå til overtagelse for signering" })
          ] })
        ] }),
        (issued || isProjectLocked) && enabled && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item warrantyArchiveCard", style: { borderColor: issued ? "#bbf7d0" : "#cbd5e1", background: issued ? "#ecfdf5" : "#f8fafc" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "📄 Garantidokument i arkiv" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: issued ? "Dette garantidokumentet er lagret på prosjektet og vises også når prosjektet er arkivert/låst." : "Prosjektet er arkivert/låst, men garantien er ikke utstedt. Garantidokument vises først når garantien er utstedt." }),
          issued && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "grid", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Garantinummer" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: warranty?.guaranteeNumber || "Ikke tildelt" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Status" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: warrantyStatusText })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Utstedt" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: warranty?.issuedAt ? new Date(warranty.issuedAt).toLocaleDateString("no-NO") : "Ikke oppgitt" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Gyldig til" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: warrantyValidUntil || `${warrantyYears} år fra overtakelse` })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Prosjekt" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: project?.projectName || project?.address || "Ikke oppgitt" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Kunde" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: project?.customer || "Ikke oppgitt" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Utførende firma" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: `${name || company?.companyName || "Ikke oppgitt"}${company?.orgNumber ? " · Org.nr. " + company.orgNumber : ""}` })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Membransystem" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: selectedSystem ? `${selectedSystem.product} · ${selectedSystem.sintefApproval}` : warranty?.sintefApproval || "Ikke oppgitt" })
            ] })
          ] }),
          issued && selectedSystem?.sintefUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: `SINTEF Teknisk Godkjenning: ${selectedSystem.sintefApproval}. Komplett garantibevis tas med i PDF fra Rapport-fanen også etter at prosjektet er låst/arkivert.` })
        ] }),
        selectedSystem && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item warrantyProgressCard", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "🛡️ Garantipunkter for valgt Sopro-system" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
            "Valgt system legger automatisk inn egne kontrollpunkter i fanen Sjekklister. Overlappende generelle membran-/primerpunkter skjules i visningen når garanti er aktivert, slik at samme kontroll ikke må vurderes to ganger. Punktene merkes med 🛡️ Garantipunkt. Status: ",
            readiness?.systemChecklistDone || 0,
            " av ",
            readiness?.systemChecklistTotal || 0,
            " garantipunkter fullført · ",
            readiness?.systemChecklistPercent || 0,
            "%."
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "checklistProgress warrantyProgress", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { width: `${readiness?.systemChecklistPercent || 0}%` } }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: selectedSystem.id === "sopro-aeb-815" ? "Grunnlaget er Sopro AEB 815 foliemembran med SINTEF TG 20918." : "Grunnlaget er Sopro FDF 525/527 smøremembran med SINTEF TG 20987." }),
          (readiness?.missingSystemChecklistPoints || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "warrantyMissingList", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Manglende garantipunkter:" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "warrantyMissingButtons", children: readiness.missingSystemChecklistPoints.map((point) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary warrantyJumpButton", onClick: () => goToWarrantyPoint(point), children: `Gå til: ${point.item}` }, point.anchorId)) })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", style: readiness?.ready ? { borderColor: "#bbf7d0", background: "#ecfdf5" } : { borderColor: "#fecaca", background: "#fff7f7" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: readiness?.ready ? "Klar til garanti" : "Ikke klar til garanti" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "checklistSummaryBadges", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: readiness?.overtagelseSigned ? "✅ Overtagelse signert" : "⚠️ Overtagelse mangler" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: readiness?.openDeviationCount === 0 ? "✅ Ingen åpne avvik" : `⚠️ ${readiness?.openDeviationCount || 0} åpne avvik` }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: readiness?.checklistComplete ? "✅ Sjekklister fullført" : `⚠️ ${readiness?.checklistDone || 0}/${readiness?.checklistTotal || 0} sjekklistepunkter` }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: readiness?.hasPhotos ? "✅ Bilder lastet opp" : "⚠️ Bilder mangler" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: issued ? readiness?.reportGenerated ? "✅ Komplett PDF generert" : "⚠️ Last ned komplett PDF nå" : "ℹ️ PDF lages etter garanti" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: readiness?.termsAccepted ? "✅ Vilkår akseptert" : "⚠️ Garantivilkår mangler" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: readiness?.approvedSoproSystemSelected ? "✅ Sopro-system valgt" : "⚠️ Sopro-system mangler" }),
            readiness?.approvedSoproSystemSelected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: readiness?.systemChecklistComplete ? "✅ Sopro-punkter fullført" : `⚠️ ${readiness?.systemChecklistDone || 0}/${readiness?.systemChecklistTotal || 0} Sopro-punkter` })
          ] }),
          (readiness?.missing || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginTop: "12px" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Mangler før garanti kan utstedes:" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: readiness.missing.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: item }, item)) })
          ] }),
          issued && warranty?.issuedAt && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
            "Garantien er markert som utstedt ",
            new Date(warranty.issuedAt).toLocaleString("no-NO"),
            "."
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Grunnlag for garantien" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Garantien bygger på dokumentert utførelse med valgt Sopro-system, fullførte sjekklister, lukket avvikshåndtering, bildedokumentasjon og signert overtagelse. Når garantien er utstedt, legges garantibevis og garantivilkår automatisk bakerst i den komplette PDF-rapporten. Last derfor ned komplett PDF etter at garantien er utstedt." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: warrantyArchiveNotice }),
          warranty?.reportGeneratedAt && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
            "Sist genererte komplette PDF-rapport: ",
            new Date(warranty.reportGeneratedAt).toLocaleString("no-NO"),
            warranty?.reportGeneratedFileName ? ` · ${warranty.reportGeneratedFileName}` : ""
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", flexWrap: "wrap" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", disabled: !readiness?.ready || issued || isProjectLocked, onClick: issueWarranty, children: issued ? "✅ Garanti utstedt" : isProjectLocked ? "Garanti kan ikke utstedes i låst prosjekt" : `Utsted ${warrantyYears} års tetthetsgaranti` }),
          issued && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => { if (typeof downloadClickablePdfReport === "function") downloadClickablePdfReport(); else alert("PDF-funksjonen er ikke klar. Gå til Rapport-fanen og trykk Last ned PDF."); }, children: "⬇ Last ned garantibevis / komplett PDF" }),
          issued && !isProjectLocked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => setWarranty({ ...emptyWarranty(), ...warranty, issued: false, issuedAt: null, status: "draft" }), children: "Trekk tilbake utstedelse" })
        ] })
      ] })
    ] });
  }


  return { ProjectWarrantySetup, WarrantyPanel };
}
