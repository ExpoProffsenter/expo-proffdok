// FASE 45B – brukerrettighet for «Din nto pris» administrert fra samme Systemadmin-brukerkort.
import { rpcWithStoredSession } from "./moduleAccessClient.js";

export async function setManagedProCatalogNetPriceAccess(userId, canView) {
  if (!userId) throw new Error("Bruker mangler.");
  return rpcWithStoredSession("set_managed_pro_catalog_net_price_access", {
    target_user_id: userId,
    p_can_view: canView === true,
  });
}
