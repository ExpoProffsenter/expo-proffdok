import React, { useEffect, useState } from "react";
import { Mail, CheckCircle2 } from "lucide-react";
import {
  useLivePartner,
  partnerDate,
  readPartnerDraft,
  storePartnerDraft,
} from "./boligPartnerClient.js";
import {
  residentMailRpc,
  residentMailToken,
  sendResidentInvitation,
} from "./boligResidentMailClient.js";
import "./boligPartners.css";
import { residentLinkMail } from "../../../supabase/functions/_shared/bolig-resident-link-email.mjs";
import { acceptanceDeadline } from "./boligCommerceCore.js";
export default function ResidentInvitation({
  context,
  root,
  unit,
  targetId,
  kind,
  basis,
  link,
  disabled = false,
  onBusy,
  onSent,
}) {
  const key = `expo.bolig-resident-mail.v1:${context.user_id}:${context.company_id}:${root.id}:${unit.id}:${targetId}:${kind}`;
  const [pending, setPending] = useState(() => readPartnerDraft(key, null));
  const [localError, setLocalError] = useState("");
  const [notice, setNotice] = useState("");
  const [previewOpen, setPreviewOpen] = useState(() =>
    readPartnerDraft(key + ":preview", false),
  );
  const { data, busy, refreshing, error, load, run } = useLivePartner(
    `${key}:${basis}:${context.role}:${context.enabled}:${link}`,
    () =>
      residentMailRpc(
        context,
        root.id,
        unit.id,
        targetId,
        kind,
        residentMailToken(link, kind),
      ),
  );
  useEffect(() => {
    onBusy(busy);
    return () => onBusy(false);
  }, [busy, onBusy]);
  const token = residentMailToken(link, kind);
  const save = (value) => {
    try {
      storePartnerDraft(key, value);
      setPending(value);
      return true;
    } catch {
      setLocalError(
        "Sendingsforsøket kunne ikke sikres. Behold vinduet åpent.",
      );
      return false;
    }
  };
  // Recover only from fresh server state. A stale, never-started request can
  // safely be replaced after a monotonic publication revision change: begin rejects
  // that old revision forever. A begun request always needs reconciliation.
  useEffect(() => {
    if (!data || !pending) return;
    const record = data.history.find((item) => item.id === pending.id);
    if (record?.sent_at && record.own) {
      if (save(null)) {
        setLocalError("");
        setNotice("E-posttjenesten har bekreftet sendingen.");
        onSent?.();
      }
    } else if (data.revision !== pending.revision && !record?.begun_at) {
      if (save(null)) {
        setLocalError("");
        setNotice(
          "Lenkegrunnlaget er endret. Se over mottaker og innhold før du sender.",
        );
      }
    }
  }, [data, pending]);
  const send = () => {
    if (!data || disabled || busy || !token || !data.enabled) return;
    const attempt = pending || {
      id: crypto.randomUUID(),
      revision: data.revision,
      to: data.snapshot.to,
    };
    if (!save(attempt)) return;
    setLocalError("");
    run(
      async () => {
        await sendResidentInvitation(
          context,
          root.id,
          unit.id,
          targetId,
          kind,
          attempt,
          token,
        );
        return residentMailRpc(
          context,
          root.id,
          unit.id,
          targetId,
          kind,
          residentMailToken(link, kind),
        );
      },
      () => {
        if (save(null)) {
          setLocalError("");
          setNotice("E-posttjenesten har bekreftet sendingen.");
          onSent?.();
        }
      },
      (err) => {
        setLocalError(err.message);
        // Preserve the same ID even on definite failure. An earlier request may
        // already have reached the provider; inspect/retry must resolve it first.
        if (err.code === "PT409" || err.code === "42501") load();
      },
    );
  };
  let preview = null;
  if (data && token) preview = residentLinkMail(data.snapshot, token);
  const sent = data?.history.filter((item) => item.sent_at) || [];
  const unresolved = data?.history.find(
    (item) => item.begun_at && !item.sent_at,
  );
  return (
    <section className="bolig-partner-invitation" aria-label="Send beboerlenke">
      <h3>
        <Mail size={20} /> E-post til beboeren
      </h3>
      {(error || localError) && <p role="alert">{localError || error}</p>}
      {notice && (
        <p role="status">
          <CheckCircle2 size={18} /> {notice}
        </p>
      )}
      {!data ? (
        <p>Kontrollerer mottaker og sendingsstatus …</p>
      ) : (
        <>
          <p className="bolig-partner-mail-recipient">
            <small>Mottaker</small>
            <strong>
              {data.snapshot.name} · Bolig {data.snapshot.unit}
            </strong>
            <span>{data.snapshot.to}</span>
          </p>
          <p>
            {data.snapshot.company.companyName} sender lenken til denne
            kontakten. {kind === "agreement" ? <>Svarfristen er {acceptanceDeadline(data.snapshot.expires_at)} (norsk tid).</> : <>Tilgangen gjelder til {partnerDate(data.snapshot.expires_at)}.</>}
          </p>
          {preview && (
            <details
              open={previewOpen}
              onToggle={(e) => {
                const next = e.currentTarget.open;
                setPreviewOpen(next);
                try {
                  storePartnerDraft(key + ":preview", next);
                } catch {
                  /* Only a display choice. */
                }
              }}
            >
              <summary>Forhåndsvis e-post</summary>
              <p>
                <b>Emne:</b> {preview.subject}
              </p>
              <iframe
                data-bolig-preview="mail"
                title="Forhåndsvisning av beboer-e-post"
                sandbox=""
                referrerPolicy="no-referrer"
                srcDoc={preview.html}
              />
            </details>
          )}
          {!data.enabled && (
            <p className="bolig-partner-mail-paused">
              E-postutsending er pauset i dette testmiljøet. Du kan se
              forhåndsvisningen og dele lenken manuelt.
            </p>
          )}
          {!token && (
            <p>
              For å sende trenger du nettleseren der tilgangslenken ble
              opprettet.
            </p>
          )}
          {pending && (
            <p>
              Et sendingsforsøk venter på kvittering. Prøv samme sending igjen.
            </p>
          )}
          {unresolved && unresolved.id !== pending?.id && (
            <p>
              En tidligere sending er uavklart. Fortsett den fra nettleseren der
              den ble startet.
            </p>
          )}
          <button
            type="button"
            className="bolig-primary"
            onClick={send}
            disabled={
              disabled ||
              !token ||
              !data.enabled ||
              busy ||
              (!!unresolved && unresolved.id !== pending?.id)
            }
          >
            <Mail size={17} />{" "}
            {disabled || refreshing
              ? "Kontrollerer …"
              : busy
                ? "Sender …"
                : pending
                  ? "Prøv samme sending igjen"
                  : sent.length
                    ? "Send lenken på nytt"
                    : "Send beboerlenke"}
          </button>
          {!!sent.length && (
            <p className="bolig-partner-mail-sent">
              Sist bekreftet av e-posttjenesten: {partnerDate(sent[0].sent_at)}{" "}
              · {sent[0].recipient}
            </p>
          )}
          {!!data.history.length && (
            <details>
              <summary>Sendingshistorikk ({data.history.length})</summary>
              {data.history.map((item) => (
                <p key={item.id}>
                  {item.recipient} ·{" "}
                  {item.sent_at
                    ? `Bekreftet av e-posttjenesten ${partnerDate(item.sent_at)}`
                    : item.begun_at
                      ? "Sendestatus uavklart"
                      : "Klargjort, ikke sendt"}
                </p>
              ))}
            </details>
          )}
        </>
      )}
    </section>
  );
}
