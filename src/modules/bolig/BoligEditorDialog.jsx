import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export default function BoligEditorDialog({
  title,
  busy,
  onClose,
  children,
  className = "",
  suspended = false,
}) {
  const dialog = useRef(null);
  useEffect(() => {
    const node = dialog.current;
    if (suspended) node.close?.();
    else node.showModal?.();
    return () => node.close?.();
  }, [suspended]);
  return createPortal(
    <dialog
      ref={dialog}
      className={`bolig-dialog bolig-catalog-dialog ${className}`}
      aria-label={title}
      hidden={suspended}
      onCancel={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!busy) onClose();
      }}
    >
      <header>
        <h2>{title}</h2>
        <button
          type="button"
          aria-label={`Lukk ${title.toLocaleLowerCase("nb")}`}
          disabled={busy}
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </header>
      {children}
    </dialog>,
    document.body,
  );
}
