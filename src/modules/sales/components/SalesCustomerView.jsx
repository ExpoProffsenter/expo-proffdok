// Expo ProffDok – FASE 31A2B
// Kundetilbudet beholder eksisterende, testet Core-visning, men presentasjonen
// følger nå samme dokumentrekkefølge som PDF og tydeliggjør at opsjoner er valgfrie.
// Ingen lagring, aksept, SQL, RLS, Storage eller Edge-logikk endres.

import { useEffect } from "react";
import SalesCustomerViewCore from "./SalesCustomerViewCore.jsx";
import "./salesCustomerOptionality.css";
import { decorateRequestForQuantityPresentation } from "../utils/salesOfferQuantityPresentation.js";
import { decorateRequestForOptionalityPresentation } from "../utils/salesOfferOptionalityPresentation.js";

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
.sales-customer-renumbered-kicker {
  font-size: 0 !important;
}
.sales-customer-renumbered-kicker::after {
  content: attr(data-section-number);
  font-size: 12px;
  line-height: 1;
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

function applyCustomerSectionOrder() {
  if (typeof document === "undefined") return;
  const stack = document.querySelector(".sales-customer-offer-stack");
  if (!stack) return;

  stack.classList.add("sales-customer-ordered-stack");
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

export default function SalesCustomerView(props) {
  useEffect(() => {
    const frame = window.requestAnimationFrame(applyCustomerSectionOrder);
    const timer = window.setTimeout(applyCustomerSectionOrder, 100);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [props.mode, props.selectedRequest?.id, props.selectedRequest?.sentOfferVersionId]);

  const quantityRequest = decorateRequestForQuantityPresentation(
    props.selectedRequest
  );
  const presentationRequest = decorateRequestForOptionalityPresentation(
    quantityRequest
  );

  return (
    <>
      <style>{ORDER_STYLES}</style>
      <SalesCustomerViewCore
        {...props}
        selectedRequest={presentationRequest}
      />
    </>
  );
}
