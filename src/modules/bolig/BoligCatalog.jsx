import React, { useEffect, useRef, useState } from "react";
import {
  boligCatalogRpc,
  money,
  toCents,
  optionBreakdown,
} from "./boligCatalogClient.js";
import {
  boligDraftKey,
  readBoligDraft,
  writeBoligDraft,
  clearBoligDraft,
} from "./boligClient.js";
import { WORK_PROFILE_EVENT } from "../access/workProfileClient.js";
import {
  MANAGED_ACCESS_EVENT,
  MODULE_ACCESS_EVENT,
} from "../access/moduleAccessClient.js";
const CATALOG_EVENT = "expo-proffdok-bolig-catalog";
const newLine = () => ({
  key: crypto.randomUUID(),
  name: "",
  sku: "",
  quantity: 1,
  unit: "stk",
  credit: "",
});
function CatalogForm({
  context,
  rootId,
  name,
  initial,
  basis,
  busy,
  onSave,
  children,
  submitLabel,
}) {
  const key = boligDraftKey(context, rootId, "catalog-" + name),
    [value, setValue] = useState(() => {
      const draft = readBoligDraft(key, initial);
      return { ...draft, _basis: draft._basis || basis };
    }),
    [error, setError] = useState("");
  const change = (field, next) => {
    const updated = { ...value, [field]: next };
    if (!writeBoligDraft(key, updated))
      setError("Kladden kunne ikke sikres lokalt. Behold siden åpen.");
    setValue(updated);
  };
  return (
    <form
      className="bolig-catalog-form"
      onSubmit={async (e) => {
        e.preventDefault();
        setError("");
        try {
          const saved = await onSave(value, value._basis);
          if (saved) {
            clearBoligDraft(key);
            if (name.startsWith("choice-"))
              setValue((v) => ({
                ...v,
                _basis: {
                  catalog_revision: saved.revision,
                  choice_revision: saved.selection.revision,
                },
              }));
            else setValue({ ...initial, _basis: basis });
          }
        } catch (err) {
          setError(err.message);
        }
      }}
    >
      {JSON.stringify(value._basis) !== JSON.stringify(basis) && (
        <p role="status">
          Grunnlaget er endret. Kladden er beholdt. Se over dagens pakker og
          priser før du fortsetter.{" "}
          <button
            type="button"
            disabled={busy}
            onClick={() => change("_basis", basis)}
          >
            Se over og bruk siste grunnlag
          </button>
        </p>
      )}
      <fieldset disabled={busy}>
        {children(value, change)}
        <button type="submit">{submitLabel}</button>
      </fieldset>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
function PackageEditor({
  context,
  rootId,
  entry,
  revision,
  busy,
  save,
  onCancel,
}) {
  const initial = {
    id: entry?.id || "",
    name: entry?.name || "",
    lines: entry?.lines.map((l) => ({
      ...l,
      credit: l.credit_cents == null ? "" : String(l.credit_cents / 100),
    })) || [newLine()],
  };
  return (
    <CatalogForm
      context={context}
      rootId={rootId}
      name={"package-" + (entry?.id || "new")}
      basis={{ catalog_revision: revision }}
      initial={initial}
      busy={busy}
      submitLabel="Lagre grunnpakke"
      onSave={(v, basis) =>
        save(
          "package",
          {
            id: v.id,
            name: v.name,
            lines: v.lines.map(({ credit, ...l }) => ({
              ...l,
              quantity: Number(l.quantity),
              credit_cents:
                String(credit).trim() === "" ? null : toCents(credit),
            })),
          },
          basis.catalog_revision,
        )
      }
    >
      {(v, c) => (
        <>
          <h4>{entry ? "Rediger grunnpakke" : "Ny grunnpakke"}</h4>
          <label>
            Pakkenavn
            <input
              required
              maxLength={120}
              value={v.name}
              onChange={(e) => c("name", e.target.value)}
            />
          </label>
          <p>
            Grunnpakken er inkludert i hovedentreprisen og trenger ingen
            totalsum. Oppgi valgfri grunnsum per varelinje bare når den skal
            brukes som fratrekk ved et alternativ. Varenummer og antall beholdes
            i varegrunnlaget.
          </p>
          {v.lines.map((line, index) => (
            <div className="bolig-catalog-line" key={line.key}>
              <label>
                Varebeskrivelse {index + 1}
                <input
                  required
                  maxLength={160}
                  value={line.name}
                  onChange={(e) =>
                    c(
                      "lines",
                      v.lines.map((l) =>
                        l.key === line.key ? { ...l, name: e.target.value } : l,
                      ),
                    )
                  }
                />
              </label>
              <label>
                Varenummer {index + 1}
                <input
                  maxLength={80}
                  value={line.sku}
                  onChange={(e) =>
                    c(
                      "lines",
                      v.lines.map((l) =>
                        l.key === line.key ? { ...l, sku: e.target.value } : l,
                      ),
                    )
                  }
                />
              </label>
              <label>
                Antall {index + 1}
                <input
                  type="number"
                  min="0.001"
                  max="10000"
                  step="0.001"
                  required
                  value={line.quantity}
                  onChange={(e) =>
                    c(
                      "lines",
                      v.lines.map((l) =>
                        l.key === line.key
                          ? { ...l, quantity: e.target.value }
                          : l,
                      ),
                    )
                  }
                />
              </label>
              <label>
                Enhet {index + 1}
                <input
                  required
                  maxLength={20}
                  value={line.unit}
                  onChange={(e) =>
                    c(
                      "lines",
                      v.lines.map((l) =>
                        l.key === line.key ? { ...l, unit: e.target.value } : l,
                      ),
                    )
                  }
                />
              </label>
              <label>
                Grunnsum inkl. mva. {index + 1}
                <input
                  inputMode="decimal"
                  placeholder="Valgfritt fratrekksbeløp"
                  value={line.credit}
                  onChange={(e) =>
                    c(
                      "lines",
                      v.lines.map((l) =>
                        l.key === line.key
                          ? { ...l, credit: e.target.value }
                          : l,
                      ),
                    )
                  }
                />
              </label>
              <button
                type="button"
                disabled={v.lines.length === 1}
                onClick={() =>
                  c(
                    "lines",
                    v.lines.filter((l) => l.key !== line.key),
                  )
                }
              >
                Fjern varelinje {index + 1}
              </button>
            </div>
          ))}
          <button
            type="button"
            disabled={v.lines.length >= 100}
            onClick={() => c("lines", [...v.lines, newLine()])}
          >
            Legg til varelinje
          </button>
          <button type="button" onClick={onCancel}>
            Lukk pakkeredigering
          </button>
        </>
      )}
    </CatalogForm>
  );
}
function OptionEditor({
  context,
  rootId,
  entry,
  packages,
  revision,
  busy,
  save,
  onCancel,
}) {
  const initial = {
    id: entry?.id || "",
    name: entry?.name || "",
    sku: entry?.sku || "",
    quantity: entry?.quantity || 1,
    unit: entry?.unit || "stk",
    price: String((entry?.price_cents || 0) / 100),
    replace_key: entry?.replace_key || "",
    deduct_base: entry?.deduct_base || false,
  };
  const lines = packages
    .filter((p) => !p.archived)
    .flatMap((p) => p.lines.map((l) => ({ ...l, packageName: p.name })));
  return (
    <CatalogForm
      context={context}
      rootId={rootId}
      name={"option-" + (entry?.id || "new")}
      basis={{ catalog_revision: revision }}
      initial={initial}
      busy={busy}
      submitLabel="Lagre tilvalg"
      onSave={(v, basis) =>
        save(
          "option",
          {
            id: v.id,
            name: v.name,
            sku: v.sku,
            quantity: Number(v.quantity),
            unit: v.unit,
            price_cents: toCents(v.price),
            replace_key: v.replace_key,
            deduct_base: !!v.replace_key && v.deduct_base,
          },
          basis.catalog_revision,
        )
      }
    >
      {(v, c) => (
        <>
          <h4>{entry ? "Rediger tilvalg" : "Nytt tilvalg"}</h4>
          <label>
            Navn på tilvalg
            <input
              required
              maxLength={120}
              value={v.name}
              onChange={(e) => c("name", e.target.value)}
            />
          </label>
          <label>
            Tilvalgstype
            <select
              value={v.replace_key ? "alternative" : "additional"}
              onChange={(e) => {
                c(
                  "replace_key",
                  e.target.value === "alternative" ? lines[0]?.key || "" : "",
                );
              }}
            >
              <option value="additional">Tillegg til grunnpakken</option>
              <option value="alternative" disabled={!lines.length}>
                Alternativ til en standardvare
              </option>
            </select>
          </label>
          {v.replace_key && (
            <>
              <label>
                Erstatter standardvare
                <select
                  value={v.replace_key}
                  onChange={(e) => c("replace_key", e.target.value)}
                >
                  {!lines.some((l) => l.key === v.replace_key) && (
                    <option value={v.replace_key}>
                      Tidligere standardvare – velg på nytt
                    </option>
                  )}
                  {lines.map((l) => (
                    <option key={l.key} value={l.key}>
                      {l.packageName} · {l.name} · grunnsum{" "}
                      {l.credit_cents == null
                        ? "ikke angitt"
                        : money(l.credit_cents)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="bolig-catalog-check">
                <input
                  type="checkbox"
                  checked={v.deduct_base}
                  onChange={(e) => c("deduct_base", e.target.checked)}
                />
                Trekk fra grunnsummen for standardvaren
              </label>
            </>
          )}
          <label>
            Varenummer for tilvalget
            <input
              maxLength={80}
              value={v.sku}
              onChange={(e) => c("sku", e.target.value)}
            />
          </label>
          <div className="bolig-catalog-pair">
            <label>
              Antall i tilvalget
              <input
                type="number"
                min="0.001"
                max="10000"
                step="0.001"
                required
                value={v.quantity}
                onChange={(e) => c("quantity", e.target.value)}
              />
            </label>
            <label>
              Enhet for tilvalget
              <input
                required
                maxLength={20}
                value={v.unit}
                onChange={(e) => c("unit", e.target.value)}
              />
            </label>
          </div>
          <label>
            Pris for hele tilvalget inkl. mva.
            <input
              required
              inputMode="decimal"
              value={v.price}
              onChange={(e) => c("price", e.target.value)}
            />
          </label>
          <p>
            Prisen gjelder antallet over. Ved alternativ vises fratrekk og
            mellomlegg når pakken velges for boligen. Et alternativ erstatter
            hele standardvarelinjen.
          </p>
          <button type="button" onClick={onCancel}>
            Lukk tilvalgsredigering
          </button>
        </>
      )}
    </CatalogForm>
  );
}
function ChoiceEditor({ context, root, state, unit, busy, save }) {
  const old = state.selection?.snapshot,
    initial = {
      package_id: old?.package.id || "",
      option_ids: old?.options.map((o) => o.id) || [],
    };
  return (
    <CatalogForm
      context={context}
      rootId={root.id}
      name={"choice-" + unit.id}
      basis={{
        catalog_revision: state.revision,
        choice_revision: state.selection?.revision || 0,
      }}
      initial={initial}
      busy={busy}
      submitLabel="Lagre boligvalg som utkast"
      onSave={(v, basis) =>
        save(
          "choose",
          {
            package_id: v.package_id,
            option_ids: v.option_ids,
            unit_id: unit.id,
            choice_revision: basis.choice_revision,
          },
          basis.catalog_revision,
        )
      }
    >
      {(v, c) => {
        const pkg = state.packages.find(
            (p) => p.id === v.package_id && !p.archived,
          ),
          selected = state.options.filter((o) => v.option_ids.includes(o.id));
        const invalid =
          selected.some(
            (o) =>
              o.archived ||
              !optionBreakdown(o, pkg).compatible ||
              optionBreakdown(o, pkg).missingCredit,
          ) || v.option_ids.some((id) => !selected.some((o) => o.id === id));
        const total = selected.reduce(
          (sum, o) => sum + optionBreakdown(o, pkg).net,
          0,
        );
        return (
          <>
            <label>
              Grunnpakke for boligen
              <select
                required
                value={v.package_id}
                onChange={(e) => {
                  c("package_id", e.target.value);
                }}
              >
                <option value="">Velg grunnpakke</option>
                {v.package_id && !pkg && (
                  <option value={v.package_id}>
                    Tidligere pakke – velg en aktiv pakke
                  </option>
                )}
                {state.packages
                  .filter((p) => !p.archived)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </select>
            </label>
            {pkg && (
              <>
                <h4>Innhold i {pkg.name}</h4>
                <ul>
                  {pkg.lines.map((l) => (
                    <li key={l.key}>
                      {l.quantity} {l.unit} {l.name} · grunnsum{" "}
                      {l.credit_cents == null
                        ? "ikke angitt"
                        : money(l.credit_cents)}
                    </li>
                  ))}
                </ul>
                <h4>Velg tilvalg</h4>
                {state.options.map((o) => {
                  const b = optionBreakdown(o, pkg),
                    checked = v.option_ids.includes(o.id);
                  if (o.archived && !checked) return null;
                  return (
                    <label className="bolig-option-choice" key={o.id}>
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={(!b.compatible || o.archived) && !checked}
                        onChange={(e) =>
                          c(
                            "option_ids",
                            e.target.checked
                              ? [...v.option_ids, o.id]
                              : v.option_ids.filter((id) => id !== o.id),
                          )
                        }
                      />
                      <span>
                        <strong>{o.name}</strong>
                        <small>
                          {o.replace_key
                            ? "Alternativ til standardvare"
                            : "Tillegg til grunnpakken"}
                          {!b.compatible
                            ? " · passer ikke til valgt pakke"
                            : ""}
                          {o.archived ? " · skjult" : ""}
                        </small>
                        <small>
                          {b.missingCredit
                            ? "Grunnsum mangler for fratrekk. Fyll inn grunnsummen, eller rediger alternativet til uten fratrekk."
                            : `Pris ${money(o.price_cents)} − fratrekk ${money(b.deduction)} = ${money(b.net)} inkl. mva.`}
                        </small>
                      </span>
                    </label>
                  );
                })}
              </>
            )}
            {invalid && (
              <p role="alert">
                Fjern skjulte tilvalg eller tilvalg som ikke passer til pakken
                før lagring.
              </p>
            )}
            <p className="bolig-choice-total">
              Beboerens tilvalg: {invalid ? "må kontrolleres" : money(total)}{" "}
              inkl. mva.
            </p>
            <p>
              Dette er prosjektlederens valgsutkast. Ingen kundeaksept eller
              bestilling sendes.
            </p>
          </>
        );
      }}
    </CatalogForm>
  );
}
export default function BoligCatalog({ context, root, unit = null }) {
  const [state, setState] = useState(null),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [tab, setTab] = useState("packages"),
    [editing, setEditing] = useState(null);
  const generation = useRef(0),
    operation = useRef(false);
  const load = async (clear = false) => {
    const ticket = ++generation.current;
    if (clear) setState(null);
    setLoading(true);
    setError("");
    try {
      const result = await boligCatalogRpc(
        context,
        root.id,
        unit ? "unit" : "state",
        null,
        unit ? { unit_id: unit.id } : {},
      );
      if (ticket === generation.current) setState(result);
    } catch (err) {
      if (ticket === generation.current) {
        setState(null);
        setError(err.message);
      }
    } finally {
      if (ticket === generation.current) setLoading(false);
    }
  };
  useEffect(() => {
    load(true);
    const refresh = (e) => {
      if (
        e.type === WORK_PROFILE_EVENT ||
        e.type === MANAGED_ACCESS_EVENT ||
        e.type === MODULE_ACCESS_EVENT
      ) {
        ++generation.current;
        setState(null);
        setLoading(true);
        return;
      }
      load();
    };
    const events = [
      "focus",
      CATALOG_EVENT,
      WORK_PROFILE_EVENT,
      MANAGED_ACCESS_EVENT,
      MODULE_ACCESS_EVENT,
    ];
    events.forEach((e) => window.addEventListener(e, refresh));
    return () => {
      ++generation.current;
      events.forEach((e) => window.removeEventListener(e, refresh));
    };
  }, [
    context.company_id,
    context.user_id,
    context.role,
    context.enabled,
    root.id,
    root.archived,
    unit?.id,
  ]);
  const valid =
    state?.context?.company_id === context.company_id &&
    state?.root_id === root.id
      ? state
      : null;
  const canWrite =
    !!valid &&
    context.enabled &&
    context.role === "manager" &&
    valid.context.role === "manager" &&
    !root.archived;
  const save = async (action, payload, expected = valid.revision) => {
    if (!canWrite || loading || operation.current) return false;
    operation.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    const ticket = generation.current;
    try {
      const value = await boligCatalogRpc(
        context,
        root.id,
        action,
        expected,
        payload,
      );
      if (ticket !== generation.current) return false;
      setState(value);
      setNotice(
        action === "choose"
          ? "Boligvalget er lagret som utkast. Tidligere versjoner er beholdt."
          : "Lagret i prosjektet. Tidligere boligvalg er uendret.",
      );
      setEditing(null);
      window.dispatchEvent(new CustomEvent(CATALOG_EVENT));
      return value;
    } catch (err) {
      if (ticket === generation.current) {
        setError(err.message);
        if (err.code === "42501") setState(null);
      }
      return false;
    } finally {
      operation.current = false;
      setBusy(false);
    }
  };
  const selected = valid?.selection;
  return (
    <section
      className="bolig-catalog"
      aria-label={
        unit
          ? "Grunnpakke og tilvalg for boligen"
          : "Grunnpakker og tilvalgsliste"
      }
    >
      <h3>
        {unit
          ? `Grunnpakke og tilvalg · ${unit.number}`
          : "Prosjektets grunnpakker og tilvalg"}
      </h3>
      <p>
        {unit
          ? "Velg grunnpakke og tilvalg for denne boligen. Kontroller mellomlegget og lagre et valgsutkast."
          : "Lag grunnpakkene først. Legg deretter til alternativer og tillegg i prosjektets tilvalgsliste. Velg til slutt innholdet på hver bolig nedenfor."}
      </p>
      {error && (
        <p role="alert" className="bolig-error">
          {error} Kladden er beholdt.
        </p>
      )}
      {notice && (
        <p role="status" className="bolig-notice">
          {notice}
        </p>
      )}
      <button type="button" disabled={busy || loading} onClick={() => load()}>
        {loading ? "Henter pakker og tilvalg …" : "Hent siste pakker og valg"}
      </button>
      {valid && !unit && (
        <>
          <nav aria-label="Pakkeoppsett">
            <button
              type="button"
              aria-pressed={tab === "packages"}
              onClick={() => {
                setTab("packages");
                setEditing(null);
              }}
            >
              Grunnpakker
            </button>
            <button
              type="button"
              aria-pressed={tab === "options"}
              onClick={() => {
                setTab("options");
                setEditing(null);
              }}
            >
              Tilvalgsliste
            </button>
          </nav>
          <div className="bolig-catalog-cards">
            {(tab === "packages" ? valid.packages : valid.options).map(
              (entry) => (
                <article key={entry.id}>
                  <h4>
                    {entry.name}
                    {entry.archived ? " · skjult" : ""}
                  </h4>
                  {tab === "packages" ? (
                    <ul>
                      {entry.lines.map((l) => (
                        <li key={l.key}>
                          {l.quantity} {l.unit} {l.name}
                          {l.sku ? ` · ${l.sku}` : ""} · grunnsum{" "}
                          {l.credit_cents == null
                            ? "ikke angitt"
                            : money(l.credit_cents)}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>
                      {entry.replace_key
                        ? "Alternativ til standardvare"
                        : "Tillegg til grunnpakken"}{" "}
                      · {money(entry.price_cents)} inkl. mva.
                      {entry.deduct_base
                        ? " · grunnsummen trekkes fra"
                        : " · uten fratrekk"}
                    </p>
                  )}
                  <small>Versjon {entry.revision}</small>
                  {canWrite && (
                    <div className="bolig-toolbar">
                      <button
                        type="button"
                        disabled={busy || loading}
                        onClick={() => setEditing({ kind: tab, entry })}
                      >
                        Rediger {tab === "packages" ? "grunnpakke" : "tilvalg"}:{" "}
                        {entry.name}
                      </button>
                      <button
                        type="button"
                        disabled={busy || loading}
                        onClick={() =>
                          save("archive", {
                            kind: tab === "packages" ? "package" : "option",
                            id: entry.id,
                            archived: !entry.archived,
                          })
                        }
                      >
                        {entry.archived ? "Gjenopprett" : "Skjul"} {entry.name}
                      </button>
                    </div>
                  )}
                </article>
              ),
            )}
          </div>
          {canWrite && (
            <button
              type="button"
              disabled={busy || loading}
              onClick={() => setEditing({ kind: tab, entry: null })}
            >
              {tab === "packages" ? "Ny grunnpakke" : "Nytt tilvalg"}
            </button>
          )}
          {editing &&
            canWrite &&
            (editing.kind === "packages" ? (
              <PackageEditor
                key={editing.entry?.id || "new-package"}
                context={context}
                rootId={root.id}
                revision={valid.revision}
                entry={editing.entry}
                busy={busy || loading}
                save={save}
                onCancel={() => setEditing(null)}
              />
            ) : (
              <OptionEditor
                key={editing.entry?.id || "new-option"}
                context={context}
                rootId={root.id}
                revision={valid.revision}
                entry={editing.entry}
                packages={valid.packages}
                busy={busy || loading}
                save={save}
                onCancel={() => setEditing(null)}
              />
            ))}
          {!valid.packages.length && (
            <p>
              Start med «Ny grunnpakke». Innholdet kan deretter velges for
              boligene.
            </p>
          )}
        </>
      )}
      {valid && unit && (
        <>
          {selected ? (
            <div className="bolig-saved-choice">
              <h4>Lagret valgsutkast · versjon {selected.revision}</h4>
              <p>
                {selected.snapshot.package.name} · beboerens tilvalg{" "}
                {money(selected.snapshot.total_cents)} inkl. mva.
              </p>
              {selected.snapshot.catalog_revision !== valid.revision && (
                <p>
                  Pakkeoppsettet er endret etter dette valget. Det lagrede
                  valget er beholdt. Se over dagens pakker før du lagrer en ny
                  versjon.
                </p>
              )}
              <details>
                <summary>Se lagret varegrunnlag</summary>
                <ul>
                  {selected.snapshot.goods.map((l, i) => (
                    <li key={i}>
                      {l.quantity} {l.unit} {l.name}
                      {l.sku ? ` · ${l.sku}` : ""}
                    </li>
                  ))}
                </ul>
              </details>
              <details>
                <summary>Siste valgsversjoner ({valid.history.length})</summary>
                {valid.history.map((h) => (
                  <p key={h.revision}>
                    Versjon {h.revision} · {h.snapshot.package.name} ·{" "}
                    {money(h.snapshot.total_cents)} inkl. mva.
                  </p>
                ))}
              </details>
            </div>
          ) : (
            <p>Ingen grunnpakke er valgt for denne boligen ennå.</p>
          )}
          {canWrite ? (
            <ChoiceEditor
              key={unit.id}
              context={context}
              root={root}
              state={valid}
              unit={unit}
              busy={busy || loading}
              save={save}
            />
          ) : (
            <p>Lesetilgang. Lagrede boligvalg kan leses, men ikke endres.</p>
          )}
        </>
      )}
    </section>
  );
}
