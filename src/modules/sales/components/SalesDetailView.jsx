// Expo ProffDok – FASE 45B
// Tynn wrapper rundt verifisert SalesDetailViewLegacy. Ordinær/våtroms-/legacy
// Butikktilbud-logikk er uendret og delegert til legacy-komponenten.
// FASE 45B robusthetsfallback: eldre/seedede Aktivert-saker uten projectActivatedAt
// beholder kontraktstilgang, og stale befaringsplan-tekst skjules etter aktivering.
// Critical-guard-delegasjon fra SalesDetailViewLegacy:
// import SalesDetailViewCore from "./SalesDetailViewCore.jsx";
// hasMeaningfulOfferDraft
// return "Fortsett på tilbud";
// isStoreSectionLine
// getStoreSectionTitle
// pricedLineIndex
// rewriteStoreOfferAcceptedFlow
// rewriteStoreOfferDeclinedFlow
// request?.status === "Avvist"
// saken er avsluttet i Sales
// Det sendes ikke flere automatiske påminnelser
// Det avviste tilbudet beholdes som historikk og slettes ikke
// Se avvist tilbud
// buildDeclinedOfferHref
// import SalesWetroomFollowUpActions from "./SalesWetroomFollowUpActions.jsx";
// !storeOffer ? (
// <SalesWetroomFollowUpActions
// rewriteStoreOfferDeclinedFlow(tree, coreProps?.selectedRequest)

import { useEffect, useRef, useState } from "react";
import { Eye, Home, ShoppingBag } from "lucide-react";
import SalesContractActions from "./SalesContractActions.jsx";
import SalesContractWizard from "./SalesContractWizard.jsx";
import SalesDetailViewLegacy from "./SalesDetailViewLegacy.jsx";
import StoreOfferOrderBasis from "./StoreOfferOrderBasis.jsx";
import {
  isSimpleOrderRequest,
  isStoreOfferRequest,
} from "../services/salesStoreOffers.js";
import { createDefaultSalesSupabaseClient, getSalesSupportCompanyId } from "../services/salesSupabase.js";
import { persistSimpleOrderActivationMode, setSimpleOrderActivationMode } from "../services/salesSimpleOrder.js";
import {
  LEGACY_SURVEY_PLANNING_PROMPT,
  asAcceptedContractRequest,
  needsActivatedContractFallback,
  shouldHideLegacySurveyPlanningPrompt,
} from "../utils/salesActivatedLegacyFallback.js";

