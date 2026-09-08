// Expo ProffDok – FASE 37A2 / FASE 37D2 / FASE 37D1 / FASE 34B
// Butikktilbud bruker versjonslåst merkevare og saksbehandler og presenteres
// som et vare-/butikktilbud. FASE 37A2 lar kunden akseptere eller avvise,
// og stopper begge beslutninger når Butikktilbudets gyldighet er utløpt.
// Ordinære tilbud beholder eksisterende presentasjon og akseptflyt.

import { useEffect, useMemo, useState } from "react";
import SalesCustomerViewCore from "./SalesCustomerViewCore.jsx";
import SalesCustomerAcceptedView from "./SalesCustomerAcceptedView.jsx";
import "./salesCustomerOptionality.css";
import { decorateRequestForQuantityPresentation } from "../utils/salesOfferQuantityPresentation.js";
import { decorateRequestForOptionalityPresentation } from "../utils/salesOfferOptionalityPresentation.js";
import { getActiveOfferVersion } from "../utils/salesOfferLogic.js";
import { formatNok, getStoreOfferMeta } from "../utils/salesUtils.js";
import {
  createDefaultSalesSupabaseClient,
  declineSalesOffer,
} from "../services/salesSupabase.js";

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
.sales-customer-renumbered-kicker { font-size: 0 !important; }
.sales-customer-renumbered-kicker::after {
  content: attr(data-section-number);
  font-size: 12px;
  line-height: 1;
}
.sales-customer-options-only-mainpost .sales-customer-main-post-sum > span { font-size: 0 !important; }
.sales-customer-options-only-mainpost .sales-customer-main-post-sum > span::after {
  content: "Sum valgte opsjoner";
  font-size: 0.78rem;
  line-height: 1.25;
}
.sales-customer-options-only-mainpost.sales-customer-options-only-no-selection .sales-customer-main-post-sum > span::after { content: "Kun valgfrie opsjoner"; }
.sales-customer-options-only-mainpost.sales-customer-options-only-no-selection .sales-customer-main-post-sum > strong,
.sales-customer-options-only-mainpost.sales-customer-options-only-no-selection .sales-customer-main-post-sum > small { display: none !important; }
.sales-customer-options-only-mainpost .sales-customer-main-post-options-heading > span { font-size: 0 !important; }
.sales-customer-options-only-mainpost .sales-customer-main-post-options-heading > span::after {
  content: "Ingen grunnpris er knyttet til denne hovedposten. Velg eventuelle opsjoner under.";
  font-size: 0.92rem;
  line-height: 1.45;
}
.sales-customer-options-only-mainpost .sales-customer-option-replacement { font-size: 0 !important; }
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
.store-customer-decision-shell {
  max-width: 1180px;
  margin: -2px auto 36px;
  padding: 0 18px;
}
.store-customer-decline-card,
.store-customer-expired-card {
  border: 1px solid #d7e4ea;
  border-radius: 18px;
  background: #fff;
  padding: 20px 22px;
  box-shadow: 0 8px 24px rgba(20,55,65,.05);
}
.store-customer-decline-card h2,
.store-customer-expired-card h2 { margin: 0 0 7px; }
.store-customer-decline-card p,
.store-customer-expired-card p { margin: 0; line-height: 1.55; color: #526873; }
.store-customer-decline-fields { display: grid; gap: 12px; margin-top: 16px; }
.store-customer-decline-button {
  justify-self: start;
  border: 1px solid #c2413b;
  background: #fff;
  color: #9f2f2b;
  border-radius: 12px;
  min-height: 44px;
  padding: 10px 16px;
  font: inherit;
  font-weight: 850;
  cursor: pointer;
}
.store-customer-decline-button:disabled { opacity: .55; cursor: not-allowed; }
.store-customer-decline-check { display: flex; gap: 10px; align-items: flex-start; font-weight: 700; }
.store-customer-decline-error { color: #a83232 !important; font-weight: 800; }
.store-customer-expired-card { border-color: #e4c86b; background: #fffbea; }
`;

function classifySection(element) {
  if (!element) return "";
  if (element.matches?.(".sales-customer-intro-card")) return "intro";
  if (element.matches?.("form.sales-customer-accept-form")) return "accept";
  if (element.querySelector?.(".sales-customer-main-posts")) return "prices";
  const headings = Array.from(element.querySelectorAll?.("h2") || []).map((node) => String(node.textContent || "").trim().toLowerCase());
  if (headings.some((text) => text.includes("forutsetninger og forbehold"))) return "reservations";
  if (headings.some((text) => text.includes("dette er inkludert") || text.includes("dette er ikke inkludert") || text.includes("dette sørger kunden for"))) return "scope";
  if (headings.some((text) => text === "vilkår" || text.includes("betalingsbetingelser"))) return "terms";
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
  const rank = { intro: 10, reservations: 20, scope: 30, prices: 40, terms: 50 };
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
  try { return new URL(clean, window.location.origin).href; } catch { return clean; }
}

function applyStoreOfferCopy({ isStoreOffer, signatureName = "", brandLabel = "", brandLogoUrl = "", legalCompanyName = "" } = {}) {
  if (!isStoreOffer || typeof document === "undefined") return;
  const lead = document.querySelector(".sales-customer-lead");
  if (lead) lead.textContent = "Her finner du varene, prisene, eventuell montering og vilkårene samlet. Du kan velge eventuelle alternativer eller tillegg før du aksepterer eller avviser tilbudet nederst på siden.";
  const headerBrand = document.querySelector(".sales-customer-header .sales-brand-copy strong");
  if (headerBrand && brandLabel) headerBrand.textContent = brandLabel;
  const pricesSection = Array.from(document.querySelectorAll(".sales-customer-offer-stack > *")).find((section) => classifySection(section) === "prices");
  const heading = pricesSection?.querySelector(".sales-customer-section-heading h2");
  if (heading) heading.textContent = "Varer og priser";
  const sectionNote = pricesSection?.querySelector(".sales-customer-section-note");
  if (sectionNote) sectionNote.textContent = "Alle priser er oppgitt inkl. mva. Alternativer erstatter valgt vare og eventuell tilhørende montering. Valgene oppdaterer totalsummen automatisk.";
  const totalLabel = pricesSection?.querySelector(".sales-customer-total-card .sales-customer-total-row:first-child > span");
  if (totalLabel) totalLabel.textContent = "Sum varer og montering inkl. mva.";
  pricesSection?.querySelectorAll(".sales-customer-main-post").forEach((section) => {
    const groupTitle = String(section.querySelector("h3")?.textContent || "").trim().toLowerCase();
    const sumLabel = section.querySelector(".sales-customer-main-post-sum > span");
    if (sumLabel) sumLabel.textContent = groupTitle.includes("montering") ? "Sum montering" : groupTitle.includes("varer") ? "Sum varer" : "Sum";
    const optionsHeading = section.querySelector(".sales-customer-main-post-options-heading");
    const optionsTitle = optionsHeading?.querySelector("strong");
    const optionsHelp = optionsHeading?.querySelector("span");
    if (optionsTitle) optionsTitle.textContent = "Alternativer og tillegg";
    if (optionsHelp) optionsHelp.textContent = `Velg eventuelle alternativer eller tillegg til ${String(section.querySelector(".sales-customer-main-post-heading h3")?.textContent || "leveransen").trim()}.`;
  });
  const companyCard = document.querySelector(".sales-customer-company-card");
  const logo = companyCard?.querySelector(".sales-customer-company-logo");
  if (logo && brandLogoUrl) { logo.src = absoluteAssetUrl(brandLogoUrl); logo.alt = brandLabel || "Tilbudslogo"; }
  const companyLabel = companyCard?.querySelector(".sales-customer-company-label");
  if (companyLabel) companyLabel.textContent = "Saksbehandler";
  if (companyCard && companyLabel && signatureName) {
    let handlerName = companyCard.querySelector("[data-store-case-handler='1']");
    if (!handlerName) {
      const existingName = Array.from(companyCard.querySelectorAll(".sales-customer-company-name")).find((node) => node.previousElementSibling === companyLabel);
      handlerName = existingName || document.createElement("strong");
      handlerName.className = "sales-customer-company-name";
      handlerName.dataset.storeCaseHandler = "1";
      if (!existingName) companyLabel.insertAdjacentElement("afterend", handlerName);
    }
    handlerName.textContent = signatureName;
  }
  const details = companyCard?.querySelector(".sales-customer-company-details");
  if (details && legalCompanyName && brandLabel && legalCompanyName.trim().toLowerCase() !== brandLabel.trim().toLowerCase()) {
    let legalLine = details.querySelector("[data-store-legal-company='1']");
    if (!legalLine) { legalLine = document.createElement("span"); legalLine.dataset.storeLegalCompany = "1"; details.insertAdjacentElement("afterbegin", legalLine); }
    legalLine.textContent = `Juridisk tilbyder: ${legalCompanyName}`;
  }
}

function getOfferParts(request = {}) {
  const activeVersion = getActiveOfferVersion(request);
  return {
    lines: Array.isArray(activeVersion?.lines) ? activeVersion.lines : Array.isArray(request.offerLines) ? request.offerLines : [],
    options: Array.isArray(activeVersion?.options) ? activeVersion.options : Array.isArray(request.offerOptions) ? request.offerOptions : [],
  };
}

function applyStoreAlternativePresentation(request, selectedOptionIds = []) {
  if (typeof document === "undefined") return;
  const { options } = getOfferParts(request || {});
  const alternatives = options.filter((option) => option?.optionType === "alternative" && Number(option?.storeAlternativePricingVersion || 0) >= 2);
  if (!alternatives.length) return;
  const cards = Array.from(document.querySelectorAll(".sales-customer-option-card"));
  const usedCards = new Set();
  alternatives.forEach((option) => {
    const title = String(option?.title || "").trim();
    const card = cards.find((candidate) => !usedCards.has(candidate) && String(candidate.querySelector("h3")?.textContent || "").trim() === title);
    if (!card) return;
    usedCards.add(card);
    card.dataset.storeAlternative = "true";
    const typeNode = card.querySelector(".sales-customer-option-type");
    if (typeNode) typeNode.textContent = "Alternativ";
    const stateNode = card.querySelector(".sales-customer-option-state");
    if (stateNode && stateNode.textContent?.trim() === "Velg opsjon") stateNode.textContent = "Velg alternativ";
    const replacementNode = card.querySelector(".sales-customer-option-replacement");
    if (replacementNode) { const replaced = String(option?.replacementLineDescription || "").trim(); replacementNode.textContent = replaced ? `Erstatter ${replaced}.` : "Erstatter valgt vare eller montering."; }
    const hasInstallationOverride = String(option?.storeInstallationAlternativeTotalInclVat ?? "").trim();
    const alternativePrice = Number(hasInstallationOverride ? option?.storeAlternativePackageTotalInclVat : option?.storeAlternativeItemTotalInclVat);
    const priceNode = card.querySelector(".sales-customer-option-price");
    if (priceNode && Number.isFinite(alternativePrice)) {
      priceNode.textContent = hasInstallationOverride ? `Alternativpris vare + montering: ${formatNok(alternativePrice)} inkl. mva.` : `Alternativpris: ${formatNok(alternativePrice)} inkl. mva.`;
      const delta = Number(option?.storeAlternativeDeltaInclVat);
      if (Number.isFinite(delta) && Math.abs(delta) >= 0.01) {
        const compare = document.createElement("span");
        compare.dataset.storePriceComparison = "1";
        compare.textContent = `${formatNok(Math.abs(delta))} ${delta < 0 ? "lavere" : "høyere"} enn grunnpakken`;
        priceNode.appendChild(compare);
      }
    }
  });
  const selectedIds = new Set((Array.isArray(selectedOptionIds) ? selectedOptionIds : []).map(String));
  const hasSelectedAlternative = alternatives.some((option) => selectedIds.has(String(option?.id || "")));
  if (hasSelectedAlternative) {
    const pricesSection = Array.from(document.querySelectorAll(".sales-customer-offer-stack > *")).find((section) => classifySection(section) === "prices");
    const adjustmentLabel = pricesSection?.querySelector(".sales-customer-total-row.sales-customer-total-muted > span");
    if (adjustmentLabel) adjustmentLabel.textContent = "Valgt alternativ – justering av totalsum";
  }
}

function getOptionsOnlyGroups(request = {}) {
  if (!request) return [];
  const { lines, options } = getOfferParts(request);
  const lineMainPostIds = new Set(lines.map((line) => String(line?.mainPostId || "").trim()).filter(Boolean));
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
  const sections = Array.from(document.querySelectorAll(".sales-customer-main-post"));
  sections.forEach((section) => section.classList.remove("sales-customer-options-only-mainpost", "sales-customer-options-only-no-selection"));
  const selectedIds = new Set((Array.isArray(selectedOptionIds) ? selectedOptionIds : []).map(String));
  const usedSections = new Set();
  getOptionsOnlyGroups(request).forEach((group) => {
    const section = sections.find((candidate) => !usedSections.has(candidate) && String(candidate.querySelector("h3")?.textContent || "").trim() === group.title);
    if (!section) return;
    usedSections.add(section);
    section.classList.add("sales-customer-options-only-mainpost");
    if (!group.optionIds.some((id) => selectedIds.has(id))) section.classList.add("sales-customer-options-only-no-selection");
  });
}

function validDate(value) {
  const time = Date.parse(String(value || ""));
  return Number.isFinite(time) ? time : 0;
}

function storeOfferIsExpired(request, activeVersion, isStoreOffer) {
  if (!isStoreOffer) return false;
  const publishedAt = validDate(
    request?.offerPublishedAt || request?.sentOfferAt || activeVersion?.createdAt || activeVersion?.created_at
  );
  const validityDays = Number.parseInt(String(activeVersion?.validityDays || activeVersion?.validity_days || request?.offerValidityDays || ""), 10);
  if (!publishedAt || !Number.isFinite(validityDays) || validityDays < 1) return false;
  return Date.now() >= publishedAt + validityDays * 24 * 60 * 60 * 1000;
}

function StoreDeclinedView({ request, declinedBy }) {
  return (
    <div className="sales-app">
      <style>{ORDER_STYLES}</style>
      <div className="sales-shell">
        <main className="sales-main">
          <section className="sales-form-panel">
            <p className="sales-eyebrow">Butikktilbud avvist</p>
            <h1 className="sales-title">Svaret er registrert</h1>
            <p className="sales-subtitle">
              {declinedBy ? `Tilbudet er registrert som avvist av ${declinedBy}.` : "Tilbudet er registrert som avvist."}
            </p>
            <div className="sales-next-card" style={{ marginTop: 22 }}>
              <h2>{request?.offerTitle || "Butikktilbud"}</h2>
              <p>Det sendes ikke flere automatiske påminnelser om denne tilbudsversjonen. Ta kontakt med saksbehandler dersom du ønsker et nytt eller endret tilbud.</p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default function SalesCustomerView(props) {
  const quantityRequest = decorateRequestForQuantityPresentation(props.selectedRequest);
  const presentationRequest = decorateRequestForOptionalityPresentation(quantityRequest);
  const activeVersion = getActiveOfferVersion(presentationRequest || {});
  const storeMeta = presentationRequest?.storeOfferMeta?.__storeOfferMeta
    ? presentationRequest.storeOfferMeta
    : getStoreOfferMeta(activeVersion?.lines || presentationRequest?.offerLines || []);
  const isStoreOffer = Boolean(storeMeta?.__storeOfferMeta);
  const signatureName = String(storeMeta?.signatureName || "").trim();
  const brandLabel = String(storeMeta?.brandLabel || "").trim();
  const brandLogoUrl = String(storeMeta?.brandLogoUrl || "").trim();
  const legalCompanyName = String(presentationRequest?.companyName || "").trim();
  const brandedRequest = presentationRequest && brandLogoUrl
    ? { ...presentationRequest, companyLogoUrl: brandLogoUrl, companyName: brandLabel || presentationRequest.companyName || "", storeOfferMeta: storeMeta }
    : presentationRequest;
  const selectedOptionIds = props.acceptanceForm?.selectedOptionIds || [];
  const [declineName, setDeclineName] = useState("");
  const [declineConfirmed, setDeclineConfirmed] = useState(false);
  const [declineBusy, setDeclineBusy] = useState(false);
  const [declineError, setDeclineError] = useState("");
  const [localDecline, setLocalDecline] = useState(null);
  const salesClient = useMemo(() => createDefaultSalesSupabaseClient(), []);
  const expired = storeOfferIsExpired(brandedRequest, activeVersion, isStoreOffer);
  const declined = Boolean(localDecline || brandedRequest?.status === "Avvist" || brandedRequest?.declinedAt);
  const declinedBy = String(localDecline?.declined_by || brandedRequest?.declinedBy || "").trim();

  useEffect(() => {
    const applyPresentation = () => {
      applyCustomerSectionOrder(signatureName);
      applyCustomerOptionsOnlyPresentation(brandedRequest, selectedOptionIds);
      applyStoreOfferCopy({ isStoreOffer, signatureName, brandLabel, brandLogoUrl, legalCompanyName });
      if (isStoreOffer) applyStoreAlternativePresentation(brandedRequest, selectedOptionIds);
    };
    const frame = window.requestAnimationFrame(applyPresentation);
    const timer = window.setTimeout(applyPresentation, 120);
    return () => { window.cancelAnimationFrame(frame); window.clearTimeout(timer); };
  }, [props.mode, props.selectedRequest?.id, props.selectedRequest?.sentOfferVersionId, props.selectedRequest?.offerLines, props.selectedRequest?.offerOptions, props.selectedRequest?.storeOfferMeta, signatureName, brandLabel, brandLogoUrl, legalCompanyName, isStoreOffer, selectedOptionIds.join("|")]);

  async function handleDecline(event) {
    event.preventDefault();
    if (!isStoreOffer || expired || declineBusy) return;
    if (!declineConfirmed || !declineName.trim()) return;
    if (!salesClient || !brandedRequest?.publicToken) {
      setDeclineError("Tilbudet kunne ikke identifiseres. Last inn siden på nytt.");
      return;
    }
    setDeclineBusy(true);
    setDeclineError("");
    try {
      const { data, error } = await declineSalesOffer(salesClient, {
        token: brandedRequest.publicToken,
        declinedName: declineName.trim(),
      });
      if (error) throw error;
      setLocalDecline(data || { declined_by: declineName.trim() });
    } catch (error) {
      setDeclineError(error?.message || "Svaret kunne ikke registreres. Prøv på nytt.");
    } finally {
      setDeclineBusy(false);
    }
  }

  if (props.mode === "customer-accepted" && brandedRequest) {
    return <SalesCustomerAcceptedView selectedRequest={brandedRequest} companyProfile={props.companyProfile} />;
  }

  if (isStoreOffer && declined && brandedRequest) {
    return <StoreDeclinedView request={brandedRequest} declinedBy={declinedBy} />;
  }

  const acceptHandler = expired
    ? (event) => {
        event?.preventDefault?.();
        alert("Butikktilbudet er utløpt. Ta kontakt med saksbehandler for et nytt tilbud.");
      }
    : props.handleAcceptOffer;

  return (
    <>
      <style>{ORDER_STYLES}{isStoreOffer && expired ? ".sales-customer-accept-form{display:none!important}" : ""}</style>
      <SalesCustomerViewCore {...props} selectedRequest={brandedRequest} handleAcceptOffer={acceptHandler} />
      {isStoreOffer && props.mode === "customer-offer" ? (
        <div className="store-customer-decision-shell">
          {expired ? (
            <section className="store-customer-expired-card">
              <h2>Tilbudet er utløpt</h2>
              <p>Gyldighetsperioden er passert. Tilbudet kan derfor ikke lenger aksepteres eller avvises digitalt. Ta kontakt med saksbehandler dersom du ønsker et nytt eller oppdatert tilbud.</p>
            </section>
          ) : (
            <form className="store-customer-decline-card" onSubmit={handleDecline}>
              <h2>Ønsker du ikke tilbudet?</h2>
              <p>Du kan avvise Butikktilbudet her. Når svaret er registrert, avsluttes denne tilbudsversjonen og automatiske påminnelser stopper.</p>
              <div className="store-customer-decline-fields">
                <label className="sales-field">
                  <span>Fullt navn</span>
                  <input value={declineName} onChange={(event) => setDeclineName(event.target.value)} placeholder="Fullt navn" required />
                </label>
                <label className="store-customer-decline-check">
                  <input type="checkbox" checked={declineConfirmed} onChange={(event) => setDeclineConfirmed(event.target.checked)} required />
                  <span>Jeg avviser dette Butikktilbudet.</span>
                </label>
                {declineError ? <p className="store-customer-decline-error">{declineError}</p> : null}
                <button className="store-customer-decline-button" type="submit" disabled={declineBusy || !declineName.trim() || !declineConfirmed}>
                  {declineBusy ? "Registrerer …" : "Avvis tilbud"}
                </button>
              </div>
            </form>
          )}
        </div>
      ) : null}
    </>
  );
}
