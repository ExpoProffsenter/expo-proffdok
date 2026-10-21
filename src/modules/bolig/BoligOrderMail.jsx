import React, { useRef, useState } from "react";
import {
  prepareOrderMail,
  sendOrderMail,
  inspectOrderMail,
} from "./boligDeliveryClient.js";
import {
  boligDraftKey,
  readBoligDraft,
  writeBoligDraft,
  clearBoligDraft,
} from "./boligClient.js";
import { boligOrderAttachments } from "../../../supabase/functions/_shared/bolig-order-attachments.mjs";
import { boligOrderMail } from "../../../supabase/functions/_shared/bolig-order-email.mjs";
import { downloadCordelFile } from "../cordel/cordelFiles.mjs";

export default function BoligOrderMail({
  context,
  root,
  unit,
  order,
  revision,
  onSent,
  onBusy,
}) {
  const key = boligDraftKey(context, root.id, "mail-" + order.id);
  const [value, setValue] = useState(() =>
    readBoligDraft(key, {
      to: "",
      fag: order.snapshot.goods.map((g) => g.supplier_name || ""),
      preview: null,
      sending: false,
    }),
  );
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [done, setDone] = useState(false);
  const operation = useRef(false),
    live = useRef(true),
    latest = useRef(value);
  latest.current = value;
  React.useEffect(() => {
    live.current = true;
    return () => {
      live.current = false;
    };
  }, []);
  const change = (next) => {
    const v = { ...latest.current, ...next };
    if (!writeBoligDraft(key, v)) {
      setError("Kladden kunne ikke sikres lokalt. Behold siden åpen.");
      return false;
    }
    latest.current = v;
    setValue(v);
    return true;
  };
  const work = async (fn) => {
    if (operation.current) return;
    operation.current = true;
    setBusy(true);
    onBusy(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      if (live.current) setError(e.message);
    } finally {
      operation.current = false;
      if (live.current) {
        setBusy(false);
        onBusy(false);
      }
    }
  };
  const review = async (e) => {
    e.preventDefault();
    await work(async () => {
      const input = {
        order_id: order.id,
        to: value.to,
        fag: value.fag,
        revision,
        request_id: value.request_id || crypto.randomUUID(),
      };
      if (!change({ request_id: input.request_id })) return;
      const preview = await prepareOrderMail(context, root.id, unit.id, input);
      boligOrderAttachments(preview.snapshot); // Validate both attachments before any send claim.
      if (live.current) change({ preview, sending: false });
    });
  };
  const send = () =>
    work(async () => {
      if (!change({ sending: true })) return;
      const response = await sendOrderMail(
        context,
        root.id,
        unit.id,
        value.preview.id,
      );
      if (response) {
        clearBoligDraft(key);
        if (live.current) {
          setDone(true);
          onSent();
        }
      }
    });
  React.useEffect(() => {
    if (!order.mail_request_id || value.preview?.id === order.mail_request_id)
      return;
    work(async () => {
      const recovered = await inspectOrderMail(
        context,
        root.id,
        unit.id,
        order.mail_request_id,
      );
      if (live.current)
        change({ preview: recovered, sending: true, request_id: recovered.id });
    });
  }, [order.mail_request_id]);
  const preview = value.preview;
  if (done)
    return (
      <p role="status">
        E-posttjenesten har bekreftet sendingen. Bestillingen er registrert som
        Bestilt.
      </p>
    );
  return (
    <div className="bolig-delivery-dialog bolig-mail-editor">
      {error && <p role="alert">{error}</p>}
      {preview ? (
        <>
          <div className="bolig-mail-recipient">
            <small>Sendes til</small>
            <strong>
              {preview.snapshot.supplier} · {preview.snapshot.to}
            </strong>
            <small>Ordrebekreftelse til {preview.snapshot.replyTo}</small>
          </div>
          <div className="bolig-delivery-actions">
            {boligOrderAttachments(preview.snapshot).map((a) => (
              <button
                type="button"
                key={a.filename}
                disabled={busy}
                onClick={() => downloadCordelFile(a.filename, a.bytes, a.mime)}
              >
                Last ned{" "}
                {a.filename.endsWith(".xlsx")
                  ? "Excel-vedlegg"
                  : "Cordel-vedlegg"}
              </button>
            ))}
          </div>
          <iframe
            title="Forhåndsvisning av bestillingsmail"
            sandbox=""
            srcDoc={boligOrderMail(preview.snapshot).html}
            className="bolig-mail-preview"
          />
          {value.sending ? (
            <p role="status">
              Dette sendeforsøket må avklares før du kan endre mottaker eller
              innhold. Bruk samme sending igjen.
            </p>
          ) : (
            <p>
              Kontroller mottaker, leilighet, levering og begge vedleggene før
              du sender.
            </p>
          )}
          <div className="bolig-delivery-actions">
            <button
              type="button"
              className="bolig-primary"
              disabled={busy}
              onClick={send}
            >
              {busy
                ? "Behandler sending …"
                : value.sending
                  ? "Prøv samme sending igjen"
                  : "Send bestilling med to vedlegg"}
            </button>
            {!value.sending && (
              <button
                type="button"
                disabled={busy}
                onClick={() => change({ preview: null, request_id: null })}
              >
                Endre mottaker og fagområde
              </button>
            )}
          </div>
        </>
      ) : (
        <form
          onSubmit={review}
          onInvalidCapture={(e) => {
            let node = e.target.parentElement;
            while (node && node !== e.currentTarget) {
              if (node.tagName === "DETAILS") node.open = true;
              node = node.parentElement;
            }
          }}
        >
          <fieldset disabled={busy}>
            <p>
              Oppgi leverandørens e-postadresse. Kontroller leverandør/fagområde
              slik det er registrert i mottakerens Cordel-prisbok. Varenummer og
              antall følger det lagrede grunnlaget.
            </p>
            <label>
              Leverandørens e-postadresse
              <input
                required
                type="email"
                maxLength={254}
                value={value.to}
                onChange={(e) =>
                  change({ to: e.target.value, request_id: null })
                }
              />
            </label>
            <label>
              Felles leverandør/fagområde (valgfritt)
              <input
                aria-label="Felles leverandør/fagområde (valgfritt)"
                maxLength={160}
                value={value.common_fag || ""}
                onChange={(e) => change({ common_fag: e.target.value })}
              />
            </label>
            <button
              type="button"
              disabled={!value.common_fag?.trim()}
              onClick={() =>
                change({
                  fag: order.snapshot.goods.map(() => value.common_fag.trim()),
                  request_id: null,
                })
              }
            >
              Bruk fagområdet på alle varer
            </button>
            <details open={value.fag.some((f) => !f)}>
              <summary>
                Cordel-felt · {order.snapshot.goods.length} varelinjer
              </summary>
              {order.snapshot.goods.map((g, i) => (
                <label className="bolig-mail-fag" key={i}>
                  <span>
                    {g.name}
                    <small>
                      {g.sku} · {g.quantity} {g.unit}
                    </small>
                  </span>
                  <input
                    required
                    aria-label={`Leverandør/fagområde: ${g.name}`}
                    maxLength={160}
                    value={value.fag[i] || ""}
                    onChange={(e) =>
                      change({
                        fag: value.fag.map((x, n) =>
                          n === i ? e.target.value : x,
                        ),
                        request_id: null,
                      })
                    }
                  />
                </label>
              ))}
            </details>
            <p>
              Vedlegg: Cordel ASCII (.txt) og Excel (.xlsx). Begge inneholder
              bare varene i denne bestillingen.
            </p>
            <button type="submit" className="bolig-primary">
              Forhåndsvis e-post og vedlegg
            </button>
          </fieldset>
        </form>
      )}
    </div>
  );
}
