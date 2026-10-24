import React from "react";
import { partnerDate, partnerLabels } from "./boligPartnerClient.js";
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
export default function PartnerItems({ items, events = [], onRespond }) {
  return (
    <div className="bolig-partner-items">
      {items.map((item) => {
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
                {item.kind === "order"
                  ? {
                      ordered: "Bestilt",
                      partial: "Delvis mottatt",
                      delivered: "Mottatt",
                    }[item.status]
                  : {
                      planned: "Planlagt",
                      working: "Pågår",
                      blocked: "Stanset",
                      done: "Utført",
                    }[item.status]}
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
    </div>
  );
}
