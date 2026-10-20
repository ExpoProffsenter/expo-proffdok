import React, { useEffect, useRef, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Circle,
  FileCheck2,
  Package,
  Search,
  Settings2,
  TriangleAlert,
} from "lucide-react";
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
  const [blockId, setBlockId] = useState("");
  const [layer, setLayer] = useState("choice");
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
  const blocks = record.blocks.filter((b) => !b.archived);
  const entrances = record.entrances.filter(
    (e) => !e.archived && blocks.some((b) => b.id === e.block_id),
  );
  const units = record.units.filter(
    (u) => !u.archived && entrances.some((e) => e.id === u.entrance_id),
  );
  const selectedBlock = blocks.find((b) => b.id === blockId) || blocks[0];
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const results = terms.length
    ? units.filter((u) => {
        const e = entrances.find((e) => e.id === u.entrance_id);
        const b = blocks.find((b) => b.id === e.block_id);
        return terms.every((t) =>
          `${u.number} ${u.contact_name || ""} ${e.address} ${b.name}`
            .toLowerCase()
            .includes(t),
        );
      })
    : null;
  const shownEntrances = entrances.filter(
    (e) => e.block_id === selectedBlock?.id,
  );
  return (
    <section className="bolig-building-panel" aria-label="Byggoversikt">
      <div className="bolig-building-toolbar">
        <h3>
          <Building2 size={20} />
          {selectedBlock?.name || "Byggoversikt"}
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
      <nav
        className="bolig-block-tabs"
        aria-label="Velg blokk"
        hidden={blocks.length < 2}
      >
        {blocks.map((b) => (
          <button
            key={b.id}
            type="button"
            aria-pressed={selectedBlock?.id === b.id}
            onClick={() => {
              setBlockId(b.id);
              onQuery("");
            }}
          >
            {b.name}
          </button>
        ))}
      </nav>
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
          {results.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => {
                setBlockId(
                  entrances.find((e) => e.id === u.entrance_id).block_id,
                );
                onQuery("");
                onSelect(u.id);
              }}
            >
              {u.number} ·{" "}
              {entrances.find((e) => e.id === u.entrance_id).address} ·{" "}
              {u.contact_name || "Kontakt ikke registrert"}
            </button>
          ))}
        </div>
      ) : shownEntrances.length ? (
        <div className="bolig-facade-scene">
          <div className="bolig-buildings">
            {shownEntrances.map((e) => {
              const floors = [
                ...new Set(
                  units
                    .filter((u) => u.entrance_id === e.id)
                    .map((u) => u.floor),
                ),
              ].sort((a, b) => b - a);
              return (
                <article
                  key={e.id}
                  className="bolig-building"
                  style={{
                    minWidth: Math.max(
                      265,
                      Math.max(...(e.counts || [4])) * 52 + 100,
                    ),
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
                            gridTemplateColumns: `repeat(${units.filter((u) => u.entrance_id === e.id && u.floor === f).length}, minmax(52px,1fr))`,
                          }}
                        >
                          {units
                            .filter(
                              (u) => u.entrance_id === e.id && u.floor === f,
                            )
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
                                  onClick={() => onSelect(u.id)}
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
            Illustrert bygg · boligene følger registrerte etasjer og leiligheter
          </small>
        </div>
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
