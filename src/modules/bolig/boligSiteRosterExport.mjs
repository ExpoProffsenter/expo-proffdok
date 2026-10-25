import { siteRosterRpc } from "./boligSiteRoster.js";
export const activeRosterPeople = (s) =>
  (s.document?.people || []).filter(
    (p) => p.starts_on <= s.day && (!p.ends_on || p.ends_on >= s.day),
  );
const clean = (x) =>
  String(x ?? "")
    .normalize("NFC")
    .replace(/[\x00-\x09\x0b-\x1f]/g, " ")
    .replace(/[–—]/g, "-");
const employer = (s, id) => s.document.employers.find((e) => e.id === id);
const companyText = (e) =>
  e
    ? `${e.name} · ${e.organisation_number || "Uten org.nr."}${!e.registration_required ? " · Ikke registreringspliktig: " + (e.exemption_reason || "begrunnelse mangler") : ""}`
    : "Mangler";
export const rosterStatus = (s) =>
  s.checked
    ? "Daglig kontroll bekreftet"
    : "UTKAST - daglig kontroll ikke bekreftet for denne versjonen";
const timestamp = (x) =>
  x
    ? new Date(x).toLocaleString("nb-NO", { timeZone: "Europe/Oslo" })
    : "Ikke bekreftet";
