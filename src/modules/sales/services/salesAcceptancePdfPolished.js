// Expo ProffDok – FASE 31C / FASE 31A2B
// Profesjonelt, låst akseptbevis basert på den allerede aksepterte tilbudsversjonen.
// Hovedpostnummer beholdes fra tilbudsversjonen selv om uvalgte opsjonsposter utelates.
// Ingen endring i akseptlogikk, Supabase, RLS, Storage-path eller prosjektaktivering.

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

const PAGE = { width: 210, height: 297, left: 17, right: 193, bottom: 279 };
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
const LEGACY = { id: "ovrige-arbeider", title: "Øvrige arbeider" };

function clean(value = "") {
  return String(value ?? "")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\uFFFD\uFFFE]/g, "-")
    .replace(/\u00a0/g, " ")
    .replace(/\t/g, " ")
    .trim();
}

function mainPostMeta(item = {}) {
  return {
    id: clean(item.mainPostId) || LEGACY.id,
    title: clean(item.mainPostTitle) || LEGACY.title,
  };
}

function isAlternative(option = {}) {
  return option?.optionType === "alternative";
}

function isReduction(option = {}) {
  return !isAlternative(option) && getOfferTotal([option]) < 0;
}

function lineTitle(line = {}) {
  const description = clean(line.description) || "Tilbudspost";
  if (
    line.lineType === "administration" &&
    line.adminMode === "percent" &&
    clean(line.adminPercent)
  ) {
    return `${description} (${clean(line.adminPercent)} %)`;
  }
  return description;
}

function replacementText(option = {}, lines = []) {
  return (
    clean(option.replacementLineDescription) ||
    clean(
      (Array.isArray(lines) ? lines : []).find(
        (line) => String(line?.id || "") === String(option?.replacementLineId || "")
      )?.description
    ) ||
    "valgt underpost"
  );
}

function optionLabel(option = {}, lines = []) {
  if (isAlternative(option)) {
    return `VALGT ALTERNATIV - ERSTATTER ${replacementText(option, lines).toUpperCase()}`;
  }
  if (isReduction(option)) return "VALGT FRADRAG";
  return "VALGT TILLEGG";
}

function quantityText(item = {}) {
  if (!hasOfferQuantityDetails(item)) return "";
  return `${formatOfferQuantity(item)} x ${formatNok(
    getOfferUnitPrice(item) * 1.25
  )} pr. enhet`;
}

function buildGroups(lines = [], options = []) {
  const groups = [];
  const map = new Map();
  let seen = 0;

  const ensure = (item) => {
    const meta = mainPostMeta(item);
    if (!map.has(meta.id)) {
      const group = { ...meta, lines: [], options: [], seen: seen++ };
      map.set(meta.id, group);
      groups.push(group);
    }
    return map.get(meta.id);
  };

  lines.forEach((line) => ensure(line).lines.push(line));
  options.forEach((option) => ensure(option).options.push(option));

  const order = new Map(OFFER_MAIN_POSTS.map((post, index) => [post.id, index]));
  return groups
    .filter((group) => group.lines.length || group.options.length)
    .sort((a, b) => {
      const ai = order.has(a.id) ? order.get(a.id) : Number.MAX_SAFE_INTEGER;
      const bi = order.has(b.id) ? order.get(b.id) : Number.MAX_SAFE_INTEGER;
      return ai !== bi ? ai - bi : a.seen - b.seen;
    });
}

