import React, { useEffect, useState } from "react";
import { Truck, ShieldCheck } from "lucide-react";
import Dialog from "./BoligEditorDialog.jsx";
import Items from "./BoligPartnerItems.jsx";
import {
  partnerPortalRpc,
  partnerDate,
  readPartnerDraft,
  storePartnerDraft,
  useLivePartner,
} from "./boligPartnerClient.js";
import "./boligPartners.css";
import "./bolig.css";
export default function BoligPartnerPage() {
  const [token, setToken] = useState(() =>
    location.hash.replace(/^#partner=/, ""),
  );
  useEffect(() => {
    const change = () => setToken(location.hash.replace(/^#partner=/, ""));
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  return <PartnerPage key={token} token={token} />;
}
function PartnerPage({ token }) {
  const { data, error, busy, load, run } = useLivePartner(token, () =>
    partnerPortalRpc(token),
  );
  const key = `expo.bolig-partner-answer.v1:${token}`;
  const [saved, setSaved] = useState(() =>
    readPartnerDraft(key, {
      target: null,
      draft: { status: "confirmed", date: "", reference: "", body: "" },
      pending: null,
    }),
  );
  const [open, setOpen] = useState(false),
    [notice, setNotice] = useState(""),
    [localError, setLocalError] = useState(""),
    [tab, setTab] = useState("orders");
  const items = data?.[tab] || [],
    target =
      data &&
      [...data.orders, ...data.tasks].find(
        (x) => x.id === saved.target?.id && x.kind === saved.target?.kind,
      );
  const persist = (next) => {
    try {
      storePartnerDraft(key, next);
      setSaved(next);
      setLocalError("");
      return true;
    } catch {
      setLocalError("Nettleseren kunne ikke sikre svaret. Behold siden åpen.");
      return false;
    }
  };
  const respond = (item) => {
    if (saved.target && saved.target.id !== item.id) {
      setLocalError(
        "Du har et utkast til en annen rad. Åpne dette og fullfør eller forkast det først.",
      );
      return;
    }
    if (!saved.target) {
      const previous = data.events.find(
        (e) => e.target_id === item.id && e.current,
      );
      if (
        !persist({
          target: { id: item.id, kind: item.kind, basis: item.basis },
          draft: {
            status: previous?.status || "confirmed",
            date:
              previous?.promised_date ||
              item.requested_date ||
              item.planned_end ||
              "",
            reference: previous?.reference || item.supplier_reference || "",
            body: "",
          },
          pending: null,
        })
      )
        return;
    }
    setOpen(true);
  };
  const update = (fields) =>
    persist({ ...saved, draft: { ...saved.draft, ...fields } });
  const send = (e) => {
    e.preventDefault();
    if (
      !target ||
      busy ||
      (!saved.pending && saved.target.basis !== target.basis)
    )
      return;
    const attempt = saved.pending || {
      ...saved.draft,
      target_id: target.id,
      kind: target.kind,
      basis: saved.target.basis,
      request_id: crypto.randomUUID(),
    };
    if (!persist({ ...saved, pending: attempt })) return;
    run(
      () => partnerPortalRpc(token, "respond", attempt),
      () => {
        localStorage.removeItem(key);
        setSaved({
          target: null,
          draft: { status: "confirmed", date: "", reference: "", body: "" },
          pending: null,
        });
        setOpen(false);
        setNotice("Svaret er registrert hos prosjektet.");
      },
      (e) => {
        if (["PT409", "22023"].includes(e.code)) {
          persist({ ...saved, pending: null });
          setLocalError(e.message);
          load();
        }
      },
    );
  };
  const changed = target && saved.target?.basis !== target.basis;
  return (
    <main className="bolig-partner-portal bolig-partners">
      <header className="bolig-partner-hero">
        <span className="bolig-partner-icon">
          <Truck size={30} />
        </span>
        <div>
          <small>PROSJEKTSAMARBEID</small>
          <h1>Dine leveranser og aktiviteter</h1>
          <p>Bekreft avtalt dato, eller gi beskjed om noe må avklares.</p>
        </div>
      </header>
      {(error || localError) && <p role="alert">{localError || error}</p>}
      {notice && <p role="status">{notice}</p>}
      {!data ? (
        <section className="bolig-partner-empty">
          <ShieldCheck size={32} />
          <h2>
            {error
              ? "Tilgangen kunne ikke bekreftes"
              : "Kontrollerer tilgangen …"}
          </h2>
          <p>
            {error
              ? "Kontakt prosjektleder hvis lenken er utløpt eller trukket tilbake."
              : "Henter bare det som er delt med deg."}
          </p>
          <button type="button" onClick={load}>
            Prøv å hente på nytt
          </button>
        </section>
      ) : (
        <>
          <div className="bolig-partner-project">
            <div>
              <h2>{data.project.title}</h2>
              <p>
                {data.project.company} · {data.project.reference}
              </p>
              <p>
                <b>{data.name}</b> · {data.organisation}
              </p>
              <small>Tilgang til {partnerDate(data.expires_at)}</small>
            </div>
            <button type="button" disabled={busy} onClick={load}>
              Hent siste status
            </button>
          </div>
          <p>
            Prosjektet registrerer faktisk mottak og endrer fremdriftsplanen.
            Ditt svar vises som en bekreftelse eller et avvik på den aktuelle
            raden.
          </p>
          {saved.target && (
            <div className="bolig-partner-toolbar">
              <span>Du har et lagret svarutkast.</span>
              <button type="button" onClick={() => setOpen(true)}>
                Fortsett svarutkast
              </button>
            </div>
          )}
          <nav className="bolig-partner-tabs" aria-label="Delt innhold">
            <button
              type="button"
              aria-pressed={tab === "orders"}
              onClick={() => setTab("orders")}
            >
              Leveranser ({data.orders.length})
            </button>
            <button
              type="button"
              aria-pressed={tab === "tasks"}
              onClick={() => setTab("tasks")}
            >
              Fremdrift ({data.tasks.length})
            </button>
          </nav>
          {items.length ? (
            <Items items={items} events={data.events} onRespond={respond} />
          ) : (
            <p>
              Ingen {tab === "orders" ? "leveranser" : "aktiviteter"} er delt
              med deg.
            </p>
          )}
          {open && (
            <Dialog
              className="bolig-partner-dialog"
              title="Bekreft dato eller meld avvik"
              busy={busy}
              onClose={() => setOpen(false)}
            >
              {(error || localError) && (
                <p role="alert">{localError || error}</p>
              )}
              {target ? (
                <form onSubmit={send}>
                  <h3>
                    {target.title} · {target.number}
                  </h3>
                  <p>
                    {target.address} ·{" "}
                    {target.kind === "order"
                      ? `Ønsket levering: ${partnerDate(target.requested_date)}`
                      : `Planlagt: ${partnerDate(target.planned_start)} – ${partnerDate(target.planned_end)}`}
                  </p>
                  <fieldset disabled={busy || !!saved.pending}>
                    <label>
                      Svar
                      <select
                        aria-label="Svar"
                        value={saved.draft.status}
                        onChange={(e) => update({ status: e.target.value })}
                      >
                        <option value="confirmed">Bekreft dato</option>
                        <option value="issue">
                          Meld avvik / foreslå endring
                        </option>
                      </select>
                    </label>
                    <label>
                      {target.kind === "order"
                        ? "Bekreftet / foreslått leveringsdato"
                        : "Bekreftet / foreslått sluttdato"}
                      <input
                        required={saved.draft.status === "confirmed"}
                        type="date"
                        min="2000-01-01"
                        max="2100-12-31"
                        value={saved.draft.date}
                        onChange={(e) => update({ date: e.target.value })}
                      />
                    </label>
                    {target.kind === "order" && (
                      <label>
                        Leverandørens eget ordrenummer (valgfritt)
                        <input
                          maxLength={160}
                          value={saved.draft.reference}
                          onChange={(e) =>
                            update({ reference: e.target.value })
                          }
                        />
                      </label>
                    )}
                    <label>
                      Merknad
                      {saved.draft.status === "issue"
                        ? " – beskriv avviket"
                        : ""}
                      <textarea
                        aria-label={
                          saved.draft.status === "issue"
                            ? "Merknad – beskriv avviket"
                            : "Merknad"
                        }
                        required={saved.draft.status === "issue"}
                        minLength={saved.draft.status === "issue" ? 3 : 0}
                        maxLength={2000}
                        value={saved.draft.body}
                        onChange={(e) => update({ body: e.target.value })}
                      />
                    </label>
                  </fieldset>
                  {changed && !saved.pending && (
                    <p role="alert">
                      Grunnlaget er endret. Se over de nye datoene og varene
                      ovenfor. Kladden er beholdt.{" "}
                      <button
                        type="button"
                        onClick={() =>
                          persist({
                            ...saved,
                            target: { ...saved.target, basis: target.basis },
                          })
                        }
                      >
                        Jeg har sett siste grunnlag
                      </button>
                    </p>
                  )}
                  {saved.pending && (
                    <p>
                      Venter på bekreftet kvittering. Prøv samme svar igjen.
                    </p>
                  )}
                  <footer>
                    <button type="button" onClick={() => setOpen(false)}>
                      Lukk og behold utkast
                    </button>
                    <button
                      type="submit"
                      className="bolig-primary"
                      disabled={busy || (!saved.pending && changed)}
                    >
                      {busy
                        ? "Registrerer …"
                        : saved.pending
                          ? "Prøv samme svar igjen"
                          : "Registrer svar"}
                    </button>
                  </footer>
                </form>
              ) : (
                <p>Raden er ikke lenger delt. Kladden er beholdt lokalt.</p>
              )}
              {!busy && (
                <details>
                  <summary>Forkast svarutkast</summary>
                  <p>
                    Dette fjerner bare usendt kladd. Et svar som allerede er
                    registrert beholdes i historikken.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem(key);
                      setSaved({
                        target: null,
                        draft: {
                          status: "confirmed",
                          date: "",
                          reference: "",
                          body: "",
                        },
                        pending: null,
                      });
                      setOpen(false);
                    }}
                  >
                    Forkast kladden
                  </button>
                </details>
              )}
            </Dialog>
          )}
        </>
      )}
    </main>
  );
}
