// FASE 25B AVTALESUM I RAPPORT: Rapport og kunderapport viser opprinnelig og gjeldende avtalesum inkl. mva. basert på strukturerte tillegg/fradrag. Eksisterende vedlegg og legacy-sammendrag beholdes.
// FASE 24Q RAPPORTVISNING FAG/UTSTYR-BILDER: Viser eksisterende bilder fra Fag, deler og utstyr også direkte i Rapport-fanen. PDF-logikk, bildeopplasting, lagring og øvrig rapportinnhold er uendret.
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';

const import_jsx_runtime = { jsx, jsxs, Fragment };

export function createReportViewTools({
  Brand,
  Grid,
  PdfSafeLink,
  hasValue,
  projectHasOvertagelse,
  InfoCard,
  SignatureCard,
  normalizeExternalUrl,
  publicProjectFileUrl,
  buildBathroomEquipmentReportGroups
}) {
  function ChecklistReportSection({ checklist, projectDeviations = [] }) {
    const rows = [];
    Object.entries(checklist || {}).forEach(([category, items]) => {
      Object.entries(items || {}).forEach(([item, value]) => {
        if (value?.status || value?.comment || (value?.photos || []).length) {
          rows.push({ category, item, ...value });
        }
      });
    });
    if (!rows.length) return null;

    const statusMeta = (status = "") => {
      const clean = String(status || "").toLowerCase();
      if (clean === "avvik") return { icon: "!", label: "Åpent avvik", color: "#991b1b", bg: "#fef2f2", border: "#f87171" };
      if (clean === "lukket avvik") return { icon: "✓", label: "Lukket avvik", color: "#065f46", bg: "#ecfdf5", border: "#4ade80" };
      if (clean === "ikke aktuelt") return { icon: "–", label: "Ikke aktuelt", color: "#475569", bg: "#f8fafc", border: "#cbd5e1" };
      if (clean === "ok" || clean === "utført" || clean === "utfort") return { icon: "✓", label: "OK", color: "#047857", bg: "#ffffff", border: "#e2e8f0" };
      return { icon: "?", label: status || "Ikke vurdert", color: "#92400e", bg: "#fffbeb", border: "#fbbf24" };
    };

    const deviations = rows.filter((r) => r.status === "Avvik" || r.status === "Lukket avvik");
    const projectDeviationsForReport = (Array.isArray(projectDeviations) ? projectDeviations : []).filter((entry) => !!entry?.includeInReport);
    const openDeviationTotal = deviations.filter((r) => r.status === "Avvik").length + projectDeviationsForReport.filter((entry) => (entry?.status || "Åpent") !== "Lukket").length;
    const closedDeviationTotal = deviations.filter((r) => r.status === "Lukket avvik").length + projectDeviationsForReport.filter((entry) => (entry?.status || "Åpent") === "Lukket").length;
    const categories = [...new Set(rows.map((r) => r.category))];

    const itemStyle = (meta) => ({
      border: `1px solid ${meta.border}`,
      background: meta.bg,
      borderRadius: 12,
      padding: "10px 12px",
      margin: "8px 0 10px",
      breakInside: "avoid",
      pageBreakInside: "avoid"
    });
    const iconStyle = (meta) => ({
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 24,
      height: 24,
      borderRadius: 999,
      border: `1.5px solid ${meta.color}`,
      background: meta.label === "OK" ? "#ecfdf5" : "#ffffff",
      color: meta.color,
      fontWeight: 900,
      fontSize: 16,
      lineHeight: 1,
      marginRight: 10,
      flex: "0 0 auto"
    });

    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Sjekkliste / utførte kontroller" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Kontrollpunktene under viser registrert status for prosjektet. Bilder som er lagt inn på et sjekkpunkt vises direkte under punktet." }),
      categories.map((category) => {
        const categoryRows = rows.filter((r) => r.category === category);
        return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginTop: 18 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 12, padding: "10px 14px", marginBottom: 8 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { style: { margin: 0, color: "#0c2a52" }, children: category }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { style: { color: "#475569" }, children: [
              categoryRows.length,
              " punkt"
            ] })
          ] }),
          categoryRows.map((r) => {
            const meta = statusMeta(r.status);
            const hasPhotos = (r.photos || []).length > 0;
            return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: itemStyle(meta), children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", alignItems: "flex-start", gap: 0 }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: iconStyle(meta), children: meta.icon }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { flex: 1 }, children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }, children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: r.item }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { style: { color: meta.color, fontWeight: 800, whiteSpace: "nowrap" }, children: meta.label })
                  ] }),
                  r.comment && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { style: { margin: "6px 0 0" }, children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: r.status === "Avvik" || r.status === "Lukket avvik" ? "Opprinnelig avvik: " : "Kommentar: " }),
                    r.comment
                  ] }),
                  r.status === "Lukket avvik" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { style: { margin: "6px 0 0", color: "#065f46" }, children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Utbedring / lukkekommentar: " }),
                    r.closeComment || "Lukket uten egen lukkekommentar",
                    r.closedBy ? ` · Lukket av ${r.closedBy}` : "",
                    r.closedAt ? ` · ${new Date(r.closedAt).toLocaleString("no-NO")}` : ""
                  ] }),
                  hasPhotos && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginTop: 10 }, children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { style: { display: "block", color: "#0c2a52", fontWeight: 800, marginBottom: 6 }, children: [
                      "📷 Bildedokumentasjon (",
                      (r.photos || []).length,
                      ")"
                    ] }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "photos reportPhotos", children: (r.photos || []).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "photo", children: [
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: p.url, alt: p.name || r.item }),
                      p.name && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: p.name })
                    ] }, p.id || p.url)) })
                  ] })
                ] })
              ] })
            ] }, r.category + r.item);
          })
        ] }, category);
      }),
      (deviations.length > 0 || projectDeviationsForReport.length > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginTop: 22 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Avviksliste" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Avviksoppsummering: " }),
          `${openDeviationTotal} åpne avvik · ${closedDeviationTotal} lukkede avvik`
        ] }),
        deviations.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "checklistReportItem", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
              r.status === "Lukket avvik" ? "✅ Lukket avvik" : "⚠️ Åpent avvik",
              " – ",
              r.category,
              " / ",
              r.item
            ] })
          ] }),
          r.comment && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Opprinnelig avvik: " }),
            r.comment
          ] }),
          r.status === "Lukket avvik" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Utbedring / lukkekommentar: " }),
            r.closeComment || "Lukket uten egen lukkekommentar",
            r.closedBy ? ` · Lukket av ${r.closedBy}` : "",
            r.closedAt ? ` · ${new Date(r.closedAt).toLocaleString("no-NO")}` : ""
          ] }),
          r.status !== "Lukket avvik" && !r.comment && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Avvik registrert uten kommentar." })
        ] }, "avvik-" + r.category + r.item)),
        projectDeviationsForReport.map((r) => {
          const isClosed = (r.status || "Åpent") === "Lukket";
          return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "checklistReportItem", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: `${isClosed ? "✅ Lukket" : "⚠️ Åpent"} HMS-/prosjektavvik – ${r.title || r.type || "Avvik"}` })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Type/status: " }), `${r.type || "Ikke oppgitt"} · ${r.severity || "Ikke oppgitt"} · ${r.status || "Åpent"}`] }),
            r.responsible && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Ansvarlig: " }), r.responsible] }),
            r.dueDate && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Frist: " }), r.dueDate] }),
            r.description && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Beskrivelse: " }), r.description] }),
            r.action && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Tiltak / oppfølging: " }), r.action] }),
            isClosed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Lukkekommentar: " }), r.closeComment || "Lukket uten egen lukkekommentar"] }),
            r.affectsWarranty && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Påvirker garanti/sluttdokumentasjon: Ja" })
          ] }, "project-avvik-" + r.id);
        })
      ] })
    ] });
  }

