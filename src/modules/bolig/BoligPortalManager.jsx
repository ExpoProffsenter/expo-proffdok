import React, { useEffect, useRef, useState } from "react";
import {
  portalManagerRpc,
  portalUrl,
  invitationText,
  portalStamp,
  portalStatus,
  PORTAL_EVENT,
} from "./boligPortalClient.js";
import { newResidentToken, COMMERCE_EVENT } from "./boligCommerceClient.js";
import {
  boligDraftKey,
  readBoligDraft,
  writeBoligDraft,
} from "./boligClient.js";
import { agreementMoney as money } from "./boligCommerceCore.js";
import Dialog from "./BoligEditorDialog.jsx";
import { PACKAGE_CHOICES_EVENT } from "./boligPackageChoicesClient.js";
const initial = {
  title: "",
  current: true,
  scope_id: "common",
  option_ids: [],
  message: "",
  doc_title: "",
  doc_url: "",
  notes: {},
  url: "",
  pending: null,
};
export default function BoligPortalManager({ context, root, unit }) {
  const key = boligDraftKey(context, root.id, `portal-${unit.id}`),
    scope = `${context.user_id}/${context.company_id}/${root.id}/${unit.id}`;
  const [draft, setDraft] = useState(() => readBoligDraft(key, initial)),
    [data, setData] = useState(null),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true),
    [invite, setInvite] = useState(null),
    [reviewed, setReviewed] = useState(false);
  const latest = useRef(draft),
    alive = useRef(false),
    epoch = useRef(0),
    operating = useRef(false),
    current = useRef(null),
    currentScope = useRef(scope);
  latest.current = draft;
  current.current = data;
  currentScope.current = scope;
  const persist = (next) => {
    if (!writeBoligDraft(key, next))
      throw Error("Kladden kunne ikke sikres lokalt. Behold siden åpen.");
    latest.current = next;
    setDraft(next);
  };
  const update = (fields) => {
    try {
      persist({ ...latest.current, ...fields });
    } catch (e) {
      setError(e.message);
    }
  };
  const load = async () => {
    if (operating.current) return;
    const ticket = ++epoch.current;
    try {
      const next = await portalManagerRpc(context, root.id, unit.id);
      if (
        alive.current &&
        ticket === epoch.current &&
        currentScope.current === scope
      ) {
        setData(next);
        setError("");
      }
    } catch (e) {
      if (alive.current && ticket === epoch.current) {
        setError(e.message);
        if (e.code === "42501") {
          setData(null);
          setInvite(null);
        }
      }
    } finally {
      if (alive.current && ticket === epoch.current) setLoading(false);
    }
  };
  useEffect(() => {
    alive.current = true;
    current.current = null;
    setData(null);
    setLoading(true);
    setInvite(null);
    const saved = readBoligDraft(key, initial);
    latest.current = saved;
    setDraft(saved);
    load();
    const refresh = () => {
      if (document.visibilityState !== "hidden") load();
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      alive.current = false;
      ++epoch.current;
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [scope]);
  const writable =
    context.role === "manager" &&
    context.enabled &&
    data?.context.role === "manager" &&
    !root.archived;
  const disabled = busy || loading || !!draft.pending;
  const run = async (action, payload = {}, retry = false) => {
    if (operating.current || !writable || (!retry && latest.current.pending))
      return;
    operating.current = true;
    ++epoch.current;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const attempt = retry
        ? latest.current.pending
        : {
            action,
            payload: {
              ...payload,
              request_id: crypto.randomUUID(),
              revision: payload.revision ?? data.revision,
            },
          };
      persist({ ...latest.current, pending: attempt });
      const next = await portalManagerRpc(
        context,
        root.id,
        unit.id,
        attempt.action,
        attempt.payload,
      );
      if (!alive.current || currentScope.current !== scope) return;
      persist({
        ...latest.current,
        pending: null,
        ...(attempt.action === "publish"
          ? {
              url: portalUrl(attempt.payload.token),
              url_menu_version: next.portal.menu_version,
            }
          : {}),
        ...(attempt.action === "reply" ? { message: "" } : {}),
        ...(attempt.action === "offer" ? { title: "" } : {}),
        ...(attempt.action === "document"
          ? { doc_title: "", doc_url: "" }
          : {}),
      });
      setData(next);
      setInvite(null);
      setNotice(
        attempt.action === "publish"
          ? "Portallenken er klar. Kopier invitasjonen etter gjennomgang. Ingen e-post er sendt."
          : attempt.action === "apply"
            ? "Valget er lagret som nytt boligvalg. Klargjør og godkjenn avtalen under Endringer og beboeraksept."
            : "Endringen er lagret.",
      );
      window.dispatchEvent(new Event(PORTAL_EVENT));
      if (attempt.action === "apply") {
        window.dispatchEvent(new Event(COMMERCE_EVENT));
        window.dispatchEvent(new Event(PACKAGE_CHOICES_EVENT));
      }
    } catch (e) {
      if (alive.current && currentScope.current === scope) {
        setError(e.message);
        if (e.code) {
          try {
            persist({ ...latest.current, pending: null });
          } catch {}
          if (e.code === "42501") {
            setData(null);
            setInvite(null);
          }
        }
      }
    } finally {
      operating.current = false;
      if (alive.current && currentScope.current === scope) setBusy(false);
    }
  };
  const part = data?.components?.find((p) => p.scope_id === draft.scope_id),
    options = (data?.options || []).filter(
      (o) =>
        !o.archived &&
        (!o.replace_key ||
          part?.package?.lines.some((g) => g.key === o.replace_key)),
    );
  const openInvite = (reminder = false) => {
    setReviewed(false);
    setInvite({
      token: reminder ? null : newResidentToken(),
      reminder,
      revision: data.revision,
    });
  };
  const currentUrl =
    draft.url && draft.url_menu_version === data?.portal?.menu_version
      ? draft.url
      : "";
  const link = invite?.token ? portalUrl(invite.token) : currentUrl;
  return (
    <section
      className="bolig-commerce bolig-portal-manager"
      aria-label="Administrer beboerportal"
    >
      <div className="bolig-commerce-heading">
        <h3>Beboerportal</h3>
        <button type="button" disabled={busy || loading} onClick={load}>
          Oppdater portalstatus
        </button>
      </div>
      <p>
        Del valgmuligheter, avtaler og dokumentlenker med boligens kontakt.
        Innsendte valg går til gjennomgang før de brukes i avtalegrunnlaget.
      </p>
      {error && <p role="alert">{error}</p>}
      {notice && <p role="status">{notice}</p>}
      {loading && <p role="status">Henter portalen …</p>}
      {busy && <p role="status">Lagrer endringen …</p>}
      {draft.pending && !busy && (
        <button disabled={busy} onClick={() => run(null, {}, true)}>
          Prøv samme lagring igjen
        </button>
      )}
      {data && (
        <>
          <div className="bolig-portal-manager-status">
            <strong>{data.contact.name || "Kontakt mangler"}</strong>
            <span>
              {data.contact.email || "Lagre e-post under Leilighetsinformasjon"}
            </span>
            <small>
              {data.portal && !data.portal.revoked
                ? `Portal delt · gyldig til ${portalStamp(data.portal.expires_at)}`
                : "Portalen er ikke delt"}
            </small>
          </div>
          {writable && (
            <div className="bolig-commerce-actions">
              <button
                disabled={disabled || !data.contact.email}
                onClick={() => openInvite(false)}
              >
                {data.portal && !data.portal.revoked
                  ? "Forny portaltilgang"
                  : "Klargjør invitasjon"}
              </button>
              {currentUrl && data.portal && !data.portal.revoked && (
                <>
                  <a
                    href={currentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Åpne beboerportalen ↗
                  </a>
                  <button disabled={disabled} onClick={() => openInvite(true)}>
                    Klargjør påminnelse
                  </button>
                </>
              )}
              {data.portal && !data.portal.revoked && (
                <button disabled={disabled} onClick={() => run("revoke")}>
                  Tilbakekall portaltilgang
                </button>
              )}
            </div>
          )}
          <details open={data.portal?.revoked !== false}>
            <summary>
              Valgmuligheter · {data.portal?.offers_draft.length || 0}
            </summary>
            <p>
              Grunnpakken er inkludert. Prisen viser tilvalg inkl. mva. Lag
              komplette alternativer, og se gjennom dem før du deler en ny
              portaltilgang.
            </p>
            {(data.portal?.offers_draft || []).map((o) => (
              <article className="bolig-portal-manager-offer" key={o.id}>
                <div>
                  <strong>{o.title}</strong>
                  <small>
                    {money(o.total_cents)} inkl. mva. · {o.goods.length}{" "}
                    varelinjer
                  </small>
                  <details>
                    <summary>Se varene</summary>
                    <ul>
                      {o.goods.map((g) => (
                        <li key={g.key}>
                          {g.room_name} · {g.name} · {g.quantity} {g.unit}
                        </li>
                      ))}
                    </ul>
                  </details>
                </div>
                {writable && (
                  <button
                    disabled={disabled}
                    onClick={() => run("remove_offer", { offer_id: o.id })}
                  >
                    Fjern alternativ
                  </button>
                )}
              </article>
            ))}
            {writable && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  run("offer", {
                    title: draft.title,
                    current: draft.current,
                    choice_revision: data.choice_revision,
                    choice: part
                      ? {
                          scope_id: part.scope_id,
                          package_id: part.package.id,
                          option_ids: draft.option_ids,
                          catalog_revision: data.catalog_revision,
                          rooms_revision: data.rooms_revision,
                        }
                      : null,
                  });
                }}
              >
                <fieldset disabled={disabled || !data.choice_revision}>
                  <label>
                    Navn på valgmuligheten
                    <input
                      required
                      minLength={2}
                      maxLength={100}
                      value={draft.title}
                      onChange={(e) => update({ title: e.target.value })}
                    />
                  </label>
                  <label className="bolig-commerce-check">
                    <input
                      type="checkbox"
                      checked={draft.current}
                      onChange={(e) => update({ current: e.target.checked })}
                    />
                    Bruk boligens lagrede valg
                  </label>
                  {!draft.current && (
                    <>
                      <label>
                        Pakke som endres
                        <select
                          value={draft.scope_id}
                          onChange={(e) =>
                            update({ scope_id: e.target.value, option_ids: [] })
                          }
                        >
                          {data.components.map((p) => (
                            <option key={p.scope_id} value={p.scope_id}>
                              {p.room_name} · {p.package.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <p>
                        Resten av boligen beholdes. Kryss av alle tilvalg som
                        skal med i denne pakken.
                      </p>
                      {options.map((o) => (
                        <label className="bolig-commerce-check" key={o.id}>
                          <input
                            type="checkbox"
                            checked={draft.option_ids.includes(o.id)}
                            onChange={(e) =>
                              update({
                                option_ids: e.target.checked
                                  ? [...draft.option_ids, o.id]
                                  : draft.option_ids.filter((x) => x !== o.id),
                              })
                            }
                          />
                          {o.name}
                        </label>
                      ))}
                    </>
                  )}
                  <button type="submit" disabled={!draft.current && !part}>
                    Legg til valgmulighet
                  </button>
                </fieldset>
              </form>
            )}
          </details>
          <details
            open={(data.portal?.events || []).some(
              (e) => e.kind === "request" && e.status === "pending",
            )}
          >
            <summary>
              Innsendte valg ·{" "}
              {
                (data.portal?.events || []).filter(
                  (e) => e.kind === "request" && e.status === "pending",
                ).length
              }{" "}
              venter
            </summary>
            {(data.portal?.events || [])
              .filter((e) => e.kind === "request")
              .map((e) => (
                <article key={e.id} className="bolig-portal-review">
                  <strong>
                    {e.offer.title} · {money(e.offer.total_cents)} inkl. mva.
                  </strong>
                  <small>
                    {portalStamp(e.created_at)} · {portalStatus[e.status]}
                  </small>
                  <p>{e.body}</p>
                  <details>
                    <summary>Se innsendte varer</summary>
                    <ul>
                      {e.offer.goods.map((g) => (
                        <li key={g.key}>
                          {g.name} · {g.quantity} {g.unit}
                        </li>
                      ))}
                    </ul>
                  </details>
                  {e.review_note && <p>{e.review_note}</p>}
                  {e.status === "pending" && writable && (
                    <>
                      <label>
                        Tilbakemelding til beboeren
                        <textarea
                          minLength={3}
                          maxLength={2000}
                          value={draft.notes[e.id] || ""}
                          onChange={(ev) =>
                            update({
                              notes: {
                                ...draft.notes,
                                [e.id]: ev.target.value,
                              },
                            })
                          }
                        />
                      </label>
                      <p>
                        Bruk valget i avtalegrunnlaget før en avtale er delt
                        eller varer bestilt. Ved senere endring lager du en
                        endringsavtale i boligens avtaleområde.
                      </p>
                      <div className="bolig-commerce-actions">
                        <button
                          disabled={
                            disabled ||
                            (draft.notes[e.id] || "").trim().length < 3
                          }
                          onClick={() =>
                            run("apply", {
                              event_id: e.id,
                              note: draft.notes[e.id],
                            })
                          }
                        >
                          Bruk valget i avtalegrunnlaget
                        </button>
                        <button
                          disabled={
                            disabled ||
                            (draft.notes[e.id] || "").trim().length < 3
                          }
                          onClick={() =>
                            run("review", {
                              event_id: e.id,
                              note: draft.notes[e.id],
                            })
                          }
                        >
                          Registrer separat oppfølging
                        </button>
                      </div>
                    </>
                  )}
                </article>
              ))}
          </details>
          <details>
            <summary>
              Dokumentlenker · {data.portal?.documents.length || 0}
            </summary>
            <p>
              Legg bare til lenker som denne beboeren skal ha. Private
              prosjektfiler deles ikke automatisk.
            </p>
            {(data.portal?.documents || []).map((d) => (
              <article key={d.id} className="bolig-portal-manager-offer">
                <a href={d.url} target="_blank" rel="noopener noreferrer">
                  {d.title}
                </a>
                {writable && (
                  <button
                    disabled={disabled}
                    onClick={() =>
                      run("remove_document", { document_id: d.id })
                    }
                  >
                    Fjern dokumentlenke
                  </button>
                )}
              </article>
            ))}
            {writable && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  run("document", {
                    title: draft.doc_title,
                    url: draft.doc_url,
                  });
                }}
              >
                <fieldset disabled={disabled}>
                  <label>
                    Dokumentnavn
                    <input
                      required
                      minLength={2}
                      maxLength={160}
                      value={draft.doc_title}
                      onChange={(e) => update({ doc_title: e.target.value })}
                    />
                  </label>
                  <label>
                    Dokumentlenke
                    <input
                      required
                      type="url"
                      pattern="https://.*"
                      value={draft.doc_url}
                      onChange={(e) => update({ doc_url: e.target.value })}
                    />
                  </label>
                  <button type="submit">Del dokumentlenke</button>
                </fieldset>
              </form>
            )}
          </details>
          <details>
            <summary>
              Meldinger ·{" "}
              {
                (data.portal?.events || []).filter((e) =>
                  ["message", "reply"].includes(e.kind),
                ).length
              }
            </summary>
            <p>
              Meldinger vises i portalen. Ingen e-post sendes fra denne
              dialogen.
            </p>
            {(data.portal?.events || [])
              .filter((e) => ["message", "reply"].includes(e.kind))
              .map((e) => (
                <article className="bolig-portal-review" key={e.id}>
                  <strong>
                    {e.sender === "resident" ? "Beboer" : "Prosjektleder"}
                  </strong>
                  <small>{portalStamp(e.created_at)}</small>
                  <p>{e.body}</p>
                </article>
              ))}
            {writable && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  run("reply", { body: draft.message });
                }}
              >
                <fieldset disabled={disabled}>
                  <label>
                    Melding til beboeren
                    <textarea
                      required
                      minLength={2}
                      maxLength={2000}
                      value={draft.message}
                      onChange={(e) => update({ message: e.target.value })}
                    />
                  </label>
                  <button type="submit">Send melding i portalen</button>
                </fieldset>
              </form>
            )}
          </details>
        </>
      )}
      {invite && data && (
        <Dialog
          title={
            invite.reminder
              ? "Påminnelse til beboeren"
              : "Invitasjon til beboerportalen"
          }
          busy={busy}
          onClose={() => setInvite(null)}
        >
          {invite.revision !== data.revision && (
            <p role="alert">
              Portalgrunnlaget er endret. Lukk og klargjør invitasjonen på nytt.
            </p>
          )}
          {error && <p role="alert">{error}</p>}
          <p>
            Mottaker:{" "}
            <strong>
              {data.contact.name} · {data.contact.email}
            </strong>
          </p>
          <p>
            {invite.reminder
              ? "Kopier teksten og send den gjennom deres vanlige e-postkanal."
              : "En ny lenke er gyldig i 30 dager og erstatter tidligere portaltilgang. Gjennomgå valgmulighetene før du lager lenken."}
          </p>
          {!invite.reminder &&
            (data.portal?.offers_draft || []).map((o) => (
              <p key={o.id}>
                {o.title} · {money(o.total_cents)} inkl. mva.
              </p>
            ))}
          <label>
            Forhåndsvisning
            <textarea
              readOnly
              rows={12}
              value={invitationText(data.contact, unit, link, invite.reminder)}
            />
          </label>
          <label className="bolig-commerce-check">
            <input
              type="checkbox"
              checked={reviewed}
              onChange={(e) => setReviewed(e.target.checked)}
            />
            Jeg har kontrollert mottaker, innhold og valgmuligheter.
          </label>
          {invite.reminder ? (
            <button
              disabled={
                !reviewed || disabled || invite.revision !== data.revision
              }
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(
                    invitationText(data.contact, unit, link, true),
                  );
                  setNotice("Påminnelsen er kopiert. Ingen e-post er sendt.");
                  setInvite(null);
                } catch {
                  setError(
                    "Kunne ikke kopiere. Marker og kopier teksten i forhåndsvisningen.",
                  );
                }
              }}
            >
              Kopier påminnelsen
            </button>
          ) : (
            <button
              disabled={
                !reviewed || disabled || invite.revision !== data.revision
              }
              onClick={() =>
                run("publish", {
                  token: invite.token,
                  reviewed: true,
                  revision: invite.revision,
                })
              }
            >
              Lag portaltilgang
            </button>
          )}
        </Dialog>
      )}
      {currentUrl && data?.portal && !data.portal.revoked && (
        <details>
          <summary>Invitasjonstekst og personlig lenke</summary>
          <label>
            Personlig portallenke
            <input readOnly value={currentUrl} />
          </label>
          <label>
            Invitasjonstekst
            <textarea
              readOnly
              rows={10}
              value={invitationText(data.contact, unit, currentUrl)}
            />
          </label>
          <button
            disabled={disabled}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(
                  invitationText(data.contact, unit, currentUrl),
                );
                setNotice("Invitasjonen er kopiert. Ingen e-post er sendt.");
              } catch {
                setError("Marker og kopier invitasjonsteksten.");
              }
            }}
          >
            Kopier invitasjon
          </button>
        </details>
      )}
    </section>
  );
}
