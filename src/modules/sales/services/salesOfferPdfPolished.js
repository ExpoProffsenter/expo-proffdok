// Expo ProffDok – FASE 31A2B
// Profesjonell A4-presentasjon som speiler kundelenkens struktur og visuelle hierarki.
// Dokumentrekkefølge: tilbud/omfang/forutsetninger -> arbeider/priser -> total -> vilkår.
// Ingen lagring, SQL, RLS, Storage-policy eller Edge-logikk endres.

import { OFFER_MAIN_POSTS } from "../constants/salesConstants.js";
import {
  formatNok,
  formatOfferQuantity,
  getOfferTermsSnapshot,
  getOfferTotal,
  getOfferUnitPrice,
  getVisibleOfferLines,
  hasOfferQuantityDetails,
  sanitizeStoragePart,
} from "../utils/salesUtils.js";
import { getImageNaturalSize, readFileAsDataUrl } from "./salesImages.js";

const LEGACY_MAIN_POST = { id: "ovrige-arbeider", title: "Øvrige arbeider" };
const PAGE = { width: 210, height: 297, left: 17, right: 193, top: 18, bottom: 18 };
const CONTENT_WIDTH = PAGE.right - PAGE.left;
const COLORS = {
  ink: [18, 42, 51],
  text: [44, 72, 82],
  muted: [94, 119, 127],
  teal: [11, 157, 166],
  tealDark: [9, 116, 126],
  tealSoft: [238, 249, 250],
  line: [209, 226, 230],
  panel: [248, 251, 252],
  white: [255, 255, 255],
};

function cleanText(value = "") {
  return String(value ?? "")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\uFFFD\uFFFE]/g, "-")
    .replace(/\u00a0/g, " ")
    .replace(/\t/g, " ")
    .trim();
}

function getMainPostMeta(item = {}) {
  return {
    id: cleanText(item.mainPostId) || LEGACY_MAIN_POST.id,
    title: cleanText(item.mainPostTitle) || LEGACY_MAIN_POST.title,
  };
}

function buildOfferGroups(lines = [], options = []) {
  const groups = [];
  const map = new Map();
  let firstSeen = 0;

  const ensure = (item) => {
    const meta = getMainPostMeta(item);
    if (!map.has(meta.id)) {
      const group = { ...meta, lines: [], options: [], firstSeen: firstSeen++ };
      map.set(meta.id, group);
      groups.push(group);
    }
    return map.get(meta.id);
  };

  (Array.isArray(lines) ? lines : []).forEach((line) => ensure(line).lines.push(line));
  (Array.isArray(options) ? options : []).forEach((option) => ensure(option).options.push(option));

  const standardOrder = new Map(OFFER_MAIN_POSTS.map((post, index) => [post.id, index]));
  return groups
    .filter((group) => group.lines.length || group.options.length)
    .sort((a, b) => {
      const ai = standardOrder.has(a.id) ? standardOrder.get(a.id) : Number.MAX_SAFE_INTEGER;
      const bi = standardOrder.has(b.id) ? standardOrder.get(b.id) : Number.MAX_SAFE_INTEGER;
      return ai !== bi ? ai - bi : a.firstSeen - b.firstSeen;
    });
}

function lineTitle(line = {}) {
  const description = cleanText(line.description) || "Tilbudspost";
  if (
    line.lineType === "administration" &&
    line.adminMode === "percent" &&
    cleanText(line.adminPercent)
  ) {
    return `${description} (${cleanText(line.adminPercent)} %)`;
  }
  return description;
}

function isAlternativeOption(option = {}) {
  return option?.optionType === "alternative";
}

function optionTypeText(option = {}, groupLines = []) {
  if (isAlternativeOption(option)) {
    const replacement =
      cleanText(option.replacementLineDescription) ||
      cleanText(
        (Array.isArray(groupLines) ? groupLines : []).find(
          (line) => String(line?.id || "") === String(option?.replacementLineId || "")
        )?.description
      ) ||
      "valgt underpost";
    return `Alternativ - erstatter ${replacement}`;
  }
  if (getOfferTotal([option]) < 0) return "Fradrag / prisreduksjon";
  return "Tillegg / oppgradering";
}

function quantityText(item = {}) {
  if (!hasOfferQuantityDetails(item)) return "";
  const unitPriceInclVat = getOfferUnitPrice(item) * 1.25;
  return `${formatOfferQuantity(item)} x ${formatNok(unitPriceInclVat)} pr. enhet`;
}

