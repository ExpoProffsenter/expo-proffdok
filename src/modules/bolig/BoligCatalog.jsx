import { Package, Plus, Pencil, EyeOff } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import {
  boligCatalogRpc,
  money,
  toCents,
  optionBreakdown,
} from "./boligCatalogClient.js";
import { useBoligUiState } from "./boligUiState.js";
import CatalogForm from "./BoligDraftForm.jsx";
import BoligEditorDialog from "./BoligEditorDialog.jsx";
import BoligOrderDraft from "./BoligOrderDraft.jsx";
import ProductCard from "./BoligProductCard.jsx";
import BoligPackageContentEditor from "./BoligPackageContentEditor.jsx";
import BoligPackageContents, {
  OptionContents,
} from "./BoligPackageContents.jsx";
import {
  newPackageLine,
  contentDraft,
  optionLines,
  preparePackageLines,
} from "./boligPackageSections.js";
import { WORK_PROFILE_EVENT } from "../access/workProfileClient.js";
import {
  MANAGED_ACCESS_EVENT,
  MODULE_ACCESS_EVENT,
} from "../access/moduleAccessClient.js";
const CATALOG_EVENT = "expo-proffdok-bolig-catalog";
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
    sections: entry?.sections || [],
    lines: entry?.lines.map((l) => ({
      ...l,
      credit: l.credit_cents == null ? "" : String(l.credit_cents / 100),
    })) || [newPackageLine()],
  };
  return (
    <CatalogForm
      context={context}
      rootId={rootId}
      className="bolig-package-editor"
      name={"package-" + (entry?.id || "new")}
      basis={{ catalog_revision: revision }}
      initial={initial}
      busy={busy}
      submitLabel="Lagre grunnpakke"
      onSave={(raw, basis) => {
        const v = contentDraft(raw);
        return save(
          "package",
          {
            id: v.id,
            name: v.name,
            sections: v.sections,
            lines: preparePackageLines(v, toCents),
          },
          basis.catalog_revision,
        );
      }}
    >
      {(raw, c) => {
        const v = contentDraft(raw);
        return (
          <>
            <label>
              Pakkenavn
              <input
                required
                maxLength={120}
                value={v.name}
                onChange={(e) => c("name", e.target.value)}
              />
            </label>
            <p className="bolig-editor-hint">
              Grunnpakken er inkludert i entreprisen. Grunnsum er valgfri og
              brukes bare ved fratrekk.
            </p>
            <BoligPackageContentEditor
              value={v}
              change={c}
              context={context}
              rootId={rootId}
            />
            <button type="button" onClick={onCancel}>
              Lukk pakkeredigering
            </button>
          </>
        );
      }}
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
    sections: entry?.sections || [],
    lines: entry ? optionLines(entry) : [newPackageLine()],
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
      className="bolig-option-editor"
      name={"option-" + (entry?.id || "new")}
      basis={{ catalog_revision: revision }}
      initial={initial}
      busy={busy}
      submitLabel="Lagre tilvalgspakke"
      onSave={(raw, basis) => {
        const v = contentDraft(raw, true),
          goods = preparePackageLines(v),
          first = goods[0];
        return save(
          "option",
          {
            id: v.id,
            name: v.name,
            sections: v.sections,
            lines: goods,
            sku: goods.length === 1 ? first.sku : "",
            image_url: first.image_url || "",
            product_url: first.product_url || "",
            quantity: goods.length === 1 ? first.quantity : 1,
            unit: goods.length === 1 ? first.unit : "pakke",
            price_cents: toCents(v.price),
            replace_key: v.replace_key,
            deduct_base: !!v.replace_key && v.deduct_base,
          },
          basis.catalog_revision,
        );
      }}
    >
      {(raw, c) => {
        const v = contentDraft(raw, true);
        return (
          <>
            <label>
              Navn på tilvalgspakke
              <input
                required
                maxLength={120}
                value={v.name}
                onChange={(e) => c("name", e.target.value)}
              />
            </label>
            <label>
              Tilvalgspakketype
              <select
                aria-label="Tilvalgspakketype"
                value={v.replace_key ? "alternative" : "additional"}
                onChange={(e) =>
                  c(
                    "replace_key",
                    e.target.value === "alternative" ? lines[0]?.key || "" : "",
                  )
                }
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
                    aria-label="Erstatter standardvare"
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
            <BoligPackageContentEditor
              value={v}
              change={c}
              context={context}
              rootId={rootId}
              base={false}
            />
            <label>
              Pris for hele tilvalgspakken inkl. mva.
              <input
                required
                inputMode="decimal"
                value={v.price}
                onChange={(e) => c("price", e.target.value)}
              />
            </label>
            <p>
              Prisen gjelder alle varene og antallene i tilvalgspakken samlet.
              Ved alternativ erstattes hele standardvarelinjen. Eventuelt
              fratrekk vises når pakken velges på boligen.
            </p>
            <button type="button" onClick={onCancel}>
              Lukk tilvalgspakkeredigering
            </button>
          </>
        );
      }}
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
                <BoligPackageContents sections={pkg.sections} lines={pkg.lines}>
                  {(l) => (
                    <>
                      Grunnsum{" "}
                      {l.credit_cents == null
                        ? "ikke angitt"
                        : money(l.credit_cents)}
                    </>
                  )}
                </BoligPackageContents>
                <h4>Velg tilvalgspakker</h4>
                {state.options.map((o) => {
                  const b = optionBreakdown(o, pkg),
                    checked = v.option_ids.includes(o.id);
                  if (o.archived && !checked) return null;
                  return (
                    <div key={o.id}>
                      <label className="bolig-option-choice">
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
                        <ProductCard line={o}>
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
                        </ProductCard>
                      </label>
                      <OptionContents option={o} />
                    </div>
                  );
                })}
              </>
            )}
            {invalid && (
              <p role="alert">
                Fjern skjulte tilvalgspakker eller tilvalgspakker som ikke
                passer til pakken før lagring.
              </p>
            )}
            <p className="bolig-choice-total">
              Beboerens tilvalgspakker:{" "}
              {invalid ? "må kontrolleres" : money(total)} inkl. mva.
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
export default function BoligCatalog({
  context,
  root,
  unit = null,
  compact = false,
  orderOnly = false,
}) {
  const phaseKey = `${root.id}:${unit?.id || "setup"}`;
  const [unitTab, setUnitTab] = useBoligUiState(
      context,
      `${phaseKey}:unit-tab`,
      "choice",
    ),
    [editChoice, setEditChoice] = useBoligUiState(
      context,
      `${phaseKey}:edit-choice`,
      false,
    );
  const [tab, setTab] = useBoligUiState(
    context,
    `${phaseKey}:catalog-tab`,
    "packages",
  );
  const [editPointer, setEditPointer] = useBoligUiState(
    context,
    `${phaseKey}:editor`,
    null,
  );
  const setEditing = (next) => {
    setEditPointer(next ? { kind: next.kind, id: next.entry?.id || "" } : null);
  };
  const [state, setState] = useState(null),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false);
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
        (e.type === WORK_PROFILE_EVENT &&
          e.detail?.active_company_id !== context.company_id) ||
        (e.type === MANAGED_ACCESS_EVENT &&
          (!e.detail?.userId || e.detail.userId === context.user_id)) ||
        e.type === MODULE_ACCESS_EVENT
      ) {
        ++generation.current;
        setState(null);
        setLoading(true);
        load();
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
  const editingEntry = editPointer?.id
    ? (editPointer.kind === "packages"
        ? valid?.packages
        : valid?.options
      )?.find((e) => e.id === editPointer.id)
    : null;
  const editing =
    editPointer && (!editPointer.id || editingEntry)
      ? { kind: editPointer.kind, entry: editingEntry }
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
          ? "Grunnpakke og tilvalgspakker for boligen"
          : "Grunnpakker og tilvalgspakker"
      }
    >
      {unit && compact && !orderOnly && (
        <nav className="bolig-unit-tabs" aria-label="Arbeid med boligen">
          <button
            type="button"
            aria-pressed={unitTab === "choice"}
            onClick={() => setUnitTab("choice")}
          >
            Boligvalg
          </button>
          <button
            type="button"
            aria-pressed={unitTab === "order"}
            onClick={() => setUnitTab("order")}
          >
            Bestilling
          </button>
        </nav>
      )}
      <h3 hidden={compact}>
        {unit
          ? `Grunnpakke og tilvalgspakker · ${unit.number}`
          : "Prosjektets grunnpakker og tilvalgspakker"}
      </h3>
      <p hidden={compact}>
        {unit
          ? "Velg grunnpakke og tilvalgspakker for denne boligen. Kontroller mellomlegget og lagre et valgsutkast."
          : "Lag grunnpakkene først. Legg deretter til alternativer og tillegg i prosjektets tilvalgspakker. Velg til slutt innholdet på hver bolig nedenfor."}
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
        {loading
          ? "Henter pakker og tilvalgspakker …"
          : "Hent siste pakker og valg"}
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
              Tilvalgspakker
            </button>
          </nav>
          {canWrite && (
            <div className="bolig-catalog-create-actions">
              {[
                { kind: "packages", label: "Ny grunnpakke" },
                { kind: "options", label: "Ny tilvalgspakke" },
              ].map((action) => (
                <button
                  key={action.kind}
                  type="button"
                  className="bolig-create-action"
                  disabled={busy || loading}
                  onClick={() => {
                    setTab(action.kind);
                    setEditing({ kind: action.kind, entry: null });
                  }}
                >
                  <Plus size={16} />
                  {action.label}
                </button>
              ))}
            </div>
          )}
          <p className="bolig-editor-hint">
            {tab === "packages"
              ? "1. Gi pakken et navn. 2. Legg inn varer fra katalogen eller skriv dem inn selv. 3. Lagre pakken."
              : "Velg om varen er et tillegg eller erstatter en standardvare. Oppgi pris og eventuelt fratrekk."}
          </p>
          <section
            className="bolig-catalog-library"
            aria-label="Lagret innhold"
          >
            <h4>
              {tab === "packages"
                ? `${valid.packages.length} grunnpakker`
                : `${valid.options.length} tilvalgspakker`}{" "}
              i prosjektet
            </h4>
            <div className="bolig-catalog-cards">
              {(tab === "packages" ? valid.packages : valid.options).map(
                (entry) => (
                  <article key={entry.id}>
                    <h4>
                      {entry.name}
                      {entry.archived ? " · skjult" : ""}
                    </h4>
                    {tab === "packages" ? (
                      <details className="bolig-package-card-content">
                        <summary>
                          {entry.lines.length} varelinjer · Vis innhold
                        </summary>
                        <BoligPackageContents
                          sections={entry.sections}
                          lines={entry.lines}
                        >
                          {(l) => (
                            <>
                              Grunnsum{" "}
                              {l.credit_cents == null
                                ? "ikke angitt"
                                : money(l.credit_cents)}
                            </>
                          )}
                        </BoligPackageContents>
                      </details>
                    ) : (
                      <details className="bolig-option-card-content">
                        <summary>
                          {money(entry.price_cents)} inkl. mva. · Vis innhold
                        </summary>
                        {!entry.lines?.length && (
                          <ProductCard line={entry}>
                            {entry.replace_key
                              ? "Alternativ til standardvare"
                              : "Tillegg til grunnpakken"}{" "}
                            · {money(entry.price_cents)} inkl. mva.
                            {entry.deduct_base
                              ? " · grunnsummen trekkes fra"
                              : " · uten fratrekk"}
                          </ProductCard>
                        )}
                        {entry.lines?.length > 0 && (
                          <p>
                            {entry.replace_key
                              ? "Alternativ til standardvare"
                              : "Tillegg til grunnpakken"}
                            {entry.deduct_base
                              ? " · grunnsummen trekkes fra"
                              : " · uten fratrekk"}
                          </p>
                        )}
                        {entry.lines?.length > 0 && (
                          <BoligPackageContents
                            sections={entry.sections}
                            lines={optionLines(entry)}
                          />
                        )}
                      </details>
                    )}
                    <small>Versjon {entry.revision}</small>
                    {canWrite && (
                      <div className="bolig-toolbar">
                        <button
                          type="button"
                          className="bolig-edit-action"
                          disabled={busy || loading}
                          onClick={() => setEditing({ kind: tab, entry })}
                        >
                          <Pencil size={15} />
                          Rediger{" "}
                          {tab === "packages"
                            ? "grunnpakke"
                            : "tilvalgspakke"}: {entry.name}
                        </button>
                        <button
                          type="button"
                          disabled={busy || loading}
                          className="bolig-quiet-action"
                          onClick={() =>
                            save("archive", {
                              kind: tab === "packages" ? "package" : "option",
                              id: entry.id,
                              archived: !entry.archived,
                            })
                          }
                        >
                          <EyeOff size={15} />
                          {entry.archived ? "Gjenopprett" : "Skjul"}{" "}
                          {entry.name}
                        </button>
                      </div>
                    )}
                  </article>
                ),
              )}
            </div>
          </section>
          {editing && canWrite && (
            <BoligEditorDialog
              title={
                editing.kind === "packages"
                  ? editing.entry
                    ? "Rediger grunnpakke"
                    : "Ny grunnpakke"
                  : editing.entry
                    ? "Rediger tilvalgspakke"
                    : "Ny tilvalgspakke"
              }
              busy={busy}
              onClose={() => setEditing(null)}
            >
              {editing.kind === "packages" ? (
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
              )}
            </BoligEditorDialog>
          )}
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
          <div hidden={orderOnly || (compact && unitTab !== "choice")}>
            {selected ? (
              <div className="bolig-saved-choice">
                <h4>Lagret valgsutkast · versjon {selected.revision}</h4>
                <p>
                  {selected.snapshot.package.name} · beboerens tilvalgspakker{" "}
                  {money(selected.snapshot.total_cents)} inkl. mva.
                </p>
                {compact && selected.snapshot.options?.length > 0 && (
                  <div className="bolig-unit-choice-products">
                    {selected.snapshot.options.map((o) => (
                      <ProductCard key={o.id} line={o}>
                        {money(o.net_cents)} inkl. mva.
                      </ProductCard>
                    ))}
                  </div>
                )}
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
                  <summary>
                    Siste valgsversjoner ({valid.history.length})
                  </summary>
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
            {selected?.snapshot.format === "scoped-v1" && (
              <p>
                Boligen har egne rompakker og fellespakke. Velg rom i «Rom og
                oversikt» for å endre en rompakke.{" "}
                {canWrite && (
                  <button
                    type="button"
                    onClick={() =>
                      window.dispatchEvent(
                        new CustomEvent("expo-proffdok-bolig-package-editor", {
                          detail: {
                            root_id: root.id,
                            unit_id: unit.id,
                            scope_id: "common",
                          },
                        }),
                      )
                    }
                  >
                    Vis fellespakke
                  </button>
                )}
              </p>
            )}
            {canWrite &&
              compact &&
              selected &&
              selected.snapshot.format !== "scoped-v1" && (
                <button
                  type="button"
                  onClick={() => setEditChoice(!editChoice)}
                >
                  {editChoice
                    ? "Lukk redigering av boligvalg"
                    : "Endre boligvalg"}
                </button>
              )}
            <div
              hidden={
                selected?.snapshot.format === "scoped-v1" ||
                (compact && !!selected && !editChoice)
              }
            >
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
                <p>
                  Lesetilgang. Lagrede boligvalg kan leses, men ikke endres.
                </p>
              )}
            </div>
            {compact && selected && (
              <button
                className="bolig-primary"
                type="button"
                onClick={() => setUnitTab("order")}
              >
                Neste: klargjør varebestilling →
              </button>
            )}
          </div>
          <div hidden={!orderOnly && compact && unitTab !== "order"}>
            {!selected && (
              <p>
                {orderOnly
                  ? "Velg og lagre en grunnpakke under Rom, grunnpakke og tilvalgspakker før du klargjør bestillingen."
                  : "Velg og lagre grunnpakken under Boligvalg før du klargjør bestillingen."}
              </p>
            )}
            {selected && (
              <BoligOrderDraft
                key={"order:" + unit.id}
                context={context}
                root={root}
                unit={unit}
                choiceRevision={selected.revision}
              />
            )}
          </div>
        </>
      )}
    </section>
  );
}
