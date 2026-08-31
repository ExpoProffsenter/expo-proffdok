// Expo ProffDok – FASE 33B.5
// Genererer endelig signert kontrakt-PDF direkte fra serverlåst sales_contracts-snapshot.
// PDF-en inneholder kontrakten, begge signaturer og vedlegg med akseptert tilbud/aksept.
// Ingen redigerbar Sales-state brukes som avtalegrunnlag.

import {
  AGREEMENT_CHANNELS,
  PRICE_FORMS,
  agreementChannelNeedsWithdrawalInfo,
} from "../utils/salesContractModel.js";
import {
  formatNok,
  getOfferTermsSnapshot,
  getOfferTotal,
  getVisibleOfferLines,
} from "../utils/salesUtils.js";
import { getImageNaturalSize, readFileAsDataUrl } from "./salesImages.js";

const PAGE = { width: 210, height: 297, left: 17, right: 193, bottom: 278 };
const WIDTH = PAGE.right - PAGE.left;
const COLORS = {
  ink: [18, 42, 51],
  text: [44, 72, 82],
  muted: [94, 119, 127],
  teal: [11, 157, 166],
  tealDark: [9, 116, 126],
  tealSoft: [238, 249, 250],
  green: [40, 151, 96],
  greenSoft: [237, 250, 244],
  line: [209, 226, 230],
  panel: [248, 251, 252],
  white: [255, 255, 255],
};

function clean(value = "") {
  return String(value ?? "")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\uFFFD\uFFFE]/g, "-")
    .replace(/\u00a0/g, " ")
    .replace(/\t/g, " ")
    .trim();
}

