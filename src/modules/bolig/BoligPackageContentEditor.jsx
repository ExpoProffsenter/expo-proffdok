import React, { useState } from "react";
import { ArrowUp, ArrowDown, Plus, Trash2 } from "lucide-react";
import BoligImageUpload from "./BoligImageUpload.jsx";
import BoligCatalogLookup from "./BoligCatalogLookup.jsx";
import { packageGroups, newPackageLine } from "./boligPackageSections.js";
function Fold({ title, initialOpen, children }) {
  const [open, setOpen] = useState(initialOpen);
  return (
    <details
      className="bolig-edit-line"
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
    >
      <summary>{title}</summary>
      {children}
    </details>
  );
}
function SectionBody({ group, children }) {
  const [open, setOpen] = useState(!group.name);
  if (!group.id) return <>{children}</>;
  return (
    <details
      className="bolig-edit-section"
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
    >
      <summary>{group.lines.length} varer · Vis / skjul innhold</summary>
      {children}
    </details>
  );
}
export default function BoligPackageContentEditor({
  value: v,
  change: c,
  context,
  rootId,
  base = true,
}) {
  const [target, setTarget] = useState("");
  const sections = v.sections || [],
    lines = v.lines || [],
    active = sections.some((s) => s.id === target) ? target : "";
  const patch = (key, fields) =>
    c((current) => ({
      lines: (current.lines || lines).map((l) =>
        l.key === key ? { ...l, ...fields } : l,
      ),
    }));
  const swap = (items, index, delta) => {
    const next = [...items];
    [next[index], next[index + delta]] = [next[index + delta], next[index]];
    return next;
  };
  const add = (id) => c("lines", [...lines, newPackageLine(id)]);
  return (
    <section className="bolig-content-editor" aria-label="Varer og avsnitt">
      <div className="bolig-content-editor-heading">
        <div>
          <h4>Varer og avsnitt</h4>
          <p>
            Del leveransen inn i for eksempel Fliser, Baderomsinnredning og
            Dusjvegger. Avsnitt har ingen egen pris.
          </p>
        </div>
        <button
          type="button"
          disabled={sections.length >= 30}
          onClick={() => {
            const id = crypto.randomUUID();
            c("sections", [...sections, { id, name: "", description: "" }]);
            setTarget(id);
          }}
        >
          <Plus size={16} />
          Legg til avsnitt
        </button>
      </div>
      <label>
        Legg nye varer i
        <select
          aria-label="Legg nye varer i"
          value={active}
          onChange={(e) => setTarget(e.target.value)}
        >
          <option value="">Uten avsnitt</option>
          {sections.map((s, i) => (
            <option key={s.id} value={s.id}>
              {s.name || `Nytt avsnitt ${i + 1}`}
            </option>
          ))}
        </select>
      </label>
      <BoligCatalogLookup
        context={context}
        onUse={(item) => {
          const empty = lines.findIndex(
            (l) => !l.name && !l.sku && (l.section_id || "") === active,
          );
          const line = {
            ...newPackageLine(active),
            name: item.name,
            sku: item.sku,
            image_url: item.image_url,
            product_url: item.product_url,
          };
          c(
            "lines",
            empty >= 0
              ? lines.map((l, i) => (i === empty ? { ...line, key: l.key } : l))
              : [...lines, line],
          );
        }}
      />
      {packageGroups(sections, lines).map((group) => {
        const si = sections.findIndex((s) => s.id === group.id);
        return (
          <article className="bolig-content-section" key={group.id || "none"}>
            {group.id ? (
              <div className="bolig-content-section-head">
                <label>
                  Avsnittsnavn {si + 1}
                  <input
                    required
                    maxLength={120}
                    value={group.name}
                    placeholder="F.eks. Fliser"
                    onChange={(e) =>
                      c(
                        "sections",
                        sections.map((s) =>
                          s.id === group.id
                            ? { ...s, name: e.target.value }
                            : s,
                        ),
                      )
                    }
                  />
                </label>
                <div className="bolig-content-section-actions">
                  <button
                    type="button"
                    aria-label={`Flytt avsnitt ${si + 1} opp`}
                    disabled={si === 0}
                    onClick={() => c("sections", swap(sections, si, -1))}
                  >
                    <ArrowUp size={15} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Flytt avsnitt ${si + 1} ned`}
                    disabled={si === sections.length - 1}
                    onClick={() => c("sections", swap(sections, si, 1))}
                  >
                    <ArrowDown size={15} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Fjern avsnitt ${si + 1}, behold varene`}
                    onClick={() =>
                      c({
                        sections: sections.filter((s) => s.id !== group.id),
                        lines: lines.map((l) =>
                          l.section_id === group.id
                            ? { ...l, section_id: "" }
                            : l,
                        ),
                      })
                    }
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ) : (
              <h4>Uten avsnitt</h4>
            )}
            <SectionBody group={group}>
              {group.id && (
                <label className="bolig-content-description">
                  Kort tekst til kunden {si + 1} (valgfritt)
                  <textarea
                    rows={2}
                    maxLength={1000}
                    value={group.description}
                    onChange={(e) =>
                      c(
                        "sections",
                        sections.map((s) =>
                          s.id === group.id
                            ? { ...s, description: e.target.value }
                            : s,
                        ),
                      )
                    }
                  />
                </label>
              )}
              {!group.lines.length && (
                <p>Ingen varer i dette avsnittet ennå.</p>
              )}
              {group.lines.map((line, localIndex) => {
                const index = lines.findIndex((l) => l.key === line.key),
                  n = index + 1;
                return (
                  <Fold
                    key={line.key}
                    initialOpen={!line.name}
                    title={`${line.name || "Ny vare"} · ${line.quantity} ${line.unit}`}
                  >
                    <div className="bolig-section-line-fields">
                      <label>
                        Varebeskrivelse {n}
                        <input
                          required
                          maxLength={160}
                          value={line.name}
                          onChange={(e) =>
                            patch(line.key, { name: e.target.value })
                          }
                        />
                      </label>
                      <label>
                        Varenummer {n}
                        <input
                          maxLength={80}
                          value={line.sku}
                          onChange={(e) =>
                            patch(line.key, { sku: e.target.value })
                          }
                        />
                      </label>
                      <label>
                        Antall {n}
                        <input
                          required
                          type="number"
                          min="0.001"
                          max="10000"
                          step="0.001"
                          value={line.quantity}
                          onChange={(e) =>
                            patch(line.key, { quantity: e.target.value })
                          }
                        />
                      </label>
                      <label>
                        Enhet {n}
                        <input
                          required
                          maxLength={20}
                          value={line.unit}
                          onChange={(e) =>
                            patch(line.key, { unit: e.target.value })
                          }
                        />
                      </label>
                      {base && (
                        <label>
                          Grunnsum inkl. mva. {n}
                          <input
                            inputMode="decimal"
                            value={line.credit ?? ""}
                            onChange={(e) =>
                              patch(line.key, { credit: e.target.value })
                            }
                          />
                          <small>
                            Valgfri sum for hele varelinjen. Brukes bare ved
                            fratrekk.
                          </small>
                        </label>
                      )}
                      <label>
                        Avsnitt for vare {n}
                        <select
                          aria-label={`Avsnitt for vare ${n}`}
                          value={line.section_id || ""}
                          onChange={(e) =>
                            patch(line.key, { section_id: e.target.value })
                          }
                        >
                          <option value="">Uten avsnitt</option>
                          {sections.map((s, i) => (
                            <option key={s.id} value={s.id}>
                              {s.name || `Nytt avsnitt ${i + 1}`}
                            </option>
                          ))}
                        </select>
                      </label>
                      <BoligImageUpload
                        context={context}
                        rootId={rootId}
                        value={line.image_url}
                        label={`Bilde for varelinje ${n}`}
                        onChange={(image_url) => patch(line.key, { image_url })}
                      />
                      <div className="bolig-content-line-actions">
                        <button
                          type="button"
                          aria-label={`Flytt vare ${n} opp`}
                          disabled={localIndex === 0}
                          onClick={() =>
                            c(
                              "lines",
                              swap(
                                lines,
                                index,
                                lines.findIndex(
                                  (l) =>
                                    l.key === group.lines[localIndex - 1].key,
                                ) - index,
                              ),
                            )
                          }
                        >
                          <ArrowUp size={15} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Flytt vare ${n} ned`}
                          disabled={localIndex === group.lines.length - 1}
                          onClick={() =>
                            c(
                              "lines",
                              swap(
                                lines,
                                index,
                                lines.findIndex(
                                  (l) =>
                                    l.key === group.lines[localIndex + 1].key,
                                ) - index,
                              ),
                            )
                          }
                        >
                          <ArrowDown size={15} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Fjern varelinje ${n}`}
                          disabled={lines.length === 1}
                          onClick={() =>
                            c(
                              "lines",
                              lines.filter((l) => l.key !== line.key),
                            )
                          }
                        >
                          <Trash2 size={15} />
                          Fjern vare
                        </button>
                      </div>
                    </div>
                  </Fold>
                );
              })}
              <button
                type="button"
                disabled={lines.length >= 100}
                onClick={() => add(group.id)}
              >
                <Plus size={15} />
                {group.id
                  ? `Legg til vare i ${group.name || "avsnittet"}`
                  : "Legg til varelinje"}
              </button>
            </SectionBody>
          </article>
        );
      })}
      {!lines.length && (
        <button type="button" onClick={() => add(active)}>
          Legg til varelinje
        </button>
      )}
    </section>
  );
}
