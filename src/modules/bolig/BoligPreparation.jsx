import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Building2,
  Hash,
  Layers3,
  Plus,
  Trash2,
  X,
  Check,
  Eye,
  RefreshCw,
} from "lucide-react";
import {
  boligDraftKey,
  readBoligDraft,
  writeBoligDraft,
  clearBoligDraft,
} from "./boligClient.js";
import {
  preparationRpc,
  preparationUnits,
  suggestNumbers,
} from "./boligPreparationClient.js";
import { BUILDING_TYPES } from "./boligStructure.js";

const types = [
  ["bathroom", "Bad"],
  ["laundry", "Vaskerom"],
  ["wc", "WC"],
  ["technical", "Teknisk rom"],
  ["other", "Annet rom"],
];
const roomRow = (name = "Bad 1", type = "bathroom") => ({
  key: crypto.randomUUID(),
  type,
  name,
  floor: "",
  package_id: "",
});
const labels = {
  numbering: "Nummerer boliger",
  building: "Rediger bygg",
  template: "Rom og pakker til flere boliger",
};
const statuses = {
  ready: "Klar",
  skipped: "Beholdes",
  review: "Må vurderes",
  unchanged: "Uendret",
};

function TemplateRoom({ room, packageName, children }) {
  const [open, setOpen] = useState(!room.name);
  return (
    <details
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary>
        <b>{room.name || "Nytt rom"}</b>
        <span>{packageName || "Ingen rompakke"}</span>
      </summary>
      {children}
    </details>
  );
}

function PackageSelect({ value, onChange, packages, label }) {
  const missing = value && !packages.some((p) => p.id === value);
  return (
    <label>
      {label}
      <select
        aria-label={label}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Ingen pakke</option>
        {missing && (
          <option value={value}>
            Pakken er ikke tilgjengelig – velg på nytt
          </option>
        )}
        {packages.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} · {p.line_count} varer
          </option>
        ))}
      </select>
    </label>
  );
}

