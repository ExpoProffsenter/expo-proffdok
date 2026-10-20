import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  MANAGED_ACCESS_EVENT,
  MODULE_ACCESS_EVENT,
} from "../access/moduleAccessClient.js";
import { WORK_PROFILE_EVENT } from "../access/workProfileClient.js";
import { BoligHelp } from "../help/BoligHelp.jsx";
import {
  boligRpc,
  boligDraftKey,
  readBoligDraft,
  writeBoligDraft,
  clearBoligDraft,
} from "./boligClient.js";
import "./bolig.css";
const ACCESS_EVENT = "expo-proffdok-bolig-access";
export default function BoligEntry({
  userId,
  onOpenProject,
  mode = "workspace",
  onExit,
}) {
  const [context, setContext] = useState(null),
    [open, setOpen] = useState(mode === "workspace"),
    [loadError, setLoadError] = useState("");
  const seq = useRef(0);
  const exit = useRef(onExit);
  exit.current = onExit;
  const close = useCallback(() => {
    setOpen(false);
    exit.current?.();
  }, []);
  useEffect(() => setOpen(mode === "workspace"), [mode]);
  useEffect(() => {
    let live = true;
    const refresh = (event) => {
      const token = ++seq.current;
      setLoadError("");
      if (event?.type === WORK_PROFILE_EVENT)
        setContext((old) =>
          old?.company_id === event.detail?.active_company_id ? old : null,
        );
      if (
        [MANAGED_ACCESS_EVENT, MODULE_ACCESS_EVENT, ACCESS_EVENT].includes(
          event?.type,
        )
      )
        setContext(null);
      boligRpc()
        .then((c) => {
          if (live && token === seq.current)
            setContext(c?.user_id === userId ? c : null);
        })
        .catch((e) => {
          if (live && token === seq.current) {
            setContext(null);
            setLoadError(e.message);
          }
        });
    };
    setContext(null);
    if (userId) refresh();
    const events = [
      WORK_PROFILE_EVENT,
      MANAGED_ACCESS_EVENT,
      MODULE_ACCESS_EVENT,
      ACCESS_EVENT,
      "focus",
    ];
    events.forEach((e) => window.addEventListener(e, refresh));
    return () => {
      live = false;
      seq.current++;
      events.forEach((e) => window.removeEventListener(e, refresh));
    };
  }, [userId]);
  if (context?.user_id !== userId) {
    if (mode === "accessShortcut") return null;
    return (
      <section className="bolig-entry-state" aria-label="Boligprosjekter">
        <h2>Boligprosjekter</h2>
        <p role="status">{loadError || "Henter firma og tilgang …"}</p>
        {loadError ? (
          <p>
            Kontroller aktivt firma og innlogging. Firmaadmin kan kontrollere
            tilgangen din.
          </p>
        ) : null}
      </section>
    );
  }
  if (mode === "accessShortcut" && !context.manage_access) return null;
  return (
    <>
      {mode === "accessShortcut" ? (
        <section
          className="bolig-access-shortcut"
          aria-label="Boligprosjekter – aktivering og tilganger"
        >
          <strong>Boligprosjekter</strong>
          <span>
            {context.licensed
              ? "Aktivert for " + context.company_name
              : "Ikke aktivert for " + context.company_name}
          </span>
          <button type="button" onClick={() => setOpen(true)}>
            Aktivering og tilganger
          </button>
          <small>
            Gjelder aktivt firma. Velg et annet firma øverst før du endrer
            tilgang der.
          </small>
        </section>
      ) : !open ? (
        <button type="button" onClick={() => setOpen(true)}>
          Åpne boligprosjekter
        </button>
      ) : null}
      {open
        ? createPortal(
            <BoligWorkspace
              key={`${userId}:${context.company_id}`}
              context={context}
              startWithAccess={mode === "accessShortcut"}
              onClose={close}
              onOpenProject={onOpenProject}
            />,
            document.body,
          )
        : null}
    </>
  );
}