function BathroomEquipmentReportSection({ surf, bathroomEquipment }) {
    const groups = buildBathroomEquipmentReportGroups(surf, bathroomEquipment);
    if (!groups.length) return null;
    const categoryStyle = { border: "1px solid #bfdbfe", background: "#eff6ff", borderRadius: "12px", padding: "12px 16px", margin: "18px 0 12px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" };
    const cardStyle = { border: "1px solid #d6e2ec", background: "#fff", borderRadius: "12px", padding: "14px 16px", margin: "10px 0", breakInside: "avoid", pageBreakInside: "avoid" };
    const labelStyle = { fontSize: "12px", fontWeight: 800, color: "#64748b", margin: "0 0 3px" };
    const valueStyle = { fontSize: "14px", fontWeight: 700, color: "#0f172a", margin: "0 0 8px" };
    const linkWrapStyle = { display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" };
    const linkStyle = { display: "inline-block", border: "1px solid #bfdbfe", background: "#eff6ff", borderRadius: "999px", padding: "5px 10px", fontWeight: 800, textDecoration: "none" };
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Overflater og innredning" }),
      groups.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: categoryStyle, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { style: { margin: 0 }, children: group.title }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { style: { fontSize: "12px", color: "#475569", fontWeight: 700 }, children: [
            (group.items || []).length,
            " punkt"
          ] })
        ] }),
        (group.items || []).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: cardStyle, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { style: { margin: "0 0 10px", fontSize: "16px" }, children: item.title }),
          (item.entries || []).map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: labelStyle, children: label }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: valueStyle, children: value || "Ikke oppgitt" })
          ] }, label)),
          (item.links || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: linkWrapStyle, children: item.links.map((link) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfSafeLink, { href: link.url, style: linkStyle, children: link.label }, link.label)) })
        ] }, item.title))
      ] }, group.title))
    ] });
  }

  const parseContractAmount = (value) => {
    const cleaned = String(value ?? "").replace(/\s/g, "").replace(",", ".").replace(/[^\d.-]/g, "");
    const number = Number(cleaned);
    return Number.isFinite(number) ? Math.max(0, number) : 0;
  };
  const formatContractNok = (value) => new Intl.NumberFormat("no-NO", {
    style: "currency",
    currency: "NOK",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
  const contractTotals = (project = {}, tilbud = {}) => {
    const changes = Array.isArray(tilbud?.changes) ? tilbud.changes : [];
    const originalInclVat = Number(project?.salesOrigin?.acceptedTotal || 0) * 1.25;
    const additions = changes
      .filter((item) => item?.type === "Tillegg")
      .reduce((sum, item) => sum + parseContractAmount(item?.amountInclVat), 0);
    const deductions = changes
      .filter((item) => item?.type === "Fradrag")
      .reduce((sum, item) => sum + parseContractAmount(item?.amountInclVat), 0);
    return {
      originalInclVat,
      additions,
      deductions,
      currentInclVat: originalInclVat > 0 ? originalInclVat + additions - deductions : null
    };
  };

  function Report({ company, name, project, selected, manualProducts, other, surf, bathroomEquipment, photos, access, inst, files, checklist, tilbud, overtagelse, projectLog }) {
    const projectFields = { Prosjektansvarlig: project.responsible, Prosjektnavn: project.projectName, Adresse: project.address, "Postnr.": project.postnr, "Poststed / by": project.city, Kunde: project.customer, "Kunde e-post": project.customerEmail, "Kunde telefon": project.customerPhone, Dato: project.date, Status: project.locked ? "Avsluttet / l\xE5st" : "Aktivt", Notater: project.notes };
    const cats = [...new Set(photos.map((p) => p.cat))];
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "report", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "reportTop", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { logo: company.logoUrl, name }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: name }),
            company.address && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: company.address }),
            company.orgNumber && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
              "Org.nr: ",
              company.orgNumber
            ] }),
            company.phone && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: company.phone }),
            company.email && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: company.email }),
            company.website && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: company.website })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "FDV-rapport / Prosjektdokumentasjon" }),
        project.locked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: { fontWeight: 800, letterSpacing: "0.04em" }, children: "\u2705 FERDIGSTILT / L\xC5ST" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid, { children: Object.entries(projectFields).map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: k }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: v || "Ikke fylt ut" })
        ] }, k)) })
      ] }),
      project.projectInfoIncludeInReport && hasValue(project.projectDescription) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Prosjektinformasjon/beskrivelse" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: { whiteSpace: "pre-wrap" }, children: project.projectDescription })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Prosjektering" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Fall i dusjsone" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: project.fallDusj || "Ikke oppgitt" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Fall utenfor dusjsone / v\xE5tsone" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: project.fallUtenfor || "Ikke oppgitt" })
          ] }),
          project.fall && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Fall mot sluk" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: project.fall })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Slukplassering" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: project.sluk || "Ikke oppgitt" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Terskelh\xF8yde" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: project.terskel || "Ikke oppgitt" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Membran" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: project.membran || "Ikke oppgitt" })
          ] })
        ] }),
        (Array.isArray(project.prosjekteringPunkter) ? project.prosjekteringPunkter : []).filter((p) => hasValue(p.title) || hasValue(p.value)).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: `${p.category || "Annet"}: ${p.title || "Eget punkt"}` }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: p.value || "Ikke oppgitt" })
        ] }, p.id || p.title)),
        project.prosjekteringKommentar && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Kommentar / avvik" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: project.prosjekteringKommentar })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Produkter / FDV" }),
        selected.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: p.section }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: p.item }),
          p.comment && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Hvor brukt / kommentar:" }),
            " ",
            p.comment
          ] }),
          p.fdvUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfSafeLink, { href: p.fdvUrl, children: "\xC5pne FDV" }),
          p.databladUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfSafeLink, { href: p.databladUrl, children: "\xC5pne datablad" }),
          p.dopUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfSafeLink, { href: p.dopUrl, children: "\xC5pne DOP" }),
          p.epdUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfSafeLink, { href: p.epdUrl, children: "\xC5pne EPD" }),
          p.sikkerhetsdatabladUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfSafeLink, { href: p.sikkerhetsdatabladUrl, children: "\xC5pne sikkerhetsdatablad" }),
          p.documentFileUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfSafeLink, { href: p.documentFileUrl, children: "\xC5pne vedlagt dokument" })
        ] }, p.item)),
        (manualProducts || []).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: p.section || "Annet produkt" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: p.name || "Uten produktnavn" }),
          p.comment && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Hvor brukt / kommentar:" }),
            " ",
            p.comment
          ] }),
          p.fdvUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfSafeLink, { href: p.fdvUrl, children: "\xC5pne FDV" }),
          p.databladUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfSafeLink, { href: p.databladUrl, children: "\xC5pne datablad" }),
          p.dopUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfSafeLink, { href: p.dopUrl, children: "\xC5pne DOP" }),
          p.epdUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfSafeLink, { href: p.epdUrl, children: "\xC5pne EPD" }),
          p.sikkerhetsdatabladUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfSafeLink, { href: p.sikkerhetsdatabladUrl, children: "\xC5pne sikkerhetsdatablad" }),
          p.documentFileUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfSafeLink, { href: p.documentFileUrl, children: "\xC5pne vedlagt dokument" })
        ] }, p.id)),
        Object.entries(other).filter(([, v]) => v).map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
            "Tidligere registrert annet produkt under ",
            k,
            ":"
          ] }),
          " ",
          v
        ] }, k))
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BathroomEquipmentReportSection, { surf, bathroomEquipment }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Bildedokumentasjon" }),
        cats.map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: cat }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "photos reportPhotos", children: photos.filter((p) => p.cat === cat).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "photo", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: p.url }),
            p.comment && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: p.comment })
          ] }, p.id)) })
        ] }, cat))
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Fag, deler og utstyr" }),
        inst.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
            i.category,
            ":"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
            i.name,
            " ",
            i.qty && `\xB7 ${i.qty}`,
            " ",
            i.supplier && `\xB7 ${i.supplier}`,
            " ",
            i.desc && ` \u2014 ${i.desc}`
          ] }),
          i.fdvUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfSafeLink, { href: i.fdvUrl, children: "\xC5pne FDV/datablad" }),
          (i.photos || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "photos reportPhotos", children: i.photos.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "photo", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: p.url, alt: p.name || i.name || "Bilde" }),
            p.name && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: p.name })
          ] }, p.id || p.url)) })
        ] }, i.id))
      ] }),
      projectLog?.enabled && (projectLog.messages || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Chat" }),
        (projectLog.messages || []).map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: m.by || "Ukjent" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: m.created ? new Date(m.created).toLocaleString("no-NO") : "" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: m.text }),
          m.imageUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "photos reportPhotos", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "photo", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: m.imageUrl, alt: m.imageName || "Chat bilde" }),
            m.imageName && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: m.imageName })
          ] }) })
        ] }, m.id))
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChecklistReportSection, { checklist, projectDeviations: project?.projectDeviations || [] }),
      tilbud?.enabled && (hasValue(tilbud.tillegg) || hasValue(tilbud.fradrag) || hasValue(tilbud.kommentar) || (tilbud.files || []).length > 0 || (tilbud.changes || []).length > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Tilbud / kontrakt" }),
        agreementTotals.originalInclVat > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Opprinnelig avtalesum inkl. mva.", value: formatContractNok(agreementTotals.originalInclVat) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Tillegg inkl. mva.", value: agreementTotals.additions > 0 ? `+ ${formatContractNok(agreementTotals.additions)}` : "" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Fradrag inkl. mva.", value: agreementTotals.deductions > 0 ? `− ${formatContractNok(agreementTotals.deductions)}` : "" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Gjeldende avtalesum inkl. mva.", value: formatContractNok(agreementTotals.currentInclVat) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Registrerte tillegg", value: tilbud.tillegg }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Registrerte fradrag", value: tilbud.fradrag }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Annen avtaleendring / kommentar", value: tilbud.kommentar })
        ] }),
        (tilbud.files || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Vedlegg" }),
          (tilbud.files || []).map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: f.url, target: "_blank", rel: "noopener noreferrer", children: f.name }) }, f.id))
        ] })
      ] }),
      projectHasOvertagelse(overtagelse) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Overtagelse" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Dato", value: overtagelse.dato }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Kommentar / merknader", value: overtagelse.kommentar }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignatureCard, { label: "Signatur utf\xF8rende", name: overtagelse.signUtf\u00F8rende, image: overtagelse.signUtf\u00F8rendeImage }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignatureCard, { label: "Signatur kunde", name: overtagelse.signKunde, image: overtagelse.signKundeImage })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Sjekklister og vedlegg" }),
        files.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: f.name }, f.id))
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Prosjekttilgang" }),
        access.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
          a.name || a.email,
          " \u2014 ",
          a.role
        ] }, a.id))
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", { children: [
  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "© 2026 Expo Proffsenter – Expo ProffDok" }),
  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "Alle rettigheter forbeholdt." })
] })
    ] });
  }


  function CustomerReport({ company, name, project, selected, manualProducts, other, surf, bathroomEquipment, photos, inst, files, checklist, tilbud, overtagelse, projectLog }) {
    const projectFields = [
      ["Prosjektansvarlig", project.responsible],
      ["Prosjektnavn", project.projectName],
      ["Adresse", project.address],
      ["Postnr.", project.postnr],
      ["Poststed / by", project.city],
      ["Kunde", project.customer],
      ["Kunde e-post", project.customerEmail],
      ["Kunde telefon", project.customerPhone],
      ["Dato", project.date],
      ["Status", project.locked ? "Avsluttet / l\xE5st" : "Aktivt"],
      ["Notater", project.notes]
    ];
    const prosjektering = [
      ["Fall i dusjsone", project.fallDusj],
      ["Fall utenfor dusjsone / v\xE5tsone", project.fallUtenfor],
      ...hasValue(project.fall) ? [["Fall mot sluk", project.fall]] : [],
      ["Slukplassering", project.sluk],
      ["Terskelh\xF8yde", project.terskel],
      ["Membranl\xF8sning", project.membran],
      ...(Array.isArray(project.prosjekteringPunkter) ? project.prosjekteringPunkter : []).filter((p) => hasValue(p.title) || hasValue(p.value)).map((p) => [`${p.category || "Annet"}: ${p.title || "Eget punkt"}`, p.value]),
      ["Kommentar / avvik", project.prosjekteringKommentar]
    ];
    const surfaceRows = Object.entries(surf || {}).filter(([, v]) => hasValue(v));
    const otherRows = Object.entries(other || {}).filter(([, v]) => hasValue(v));
    const photoCats = [...new Set((photos || []).map((p) => p.cat).filter(Boolean))];
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "report", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "reportTop", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { logo: company.logoUrl, name }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: project.projectName || "FDV-rapport / Prosjektdokumentasjon" }),
            project.address && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: project.address }),
            project.customer && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Kunde:" }),
              " ",
              project.customer
            ] }),
            company.companyName && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Utf\xF8rende:" }),
              " ",
              company.companyName
            ] }),
            company.orgNumber && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
              "Org.nr: ",
              company.orgNumber
            ] })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Prosjektinformasjon" }),
        project.locked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: { fontWeight: 800, letterSpacing: "0.04em" }, children: "\u2705 FERDIGSTILT / L\xC5ST" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid, { children: projectFields.map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label, value }, label)) })
      ] }),
      project.projectInfoIncludeInReport && hasValue(project.projectDescription) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Prosjektinformasjon/beskrivelse" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: { whiteSpace: "pre-wrap" }, children: project.projectDescription })
      ] }),
      prosjektering.some(([, v]) => hasValue(v)) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Prosjektering" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid, { children: prosjektering.map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label, value }, label)) })
      ] }),
      (selected.length > 0 || (manualProducts || []).length > 0 || otherRows.length > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Produkter / FDV" }),
        selected.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: p.section }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: p.item }),
          p.comment && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Hvor brukt / kommentar:" }),
            " ",
            p.comment
          ] }),
          p.fdvUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfSafeLink, { href: p.fdvUrl, children: "\xC5pne FDV/datablad" })
        ] }, p.item)),
        (manualProducts || []).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: p.section || "Annet produkt" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: p.name || "Uten produktnavn" }),
          p.comment && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Hvor brukt / kommentar:" }),
            " ",
            p.comment
          ] }),
          p.fdvUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfSafeLink, { href: p.fdvUrl, children: "\xC5pne FDV/datablad" })
        ] }, p.id)),
        otherRows.map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
            "Tidligere registrert annet produkt under ",
            k,
            ":"
          ] }),
          " ",
          v
        ] }, k))
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BathroomEquipmentReportSection, { surf, bathroomEquipment }),
      (photos || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Bildedokumentasjon" }),
        photoCats.map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: cat }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "photos reportPhotos", children: photos.filter((p) => p.cat === cat).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "photo", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: p.url, alt: p.cat || "Dokumentasjonsbilde" }),
            p.comment && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: p.comment })
          ] }, p.id)) })
        ] }, cat))
      ] }),
      (inst || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Fag, deler og utstyr" }),
        inst.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: i.category || "Post" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: [i.name, i.qty, i.supplier, i.desc].filter(Boolean).join(" \xB7 ") }),
          i.fdvUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfSafeLink, { href: i.fdvUrl, children: "\xC5pne FDV/datablad" }),
          (i.photos || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "photos reportPhotos", children: i.photos.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "photo", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: p.url, alt: p.name || "Bilde" }) }, p.id)) })
        ] }, i.id))
      ] }),
      (hasValue(tilbud?.tillegg) || hasValue(tilbud?.fradrag) || hasValue(tilbud?.kommentar) || (tilbud?.files || []).length > 0 || (tilbud?.changes || []).length > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { id: "kunde-tilbud", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Tilbud / kontrakt" }),
        agreementTotals.originalInclVat > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Opprinnelig avtalesum inkl. mva.", value: formatContractNok(agreementTotals.originalInclVat) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Tillegg inkl. mva.", value: agreementTotals.additions > 0 ? `+ ${formatContractNok(agreementTotals.additions)}` : "" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Fradrag inkl. mva.", value: agreementTotals.deductions > 0 ? `− ${formatContractNok(agreementTotals.deductions)}` : "" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Gjeldende avtalesum inkl. mva.", value: formatContractNok(agreementTotals.currentInclVat) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Registrerte tillegg", value: tilbud.tillegg }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Registrerte fradrag", value: tilbud.fradrag }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Annen avtaleendring / kommentar", value: tilbud.kommentar })
        ] }),
        (tilbud.files || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Vedlegg" }),
          (tilbud.files || []).map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: f.url, target: "_blank", rel: "noopener noreferrer", children: f.name }) }, f.id))
        ] })
      ] }),
      projectHasOvertagelse(overtagelse) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Overtagelse" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Dato", value: overtagelse.dato }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Kommentar / merknader", value: overtagelse.kommentar }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignatureCard, { label: "Signatur utf\xF8rende", name: overtagelse.signUtf\u00F8rende, image: overtagelse.signUtf\u00F8rendeImage }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignatureCard, { label: "Signatur kunde", name: overtagelse.signKunde, image: overtagelse.signKundeImage })
        ] })
      ] }),
      projectLog?.enabled && (projectLog.messages || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Chat" }),
        (projectLog.messages || []).map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: m.by || "Ukjent" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: m.created ? new Date(m.created).toLocaleString("no-NO") : "" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: m.text }),
          m.imageUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "photos reportPhotos", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "photo", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: m.imageUrl, alt: m.imageName || "Chat bilde" }),
            m.imageName && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: m.imageName })
          ] }) })
        ] }, m.id))
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChecklistReportSection, { checklist, projectDeviations: project?.projectDeviations || [] }),
      (files || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Sjekklister og vedlegg" }),
        files.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: f.name }, f.id))
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", { children: "Levert av Expo Proffsenter" })
    ] });
  }

  return { Report, CustomerReport };
}