export default function BoligPreparation({ context, root, onChanged }) {
  const [open, setOpen] = useState(false),
    [kind, setKind] = useState("numbering"),
    [data, setData] = useState(null),
    [draft, setDraft] = useState(null),
    [preview, setPreview] = useState(null),
    [pending, setPending] = useState(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [blockId, setBlockId] = useState(""),
    [entranceId, setEntranceId] = useState(""),
    [search, setSearch] = useState(""),
    [page, setPage] = useState(0),
    [numbering, setNumbering] = useState({
      mode: "floor",
      prefix: "",
      start: 1,
      digits: 3,
      restart: true,
    });
  const dialog = useRef(null),
    opener = useRef(null),
    generation = useRef(0),
    operation = useRef(false),
    active = useRef(false),
    opening = useRef(false);
  const key = boligDraftKey(context, root.id, "preparation");
  const allowed =
    context.enabled && context.role === "manager" && !root.archived;
  const changed = useRef(onChanged);
  changed.current = onChanged;
  const persist = (nextDraft, nextPending = pending, nextKind = kind) => {
    if (
      !writeBoligDraft(key + ":" + nextKind, {
        draft: nextDraft,
        kind: nextKind,
      }) ||
      (nextPending &&
        !writeBoligDraft(key + ":pending", {
          draft: nextDraft,
          pending: nextPending,
          kind: nextKind,
        }))
    )
      throw Error(
        "Kladden kunne ikke sikres lokalt. Behold siden åpen og prøv igjen.",
      );
    if (!nextPending) clearBoligDraft(key + ":pending");
    setDraft(nextDraft);
    setPending(nextPending);
  };
  const load = useCallback(async () => {
    if (operation.current) return;
    const ticket = ++generation.current;
    const value = await preparationRpc(context, root.id);
    if (ticket !== generation.current || !active.current) return;
    if (
      value.context.role !== "manager" ||
      !value.context.enabled ||
      value.root.archived
    )
      throw Object.assign(
        new Error("Prosjektledertilgangen eller prosjektet er endret."),
        { code: "42501" },
      );
    setData(value);
    return value;
  }, [context.user_id, context.company_id, context.role, root.id]);
  useEffect(
    () => () => {
      active.current = false;
      generation.current++;
    },
    [],
  );
  useEffect(() => {
    if (!open) return;
    const focus = () => {
      if (!operation.current && !opening.current)
        load().catch((e) => {
          setError(e.message);
          if (e.code === "42501") {
            setData(null);
            setOpen(false);
          }
        });
    };
    const visibility = () => {
      if (document.visibilityState === "visible") focus();
    };
    window.addEventListener("focus", focus);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      window.removeEventListener("focus", focus);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [open, load]);
  useEffect(() => {
    if (open && allowed) dialog.current?.showModal?.();
    else {
      dialog.current?.close?.();
      opener.current?.focus({ preventScroll: true });
    }
  }, [open, allowed]);
  const launch = async (nextKind, event) => {
    opener.current = event.currentTarget;
    active.current = true;
    opening.current = true;
    setOpen(true);
    setBusy(true);
    setError("");
    setNotice("");
    setPreview(null);
    setData(null);
    setDraft(null);
    setPending(null);
    setKind(nextKind);
    try {
      const value = await load();
      if (!value) return;
      const saved =
        readBoligDraft(key + ":pending", null) ||
        readBoligDraft(key + ":" + nextKind, null);
      if (saved?.pending) {
        setKind(saved.kind);
        setDraft(saved.draft);
        setPending(saved.pending);
        setNotice(
          "Et tidligere lagringsforsøk mangler kvittering. Kontroller det før du fortsetter.",
        );
      } else {
        setKind(nextKind);
        setPending(null);
        setDraft(saved?.kind === nextKind ? saved.draft : null);
      }
    } catch (e) {
      setError(e.message);
      if (e.code === "42501") {
        setData(null);
        setOpen(false);
      }
    } finally {
      opening.current = false;
      if (active.current) setBusy(false);
    }
  };
  const close = () => {
    if (busy) return;
    active.current = false;
    generation.current++;
    setOpen(false);
    setPreview(null);
  };
  const edit = (value) => {
    try {
      persist({ ...value, _basis: value._basis || data.basis });
      setPreview(null);
      setError("");
      setNotice("");
    } catch (e) {
      setError(e.message);
    }
  };
  const units = preparationUnits(data),
    filtered = units.filter(
      (u) =>
        (!blockId || u.block.id === blockId) &&
        (!entranceId || u.entrance_id === entranceId) &&
        (!search ||
          `${u.number} ${u.entrance.address || "Adresse legges til senere"} ${u.block.name}`
            .toLocaleLowerCase("nb")
            .includes(search.toLocaleLowerCase("nb"))),
    );
  const perPage = 12,
    pages = Math.max(1, Math.ceil(filtered.length / perPage)),
    shown = filtered.slice(
      Math.min(page, pages - 1) * perPage,
      (Math.min(page, pages - 1) + 1) * perPage,
    );
  const stale = draft
    ? JSON.stringify(draft._basis) !== JSON.stringify(data?.basis)
    : false;
  const unitOrder = new Map(units.map((unit, index) => [unit.id, index]));
  const previewRows = [...(preview?.proposal || [])].sort(
    (a, b) => (unitOrder.get(a.id) ?? 0) - (unitOrder.get(b.id) ?? 0),
  );
  const chooseBuilding = (id) => {
    const b = data.blocks.find((b) => b.id === id),
      e = data.entrances.find((e) => e.block_id === id && !e.archived);
    if (!b || !e) return;
    edit({
      id: b.id,
      name: b.name,
      address: b.address || e.address,
      building_type: b.building_type || "apartment",
      house_floors: b.house_floors || 2,
      entrance_id: e.id,
      entrance_address: e.address,
      counts: e.counts,
      _basis: data.basis,
    });
  };
  const newTemplate = () =>
    edit({
      id: crypto.randomUUID(),
      name: "",
      definition: { rooms: [roomRow()], common_package_id: "" },
      unit_ids: [],
      include_existing: false,
      _basis: data.basis,
    });
  const updateRoom = (key, patch) =>
    edit({
      ...draft,
      definition: {
        ...draft.definition,
        rooms: draft.definition.rooms.map((r) =>
          r.key === key ? { ...r, ...patch } : r,
        ),
      },
    });
  const operationPayload = () => {
    if (!draft) throw Error("Fyll inn oppsettet først.");
    const { _basis, ...values } = draft;
    return { kind, basis: _basis, data: values };
  };
  const run = async (action) => {
    if (operation.current) return;
    operation.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    let confirmed = false;
    try {
      let envelope = pending || {
        ...operationPayload(),
        intent: action,
        ...(action === "preview" ? {} : { request_id: crypto.randomUUID() }),
      };
      if (action !== "preview") persist(draft, envelope);
      const result = await preparationRpc(context, root.id, action, envelope);
      if (!active.current) return;
      if (action === "preview") {
        setPreview(result);
        return;
      }
      if (result.receipt?.request_id !== envelope.request_id)
        throw Error("Mangler kvittering. Kontroller samme lagringsforsøk.");
      confirmed = true;
      clearBoligDraft(key + ":" + kind);
      clearBoligDraft(key + ":pending");
      setPending(null);
      setPreview(null);
      setDraft(null);
      setNotice(
        action === "template_save"
          ? "Rommalen er lagret i prosjektet. Velg malen for å tildele den til boliger."
          : `Lagret. ${result.receipt.affected} ${kind === "building" ? "bygg" : "boliger"} oppdatert. Tidligere valg og bestillingsutkast er beholdt.`,
      );
      window.dispatchEvent(
        new CustomEvent("expo-proffdok-bolig-catalog", {
          detail: { root_id: root.id },
        }),
      );
      operation.current = false;
      await load();
      await changed.current?.();
    } catch (e) {
      if (!active.current) return;
      setError(e.message);
      if (!confirmed && ["PT409", "22023", "23505", "42501"].includes(e.code)) {
        setPreview(null);
        try {
          persist(draft, null);
        } catch (localError) {
          setError(e.message + " " + localError.message);
        }
      }
      if (e.code === "42501") {
        setData(null);
        setOpen(false);
        active.current = false;
      }
    } finally {
      operation.current = false;
      if (active.current) setBusy(false);
    }
  };
  const controls = (
    <div className="bolig-preparation-filters">
      <label>
        Bygg
        <select
          aria-label="Bygg"
          value={blockId}
          onChange={(e) => {
            setBlockId(e.target.value);
            setEntranceId("");
            setPage(0);
          }}
        >
          <option value="">Alle bygg</option>
          {data?.blocks
            .filter((b) => !b.archived)
            .map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
        </select>
      </label>
      <label>
        Oppgang
        <select
          aria-label="Oppgang"
          value={entranceId}
          onChange={(e) => {
            setEntranceId(e.target.value);
            setPage(0);
          }}
        >
          <option value="">Alle oppganger</option>
          {data?.entrances
            .filter((e) => !e.archived && (!blockId || e.block_id === blockId))
            .map((e) => (
              <option key={e.id} value={e.id}>
                {e.address || "Adresse legges til senere"}
              </option>
            ))}
        </select>
      </label>
      <label>
        Søk etter bolig
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          placeholder="Nummer eller adresse"
        />
      </label>
    </div>
  );
  const pager = (
    <div className="bolig-preparation-pager">
      <span>
        {filtered.length} boliger · Side {Math.min(page, pages - 1) + 1} av{" "}
        {pages}
      </span>
      <button
        type="button"
        disabled={page === 0}
        onClick={() => setPage((p) => p - 1)}
      >
        Forrige
      </button>
      <button
        type="button"
        disabled={page >= pages - 1}
        onClick={() => setPage((p) => p + 1)}
      >
        Neste
      </button>
    </div>
  );
  if (!allowed) return null;
  return (
    <section
      className="bolig-preparation"
      aria-label="Klargjør boligprosjektet"
    >
      <div className="bolig-preparation-heading">
        <div>
          <small>KLARGJØR HELE PROSJEKTET</small>
          <h4>Bygg, nummerering og grunnleveranse</h4>
          <p>
            Gjør flere boliger klare samtidig. Se over endringene før du lagrer.
          </p>
        </div>
      </div>
      <div className="bolig-preparation-actions">
        {[
          ["building", Building2, "Navn, adresser og boligfordeling"],
          ["numbering", Hash, "Nummerforslag og samlet redigering"],
          ["template", Layers3, "Gjenbruk rommaler og grunnpakker"],
        ].map(([id, Icon, hint]) => (
          <button key={id} type="button" onClick={(e) => launch(id, e)}>
            <Icon size={22} />
            <span>
              <b>{labels[id]}</b>
              <small>{hint}</small>
            </span>
          </button>
        ))}
      </div>
      {createPortal(
        <dialog
          ref={dialog}
          className="bolig-dialog bolig-catalog-dialog bolig-preparation-dialog"
          aria-label={labels[kind]}
          onCancel={(e) => {
            e.preventDefault();
            e.stopPropagation();
            close();
          }}
        >
          <header>
            <div>
              <small>FELLES OPPSETT</small>
              <h2>{labels[kind]}</h2>
            </div>
            <button
              type="button"
              aria-label="Lukk klargjøring"
              disabled={busy}
              onClick={close}
            >
              <X size={22} />
            </button>
          </header>
          <div className="bolig-preparation-body">
            {error && <p role="alert">{error}</p>}
            {notice && (
              <p role="status" className="bolig-preparation-notice">
                {notice}
              </p>
            )}
            {(!data || busy) && (
              <p role="status">
                {busy ? "Arbeider …" : "Hent prosjektet for å fortsette."}
              </p>
            )}
            {data && (
              <>
                {stale && !pending && (
                  <p role="status" className="bolig-preparation-notice">
                    Grunnlaget er endret. Kladden er beholdt.{" "}
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => edit({ ...draft, _basis: data.basis })}
                    >
                      Se over og bruk siste grunnlag
                    </button>
                  </p>
                )}
                {pending && (
                  <p role="status" className="bolig-preparation-notice">
                    Lagringsforsøket må kontrolleres før du gjør flere
                    endringer.{" "}
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => run(pending.intent)}
                    >
                      Kontroller lagringen
                    </button>
                  </p>
                )}
                <fieldset disabled={busy || !!pending}>
                  {kind === "numbering" && (
                    <>
                      <p>
                        Velg bygg og oppgang. Lag et nummerforslag, og rett
                        enkeltboliger i listen. Offisielt bolignummer er et
                        eget, valgfritt felt.
                      </p>
                      {controls}
                      <div className="bolig-preparation-filters">
                        <label>
                          Nummersystem
                          <select
                            aria-label="Nummersystem"
                            value={numbering.mode}
                            onChange={(e) =>
                              setNumbering({
                                ...numbering,
                                mode: e.target.value,
                              })
                            }
                          >
                            <option value="floor">
                              Etasje og plass: 101, 102, 201
                            </option>
                            <option value="sequence">
                              Løpenummer: 001, 002, 003
                            </option>
                            <option value="official">
                              H-format: H0101, H0102
                            </option>
                          </select>
                        </label>
                        {numbering.mode !== "official" && (
                          <label>
                            Prefiks
                            <input
                              maxLength={40}
                              value={numbering.prefix}
                              onChange={(e) =>
                                setNumbering({
                                  ...numbering,
                                  prefix: e.target.value,
                                })
                              }
                              placeholder="Eksempel A-"
                            />
                          </label>
                        )}
                        {numbering.mode === "sequence" && (
                          <>
                            <label>
                              Startnummer
                              <input
                                type="number"
                                min={0}
                                max={999999}
                                value={numbering.start}
                                onChange={(e) =>
                                  setNumbering({
                                    ...numbering,
                                    start: Number(e.target.value),
                                  })
                                }
                              />
                            </label>
                            <label>
                              Antall sifre
                              <input
                                type="number"
                                min={1}
                                max={6}
                                value={numbering.digits}
                                onChange={(e) =>
                                  setNumbering({
                                    ...numbering,
                                    digits: Number(e.target.value),
                                  })
                                }
                              />
                            </label>
                            <label className="bolig-check">
                              <input
                                type="checkbox"
                                checked={numbering.restart}
                                onChange={(e) =>
                                  setNumbering({
                                    ...numbering,
                                    restart: e.target.checked,
                                  })
                                }
                              />
                              Start på nytt i hver oppgang
                            </label>
                          </>
                        )}
                      </div>
                      <div className="bolig-preparation-inline">
                        <button
                          type="button"
                          disabled={!filtered.length}
                          onClick={() => {
                            try {
                              const rows = suggestNumbers(filtered, numbering),
                                ids = new Set(rows.map((r) => r.id));
                              edit({
                                rows: [
                                  ...(draft?.rows || []).filter(
                                    (r) => !ids.has(r.id),
                                  ),
                                  ...rows,
                                ],
                                _basis: draft?._basis || data.basis,
                              });
                            } catch (e) {
                              setError(e.message);
                            }
                          }}
                        >
                          Lag nummerforslag for {filtered.length} boliger
                        </button>
                        <span>
                          {draft?.rows?.length || 0} boliger i utkastet
                        </span>
                      </div>
                      <div className="bolig-preparation-list">
                        {shown.map((u) => {
                          const row = draft?.rows?.find(
                            (r) => r.id === u.id,
                          ) || {
                            id: u.id,
                            number: u.number,
                            official_number: u.official_number || "",
                          };
                          const update = (patch) =>
                            edit({
                              rows: [
                                ...(draft?.rows || []).filter(
                                  (r) => r.id !== u.id,
                                ),
                                { ...row, ...patch },
                              ],
                              _basis: draft?._basis || data.basis,
                            });
                          return (
                            <article key={u.id}>
                              <div>
                                <b>{u.number}</b>
                                <small>
                                  {u.block.name} ·{" "}
                                  {u.entrance.address ||
                                    "Adresse legges til senere"}{" "}
                                  · {u.floor}. etasje
                                </small>
                              </div>
                              <label>
                                Leilighetsnummer
                                <input
                                  aria-label={`Leilighetsnummer ${u.number} ${u.entrance.address || "Adresse legges til senere"}`}
                                  maxLength={60}
                                  value={row.number}
                                  onChange={(e) =>
                                    update({ number: e.target.value })
                                  }
                                />
                              </label>
                              <label>
                                Offisielt bolignummer
                                <input
                                  aria-label={`Offisielt bolignummer ${u.number} ${u.entrance.address || "Adresse legges til senere"}`}
                                  maxLength={40}
                                  value={row.official_number}
                                  onChange={(e) =>
                                    update({ official_number: e.target.value })
                                  }
                                  placeholder="Eksempel H0101"
                                />
                              </label>
                            </article>
                          );
                        })}
                      </div>
                      {pager}
                    </>
                  )}
                  {kind === "building" && (
                    <>
                      <p>
                        Velg bygget. Endre navn og adresser, og juster én
                        oppgang om gangen. Forhåndsvisningen viser boliger som
                        opprettes, skjules eller gjenopprettes.
                      </p>
                      <label>
                        Velg bygg
                        <select
                          aria-label={
                            kind === "building"
                              ? "Velg bygg"
                              : "Prosjektets rommaler"
                          }
                          value={draft?.id || ""}
                          onChange={(e) => chooseBuilding(e.target.value)}
                        >
                          <option value="">Velg bygg</option>
                          {data.blocks
                            .filter((b) => !b.archived)
                            .map((b) => (
                              <option key={b.id} value={b.id}>
                                {b.name}
                              </option>
                            ))}
                        </select>
                      </label>
                      {draft && (
                        <>
                          <div className="bolig-preparation-filters">
                            <label>
                              Byggnavn
                              <input
                                maxLength={100}
                                value={draft.name}
                                onChange={(e) =>
                                  edit({ ...draft, name: e.target.value })
                                }
                              />
                            </label>
                            <label>
                              Boligtype
                              <select
                                aria-label="Boligtype"
                                value={draft.building_type}
                                onChange={(e) =>
                                  edit({
                                    ...draft,
                                    building_type: e.target.value,
                                  })
                                }
                              >
                                {BUILDING_TYPES.map((t) => (
                                  <option key={t.id} value={t.id}>
                                    {t.label}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label>
                              Byggets adresse (valgfritt)
                              <input
                                maxLength={200}
                                value={draft.address}
                                onChange={(e) =>
                                  edit({ ...draft, address: e.target.value })
                                }
                              />
                            </label>
                            {draft.building_type !== "apartment" && (
                              <label>
                                Etasjer i huset
                                <input
                                  type="number"
                                  min={1}
                                  max={30}
                                  value={draft.house_floors}
                                  onChange={(e) =>
                                    edit({
                                      ...draft,
                                      house_floors: Number(e.target.value),
                                    })
                                  }
                                />
                              </label>
                            )}
                          </div>
                          <label>
                            Oppgang som redigeres
                            <select
                              aria-label="Oppgang som redigeres"
                              value={draft.entrance_id}
                              onChange={(e) => {
                                const en = data.entrances.find(
                                  (v) => v.id === e.target.value,
                                );
                                edit({
                                  ...draft,
                                  entrance_id: en.id,
                                  entrance_address: en.address,
                                  counts: en.counts,
                                });
                              }}
                            >
                              {data.entrances
                                .filter(
                                  (e) => e.block_id === draft.id && !e.archived,
                                )
                                .map((e) => (
                                  <option key={e.id} value={e.id}>
                                    {e.address || "Adresse legges til senere"}
                                  </option>
                                ))}
                            </select>
                          </label>
                          <label>
                            Oppgangens adresse (valgfritt)
                            <input
                              maxLength={200}
                              value={draft.entrance_address}
                              onChange={(e) =>
                                edit({
                                  ...draft,
                                  entrance_address: e.target.value,
                                })
                              }
                            />
                          </label>
                          <label>
                            Antall etasjer med boliger
                            <input
                              type="number"
                              min={1}
                              max={30}
                              value={draft.counts.length}
                              onChange={(e) => {
                                const n = Number(e.target.value);
                                if (Number.isInteger(n) && n >= 1 && n <= 30)
                                  edit({
                                    ...draft,
                                    counts: Array.from(
                                      { length: n },
                                      (_, i) =>
                                        draft.counts[i] ?? draft.counts[0] ?? 1,
                                    ),
                                  });
                              }}
                            />
                          </label>
                          <div className="bolig-builder-floor-grid">
                            {draft.counts.map((n, i) => (
                              <label key={i}>
                                {i + 1}. etasje
                                <input
                                  type="number"
                                  min={1}
                                  max={20}
                                  value={n}
                                  onChange={(e) =>
                                    edit({
                                      ...draft,
                                      counts: draft.counts.map((v, j) =>
                                        j === i ? Number(e.target.value) : v,
                                      ),
                                    })
                                  }
                                />
                                <small>boliger</small>
                              </label>
                            ))}
                          </div>
                          <p>
                            Ved reduksjon skjules overskytende boliger. De kan
                            gjenopprettes med samme ID, kontakt, rom og
                            historikk.
                          </p>
                        </>
                      )}
                    </>
                  )}
                  {kind === "template" && (
                    <>
                      <p>
                        Lag en rommal med grunnpakker. Bruk den på valgte
                        boliger etter at du har sett over resultatet.
                        Individuelle tilvalgspakker velges senere på boligen.
                      </p>
                      <div className="bolig-preparation-inline">
                        <label>
                          Prosjektets rommaler
                          <select
                            aria-label={
                              kind === "building"
                                ? "Velg bygg"
                                : "Prosjektets rommaler"
                            }
                            value={draft?.id || ""}
                            onChange={(e) => {
                              const t = data.templates.find(
                                (t) => t.id === e.target.value,
                              );
                              if (t)
                                edit({
                                  ...t,
                                  unit_ids: [],
                                  include_existing: false,
                                  _basis: data.basis,
                                });
                            }}
                          >
                            <option value="">Velg lagret rommal</option>
                            {data.templates.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.name}
                              </option>
                            ))}
                          </select>
                        </label>
                        <button type="button" onClick={newTemplate}>
                          <Plus size={16} />
                          Ny rommal
                        </button>
                      </div>
                      {draft?.definition && (
                        <>
                          <label>
                            Navn på rommal
                            <input
                              maxLength={100}
                              value={draft.name}
                              onChange={(e) =>
                                edit({ ...draft, name: e.target.value })
                              }
                              placeholder="Eksempel 3-roms med to bad"
                            />
                          </label>
                          <PackageSelect
                            label="Fellespakke for boligen"
                            value={draft.definition.common_package_id}
                            packages={data.packages}
                            onChange={(value) =>
                              edit({
                                ...draft,
                                definition: {
                                  ...draft.definition,
                                  common_package_id: value,
                                },
                              })
                            }
                          />
                          <div className="bolig-preparation-rooms">
                            {draft.definition.rooms.map((r, i) => (
                              <TemplateRoom
                                key={r.key}
                                room={r}
                                packageName={
                                  data.packages.find(
                                    (p) => p.id === r.package_id,
                                  )?.name
                                }
                              >
                                <div className="bolig-preparation-filters">
                                  <label>
                                    Romtype
                                    <select
                                      aria-label="Romtype"
                                      value={r.type}
                                      onChange={(e) =>
                                        updateRoom(r.key, {
                                          type: e.target.value,
                                        })
                                      }
                                    >
                                      {types.map(([id, name]) => (
                                        <option key={id} value={id}>
                                          {name}
                                        </option>
                                      ))}
                                    </select>
                                  </label>
                                  <label>
                                    Romnavn
                                    <input
                                      maxLength={80}
                                      value={r.name}
                                      onChange={(e) =>
                                        updateRoom(r.key, {
                                          name: e.target.value,
                                        })
                                      }
                                    />
                                  </label>
                                  <label>
                                    Etasje i boligen <small>valgfritt</small>
                                    <input
                                      maxLength={40}
                                      value={r.floor}
                                      onChange={(e) =>
                                        updateRoom(r.key, {
                                          floor: e.target.value,
                                        })
                                      }
                                    />
                                  </label>
                                  <PackageSelect
                                    label="Rompakke"
                                    value={r.package_id}
                                    packages={data.packages}
                                    onChange={(value) =>
                                      updateRoom(r.key, { package_id: value })
                                    }
                                  />
                                </div>
                                <button
                                  type="button"
                                  className="bolig-quiet-action"
                                  onClick={() =>
                                    edit({
                                      ...draft,
                                      definition: {
                                        ...draft.definition,
                                        rooms: draft.definition.rooms.filter(
                                          (x) => x.key !== r.key,
                                        ),
                                      },
                                    })
                                  }
                                >
                                  <Trash2 size={15} />
                                  Fjern fra malen
                                </button>
                              </TemplateRoom>
                            ))}
                          </div>
                          <div className="bolig-preparation-inline">
                            <button
                              type="button"
                              disabled={draft.definition.rooms.length >= 60}
                              onClick={() =>
                                edit({
                                  ...draft,
                                  definition: {
                                    ...draft.definition,
                                    rooms: [
                                      ...draft.definition.rooms,
                                      roomRow("", "other"),
                                    ],
                                  },
                                })
                              }
                            >
                              <Plus size={16} />
                              Legg til rom i malen
                            </button>
                            <button
                              type="button"
                              disabled={stale || !draft.name.trim()}
                              onClick={() => run("template_save")}
                            >
                              Lagre rommal
                            </button>
                          </div>
                          <hr />
                          <h3>Velg boliger</h3>
                          {controls}
                          <div className="bolig-preparation-inline">
                            <button
                              type="button"
                              disabled={filtered.length > 500}
                              onClick={() =>
                                edit({
                                  ...draft,
                                  unit_ids: [
                                    ...new Set([
                                      ...(draft.unit_ids || []),
                                      ...filtered.map((u) => u.id),
                                    ]),
                                  ],
                                })
                              }
                            >
                              Velg alle {filtered.length} treff
                            </button>
                            <button
                              type="button"
                              onClick={() => edit({ ...draft, unit_ids: [] })}
                            >
                              Fjern boligvalg
                            </button>
                            <b>{draft.unit_ids?.length || 0} boliger valgt</b>
                          </div>
                          <div className="bolig-preparation-targets">
                            {shown.map((u) => {
                              const state = data.unit_states.find(
                                (s) => s.unit_id === u.id,
                              );
                              return (
                                <label key={u.id}>
                                  <input
                                    type="checkbox"
                                    checked={
                                      draft.unit_ids?.includes(u.id) || false
                                    }
                                    onChange={(e) =>
                                      edit({
                                        ...draft,
                                        unit_ids: e.target.checked
                                          ? [...(draft.unit_ids || []), u.id]
                                          : (draft.unit_ids || []).filter(
                                              (id) => id !== u.id,
                                            ),
                                      })
                                    }
                                  />
                                  <span>
                                    <b>{u.number}</b>
                                    <small>
                                      {u.block.name} ·{" "}
                                      {u.entrance.address ||
                                        "Adresse legges til senere"}
                                    </small>
                                  </span>
                                  <small>
                                    {state?.rooms || state?.choice
                                      ? "Har innhold"
                                      : "Klar for oppsett"}
                                  </small>
                                </label>
                              );
                            })}
                          </div>
                          {pager}
                          <label className="bolig-check">
                            <input
                              type="checkbox"
                              checked={draft.include_existing}
                              onChange={(e) =>
                                edit({
                                  ...draft,
                                  include_existing: e.target.checked,
                                })
                              }
                            />
                            Legg også til manglende rom og pakker i boliger med
                            innhold
                          </label>
                          <p className="bolig-preparation-hint">
                            Som standard hoppes boliger med egne rom eller valg
                            over. Ved avkryssing beholdes eksisterende rom og
                            pakker. Rom med samme navn gjenbrukes. Arkiverte
                            eller motstridende rom må vurderes separat.
                          </p>
                        </>
                      )}
                    </>
                  )}
                </fieldset>
                {preview && (
                  <section
                    className="bolig-preparation-preview"
                    aria-label="Forhåndsvisning av klargjøring"
                  >
                    <h3>Se over før lagring</h3>
                    <p>
                      {
                        preview.proposal.filter((p) => p.status === "ready")
                          .length
                      }{" "}
                      klare ·{" "}
                      {
                        preview.proposal.filter((p) => p.status !== "ready")
                          .length
                      }{" "}
                      beholdes eller må vurderes
                    </p>
                    <div className="bolig-preparation-preview-list">
                      {previewRows.map((p, i) => (
                        <article key={p.id || i}>
                          <b>{p.number || p.name || p.before}</b>
                          <span>{statuses[p.status]}</span>
                          {units.find((unit) => unit.id === p.id) && (
                            <small>
                              {
                                units.find((unit) => unit.id === p.id).block
                                  .name
                              }{" "}
                              ·{" "}
                              {
                                units.find((unit) => unit.id === p.id).entrance
                                  .address
                              }
                            </small>
                          )}
                          <small>
                            {kind === "numbering"
                              ? `${p.before} → ${p.number}${p.official_number ? ` · Offisielt: ${p.official_number}` : ""}`
                              : kind === "building"
                                ? `${p.added} nye · ${p.hidden} skjules · ${p.restored} gjenopprettes`
                                : p.reason ||
                                  `${p.new_rooms} nye rom · ${p.new_packages} nye pakker · ${p.goods_count} varer samlet`}
                          </small>
                        </article>
                      ))}
                    </div>
                    <p>
                      Kontakter, individuelle valg, tidligere versjoner og
                      bestillingsutkast beholdes. Bestillingsgrunnlaget må
                      gjennomgås etter nye pakkevalg.
                    </p>
                  </section>
                )}
                {kind === "building" && (
                  <p className="bolig-preparation-save-hint">
                    Lagre endringer åpner en gjennomgang. Bekreft deretter for å
                    lagre i prosjektet.
                  </p>
                )}
                <footer className="bolig-preparation-footer">
                  <button type="button" disabled={busy} onClick={close}>
                    Lukk og behold kladd
                  </button>
                  {kind === "building" && (
                    <details className="bolig-preparation-more">
                      <summary>Flere valg</summary>
                      <button
                        type="button"
                        disabled={busy || !!pending}
                        onClick={() => load().catch((e) => setError(e.message))}
                      >
                        Hent siste grunnlag
                      </button>
                    </details>
                  )}
                  <button
                    hidden={kind === "building"}
                    type="button"
                    disabled={busy || !!pending}
                    onClick={() => load().catch((e) => setError(e.message))}
                  >
                    <RefreshCw size={16} />
                    Hent siste grunnlag
                  </button>
                  <button
                    type="button"
                    className={kind === "building" ? "bolig-primary" : ""}
                    hidden={kind === "building" && !!preview}
                    disabled={busy || !!pending || !draft || stale}
                    onClick={() => run("preview")}
                  >
                    <Eye size={17} />
                    {kind === "building"
                      ? "Lagre endringer"
                      : "Forhåndsvis endringer"}
                  </button>
                  {preview && (
                    <button
                      type="button"
                      disabled={
                        busy ||
                        !!pending ||
                        stale ||
                        !preview.proposal.some((p) => p.status === "ready")
                      }
                      className="bolig-primary"
                      onClick={() => run("save")}
                    >
                      <Check size={17} />
                      Bekreft og lagre
                    </button>
                  )}
                </footer>
              </>
            )}
          </div>
        </dialog>,
        document.body,
      )}
    </section>
  );
}