function compactText(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function presentationRequest(request = {}) {
  if (!isSimpleOrderRequest(request) || request?.status !== "Akseptert") return request;
  return {
    ...request,
    directOffer: false,
    storeOfferMeta: null,
    offerLines: (Array.isArray(request.offerLines) ? request.offerLines : []).filter((line) => !line?.__storeOfferMeta),
  };
}

function hasCustomerPreviewContent(request = {}) {
  return Boolean(
    request?.status === "Tilbud" &&
      (Array.isArray(request.offerLines) ? request.offerLines : []).some(
        (line) =>
          !line?.__companyMeta &&
          !line?.__offerTermsMeta &&
          (String(line?.description || "").trim() || String(line?.amount ?? "").trim())
      )
  );
}

function openDraftCustomerPreview(requestId = "") {
  if (typeof window === "undefined" || !requestId) return;
  const url = new URL("/sales-preview.html", window.location.origin);
  url.searchParams.set("offerPreview", String(requestId));
  const supportCompanyId = getSalesSupportCompanyId();
  if (supportCompanyId) url.searchParams.set("salesSupportCompany", supportCompanyId);
  const currentParams = new URLSearchParams(window.location.search);
  const vercelShare = currentParams.get("_vercel_share");
  if (vercelShare) url.searchParams.set("_vercel_share", vercelShare);
  window.open(url.toString(), "_blank", "noopener,noreferrer");
}

function productNumber(item = {}) {
  return compactText(item?.supplierProductNumber || item?.internalProductNumber || "");
}

function buildInternalSkuEntries(request = {}) {
  const entries = [];
  (Array.isArray(request?.offerLines) ? request.offerLines : []).forEach((line) => {
    if (line?.__companyMeta || line?.__offerTermsMeta || line?.__storeOfferMeta || line?.lineType === "store_text") return;
    const sku = productNumber(line);
    const title = compactText(line?.description);
    if (sku && title) entries.push({ title, sku });
  });
  (Array.isArray(request?.offerOptions) ? request.offerOptions : []).forEach((option) => {
    const sku = productNumber(option);
    const title = compactText(option?.title || option?.description);
    if (sku && title) entries.push({ title, sku });
  });
  return entries;
}

function directText(node) {
  if (!(node instanceof Element)) return "";
  return compactText(
    Array.from(node.childNodes)
      .filter((child) => child.nodeType === Node.TEXT_NODE)
      .map((child) => child.textContent || "")
      .join(" ")
  );
}

function showInternalProductNumbers(root, request = {}) {
  if (!(root instanceof Element)) return;
  const entries = buildInternalSkuEntries(request);
  if (!entries.length) return;
  const candidates = Array.from(root.querySelectorAll("span,strong"));
  entries.forEach(({ title, sku }) => {
    candidates
      .filter((node) => directText(node) === title)
      .forEach((node) => {
        let marker = node.querySelector(":scope > [data-internal-product-number='true']");
        if (!marker) {
          marker = document.createElement("small");
          marker.dataset.internalProductNumber = "true";
          Object.assign(marker.style, {
            display: "block",
            marginTop: "2px",
            color: "#64748b",
            fontSize: "11px",
            fontWeight: "700",
            lineHeight: "1.3",
          });
          node.appendChild(marker);
        }
        marker.textContent = `Varenr. ${sku}`;
      });
  });
}

function hideStaleSurveyPlanningPrompt(root, request = {}) {
  if (!(root instanceof Element) || !shouldHideLegacySurveyPlanningPrompt(request)) return;
  root.querySelectorAll(".sales-next-card p").forEach((paragraph) => {
    if (compactText(paragraph.textContent) !== LEGACY_SURVEY_PLANNING_PROMPT) return;
    paragraph.style.display = "none";
    paragraph.setAttribute("aria-hidden", "true");
    paragraph.dataset.hiddenLegacySurveyPrompt = "true";
  });
}

export default function SalesDetailView(props) {
  const rootRef = useRef(null);
  const request = props?.selectedRequest || {};
  const [activatedContractWizardOpen, setActivatedContractWizardOpen] = useState(false);
  const storeOffer = isStoreOfferRequest(request);
  const simpleOrderAccepted = Boolean(request?.status === "Akseptert" && isSimpleOrderRequest(request));
  const supportMode = Boolean(getSalesSupportCompanyId());
  const canPreviewDraft = hasCustomerPreviewContent(request);
  const floatingActionBottom = supportMode ? 178 : 20;
  const activatedContractFallback = needsActivatedContractFallback(request, { storeOffer });

  useEffect(() => {
    setActivatedContractWizardOpen(false);
  }, [request?.id]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const frame = window.requestAnimationFrame(() => {
      showInternalProductNumbers(root, request);
      hideStaleSurveyPlanningPrompt(root, request);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [request?.id, request?.status, request?.surveyDate, request?.offerLines, request?.offerOptions]);

  useEffect(() => {
    if (!simpleOrderAccepted) return undefined;
    const root = rootRef.current;
    if (!root) return undefined;
    const frame = window.requestAnimationFrame(() => {
      root.querySelectorAll("button").forEach((button) => {
        if (compactText(button.textContent) === "Aktiver som prosjekt") {
          button.style.display = "none";
          button.setAttribute("aria-hidden", "true");
        }
      });
      root.querySelectorAll(".sales-next-card h2").forEach((heading) => {
        if (compactText(heading.textContent) === "Klar for prosjektaktivering") heading.textContent = "Tilbud akseptert – velg videreføring";
      });
      root.querySelectorAll(".sales-next-card p").forEach((paragraph) => {
        const text = compactText(paragraph.textContent);
        if (text.includes("Akseptert innhold låses i denne flyten før senere prosjektaktivering")) {
          paragraph.textContent = "Velg Enkel ordre for mindre oppdrag, eller ordinært prosjekt dersom jobben trenger full prosjektflyt. Akseptert tilbud og dokumentasjon beholdes i begge tilfeller.";
        }
      });
      showInternalProductNumbers(root, request);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [simpleOrderAccepted, request?.id, request?.offerLines, request?.offerOptions]);

  async function chooseActivationMode(mode) {
    if (supportMode) return;
    const cleanMode = mode === "project" ? "project" : "simple_order";
    setSimpleOrderActivationMode(request.id, cleanMode);
    try {
      const client = createDefaultSalesSupabaseClient();
      await persistSimpleOrderActivationMode(client, request.id, cleanMode);
      props?.openProjectActivation?.();
    } catch (error) {
      window.alert(error?.message || "Kunne ikke lagre valgt videreføring. Prøv igjen før aktivering.");
    }
  }

  if (activatedContractWizardOpen) {
    return (
      <SalesContractWizard
        request={request}
        onClose={() => setActivatedContractWizardOpen(false)}
      />
    );
  }

  const delegatedProps = simpleOrderAccepted
    ? { ...props, selectedRequest: presentationRequest(request), openProjectActivation: () => void chooseActivationMode("project") }
    : props;

  return (
    <div ref={rootRef} className={simpleOrderAccepted ? "simple-order-accepted-shell" : undefined}>
      <SalesDetailViewLegacy {...delegatedProps} />

      {activatedContractFallback ? (
        <div
          data-activated-contract-legacy-fallback="true"
          style={{
            width: "min(960px, calc(100% - 32px))",
            margin: "16px auto 32px",
            padding: 18,
            border: "1px solid #d7e4ea",
            borderRadius: 16,
            background: "#f8fbfc",
            display: "grid",
            gap: 12,
          }}
        >
          <div>
            <strong style={{ display: "block", fontSize: 18, color: "#10212b" }}>Kontrakt</strong>
            <p style={{ margin: "6px 0 0", color: "#52616b", lineHeight: 1.5 }}>
              Prosjektet er allerede aktivert, men kontrakten kan fortsatt opprettes fra det aksepterte tilbudet. Signert kontrakt synkroniseres tilbake til prosjektets Tilbud / kontrakt.
            </p>
          </div>
          <SalesContractActions
            request={asAcceptedContractRequest(request)}
            onOpenWizard={() => {
              if (!supportMode) setActivatedContractWizardOpen(true);
            }}
          />
          {supportMode ? (
            <p className="note" style={{ margin: 0 }}>
              Systemadmin-support er skrivebeskyttet. Firmaet oppretter eller endrer kontrakten.
            </p>
          ) : null}
        </div>
      ) : null}

      {supportMode && simpleOrderAccepted ? (
        <div data-simple-order-support-order-basis="true" style={{ marginTop: 16 }}>
          <StoreOfferOrderBasis request={request} />
        </div>
      ) : null}

      {canPreviewDraft ? (
        <aside data-draft-customer-preview-action="true" style={{ position:"fixed", right:20, bottom:floatingActionBottom, zIndex:23000, width:"min(390px, calc(100vw - 32px))", padding:15, border:"1px solid #b9dde2", borderRadius:16, background:"#ffffff", boxShadow:"0 18px 44px rgba(15,72,82,.20)" }}>
          <strong style={{ display:"block", fontSize:16, color:"#10212b" }}>Kontroller kundens visning før utsending</strong>
          <p style={{ margin:"6px 0 12px", color:"#52616b", lineHeight:1.45 }}>Åpner den lagrede tilbudskladden i kundens layout. Ingen versjon publiseres og ingen e-post sendes.</p>
          <button className="sales-secondary-button" type="button" onClick={() => openDraftCustomerPreview(request.id)}><Eye size={18}/>Forhåndsvis som kunde</button>
        </aside>
      ) : null}

      {simpleOrderAccepted ? (
        <aside data-simple-order-accepted-actions="true" data-support-read-only={supportMode ? "true" : "false"} style={{ position:"fixed", right:20, bottom:floatingActionBottom, zIndex:23000, width:"min(430px, calc(100vw - 32px))", padding:16, border:"1px solid #b9dde2", borderRadius:16, background:"#ffffff", boxShadow:"0 18px 44px rgba(15,72,82,.20)" }}>
          <strong style={{ display:"block", fontSize:17, color:"#10212b" }}>Hva skal oppdraget bli?</strong>
          <p style={{ margin:"6px 0 14px", color:"#52616b", lineHeight:1.45 }}>Enkel ordre er for raske/mindre oppdrag. Velg prosjekt hvis jobben har blitt større og trenger ordinær prosjektflyt.</p>
          {supportMode ? <p className="note" style={{ margin:"0 0 12px" }}>Systemadmin-visning: Du ser valgene kunden/firmaet får, men kan ikke aktivere på vegne av firmaet.</p> : null}
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <button className="sales-primary-button" type="button" disabled={supportMode} onClick={() => void chooseActivationMode("simple_order")}><ShoppingBag size={18}/>Lag enkel ordre</button>
            <button className="sales-secondary-button" type="button" disabled={supportMode} onClick={() => void chooseActivationMode("project")}><Home size={18}/>Aktiver som prosjekt</button>
          </div>
        </aside>
      ) : null}
    </div>
  );
}