function normalizeWebUrl(value = "") {
  const clean = cleanText(value);
  if (!clean) return "";
  if (/^https?:\/\//i.test(clean)) return clean;
  return `https://${clean}`;
}

export async function createPublishedOfferPdfPolished({ selectedRequest }) {
  if (!selectedRequest) throw new Error("Publisert tilbud mangler.");

  const module = await import("https://esm.sh/jspdf@2.5.1");
  const JsPDF = module.jsPDF || module.default?.jsPDF;
  if (!JsPDF) throw new Error("PDF-verktøyet kunne ikke lastes.");

  const pdf = new JsPDF({ unit: "mm", format: "a4" });
  let y = PAGE.top;
  let sectionNo = 0;

  const lines = getVisibleOfferLines(selectedRequest.offerLines || []);
  const options = Array.isArray(selectedRequest.offerOptions) ? selectedRequest.offerOptions : [];
  const groups = buildOfferGroups(lines, options);
  const termsSnapshot = getOfferTermsSnapshot(selectedRequest.offerLines || []);
  const offerTerms = termsSnapshot.terms || selectedRequest.offerTerms || "";
  const offerIncluded = termsSnapshot.included || selectedRequest.offerIncluded || "";
  const offerExcluded = termsSnapshot.excluded || selectedRequest.offerExcluded || "";
  const offerCustomerSupplied = termsSnapshot.customerSupplied || selectedRequest.offerCustomerSupplied || "";
  const offerPaymentTerms = termsSnapshot.paymentTerms || selectedRequest.offerPaymentTerms || "";
  const offerReservations = selectedRequest.offerReservations || "";
  const offerTotal = Number(selectedRequest.offerTotal || 0);
  const offerTitle = cleanText(selectedRequest.offerTitle || selectedRequest.title || "Tilbud");
  const offerId = cleanText(selectedRequest.id || "-");
  const version = cleanText(selectedRequest.sentOfferVersionNumber || "-");

  const company = {
    name: cleanText(selectedRequest.companyName || ""),
    org: cleanText(selectedRequest.companyOrgNumber || ""),
    address: cleanText(selectedRequest.companyAddress || ""),
    phone: cleanText(selectedRequest.companyPhone || ""),
    email: cleanText(selectedRequest.companyEmail || ""),
    website: cleanText(selectedRequest.companyWebsite || ""),
    logoUrl: cleanText(selectedRequest.companyLogoUrl || ""),
  };

  const setText = (size = 9, style = "normal", color = COLORS.text) => {
    pdf.setFont("helvetica", style);
    pdf.setFontSize(size);
    pdf.setTextColor(...color);
  };

  const drawContinuationHeader = () => {
    pdf.setFillColor(...COLORS.white);
    pdf.rect(0, 0, PAGE.width, 14, "F");
    pdf.setDrawColor(...COLORS.line);
    pdf.setLineWidth(0.3);
    pdf.line(PAGE.left, 13, PAGE.right, 13);
    setText(8.2, "bold", COLORS.ink);
    pdf.text(offerTitle, PAGE.left, 8.5);
    setText(7.7, "normal", COLORS.muted);
    pdf.text(`Tilbud ${offerId} - v${version}`, PAGE.right, 8.5, { align: "right" });
    y = 20;
  };

  const newPage = () => {
    pdf.addPage();
    drawContinuationHeader();
  };

  const ensureSpace = (height = 10) => {
    if (y + height <= PAGE.height - PAGE.bottom) return;
    newPage();
  };

  const splitLines = (text, width, size = 9) => {
    setText(size, "normal", COLORS.text);
    const blocks = cleanText(text).split(/\n+/).map((part) => part.trim()).filter(Boolean);
    const result = [];
    blocks.forEach((block, index) => {
      const normalized = block.replace(/^·\s*/, "- ");
      result.push(...pdf.splitTextToSize(normalized, width));
      if (index < blocks.length - 1) result.push("");
    });
    return result;
  };

  const nextSectionNumber = () => String(++sectionNo).padStart(2, "0");

  const drawSectionTitle = (title, note = "") => {
    ensureSpace(20);
    const number = nextSectionNumber();
    const h = note ? 19 : 15;
    pdf.setFillColor(...COLORS.tealSoft);
    pdf.setDrawColor(...COLORS.line);
    pdf.setLineWidth(0.35);
    pdf.roundedRect(PAGE.left, y, CONTENT_WIDTH, h, 2.5, 2.5, "FD");
    pdf.setFillColor(...COLORS.teal);
    pdf.circle(PAGE.left + 8, y + 7.5, 4.6, "F");
    setText(7.7, "bold", COLORS.white);
    pdf.text(number, PAGE.left + 8, y + 8.3, { align: "center" });
    setText(12.5, "bold", COLORS.ink);
    pdf.text(cleanText(title), PAGE.left + 16, y + 8.6);
    if (note) {
      setText(7.8, "normal", COLORS.muted);
      const noteLines = pdf.splitTextToSize(cleanText(note), 65);
      pdf.text(noteLines.slice(0, 2), PAGE.right - 3, y + 5.8, { align: "right" });
    }
    y += h + 4;
  };

  const drawTextCard = (title, text) => {
    if (!cleanText(text)) return;
    const wrapped = splitLines(text, CONTENT_WIDTH - 14, 8.8);
    const lineHeight = 4.8;
    let start = 0;
    let first = true;
    while (start < wrapped.length) {
      const available = PAGE.height - PAGE.bottom - y;
      const headerHeight = first ? 10 : 7;
      const maxLines = Math.max(1, Math.floor((available - headerHeight - 7) / lineHeight));
      if (maxLines < 2) {
        newPage();
        continue;
      }
      const chunk = wrapped.slice(start, start + maxLines);
      const h = headerHeight + chunk.reduce((acc, line) => acc + (line ? lineHeight : lineHeight * 0.55), 0) + 5;
      ensureSpace(h + 2);
      pdf.setFillColor(...COLORS.panel);
      pdf.setDrawColor(...COLORS.line);
      pdf.roundedRect(PAGE.left, y, CONTENT_WIDTH, h, 2.5, 2.5, "FD");
      if (first) {
        setText(10.2, "bold", COLORS.ink);
        pdf.text(cleanText(title), PAGE.left + 5, y + 6.5);
      } else {
        setText(8, "bold", COLORS.muted);
        pdf.text(`${cleanText(title)} - fortsetter`, PAGE.left + 5, y + 5.5);
      }
      let ty = y + headerHeight;
      chunk.forEach((line) => {
        if (!line) {
          ty += lineHeight * 0.55;
          return;
        }
        setText(8.8, "normal", COLORS.text);
        pdf.text(line, PAGE.left + 5, ty);
        ty += lineHeight;
      });
      y += h + 3;
      start += chunk.length;
      first = false;
    }
  };

  const drawLink = (label, url, x, maxWidth) => {
    const cleanUrl = normalizeWebUrl(url);
    if (!cleanUrl) return 0;
    const labelText = cleanText(label);
    setText(7.4, "bold", COLORS.tealDark);
    const shown = pdf.splitTextToSize(labelText, maxWidth)[0] || labelText;
    pdf.textWithLink(shown, x, y, { url: cleanUrl });
    return 4;
  };

  const drawMainPostHeader = (group, groupIndex) => {
    const h = 17;
    ensureSpace(h + 5);
    pdf.setFillColor(...COLORS.tealSoft);
    pdf.setDrawColor(...COLORS.line);
    pdf.roundedRect(PAGE.left, y, CONTENT_WIDTH, h, 2, 2, "FD");
    pdf.setFillColor(...COLORS.teal);
    pdf.circle(PAGE.left + 8, y + 8.5, 4.7, "F");
    setText(7.7, "bold", COLORS.white);
    pdf.text(String(groupIndex + 1).padStart(2, "0"), PAGE.left + 8, y + 9.2, { align: "center" });
    setText(11.2, "bold", COLORS.ink);
    pdf.text(cleanText(group.title), PAGE.left + 16, y + 10);
    setText(7.2, "bold", COLORS.muted);
    pdf.text("Sum hovedpost", PAGE.right - 4, y + 5.5, { align: "right" });
    setText(11.3, "bold", COLORS.ink);
    pdf.text(formatNok(getOfferTotal(group.lines) * 1.25), PAGE.right - 4, y + 11, { align: "right" });
    setText(6.9, "normal", COLORS.muted);
    pdf.text("inkl. mva.", PAGE.right - 4, y + 14.3, { align: "right" });
    y += h + 2;
  };

  const drawLineRow = (line, groupIndex, lineIndex) => {
    const title = lineTitle(line);
    const qText = quantityText(line);
    const price = formatNok(getOfferTotal([line]) * 1.25);
    const descWidth = qText ? 112 : 118;
    setText(8.7, "bold", COLORS.ink);
    const titleLines = pdf.splitTextToSize(title, descWidth - 16);
    setText(7.4, "normal", COLORS.muted);
    const qLines = qText ? pdf.splitTextToSize(qText, descWidth - 16) : [];
    const links = Number(Boolean(line.productUrl)) + Number(Boolean(line.attachmentFile?.url && line.attachmentFile?.customerVisible !== false));
    const h = Math.max(12, 5 + titleLines.length * 4.2 + qLines.length * 3.8 + links * 4);
    ensureSpace(h + 2);
    pdf.setFillColor(...COLORS.white);
    pdf.setDrawColor(...COLORS.line);
    pdf.roundedRect(PAGE.left, y, CONTENT_WIDTH, h, 1.8, 1.8, "FD");
    setText(8.2, "bold", COLORS.tealDark);
    pdf.text(`${String(groupIndex + 1).padStart(2, "0")}.${lineIndex + 1}`, PAGE.left + 4, y + 6.5);
    let ty = y + 6.5;
    setText(8.7, "bold", COLORS.ink);
    titleLines.forEach((row) => {
      pdf.text(row, PAGE.left + 18, ty);
      ty += 4.2;
    });
    if (qLines.length) {
      setText(7.4, "normal", COLORS.muted);
      qLines.forEach((row) => {
        pdf.text(row, PAGE.left + 18, ty);
        ty += 3.8;
      });
    }
    y += h;
    const linksY = y - 3 - links * 4;
    const savedY = y;
    y = linksY;
    if (line.productUrl) y += drawLink("Produkt / dokumentasjon", line.productUrl, PAGE.left + 18, 90);
    if (line.attachmentFile?.url && line.attachmentFile?.customerVisible !== false) {
      y += drawLink(`Vedlegg: ${line.attachmentFile.name || "Åpne vedlegg"}`, line.attachmentFile.url, PAGE.left + 18, 90);
    }
    y = savedY;
    setText(10, "bold", COLORS.ink);
    pdf.text(price, PAGE.right - 4, y - h + 7.2, { align: "right" });
    setText(6.8, "normal", COLORS.muted);
    pdf.text("inkl. mva.", PAGE.right - 4, y - h + 10.5, { align: "right" });
    y += 2;
  };

  const drawOptionCard = (option, groupLines = []) => {
    const title = cleanText(option.title) || "Opsjon";
    const type = optionTypeText(option, groupLines);
    const description = cleanText(option.description);
    const qText = quantityText(option);
    const total = getOfferTotal([option]) * 1.25;
    const sign = total > 0 ? "+" : total < 0 ? "-" : "";
    const price = total === 0 ? "Ingen prisendring" : `${sign} ${formatNok(Math.abs(total))}`;
    setText(9, "bold", COLORS.ink);
    const titleLines = pdf.splitTextToSize(title, 112);
    setText(7.5, "normal", COLORS.muted);
    const descLines = description ? pdf.splitTextToSize(description, 112) : [];
    const qLines = qText ? pdf.splitTextToSize(qText, 112) : [];
    const links = Number(Boolean(option.productUrl)) + Number(Boolean(option.attachmentFile?.url && option.attachmentFile?.customerVisible !== false));
    const h = 14 + titleLines.length * 4.2 + descLines.length * 3.8 + qLines.length * 3.8 + links * 4;
    ensureSpace(h + 2);
    pdf.setFillColor(...COLORS.panel);
    pdf.setDrawColor(...COLORS.line);
    pdf.roundedRect(PAGE.left + 5, y, CONTENT_WIDTH - 5, h, 2, 2, "FD");
    pdf.setFillColor(...COLORS.tealSoft);
    pdf.roundedRect(PAGE.left + 9, y + 4, 38, 5.5, 2.5, 2.5, "F");
    setText(6.7, "bold", COLORS.tealDark);
    pdf.text(type.toUpperCase().slice(0, 34), PAGE.left + 11, y + 7.7);
    let ty = y + 15;
    setText(9, "bold", COLORS.ink);
    titleLines.forEach((row) => { pdf.text(row, PAGE.left + 10, ty); ty += 4.2; });
    if (qLines.length) {
      setText(7.5, "normal", COLORS.muted);
      qLines.forEach((row) => { pdf.text(row, PAGE.left + 10, ty); ty += 3.8; });
    }
    if (descLines.length) {
      ty += 0.5;
      setText(7.8, "normal", COLORS.text);
      descLines.forEach((row) => { pdf.text(row, PAGE.left + 10, ty); ty += 3.8; });
    }
    setText(9.8, "bold", COLORS.ink);
    pdf.text(price, PAGE.right - 4, y + 17, { align: "right" });
    setText(6.8, "normal", COLORS.muted);
    pdf.text("inkl. mva.", PAGE.right - 4, y + 20.3, { align: "right" });
    const linkY = y + h - links * 4 - 2;
    const savedY = y;
    y = linkY;
    if (option.productUrl) y += drawLink("Produkt / dokumentasjon", option.productUrl, PAGE.left + 10, 90);
    if (option.attachmentFile?.url && option.attachmentFile?.customerVisible !== false) {
      y += drawLink(`Vedlegg: ${option.attachmentFile.name || "Åpne vedlegg"}`, option.attachmentFile.url, PAGE.left + 10, 90);
    }
    y = savedY + h + 2;
  };

  const drawHero = async () => {
    pdf.setFillColor(...COLORS.white);
    pdf.rect(0, 0, PAGE.width, 60, "F");
    pdf.setFillColor(...COLORS.tealDark);
    pdf.rect(0, 0, 5, 60, "F");
    pdf.setDrawColor(...COLORS.line);
    pdf.line(PAGE.left, 59, PAGE.right, 59);

    pdf.setFillColor(255, 246, 224);
    pdf.roundedRect(PAGE.left, 11, 22, 7, 3.5, 3.5, "F");
    setText(7.5, "bold", [153, 101, 0]);
    pdf.text("TILBUD", PAGE.left + 11, 15.6, { align: "center" });
    setText(19, "bold", COLORS.ink);
    const titleLines = pdf.splitTextToSize(offerTitle, 115);
    pdf.text(titleLines.slice(0, 2), PAGE.left, 29);
    setText(8.8, "normal", COLORS.text);
    pdf.text(`${cleanText(selectedRequest.customer || "Kunde")}  ·  ${cleanText(selectedRequest.address || "Arbeidssted")}`, PAGE.left, 45);
    setText(8, "normal", COLORS.muted);
    pdf.text(`Tilbud ${offerId}  ·  v${version}  ·  gyldig ${cleanText(selectedRequest.offerValidityDays || "30")} dager`, PAGE.left, 51);

    if (company.logoUrl) {
      try {
        const response = await fetch(company.logoUrl, { cache: "force-cache" });
        if (!response.ok) throw new Error("Firmalogo kunne ikke hentes");
        const blob = await response.blob();
        const dataUrl = await readFileAsDataUrl(blob, "Firmalogo kunne ikke leses");
        const size = await getImageNaturalSize(dataUrl, "Firmalogo har ugyldig format");
        const maxW = 46;
        const maxH = 23;
        const scale = Math.min(maxW / size.width, maxH / size.height);
        const w = size.width * scale;
        const h = size.height * scale;
        pdf.addImage(dataUrl, blob.type.includes("png") ? "PNG" : "JPEG", PAGE.right - w, 16, w, h);
      } catch (error) {
        console.warn("Firmalogo kunne ikke legges inn i tilbuds-PDF", error);
      }
    } else if (company.name) {
      setText(10.5, "bold", COLORS.ink);
      pdf.text(company.name, PAGE.right, 26, { align: "right" });
    }

    y = 67;
    const meta = [
      ["Kunde", cleanText(selectedRequest.customer || "Ikke registrert")],
      ["Arbeidssted", cleanText(selectedRequest.address || "Ikke registrert")],
      ["Tilbud nr.", offerId],
      ["Versjon", `v${version}`],
    ];
    const colW = (CONTENT_WIDTH - 4) / 2;
    meta.forEach(([label, value], index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;
      const x = PAGE.left + col * (colW + 4);
      const yy = y + row * 15;
      pdf.setFillColor(...COLORS.panel);
      pdf.setDrawColor(...COLORS.line);
      pdf.roundedRect(x, yy, colW, 12, 2, 2, "FD");
      setText(6.8, "bold", COLORS.muted);
      pdf.text(label.toUpperCase(), x + 4, yy + 4);
      setText(8.7, "bold", COLORS.ink);
      const valueLine = pdf.splitTextToSize(value, colW - 8)[0] || "-";
      pdf.text(valueLine, x + 4, yy + 9);
    });
    y += 34;
  };

  await drawHero();

  drawSectionTitle("Om tilbudet");
  drawTextCard("Innledning", selectedRequest.offerIntro || "Ingen innledning registrert.");

  if (cleanText(offerReservations)) {
    drawSectionTitle("Forutsetninger og forbehold");
    drawTextCard("Forutsetninger og forbehold", offerReservations);
  }

  if (cleanText(offerIncluded) || cleanText(offerExcluded) || cleanText(offerCustomerSupplied)) {
    drawSectionTitle("Leveranseomfang");
    drawTextCard("Dette er inkludert", offerIncluded);
    drawTextCard("Dette er ikke inkludert", offerExcluded);
    drawTextCard("Dette sørger kunden for", offerCustomerSupplied);
  }

  drawSectionTitle(
    "Arbeider og priser",
    "Alle priser er inkl. mva. Opsjoner inngår først når kunden velger dem."
  );

  groups.forEach((group, groupIndex) => {
    drawMainPostHeader(group, groupIndex);
    group.lines.forEach((line, lineIndex) => drawLineRow(line, groupIndex, lineIndex));
    if (group.options.length) {
      ensureSpace(11);
      setText(8.5, "bold", COLORS.ink);
      pdf.text("Opsjoner", PAGE.left + 5, y + 5);
      y += 8;
      group.options.forEach((option) => drawOptionCard(option, group.lines));
    }
    y += 4;
  });

  ensureSpace(28);
  pdf.setFillColor(...COLORS.tealSoft);
  pdf.setDrawColor(...COLORS.teal);
  pdf.setLineWidth(0.45);
  pdf.roundedRect(PAGE.left, y, CONTENT_WIDTH, 23, 3, 3, "FD");
  setText(8.5, "bold", COLORS.tealDark);
  pdf.text("TILBUDSSUM INKL. MVA.", PAGE.left + 6, y + 8);
  setText(17, "bold", COLORS.ink);
  pdf.text(formatNok(offerTotal * 1.25), PAGE.right - 6, y + 11.5, { align: "right" });
  if (options.length) {
    setText(7.2, "normal", COLORS.muted);
    pdf.text("Før valg av opsjoner", PAGE.left + 6, y + 15.5);
    pdf.text("Opsjoner legges til eller trekkes fra når kunden velger dem.", PAGE.left + 6, y + 19.5);
  }
  y += 29;

  if (cleanText(offerTerms) || cleanText(offerPaymentTerms)) {
    drawSectionTitle("Vilkår og betaling");
    drawTextCard("Vilkår", offerTerms);
    drawTextCard("Betalingsbetingelser", offerPaymentTerms);
  }

  ensureSpace(15);
  pdf.setDrawColor(...COLORS.line);
  pdf.line(PAGE.left, y, PAGE.right, y);
  y += 6;
  setText(7.4, "normal", COLORS.muted);
  pdf.text("Dokumentet er generert fra publisert tilbudsversjon i Expo ProffDok.", PAGE.left, y);
  if (company.name) {
    pdf.text(company.name, PAGE.right, y, { align: "right" });
  }

  const pageCount = pdf.getNumberOfPages();
  for (let pageNo = 1; pageNo <= pageCount; pageNo += 1) {
    pdf.setPage(pageNo);
    setText(7, "normal", COLORS.muted);
    pdf.text(`Tilbud ${offerId} - v${version}`, PAGE.left, 289);
    pdf.text(`side ${pageNo} av ${pageCount}`, PAGE.right, 289, { align: "right" });
  }

  const safeId = sanitizeStoragePart(offerId || "tilbud");
  const safeVersion = sanitizeStoragePart(`v${version || "1"}`);
  const fileName = `Tilbud-${safeId}-${safeVersion}.pdf`;
  return { blob: pdf.output("blob"), fileName };
}
