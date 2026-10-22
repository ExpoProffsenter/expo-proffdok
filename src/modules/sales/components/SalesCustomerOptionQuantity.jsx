import { canChooseOptionQuantity, customerOptionQuantityValue, parseCustomerOptionQuantity, CUSTOMER_OPTION_QUANTITY_MAX } from "../utils/salesCustomerOptionQuantities.js";
import { formatNok, formatOfferQuantity, getOfferQuantity, getOfferTotal, getOfferUnitPrice } from "../utils/salesUtils.js";
import "./SalesOfferQuantity.css";

export default function SalesCustomerOptionQuantity({ option, acceptanceForm, setAcceptanceForm, selected, disabled = false, vat }) {
  if (!canChooseOptionQuantity(option) || disabled) return null;
  const raw = customerOptionQuantityValue(option, acceptanceForm.selectedOptionQuantities);
  const quantity = parseCustomerOptionQuantity(raw);
  const update = (value) => setAcceptanceForm((current) => ({
    ...current,
    selectedOptionIds: current.selectedOptionIds?.includes(option.id)
      ? current.selectedOptionIds
      : [...(current.selectedOptionIds || []), option.id],
    selectedOptionQuantities: { ...current.selectedOptionQuantities, [option.id]: value },
  }));
  return (
    <div className="sales-customer-option-quantity" onClick={(event) => event.stopPropagation()}>
      <label htmlFor={`customer-option-quantity-${option.id}`}>Antall{option.unit ? ` (${option.unit})` : ""}</label>
      <div className="sales-quantity-stepper">
        <button type="button" aria-label={`Reduser antall for ${option.title || "opsjon"}`} disabled={quantity === null || quantity <= 1} onClick={() => update(String(Math.round((quantity - 1) * 1000) / 1000))}>−</button>
        <input id={`customer-option-quantity-${option.id}`} aria-label={`Antall for ${option.title || "opsjon"}`} inputMode="decimal" autoComplete="off" value={raw} aria-invalid={selected && quantity === null} onChange={(event) => update(event.target.value)} onFocus={(event) => event.currentTarget.select()} />
        <button type="button" aria-label={`Øk antall for ${option.title || "opsjon"}`} disabled={quantity === null || quantity + 1 > CUSTOMER_OPTION_QUANTITY_MAX} onClick={() => update(String(Math.round((quantity + 1) * 1000) / 1000))}>+</button>
      </div>
      <small>{selected ? "Valgt i tilbudet. Du kan endre antallet eller fjerne valget over." : "Endre antall for å velge opsjonen, eller kryss av «Velg opsjon»."}</small>
      {selected && quantity === null ? <small role="alert">Skriv et antall over 0 og opptil 100 000, med høyst tre desimaler.</small> : (
        <span aria-live="polite">{formatOfferQuantity({ ...option, quantity: quantity ?? getOfferQuantity(option) })} × {formatNok(getOfferUnitPrice(option) * vat.multiplier)} = <strong>{formatNok(getOfferTotal([{ ...option, quantity: quantity ?? getOfferQuantity(option) }]) * vat.multiplier)} {vat.label}</strong></span>
      )}
    </div>
  );
}
