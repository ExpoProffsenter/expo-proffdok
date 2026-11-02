import React, { Suspense, useState, useRef, useEffect } from "react";
import { integrationRpc } from "./boligIntegrationClient.js";
import { useLivePartner } from "./boligPartnerClient.js";
import Dialog from "./BoligEditorDialog.jsx";
import "./boligIntegration.css";
const Progress = React.lazy(() => import("./BoligProgress.jsx"));
const Deviations = React.lazy(() => import("../kshms/KshmsDeviations.jsx"));
const Executions = React.lazy(() => import("../kshms/KshmsExecutions.jsx"));
const labels = {
  progress: "Fremdrift",
  deviation: "RUH / avvik",
  round: "Vernerunde",
  risk: "Risikovurdering",
};
export default function BoligMyTasks({ context }) {
  const scope = `${context.user_id}:${context.company_id}`;
  const selectedRef = useRef(null);
  const readFailure = useRef(null);
  const readSequence = useRef(0);
  const { data, error, busy, load } = useLivePartner(scope, async () => {
    const ticket = ++readSequence.current;
    try {
      const result = await integrationRpc(context, null, "get", {
        selected_id: selectedRef.current?.id,
        selected_kind: selectedRef.current?.kind,
      });
      if (ticket === readSequence.current) readFailure.current = null;
      return result;
    } catch (e) {
      // Keep the shared access/foreground reader unchanged. An unavailable
      // module still stays hidden; a failed permitted read must offer retry.
      if (ticket === readSequence.current) readFailure.current = { scope, code: e.code };
      throw e;
    }
  });
  const [expanded, setExpanded] = useState(true),
    [opened, setOpened] = useState(null),
    [limit, setLimit] = useState(4),
    [extra, setExtra] = useState({ basis: null, items: [], next: null }),
    [moreBusy, setMoreBusy] = useState(false),
    [localError, setLocalError] = useState("");
  selectedRef.current = opened;
  useEffect(() => {
    const refresh = () => load({ retain: true });
    const events = [
      "expo-bolig-progress-changed",
      "expo:kshms:deviation-change",
      "expo:kshms:execution-change",
    ];
    events.forEach((e) => window.addEventListener(e, refresh));
    return () => events.forEach((e) => window.removeEventListener(e, refresh));
  }, [load]);
  const rows = data
    ? [...data.items, ...(extra.basis === data ? extra.items : [])]
    : [];
  const next = extra.basis === data ? extra.next : data?.next;
  const more = async () => {
    if (!next || moreBusy || !data) return;
    setMoreBusy(true);
    setLocalError("");
    const basis = data;
    try {
      const r = await integrationRpc(context, null, "get", { after: next });
      setExtra((previous) => ({
        basis,
        items: [
          ...(previous.basis === basis ? previous.items : []),
          ...r.items,
        ].filter(
          (x, i, a) =>
            a.findIndex((y) => y.kind === x.kind && y.id === x.id) === i,
        ),
        next: r.next,
      }));
      setLimit((n) => n + 8);
    } catch (e) {
      setLocalError(e.message);
    } finally {
      setMoreBusy(false);
    }
  };
  const open = (row) =>
    setOpened({
      ...row,
      companyId: context.company_id,
      userId: context.user_id,
      nonce: crypto.randomUUID(),
    });
  const ks =
    data?.ks_context?.company_id === context.company_id &&
    data?.ks_context?.user_id === context.user_id
      ? data.ks_context
      : null;
  const selected =
    data &&
    opened?.companyId === context.company_id &&
    opened?.userId === context.user_id &&
    ((data.selected?.id === opened.id && data.selected.kind === opened.kind
      ? data.selected
      : null) ||
      rows.find((x) => x.id === opened.id && x.kind === opened.kind));
  const loadFailed = error && readFailure.current?.scope === scope && readFailure.current.code !== "42501";
  if (!data && loadFailed) return (
    <section className="bolig-my-tasks" aria-label="Mine oppgaver i boligprosjekter">
      <div className="bolig-my-tasks-content">
        <h3>Mine oppgaver i boligprosjekter</h3>
        <p role="alert"><strong>Kunne ikke hente oppgavene.</strong> Listen er ikke bekreftet. Prøv igjen når forbindelsen er tilbake.</p>
        <button type="button" disabled={busy} onClick={() => load()}>Prøv å hente oppgavene igjen</button>
      </div>
    </section>
  );
  if (!data?.count && !opened) return null;
  return (
    <section
      className="bolig-my-tasks"
      aria-label="Mine oppgaver i boligprosjekter"
    >
      <button
        type="button"
        className="bolig-my-tasks-toggle"
        aria-expanded={expanded}
        onClick={() => setExpanded((x) => !x)}
      >
        <strong>Mine oppgaver i boligprosjekter</strong>
        <span>
          {data ? `${data.count} åpne` : "Kontrollerer …"}{" "}
          {expanded ? "−" : "+"}
        </span>
      </button>
      <div hidden={!expanded} className="bolig-my-tasks-content">
        <p>
          Oppgaver der du er registrert som ansvarlig. Åpne oppgaven og følg den
          opp i den vanlige arbeidsflaten. Listen oppdateres fra lagret status.
        </p>
        {(error || localError) && <p role="alert">{localError || error}</p>}
        <button
          type="button"
          className="secondary"
          disabled={busy}
          onClick={() => load()}
        >
          Hent mine boligoppgaver
        </button>
        {rows.slice(0, limit).map((row) => (
          <article key={`${row.kind}:${row.id}`}>
            <div>
              <strong>{row.title}</strong>
              <span>
                {row.project_title}
                {row.unit_number ? ` · ${row.unit_number}` : ""}
                {row.room_name ? ` · ${row.room_name}` : ""}
              </span>
              <span>
                {labels[row.kind]} ·{" "}
                {row.due_on
                  ? `${row.date_label} ${row.due_on.split("-").reverse().join(".")}`
                  : "Ingen dato registrert"}
              </span>
            </div>
            <button type="button" disabled={busy} onClick={() => open(row)}>
              Åpne oppgave
            </button>
          </article>
        ))}
        {limit < rows.length ? (
          <button type="button" onClick={() => setLimit((n) => n + 8)}>
            Vis flere boligoppgaver
          </button>
        ) : next ? (
          <button type="button" disabled={busy || moreBusy} onClick={more}>
            Hent flere boligoppgaver
          </button>
        ) : null}
      </div>
      {selected && (
        <Suspense fallback={<p role="status">Henter oppgaven …</p>}>
          {selected.kind === "progress" ? (
            data.context.role === "manager" ? (
              <Progress
                context={data.context}
                root={{ id: selected.root_id, title: selected.project_title }}
                unit={{ id: selected.unit_id }}
                taskId={selected.id}
                onTaskClose={() => {
                  setOpened(null);
                  load();
                }}
              />
            ) : (
              <Dialog
                title="Min fremdriftsoppgave"
                onClose={() => setOpened(null)}
              >
                <p>
                  {selected.title} · {selected.project_title} ·{" "}
                  {selected.unit_number}
                </p>
                <p>
                  {selected.date_label}: {selected.due_on}
                </p>
                <p>
                  Du har lesetilgang. Prosjektleder registrerer endringer i
                  fremdriftsplanen.
                </p>
              </Dialog>
            )
          ) : ks ? (
            selected.kind === "deviation" ? (
              <Dialog
                title="Min RUH / avviksoppgave"
                onClose={() => {
                  setOpened(null);
                  load();
                }}
              >
                <Deviations
                  context={ks}
                  projectId={selected.project_id}
                  request={opened}
                />
              </Dialog>
            ) : (
              <Executions
                context={ks}
                kind={selected.kind}
                projectId={selected.project_id}
                openRequest={opened}
                dialogOnly
                onClose={() => {
                  setOpened(null);
                  load();
                }}
              />
            )
          ) : null}
        </Suspense>
      )}
    </section>
  );
}
