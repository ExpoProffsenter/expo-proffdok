// Expo ProffDok - FASE 26B.5
// Akseptbeviset skiller mellom valgte tillegg og alternativer som erstatter konkret underpost.\n// Akseptbeviset speiler hovedposter, underposter, valgte opsjoner og vedleggsreferanser fra akseptert tilbudsversjon.
// Kundevendte priser vises inkl. mva.; intern lagringsmodell beholdes eks. mva. Ingen SQL/RLS/Storage/Edge-endring.
// Expo ProffDok - FASE 26A
// Akseptbeviset viser kundevendte priser inkl. mva. Intern lagrings- og akseptmodell beholdes uendret eks. mva.
// Ingen SQL/RLS/Storage/Edge Function/e-postendring.
// Expo ProffDok - FASE 23G
// Oppretter låst PDF-bevis fra en akseptert, publisert tilbudsversjon.
// Ingen React-state, Supabase-kall, Storage-regler eller UI-rendering.

import {
  formatNok,
  getOfferTotal,
  getVisibleOfferLines,
  sanitizeStoragePart,
} from "../utils/salesUtils.js";
import {
  getImageNaturalSize,
  readFileAsDataUrl,
} from "./salesImages.js";

const LEGACY_MAIN_POST = {
  id: "ovrige-arbeider",
  title: "Øvrige arbeider",
};

function getMainPostMeta(item = {}) {
  return {
    id: String(item.mainPostId || LEGACY_MAIN_POST.id).trim() || LEGACY_MAIN_POST.id,
    title:
      String(item.mainPostTitle || LEGACY_MAIN_POST.title).trim() ||
      LEGACY_MAIN_POST.title,
  };
}

function buildAcceptedOfferGroups(lines = [], options = []) {
  const groups = [];
  const groupMap = new Map();

  function ensureGroup(item) {
    const meta = getMainPostMeta(item);

    if (!groupMap.has(meta.id)) {
      const group = {
        ...meta,
        lines: [],
        options: [],
      };
      groupMap.set(meta.id, group);
      groups.push(group);
    }

    return groupMap.get(meta.id);
  }

  lines.forEach((line) => {
    ensureGroup(line).lines.push(line);
  });

  options.forEach((option) => {
    ensureGroup(option).options.push(option);
  });

  return groups.filter((group) => group.lines.length || group.options.length);
}

