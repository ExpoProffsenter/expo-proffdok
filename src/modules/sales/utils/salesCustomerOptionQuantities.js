import { getOfferQuantity, getOfferUnitPrice } from "./salesUtils.js";

export const CUSTOMER_OPTION_QUANTITY_MAX = 100000;

export function canChooseOptionQuantity(option = {}) {
  return option.customerCanChooseQuantity === true &&
    option.optionType !== "alternative" && getOfferUnitPrice(option) >= 0;
}

export function parseCustomerOptionQuantity(value) {
  const text = String(value ?? "").trim().replace(",", ".");
  if (!/^\d+(?:\.\d{1,3})?$/.test(text)) return null;
  const quantity = Number(text);
  return quantity > 0 && quantity <= CUSTOMER_OPTION_QUANTITY_MAX ? quantity : null;
}

export function customerOptionQuantityValue(option, quantities = {}) {
  return quantities[option.id] ?? (String(option.quantity ?? "").trim() || "1");
}

export function applyCustomerOptionQuantities(options = [], quantities = {}) {
  return options.map((option) => canChooseOptionQuantity(option)
    ? { ...option, quantity: parseCustomerOptionQuantity(customerOptionQuantityValue(option, quantities)) ?? getOfferQuantity(option) }
    : option);
}

export function hasInvalidCustomerOptionQuantity(options = [], selectedIds = [], quantities = {}) {
  return options.some((option) => canChooseOptionQuantity(option) && selectedIds.includes(option.id) &&
    parseCustomerOptionQuantity(customerOptionQuantityValue(option, quantities)) === null);
}

// Copies only: published versions and accepted snapshots are never edited.
export function requestWithCustomerOptionQuantities(request, quantities = {}) {
  if (!request || request.acceptedAt || request.acceptedPayload?.version_snapshot || request.status === "Avvist") return request;
  return {
    ...request,
    offerOptions: applyCustomerOptionQuantities(request.offerOptions, quantities),
    offerVersions: request.offerVersions?.map((version) => ({
      ...version, options: applyCustomerOptionQuantities(version.options, quantities),
    })),
  };
}
