// Expo ProffDok – FASE 26B.5.2
// Oppretter nedlastbar PDF fra faktisk publisert tilbudsversjon.
// PDF-en er et kunde-/arkiveksemplar med priser inkl. mva. og uten interne varenummer.
// Ingen database-, RLS-, Storage- eller Edge Function-endring.

import {
  formatNok,
  getOfferTermsSnapshot,
  getOfferTotal,
  getVisibleOfferLines,
  sanitizeStoragePart,
} from "../utils/salesUtils.js";
import { getImageNaturalSize, readFileAsDataUrl } from "./salesImages.js";

const LEGACY_MAIN_POST = {
  id: "ovrige-arbeider",
  title: "Øvrige arbeider",
};

function getMainPostMeta(item = {}) {
  return {
    id:
      String(item.mainPostId || LEGACY_MAIN_POST.id).trim() ||
      LEGACY_MAIN_POST.id,
    title:
      String(item.mainPostTitle || LEGACY_MAIN_POST.title).trim() ||
      LEGACY_MAIN_POST.title,
  };
}

function buildOfferGroups(lines = [], options = []) {
  const groups = [];
  const groupMap = new Map();

  function ensureGroup(item) {
    const meta = getMainPostMeta(item);

    if (!groupMap.has(meta.id)) {
      const group = { ...meta, lines: [], options: [] };
      groupMap.set(meta.id, group);
      groups.push(group);
    }

    return groupMap.get(meta.id);
  }

  lines.forEach((line) => ensureGroup(line).lines.push(line));
  options.forEach((option) => ensureGroup(option).options.push(option));

  return groups.filter((group) => group.lines.length || group.options.length);
}

function lineTitle(line = {}) {
  const description = String(line.description || "Tilbudspost").trim();

  if (
    line.lineType === "administration" &&
    line.adminMode === "percent" &&
    String(line.adminPercent || "").trim()
  ) {
    return `${description} (${line.adminPercent} %)`;
  }

  return description;
}

function optionPriceText(option = {}) {
  const amountInclVat = getOfferTotal([option]) * 1.25;
  if (amountInclVat === 0) return "Ingen prisendring";
  const prefix = amountInclVat > 0 ? "+" : "-";
  return `${prefix} ${formatNok(Math.abs(amountInclVat))} inkl. mva.`;
}

