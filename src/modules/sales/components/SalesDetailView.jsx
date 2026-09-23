// Expo ProffDok – FASE 45B
// Tynn wrapper rundt verifisert SalesDetailViewLegacy. Ordinær/våtroms-/legacy
// Butikktilbud-logikk er uendret og delegert til legacy-komponenten.
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

import { useEffect, useRef } from "react";
import { Home, ShoppingBag } from "lucide-react";
import SalesDetailViewLegacy from "./SalesDetailViewLegacy.jsx";
import { isSimpleOrderRequest } from "../services/salesStoreOffers.js";
import { createDefaultSalesSupabaseClient, getSalesSupportCompanyId } from "../services/salesSupabase.js";
import { persistSimpleOrderActivationMode, setSimpleOrderActivationMode } from "../services/salesSimpleOrder.js";

function presentationRequest(request = {}) {
  if (!isSimpleOrderRequest(request) || request?.status !== "Akseptert") return request;
  return {
    ...request,
    directOffer: false,
    storeOfferMeta: null,
    offerLines: (Array.isArray(request.offerLines) ? request.offerLines : []).filter((line) => !line?.__storeOfferMeta),
  };
}

export default function SalesDetailView(props) {
  const rootRef = useRef(null);
  const request = props?.selectedRequest || {};
  const simpleOrderAccepted = Boolean(request?.status === "Akseptert" && isSimpleOrderRequest(request));
  const supportMode = Boolean(getSalesSupportCompanyId());

  useEffect(() => {
    if (!simpleOrderAccepted) return undefined;
    const root = rootRef.current;
    if (!root) return undefined;
    const frame = window.requestAnimationFrame(() => {
      root.querySelectorAll("button").forEach((button) => {
        if (String(button.textContent || "").replace(/\s+/g, " ").trim() === "Aktiver som prosjekt") {
          button.style.display = "none";
          button.setAttribute("aria-hidden", "true");
        }
      });
      root.querySelectorAll(".sales-next-card h2").forEach((heading) => {
        if (String(heading.textContent || "").trim() === "Klar for prosjektaktivering") heading.textContent = "Tilbud akseptert – velg videreføring";
      });
      root.querySelectorAll(".sales-next-card p").forEach((paragraph) => {
        const text = String(paragraph.textContent || "").trim();
        if (text.includes("Akseptert innhold låses i denne flyten før senere prosjektaktivering")) {
          paragraph.textContent = "Velg Enkel ordre for mindre oppdrag, eller ordinært prosjekt dersom jobben trenger full prosjektflyt. Akseptert tilbud og dokumentasjon beholdes i begge tilfeller.";
        }
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [simpleOrderAccepted, request?.id]);

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

  const delegatedProps = simpleOrderAccepted
    ? { ...props, selectedRequest: presentationRequest(request), openProjectActivation: () => void chooseActivationMode("project") }
    : props;

  return (
    <div ref={rootRef} className={simpleOrderAccepted ? "simple-order-accepted-shell" : undefined}>
      <SalesDetailViewLegacy {...delegatedProps} />
      {simpleOrderAccepted ? (
        <aside data-simple-order-accepted-actions="true" data-support-read-only={supportMode ? "true" : "false"} style={{ position:"fixed", right:20, bottom:20, zIndex:23000, width:"min(430px, calc(100vw - 32px))", padding:16, border:"1px solid #b9dde2", borderRadius:16, background:"#ffffff", boxShadow:"0 18px 44px rgba(15,72,82,.20)" }}>
          <strong style={{ display:"block", fontSize:17, color:"#10212b" }}>Hva skal oppdraget bli?</strong>
          <p style={{ margin:"6px 0 14px", color:"#52616b", lineHeight:1.45 }}>
            Enkel ordre er for raske/mindre oppdrag. Velg prosjekt hvis jobben har blitt større og trenger ordinær prosjektflyt.
          </p>
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
