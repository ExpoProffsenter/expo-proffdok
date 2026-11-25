import React, { useEffect, useRef, useState } from "react";
import { getAppSupabaseClient } from "../access/appSupabaseClientRegistry.js";
import Dialog from "./BoligEditorDialog.jsx";
import DraftForm from "./BoligDraftForm.jsx";
import Progress from "./BoligProgress.jsx";
import {
  localToday,
  progressDate,
  progressLabels,
  PROGRESS_EVENT,
} from "./boligProgressClient.js";

export default function BoligCaseFollowup({
  context,
  root,
  scopeId,
  source,
  onClose,
}) {
  const scope = `${context.user_id}/${context.company_id}/${context.role}/${context.enabled}/${root.id}/${scopeId}`;
  const current = useRef(scope),
    epoch = useRef(0),
    pending = useRef(null),
    operating = useRef(false);
  current.current = scope;
  const [state, setState] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [editingTask, setEditingTask] = useState(false);
  const data = state?.scope === scope ? state.data : null;
  const rpc = async (action = "get", payload = {}) => {
    const req = getAppSupabaseClient().rpc("bolig_handover_followup", {
      p_company_id: context.company_id,
      p_root_id: root.id,
      p_scope_id: scopeId,
      p_action: action,
      p_payload: payload,
    });
    const { data: result, error: failure } = await (typeof req.retry ===
    "function"
      ? req.retry(false)
      : req);
    if (failure)
      throw Object.assign(Error(failure.message), { code: failure.code });
    if (
      result?.context?.user_id !== context.user_id ||
      result?.context?.company_id !== context.company_id ||
      !result?.context?.enabled ||
      result.root_id !== root.id ||
      result.scope_id !== scopeId
    )
      throw Object.assign(Error("Firma eller boligtilgang er endret."), {
        code: "42501",
      });
    return result;
  };
  useEffect(() => {
    let active = true;
    setState(null);
    setEditingTask(false);
    setError("");
    operating.current = false;
    pending.current = null;
    const load = async () => {
      if (operating.current || !context.enabled) return;
      const ticket = ++epoch.current;
      try {
        const result = await rpc();
        if (active && ticket === epoch.current)
          setState({ scope, data: result });
      } catch (e) {
        if (active && ticket === epoch.current) {
          setError(e.message);
          if (e.code === "42501") setState(null);
        }
      }
    };
    load();
    window.addEventListener("focus", load);
    window.addEventListener(PROGRESS_EVENT, load);
    return () => {
      active = false;
      ++epoch.current;
      window.removeEventListener("focus", load);
      window.removeEventListener(PROGRESS_EVENT, load);
    };
  }, [scope]);
  const linked = data?.links.find((l) => l.case_id === source.id);
  const task = data?.tasks.find(
    (t) =>
      t.id ===
      (linked?.task_id ||
        (source.id.startsWith("task:") ? source.id.slice(5) : "")),
  );
  const writable =
    context.enabled &&
    context.role === "manager" &&
    data?.context.role === "manager" &&
    !root.archived;
  const units = (data?.units || []).filter(
    (u) =>
      source.scope_id === root.id ||
      source.scope_id === u.id ||
      source.scope_id === u.block_id,
  );
  const choices = (data?.tasks || []).filter(
    (t) => !t.archived && t.active && units.some((u) => u.id === t.unit_id),
  );
  const save = async (v, basis) => {
    if (operating.current || !writable) return false;
    operating.current = true;
    setBusy(true);
    setError("");
    const ticket = ++epoch.current;
    const payload = { ...v, basis: basis.basis, case_id: source.id };
    delete payload._basis;
    const fp = JSON.stringify(payload);
    if (pending.current?.fp !== fp)
      pending.current = { fp, request_id: v.request_id };
    try {
      await rpc(v.mode, { ...payload, request_id: pending.current.request_id });
      if (current.current !== scope || ticket !== epoch.current) return false;
      pending.current = null;
      onClose();
      window.dispatchEvent(new Event(PROGRESS_EVENT));
      return true;
    } catch (e) {
      if (current.current === scope && ticket === epoch.current) {
        setError(e.message);
        if (e.code === "42501") setState(null);
      }
      return false;
    } finally {
      if (current.current === scope && ticket === epoch.current) {
        operating.current = false;
        setBusy(false);
      }
    }
  };
  return (
    <>
      <Dialog
        title="Oppfølging i fremdriftsplanen"
        busy={busy}
        onClose={onClose}
        className="bolig-handover-dialog"
      >
        <h3>
          {source.scope_title} · {source.title}
        </h3>
        <p>
          Bruk en aktivitet i den vanlige fremdriftsplanen. Saken og vurderingen
          av overtakelse beholdes separat.
        </p>
        {error && <p role="alert">{error}</p>}
        {!data ? (
          <p role="status">Henter aktiviteter …</p>
        ) : task ? (
          <>
            <h4>{task.title}</h4>
            <p>
              {task.owner_name} · {progressDate(task.planned_start)} –{" "}
              {progressDate(task.planned_end)} · {progressLabels[task.status]}
              {task.archived ? " · Arkivert" : ""}
            </p>
            <p>
              Denne aktivitetens ansvarlige får fristvarslene. At aktiviteten er
              utført, lukker ikke avviket eller beboermeldingen.
            </p>
            {writable && task.active && !task.archived && (
              <button type="button" onClick={() => setEditingTask(true)}>
                Åpne aktivitet
              </button>
            )}
          </>
        ) : linked ? (
          <p>
            Den koblede aktiviteten er ikke tilgjengelig. Kontroller tilgangen
            og fremdriftsplanen.
          </p>
        ) : writable ? (
          <DraftForm
            key={`${scope}/${source.id}`}
            context={context}
            rootId={root.id}
            name={`followup:${source.id}`}
            busy={busy}
            initial={{
              request_id: crypto.randomUUID(),
              mode: choices.length ? "link" : "create",
              task_id: "",
              new_id: crypto.randomUUID(),
              unit_id: units.length === 1 ? units[0].id : "",
              title: source.title.slice(0, 120),
              owner_id: source.owner_id || context.user_id,
              planned_start: localToday(),
              planned_end: localToday(),
            }}
            basis={{ basis: data.basis }}
            onRebase={() => ({ request_id: crypto.randomUUID() })}
            conflictMessage="Åpne forhold er endret. Se over siste oversikt. Kladden beholdes."
            submitLabel="Lagre oppfølging"
            onSave={(v, b) =>
              save(
                { ...v, task_id: v.mode === "create" ? v.new_id : v.task_id },
                b,
              )
            }
          >
            {(v, update) => {
              const change = (field, value) =>
                update({ [field]: value, request_id: crypto.randomUUID() });
              return (
                <>
                  <label>
                    Bruk aktivitet
                    <select
                      aria-label="Bruk aktivitet"
                      value={v.mode}
                      onChange={(e) => change("mode", e.target.value)}
                    >
                      <option value="link">
                        Koble til eksisterende aktivitet
                      </option>
                      <option value="create">
                        Opprett aktivitet i fremdriftsplanen
                      </option>
                    </select>
                  </label>
                  {v.mode === "link" ? (
                    <>
                      <label>
                        Aktivitet
                        <select
                          aria-label="Aktivitet"
                          required
                          value={v.task_id}
                          onChange={(e) => change("task_id", e.target.value)}
                        >
                          <option value="">Velg aktivitet</option>
                          {choices.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.unit_number} · {t.title} ·{" "}
                              {progressDate(t.planned_end)}
                            </option>
                          ))}
                        </select>
                      </label>
                      {choices
                        .filter((t) => t.id === v.task_id)
                        .map((t) => (
                          <p key={t.id}>
                            Fristvarsler går til{" "}
                            {t.owner_name || "aktivitetens ansvarlige"}. Frist:{" "}
                            {progressDate(t.planned_end)}.{" "}
                            {progressLabels[t.status]}.
                          </p>
                        ))}
                    </>
                  ) : (
                    <>
                      <label>
                        Bolig
                        <select
                          aria-label="Bolig"
                          required
                          value={v.unit_id}
                          onChange={(e) => change("unit_id", e.target.value)}
                        >
                          <option value="">Velg bolig for arbeidet</option>
                          {units.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.number} · {u.address}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Arbeid
                        <input
                          required
                          minLength={2}
                          maxLength={120}
                          value={v.title}
                          onChange={(e) => change("title", e.target.value)}
                        />
                      </label>
                      <label>
                        Ansvarlig
                        <select
                          aria-label="Ansvarlig"
                          required
                          value={v.owner_id}
                          onChange={(e) => change("owner_id", e.target.value)}
                        >
                          {data.members.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Planlagt start
                        <input
                          required
                          type="date"
                          value={v.planned_start}
                          onChange={(e) =>
                            change("planned_start", e.target.value)
                          }
                        />
                      </label>
                      <label>
                        Frist
                        <input
                          required
                          type="date"
                          min={v.planned_start}
                          value={v.planned_end}
                          onChange={(e) =>
                            change("planned_end", e.target.value)
                          }
                        />
                      </label>
                    </>
                  )}
                </>
              );
            }}
          </DraftForm>
        ) : (
          <p>Prosjektleder kan koble saken til en aktivitet.</p>
        )}
        {data && (
          <p>
            Fristvarsler følger aktivitetens ansvarlige: ved tildeling, fra to
            dager før fristen, på fristdagen og deretter ukentlig. Utført arbeid
            og endrede ansvar/datoer kontrolleres før utsending.
            Vurderingsansvarlig endres ikke automatisk.{" "}
            {data.mail_enabled
              ? "E-post følger egen utsendingsstatus."
              : "E-postutsending er av i dette miljøet."}
          </p>
        )}
      </Dialog>
      {editingTask && task && writable && (
        <Progress
          key={`${scope}/${task.id}`}
          context={context}
          root={root}
          unit={data.units.find((u) => u.id === task.unit_id)}
          taskId={task.id}
          onTaskClose={() => {
            setEditingTask(false);
            window.dispatchEvent(new Event(PROGRESS_EVENT));
          }}
        />
      )}
    </>
  );
}
