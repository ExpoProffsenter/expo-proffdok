// FASE 24A RAPPORTFRAGMENTERING
// Eksisterende rapport-/PDF-kode flyttet mekanisk ut av src/main.jsx.
// Ingen rapportlogikk er endret. Avhengigheter injiseres fra App.

export function createReportTools(deps = {}) {
  const {
    DEFAULT_REPORT_HERO_IMAGE_URL,
    access,
    activeChecklistTemplate,
    authUser,
    bathroomEquipment,
    buildBathroomEquipmentReportGroups,
    checklist,
    company,
    emptyWarranty,
    files,
    getOpenDeviationCount,
    getPhotoIdentity,
    getWarrantyYears,
    hasValue,
    inst,
    isProjectLocked,
    makeProjectLink,
    manualSelected,
    normalizeExternalUrl,
    other,
    overtagelse,
    photos,
    productReportDocumentOptions,
    project,
    projectHasOvertagelse,
    projectId,
    publicProjectFileUrl,
    selected,
    setTab,
    setWarranty,
    shouldIncludeProductReportDoc,
    surf,
    tilbud,
    user,
    warranty,
    warrantyReadiness
  } = deps;

    const writePrintableReport = (printWindow, title = "Expo ProffDok rapport") => {
      const reportNode = document.querySelector(".report");
      if (!reportNode) {
        if (printWindow && !printWindow.closed) printWindow.close();
        alert("Rapporten er ikke klar ennå. Prøv igjen om et øyeblikk.");
        return;
      }

      const reportClone = reportNode.cloneNode(true);
      reportClone.querySelectorAll("a[href]").forEach((link) => {
        const normalizedHref = normalizeExternalUrl(link.getAttribute("href"));
        if (!normalizedHref) return;
        link.setAttribute("href", normalizedHref);
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
      });

      const inlineStyles = Array.from(document.querySelectorAll("style")).map((style) => style.innerHTML).join("\n");
      const reportHtml = reportClone.outerHTML;

      const printDocument = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    ${inlineStyles}
    body {
      margin: 0;
      padding: 24px;
      background: #ffffff;
      color: #0f172a;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 14px;
      line-height: 1.45;
    }
    .report {
      max-width: 920px;
      margin: 0 auto;
      background: #ffffff;
    }
    section {
      border: 1px solid #dbe7ec;
      border-radius: 18px;
      padding: 18px;
      margin: 0 0 18px;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    h2 {
      margin: 0 0 12px;
      border-bottom: 1px solid #0f172a;
      padding-bottom: 8px;
      font-size: 22px;
    }
    h3 { margin: 14px 0 8px; }
    .out {
      border: 1px solid #dbe7ec;
      border-radius: 14px;
      padding: 10px;
      margin: 8px 0;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }
    .reportTop {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: flex-start;
      margin-bottom: 16px;
    }
    .photos {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }
    .photo img {
      max-width: 100%;
      height: auto;
      border-radius: 10px;
    }
    a[href] {
      color: #0645ad !important;
      text-decoration: underline !important;
      cursor: pointer;
      font-weight: 700;
    }
    .pdfSafeUrl {
      display: block !important;
      color: #334155 !important;
      font-size: 10px !important;
      overflow-wrap: anywhere;
      word-break: break-word;
      margin-top: 2px;
    }
    footer {
      text-align: center;
      color: #64748b;
      font-size: 12px;
      margin-top: 28px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
    }
    button, nav, .mobileFieldBar, .mobileNav, .mobileCurrentProjectBar, .bottomAppNav {
      display: none !important;
    }
    @media print {
      body { padding: 0; }
      a[href] {
        color: #0645ad !important;
        text-decoration: underline !important;
      }
      .pdfSafeUrl {
        display: block !important;
      }
    }
  </style>
</head>
<body>
  ${reportHtml}
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.focus();
        window.print();
      }, 250);
    };
  </script>