function normalizeWebUrl(value = "") {
  const clean = String(value || "").trim();
  if (!clean) return "";
  if (/^https?:\/\//i.test(clean)) return clean;
  return `https://${clean}`;
}

export async function createPublishedOfferPdf({ selectedRequest }) {
  if (!selectedRequest) throw new Error("Publisert tilbud mangler.");

  const module = await import("https://esm.sh/jspdf@2.5.1");
  const JsPDF = module.jsPDF || module.default?.jsPDF;
  if (!JsPDF) throw new Error("PDF-verktøyet kunne ikke lastes.");

  const pdf = new JsPDF({ unit: "mm", format: "a4" });
  const left = 18;
  const right = 192;
  const width = right - left;
  const lineHeight = 5.2;
  let y = 20;

  const offerCompany = {
    companyName: selectedRequest.companyName || "",
    orgNumber: selectedRequest.companyOrgNumber || "",
    address: selectedRequest.companyAddress || "",
    phone: selectedRequest.companyPhone || "",
    email: selectedRequest.companyEmail || "",
    website: selectedRequest.companyWebsite || "",
    logoUrl: selectedRequest.companyLogoUrl || "",
  };

  const offerLines = getVisibleOfferLines(selectedRequest.offerLines || []);
  const offerOptions = Array.isArray(selectedRequest.offerOptions)
    ? selectedRequest.offerOptions
    : [];
  const offerGroups = buildOfferGroups(offerLines, offerOptions);
  const offerTotal = Number(selectedRequest.offerTotal || 0);
  const termsSnapshot = getOfferTermsSnapshot(selectedRequest.offerLines || []);
  const offerTerms = termsSnapshot.terms || selectedRequest.offerTerms || "";
  const offerIncluded = termsSnapshot.included || selectedRequest.offerIncluded || "";
  const offerExcluded = termsSnapshot.excluded || selectedRequest.offerExcluded || "";
  const offerCustomerSupplied =
    termsSnapshot.customerSupplied || selectedRequest.offerCustomerSupplied || "";
  const offerPaymentTerms =
    termsSnapshot.paymentTerms || selectedRequest.offerPaymentTerms || "";

  const ensureSpace = (height = 12) => {
    if (y + height <= 278) return;
    pdf.addPage();
    y = 20;
  };

  const addText = (text, options = {}) => {
    const value = String(text || "").trim();
    if (!value) return;
    const size = options.size || 10;
    const style = options.style || "normal";
    const lines = pdf.splitTextToSize(value, options.width || width);
    ensureSpace(lines.length * lineHeight + (options.after || 2));
    pdf.setFont("helvetica", style);
    pdf.setFontSize(size);
    pdf.setTextColor(options.color || "#183b46");
    pdf.text(lines, options.x || left, y);
    y += lines.length * lineHeight + (options.after ?? 2);
  };

  const addLink = (label, url, options = {}) => {
    const cleanUrl = normalizeWebUrl(url);
    if (!cleanUrl) return;
    ensureSpace(7);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(options.size || 8.5);
    pdf.setTextColor("#0e8f98");
    pdf.textWithLink(String(label || cleanUrl), options.x || left, y, {
      url: cleanUrl,
    });
    y += lineHeight + (options.after ?? 1);
  };

  const addSection = (title, text) => {
    if (!String(text || "").trim()) return;
    ensureSpace(18);
    addText(title, { size: 11, style: "bold", after: 1 });
    addText(text, { size: 9.5, after: 4 });
  };

  const addItemLinks = (item = {}) => {
    if (item.productUrl) {
      addLink("Produkt / dokumentasjon", item.productUrl, {
        x: left + 5,
        size: 8,
      });
    }
    if (item.attachmentFile?.url) {
      addLink(
        `Vedlegg: ${item.attachmentFile.name || "Åpne vedlegg"}`,
        item.attachmentFile.url,
        { x: left + 5, size: 8 }
      );
    }
  };

  pdf.setFillColor(16, 92, 106);
  pdf.rect(0, 0, 210, 38, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.text("TILBUD", left, 17);
  pdf.setFontSize(9.5);
  pdf.text(
    offerCompany.companyName || "Expo ProffDok",
    left,
    25
  );
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.text("Publisert tilbud fra Expo ProffDok", left, 31);

  if (offerCompany.logoUrl) {
    try {
      const logoResponse = await fetch(offerCompany.logoUrl, {
        cache: "force-cache",
      });
      if (!logoResponse.ok) throw new Error("Firmalogoen kunne ikke hentes.");
      const logoBlob = await logoResponse.blob();
      const logoDataUrl = await readFileAsDataUrl(
        logoBlob,
        "Firmalogoen kunne ikke leses."
      );
      const logoSize = await getImageNaturalSize(
        logoDataUrl,
        "Firmalogoen har ugyldig bildeformat."
      );
      const maxWidth = 46;
      const maxHeight = 24;
      const scale = Math.min(
        maxWidth / logoSize.width,
        maxHeight / logoSize.height
      );
      const logoWidth = logoSize.width * scale;
      const logoHeight = logoSize.height * scale;
      const logoFormat = logoBlob.type.includes("png") ? "PNG" : "JPEG";
      pdf.addImage(
        logoDataUrl,
        logoFormat,
        right - logoWidth,
        (38 - logoHeight) / 2,
        logoWidth,
        logoHeight
      );
    } catch (error) {
      console.warn("Firmalogo kunne ikke legges inn i tilbuds-PDF", error);
    }
  }

  y = 48;

  addText(
    selectedRequest.offerTitle || selectedRequest.title || "Tilbud",
    { size: 16, style: "bold", after: 5 }
  );
  addText(`Tilbud nr.: ${selectedRequest.id || "-"}`, {
    style: "bold",
    after: 1,
  });
  addText(
    `Tilbudsversjon: v${selectedRequest.sentOfferVersionNumber || "-"}`,
    { after: 1 }
  );
  addText(`Kunde: ${selectedRequest.customer || "-"}`, { after: 1 });
  addText(`Arbeidssted: ${selectedRequest.address || "-"}`, { after: 1 });
  addText(
    `Gyldighet: ${selectedRequest.offerValidityDays || "30"} dager`,
    { after: 5 }
  );

  const companyDetails = [
    offerCompany.orgNumber ? `Org.nr. ${offerCompany.orgNumber}` : "",
    offerCompany.address,
    offerCompany.phone,
    offerCompany.email,
    offerCompany.website,
  ].filter(Boolean);

  if (offerCompany.companyName || companyDetails.length) {
    addSection(
      "Tilbud fra",
      [offerCompany.companyName, ...companyDetails].filter(Boolean).join("\n")
    );
  }

  addSection("Innledning", selectedRequest.offerIntro || "");

  if (offerGroups.length) {
    addText("Arbeider og priser", { size: 12, style: "bold", after: 1 });
    addText("Alle priser er oppgitt inkl. mva.", {
      size: 8.5,
      after: 3,
    });

    offerGroups.forEach((group, groupIndex) => {
      ensureSpace(18);
      addText(`${groupIndex + 1}. ${group.title}`, {
        size: 11,
        style: "bold",
        after: 1,
      });

      group.lines.forEach((line, lineIndex) => {
        addText(
          `${groupIndex + 1}.${lineIndex + 1} ${lineTitle(line)} - ${formatNok(
            getOfferTotal([line]) * 1.25
          )} inkl. mva.`,
          { size: 9.3, after: 1 }
        );
        addItemLinks(line);
      });

      if (group.options.length) {
        addText("Opsjoner", { size: 9.5, style: "bold", after: 1 });
        group.options.forEach((option) => {
          const replacementLine = group.lines.find(
            (line) => String(line.id) === String(option.replacementLineId || "")
          );
          const typeText =
            option.optionType === "alternative"
              ? `Alternativ / erstatter${
                  replacementLine ? `: ${lineTitle(replacementLine)}` : ""
                }`
              : "Tillegg / oppgradering";
          addText(
            `${option.title || "Opsjon"} - ${typeText} - ${optionPriceText(
              option
            )}`,
            { size: 8.8, after: 1 }
          );
          if (option.description) {
            addText(option.description, {
              size: 8.2,
              x: left + 5,
              width: width - 5,
              after: 1,
            });
          }
          addItemLinks(option);
        });
      }

      addText(
        `Sum ${group.title} inkl. mva.: ${formatNok(
          getOfferTotal(group.lines) * 1.25
        )}`,
        { size: 9.5, style: "bold", after: 4 }
      );
    });
  }

  addText(
    `Tilbudssum før valg av opsjoner inkl. mva.: ${formatNok(
      offerTotal * 1.25
    )}`,
    { size: 11.5, style: "bold", after: 2 }
  );
  if (offerOptions.length) {
    addText(
      "Opsjoner er ikke inkludert i tilbudssummen før kunden eventuelt velger dem.",
      { size: 8.5, after: 5 }
    );
  }

  addSection(
    "Forutsetninger og forbehold",
    selectedRequest.offerReservations || ""
  );
  addSection("Dette er inkludert", offerIncluded);
  addSection("Dette er ikke inkludert", offerExcluded);
  addSection("Dette sørger kunden for", offerCustomerSupplied);
  addSection("Vilkår", offerTerms);
  addSection("Betalingsbetingelser", offerPaymentTerms);

  addText("Dokumentinformasjon", { size: 10.5, style: "bold", after: 1 });
  addText(
    "Dette PDF-eksemplaret er opprettet fra den publiserte tilbudsversjonen i Expo ProffDok. Bedriften er selv ansvarlig for å laste ned og arkivere endelig tilbud i eget dokumentarkiv.",
    { size: 8.5, after: 2 }
  );

  const pageCount = pdf.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    pdf.setPage(page);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(80, 100, 108);
    pdf.text(
      `Tilbud ${selectedRequest.id || ""} - v${
        selectedRequest.sentOfferVersionNumber || "-"
      } - side ${page} av ${pageCount}`,
      left,
      290
    );
  }

  const blob = pdf.output("blob");
  const version = selectedRequest.sentOfferVersionNumber || "1";
  const fileName = `Tilbud-${sanitizeStoragePart(
    selectedRequest.id || "tilbud"
  )}-v${version}.pdf`;

  return { blob, fileName, version };
}
