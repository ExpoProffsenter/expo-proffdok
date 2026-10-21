import React, { useEffect, useRef, useState } from "react";
import {
  Truck,
  PackageCheck,
  Settings2,
  ClipboardList,
  ChevronRight,
} from "lucide-react";
import {
  deliveryRpc,
  deliveryStatus,
  deliveryAddress,
  availableDeliveryPositions,
  localDay,
  quantity,
} from "./boligDeliveryClient.js";
import {
  boligDraftKey,
  readBoligDraft,
  writeBoligDraft,
  clearBoligDraft,
} from "./boligClient.js";
import DraftForm from "./BoligDraftForm.jsx";
import Dialog from "./BoligEditorDialog.jsx";
import ProductCard from "./BoligProductCard.jsx";
import BoligOrderMail from "./BoligOrderMail.jsx";

function TextField({
  label,
  value,
  change,
  name,
  required = false,
  type = "text",
  maxLength = 160,
}) {
  return (
    <label>
      {label}
      <input
        type={type}
        required={required}
        maxLength={maxLength}
        value={value[name] || ""}
        onChange={(e) => change(name, e.target.value)}
      />
    </label>
  );
}
function OrderReview({ value, state, draft }) {
  return (
    <div className="bolig-delivery-review">
      <strong>
        {value.supplier} · {value.reference}
      </strong>
      <p className="bolig-delivery-address">{deliveryAddress(state)}</p>
      <p>
        {state.unit_settings.delivery_mode === "partial"
          ? "Dellevering tillatt"
          : "Samlet levering"}
        {value.requested_date ? ` · Ønsket ${value.requested_date}` : ""}
      </p>
      {value.supplier_reference && (
        <p>Leverandørordrenummer: {value.supplier_reference}</p>
      )}
      <ul>
        {(draft?.snapshot.goods || [])
          .filter((_, i) => value.positions.includes(i))
          .map((g, i) => (
            <li key={i}>
              {g.room_name && `${g.room_name} · `}
              {g.name} · {g.sku || "uten varenummer"} · {quantity(g.quantity)}{" "}
              {g.unit}
            </li>
          ))}
      </ul>
      {value.note && <p>{value.note}</p>}
      <p>
        Dette lagrer bestillingsgrunnlaget. Registrer «Bestilt» etter at ordren
        faktisk er lagt hos leverandøren.
      </p>
    </div>
  );
}
export default function BoligDeliveries({
  context,
  root,
  unit,
  draft,
  choiceRevision,
  draftLoading = false,
}) {
  const scope = `${context.user_id}:${context.company_id}:${root.id}:${unit.id}:${context.role}:${context.enabled}`;
  return (
    <DeliveryWorkspace
      key={scope}
      {...{ context, root, unit, draft, choiceRevision, draftLoading }}
    />
  );
}
function DeliveryWorkspace({
  context,
  root,
  unit,
  draft,
  choiceRevision,
  draftLoading,
}) {
  const [state, setState] = useState(null),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [editor, setEditor] = useState(null);
  const attemptKey = boligDraftKey(
    context,
    root.id,
    "delivery-attempt-" + unit.id,
  );
  const [pending, setPending] = useState(() =>
    readBoligDraft(attemptKey, null),
  );
  const generation = useRef(0),
    operation = useRef(false),
    mounted = useRef(true),
    writeAllowed = useRef(false);
  const load = async () => {
    if (operation.current) return;
    const ticket = ++generation.current;
    setLoading(true);
    try {
      const next = await deliveryRpc(context, root.id, unit.id);
      if (ticket === generation.current) {
        setState(next);
        setError("");
      }
    } catch (e) {
      if (ticket === generation.current) {
        setState(null);
        setError(e.message);
      }
    } finally {
      if (ticket === generation.current) setLoading(false);
    }
  };
  useEffect(() => {
    mounted.current = true;
    load();
    const refresh = () => {
      if (document.visibilityState !== "hidden") load();
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      mounted.current = false;
      ++generation.current;
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [
    context.user_id,
    context.company_id,
    context.role,
    context.enabled,
    root.id,
    unit.id,
  ]);
  const canWrite =
    !!state &&
    state.context.role === "manager" &&
    context.role === "manager" &&
    context.enabled &&
    !root.archived &&
    !unit.archived;
  writeAllowed.current = canWrite;
  const locked = busy || loading || !!pending;
  const run = async (action, payload, retry = false) => {
    if (
      operation.current ||
      !writeAllowed.current ||
      loading ||
      (!retry && pending)
    )
      return false;
    const attempt = retry
      ? pending
      : {
          action,
          payload: {
            ...payload,
            revision: payload.revision ?? state.revision,
            request_id: crypto.randomUUID(),
          },
        };
    if (!writeBoligDraft(attemptKey, attempt)) {
      setError("Forsøket kunne ikke sikres lokalt. Behold siden åpen.");
      return false;
    }
    operation.current = true;
    setPending(attempt);
    setBusy(true);
    setError("");
    setNotice("");
    ++generation.current;
    try {
      const next = await deliveryRpc(
        context,
        root.id,
        unit.id,
        attempt.action,
        attempt.payload,
      );
      clearBoligDraft(attemptKey);
      if (!mounted.current) return false;
      setState(next);
      setPending(null);
      setEditor(null);
      setNotice(
        attempt.action === "create"
          ? "Bestillingsgrunnlaget er lagret. Ingen bestilling er sendt."
          : "Endringene er lagret.",
      );
      window.dispatchEvent(new CustomEvent("expo-proffdok-bolig-order"));
      return next;
    } catch (e) {
      if (!mounted.current) return false;
      // Database rejections are atomic. Missing transport confirmation retains the
      // exact request and receipt ID; never create another order to retry a write.
      if (/^(PT409|42501|22\w{3}|23\w{3})$/.test(e.code || "")) {
        clearBoligDraft(attemptKey);
        setPending(null);
        if (e.code === "42501") setState(null);
      }
      setError(e.message + " Kladden er beholdt.");
      return false;
    } finally {
      operation.current = false;
      if (mounted.current) setBusy(false);
    }
  };
  const orders = state?.orders || [];
  const available = availableDeliveryPositions(draft, orders);
  const currentDraft =
    !!draft && draft.source_choice_revision === choiceRevision && !draftLoading;
  const openEditor = (kind) => setEditor(kind);
  const basis = {
    delivery_revision: state?.revision || 0,
    draft_revision: draft?.revision || 0,
  };
  const makeForm = (
    name,
    initial,
    onSave,
    children,
    label = "Lagre endringer",
  ) => (
    <DraftForm
      key={name}
      context={context}
      rootId={root.id}
      name={`delivery-${unit.id}-${name}`}
      initial={initial}
      basis={basis}
      busy={locked || !canWrite}
      conflictMessage="Bestillinger eller leveringsoppsett er endret. Kladden er beholdt. Kontroller siste grunnlag før du fortsetter."
      onRebase={(v) => ({
        ...v,
        ...(name === "create" ? { positions: available } : {}),
        review: false,
      })}
      onSave={(v, b) => onSave(v, { ...b, revision: b.delivery_revision })}
      submitLabel={label}
    >
      {children}
    </DraftForm>
  );
  return (
    <section className="bolig-deliveries" aria-label="Bestilling og levering">
      <div className="bolig-delivery-heading">
        <span className="bolig-delivery-icon">
          <Truck size={21} />
        </span>
        <div>
          <h4>Bestilling og levering</h4>
          <p>Klargjør ordren. Følg deretter opp bestilling og varemottak.</p>
        </div>
      </div>
      {error && <p role="alert">{error}</p>}
      {notice && <p role="status">{notice}</p>}
      {pending && (
        <div className="bolig-delivery-warning" role="status">
          <strong>Lagringen må avklares</strong>
          <p>
            Prøv samme forsøk igjen. Kvitteringen hindrer en dobbeltbestilling.
          </p>
          <button
            type="button"
            disabled={busy || loading || !canWrite}
            onClick={() => run(null, null, true)}
          >
            Kontroller og prøv samme forsøk
          </button>
        </div>
      )}
      {!state ? (
        <button type="button" onClick={load} disabled={loading}>
          {loading
            ? "Henter leveringsoppsett …"
            : "Prøv å hente leveringsoppsett igjen"}
        </button>
      ) : (
        <>
          <div className="bolig-delivery-summary">
            <div>
              <small>Levering til</small>
              <strong className="bolig-delivery-address">
                {deliveryAddress(state) || "Adresse mangler"}
              </strong>
              <small>
                {state.unit_settings.address_mode === "common"
                  ? "Felles for prosjektet"
                  : "Egen adresse for boligen"}
              </small>
            </div>
            <div>
              <small>Arbeidsmåte</small>
              <strong>
                {state.unit_settings.order_mode === "combined"
                  ? "Samlet bestilling"
                  : "Delt bestilling"}
              </strong>
              <small>
                {state.unit_settings.delivery_mode === "combined"
                  ? "Samlet levering"
                  : "Dellevering tillatt"}
              </small>
            </div>
          </div>
          <div className="bolig-delivery-actions">
            <button
              type="button"
              disabled={locked}
              onClick={() => openEditor("settings")}
            >
              <Settings2 size={16} />
              Leveringsoppsett
            </button>
            {canWrite && (
              <button
                type="button"
                className="bolig-primary"
                disabled={locked || !currentDraft || !available.length}
                onClick={() => openEditor("create")}
              >
                <ClipboardList size={16} />
                Klargjør bestilling
                <ChevronRight size={16} />
              </button>
            )}
            <button type="button" disabled={busy || loading} onClick={load}>
              Oppdater status
            </button>
          </div>
          {!currentDraft && (
            <p>
              Lagre bestillingsutkastet med gjeldende vareutvalg før du klargjør
              en bestilling.
            </p>
          )}
          {!orders.length ? (
            <div className="bolig-delivery-empty">
              <PackageCheck size={25} />
              <div>
                <strong>Ingen bestillinger ennå</strong>
                <p>
                  Varene i bestillingsutkastet er klare når leveringsoppsettet
                  er fylt ut.
                </p>
              </div>
            </div>
          ) : (
            <div className="bolig-delivery-orders">
              {orders.map((o) => (
                <details
                  key={o.id}
                  className={`bolig-delivery-order bolig-delivery-${o.status}`}
                >
                  <summary>
                    <div>
                      <strong>
                        {o.number} · {o.snapshot.supplier}
                      </strong>
                      <small>
                        {o.snapshot.goods.length} varelinjer · Vårt ordrenummer{" "}
                        {o.snapshot.reference}
                      </small>
                    </div>
                    <span className="bolig-delivery-badge">
                      {o.status === "prepared" && o.mail_request_id
                        ? "Sending må avklares"
                        : deliveryStatus[o.status]}
                    </span>
                  </summary>
                  <div className="bolig-delivery-order-body">
                    <p className="bolig-delivery-address">
                      <strong>Leveringsadresse</strong>
                      <br />
                      {o.snapshot.address}
                    </p>
                    <p>
                      Leverandørordrenummer:{" "}
                      {o.snapshot.supplier_reference ||
                        "Ikke oppgitt (valgfritt)"}
                    </p>
                    {o.snapshot.requested_date && (
                      <p>Ønsket levering: {o.snapshot.requested_date}</p>
                    )}
                    {o.ordered_at && <p>Bestilt: {o.ordered_at}</p>}
                    {o.snapshot.delivery_note && (
                      <p>{o.snapshot.delivery_note}</p>
                    )}
                    {o.snapshot.note && <p>{o.snapshot.note}</p>}
                    <ul className="bolig-delivery-goods">
                      {o.snapshot.goods.map((g, i) => (
                        <li key={i}>
                          <div>
                            <strong>{g.name}</strong>
                            <small>
                              {[g.room_name, g.section_name, g.sku]
                                .filter(Boolean)
                                .join(" · ")}
                            </small>
                          </div>
                          <div>
                            {quantity(o.received[i] || 0)} /{" "}
                            {quantity(g.quantity)} {g.unit}
                            <small>mottatt / bestilt</small>
                          </div>
                        </li>
                      ))}
                    </ul>
                    {o.status === "prepared" && o.mail_request_id && (
                      <p role="status">
                        En e-postsending må avklares. Åpne Send bestilling på
                        e-post og bruk samme sendeforsøk.
                      </p>
                    )}
                    {canWrite && (
                      <div className="bolig-delivery-actions">
                        {o.status === "prepared" && (
                          <>
                            <button
                              type="button"
                              className="bolig-primary"
                              disabled={locked}
                              onClick={() =>
                                openEditor({ kind: "mail", id: o.id })
                              }
                            >
                              Send bestilling på e-post
                            </button>
                            <button
                              type="button"
                              className="bolig-primary"
                              disabled={locked}
                              onClick={() =>
                                openEditor({ kind: "ordered", id: o.id })
                              }
                            >
                              Registrer som bestilt
                            </button>
                            <button
                              type="button"
                              disabled={locked}
                              onClick={() =>
                                openEditor({ kind: "cancel", id: o.id })
                              }
                            >
                              Annuller grunnlag
                            </button>
                          </>
                        )}
                        {["ordered", "partial", "delivered"].includes(
                          o.status,
                        ) && (
                          <button
                            type="button"
                            className="bolig-primary"
                            disabled={locked}
                            onClick={() =>
                              openEditor({ kind: "receive", id: o.id })
                            }
                          >
                            <PackageCheck size={16} />
                            {o.status === "delivered"
                              ? "Korriger mottak"
                              : "Registrer varemottak"}
                          </button>
                        )}
                        {o.status !== "cancelled" && (
                          <button
                            type="button"
                            disabled={locked}
                            onClick={() =>
                              openEditor({ kind: "reference", id: o.id })
                            }
                          >
                            Leverandørordrenummer
                          </button>
                        )}
                      </div>
                    )}
                    <details>
                      <summary>Historikk</summary>
                      <ul className="bolig-delivery-history">
                        {state.events
                          .filter((e) => e.order_id === o.id)
                          .map((e) => (
                            <li key={e.id}>
                              {new Date(e.created_at).toLocaleString("nb-NO")} ·{" "}
                              {
                                {
                                  create: "Grunnlag klargjort",
                                  ordered: "Registrert bestilt",
                                  receive: "Varemottak / korrigering",
                                  cancel: "Grunnlag annullert",
                                  supplier_reference:
                                    "Leverandørreferanse endret",
                                  mail_sent:
                                    "E-posttjenesten bekreftet sending",
                                }[e.action]
                              }
                              {e.payload.date && ` · ${e.payload.date}`}
                              {e.payload.note && ` · ${e.payload.note}`}
                              {e.payload.to && ` · Til ${e.payload.to}`}
                              {e.payload.lines && (
                                <ul>
                                  {e.payload.lines.map((l, i) => (
                                    <li key={i}>
                                      {o.snapshot.goods[l.position]?.name}:{" "}
                                      {quantity(l.quantity)}{" "}
                                      {o.snapshot.goods[l.position]?.unit}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </li>
                          ))}
                      </ul>
                    </details>
                  </div>
                </details>
              ))}
            </div>
          )}
          {editor && (
            <Dialog
              title={
                editor === "settings"
                  ? "Leveringsoppsett"
                  : editor === "create"
                    ? "Klargjør bestilling"
                    : {
                        ordered: "Registrer som bestilt",
                        receive: "Registrer varemottak",
                        reference: "Leverandørordrenummer",
                        cancel: "Annuller bestillingsgrunnlag",
                        mail: "Bestillingsmail med vedlegg",
                      }[editor.kind]
              }
              busy={busy}
              onClose={() => setEditor(null)}
            >
              {editor === "settings" ? (
                <div className="bolig-delivery-dialog">
                  <p>
                    Fellesoppsettet brukes av boliger som har valgt felles
                    adresse. Lagrede bestillinger beholder adressen sin.
                  </p>
                  <details open>
                    <summary>Felles for prosjektet</summary>
                    {makeForm(
                      "common",
                      state.settings,
                      (v, b) =>
                        run("settings", {
                          settings: { address: v.address, note: v.note },
                          revision: b.revision,
                        }),
                      (v, c) => (
                        <>
                          <label>
                            Felles leveringsadresse
                            <textarea
                              aria-label="Felles leveringsadresse"
                              maxLength={1000}
                              value={v.address}
                              onChange={(e) => c("address", e.target.value)}
                            />
                          </label>
                          <label>
                            Felles leveringsmerknad
                            <textarea
                              aria-label="Felles leveringsmerknad"
                              maxLength={1000}
                              value={v.note}
                              onChange={(e) => c("note", e.target.value)}
                            />
                          </label>
                        </>
                      ),
                    )}
                  </details>
                  <details open>
                    <summary>Denne boligen · {unit.number}</summary>
                    {makeForm(
                      "unit",
                      state.unit_settings,
                      (v, b) =>
                        run("unit_settings", {
                          settings: {
                            address_mode: v.address_mode,
                            address: v.address,
                            order_mode: v.order_mode,
                            delivery_mode: v.delivery_mode,
                          },
                          revision: b.revision,
                        }),
                      (v, c) => (
                        <>
                          <label>
                            Leveringsadresse
                            <select
                              aria-label="Leveringsadresse"
                              value={v.address_mode}
                              onChange={(e) =>
                                c("address_mode", e.target.value)
                              }
                            >
                              <option value="common">
                                Bruk felles adresse
                              </option>
                              <option value="individual">
                                Egen adresse for boligen
                              </option>
                            </select>
                          </label>
                          {v.address_mode === "individual" && (
                            <label>
                              Egen leveringsadresse
                              <textarea
                                aria-label="Egen leveringsadresse"
                                required
                                maxLength={1000}
                                value={v.address}
                                onChange={(e) => c("address", e.target.value)}
                              />
                            </label>
                          )}
                          <div className="bolig-delivery-fields">
                            <label>
                              Bestilling
                              <select
                                aria-label="Bestilling"
                                value={v.order_mode}
                                onChange={(e) =>
                                  c("order_mode", e.target.value)
                                }
                              >
                                <option value="combined">
                                  Samlet for boligen
                                </option>
                                <option value="split">
                                  Del opp i flere bestillinger
                                </option>
                              </select>
                            </label>
                            <label>
                              Levering
                              <select
                                aria-label="Levering"
                                value={v.delivery_mode}
                                onChange={(e) =>
                                  c("delivery_mode", e.target.value)
                                }
                              >
                                <option value="combined">
                                  Samlet levering
                                </option>
                                <option value="partial">
                                  Tillat dellevering
                                </option>
                              </select>
                            </label>
                          </div>
                          <p>
                            Delt bestilling lar deg velge varer og leverandør i
                            flere omganger. Dellevering lar deg føre mottatte
                            mengder etter hvert.
                          </p>
                        </>
                      ),
                    )}
                  </details>
                  {!canWrite && (
                    <p>Lesetilgang. Leveringsoppsettet kan ikke endres.</p>
                  )}
                </div>
              ) : editor === "create" ? (
                <div className="bolig-delivery-dialog">
                  {makeForm(
                    "create",
                    {
                      reference: root.reference || "",
                      supplier: "",
                      supplier_reference: "",
                      requested_date: "",
                      note: "",
                      positions: available,
                      review: false,
                    },
                    (v, b) =>
                      v.review
                        ? run("create", {
                            ...v,
                            revision: b.revision,
                            draft_revision: b.draft_revision,
                          })
                        : false,
                    (v, c) => (
                      <>
                        <div className="bolig-delivery-fields">
                          <TextField
                            label="Vårt ordrenummer"
                            required
                            value={v}
                            change={c}
                            name="reference"
                          />
                          <TextField
                            label="Leverandør"
                            required
                            value={v}
                            change={c}
                            name="supplier"
                          />
                          <TextField
                            label="Leverandørordrenummer (valgfritt)"
                            value={v}
                            change={c}
                            name="supplier_reference"
                          />
                          <TextField
                            label="Ønsket leveringsdato (valgfritt)"
                            type="date"
                            value={v}
                            change={c}
                            name="requested_date"
                          />
                        </div>
                        <label>
                          Merknad til bestillingen
                          <textarea
                            aria-label="Merknad til bestillingen"
                            maxLength={1000}
                            value={v.note}
                            onChange={(e) =>
                              c({ note: e.target.value, review: false })
                            }
                          />
                        </label>
                        <details open={!v.review}>
                          <summary>Varer · {v.positions.length} valgt</summary>
                          {(draft?.snapshot.goods || []).map((g, i) => (
                            <label
                              className="bolig-order-line"
                              key={g.key || i}
                            >
                              <input
                                type="checkbox"
                                checked={v.positions.includes(i)}
                                disabled={
                                  !available.includes(i) ||
                                  state.unit_settings.order_mode === "combined"
                                }
                                onChange={(e) =>
                                  c({
                                    positions: e.target.checked
                                      ? [...v.positions, i]
                                      : v.positions.filter((x) => x !== i),
                                    review: false,
                                  })
                                }
                              />
                              <ProductCard line={g} />
                              {!available.includes(i) && (
                                <small>Allerede klargjort / bestilt</small>
                              )}
                            </label>
                          ))}
                        </details>
                        <p className="bolig-delivery-address">
                          Levering til:{" "}
                          {deliveryAddress(state) ||
                            "Adresse mangler – fyll ut leveringsoppsett først"}
                        </p>
                        <label className="bolig-delivery-confirm">
                          <input
                            type="checkbox"
                            checked={v.review}
                            required
                            onChange={(e) => c("review", e.target.checked)}
                          />
                          Jeg har kontrollert vareutvalg, leverandør og
                          leveringsadresse.
                        </label>
                        {v.review && (
                          <OrderReview value={v} state={state} draft={draft} />
                        )}
                      </>
                    ),
                    "Lagre bestillingsgrunnlag",
                  )}
                </div>
              ) : editor.kind === "mail" ? (
                <BoligOrderMail
                  key={editor.id}
                  context={context}
                  root={root}
                  unit={unit}
                  order={orders.find((o) => o.id === editor.id)}
                  revision={state.revision}
                  onBusy={setBusy}
                  onSent={() => {
                    setNotice("E-posttjenesten har bekreftet sendingen.");
                    load();
                  }}
                />
              ) : (
                <OrderAction {...{ editor, state, makeForm, run }} />
              )}
              <footer>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setEditor(null)}
                >
                  Lukk og behold kladd
                </button>
              </footer>
            </Dialog>
          )}
        </>
      )}
    </section>
  );
}
function OrderAction({ editor, state, makeForm, run }) {
  const o = state.orders.find((x) => x.id === editor.id);
  if (!o) return <p>Bestillingen finnes ikke i det siste grunnlaget.</p>;
  const save = (action, v, b) =>
    run(action, { ...v, revision: b.revision, order_id: o.id });
  return (
    <div className="bolig-delivery-dialog">
      <p>
        <strong>
          {o.number} · {o.snapshot.supplier}
        </strong>{" "}
        · {o.snapshot.reference}
      </p>
      {editor.kind === "ordered" &&
        makeForm(
          "ordered-" + o.id,
          { date: localDay(), confirmed: false },
          (v, b) => save("ordered", v, b),
          (v, c) => (
            <>
              <p>
                Bruk dette når ordren faktisk er lagt hos leverandøren. Denne
                knappen sender ingen bestilling.
              </p>
              <TextField
                label="Bestillingsdato"
                type="date"
                required
                value={v}
                change={c}
                name="date"
              />
              <label className="bolig-delivery-confirm">
                <input
                  type="checkbox"
                  checked={v.confirmed}
                  required
                  onChange={(e) => c("confirmed", e.target.checked)}
                />
                Bestillingen er lagt hos leverandøren.
              </label>
            </>
          ),
          "Bekreft bestilt",
        )}
      {editor.kind === "reference" &&
        makeForm(
          "reference-" + o.id,
          { supplier_reference: o.snapshot.supplier_reference || "" },
          (v, b) => save("supplier_reference", v, b),
          (v, c) => (
            <>
              <TextField
                label="Leverandørordrenummer (valgfritt)"
                value={v}
                change={c}
                name="supplier_reference"
              />
              <p>Kan fylles inn senere fra ordrebekreftelsen.</p>
            </>
          ),
        )}
      {editor.kind === "cancel" &&
        makeForm(
          "cancel-" + o.id,
          { confirmed: false },
          (v, b) => v.confirmed && save("cancel", v, b),
          (v, c) => (
            <>
              <p>
                Grunnlaget beholdes i historikken. Varene kan klargjøres på
                nytt. Bruk dette bare når ordren ikke er lagt hos leverandøren.
              </p>
              <label className="bolig-delivery-confirm">
                <input
                  type="checkbox"
                  required
                  checked={v.confirmed}
                  onChange={(e) => c("confirmed", e.target.checked)}
                />
                Grunnlaget skal annulleres.
              </label>
            </>
          ),
          "Bekreft annullering",
        )}
      {editor.kind === "receive" &&
        makeForm(
          "receive-" + o.id,
          { date: localDay(), note: "", quantities: {}, confirmed: false },
          (v, b) =>
            save(
              "receive",
              {
                date: v.date,
                note: v.note,
                lines: Object.entries(v.quantities)
                  .filter(
                    ([, q]) =>
                      q !== "" && Number(String(q).replace(",", ".")) !== 0,
                  )
                  .map(([position, q]) => ({
                    position: Number(position),
                    quantity: Number(String(q).replace(",", ".")),
                  })),
              },
              b,
            ),
          (v, c) => (
            <>
              <p>
                Før mengden som kom nå. Tidligere mottak er allerede registrert.
                Et negativt antall korrigerer et feilført mottak og krever en
                forklaring.
              </p>
              <TextField
                label="Mottaksdato"
                type="date"
                required
                value={v}
                change={c}
                name="date"
              />
              <button
                type="button"
                onClick={() =>
                  c(
                    "quantities",
                    Object.fromEntries(
                      o.snapshot.goods.map((g, i) => [
                        i,
                        String(
                          Math.round(
                            (Number(g.quantity) - Number(o.received[i] || 0)) *
                              1000,
                          ) / 1000,
                        ),
                      ]),
                    ),
                  )
                }
              >
                Fyll inn alt som gjenstår
              </button>
              {o.snapshot.goods.map((g, i) => (
                <label className="bolig-delivery-receive-line" key={i}>
                  <span>
                    <strong>{g.name}</strong>
                    <small>
                      {g.room_name} · {quantity(o.received[i] || 0)} av{" "}
                      {quantity(g.quantity)} {g.unit} mottatt
                    </small>
                  </span>
                  <input
                    aria-label={`Mottatt nå: ${g.name}`}
                    inputMode="decimal"
                    type="number"
                    step="0.001"
                    min={-Number(o.received[i] || 0)}
                    max={
                      Math.round(
                        (Number(g.quantity) - Number(o.received[i] || 0)) *
                          1000,
                      ) / 1000
                    }
                    value={v.quantities[i] ?? ""}
                    onChange={(e) =>
                      c("quantities", { ...v.quantities, [i]: e.target.value })
                    }
                  />
                </label>
              ))}
              <label>
                Merknad / forklaring ved korrigering
                <textarea
                  aria-label="Merknad / forklaring ved korrigering"
                  maxLength={1000}
                  value={v.note}
                  onChange={(e) => c("note", e.target.value)}
                />
              </label>
            </>
          ),
          "Lagre varemottak",
        )}
    </div>
  );
}
