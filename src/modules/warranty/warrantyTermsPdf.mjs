// Shared by the native WarrantyPanel download and isolated PDF QA. No persistence.
export function renderWarrantyTermsPdf({ doc, warrantyYears, project = {}, name, company = {}, selectedSystem, warranty = {} }) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18, bottom = pageHeight - 22, contentWidth = pageWidth - margin * 2;
  let y = 25;
  const paintPage = () => {
    doc.setDrawColor(210, 221, 226); doc.setLineWidth(0.3);
    doc.line(margin, 16, pageWidth - margin, 16);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(70, 87, 97);
    doc.text('Expo ProffDok | Garantivilkår', margin, 12);
  };
  const nextPage = () => { doc.addPage(); paintPage(); y = 25; };
  const ensure = height => { if (y + height > bottom) nextPage(); };
  const rows = (text, size, bold) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal'); doc.setFontSize(size);
    return doc.splitTextToSize(String(text || ''), contentWidth);
  };
  const write = (text, size, bold, color, gap) => {
    const lines = rows(text, size, bold), lineHeight = size * 0.352778 * 1.35;
    for (const line of lines) {
      ensure(lineHeight);
      doc.setFont('helvetica', bold ? 'bold' : 'normal'); doc.setFontSize(size); doc.setTextColor(...color);
      doc.text(line, margin, y); y += lineHeight;
    }
    y += gap;
  };
  const addTitle = (text, size = 18) => { ensure(rows(text, size, true).length * size * 0.352778 * 1.35 + 10); write(text, size, true, [15, 34, 45], size === 18 ? 6 : 3); };
  const addText = (text, opts = {}) => write(text, opts.size || 10, !!opts.bold, [31, 41, 55], 4);
  const addSection = (heading, body) => { ensure(rows(heading, 12, true).length * 5.72 + 16); addTitle(heading, 12); addText(body); };
  paintPage();
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
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i); doc.setDrawColor(210,221,226); doc.line(margin,pageHeight-16,pageWidth-margin,pageHeight-16);
    doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(70,87,97);
    doc.text(`Expo ProffDok · Garantivilkår ${warrantyYears} år`, margin, pageHeight-10);
    doc.text(`${i}/${pageCount}`,pageWidth-margin,pageHeight-10,{align:'right'});
  }
  return doc;
}
