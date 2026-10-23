import React, { useEffect, useRef, useState } from "react";
import { getAppSupabaseClient } from "../access/appSupabaseClientRegistry.js";
import DraftForm from "./BoligDraftForm.jsx";
import { QUALITY_EVENT } from "./boligQualityClient.js";
import { COMMERCE_EVENT } from "./boligCommerceClient.js";
import { PROGRESS_EVENT } from "./boligProgressClient.js";
import { COORDINATION_EVENT } from "./boligCoordination.js";
import Dialog from "./BoligEditorDialog.jsx";

async function rpc(
  context,
  root,
  scope,
  action = "get",
  revision,
  payload = {},
) {
  const request = getAppSupabaseClient().rpc("bolig_handover_review", {
    p_company_id: context.company_id,
    p_root_id: root.id,
    p_scope_id: scope,
    p_action: action,
    p_revision: revision ?? null,
    p_payload: payload,
  });
  const { data, error } = await (typeof request.retry === "function"
    ? request.retry(false)
    : request);
  if (error) throw Object.assign(Error(error.message), { code: error.code });
  if (
    data?.context?.company_id !== context.company_id ||
    data?.context?.user_id !== context.user_id ||
    !data?.context?.enabled ||
    data?.root_id !== root.id ||
    data?.scope_id !== scope
  )
    throw Object.assign(Error("Firma eller arbeidsområde er endret."), {
      code: "42501",
    });
  return data;
}
const displayDate = (d) => (d ? new Date(d).toLocaleDateString("nb-NO") : "");
const today = () =>
  new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(
    new Date(),
  );