function formatDate(value = "") {
  if (!value) return "Ikke angitt";
  const parsed = new Date(`${String(value).slice(0, 10)}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return clean(value);
  return new Intl.DateTimeFormat("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed);
}

function formatDateTime(value = "") {
  if (!value) return "Ikke registrert";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return clean(value);
  return new Intl.DateTimeFormat("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

function companyProfile(snapshot = {}) {
  return {
    name: clean(snapshot.company_name || snapshot.companyName),
    org: clean(snapshot.org_number || snapshot.orgNumber),
    address: clean(snapshot.address),
    phone: clean(snapshot.phone),
    email: clean(snapshot.email),
    website: clean(snapshot.website),
    logo: clean(snapshot.logo_url || snapshot.logoUrl),
  };
}

function optionTypeLabel(option = {}) {
  if (option.optionType === "alternative") return "Alternativ / erstatter";
  return getOfferTotal([option]) < 0 ? "Fradrag / prisreduksjon" : "Tillegg / oppgradering";
}

function groupOfferLines(lines = []) {
  const groups = [];
  const map = new Map();
  for (const line of getVisibleOfferLines(Array.isArray(lines) ? lines : [])) {
    const key = clean(line.mainPostId) || clean(line.mainPostTitle) || "ovrige-arbeider";
    if (!map.has(key)) {
      const group = {
        id: key,
        title: clean(line.mainPostTitle) || "Øvrige arbeider",
        lines: [],
      };
      map.set(key, group);
      groups.push(group);
    }
    map.get(key).lines.push(line);
  }
  return groups;
}

export async function createFinalSalesContractPdf(contract = {}) {
  if (!contract?.id || contract?.status !== "signed") {
    throw new Error("Endelig PDF kan bare opprettes for signert kontrakt.");
  }

  const module = await import("https://esm.sh/jspdf@2.5.1");
  const JsPDF = module.jsPDF || module.default?.jsPDF;
  if (!JsPDF) throw new Error("PDF-verktøyet kunne ikke lastes.");

  const snapshot = contract.snapshot || {};
  const offer = snapshot.offer || {};
  const acceptance = snapshot.acceptance || {};
  const customer = snapshot.customer || {};
  const company = companyProfile(snapshot.company || {});
  const draft = snapshot.contract || {};
  const offerTerms = getOfferTermsSnapshot(Array.isArray(offer.lines) ? offer.lines : []);
  const selectedOptions = Array.isArray(acceptance.selected_options)
    ? acceptance.selected_options
    : [];
  const offerGroups = groupOfferLines(offer.lines || []);
  const requestRef = clean(contract.request_ref) || "kontrakt";
  const version = offer.version_number || "";
  const durationWeeks = Number(draft.expected_duration_weeks || 0);
  const graceDays = Math.max(0, Number(draft.daily_penalty_grace_days || 0));
  const agreementLabel =
    AGREEMENT_CHANNELS.find((item) => item.value === draft.agreement_channel)?.label ||
    "Ikke valgt";
  const priceLabel =
    PRICE_FORMS.find((item) => item.value === draft.price_form)?.label ||
    "Ikke valgt";
  const totalInclVat = Number(
    draft.price_incl_vat || Number(offer.total_ex_vat || 0) * 1.25 || 0
  );

  const pdf = new JsPDF({ unit: "mm", format: "a4" });
  let y = 19;
  let section = 0;

  const font = (size = 9, style = "normal", color = COLORS.text) => {
    pdf.setFont("helvetica", style);
    pdf.setFontSize(size);
    pdf.setTextColor(...color);
  };

  const continuationHeader = (label = "Signert forbrukerkontrakt") => {
    pdf.setFillColor(...COLORS.white);
    pdf.rect(0, 0, PAGE.width, 14, "F");
    pdf.setDrawColor(...COLORS.line);
    pdf.line(PAGE.left, 13, PAGE.right, 13);
    font(8.2, "bold", COLORS.ink);
    pdf.text(label, PAGE.left, 8.5);
    font(7.6, "normal", COLORS.muted);
    pdf.text(
      `${requestRef}${version ? ` - tilbud v${version}` : ""}`,
      PAGE.right,
      8.5,
      { align: "right" }
    );
    y = 20;
  };

  const newPage = (label) => {
    pdf.addPage();
    continuationHeader(label);
  };

  const ensure = (height = 10, label) => {
    if (y + height <= PAGE.bottom) return false;
    newPage(label);
    return true;
  };

  const sectionTitle = (label, note = "", minFollowing = 24) => {
    const height = note ? 19 : 15;
    ensure(height + minFollowing);
    const number = String(++section).padStart(2, "0");
    pdf.setFillColor(...COLORS.tealSoft);
    pdf.setDrawColor(...COLORS.line);
    pdf.roundedRect(PAGE.left, y, WIDTH, height, 2.5, 2.5, "FD");
    pdf.setFillColor(...COLORS.teal);
    pdf.circle(PAGE.left + 8, y + 7.5, 4.6, "F");
    font(7.7, "bold", COLORS.white);
    pdf.text(number, PAGE.left + 8, y + 8.3, { align: "center" });
    font(12.1, "bold", COLORS.ink);
    pdf.text(clean(label), PAGE.left + 16, y + 8.6);
    if (note) {
      font(7.4, "normal", COLORS.muted);
      const rows = pdf.splitTextToSize(clean(note), 66);
      pdf.text(rows.slice(0, 2), PAGE.right - 3, y + 5.4, { align: "right" });
    }
    y += height + 4;
  };

  const textCard = (label, text) => {
    const paragraphs = String(text ?? "")
      .replace(/\r/g, "")
      .split(/\n+/)
      .map(clean)
      .filter(Boolean);
    if (!paragraphs.length) return;

    let first = true;
    for (const paragraph of paragraphs) {
      font(8.5, "normal", COLORS.text);
      const rows = pdf.splitTextToSize(paragraph, WIDTH - 14);
      let index = 0;
      while (index < rows.length) {
        if (PAGE.bottom - y < 25) newPage();
        const availableRows = Math.max(1, Math.floor((PAGE.bottom - y - 14) / 4.4));
        const chunk = rows.slice(index, index + availableRows);
        const height = 12 + chunk.length * 4.4;
        pdf.setFillColor(...COLORS.panel);
        pdf.setDrawColor(...COLORS.line);
        pdf.roundedRect(PAGE.left, y, WIDTH, height, 2.5, 2.5, "FD");
        font(9.5, "bold", COLORS.ink);
        pdf.text(first ? clean(label) : `${clean(label)} (forts.)`, PAGE.left + 5, y + 6.5);
        font(8.5, "normal", COLORS.text);
        pdf.text(chunk, PAGE.left + 5, y + 12);
        y += height + 3;
        index += chunk.length;
        first = false;
      }
    }
  };

  const paragraph = (text, { boldPrefix = "" } = {}) => {
    if (!clean(text)) return;
    font(8.6, "normal", COLORS.text);
    const rows = pdf.splitTextToSize(clean(text), WIDTH - 10);
    const height = rows.length * 4.5 + 2;
    ensure(height + 2);
    if (boldPrefix && clean(text).startsWith(boldPrefix)) {
      font(8.6, "bold", COLORS.ink);
    }
    pdf.text(rows, PAGE.left + 5, y + 3.5);
    y += height + 2;
  };

  const summaryGrid = (items = [], columns = 2) => {
    const gap = 4;
    const colWidth = (WIDTH - gap * (columns - 1)) / columns;
    let index = 0;
    while (index < items.length) {
      ensure(17);
      const rowItems = items.slice(index, index + columns);
      const rowTop = y;
      rowItems.forEach((item, col) => {
        const x = PAGE.left + col * (colWidth + gap);
        pdf.setFillColor(...COLORS.panel);
        pdf.setDrawColor(...COLORS.line);
        pdf.roundedRect(x, rowTop, colWidth, 13, 2, 2, "FD");
        font(6.5, "bold", COLORS.muted);
        pdf.text(clean(item.label).toUpperCase(), x + 4, rowTop + 4);
        font(item.strong ? 9.2 : 8.2, "bold", item.strong ? COLORS.tealDark : COLORS.ink);
        const value = pdf.splitTextToSize(clean(item.value) || "Ikke registrert", colWidth - 8);
        pdf.text(value.slice(0, 2), x + 4, rowTop + 8.8);
      });
      y += 17;
      index += columns;
    }
  };

  const signatureBox = (label, name, at) => {
    ensure(24);
    pdf.setFillColor(...COLORS.greenSoft);
    pdf.setDrawColor(...COLORS.green);
    pdf.roundedRect(PAGE.left, y, WIDTH, 19, 2.5, 2.5, "FD");
    font(7.1, "bold", COLORS.green);
    pdf.text(clean(label).toUpperCase(), PAGE.left + 5, y + 5.3);
    font(10, "bold", COLORS.ink);
    pdf.text(clean(name) || "Ikke registrert", PAGE.left + 5, y + 11);
    font(7.5, "normal", COLORS.muted);
    pdf.text(formatDateTime(at), PAGE.right - 5, y + 11, { align: "right" });
    y += 23;
  };

  const loadLogo = async () => {
    if (!company.logo) return null;
    try {
      const response = await fetch(company.logo, { cache: "force-cache" });
      if (!response.ok) return null;
      const blob = await response.blob();
      const dataUrl = await readFileAsDataUrl(blob, "Firmalogo kunne ikke leses");
      const size = await getImageNaturalSize(dataUrl, "Firmalogo har ugyldig format");
      return { dataUrl, type: blob.type.includes("png") ? "PNG" : "JPEG", size };
    } catch {
      return null;
    }
  };

  const hero = async () => {
    pdf.setFillColor(...COLORS.white);
    pdf.rect(0, 0, PAGE.width, 65, "F");
    pdf.setFillColor(...COLORS.tealDark);
    pdf.rect(0, 0, 5, 65, "F");
    pdf.setDrawColor(...COLORS.line);
    pdf.line(PAGE.left, 64, PAGE.right, 64);

    pdf.setFillColor(...COLORS.greenSoft);
    pdf.roundedRect(PAGE.left, 11, 37, 7, 3.5, 3.5, "F");
    font(7, "bold", COLORS.green);
    pdf.text("SIGNERT KONTRAKT", PAGE.left + 18.5, 15.6, { align: "center" });

    font(18.5, "bold", COLORS.ink);
    pdf.text("Forbrukerkontrakt", PAGE.left, 30);
    font(10.5, "bold", COLORS.text);
    pdf.text(pdf.splitTextToSize(clean(offer.title) || "Håndverkertjenester", 112).slice(0, 2), PAGE.left, 39);
    font(7.7, "normal", COLORS.muted);
    pdf.text(
      `${requestRef}${version ? ` · tilbud v${version}` : ""} · signert ${formatDateTime(contract.customer_signed_at)}`,
      PAGE.left,
      54
    );

    const logo = await loadLogo();
    if (logo) {
      const scale = Math.min(46 / logo.size.width, 23 / logo.size.height);
      const width = logo.size.width * scale;
      const height = logo.size.height * scale;
      pdf.addImage(logo.dataUrl, logo.type, PAGE.right - width, 18, width, height);
    } else if (company.name) {
      font(10, "bold", COLORS.ink);
      pdf.text(company.name, PAGE.right, 28, { align: "right" });
    }

    y = 70;
    summaryGrid([
      { label: "Utførende firma", value: company.name },
      { label: "Kunde", value: customer.name },
      { label: "Arbeidssted", value: draft.project_address || customer.address },
      { label: "Avtalesum inkl. mva.", value: formatNok(totalInclVat), strong: true },
    ]);
  };

  await hero();

  sectionTitle("Kundeaksept - låst avtalegrunnlag", "Eksakt akseptert tilbud og kundens valg følger kontrakten.");
  summaryGrid([
    { label: "Akseptert tilbud", value: version ? `Versjon ${version}` : "Akseptert tilbud" },
    { label: "Akseptert av", value: acceptance.accepted_by || customer.name },
    { label: "Aksepttidspunkt", value: formatDateTime(acceptance.accepted_at) },
    { label: "Avtalesum inkl. mva.", value: formatNok(totalInclVat), strong: true },
  ]);
  paragraph(
    "Det aksepterte tilbudet, kundens valgte opsjoner og kundesynlige vedlegg inngår i avtalegrunnlaget. Kontrakten supplerer dette grunnlaget og endrer ikke den opprinnelige kundeaksepten."
  );

  sectionTitle("Partene og prosjektet");
  summaryGrid([
    { label: "Utførende firma", value: company.name },
    { label: "Organisasjonsnummer", value: company.org },
    { label: "E-post firma", value: company.email },
    { label: "Telefon firma", value: company.phone },
    { label: "Kunde", value: customer.name },
    { label: "E-post kunde", value: customer.email },
    { label: "Telefon kunde", value: customer.phone },
    { label: "Prosjektadresse", value: draft.project_address || customer.address },
  ]);

  sectionTitle("Avtalegrunnlag og arbeidets omfang");
  paragraph(
    `Det aksepterte tilbudet${version ? ` v${version}` : ""}, med kundens valgte opsjoner og de vedlegg som fulgte tilbudet, inngår i denne kontrakten i sin helhet. Kontrakten supplerer tilbudet med fremdrift, betaling og øvrige avtalepunkter; den endrer ikke det tilbudet kunden allerede har akseptert.`
  );
  paragraph(
    "Arbeidet skal utføres i samsvar med avtalt leveranse, gjeldende offentligrettslige krav som gjelder for arbeidet, relevante produktanvisninger og alminnelige krav til fagmessig utførelse."
  );
  if (draft.included) textCard("Inkludert", draft.included);
  if (draft.excluded) textCard("Ikke inkludert", draft.excluded);
  if (draft.customer_supplied) textCard("Kundens egne leveranser", draft.customer_supplied);

  sectionTitle("Pris, fremdrift og betaling");
  summaryGrid([
    { label: "Prisform", value: priceLabel },
    { label: "Avtalesum inkl. mva.", value: formatNok(totalInclVat), strong: true },
    { label: "Avtalt oppstart", value: formatDate(draft.start_date) },
    { label: "Forventet varighet", value: durationWeeks > 0 ? `${durationWeeks} uker` : "Ikke angitt" },
    { label: "Beregnet forventet ferdigstillelse", value: formatDate(draft.expected_finish_date) },
  ]);
  paragraph(
    "Forventet ferdigstillelse er beregnet ut fra avtalt oppstart og forventet varighet. Dersom det oppstår dokumenterte forhold som etter avtalen eller loven gir rett til fristforlengelse, forskyves ferdigstillelsesfristen tilsvarende."
  );
  paragraph(
    "Avtalesummen og prisformen følger det aksepterte tilbudet og denne kontrakten. Dersom prisformen er prisoverslag, høyeste pris eller regningsarbeid, gjelder de lovbestemte reglene for den valgte prisformen."
  );
  for (const item of Array.isArray(draft.payment_plan) ? draft.payment_plan : []) {
    textCard(`${Number(item.percent || 0)} % - ${clean(item.title)}`, item.description);
  }

  sectionTitle("Endringer, tillegg og fradrag");
  paragraph(
    "Endringer i arbeidets omfang, tillegg, fradrag og alternative løsninger skal så langt det er praktisk mulig avtales skriftlig før arbeidet utføres. Avklaringen bør angi hva som endres og eventuelle følger for pris og fremdrift."
  );
  paragraph(
    "Når Expo ProffDok brukes til prosjektet, skal slike endringer dokumenteres som egne tillegg eller fradrag. Den opprinnelige kundeaksepten og det aksepterte tilbudet skal ikke overskrives."
  );

  sectionTitle("Partenes ansvar og kundens medvirkning");
  paragraph(
    "Utførende firma skal planlegge og gjennomføre sitt arbeid fagmessig og varsle kunden dersom det oppdages forhold som bør avklares før arbeidet fortsetter."
  );
  paragraph(
    "Kunden skal gi nødvendig tilgang til arbeidsstedet, sørge for avtalte avklaringer og opplysninger i rimelig tid og informere om kjente forhold som kan påvirke utførelsen. Der det er nødvendig for arbeidet, skal tilgang til strøm, vann og andre avtalte fasiliteter være tilgjengelig."
  );
  paragraph(
    "Kundens egne produkter eller leveranser er kundens ansvar med mindre annet er uttrykkelig avtalt. Forsinkede kundevalg, kundens egne leveranser, manglende tilgang eller sene avklaringer kan påvirke fremdriften og skal dokumenteres når det får betydning for prosjektet."
  );

  sectionTitle("Skjulte og uforutsette forhold");
  paragraph(
    "Forhold som ikke med rimelighet kunne avdekkes ved befaring eller på grunnlag av tilgjengelig informasjon, og som endrer forutsetningene for arbeidet, skal varsles og avklares med kunden. Nødvendige endringer i pris eller fremdrift skal avtales og dokumenteres før videre arbeid så langt situasjonen tillater det."
  );
  paragraph(
    "Denne bestemmelsen gir ikke utførende firma rett til å fravike kundens ufravikelige rettigheter etter håndverkertjenesteloven."
  );

  sectionTitle("Forsinkelse, fristforlengelse og mangler");
  paragraph(
    "Partene skal varsle hverandre uten ugrunnet opphold dersom forhold oppstår som kan påvirke avtalt fremdrift eller forventet ferdigstillelse. Årsaken og forventet konsekvens for fremdriften skal så langt det er praktisk mulig dokumenteres."
  );
  paragraph(
    "Dersom forsinkelsen skyldes forhold utførende firma svarer for, regnes dette som forsinkelse på håndverkerens side. Dersom forsinkelsen skyldes kunden, kundens egne valg eller leveranser, manglende tilgang, sene avklaringer eller andre forhold som etter avtalen eller loven gir rett til fristforlengelse, forskyves ferdigstillelsesfristen tilsvarende. Dagmulkt løper ikke for slik fristforlengelse."
  );
  if (draft.daily_penalty_agreed) {
    paragraph(
      `Partene har avtalt dagmulkt. Dagmulkt kan tidligst begynne å løpe når gjeldende ferdigstillelsesfrist er overskredet og den avtalte tilleggsfristen på ${graceDays} kalenderdager er utløpt. Dagmulkt gjelder bare forsinkelse utførende firma svarer for.`
    );
  }
  paragraph(
    "Ved mangel gjelder partenes avtalte vilkår og de ufravikelige reglene i håndverkertjenesteloven. Kunden kan blant annet holde tilbake et nødvendig beløp, og utførende firma skal få anledning til å vurdere og rette en meldt mangel når vilkårene for retting er oppfylt."
  );

  sectionTitle("Overtagelse, dokumentasjon og eventuell garanti");
  paragraph(
    "Når arbeidet er ferdigstilt, gjennomføres overtagelse etter prosjektets avtalte rutine. Eventuelle åpne punkter eller mangler dokumenteres og følges opp til de er avklart eller rettet."
  );
  paragraph(
    "Prosjektdokumentasjon, akseptert tilbud, kontrakt, senere avtalte endringer og eventuell Expo ProffDok-garanti oppbevares som separate historiske dokumenter. En eventuell tetthetsgaranti gjelder etter vilkårene i det særskilte garantidokumentet og erstatter ikke forbrukerens lovbestemte rettigheter."
  );

  sectionTitle("Avtaleform og angrerett");
  paragraph(`Avtalen er inngått: ${agreementLabel}.`);
  if (agreementChannelNeedsWithdrawalInfo(draft.agreement_channel)) {
    paragraph(
      `Der angrerettloven gjelder, skal kunden få lovpålagt informasjon om angreretten.${
        draft.early_start_requested
          ? " Kunden ønsker at arbeidet skal starte før eventuell angrefrist er utløpt og har bekreftet dette uttrykkelig ved signering."
          : " Det er ikke registrert at kunden ønsker oppstart før en eventuell angrefrist er utløpt."
      }`
    );
  } else {
    paragraph("Ingen særskilt anmodning om oppstart før en eventuell angrefrist er registrert.");
  }

  sectionTitle("Særlige vilkår");
  if (draft.daily_penalty_agreed) {
    textCard("Dagmulkt", draft.daily_penalty_text || "Avtalt mellom partene.");
    paragraph(`Avtalt tilleggsfrist: ${graceDays} kalenderdager etter gjeldende ferdigstillelsesfrist.`);
  } else {
    paragraph("Dagmulkt: Ikke særskilt avtalt.");
  }
  paragraph(`Andre særskilte vilkår: ${clean(draft.special_terms) || "Ingen særskilte vilkår registrert."}`);

  sectionTitle("Dokumenter som inngår i avtalen");
  paragraph("1. Denne signerte kontrakten.");
  paragraph(`2. Kundens aksepterte tilbud${version ? ` v${version}` : ""}, med valgte opsjoner.`);
  paragraph("3. Vedlegg og kundesynlig dokumentasjon som fulgte den aksepterte tilbudsversjonen.");
  paragraph("4. Senere skriftlig avtalte og dokumenterte endringer, tillegg og fradrag.");
  paragraph(
    "Ved motstrid går en senere særskilt skriftlig avtale om det aktuelle forholdet foran eldre dokumentasjon. Ufravikelige forbrukerrettigheter gjelder uansett."
  );

  sectionTitle("Signering");
  paragraph(
    "Ved signering bekrefter partene at de har lest kontrakten og at det aksepterte tilbudet med eventuelle valgte opsjoner inngår som avtalegrunnlag."
  );
  signatureBox("Utførende firma", contract.company_signed_by_name, contract.company_signed_at);
  signatureBox("Kunde", contract.customer_signed_by_name, contract.customer_signed_at);
  paragraph(
    "Kontrakten er opprettet og signert elektronisk i Expo ProffDok. Det aksepterte tilbudet med valgte opsjoner og angitte vedlegg inngår i avtalegrunnlaget. Ufravikelige rettigheter etter gjeldende lovgivning gjelder."
  );

  newPage("Vedlegg A - akseptert tilbud");
  section = 0;
  sectionTitle("Vedlegg A - akseptert tilbud", "Låst tilbudsgrunnlag som kontrakten bygger på.");
  summaryGrid([
    { label: "Tilbud", value: clean(offer.title) || requestRef },
    { label: "Versjon", value: version ? `v${version}` : "Ikke registrert" },
    { label: "Publisert", value: formatDateTime(offer.published_at) },
    { label: "Akseptert", value: formatDateTime(acceptance.accepted_at) },
    { label: "Akseptert total inkl. mva.", value: formatNok(totalInclVat), strong: true },
  ]);
  if (offer.intro) textCard("Om tilbudet", offer.intro);
  if (offer.reservations) textCard("Forutsetninger og forbehold", offer.reservations);
  if (offerTerms?.included) textCard("Dette er inkludert", offerTerms.included);
  if (offerTerms?.excluded) textCard("Dette er ikke inkludert", offerTerms.excluded);
  if (offerTerms?.customerSupplied) textCard("Dette sørger kunden for", offerTerms.customerSupplied);
  if (offerTerms?.terms) textCard("Vilkår", offerTerms.terms);
  if (offerTerms?.paymentTerms) textCard("Betalingsbetingelser", offerTerms.paymentTerms);

  for (let groupIndex = 0; groupIndex < offerGroups.length; groupIndex += 1) {
    const group = offerGroups[groupIndex];
    ensure(22);
    pdf.setFillColor(...COLORS.tealSoft);
    pdf.setDrawColor(...COLORS.line);
    pdf.roundedRect(PAGE.left, y, WIDTH, 12, 2, 2, "FD");
    font(9.8, "bold", COLORS.ink);
    pdf.text(`${String(groupIndex + 1).padStart(2, "0")}  ${group.title}`, PAGE.left + 5, y + 7.7);
    y += 15;

    for (let lineIndex = 0; lineIndex < group.lines.length; lineIndex += 1) {
      const line = group.lines[lineIndex];
      const description = clean(line.description) || "Tilbudspost";
      font(8.2, "normal", COLORS.text);
      const rows = pdf.splitTextToSize(description, 118);
      const height = Math.max(13, rows.length * 4.2 + 6);
      ensure(height + 2);
      pdf.setFillColor(...COLORS.panel);
      pdf.setDrawColor(...COLORS.line);
      pdf.roundedRect(PAGE.left + 3, y, WIDTH - 3, height, 2, 2, "FD");
      font(7.4, "bold", COLORS.tealDark);
      pdf.text(`${groupIndex + 1}.${lineIndex + 1}`, PAGE.left + 7, y + 6.3);
      font(8.2, "normal", COLORS.text);
      pdf.text(rows, PAGE.left + 21, y + 6.3);
      font(8.5, "bold", COLORS.ink);
      pdf.text(formatNok(getOfferTotal([line]) * 1.25), PAGE.right - 4, y + 6.3, { align: "right" });
      font(6.4, "normal", COLORS.muted);
      pdf.text("inkl. mva.", PAGE.right - 4, y + 10, { align: "right" });
      y += height + 2;
    }
  }

  sectionTitle("Valgte opsjoner ved aksept");
  if (!selectedOptions.length) {
    paragraph("Ingen opsjoner ble valgt ved aksept.");
  } else {
    selectedOptions.forEach((option, index) => {
      const amount = getOfferTotal([option]) * 1.25;
      textCard(
        `${index + 1}. ${clean(option.title) || "Valgt opsjon"} - ${optionTypeLabel(option)}`,
        `${clean(option.description) || "Valgt av kunden ved aksept."}\nPrisendring inkl. mva.: ${formatNok(amount)}`
      );
    });
  }

  newPage("Vedlegg B - aksept og signaturbevis");
  section = 0;
  sectionTitle("Vedlegg B - aksept og signaturbevis", "Sporbarhet for tilbudsaksept og kontraktsignering.");
  summaryGrid([
    { label: "Tilbud akseptert av", value: acceptance.accepted_by || customer.name },
    { label: "Tilbud akseptert", value: formatDateTime(acceptance.accepted_at) },
    { label: "Tilbudsversjon", value: version ? `v${version}` : "Ikke registrert" },
    { label: "Valgte opsjoner", value: String(selectedOptions.length) },
  ]);
  paragraph(
    "Tilbudsaksepten er låst til tilbudsversjonen og kundens valgte opsjoner. Kontraktssigneringene nedenfor bekrefter samme avtalegrunnlag."
  );
  signatureBox("Utførende firma", contract.company_signed_by_name, contract.company_signed_at);
  signatureBox("Kunde", contract.customer_signed_by_name, contract.customer_signed_at);
  if (draft.early_start_requested) {
    paragraph(
      contract.customer_acknowledgements?.early_start_confirmed
        ? "Kunden har uttrykkelig bekreftet ønsket om oppstart før eventuell angrefrist er utløpt."
        : "Tidlig oppstart er registrert i kontrakten, men særskilt kundebekreftelse er ikke registrert."
    );
  }
  paragraph(
    "Dokumentet er generert fra den serverlagrede, låste kontrakten. Signaturer, tilbudsversjon og kundeaksept er ikke hentet fra en redigerbar lokal kladd."
  );

  const pageCount = pdf.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    pdf.setPage(page);
    pdf.setDrawColor(...COLORS.line);
    pdf.line(PAGE.left, 286, PAGE.right, 286);
    font(6.7, "normal", COLORS.muted);
    pdf.text("Expo ProffDok - elektronisk avtalegrunnlag", PAGE.left, 291);
    pdf.text(`Side ${page} av ${pageCount}`, PAGE.right, 291, { align: "right" });
  }

  const safeRef = requestRef.replace(/[^a-zA-Z0-9._-]/g, "-");
  const fileName = `Signert-kontrakt-${safeRef}.pdf`;
  const blob = pdf.output("blob");
  return { blob, fileName, pageCount };
}
