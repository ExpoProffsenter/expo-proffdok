// Expo ProffDok – FASE 37D2 / FASE 37D1 / FASE 34B
// Butikktilbud bruker versjonslåst merkevare og saksbehandler og presenteres
// som et vare-/butikktilbud. Ordinære tilbud beholder eksisterende presentasjon.

import { useEffect } from "react";
import SalesCustomerViewCore from "./SalesCustomerViewCore.jsx";
import SalesCustomerAcceptedView from "./SalesCustomerAcceptedView.jsx";
import "./salesCustomerOptionality.css";
import { decorateRequestForQuantityPresentation } from "../utils/salesOfferQuantityPresentation.js";
import { decorateRequestForOptionalityPresentation } from "../utils/salesOfferOptionalityPresentation.js";
import { getActiveOfferVersion } from "../utils/salesOfferLogic.js";
import { formatNok, getStoreOfferMeta } from "../utils/salesUtils.js";

const ORDER_STYLES = `
.sales-customer-ordered-stack {
  display: flex !important;
  flex-direction: column;
  gap: 18px;
}
.sales-customer-order-intro { order: 10; }
.sales-customer-order-reservations { order: 20; }
.sales-customer-order-scope { order: 30; }
.sales-customer-order-prices { order: 40; }
.sales-customer-order-terms { order: 50; }
.sales-customer-order-accept { order: 60; }
.sales-customer-ordered-stack[data-store-signature]::before {
  content: "Med vennlig hilsen\A" attr(data-store-signature);
  white-space: pre-line;
  order: 55;
  display: block;
  padding: 20px 22px;
  border: 1px solid #d7e4ea;
  border-left: 4px solid #16aeb9;
  border-radius: 16px;
  background: #ffffff;
  color: #223842;
  font-size: 1rem;
  line-height: 1.65;
  font-weight: 650;
}
.sales-customer-renumbered-kicker {
  font-size: 0 !important;
}
.sales-customer-renumbered-kicker::after {
  content: attr(data-section-number);
  font-size: 12px;
  line-height: 1;
}
.sales-customer-options-only-mainpost .sales-customer-main-post-sum > span {
  font-size: 0 !important;
}
.sales-customer-options-only-mainpost .sales-customer-main-post-sum > span::after {
  content: "Sum valgte opsjoner";
  font-size: 0.78rem;
  line-height: 1.25;
}
.sales-customer-options-only-mainpost.sales-customer-options-only-no-selection
  .sales-customer-main-post-sum > span::after {
  content: "Kun valgfrie opsjoner";
}
.sales-customer-options-only-mainpost.sales-customer-options-only-no-selection
  .sales-customer-main-post-sum > strong,
.sales-customer-options-only-mainpost.sales-customer-options-only-no-selection
  .sales-customer-main-post-sum > small {
  display: none !important;
}
.sales-customer-options-only-mainpost
  .sales-customer-main-post-options-heading > span {
  font-size: 0 !important;
}
.sales-customer-options-only-mainpost
  .sales-customer-main-post-options-heading > span::after {
  content: "Ingen grunnpris er knyttet til denne hovedposten. Velg eventuelle opsjoner under.";
  font-size: 0.92rem;
  line-height: 1.45;
}
.sales-customer-options-only-mainpost .sales-customer-option-replacement {
  font-size: 0 !important;
}
.sales-customer-options-only-mainpost .sales-customer-option-replacement::after {
  content: "Prisen inngår kun dersom opsjonen velges.";
  font-size: 0.9rem;
  line-height: 1.45;
}
.sales-customer-option-card[data-store-alternative="true"] .sales-customer-option-type {
  color: #0b7f87;
  font-weight: 900;
}
.sales-customer-option-card[data-store-alternative="true"] [data-store-price-comparison="1"] {
  display: block;
  margin-top: 5px;
  color: #64748b;
  font-size: 0.82rem;
  font-weight: 700;
}
`;

function classifySection(element) {
  if (!element) return "";
  if (element.matches?.(".sales-customer-intro-card")) return "intro";
  if (element.matches?.("form.sales-customer-accept-form")) return "accept";
  if (element.querySelector?.(".sales-customer-main-posts")) return "prices";

  const headings = Array.from(element.querySelectorAll?.("h2") || []).map((node) =>
    String(node.textContent || "").trim().toLowerCase()
  );

  if (headings.some((text) => text.includes("forutsetninger og forbehold"))) {
    return "reservations";
  }
  if (
    headings.some(
      (text) =>
        text.includes("dette er inkludert") ||
        text.includes("dette er ikke inkludert") ||
        text.includes("dette sørger kunden for")
    )
  ) {
    return "scope";
  }
  if (
    headings.some(
      (text) => text === "vilkår" || text.includes("betalingsbetingelser")
    )
  ) {
    return "terms";
  }
  return "";
}

