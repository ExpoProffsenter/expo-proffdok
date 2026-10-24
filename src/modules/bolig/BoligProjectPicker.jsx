import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FolderOpen, Search, CheckCircle2, X } from "lucide-react";

export default function BoligProjectPicker({
  roots,
  activeRoot,
  busy,
  onSelect,
  children,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [archived, setArchived] = useState(false);
  const dialog = useRef(null),
    trigger = useRef(null),
    search = useRef(null);
  const close = () => {
    setOpen(false);
  };
  useEffect(() => {
    if (open) {
      dialog.current?.showModal();
      search.current?.focus();
    } else if (dialog.current?.open) {
      dialog.current.close();
      if (trigger.current?.isConnected)
        trigger.current.focus({ preventScroll: true });
    }
  }, [open]);
  const previousRoot = useRef(activeRoot?.id);
  useEffect(() => {
    if (previousRoot.current !== activeRoot?.id) setOpen(false);
    previousRoot.current = activeRoot?.id;
  }, [activeRoot?.id]);
  const terms = query
    .trim()
    .toLocaleLowerCase("nb")
    .split(/\s+/)
    .filter(Boolean);
  const shown = roots.filter(
    (r) =>
      (archived || !r.archived || r.id === activeRoot?.id) &&
      terms.every((t) =>
        `${r.title} ${r.reference}`.toLocaleLowerCase("nb").includes(t),
      ),
  );
  return (
    <>
      <button
        ref={trigger}
        type="button"
        className="bolig-switch-project"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        disabled={busy}
      >
        <FolderOpen size={17} />
        {activeRoot ? "Bytt prosjekt" : "Velg prosjekt"}
      </button>
      {createPortal(
        <dialog
          ref={dialog}
          className="bolig-dialog bolig-project-dialog"
          aria-label="Velg boligprosjekt"
          onCancel={(event) => {
            event.preventDefault();
            event.stopPropagation();
            close();
          }}
        >
          <header>
            <div>
              <small>BOLIGPROSJEKTER</small>
              <h2>Velg prosjekt</h2>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Lukk prosjektvelger"
            >
              <X size={18} />
            </button>
          </header>
          <label className="bolig-picker-search">
            <Search size={18} />
            <span className="bolig-sr-only">Søk prosjekt</span>
            <input
              ref={search}
              type="search"
              placeholder="Søk navn eller prosjektnummer"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <label className="bolig-picker-archive">
            <input
              type="checkbox"
              checked={archived}
              onChange={(e) => setArchived(e.target.checked)}
            />
            Vis arkiverte prosjekter
          </label>
          <div className="bolig-picker-list">
            {shown.map((r) => (
              <button
                className="bolig-root"
                type="button"
                disabled={busy}
                key={r.id}
                aria-pressed={activeRoot?.id === r.id}
                onClick={async () => {
                  if (r.id !== activeRoot?.id) await onSelect(r.id);
                  close();
                }}
              >
                <FolderOpen size={22} />
                <span>
                  <b>
                    {r.title}
                    {r.archived ? " · arkivert" : ""}
                  </b>
                  <small>
                    {r.reference || "Uten prosjektnummer"} · {r.unit_count}{" "}
                    boliger
                  </small>
                </span>
                {r.id === activeRoot?.id && (
                  <CheckCircle2 size={20} aria-label="Aktivt prosjekt" />
                )}
              </button>
            ))}
            {!shown.length && (
              <p>
                {roots.length
                  ? "Ingen prosjekter passer til søket."
                  : "Ingen boligprosjekter er opprettet ennå."}
              </p>
            )}
          </div>
          {children && (
            <details className="bolig-picker-create">
              <summary>+ Nytt hovedprosjekt</summary>
              {children}
            </details>
          )}
        </dialog>,
        document.body,
      )}
    </>
  );
}
