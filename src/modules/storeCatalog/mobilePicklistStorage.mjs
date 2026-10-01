// Referanser uten prisfelt. Gammel mobil lokalStorage leses kun for kontrollert overgang.
export const MAX_PICKLIST_ITEMS = 30;
export const MAX_SAVED_PICKLISTS = 3;
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

export function legacyPicklistStorageKey({ userId = "", companyId = "" } = {}) {
  if (!/^[a-f\d-]{36}$/i.test(userId) || !/^[a-f\d-]{36}$/i.test(companyId)) return "";
  return `${STORAGE_PREFIX}${userId}:${companyId}`;
}

export function picklistReferences(items) {
  return (Array.isArray(items) ? items : []).slice(0, MAX_PICKLIST_ITEMS)
    .map(toPicklistReference)
    .filter((item) => item.id && (item.supplier_product_number || item.gtin));
}

export function samePicklistContents(itemsA, orderA, itemsB, orderB) {
  return String(orderA || "").trim() === String(orderB || "").trim()
    && JSON.stringify(picklistReferences(itemsA)) === JSON.stringify(picklistReferences(itemsB));
}

export function readLegacyPicklist(identity, storage = globalThis.localStorage) {
  const key = legacyPicklistStorageKey(identity);
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

export function deleteLegacyPicklist(identity, storage = globalThis.localStorage) {
  const key = legacyPicklistStorageKey(identity);
  if (key && storage) storage.removeItem(key);
}