function applyCustomerSectionOrder(signatureName = "") {
  if (typeof document === "undefined") return;
  const stack = document.querySelector(".sales-customer-offer-stack");
  if (!stack) return;

  stack.classList.add("sales-customer-ordered-stack");
  if (signatureName) stack.dataset.storeSignature = signatureName;
  else delete stack.dataset.storeSignature;

  const sections = Array.from(stack.children);
  const orderedContent = [];

  sections.forEach((section) => {
    const kind = classifySection(section);
    if (!kind) return;
    section.classList.add(`sales-customer-order-${kind}`);
    if (kind !== "accept") orderedContent.push({ section, kind });
  });

  const rank = {
    intro: 10,
    reservations: 20,
    scope: 30,
    prices: 40,
    terms: 50,
  };

  orderedContent
    .sort((a, b) => (rank[a.kind] || 999) - (rank[b.kind] || 999))
    .forEach(({ section }, index) => {
      const kicker = section.querySelector(".sales-section-kicker");
      if (!kicker) return;
      kicker.classList.add("sales-customer-renumbered-kicker");
      kicker.dataset.sectionNumber = String(index + 1).padStart(2, "0");
    });
}

function absoluteAssetUrl(value = "") {
  const clean = String(value || "").trim();
  if (!clean || typeof window === "undefined") return clean;
  try {
    return new URL(clean, window.location.origin).href;
  } catch {
    return clean;
  }
}

function applyStoreOfferCopy({
  isStoreOffer,
  signatureName = "",
  brandLabel = "",
  brandLogoUrl = "",
  legalCompanyName = "",
} = {}) {
  if (!isStoreOffer || typeof document === "undefined") return;

  const lead = document.querySelector(".sales-customer-lead");
  if (lead) {
    lead.textContent =
      "Her finner du varene, prisene, eventuell montering og vilkårene samlet. Du kan velge eventuelle alternativer eller tillegg før du aksepterer tilbudet nederst på siden.";
  }

  const headerBrand = document.querySelector(
    ".sales-customer-header .sales-brand-copy strong"
  );
  if (headerBrand && brandLabel) headerBrand.textContent = brandLabel;

  const pricesSection = Array.from(
    document.querySelectorAll(".sales-customer-offer-stack > *")
  ).find((section) => classifySection(section) === "prices");

  const heading = pricesSection?.querySelector(".sales-customer-section-heading h2");
  if (heading) heading.textContent = "Varer og priser";

  const sectionNote = pricesSection?.querySelector(".sales-customer-section-note");
  if (sectionNote) {
    sectionNote.textContent =
      "Alle priser er oppgitt inkl. mva. Alternativer erstatter valgt vare og eventuell tilhørende montering. Valgene oppdaterer totalsummen automatisk.";
  }

  const totalLabel = pricesSection?.querySelector(
    ".sales-customer-total-card .sales-customer-total-row:first-child > span"
  );
  if (totalLabel) totalLabel.textContent = "Sum varer og montering inkl. mva.";

  pricesSection?.querySelectorAll(".sales-customer-main-post").forEach((section) => {
    const groupTitle = String(section.querySelector("h3")?.textContent || "").trim().toLowerCase();
    const sumLabel = section.querySelector(".sales-customer-main-post-sum > span");
    if (sumLabel) {
      sumLabel.textContent = groupTitle.includes("montering")
        ? "Sum montering"
        : groupTitle.includes("varer")
          ? "Sum varer"
          : "Sum";
    }

    const optionsHeading = section.querySelector(
      ".sales-customer-main-post-options-heading"
    );
    const optionsTitle = optionsHeading?.querySelector("strong");
    const optionsHelp = optionsHeading?.querySelector("span");
    if (optionsTitle) optionsTitle.textContent = "Alternativer og tillegg";
    if (optionsHelp) {
      optionsHelp.textContent = `Velg eventuelle alternativer eller tillegg til ${
        String(section.querySelector(".sales-customer-main-post-heading h3")?.textContent || "leveransen").trim()
      }.`;
    }
  });

  const companyCard = document.querySelector(".sales-customer-company-card");
  const logo = companyCard?.querySelector(".sales-customer-company-logo");
  if (logo && brandLogoUrl) {
    logo.src = absoluteAssetUrl(brandLogoUrl);
    logo.alt = brandLabel || "Tilbudslogo";
  }

  const companyLabel = companyCard?.querySelector(".sales-customer-company-label");
  if (companyLabel) companyLabel.textContent = "Saksbehandler";

  if (companyCard && companyLabel && signatureName) {
    let handlerName = companyCard.querySelector("[data-store-case-handler='1']");
    if (!handlerName) {
      const existingName = Array.from(
        companyCard.querySelectorAll(".sales-customer-company-name")
      ).find((node) => node.previousElementSibling === companyLabel);
      handlerName = existingName || document.createElement("strong");
      handlerName.className = "sales-customer-company-name";
      handlerName.dataset.storeCaseHandler = "1";
      if (!existingName) companyLabel.insertAdjacentElement("afterend", handlerName);
    }
    handlerName.textContent = signatureName;
  }

  const details = companyCard?.querySelector(".sales-customer-company-details");
  if (
    details &&
    legalCompanyName &&
    brandLabel &&
    legalCompanyName.trim().toLowerCase() !== brandLabel.trim().toLowerCase()
  ) {
    let legalLine = details.querySelector("[data-store-legal-company='1']");
    if (!legalLine) {
      legalLine = document.createElement("span");
      legalLine.dataset.storeLegalCompany = "1";
      details.insertAdjacentElement("afterbegin", legalLine);
    }
    legalLine.textContent = `Juridisk tilbyder: ${legalCompanyName}`;
  }
}

