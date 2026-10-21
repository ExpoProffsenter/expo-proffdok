import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Bath,
  Droplets,
  DoorOpen,
  Settings2,
  Plus,
  Pencil,
  Archive,
  RotateCcw,
  X,
  Layers3,
} from "lucide-react";
import BoligPackageChoices from "./BoligPackageChoices.jsx";
import BoligRoomContent from "./BoligRoomContent.jsx";
import { boligRoomsRpc } from "./boligRoomsClient.js";
import {
  boligDraftKey,
  readBoligDraft,
  writeBoligDraft,
  clearBoligDraft,
} from "./boligClient.js";
import { useBoligUiState } from "./boligUiState.js";

const types = [
  { id: "bathroom", label: "Bad", icon: Bath },
  { id: "laundry", label: "Vaskerom", icon: Droplets },
  { id: "wc", label: "WC", icon: DoorOpen },
  { id: "technical", label: "Teknisk rom", icon: Settings2 },
  { id: "other", label: "Annet rom", icon: Layers3 },
];
const roomType = (id) => types.find((t) => t.id === id) || types[4];
// Server validates room IDs before a remembered pointer can reveal content.
export default function BoligRooms({
  context,
  root,
  unit,
  onOpenCatalog = null,
}) {
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [open, setOpen] = useState(false),
    [draft, setDraft] = useState(null),
    [confirmArchive, setConfirmArchive] = useState(false),
    [blocked, setBlocked] = useState(false);
  const [selected, select] = useBoligUiState(context, `room:${unit.id}`, "all");
  const dialog = useRef(null),
    opener = useRef(null),
    generation = useRef(0),
    alive = useRef(true),
    mutation = useRef(false),
    dirty = useRef(false),
    draftRef = useRef(null);
  const draftKey = boligDraftKey(context, root.id, `rooms-${unit.id}`);
  const editable =
    context.role === "manager" &&
    data?.context?.role === "manager" &&
    !root.archived &&
    !data?.root_archived &&
    !blocked;
  const load = useCallback(async () => {
    // A focus read must not overtake an in-flight write and erase its result.
    if (mutation.current) return;
    const ticket = ++generation.current;
    try {
      const next = await boligRoomsRpc(context, root.id, unit.id);
      if (alive.current && ticket === generation.current) {
        setData(next);
        setBlocked(false);
        setError("");
      }
    } catch (e) {
      if (!alive.current || ticket !== generation.current) return;
      if (e.code === "42501") {
        setData(null);
        setBlocked(true);
        setOpen(false);
      }
      setError(e.message);
    }
  }, [context.user_id, context.company_id, root.id, unit.id]);
  useEffect(() => {
    alive.current = true;
    load();
    const visible = () => {
      if (document.visibilityState !== "hidden") load();
    };
    window.addEventListener("focus", load);
    window.addEventListener("expo-proffdok-bolig-catalog", load);
    document.addEventListener("visibilitychange", visible);
    return () => {
      alive.current = false;
      ++generation.current;
      window.removeEventListener("focus", load);
      window.removeEventListener("expo-proffdok-bolig-catalog", load);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [load]);
  useEffect(() => {
    if (open) dialog.current?.showModal();
    else if (dialog.current?.open) {
      dialog.current.close();
      opener.current?.focus({ preventScroll: true });
    }
  }, [open]);
  const updateDraft = (next) => {
    dirty.current = true;
    draftRef.current = next;
    setDraft(next);
    const secured = writeBoligDraft(draftKey, next);
    if (!secured)
      setError(
        "Kladden kunne ikke sikres lokalt. Behold siden åpen og prøv igjen.",
      );
    return secured;
  };
  const close = () => {
    if (!mutation.current) {
      setOpen(false);
      setConfirmArchive(false);
      if (!dirty.current) {
        draftRef.current = null;
        setDraft(null);
      }
    }
  };
  const start = (entry, button) => {
    opener.current = button;
    setError("");
    setNotice("");
    setConfirmArchive(false);
    const cached = draftRef.current || readBoligDraft(draftKey, null);
    // Never silently replace an unsent editor with another room.
    if (cached && (cached.id !== entry?.id || cached.isNew)) {
      draftRef.current = cached;
      setDraft(cached);
      dirty.current = true;
      setNotice(
        "Du har et romutkast. Fullfør det eller velg Forkast romutkast før du åpner et annet rom.",
      );
    } else if (cached) {
      draftRef.current = cached;
      setDraft(cached);
      dirty.current = true;
    } else {
      const type = "bathroom",
        base = roomType(type).label;
      let n = 1;
      while (
        data.rooms.some(
          (r) =>
            !r.archived &&
            r.name.toLocaleLowerCase("nb") ===
              `${base} ${n}`.toLocaleLowerCase("nb"),
        )
      )
        n++;
      const next = entry
        ? { ...entry, isNew: false, basis: data.revision }
        : {
            id: crypto.randomUUID(),
            type,
            name: `${base} ${n}`,
            floor: "",
            isNew: true,
            basis: data.revision,
          };
      draftRef.current = next;
      setDraft(next);
      dirty.current = false;
    }
    setOpen(true);
  };
  const save = async (action, payload, revision) => {
    if (mutation.current) return;
    mutation.current = true;
    ++generation.current;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const next = await boligRoomsRpc(
        context,
        root.id,
        unit.id,
        action,
        revision,
        payload,
      );
      if (!alive.current) return;
      setData(next);
      select(action === "archive" && payload.archived ? "all" : payload.id);
      clearBoligDraft(draftKey);
      draftRef.current = null;
      setDraft(null);
      dirty.current = false;
      setOpen(false);
      setConfirmArchive(false);
      setNotice(
        action === "archive"
          ? payload.archived
            ? "Rommet er arkivert. Historikken er beholdt."
            : "Rommet er gjenopprettet."
          : "Rommet er lagret i boligen.",
      );
    } catch (e) {
      if (!alive.current) return;
      if (e.code === "42501") {
        setData(null);
        setBlocked(true);
        setOpen(false);
      }
      setError(
        e.message ||
          "Lagring kunne ikke bekreftes. Hent siste romoversikt før du prøver igjen.",
      );
    } finally {
      mutation.current = false;
      if (alive.current) setBusy(false);
    }
  };
  const rooms = data?.rooms.filter((r) => !r.archived) || [],
    archived = data?.rooms.filter((r) => r.archived) || [];
  const active = rooms.find((r) => r.id === selected),
    hasConflict = !!draft && draft.basis !== data?.revision;
  const discard = () => {
    clearBoligDraft(draftKey);
    draftRef.current = null;
    setDraft(null);
    dirty.current = false;
    setOpen(false);
    setNotice("Romutkastet er forkastet.");
  };
  return (
    <section className="bolig-rooms" aria-label="Rom i boligen">
      <header className="bolig-rooms-heading">
        <div>
          <small>BOLIGENS ROM</small>
          <h4>
            Rom og oversikt <span>{rooms.length}</span>
          </h4>
        </div>
        {editable && (
          <button
            type="button"
            className="bolig-room-add"
            disabled={busy}
            onClick={(e) => start(null, e.currentTarget)}
          >
            <Plus size={16} />
            Legg til rom
          </button>
        )}
      </header>
      {!data ? (
        <p role="status">
          {error || "Henter rom …"}{" "}
          {error && (
            <button type="button" onClick={load}>
              Prøv igjen
            </button>
          )}
        </p>
      ) : (
        <>
          <label className="bolig-room-select">
            Vis rom
            <select
              value={active?.id || "all"}
              onChange={(e) => {
                select(e.target.value);
                setConfirmArchive(false);
              }}
            >
              <option value="all">Alle rom ({rooms.length})</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>
          {active ? (
            <div className="bolig-room-detail">
              <span className="bolig-room-icon">
                {React.createElement(roomType(active.type).icon, { size: 25 })}
              </span>
              <div>
                <h5>{active.name}</h5>
                <p>
                  {roomType(active.type).label}
                  {active.floor ? ` · ${active.floor}` : ""}
                </p>
              </div>
              {editable && (
                <button
                  type="button"
                  aria-label={`Rediger ${active.name}`}
                  onClick={(e) => start(active, e.currentTarget)}
                >
                  <Pencil size={15} />
                  Rediger rom
                </button>
              )}
            </div>
          ) : rooms.length ? (
            <div className="bolig-room-grid">
              {rooms.map((r) => {
                const Icon = roomType(r.type).icon;
                return (
                  <button type="button" key={r.id} onClick={() => select(r.id)}>
                    <Icon size={20} />
                    <span>
                      <strong>{r.name}</strong>
                      <small>{r.floor || roomType(r.type).label}</small>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="bolig-rooms-empty">
              <Bath size={26} />
              <div>
                <strong>Hvilke rom har boligen?</strong>
                <p>
                  Legg til bad, vaskerom eller andre rom. Du trenger ingen
                  plantegning.
                </p>
              </div>
            </div>
          )}
          <BoligPackageChoices
            key={unit.id + ":packages:" + context.role}
            onOpenCatalog={onOpenCatalog}
            context={context}
            root={root}
            unit={unit}
            activeRoom={active}
            roomsRevision={data.revision}
          />
          <BoligRoomContent
            key={unit.id + ":" + context.role}
            context={context}
            root={root}
            unit={unit}
            activeRoom={active}
            roomsRevision={data.revision}
          />
          {!!archived.length && (
            <details className="bolig-room-archive">
              <summary>Arkiverte rom ({archived.length})</summary>
              {archived.map((r) => (
                <div key={r.id}>
                  <span>{r.name}</span>
                  {editable && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        save(
                          "archive",
                          { id: r.id, archived: false },
                          data.revision,
                        )
                      }
                    >
                      <RotateCcw size={14} />
                      Gjenopprett
                    </button>
                  )}
                </div>
              ))}
            </details>
          )}
          {error && !open && (
            <p role="alert">
              {error}{" "}
              <button type="button" disabled={busy} onClick={load}>
                Hent siste romoversikt
              </button>
            </p>
          )}
        </>
      )}
      {notice && !open && <p role="status">{notice}</p>}
      {createPortal(
        <dialog
          ref={dialog}
          className="bolig-dialog bolig-room-dialog"
          aria-label={draft?.isNew ? "Legg til rom" : "Rediger rom"}
          onCancel={(e) => {
            e.preventDefault();
            e.stopPropagation();
            close();
          }}
        >
          <header>
            <div>
              <small>{unit.number} · ROMOPPSETT</small>
              <h2>{draft?.isNew ? "Legg til rom" : "Rediger rom"}</h2>
            </div>
            <button
              type="button"
              disabled={busy}
              aria-label="Lukk romoppsett"
              onClick={close}
            >
              <X size={20} />
            </button>
          </header>
          {draft && data && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editable && !hasConflict) {
                  // Persist the stable ID even when the suggested name was unchanged.
                  if (!updateDraft(draft)) return;
                  save(
                    "save",
                    {
                      id: draft.id,
                      type: draft.type,
                      name: draft.name,
                      floor: draft.floor,
                    },
                    draft.basis,
                  );
                }
              }}
            >
              <p>Velg romtype og gi rommet et tydelig navn.</p>
              {notice && <p role="status">{notice}</p>}
              {hasConflict && (
                <div className="bolig-room-conflict" role="alert">
                  <strong>Romoversikten er endret.</strong>
                  <p>
                    Utkastet er beholdt. Se over siste oversikt før du bruker
                    det nye grunnlaget.
                  </p>
                  <ul>
                    {data.rooms
                      .filter((r) => !r.archived)
                      .map((r) => (
                        <li key={r.id}>
                          {r.name}
                          {r.floor ? ` · ${r.floor}` : ""}
                        </li>
                      ))}
                  </ul>
                  <button
                    type="button"
                    disabled={
                      busy ||
                      (!draft.isNew && !rooms.some((r) => r.id === draft.id))
                    }
                    onClick={() =>
                      updateDraft({ ...draft, basis: data.revision })
                    }
                  >
                    Bruk siste grunnlag
                  </button>
                  {!draft.isNew && !rooms.some((r) => r.id === draft.id) && (
                    <p>
                      Rommet er arkivert. Lukk utkastet og gjenopprett rommet
                      fra oversikten.
                    </p>
                  )}
                </div>
              )}
              <fieldset disabled={busy || !editable}>
                <legend>Romtype</legend>
                <div className="bolig-room-types">
                  {types.map(({ id, label, icon: Icon }) => (
                    <button
                      type="button"
                      key={id}
                      aria-pressed={draft.type === id}
                      onClick={() => {
                        let n = 1;
                        while (
                          rooms.some(
                            (r) =>
                              r.id !== draft.id &&
                              r.name.toLocaleLowerCase("nb") ===
                                `${label} ${n}`.toLocaleLowerCase("nb"),
                          )
                        )
                          n++;
                        updateDraft({
                          ...draft,
                          type: id,
                          name:
                            draft.isNew &&
                            (!dirty.current ||
                              types.some((t) =>
                                new RegExp(`^${t.label} \\d+$`).test(
                                  draft.name,
                                ),
                              ))
                              ? `${label} ${n}`
                              : draft.name,
                        });
                      }}
                    >
                      <Icon size={21} />
                      {label}
                    </button>
                  ))}
                </div>
                <label>
                  Romnavn
                  <input
                    required
                    maxLength={80}
                    value={draft.name}
                    onChange={(e) =>
                      updateDraft({ ...draft, name: e.target.value })
                    }
                  />
                </label>
                <label>
                  Etasje i boligen (valgfritt)
                  <input
                    maxLength={40}
                    placeholder="For eksempel 1. etasje eller kjeller"
                    value={draft.floor}
                    onChange={(e) =>
                      updateDraft({ ...draft, floor: e.target.value })
                    }
                  />
                  <small>Brukes hvis boligen går over flere etasjer.</small>
                </label>
              </fieldset>
              {error && (
                <p role="alert">
                  {error}{" "}
                  <button type="button" disabled={busy} onClick={load}>
                    Hent siste romoversikt
                  </button>
                </p>
              )}
              <footer>
                <button type="button" disabled={busy} onClick={close}>
                  Lukk og behold utkast
                </button>
                <button
                  type="submit"
                  disabled={busy || !editable || hasConflict}
                >
                  {busy ? "Lagrer …" : "Lagre rom"}
                </button>
              </footer>
              <details className="bolig-room-more">
                <summary>Flere handlinger</summary>
                <button type="button" disabled={busy} onClick={discard}>
                  Forkast romutkast
                </button>
                {!draft.isNew && editable && (
                  <button
                    type="button"
                    disabled={busy || hasConflict}
                    onClick={() => setConfirmArchive(true)}
                  >
                    <Archive size={14} />
                    Arkiver rom
                  </button>
                )}
                {confirmArchive && (
                  <div role="alert">
                    <p>
                      Arkiver «{draft.name}»? Rommet skjules fra romvalget.
                      Historikken beholdes, og rommet kan gjenopprettes.
                    </p>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        save(
                          "archive",
                          { id: draft.id, archived: true },
                          draft.basis,
                        )
                      }
                    >
                      Bekreft arkivering
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => setConfirmArchive(false)}
                    >
                      Behold rommet
                    </button>
                  </div>
                )}
              </details>
            </form>
          )}
        </dialog>,
        document.body,
      )}
    </section>
  );
}
