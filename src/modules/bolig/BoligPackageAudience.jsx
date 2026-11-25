import React, { useState } from "react";
import "./boligPackageAudience.css";

export default function BoligPackageAudience({ units, value, onChange }) {
  const [block, setBlock] = useState("");
  const [group, setGroup] = useState("");
  const visible = units.filter((unit) =>
    (!block || unit.block_id === block) && (!group || unit.group_id === group)
  );
  const selected = new Set(value);
  const selectedUnits = units.filter((unit) => selected.has(unit.id));
  const blocks = new Map(units.map((unit) => [unit.block_id, unit.block_name]));
  const groups = new Map(units.filter((unit) => unit.group_id).map((unit) => [unit.group_id, unit.group_name]));
  const update = (ids, include) => {
    for (const id of ids) {
      if (include) selected.add(id);
      else selected.delete(id);
    }
    onChange(units.filter((unit) => selected.has(unit.id)).map((unit) => unit.id));
  };
  const label = (unit) => `${unit.block_name} · Bolig ${unit.number}${unit.group_name ? ` · ${unit.group_name}` : ""}`;

  return (
    <section className="bolig-package-audience" aria-label="Gjelder for">
      <h3>Gjelder for</h3>
      <p>Velg boliger enkeltvis, eller bruk bygg og stamme for å velge flere. Valget lagres med pakken.</p>
      <div className="bolig-package-audience-filters">
        <label>
          Bygg eller blokk
          <select aria-label="Bygg eller blokk" value={block} onChange={(event) => setBlock(event.target.value)}>
            <option value="">Alle bygg</option>
            {[...blocks].map(([id, name]) => <option key={id} value={id}>{name}</option>)}
          </select>
        </label>
        <label>
          Stamme
          <select aria-label="Stamme" value={group} onChange={(event) => setGroup(event.target.value)}>
            <option value="">Alle stammer</option>
            {[...groups].map(([id, name]) => <option key={id} value={id}>{name}</option>)}
          </select>
        </label>
      </div>
      <div className="bolig-package-audience-actions">
        <button type="button" disabled={!visible.length} onClick={() => update(visible.map((unit) => unit.id), true)}>
          Velg alle viste boliger
        </button>
        <button type="button" disabled={!visible.some((unit) => selected.has(unit.id))} onClick={() => update(visible.map((unit) => unit.id), false)}>
          Fjern alle viste boliger
        </button>
      </div>
      <p role="status">{selectedUnits.length} av {units.length} boliger valgt</p>
      {visible.length > 0 && (
        <div className="bolig-package-audience-units" role="group" aria-label="Velg boliger">
          {visible.map((unit) => (
            <label key={unit.id}>
              <input type="checkbox" checked={selected.has(unit.id)} onChange={(event) => update([unit.id], event.target.checked)} />
              {label(unit)}
            </label>
          ))}
        </div>
      )}
      {selectedUnits.length > 0 && (
        <details>
          <summary>Se alle valgte boliger</summary>
          <ul>{selectedUnits.map((unit) => <li key={unit.id}>{label(unit)}</li>)}</ul>
        </details>
      )}
    </section>
  );
}