function getCustomerLineTitle(line = {}) {
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

function isAlternativeOption(option = {}) {
  return option?.optionType === "alternative";
}

function getSignedOptionAmountText(option = {}) {
  const amountInclVat = getOfferTotal([option]) * 1.25;

  if (amountInclVat === 0) return "ingen prisendring";

  const prefix = amountInclVat > 0 ? "+" : "−";
  return `${prefix} ${formatNok(Math.abs(amountInclVat))} inkl. mva.`;
}

function isReductionOption(option = {}) {
  return !isAlternativeOption(option) && getOfferTotal([option]) < 0;
}

function getReplacementLineDescription(option = {}, lines = []) {
  return (
    String(option?.replacementLineDescription || "").trim() ||
    String(
      (Array.isArray(lines) ? lines : []).find(
        (line) =>
          String(line?.id || "") ===
          String(option?.replacementLineId || "")
      )?.description || ""
    ).trim() ||
    "underposten som ble valgt i tilbudet"
  );
}

export async function createAcceptanceProofPdf({
  selectedRequest,
  companyProfile = {},
}) {
  const module = await import("https://esm.sh/jspdf@2.5.1");
  const JsPDF = module.jsPDF || module.default?.jsPDF;
  if (!JsPDF) throw new Error("PDF-verktøyet kunne ikke lastes.");

  const pdf = new JsPDF({ unit: "mm", format: "a4" });
  const left = 18;
  const right = 192;
  const lineHeight = 5.2;
  let y = 20;
  const acceptanceCompany = {
    companyName:
      selectedRequest.companyName || companyProfile.companyName || "",
    orgNumber:
      selectedRequest.companyOrgNumber || companyProfile.orgNumber || "",
    address:
      selectedRequest.companyAddress || companyProfile.address || "",
    phone:
      selectedRequest.companyPhone || companyProfile.phone || "",
    email:
      selectedRequest.companyEmail || companyProfile.email || "",
    website:
      selectedRequest.companyWebsite || companyProfile.website || "",
    logoUrl:
      selectedRequest.companyLogoUrl || companyProfile.logoUrl || "",
  };
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
    const lines = pdf.splitTextToSize(value, options.width || right - left);
    ensureSpace(lines.length * lineHeight + (options.after || 2));
    pdf.setFont("helvetica", style);
    pdf.setFontSize(size);
    pdf.setTextColor(options.color || "#183b46");
    pdf.text(lines, left, y);
    y += lines.length * lineHeight + (options.after ?? 2);
  };
  const addSection = (title, text) => {
    if (!String(text || "").trim()) return;
    ensureSpace(18);
    addText(title, { size: 11, style: "bold", after: 1 });
    addText(text, { size: 9.5, after: 4 });
  };
  const addLinkText = (label, url, options = {}) => {
    const linkLabel = String(label || "").trim();
    const linkUrl = String(url || "").trim();
    if (!linkLabel || !linkUrl) return;

    ensureSpace(lineHeight + (options.after ?? 1));
    pdf.setFont("helvetica", options.style || "normal");
    pdf.setFontSize(options.size || 8);
    pdf.setTextColor(options.color || "#0b8790");
    pdf.textWithLink(linkLabel, left, y, { url: linkUrl });
    y += lineHeight + (options.after ?? 1);
  };

  pdf.setFillColor(16, 92, 106);
  pdf.rect(0, 0, 210, 38, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.text("AKSEPTBEVIS", left, 17);
  pdf.setFontSize(9.5);
  pdf.text(
    acceptanceCompany.companyName || "Dokumentasjon av digital kundeaksept",
    left,
    25
  );
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.text("Dokumentert i Expo ProffDok", left, 31);

  if (acceptanceCompany.logoUrl) {
    try {
      const logoResponse = await fetch(acceptanceCompany.logoUrl, {
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
    } catch (logoError) {
      console.warn("Firmalogo kunne ikke legges inn i akseptbeviset", logoError);
    }
  }
  y = 48;

  addText(
    selectedRequest.acceptedOfferTitle ||
      selectedRequest.offerTitle ||
      selectedRequest.title ||
      "Tilbud",
    { size: 16, style: "bold", after: 5 }
  );
  addText(`Tilbud nr.: ${selectedRequest.id}`, { style: "bold", after: 1 });
  addText(
    `Tilbudsversjon: v${
      selectedRequest.acceptedOfferVersionNumber ||
      selectedRequest.sentOfferVersionNumber ||
      "-"
    }`,
    { after: 1 }
  );
  addText(`Akseptert av: ${selectedRequest.acceptedBy || "Kunde"}`, {
    after: 1,
  });
  addText(
    `Aksepttidspunkt: ${
      selectedRequest.acceptedAt
        ? new Date(selectedRequest.acceptedAt).toLocaleString("nb-NO")
        : "Ikke registrert"
    }`,
    { after: 1 }
  );
  addText(`Kunde: ${selectedRequest.customer || "-"}`, { after: 1 });
  const acceptanceWorkAddress = [
    selectedRequest.address,
    [selectedRequest.postnr, selectedRequest.city].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(", ");
  addText(`Arbeidssted: ${acceptanceWorkAddress || "-"}`, { after: 5 });

  const companyDetails = [
    acceptanceCompany.orgNumber
      ? `Org.nr. ${acceptanceCompany.orgNumber}`
      : "",
    acceptanceCompany.address,
    acceptanceCompany.phone,
    acceptanceCompany.email,
    acceptanceCompany.website,
  ].filter(Boolean);
  if (acceptanceCompany.companyName || companyDetails.length) {
    addSection(
      "Utførende bedrift",
      [acceptanceCompany.companyName, ...companyDetails]
        .filter(Boolean)
        .join("\n")
    );
  }

  addSection("Innledning", selectedRequest.acceptedOfferIntro);
  const acceptedLines = getVisibleOfferLines(
    selectedRequest.acceptedOfferLines || selectedRequest.offerLines || []
  );
  const acceptedOptions = Array.isArray(selectedRequest.acceptedOptions)
    ? selectedRequest.acceptedOptions
    : [];
  const acceptedGroups = buildAcceptedOfferGroups(
    acceptedLines,
    acceptedOptions
  );

  if (acceptedGroups.length) {
    addText("Aksepterte arbeider og priser", {
      size: 11,
      style: "bold",
      after: 1,
    });
    addText("Alle priser er oppgitt inkl. mva.", {
      size: 8.5,
      after: 3,
    });

    acceptedGroups.forEach((group, groupIndex) => {
      ensureSpace(20);
      addText(`${groupIndex + 1}. ${group.title}`, {
        size: 10.5,
        style: "bold",
        after: 1,
      });

      group.lines.forEach((line, lineIndex) => {
        const replacingOption = group.options.find(
          (option) =>
            isAlternativeOption(option) &&
            String(option.replacementLineId || "") === String(line.id || "")
        );

        addText(
          replacingOption
            ? `${groupIndex + 1}.${lineIndex + 1} ${getCustomerLineTitle(
                line
              )} - erstattet av valgt alternativ: ${
                replacingOption.title || "Alternativ"
              }. Grunnprisen inngår i tilbudssummen.`
            : `${groupIndex + 1}.${lineIndex + 1} ${getCustomerLineTitle(
                line
              )} - ${formatNok(getOfferTotal([line]) * 1.25)} inkl. mva.`,
          { size: 9.5, after: 1 }
        );

        if (line.productUrl) {
          addLinkText("Åpne produkt / dokumentasjon", line.productUrl, {
            size: 8,
            after: 1,
          });
        }

        if (
          line.attachmentFile?.customerVisible !== false &&
          (line.attachmentFile?.name || line.attachmentFile?.url)
        ) {
          if (line.attachmentFile.url) {
            addLinkText(
              `Åpne vedlegg: ${line.attachmentFile.name || "PDF-vedlegg"}`,
              line.attachmentFile.url,
              { size: 8, after: 1 }
            );
          } else {
            addText(
              `Vedlegg: ${line.attachmentFile.name || "PDF-vedlegg"}`,
              { size: 8, after: 1 }
            );
          }
        }
      });

      group.options.forEach((option) => {
        const optionPrefix = isAlternativeOption(option)
          ? `Valgt alternativ: ${option.title || "Alternativ"} - erstatter ${getReplacementLineDescription(
              option,
              group.lines
            )} - prisendring ${getSignedOptionAmountText(option)}`
          : isReductionOption(option)
            ? `Valgt fradrag: ${option.title || "Opsjon"} - ${getSignedOptionAmountText(
                option
              )}`
            : `Valgt tillegg: ${option.title || "Opsjon"} - ${getSignedOptionAmountText(
                option
              )}`;

        addText(
          `${optionPrefix}${
            option.description ? ` - ${option.description}` : ""
          }`,
          { size: 9, style: "bold", after: 1 }
        );

        if (option.productUrl) {
          addLinkText("Åpne produkt / dokumentasjon", option.productUrl, {
            size: 8,
            after: 1,
          });
        }

        if (
          option.attachmentFile?.customerVisible !== false &&
          (option.attachmentFile?.name || option.attachmentFile?.url)
        ) {
          if (option.attachmentFile.url) {
            addLinkText(
              `Åpne vedlegg: ${option.attachmentFile.name || "PDF-vedlegg"}`,
              option.attachmentFile.url,
              { size: 8, after: 1 }
            );
          } else {
            addText(
              `Vedlegg: ${option.attachmentFile.name || "PDF-vedlegg"}`,
              { size: 8, after: 1 }
            );
          }
        }
      });

      const groupAcceptedTotal =
        getOfferTotal(group.lines) + getOfferTotal(group.options);
      addText(
        `Sum ${group.title} inkl. mva.: ${formatNok(
          groupAcceptedTotal * 1.25
        )}`,
        { size: 9.5, style: "bold", after: 3 }
      );
    });
  }

  addText(
    `Akseptert total inkl. mva.: ${formatNok(
      Number(selectedRequest.acceptedTotal || 0) * 1.25
    )}`,
    { size: 11, style: "bold", after: 5 }
  );
  addSection(
    "Forutsetninger og forbehold",
    selectedRequest.acceptedOfferReservations ||
      selectedRequest.offerReservations
  );
  addSection(
    "Dette er inkludert",
    selectedRequest.acceptedOfferIncluded || selectedRequest.offerIncluded
  );
  addSection(
    "Dette er ikke inkludert",
    selectedRequest.acceptedOfferExcluded || selectedRequest.offerExcluded
  );
  addSection(
    "Dette sørger kunden for",
    selectedRequest.acceptedOfferCustomerSupplied ||
      selectedRequest.offerCustomerSupplied
  );
  addSection(
    "Vilkår",
    selectedRequest.acceptedOfferTerms || selectedRequest.offerTerms
  );
  addSection(
    "Betalingsbetingelser",
    selectedRequest.acceptedOfferPaymentTerms ||
      selectedRequest.offerPaymentTerms
  );
  addText("Bekreftelse", { size: 11, style: "bold", after: 1 });
  addText(
    "Kunden har digitalt bekreftet at tilbudet, valgte opsjoner, leveranseomfang, forbehold, vilkår og betalingsbetingelser er lest og akseptert.",
    { size: 9.5, after: 4 }
  );
  addText(
    "Dokumentet er opprettet fra den publiserte tilbudsversjonen og skal ikke redigeres. Eventuelle senere endringer må håndteres i en ny avtale eller tilbudsversjon.",
    { size: 8.5, after: 2 }
  );

  const pageCount = pdf.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    pdf.setPage(page);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(80, 100, 108);
    pdf.text(
      `Akseptbevis ${selectedRequest.id} - side ${page} av ${pageCount}`,
      left,
      290
    );
  }

  const blob = pdf.output("blob");
  const version =
    selectedRequest.acceptedOfferVersionNumber ||
    selectedRequest.sentOfferVersionNumber ||
    "1";
  const fileName = `Akseptbevis-${sanitizeStoragePart(
    selectedRequest.id
  )}-v${version}.pdf`;

  return { blob, fileName, version };
}
