import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Package, Plus, X } from "lucide-react";
import {
  packageChoicesRpc,
  packageChoiceBasis,
  PACKAGE_CHOICES_EVENT,
  PACKAGE_EDITOR_EVENT,
} from "./boligPackageChoicesClient.js";
import {
  boligDraftKey,
  readBoligDraft,
  writeBoligDraft,
  clearBoligDraft,
} from "./boligClient.js";
import { money, optionBreakdown } from "./boligCatalogClient.js";
import ProductCard from "./BoligProductCard.jsx";
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const roomLabel = (part, rooms) =>
  part.scope_id === "common"
    ? "Felles for boligen"
    : rooms.find((r) => r.id === part.room_id)?.name || part.room_name;
export function PackageChoiceSummary({
  components,
  rooms,
  roomId = null,
  onEdit = null,
}) {
  const visible = components
    .filter((p) => !roomId || p.room_id === roomId)
    .sort((a, b) =>
      a.scope_id === "common"
        ? -1
        : b.scope_id === "common"
          ? 1
          : roomLabel(a, rooms).localeCompare(roomLabel(b, rooms), "nb"),
    );
  const shared = roomId
    ? components
        .filter((p) => p.scope_id === "common")
        .flatMap((p) =>
          (p.allocations || [])
            .filter((a) => a.room_id === roomId)
            .map((a) => ({ ...p.goods[a.position], quantity: a.quantity })),
        )
    : [];
  return (
    <div className="bolig-package-choice-cards">
      {visible.map((p) => (
        <article key={p.scope_id}>
          <div className="bolig-package-choice-card-heading">
            <Package size={20} />
            <div>
              <small>
                {roomLabel(p, rooms)}
                {rooms.find((r) => r.id === p.room_id)?.archived
                  ? " · arkivert rom"
                  : ""}
              </small>
              <h5>{p.package.name}</h5>
            </div>
            <span>{p.goods.length} varelinjer</span>
          </div>
          <p>Tilvalg: {money(p.total_cents)} inkl. mva.</p>
          <details>
            <summary>Vis varer og tilvalg</summary>
            <ul>
              {p.goods.map((g, i) => (
                <li key={i}>
                  <ProductCard line={g} />
                </li>
              ))}
            </ul>
            {p.options?.length > 0 && (
              <p>{p.options.map((o) => o.name).join(", ")}</p>
            )}
          </details>
          {onEdit && p.scope_id !== "common" && (
            <button
              type="button"
              className="bolig-quiet-action"
              onClick={(e) => onEdit(p.scope_id, e.currentTarget)}
            >
              {rooms.find((r) => r.id === p.room_id)?.archived
                ? "Fjern pakke fra arkivert rom: "
                : "Endre pakke: "}
              {roomLabel(p, rooms)}
            </button>
          )}
        </article>
      ))}
      {shared.length > 0 && (
        <article>
          <h5>Fordelt fra fellespakken</h5>
          <ul>
            {shared.map((g, i) => (
              <li key={i}>
                <ProductCard line={g} />
              </li>
            ))}
          </ul>
        </article>
      )}
    </div>
  );
}
export default function BoligPackageChoices({
  context,
  root,
  unit,
  activeRoom = null,
  roomsRevision,
}) {
  const [data, setData] = useState(null),
    [draft, setDraft] = useState(null),
    [scope, setScope] = useState(null),
    [open, setOpen] = useState(false),
    [proposal, setProposal] = useState(null),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const generation = useRef(0),
    operation = useRef(false),
    dialog = useRef(null),
    opener = useRef(null);
  const load = useCallback(async () => {
    if (operation.current) return;
    const ticket = ++generation.current;
    setLoading(true);
    try {
      const value = await packageChoicesRpc(context, root.id, unit.id);
      if (ticket !== generation.current) return;
      setData(value);
      setError("");
    } catch (e) {
      if (ticket !== generation.current) return;
      setError(e.message);
      if (e.code === "42501") {
        setData(null);
        setOpen(false);
      }
    } finally {
      if (ticket === generation.current) setLoading(false);
    }
  }, [
    context.user_id,
    context.company_id,
    context.role,
    root.id,
    root.archived,
    unit.id,
  ]);
  const canWrite =
    !!data &&
    context.enabled &&
    context.role === "manager" &&
    data.context.role === "manager" &&
    !root.archived &&
    !data.root_archived;
  const keyFor = (sid) =>
    boligDraftKey(context, root.id, `package-choice-${unit.id}-${sid}`);
  const start = (sid, button) => {
    if (!canWrite || loading || operation.current) return;
    if (sid !== "common" && !data.rooms.some((r) => r.id === sid)) return;
    const part = data.components.find((p) => p.scope_id === sid),
      cached = readBoligDraft(keyFor(sid), null);
    setScope(sid);
    const next = cached || {
      package_id: part?.package.id || "",
      option_ids: part?.options.map((o) => o.id) || [],
      remove: !!data.rooms.find((r) => r.id === sid)?.archived,
      basis: packageChoiceBasis(data),
    };
    setDraft({
      ...next,
      remove: data.rooms.find((r) => r.id === sid)?.archived
        ? true
        : next.remove,
    });
    setProposal(null);
    setError("");
    setNotice("");
    opener.current = button || document.activeElement;
    setOpen(true);
  };
  const startRef = useRef(start);
  startRef.current = start;
  useEffect(() => {
    if (!context.enabled) {
      ++generation.current;
      setData(null);
      setOpen(false);
      return;
    }
    load();
    const visible = () => {
      if (document.visibilityState !== "hidden") load();
    };
    const edit = (e) => {
      if (e.detail?.root_id === root.id && e.detail?.unit_id === unit.id)
        startRef.current(e.detail.scope_id);
    };
    window.addEventListener("focus", load);
    window.addEventListener(PACKAGE_CHOICES_EVENT, load);
    window.addEventListener(PACKAGE_EDITOR_EVENT, edit);
    document.addEventListener("visibilitychange", visible);
    return () => {
      ++generation.current;
      window.removeEventListener("focus", load);
      window.removeEventListener(PACKAGE_CHOICES_EVENT, load);
      window.removeEventListener(PACKAGE_EDITOR_EVENT, edit);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [load, context.enabled, roomsRevision]);
  useEffect(() => {
    if (open) dialog.current?.showModal();
    else if (dialog.current?.open) {
      dialog.current.close();
      if (opener.current?.isConnected)
        opener.current.focus({ preventScroll: true });
    }
  }, [open]);
  const change = (next) => {
    setDraft(next);
    setProposal(null);
    if (!writeBoligDraft(keyFor(scope), next))
      setError(
        "Utkastet kunne ikke sikres lokalt. Behold siden åpen og prøv igjen.",
      );
  };
  const close = () => {
    if (!operation.current) {
      setOpen(false);
      setProposal(null);
    }
  };
  const components = data?.components || [],
    rooms = data?.rooms || [],
    current = components.find((p) => p.scope_id === scope),
    label =
      scope === "common"
        ? "Felles for boligen"
        : rooms.find((r) => r.id === scope)?.name || "Rom";
  const pkg = data?.packages.find(
      (p) => p.id === draft?.package_id && !p.archived,
    ),
    opts = data?.options.filter((o) => draft?.option_ids.includes(o.id)) || [];
  const replacements = opts
    .filter((o) => o.replace_key)
    .map((o) => o.replace_key);
  const invalid =
    !draft?.remove &&
    (!pkg ||
      opts.some(
        (o) =>
          o.archived ||
          !optionBreakdown(o, pkg).compatible ||
          optionBreakdown(o, pkg).missingCredit,
      ) ||
      (draft?.option_ids.length || 0) !== opts.length ||
      new Set(replacements).size !== replacements.length);
  const conflict =
    !!data && !!draft && !equal(draft.basis, packageChoiceBasis(data));
  const transact = async (action) => {
    if (
      !canWrite ||
      loading ||
      operation.current ||
      conflict ||
      invalid ||
      !draft ||
      (action === "save" && !proposal)
    )
      return;
    if (!writeBoligDraft(keyFor(scope), draft)) {
      setError(
        "Utkastet kunne ikke sikres lokalt. Lagring er stoppet. Prøv igjen.",
      );
      return;
    }
    operation.current = true;
    const ticket = ++generation.current;
    setBusy(true);
    setError("");
    try {
      const value = await packageChoicesRpc(
        context,
        root.id,
        unit.id,
        action,
        draft.basis,
        {
          scope_id: scope,
          package_id: draft.package_id,
          option_ids: draft.option_ids,
          remove: draft.remove,
          clear_allocations: !!draft.clear_allocations,
        },
      );
      if (ticket !== generation.current) return;
      setData(value);
      if (action === "preview") setProposal(value.proposal);
      else {
        clearBoligDraft(keyFor(scope));
        setOpen(false);
        setProposal(null);
        setDraft(null);
        setNotice(
          "Pakkevalget er lagret. Varegrunnlaget for boligen er oppdatert. Tidligere bestillingsutkast er beholdt.",
        );
        window.dispatchEvent(new CustomEvent(PACKAGE_CHOICES_EVENT));
      }
    } catch (e) {
      if (ticket === generation.current) {
        setError(e.message);
        if (e.code === "42501") {
          setData(null);
          setOpen(false);
        }
      }
    } finally {
      operation.current = false;
      setBusy(false);
    }
  };
  if (!context.enabled) return null;
  return (
    <section
      className="bolig-package-choices"
      aria-label="Rompakker og fellespakke"
    >
      <header>
        <div>
          <small>GRUNNLEVERANSE</small>
          <h4>
            {activeRoom
              ? `Rompakke · ${activeRoom.name}`
              : "Rompakker og fellespakke"}
          </h4>
        </div>
        {canWrite && (
          <button
            type="button"
            className="bolig-create-action"
            disabled={busy || loading}
            onClick={(e) => start(activeRoom?.id || "common", e.currentTarget)}
          >
            <Plus size={16} />
            {activeRoom
              ? components.some((p) => p.room_id === activeRoom.id)
                ? "Endre rompakke"
                : "Velg rompakke"
              : components.some((p) => p.scope_id === "common")
                ? "Endre fellespakke"
                : "Velg fellespakke"}
          </button>
        )}
      </header>
      {!data ? (
        <p role="status">
          {error || "Henter pakkevalg …"}{" "}
          {error && (
            <button type="button" onClick={load}>
              Prøv igjen
            </button>
          )}
        </p>
      ) : (
        <>
          <p className="bolig-editor-hint">
            {activeRoom
              ? "Velg grunnpakke og tilvalg for dette rommet. Fellespakken for boligen beholdes."
              : "Fellespakken gjelder boligen. Velg et rom ovenfor for å legge til rompakke. Lag gjenbrukbare pakker under Oppsett → Grunnpakker og tilvalg."}
          </p>
          <PackageChoiceSummary
            components={components}
            rooms={rooms}
            roomId={activeRoom?.id}
            onEdit={!activeRoom && canWrite ? start : null}
          />
          {activeRoom &&
            !components.some((p) => p.room_id === activeRoom.id) && (
              <p>Ingen egen rompakke er valgt ennå.</p>
            )}
          {data.selection?.snapshot.format === "scoped-v1" && (
            <p className="bolig-choice-total">
              Samlet tilvalg for boligen:{" "}
              {money(data.selection.snapshot.total_cents)} inkl. mva.
            </p>
          )}
          {components.some(
            (p) =>
              rooms.find((r) => r.id === p.room_id)?.archived ||
              p.allocations?.some(
                (a) => rooms.find((r) => r.id === a.room_id)?.archived,
              ),
          ) && (
            <p role="alert">
              Vareinnhold er knyttet til et arkivert rom. Varene er beholdt i
              boliggrunnlaget. Kontroller dem før bestilling.
            </p>
          )}
        </>
      )}
      {notice && <p role="status">{notice}</p>}
      {error && data && !open && (
        <p role="alert">
          {error}{" "}
          <button type="button" onClick={load}>
            Hent siste pakkevalg
          </button>
        </p>
      )}
      {createPortal(
        <dialog
          ref={dialog}
          className="bolig-dialog bolig-package-choice-dialog"
          aria-label="Velg pakke og tilvalg"
          onCancel={(e) => {
            e.preventDefault();
            e.stopPropagation();
            close();
          }}
        >
          <header>
            <div>
              <small>
                {unit.number} · {label}
              </small>
              <h2>
                {proposal
                  ? "Se over pakkevalget"
                  : scope === "common"
                    ? "Fellespakke for boligen"
                    : "Pakke og tilvalg for rommet"}
              </h2>
            </div>
            <button
              type="button"
              aria-label="Lukk pakkevalg"
              disabled={busy}
              onClick={close}
            >
              <X size={20} />
            </button>
          </header>
          {draft && data && canWrite && (
            <>
              {data.selection &&
                data.selection.snapshot.format !== "scoped-v1" && (
                  <p className="bolig-notice">
                    Det tidligere boligvalget beholdes som fellespakke. Nye
                    rompakker kommer i tillegg. Se over samlet innhold før
                    lagring.
                  </p>
                )}
              {conflict && (
                <div role="alert">
                  <p>
                    Pakker, rom eller boligvalg er endret. Utkastet er beholdt.
                    Se over dagens innhold før du fortsetter.
                  </p>
                  <button
                    type="button"
                    disabled={busy || loading}
                    onClick={() =>
                      change({ ...draft, basis: packageChoiceBasis(data) })
                    }
                  >
                    Se over og bruk siste pakkegrunnlag
                  </button>
                </div>
              )}
              <div hidden={!!proposal}>
                <fieldset disabled={busy || loading || conflict}>
                  {draft.remove ? (
                    <p>
                      Pakken for «{label}» fjernes fra neste boligvalg.
                      Tidligere versjoner og bestillingsutkast beholdes.
                    </p>
                  ) : (
                    <>
                      {scope === "common" &&
                        current?.allocations?.length > 0 && (
                          <label className="bolig-option-choice">
                            <input
                              type="checkbox"
                              checked={!draft.clear_allocations}
                              onChange={(e) =>
                                change({
                                  ...draft,
                                  clear_allocations: !e.target.checked,
                                })
                              }
                            />
                            Behold tidligere manuell romfordeling. Fjern
                            avhukingen for å la disse varene ligge felles i
                            boligen.
                          </label>
                        )}
                      <label>
                        Grunnpakke
                        <select
                          aria-label="Grunnpakke"
                          value={draft.package_id}
                          onChange={(e) =>
                            change({ ...draft, package_id: e.target.value })
                          }
                        >
                          <option value="">Velg grunnpakke</option>
                          {draft.package_id && !pkg && (
                            <option value={draft.package_id}>
                              Tidligere pakke – velg en aktiv pakke
                            </option>
                          )}
                          {data.packages
                            .filter((p) => !p.archived)
                            .map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                        </select>
                      </label>
                      {pkg && (
                        <>
                          <details>
                            <summary>Vis grunnvarer i {pkg.name}</summary>
                            <ul>
                              {pkg.lines.map((l) => (
                                <li key={l.key}>
                                  <ProductCard line={l} />
                                </li>
                              ))}
                            </ul>
                          </details>
                          <h4>Tilvalg for {label}</h4>
                          {data.options
                            .filter(
                              (o) =>
                                !o.archived || draft.option_ids.includes(o.id),
                            )
                            .map((o) => {
                              const b = optionBreakdown(o, pkg),
                                checked = draft.option_ids.includes(o.id);
                              return (
                                <label
                                  className="bolig-option-choice"
                                  key={o.id}
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    disabled={
                                      !checked &&
                                      (o.archived ||
                                        !b.compatible ||
                                        b.missingCredit)
                                    }
                                    onChange={(e) =>
                                      change({
                                        ...draft,
                                        option_ids: e.target.checked
                                          ? [...draft.option_ids, o.id]
                                          : draft.option_ids.filter(
                                              (id) => id !== o.id,
                                            ),
                                      })
                                    }
                                  />
                                  <ProductCard line={o}>
                                    <small>
                                      {o.replace_key
                                        ? "Alternativ til standardvare"
                                        : "Tillegg"}
                                      {!b.compatible
                                        ? " · passer ikke til pakken"
                                        : ""}
                                      {o.archived ? " · skjult" : ""}
                                    </small>
                                    <small>
                                      {b.missingCredit
                                        ? "Grunnsum mangler for fratrekk"
                                        : `${money(o.price_cents)} − ${money(b.deduction)} = ${money(b.net)} inkl. mva.`}
                                    </small>
                                  </ProductCard>
                                </label>
                              );
                            })}
                          <p className="bolig-choice-total">
                            Tilvalg her:{" "}
                            {money(
                              opts.reduce(
                                (s, o) => s + optionBreakdown(o, pkg).net,
                                0,
                              ),
                            )}{" "}
                            inkl. mva.
                          </p>
                        </>
                      )}
                    </>
                  )}
                </fieldset>
              </div>
              {proposal && (
                <>
                  <p>
                    Dette blir boliggrunnlaget etter lagring. Andre rom
                    beholdes. Hver varelinje hører til én pakke; separate
                    rompakker kan inneholde samme vare.
                  </p>
                  <PackageChoiceSummary
                    components={proposal.components}
                    rooms={rooms}
                  />
                  <p className="bolig-choice-total">
                    Samlet tilvalg: {money(proposal.total_cents)} inkl. mva. ·{" "}
                    {proposal.goods.length} varelinjer
                  </p>
                  <p>
                    Bestillingsutkastet beholdes og må gjennomgås mot det nye
                    boligvalget. Ingen bestilling eller kundeaksept sendes.
                  </p>
                  {scope === "common" && current?.allocations?.length > 0 && (
                    <p>
                      {draft.clear_allocations
                        ? "Tidligere manuell romfordeling fjernes. Varene beholdes i fellespakken."
                        : "Manuell romfordeling beholdes for uendrede fellesvarer. Endrede eller fjernede varer må kontrolleres i forhåndsvisningen."}
                    </p>
                  )}
                </>
              )}
              {invalid && (
                <p role="alert">
                  Velg en aktiv grunnpakke, og fjern tilvalg som ikke passer
                  eller erstatter samme standardvare.
                </p>
              )}
              {error && <p role="alert">{error}</p>}
              <footer>
                <button
                  type="button"
                  disabled={busy}
                  onClick={proposal ? () => setProposal(null) : close}
                >
                  {proposal ? "Tilbake til pakkevalg" : "Lukk og behold utkast"}
                </button>
                {proposal ? (
                  <button
                    type="button"
                    disabled={busy || loading || conflict || invalid}
                    onClick={() => transact("save")}
                  >
                    {busy ? "Lagrer …" : "Lagre pakkevalg"}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={busy || loading || conflict || invalid}
                    onClick={() => transact("preview")}
                  >
                    Forhåndsvis pakkevalg
                  </button>
                )}
              </footer>
              <details>
                <summary>Flere handlinger</summary>
                {current && (
                  <button
                    type="button"
                    disabled={
                      busy ||
                      loading ||
                      conflict ||
                      !!rooms.find((r) => r.id === scope)?.archived
                    }
                    onClick={() => change({ ...draft, remove: !draft.remove })}
                  >
                    {draft.remove ? "Behold pakken" : "Fjern pakken herfra"}
                  </button>
                )}
                <button
                  type="button"
                  disabled={busy || loading}
                  onClick={() => {
                    clearBoligDraft(keyFor(scope));
                    setDraft({
                      package_id: current?.package.id || "",
                      option_ids: current?.options.map((o) => o.id) || [],
                      remove: !!rooms.find((r) => r.id === scope)?.archived,
                      basis: packageChoiceBasis(data),
                    });
                    setProposal(null);
                    setError("");
                  }}
                >
                  Forkast pakkeutkast
                </button>
              </details>
            </>
          )}
          {!canWrite && <p>Pakkevalg krever prosjektledertilgang.</p>}
          <button type="button" disabled={busy || loading} onClick={load}>
            Hent siste pakkevalg
          </button>
        </dialog>,
        document.body,
      )}
    </section>
  );
}