</body>
</html>`;

      printWindow.document.open();
      printWindow.document.write(printDocument);
      printWindow.document.close();
    };

    const printVisibleReport = () => {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert("Nettleseren blokkerte utskriftsvinduet. Tillat popup-vinduer og prøv igjen.");
        return;
      }
      setTimeout(() => writePrintableReport(printWindow), 150);
    };

    const printReport = () => {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert("Nettleseren blokkerte utskriftsvinduet. Tillat popup-vinduer og prøv igjen.");
        return;
      }
      setTab("rapport");
      setTimeout(() => writePrintableReport(printWindow), 650);
    };

    const setPdfProgress = (message = "Genererer rapport…", subMessage = "") => {
      let overlay = document.getElementById("expo-pdf-progress-overlay");
      if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "expo-pdf-progress-overlay";
        overlay.setAttribute("role", "status");
        overlay.setAttribute("aria-live", "polite");
        overlay.style.position = "fixed";
        overlay.style.inset = "0";
        overlay.style.zIndex = "99999";
        overlay.style.background = "rgba(15, 23, 42, 0.58)";
        overlay.style.display = "flex";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";
        overlay.style.padding = "18px";
        document.body.appendChild(overlay);
      }
      overlay.innerHTML = `
        <div style="width:min(420px, calc(100vw - 32px)); background:#ffffff; border-radius:18px; box-shadow:0 24px 70px rgba(15,23,42,.28); padding:22px; font-family:Arial, Helvetica, sans-serif; color:#0f172a;">
          <div style="display:flex; gap:14px; align-items:center;">
            <div style="width:34px; height:34px; border:4px solid #dbeafe; border-top-color:#1456a0; border-radius:50%; animation:expoPdfSpin .8s linear infinite;"></div>
            <div>
              <div style="font-weight:800; font-size:16px;">${message}</div>
              <div style="font-size:13px; color:#475569; margin-top:4px;">${subMessage || "Dette kan ta litt tid ved mange bilder."}</div>
            </div>
          </div>
          <style>@keyframes expoPdfSpin{to{transform:rotate(360deg)}}</style>
        </div>`;
    };
    const clearPdfProgress = (delay = 0) => {
      window.setTimeout(() => {
        const overlay = document.getElementById("expo-pdf-progress-overlay");
        if (overlay) overlay.remove();
      }, delay);
    };

    const downloadClickablePdfReport = async () => {
      try {
        const archiveConfirmed = window.confirm("Viktig før nedlasting:\n\nNår prosjektet er ferdig skal komplett PDF-rapport lagres lokalt hos utførende firma, og gjerne også oversendes kunde. Expo ProffDok benytter skylagring, men kan ikke garantere ubegrenset lagringstid eller tilgjengelighet av prosjektdata i hele garanti- eller byggets levetid.\n\nVil du fortsette og generere komplett PDF-rapport nå?");
        if (!archiveConfirmed) return;
        setPdfProgress("Genererer rapport…", "Starter PDF-motor og klargjør rapporten.");
        await new Promise((resolve) => setTimeout(resolve, 60));
        const module = await import("https://esm.sh/jspdf@2.5.1");
        const JsPDF = module.jsPDF || module.default?.jsPDF;
        if (!JsPDF) throw new Error("Kunne ikke laste PDF-motor.");
        const doc = new JsPDF({ unit: "mm", format: "a4", compress: true });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 14;
        const contentWidth = pageWidth - margin * 2;
        let y = 16;

        const cleanReportText = (value) => {
          let text = value === void 0 || value === null ? "" : String(value);
          try {
            text = text.normalize("NFC");
          } catch {}
          // jsPDF standardfont støtter ikke enkelte emoji/symboler. Disse ble vist som Ø=ÜÄ i PDF.
          text = text
            .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
            .replace(/Ø=ÜÄ\s*/g, "")
            .replace(/['\u0013]\s*/g, "")
            .replace(/\s+/g, " ");
          return text.trim();
        };
        const safeText = (value) => cleanReportText(value);
        const filenameSafe = (value) => safeText(value || "FDV-rapport").replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, " ").trim().slice(0, 80) || "FDV-rapport";
        const normalizePdfUrl = (value) => normalizeExternalUrl(value);
        const isLikelyRawFileName = (value = "") => /^image[a-f0-9-]{8,}\.(jpe?g|png|webp|heic|heif)$/i.test(safeText(value).trim()) || /^[a-f0-9-]{16,}\.(jpe?g|png|webp|heic|heif)$/i.test(safeText(value).trim());
        const cleanPdfCaption = (caption = "", fallback = "Dokumentert bilde") => {
          const clean = safeText(caption).trim();
          if (!clean || isLikelyRawFileName(clean)) return fallback;
          return clean;
        };
        const storedFileUrl = (file = {}) => normalizePdfUrl(publicProjectFileUrl(file));
        const fileIdentityText = (file = {}) => [file?.name, file?.url, file?.path, file?.type, file?.mimeType, file?.contentType].filter(Boolean).join(" ");
        const isLikelyDocumentFile = (file = {}) => /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|csv|txt|rtf|odt|ods|odp)(\?|#|$)/i.test(fileIdentityText(file)) || /application\/(pdf|msword|vnd\.)/i.test(fileIdentityText(file));
        const isLikelyImageFile = (file = {}) => /\.(jpe?g|png|gif|webp|bmp|svg|heic|heif)(\?|#|$)/i.test(fileIdentityText(file)) || /^image\//i.test(safeText(file?.type || file?.mimeType || file?.contentType));
        const cleanCompanyPhoneForReport = (value = "") => {
          const clean = safeText(value).trim();
          if (!clean) return "";
          if (/^\d{4}\s+[A-Za-zÆØÅæøå .-]+$/.test(clean)) return "";
          if (/@/.test(clean) || /www\.|https?:\/\//i.test(clean)) return "";
          return clean;
        };
        const companyPhoneForReport = cleanCompanyPhoneForReport(company.phone);
        const reportAddressLine = () => [project.address, project.postnr, project.city].filter(Boolean).join(", ");
        const reportGeneratedAtLabel = () => new Date().toLocaleString("no-NO");
        const countReportAttachments = () => {
          let total = Array.isArray(files) ? files.filter((file) => hasValue(file?.name) || hasValue(file?.url) || hasValue(file?.path)).length : 0;
          Object.values(checklist || {}).forEach((items) => {
            Object.values(items || {}).forEach((value) => {
              total += (value?.photos || []).filter((file) => isLikelyDocumentFile(file)).length;
            });
          });
          (inst || []).forEach((entry) => {
            total += (entry?.photos || []).filter((file) => isLikelyDocumentFile(file)).length;
          });
          total += Array.isArray(tilbud?.files) ? tilbud.files.filter((file) => hasValue(file?.name) || hasValue(file?.url) || hasValue(file?.path)).length : 0;
          return total;
        };
        const makeReportDocumentNumber = () => {
          const guarantee = safeText(warranty?.guaranteeNumber || "").trim();
          if (guarantee) return `${guarantee}-FDV-001`;
          const idPart = safeText(projectId || "").trim().slice(0, 8).toUpperCase();
          return `PROJECT-${idPart || "UTKAST"}-FDV-001`;
        };
        const reportCustomerPortalUrl = () => projectId ? makeProjectLink(projectId, "kunde") : "";
        const reportDocumentationStatus = () => {
          const entries = Object.values(checklist || {}).flatMap((items) => Object.values(items || {}));
          const checklistTotal = activeChecklistTemplate.reduce((sum, group) => sum + (group.items || []).length, 0);
          const checklistDone = activeChecklistTemplate.reduce((sum, group) => sum + (group.items || []).filter((item) => hasValue(checklist?.[group.category]?.[item]?.status)).length, 0);
          const limitedChecklistScope = !warranty?.enabled && project?.checklistScopeMode === "limited";
          const checklistCompleteForFinal = checklistTotal === 0 || (limitedChecklistScope ? checklistDone > 0 : checklistDone >= checklistTotal);
          const checklistDetail = limitedChecklistScope ? (checklistDone > 0 ? `${checklistDone} relevant${checklistDone === 1 ? "" : "e"} kontrollpunkt vurdert · begrenset omfang` : "Ingen relevante kontrollpunkt vurdert · begrenset omfang") : `${checklistDone}/${checklistTotal || checklistDone} kontrollpunkt vurdert`;
          const openProjectDeviationTotal = (Array.isArray(project?.projectDeviations) ? project.projectDeviations : []).filter((entry) => (entry?.status || "Åpent") !== "Lukket").length;
          const openDeviationTotal = getOpenDeviationCount(checklist) + openProjectDeviationTotal;
          const productTotal = (selected || []).length + (manualSelected || []).length;
          const photoTotal = (photos || []).filter((photo) => hasValue(photo?.url)).length;
          const attachmentTotal = countReportAttachments();
          const items = [
            { label: "Prosjektinformasjon", ok: [project.projectName, project.address, project.customer].every(hasValue), detail: "Prosjektnavn, kunde og adresse" },
            { label: "Produkter / FDV", ok: productTotal > 0, detail: `${productTotal} produkt${productTotal === 1 ? "" : "er"} dokumentert` },
            { label: "Bildedokumentasjon", ok: photoTotal > 0, detail: `${photoTotal} bilde${photoTotal === 1 ? "" : "r"} registrert` },
            { label: "Sjekklister", ok: checklistCompleteForFinal, detail: checklistDetail },
            { label: "Avvik", ok: openDeviationTotal === 0, detail: openDeviationTotal ? `${openDeviationTotal} åpne avvik` : "Ingen åpne avvik" },
            { label: "Vedlegg", ok: attachmentTotal > 0, detail: `${attachmentTotal} vedlegg` },
            { label: "Overtagelse", ok: projectHasOvertagelse(overtagelse), detail: projectHasOvertagelse(overtagelse) ? "Registrert" : "Ikke registrert" },
            { label: "Garanti", ok: !!warranty?.issued || !warranty?.enabled, detail: warranty?.issued ? `${getWarrantyYears(warranty)} år · ${warranty?.guaranteeNumber || "aktiv"}` : warranty?.enabled ? "Ikke utstedt" : "Ikke relevant / ikke aktivert" }
          ];
          const percent = Math.round(items.filter((item) => item.ok).length / items.length * 100);
          return { items, percent, productTotal, photoTotal, checklistTotal, checklistDone, checklistCompleteForFinal, limitedChecklistScope, checklistDetail, openDeviationTotal, attachmentTotal };
        };
        const warrantyIssuedForReport = () => !!warranty?.enabled && (!!warranty?.issued || warranty?.status === "issued" || hasValue(warranty?.guaranteeNumber));
        const isFinalReport = (status = reportDocumentationStatus()) => {
          if (!projectHasOvertagelse(overtagelse)) return false;
          if (status.openDeviationTotal > 0) return false;
          if (!status.checklistCompleteForFinal) return false;
          if (warranty?.enabled && !warrantyIssuedForReport()) return false;
          return true;
        };
        const normalizeReportComparable = (value = "") => safeText(value).toLowerCase().replace(/\s+/g, " ").trim();
        const splitAcceptedOfferFromDescription = (value = "") => {
          const source = safeText(value).trim();
          const match = /Akseptert tilbud(?:\s+v\d+)?\s*:/i.exec(source);
          if (!match) return { intro: source, heading: "", rows: [], total: "" };
          const intro = source.slice(0, match.index).trim();
          const offerText = source.slice(match.index).trim();
          const colonIndex = offerText.indexOf(":");
          const heading = colonIndex >= 0 ? offerText.slice(0, colonIndex).trim() : "Akseptert tilbud";
          const body = colonIndex >= 0 ? offerText.slice(colonIndex + 1).trim() : offerText;
          const totalMatch = /(?:^|\s)Akseptert total\s*:\s*(.+)$/i.exec(body);
          const total = totalMatch ? totalMatch[1].trim() : "";
          const bodyWithoutTotal = totalMatch ? body.slice(0, totalMatch.index).trim() : body;
          const parts = bodyWithoutTotal.split(/\s*•\s*/).map((part) => part.trim()).filter(Boolean);
          const rows = parts.map((part) => {
            const rowColon = part.indexOf(":");
            if (rowColon < 0) return { label: "", value: part };
            return { label: part.slice(0, rowColon).trim(), value: part.slice(rowColon + 1).trim() };
          });
          return { intro, heading, rows, total };
        };
        const addAcceptedOfferTotalBox = (totalText = "") => {
          const total = safeText(totalText).trim();
          if (!total) return;
          const exMatch = /([\d .]+)\s*kr\s*eks\.?\s*mva\.?/i.exec(total);
          const incMatch = /([\d .]+)\s*kr\s*inkl\.?\s*mva\.?/i.exec(total);
          const exValue = exMatch ? `${exMatch[1].trim()} kr eks. mva.` : "";
          const incValue = incMatch ? `${incMatch[1].trim()} kr inkl. mva.` : "";
          ensureSpace(28);
          doc.setDrawColor(147, 197, 253);
          doc.setFillColor(239, 246, 255);
          doc.roundedRect(margin, y, contentWidth, 24, 3, 3, "FD");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10.5);
          doc.setTextColor(15, 23, 42);
          doc.text("Akseptert total", margin + 6, y + 9);
          doc.setFontSize(10);
          doc.setTextColor(20, 86, 160);
          if (exValue) doc.text(exValue, pageWidth - margin - 6, y + 8.5, { align: "right" });
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8.5);
          doc.setTextColor(51, 65, 85);
          if (incValue) doc.text(incValue, pageWidth - margin - 6, y + 16.5, { align: "right" });
          if (!exValue && !incValue) doc.text(doc.splitTextToSize(total, contentWidth - 65).slice(0, 2), pageWidth - margin - 6, y + 9, { align: "right" });
          y += 30;
        };
        const ensureSpace = (height = 8) => {
          if (y + height <= pageHeight - 18) return;
          doc.addPage();
          y = 16;
        };
        const addSectionTitle = (title) => {
          ensureSpace(16);
          y += 2;
          doc.setFont("helvetica", "bold");
          doc.setFontSize(15);
          doc.setTextColor(15, 23, 42);
          doc.text(safeText(title), margin, y);
          y += 3;
          doc.setDrawColor(15, 23, 42);
          doc.setLineWidth(0.25);
          doc.line(margin, y, pageWidth - margin, y);
          y += 7;
        };
        const addSectionPageBreak = (title) => {
          if (y > 24) {
            doc.addPage();
            y = 16;
          }
          addSectionTitle(title);
        };
        const makeReportHeroContainImage = async (imageInfo, targetW, targetH) => {
          // FASE 15.1.5: Rapportens headingbilde skal ikke croppes eller strekkes.
          // Bildet skaleres proporsjonalt og sentreres innenfor banneret (object-fit: contain-prinsipp).
          if (!imageInfo?.dataUrl) return "";
          try {
            const sourceImage = await new Promise((resolve) => {
              const img = new window.Image();
              img.onload = () => resolve(img);
              img.onerror = () => resolve(null);
              img.src = imageInfo.dataUrl;
            });
            if (!sourceImage) return imageInfo.dataUrl;
            const sourceW = imageInfo.width || sourceImage.width || 1;
            const sourceH = imageInfo.height || sourceImage.height || 1;
            const targetRatio = targetW / targetH;
            const sourceRatio = sourceW / sourceH;
            const canvas = document.createElement("canvas");
            canvas.width = 1600;
            canvas.height = Math.max(1, Math.round(canvas.width / targetRatio));
            const ctx = canvas.getContext("2d");
            const radius = 42;
            const roundedPath = () => {
              ctx.beginPath();
              ctx.moveTo(radius, 0);
              ctx.lineTo(canvas.width - radius, 0);
              ctx.quadraticCurveTo(canvas.width, 0, canvas.width, radius);
              ctx.lineTo(canvas.width, canvas.height - radius);
              ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - radius, canvas.height);
              ctx.lineTo(radius, canvas.height);
              ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - radius);
              ctx.lineTo(0, radius);
              ctx.quadraticCurveTo(0, 0, radius, 0);
              ctx.closePath();
            };
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            roundedPath();
            ctx.clip();
            ctx.fillStyle = "#f1f5f9";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            let dw = canvas.width;
            let dh = canvas.height;
            let dx = 0;
            let dy = 0;
            if (sourceRatio > targetRatio) {
              dw = canvas.width;
              dh = Math.round(canvas.width / sourceRatio);
              dy = Math.round((canvas.height - dh) / 2);
            } else {
              dh = canvas.height;
              dw = Math.round(canvas.height * sourceRatio);
              dx = Math.round((canvas.width - dw) / 2);
            }
            ctx.drawImage(sourceImage, 0, 0, sourceW, sourceH, dx, dy, dw, dh);
            ctx.restore();
            ctx.save();
            roundedPath();
            ctx.lineWidth = 10;
            ctx.strokeStyle = "rgba(255,255,255,0.92)";
            ctx.stroke();
            ctx.restore();
            return canvas.toDataURL("image/png");
          } catch (error) {
            console.warn("Kunne ikke tilpasse headingbilde:", error);
            return imageInfo.dataUrl;
          }
        };

        const makeReportHeroPremiumImage = async (imageInfo, targetW, targetH) => {
          // FASE 15.1.7: Lager et premium banner der originalbildet vises proporsjonalt 1:1,
          // mens en svak, nedtonet bakgrunn fyller sideflatene. Hovedbildet croppes eller strekkes ikke.
          if (!imageInfo?.dataUrl) return "";
          try {
            const sourceImage = await new Promise((resolve) => {
              const img = new window.Image();
              img.onload = () => resolve(img);
              img.onerror = () => resolve(null);
              img.src = imageInfo.dataUrl;
            });
            if (!sourceImage) return imageInfo.dataUrl;
            const sourceW = imageInfo.width || sourceImage.width || 1;
            const sourceH = imageInfo.height || sourceImage.height || 1;
            const targetRatio = targetW / targetH;
            const sourceRatio = sourceW / sourceH;
            const canvas = document.createElement("canvas");
            canvas.width = 1800;
            canvas.height = Math.max(1, Math.round(canvas.width / targetRatio));
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = "#eef4f8";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            let coverW = canvas.width;
            let coverH = canvas.height;
            let coverX = 0;
            let coverY = 0;
            if (sourceRatio > targetRatio) {
              coverH = canvas.height;
              coverW = Math.round(canvas.height * sourceRatio);
              coverX = Math.round((canvas.width - coverW) / 2);
            } else {
              coverW = canvas.width;
              coverH = Math.round(canvas.width / sourceRatio);
              coverY = Math.round((canvas.height - coverH) / 2);
            }
            ctx.save();
            ctx.globalAlpha = 0.22;
            if ("filter" in ctx) ctx.filter = "blur(18px)";
            ctx.drawImage(sourceImage, 0, 0, sourceW, sourceH, coverX - 30, coverY - 30, coverW + 60, coverH + 60);
            ctx.restore();
            let containW = canvas.width;
            let containH = canvas.height;
            let containX = 0;
            let containY = 0;
            if (sourceRatio > targetRatio) {
              containW = canvas.width;
              containH = Math.round(canvas.width / sourceRatio);
              containY = Math.round((canvas.height - containH) / 2);
            } else {
              containH = canvas.height;
              containW = Math.round(canvas.height * sourceRatio);
              containX = Math.round((canvas.width - containW) / 2);
            }
            ctx.shadowColor = "rgba(15,23,42,.22)";
            ctx.shadowBlur = 28;
            ctx.shadowOffsetY = 10;
            ctx.drawImage(sourceImage, 0, 0, sourceW, sourceH, containX, containY, containW, containH);
            return canvas.toDataURL("image/jpeg", 0.92);
          } catch (error) {
            console.warn("Kunne ikke lage premium headingbilde:", error);
            return makeReportHeroContainImage(imageInfo, targetW, targetH);
          }
        };

        const addCoverPage = async () => {
          const generatedAt = reportGeneratedAtLabel();
          const status = reportDocumentationStatus();
          const openDeviationTotal = status.openDeviationTotal;
          const productTitle = project.projectName || project.address || "Prosjektdokumentasjon";
          const addressLine = reportAddressLine();
          const reportHeroPhotoId = safeText(project?.reportHeroPhotoId || "").trim();
          const selectedCoverImage = reportHeroPhotoId ? (photos || []).find((photo) => hasValue(photo?.url) && getPhotoIdentity(photo) === reportHeroPhotoId) : null;
          const coverImage = selectedCoverImage || null;
          const coverImageUrl = coverImage?.url || DEFAULT_REPORT_HERO_IMAGE_URL;
          doc.setFillColor(8, 18, 30);
          doc.rect(0, 0, pageWidth, pageHeight, "F");
          doc.setFillColor(255, 255, 255);
          doc.roundedRect(8, 8, pageWidth - 16, pageHeight - 20, 5, 5, "F");

          if (coverImageUrl) {
            const cover = await loadPdfImage(coverImageUrl);
            if (cover && !cover.error) {
              const imgX = 12;
              const imgY = 12;
              const imgW = pageWidth - 24;
              const imgH = 122;
              const coverContainedDataUrl = await makeReportHeroContainImage(cover, imgW, imgH);
              doc.addImage(coverContainedDataUrl, "PNG", imgX, imgY, imgW, imgH);
              doc.setFillColor(8, 18, 30);
              doc.setGState && doc.setGState(new doc.GState({ opacity: 0.86 }));
              // FASE 15.1.7C: tryggere tekstfelt på forsiden. Feltet holdes innenfor bildet,
              // slik at lange prosjektnavn aldri flyter ut over høyre kant.
              doc.roundedRect(imgX + 8, imgY + 45, imgW - 16, 48, 4, 4, "F");
              doc.setGState && doc.setGState(new doc.GState({ opacity: 1 }));
            } else {
              doc.setFillColor(12, 42, 82);
              doc.roundedRect(12, 12, pageWidth - 24, 96, 3, 3, "F");
            }
          }

          if (company.logoUrl) {
            const logoImage = await loadPdfImage(company.logoUrl);
            if (logoImage && !logoImage.error) {
              let logoW = 44;
              let logoH = logoW * (logoImage.height / logoImage.width);
              if (logoH > 18) {
                logoH = 18;
                logoW = logoH * (logoImage.width / logoImage.height);
              }
              doc.setFillColor(255, 255, 255);
              doc.roundedRect(margin, 18, logoW + 8, logoH + 7, 2.5, 2.5, "F");
              doc.addImage(logoImage.dataUrl, logoImage.format || "PNG", margin + 4, 21, logoW, logoH);
            }
          }

          // FASE 15.1.7C: høyre toppmerking legges på lys bakgrunn for lesbarhet uavhengig av bilde.
          doc.setFillColor(255, 255, 255);
          doc.setGState && doc.setGState(new doc.GState({ opacity: 0.92 }));
          doc.roundedRect(pageWidth - margin - 48, 18, 48, 18, 2.5, 2.5, "F");
          doc.setGState && doc.setGState(new doc.GState({ opacity: 1 }));
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9.2);
          doc.setTextColor(0, 163, 173);
          doc.text("EXPO PROFFDOK", pageWidth - margin - 4, 24, { align: "right" });
          doc.setFontSize(7);
          doc.setTextColor(51, 65, 85);
          doc.text("FDV-rapport", pageWidth - margin - 4, 31, { align: "right" });

          const coverTextX = margin + 7;
          const coverTextMaxWidth = pageWidth - 58;
          const coverTitleLines = doc.splitTextToSize(safeText(productTitle).toUpperCase(), coverTextMaxWidth).slice(0, 2);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(18.2);
          // FASE 15.1.7C: tittel skaleres tryggere og brytes innenfor tekstfeltet.
          // Dette hindrer at lange prosjektnavn forsvinner ut av høyre kant.
          if (doc.setGState) doc.setGState(new doc.GState({ opacity: 0.50 }));
          doc.setTextColor(0, 0, 0);
          doc.text(coverTitleLines, coverTextX + 0.55, 66.55, { lineHeightFactor: 1.06 });
          if (doc.setGState) doc.setGState(new doc.GState({ opacity: 1 }));
          doc.setTextColor(255, 255, 255);
          doc.text(coverTitleLines, coverTextX, 66, { lineHeightFactor: 1.06 });
          const coverAddressLines = doc.splitTextToSize(safeText(addressLine || project.customer || "Prosjekt"), coverTextMaxWidth).slice(0, 1);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10.2);
          const addressY = coverTitleLines.length > 1 ? 94 : 90;
          if (doc.setGState) doc.setGState(new doc.GState({ opacity: 0.42 }));
          doc.setTextColor(0, 0, 0);
          doc.text(coverAddressLines, coverTextX + 0.45, addressY + 0.45);
          if (doc.setGState) doc.setGState(new doc.GState({ opacity: 1 }));
          doc.setTextColor(241, 245, 249);
          doc.text(coverAddressLines, coverTextX, addressY);

          const badgeY = 146;
          const reportFinal = isFinalReport(status);
          const issuedWarranty = warrantyIssuedForReport();
          const badgeText = openDeviationTotal ? "Kontroll med åpne avvik" : issuedWarranty ? `${getWarrantyYears(warranty)} års dokumentert tetthetsgaranti` : reportFinal ? "Sluttdokumentasjon" : "Dokumentasjon pågår";
          const badgeTone = openDeviationTotal ? "red" : issuedWarranty || reportFinal ? "green" : "blue";
          doc.setFillColor(...(badgeTone === "red" ? [254, 242, 242] : badgeTone === "green" ? [236, 253, 245] : [239, 246, 255]));
          doc.setDrawColor(...(badgeTone === "red" ? [248, 113, 113] : badgeTone === "green" ? [74, 222, 128] : [147, 197, 253]));
          doc.roundedRect(margin, badgeY, contentWidth, 24, 3, 3, "FD");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(12);
          doc.setTextColor(...(badgeTone === "red" ? [153, 27, 27] : badgeTone === "green" ? [6, 95, 70] : [12, 42, 82]));
          doc.text(safeText(badgeText), margin + 6, badgeY + 9);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8.4);
          doc.setTextColor(51, 65, 85);
          const badgeSub = openDeviationTotal ? "Prosjektet har åpne avvik som må følges opp." : issuedWarranty && warranty?.guaranteeNumber ? `Garantinummer: ${warranty.guaranteeNumber}` : reportFinal ? "Prosjektet er registrert overtatt og relevante kontrollpunkter er ferdig vurdert." : projectHasOvertagelse(overtagelse) ? `Overtagelse er registrert, men dokumentasjonen pågår · ${status.checklistDone}/${status.checklistTotal || status.checklistDone} kontrollpunkt vurdert.` : `${status.percent} % dokumentasjonsgrad · ${status.checklistDone}/${status.checklistTotal || status.checklistDone} kontrollpunkt vurdert.`;
          doc.text(safeText(badgeSub), margin + 6, badgeY + 17);

          const cardY = 176;
          const cardW = (contentWidth - 6) / 2;
          drawInfoCardPdf(margin, cardY, cardW, 21, "Kunde", project.customer || "Ikke oppgitt");
          drawInfoCardPdf(margin + cardW + 6, cardY, cardW, 21, "Utførende firma", name || company.companyName || "Expo ProffDok");
          drawInfoCardPdf(margin, cardY + 26, cardW, 21, "Rapport generert", generatedAt);
          drawInfoCardPdf(margin + cardW + 6, cardY + 26, cardW, 21, "Dokumentnummer", makeReportDocumentNumber());

          const metricGap = 4;
          const metricW = (contentWidth - metricGap * 4) / 5;
          const metricY = 236;
          drawMetricCard(margin, metricY, metricW, 20, "Bilder", String(status.photoTotal), "blue");
          drawMetricCard(margin + (metricW + metricGap), metricY, metricW, 20, "Produkter", String(status.productTotal), "neutral");
          drawMetricCard(margin + (metricW + metricGap) * 2, metricY, metricW, 20, "Kontroll", String(status.checklistDone), "green");
          drawMetricCard(margin + (metricW + metricGap) * 3, metricY, metricW, 20, "Vedlegg", String(status.attachmentTotal), "blue");
          drawMetricCard(margin + (metricW + metricGap) * 4, metricY, metricW, 20, "Avvik", String(openDeviationTotal), openDeviationTotal ? "red" : "green");

          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(71, 85, 105);
          doc.text(doc.splitTextToSize("Denne rapporten dokumenterer arbeidene som er utført i prosjektet, inkludert produkter, sjekklister, bilder, vedlegg og eventuelle garantier. Rapporten bør oppbevares som en del av boligens FDV-dokumentasjon.", contentWidth), margin, 263);

          doc.setFontSize(7.8);
          doc.setTextColor(100, 116, 139);
          doc.text("© 2026 Expo Proffsenter – Expo ProffDok", pageWidth / 2, pageHeight - 20, { align: "center" });
          doc.addPage();
          y = 16;
        };
        const addPremiumDocumentationOverviewPage = async () => {
          const status = reportDocumentationStatus();
          const customerUrl = reportCustomerPortalUrl();
          const reportFinal = isFinalReport(status);
          const qrUrl = reportFinal && customerUrl ? `https://quickchart.io/qr?text=${encodeURIComponent(customerUrl)}&size=180&margin=1` : "";
          doc.addPage();
          y = 16;
          addSectionTitle("Dokumentasjon inkludert");
          doc.setFillColor(12, 42, 82);
          doc.roundedRect(margin, y, contentWidth, 34, 4, 4, "F");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(14);
          doc.setTextColor(255, 255, 255);
          doc.text("Komplett FDV- og prosjektdokumentasjon", margin + 8, y + 12);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8.5);
          doc.setTextColor(226, 232, 240);
          doc.text(doc.splitTextToSize("Siden gir en rask oversikt over hva rapporten inneholder, status på dokumentasjonen og hvordan rapporten kan brukes videre ved overlevering, reklamasjon, service eller boligsalg.", contentWidth - 16), margin + 8, y + 21);
          y += 44;

          const cardGap = 4;
          const cardW = (contentWidth - cardGap * 2) / 3;
          drawMetricCard(margin, y, cardW, 20, "Dokumentasjonsgrad", `${status.percent} %`, status.percent >= 90 ? "green" : "blue");
          drawMetricCard(margin + cardW + cardGap, y, cardW, 20, "Bilder registrert", String(status.photoTotal), "blue");
          drawMetricCard(margin + (cardW + cardGap) * 2, y, cardW, 20, "Åpne avvik", String(status.openDeviationTotal), status.openDeviationTotal ? "red" : "green");
          y += 30;

          const rows = [
            ["Bilder før arbeid / underveis / ferdig resultat", status.photoTotal > 0, `${status.photoTotal} bilde${status.photoTotal === 1 ? "" : "r"}`],
            ["Produkt- og FDV-dokumentasjon", status.productTotal > 0, `${status.productTotal} produkt${status.productTotal === 1 ? "" : "er"}`],
            ["Sjekklister og kontrollpunkter", status.checklistTotal > 0, `${status.checklistDone}/${status.checklistTotal || status.checklistDone} punkt vurdert`],
            ["Vedlegg og opplastede dokumenter", status.attachmentTotal > 0, `${status.attachmentTotal} vedlegg`],
            ["Overtagelse", projectHasOvertagelse(overtagelse), projectHasOvertagelse(overtagelse) ? "Registrert" : "Ikke registrert"],
            ["Garanti", !!warranty?.issued || !warranty?.enabled, warranty?.issued ? `${getWarrantyYears(warranty)} år · ${warranty?.guaranteeNumber || "aktiv"}` : warranty?.enabled ? "Ikke utstedt" : "Ikke aktivert"],
          ];
          rows.forEach(([label, ok, detail]) => {
            ensureSpace(13);
            doc.setDrawColor(ok ? 187 : 253, ok ? 247 : 186, ok ? 208 : 116);
            doc.setFillColor(ok ? 236 : 255, ok ? 253 : 251, ok ? 245 : 235);
            doc.roundedRect(margin, y, contentWidth, 11, 2.2, 2.2, "FD");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8.4);
            doc.setTextColor(ok ? 6 : 146, ok ? 95 : 64, ok ? 70 : 14);
            doc.text(ok ? "OK" : "INFO", margin + 5, y + 7.2);
            doc.setTextColor(15, 23, 42);
            doc.text(safeText(label), margin + 22, y + 7.2);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7.3);
            doc.setTextColor(71, 85, 105);
            doc.text(safeText(detail), pageWidth - margin - 5, y + 7.2, { align: "right" });
            y += 14;
          });

          y += 5;
          addSubTitle("Prosjektets dokumentasjonsflyt");
          const steps = [
            ["1", "Prosjekt opprettet"],
            ["2", "Produkter og bilder registrert"],
            ["3", "Sjekklister kontrollert"],
            ["4", "Overtagelse / garanti"],
            ["5", "Rapport lagret og delt"],
          ];
          const stepW = contentWidth / steps.length;
          const lineY = y + 8;
          doc.setDrawColor(191, 219, 254);
          doc.line(margin + 8, lineY, pageWidth - margin - 8, lineY);
          steps.forEach(([nr, label], index) => {
            const cx = margin + stepW * index + stepW / 2;
            doc.setFillColor(239, 246, 255);
            doc.setDrawColor(20, 86, 160);
            doc.circle(cx, lineY, 5, "FD");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7.8);
            doc.setTextColor(20, 86, 160);
            doc.text(nr, cx, lineY + 2.4, { align: "center" });
            doc.setFont("helvetica", "normal");
            doc.setFontSize(6.5);
            doc.setTextColor(71, 85, 105);
            doc.text(doc.splitTextToSize(safeText(label), stepW - 5), cx, lineY + 13, { align: "center" });
          });
          y += 34;

          if (customerUrl) {
            const qrImage = await loadPdfImage(qrUrl);
            ensureSpace(38);
            doc.setDrawColor(214, 226, 236);
            doc.setFillColor(248, 250, 252);
            doc.roundedRect(margin, y, contentWidth, 34, 3, 3, "FD");
            if (qrImage && !qrImage.error) doc.addImage(qrImage.dataUrl, qrImage.format || "PNG", margin + 6, y + 4, 26, 26);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.setTextColor(15, 23, 42);
            doc.text("Digital rapport / kundeportal", margin + 38, y + 11);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(71, 85, 105);
            doc.text(doc.splitTextToSize("Skann QR-koden for å åpne prosjektets digitale kundevisning. Lenken kan brukes til å dele dokumentasjon med kunde, takstmann eller ny eier der dette er relevant.", contentWidth - 48), margin + 38, y + 18);
            y += 42;
          }
        };
        const addSubTitle = (title) => {
          ensureSpace(8);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(12);
          doc.setTextColor(15, 23, 42);
          doc.text(safeText(title), margin, y);
          y += 5;
        };
        const addParagraph = (value, opts = {}) => {
          const textValue = safeText(value).trim();
          if (!textValue) return;
          const size = opts.size || 10.5;
          const lineHeight = opts.lineHeight || 5.4;
          doc.setFont("helvetica", opts.bold ? "bold" : "normal");
          doc.setFontSize(size);
          doc.setTextColor(opts.color || 15, opts.color ? 69 : 23, opts.color ? 135 : 42);
          const lines = doc.splitTextToSize(textValue, opts.width || contentWidth);
          ensureSpace(lines.length * lineHeight + 2);
          doc.text(lines, opts.x || margin, y);
          y += lines.length * lineHeight;
        };
        const addKeyValue = (label, value) => {
          const cleanValue = safeText(value).trim() || "Ikke fylt ut";
          ensureSpace(10);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9.5);
          doc.setTextColor(15, 23, 42);
          doc.text(safeText(label), margin, y);
          y += 4.5;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10.5);
          const lines = doc.splitTextToSize(cleanValue, contentWidth);
          doc.text(lines, margin, y);
          y += Math.max(5.8, lines.length * 5.4);
        };
        const addLink = (label, href) => {
          const rawHref = safeText(href).trim();
          const isBlobUrl = /^blob:/i.test(rawHref);
          const url = isBlobUrl ? "" : normalizePdfUrl(rawHref);
          if (!url) {
            if (isBlobUrl) {
              ensureSpace(18);
              doc.setFont("helvetica", "bold");
              doc.setFontSize(10.2);
              doc.setTextColor(153, 27, 27);
              doc.text(doc.splitTextToSize(`${safeText(label)} – filen må lastes opp på nytt for å bli klikkbar i PDF.`, contentWidth), margin, y);
              y += 10;
            }
            return;
          }
          ensureSpace(12);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10.5);
          doc.setTextColor(0, 84, 180);
          if (typeof doc.textWithLink === "function") {
            doc.textWithLink(safeText(label), margin, y, { url });
          } else {
            doc.text(safeText(label), margin, y);
            doc.link(margin, y - 4, Math.min(contentWidth, safeText(label).length * 2.2), 5, { url });
          }
          y += 6;
        };
        const addAttachmentList = (title, attachmentList = [], emptyMessage = "Ingen vedlegg er lagt til.") => {
          const visibleAttachments = (attachmentList || []).filter((file) => hasValue(file?.name) || hasValue(file?.url) || hasValue(file?.path));
          addSectionTitle(title);
          if (!visibleAttachments.length) {
            addParagraph(emptyMessage);
            return;
          }
          const cleanMetaValue = (value = "", fallback = "Ikke angitt") => {
            const clean = safeText(value).trim();
            if (!clean || /^uspesifisert/i.test(clean)) return fallback;
            return clean;
          };
          visibleAttachments.forEach((file, index) => {
            const fileName = safeText(file?.name || `Vedlegg ${index + 1}`);
            const fileUrl = storedFileUrl(file);
            const sourceLabel = cleanMetaValue(file?._sourceLabel || "Vedlegg", "Vedlegg");
            const trade = cleanMetaValue(file.trade || file.fag || file.role, "Ikke angitt");
            const documentType = cleanMetaValue(file.documentType || file.docType || file.typeLabel, "Ikke angitt");
            const description = cleanMetaValue(file.description || file.comment, "");
            const uploadedBy = cleanMetaValue(file.by, "Ikke angitt");
            const uploadedAt = cleanMetaValue(file.created ? (String(file.created).includes("T") ? new Date(file.created).toLocaleString("no-NO") : file.created) : "", "Ikke angitt");
            const titleLabel = documentType !== "Ikke angitt" ? documentType : sourceLabel;
            const detailRows = [
              ["Fil", fileName],
              ["Kategori", sourceLabel],
              ["Fag", trade],
              ["Dokumenttype", documentType],
              ["Beskrivelse", description],
              ["Opplastet av", uploadedBy],
              ["Dato", uploadedAt]
            ].filter(([, value]) => hasValue(value));
            const detailLineCount = detailRows.reduce((sum, [label, value]) => sum + Math.max(1, doc.splitTextToSize(`${label}: ${value}`, contentWidth - 28).length), 0);
            const boxH = Math.max(44, 20 + detailLineCount * 4.2 + 11);
            ensureSpace(boxH + 6);
            const boxY = y;
            doc.setDrawColor(191, 219, 254);
            doc.setFillColor(248, 250, 252);
            doc.roundedRect(margin, boxY, contentWidth, boxH, 3, 3, "FD");
            doc.setFillColor(239, 246, 255);
            doc.roundedRect(margin + 4, boxY + 4, 13, 13, 2.2, 2.2, "F");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7.2);
            doc.setTextColor(20, 86, 160);
            doc.text("PDF", margin + 7.2, boxY + 12.2);

            doc.setFont("helvetica", "bold");
            doc.setFontSize(11.2);
            doc.setTextColor(15, 23, 42);
            doc.text(doc.splitTextToSize(titleLabel, contentWidth - 26).slice(0, 1), margin + 21, boxY + 9);

            let yy = boxY + 17;
            detailRows.forEach(([label, value]) => {
              const lines = doc.splitTextToSize(`${safeText(label)}: ${safeText(value)}`, contentWidth - 28);
              doc.setFont("helvetica", "bold");
              doc.setFontSize(7.7);
              doc.setTextColor(51, 65, 85);
              const labelText = `${safeText(label)}:`;
              doc.text(labelText, margin + 21, yy);
              doc.setFont("helvetica", "normal");
              doc.setTextColor(71, 85, 105);
              const valueLines = doc.splitTextToSize(safeText(value), contentWidth - 52);
              doc.text(valueLines, margin + 43, yy);
              yy += Math.max(4.2, valueLines.length * 4.2);
            });

            const linkY = boxY + boxH - 5.4;
            if (fileUrl) {
              const linkLabel = "Åpne PDF";
              doc.setFont("helvetica", "bold");
              doc.setFontSize(8.8);
              doc.setTextColor(0, 84, 180);
              if (typeof doc.textWithLink === "function") {
                doc.textWithLink(linkLabel, margin + 21, linkY, { url: fileUrl });
              } else {
                doc.text(linkLabel, margin + 21, linkY);
                doc.link(margin + 21, linkY - 3.5, 22, 4.5, { url: fileUrl });
              }
            } else {
              doc.setFont("helvetica", "normal");
              doc.setFontSize(7.6);
              doc.setTextColor(153, 27, 27);
              doc.text("Dokumentlenke mangler", margin + 21, linkY);
            }
            y += boxH + 6;
          });
        };

        const addDivider = () => {
          ensureSpace(4);
          doc.setDrawColor(226, 232, 240);
          doc.line(margin, y, pageWidth - margin, y);
          y += 5;
        };

        const statusVisual = (status = "") => {
          const clean = String(status || "").toLowerCase();
          if (clean === "avvik") return { label: "AVVIK", bg: [254, 242, 242], border: [248, 113, 113], text: [153, 27, 27] };
          if (clean === "lukket avvik") return { label: "LUKKET", bg: [236, 253, 245], border: [74, 222, 128], text: [6, 95, 70] };
          if (clean === "ikke aktuelt") return { label: "IKKE AKTUELT", bg: [248, 250, 252], border: [203, 213, 225], text: [71, 85, 105] };
          if (clean === "ok" || clean === "utført" || clean === "utfort") return { label: "OK", bg: [236, 253, 245], border: [74, 222, 128], text: [6, 95, 70] };
          return { label: status || "IKKE VURDERT", bg: [255, 251, 235], border: [251, 191, 36], text: [146, 64, 14] };
        };
        const drawMetricCard = (x, yPos, w, h, label, value, tone = "neutral") => {
          const bg = tone === "green" ? [236, 253, 245] : tone === "red" ? [254, 242, 242] : tone === "blue" ? [239, 246, 255] : [248, 250, 252];
          const borderColor = tone === "green" ? [74, 222, 128] : tone === "red" ? [248, 113, 113] : tone === "blue" ? [147, 197, 253] : [203, 213, 225];
          const textColor = tone === "green" ? [6, 95, 70] : tone === "red" ? [153, 27, 27] : tone === "blue" ? [30, 64, 175] : [15, 23, 42];
          doc.setDrawColor(...borderColor);
          doc.setFillColor(...bg);
          doc.roundedRect(x, yPos, w, h, 2.5, 2.5, "FD");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(13);
          doc.setTextColor(...textColor);
          doc.text(safeText(value), x + 5, yPos + 9);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7.4);
          doc.setTextColor(71, 85, 105);
          doc.text(doc.splitTextToSize(safeText(label), w - 10), x + 5, yPos + 15);
        };
        const drawInfoCardPdf = (x, yPos, w, h, label, value) => {
          doc.setDrawColor(214, 226, 236);
          doc.setFillColor(248, 250, 252);
          doc.roundedRect(x, yPos, w, h, 2.5, 2.5, "FD");
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7.3);
          doc.setTextColor(100, 116, 139);
          doc.text(safeText(label), x + 4, yPos + 6);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8.7);
          doc.setTextColor(15, 23, 42);
          const lines = doc.splitTextToSize(safeText(value || "Ikke oppgitt"), w - 8);
          doc.text(lines.slice(0, 3), x + 4, yPos + 11.5);
        };
        const addInfoGridSection = (title, entries = []) => {
          const visibleEntries = entries.filter(([_, value]) => hasValue(value));
          if (!visibleEntries.length) return;
          // FASE 13.15.3: Unngå at en seksjonstittel havner alene nederst på siden.
          ensureSpace(42);
          addSectionTitle(title);
          const gap = 5;
          const cardW = (contentWidth - gap) / 2;
          const cardH = 20;
          visibleEntries.forEach(([label, value], index) => {
            if (index % 2 === 0) ensureSpace(cardH + 8);
            const x = index % 2 === 0 ? margin : margin + cardW + gap;
            drawInfoCardPdf(x, y, cardW, cardH, label, value);
            if (index % 2 === 1) y += cardH + 5;
          });
          if (visibleEntries.length % 2 === 1) y += cardH + 5;
        };
        const addProductCategoryHeader = (category, count = 0) => {
          if (y > pageHeight - 52) {
            doc.addPage();
            y = 16;
          } else {
            y += 3;
          }
          ensureSpace(15);
          doc.setDrawColor(191, 219, 254);
          doc.setFillColor(239, 246, 255);
          doc.roundedRect(margin, y, contentWidth, 11, 2.5, 2.5, "FD");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10.2);
          doc.setTextColor(12, 42, 82);
          doc.text(doc.splitTextToSize(safeText(category), contentWidth - 25).slice(0, 1), margin + 5, y + 7.2);
          if (count) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7.2);
            doc.setTextColor(71, 85, 105);
            doc.text(`${count} produkt${count === 1 ? "" : "er"}`, pageWidth - margin - 5, y + 7.2, { align: "right" });
          }
          y += 16;
        };
        const addProductReportCard = (product) => {
          const productName = product.item || product.name || "Uten produktnavn";
          const links = productReportDocumentOptions.filter((option) => shouldIncludeProductReportDoc(product, option));
          const shortDocLabel = (label = "") => {
            if (/produkt|leverand/i.test(label)) return "Produktside";
            if (/sikkerhet/i.test(label)) return "Sikkerhetsblad";
            return label;
          };
          const nameLines = doc.splitTextToSize(safeText(productName), contentWidth - 18).slice(0, 2);
          const detailLines = [];
          if (product.colorCode) detailLines.push(...doc.splitTextToSize(`Fargekode: ${safeText(product.colorCode)}`, contentWidth - 18));
          if (product.comment) detailLines.push(...doc.splitTextToSize(`Kommentar: ${safeText(product.comment)}`, contentWidth - 18));
          const chipCount = links.length || 1;
          const chipsPerRow = 3;
          const chipRows = Math.ceil(chipCount / chipsPerRow);
          const boxH = Math.max(28, 16 + nameLines.length * 4.7 + Math.min(detailLines.length, 3) * 3.8 + 3 + chipRows * 7.2);
          ensureSpace(boxH + 5);

          const boxY = y;
          doc.setDrawColor(214, 226, 236);
          doc.setFillColor(255, 255, 255);
          doc.roundedRect(margin, boxY, contentWidth, boxH, 3.2, 3.2, "FD");
          doc.setFillColor(248, 250, 252);
          doc.roundedRect(margin + 4, boxY + 4, 10, 10, 2.2, 2.2, "F");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(7.2);
          doc.setTextColor(20, 86, 160);
          doc.text("FDV", margin + 5.9, boxY + 10.7);

          doc.setFont("helvetica", "bold");
          doc.setFontSize(10.2);
          doc.setTextColor(15, 23, 42);
          doc.text(nameLines, margin + 18, boxY + 8.3);

          let yy = boxY + 8.3 + nameLines.length * 4.7 + 1.5;
          if (detailLines.length) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7.2);
            doc.setTextColor(71, 85, 105);
            doc.text(detailLines.slice(0, 3), margin + 18, yy);
            yy += Math.min(detailLines.length, 3) * 3.8 + 1.5;
          }

          if (links.length) {
            const gap = 2.3;
            const chipW = (contentWidth - 18 - gap * (chipsPerRow - 1)) / chipsPerRow;
            links.forEach((option, index) => {
              const url = normalizePdfUrl(product?.[option.field]);
              if (!url) return;
              const row = Math.floor(index / chipsPerRow);
              const col = index % chipsPerRow;
              const x = margin + 18 + col * (chipW + gap);
              const chipY = yy + row * 7.2;
              const label = shortDocLabel(option.label);
              doc.setDrawColor(191, 219, 254);
              doc.setFillColor(239, 246, 255);
              doc.roundedRect(x, chipY - 4.6, chipW, 5.9, 1.7, 1.7, "FD");
              doc.setFont("helvetica", "bold");
              doc.setFontSize(6.8);
              doc.setTextColor(0, 84, 180);
              if (typeof doc.textWithLink === "function") {
                doc.textWithLink(label, x + 2.4, chipY, { url });
              } else {
                doc.text(label, x + 2.4, chipY);
                doc.link(x + 2.4, chipY - 3.8, Math.min(chipW - 5, label.length * 1.55), 4.5, { url });
              }
            });
          } else {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7.2);
            doc.setTextColor(100, 116, 139);
            doc.text("Ingen produktdokumenter valgt for visning i rapport.", margin + 18, yy);
          }

          y += boxH + 4.5;
        };
        const addEquipmentCategoryHeader = (category, count = 0) => {
          if (y > pageHeight - 52) {
            doc.addPage();
            y = 16;
          } else {
            y += 3;
          }
          ensureSpace(15);
          doc.setDrawColor(191, 219, 254);
          doc.setFillColor(239, 246, 255);
          doc.roundedRect(margin, y, contentWidth, 11, 2.5, 2.5, "FD");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10.2);
          doc.setTextColor(12, 42, 82);
          doc.text(doc.splitTextToSize(safeText(category), contentWidth - 25).slice(0, 1), margin + 5, y + 7.2);
          if (count) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7.2);
            doc.setTextColor(71, 85, 105);
            doc.text(`${count} punkt`, pageWidth - margin - 5, y + 7.2, { align: "right" });
          }
          y += 16;
        };
        const addEquipmentReportCard = (item = {}) => {
          const title = safeText(item.title || "Uten navn");
          const entries = (item.entries || []).filter(([, value]) => hasValue(value));
          const links = (item.links || []).filter((link) => hasValue(link?.url));
          const titleLines = doc.splitTextToSize(title, contentWidth - 18).slice(0, 2);
          const entryRows = entries.map(([label, value]) => ({ label: safeText(label), value: safeText(value) })).slice(0, 6);
          const linkRows = links.length ? 1 : 0;
          const boxH = Math.max(25, 14 + titleLines.length * 4.7 + entryRows.length * 6.2 + linkRows * 7.2 + 3);
          ensureSpace(boxH + 5);
          const boxY = y;
          doc.setDrawColor(214, 226, 236);
          doc.setFillColor(255, 255, 255);
          doc.roundedRect(margin, boxY, contentWidth, boxH, 3.2, 3.2, "FD");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10.2);
          doc.setTextColor(15, 23, 42);
          doc.text(titleLines, margin + 6, boxY + 8.3);
          let yy = boxY + 8.3 + titleLines.length * 4.7 + 1.5;
          entryRows.forEach(({ label, value }) => {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7.3);
            doc.setTextColor(100, 116, 139);
            doc.text(label, margin + 6, yy);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8.4);
            doc.setTextColor(15, 23, 42);
            const valueLines = doc.splitTextToSize(value || "Ikke oppgitt", contentWidth - 54).slice(0, 1);
            doc.text(valueLines, margin + 50, yy);
            yy += 6.2;
          });
          if (links.length) {
            const gap = 2.3;
            const chipW = (contentWidth - 12 - gap) / 2;
            links.slice(0, 2).forEach((link, index) => {
              const url = normalizePdfUrl(link.url);
              if (!url) return;
              const x = margin + 6 + index * (chipW + gap);
              doc.setDrawColor(191, 219, 254);
              doc.setFillColor(239, 246, 255);
              doc.roundedRect(x, yy - 4.6, chipW, 5.9, 1.7, 1.7, "FD");
              doc.setFont("helvetica", "bold");
              doc.setFontSize(6.8);
              doc.setTextColor(0, 84, 180);
              const label = safeText(link.label || "Dokument");
              if (typeof doc.textWithLink === "function") {
                doc.textWithLink(label, x + 2.4, yy, { url });
              } else {
                doc.text(label, x + 2.4, yy);
                doc.link(x + 2.4, yy - 3.8, Math.min(chipW - 5, label.length * 1.55), 4.5, { url });
              }
            });
          }
          y += boxH + 4.5;
        };
        const addReportSummary = () => {
          const entries = Object.values(checklist || {}).flatMap((items) => Object.values(items || {}));
          const assessed = entries.filter((value) => hasValue(value?.status));
          const okTotal = assessed.filter((value) => ["ok", "utført", "utfort"].includes(String(value?.status || "").toLowerCase())).length;
          const notRelevantTotal = assessed.filter((value) => String(value?.status || "").toLowerCase() === "ikke aktuelt").length;
          const closedDeviationTotal = assessed.filter((value) => value?.status === "Lukket avvik").length;
          const status = reportDocumentationStatus();
          const reportFinal = isFinalReport(status);
          const photoTotal = status.photoTotal;
          const productTotal = status.productTotal;
          addSectionTitle("Rapportsammendrag");
          const hasOpenDeviations = status.openDeviationTotal > 0;
          const tone = hasOpenDeviations ? "red" : reportFinal ? "green" : "blue";
          doc.setDrawColor(...(tone === "red" ? [248, 113, 113] : tone === "green" ? [74, 222, 128] : [147, 197, 253]));
          doc.setFillColor(...(tone === "red" ? [254, 242, 242] : tone === "green" ? [236, 253, 245] : [239, 246, 255]));
          ensureSpace(26);
          doc.roundedRect(margin, y, contentWidth, 22, 3, 3, "FD");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(13);
          doc.setTextColor(...(tone === "red" ? [153, 27, 27] : tone === "green" ? [6, 95, 70] : [12, 42, 82]));
          doc.text(hasOpenDeviations ? "KONTROLL MED ÅPNE AVVIK" : reportFinal ? "SLUTTDOKUMENTASJON" : "DOKUMENTASJON PÅGÅR", margin + 6, y + 9);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8.2);
          doc.setTextColor(51, 65, 85);
          const summaryLine = hasOpenDeviations
            ? `${status.openDeviationTotal} åpne avvik må følges opp før sluttdokumentasjon.`
            : reportFinal
              ? "Prosjektet er registrert overtatt og relevante kontrollpunkter er ferdig vurdert."
              : projectHasOvertagelse(overtagelse)
                ? `Overtagelse er registrert, men dokumentasjonen pågår. ${status.checklistDone}/${status.checklistTotal || status.checklistDone} kontrollpunkt er vurdert.`
                : `Ingen åpne avvik registrert. Dokumentasjonsgrad ${status.percent} %.`;
          doc.text(safeText(summaryLine), margin + 6, y + 16);
          y += 28;
          const gap = 4;
          const cardW = (contentWidth - gap * 3) / 4;
          ensureSpace(24);
          drawMetricCard(margin, y, cardW, 20, "Godkjente punkter", String(okTotal), "green");
          drawMetricCard(margin + (cardW + gap), y, cardW, 20, "Ikke aktuelle", String(notRelevantTotal), "neutral");
          drawMetricCard(margin + (cardW + gap) * 2, y, cardW, 20, "Åpne avvik", String(status.openDeviationTotal), status.openDeviationTotal ? "red" : "green");
          drawMetricCard(margin + (cardW + gap) * 3, y, cardW, 20, "Bilder", String(photoTotal), "blue");
          y += 26;
          addParagraph(`Produkter dokumentert: ${productTotal}. Lukkede sjekkpunktavvik: ${closedDeviationTotal}. Rapporten bygger på det som er registrert i prosjektet ved genereringstidspunktet.`, { size: 8.5, lineHeight: 4.4 });
          if (warrantyIssuedForReport()) addParagraph(`✓ ${getWarrantyYears(warranty)} års dokumentert tetthetsgaranti er utstedt. Garantinummer: ${warranty.guaranteeNumber || "Ikke oppgitt"}.`, { size: 8.5, lineHeight: 4.4, bold: true });
          else if (warranty?.enabled) addParagraph("Tetthetsgaranti er aktivert for prosjektet, men er ikke utstedt. Garantibevis inngår derfor ikke i denne rapporten.", { size: 8.5, lineHeight: 4.4 });
        };
        const addChecklistCategoryTitle = (category, count = 0) => {
          if (y > pageHeight - 54) {
            doc.addPage();
            y = 16;
          } else {
            y += 4;
          }
          ensureSpace(18);
          doc.setDrawColor(191, 219, 254);
          doc.setFillColor(239, 246, 255);
          doc.roundedRect(margin, y, contentWidth, 12, 2.5, 2.5, "FD");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10.5);
          doc.setTextColor(12, 42, 82);
          doc.text(safeText(category), margin + 5, y + 7.7);
          if (count) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7.4);
            doc.setTextColor(71, 85, 105);
            doc.text(`${count} punkt`, pageWidth - margin - 5, y + 7.7, { align: "right" });
          }
          y += 17;
        };
        const addChecklistStatusCard = async (category, item, value = {}) => {
          const status = value?.status || "";
          const comment = value?.comment || "";
          const closeComment = value?.closeComment || "";
          const pointPhotos = (value?.photos || []).filter((photo) => (hasValue(photo?.url) || hasValue(photo?.path)) && !isLikelyDocumentFile(photo));
          const visual = statusVisual(status);
          const cleanStatus = String(status || "").toLowerCase();
          const isOpenDeviation = cleanStatus === "avvik";
          const isClosedDeviation = cleanStatus === "lukket avvik";
          const isNotRelevant = cleanStatus === "ikke aktuelt";
          const isOk = ["ok", "utført", "utfort"].includes(cleanStatus);
          const statusLabel = isOk ? "OK" : isClosedDeviation ? "LUKKET AVVIK" : isOpenDeviation ? "ÅPENT AVVIK" : isNotRelevant ? "IKKE AKTUELT" : (status || "IKKE VURDERT");
          const textLines = doc.splitTextToSize(safeText(item), contentWidth - 38);
          const commentLabel = isOpenDeviation || isClosedDeviation ? "Opprinnelig avvik" : "Kommentar";
          const commentLines = comment ? doc.splitTextToSize(`${commentLabel}: ${comment}`, contentWidth - 20) : [];
          const closeLines = isClosedDeviation && closeComment ? doc.splitTextToSize(`Utbedring / lukkekommentar: ${closeComment}`, contentWidth - 20) : [];
          const isCompact = isOk || isNotRelevant;
          const rowH = isCompact
            ? Math.max(10.5, 7.2 + textLines.length * 4.2)
            : Math.max(18, 12 + textLines.length * 4.5 + commentLines.length * 3.8 + closeLines.length * 3.8);
          ensureSpace(rowH + (pointPhotos.length ? 49 : 4));

          if (isCompact) {
            const iconColor = isOk ? [22, 163, 74] : [100, 116, 139];
            doc.setDrawColor(226, 232, 240);
            doc.setFillColor(255, 255, 255);
            doc.roundedRect(margin, y, contentWidth, rowH, 2.2, 2.2, "FD");
            doc.setDrawColor(...iconColor);
            doc.setFillColor(isOk ? 236 : 248, isOk ? 253 : 250, isOk ? 245 : 252);
            doc.circle(margin + 5.3, y + rowH / 2, 3.0, "FD");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(isOk ? 8.8 : 7.5);
            doc.setTextColor(...iconColor);
            doc.text(isOk ? "OK" : "-", margin + 5.3, y + rowH / 2 + 1.0, { align: "center" });
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8.8);
            doc.setTextColor(15, 23, 42);
            doc.text(textLines, margin + 12, y + 6.8);
            // FASE 13.15.4: Ikke gjenta status på høyre side for kompakte OK/ikke-aktuelt-punkter.
            // Venstre statusmerke er nok og hindrer "OK ... OK" i PDF-rapporten.
            y += rowH + 2.8;
          } else {
            doc.setDrawColor(...visual.border);
            doc.setFillColor(...visual.bg);
            doc.roundedRect(margin, y, contentWidth, rowH, 3.0, 3.0, "FD");
            doc.setDrawColor(...visual.border);
            doc.setFillColor(255, 255, 255);
            doc.circle(margin + 7, y + 8.7, 3.4, "FD");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7.0);
            doc.setTextColor(...visual.text);
            doc.text(isClosedDeviation ? "OK" : safeText(visual.label).slice(0, 1), margin + 7, y + 9.8, { align: "center" });
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9.2);
            doc.setTextColor(15, 23, 42);
            doc.text(textLines, margin + 15, y + 8.4);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(6.6);
            doc.setTextColor(...visual.text);
            doc.text(statusLabel, pageWidth - margin - 5, y + 8.4, { align: "right" });
            let yy = y + 9 + textLines.length * 4.4;
            if (commentLines.length) {
              doc.setFont("helvetica", "normal");
              doc.setFontSize(7.5);
              doc.setTextColor(71, 85, 105);
              doc.text(commentLines, margin + 9, yy + 2);
              yy += commentLines.length * 3.8;
            }
            if (closeLines.length) {
              doc.setFont("helvetica", "normal");
              doc.setFontSize(7.5);
              doc.setTextColor(6, 95, 70);
              doc.text(closeLines, margin + 9, yy + 3);
            }
            y += rowH + 4.5;
          }

          if (pointPhotos.length) {
            ensureSpace(48);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7.6);
            doc.setTextColor(12, 42, 82);
            doc.text(`Bildedokumentasjon (${pointPhotos.length})`, margin + 12, y + 2);
            y += 5;
            const gap = 4;
            const cardW = (contentWidth - 18 - gap) / 2;
            const cardH = 38;
            for (let i = 0; i < pointPhotos.length; i += 2) {
              ensureSpace(cardH + 6);
              await drawImageGalleryCard({ ...pointPhotos[i], _reportCaption: `Bilde ${i + 1}` }, margin + 12, y, cardW, cardH);
              if (pointPhotos[i + 1]) {
                await drawImageGalleryCard({ ...pointPhotos[i + 1], _reportCaption: `Bilde ${i + 2}` }, margin + 12 + cardW + gap, y, cardW, cardH);
              }
              y += cardH + 5;
            }
          }
        };

