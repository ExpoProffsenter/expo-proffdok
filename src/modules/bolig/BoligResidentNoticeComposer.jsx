import React, { useEffect, useRef, useState } from "react";
import Dialog from "./BoligEditorDialog.jsx";
import {
  boligDraftKey,
  readBoligDraft,
  writeBoligDraft,
} from "./boligClient.js";
import {
  progressRpc,
  progressDate,
  localToday,
  PROGRESS_EVENT,
} from "./boligProgressClient.js";
import {
  residentNoticeProfile,
  downloadResidentNotice,
} from "./boligResidentNoticePdf.mjs";
import "./boligNotice.css";
export default function BoligResidentNoticeComposer({
  context,
  root,
  unit,
  data,
  source,
  onClose,
  onSaved,
}) {
  const scope = `${context.user_id}/${context.company_id}/${context.role}/${context.enabled}/${root.id}/${unit?.id || "all"}`;
  const key = boligDraftKey(
    context,
    root.id,
    `resident-notice-${unit?.id || "all"}-${source?.group_id || source?.task_id || source?.id || "new"}`,
  );
  const contactKey = boligDraftKey(context, root.id, "notice-print-contact");
  const projectContact = () =>
    readBoligDraft(contactKey, { name: "", phone: "", email: "" });
  const initial = () => {
    if (source) {
      const t = data.tasks.find(
        (t) => t.id === (source.source_task_id || source.task_id),
      );
      return readBoligDraft(key, {
        id: crypto.randomUUID(),
        replaces: source.group_id || null,
        saved:
          source.group_id && source.current
            ? {
                mode: source.digital
                  ? "publish"
                  : source.paper_ready
                    ? "paper"
                    : "draft",
                notices: data.notices.filter(
                  (n) => n.group_id === source.group_id && !n.withdrawn,
                ),
              }
            : null,
        source_task_id: source.source_task_id || source.task_id || null,
        source_task_revision: t?.revision,
        title: source.title || t?.title || "",
        body: source.body || "",
        start:
          (!source.current && t?.planned_start) ||
          source.planned_start ||
          t?.planned_start ||
          localToday(),
        end:
          (!source.current && t?.planned_end) ||
          source.planned_end ||
          t?.planned_end ||
          localToday(),
        publish_on: localToday(),
        audience: "units",
        unit_ids: source.group_id
          ? data.notices
              .filter((n) => n.group_id === source.group_id && !n.withdrawn)
              .map((n) => n.unit_id)
          : [source.unit_id || t?.unit_id || unit?.id].filter(Boolean),
        contact: source.project_contact || projectContact(),
      });
    }
    return readBoligDraft(key, {
      id: crypto.randomUUID(),
      title: "",
      body: "",
      start: localToday(),
      end: localToday(),
      publish_on: localToday(),
      audience: unit ? "units" : "project",
      unit_ids: unit ? [unit.id] : data.units.map((u) => u.id),
      contact: projectContact(),
    });
  };
  const [draft, setDraft] = useState(initial),
    [contactOpen, setContactOpen] = useState(() => !draft.contact.name),
    [state, setState] = useState(data),
    [profile, setProfile] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [success, setSuccess] = useState(""),
    [revoked, setRevoked] = useState(false);
  const alive = useRef(true),
    current = useRef(scope),
    latest = useRef(draft),
    operating = useRef(false);
  current.current = scope;
  latest.current = draft;
  const valid = () =>
    alive.current &&
    current.current === scope &&
    context.enabled &&
    context.role === "manager" &&
    !root.archived;
  const persist = (next) => {
    if (!writeBoligDraft(key, next))
      throw Error("Kladden kunne ikke sikres lokalt. Behold vinduet åpent.");
    latest.current = next;
    setDraft(next);
  };
  const patch = (fields) => {
    try {
      if (fields.contact && !writeBoligDraft(contactKey, fields.contact))
        throw Error("Prosjektkontakten kunne ikke sikres lokalt.");
      persist({
        ...latest.current,
        ...fields,
        id: latest.current.saved ? crypto.randomUUID() : latest.current.id,
        saved: null,
      });
      setSuccess("");
    } catch (e) {
      setError(e.message);
    }
  };
  useEffect(() => {
    alive.current = true;
    residentNoticeProfile(context)
      .then((p) => {
        if (valid()) {
          setProfile(p);
          const d = latest.current;
          if (!d.contact.phone && !d.contact.email && !d.pending)
            persist({
              ...d,
              contact: {
                ...d.contact,
                phone: p.phone || "",
                email: p.email || "",
              },
            });
        }
      })
      .catch((e) => {
        if (valid()) setError(e.message);
      });
    return () => {
      alive.current = false;
    };
  }, []);
  useEffect(() => {
    if (!operating.current) setState(data);
  }, [data]);
  const selected = state.units.filter((u) => draft.unit_ids.includes(u.id));
  const missing = selected.filter(
    (u) =>
      !u.contact_name?.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(u.contact_email || ""),
  );
  const blocks = [...new Map(state.units.map((u) => [u.block_id, u])).values()];
  const entrances = [
    ...new Map(state.units.map((u) => [u.entrance_id, u])).values(),
  ];
  const audienceLabel =
    draft.audience === "project"
      ? "Hele prosjektet"
      : draft.audience === "block"
        ? blocks.find((u) => u.block_id === draft.group)?.block_name ||
          "Velg bygg"
        : draft.audience === "entrance"
          ? entrances.find((u) => u.entrance_id === draft.group)?.address ||
            "Velg oppgang"
          : selected.length === 1
            ? `${selected[0].address || ""} · ${selected[0].number}`
            : `${selected.length} valgte boliger`;
  const choose = (audience, group = "") =>
    patch({
      audience,
      group,
      unit_ids:
        audience === "project"
          ? state.units.map((u) => u.id)
          : audience === "block"
            ? state.units.filter((u) => u.block_id === group).map((u) => u.id)
            : audience === "entrance"
              ? state.units
                  .filter((u) => u.entrance_id === group)
                  .map((u) => u.id)
              : unit
                ? [unit.id]
                : [],
    });
  const submit = async (mode, retry = false) => {
    if (operating.current || !valid()) return;
    operating.current = true;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      let attempt = latest.current.pending;
      if (
        !retry &&
        mode === "paper" &&
        ["paper", "publish"].includes(latest.current.saved?.mode)
      ) {
        const saved = latest.current.saved.notices;
        await downloadResidentNotice({
          context,
          root,
          unit,
          notice: saved[0],
          notices: saved,
          contact: latest.current.contact,
          isCurrent: valid,
        });
        return;
      }
      if (!retry) {
        if (attempt)
          throw Error("Prøv samme handling igjen før du endrer varselet.");
        if (!selected.length) throw Error("Velg minst én bolig.");
        attempt = {
          ...latest.current,
          mode,
          audience_label: audienceLabel,
          revision: state.revision,
          request_id: crypto.randomUUID(),
          recipient_basis: Object.fromEntries(
            selected.map((u) => [u.id, u.notice_basis]),
          ),
        };
        delete attempt.saved;
        delete attempt.pending;
        persist({ ...latest.current, pending: attempt });
      }
      const next = await progressRpc(
        context,
        root.id,
        unit?.id,
        "resident_notice",
        attempt,
      );
      if (!valid()) return;
      const saved = next.notices.filter(
        (n) => n.group_id === attempt.id && !n.withdrawn,
      );
      persist({
        ...latest.current,
        pending: null,
        saved: { mode: attempt.mode, notices: saved },
        replaces: attempt.id,
        id: crypto.randomUUID(),
      });
      setState(next);
      onSaved(next);
      setSuccess(
        attempt.mode === "publish"
          ? attempt.publish_on > localToday()
            ? "Varslet er planlagt for publisering."
            : "Varslet er publisert i de valgte beboerportalene. E-post følger utsendingsstatusen."
          : attempt.mode === "paper"
            ? "Ferdig PDF/oppslag er klart. Ingen digital utsending er bestilt."
            : "Utkastet er lagret. Fortsett her når du vil.",
      );
      window.dispatchEvent(new Event(PROGRESS_EVENT));
      if (attempt.mode === "paper")
        await downloadResidentNotice({
          context,
          root,
          unit,
          notice: saved[0],
          notices: saved,
          contact: attempt.contact,
          isCurrent: valid,
        });
    } catch (e) {
      if (valid()) {
        setError(e.message);
        if (["22023", "42501", "PT409"].includes(e.code)) {
          persist({ ...latest.current, pending: null });
          if (e.code === "42501") {
            setRevoked(true);
          } else {
            const fresh = await progressRpc(context, root.id, unit?.id);
            if (valid()) {
              setState(fresh);
              onSaved(fresh);
            }
          }
        }
      }
    } finally {
      operating.current = false;
      if (valid()) setBusy(false);
    }
  };
  const disabled = busy || !!draft.pending;
  if (revoked)
    return (
      <Dialog title="Tilgangen er endret" onClose={onClose}>
        <p role="alert">Du har ikke lenger tilgang til dette arbeidsområdet.</p>
      </Dialog>
    );
  return (
    <Dialog
      title={source?.group_id ? "Beboervarsel" : "Nytt beboervarsel"}
      busy={busy}
      onClose={onClose}
      className="bolig-notice-composer"
    >
      <p className="bolig-notice-intro">
        Velg hvem varslet gjelder, skriv meldingen og se resultatet. Lagre
        utkast, lag PDF/oppslag eller publiser direkte her.
      </p>
      {error && (
        <p role="alert" className="bolig-error">
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="bolig-notice">
          {success}
        </p>
      )}
      {draft.pending && (
        <p role="status">
          Handlingen er ikke bekreftet.{" "}
          <button disabled={busy} onClick={() => submit(null, true)}>
            Prøv samme handling igjen
          </button>
        </p>
      )}
      {draft.source_task_id &&
        state.tasks.find((t) => t.id === draft.source_task_id)?.revision !==
          draft.source_task_revision && (
          <p role="status">
            Aktiviteten er endret.{" "}
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                const t = state.tasks.find(
                  (t) => t.id === draft.source_task_id,
                );
                if (t)
                  patch({
                    source_task_revision: t.revision,
                    start: t.planned_start,
                    end: t.planned_end,
                  });
              }}
            >
              Hent siste aktivitetsdatoer
            </button>
          </p>
        )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(e.nativeEvent.submitter?.value || "draft");
        }}
      >
        <div className="bolig-notice-layout">
          <fieldset disabled={disabled} className="bolig-notice-fields">
            <label>
              Hvem gjelder varslet?
              <select
                value={draft.audience}
                disabled={!!unit}
                onChange={(e) => choose(e.target.value)}
              >
                <option value="project">Hele prosjektet</option>
                <option value="block">Et helt bygg</option>
                <option value="entrance">En hel oppgang</option>
                <option value="units">Velg boliger</option>
              </select>
            </label>
            {draft.audience === "block" && (
              <label>
                Bygg
                <select
                  aria-label="Bygg"
                  required
                  value={draft.group || ""}
                  onChange={(e) => choose("block", e.target.value)}
                >
                  <option value="">Velg bygg</option>
                  {blocks.map((u) => (
                    <option key={u.block_id} value={u.block_id}>
                      {u.block_name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {draft.audience === "entrance" && (
              <label>
                Oppgang
                <select
                  aria-label="Oppgang"
                  required
                  value={draft.group || ""}
                  onChange={(e) => choose("entrance", e.target.value)}
                >
                  <option value="">Velg oppgang</option>
                  {entrances.map((u) => (
                    <option key={u.entrance_id} value={u.entrance_id}>
                      {u.block_name} · {u.address}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <details
              className="bolig-notice-recipients"
              open={draft.audience === "units"}
            >
              <summary>
                {selected.length} {selected.length === 1 ? "bolig" : "boliger"}{" "}
                valgt · se utvalget
              </summary>
              <div>
                {state.units
                  .filter((u) => !unit || u.id === unit.id)
                  .map((u) => (
                    <label key={u.id}>
                      <input
                        type="checkbox"
                        checked={draft.unit_ids.includes(u.id)}
                        disabled={draft.audience !== "units" || !!unit}
                        onChange={(e) =>
                          patch({
                            unit_ids: e.target.checked
                              ? [...draft.unit_ids, u.id]
                              : draft.unit_ids.filter((id) => id !== u.id),
                          })
                        }
                      />
                      <span>
                        {u.block_name} · {u.address} · {u.number}
                        <small>
                          {u.contact_name || "Beboer mangler"} ·{" "}
                          {u.contact_email || "E-post mangler"}
                        </small>
                      </span>
                    </label>
                  ))}
              </div>
            </details>
            <label>
              Overskrift
              <input
                required
                minLength={2}
                maxLength={120}
                value={draft.title}
                onChange={(e) => patch({ title: e.target.value })}
                placeholder="For eksempel: Vannet stenges tirsdag"
              />
            </label>
            <label>
              Melding til beboerne
              <textarea
                required
                minLength={3}
                maxLength={2000}
                rows={6}
                value={draft.body}
                onChange={(e) => patch({ body: e.target.value })}
                placeholder="Hva skal skje, når skjer det og hva må beboerne gjøre?"
              />
            </label>
            <div className="bolig-notice-dates">
              <label>
                Fra dato
                <input
                  required
                  type="date"
                  value={draft.start}
                  onChange={(e) => patch({ start: e.target.value })}
                />
              </label>
              <label>
                Til dato
                <input
                  required
                  type="date"
                  min={draft.start}
                  value={draft.end}
                  onChange={(e) => patch({ end: e.target.value })}
                />
              </label>
            </div>
            <details
              open={contactOpen}
              onToggle={(e) => setContactOpen(e.currentTarget.open)}
            >
              <summary>Kontaktperson på varslet</summary>
              {[
                ["name", "Kontaktperson i prosjektet"],
                ["phone", "Telefon"],
                ["email", "E-post til prosjektet"],
              ].map(([field, label]) => (
                <label key={field}>
                  {label}
                  <input
                    type={
                      field === "email"
                        ? "email"
                        : field === "phone"
                          ? "tel"
                          : "text"
                    }
                    maxLength={
                      field === "email" ? 254 : field === "phone" ? 40 : 120
                    }
                    value={draft.contact[field]}
                    onChange={(e) =>
                      patch({
                        contact: { ...draft.contact, [field]: e.target.value },
                      })
                    }
                  />
                </label>
              ))}
            </details>
            <label>
              Dato for publisering i beboerportalen
              <input
                required
                type="date"
                value={draft.publish_on}
                onChange={(e) => patch({ publish_on: e.target.value })}
              />
            </label>
          </fieldset>
          <aside
            className="bolig-notice-preview"
            aria-label="Forhåndsvisning av beboervarsel"
          >
            <header>
              {profile?.logoUrl && (
                <img
                  src={profile.logoUrl}
                  alt={`${profile.companyName} logo`}
                />
              )}
              <strong>{profile?.companyName || "Henter firmaprofil …"}</strong>
              <small>INFORMASJON TIL BEBOERNE</small>
            </header>
            <div>
              <small>FORHÅNDSVISNING</small>
              <h2>{draft.title || "Overskrift på varslet"}</h2>
              <p className="bolig-notice-audience">
                {root.title}
                <br />
                {audienceLabel}
              </p>
              <p className="bolig-notice-period">
                {progressDate(draft.start)} – {progressDate(draft.end)}
              </p>
              <p className="bolig-notice-body">
                {draft.body || "Meldingen din vises her."}
              </p>
              <footer>
                <strong>Spørsmål? Ta kontakt</strong>
                <p>
                  {draft.contact.name || "Fyll inn prosjektets kontaktperson"}
                  <br />
                  {[draft.contact.phone, draft.contact.email]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </footer>
            </div>
          </aside>
        </div>
        <div className="bolig-notice-send-info">
          <strong>
            {selected.length} boliger · {selected.length - missing.length} med
            beboernavn og e-post
          </strong>
          <p>
            PDF/oppslag viser utvalget og prosjektkontakten. Beboernes navn og
            e-post tas ikke med.
          </p>
          {missing.length > 0 && (
            <p>
              Digital publisering krever beboernavn og e-post i {missing.length}{" "}
              boliger. Du kan lage PDF/oppslag for hele utvalget.
            </p>
          )}
          {!state.mail_enabled && (
            <p>
              E-post og automatisk publisering er satt på pause i testmiljøet.
              Du kan publisere med dagens dato i beboerportalen.
            </p>
          )}
          <p>
            «Publiser til beboerne» publiserer og bestiller e-post når utsending
            er aktivert. Se over meldingen og publiser når den er klar.
          </p>
        </div>
        <footer className="bolig-notice-actions">
          <button type="button" disabled={busy} onClick={onClose}>
            Lukk og behold utkast
          </button>
          <button
            type="submit"
            value="draft"
            disabled={disabled || !selected.length}
          >
            Lagre utkast
          </button>
          <button
            type="submit"
            value="paper"
            disabled={disabled || !selected.length || !profile}
          >
            Last ned PDF / oppslag
          </button>
          <button
            type="submit"
            value="publish"
            className="primary"
            disabled={
              disabled ||
              !selected.length ||
              missing.length > 0 ||
              !profile ||
              draft.saved?.mode === "publish"
            }
          >
            Publiser til beboerne
          </button>
        </footer>
      </form>
    </Dialog>
  );
}