function getOfferParts(request = {}) {
  const activeVersion = getActiveOfferVersion(request);
  return {
    lines: Array.isArray(activeVersion?.lines)
      ? activeVersion.lines
      : Array.isArray(request.offerLines)
        ? request.offerLines
        : [],
    options: Array.isArray(activeVersion?.options)
      ? activeVersion.options
      : Array.isArray(request.offerOptions)
        ? request.offerOptions
        : [],
  };
}

function applyStoreAlternativePresentation(request, selectedOptionIds = []) {
  if (typeof document === "undefined") return;

  const { options } = getOfferParts(request || {});
  const alternatives = options.filter(
    (option) =>
      option?.optionType === "alternative" &&
      Number(option?.storeAlternativePricingVersion || 0) >= 2
  );
  if (!alternatives.length) return;

  const cards = Array.from(document.querySelectorAll(".sales-customer-option-card"));
  const usedCards = new Set();

  alternatives.forEach((option) => {
    const title = String(option?.title || "").trim();
    const card = cards.find((candidate) => {
      if (usedCards.has(candidate)) return false;
      return String(candidate.querySelector("h3")?.textContent || "").trim() === title;
    });
    if (!card) return;
    usedCards.add(card);
    card.dataset.storeAlternative = "true";

    const typeNode = card.querySelector(".sales-customer-option-type");
    if (typeNode) typeNode.textContent = "Alternativ";

    const stateNode = card.querySelector(".sales-customer-option-state");
    if (stateNode && stateNode.textContent?.trim() === "Velg opsjon") {
      stateNode.textContent = "Velg alternativ";
    }

    const replacementNode = card.querySelector(".sales-customer-option-replacement");
    if (replacementNode) {
      const replaced = String(option?.replacementLineDescription || "").trim();
      replacementNode.textContent = replaced
        ? `Erstatter ${replaced}.`
        : "Erstatter valgt vare eller montering.";
    }

    const hasInstallationOverride = String(
      option?.storeInstallationAlternativeTotalInclVat ?? ""
    ).trim();
    const alternativePrice = Number(
      hasInstallationOverride
        ? option?.storeAlternativePackageTotalInclVat
        : option?.storeAlternativeItemTotalInclVat
    );
    const priceNode = card.querySelector(".sales-customer-option-price");
    if (priceNode && Number.isFinite(alternativePrice)) {
      priceNode.textContent = hasInstallationOverride
        ? `Alternativpris vare + montering: ${formatNok(alternativePrice)} inkl. mva.`
        : `Alternativpris: ${formatNok(alternativePrice)} inkl. mva.`;

      const delta = Number(option?.storeAlternativeDeltaInclVat);
      if (Number.isFinite(delta) && Math.abs(delta) >= 0.01) {
        const compare = document.createElement("span");
        compare.dataset.storePriceComparison = "1";
        compare.textContent = `${formatNok(Math.abs(delta))} ${
          delta < 0 ? "lavere" : "høyere"
        } enn grunnpakken`;
        priceNode.appendChild(compare);
      }
    }
  });

  const selectedIds = new Set(
    (Array.isArray(selectedOptionIds) ? selectedOptionIds : []).map(String)
  );
  const hasSelectedAlternative = alternatives.some((option) =>
    selectedIds.has(String(option?.id || ""))
  );
  if (hasSelectedAlternative) {
    const pricesSection = Array.from(
      document.querySelectorAll(".sales-customer-offer-stack > *")
    ).find((section) => classifySection(section) === "prices");
    const adjustmentLabel = pricesSection?.querySelector(
      ".sales-customer-total-row.sales-customer-total-muted > span"
    );
    if (adjustmentLabel) {
      adjustmentLabel.textContent = "Valgt alternativ – justering av totalsum";
    }
  }
}

