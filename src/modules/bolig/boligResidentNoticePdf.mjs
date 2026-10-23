import { progressRpc, progressDate } from "./boligProgressClient.js";
const clean = (v) =>
  String(v ?? "")
    .normalize("NFC")
    .replace(/[–—]/g, "-")
    .replace(/[\x00-\x1f]/g, " ")
    .replace(/[\u{1F000}-\u{1FAFF}\u2600-\u27BF\uFE0F\u200D]/gu, "");
export function buildResidentNoticePdf(
  JsPDF,
  { project, notice, task, contact, now = new Date() },
) {
  const doc = new JsPDF({ unit: "mm", format: "a4", compress: true });
  let y = 28;
  const head = () => {
    doc.setFillColor(15, 51, 57);
    doc.rect(0, 0, 210, 7, "F");
  };
  const para = (value, size = 12, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(25, 42, 50);
    for (const line of doc.splitTextToSize(clean(value), 170)) {
      if (y + size * 0.6 > 273) {
        doc.addPage();
        head();
        y = 24;
      }
      doc.text(line, 20, y);
      y += size * 0.55;
    }
    y += 5;
  };
  head();
  para("Beboervarsel", 26, true);
  para(
    notice.valid && notice.current
      ? "Godkjent varsel - papirutgave"
      : "UTKAST - ikke godkjent for oppslag",
    12,
    true,
  );
  para(project, 14, true);
  para(
    `Bolig ${task.unit_number} | ${task.address || "Adresse er ikke registrert"}`,
    14,
    true,
  );
  para(notice.title, 18, true);
  para(
    `Planlagt arbeid: ${progressDate(notice.planned_start)} - ${progressDate(notice.planned_end)}`,
    13,
    true,
  );
  para(notice.body);
  para("Spørsmål om arbeidet?", 14, true);
  para(contact.name);
  para([contact.phone, contact.email].filter(Boolean).join(" | "));
  para(
    `Laget ${now.toLocaleDateString("nb-NO", { timeZone: "Europe/Oslo" })}. Varselet bygger på planlagte datoer.`,
    9,
  );
  para(
    "Kontakt prosjektet ved behov for avklaring. En papirutgave dokumenterer ikke at beboeren har lest varselet.",
    9,
  );
  for (let p = 1; p <= doc.getNumberOfPages(); p++) {
    doc.setPage(p);
    doc.setFontSize(8);
    doc.text(`Expo ProffDok | Side ${p} av ${doc.getNumberOfPages()}`, 20, 287);
  }
  return doc;
}
export async function downloadResidentNotice({
  context,
  root,
  unit,
  notice,
  contact,
  isCurrent = () => true,
  loadPdf = () => import("https://esm.sh/jspdf@2.5.1"),
}) {
  if (
    contact.name.trim().length < 2 ||
    !(contact.phone.trim() || contact.email.trim())
  )
    throw Error("Oppgi kontaktperson og telefon eller e-post til prosjektet.");
  const read = async () => {
    const s = await progressRpc(context, root.id, unit?.id);
    if (!isCurrent()) return null;
    const n = s.notices.find((n) => n.id === notice.id),
      t = s.tasks.find((t) => t.id === n?.task_id);
    if (
      !n ||
      n.withdrawn ||
      !n.current ||
      n.basis !== notice.basis ||
      n.valid !== notice.valid ||
      !t?.active ||
      t.archived
    )
      throw Error(
        "Plan, varsel eller kontakt er endret. Oppdater oversikten før du lager PDF.",
      );
    return { notice: n, task: t };
  };
  if (!(await read())) return;
  const engine = await loadPdf();
  if (!isCurrent()) return;
  const state = await read();
  if (!state) return;
  const doc = buildResidentNoticePdf(engine.jsPDF || engine.default?.jsPDF, {
    project: root.title,
    ...state,
    contact,
  });
  if (!isCurrent()) return;
  doc.save(
    `Beboervarsel-${state.task.unit_number}`
      .replace(/[\\/:*?"<>|\x00-\x1f]/g, "-")
      .slice(0, 100) + ".pdf",
  );
  return doc;
}
