import { canChooseOptionQuantity, customerOptionQuantityValue, parseCustomerOptionQuantity, CUSTOMER_OPTION_QUANTITY_MAX } from "../utils/salesCustomerOptionQuantities.js";
import { formatNok, formatOfferQuantity, getOfferQuantity, getOfferTotal, getOfferUnitPrice } from "../utils/salesUtils.js";
import "./SalesOfferQuantity.css";

export default function SalesCustomerOptionQuantity({ option, acceptanceForm, setAcceptanceForm, selected, disabled = false, vat }) {
  if (!canChooseOptionQuantity(option) || disabled) return null;
  const raw = customerOptionQuantityValue(option, acceptanceForm.selectedOptionQuantities);
  const quantity = parseCustomerOptionQuantity(raw);
  const update = (value) => setAcceptanceForm((current) => ({
    ...current,
    selectedOptionQuantities: { ...current.selectedOptionQuantities, [option.id]: value },
  }));
  return (
    <div className="sales-customer-option-quantity" onClick={(event) => event.stopPropagation()}>
      <label htmlFor={`customer-option-quantity-${option.id}`}>Antall{option.unit ? ` (${option.unit})` : ""}</label>
      <div className="sales-quantity-stepper">
        <button type="button" aria-label={`Reduser antall for ${option.title || "opsjon"}`} disabled={!selected || quantity === null || quantity <= 1} onClick={() => update(String(Math.round((quantity - 1) * 1000) / 1000))}>−</button>
        <input id={`customer-option-quantity-${option.id}`} aria-label={`Antall for ${option.title || "opsjon"}`} inputMode="decimal" autoComplete="off" disabled={!selected} value={raw} aria-invalid={selected && quantity === null} onChange={(event) => update(event.target.value)} onFocus={(event) => event.currentTarget.select()} />
        <button type="button" aria-label={`Øk antall for ${option.title || "opsjon"}`} disabled={!selected || quantity === null || quantity + 1 > CUSTOMER_OPTION_QUANTITY_MAX} onClick={() => update(String(Math.round((quantity + 1) * 1000) / 1000))}>+</button>
      </div>
      <small>{selected ? "Velg antall før du aksepterer." : "Velg opsjonen for å endre antall."}</small>
      {selected && quantity === null ? <small role="alert">Skriv et antall over 0 og opptil 100 000, med høyst tre desimaler.</small> : (
        <span aria-live="polite">{formatOfferQuantity({ ...option, quantity: quantity ?? getOfferQuantity(option) })} × {formatNok(getOfferUnitPrice(option) * vat.multiplier)} = <strong>{formatNok(getOfferTotal([{ ...option, quantity: quantity ?? getOfferQuantity(option) }]) * vat.multiplier)} {vat.label}</strong></span>
      )}
    </div>
  );
}