function acceptedSnapshot(request = {}) {
  const acceptedPayload = request.acceptedPayload || {};
  const snapshot = acceptedPayload.version_snapshot || {};
  const rawLines =
    (Array.isArray(request.acceptedOfferLines) && request.acceptedOfferLines.length
      ? request.acceptedOfferLines
      : Array.isArray(snapshot.lines)
        ? snapshot.lines
        : request.offerLines) || [];
  const lines = getVisibleOfferLines(rawLines);
  const options =
    (Array.isArray(request.acceptedOptions) && request.acceptedOptions.length
      ? request.acceptedOptions
      : Array.isArray(acceptedPayload.selected_options)
        ? acceptedPayload.selected_options
        : []) || [];
  const termsMeta = getOfferTermsSnapshot(rawLines);
  const explicitTotal = request.acceptedTotal;
  const total =
    explicitTotal !== null && explicitTotal !== undefined && explicitTotal !== "" &&
    Number.isFinite(Number(explicitTotal))
      ? Number(explicitTotal)
      : getOfferTotal(lines) + getOfferTotal(options);

  return {
    rawLines,
    lines,
    options,
    title: clean(request.acceptedOfferTitle || snapshot.title || request.offerTitle || request.title || "Tilbud"),
    intro: request.acceptedOfferIntro || snapshot.intro || request.offerIntro || "",
    reservations:
      request.acceptedOfferReservations || snapshot.reservations || request.offerReservations || "",
    included:
      request.acceptedOfferIncluded || termsMeta.included || request.offerIncluded || "",
    excluded:
      request.acceptedOfferExcluded || termsMeta.excluded || request.offerExcluded || "",
    customerSupplied:
      request.acceptedOfferCustomerSupplied ||
      termsMeta.customerSupplied ||
      request.offerCustomerSupplied ||
      "",
    terms: request.acceptedOfferTerms || termsMeta.terms || request.offerTerms || "",
    paymentTerms:
      request.acceptedOfferPaymentTerms || termsMeta.paymentTerms || request.offerPaymentTerms || "",
    version:
      request.acceptedOfferVersionNumber ||
      acceptedPayload.version_number ||
      snapshot.version_number ||
      request.sentOfferVersionNumber ||
      "1",
    total,
  };
}

function getAcceptedVersionNumberMap(request = {}, accepted = {}) {
  const acceptedPayload = request.acceptedPayload || {};
  const snapshot = acceptedPayload.version_snapshot || {};

  const fullRawLines =
    (Array.isArray(snapshot.lines) && snapshot.lines.length
      ? snapshot.lines
      : Array.isArray(request.offerLines) && request.offerLines.length
        ? request.offerLines
        : accepted.rawLines || accepted.lines) || [];
  const fullLines = getVisibleOfferLines(fullRawLines);

  const fullOptions =
    (Array.isArray(snapshot.options) && snapshot.options.length
      ? snapshot.options
      : Array.isArray(snapshot.offerOptions) && snapshot.offerOptions.length
        ? snapshot.offerOptions
        : Array.isArray(request.offerOptions) && request.offerOptions.length
          ? request.offerOptions
          : accepted.options) || [];

  const fullGroups = buildGroups(fullLines, fullOptions);
  return new Map(fullGroups.map((group, index) => [group.id, index + 1]));
}

function companySnapshot(request = {}, companyProfile = {}, rawLines = []) {
  const meta = (Array.isArray(rawLines) ? rawLines : []).find((line) => line?.__companyMeta) || {};
  return {
    name: clean(request.companyName || meta.companyName || companyProfile.companyName || ""),
    org: clean(request.companyOrgNumber || meta.orgNumber || companyProfile.orgNumber || ""),
    address: clean(request.companyAddress || meta.address || companyProfile.address || ""),
    phone: clean(request.companyPhone || meta.phone || companyProfile.phone || ""),
    email: clean(request.companyEmail || meta.email || companyProfile.email || ""),
    website: clean(request.companyWebsite || meta.website || companyProfile.website || ""),
    logo: clean(request.companyLogoUrl || meta.logoUrl || companyProfile.logoUrl || ""),
  };
}

