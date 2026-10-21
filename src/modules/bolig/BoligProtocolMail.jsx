import React, { useEffect, useRef, useState } from "react";
import Dialog from "./BoligEditorDialog.jsx";
import { getAppSupabaseClient } from "../access/appSupabaseClientRegistry.js";
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
const date = (v) =>
  new Date(v).toLocaleString("nb-NO", { timeZone: "Europe/Oslo" });
export default function ProtocolMail({
  context,
  rootId,
  scopeId,
  protocol,
  onClose,
}) {
  const key = boligDraftKey(
    context,
    rootId,
    `protocol-mail:${scopeId}:${protocol.id}:${protocol.confirmation.id}`,
  );
  const [to, setTo] = useState(() => readBoligDraft(key, {}).to || ""),
    [prepared, setPrepared] = useState(null),
    [history, setHistory] = useState([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [ready, setReady] = useState(false),
    [sent, setSent] = useState(false),
    [attempted, setAttempted] = useState(false);
  const epoch = useRef(0),
    alive = useRef(true);
  const rpc = async (action, payload) => {
    const pending = getAppSupabaseClient().rpc("bolig_protocol_mail", {
      p_company_id: context.company_id,
      p_root_id: rootId,
      p_scope_id: scopeId,
      p_action: action,
      p_payload: { protocol_id: protocol.id, ...payload },
    });
    const { data, error } = await (typeof pending.retry === "function"
      ? pending.retry(false)
      : pending);
    if (error) throw Object.assign(Error(error.message), { code: error.code });
    if (
      data?.context?.company_id !== context.company_id ||
      data?.context?.user_id !== context.user_id ||
      data?.context?.role !== "manager" ||
      data.root_id !== rootId ||
      data.scope_id !== scopeId
    )
      throw Error("Tilgangen til e-postbekreftelsen er endret.");
    return data;
  };
  const load = async () => {
    const t = ++epoch.current;
    setReady(false);
    try {
      const d = await rpc("list", {});
      if (!alive.current || t !== epoch.current) return;
      setHistory(d.history);
      const pending = d.history.find(
        (m) => m.confirmation_id === protocol.confirmation.id && !m.sent_at,
      );
      if (pending) {
        setPrepared(pending);
        setAttempted(Boolean(pending.begun_at));
      }
      setReady(true);
    } catch (e) {
      if (alive.current && t === epoch.current) setError(e.message);
    }
  };
  useEffect(() => {
    alive.current = true;
    load();
    const events = [
        WORK_PROFILE_EVENT,
        MANAGED_ACCESS_EVENT,
        MODULE_ACCESS_EVENT,
      ],
      recheck = () => load();
    events.forEach((e) => window.addEventListener(e, recheck));
    return () => {
      alive.current = false;
      ++epoch.current;
      events.forEach((e) => window.removeEventListener(e, recheck));
    };
  }, [
    context.company_id,
    context.user_id,
    rootId,
    scopeId,
    protocol.id,
    protocol.confirmation.id,
  ]);
  const prepare = async (e) => {
    e.preventDefault();
    const t = epoch.current;
    setBusy(true);
    setError("");
    try {
      const d = await rpc("prepare", {
        request_id: crypto.randomUUID(),
        confirmation_id: protocol.confirmation.id,
        to,
      });
      if (!alive.current || t !== epoch.current) return;
      setPrepared(d);
      setSent(Boolean(d.sent));
      setAttempted(Boolean(d.begun_at));
    } catch (e) {
      if (alive.current && t === epoch.current) setError(e.message);
    } finally {
      if (alive.current && t === epoch.current) setBusy(false);
    }
  };
  const send = async () => {
    const t = epoch.current;
    setBusy(true);
    setAttempted(true);
    setError("");
    try {
      const check = await rpc("inspect", { request_id: prepared.id });
      if (!alive.current || t !== epoch.current) return;
      if (check.sent) {
        setSent(true);
        clearBoligDraft(key);
        return;
      }
      const { data, error } = await getAppSupabaseClient().functions.invoke(
        "bolig-protocol-email",
        {
          body: {
            companyId: context.company_id,
            rootId,
            scopeId,
            requestId: prepared.id,
          },
        },
      );
      if (!alive.current || t !== epoch.current) return;
      if (error || !data?.ok) {
        let detail = data;
        try {
          if (error?.context) detail = await error.context.json();
        } catch {}
        throw Error(
          detail?.error ||
            "Sendestatus kunne ikke bekreftes. Prøv samme sending igjen.",
        );
      }
      setSent(true);
      clearBoligDraft(key);
    } catch (e) {
      if (alive.current && t === epoch.current) setError(e.message);
    } finally {
      if (alive.current && t === epoch.current) setBusy(false);
    }
  };
  return (
    <Dialog title="Send rettingsbekreftelse" busy={busy} onClose={onClose}>
      <div className="bolig-quality-editor">
        {!ready ? (
          <>
            <p role="status">
              {error || "Kontrollerer bekreftelse og tidligere sendinger …"}
            </p>
            <button type="button" onClick={load}>
              Hent sendestatus
            </button>
          </>
        ) : sent ? (
          <div className="bolig-quality-notice">
            <strong>E-posttjenesten har tatt imot bekreftelsen</strong>
            <p>
              Mottaker: {prepared?.snapshot?.to}. Dette er kvittering for
              utsending, ikke bekreftelse på at mottakeren har lest e-posten.
            </p>
            <button type="button" onClick={onClose}>
              Tilbake til dokumentasjonen
            </button>
          </div>
        ) : prepared ? (
          <>
            <div className="bolig-quality-notice">
              <strong>Kontroller før sending</strong>
              <p>
                Til: <b>{prepared.snapshot.to}</b>
                <br />
                Fra: {prepared.snapshot.company.companyName}
              </p>
              <p>
                E-posten inneholder bekreftelsen og merknadene nedenfor.
                Originalprotokoll og vedlegg sendes ikke.
              </p>
            </div>
            <article className="bolig-quality-mail-preview">
              <h3>Bekreftelse på retting</h3>
              <p>
                {prepared.snapshot.project} · {prepared.snapshot.scope}
              </p>
              <h4>{prepared.snapshot.protocol.title}</h4>
              <p>Original: {prepared.snapshot.original?.name}</p>
              <p>{prepared.snapshot.protocol.confirmation.note}</p>
              <p>
                {prepared.snapshot.protocol.confirmation.by_name} ·{" "}
                {date(prepared.snapshot.protocol.confirmation.at)}
              </p>
              {prepared.snapshot.protocol.remarks.map((r, i) => (
                <div key={r.id}>
                  <strong>
                    {i + 1}. {r.text}
                  </strong>
                  <p>Retting: {r.evidence}</p>
                </div>
              ))}
              {!prepared.snapshot.protocol.remarks.length && (
                <p>{prepared.snapshot.protocol.no_remarks}</p>
              )}
              <p>
                Dette dokumenterer avsenderens bekreftelse på retting. Det er
                ikke en ny overtagelsesprotokoll eller kontrollørens signatur.
              </p>
            </article>
            {attempted && (
              <p>
                Ved uavklart status brukes samme sendings-ID på nytt. Mottaker
                og innhold beholdes for å unngå dobbel utsending.
              </p>
            )}
            <div className="bolig-quality-actions">
              {!attempted && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setPrepared(null)}
                >
                  Endre mottaker
                </button>
              )}
              <button type="button" disabled={busy} onClick={send}>
                {busy
                  ? "Sender …"
                  : attempted
                    ? "Prøv samme sending igjen"
                    : "Send bekreftelse"}
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={prepare}>
            <p>
              Velg én mottaker. Du får se mottaker og innhold før e-posten
              sendes.
            </p>
            <label>
              E-postmottaker
              <input
                type="email"
                required
                maxLength={254}
                value={to}
                onChange={(e) => {
                  setTo(e.target.value);
                  if (!writeBoligDraft(key, { to: e.target.value }))
                    setError(
                      "Mottakeren kunne ikke sikres lokalt. Behold vinduet åpent.",
                    );
                }}
              />
            </label>
            <button type="submit" disabled={busy}>
              {busy ? "Klargjør …" : "Se over e-post"}
            </button>
          </form>
        )}
        {ready && error && <p role="alert">{error}</p>}
        {history.length > 0 && (
          <details>
            <summary>
              Tidligere klargjøring og utsending · {history.length}
            </summary>
            {history.map((m) => (
              <p key={m.id}>
                {m.recipient} ·{" "}
                {m.sent_at
                  ? "Tatt imot for utsending " + date(m.sent_at)
                  : m.begun_at
                    ? "Sendestatus må avklares"
                    : "Klargjort, ikke sendt"}{" "}
                · {date(m.created_at)}
              </p>
            ))}
          </details>
        )}
      </div>
    </Dialog>
  );
}
