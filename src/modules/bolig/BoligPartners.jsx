import React, { useState } from "react";
import {
  Truck,
  UsersRound,
  ShieldCheck,
  Plus,
  ExternalLink,
} from "lucide-react";
import Dialog from "./BoligEditorDialog.jsx";
import Items from "./BoligPartnerItems.jsx";
import {
  partnerManagerRpc,
  partnerToken,
  partnerDate,
  readPartnerDraft,
  storePartnerDraft,
  useLivePartner,
} from "./boligPartnerClient.js";
import "./boligPartners.css";
const blank = {
  name: "",
  email: "",
  organisation: "",
  kind: "supplier",
  days: 30,
  order_ids: [],
  task_ids: [],
};
export default function BoligPartners({ context, root }) {
  const key = `expo.bolig-partners.v1:${context.user_id}:${context.company_id}:${root.id}`;
  const scope = `${key}:${context.role}:${context.enabled}`;
  const { data, error, busy, load, run } = useLivePartner(scope, () =>
    partnerManagerRpc(context, root.id),
  );
  const [draft, setDraft] = useState(() => readPartnerDraft(key, { ...blank })),
    [pending, setPending] = useState(() =>
      readPartnerDraft(key + ":pending", null),
    ),
    [links, setLinks] = useState(() => readPartnerDraft(key + ":links", {}));
  const [editor, setEditor] = useState(false),
    [selected, setSelected] = useState(null),
    [query, setQuery] = useState(""),
    [limit, setLimit] = useState(40),
    [localError, setLocalError] = useState(""),
    [notice, setNotice] = useState("");
  const manager =
    context.role === "manager" && context.enabled && !root.archived;
  const update = (fields) => {
    if (pending) return;
    const next = { ...draft, ...fields };
    try {
      storePartnerDraft(key, next);
      setDraft(next);
      setLocalError("");
    } catch {
      setLocalError(
        "Nettleseren kunne ikke sikre kladden. Behold vinduet åpent.",
      );
    }
  };
  const rows = [...(data?.orders || []), ...(data?.tasks || [])];
  const chosen = rows.filter((x) =>
    draft[x.kind === "order" ? "order_ids" : "task_ids"].includes(x.id),
  );
  const missing =
    draft.order_ids.length + draft.task_ids.length !== chosen.length;
  const shown = rows
    .filter((x) =>
      `${x.title} ${x.number} ${x.address}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    )
    .slice(0, limit);
  const create = () => {
    if (!data || !manager || busy) return;
    let attempt = pending;
    try {
      if (!attempt) {
        if (missing)
          throw Error(
            "En valgt rad er ikke lenger tilgjengelig. Fjern valget og se over grunnlaget.",
          );
        attempt = {
          action: "create",
          payload: {
            ...draft,
            id: crypto.randomUUID(),
            request_id: crypto.randomUUID(),
            token: partnerToken(),
            reviewed: true,
            basis: Object.fromEntries(chosen.map((x) => [x.id, x.basis])),
          },
        };
        storePartnerDraft(key + ":pending", attempt);
        setPending(attempt);
      }
      run(
        () =>
          partnerManagerRpc(context, root.id, attempt.action, attempt.payload),
        (result) => {
          if (result.created_id !== attempt.payload.id)
            throw Error("Tilgangsreferansen stemmer ikke.");
          const next = {
            ...links,
            [result.created_id]: `${location.origin}/bolig-kunde.html#partner=${attempt.payload.token}`,
          };
          storePartnerDraft(key + ":links", next);
          storePartnerDraft(key + ":pending", null);
          storePartnerDraft(key, { ...blank });
          setLinks(next);
          setPending(null);
          setDraft({ ...blank });
          setEditor(false);
          setSelected(result.created_id);
          setNotice("Tilgangslenken er klar. Ingen invitasjon er sendt.");
        },
        (e) => {
          if (["PT409", "22023"].includes(e.code)) {
            storePartnerDraft(key + ":pending", null);
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
  const revoke = (id) => {
    const k = key + ":revoke:" + id;
    let attempt = readPartnerDraft(k, null) || {
      id,
      request_id: crypto.randomUUID(),
    };
    try {
      storePartnerDraft(k, attempt);
      run(
        () => partnerManagerRpc(context, root.id, "revoke", attempt),
        () => {
          localStorage.removeItem(k);
          setNotice("Tilgangen er trukket tilbake.");
        },
      );
    } catch (e) {
      setLocalError(e.message);
    }
  };
  const active = data?.partners.filter((x) => x.active).length || 0;
  const partner = data?.partners.find((p) => p.id === selected);
  return (
    <section className="bolig-partners" aria-label="UE og leverandører">
      <header className="bolig-partner-hero">
        <span className="bolig-partner-icon">
          <Truck size={29} />
        </span>
        <div>
          <small>SAMARBEID I PROSJEKTET</small>
          <h2>UE og leverandører</h2>
          <p>
            Del utvalgte leveranser og aktiviteter. Følg bekreftede datoer og
            avvik på samme grunnlag som prosjektet bruker.
          </p>
        </div>
        {manager && (
          <button
            type="button"
            className="bolig-primary"
            disabled={!data || busy}
            onClick={() => setEditor(true)}
          >
            <Plus size={17} />
            Gi tilgang
          </button>
        )}
      </header>
      {(error || localError) && <p role="alert">{localError || error}</p>}
      {notice && <p role="status">{notice}</p>}
      <div className="bolig-partner-toolbar">
        <span>
          <UsersRound size={17} /> {active} aktive tilganger
        </span>
        <button type="button" disabled={busy} onClick={load}>
          Hent siste status
        </button>
      </div>
      {!data ? (
        <p role="status">
          {error
            ? "Tilgangen må kontrolleres på nytt."
            : "Kontrollerer tilgang og henter leveranser …"}
        </p>
      ) : (
        <>
          {!data.partners.length && (
            <div className="bolig-partner-empty">
              <ShieldCheck size={35} />
              <h3>Riktig innsyn til hver samarbeidspartner</h3>
              <p>
                Velg en kontakt og del bare ordrene og aktivitetene vedkommende
                skal følge opp. Leverandørens svar vises her. Varemottak
                registreres fortsatt på bestillingen.
              </p>
            </div>
          )}
          <div className="bolig-partner-cards">
            {data.partners.map((p) => {
              const issues = p.events.filter(
                (e, i, all) =>
                  all.findIndex(
                    (x) => x.target_id === e.target_id && x.kind === e.kind,
                  ) === i &&
                  e.current &&
                  e.status === "issue",
              ).length;
              return (
                <button
                  className="bolig-partner-card"
                  type="button"
                  key={p.id}
                  onClick={() => setSelected(p.id)}
                >
                  <span className="bolig-partner-tag">
                    {p.active
                      ? p.kind === "ue"
                        ? "UE"
                        : "Leverandør"
                      : p.revoked
                        ? "Tilbakekalt"
                        : "Utløpt / stanset"}
                  </span>
                  <b>{p.organisation}</b>
                  <span>{p.name}</span>
                  <small>
                    {p.orders.length} leveranser · {p.tasks.length} aktiviteter
                    · {issues} avvik
                  </small>
                  <small>Til {partnerDate(p.expires_at)}</small>
                  <span>Åpne oppfølging →</span>
                </button>
              );
            })}
          </div>
        </>
      )}
      {editor && manager && (
        <Dialog
          className="bolig-partner-dialog"
          title="Gi UE eller leverandør tilgang"
          busy={busy}
          onClose={() => setEditor(false)}
        >
          <p>
            Velg hva kontakten får se. Lenken gir tilgang til den som har den.
            Del den bare med den navngitte kontakten.
          </p>
          {(error || localError) && <p role="alert">{localError || error}</p>}
          {!data ? (
            <p>Kontrollerer tilgang …</p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                create();
              }}
            >
              <fieldset disabled={busy || !!pending}>
                <div className="bolig-partner-fields">
                  <label>
                    Bedrift
                    <input
                      required
                      minLength={2}
                      maxLength={160}
                      value={draft.organisation}
                      onChange={(e) => update({ organisation: e.target.value })}
                    />
                  </label>
                  <label>
                    Kontaktperson
                    <input
                      required
                      minLength={2}
                      maxLength={120}
                      value={draft.name}
                      onChange={(e) => update({ name: e.target.value })}
                    />
                  </label>
                  <label>
                    E-post
                    <input
                      required
                      type="email"
                      maxLength={254}
                      value={draft.email}
                      onChange={(e) => update({ email: e.target.value })}
                    />
                  </label>
                  <label>
                    Type
                    <select
                      value={draft.kind}
                      onChange={(e) => update({ kind: e.target.value })}
                    >
                      <option value="supplier">Leverandør</option>
                      <option value="ue">UE</option>
                    </select>
                  </label>
                  <label>
                    Gyldig i
                    <select
                      value={draft.days}
                      onChange={(e) => update({ days: Number(e.target.value) })}
                    >
                      {[7, 14, 30, 60, 90].map((n) => (
                        <option key={n} value={n}>
                          {n} dager
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </fieldset>
              <h3>Velg leveranser og aktiviteter</h3>
              <p>
                Kun faktisk bestilte ordre og aktive aktiviteter kan deles. Hver
                ordre deles med alle varelinjene i ordren, uten priser. Del
                ulike leverandørers varer i separate ordre.
              </p>
              <label>
                Søk i grunnlaget
                <input
                  type="search"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setLimit(40);
                  }}
                />
              </label>
              <div className="bolig-partner-selection">
                {shown.map((x) => {
                  const field = x.kind === "order" ? "order_ids" : "task_ids";
                  return (
                    <label key={x.id}>
                      <input
                        type="checkbox"
                        checked={draft[field].includes(x.id)}
                        disabled={busy || !!pending}
                        onChange={(e) =>
                          update({
                            [field]: e.target.checked
                              ? [...draft[field], x.id]
                              : draft[field].filter((id) => id !== x.id),
                          })
                        }
                      />
                      <span>
                        <b>{x.title}</b>
                        <small>
                          {x.kind === "order" ? "Leveranse" : "Aktivitet"} ·{" "}
                          {x.address} · {x.number}
                        </small>
                      </span>
                    </label>
                  );
                })}
              </div>
              {rows.length > limit && (
                <button type="button" onClick={() => setLimit(limit + 40)}>
                  Vis flere
                </button>
              )}
              <p>
                <b>
                  {draft.order_ids.length} leveranser og {draft.task_ids.length}{" "}
                  aktiviteter valgt.
                </b>{" "}
                Beboerkontakt, pris, margin og andre prosjektopplysninger deles
                ikke.
              </p>
              {missing && (
                <p role="alert">
                  Noen valgte rader er fjernet eller arkivert.{" "}
                  <button
                    type="button"
                    onClick={() =>
                      update({
                        order_ids: chosen
                          .filter((x) => x.kind === "order")
                          .map((x) => x.id),
                        task_ids: chosen
                          .filter((x) => x.kind === "task")
                          .map((x) => x.id),
                      })
                    }
                  >
                    Fjern utilgjengelige valg
                  </button>
                </p>
              )}
              <details>
                <summary>Se nøyaktig hva som deles</summary>
                <Items items={chosen} />
              </details>
              {pending && (
                <p>
                  Et forsøk venter på kvittering. Prøv samme forsøk igjen for å
                  unngå dobbelt tilgang.
                </p>
              )}
              <footer>
                <button type="button" onClick={() => setEditor(false)}>
                  Lukk og behold utkast
                </button>
                <button
                  className="bolig-primary"
                  type="submit"
                  disabled={
                    busy ||
                    (!pending &&
                      (!chosen.length || missing || chosen.length > 200))
                  }
                >
                  {busy
                    ? "Lagrer …"
                    : pending
                      ? "Prøv samme forsøk igjen"
                      : "Opprett tilgangslenke"}
                </button>
              </footer>
            </form>
          )}
        </Dialog>
      )}
      {partner && (
        <Dialog
          className="bolig-partner-dialog"
          title={`${partner.organisation} – oppfølging`}
          busy={busy}
          onClose={() => setSelected(null)}
        >
          <p>
            {partner.name} · {partner.email} · Til{" "}
            {partnerDate(partner.expires_at)} ·{" "}
            {partner.active
              ? "Aktiv tilgang"
              : partner.revoked
                ? "Tilbakekalt"
                : "Utløpt / stanset"}
          </p>
          {error && <p role="alert">{error}</p>}
          {manager && partner.active && (
            <div className="bolig-partner-toolbar">
              {links[partner.id] ? (
                <label>
                  Tilgangslenke
                  <input
                    readOnly
                    aria-label="Tilgangslenke"
                    value={links[partner.id]}
                    onFocus={(e) => e.target.select()}
                  />
                  <a href={links[partner.id]} target="_blank" rel="noreferrer">
                    <ExternalLink size={15} />
                    Åpne mottakersiden
                  </a>
                </label>
              ) : (
                <p>
                  Lenken finnes i nettleseren der den ble opprettet. Trenger
                  kontakten en ny lenke, trekk tilbake og opprett ny tilgang.
                </p>
              )}
              <button
                type="button"
                disabled={busy}
                onClick={() => revoke(partner.id)}
              >
                Trekk tilbake tilgang
              </button>
            </div>
          )}
          <p>
            Svarene endrer ikke prosjektplanen eller registrert varemottak.
            Datoendringer følges opp i «Fremdrift og varsler». Mottak
            registreres under boligens bestilling.
          </p>
          <Items
            items={[...partner.orders, ...partner.tasks]}
            events={partner.events}
          />
        </Dialog>
      )}
    </section>
  );
}