export function rosterCsv(s) {
  if (!s.document) throw Error("Ingen lagret oversiktsliste for denne datoen.");
  const d = s.document,
    site = d.site;
  const rows = [
    ["Elektronisk oversiktsliste", site.name],
    ["Adresse", site.address],
    ["Byggherre", site.client_name],
    ["Listefører", site.keeper_name],
    ["Prosjektdag", s.day, "Europe/Oslo"],
    ["Versjon", d.revision, "Kildedato", s.source_day || s.today],
    ["Status", rosterStatus(s)],
    ["Kontroll", d.review?.name, timestamp(d.review?.at)],
    [
      "Tidligste slettedato",
      s.retain_until || "Seks måneder etter faktisk avslutning",
    ],
    [
      "Kun lagrede opplysninger. Konfidensielt. Ingen automatisk kontroll av registre eller HMS-kort.",
    ],
    [],
    [
      "Navn",
      "Fødselsdato",
      "Arbeidsgiver / enmannsbedrift",
      "Org.nr. arbeidsgiver",
      "Registreringspliktig",
      "Begrunnelse uten registreringsplikt",
      "Arbeidsforhold",
      "Innleievirksomhet",
      "Org.nr. innleier",
      "Innleier registreringspliktig",
      "Begrunnelse innleier",
      "HMS-kortnummer",
      "Dokumentasjonsreferanse HMS-søknad",
      "Fra",
      "Til",
    ],
    ...activeRosterPeople(s).map((p) => {
      const e = employer(s, p.employer_id),
        h = employer(s, p.hirer_id);
      return [
        p.name,
        p.birth_date,
        e?.name,
        e?.organisation_number,
        e ? (e.registration_required ? "Ja" : "Nei") : "",
        e?.exemption_reason,
        {
          employed: "Ansatt",
          hired: "Innleid",
          self_employed: "Enmannsbedrift",
        }[p.employment_type],
        h?.name,
        h?.organisation_number,
        h ? (h.registration_required ? "Ja" : "Nei") : "",
        h?.exemption_reason,
        p.card_number,
        p.application_reference,
        p.starts_on,
        p.ends_on,
      ];
    }),
  ];
  // Prefix spreadsheet formulas even when preceded by whitespace/control characters.
  const cell = (x) =>
    '"' +
    String(x ?? "")
      .replace(/^(\s*[=+@-]|[\t\r\n])/u, "'$&")
      .replaceAll('"', '""') +
    '"';
  return "\ufeff" + rows.map((r) => r.map(cell).join(";")).join("\r\n");
}
export function buildSiteRosterPdf(JsPDF, s, font) {
  if (!s.document) throw Error("Ingen lagret oversiktsliste for denne datoen.");
  const doc = new JsPDF({ unit: "mm", format: "a4", compress: true });
  doc.setProperties({
    title: "Oversiktsliste ved tilsyn",
    author: s.document.company_name || "Expo ProffDok",
  });
  doc.addFileToVFS("DejaVuSans.ttf", font);
  doc.addFont("DejaVuSans.ttf", "Roster", "normal");
  doc.setFont("Roster", "normal");
  const glyphs = doc.getFont().metadata?.cmap?.unicode?.codeMap;
  let y = 24;
  const d = s.document,
    people = activeRosterPeople(s);
  const header = () => {
    doc.setFillColor(16, 67, 70);
    doc.rect(0, 0, 210, 7, "F");
    doc.setFontSize(8);
    doc.setTextColor(65, 80, 90);
    doc.text(clean(d.site.name).slice(0, 95), 17, 16);
    y = 27;
  };
  const para = (value, size = 10) => {
    if (
      glyphs &&
      Array.from(clean(value)).some(
        (c) => c !== "\n" && !glyphs[c.codePointAt(0)],
      )
    )
      throw Error(
        "PDF-skriften støtter ikke alle tegn i listen. Last ned CSV for å bevare navnene.",
      );
    doc.setFontSize(size);
    doc.setTextColor(25, 45, 55);
    const lines = doc.splitTextToSize(clean(value), 176);
    for (const line of lines) {
      if (y + size * 0.5 > 276) {
        doc.addPage();
        header();
      }
      doc.text(line, 17, y);
      y += size * 0.5;
    }
    y += 3;
  };
  header();
  para("Oversiktsliste ved tilsyn", 20);
  para(`${s.day} · Versjon ${d.revision}`, 12);
  para(rosterStatus(s), 11);
  para(
    `Byggeplass: ${d.site.name}\nAdresse: ${d.site.address}\nByggherre: ${d.site.client_name}\nListefører: ${d.site.keeper_name || "Ikke angitt"}`,
  );
  para(
    `Daglig kontroll: ${d.review?.name || "Ingen"} · ${timestamp(d.review?.at)}`,
    9,
  );
  para(
    `Grunnlag registrert ${s.source_day || s.today}. ${people.length} personer i arbeidsperioden på valgt dag.`,
    9,
  );
  para(
    `Oppbevares minst til ${s.retain_until || "seks måneder etter at bygge-/anleggsarbeidet er avsluttet"}.`,
    9,
  );
  if (s.missing.length)
    para(
      `Mangler: ${s.missing.map((m) => `${m.title}: ${m.fields.join(", ")}`).join("; ")}`,
      9,
    );
  para(
    "Kontroller opplysningene. Utfylte felt bekrefter ikke at HMS-kort eller registre er kontrollert. Dokumentasjon på søknad må kunne fremlegges.",
    9,
  );
  for (const [i, p] of people.entries()) {
    if (y > 226) {
      doc.addPage();
      header();
    }
    doc.setDrawColor(190, 209, 210);
    doc.line(17, y, 193, y);
    y += 7;
    para(`${i + 1}. ${p.name}`, 12);
    para(
      `Fødselsdato: ${p.birth_date || "Mangler"} · ${{ employed: "Ansatt", hired: "Innleid", self_employed: "Enmannsbedrift" }[p.employment_type]}`,
    );
    para(
      `Arbeidsgiver / enmannsbedrift: ${companyText(employer(s, p.employer_id))}`,
    );
    if (p.employment_type === "hired")
      para(`Innleievirksomhet: ${companyText(employer(s, p.hirer_id))}`);
    para(
      p.card_status === "applied"
        ? `HMS-kort søkt. Dokumentasjonsreferanse: ${p.application_reference || "Mangler"}`
        : `HMS-kortnummer: ${p.card_number || "Mangler"}`,
    );
    para(`Arbeidsperiode: ${p.starts_on} - ${p.ends_on || "pågående"}`, 9);
  }
  if (!people.length)
    para("Ingen personer registrert i arbeidsperioden på valgt dag.");
  const total = doc.getNumberOfPages();
  for (let page = 1; page <= total; page++) {
    doc.setPage(page);
    doc.setFontSize(8);
    doc.setTextColor(65, 80, 90);
    doc.text("Konfidensielt · Expo ProffDok · Lagrede opplysninger", 17, 288);
    doc.text(`${page} / ${total}`, 193, 288, { align: "right" });
  }
  return doc;
}
async function loadFont() {
  const res = await fetch("/bolig/fonts/DejaVuSans.ttf", {
    cache: "force-cache",
  });
  if (!res.ok) throw Error("PDF-skriften kunne ikke lastes. Prøv igjen.");
  const bytes = new Uint8Array(await res.arrayBuffer());
  let binary = "";
  for (let i = 0; i < bytes.length; i += 8192)
    binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(binary);
}
export async function downloadSiteRoster({
  context,
  rootId,
  expected,
  query = {},
  format,
  isCurrent,
  loadPdf = () => import("https://esm.sh/jspdf@2.5.1"),
  fontLoader = loadFont,
  read = siteRosterRpc,
}) {
  const verify = (s) => {
    if (!isCurrent()) return false;
    if (
      !s.document ||
      s.document.revision !== expected.document.revision ||
      s.day !== expected.day ||
      s.snapshot_id !== expected.snapshot_id ||
      s.revision !== expected.revision
    )
      throw Error("Listen er endret. Hent siste liste før du laster ned.");
    return true;
  };
  let state = await read(context, rootId, "get", query);
  if (!verify(state)) return;
  let pdf;
  if (format === "pdf") {
    const [engine, font] = await Promise.all([loadPdf(), fontLoader()]);
    if (!isCurrent()) return;
    state = await read(context, rootId, "get", query);
    if (!verify(state)) return;
    pdf = buildSiteRosterPdf(
      engine.jsPDF || engine.default?.jsPDF,
      state,
      font,
    );
  }
  if (!isCurrent()) return;
  const name = `oversiktsliste-${state.day}-v${state.document.revision}`;
  if (pdf) pdf.save(name + ".pdf");
  else {
    const url = URL.createObjectURL(
      new Blob([rosterCsv(state)], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = name + ".csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return pdf || state;
}
