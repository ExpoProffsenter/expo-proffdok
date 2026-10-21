import React, { useRef, useState } from "react";
import {
  boligDraftKey,
  readBoligDraft,
  writeBoligDraft,
  clearBoligDraft,
} from "./boligClient.js";
export default function CatalogForm({
  context,
  rootId,
  name,
  initial,
  basis,
  busy,
  onSave,
  children,
  submitLabel,
  className = "",
  onRebase = null,
  conflictMessage = "Grunnlaget er endret. Kladden er beholdt. Se over dagens pakker og priser før du fortsetter.",
}) {
  const key = boligDraftKey(context, rootId, "catalog-" + name),
    [value, setValue] = useState(() => {
      const draft = readBoligDraft(key, initial);
      return { ...draft, _basis: draft._basis || basis };
    }),
    [error, setError] = useState("");
  const latest = useRef(value);
  latest.current = value;
  const change = (field, next) => {
    const updated = {
      ...latest.current,
      ...(typeof field === "function"
        ? field(latest.current)
        : typeof field === "object"
          ? field
          : { [field]: next }),
    };
    if (!writeBoligDraft(key, updated))
      setError("Kladden kunne ikke sikres lokalt. Behold siden åpen.");
    latest.current = updated;
    setValue(updated);
  };
  return (
    <form
      className={`bolig-catalog-form ${className}`}
      onInvalidCapture={(e) => {
        let ancestor = e.target.parentElement;
        while (ancestor && ancestor !== e.currentTarget) {
          if (ancestor.tagName === "DETAILS") ancestor.open = true;
          ancestor = ancestor.parentElement;
        }
      }}
      onSubmit={async (e) => {
        e.preventDefault();
        setError("");
        if (e.currentTarget.querySelector('[data-image-uploading="true"]')) {
          setError("Vent til bildet er lastet opp før du lagrer.");
          return;
        }
        try {
          const saved = await onSave(value, value._basis);
          if (saved) {
            clearBoligDraft(key);
            if (name.startsWith("order-"))
              setValue((v) => ({
                ...v,
                _basis: {
                  choice_revision: saved.selection.revision,
                  order_revision: saved.draft.revision,
                },
              }));
            else if (name.startsWith("choice-"))
              setValue((v) => ({
                ...v,
                _basis: {
                  catalog_revision: saved.revision,
                  choice_revision: saved.selection.revision,
                },
              }));
            else setValue({ ...initial, _basis: basis });
          }
        } catch (err) {
          setError(err.message);
        }
      }}
    >
      {JSON.stringify(value._basis) !== JSON.stringify(basis) && (
        <p role="status">
          {conflictMessage}{" "}
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              change({ ...(onRebase ? onRebase(value) : {}), _basis: basis })
            }
          >
            Se over og bruk siste grunnlag
          </button>
        </p>
      )}
      <fieldset disabled={busy}>
        {children(value, change)}
        <button
          type="submit"
          disabled={
            !!onRebase && JSON.stringify(value._basis) !== JSON.stringify(basis)
          }
        >
          {submitLabel}
        </button>
      </fieldset>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
