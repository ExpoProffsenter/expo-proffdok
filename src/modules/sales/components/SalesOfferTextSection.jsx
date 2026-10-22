import { useId } from "react";
import { ChevronDown } from "lucide-react";

// Presentation only: keep the controlled textarea mounted when collapsed.
// Offer saving, hydration and draft recovery remain owned by the existing form.
export default function SalesOfferTextSection({ title, value, onChange, placeholder }) {
  const id = useId();
  const preview = String(value || "").trim().replace(/\s+/g, " ");
  return (
    <details className="sales-note-field sales-offer-text-section sales-field-full">
      <summary>
        <span className="sales-offer-text-heading">
          <strong>{title}</strong>
          <span>{preview ? `${preview.slice(0, 150)}${preview.length > 150 ? "…" : ""}` : "Ingen tekst lagt inn"}</span>
        </span>
        <span className="sales-offer-text-action" aria-hidden="true">
          <span className="sales-offer-text-open-label">Vis og rediger</span>
          <span className="sales-offer-text-close-label">Skjul tekst</span>
          <ChevronDown size={20} />
        </span>
      </summary>
      <label className="sales-field sales-offer-text-body" htmlFor={id}>
        <span className="sales-offer-text-label">{title}</span>
        <textarea id={id} aria-label={title} value={value || ""} onChange={onChange} placeholder={placeholder} rows={12} />
      </label>
    </details>
  );
}
