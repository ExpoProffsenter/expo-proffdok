import React, { useState } from "react";
import { partnerDate, partnerLabels } from "./boligPartnerClient.js";
const statusNames = { ordered: "Bestilt", partial: "Delvis mottatt", delivered: "Mottatt", planned: "Planlagt", working: "Pågår", blocked: "Stanset", done: "Utført" };
const searchText = value => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("nb").trim();
export function PartnerEvent({ event }) {
  return (
    <div
      className={`bolig-partner-response ${event.status === "issue" ? "has-issue" : ""}`}
    >
      <strong>
        {partnerLabels[event.status]}
        {event.current ? "" : " · eldre grunnlag"}
      </strong>
      <span>
        {event.promised_date ? `Dato: ${partnerDate(event.promised_date)}` : ""}
        {event.reference
          ? ` · Leverandørens ordrenummer: ${event.reference}`
          : ""}
      </span>
      {event.body && <p>{event.body}</p>}
      <small>{partnerDate(event.created_at)}</small>
    </div>
  );
}
export default function PartnerItems({ items, events = [], onRespond, browse = false }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [limit, setLimit] = useState(20);
  const matching = browse ? items.filter(item => (!status || item.status === status) && searchText([item.title, item.number, item.address, item.reference, item.room_name, statusNames[item.status]].join(" ")).includes(searchText(query))) : items;
  const visible = browse ? matching.slice(0, limit) : matching;
  const statuses = [...new Set([...items.map(item => item.status), ...(status ? [status] : [])])].filter(value => statusNames[value]);
  return (
    <div className="bolig-partner-items">
      {browse && (items.length > 12 || query || status) && <div className="bolig-partner-item-browser">
        <label>Søk i oppgaver<input type="search" value={query} placeholder="Bolig, adresse, arbeid eller ordrenummer" onChange={e => { setQuery(e.target.value); setLimit(20); }}/></label>
        <label>Status for oppgaver<select value={status} onChange={e => { setStatus(e.target.value); setLimit(20); }}><option value="">Alle statuser</option>{statuses.map(value => <option key={value} value={value}>{statusNames[value]}</option>)}</select></label>
        <p role="status">Viser {visible.length} av {matching.length} oppgaver{matching.length !== items.length ? ` · ${items.length} totalt` : ""}.</p>
      </div>}
      {browse && !matching.length && <p>Ingen oppgaver passer søket og statusen. Endre søket eller velg Alle statuser.</p>}
      {visible.map((item) => {
        const history = events.filter(
          (e) => e.target_id === item.id && e.kind === item.kind,
        );
        return (
          <article className="bolig-partner-item" key={item.id}>
            <div className="bolig-partner-item-head">
              <div>
                <small>
                  {item.kind === "order" ? "LEVERANSE" : "AKTIVITET"} ·{" "}
                  {item.number} · {item.address}
                </small>
                <h3>{item.title}</h3>
              </div>
              <span className="bolig-partner-tag">
                {statusNames[item.status]}
              </span>
            </div>
            {item.kind === "order" ? (
              <>
                <p>
                  <b>Leveringsadresse:</b> {item.delivery_address}
                </p>
                <p>
                  Vårt ordrenummer: <b>{item.reference || "Ikke angitt"}</b> ·
                  Ønsket levering: {partnerDate(item.requested_date)}
                </p>
                <details>
                  <summary>
                    Varer og registrert mottak ({item.goods.length})
                  </summary>
                  <ul>
                    {item.goods.map((g, i) => (
                      <li key={i}>
                        <b>{g.name}</b> · {g.quantity} {g.unit}
                        {g.sku ? ` · Varenr. ${g.sku}` : ""}
                        {g.room_name ? ` · ${g.room_name}` : ""}
                        <small>
                          Registrert mottatt: {g.received} {g.unit}
                        </small>
                      </li>
                    ))}
                  </ul>
                </details>
              </>
            ) : (
              <p>
                {item.room_name && `${item.room_name} · `}
                {partnerDate(item.planned_start)} –{" "}
                {partnerDate(item.planned_end)}
              </p>
            )}
            {history[0] && <PartnerEvent event={history[0]} />}
            {history.length > 1 && (
              <details>
                <summary>Tidligere svar ({history.length - 1})</summary>
                {history.slice(1).map((e) => (
                  <PartnerEvent key={e.id} event={e} />
                ))}
              </details>
            )}
            {onRespond && (
              <button
                type="button"
                className="bolig-primary"
                onClick={() => onRespond(item)}
              >
                Bekreft dato / meld avvik
              </button>
            )}
          </article>
        );
      })}
      {browse && matching.length > limit && <button type="button" onClick={() => setLimit(value => value + 20)}>Vis flere oppgaver ({matching.length - visible.length} gjenstår)</button>}
    </div>
  );
}
