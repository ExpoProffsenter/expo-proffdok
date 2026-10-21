import React, { useState } from "react";
import { Truck, Building2, ChevronRight } from "lucide-react";
import Dialog from "./BoligEditorDialog.jsx";
const labels = {
  prepared_count: "Klargjorte ordre",
  ordered_count: "Bestilte ordre",
  partial_count: "Delvis leverte ordre",
  delivered_count: "Leverte ordre",
};
export default function BoligDeliveryOverview({
  blocks,
  entrances,
  units,
  statuses,
  selectedBlockId,
  onSelect,
}) {
  const [scope, setScope] = useState(null),
    [query, setQuery] = useState(""),
    [limit, setLimit] = useState(40);
  const close = () => setScope(null);
  const open = (id) => {
    setScope(id);
    setQuery("");
    setLimit(40);
  };
  const selected =
    scope === "project" ? null : blocks.find((b) => b.id === scope);
  const included = units.filter(
    (u) =>
      scope === "project" ||
      entrances.find((e) => e.id === u.entrance_id)?.block_id === scope,
  );
  const totals = Object.fromEntries(
    Object.keys(labels).map((key) => [
      key,
      statuses
        ? included.reduce((n, u) => n + Number(statuses[u.id]?.[key] || 0), 0)
        : null,
    ]),
  );
  const displayed = included.filter((u) => {
    const e = entrances.find((e) => e.id === u.entrance_id),
      b = blocks.find((b) => b.id === e?.block_id);
    return `${u.number} ${u.official_number || ""} ${e?.address || ""} ${b?.name || ""}`
      .toLowerCase()
      .includes(query.toLowerCase().trim());
  });
  return (
    <>
      <div className="bolig-delivery-actions bolig-overview-delivery-actions">
        <button
          type="button"
          onClick={() => open(selectedBlockId)}
          disabled={!selectedBlockId}
        >
          <Truck size={17} />
          Leveranser i bygget
        </button>
        <button type="button" onClick={() => open("project")}>
          <Building2 size={17} />
          Leveranser i prosjektet
        </button>
      </div>
      {scope && (
        <Dialog title="Leveranseoversikt" onClose={close}>
          <p>
            <strong>{selected?.name || "Hele hovedprosjektet"}</strong> ·{" "}
            {included.length} boliger
          </p>
          <label>
            Vis leveranser for
            <select value={scope} onChange={(e) => open(e.target.value)}>
              <option value="project">Hele hovedprosjektet</option>
              {blocks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>
          {!statuses ? (
            <p role="status">
              Leveransestatus er ikke tilgjengelig. Lukk og hent siste versjon
              før du prøver igjen.
            </p>
          ) : (
            <>
              <div className="bolig-delivery-totals">
                {Object.entries(labels).map(([key, label]) => (
                  <div key={key}>
                    <strong>{totals[key]}</strong>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
              <p>
                Antall gjelder ordre. Én bolig kan ha flere ordre. Varemottak er
                ikke ferdigstilling av arbeidet.
              </p>
              <label>
                Søk bolig eller adresse
                <input
                  type="search"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setLimit(40);
                  }}
                  placeholder="Leilighetsnummer, bygg eller adresse"
                />
              </label>
              <ul className="bolig-summary-list">
                {displayed.slice(0, limit).map((u) => {
                  const s = statuses[u.id],
                    e = entrances.find((e) => e.id === u.entrance_id);
                  return (
                    <li key={u.id}>
                      <button
                        type="button"
                        onClick={() => {
                          close();
                          onSelect(u.id);
                        }}
                      >
                        <span>
                          <strong>
                            {u.number} · {e?.address}
                          </strong>
                          <small>
                            {!s
                              ? "Status ikke hentet"
                              : s.purchase_count
                                ? `${s.prepared_count || 0} klargjort · ${s.ordered_count || 0} bestilt · ${s.partial_count || 0} delvis levert · ${s.delivered_count || 0} levert`
                                : s.order_revision
                                  ? "Vareutvalg lagret – ingen ordre klargjort"
                                  : "Ingen bestillingsutkast"}
                            {s?.purchase_outdated
                              ? " · Varegrunnlag endret"
                              : ""}
                          </small>
                        </span>
                        <ChevronRight size={18} />
                      </button>
                    </li>
                  );
                })}
              </ul>
              {!displayed.length && <p>Ingen boliger passer til søket.</p>}
              {displayed.length > limit && (
                <button type="button" onClick={() => setLimit(limit + 40)}>
                  Vis 40 flere boliger
                </button>
              )}
            </>
          )}
          <footer>
            <button type="button" onClick={close}>
              Tilbake til byggoversikten
            </button>
          </footer>
        </Dialog>
      )}
    </>
  );
}
