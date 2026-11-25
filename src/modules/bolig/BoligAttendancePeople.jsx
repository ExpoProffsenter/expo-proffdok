import React, { useState, useRef } from "react";
import { getAppSupabaseClient } from "../access/appSupabaseClientRegistry.js";
import {
  readPartnerDraft,
  storePartnerDraft,
  useLivePartner,
} from "./boligPartnerClient.js";
import "./boligPresence.css";
export async function attendancePeopleRpc(
  context,
  root,
  action = "get",
  payload = {},
) {
  const client = getAppSupabaseClient();
  if (!client) throw Error("Innloggingen er ikke klar.");
  const request = client.rpc("bolig_attendance_people", {
    p_company_id: context.company_id,
    p_root_id: root,
    p_action: action,
    p_payload: payload,
  });
  const { data, error } = await (typeof request.retry === "function"
    ? request.retry(false)
    : request);
  if (error) throw Object.assign(Error(error.message), { code: error.code });
  if (
    data?.context?.user_id !== context.user_id ||
    data?.context?.company_id !== context.company_id ||
    data?.context?.role !== "manager" ||
    data?.root_id !== root
  )
    throw Object.assign(Error("Prosjekttilgangen er endret."), {
      code: "42501",
    });
  if (![data.people, data.users, data.partners].every(Array.isArray))
    throw Error("Deltakerlisten kunne ikke bekreftes.");
  return data;
}
export default function BoligAttendancePeople({ context, root, enabled }) {
  const scope = `${context.user_id}:${context.company_id}:${root.id}`,
    key = `expo.bolig-attendance-people.v1:${scope}`;
  const { data, error, busy, load, run } = useLivePartner(scope, () =>
    attendancePeopleRpc(context, root.id),
  );
  const [form, setForm] = useState(() =>
      readPartnerDraft(key, { identity: "", name: "" }),
    ),
    [pending, setPending] = useState(() =>
      readPartnerDraft(key + ":pending", null),
    ),
    [localError, setLocalError] = useState("");
  const [expanded, setExpanded] = useState(() =>
    Boolean(form.identity || form.name),
  );
  const pendingRef = useRef(pending);
  const change = (fields) => {
    try {
      const next = { ...form, ...fields };
      storePartnerDraft(key, next);
      setForm(next);
      setLocalError("");
    } catch {
      setLocalError("Kladden kunne ikke sikres. Behold vinduet åpent.");
    }
  };
  const write = (action, payload) => {
    try {
      const attempt = pendingRef.current || {
        action,
        payload: { ...payload, request_id: crypto.randomUUID() },
      };
      storePartnerDraft(key + ":pending", attempt);
      pendingRef.current = attempt;
      setPending(attempt);
      setLocalError("");
      run(
        async () => {
          const next = await attendancePeopleRpc(
            context,
            root.id,
            attempt.action,
            attempt.payload,
          );
          if (next.receipt_id !== attempt.payload.request_id)
            throw Error("Kvittering mangler. Prøv samme lagring igjen.");
          return next;
        },
        () => {
          storePartnerDraft(key + ":pending", null);
          pendingRef.current = null;
          setPending(null);
          if (attempt.action === "add") change({ identity: "", name: "" });
        },
        (e) => {
          if (["42501", "22023", "PT409"].includes(e.code)) {
            storePartnerDraft(key + ":pending", null);
            pendingRef.current = null;
            setPending(null);
            setLocalError(e.message);
            load();
          }
        },
      );
    } catch (e) {
      setLocalError(e.message);
    }
  };
  const locked = busy || !!pending || root.archived;
  return (
    <section
      className="bolig-presence-roster"
      aria-label="Prosjektdeltakere for inn- og utregistrering"
    >
      <h4>Hvem kan registrere seg inn og ut?</h4>
      <p>
        Legg til ansatte med appbruker eller en personlig UE-lenke. Ansatte
        bruker Min side. UE bruker lenken sin. Tilgangen gjelder bare egen
        tilstedeværelse.
      </p>
      {(error || localError) && <p role="alert">{localError || error}</p>}
      <button type="button" disabled={busy} onClick={() => load()}>
        Hent deltakerlisten
      </button>
      {data && (
        <>
          {data.people.map((x) => (
            <article key={x.id}>
              <div>
                <strong>{x.name}</strong>
                <span>
                  {x.company} · {x.user_id ? "Min side" : "Personlig UE-lenke"}{" "}
                  · {x.enabled ? "Aktiv deltaker" : "Deaktivert"}
                </span>
              </div>
              <button
                type="button"
                disabled={locked}
                onClick={() =>
                  write("toggle", {
                    id: x.id,
                    revision: x.revision,
                    enabled: !x.enabled,
                  })
                }
              >
                {x.enabled ? "Deaktiver deltaker" : "Aktiver deltaker"}
              </button>
            </article>
          ))}
          {!data.people.length && (
            <p>Ingen deltakere er lagt til for egen registrering.</p>
          )}
          <details
            open={expanded}
            onToggle={(e) => setExpanded(e.currentTarget.open)}
          >
            <summary onClick={(event) => {
              // Native toggle is deferred; remember the explicit click before a focus read can unmount details.
              event.preventDefault();
              setExpanded((value) => !value);
            }}>Legg til prosjektdeltaker</summary>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const [kind, id] = form.identity.split(":");
                write("add", {
                  [kind === "user" ? "user_id" : "access_id"]: id,
                  name: form.name,
                });
              }}
            >
              <label>
                Ansatt eller personlig UE-lenke
                <select
                  required
                  disabled={locked}
                  value={form.identity}
                  onChange={(e) => change({ identity: e.target.value })}
                >
                  <option value="">Velg deltaker</option>
                  <optgroup label="Ansatte i appen">
                    {data.users
                      .filter(
                        (x) => !data.people.some((p) => p.user_id === x.id),
                      )
                      .map((x) => (
                        <option key={x.id} value={`user:${x.id}`}>
                          {x.email}
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="Personlige UE-lenker">
                    {data.partners
                      .filter(
                        (x) => !data.people.some((p) => p.access_id === x.id),
                      )
                      .map((x) => (
                        <option key={x.id} value={`ue:${x.id}`}>
                          {x.name} · {x.company}
                        </option>
                      ))}
                  </optgroup>
                </select>
              </label>
              {form.identity.startsWith("user:") && (
                <label>
                  Deltakerens navn
                  <input
                    required
                    maxLength={120}
                    disabled={locked}
                    value={form.name}
                    onChange={(e) => change({ name: e.target.value })}
                  />
                </label>
              )}
              <p>
                For UE: Opprett én lenke per person under UE og leverandører.
                Bruk personens navn. En felles firmalenke skal ikke brukes som
                flere personer.
              </p>
              {!enabled && (
                <p>
                  Aktiver bemanning ovenfor for at deltakerne skal se
                  registreringskortet.
                </p>
              )}
              <button disabled={locked || !form.identity}>
                Legg til deltaker
              </button>
            </form>
          </details>
        </>
      )}
      {pending && (
        <div role="status">
          <p>Lagring er ikke bekreftet.</p>
          <button
            type="button"
            disabled={busy || !data}
            onClick={() => write()}
          >
            Prøv samme deltakerlagring igjen
          </button>
        </div>
      )}
    </section>
  );
}