function formatAcceptedAt(value) {
  if (!value) return "Ikke registrert";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return clean(value);
  return new Intl.DateTimeFormat("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function looksLikeSubheading(text = "") {
  const value = clean(text);
  if (!value) return false;
  return (
    value.endsWith(":") ||
    (value.length < 56 &&
      !/[.!?]$/.test(value) &&
      /arbeider$|arbeid$|kvalitet$|gjennomføring$|tidslinje$|fordeler$/i.test(value))
  );
}

export async function createAcceptanceProofPdfPolished({
  selectedRequest,
  companyProfile = {},
}) {
  if (!selectedRequest) throw new Error("Akseptert tilbud mangler.");

  const module = await import("https://esm.sh/jspdf@2.5.1");
  const JsPDF = module.jsPDF || module.default?.jsPDF;
  if (!JsPDF) throw new Error("PDF-verktøyet kunne ikke lastes.");

  const accepted = acceptedSnapshot(selectedRequest);
  const company = companySnapshot(selectedRequest, companyProfile, accepted.rawLines);
  const groups = buildGroups(accepted.lines, accepted.options);
  const versionNumberMap = getAcceptedVersionNumberMap(selectedRequest, accepted);
  const offerId = clean(selectedRequest.id || "-");
  const acceptedBy = clean(selectedRequest.acceptedBy || selectedRequest.acceptedPayload?.accepted_by || "Kunde");
  const acceptedAt = selectedRequest.acceptedAt || selectedRequest.acceptedPayload?.accepted_at || "";
  const workAddress = [
    clean(selectedRequest.address),
    [clean(selectedRequest.postnr), clean(selectedRequest.city)].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(", ");

  const pdf = new JsPDF({ unit: "mm", format: "a4" });
  let y = 18;
  let section = 0;

  const font = (size = 9, style = "normal", color = COLORS.text) => {
    pdf.setFont("helvetica", style);
    pdf.setFontSize(size);
    pdf.setTextColor(...color);
  };

  const continuationHeader = () => {
    pdf.setFillColor(...COLORS.white);
    pdf.rect(0, 0, PAGE.width, 14, "F");
    pdf.setDrawColor(...COLORS.line);
    pdf.line(PAGE.left, 13, PAGE.right, 13);
    font(8.2, "bold", COLORS.ink);
    pdf.text("Akseptbevis", PAGE.left, 8.5);
    font(7.7, "normal", COLORS.muted);
    pdf.text(`Tilbud ${offerId} - v${accepted.version}`, PAGE.right, 8.5, { align: "right" });
    y = 20;
  };

  const newPage = () => {
    pdf.addPage();
    continuationHeader();
  };

  const ensure = (height = 10) => {
    if (y + height <= PAGE.bottom) return false;
    newPage();
    return true;
  };

  const sectionTitle = (label, note = "", minFollowing = 30) => {
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
    font(12.3, "bold", COLORS.ink);
    pdf.text(clean(label), PAGE.left + 16, y + 8.6);
    if (note) {
      font(7.5, "normal", COLORS.muted);
      const rows = pdf.splitTextToSize(clean(note), 66);
      pdf.text(rows.slice(0, 2), PAGE.right - 3, y + 5.6, { align: "right" });
    }
    y += height + 4;
  };

  const textRows = (text) => {
    const rows = [];
    String(text ?? "")
      .replace(/\r/g, "")
      .split(/\n+/)
      .map(clean)
      .filter(Boolean)
      .forEach((paragraph, paragraphIndex) => {
        const value = paragraph.replace(/^·\s*/, "- ");
        const heading = looksLikeSubheading(value);
        font(heading ? 8.7 : 8.6, heading ? "bold" : "normal", heading ? COLORS.ink : COLORS.text);
        pdf.splitTextToSize(value, WIDTH - 14).forEach((row, rowIndex) => {
          rows.push({
            text: row,
            heading,
            gap: paragraphIndex > 0 && rowIndex === 0 ? (heading ? 2.5 : 1.8) : 0,
            height: heading ? 4.4 : 4.5,
          });
        });
      });
    return rows;
  };

  const rowsHeight = (rows) => rows.reduce((sum, row) => sum + row.gap + row.height, 0);

  const textCardChunk = (label, rows, continued = false) => {
    const headerHeight = 11;
    const height = headerHeight + rowsHeight(rows) + 5;
    pdf.setFillColor(...COLORS.panel);
    pdf.setDrawColor(...COLORS.line);
    pdf.roundedRect(PAGE.left, y, WIDTH, height, 2.5, 2.5, "FD");
    font(continued ? 8.8 : 10.1, "bold", continued ? COLORS.muted : COLORS.ink);
    pdf.text(continued ? `${clean(label)} (forts.)` : clean(label), PAGE.left + 5, y + 6.5);
    let textY = y + headerHeight + 0.5;
    rows.forEach((row) => {
      textY += row.gap;
      font(row.heading ? 8.7 : 8.6, row.heading ? "bold" : "normal", row.heading ? COLORS.ink : COLORS.text);
      pdf.text(row.text, PAGE.left + 5, textY);
      textY += row.height;
    });
    y += height + 3;
  };

  const textCard = (label, text) => {
    if (!clean(text)) return;
    const rows = textRows(text);
    if (!rows.length) return;
    const fullHeight = 11 + rowsHeight(rows) + 5;
    if (fullHeight <= PAGE.bottom - 20 && y + fullHeight > PAGE.bottom) newPage();

    let index = 0;
    let continued = false;
    while (index < rows.length) {
      if (PAGE.bottom - y < 32) newPage();
      const available = PAGE.bottom - y - 16;
      let used = 0;
      let end = index;
      while (end < rows.length) {
        const next = rows[end].gap + rows[end].height;
        if (used + next > available) break;
        used += next;
        end += 1;
      }
      if (end === index) {
        newPage();
        continue;
      }
      const remaining = rows.length - end;
      if (remaining > 0 && remaining < 3 && end - index > 3) end -= remaining;
      textCardChunk(label, rows.slice(index, end), continued);
      index = end;
      continued = true;
      if (index < rows.length) newPage();
    }
  };

  const qty = (item) => quantityText(item);

  const measureLine = (line, replaced = false) => {
    const qText = qty(line);
    const note = replaced ? "Erstattet av valgt alternativ" : "";
    font(8.7, "bold", COLORS.ink);
    const titleRows = pdf.splitTextToSize(lineTitle(line), 96);
    font(7.3, "normal", COLORS.muted);
    const qRows = qText ? pdf.splitTextToSize(qText, 96) : [];
    const noteRows = note ? pdf.splitTextToSize(note, 96) : [];
    return Math.max(12, 5 + titleRows.length * 4.2 + qRows.length * 3.7 + noteRows.length * 3.7);
  };

  const mainHeader = (group, groupIndex) => {
    const firstReplacement = group.options.find((option) => isAlternative(option));
    const firstLineReplaced = Boolean(
      firstReplacement && group.lines.some((line) => String(line.id || "") === String(firstReplacement.replacementLineId || ""))
    );
    const nextHeight = group.lines.length
      ? measureLine(group.lines[0], firstLineReplaced)
      : group.options.length
        ? 27
        : 12;
    ensure(19 + Math.min(nextHeight, 36));

    const groupTotal = (getOfferTotal(group.lines) + getOfferTotal(group.options)) * 1.25;
    const groupNumber = versionNumberMap.get(group.id) || groupIndex + 1;
    pdf.setFillColor(...COLORS.tealSoft);
    pdf.setDrawColor(...COLORS.line);
    pdf.roundedRect(PAGE.left, y, WIDTH, 17, 2, 2, "FD");
    pdf.setFillColor(...COLORS.teal);
    pdf.circle(PAGE.left + 8, y + 8.5, 4.7, "F");
    font(7.7, "bold", COLORS.white);
    pdf.text(String(groupNumber).padStart(2, "0"), PAGE.left + 8, y + 9.2, { align: "center" });
    font(11.2, "bold", COLORS.ink);
    pdf.text(clean(group.title), PAGE.left + 16, y + 10);
    font(7.1, "bold", COLORS.muted);
    pdf.text("Akseptert sum", PAGE.right - 4, y + 5.5, { align: "right" });
    font(11.2, "bold", COLORS.ink);
    pdf.text(formatNok(groupTotal), PAGE.right - 4, y + 11, { align: "right" });
    font(6.8, "normal", COLORS.muted);
    pdf.text("inkl. mva.", PAGE.right - 4, y + 14.3, { align: "right" });
    y += 19;
  };

  const lineRow = (line, group, groupIndex, lineIndex) => {
    const replacingOption = group.options.find(
      (option) =>
        isAlternative(option) &&
        String(option.replacementLineId || "") === String(line.id || "")
    );
    const groupNumber = versionNumberMap.get(group.id) || groupIndex + 1;
    const qText = qty(line);
    font(8.7, "bold", COLORS.ink);
    const titleRows = pdf.splitTextToSize(lineTitle(line), 96);
    font(7.3, "normal", COLORS.muted);
    const qRows = qText ? pdf.splitTextToSize(qText, 96) : [];
    const replaceRows = replacingOption
      ? pdf.splitTextToSize(`Erstattet av valgt alternativ: ${clean(replacingOption.title) || "Alternativ"}`, 96)
      : [];
    const links = [line.productUrl, line.attachmentFile?.customerVisible !== false ? line.attachmentFile?.url : ""].filter(Boolean);
    const height = Math.max(
      12,
      5 + titleRows.length * 4.2 + qRows.length * 3.7 + replaceRows.length * 3.7 + links.length * 3.8
    );
    ensure(height + 2);
    const top = y;
    pdf.setFillColor(...COLORS.white);
    pdf.setDrawColor(...COLORS.line);
    pdf.roundedRect(PAGE.left, y, WIDTH, height, 1.8, 1.8, "FD");
    font(8.1, "bold", COLORS.tealDark);
    pdf.text(`${String(groupNumber).padStart(2, "0")}.${lineIndex + 1}`, PAGE.left + 4, y + 6.5);
    let textY = y + 6.5;
    font(8.7, "bold", COLORS.ink);
    titleRows.forEach((row) => {
      pdf.text(row, PAGE.left + 18, textY);
      textY += 4.2;
    });
    if (qRows.length) {
      font(7.3, "normal", COLORS.muted);
      qRows.forEach((row) => {
        pdf.text(row, PAGE.left + 18, textY);
        textY += 3.7;
      });
    }
    if (replaceRows.length) {
      font(7.4, "bold", COLORS.tealDark);
      replaceRows.forEach((row) => {
        pdf.text(row, PAGE.left + 18, textY);
        textY += 3.7;
      });
    }
    if (line.productUrl) {
      font(7, "bold", COLORS.tealDark);
      pdf.textWithLink("Produkt / dokumentasjon", PAGE.left + 18, textY, { url: line.productUrl });
      textY += 3.8;
    }
    if (line.attachmentFile?.url && line.attachmentFile?.customerVisible !== false) {
      font(7, "bold", COLORS.tealDark);
      pdf.textWithLink(`Vedlegg: ${clean(line.attachmentFile.name) || "Åpne vedlegg"}`, PAGE.left + 18, textY, {
        url: line.attachmentFile.url,
      });
    }
    font(9.8, "bold", replacingOption ? COLORS.muted : COLORS.ink);
    pdf.text(
      replacingOption ? "Grunnpris" : formatNok(getOfferTotal([line]) * 1.25),
      PAGE.right - 4,
      top + 7.2,
      { align: "right" }
    );
    font(6.7, "normal", COLORS.muted);
    pdf.text(replacingOption ? "inngår i grunnsum" : "inkl. mva.", PAGE.right - 4, top + 10.5, { align: "right" });
    y += height + 2;
  };

  const optionCard = (option, groupLines = []) => {
    const label = optionLabel(option, groupLines);
    const title = clean(option.title) || "Opsjon";
    const description = clean(option.description);
    const qText = qty(option);
    const amount = getOfferTotal([option]) * 1.25;
    const prefix = amount > 0 ? "+" : amount < 0 ? "-" : "";
    const price = amount === 0 ? "Ingen prisendring" : `${prefix} ${formatNok(Math.abs(amount))}`;

    font(8.8, "bold", COLORS.ink);
    const titleRows = pdf.splitTextToSize(title, 106);
    font(7.5, "normal", COLORS.text);
    const descriptionRows = description ? pdf.splitTextToSize(description, 106) : [];
    const qRows = qText ? pdf.splitTextToSize(qText, 106) : [];
    const replacementRows = isAlternative(option)
      ? pdf.splitTextToSize(`Erstatter: ${replacementText(option, groupLines)}`, 106)
      : [];
    const height =
      17 +
      titleRows.length * 4.1 +
      descriptionRows.length * 3.7 +
      qRows.length * 3.7 +
      replacementRows.length * 3.7;
    ensure(height + 2);

    pdf.setFillColor(...COLORS.greenSoft);
    pdf.setDrawColor(...COLORS.line);
    pdf.roundedRect(PAGE.left + 5, y, WIDTH - 5, height, 2, 2, "FD");
    pdf.setFillColor(...COLORS.green);
    pdf.roundedRect(PAGE.left + 9, y + 4, 54, 5.5, 2.5, 2.5, "F");
    font(6.3, "bold", COLORS.white);
    pdf.text(label.slice(0, 47), PAGE.left + 11, y + 7.7);

    let textY = y + 15;
    font(8.8, "bold", COLORS.ink);
    titleRows.forEach((row) => {
      pdf.text(row, PAGE.left + 10, textY);
      textY += 4.1;
    });
    if (replacementRows.length) {
      font(7.4, "bold", COLORS.tealDark);
      replacementRows.forEach((row) => {
        pdf.text(row, PAGE.left + 10, textY);
        textY += 3.7;
      });
    }
    if (qRows.length) {
      font(7.4, "normal", COLORS.muted);
      qRows.forEach((row) => {
        pdf.text(row, PAGE.left + 10, textY);
        textY += 3.7;
      });
    }
    if (descriptionRows.length) {
      font(7.6, "normal", COLORS.text);
      descriptionRows.forEach((row) => {
        pdf.text(row, PAGE.left + 10, textY);
        textY += 3.7;
      });
    }
    font(9.8, "bold", COLORS.ink);
    pdf.text(price, PAGE.right - 4, y + 17, { align: "right" });
    if (amount !== 0) {
      font(6.7, "normal", COLORS.muted);
      pdf.text("inkl. mva.", PAGE.right - 4, y + 20.2, { align: "right" });
    }
    y += height + 2;
  };

  const hero = async () => {
    pdf.setFillColor(...COLORS.white);
    pdf.rect(0, 0, PAGE.width, 62, "F");
    pdf.setFillColor(...COLORS.tealDark);
    pdf.rect(0, 0, 5, 62, "F");
    pdf.setDrawColor(...COLORS.line);
    pdf.line(PAGE.left, 61, PAGE.right, 61);

    pdf.setFillColor(...COLORS.greenSoft);
    pdf.roundedRect(PAGE.left, 11, 31, 7, 3.5, 3.5, "F");
    font(7.2, "bold", COLORS.green);
    pdf.text("AKSEPTBEVIS", PAGE.left + 15.5, 15.6, { align: "center" });

    font(19, "bold", COLORS.ink);
    pdf.text("Tilbud akseptert", PAGE.left, 29);
    font(11.2, "bold", COLORS.text);
    pdf.text(pdf.splitTextToSize(accepted.title, 112).slice(0, 2), PAGE.left, 38);
    font(8, "normal", COLORS.muted);
    pdf.text(`Tilbud ${offerId}  ·  v${accepted.version}  ·  akseptert ${formatAcceptedAt(acceptedAt)}`, PAGE.left, 52);

    if (company.logo) {
      try {
        const response = await fetch(company.logo, { cache: "force-cache" });
        if (!response.ok) throw new Error("Firmalogo kunne ikke hentes");
        const blob = await response.blob();
        const dataUrl = await readFileAsDataUrl(blob, "Firmalogo kunne ikke leses");
        const size = await getImageNaturalSize(dataUrl, "Firmalogo har ugyldig format");
        const scale = Math.min(46 / size.width, 23 / size.height);
        const width = size.width * scale;
        const height = size.height * scale;
        pdf.addImage(dataUrl, blob.type.includes("png") ? "PNG" : "JPEG", PAGE.right - width, 17, width, height);
      } catch (error) {
        console.warn("Firmalogo kunne ikke legges inn i akseptbevis", error);
      }
    } else if (company.name) {
      font(10.5, "bold", COLORS.ink);
      pdf.text(company.name, PAGE.right, 27, { align: "right" });
    }

    y = 68;
    const meta = [
      ["Kunde", clean(selectedRequest.customer || "Ikke registrert")],
      ["Arbeidssted", workAddress || "Ikke registrert"],
      ["Akseptert av", acceptedBy],
      ["Aksepttidspunkt", formatAcceptedAt(acceptedAt)],
    ];
    const colWidth = (WIDTH - 4) / 2;
    meta.forEach(([label, value], index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;
      const x = PAGE.left + col * (colWidth + 4);
      const top = y + row * 15;
      pdf.setFillColor(...COLORS.panel);
      pdf.setDrawColor(...COLORS.line);
      pdf.roundedRect(x, top, colWidth, 12, 2, 2, "FD");
      font(6.7, "bold", COLORS.muted);
      pdf.text(label.toUpperCase(), x + 4, top + 4);
      font(8.6, "bold", COLORS.ink);
      pdf.text((pdf.splitTextToSize(value, colWidth - 8)[0] || "-"), x + 4, top + 9);
    });
    y += 34;

    pdf.setFillColor(...COLORS.greenSoft);
    pdf.setDrawColor(...COLORS.green);
    pdf.setLineWidth(0.45);
    pdf.roundedRect(PAGE.left, y, WIDTH, 23, 3, 3, "FD");
    font(8.4, "bold", COLORS.green);
    pdf.text("AKSEPTERT TOTAL INKL. MVA.", PAGE.left + 6, y + 8);
    font(17, "bold", COLORS.ink);
    pdf.text(formatNok(accepted.total * 1.25), PAGE.right - 6, y + 11.5, { align: "right" });
    font(7.2, "normal", COLORS.muted);
    pdf.text(
      accepted.options.length
        ? `${accepted.options.length} valgt(e) opsjon(er) inngår i aksepten.`
        : "Ingen opsjoner ble valgt ved aksept.",
      PAGE.left + 6,
      y + 17
    );
    y += 29;
  };

  await hero();

  sectionTitle("Bekreftet digital aksept", "Låst dokumentasjon av tilbudsversjonen som kunden aksepterte.", 34);
  textCard(
    "Bekreftelse",
    "Kunden har digitalt bekreftet at tilbudet, valgte opsjoner, leveranseomfang, forbehold, vilkår og betalingsbetingelser er lest og akseptert.\nDokumentet er opprettet fra den aksepterte tilbudsversjonen og skal ikke redigeres. Eventuelle senere endringer må håndteres som ny avtale, tilbudsversjon eller avtaleendring."
  );

  if (clean(accepted.intro)) {
    sectionTitle("Om tilbudet", "", 32);
    textCard("Innledning", accepted.intro);
  }

  if (clean(accepted.reservations)) {
    sectionTitle("Forutsetninger og forbehold", "", 44);
    textCard("Forutsetninger og forbehold", accepted.reservations);
  }

  if (clean(accepted.included) || clean(accepted.excluded) || clean(accepted.customerSupplied)) {
    sectionTitle("Leveranseomfang", "", 40);
    textCard("Dette er inkludert", accepted.included);
    textCard("Dette er ikke inkludert", accepted.excluded);
    textCard("Dette sørger kunden for", accepted.customerSupplied);
  }

  sectionTitle(
    "Aksepterte arbeider og priser",
    "Alle priser er inkl. mva. Kun opsjoner kunden faktisk valgte er med i akseptbeviset.",
    42
  );

  groups.forEach((group, groupIndex) => {
    mainHeader(group, groupIndex);
    group.lines.forEach((line, lineIndex) => lineRow(line, group, groupIndex, lineIndex));
    if (group.options.length) {
      ensure(12 + 27);
      font(8.5, "bold", COLORS.green);
      pdf.text("Valgte opsjoner", PAGE.left + 5, y + 5);
      y += 8;
      group.options.forEach((option) => optionCard(option, group.lines));
    }
    y += 4;
  });

  ensure(28);
  pdf.setFillColor(...COLORS.greenSoft);
  pdf.setDrawColor(...COLORS.green);
  pdf.setLineWidth(0.45);
  pdf.roundedRect(PAGE.left, y, WIDTH, 23, 3, 3, "FD");
  font(8.5, "bold", COLORS.green);
  pdf.text("AKSEPTERT TOTAL INKL. MVA.", PAGE.left + 6, y + 8);
  font(17, "bold", COLORS.ink);
  pdf.text(formatNok(accepted.total * 1.25), PAGE.right - 6, y + 11.5, { align: "right" });
  font(7.2, "normal", COLORS.muted);
  pdf.text(`Tilbud ${offerId} - versjon ${accepted.version}`, PAGE.left + 6, y + 17);
  y += 29;

  if (clean(accepted.terms) || clean(accepted.paymentTerms)) {
    sectionTitle("Vilkår og betaling", "", 36);
    const combined = [
      clean(accepted.terms),
      clean(accepted.paymentTerms) ? `Betalingsbetingelser:\n${accepted.paymentTerms}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");
    textCard("Avtalebetingelser", combined);
  }

  ensure(36);
  pdf.setFillColor(...COLORS.panel);
  pdf.setDrawColor(...COLORS.line);
  pdf.roundedRect(PAGE.left, y, WIDTH, 28, 2.5, 2.5, "FD");
  font(9.5, "bold", COLORS.ink);
  pdf.text("Dokumentasjon", PAGE.left + 5, y + 7);
  font(8, "normal", COLORS.text);
  pdf.text(`Akseptert av: ${acceptedBy}`, PAGE.left + 5, y + 13);
  pdf.text(`Aksepttidspunkt: ${formatAcceptedAt(acceptedAt)}`, PAGE.left + 5, y + 18);
  pdf.text(`Tilbud: ${offerId} - v${accepted.version}`, PAGE.left + 5, y + 23);
  font(7.3, "normal", COLORS.muted);
  pdf.text("Dette er et låst akseptbevis generert fra akseptert tilbudsversjon i Expo ProffDok.", PAGE.right - 5, y + 23, { align: "right" });
  y += 32;

  const pageCount = pdf.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    pdf.setPage(page);
    font(7, "normal", COLORS.muted);
    pdf.text(`Akseptbevis ${offerId} - v${accepted.version}`, PAGE.left, 289);
    pdf.text(`side ${page} av ${pageCount}`, PAGE.right, 289, { align: "right" });
  }

  const version = accepted.version || "1";
  const fileName = `Akseptbevis-${sanitizeStoragePart(offerId)}-v${version}.pdf`;
  return { blob: pdf.output("blob"), fileName, version };
}
