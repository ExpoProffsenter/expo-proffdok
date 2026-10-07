import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import './deviationDialog.css';

// React owns the complete dialog. Legacy DOM adapters must not move its fields.
export default function DeviationDialog({ title, context, children, onClose, busy = false }) {
  const titleId = useId();
  const panel = useRef(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const dialog = panel.current;
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
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    };
    dialog.addEventListener('keydown', keydown);
    return () => {
      dialog.removeEventListener('keydown', keydown);
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);
  return createPortal(<div className="deviation-dialog-backdrop">
    <section className="deviation-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId} aria-busy={busy} ref={panel} tabIndex={-1}>
      <header className="deviation-dialog-header"><div><h2 id={titleId}>{title}</h2>{context && <p>{context}</p>}</div>
        <button type="button" className="secondary deviation-dialog-close" aria-label="Lukk avviksdialog" disabled={busy} onClick={onClose}>×</button>
      </header>
      <div className="deviation-dialog-body">{children}</div>
    </section>
  </div>, document.body);
}

export function DeviationEditorSurface({ modal, editorRef, children, onClose, busy, title = 'Registrer avvik', context = 'KS/HMS · Ansvar og oppfølging', ...props }) {
  if (modal) return <DeviationDialog title={title} context={context} onClose={onClose} busy={busy}>{children}</DeviationDialog>;
  return <article {...props} ref={editorRef}>{children}</article>;
}
