import { rpcWithStoredSession } from "../access/moduleAccessClient.js";
import { MAX_PICKLIST_ITEMS, picklistReferences } from "./mobilePicklistStorage.mjs";

export async function listMobilePicklists() {
  const rows = await rpcWithStoredSession("list_mobile_store_picklists");
  return Array.isArray(rows) ? rows : [];
}

export async function saveMobilePicklist({ id = null, revision = null, items, orderNumber = "" }) {
  if (!Array.isArray(items) || !items.length || items.length > MAX_PICKLIST_ITEMS) {
    throw new Error(`Plukklisten må ha mellom 1 og ${MAX_PICKLIST_ITEMS} varer.`);
  }
  return rpcWithStoredSession("save_mobile_store_picklist", {
    p_id: id,
    p_expected_revision: revision,
    p_items: picklistReferences(items),
    p_order_number: String(orderNumber).trim().slice(0, 64),
  });
}

export async function deleteMobilePicklist(id) {
  return rpcWithStoredSession("delete_mobile_store_picklist", { p_id: id });
}
