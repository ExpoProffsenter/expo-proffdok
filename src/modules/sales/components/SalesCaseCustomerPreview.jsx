import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ArrowLeft, Eye, Maximize2 } from "lucide-react";
import SalesCustomerView from "./SalesCustomerView.jsx";
import { buildSalesCaseCustomerPreview } from "../utils/salesCaseCustomerPreview.js";
import { formatNok } from "../utils/salesUtils.js";
import useSalesCaseStoredPreview from "./useSalesCaseStoredPreview.js";

const noChange = () => {};

export default function SalesCaseCustomerPreview({ request, companyProfile = {}, onOpenSavedDraft, savedDraftLabel = "Forhåndsvis som kunde" }) {
  const titleId = useId();
  const dialog = useRef(null);
  const opener = useRef(null);
  const [mobile, setMobile] = useState(() => typeof window !== "undefined" && window.matchMedia("(max-width: 1000px)").matches);
  const [expanded, setExpanded] = useState(false);
  const base = useMemo(() => buildSalesCaseCustomerPreview(request, companyProfile), [request, companyProfile]);
  const { preview, loading, error, retry } = useSalesCaseStoredPreview(request, base);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 1000px)");
    const sync = () => { setMobile(query.matches); setExpanded(false); };
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  useEffect(() => { setExpanded(false); }, [request?.id]);
  useEffect(() => {
    const node = dialog.current;
    const returnFocus = expanded ? opener.current : document.activeElement;
    const previousOverflow = document.body.style.overflow;
    if (node.open) node.close();
    if (expanded) { node.showModal(); document.body.style.overflow = "hidden"; }
    else if (!mobile) {
      node.show();
      // Non-modal show() also runs native focus steps. The reading column must
      // not take the caret from an editor when it appears or changes width.
      const target = opener.current || returnFocus;
      if (target?.isConnected) target.focus?.({ preventScroll: true });
    }
    if (!expanded) opener.current = null;
    return () => {
      if (node.open) node.close();
      if (expanded) {
        document.body.style.overflow = previousOverflow;
        if (returnFocus?.isConnected) returnFocus.focus?.({ preventScroll: true });
      }
    };
  }, [expanded, mobile]);
  const openPreview = (event) => { opener.current = event.currentTarget; setExpanded(true); };

  return <aside className="sales-case-customer-preview" data-preview-kind={preview.kind}>
    <button type="button" className="sales-secondary-button sales-case-preview-trigger" onClick={openPreview}><Eye size={18} />Kundevisning</button>
    <dialog ref={dialog} className={`sales-case-preview-drawer${expanded ? " is-expanded" : ""}`} aria-labelledby={titleId}
      onCancel={(event) => { event.preventDefault(); if (expanded) setExpanded(false); }}
      onClick={(event) => { if (expanded && event.target === event.currentTarget) setExpanded(false); }}>
      <div className="sales-case-preview-header">
        <div><h2 id={titleId}>Kundens tilbud</h2><p>{preview.label}{preview.versionNumber ? ` · v${preview.versionNumber}` : ""}</p></div>
        <button type="button" className="sales-secondary-button sales-case-preview-expand" aria-label="Utvid kundevisning" onClick={openPreview}><Maximize2 size={18} /></button>
        <button type="button" className="sales-secondary-button sales-case-preview-close" onClick={() => setExpanded(false)}><ArrowLeft size={18} />Tilbake til arbeidet</button>
      </div>
      <div className="sales-case-preview-paper">
        <p className="sales-case-preview-safety">Skrivebeskyttet visning. Ingen publisering, utsending eller nye kundevalg.</p>
        {preview.kind === "empty" ? <>
          <p role={error ? "alert" : loading ? "status" : undefined}>{error || (loading ? "Henter den lagrede kundeversjonen …" : preview.message)}</p>
          {error ? <button type="button" className="sales-secondary-button" onClick={retry}>Prøv kundevisningen igjen</button> : null}
        </> : <>
          {preview.kind === "accepted" ? <p className="sales-case-preview-acceptance">Akseptert av {preview.request.acceptedBy || "kunde"}.{preview.acceptedTotal != null ? ` Registrert sum: ${formatNok(Number(preview.acceptedTotal) * (preview.request.offerShowPricesExVat ? 1 : 1.25))} ${preview.request.offerShowPricesExVat ? "eks." : "inkl."} mva.` : ""}</p> : null}
          <SalesCustomerView mode="customer-offer" embedded hideDecisionControls readOnlyOptions
            selectedRequest={preview.request} companyProfile={{}}
            acceptanceForm={{ name: "", confirmed: false, selectedOptionIds: preview.selectedOptionIds || [] }}
            setAcceptanceForm={noChange} toggleAcceptedOption={noChange} handleAcceptOffer={noChange} onBack={noChange} />
        </>}
      </div>
      <div className="sales-case-preview-footer">
        {onOpenSavedDraft ? <button type="button" className="sales-secondary-button" data-draft-customer-preview-action="true" data-draft-customer-preview-request-id={String(request?.id || "")} onClick={onOpenSavedDraft}><Eye size={18} />{savedDraftLabel}</button> : null}
        <button type="button" className="sales-secondary-button sales-case-preview-close" onClick={() => setExpanded(false)}>Tilbake til arbeidet</button>
      </div>
    </dialog>
  </aside>;
}