function getOptionsOnlyGroups(request = {}) {
  if (!request) return [];

  const { lines, options } = getOfferParts(request);
  const lineMainPostIds = new Set(
    lines.map((line) => String(line?.mainPostId || "").trim()).filter(Boolean)
  );
  const groups = new Map();

  options.forEach((option) => {
    const id = String(option?.mainPostId || "").trim();
    const title = String(option?.mainPostTitle || "").trim();
    if (!id || !title || lineMainPostIds.has(id)) return;
    if (!groups.has(id)) groups.set(id, { id, title, optionIds: [] });
    groups.get(id).optionIds.push(String(option?.id || ""));
  });

  return Array.from(groups.values());
}

function applyCustomerOptionsOnlyPresentation(request, selectedOptionIds = []) {
  if (typeof document === "undefined") return;

  const sections = Array.from(
    document.querySelectorAll(".sales-customer-main-post")
  );
  sections.forEach((section) => {
    section.classList.remove(
      "sales-customer-options-only-mainpost",
      "sales-customer-options-only-no-selection"
    );
  });

  const selectedIds = new Set(
    (Array.isArray(selectedOptionIds) ? selectedOptionIds : []).map(String)
  );
  const usedSections = new Set();

  getOptionsOnlyGroups(request).forEach((group) => {
    const section = sections.find((candidate) => {
      if (usedSections.has(candidate)) return false;
      return (
        String(candidate.querySelector("h3")?.textContent || "").trim() ===
        group.title
      );
    });
    if (!section) return;

    usedSections.add(section);
    section.classList.add("sales-customer-options-only-mainpost");

    const hasSelectedOption = group.optionIds.some((id) => selectedIds.has(id));
    if (!hasSelectedOption) {
      section.classList.add("sales-customer-options-only-no-selection");
    }
  });
}

export default function SalesCustomerView(props) {
  const quantityRequest = decorateRequestForQuantityPresentation(
    props.selectedRequest
  );
  const presentationRequest = decorateRequestForOptionalityPresentation(
    quantityRequest
  );
  const activeVersion = getActiveOfferVersion(presentationRequest || {});
  const storeMeta = presentationRequest?.storeOfferMeta?.__storeOfferMeta
    ? presentationRequest.storeOfferMeta
    : getStoreOfferMeta(
        activeVersion?.lines || presentationRequest?.offerLines || []
      );
  const isStoreOffer = Boolean(storeMeta?.__storeOfferMeta);
  const signatureName = String(storeMeta?.signatureName || "").trim();
  const brandLabel = String(storeMeta?.brandLabel || "").trim();
  const brandLogoUrl = String(storeMeta?.brandLogoUrl || "").trim();
  const legalCompanyName = String(presentationRequest?.companyName || "").trim();
  const brandedRequest = presentationRequest && brandLogoUrl
    ? {
        ...presentationRequest,
        companyLogoUrl: brandLogoUrl,
        companyName: brandLabel || presentationRequest.companyName || "",
        storeOfferMeta: storeMeta,
      }
    : presentationRequest;
  const selectedOptionIds = props.acceptanceForm?.selectedOptionIds || [];

  useEffect(() => {
    const applyPresentation = () => {
      applyCustomerSectionOrder(signatureName);
      applyCustomerOptionsOnlyPresentation(
        brandedRequest,
        selectedOptionIds
      );
      applyStoreOfferCopy({
        isStoreOffer,
        signatureName,
        brandLabel,
        brandLogoUrl,
        legalCompanyName,
      });
      if (isStoreOffer) {
        applyStoreAlternativePresentation(brandedRequest, selectedOptionIds);
      }
    };

    const frame = window.requestAnimationFrame(applyPresentation);
    const timer = window.setTimeout(applyPresentation, 120);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [
    props.mode,
    props.selectedRequest?.id,
    props.selectedRequest?.sentOfferVersionId,
    props.selectedRequest?.offerLines,
    props.selectedRequest?.offerOptions,
    props.selectedRequest?.storeOfferMeta,
    signatureName,
    brandLabel,
    brandLogoUrl,
    legalCompanyName,
    isStoreOffer,
    selectedOptionIds.join("|"),
  ]);

  if (props.mode === "customer-accepted" && brandedRequest) {
    return (
      <SalesCustomerAcceptedView
        selectedRequest={brandedRequest}
        companyProfile={props.companyProfile}
      />
    );
  }

  return (
    <>
      <style>{ORDER_STYLES}</style>
      <SalesCustomerViewCore
        {...props}
        selectedRequest={brandedRequest}
      />
    </>
  );
}
