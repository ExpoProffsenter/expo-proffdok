import BoligQuality from "./BoligQuality.jsx";
import { QUALITY_EVENT } from "./boligQualityClient.js";
import React, { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  Circle,
  ClipboardCheck,
  ChevronRight,
  FileCheck2,
  RotateCcw,
  Plus,
  Building2,
  History,
} from "lucide-react";
import Dialog from "./BoligEditorDialog.jsx";
import {
  completionLabels as labels,
  completionRpc,
  completionTone,
} from "./boligCompletionClient.js";
import {
  boligDraftKey,
  readBoligDraft,
  writeBoligDraft,
  clearBoligDraft,
} from "./boligClient.js";
const date = (value) =>
  value
    ? new Date(value).toLocaleString("nb-NO", {
        dateStyle: "short",
        timeStyle: "short",
      })
    : "";
const actionLabels = {
  start: "Kontrollplan opprettet",
  no_common: "Fellesarbeider avklart",
  owner: "Ansvarlig endret",
  item: "Kontrollpunkt lagret",
  add: "Kontrollpunkt lagt til",
  approve: "Godkjent for overtagelse",
  handover: "Overtagelse registrert",
  reopen: "Gjenåpnet",
};

function ProofForm({
  context,
  root,
  scopeId,
  row,
  mode,
  item,
  members,
  rooms,
  busy,
  onSave,
  onCancel,
  error,
}) {
  const key = boligDraftKey(
    context,
    root.id,
    `completion:${scopeId}:${mode}:${item?.id || "new"}`,
  );
  const [draft, setDraft] = useState(() =>
    readBoligDraft(key, {
      id: item?.id || crypto.randomUUID(),
      evidence: item?.evidence || "",
      done: mode === "add" ? false : (item?.valid ?? true),
      title: "",
      room_id: item?.room_id || "",
      owner_id: row.owner_id || context.user_id,
      revision: row.revision,
      basis: row.basis,
    }),
  );
  const [storageError, setStorageError] = useState(false);
  const change = (patch) =>
    setDraft((old) => {
      const next = { ...old, ...patch };
      setStorageError(!writeBoligDraft(key, next));
      return next;
    });
  const conflict = draft.basis !== row.basis || draft.revision !== row.revision;
  const submit = async (e) => {
    e.preventDefault();
    const saved = await onSave(
      mode,
      { ...draft, done: draft.done, reason: draft.evidence },
      draft,
    );
    if (saved) clearBoligDraft(key);
  };
  const title =
    mode === "add"
      ? "Nytt kontrollpunkt"
      : mode === "owner"
        ? "Velg ansvarlig"
        : mode === "reopen"
          ? "Begrunn gjenåpning"
          : mode === "handover"
            ? "Registrer gjennomført overtagelse"
            : mode === "no_common"
              ? "Avklar fellesarbeider"
              : item?.title;
  return (
    <form className="bolig-completion-form" onSubmit={submit}>
      <h3>{title}</h3>
      {error && <p role="alert">{error}</p>}
      {storageError && (
        <p role="alert">
          Kladden kan ikke sikres på denne enheten. Behold vinduet åpent til du
          har lagret.
        </p>
      )}
      {conflict && (
        <div className="bolig-completion-warning">
          <strong>Grunnlaget er endret. Kladden er beholdt.</strong>
          <p>
            Se over den siste kontrollplanen. Bekreft deretter at beskrivelsen
            fortsatt gjelder.
          </p>
          <button
            type="button"
            onClick={() => change({ revision: row.revision, basis: row.basis })}
          >
            Bruk siste grunnlag
          </button>
        </div>
      )}
      {mode === "owner" ? (
        <label>
          Ansvarlig
          <select
            aria-label="Ansvarlig"
            value={draft.owner_id}
            onChange={(e) => change({ owner_id: e.target.value })}
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <>
          {mode === "add" && (
            <>
              <label>
                Navn på kontrollpunkt
                <input
                  required
                  minLength={3}
                  maxLength={160}
                  value={draft.title}
                  onChange={(e) => change({ title: e.target.value })}
                />
              </label>
              {rooms.length > 0 && (
                <label>
                  Rom
                  <select
                    aria-label="Rom"
                    value={draft.room_id}
                    onChange={(e) => change({ room_id: e.target.value })}
                  >
                    <option value="">Hele boligen</option>
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </>
          )}
          {mode === "item" && (rooms.length > 0 || item?.room_id) && (
            <label>
              Rom
              <select
                aria-label="Rom"
                value={draft.room_id}
                onChange={(e) => change({ room_id: e.target.value })}
              >
                <option value="">Hele boligen</option>
                {item?.room_id && !rooms.some((r) => r.id === item.room_id) && (
                  <option value={item.room_id}>
                    Tidligere rom – velg ny tilknytning
                  </option>
                )}
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          {["item", "add"].includes(mode) && (
            <label className="bolig-completion-check">
              <input
                type="checkbox"
                checked={draft.done}
                onChange={(e) => change({ done: e.target.checked })}
              />
              Kontrollen er utført og dokumentert
            </label>
          )}
          <label>
            {["reopen", "no_common"].includes(mode)
              ? "Begrunnelse"
              : mode === "handover"
                ? "Referanse til overtagelsesprotokoll"
                : "Dokumentreferanse og kontrollbeskrivelse"}
            <textarea
              required={!["item", "add"].includes(mode) || draft.done}
              minLength={draft.done ? 3 : undefined}
              maxLength={2000}
              rows={4}
              value={draft.evidence}
              placeholder={
                mode === "handover"
                  ? "Protokoll, dato og hvor dokumentet er lagret"
                  : "Hva er kontrollert, og hvor finnes dokumentasjonen?"
              }
              onChange={(e) => change({ evidence: e.target.value })}
            />
          </label>
          <p className="bolig-completion-hint">
            {mode === "handover"
              ? "Dette registrerer en overtagelse som allerede er gjennomført. Signering gjøres i overtagelsesprotokollen."
              : mode === "reopen"
                ? "Forklar hva som skal kontrolleres på nytt. Tidligere godkjenning og overtagelse beholdes i historikken."
                : mode === "no_common"
                  ? "Forklar hvorfor dette bygget eller prosjektet ikke har egne fellesarbeider. Boligene kontrolleres fortsatt hver for seg."
                  : "Oppgi filnavn, dato eller annen presis referanse. Dokumentene lagres i prosjektet eller avtalt dokumentarkiv."}
          </p>
        </>
      )}
      <footer>
        <button type="button" disabled={busy} onClick={onCancel}>
          Avbryt og behold kladd
        </button>
        <button className="bolig-primary" disabled={busy || conflict}>
          {busy
            ? "Lagrer …"
            : mode === "reopen"
              ? "Gjenåpne ferdigstilling"
              : mode === "handover"
                ? "Lagre overtagelse"
                : "Lagre kontroll"}
        </button>
      </footer>
    </form>
  );
}

export default function BoligCompletion({
  context,
  root,
  scopeId,
  onScope,
  onOpenProject,
  projectId,
}) {
  const [qualityOpen, setQualityOpen] = useState(false);
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [editor, setEditor] = useState(null),
    [confirm, setConfirm] = useState(false),
    [notice, setNotice] = useState("");
  const working = useRef(false);
  const [verified, setVerified] = useState(false);
  const current = useRef(0),
    mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      ++current.current;
    };
  }, []);
  const load = async () => {
    if (working.current) return;
    working.current = true;
    const ticket = ++current.current;
    setBusy(true);
    setError("");
    try {
      const result = await completionRpc(context, root.id, scopeId);
      if (mounted.current && ticket === current.current) {
        setData(result);
        setVerified(true);
      }
    } catch (e) {
      if (mounted.current && ticket === current.current) {
        setError(e.message);
        setVerified(false);
        if (e.code === "42501") setData(null);
      }
    } finally {
      working.current = false;
      if (mounted.current && ticket === current.current) setBusy(false);
    }
  };
  useEffect(() => {
    setData(null);
    setEditor(null);
    setConfirm(false);
    setNotice("");
    load();
    return () => {
      ++current.current;
    };
  }, [context.company_id, context.user_id, root.id, scopeId, context.role]);
  useEffect(() => {
    const events = [
      "focus",
      QUALITY_EVENT,
      "expo-proffdok-bolig-completion",
      "expo-proffdok-bolig-order",
      "expo-proffdok-bolig-catalog",
    ];
    events.forEach((e) => window.addEventListener(e, load));
    return () => events.forEach((e) => window.removeEventListener(e, load));
  }, [context.company_id, context.user_id, context.role, root.id, scopeId]);
  const row = data?.rows.find((r) => r.scope_id === scopeId);
  const editable =
    verified &&
    context.role === "manager" &&
    !data?.root_archived &&
    !row?.source?.restricted;
  const locked = !!row?.approval;
  const save = async (action, payload = {}, basis = row) => {
    if (working.current) return false;
    working.current = true;
    const ticket = ++current.current;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await completionRpc(
        context,
        root.id,
        scopeId,
        action,
        basis,
        payload,
      );
      if (!mounted.current || ticket !== current.current) return false;
      setData(result);
      setVerified(true);
      setEditor(null);
      setConfirm(false);
      setNotice(actionLabels[action] || "Lagret");
      window.dispatchEvent(new Event("expo-proffdok-bolig-completion"));
      return true;
    } catch (e) {
      if (mounted.current && ticket === current.current) {
        setError(e.message);
        if (e.code === "42501") setData(null);
      }
      return false;
    } finally {
      working.current = false;
      if (mounted.current && ticket === current.current) setBusy(false);
    }
  };
  if (!row)
    return (
      <section className="bolig-completion">
        <p role={error ? "alert" : "status"}>
          {error || "Henter dokumentert ferdigstilling …"}
        </p>
        {error && (
          <button type="button" onClick={load} disabled={busy}>
            Prøv igjen
          </button>
        )}
      </section>
    );
  const children = data.rows
    .filter((r) => r.parent_id === scopeId)
    .sort((a, b) => a.title.localeCompare(b.title, "nb", { numeric: true }));
  const ownMissing = row.items.filter((i) => !i.valid).length;
  const childrenAwaitHandover = children.some(
    (r) => r.status !== "handed_over",
  );
  return (
    <section
      className="bolig-completion"
      aria-label="Dokumentert ferdigstilling"
    >
      {row.parent_id && onScope && (
        <button
          type="button"
          className="bolig-quiet-action"
          onClick={() => onScope(row.parent_id)}
        >
          Tilbake til{" "}
          {data.rows.find((r) => r.scope_id === row.parent_id)?.title ||
            "overordnet oversikt"}
        </button>
      )}
      <div className="bolig-completion-heading">
        <div>
          <span className="bolig-completion-eyebrow">
            {row.kind === "unit"
              ? "Denne boligen"
              : row.kind === "block"
                ? "Bygg og fellesarbeider"
                : "Prosjekt og fellesarbeider"}
          </span>
          <h3>{row.title}</h3>
        </div>
        <span
          className={`bolig-completion-badge tone-${completionTone(verified ? row.status : "not_started")}`}
        >
          {verified ? labels[row.status] : "Kontrollstatus ikke hentet"}
        </span>
      </div>
      <p>
        Dokumenter arbeidet, kontroller mangellisten og godkjenn for
        overtagelse. Varelevering følges separat.
      </p>
      <ol
        className="bolig-completion-steps"
        aria-label="Trinn i ferdigstillingen"
      >
        {[
          ["Utført", ["executed", "controlled", "ready", "handed_over"]],
          ["Kontrollert", ["controlled", "ready", "handed_over"]],
          ["Klar for overtagelse", ["ready", "handed_over"]],
          ["Overtatt", ["handed_over"]],
        ].map(([name, states], i) => (
          <li
            key={name}
            className={verified && states.includes(row.status) ? "is-done" : ""}
          >
            <span>
              {verified && states.includes(row.status) ? (
                <CheckCircle2 size={18} />
              ) : (
                i + 1
              )}
            </span>
            {name}
          </li>
        ))}
      </ol>
      {error && !editor && <p role="alert">{error}</p>}
      {notice && (
        <p role="status" className="bolig-completion-success">
          {notice}
        </p>
      )}
      {row.status === "review" && (
        <div className="bolig-completion-warning">
          <strong>Godkjenningen gjelder et eldre grunnlag.</strong>
          <p>
            Gjenåpne med en begrunnelse. Kontroller endringene og godkjenn på
            nytt. Tidligere godkjenning og overtagelse ligger i historikken.
          </p>
        </div>
      )}
      <div className="bolig-completion-owner">
        <span>
          <strong>Ansvarlig</strong>
          <small>{row.owner_name || "Ikke valgt"}</small>
        </span>
        {editable && !locked && row.items.length > 0 && (
          <button
            type="button"
            disabled={busy}
            onClick={() => setEditor({ mode: "owner" })}
          >
            Endre ansvarlig
          </button>
        )}
      </div>
      {row.items.length === 0 ? (
        <div className="bolig-completion-empty">
          <ClipboardCheck size={32} />
          <h3>Avklar kontrollene først</h3>
          <p>
            {row.kind === "unit"
              ? "Start med utførelse, sjekklister, avvik, bilder og sluttdokumentasjon. Legg til egne kontroller for rom ved behov."
              : "Kontroller fellesarbeid og felles dokumentasjon i tillegg til boligene. Avklar uttrykkelig hvis det ikke er egne fellesarbeider."}
          </p>
          {editable && (
            <div className="bolig-completion-actions">
              <button
                className="bolig-primary"
                type="button"
                disabled={busy}
                onClick={() => save("start")}
              >
                Opprett kontrollplan
              </button>
              {row.kind !== "unit" && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setEditor({ mode: "no_common" })}
                >
                  Ingen egne fellesarbeider
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="bolig-completion-section-title">
            <h3>
              {row.kind === "unit"
                ? "Kontroller og dokumentasjon"
                : "Egne fellesarbeider"}
            </h3>
            <span>
              {row.done} av {row.total} dokumentert
            </span>
          </div>
          <div className="bolig-completion-items">
            {row.items.map((item) => (
              <button
                type="button"
                key={item.id}
                disabled={!editable || locked || busy}
                onClick={() => setEditor({ mode: "item", item })}
              >
                <span className={item.valid ? "is-done" : ""}>
                  {item.valid ? (
                    <CheckCircle2 size={22} />
                  ) : (
                    <Circle size={22} />
                  )}
                </span>
                <span>
                  <strong>{item.title}</strong>
                  {item.room_id && (
                    <small>
                      {data.rooms.find((r) => r.id === item.room_id)?.name ||
                        "Tidligere rom – kontroller tilknytningen"}
                    </small>
                  )}
                  <small>
                    {item.valid
                      ? item.evidence
                      : item.done
                        ? "Grunnlaget er endret. Kontroller på nytt."
                        : "Legg til dokumentasjon"}
                  </small>
                  {item.valid && (
                    <small>
                      {item.by_name || "Registrert"} · {date(item.at)}
                    </small>
                  )}
                </span>
                <ChevronRight size={18} />
              </button>
            ))}
          </div>
          {editable && !locked && (
            <button
              type="button"
              className="bolig-quiet-action"
              disabled={busy}
              onClick={() => setEditor({ mode: "add" })}
            >
              <Plus size={17} />
              Legg til kontrollpunkt
            </button>
          )}
        </>
      )}
      {editor && (
        <Dialog
          title="Dokumenter kontroll"
          busy={busy}
          onClose={() => setEditor(null)}
        >
          <ProofForm
            key={`${scopeId}:${editor.mode}:${editor.item?.id || "new"}`}
            context={context}
            root={root}
            scopeId={scopeId}
            row={row}
            mode={editor.mode}
            item={editor.item}
            members={data.members}
            rooms={data.rooms}
            busy={busy}
            error={error}
            onSave={save}
            onCancel={() => setEditor(null)}
          />
        </Dialog>
      )}
      {row.issues.length > 0 && (
        <details
          className="bolig-completion-gaps"
          open={row.status === "review" || row.items.length > 0}
        >
          <summary>Dette gjenstår · {row.issues.length}</summary>
          <ul>
            {row.issues.slice(0, 20).map((text, i) => (
              <li key={i}>{text}</li>
            ))}
          </ul>
          {row.issues.length > 20 && (
            <p>
              Viser de første 20. Åpne byggene og boligene nedenfor for alle
              detaljer.
            </p>
          )}
        </details>
      )}
      <div className="bolig-quality-entry">
        <div>
          <strong>Sjekklister og sluttdokumentasjon</strong>
          <p>
            Før egne kontroller, samle FDV og følg opp ekstern protokoll i dette
            arbeidsområdet.
          </p>
        </div>
        <button type="button" onClick={() => setQualityOpen(true)}>
          Åpne dokumentasjon
        </button>
      </div>
      {qualityOpen && (
        <Dialog
          title="Sjekklister og dokumentasjon"
          onClose={() => setQualityOpen(false)}
        >
          <BoligQuality
            context={context}
            root={root}
            scopeId={scopeId}
            onChange={load}
          />
        </Dialog>
      )}
      {projectId && (
        <div className="bolig-completion-project">
          <p>
            Koblede sjekklister og åpne avvik kontrolleres automatisk med din
            prosjekttilgang.
          </p>
          <button
            type="button"
            onClick={() => onOpenProject?.(projectId, "sjekklister")}
          >
            Åpne sjekklister
          </button>
          <button
            type="button"
            onClick={() => onOpenProject?.(projectId, "avvik")}
          >
            Åpne avvik
          </button>
          <button
            type="button"
            onClick={() => onOpenProject?.(projectId, "rapport")}
          >
            Åpne dokumentasjon
          </button>
        </div>
      )}
      {children.length > 0 && (
        <CompletionChildren rows={children} onScope={onScope} />
      )}
      {!editor && editable && row.items.length > 0 && (
        <div className="bolig-completion-decision">
          {locked ? (
            <>
              <p>
                <strong>Godkjent av {row.approval.by_name}</strong> ·{" "}
                {date(row.approval.at)}
              </p>
              {row.handover && (
                <p>
                  Overtagelse: {row.handover.reference} ·{" "}
                  {date(row.handover.at)}
                </p>
              )}
              {childrenAwaitHandover && row.status === "ready" && (
                <p>
                  Registrer overtagelse for alle aktive boliger eller bygg før
                  du registrerer samlet overtagelse.
                </p>
              )}
              <div className="bolig-completion-actions">
                {row.status === "ready" && (
                  <button
                    className="bolig-primary"
                    type="button"
                    disabled={busy || childrenAwaitHandover}
                    onClick={() => setEditor({ mode: "handover" })}
                  >
                    Registrer overtagelse
                  </button>
                )}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setEditor({ mode: "reopen" })}
                >
                  <RotateCcw size={16} />
                  Gjenåpne med begrunnelse
                </button>
              </div>
            </>
          ) : confirm ? (
            <>
              <strong>Godkjenn dette grunnlaget?</strong>
              <p>
                Du bekrefter at arbeidet og dokumentasjonen er kontrollert.
                Godkjenningen lagres med navn, tidspunkt og gjeldende grunnlag.
              </p>
              <button
                type="button"
                disabled={busy}
                onClick={() => setConfirm(false)}
              >
                Avbryt
              </button>
              <button
                type="button"
                className="bolig-primary"
                disabled={busy || row.issues.length > 0}
                onClick={() => save("approve")}
              >
                Bekreft godkjenning
              </button>
            </>
          ) : (
            <>
              <p>
                {row.issues.length
                  ? `${ownMissing ? ownMissing + " egne kontroller mangler dokumentasjon." : "Egne kontroller er dokumentert."} Fullfør også eventuelle mangler i koblet prosjekt og underliggende bygg/boliger.`
                  : "Alle kontrollkrav er dokumentert. Prosjektleder kan nå godkjenne grunnlaget."}
              </p>
              <button
                type="button"
                className="bolig-primary"
                disabled={busy || row.issues.length > 0}
                onClick={() => setConfirm(true)}
              >
                Godkjenn for overtagelse
              </button>
            </>
          )}
        </div>
      )}
      {data.history.length > 0 && (
        <details>
          <summary>
            <History size={17} />
            Historikk · {data.history.length}
          </summary>
          <ol className="bolig-completion-history">
            {data.history.map((event) => (
              <li key={event.id}>
                <strong>{actionLabels[event.action] || event.action}</strong>
                <small>
                  {event.actor_name} · {date(event.at)}
                </small>
                {event.reason && <p>{event.reason}</p>}
              </li>
            ))}
          </ol>
          <p className="bolig-completion-hint">
            Viser de siste 100 hendelsene. Tidligere hendelser er bevart.
          </p>
        </details>
      )}
      <button type="button" disabled={busy} onClick={load}>
        Hent siste kontrollgrunnlag
      </button>
    </section>
  );
}
function CompletionChildren({ rows, onScope }) {
  const [search, setSearch] = useState(""),
    [limit, setLimit] = useState(30);
  const filtered = rows.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase().trim()),
  );
  return (
    <div className="bolig-completion-children">
      <h3>
        {rows[0]?.kind === "unit" ? "Boliger i bygget" : "Bygg i prosjektet"}
      </h3>
      {rows.length > 10 && (
        <label>
          Søk i ferdigstilling
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setLimit(30);
            }}
          />
        </label>
      )}
      <ul className="bolig-summary-list">
        {filtered.slice(0, limit).map((r) => (
          <li key={r.scope_id}>
            <button type="button" onClick={() => onScope?.(r.scope_id)}>
              <span>
                <strong>{r.title}</strong>
                <small>
                  {labels[r.status]} ·{" "}
                  {r.issues.length
                    ? r.issues[0]
                    : "Kontrollgrunnlaget er dokumentert"}
                </small>
              </span>
              <ChevronRight size={18} />
            </button>
          </li>
        ))}
      </ul>
      {filtered.length > limit && (
        <button type="button" onClick={() => setLimit(limit + 30)}>
          Vis 30 flere
        </button>
      )}
    </div>
  );
}
export function BoligCompletionOverview({
  context,
  root,
  record,
  selectedBlockId,
  onData,
  onOpenProject,
}) {
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [scope, setScope] = useState(null);
  const report = useRef(onData);
  report.current = onData;
  useEffect(() => {
    let active = true,
      ticket = 0;
    const load = async () => {
      const run = ++ticket;
      try {
        const result = await completionRpc(context, root.id);
        if (active && run === ticket) {
          setData(result);
          setError("");
          report.current?.(result);
        }
      } catch (e) {
        if (active && run === ticket) {
          setData(null);
          setError("Ferdigstillingsstatus kunne ikke hentes.");
          report.current?.(null);
        }
      }
    };
    load();
    const events = [
      "focus",
      QUALITY_EVENT,
      "expo-proffdok-bolig-completion",
      "expo-proffdok-bolig-order",
      "expo-proffdok-bolig-catalog",
    ];
    events.forEach((e) => window.addEventListener(e, load));
    return () => {
      active = false;
      ++ticket;
      events.forEach((e) => window.removeEventListener(e, load));
    };
  }, [
    context.company_id,
    context.user_id,
    context.role,
    root.id,
    root.revision,
  ]);
  const project = data?.rows.find((r) => r.scope_id === root.id);
  const units = data?.rows.filter((r) => r.kind === "unit") || [];
  const ready = units.filter((r) =>
    ["ready", "handed_over"].includes(r.status),
  ).length;
  return (
    <div className="bolig-completion-overview">
      <div>
        <FileCheck2 size={23} />
        <span>
          <strong>Dokumentert ferdigstilling</strong>
          <small>
            {error ||
              (project
                ? `${ready} av ${units.length} boliger klare · Prosjekt: ${labels[project.status]}`
                : "Henter kontrollstatus …")}
          </small>
        </span>
      </div>
      <div className="bolig-completion-actions">
        <button
          type="button"
          disabled={!selectedBlockId}
          onClick={() => setScope(selectedBlockId)}
        >
          <Building2 size={17} />
          Ferdigstilling av bygg
        </button>
        <button type="button" onClick={() => setScope(root.id)}>
          Ferdigstilling av prosjekt
        </button>
      </div>
      {scope && (
        <Dialog
          title="Ferdigstilling av bygg og prosjekt"
          onClose={() => setScope(null)}
        >
          <BoligCompletion
            key={scope}
            context={context}
            root={root}
            scopeId={scope}
            onScope={setScope}
            projectId={record.units.find((u) => u.id === scope)?.project_id}
            onOpenProject={(id, tab) => {
              setScope(null);
              onOpenProject?.(id, tab);
            }}
          />
          <footer>
            <button type="button" onClick={() => setScope(null)}>
              Tilbake til byggoversikten
            </button>
          </footer>
        </Dialog>
      )}
    </div>
  );
}
