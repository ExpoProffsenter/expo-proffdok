import React, { useEffect, useState } from "react";
import { CalendarDays, ShieldCheck } from "lucide-react";
import Dialog from "./BoligEditorDialog.jsx";
import Items from "./BoligPartnerItems.jsx";
import PartnerQuality from "./BoligPartnerQuality.jsx";
import Gantt from "./BoligGantt.jsx";
import {
  partnerPortalRpc,
  partnerDate,
  readPartnerDraft,
  storePartnerDraft,
  useLivePartner,
} from "./boligPartnerClient.js";
import "./boligPartners.css";
import "./bolig.css";
import "./boligProgress.css";
export default function BoligPartnerPage() {
  const [token, setToken] = useState(() =>
    location.hash.replace(/^#partner=/, ""),
  );
  useEffect(() => {
    document.title = "Prosjektsamarbeid · Expo ProffDok";
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
    [tab, setTab] = useState(null),
    [selectedTask, setSelectedTask] = useState(null),
    [query, setQuery] = useState(""),
    [limit, setLimit] = useState(40);
  const tabs = [
    { id: "tasks", feature: "progress", title: "Fremdrift" },
    { id: "orders", feature: "orders", title: "Leveranser" },
    { id: "checklists", feature: "checklists", title: "Sjekklister" },
  ].filter((x) =>
    data?.features ? data.features.includes(x.feature) : x.id !== "checklists",
  );
  const activeTab = tabs.some((x) => x.id === tab) ? tab : tabs[0]?.id;
  const items = (data?.[activeTab] || []).filter((x) =>
      `${x.title} ${x.number} ${x.address} ${x.room_name || ""}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    ),
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
  // Derive chart rows only from the current capability projection. The chart
  // receives no internal client, manager callbacks or persistent authority.
  const chartTasks = (data?.tasks || []).map((t) => ({
    ...t,
    active: true,
    unit_number: t.number,
    unit_id: JSON.stringify([t.address, t.number]),
  }));
  const taskDetail = data?.tasks.find((t) => t.id === selectedTask);
  return (
    <main className="bolig-partner-portal bolig-partners">
      <div className="bolig-partner-brand">
        <img
          src="/expo-logo.png"
          alt="Expo Proffsenter"
          width="250"
          height="53"
        />
        <span>
          Expo <b>ProffDok</b>
          <small>Prosjektsamarbeid</small>
        </span>
      </div>
      <header className="bolig-partner-hero">
        <span className="bolig-partner-icon">
          <CalendarDays size={30} />
        </span>
        <div>
          <small>OVERSIKT · SAMARBEID · DOKUMENTASJON</small>
          <h1>Prosjektsamarbeid</h1>
          <p>
            Følg fremdrift, kontroller og leveranser som prosjektet har delt.
          </p>
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
          <p className="bolig-partner-scope">
            {data.access_mode === "project"
              ? `Hele prosjektet · ${data.unit_count} leiligheter. Nye leiligheter omfattes automatisk.`
              : "Denne eldre lenken gjelder utvalgte leveranser og aktiviteter."}
          </p>
          <nav className="bolig-partner-tabs" aria-label="Delt innhold">
            {tabs.map((x) => (
              <button
                key={x.id}
                type="button"
                aria-pressed={activeTab === x.id}
                onClick={() => {
                  setTab(x.id);
                  setLimit(40);
                }}
              >
                {x.title} ({data[x.id]?.length || 0})
              </button>
            ))}
          </nav>
          {activeTab !== "tasks" && (
            <label>
              Søk etter leilighet, adresse eller innhold
              <input
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setLimit(40);
                }}
              />
            </label>
          )}
          {activeTab === "tasks" ? (
            <>
              <Gantt
                key={data.id}
                tasks={chartTasks}
                context={{
                  user_id: `partner:${data.id}`,
                  company_id: "shared",
                }}
                root={{ id: data.id }}
                readOnly
                initiallyCollapsed
                onEdit={(t) => setSelectedTask(t.id)}
              />
              <p className="bolig-partner-legend">
                <span>Planlagt</span>
                <span>Pågår</span>
                <span>Utført</span>
                <span>Stanset</span>
              </p>
              <p>
                Åpne en leilighet med pilen. Trykk på arbeidet eller stolpen for
                å se detaljer, bekrefte dato eller melde avvik.
              </p>
              {taskDetail && (
                <Dialog
                  className="bolig-partner-dialog"
                  title="Aktivitetsdetaljer"
                  onClose={() => setSelectedTask(null)}
                >
                  <Items
                    items={[taskDetail]}
                    events={data.events}
                    onRespond={(t) => {
                      setSelectedTask(null);
                      respond(t);
                    }}
                  />
                </Dialog>
              )}
            </>
          ) : items.length ? (
            activeTab === "checklists" ? (
              <>
                <p>
                  {data.features.includes("quality_write")
                    ? "Prosjektets sjekklister vises her. Fyll ut egne kontroller og legg til filer under Mine sjekklister og vedlegg."
                    : "Sjekklistene er delt for lesing. Prosjektet registrerer og oppdaterer kontrollene."}
                </p>
                <div className="bolig-partner-items">
                  {items.slice(0, limit).map((x) => (
                    <article
                      className="bolig-partner-item"
                      key={`${x.scope_id}:${x.id}`}
                    >
                      <h3>{x.title}</h3>
                      <p>
                        {x.address} · {x.number}
                        {x.room_name ? ` · ${x.room_name}` : ""}
                      </p>
                      <p>
                        {x.status === "completed" ? "Fullført" : "Under arbeid"}{" "}
                        · {x.trade}
                      </p>
                      <details>
                        <summary>
                          Se kontrollpunkter ({x.points.length})
                        </summary>
                        <ul>
                          {x.points.map((p) => (
                            <li key={p.id}>
                              <b>{p.title}</b>
                              {p.guidance && <p>{p.guidance}</p>}
                              <p>{p.status || "Ikke kontrollert"}</p>
                            </li>
                          ))}
                        </ul>
                      </details>
                    </article>
                  ))}
                </div>
              </>
            ) : (
              <Items
                items={items.slice(0, limit)}
                events={data.events}
                onRespond={respond}
              />
            )
          ) : (
            <p>Ingen treff i denne funksjonen.</p>
          )}
          {activeTab !== "tasks" && items.length > limit && (
            <button type="button" onClick={() => setLimit(limit + 40)}>
              Vis flere
            </button>
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
      <PartnerQuality
        token={token}
        data={data}
        run={run}
        busy={busy}
        load={load}
      />
    </main>
  );
}
