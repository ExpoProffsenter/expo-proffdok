// Expo ProffDok – FASE 39B.2C
// Sikker presentasjonsadapter for Butikktilbud/service-tilbud.
// Ingen kontinuerlig MutationObserver: presentasjonen oppdateres bare ved
// åpning/navigasjon og etter brukerklikk. Lagrede data, prisberegning og aksept
// er urørt.

const STYLE_ID = "expo-store-safe-presentation-style";
const SECTION_PREFIX = "Nytt avsnitt";

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function sectionTitleFromText(value) {
  const text = cleanText(value);
  if (!text.toLowerCase().startsWith(SECTION_PREFIX.toLowerCase())) return "";
  return cleanText(text.slice(SECTION_PREFIX.length)) || "Avsnitt";
}

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    /* Intern redigering: avsnitt skal oppfattes som tydelige leveranseområder. */
    .store-grouped-builder .store-room {
      border: 2px solid #b9dde2 !important;
      border-radius: 18px !important;
      background: #f8fcfd !important;
      box-shadow: 0 8px 24px rgba(15, 127, 135, .05) !important;
    }
    .store-grouped-builder .store-room.is-active {
      border-color: #16aeb9 !important;
      box-shadow: 0 0 0 4px rgba(22,174,185,.09), 0 10px 26px rgba(15,127,135,.08) !important;
    }
    .store-grouped-builder .store-room-head {
      padding: 16px 18px !important;
      background: linear-gradient(135deg,#e9f8fa 0%,#f7fcfd 100%) !important;
      border-bottom: 1px solid #d5e9ed !important;
    }
    .store-grouped-builder .store-room-title input {
      font-size: 20px !important;
      font-weight: 900 !important;
      color: #10212b !important;
    }
    .store-grouped-builder .store-room-title > strong {
      font-size: 18px !important;
      color: #10212b !important;
    }

    /* Intern tilbudsvisning: avsnitt er skilleoverskrifter, aldri prislinjer. */
    .expo-store-internal-section-row {
      display: block !important;
      margin: 10px 0 4px !important;
      padding: 14px 16px !important;
      border: 1px solid #c9e8ec !important;
      border-left: 5px solid #16aeb9 !important;
      border-radius: 12px !important;
      background: linear-gradient(135deg,#edf9fb 0%,#ffffff 100%) !important;
    }
    .expo-store-internal-section-row > :first-child,
    .expo-store-internal-section-row > :last-child {
      display: none !important;
    }
    .expo-store-internal-section-row > :nth-child(2) {
      display: block !important;
      color: #10212b !important;
      font-size: 18px !important;
      font-weight: 900 !important;
      line-height: 1.35 !important;
    }

    /* Kundevisning/preview: samme tydelige avsnitt, uten nummer/pris. */
    .sales-customer-line-card.expo-store-customer-section-row {
      display: block !important;
      margin: 14px 0 6px !important;
      padding: 18px 20px !important;
      border: 1px solid #c9e8ec !important;
      border-left: 5px solid #16aeb9 !important;
      border-radius: 14px !important;
      background: linear-gradient(135deg,#edf9fb 0%,#ffffff 100%) !important;
      box-shadow: 0 6px 18px rgba(17,94,103,.05) !important;
    }
    .expo-store-customer-section-row .sales-customer-line-number,
    .expo-store-customer-section-row .sales-customer-line-price,
    .expo-store-customer-section-row .sales-customer-line-media {
      display: none !important;
    }
    .expo-store-customer-section-row .sales-customer-line-body h3 {
      margin: 0 !important;
      color: #10212b !important;
      font-size: 1.18rem !important;
      font-weight: 900 !important;
      line-height: 1.4 !important;
    }
  `;
  document.head.appendChild(style);
}

function isStoreCustomerView() {
  return Boolean(
    document.querySelector(".store-customer-decision-shell") ||
      document.querySelector(".store-draft-preview-shell .sales-customer-offer-app")
  );
}

function findPricesSection() {
  return (
    Array.from(document.querySelectorAll(".sales-customer-offer-stack > *")).find(
      (section) => section.querySelector(".sales-customer-main-posts")
    ) || null
  );
}

function decorateCustomerSections(pricesSection) {
  pricesSection
    ?.querySelectorAll(".sales-customer-line-card")
    .forEach((card) => {
      const title = card.querySelector(".sales-customer-line-body h3");
      const marker = card.querySelector(
        '.sales-customer-line-media a[href="#expo-store-text-block"], .sales-customer-line-media a[href$="#expo-store-text-block"]'
      );
      const derivedTitle = sectionTitleFromText(title?.textContent);
      if (!marker && !derivedTitle) return;

      card.classList.add("expo-store-customer-section-row");
      if (title && derivedTitle) title.textContent = derivedTitle;
    });
}

function applyStoreCustomerTerminology() {
  if (!isStoreCustomerView()) return false;

  const lead = document.querySelector(".sales-customer-lead");
  if (lead) {
    lead.textContent =
      "Her finner du leveransen, prisene, eventuell montering og vilkårene samlet. Velg eventuelle alternativer eller tillegg før du svarer på tilbudet.";
  }

  const pricesSection = findPricesSection();
  if (!pricesSection) return true;

  const heading = pricesSection.querySelector(".sales-customer-section-heading h2");
  if (heading) heading.textContent = "Leveranse og priser";

  const note = pricesSection.querySelector(".sales-customer-section-note");
  if (note) {
    note.textContent =
      "Alle priser er oppgitt inkl. mva. Alternativer kan erstatte en valgt post og eventuell tilhørende montering. Valgene oppdaterer totalsummen automatisk.";
  }

  const totalLabel = pricesSection.querySelector(
    ".sales-customer-total-card .sales-customer-total-row:first-child > span"
  );
  if (totalLabel) totalLabel.textContent = "Sum leveranse og montering inkl. mva.";

  pricesSection.querySelectorAll(".sales-customer-main-post").forEach((section) => {
    const title = section.querySelector(".sales-customer-main-post-heading h3");
    const originalTitle = cleanText(title?.textContent).toLowerCase();
    const isDeliveryGroup = originalTitle === "varer" || originalTitle === "leveranse";
    const isInstallationGroup = originalTitle.includes("montering");

    if (title && originalTitle === "varer") title.textContent = "Leveranse";

    const sumLabel = section.querySelector(".sales-customer-main-post-sum > span");
    if (sumLabel) {
      sumLabel.textContent = isInstallationGroup
        ? "Sum montering"
        : isDeliveryGroup
          ? "Sum leveranse"
          : "Sum";
    }

    const optionsTitle = section.querySelector(
      ".sales-customer-main-post-options-heading > strong"
    );
    if (optionsTitle) optionsTitle.textContent = "Alternativer og tillegg";
  });

  pricesSection.querySelectorAll(".sales-customer-option-replacement").forEach((node) => {
    if (cleanText(node.textContent) === "Erstatter valgt vare eller montering.") {
      node.textContent = "Erstatter valgt post eller montering.";
    }
  });

  pricesSection.querySelectorAll(".sales-customer-option-price").forEach((node) => {
    const text = cleanText(node.textContent);
    if (text.startsWith("Alternativpris vare + montering:")) {
      if (node.firstChild) {
        node.firstChild.textContent = String(node.firstChild.textContent).replace(
          "Alternativpris vare + montering:",
          "Alternativpris post + montering:"
        );
      }
    }
  });

  decorateCustomerSections(pricesSection);
  return true;
}

function applyInternalSectionPresentation() {
  const list = document.querySelector(".sales-offer-detail-lines-list");
  if (!list) return false;

  let foundSection = false;
  list.querySelectorAll(":scope > section").forEach((group) => {
    const directBlocks = Array.from(group.children).filter(
      (child) => child instanceof HTMLElement
    );
    const lineList = directBlocks[1];
    if (!(lineList instanceof HTMLElement)) return;

    Array.from(lineList.children).forEach((row) => {
      if (!(row instanceof HTMLElement) || row.children.length < 3) return;
      const description = row.children[1];
      const title = sectionTitleFromText(description?.textContent);
      if (!title) return;

      foundSection = true;
      row.classList.add("expo-store-internal-section-row");
      description.textContent = title;
    });

    if (foundSection) {
      const groupTitle = group.querySelector(":scope > div:first-child strong");
      if (cleanText(groupTitle?.textContent) === "Varer") {
        groupTitle.textContent = "Leveranse";
      }
      const sumLabel = group.querySelector(":scope > div:first-child > div:last-child > span");
      if (cleanText(sumLabel?.textContent) === "Sum hovedpost") {
        sumLabel.textContent = "Sum leveranse";
      }
    }
  });

  return foundSection;
}

function applyPresentation() {
  ensureStyles();
  applyStoreCustomerTerminology();
  applyInternalSectionPresentation();
}

export function installStoreOfferCustomerTerminologyUx() {
  if (typeof document === "undefined") return () => {};

  let timeouts = [];
  const schedule = () => {
    timeouts.forEach((id) => window.clearTimeout(id));
    timeouts = [0, 80, 260].map((delay) =>
      window.setTimeout(applyPresentation, delay)
    );
  };

  const handleClick = () => schedule();
  const handleNavigation = () => schedule();

  document.addEventListener("click", handleClick, true);
  window.addEventListener("popstate", handleNavigation);
  window.addEventListener("hashchange", handleNavigation);

  schedule();
  const initialLate = window.setTimeout(applyPresentation, 900);

  return () => {
    document.removeEventListener("click", handleClick, true);
    window.removeEventListener("popstate", handleNavigation);
    window.removeEventListener("hashchange", handleNavigation);
    timeouts.forEach((id) => window.clearTimeout(id));
    window.clearTimeout(initialLate);
  };
}
