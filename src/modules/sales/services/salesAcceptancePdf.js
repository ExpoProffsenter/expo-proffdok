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
  addText(`Arbeidssted: ${selectedRequest.address || "-"}`, { after: 5 });

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
  if (acceptedLines.length) {
    addText("Aksepterte arbeider og priser", {
      size: 11,
      style: "bold",
      after: 1,
    });
    addText("Alle priser er oppgitt inkl. mva.", {
      size: 8.5,
      after: 2,
    });
    acceptedLines.forEach((line, index) => {
      addText(
        `${index + 1}. ${line.description || "Tilbudspost"} - ${formatNok(
          getOfferTotal([line]) * 1.25
        )} inkl. mva.`,
        { size: 9.5, after: 1 }
      );
    });
    y += 3;
  }
  if (selectedRequest.acceptedOptions?.length) {
    addText("Valgte opsjoner", { size: 11, style: "bold", after: 2 });
    selectedRequest.acceptedOptions.forEach((option) => {
      addText(
        `${option.title || "Opsjon"}${
          option.description ? `: ${option.description}` : ""
        } - ${formatNok(getOfferTotal([option]) * 1.25)} inkl. mva.`,
        { size: 9.5, after: 1 }
      );
    });
    y += 3;
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
