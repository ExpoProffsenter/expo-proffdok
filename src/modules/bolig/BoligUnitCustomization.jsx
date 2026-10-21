import React, { useEffect, useRef, useState } from "react";
import Dialog from "./BoligEditorDialog.jsx";
import ContentEditor from "./BoligPackageContentEditor.jsx";
import ProductCard from "./BoligProductCard.jsx";
import {
  customizationRpc,
  customizationModel,
  signedCents,
} from "./boligCustomizationClient.js";
import {
  packageChoiceBasis,
  PACKAGE_CHOICES_EVENT,
} from "./boligPackageChoicesClient.js";
import {
  boligDraftKey,
  readBoligDraft,
  writeBoligDraft,
  clearBoligDraft,
} from "./boligClient.js";
import { money } from "./boligCatalogClient.js";
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
export default function BoligUnitCustomization({
  context,
  root,
  unit,
  scopeId,
  onClose,
}) {
  const [data, setData] = useState(null),
    [draft, setDraft] = useState(null),
    [proposal, setProposal] = useState(null),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const alive = useRef(true),
    epoch = useRef(0),
    operation = useRef(false),
    latest = useRef(null);
  const key = boligDraftKey(
    context,
    root.id,
    `customization-${unit.id}-${scopeId}`,
  );
  latest.current = draft;
  const load = async () => {
    if (operation.current) return;
    const ticket = ++epoch.current;
    setLoading(true);
    try {
      const next = await customizationRpc(context, root.id, unit.id);
      if (!alive.current || ticket !== epoch.current) return;
      setData(next);
      setProposal(null);
      setError("");
      if (!latest.current) {
        const p = next.components.find((p) => p.scope_id === scopeId);
        if (!p) throw Error("Velg en pakke før du tilpasser boligen.");
        setDraft(
          readBoligDraft(key, null) || {
            ...customizationModel(p),
            basis: packageChoiceBasis(next),
          },
        );
      }
    } catch (e) {
      if (alive.current && ticket === epoch.current) {
        setError(e.message);
        setProposal(null);
        if (e.code === "42501") {
          setData(null);
          setDraft(null);
        }
      }
    } finally {
      if (alive.current && ticket === epoch.current) setLoading(false);
    }
  };
  useEffect(() => {
    alive.current = true;
    load();
    const refresh = () => {
      if (document.visibilityState !== "hidden") load();
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener(PACKAGE_CHOICES_EVENT, refresh);
    return () => {
      alive.current = false;
      ++epoch.current;
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener(PACKAGE_CHOICES_EVENT, refresh);
    };
  }, []);
  const change = (field, value) => {
    const current = latest.current;
    const next = {
      ...current,
      ...(typeof field === "function"
        ? field(current)
        : typeof field === "object"
          ? field
          : { [field]: value }),
    };
    latest.current = next;
    setDraft(next);
    setProposal(null);
    if (!writeBoligDraft(key, next))
      setError("Kladden kunne ikke sikres lokalt. Behold siden åpen.");
  };
  const canWrite =
    data?.context.role === "manager" &&
    context.role === "manager" &&
    context.enabled &&
    !root.archived &&
    !data.root_archived;
  const conflict =
    !!data && !!draft && !same(draft.basis, packageChoiceBasis(data));
  const transact = async (save) => {
    if (
      operation.current ||
      loading ||
      !canWrite ||
      conflict ||
      !draft ||
      (save && !proposal)
    )
      return;
    if (!writeBoligDraft(key, draft)) {
      setError("Kladden kunne ikke sikres lokalt. Lagring er stoppet.");
      return;
    }
    operation.current = true;
    setBusy(true);
    setError("");
    try {
      const payload = {
        scope_id: scopeId,
        reason: draft.reason,
        adjustment_cents: signedCents(draft.adjustment),
        sections: draft.sections,
        lines: draft.lines.map((l) => ({ ...l, quantity: Number(l.quantity) })),
      };
      const action = draft.reset
        ? save
          ? "reset"
          : "reset_preview"
        : save
          ? "save"
          : "preview";
      const next = await customizationRpc(
        context,
        root.id,
        unit.id,
        action,
        draft.basis,
        payload,
      );
      if (!alive.current) return;
      if (save) {
        clearBoligDraft(key);
        window.dispatchEvent(new CustomEvent(PACKAGE_CHOICES_EVENT));
        onClose(true);
      } else setProposal(next.proposal);
    } catch (e) {
      if (alive.current) {
        setError(e.message + " Kladden er beholdt.");
        if (e.code === "42501") {
          setData(null);
          setDraft(null);
        }
      }
    } finally {
      operation.current = false;
      if (alive.current) setBusy(false);
    }
  };
  const part = data?.components.find((p) => p.scope_id === scopeId);
  return (
    <Dialog
      title="Tilpass denne leiligheten"
      busy={busy}
      onClose={() => onClose(false)}
    >
      <p className="bolig-notice">
        <strong>
          {unit.number} · {part?.room_name || "Boligen"}
        </strong>
        <br />
        Endringene gjelder bare denne boligen. Grunnpakken og tilvalgspakkene i
        biblioteket beholdes.
      </p>
      {loading && <p role="status">Henter siste boliggrunnlag …</p>}
      {!data && !loading && (
        <button type="button" onClick={load}>
          Prøv å hente grunnlaget igjen
        </button>
      )}
      {data && draft && canWrite && (
        <form
          onInvalidCapture={(e) => {
            let n = e.target.parentElement;
            while (n && n !== e.currentTarget) {
              if (n.tagName === "DETAILS") n.open = true;
              n = n.parentElement;
            }
          }}
          onSubmit={(e) => {
            e.preventDefault();
            if (
              e.currentTarget.querySelector('[data-image-uploading="true"]')
            ) {
              setError("Vent til bildet er lastet opp.");
              return;
            }
            transact(!!proposal);
          }}
        >
          {conflict && (
            <div role="alert">
              <p>
                Boliggrunnlaget er endret. Kladden er beholdt. Kontroller siste
                lagrede varer før du fortsetter.
              </p>
              <details>
                <summary>Siste lagrede varer</summary>
                {part?.goods.map((g) => (
                  <ProductCard key={g.key} line={g} />
                ))}
              </details>
              <button
                type="button"
                disabled={busy || loading}
                onClick={() => change({ basis: packageChoiceBasis(data) })}
              >
                Bruk siste grunnlag og behold kladden
              </button>
            </div>
          )}
          <fieldset disabled={busy || loading || conflict}>
            {!proposal ? (
              <>
                {part?.customization && (
                  <label className="bolig-option-choice">
                    <input
                      type="checkbox"
                      checked={draft.reset}
                      onChange={(e) => change("reset", e.target.checked)}
                    />
                    Gjenopprett opprinnelig pakkevalg for denne boligen
                  </label>
                )}
                {!draft.reset && (
                  <>
                    <p>
                      Endre antall og varenummer, fjern varer eller legg til
                      nye. En pakkepris endres ikke automatisk når vareantallet
                      endres.
                    </p>
                    <ContentEditor
                      value={draft}
                      change={change}
                      context={context}
                      rootId={root.id}
                      base={false}
                    />
                    <label>
                      Pristillegg / fratrekk inkl. mva.
                      <input
                        inputMode="decimal"
                        aria-label="Pristillegg / fratrekk inkl. mva."
                        required
                        value={draft.adjustment}
                        onChange={(e) => change("adjustment", e.target.value)}
                      />
                      <small>
                        0 beholder avtalt pris. Minusbeløp gir fratrekk. Ingen
                        automatisk kundeaksept.
                      </small>
                    </label>
                  </>
                )}
                {draft.reset && (
                  <p>
                    Tilbake til det fryste pakkevalget før første tilpasning.
                    Nyere endringer i biblioteket hentes ikke inn.
                  </p>
                )}
                <label>
                  Begrunnelse for endringen
                  <textarea
                    aria-label="Begrunnelse for endringen"
                    required
                    minLength={3}
                    maxLength={1000}
                    value={draft.reason}
                    onChange={(e) => change("reason", e.target.value)}
                  />
                </label>
                <button type="submit" className="bolig-primary">
                  {busy ? "Behandler …" : "Se over tilpasningen"}
                </button>
              </>
            ) : (
              <>
                <h3>Kontroller endringen for {unit.number}</h3>
                <p>{draft.reason}</p>
                <p>
                  Samlet tilvalg og tilpasning:{" "}
                  <strong>{money(proposal.total_cents)} inkl. mva.</strong>
                </p>
                <ul className="bolig-custom-review">
                  {proposal.goods.map((g) => (
                    <li key={g.key}>
                      <ProductCard line={g} />
                    </li>
                  ))}
                </ul>
                <p>
                  Dette oppretter en ny boligvalgsversjon. Bestillingsutkast må
                  gjennomgås på nytt. Ingen bestilling eller kundeaksept sendes.
                </p>
                <button type="submit" className="bolig-primary">
                  {busy ? "Lagrer …" : "Lagre tilpasning for denne boligen"}
                </button>
                <button type="button" onClick={() => setProposal(null)}>
                  Tilbake til redigering
                </button>
              </>
            )}
          </fieldset>
        </form>
      )}
      {data && !canWrite && (
        <p>Lesetilgang. Boligens varegrunnlag kan ikke endres.</p>
      )}
      {error && <p role="alert">{error}</p>}
      {part?.customization && (
        <details>
          <summary>Gjeldende individuelle tilpasning</summary>
          <p>{part.customization.reason}</p>
          <p>{new Date(part.customization.at).toLocaleString("nb-NO")}</p>
        </details>
      )}
      {data?.history?.some((h) => h.snapshot.customization_event) && (
        <details>
          <summary>Tilpasningshistorikk</summary>
          <ul>
            {data.history
              .filter((h) => h.snapshot.customization_event)
              .map((h) => (
                <li key={h.revision}>
                  Versjon {h.revision} ·{" "}
                  {new Date(h.created_at).toLocaleString("nb-NO")} ·{" "}
                  {h.snapshot.customization_event.reason}
                  {h.snapshot.customization_event.action === "reset"
                    ? " · Opprinnelig pakkevalg gjenopprettet"
                    : ""}
                </li>
              ))}
          </ul>
        </details>
      )}
      <footer>
        <button type="button" disabled={busy} onClick={() => onClose(false)}>
          Lukk og behold kladd
        </button>
      </footer>
    </Dialog>
  );
}
