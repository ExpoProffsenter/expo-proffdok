import React, { useEffect, useRef, useState } from "react";
import { boligOrderRpc } from "./boligCatalogClient.js";
import DraftForm from "./BoligDraftForm.jsx";
import ProductCard from "./BoligProductCard.jsx";
export default function BoligOrderDraft({
  context,
  root,
  unit,
  choiceRevision,
}) {
  const [state, setState] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true),
    [notice, setNotice] = useState("");
  const generation = useRef(0),
    operation = useRef(false);
  const load = async () => {
    const ticket = ++generation.current;
    setLoading(true);
    setError("");
    try {
      const value = await boligOrderRpc(context, root.id, unit.id);
      if (ticket === generation.current) setState(value);
    } catch (err) {
      if (ticket === generation.current) {
        setState(null);
        setError(err.message);
      }
    } finally {
      if (ticket === generation.current) setLoading(false);
    }
  };
  useEffect(() => {
    setState(null);
    load();
    window.addEventListener("focus", load);
    return () => {
      ++generation.current;
      window.removeEventListener("focus", load);
    };
  }, [
    context.user_id,
    context.company_id,
    context.role,
    context.enabled,
    root.id,
    unit.id,
    choiceRevision,
  ]);
  const save = async (value, basis) => {
    if (operation.current || loading || context.role !== "manager")
      return false;
    operation.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    const ticket = generation.current;
    try {
      const saved = await boligOrderRpc(
        context,
        root.id,
        unit.id,
        "save",
        basis,
        { selected_positions: value.selected_positions },
      );
      if (ticket !== generation.current) return false;
      setState(saved);
      setNotice("Bestillingsutkastet er lagret. Ingen bestilling er sendt.");
      return saved;
    } catch (err) {
      if (ticket === generation.current) {
        setError(err.message);
        if (err.code === "42501") setState(null);
      }
      return false;
    } finally {
      operation.current = false;
      setBusy(false);
    }
  };
  const current = state?.selection;
  const canWrite =
    context.enabled &&
    context.role === "manager" &&
    state?.context?.role === "manager" &&
    !root.archived;
  const positions = current?.snapshot.goods.map((_, i) => i) || [];
  const basis = {
    choice_revision: current?.revision || 0,
    order_revision: state?.draft?.revision || 0,
  };
  const initial = {
    selected_positions:
      state?.draft && state.draft.source_choice_revision === current?.revision
        ? state.draft.snapshot.selected_positions
        : positions,
  };
  return (
    <section className="bolig-order-draft" aria-label="Bestillingsutkast">
      <h4>Klargjør varebestilling</h4>
      <p>
        Alle linjer er valgt første gang. Fjern varer som skal kjøpes et annet
        sted. Utvalget endrer bare dette bestillingsutkastet; boligvalget
        beholdes.
      </p>
      {error && <p role="alert">{error} Kladden er beholdt.</p>}
      {notice && <p role="status">{notice}</p>}
      <button type="button" disabled={busy || loading} onClick={load}>
        {loading
          ? "Henter bestillingsgrunnlag …"
          : "Hent siste bestillingsgrunnlag"}
      </button>
      {state?.draft && (
        <div className="bolig-saved-order">
          <strong>
            Lagret bestillingsutkast · versjon {state.draft.revision} · ikke
            sendt
          </strong>
          <p>
            {state.draft.snapshot.goods.length} varelinjer med ·{" "}
            {state.draft.snapshot.excluded_count} utelatt
          </p>
          {state.draft.source_choice_revision !== current?.revision && (
            <p>
              Boligvalget er endret. Se over varelinjene før du lagrer et nytt
              bestillingsutkast.
            </p>
          )}
        </div>
      )}
      {current && canWrite ? (
        <DraftForm
          key={unit.id}
          context={context}
          rootId={root.id}
          name={"order-" + unit.id}
          initial={initial}
          basis={basis}
          busy={busy || loading}
          onSave={save}
          submitLabel="Lagre bestillingsutkast"
        >
          {(value, change) => (
            <>
              <button
                type="button"
                onClick={() => change("selected_positions", positions)}
              >
                Velg alle varelinjer
              </button>
              {current.snapshot.goods.map((line, index) => (
                <label className="bolig-order-line" key={index}>
                  <input
                    type="checkbox"
                    checked={value.selected_positions.includes(index)}
                    onChange={(e) =>
                      change(
                        "selected_positions",
                        e.target.checked
                          ? [...value.selected_positions, index]
                          : value.selected_positions.filter((x) => x !== index),
                      )
                    }
                  />
                  <ProductCard line={line} />
                </label>
              ))}
              <p>
                {value.selected_positions.length} av {positions.length}{" "}
                varelinjer valgt.
              </p>
              <p>
                Utkastet er ikke sendt. Mottaker og leveringsoppsett fylles inn
                i neste bestillingstrinn.
              </p>
            </>
          )}
        </DraftForm>
      ) : (
        !loading &&
        current && (
          <p>
            Lesetilgang.{" "}
            {state?.draft
              ? "Lagret bestillingsutkast kan leses."
              : "Ingen bestillingsutkast er lagret."}
          </p>
        )
      )}
    </section>
  );
}
