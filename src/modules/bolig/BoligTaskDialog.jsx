import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, UserRoundPen } from "lucide-react";

// Keep the editor mounted when closing, so unsent fields survive a short detour.
export default function BoligTaskDialog({ title, children }) {
  const [open, setOpen] = useState(false);
  const dialog = useRef(null),
    trigger = useRef(null);
  useEffect(() => {
    if (open) dialog.current?.showModal();
    else if (dialog.current?.open) {
      dialog.current.close();
      trigger.current?.focus({ preventScroll: true });
    }
  }, [open]);
  return (
    <>
      <button
        ref={trigger}
        type="button"
        className="bolig-task-trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <UserRoundPen size={17} />
        {title}
      </button>
      {createPortal(
        <dialog
          ref={dialog}
          className="bolig-dialog bolig-task-dialog"
          aria-label={title}
          onCancel={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen(false);
          }}
        >
          <header>
            <h2>{title}</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={`Lukk ${title.toLocaleLowerCase("nb")}`}
            >
              <X size={20} />
            </button>
          </header>
          {children}
          <footer>
            <button type="button" onClick={() => setOpen(false)}>
              Tilbake til boligen
            </button>
          </footer>
        </dialog>,
        document.body,
      )}
    </>
  );
}
