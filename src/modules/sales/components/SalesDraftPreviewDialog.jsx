import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft } from "lucide-react";
import SalesDraftCustomerPreview from "./SalesDraftCustomerPreview.jsx";
import "../salesDraftPreviewDialog.css";

// Share the app's registered auth client in this document. No credential handoff.
export default function SalesDraftPreviewDialog({ requestId, onClose }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    const returnFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const dialog = dialogRef.current;
    dialog.showModal();
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (returnFocus?.isConnected) returnFocus.focus?.({ preventScroll: true });
    };
  }, []);

  return createPortal(
    <dialog ref={dialogRef} className="sales-draft-preview-dialog" aria-label="Forhåndsvis som kunde"
      onCancel={(event) => { event.preventDefault(); onClose(); }}>
      <header className="sales-draft-preview-dialog-header">
        <button ref={closeRef} type="button" className="sales-secondary-button" onClick={onClose}>
          <ArrowLeft size={18} aria-hidden="true" />Tilbake til tilbudet
        </button>
        <span>Kundens visning · lagret kladd</span>
      </header>
      <div className="sales-draft-preview-dialog-content">
        <SalesDraftCustomerPreview requestId={requestId} onBack={onClose} />
      </div>
    </dialog>, document.body,
  );
}
