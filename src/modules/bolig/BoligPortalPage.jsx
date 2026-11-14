import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, Building2, Check, ClipboardCheck, FileText, Home, MessageSquare, RefreshCw, ShieldCheck, SlidersHorizontal } from "lucide-react";
import "./boligPortalPresentation.css";
import {
  portalResidentRpc,
  portalStamp,
  portalStatus,
} from "./boligPortalClient.js";
import Summary from "./BoligAgreementSummary.jsx";
import ChoiceCards, {PortalGoods, PortalPrices} from "./BoligPortalChoiceCards.jsx";
import {combinedPortalChoice} from "./boligPortalChoices.js";
import {
  agreementMoney as money,
  agreementOverview,
  acceptanceDeadline,
} from "./boligCommerceCore.js";
const sections = [
  ["choices", "Mine valg"],
  ["agreements", "Avtaler"],
  ["documents", "Dokumenter"],
  ["messages", "Meldinger"],
];
const sectionIcons = { choices: SlidersHorizontal, agreements: ClipboardCheck, documents: FileText, messages: MessageSquare };
export default function BoligPortalPage() {
  const token = useRef(window.location.hash.replace(/^#portal=/, "")),
    alive = useRef(false),
    epoch = useRef(0),
    operating = useRef(false),
    current = useRef(null);
  const [failedLogo, setFailedLogo] = useState(null);
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [refreshing, setRefreshing] = useState(false),
    [busy, setBusy] = useState(false),
    [tab, setTab] = useState("choices");
  const [draft, setDraft] = useState({
      offer_id: "",
      offer_ids: [],
      body: "",
      message: "",
      name: "",
      confirmed: false,
    }),
    [pending, setPending] = useState(null),
    [review, setReview] = useState(null),
    [agreement, setAgreement] = useState(null),
    [notice, setNotice] = useState("");
  const choicesHeading=useRef(null), requestsHeading=useRef(null);
  const selectedAgreement=useRef(null);
  selectedAgreement.current=agreement;
  const agreementHeading=useRef(null);
  useEffect(()=>{if(agreement&&tab==='agreements'){agreementHeading.current?.focus({preventScroll:true});agreementHeading.current?.scrollIntoView?.({block:'start',behavior:'auto'});}},[agreement,tab]);
  const key = useRef(null);
  current.current = data;
  const save = (next, attempt = pending) => {
    if (!key.current) return;
    try {
      sessionStorage.setItem(
        key.current,
        JSON.stringify({ draft: next, pending: attempt }),
      );
    } catch {
      throw Error("Nettleseren kunne ikke sikre kladden. Behold siden åpen.");
    }
  };
  const update = (fields) => {
    const next = { ...draft, ...fields };
    try {
      save(next);
      setDraft(next);
      setReview(null);
    } catch (e) {
      setError(e.message);
    }
  };
  const load = async () => {
    if (operating.current) return;
    const ticket = ++epoch.current;
    setRefreshing(true);
    if (!current.current) setLoading(true);
    try {
      if (!/^[0-9a-f]{64}$/.test(token.current))
        throw Object.assign(
          Error(
            "Lenken er ufullstendig. Åpne hele portallenken fra prosjektleder.",
          ),
          { code: "42501" },
        );
      const next = await portalResidentRpc(token.current);
      if (!alive.current || ticket !== epoch.current) return;
      if (current.current && current.current.id !== next.id)
        throw Object.assign(Error("Portalen er endret. Åpne lenken på nytt."), {
          code: "42501",
        });
      if (!key.current) {
        if(!next.offers.length&&next.agreements.length>0)setTab('agreements');
        key.current = `expo-bolig-portal:${next.id}:${token.current.slice(0, 12)}`;
        let saved;
        try {
          saved = JSON.parse(sessionStorage.getItem(key.current));
        } catch {}
        if (saved?.draft) setDraft(saved.draft);
        if (saved?.pending) setPending(saved.pending);
      }
      const selected=selectedAgreement.current;
      if(selected && current.current?.agreements.find(d=>d.id===selected)?.revision!==next.agreements.find(d=>d.id===selected)?.revision){
        setAgreement(null);setReview(null);setDraft(previous=>({...previous,confirmed:false}));
        setNotice('Avtalen er oppdatert. Åpne den nye utgaven og kontroller den før du svarer.');
      }
      if(current.current && current.current.menu_version !== next.menu_version){setReview(null);setNotice("Valgmulighetene er oppdatert. Kontroller valgene på nytt.");}
      setData(next);
      setError("");
    } catch (e) {
      if (alive.current && ticket === epoch.current) {
        setError(e.message);
        if (e.code === "42501") {
          setData(null);
          setAgreement(null);
          setReview(null);
        }
      }
    } finally {
      if (alive.current && ticket === epoch.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };
  useEffect(() => {
    alive.current = true;
    load();
    const refresh = () => {
      if (document.visibilityState !== "hidden") load();
    };
    const change = () => window.location.reload();
    const poll = setInterval(refresh, 20000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("hashchange", change);
    return () => {
      clearInterval(poll);
      alive.current = false;
      ++epoch.current;
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("hashchange", change);
    };
  }, []);
  const run = async (action, payload, retry = false) => {
    if (operating.current || (!retry && pending)) return;
    operating.current = true;
    ++epoch.current;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const attempt = retry
        ? pending
        : { action, payload: { ...payload, request_id: crypto.randomUUID() } };
      save(draft, attempt);
      setPending(attempt);
      const next = await portalResidentRpc(
        token.current,
        attempt.action,
        attempt.payload,
      );
      if (!alive.current) return;
      if (next.id !== current.current?.id)
        throw Object.assign(Error("Portalen er endret."), { code: "42501" });
      const cleaned = {
        ...draft,
        ...(attempt.action === "message"
          ? { message: "" }
          : attempt.action === "request"
            ? { body: "" }
            : { confirmed: false }),
      };
      save(cleaned, null);
      setPending(null);
      setDraft(cleaned);
      setData(next);
      setReview(null);
      setAgreement(null);
      setNotice(
        attempt.action === "request"
          ? "Valget er sendt til prosjektleder for gjennomgang."
          : attempt.action === "message"
            ? "Meldingen er registrert i portalen."
            : "Svaret er registrert. Kvitteringen ligger under Avtaler.",
      );
    } catch (e) {
      if (alive.current) {
        setError(e.message);
        if (e.code) {
          try {
            save(draft, null);
          } catch {}
          setPending(null);
        }
        if (e.code === "42501") {
          setData(null);
          setAgreement(null);
          setReview(null);
        }
      }
    } finally {
      operating.current = false;
      if (alive.current) setBusy(false);
    }
  };
  const doc = data?.agreements.find((d) => d.id === agreement),
    selected = data?.combine_base_id ? combinedPortalChoice(data,draft.offer_ids || []) : data?.offers.find((o) => o.id === draft.offer_id),
    waiting = data?.events.some(
      (e) => e.kind === "request" && e.status === "pending",
    );
  const disabled = busy || !!pending;
  const choicesClosed = data?.choices_closed || !!(data?.choice_deadline && new Intl.DateTimeFormat("sv-SE", {timeZone:"Europe/Oslo",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date()) > data.choice_deadline);
  const overview = agreementOverview(data?.agreements);
  const unanswered = [overview.choice, ...overview.changes].filter(d => d?.status === "published").length;
  const nextStep = unanswered ? {
    title: "En avtale venter på svar",
    text: "Se innhold, pris og svarfrist før du svarer.",
    button: "Se avtaler som venter", tab: "agreements",
  } : waiting ? {
    title: "Valget ditt er til gjennomgang",
    text: "Prosjektleder går gjennom ønsket ditt. En eventuell avtale kommer her når den er klar.",
    button: "Se innsendte valg", tab: "choices",
  } : data?.offers.length ? {
    title: "Se mulighetene for boligen din",
    text: "Utforsk valgene og send ønsket ditt til prosjektleder. En avtale aksepteres separat.",
    button: "Utforsk dine valg", tab: "choices",
  } : {
    title: "Alt samlet på ett sted",
    text: "Her finner du det prosjektleder har delt. Bruk fanene for avtaler, dokumenter og meldinger.",
    button: "Se dine avtaler", tab: "agreements",
  };
  const agreementRow = (d) => (
    <article className="bolig-portal-event" key={d.id}>
      <strong>
        {d.snapshot?.source === "shop" ? "Butikktillegg" : d.kind === "choice" ? "Boligavtale" : "Endringsavtale"} · utgave{" "}
        {d.version}
      </strong>
      <small>
        {d.status === "published"
          ? "Venter på ditt svar"
          : d.status === "declined"
            ? "Avslått"
            : "Akseptert"}
      </small>
      <button
        onClick={() => {
          setAgreement(d.id);
          setReview(null);
          update({ confirmed: false });
        }}
      >
        Åpne {d.status === "published" ? "avtalen" : "kvitteringen"}
      </button>
    </article>
  );
  return (
    <main className="bolig-resident-page bolig-portal-page">
      <header className="bolig-resident-brand">
        {data?.identity.logo_url && failedLogo !== data.identity.logo_url
          ? <img className="bolig-portal-company-logo" src={data.identity.logo_url} alt={`${data.identity.company} logo`} onError={()=>setFailedLogo(data.identity.logo_url)}/>
          : <span aria-hidden="true"><Building2 size={24}/></span>}
        <div>
          <strong>{data?.identity.company || "Beboerportal"}</strong>
          <small>Din beboerportal · Expo ProffDok</small>
        </div>
      </header>
      {error && (
        <p role="alert" className="bolig-resident-error">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="bolig-resident-receipt">
          {notice}
        </p>
      )}
      {pending && !busy && (
        <section className="bolig-resident-card">
          <h2>Sendingen er ikke bekreftet</h2>
          <p>Prøv samme sending igjen. Den registreres bare én gang.</p>
          <button disabled={busy} onClick={() => run(null, null, true)}>
            Prøv samme sending igjen
          </button>
        </section>
      )}
      {busy && <p role="status">Registrerer svaret …</p>}
      {refreshing && !loading && <p role="status">Oppdaterer portalstatus …</p>}
      {loading && <p role="status">Henter beboerportalen …</p>}
      {!data && !loading && (
        <section className="bolig-resident-card">
          <h1>Portalen kan ikke åpnes</h1>
          <p>Kontakt prosjektleder hvis lenken er utløpt eller tilbakekalt.</p>
        </section>
      )}
      {!busy && (
        <button
          className="bolig-portal-refresh"
          aria-label="Hent siste status"
          onClick={load}
          disabled={loading || refreshing}
        >
          <RefreshCw size={16} aria-hidden="true"/><span>Hent siste status</span>
        </button>
      )}
      {data && (
        <>
          <section className="bolig-resident-intro bolig-portal-welcome">
            <div className="bolig-portal-welcome-copy">
              <small>{data.identity.project}</small>
              <h1>Din bolig.<br/><span>Din oversikt.</span></h1>
              <p>Valgene, avtalene og dialogen om boligen din – samlet her.</p>
            </div>
            <div className="bolig-portal-home-card">
              <Home size={27} aria-hidden="true"/>
              <small>DIN BOLIG</small>
              <strong>{data.identity.unit}</strong>
              <span>{data.identity.block}</span>
              {data.identity.address && <span>{data.identity.address}</span>}
            </div>
          </section>
          <div className="bolig-portal-access"><ShieldCheck size={15} aria-hidden="true"/><span>Personlig tilgang · til {new Date(data.expires_at).toLocaleDateString("nb-NO", {timeZone:"Europe/Oslo"})}</span></div>
          <aside className="bolig-portal-next" aria-label="Neste steg">
            <span className="bolig-portal-next-icon" aria-hidden="true"><ClipboardCheck size={24}/></span>
            <div><small>NESTE STEG</small><h2>{nextStep.title}</h2><p>{nextStep.text}</p></div>
            <button type="button" onClick={() => {setTab(nextStep.tab); requestAnimationFrame(()=>{const target=waiting?requestsHeading.current:choicesHeading.current; if(nextStep.tab==="choices"){target?.focus({preventScroll:true});target?.scrollIntoView({block:"start"});}});}}>{nextStep.button}<ArrowRight size={18} aria-hidden="true"/></button>
          </aside>
          <nav className="bolig-portal-tabs" aria-label="Beboerportal">
            {sections.map(([id, label]) => {
              const Icon = sectionIcons[id];
              return (
              <button
                key={id}
                type="button"
                aria-current={tab === id ? "page" : undefined}
                onClick={() => setTab(id)}
              >
                <Icon size={18} aria-hidden="true"/>
                {label}
                {id === "agreements" &&
                  data.agreements.filter((d) => d.status === "published")
                    .length > 0 && (
                    <span>
                      {
                        data.agreements.filter((d) => d.status === "published")
                          .length
                      }
                    </span>
                  )}
              </button>
              );
            })}
          </nav>
          {tab === "choices" && (
            <>
              <section className="bolig-resident-card">
                <h2 tabIndex={-1} ref={choicesHeading} style={{scrollMarginTop:90}}>Velg det som passer deg</h2>
                {data.choice_deadline && <p role="status"><strong>Bestillingsfrist: {data.choice_deadline} (til slutten av dagen, norsk tid).</strong> {choicesClosed ? "Fristen er utløpt. Kontakt prosjektleder for ny frist. Avtaler og dokumenter er fortsatt tilgjengelige." : "Send nye tilvalg før fristen."}</p>}
                <p>
                  Prosjektleder har klargjort disse valgmulighetene for boligen
                  din. Send ønsket til gjennomgang. Du får en egen avtale å
                  svare på.
                </p>
                {!data.offers.length && (
                  <p>
                    Prosjektleder har ikke delt valgmuligheter ennå. Du kan
                    fortsatt se avtaler og sende meldinger.
                  </p>
                )}
                {waiting && (
                  <p className="bolig-portal-info">
                    Et valg venter på gjennomgang. {data.messaging_enabled === false ? "Kontakt prosjektleder hvis du ønsker å endre det. Kontaktinformasjon finner du under Meldinger." : "Send en melding hvis du ønsker å endre det."}
                  </p>
                )}
                <ChoiceCards data={data} draft={draft} disabled={disabled || waiting || choicesClosed} onChange={update}/>
                {data.combine_base_id && !selected && <p role="alert">Et tidligere valgt tilvalg er ikke lenger tilgjengelig. <button disabled={disabled || waiting || choicesClosed} onClick={()=>update({offer_ids:[],menu_version:data.menu_version})}>Velg tilvalg på nytt</button></p>}
                {selected?.conflict && <p role="alert">{selected.conflict}</p>}
                {data.combine_base_id && !waiting && selected && !selected.conflict && <div className="bolig-choice-total">Samlet pristillegg inkl. mva.: {money(selected.total_cents)}</div>}
                {selected && !selected.conflict && !waiting && !choicesClosed && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      update({menu_version:data.menu_version});
                      setReview("request");
                    }}
                  >
                    <label>
                      Merknad til valget (valgfritt)
                      <textarea
                        maxLength={2000}
                        value={draft.body}
                        disabled={disabled}
                        onChange={(e) => update({ body: e.target.value })}
                      />
                    </label>
                    <button type="submit" disabled={disabled}>
                      Se over valget
                    </button>
                  </form>
                )}
                {review === "request" && selected && !selected.conflict && !choicesClosed && (
                  <section className="bolig-portal-info">
                    <h3>Kontroller før du sender</h3>
                    <PortalGoods goods={selected.goods}/>
                    <PortalPrices items={selected.price_details}/>
                    <p>
                      {selected.title} · {money(selected.total_cents)} inkl.
                      mva. {draft.body}
                    </p>
                    <p>
                      Dette er et ønske til gjennomgang. Avtalen aksepteres
                      separat.
                    </p>
                    <button
                      disabled={disabled}
                      onClick={() =>
                        run("request", {
                          ...(data.combine_base_id ? {offer_ids:draft.offer_ids || []} : {offer_id: selected.id}),
                          menu_version: draft.menu_version ?? data.menu_version,
                          body: draft.body,
                        })
                      }
                    >
                      Send valg til gjennomgang
                    </button>
                  </section>
                )}
              </section>
              <section className="bolig-resident-card">
                <h2 tabIndex={-1} ref={requestsHeading} style={{scrollMarginTop:90}}>Dine innsendte valg</h2>
                {data.events.filter((e) => e.kind === "request").length ===
                0 ? (
                  <p>Du har ikke sendt inn valg ennå.</p>
                ) : (
                  data.events
                    .filter((e) => e.kind === "request")
                    .map((e) => (
                      <article className="bolig-portal-event" key={e.id}>
                        <strong>{e.offer.title}</strong>
                        <small>
                          {portalStamp(e.created_at)} · {portalStatus[e.status]}
                        </small>
                        <p>
                          {money(e.offer.total_cents)} inkl. mva. · {e.body}
                        </p>
                        {e.review_note && <p>Prosjektleder: {e.review_note}</p>}
                      </article>
                    ))
                )}
              </section>
            </>
          )}
          {tab === "agreements" && (
            <section className="bolig-resident-card">
              <h2>Dine avtaler og kvitteringer</h2>
              <p>
                Se gjennom den aktuelle utgaven før du svarer. En akseptert
                avtale er allerede bekreftet.
              </p>
              {!data.agreements.length && <p>Ingen avtaler er delt ennå.</p>}
              {[overview.choice, ...overview.changes]
                .filter(Boolean)
                .map(agreementRow)}
              {overview.history.length > 0 && (
                <details>
                  <summary>Avtalehistorikk · {overview.history.length}</summary>
                  {overview.history.map(agreementRow)}
                </details>
              )}
            </section>
          )}
          {tab === "agreements" && doc && (
            <section className="bolig-resident-card">
              <h2 ref={agreementHeading} tabIndex={-1} className="bolig-agreement-heading">
                {doc.snapshot?.source === "shop" ? "Butikktillegg" : doc.kind === "choice" ? "Boligavtale" : "Endringsavtale"} ·
                utgave {doc.version}
              </h2>
              <Summary document={doc} />
              {doc.status === "published" && <p>Svarfrist: {acceptanceDeadline(doc.expires_at)} (norsk tid). Etter fristen kan du ikke akseptere her. Kontakt prosjektleder.</p>}
              {doc.status !== "published" ? (
                <section className="bolig-resident-receipt">
                  <h3>
                    {doc.status === "declined" ? "Avslaget" : "Aksepten"} er
                    registrert
                  </h3>
                  <p>
                    {doc.accepted_name} · {portalStamp(doc.accepted_at)}
                  </p>
                  <button onClick={() => window.print()}>
                    Skriv ut kvittering
                  </button>
                </section>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setReview("accept");
                  }}
                >
                  <fieldset disabled={disabled}>
                    <label>
                      Fullt navn
                      <input
                        required
                        minLength={2}
                        maxLength={120}
                        autoComplete="name"
                        value={draft.name}
                        onChange={(e) => update({ name: e.target.value })}
                      />
                    </label>
                    <label className="bolig-resident-confirm">
                      <input
                        type="checkbox"
                        required
                        checked={draft.confirmed}
                        onChange={(e) =>
                          update({ confirmed: e.target.checked })
                        }
                      />
                      <span>
                        Jeg har gjennomgått varene og prisen for utgave{" "}
                        {doc.version}.
                      </span>
                    </label>
                    <div className="bolig-resident-actions">
                      <button type="submit">Kontroller aksept</button>
                      <button
                        type="button"
                        disabled={
                          !draft.confirmed || draft.name.trim().length < 2
                        }
                        onClick={() => setReview("decline")}
                      >
                        Kontroller avslag
                      </button>
                    </div>
                  </fieldset>
                  {["accept", "decline"].includes(review) && (
                    <section className="bolig-portal-info">
                      <h3>
                        {review === "accept"
                          ? "Bekreft aksept"
                          : "Bekreft avslag"}
                      </h3>
                      <p>
                        {draft.name} · utgave {doc.version} ·{" "}
                        {money(
                          doc.kind === "change"
                            ? doc.snapshot.delta_cents
                            : doc.snapshot.total_cents,
                        )}{" "}
                        inkl. mva.
                      </p>
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() =>
                          run(review, {
                            document_id: doc.id,
                            name: draft.name,
                            confirmed: draft.confirmed,
                          })
                        }
                      >
                        {review === "accept"
                          ? "Registrer aksept"
                          : "Registrer avslag"}
                      </button>
                    </section>
                  )}
                </form>
              )}
            </section>
          )}
          {tab === "documents" && (
            <section className="bolig-resident-card">
              <h2>Dokumenter til boligen</h2>
              <p>
                Her finner du dokumentlenkene prosjektleder har delt med deg.
              </p>
              {!data.documents.length ? (
                <p>Ingen dokumentlenker er delt ennå.</p>
              ) : (
                data.documents.map((d) => (
                  <a
                    className="bolig-portal-document"
                    key={d.id}
                    href={d.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {d.title}
                    <span>Åpne dokument ↗</span>
                  </a>
                ))
              )}
            </section>
          )}
          {tab === "messages" && (
            <section className="bolig-resident-card">
              <h2>Meldinger med prosjektleder</h2>
              <p>
                Skriv spørsmål om boligen din. Svar blir synlige her når
                prosjektleder har svart.
              </p>
              {(data.progress_notices || []).map((n) => (
                <article key={n.id} className="bolig-portal-message manager">
                  <strong>Planlagt arbeid · {n.title}</strong>
                  <p>{n.body}</p>
                  <small>
                    {n.start.split("-").reverse().join(".")} –{" "}
                    {n.end.split("-").reverse().join(".")}
                  </small>
                </article>
              ))}
              <div className="bolig-portal-messages">
                {data.events
                  .filter((e) => ["message", "reply"].includes(e.kind))
                  .map((e) => (
                    <article
                      key={e.id}
                      className={`bolig-portal-message ${e.sender}`}
                    >
                      <strong>
                        {e.sender === "manager" ? "Prosjektleder" : "Deg"}
                      </strong>
                      <p>{e.body}</p>
                      <small>{portalStamp(e.created_at)}</small>
                    </article>
                  ))}
              </div>
              {data.messaging_enabled === false ? (
                <p className="bolig-portal-message">
                  Meldinger er slått av for din bolig. Kontakt prosjektleder
                  {data.manager_contact ? (
                    <>
                      {" "}
                      på{" "}
                      <a href={`mailto:${data.manager_contact}`}>
                        {data.manager_contact}
                      </a>
                    </>
                  ) : (
                    " via kontaktinformasjonen du har fått"
                  )}
                  . Tidligere meldinger og informasjon om planlagt arbeid ligger
                  fortsatt her.
                </p>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    run("message", { body: draft.message });
                  }}
                >
                  <label>
                    Din melding
                    <textarea
                      required
                      minLength={2}
                      maxLength={2000}
                      disabled={disabled}
                      value={draft.message}
                      onChange={(e) => update({ message: e.target.value })}
                    />
                  </label>
                  <button type="submit" disabled={disabled}>
                    Send melding
                  </button>
                </form>
              )}
            </section>
          )}
          <footer>
            {data.shared_household ? "De registrerte eierne deler denne boligportalen. Ikke del lenken med andre." : "Lenken er personlig og gjelder bare denne boligen. Ikke videresend den."}
          </footer>
        </>
      )}
    </main>
  );
}
