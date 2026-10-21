import React, { useCallback, useEffect, useRef, useState } from "react";
import { WORK_PROFILE_EVENT } from "../access/workProfileClient.js";
import { useBoligContext } from "./boligAccess.js";
import { BoligHelp } from "../help/BoligHelp.jsx";
import {
  boligRpc,
  boligDraftKey,
  readBoligDraft,
  writeBoligDraft,
  clearBoligDraft,
} from "./boligClient.js";
import "./bolig.css";
import { useBoligUiState } from "./boligUiState.js";
import BoligTaskDialog from "./BoligTaskDialog.jsx";
import BoligProjectBuilder from "./BoligProjectBuilder.jsx";
import BoligProjectPicker from "./BoligProjectPicker.jsx";
import BoligCatalog from "./BoligCatalog.jsx";
import BoligBuildingOverview from "./BoligBuildingOverview.jsx";
import { Building2, Home, Settings2, RefreshCw, ArrowLeft } from "lucide-react";
export default function BoligEntry({ userId, onOpenProject, onExit }) {
  const { context, loadError } = useBoligContext(userId);
  const [open, setOpen] = useState(true);
  const exit = useRef(onExit);
  exit.current = onExit;
  const close = useCallback(() => {
    setOpen(false);
    exit.current?.();
  }, []);
  if (!context)
    return (
      <section className="bolig-entry-state" aria-label="Boligprosjekter">
        <h2>Boligprosjekter</h2>
        <p role="status">{loadError || "Henter firma og tilgang …"}</p>
      </section>
    );
  if (!context.enabled)
    return (
      <section className="bolig-entry-state" aria-label="Boligprosjekter">
        <h2>Boligprosjekter</h2>
        <p role="status">
          Boligprosjekter er ikke tilgjengelig for deg i valgt firma. Kontakt
          firmaadmin hvis du trenger tilgang.
        </p>
      </section>
    );
  return open ? (
    <BoligWorkspace
      key={`${userId}:${context.company_id}`}
      context={context}
      onClose={close}
      onOpenProject={onOpenProject}
    />
  ) : (
    <button type="button" onClick={() => setOpen(true)}>
      Åpne boligprosjekter
    </button>
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
function BoligWorkspace({ context, onClose, onOpenProject }) {
  const alive = useRef(true),
    selection = useRef(0);
  const [ctx, setCtx] = useState(context),
    [roots, setRoots] = useState([]),
    [record, setRecord] = useState(null),
    [projects, setProjects] = useState([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [entranceId, setEntranceId] = useBoligUiState(context, "entrance", ""),
    [unitId, setUnitId] = useBoligUiState(context, "unit", ""),
    [query, setQuery] = useBoligUiState(context, "query", ""),
    [view, setView] = useBoligUiState(context, "view", "overview");
  const [rootId, setRootId] = useBoligUiState(context, "root", "");
  const [setupArea, setSetupArea] = useBoligUiState(
    context,
    "setup-area",
    "structure",
  );
  useEffect(() => {
    setCtx(context);
    if (!context.enabled) {
      setRecord(null);
      setRoots([]);
      setProjects([]);
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
      if (value?.root) {
        setRecord(value);
        setRootId(value.root.id);
      }
      if (value?.projects) setProjects(value.projects);
    },
    [context.user_id, context.company_id, setRootId],
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
    const handleScope = (ev) => {
      if (ev.detail?.active_company_id !== context.company_id) onClose();
    };
    window.addEventListener(WORK_PROFILE_EVENT, handleScope);
    const load = async () => {
      try {
        if (context.enabled) {
          const listing = await request("list");
          const first =
            listing.roots?.find((r) => r.id === rootId) ||
            listing.roots?.find((r) => !r.archived);
          if (first && alive.current) await fetchRecord(first.id, true);
        }
      } catch (e) {
        if (alive.current) setError(e.message);
      }
    };
    load();
    return () => {
      alive.current = false;
      window.removeEventListener(WORK_PROFILE_EVENT, handleScope);
    };
  }, [context.company_id, context.enabled, request, onClose]);
  const fetchRecord = async (id, restore = false) => {
    const token = ++selection.current;
    setError("");
    try {
      const value = await boligRpc("get", {
        companyId: context.company_id,
        rootId: id,
      });
      if (alive.current && token === selection.current) {
        apply(value);
        setRootId(id);
        if (!restore) {
          setEntranceId("");
          setUnitId("");
        }
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
        return;
      }
      setCtx(c);
      await request("list");
      if (record) await request("get", { rootId: record.root.id });
    } catch (e) {
      setRecord(null);
      setRoots([]);
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
  const apartmentBlocks = activeBlocks.filter(
    (b) => !b.building_type || b.building_type === "apartment",
  );
  const entrances =
    record?.entrances.filter(
      (e) => !e.archived && activeBlocks.some((b) => b.id === e.block_id),
    ) || [];
  const entrance = entrances.find((e) => e.id === entranceId) || entrances[0];
  const visibleUnits =
    record?.units.filter(
      (u) => !u.archived && entrances.some((e) => e.id === u.entrance_id),
    ) || [];
  const unit = visibleUnits.find((u) => u.id === unitId);
  const block = record?.blocks.find((b) => b.id === entrance?.block_id);
  const creating = useRef(false);
  const createPlan = async (payload) => {
    if (creating.current) throw Error("Opprettelse pågår allerede.");
    creating.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await boligRpc("create_plan", {
        companyId: context.company_id,
        payload,
      });
      if (
        result?.receipt?.request_id !== payload.request_id ||
        result?.receipt?.root_id !== result?.root?.id
      )
        throw Error(
          "Mangler kvittering. Kontroller opprettelsen med samme oppsett.",
        );
      if (alive.current) {
        apply(result);
        setEntranceId("");
        setUnitId("");
        setView("overview");
        setNotice(
          "Prosjektforsiden er opprettet. Velg et bygg, eller åpne Oppsett for å lage grunnpakker og tilvalg.",
        );
        try {
          await request("list");
        } catch {
          /* The verified creation receipt remains authoritative. */
        }
      }
    } finally {
      creating.current = false;
      if (alive.current) setBusy(false);
    }
  };
  const builder = ctx.role === "manager" && (
    <BoligProjectBuilder context={ctx} onCreate={createPlan} busy={busy} />
  );
  const projectPicker = (
    <BoligProjectPicker
      roots={roots}
      activeRoot={record?.root}
      busy={busy}
      onSelect={async (id) => {
        setView("overview");
        await fetchRecord(id);
      }}
    ></BoligProjectPicker>
  );
  return (
    <section className="bolig-dialog bolig-page" aria-label="Boligprosjekter">
      <header>
        <div>
          <small>{ctx.company_name}</small>
          <h2>
            <Building2 size={23} /> Boligprosjekter
          </h2>
          <p>Byggoversikt, boligvalg og varebestillinger</p>
        </div>
        <button type="button" onClick={onClose}>
          <ArrowLeft size={16} /> Til startsiden
        </button>
      </header>
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
      <div className="bolig-utilities">
        <div className="bolig-toolbar">
          <button type="button" disabled={busy} onClick={refresh}>
            <RefreshCw size={14} /> Hent siste versjon
          </button>
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
        <BoligHelp />
        {ctx.enabled ? builder : null}
      </div>
      {!ctx.enabled ? null : (
        <>
          <div className="bolig-projects-layout">
            <section className="bolig-panel bolig-workspace">
              {!record ? (
                <div className="bolig-project-empty">
                  {projectPicker}
                  <p>
                    Velg eller opprett et hovedprosjekt. Legg så til bygg og
                    oppgang.
                  </p>
                </div>
              ) : (
                <>
                  <div className="bolig-project-header">
                    <div>
                      <small>HOVEDPROSJEKT</small>
                      <h3>{record.root.title}</h3>
                      <p>
                        {record.root.reference} · {visibleUnits.length}{" "}
                        {visibleUnits.length === 1 ? "bolig" : "boliger"} ·{" "}
                        {activeBlocks.length} bygg ·{" "}
                        {
                          entrances.filter((e) =>
                            apartmentBlocks.some((b) => b.id === e.block_id),
                          ).length
                        }{" "}
                        {entrances.filter((e) =>
                          apartmentBlocks.some((b) => b.id === e.block_id),
                        ).length === 1
                          ? "oppgang"
                          : "oppganger"}
                      </p>
                    </div>
                    <div className="bolig-project-actions">
                      {projectPicker}
                      <nav aria-label="Arbeidsområde">
                        <button
                          type="button"
                          aria-pressed={view === "overview"}
                          onClick={() => setView("overview")}
                        >
                          <Home size={17} />
                          Byggoversikt
                        </button>
                        <button
                          type="button"
                          aria-pressed={view === "setup"}
                          onClick={() => setView("setup")}
                        >
                          <Settings2 size={17} />
                          Oppsett
                        </button>
                      </nav>
                    </div>
                  </div>
                  <div
                    hidden={view !== "setup"}
                    className="bolig-project-configuration"
                  >
                    <h3>Oppsett av prosjektet</h3>
                    <p>
                      Velg hva du vil jobbe med. Kladden beholdes når du bytter
                      område.
                    </p>
                    <nav
                      className="bolig-setup-menu"
                      aria-label="Velg prosjektoppsett"
                    >
                      <button
                        type="button"
                        aria-pressed={setupArea === "structure"}
                        onClick={() => setSetupArea("structure")}
                      >
                        <Building2 size={23} />
                        <span>
                          <b>Bygg og boliger</b>
                          <small>
                            {activeBlocks.length} bygg · {visibleUnits.length}{" "}
                            boliger
                          </small>
                        </span>
                      </button>
                      <button
                        type="button"
                        aria-pressed={setupArea === "catalog"}
                        onClick={() => setSetupArea("catalog")}
                      >
                        <Home size={23} />
                        <span>
                          <b>Grunnpakker og tilvalg</b>
                          <small>Felles vareinnhold og alternativer</small>
                        </span>
                      </button>
                      <button
                        type="button"
                        aria-pressed={setupArea === "archive"}
                        onClick={() => setSetupArea("archive")}
                      >
                        <Settings2 size={23} />
                        <span>
                          <b>Arkiv og synlighet</b>
                          <small>Skjul eller gjenopprett byggdeler</small>
                        </span>
                      </button>
                    </nav>
                    <div hidden={setupArea !== "archive"}>
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
                    <div hidden={setupArea !== "catalog"}>
                      <BoligCatalog
                        key={
                          ctx.user_id +
                          ":" +
                          ctx.company_id +
                          ":" +
                          record.root.id
                        }
                        context={ctx}
                        root={record.root}
                      />
                    </div>
                    <div hidden={setupArea !== "structure"}>
                      {canWrite ? (
                        <div className="bolig-setup">
                          <details>
                            <summary>Legg til bygg</summary>
                            <DraftForm
                              key={record.root.id + "block"}
                              context={ctx}
                              root={record.root.id}
                              name="block"
                              busy={busy}
                              initial={{ name: "" }}
                              onSubmit={(v) => change("block", v)}
                              submitLabel="Lagre bygg"
                            >
                              {(v, c) => (
                                <label>
                                  Byggnavn
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
                          {apartmentBlocks.length ? (
                            <details>
                              <summary>Legg til oppgang</summary>
                              <DraftForm
                                key={record.root.id + "entrance"}
                                context={ctx}
                                root={record.root.id}
                                name="entrance"
                                busy={busy}
                                initial={{
                                  block_id: apartmentBlocks[0].id,
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
                                        {apartmentBlocks.map((b) => (
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
                        Bygg eller oppgang
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
                              {
                                record.blocks.find((b) => b.id === e.block_id)
                                  ?.name
                              }{" "}
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
                                      Færre etasjer skjuler tidligere boliger.
                                      De gjenopprettes med samme ID og historikk
                                      ved økning.
                                    </p>
                                  </>
                                )}
                              </DraftForm>
                            </details>
                          ) : null}
                        </>
                      ) : null}
                    </div>
                  </div>
                  <div
                    className={`bolig-main-grid ${unit ? "has-selected" : ""}`}
                    hidden={view !== "overview"}
                  >
                    <BoligBuildingOverview
                      key={record.root.id}
                      context={ctx}
                      record={record}
                      unitId={unitId}
                      query={query}
                      onQuery={setQuery}
                      onSetup={() => setView("setup")}
                      onSelect={(id) => {
                        setNotice("");
                        setUnitId(id);
                        const next = visibleUnits.find((u) => u.id === id);
                        if (next) setEntranceId(next.entrance_id);
                      }}
                    />
                    {unit ? (
                      <section className="bolig-unit" aria-label="Valgt bolig">
                        <button
                          className="bolig-mobile-back"
                          type="button"
                          onClick={() => setUnitId("")}
                        >
                          ← Tilbake til bygget
                        </button>
                        <small className="bolig-unit-eyebrow">
                          VALGT BOLIG
                        </small>
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
                        <div className="bolig-contact-summary">
                          <strong>
                            {unit.contact_name ||
                              "Kontaktperson ikke registrert"}
                          </strong>
                          <span>
                            {
                              entrances.find((e) => e.id === unit.entrance_id)
                                ?.address
                            }{" "}
                            · {unit.number}
                          </span>
                          <span>
                            {unit.contact_email || "E-post mangler"} ·{" "}
                            {unit.contact_phone || "Mobil mangler"}
                          </span>
                        </div>
                        <BoligTaskDialog title="Kontakt og leilighetsprosjekt">
                          {canWrite &&
                          (!unit.has_project || unit.project_id) ? (
                            <DraftForm
                              key={unit.id}
                              context={ctx}
                              root={record.root.id}
                              name={"unit-" + unit.id}
                              busy={busy}
                              initial={{
                                number: unit.number,
                                contact_name: unit.contact_name,
                                contact_email: unit.contact_email || "",
                                contact_phone: unit.contact_phone || "",
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
                                      onChange={(e) =>
                                        c("number", e.target.value)
                                      }
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
                                  <label>
                                    Adresse
                                    <input
                                      readOnly
                                      value={
                                        entrances.find(
                                          (e) => e.id === unit.entrance_id,
                                        )?.address || ""
                                      }
                                    />
                                    <small>
                                      Hentes automatisk fra oppgangen.
                                    </small>
                                  </label>
                                  <label>
                                    E-post
                                    <input
                                      type="email"
                                      maxLength={254}
                                      value={v.contact_email || ""}
                                      onChange={(e) =>
                                        c("contact_email", e.target.value)
                                      }
                                    />
                                  </label>
                                  <label>
                                    Mobil
                                    <input
                                      type="tel"
                                      maxLength={40}
                                      value={v.contact_phone || ""}
                                      onChange={(e) =>
                                        c("contact_phone", e.target.value)
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
                        </BoligTaskDialog>
                        <BoligCatalog
                          compact
                          key={unit.id + ":" + ctx.role}
                          context={ctx}
                          root={record.root}
                          unit={unit}
                        />
                      </section>
                    ) : (
                      <aside className="bolig-select-unit">
                        <Home size={34} />
                        <h3>Velg en bolig i bygget</h3>
                        <p>Se grunnpakke, tilvalg og bestillingsutkast her.</p>
                        <ol>
                          <li>Velg leilighet i oversikten.</li>
                          <li>Velg og lagre grunnpakke og tilvalg.</li>
                          <li>Klargjør varebestillingen.</li>
                        </ol>
                      </aside>
                    )}
                  </div>
                  {ctx.role === "manager" ? (
                    <details
                      hidden={view !== "setup" || setupArea !== "archive"}
                    >
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
    </section>
  );
}