const blobToDataUrl = (blob) => new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        const getImageInfo = (dataUrl) => new Promise((resolve) => {
          const image = new window.Image();
          image.onload = () => resolve({ width: image.width || 1, height: image.height || 1, image });
          image.onerror = () => resolve({ width: 1, height: 1, image: null });
          image.src = dataUrl;
        });
        const normalizeImageForJsPdf = async (dataUrl) => {
          const info = await getImageInfo(dataUrl);
          if (!info.image) throw new Error("Bildeformat støttes ikke i PDF.");
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, info.width || 1);
          canvas.height = Math.max(1, info.height || 1);
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(info.image, 0, 0, canvas.width, canvas.height);
          return { dataUrl: canvas.toDataURL("image/png"), width: canvas.width, height: canvas.height, format: "PNG" };
        };
        const addImageFromUrl = async (url, caption = "") => {
          const cleanUrl = normalizePdfUrl(url);
          if (!cleanUrl) return;
          try {
            const response = await fetch(cleanUrl, { mode: "cors" });
            if (!response.ok) throw new Error("Bilde kunne ikke hentes.");
            const blob = await response.blob();
            const rawDataUrl = await blobToDataUrl(blob);
            const info = await normalizeImageForJsPdf(rawDataUrl);
            const maxW = Math.min(82, contentWidth);
            const maxH = 62;
            let w = maxW;
            let h = w * (info.height / info.width);
            if (h > maxH) {
              h = maxH;
              w = h * (info.width / info.height);
            }
            ensureSpace(h + 12);
            doc.addImage(info.dataUrl, info.format, margin, y, w, h);
            y += h + 4;
            if (caption) addParagraph(caption, { size: 8.2, lineHeight: 4 });
          } catch (error) {
            addParagraph("Bilde kunne ikke bygges inn i rapporten.", { bold: true, size: 10.2, lineHeight: 4.6 });
            addParagraph("Originalfilen kan likevel åpnes via lenken under dersom filen fortsatt er tilgjengelig.", { size: 9.5, lineHeight: 4.4 });
            addLink(caption ? `Åpne originalfil – ${caption}` : "Åpne originalfil", cleanUrl);
          }
        };

        const drawSignatureBlock = async (label, signerName, imageUrl, x, yy, w, h = 44) => {
          doc.setDrawColor(203, 213, 225);
          doc.setFillColor(255, 255, 255);
          doc.roundedRect(x, yy, w, h, 2.8, 2.8, "FD");
          const image = imageUrl ? await loadPdfImage(imageUrl) : null;
          const imageAreaX = x + 5;
          const imageAreaY = yy + 5;
          const imageAreaW = w - 10;
          const imageAreaH = h - 19;
          if (image && !image.error) {
            let imgW = imageAreaW;
            let imgH = imgW * (image.height / image.width);
            if (imgH > imageAreaH) {
              imgH = imageAreaH;
              imgW = imgH * (image.width / image.height);
            }
            const imgX = imageAreaX + (imageAreaW - imgW) / 2;
            const imgY = imageAreaY + (imageAreaH - imgH) / 2;
            doc.addImage(image.dataUrl, image.format || "PNG", imgX, imgY, imgW, imgH);
          } else {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7.2);
            doc.setTextColor(148, 163, 184);
            doc.text("Ingen signaturbilde", x + w / 2, yy + 18, { align: "center" });
          }
          doc.setDrawColor(100, 116, 139);
          doc.line(x + 8, yy + h - 13, x + w - 8, yy + h - 13);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8.0);
          doc.setTextColor(15, 23, 42);
          doc.text(safeText(signerName || "Ikke oppgitt"), x + w / 2, yy + h - 8, { align: "center" });
          doc.setFont("helvetica", "normal");
          doc.setFontSize(6.8);
          doc.setTextColor(100, 116, 139);
          doc.text(safeText(label), x + w / 2, yy + h - 3.5, { align: "center" });
        };

        const loadPdfImage = async (url) => {
          const cleanUrl = storedFileUrl({ url }) || normalizePdfUrl(url);
          if (!cleanUrl) return null;
          if (isLikelyDocumentFile({ url: cleanUrl })) return { error: true, document: true, url: cleanUrl };
          try {
            const response = await fetch(cleanUrl, { mode: "cors" });
            if (!response.ok) throw new Error("Bilde kunne ikke hentes.");
            const blob = await response.blob();
            if (blob?.type && !/^image\//i.test(blob.type)) return { error: true, document: true, contentType: blob.type, url: cleanUrl };
            const rawDataUrl = await blobToDataUrl(blob);
            if (!/^data:image\//i.test(String(rawDataUrl || ""))) return { error: true, document: true, url: cleanUrl };
            const info = await normalizeImageForJsPdf(rawDataUrl);
            return { ...info, url: cleanUrl };
          } catch (error) {
            return { error: true, url: cleanUrl };
          }
        };
        const drawDocumentGalleryCard = (file, x, yy, w, h) => {
          const fileName = cleanPdfCaption(file?.name || file?._reportCaption, file?._reportCaption || "Dokumentvedlegg").slice(0, 90);
          const fileUrl = storedFileUrl(file);
          doc.setDrawColor(214, 226, 236);
          doc.setFillColor(255, 255, 255);
          doc.roundedRect(x, yy, w, h, 3, 3, "FD");
          doc.setFillColor(248, 250, 252);
          doc.roundedRect(x + 4, yy + 4, w - 8, h - 14, 2, 2, "F");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8.2);
          doc.setTextColor(15, 23, 42);
          doc.text("📄 Dokument vedlagt", x + 8, yy + 14);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7.2);
          doc.setTextColor(71, 85, 105);
          doc.text(doc.splitTextToSize(fileName, w - 16).slice(0, 2), x + 8, yy + 21);
          if (fileUrl) {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7.0);
            doc.setTextColor(0, 84, 180);
            if (typeof doc.textWithLink === "function") {
              doc.textWithLink("Åpne dokument", x + 8, yy + h - 12, { url: fileUrl });
            } else {
              doc.text("Åpne dokument", x + 8, yy + h - 12);
              doc.link(x + 8, yy + h - 16, 34, 5, { url: fileUrl });
            }
          }
          doc.setFont("helvetica", "bold");
          doc.setFontSize(7.2);
          doc.setTextColor(15, 23, 42);
          doc.text(doc.splitTextToSize(fileName, w - 8).slice(0, 1), x + 4, yy + h - 4.8);
        };
        const drawImageGalleryCard = async (photo, x, yy, w, h) => {
          if (isLikelyDocumentFile(photo)) {
            drawDocumentGalleryCard(photo, x, yy, w, h);
            return;
          }
          doc.setDrawColor(214, 226, 236);
          doc.setFillColor(255, 255, 255);
          doc.roundedRect(x, yy, w, h, 3, 3, "FD");
          const caption = cleanPdfCaption(photo.comment || photo._reportCaption || photo.name, photo._reportCaption || "Dokumentert bilde").slice(0, 80);
          const image = await loadPdfImage(storedFileUrl(photo) || photo.url);
          const imageAreaX = x + 4;
          const imageAreaY = yy + 4;
          const imageAreaW = w - 8;
          const imageAreaH = h - 14;
          doc.setFillColor(248, 250, 252);
          doc.roundedRect(imageAreaX, imageAreaY, imageAreaW, imageAreaH, 2, 2, "F");
          if (image && !image.error) {
            const imageMaxW = imageAreaW - 2;
            const imageMaxH = imageAreaH - 2;
            let imgW = imageMaxW;
            let imgH = imgW * (image.height / image.width);
            if (imgH > imageMaxH) {
              imgH = imageMaxH;
              imgW = imgH * (image.width / image.height);
            }
            const imgX = imageAreaX + (imageAreaW - imgW) / 2;
            const imgY = imageAreaY + (imageAreaH - imgH) / 2;
            doc.addImage(image.dataUrl, image.format || "PNG", imgX, imgY, imgW, imgH);
          } else {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7.2);
            doc.setTextColor(100, 116, 139);
            doc.text(doc.splitTextToSize("Bildet kunne ikke bygges inn automatisk", imageAreaW - 8), imageAreaX + 4, imageAreaY + 11);
            const cleanPhotoUrl = normalizePdfUrl(photo?.url || "");
            if (cleanPhotoUrl && !/^blob:/i.test(cleanPhotoUrl)) {
              doc.setFont("helvetica", "bold");
              doc.setFontSize(7.0);
              doc.setTextColor(0, 84, 180);
              const linkText = "Åpne originalfil";
              if (typeof doc.textWithLink === "function") {
                doc.textWithLink(linkText, imageAreaX + 4, imageAreaY + 22, { url: cleanPhotoUrl });
              } else {
                doc.text(linkText, imageAreaX + 4, imageAreaY + 22);
                doc.link(imageAreaX + 4, imageAreaY + 18, 34, 5, { url: cleanPhotoUrl });
              }
            }
          }
          doc.setFont("helvetica", "bold");
          doc.setFontSize(7.2);
          doc.setTextColor(15, 23, 42);
          doc.text(doc.splitTextToSize(caption, w - 8).slice(0, 1), x + 4, yy + h - 4.8);
        };
        const addImageGalleryCategory = async (category, items = []) => {
          if (!items.length) return;
          if (y > pageHeight - 66) {
            doc.addPage();
            y = 16;
          }
          doc.setDrawColor(191, 219, 254);
          doc.setFillColor(239, 246, 255);
          doc.roundedRect(margin, y, contentWidth, 12, 2.5, 2.5, "FD");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10.5);
          doc.setTextColor(12, 42, 82);
          doc.text(safeText(category), margin + 5, y + 7.7);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7.4);
          doc.setTextColor(71, 85, 105);
          doc.text(`${items.length} bilde${items.length === 1 ? "" : "r"}`, pageWidth - margin - 5, y + 7.7, { align: "right" });
          y += 17;
          const gap = 5;
          const isFinishedCategory = /ferdig resultat/i.test(String(category || ""));
          const cardW = isFinishedCategory ? contentWidth : (contentWidth - gap) / 2;
          const cardH = isFinishedCategory ? 86 : 50;
          for (let i = 0; i < items.length; i += isFinishedCategory ? 1 : 2) {
            ensureSpace(cardH + 7);
            await drawImageGalleryCard({ ...items[i], _reportCaption: `${category} – bilde ${i + 1}` }, margin, y, cardW, cardH);
            if (!isFinishedCategory && items[i + 1]) await drawImageGalleryCard({ ...items[i + 1], _reportCaption: `${category} – bilde ${i + 2}` }, margin + cardW + gap, y, cardW, cardH);
            y += cardH + 6;
          }
        };


        // FASE 13.15.2 HOTFIX: Global PDF note box helper tilgjengelig for alle rapportseksjoner.
        // 13.15.1 hadde fortsatt drawNoteBox definert for smalt i enkelte PDF-kjøringer/cache.
        const drawNoteBox = (text) => {
          const lines = doc.splitTextToSize(safeText(text), contentWidth - 18);
          const h = Math.max(18, lines.length * 4 + 10);
          ensureSpace(h + 4);
          doc.setDrawColor(191, 219, 254);
          doc.setFillColor(239, 246, 255);
          doc.roundedRect(margin, y, contentWidth, h, 2.5, 2.5, "FD");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.setTextColor(20, 86, 160);
          doc.text("i", margin + 7, y + 10);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(30, 64, 105);
          doc.text(lines, margin + 15, y + 8);
          y += h + 7;
        };

        const addWarrantyCertificatePages = async () => {
          if (!warrantyIssuedForReport() || !warrantyReadiness?.selectedSystem || !hasValue(warranty?.guaranteeNumber)) return;
          const selectedSystem = warrantyReadiness.selectedSystem;
          const guaranteeNumber = warranty.guaranteeNumber;
          const overtagelseDate = overtagelse?.dato || project?.date || "";
          const issuedDate = warranty?.issuedAt ? new Date(warranty.issuedAt) : /* @__PURE__ */ new Date();
          const issuedDateText = warranty?.issuedAt ? issuedDate.toLocaleDateString("no-NO") : "Utstedt";
          const reportText = warranty?.reportGeneratedAt ? new Date(warranty.reportGeneratedAt).toLocaleString("no-NO") : "Genereres nå";
          const warrantyValidTo = (() => {
            const sourceDate = overtagelseDate || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
            const d = new Date(sourceDate);
            if (Number.isNaN(d.getTime())) return "";
            d.setFullYear(d.getFullYear() + getWarrantyYears(warranty));
            return d.toISOString().slice(0, 10);
          })();
          const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(selectedSystem.sintefUrl)}&size=180&margin=1`;
          const qrFallbackUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=1&data=${encodeURIComponent(selectedSystem.sintefUrl)}`;
          const darkBlue = [12, 42, 82];
          const blue = [20, 86, 160];
          const lightBlue = [239, 246, 255];
          const green = [22, 163, 74];
          const gray = [100, 116, 139];
          const border = [214, 226, 236];
          const pageBottom = pageHeight - 16;
          const resetPage = () => {
            y = 16;
            doc.setDrawColor(...border);
            doc.setFillColor(255, 255, 255);
          };
          const drawFooterBand = (pageLabel = "Garantisertifikat") => {
            doc.setFillColor(...darkBlue);
            doc.rect(0, pageHeight - 14, pageWidth, 14, "F");
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7);
            doc.setTextColor(255, 255, 255);
            doc.text(`Expo ProffDok • ${pageLabel}`, margin, pageHeight - 6);
          };
          const addImageFit = async (url, x, yy, maxW, maxH) => {
            const cleanUrl = normalizePdfUrl(url);
            if (!cleanUrl) return false;
            try {
              const response = await fetch(cleanUrl, { mode: "cors" });
              if (!response.ok) throw new Error("Kunne ikke hente bilde.");
              const blob = await response.blob();
              const rawDataUrl = await blobToDataUrl(blob);
              const info = await normalizeImageForJsPdf(rawDataUrl);
              let w = maxW;
              let h = w * (info.height / info.width);
              if (h > maxH) {
                h = maxH;
                w = h * (info.width / info.height);
              }
              doc.addImage(info.dataUrl, info.format || "PNG", x, yy, w, h);
              return true;
            } catch (error) {
              return false;
            }
          };
          const drawHeader = async (title = "GARANTIDOKUMENTASJON") => {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8.5);
            doc.setTextColor(...blue);
            doc.text(title, margin, 17);
            doc.setDrawColor(...blue);
            doc.setLineWidth(0.35);
            doc.line(margin, 21, pageWidth - margin, 21);
            y = 31;
          };
          const drawInfoCard = (x, yy, w, h, label, value) => {
            doc.setDrawColor(...border);
            doc.setFillColor(255, 255, 255);
            doc.roundedRect(x, yy, w, h, 2.5, 2.5, "FD");
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7.2);
            doc.setTextColor(...gray);
            doc.text(safeText(label), x + 4, yy + 6);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8.8);
            doc.setTextColor(15, 23, 42);
            const lines = doc.splitTextToSize(safeText(value || "Ikke oppgitt"), w - 8);
            doc.text(lines.slice(0, 2), x + 4, yy + 11);
          };
          const drawCheckCard = (label, text) => {
            const h = 18;
            doc.setDrawColor(...border);
            doc.setFillColor(255, 255, 255);
            doc.roundedRect(margin, y, contentWidth, h, 2.5, 2.5, "FD");
            doc.setDrawColor(...green);
            doc.setFillColor(240, 253, 244);
            doc.circle(margin + 8, y + 9, 3.2, "FD");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            doc.setTextColor(...darkBlue);
            doc.text("OK", margin + 5.6, y + 10.1);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8.8);
            doc.setTextColor(15, 23, 42);
            doc.text(safeText(label), margin + 17, y + 7.3);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7.8);
            doc.setTextColor(51, 65, 85);
            doc.text(doc.splitTextToSize(safeText(text), contentWidth - 24), margin + 17, y + 12.2);
            y += h + 4;
          };
          const drawTerm = (heading, body) => {
            if (y > pageBottom - 34) {
              doc.addPage();
              resetPage();
              drawHeader("GARANTIDOKUMENTASJON");
            }
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10.2);
            doc.setTextColor(...darkBlue);
            doc.text(safeText(heading), margin, y);
            y += 5.3;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9.1);
            doc.setTextColor(31, 41, 55);
            const lines = doc.splitTextToSize(safeText(body), contentWidth);
            ensureSpace(lines.length * 4.8 + 8);
            doc.text(lines, margin, y);
            y += lines.length * 4.8 + 7;
          };

          doc.addPage();
          resetPage();

          doc.setFillColor(248, 250, 252);
          doc.rect(0, 0, pageWidth, pageHeight, "F");
          doc.setFillColor(255, 255, 255);
          doc.roundedRect(8, 8, pageWidth - 16, pageHeight - 22, 4, 4, "F");

          const logoSource = company.logoUrl || "/expo-logo.png";
          const logoOk = logoSource ? await addImageFit(logoSource, margin, 17, 60, 24) : false;
          if (!logoOk) {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(13);
            doc.setTextColor(...darkBlue);
            doc.text(name || company.companyName || "Utførende firma", margin, 28);
          }
          doc.setDrawColor(203, 213, 225);
          doc.line(pageWidth / 2, 19, pageWidth / 2, 39);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(15);
          doc.setTextColor(...darkBlue);
          doc.text("Expo ProffDok", pageWidth - margin, 27, { align: "right" });
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7.5);
          doc.setTextColor(...gray);
          doc.text("Prosjektdokumentasjon", pageWidth - margin, 32, { align: "right" });

          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.setTextColor(255, 255, 255);
          doc.setFillColor(...darkBlue);
          doc.roundedRect(pageWidth / 2 - 21, 48, 42, 8, 2, 2, "F");
          doc.text("GARANTISERTIFIKAT", pageWidth / 2, 53.5, { align: "center" });

          doc.setDrawColor(74, 222, 128);
          doc.setFillColor(236, 253, 245);
          doc.roundedRect(pageWidth / 2 - 23, 60, 46, 8, 2, 2, "FD");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(7.0);
          doc.setTextColor(6, 95, 70);
          doc.text(warranty?.issued ? "GARANTI AKTIV" : "GARANTI KLAR", pageWidth / 2, 65.3, { align: "center" });

          doc.setFont("helvetica", "bold");
          doc.setFontSize(24);
          doc.setTextColor(...darkBlue);
          doc.text(`${getWarrantyYears(warranty)} ÅRS`, pageWidth / 2, 82, { align: "center" });
          doc.setFontSize(20);
          doc.text("DOKUMENTERT", pageWidth / 2, 94, { align: "center" });
          doc.text("TETTHETSGARANTI", pageWidth / 2, 106, { align: "center" });
          doc.setFontSize(12);
          doc.setTextColor(...blue);
          doc.text(project.projectName || "Prosjekt", pageWidth / 2, 118, { align: "center" });

          const cardTop = 130;
          const cardGap = 4;
          const cardW = (contentWidth - cardGap) / 2;
          drawInfoCard(margin, cardTop, cardW, 22, "Utstedt til", project.customer || "Ikke oppgitt");
          drawInfoCard(margin + cardW + cardGap, cardTop, cardW, 22, "Utført av", `${name || company.companyName || "Ikke oppgitt"}${company.orgNumber ? "\nOrg.nr. " + company.orgNumber : ""}`);
          drawInfoCard(margin, cardTop + 26, cardW, 22, "Adresse", [project.address, project.postnr, project.city].filter(Boolean).join(", "));
          drawInfoCard(margin + cardW + cardGap, cardTop + 26, cardW, 22, "Garantinummer", guaranteeNumber);
          drawInfoCard(margin, cardTop + 52, cardW, 22, "Utstedelsesdato", issuedDateText);
          drawInfoCard(margin + cardW + cardGap, cardTop + 52, cardW, 22, "Gyldig til", warrantyValidTo || `${getWarrantyYears(warranty)} år fra overtakelse`);
          drawInfoCard(margin, cardTop + 78, contentWidth, 22, "Godkjent membransystem", `${selectedSystem.product} · ${selectedSystem.sintefApproval}`);

          const qrY = cardTop + 108;
          const qrDrawn = await addImageFit(qrUrl, margin + 2, qrY, 34, 34) || await addImageFit(qrFallbackUrl, margin + 2, qrY, 34, 34);
          if (!qrDrawn) {
            doc.setDrawColor(...border);
            doc.setFillColor(248, 250, 252);
            doc.roundedRect(margin + 2, qrY, 34, 34, 2.5, 2.5, "FD");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7);
            doc.setTextColor(...blue);
            doc.text("QR", margin + 19, qrY + 15, { align: "center" });
            doc.text("ikke lastet", margin + 19, qrY + 22, { align: "center" });
          }
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(51, 65, 85);
          doc.text(doc.splitTextToSize("Skann QR-koden for å åpne/verifisere SINTEF Teknisk Godkjenning for valgt membransystem.", contentWidth - 48), margin + 42, qrY + 7);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...blue);
          doc.text(selectedSystem.sintefApproval, margin + 42, qrY + 20);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7.2);
          doc.setTextColor(...gray);
          doc.text("Verifiser dokumentasjon", margin + 42, qrY + 28);

          drawFooterBand("Garantisertifikat");

          doc.addPage();
          resetPage();
          await drawHeader("GARANTIDOKUMENTASJON");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(16);
          doc.setTextColor(...darkBlue);
          doc.text("1. DOKUMENTASJONSGRUNNLAG", margin, y);
          y += 9;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8.5);
          doc.setTextColor(31, 41, 55);
          doc.text("Denne garantien er basert på følgende dokumentasjon og kontroller i prosjektet:", margin, y);
          y += 10;
          drawCheckCard("Overtagelse signert", "Prosjektet er overtatt og signert av kunde og utførende.");
          drawCheckCard("Ingen åpne avvik", "Alle avvik er lukket eller avklart før garantien er utstedt.");
          drawCheckCard("Sjekklister fullført", "Ordinære sjekklister og systemspesifikke garantipunkter er kontrollert.");
          drawCheckCard("Bildedokumentasjon registrert", "Bilder av relevante arbeidsoperasjoner er registrert i prosjektet.");
          drawCheckCard("Godkjent Sopro-system valgt", `${selectedSystem.product} er dokumentert med ${selectedSystem.sintefApproval}.`);
          drawCheckCard("Garantivilkår mottatt", warranty?.termsAccepted ? `Kunde/representant har bekreftet mottak og aksept av garantivilkår. Bekreftet av ${warranty?.termsAcceptedBy || "ikke oppgitt"}.` : "Garantivilkår er vedlagt, men kvittering er ikke registrert.");
          drawCheckCard("Komplett PDF-rapport generert", "Sluttrapport med sjekklister, bilder, produktdokumentasjon og garantibevis er generert.");
          drawNoteBox("Garantien gjelder kun for det dokumenterte arbeidet i dette prosjektet og forutsetter normal bruk og vedlikehold i henhold til FDV-dokumentasjonen.");
          addSubTitle("Arkivering av dokumentasjon");
          addParagraph("Utførende firma er ansvarlig for å laste ned og oppbevare komplett sluttrapport, inkludert bilder, sjekklister, produktdokumentasjon og garantibevis. Expo ProffDok fungerer som dokumentasjonsplattform, men kan ikke garantere ubegrenset lagringstid eller tilgjengelighet av prosjektdata.");
          addKeyValue("Sist genererte rapport", reportText);
          drawFooterBand("Dokumentasjonsgrunnlag");

          doc.addPage();
          resetPage();
          await drawHeader("GARANTIDOKUMENTASJON");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(16);
          doc.setTextColor(...darkBlue);
          doc.text("2. GARANTIVILKÅR", margin, y);
          y += 9;
          drawTerm("Garantien", `Denne garantien dokumenterer at våtrommet er utført med et godkjent Sopro membransystem og at arbeidet er dokumentert gjennom Expo ProffDok. Garantien gjelder tettheten i det dokumenterte membransystemet i ${getWarrantyYears(warranty)} år fra dato for signert overtakelse, forutsatt at arbeidene er utført i henhold til gjeldende krav, produsentens anvisninger og prosjektets dokumenterte sjekklister.`);
          drawTerm("Hvem garantien gjelder for", "Garantien gjelder for den aktuelle boligen og følger eiendommen ved et eventuelt eierskifte innen garantiperioden. Ny eier overtar de samme rettigheter og forpliktelser som opprinnelig eier.");
          drawTerm("Garantigiver", "Garantien utstedes av det utførende firmaet som er angitt i garantibeviset. Expo ProffDok fungerer som dokumentasjonsplattform og arkiv for prosjektets dokumentasjon, men er ikke part i garantiforholdet.");
          drawTerm("Forutsetninger for garantien", "Garantien forutsetter at prosjektet er dokumentert i Expo ProffDok, at nødvendige sjekklister er gjennomført, at bildedokumentasjon er registrert, at overtakelse er signert, at godkjent Sopro-system er benyttet og at senere arbeider ikke har skadet membransystemet.");
          drawTerm("Hva garantien omfatter", "Garantien omfatter dokumenterte feil i membransystemets tetthet når disse skyldes utførelse eller installasjon av det dokumenterte systemet. Garantien gjelder de områdene som omfattes av prosjektets dokumentasjon.");
          drawTerm("Hva garantien ikke omfatter", "Garantien omfatter ikke mekanisk skade, hulltaking eller inngrep etter overtakelse, manglende vedlikehold, setningsskader i bygget, frostskader, brann- eller vannskader fra andre kilder, naturhendelser eller arbeider utført av andre etter overtakelse.");
          drawTerm("Reklamasjon og varsling", "Forhold som kan omfattes av garantien skal meldes til garantigiver uten ugrunnet opphold etter at forholdet er oppdaget. Reklamasjonen bør inneholde en beskrivelse av forholdet, bilder og relevant dokumentasjon.");
          drawTerm("Dokumentasjon og arkiv", "Garantibeviset er kun gyldig sammen med prosjektets komplette dokumentasjon, inkludert bilder, sjekklister, produktdokumentasjon og signert overtakelse. Det anbefales at boligeier oppbevarer rapporten som en del av boligens FDV-dokumentasjon.");
          drawFooterBand("Garantivilkår");

          doc.addPage();
          resetPage();
          await drawHeader("GARANTIDOKUMENTASJON");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(16);
          doc.setTextColor(...darkBlue);
          doc.text("3. BEKREFTELSE", margin, y);
          y += 8;
          addParagraph("Denne garantien er utstedt elektronisk og bygger på registrert prosjektdata, signert overtakelse, sjekklister og bildedokumentasjon i Expo ProffDok.");

          const tableY = y + 4;
          const rowH = 10;
          const labelW = 48;
          const tableRows = [
            ["Utførende firma", name || company.companyName || ""],
            ["Org.nr.", company.orgNumber || ""],
            ["Dato", issuedDateText],
            ["Kontaktperson", project.responsible || user.name || authUser?.email || ""],
            ["Telefon", companyPhoneForReport || ""],
            ["E-post", company.email || ""]
          ];
          doc.setDrawColor(...border);
          doc.setFillColor(255, 255, 255);
          doc.roundedRect(margin, tableY, contentWidth, tableRows.length * rowH, 2.5, 2.5, "FD");
          tableRows.forEach(([label, value], index) => {
            const yy = tableY + index * rowH;
            if (index > 0) doc.line(margin, yy, pageWidth - margin, yy);
            doc.line(margin + labelW, yy, margin + labelW, yy + rowH);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8);
            doc.setTextColor(...darkBlue);
            doc.text(label, margin + 4, yy + 6.5);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(31, 41, 55);
            doc.text(doc.splitTextToSize(safeText(value || "Ikke oppgitt"), contentWidth - labelW - 8), margin + labelW + 4, yy + 6.5);
          });
          y = tableY + tableRows.length * rowH + 14;

          doc.setDrawColor(...border);
          doc.setFillColor(255, 255, 255);
          doc.roundedRect(margin, y, contentWidth, 34, 2.5, 2.5, "FD");
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(51, 65, 85);
          doc.text(`Bekreftet av ${name || company.companyName || "utførende firma"}`, pageWidth / 2, y + 8, { align: "center" });
          doc.setFont("helvetica", "bold");
          doc.setFontSize(14);
          doc.setTextColor(...blue);
          doc.text(project.responsible || user.name || "Elektronisk utstedt", pageWidth / 2, y + 20, { align: "center" });
          doc.setDrawColor(148, 163, 184);
          doc.line(margin + 36, y + 24, pageWidth - margin - 36, y + 24);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7.5);
          doc.setTextColor(...gray);
          doc.text("Elektronisk bekreftelse", pageWidth / 2, y + 29, { align: "center" });
          y += 44;

          drawNoteBox("Takk for tilliten. Ta vare på garantidokumentet sammen med komplett FDV-rapport og øvrig prosjektdokumentasjon.");
          drawFooterBand("Bekreftelse");
        };
        setPdfProgress("Bygger forside…", "Klargjør rapportforside og prosjektstatus.");
        await addCoverPage();

        setPdfProgress("Legger inn prosjektfakta…", "Bygger prosjektfakta og innholdsfortegnelse.");
        const reportStatusForFacts = reportDocumentationStatus();
        addInfoGridSection("Prosjektfakta", [
          ["Prosjektnavn", project.projectName],
          ["Kunde", project.customer],
          ["Adresse", reportAddressLine()],
          ["Prosjektleder / ansvarlig", project.responsible || user.name],
          ["Utførende firma", name || company.companyName || "Expo ProffDok"],
          ["Oppstart / dato", project.date],
          ["Ferdigstillelse / overtagelse", projectHasOvertagelse(overtagelse) ? overtagelse?.dato : "Ikke registrert"],
          ["Garantiperiode", warranty?.issued ? `${getWarrantyYears(warranty)} år` : warranty?.enabled ? `${getWarrantyYears(warranty)} år – ikke utstedt` : ""],
          ["Garantinummer", warranty?.guaranteeNumber],
          ["Dokumentnummer", makeReportDocumentNumber()],
          ["Rapport generert", reportGeneratedAtLabel()],
          ["Dokumentasjonsgrad", `${reportStatusForFacts.percent} %`]
        ]);

        addSectionTitle("Innhold");
        const reportTocSections = [];
        const addTocSection = (label, include = true) => {
          if (include) reportTocSections.push(label);
        };
        const hasProsjekteringContent = [project.fallDusj, project.fallUtenfor, project.fall, project.sluk, project.terskel, project.membran, project.prosjekteringKommentar].some(hasValue) || (Array.isArray(project.prosjekteringPunkter) && project.prosjekteringPunkter.some((p) => hasValue(p?.title) || hasValue(p?.value)));
        const hasProductContent = (selected || []).length > 0 || (manualSelected || []).length > 0 || Object.values(other || {}).some(Boolean);
        const hasSurfaceContent = buildBathroomEquipmentReportGroups(surf, bathroomEquipment).length > 0;
        const hasPhotoContent = (photos || []).some((photo) => hasValue(photo?.url));
        const hasInstallContent = (inst || []).length > 0;
        const hasChecklistContent = Object.values(checklist || {}).some((items) => Object.keys(items || {}).length > 0);
        const hasDeviationContent = Object.values(checklist || {}).some((items) => Object.values(items || {}).some((value) => value?.status === "Avvik" || value?.status === "Lukket avvik")) || (Array.isArray(project?.projectDeviations) && project.projectDeviations.some((entry) => !!entry?.includeInReport));
        const hasOfferContent = !!tilbud?.enabled && (hasValue(tilbud?.tillegg) || hasValue(tilbud?.fradrag) || hasValue(tilbud?.kommentar) || (tilbud?.files || []).length > 0);
        const hasAttachmentContent = countReportAttachments() > 0;
        const hasAccessContent = (access || []).some((entry) => hasValue(entry?.name) || hasValue(entry?.email));
        const finalReportForToc = isFinalReport(reportStatusForFacts);
        addTocSection("Prosjektinformasjon");
        addTocSection("Prosjektering", hasProsjekteringContent);
        addTocSection("Produkter / FDV", hasProductContent);
        addTocSection("Overflater og innredning", hasSurfaceContent);
        addTocSection("Bildedokumentasjon", hasPhotoContent);
        addTocSection("Fag, deler og utstyr", hasInstallContent);
        addTocSection("Sjekkliste / utførte kontroller", hasChecklistContent);
        addTocSection("Avviksliste", hasDeviationContent);
        addTocSection("Tilbud / kontrakt", hasOfferContent);
        addTocSection("Overtagelse", projectHasOvertagelse(overtagelse));
        addTocSection("Vedlegg", hasAttachmentContent);
        addTocSection("Prosjekttilgang", hasAccessContent);
        addTocSection("Garantisertifikat", warrantyIssuedForReport());
        addTocSection("Garantivilkår", warrantyIssuedForReport());
        addTocSection("Dokumentasjonsstatus");
        addTocSection(finalReportForToc ? "Sluttdokumentasjon" : "Dokumentasjonsoversikt");
        reportTocSections.forEach((label, index) => addParagraph(`${index + 1}. ${label}`, { size: 10, lineHeight: 5.2 }));
        addDivider();

        setPdfProgress("Legger inn prosjektinformasjon…", "Firma, kunde, prosjekt og prosjektering.");
        addInfoGridSection("Firma", [
          ["Utførende firma", name || company.companyName || "Expo ProffDok"],
          ["Adresse", company.address],
          ["Org.nr", company.orgNumber],
          ["Telefon", companyPhoneForReport],
          ["E-post", company.email],
          ["Nettside", company.website]
        ]);

        addInfoGridSection("Kunde og prosjekt", [
          ["Prosjektansvarlig", project.responsible],
          ["Prosjektnavn", project.projectName],
          ["Adresse", [project.address, project.postnr, project.city].filter(Boolean).join(", ")],
          ["Kunde", project.customer],
          ["Kunde e-post", project.customerEmail],
          ["Kunde telefon", project.customerPhone],
          ["Dato", project.date],
          ["Status", project.locked ? "Avsluttet / låst" : "Aktivt"],
          ["Notater", project.notes]
        ]);

        addReportSummary();

        const projectDescriptionReport = splitAcceptedOfferFromDescription(project.projectDescription || "");
        if (project.projectInfoIncludeInReport && hasValue(project.projectDescription)) {
          addSectionTitle("Prosjektinformasjon/beskrivelse");
          if (projectDescriptionReport.intro) addParagraph(projectDescriptionReport.intro);
          if (projectDescriptionReport.rows.length || projectDescriptionReport.total) {
            addSubTitle(projectDescriptionReport.heading || "Akseptert tilbud");
            projectDescriptionReport.rows.forEach((row) => {
              if (row.label) addKeyValue(row.label, row.value);
              else addParagraph(row.value, { size: 9, lineHeight: 4.6 });
            });
            addAcceptedOfferTotalBox(projectDescriptionReport.total);
          } else if (!projectDescriptionReport.intro) {
            addParagraph(project.projectDescription);
          }
        }

        const prosjekteringEntries = [
          ["Fall i dusjsone", project.fallDusj],
          ["Fall utenfor dusjsone / våtsone", project.fallUtenfor],
          ["Fall mot sluk", project.fall],
          ["Slukplassering", project.sluk],
          ["Terskelhøyde", project.terskel],
          ["Membran", project.membran],
          ...((Array.isArray(project.prosjekteringPunkter) ? project.prosjekteringPunkter : []).filter((p) => hasValue(p.title) || hasValue(p.value)).map((p) => [`${p.category || "Annet"}: ${p.title || "Eget punkt"}`, p.value])),
          ["Kommentar / avvik", project.prosjekteringKommentar]
        ];
        addInfoGridSection("Prosjektering", prosjekteringEntries);

        setPdfProgress("Legger inn produkter og FDV…", "Bygger produktkort og valgte dokumentlenker.");
        const allProducts = [...selected || [], ...manualSelected || []];
        const legacyOtherProducts = Object.entries(other || {}).filter(([, v]) => v);
        if (allProducts.length || legacyOtherProducts.length) {
          addSectionPageBreak("Produkter / FDV");
          const productsBySection = allProducts.reduce((acc, product) => {
            const section = product.section || "Andre produkter";
            acc[section] = [...acc[section] || [], product];
            return acc;
          }, {});
          Object.entries(productsBySection).forEach(([section, products]) => {
            addProductCategoryHeader(section, products.length);
            products.forEach((p) => addProductReportCard(p));
          });
          legacyOtherProducts.forEach(([k, v]) => addParagraph(`Tidligere registrert annet produkt under ${k}: ${v}`));
        }

        const bathroomEquipmentGroupsForPdf = buildBathroomEquipmentReportGroups(surf, bathroomEquipment);
        if (bathroomEquipmentGroupsForPdf.length) {
          addSectionPageBreak("Overflater og innredning");
          bathroomEquipmentGroupsForPdf.forEach((group) => {
            addEquipmentCategoryHeader(group.title, (group.items || []).length);
            (group.items || []).forEach((item) => addEquipmentReportCard(item));
          });
        }

        setPdfProgress("Samler bilder…", "Laster inn og konverterer bilder til PDF-format.");
        const photoCats = [...new Set((photos || []).map((photo) => photo.cat).filter(Boolean))];
        if (photoCats.length) {
          addSectionPageBreak("Bildedokumentasjon");
          for (const cat of photoCats) {
            await addImageGalleryCategory(cat, (photos || []).filter((item) => item.cat === cat));
          }
        }

        if ((inst || []).length) {
          if (photoCats.length) addSectionTitle("Fag, deler og utstyr");
          else addSectionPageBreak("Fag, deler og utstyr");
        }
        for (const item of inst || []) {
          const sectionTitle = item.category || "Fag/utstyr";
          addSubTitle(sectionTitle);
          addParagraph([item.name, item.qty, item.supplier, item.desc].filter(Boolean).join(" · "));
          addLink("Åpne FDV/datablad", item.fdvUrl);
          const installPhotos = (item.photos || []).filter((photo) => (hasValue(photo?.url) || hasValue(photo?.path)) && !isLikelyDocumentFile(photo));
          if (installPhotos.length) {
            const galleryTitle = [sectionTitle, item.name || item.supplier || "bilder"].filter(Boolean).join(" – ");
            await addImageGalleryCategory(galleryTitle, installPhotos.map((photo, index) => ({ ...photo, _reportCaption: `${galleryTitle} – bilde ${index + 1}` })));
          }
          addDivider();
        }

        setPdfProgress("Bygger sjekklister…", "Fremhever OK-punkter, avvik og kommentarer.");
        const checklistCategoriesForReport = Object.entries(checklist || {}).filter(([, items]) => Object.keys(items || {}).length > 0);
        if (checklistCategoriesForReport.length) {
          addSectionPageBreak("Sjekkliste / utførte kontroller");
          addParagraph("Kontrollpunktene under viser registrert status for prosjektet. Godkjente punkter er fremhevet for å gi en tydelig dokumentasjon av utført kontroll.", { size: 8.5, lineHeight: 4.3 });
          for (const [category, items] of checklistCategoriesForReport) {
            const itemEntries = Object.entries(items || {});
            addChecklistCategoryTitle(category, itemEntries.length);
            for (const [item, value] of itemEntries) {
              await addChecklistStatusCard(category, item, value || {});
            }
          }
        }

        const deviations = [];
        Object.entries(checklist || {}).forEach(([category, items]) => {
          Object.entries(items || {}).forEach(([item, value]) => {
            if (value?.status === "Avvik" || value?.status === "Lukket avvik") deviations.push({ category, item, status: value?.status || "", comment: value?.comment || "", closeComment: value?.closeComment || "", closedBy: value?.closedBy || "", closedAt: value?.closedAt || "" });
          });
        });
        const projectDeviationsForReport = (Array.isArray(project?.projectDeviations) ? project.projectDeviations : []).filter((entry) => !!entry?.includeInReport);
        if (deviations.length || projectDeviationsForReport.length) {
          addSectionTitle("Avviksliste");
          const openDeviationTotal = deviations.filter((d) => d.status === "Avvik").length + projectDeviationsForReport.filter((d) => (d?.status || "Åpent") !== "Lukket").length;
          const closedDeviationTotal = deviations.filter((d) => d.status === "Lukket avvik").length + projectDeviationsForReport.filter((d) => (d?.status || "Åpent") === "Lukket").length;
          addParagraph(`Avviksoppsummering: ${openDeviationTotal} åpne avvik · ${closedDeviationTotal} lukkede avvik`, { bold: true });
          if (deviations.length) addParagraph("Sjekkpunktavvik blir alltid tatt med i rapporten.", { size: 8.5, lineHeight: 4.2 });
          deviations.forEach((d) => {
            addSubTitle(`${d.status === "Lukket avvik" ? "✅ Lukket avvik" : "⚠️ Åpent avvik"} – ${d.category} / ${d.item}`);
            if (d.comment) addKeyValue("Opprinnelig avvik", d.comment);
            if (d.status === "Lukket avvik") {
              addKeyValue("Utbedring / lukkekommentar", d.closeComment || "Lukket uten egen lukkekommentar");
              addKeyValue("Lukket av", d.closedBy || "Ikke oppgitt");
              addKeyValue("Lukket dato", d.closedAt ? new Date(d.closedAt).toLocaleString("no-NO") : "Ikke oppgitt");
            } else if (!d.comment) {
              addParagraph("Avvik registrert uten kommentar.");
            }
            addDivider();
          });
          projectDeviationsForReport.forEach((d) => {
            const isClosed = (d?.status || "Åpent") === "Lukket";
            addSubTitle(`${isClosed ? "✅ Lukket" : "⚠️ Åpent"} HMS-/prosjektavvik – ${d?.title || d?.type || "Avvik"}`);
            addKeyValue("Type", d?.type || "Ikke oppgitt");
            addKeyValue("Alvorlighet", d?.severity || "Ikke oppgitt");
            addKeyValue("Status", d?.status || "Åpent");
            addKeyValue("Ansvarlig", d?.responsible || "Ikke oppgitt");
            addKeyValue("Frist", d?.dueDate || "Ikke oppgitt");
            if (d?.description) addKeyValue("Beskrivelse", d.description);
            if (d?.action) addKeyValue("Tiltak / oppfølging", d.action);
            if (d?.affectsWarranty) addKeyValue("Påvirker garanti/sluttdokumentasjon", "Ja");
            if (isClosed) {
              addKeyValue("Utbedring / lukkekommentar", d?.closeComment || "Lukket uten egen lukkekommentar");
              addKeyValue("Lukket av", d?.closedBy || "Ikke oppgitt");
              addKeyValue("Lukket dato", d?.closedAt ? new Date(d.closedAt).toLocaleString("no-NO") : "Ikke oppgitt");
            }
            if ((d?.photos || []).length) addParagraph(`Bildedokumentasjon registrert: ${(d.photos || []).length} bilde${(d.photos || []).length === 1 ? "" : "r"}.`, { size: 8.5, lineHeight: 4.2 });
            addDivider();
          });
        }

        if (tilbud?.enabled && (hasValue(tilbud.tillegg) || hasValue(tilbud.fradrag) || hasValue(tilbud.kommentar) || (tilbud.files || []).length > 0)) {
          const descriptionComparable = normalizeReportComparable(project.projectDescription || "");
          const offerCommentComparable = normalizeReportComparable(tilbud.kommentar || "");
          const offerCommentDuplicatesDescription = !!offerCommentComparable && !!descriptionComparable && (descriptionComparable.includes(offerCommentComparable) || offerCommentComparable.includes(descriptionComparable));
          addSectionTitle("Tilbud / kontrakt");
          if (hasValue(tilbud.tillegg)) addKeyValue("Tillegg", tilbud.tillegg);
          if (hasValue(tilbud.fradrag)) addKeyValue("Fradrag", tilbud.fradrag);
          if (hasValue(tilbud.kommentar) && !offerCommentDuplicatesDescription) addKeyValue("Avtaleendringer / kommentar", tilbud.kommentar);
          if ((tilbud.files || []).length > 0) addParagraph("Tilbuds- og kontraktsdokumenter er vedlagt og ligger også samlet bakerst i rapporten under Vedlegg.", { size: 9.5, lineHeight: 4.6 });
          (tilbud.files || []).forEach((file) => addLink(file.name || "Vedlegg", file.url));
        }

        if (projectHasOvertagelse(overtagelse)) {
          addSectionPageBreak("Overtagelse");
          const hasRemarks = hasValue(overtagelse.kommentar) && !/^ingen\s*(bemerkninger|merknader)?$/i.test(String(overtagelse.kommentar).trim());
          ensureSpace(54);
          doc.setDrawColor(...(hasRemarks ? [251, 191, 36] : [74, 222, 128]));
          doc.setFillColor(...(hasRemarks ? [255, 251, 235] : [236, 253, 245]));
          doc.roundedRect(margin, y, contentWidth, 28, 3, 3, "FD");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(13);
          doc.setTextColor(...(hasRemarks ? [146, 64, 14] : [6, 95, 70]));
          doc.text(hasRemarks ? "OVERTATT MED MERKNAD" : "OVERTATT UTEN MERKNAD", margin + 6, y + 11);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8.3);
          doc.setTextColor(51, 65, 85);
          doc.text(doc.splitTextToSize(hasRemarks ? overtagelse.kommentar : "Prosjektet er registrert overtatt av kunde og utførende.", contentWidth - 12), margin + 6, y + 19);
          y += 34;
          const signGap = 5;
          const signW = (contentWidth - signGap) / 2;
          drawInfoCardPdf(margin, y, signW, 22, "Dato", overtagelse.dato || "Ikke oppgitt");
          drawInfoCardPdf(margin + signW + signGap, y, signW, 22, "Status", hasRemarks ? "Overtatt med merknad" : "Overtatt uten merknad");
          y += 27;
          drawInfoCardPdf(margin, y, signW, 22, "Utførende", overtagelse.signUtførende || project.responsible || user.name || "Ikke oppgitt");
          drawInfoCardPdf(margin + signW + signGap, y, signW, 22, "Kunde", overtagelse.signKunde || project.customer || "Ikke oppgitt");
          y += 27;
          if (warranty?.enabled) {
            drawInfoCardPdf(margin, y, contentWidth, 22, `Garantivilkår ${getWarrantyYears(warranty)} år`, warranty?.termsAccepted ? `Mottatt og akseptert av ${warranty?.termsAcceptedBy || warranty?.termsReceiptName || "kunde"}${warranty?.termsAcceptedAt ? " " + new Date(warranty.termsAcceptedAt).toLocaleString("no-NO") : ""}` : "Ikke bekreftet");
            y += 30;
          } else {
            y += 3;
          }
          ensureSpace(50);
          await drawSignatureBlock("Signatur utførende", overtagelse.signUtførende || project.responsible || user.name || "Utførende", overtagelse.signUtførendeImage, margin, y, signW, 46);
          await drawSignatureBlock("Signatur kunde", overtagelse.signKunde || project.customer || "Kunde", overtagelse.signKundeImage, margin + signW + signGap, y, signW, 46);
          y += 54;
        }

        const checklistDocumentAttachments = [];
        Object.entries(checklist || {}).forEach(([category, items]) => {
          Object.entries(items || {}).forEach(([item, value]) => {
            (value?.photos || []).filter((file) => isLikelyDocumentFile(file)).forEach((file, index) => {
              checklistDocumentAttachments.push({
                ...file,
                name: file?.name || `${item} – dokument ${index + 1}`,
                _sourceLabel: `Sjekkliste: ${category} / ${item}`
              });
            });
          });
        });
        const installDocumentAttachments = [];
        (inst || []).forEach((entry) => {
          (entry?.photos || []).filter((file) => isLikelyDocumentFile(file)).forEach((file, index) => {
            installDocumentAttachments.push({
              ...file,
              name: file?.name || `${entry?.name || entry?.category || "Fag/utstyr"} – dokument ${index + 1}`,
              _sourceLabel: `Fag/utstyr: ${entry?.category || "Uspesifisert"}`
            });
          });
        });
        const reportAttachments = [
          ...(files || []).map((file) => ({ ...file, _sourceLabel: "Sjekklister / andre vedlegg" })),
          ...checklistDocumentAttachments,
          ...installDocumentAttachments,
          ...(tilbud?.files || []).map((file) => ({ ...file, _sourceLabel: "Tilbud / kontrakt" }))
        ];
        const visibleReportAttachments = reportAttachments.filter((file) => hasValue(file?.name) || hasValue(file?.url) || hasValue(file?.path));
        if (visibleReportAttachments.length) addAttachmentList("Vedlegg – opplastede filer", visibleReportAttachments);

        const visibleAccess = (access || []).filter((a) => hasValue(a?.name) || hasValue(a?.email));
        if (visibleAccess.length) {
          addSectionTitle("Prosjekttilgang");
          visibleAccess.forEach((a) => addParagraph(`${a.name || a.email} — ${a.role || "Tilgang"}`));
        }

        setPdfProgress("Oppretter garantidokument…", "Legger inn garantisertifikat, vilkår og SINTEF-QR bare når garanti er utstedt.");
        await addWarrantyCertificatePages();

        setPdfProgress("Legger inn dokumentasjonsstatus…", "Oppsummerer komplett dokumentasjonsgrad.");
        const addDocumentationStatusPage = () => {
          const status = reportDocumentationStatus();
          const drawReportNoteBox = (text) => {
            const lines = doc.splitTextToSize(safeText(text), contentWidth - 18);
            const h = Math.max(18, lines.length * 4 + 10);
            ensureSpace(h + 4);
            doc.setDrawColor(191, 219, 254);
            doc.setFillColor(239, 246, 255);
            doc.roundedRect(margin, y, contentWidth, h, 2.5, 2.5, "FD");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.setTextColor(20, 86, 160);
            doc.text("i", margin + 7, y + 10);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(30, 64, 105);
            doc.text(lines, margin + 15, y + 8);
            y += h + 7;
          };
          doc.addPage();
          y = 16;
          addSectionTitle("Dokumentasjonsstatus");
          doc.setFillColor(12, 42, 82);
          doc.roundedRect(margin, y, contentWidth, 32, 4, 4, "F");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(13);
          doc.setTextColor(255, 255, 255);
          doc.text("Dokumentasjonsgrad", margin + 8, y + 12);
          doc.setFontSize(24);
          doc.text(`${status.percent} %`, pageWidth - margin - 8, y + 21, { align: "right" });
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8.4);
          doc.setTextColor(226, 232, 240);
          doc.text("Basert på registrerte produkter, bilder, sjekklister, vedlegg, overtagelse og garanti.", margin + 8, y + 23);
          y += 42;

          status.items.forEach((item) => {
            ensureSpace(16);
            doc.setDrawColor(item.ok ? 187 : 253, item.ok ? 247 : 186, item.ok ? 208 : 116);
            doc.setFillColor(item.ok ? 236 : 255, item.ok ? 253 : 251, item.ok ? 245 : 235);
            doc.roundedRect(margin, y, contentWidth, 13, 2.5, 2.5, "FD");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9.4);
            doc.setTextColor(item.ok ? 6 : 146, item.ok ? 95 : 64, item.ok ? 70 : 14);
            doc.text(item.ok ? "OK" : "MÅ FØLGES OPP", margin + 5, y + 8.3);
            doc.setTextColor(15, 23, 42);
            doc.text(safeText(item.label), margin + 38, y + 8.3);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(71, 85, 105);
            doc.text(doc.splitTextToSize(safeText(item.detail), contentWidth - 105).slice(0, 1), pageWidth - margin - 5, y + 8.3, { align: "right" });
            y += 17;
          });

          y += 4;
          drawReportNoteBox("Rapporten bør lastes ned og lagres sammen med øvrig FDV-dokumentasjon. Ved salg av boligen bør rapporten deles med ny eier, megler og/eller takstmann der dette er relevant.");
        };
        addDocumentationStatusPage();

        const addFinalDocumentationCertificatePage = async () => {
          const status = reportDocumentationStatus();
          const customerUrl = reportCustomerPortalUrl();
          const reportFinal = isFinalReport(status);
          const qrUrl = reportFinal && customerUrl ? `https://quickchart.io/qr?text=${encodeURIComponent(customerUrl)}&size=180&margin=1` : "";
          const reportHeroPhotoId = safeText(project?.reportHeroPhotoId || "").trim();
          const selectedCoverImage = reportHeroPhotoId ? (photos || []).find((photo) => hasValue(photo?.url) && getPhotoIdentity(photo) === reportHeroPhotoId) : null;
          const coverImage = selectedCoverImage || null;
          const coverImageUrl = coverImage?.url || DEFAULT_REPORT_HERO_IMAGE_URL;
          doc.addPage();
          y = 16;
          doc.setFillColor(8, 18, 30);
          doc.rect(0, 0, pageWidth, pageHeight, "F");
          doc.setFillColor(255, 255, 255);
          doc.roundedRect(8, 8, pageWidth - 16, pageHeight - 20, 5, 5, "F");
          const hero = await loadPdfImage(coverImageUrl);
          if (hero && !hero.error) {
            const heroDataUrl = await makeReportHeroPremiumImage(hero, pageWidth - 24, 96);
            doc.addImage(heroDataUrl, "JPEG", 12, 12, pageWidth - 24, 96);
          } else {
            doc.setFillColor(12, 42, 82);
            doc.roundedRect(12, 12, pageWidth - 24, 92, 3, 3, "F");
          }
          doc.setFillColor(255, 255, 255);
          doc.setGState && doc.setGState(new doc.GState({ opacity: 0.92 }));
          doc.roundedRect(margin, 70, contentWidth, 24, 3, 3, "F");
          doc.setGState && doc.setGState(new doc.GState({ opacity: 1 }));
          doc.setFont("helvetica", "bold");
          doc.setFontSize(17);
          doc.setTextColor(12, 42, 82);
          doc.text(reportFinal ? "SLUTTDOKUMENTASJON" : "DOKUMENTASJONSOVERSIKT", pageWidth / 2, 90, { align: "center" });
          y = 114;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.setTextColor(51, 65, 85);
          const certificateIntro = reportFinal ? "Prosjektet er registrert overtatt. Oversikten viser dokumentasjonen som er registrert i Expo ProffDok ved genereringstidspunktet." : "Rapporten viser registrert dokumentasjon og hva som fortsatt må følges opp. Innhold som ikke er registrert i prosjektet, inngår ikke i rapporten.";
          doc.text(doc.splitTextToSize(certificateIntro, contentWidth), margin, y);
          y += 20;
          const certW = (contentWidth - 6) / 2;
          drawInfoCardPdf(margin, y, certW, 22, "Prosjekt", project.projectName || project.address || "Prosjekt");
          drawInfoCardPdf(margin + certW + 6, y, certW, 22, "Kunde", project.customer || "Ikke oppgitt");
          y += 28;
          drawInfoCardPdf(margin, y, certW, 22, "Utførende", name || company.companyName || "Ikke oppgitt");
          drawInfoCardPdf(margin + certW + 6, y, certW, 22, "Rapportnummer", makeReportDocumentNumber());
          y += 34;
          const metricGap = 4;
          const metricW = (contentWidth - metricGap * 3) / 4;
          drawMetricCard(margin, y, metricW, 20, "Dokumentasjonsgrad", `${status.percent} %`, status.percent >= 90 ? "green" : "blue");
          drawMetricCard(margin + (metricW + metricGap), y, metricW, 20, "Bilder", String(status.photoTotal), "blue");
          drawMetricCard(margin + (metricW + metricGap) * 2, y, metricW, 20, "Produkter", String(status.productTotal), "neutral");
          drawMetricCard(margin + (metricW + metricGap) * 3, y, metricW, 20, "Avvik", String(status.openDeviationTotal), status.openDeviationTotal ? "red" : "green");
          y += 34;
          const checklistComplete = status.checklistCompleteForFinal;
          const certItems = [
            { label: "Bildedokumentasjon", ok: status.photoTotal > 0, detail: status.photoTotal > 0 ? `${status.photoTotal} bilde${status.photoTotal === 1 ? "" : "r"} registrert` : "Ingen bilder registrert" },
            { label: "Produktdokumentasjon / FDV", ok: status.productTotal > 0, detail: status.productTotal > 0 ? `${status.productTotal} produkt${status.productTotal === 1 ? "" : "er"} dokumentert` : "Ingen produkter dokumentert" },
            { label: "Sjekklister og kontrollpunkter", ok: checklistComplete, detail: status.checklistDetail },
            { label: "Overtagelse", ok: projectHasOvertagelse(overtagelse), detail: projectHasOvertagelse(overtagelse) ? "Signert av begge parter" : "Ikke registrert" },
            { label: "Garanti", ok: warranty?.issued || !warranty?.enabled, neutral: !warranty?.enabled, detail: warranty?.issued ? `${getWarrantyYears(warranty)} år · ${warranty?.guaranteeNumber || "aktiv"}` : warranty?.enabled ? "Ikke utstedt" : "Ikke aktivert" },
          ];
          certItems.forEach((item) => {
            const tone = item.neutral ? "neutral" : item.ok ? "ok" : "followup";
            doc.setFillColor(...(tone === "ok" ? [236, 253, 245] : tone === "followup" ? [255, 251, 235] : [248, 250, 252]));
            doc.setDrawColor(...(tone === "ok" ? [74, 222, 128] : tone === "followup" ? [251, 191, 36] : [203, 213, 225]));
            doc.circle(margin + 5, y - 1.5, 3, "FD");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(6.8);
            doc.setTextColor(...(tone === "ok" ? [6, 95, 70] : tone === "followup" ? [146, 64, 14] : [71, 85, 105]));
            doc.text(tone === "ok" ? "OK" : tone === "followup" ? "!" : "i", margin + (tone === "ok" ? 2.2 : 4.1), y + .7);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8.5);
            doc.setTextColor(31, 41, 55);
            doc.text(safeText(item.label), margin + 12, y + .5);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7.4);
            doc.setTextColor(71, 85, 105);
            doc.text(safeText(item.detail), pageWidth - margin, y + .5, { align: "right" });
            y += 9;
          });
          if (qrUrl) {
            const qrImage = await loadPdfImage(qrUrl);
            const qrSize = 24;
            const qrBlockH = 36;
            if (y + qrBlockH > pageHeight - 28) y = pageHeight - 28 - qrBlockH;
            doc.setDrawColor(191, 219, 254);
            doc.setFillColor(248, 250, 252);
            doc.roundedRect(margin, y, contentWidth, qrBlockH, 3, 3, "FD");
            const qrX = pageWidth - margin - qrSize - 6;
            const qrY = y + 5;
            if (qrImage && !qrImage.error) doc.addImage(qrImage.dataUrl, qrImage.format || "PNG", qrX, qrY, qrSize, qrSize);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9.2);
            doc.setTextColor(12, 42, 82);
            doc.text("Digital sluttrapport", margin + 7, y + 12);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7.6);
            doc.setTextColor(71, 85, 105);
            doc.text(doc.splitTextToSize("Skann QR-koden for å åpne prosjektets digitale kundevisning. QR-koden vises bare i sluttdokumentasjon etter registrert overtagelse, og etter utstedt garanti når garanti er aktivert.", contentWidth - qrSize - 20), margin + 7, y + 19);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(6.8);
            doc.setTextColor(12, 42, 82);
            doc.text("Skann for digital rapport", qrX + qrSize / 2, qrY + qrSize + 4, { align: "center" });
            y += qrBlockH + 5;
          }
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8.2);
          doc.setTextColor(100, 116, 139);
          doc.text("Ta vare på rapporten sammen med boligens øvrige FDV-dokumentasjon.", pageWidth / 2, pageHeight - 20, { align: "center" });
        };
        await addFinalDocumentationCertificatePage();

        setPdfProgress("Klargjør PDF…", "Setter sidetall, bunntekst og filnavn.");
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i += 1) {
          doc.setPage(i);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7);
          doc.setTextColor(100, 116, 139);
          doc.text("Expo ProffDok rapport", pageWidth / 2, 7, { align: "center" });
          doc.text(`${i}/${pageCount}`, pageWidth - margin, pageHeight - 7, { align: "right" });
          doc.text("© 2026 Expo Proffsenter – Expo ProffDok. Alle rettigheter forbeholdt.", pageWidth / 2, pageHeight - 7, { align: "center" });
        }

        const generatedFileName = `${filenameSafe(project.projectName || project.address || project.customer || "FDV-rapport")}.pdf`;
        doc.save(generatedFileName);
        setPdfProgress("✅ Rapport klar", "PDF-en er generert og lastes ned.");
        clearPdfProgress(1400);
        if (warranty?.enabled) {
          if (isProjectLocked) {
            alert("PDF er generert fra låst/arkivert prosjekt. Prosjektets lagrede dokumentasjon og garantistatus er ikke endret.");
          } else if (warrantyIssuedForReport() && hasValue(warranty?.guaranteeNumber) && isFinalReport(reportDocumentationStatus())) {
            const reportGeneratedAt = (/* @__PURE__ */ new Date()).toISOString();
            setWarranty((prev) => ({
              ...emptyWarranty(),
              ...prev,
              reportGeneratedAt,
              reportGeneratedFileName: generatedFileName,
              guaranteeNumber: prev?.guaranteeNumber || "",
              status: "issued"
            }));
            alert("Komplett PDF med utstedt garantibevis er generert. Husk å lagre/oppdatere prosjektet slik at tidspunktet for komplett garantirapport registreres.");
          } else {
            alert("Statusrapport er generert. Garantien er ikke utstedt, derfor er garantimodulen ikke markert med komplett PDF-rapport.");
          }
        }
      } catch (error) {
        clearPdfProgress(0);
        console.error("Kunne ikke lage PDF med klikkbare lenker:", error);
        alert("Kunne ikke lage PDF med klikkbare lenker. Bruk vanlig utskrift som fallback. Feil: " + (error?.message || String(error)));
      }
    };


  return {
    printVisibleReport,
    printReport,
    downloadClickablePdfReport
  };
}
