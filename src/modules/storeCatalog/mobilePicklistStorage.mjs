// En bevisst lagret mobilplukkliste er adskilt fra Prissøks fanespesifikke arbeidsliste.
// Bare vareoppslagsnøkler, antall og manuelt ordrenummer lagres på denne enheten.
export const MAX_PICKLIST_ITEMS = 30;
const STORAGE_PREFIX = "expo-proffdok:mobile-picklist:v1:";

export function normalizePickQuantity(value) {
  const parsed = Number(String(value ?? "").trim().replace(",", "."));
  if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 99999) return "1";
  return String(Math.round(parsed * 1000) / 1000);
}

export function toPicklistReference(item = {}) {
  return {
    id: String(item.id || ""),
    supplier_product_number: String(item.supplier_product_number || ""),
    gtin: String(item.gtin || ""),
    quantity: normalizePickQuantity(item.pickQuantity ?? item.quantity ?? 1),
  };
}

export function picklistStorageKey({ userId = "", companyId = "" } = {}) {
  // Både bruker og aktivt firma må være bekreftet før en lagret liste åpnes.
  if (!/^[a-f\d-]{36}$/i.test(userId) || !/^[a-f\d-]{36}$/i.test(companyId)) return "";
  return `${STORAGE_PREFIX}${userId}:${companyId}`;
}

export function readSavedPicklist(identity, storage = globalThis.localStorage) {
  const key = picklistStorageKey(identity);
  if (!key || !storage) return null;
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.version !== 1 || !Array.isArray(parsed.items)) return null;
    const seen = new Set();
    const items = parsed.items.slice(0, MAX_PICKLIST_ITEMS)
      .map(toPicklistReference)
      .filter((item) => {
        if (!item.id || (!item.supplier_product_number && !item.gtin) || seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      });
    return {
      items,
      orderNumber: String(parsed.orderNumber || "").slice(0, 64),
    };
  } catch {
    return null;
  }
}

export function savePicklist(identity, items, orderNumber, storage = globalThis.localStorage) {
  const key = picklistStorageKey(identity);
  if (!key || !storage) throw new Error("Velg firma og logg inn før plukklisten lagres.");
  if (Array.isArray(items) && items.length > MAX_PICKLIST_ITEMS) {
    throw new Error(`Plukklisten kan inneholde opptil ${MAX_PICKLIST_ITEMS} varer.`);
  }
  const references = (Array.isArray(items) ? items : [])
    .map(toPicklistReference)
    .filter((item) => item.id && (item.supplier_product_number || item.gtin));
  if (!references.length) throw new Error("Legg til minst én vare før plukklisten lagres.");
  const snapshot = {
    version: 1,
    orderNumber: String(orderNumber || "").trim().slice(0, 64),
    items: references,
  };
  storage.setItem(key, JSON.stringify(snapshot));
  return snapshot;
}

export function deleteSavedPicklist(identity, storage = globalThis.localStorage) {
  const key = picklistStorageKey(identity);
  if (key && storage) storage.removeItem(key);
}