function DraftForm({
  context,
  root = "new",
  name,
  initial,
  onSubmit,
  submitLabel = "Lagre i firmaet",
  busy,
  children,
}) {
  const key = boligDraftKey(context, root, name);
  const [value, setValue] = useState(() => readBoligDraft(key, initial));
  const [warning, setWarning] = useState("");
  const change = (field, next) => {
    const v = { ...value, [field]: next };
    if (!writeBoligDraft(key, v))
      setWarning(
        "Nettleseren kunne ikke sikre kladden lokalt. Behold siden åpen.",
      );
    setValue(v);
  };
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (await onSubmit(value)) {
          clearBoligDraft(key);
          setValue(
            name.startsWith("unit-") || name.startsWith("resize-")
              ? value
              : initial,
          );
        }
      }}
    >
      <fieldset disabled={busy}>
        {children(value, change)}
        <button type="submit">{submitLabel}</button>
      </fieldset>
      {warning ? <p role="status">{warning}</p> : null}
    </form>
  );
}
function FloorFields({ value, onChange }) {
  const counts = String(value).split(",");
  return (
    <div className="bolig-floors">
      <label>
        Antall etasjer
        <input
          type="number"
          min="1"
          max="30"
          required
          value={counts.length}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (Number.isInteger(n) && n >= 1 && n <= 30)
              onChange(
                Array.from({ length: n }, (_, i) => counts[i] ?? "4").join(","),
              );
          }}
        />
      </label>
      <p>
        Angi hvor mange leiligheter hver etasje skal ha. Første etasje står
        øverst.
      </p>
      <div className="bolig-floor-fields">
        {counts.map((count, i) => (
          <label key={i}>
            {i + 1}. etasje
            <input
              type="number"
              min="1"
              max="20"
              required
              value={count}
              onChange={(e) =>
                onChange(
                  counts
                    .map((n, j) => (j === i ? e.target.value : n))
                    .join(","),
                )
              }
            />
          </label>
        ))}
      </div>
      <small>
        {counts.reduce((total, n) => total + Number(n || 0), 0)} leiligheter i
        denne oppgangen. Endringen gjelder når du lagrer.
      </small>
    </div>
  );
}
function BoligWorkspace({
  context,
  onClose,
  onOpenProject,
  startWithAccess = false,
}) {
  const dialog = useRef(null),
    alive = useRef(true),
    selection = useRef(0);
  const [ctx, setCtx] = useState(context),
    [roots, setRoots] = useState([]),
    [record, setRecord] = useState(null),
    [access, setAccess] = useState(null),
    [projects, setProjects] = useState([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [entranceId, setEntranceId] = useState(""),
    [unitId, setUnitId] = useState(""),
    [query, setQuery] = useState(""),
    [settings, setSettings] = useState(
      startWithAccess || (context.manage_access && !context.enabled),
    );
  useEffect(() => {
    setCtx(context);
    if (!context.enabled) {
      setRecord(null);
      setRoots([]);
      setProjects([]);
      if (!context.manage_access) setAccess(null);
    }
  }, [context]);
  const apply = useCallback(
    (value) => {
      if (!alive.current) return;
      if (
        value?.context &&
        (value.context.user_id !== context.user_id ||
          value.context.company_id !== context.company_id)
      )
        throw Error("Arbeidsfirmaet er endret.");
      if (value?.context) setCtx(value.context);
      if (value?.roots) setRoots(value.roots);
      if (value?.root) setRecord(value);
      if (value?.members) setAccess(value);
      if (value?.projects) setProjects(value.projects);
    },
    [context.user_id, context.company_id],
  );
  const request = useCallback(
    async (action, options = {}) => {
      const value = await boligRpc(action, {
        companyId: context.company_id,
        ...options,
      });
      if (alive.current) apply(value);
      return value;
    },
    [context.company_id, apply],
  );
  const perform = async (action, options = {}) => {
    if (busy) return false;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await request(action, options);
      if (alive.current) {
        setNotice("Lagret i firmaet.");
        if (
          ctx.enabled &&
          ["create", "archive", "block", "entrance", "resize"].includes(action)
        )
          await request("list");
      }
      return true;
    } catch (e) {
      if (alive.current) {
        setError(
          ["PT409", "40001"].includes(e.code)
            ? e.message + " Trykk «Hent siste versjon»."
            : e.message,
        );
        if (e.code === "42501") {
          setCtx({ ...ctx, enabled: false, role: "none" });
          setRecord(null);
          setAccess(null);
          setProjects([]);
          setRoots([]);
          const latest = await boligRpc().catch(() => null);
          if (alive.current && latest?.company_id === context.company_id)
            setCtx(latest);
        }
      }
      return false;
    } finally {
      if (alive.current) setBusy(false);
    }
  };
  useEffect(() => {
    alive.current = true;
    dialog.current?.showModal();
    const handleScope = (ev) => {
      if (ev.detail?.active_company_id !== context.company_id) onClose();
    };
    window.addEventListener(WORK_PROFILE_EVENT, handleScope);
    const load = async () => {
      try {
        if (context.enabled) await request("list");
        if (context.manage_access) await request("access");
      } catch (e) {
        if (alive.current) setError(e.message);
      }
    };
    load();
    return () => {
      alive.current = false;
      window.removeEventListener(WORK_PROFILE_EVENT, handleScope);
    };
  }, [
    context.company_id,
    context.enabled,
    context.manage_access,
    request,
    onClose,
  ]);
  const fetchRecord = async (id) => {
    const token = ++selection.current;
    setError("");
    try {
      const value = await boligRpc("get", {
        companyId: context.company_id,
        rootId: id,
      });
      if (alive.current && token === selection.current) {
        apply(value);
        setEntranceId("");
        setUnitId("");
      }
    } catch (e) {
      if (alive.current && token === selection.current) {
        setRecord(null);
        setError(e.message);
      }
    }
  };
  const refresh = async () => {
    setError("");
    try {
      const c = await boligRpc();
      if (c.company_id !== context.company_id || !c.enabled) {
        setCtx(c);
        setRecord(null);
        setRoots([]);
        setAccess(null);
        if (c.company_id === context.company_id && c.manage_access)
          await request("access");
        return;
      }
      setCtx(c);
      await request("list");
      if (record) await request("get", { rootId: record.root.id });
      if (c.manage_access) await request("access");
    } catch (e) {
      setRecord(null);
      setRoots([]);
      setAccess(null);
      setError(e.message);
    }
  };
  const change = (action, payload) =>
    perform(action, {
      rootId: record.root.id,
      revision: record.root.revision,
      payload,
    });
  const canWrite =
    ctx.enabled && ctx.role === "manager" && !record?.root.archived;
  const activeBlocks = record?.blocks.filter((b) => !b.archived) || [];
  const entrances =
    record?.entrances.filter(
      (e) => !e.archived && activeBlocks.some((b) => b.id === e.block_id),
    ) || [];
  const entrance = entrances.find((e) => e.id === entranceId) || entrances[0];
  const visibleUnits =
    record?.units.filter(
      (u) => !u.archived && entrances.some((e) => e.id === u.entrance_id),
    ) || [];
  const matches = query.trim()
    ? visibleUnits.filter((u) => {
        const e = entrances.find((e) => e.id === u.entrance_id);
        return query
          .toLowerCase()
          .split(/\s+/)
          .every((term) =>
            `${u.number} ${u.contact_name} ${e.address}`
              .toLowerCase()
              .includes(term),
          );
      })
    : visibleUnits.filter((u) => u.entrance_id === entrance?.id);
  const unit = visibleUnits.find((u) => u.id === unitId);
  const block = record?.blocks.find((b) => b.id === entrance?.block_id);
  return (
    <dialog
      className="bolig-dialog"
      ref={dialog}
      onCancel={onClose}
      aria-label="Boligprosjekter"
    >
      <header>
        <div>
          <small>{ctx.company_name}</small>
          <h2>Boligprosjekter</h2>
          <p>Boligstruktur og prosjektkoblinger lagres felles i firmaet.</p>
        </div>
        <button type="button" onClick={onClose}>
          Lukk boligprosjekter
        </button>
      </header>
      {!ctx.enabled ? (
        <section className="bolig-access-state" role="status">
          <h3>
            {!ctx.licensed
              ? "Boligprosjekter er ikke aktivert for " + ctx.company_name
              : "Din bruker mangler tilgang til Boligprosjekter"}
          </h3>
          <p>
            {!ctx.licensed
              ? ctx.system_admin
                ? "Aktiver firmaet i «Aktivering og tilganger» nedenfor. Som systemadmin har du prosjektledertilgang når firmaet er aktivert."
                : ctx.manage_access
                  ? "Systemadmin må først aktivere Boligprosjekter for firmaet. Deretter kan du som firmaadmin gi ansatte tilgang nedenfor."
                  : "Be firmaadmin kontakte systemadmin for å aktivere Boligprosjekter for firmaet."
              : ctx.manage_access
                ? "Kontroller at hovedmodulen «Prosjekter og dokumentasjon» er aktivert for brukeren."
                : "Be firmaadmin gi deg lesetilgang eller prosjektledertilgang under «Aktivering og tilganger». Du må også ha «Prosjekter og dokumentasjon»."}
          </p>
        </section>
      ) : null}
      {error ? (
        <p role="alert" className="bolig-error">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p role="status" className="bolig-notice">
          {notice}
        </p>
      ) : null}
      <div className="bolig-toolbar">
        <button type="button" disabled={busy} onClick={refresh}>
          Hent siste versjon
        </button>
        {ctx.manage_access ? (
          <button type="button" onClick={() => setSettings(!settings)}>
            {settings ? "Skjul tilgangsoppsett" : "Aktivering og tilganger"}
          </button>
        ) : null}
        <small>
          {!ctx.enabled
            ? !ctx.licensed
              ? "Firmaet er ikke aktivert"
              : "Brukertilgang mangler"
            : ctx.role === "manager"
              ? "Prosjektledertilgang"
              : "Lesetilgang"}
        </small>
      </div>
      {settings && access ? (
        <section className="bolig-panel">
          <h3>Aktivering og tilganger</h3>
          <p>
            Firmaadmin følger firmaaktiveringen. Andre interne brukere tildeles
            tilgang her og må også ha ordinær prosjekttilgang.
          </p>
          {ctx.system_admin ? (
            <label className="bolig-license-toggle">
              <input
                type="checkbox"
                checked={ctx.licensed}
                disabled={busy}
                onChange={async (e) => {
                  const next = e.target.checked;
                  if (
                    await perform("license", {
                      revision: ctx.license_revision,
                      payload: { enabled: next },
                    })
                  ) {
                    if (next) await request("list");
                    else {
                      setRoots([]);
                      setRecord(null);
                    }
                  }
                }}
              />
              Aktiver Boligprosjekter for firmaet
            </label>
          ) : (
            <p>
              {ctx.licensed
                ? "Firmamodulen er aktivert."
                : "Systemadmin må aktivere modulen på firmaet."}
            </p>
          )}
          {access.members.map((m) => (
            <div className="bolig-member" key={m.user_id}>
              <span>{m.name}</span>
              {m.firmaadmin ? (
                <b>Firmaadmin</b>
              ) : (
                <select
                  aria-label={`Tilgang for ${m.name}`}
                  value={m.role}
                  disabled={busy || !ctx.licensed}
                  onChange={(e) =>
                    perform("member", {
                      revision: m.revision,
                      payload: { user_id: m.user_id, role: e.target.value },
                    })
                  }
                >
                  <option value="none">Ingen tilgang</option>
                  <option value="reader">Lesetilgang</option>
                  <option value="manager">Prosjektledertilgang</option>
                </select>
              )}
            </div>
          ))}
        </section>
      ) : null}
      <BoligHelp />
      {!ctx.enabled ? null : (
        <>
          <div className="bolig-columns">
            <aside className="bolig-panel">
              <h3>Hovedprosjekter</h3>
              {roots.length ? (
                roots.map((r) => (
                  <button
                    className="bolig-root"
                    type="button"
                    disabled={busy}
                    key={r.id}
                    onClick={() => fetchRecord(r.id)}
                  >
                    <b>
                      {r.title}
                      {r.archived ? " · arkivert" : ""}
                    </b>
                    <small>
                      {r.reference} · {r.unit_count} boliger
                    </small>
                  </button>
                ))
              ) : (
                <p>Ingen boligprosjekter er opprettet ennå.</p>
              )}
              {ctx.role === "manager" ? (
                <details>
                  <summary>Nytt hovedprosjekt</summary>
                  <DraftForm
                    context={ctx}
                    name="create"
                    initial={{ title: "", reference: "" }}
                    busy={busy}
                    onSubmit={(payload) => perform("create", { payload })}
                    submitLabel="Opprett hovedprosjekt"
                  >
                    {(v, c) => (
                      <>
                        <label>
                          Prosjektnavn
                          <input
                            required
                            maxLength={160}
                            value={v.title}
                            onChange={(e) => c("title", e.target.value)}
                          />
                        </label>
                        <label>
                          Prosjektnummer
                          <input
                            maxLength={80}
                            value={v.reference}
                            onChange={(e) => c("reference", e.target.value)}
                          />
                        </label>
                      </>
                    )}
                  </DraftForm>
                </details>
              ) : null}
            </aside>
            <section className="bolig-panel bolig-workspace">
              {!record ? (
                <p>
                  Velg eller opprett et hovedprosjekt. Legg så til blokk og
                  oppgang.
                </p>
              ) : (
                <>
                  <div className="bolig-toolbar">
                    <h3>{record.root.title}</h3>
                    <small>Versjon {record.root.revision}</small>
                    {ctx.role === "manager" ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          change("archive", {
                            kind: "root",
                            id: record.root.id,
                            archived: !record.root.archived,
                          })
                        }
                      >
                        {record.root.archived
                          ? "Gjenopprett hovedprosjekt"
                          : "Arkiver hovedprosjekt"}
                      </button>
                    ) : null}
                  </div>
                  {canWrite ? (
                    <div className="bolig-setup">
                      <details>
                        <summary>Legg til blokk</summary>
                        <DraftForm
                          key={record.root.id + "block"}
                          context={ctx}
                          root={record.root.id}
                          name="block"
                          busy={busy}
                          initial={{ name: "" }}
                          onSubmit={(v) => change("block", v)}
                          submitLabel="Lagre blokk"
                        >
                          {(v, c) => (
                            <label>
                              Blokknavn
                              <input
                                required
                                maxLength={100}
                                value={v.name}
                                onChange={(e) => c("name", e.target.value)}
                              />
                            </label>
                          )}
                        </DraftForm>
                      </details>
                      {activeBlocks.length ? (
                        <details>
                          <summary>Legg til oppgang</summary>
                          <DraftForm
                            key={record.root.id + "entrance"}
                            context={ctx}
                            root={record.root.id}
                            name="entrance"
                            busy={busy}
                            initial={{
                              block_id: activeBlocks[0].id,
                              address: "",
                              counts: "4,4,4,4,4,4",
                            }}
                            onSubmit={(v) =>
                              change("entrance", {
                                ...v,
                                counts: v.counts
                                  .split(",")
                                  .map((n) => Number(n.trim())),
                              })
                            }
                            submitLabel="Lagre oppgang"
                          >
                            {(v, c) => (
                              <>
                                <label>
                                  Blokk
                                  <select
                                    value={v.block_id}
                                    onChange={(e) =>
                                      c("block_id", e.target.value)
                                    }
                                  >
                                    {activeBlocks.map((b) => (
                                      <option key={b.id} value={b.id}>
                                        {b.name}
                                      </option>
                                    ))}
                                  </select>
                                </label>
                                <label>
                                  Adresse
                                  <input
                                    required
                                    maxLength={200}
                                    value={v.address}
                                    onChange={(e) =>
                                      c("address", e.target.value)
                                    }
                                  />
                                </label>
                                <FloorFields
                                  value={v.counts}
                                  onChange={(value) => c("counts", value)}
                                />
                              </>
                            )}
                          </DraftForm>
                        </details>
                      ) : null}
                    </div>
                  ) : null}
                  <label>
                    Søk i hele hovedprosjektet
                    <input
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Adresse, leilighet eller kontakt"
                    />
                  </label>
                  <label>
                    Oppgang
                    <select
                      value={entrance?.id || ""}
                      onChange={(e) => {
                        setEntranceId(e.target.value);
                        setUnitId("");
                        setQuery("");
                      }}
                    >
                      {entrances.map((e) => (
                        <option value={e.id} key={e.id}>
                          {record.blocks.find((b) => b.id === e.block_id)?.name}{" "}
                          · {e.address}
                        </option>
                      ))}
                    </select>
                  </label>
                  {entrance ? (
                    <>
                      <div className="bolig-toolbar">
                        <h4>
                          {block?.name} · {entrance.address}
                        </h4>
                        <small>
                          {
                            visibleUnits.filter(
                              (u) => u.entrance_id === entrance.id,
                            ).length
                          }{" "}
                          boliger
                        </small>
                      </div>
                      {canWrite ? (
                        <details>
                          <summary>Endre etasjer og leiligheter</summary>
                          <DraftForm
                            key={entrance.id}
                            context={ctx}
                            root={record.root.id}
                            name={"resize-" + entrance.id}
                            busy={busy}
                            initial={{
                              address: entrance.address,
                              counts: entrance.counts.join(","),
                            }}
                            onSubmit={(v) =>
                              change("resize", {
                                id: entrance.id,
                                address: v.address,
                                counts: v.counts
                                  .split(",")
                                  .map((n) => Number(n.trim())),
                              })
                            }
                          >
                            {(v, c) => (
                              <>
                                <label>
                                  Adresse
                                  <input
                                    required
                                    maxLength={200}
                                    value={v.address}
                                    onChange={(e) =>
                                      c("address", e.target.value)
                                    }
                                  />
                                </label>
                                <FloorFields
                                  value={v.counts}
                                  onChange={(value) => c("counts", value)}
                                />
                                <p>
                                  Færre etasjer skjuler tidligere boliger. De
                                  gjenopprettes med samme ID og historikk ved
                                  økning.
                                </p>
                              </>
                            )}
                          </DraftForm>
                        </details>
                      ) : null}
                    </>
                  ) : null}
                  <div
                    className="bolig-grid"
                    style={{
                      "--bolig-columns": Math.min(
                        8,
                        Math.max(1, ...(entrance?.counts || [4])),
                      ),
                    }}
                  >
                    {matches.map((u) => (
                      <button
                        type="button"
                        className={unitId === u.id ? "selected" : ""}
                        key={u.id}
                        onClick={() => setUnitId(u.id)}
                      >
                        <b>{u.number}</b>
                        <small>
                          {query
                            ? entrances.find((e) => e.id === u.entrance_id)
                                ?.address
                            : `${u.floor}. etasje`}
                        </small>
                        <small>
                          {u.has_project
                            ? "Prosjekt koblet"
                            : "Prosjekt mangler"}
                        </small>
                      </button>
                    ))}
                  </div>
                  {!matches.length ? (
                    <p>Ingen boliger i dette utvalget.</p>
                  ) : null}
                  {unit ? (
                    <section className="bolig-unit">
                      <h3>
                        {
                          entrances.find((e) => e.id === unit.entrance_id)
                            ?.address
                        }{" "}
                        · {unit.number}
                      </h3>
                      {unit.project_id ? (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenProject?.(unit.project_id, "prosjekt");
                          }}
                        >
                          Åpne leilighetsprosjekt
                        </button>
                      ) : unit.has_project ? (
                        <p>
                          Prosjektet er koblet. Ordinær prosjekttilgang kreves
                          for å åpne.
                        </p>
                      ) : (
                        <p>
                          Koble et ordinært ProffDok-prosjekt til boligen.
                          Innhold, sjekklister og dokumentasjon blir i
                          prosjektet.
                        </p>
                      )}
                      {canWrite && (!unit.has_project || unit.project_id) ? (
                        <DraftForm
                          key={unit.id}
                          context={ctx}
                          root={record.root.id}
                          name={"unit-" + unit.id}
                          busy={busy}
                          initial={{
                            number: unit.number,
                            contact_name: unit.contact_name,
                            project_id: unit.project_id || "",
                          }}
                          onSubmit={(v) =>
                            change("unit", { id: unit.id, ...v })
                          }
                        >
                          {(v, c) => (
                            <>
                              <label>
                                Leilighetsnummer
                                <input
                                  required
                                  maxLength={60}
                                  value={v.number}
                                  onChange={(e) => c("number", e.target.value)}
                                />
                              </label>
                              <label>
                                Kontaktperson
                                <input
                                  maxLength={120}
                                  value={v.contact_name}
                                  onChange={(e) =>
                                    c("contact_name", e.target.value)
                                  }
                                />
                              </label>
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                  request("projects", {
                                    rootId: record.root.id,
                                  }).catch((e) => setError(e.message))
                                }
                              >
                                Hent tilgjengelige ProffDok-prosjekter
                              </button>
                              <label>
                                Leilighetsprosjekt
                                <select
                                  value={v.project_id}
                                  onChange={(e) =>
                                    c("project_id", e.target.value)
                                  }
                                >
                                  <option value="">Ikke koblet</option>
                                  {v.project_id &&
                                  !projects.some(
                                    (p) => p.id === v.project_id,
                                  ) ? (
                                    <option value={v.project_id}>
                                      Nåværende prosjekt
                                    </option>
                                  ) : null}
                                  {projects.map((p) => (
                                    <option key={p.id} value={p.id}>
                                      {p.title}
                                    </option>
                                  ))}
                                </select>
                              </label>
                            </>
                          )}
                        </DraftForm>
                      ) : (
                        <p>
                          Kontaktperson:{" "}
                          {unit.contact_name || "Ikke registrert"}
                        </p>
                      )}
                    </section>
                  ) : null}
                  {ctx.role === "manager" ? (
                    <details>
                      <summary>Skjul eller gjenopprett byggdeler</summary>
                      {[
                        ...record.blocks.map((b) => ({
                          ...b,
                          kind: "block",
                          label: b.name,
                        })),
                        ...record.entrances.map((e) => ({
                          ...e,
                          kind: "entrance",
                          label: e.address,
                        })),
                      ].map((x) => (
                        <div className="bolig-member" key={x.id}>
                          <span>{x.label}</span>
                          <button
                            type="button"
                            disabled={busy || record.root.archived}
                            onClick={() =>
                              change("archive", {
                                kind: x.kind,
                                id: x.id,
                                archived: !x.archived,
                              })
                            }
                          >
                            {x.archived ? "Gjenopprett" : "Skjul"}
                          </button>
                        </div>
                      ))}
                    </details>
                  ) : null}
                </>
              )}
            </section>
          </div>
        </>
      )}
    </dialog>
  );
}
