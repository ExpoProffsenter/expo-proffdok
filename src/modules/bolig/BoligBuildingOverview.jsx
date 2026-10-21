import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Building2,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  LayoutGrid,
  MapPin,
  X,
  CheckCircle2,
  Circle,
  FileCheck2,
  Package,
  Search,
  Settings2,
  TriangleAlert,
} from "lucide-react";
import BoligBuildingArt from "./BoligBuildingArt.jsx";
import { typeInfo } from "./boligStructure.js";
import { createPortal } from "react-dom";
import { useBoligUiState } from "./boligUiState.js";
import { getAppSupabaseClient } from "../access/appSupabaseClientRegistry.js";

export function unitStatus(unit, status, layer) {
  if (layer === "project")
    return unit.has_project
      ? { tone: "ready", label: "Prosjekt koblet", icon: "check" }
      : { tone: "empty", label: "Prosjekt mangler", icon: "empty" };
  if (!status)
    return { tone: "unknown", label: "Status ikke hentet", icon: "empty" };
  if (layer === "order") {
    if (status.order_outdated)
      return { tone: "review", label: "Se over varegrunnlag", icon: "review" };
    if (status.order_revision)
      return {
        tone: "ready",
        label: "Bestillingsutkast lagret",
        icon: "check",
      };
    return status.choice_revision
      ? { tone: "pending", label: "Klargjør bestilling", icon: "order" }
      : { tone: "empty", label: "Velg grunnpakke først", icon: "empty" };
  }
  if (status.catalog_changed)
    return { tone: "review", label: "Pakkeoppsett endret", icon: "review" };
  return status.choice_revision
    ? { tone: "ready", label: "Boligvalg lagret", icon: "check" }
    : { tone: "empty", label: "Boligvalg mangler", icon: "empty" };
}
const icons = {
  check: CheckCircle2,
  empty: Circle,
  review: TriangleAlert,
  order: Package,
};
export default function BoligBuildingOverview({
  context,
  record,
  unitId,
  onSelect,
  onSetup,
  query,
  onQuery,
}) {
  const [blockId, setBlockId] = useBoligUiState(
    context,
    `${record.root.id}:block`,
    "",
  );
  const [layer, setLayer] = useBoligUiState(
    context,
    `${record.root.id}:layer`,
    "choice",
  );
  const [statuses, setStatuses] = useState(null);
  const [error, setError] = useState("");
  const generation = useRef(0);
  useEffect(() => {
    let active = true;
    const load = async () => {
      const ticket = ++generation.current;
      try {
        const { data, error: failure } = await getAppSupabaseClient().rpc(
          "bolig_overview",
          { p_company_id: context.company_id, p_root_id: record.root.id },
        );
        if (failure) throw failure;
        if (
          data?.context?.company_id !== context.company_id ||
          data?.context?.user_id !== context.user_id ||
          data?.root_id !== record.root.id
        )
          throw Error("Firma eller prosjekt er endret.");
        if (active && ticket === generation.current) {
          setStatuses(
            Object.fromEntries(data.units.map((s) => [s.unit_id, s])),
          );
          setError("");
        }
      } catch (e) {
        if (active && ticket === generation.current) {
          setStatuses(null);
          setError(
            "Kunne ikke hente boligstatus. Hent siste versjon for å prøve igjen.",
          );
        }
      }
    };
    setStatuses(null);
    load();
    const events = [
      "focus",
      "expo-proffdok-bolig-catalog",
      "expo-proffdok-bolig-order",
    ];
    events.forEach((e) => window.addEventListener(e, load));
    return () => {
      active = false;
      ++generation.current;
      events.forEach((e) => window.removeEventListener(e, load));
    };
  }, [
    context.company_id,
    context.user_id,
    record.root.id,
    record.root.revision,
  ]);
  const [allBuildings, setAllBuildings] = useBoligUiState(
    context,
    `${record.root.id}:all-buildings`,
    false,
  );
  const [activeEntranceId, setActiveEntranceId] = useBoligUiState(
    context,
    `${record.root.id}:overview-entrance`,
    "",
  );
  const [buildingQuery, setBuildingQuery] = useBoligUiState(
    context,
    `${record.root.id}:building-search`,
    "",
  );
  const [pickerOpen, setPickerOpen] = useState(false),
    [capacity, setCapacity] = useState(1),
    [resultPage, setResultPage] = useState(0);
  const surface = useRef(null),
    picker = useRef(null),
    pickerTrigger = useRef(null),
    pickerSearch = useRef(null);
  useEffect(() => {
    if (pickerOpen) {
      picker.current?.showModal();
      pickerSearch.current?.focus();
    } else if (picker.current?.open) {
      picker.current.close();
      pickerTrigger.current?.focus({ preventScroll: true });
    }
  }, [pickerOpen]);
  useEffect(() => {
    const node = surface.current;
    const measure = () => setCapacity(node?.clientWidth >= 680 ? 2 : 1);
    measure();
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const { blocks, entrances, units, entranceMap, unitsByEntrance } =
    useMemo(() => {
      const blocks = record.blocks
          .filter((b) => !b.archived)
          .sort((a, b) =>
            a.name.localeCompare(b.name, "nb", { numeric: true }),
          ),
        blockIds = new Set(blocks.map((b) => b.id));
      const entrances = record.entrances
        .filter((e) => !e.archived && blockIds.has(e.block_id))
        .sort((a, b) =>
          a.address.localeCompare(b.address, "nb", { numeric: true }),
        );
      const entranceMap = new Map(entrances.map((e) => [e.id, e])),
        unitsByEntrance = new Map();
      const units = record.units.filter(
        (u) => !u.archived && entranceMap.has(u.entrance_id),
      );
      units.forEach((u) => {
        if (!unitsByEntrance.has(u.entrance_id))
          unitsByEntrance.set(u.entrance_id, []);
        unitsByEntrance.get(u.entrance_id).push(u);
      });
      return { blocks, entrances, units, entranceMap, unitsByEntrance };
    }, [record]);
  const selectedBlock = blocks.find((b) => b.id === blockId) || blocks[0];
  const blockEntrances = entrances.filter(
    (e) => e.block_id === selectedBlock?.id,
  );
  const activeEntrance =
    blockEntrances.find((e) => e.id === activeEntranceId) || blockEntrances[0];
  const entranceIndex = Math.max(
    0,
    blockEntrances.findIndex((e) => e.id === activeEntrance?.id),
  );
  const segmentStart = Math.min(
    Math.floor(entranceIndex / capacity) * capacity,
    Math.max(0, blockEntrances.length - capacity),
  );
  const shownEntrances = blockEntrances.slice(
    segmentStart,
    segmentStart + capacity,
  );
  const chooseBlock = (id) => {
    setBlockId(id);
    setAllBuildings(false);
    onQuery("");
    onSelect("");
    setPickerOpen(false);
  };
  const chooseEntrance = (e) => {
    setActiveEntranceId(e.id);
    if (
      unitId &&
      entranceMap.get(units.find((u) => u.id === unitId)?.entrance_id)?.id !==
        e.id
    )
      onSelect("");
  };
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const results = terms.length
    ? units.filter((u) => {
        const e = entranceMap.get(u.entrance_id),
          b = blocks.find((b) => b.id === e.block_id);
        return terms.every((t) =>
          `${u.number} ${u.contact_name || ""} ${u.contact_email || ""} ${u.contact_phone || ""} ${e.address} ${b.name}`
            .toLowerCase()
            .includes(t),
        );
      })
    : null;
  useEffect(() => setResultPage(0), [query]);
  const pageStart = Math.min(
    resultPage * 50,
    Math.max(0, (results?.length || 1) - 1),
  );
  const buildingTerms = buildingQuery
    .toLocaleLowerCase("nb")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const filteredBlocks = blocks.filter((b) =>
    buildingTerms.every((t) =>
      `${b.name} ${b.address || ""} ${entrances
        .filter((e) => e.block_id === b.id)
        .map((e) => e.address)
        .join(" ")}`
        .toLocaleLowerCase("nb")
        .includes(t),
    ),
  );
  const buildingCards = (compact = false) => (
    <div
      className={
        compact ? "bolig-building-picker-list" : "bolig-building-cards"
      }
    >
      {filteredBlocks.map((b) => {
        const es = entrances.filter((e) => e.block_id === b.id),
          us = es.flatMap((e) => unitsByEntrance.get(e.id) || []);
        const ready = us.filter(
          (u) => unitStatus(u, statuses?.[u.id], layer).tone === "ready",
        ).length;
        return (
          <button
            type="button"
            key={b.id}
            className="bolig-building-card"
            aria-label={`Åpne ${b.name}`}
            aria-pressed={selectedBlock?.id === b.id}
            onClick={() => chooseBlock(b.id)}
          >
            <BoligBuildingArt type={b.building_type} />
            <span>
              <b>{b.name}</b>
              <small>
                <MapPin size={13} />
                {b.address || es[0]?.address || "Adresse mangler"}
              </small>
              <small>
                {typeInfo(b.building_type).label} · {us.length} boliger
                {b.building_type === "house" ? "" : ` · ${es.length} oppganger`}
              </small>
              <small>
                {statuses
                  ? `${ready} av ${us.length} lagret / koblet`
                  : "Henter status …"}
              </small>
            </span>
            <ArrowRight size={17} />
          </button>
        );
      })}
      {!filteredBlocks.length && <p>Ingen bygg passer til søket.</p>}
    </div>
  );
  return (
    <section
      ref={surface}
      className="bolig-building-panel"
      aria-label="Byggoversikt"
    >
      <div className="bolig-building-breadcrumb">
        <button
          type="button"
          aria-pressed={allBuildings}
          onClick={() => {
            setAllBuildings(true);
            onSelect("");
          }}
        >
          <LayoutGrid size={15} />
          Alle bygg <small>{blocks.length}</small>
        </button>
        {!allBuildings && (
          <>
            <span>/</span>
            <b>{selectedBlock?.name || "Velg bygg"}</b>
          </>
        )}
      </div>
      <div className="bolig-building-toolbar">
        <h3>
          <Building2 size={20} />
          {allBuildings ? "Alle bygg" : selectedBlock?.name || "Byggoversikt"}
        </h3>
        <label className="bolig-overview-search">
          <Search size={16} />
          <span className="bolig-sr-only">Søk i hele hovedprosjektet</span>
          <input
            type="search"
            placeholder="Søk bolig, adresse eller kontakt"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
          />
        </label>
        <button type="button" onClick={onSetup}>
          <Settings2 size={15} />
          Oppsett
        </button>
      </div>
      {blocks.length > 1 && (
        <>
          <button
            ref={pickerTrigger}
            className="bolig-switch-building"
            type="button"
            aria-haspopup="dialog"
            aria-expanded={pickerOpen}
            onClick={() => setPickerOpen(true)}
          >
            <Building2 size={16} />
            Bytt bygg
            <ChevronDown size={15} />
          </button>
          {createPortal(
            <dialog
              ref={picker}
              className="bolig-dialog bolig-building-picker"
              aria-label="Bytt bygg"
              onCancel={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setPickerOpen(false);
              }}
            >
              <header>
                <h2>Bytt bygg</h2>
                <button
                  type="button"
                  aria-label="Lukk byggvelger"
                  onClick={() => setPickerOpen(false)}
                >
                  <X size={20} />
                </button>
              </header>
              <label>
                Søk bygg eller adresse
                <input
                  ref={pickerSearch}
                  type="search"
                  value={buildingQuery}
                  onChange={(e) => setBuildingQuery(e.target.value)}
                />
              </label>
              {buildingCards(true)}
            </dialog>,
            document.body,
          )}
        </>
      )}
      <nav className="bolig-layer-tabs" aria-label="Vis boligstatus">
        {[
          ["choice", "Boligvalg", FileCheck2],
          ["order", "Bestillingsutkast", Package],
          ["project", "Prosjektkobling", Building2],
        ].map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            aria-pressed={layer === id}
            onClick={() => setLayer(id)}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>
      {error && (
        <p role="status" className="bolig-overview-error">
          {error}
        </p>
      )}
      {results ? (
        <div className="bolig-search-results">
          <p>{results.length} boliger funnet i hele prosjektet</p>
          {results.slice(pageStart, pageStart + 50).map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => {
                setBlockId(
                  entrances.find((e) => e.id === u.entrance_id).block_id,
                );
                setActiveEntranceId(u.entrance_id);
                setAllBuildings(false);
                onQuery("");
                onSelect(u.id);
              }}
            >
              {u.number} ·{" "}
              {entrances.find((e) => e.id === u.entrance_id).address} ·{" "}
              {u.contact_name || "Kontakt ikke registrert"}
            </button>
          ))}
          {results.length > 50 && (
            <div className="bolig-result-pages">
              <button
                type="button"
                disabled={!resultPage}
                onClick={() => setResultPage((v) => v - 1)}
              >
                Forrige treff
              </button>
              <span>
                {pageStart + 1}–{Math.min(pageStart + 50, results.length)} av{" "}
                {results.length}
              </span>
              <button
                type="button"
                disabled={pageStart + 50 >= results.length}
                onClick={() => setResultPage((v) => v + 1)}
              >
                Neste treff
              </button>
            </div>
          )}
        </div>
      ) : allBuildings ? (
        <div className="bolig-all-buildings">
          <p>Velg et bygg for å se oppganger og boliger.</p>
          <label>
            Søk bygg eller adresse
            <input
              type="search"
              value={buildingQuery}
              onChange={(e) => setBuildingQuery(e.target.value)}
              placeholder="Byggnavn eller adresse"
            />
          </label>
          {buildingCards()}
        </div>
      ) : shownEntrances.length ? (
        <>
          {blockEntrances.length > 1 && (
            <div className="bolig-entrance-navigation">
              <div>
                <b>{selectedBlock.name}</b>
                <small>
                  {blockEntrances.length} oppganger · viser {segmentStart + 1}
                  {shownEntrances.length > 1
                    ? `–${segmentStart + shownEntrances.length}`
                    : ""}
                </small>
              </div>
              <label>
                <span className="bolig-sr-only">Velg oppgang</span>
                <select
                  aria-label="Velg oppgang"
                  value={activeEntrance?.id}
                  onChange={(ev) =>
                    chooseEntrance(
                      blockEntrances.find((e) => e.id === ev.target.value),
                    )
                  }
                >
                  {blockEntrances.map((e, i) => (
                    <option key={e.id} value={e.id}>
                      {i + 1}. {e.address}
                    </option>
                  ))}
                </select>
              </label>
              <nav aria-label="Naviger oppganger">
                <button
                  type="button"
                  disabled={entranceIndex === 0}
                  aria-label="Forrige oppgang"
                  onClick={() =>
                    chooseEntrance(blockEntrances[entranceIndex - 1])
                  }
                >
                  <ArrowLeft size={17} />
                </button>
                <button
                  type="button"
                  disabled={entranceIndex === blockEntrances.length - 1}
                  aria-label="Neste oppgang"
                  onClick={() =>
                    chooseEntrance(blockEntrances[entranceIndex + 1])
                  }
                >
                  <ArrowRight size={17} />
                </button>
              </nav>
              <div
                className="bolig-building-minimap"
                aria-label="Oppgangsoversikt"
              >
                {blockEntrances.map((e, i) => (
                  <button
                    type="button"
                    key={e.id}
                    title={e.address}
                    aria-label={`Vis ${e.address}`}
                    aria-pressed={activeEntrance?.id === e.id}
                    data-visible={shownEntrances.some((v) => v.id === e.id)}
                    style={{
                      "--floors": Math.max(
                        ...blockEntrances.map((v) => v.counts?.length || 1),
                      )
                        ? `${Math.max(28, ((e.counts?.length || 1) / Math.max(...blockEntrances.map((v) => v.counts?.length || 1))) * 100)}%`
                        : "100%",
                    }}
                    onClick={() => chooseEntrance(e)}
                  >
                    <span>{i + 1}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div
            className={`bolig-facade-scene bolig-connected-scene ${selectedBlock.building_type === "house" || selectedBlock.building_type === "duplex" ? "bolig-house-scene" : ""}`}
          >
            {selectedBlock.building_type === "house" ||
            selectedBlock.building_type === "duplex" ? (
              <BoligBuildingArt type={selectedBlock.building_type} />
            ) : null}
            <div className="bolig-buildings">
              {shownEntrances.map((e) => {
                const entranceUnits = unitsByEntrance.get(e.id) || [];
                const floors = [
                  ...new Set(entranceUnits.map((u) => u.floor)),
                ].sort((a, b) => b - a);
                return (
                  <article
                    key={e.id}
                    className={`bolig-building ${activeEntrance?.id === e.id ? "is-active-entrance" : ""}`}
                    style={{
                      minWidth: Math.max(
                        240,
                        Math.max(...(e.counts || [4])) * 56 + 70,
                      ),
                      "--entrance-position":
                        blockEntrances.indexOf(e) % 2 === 0 ? "left" : "right",
                    }}
                  >
                    <h4>{e.address}</h4>
                    <div className="bolig-roof" />
                    <div className="bolig-building-floors bolig-grid">
                      {floors.map((f) => (
                        <div className="bolig-facade-floor" key={f}>
                          <small>{f}. etg.</small>
                          <div
                            className="bolig-windows"
                            style={{
                              gridTemplateColumns: `repeat(${entranceUnits.filter((u) => u.floor === f).length}, minmax(52px,1fr))`,
                            }}
                          >
                            {entranceUnits
                              .filter((u) => u.floor === f)
                              .map((u) => {
                                const status = unitStatus(
                                    u,
                                    statuses?.[u.id],
                                    layer,
                                  ),
                                  Icon = icons[status.icon];
                                return (
                                  <button
                                    key={u.id}
                                    type="button"
                                    className={`bolig-window ${status.tone} ${unitId === u.id ? "selected" : ""}`}
                                    aria-pressed={unitId === u.id}
                                    aria-label={`${u.number} · ${e.address} · ${status.label}`}
                                    title={`${u.number} · ${status.label}`}
                                    onClick={() => {
                                      setActiveEntranceId(e.id);
                                      onSelect(u.id);
                                    }}
                                  >
                                    <b>{u.number}</b>
                                    <Icon size={18} />
                                    <span className="bolig-sr-only">
                                      {status.label}
                                    </span>
                                  </button>
                                );
                              })}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="bolig-ground-floor">
                      <span />
                      <span className="bolig-entrance-door" />
                      <span />
                    </div>
                  </article>
                );
              })}
            </div>
            <small className="bolig-illustration-note">
              Illustrert bygg · boligene følger registrerte etasjer og
              leiligheter
            </small>
          </div>
        </>
      ) : (
        <div className="bolig-empty-building">
          <Building2 size={40} />
          <h4>Bygg opp prosjektet</h4>
          <p>
            Legg til en blokk og oppgang. Boligene vises her når du har lagret
            antall etasjer og leiligheter.
          </p>
          <button type="button" onClick={onSetup}>
            Åpne oppsett
          </button>
        </div>
      )}
      <div className="bolig-status-legend">
        <span className="ready">
          <CheckCircle2 size={16} />
          Lagret / koblet
        </span>
        <span className="pending">
          <Package size={16} />
          Neste steg
        </span>
        <span className="empty">
          <Circle size={16} />
          Mangler
        </span>
        <span className="review">
          <TriangleAlert size={16} />
          Se over
        </span>
      </div>
      <p className="bolig-overview-caption">
        Velg en bolig i bygget. Fargene viser{" "}
        {layer === "choice"
          ? "lagrede valgsutkast"
          : layer === "order"
            ? "bestillingsutkast, ikke sendte bestillinger"
            : "kobling til ordinært leilighetsprosjekt"}
        . Fremdrift kobles til i en senere etappe.
      </p>
    </section>
  );
}
