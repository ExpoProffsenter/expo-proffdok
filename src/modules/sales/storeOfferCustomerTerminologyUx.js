// Expo ProffDok – FASE 39B.2C
// Presentasjonslag for Butikktilbud/service-tilbud. Endrer kun synlig tekst i
// kundens Butikktilbud; lagrede tilbudsdata, prisberegning og aksept er urørt.

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function isStoreCustomerView() {
  if (typeof document === "undefined") return false;
  return Boolean(
    document.querySelector(".store-customer-decision-shell") ||
      document.querySelector(".store-draft-preview-shell .sales-customer-offer-app")
  );
}

function findPricesSection() {
  return Array.from(
    document.querySelectorAll(".sales-customer-offer-stack > *")
  ).find((section) => section.querySelector(".sales-customer-main-posts")) || null;
}

function applyStoreCustomerTerminology() {
  if (!isStoreCustomerView()) return false;

  const lead = document.querySelector(".sales-customer-lead");
  if (lead) {
    const next =
      "Her finner du leveransen, prisene, eventuell montering og vilkårene samlet. Velg eventuelle alternativer eller tillegg før du svarer på tilbudet.";
    if (cleanText(lead.textContent) !== next) lead.textContent = next;
  }

  const pricesSection = findPricesSection();
  if (!pricesSection) return true;

  const heading = pricesSection.querySelector(".sales-customer-section-heading h2");
  if (heading && cleanText(heading.textContent) !== "Leveranse og priser") {
    heading.textContent = "Leveranse og priser";
  }

  const note = pricesSection.querySelector(".sales-customer-section-note");
  if (note) {
    const next =
      "Alle priser er oppgitt inkl. mva. Alternativer kan erstatte en valgt post og eventuell tilhørende montering. Valgene oppdaterer totalsummen automatisk.";
    if (cleanText(note.textContent) !== next) note.textContent = next;
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

    const optionsHelp = section.querySelector(
      ".sales-customer-main-post-options-heading > span"
    );
    if (optionsHelp) {
      const visibleTitle = cleanText(title?.textContent) || "leveransen";
      optionsHelp.textContent = `Velg eventuelle alternativer eller tillegg til ${visibleTitle}.`;
    }
  });

  pricesSection.querySelectorAll(".sales-customer-option-replacement").forEach((node) => {
    if (cleanText(node.textContent) === "Erstatter valgt vare eller montering.") {
      node.textContent = "Erstatter valgt post eller montering.";
    }
  });

  pricesSection.querySelectorAll(".sales-customer-option-price").forEach((node) => {
    const text = cleanText(node.textContent);
    if (text.startsWith("Alternativpris vare + montering:")) {
      node.firstChild.textContent = String(node.firstChild.textContent).replace(
        "Alternativpris vare + montering:",
        "Alternativpris post + montering:"
      );
    }
  });

  return true;
}

export function installStoreOfferCustomerTerminologyUx() {
  if (typeof document === "undefined") return () => {};

  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      applyStoreCustomerTerminology();
    });
  };

  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
  });
  schedule();

  return () => observer.disconnect();
}
