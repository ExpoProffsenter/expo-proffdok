import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Package, Plus, Trash2, X } from "lucide-react";
import { getAppSupabaseClient } from "../access/appSupabaseClientRegistry.js";
import {
  boligDraftKey,
  readBoligDraft,
  writeBoligDraft,
  clearBoligDraft,
} from "./boligClient.js";
import ProductCard from "./BoligProductCard.jsx";

export async function roomContentRpc(
  context,
  rootId,
  unitId,
  action = "get",
  revision = null,
  payload = {},
) {
  const client = getAppSupabaseClient();
  if (!client) throw Error("Appens innlogging er ikke klar.");
  const request = client.rpc("bolig_room_content", {
    p_company_id: context.company_id,
    p_root_id: rootId,
    p_unit_id: unitId,
    p_action: action,
    p_revision: revision,
    p_payload: payload,
  });
  const { data, error } = await (typeof request.retry === "function"
    ? request.retry(false)
    : request);
  if (error)
    throw Object.assign(new Error(error.message), { code: error.code });
  if (
    data?.context?.user_id !== context.user_id ||
    data?.context?.company_id !== context.company_id ||
    data?.root_id !== rootId ||
    data?.unit_id !== unitId
  )
    throw Object.assign(new Error("Firma eller bolig er endret."), {
      code: "42501",
    });
  return data;
}
const basisOf = (data) => ({
  content_revision: data.content?.revision || 0,
  choice_revision: data.selection?.revision || 0,
  rooms_revision: data.revision,
});
const sameBasis = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const rounded = (n) => Math.round(n * 1000) / 1000;
export function allocationError(allocations, goods, rooms) {
  const pairs = new Set(),
    totals = new Map();
  for (const a of allocations) {
    const qty = Number(a.quantity),
      key = `${a.position}:${a.room_id}`;
    if (
      !goods[a.position] ||
      !rooms.some((r) => r.id === a.room_id && !r.archived)
    )
      return "Velg et aktivt rom for hver vareandel.";
    if (
      !Number.isFinite(qty) ||
      qty <= 0 ||
      qty > 10000 ||
      rounded(qty) !== qty
    )
      return "Skriv et antall større enn 0 med inntil tre desimaler.";
    if (pairs.has(key)) return "Samme vare og rom kan bare stå én gang.";
    pairs.add(key);
    totals.set(a.position, rounded((totals.get(a.position) || 0) + qty));
  }
  if ([...totals].some(([p, n]) => n > Number(goods[p].quantity)))
    return "Fordelt antall kan ikke overstige antallet i boligvalget.";
  return "";
}
function AllocationSummary({ allocations, goods, rooms, roomId = null }) {
  const groups = [
    ...rooms
      .filter((r) => !roomId || r.id === roomId)
      .map((r) => ({
        ...r,
        items: allocations
          .filter((a) => a.room_id === r.id)
          .map((a) => ({ ...goods[a.position], quantity: a.quantity })),
      })),
    ...(!roomId
      ? [
          {
            id: "unassigned",
            name: "Ikke fordelt",
            items: goods
              .map((g, p) => ({
                ...g,
                quantity: rounded(
                  Number(g.quantity) -
                    allocations
                      .filter((a) => a.position === p)
                      .reduce((s, a) => s + Number(a.quantity), 0),
                ),
              }))
              .filter((g) => g.quantity > 0),
          },
        ]
      : []),
  ];
  return (
    <div className="bolig-allocation-summary">
      {groups
        .filter((g) => g.items.length)
        .map((g) => (
          <section key={g.id}>
            <h5>
              {g.name}
              {g.archived ? " · arkivert rom" : ""}
            </h5>
            <ul>
              {g.items.map((item, i) => (
                <li key={i}>
                  <ProductCard line={item} />
                </li>
              ))}
            </ul>
          </section>
        ))}
    </div>
  );
}
export default function BoligRoomContent({
  context,
  root,
  unit,
  activeRoom = null,
  roomsRevision,
}) {
  const [data, setData] = useState(null),
    [draft, setDraft] = useState(null),
    [open, setOpen] = useState(false),
    [preview, setPreview] = useState(false),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const dialog = useRef(null),
    trigger = useRef(null),
    generation = useRef(0),
    operation = useRef(false),
    draftRef = useRef(null),
    dirty = useRef(false);
  const draftKey = boligDraftKey(context, root.id, `room-content-${unit.id}`);
  const load = useCallback(async () => {
    if (operation.current) return;
    const ticket = ++generation.current;
    setLoading(true);
    try {
      const value = await roomContentRpc(context, root.id, unit.id);
      if (ticket !== generation.current) return;
      setData(value);
      setError("");
      if (!draftRef.current) {
        const cached = readBoligDraft(draftKey, null);
        const next = cached || {
          basis: basisOf(value),
          allocations:
            value.content &&
            value.selection &&
            value.content.source_choice_revision === value.selection.revision
              ? value.content.allocations.map(
                  ({ position, room_id, quantity }) => ({
                    position,
                    room_id,
                    quantity,
                  }),
                )
              : [],
        };
        dirty.current = !!cached;
        draftRef.current = next;
        setDraft(next);
      } else if (!dirty.current) {
        const next = {
          basis: basisOf(value),
          allocations:
            value.content &&
            value.selection &&
            value.content.source_choice_revision === value.selection.revision
              ? value.content.allocations.map(
                  ({ position, room_id, quantity }) => ({
                    position,
                    room_id,
                    quantity,
                  }),
                )
              : [],
        };
        draftRef.current = next;
        setDraft(next);
      }
    } catch (e) {
      if (ticket !== generation.current) return;
      if (e.code === "42501") {
        setData(null);
        setOpen(false);
      }
      setError(e.message);
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
    draftKey,
  ]);
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
    window.addEventListener("focus", load);
    window.addEventListener("expo-proffdok-bolig-catalog", load);
    document.addEventListener("visibilitychange", visible);
    return () => {
      ++generation.current;
      window.removeEventListener("focus", load);
      window.removeEventListener("expo-proffdok-bolig-catalog", load);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [load, roomsRevision, context.enabled]);
  useEffect(() => {
    if (open) dialog.current?.showModal();
    else if (dialog.current?.open) {
      dialog.current.close();
      trigger.current?.focus({ preventScroll: true });
    }
  }, [open]);
  const change = (next) => {
    draftRef.current = next;
    setDraft(next);
    dirty.current = true;
    setPreview(false);
    if (!writeBoligDraft(draftKey, next))
      setError(
        "Utkastet kunne ikke sikres lokalt. Behold siden åpen og prøv igjen.",
      );
  };
  const canWrite =
    !!data &&
    context.enabled &&
    context.role === "manager" &&
    data.context.role === "manager" &&
    !root.archived &&
    !data.root_archived;
  const goods = data?.selection?.snapshot.goods || [],
    rooms = data?.rooms || [];
  const stale =
    !!data?.content &&
    data.content.source_choice_revision !== data.selection?.revision;
  const saved = stale ? [] : data?.content?.allocations || [];
  const conflict = !!draft && !!data && !sameBasis(draft.basis, basisOf(data));
  const validation = draft
    ? allocationError(draft.allocations, goods, rooms)
    : "";
  const close = () => {
    if (!operation.current) {
      setOpen(false);
      setPreview(false);
    }
  };
  const save = async () => {
    if (
      !canWrite ||
      loading ||
      operation.current ||
      conflict ||
      validation ||
      !preview
    )
      return;
    if (!writeBoligDraft(draftKey, draft)) {
      setError(
        "Utkastet kunne ikke sikres lokalt. Lagring er stoppet. Prøv igjen.",
      );
      return;
    }
    operation.current = true;
    ++generation.current;
    setBusy(true);
    setError("");
    const ticket = generation.current;
    try {
      const value = await roomContentRpc(
        context,
        root.id,
        unit.id,
        "save",
        draft.basis.content_revision,
        {
          choice_revision: draft.basis.choice_revision,
          rooms_revision: draft.basis.rooms_revision,
          allocations: draft.allocations.map((a) => ({
            ...a,
            quantity: Number(a.quantity),
          })),
        },
      );
      if (ticket !== generation.current) return;
      setData(value);
      clearBoligDraft(draftKey);
      dirty.current = false;
      const next = {
        basis: basisOf(value),
        allocations: value.content.allocations.map(
          ({ position, room_id, quantity }) => ({
            position,
            room_id,
            quantity,
          }),
        ),
      };
      draftRef.current = next;
      setDraft(next);
      setOpen(false);
      setPreview(false);
      setNotice(
        "Romfordelingen er lagret. Boligvalg og bestillingsutkast er beholdt.",
      );
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
  const start = () => {
    setNotice("");
    setPreview(false);
    setOpen(true);
  };
  if (!context.enabled)
    return <p>Rominnhold er ikke tilgjengelig i aktivt firma.</p>;
  if (data?.selection?.snapshot.format === "scoped-v1") return null;
  return (
    <section className="bolig-room-content" aria-label="Vareinnhold på rom">
      <header>
        <div>
          <small>GRUNNPAKKE OG TILVALGSPAKKER</small>
          <h4>
            {activeRoom ? `Innhold i ${activeRoom.name}` : "Vareinnhold på rom"}
          </h4>
        </div>
        {canWrite && data.selection && (
          <button
            ref={trigger}
            type="button"
            className="bolig-create-action"
            disabled={loading || busy}
            onClick={start}
          >
            <Package size={16} />
            {activeRoom ? "Legg innhold på rommet" : "Fordel varer på rom"}
          </button>
        )}
      </header>
      {loading && !data ? (
        <p role="status">Henter vareinnhold …</p>
      ) : !data?.selection ? (
        <p>
          Velg og lagre en fellespakke eller rompakke i «Rompakker og
          fellespakke». Varene følger deretter riktig bolig og rom.
        </p>
      ) : (
        <>
          {stale && (
            <p role="status">
              Boligvalget er endret. Tidligere romfordeling er beholdt i
              historikken. Se over varene og lagre en ny fordeling.
            </p>
          )}
          {saved.some(
            (a) => rooms.find((r) => r.id === a.room_id)?.archived,
          ) && (
            <p role="alert">
              Noen varer ligger på et arkivert rom. Flytt dem til et aktivt rom
              eller fjern fordelingen.
            </p>
          )}
          <AllocationSummary
            allocations={saved}
            goods={goods}
            rooms={rooms}
            roomId={activeRoom?.id}
          />
          {activeRoom && !saved.some((a) => a.room_id === activeRoom.id) && (
            <p>Ingen varer er fordelt til dette rommet ennå.</p>
          )}
          <p className="bolig-room-note">
            Fordel antallet fra boligvalget. Fordelingen endrer ikke pris eller
            bestillingsutkast.
          </p>
        </>
      )}
      {notice && <p role="status">{notice}</p>}
      {error && !open && (
        <p role="alert">
          {error}{" "}
          <button type="button" onClick={load}>
            Hent siste varegrunnlag
          </button>
        </p>
      )}
      {createPortal(
        <dialog
          ref={dialog}
          className="bolig-dialog bolig-allocation-dialog"
          aria-label="Fordel varer på rom"
          onCancel={(e) => {
            e.preventDefault();
            e.stopPropagation();
            close();
          }}
        >
          <header>
            <div>
              <small>{unit.number} · VAREINNHOLD</small>
              <h2>
                {preview ? "Se over romfordelingen" : "Fordel varer på rom"}
              </h2>
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={close}
              aria-label="Lukk romfordeling"
            >
              <X size={20} />
            </button>
          </header>
          {data && draft && canWrite && (
            <>
              <p>
                Varene kommer fra det lagrede boligvalget. Del antallet mellom
                rom ved behov. Resten blir «Ikke fordelt».
              </p>
              {conflict && (
                <div role="alert">
                  <p>
                    Grunnlaget er endret. Utkastet er beholdt. Kontroller siste
                    rom og boligvalg før du fortsetter.
                  </p>
                  {draft.basis.choice_revision === data.selection?.revision ? (
                    <button
                      type="button"
                      disabled={busy || loading}
                      onClick={() => change({ ...draft, basis: basisOf(data) })}
                    >
                      Se over og bruk siste romgrunnlag
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={busy || loading}
                      onClick={() =>
                        change({ basis: basisOf(data), allocations: [] })
                      }
                    >
                      Start ny fordeling med siste boligvalg
                    </button>
                  )}
                </div>
              )}
              <div hidden={preview}>
                <fieldset disabled={busy || loading || conflict}>
                  {goods.map((g, position) => {
                    const used = rounded(
                      draft.allocations
                        .filter((a) => a.position === position)
                        .reduce((s, a) => s + Number(a.quantity || 0), 0),
                    );
                    return (
                      <article className="bolig-allocation-line" key={position}>
                        <ProductCard line={g} />
                        <p>
                          {used} av {g.quantity} {g.unit} fordelt
                        </p>
                        {draft.allocations.map((a, index) =>
                          a.position !== position ? null : (
                            <div
                              className="bolig-allocation-fields"
                              key={index}
                            >
                              <label>
                                Rom
                                <select
                                  aria-label={`Rom for vare ${position + 1}, andel ${index + 1}`}
                                  value={a.room_id}
                                  onChange={(e) =>
                                    change({
                                      ...draft,
                                      allocations: draft.allocations.map(
                                        (x, i) =>
                                          i === index
                                            ? { ...x, room_id: e.target.value }
                                            : x,
                                      ),
                                    })
                                  }
                                >
                                  {rooms.map((r) => (
                                    <option
                                      key={r.id}
                                      value={r.id}
                                      disabled={r.archived}
                                    >
                                      {r.name}
                                      {r.archived ? " · arkivert" : ""}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <label>
                                Antall
                                <input
                                  aria-label={`Antall for vare ${position + 1}, andel ${index + 1}`}
                                  type="number"
                                  min="0.001"
                                  max={g.quantity}
                                  step="0.001"
                                  value={a.quantity}
                                  onChange={(e) =>
                                    change({
                                      ...draft,
                                      allocations: draft.allocations.map(
                                        (x, i) =>
                                          i === index
                                            ? { ...x, quantity: e.target.value }
                                            : x,
                                      ),
                                    })
                                  }
                                />
                              </label>
                              <button
                                type="button"
                                aria-label={`Fjern andel ${index + 1} av vare ${position + 1}`}
                                onClick={() =>
                                  change({
                                    ...draft,
                                    allocations: draft.allocations.filter(
                                      (_, i) => i !== index,
                                    ),
                                  })
                                }
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ),
                        )}
                        <button
                          type="button"
                          disabled={
                            used >= Number(g.quantity) ||
                            !rooms.some(
                              (r) =>
                                !r.archived &&
                                !draft.allocations.some(
                                  (a) =>
                                    a.position === position &&
                                    a.room_id === r.id,
                                ),
                            )
                          }
                          onClick={() => {
                            const available = rooms.filter(
                              (r) =>
                                !r.archived &&
                                !draft.allocations.some(
                                  (a) =>
                                    a.position === position &&
                                    a.room_id === r.id,
                                ),
                            );
                            const room =
                              available.find((r) => r.id === activeRoom?.id) ||
                              available[0];
                            if (room)
                              change({
                                ...draft,
                                allocations: [
                                  ...draft.allocations,
                                  {
                                    position,
                                    room_id: room.id,
                                    quantity: rounded(
                                      Number(g.quantity) - used,
                                    ),
                                  },
                                ],
                              });
                          }}
                        >
                          <Plus size={14} />
                          Fordel vare {position + 1} til rom
                        </button>
                      </article>
                    );
                  })}
                </fieldset>
              </div>
              {preview && (
                <AllocationSummary
                  allocations={draft.allocations}
                  goods={goods}
                  rooms={rooms}
                />
              )}
              {validation && <p role="alert">{validation}</p>}
              {error && <p role="alert">{error}</p>}
              <footer>
                <button
                  type="button"
                  disabled={busy}
                  onClick={preview ? () => setPreview(false) : close}
                >
                  {preview ? "Tilbake til fordeling" : "Lukk og behold utkast"}
                </button>
                {preview ? (
                  <button
                    type="button"
                    disabled={busy || loading || conflict || !!validation}
                    onClick={save}
                  >
                    {busy ? "Lagrer …" : "Lagre romfordeling"}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={busy || loading || conflict || !!validation}
                    onClick={() => setPreview(true)}
                  >
                    Forhåndsvis romfordeling
                  </button>
                )}
              </footer>
              <details>
                <summary>Utkast og tidligere fordeling</summary>
                <p>
                  {data.content
                    ? `Siste fordeling: versjon ${data.content.revision}, fra boligvalg ${data.content.source_choice_revision}.`
                    : "Ingen romfordeling er lagret."}
                </p>
                <button
                  type="button"
                  disabled={busy || loading}
                  onClick={() => {
                    clearBoligDraft(draftKey);
                    dirty.current = false;
                    draftRef.current = null;
                    setDraft(null);
                    setPreview(false);
                    load();
                  }}
                >
                  Forkast fordelingsutkast
                </button>
              </details>
            </>
          )}
          {!canWrite && <p>Romfordeling krever prosjektledertilgang.</p>}
          <button type="button" disabled={busy || loading} onClick={load}>
            Hent siste varegrunnlag
          </button>
        </dialog>,
        document.body,
      )}
    </section>
  );
}
