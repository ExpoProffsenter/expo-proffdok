import React, { useState } from "react";
import { CheckCircle2, ChevronDown, ChevronRight } from "lucide-react";
import { partnerDate } from "./boligPartnerClient.js";

// Work only with the current server projection. Creation timestamps and the
// generic draft status are not evidence that any control has been filled in.
const hasValue = (value) => {
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.some(hasValue);
  if (value && typeof value === "object") return Object.values(value).some(hasValue);
  return false;
};
export function partnerChecklistStatus(item) {
  const record = item.record || item;
  if (record.status === "completed") return "completed";
  const started = item.record
    ? record.definition.points.some((point) => {
        const answer = record.answers?.[point.id];
        return answer && (hasValue(answer.status) || hasValue(answer.comment) ||
          hasValue(answer.values) || hasValue(answer.documents));
      })
    : (record.points || []).some((point) => hasValue(point.status));
  return started ? "ongoing" : "next";
}
export const partnerChecklistKey = (item) => `${item.scope_id}:${(item.record || item).id}`;
export function prioritizePartnerChecklists(items) {
  const groups = { ongoing: [], next: [], completed: [] };
  // Preserve the server's existing order within each group; never mutate it.
  items.forEach((item) => groups[partnerChecklistStatus(item)].push(item));
  return groups;
}
const initialUi = { completed: false, ongoingLimit: 12, nextLimit: 12, completedLimit: 12 };
export default function PartnerChecklistGroups({ items, title, renderItem, ui, onUiChange, listRef }) {
  const [localUi, setLocalUi] = useState(initialUi);
  const state = ui || localUi;
  const update = (patch) => (onUiChange || setLocalUi)({ ...state, ...patch });
  const groups = prioritizePartnerChecklists(items);
  return (
    <section className="bolig-partner-checklists" aria-label={title} ref={listRef}>
      <p className="bolig-partner-checklist-guide">
        Fortsett øverst. Fullførte sjekklister samles nederst.
      </p>
      <div className="bolig-partner-checklist-list">
        {Object.entries(groups).flatMap(([group, rows]) => {
          const completed = group === "completed";
          const label = completed ? "Fullførte" : group === "ongoing" ? "Pågående" : "Neste sjekklister";
          const limit = state[`${group}Limit`] || 12;
          const heading = `${label} (${rows.length})`;
          return [
            completed ? (
              <button type="button" key={`heading:${group}`} className="bolig-partner-checklist-heading completed"
                aria-expanded={state.completed}
                onClick={() => update({ completed: !state.completed })}>
                <CheckCircle2 size={20} /> {heading}
                {state.completed ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
              </button>
            ) : (
              <h3 key={`heading:${group}`} className="bolig-partner-checklist-heading">{heading}</h3>
            ),
            ...rows.slice(0, limit).map((item, index) => {
              const record = item.record || item;
              const date = record.completed_at;
              return (
                <article key={partnerChecklistKey(item)} data-check-key={partnerChecklistKey(item)}
                  data-check-status={group} hidden={completed && !state.completed}
                  className={`bolig-partner-item bolig-partner-checklist-card ${group}`}>
                  <span className={`bolig-partner-checklist-status ${group}`}>
                    {completed ? <CheckCircle2 size={16} /> : null}
                    {completed ? "Fullført" : group === "ongoing" ? "Pågående" : index === 0 ? "Neste" : "Ikke startet"}
                    {completed && date && Number.isFinite(Date.parse(date)) ? ` · ${partnerDate(date)}` : ""}
                  </span>
                  {renderItem(item)}
                </article>
              );
            }),
            rows.length > limit ? (
              <button key={`more:${group}`} type="button" hidden={completed && !state.completed}
                onClick={() => update({ [`${group}Limit`]: limit + 12 })}>
                Vis flere {completed ? "fullførte" : group === "ongoing" ? "pågående" : "neste sjekklister"} ({rows.length - limit})
              </button>
            ) : null,
          ];
        })}
      </div>
      {!items.length && <p>Ingen sjekklister å vise.</p>}
    </section>
  );
}