export default function BoligHandoverReview({
  context,
  root,
  scopeId,
  onRecorded,
}) {
  const scopeKey = `${context.user_id}:${context.company_id}:${context.role}:${context.enabled}:${root.id}:${scopeId}`;
  const [state, setState] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [open, setOpen] = useState(false),
    [notice, setNotice] = useState(""),
    [historyRevision, setHistoryRevision] = useState(null);
  const ticket = useRef(0),
    activeScope = useRef(scopeKey),
    working = useRef(false),
    pending = useRef(null),
    reload = useRef(null);
  activeScope.current = scopeKey;
  const current = state?.scopeKey === scopeKey ? state.data : null;
  useEffect(() => {
    let active = true;
    setState(null);
    setOpen(false);
    setBusy(false);
    setError("");
    setNotice("");
    setHistoryRevision(null);
    working.current = false;
    pending.current = null;
    if (!context.enabled) return;
    const load = async () => {
      if (working.current) return;
      const run = ++ticket.current;
      try {
        const data = await rpc(context, root, scopeId);
        if (active && run === ticket.current) {
          setState({ scopeKey, data });
          setError("");
        }
      } catch (e) {
        if (active && run === ticket.current) {
          setError(e.message);
          if (e.code === "42501") setState(null);
        }
      }
    };
    reload.current = load;
    load();
    const events = [
      "focus",
      "expo-proffdok-bolig-completion",
      QUALITY_EVENT,
      COORDINATION_EVENT,
      PROGRESS_EVENT,
      COMMERCE_EVENT,
      "expo-bolig-portal-changed",
    ];
    events.forEach((e) => window.addEventListener(e, load));
    const openFromControl = (event) => {
      if (
        event.detail?.root_id === root.id &&
        event.detail?.scope_id === scopeId &&
        context.role === "manager"
      )
        setOpen(true);
    };
    window.addEventListener("expo-bolig-open-handover-review", openFromControl);
    const interval = window.setInterval(() => {
      if (document.visibilityState !== "hidden") load();
    }, 20000);
    return () => {
      active = false;
      reload.current = null;
      ++ticket.current;
      window.clearInterval(interval);
      window.removeEventListener(
        "expo-bolig-open-handover-review",
        openFromControl,
      );
      events.forEach((e) => window.removeEventListener(e, load));
    };
  }, [scopeKey]);
  const save = async (action, value, basis) => {
    if (working.current) return false;
    working.current = true;
    const run = ++ticket.current;
    setBusy(true);
    setError("");
    setNotice("");
    const payload = {
      basis: basis.basis,
      decisions: current.cases
        .filter((c) => value.decisions[c.id]?.decision)
        .map((c) => ({
          id: c.id,
          ...(value.decisions[c.id] || {}),
        })),
      confirmed: value.confirmed,
      reference: value.reference,
      date: value.date,
      correction_reason: value.correction_reason,
    };
    const fingerprint = JSON.stringify([action, basis.revision, payload]);
    if (pending.current?.fingerprint !== fingerprint)
      pending.current = { fingerprint, request_id: crypto.randomUUID() };
    try {
      const data = await rpc(context, root, scopeId, action, basis.revision, {
        ...payload,
        request_id: pending.current.request_id,
      });
      if (run !== ticket.current || activeScope.current !== scopeKey)
        return false;
      pending.current = null;
      setState({ scopeKey, data });
      setOpen(false);
      setNotice(
        action === "record"
          ? "Overtakelsen er registrert. Åpne forhold beholdes til oppfølging."
          : "Vurderingen er lagret. Ingen kontroll, aktivitet eller melding er ferdigmeldt.",
      );
      if (action === "record") {
        onRecorded?.();
        window.dispatchEvent(new Event("expo-proffdok-bolig-completion"));
      }
      return true;
    } catch (e) {
      if (run === ticket.current && activeScope.current === scopeKey) {
        setError(e.message);
        if (e.code === "42501") setState(null);
      }
      return false;
    } finally {
      if (run === ticket.current && activeScope.current === scopeKey) {
        working.current = false;
        setBusy(false);
      }
    }
  };
  return (
    <section
      className="bolig-handover"
      aria-label="Overtakelse og åpne forhold"
    >
      <div className="bolig-handover-heading">
        <div>
          <small>PROSJEKTLEDERS VURDERING</small>
          <h3>Overtakelse og åpne forhold</h3>
        </div>
        {current && <span>{current.cases.length} åpne forhold</span>}
      </div>
      <button
        type="button"
        disabled={busy || !context.enabled}
        onClick={() => reload.current?.()}
      >
        Oppdater åpne forhold
      </button>
      <p>
        Her vurderer du om åpne forhold hindrer overtakelse, eller kan følges
        opp etterpå. Intern sluttkontroll følges opp separat.
      </p>
      {error && !open && <p role="alert">{error}</p>}
      {notice && <p role="status">{notice}</p>}
      {current?.record && (
        <div className="bolig-handover-record">
          <strong>
            Overtakelse registrert {displayDate(current.record.date)}
          </strong>
          <p>{current.record.reference}</p>
          <small>
            Registrert av {current.record.by_name}. Senere endringer sletter
            ikke denne registreringen.
          </small>
        </div>
      )}
      {current?.restricted ? (
        <p>
          Du trenger tilgang til alle koblede prosjekter i dette området for å
          se og vurdere hele grunnlaget. Åpne et tilgjengelig bygg eller en
          bolig.
        </p>
      ) : (
        current && (
          <>
            {current.assessment && (
              <p>
                {current.assessment.basis !== current.basis
                  ? "Oversikten er endret siden siste vurdering. Se over nye og endrede forhold."
                  : `Siste vurdering lagret av ${current.assessment.by_name}.`}
              </p>
            )}
            <CaseList
              cases={current.cases}
              decisions={current.assessment?.decisions}
            />
            {context.role === "manager" && !current.root_archived && (
              <button
                type="button"
                className="bolig-primary"
                disabled={busy}
                onClick={() => setOpen(true)}
              >
                {current.record
                  ? "Vurder oppfølging / rett registrering"
                  : "Vurder åpne forhold og overtakelse"}
              </button>
            )}
          </>
        )
      )}
      {!!current?.history?.length && (
        <details className="bolig-handover-history">
          <summary>
            Historikk for vurdering og overtakelse · {current.history.length}
          </summary>
          <ul>
            {current.history.map((h) => (
              <li key={h.revision}>
                <button
                  type="button"
                  onClick={() => setHistoryRevision(h.revision)}
                >
                  {h.action === "record"
                    ? "Overtakelse registrert / rettet"
                    : "Vurdering lagret"}{" "}
                  · {h.actor_name} · {displayDate(h.created_at)}
                </button>
              </li>
            ))}
          </ul>
          <p>
            Viser de siste 100 hendelsene. Hele historikken følger datafilen i
            ZIP.
          </p>
        </details>
      )}
      {historyRevision !== null &&
        current &&
        (() => {
          const h = current.history.find((h) => h.revision === historyRevision);
          if (!h) return null;
          const a = h.snapshot.assessment;
          return (
            <Dialog
              title="Tidligere vurdering av overtakelse"
              onClose={() => setHistoryRevision(null)}
            >
              <p>
                {h.actor_name} · {displayDate(h.created_at)}
              </p>
              {h.snapshot.record && (
                <p>
                  Registrert overtakelse: {h.snapshot.record.reference} ·{" "}
                  {displayDate(h.snapshot.record.date)}
                </p>
              )}
              <p>
                Dette viser vurderingen slik den ble lagret. Dagens åpne forhold
                vises i den aktuelle oversikten.
              </p>
              <CaseList
                cases={a?.decisions || []}
                decisions={a?.decisions || []}
              />
            </Dialog>
          );
        })()}
      {open && current && (
        <Dialog
          title="Prosjektleders vurdering av overtakelse"
          busy={busy}
          onClose={() => setOpen(false)}
        >
          {error && <p role="alert">{error}</p>}
          <ReviewForm
            key={scopeKey}
            context={context}
            root={root}
            scopeId={scopeId}
            data={current}
            busy={busy}
            onSave={save}
          />
        </Dialog>
      )}
    </section>
  );
}
function CaseList({ cases, decisions }) {
  const [search, setSearch] = useState(""),
    [limit, setLimit] = useState(10);
  const map = new Map((decisions || []).map((d) => [d.id, d]));
  const filtered = cases.filter((c) =>
    `${c.scope_title} ${c.category} ${c.title}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  return (
    <details className="bolig-handover-list">
      <summary>Se åpne forhold · {cases.length}</summary>
      <label>
        Søk i åpne forhold
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setLimit(10);
          }}
        />
      </label>
      <ul>
        {filtered.slice(0, limit).map((c) => {
          const d = map.get(c.id);
          return (
            <li key={c.id}>
              <small>
                {c.scope_title} · {c.category}
                {c.critical ? " · KRITISK" : ""}
              </small>
              <strong>{c.title}</strong>
              {c.description && <p>{c.description}</p>}
              <span>
                {d
                  ? d.decision === "block"
                    ? "Vurdert som hinder"
                    : `Følges opp av ${d.owner_name}`
                  : "Ikke vurdert"}
              </span>
              {d?.reason && <p>{d.reason}</p>}
            </li>
          );
        })}
      </ul>
      {filtered.length > limit && (
        <button type="button" onClick={() => setLimit(limit + 25)}>
          Vis flere forhold
        </button>
      )}
      {!cases.length && (
        <p>
          Ingen åpne forhold i det registrerte grunnlaget. Kontroller også den
          faktiske leveransen og protokollen.
        </p>
      )}
    </details>
  );
}
function ReviewForm({ context, root, scopeId, data, busy, onSave }) {
  const [search, setSearch] = useState(""),
    [limit, setLimit] = useState(20),
    [mode, setMode] = useState("assess");
  const saved = Object.fromEntries(
    (data.assessment?.decisions || []).map((d) => [d.id, d]),
  );
  return (
    <DraftForm
      context={context}
      rootId={root.id}
      name={`handover-review:${scopeId}`}
      initial={{
        decisions: saved,
        confirmed: false,
        reference: data.record?.reference || "",
        date: data.record?.date || today(),
        correction_reason: "",
        batch_reason: "",
        batch_owner: context.user_id,
      }}
      basis={{ revision: data.revision, basis: data.basis }}
      busy={busy}
      onRebase={(v) => ({
        decisions: Object.fromEntries(
          data.cases.map((c) => [c.id, v.decisions[c.id] || {}]),
        ),
        confirmed: false,
      })}
      conflictMessage="Grunnlaget er endret. Kladden beholdes. Se over oversikten før du bruker siste grunnlag."
      submitLabel={
        mode === "record"
          ? "Registrer gjennomført overtakelse"
          : "Lagre vurdering"
      }
      className="bolig-handover-form"
      onSave={(v, b) => onSave(mode, v, b)}
    >
      {(v, change) => {
        const setDecision = (id, patch) =>
          change((old) => ({
            decisions: {
              ...old.decisions,
              [id]: { ...old.decisions[id], ...patch },
            },
          }));
        const unreviewed = data.cases.filter(
          (c) => !["carry", "block"].includes(v.decisions[c.id]?.decision),
        );
        const blockers = data.cases.filter(
          (c) => v.decisions[c.id]?.decision === "block",
        );
        const filtered = data.cases.filter((c) =>
          `${c.scope_title} ${c.category} ${c.title}`
            .toLowerCase()
            .includes(search.toLowerCase()),
        );
        return (
          <>
            <p>
              Vurder hvert forhold. «Følges opp» beholder saken åpen. «Hindrer
              overtakelse» stopper registreringen ut fra din vurdering.
            </p>
            <details className="bolig-handover-batch">
              <summary>Gi flere vanlige forhold samme vurdering</summary>
              <p>
                Gjelder bare filtrerte forhold uten vurdering. Kritiske forhold
                vurderes alltid enkeltvis.
              </p>
              <label>
                Felles begrunnelse
                <textarea
                  rows={2}
                  maxLength={2000}
                  value={v.batch_reason}
                  onChange={(e) => change("batch_reason", e.target.value)}
                />
              </label>
              <label>
                Felles oppfølgingsansvarlig
                <select
                  value={v.batch_owner}
                  onChange={(e) => change("batch_owner", e.target.value)}
                >
                  {data.members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                disabled={v.batch_reason.trim().length < 3}
                onClick={() =>
                  change((old) => ({
                    decisions: {
                      ...old.decisions,
                      ...Object.fromEntries(
                        filtered
                          .filter(
                            (c) =>
                              !c.critical && !old.decisions[c.id]?.decision,
                          )
                          .map((c) => [
                            c.id,
                            {
                              decision: "carry",
                              reason: old.batch_reason,
                              owner_id: old.batch_owner,
                            },
                          ]),
                      ),
                    },
                  }))
                }
              >
                Følges opp – bruk på uvurderte i utvalget
              </button>
            </details>
            <p className="bolig-handover-count" role="status">
              {unreviewed.length} ikke vurdert · {blockers.length} vurdert som
              hinder
            </p>
            <label>
              Finn bolig eller forhold
              <input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setLimit(20);
                }}
              />
            </label>
            <div className="bolig-handover-cases">
              {filtered.slice(0, limit).map((c) => {
                const d = v.decisions[c.id] || {};
                return (
                  <details
                    key={c.id}
                    className={c.critical ? "is-critical" : ""}
                  >
                    <summary>
                      <span>
                        <small>
                          {c.scope_title} · {c.category}
                          {c.critical ? " · KRITISK" : ""}
                        </small>
                        <strong>{c.title}</strong>
                        <small>
                          {d.decision === "carry"
                            ? "Følges opp"
                            : d.decision === "block"
                              ? "Hindrer overtakelse"
                              : "Velg vurdering"}
                        </small>
                      </span>
                    </summary>
                    {c.description && <p>{c.description}</p>}
                    <label>
                      Vurdering
                      <select
                        aria-label="Vurdering"
                        value={d.decision || ""}
                        onChange={(e) =>
                          setDecision(c.id, { decision: e.target.value })
                        }
                      >
                        <option value="">Velg vurdering</option>
                        <option value="block">Hindrer overtakelse</option>
                        <option value="carry">
                          Følges opp etter overtakelse
                        </option>
                      </select>
                    </label>
                    <label>
                      Begrunnelse
                      <textarea
                        aria-label="Begrunnelse"
                        rows={3}
                        maxLength={2000}
                        value={d.reason || ""}
                        onChange={(e) =>
                          setDecision(c.id, { reason: e.target.value })
                        }
                      />
                    </label>
                    <label>
                      Oppfølgingsansvarlig
                      <select
                        aria-label="Oppfølgingsansvarlig"
                        value={d.owner_id || ""}
                        onChange={(e) =>
                          setDecision(c.id, { owner_id: e.target.value })
                        }
                      >
                        <option value="">Velg ansvarlig</option>
                        {data.members.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    {c.critical && (
                      <label className="bolig-completion-check">
                        <input
                          type="checkbox"
                          checked={!!d.critical_confirmed}
                          onChange={(e) =>
                            setDecision(c.id, {
                              critical_confirmed: e.target.checked,
                            })
                          }
                        />
                        Jeg har særskilt vurdert det kritiske forholdet.
                        Begrunnelsen forklarer beslutningen.
                      </label>
                    )}
                  </details>
                );
              })}
            </div>
            {filtered.length > limit && (
              <button type="button" onClick={() => setLimit(limit + 30)}>
                Vis flere til vurdering
              </button>
            )}
            <p>
              Oppfølgingsansvarlig er dokumentert her. Frister og fristvarsler
              følges opp i den tilknyttede aktiviteten. Denne vurderingen sender
              ingen e-post.
            </p>
            <label>
              Hva vil du lagre?
              <select
                aria-label="Hva vil du lagre?"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
              >
                <option value="assess">
                  Bare vurderingen – overtakelse registreres senere
                </option>
                <option value="record">
                  En overtakelse som er gjennomført
                </option>
              </select>
            </label>
            {mode === "record" && (
              <>
                <label>
                  Faktisk overtakelsesdato
                  <input
                    type="date"
                    required
                    max={today()}
                    value={v.date}
                    onChange={(e) => change("date", e.target.value)}
                  />
                </label>
                <label>
                  Referanse til gjennomført overtakelsesprotokoll
                  <textarea
                    required
                    minLength={3}
                    maxLength={2000}
                    rows={3}
                    aria-label="Referanse til gjennomført overtakelsesprotokoll"
                    value={v.reference}
                    onChange={(e) => change("reference", e.target.value)}
                  />
                </label>
                {data.record && (
                  <label>
                    Hvorfor rettes registreringen?
                    <textarea
                      required
                      minLength={3}
                      maxLength={2000}
                      value={v.correction_reason}
                      onChange={(e) =>
                        change("correction_reason", e.target.value)
                      }
                    />
                  </label>
                )}
                <p>
                  Dette registrerer den faktiske overtakelsen. Signering gjøres
                  i protokollen. Uferdige kontroller og øvrige saker beholdes
                  åpne.
                </p>
              </>
            )}
            {mode === "record" && (
              <label className="bolig-completion-check">
                <input
                  type="checkbox"
                  required
                  checked={v.confirmed}
                  onChange={(e) => change("confirmed", e.target.checked)}
                />
                Jeg har gjennomgått alle åpne forhold og står for vurderingene
                ovenfor.
              </label>
            )}
            {mode === "assess" && (
              <p>
                Du kan lagre vurderingen underveis. Forhold du ennå ikke har
                vurdert, blir stående som «Ikke vurdert».
              </p>
            )}
          </>
        );
      }}
    </DraftForm>
  );
}
