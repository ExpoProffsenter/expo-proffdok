import { progressRpc, progressDate } from "./boligProgressClient.js";
import { getAppSupabaseClient } from "../access/appSupabaseClientRegistry.js";
import { loadCompanyLogo } from "../report/kshmsExecutionReport.mjs";
const clean = (v) =>
  String(v ?? "")
    .normalize("NFC")
    .replace(/[–—]/g, "-")
    .replace(/[\x00-\x1f]/g, " ")
    .replace(/[\u{1F000}-\u{1FAFF}\u2600-\u27BF\uFE0F\u200D]/gu, "");
export async function residentNoticeProfile(context) {
  const { data, error } = await getAppSupabaseClient().rpc(
    "work_profile_company_profile",
    { p_company_id: context.company_id },
  );
  if (error || data?.companyId !== context.company_id)
    throw Error("Firmaprofilen kunne ikke bekreftes.");
  return data;
}
export function buildResidentNoticePdf(
  JsPDF,
  {
    project,
    notice,
    task = {},
    contact,
    profile = {},
    logo = null,
    now = new Date(),
    audienceUnits = [],
  },
) {
  const doc = new JsPDF({ unit: "mm", format: "a4", compress: true });
  let y;
  const head = () => {
    doc.setFillColor(21, 92, 81);
    doc.rect(0, 0, 210, 5, "F");
    doc.setFillColor(241, 246, 241);
    doc.rect(0, 5, 210, 41, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(21, 72, 62);
    doc.text(
      clean(profile.companyName || "Expo ProffDok").slice(0, 65),
      20,
      23,
    );
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("INFORMASJON TIL BEBOERNE", 20, 33);
    if (logo) {
      const p = doc.getImageProperties(logo);
      const scale = Math.min(40 / p.width, 24 / p.height);
      doc.addImage(
        logo,
        170 - p.width * scale,
        13,
        p.width * scale,
        p.height * scale,
      );
    }
    y = 59;
  };
  const para = (value, size = 12, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(24, 59, 64);
    // Preserve paragraphs; avoid leaking resident names or mail addresses into shared posters.
    for (const block of String(value ?? "").split(/\r?\n/)) {
      for (const line of doc.splitTextToSize(clean(block), 170)) {
        if (y + size * 0.6 > 270) {
          doc.addPage();
          head();
          doc.setFont("helvetica", bold ? "bold" : "normal");
          doc.setFontSize(size);
        }
        doc.text(line, 20, y);
        y += size * 0.52;
      }
    }
    y += 5;
  };
  head();
  para("Beboervarsel", 25, true);
  if (!notice.paper_ready && !(notice.valid && notice.current))
    para("UTKAST - ikke ferdigstilt", 10, true);
  else if (!notice.group_id) para("Godkjent varsel - papirutgave", 10, true);
  para(project, 12, true);
  para(
    notice.audience_label ||
      `Bolig ${task.unit_number} | ${task.address || "Adresse er ikke registrert"}`,
    12,
  );
  if (
    notice.audience_label?.includes("valgte boliger") &&
    audienceUnits.length
  ) {
    const byAddress = new Map();
    for (const u of audienceUnits) {
      const a = u.address || "Adresse ikke registrert";
      byAddress.set(a, [...(byAddress.get(a) || []), u.unit_number]);
    }
    for (const [address, numbers] of byAddress)
      para(`${address}: ${numbers.join(", ")}`, 10);
  }
  y += 3;
  para(notice.title, 20, true);
  para(
    `${progressDate(notice.planned_start)} - ${progressDate(notice.planned_end)}`,
    13,
    true,
  );
  doc.setDrawColor(211, 224, 215);
  doc.line(20, y, 190, y);
  y += 10;
  para(notice.body);
  y += 4;
  para("Spørsmål? Ta kontakt", 13, true);
  para(contact.name, 11, true);
  para([contact.phone, contact.email].filter(Boolean).join(" | "), 11);
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setDrawColor(211, 224, 215);
    doc.line(20, 280, 190, 280);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(90, 115, 104);
    doc.text(
      clean(profile.companyName || "Expo ProffDok").slice(0, 65),
      20,
      287,
    );
    doc.text(
      `${now.toLocaleDateString("nb-NO", { timeZone: "Europe/Oslo" })} | Side ${p} av ${pages}`,
      190,
      287,
      { align: "right" },
    );
  }
  return doc;
}
export async function downloadResidentNotice({
  context,
  root,
  unit,
  notice,
  notices = [notice],
  contact,
  isCurrent = () => true,
  loadPdf = () => import("https://esm.sh/jspdf@2.5.1"),
  loadProfile = residentNoticeProfile,
  loadLogo = loadCompanyLogo,
}) {
  if (
    contact.name.trim().length < 2 ||
    !(contact.phone.trim() || contact.email.trim())
  )
    throw Error("Oppgi kontaktperson og telefon eller e-post til prosjektet.");
  const read = async () => {
    const s = await progressRpc(context, root.id, unit?.id);
    if (!isCurrent()) return null;
    const found = notices.map((expected) =>
      s.notices.find((n) => n.id === expected.id),
    );
    for (let i = 0; i < found.length; i++) {
      const n = found[i],
        expected = notices[i];
      const t = s.tasks.find((t) => t.id === n?.task_id);
      if (
        !n ||
        n.withdrawn ||
        !n.current ||
        n.basis !== expected.basis ||
        n.valid !== expected.valid ||
        (n.task_id && (!t?.active || t.archived))
      )
        throw Error(
          "Plan, varsel eller kontakt er endret. Oppdater oversikten før du lager PDF.",
        );
    }
    if (!found.length) throw Error("Velg minst ett varsel.");
    return {
      notice: found[0],
      task: s.tasks.find((t) => t.id === found[0].task_id),
      audienceUnits: found,
    };
  };
  if (!(await read())) return;
  const profile = await loadProfile(context);
  if (!isCurrent()) return;
  const engine = await loadPdf();
  if (!isCurrent()) return;
  const logo = profile.logoUrl ? await loadLogo(profile.logoUrl) : null;
  if (!isCurrent()) return;
  if (profile.logoUrl && !logo)
    throw Error("Firmalogoen kunne ikke lastes. Prøv igjen før du lager PDF.");
  const state = await read();
  if (!state) return;
  const doc = buildResidentNoticePdf(engine.jsPDF || engine.default?.jsPDF, {
    project: root.title,
    ...state,
    contact,
    profile,
    logo,
  });
  if (!isCurrent()) return;
  doc.save(
    `Beboervarsel-${notice.audience_label || state.task?.unit_number || root.title}`
      .replace(/[\\/:*?"<>|\x00-\x1f]/g, "-")
      .slice(0, 100) + ".pdf",
  );
  return doc;
}
