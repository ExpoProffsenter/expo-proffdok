import React, { useState, useRef, useEffect } from "react";
import { getAppSupabaseClient } from "../access/appSupabaseClientRegistry.js";
import {
  readPartnerDraft,
  storePartnerDraft,
  useLivePartner,
} from "./boligPartnerClient.js";
import "./boligPresence.css";
export async function presenceRpc(
  context,
  token,
  action = "get",
  payload = {},
) {
  let result;
  if (token) {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc/bolig_ue_attendance`,
      {
        method: "POST",
        signal: AbortSignal.timeout(20000),
        headers: {
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          p_token: token,
          p_action: action,
          p_payload: payload,
        }),
      },
    );
    const data = await response.json();
    if (!response.ok)
      throw Object.assign(
        Error(data.message || "Registreringen kunne ikke bekreftes."),
        { code: data.code },
      );
    result = data;
  } else {
    const client = getAppSupabaseClient();
    if (!client) throw Error("Appens innlogging er ikke klar.");
    const request = client.rpc("bolig_my_attendance", {
      p_company_id: context.company_id,
      p_action: action,
      p_payload: payload,
    });
    const { data, error } = await (typeof request.retry === "function"
      ? request.retry(false)
      : request);
    if (error) throw Object.assign(Error(error.message), { code: error.code });
    result = data;
    if (
      result?.context?.user_id !== context.user_id ||
      result?.context?.company_id !== context.company_id
    )
      throw Object.assign(Error("Bruker eller arbeidsfirma er endret."), {
        code: "42501",
      });
  }
  if (!Array.isArray(result?.entries))
    throw Error("Status kunne ikke bekreftes. Hent siste status.");
  return result;
}
const time = (value) =>
  new Intl.DateTimeFormat("nb-NO", {
    timeZone: "Europe/Oslo",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
export default function BoligPresenceCard({ context, token }) {
  const scope = token
      ? `ue:${token}`
      : `user:${context.user_id}:${context.company_id}`,
    key = `expo.bolig-presence.v1:${scope}`;
  const { data, error, busy, load, run } = useLivePartner(scope, () =>
    presenceRpc(context, token),
  );
  const [selected, setSelected] = useState(""),
    [pending, setPending] = useState(() => readPartnerDraft(key, null)),
    [localError, setLocalError] = useState("");
  const [knownParticipant, setKnownParticipant] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  useEffect(() => {
    if (data) setKnownParticipant(Boolean(data.entries?.length));
  }, [data]);
  const pendingRef = useRef(pending);
  const entries = data?.entries || [],
    active = entries.filter((x) => x.visit),
    person =
      entries.find((x) => x.id === pending?.payload.id) ||
      entries.find((x) => x.id === selected) ||
      active[0] ||
      entries[0];
  const save = (next) => {
    storePartnerDraft(key, next);
    pendingRef.current = next;
    setPending(next);
  };
  const register = () => {
    if (!person || busy) return;
    try {
      const attempt = pendingRef.current || {
        action: person.visit ? "out" : "in",
        payload: {
          id: person.id,
          revision: person.revision,
          visit_id: person.visit?.id || null,
          request_id: crypto.randomUUID(),
        },
      };
      save(attempt);
      setLocalError("");
      run(
        async () => {
          const result = await presenceRpc(
            context,
            token,
            attempt.action,
            attempt.payload,
          );
          if (result.receipt_id !== attempt.payload.request_id)
            throw Error("Kvittering mangler. Prøv samme registrering igjen.");
          return result;
        },
        () => {
          save(null);
          window.dispatchEvent(new Event("expo-bolig-coordination-changed"));
        },
        (e) => {
          if (["42501", "22023", "PT409"].includes(e.code)) {
            save(null);
            setLocalError(e.message);
            load();
          }
        },
      );
    } catch (e) {
      setLocalError(e.message);
    }
  };
  if (
    (!knownParticipant && !entries.length && !pending) ||
    (data && !entries.length && !pending)
  )
    return null;
  return (
    <section
      className={`bolig-presence-card ${data && person?.visit ? "is-in" : "is-out"}`}
      aria-label="Min tilstedeværelse på prosjektet"
    >
      <div className="bolig-presence-row">
        <div className="bolig-presence-identity">
          <span className="bolig-presence-light" aria-hidden="true" />
          <div className="bolig-presence-copy">
            <div className="bolig-presence-title" role="status">
              <strong>
                {!data
                  ? "Kontrollerer …"
                  : person?.visit
                    ? "Innlogget"
                    : "Utlogget"}
              </strong>
              {data && person?.visit && (
                <span className="bolig-presence-since">
                  siden {time(person.visit.arrived_at)}
                </span>
              )}
            </div>
            {data &&
              person &&
              (entries.length > 1 ? (
                <select
                  aria-label="Velg prosjekt for innregistrering"
                  disabled={busy || !!pending}
                  value={person.id}
                  onChange={(e) => setSelected(e.target.value)}
                >
                  {entries.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.project}
                      {x.visit ? " · Innlogget" : ""}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="bolig-presence-project" title={person.project}>
                  {person.project}
                </span>
              ))}
          </div>
        </div>
        {data && person && (
          <button
            type="button"
            className="bolig-presence-action"
            disabled={busy || !!pending}
            onClick={register}
          >
            {busy
              ? "Venter …"
              : person.visit
                ? "Registrer ut"
                : "Registrer inn"}
          </button>
        )}
        <button
          type="button"
          className="bolig-presence-info-toggle"
          aria-label="Info om inn- og utregistrering"
          aria-expanded={showInfo}
          onClick={() => setShowInfo((x) => !x)}
        >
          <span aria-hidden="true">i</span>
        </button>
      </div>
      {(error || localError) && (
        <p className="bolig-presence-message" role="alert">
          {localError || error}
        </p>
      )}
      {pending && (
        <div className="bolig-presence-message" role="status">
          <span>Registreringen er ikke bekreftet.</span>
          <button
            type="button"
            disabled={
              busy || !data || !entries.some((x) => x.id === pending.payload.id)
            }
            onClick={register}
          >
            Prøv samme registrering igjen
          </button>
        </div>
      )}
      <div className="bolig-presence-info" hidden={!showInfo}>
        {person && (
          <p>
            <strong>{person.project}</strong>
            <br />
            {person.name} · {person.company}
          </p>
        )}
        <p>
          Registrer når du kommer og går. Dette gjelder tilstedeværelse på
          prosjektet. Tidene vises i norsk tid.
        </p>
        {active.length > 1 && (
          <p>
            Du er registrert inne på {active.length} prosjekter. Velg prosjektet
            du vil registrere deg ut av.
          </p>
        )}
        <button
          type="button"
          className="secondary"
          disabled={busy}
          onClick={() => load()}
        >
          Hent min status
        </button>
        {token && (
          <details className="bolig-presence-install">
            <summary>Lagre lenken på telefonen</summary>
            <p>
              iPhone: Åpne lenken i Safari. Trykk Del → Legg til på Hjem-skjerm
              → Legg til. Velg Åpne som nettapp hvis valget vises.
            </p>
            <p>
              Android: Åpne lenken i Chrome. Trykk menyen ⋮ → Installer og
              opprett snarvei → Opprett snarvei. På noen telefoner heter valget
              Legg til på startsiden.
            </p>
            <p>Bruk din personlige lenke. Ikke del den med andre.</p>
          </details>
        )}
      </div>
    </section>
  );
}
