import React, { useEffect, useRef, useState } from "react";
import Dialog from "./BoligEditorDialog.jsx";
import {
  boligDraftKey,
  readBoligDraft,
  writeBoligDraft,
} from "./boligClient.js";
import { downloadResidentNotice } from "./boligResidentNoticePdf.mjs";
export default function BoligNoticePrint({
  context,
  root,
  unit,
  notice,
  onClose,
}) {
  const scope = `${context.user_id}/${context.company_id}/${context.role}/${context.enabled}/${root.id}/${unit?.id || "all"}`;
  const key = boligDraftKey(context, root.id, "notice-print-contact");
  const current = useRef(scope),
    alive = useRef(true);
  current.current = scope;
  const [contact, setContact] = useState(() =>
      readBoligDraft(key, { name: "", phone: "", email: "" }),
    ),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  const valid = () =>
    alive.current &&
    current.current === scope &&
    context.enabled &&
    context.role === "manager";
  const patch = (field, value) => {
    const next = { ...contact, [field]: value };
    if (!writeBoligDraft(key, next))
      setError("Kontaktkladden kunne ikke sikres lokalt.");
    setContact(next);
  };
  return (
    <Dialog
      title="Beboervarsel som PDF / oppslag"
      busy={busy}
      onClose={onClose}
      className="bolig-progress-editor"
    >
      <p>
        PDF-en viser bolig, adresse, arbeid og datoer. Legg til prosjektets
        kontaktperson. Beboerens navn og e-post tas ikke med automatisk.
      </p>
      <p>
        Les varselteksten før du henger den opp på et fellesområde. Teksten du
        har skrevet, følger med i PDF-en.
      </p>
      {!notice.valid && (
        <p role="status">
          Dette er et utkast. PDF-en merkes «UTKAST» frem til varselet er
          godkjent.
        </p>
      )}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (busy || !valid()) return;
          setBusy(true);
          setError("");
          try {
            await downloadResidentNotice({
              context,
              root,
              unit,
              notice,
              contact,
              isCurrent: valid,
            });
          } catch (err) {
            if (valid()) setError(err.message);
          } finally {
            if (valid()) setBusy(false);
          }
        }}
      >
        <fieldset disabled={busy}>
          <label>
            Kontaktperson i prosjektet
            <input
              required
              minLength={2}
              maxLength={120}
              value={contact.name}
              onChange={(e) => patch("name", e.target.value)}
            />
          </label>
          <label>
            Telefon
            <input
              type="tel"
              maxLength={40}
              value={contact.phone}
              onChange={(e) => patch("phone", e.target.value)}
            />
          </label>
          <label>
            E-post til prosjektet
            <input
              type="email"
              maxLength={254}
              value={contact.email}
              onChange={(e) => patch("email", e.target.value)}
            />
          </label>
          <button type="submit" disabled={!notice.current}>
            Last ned PDF / oppslag
          </button>
        </fieldset>
      </form>
      {error && <p role="alert">{error}</p>}
    </Dialog>
  );
}
