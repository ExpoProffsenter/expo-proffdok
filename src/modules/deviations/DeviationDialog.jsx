import { useContext, useEffect, useId, useRef } from 'react';
import {DialogPortalTarget} from '../ui/DialogPortalTarget.js';
import { createPortal } from 'react-dom';
import './deviationDialog.css';

const openDialogs = [];

// React owns the complete dialog. Legacy DOM adapters must not move its fields.
export default function DeviationDialog({ title, context, children, onClose, busy = false, closeLabel = 'Lukk avviksdialog', returnFocusTarget }) {
  const portalTarget = useContext(DialogPortalTarget);
  const titleId = useId();
  const panel = useRef(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const dialog = panel.current;
    openDialogs.push(dialog);
    const focusable = () => [...dialog.querySelectorAll('input,select,textarea,button,a[href],summary,[tabindex="0"]')]
      .filter(node => !node.matches(':disabled') && node.getClientRects().length);
    const firstField = focusable().find(node => node.matches('input:not([type="checkbox"]),textarea,select'));
    (firstField || dialog).focus({ preventScroll: true });
    const keydown = event => {
      if (event.key === 'Escape') { event.preventDefault(); close.current?.(); }
      if (event.key !== 'Tab') return;
      const fields = focusable();
      const first = fields[0], last = fields.at(-1);
      if (!first) { event.preventDefault(); dialog.focus(); return; }
      if (!dialog.contains(document.activeElement)) {
        event.preventDefault(); (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    };
    // Disabling the focused save button can move browser focus to BODY. Keep
    // modal keyboard handling available without closing a parent or native modal.
    const keydownOutside = event => {
      if (event.defaultPrevented || openDialogs.at(-1) !== dialog ||
          (event.target !== document.body && event.target !== document.documentElement)) return;
      let nativeModal;
      try { nativeModal = document.querySelector('dialog:modal'); } catch { /* Older DOM test runtimes. */ }
      if (nativeModal && !nativeModal.contains(dialog)) return;
      keydown(event);
    };
    dialog.addEventListener('keydown', keydown);
    document.addEventListener('keydown', keydownOutside);
    return () => {
      dialog.removeEventListener('keydown', keydown);
      document.removeEventListener('keydown', keydownOutside);
      const index = openDialogs.indexOf(dialog);
      if (index !== -1) openDialogs.splice(index, 1);
      document.body.style.overflow = previousOverflow;
      // Async openers may lose focus while loading. An explicit resolver can
      // retain the original trigger and reject it after a workspace change.
      const target = typeof returnFocusTarget === 'function' ? returnFocusTarget() : returnFocusTarget || previousFocus;
      if (target?.isConnected) target.focus({ preventScroll: true });
    };
  }, []);
  return createPortal(<div className="deviation-dialog-backdrop">
    <section className="deviation-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId} aria-busy={busy} ref={panel} tabIndex={-1}>
      <header className="deviation-dialog-header"><div><h2 id={titleId}>{title}</h2>{context && <p>{context}</p>}</div>
        <button type="button" className="secondary deviation-dialog-close" aria-label={closeLabel} disabled={busy} onClick={onClose}>×</button>
      </header>
      <div className="deviation-dialog-body">{children}</div>
    </section>
  </div>, portalTarget || document.body);
}

export function DeviationEditorSurface({ modal, editorRef, children, onClose, busy, title = 'Registrer avvik', context = 'KS/HMS · Ansvar og oppfølging', ...props }) {
  if (modal) return <DeviationDialog title={title} context={context} onClose={onClose} busy={busy}>{children}</DeviationDialog>;
  return <article {...props} ref={editorRef}>{children}</article>;
}
