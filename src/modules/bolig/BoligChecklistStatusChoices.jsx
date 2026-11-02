import React from "react";
import "./boligChecklistStatusChoices.css";

// Presentation only: the native editor owns draft, permission and save rules.
export default function BoligChecklistStatusChoices({ value, allowNa = true, allowClosed = false, onChange, label }) {
  const statuses = ["OK", ...(allowNa ? ["Ikke aktuelt"] : []), "Avvik", ...(allowClosed ? ["Lukket avvik"] : [])];
  return <div className="bolig-checklist-status" role="group" aria-label={label}>
    {statuses.map(status => <button key={status} type="button"
      className="bolig-checklist-status-choice" data-tone={status === "Avvik" ? "deviation" : "ok"}
      aria-pressed={value === status}
      onClick={() => onChange(value === status ? "" : status)}>
      <span className="bolig-checklist-status-box" aria-hidden="true"><svg viewBox="0 0 20 20" focusable="false"><path d="m4 10 4 4 8-9" /></svg></span>
      <span>{status}</span>
    </button>)}
  </div>;
}
