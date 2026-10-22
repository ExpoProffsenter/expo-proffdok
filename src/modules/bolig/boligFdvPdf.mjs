import { qualityRpc } from "./boligQualityClient.js";
import { getAppSupabaseClient } from "../access/appSupabaseClientRegistry.js";
import { loadCompanyLogo } from "../report/kshmsExecutionReport.mjs";
const safe = (value) =>
  String(value ?? "")
    .normalize("NFC")
    .replace(/[–—]/g, "-")
    .replace(/[\x00-\x1f]/g, " ")
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\uFE0F\u200D]/gu, "");
export function buildBoligFdvPdf(
  JsPDF,
  state,
  profile,
  { logo = null, now = new Date(), document: existingDocument = null } = {},
) {
  const doc =
    existingDocument || new JsPDF({ unit: "mm", format: "a4", compress: true });
  if (existingDocument) doc.addPage();
  let y = 18;
  const text = (value, size = 10, bold = false, color = [30, 41, 59]) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...color);
    return doc.splitTextToSize(safe(value), 174);
  };
  const header = () => {
    doc.setFillColor(15, 51, 57);
    doc.rect(0, 0, 210, 6, "F");
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text(safe(profile.companyName || "Expo ProffDok"), 18, 14);
    y = 24;
  };
  const space = (h) => {
    if (y + h > 275) {
      doc.addPage();
      header();
    }
  };
  const paragraph = (value, size = 10, bold = false, color) => {
    for (const line of text(value, size, bold, color)) {
      space(size * 0.5 + 1);
      doc.text(line, 18, y);
      y += size * 0.5;
    }
    y += 3;
  };
  const section = (label) => {
    space(48);
    y += 3;
    doc.setFillColor(230, 242, 242);
    doc.rect(16, y - 4, 178, 10, "F");
    paragraph(label, 11, true);
    y += 2;
  };
  header();
  if (logo) {
    try {
      const p = doc.getImageProperties(logo),
        w = Math.min(40, (14 * p.width) / p.height);
      doc.addImage(logo, 154, 19, w, (w * p.height) / p.width);
      y = 39;
    } catch {
      y = 28;
    }
  }
  paragraph("FDV-oversikt", 22, true, [15, 84, 88]);
  paragraph(state.title, 14, true);
  paragraph("Kontrollgrunnlag fra lagrede varevalg", 10, true);
  paragraph(
    "Oversikten viser siste lagrede varevalg. Kontroller at varene er montert som angitt før den brukes ved overlevering. Dokumentene bak eksterne lenker er ikke vedlagt denne PDF-en.",
  );
  paragraph(
    `Laget ${now.toLocaleString("nb-NO", { timeZone: "Europe/Oslo" })} · Dokumentrevisjon ${state.revision}`,
    9,
  );
  paragraph(`Grunnlagskontroll: ${state.basis}`, 8);
  const missing = state.fdv.filter((g) => !g.fdv_url).length;
  paragraph(
    `${state.fdv.length} varelinjer · ${missing} mangler FDV-lenke`,
    11,
    true,
    missing ? [153, 72, 0] : [15, 84, 88],
  );
  let last = "";
  for (const g of state.fdv) {
    const scope = `${g.block} · ${g.unit}`;
    if (scope !== last) {
      section(scope);
      last = scope;
    }
    space(32);
    paragraph(g.name, 11, true);
    paragraph(
      [
        g.room,
        g.sku && `Varenr. ${g.sku}`,
        `${g.quantity} ${g.unit_name}`,
        `Varevalg v${g.choice_revision}`,
      ]
        .filter(Boolean)
        .join(" · "),
      9,
    );
    if (g.fdv_url && /^https:\/\//i.test(g.fdv_url)) {
      space(7);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(0, 105, 115);
      doc.textWithLink("Åpne FDV-dokument", 18, y, { url: g.fdv_url });
      y += 7;
      paragraph(g.fdv_url, 8, false, [0, 92, 101]);
      if (g.corrected)
        paragraph(
          "Dokumentlenken er korrigert i boligens dokumentasjon. Opprinnelig varevalg er beholdt.",
          8,
        );
    } else
      paragraph(
        "FDV-lenke mangler - må avklares før overlevering.",
        10,
        true,
        [153, 72, 0],
      );
    doc.setDrawColor(203, 213, 225);
    doc.line(18, y, 192, y);
    y += 7;
  }
  const files =
    state.fdv_documents || state.data.documents.filter((f) => f.kind === "fdv");
  if (files.length) {
    section("Registrerte FDV-filer");
    paragraph(
      "Filene følger ikke PDF-en. Åpne originalene under Filer og bilder i det aktuelle arbeidsområdet.",
    );
    for (const f of files)
      paragraph(
        `${f.scope_title ? f.scope_title + " · " : ""}${f.title} (${f.name})`,
        10,
      );
  }
  const pages = doc.internal.getNumberOfPages();
  for (let n = 1; n <= pages; n++) {
    doc.setPage(n);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text("Expo ProffDok · FDV-oversikt", 18, 287);
    doc.text(`Side ${n} av ${pages}`, 192, 287, { align: "right" });
  }
  return doc;
}
export async function downloadBoligFdv({
  context,
  rootId,
  scopeId,
  expected,
  isCurrent = () => true,
  loadPdf = () => import("https://esm.sh/jspdf@2.5.1"),
  loadLogo = loadCompanyLogo,
}) {
  const read = async () => {
    const s = await qualityRpc(context, rootId, scopeId);
    if (!isCurrent()) return null;
    if (s.basis !== expected.basis || s.revision !== expected.revision)
      throw Error(
        "FDV-grunnlaget er endret. Oppdater oversikten og se over varene før du laster ned.",
      );
    return s;
  };
  let state = await read();
  if (!state) return;
  const { data: profile, error } = await getAppSupabaseClient().rpc(
    "work_profile_company_profile",
    { p_company_id: context.company_id },
  );
  if (error || profile?.companyId !== context.company_id)
    throw Error("Firmaprofilen kunne ikke bekreftes.");
  if (!isCurrent()) return;
  const engine = await loadPdf();
  if (!isCurrent()) return;
  const JsPDF = engine.jsPDF || engine.default?.jsPDF;
  const logo = profile.logoUrl ? await loadLogo(profile.logoUrl) : null;
  if (!isCurrent()) return;
  state = await read();
  if (!state) return;
  const doc = buildBoligFdvPdf(JsPDF, state, profile, { logo });
  if (!isCurrent()) return;
  doc.save(
    ("FDV - " + state.title)
      .replace(/[\\/:*?"<>|\x00-\x1f]/g, "-")
      .slice(0, 100) + ".pdf",
  );
  return doc;
}
